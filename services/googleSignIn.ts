/**
 * Google Sign-In Service (Expo Auth Session)
 * Uses expo-auth-session for Expo Go compatible OAuth
 * 
 * ⚠️ EXPO GO COMPATIBLE:
 * - Works in Expo Go without native build
 * - Uses OAuth 2.0 web flow with Expo proxy
 * - Web Client ID: 702527545429-60e3mi47s816iu9aus38kb83qgkmkgna.apps.googleusercontent.com
 * 
 * Backend expects:
 * POST /auth/social
 * {
 *   "provider": "google",
 *   "token": "GOOGLE_ACCESS_TOKEN"
 * }
 */

import * as WebBrowser from 'expo-web-browser';

// Complete auth session for redirect
WebBrowser.maybeCompleteAuthSession();

/**
 * Google Sign-In Result
 */
export interface GoogleSignInResult {
  idToken?: string;
  accessToken: string;
  email: string;
  name: string;
  photo: string | null;
}

/**
 * Check if Google Sign-In is available
 * With expo-auth-session, it's always available
 */
export const isGoogleSignInAvailable = (): boolean => {
  return true;
};

/**
 * Check Google Play Services (not needed for web OAuth)
 */
export const checkGooglePlayServices = async (): Promise<boolean> => {
  return true;
};

/**
 * Sign in with Google (placeholder - actual implementation in hook)
 * This function is kept for backward compatibility but should use useGoogleAuth hook
 */
export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  throw new Error('Please use useGoogleAuth hook instead of direct signInWithGoogle call');
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async (): Promise<void> => {
  console.log('[Google Sign-In] Sign out (expo-auth-session)');
  // No persistent session in expo-auth-session
};

/**
 * Get current user (not supported in expo-auth-session)
 */
export const getCurrentUser = async (): Promise<any> => {
  return null;
};

/**
 * Check if user is signed in (not needed for expo-auth-session)
 */
export const isSignedIn = async (): Promise<boolean> => {
  return false;
};

export default {
  isGoogleSignInAvailable,
  checkGooglePlayServices,
  signInWithGoogle,
  signOutFromGoogle,
  getCurrentUser,
  isSignedIn,
};
