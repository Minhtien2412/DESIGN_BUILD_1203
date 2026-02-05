/**
 * Facebook-Style Feed Card Components
 * ====================================
 *
 * Modern social media card design inspired by Facebook/Instagram
 * with engagement actions, comments preview, and media support.
 * Auto-play video when visible in viewport.
 *
 * @author ThietKeResort Team
 * @created 2025-01-20
 * @updated 2026-01-22 - Added inline video auto-play
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { CommunityFeedItem } from "../../services/communityFeedService";
import { MediaFile, useFullMediaViewer } from "../ui/full-media-viewer";
import { useCommentsSheet } from "./CommentsSheet";
import { FeedVideoPlayer } from "./FeedVideoPlayer";
import { useMoreOptions } from "./MoreOptionsMenu";
import { useShareSheet } from "./ShareSheet";
import { useVerticalVideoFeed, VideoItem } from "./VerticalVideoFeed";

const { width: _SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// Theme Constants
// ============================================
const COLORS = {
  background: "#FFFFFF",
  backgroundSecondary: "#F0F2F5",
  primary: "#1877F2", // Facebook blue
  text: "#1C1E21",
  textSecondary: "#65676B",
  textTertiary: "#8A8D91",
  border: "#E4E6EB",
  success: "#31A24C",
  warning: "#F7B928",
  error: "#FA383E",
  like: "#ED4956",
  comment: "#65676B",
  share: "#65676B",
  gradient: {
    primary: ["#1877F2", "#0D6EFD"],
    success: ["#10B981", "#059669"],
  },
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
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày`;

  return date.toLocaleDateString("vi-VN");
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    announcement: "Thông báo",
    development_plan: "Kế hoạch",
    news: "Tin tức",
    video: "Video",
    photo: "Hình ảnh",
    post: "Bài viết",
  };
  return labels[type] || type;
}

function getTypeIcon(type: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    announcement: "megaphone",
    development_plan: "flag",
    news: "newspaper",
    video: "videocam",
    photo: "image",
    post: "document-text",
  };
  return icons[type] || "document";
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    announcement: "#F59E0B",
    development_plan: "#10B981",
    news: "#3B82F6",
    video: "#EF4444",
    photo: "#8B5CF6",
    post: "#6366F1",
  };
  return colors[type] || COLORS.primary;
}

function getImportanceColor(importance: string): string {
  const colors: Record<string, string> = {
    critical: "#DC2626",
    high: "#F59E0B",
    medium: "#3B82F6",
    low: "#6B7280",
  };
  return colors[importance] || COLORS.textSecondary;
}

// ============================================
// Author Header Component
// ============================================
interface AuthorHeaderProps {
  author?: { id?: string; name: string; avatar?: string };
  source: string;
  type: string;
  createdAt: string;
  importance?: string;
  /** Callback when avatar is pressed to navigate to profile */
  onAvatarPress?: () => void;
  /** Callback when more button (3 dots) is pressed */
  onMorePress?: () => void;
}

const AuthorHeader = memo(
  ({
    author,
    source,
    type,
    createdAt,
    importance,
    onAvatarPress,
    onMorePress,
  }: AuthorHeaderProps) => {
    const displayName = author?.name || getSourceName(source);
    const typeColor = getTypeColor(type);
    const router = useRouter();

    // Handle avatar press to navigate to user profile
    const handleAvatarPress = useCallback(() => {
      if (onAvatarPress) {
        onAvatarPress();
        return;
      }

      // Navigate to profile if author has id
      if (author?.id) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/profile/${author.id}` as any);
      }
    }, [author?.id, onAvatarPress, router]);

    return (
      <View style={styles.authorHeader}>
        <TouchableOpacity
          style={styles.authorAvatarContainer}
          onPress={handleAvatarPress}
          disabled={!author?.id && !onAvatarPress}
          activeOpacity={0.7}
        >
          {author?.avatar ? (
            <Image
              source={{ uri: author.avatar }}
              style={styles.authorAvatar}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.authorAvatarPlaceholder,
                { backgroundColor: typeColor },
              ]}
            >
              <Ionicons name={getTypeIcon(type)} size={18} color="white" />
            </View>
          )}
          {/* Source indicator badge */}
          <View
            style={[
              styles.sourceBadge,
              { backgroundColor: getSourceColor(source) },
            ]}
          >
            <Ionicons name={getSourceIcon(source)} size={8} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              disabled={!author?.id && !onAvatarPress}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.authorName,
                  author?.id && styles.authorNameClickable,
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </TouchableOpacity>
            {importance && (
              <View
                style={[
                  styles.importanceBadge,
                  { backgroundColor: getImportanceColor(importance) },
                ]}
              >
                <Text style={styles.importanceText}>
                  {importance === "critical"
                    ? "Khẩn"
                    : importance === "high"
                      ? "Cao"
                      : ""}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formatTimeAgo(createdAt)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <View
              style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}
            >
              <Ionicons name={getTypeIcon(type)} size={10} color={typeColor} />
              <Text style={[styles.typeText, { color: typeColor }]}>
                {getTypeLabel(type)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

function getSourceName(source: string): string {
  const names: Record<string, string> = {
    backend: "BaoTien Team",
    gnews: "GNews",
    pexels: "Pexels",
    newsapi: "NewsAPI",
    mock: "System",
  };
  return names[source] || source;
}

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    backend: "#10B981",
    gnews: "#3B82F6",
    pexels: "#8B5CF6",
    newsapi: "#F59E0B",
    mock: "#6B7280",
  };
  return colors[source] || COLORS.primary;
}

function getSourceIcon(source: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    backend: "server",
    gnews: "globe",
    pexels: "camera",
    newsapi: "newspaper",
    mock: "cube",
  };
  return icons[source] || "globe";
}

// ============================================
// Content Section
// ============================================
interface ContentSectionProps {
  title: string;
  description?: string;
  imageUrl?: string;
  type: string;
  videoUrl?: string;
  duration?: number;
  views?: number;
  progress?: number;
  status?: string;
  /** Unique ID for video player */
  itemId?: string;
  /** Whether this item is visible in viewport (for auto-play) */
  isVisible?: boolean;
  /** Index in list (for preloading) */
  index?: number;
  /** Callback when media (image/video) is pressed */
  onMediaPress?: () => void;
}

const ContentSection = memo(
  ({
    title,
    description,
    imageUrl,
    type,
    videoUrl,
    duration,
    views,
    progress,
    status,
    itemId,
    isVisible = false,
    index = 0,
    onMediaPress,
  }: ContentSectionProps) => {
    return (
      <View style={styles.contentSection}>
        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {description && (
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          )}

          {/* Progress bar for development plans */}
          {type === "development_plan" && typeof progress === "number" && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor:
                        progress >= 100
                          ? COLORS.success
                          : progress >= 50
                            ? COLORS.warning
                            : COLORS.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
              {status && (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusLabel(status)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Video Content - Auto-play inline or show thumbnail if no videoUrl */}
        {type === "video" && (
          <TouchableOpacity
            style={styles.videoContainer}
            onPress={onMediaPress}
            activeOpacity={0.9}
          >
            {videoUrl && itemId ? (
              <FeedVideoPlayer
                videoId={itemId}
                videoUrl={videoUrl}
                thumbnailUrl={imageUrl}
                title={title}
                duration={duration}
                views={views}
                isVisible={isVisible}
                onPress={onMediaPress}
                index={index}
                autoPlay={true}
                startMuted={true}
              />
            ) : (
              // Fallback: Show thumbnail with play button if no video URL
              <View style={styles.videoThumbnailContainer}>
                <Image
                  source={{
                    uri:
                      imageUrl ||
                      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=500&q=80",
                  }}
                  style={styles.mediaImage}
                  contentFit="cover"
                />
                <View style={styles.videoPlayOverlay}>
                  <View style={styles.playButtonCircle}>
                    <Ionicons name="play" size={32} color="white" />
                  </View>
                </View>
                {/* Video stats overlay */}
                <View style={styles.videoStatsOverlay}>
                  {views !== undefined && (
                    <View style={styles.videoStatBadge}>
                      <Ionicons name="eye" size={12} color="white" />
                      <Text style={styles.videoStatText}>
                        {views >= 1000
                          ? `${(views / 1000).toFixed(1)}K`
                          : views}
                      </Text>
                    </View>
                  )}
                  {duration !== undefined && (
                    <View style={styles.videoStatBadge}>
                      <Ionicons name="time" size={12} color="white" />
                      <Text style={styles.videoStatText}>
                        {Math.floor(duration / 60)}:
                        {String(Math.floor(duration % 60)).padStart(2, "0")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Image/Photo Content - Clickable for direct viewing */}
        {type !== "video" && imageUrl && (
          <TouchableOpacity
            style={styles.mediaContainer}
            onPress={onMediaPress}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.mediaImage}
              contentFit="cover"
              transition={200}
            />

            {/* Photo overlay */}
            {type === "photo" && (
              <View style={styles.photoOverlay}>
                <Ionicons name="expand" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    planned: "#6B7280",
    in_progress: "#3B82F6",
    completed: "#10B981",
    delayed: "#EF4444",
  };
  return colors[status] || COLORS.textSecondary;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planned: "Dự kiến",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    delayed: "Trễ tiến độ",
  };
  return labels[status] || status;
}

// ============================================
// Engagement Stats
// ============================================
interface EngagementStatsProps {
  likes: number;
  comments: number;
  shares: number;
}

const EngagementStats = memo(
  ({ likes, comments, shares }: EngagementStatsProps) => {
    if (likes === 0 && comments === 0 && shares === 0) return null;

    return (
      <View style={styles.engagementStats}>
        {likes > 0 && (
          <View style={styles.statItem}>
            <View style={styles.likeIconGroup}>
              <View
                style={[styles.reactionIcon, { backgroundColor: COLORS.like }]}
              >
                <Ionicons name="heart" size={10} color="white" />
              </View>
              <View
                style={[
                  styles.reactionIcon,
                  { backgroundColor: COLORS.primary, marginLeft: -4 },
                ]}
              >
                <Ionicons name="thumbs-up" size={10} color="white" />
              </View>
            </View>
            <Text style={styles.statText}>{formatNumber(likes)}</Text>
          </View>
        )}
        <View style={styles.statRight}>
          {comments > 0 && (
            <Text style={styles.statText}>
              {formatNumber(comments)} bình luận
            </Text>
          )}
          {shares > 0 && (
            <Text style={styles.statText}>{formatNumber(shares)} chia sẻ</Text>
          )}
        </View>
      </View>
    );
  },
);

// ============================================
// Action Buttons
// ============================================
interface ActionButtonsProps {
  liked: boolean;
  saved?: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave?: () => void;
}

const ActionButtons = memo(
  ({
    liked,
    saved,
    onLike,
    onComment,
    onShare,
    onSave,
  }: ActionButtonsProps) => {
    const likeScale = useSharedValue(1);
    const saveScale = useSharedValue(1);

    const handleLike = () => {
      likeScale.value = withSpring(1.3, { damping: 10 }, () => {
        likeScale.value = withSpring(1);
      });
      onLike();
    };

    const handleSave = () => {
      saveScale.value = withSpring(1.3, { damping: 10 }, () => {
        saveScale.value = withSpring(1);
      });
      onSave?.();
    };

    const likeAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));

    const saveAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: saveScale.value }],
    }));

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={likeAnimatedStyle}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? COLORS.like : COLORS.textSecondary}
            />
          </Animated.View>
          <Text style={[styles.actionText, liked && { color: COLORS.like }]}>
            Thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={COLORS.textSecondary}
          />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color={COLORS.textSecondary}
          />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>

        {onSave && (
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Animated.View style={saveAnimatedStyle}>
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={saved ? COLORS.primary : COLORS.textSecondary}
              />
            </Animated.View>
            <Text
              style={[styles.actionText, saved && { color: COLORS.primary }]}
            >
              {saved ? "Đã lưu" : "Lưu"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

// ============================================
// Main Feed Card Component
// ============================================
interface FacebookFeedCardProps {
  item: CommunityFeedItem;
  /** Whether this card is currently visible in viewport (for video auto-play) */
  isVisible?: boolean;
  /** Index in the list (for video preloading) */
  index?: number;
  /** All videos in the feed (for vertical video feed navigation) */
  allVideos?: CommunityFeedItem[];
  /** Index of this video in allVideos array */
  videoIndex?: number;
  onPress?: () => void;
}

export const FacebookFeedCard = memo(
  ({
    item,
    isVisible = false,
    index = 0,
    allVideos,
    videoIndex = 0,
    onPress,
  }: FacebookFeedCardProps) => {
    const router = useRouter();
    const mediaViewer = useFullMediaViewer();
    const verticalVideoFeed = useVerticalVideoFeed();
    const commentsSheet = useCommentsSheet();
    const shareSheet = useShareSheet();
    const moreOptions = useMoreOptions();
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(
      item.metadata?.likes || Math.floor(Math.random() * 100),
    );
    const [localCommentsCount, setLocalCommentsCount] = useState(
      item.metadata?.comments || Math.floor(Math.random() * 20),
    );
    const sharesCount = item.metadata?.shares || Math.floor(Math.random() * 10);

    const handleLike = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLiked(!liked);
      setLikesCount((prev: number) => (liked ? prev - 1 : prev + 1));
    };

    const handleComment = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Open comments sheet
      commentsSheet.open({
        contentId: item.id,
        contentType:
          item.type === "video"
            ? "video"
            : item.type === "photo"
              ? "post"
              : item.type === "news"
                ? "news"
                : "post",
        title: item.title || "Bình luận",
        showRating: item.type === "news" || item.type === "development_plan", // Show rating for news/plans
        placeholder: "Viết bình luận...",
        onCommentPost: (comment: {
          content: string;
          parentId: string | null;
          rating?: number;
        }) => {
          console.log("New comment:", comment);
          setLocalCommentsCount((prev: number) => prev + 1);
        },
        onCommentLike: (commentId: string) => {
          console.log("Liked comment:", commentId);
        },
      });
    };

    const handleShare = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Open share sheet with item info
      shareSheet.open({
        item: {
          id: item.id,
          type:
            item.type === "video"
              ? "video"
              : item.type === "photo"
                ? "image"
                : "post",
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
        },
        onShare: (platform) => {
          console.log(`Shared via ${platform}:`, item.id);
        },
        onCopyLink: () => {
          console.log("Link copied:", item.id);
        },
      });
    }, [item, shareSheet]);

    const handleSave = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSaved(!saved);
      // TODO: Persist save state to backend/storage
      console.log(saved ? "Unsaved:" : "Saved:", item.id);
    }, [saved, item.id]);

    const handleMoreOptions = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Open more options menu
      moreOptions.open({
        item: {
          id: item.id,
          type:
            item.type === "video"
              ? "video"
              : item.type === "news"
                ? "news"
                : "post",
          authorId: item.author?.id,
          authorName: item.author?.name,
          isSaved: saved,
        },
        onSave: (newSaved) => {
          setSaved(newSaved);
        },
        onHide: () => {
          console.log("Hidden:", item.id);
          // TODO: Update feed to hide this item
        },
        onReport: () => {
          console.log("Reported:", item.id);
        },
        onCopyLink: () => {
          console.log("Link copied from menu:", item.id);
        },
      });
    }, [item, saved, moreOptions]);

    // Handle video press - open vertical video feed (Facebook/TikTok style)
    const handleVideoPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Convert all video items to VideoItem format
      const videoItems: VideoItem[] = (allVideos || [item])
        .filter((v) => v.type === "video")
        .map((v) => {
          const videoData = v as any;
          return {
            id: v.id,
            videoUrl: videoData.videoUrl || "",
            thumbnailUrl: videoData.thumbnailUrl || v.imageUrl,
            title: v.title,
            description: v.description,
            author: v.author,
            duration: videoData.duration,
            views: videoData.views,
            likes: v.metadata?.likes,
            comments: v.metadata?.comments,
            shares: v.metadata?.shares,
            createdAt: v.createdAt,
          };
        });

      // Find the index of current video
      const currentVideoIndex = videoItems.findIndex((v) => v.id === item.id);

      // Open vertical video feed
      verticalVideoFeed.open(
        videoItems,
        currentVideoIndex >= 0 ? currentVideoIndex : 0,
      );
    }, [item, allVideos, verticalVideoFeed]);

    // Handle media press - open directly in full-screen viewer like Facebook
    const handleMediaPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // For videos, use vertical video feed
      if (item.type === "video") {
        handleVideoPress();
        return;
      }

      // For images, use media viewer
      const mediaUrl = item.imageUrl;

      if (!mediaUrl) return;

      // Create media file for viewer
      const mediaFile: MediaFile = {
        id: item.id,
        uri: mediaUrl,
        type: "image",
        title: item.title,
        description: item.description,
        thumbnail: item.imageUrl,
        createdAt: item.createdAt,
      };

      // Open media viewer directly - Facebook style
      mediaViewer.open([mediaFile], 0, {
        allowDelete: false,
        allowEdit: false,
        allowShare: true,
        allowDownload: true,
        showInfo: true,
        headerTitle: item.title,
      });
    }, [item, mediaViewer, handleVideoPress]);

    const handlePress = () => {
      if (onPress) {
        onPress();
        return;
      }

      // For video/photo, open media viewer directly (Facebook style)
      if (item.type === "video" || item.type === "photo") {
        handleMediaPress();
        return;
      }

      // Default navigation for other types
      switch (item.type) {
        case "news":
          const newsItem = item as any;
          if (newsItem.url) {
            router.push(
              `/webview?url=${encodeURIComponent(newsItem.url)}` as any,
            );
          }
          break;
        case "announcement":
          router.push(`/crm-notifications`);
          break;
        case "development_plan":
          router.push(`/progress-tracking`);
          break;
      }
    };

    // Handle author avatar press to navigate to profile
    const handleAuthorPress = useCallback(() => {
      if (item.author?.id) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/profile/${item.author.id}` as any);
      }
    }, [item.author?.id, router]);

    // Get type-specific props
    const videoItem = item.type === "video" ? (item as any) : null;
    const devPlanItem = item.type === "development_plan" ? (item as any) : null;
    const announcementItem =
      item.type === "announcement" ? (item as any) : null;

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.cardContainer}
      >
        <TouchableOpacity activeOpacity={0.95} onPress={handlePress}>
          <View style={styles.card}>
            {/* Author Header - Avatar/Name clickable to profile, 3-dots for more options */}
            <AuthorHeader
              author={item.author}
              source={item.source}
              type={item.type}
              createdAt={item.createdAt}
              importance={announcementItem?.importance}
              onAvatarPress={item.author?.id ? handleAuthorPress : undefined}
              onMorePress={handleMoreOptions}
            />

            {/* Content - Media is clickable for direct viewing */}
            <ContentSection
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl || videoItem?.thumbnailUrl}
              type={item.type}
              videoUrl={videoItem?.videoUrl}
              duration={videoItem?.duration}
              views={videoItem?.views}
              progress={devPlanItem?.progress}
              status={devPlanItem?.status}
              itemId={item.id}
              isVisible={isVisible}
              index={index}
              onMediaPress={
                item.type === "video" || item.type === "photo"
                  ? handleMediaPress
                  : undefined
              }
            />

            {/* Engagement Stats */}
            <EngagementStats
              likes={likesCount}
              comments={localCommentsCount}
              shares={sharesCount}
            />

            {/* Divider */}
            <View style={styles.divider} />

            {/* Action Buttons */}
            <ActionButtons
              liked={liked}
              saved={saved}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onSave={handleSave}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

// ============================================
// Story Card (for horizontal scroll at top)
// ============================================
interface StoryCardProps {
  item: CommunityFeedItem;
  onPress?: () => void;
}

export const StoryCard = memo(({ item, onPress }: StoryCardProps) => {
  const typeColor = getTypeColor(item.type);

  return (
    <TouchableOpacity style={styles.storyCard} onPress={onPress}>
      <Image
        source={{
          uri:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=100&q=80",
        }}
        style={styles.storyImage}
        contentFit="cover"
      />
      <View style={styles.storyOverlay}>
        <View style={[styles.storyBadge, { backgroundColor: typeColor }]}>
          <Ionicons name={getTypeIcon(item.type)} size={12} color="white" />
        </View>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ============================================
// Create Post Card (appears at top of feed)
// ============================================
interface CreatePostCardProps {
  userAvatar?: string;
  onPress: () => void;
}

export const CreatePostCard = memo(
  ({ userAvatar, onPress }: CreatePostCardProps) => {
    return (
      <TouchableOpacity style={styles.createPostCard} onPress={onPress}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.createPostAvatar} />
        ) : (
          <View style={styles.createPostAvatarPlaceholder}>
            <Ionicons name="person" size={20} color={COLORS.textSecondary} />
          </View>
        )}
        <View style={styles.createPostInput}>
          <Text style={styles.createPostPlaceholder}>Bạn đang nghĩ gì?</Text>
        </View>
        <View style={styles.createPostActions}>
          <TouchableOpacity style={styles.createPostAction}>
            <Ionicons name="image" size={24} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createPostAction}>
            <Ionicons name="videocam" size={24} color={COLORS.like} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  },
);

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  // Card Container
  cardContainer: {
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 0,
    // Remove shadow for cleaner Facebook look on mobile
  },

  // Author Header
  authorHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  authorAvatarContainer: {
    position: "relative",
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sourceBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  authorInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  authorNameClickable: {
    color: COLORS.primary,
  },
  importanceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  importanceText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  moreButton: {
    padding: SPACING.xs,
  },

  // Content Section
  contentSection: {},
  textContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    minWidth: 35,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },

  // Media
  videoContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 5, // Facebook-style: taller than wide (4:5 ratio)
    backgroundColor: "#000",
    overflow: "hidden",
  },
  videoThumbnailContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
  videoStatsOverlay: {
    position: "absolute",
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: "row",
    gap: SPACING.sm,
  },
  videoStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  videoStatText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  mediaContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 5, // Match video ratio for consistency
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  viewsBadge: {
    position: "absolute",
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  viewsText: {
    fontSize: 11,
    color: "white",
  },
  photoOverlay: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Engagement Stats
  engagementStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeIconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statRight: {
    flexDirection: "row",
    gap: SPACING.md,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SPACING.xs,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },

  // Story Card
  storyCard: {
    width: 110,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: SPACING.sm,
  },
  storyImage: {
    width: "100%",
    height: "100%",
  },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  storyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  storyTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Create Post Card
  createPostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  createPostAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  createPostInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  createPostPlaceholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  createPostActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  createPostAction: {
    padding: SPACING.xs,
  },
});
