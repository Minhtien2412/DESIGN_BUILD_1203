/**
 * SellerProductSection - Shopee-style Seller Section for Product Detail
 * Hiển thị thông tin seller trong trang chi tiết sản phẩm
 *
 * Tương tự layout Shopee với:
 * - Avatar + Badge Mall
 * - Tên shop, rating, response rate
 * - Số sản phẩm, số người theo dõi
 * - Nút Chat, Xem Shop
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

// ===================== TYPES =====================
export interface SellerInfo {
  id: string;
  name: string;
  avatar?: string;
  isOfficial?: boolean;
  isVerified?: boolean;
  rating?: number;
  responseRate?: number;
  responseTime?: string;
  productCount?: number;
  followerCount?: number;
  location?: string;
  joinDate?: string;
}

interface SellerProductSectionProps {
  seller: SellerInfo;
  onChatPress?: () => void;
  onViewShopPress?: () => void;
}

// ===================== HELPERS =====================
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "k";
  return num.toString();
}

// ===================== COMPONENT =====================
export function SellerProductSection({
  seller,
  onChatPress,
  onViewShopPress,
}: SellerProductSectionProps) {
  const handleChat = () => {
    if (onChatPress) {
      onChatPress();
    } else {
      router.push(`/chat/${seller.id}` as Href);
    }
  };

  const handleViewShop = () => {
    if (onViewShopPress) {
      onViewShopPress();
    } else {
      router.push(`/profile/${seller.id}/shop` as Href);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        {/* Avatar */}
        <Pressable style={styles.avatarWrapper} onPress={handleViewShop}>
          {seller.avatar ? (
            <Image
              source={{ uri: seller.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="storefront" size={24} color="#888888" />
            </View>
          )}
          {seller.isOfficial && (
            <View style={styles.officialBadge}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          )}
        </Pressable>

        {/* Info */}
        <View style={styles.sellerInfo}>
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

          <View style={styles.metaRow}>
            {seller.rating !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="star" size={12} color="#FFAA00" />
                <ThemedText style={styles.metaValue}>
                  {seller.rating.toFixed(1)}
                </ThemedText>
                <ThemedText style={styles.metaLabel}>Đánh giá</ThemedText>
              </View>
            )}
            {seller.responseRate !== undefined && (
              <View style={styles.metaItem}>
                <ThemedText style={styles.metaValue}>
                  {seller.responseRate}%
                </ThemedText>
                <ThemedText style={styles.metaLabel}>Phản hồi</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.chatButton} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={16} color="#0D9488" />
            <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
          </Pressable>
          <Pressable style={styles.viewShopButton} onPress={handleViewShop}>
            <Ionicons name="storefront-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.viewShopButtonText}>Xem Shop</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {formatNumber(seller.productCount || 0)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Sản phẩm</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {formatNumber(seller.followerCount || 0)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Người theo dõi</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {seller.responseTime || "Trong vài phút"}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Thời gian phản hồi</ThemedText>
        </View>
      </View>

      {/* Location */}
      {seller.location && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#888888" />
          <ThemedText style={styles.locationText}>{seller.location}</ThemedText>
        </View>
      )}
    </View>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    borderTopWidth: 8,
    borderTopColor: "#F5F5F5",
  },

  // Header Row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#0D9488",
  },
  avatarPlaceholder: {
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  officialBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // Seller Info
  sellerInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mallBadge: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  mallBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222222",
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },
  metaLabel: {
    fontSize: 11,
    color: "#888888",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "column",
    gap: 6,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#0D9488",
    backgroundColor: "#FFFFFF",
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },
  viewShopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#0D9488",
  },
  viewShopButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D9488",
  },
  statLabel: {
    fontSize: 10,
    color: "#888888",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#F0F0F0",
  },

  // Location
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  locationText: {
    fontSize: 12,
    color: "#666666",
  },
});

export default SellerProductSection;
