/**
 * CallHeader - Header chuyên dụng cho màn hình cuộc gọi/lịch sử cuộc gọi
 * Thiết kế Zalo-style với gradient, status, và các action buttons
 * @created 2025-02-03
 */

import Avatar from "@/components/ui/avatar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// THEME CONFIG
// ============================================================================
const COLORS = {
  // Green call theme (Zalo-style)
  callBg: "#22C55E",
  callBgDark: "#16A34A",
  // Video call - blue theme
  videoBg: "#0068FF",
  videoBgDark: "#0054CC",
  // Ending call - red theme
  endingBg: "#EF4444",
  endingBgDark: "#DC2626",
  // Text colors
  white: "#FFFFFF",
  textLight: "rgba(255,255,255,0.85)",
  textMuted: "rgba(255,255,255,0.6)",
};

const SIZES = {
  headerHeight: 56,
  avatarSize: 40,
  iconSize: 24,
};

// ============================================================================
// TYPES
// ============================================================================
export type CallType = "voice" | "video";
export type CallStatus = "calling" | "ringing" | "connected" | "ended";

export interface CallHeaderProps {
  /** Tên người được gọi */
  callerName: string;
  /** Avatar URL */
  avatar?: string | null;
  /** User ID */
  userId?: string;
  /** Loại cuộc gọi */
  callType?: CallType;
  /** Trạng thái cuộc gọi */
  status?: CallStatus;
  /** Thời gian gọi (giây) */
  duration?: number;
  /** Callback khi nhấn back */
  onBackPress?: () => void;
  /** Style thêm */
  style?: ViewStyle;
}

// ============================================================================
// CALL HEADER COMPONENT (cho active call screen)
// ============================================================================
export const CallHeader = memo(function CallHeader({
  callerName,
  avatar,
  userId = "0",
  callType = "voice",
  status = "calling",
  duration = 0,
  onBackPress,
  style,
}: CallHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress]);

  // Format duration mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Status text based on call status
  const getStatusText = () => {
    switch (status) {
      case "calling":
        return "Đang gọi...";
      case "ringing":
        return "Đang đổ chuông...";
      case "connected":
        return formatDuration(duration);
      case "ended":
        return "Kết thúc cuộc gọi";
      default:
        return "";
    }
  };

  // Gradient colors based on status and type
  const getGradientColors = (): [string, string] => {
    if (status === "ended") {
      return [COLORS.endingBg, COLORS.endingBgDark];
    }
    return callType === "video"
      ? [COLORS.videoBg, COLORS.videoBgDark]
      : [COLORS.callBg, COLORS.callBgDark];
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
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
            name="chevron-back"
            size={SIZES.iconSize}
            color={COLORS.white}
          />
        </TouchableOpacity>

        {/* Avatar + Info */}
        <View style={styles.centerSection}>
          <View style={styles.avatarWrapper}>
            <Avatar
              avatar={avatar}
              userId={userId}
              name={callerName}
              pixelSize={SIZES.avatarSize}
              showBadge={false}
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.title} numberOfLines={1}>
              {callerName}
            </Text>
            <Text style={styles.subtitle}>
              {callType === "video" ? "📹 " : "📞 "}
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Call type indicator */}
        <View style={styles.callTypeIndicator}>
          <Ionicons
            name={callType === "video" ? "videocam" : "call"}
            size={20}
            color={COLORS.white}
          />
        </View>
      </View>
    </LinearGradient>
  );
});

// ============================================================================
// CALL HISTORY HEADER (cho danh sách lịch sử cuộc gọi)
// ============================================================================
export interface CallHistoryHeaderProps {
  /** Tiêu đề */
  title?: string;
  /** Số cuộc gọi nhỡ */
  missedCount?: number;
  /** Filter hiện tại */
  activeFilter?: "all" | "missed" | "incoming" | "outgoing";
  /** Callback khi đổi filter */
  onFilterChange?: (filter: "all" | "missed" | "incoming" | "outgoing") => void;
  /** Callback khi nhấn back */
  onBackPress?: () => void;
  /** Callback khi nhấn search */
  onSearchPress?: () => void;
  /** Style thêm */
  style?: ViewStyle;
}

export const CallHistoryHeader = memo(function CallHistoryHeader({
  title = "Cuộc gọi",
  missedCount = 0,
  activeFilter = "all",
  onFilterChange,
  onBackPress,
  onSearchPress,
  style,
}: CallHistoryHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress]);

  const filters: Array<{
    key: CallHistoryHeaderProps["activeFilter"];
    label: string;
  }> = [
    { key: "all", label: "Tất cả" },
    { key: "missed", label: "Nhỡ" },
    { key: "incoming", label: "Đến" },
    { key: "outgoing", label: "Đi" },
  ];

  return (
    <LinearGradient
      colors={[COLORS.callBg, COLORS.callBgDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.historyHeader, { paddingTop: insets.top }, style]}
    >
      {/* Top row */}
      <View style={styles.historyTopRow}>
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
        <View style={styles.historyTitleSection}>
          <Text style={styles.historyTitle}>
            {title}
            {missedCount > 0 && (
              <Text style={styles.missedBadgeText}> ({missedCount} nhỡ)</Text>
            )}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.historyActions}>
          {onSearchPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSearchPress}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={22} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      {onFilterChange && (
        <View style={styles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                activeFilter === filter.key && styles.filterTabActive,
              ]}
              onPress={() => onFilterChange(filter.key!)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === filter.key && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
                {filter.key === "missed" && missedCount > 0 && (
                  <Text style={styles.filterBadge}> {missedCount}</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </LinearGradient>
  );
});

// ============================================================================
// MEETING HEADER (cho màn hình cuộc họp/video call nhóm)
// ============================================================================
export interface MeetingHeaderProps {
  /** Tên phòng họp */
  roomName: string;
  /** Số người tham gia */
  participantCount?: number;
  /** Thời gian họp (giây) */
  duration?: number;
  /** Đang ghi hình */
  isRecording?: boolean;
  /** Callback khi nhấn rời phòng */
  onLeave?: () => void;
  /** Callback khi nhấn info */
  onInfoPress?: () => void;
  /** Callback khi nhấn participants */
  onParticipantsPress?: () => void;
  /** Style thêm */
  style?: ViewStyle;
}

export const MeetingHeader = memo(function MeetingHeader({
  roomName,
  participantCount = 0,
  duration = 0,
  isRecording = false,
  onLeave,
  onInfoPress,
  onParticipantsPress,
  style,
}: MeetingHeaderProps) {
  const insets = useSafeAreaInsets();

  // Format duration mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <LinearGradient
      colors={[COLORS.videoBg, COLORS.videoBgDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.meetingHeader, { paddingTop: insets.top }, style]}
    >
      <View style={styles.meetingContent}>
        {/* Left - Room info */}
        <TouchableOpacity
          style={styles.meetingInfo}
          onPress={onInfoPress}
          activeOpacity={0.8}
        >
          <View style={styles.meetingIconContainer}>
            <Ionicons name="videocam" size={20} color={COLORS.white} />
          </View>
          <View style={styles.meetingTextSection}>
            <Text style={styles.meetingTitle} numberOfLines={1}>
              {roomName}
            </Text>
            <Text style={styles.meetingSubtitle}>
              {formatDuration(duration)}
              {isRecording && " • 🔴 Đang ghi"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right - Actions */}
        <View style={styles.meetingActions}>
          {/* Participants */}
          <TouchableOpacity
            style={styles.participantsButton}
            onPress={onParticipantsPress}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={18} color={COLORS.white} />
            <Text style={styles.participantsCount}>{participantCount}</Text>
          </TouchableOpacity>

          {/* Leave button */}
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={onLeave}
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={20} color={COLORS.white} />
            <Text style={styles.leaveText}>Rời</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
});

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Call Header
  container: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
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
  infoSection: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  callTypeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Call History Header
  historyHeader: {
    width: "100%",
  },
  historyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: SIZES.headerHeight,
  },
  historyTitleSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  missedBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FDE047",
  },
  historyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  filterTabActive: {
    backgroundColor: COLORS.white,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.white,
  },
  filterTabTextActive: {
    color: COLORS.callBg,
  },
  filterBadge: {
    color: "#EF4444",
    fontWeight: "700",
  },

  // Meeting Header
  meetingHeader: {
    width: "100%",
  },
  meetingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: SIZES.headerHeight,
  },
  meetingInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  meetingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  meetingTextSection: {
    flex: 1,
    marginLeft: 12,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  meetingSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  meetingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  participantsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    gap: 4,
  },
  participantsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.endingBg,
    gap: 4,
  },
  leaveText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default CallHeader;
