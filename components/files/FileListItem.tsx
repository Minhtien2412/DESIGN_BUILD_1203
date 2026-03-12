/**
 * FileListItem - Single file item in list/grid view
 * UPLOAD-005: File Browser UI
 */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import {
    FileItem,
    formatFileSize,
    getFileExtension,
    getFileIcon,
    isPreviewable,
} from "@/services/FileManagerService";

// ============================================================================
// TYPES
// ============================================================================

export interface FileListItemProps {
  file: FileItem;
  viewMode: "list" | "grid";
  isSelected?: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  onPress?: (file: FileItem) => void;
  onLongPress?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  onShare?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  showActions?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

function FileListItemComponent({
  file,
  viewMode,
  isSelected = false,
  isDownloading = false,
  downloadProgress = 0,
  onPress,
  onLongPress,
  onDownload,
  onShare,
  onDelete,
  showActions = true,
}: FileListItemProps) {
  const colors = useThemeColor();

  const handlePress = useCallback(() => {
    onPress?.(file);
  }, [file, onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(file);
  }, [file, onLongPress]);

  const handleDownload = useCallback(() => {
    onDownload?.(file);
  }, [file, onDownload]);

  const handleShare = useCallback(() => {
    onShare?.(file);
  }, [file, onShare]);

  const handleDelete = useCallback(() => {
    onDelete?.(file);
  }, [file, onDelete]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const iconName = getFileIcon(
    file.contentType
  ) as keyof typeof Ionicons.glyphMap;
  const extension = getFileExtension(file.originalName);
  const canPreview = isPreviewable(file.contentType);

  if (viewMode === "grid") {
    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          { backgroundColor: colors.card, borderColor: colors.border },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        {/* Thumbnail */}
        <View
          style={[styles.gridThumbnail, { backgroundColor: colors.background }]}
        >
          {file.thumbnailUrl ? (
            <Image
              source={{ uri: file.thumbnailUrl }}
              style={styles.thumbnailImage}
            />
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={40}
                color={colors.textSecondary}
              />
              {extension && (
                <Text
                  style={[
                    styles.extensionBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  {extension}
                </Text>
              )}
            </View>
          )}

          {/* Download overlay */}
          {isDownloading && (
            <View
              style={[
                styles.downloadOverlay,
                { backgroundColor: "rgba(0,0,0,0.5)" },
              ]}
            >
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.downloadText}>{downloadProgress}%</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.gridInfo}>
          <Text
            style={[styles.gridFilename, { color: colors.text }]}
            numberOfLines={2}
          >
            {file.originalName}
          </Text>
          <Text style={[styles.gridMeta, { color: colors.textSecondary }]}>
            {formatFileSize(file.fileSize)}
          </Text>
        </View>

        {/* Selection indicator */}
        {isSelected && (
          <View
            style={[styles.selectedBadge, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // List view
  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
        isSelected && { backgroundColor: colors.primary + "15" },
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Thumbnail/Icon */}
      <View
        style={[styles.listThumbnail, { backgroundColor: colors.background }]}
      >
        {file.thumbnailUrl && canPreview ? (
          <Image
            source={{ uri: file.thumbnailUrl }}
            style={styles.listThumbnailImage}
          />
        ) : (
          <Ionicons name={iconName} size={28} color={colors.textSecondary} />
        )}
      </View>

      {/* File info */}
      <View style={styles.listInfo}>
        <Text
          style={[styles.listFilename, { color: colors.text }]}
          numberOfLines={1}
        >
          {file.originalName}
        </Text>
        <View style={styles.listMeta}>
          <Text style={[styles.listMetaText, { color: colors.textSecondary }]}>
            {formatFileSize(file.fileSize)}
          </Text>
          <Text style={[styles.listMetaDot, { color: colors.textSecondary }]}>
            •
          </Text>
          <Text style={[styles.listMetaText, { color: colors.textSecondary }]}>
            {formatDate(file.createdAt)}
          </Text>
          {file.ownerName && (
            <>
              <Text
                style={[styles.listMetaDot, { color: colors.textSecondary }]}
              >
                •
              </Text>
              <Text
                style={[styles.listMetaText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {file.ownerName}
              </Text>
            </>
          )}
        </View>

        {/* Download progress bar */}
        {isDownloading && (
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${downloadProgress}%`,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.listActions}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownload}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <View
          style={[
            styles.listSelectedBadge,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export const FileListItem = memo(FileListItemComponent);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Grid styles
  gridItem: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  gridThumbnail: {
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  extensionBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadText: {
    marginTop: 4,
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  gridInfo: {
    padding: 8,
  },
  gridFilename: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  gridMeta: {
    marginTop: 2,
    fontSize: 10,
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

  // List styles
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  listThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  listThumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listFilename: {
    fontSize: 14,
    fontWeight: "500",
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  listMetaText: {
    fontSize: 12,
  },
  listMetaDot: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  progressBar: {
    marginTop: 6,
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  listActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
  listSelectedBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
