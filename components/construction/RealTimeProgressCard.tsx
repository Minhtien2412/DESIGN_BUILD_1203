/**
 * RealTimeProgressCard Component
 * Hiển thị tiến độ task/project với cập nhật real-time
 *
 * @created 2026-02-04
 *
 * Features:
 * - Animated progress bar
 * - Live connection indicator
 * - Last updated timestamp
 * - Pull to refresh
 * - Status badges
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// Types
// ============================================================================

export interface RealTimeProgressCardProps {
  title: string;
  progress: number; // 0-100
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "PLANNING"
    | "ON_HOLD"
    | "DELAYED";
  connected: boolean;
  lastUpdated?: string;
  completedTasks?: number;
  totalTasks?: number;
  onRefresh?: () => void;
  onPress?: () => void;
  variant?: "task" | "project";
}

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
  primary: "#0D9488",
  success: "#00BFA5",
  warning: "#FFB800",
  error: "#EF4444",
  info: "#0D9488",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  border: "#E0E0E0",
  connected: "#00BFA5",
  disconnected: "#EF4444",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  TODO: {
    label: "Chưa bắt đầu",
    color: COLORS.textSecondary,
    icon: "time-outline",
  },
  PLANNING: {
    label: "Lên kế hoạch",
    color: COLORS.info,
    icon: "calendar-outline",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: COLORS.primary,
    icon: "construct-outline",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: COLORS.success,
    icon: "checkmark-circle",
  },
  ON_HOLD: {
    label: "Tạm dừng",
    color: COLORS.warning,
    icon: "pause-circle-outline",
  },
  DELAYED: {
    label: "Chậm tiến độ",
    color: COLORS.error,
    icon: "alert-circle-outline",
  },
};

// ============================================================================
// Component
// ============================================================================

export function RealTimeProgressCard({
  title,
  progress,
  status,
  connected,
  lastUpdated,
  completedTasks,
  totalTasks,
  onRefresh,
  onPress,
  variant = "task",
}: RealTimeProgressCardProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.TODO;

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // Pulse animation for live indicator
  useEffect(() => {
    if (connected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [connected, pulseAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const formatLastUpdated = useCallback((dateStr?: string) => {
    if (!dateStr) return "Chưa cập nhật";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name={
              variant === "project"
                ? "office-building"
                : "checkbox-marked-outline"
            }
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <Animated.View
            style={[
              styles.liveDot,
              {
                backgroundColor: connected
                  ? COLORS.connected
                  : COLORS.disconnected,
                transform: [{ scale: connected ? pulseAnim : 1 }],
              },
            ]}
          />
          <Text
            style={[
              styles.liveText,
              { color: connected ? COLORS.connected : COLORS.disconnected },
            ]}
          >
            {connected ? "Live" : "Offline"}
          </Text>
        </View>
      </View>

      {/* Status Badge */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.color + "20" },
          ]}
        >
          <Ionicons
            name={statusConfig.icon}
            size={14}
            color={statusConfig.color}
          />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        {completedTasks !== undefined && totalTasks !== undefined && (
          <Text style={styles.taskCount}>
            {completedTasks}/{totalTasks} công việc
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Tiến độ</Text>
          <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor:
                  progress >= 100
                    ? COLORS.success
                    : progress >= 70
                      ? COLORS.primary
                      : progress >= 40
                        ? COLORS.warning
                        : COLORS.error,
              },
            ]}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.lastUpdated}>
          <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
          <Text style={styles.lastUpdatedText}>
            {formatLastUpdated(lastUpdated)}
          </Text>
        </View>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Mini Progress Indicator
// ============================================================================

export interface MiniProgressIndicatorProps {
  progress: number;
  connected: boolean;
  size?: "small" | "medium";
}

export function MiniProgressIndicator({
  progress,
  connected,
  size = "small",
}: MiniProgressIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (connected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [connected, pulseAnim]);

  const barWidth = size === "small" ? 60 : 100;
  const barHeight = size === "small" ? 4 : 6;

  return (
    <View style={[styles.miniContainer, { width: barWidth }]}>
      <View style={[styles.miniBar, { height: barHeight }]}>
        <View
          style={[
            styles.miniFill,
            {
              width: `${progress}%`,
              height: barHeight,
              backgroundColor:
                progress >= 100 ? COLORS.success : COLORS.primary,
            },
          ]}
        />
      </View>
      <View style={styles.miniInfo}>
        <Text style={styles.miniText}>{Math.round(progress)}%</Text>
        <Animated.View
          style={[
            styles.miniDot,
            {
              backgroundColor: connected
                ? COLORS.connected
                : COLORS.disconnected,
              transform: [{ scale: connected ? pulseAnim : 1 }],
            },
          ]}
        />
      </View>
    </View>
  );
}

// ============================================================================
// Connection Status Banner
// ============================================================================

export interface ConnectionStatusBannerProps {
  connected: boolean;
  connecting?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ConnectionStatusBanner({
  connected,
  connecting,
  error,
  onRetry,
}: ConnectionStatusBannerProps) {
  if (connected) return null;

  return (
    <View
      style={[styles.banner, error ? styles.bannerError : styles.bannerWarning]}
    >
      <View style={styles.bannerContent}>
        {connecting ? (
          <>
            <Ionicons name="sync" size={16} color="#fff" />
            <Text style={styles.bannerText}>Đang kết nối real-time...</Text>
          </>
        ) : error ? (
          <>
            <Ionicons name="alert-circle" size={16} color="#fff" />
            <Text style={styles.bannerText}>Không thể kết nối real-time</Text>
          </>
        ) : (
          <>
            <Ionicons name="cloud-offline" size={16} color="#fff" />
            <Text style={styles.bannerText}>Đang chạy offline</Text>
          </>
        )}
      </View>
      {onRetry && !connecting && (
        <TouchableOpacity style={styles.bannerRetry} onPress={onRetry}>
          <Text style={styles.bannerRetryText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  taskCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastUpdated: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  refreshBtn: {
    padding: 6,
  },

  // Mini Progress
  miniContainer: {
    alignItems: "center",
  },
  miniBar: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniFill: {
    borderRadius: 2,
  },
  miniInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  miniText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerWarning: {
    backgroundColor: COLORS.warning,
  },
  bannerError: {
    backgroundColor: COLORS.error,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  bannerRetry: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
  },
  bannerRetryText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});

export default RealTimeProgressCard;
