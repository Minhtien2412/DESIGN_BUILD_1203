/**
 * Video Watch Screen - Facebook Watch Style
 * ==========================================
 *
 * Hiển thị video theo phong cách Facebook Watch:
 * - Không có header cứng "Demo Videos"
 * - Tập trung vào video content
 * - Có thể xem video ngay trong app
 * - Folder/Category navigation
 *
 * @author ThietKeResort Team
 * @updated 2025-01-20
 */

import { VideoPlayerModal } from "@/components/media/VideoPlayerModal";
import {
    DEMO_CONSTRUCTION_VIDEOS,
    VIDEO_CATEGORIES,
    type VideoCategory,
    type VideoItem
} from "@/data/videos";
import { getServerFeed } from "@/services/reelsService";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Theme Constants - Dark Mode (Facebook Watch)
// ============================================
const COLORS = {
  background: "#000000",
  backgroundLight: "#18191A",
  surface: "#242526",
  surfaceHover: "#3A3B3C",
  primary: "#2374E1",
  text: "#E4E6EB",
  textSecondary: "#B0B3B8",
  textTertiary: "#8A8D91",
  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.6)",
  like: "#F91880",
  comment: "#6BCEBB",
  share: "#D4A259",
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

// ============================================
// Helper Functions
// ============================================
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// ============================================
// Category Folder Item
// ============================================
interface CategoryFolderProps {
  category: {
    key: VideoCategory | "all";
    label: string;
    icon: string;
    color: string;
  };
  count: number;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryFolder = memo(
  ({ category, count, isSelected, onPress }: CategoryFolderProps) => {
    return (
      <TouchableOpacity
        style={[
          styles.categoryFolder,
          isSelected && styles.categoryFolderActive,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.folderIcon, { backgroundColor: category.color }]}>
          <Ionicons
            name={category.icon as any}
            size={18}
            color={COLORS.white}
          />
        </View>
        <View style={styles.folderInfo}>
          <Text style={styles.folderName} numberOfLines={1}>
            {category.label}
          </Text>
          <Text style={styles.folderCount}>{count} video</Text>
        </View>
        {isSelected && (
          <View style={styles.folderCheck}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.primary}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

// ============================================
// Video Card (Grid Style)
// ============================================
interface VideoCardProps {
  video: VideoItem;
  onPress: () => void;
  index?: number;
}

const VideoCard = memo(({ video, onPress, index = 0 }: VideoCardProps) => {
  const categoryInfo = VIDEO_CATEGORIES[video.category || "other"];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={styles.videoCard}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />

          {/* Play overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color={COLORS.white} />
            </View>
          </View>

          {/* Duration */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>

          {/* Views */}
          <View style={styles.viewsBadge}>
            <Ionicons name="eye" size={10} color={COLORS.white} />
            <Text style={styles.viewsText}>
              {formatNumber(video.views || 0)}
            </Text>
          </View>
        </View>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.videoMeta}>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: categoryInfo.color + "30" },
              ]}
            >
              <Ionicons
                name={categoryInfo.icon as any}
                size={10}
                color={categoryInfo.color}
              />
              <Text
                style={[styles.categoryTagText, { color: categoryInfo.color }]}
              >
                {categoryInfo.label}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================
// Video Feed Card (Full Width - Facebook Style)
// ============================================
interface VideoFeedCardProps {
  video: VideoItem;
  onPlayPress: () => void;
}

const VideoFeedCard = memo(({ video, onPlayPress }: VideoFeedCardProps) => {
  const [liked, setLiked] = useState(false);
  const categoryInfo = VIDEO_CATEGORIES[video.category || "other"];
  const likeScale = useSharedValue(1);

  const handleLike = () => {
    likeScale.value = withSpring(1.3, { damping: 10 }, () => {
      likeScale.value = withSpring(1);
    });
    setLiked(!liked);
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.feedCard}>
      {/* Header */}
      <View style={styles.feedCardHeader}>
        <View
          style={[styles.feedAvatar, { backgroundColor: categoryInfo.color }]}
        >
          <Ionicons
            name={categoryInfo.icon as any}
            size={16}
            color={COLORS.white}
          />
        </View>
        <View style={styles.feedHeaderInfo}>
          <Text style={styles.feedAuthor}>{categoryInfo.label}</Text>
          <Text style={styles.feedTime}>
            {formatNumber(video.views || 0)} lượt xem
          </Text>
        </View>
        <TouchableOpacity style={styles.feedMoreBtn}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.feedDescription} numberOfLines={2}>
        {video.title}
      </Text>

      {/* Video Thumbnail */}
      <TouchableOpacity
        style={styles.feedThumbnailContainer}
        onPress={onPlayPress}
        activeOpacity={0.95}
      >
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.feedThumbnail}
          contentFit="cover"
        />

        {/* Big Play Button */}
        <View style={styles.feedPlayOverlay}>
          <View style={styles.feedPlayButton}>
            <Ionicons name="play" size={40} color={COLORS.white} />
          </View>
        </View>

        {/* Duration */}
        <View style={styles.feedDurationBadge}>
          <Ionicons name="time-outline" size={12} color={COLORS.white} />
          <Text style={styles.feedDurationText}>{video.duration}</Text>
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.feedActions}>
        <TouchableOpacity style={styles.feedAction} onPress={handleLike}>
          <Animated.View style={likeAnimatedStyle}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? COLORS.like : COLORS.textSecondary}
            />
          </Animated.View>
          <Text
            style={[styles.feedActionText, liked && { color: COLORS.like }]}
          >
            {formatNumber((video.likes || 0) + (liked ? 1 : 0))}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.feedAction}>
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={COLORS.textSecondary}
          />
          <Text style={styles.feedActionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.feedAction}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color={COLORS.textSecondary}
          />
          <Text style={styles.feedActionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

// ============================================
// View Mode Toggle
// ============================================
type ViewMode = "feed" | "grid" | "folders";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ViewModeToggle = memo(({ mode, onChange }: ViewModeToggleProps) => {
  return (
    <View style={styles.viewModeToggle}>
      <TouchableOpacity
        style={[
          styles.viewModeBtn,
          mode === "feed" && styles.viewModeBtnActive,
        ]}
        onPress={() => onChange("feed")}
      >
        <Ionicons
          name="list"
          size={18}
          color={mode === "feed" ? COLORS.white : COLORS.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.viewModeBtn,
          mode === "grid" && styles.viewModeBtnActive,
        ]}
        onPress={() => onChange("grid")}
      >
        <Ionicons
          name="grid"
          size={18}
          color={mode === "grid" ? COLORS.white : COLORS.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.viewModeBtn,
          mode === "folders" && styles.viewModeBtnActive,
        ]}
        onPress={() => onChange("folders")}
      >
        <Ionicons
          name="folder"
          size={18}
          color={mode === "folders" ? COLORS.white : COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
});
// ============================================
// Main Screen Component
// ============================================
export default function DemoVideosScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<
    VideoCategory | "all"
  >("all");
  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [serverVideos, setServerVideos] = useState<VideoItem[]>([]);
  const [loadingServer, setLoadingServer] = useState(true);

  // Fetch videos from server API (pipeline: server → cache → stream)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingServer(true);
        const response = await getServerFeed(20);
        if (!cancelled && response?.reels?.length) {
          const mapped: VideoItem[] = response.reels.map((reel: any) => ({
            id: `server-${reel.id}`,
            title: reel.title || "Video xây dựng",
            url: reel.videoUrl || reel.video_url || "",
            thumbnail: reel.thumbnail || reel.image || "",
            author: reel.author || reel.user?.name || "Design Build Team",
            authorAvatarUrl:
              reel.user?.url ||
              "https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff",
            likes: reel.likes || 0,
            comments: reel.comments || 0,
            shares: reel.shares || 0,
            views: reel.views || 0,
            duration: reel.duration
              ? `${Math.floor(reel.duration / 60)}:${String(reel.duration % 60).padStart(2, "0")}`
              : "0:30",
            category: "construction" as VideoCategory,
            hashtags: reel.tags || ["xâydựng", "video"],
            type: "demo" as const,
            description: reel.description || "",
            createdAt: reel.createdAt || new Date().toISOString(),
          }));
          setServerVideos(mapped);
        }
      } catch (err) {
        console.log("[DemoVideos] Server fetch failed, using local data:", err);
      } finally {
        if (!cancelled) setLoadingServer(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge server videos with local data, server videos first
  const allVideos = useMemo(() => {
    const combined = [...serverVideos, ...DEMO_CONSTRUCTION_VIDEOS];
    // De-duplicate by id
    const seen = new Set<string>();
    return combined.filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }, [serverVideos]);

  // Prepare categories with counts (includes server videos)
  const categoriesWithCounts = useMemo(() => {
    const cats = Object.entries(VIDEO_CATEGORIES).map(([key, value]) => ({
      key: key as VideoCategory,
      ...value,
      count: allVideos.filter((v) => v.category === key).length,
    }));
    return [
      {
        key: "all" as const,
        label: "Tất cả",
        icon: "play-circle",
        color: "#6366f1",
        count: allVideos.length,
      },
      ...cats,
    ];
  }, [allVideos]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === "all") return allVideos;
    return allVideos.filter((v) => v.category === selectedCategory);
  }, [selectedCategory, allVideos]);

  const handlePlayVideo = useCallback((video: VideoItem) => {
    setSelectedVideo(video);
    setPlayerVisible(true);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setPlayerVisible(false);
    setSelectedVideo(null);
  }, []);

  // Render content based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case "folders":
        return (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.foldersContainer}
          >
            <Text style={styles.sectionLabel}>📁 Thư mục video</Text>
            {categoriesWithCounts.map((cat, index) => (
              <Animated.View
                key={cat.key}
                entering={SlideInRight.delay(index * 50).duration(300)}
              >
                <CategoryFolder
                  category={cat}
                  count={cat.count}
                  isSelected={selectedCategory === cat.key}
                  onPress={() => {
                    setSelectedCategory(cat.key);
                    setViewMode("grid");
                  }}
                />
              </Animated.View>
            ))}
          </Animated.View>
        );

      case "grid":
        return (
          <View style={styles.gridContainer}>
            {/* Category Pills */}
            <FlatList
              horizontal
              data={categoriesWithCounts}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPills}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryPill,
                    selectedCategory === item.key && {
                      backgroundColor: item.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(item.key)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={14}
                    color={
                      selectedCategory === item.key ? COLORS.white : item.color
                    }
                  />
                  <Text
                    style={[
                      styles.categoryPillText,
                      selectedCategory === item.key && { color: COLORS.white },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Video Grid */}
            <FlatList
              data={filteredVideos}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <VideoCard
                  video={item}
                  index={index}
                  onPress={() => handlePlayVideo(item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons
                    name="videocam-off"
                    size={48}
                    color={COLORS.textTertiary}
                  />
                  <Text style={styles.emptyText}>
                    Không có video trong danh mục này
                  </Text>
                </View>
              }
            />
          </View>
        );

      case "feed":
      default:
        return (
          <FlatList
            data={filteredVideos}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedContainer}
            ItemSeparatorComponent={() => <View style={styles.feedSeparator} />}
            renderItem={({ item }) => (
              <VideoFeedCard
                video={item}
                onPlayPress={() => handlePlayVideo(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="videocam-off"
                  size={48}
                  color={COLORS.textTertiary}
                />
                <Text style={styles.emptyText}>Không có video</Text>
              </View>
            }
          />
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Minimal Header - No Title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <ViewModeToggle mode={viewMode} onChange={setViewMode} />

        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Video Player - Xem video trong app */}
      {selectedVideo && (
        <VideoPlayerModal
          visible={playerVisible}
          url={typeof selectedVideo.url === "string" ? selectedVideo.url : ""}
          title={selectedVideo.title}
          poster={selectedVideo.thumbnail}
          onClose={handleClosePlayer}
        />
      )}
    </View>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header - Minimal
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  backButton: {
    padding: SPACING.xs,
  },
  searchBtn: {
    padding: SPACING.xs,
  },

  // View Mode Toggle
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 2,
  },
  viewModeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  viewModeBtnActive: {
    backgroundColor: COLORS.primary,
  },

  // Section Label
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  // Folders View
  foldersContainer: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  categoryFolder: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  categoryFolderActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  folderIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  folderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  folderName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  folderCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  folderCheck: {
    marginLeft: SPACING.sm,
  },

  // Grid View
  gridContainer: {
    flex: 1,
  },
  categoryPills: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    gap: 6,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
  },
  gridContent: {
    paddingBottom: 100,
  },
  videoCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 10,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.white,
  },
  viewsBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  viewsText: {
    fontSize: 10,
    color: COLORS.white,
  },
  videoInfo: {
    padding: SPACING.sm,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 18,
  },
  videoMeta: {
    marginTop: SPACING.xs,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "500",
  },

  // Feed View
  feedContainer: {
    paddingTop: SPACING.sm,
    paddingBottom: 100,
  },
  feedSeparator: {
    height: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  feedCard: {
    backgroundColor: COLORS.backgroundLight,
    paddingBottom: SPACING.sm,
  },
  feedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  feedHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  feedAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  feedTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  feedMoreBtn: {
    padding: SPACING.xs,
  },
  feedDescription: {
    fontSize: 14,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  feedThumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  feedThumbnail: {
    width: "100%",
    height: "100%",
  },
  feedPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  feedPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedDurationBadge: {
    position: "absolute",
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  feedDurationText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.white,
  },
  feedActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    marginTop: SPACING.sm,
  },
  feedAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    gap: 6,
  },
  feedActionText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
