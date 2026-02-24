/**
 * UploadProgressIndicator - Upload progress UI
 * VIDEO-006: User Upload Video - Progress indicator
 */

import { UploadProgress } from "@/services/VideoUploadService";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

export interface UploadProgressIndicatorProps {
  progress: UploadProgress;
  onCancel?: () => void;
  onRetry?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

const STATUS_CONFIG = {
  preparing: {
    label: "Đang chuẩn bị...",
    icon: "hourglass-outline" as const,
    color: "#FFA500",
  },
  uploading: {
    label: "Đang tải lên...",
    icon: "cloud-upload-outline" as const,
    color: "#3498db",
  },
  processing: {
    label: "Đang xử lý...",
    icon: "cog-outline" as const,
    color: "#9b59b6",
  },
  completed: {
    label: "Hoàn thành!",
    icon: "checkmark-circle" as const,
    color: "#2ecc71",
  },
  failed: {
    label: "Thất bại",
    icon: "alert-circle" as const,
    color: "#e74c3c",
  },
};

export function UploadProgressIndicator({
  progress,
  onCancel,
  onRetry,
  style,
  compact = false,
}: UploadProgressIndicatorProps): React.ReactElement {
  const config = STATUS_CONFIG[progress.status];
  const isActive =
    progress.status === "uploading" || progress.status === "preparing";
  const canRetry = progress.status === "failed";

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={[styles.compactIcon, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon} size={16} color="#FFF" />
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactLabel}>{config.label}</Text>
          {progress.status === "uploading" && (
            <View style={styles.compactProgressBar}>
              <View
                style={[
                  styles.compactProgressFill,
                  {
                    width: `${progress.progress}%`,
                    backgroundColor: config.color,
                  },
                ]}
              />
            </View>
          )}
        </View>
        {isActive && onCancel && (
          <Pressable onPress={onCancel} style={styles.compactButton}>
            <Ionicons name="close" size={18} color="#999" />
          </Pressable>
        )}
        {canRetry && onRetry && (
          <Pressable onPress={onRetry} style={styles.compactButton}>
            <Ionicons name="refresh" size={18} color="#14B8A6" />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Status Icon */}
      <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={32} color="#FFF" />
      </View>

      {/* Status Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.statusLabel}>{config.label}</Text>

        {/* Progress Bar */}
        {(progress.status === "uploading" ||
          progress.status === "processing") && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress.progress}%`,
                    backgroundColor: config.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress.progress}%</Text>
          </View>
        )}

        {/* Upload Stats */}
        {progress.status === "uploading" && (
          <Text style={styles.statsText}>
            {formatBytes(progress.bytesUploaded)} /{" "}
            {formatBytes(progress.totalBytes)}
          </Text>
        )}

        {/* Error Message */}
        {progress.status === "failed" && progress.error && (
          <Text style={styles.errorText}>{progress.error}</Text>
        )}

        {/* Success Message */}
        {progress.status === "completed" && (
          <Text style={styles.successText}>Video đã được đăng thành công!</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isActive && onCancel && (
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Ionicons name="close-circle" size={24} color="#e74c3c" />
            <Text style={styles.cancelText}>Hủy</Text>
          </Pressable>
        )}

        {canRetry && onRetry && (
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Ionicons name="refresh-circle" size={24} color="#14B8A6" />
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * Mini floating progress indicator
 */
export function FloatingUploadProgress({
  progress,
  onPress,
}: {
  progress: UploadProgress;
  onPress?: () => void;
}): React.ReactElement {
  const config = STATUS_CONFIG[progress.status];

  return (
    <Pressable onPress={onPress} style={styles.floatingContainer}>
      <View style={[styles.floatingIcon, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={20} color="#FFF" />
      </View>
      <View style={styles.floatingInfo}>
        <Text style={styles.floatingLabel} numberOfLines={1}>
          Đang tải video...
        </Text>
        <View style={styles.floatingProgressBar}>
          <View
            style={[
              styles.floatingProgressFill,
              { width: `${progress.progress}%`, backgroundColor: config.color },
            ]}
          />
        </View>
      </View>
      <Text style={styles.floatingPercent}>{progress.progress}%</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  infoContainer: {
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    width: 45,
    textAlign: "right",
  },
  statsText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#e74c3c",
    textAlign: "center",
  },
  successText: {
    marginTop: 8,
    fontSize: 14,
    color: "#2ecc71",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 16,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  cancelText: {
    fontSize: 14,
    color: "#e74c3c",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  retryText: {
    fontSize: 14,
    color: "#14B8A6",
  },
  // Compact styles
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  compactInfo: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 4,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  compactProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  compactButton: {
    padding: 4,
  },
  // Floating styles
  floatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingInfo: {
    flex: 1,
    maxWidth: 150,
  },
  floatingLabel: {
    fontSize: 12,
    color: "#FFF",
    marginBottom: 4,
  },
  floatingProgressBar: {
    height: 3,
    backgroundColor: "#333",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  floatingProgressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  floatingPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default UploadProgressIndicator;
