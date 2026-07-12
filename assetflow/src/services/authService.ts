import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db, googleProvider } from '@/firebase/firebase'
import type { UserRole } from '@/types'

// ─── Interfaces ────────────────────────────────────────────────────────────────
export interface LoginEmailPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
}

export interface PhoneOtpRequestPayload {
  phoneNumber: string
}

export interface PhoneOtpVerifyPayload {
  phoneNumber: string
  otp: string
}

export interface AuthResult {
  token: string
  user: {
    uid: string
    name: string
    email: string
    role: UserRole
  }
}

// ─── Error Mapper ──────────────────────────────────────────────────────────────
function handleAuthError(error: any): never {
  console.error("Firebase Auth/Firestore error:", error)
  const code = error?.code
  let message = 'An unexpected error occurred. Please try again.'

  switch (code) {
    case 'auth/invalid-email':
      message = 'Invalid email address format.'
      break
    case 'auth/user-disabled':
      message = 'This user account has been disabled.'
      break
    case 'auth/user-not-found':
      message = 'No account found with this email address.'
      break
    case 'auth/wrong-password':
      message = 'Incorrect password. Please check your credentials.'
      break
    case 'auth/email-already-in-use':
      message = 'An account with this email address already exists.'
      break
    case 'auth/weak-password':
      message = 'The password is too weak. It must be at least 6 characters.'
      break
    case 'auth/operation-not-allowed':
      message = 'Sign-in provider is disabled.'
      break
    case 'auth/network-request-failed':
      message = 'A network error occurred. Please check your connection.'
      break
    case 'auth/popup-closed-by-user':
      message = 'Sign-in popup closed before completion.'
      break
    case 'auth/invalid-verification-code':
      message = 'Invalid verification code. Please try again.'
      break
    case 'auth/code-expired':
      message = 'The verification code has expired. Please request a new one.'
      break
    case 'auth/invalid-phone-number':
      message = 'Invalid phone number format.'
      break
    case 'auth/too-many-requests':
      message = 'Too many requests. Please try again later.'
      break
    default:
      if (error instanceof Error) {
        message = error.message
      }
  }
  throw new Error(message)
}

// ─── Service Implementation ────────────────────────────────────────────────────
export const authService = {
  /**
   * Email + password login.
   */
  async loginWithEmail(payload: LoginEmailPayload): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password)
      const firebaseUser = userCredential.user

      const docRef = doc(db, 'users', firebaseUser.uid)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        throw new Error('User profile does not exist in the database.')
      }

      const userData = docSnap.data()
      const token = await firebaseUser.getIdToken()

      return {
        token,
        user: {
          uid: firebaseUser.uid,
          name: userData.name || firebaseUser.displayName || 'Unnamed User',
          email: firebaseUser.email || '',
          role: userData.role || 'employee',
        },
      }
    } catch (error) {
      return handleAuthError(error)
    }
  },

  /**
   * Google OAuth sign-in.
   */
  async loginWithGoogle(): Promise<AuthResult> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)
      const firebaseUser = userCredential.user

      const docRef = doc(db, 'users', firebaseUser.uid)
      const docSnap = await getDoc(docRef)

      let role = 'Employee'
      let name = firebaseUser.displayName || 'Google User'

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: firebaseUser.uid,
          name,
          email: firebaseUser.email || '',
          role: 'Employee', // All new signups default to Employee
          departmentId: null,
          status: 'Active',
          createdAt: serverTimestamp(),
        })
      } else {
        const userData = docSnap.data()
        role = userData.role || 'Employee'
        name = userData.name || name
      }

      const token = await firebaseUser.getIdToken()
      return {
        token,
        user: {
          uid: firebaseUser.uid,
          name,
          email: firebaseUser.email || '',
          role: role as UserRole,
        },
      }
    } catch (error) {
      return handleAuthError(error)
    }
  },

  /**
   * Send OTP to phone number.
   */
  async sendPhoneOtp(payload: PhoneOtpRequestPayload): Promise<void> {
    try {
      let recaptchaVerifier = (window as any).recaptchaVerifier
      if (!recaptchaVerifier) {
        let container = document.getElementById('recaptcha-container')
        if (!container) {
          container = document.createElement('div')
          container.id = 'recaptcha-container'
          document.body.appendChild(container)
        }
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        })
        ;(window as any).recaptchaVerifier = recaptchaVerifier
      }

      const confirmationResult = await signInWithPhoneNumber(auth, payload.phoneNumber, recaptchaVerifier)
      ;(window as any).confirmationResult = confirmationResult
    } catch (error) {
      return handleAuthError(error)
    }
  },

  /**
   * Verify phone OTP.
   */
  async verifyPhoneOtp(payload: PhoneOtpVerifyPayload): Promise<AuthResult> {
    try {
      const confirmationResult = (window as any).confirmationResult
      if (!confirmationResult) {
        throw new Error('Verification session expired or not found. Please request OTP again.')
      }

      const result = await confirmationResult.confirm(payload.otp)
      const firebaseUser = result.user

      const docRef = doc(db, 'users', firebaseUser.uid)
      const docSnap = await getDoc(docRef)

      let role = 'Employee'
      let name = firebaseUser.displayName || 'Phone User'

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: firebaseUser.uid,
          name,
          email: payload.phoneNumber, // Store phone number as email context if unavailable
          role: 'Employee', // All new signups default to Employee
          departmentId: null,
          status: 'Active',
          createdAt: serverTimestamp(),
        })
      } else {
        const userData = docSnap.data()
        role = userData.role || 'Employee'
        name = userData.name || name
      }

      const token = await firebaseUser.getIdToken()
      return {
        token,
        user: {
          uid: firebaseUser.uid,
          name,
          email: firebaseUser.email || payload.phoneNumber,
          role: role as UserRole,
        },
      }
    } catch (error) {
      return handleAuthError(error)
    }
  },

  /**
   * Create a new employee account.
   */
  async signup(payload: SignupPayload): Promise<AuthResult> {
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password)
      const firebaseUser = userCredential.user

      // 2. Set profile displayName
      await updateProfile(firebaseUser, { displayName: payload.name })

      // 3. Create document in Firestore
      const docRef = doc(db, 'users', firebaseUser.uid)
      await setDoc(docRef, {
        uid: firebaseUser.uid,
        name: payload.name,
        email: payload.email,
        role: 'Employee', // Capitalized, non-choosable role
        departmentId: null,
        status: 'Active',
        createdAt: serverTimestamp(),
      })

      const token = await firebaseUser.getIdToken()

      return {
        token,
        user: {
          uid: firebaseUser.uid,
          name: payload.name,
          email: payload.email,
          role: 'Employee',
        },
      }
    } catch (error) {
      return handleAuthError(error)
    }
  },

  /**
   * Send Password Reset Email.
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(auth, email)
    } catch (error) {
      return handleAuthError(error)
    }
  },

  /**
   * Sign out the current user.
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth)
      localStorage.removeItem('assetflow_auth_token')
      localStorage.removeItem('assetflow_user')
    } catch (error) {
      return handleAuthError(error)
    }
  },
}
