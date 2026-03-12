/**
 * Livestream Viewer Screen
 * Watch livestreams with interactive features
 *
 * @created 19/01/2026
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import livestreamSocketService, {
    LivestreamComment,
    LivestreamGift,
    LivestreamPoll,
} from "@/services/communication/livestreamSocket.service";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

interface GiftAnimation {
  id: string;
  gift: LivestreamGift;
  position: Animated.ValueXY;
  opacity: Animated.Value;
}

interface LikeAnimation {
  id: string;
  position: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

// ============================================================================
// Gift Types
// ============================================================================

const GIFT_TYPES = [
  { id: "heart", name: "Tim", icon: "❤️", cost: 10 },
  { id: "star", name: "Sao", icon: "⭐", cost: 50 },
  { id: "fire", name: "Lửa", icon: "🔥", cost: 100 },
  { id: "diamond", name: "Kim cương", icon: "💎", cost: 500 },
  { id: "crown", name: "Vương miện", icon: "👑", cost: 1000 },
  { id: "rocket", name: "Tên lửa", icon: "🚀", cost: 2000 },
];

// ============================================================================
// Main Component
// ============================================================================

export default function LivestreamViewerScreen() {
  const { streamId } = useLocalSearchParams<{ streamId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // State
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<LivestreamComment[]>([]);
  const [activePoll, setActivePoll] = useState<LivestreamPoll | null>(null);
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(
    null
  );
  const [streamEnded, setStreamEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input state
  const [commentText, setCommentText] = useState("");
  const [showGiftPanel, setShowGiftPanel] = useState(false);

  // Animations
  const [giftAnimations, setGiftAnimations] = useState<GiftAnimation[]>([]);
  const [likeAnimations, setLikeAnimations] = useState<LikeAnimation[]>([]);

  // Refs
  const commentsListRef = useRef<FlatList>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  // =========================================================================
  // Connection & Event Setup
  // =========================================================================

  useEffect(() => {
    if (!streamId) {
      setError("Stream ID not found");
      setConnecting(false);
      return;
    }

    const setupConnection = async () => {
      try {
        await livestreamSocketService.connect();
        setConnected(true);
        setConnecting(false);

        // Join stream
        livestreamSocketService.joinStream(streamId);

        // Setup event listeners
        setupEventListeners();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed");
        setConnecting(false);
      }
    };

    setupConnection();

    return () => {
      if (streamId) {
        livestreamSocketService.leaveStream(streamId);
      }
      cleanupRef.current.forEach((cleanup) => cleanup());
      livestreamSocketService.disconnect();
    };
  }, [streamId]);

  const setupEventListeners = () => {
    // Viewer count
    const unsubViewerCount = livestreamSocketService.onViewerCount(
      ({ count }) => {
        setViewerCount(count);
      }
    );
    cleanupRef.current.push(unsubViewerCount);

    // New comment
    const unsubComment = livestreamSocketService.onNewComment((comment) => {
      setComments((prev) => [...prev.slice(-99), comment]);
    });
    cleanupRef.current.push(unsubComment);

    // Gift received
    const unsubGift = livestreamSocketService.onGiftReceived((gift) => {
      animateGift(gift);
    });
    cleanupRef.current.push(unsubGift);

    // Like received
    const unsubLike = livestreamSocketService.onLikeReceived(
      ({ totalLikes }) => {
        setLikeCount(totalLikes);
      }
    );
    cleanupRef.current.push(unsubLike);

    // Poll created
    const unsubPollCreated = livestreamSocketService.onPollCreated((poll) => {
      setActivePoll(poll);
      setSelectedPollOption(null);
    });
    cleanupRef.current.push(unsubPollCreated);

    // Poll updated
    const unsubPollUpdated = livestreamSocketService.onPollUpdated((poll) => {
      setActivePoll(poll);
    });
    cleanupRef.current.push(unsubPollUpdated);

    // Stream ended
    const unsubEnded = livestreamSocketService.onStreamEnded(() => {
      setStreamEnded(true);
    });
    cleanupRef.current.push(unsubEnded);

    // Error
    const unsubError = livestreamSocketService.onError(({ message }) => {
      setError(message);
    });
    cleanupRef.current.push(unsubError);
  };

  // =========================================================================
  // Animations
  // =========================================================================

  const animateGift = useCallback((gift: LivestreamGift) => {
    const animId = `gift-${Date.now()}-${Math.random()}`;
    const position = new Animated.ValueXY({ x: 50, y: SCREEN_HEIGHT - 300 });
    const opacity = new Animated.Value(1);

    const newAnim: GiftAnimation = { id: animId, gift, position, opacity };
    setGiftAnimations((prev) => [...prev, newAnim]);

    // Animate up and fade out
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: 50, y: SCREEN_HEIGHT - 500 },
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setGiftAnimations((prev) => prev.filter((a) => a.id !== animId));
    });
  }, []);

  const animateLike = useCallback(() => {
    const animId = `like-${Date.now()}-${Math.random()}`;
    const position = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(0.5);

    const newAnim: LikeAnimation = { id: animId, position, opacity, scale };
    setLikeAnimations((prev) => [...prev, newAnim]);

    Animated.parallel([
      Animated.timing(position, {
        toValue: -150,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setLikeAnimations((prev) => prev.filter((a) => a.id !== animId));
    });
  }, []);

  // =========================================================================
  // Actions
  // =========================================================================

  const handleSendComment = useCallback(() => {
    if (!commentText.trim() || !streamId) return;

    livestreamSocketService.sendComment(streamId, commentText.trim());
    setCommentText("");
  }, [commentText, streamId]);

  const handleSendLike = useCallback(() => {
    if (!streamId) return;

    livestreamSocketService.sendLike(streamId);
    animateLike();
  }, [streamId, animateLike]);

  const handleSendGift = useCallback(
    (giftType: string) => {
      if (!streamId) return;

      livestreamSocketService.sendGift(streamId, giftType, 1);
      setShowGiftPanel(false);
    },
    [streamId]
  );

  const handleVotePoll = useCallback(
    (optionId: string) => {
      if (!activePoll || selectedPollOption) return;

      livestreamSocketService.votePoll(activePoll.id, optionId);
      setSelectedPollOption(optionId);
    },
    [activePoll, selectedPollOption]
  );

  const handleLeave = useCallback(() => {
    router.back();
  }, [router]);

  // =========================================================================
  // Memoized Values
  // =========================================================================

  const totalPollVotes = useMemo(() => {
    if (!activePoll) return 0;
    return activePoll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
  }, [activePoll]);

  // =========================================================================
  // Render Functions
  // =========================================================================

  const renderComment = ({ item }: { item: LivestreamComment }) => (
    <View style={styles.commentItem}>
      {item.isPinned && (
        <Ionicons name="pin" size={12} color="#FFD700" style={styles.pinIcon} />
      )}
      <Text style={styles.commentUser}>{item.userName}: </Text>
      <Text style={styles.commentText}>{item.content}</Text>
    </View>
  );

  const renderGiftAnimation = (anim: GiftAnimation) => {
    const giftInfo = GIFT_TYPES.find((g) => g.id === anim.gift.giftType);

    return (
      <Animated.View
        key={anim.id}
        style={[
          styles.giftAnimationContainer,
          {
            transform: anim.position.getTranslateTransform(),
            opacity: anim.opacity,
          },
        ]}
      >
        <View style={styles.giftAnimationBubble}>
          <Text style={styles.giftAnimationIcon}>{giftInfo?.icon || "🎁"}</Text>
          <View>
            <Text style={styles.giftAnimationUser}>{anim.gift.senderName}</Text>
            <Text style={styles.giftAnimationName}>
              {giftInfo?.name || anim.gift.giftType} x{anim.gift.amount}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderLikeAnimation = (anim: LikeAnimation) => (
    <Animated.View
      key={anim.id}
      style={[
        styles.likeAnimationContainer,
        {
          transform: [{ translateY: anim.position }, { scale: anim.scale }],
          opacity: anim.opacity,
        },
      ]}
    >
      <Text style={styles.likeAnimationHeart}>❤️</Text>
    </Animated.View>
  );

  // =========================================================================
  // Loading / Error States
  // =========================================================================

  if (connecting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF4444" />
        <Text style={styles.loadingText}>Đang kết nối...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning" size={64} color="#FF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (streamEnded) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="videocam-off" size={64} color="#888" />
        <Text style={styles.endedText}>Livestream đã kết thúc</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =========================================================================
  // Main Render
  // =========================================================================

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Video Placeholder */}
        <View style={styles.videoContainer}>
          <Text style={styles.videoPlaceholder}>🎥 Video Stream</Text>

          {/* Top Bar */}
          <View style={[styles.topBar, { paddingTop: insets.top }]}>
            <TouchableOpacity style={styles.closeButton} onPress={handleLeave}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.viewerBadge}>
              <Ionicons name="eye" size={16} color="#FFF" />
              <Text style={styles.viewerCount}>{viewerCount}</Text>
            </View>
          </View>

          {/* Gift Animations */}
          {giftAnimations.map(renderGiftAnimation)}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Poll (if active) */}
          {activePoll && (
            <View style={styles.pollContainer}>
              <Text style={styles.pollQuestion}>{activePoll.question}</Text>
              {activePoll.options.map((option) => {
                const percentage =
                  totalPollVotes > 0
                    ? Math.round((option.voteCount / totalPollVotes) * 100)
                    : 0;
                const isSelected = selectedPollOption === option.id;

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.pollOption,
                      isSelected && styles.pollOptionSelected,
                    ]}
                    onPress={() => handleVotePoll(option.id)}
                    disabled={!!selectedPollOption}
                  >
                    <View
                      style={[
                        styles.pollOptionFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                    <Text style={styles.pollOptionText}>{option.text}</Text>
                    <Text style={styles.pollOptionPercent}>{percentage}%</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Comments */}
          <View style={styles.commentsContainer}>
            <FlatList
              ref={commentsListRef}
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              inverted
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.commentsList}
            />
          </View>

          {/* Like Animations */}
          <View style={styles.likeAnimationsContainer}>
            {likeAnimations.map(renderLikeAnimation)}
          </View>

          {/* Bottom Actions */}
          <View
            style={[styles.actionsBar, { paddingBottom: insets.bottom + 8 }]}
          >
            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận..."
                placeholderTextColor="#888"
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleSendComment}
                returnKeyType="send"
              />
              {commentText.trim() && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendComment}
                >
                  <Ionicons name="send" size={20} color="#FF4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSendLike}
              >
                <Ionicons name="heart" size={28} color="#FF4444" />
                <Text style={styles.actionLabel}>{likeCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowGiftPanel(true)}
              >
                <Ionicons name="gift" size={28} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Gift Panel */}
          {showGiftPanel && (
            <View style={styles.giftPanel}>
              <View style={styles.giftPanelHeader}>
                <Text style={styles.giftPanelTitle}>Gửi quà</Text>
                <TouchableOpacity onPress={() => setShowGiftPanel(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.giftGrid}>
                {GIFT_TYPES.map((gift) => (
                  <TouchableOpacity
                    key={gift.id}
                    style={styles.giftItem}
                    onPress={() => handleSendGift(gift.id)}
                  >
                    <Text style={styles.giftIcon}>{gift.icon}</Text>
                    <Text style={styles.giftName}>{gift.name}</Text>
                    <Text style={styles.giftCost}>{gift.cost} 💰</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#FFF",
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  endedText: {
    color: "#888",
    fontSize: 18,
    marginTop: 16,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF4444",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    color: "#666",
    fontSize: 24,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  viewerCount: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  pollContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  pollQuestion: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  pollOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    overflow: "hidden",
  },
  pollOptionSelected: {
    borderColor: "#FF4444",
    borderWidth: 1,
  },
  pollOptionFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,68,68,0.3)",
  },
  pollOptionText: {
    flex: 1,
    color: "#FFF",
    fontSize: 13,
  },
  pollOptionPercent: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  commentsContainer: {
    height: 150,
    paddingHorizontal: 12,
  },
  commentsList: {
    paddingVertical: 8,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  pinIcon: {
    marginRight: 4,
  },
  commentUser: {
    color: "#FF4444",
    fontSize: 13,
    fontWeight: "600",
  },
  commentText: {
    color: "#FFF",
    fontSize: 13,
    flexShrink: 1,
  },
  likeAnimationsContainer: {
    position: "absolute",
    right: 20,
    bottom: 120,
    alignItems: "center",
  },
  likeAnimationContainer: {
    position: "absolute",
    bottom: 0,
  },
  likeAnimationHeart: {
    fontSize: 32,
  },
  giftAnimationContainer: {
    position: "absolute",
  },
  giftAnimationBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,68,68,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
  },
  giftAnimationIcon: {
    fontSize: 24,
  },
  giftAnimationUser: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  giftAnimationName: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  commentInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
  },
  commentInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    alignItems: "center",
  },
  actionLabel: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 2,
  },
  giftPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  giftPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  giftPanelTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  giftGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  giftItem: {
    width: (SCREEN_WIDTH - 32 - 24) / 3,
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  giftIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  giftName: {
    color: "#FFF",
    fontSize: 12,
    marginBottom: 2,
  },
  giftCost: {
    color: "#FFD700",
    fontSize: 11,
  },
});
