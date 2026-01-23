/**
 * MessageStatus Component
 * =======================
 *
 * Hiển thị trạng thái tin nhắn: sending, sent, delivered, read
 *
 * Features:
 * - Icon states: clock, check, double-check, double-check-blue
 * - Read avatars for group chat
 * - Animated transitions
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

// ============================================================================
// Types
// ============================================================================

export type MessageDeliveryStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface ReadReceipt {
  userId: number;
  userName?: string;
  avatar?: string | null;
  readAt: Date | string;
}

export interface MessageStatusProps {
  /** Trạng thái gửi */
  status: MessageDeliveryStatus;
  /** Người đọc (cho group chat) */
  readBy?: ReadReceipt[];
  /** Show avatars của người đã đọc */
  showReadAvatars?: boolean;
  /** Max avatars to show */
  maxAvatars?: number;
  /** Timestamp */
  timestamp?: Date | string;
  /** Show timestamp */
  showTimestamp?: boolean;
  /** Size */
  size?: "small" | "medium";
  /** Is own message */
  isOwnMessage?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function MessageStatus({
  status,
  readBy = [],
  showReadAvatars = false,
  maxAvatars = 3,
  timestamp,
  showTimestamp = true,
  size = "small",
  isOwnMessage = true,
}: MessageStatusProps) {
  // Theme
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  const iconSize = size === "small" ? 14 : 18;
  const fontSize = size === "small" ? 11 : 13;

  // ============================================
  // Status Icon
  // ============================================

  const StatusIcon = useMemo(() => {
    switch (status) {
      case "sending":
        return (
          <Ionicons
            name="time-outline"
            size={iconSize}
            color={secondaryTextColor}
          />
        );

      case "sent":
        return (
          <Ionicons
            name="checkmark"
            size={iconSize}
            color={secondaryTextColor}
          />
        );

      case "delivered":
        return (
          <View style={styles.doubleCheck}>
            <Ionicons
              name="checkmark"
              size={iconSize}
              color={secondaryTextColor}
              style={{ marginRight: -6 }}
            />
            <Ionicons
              name="checkmark"
              size={iconSize}
              color={secondaryTextColor}
            />
          </View>
        );

      case "read":
        return (
          <View style={styles.doubleCheck}>
            <Ionicons
              name="checkmark"
              size={iconSize}
              color={primaryColor}
              style={{ marginRight: -6 }}
            />
            <Ionicons name="checkmark" size={iconSize} color={primaryColor} />
          </View>
        );

      case "failed":
        return <Ionicons name="alert-circle" size={iconSize} color="#F44336" />;

      default:
        return null;
    }
  }, [status, iconSize, secondaryTextColor, primaryColor]);

  // ============================================
  // Format time
  // ============================================

  const formattedTime = useMemo(() => {
    if (!timestamp) return "";
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [timestamp]);

  // ============================================
  // Read Avatars
  // ============================================

  const ReadAvatars = useMemo(() => {
    if (!showReadAvatars || readBy.length === 0 || status !== "read") {
      return null;
    }

    const displayedReaders = readBy.slice(0, maxAvatars);
    const remainingCount = readBy.length - maxAvatars;

    return (
      <View style={styles.avatarsContainer}>
        {displayedReaders.map((reader, index) => (
          <View
            key={reader.userId}
            style={[
              styles.avatarWrapper,
              {
                marginLeft: index > 0 ? -8 : 0,
                zIndex: displayedReaders.length - index,
              },
            ]}
          >
            {reader.avatar ? (
              <Image
                source={{ uri: reader.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {reader.userName?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
        ))}

        {remainingCount > 0 && (
          <View
            style={[
              styles.avatarWrapper,
              styles.remainingBadge,
              { marginLeft: -8 },
            ]}
          >
            <Text style={styles.remainingText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  }, [showReadAvatars, readBy, maxAvatars, status]);

  // ============================================
  // Render
  // ============================================

  if (!isOwnMessage && !showTimestamp) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Read Avatars */}
      {ReadAvatars}

      {/* Time */}
      {showTimestamp && formattedTime && (
        <Text style={[styles.time, { color: secondaryTextColor, fontSize }]}>
          {formattedTime}
        </Text>
      )}

      {/* Status Icon (only for own messages) */}
      {isOwnMessage && StatusIcon}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  doubleCheck: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    marginRight: 2,
  },

  // Avatars
  avatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
  avatarWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  avatarPlaceholder: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },
  remainingBadge: {
    width: 20,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  remainingText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#666",
  },
});

export default MessageStatus;
