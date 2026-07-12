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
import type { Asset, PaginatedResponse, FilterParams, PaginationParams } from '@/types'

// ─── Asset Service ─────────────────────────────────────────────────────────────
export const assetService = {
  // Get all assets with in-memory filtering & pagination
  async getAll(params?: FilterParams & PaginationParams): Promise<PaginatedResponse<Asset>> {
    const colRef = collection(db, 'assets')
    const snapshot = await getDocs(colRef)
    let data = snapshot.docs.map((doc) => ({
      ...doc.data()
    })) as Asset[]

    // Apply Search Filter
    if (params?.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (item) =>
          (item.assetName && item.assetName.toLowerCase().includes(search)) ||
          (item.assetTag && item.assetTag.toLowerCase().includes(search)) ||
          (item.serialNumber && item.serialNumber.toLowerCase().includes(search))
      )
    }

    // Apply Category Filter
    if (params?.category) {
      data = data.filter((item) => item.categoryId === params.category)
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

  // Get asset by ID
  async getById(id: string): Promise<Asset> {
    const docRef = doc(db, 'assets', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Asset not found.')
    }
    return { ...docSnap.data() } as Asset
  },

  // Create asset with auto-generated asset tag
  async create(data: Omit<Asset, 'assetId' | 'assetTag' | 'createdAt'>): Promise<Asset> {
    const colRef = collection(db, 'assets')
    const snapshot = await getDocs(colRef)
    const count = snapshot.size
    const assetTag = `AF-${(count + 1).toString().padStart(4, '0')}`

    const docRef = doc(collection(db, 'assets'))
    const timestamp = new Date().toISOString()
    const newAsset: Asset = {
      ...data,
      assetId: docRef.id,
      assetTag,
      createdAt: timestamp
    } as Asset
    await setDoc(docRef, newAsset)
    return newAsset
  },

  // Update asset
  async update(id: string, data: Partial<Asset>): Promise<Asset> {
    const docRef = doc(db, 'assets', id)
    await updateDoc(docRef, data)
    const docSnap = await getDoc(docRef)
    return { ...docSnap.data() } as Asset
  },

  // Delete asset
  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'assets', id)
    await deleteDoc(docRef)
  }
}
