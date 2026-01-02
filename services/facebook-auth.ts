/**
 * Facebook OAuth Service
 * Handle Facebook Login authentication with backend
 */

import ENV from '@/config/env';
import { apiFetch } from './api';

export interface FacebookAuthRequest {
  accessToken: string;
  userID: string;
  email?: string;
  name?: string;
  photoUrl?: string;
}

export interface FacebookAuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  message?: string;
}

/**
 * Authenticate with Facebook OAuth token
 * @param authData - Facebook authentication data from login
 * @returns Authentication result with JWT token
 */
export async function authenticateWithFacebook(
  authData: FacebookAuthRequest
): Promise<FacebookAuthResponse> {
  try {
    console.log('[FacebookOAuth] Authenticating with backend...');
    
    const response = await apiFetch<FacebookAuthResponse>(ENV.AUTH_FACEBOOK_PATH || '/auth/social', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'facebook',
        accessToken: authData.accessToken,
        userID: authData.userID,
        email: authData.email,
        name: authData.name,
        photoUrl: authData.photoUrl,
      }),
    });

    if (response.success && response.token) {
      console.log('[FacebookOAuth] ✅ Authentication successful');
      return response;
    } else {
      throw new Error(response.message || 'Facebook authentication failed');
    }
  } catch (error: any) {
    console.error('[FacebookOAuth] ❌ Authentication failed:', error);
    throw error;
  }
}

/**
 * Verify Facebook Access Token with backend
 * @param accessToken - Facebook access token
 * @returns Verification result
 */
export async function verifyFacebookToken(accessToken: string): Promise<{
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
        provider: 'facebook',
        accessToken,
      }),
    });

    return response;
  } catch (error: any) {
    console.error('[FacebookOAuth] Token verification failed:', error);
    return { valid: false };
  }
}
