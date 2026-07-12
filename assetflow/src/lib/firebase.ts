/**
 * Firebase app initialization.
 *
 * All config values come from Vite's import.meta.env so the keys
 * never appear in source code. In production, set the same VITE_*
 * variables in your CI/CD environment or hosting platform.
 */
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string,
}

// Guard against duplicate initialization during Vite HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

/** Firebase Authentication instance */
export const auth = getAuth(app)

/** Cloud Firestore instance */
export const db = getFirestore(app)

/** Firebase Storage instance */
export const storage = getStorage(app)

export default app
