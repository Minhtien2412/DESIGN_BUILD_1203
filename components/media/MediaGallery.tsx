/**
 * MediaGallery Component
 * ======================
 *
 * Grid gallery để hiển thị và chọn media từ device
 *
 * Features:
 * - Grid view với thumbnail
 * - Single/Multi selection mode
 * - Photo/Video filter
 * - Preview modal
 * - Lazy loading
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Local type matching expo-media-library asset structure
interface MediaLibraryAsset {
  id: string;
  uri: string;
  filename: string;
  mediaType: string;
  width: number;
  height: number;
  duration: number;
  creationTime: number;
  modificationTime: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

export interface MediaAsset {
  id: string;
  uri: string;
  filename: string;
  mediaType: "photo" | "video" | "audio" | "unknown";
  width: number;
  height: number;
  duration?: number; // Video duration in seconds
  creationTime: number;
  modificationTime: number;
}

export interface MediaGalleryProps {
  /** Chế độ chọn */
  selectionMode?: "single" | "multiple";
  /** Số lượng cột */
  numColumns?: number;
  /** Giới hạn số file chọn (multiple mode) */
  maxSelection?: number;
  /** Lọc theo loại media */
  mediaTypes?: ("photo" | "video")[];
  /** Album cụ thể */
  albumId?: string;
  /** Selected assets (controlled) */
  selectedAssets?: MediaAsset[];
  /** Callback khi chọn */
  onSelectionChange?: (assets: MediaAsset[]) => void;
  /** Callback khi confirm */
  onConfirm?: (assets: MediaAsset[]) => void;
  /** Callback khi cancel */
  onCancel?: () => void;
  /** Hiển thị header */
  showHeader?: boolean;
  /** Header title */
  headerTitle?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function MediaGallery({
  selectionMode = "single",
  numColumns = 3,
  maxSelection = 10,
  mediaTypes = ["photo"],
  albumId,
  selectedAssets: controlledSelected,
  onSelectionChange,
  onConfirm,
  onCancel,
  showHeader = true,
  headerTitle = "Chọn ảnh",
}: MediaGalleryProps) {
  // State
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");

  // Dimensions
  const itemSize = (SCREEN_WIDTH - (numColumns + 1) * 2) / numColumns;

  // ============================================
  // Request permission & load assets
  // ============================================

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setHasPermission(status === "granted");
    if (status === "granted") {
      loadAssets();
    }
  };

  const loadAssets = useCallback(
    async (cursor?: string) => {
      if (!hasMore && cursor) return;

      setIsLoading(true);
      try {
        const mediaTypeFilter =
          mediaTypes.includes("photo") && mediaTypes.includes("video")
            ? [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video]
            : mediaTypes.includes("video")
              ? [MediaLibrary.MediaType.video]
              : [MediaLibrary.MediaType.photo];

        const result = await MediaLibrary.getAssetsAsync({
          first: 50,
          after: cursor,
          mediaType: mediaTypeFilter,
          sortBy: [MediaLibrary.SortBy.creationTime],
          album: albumId,
        });

        const newAssets: MediaAsset[] = result.assets.map(
          (asset: MediaLibraryAsset) => ({
            id: asset.id,
            uri: asset.uri,
            filename: asset.filename,
            mediaType: asset.mediaType === "video" ? "video" : "photo",
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            creationTime: asset.creationTime,
            modificationTime: asset.modificationTime,
          }),
        );

        if (cursor) {
          setAssets((prev) => [...prev, ...newAssets]);
        } else {
          setAssets(newAssets);
        }

        setHasMore(result.hasNextPage);
        setEndCursor(result.endCursor);
      } catch (error) {
        console.error("[MediaGallery] Load assets error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [hasMore, mediaTypes, albumId],
  );

  // ============================================
  // Selection handlers
  // ============================================

  const handleSelect = useCallback(
    (asset: MediaAsset) => {
      if (selectionMode === "single") {
        // Single mode: replace selection
        const newSet = new Set([asset.id]);
        setSelectedIds(newSet);
        onSelectionChange?.([asset]);
      } else {
        // Multiple mode: toggle
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(asset.id)) {
            newSet.delete(asset.id);
          } else {
            if (newSet.size >= maxSelection) {
              // Show warning or ignore
              return prev;
            }
            newSet.add(asset.id);
          }

          // Callback with selected assets
          const selectedAssets = assets.filter((a) => newSet.has(a.id));
          onSelectionChange?.(selectedAssets);

          return newSet;
        });
      }
    },
    [selectionMode, maxSelection, assets, onSelectionChange],
  );

  const handleConfirm = useCallback(() => {
    const selectedAssets = assets.filter((a) => selectedIds.has(a.id));
    onConfirm?.(selectedAssets);
  }, [assets, selectedIds, onConfirm]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadAssets(endCursor);
    }
  }, [isLoading, hasMore, endCursor, loadAssets]);

  // ============================================
  // Render
  // ============================================

  const renderItem = useCallback(
    ({ item }: { item: MediaAsset }) => {
      const isSelected = selectedIds.has(item.id);
      const selectionIndex =
        selectionMode === "multiple"
          ? Array.from(selectedIds).indexOf(item.id) + 1
          : 0;

      return (
        <Pressable
          style={[styles.itemContainer, { width: itemSize, height: itemSize }]}
          onPress={() => handleSelect(item)}
          onLongPress={() => setPreviewAsset(item)}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.itemImage}
            contentFit="cover"
            transition={200}
          />

          {/* Video indicator */}
          {item.mediaType === "video" && (
            <View style={styles.videoIndicator}>
              <Ionicons name="play" size={16} color="#fff" />
              {item.duration && (
                <Text style={styles.durationText}>
                  {formatDuration(item.duration)}
                </Text>
              )}
            </View>
          )}

          {/* Selection overlay */}
          {isSelected && (
            <View
              style={[styles.selectedOverlay, { borderColor: primaryColor }]}
            >
              <View
                style={[styles.checkCircle, { backgroundColor: primaryColor }]}
              >
                {selectionMode === "multiple" ? (
                  <Text style={styles.checkNumber}>{selectionIndex}</Text>
                ) : (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
            </View>
          )}
        </Pressable>
      );
    },
    [selectedIds, selectionMode, itemSize, primaryColor, handleSelect],
  );

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={[styles.centerContainer, { backgroundColor }]}>
        <Ionicons name="images-outline" size={48} color={textColor} />
        <Text style={[styles.permissionText, { color: textColor }]}>
          Cần quyền truy cập thư viện ảnh
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: primaryColor }]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: surfaceColor }]}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: textColor }]}>Hủy</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: textColor }]}>
            {headerTitle}
            {selectionMode === "multiple" && selectedIds.size > 0 && (
              <Text style={{ color: primaryColor }}> ({selectedIds.size})</Text>
            )}
          </Text>

          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.headerButton}
            disabled={selectedIds.size === 0}
          >
            <Text
              style={[
                styles.confirmText,
                {
                  color: selectedIds.size > 0 ? primaryColor : surfaceColor,
                },
              ]}
            >
              Xong
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Gallery Grid */}
      <FlatList
        data={assets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.gridContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator color={primaryColor} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={surfaceColor} />
              <Text style={[styles.emptyText, { color: textColor }]}>
                Không tìm thấy ảnh nào
              </Text>
            </View>
          ) : null
        }
      />

      {/* Preview Modal */}
      <Modal
        visible={!!previewAsset}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewAsset(null)}
      >
        <Pressable
          style={styles.previewBackdrop}
          onPress={() => setPreviewAsset(null)}
        >
          {previewAsset && (
            <Image
              source={{ uri: previewAsset.uri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 16,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },

  // Grid
  gridContent: {
    padding: 1,
  },
  itemContainer: {
    margin: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  itemImage: {
    flex: 1,
  },

  // Video
  videoIndicator: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    marginLeft: 4,
  },

  // Selection
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 3,
    borderRadius: 4,
  },
  checkCircle: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  checkNumber: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Footer
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },

  // Permission
  permissionText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  permissionButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Preview
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});

export default MediaGallery;
