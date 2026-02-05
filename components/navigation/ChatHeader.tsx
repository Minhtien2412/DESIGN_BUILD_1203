/**
 * ChatHeader - Header chuyên dụng cho màn hình chat/tin nhắn
 * Thiết kế Zalo-style với avatar, status, và các action buttons
 * Tích hợp với SafeArea và keyboard handling
 * @created 2025-02-03
 */

import Avatar from "@/components/ui/avatar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// THEME CONFIG
// ============================================================================
const COLORS = {
  // Zalo-style blue header
  headerBg: "#0068FF",
  headerBgDark: "#0054CC",

  // Gradient colors
  gradientStart: "#0068FF",
  gradientEnd: "#0054CC",

  // Text colors
  white: "#FFFFFF",
  textLight: "rgba(255,255,255,0.85)",
  textMuted: "rgba(255,255,255,0.6)",

  // Status colors
  online: "#22C55E",
  offline: "#94A3B8",
};

const SIZES = {
  headerHeight: 56,
  avatarSize: 40,
  iconSize: 24,
};

// ============================================================================
// TYPES
// ============================================================================
export interface ChatHeaderProps {
  /** Tên người dùng hoặc nhóm */
  title: string;
  /** Subtitle (trạng thái online, đang gõ, ...) */
  subtitle?: string;
  /** Avatar URL */
  avatar?: string | null;
  /** User ID cho avatar fallback */
  userId?: string;
  /** Trạng thái online */
  isOnline?: boolean;
  /** Đang gõ */
  isTyping?: boolean;
  /** Callback khi nhấn back */
  onBackPress?: () => void;
  /** Callback khi nhấn voice call */
  onVoiceCall?: () => void;
  /** Callback khi nhấn video call */
  onVideoCall?: () => void;
  /** Callback khi nhấn profile */
  onProfilePress?: () => void;
  /** Callback khi nhấn more options */
  onMorePress?: () => void;
  /** Ẩn nút call */
  hideCalls?: boolean;
  /** Custom right slot */
  rightSlot?: React.ReactNode;
  /** Style thêm */
  style?: ViewStyle;
}

// ============================================================================
// CHAT HEADER COMPONENT
// ============================================================================
export const ChatHeader = memo(function ChatHeader({
  title,
  subtitle,
  avatar,
  userId = "0",
  isOnline = false,
  isTyping = false,
  onBackPress,
  onVoiceCall,
  onVideoCall,
  onProfilePress,
  onMorePress,
  hideCalls = false,
  rightSlot,
  style,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress]);

  const handleProfile = useCallback(() => {
    if (onProfilePress) {
      onProfilePress();
    } else if (userId) {
      router.push(`/profile/${userId}` as any);
    }
  }, [onProfilePress, userId]);

  const handleVoiceCall = useCallback(() => {
    if (onVoiceCall) {
      onVoiceCall();
    } else if (userId) {
      router.push(`/call/${userId}?type=voice` as any);
    }
  }, [onVoiceCall, userId]);

  const handleVideoCall = useCallback(() => {
    if (onVideoCall) {
      onVideoCall();
    } else if (userId) {
      router.push(`/call/${userId}?type=video` as any);
    }
  }, [onVideoCall, userId]);

  // Status text
  const statusText = isTyping
    ? "Đang nhập..."
    : isOnline
      ? "Đang hoạt động"
      : subtitle || "Offline";

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }, style]}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={SIZES.iconSize}
            color={COLORS.white}
          />
        </TouchableOpacity>

        {/* Avatar + Info */}
        <TouchableOpacity
          style={styles.centerSection}
          onPress={handleProfile}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            <Avatar
              avatar={avatar}
              userId={userId}
              name={title}
              pixelSize={SIZES.avatarSize}
              showBadge={false}
            />
            {/* Online indicator */}
            {isOnline && <View style={styles.onlineIndicator} />}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text
              style={[
                styles.subtitle,
                isOnline && styles.subtitleOnline,
                isTyping && styles.subtitleTyping,
              ]}
            >
              {isTyping && "●  "}
              {statusText}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {rightSlot ? (
            rightSlot
          ) : (
            <>
              {!hideCalls && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleVoiceCall}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={22} color={COLORS.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleVideoCall}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="videocam"
                      size={SIZES.iconSize}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                </>
              )}

              {onMorePress && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onMorePress}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={22}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
});

// ============================================================================
// MESSAGES LIST HEADER
// ============================================================================
export interface MessagesListHeaderProps {
  /** Tiêu đề */
  title?: string;
  /** Số tin nhắn chưa đọc */
  unreadCount?: number;
  /** Callback khi nhấn back */
  onBackPress?: () => void;
  /** Callback khi nhấn tạo mới */
  onNewConversation?: () => void;
  /** Callback khi nhấn search */
  onSearchPress?: () => void;
  /** Style thêm */
  style?: ViewStyle;
}

export const MessagesListHeader = memo(function MessagesListHeader({
  title = "Tin nhắn",
  unreadCount = 0,
  onBackPress,
  onNewConversation,
  onSearchPress,
  style,
}: MessagesListHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress]);

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.listHeader, { paddingTop: insets.top }, style]}
    >
      <View style={styles.listHeaderContent}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={SIZES.iconSize}
            color={COLORS.white}
          />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.listTitleSection}>
          <Text style={styles.listTitle}>
            {title}
            {unreadCount > 0 && (
              <Text style={styles.unreadBadgeText}> ({unreadCount})</Text>
            )}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.listActions}>
          {onSearchPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSearchPress}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={22} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {onNewConversation && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNewConversation}
              activeOpacity={0.7}
            >
              <Ionicons
                name="create-outline"
                size={SIZES.iconSize}
                color={COLORS.white}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
});

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Chat Header
  container: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: SIZES.headerHeight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  centerSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  avatarWrapper: {
    position: "relative",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.gradientStart,
  },
  infoSection: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  subtitleOnline: {
    color: "#7DD3FC",
  },
  subtitleTyping: {
    color: "#FDE047",
    fontStyle: "italic",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Messages List Header
  listHeader: {
    width: "100%",
  },
  listHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: SIZES.headerHeight,
  },
  listTitleSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  unreadBadgeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FDE047",
  },
  listActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export default ChatHeader;
