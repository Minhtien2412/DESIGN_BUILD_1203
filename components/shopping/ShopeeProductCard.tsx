/**
 * ShopeeProductCard - Product Card theo chuẩn Shopee
 * Bao gồm thông tin seller mini badge
 *
 * Features:
 * - Product image với discount badge, new badge
 * - Seller mini info (avatar + name)
 * - Rating, sold count
 * - Price với original price
 * - Mall badge cho official seller
 * - Free shipping badge
 * - Flash sale indicator
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

// ===================== TYPES =====================
export interface ProductSeller {
  id: string;
  name: string;
  avatar?: string;
  isOfficial?: boolean;
  location?: string;
}

export interface ShopeeProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFlashSale?: boolean;
  flashSaleEndTime?: string;
  freeShipping?: boolean;
  voucherDiscount?: string; // e.g., "Giảm ₫10k"
  seller?: ProductSeller;
  category?: string;
  stock?: number;
}

interface ShopeeProductCardProps {
  product: ShopeeProduct;
  variant?: "default" | "horizontal" | "compact";
  showSeller?: boolean;
  onPress?: () => void;
  onFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

// ===================== HELPERS =====================
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "k";
  return num.toString();
}

function formatPrice(price: number): string {
  return "₫" + price.toLocaleString("vi-VN");
}

// ===================== COMPONENT =====================
export function ShopeeProductCard({
  product,
  variant = "default",
  showSeller = true,
  onPress,
  onFavorite,
  isFavorite = false,
}: ShopeeProductCardProps) {
  const discountPercent =
    product.discount ||
    (product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${product.id}` as Href);
    }
  };

  const handleSellerPress = (e: any) => {
    e.stopPropagation();
    if (product.seller) {
      router.push(`/profile/${product.seller.id}/shop` as Href);
    }
  };

  if (variant === "horizontal") {
    return <HorizontalCard product={product} onPress={handlePress} />;
  }

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>
              -{discountPercent}%
            </ThemedText>
          </View>
        )}

        {/* New Badge */}
        {product.isNew && (
          <View style={styles.newBadge}>
            <ThemedText style={styles.newBadgeText}>MỚI</ThemedText>
          </View>
        )}

        {/* Bestseller Badge */}
        {product.isBestseller && !product.isNew && (
          <View style={styles.bestsellerBadge}>
            <Ionicons name="flame" size={10} color="#FFFFFF" />
            <ThemedText style={styles.bestsellerText}>Hot</ThemedText>
          </View>
        )}

        {/* Flash Sale Badge */}
        {product.isFlashSale && (
          <View style={styles.flashSaleBadge}>
            <Ionicons name="flash" size={10} color="#FFFFFF" />
            <ThemedText style={styles.flashSaleText}>Flash Sale</ThemedText>
          </View>
        )}

        {/* Favorite Button */}
        <Pressable
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onFavorite?.(product.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#EE4D2D" : "#FFFFFF"}
          />
        </Pressable>

        {/* Stock Warning */}
        {product.stock !== undefined &&
          product.stock > 0 &&
          product.stock <= 5 && (
            <View style={styles.stockWarning}>
              <ThemedText style={styles.stockWarningText}>
                Còn {product.stock}
              </ThemedText>
            </View>
          )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Seller Mini Badge */}
        {showSeller && product.seller && (
          <Pressable style={styles.sellerMini} onPress={handleSellerPress}>
            {product.seller.isOfficial && (
              <View style={styles.mallMini}>
                <ThemedText style={styles.mallMiniText}>Mall</ThemedText>
              </View>
            )}
            {product.seller.avatar ? (
              <Image
                source={{ uri: product.seller.avatar }}
                style={styles.sellerAvatar}
                contentFit="cover"
              />
            ) : (
              <View
                style={[styles.sellerAvatar, styles.sellerAvatarPlaceholder]}
              >
                <Ionicons name="storefront" size={10} color="#888888" />
              </View>
            )}
            <ThemedText style={styles.sellerName} numberOfLines={1}>
              {product.seller.name}
            </ThemedText>
          </Pressable>
        )}

        {/* Product Name */}
        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>

        {/* Voucher Badge */}
        {product.voucherDiscount && (
          <View style={styles.voucherBadge}>
            <ThemedText style={styles.voucherText}>
              {product.voucherDiscount}
            </ThemedText>
          </View>
        )}

        {/* Free Shipping */}
        {product.freeShipping && (
          <View style={styles.freeShipBadge}>
            <Ionicons name="car-outline" size={10} color="#00AA00" />
            <ThemedText style={styles.freeShipText}>Miễn phí ship</ThemedText>
          </View>
        )}

        {/* Price Row */}
        <View style={styles.priceRow}>
          <ThemedText style={styles.price}>
            {formatPrice(product.price)}
          </ThemedText>
          {product.originalPrice && product.originalPrice > product.price && (
            <ThemedText style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </ThemedText>
          )}
        </View>

        {/* Meta Row - Rating & Sold */}
        <View style={styles.metaRow}>
          {product.rating !== undefined && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#FFAA00" />
              <ThemedText style={styles.ratingText}>
                {product.rating.toFixed(1)}
              </ThemedText>
            </View>
          )}
          {product.soldCount !== undefined && (
            <ThemedText style={styles.soldText}>
              Đã bán {formatNumber(product.soldCount)}
            </ThemedText>
          )}
          {product.seller?.location && (
            <ThemedText style={styles.locationText}>
              {product.seller.location}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ===================== HORIZONTAL VARIANT =====================
function HorizontalCard({
  product,
  onPress,
}: {
  product: ShopeeProduct;
  onPress: () => void;
}) {
  const discountPercent =
    product.discount ||
    (product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0);

  return (
    <Pressable style={styles.horizontalCard} onPress={onPress}>
      {/* Image */}
      <View style={styles.horizontalImageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.horizontalImage}
          contentFit="cover"
        />
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>
              -{discountPercent}%
            </ThemedText>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.horizontalContent}>
        {/* Seller */}
        {product.seller && (
          <View style={styles.sellerMini}>
            {product.seller.isOfficial && (
              <View style={styles.mallMini}>
                <ThemedText style={styles.mallMiniText}>Mall</ThemedText>
              </View>
            )}
            <ThemedText style={styles.sellerName} numberOfLines={1}>
              {product.seller.name}
            </ThemedText>
          </View>
        )}

        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          {product.freeShipping && (
            <View style={styles.freeShipBadge}>
              <ThemedText style={styles.freeShipText}>Free Ship</ThemedText>
            </View>
          )}
          {product.voucherDiscount && (
            <View style={styles.voucherBadge}>
              <ThemedText style={styles.voucherText}>
                {product.voucherDiscount}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Price & Meta */}
        <View style={styles.horizontalFooter}>
          <ThemedText style={styles.price}>
            {formatPrice(product.price)}
          </ThemedText>
          <View style={styles.metaRow}>
            {product.rating !== undefined && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color="#FFAA00" />
                <ThemedText style={styles.ratingText}>
                  {product.rating.toFixed(1)}
                </ThemedText>
              </View>
            )}
            <ThemedText style={styles.soldText}>
              {formatNumber(product.soldCount || 0)} đã bán
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ===================== PRODUCT GRID COMPONENT =====================
interface ProductGridProps {
  products: ShopeeProduct[];
  numColumns?: number;
  showSeller?: boolean;
  onProductPress?: (product: ShopeeProduct) => void;
}

export function ShopeeProductGrid({
  products,
  numColumns = 2,
  showSeller = true,
  onProductPress,
}: ProductGridProps) {
  return (
    <View style={styles.gridContainer}>
      {products.map((product, index) => (
        <View
          key={product.id}
          style={[
            styles.gridItem,
            (index + 1) % numColumns !== 0 && styles.gridItemMargin,
          ]}
        >
          <ShopeeProductCard
            product={product}
            showSeller={showSeller}
            onPress={() => onProductPress?.(product)}
          />
        </View>
      ))}
    </View>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  // Card Container
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Image Section
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  // Badges
  discountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
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
    backgroundColor: "#00C853",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bestsellerBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF6D00",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  bestsellerText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  flashSaleBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#EE4D2D",
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  flashSaleText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  stockWarning: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(238, 77, 45, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  stockWarningText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },

  // Content Section
  content: {
    padding: 10,
    gap: 6,
  },

  // Seller Mini
  sellerMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  mallMini: {
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  mallMiniText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },
  sellerAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sellerAvatarPlaceholder: {
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerName: {
    flex: 1,
    fontSize: 10,
    color: "#888888",
  },

  // Product Name
  productName: {
    fontSize: 13,
    lineHeight: 18,
    color: "#222222",
    minHeight: 36,
  },

  // Voucher & Free Ship
  voucherBadge: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  voucherText: {
    color: "#EE4D2D",
    fontSize: 9,
    fontWeight: "600",
  },
  freeShipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E8FFE8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#00AA00",
  },
  freeShipText: {
    color: "#00AA00",
    fontSize: 9,
    fontWeight: "600",
  },

  // Price Row
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EE4D2D",
  },
  originalPrice: {
    fontSize: 11,
    color: "#999999",
    textDecorationLine: "line-through",
  },

  // Meta Row
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: "#666666",
  },
  soldText: {
    fontSize: 10,
    color: "#888888",
  },
  locationText: {
    fontSize: 10,
    color: "#888888",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },

  // Horizontal Card
  horizontalCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalImageContainer: {
    width: 120,
    height: 120,
    position: "relative",
  },
  horizontalImage: {
    width: "100%",
    height: "100%",
  },
  horizontalContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  horizontalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },
  gridItem: {
    marginBottom: 12,
  },
  gridItemMargin: {
    marginRight: 12,
  },
});

export default ShopeeProductCard;
