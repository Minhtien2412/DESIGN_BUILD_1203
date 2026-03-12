/**
 * Social Login Buttons Component
 * Google, Facebook, Zalo OAuth login buttons
 *
 * @module components/auth/SocialLoginButtons
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    BORDER_RADIUS,
    COLORS,
    SPACING,
    TYPOGRAPHY,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { post } from "../../services/api";

// Warm up the browser for better UX
WebBrowser.maybeCompleteAuthSession();

/**
 * Social provider types
 */
type SocialProvider = "GOOGLE" | "FACEBOOK" | "ZALO";

/**
 * Props for SocialLoginButtons
 */
interface SocialLoginButtonsProps {
  /** Called after successful social login */
  onSuccess?: (data: { user: any; isNewUser: boolean }) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Whether to show divider with "or" text */
  showDivider?: boolean;
  /** Custom style */
  style?: object;
  /** Enable/disable specific providers */
  enabledProviders?: SocialProvider[];
}

/**
 * Social Login Buttons - Google, Facebook, Zalo
 */
export function SocialLoginButtons({
  onSuccess,
  onError,
  showDivider = true,
  style,
  enabledProviders = ["GOOGLE", "FACEBOOK", "ZALO"],
}: SocialLoginButtonsProps) {
  const { restoreSessionFromBiometric } = useAuth();
  const [loading, setLoading] = useState<SocialProvider | null>(null);

  // Google OAuth configuration
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

  // Facebook OAuth configuration
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "",
  });

  /**
   * Handle social login response from backend
   */
  const handleSocialAuth = useCallback(
    async (provider: SocialProvider, token: string) => {
      try {
        const response = await post<{
          accessToken: string;
          refreshToken: string;
          user: {
            id: number;
            email: string;
            name: string;
            role: string;
            isNewUser: boolean;
          };
        }>("/auth/social/login", {
          provider,
          token,
        });

        // Update auth context with tokens
        await restoreSessionFromBiometric(
          response.accessToken,
          response.refreshToken,
        );

        onSuccess?.({
          user: response.user,
          isNewUser: response.user.isNewUser,
        });
      } catch (error: any) {
        const message = error?.message || `${provider} login failed`;
        onError?.(message);
        Alert.alert("Login Failed", message);
      } finally {
        setLoading(null);
      }
    },
    [restoreSessionFromBiometric, onSuccess, onError],
  );

  /**
   * Google Sign In
   */
  const handleGoogleLogin = useCallback(async () => {
    if (loading) return;
    setLoading("GOOGLE");

    try {
      const result = await googlePromptAsync();

      if (result.type === "success" && result.authentication?.idToken) {
        await handleSocialAuth("GOOGLE", result.authentication.idToken);
      } else if (result.type === "cancel") {
        setLoading(null);
      } else {
        throw new Error("Google authentication failed");
      }
    } catch (error: any) {
      setLoading(null);
      onError?.(error.message || "Google login failed");
    }
  }, [loading, googlePromptAsync, handleSocialAuth, onError]);

  /**
   * Facebook Sign In
   */
  const handleFacebookLogin = useCallback(async () => {
    if (loading) return;
    setLoading("FACEBOOK");

    try {
      const result = await fbPromptAsync();

      if (result.type === "success" && result.authentication?.accessToken) {
        await handleSocialAuth("FACEBOOK", result.authentication.accessToken);
      } else if (result.type === "cancel") {
        setLoading(null);
      } else {
        throw new Error("Facebook authentication failed");
      }
    } catch (error: any) {
      setLoading(null);
      onError?.(error.message || "Facebook login failed");
    }
  }, [loading, fbPromptAsync, handleSocialAuth, onError]);

  /**
   * Zalo Sign In (requires Zalo SDK)
   */
  const handleZaloLogin = useCallback(async () => {
    if (loading) return;
    setLoading("ZALO");

    try {
      // Zalo doesn't have expo-auth-session support
      // Use WebBrowser for OAuth flow
      const zaloAppId = process.env.EXPO_PUBLIC_ZALO_APP_ID;
      const redirectUri = "myapp://auth/zalo/callback";
      const authUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${zaloAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${Date.now()}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      if (result.type === "success" && result.url) {
        // Extract access token from callback URL
        const url = new URL(result.url);
        const accessToken = url.searchParams.get("access_token");

        if (accessToken) {
          await handleSocialAuth("ZALO", accessToken);
        } else {
          throw new Error("No access token received from Zalo");
        }
      } else if (result.type === "cancel") {
        setLoading(null);
      } else {
        throw new Error("Zalo authentication failed");
      }
    } catch (error: any) {
      setLoading(null);
      onError?.(error.message || "Zalo login failed");
      // For development, show info about Zalo setup
      if (__DEV__) {
        Alert.alert(
          "Zalo Login",
          "Zalo OAuth requires app registration at developers.zalo.me",
        );
      }
    }
  }, [loading, handleSocialAuth, onError]);

  return (
    <View style={[styles.container, style]}>
      {showDivider && (
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc tiếp tục với</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      <View style={styles.buttons}>
        {/* Google Button */}
        {enabledProviders.includes("GOOGLE") && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.googleButton,
              loading === "GOOGLE" && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={!!loading || !googleRequest}
            activeOpacity={0.7}
          >
            {loading === "GOOGLE" ? (
              <ActivityIndicator size="small" color="#EA4335" />
            ) : (
              <>
                <GoogleIcon />
                <Text style={[styles.buttonText, styles.googleText]}>
                  Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Facebook Button */}
        {enabledProviders.includes("FACEBOOK") && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.facebookButton,
              loading === "FACEBOOK" && styles.buttonDisabled,
            ]}
            onPress={handleFacebookLogin}
            disabled={!!loading || !fbRequest}
            activeOpacity={0.7}
          >
            {loading === "FACEBOOK" ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <Text style={[styles.buttonText, styles.facebookText]}>
                  Facebook
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Zalo Button */}
        {enabledProviders.includes("ZALO") && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.zaloButton,
              loading === "ZALO" && styles.buttonDisabled,
            ]}
            onPress={handleZaloLogin}
            disabled={!!loading}
            activeOpacity={0.7}
          >
            {loading === "ZALO" ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ZaloIcon />
                <Text style={[styles.buttonText, styles.zaloText]}>Zalo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/**
 * Google Icon (SVG-like using View)
 */
function GoogleIcon() {
  return (
    <View style={googleIconStyles.container}>
      <View style={[googleIconStyles.part, googleIconStyles.blue]} />
      <View style={[googleIconStyles.part, googleIconStyles.red]} />
      <View style={[googleIconStyles.part, googleIconStyles.yellow]} />
      <View style={[googleIconStyles.part, googleIconStyles.green]} />
      <Text style={googleIconStyles.letter}>G</Text>
    </View>
  );
}

const googleIconStyles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  part: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  blue: { top: 0, right: 0, backgroundColor: "#4285F4" },
  red: { bottom: 0, right: 0, backgroundColor: "#EA4335" },
  yellow: { bottom: 0, left: 0, backgroundColor: "#FBBC05" },
  green: { top: 0, left: 0, backgroundColor: "#34A853" },
  letter: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4285F4",
    zIndex: 1,
  },
});

/**
 * Zalo Icon
 */
function ZaloIcon() {
  return (
    <View style={zaloIconStyles.container}>
      <Text style={zaloIconStyles.text}>Z</Text>
    </View>
  );
}

const zaloIconStyles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0068FF",
  },
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: "600",
  },
  // Google
  googleButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleText: {
    color: COLORS.text,
  },
  // Facebook
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  facebookText: {
    color: "#fff",
  },
  // Zalo
  zaloButton: {
    backgroundColor: "#0068FF",
  },
  zaloText: {
    color: "#fff",
  },
});

export default SocialLoginButtons;
