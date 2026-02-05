/**
 * Live Streams Screen - TikTok/Facebook Live Style
 * Vertical swipe, real-time comments, gifts, reactions
 * Auto-loads from Pexels API when no real live streams
 *
 * @updated 16/01/2026 - Fixed UI, integrated Pexels videos as live fallback
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { useExternalVideos } from "@/hooks/useExternalContent";
import { getCurrentLiveStreams, LiveStream } from "@/services/liveStream";
// Video playback with expo-video
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Mock comments for demo
const MOCK_COMMENTS = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/50?img=1",
    text: "Công trình đẹp quá! 👍",
    time: Date.now() - 5000,
  },
  {
    id: 2,
    user: "Trần Thị B",
    avatar: "https://i.pravatar.cc/50?img=2",
    text: "Anh ơi phần móng làm thế nào vậy?",
    time: Date.now() - 15000,
  },
  {
    id: 3,
    user: "Lê Văn C",
    avatar: "https://i.pravatar.cc/50?img=3",
    text: "Chào anh! 👋",
    time: Date.now() - 25000,
  },
  {
    id: 4,
    user: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/50?img=4",
    text: "Đội thợ chuyên nghiệp quá",
    time: Date.now() - 35000,
  },
  {
    id: 5,
    user: "Hoàng Văn E",
    avatar: "https://i.pravatar.cc/50?img=5",
    text: "Xin giá xây nhà nhé anh",
    time: Date.now() - 45000,
  },
];

const GIFTS = [
  { id: 1, name: "Hoa", icon: "🌸", value: 1 },
  { id: 2, name: "Tim", icon: "❤️", value: 5 },
  { id: 3, name: "Vương miện", icon: "👑", value: 10 },
  { id: 4, name: "Pháo hoa", icon: "🎉", value: 20 },
  { id: 5, name: "Rocket", icon: "🚀", value: 50 },
];

// Import ExternalVideo type

// Convert external video to LiveStream format
interface CombinedStream extends LiveStream {
  isExternal?: boolean;
}

export default function LiveStreamsScreen() {
  const insets = useSafeAreaInsets();
  const [streams, setStreams] = useState<CombinedStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [showGifts, setShowGifts] = useState(false);
  const [reactions, setReactions] = useState<
    { id: number; emoji: string; y: number }[]
  >([]);
  const [isPaused, setIsPaused] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const giftPanelHeight = useRef(new Animated.Value(0)).current;

  const backgroundColor = useThemeColor({}, "background");

  // External videos from Pexels API - fallback khi không có live thực
  const {
    videos: externalVideos,
    isLoading: videosLoading,
    refetch: refetchVideos,
    loadMore: loadMoreVideos,
    hasMore: hasMoreVideos,
  } = useExternalVideos({
    category: "general",
    perPage: 10,
    enabled: true,
  });

  // Load live streams và merge với external videos
  const loadStreams = useCallback(async () => {
    try {
      // 1. Lấy live streams thực từ API
      const realLiveStreams = await getCurrentLiveStreams(20);

      // 2. Convert external videos thành format LiveStream
      const externalAsLive: CombinedStream[] = externalVideos.map(
        (video, idx) => ({
          id: `external-${video.id}`,
          title: video.title || `Video xây dựng #${idx + 1}`,
          description: video.description || "Video từ Pexels",
          streamUrl: "",
          playbackUrl: video.videoUrl || "",
          streamKey: "",
          status: "live" as const,
          viewerCount: video.views || Math.floor(Math.random() * 5000) + 100,
          startedAt: video.createdAt || new Date().toISOString(),
          hostId: `pexels-${video.id}`,
          hostName: video.author?.name || "Pexels Video",
          hostAvatar:
            video.author?.avatar || `https://i.pravatar.cc/100?u=${video.id}`,
          thumbnailUrl:
            video.thumbnail || `https://picsum.photos/400/600?random=${idx}`,
          isRecording: false,
          settings: {
            quality: "auto" as const,
            enableChat: true,
            enableReactions: true,
            isPrivate: false,
          },
          createdAt: video.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isExternal: true,
        }),
      );

      // 3. Merge: Real live streams trước, rồi đến external videos
      const combined = [...realLiveStreams, ...externalAsLive];
      setStreams(combined);
    } catch (error) {
      console.error("Failed to load live streams:", error);
      // Fallback: Chỉ dùng external videos
      const externalAsLive: CombinedStream[] = externalVideos.map(
        (video, idx) => ({
          id: `external-${video.id}`,
          title: video.title || `Video xây dựng #${idx + 1}`,
          description: video.description || "Video từ Pexels",
          streamUrl: "",
          playbackUrl: video.videoUrl || "",
          streamKey: "",
          status: "live" as const,
          viewerCount: video.views || Math.floor(Math.random() * 5000) + 100,
          startedAt: video.createdAt || new Date().toISOString(),
          hostId: `pexels-${video.id}`,
          hostName: video.author?.name || "Pexels Video",
          hostAvatar:
            video.author?.avatar || `https://i.pravatar.cc/100?u=${video.id}`,
          thumbnailUrl:
            video.thumbnail || `https://picsum.photos/400/600?random=${idx}`,
          isRecording: false,
          settings: {
            quality: "auto" as const,
            enableChat: true,
            enableReactions: true,
            isPrivate: false,
          },
          createdAt: video.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isExternal: true,
        }),
      );
      setStreams(externalAsLive);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [externalVideos]);

  useEffect(() => {
    if (!videosLoading && externalVideos.length > 0) {
      loadStreams();
    }
  }, [externalVideos, videosLoading]);

  // Auto add comments for demo
  useEffect(() => {
    if (streams.length > 0) {
      const interval = setInterval(() => {
        const randomComments = [
          "Công trình tiến độ nhanh quá! 🏗️",
          "Anh ơi tư vấn giá cho em với",
          "Đội thợ làm việc chuyên nghiệp",
          "Phần này làm mất bao lâu vậy anh?",
          "Xin số điện thoại nhé anh",
          "Dự án đẹp quá! 👍",
          "Live hàng ngày nhé anh",
          "Chất lượng video tốt quá 📹",
          "Follow rồi nha ❤️",
        ];
        const newCmt = {
          id: Date.now(),
          user: `User_${Math.floor(Math.random() * 1000)}`,
          avatar: `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`,
          text: randomComments[
            Math.floor(Math.random() * randomComments.length)
          ],
          time: Date.now(),
        };
        setComments((prev) => [...prev, newCmt].slice(-15));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [streams.length]);

  const onRefresh = () => {
    setRefreshing(true);
    refetchVideos();
    loadStreams();
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: "Bạn",
        avatar: "https://i.pravatar.cc/50?img=99",
        text: newComment,
        time: Date.now(),
      };
      setComments((prev) => [...prev, comment].slice(-15));
      setNewComment("");
    }
  };

  const handleLike = () => {
    // Add floating reaction
    const reaction = {
      id: Date.now(),
      emoji: "❤️",
      y: Math.random() * 100,
    };
    setReactions((prev) => [...prev, reaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 2000);
  };

  const handleGift = (gift: (typeof GIFTS)[0]) => {
    const reaction = {
      id: Date.now(),
      emoji: gift.icon,
      y: Math.random() * 100,
    };
    setReactions((prev) => [...prev, reaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 2000);
    setShowGifts(false);
  };

  const toggleGifts = () => {
    const toValue = showGifts ? 0 : 200;
    setShowGifts(!showGifts);
    Animated.spring(giftPanelHeight, {
      toValue,
      useNativeDriver: false,
    }).start();
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80, // Video phải hiển thị 80% mới autoplay
  }).current;

  // Reset pause state khi chuyển video
  useEffect(() => {
    setIsPaused(false);
  }, [currentIndex]);

  // Load more khi gần cuối
  const handleEndReached = () => {
    if (hasMoreVideos && !videosLoading) {
      loadMoreVideos();
    }
  };

  // Video Item Component - extracted to fix hooks rules
  const VideoItemComponent = ({
    item,
    index,
    isCurrentActive,
  }: {
    item: CombinedStream;
    index: number;
    isCurrentActive: boolean;
  }) => {
    const [videoLoading, setVideoLoading] = useState(true);
    const player = useVideoPlayer(item.playbackUrl || null, (player) => {
      player.loop = true;
      player.muted = false;
    });
    const status = useEvent(player, "statusChange", { status: player.status });

    useEffect(() => {
      if (!item.playbackUrl) return;
      setVideoLoading(status.status !== "readyToPlay");
      if (status.status === "error") {
        console.log("Video error:", status.error?.message || "Unknown error");
      }
    }, [item.playbackUrl, status]);

    useEffect(() => {
      if (!item.playbackUrl) return;
      if (isCurrentActive && !isPaused) {
        player.play();
      } else {
        player.pause();
      }
    }, [isCurrentActive, isPaused, item.playbackUrl, player]);

    return (
      <View style={styles.videoContainer}>
        {/* Thumbnail as background while loading */}
        <Image
          source={{ uri: item.thumbnailUrl || "https://picsum.photos/400/800" }}
          style={[styles.video, styles.thumbnailBg]}
          blurRadius={2}
        />

        {/* Video Player */}
        {item.playbackUrl ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
            onFirstFrameRender={() => setVideoLoading(false)}
          />
        ) : (
          <Image
            source={{
              uri: item.thumbnailUrl || "https://picsum.photos/400/800",
            }}
            style={styles.video}
          />
        )}

        {/* Loading indicator */}
        {videoLoading && isCurrentActive && item.playbackUrl && (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Gradient Overlays */}
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.bottomGradient}
        />

        {/* Touch to Pause/Play */}
        <TouchableOpacity
          style={styles.touchOverlay}
          activeOpacity={1}
          onPress={() => setIsPaused(!isPaused)}
        >
          {isPaused && isCurrentActive && (
            <View style={styles.pauseIcon}>
              <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </TouchableOpacity>

        {/* Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                {item.isExternal ? "VIDEO" : "LIVE"}
              </Text>
            </View>
            <View style={styles.viewerBadge}>
              <Ionicons name="eye" size={14} color="#fff" />
              <Text style={styles.viewerText}>
                {formatViewerCount(item.viewerCount)}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Host Info */}
        <View style={styles.hostInfo}>
          <Image source={{ uri: item.hostAvatar }} style={styles.hostAvatar} />
          <View style={styles.hostDetails}>
            <Text style={styles.hostName}>{item.hostName}</Text>
            <Text style={styles.streamTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons name="heart" size={32} color="#fff" />
            <Text style={styles.actionCount}>
              {formatViewerCount(Math.floor(item.viewerCount * 0.3))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
            <Text style={styles.actionCount}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={toggleGifts}>
            <Text style={styles.giftEmoji}>🎁</Text>
            <Text style={styles.actionCount}>Quà</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social" size={28} color="#fff" />
            <Text style={styles.actionCount}>Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="bookmark-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <ScrollView
            style={styles.commentsScroll}
            showsVerticalScrollIndicator={false}
          >
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentBubble}>
                <Image
                  source={{ uri: comment.avatar }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Floating Reactions */}
        <View style={styles.reactionsContainer}>
          {reactions.map((reaction) => (
            <Animated.Text
              key={reaction.id}
              style={[styles.floatingReaction, { bottom: 150 + reaction.y }]}
            >
              {reaction.emoji}
            </Animated.Text>
          ))}
        </View>

        {/* Bottom Input */}
        <View
          style={[styles.bottomInput, { paddingBottom: insets.bottom + 10 }]}
        >
          <TextInput
            style={styles.commentInput}
            placeholder="Bình luận..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleSendComment}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendComment}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.emojiButton}>
            <Text style={styles.emoji}>😀</Text>
          </TouchableOpacity>
        </View>

        {/* Gift Panel */}
        <Animated.View style={[styles.giftPanel, { height: giftPanelHeight }]}>
          <View style={styles.giftHeader}>
            <Text style={styles.giftTitle}>Gửi quà tặng</Text>
            <TouchableOpacity onPress={toggleGifts}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {GIFTS.map((gift) => (
              <TouchableOpacity
                key={gift.id}
                style={styles.giftItem}
                onPress={() => handleGift(gift)}
              >
                <Text style={styles.giftIcon}>{gift.icon}</Text>
                <Text style={styles.giftName}>{gift.name}</Text>
                <Text style={styles.giftValue}>{gift.value} 💎</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    );
  };

  // Loading State
  if (loading || videosLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#FF2D55" />
        <Text style={styles.loadingText}>Đang tải video...</Text>
      </View>
    );
  }

  // Empty State - không có video nào
  if (streams.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyContent}>
          <Ionicons name="videocam-off-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa có Live Stream</Text>
          <Text style={styles.emptySubtitle}>
            Hãy là người đầu tiên phát trực tiếp!
          </Text>
          <TouchableOpacity
            style={styles.goLiveButton}
            onPress={() => router.push("/live/create")}
          >
            <Ionicons name="videocam" size={24} color="#fff" />
            <Text style={styles.goLiveText}>Bắt đầu Live</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <FlatList
        ref={flatListRef}
        data={streams}
        renderItem={({ item, index }) => (
          <VideoItemComponent
            item={item}
            index={index}
            isCurrentActive={index === currentIndex}
          />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Page Indicator */}
      <View style={[styles.pageIndicator, { top: insets.top + 60 }]}>
        <Text style={styles.pageText}>
          {currentIndex + 1}/{streams.length}
        </Text>
      </View>
    </View>
  );
}

function formatViewerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  thumbnailBg: {
    zIndex: -1,
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  pauseIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -30,
    marginTop: -30,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 2,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
    zIndex: 2,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  topCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF2D55",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  liveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  viewerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  viewerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  menuButton: {
    padding: 8,
  },
  hostInfo: {
    position: "absolute",
    bottom: 180,
    left: 16,
    right: 80,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FF2D55",
  },
  hostDetails: {
    flex: 1,
    marginLeft: 12,
  },
  hostName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  streamTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF2D55",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  followText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  rightActions: {
    position: "absolute",
    right: 12,
    bottom: 200,
    alignItems: "center",
    gap: 20,
    zIndex: 10,
  },
  actionBtn: {
    alignItems: "center",
  },
  actionCount: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  giftEmoji: {
    fontSize: 28,
  },
  commentsSection: {
    position: "absolute",
    bottom: 120,
    left: 12,
    right: 80,
    maxHeight: 200,
    zIndex: 10,
  },
  commentsScroll: {
    flex: 1,
  },
  commentBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 12,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  commentText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
  },
  reactionsContainer: {
    position: "absolute",
    right: 60,
    bottom: 250,
    zIndex: 15,
  },
  floatingReaction: {
    position: "absolute",
    fontSize: 36,
    right: 0,
  },
  bottomInput: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF2D55",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 28,
  },
  giftPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    zIndex: 20,
  },
  giftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  giftTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  giftItem: {
    alignItems: "center",
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    minWidth: 80,
  },
  giftIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  giftName: {
    fontSize: 12,
    color: "#333",
    marginBottom: 2,
  },
  giftValue: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  pageIndicator: {
    position: "absolute",
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 20,
  },
  pageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  goLiveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF2D55",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  goLiveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
