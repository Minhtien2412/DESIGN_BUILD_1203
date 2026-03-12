/**
 * Account Linking UI Component
 * Manage linked social accounts (Google, Facebook, Zalo)
 *
 * @module components/auth/AccountLinking
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
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
import { del, get, post } from "../../services/api";

// Complete auth session in browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Social provider type
 */
type SocialProvider = "GOOGLE" | "FACEBOOK" | "ZALO";

/**
 * Linked account info
 */
interface LinkedAccount {
  provider: SocialProvider;
  email?: string;
  linkedAt: string;
}

/**
 * Provider config for UI
 */
const PROVIDER_CONFIG: Record<
  SocialProvider,
  {
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
  }
> = {
  GOOGLE: {
    name: "Google",
    icon: "logo-google",
    color: "#EA4335",
    bgColor: "#FEEAE8",
  },
  FACEBOOK: {
    name: "Facebook",
    icon: "logo-facebook",
    color: "#1877F2",
    bgColor: "#E7F3FF",
  },
  ZALO: {
    name: "Zalo",
    icon: "chatbubbles",
    color: "#0068FF",
    bgColor: "#E5F0FF",
  },
};

/**
 * Props for AccountLinking
 */
interface AccountLinkingProps {
  /** Called when accounts change */
  onAccountsChanged?: (accounts: LinkedAccount[]) => void;
  /** Custom style */
  style?: object;
}

/**
 * Account Linking Management Component
 */
export function AccountLinking({
  onAccountsChanged,
  style,
}: AccountLinkingProps) {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingProvider, setLinkingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [unlinkingProvider, setUnlinkingProvider] =
    useState<SocialProvider | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Google OAuth
  const [googleRequest, , googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  // Facebook OAuth
  const [fbRequest, , fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "",
  });

  /**
   * Fetch linked accounts
   */
  const fetchLinkedAccounts = useCallback(async () => {
    try {
      const accounts = await get<LinkedAccount[]>("/auth/social/accounts");
      setLinkedAccounts(accounts);
      onAccountsChanged?.(accounts);
    } catch (error) {
      console.error("Failed to fetch linked accounts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onAccountsChanged]);

  useEffect(() => {
    fetchLinkedAccounts();
  }, [fetchLinkedAccounts]);

  /**
   * Link a provider
   */
  const linkProvider = useCallback(
    async (provider: SocialProvider, token: string) => {
      try {
        const result = await post<{
          success: boolean;
          linkedProviders: SocialProvider[];
          message: string;
        }>(`/auth/social/link/${provider}`, { token });

        if (result.success) {
          Alert.alert("Thành công", result.message);
          fetchLinkedAccounts();
        }
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể liên kết tài khoản");
      } finally {
        setLinkingProvider(null);
      }
    },
    [fetchLinkedAccounts],
  );

  /**
   * Handle Google linking
   */
  const handleLinkGoogle = useCallback(async () => {
    if (linkingProvider) return;
    setLinkingProvider("GOOGLE");

    try {
      const result = await googlePromptAsync();

      if (result.type === "success" && result.authentication?.idToken) {
        await linkProvider("GOOGLE", result.authentication.idToken);
      } else {
        setLinkingProvider(null);
      }
    } catch (error: any) {
      setLinkingProvider(null);
      Alert.alert("Lỗi", error.message || "Google linking failed");
    }
  }, [linkingProvider, googlePromptAsync, linkProvider]);

  /**
   * Handle Facebook linking
   */
  const handleLinkFacebook = useCallback(async () => {
    if (linkingProvider) return;
    setLinkingProvider("FACEBOOK");

    try {
      const result = await fbPromptAsync();

      if (result.type === "success" && result.authentication?.accessToken) {
        await linkProvider("FACEBOOK", result.authentication.accessToken);
      } else {
        setLinkingProvider(null);
      }
    } catch (error: any) {
      setLinkingProvider(null);
      Alert.alert("Lỗi", error.message || "Facebook linking failed");
    }
  }, [linkingProvider, fbPromptAsync, linkProvider]);

  /**
   * Handle Zalo linking
   */
  const handleLinkZalo = useCallback(async () => {
    if (linkingProvider) return;
    setLinkingProvider("ZALO");

    try {
      const zaloAppId = process.env.EXPO_PUBLIC_ZALO_APP_ID;
      const redirectUri = "myapp://auth/zalo/callback";
      const authUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${zaloAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${Date.now()}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const accessToken = url.searchParams.get("access_token");

        if (accessToken) {
          await linkProvider("ZALO", accessToken);
        } else {
          setLinkingProvider(null);
        }
      } else {
        setLinkingProvider(null);
      }
    } catch (error: any) {
      setLinkingProvider(null);
      Alert.alert("Lỗi", error.message || "Zalo linking failed");
    }
  }, [linkingProvider, linkProvider]);

  /**
   * Unlink a provider
   */
  const handleUnlink = useCallback(
    async (provider: SocialProvider) => {
      const config = PROVIDER_CONFIG[provider];

      Alert.alert(
        "Xác nhận hủy liên kết",
        `Bạn có chắc muốn hủy liên kết tài khoản ${config.name}?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            style: "destructive",
            onPress: async () => {
              setUnlinkingProvider(provider);
              try {
                const result = await del<{
                  success: boolean;
                  message: string;
                }>(`/auth/social/link/${provider}`);

                if (result.success) {
                  Alert.alert("Thành công", result.message);
                  fetchLinkedAccounts();
                }
              } catch (error: any) {
                Alert.alert(
                  "Lỗi",
                  error?.message || "Không thể hủy liên kết tài khoản",
                );
              } finally {
                setUnlinkingProvider(null);
              }
            },
          },
        ],
      );
    },
    [fetchLinkedAccounts],
  );

  /**
   * Check if provider is linked
   */
  const isProviderLinked = (provider: SocialProvider) =>
    linkedAccounts.some((a) => a.provider === provider);

  /**
   * Get handler for linking
   */
  const getLinkHandler = (provider: SocialProvider) => {
    switch (provider) {
      case "GOOGLE":
        return handleLinkGoogle;
      case "FACEBOOK":
        return handleLinkFacebook;
      case "ZALO":
        return handleLinkZalo;
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchLinkedAccounts();
          }}
          colors={[COLORS.primary]}
        />
      }
    >
      <Text style={styles.title}>Tài khoản liên kết</Text>
      <Text style={styles.description}>
        Liên kết tài khoản mạng xã hội để đăng nhập nhanh hơn
      </Text>

      <View style={styles.providerList}>
        {(["GOOGLE", "FACEBOOK", "ZALO"] as SocialProvider[]).map(
          (provider) => {
            const config = PROVIDER_CONFIG[provider];
            const isLinked = isProviderLinked(provider);
            const linkedAccount = linkedAccounts.find(
              (a) => a.provider === provider,
            );
            const isLinking = linkingProvider === provider;
            const isUnlinking = unlinkingProvider === provider;

            return (
              <View key={provider} style={styles.providerItem}>
                {/* Provider Icon */}
                <View
                  style={[
                    styles.providerIcon,
                    { backgroundColor: config.bgColor },
                  ]}
                >
                  <Ionicons name={config.icon} size={24} color={config.color} />
                </View>

                {/* Provider Info */}
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{config.name}</Text>
                  {isLinked && linkedAccount && (
                    <Text style={styles.providerEmail}>
                      {linkedAccount.email ||
                        `Đã liên kết ${formatDate(linkedAccount.linkedAt)}`}
                    </Text>
                  )}
                </View>

                {/* Action Button */}
                {isLinked ? (
                  <TouchableOpacity
                    style={styles.unlinkButton}
                    onPress={() => handleUnlink(provider)}
                    disabled={isUnlinking}
                  >
                    {isUnlinking ? (
                      <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                      <Text style={styles.unlinkText}>Hủy liên kết</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.linkButton, { borderColor: config.color }]}
                    onPress={getLinkHandler(provider)}
                    disabled={isLinking}
                  >
                    {isLinking ? (
                      <ActivityIndicator size="small" color={config.color} />
                    ) : (
                      <Text style={[styles.linkText, { color: config.color }]}>
                        Liên kết
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          },
        )}
      </View>

      {/* Info note */}
      <View style={styles.infoNote}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={COLORS.textSecondary}
        />
        <Text style={styles.infoText}>
          Bạn có thể liên kết nhiều tài khoản để đăng nhập bằng bất kỳ phương
          thức nào
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  providerList: {
    gap: SPACING.md,
  },
  providerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  providerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  providerName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  providerEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  linkButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minWidth: 90,
    alignItems: "center",
  },
  linkText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: "600",
  },
  unlinkButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.errorLight || "#FFE8E8",
    minWidth: 90,
    alignItems: "center",
  },
  unlinkText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: "600",
    color: COLORS.error,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default AccountLinking;
