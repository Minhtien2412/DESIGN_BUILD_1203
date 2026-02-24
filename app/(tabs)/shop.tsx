/**
 * Shop Tab - Shopee-style Product Marketplace
 * Trang mua sắm phong cách Shopee với các danh mục, flash sale, và sản phẩm nổi bật
 *
 * Features:
 * - Search bar
 * - Category grid (icon + label)
 * - Flash sale countdown
 * - Product grid (2 columns, Shopee-style cards)
 * - Pull-to-refresh
 * - Data from products.ts + API
 *
 * @created 2025-06-14
 */

import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/FavoritesContext";
import { useViewHistory } from "@/context/ViewHistoryContext";
import { PRODUCTS, Product } from "@/data/products";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

// ============================================================================
// THEME
// ============================================================================
const COLORS = {
  primary: "#EE4D2D", // Shopee orange-red
  primaryDark: "#D73211",
  background: "#F5F5F5",
  white: "#FFFFFF",
  text: "#222222",
  textSecondary: "#666666",
  textMuted: "#999999",
  border: "#EEEEEE",
  star: "#FFCE3D",
  badge: "#EE4D2D",
  flashSale: "#EE4D2D",
  freeShip: "#00BFA5",
  heartActive: "#EE4D2D",
  heartInactive: "#CCCCCC",
};

// ============================================================================
// CATEGORIES
// ============================================================================
const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: "grid-outline" as const },
  { id: "materials", label: "Vật liệu", icon: "cube-outline" as const },
  { id: "interior", label: "Nội thất", icon: "bed-outline" as const },
  { id: "furniture", label: "Đồ nội thất", icon: "home-outline" as const },
  { id: "lighting", label: "Chiếu sáng", icon: "bulb-outline" as const },
  { id: "sanitary", label: "Vệ sinh", icon: "water-outline" as const },
  { id: "consultation", label: "Tư vấn", icon: "chatbubble-outline" as const },
  { id: "architecture", label: "Kiến trúc", icon: "business-outline" as const },
  { id: "villa", label: "Biệt thự", icon: "home-outline" as const },
  { id: "construction", label: "Thi công", icon: "construct-outline" as const },
];

// ============================================================================
// UTILITY
// ============================================================================
function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}tr`;
  }
  return price.toLocaleString("vi-VN") + "đ";
}

function formatSold(sold?: number): string {
  if (!sold) return "";
  if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k đã bán`;
  return `${sold} đã bán`;
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================
interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

const ProductCard = ({
  product,
  onPress,
  onToggleFavorite,
  isFavorite,
}: ProductCardProps) => {
  const imageSource =
    typeof product.image === "string"
      ? { uri: product.image }
      : product.image?.uri
        ? { uri: product.image.uri }
        : product.image;

  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.productImage} />

        {/* Discount Badge */}
        {product.discountPercent && product.discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discountPercent}%</Text>
          </View>
        )}

        {/* Flash Sale Badge */}
        {product.flashSale && (
          <View style={styles.flashBadge}>
            <Ionicons name="flash" size={10} color="#fff" />
            <Text style={styles.flashText}>FLASH SALE</Text>
          </View>
        )}

        {/* Favorite Button */}
        <Pressable
          style={styles.heartButton}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? COLORS.heartActive : COLORS.heartInactive}
          />
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₫{formatPrice(product.price)}</Text>
          {product.discountPercent && product.discountPercent > 0 && (
            <Text style={styles.originalPrice}>
              ₫
              {formatPrice(
                Math.round(product.price / (1 - product.discountPercent / 100)),
              )}
            </Text>
          )}
        </View>

        {/* Bottom Row: Rating + Sold */}
        <View style={styles.bottomRow}>
          {product.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={10} color={COLORS.star} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          )}
          {(product.sold || product.soldCount) && (
            <Text style={styles.soldText}>
              {formatSold(product.sold || product.soldCount)}
            </Text>
          )}
          {product.freeShipping && (
            <View style={styles.freeShipBadge}>
              <Text style={styles.freeShipText}>Miễn phí vận chuyển</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

// ============================================================================
// MAIN SHOP SCREEN
// ============================================================================
export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart, items: cartItems } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToHistory, history } = useViewHistory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter((p) => p.status === "ACTIVE" || !p.status);

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const flashSaleProducts = useMemo(
    () => PRODUCTS.filter((p) => p.flashSale),
    [],
  );

  const cartCount = cartItems.length;

  const handleProductPress = useCallback(
    (product: Product) => {
      const imageStr =
        typeof product.image === "string"
          ? product.image
          : product.image?.uri || "";
      addToHistory({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageStr,
        type: "product" as const,
      });
      router.push(`/product/${product.id}`);
    },
    [router, addToHistory],
  );

  const handleToggleFavorite = useCallback(
    (product: Product) => {
      const imageStr =
        typeof product.image === "string"
          ? product.image
          : product.image?.uri || "";
      toggleFavorite({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageStr,
        type: "product" as const,
      });
    },
    [toggleFavorite],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch products from API
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.some((f) => f.id === productId),
    [favorites],
  );

  // ---- RENDER ----

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={[styles.searchHeader, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={COLORS.textMuted}
                />
              </Pressable>
            )}
          </View>
          <Pressable
            style={styles.cartButton}
            onPress={() => router.push("/cart")}
          >
            <Ionicons name="cart-outline" size={24} color={COLORS.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? "99+" : cartCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryItem,
                selectedCategory === cat.id && styles.categoryItemActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View
                style={[
                  styles.categoryIconContainer,
                  selectedCategory === cat.id && styles.categoryIconActive,
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={22}
                  color={
                    selectedCategory === cat.id
                      ? COLORS.primary
                      : COLORS.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === cat.id && styles.categoryLabelActive,
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Flash Sale Section */}
      {flashSaleProducts.length > 0 && selectedCategory === "all" && (
        <View style={styles.flashSaleSection}>
          <View style={styles.flashSaleHeader}>
            <View style={styles.flashSaleTitleRow}>
              <Ionicons name="flash" size={18} color={COLORS.flashSale} />
              <Text style={styles.flashSaleTitle}>FLASH SALE</Text>
            </View>
            <Pressable onPress={() => setSelectedCategory("flash")}>
              <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashSaleScroll}
          >
            {flashSaleProducts.slice(0, 8).map((product) => (
              <Pressable
                key={product.id}
                style={styles.flashSaleCard}
                onPress={() => handleProductPress(product)}
              >
                <Image
                  source={
                    typeof product.image === "string"
                      ? { uri: product.image }
                      : product.image?.uri
                        ? { uri: product.image.uri }
                        : product.image
                  }
                  style={styles.flashSaleImage}
                />
                <Text style={styles.flashSalePrice}>
                  ₫{formatPrice(product.price)}
                </Text>
                {product.discountPercent && (
                  <View style={styles.flashSaleDiscount}>
                    <Text style={styles.flashSaleDiscountText}>
                      -{product.discountPercent}%
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recently Viewed */}
      {history.length > 0 && selectedCategory === "all" && (
        <View style={styles.recentSection}>
          <View style={styles.flashSaleHeader}>
            <View style={styles.flashSaleTitleRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.recentTitle}>ĐÃ XEM GẦN ĐÂY</Text>
            </View>
            <Pressable onPress={() => router.push("/favorites")}>
              <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashSaleScroll}
          >
            {history.slice(0, 10).map((item) => (
              <Pressable
                key={item.id}
                style={styles.flashSaleCard}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <Image
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : { uri: "" }
                  }
                  style={styles.flashSaleImage}
                />
                <View style={{ padding: 6 }}>
                  <Text style={styles.recentItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.flashSalePrice}>
                    ₫{formatPrice(item.price)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Products Header */}
      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>
          {selectedCategory === "all" ? "GỢI Ý HÔM NAY" : "SẢN PHẨM"}
        </Text>
        <Text style={styles.productsCount}>
          {filteredProducts.length} sản phẩm
        </Text>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onToggleFavorite={() => handleToggleFavorite(item)}
      isFavorite={isFavorite(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
      <Text style={styles.emptySubtitle}>
        Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 100,
  },

  // Search Header
  searchHeader: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },
  cartButton: {
    position: "relative",
    padding: 6,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.badge,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },

  // Categories
  categoriesSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    gap: 4,
  },
  categoryItem: {
    alignItems: "center",
    width: 72,
    paddingVertical: 6,
  },
  categoryItemActive: {},
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryIconActive: {
    backgroundColor: "#FFF0ED",
  },
  categoryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  categoryLabelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Flash Sale
  flashSaleSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    marginBottom: 8,
  },
  flashSaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  flashSaleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flashSaleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.flashSale,
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  flashSaleScroll: {
    paddingHorizontal: 12,
    gap: 10,
  },
  flashSaleCard: {
    width: 110,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flashSaleImage: {
    width: 110,
    height: 110,
    resizeMode: "cover",
  },
  flashSalePrice: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  flashSaleDiscount: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.flashSale,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  flashSaleDiscountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },

  // Products Header
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    marginBottom: 4,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  productsCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Product Grid
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },
  flashBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.flashSale,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 8,
    gap: 2,
  },
  flashText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "700",
  },
  heartButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
    marginBottom: 6,
    minHeight: 32,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 10,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  soldText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  freeShipBadge: {
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  freeShipText: {
    fontSize: 9,
    color: COLORS.freeShip,
    fontWeight: "600",
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },

  // Recently Viewed
  recentSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  recentItemName: {
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 14,
  },
});
