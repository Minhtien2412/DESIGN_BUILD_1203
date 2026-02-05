/**
 * Product Detail Screen - Shopee Style 100%
 * Created: 04/02/2026
 *
 * Full Shopee-like product page with all features:
 * - Image slider with dots indicator
 * - Price with discount badge
 * - Vouchers section
 * - Shipping info with free ship badge
 * - Shop info with follow/chat buttons
 * - Product specifications
 * - Reviews section with filters
 * - Similar products
 * - Bottom action bar (Chat, Cart, Add to Cart, Buy Now)
 * - Variant selection modal
 */

import { useCart } from "@/context/cart-context";
import type { Product as MockProduct } from "@/data/products";
import { PRODUCTS } from "@/data/products";
import { productService } from "@/services/api/product.service";
import type { Product } from "@/services/api/types";
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

// SHOPEE COLORS - Exact Shopee color palette
const SHOPEE_COLORS = {
  primary: "#EE4D2D",
  primaryDark: "#D73211",
  primaryLight: "#FF6633",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  border: "#E0E0E0",
  divider: "#EEEEEE",
  star: "#FFCE3D",
  voucher: "#D0011B",
  freeShip: "#00BFA5",
  mall: "#D0011B",
};

// VARIANT OPTIONS
const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];
const COLOR_OPTIONS = [
  { id: "black", name: "Đen", hex: "#000000" },
  { id: "white", name: "Trắng", hex: "#FFFFFF" },
  { id: "red", name: "Đỏ", hex: "#EE4D2D" },
  { id: "blue", name: "Xanh dương", hex: "#2196F3" },
  { id: "gray", name: "Xám", hex: "#9E9E9E" },
];

// MOCK DATA
const MOCK_REVIEWS = [
  {
    id: "1",
    user: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    date: "2026-01-15",
    content: "Sản phẩm rất tốt, đúng như mô tả. Giao hàng nhanh!",
    images: [
      "https://picsum.photos/200/200?random=r1",
      "https://picsum.photos/200/200?random=r2",
    ],
    variant: "Đen, L",
    likes: 128,
  },
  {
    id: "2",
    user: "Trần Thị B",
    avatar: "https://i.pravatar.cc/100?img=2",
    rating: 4,
    date: "2026-01-10",
    content: "Chất lượng ổn, giá hợp lý.",
    images: [],
    variant: "Trắng, M",
    likes: 45,
  },
  {
    id: "3",
    user: "Lê Văn C",
    avatar: "https://i.pravatar.cc/100?img=3",
    rating: 5,
    date: "2026-01-05",
    content: "Mua lần 2 rồi, rất hài lòng!",
    images: ["https://picsum.photos/200/200?random=r3"],
    variant: "Xanh, XL",
    likes: 89,
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
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [mockProduct, setMockProduct] = useState<MockProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFromApi, setIsFromApi] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[1]);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const imageListRef = useRef<FlatList>(null);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const productImages = useMemo(() => {
    if (isFromApi && product?.images?.length) return product.images;
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

  const similarProducts = useMemo(() => PRODUCTS.slice(0, 10), []);

  useEffect(() => {
    loadProduct();
  }, [id]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite((prev) => !prev);
  }, []);

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
  const handleChat = useCallback(() => router.push("/messages"), []);
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
        <ActivityIndicator size="large" color={SHOPEE_COLORS.primary} />
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
          color={SHOPEE_COLORS.textSecondary}
        />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const originalPrice = Math.round(displayProduct.price * 1.3);
  const discountPercent =
    (displayProduct as any).discountPercent ||
    Math.round((1 - displayProduct.price / originalPrice) * 100);
  const soldCount =
    (displayProduct as any).sold ||
    (displayProduct as any).soldCount ||
    Math.floor(Math.random() * 5000) + 500;
  const rating = (displayProduct as any).rating || 4.8;
  const reviewCount = (displayProduct as any).reviewCount || 856;

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
            <Ionicons name="arrow-back" size={24} color={SHOPEE_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayProduct.name}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons
                name="share-social-outline"
                size={22}
                color={SHOPEE_COLORS.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={styles.headerButton}
            >
              <Ionicons
                name="cart-outline"
                size={24}
                color={SHOPEE_COLORS.text}
              />
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
            renderItem={({ item }) => (
              <Image
                source={typeof item === "string" ? { uri: item } : item}
                style={styles.productImage}
                resizeMode="cover"
              />
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
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? SHOPEE_COLORS.primary : "#fff"}
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
              <Ionicons name="star" size={14} color={SHOPEE_COLORS.star} />
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

        {/* Vouchers */}
        <TouchableOpacity style={styles.section} activeOpacity={0.7}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mã Giảm Giá Của Shop</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={SHOPEE_COLORS.textSecondary}
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
              color={SHOPEE_COLORS.freeShip}
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
              color={SHOPEE_COLORS.textSecondary}
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
                color={SHOPEE_COLORS.textSecondary}
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
                color={SHOPEE_COLORS.primary}
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
                color={SHOPEE_COLORS.primary}
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
                color={SHOPEE_COLORS.primary}
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
                  color={SHOPEE_COLORS.star}
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
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Image
                source={{ uri: review.avatar }}
                style={styles.reviewAvatar}
              />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? "star" : "star-outline"}
                      size={12}
                      color={SHOPEE_COLORS.star}
                    />
                  ))}
                </View>
                <Text style={styles.reviewDate}>
                  {review.date} | Phân loại: {review.variant}
                </Text>
                <Text style={styles.reviewText}>{review.content}</Text>
                {review.images.length > 0 && (
                  <View style={styles.reviewImages}>
                    {review.images.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: img }}
                        style={styles.reviewImage}
                      />
                    ))}
                  </View>
                )}
                <TouchableOpacity style={styles.reviewLike}>
                  <Ionicons
                    name="thumbs-up-outline"
                    size={14}
                    color={SHOPEE_COLORS.textSecondary}
                  />
                  <Text style={styles.reviewLikeText}>
                    Hữu ích ({review.likes})
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
            data={similarProducts}
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
            color={SHOPEE_COLORS.primary}
          />
          <Text style={styles.bottomActionText}>Chat</Text>
        </TouchableOpacity>
        <View style={styles.bottomDivider} />
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => router.push("/cart")}
        >
          <View>
            <Ionicons
              name="cart-outline"
              size={22}
              color={SHOPEE_COLORS.primary}
            />
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
                <Ionicons
                  name="close"
                  size={24}
                  color={SHOPEE_COLORS.textSecondary}
                />
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
                      color={
                        quantity <= 1
                          ? SHOPEE_COLORS.textTertiary
                          : SHOPEE_COLORS.text
                      }
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Ionicons name="add" size={20} color={SHOPEE_COLORS.text} />
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
  container: { flex: 1, backgroundColor: SHOPEE_COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SHOPEE_COLORS.background,
    gap: 16,
  },
  loadingText: { fontSize: 16, color: SHOPEE_COLORS.textSecondary },
  errorText: {
    fontSize: 18,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: SHOPEE_COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: SHOPEE_COLORS.surface,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: SHOPEE_COLORS.divider,
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
    color: SHOPEE_COLORS.text,
    marginHorizontal: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: SHOPEE_COLORS.primary,
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
    backgroundColor: SHOPEE_COLORS.primary,
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
    backgroundColor: SHOPEE_COLORS.surface,
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
    backgroundColor: SHOPEE_COLORS.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SHOPEE_COLORS.textTertiary,
    marginHorizontal: 3,
  },
  dotActive: { width: 18, backgroundColor: SHOPEE_COLORS.primary },
  priceSection: {
    backgroundColor: SHOPEE_COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  priceRow: { flexDirection: "row", alignItems: "flex-end" },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: SHOPEE_COLORS.primary,
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: SHOPEE_COLORS.primary,
  },
  discountBadge: {
    backgroundColor: SHOPEE_COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginLeft: 8,
    marginBottom: 4,
  },
  discountText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  originalPrice: {
    fontSize: 14,
    color: SHOPEE_COLORS.textSecondary,
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: SHOPEE_COLORS.text,
    marginTop: 8,
    lineHeight: 22,
  },
  soldRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, color: SHOPEE_COLORS.text, marginLeft: 4 },
  dividerDot: { marginHorizontal: 8, color: SHOPEE_COLORS.textTertiary },
  soldText: { fontSize: 14, color: SHOPEE_COLORS.textSecondary },
  section: {
    backgroundColor: SHOPEE_COLORS.surface,
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
  sectionTitle: { fontSize: 16, fontWeight: "600", color: SHOPEE_COLORS.text },
  vouchersScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  voucherItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#FFE0E0",
    overflow: "hidden",
  },
  voucherLeft: { padding: 10 },
  voucherDiscount: {
    fontSize: 14,
    fontWeight: "600",
    color: SHOPEE_COLORS.voucher,
  },
  voucherMin: {
    fontSize: 11,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 2,
  },
  voucherDivider: { width: 1, height: "70%", backgroundColor: "#FFE0E0" },
  voucherButton: { paddingHorizontal: 16, paddingVertical: 8 },
  voucherButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: SHOPEE_COLORS.voucher,
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
    color: SHOPEE_COLORS.freeShip,
  },
  shippingDetail: { fontSize: 13, color: SHOPEE_COLORS.textSecondary },
  locationText: { fontSize: 14, color: SHOPEE_COLORS.text },
  deliveryTime: {
    fontSize: 13,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 2,
  },
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  variantLabel: { fontSize: 14, color: SHOPEE_COLORS.textSecondary },
  variantValue: { flexDirection: "row", alignItems: "center" },
  variantText: { fontSize: 14, color: SHOPEE_COLORS.text, marginRight: 4 },
  shopSection: {
    backgroundColor: SHOPEE_COLORS.surface,
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
    borderColor: SHOPEE_COLORS.border,
  },
  shopDetails: { flex: 1, marginLeft: 12 },
  shopNameRow: { flexDirection: "row", alignItems: "center" },
  mallBadge: {
    backgroundColor: SHOPEE_COLORS.mall,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 8,
  },
  mallText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  shopName: { fontSize: 16, fontWeight: "600", color: SHOPEE_COLORS.text },
  shopStats: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  shopStat: { fontSize: 12, color: SHOPEE_COLORS.textSecondary },
  shopStatValue: { color: SHOPEE_COLORS.primary, fontWeight: "600" },
  shopStatDivider: { marginHorizontal: 8, color: SHOPEE_COLORS.textTertiary },
  shopActions: { flexDirection: "row", marginTop: 16, gap: 12 },
  shopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SHOPEE_COLORS.primary,
    gap: 6,
  },
  shopButtonOutline: { backgroundColor: "transparent" },
  shopButtonTextOutline: {
    fontSize: 14,
    fontWeight: "600",
    color: SHOPEE_COLORS.primary,
  },
  shopMoreStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: SHOPEE_COLORS.divider,
  },
  shopMoreStat: { flex: 1, alignItems: "center" },
  shopMoreValue: {
    fontSize: 16,
    fontWeight: "600",
    color: SHOPEE_COLORS.primary,
  },
  shopMoreLabel: {
    fontSize: 12,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 2,
  },
  detailsGrid: { marginTop: 12 },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SHOPEE_COLORS.divider,
  },
  detailLabel: { width: 120, fontSize: 14, color: SHOPEE_COLORS.textSecondary },
  detailValue: { flex: 1, fontSize: 14, color: SHOPEE_COLORS.text },
  description: {
    fontSize: 14,
    color: SHOPEE_COLORS.text,
    lineHeight: 22,
    marginTop: 12,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAllButton: { flexDirection: "row", alignItems: "center" },
  viewAllText: { fontSize: 14, color: SHOPEE_COLORS.primary },
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
    color: SHOPEE_COLORS.primary,
  },
  ratingBigMax: { fontSize: 16, color: SHOPEE_COLORS.primary },
  ratingStars: { flexDirection: "row", alignItems: "center" },
  reviewCountText: {
    fontSize: 13,
    color: SHOPEE_COLORS.textSecondary,
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
    borderColor: SHOPEE_COLORS.border,
    marginRight: 8,
  },
  filterChipActive: {
    borderColor: SHOPEE_COLORS.primary,
    backgroundColor: "#FFF5F5",
  },
  filterChipText: { fontSize: 13, color: SHOPEE_COLORS.textSecondary },
  filterChipTextActive: { color: SHOPEE_COLORS.primary },
  reviewItem: {
    flexDirection: "row",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: SHOPEE_COLORS.divider,
  },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewContent: { flex: 1, marginLeft: 12 },
  reviewUser: { fontSize: 13, fontWeight: "500", color: SHOPEE_COLORS.text },
  reviewRating: { flexDirection: "row", marginTop: 4 },
  reviewDate: { fontSize: 12, color: SHOPEE_COLORS.textTertiary, marginTop: 4 },
  reviewText: {
    fontSize: 14,
    color: SHOPEE_COLORS.text,
    lineHeight: 20,
    marginTop: 8,
  },
  reviewImages: { flexDirection: "row", marginTop: 12, gap: 8 },
  reviewImage: { width: 80, height: 80, borderRadius: 4 },
  reviewLike: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  reviewLikeText: {
    fontSize: 12,
    color: SHOPEE_COLORS.textSecondary,
    marginLeft: 6,
  },
  similarProduct: { width: 140, marginRight: 12 },
  similarImage: {
    width: 140,
    height: 140,
    borderRadius: 4,
    backgroundColor: SHOPEE_COLORS.background,
  },
  similarName: {
    fontSize: 13,
    color: SHOPEE_COLORS.text,
    marginTop: 8,
    height: 36,
  },
  similarPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: SHOPEE_COLORS.primary,
    marginTop: 4,
  },
  similarSoldText: {
    fontSize: 11,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SHOPEE_COLORS.surface,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: SHOPEE_COLORS.divider,
  },
  bottomAction: { alignItems: "center", paddingHorizontal: 12 },
  bottomActionText: {
    fontSize: 10,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 2,
  },
  bottomDivider: {
    width: 1,
    height: 32,
    backgroundColor: SHOPEE_COLORS.divider,
  },
  bottomCartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: SHOPEE_COLORS.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomCartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  addToCartBtn: {
    flex: 1,
    backgroundColor: SHOPEE_COLORS.primaryLight,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 12,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  addToCartText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  buyNowBtn: {
    flex: 1,
    backgroundColor: SHOPEE_COLORS.primary,
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
    backgroundColor: SHOPEE_COLORS.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: SHOPEE_COLORS.divider,
  },
  modalImage: { width: 100, height: 100, borderRadius: 4 },
  modalInfo: { flex: 1, marginLeft: 12, justifyContent: "flex-end" },
  modalPrice: { fontSize: 20, fontWeight: "700", color: SHOPEE_COLORS.primary },
  modalStock: {
    fontSize: 13,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 4,
  },
  modalClose: { position: "absolute", top: 12, right: 12 },
  modalBody: { padding: 16 },
  modalSection: { marginBottom: 20 },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: SHOPEE_COLORS.text,
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
    borderColor: SHOPEE_COLORS.border,
    gap: 8,
  },
  variantOptionActive: {
    borderColor: SHOPEE_COLORS.primary,
    backgroundColor: "#FFF5F5",
  },
  variantOptionText: { fontSize: 14, color: SHOPEE_COLORS.text },
  variantOptionTextActive: { color: SHOPEE_COLORS.primary },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SHOPEE_COLORS.border,
  },
  quantityRow: { flexDirection: "row", alignItems: "center" },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SHOPEE_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "500",
    color: SHOPEE_COLORS.text,
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: "center",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: SHOPEE_COLORS.divider,
  },
  modalAddBtn: {
    backgroundColor: SHOPEE_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  modalAddBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
