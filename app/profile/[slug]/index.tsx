/**
 * Public Profile Page - Role-based Theme
 * Dynamic profile view at /profile/[slug]
 * Displays user info, ratings, points based on role theme
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    CreditScoreIndicator,
    PointsBalanceCard,
    PointsConversionModal,
} from "@/components/ui/PointsWallet";
import {
    RatingItem,
    RatingSummaryCard,
    StarRatingDisplay,
} from "@/components/ui/StarRating";
import { useProfile } from "@/context/ProfileContext";
import type {
    AvailabilityStatus,
    RoleTheme,
    UserProfileFull,
} from "@/types/profile";

const { width } = Dimensions.get("window");
const COVER_HEIGHT = 180;

// ============================================================================
// Availability Badge
// ============================================================================

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  message?: string;
}

function AvailabilityBadge({ status, message }: AvailabilityBadgeProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "available":
        return {
          label: "Sẵn sàng",
          color: "#4CAF50",
          icon: "checkmark-circle",
        };
      case "busy":
        return { label: "Đang bận", color: "#FF9800", icon: "time" };
      case "away":
        return { label: "Vắng mặt", color: "#9E9E9E", icon: "moon" };
      case "offline":
        return { label: "Ngoại tuyến", color: "#757575", icon: "ellipse" };
      default:
        return { label: "Không rõ", color: "#757575", icon: "help-circle" };
    }
  };

  const info = getStatusInfo();

  return (
    <View
      style={[styles.availabilityBadge, { backgroundColor: `${info.color}15` }]}
    >
      <View style={[styles.statusDot, { backgroundColor: info.color }]} />
      <Text style={[styles.availabilityText, { color: info.color }]}>
        {info.label}
      </Text>
    </View>
  );
}

// ============================================================================
// Profile Header
// ============================================================================

interface ProfileHeaderProps {
  profile: UserProfileFull;
  theme: RoleTheme;
  onEditCover?: () => void;
  onEditAvatar?: () => void;
  isOwnProfile?: boolean;
}

function ProfileHeader({
  profile,
  theme,
  onEditCover,
  onEditAvatar,
  isOwnProfile,
}: ProfileHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {profile.coverImage ? (
          <Image
            source={{ uri: profile.coverImage }}
            style={styles.coverImage}
          />
        ) : (
          <LinearGradient
            colors={theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverGradient}
          />
        )}

        {isOwnProfile && (
          <TouchableOpacity style={styles.editCoverBtn} onPress={onEditCover}>
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar & Basic Info */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarBorder, { borderColor: theme.primary }]}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>
                  {profile.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
          </View>

          {/* Online indicator */}
          {profile.availability.status === "available" && (
            <View style={styles.onlineIndicator} />
          )}

          {isOwnProfile && (
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={onEditAvatar}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Name & Title */}
        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            {profile.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.primary}
              />
            )}
          </View>

          <Text style={[styles.title, { color: theme.primary }]}>
            {profile.title}
          </Text>

          {profile.yearsExperience && (
            <Text style={styles.experience}>
              • {profile.yearsExperience} năm KN
            </Text>
          )}
        </View>

        {/* Rating & Stats Row */}
        <View style={styles.statsRow}>
          <StarRatingDisplay
            score={profile.stats.rating.averageScore}
            showCount
            count={profile.stats.rating.totalReviews}
            color="#FFB800"
          />
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>
            {profile.stats.completedJobs} việc
          </Text>
        </View>

        {/* Badges */}
        <View style={styles.badgesRow}>
          {profile.stats.badges.slice(0, 3).map((badge) => (
            <View
              key={badge.id}
              style={[styles.badge, { backgroundColor: `${badge.color}20` }]}
            >
              <Ionicons
                name={badge.icon as any}
                size={12}
                color={badge.color}
              />
              <Text style={[styles.badgeText, { color: badge.color }]}>
                {badge.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Availability */}
        <AvailabilityBadge
          status={profile.availability.status}
          message={profile.availability.message}
        />
      </View>
    </View>
  );
}

// ============================================================================
// Quick Actions
// ============================================================================

interface QuickActionsProps {
  profile: UserProfileFull;
  theme: RoleTheme;
  isOwnProfile: boolean;
  onMessage: () => void;
  onCall: () => void;
  onShare: () => void;
  onEdit: () => void;
}

function QuickActions({
  profile,
  theme,
  isOwnProfile,
  onMessage,
  onCall,
  onShare,
  onEdit,
}: QuickActionsProps) {
  if (isOwnProfile) {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={onEdit}
        >
          <Ionicons name="create" size={20} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtnOutline} onPress={onShare}>
          <Ionicons name="share-social" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.primary }]}
        onPress={onMessage}
      >
        <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
        <Text style={styles.actionBtnText}>Nhắn tin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtnOutline, { borderColor: theme.primary }]}
        onPress={onCall}
      >
        <Ionicons name="call" size={20} color={theme.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtnOutline} onPress={onShare}>
        <Ionicons name="share-social" size={20} color="#757575" />
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// Profile Info Section
// ============================================================================

interface ProfileInfoSectionProps {
  profile: UserProfileFull;
  theme: RoleTheme;
}

function ProfileInfoSection({ profile, theme }: ProfileInfoSectionProps) {
  const formatCurrency = (num: number) => `${num.toLocaleString("vi-VN")}đ`;

  return (
    <View style={styles.sectionCard}>
      {/* Bio */}
      {profile.bio && (
        <View style={styles.infoRow}>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      {/* Location */}
      {profile.availability.location && (
        <View style={styles.infoRow}>
          <Ionicons name="location" size={18} color="#757575" />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              {profile.availability.location.address}
            </Text>
            {profile.availability.location.distance && (
              <Text style={styles.infoSubtext}>
                {profile.availability.location.distance.toFixed(1)} km từ bạn
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Response Time */}
      <View style={styles.infoRow}>
        <Ionicons name="flash" size={18} color="#4CAF50" />
        <Text style={styles.infoText}>
          Phản hồi trong{" "}
          <Text style={{ color: "#4CAF50", fontWeight: "600" }}>
            {"< "}
            {profile.stats.responseTime} phút
          </Text>
        </Text>
      </View>

      {/* Pricing */}
      {profile.pricing && (
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Giá từ</Text>
          <Text style={[styles.pricingValue, { color: theme.primary }]}>
            {formatCurrency(profile.pricing.hourlyRate || 0)}
            <Text style={styles.pricingUnit}>/giờ</Text>
          </Text>
        </View>
      )}

      {/* Working Hours */}
      {profile.availability.workingHours && (
        <View style={styles.infoRow}>
          <Ionicons name="time" size={18} color="#757575" />
          <Text style={styles.infoText}>
            {profile.availability.workingHours.start} -{" "}
            {profile.availability.workingHours.end}
          </Text>
        </View>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <View style={styles.certificationsContainer}>
          <Text style={styles.subSectionTitle}>Chứng chỉ</Text>
          <View style={styles.certificationsList}>
            {profile.certifications.map((cert, idx) => (
              <View key={idx} style={styles.certBadge}>
                <Ionicons name="ribbon" size={12} color={theme.primary} />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Portfolio Section
// ============================================================================

interface PortfolioSectionProps {
  images: string[];
  theme: RoleTheme;
  onViewAll?: () => void;
}

function PortfolioSection({ images, theme, onViewAll }: PortfolioSectionProps) {
  if (!images || images.length === 0) return null;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hình ảnh công việc</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              Xem tất cả
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.portfolioScroll}
      >
        {images.map((img, idx) => (
          <TouchableOpacity key={idx} style={styles.portfolioItem}>
            <Image source={{ uri: img }} style={styles.portfolioImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Main Profile Page
// ============================================================================

export default function PublicProfilePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    profile,
    loading,
    error,
    theme,
    ratings,
    ratingSummary,
    points,
    loadProfileBySlug,
    loadRatings,
    loadPoints,
    convertPointsToWallet,
    refreshProfile,
  } = useProfile();

  const [refreshing, setRefreshing] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // TODO: Get from auth context
  const isOwnProfile = false;

  useEffect(() => {
    if (slug) {
      loadProfileBySlug(slug);
    }
  }, [slug, loadProfileBySlug]);

  useEffect(() => {
    if (profile?.id) {
      loadRatings();
      loadPoints();
    }
  }, [profile?.id, loadRatings, loadPoints]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }, [refreshProfile]);

  const handleMessage = () => {
    if (profile) {
      router.push(`/messages/${profile.id}`);
    }
  };

  const handleCall = () => {
    if (profile) {
      router.push(`/call/${profile.id}?type=voice`);
    }
  };

  const handleShare = async () => {
    if (profile) {
      try {
        await Share.share({
          message: `Xem hồ sơ của ${profile.name} trên APP Design Build`,
          title: profile.name,
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    }
  };

  const handleEdit = () => {
    router.push("/profile/edit");
  };

  const handleBookNow = () => {
    if (profile) {
      router.push(`/booking/create?workerId=${profile.id}` as any);
    }
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error || "Không tìm thấy hồ sơ"}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => slug && loadProfileBySlug(slug)}
        >
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: profile.name,
          headerTransparent: true,
          headerTintColor: "#FFFFFF",
          headerStyle: { backgroundColor: "transparent" },
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: "#F5F5F5" }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Cover & Avatar */}
        <ProfileHeader
          profile={profile}
          theme={theme}
          isOwnProfile={isOwnProfile}
        />

        {/* Quick Actions */}
        <QuickActions
          profile={profile}
          theme={theme}
          isOwnProfile={isOwnProfile}
          onMessage={handleMessage}
          onCall={handleCall}
          onShare={handleShare}
          onEdit={handleEdit}
        />

        {/* Profile Info */}
        <ProfileInfoSection profile={profile} theme={theme} />

        {/* Portfolio Images */}
        <PortfolioSection
          images={profile.portfolioImages || []}
          theme={theme}
        />

        {/* Points & Wallet (Own Profile Only) */}
        {isOwnProfile && points && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleOutside}>Điểm & Ví</Text>
            <PointsBalanceCard
              balance={points}
              primaryColor={theme.primary}
              onConvert={() => setShowConvertModal(true)}
              onHistory={() => router.push("/profile/payment-history")}
            />

            <View style={{ height: 12 }} />

            <CreditScoreIndicator
              score={points.creditPoints}
              primaryColor={theme.primary}
            />
          </View>
        )}

        {/* Ratings Summary */}
        {ratingSummary && (
          <View style={styles.section}>
            <RatingSummaryCard
              summary={ratingSummary}
              primaryColor={theme.primary}
              onSeeAll={() => router.push(`/profile/${slug}/reviews`)}
            />
          </View>
        )}

        {/* Recent Reviews */}
        {ratings.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Đánh giá gần đây</Text>
            {ratings.slice(0, 3).map((rating) => (
              <RatingItem
                key={rating.id}
                rating={rating}
                primaryColor={theme.primary}
              />
            ))}
          </View>
        )}

        {/* Book Now Button (For Workers/Contractors) */}
        {!isOwnProfile && ["worker", "contractor"].includes(profile.role) && (
          <View style={styles.bookNowContainer}>
            <TouchableOpacity
              style={[styles.bookNowBtn, { backgroundColor: theme.primary }]}
              onPress={handleBookNow}
            >
              <Text style={styles.bookNowText}>Đặt ngay</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Points Conversion Modal */}
      {points && (
        <PointsConversionModal
          visible={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          onConvert={convertPointsToWallet}
          availablePoints={points.rewardPoints}
          primaryColor={theme.primary}
        />
      )}
    </>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#757575",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Header
  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  coverContainer: {
    height: COVER_HEIGHT,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    width: "100%",
    height: "100%",
  },
  editCoverBtn: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginTop: -50,
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarBorder: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    padding: 2,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  onlineIndicator: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  editAvatarBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#757575",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  experience: {
    fontSize: 13,
    color: "#757575",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statDivider: {
    color: "#D1D1D6",
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 13,
    color: "#757575",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Actions
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 24,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionBtnOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitleOutside: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 8,
  },

  // Info Rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  infoSubtext: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 20,
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 4,
  },
  pricingLabel: {
    fontSize: 13,
    color: "#757575",
  },
  pricingValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  pricingUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: "#757575",
  },

  // Certifications
  certificationsContainer: {
    marginTop: 4,
  },
  certificationsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  certBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  certText: {
    fontSize: 12,
    color: "#1A1A1A",
  },

  // Portfolio
  portfolioScroll: {
    paddingRight: 16,
  },
  portfolioItem: {
    marginRight: 12,
  },
  portfolioImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },

  // Book Now
  bookNowContainer: {
    padding: 16,
  },
  bookNowBtn: {
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  bookNowText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
