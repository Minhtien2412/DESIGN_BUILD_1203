/**
 * Finishing Product Detail Screen
 * Displays product details with real seller info from API
 * Shows seller's other products
 */
import { useCart } from "@/context/cart-context";
import { get } from "@/services/api";
import { productService } from "@/services/api/product.service";
import type { Product } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.9;

// Colors
const COLORS = {
  primary: "#0D9488",
  primaryDark: "#004C99",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#000000",
  textSecondary: "#757575",
  border: "#E0E0E0",
  star: "#FFCE3D",
  success: "#00BFA5",
  error: "#EF4444",
};

// Seller info interface
interface SellerInfo {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  rating?: number;
  productCount?: number;
  responseRate?: number;
  responseTime?: string;
}

export default function FinishingProductDetailScreen() {
  const { id, category } = useLocalSearchParams<{
    id: string;
    category?: string;
  }>();
  const { addToCart, items: cartItems } = useCart();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const imageListRef = useRef<FlatList>(null);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  // Load product and seller data
  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const productId = parseInt(id, 10);
      if (isNaN(productId)) return;

      // Fetch product details
      const productData = await productService.getProduct(productId);
      setProduct(productData);

      // Set seller info from product
      if (productData.seller) {
        const sellerInfo: SellerInfo = {
          id: productData.seller.id,
          name: productData.seller.name,
          email: productData.seller.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(productData.seller.name)}&background=0066CC&color=fff&size=128`,
          rating: 4.8,
          productCount: 0,
          responseRate: 95,
          responseTime: "trong vài phút",
        };

        // Fetch full seller data if available
        try {
          const userData = await get<{ avatar?: string; phone?: string }>(
            `/users/${productData.seller.id}`,
          );
          if (userData) {
            sellerInfo.avatar = userData.avatar || sellerInfo.avatar;
            sellerInfo.phone = userData.phone;
          }
        } catch (e) {
          console.log("Could not fetch full seller data");
        }

        setSeller(sellerInfo);

        // Fetch seller's other products
        try {
          const productsData = await get<{
            data: Product[];
            meta?: { total: number };
          }>(`/products?createdBy=${productData.seller.id}&limit=10`);
          if (productsData) {
            const otherProducts = (productsData.data || []).filter(
              (p: Product) => p.id !== productId,
            );
            setSellerProducts(otherProducts);
            sellerInfo.productCount =
              productsData.meta?.total || otherProducts.length + 1;
            setSeller({ ...sellerInfo });
          }
        } catch (e) {
          console.log("Could not fetch seller products");
        }
      }
    } catch (error) {
      console.error("[FinishingProduct] Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  const productImages = useMemo(() => {
    if (!product?.images?.length) {
      return [
        "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800",
      ];
    }
    // ProductImage objects have url property
    return product.images.map((img) => img.url);
  }, [product]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN").format(num) + "đ";
  };

  const handleBack = useCallback(() => router.back(), []);

  const handleShare = useCallback(async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Xem sản phẩm "${product.name}" - ${formatPrice(product.price)} trên Nhà Xinh App!`,
        title: product.name,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Add to cart with quantity using loop
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: String(product.id),
        name: product.name,
        price:
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price,
        image: { uri: productImages[0] },
        category: product.category || category || "finishing",
      } as any);
    }

    // Show success feedback
    router.push("/cart");
  }, [product, quantity, addToCart, productImages, category]);

  const handleContactSeller = useCallback(() => {
    if (!seller) return;
    router.push(`/messages/${seller.id}`);
  }, [seller]);

  const handleViewSellerShop = useCallback(() => {
    if (!seller) return;
    router.push(`/profile/${seller.id}/shop`);
  }, [seller]);

  const handleProductPress = useCallback(
    (productId: number) => {
      router.push(
        `/finishing/product/${productId}?category=${category || "finishing"}` as any,
      );
    },
    [category],
  );

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={COLORS.textSecondary}
        />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            opacity: headerOpacity,
            backgroundColor: COLORS.surface,
          },
        ]}
      >
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
      </Animated.View>

      {/* Fixed Header Buttons */}
      <View style={[styles.headerButtons, { top: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/cart")}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? "99+" : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={imageListRef}
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setCurrentImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          {/* Image Dots */}
          <View style={styles.imageDots}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? COLORS.error : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.statText}>4.8</Text>
            </View>
            <Text style={styles.statDivider}>|</Text>
            <Text style={styles.statText}>{product.soldCount || 0} đã bán</Text>
            <Text style={styles.statDivider}>|</Text>
            <Text style={styles.statText}>
              {product.viewCount || 0} lượt xem
            </Text>
          </View>

          {product.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>Mới</Text>
            </View>
          )}
        </View>

        {/* Seller Section */}
        {seller && (
          <View style={styles.sellerSection}>
            <View style={styles.sellerHeader}>
              <Image
                source={{ uri: seller.avatar }}
                style={styles.sellerAvatar}
              />
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{seller.name}</Text>
                <View style={styles.sellerMeta}>
                  <View style={styles.sellerMetaItem}>
                    <Ionicons name="star" size={12} color={COLORS.star} />
                    <Text style={styles.sellerMetaText}>
                      {seller.rating || 4.8}
                    </Text>
                  </View>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.sellerMetaText}>
                    {seller.productCount || 0} sản phẩm
                  </Text>
                </View>
                <View style={styles.responseInfo}>
                  <Text style={styles.responseText}>
                    Phản hồi {seller.responseRate || 95}% •{" "}
                    {seller.responseTime || "trong vài phút"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sellerActions}>
              <TouchableOpacity
                style={styles.sellerActionBtn}
                onPress={handleContactSeller}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.sellerActionText}>Chat ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sellerActionBtn, styles.viewShopBtn]}
                onPress={handleViewSellerShop}
              >
                <Ionicons name="storefront-outline" size={18} color="#fff" />
                <Text style={[styles.sellerActionText, { color: "#fff" }]}>
                  Xem Shop
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Product Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
          </Text>
        </View>

        {/* Product Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Danh mục</Text>
            <Text style={styles.specValue}>
              {product.category || "Hoàn thiện"}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Tình trạng</Text>
            <Text style={styles.specValue}>
              {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Trạng thái</Text>
            <Text style={[styles.specValue, { color: COLORS.success }]}>
              {product.status === "APPROVED" ? "Đã duyệt" : product.status}
            </Text>
          </View>
        </View>

        {/* Seller's Other Products */}
        {sellerProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm khác của Shop</Text>
              <TouchableOpacity onPress={handleViewSellerShop}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sellerProducts.map((item) => {
                // Get image URL from ProductImage object
                const imageUrl =
                  item.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400";

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.relatedProduct}
                    onPress={() => handleProductPress(item.id)}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.relatedImage}
                    />
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.relatedPrice}>
                      {formatPrice(item.price)}
                    </Text>
                    <View style={styles.relatedStats}>
                      <Ionicons name="star" size={10} color={COLORS.star} />
                      <Text style={styles.relatedStatText}>
                        {item.soldCount || 0} đã bán
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={handleContactSeller}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={COLORS.primary}
          />
          <Text style={styles.bottomBtnText}>Chat</Text>
        </TouchableOpacity>

        <View style={styles.bottomDivider} />

        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => router.push("/cart")}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
          <Text style={styles.bottomBtnText}>Giỏ hàng</Text>
          {cartCount > 0 && (
            <View style={styles.smallBadge}>
              <Text style={styles.smallBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={() => {
            handleAddToCart();
            router.push("/checkout");
          }}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    maxWidth: "60%",
  },
  headerButtons: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    zIndex: 101,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  headerRight: {
    flexDirection: "row",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Image Section
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.surface,
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageDots: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  favoriteBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Product Info
  productInfo: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.error,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statDivider: {
    marginHorizontal: 8,
    color: COLORS.border,
  },
  newBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Seller Section
  sellerSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  sellerHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  sellerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  sellerMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  metaDivider: {
    marginHorizontal: 6,
    color: COLORS.textSecondary,
  },
  responseInfo: {
    marginTop: 2,
  },
  responseText: {
    fontSize: 11,
    color: COLORS.success,
  },
  sellerActions: {
    flexDirection: "row",
    gap: 12,
  },
  sellerActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  sellerActionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  viewShopBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  // Section
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },

  // Related Products
  relatedProduct: {
    width: 140,
    marginRight: 12,
  },
  relatedImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  relatedName: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 8,
    height: 32,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.error,
    marginTop: 4,
  },
  relatedStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  relatedStatText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomBtn: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  bottomBtnText: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },
  bottomDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  smallBadge: {
    position: "absolute",
    top: -4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  smallBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  buyNowBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyNowText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
