/**
 * Product Detail Screen - Shopee Style
 * Hiển thị chi tiết sản phẩm với seller info thật từ API
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    ProductReview as ComponentReview,
    ProductReviewCard,
    ReviewSummary,
} from "@/components/product/ProductReviewCard";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/FavoritesContext";
import { PRODUCTS } from "@/data/products";
import { apiFetch } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ===================== TYPES =====================
interface ProductImage {
  id: string;
  url: string;
}

interface ProductSeller {
  id: number;
  name: string;
  avatar?: string;
  isOfficial?: boolean;
  rating?: number;
  responseRate?: number;
  productCount?: number;
  followerCount?: number;
  location?: string;
  joinDate?: string;
}

interface ProductReviewLocal {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  likes?: number;
  sellerReply?: {
    content: string;
    createdAt: string;
  };
}

// Convert local review to component format
function toComponentReview(review: ProductReviewLocal): ComponentReview {
  return {
    id: review.id,
    author: {
      id: String(review.userId),
      name: review.userName,
      avatar: review.userAvatar,
    },
    rating: review.rating,
    content: review.comment,
    images: review.images?.map((url, i) => ({ id: String(i), uri: url })),
    createdAt: review.createdAt,
    likes: review.likes,
    sellerReply: review.sellerReply,
  };
}

interface ProductDetail {
  id: number | string;
  name: string;
  description?: string;
  price: number | string;
  originalPrice?: number;
  discount?: number;
  images?: ProductImage[];
  image?: any;
  category?: string;
  stock?: number;
  soldCount?: number;
  rating?: number;
  reviewCount?: number;
  seller?: ProductSeller;
  specifications?: Record<string, string>;
  variants?: { name: string; options: string[] }[];
  freeShipping?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  flashSale?: boolean;
}

// ===================== HELPERS =====================
function formatPrice(price: number | string): string {
  const numPrice =
    typeof price === "string" ? parseFloat(price.replace(/[^\d]/g, "")) : price;
  if (isNaN(numPrice)) return String(price);
  return "₫" + numPrice.toLocaleString("vi-VN");
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

// ===================== IMAGE GALLERY =====================
function ImageGallery({
  images,
  legacyImage,
  discount,
  isNew,
}: {
  images?: ProductImage[];
  legacyImage?: any;
  discount?: number;
  isNew?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryImages =
    images && images.length > 0
      ? images
      : legacyImage
        ? [
            {
              id: "1",
              url:
                typeof legacyImage === "string"
                  ? legacyImage
                  : legacyImage.uri || "https://picsum.photos/400",
            },
          ]
        : [{ id: "1", url: "https://picsum.photos/400/400" }];

  return (
    <View style={styles.galleryContainer}>
      <FlatList
        data={galleryImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Image
            source={typeof item.url === "string" ? { uri: item.url } : item.url}
            style={styles.galleryImage}
            contentFit="cover"
            transition={200}
          />
        )}
        keyExtractor={(item) => item.id}
      />

      {discount && discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discount}%</Text>
        </View>
      )}
      {isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>MỚI</Text>
        </View>
      )}

      <View style={styles.pagination}>
        <View style={styles.paginationBadge}>
          <Text style={styles.paginationText}>
            {activeIndex + 1}/{galleryImages.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ===================== MAIN COMPONENT =====================
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<ProductReviewLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      const response = await apiFetch<{ data: ProductDetail }>(
        `/products/${id}`,
      );
      if (response?.data) {
        let productData = response.data;

        // If product doesn't have seller info, fetch seller separately
        if (!productData.seller && (productData as any).sellerId) {
          try {
            const sellerRes = await apiFetch(
              `/users/${(productData as any).sellerId}`,
            );
            if (sellerRes?.data || sellerRes) {
              const sellerData = sellerRes.data || sellerRes;
              productData.seller = {
                id: sellerData.id,
                name: sellerData.name || sellerData.businessName || "Người bán",
                avatar:
                  sellerData.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerData.name || "S")}&size=80&background=FF6B35&color=fff`,
                isOfficial:
                  sellerData.verified || sellerData.isOfficial || false,
                rating: sellerData.rating || 4.5,
                responseRate: sellerData.responseRate || 95,
                productCount:
                  sellerData.productCount || sellerData.productsCount || 0,
                followerCount:
                  sellerData.followersCount || sellerData.followerCount || 0,
                location:
                  sellerData.address || sellerData.location || "Việt Nam",
              };
            }
          } catch (e) {
            console.log("[Product] Could not fetch seller info");
          }
        }

        setProduct(productData);
        if (productData.variants) {
          const defaults: Record<string, string> = {};
          productData.variants.forEach((v) => {
            if (v.options.length > 0) defaults[v.name] = v.options[0];
          });
          setSelectedVariants(defaults);
        }
        return;
      }
    } catch (error) {
      console.log("API fetch failed, using local data");
    }

    const localProduct = PRODUCTS.find((p) => p.id === id);
    if (localProduct) {
      setProduct({
        ...localProduct,
        seller: {
          id: 1,
          name: "Premium Store",
          avatar:
            "https://ui-avatars.com/api/?name=Premium+Store&size=80&background=FF6B35&color=fff",
          isOfficial: true,
          rating: 4.9,
          responseRate: 98,
          productCount: 156,
          followerCount: 12500,
          location: "TP. Hồ Chí Minh",
        },
        soldCount: Math.floor(Math.random() * 5000) + 100,
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 500) + 10,
        freeShipping: Math.random() > 0.5,
      });
    }
  }, [id]);

  const fetchRelated = useCallback(async () => {
    try {
      const response = await apiFetch<{ data: any[] }>(
        `/products?limit=6&exclude=${id}`,
      );
      if (response?.data) {
        setRelatedProducts(response.data);
        return;
      }
    } catch (error) {
      console.log("Related products API failed");
    }
    setRelatedProducts(PRODUCTS.filter((p) => p.id !== id).slice(0, 6));
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await apiFetch<{ data: ProductReviewLocal[] }>(
        `/products/${id}/reviews`,
      );
      if (response?.data) {
        setReviews(response.data);
        return;
      }
    } catch (error) {
      console.log("Reviews API failed");
    }
    setReviews([
      {
        id: "1",
        userId: 1,
        userName: "Nguyễn Văn A",
        rating: 5,
        comment: "Sản phẩm rất tốt!",
        createdAt: "2024-01-15",
        likes: 24,
      },
      {
        id: "2",
        userId: 2,
        userName: "Trần Thị B",
        rating: 4,
        comment: "Chất lượng ổn.",
        createdAt: "2024-01-10",
        likes: 12,
      },
    ]);
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProduct(), fetchRelated(), fetchReviews()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProduct, fetchRelated, fetchReviews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProduct(), fetchRelated(), fetchReviews()]);
    setRefreshing(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const priceNum =
      typeof product.price === "string"
        ? parseInt(product.price.replace(/[^\d]/g, ""))
        : product.price;
    addToCart(
      {
        id: String(product.id),
        name: product.name,
        price: priceNum,
        image: product.images?.[0]?.url
          ? { uri: product.images[0].url }
          : product.image,
        description: product.description || "",
        category: product.category || "",
      },
      quantity,
    );
    router.push("/cart");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `${product.name} - ${formatPrice(product.price)}`,
        url: `https://baotienweb.cloud/product/${id}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    if (isFavorite(String(product.id))) {
      removeFavorite(String(product.id));
    } else {
      addFavorite({
        id: String(product.id),
        name: product.name,
        price:
          typeof product.price === "number"
            ? product.price
            : parseInt(product.price.replace(/[^\d]/g, "")),
        image:
          product.images?.[0]?.url ||
          (typeof product.image === "string"
            ? product.image
            : product.image?.uri) ||
          "",
        type: "product",
      });
    }
  };

  const handleChatSeller = () => {
    if (product?.seller) router.push(`/chat/${product.seller.id}` as Href);
  };

  const handleViewShop = () => {
    if (product?.seller) router.push(`/profile/${product.seller.id}` as Href);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#EE4D2D" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priceNum =
    typeof product.price === "string"
      ? parseInt(product.price.replace(/[^\d]/g, ""))
      : product.price;
  const discountPercent =
    product.discount ||
    (product.originalPrice
      ? Math.round(
          ((product.originalPrice - priceNum) / product.originalPrice) * 100,
        )
      : 0);
  const seller = product.seller || {
    id: 1,
    name: "Premium Store",
    avatar:
      "https://ui-avatars.com/api/?name=PS&size=80&background=FF6B35&color=fff",
    isOfficial: true,
    rating: 4.9,
    responseRate: 98,
    productCount: 156,
    followerCount: 12500,
    location: "TP. Hồ Chí Minh",
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/cart")}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Image Gallery */}
        <ImageGallery
          images={product.images}
          legacyImage={product.image}
          discount={discountPercent}
          isNew={product.isNew}
        />

        {/* Price */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
            {discountPercent > 0 && (
              <View style={styles.discountBadgeSmall}>
                <Text style={styles.discountTextSmall}>
                  -{discountPercent}%
                </Text>
              </View>
            )}
          </View>
          {product.freeShipping && (
            <View style={styles.freeShipBadge}>
              <Ionicons name="car-outline" size={14} color="#00BFA5" />
              <Text style={styles.freeShipText}>Miễn phí vận chuyển</Text>
            </View>
          )}
        </View>

        {/* Product Name */}
        <View style={styles.nameSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFAA00" />
              <Text style={styles.statText}>
                {(product.rating || 4.5).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.statDivider}>|</Text>
            <Text style={styles.statText}>
              Đã bán {formatNumber(product.soldCount || 0)}
            </Text>
            <Text style={styles.statDivider}>|</Text>
            <Text style={styles.statText}>
              {product.reviewCount || 0} đánh giá
            </Text>
          </View>
        </View>

        {/* Vouchers */}
        <View style={styles.voucherSection}>
          <Text style={styles.voucherLabel}>Mã giảm giá</Text>
          <View style={styles.voucherList}>
            <View style={styles.voucherItem}>
              <Text style={styles.voucherText}>Giảm ₫10k</Text>
            </View>
            <View style={styles.voucherItem}>
              <Text style={styles.voucherText}>Giảm 5%</Text>
            </View>
            <View style={styles.voucherItem}>
              <Text style={styles.voucherText}>Freeship</Text>
            </View>
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Số lượng</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() =>
                setQuantity(Math.min(product.stock || 99, quantity + 1))
              }
            >
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.stockText}>
              Còn {product.stock || 99} sản phẩm
            </Text>
          </View>
        </View>

        {/* Seller Section */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerHeader}>
            <Image
              source={{
                uri:
                  seller.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&size=80&background=FF6B35&color=fff`,
              }}
              style={styles.sellerAvatar}
              contentFit="cover"
            />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                {seller.isOfficial && (
                  <View style={styles.mallBadge}>
                    <Text style={styles.mallBadgeText}>Mall</Text>
                  </View>
                )}
                <Text style={styles.sellerName}>{seller.name}</Text>
              </View>
              <Text style={styles.sellerLocation}>
                {seller.location || "TP. Hồ Chí Minh"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewShopBtn}
              onPress={handleViewShop}
            >
              <Text style={styles.viewShopText}>Xem Shop</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sellerStats}>
            <View style={styles.sellerStatItem}>
              <Text style={styles.sellerStatValue}>
                {formatNumber(seller.productCount || 0)}
              </Text>
              <Text style={styles.sellerStatLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.sellerStatItem}>
              <Text style={styles.sellerStatValue}>
                {(seller.rating || 4.8).toFixed(1)}
              </Text>
              <Text style={styles.sellerStatLabel}>Đánh giá</Text>
            </View>
            <View style={styles.sellerStatItem}>
              <Text style={styles.sellerStatValue}>
                {seller.responseRate || 95}%
              </Text>
              <Text style={styles.sellerStatLabel}>Phản hồi</Text>
            </View>
            <View style={styles.sellerStatItem}>
              <Text style={styles.sellerStatValue}>
                {formatNumber(seller.followerCount || 0)}
              </Text>
              <Text style={styles.sellerStatLabel}>Theo dõi</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "details" && styles.tabActive]}
            onPress={() => setActiveTab("details")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "details" && styles.tabTextActive,
              ]}
            >
              Chi tiết sản phẩm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reviews" && styles.tabTextActive,
              ]}
            >
              Đánh giá ({product.reviewCount || reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "details" ? (
          <View style={styles.detailsContent}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descriptionText}>
              {product.description ||
                "Sản phẩm chất lượng cao với thiết kế hiện đại, phù hợp cho mọi không gian."}
            </Text>
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <View style={styles.specsSection}>
                  <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <View key={key} style={styles.specRow}>
                        <Text style={styles.specLabel}>{key}</Text>
                        <Text style={styles.specValue}>{value}</Text>
                      </View>
                    ),
                  )}
                </View>
              )}
          </View>
        ) : (
          <View style={styles.reviewsContent}>
            <ReviewSummary
              totalReviews={product.reviewCount || reviews.length}
              averageRating={product.rating || 4.5}
              ratingDistribution={{ 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 }}
            />
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ProductReviewCard
                  key={review.id}
                  review={toComponentReview(review)}
                />
              ))
            ) : (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyReviewsText}>
                  Chưa có đánh giá nào
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedItem}
                  onPress={() =>
                    router.push(`/shopping/product/${item.id}` as Href)
                  }
                >
                  <Image
                    source={
                      item.images?.[0]?.url
                        ? { uri: item.images[0].url }
                        : item.image
                    }
                    style={styles.relatedImage}
                    contentFit="cover"
                  />
                  <Text style={styles.relatedName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.relatedPrice}>
                    {formatPrice(item.price)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleChatSeller}>
          <Ionicons name="chatbubble-outline" size={22} color="#EE4D2D" />
          <Text style={styles.bottomBtnText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={isFavorite(String(product.id)) ? "heart" : "heart-outline"}
            size={22}
            color="#EE4D2D"
          />
          <Text style={styles.bottomBtnText}>Yêu thích</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.addToCartBtn]}
          onPress={handleAddToCart}
        >
          <Text style={styles.actionBtnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.buyNowBtn]}
          onPress={handleBuyNow}
        >
          <Text style={styles.actionBtnTextWhite}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  errorText: { marginTop: 12, fontSize: 16, color: "#666" },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#EE4D2D",
    borderRadius: 8,
  },
  backButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  headerRight: { flexDirection: "row" },
  galleryContainer: { position: "relative" },
  galleryImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 0,
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  discountText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#00BFA5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  pagination: { position: "absolute", bottom: 12, right: 12 },
  paginationBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paginationText: { color: "#fff", fontSize: 12 },
  priceSection: { backgroundColor: "#fff", padding: 12 },
  priceRow: { flexDirection: "row", alignItems: "center" },
  currentPrice: { fontSize: 24, fontWeight: "700", color: "#EE4D2D" },
  originalPrice: {
    fontSize: 14,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  discountBadgeSmall: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  discountTextSmall: { color: "#EE4D2D", fontSize: 12, fontWeight: "600" },
  freeShipBadge: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  freeShipText: { color: "#00BFA5", fontSize: 12, marginLeft: 4 },
  nameSection: { backgroundColor: "#fff", padding: 12, marginTop: 8 },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
    lineHeight: 22,
  },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  statItem: { flexDirection: "row", alignItems: "center" },
  statText: { fontSize: 12, color: "#666", marginLeft: 4 },
  statDivider: { color: "#D1D5DB", marginHorizontal: 8 },
  voucherSection: {
    backgroundColor: "#fff",
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  voucherLabel: { fontSize: 12, color: "#666", marginRight: 12 },
  voucherList: { flexDirection: "row", flex: 1 },
  voucherItem: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EE4D2D",
    marginRight: 8,
  },
  voucherText: { color: "#EE4D2D", fontSize: 11 },
  quantitySection: {
    backgroundColor: "#fff",
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityLabel: { fontSize: 14, color: "#222" },
  quantityControls: { flexDirection: "row", alignItems: "center" },
  quantityBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    color: "#222",
    minWidth: 40,
    textAlign: "center",
  },
  stockText: { fontSize: 12, color: "#9CA3AF", marginLeft: 16 },
  sellerSection: { backgroundColor: "#fff", padding: 12, marginTop: 8 },
  sellerHeader: { flexDirection: "row", alignItems: "center" },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sellerInfo: { flex: 1, marginLeft: 12 },
  sellerNameRow: { flexDirection: "row", alignItems: "center" },
  mallBadge: {
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 6,
  },
  mallBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  sellerName: { fontSize: 14, fontWeight: "600", color: "#222" },
  sellerLocation: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  viewShopBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#EE4D2D",
    borderRadius: 4,
  },
  viewShopText: { color: "#EE4D2D", fontSize: 12, fontWeight: "600" },
  sellerStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  sellerStatItem: { flex: 1, alignItems: "center" },
  sellerStatValue: { fontSize: 14, fontWeight: "600", color: "#EE4D2D" },
  sellerStatLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#EE4D2D" },
  tabText: { fontSize: 14, color: "#666" },
  tabTextActive: { color: "#EE4D2D", fontWeight: "600" },
  detailsContent: { backgroundColor: "#fff", marginTop: 8, padding: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 12,
  },
  descriptionText: { fontSize: 14, color: "#666", lineHeight: 22 },
  specsSection: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
    marginTop: 16,
  },
  specRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  specLabel: { flex: 1, fontSize: 13, color: "#9CA3AF" },
  specValue: { flex: 1, fontSize: 13, color: "#222", textAlign: "right" },
  reviewsContent: { backgroundColor: "#fff", marginTop: 8, padding: 12 },
  emptyReviews: { alignItems: "center", paddingVertical: 40 },
  emptyReviewsText: { fontSize: 14, color: "#9CA3AF", marginTop: 12 },
  relatedSection: {
    backgroundColor: "#fff",
    marginTop: 8,
    paddingVertical: 12,
  },
  relatedItem: { marginLeft: 12, width: 140 },
  relatedImage: { width: 140, height: 140, borderRadius: 8 },
  relatedName: { fontSize: 12, color: "#222", marginTop: 8 },
  relatedPrice: {
    fontSize: 14,
    color: "#EE4D2D",
    fontWeight: "600",
    marginTop: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  bottomBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  bottomBtnText: { fontSize: 10, color: "#666", marginTop: 2 },
  actionBtn: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginLeft: 8,
  },
  addToCartBtn: {
    backgroundColor: "#FFEEE8",
    borderWidth: 1,
    borderColor: "#EE4D2D",
  },
  buyNowBtn: { backgroundColor: "#EE4D2D" },
  actionBtnText: { color: "#EE4D2D", fontSize: 14, fontWeight: "600" },
  actionBtnTextWhite: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
