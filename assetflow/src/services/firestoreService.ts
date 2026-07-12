import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { Department, AssetCategoryDoc, User, UserRole, Asset } from '@/types'

// ─── Department Management CRUD ───────────────────────────────────────────────
export const firestoreService = {
  // Subscribe to departments for real-time updates
  subscribeToDepartments(callback: (departments: Department[]) => void): () => void {
    const colRef = collection(db, 'departments')
    return onSnapshot(colRef, (snapshot) => {
      const departments = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          departmentId: docSnap.id,
          ...data
        } as Department
      })
      callback(departments)
    }, (error) => {
      console.error('Error subscribing to departments:', error)
    })
  },

  // Get all departments (one-time fetch)
  async getDepartments(): Promise<Department[]> {
    const colRef = collection(db, 'departments')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((docSnap) => ({
      departmentId: docSnap.id,
      ...docSnap.data()
    })) as Department[]
  },

  // Create department
  async createDepartment(data: Omit<Department, 'departmentId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = doc(collection(db, 'departments'))
    const newDept: Department = {
      departmentId: docRef.id,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    await setDoc(docRef, newDept)
    return docRef.id
  },

  // Update department
  async updateDepartment(departmentId: string, data: Partial<Omit<Department, 'departmentId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, 'departments', departmentId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  // Delete department
  async deleteDepartment(departmentId: string): Promise<void> {
    const docRef = doc(db, 'departments', departmentId)
    await deleteDoc(docRef)
  },

  // ─── Asset Category Management CRUD ───────────────────────────────────────────
  // Subscribe to categories for real-time updates
  subscribeToCategories(callback: (categories: AssetCategoryDoc[]) => void): () => void {
    const colRef = collection(db, 'assetCategories')
    return onSnapshot(colRef, (snapshot) => {
      const categories = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          categoryId: docSnap.id,
          ...data
        } as AssetCategoryDoc
      })
      callback(categories)
    }, (error) => {
      console.error('Error subscribing to categories:', error)
    })
  },

  // Get all categories (one-time fetch)
  async getCategories(): Promise<AssetCategoryDoc[]> {
    const colRef = collection(db, 'assetCategories')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((docSnap) => ({
      categoryId: docSnap.id,
      ...docSnap.data()
    })) as AssetCategoryDoc[]
  },

  // Create category
  async createCategory(data: Omit<AssetCategoryDoc, 'categoryId' | 'createdAt'>): Promise<string> {
    // Duplicate prevention
    const existingCats = await this.getCategories()
    if (existingCats.some(cat => cat.name.toLowerCase() === data.name.trim().toLowerCase())) {
      throw new Error(`A category with the name "${data.name}" already exists.`)
    }

    const docRef = doc(collection(db, 'assetCategories'))
    const newCat: AssetCategoryDoc = {
      categoryId: docRef.id,
      ...data,
      createdAt: serverTimestamp()
    }
    await setDoc(docRef, newCat)
    return docRef.id
  },

  // Update category
  async updateCategory(categoryId: string, data: Partial<Omit<AssetCategoryDoc, 'categoryId' | 'createdAt'>>): Promise<void> {
    // Duplicate prevention if name is being changed
    if (data.name) {
      const existingCats = await this.getCategories()
      if (existingCats.some(cat => cat.categoryId !== categoryId && cat.name.toLowerCase() === data.name!.trim().toLowerCase())) {
        throw new Error(`A category with the name "${data.name}" already exists.`)
      }
    }

    const docRef = doc(db, 'assetCategories', categoryId)
    await updateDoc(docRef, {
      ...data
    })
  },

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {
    const docRef = doc(db, 'assetCategories', categoryId)
    await deleteDoc(docRef)
  },

  // ─── Employee Directory CRUD ──────────────────────────────────────────────────
  // Subscribe to employees for real-time updates
  subscribeToEmployees(callback: (employees: User[]) => void): () => void {
    const colRef = collection(db, 'users')
    return onSnapshot(colRef, (snapshot) => {
      const employees = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          uid: docSnap.id,
          name: data.name || '',
          email: data.email || '',
          role: data.role as UserRole,
          departmentId: data.departmentId || null,
          status: data.status || 'Active',
          createdAt: data.createdAt
        } as User
      })
      callback(employees)
    }, (error) => {
      console.error('Error subscribing to employees:', error)
    })
  },

  // Get all users in the organization
  async getEmployees(): Promise<User[]> {
    const colRef = collection(db, 'users')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        uid: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role as UserRole,
        departmentId: data.departmentId || null,
        status: data.status || 'Active',
        createdAt: data.createdAt
      } as User
    })
  },

  // Update user's department, role, and active status (Admin-only RBAC promotion)
  async updateEmployeeRoleAndDepartment(
    uid: string,
    updates: {
      role: UserRole
      departmentId: string | null
      status: 'Active' | 'Inactive'
    }
  ): Promise<void> {
    const docRef = doc(db, 'users', uid)
    await updateDoc(docRef, {
      ...updates
    })
  },

  // ─── Asset Management CRUD ────────────────────────────────────────────────────
  subscribeToAssets(callback: (assets: Asset[]) => void): () => void {
    const colRef = collection(db, 'assets')
    return onSnapshot(colRef, (snapshot) => {
      const assets = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          assetId: docSnap.id,
          ...data
        } as Asset
      })
      callback(assets)
    }, (error) => {
      console.error('Error subscribing to assets:', error)
    })
  },

  async getAssets(): Promise<Asset[]> {
    const colRef = collection(db, 'assets')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((docSnap) => ({
      assetId: docSnap.id,
      ...docSnap.data()
    })) as Asset[]
  },

  async generateNextAssetTag(): Promise<string> {
    const assets = await this.getAssets()
    if (assets.length === 0) return 'AF-0001'
    const tagNumbers = assets
      .map(a => a.assetTag)
      .filter(t => t && t.startsWith('AF-'))
      .map(t => parseInt(t.replace('AF-', ''), 10))
      .filter(n => !isNaN(n))
    
    if (tagNumbers.length === 0) return 'AF-0001'
    const maxTag = Math.max(...tagNumbers)
    return `AF-${String(maxTag + 1).padStart(4, '0')}`
  },

  async createAsset(data: Omit<Asset, 'assetId' | 'createdAt'>): Promise<string> {
    const docRef = doc(collection(db, 'assets'))
    const newAsset: Asset = {
      assetId: docRef.id,
      ...data,
      createdAt: serverTimestamp()
    }
    await setDoc(docRef, newAsset)
    return docRef.id
  },

  async updateAsset(assetId: string, data: Partial<Omit<Asset, 'assetId' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, 'assets', assetId)
    await updateDoc(docRef, { ...data })
  },

  async deleteAsset(assetId: string): Promise<void> {
    const docRef = doc(db, 'assets', assetId)
    await deleteDoc(docRef)
  }
}
