/**
 * AttachmentPreviewList Component
 * ================================
 *
 * Hiển thị preview các attachments trước khi gửi tin nhắn
 *
 * Features:
 * - Preview images/files
 * - Upload progress indicator
 * - Remove attachment
 * - Retry failed uploads
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { PendingAttachment } from "@/hooks/use-message-attachments";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

// ============================================================================
// Types
// ============================================================================

interface AttachmentPreviewListProps {
  /** List of pending attachments */
  attachments: PendingAttachment[];
  /** Callback to remove attachment */
  onRemove?: (id: string) => void;
  /** Callback to retry failed upload */
  onRetry?: (id: string) => void;
  /** Show as horizontal scroll */
  horizontal?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function AttachmentPreviewList({
  attachments,
  onRemove,
  onRetry,
  horizontal = true,
}: AttachmentPreviewListProps) {
  const surfaceColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const errorColor = useThemeColor({}, "error");
  const textColor = useThemeColor({}, "text");
  const secondaryText = useThemeColor({}, "secondaryText");

  // ============================================
  // Render Item
  // ============================================

  const renderItem = useCallback(
    ({ item }: { item: PendingAttachment }) => {
      const isImage = item.file.type.startsWith("image/");
      const isUploading = item.status === "uploading";
      const isError = item.status === "error";
      const isSuccess = item.status === "success";

      return (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.previewItem, { backgroundColor: surfaceColor }]}
        >
          {/* Preview */}
          {isImage ? (
            <Image
              source={{ uri: item.file.uri }}
              style={styles.previewImage}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.filePreview,
                { backgroundColor: primaryColor + "20" },
              ]}
            >
              <Ionicons
                name={getFileIcon(item.file.type)}
                size={24}
                color={primaryColor}
              />
            </View>
          )}

          {/* Overlay for uploading/error */}
          {(isUploading || isError) && (
            <View style={styles.overlay}>
              {isUploading && (
                <>
                  <ProgressCircle
                    progress={item.progress}
                    color={primaryColor}
                  />
                  <Text style={styles.progressText}>{item.progress}%</Text>
                </>
              )}
              {isError && (
                <TouchableOpacity onPress={() => onRetry?.(item.id)}>
                  <Ionicons
                    name="refresh-circle"
                    size={32}
                    color={errorColor}
                  />
                  <Text style={styles.errorText}>Thử lại</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Success checkmark */}
          {isSuccess && (
            <View
              style={[styles.successBadge, { backgroundColor: primaryColor }]}
            >
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </View>
          )}

          {/* Remove button */}
          {!isUploading && (
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: errorColor }]}
              onPress={() => onRemove?.(item.id)}
            >
              <Ionicons name="close" size={14} color="#FFF" />
            </TouchableOpacity>
          )}

          {/* File name for non-images */}
          {!isImage && (
            <Text
              style={[styles.fileName, { color: textColor }]}
              numberOfLines={1}
            >
              {item.file.name}
            </Text>
          )}
        </Animated.View>
      );
    },
    [surfaceColor, primaryColor, errorColor, textColor, onRemove, onRetry],
  );

  // ============================================
  // Render
  // ============================================

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={attachments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// ============================================================================
// Progress Circle Component
// ============================================================================

interface ProgressCircleProps {
  progress: number;
  color: string;
  size?: number;
}

function ProgressCircle({ progress, color, size = 32 }: ProgressCircleProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(`${(progress / 100) * 360}deg`) }],
  }));

  return (
    <View style={[styles.progressCircle, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            borderColor: color,
            borderWidth: 2,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getFileIcon(mimeType: string): keyof typeof Ionicons.glyphMap {
  if (mimeType.startsWith("video/")) return "videocam";
  if (mimeType.startsWith("audio/")) return "musical-notes";
  if (mimeType.includes("pdf")) return "document-text";
  if (mimeType.includes("word") || mimeType.includes("doc")) return "document";
  if (mimeType.includes("excel") || mimeType.includes("sheet")) return "grid";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "easel";
  if (mimeType.includes("zip") || mimeType.includes("archive"))
    return "archive";
  return "document-attach";
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  previewItem: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  filePreview: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircle: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressFill: {
    position: "absolute",
  },
  progressText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  errorText: {
    color: "#FFF",
    fontSize: 10,
    marginTop: 2,
  },
  successBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  fileName: {
    fontSize: 9,
    textAlign: "center",
    paddingHorizontal: 4,
    marginTop: 2,
  },
});

export default AttachmentPreviewList;
