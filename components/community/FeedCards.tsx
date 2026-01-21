/**
 * Community Feed Card Components
 * ==============================
 *
 * Unified card components for different feed content types.
 *
 * @author ThietKeResort Team
 * @created 2025-01-15
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo } from "react";
import {
    Dimensions,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    COMMUNITY_COLORS as COLORS,
    COMMUNITY_RADIUS as RADIUS,
    COMMUNITY_SHADOWS as SHADOWS,
    COMMUNITY_SPACING as SPACING,
    COMMUNITY_TYPOGRAPHY as TYPOGRAPHY,
} from "../../constants/community-theme";
import {
    AnnouncementFeedItem,
    CommunityFeedItem,
    DevelopmentPlanFeedItem,
    NewsFeedItem,
    PhotoFeedItem,
    VideoFeedItem,
} from "../../services/communityFeedService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// Utility Functions
// ============================================
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// ============================================
// Announcement Card
// ============================================
interface AnnouncementCardProps {
  item: AnnouncementFeedItem;
  onPress?: () => void;
}

export const AnnouncementCard = memo(function AnnouncementCard({
  item,
  onPress,
}: AnnouncementCardProps) {
  const importanceColors = {
    critical: "#EF4444",
    high: "#F59E0B",
    medium: "#3B82F6",
    low: "#6B7280",
  };

  const importanceLabels = {
    critical: "Khẩn cấp",
    high: "Quan trọng",
    medium: "Thông báo",
    low: "Thông tin",
  };

  return (
    <TouchableOpacity
      style={styles.announcementCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.announcementHeader}>
        <View
          style={[
            styles.importanceBadge,
            { backgroundColor: importanceColors[item.importance] + "20" },
          ]}
        >
          <Ionicons
            name="megaphone"
            size={14}
            color={importanceColors[item.importance]}
          />
          <Text
            style={[
              styles.importanceText,
              { color: importanceColors[item.importance] },
            ]}
          >
            {importanceLabels[item.importance]}
          </Text>
        </View>
        <Text style={styles.cardTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>

      <Text style={styles.announcementTitle} numberOfLines={2}>
        {item.title}
      </Text>

      {item.description && (
        <Text style={styles.announcementDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      {item.attachments && item.attachments.length > 0 && (
        <View style={styles.attachmentRow}>
          <Ionicons name="attach" size={16} color={COLORS.textSecondary} />
          <Text style={styles.attachmentText}>
            {item.attachments.length} tệp đính kèm
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {item.author?.name.charAt(0) || "S"}
            </Text>
          </View>
          <Text style={styles.authorName}>
            {item.author?.name || "Hệ thống"}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
});

// ============================================
// Development Plan Card
// ============================================
interface DevelopmentPlanCardProps {
  item: DevelopmentPlanFeedItem;
  onPress?: () => void;
}

export const DevelopmentPlanCard = memo(function DevelopmentPlanCard({
  item,
  onPress,
}: DevelopmentPlanCardProps) {
  const statusColors = {
    planned: "#6B7280",
    in_progress: "#3B82F6",
    completed: "#10B981",
    delayed: "#EF4444",
  };

  const statusLabels = {
    planned: "Dự kiến",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    delayed: "Chậm tiến độ",
  };

  return (
    <TouchableOpacity
      style={styles.planCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["#3B82F620", "#8B5CF620"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planGradient}
      >
        <View style={styles.planHeader}>
          <View style={styles.planPhaseContainer}>
            {item.phase && (
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseText}>{item.phase}</Text>
              </View>
            )}
            {item.status && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[item.status] + "20" },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColors[item.status] },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColors[item.status] },
                  ]}
                >
                  {statusLabels[item.status]}
                </Text>
              </View>
            )}
          </View>

          <Ionicons name="flag" size={20} color={COLORS.primary} />
        </View>

        <Text style={styles.planTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.description && (
          <Text style={styles.planDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Progress Bar */}
        {item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ</Text>
              <Text style={styles.progressValue}>{item.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${item.progress}%` }]}
              />
            </View>
          </View>
        )}

        {/* Milestones */}
        {item.milestones && item.milestones.length > 0 && (
          <View style={styles.milestonesContainer}>
            <Text style={styles.milestonesTitle}>Các mốc quan trọng:</Text>
            {item.milestones.slice(0, 3).map((milestone, index) => (
              <View key={index} style={styles.milestoneRow}>
                <Ionicons
                  name={
                    milestone.status === "completed"
                      ? "checkmark-circle"
                      : milestone.status === "in_progress"
                        ? "ellipse"
                        : "ellipse-outline"
                  }
                  size={16}
                  color={
                    milestone.status === "completed"
                      ? "#10B981"
                      : milestone.status === "in_progress"
                        ? "#3B82F6"
                        : COLORS.textTertiary
                  }
                />
                <Text style={styles.milestoneName} numberOfLines={1}>
                  {milestone.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {item.targetDate && (
          <View style={styles.targetDateRow}>
            <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
            <Text style={styles.targetDateText}>
              Mục tiêu: {new Date(item.targetDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
});

// ============================================
// News Card
// ============================================
interface NewsCardProps {
  item: NewsFeedItem;
  variant?: "full" | "compact";
  onPress?: () => void;
}

export const NewsCard = memo(function NewsCard({
  item,
  variant = "full",
  onPress,
}: NewsCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (item.url) {
      Linking.openURL(item.url);
    }
  };

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={styles.newsCardCompact}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.newsImageCompact}
          />
        )}
        <View style={styles.newsContentCompact}>
          <Text style={styles.newsSourceCompact}>{item.sourceName}</Text>
          <Text style={styles.newsTitleCompact} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.newsTimeCompact}>
            {formatTimeAgo(item.publishedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.newsContent}>
        <View style={styles.newsSourceRow}>
          <Text style={styles.newsSource}>{item.sourceName}</Text>
          {item.category && (
            <View style={styles.newsCategoryBadge}>
              <Text style={styles.newsCategoryText}>{item.category}</Text>
            </View>
          )}
        </View>

        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.description && (
          <Text style={styles.newsDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.newsFooter}>
          <Text style={styles.newsTime}>{formatTimeAgo(item.publishedAt)}</Text>
          <View style={styles.newsExternalIcon}>
            <Ionicons
              name="open-outline"
              size={14}
              color={COLORS.textTertiary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ============================================
// Video Card
// ============================================
interface VideoCardProps {
  item: VideoFeedItem;
  variant?: "large" | "small";
  onPress?: () => void;
}

export const VideoCard = memo(function VideoCard({
  item,
  variant = "large",
  onPress,
}: VideoCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/demo-videos?videoUrl=${encodeURIComponent(item.videoUrl)}`);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (variant === "small") {
    return (
      <TouchableOpacity
        style={styles.videoCardSmall}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.videoThumbnailSmall}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.videoOverlay}
        >
          <View style={styles.playIcon}>
            <Ionicons name="play" size={20} color="white" />
          </View>

          <View style={styles.videoInfoSmall}>
            {item.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
            )}
            {item.views && (
              <Text style={styles.viewsText}>
                {formatNumber(item.views)} lượt xem
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.videoThumbnail}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.videoGradient}
      >
        <View style={styles.playIconLarge}>
          <Ionicons name="play" size={32} color="white" />
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.videoMeta}>
            {item.author && (
              <View style={styles.videoAuthor}>
                {item.author.avatar ? (
                  <Image
                    source={{ uri: item.author.avatar }}
                    style={styles.videoAuthorAvatar}
                  />
                ) : (
                  <View style={styles.videoAuthorPlaceholder}>
                    <Ionicons name="person" size={12} color="white" />
                  </View>
                )}
                <Text style={styles.videoAuthorName}>{item.author.name}</Text>
              </View>
            )}

            <View style={styles.videoStats}>
              {item.views && (
                <Text style={styles.videoStatText}>
                  {formatNumber(item.views)} views
                </Text>
              )}
              {item.duration && (
                <Text style={styles.videoStatText}>
                  {formatDuration(item.duration)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// ============================================
// Photo Card
// ============================================
interface PhotoCardProps {
  item: PhotoFeedItem;
  onPress?: () => void;
}

export const PhotoCard = memo(function PhotoCard({
  item,
  onPress,
}: PhotoCardProps) {
  return (
    <TouchableOpacity
      style={styles.photoCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.photoImage}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={styles.photoOverlay}
      >
        {item.photographer && (
          <View style={styles.photographerRow}>
            <Ionicons name="camera" size={12} color="white" />
            <Text style={styles.photographerName}>{item.photographer}</Text>
          </View>
        )}
      </LinearGradient>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.photoTags}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.photoTag}>
              <Text style={styles.photoTagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
});

// ============================================
// Feed Item Renderer
// ============================================
interface FeedItemRendererProps {
  item: CommunityFeedItem;
  onPress?: () => void;
}

export const FeedItemRenderer = memo(function FeedItemRenderer({
  item,
  onPress,
}: FeedItemRendererProps) {
  switch (item.type) {
    case "announcement":
      return (
        <AnnouncementCard
          item={item as AnnouncementFeedItem}
          onPress={onPress}
        />
      );
    case "development_plan":
      return (
        <DevelopmentPlanCard
          item={item as DevelopmentPlanFeedItem}
          onPress={onPress}
        />
      );
    case "news":
      return <NewsCard item={item as NewsFeedItem} onPress={onPress} />;
    case "video":
      return <VideoCard item={item as VideoFeedItem} onPress={onPress} />;
    case "photo":
      return <PhotoCard item={item as PhotoFeedItem} onPress={onPress} />;
    default:
      return null;
  }
});

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  // Announcement Card
  announcementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  importanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  importanceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  cardTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  announcementTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  announcementDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  attachmentText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitial: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: "white",
  },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Development Plan Card
  planCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  planGradient: {
    padding: SPACING.lg,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  planPhaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  phaseBadge: {
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  phaseText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  planTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  planDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  milestonesContainer: {
    marginBottom: SPACING.md,
  },
  milestonesTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: 4,
  },
  milestoneName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  targetDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  targetDateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },

  // News Card
  newsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  newsImage: {
    width: "100%",
    height: 180,
  },
  newsContent: {
    padding: SPACING.lg,
  },
  newsSourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  newsSource: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  newsCategoryBadge: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  newsCategoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  newsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  newsDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  newsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newsTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  newsExternalIcon: {
    opacity: 0.6,
  },

  // News Compact
  newsCardCompact: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  newsImageCompact: {
    width: 100,
    height: 80,
  },
  newsContentCompact: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: "space-between",
  },
  newsSourceCompact: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  newsTitleCompact: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  newsTimeCompact: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },

  // Video Card
  videoCard: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    height: 220,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: SPACING.lg,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: SPACING.sm,
  },
  playIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  videoInfo: {
    gap: SPACING.xs,
  },
  videoInfoSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: "white",
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  videoAuthorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  videoAuthorPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoAuthorName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: "rgba(255,255,255,0.9)",
  },
  videoStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  videoStatText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: "rgba(255,255,255,0.8)",
  },

  // Video Small
  videoCardSmall: {
    width: 140,
    height: 200,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    overflow: "hidden",
  },
  videoThumbnailSmall: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: "white",
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  viewsText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
  },

  // Photo Card
  photoCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 3) / 2,
    height: 180,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: SPACING.sm,
  },
  photographerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  photographerName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: "rgba(255,255,255,0.9)",
  },
  photoTags: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: "row",
    gap: 4,
  },
  photoTag: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoTagText: {
    fontSize: 10,
    color: "white",
  },
});

export default {
  AnnouncementCard,
  DevelopmentPlanCard,
  NewsCard,
  VideoCard,
  PhotoCard,
  FeedItemRenderer,
};
