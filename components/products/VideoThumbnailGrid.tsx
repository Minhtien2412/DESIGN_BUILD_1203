/**
 * VideoThumbnailGrid - Shopee-style Video Grid with Auto-play
 * ===========================================================
 *
 * Grid hiển thị video thumbnail nhỏ tự động phát như Shopee.
 * Chỉ video đang visible trong viewport mới auto-play để tiết kiệm tài nguyên.
 *
 * Features:
 * - 2-column grid layout (như Shopee)
 * - Auto-play video khi visible
 * - Visibility tracking cho từng item
 * - Lazy loading
 * - Pull to refresh
 *
 * @author ThietKeResort Team
 * @created 2026-01-27
 */

import { MODERN_COLORS, MODERN_SPACING } from "@/constants/modern-theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from "react-native";

import { VideoThumbnailCard } from "./VideoThumbnailCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_GAP = 8;
const HORIZONTAL_PADDING = 12;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

// ============================================
// Types
// ============================================
export interface VideoGridItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  duration?: number;
  views?: number;
  likes?: number;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface VideoThumbnailGridProps {
  /** Video items */
  videos: VideoGridItem[];
  /** Loading state */
  isLoading?: boolean;
  /** Refreshing state */
  isRefreshing?: boolean;
  /** Callback for refresh */
  onRefresh?: () => void;
  /** Callback when reaching end */
  onEndReached?: () => void;
  /** Has more data to load */
  hasMore?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Header component */
  ListHeaderComponent?: React.ReactElement;
  /** Callback when video is tapped */
  onVideoPress?: (video: VideoGridItem, index: number) => void;
  /** Number of columns (default: 2) */
  numColumns?: number;
}

// ============================================
// Main Component
// ============================================
export const VideoThumbnailGrid = memo(function VideoThumbnailGrid({
  videos,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onEndReached,
  hasMore = false,
  emptyMessage = "Chưa có video nào",
  ListHeaderComponent,
  onVideoPress,
  numColumns = 2,
}: VideoThumbnailGridProps) {
  // Track visible items
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  });

  // Handle visibility change
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const newVisibleItems = new Set<string>();
      viewableItems.forEach((item) => {
        if (item.isViewable && item.item?.id) {
          newVisibleItems.add(item.item.id);
        }
      });
      setVisibleItems(newVisibleItems);
    },
    [],
  );

  // Handle video press
  const handleVideoPress = useCallback(
    (video: VideoGridItem, index: number) => {
      if (onVideoPress) {
        onVideoPress(video, index);
      } else {
        // Default: navigate to shorts player
        router.push(`/social/shorts?id=${video.id}`);
      }
    },
    [onVideoPress],
  );

  // Render video item
  const renderItem = useCallback(
    ({ item, index }: { item: VideoGridItem; index: number }) => {
      const isVisible = visibleItems.has(item.id);

      return (
        <View style={styles.cardWrapper}>
          <VideoThumbnailCard
            id={item.id}
            videoUrl={item.videoUrl}
            thumbnailUrl={item.thumbnailUrl}
            duration={item.duration}
            views={item.views}
            isVisible={isVisible}
            width={CARD_WIDTH}
            onPress={() => handleVideoPress(item, index)}
          />
          {/* Optional: Title/User info below thumbnail */}
          {item.title && (
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item.title}
            </Text>
          )}
          {item.user && (
            <View style={styles.userRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.user.name}
              </Text>
              {item.likes !== undefined && (
                <View style={styles.likesContainer}>
                  <Ionicons
                    name="heart"
                    size={10}
                    color={MODERN_COLORS.error}
                  />
                  <Text style={styles.likesText}>{item.likes}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      );
    },
    [visibleItems, handleVideoPress],
  );

  // Render footer (loading indicator)
  const renderFooter = useCallback(() => {
    if (!hasMore || !isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={MODERN_COLORS.primary} />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  }, [hasMore, isLoading]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="videocam-off-outline"
          size={48}
          color={MODERN_COLORS.textTertiary}
        />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [isLoading, emptyMessage]);

  return (
    <FlatList
      data={videos}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.contentContainer}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[MODERN_COLORS.primary]}
            tintColor={MODERN_COLORS.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={6}
      windowSize={5}
      initialNumToRender={4}
    />
  );
});

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 100,
    minHeight: "100%",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: COLUMN_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: MODERN_SPACING.xs,
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: MODERN_COLORS.text,
    marginTop: 6,
    lineHeight: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  userName: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    flex: 1,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  likesText: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.md,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: MODERN_COLORS.textTertiary,
    marginTop: 12,
  },
});

export default VideoThumbnailGrid;
