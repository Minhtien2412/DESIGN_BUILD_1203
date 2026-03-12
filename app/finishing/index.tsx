/**
 * Finishing Index Screen - Danh mục hoàn thiện
 * Modern Shopee-inspired design with real API integration
 * @updated 2026-02-05 - Modern redesign + fixed API integration
 */
import { Colors } from "@/constants/theme";
import { get } from "@/services/api";
import type { Product } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2.5;

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  image?: string;
  workerCount?: number;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "noi-that",
    title: "Nội thất",
    subtitle: "Tủ bếp, tủ quần áo, sofa...",
    icon: "bed-outline",
    route: "/finishing/noi-that",
    color: "#8B4513",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    workerCount: 156,
  },
  {
    id: "lat-gach",
    title: "Lát gạch",
    subtitle: "Gạch ceramic, granite, 3D...",
    icon: "grid-outline",
    route: "/finishing/lat-gach",
    color: "#1976d2",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    workerCount: 234,
  },
  {
    id: "son",
    title: "Sơn",
    subtitle: "Sơn tường, sơn gỗ, epoxy...",
    icon: "color-palette-outline",
    route: "/finishing/son",
    color: "#666666",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400",
    workerCount: 189,
  },
  {
    id: "thach-cao",
    title: "Thạch cao",
    subtitle: "Trần, vách ngăn, trang trí...",
    icon: "layers-outline",
    route: "/finishing/thach-cao",
    color: "#999999",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    workerCount: 145,
  },
  {
    id: "lam-cua",
    title: "Làm cửa",
    subtitle: "Cửa gỗ, nhôm kính, sắt...",
    icon: "enter-outline",
    route: "/finishing/lam-cua",
    color: "#0D9488",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    workerCount: 178,
  },
  {
    id: "lan-can",
    title: "Lan can - Cầu thang",
    subtitle: "Inox, kính cường lực...",
    icon: "git-network-outline",
    route: "/finishing/lan-can",
    color: "#666666",
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400",
    workerCount: 98,
  },
  {
    id: "da",
    title: "Đá ốp lát",
    subtitle: "Granite, marble, nhân tạo...",
    icon: "diamond-outline",
    route: "/finishing/op-da",
    color: "#666666",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400",
    workerCount: 87,
  },
  {
    id: "dien-nuoc",
    title: "Điện nước",
    subtitle: "Điện, nước, điều hòa...",
    icon: "flash-outline",
    route: "/finishing/dien-nuoc",
    color: "#0D9488",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
    workerCount: 312,
  },
  {
    id: "camera",
    title: "Camera an ninh",
    subtitle: "Lắp đặt, bảo trì camera...",
    icon: "videocam-outline",
    route: "/finishing/camera",
    color: "#000000",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400",
    workerCount: 67,
  },
  {
    id: "tho-tong-hop",
    title: "Thợ tổng hợp",
    subtitle: "Sửa chữa, bảo trì nhà...",
    icon: "construct-outline",
    route: "/finishing/tho-tong-hop",
    color: "#14B8A6",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    workerCount: 245,
  },
];

const CategoryCard: React.FC<{ item: CategoryItem }> = ({ item }) => {
  const handlePress = () => {
    router.push(item.route as any);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      )}
      <View style={styles.cardOverlay} />

      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#fff" />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.workerCount}>{item.workerCount}+ thợ</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Product Card Component for featured products
const FeaturedProductCard: React.FC<{
  product: Product;
  onPress: () => void;
}> = ({ product, onPress }) => {
  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN").format(num) + "đ";
  };

  // Get image URL from ProductImage object
  const imageUrl =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400";

  console.log(
    "[FeaturedProduct] Image URL:",
    imageUrl,
    "Images:",
    product.images,
  );

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: imageUrl }} style={styles.productImage} />
      {product.isNew && (
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>Mới</Text>
        </View>
      )}
      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
        <View style={styles.productMeta}>
          <Ionicons name="star" size={10} color="#FFCE3D" />
          <Text style={styles.productRating}>4.8</Text>
          <Text style={styles.productSold}>
            {product.soldCount || 0} đã bán
          </Text>
        </View>
        {product.seller && (
          <View style={styles.sellerInfo}>
            <Ionicons name="storefront-outline" size={10} color="#999" />
            <Text style={styles.sellerName} numberOfLines={1}>
              {product.seller.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function FinishingIndexScreen() {
  const insets = useSafeAreaInsets();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await get<{ data: Product[] }>("/products", {
        limit: 10,
        status: "APPROVED",
      });
      if (data?.data) {
        setFeaturedProducts(data.data);
      }
    } catch (error) {
      console.error("[Finishing] Failed to load products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeaturedProducts();
    setRefreshing(false);
  }, [loadFeaturedProducts]);

  const handleProductPress = (productId: number) => {
    router.push(`/finishing/product/${productId}?category=finishing`);
  };

  const handleViewAllProducts = () => {
    router.push("/finishing/products/noi-that");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Modern Gradient Header */}
      <LinearGradient
        colors={["#0F766E", "#115E59", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBack}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Hoàn thiện công trình</Text>
            <Text style={styles.headerSubtitle}>2,000+ thợ chuyên nghiệp</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/search" as any)}
            style={styles.headerSearch}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{CATEGORIES.length}</Text>
            <Text style={styles.statLabel}>Danh mục</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2,000+</Text>
            <Text style={styles.statLabel}>Thợ tay nghề</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Đánh giá TB</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
          />
        }
      >
        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flame" size={20} color="#0D9488" />
              <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            </View>
            <TouchableOpacity
              onPress={handleViewAllProducts}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.light.primary}
              />
            </TouchableOpacity>
          </View>

          {loadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
            </View>
          ) : (
            <FlatList
              data={featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <FeaturedProductCard
                  product={item}
                  onPress={() => handleProductPress(item.id)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyProducts}>
                  <Ionicons name="cube-outline" size={40} color="#ccc" />
                  <Text style={styles.emptyText}>Chưa có sản phẩm</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Categories Grid - Modern Cards */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="grid" size={20} color="#0F766E" />
              <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {CATEGORIES.map((item) => (
              <CategoryCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>Tại sao chọn chúng tôi?</Text>
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <LinearGradient
                colors={["#E3F2FD", "#BBDEFB"]}
                style={styles.trustIcon}
              >
                <Ionicons name="shield-checkmark" size={28} color="#1565C0" />
              </LinearGradient>
              <Text style={styles.trustItemTitle}>Đã xác minh</Text>
              <Text style={styles.trustItemDesc}>100% thợ kiểm tra</Text>
            </View>
            <View style={styles.trustItem}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.trustIcon}
              >
                <Ionicons name="cash" size={28} color="#2E7D32" />
              </LinearGradient>
              <Text style={styles.trustItemTitle}>Giá minh bạch</Text>
              <Text style={styles.trustItemDesc}>Không phát sinh</Text>
            </View>
            <View style={styles.trustItem}>
              <LinearGradient
                colors={["#FFF3E0", "#FFE0B2"]}
                style={styles.trustIcon}
              >
                <Ionicons name="ribbon" size={28} color="#E65100" />
              </LinearGradient>
              <Text style={styles.trustItemTitle}>Bảo hành</Text>
              <Text style={styles.trustItemDesc}>Cam kết rõ ràng</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },

  // Header
  header: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  headerSearch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  // Products Section
  productsSection: {
    backgroundColor: "#fff",
    marginTop: -8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  productsScroll: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#999",
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
  },

  // Categories Section
  categoriesSection: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingTop: 20,
    paddingBottom: 8,
  },
  grid: {
    paddingHorizontal: 12,
  },
  card: {
    height: 110,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  cardMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  workerCount: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  // Trust Section
  trustSection: {
    backgroundColor: "#fff",
    marginTop: 10,
    padding: 20,
  },
  trustTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 20,
  },
  trustGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trustItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  trustIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  trustItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 4,
  },
  trustItemDesc: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },

  // Product Card
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  productImage: {
    width: "100%",
    height: PRODUCT_CARD_WIDTH,
    backgroundColor: "#F5F5F5",
  },
  productBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#0D9488",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  productBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  productContent: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    color: "#333",
    lineHeight: 16,
    height: 32,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D9488",
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  productRating: {
    fontSize: 10,
    color: "#666",
    marginLeft: 2,
    marginRight: 6,
  },
  productSold: {
    fontSize: 10,
    color: "#999",
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerName: {
    fontSize: 10,
    color: "#999",
    marginLeft: 4,
    flex: 1,
  },
});
