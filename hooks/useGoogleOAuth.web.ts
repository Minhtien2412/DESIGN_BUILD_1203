/**
 * Google OAuth for Web Platform
 * 
 * DISABLED: expo-auth-session requires WebCrypto API which is restricted
 * to secure origins (localhost or HTTPS). When accessing via http://IP,
 * the PKCE challenge generation fails.
 * 
 * Solution Options:
 * 1. Use localhost:8081 for testing (WebCrypto works)
 * 2. Setup HTTPS with reverse proxy
 * 3. Disable Google Auth for web (this approach)
 * 
 * For production web builds, setup proper HTTPS with domain/SSL certificate.
 */

import { useState } from 'react';
import { Alert } from 'react-native';

export type GoogleOAuthFlow = 'auth-code' | 'implicit';

export interface GoogleAuthResult {
  type: 'success' | 'cancel' | 'error';
  code?: string;
  accessToken?: string;
  idToken?: string;
  error?: string;
}

export interface UseGoogleOAuthOptions {
  flow?: GoogleOAuthFlow;
  scopes?: string[];
  onSuccess?: (result: GoogleAuthResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Web-specific Google OAuth hook (disabled)
 * 
 * Returns a no-op signIn function that shows an alert explaining
 * why Google Sign-in is unavailable on non-secure web origins.
 */
export function useGoogleOAuth(options: UseGoogleOAuthOptions = {}) {
  const { onError } = options;
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    
    const error = new Error(
      'Google Sign-in không khả dụng trên web khi truy cập qua HTTP.\n\n' +
      'Vui lòng sử dụng:\n' +
      '• localhost:8081 để test trên web\n' +
      '• Android/iOS app để sử dụng Google Sign-in\n' +
      '• Hoặc đăng ký/đăng nhập bằng email'
    );

    Alert.alert(
      'Google Sign-in không khả dụng',
      error.message,
      [{ text: 'OK' }]
    );

    if (onError) {
      onError(error);
    }

    setLoading(false);
  };

  return {
    signIn,
    loading,
    error: null,
  };
}
