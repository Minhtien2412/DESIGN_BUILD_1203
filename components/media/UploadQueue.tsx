/**
 * UploadQueue Component
 * =====================
 *
 * Quản lý và hiển thị queue upload với multiple files
 *
 * Features:
 * - Multiple file queue management
 * - Sequential/Parallel upload modes
 * - Drag to reorder (future)
 * - Batch actions (cancel all, retry failed)
 * - Minimized/Expanded states
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UploadProgressBar, UploadStatus } from "./UploadProgressBar";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// Types
// ============================================================================

export interface UploadItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uri: string;
  progress: number;
  status: UploadStatus;
  uploadedBytes?: number;
  errorMessage?: string;
  createdAt: number;
}

export interface UploadQueueProps {
  /** Danh sách uploads */
  items: UploadItem[];
  /** Callback khi cancel item */
  onCancelItem?: (id: string) => void;
  /** Callback khi retry item */
  onRetryItem?: (id: string) => void;
  /** Callback khi cancel all */
  onCancelAll?: () => void;
  /** Callback khi retry all failed */
  onRetryAllFailed?: () => void;
  /** Callback khi clear completed */
  onClearCompleted?: () => void;
  /** Có thể minimize */
  collapsible?: boolean;
  /** Vị trí hiển thị */
  position?: "top" | "bottom";
  /** Max items hiển thị khi expanded */
  maxVisibleItems?: number;
}

// ============================================================================
// Component
// ============================================================================

export function UploadQueue({
  items,
  onCancelItem,
  onRetryItem,
  onCancelAll,
  onRetryAllFailed,
  onClearCompleted,
  collapsible = true,
  position = "bottom",
  maxVisibleItems = 5,
}: UploadQueueProps) {
  // State
  const [isExpanded, setIsExpanded] = useState(true);

  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  const insets = useSafeAreaInsets();

  // ============================================
  // Computed values
  // ============================================

  const stats = useMemo(() => {
    const uploading = items.filter((i) => i.status === "uploading").length;
    const pending = items.filter((i) => i.status === "pending").length;
    const completed = items.filter((i) => i.status === "success").length;
    const failed = items.filter((i) => i.status === "error").length;
    const total = items.length;

    const totalProgress =
      items.length > 0
        ? items.reduce((sum, i) => sum + i.progress, 0) / items.length
        : 0;

    return { uploading, pending, completed, failed, total, totalProgress };
  }, [items]);

  const visibleItems = useMemo(() => {
    // Sort: uploading first, then pending, then error, then success
    const sorted = [...items].sort((a, b) => {
      const order: Record<UploadStatus, number> = {
        uploading: 0,
        pending: 1,
        paused: 2,
        error: 3,
        success: 4,
      };
      return order[a.status] - order[b.status];
    });

    return isExpanded ? sorted.slice(0, maxVisibleItems) : [];
  }, [items, isExpanded, maxVisibleItems]);

  // ============================================
  // Handlers
  // ============================================

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: UploadItem }) => (
      <View style={styles.itemWrapper}>
        <UploadProgressBar
          progress={item.progress}
          status={item.status}
          fileName={item.fileName}
          fileSize={item.fileSize}
          uploadedBytes={item.uploadedBytes}
          errorMessage={item.errorMessage}
          onCancel={() => onCancelItem?.(item.id)}
          onRetry={() => onRetryItem?.(item.id)}
          compact
        />
      </View>
    ),
    [onCancelItem, onRetryItem],
  );

  // ============================================
  // Early return if empty
  // ============================================

  if (items.length === 0) {
    return null;
  }

  // ============================================
  // Render
  // ============================================

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        position === "bottom"
          ? { paddingBottom: insets.bottom }
          : { paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        style={[styles.header, { borderBottomColor: surfaceColor }]}
        onPress={collapsible ? toggleExpanded : undefined}
        activeOpacity={collapsible ? 0.7 : 1}
      >
        {/* Status icon */}
        <View
          style={[styles.statusIcon, { backgroundColor: `${primaryColor}15` }]}
        >
          {stats.uploading > 0 ? (
            <Ionicons name="cloud-upload" size={20} color={primaryColor} />
          ) : stats.failed > 0 ? (
            <Ionicons name="alert-circle" size={20} color="#F44336" />
          ) : (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          )}
        </View>

        {/* Info */}
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {stats.uploading > 0
              ? `Đang tải lên ${stats.uploading} file...`
              : stats.failed > 0
                ? `${stats.failed} file lỗi`
                : `${stats.completed} file hoàn thành`}
          </Text>
          <Text style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
            {stats.total} file • {Math.round(stats.totalProgress)}% hoàn thành
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.headerActions}>
          {stats.failed > 0 && onRetryAllFailed && (
            <TouchableOpacity
              onPress={onRetryAllFailed}
              style={[
                styles.headerAction,
                { backgroundColor: `${primaryColor}15` },
              ]}
            >
              <Ionicons name="refresh" size={18} color={primaryColor} />
            </TouchableOpacity>
          )}

          {stats.completed > 0 && onClearCompleted && !stats.uploading && (
            <TouchableOpacity
              onPress={onClearCompleted}
              style={[
                styles.headerAction,
                { backgroundColor: `${surfaceColor}` },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={secondaryTextColor}
              />
            </TouchableOpacity>
          )}

          {collapsible && (
            <Ionicons
              name={isExpanded ? "chevron-down" : "chevron-up"}
              size={20}
              color={secondaryTextColor}
              style={styles.expandIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Progress Bar (always visible) */}
      <View
        style={[styles.totalProgressBar, { backgroundColor: surfaceColor }]}
      >
        <View
          style={[
            styles.totalProgressFill,
            {
              backgroundColor: stats.failed > 0 ? "#F44336" : primaryColor,
              width: `${stats.totalProgress}%`,
            },
          ]}
        />
      </View>

      {/* Items List */}
      {isExpanded && (
        <FlatList
          data={visibleItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            items.length > maxVisibleItems ? (
              <Text style={[styles.moreText, { color: secondaryTextColor }]}>
                +{items.length - maxVisibleItems} file khác
              </Text>
            ) : null
          }
        />
      )}

      {/* Bottom Actions */}
      {isExpanded && stats.uploading > 0 && onCancelAll && (
        <TouchableOpacity
          style={[styles.cancelAllButton, { borderTopColor: surfaceColor }]}
          onPress={onCancelAll}
        >
          <Ionicons name="close-circle-outline" size={18} color="#F44336" />
          <Text style={styles.cancelAllText}>Hủy tất cả</Text>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  expandIcon: {
    marginLeft: 4,
  },

  // Total progress
  totalProgressBar: {
    height: 3,
    overflow: "hidden",
  },
  totalProgressFill: {
    height: "100%",
  },

  // List
  list: {
    maxHeight: 240,
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  itemWrapper: {
    marginBottom: 4,
  },
  moreText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },

  // Cancel all
  cancelAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  cancelAllText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default UploadQueue;
