/**
 * VerticalVideoFeed - Facebook/TikTok Style Vertical Video Viewer
 * ================================================================
 *
 * Full-screen vertical video feed with swipe up/down navigation.
 * Features:
 * - Full-screen video playback with advanced gestures
 * - Swipe up to next video, swipe down to previous
 * - Double tap to seek ±10s
 * - Long press for 2x speed
 * - Pinch to zoom
 * - Auto-play current video, pause others
 * - Video info overlay (title, description, author)
 * - Like, comment, share actions
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 * @updated 2026-01-24 - Added advanced gesture controls
 */

import * as Haptics from "expo-haptics";
import React, {
    createContext,
    memo,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from "react-native";

// Import CommentsSheet hook and AdvancedVideoPlayer
import { AdvancedVideoPlayer, VideoData } from "./AdvancedVideoPlayer";
import { CommentsSheetProvider, useCommentsSheet } from "./CommentsSheet";
import { ShareSheetProvider, useShareSheet } from "./ShareSheet";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Types
// ============================================
export interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  author?: {
    id?: string;
    name: string;
    avatar?: string;
  };
  duration?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  createdAt?: string;
}

interface VerticalVideoFeedContextType {
  open: (videos: VideoItem[], initialIndex?: number) => void;
  close: () => void;
  isOpen: boolean;
}

// ============================================
// Context
// ============================================
const VerticalVideoFeedContext =
  createContext<VerticalVideoFeedContextType | null>(null);

// Noop fallback when provider is not available
const noopVerticalVideoFeed: VerticalVideoFeedContextType = {
  open: () => console.warn("[VerticalVideoFeed] Provider not available"),
  close: () => {},
  isOpen: false,
};

export function useVerticalVideoFeed(): VerticalVideoFeedContextType {
  const ctx = useContext(VerticalVideoFeedContext);
  // Return noop fallback instead of throwing to prevent crashes during hydration
  if (!ctx) {
    if (__DEV__) {
      console.warn("[VerticalVideoFeed] useVerticalVideoFeed called outside of VerticalVideoFeedProvider");
    }
    return noopVerticalVideoFeed;
  }
  return ctx;
}

// ============================================
// Single Video Item Component (uses AdvancedVideoPlayer)
// ============================================
interface VideoItemCardProps {
  item: VideoItem;
  isVisible: boolean;
  onClose: () => void;
}

const VideoItemCard = memo(
  ({ item, isVisible, onClose }: VideoItemCardProps) => {
    const commentsSheet = useCommentsSheet();
    const shareSheet = useShareSheet();

    // Convert VideoItem to VideoData format
    const videoData: VideoData = useMemo(
      () => ({
        id: item.id,
        videoUrl: item.videoUrl,
        thumbnailUrl: item.thumbnailUrl,
        title: item.title,
        description: item.description,
        author: item.author,
        duration: item.duration,
        views: item.views,
        likes: item.likes,
        comments: item.comments,
        shares: item.shares,
      }),
      [item],
    );

    const handleComment = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      commentsSheet.open({
        contentId: item.id,
        contentType: "video",
        title: item.title || "Bình luận",
        showRating: false,
        placeholder: "Viết bình luận về video...",
        onCommentPost: (comment: {
          content: string;
          parentId: string | null;
          rating?: number;
        }) => {
          console.log("New comment:", comment);
        },
        onCommentLike: (commentId: string) => {
          console.log("Liked comment:", commentId);
        },
      });
    }, [item, commentsSheet]);

    const handleShare = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      shareSheet.open({
        item: {
          id: item.id,
          type: "video",
          title: item.title || "Video",
          description: item.description || "",
          url: item.videoUrl,
          imageUrl: item.thumbnailUrl,
        },
        onShare: (platform) => {
          console.log(`Shared video via ${platform}:`, item.id);
        },
        onCopyLink: () => {
          console.log("Link copied for video:", item.id);
        },
      });
    }, [item, shareSheet]);

    const handleLike = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Handle like action
    }, []);

    return (
      <View style={[styles.videoItemContainer, { height: SCREEN_HEIGHT }]}>
        <AdvancedVideoPlayer
          video={videoData}
          isVisible={isVisible}
          autoPlay={true}
          onClose={onClose}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          showOverlay={true}
        />
      </View>
    );
  },
);

VideoItemCard.displayName = "VideoItemCard";

// ============================================
// Provider Component
// ============================================
export function VerticalVideoFeedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleVideoId, setVisibleVideoId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const open = useCallback((newVideos: VideoItem[], initialIndex = 0) => {
    setVideos(newVideos);
    setCurrentIndex(initialIndex);
    setVisibleVideoId(newVideos[initialIndex]?.id || null);
    setIsVisible(true);

    // Scroll to initial index after modal opens
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    }, 100);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setVideos([]);
      setCurrentIndex(0);
      setVisibleVideoId(null);
    }, 300);
  }, []);

  const value = useMemo(
    () => ({ open, close, isOpen: isVisible }),
    [open, close, isVisible],
  );

  // Viewability config for auto-play
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 100,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].item) {
        const item = viewableItems[0].item as VideoItem;
        setVisibleVideoId(item.id);
        setCurrentIndex(viewableItems[0].index || 0);
      }
    },
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: VideoItem }) => {
      const isItemVisible = item.id === visibleVideoId;
      return (
        <VideoItemCard item={item} isVisible={isItemVisible} onClose={close} />
      );
    },
    [visibleVideoId, close],
  );

  const keyExtractor = useCallback((item: VideoItem) => item.id, []);

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <VerticalVideoFeedContext.Provider value={value}>
      {children}

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={close}
      >
        <ShareSheetProvider>
          <CommentsSheetProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent
            />
            <View style={styles.modalContainer}>
              <FlatList
                ref={flatListRef}
                data={videos}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={SCREEN_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                getItemLayout={getItemLayout}
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
                initialScrollIndex={currentIndex}
                onScrollToIndexFailed={(info) => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                      index: info.index,
                      animated: false,
                    });
                  }, 100);
                }}
                removeClippedSubviews={Platform.OS === "android"}
                maxToRenderPerBatch={3}
                windowSize={5}
                initialNumToRender={1}
              />

              {/* Page Indicator */}
              {videos.length > 1 && (
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageText}>
                    {currentIndex + 1} / {videos.length}
                  </Text>
                </View>
              )}
            </View>
          </CommentsSheetProvider>
        </ShareSheetProvider>
      </Modal>
    </VerticalVideoFeedContext.Provider>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoItemContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: "#000",
  },
  pageIndicator: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pageText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
});

export default VerticalVideoFeedProvider;
