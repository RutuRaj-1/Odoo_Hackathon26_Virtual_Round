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
import type { Employee, PaginatedResponse, FilterParams, PaginationParams } from '@/types'

// Map Firestore User fields to Employee schema
const mapUserToEmployee = (userData: any): Employee => {
  const statusMap: Record<string, 'active' | 'on_leave' | 'terminated'> = {
    Active: 'active',
    Inactive: 'terminated',
    active: 'active',
    on_leave: 'on_leave',
    terminated: 'terminated'
  }
  const dateStr = userData.createdAt || new Date().toISOString()
  return {
    id: userData.id || userData.uid || '',
    employeeId: userData.employeeId || userData.id || userData.uid || '',
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    department: userData.departmentId || userData.department || 'Unassigned',
    designation: userData.role || 'Employee',
    status: statusMap[userData.status] || 'active',
    joiningDate: dateStr,
    location: userData.location || 'HQ',
    createdAt: dateStr,
    updatedAt: userData.updatedAt || dateStr
  }
}

export const employeeService = {
  // Get all employees with in-memory filtering & pagination
  async getAll(params?: FilterParams & PaginationParams): Promise<PaginatedResponse<Employee>> {
    const colRef = collection(db, 'users')
    const snapshot = await getDocs(colRef)
    let data = snapshot.docs.map((doc) => mapUserToEmployee({ id: doc.id, ...doc.data() }))

    // Apply Search Filter
    if (params?.search) {
      const search = params.search.toLowerCase()
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search)
      )
    }

    // Apply Department Filter
    if (params?.department) {
      data = data.filter((item) => item.department === params.department)
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

  // Get employee by ID
  async getById(id: string): Promise<Employee> {
    const docRef = doc(db, 'users', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Employee not found.')
    }
    return mapUserToEmployee({ id: docSnap.id, ...docSnap.data() })
  },

  // Create employee
  async create(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const docRef = doc(collection(db, 'users'))
    const timestamp = new Date().toISOString()
    const newEmpData = {
      ...data,
      id: docRef.id,
      uid: docRef.id,
      status: data.status === 'active' ? 'Active' : 'Inactive',
      role: data.designation || 'Employee',
      departmentId: data.department || null,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    await setDoc(docRef, newEmpData)
    return mapUserToEmployee(newEmpData)
  },

  // Update employee
  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const docRef = doc(db, 'users', id)
    const timestamp = new Date().toISOString()
    const updates: Record<string, any> = {
      ...data,
      updatedAt: timestamp
    }
    if (data.status) {
      updates.status = data.status === 'active' ? 'Active' : 'Inactive'
    }
    if (data.designation) {
      updates.role = data.designation
    }
    if (data.department) {
      updates.departmentId = data.department
    }
    await updateDoc(docRef, updates)
    const docSnap = await getDoc(docRef)
    return mapUserToEmployee({ id: docSnap.id, ...docSnap.data() })
  },

  // Delete employee
  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'users', id)
    await deleteDoc(docRef)
  }
}
