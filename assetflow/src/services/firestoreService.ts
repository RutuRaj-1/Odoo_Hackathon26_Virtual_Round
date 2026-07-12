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
import type { Department, AssetCategoryDoc, User, UserRole } from '@/types'

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
  // Get all users in the organization
  async getEmployees(): Promise<User[]> {
    const colRef = collection(db, 'users')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        uid: doc.id,
        email: data.email || '',
        name: data.name || '',
        role: data.role as UserRole,
        departmentId: data.departmentId || null,
        status: data.status || 'Active',
        createdAt: data.createdAt,
        avatarUrl: data.avatarUrl
      }
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
      ...updates,
      updatedAt: serverTimestamp()
    })
  }
}
