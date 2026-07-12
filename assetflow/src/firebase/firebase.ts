import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD0FEAv_lovvQW8Hle96nFdJkHEVgM61x0",
  authDomain: "odoohackathon-virtualround.firebaseapp.com",
  projectId: "odoohackathon-virtualround",
  storageBucket: "odoohackathon-virtualround.firebasestorage.app",
  messagingSenderId: "427265237132",
  appId: "1:427265237132:web:f32ecced4a5f34917c1ba9"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Services
export const auth = getAuth(app)
export const db = getFirestore(app)

// OAuth Providers
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
