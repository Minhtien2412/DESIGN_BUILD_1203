/**
 * Shop Profile Page - Shopee-style Seller/Shop Profile
 * Trang hồ sơ người bán với sản phẩm theo chuẩn Shopee
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Container } from "@/components/ui/container";
import { useThemeColor } from "@/hooks/useThemeColor";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ===================== TYPES =====================
interface Seller {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  isOfficial: boolean;
  isVerified: boolean;
  rating: number;
  responseRate: number;
  responseTime: string;
  productCount: number;
  followerCount: number;
  followingCount: number;
  joinDate: string;
  location: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  soldCount: number;
  discount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

type SortOption =
  | "popular"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "bestseller";
type TabOption = "all" | "bestseller" | "new" | "promo";

// ===================== MOCK DATA =====================
const MOCK_SELLER: Seller = {
  id: "1",
  name: "Bùi Minh Tâm",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  coverImage:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
  isOfficial: true,
  isVerified: true,
  rating: 4.9,
  responseRate: 98,
  responseTime: "trong vài phút",
  productCount: 156,
  followerCount: 12500,
  followingCount: 45,
  joinDate: "2024-01-15",
  location: "TP. Hồ Chí Minh",
  description:
    "Chuyên cung cấp vật liệu xây dựng chính hãng, giá tốt nhất thị trường.",
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Xi măng PCB40 Holcim 50kg",
    price: 95000,
    originalPrice: 110000,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300",
    rating: 4.8,
    soldCount: 1250,
    discount: 14,
    isBestseller: true,
  },
  {
    id: "2",
    name: "Gạch Block 10x20x40 cao cấp",
    price: 3200,
    image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300",
    rating: 4.7,
    soldCount: 890,
    isNew: true,
  },
  {
    id: "3",
    name: "Thép Hòa Phát D10 (cây 11.7m)",
    price: 165000,
    originalPrice: 180000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
    rating: 4.9,
    soldCount: 2100,
    discount: 8,
    isBestseller: true,
  },
  {
    id: "4",
    name: "Cát xây dựng loại 1 (m³)",
    price: 350000,
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300",
    rating: 4.6,
    soldCount: 456,
  },
  {
    id: "5",
    name: "Sơn Dulux nội thất 5L",
    price: 650000,
    originalPrice: 750000,
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300",
    rating: 4.8,
    soldCount: 678,
    discount: 13,
  },
  {
    id: "6",
    name: "Gạch Granite 60x60 bóng kiếng",
    price: 180000,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300",
    rating: 4.7,
    soldCount: 345,
    isNew: true,
  },
];

// ===================== HELPERS =====================
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "k";
  return num.toString();
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMonths =
    (now.getFullYear() - date.getFullYear()) * 12 +
    now.getMonth() -
    date.getMonth();
  if (diffMonths < 1) return "Tháng này";
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  const years = Math.floor(diffMonths / 12);
  return `${years} năm trước`;
}

// ===================== COMPONENTS =====================

// Product Card Component
function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      {/* Image */}
      <View style={styles.productImageWrapper}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          contentFit="cover"
        />
        {product.discount && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>
              -{product.discount}%
            </ThemedText>
          </View>
        )}
        {product.isNew && (
          <View style={styles.newBadge}>
            <ThemedText style={styles.newBadgeText}>MỚI</ThemedText>
          </View>
        )}
        {product.isBestseller && (
          <View style={styles.bestsellerBadge}>
            <Ionicons name="flame" size={10} color="#FFFFFF" />
            <ThemedText style={styles.bestsellerText}>Bán chạy</ThemedText>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>

        <View style={styles.priceRow}>
          <ThemedText style={styles.productPrice}>
            {formatPrice(product.price)}
          </ThemedText>
          {product.originalPrice && (
            <ThemedText style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </ThemedText>
          )}
        </View>

        <View style={styles.productMeta}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFAA00" />
            <ThemedText style={styles.ratingText}>
              {product.rating.toFixed(1)}
            </ThemedText>
          </View>
          <ThemedText style={styles.soldText}>
            Đã bán {formatNumber(product.soldCount)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

// Tab Filter Component
function TabFilter({
  activeTab,
  onTabChange,
}: {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}) {
  const tabs: { key: TabOption; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "bestseller", label: "Bán chạy" },
    { key: "new", label: "Hàng mới" },
    { key: "promo", label: "Khuyến mãi" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabContainer}
      contentContainerStyle={styles.tabContent}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </ThemedText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Sort Filter Component
function SortFilter({
  activeSort,
  onSortChange,
}: {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  const sorts: { key: SortOption; label: string }[] = [
    { key: "popular", label: "Phổ biến" },
    { key: "newest", label: "Mới nhất" },
    { key: "bestseller", label: "Bán chạy" },
    { key: "price-asc", label: "Giá thấp" },
    { key: "price-desc", label: "Giá cao" },
  ];

  return (
    <View style={styles.sortContainer}>
      <ThemedText style={styles.sortLabel}>Sắp xếp:</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sorts.map((sort) => (
          <Pressable
            key={sort.key}
            style={[
              styles.sortButton,
              activeSort === sort.key && styles.sortButtonActive,
            ]}
            onPress={() => onSortChange(sort.key)}
          >
            <ThemedText
              style={[
                styles.sortButtonText,
                activeSort === sort.key && styles.sortButtonTextActive,
              ]}
            >
              {sort.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ===================== MAIN SCREEN =====================
export default function ShopProfileScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const backgroundColor = useThemeColor({}, "background");

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabOption>("all");
  const [activeSort, setActiveSort] = useState<SortOption>("popular");

  // Load data
  const loadData = useCallback(async () => {
    try {
      // In real app, fetch from API
      // const sellerData = await getSellerById(slug);
      // const productsData = await getProductsBySeller(slug);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setSeller(MOCK_SELLER);
      setProducts(MOCK_PRODUCTS);
    } catch (error) {
      console.error("Failed to load shop data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Call API to follow/unfollow
  };

  const handleChat = () => {
    router.push(`/chat/${seller?.id}` as Href);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}` as Href);
  };

  // Filter products based on tab
  const filteredProducts = products.filter((product) => {
    if (activeTab === "bestseller") return product.isBestseller;
    if (activeTab === "new") return product.isNew;
    if (activeTab === "promo") return !!product.discount;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (activeSort) {
      case "newest":
        return 0; // Would use createdAt in real app
      case "bestseller":
        return b.soldCount - a.soldCount;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return b.soldCount - a.soldCount;
    }
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Ionicons name="storefront-outline" size={64} color="#CCCCCC" />
        <ThemedText style={styles.errorText}>Không tìm thấy shop</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: seller.name,
          headerStyle: { backgroundColor: "#0D9488" },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <View style={styles.headerRight}>
              <Pressable
                style={styles.headerButton}
                onPress={() => router.push("/search" as Href)}
              >
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.headerButton}
                onPress={() => router.push("/cart" as Href)}
              >
                <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          ),
        }}
      />

      <FlatList
        data={sortedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.productRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D9488"]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Cover Image */}
            <Image
              source={{ uri: seller.coverImage || seller.avatar }}
              style={styles.coverImage}
              contentFit="cover"
            />

            {/* Profile Section */}
            <Container style={styles.profileSection}>
              {/* Avatar & Info */}
              <View style={styles.profileHeader}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: seller.avatar }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                  {seller.isOfficial && (
                    <View style={styles.avatarBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    {seller.isOfficial && (
                      <View style={styles.mallBadge}>
                        <ThemedText style={styles.mallBadgeText}>
                          Mall
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText style={styles.sellerName}>
                      {seller.name}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.onlineStatus}>
                    Online {seller.responseTime}
                  </ThemedText>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={[
                    styles.followButton,
                    isFollowing && styles.followingButton,
                  ]}
                  onPress={handleFollow}
                >
                  <Ionicons
                    name={isFollowing ? "checkmark" : "add"}
                    size={18}
                    color={isFollowing ? "#0D9488" : "#FFFFFF"}
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

                <Pressable style={styles.chatButton} onPress={handleChat}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color="#0D9488"
                  />
                  <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
                </Pressable>
              </View>

              {/* Stats */}
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
                  <ThemedText style={styles.statLabel}>
                    Người theo dõi
                  </ThemedText>
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
                  <ThemedText style={styles.statLabel}>Phản hồi</ThemedText>
                </View>
              </View>

              {/* Additional Info */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color="#888888" />
                  <ThemedText style={styles.infoText}>
                    {seller.location}
                  </ThemedText>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color="#888888" />
                  <ThemedText style={styles.infoText}>
                    Tham gia {formatDate(seller.joinDate)}
                  </ThemedText>
                </View>
              </View>
            </Container>

            {/* Filters */}
            <View style={styles.filterSection}>
              <TabFilter activeTab={activeTab} onTabChange={setActiveTab} />
              <SortFilter
                activeSort={activeSort}
                onSortChange={setActiveSort}
              />
            </View>

            {/* Products Header */}
            <Container>
              <ThemedText style={styles.productsHeader}>
                Sản phẩm ({sortedProducts.length})
              </ThemedText>
            </Container>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#CCCCCC" />
            <ThemedText style={styles.emptyText}>
              Chưa có sản phẩm nào
            </ThemedText>
          </View>
        }
      />
    </>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#888888",
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  listContent: {
    backgroundColor: "#F5F5F5",
    paddingBottom: 24,
  },

  // Cover & Profile
  coverImage: {
    width: "100%",
    height: 120,
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    marginTop: -30,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
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
    borderWidth: 3,
    borderColor: "#0D9488",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0D9488",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
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
    backgroundColor: "#0D9488",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  mallBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },
  onlineStatus: {
    fontSize: 13,
    color: "#00AA00",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  followButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#0D9488",
  },
  followButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  followingButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  followingButtonText: {
    color: "#0D9488",
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0D9488",
    backgroundColor: "#FFFFFF",
  },
  chatButtonText: {
    color: "#0D9488",
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats
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
    color: "#0D9488",
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

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#666666",
  },

  // Filters
  filterSection: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#0D9488",
  },
  tabText: {
    fontSize: 14,
    color: "#666666",
  },
  tabTextActive: {
    color: "#0D9488",
    fontWeight: "600",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    color: "#888888",
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: "#0D9488",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#666666",
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Products
  productsHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginTop: 16,
    marginBottom: 12,
  },
  productRow: {
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 12,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productImageWrapper: {
    position: "relative",
    aspectRatio: 1,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#0D9488",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#00AA00",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  bestsellerBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#FF6600",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  bestsellerText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  productInfo: {
    padding: 10,
    gap: 6,
  },
  productName: {
    fontSize: 13,
    color: "#222222",
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D9488",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    color: "#666666",
  },
  soldText: {
    fontSize: 11,
    color: "#888888",
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#888888",
  },
});
