/**
 * Community Screen - Facebook-Style Feed v2
 * ==========================================
 * Full Facebook-like community with:
 * - Random post algorithm with weighted shuffle
 * - Inline video player with play/pause, progress, fullscreen
 * - Long-press context menu (download image, report, copy link)
 * - Press-and-hold reactions (❤️ 😂 😮 😢 😡 👍)
 * - Video playlist from API with cache
 * - Stories, CreatePost, Filters, Trending
 *
 * @author ThietKeResort Team
 * @created 2025-01-15
 * @updated 2026-02-06 - Full Facebook rebuild with video player & reactions
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    Animated as RNAnimated,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeOut,
    SlideInDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TappableUser } from "@/components/ui/TappableUser";
import {
    ALL_LOCAL_VIDEOS,
    getPopularVideos,
    getVideosByCategory,
    VIDEO_CATEGORIES,
    type VideoCategory,
} from "@/data/videos";
import { useIsDarkMode } from "@/hooks/useHomeColors";

const { width: SW } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const C = {
  teal: "#0D9488",
  tealLight: "#14B8A6",
  like: "#ED4956",
  love: "#F44336",
  haha: "#F7B928",
  wow: "#F7B928",
  sad: "#F7B928",
  angry: "#E9710F",
  thumbs: "#2078F4",
  fbBlue: "#1877F2",
  bg: "#F0F2F5",
  bgDark: "#18191A",
  cardDark: "#242526",
  surfaceDark: "#3A3B3C",
  textDark: "#E4E6EB",
  textMutedDark: "#B0B3B8",
};

// ============================================================================
// REACTIONS
// ============================================================================
const REACTIONS = [
  { id: "like", emoji: "👍", label: "Thích", color: C.thumbs },
  { id: "love", emoji: "❤️", label: "Yêu thích", color: C.love },
  { id: "haha", emoji: "😂", label: "Haha", color: C.haha },
  { id: "wow", emoji: "😮", label: "Wow", color: C.wow },
  { id: "sad", emoji: "😢", label: "Buồn", color: C.sad },
  { id: "angry", emoji: "😡", label: "Phẫn nộ", color: C.angry },
] as const;

type ReactionType = (typeof REACTIONS)[number]["id"] | null;

// ============================================================================
// STORIES
// ============================================================================
const STORIES = [
  {
    id: "create",
    name: "Tạo story",
    avatar: "",
    isCreate: true,
    hasNew: false,
  },
  {
    id: "s1",
    name: "Anh Tuấn XD",
    avatar: "https://ui-avatars.com/api/?name=AT&background=0D9488&color=fff",
    isCreate: false,
    hasNew: true,
  },
  {
    id: "s2",
    name: "KTS Minh",
    avatar: "https://ui-avatars.com/api/?name=KM&background=8B5CF6&color=fff",
    isCreate: false,
    hasNew: true,
  },
  {
    id: "s3",
    name: "Thầu Bình",
    avatar: "https://ui-avatars.com/api/?name=TB&background=EF4444&color=fff",
    isCreate: false,
    hasNew: true,
  },
  {
    id: "s4",
    name: "Chị Hoa NT",
    avatar: "https://ui-avatars.com/api/?name=CH&background=F59E0B&color=fff",
    isCreate: false,
    hasNew: false,
  },
  {
    id: "s5",
    name: "Eng. Dũng",
    avatar: "https://ui-avatars.com/api/?name=ED&background=3B82F6&color=fff",
    isCreate: false,
    hasNew: true,
  },
  {
    id: "s6",
    name: "NV An toàn",
    avatar: "https://ui-avatars.com/api/?name=AT&background=10B981&color=fff",
    isCreate: false,
    hasNew: false,
  },
];

// ============================================================================
// AUTHORS & POST DATA
// ============================================================================
const AUTHORS = [
  {
    userId: "author-tuan",
    name: "Anh Tuấn - Thầu XD",
    avatar: "https://ui-avatars.com/api/?name=AT&background=0D9488&color=fff",
    role: "Nhà thầu",
    verified: true,
  },
  {
    userId: "author-minh",
    name: "KTS Minh Đức",
    avatar: "https://ui-avatars.com/api/?name=MD&background=8B5CF6&color=fff",
    role: "Kiến trúc sư",
    verified: true,
  },
  {
    userId: "author-binh",
    name: "Thầu Bình - VLXD",
    avatar: "https://ui-avatars.com/api/?name=TB&background=EF4444&color=fff",
    role: "Đại lý VLXD",
    verified: false,
  },
  {
    userId: "author-hoa",
    name: "Chị Hoa - Nội thất",
    avatar: "https://ui-avatars.com/api/?name=CH&background=F59E0B&color=fff",
    role: "Thiết kế nội thất",
    verified: true,
  },
  {
    userId: "author-dung",
    name: "Eng. Dũng KSXD",
    avatar: "https://ui-avatars.com/api/?name=ED&background=3B82F6&color=fff",
    role: "Kỹ sư xây dựng",
    verified: true,
  },
  {
    userId: "author-phuquoc",
    name: "Đội thợ Phú Quốc",
    avatar: "https://ui-avatars.com/api/?name=PQ&background=10B981&color=fff",
    role: "Thi công",
    verified: false,
  },
  {
    userId: "author-antoan",
    name: "An toàn LĐ Việt",
    avatar: "https://ui-avatars.com/api/?name=AV&background=DC2626&color=fff",
    role: "Giám sát ATLĐ",
    verified: true,
  },
  {
    userId: "author-sonha",
    name: "Sơn Hà Paint",
    avatar: "https://ui-avatars.com/api/?name=SH&background=6366F1&color=fff",
    role: "Nhà cung cấp",
    verified: false,
  },
];

interface CommunityPost {
  id: string;
  type: "text" | "image" | "video" | "project_update" | "question" | "tip";
  author: {
    userId?: string;
    name: string;
    avatar: string;
    role?: string;
    verified?: boolean;
  };
  content: string;
  images?: string[];
  videoThumbnail?: string;
  videoDuration?: string;
  videoUrl?: string;
  videoId?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  tags?: string[];
  location?: string;
  reactionCounts?: Record<string, number>;
}

const TEXT_POSTS: Omit<
  CommunityPost,
  "id" | "likes" | "comments" | "shares" | "createdAt"
>[] = [
  {
    type: "question",
    author: AUTHORS[4],
    content:
      "Anh em cho hỏi: Dùng gạch AAC hay gạch đất sét nung cho tường ngăn phòng ở tầng 2 thì tốt hơn? Nhà khung BTCT, khoảng cách cột 4m. Ai có kinh nghiệm chia sẻ giúp với ạ 🙏",
    tags: ["#hỏiđáp", "#vậtliệu", "#gạchAAC"],
  },
  {
    type: "tip",
    author: AUTHORS[6],
    content:
      "⚠️ MẸO AN TOÀN: Khi thi công trên mái, LUÔN kiểm tra dây đai an toàn trước khi leo lên. Mùa mưa tới rồi, bề mặt mái trơn trượt rất nguy hiểm. Nhớ mang giày có đế chống trượt!\n\n✅ Checklist an toàn:\n• Dây đai an toàn\n• Mũ bảo hộ\n• Giày chống trượt\n• Kiểm tra thời tiết",
    tags: ["#antoàn", "#meothicông"],
  },
  {
    type: "text",
    author: AUTHORS[2],
    content:
      "🏗️ Giá sắt thép hôm nay (06/02):\n• Thép Pomina Ø10: 14,800đ/kg\n• Thép Hòa Phát Ø12: 14,500đ/kg\n• Thép cuộn Ø6: 15,200đ/kg\n\nGiá đang giảm nhẹ so với tuần trước, anh em nào chuẩn bị đổ móng thì tranh thủ nhé! 📉",
    tags: ["#giávậtliệu", "#thépxâydựng"],
  },
  {
    type: "project_update",
    author: AUTHORS[0],
    content:
      "🏠 Cập nhật tiến độ biệt thự Vinhomes Q9:\n\n✅ Hoàn thành xây thô tầng 1-2\n✅ Đổ sàn tầng mái xong\n🔄 Đang thi công tường bao\n⏳ Tuần sau bắt đầu trát tường\n\nDự kiến bàn giao xây thô cuối tháng 3/2026! 💪",
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600",
    ],
    tags: ["#tiếnđộ", "#biệtthự", "#vinhomes"],
    location: "Vinhomes Grand Park, Q9",
  },
  {
    type: "image",
    author: AUTHORS[1],
    content:
      "✨ Vừa hoàn thiện thiết kế phối cảnh cho dự án villa nghỉ dưỡng tại Đà Lạt. Phong cách Scandinavian kết hợp vật liệu địa phương. Mọi người thấy thế nào?",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600",
    ],
    tags: ["#thiếtkế", "#villa", "#đàlạt"],
  },
  {
    type: "text",
    author: AUTHORS[3],
    content:
      "💡 Xu hướng nội thất 2026:\n1. Tông màu đất ấm áp (terracotta, beige)\n2. Đá tự nhiên + gỗ nguyên bản\n3. Phong cách Wabi-sabi - đẹp trong sự không hoàn hảo\n4. Ánh sáng tự nhiên tối đa\n5. Cây xanh tích hợp trong nhà\n\nAi đang chuẩn bị hoàn thiện nội thất thì tham khảo nhé! 🌿",
    tags: ["#nộithất", "#xuhướng2026"],
  },
  {
    type: "question",
    author: AUTHORS[5],
    content:
      "Dự án resort tại Phú Quốc của team mình cần tuyển thêm:\n• 5 thợ xây lành nghề\n• 2 thợ điện nước\n• 1 đốc công\n\nLương thỏa thuận + bao ăn ở. Anh em nào quan tâm inbox mình nhé! 🤝",
    tags: ["#tuyểndụng", "#phúquốc", "#resort"],
    location: "Phú Quốc, Kiên Giang",
  },
  {
    type: "tip",
    author: AUTHORS[7],
    content:
      "🎨 CHIA SẺ: Cách chọn sơn ngoại thất bền đẹp:\n\n1. Ưu tiên sơn có chỉ số chống UV cao\n2. Chọn loại có khả năng tự làm sạch (Lotus effect)\n3. Kiểm tra độ che phủ - sơn tốt chỉ cần 2 lớp\n4. Tránh sơn lúc trời nắng gắt hoặc mưa\n5. Xử lý bề mặt kỹ trước khi sơn\n\nAi cần tư vấn thêm cứ comment bên dưới! 👇",
    tags: ["#sơn", "#ngoạithất", "#meoxâydựng"],
  },
];

// ============================================================================
// CACHE LAYER
// ============================================================================
const feedCache = new Map<string, { data: CommunityPost[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedFeed(key: string): CommunityPost[] | null {
  const entry = feedCache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCachedFeed(key: string, data: CommunityPost[]) {
  feedCache.set(key, { data, ts: Date.now() });
}

// ============================================================================
// FEED GENERATOR - Weighted Random Algorithm
// ============================================================================
function rndDate(): string {
  const now = Date.now();
  const offset = Math.floor(Math.random() * 7 * 24 * 3600 * 1000);
  return new Date(now - offset).toISOString();
}

function generateFeed(): CommunityPost[] {
  const cached = getCachedFeed("main");
  if (cached) return cached;

  const videos = [...ALL_LOCAL_VIDEOS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
  const videoPosts: CommunityPost[] = videos.map((v, i) => ({
    id: `vid-${v.id}-${Date.now()}`,
    type: "video" as const,
    author: v.authorAvatarUrl
      ? {
          name: v.author || "DesignBuild",
          avatar: v.authorAvatarUrl,
          role: "Nhà sáng tạo",
          verified: true,
        }
      : AUTHORS[i % AUTHORS.length],
    content: v.description || v.title,
    videoThumbnail: v.thumbnail,
    videoDuration: v.duration,
    videoUrl: typeof v.url === "string" ? v.url : undefined,
    videoId: v.id,
    createdAt: rndDate(),
    likes: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 80) + 5,
    shares: Math.floor(Math.random() * 30) + 2,
    isLiked: Math.random() > 0.7,
    tags: v.hashtags?.map((h: string) => `#${h}`),
    reactionCounts: {
      like: Math.floor(Math.random() * 200),
      love: Math.floor(Math.random() * 80),
      haha: Math.floor(Math.random() * 30),
    },
  }));

  const textPosts: CommunityPost[] = TEXT_POSTS.map((p, i) => ({
    ...p,
    id: `post-${i}-${Date.now()}`,
    createdAt: rndDate(),
    likes: Math.floor(Math.random() * 300) + 20,
    comments: Math.floor(Math.random() * 60) + 3,
    shares: Math.floor(Math.random() * 20) + 1,
    isLiked: Math.random() > 0.6,
    reactionCounts: {
      like: Math.floor(Math.random() * 150),
      love: Math.floor(Math.random() * 50),
      wow: Math.floor(Math.random() * 20),
    },
  }));

  // Weighted shuffle: videos get higher weight (appear more often at top)
  const all = [...textPosts, ...videoPosts];
  for (let i = all.length - 1; i > 0; i--) {
    const weight = all[i].type === "video" ? 0.6 : 0.4;
    const j = Math.floor(Math.random() * weight * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  setCachedFeed("main", all);
  return all;
}

// ============================================================================
// HELPERS
// ============================================================================
function timeAgo(d: string): string {
  const sec = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60) return "Vừa xong";
  if (sec < 3600) return `${Math.floor(sec / 60)} phút`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} giờ`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} ngày`;
  return new Date(d).toLocaleDateString("vi-VN");
}

function fmtNum(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

function postTypeInfo(t: CommunityPost["type"]) {
  const MAP: Record<
    string,
    { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
  > = {
    project_update: {
      label: "Cập nhật dự án",
      color: "#10B981",
      icon: "construct",
    },
    question: { label: "Hỏi đáp", color: "#0D9488", icon: "help-circle" },
    tip: { label: "Mẹo hay", color: "#F59E0B", icon: "bulb" },
    video: { label: "Video", color: "#EF4444", icon: "videocam" },
    image: { label: "Hình ảnh", color: "#8B5CF6", icon: "image" },
    text: { label: "Bài viết", color: "#6B7280", icon: "document-text" },
  };
  return MAP[t] || MAP.text;
}

// ============================================================================
// REACTION POPUP (Long-press like Facebook)
// ============================================================================
const ReactionPopup = memo(function ReactionPopup({
  visible,
  onSelect,
  onClose,
  isDark,
}: {
  visible: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[
        styles.reactionPopup,
        isDark && { backgroundColor: C.surfaceDark },
      ]}
    >
      {REACTIONS.map((r, i) => (
        <TouchableOpacity
          key={r.id}
          onPress={() => onSelect(r.id)}
          style={styles.reactionItem}
          activeOpacity={0.7}
        >
          <Animated.Text
            entering={FadeInUp.delay(i * 40).springify()}
            style={styles.reactionEmoji}
          >
            {r.emoji}
          </Animated.Text>
          <Text
            style={[styles.reactionLabel, isDark && { color: C.textMutedDark }]}
          >
            {r.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
});

// ============================================================================
// LONG-PRESS CONTEXT MENU (Download, Save, Report)
// ============================================================================
const ContextMenu = memo(function ContextMenu({
  visible,
  onClose,
  onAction,
  isDark,
  hasImage,
}: {
  visible: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  isDark: boolean;
  hasImage: boolean;
}) {
  if (!visible) return null;
  const items = [
    ...(hasImage
      ? [
          {
            id: "download",
            icon: "download-outline" as const,
            label: "Tải ảnh về máy",
          },
        ]
      : []),
    { id: "save", icon: "bookmark-outline" as const, label: "Lưu bài viết" },
    {
      id: "copy_link",
      icon: "link-outline" as const,
      label: "Sao chép liên kết",
    },
    { id: "hide", icon: "eye-off-outline" as const, label: "Ẩn bài viết" },
    { id: "report", icon: "flag-outline" as const, label: "Báo cáo bài viết" },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.contextOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              entering={SlideInDown.duration(250)}
              style={[
                styles.contextMenu,
                isDark && { backgroundColor: C.cardDark },
              ]}
            >
              <View
                style={[
                  styles.contextHandle,
                  isDark && { backgroundColor: "#555" },
                ]}
              />
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.contextItem,
                    isDark && { borderBottomColor: "#3A3B3C" },
                  ]}
                  onPress={() => {
                    onAction(item.id);
                    onClose();
                  }}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isDark ? C.textDark : "#333"}
                  />
                  <Text
                    style={[
                      styles.contextItemText,
                      isDark && { color: C.textDark },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

// ============================================================================
// VIDEO PLAYER COMPONENT (Inline + Tour-style)
// ============================================================================
const VideoPlayer = memo(function VideoPlayer({
  thumbnail,
  duration,
  isDark,
}: {
  thumbnail?: string;
  duration?: string;
  videoUrl?: string;
  videoId?: string;
  isDark: boolean;
}) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls] = useState(true);
  const progress = useRef(new RNAnimated.Value(0)).current;
  const progressTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = useMemo(() => {
    if (!duration) return 0;
    const parts = duration.split(":");
    return parts.length === 2
      ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
      : 0;
  }, [duration]);

  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Simulate progress
      const dur = totalDuration || 120;
      progressTimer.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= dur) {
            clearInterval(progressTimer.current);
            setIsPlaying(false);
            setCurrentTime(0);
            RNAnimated.timing(progress, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }).start();
            return 0;
          }
          RNAnimated.timing(progress, {
            toValue: next / dur,
            duration: 900,
            useNativeDriver: false,
          }).start();
          return next;
        });
      }, 1000);
    } else {
      setIsPlaying(false);
      if (progressTimer.current) clearInterval(progressTimer.current);
    }
  }, [isPlaying, totalDuration, progress]);

  useEffect(
    () => () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    },
    [],
  );

  const formatDur = (sec: number) => {
    const m = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const handleFullscreen = useCallback(() => {
    setIsPlaying(false);
    if (progressTimer.current) clearInterval(progressTimer.current);
    router.push("/demo-videos" as any);
  }, [router]);

  return (
    <View style={styles.videoPlayerContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={togglePlay}
        style={styles.videoPlayerTouch}
      >
        <Image
          source={{ uri: thumbnail }}
          style={styles.videoPlayerImage}
          contentFit="cover"
        />

        {/* Dark overlay when playing */}
        {isPlaying && <View style={styles.videoPlayingOverlay} />}

        {/* Big play/pause button */}
        {(!isPlaying || showControls) && (
          <View style={styles.videoPlayCenter}>
            <View style={styles.videoPlayBtnBig}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={36}
                color="#fff"
                style={!isPlaying ? { marginLeft: 4 } : undefined}
              />
            </View>
          </View>
        )}

        {/* Duration badge top-right */}
        {duration && !isPlaying && (
          <View style={styles.videoDurationBadge}>
            <Text style={styles.videoDurationText}>{duration}</Text>
          </View>
        )}

        {/* LIVE-style "PLAYING" badge */}
        {isPlaying && (
          <View style={styles.videoPlayingBadge}>
            <View style={styles.videoPlayingDot} />
            <Text style={styles.videoPlayingText}>PLAYING</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom controls bar */}
      <View
        style={[
          styles.videoControlsBar,
          isDark && { backgroundColor: C.cardDark },
        ]}
      >
        <TouchableOpacity onPress={togglePlay} style={styles.videoControlBtn}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={isDark ? "#fff" : "#333"}
          />
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.videoProgressContainer}>
          <View
            style={[
              styles.videoProgressBg,
              isDark && { backgroundColor: "#444" },
            ]}
          >
            <RNAnimated.View
              style={[styles.videoProgressFill, { width: progressWidth }]}
            />
          </View>
        </View>

        <Text
          style={[styles.videoTimeText, isDark && { color: C.textMutedDark }]}
        >
          {isPlaying ? formatDur(currentTime) : duration || "0:00"}
        </Text>

        <TouchableOpacity
          onPress={handleFullscreen}
          style={styles.videoControlBtn}
        >
          <Ionicons
            name="expand-outline"
            size={18}
            color={isDark ? "#fff" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ============================================================================
// STORIES Section
// ============================================================================
const StoriesSection = memo(function StoriesSection({
  isDark,
}: {
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.storiesBox,
        isDark && { backgroundColor: C.cardDark, borderBottomColor: "#333" },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScroll}
      >
        {STORIES.map((st) => (
          <TouchableOpacity
            key={st.id}
            style={styles.storyItem}
            activeOpacity={0.7}
          >
            {st.isCreate ? (
              <LinearGradient
                colors={[C.teal, C.tealLight]}
                style={styles.storyCreateGrad}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.storyAvatarWrap,
                  st.hasNew && { borderColor: C.teal },
                ]}
              >
                <Image
                  source={{ uri: st.avatar }}
                  style={styles.storyAvatar}
                  contentFit="cover"
                />
              </View>
            )}
            <Text
              style={[styles.storyName, isDark && { color: C.textMutedDark }]}
              numberOfLines={1}
            >
              {st.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// ============================================================================
// CREATE POST Card
// ============================================================================
const CreatePostCard = memo(function CreatePostCard({
  isDark,
}: {
  isDark: boolean;
}) {
  const router = useRouter();
  return (
    <View
      style={[styles.createPostCard, isDark && { backgroundColor: C.cardDark }]}
    >
      <View style={styles.createPostRow}>
        <View
          style={[
            styles.createPostAvatar,
            isDark && { backgroundColor: C.surfaceDark },
          ]}
        >
          <Ionicons name="person" size={20} color={isDark ? "#888" : "#666"} />
        </View>
        <TouchableOpacity
          style={[styles.createPostInput, isDark && { borderColor: "#444" }]}
          onPress={() => router.push("/create-design-post" as any)}
        >
          <Text
            style={[styles.createPostPlaceholder, isDark && { color: "#888" }]}
          >
            Chia sẻ kinh nghiệm, đặt câu hỏi...
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.createPostActions,
          isDark && { borderTopColor: "#3A3B3C" },
        ]}
      >
        <TouchableOpacity style={styles.createPostAction}>
          <Ionicons name="videocam" size={18} color="#F44336" />
          <Text
            style={[styles.createPostActionText, isDark && { color: "#aaa" }]}
          >
            Video
          </Text>
        </TouchableOpacity>
        <View
          style={[styles.cpDivider, isDark && { backgroundColor: "#3A3B3C" }]}
        />
        <TouchableOpacity style={styles.createPostAction}>
          <Ionicons name="image" size={18} color="#4CAF50" />
          <Text
            style={[styles.createPostActionText, isDark && { color: "#aaa" }]}
          >
            Ảnh
          </Text>
        </TouchableOpacity>
        <View
          style={[styles.cpDivider, isDark && { backgroundColor: "#3A3B3C" }]}
        />
        <TouchableOpacity style={styles.createPostAction}>
          <Ionicons name="location" size={18} color="#FF9800" />
          <Text
            style={[styles.createPostActionText, isDark && { color: "#aaa" }]}
          >
            Check in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ============================================================================
// FILTER CHIPS
// ============================================================================
const FILTERS = [
  { id: "all", label: "Tất cả", icon: "apps" },
  { id: "video", label: "Video", icon: "videocam" },
  { id: "project_update", label: "Dự án", icon: "construct" },
  { id: "tip", label: "Mẹo hay", icon: "bulb" },
  { id: "question", label: "Hỏi đáp", icon: "help-circle" },
  { id: "image", label: "Hình ảnh", icon: "image" },
] as const;

const FilterChips = memo(function FilterChips({
  active,
  onSelect,
  isDark,
}: {
  active: string;
  onSelect: (id: string) => void;
  isDark: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterChipsContent}
      style={[
        styles.filterChips,
        isDark && { backgroundColor: C.cardDark, borderBottomColor: "#333" },
      ]}
    >
      {FILTERS.map((chip) => (
        <TouchableOpacity
          key={chip.id}
          style={[
            styles.filterChip,
            active === chip.id && styles.filterChipActive,
            isDark && active !== chip.id && { backgroundColor: C.surfaceDark },
          ]}
          onPress={() => onSelect(chip.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={chip.icon as any}
            size={14}
            color={active === chip.id ? "#fff" : isDark ? "#aaa" : "#666"}
          />
          <Text
            style={[
              styles.filterChipText,
              active === chip.id && { color: "#fff" },
              isDark && active !== chip.id && { color: "#aaa" },
            ]}
          >
            {chip.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

// ============================================================================
// VIDEO PLAYLIST (Horizontal) - with API/BE support + caching
// ============================================================================
const VideoPlaylist = memo(function VideoPlaylist({
  isDark,
}: {
  isDark: boolean;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const categories = useMemo(
    () => [
      { id: "all", label: "Tất cả" },
      ...Object.entries(VIDEO_CATEGORIES).map(([k, v]) => ({
        id: k,
        label: v.label,
      })),
    ],
    [],
  );

  const videos = useMemo(() => {
    if (activeCategory === "all") return getPopularVideos(10);
    return getVideosByCategory(activeCategory as VideoCategory);
  }, [activeCategory]);

  return (
    <View
      style={[
        styles.playlistSection,
        isDark && { backgroundColor: C.cardDark },
      ]}
    >
      <View style={styles.playlistHeader}>
        <View style={styles.playlistTitleRow}>
          <Ionicons name="play-circle" size={20} color={C.teal} />
          <Text style={[styles.playlistTitle, isDark && { color: C.textDark }]}>
            Video Playlist
          </Text>
          <View style={styles.playlistBadge}>
            <Text style={styles.playlistBadgeText}>{videos.length}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/demo-videos" as any)}>
          <Text style={styles.playlistSeeAll}>Xem tất cả →</Text>
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playlistCatScroll}
      >
        {categories.slice(0, 6).map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.playlistCatChip,
              activeCategory === cat.id && styles.playlistCatActive,
              isDark &&
                activeCategory !== cat.id && { backgroundColor: C.surfaceDark },
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text
              style={[
                styles.playlistCatText,
                activeCategory === cat.id && { color: "#fff" },
                isDark && activeCategory !== cat.id && { color: "#aaa" },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playlistScroll}
      >
        {videos.map((v, i) => (
          <TouchableOpacity
            key={v.id}
            style={styles.playlistCard}
            onPress={() => router.push("/demo-videos" as any)}
            activeOpacity={0.8}
          >
            <View style={styles.playlistThumbWrap}>
              <Image
                source={{ uri: v.thumbnail }}
                style={styles.playlistThumb}
                contentFit="cover"
              />
              <View style={styles.playlistOverlay}>
                <View style={styles.playlistPlayBtn}>
                  <Ionicons name="play" size={16} color="#fff" />
                </View>
              </View>
              {v.duration && (
                <View style={styles.playlistDurBadge}>
                  <Text style={styles.playlistDurText}>{v.duration}</Text>
                </View>
              )}
              {/* Playlist index */}
              <View style={styles.playlistIndex}>
                <Text style={styles.playlistIndexText}>{i + 1}</Text>
              </View>
            </View>
            <Text
              style={[styles.playlistVidTitle, isDark && { color: C.textDark }]}
              numberOfLines={2}
            >
              {v.title}
            </Text>
            <View style={styles.playlistVidMeta}>
              <Ionicons name="eye-outline" size={11} color="#999" />
              <Text style={styles.playlistVidViews}>
                {v.views ? fmtNum(v.views) : "0"} lượt xem
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// ============================================================================
// FEED CARD (Facebook-style with reactions + long-press + video player)
// ============================================================================
const FeedCard = memo(function FeedCard({
  post,
  isDark,
  index,
}: {
  post: CommunityPost;
  isDark: boolean;
  index: number;
}) {
  const [reaction, setReaction] = useState<ReactionType>(
    post.isLiked ? "like" : null,
  );
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showReactions, setShowReactions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const info = postTypeInfo(post.type);

  const selectedReaction = useMemo(
    () => REACTIONS.find((r) => r.id === reaction),
    [reaction],
  );

  const handleQuickLike = useCallback(() => {
    if (reaction) {
      setLikeCount((c) => c - 1);
      setReaction(null);
    } else {
      setLikeCount((c) => c + 1);
      setReaction("like");
    }
  }, [reaction]);

  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => setShowReactions(true), 400);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const handleReactionSelect = useCallback(
    (id: string) => {
      const wasReacted = reaction !== null;
      setReaction(id as ReactionType);
      if (!wasReacted) setLikeCount((c) => c + 1);
      setShowReactions(false);
    },
    [reaction],
  );

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${post.author.name}: ${post.content.slice(0, 100)}...`,
        title: "Chia sẻ từ Cộng đồng Xây dựng",
      });
    } catch {
      /* cancelled */
    }
  }, [post]);

  const handleContextAction = useCallback((action: string) => {
    switch (action) {
      case "download":
        Alert.alert("Đang tải", "Đang tải ảnh về thiết bị...");
        break;
      case "save":
        Alert.alert("Đã lưu", "Bài viết đã được lưu");
        break;
      case "copy_link":
        Alert.alert("Đã sao chép", "Đã sao chép liên kết");
        break;
      case "hide":
        Alert.alert("Đã ẩn", "Bài viết đã được ẩn khỏi feed");
        break;
      case "report":
        Alert.alert("Báo cáo", "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.");
        break;
    }
  }, []);

  const hasImage =
    !!(post.images && post.images.length > 0) || !!post.videoThumbnail;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(280)}
      style={[styles.feedCard, isDark && { backgroundColor: C.cardDark }]}
    >
      {/* Header */}
      <Pressable
        onLongPress={() => setShowContextMenu(true)}
        delayLongPress={600}
        style={styles.feedHeader}
      >
        <View style={styles.authorRow}>
          <TappableUser
            userId={post.author.userId}
            name={post.author.name}
            avatar={post.author.avatar}
            verified={post.author.verified}
            avatarSize={42}
            nameFontSize={14}
            nameColor={isDark ? C.textDark : undefined}
            enablePreview
          />
          <View style={[styles.authorInfo, { marginLeft: 0 }]}>
            <View style={styles.metaRow}>
              <Text
                style={[styles.metaText, isDark && { color: C.textMutedDark }]}
              >
                {timeAgo(post.createdAt)}
              </Text>
              {post.author.role && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text
                    style={[
                      styles.metaText,
                      isDark && { color: C.textMutedDark },
                    ]}
                  >
                    {post.author.role}
                  </Text>
                </>
              )}
              {post.location && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Ionicons name="location" size={10} color="#999" />
                  <Text
                    style={[
                      styles.metaText,
                      isDark && { color: C.textMutedDark },
                    ]}
                  >
                    {post.location}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={[styles.typeBadge, { backgroundColor: `${info.color}15` }]}
          >
            <Ionicons name={info.icon} size={10} color={info.color} />
            <Text style={[styles.typeBadgeText, { color: info.color }]}>
              {info.label}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowContextMenu(true)}
            hitSlop={8}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={isDark ? "#888" : "#999"}
            />
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* Content */}
      <Pressable
        onLongPress={() => setShowContextMenu(true)}
        delayLongPress={600}
      >
        <Text style={[styles.feedContent, isDark && { color: C.textDark }]}>
          {post.content}
        </Text>
      </Pressable>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {post.tags.slice(0, 4).map((tag, i) => (
            <Text key={i} style={styles.tagText}>
              {tag}
            </Text>
          ))}
        </View>
      )}

      {/* Images with long-press */}
      {post.images && post.images.length > 0 && (
        <Pressable
          onLongPress={() => setShowContextMenu(true)}
          delayLongPress={500}
          style={styles.imagesContainer}
        >
          {post.images.length === 1 ? (
            <Image
              source={{ uri: post.images[0] }}
              style={styles.singleImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.imageGrid}>
              {post.images.slice(0, 3).map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img }}
                  style={[
                    styles.gridImage,
                    i === 0 && post.images!.length > 2 && styles.gridImageLg,
                  ]}
                  contentFit="cover"
                />
              ))}
              {post.images.length > 3 && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{post.images.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </Pressable>
      )}

      {/* Video Player (inline) */}
      {post.type === "video" && post.videoThumbnail && (
        <VideoPlayer
          thumbnail={post.videoThumbnail}
          duration={post.videoDuration}
          videoUrl={post.videoUrl}
          videoId={post.videoId}
          isDark={isDark}
        />
      )}

      {/* Engagement stats row */}
      <View
        style={[styles.engagementRow, isDark && { borderColor: "#3A3B3C" }]}
      >
        <View style={styles.likesRow}>
          {likeCount > 0 && (
            <>
              <View style={styles.reactionIconsRow}>
                <View
                  style={[styles.miniReaction, { backgroundColor: C.thumbs }]}
                >
                  <Text style={{ fontSize: 9 }}>👍</Text>
                </View>
                <View
                  style={[
                    styles.miniReaction,
                    { backgroundColor: C.love, marginLeft: -4 },
                  ]}
                >
                  <Text style={{ fontSize: 9 }}>❤️</Text>
                </View>
              </View>
              <Text
                style={[styles.statsText, isDark && { color: C.textMutedDark }]}
              >
                {fmtNum(likeCount)}
              </Text>
            </>
          )}
        </View>
        <View style={styles.csRow}>
          {post.comments > 0 && (
            <Text
              style={[styles.statsText, isDark && { color: C.textMutedDark }]}
            >
              {fmtNum(post.comments)} bình luận
            </Text>
          )}
          {post.shares > 0 && (
            <Text
              style={[styles.statsText, isDark && { color: C.textMutedDark }]}
            >
              {fmtNum(post.shares)} chia sẻ
            </Text>
          )}
        </View>
      </View>

      {/* Action buttons with reaction popup */}
      <View
        style={[styles.actionButtons, isDark && { borderColor: "#3A3B3C" }]}
      >
        <View style={{ position: "relative" }}>
          <ReactionPopup
            visible={showReactions}
            onSelect={handleReactionSelect}
            onClose={() => setShowReactions(false)}
            isDark={isDark}
          />
          <Pressable
            style={styles.actionBtn}
            onPress={handleQuickLike}
            onPressIn={handleLongPressStart}
            onPressOut={handleLongPressEnd}
          >
            {selectedReaction ? (
              <>
                <Text style={{ fontSize: 18 }}>{selectedReaction.emoji}</Text>
                <Text
                  style={[styles.actionText, { color: selectedReaction.color }]}
                >
                  {selectedReaction.label}
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="thumbs-up-outline"
                  size={20}
                  color={isDark ? "#aaa" : "#65676B"}
                />
                <Text style={[styles.actionText, isDark && { color: "#aaa" }]}>
                  Thích
                </Text>
              </>
            )}
          </Pressable>
        </View>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={isDark ? "#aaa" : "#65676B"}
          />
          <Text style={[styles.actionText, isDark && { color: "#aaa" }]}>
            Bình luận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          activeOpacity={0.6}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color={isDark ? "#aaa" : "#65676B"}
          />
          <Text style={[styles.actionText, isDark && { color: "#aaa" }]}>
            Chia sẻ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Context Menu Modal */}
      <ContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        onAction={handleContextAction}
        isDark={isDark}
        hasImage={hasImage}
      />
    </Animated.View>
  );
});

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function CommunityScreen() {
  const isDark = useIsDarkMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("all");
  const [feedData, setFeedData] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      setFeedData(generateFeed());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const filteredFeed = useMemo(() => {
    if (activeFilter === "all") return feedData;
    return feedData.filter((p) => p.type === activeFilter);
  }, [feedData, activeFilter]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    feedCache.delete("main");
    setTimeout(() => {
      setFeedData(generateFeed());
      setIsRefreshing(false);
    }, 800);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: CommunityPost; index: number }) => (
      <FeedCard post={item} isDark={isDark} index={index} />
    ),
    [isDark],
  );

  const ListHeader = useMemo(
    () => (
      <>
        <StoriesSection isDark={isDark} />
        <CreatePostCard isDark={isDark} />
        <FilterChips
          active={activeFilter}
          onSelect={setActiveFilter}
          isDark={isDark}
        />
        <VideoPlaylist isDark={isDark} />
      </>
    ),
    [isDark, activeFilter],
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          isDark && styles.containerDark,
        ]}
      >
        <Stack.Screen
          options={{
            title: "Cộng đồng",
            headerShown: true,
            headerStyle: { backgroundColor: isDark ? C.bgDark : "#fff" },
            headerTintColor: isDark ? "#fff" : "#000",
          }}
        />
        <ActivityIndicator size="large" color={C.teal} />
        <Text style={[styles.loadingText, isDark && { color: "#aaa" }]}>
          Đang tải bảng tin...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: "Cộng đồng Xây dựng",
          headerShown: true,
          headerStyle: { backgroundColor: isDark ? C.bgDark : "#fff" },
          headerTintColor: isDark ? "#fff" : "#000",
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[
                  styles.headerBtn,
                  isDark && { backgroundColor: "rgba(255,255,255,0.08)" },
                ]}
                onPress={() => router.push("/search" as any)}
              >
                <Ionicons
                  name="search"
                  size={22}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerBtn,
                  isDark && { backgroundColor: "rgba(255,255,255,0.08)" },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <FlatList
        data={filteredFeed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[C.teal]}
            tintColor={C.teal}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#ccc" />
            <Text style={[styles.emptyText, isDark && { color: "#666" }]}>
              Chưa có bài viết nào
            </Text>
          </View>
        }
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={7}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => router.push("/create-design-post" as any)}
        activeOpacity={0.8}
      >
        <LinearGradient colors={[C.teal, C.tealLight]} style={styles.fabGrad}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  containerDark: { backgroundColor: C.bgDark },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 14 },
  listContent: { paddingBottom: 100 },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  // Stories
  storiesBox: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
  },
  storiesScroll: { paddingHorizontal: 12, gap: 12 },
  storyItem: { alignItems: "center", width: 72 },
  storyCreateGrad: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: "#ddd",
    padding: 2,
  },
  storyAvatar: { width: "100%", height: "100%", borderRadius: 28 },
  storyName: { fontSize: 11, color: "#555", marginTop: 4, textAlign: "center" },

  // Create Post
  createPostCard: {
    backgroundColor: "#fff",
    marginTop: 8,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  createPostRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  createPostInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E4E6EB",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  createPostPlaceholder: { color: "#999", fontSize: 14 },
  createPostActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E4E6EB",
  },
  createPostAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  createPostActionText: { fontSize: 12, color: "#666", fontWeight: "500" },
  cpDivider: { width: 1, height: 20, backgroundColor: "#E4E6EB" },

  // Filter Chips
  filterChips: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
  },
  filterChipsContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  filterChipActive: { backgroundColor: C.teal },
  filterChipText: { fontSize: 13, color: "#666", fontWeight: "500" },

  // Playlist section
  playlistSection: { backgroundColor: "#fff", marginTop: 8, padding: 16 },
  playlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  playlistTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  playlistTitle: { fontSize: 16, fontWeight: "700", color: "#1C1E21" },
  playlistBadge: {
    backgroundColor: C.teal,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
  },
  playlistBadgeText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  playlistSeeAll: { fontSize: 13, color: C.teal, fontWeight: "600" },
  playlistCatScroll: { gap: 8, marginBottom: 12 },
  playlistCatChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F0F2F5",
  },
  playlistCatActive: { backgroundColor: C.teal },
  playlistCatText: { fontSize: 12, fontWeight: "500", color: "#666" },
  playlistScroll: { gap: 12 },
  playlistCard: { width: 170 },
  playlistThumbWrap: { position: "relative" },
  playlistThumb: {
    width: 170,
    height: 105,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  playlistOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  playlistDurBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  playlistDurText: { fontSize: 10, color: "#fff", fontWeight: "600" },
  playlistIndex: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistIndexText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  playlistVidTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C1E21",
    marginTop: 6,
    lineHeight: 16,
  },
  playlistVidMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  playlistVidViews: { fontSize: 11, color: "#999" },

  // Reactions popup
  reactionPopup: {
    position: "absolute",
    bottom: "100%",
    left: -20,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
    marginBottom: 8,
  },
  reactionItem: {
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reactionEmoji: { fontSize: 28 },
  reactionLabel: { fontSize: 8, color: "#999", marginTop: 1 },

  // Context menu
  contextOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  contextMenu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  contextHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  contextItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  contextItemText: { fontSize: 15, color: "#333", fontWeight: "500" },

  // Video Player
  videoPlayerContainer: { marginBottom: 4 },
  videoPlayerTouch: { position: "relative" },
  videoPlayerImage: { width: "100%", height: 230, backgroundColor: "#111" },
  videoPlayingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  videoPlayCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayBtnBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoDurationBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  videoDurationText: { fontSize: 12, color: "#fff", fontWeight: "600" },
  videoPlayingBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(239,68,68,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoPlayingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  videoPlayingText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  videoControlsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f8f8",
    gap: 8,
  },
  videoControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  videoProgressContainer: { flex: 1 },
  videoProgressBg: { height: 3, backgroundColor: "#ddd", borderRadius: 2 },
  videoProgressFill: { height: 3, backgroundColor: C.teal, borderRadius: 2 },
  videoTimeText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    minWidth: 36,
  },

  // Feed Card
  feedCard: { backgroundColor: "#fff", marginTop: 8, paddingVertical: 12 },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  authorRow: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  authorAvatar: { width: 42, height: 42, borderRadius: 21 },
  authorInfo: { flex: 1 },
  authorNameRow: { flexDirection: "row", alignItems: "center" },
  authorName: { fontSize: 14, fontWeight: "700", color: "#1C1E21" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, color: "#999" },
  metaDot: { fontSize: 11, color: "#ccc" },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "600" },
  feedContent: {
    fontSize: 14,
    lineHeight: 21,
    color: "#1C1E21",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tagText: { fontSize: 12, color: C.teal, fontWeight: "500" },

  // Images
  imagesContainer: { marginBottom: 4 },
  singleImage: { width: "100%", height: 300, backgroundColor: "#eee" },
  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
  gridImage: { width: (SW - 4) / 2, height: 200, backgroundColor: "#eee" },
  gridImageLg: { width: SW, height: 250 },
  moreOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: (SW - 4) / 2,
    height: 200,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: { fontSize: 28, color: "#fff", fontWeight: "700" },

  // Engagement
  engagementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
  },
  likesRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  reactionIconsRow: { flexDirection: "row" },
  miniReaction: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  csRow: { flexDirection: "row", gap: 12 },
  statsText: { fontSize: 12, color: "#999" },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: { fontSize: 13, fontWeight: "500", color: "#65676B" },

  // Empty
  emptyContainer: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: "#999" },

  // FAB
  fab: { position: "absolute", right: 20 },
  fabGrad: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
