import { PRODUCTS } from "@/data/products";
import { getProducts, type Product } from "@/services/api/products.service";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Equipment category mapping
const CATEGORY_INFO: Record<
  string,
  { title: string; icon: string; description: string; apiCategory?: string }
> = {
  "kitchen-equipment": {
    title: "Thiết bị bếp",
    icon: "🍳",
    description: "Bếp, máy hút mùi, tủ lạnh, lò nướng...",
    apiCategory: "kitchen",
  },
  "sanitary-equipment": {
    title: "Thiết bị vệ sinh",
    icon: "🚿",
    description: "Bồn cầu, vòi sen, chậu rửa, bồn tắm...",
    apiCategory: "sanitary",
  },
  electrical: {
    title: "Thiết bị điện",
    icon: "💡",
    description: "Ổ cắm, công tắc, đèn LED, quạt...",
    apiCategory: "lighting",
  },
  plumbing: {
    title: "Thiết bị nước",
    icon: "💧",
    description: "Máy bơm, bình nóng lạnh, van khóa...",
    apiCategory: "plumbing",
  },
  "fire-safety": {
    title: "Thiết bị PCCC",
    icon: "🧯",
    description: "Bình cứu hỏa, báo cháy, vòi phun...",
    apiCategory: "fire-safety",
  },
  "dining-tables": {
    title: "Bàn ăn",
    icon: "🍽️",
    description: "Bàn ăn gỗ, kính, đá marble...",
    apiCategory: "furniture",
  },
  "study-desks": {
    title: "Bàn học",
    icon: "📚",
    description: "Bàn học sinh, bàn làm việc, ghế...",
    apiCategory: "study-desk",
  },
  sofas: {
    title: "Sofa",
    icon: "🛋️",
    description: "Sofa da, vải, góc, giường...",
    apiCategory: "furniture",
  },
  construction: {
    title: "Công trình đang thi công",
    icon: "🏗️",
    description: "Các dự án đang thi công thực tế",
    apiCategory: "construction",
  },
  villa: {
    title: "Biệt thự",
    icon: "🏠",
    description: "Thiết kế biệt thự cao cấp",
    apiCategory: "villa",
  },
  interior: {
    title: "Nội thất",
    icon: "🛋️",
    description: "Thiết kế nội thất chuyên nghiệp",
    apiCategory: "interior",
  },
};

export default function ShoppingCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const categoryInfo = CATEGORY_INFO[category] || {
    title: "Sản phẩm",
    icon: "🛒",
    description: "Danh sách sản phẩm",
    apiCategory: category,
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [sortBy, setSortBy] = useState<
    "popular" | "price-asc" | "price-desc" | "rating"
  >("popular");
  const [filterBrand, setFilterBrand] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 100000000,
  ]);

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getProducts({
        category: categoryInfo.apiCategory || category,
        sortBy: (sortBy === "price-asc" || sortBy === "price-desc"
          ? "price"
          : sortBy === "rating"
            ? "rating"
            : "newest") as "price" | "rating" | "newest" | "popular",
        sortOrder:
          sortBy === "price-desc"
            ? "desc"
            : sortBy === "price-asc"
              ? "asc"
              : "desc",
        limit: 50,
      });
      setProducts(response.products);
      setIsOffline(false);
    } catch (error) {
      console.warn("[CategoryScreen] API failed, using local data:", error);
      // Fallback to local product data
      const apiCat = categoryInfo.apiCategory || category;
      const localProducts = PRODUCTS.filter((p) => p.category === apiCat);
      setProducts(localProducts);
      setIsOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category, sortBy]);

  // Extract unique brands
  const brands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean)),
  );

  // Apply filters
  let filteredProducts = [...products];
  if (filterBrand.length > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => p.brand && filterBrand.includes(p.brand),
    );
  }
  filteredProducts = filteredProducts.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleProductPress = (product: Product) => {
    try {
      if (!product?.id) return;
      router.push(`/product/${product.id}`);
    } catch (e) {
      console.warn("Navigation error:", e);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        {item.image?.uri ? (
          <Image
            source={{ uri: item.image.uri }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImagePlaceholderText}>📦</Text>
          </View>
        )}
        {item.rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
        {item.discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discountPercent}%</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.brandText}>
          {item.brand || item.seller?.name || "Nhà Xinh"}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount || 0})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: categoryInfo.title,
          headerBackTitle: "Quay lại",
        }}
      />

      <View style={styles.container}>
        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#92400e" />
            <Text style={styles.offlineBannerText}>
              Đang dùng dữ liệu offline
            </Text>
            <TouchableOpacity onPress={() => loadProducts()}>
              <Text style={styles.offlineRetry}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.iconText}>{categoryInfo.icon}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{categoryInfo.title}</Text>
            <Text style={styles.headerDescription}>
              {categoryInfo.description}
            </Text>
          </View>
        </View>

        {/* Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "popular" && styles.filterChipActive,
            ]}
            onPress={() => setSortBy("popular")}
          >
            <Text
              style={[
                styles.filterChipText,
                sortBy === "popular" && styles.filterChipTextActive,
              ]}
            >
              Phổ biến
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "price-asc" && styles.filterChipActive,
            ]}
            onPress={() => setSortBy("price-asc")}
          >
            <Ionicons
              name="arrow-up"
              size={14}
              color={sortBy === "price-asc" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterChipText,
                sortBy === "price-asc" && styles.filterChipTextActive,
              ]}
            >
              Giá
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "price-desc" && styles.filterChipActive,
            ]}
            onPress={() => setSortBy("price-desc")}
          >
            <Ionicons
              name="arrow-down"
              size={14}
              color={sortBy === "price-desc" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterChipText,
                sortBy === "price-desc" && styles.filterChipTextActive,
              ]}
            >
              Giá
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "rating" && styles.filterChipActive,
            ]}
            onPress={() => setSortBy("rating")}
          >
            <Ionicons
              name="star"
              size={14}
              color={sortBy === "rating" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterChipText,
                sortBy === "rating" && styles.filterChipTextActive,
              ]}
            >
              Đánh giá
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="options-outline" size={14} color="#666" />
            <Text style={styles.filterChipText}>Lọc</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Products Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productList}
            columnWrapperStyle={styles.productRow}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadProducts(true)}
                colors={["#0D9488"]}
              />
            }
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                {filteredProducts.length} sản phẩm
              </Text>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
                <Text style={styles.emptySubtext}>
                  Thử thay đổi bộ lọc hoặc tìm kiếm khác
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  offlineBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
  },
  offlineRetry: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d97706",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 32,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 13,
    color: "#666",
  },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  productList: {
    padding: 12,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    overflow: "hidden",
  },
  productImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f8f9fa",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  productImagePlaceholderText: {
    fontSize: 48,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  resultCount: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  productInfo: {
    padding: 12,
  },
  brandText: {
    fontSize: 11,
    color: "#0D9488",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  reviewCount: {
    fontSize: 11,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
