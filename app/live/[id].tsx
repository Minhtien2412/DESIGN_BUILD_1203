/**
 * Live Stream Watch Screen — TikTok/YouTube Live-style Immersive Viewer
 *
 * Features:
 * - expo-video VideoView with HLS/MP4 playback
 * - Animated floating reactions (heart, clap, wow)
 * - Gradient overlays for readable text on video
 * - Real-time viewer count & WebSocket comments
 * - Host info card with blur backdrop
 * - Smooth FlatList chat with auto-scroll
 * - Haptic feedback on reactions
 * - Quality selector bottom sheet
 *
 * BE endpoints consumed:
 *   GET  /live-streams/:id            → stream detail
 *   POST /live-streams/:id/join       → join as viewer
 *   POST /live-streams/:id/leave      → leave
 *   GET  /live-streams/:id/comments   → initial comments
 *   POST /live-streams/:id/comments   → send comment
 *   POST /live-streams/:id/reactions  → send reaction
 *
 * @redesigned 2026-03-04
 */

import { useAuth } from "@/context/AuthContext";
import { useLiveStream } from "@/hooks/useLiveStream";
import type { StreamComment } from "@/services/liveStream";
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Reaction emojis config ────────────────────────────────────────
const REACTIONS = [
  { type: "like" as const, emoji: "👍", label: "Thích" },
  { type: "love" as const, emoji: "❤️", label: "Yêu" },
  { type: "wow" as const, emoji: "😮", label: "Wow" },
  { type: "clap" as const, emoji: "👏", label: "Tuyệt" },
] as const;

// ─── Floating Reaction Animation ───────────────────────────────────
interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

let emojiCounter = 0;

function FloatingReaction({
  emoji,
  x,
  onDone,
}: {
  emoji: string;
  x: number;
  onDone: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: true,
    }).start(onDone);
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_H * 0.5],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.8, 0],
  });
  const scale = anim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.6, 1.3, 0.8],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -15, 10, -8, 5],
  });

  return (
    <Animated.Text
      style={[
        sty.floatingEmoji,
        {
          left: x,
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// ─── Comment Bubble ────────────────────────────────────────────────
const CommentBubble = memo(({ item }: { item: StreamComment }) => (
  <View style={sty.bubble}>
    <Text style={sty.bubbleUser} numberOfLines={1}>
      {item.userName}
    </Text>
    <Text style={sty.bubbleText}>{item.message}</Text>
  </View>
));

// ─── Viewer Count Badge ────────────────────────────────────────────
const ViewerBadge = memo(({ count }: { count: number }) => {
  const label = count >= 1000 ? `${(count / 1000).toFixed(1)}K` : `${count}`;
  return (
    <View style={sty.viewerBadge}>
      <Ionicons name="eye" size={14} color="#fff" />
      <Text style={sty.viewerText}>{label}</Text>
    </View>
  );
});

// ─── Live Badge ────────────────────────────────────────────────────
const LiveBadge = memo(({ status }: { status: string }) => {
  const isLive = status === "live";
  return (
    <View style={[sty.liveBadge, !isLive && { backgroundColor: "#666" }]}>
      {isLive && <View style={sty.liveDot} />}
      <Text style={sty.liveLabel}>{isLive ? "LIVE" : "ENDED"}</Text>
    </View>
  );
});

// ─── Host Info Card ────────────────────────────────────────────────
const HostCard = memo(
  ({
    name,
    avatar,
    title,
  }: {
    name: string;
    avatar?: string;
    title: string;
  }) => (
    <View style={sty.hostCard}>
      <BlurView intensity={40} tint="dark" style={sty.hostBlur}>
        <View style={sty.hostInner}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={sty.hostAvatar}
              contentFit="cover"
            />
          ) : (
            <View style={[sty.hostAvatar, { backgroundColor: "#444" }]}>
              <Ionicons name="person" size={18} color="#aaa" />
            </View>
          )}
          <View style={sty.hostMeta}>
            <Text style={sty.hostName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={sty.hostTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View style={sty.followBtn}>
            <Text style={sty.followLabel}>+ Theo dõi</Text>
          </View>
        </View>
      </BlurView>
    </View>
  ),
);

// ─── Quality Selector ──────────────────────────────────────────────
const QUALITIES = ["Auto", "1080p", "720p", "480p"];

function QualitySheet({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (q: string) => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <Pressable style={sty.sheetOverlay} onPress={onClose}>
      <View style={sty.sheetBox}>
        <Text style={sty.sheetTitle}>Chất lượng video</Text>
        {QUALITIES.map((q) => (
          <Pressable
            key={q}
            style={[sty.sheetRow, selected === q && sty.sheetRowActive]}
            onPress={() => {
              onSelect(q);
              onClose();
            }}
          >
            <Text
              style={[
                sty.sheetRowText,
                selected === q && sty.sheetRowTextActive,
              ]}
            >
              {q}
            </Text>
            {selected === q && (
              <Ionicons name="checkmark" size={20} color="#00E676" />
            )}
          </Pressable>
        ))}
      </View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── MAIN SCREEN ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
export default function LiveStreamWatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  // ---- Stream hook ----
  const {
    stream,
    comments,
    viewerCount,
    isLoading,
    isJoined,
    error,
    joinStream,
    leaveStream,
    postComment,
    sendReaction,
  } = useLiveStream({
    streamId: id,
    autoJoin: true,
    onNewComment: () =>
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 120),
    onStreamEnd: () =>
      Alert.alert("Kết thúc", "Phiên live đã kết thúc.", [
        { text: "OK", onPress: () => router.back() },
      ]),
  });

  // ---- Local state ----
  const [commentText, setCommentText] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState("Auto");
  const [chatVisible, setChatVisible] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatRef = useRef<FlatList>(null);

  // ---- Video Player (expo-video) ----
  const videoSource = stream?.playbackUrl || "";
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = false;
  });
  const playerStatus = useEvent(player, "statusChange", {
    status: player.status,
  });

  useEffect(() => {
    if (stream?.playbackUrl) {
      player.play();
    }
  }, [stream?.playbackUrl]);

  // ---- Auto-hide controls ----
  const resetControlsTimer = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setControlsVisible(true);
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 5000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  // ---- Cleanup ----
  useEffect(() => {
    return () => {
      if (isJoined) leaveStream();
    };
  }, [isJoined]);

  // ---- Handlers ----
  const handleSendComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text) return;
    setCommentText("");
    try {
      await postComment(text);
    } catch {
      /* silent */
    }
  }, [commentText, postComment]);

  const handleReaction = useCallback(
    async (type: "like" | "love" | "wow" | "clap", emoji: string) => {
      // Haptic
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      // Float emoji
      const newEmoji: FloatingEmoji = {
        id: ++emojiCounter,
        emoji,
        x: SCREEN_W * 0.75 + Math.random() * 50 - 25,
      };
      setFloatingEmojis((prev) => [...prev.slice(-15), newEmoji]);

      try {
        await sendReaction(type);
      } catch {
        /* silent */
      }
    },
    [sendReaction],
  );

  const removeEmoji = useCallback((eid: number) => {
    setFloatingEmojis((prev) => prev.filter((e) => e.id !== eid));
  }, []);

  const toggleChat = useCallback(() => setChatVisible((p) => !p), []);
  const togglePlayPause = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
    resetControlsTimer();
  }, [player, resetControlsTimer]);

  // ---- Memoised comment data ----
  const chatData = useMemo(() => comments.slice(-80), [comments]);

  // ═══════ LOADING ═══════
  if (isLoading) {
    return (
      <View style={sty.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#00E676" />
        <Text style={sty.loadText}>Đang kết nối live stream…</Text>
      </View>
    );
  }

  // ═══════ ERROR ═══════
  if (error || !stream) {
    return (
      <View style={sty.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" />
        <Ionicons name="videocam-off-outline" size={64} color="#EF4444" />
        <Text style={sty.errText}>{error || "Không tìm thấy live stream"}</Text>
        <Pressable style={sty.errBtn} onPress={() => router.back()}>
          <Text style={sty.errBtnText}>← Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  // ═══════ MAIN VIEW ═══════
  return (
    <View style={sty.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ──── Video Layer ──── */}
      <Pressable style={StyleSheet.absoluteFill} onPress={resetControlsTimer}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </Pressable>

      {/* ──── Top Gradient ──── */}
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent"]}
        style={sty.gradientTop}
        pointerEvents="none"
      />

      {/* ──── Bottom Gradient ──── */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={sty.gradientBottom}
        pointerEvents="none"
      />

      {/* ──── Top Bar ──── */}
      {controlsVisible && (
        <View style={sty.topBar}>
          {/* Close */}
          <Pressable
            style={sty.iconBtn}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </Pressable>

          {/* Host Card */}
          <HostCard
            name={stream.hostName}
            avatar={stream.hostAvatar}
            title={stream.title}
          />

          {/* Right icons */}
          <View style={sty.topRight}>
            <LiveBadge status={stream.status} />
            <ViewerBadge count={viewerCount} />
          </View>
        </View>
      )}

      {/* ──── Video Loading Indicator ──── */}
      {playerStatus.status === "loading" && (
        <View style={sty.bufferingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={sty.bufferingText}>Đang tải…</Text>
        </View>
      )}

      {/* ──── Stream Description ──── */}
      {controlsVisible && stream.description && (
        <View style={sty.descContainer}>
          <Text style={sty.descText} numberOfLines={2}>
            {stream.description}
          </Text>
        </View>
      )}

      {/* ──── Floating Emojis ──── */}
      {floatingEmojis.map((e) => (
        <FloatingReaction
          key={e.id}
          emoji={e.emoji}
          x={e.x}
          onDone={() => removeEmoji(e.id)}
        />
      ))}

      {/* ──── Right Action Bar (TikTok-style) ──── */}
      <View style={sty.rightBar}>
        {/* Quality */}
        <Pressable style={sty.actionBtn} onPress={() => setShowQuality(true)}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
          <Text style={sty.actionLabel}>HD</Text>
        </Pressable>

        {/* Toggle chat */}
        <Pressable style={sty.actionBtn} onPress={toggleChat}>
          <Ionicons
            name={
              chatVisible
                ? "chatbubble-ellipses"
                : "chatbubble-ellipses-outline"
            }
            size={24}
            color="#fff"
          />
          <Text style={sty.actionLabel}>Chat</Text>
        </Pressable>

        {/* Play/Pause */}
        <Pressable style={sty.actionBtn} onPress={togglePlayPause}>
          <Ionicons
            name={player.playing ? "pause-circle" : "play-circle"}
            size={28}
            color="#fff"
          />
        </Pressable>

        {/* Share */}
        <Pressable style={sty.actionBtn}>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
          <Text style={sty.actionLabel}>Chia sẻ</Text>
        </Pressable>
      </View>

      {/* ──── Chat & Reactions (bottom area) ──── */}
      <KeyboardAvoidingView
        style={sty.bottomArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Chat messages */}
        {chatVisible && (
          <FlatList
            ref={chatRef}
            data={chatData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CommentBubble item={item} />}
            style={sty.chatList}
            contentContainerStyle={sty.chatContent}
            showsVerticalScrollIndicator={false}
            inverted={false}
            onContentSizeChange={() =>
              chatRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Reactions Row */}
        <View style={sty.reactRow}>
          {REACTIONS.map((r) => (
            <Pressable
              key={r.type}
              style={sty.reactionBtn}
              onPress={() => handleReaction(r.type, r.emoji)}
            >
              <Text style={sty.reactionEmoji}>{r.emoji}</Text>
            </Pressable>
          ))}
        </View>

        {/* Input bar */}
        <View style={sty.inputBar}>
          <View style={sty.inputWrap}>
            <TextInput
              style={sty.input}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Bình luận…"
              placeholderTextColor="rgba(255,255,255,0.5)"
              maxLength={200}
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
              onFocus={resetControlsTimer}
            />
          </View>
          <Pressable
            style={[sty.sendBtn, !commentText.trim() && { opacity: 0.4 }]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* ──── Quality Bottom Sheet ──── */}
      <QualitySheet
        visible={showQuality}
        selected={quality}
        onSelect={setQuality}
        onClose={() => setShowQuality(false)}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── STYLES ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const sty = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // ── Center screens ──
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadText: { color: "#ccc", fontSize: 15, marginTop: 16 },
  errText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  errBtn: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: "#EF4444",
    borderRadius: 24,
  },
  errBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // ── Gradients ──
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
  },

  // ── Top Bar ──
  topBar: {
    position: "absolute",
    top:
      Platform.OS === "ios"
        ? 54
        : StatusBar.currentHeight
          ? StatusBar.currentHeight + 8
          : 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  topRight: { flexDirection: "row", gap: 8, alignItems: "center" },

  // ── Live / Viewer badges ──
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  liveLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  viewerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  viewerText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // ── Host Card ──
  hostCard: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  hostBlur: {
    borderRadius: 24,
    overflow: "hidden",
  },
  hostInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },
  hostAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#00E676",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  hostMeta: { flex: 1, minWidth: 0 },
  hostName: { color: "#fff", fontSize: 13, fontWeight: "700" },
  hostTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 1,
  },
  followBtn: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  followLabel: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // ── Buffering ──
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bufferingText: { color: "#fff", fontSize: 13, marginTop: 8 },

  // ── Description ──
  descContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 110 : 100,
    left: 16,
    right: 80,
  },
  descText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Right Action Bar ──
  rightBar: {
    position: "absolute",
    right: 10,
    bottom: 220,
    alignItems: "center",
    gap: 18,
  },
  actionBtn: { alignItems: "center", gap: 3 },
  actionLabel: { color: "#fff", fontSize: 10, fontWeight: "600" },

  // ── Floating Emoji ──
  floatingEmoji: {
    position: "absolute",
    bottom: 260,
    fontSize: 32,
    zIndex: 100,
  },

  // ── Chat ──
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  chatList: {
    maxHeight: 200,
    paddingHorizontal: 12,
  },
  chatContent: { gap: 6, paddingBottom: 8 },
  bubble: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  bubbleUser: {
    color: "#00E676",
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 0,
  },
  bubbleText: { color: "#fff", fontSize: 12, flexShrink: 1 },

  // ── Reactions Row ──
  reactRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 12,
  },
  reactionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionEmoji: { fontSize: 24 },

  // ── Input Bar ──
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: Platform.OS === "ios" ? 34 : 14,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },
  input: {
    color: "#fff",
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#00E676",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Quality Sheet ──
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 200,
  },
  sheetBox: {
    backgroundColor: "#1E1E2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  sheetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  sheetRowActive: { borderBottomColor: "rgba(0,230,118,0.3)" },
  sheetRowText: { color: "#ccc", fontSize: 15 },
  sheetRowTextActive: { color: "#00E676", fontWeight: "700" },
});
