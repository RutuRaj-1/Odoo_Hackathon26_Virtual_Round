import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { MaintenanceRecord, Asset } from '@/types'

export const maintenanceService = {
  subscribeToMaintenanceRecords(callback: (records: MaintenanceRecord[]) => void): () => void {
    const colRef = collection(db, 'maintenanceRequests')
    return onSnapshot(colRef, (snapshot) => {
      const records = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as MaintenanceRecord[]
      callback(records)
    }, (error) => {
      console.error('Error subscribing to maintenance records:', error)
    })
  },

  // Get all maintenance requests with in-memory pagination
  async getAll(params?: { page?: number; pageSize?: number }): Promise<{ data: MaintenanceRecord[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const colRef = collection(db, 'maintenanceRequests')
    const snapshot = await getDocs(colRef)
    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as MaintenanceRecord[]

    const total = data.length
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 10
    const totalPages = Math.ceil(total / pageSize)
    const paginatedData = data.slice((page - 1) * pageSize, page * pageSize)

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages
    }
  },

  async raiseRequest(data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber' | 'status' | 'requestedBy'>, userId: string): Promise<string> {
    const colRef = collection(db, 'maintenanceRequests')
    const snapshot = await getDocs(colRef)
    const count = snapshot.size
    const ticketNumber = `MT-${(count + 1).toString().padStart(4, '0')}`

    const docRef = doc(collection(db, 'maintenanceRequests'))
    const newRecord: MaintenanceRecord = {
      ...data,
      id: docRef.id,
      ticketNumber,
      status: 'pending',
      requestedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as MaintenanceRecord
    await setDoc(docRef, newRecord)
    return docRef.id
  },

  async approveRequest(ticketId: string, adminId: string): Promise<void> {
    const ticketRef = doc(db, 'maintenanceRequests', ticketId)
    
    await runTransaction(db, async (transaction) => {
      const ticketDoc = await transaction.get(ticketRef)
      if (!ticketDoc.exists()) throw new Error('Ticket not found.')
      const ticket = ticketDoc.data() as MaintenanceRecord

      if (ticket.status !== 'pending') throw new Error('Ticket is not in pending state.')

      const assetRef = doc(db, 'assets', ticket.assetId)
      const assetDoc = await transaction.get(assetRef)
      if (!assetDoc.exists()) throw new Error('Associated asset not found.')
      const asset = assetDoc.data() as Asset

      // Update ticket
      transaction.update(ticketRef, {
        status: 'approved',
        approvedBy: adminId,
        updatedAt: new Date().toISOString()
      })

      // Force asset to Under Maintenance
      transaction.update(assetRef, {
        status: 'Under Maintenance'
      })

      // Log activity
      const logRef = doc(collection(db, 'activityLogs'))
      transaction.set(logRef, {
        logId: logRef.id,
        assetId: ticket.assetId,
        action: `Maintenance ticket ${ticket.ticketNumber} approved`,
        actorId: adminId,
        timestamp: serverTimestamp()
      })
    })
  },

  async rejectRequest(ticketId: string, adminId: string): Promise<void> {
    const ticketRef = doc(db, 'maintenanceRequests', ticketId)
    await updateDoc(ticketRef, {
      status: 'rejected',
      resolvedBy: adminId,
      updatedAt: new Date().toISOString()
    })
  },

  async assignTechnician(ticketId: string, techId: string, adminId: string): Promise<void> {
    const ticketRef = doc(db, 'maintenanceRequests', ticketId)
    await updateDoc(ticketRef, {
      status: 'technician_assigned',
      assignedTechnician: techId,
      updatedAt: new Date().toISOString()
    })
  },

  async startWork(ticketId: string): Promise<void> {
    const ticketRef = doc(db, 'maintenanceRequests', ticketId)
    await updateDoc(ticketRef, {
      status: 'in_progress',
      updatedAt: new Date().toISOString()
    })
  },

  async resolveRequest(ticketId: string, adminId: string, notes?: string, actualCost?: number): Promise<void> {
    const ticketRef = doc(db, 'maintenanceRequests', ticketId)
    
    await runTransaction(db, async (transaction) => {
      const ticketDoc = await transaction.get(ticketRef)
      if (!ticketDoc.exists()) throw new Error('Ticket not found.')
      const ticket = ticketDoc.data() as MaintenanceRecord

      const assetRef = doc(db, 'assets', ticket.assetId)
      const assetDoc = await transaction.get(assetRef)

      transaction.update(ticketRef, {
        status: 'resolved',
        resolvedBy: adminId,
        notes: notes || null,
        actualCost: actualCost || null,
        completedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      if (assetDoc.exists()) {
        // Restore to Available
        transaction.update(assetRef, {
          status: 'Available'
        })
      }

      // Log activity
      const logRef = doc(collection(db, 'activityLogs'))
      transaction.set(logRef, {
        logId: logRef.id,
        assetId: ticket.assetId,
        action: `Maintenance ticket ${ticket.ticketNumber} resolved`,
        actorId: adminId,
        timestamp: serverTimestamp()
      })
    })
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'maintenanceRequests', id)
    await deleteDoc(docRef)
  }
}
