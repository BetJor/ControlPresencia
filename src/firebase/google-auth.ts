'use client';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

/**
 * Initiates the Google sign-in process using a popup.
 * Does not block execution; auth state changes are handled by the onAuthStateChanged listener.
 * @param authInstance The Firebase Auth instance.
 */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Do not `await` this call.
  signInWithPopup(authInstance, provider);
}

/**
 * Signs the user out.
 * Does not block execution; auth state changes are handled by the onAuthStateChanged listener.
 * @param authInstance The Firebase Auth instance.
 */
export function initiateSignOut(authInstance: Auth): void {
  // CRITICAL: Do not `await` this call.
  signOut(authInstance);
}
