/**
 * Google OAuth Hook (Expo Auth Session)
 * Uses expo-auth-session for Expo Go compatible Google Sign-In
 * 
 * UPDATED 2026-01-08: Fixed redirect_uri error 400
 * - Uses AuthSession.AuthRequest with Expo proxy
 * - Works reliably in Expo Go on Android/iOS
 * 
 * REQUIRED in Google Cloud Console:
 * 1. Create OAuth 2.0 Client ID (Web application type)
 * 2. Add redirect URI: https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD
 * 
 * Backend expects:
 * POST /auth/social { "provider": "google", "token": "GOOGLE_ACCESS_TOKEN" }
 */

import ENV from '@/config/env';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

// Complete auth session on app return
WebBrowser.maybeCompleteAuthSession();

// Google OAuth discovery document
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

interface UseGoogleAuthReturn {
  signInWithGoogle: () => Promise<{ token: string; email: string; name?: string; picture?: string }>;
  loading: boolean;
}

/**
 * Google OAuth Hook using expo-auth-session with Expo proxy
 * Works in Expo Go without native build
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const [loading, setLoading] = useState(false);

  const isLocalhostWeb =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  // Select correct OAuth client for each platform.
  // - Web must use GOOGLE_WEB_CLIENT_ID (otherwise redirectUri validation may fail)
  // - Native must use the platform-specific clientId.
  const googleClientId =
    Platform.OS === "web"
      ? ENV.GOOGLE_WEB_CLIENT_ID || ENV.GOOGLE_CLIENT_ID || ""
      : Platform.OS === "android"
        ? ENV.GOOGLE_ANDROID_CLIENT_ID || ENV.GOOGLE_CLIENT_ID || ""
        : ENV.GOOGLE_IOS_CLIENT_ID || ENV.GOOGLE_CLIENT_ID || "";

  // Build redirect URI.
  // - Mobile uses custom scheme
  // - Web uses the current origin + "/redirect" (must be whitelisted in Google Console)
  // In dev (localhost), using Expo proxy is often more reliable because Google redirect whitelist is strict.
  const useProxy = Platform.OS !== 'web' || isLocalhostWeb;
  const redirectUri =
    Platform.OS === "web"
      ? AuthSession.makeRedirectUri({
          path: "redirect",
          ...(useProxy ? ({ useProxy } as any) : {}),
        } as any)
      : AuthSession.makeRedirectUri({
          scheme: "appdesignbuild",
          path: "redirect",
          ...(useProxy ? ({ useProxy } as any) : {}),
        } as any);

  console.log('[Google OAuth] Config:', {
    clientId: googleClientId ? googleClientId.substring(0, 20) + "..." : "",
    redirectUri,
    platform: Platform.OS,
    useProxy,
  });

  /**
   * Sign in with Google using AuthSession.AuthRequest
   * Uses Expo proxy for Expo Go compatibility
   */
  const signInWithGoogle = useCallback(async (): Promise<{
    token: string;
    email: string;
    name?: string;
    picture?: string;
  }> => {
    setLoading(true);

    try {
      console.log('[Google OAuth] Starting OAuth flow...');
      if (!googleClientId) {
        throw new Error("Missing Google OAuth client id for this platform.");
      }

      // Create auth request with proper configuration
      const authRequest = new AuthSession.AuthRequest({
        clientId: googleClientId,
        scopes: ['profile', 'email', 'openid'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        usePKCE: false, // Implicit flow doesn't use PKCE
        extraParams: {
          prompt: 'select_account',
        },
      });

      // Prompt user to authenticate
      const result = await authRequest.promptAsync(
        discovery,
        (useProxy ? ({ useProxy } as any) : undefined) as any,
      );

      console.log('[Google OAuth] Result type:', result.type);

      if (result.type !== 'success') {
        if (result.type === 'dismiss' || result.type === 'cancel') {
          throw new Error('Đăng nhập Google bị hủy bởi người dùng');
        }
        throw new Error('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }

      // Get access token from params
      const accessToken = result.params?.access_token;

      if (!accessToken) {
        console.error('[Google OAuth] No access token in response:', result.params);
        throw new Error('Không nhận được access token từ Google');
      }

      console.log('[Google OAuth] Got access token');

      // Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Không thể lấy thông tin người dùng từ Google');
      }

      const userInfo = await userInfoResponse.json();

      console.log('✅ Google Sign-In Success:', userInfo.email);

      return {
        token: accessToken,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };
    } catch (error: any) {
      console.error('[Google OAuth] Error:', error);
      throw new Error(error.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  }, [googleClientId, redirectUri]);

  return {
    signInWithGoogle,
    loading,
  };
}