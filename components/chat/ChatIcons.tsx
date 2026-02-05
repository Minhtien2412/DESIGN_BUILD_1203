/**
 * Chat Icons Component
 * ====================
 *
 * Tập hợp các icon cho hệ thống chat:
 * - Tin nhắn, gọi điện, video call
 * - Trạng thái online/offline
 * - File attachments
 * - Reactions & emojis
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import Colors from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    Ionicons,
    MaterialCommunityIcons
} from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";

// ============================================
// TYPES
// ============================================

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

interface IconProps {
  size?: IconSize;
  color?: string;
  style?: ViewStyle;
}

interface BadgedIconProps extends IconProps {
  badge?: number | boolean;
  badgeColor?: string;
}

interface StatusIconProps extends IconProps {
  status: "online" | "offline" | "busy" | "away";
}

// ============================================
// SIZE MAPPING
// ============================================

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// ============================================
// MESSAGE ICONS
// ============================================

/** Chat message bubble icon */
export const ChatIcon: React.FC<BadgedIconProps> = ({
  size = "md",
  color,
  badge,
  badgeColor = Colors.light.error,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons
        name="chatbubble-ellipses"
        size={SIZE_MAP[size]}
        color={iconColor}
      />
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          {typeof badge === "number" && badge > 0 && (
            <View style={styles.badgeDot} />
          )}
        </View>
      )}
    </View>
  );
};

/** Chat list/messages icon */
export const ChatListIcon: React.FC<BadgedIconProps> = ({
  size = "md",
  color,
  badge,
  badgeColor = Colors.light.error,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name="chatbubbles" size={SIZE_MAP[size]} color={iconColor} />
      {badge && typeof badge === "number" && badge > 0 && (
        <View
          style={[styles.badgeNumber, { backgroundColor: badgeColor }]}
        ></View>
      )}
    </View>
  );
};

/** Send message icon */
export const SendIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.primary;
  return (
    <Ionicons
      name="send"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Message delivered icon */
export const DeliveredIcon: React.FC<IconProps> = ({
  size = "sm",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.textSecondary;
  return (
    <Ionicons
      name="checkmark-done"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Message seen icon */
export const SeenIcon: React.FC<IconProps> = ({
  size = "sm",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.primary;
  return (
    <Ionicons
      name="checkmark-done"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// CALL ICONS
// ============================================

/** Voice call icon */
export const VoiceCallIcon: React.FC<BadgedIconProps> = ({
  size = "md",
  color,
  badge,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name="call" size={SIZE_MAP[size]} color={iconColor} />
      {badge && <View style={styles.missedCallBadge} />}
    </View>
  );
};

/** Video call icon */
export const VideoCallIcon: React.FC<BadgedIconProps> = ({
  size = "md",
  color,
  badge,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name="videocam" size={SIZE_MAP[size]} color={iconColor} />
      {badge && <View style={styles.missedCallBadge} />}
    </View>
  );
};

/** End call icon */
export const EndCallIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.error;
  return (
    <MaterialCommunityIcons
      name="phone-hangup"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Missed call icon */
export const MissedCallIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.error;
  return (
    <MaterialCommunityIcons
      name="phone-missed"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// STATUS ICONS
// ============================================

/** Online status indicator */
export const OnlineStatusIcon: React.FC<StatusIconProps> = ({
  size = "sm",
  status,
  style,
}) => {
  const statusColors = {
    online: Colors.light.success,
    offline: Colors.light.textSecondary,
    busy: Colors.light.error,
    away: Colors.light.warning,
  };

  const iconSize = SIZE_MAP[size];

  return (
    <View
      style={[
        styles.statusDot,
        {
          width: iconSize,
          height: iconSize,
          backgroundColor: statusColors[status],
          borderRadius: iconSize / 2,
        },
        style,
      ]}
    />
  );
};

/** Support agent icon */
export const SupportAgentIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <MaterialCommunityIcons
      name="face-agent"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Customer service icon */
export const CustomerServiceIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.primary;
  return (
    <Ionicons
      name="headset"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// ATTACHMENT ICONS
// ============================================

/** Attachment icon */
export const AttachmentIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="attach"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Image attachment icon */
export const ImageIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="image"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Document/file attachment icon */
export const DocumentIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="document"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Camera icon */
export const CameraIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="camera"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Microphone icon */
export const MicrophoneIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="mic"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Location share icon */
export const LocationIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="location"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// ACTION ICONS
// ============================================

/** More options (3 dots) icon */
export const MoreOptionsIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="ellipsis-vertical"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Delete message icon */
export const DeleteIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.error;
  return (
    <Ionicons
      name="trash"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Archive chat icon */
export const ArchiveIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="archive"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Pin chat icon */
export const PinIcon: React.FC<IconProps> = ({ size = "md", color, style }) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <MaterialCommunityIcons
      name="pin"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Mute/notification off icon */
export const MuteIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="notifications-off"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Search in chat icon */
export const SearchIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="search"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Reply icon */
export const ReplyIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="arrow-undo"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Forward icon */
export const ForwardIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="arrow-redo"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Copy icon */
export const CopyIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="copy"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// EMOJI/REACTION ICONS
// ============================================

/** Emoji picker icon */
export const EmojiIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="happy"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Like/heart reaction */
export const LikeIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = "md",
  color,
  filled = false,
  style,
}) => {
  const iconColor = color || Colors.light.error;
  return (
    <Ionicons
      name={filled ? "heart" : "heart-outline"}
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Thumbs up reaction */
export const ThumbsUpIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = "md",
  color,
  filled = false,
  style,
}) => {
  const iconColor = color || Colors.light.primary;
  return (
    <Ionicons
      name={filled ? "thumbs-up" : "thumbs-up-outline"}
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// GROUP CHAT ICONS
// ============================================

/** Group chat icon */
export const GroupChatIcon: React.FC<BadgedIconProps> = ({
  size = "md",
  color,
  badge,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name="people" size={SIZE_MAP[size]} color={iconColor} />
      {badge && typeof badge === "number" && badge > 0 && (
        <View style={styles.badgeNumber} />
      )}
    </View>
  );
};

/** Add member icon */
export const AddMemberIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="person-add"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Leave group icon */
export const LeaveGroupIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const iconColor = color || Colors.light.error;
  return (
    <Ionicons
      name="exit"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// NAVIGATION ICONS
// ============================================

/** Back arrow icon */
export const BackIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="arrow-back"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Close icon */
export const CloseIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="close"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

/** Info icon */
export const InfoIcon: React.FC<IconProps> = ({
  size = "md",
  color,
  style,
}) => {
  const defaultColor = useThemeColor({}, "text");
  const iconColor = color || defaultColor;

  return (
    <Ionicons
      name="information-circle"
      size={SIZE_MAP[size]}
      color={iconColor}
      style={style as TextStyle}
    />
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
    borderWidth: 1,
    borderColor: Colors.light.background,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.background,
  },
  badgeNumber: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.background,
  },
  missedCallBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.error,
  },
  statusDot: {
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
});

// ============================================
// EXPORT ALL
// ============================================

export default {
  // Message
  ChatIcon,
  ChatListIcon,
  SendIcon,
  DeliveredIcon,
  SeenIcon,
  // Calls
  VoiceCallIcon,
  VideoCallIcon,
  EndCallIcon,
  MissedCallIcon,
  // Status
  OnlineStatusIcon,
  SupportAgentIcon,
  CustomerServiceIcon,
  // Attachments
  AttachmentIcon,
  ImageIcon,
  DocumentIcon,
  CameraIcon,
  MicrophoneIcon,
  LocationIcon,
  // Actions
  MoreOptionsIcon,
  DeleteIcon,
  ArchiveIcon,
  PinIcon,
  MuteIcon,
  SearchIcon,
  ReplyIcon,
  ForwardIcon,
  CopyIcon,
  // Reactions
  EmojiIcon,
  LikeIcon,
  ThumbsUpIcon,
  // Group
  GroupChatIcon,
  AddMemberIcon,
  LeaveGroupIcon,
  // Navigation
  BackIcon,
  CloseIcon,
  InfoIcon,
};
