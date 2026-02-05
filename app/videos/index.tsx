/**
 * Short Videos Feed Screen (TikTok-style)
 * Vertical swipe video player with comments, likes, share
 * @updated 2025-12-24
 */

import { OptimizedImage } from "@/components/ui/optimized-image";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useGlobalMute, useVideoPlayback } from "@/hooks/useVideoPlayback";
import {
    MOCK_COMMENTS,
    MOCK_VIDEOS,
    ShortVideoService,
    type ShortVideo,
    type VideoComment,
} from "@/services/shortVideoService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    type ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Use types from service
type Comment = VideoComment;

export default function ShortVideosScreen() {
  const [videos, setVideos] = useState<ShortVideo[]>(MOCK_VIDEOS); // Start with mock data
  const [loading, setLoading] = useState(false); // Don't block on loading
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Use global mute hook and ensure unmuted when entering screen
  const { setMuted } = useGlobalMute();

  // Unmute when entering the video screen (better UX)
  useEffect(() => {
    // Reset to unmuted when entering video screen
    setMuted(false);
  }, [setMuted]);

  // Fetch videos from API (background, non-blocking)
  const fetchVideos = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await ShortVideoService.getVideos(1, 20);
      clearTimeout(timeoutId);

      if (response.videos.length > 0) {
        setVideos(response.videos);
      }
    } catch (error) {
      console.warn("Failed to fetch videos, using mock data:", error);
      // Keep existing mock data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch in background after initial render
    const timer = setTimeout(() => {
      fetchVideos();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchVideos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, [fetchVideos]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null) {
          setCurrentIndex(index);
        }
      }
    },
  ).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const renderVideo = ({
    item,
    index,
  }: {
    item: ShortVideo;
    index: number;
  }) => (
    <VideoItem
      video={item}
      isActive={index === currentIndex}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item.id)}
      onShare={() => handleShare(item)}
      onFollow={() => handleFollow(item.id)}
    />
  );

  const handleLike = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              liked: !v.liked,
              likes: v.liked ? v.likes - 1 : v.likes + 1,
            }
          : v,
      ),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleComment = (videoId: string) => {
    setActiveVideoId(videoId);
    setShowComments(true);
  };

  const handleShare = async (video: ShortVideo) => {
    try {
      await Share.share({
        message: `Check out this amazing video by ${video.userName}! 🎬\n\n"${video.caption}"\n\nWatch on ThietKeResort App`,
        title: video.caption,
      });
      // Update share count
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, shares: v.shares + 1 } : v,
        ),
      );
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleFollow = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, following: !v.following } : v,
      ),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Đang tải video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews
        maxToRenderPerBatch={2}
        windowSize={3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0066CC"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có video</Text>
          </View>
        }
      />

      {/* Comments Bottom Sheet */}
      <CommentsSheet
        visible={showComments}
        videoId={activeVideoId}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}

interface VideoItemProps {
  video: ShortVideo;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onFollow: () => void;
}

function VideoItem({
  video,
  isActive,
  onLike,
  onComment,
  onShare,
  onFollow,
}: VideoItemProps) {
  const textColor = useThemeColor({}, "text");
  const [liked, setLiked] = useState(video.liked);
  const [following, setFollowing] = useState(video.following);
  const [showHeart, setShowHeart] = useState(false);
  const [progress, setProgress] = useState(0);

  // Use centralized video playback controller - ensures only 1 video plays at a time
  const { isPlaying, registerPlayer, play, pause } = useVideoPlayback(video.id);
  const { isMuted, toggleMute } = useGlobalMute();

  // Animations
  const heartScale = useRef(new Animated.Value(0)).current;
  const likeButtonScale = useRef(new Animated.Value(1)).current;
  const discRotation = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number | null>(null);

  // Video player setup
  const player = useVideoPlayer(video.videoUrl, (player) => {
    player.loop = true;
    player.muted = isMuted;
  });

  // Register player with controller when mounted
  useEffect(() => {
    if (player) {
      registerPlayer(player);
    }
  }, [player, registerPlayer]);

  // Auto-play when this video becomes active (visible in viewport)
  // VideoPlayerController ensures only 1 video plays at a time
  useEffect(() => {
    if (isActive) {
      // Play through controller - it will pause any other playing video
      play();
    } else {
      // Pause when not visible
      pause();
      setProgress(0);
    }
  }, [isActive, play, pause]);

  // Sync mute state with player
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  // Track video progress
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (player && video.duration) {
        // This is a mock - real implementation would get actual playback position
        setProgress((prev) => {
          const newProgress = prev + 100 / video.duration;
          return newProgress >= 100 ? 0 : newProgress;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, player, video.duration]);

  // Rotate disc animation
  useEffect(() => {
    if (isActive && !isMuted) {
      Animated.loop(
        Animated.timing(discRotation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      discRotation.setValue(0);
    }
  }, [isActive, isMuted, discRotation]);

  // Double tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!liked) {
        setLiked(true);
        onLike();

        // Show heart animation
        setShowHeart(true);
        Animated.sequence([
          Animated.spring(heartScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
          }),
          Animated.timing(heartScale, {
            toValue: 0,
            delay: 500,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setShowHeart(false));
      }
    } else {
      lastTap.current = now;
    }
  };

  const handleLikePress = () => {
    setLiked(!liked);
    onLike();

    // Button scale animation
    Animated.sequence([
      Animated.timing(likeButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(likeButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }),
    ]).start();
  };

  const handleFollowPress = () => {
    setFollowing(!following);
    onFollow();
  };

  const handleMuteToggle = () => {
    // Use global mute toggle - affects all videos
    toggleMute();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={styles.videoContainer}>
        {/* Actual Video Player */}
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Double-tap heart animation */}
        {showHeart && (
          <Animated.View
            style={[
              styles.doubleTapHeart,
              { transform: [{ scale: heartScale }] },
            ]}
          >
            <Ionicons name="heart" size={100} color="#FFFFFF" />
          </Animated.View>
        )}

        {/* Play/Pause overlay */}
        {!isActive && (
          <View style={styles.pausedOverlay}>
            <Ionicons
              name="play-circle"
              size={64}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        )}

        {/* Top gradient */}
        <View style={styles.topGradient} />

        {/* Video progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Sound control button */}
        <Pressable style={styles.muteButton} onPress={handleMuteToggle}>
          <Ionicons
            name={isMuted ? "volume-mute" : "volume-high"}
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        {/* Bottom gradient */}
        <View style={styles.bottomGradient} />

        {/* User info and caption */}
        <View style={styles.bottomContent}>
          <View style={styles.userInfoRow}>
            <View style={styles.userInfo}>
              <OptimizedImage
                uri={video.userAvatar}
                width={40}
                height={40}
                borderRadius={20}
              />
              <Text style={styles.userName}>{video.userName}</Text>
              {!following && (
                <Pressable
                  style={styles.followButton}
                  onPress={handleFollowPress}
                >
                  <Ionicons name="add" size={14} color="#000" />
                </Pressable>
              )}
            </View>
          </View>
          <Text style={styles.caption} numberOfLines={2}>
            {video.caption}
          </Text>
          {video.soundName && (
            <View style={styles.soundInfo}>
              <Ionicons name="musical-notes" size={14} color="#FFFFFF" />
              <Text style={styles.soundName} numberOfLines={1}>
                {video.soundName}
              </Text>
            </View>
          )}
          <Text style={styles.views}>{formatViews(video.views)} views</Text>
        </View>

        {/* Right action buttons */}
        <View style={styles.actionButtons}>
          {/* Like */}
          <Animated.View style={{ transform: [{ scale: likeButtonScale }] }}>
            <Pressable style={styles.actionButton} onPress={handleLikePress}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={32}
                color={liked ? "#000000" : "#FFFFFF"}
              />
              <Text style={styles.actionText}>
                {formatCount(video.likes + (liked && !video.liked ? 1 : 0))}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Comment */}
          <Pressable style={styles.actionButton} onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>{formatCount(video.comments)}</Text>
          </Pressable>

          {/* Share */}
          <Pressable style={styles.actionButton} onPress={onShare}>
            <Ionicons name="arrow-redo-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>{formatCount(video.shares)}</Text>
          </Pressable>

          {/* Rotating disc for sound */}
          <Animated.View
            style={[
              styles.soundDisc,
              {
                transform: [
                  {
                    rotate: discRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="disc" size={40} color="#FFFFFF" />
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

function formatCount(count: number | undefined): string {
  if (count === undefined || count === null) return "0";
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function formatViews(views: number | undefined): string {
  return formatCount(views);
}

// ============================================
// Comments Bottom Sheet Component
// ============================================
interface CommentsSheetProps {
  visible: boolean;
  videoId: string | null;
  onClose: () => void;
}

function CommentsSheet({ visible, videoId, onClose }: CommentsSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Fetch comments from API
  const fetchComments = useCallback(async (vidId: string) => {
    setLoadingComments(true);
    try {
      const response = await ShortVideoService.getVideoComments(vidId);
      setComments(response.comments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments(MOCK_COMMENTS[vidId] || []);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (visible && videoId) {
      fetchComments(videoId);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, videoId, slideAnim, fetchComments]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !videoId) return;

    // Optimistic update
    const comment: Comment = {
      id: `c_${Date.now()}`,
      userId: "me",
      userName: "You",
      userAvatar: "https://i.pravatar.cc/150?img=20",
      text: newComment,
      likes: 0,
      liked: false,
      timestamp: "Vừa xong",
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    setReplyTo(null);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Try to send to API
    try {
      await ShortVideoService.addComment(videoId, newComment);
    } catch (error) {
      console.warn("Failed to send comment to API:", error);
      // Keep optimistic update - comment already shows locally
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              liked: !c.liked,
              likes: c.liked ? c.likes - 1 : c.likes + 1,
            }
          : c,
      ),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.userName} `);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={commentsStyles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          commentsStyles.container,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={commentsStyles.header}>
          <View style={commentsStyles.handle} />
          <Text style={commentsStyles.title}>{comments.length} Comments</Text>
          <TouchableOpacity onPress={onClose} style={commentsStyles.closeBtn}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <ScrollView
          style={commentsStyles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {comments.length === 0 ? (
            <View style={commentsStyles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
              <Text style={commentsStyles.emptyText}>No comments yet</Text>
              <Text style={commentsStyles.emptySubtext}>
                Be the first to comment!
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={commentsStyles.commentItem}>
                <Image
                  source={{ uri: comment.userAvatar }}
                  style={commentsStyles.avatar}
                />
                <View style={commentsStyles.commentContent}>
                  <Text style={commentsStyles.userName}>
                    {comment.userName}
                  </Text>
                  <Text style={commentsStyles.commentText}>{comment.text}</Text>
                  <View style={commentsStyles.commentActions}>
                    <Text style={commentsStyles.timestamp}>
                      {comment.timestamp}
                    </Text>
                    <TouchableOpacity onPress={() => handleReply(comment)}>
                      <Text style={commentsStyles.replyBtn}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={commentsStyles.likeBtn}
                  onPress={() => handleLikeComment(comment.id)}
                >
                  <Ionicons
                    name={comment.liked ? "heart" : "heart-outline"}
                    size={18}
                    color={comment.liked ? "#000000" : "#666"}
                  />
                  <Text
                    style={[
                      commentsStyles.likeCount,
                      comment.liked && { color: "#000000" },
                    ]}
                  >
                    {comment.likes}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={commentsStyles.inputContainer}>
            {replyTo && (
              <View style={commentsStyles.replyingTo}>
                <Text style={commentsStyles.replyingText}>
                  Replying to @{replyTo.userName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setReplyTo(null);
                    setNewComment("");
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            <View style={commentsStyles.inputRow}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=20" }}
                style={commentsStyles.inputAvatar}
              />
              <TextInput
                style={commentsStyles.input}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  commentsStyles.sendBtn,
                  !newComment.trim() && commentsStyles.sendBtnDisabled,
                ]}
                onPress={handleSendComment}
                disabled={!newComment.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={newComment.trim() ? "#fff" : "#999"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const commentsStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  handle: {
    position: "absolute",
    top: 8,
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 12,
    padding: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  commentItem: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  replyBtn: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  likeBtn: {
    alignItems: "center",
    gap: 2,
  },
  likeCount: {
    fontSize: 11,
    color: "#666",
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  replyingTo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  replyingText: {
    fontSize: 13,
    color: "#666",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    maxHeight: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#f0f0f0",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: "relative",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  pausedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  bottomContent: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 80,
  },
  userInfoRow: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  followButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -4,
  },
  caption: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  soundInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  soundName: {
    color: "#FFFFFF",
    fontSize: 12,
    flex: 1,
  },
  views: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  muteButton: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  doubleTapHeart: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -50,
    marginTop: -50,
    zIndex: 100,
  },
  actionButtons: {
    position: "absolute",
    right: 16,
    bottom: 80,
    gap: 24,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  soundDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#FFFFFF",
  },
  emptyContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
});
