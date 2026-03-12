/**
 * Message Status Indicator Component
 * ===================================
 *
 * Hiển thị trạng thái tin nhắn:
 * - Sending (đang gửi)
 * - Sent (đã gửi)
 * - Delivered (đã nhận)
 * - Read (đã xem)
 * - Failed (thất bại)
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native";

import Colors from "@/constants/Colors";

// ============================================
// TYPES
// ============================================

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface MessageStatusIndicatorProps {
  /** Trạng thái tin nhắn */
  status: MessageStatus;
  /** Kích thước icon */
  size?: number;
  /** Màu cho trạng thái read */
  readColor?: string;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MessageStatusIndicator({
  status,
  size = 14,
  readColor = Colors.light.primary,
  style,
}: MessageStatusIndicatorProps) {
  const renderIcon = () => {
    switch (status) {
      case "sending":
        return (
          <ActivityIndicator
            size={size * 0.8}
            color={Colors.light.textSecondary}
          />
        );

      case "sent":
        return (
          <Ionicons
            name="checkmark"
            size={size}
            color={Colors.light.textSecondary}
          />
        );

      case "delivered":
        return (
          <Ionicons
            name="checkmark-done"
            size={size}
            color={Colors.light.textSecondary}
          />
        );

      case "read":
        return <Ionicons name="checkmark-done" size={size} color={readColor} />;

      case "failed":
        return (
          <Ionicons
            name="alert-circle"
            size={size}
            color={Colors.light.error}
          />
        );

      default:
        return null;
    }
  };

  return <View style={[styles.container, style]}>{renderIcon()}</View>;
}

// ============================================
// CONVENIENCE COMPONENTS
// ============================================

/** Sending status */
export const SendingStatus: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size,
  style,
}) => <MessageStatusIndicator status="sending" size={size} style={style} />;

/** Sent status */
export const SentStatus: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size,
  style,
}) => <MessageStatusIndicator status="sent" size={size} style={style} />;

/** Delivered status */
export const DeliveredStatus: React.FC<{
  size?: number;
  style?: ViewStyle;
}> = ({ size, style }) => (
  <MessageStatusIndicator status="delivered" size={size} style={style} />
);

/** Read status */
export const ReadStatus: React.FC<{
  size?: number;
  color?: string;
  style?: ViewStyle;
}> = ({ size, color, style }) => (
  <MessageStatusIndicator
    status="read"
    size={size}
    readColor={color}
    style={style}
  />
);

/** Failed status */
export const FailedStatus: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size,
  style,
}) => <MessageStatusIndicator status="failed" size={size} style={style} />;

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Get status từ message data
 */
export function getMessageStatus(message: {
  status?: string;
  readAt?: Date | null;
  deliveredAt?: Date | null;
  sentAt?: Date | null;
}): MessageStatus {
  if (message.status === "failed") return "failed";
  if (message.status === "sending") return "sending";
  if (message.readAt) return "read";
  if (message.deliveredAt) return "delivered";
  if (message.sentAt) return "sent";
  return "sending";
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 16,
    minHeight: 16,
  },
});

export default MessageStatusIndicator;
