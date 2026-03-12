/**
 * SaveOfflineButton - Button to save files for offline access
 * OFFLINE-004: Save for offline functionality
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { FileItem, formatFileSize } from "@/services/FileManagerService";
import {
    OfflineFileService,
    useDownloadProgress
} from "@/services/OfflineFileService";

interface SaveOfflineButtonProps {
  file: FileItem;
  variant?: "icon" | "button" | "compact";
  showLabel?: boolean;
  onSaved?: () => void;
  onError?: (error: string) => void;
}

export const SaveOfflineButton: React.FC<SaveOfflineButtonProps> = ({
  file,
  variant = "icon",
  showLabel = false,
  onSaved,
  onError,
}) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { progress, status, error } = useDownloadProgress(file.id);

  // Check if file is already offline
  useEffect(() => {
    const checkOffline = async () => {
      await OfflineFileService.initialize();
      setIsOffline(OfflineFileService.isFileOffline(file.id));
    };
    checkOffline();
  }, [file.id]);

  // Update offline status based on download progress
  useEffect(() => {
    if (status === "completed") {
      setIsOffline(true);
      setIsSaving(false);
      onSaved?.();
    } else if (status === "failed" && error) {
      setIsSaving(false);
      onError?.(error);
    }
  }, [status, error, onSaved, onError]);

  const handlePress = useCallback(async () => {
    if (isOffline) {
      // Already offline - ask to remove
      Alert.alert(
        "Xóa tệp offline?",
        `"${file.originalName}" sẽ bị xóa khỏi bộ nhớ offline.`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              await OfflineFileService.deleteOfflineFile(file.id);
              setIsOffline(false);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            },
          },
        ],
      );
      return;
    }

    // Save for offline
    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await OfflineFileService.saveForOffline(file);
    } catch (err) {
      setIsSaving(false);
      const message =
        err instanceof Error ? err.message : "Không thể lưu offline";
      Alert.alert("Lỗi", message);
      onError?.(message);
    }
  }, [file, isOffline, onError]);

  const isDownloading =
    status === "downloading" || status === "pending" || isSaving;

  // Determine icon
  const getIcon = () => {
    if (isDownloading) return "cloud-download";
    if (isOffline) return "cloud-done";
    return "cloud-download-outline";
  };

  // Determine color
  const getColor = () => {
    if (isDownloading) return Colors.light.primary;
    if (isOffline) return "#27ae60";
    return Colors.light.textSecondary;
  };

  // Render based on variant
  if (variant === "icon") {
    return (
      <Pressable
        style={styles.iconButton}
        onPress={handlePress}
        disabled={isDownloading}
        hitSlop={8}
      >
        {isDownloading ? (
          <View style={styles.progressWrapper}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            {status === "downloading" && (
              <Text style={styles.progressText}>{progress}%</Text>
            )}
          </View>
        ) : (
          <Ionicons name={getIcon() as any} size={24} color={getColor()} />
        )}
      </Pressable>
    );
  }

  if (variant === "compact") {
    return (
      <Pressable
        style={[
          styles.compactButton,
          isOffline && styles.compactButtonActive,
          isDownloading && styles.compactButtonDownloading,
        ]}
        onPress={handlePress}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons
            name={getIcon() as any}
            size={18}
            color={isOffline ? "#fff" : Colors.light.text}
          />
        )}
        {showLabel && (
          <Text
            style={[
              styles.compactLabel,
              isOffline && styles.compactLabelActive,
            ]}
          >
            {isOffline ? "Đã lưu" : "Lưu offline"}
          </Text>
        )}
      </Pressable>
    );
  }

  // Full button variant
  return (
    <Pressable
      style={[
        styles.fullButton,
        isOffline && styles.fullButtonActive,
        isDownloading && styles.fullButtonDownloading,
      ]}
      onPress={handlePress}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.fullButtonText}>
            {status === "downloading"
              ? `Đang tải ${progress}%`
              : "Đang chuẩn bị..."}
          </Text>
        </>
      ) : (
        <>
          <Ionicons name={getIcon() as any} size={20} color="#fff" />
          <Text style={styles.fullButtonText}>
            {isOffline
              ? "Đã lưu offline"
              : `Lưu offline (${formatFileSize(file.fileSize)})`}
          </Text>
        </>
      )}
    </Pressable>
  );
};

// ============================================================================
// DOWNLOAD PROGRESS BADGE
// ============================================================================

interface DownloadProgressBadgeProps {
  fileId: string;
  size?: "small" | "medium" | "large";
}

export const DownloadProgressBadge: React.FC<DownloadProgressBadgeProps> = ({
  fileId,
  size = "medium",
}) => {
  const { progress, status } = useDownloadProgress(fileId);

  if (status === "completed" || status === "expired") {
    return null;
  }

  const sizes = {
    small: { container: 20, text: 8, indicator: 10 },
    medium: { container: 28, text: 10, indicator: 14 },
    large: { container: 36, text: 12, indicator: 18 },
  };

  const s = sizes[size];

  return (
    <View style={[styles.badge, { width: s.container, height: s.container }]}>
      {status === "downloading" ? (
        <>
          <ActivityIndicator size={s.indicator} color="#fff" />
          <Text style={[styles.badgeText, { fontSize: s.text }]}>
            {progress}
          </Text>
        </>
      ) : status === "pending" ? (
        <Ionicons name="time" size={s.indicator} color="#fff" />
      ) : status === "paused" ? (
        <Ionicons name="pause" size={s.indicator} color="#fff" />
      ) : (
        <Ionicons name="alert" size={s.indicator} color="#fff" />
      )}
    </View>
  );
};

// ============================================================================
// OFFLINE INDICATOR
// ============================================================================

interface OfflineIndicatorProps {
  fileId: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  fileId,
}) => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const check = async () => {
      await OfflineFileService.initialize();
      setIsOffline(OfflineFileService.isFileOffline(fileId));
    };
    check();
  }, [fileId]);

  if (!isOffline) return null;

  return (
    <View style={styles.offlineIndicator}>
      <Ionicons name="cloud-done" size={12} color="#27ae60" />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  progressWrapper: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 10,
    color: Colors.light.primary,
    marginTop: 2,
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    gap: 6,
  },
  compactButtonActive: {
    backgroundColor: "#27ae60",
  },
  compactButtonDownloading: {
    backgroundColor: Colors.light.primary,
  },
  compactLabel: {
    fontSize: 13,
    color: Colors.light.text,
  },
  compactLabelActive: {
    color: "#fff",
  },
  fullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    gap: 8,
  },
  fullButtonActive: {
    backgroundColor: "#27ae60",
  },
  fullButtonDownloading: {
    backgroundColor: Colors.light.primary,
    opacity: 0.8,
  },
  fullButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  badge: {
    borderRadius: 100,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -4,
    right: -4,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
  },
  offlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default SaveOfflineButton;
