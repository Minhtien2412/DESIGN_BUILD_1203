/**
 * VerticalVideoFeed - Facebook/TikTok Style Vertical Video Viewer
 * ================================================================
 *
 * Full-screen vertical video feed with swipe up/down navigation.
 * Features:
 * - Full-screen video playback
 * - Swipe up to next video, swipe down to previous
 * - Auto-play current video, pause others
 * - Video info overlay (title, description, author)
 * - Like, comment, share actions
 * - Close button to return
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import CommentsSheet hook - will be used in VideoItemCard
// Note: This is imported here to avoid circular dependencies
import { CommentsSheetProvider, useCommentsSheet } from "./CommentsSheet";

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

export function useVerticalVideoFeed() {
  const ctx = useContext(VerticalVideoFeedContext);
  if (!ctx) {
    throw new Error(
      "useVerticalVideoFeed must be used within VerticalVideoFeedProvider",
    );
  }
  return ctx;
}

// ============================================
// Single Video Item Component
// ============================================
interface VideoItemCardProps {
  item: VideoItem;
  isVisible: boolean;
  onClose: () => void;
}

const VideoItemCard = memo(
  ({ item, isVisible, onClose }: VideoItemCardProps) => {
    const videoRef = useRef<Video>(null);
    const commentsSheet = useCommentsSheet();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [commentsCount, setCommentsCount] = useState(item.comments || 0);
    const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressWidth = useSharedValue(0);
    const insets = useSafeAreaInsets();

    // Auto-play when visible
    useEffect(() => {
      if (isVisible) {
        videoRef.current?.playAsync();
      } else {
        videoRef.current?.pauseAsync();
        videoRef.current?.setPositionAsync(0);
      }
    }, [isVisible]);

    // Auto-hide controls
    useEffect(() => {
      if (isPlaying && showControls) {
        controlsTimer.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
      return () => {
        if (controlsTimer.current) {
          clearTimeout(controlsTimer.current);
        }
      };
    }, [isPlaying, showControls]);

    const handlePlaybackStatusUpdate = useCallback(
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;

        setIsPlaying(status.isPlaying);

        if (status.durationMillis) {
          setDuration(status.durationMillis / 1000);
        }

        if (status.durationMillis && status.positionMillis) {
          const newProgress = status.positionMillis / status.durationMillis;
          setProgress(newProgress);
          progressWidth.value = withTiming(newProgress * 100, {
            duration: 100,
          });
        }

        // Loop video
        if (status.didJustFinish) {
          videoRef.current?.setPositionAsync(0);
          videoRef.current?.playAsync();
        }
      },
      [progressWidth],
    );

    const handleTap = useCallback(() => {
      setShowControls(true);
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }

      if (isPlaying) {
        videoRef.current?.pauseAsync();
      } else {
        videoRef.current?.playAsync();
      }
    }, [isPlaying]);

    const handleMuteToggle = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsMuted(!isMuted);
      videoRef.current?.setIsMutedAsync(!isMuted);
    }, [isMuted]);

    const handleLike = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLiked(!isLiked);
    }, [isLiked]);

    const handleComment = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Pause video when opening comments
      videoRef.current?.pauseAsync();

      // Open comments sheet
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
          setCommentsCount((prev) => prev + 1);
        },
        onCommentLike: (commentId: string) => {
          console.log("Liked comment:", commentId);
        },
      });
    }, [item, commentsSheet]);

    const handleShare = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Share video
    }, []);

    const formatNumber = (num?: number): string => {
      if (!num) return "0";
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progressStyle = useAnimatedStyle(() => ({
      width: `${progressWidth.value}%`,
    }));

    return (
      <View style={[styles.videoItemContainer, { height: SCREEN_HEIGHT }]}>
        {/* Video */}
        <Video
          ref={videoRef}
          source={{ uri: item.videoUrl }}
          style={styles.fullScreenVideo}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          posterSource={
            item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined
          }
          usePoster={!!item.thumbnailUrl}
          posterStyle={styles.videoPoster}
        />

        {/* Tap Area */}
        <Pressable style={styles.tapArea} onPress={handleTap}>
          {/* Play/Pause Indicator */}
          {!isPlaying && showControls && (
            <Animated.View
              style={styles.playIndicator}
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(150)}
            >
              <View style={styles.playButton}>
                <Ionicons name="play" size={50} color="white" />
              </View>
            </Animated.View>
          )}
        </Pressable>

        {/* Top Gradient & Header */}
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={[styles.topGradient, { paddingTop: insets.top }]}
          pointerEvents="box-none"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {item.title || "Video"}
            </Text>

            <TouchableOpacity
              style={styles.muteButton}
              onPress={handleMuteToggle}
            >
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Bottom Gradient & Info */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={[styles.bottomGradient, { paddingBottom: insets.bottom + 20 }]}
          pointerEvents="box-none"
        >
          {/* Video Info */}
          <View style={styles.videoInfo}>
            {/* Author */}
            {item.author && (
              <View style={styles.authorRow}>
                {item.author.avatar ? (
                  <Image
                    source={{ uri: item.author.avatar }}
                    style={styles.authorAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.authorAvatarPlaceholder}>
                    <Ionicons name="person" size={16} color="white" />
                  </View>
                )}
                <Text style={styles.authorName}>{item.author.name}</Text>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Theo dõi</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Description */}
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>{formatNumber(item.views)}</Text>
              </View>
              {duration > 0 && (
                <View style={styles.statItem}>
                  <Ionicons
                    name="time"
                    size={14}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.statText}>
                    {formatDuration(duration)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </LinearGradient>

        {/* Right Side Actions */}
        <View style={[styles.actionsColumn, { bottom: insets.bottom + 100 }]}>
          {/* Like */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={32}
              color={isLiked ? "#FF2D55" : "white"}
            />
            <Text style={styles.actionText}>{formatNumber(item.likes)}</Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Ionicons name="chatbubble-outline" size={30} color="white" />
            <Text style={styles.actionText}>{formatNumber(commentsCount)}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={30} color="white" />
            <Text style={styles.actionText}>{formatNumber(item.shares)}</Text>
          </TouchableOpacity>
        </View>
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
  fullScreenVideo: {
    width: "100%",
    height: "100%",
  },
  videoPoster: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playIndicator: {
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 6,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginHorizontal: 12,
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  videoInfo: {
    marginBottom: 12,
    paddingRight: 70, // Space for action buttons
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "white",
  },
  authorAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    marginLeft: 10,
  },
  followButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "white",
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 1.5,
  },
  actionsColumn: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    gap: 20,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
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
