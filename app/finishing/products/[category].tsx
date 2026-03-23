/**
 * Finishing Products List Screen
 * Displays products from API with real seller info
 * Used for each finishing category
 */
import { get } from "@/services/api";
import type { Product } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRODUCT_WIDTH = (SCREEN_WIDTH - 36) / 2;

const COLORS = {
  primary: "#0D9488",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#000000",
  textSecondary: "#757575",
  border: "#E0E0E0",
  star: "#FFCE3D",
  error: "#EF4444",
  success: "#00BFA5",
};

// Category configuration
const CATEGORY_CONFIG: Record<
  string,
  { title: string; color: string; keywords: string[] }
> = {
  "noi-that": {
    title: "Nội thất",
    color: "#8B4513",
    keywords: ["nội thất", "tủ", "sofa", "bàn", "ghế", "giường"],
  },
  "lat-gach": {
    title: "Lát gạch",
    color: "#1976d2",
    keywords: ["gạch", "ceramic", "granite", "lát"],
  },
  son: {
    title: "Sơn",
    color: "#666666",
    keywords: ["sơn", "paint", "epoxy"],
  },
  "thach-cao": {
    title: "Thạch cao",
    color: "#999999",
    keywords: ["thạch cao", "trần", "vách"],
  },
  "lam-cua": {
    title: "Làm cửa",
    color: "#0D9488",
    keywords: ["cửa", "nhôm", "kính", "sắt"],
  },
  "lan-can": {
    title: "Lan can - Cầu thang",
    color: "#666666",
    keywords: ["lan can", "cầu thang", "inox"],
  },
  "op-da": {
    title: "Đá ốp lát",
    color: "#666666",
    keywords: ["đá", "granite", "marble"],
  },
  "dien-nuoc": {
    title: "Điện nước",
    color: "#0D9488",
    keywords: ["điện", "nước", "ống"],
  },
  camera: {
    title: "Camera an ninh",
    color: "#000000",
    keywords: ["camera", "an ninh", "giám sát"],
  },
  "tho-tong-hop": {
    title: "Thợ tổng hợp",
    color: "#14B8A6",
    keywords: ["sửa chữa", "bảo trì"],
  },
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN").format(num) + "đ";
  };

  // Get image URL from ProductImage object
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
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>Mới</Text>
        </View>
      )}

      {product.isBestseller && (
        <View style={[styles.newBadge, { backgroundColor: COLORS.error }]}>
          <Text style={styles.newBadgeText}>Bán chạy</Text>
        </View>
      )}

      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

        <View style={styles.productMeta}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color={COLORS.star} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
          <Text style={styles.soldText}>{product.soldCount || 0} đã bán</Text>
        </View>

        {product.seller && (
          <View style={styles.sellerRow}>
            <Ionicons
              name="storefront-outline"
              size={10}
              color={COLORS.textSecondary}
            />
            <Text style={styles.sellerName} numberOfLines={1}>
              {product.seller.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function FinishingProductsScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const config =
    CATEGORY_CONFIG[category || "noi-that"] || CATEGORY_CONFIG["noi-that"];

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setPage(1);
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch from API
      const data = await get<{
        data: Product[];
        meta?: { totalPages: number };
      }>(`/products?limit=20&page=${isRefresh ? 1 : page}`);

      if (data) {
        const allProducts = data.data || [];

        // Filter by category keywords if needed
        const filteredProducts = allProducts.filter((p: Product) => {
          const name = p.name.toLowerCase();
          const desc = (p.description || "").toLowerCase();
          // For now, show all products (can filter by keywords later)
          return p.status === "APPROVED";
        });

        if (isRefresh) {
          setProducts(filteredProducts);
        } else {
          setProducts((prev) => [...prev, ...filteredProducts]);
        }

        setHasMore((data.meta?.totalPages ?? 0) > (isRefresh ? 1 : page));
      }
    } catch (error) {
      console.error("[FinishingProducts] Failed to load:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadProducts(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
      loadProducts();
    }
  };

  const handleProductPress = useCallback(
    (productId: number) => {
      router.push(
        `/finishing/product/${productId}?category=${category || "noi-that"}` as any,
      );
    },
    [category],
  );

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.seller?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORS.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm sản phẩm..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {filteredProducts.length} sản phẩm
          {searchQuery ? ` cho "${searchQuery}"` : ""}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>
        {searchQuery ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm"}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: config.title,
          headerStyle: { backgroundColor: config.color },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />

      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },

  // Header
  headerSection: {
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  statsRow: {
    marginBottom: 8,
  },
  statsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Product Card
  productCard: {
    width: PRODUCT_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  productImage: {
    width: "100%",
    height: PRODUCT_WIDTH,
    backgroundColor: COLORS.border,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  productContent: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    height: 36,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.error,
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  soldText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },

  // Empty & Loading
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
