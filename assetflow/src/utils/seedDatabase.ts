import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import type { Department, AssetCategoryDoc, User, Asset } from '@/types'

const DEPARTMENTS = [
  { name: 'IT', code: 'IT' },
  { name: 'HR', code: 'HR' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Operations', code: 'OPS' }
]

const CATEGORIES = [
  { name: 'Electronics', description: 'Computers, phones, etc.', warrantyPeriod: 24 },
  { name: 'Furniture', description: 'Desks, chairs, cabinets', warrantyPeriod: 60 },
  { name: 'Vehicles', description: 'Company cars, vans', warrantyPeriod: 36 },
  { name: 'Equipment', description: 'Specialized work equipment', warrantyPeriod: 12 }
]

const USERS = [
  { uid: 'admin_user', name: 'Admin', email: 'admin@assetflow.com', role: 'Admin' },
  { uid: 'manager_user', name: 'Asset Manager', email: 'manager@assetflow.com', role: 'Asset Manager' },
  { uid: 'head_user', name: 'Department Head', email: 'head@assetflow.com', role: 'Department Head' },
  { uid: 'employee_user', name: 'Employee', email: 'employee@assetflow.com', role: 'Employee' }
]

export async function seedDatabase() {
  try {
    const seedMarkerRef = doc(db, 'system', 'seedMarker')
    
    // Check if categories collection has data to prevent overwriting/re-seeding
    const catSnap = await getDocs(collection(db, 'assetCategories'))
    if (!catSnap.empty) {
      console.log('Database already seeded or has existing data. Skipping seed.')
      return
    }

    console.log('Starting Database Seed...')

    // Seed Departments
    const deptIds: string[] = []
    for (const d of DEPARTMENTS) {
      const docRef = doc(collection(db, 'departments'))
      deptIds.push(docRef.id)
      await setDoc(docRef, {
        departmentId: docRef.id,
        name: d.name,
        departmentCode: d.code,
        parentDepartment: null,
        headId: null,
        status: 'Active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      } as Department)
    }

    // Seed Categories
    const catIds: string[] = []
    for (const c of CATEGORIES) {
      const docRef = doc(collection(db, 'assetCategories'))
      catIds.push(docRef.id)
      await setDoc(docRef, {
        categoryId: docRef.id,
        name: c.name,
        description: c.description,
        warrantyPeriod: c.warrantyPeriod,
        status: 'Active',
        createdAt: serverTimestamp()
      } as AssetCategoryDoc)
    }

    // Seed Users
    const userIds: string[] = []
    for (let i = 0; i < USERS.length; i++) {
      const u = USERS[i]
      const docRef = doc(db, 'users', u.uid)
      userIds.push(u.uid)
      await setDoc(docRef, {
        uid: u.uid,
        name: u.name,
        email: u.email,
        role: u.role as any,
        departmentId: deptIds[i % deptIds.length],
        status: 'Active',
        createdAt: serverTimestamp()
      } as User)
    }

    // Seed 20 Assets
    for (let i = 1; i <= 20; i++) {
      const docRef = doc(collection(db, 'assets'))
      const tag = `AF-${i.toString().padStart(4, '0')}`
      const categoryId = catIds[i % catIds.length]
      const categoryName = CATEGORIES[i % CATEGORIES.length].name
      const departmentId = deptIds[i % deptIds.length]
      
      const isAllocated = i % 3 === 0
      const assignedTo = isAllocated ? userIds[i % userIds.length] : null
      const status = isAllocated ? 'Allocated' : 'Available'
      
      await setDoc(docRef, {
        assetId: docRef.id,
        assetTag: tag,
        assetName: `Sample ${categoryName} ${i}`,
        serialNumber: `SN${Math.floor(Math.random() * 1000000)}`,
        categoryId,
        departmentId,
        status,
        location: 'HQ Office',
        condition: 'good',
        purchaseDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        purchaseCost: Math.floor(Math.random() * 2000) + 100,
        assignedTo,
        createdBy: userIds[0],
        createdAt: serverTimestamp()
      } as Asset)

      if (isAllocated) {
        // Create an allocation record if allocated
        const allocRef = doc(collection(db, 'allocations'))
        await setDoc(allocRef, {
          allocationId: allocRef.id,
          assetId: docRef.id,
          assignedTo: assignedTo!,
          assignedBy: userIds[0],
          allocationDate: serverTimestamp(),
          expectedReturnDate: null,
          returnDate: null,
          returnConditionNotes: null,
          status: 'Active'
        })
      }
    }

    // Mark as seeded
    await setDoc(seedMarkerRef, { seededAt: serverTimestamp(), status: 'completed' })
    console.log('Database successfully seeded!')

  } catch (error) {
    console.error('Error during database seed:', error)
  }
}
