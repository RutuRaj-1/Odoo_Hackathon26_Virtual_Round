/**
 * Firestore helpers — collection/document references and typed CRUD operations.
 *
 * All other modules (services, hooks) import from here instead of calling
 * Firestore directly, keeping the data-access layer centralised.
 */
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import type { User } from '@/types'

// ─── Collection references ─────────────────────────────────────────────────────
export const Collections = {
  users:       () => collection(db, 'users')       as CollectionReference<DocumentData>,
  assets:      () => collection(db, 'assets')      as CollectionReference<DocumentData>,
  bookings:    () => collection(db, 'bookings')    as CollectionReference<DocumentData>,
  maintenance: () => collection(db, 'maintenance') as CollectionReference<DocumentData>,
} as const

// ─── Document references ───────────────────────────────────────────────────────
export const Docs = {
  user:        (uid: string) => doc(db, 'users', uid),
  asset:       (id: string)  => doc(db, 'assets', id),
  booking:     (id: string)  => doc(db, 'bookings', id),
  maintenance: (id: string)  => doc(db, 'maintenance', id),
} as const

// ─── Firestore User Profile ────────────────────────────────────────────────────
/**
 * Shape stored in Firestore `users/{uid}`.
 * Firebase Auth only stores email + displayName + photoURL.
 * Everything else (role, department, etc.) lives here.
 */
export interface FirestoreUserProfile {
  uid:         string
  name:        string
  email:       string
  phone?:      string
  role:        User['role']
  department?: string
  designation?: string
  avatarUrl?:  string
  isActive:    boolean
  createdAt:   unknown   // Firestore Timestamp (kept as unknown to avoid import)
  updatedAt:   unknown
}

// ─── User profile helpers ──────────────────────────────────────────────────────

/** Fetch a user profile from Firestore. Returns null if the document does not exist. */
export async function getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
  const snap = await getDoc(Docs.user(uid))
  if (!snap.exists()) return null
  return snap.data() as FirestoreUserProfile
}

/** Create a new user profile. Called once after Firebase Auth account creation. */
export async function createUserProfile(
  uid: string,
  data: Pick<FirestoreUserProfile, 'name' | 'email' | 'phone' | 'avatarUrl'>,
): Promise<void> {
  await setDoc(Docs.user(uid), {
    uid,
    name:      data.name,
    email:     data.email,
    phone:     data.phone    ?? undefined,
    avatarUrl: data.avatarUrl ?? undefined,
    role:      'employee' as const,   // All new accounts start as employee
    department:  undefined,
    designation: undefined,
    isActive:  true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<FirestoreUserProfile, 'createdAt' | 'updatedAt'> & { createdAt: unknown; updatedAt: unknown })
}

/** Update partial fields on a user profile. */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<FirestoreUserProfile, 'uid' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(Docs.user(uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/** Soft-delete / deactivate a user profile (does NOT delete the Auth account). */
export async function deactivateUserProfile(uid: string): Promise<void> {
  await updateDoc(Docs.user(uid), { isActive: false, updatedAt: serverTimestamp() })
}
