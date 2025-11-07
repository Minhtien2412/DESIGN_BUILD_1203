/**
 * Google OAuth 2.0 Hook
 * 
 * Implements OAuth 2.0 Authorization Code Flow (Recommended)
 * Based on @react-oauth/google best practices
 * 
 * Reference: https://github.com/MomenSherif/react-oauth/issues/12
 * 
 * Flow Types:
 * 1. Authorization Code Flow (RECOMMENDED - Most Secure)
 *    - Returns: code (to be exchanged on backend)
 *    - Backend gets: access_token, refresh_token, id_token
 *    - Use for: Production apps with backend
 * 
 * 2. Implicit Flow (Alternative - Simpler)
 *    - Returns: access_token directly
 *    - Use for: Client-only apps or rapid prototyping
 * 
 * 3. ID Token (GoogleLogin component)
 *    - Returns: credential (JWT ID token)
 *    - Use for: Simple authentication without refresh tokens
 */

import ENV from '@/config/env';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession();

export type GoogleOAuthFlow = 'auth-code' | 'implicit';

export interface GoogleAuthResult {
  type: 'success' | 'cancel' | 'error';
  code?: string; // Authorization code (auth-code flow)
  accessToken?: string; // Access token (implicit flow)
  idToken?: string; // ID token (contains user info)
  error?: string;
}

export interface UseGoogleOAuthOptions {
  flow?: GoogleOAuthFlow; // Default: 'auth-code'
  scopes?: string[]; // Default: ['profile', 'email']
  onSuccess?: (result: GoogleAuthResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for Google OAuth 2.0 Authentication
 * 
 * @example Authorization Code Flow (Recommended)
 * ```tsx
 * const { signIn, loading } = useGoogleOAuth({
 *   flow: 'auth-code',
 *   onSuccess: async ({ code }) => {
 *     // Send code to backend
 *     await fetch('/api/auth/google/callback', {
 *       method: 'POST',
 *       body: JSON.stringify({ code })
 *     });
 *   }
 * });
 * ```
 * 
 * @example Implicit Flow (Simpler)
 * ```tsx
 * const { signIn } = useGoogleOAuth({
 *   flow: 'implicit',
 *   onSuccess: async ({ accessToken }) => {
 *     // Fetch user info directly
 *     const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
 *       headers: { Authorization: `Bearer ${accessToken}` }
 *     });
 *   }
 * });
 * ```
 */
export function useGoogleOAuth(options: UseGoogleOAuthOptions = {}) {
  const {
    flow = 'auth-code',
    scopes = ['profile', 'email', 'openid'],
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Configure OAuth request based on flow type. Guard against environments where
  // `expo-auth-session/providers/google` may not be available (e.g. Expo Go with some SDK configs).
  const responseType = flow === 'auth-code'
    ? (Google && (Google as any).ResponseType && (Google as any).ResponseType.Code) ?? 'code'
    : (Google && (Google as any).ResponseType && (Google as any).ResponseType.Token) ?? 'token';

  // Provide a safe wrapper that either calls the real hook or a stub fallback.
  // This preserves behavior in environments where Google provider is unavailable
  // and prevents the app from throwing "Cannot read property 'Code' of undefined".
  const maybeUseAuthRequest: any = (Google && (Google as any).useAuthRequest)
    ? (Google as any).useAuthRequest
  : (options: any) => {
      // Fallback: return [request=null, response=null, promptAsync=fallback]
      const fallbackPrompt = async () => {
        const msg = 'Google Sign-in is not available in this environment. To test Google Sign-in and other native modules, create a development build (not Expo Go) or ensure the required package is installed and configured.';
        try {
          Alert.alert('Google Sign-in unavailable', msg);
        } catch (e) {
          // noop in non-ReactNative environments
          // eslint-disable-next-line no-console
          console.warn(msg);
        }
        return { type: 'error' };
      };
      return [null, null, fallbackPrompt];
    };
  const [request, response, promptAsync] = maybeUseAuthRequest({
    clientId: (ENV as any).GOOGLE_CLIENT_ID,
    iosClientId: (ENV as any).GOOGLE_IOS_CLIENT_ID,
    androidClientId: (ENV as any).GOOGLE_ANDROID_CLIENT_ID,
    webClientId: (ENV as any).GOOGLE_WEB_CLIENT_ID,
    scopes,
    responseType,
    // For authorization code flow, we need to use 'postmessage' as redirect
    // This is required for backend token exchange
    redirectUri: flow === 'auth-code' && Platform.OS === 'web'
      ? 'postmessage'
      : undefined,
    usePKCE: flow === 'auth-code', // PKCE for auth-code flow (more secure)
  });

  // Handle OAuth response
  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const result: GoogleAuthResult = {
        type: 'success',
      };

      if (flow === 'auth-code') {
        // Authorization Code Flow
        result.code = response.params.code;
      } else {
        // Implicit Flow
        result.accessToken = response.params.access_token;
        result.idToken = response.params.id_token;
      }

      onSuccess?.(result);
      setLoading(false);
    } else if (response.type === 'cancel') {
      const cancelError = new Error('Google sign-in was cancelled');
      setError(cancelError);
      onError?.(cancelError);
      setLoading(false);
    } else if (response.type === 'error') {
      const authError = new Error(response.error?.message || 'Google sign-in failed');
      setError(authError);
      onError?.(authError);
      setLoading(false);
    }
  }, [response, flow, onSuccess, onError]);

  const signIn = async () => {
    if (!request) {
      const configError = new Error('Google OAuth not configured properly');
      setError(configError);
      onError?.(configError);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await promptAsync();
    } catch (err) {
      const promptError = err instanceof Error ? err : new Error('Failed to start Google sign-in');
      setError(promptError);
      onError?.(promptError);
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    error,
    isReady: !!request,
  };
}

/**
 * Fetch Google user info with access token (for implicit flow)
 * 
 * @example
 * ```tsx
 * const userInfo = await fetchGoogleUserInfo(accessToken);
 * console.log(userInfo.email, userInfo.name, userInfo.picture);
 * ```
 */
export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  const data = await response.json();
  
  return {
    sub: data.sub as string, // Google user ID
    email: data.email as string,
    email_verified: data.email_verified as boolean,
    name: data.name as string,
    given_name: data.given_name as string,
    family_name: data.family_name as string,
    picture: data.picture as string,
    locale: data.locale as string,
  };
}
