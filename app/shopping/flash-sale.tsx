import {
    getFlashSaleProducts,
    type Product,
} from "@/services/api/products.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

const COLORS = {
  primary: "#EE4D2D",
  white: "#FFFFFF",
  bg: "#F5F5F5",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  yellow: "#FFB800",
};

export default function FlashSaleScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 45,
    seconds: 32,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
              minutes = 59;
              seconds = 59;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getFlashSaleProducts(20);
      setProducts(data);
    } catch (error) {
      console.error("[FlashSale] Error loading products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";
  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return Math.round(price * (1 - discount / 100));
  };

  const renderProductCard = (product: Product) => {
    const originalPrice = product.price;
    const salePrice = getDiscountedPrice(
      originalPrice,
      product.discountPercent,
    );
    const sold = product.soldCount || Math.floor(Math.random() * 200) + 50;
    const stock = product.stock || 50;
    const progress = (sold / (sold + stock)) * 100;
    const rating = product.rating || (4 + Math.random()).toFixed(1);
    const ratingCount = Math.floor(Math.random() * 500) + 50;
    const deliveryDays = ["1-2 ngày", "2-3 ngày", "3-5 ngày"][
      Math.floor(Math.random() * 3)
    ];
    const locations = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương"];
    const location = locations[Math.floor(Math.random() * locations.length)];

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        onPress={() => router.push(`/product/${product.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {/* Voucher Badge */}
          {Math.random() > 0.5 && (
            <View style={styles.voucherBadge}>
              <Text style={styles.voucherText}>2.2</Text>
              <Text style={styles.voucherLabel}>VOUCHER</Text>
            </View>
          )}

          {/* Discount Badge */}
          {product.discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{product.discountPercent}%
              </Text>
            </View>
          )}

          {/* Product Image */}
          {product.image?.uri ? (
            <Image
              source={{ uri: product.image.uri }}
              style={styles.productImage}
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons
                name="cube-outline"
                size={40}
                color={COLORS.textLight}
              />
            </View>
          )}

          {/* Free Ship Badge */}
          {Math.random() > 0.4 && (
            <View style={styles.freeShipBadge}>
              <Ionicons name="car-outline" size={10} color="#00AA00" />
              <Text style={styles.freeShipText}>Miễn phí</Text>
            </View>
          )}
        </View>

        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={COLORS.yellow} />
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.ratingCount}>({ratingCount})</Text>
            <Text style={styles.soldText}>
              Đã bán {sold >= 1000 ? `${(sold / 1000).toFixed(1)}k` : sold}
            </Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>{formatPrice(salePrice)}</Text>
          {product.discountPercent && (
            <Text style={styles.originalPrice}>
              {formatPrice(originalPrice)}
            </Text>
          )}

          {/* Delivery */}
          <View style={styles.deliveryRow}>
            <Ionicons name="time-outline" size={10} color={COLORS.textLight} />
            <Text style={styles.deliveryText}>{deliveryDays}</Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={10}
              color={COLORS.textLight}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={["#FF6B35", "#EE4D2D"] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBar,
                { width: `${Math.min(progress, 100)}%` },
              ]}
            />
            <Text style={styles.progressText}>
              {progress >= 80 ? "SẮP HẾT" : `Đã bán ${sold}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#EE4D2D", "#FF6B35"] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚡ Flash Sale</Text>
        <View style={styles.productCount}>
          <Text style={styles.productCountText}>{products.length} SP</Text>
        </View>
      </LinearGradient>

      {/* Countdown */}
      <LinearGradient
        colors={["#FF6B35", "#EE4D2D"] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.countdownRow}
      >
        <Ionicons name="flash" size={18} color={COLORS.yellow} />
        <Text style={styles.countdownLabel}>Kết thúc sau</Text>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>
            {String(countdown.hours).padStart(2, "0")}
          </Text>
        </View>
        <Text style={styles.timerSeparator}>:</Text>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>
            {String(countdown.minutes).padStart(2, "0")}
          </Text>
        </View>
        <Text style={styles.timerSeparator}>:</Text>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>
            {String(countdown.seconds).padStart(2, "0")}
          </Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải Flash Sale...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.productsGrid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              colors={[COLORS.primary]}
            />
          }
        >
          <View style={styles.gridRow}>
            {products.map((product, index) => (
              <View
                key={product.id}
                style={index % 2 === 1 ? styles.rightCard : undefined}
              >
                {renderProductCard(product)}
              </View>
            ))}
          </View>

          {products.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="flash-off-outline"
                size={64}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyTitle}>Chưa có sản phẩm Flash Sale</Text>
              <Text style={styles.emptySubtitle}>
                Quay lại sau để xem các ưu đãi hấp dẫn
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  productCount: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productCountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  countdownLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  timerBox: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 30,
    alignItems: "center",
  },
  timerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
  },
  timerSeparator: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textLight,
  },
  scrollView: { flex: 1 },
  productsGrid: {
    padding: 12,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  rightCard: {
    marginLeft: 0,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: { position: "relative" },
  voucherBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderBottomRightRadius: 8,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  voucherText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "bold",
  },
  voucherLabel: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "600",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  freeShipBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#E8FFE8",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: "#00AA00",
    zIndex: 1,
  },
  freeShipText: {
    color: "#00AA00",
    fontSize: 8,
    fontWeight: "600",
  },
  productImage: {
    width: "100%",
    height: CARD_WIDTH,
    backgroundColor: COLORS.border,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  productContent: { padding: 10 },
  productName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
    height: 34,
    lineHeight: 17,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  ratingCount: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  soldText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginLeft: "auto",
  },
  price: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },
  originalPrice: {
    color: COLORS.textLight,
    fontSize: 11,
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 3,
  },
  deliveryText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 3,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.textLight,
    flex: 1,
  },
  progressContainer: {
    height: 18,
    backgroundColor: "#FFE0E0",
    borderRadius: 9,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
  },
  progressText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  emptySubtitle: {
    marginTop: 8,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
