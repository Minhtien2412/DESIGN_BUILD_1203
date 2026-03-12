/**
 * User Profile View - Zalo-style with Message & Call Actions
 * View another user's profile with messaging and calling options
 * @route /profile/[userId]
 */

import {
    ShopeeProductCard,
    type ShopeeProduct,
} from "@/components/shopping/ShopeeProductCard";
import Avatar from "@/components/ui/avatar";
import { apiFetch } from "@/services/api";
import type { UserProfile } from "@/services/api/users.service";
import { getUserById } from "@/services/api/users.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Linking,
    Platform,
    Image as RNImage,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Zalo-inspired color scheme
const COLORS = {
  primary: "#0068FF",
  primaryDark: "#0052CC",
  primaryLight: "#E8F2FF",
  secondary: "#00B14F",
  danger: "#FF3B30",
  warning: "#FF9500",
  background: "#F5F6F8",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#8E8E93",
  textMuted: "#C7C7CC",
  border: "#E5E5EA",
  online: "#34C759",
  offline: "#8E8E93",
  gradientStart: "#0068FF",
  gradientEnd: "#00C3FF",
};

// Role-based gradient colors for profile header
const ROLE_GRADIENTS: Record<string, [string, string]> = {
  SELLER: ["#F59E0B", "#F97316"],
  CONTRACTOR: ["#0D9488", "#10B981"],
  ARCHITECT: ["#6366F1", "#8B5CF6"],
  DESIGNER: ["#EC4899", "#F472B6"],
  ENGINEER: ["#0D9488", "#2DD4BF"],
  WORKER: ["#10B981", "#34D399"],
  ADMIN: ["#EF4444", "#F87171"],
  CLIENT: ["#0068FF", "#00C3FF"],
};

const getRoleGradient = (role?: string): [string, string] =>
  ROLE_GRADIENTS[role || ""] || [COLORS.gradientStart, COLORS.gradientEnd];

const ROLE_LABELS: Record<string, string> = {
  SELLER: "🏪 Người bán",
  CONTRACTOR: "🏗️ Nhà thầu",
  ARCHITECT: "📐 Kiến trúc sư",
  DESIGNER: "🎨 Thiết kế",
  ENGINEER: "⚙️ Kỹ sư",
  WORKER: "🔨 Thợ thi công",
  ADMIN: "🛡️ Quản trị viên",
  CLIENT: "👤 Khách hàng",
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Seller products state
  const [sellerProducts, setSellerProducts] = useState<ShopeeProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Fetch products from seller
  const fetchSellerProducts = useCallback(async (sellerId: string) => {
    try {
      setProductsLoading(true);
      // Fetch products by seller/user ID
      const response = await apiFetch(
        `/products?sellerId=${sellerId}&limit=10`,
      );
      const data = response?.data || response || [];

      // Convert to ShopeeProduct format
      const products: ShopeeProduct[] = (
        Array.isArray(data) ? data : data.items || []
      ).map((item: any) => ({
        id: String(item.id),
        name: item.name || item.title || "Sản phẩm",
        price: item.price || 0,
        originalPrice: item.originalPrice || item.compareAtPrice,
        image:
          item.image ||
          item.thumbnail ||
          item.images?.[0] ||
          "https://via.placeholder.com/200",
        images: item.images || [item.image],
        rating: item.rating || 4.5,
        soldCount:
          item.soldCount || item.sold || Math.floor(Math.random() * 500) + 50,
        location: item.location || "TP. Hồ Chí Minh",
        isShopeeChoice: item.isShopeeChoice || item.isFeatured || false,
        isFreeShip: item.isFreeShip ?? true,
        discount:
          item.discount ||
          (item.originalPrice && item.price
            ? Math.round((1 - item.price / item.originalPrice) * 100)
            : undefined),
        seller: {
          id: sellerId,
          name: item.seller?.name || item.sellerName || "Người bán",
          avatar: item.seller?.avatar || item.sellerAvatar,
          isOfficial: item.seller?.isOfficial || false,
          rating: item.seller?.rating || 4.5,
        },
      }));

      setSellerProducts(products);
    } catch (err) {
      console.error("[Profile] Error loading seller products:", err);
      // Use mock products if API fails
      setSellerProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    if (userId) {
      fetchSellerProducts(userId);
    }
  }, [userId, fetchSellerProducts]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user from database via API service
      console.log("[Profile] Fetching user from database:", userId);
      const userData = await getUserById(userId || "1");
      setUser(userData);

      // Animate content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      console.error("[Profile] Error loading user:", err);
      setError("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messages/${userId}`);
  };

  const handleVoiceCall = () => {
    // Gọi thoại trực tiếp trong app
    router.push(`/call/${userId}?type=voice`);
  };

  const handleVideoCall = () => {
    // Gọi video trực tiếp trong app
    router.push(`/call/${userId}?type=video`);
  };

  // Tất cả cuộc gọi đều thực hiện trong app
  const handleInAppCall = (callType: "voice" | "video" = "voice") => {
    router.push(`/call/${userId}?type=${callType}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem hồ sơ của ${user?.name} trên app`,
        title: user?.name,
      });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleAddFriend = () => {
    Alert.alert("Kết bạn", `Gửi lời mời kết bạn đến ${user?.name}?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Gửi", style: "default" },
    ]);
  };

  const handleBlock = () => {
    Alert.alert("Chặn người dùng", `Bạn có chắc muốn chặn ${user?.name}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Chặn",
        style: "destructive",
      },
    ]);
  };

  const handleReport = () => {
    Alert.alert("Báo cáo", "Chọn lý do báo cáo", [
      { text: "Spam", onPress: () => {} },
      { text: "Nội dung không phù hợp", onPress: () => {} },
      { text: "Giả mạo", onPress: () => {} },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return "Vừa truy cập";
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 5) return "Vừa truy cập";
    if (diffMins < 60) return `Truy cập ${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Truy cập ${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.danger}
          />
          <Text style={styles.errorText}>
            {error || "Không tìm thấy người dùng"}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchUserProfile}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={getRoleGradient(user.role)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Navigation Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.navActions}>
              <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => {
                  Alert.alert("Tùy chọn", "", [
                    {
                      text: "Chặn người này",
                      onPress: handleBlock,
                      style: "destructive",
                    },
                    { text: "Báo cáo", onPress: handleReport },
                    { text: "Hủy", style: "cancel" },
                  ]);
                }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Header */}
          <Animated.View
            style={[
              styles.profileHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Avatar
                avatar={user.avatar}
                userId={String(user.id)}
                name={user.name}
                pixelSize={100}
              />
              {/* Online Status Indicator */}
              <View
                style={[
                  styles.onlineIndicator,
                  {
                    backgroundColor: user.online
                      ? COLORS.online
                      : COLORS.offline,
                  },
                ]}
              />
              {/* Verified Badge */}
              {user.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
              )}
            </View>

            {/* Name & Status */}
            <Text style={styles.userName}>{user.name}</Text>
            {/* Role badge */}
            {user.role && (
              <View style={styles.roleBadgeRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {ROLE_LABELS[user.role] || user.role}
                  </Text>
                </View>
              </View>
            )}
            <Text style={styles.userStatus}>
              {user.online ? "Đang hoạt động" : formatLastSeen(user.lastSeen)}
            </Text>

            {/* Quick Stats */}
            {(user as any).stats?.mutualFriends !== undefined &&
              (user as any).stats.mutualFriends > 0 && (
                <View style={styles.mutualFriendsRow}>
                  <Ionicons name="people" size={14} color={COLORS.white} />
                  <Text style={styles.mutualFriendsText}>
                    {(user as any).stats?.mutualFriends} bạn chung
                  </Text>
                </View>
              )}
          </Animated.View>
        </LinearGradient>

        {/* Action Buttons - Like Zalo */}
        <View style={styles.actionContainer}>
          <View style={styles.actionRow}>
            {/* Message Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: COLORS.primary },
                ]}
              >
                <Ionicons name="chatbubble" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Nhắn tin</Text>
            </TouchableOpacity>

            {/* Voice Call Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVoiceCall}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: COLORS.secondary },
                ]}
              >
                <Ionicons name="call" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Gọi thoại</Text>
            </TouchableOpacity>

            {/* Video Call Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVideoCall}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#666666" },
                ]}
              >
                <Ionicons name="videocam" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Gọi video</Text>
            </TouchableOpacity>

            {/* Gọi nhanh - in-app call */}
            {user.phone && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleInAppCall("voice")}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.actionIconWrapper,
                    { backgroundColor: COLORS.warning },
                  ]}
                >
                  <Ionicons name="call" size={24} color={COLORS.white} />
                </View>
                <Text style={styles.actionLabel}>Gọi nhanh</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Friend / Message Row */}
          {!(user as any).isFriend && (
            <TouchableOpacity
              style={styles.addFriendBtn}
              onPress={handleAddFriend}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={20} color={COLORS.white} />
              <Text style={styles.addFriendText}>Kết bạn</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          {/* Role & Company */}
          {(user.role || user.company) && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Công việc</Text>
                  <Text style={styles.infoValue}>
                    {user.role}
                    {user.company ? ` tại ${user.company}` : ""}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Bio */}
          {user.bio && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Giới thiệu</Text>
                  <Text style={styles.infoValue}>{user.bio}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Phone - In-app call */}
          {user.phone && (
            <View style={styles.infoCard}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleInAppCall("voice")}
              >
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={[styles.infoValue, styles.linkText]}>
                    {user.phone}
                  </Text>
                </View>
                <View style={styles.callBtnRow}>
                  <TouchableOpacity
                    style={styles.miniCallBtn}
                    onPress={() => handleInAppCall("voice")}
                  >
                    <Ionicons name="call" size={18} color={COLORS.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.miniCallBtn}
                    onPress={() => handleInAppCall("video")}
                  >
                    <Ionicons
                      name="videocam"
                      size={18}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Email */}
          {user.email && (
            <View style={styles.infoCard}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => Linking.openURL(`mailto:${user.email}`)}
              >
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={[styles.infoValue, styles.linkText]}>
                    {user.email}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Website */}
          {(user as any).website && (
            <View style={styles.infoCard}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => Linking.openURL((user as any).website)}
              >
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <Text style={[styles.infoValue, styles.linkText]}>
                    {(user as any).website}
                  </Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Address / Location */}
          {user.address && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>{user.address}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Join Date */}
          {user.createdAt && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày tham gia</Text>
                  <Text style={styles.infoValue}>
                    {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Response Rate & Time — Shopee seller style */}
        {(user.role === "SELLER" ||
          user.role === "CONTRACTOR" ||
          user.role === "ARCHITECT" ||
          user.role === "DESIGNER") && (
          <View style={styles.responseSection}>
            <View style={styles.responseCard}>
              <View style={styles.responseItem}>
                <View
                  style={[
                    styles.responseIconWrap,
                    { backgroundColor: "#E8F5E9" },
                  ]}
                >
                  <Ionicons name="chatbubbles" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.responseValue}>98%</Text>
                <Text style={styles.responseLabel}>Tỉ lệ phản hồi</Text>
              </View>
              <View style={styles.responseDivider} />
              <View style={styles.responseItem}>
                <View
                  style={[
                    styles.responseIconWrap,
                    { backgroundColor: "#FFF3E0" },
                  ]}
                >
                  <Ionicons name="time" size={20} color="#FF9800" />
                </View>
                <Text style={styles.responseValue}>~15 phút</Text>
                <Text style={styles.responseLabel}>Thời gian phản hồi</Text>
              </View>
              <View style={styles.responseDivider} />
              <View style={styles.responseItem}>
                <View
                  style={[
                    styles.responseIconWrap,
                    { backgroundColor: "#E8EAF6" },
                  ]}
                >
                  <Ionicons name="shield-checkmark" size={20} color="#3F51B5" />
                </View>
                <Text style={styles.responseValue}>
                  {user.yearsExperience || 0}+
                </Text>
                <Text style={styles.responseLabel}>Năm kinh nghiệm</Text>
              </View>
            </View>
          </View>
        )}

        {/* Skills & Certifications */}
        {((user as any).skills?.length > 0 ||
          (user as any).certifications?.length > 0) && (
          <View style={styles.infoSection}>
            {(user as any).skills?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Kỹ năng chuyên môn</Text>
                <View style={styles.skillsWrap}>
                  {(user as any).skills.map((skill: string, idx: number) => (
                    <View key={idx} style={styles.skillChip}>
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color={COLORS.secondary}
                      />
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            {(user as any).certifications?.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                  Chứng chỉ
                </Text>
                <View style={styles.skillsWrap}>
                  {(user as any).certifications.map(
                    (cert: string, idx: number) => (
                      <View
                        key={idx}
                        style={[
                          styles.skillChip,
                          { backgroundColor: "#FEF3C7" },
                        ]}
                      >
                        <Ionicons name="ribbon" size={12} color="#F59E0B" />
                        <Text style={[styles.skillText, { color: "#92400E" }]}>
                          {cert}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* Stats Section - For Construction App & Sellers */}
        {((user as any).projects ||
          user.rating ||
          (user as any).followersCount ||
          sellerProducts.length > 0) && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Thống kê</Text>
            <View style={styles.statsRow}>
              {sellerProducts.length > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{sellerProducts.length}+</Text>
                  <Text style={styles.statLabel}>Sản phẩm</Text>
                </View>
              )}
              {(user as any).followersCount !== undefined && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {(user as any).followersCount}
                  </Text>
                  <Text style={styles.statLabel}>Người theo dõi</Text>
                </View>
              )}
              {(user as any).projects && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{(user as any).projects}</Text>
                  <Text style={styles.statLabel}>Dự án</Text>
                </View>
              )}
              {user.rating && (
                <View style={styles.statItem}>
                  <View style={styles.ratingRow}>
                    <Text style={styles.statValue}>{user.rating}</Text>
                    <Ionicons name="star" size={18} color={COLORS.warning} />
                  </View>
                  <Text style={styles.statLabel}>Đánh giá</Text>
                </View>
              )}
              {(user as any).reviewCount !== undefined &&
                (user as any).reviewCount > 0 && (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {(user as any).reviewCount}
                    </Text>
                    <Text style={styles.statLabel}>Đánh giá</Text>
                  </View>
                )}
            </View>
          </View>
        )}

        {/* Seller Products Section - Shopee Style */}
        {sellerProducts.length > 0 && (
          <View style={styles.productsSection}>
            <View style={styles.productsSectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm của người bán</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/shopping/products-catalog?sellerId=${userId}`)
                }
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>Xem tất cả</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {productsLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ paddingVertical: 20 }}
              />
            ) : (
              <FlatList
                horizontal
                data={sellerProducts}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsScrollContent}
                renderItem={({ item }) => (
                  <View style={styles.productCardWrapper}>
                    <ShopeeProductCard
                      product={item}
                      onPress={() =>
                        router.push(`/shopping/product/${item.id}`)
                      }
                      variant="compact"
                    />
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Show loading indicator for products */}
        {productsLoading && sellerProducts.length === 0 && (
          <View style={styles.productsLoadingSection}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.productsLoadingText}>Đang tải sản phẩm...</Text>
          </View>
        )}

        {/* Media Gallery — shared photos & videos (Zalo-style) */}
        <View style={styles.mediaGallerySection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionTitle}>Ảnh & Video</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaScrollContent}
          >
            {/* Sample gallery images based on role */}
            {[
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=300&q=80",
              "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=300&q=80",
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=300&q=80",
              "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&h=300&q=80",
              "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=300&q=80",
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&q=80",
            ].map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.galleryItem}
                activeOpacity={0.8}
              >
                <RNImage source={{ uri }} style={styles.galleryImage} />
                {idx === 5 && (
                  <View style={styles.galleryOverlay}>
                    <Text style={styles.galleryOverlayText}>+12</Text>
                  </View>
                )}
                {idx === 1 && (
                  <View style={styles.galleryVideoIcon}>
                    <Ionicons name="play-circle" size={24} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews Section — Shopee style */}
        {user.reviewCount && user.reviewCount > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.productsSectionHeader}>
              <Text style={styles.sectionTitle}>
                Đánh giá ({user.reviewCount})
              </Text>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Rating Summary */}
            <View style={styles.ratingSummaryCard}>
              <View style={styles.ratingSummaryLeft}>
                <Text style={styles.ratingBig}>
                  {user.rating?.toFixed(1) || "5.0"}
                </Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= Math.floor(user.rating || 5)
                          ? "star"
                          : star - 0.5 <= (user.rating || 5)
                            ? "star-half"
                            : "star-outline"
                      }
                      size={16}
                      color={COLORS.warning}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCountText}>
                  {user.reviewCount} đánh giá
                </Text>
              </View>
              <View style={styles.ratingSummaryRight}>
                {[5, 4, 3, 2, 1].map((star) => {
                  // Mock distribution weighted toward the rating
                  const pct =
                    star === Math.round(user.rating || 5)
                      ? 65
                      : star === Math.round(user.rating || 5) - 1
                        ? 20
                        : star === Math.round(user.rating || 5) + 1
                          ? 10
                          : 3;
                  return (
                    <View key={star} style={styles.ratingBarRow}>
                      <Text style={styles.ratingBarLabel}>{star}</Text>
                      <Ionicons name="star" size={10} color={COLORS.warning} />
                      <View style={styles.ratingBarBg}>
                        <View
                          style={[
                            styles.ratingBarFill,
                            {
                              width: `${pct}%`,
                              backgroundColor:
                                star >= 4
                                  ? COLORS.secondary
                                  : star >= 3
                                    ? COLORS.warning
                                    : COLORS.danger,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Sample Reviews */}
            {[
              {
                name: "Nguyễn Văn Minh",
                avatar: "NM",
                rating: 5,
                time: "2 tuần trước",
                text: "Rất chuyên nghiệp và tận tâm. Sản phẩm/dịch vụ chất lượng cao, giao hàng đúng hẹn.",
              },
              {
                name: "Trần Thị Lan",
                avatar: "TL",
                rating: 5,
                time: "1 tháng trước",
                text: "Tư vấn nhiệt tình, giá cả hợp lý. Sẽ tiếp tục hợp tác.",
              },
              {
                name: "Lê Hoàng Nam",
                avatar: "LN",
                rating: 4,
                time: "2 tháng trước",
                text: "Chất lượng tốt, đóng gói cẩn thận. Giao hơi chậm 1 ngày.",
              },
            ].map((review, idx) => (
              <View key={idx} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{review.avatar}</Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <View style={styles.reviewMeta}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= review.rating ? "star" : "star-outline"}
                            size={12}
                            color={COLORS.warning}
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewTime}>{review.time}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Activity Section — Zalo-style recent activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {[
            {
              icon: "camera" as const,
              color: "#8B5CF6",
              text: "Đã đăng 3 ảnh mới",
              time: "Hôm nay",
            },
            {
              icon: "chatbubbles" as const,
              color: COLORS.primary,
              text: "Đã phản hồi 12 tin nhắn",
              time: "Hôm qua",
            },
            {
              icon: "star" as const,
              color: COLORS.warning,
              text: "Nhận được 2 đánh giá 5 sao",
              time: "3 ngày trước",
            },
            {
              icon: "construct" as const,
              color: "#0D9488",
              text: "Cập nhật tiến độ dự án",
              time: "1 tuần trước",
            },
          ].map((activity, idx) => (
            <View key={idx} style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${activity.color}15` },
                ]}
              >
                <Ionicons
                  name={activity.icon}
                  size={18}
                  color={activity.color}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Message Button */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={handleMessage}
        activeOpacity={0.9}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // Header Gradient
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 30,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  navBtn: {
    padding: 8,
  },
  navActions: {
    flexDirection: "row",
    gap: 4,
  },
  // Profile Header
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
  },
  mutualFriendsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  mutualFriendsText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  // Action Buttons
  actionContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  addFriendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  addFriendText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // Info Section
  infoSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
  },
  // Call buttons in info row
  callBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  // Stats Section
  statsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  // Products Section - Shopee Style
  productsSection: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
  },
  productsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  productsScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  productCardWrapper: {
    width: (width - 48) / 2.5,
    marginHorizontal: 4,
  },
  productsLoadingSection: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    paddingVertical: 24,
    alignItems: "center",
  },
  productsLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Floating Button
  floatingBtn: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Role badge
  roleBadgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 2,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  // Skills & certifications
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },
  // Response Rate Section — Shopee style
  responseSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  responseCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  responseItem: {
    flex: 1,
    alignItems: "center",
  },
  responseIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  responseValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  responseLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  responseDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
  // Media Gallery Section
  mediaGallerySection: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
  },
  mediaScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  galleryItem: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryOverlayText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },
  galleryVideoIcon: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 2,
  },
  // Reviews Section
  reviewsSection: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
  },
  ratingSummaryCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 12,
  },
  ratingSummaryLeft: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    minWidth: 90,
  },
  ratingBig: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 40,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  reviewCountText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ratingSummaryRight: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
    gap: 4,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 12,
    textAlign: "center",
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  // Review Items
  reviewItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reviewAvatarText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  // Activity Section
  activitySection: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
