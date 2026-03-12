/**
 * Google OAuth Service
 * Handle Google Sign-In authentication with backend
 */

import ENV from '@/config/env';
import { apiFetch } from './api';

export interface GoogleAuthRequest {
  idToken: string;
  serverAuthCode?: string;
  email?: string;
  name?: string;
  photoUrl?: string;
}

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    avatar?: string;
    role: string;
  };
}

/**
 * Authenticate with Google OAuth token
 * @param authData - Google authentication data from sign-in
 * @returns Authentication result with JWT token
 */
export async function authenticateWithGoogle(
  authData: GoogleAuthRequest
): Promise<GoogleAuthResponse> {
  try {
    console.log('[GoogleOAuth] Authenticating with backend...');
    console.log('[GoogleOAuth] Endpoint:', ENV.AUTH_GOOGLE_PATH);
    
    const response = await apiFetch<GoogleAuthResponse>(ENV.AUTH_GOOGLE_PATH || '/auth/social', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        idToken: authData.idToken,
        deviceInfo: authData.serverAuthCode ? `Mobile - ${authData.serverAuthCode.substring(0, 10)}...` : 'Mobile App',
      }),
    });

    if (response.accessToken && response.user) {
      console.log('[GoogleOAuth] ✅ Authentication successful');
      console.log('[GoogleOAuth] User:', response.user.email, response.user.role);
      return response;
    } else {
      throw new Error('Invalid response from backend');
    }
  } catch (error: any) {
    console.error('[GoogleOAuth] ❌ Authentication failed:', error);
    throw error;
  }
}

/**
 * Verify Google ID Token with backend
 * @param idToken - Google ID token
 * @returns Verification result
 */
export async function verifyGoogleToken(idToken: string): Promise<{
  valid: boolean;
  email?: string;
  name?: string;
  picture?: string;
}> {
  try {
    const response = await apiFetch<any>('/auth/social/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        idToken,
      }),
    });

    return response;
  } catch (error: any) {
    console.error('[GoogleOAuth] Token verification failed:', error);
    return { valid: false };
  }
}
