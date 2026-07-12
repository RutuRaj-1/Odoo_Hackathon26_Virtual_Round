import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { Department, AssetCategoryDoc, User, UserRole } from '@/types'

// ─── Department Management CRUD ───────────────────────────────────────────────
export const firestoreService = {
  // Get all departments
  async getDepartments(): Promise<Department[]> {
    const colRef = collection(db, 'departments')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Department[]
  },

  // Create department
  async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = doc(collection(db, 'departments'))
    const newDept: Department = {
      id: docRef.id,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    await setDoc(docRef, newDept)
    return docRef.id
  },

  // Update department
  async updateDepartment(id: string, data: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, 'departments', id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  // Delete department
  async deleteDepartment(id: string): Promise<void> {
    const docRef = doc(db, 'departments', id)
    await deleteDoc(docRef)
  },

  // ─── Asset Category Management CRUD ───────────────────────────────────────────
  // Get all categories
  async getCategories(): Promise<AssetCategoryDoc[]> {
    const colRef = collection(db, 'assetCategories')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as AssetCategoryDoc[]
  },

  // Create category
  async createCategory(data: Omit<AssetCategoryDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = doc(collection(db, 'assetCategories'))
    const newCat: AssetCategoryDoc = {
      id: docRef.id,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    await setDoc(docRef, newCat)
    return docRef.id
  },

  // Update category
  async updateCategory(id: string, data: Partial<Omit<AssetCategoryDoc, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, 'assetCategories', id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, 'assetCategories', id)
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
