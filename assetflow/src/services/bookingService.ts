import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { Booking, PaginatedResponse, FilterParams, PaginationParams } from '@/types'

export const bookingService = {
  // Get all bookings with in-memory filtering & pagination
  async getAll(params?: FilterParams & PaginationParams): Promise<PaginatedResponse<Booking>> {
    const colRef = collection(db, 'bookings')
    const snapshot = await getDocs(colRef)
    let data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[]

    // Apply Search Filter (booking number, requestedBy)
    if (params?.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (item) =>
          item.bookingNumber.toLowerCase().includes(search) ||
          item.requestedBy.toLowerCase().includes(search)
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

  // Get booking by ID
  async getById(id: string): Promise<Booking> {
    const docRef = doc(db, 'bookings', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Booking not found.')
    }
    return { id: docSnap.id, ...docSnap.data() } as Booking
  },

  // Create booking
  async create(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'bookingNumber'>): Promise<Booking> {
    const colRef = collection(db, 'bookings')
    const snapshot = await getDocs(colRef)
    const count = snapshot.size
    const bookingNumber = `BK-${(count + 1).toString().padStart(4, '0')}`

    const docRef = doc(collection(db, 'bookings'))
    const timestamp = new Date().toISOString()
    const newBooking: Booking = {
      ...data,
      id: docRef.id,
      bookingNumber,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    await setDoc(docRef, newBooking)
    return newBooking
  },

  // Approve booking
  async approve(id: string): Promise<Booking> {
    const docRef = doc(db, 'bookings', id)
    const timestamp = new Date().toISOString()
    const updates = {
      status: 'approved' as const,
      approvedAt: timestamp,
      updatedAt: timestamp
    }
    await updateDoc(docRef, updates)
    const docSnap = await getDoc(docRef)
    return { id: docSnap.id, ...docSnap.data() } as Booking
  },

  // Reject booking with reason
  async reject(id: string, reason: string): Promise<Booking> {
    const docRef = doc(db, 'bookings', id)
    const timestamp = new Date().toISOString()
    const updates = {
      status: 'rejected' as const,
      rejectionReason: reason,
      updatedAt: timestamp
    }
    await updateDoc(docRef, updates)
    const docSnap = await getDoc(docRef)
    return { id: docSnap.id, ...docSnap.data() } as Booking
  },

  // Cancel booking
  async cancel(id: string): Promise<Booking> {
    const docRef = doc(db, 'bookings', id)
    const timestamp = new Date().toISOString()
    const updates = {
      status: 'cancelled' as const,
      updatedAt: timestamp
    }
    await updateDoc(docRef, updates)
    const docSnap = await getDoc(docRef)
    return { id: docSnap.id, ...docSnap.data() } as Booking
  }
}
