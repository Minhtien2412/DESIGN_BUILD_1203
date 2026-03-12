/**
 * Product Detail Screen — Teal Theme
 * API-integrated with review service + related products
 *
 * Features:
 * - Image slider with dots indicator
 * - Price with discount badge
 * - Vouchers section
 * - Shipping info with free ship badge
 * - Shop info with follow/chat buttons
 * - Product specifications
 * - Reviews from API (fallback mock)
 * - Similar products from API (fallback local)
 * - Bottom action bar (Chat, Cart, Add to Cart, Buy Now)
 * - Variant selection modal
 */

import { useFullMediaViewer } from "@/components/ui/full-media-viewer";
import { Colors } from "@/constants/theme";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/FavoritesContext";
import { useViewHistory } from "@/context/ViewHistoryContext";
import type {
    Product as MockProduct,
    PriceHistoryEntry,
} from "@/data/products";
import { PRODUCTS } from "@/data/products";
import { apiFetch } from "@/services/api";
import { productService } from "@/services/api/product.service";
import type { Product } from "@/services/api/types";
import {
    getProductReviews,
    type Review,
    type ReviewStats,
} from "@/services/reviewService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// TEAL THEME COLORS (from constants/theme.ts)
const THEME = {
  primary: Colors.light.primary, // #0D9488
  primaryDark: "#0F766E",
  primaryLight: Colors.light.accent, // #14B8A6
  background: Colors.light.surfaceMuted, // #F5F5F5
  surface: Colors.light.surface, // #FFFFFF
  text: Colors.light.text, // #000000
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  border: Colors.light.border, // #E0E0E0
  divider: "#EEEEEE",
  star: "#FFCE3D",
  voucher: Colors.light.error, // #EF4444
  freeShip: "#10B981",
  mall: Colors.light.error, // #EF4444
  tint: "#F0FDFA", // light teal tint
};

// VARIANT OPTIONS
const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];
const COLOR_OPTIONS = [
  { id: "black", name: "Đen", hex: "#000000" },
  { id: "white", name: "Trắng", hex: "#FFFFFF" },
  { id: "teal", name: "Xanh lá", hex: "#0D9488" },
  { id: "blue", name: "Xanh dương", hex: "#2196F3" },
  { id: "gray", name: "Xám", hex: "#9E9E9E" },
];

// FALLBACK REVIEWS (used when API fails)
const FALLBACK_REVIEWS: Review[] = [
  {
    id: "1",
    rating: 5,
    comment: "Sản phẩm rất tốt, đúng như mô tả. Giao hàng nhanh!",
    createdAt: "2026-01-15",
    userName: "Nguyễn Văn A",
    userAvatar: "https://i.pravatar.cc/100?img=1",
    images: [
      { id: "r1", url: "https://picsum.photos/200/200?random=r1" },
      { id: "r2", url: "https://picsum.photos/200/200?random=r2" },
    ],
    helpfulCount: 128,
  },
  {
    id: "2",
    rating: 4,
    comment: "Chất lượng ổn, giá hợp lý.",
    createdAt: "2026-01-10",
    userName: "Trần Thị B",
    userAvatar: "https://i.pravatar.cc/100?img=2",
    helpfulCount: 45,
  },
  {
    id: "3",
    rating: 5,
    comment: "Mua lần 2 rồi, rất hài lòng!",
    createdAt: "2026-01-05",
    userName: "Lê Văn C",
    userAvatar: "https://i.pravatar.cc/100?img=3",
    images: [{ id: "r3", url: "https://picsum.photos/200/200?random=r3" }],
    helpfulCount: 89,
  },
];

const MOCK_VOUCHERS = [
  { id: "1", discount: "Giảm ₫10k", minOrder: "Đơn tối thiểu ₫99k" },
  { id: "2", discount: "Giảm 5%", minOrder: "Đơn tối thiểu ₫199k" },
  { id: "3", discount: "Miễn phí ship", minOrder: "Đơn tối thiểu ₫50k" },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, items: cartItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useViewHistory();
  const mediaViewer = useFullMediaViewer();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [mockProduct, setMockProduct] = useState<MockProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFromApi, setIsFromApi] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[1]);
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Review state — loaded from API
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<MockProduct[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const imageListRef = useRef<FlatList>(null);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const productImages = useMemo(() => {
    if (isFromApi && product?.images?.length) {
      return product.images.map((img) =>
        typeof img === "string" ? img : img.url,
      );
    }
    const baseImage =
      mockProduct?.image?.uri || "https://picsum.photos/600/600?random=base";
    return [
      baseImage,
      "https://picsum.photos/600/600?random=p2",
      "https://picsum.photos/600/600?random=p3",
      "https://picsum.photos/600/600?random=p4",
      "https://picsum.photos/600/600?random=p5",
    ];
  }, [isFromApi, product, mockProduct]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Load reviews from API when product is ready
  useEffect(() => {
    if (!id) return;
    loadReviews(String(id));
  }, [id]);

  // Load related products
  useEffect(() => {
    if (!product && !mockProduct) return;
    const cat = product?.category || mockProduct?.category;
    if (cat) {
      const related = PRODUCTS.filter(
        (p) => p.category === cat && p.id !== id,
      ).slice(0, 10);
      setRelatedProducts(related.length > 0 ? related : PRODUCTS.slice(0, 10));
    } else {
      setRelatedProducts(PRODUCTS.slice(0, 10));
    }
  }, [product, mockProduct, id]);

  // Track in view history
  useEffect(() => {
    const dp = product || mockProduct;
    if (!dp) return;
    addToHistory({
      id: dp.id?.toString() || "1",
      name: dp.name,
      price: dp.price,
      image:
        (product?.images?.[0] &&
          (typeof product.images[0] === "string"
            ? product.images[0]
            : (product.images[0] as any).url)) ||
        (mockProduct?.image as any)?.uri ||
        "",
      type: "product",
    });
  }, [product, mockProduct]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      if (!id || typeof id !== "string") throw new Error("Invalid product ID");
      const productId = parseInt(id, 10);
      if (!isNaN(productId)) {
        try {
          const data = await productService.getProduct(productId);
          setProduct(data);
          setIsFromApi(true);
          return;
        } catch {
          /* Fallback */
        }
      }
      const mockData = PRODUCTS.find((p) => p.id === id);
      setMockProduct(mockData || PRODUCTS[0]);
      setIsFromApi(false);
    } catch (error) {
      console.error("[ProductDetail] Failed to load:", error);
      setMockProduct(PRODUCTS[0]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (productId: string) => {
    try {
      const result = await getProductReviews(productId, 1, 10);
      if (result.ok && result.data) {
        if (result.data.reviews?.length > 0) {
          setReviews(result.data.reviews);
        }
        if (result.data.stats) {
          setReviewStats(result.data.stats);
        }
      }
    } catch {
      // Keep fallback reviews
    }
  };

  // Load price history
  useEffect(() => {
    if (!id || !isFromApi) return;
    const loadPriceHistory = async () => {
      try {
        const result = await apiFetch(`/products/${id}/price-history?limit=10`);
        if (result && (result as any).history) {
          setPriceHistory((result as any).history);
        }
      } catch {
        // Price history not available
      }
    };
    loadPriceHistory();
  }, [id, isFromApi]);

  const handleBack = useCallback(() => router.back(), []);
  const handleShare = useCallback(async () => {
    const displayProduct = product || mockProduct;
    try {
      await Share.share({
        message: `Xem sản phẩm "${displayProduct?.name}" trên Nhà Xinh App!`,
        title: displayProduct?.name,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  }, [product, mockProduct]);

  const handleFavoriteToggle = useCallback(() => {
    const dp = product || mockProduct;
    if (!dp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite({
      id: dp.id?.toString() || "1",
      name: dp.name,
      price: dp.price,
      image: productImages[0] || "",
      type: "product",
    });
  }, [product, mockProduct, toggleFavorite, productImages]);

  const handleImageTap = useCallback(
    (index: number) => {
      const dp = product || mockProduct;
      const files = productImages.map((img, i) => ({
        id: String(i),
        uri: typeof img === "string" ? img : (img as any).uri || "",
        type: "image" as const,
        name: `Product image ${i + 1}`,
      }));
      mediaViewer.open(files, index, {
        allowShare: true,
        allowDownload: true,
        headerTitle: dp?.name || "Sản phẩm",
      });
    },
    [productImages, mediaViewer, product, mockProduct],
  );

  const handleImageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setCurrentImageIndex(
        Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH),
      );
    },
    [],
  );

  const handleAddToCart = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const displayProduct = product || mockProduct;
    if (!displayProduct) return;
    addToCart(
      {
        id: displayProduct.id?.toString() || "1",
        name: displayProduct.name,
        price: displayProduct.price,
        image: productImages[0],
        description: displayProduct.description,
        category: displayProduct.category,
      },
      quantity,
      selectedSize,
      selectedColor.name,
    );
    setShowVariantModal(false);
  }, [
    product,
    mockProduct,
    quantity,
    addToCart,
    selectedSize,
    selectedColor,
    productImages,
  ]);

  const handleBuyNow = useCallback(() => {
    handleAddToCart();
    router.push("/checkout");
  }, [handleAddToCart]);
  const handleChat = useCallback(() => router.push("/chat"), []);
  const handleViewShop = useCallback(() => router.push("/shop"), []);
  const handleViewAllReviews = useCallback(
    () => router.push(`/product/${id}/reviews`),
    [id],
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const displayProduct = product || mockProduct;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!displayProduct) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={THEME.textSecondary}
        />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const originalPrice =
    (displayProduct as any).originalPrice ||
    Math.round(displayProduct.price * 1.3);
  const discountPercent =
    (displayProduct as any).discountPercent ||
    Math.round((1 - displayProduct.price / originalPrice) * 100);
  const soldCount =
    (displayProduct as any).sold ||
    (displayProduct as any).soldCount ||
    Math.floor(Math.random() * 5000) + 500;
  const rating =
    reviewStats?.averageRating ?? (displayProduct as any).rating ?? 4.8;
  const reviewCount =
    reviewStats?.totalReviews ??
    (displayProduct as any).reviewCount ??
    reviews.length;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          { opacity: headerOpacity, paddingTop: insets.top },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayProduct.name}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons
                name="share-social-outline"
                size={22}
                color={THEME.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={styles.headerButton}
            >
              <Ionicons name="cart-outline" size={24} color={THEME.text} />
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
      </Animated.View>

      {/* Floating Header Buttons */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.floatingButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.floatingRight}>
          <TouchableOpacity onPress={handleShare} style={styles.floatingButton}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.floatingButton}
          >
            <Ionicons name="cart-outline" size={22} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.floatingCartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? "99+" : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main ScrollView */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Image Slider */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={imageListRef}
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleImageTap(index)}
              >
                <Image
                  source={typeof item === "string" ? { uri: item } : item}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{productImages.length}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={
                isFavorite(displayProduct.id?.toString() || "1")
                  ? "heart"
                  : "heart-outline"
              }
              size={24}
              color={
                isFavorite(displayProduct.id?.toString() || "1")
                  ? THEME.primary
                  : "#fff"
              }
            />
          </TouchableOpacity>
        </View>

        {/* Dots */}
        <View style={styles.dotsContainer}>
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

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>₫</Text>
            <Text style={styles.currentPrice}>
              {displayProduct.price.toLocaleString("vi-VN")}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          </View>
          <Text style={styles.originalPrice}>
            ₫{originalPrice.toLocaleString("vi-VN")}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {displayProduct.name}
          </Text>
          <View style={styles.soldRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={THEME.star} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <Text style={styles.dividerDot}>|</Text>
            <Text style={styles.soldText}>
              Đã bán{" "}
              {soldCount > 1000
                ? `${(soldCount / 1000).toFixed(1)}k`
                : soldCount}
            </Text>
          </View>
        </View>

        {/* Price History */}
        {priceHistory.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              activeOpacity={0.7}
              onPress={() => setShowPriceHistory(!showPriceHistory)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="trending-down-outline"
                  size={18}
                  color={THEME.primary}
                />
                <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>
                  Lịch sử giá
                </Text>
              </View>
              <Ionicons
                name={showPriceHistory ? "chevron-up" : "chevron-down"}
                size={18}
                color={THEME.textSecondary}
              />
            </TouchableOpacity>
            {showPriceHistory && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                {priceHistory.map((entry, idx) => {
                  const isDown = entry.newPrice < entry.oldPrice;
                  const pctChange = Math.abs(
                    Math.round(
                      ((entry.newPrice - entry.oldPrice) / entry.oldPrice) *
                        100,
                    ),
                  );
                  return (
                    <View
                      key={entry.id || idx}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 8,
                        borderBottomWidth:
                          idx < priceHistory.length - 1 ? 1 : 0,
                        borderBottomColor: "#F1F5F9",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ fontSize: 12, color: THEME.textSecondary }}
                        >
                          {new Date(entry.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </Text>
                        {entry.reason ? (
                          <Text
                            style={{
                              fontSize: 11,
                              color: THEME.textSecondary,
                              marginTop: 2,
                            }}
                          >
                            {entry.reason}
                          </Text>
                        ) : null}
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name={isDown ? "arrow-down" : "arrow-up"}
                            size={12}
                            color={isDown ? "#10B981" : "#EF4444"}
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: isDown ? "#10B981" : "#EF4444",
                              marginLeft: 2,
                            }}
                          >
                            {pctChange}%
                          </Text>
                        </View>
                        <Text
                          style={{ fontSize: 12, color: THEME.textSecondary }}
                        >
                          ₫{entry.oldPrice.toLocaleString("vi-VN")} → ₫
                          {entry.newPrice.toLocaleString("vi-VN")}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Vouchers */}
        <TouchableOpacity style={styles.section} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mã Giảm Giá Của Shop</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={THEME.textSecondary}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.vouchersScroll}
          >
            {MOCK_VOUCHERS.map((voucher) => (
              <View key={voucher.id} style={styles.voucherItem}>
                <View style={styles.voucherLeft}>
                  <Text style={styles.voucherDiscount}>{voucher.discount}</Text>
                  <Text style={styles.voucherMin}>{voucher.minOrder}</Text>
                </View>
                <View style={styles.voucherDivider} />
                <TouchableOpacity style={styles.voucherButton}>
                  <Text style={styles.voucherButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>

        {/* Shipping */}
        <View style={styles.section}>
          <View style={styles.shippingRow}>
            <MaterialCommunityIcons
              name="truck-delivery"
              size={20}
              color={THEME.freeShip}
            />
            <View style={styles.shippingInfo}>
              <View style={styles.freeShipBadge}>
                <Text style={styles.freeShipText}>Miễn phí vận chuyển</Text>
              </View>
              <Text style={styles.shippingDetail}>
                Miễn phí vận chuyển cho đơn hàng từ ₫50.000
              </Text>
            </View>
          </View>
          <View style={styles.shippingRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={THEME.textSecondary}
            />
            <View style={styles.shippingInfo}>
              <Text style={styles.locationText}>Gửi từ Hồ Chí Minh</Text>
              <Text style={styles.deliveryTime}>Nhận hàng sau 2-4 ngày</Text>
            </View>
          </View>
        </View>

        {/* Variant Selection */}
        <TouchableOpacity
          style={styles.section}
          activeOpacity={0.7}
          onPress={() => setShowVariantModal(true)}
        >
          <View style={styles.variantRow}>
            <Text style={styles.variantLabel}>Chọn phân loại hàng</Text>
            <View style={styles.variantValue}>
              <Text style={styles.variantText}>
                {selectedColor.name}, {selectedSize}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={THEME.textSecondary}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Shop Section */}
        <View style={styles.shopSection}>
          <View style={styles.shopInfo}>
            <Image
              source={{ uri: "https://picsum.photos/100/100?random=shop" }}
              style={styles.shopAvatar}
            />
            <View style={styles.shopDetails}>
              <View style={styles.shopNameRow}>
                <View style={styles.mallBadge}>
                  <Text style={styles.mallText}>Mall</Text>
                </View>
                <Text style={styles.shopName}>
                  {(displayProduct as any).seller?.name || "Nhà Xinh Official"}
                </Text>
              </View>
              <View style={styles.shopStats}>
                <Text style={styles.shopStat}>
                  <Text style={styles.shopStatValue}>4.9</Text> Đánh giá
                </Text>
                <Text style={styles.shopStatDivider}>|</Text>
                <Text style={styles.shopStat}>
                  <Text style={styles.shopStatValue}>98%</Text> Phản hồi Chat
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.shopActions}>
            <TouchableOpacity
              style={[styles.shopButton, styles.shopButtonOutline]}
              onPress={handleChat}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={THEME.primary}
              />
              <Text style={styles.shopButtonTextOutline}>Chat Ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={handleViewShop}
            >
              <Ionicons
                name="storefront-outline"
                size={16}
                color={THEME.primary}
              />
              <Text style={styles.shopButtonTextOutline}>Xem Shop</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.shopMoreStats}>
            <View style={styles.shopMoreStat}>
              <Text style={styles.shopMoreValue}>156</Text>
              <Text style={styles.shopMoreLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.shopMoreStat}>
              <Text style={styles.shopMoreValue}>12.5k</Text>
              <Text style={styles.shopMoreLabel}>Người theo dõi</Text>
            </View>
            <View style={styles.shopMoreStat}>
              <Text style={styles.shopMoreValue}>4.9</Text>
              <Text style={styles.shopMoreLabel}>Đánh giá</Text>
            </View>
            <View style={styles.shopMoreStat}>
              <Text style={styles.shopMoreValue}>98%</Text>
              <Text style={styles.shopMoreLabel}>Tỉ lệ phản hồi</Text>
            </View>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi Tiết Sản Phẩm</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Danh mục</Text>
              <Text style={styles.detailValue}>
                Shopee &gt; {displayProduct.category || "Thời trang"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thương hiệu</Text>
              <Text style={styles.detailValue}>
                {(displayProduct as any).brand || "No Brand"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Xuất xứ</Text>
              <Text style={styles.detailValue}>
                {(displayProduct as any).origin || "Việt Nam"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chất liệu</Text>
              <Text style={styles.detailValue}>Cotton 100%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kho hàng</Text>
              <Text style={styles.detailValue}>
                {(displayProduct as any).stock || 999}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gửi từ</Text>
              <Text style={styles.detailValue}>Hồ Chí Minh</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô Tả Sản Phẩm</Text>
          <Text style={styles.description}>
            {displayProduct.description ||
              "🏆 CHÍNH HÃNG 100%\n\n📦 Sản phẩm bao gồm:\n- 1 x Sản phẩm chính\n- Hộp đựng cao cấp\n\n✨ ĐẶC ĐIỂM NỔI BẬT:\n• Thiết kế hiện đại\n• Chất liệu cao cấp\n• Dễ phối đồ\n\n🚚 CHÍNH SÁCH ĐỔI TRẢ:\n- Đổi trả trong 7 ngày\n- Hoàn tiền 100% nếu lỗi từ shop"}
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Đánh Giá Sản Phẩm</Text>
            <TouchableOpacity
              onPress={handleViewAllReviews}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={THEME.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.ratingSummary}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigNumber}>{rating}</Text>
              <Text style={styles.ratingBigMax}>/5</Text>
            </View>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    star <= Math.floor(rating)
                      ? "star"
                      : star - rating < 1
                        ? "star-half"
                        : "star-outline"
                  }
                  size={16}
                  color={THEME.star}
                />
              ))}
              <Text style={styles.reviewCountText}>
                ({reviewCount} đánh giá)
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reviewFilters}
          >
            {[
              "Tất cả",
              "5 Sao (523)",
              "4 Sao (256)",
              "3 Sao (54)",
              "Có Hình ảnh",
            ].map((filter, index) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  index === 0 && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    index === 0 && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {reviews.slice(0, 3).map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Image
                source={{
                  uri: review.userAvatar || "https://i.pravatar.cc/100",
                }}
                style={styles.reviewAvatar}
              />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewUser}>
                  {review.userName || "Người dùng"}
                </Text>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? "star" : "star-outline"}
                      size={12}
                      color={THEME.star}
                    />
                  ))}
                </View>
                <Text style={styles.reviewDate}>
                  {review.createdAt?.split("T")[0] || review.createdAt}
                </Text>
                <Text style={styles.reviewText}>{review.comment}</Text>
                {review.images && review.images.length > 0 && (
                  <View style={styles.reviewImages}>
                    {review.images.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{
                          uri: typeof img === "string" ? img : img.url,
                        }}
                        style={styles.reviewImage}
                      />
                    ))}
                  </View>
                )}
                <TouchableOpacity style={styles.reviewLike}>
                  <Ionicons
                    name="thumbs-up-outline"
                    size={14}
                    color={THEME.textSecondary}
                  />
                  <Text style={styles.reviewLikeText}>
                    Hữu ích ({review.helpfulCount ?? 0})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Similar Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản Phẩm Tương Tự</Text>
          <FlatList
            data={relatedProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.similarProduct}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <Image
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image
                  }
                  style={styles.similarImage}
                />
                <Text style={styles.similarName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.similarPrice}>
                  ₫{item.price.toLocaleString("vi-VN")}
                </Text>
                <Text style={styles.similarSoldText}>
                  Đã bán{" "}
                  {(item as any).sold || Math.floor(Math.random() * 1000)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity style={styles.bottomAction} onPress={handleChat}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color={THEME.primary}
          />
          <Text style={styles.bottomActionText}>Chat</Text>
        </TouchableOpacity>
        <View style={styles.bottomDivider} />
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => router.push("/cart")}
        >
          <View>
            <Ionicons name="cart-outline" size={22} color={THEME.primary} />
            {cartCount > 0 && (
              <View style={styles.bottomCartBadge}>
                <Text style={styles.bottomCartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.bottomActionText}>Giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => setShowVariantModal(true)}
        >
          <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Variant Selection Modal */}
      {showVariantModal && (
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowVariantModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Image
                source={{ uri: productImages[0] as string }}
                style={styles.modalImage}
              />
              <View style={styles.modalInfo}>
                <Text style={styles.modalPrice}>
                  ₫{displayProduct.price.toLocaleString("vi-VN")}
                </Text>
                <Text style={styles.modalStock}>
                  Kho: {(displayProduct as any).stock || 999}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowVariantModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color={THEME.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Màu sắc</Text>
                <View style={styles.variantOptions}>
                  {COLOR_OPTIONS.map((color) => (
                    <TouchableOpacity
                      key={color.id}
                      style={[
                        styles.variantOption,
                        selectedColor.id === color.id &&
                          styles.variantOptionActive,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: color.hex },
                        ]}
                      />
                      <Text
                        style={[
                          styles.variantOptionText,
                          selectedColor.id === color.id &&
                            styles.variantOptionTextActive,
                        ]}
                      >
                        {color.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Kích cỡ</Text>
                <View style={styles.variantOptions}>
                  {SIZE_OPTIONS.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.variantOption,
                        selectedSize === size && styles.variantOptionActive,
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text
                        style={[
                          styles.variantOptionText,
                          selectedSize === size &&
                            styles.variantOptionTextActive,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Số lượng</Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={quantity <= 1 ? THEME.textTertiary : THEME.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Ionicons name="add" size={20} color={THEME.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={handleAddToCart}
              >
                <Text style={styles.modalAddBtnText}>Thêm vào giỏ hàng</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
    gap: 16,
  },
  loadingText: { fontSize: 16, color: THEME.textSecondary },
  errorText: {
    fontSize: 18,
    color: THEME.textSecondary,
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: THEME.primary,
    borderRadius: 8,
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.surface,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginHorizontal: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: THEME.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    zIndex: 99,
  },
  floatingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  floatingRight: { flexDirection: "row" },
  floatingCartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: THEME.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  scrollView: { flex: 1 },
  imageContainer: {
    position: "relative",
    backgroundColor: THEME.surface,
  },
  productImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  imageCounter: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  imageCounterText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  favoriteButton: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: THEME.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.textTertiary,
    marginHorizontal: 3,
  },
  dotActive: { width: 18, backgroundColor: THEME.primary },
  priceSection: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  priceRow: { flexDirection: "row", alignItems: "flex-end" },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: THEME.primary,
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: THEME.primary,
  },
  discountBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginLeft: 8,
    marginBottom: 4,
  },
  discountText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  originalPrice: {
    fontSize: 14,
    color: THEME.textSecondary,
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: THEME.text,
    marginTop: 8,
    lineHeight: 22,
  },
  soldRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, color: THEME.text, marginLeft: 4 },
  dividerDot: { marginHorizontal: 8, color: THEME.textTertiary },
  soldText: { fontSize: 14, color: THEME.textSecondary },
  section: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: THEME.text },
  vouchersScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  voucherItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    overflow: "hidden",
  },
  voucherLeft: { padding: 10 },
  voucherDiscount: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.voucher,
  },
  voucherMin: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  voucherDivider: { width: 1, height: "70%", backgroundColor: "#CCFBF1" },
  voucherButton: { paddingHorizontal: 16, paddingVertical: 8 },
  voucherButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.voucher,
  },
  shippingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  shippingInfo: { flex: 1, marginLeft: 12 },
  freeShipBadge: {
    backgroundColor: "#E8F5F1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  freeShipText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.freeShip,
  },
  shippingDetail: { fontSize: 13, color: THEME.textSecondary },
  locationText: { fontSize: 14, color: THEME.text },
  deliveryTime: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  variantLabel: { fontSize: 14, color: THEME.textSecondary },
  variantValue: { flexDirection: "row", alignItems: "center" },
  variantText: { fontSize: 14, color: THEME.text, marginRight: 4 },
  shopSection: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  shopInfo: { flexDirection: "row", alignItems: "center" },
  shopAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  shopDetails: { flex: 1, marginLeft: 12 },
  shopNameRow: { flexDirection: "row", alignItems: "center" },
  mallBadge: {
    backgroundColor: THEME.mall,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 8,
  },
  mallText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  shopName: { fontSize: 16, fontWeight: "600", color: THEME.text },
  shopStats: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  shopStat: { fontSize: 12, color: THEME.textSecondary },
  shopStatValue: { color: THEME.primary, fontWeight: "600" },
  shopStatDivider: { marginHorizontal: 8, color: THEME.textTertiary },
  shopActions: { flexDirection: "row", marginTop: 16, gap: 12 },
  shopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.primary,
    gap: 6,
  },
  shopButtonOutline: { backgroundColor: "transparent" },
  shopButtonTextOutline: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.primary,
  },
  shopMoreStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.divider,
  },
  shopMoreStat: { flex: 1, alignItems: "center" },
  shopMoreValue: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.primary,
  },
  shopMoreLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  detailsGrid: { marginTop: 12 },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  detailLabel: { width: 120, fontSize: 14, color: THEME.textSecondary },
  detailValue: { flex: 1, fontSize: 14, color: THEME.text },
  description: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 22,
    marginTop: 12,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAllButton: { flexDirection: "row", alignItems: "center" },
  viewAllText: { fontSize: 14, color: THEME.primary },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  ratingBig: { flexDirection: "row", alignItems: "baseline", marginRight: 12 },
  ratingBigNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: THEME.primary,
  },
  ratingBigMax: { fontSize: 16, color: THEME.primary },
  ratingStars: { flexDirection: "row", alignItems: "center" },
  reviewCountText: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginLeft: 8,
  },
  reviewFilters: {
    marginBottom: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 8,
  },
  filterChipActive: {
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  filterChipText: { fontSize: 13, color: THEME.textSecondary },
  filterChipTextActive: { color: THEME.primary },
  reviewItem: {
    flexDirection: "row",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.divider,
  },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewContent: { flex: 1, marginLeft: 12 },
  reviewUser: { fontSize: 13, fontWeight: "500", color: THEME.text },
  reviewRating: { flexDirection: "row", marginTop: 4 },
  reviewDate: { fontSize: 12, color: THEME.textTertiary, marginTop: 4 },
  reviewText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
    marginTop: 8,
  },
  reviewImages: { flexDirection: "row", marginTop: 12, gap: 8 },
  reviewImage: { width: 80, height: 80, borderRadius: 4 },
  reviewLike: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  reviewLikeText: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginLeft: 6,
  },
  similarProduct: { width: 140, marginRight: 12 },
  similarImage: {
    width: 140,
    height: 140,
    borderRadius: 4,
    backgroundColor: THEME.background,
  },
  similarName: {
    fontSize: 13,
    color: THEME.text,
    marginTop: 8,
    height: 36,
  },
  similarPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.primary,
    marginTop: 4,
  },
  similarSoldText: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.divider,
  },
  bottomAction: { alignItems: "center", paddingHorizontal: 12 },
  bottomActionText: {
    fontSize: 10,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  bottomDivider: {
    width: 1,
    height: 32,
    backgroundColor: THEME.divider,
  },
  bottomCartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: THEME.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomCartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  addToCartBtn: {
    flex: 1,
    backgroundColor: THEME.primaryLight,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 12,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  addToCartText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  buyNowBtn: {
    flex: 1,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    alignItems: "center",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  buyNowText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  modalImage: { width: 100, height: 100, borderRadius: 4 },
  modalInfo: { flex: 1, marginLeft: 12, justifyContent: "flex-end" },
  modalPrice: { fontSize: 20, fontWeight: "700", color: THEME.primary },
  modalStock: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  modalClose: { position: "absolute", top: 12, right: 12 },
  modalBody: { padding: 16 },
  modalSection: { marginBottom: 20 },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.text,
    marginBottom: 12,
  },
  variantOptions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  variantOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 8,
  },
  variantOptionActive: {
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  variantOptionText: { fontSize: 14, color: THEME.text },
  variantOptionTextActive: { color: THEME.primary },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  quantityRow: { flexDirection: "row", alignItems: "center" },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "500",
    color: THEME.text,
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: "center",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.divider,
  },
  modalAddBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  modalAddBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
