import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  runTransaction
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { Department, AssetCategoryDoc, User, UserRole, Asset, Allocation, TransferRequest, ActivityLog, AppNotification } from '@/types'

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
  },

  // ─── Allocations & Transfers ──────────────────────────────────────────────────
  async allocateAsset(assetId: string, userId: string, expectedReturnDate: string | null, adminId: string): Promise<void> {
    const assetRef = doc(db, 'assets', assetId)
    
    await runTransaction(db, async (transaction) => {
      const assetDoc = await transaction.get(assetRef)
      if (!assetDoc.exists()) {
        throw new Error('Asset does not exist!')
      }

      const assetData = assetDoc.data() as Asset
      if (assetData.status !== 'Available') {
        throw new Error(`Asset is currently not available. It is ${assetData.status} (assigned to ${assetData.assignedTo || 'nobody'}).`)
      }

      // Update Asset
      transaction.update(assetRef, {
        status: 'Allocated',
        assignedTo: userId
      })

      // Create Allocation
      const allocRef = doc(collection(db, 'allocations'))
      transaction.set(allocRef, {
        allocationId: allocRef.id,
        assetId,
        assignedTo: userId,
        assignedBy: adminId,
        allocationDate: serverTimestamp(),
        expectedReturnDate,
        returnDate: null,
        returnConditionNotes: null,
        status: 'Active'
      })

      // Create ActivityLog
      const logRef = doc(collection(db, 'activityLogs'))
      transaction.set(logRef, {
        logId: logRef.id,
        assetId,
        action: `Allocated to user ${userId}`,
        actorId: adminId,
        timestamp: serverTimestamp()
      })

      // Create Notification
      const notifRef = doc(collection(db, 'notifications'))
      transaction.set(notifRef, {
        notificationId: notifRef.id,
        userId,
        title: 'New Asset Assigned',
        message: `Asset ${assetData.assetName} has been assigned to you.`,
        isRead: false,
        timestamp: serverTimestamp()
      })
    })
  },

  async returnAsset(allocationId: string, assetId: string, conditionNotes: string, adminId: string): Promise<void> {
    const assetRef = doc(db, 'assets', assetId)
    const allocRef = doc(db, 'allocations', allocationId)

    await runTransaction(db, async (transaction) => {
      const allocDoc = await transaction.get(allocRef)
      if (!allocDoc.exists()) throw new Error('Allocation does not exist.')
      
      const assetDoc = await transaction.get(assetRef)
      if (!assetDoc.exists()) throw new Error('Asset does not exist.')

      transaction.update(allocRef, {
        status: 'Returned',
        returnDate: serverTimestamp(),
        returnConditionNotes: conditionNotes
      })

      transaction.update(assetRef, {
        status: 'Available',
        assignedTo: null
      })

      const logRef = doc(collection(db, 'activityLogs'))
      transaction.set(logRef, {
        logId: logRef.id,
        assetId,
        action: `Returned by user ${allocDoc.data().assignedTo}`,
        actorId: adminId,
        timestamp: serverTimestamp()
      })
    })
  },

  async requestTransfer(assetId: string, fromUserId: string, toUserId: string, requesterId: string): Promise<void> {
    const requestRef = doc(collection(db, 'transferRequests'))
    await setDoc(requestRef, {
      requestId: requestRef.id,
      assetId,
      fromUser: fromUserId,
      toUser: toUserId,
      requestedBy: requesterId,
      status: 'Pending',
      createdAt: serverTimestamp()
    })

    const notifRef = doc(collection(db, 'notifications'))
    await setDoc(notifRef, {
      notificationId: notifRef.id,
      userId: fromUserId, // Can send to admin or current holder
      title: 'Transfer Requested',
      message: `A transfer request for asset ${assetId} has been submitted.`,
      isRead: false,
      timestamp: serverTimestamp()
    })
  },

  async getAssetActivityLogs(assetId: string): Promise<ActivityLog[]> {
    const colRef = collection(db, 'activityLogs')
    const snapshot = await getDocs(colRef)
    return snapshot.docs
      .map(doc => doc.data() as ActivityLog)
      .filter(log => log.assetId === assetId)
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0
        return b.timestamp.toMillis() - a.timestamp.toMillis()
      })
  },

  async getActiveAllocation(assetId: string): Promise<Allocation | null> {
    const colRef = collection(db, 'allocations')
    const snapshot = await getDocs(colRef)
    const allocs = snapshot.docs.map(d => d.data() as Allocation)
    return allocs.find(a => a.assetId === assetId && a.status === 'Active') || null
  }
}
