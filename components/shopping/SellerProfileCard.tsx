/**
 * SellerProfileCard - Shopee-style Seller Profile Component
 * Giao diện hồ sơ người bán theo chuẩn Shopee
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";

// ===================== TYPES =====================
export interface Seller {
  id: string | number;
  name: string;
  avatar?: string;
  coverImage?: string;
  isOfficial?: boolean; // Badge "Mall"
  isVerified?: boolean;
  rating: number;
  responseRate: number; // Tỉ lệ phản hồi %
  responseTime?: string; // Thời gian phản hồi
  productCount: number;
  followerCount: number;
  joinDate?: string;
  location?: string;
  description?: string;
}

interface SellerProfileCardProps {
  seller: Seller;
  variant?: "full" | "compact" | "mini";
  showStats?: boolean;
  showActions?: boolean;
  onChat?: () => void;
  onViewShop?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
  style?: ViewStyle;
}

// ===================== HELPERS =====================
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "k";
  }
  return num.toString();
}

// ===================== COMPONENT =====================
export function SellerProfileCard({
  seller,
  variant = "full",
  showStats = true,
  showActions = true,
  onChat,
  onViewShop,
  onFollow,
  isFollowing = false,
  style,
}: SellerProfileCardProps) {
  const router = useRouter();

  const handleChat = () => {
    if (onChat) {
      onChat();
    } else {
      router.push(`/chat/${seller.id}` as Href);
    }
  };

  const handleViewShop = () => {
    if (onViewShop) {
      onViewShop();
    } else {
      router.push(`/profile/${seller.id}` as Href);
    }
  };

  // Mini variant - just avatar and name
  if (variant === "mini") {
    return (
      <Pressable style={[styles.miniContainer, style]} onPress={handleViewShop}>
        <Image
          source={{
            uri:
              seller.avatar ||
              "https://ui-avatars.com/api/?name=Shop&size=40&background=FF6B35&color=fff",
          }}
          style={styles.miniAvatar}
          contentFit="cover"
        />
        <View style={styles.miniInfo}>
          <View style={styles.miniNameRow}>
            {seller.isOfficial && (
              <View style={styles.mallBadgeMini}>
                <ThemedText style={styles.mallBadgeTextMini}>Mall</ThemedText>
              </View>
            )}
            <ThemedText style={styles.miniName} numberOfLines={1}>
              {seller.name}
            </ThemedText>
          </View>
          <ThemedText style={styles.miniRating}>
            ★ {seller.rating.toFixed(1)}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </Pressable>
    );
  }

  // Compact variant - header only without stats
  if (variant === "compact") {
    return (
      <View style={[styles.compactContainer, style]}>
        {/* Avatar & Info */}
        <View style={styles.compactHeader}>
          <Pressable onPress={handleViewShop}>
            <Image
              source={{
                uri:
                  seller.avatar ||
                  "https://ui-avatars.com/api/?name=Shop&size=48&background=FF6B35&color=fff",
              }}
              style={styles.compactAvatar}
              contentFit="cover"
            />
          </Pressable>

          <View style={styles.compactInfo}>
            <View style={styles.nameRow}>
              {seller.isOfficial && (
                <View style={styles.mallBadge}>
                  <ThemedText style={styles.mallBadgeText}>Mall</ThemedText>
                </View>
              )}
              <ThemedText style={styles.compactName} numberOfLines={1}>
                {seller.name}
              </ThemedText>
              {seller.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
              )}
            </View>
            <ThemedText style={styles.compactSubtitle}>
              {seller.rating.toFixed(1)} Đánh giá | {seller.responseRate}% Phản
              hồi
            </ThemedText>
          </View>
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.compactActions}>
            <Pressable style={styles.chatButtonCompact} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={16} color="#EE4D2D" />
              <ThemedText style={styles.chatButtonTextCompact}>Chat</ThemedText>
            </Pressable>
            <Pressable
              style={styles.viewShopButtonCompact}
              onPress={handleViewShop}
            >
              <Ionicons name="storefront-outline" size={16} color="#FFFFFF" />
              <ThemedText style={styles.viewShopButtonTextCompact}>
                Xem Shop
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // Full variant - Complete Shopee-style profile card
  return (
    <View style={[styles.container, style]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Avatar */}
        <Pressable onPress={handleViewShop}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  seller.avatar ||
                  "https://ui-avatars.com/api/?name=Shop&size=64&background=FF6B35&color=fff",
              }}
              style={styles.avatar}
              contentFit="cover"
            />
            {seller.isOfficial && (
              <View style={styles.avatarBadge}>
                <ThemedText style={styles.avatarBadgeText}>✓</ThemedText>
              </View>
            )}
          </View>
        </Pressable>

        {/* Info */}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            {seller.isOfficial && (
              <View style={styles.mallBadge}>
                <ThemedText style={styles.mallBadgeText}>Mall</ThemedText>
              </View>
            )}
            <ThemedText style={styles.sellerName} numberOfLines={1}>
              {seller.name}
            </ThemedText>
          </View>

          <ThemedText style={styles.ratingText}>
            <ThemedText style={styles.ratingValue}>
              {seller.rating.toFixed(1)}
            </ThemedText>{" "}
            Đánh giá{" | "}
            <ThemedText style={styles.responseRate}>
              {seller.responseRate}%
            </ThemedText>{" "}
            Phản hồi Chat
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.chatButton}
            onPress={handleChat}
            android_ripple={{ color: "#EE4D2D20" }}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#EE4D2D" />
            <ThemedText style={styles.chatButtonText}>Chat Ngay</ThemedText>
          </Pressable>

          <Pressable
            style={styles.viewShopButton}
            onPress={handleViewShop}
            android_ripple={{ color: "#FFFFFF30" }}
          >
            <Ionicons name="storefront-outline" size={18} color="#FFFFFF" />
            <ThemedText style={styles.viewShopButtonText}>Xem Shop</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Stats Grid */}
      {showStats && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {formatNumber(seller.productCount)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Sản phẩm</ThemedText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {formatNumber(seller.followerCount)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Người theo dõi</ThemedText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {seller.rating.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Đánh giá</ThemedText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {seller.responseRate}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Tỉ lệ phản hồi</ThemedText>
          </View>
        </View>
      )}

      {/* Follow Button (Optional) */}
      {onFollow && (
        <Pressable
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={onFollow}
        >
          <Ionicons
            name={isFollowing ? "checkmark" : "add"}
            size={18}
            color={isFollowing ? "#EE4D2D" : "#FFFFFF"}
          />
          <ThemedText
            style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText,
            ]}
          >
            {isFollowing ? "Đang theo dõi" : "Theo dõi"}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  // Full variant
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#EE4D2D",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#EE4D2D",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  mallBadge: {
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  mallBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    flex: 1,
  },
  ratingText: {
    fontSize: 13,
    color: "#666666",
  },
  ratingValue: {
    color: "#EE4D2D",
    fontWeight: "600",
  },
  responseRate: {
    color: "#EE4D2D",
    fontWeight: "600",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EE4D2D",
    backgroundColor: "#FFFFFF",
  },
  chatButtonText: {
    color: "#EE4D2D",
    fontSize: 14,
    fontWeight: "600",
  },
  viewShopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: "#EE4D2D",
  },
  viewShopButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EE4D2D",
  },
  statLabel: {
    fontSize: 11,
    color: "#888888",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#F0F0F0",
  },

  // Follow Button
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: "#EE4D2D",
  },
  followButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  followingButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EE4D2D",
  },
  followingButtonText: {
    color: "#EE4D2D",
  },

  // Compact variant
  compactContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EE4D2D",
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    flex: 1,
  },
  compactSubtitle: {
    fontSize: 12,
    color: "#888888",
  },
  compactActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  chatButtonCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EE4D2D",
  },
  chatButtonTextCompact: {
    color: "#EE4D2D",
    fontSize: 13,
    fontWeight: "500",
  },
  viewShopButtonCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: "#EE4D2D",
  },
  viewShopButtonTextCompact: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },

  // Mini variant
  miniContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    gap: 8,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  miniInfo: {
    flex: 1,
    gap: 2,
  },
  miniNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mallBadgeMini: {
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  mallBadgeTextMini: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },
  miniName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#222222",
    flex: 1,
  },
  miniRating: {
    fontSize: 11,
    color: "#EE4D2D",
  },
});

export default SellerProfileCard;
