import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { MaintenanceRecord, PaginatedResponse, FilterParams, PaginationParams } from '@/types'

export const maintenanceService = {
  // Get all maintenance requests with in-memory filtering & pagination
  async getAll(params?: FilterParams & PaginationParams): Promise<PaginatedResponse<MaintenanceRecord>> {
    const colRef = collection(db, 'maintenanceRequests')
    const snapshot = await getDocs(colRef)
    let data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as MaintenanceRecord[]

    // Apply Search Filter
    if (params?.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (item) =>
          item.ticketNumber.toLowerCase().includes(search) ||
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      )
    }

    // Apply Status Filter
    if (params?.status) {
      data = data.filter((item) => item.status === params.status)
    }

    // Pagination
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

  // Get maintenance request by ID
  async getById(id: string): Promise<MaintenanceRecord> {
    const docRef = doc(db, 'maintenanceRequests', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Maintenance request not found.')
    }
    return { id: docSnap.id, ...docSnap.data() } as MaintenanceRecord
  },

  // Create maintenance request
  async create(data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>): Promise<MaintenanceRecord> {
    const colRef = collection(db, 'maintenanceRequests')
    const snapshot = await getDocs(colRef)
    const count = snapshot.size
    const ticketNumber = `MT-${(count + 1).toString().padStart(4, '0')}`

    const docRef = doc(collection(db, 'maintenanceRequests'))
    const timestamp = new Date().toISOString()
    const newRecord: MaintenanceRecord = {
      ...data,
      id: docRef.id,
      ticketNumber,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    await setDoc(docRef, newRecord)
    return newRecord
  },

  // Update maintenance request
  async update(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const docRef = doc(db, 'maintenanceRequests', id)
    const timestamp = new Date().toISOString()
    const updates = {
      ...data,
      updatedAt: timestamp
    }
    await updateDoc(docRef, updates)
    const docSnap = await getDoc(docRef)
    return { id: docSnap.id, ...docSnap.data() } as MaintenanceRecord
  },

  // Complete maintenance request
  async complete(id: string, actualCost?: number): Promise<MaintenanceRecord> {
    const docRef = doc(db, 'maintenanceRequests', id)
    const timestamp = new Date().toISOString()
    const updates = {
      status: 'completed' as const,
      completedDate: timestamp,
      actualCost: actualCost ?? null,
      updatedAt: timestamp
    }
    await updateDoc(docRef, updates as any)
    const docSnap = await getDoc(docRef)
    return { id: docSnap.id, ...docSnap.data() } as MaintenanceRecord
  },

  // Delete maintenance request
  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'maintenanceRequests', id)
    await deleteDoc(docRef)
  }
}
