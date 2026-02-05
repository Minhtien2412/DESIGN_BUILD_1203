/**
 * Flash Sale Screen - Shopee Style
 * Trang Flash Sale với thiết kế giống Shopee hoàn chỉnh
 * @updated 2025-02-04
 */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
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

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#EE4D2D",
  primaryDark: "#D73211",
  white: "#FFFFFF",
  bg: "#F5F5F5",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  orange: "#FF6B35",
  yellow: "#FFB800",
};

// ============================================================================
// FLASH SALE PRODUCTS - Extended with Shopee-style info
// ============================================================================
interface FlashProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  sold: number;
  remaining: number;
  image: string;
  rating: number;
  ratingCount: number;
  deliveryDays: string;
  location: string;
  voucher?: string;
  isLive?: boolean;
  freeShip?: boolean;
}

const flashSaleProducts: FlashProduct[] = [
  {
    id: "1",
    name: "Gạch lát nền 60x60 cao cấp",
    price: 129000,
    originalPrice: 185000,
    discount: 30,
    sold: 856,
    remaining: 44,
    image: "https://picsum.photos/200/200?random=201",
    rating: 4.8,
    ratingCount: 234,
    deliveryDays: "2-3 ngày",
    location: "TP. Hồ Chí Minh",
    voucher: "2.2",
    freeShip: true,
  },
  {
    id: "2",
    name: "Sơn Dulux 5L chống thấm",
    price: 599000,
    originalPrice: 890000,
    discount: 33,
    sold: 234,
    remaining: 66,
    image: "https://picsum.photos/200/200?random=202",
    rating: 4.9,
    ratingCount: 567,
    deliveryDays: "3-5 ngày",
    location: "Hà Nội",
    freeShip: true,
  },
  {
    id: "3",
    name: "Vòi sen Inax chính hãng",
    price: 399000,
    originalPrice: 600000,
    discount: 34,
    sold: 567,
    remaining: 33,
    image: "https://picsum.photos/200/200?random=203",
    rating: 4.7,
    ratingCount: 189,
    deliveryDays: "2-4 ngày",
    location: "Đà Nẵng",
    voucher: "SALE",
  },
  {
    id: "4",
    name: "Keo dán gạch Weber",
    price: 89000,
    originalPrice: 175000,
    discount: 49,
    sold: 1234,
    remaining: 66,
    image: "https://picsum.photos/200/200?random=204",
    rating: 4.6,
    ratingCount: 890,
    deliveryDays: "1-2 ngày",
    location: "TP. Hồ Chí Minh",
    isLive: true,
    freeShip: true,
  },
  {
    id: "5",
    name: "Bồn rửa mặt Viglacera",
    price: 890000,
    originalPrice: 1500000,
    discount: 41,
    sold: 123,
    remaining: 77,
    image: "https://picsum.photos/200/200?random=205",
    rating: 4.5,
    ratingCount: 78,
    deliveryDays: "3-5 ngày",
    location: "Bình Dương",
  },
  {
    id: "6",
    name: "Đèn LED âm trần 12W",
    price: 45000,
    originalPrice: 85000,
    discount: 47,
    sold: 2345,
    remaining: 55,
    image: "https://picsum.photos/200/200?random=206",
    rating: 4.8,
    ratingCount: 1234,
    deliveryDays: "1-2 ngày",
    location: "TP. Hồ Chí Minh",
    voucher: "2.2",
    freeShip: true,
  },
  {
    id: "7",
    name: "Xi măng PCB40 Hà Tiên",
    price: 85000,
    originalPrice: 120000,
    discount: 29,
    sold: 340,
    remaining: 32,
    image: "https://picsum.photos/200/200?random=207",
    rating: 4.4,
    ratingCount: 156,
    deliveryDays: "2-3 ngày",
    location: "Long An",
    freeShip: true,
  },
  {
    id: "8",
    name: "Thép xây dựng D10 Hòa Phát",
    price: 14800,
    originalPrice: 18500,
    discount: 20,
    sold: 890,
    remaining: 11,
    image: "https://picsum.photos/200/200?random=208",
    rating: 4.7,
    ratingCount: 445,
    deliveryDays: "3-5 ngày",
    location: "Hải Phòng",
    isLive: true,
  },
  {
    id: "9",
    name: "Cửa nhôm Xingfa cao cấp",
    price: 1960000,
    originalPrice: 2800000,
    discount: 30,
    sold: 45,
    remaining: 55,
    image: "https://picsum.photos/200/200?random=209",
    rating: 4.9,
    ratingCount: 67,
    deliveryDays: "5-7 ngày",
    location: "TP. Hồ Chí Minh",
    voucher: "SALE",
    freeShip: true,
  },
  {
    id: "10",
    name: "Bồn cầu 1 khối TOTO",
    price: 2450000,
    originalPrice: 3500000,
    discount: 30,
    sold: 78,
    remaining: 22,
    image: "https://picsum.photos/200/200?random=210",
    rating: 4.8,
    ratingCount: 123,
    deliveryDays: "3-5 ngày",
    location: "Hà Nội",
    freeShip: true,
  },
];

// ============================================================================
// TIME SLOTS
// ============================================================================
const timeSlots = [
  { id: "1", time: "10:00", status: "ended", label: "Đã kết thúc" },
  { id: "2", time: "12:00", status: "active", label: "Đang diễn ra" },
  { id: "3", time: "14:00", status: "upcoming", label: "Sắp diễn ra" },
  { id: "4", time: "18:00", status: "upcoming", label: "Sắp diễn ra" },
  { id: "5", time: "20:00", status: "upcoming", label: "Sắp diễn ra" },
];

// ============================================================================
// PRODUCT CARD COMPONENT - Shopee Style with full info
// ============================================================================
const ProductCard = memo(
  ({ item, onPress }: { item: FlashProduct; onPress: () => void }) => {
    const progress = 100 - item.remaining;

    const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {/* Voucher Badge */}
          {item.voucher && (
            <View style={styles.voucherBadge}>
              <Text style={styles.voucherText}>{item.voucher}</Text>
              <Text style={styles.voucherLabel}>VOUCHER</Text>
            </View>
          )}

          {/* Discount Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>

          {/* LIVE Badge */}
          {item.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}

          {/* Product Image */}
          <Image source={{ uri: item.image }} style={styles.productImage} />

          {/* Free Ship Badge */}
          {item.freeShip && (
            <View style={styles.freeShipBadge}>
              <Ionicons name="car-outline" size={10} color={COLORS.primary} />
              <Text style={styles.freeShipText}>Miễn phí</Text>
            </View>
          )}
        </View>

        <View style={styles.productContent}>
          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.ratingCount}>({item.ratingCount})</Text>
            <Text style={styles.soldText}>
              Đã bán{" "}
              {item.sold >= 1000
                ? `${(item.sold / 1000).toFixed(1)}k`
                : item.sold}
            </Text>
          </View>

          {/* Sale Price */}
          <Text style={styles.price}>{formatPrice(item.price)}</Text>

          {/* Original Price */}
          <Text style={styles.originalPrice}>
            {formatPrice(item.originalPrice)}
          </Text>

          {/* Delivery Info */}
          <View style={styles.deliveryRow}>
            <Ionicons name="time-outline" size={11} color={COLORS.textLight} />
            <Text style={styles.deliveryText}>{item.deliveryDays}</Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={11}
              color={COLORS.textLight}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* Progress Bar - Shopee Style */}
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={["#FF6B35", "#EE4D2D"] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${progress}%` }]}
            />
            <View style={styles.progressLabelContainer}>
              {item.remaining < 30 ? (
                <>
                  <Ionicons name="flame" size={10} color={COLORS.white} />
                  <Text style={styles.progressText}>SẮP HẾT</Text>
                </>
              ) : (
                <Text style={styles.progressText}>Đã bán {item.sold}</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================
export default function FlashSaleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState("12:00");
  const [countdown, setCountdown] = useState({
    hours: 1,
    minutes: 45,
    seconds: 32,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Countdown timer effect
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderProduct = useCallback(
    ({ item }: { item: FlashProduct }) => (
      <ProductCard
        item={item}
        onPress={() => router.push(`/product/${item.id}`)}
      />
    ),
    [router],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
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
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Countdown Header */}
      <LinearGradient
        colors={["#FF6B35", "#EE4D2D"] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.countdownHeader}
      >
        <View style={styles.countdownContent}>
          <Ionicons name="flash" size={20} color={COLORS.yellow} />
          <Text style={styles.countdownLabel}>Kết thúc sau</Text>
          <View style={styles.countdownTimer}>
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
          </View>
        </View>
      </LinearGradient>

      {/* Time Slots - Shopee Style */}
      <View style={styles.timeSlotsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeSlotsContent}
        >
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlot,
                activeSlot === slot.time && styles.timeSlotActive,
              ]}
              onPress={() => setActiveSlot(slot.time)}
            >
              <Text
                style={[
                  styles.timeSlotTime,
                  activeSlot === slot.time && styles.timeSlotTextActive,
                  slot.status === "ended" && styles.timeSlotTextEnded,
                ]}
              >
                {slot.time}
              </Text>
              <Text
                style={[
                  styles.timeSlotStatus,
                  activeSlot === slot.time && styles.timeSlotTextActive,
                  slot.status === "ended" && styles.timeSlotTextEnded,
                ]}
              >
                {slot.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={flashSaleProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContent}
        columnWrapperStyle={styles.productsRow}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
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
    backgroundColor: COLORS.bg,
  },
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
  countdownHeader: {
    paddingVertical: 10,
  },
  countdownContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  countdownLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  countdownTimer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  timerBox: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 32,
    alignItems: "center",
  },
  timerText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  timerSeparator: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  timeSlotsWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timeSlotsContent: {
    paddingHorizontal: 8,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  timeSlotActive: {
    borderBottomColor: COLORS.primary,
  },
  timeSlotTime: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  timeSlotStatus: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  timeSlotTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  timeSlotTextEnded: {
    color: "#999",
  },
  productsContent: {
    padding: 12,
    paddingBottom: 24,
  },
  productsRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: "relative",
  },
  voucherBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#FFB800",
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
  liveBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    zIndex: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  liveText: {
    color: COLORS.white,
    fontSize: 9,
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
  productContent: {
    padding: 10,
  },
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
  progressLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  progressText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
