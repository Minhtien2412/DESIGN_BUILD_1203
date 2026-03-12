/**
 * TappableUser - Reusable tappable author/seller component
 * =========================================================
 * Wraps a user avatar + name making them tappable.
 * - Tap → navigate to /profile/[userId]
 * - Long press → show ProfilePreviewPopup
 *
 * Use this anywhere you display a username or avatar.
 * @created 2026-02-07
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from "react-native";

import { ProfilePreviewPopup } from "@/components/ui/ProfilePreviewPopup";

// ============================================================================
// TYPES
// ============================================================================
export interface TappableUserProps {
  /** User ID for navigation. If missing, tap is disabled */
  userId?: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatar?: string;
  /** Show verified badge */
  verified?: boolean;
  /** Role label */
  role?: string;
  /** Layout direction */
  direction?: "row" | "column";
  /** Avatar size */
  avatarSize?: number;
  /** Whether to show the avatar */
  showAvatar?: boolean;
  /** Whether to show the name */
  showName?: boolean;
  /** Whether to show the role */
  showRole?: boolean;
  /** Whether long-press shows profile popup */
  enablePreview?: boolean;
  /** Font size for name */
  nameFontSize?: number;
  /** Custom style for container */
  style?: StyleProp<ViewStyle>;
  /** Custom style for name text */
  nameStyle?: StyleProp<TextStyle>;
  /** Custom color override for name */
  nameColor?: string;
  /** Max lines for name */
  nameNumberOfLines?: number;
  /** Children (extra content to render after avatar/name) */
  children?: React.ReactNode;
}

// ============================================================================
// COLORS
// ============================================================================
const C = {
  teal: "#0D9488",
  textDark: "#E4E6EB",
  textLight: "#1C1E21",
  textMutedDark: "#B0B3B8",
  textMutedLight: "#65676B",
  bgDark: "#242526",
  bgLight: "#FFFFFF",
};

// ============================================================================
// COMPONENT
// ============================================================================
export const TappableUser = memo(
  ({
    userId,
    name,
    avatar,
    verified = false,
    role,
    direction = "row",
    avatarSize = 40,
    showAvatar = true,
    showName = true,
    showRole = false,
    enablePreview = true,
    nameFontSize = 14,
    style,
    nameStyle,
    nameColor,
    nameNumberOfLines = 1,
    children,
  }: TappableUserProps) => {
    const router = useRouter();
    const cs = useColorScheme();
    const isDark = cs === "dark";
    const [showPreview, setShowPreview] = useState(false);

    const handlePress = useCallback(() => {
      if (!userId) return;
      router.push(`/profile/${userId}` as any);
    }, [userId, router]);

    const handleLongPress = useCallback(() => {
      if (!userId || !enablePreview) return;
      setShowPreview(true);
    }, [userId, enablePreview]);

    const resolvedNameColor = nameColor || (isDark ? C.textDark : C.textLight);

    const isRow = direction === "row";

    return (
      <>
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          activeOpacity={userId ? 0.7 : 1}
          disabled={!userId}
          style={[isRow ? s.containerRow : s.containerCol, style]}
        >
          {showAvatar && (
            <View>
              <Image
                source={{
                  uri:
                    avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`,
                }}
                style={[
                  s.avatar,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                  },
                ]}
                contentFit="cover"
              />
            </View>
          )}
          {showName && (
            <View
              style={[
                isRow ? s.nameContainerRow : s.nameContainerCol,
                !showAvatar && { marginLeft: 0 },
              ]}
            >
              <View style={s.nameRow}>
                <Text
                  style={[
                    s.name,
                    {
                      fontSize: nameFontSize,
                      color: resolvedNameColor,
                    },
                    nameStyle,
                  ]}
                  numberOfLines={nameNumberOfLines}
                >
                  {name}
                </Text>
                {verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={Math.max(12, nameFontSize - 2)}
                    color={C.teal}
                    style={{ marginLeft: 3 }}
                  />
                )}
              </View>
              {showRole && role && (
                <Text
                  style={[s.role, isDark && { color: C.textMutedDark }]}
                  numberOfLines={1}
                >
                  {role}
                </Text>
              )}
            </View>
          )}
          {children}
        </TouchableOpacity>

        {/* Profile preview popup */}
        {enablePreview && showPreview && userId && (
          <ProfilePreviewPopup
            userId={userId}
            visible={showPreview}
            onClose={() => setShowPreview(false)}
          />
        )}
      </>
    );
  },
);

TappableUser.displayName = "TappableUser";

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  containerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  containerCol: {
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#E0E0E0",
  },
  nameContainerRow: {
    marginLeft: 8,
    flex: 1,
  },
  nameContainerCol: {
    marginTop: 4,
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontWeight: "600",
    flexShrink: 1,
  },
  role: {
    fontSize: 11,
    color: C.textMutedLight,
    marginTop: 1,
  },
});
