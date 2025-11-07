/**
 * Google OAuth Hook (Expo Auth Session)
 * Uses expo-auth-session for Expo Go compatible Google Sign-In
 * 
 * Backend expects:
 * POST /auth/social
 * {
 *   "provider": "google",
 *   "token": "GOOGLE_ACCESS_TOKEN"
 * }
 */

import ENV from '@/config/env';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthReturn {
  signInWithGoogle: () => Promise<{ token: string; email: string; name?: string; picture?: string }>;
  loading: boolean;
}

/**
 * Google OAuth Hook using expo-auth-session
 * Works in Expo Go without native build
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const [loading, setLoading] = useState(false);

  // Get Google Client ID from env
  const googleClientId = ENV.GOOGLE_CLIENT_ID || '702527545429-60e3mi47s816iu9aus38kb83qgkmkgna.apps.googleusercontent.com';

  // Configure Google OAuth request. Guard against missing provider in some environments.
  const maybeUseAuthRequest: any = (Google && (Google as any).useAuthRequest)
    ? (Google as any).useAuthRequest
    : (options: any) => {
      const fallbackPrompt = async () => {
        const msg = 'Google Sign-in is not available in this environment. Create a development build (not Expo Go) to test native Google Sign-in, or ensure expo-auth-session is installed and configured.';
        try { Alert.alert('Google Sign-in unavailable', msg); } catch(e) { console.warn(msg); }
        return { type: 'error' };
      };
      return [null, null, fallbackPrompt];
    };

  const [request, response, promptAsync] = maybeUseAuthRequest({
    clientId: googleClientId,
    redirectUri: makeRedirectUri({
      scheme: 'com.thietkeresort.app',
    }),
    scopes: ['profile', 'email'],
  });

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('[Google OAuth] Success!');
      console.log('Access Token:', authentication?.accessToken);
    } else if (response?.type === 'error') {
      // Silent log - error is expected when user cancels or OAuth fails
      console.log('[Google OAuth] Error response:', response.error?.message || 'Unknown error');
    } else if (response?.type === 'cancel') {
      console.log('[Google OAuth] User cancelled login');
    }
  }, [response]);

  const signInWithGoogle = async (): Promise<{
    token: string;
    email: string;
    name?: string;
    picture?: string;
  }> => {
    setLoading(true);

    try {
      // Prompt OAuth flow
      const result = await promptAsync();

      if (result.type !== 'success') {
        throw new Error('Đăng nhập Google bị hủy hoặc thất bại');
      }

      const { authentication } = result;

      if (!authentication?.accessToken) {
        throw new Error('Không nhận được access token từ Google');
      }

      // Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Không thể lấy thông tin người dùng từ Google');
      }

      const userInfo = await userInfoResponse.json();

      console.log('✅ Google Sign-In Success:');
      console.log('Access Token:', authentication.accessToken);
      console.log('User Info:', userInfo);

      // Return in format expected by AuthContext
      return {
        token: authentication.accessToken, // Backend will verify this
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };
    } catch (error: any) {
      console.error('useGoogleAuth Error:', error);
      throw new Error(error.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };
  return {
    signInWithGoogle,
    loading,
  };
}