/**
 * UploadProgressBar Component
 * ===========================
 *
 * Progress bar với animation cho upload
 *
 * Features:
 * - Animated progress
 * - Multiple states (uploading, success, error, paused)
 * - Cancel/Retry actions
 * - File info display
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
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

export type UploadStatus =
  | "pending"
  | "uploading"
  | "paused"
  | "success"
  | "error";

export interface UploadProgressBarProps {
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: UploadStatus;
  /** File name */
  fileName: string;
  /** File size in bytes */
  fileSize?: number;
  /** Uploaded bytes */
  uploadedBytes?: number;
  /** Error message */
  errorMessage?: string;
  /** Callback khi cancel */
  onCancel?: () => void;
  /** Callback khi retry */
  onRetry?: () => void;
  /** Callback khi pause/resume */
  onTogglePause?: () => void;
  /** Hiển thị compact */
  compact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function UploadProgressBar({
  progress,
  status,
  fileName,
  fileSize,
  uploadedBytes,
  errorMessage,
  onCancel,
  onRetry,
  onTogglePause,
  compact = false,
}: UploadProgressBarProps) {
  // Animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  // Status colors
  const getStatusColor = () => {
    switch (status) {
      case "uploading":
        return primaryColor;
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "paused":
        return "#FF9800";
      default:
        return surfaceColor;
    }
  };

  const statusColor = getStatusColor();

  // ============================================
  // Animations
  // ============================================

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (status === "uploading") {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  // ============================================
  // Helpers
  // ============================================

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "paused":
        return "pause-circle";
      case "uploading":
        return "cloud-upload";
      default:
        return "time";
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case "pending":
        return "Đang chờ...";
      case "uploading":
        return `Đang tải lên... ${progress}%`;
      case "paused":
        return "Tạm dừng";
      case "success":
        return "Hoàn thành";
      case "error":
        return errorMessage || "Lỗi tải lên";
      default:
        return "";
    }
  };

  // ============================================
  // Compact Render
  // ============================================

  if (compact) {
    return (
      <View
        style={[styles.compactContainer, { backgroundColor: surfaceColor }]}
      >
        <Animated.View style={{ opacity: pulseAnim }}>
          <Ionicons name={getStatusIcon()} size={20} color={statusColor} />
        </Animated.View>

        <View style={styles.compactInfo}>
          <Text
            style={[styles.compactFileName, { color: textColor }]}
            numberOfLines={1}
          >
            {fileName}
          </Text>
          <View style={styles.compactProgressBar}>
            <Animated.View
              style={[
                styles.compactProgressFill,
                {
                  backgroundColor: statusColor,
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {status === "uploading" && onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.compactAction}>
            <Ionicons name="close" size={18} color={secondaryTextColor} />
          </TouchableOpacity>
        )}

        {status === "error" && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactAction}>
            <Ionicons name="refresh" size={18} color={primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ============================================
  // Full Render
  // ============================================

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={{ opacity: pulseAnim }}>
          <Ionicons name={getStatusIcon()} size={24} color={statusColor} />
        </Animated.View>

        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, { color: textColor }]}
            numberOfLines={1}
          >
            {fileName}
          </Text>
          <Text style={[styles.statusText, { color: secondaryTextColor }]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {status === "uploading" && onTogglePause && (
            <TouchableOpacity
              onPress={onTogglePause}
              style={styles.actionButton}
            >
              <Ionicons name="pause" size={20} color={secondaryTextColor} />
            </TouchableOpacity>
          )}

          {status === "paused" && onTogglePause && (
            <TouchableOpacity
              onPress={onTogglePause}
              style={styles.actionButton}
            >
              <Ionicons name="play" size={20} color={primaryColor} />
            </TouchableOpacity>
          )}

          {(status === "uploading" || status === "paused") && onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.actionButton}>
              <Ionicons name="close" size={20} color="#F44336" />
            </TouchableOpacity>
          )}

          {status === "error" && onRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.actionButton}>
              <Ionicons name="refresh" size={20} color={primaryColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={[styles.progressBarContainer, { backgroundColor: surfaceColor }]}
      >
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: statusColor,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Size Info */}
      {fileSize && (
        <View style={styles.sizeInfo}>
          <Text style={[styles.sizeText, { color: secondaryTextColor }]}>
            {uploadedBytes ? formatBytes(uploadedBytes) : "0 B"} /{" "}
            {formatBytes(fileSize)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Full mode
  container: {
    padding: 12,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "500",
  },
  statusText: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  sizeInfo: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  sizeText: {
    fontSize: 12,
  },

  // Compact mode
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 8,
  },
  compactFileName: {
    fontSize: 13,
    fontWeight: "500",
  },
  compactProgressBar: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginTop: 4,
    overflow: "hidden",
  },
  compactProgressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  compactAction: {
    padding: 4,
    marginLeft: 8,
  },
});

export default UploadProgressBar;
