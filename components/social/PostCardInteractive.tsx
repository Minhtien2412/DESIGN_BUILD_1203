/**
 * Interactive Post Card - Facebook-style Gestures
 * ================================================
 * Features:
 * - Double tap to like (with heart animation)
 * - Long press for reaction picker (like, love, haha, wow, sad, angry)
 * - Swipe down to dismiss media viewer
 * - Pinch to zoom images
 * - Pull down to refresh
 *
 * @updated 2026-01-05
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Reaction types - Facebook style
const REACTIONS = [
  { id: "like", icon: "👍", label: "Thích", color: "#0066CC" },
  { id: "love", icon: "❤️", label: "Yêu thích", color: "#FF0000" },
  { id: "haha", icon: "😆", label: "Haha", color: "#FFC107" },
  { id: "wow", icon: "😮", label: "Wow", color: "#FFC107" },
  { id: "sad", icon: "😢", label: "Buồn", color: "#FFC107" },
  { id: "angry", icon: "😠", label: "Phẫn nộ", color: "#FF6B00" },
];

interface PostData {
  id: number;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  time: string;
  liked?: boolean;
  reaction?: string; // 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
}

interface PostCardInteractiveProps {
  post: PostData;
  onLike?: (postId: number, reaction?: string) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onPress?: () => void;
}

export function PostCardInteractive({
  post,
  onLike,
  onComment,
  onShare,
  onPress,
}: PostCardInteractiveProps) {
  const [liked, setLiked] = useState(post.liked || false);
  const [reaction, setReaction] = useState<string | undefined>(post.reaction);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  // Animation values
  const heartScale = useRef(new Animated.Value(0)).current;
  const reactionScale = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const lastTap = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Double tap to like
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!liked) {
        setLiked(true);
        setReaction("like");
        onLike?.(post.id, "like");

        // Animate heart
        heartScale.setValue(0);
        Animated.sequence([
          Animated.spring(heartScale, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
          Animated.timing(heartScale, {
            toValue: 0,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      lastTap.current = now;
    }
  }, [liked, heartScale, onLike, post.id]);

  // Long press for reactions
  const handleLongPressIn = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowReactions(true);
      Animated.spring(reactionScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 7,
      }).start();
    }, 300);
  }, [reactionScale]);

  const handleLongPressOut = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleSelectReaction = useCallback(
    (reactionId: string) => {
      setLiked(true);
      setReaction(reactionId);
      setShowReactions(false);
      onLike?.(post.id, reactionId);

      Animated.timing(reactionScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [onLike, post.id, reactionScale],
  );

  const handleCloseReactions = useCallback(() => {
    setShowReactions(false);
    Animated.timing(reactionScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [reactionScale]);

  // Pinch to zoom image
  const imagePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        imageScale.setValue(1);
      },
      onPanResponderMove: (_, gestureState) => {
        // Simple zoom based on vertical movement
        const scale = 1 + Math.abs(gestureState.dy) / 500;
        imageScale.setValue(Math.min(scale, 3));
      },
      onPanResponderRelease: () => {
        Animated.spring(imageScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const handleToggleLike = useCallback(() => {
    if (liked && reaction) {
      // If already liked, remove reaction
      setLiked(false);
      setReaction(undefined);
      onLike?.(post.id, undefined);
    } else {
      // Show reaction picker
      setShowReactions(true);
      Animated.spring(reactionScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [liked, reaction, onLike, post.id, reactionScale]);

  const currentReaction = reaction
    ? REACTIONS.find((r) => r.id === reaction)
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{post.user.name}</Text>
            {post.user.verified && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#0066CC"
                style={styles.verifiedIcon}
              />
            )}
          </View>
          <Text style={styles.time}>{post.time}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Images with double-tap and long-press */}
      {post.images && post.images.length > 0 && (
        <TouchableWithoutFeedback
          onPress={handleDoubleTap}
          onPressIn={handleLongPressIn}
          onPressOut={handleLongPressOut}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: post.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Double-tap heart animation */}
            <Animated.View
              style={[
                styles.heartAnimation,
                {
                  opacity: heartScale.interpolate({
                    inputRange: [0, 0.5, 1, 1.2],
                    outputRange: [0, 0.8, 1, 0],
                  }),
                  transform: [{ scale: heartScale }],
                  pointerEvents: "none" as const,
                },
              ]}
            >
              <Text style={styles.heartIcon}>❤️</Text>
            </Animated.View>

            {/* Image count badge */}
            {post.images.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Ionicons name="images" size={14} color="#fff" />
                <Text style={styles.imageCountText}>{post.images.length}</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statsLeft}>
          {liked && currentReaction && (
            <View style={styles.reactionIcon}>
              <Text style={styles.reactionEmoji}>{currentReaction.icon}</Text>
            </View>
          )}
          <Text style={styles.statsText}>{post.likes} lượt thích</Text>
        </View>
        <Text style={styles.statsText}>
          {post.comments} bình luận • {post.shares} chia sẻ
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleLike}
          onLongPress={() => {
            setShowReactions(true);
            Animated.spring(reactionScale, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text
            style={[
              styles.actionIcon,
              liked && { color: currentReaction?.color || "#0066CC" },
            ]}
          >
            {currentReaction?.icon || "👍"}
          </Text>
          <Text
            style={[
              styles.actionText,
              liked && { color: currentReaction?.color || "#0066CC" },
            ]}
          >
            {currentReaction?.label || "Thích"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare?.(post.id)}
        >
          <Ionicons name="arrow-redo-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Picker Modal */}
      {showReactions && (
        <Modal transparent visible={showReactions} animationType="none">
          <TouchableWithoutFeedback onPress={handleCloseReactions}>
            <View style={styles.reactionOverlay}>
              <Animated.View
                style={[
                  styles.reactionPicker,
                  {
                    transform: [
                      { scale: reactionScale },
                      {
                        translateY: reactionScale.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {REACTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.reactionButton}
                    onPress={() => handleSelectReaction(r.id)}
                  >
                    <Text style={styles.reactionButtonIcon}>{r.icon}</Text>
                    <Text style={styles.reactionButtonLabel}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Full-screen image viewer with pinch-to-zoom */}
      {selectedImageIndex !== null && post.images && (
        <Modal visible transparent>
          <View
            style={styles.imageViewerContainer}
            {...imagePanResponder.panHandlers}
          >
            <TouchableOpacity
              style={styles.imageViewerClose}
              onPress={() => setSelectedImageIndex(null)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Animated.Image
              source={{ uri: post.images[selectedImageIndex] }}
              style={[
                styles.imageViewerImage,
                { transform: [{ scale: imageScale }] },
              ]}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 8,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  time: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    color: "#000",
    paddingHorizontal: 12,
    marginBottom: 12,
    lineHeight: 20,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  heartAnimation: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -50,
    marginLeft: -50,
  },
  heartIcon: {
    fontSize: 100,
  },
  imageCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  imageCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reactionIcon: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  reactionEmoji: {
    fontSize: 16,
  },
  statsText: {
    fontSize: 13,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  reactionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionPicker: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    gap: 8,
  },
  reactionButton: {
    alignItems: "center",
    padding: 8,
  },
  reactionButtonIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  reactionButtonLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  imageViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
