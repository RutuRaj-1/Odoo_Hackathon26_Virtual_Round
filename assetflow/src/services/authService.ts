/**
 * Auth Service — placeholder stubs.
 * Replace the function bodies with real API calls (Firebase / REST) later.
 * The interface (inputs/outputs) is intentionally stable.
 */

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
    id: string
    name: string
    email: string
    role: 'employee'      // signup always creates employee
    avatarUrl?: string
  }
}

// ─── Simulated delay helper ────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

// ─── Service ───────────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Email + password login.
   * TODO: Replace with Firebase signInWithEmailAndPassword or REST call.
   */
  async loginWithEmail(payload: LoginEmailPayload): Promise<AuthResult> {
    await delay(1200)
    // Simulate basic check — replace with real validation
    if (payload.password.length < 6) {
      throw new Error('Invalid credentials. Please try again.')
    }
    return {
      token: 'mock-jwt-token',
      user: {
        id: crypto.randomUUID(),
        name: 'Demo Employee',
        email: payload.email,
        role: 'employee',
      },
    }
  },

  /**
   * Google OAuth sign-in.
   * TODO: Replace with Firebase signInWithPopup(googleProvider).
   */
  async loginWithGoogle(): Promise<AuthResult> {
    await delay(800)
    return {
      token: 'mock-google-token',
      user: {
        id: crypto.randomUUID(),
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'employee',
      },
    }
  },

  /**
   * Send OTP to phone number.
   * TODO: Replace with Firebase signInWithPhoneNumber.
   */
  async sendPhoneOtp(payload: PhoneOtpRequestPayload): Promise<void> {
    await delay(1000)
    console.info('[authService] OTP sent to', payload.phoneNumber)
  },

  /**
   * Verify phone OTP.
   * TODO: Replace with Firebase PhoneAuthProvider.credential + signInWithCredential.
   */
  async verifyPhoneOtp(payload: PhoneOtpVerifyPayload): Promise<AuthResult> {
    await delay(1000)
    if (payload.otp !== '123456') {
      throw new Error('Invalid OTP. Please try again.')
    }
    return {
      token: 'mock-phone-token',
      user: {
        id: crypto.randomUUID(),
        name: 'Phone User',
        email: '',
        role: 'employee',
      },
    }
  },

  /**
   * Create a new employee account.
   * TODO: Replace with Firebase createUserWithEmailAndPassword + Firestore write.
   */
  async signup(payload: SignupPayload): Promise<AuthResult> {
    await delay(1400)
    return {
      token: 'mock-signup-token',
      user: {
        id: crypto.randomUUID(),
        name: payload.name,
        email: payload.email,
        role: 'employee',
      },
    }
  },

  /**
   * Sign out the current user.
   * TODO: Replace with Firebase signOut().
   */
  async logout(): Promise<void> {
    await delay(300)
    localStorage.removeItem('assetflow_auth_token')
    localStorage.removeItem('assetflow_user')
  },
}
