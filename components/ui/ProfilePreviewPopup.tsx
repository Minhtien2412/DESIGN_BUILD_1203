/**
 * ProfilePreviewPopup - Livebox / Popup for quick user profile preview
 * ====================================================================
 * Shows a mini-profile card as a bottom sheet modal.
 * Features: avatar, name, role, rating, stats, online status.
 * Actions: View full profile, Message, Call.
 *
 * @created 2026-02-07
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import Animated, {
    SlideInDown,
    SlideOutDown
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getUserById, type UserProfile } from "@/services/api/users.service";

// ============================================================================
// COLORS
// ============================================================================
const C = {
  teal: "#0D9488",
  tealLight: "#14B8A6",
  blue: "#0068FF",
  green: "#00B14F",
  orange: "#F59E0B",
  textDark: "#E4E6EB",
  textLight: "#1C1E21",
  textMutedDark: "#B0B3B8",
  textMutedLight: "#65676B",
  bgDark: "#242526",
  bgLight: "#FFFFFF",
  surfaceDark: "#3A3B3C",
  overlayDark: "rgba(0,0,0,0.6)",
  overlayLight: "rgba(0,0,0,0.45)",
};

// ============================================================================
// ROLE DISPLAY HELPER
// ============================================================================
const ROLE_MAP: Record<string, { label: string; color: string; icon: string }> =
  {
    CLIENT: { label: "Khách hàng", color: "#0D9488", icon: "person" },
    ENGINEER: { label: "Kỹ sư", color: "#8B5CF6", icon: "construct" },
    ADMIN: {
      label: "Quản trị viên",
      color: "#EF4444",
      icon: "shield-checkmark",
    },
    SELLER: { label: "Người bán", color: "#F59E0B", icon: "storefront" },
    CONTRACTOR: { label: "Nhà thầu", color: "#0D9488", icon: "build" },
    ARCHITECT: { label: "Kiến trúc sư", color: "#6366F1", icon: "easel" },
    DESIGNER: { label: "Thiết kế", color: "#EC4899", icon: "color-palette" },
    WORKER: { label: "Thợ thi công", color: "#10B981", icon: "hammer" },
  };

const getRoleInfo = (role?: string) =>
  ROLE_MAP[role || ""] || {
    label: role || "Thành viên",
    color: "#6B7280",
    icon: "person",
  };

// ============================================================================
// COMPONENT
// ============================================================================
interface Props {
  userId: string;
  visible: boolean;
  onClose: () => void;
}

export const ProfilePreviewPopup = memo(
  ({ userId, visible, onClose }: Props) => {
    const router = useRouter();
    const cs = useColorScheme();
    const isDark = cs === "dark";
    const insets = useSafeAreaInsets();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!visible || !userId) return;
      setLoading(true);
      getUserById(userId)
        .then((data) => setUser(data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }, [userId, visible]);

    const handleViewProfile = useCallback(() => {
      onClose();
      setTimeout(() => {
        router.push(`/profile/${userId}` as any);
      }, 200);
    }, [userId, router, onClose]);

    const handleMessage = useCallback(() => {
      onClose();
      setTimeout(() => {
        router.push(`/chat/${userId}` as any);
      }, 200);
    }, [userId, router, onClose]);

    const handleCall = useCallback(() => {
      onClose();
      setTimeout(() => {
        router.push(`/call/voice?userId=${userId}` as any);
      }, 200);
    }, [userId, router, onClose]);

    const bg = isDark ? C.bgDark : C.bgLight;
    const text = isDark ? C.textDark : C.textLight;
    const muted = isDark ? C.textMutedDark : C.textMutedLight;
    const surface = isDark ? C.surfaceDark : "#F3F4F6";
    const roleInfo = getRoleInfo(user?.role);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable
          style={[
            s.overlay,
            isDark
              ? { backgroundColor: C.overlayDark }
              : { backgroundColor: C.overlayLight },
          ]}
          onPress={onClose}
        >
          <Pressable
            style={{ width: "100%" }}
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View
              entering={SlideInDown.springify().damping(18)}
              exiting={SlideOutDown.duration(200)}
              style={[
                s.card,
                { backgroundColor: bg, paddingBottom: insets.bottom + 16 },
              ]}
            >
              {/* Handle bar */}
              <View style={s.handleBar} />

              {loading ? (
                <View style={s.loadingContainer}>
                  <ActivityIndicator size="large" color={C.teal} />
                  <Text style={[s.loadingText, { color: muted }]}>
                    Đang tải...
                  </Text>
                </View>
              ) : !user ? (
                <View style={s.loadingContainer}>
                  <Ionicons name="person-outline" size={40} color={muted} />
                  <Text style={[s.loadingText, { color: muted }]}>
                    Không tìm thấy người dùng
                  </Text>
                </View>
              ) : (
                <>
                  {/* User info header */}
                  <View style={s.userHeader}>
                    <View style={s.avatarContainer}>
                      <Image
                        source={{
                          uri:
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`,
                        }}
                        style={s.avatar}
                        contentFit="cover"
                      />
                      {/* Online indicator */}
                      <View
                        style={[
                          s.onlineDot,
                          {
                            backgroundColor: user.online ? C.green : "#9CA3AF",
                          },
                        ]}
                      />
                    </View>

                    <View style={s.userInfo}>
                      <View style={s.nameRow}>
                        <Text
                          style={[s.userName, { color: text }]}
                          numberOfLines={1}
                        >
                          {user.name}
                        </Text>
                        {user.verified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={C.teal}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>

                      {/* Role badge */}
                      <View
                        style={[
                          s.roleBadge,
                          { backgroundColor: roleInfo.color + "18" },
                        ]}
                      >
                        <Ionicons
                          name={roleInfo.icon as any}
                          size={12}
                          color={roleInfo.color}
                        />
                        <Text style={[s.roleText, { color: roleInfo.color }]}>
                          {roleInfo.label}
                        </Text>
                      </View>

                      {user.company && (
                        <Text
                          style={[s.company, { color: muted }]}
                          numberOfLines={1}
                        >
                          {user.position ? `${user.position} • ` : ""}
                          {user.company}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Bio */}
                  {user.bio && (
                    <Text style={[s.bio, { color: muted }]} numberOfLines={3}>
                      {user.bio}
                    </Text>
                  )}

                  {/* Stats row */}
                  <View style={[s.statsRow, { backgroundColor: surface }]}>
                    <StatItem
                      label="Dự án"
                      value={user.projectsCount || 0}
                      icon="briefcase-outline"
                      color={C.teal}
                    />
                    <View
                      style={[s.statDivider, { backgroundColor: muted + "30" }]}
                    />
                    <StatItem
                      label="Đánh giá"
                      value={user.rating ? `${user.rating}★` : "—"}
                      icon="star-outline"
                      color={C.orange}
                    />
                    <View
                      style={[s.statDivider, { backgroundColor: muted + "30" }]}
                    />
                    <StatItem
                      label="Theo dõi"
                      value={formatCompact(user.followersCount || 0)}
                      icon="people-outline"
                      color={C.blue}
                    />
                    {user.yearsExperience && (
                      <>
                        <View
                          style={[
                            s.statDivider,
                            { backgroundColor: muted + "30" },
                          ]}
                        />
                        <StatItem
                          label="Năm KN"
                          value={user.yearsExperience}
                          icon="time-outline"
                          color="#8B5CF6"
                        />
                      </>
                    )}
                  </View>

                  {/* Action buttons */}
                  <View style={s.actionsRow}>
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: C.teal }]}
                      onPress={handleViewProfile}
                    >
                      <Ionicons name="person" size={16} color="#FFF" />
                      <Text style={s.actionBtnText}>Xem trang cá nhân</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.actionBtnSecondary, { borderColor: C.blue }]}
                      onPress={handleMessage}
                    >
                      <Ionicons name="chatbubble" size={14} color={C.blue} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.actionBtnSecondary, { borderColor: C.green }]}
                      onPress={handleCall}
                    >
                      <Ionicons name="call" size={14} color={C.green} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

ProfilePreviewPopup.displayName = "ProfilePreviewPopup";

// ============================================================================
// STAT ITEM
// ============================================================================
const StatItem = memo(
  ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: string | number;
    icon: string;
    color: string;
  }) => (
    <View style={s.statItem}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  ),
);

// ============================================================================
// HELPERS
// ============================================================================
const formatCompact = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    minHeight: 300,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#9CA3AF",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  // User header
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E5E7EB",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: "#FFF",
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  company: {
    fontSize: 12,
    marginTop: 3,
  },
  // Bio
  bio: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  // Actions
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtnSecondary: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
