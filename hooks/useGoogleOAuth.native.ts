/**
 * Google OAuth for React Native (Expo)
 *
 * IMPORTANT: This uses expo-auth-session, NOT @react-oauth/google
 * @react-oauth/google is for React Web ONLY and will NOT work in React Native
 *
 * Setup Guide:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials
 * 2. Create OAuth 2.0 Client IDs for:
 *    - Android (Package name: com.adminmarketingnx.APP_DESIGN_BUILD)
 *    - iOS (Bundle ID: com.adminmarketingnx.APP_DESIGN_BUILD)
 *    - Web (for expo-auth-session proxy)
 * 3. Add to .env:
 *    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
 *    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
 *    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
 *
 * Flow Types:
 * - Authorization Code Flow: Returns code to exchange on backend (RECOMMENDED)
 * - Implicit Flow: Returns access_token directly (client-only)
 */

import ENV from "@/config/env";
import { ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

// Complete auth session for better UX
WebBrowser.maybeCompleteAuthSession();

export type GoogleOAuthFlow = "auth-code" | "implicit";

export interface GoogleAuthResult {
  type: "success" | "cancel" | "error";
  code?: string; // Authorization code (for backend exchange)
  accessToken?: string; // Access token (for client-side)
  idToken?: string; // ID token (contains user info JWT)
  error?: string;
}

export interface UseGoogleOAuthOptions {
  flow?: GoogleOAuthFlow;
  scopes?: string[];
  onSuccess?: (result: GoogleAuthResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Google OAuth Hook for React Native
 *
 * @example Authorization Code Flow (Recommended for backend)
 * ```tsx
 * const { signIn, loading } = useGoogleOAuth({
 *   flow: 'auth-code',
 *   onSuccess: async ({ code }) => {
 *     // Send code to backend
 *     const response = await fetch('/api/auth/google', {
 *       method: 'POST',
 *       body: JSON.stringify({ code })
 *     });
 *   }
 * });
 * ```
 *
 * @example Implicit Flow (For client-only apps)
 * ```tsx
 * const { signIn } = useGoogleOAuth({
 *   flow: 'implicit',
 *   onSuccess: async ({ accessToken }) => {
 *     // Use token to fetch user info
 *     const userInfo = await fetchGoogleUserInfo(accessToken);
 *   }
 * });
 * ```
 */
export function useGoogleOAuth(options: UseGoogleOAuthOptions = {}) {
  const {
    flow = "auth-code",
    scopes = ["profile", "email", "openid"],
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get Google Client IDs from env
  const webClientId =
    (ENV as any).GOOGLE_WEB_CLIENT_ID || (ENV as any).GOOGLE_CLIENT_ID;
  const androidClientId = (ENV as any).GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = (ENV as any).GOOGLE_IOS_CLIENT_ID;

  // Validate configuration
  useEffect(() => {
    if (!webClientId) {
      console.error(
        "❌ [Google OAuth] Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env",
      );
    }
    if (Platform.OS === "android" && !androidClientId) {
      console.warn(
        "⚠️ [Google OAuth] Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID - using web client ID as fallback",
      );
    }
    if (Platform.OS === "ios" && !iosClientId) {
      console.warn(
        "⚠️ [Google OAuth] Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID - using web client ID as fallback",
      );
    }
  }, [webClientId, androidClientId, iosClientId]);

  // Configure response type based on flow
  const responseType =
    flow === "auth-code" ? ResponseType.Code : ResponseType.Token;

  // Guard against missing expo-auth-session (e.g., in Expo Go)
  const maybeUseAuthRequest: any =
    Google && (Google as any).useAuthRequest
      ? (Google as any).useAuthRequest
      : (_options: any) => {
          const fallbackPrompt = async () => {
            const msg =
              "⚠️ Google Sign-in không khả dụng trong Expo Go.\n\nĐể test Google OAuth, bạn cần tạo development build:\n\n1. Cài EAS CLI: npm install -g eas-cli\n2. Build: eas build --profile development --platform android\n3. Cài APK và test";
            Alert.alert("Google Sign-in không khả dụng", msg);
            return { type: "error" };
          };
          return [null, null, fallbackPrompt];
        };

  const [request, response, promptAsync] = maybeUseAuthRequest({
    clientId: webClientId,
    iosClientId: iosClientId || webClientId,
    androidClientId: androidClientId || webClientId,
    scopes,
    responseType,
    usePKCE: flow === "auth-code", // Use PKCE for auth-code flow (more secure)
    // For web, expo-auth-session uses redirect URL automatically
    redirectUri: undefined, // expo-auth-session handles this
  });

  // Handle OAuth response
  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      console.log("✅ [Google OAuth] Success!");

      const result: GoogleAuthResult = {
        type: "success",
      };

      if (flow === "auth-code") {
        // Authorization Code Flow
        result.code = response.params.code;
        console.log(
          "[Google OAuth] Authorization code received:",
          !!result.code,
        );
      } else {
        // Implicit Flow
        result.accessToken = response.params.access_token;
        result.idToken = response.params.id_token;
        console.log(
          "[Google OAuth] Access token received:",
          !!result.accessToken,
        );
      }

      onSuccess?.(result);
      setLoading(false);
    } else if (response.type === "cancel") {
      console.log("⚠️ [Google OAuth] User cancelled");
      const cancelError = new Error("Người dùng đã hủy đăng nhập Google");
      setError(cancelError);
      onError?.(cancelError);
      setLoading(false);
    } else if (response.type === "error") {
      console.error("❌ [Google OAuth] Error:", response.error);
      const authError = new Error(
        response.error?.message || "Đăng nhập Google thất bại",
      );
      setError(authError);
      onError?.(authError);
      setLoading(false);
    }
  }, [response, flow, onSuccess, onError]);

  const signIn = async () => {
    if (!request) {
      const configError = new Error(
        "Google OAuth chưa được cấu hình đúng. Vui lòng kiểm tra Client ID trong .env",
      );
      console.error("❌ [Google OAuth]", configError.message);
      setError(configError);
      onError?.(configError);

      Alert.alert(
        "Lỗi cấu hình Google OAuth",
        "Thiếu Google Client ID. Vui lòng kiểm tra file .env:\n\n" +
          "EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxx\n" +
          "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx\n" +
          "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx",
      );
      return;
    }

    try {
      console.log("🚀 [Google OAuth] Starting sign-in flow...");
      console.log("[Google OAuth] Platform:", Platform.OS);
      console.log("[Google OAuth] Flow:", flow);
      console.log("[Google OAuth] Client IDs configured:", {
        web: !!webClientId,
        android: !!androidClientId,
        ios: !!iosClientId,
      });

      setLoading(true);
      setError(null);
      await promptAsync();
    } catch (err) {
      console.error("❌ [Google OAuth] Exception:", err);
      const promptError =
        err instanceof Error
          ? err
          : new Error("Không thể bắt đầu đăng nhập Google");
      setError(promptError);
      onError?.(promptError);
      setLoading(false);

      Alert.alert("Lỗi đăng nhập", promptError.message);
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
 * Fetch Google user info using access token (for implicit flow)
 *
 * @example
 * ```tsx
 * const userInfo = await fetchGoogleUserInfo(accessToken);
 * console.log(userInfo.email, userInfo.name, userInfo.picture);
 * ```
 */
export async function fetchGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Google user info");
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
  } catch (error) {
    console.error("❌ [Google OAuth] Failed to fetch user info:", error);
    throw error;
  }
}
