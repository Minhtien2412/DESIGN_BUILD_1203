/**
 * Finishing Index Screen - Danh mục hoàn thiện
 * Lists all finishing categories with navigation to detail screens
 * Now includes featured products from real API
 */
import { Colors } from "@/constants/theme";
import type { Product } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
    route: "/finishing/lat-gach-new",
    color: "#1976d2",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    workerCount: 234,
  },
  {
    id: "son",
    title: "Sơn",
    subtitle: "Sơn tường, sơn gỗ, epoxy...",
    icon: "color-palette-outline",
    route: "/finishing/son-new",
    color: "#666666",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400",
    workerCount: 189,
  },
  {
    id: "thach-cao",
    title: "Thạch cao",
    subtitle: "Trần, vách ngăn, trang trí...",
    icon: "layers-outline",
    route: "/finishing/thach-cao-new",
    color: "#999999",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    workerCount: 145,
  },
  {
    id: "lam-cua",
    title: "Làm cửa",
    subtitle: "Cửa gỗ, nhôm kính, sắt...",
    icon: "enter-outline",
    route: "/finishing/lam-cua-new",
    color: "#0066CC",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    workerCount: 178,
  },
  {
    id: "lan-can",
    title: "Lan can - Cầu thang",
    subtitle: "Inox, kính cường lực...",
    icon: "git-network-outline",
    route: "/finishing/lan-can-new",
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
    color: "#0066CC",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
    workerCount: 312,
  },
  {
    id: "camera",
    title: "Camera an ninh",
    subtitle: "Lắp đặt, bảo trì camera...",
    icon: "videocam-outline",
    route: "/finishing/camera-new",
    color: "#000000",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400",
    workerCount: 67,
  },
  {
    id: "tho-tong-hop",
    title: "Thợ tổng hợp",
    subtitle: "Sửa chữa, bảo trì nhà...",
    icon: "construct-outline",
    route: "/finishing/tho-tong-hop-new",
    color: "#0080FF",
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

  const imageUrl =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400";

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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch(
        "https://baotienweb.cloud/api/v1/products?limit=10&status=APPROVED",
        { headers: { "X-API-Key": "nhaxinh-api-2025-secret-key" } },
      );
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.data || []);
      }
    } catch (error) {
      console.error("[Finishing] Failed to load products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductPress = (productId: number) => {
    router.push(`/finishing/product/${productId}?category=finishing`);
  };

  const handleViewAllProducts = () => {
    router.push("/finishing/products/noi-that");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Hoàn thiện công trình",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Tìm thợ hoàn thiện</Text>
            <Text style={styles.bannerSubtitle}>
              Kết nối với hơn 2,000+ thợ chuyên nghiệp{"\n"}trong mọi lĩnh vực
              hoàn thiện
            </Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons
              name="construct"
              size={48}
              color="rgba(255,255,255,0.3)"
            />
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Sản phẩm nổi bật</Text>
            <TouchableOpacity onPress={handleViewAllProducts}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.productsScroll}
            >
              {featuredProducts.map((product) => (
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>📦 Danh mục dịch vụ</Text>
        </View>
        <View style={styles.grid}>
          {CATEGORIES.map((item) => (
            <CategoryCard key={item.id} item={item} />
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: "#E8F4FF" }]}>
              <Ionicons name="shield-checkmark" size={24} color="#1976d2" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Thợ đã xác minh</Text>
              <Text style={styles.infoDesc}>
                100% thợ được kiểm tra năng lực
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: "#e8f5e9" }]}>
              <Ionicons name="cash" size={24} color="#0066CC" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Giá cả minh bạch</Text>
              <Text style={styles.infoDesc}>
                Báo giá rõ ràng, không phát sinh
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: "#E8F4FF" }]}>
              <Ionicons name="ribbon" size={24} color="#0066CC" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Bảo hành công trình</Text>
              <Text style={styles.infoDesc}>
                Cam kết bảo hành theo thỏa thuận
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Banner
  banner: {
    backgroundColor: Colors.light.primary,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  bannerIcon: {
    marginLeft: 16,
  },

  // Grid
  grid: {
    padding: 12,
  },
  card: {
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
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
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  cardMeta: {
    alignItems: "flex-end",
  },
  workerCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
    fontWeight: "600",
  },

  // Info Section
  infoSection: {
    backgroundColor: "#fff",
    margin: 12,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    marginLeft: 14,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 12,
    color: "#666",
  },

  // Products Section
  productsSection: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  productsScroll: {
    paddingLeft: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#666",
  },
  categoriesHeader: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Product Card
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  productImage: {
    width: "100%",
    height: PRODUCT_CARD_WIDTH,
    backgroundColor: "#f5f5f5",
  },
  productBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  productContent: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    color: "#333",
    lineHeight: 16,
    height: 32,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#EE4D2D",
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
