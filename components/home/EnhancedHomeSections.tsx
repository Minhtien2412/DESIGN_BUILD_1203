/**
 * Enhanced Home Components
 * Thêm các section mới cho trang chủ sinh động hơn
 * @created 2026-02-04
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { memo, useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#7CB342",
  secondary: "#43A047",
  accent: "#FF6B6B",
  white: "#FFFFFF",
  bg: "#F8F9FA",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
};

// ============================================================================
// 1. QUICK ACTIONS - Truy cập nhanh
// ============================================================================
interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  route?: string;
  action?: () => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "call",
    icon: "call",
    label: "Gọi ngay",
    color: "#4CAF50",
    route: "/call",
  },
  {
    id: "chat",
    icon: "chatbubble-ellipses",
    label: "Chat",
    color: "#2196F3",
    route: "/chat",
  },
  {
    id: "zalo",
    icon: "logo-whatsapp",
    label: "Zalo",
    color: "#0068FF",
    action: () => Linking.openURL("https://zalo.me/0123456789"),
  },
  {
    id: "video",
    icon: "videocam",
    label: "Video Call",
    color: "#9C27B0",
    route: "/meetings",
  },
];

export const QuickActionsSection = memo(() => {
  return (
    <View style={quickStyles.container}>
      <Text style={quickStyles.title}>⚡ TRUY CẬP NHANH</Text>
      <View style={quickStyles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={quickStyles.item}
            onPress={() => {
              if (action.action) {
                action.action();
              } else if (action.route) {
                router.push(action.route as Href);
              }
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                quickStyles.iconContainer,
                { backgroundColor: action.color },
              ]}
            >
              <Ionicons name={action.icon} size={24} color={COLORS.white} />
            </View>
            <Text style={quickStyles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const quickStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: "500",
  },
});

// ============================================================================
// 1.5 SHOPEE STYLE DEAL BANNERS - Row of 3 promotional banners
// ============================================================================
interface DealBanner {
  id: number;
  title: string;
  subtitle?: string;
  discount?: string;
  colors: [string, string];
  route: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const DEAL_BANNERS: DealBanner[] = [
  {
    id: 1,
    title: "DEAL CHỈ TỪ",
    subtitle: "1.000đ",
    colors: ["#FF6B6B", "#FF8E53"],
    route: "/promotions/deal-1k",
    icon: "pricetag",
  },
  {
    id: 2,
    title: "GIẢM ĐẾN",
    discount: "88%",
    subtitle: "SĂN DEAL XÂY DỰNG",
    colors: ["#43A047", "#66BB6A"],
    route: "/promotions/sale-88",
    icon: "flash",
  },
  {
    id: 3,
    title: "TÌ DEAL NHƯ MƠ",
    subtitle: "NĂM MỚI NHƯ Ý",
    colors: ["#EE4D2D", "#FF7043"],
    route: "/promotions/tet-deal",
    icon: "gift",
  },
];

export const DealBannersRow = memo(() => {
  return (
    <View style={dealStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={dealStyles.scrollContent}
      >
        {DEAL_BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.8}
            onPress={() => router.push(banner.route as Href)}
          >
            <LinearGradient
              colors={banner.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={dealStyles.banner}
            >
              <View style={dealStyles.bannerContent}>
                <Text style={dealStyles.bannerTitle}>{banner.title}</Text>
                {banner.discount && (
                  <Text style={dealStyles.bannerDiscount}>
                    {banner.discount}
                  </Text>
                )}
                {banner.subtitle && (
                  <Text style={dealStyles.bannerSubtitle}>
                    {banner.subtitle}
                  </Text>
                )}
                <View style={dealStyles.ctaRow}>
                  <Text style={dealStyles.ctaText}>MUA NGAY</Text>
                  <Ionicons name="chevron-forward" size={12} color="#FFF" />
                </View>
              </View>
              {banner.icon && (
                <View style={dealStyles.iconContainer}>
                  <Ionicons
                    name={banner.icon}
                    size={32}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const dealStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingLeft: 12,
  },
  scrollContent: {
    gap: 10,
    paddingRight: 12,
  },
  banner: {
    width: (width - 44) / 3,
    height: 100,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  bannerTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
    textTransform: "uppercase",
  },
  bannerDiscount: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.white,
    marginTop: -4,
  },
  bannerSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  ctaText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
  iconContainer: {
    position: "absolute",
    right: 8,
    top: 8,
    opacity: 0.5,
  },
});

// ============================================================================
// 2. FLASH SALE COUNTDOWN - SHOPEE STYLE
// ============================================================================
interface FlashSaleItem {
  id: number;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  sold: number;
  total: number;
  rating?: number;
  isLive?: boolean;
  hasVoucher?: boolean;
  voucherText?: string;
  location?: string;
  deliveryDays?: string;
}

const FLASH_SALE_ITEMS: FlashSaleItem[] = [
  {
    id: 1,
    name: "Thiết bị bếp cao cấp inox 304",
    image: "https://picsum.photos/120/120?random=20",
    originalPrice: 5000000,
    salePrice: 3500000,
    sold: 45,
    total: 100,
    rating: 4.8,
    hasVoucher: true,
    voucherText: "2.2",
    location: "TP. Hồ Chí Minh",
    deliveryDays: "3-5 ngày",
  },
  {
    id: 2,
    name: "Bồn cầu thông minh tự động",
    image: "https://picsum.photos/120/120?random=21",
    originalPrice: 8000000,
    salePrice: 5600000,
    sold: 78,
    total: 100,
    rating: 5.0,
    isLive: true,
    location: "Hà Nội",
    deliveryDays: "4 Giờ",
  },
  {
    id: 3,
    name: "Đèn LED trang trí nội thất",
    image: "https://picsum.photos/120/120?random=22",
    originalPrice: 1500000,
    salePrice: 900000,
    sold: 92,
    total: 100,
    rating: 4.9,
    hasVoucher: true,
    voucherText: "XTRA",
    location: "Đà Nẵng",
  },
  {
    id: 4,
    name: "Vòi sen cao cấp mạ chrome",
    image: "https://picsum.photos/120/120?random=23",
    originalPrice: 2000000,
    salePrice: 1200000,
    sold: 55,
    total: 100,
    rating: 4.7,
    location: "TP. Hồ Chí Minh",
  },
  {
    id: 5,
    name: "Gạch lát nền vân đá marble",
    image: "https://picsum.photos/120/120?random=24",
    originalPrice: 350000,
    salePrice: 237150,
    sold: 4000,
    total: 5000,
    rating: 4.8,
    isLive: true,
    hasVoucher: true,
    voucherText: "2.2",
    location: "Bình Dương",
  },
  {
    id: 6,
    name: "Sơn nội thất cao cấp 18L",
    image: "https://picsum.photos/120/120?random=25",
    originalPrice: 1800000,
    salePrice: 1368000,
    sold: 85,
    total: 150,
    rating: 4.6,
    hasVoucher: true,
    voucherText: "STYLE",
    location: "Hà Nội",
    deliveryDays: "3-5 ngày",
  },
  {
    id: 7,
    name: "Máy khoan Bosch chính hãng",
    image: "https://picsum.photos/120/120?random=26",
    originalPrice: 2500000,
    salePrice: 1750000,
    sold: 120,
    total: 200,
    rating: 4.9,
    location: "TP. Hồ Chí Minh",
  },
  {
    id: 8,
    name: "Thước đo laser 50m chuyên dụng",
    image: "https://picsum.photos/120/120?random=27",
    originalPrice: 800000,
    salePrice: 560000,
    sold: 230,
    total: 300,
    rating: 4.5,
    isLive: true,
    location: "Đồng Nai",
  },
];

export const FlashSaleSection = memo(() => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <View style={flashStyles.timeBox}>
      <Text style={flashStyles.timeValue}>
        {String(value).padStart(2, "0")}
      </Text>
      <Text style={flashStyles.timeLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={flashStyles.container}>
      <LinearGradient
        colors={["#FF6B6B", "#FF8E53"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={flashStyles.header}
      >
        <View style={flashStyles.headerLeft}>
          <Text style={flashStyles.title}>🔥 FLASH SALE</Text>
          <View style={flashStyles.countdown}>
            <TimeBox value={timeLeft.hours} label="giờ" />
            <Text style={flashStyles.separator}>:</Text>
            <TimeBox value={timeLeft.minutes} label="phút" />
            <Text style={flashStyles.separator}>:</Text>
            <TimeBox value={timeLeft.seconds} label="giây" />
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/flash-sale" as Href)}>
          <Text style={flashStyles.seeAll}>Xem tất cả →</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={flashStyles.itemsContainer}
      >
        {FLASH_SALE_ITEMS.map((item) => {
          const discount = Math.round(
            (1 - item.salePrice / item.originalPrice) * 100,
          );
          const progress = item.sold / item.total;
          const soldDisplay =
            item.sold >= 1000
              ? `${(item.sold / 1000).toFixed(0)}k+`
              : item.sold.toString();
          return (
            <TouchableOpacity
              key={item.id}
              style={flashStyles.item}
              onPress={() => router.push(`/product/${item.id}` as Href)}
              activeOpacity={0.8}
            >
              <View style={flashStyles.imageContainer}>
                <Image source={{ uri: item.image }} style={flashStyles.image} />
                {/* Discount badge */}
                <View style={flashStyles.discountBadge}>
                  <Text style={flashStyles.discountText}>-{discount}%</Text>
                </View>
                {/* Live badge */}
                {item.isLive && (
                  <View style={flashStyles.liveBadge}>
                    <View style={flashStyles.liveDot} />
                    <Text style={flashStyles.liveText}>LIVE</Text>
                  </View>
                )}
                {/* Voucher badge */}
                {item.hasVoucher && item.voucherText && (
                  <View style={flashStyles.voucherBadge}>
                    <Text style={flashStyles.voucherText}>
                      {item.voucherText}
                    </Text>
                    <Text style={flashStyles.voucherLabel}>VOUCHER</Text>
                  </View>
                )}
              </View>

              <Text style={flashStyles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              {/* Rating */}
              {item.rating && (
                <View style={flashStyles.ratingContainer}>
                  <Ionicons name="star" size={10} color="#FFB800" />
                  <Text style={flashStyles.ratingText}>{item.rating}</Text>
                </View>
              )}

              {/* Price section */}
              <View style={flashStyles.priceContainer}>
                <Text style={flashStyles.salePrice}>
                  {formatPrice(item.salePrice)}
                </Text>
                <Ionicons name="pricetag-outline" size={12} color="#EE4D2D" />
              </View>

              {/* Sold count */}
              <Text style={flashStyles.soldText}>Đã bán {soldDisplay}</Text>

              {/* Delivery & Location */}
              {(item.deliveryDays || item.location) && (
                <View style={flashStyles.deliveryContainer}>
                  {item.deliveryDays && (
                    <View style={flashStyles.deliveryBadge}>
                      <Ionicons name="car-outline" size={10} color="#26AA99" />
                      <Text style={flashStyles.deliveryText}>
                        {item.deliveryDays}
                      </Text>
                    </View>
                  )}
                  {item.location && (
                    <View style={flashStyles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={10}
                        color="#757575"
                      />
                      <Text style={flashStyles.locationText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Progress bar */}
              <View style={flashStyles.progressContainer}>
                <LinearGradient
                  colors={["#FF6B6B", "#EE4D2D"] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    flashStyles.progressBar,
                    { width: `${Math.min(progress * 100, 100)}%` },
                  ]}
                />
                <Text style={flashStyles.progressText}>
                  {progress >= 0.8
                    ? "SẮP HẾT"
                    : `${Math.round(progress * 100)}%`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const flashStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
  },
  countdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeBox: {
    backgroundColor: "#000",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    minWidth: 32,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
  timeLabel: {
    fontSize: 8,
    color: COLORS.white,
    opacity: 0.8,
  },
  separator: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  seeAll: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  itemsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
  },
  item: {
    width: 150,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 0,
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.border,
  },
  discountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    fontWeight: "700",
  },
  voucherBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  voucherText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },
  voucherLabel: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "500",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  itemName: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
    height: 38,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: "500",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
  },
  salePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EE4D2D",
  },
  originalPrice: {
    fontSize: 10,
    color: COLORS.textLight,
    textDecorationLine: "line-through",
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  soldText: {
    fontSize: 10,
    color: COLORS.textLight,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  deliveryContainer: {
    paddingHorizontal: 8,
    marginTop: 4,
    gap: 2,
  },
  deliveryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  deliveryText: {
    fontSize: 9,
    color: "#26AA99",
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  locationText: {
    fontSize: 9,
    color: "#757575",
    flex: 1,
  },
  progressContainer: {
    height: 18,
    backgroundColor: "#FFE0E0",
    borderRadius: 9,
    overflow: "hidden",
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
  },
  progressText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

// ============================================================================
// 2.5 SHOPEE LIVE & VIDEO SECTION
// ============================================================================
interface LiveStream {
  id: number;
  title: string;
  thumbnail: string;
  isLive: boolean;
  viewers?: string;
  badge?: string;
}

interface VideoItem {
  id: number;
  thumbnail: string;
  views: string;
}

const LIVE_STREAMS: LiveStream[] = [
  {
    id: 1,
    title: "[FREESHIP, VOUCHER UP...]",
    thumbnail: "https://picsum.photos/120/160?random=40",
    isLive: true,
    badge: "LIVE",
  },
  {
    id: 2,
    title: "[FREESHIP, VOUCHER UP...]",
    thumbnail: "https://picsum.photos/120/160?random=41",
    isLive: true,
    badge: "LIVE",
  },
];

const VIDEO_ITEMS_SECTION: VideoItem[] = [
  {
    id: 1,
    thumbnail: "https://picsum.photos/120/160?random=42",
    views: "148,3k",
  },
  {
    id: 2,
    thumbnail: "https://picsum.photos/120/160?random=43",
    views: "1,7k",
  },
];

export const LiveVideoSection = memo(() => {
  return (
    <View style={liveVideoStyles.container}>
      <View style={liveVideoStyles.row}>
        {/* LIVE Section */}
        <View style={liveVideoStyles.section}>
          <TouchableOpacity
            style={liveVideoStyles.sectionHeader}
            onPress={() => router.push("/live" as Href)}
          >
            <Text style={liveVideoStyles.sectionTitle}>XÂY DỰNG LIVE</Text>
            <Ionicons name="chevron-forward" size={16} color="#EE4D2D" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={liveVideoStyles.scrollContent}
          >
            {LIVE_STREAMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={liveVideoStyles.liveItem}
                onPress={() => router.push(`/live/${item.id}` as Href)}
                activeOpacity={0.8}
              >
                <View style={liveVideoStyles.thumbnailContainer}>
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={liveVideoStyles.thumbnail}
                  />
                  {item.isLive && (
                    <View style={liveVideoStyles.liveBadge}>
                      <View style={liveVideoStyles.liveDot} />
                      <Text style={liveVideoStyles.liveText}>LIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={liveVideoStyles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* VIDEO Section */}
        <View style={liveVideoStyles.section}>
          <TouchableOpacity
            style={liveVideoStyles.sectionHeader}
            onPress={() => router.push("/videos" as Href)}
          >
            <Text style={liveVideoStyles.sectionTitle}>XÂY DỰNG VIDEO</Text>
            <Ionicons name="chevron-forward" size={16} color="#EE4D2D" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={liveVideoStyles.scrollContent}
          >
            {VIDEO_ITEMS_SECTION.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={liveVideoStyles.videoItem}
                onPress={() => router.push(`/videos/${item.id}` as Href)}
                activeOpacity={0.8}
              >
                <View style={liveVideoStyles.thumbnailContainer}>
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={liveVideoStyles.thumbnail}
                  />
                  <View style={liveVideoStyles.viewsBadge}>
                    <Ionicons name="eye-outline" size={10} color="#FFF" />
                    <Text style={liveVideoStyles.viewsText}>{item.views}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
});

const liveVideoStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 12,
  },
  section: {
    flex: 1,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 10,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EE4D2D",
    flex: 1,
  },
  scrollContent: {
    gap: 8,
  },
  liveItem: {
    width: 80,
  },
  videoItem: {
    width: 80,
  },
  thumbnailContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  liveBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.white,
  },
  liveText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "700",
  },
  viewsBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewsText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "600",
  },
  itemTitle: {
    fontSize: 10,
    color: COLORS.text,
    marginTop: 4,
    lineHeight: 13,
  },
});

// ============================================================================
// 3. TOP RATED WORKERS
// ============================================================================
interface TopWorker {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
}

const TOP_WORKERS: TopWorker[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/100?img=1",
    specialty: "Thợ xây",
    rating: 4.9,
    reviews: 156,
    location: "Sài Gòn",
    verified: true,
  },
  {
    id: 2,
    name: "Trần Văn B",
    avatar: "https://i.pravatar.cc/100?img=2",
    specialty: "Thợ điện",
    rating: 4.8,
    reviews: 203,
    location: "Hà Nội",
    verified: true,
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "https://i.pravatar.cc/100?img=3",
    specialty: "Thợ sơn",
    rating: 4.8,
    reviews: 89,
    location: "Đà Nẵng",
    verified: true,
  },
  {
    id: 4,
    name: "Phạm Văn D",
    avatar: "https://i.pravatar.cc/100?img=4",
    specialty: "Thợ nội thất",
    rating: 4.7,
    reviews: 124,
    location: "Sài Gòn",
    verified: false,
  },
];

export const TopRatedWorkersSection = memo(() => {
  return (
    <View style={workerStyles.container}>
      <View style={workerStyles.header}>
        <Text style={workerStyles.title}>⭐ THỢ ĐÁNH GIÁ CAO</Text>
        <TouchableOpacity
          onPress={() => router.push("/workers?sort=rating" as Href)}
        >
          <Text style={workerStyles.seeAll}>XEM THÊM</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={workerStyles.list}
      >
        {TOP_WORKERS.map((worker) => (
          <TouchableOpacity
            key={worker.id}
            style={workerStyles.card}
            onPress={() => router.push(`/workers/${worker.id}` as Href)}
            activeOpacity={0.8}
          >
            <View style={workerStyles.avatarContainer}>
              <Image
                source={{ uri: worker.avatar }}
                style={workerStyles.avatar}
              />
              {worker.verified && (
                <View style={workerStyles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                </View>
              )}
            </View>
            <Text style={workerStyles.name} numberOfLines={1}>
              {worker.name}
            </Text>
            <Text style={workerStyles.specialty}>{worker.specialty}</Text>
            <View style={workerStyles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFB300" />
              <Text style={workerStyles.rating}>{worker.rating}</Text>
              <Text style={workerStyles.reviews}>({worker.reviews})</Text>
            </View>
            <View style={workerStyles.locationRow}>
              <Ionicons
                name="location-outline"
                size={10}
                color={COLORS.textLight}
              />
              <Text style={workerStyles.location}>{worker.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const workerStyles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  list: {
    gap: 10,
  },
  card: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.border,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 2,
  },
  specialty: {
    fontSize: 10,
    color: COLORS.primary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviews: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  location: {
    fontSize: 9,
    color: COLORS.textLight,
  },
});

// ============================================================================
// 4. WEATHER WIDGET
// ============================================================================
export const WeatherWidget = memo(() => {
  const [weather, setWeather] = useState({
    temp: 32,
    condition: "sunny",
    humidity: 65,
    description: "Thời tiết đẹp, phù hợp thi công ngoài trời",
  });

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return "sunny";
      case "cloudy":
        return "cloudy";
      case "rainy":
        return "rainy";
      default:
        return "partly-sunny";
    }
  };

  const getWeatherColor = (): [string, string] => {
    if (weather.temp >= 30) return ["#FF9800", "#FF5722"];
    if (weather.temp >= 20) return ["#4CAF50", "#8BC34A"];
    return ["#03A9F4", "#00BCD4"];
  };

  return (
    <TouchableOpacity
      style={weatherStyles.container}
      onPress={() => router.push("/weather" as Href)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getWeatherColor()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={weatherStyles.gradient}
      >
        <View style={weatherStyles.left}>
          <Ionicons name={getWeatherIcon()} size={40} color={COLORS.white} />
          <View>
            <Text style={weatherStyles.temp}>{weather.temp}°C</Text>
            <Text style={weatherStyles.humidity}>
              Độ ẩm: {weather.humidity}%
            </Text>
          </View>
        </View>
        <View style={weatherStyles.right}>
          <Text style={weatherStyles.description}>{weather.description}</Text>
          <View style={weatherStyles.badge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <Text style={weatherStyles.badgeText}>Thi công OK</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const weatherStyles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  temp: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
  },
  humidity: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  right: {
    alignItems: "flex-end",
    maxWidth: "50%",
  },
  description: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: "right",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
});

// ============================================================================
// 5. AI ASSISTANT FLOATING BUTTON
// ============================================================================
export const AIAssistantButton = memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[aiStyles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={aiStyles.button}
        onPress={() => router.push("/ai-hub" as Href)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#7C4DFF", "#448AFF"]}
          style={aiStyles.gradient}
        >
          <MaterialCommunityIcons
            name="robot-happy"
            size={28}
            color={COLORS.white}
          />
        </LinearGradient>
      </TouchableOpacity>
      <View style={aiStyles.tooltip}>
        <Text style={aiStyles.tooltipText}>AI hỗ trợ</Text>
      </View>
    </Animated.View>
  );
});

const aiStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 16,
    alignItems: "center",
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#7C4DFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  tooltipText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "500",
  },
});

// ============================================================================
// 6. PROMOTION BANNER SLIDER
// ============================================================================
interface PromoBanner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  colors: [string, string];
  route: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 1,
    image: "https://picsum.photos/400/150?random=50",
    title: "TIỆN ÍCH HOÀN THIỆN",
    subtitle: "Thợ lát gạch • Thợ sơn • Thợ thạch cao • Nhôm kính",
    colors: ["#1A237E", "#283593"],
    route: "/finishing",
  },
  {
    id: 2,
    image: "https://picsum.photos/400/150?random=51",
    title: "TIỆN ÍCH XÂY DỰNG",
    subtitle: "Phụ hồ • Thợ sắt • Thợ cốp pha • Thợ bê tông",
    colors: ["#2E7D32", "#43A047"],
    route: "/workers",
  },
  {
    id: 3,
    image: "https://picsum.photos/400/150?random=52",
    title: "Giảm 15%",
    subtitle: "Xây dựng dễ dàng, nhanh chóng với ứng dụng",
    colors: ["#388E3C", "#66BB6A"],
    route: "/promotions",
  },
  {
    id: 4,
    image: "https://picsum.photos/400/150?random=53",
    title: "Giảm 10%",
    subtitle: "Ứng dụng nhân lực xây dựng hàng đầu",
    colors: ["#1B5E20", "#4CAF50"],
    route: "/workers",
  },
  {
    id: 5,
    image: "https://picsum.photos/400/150?random=54",
    title: "TIỆN ÍCH MUA SẮM",
    subtitle: "Trang thiết bị • Đồ gia dụng • Thiết bị xây dựng",
    colors: ["#004D40", "#00695C"],
    route: "/equipment",
  },
  {
    id: 6,
    image: "https://picsum.photos/400/150?random=55",
    title: "TIỆN ÍCH THIẾT KẾ",
    subtitle: "Kiến trúc sư • Thiết kế nội thất • Giám sát 10%",
    colors: ["#00363A", "#00695C"],
    route: "/design",
  },
];

export const PromoBannerSlider = memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useState<ScrollView | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={promoStyles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (width - 24),
          );
          setActiveIndex(index);
        }}
      >
        {PROMO_BANNERS.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            onPress={() => router.push(banner.route as Href)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={banner.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={promoStyles.banner}
            >
              <View style={promoStyles.textContainer}>
                <Text style={promoStyles.title}>{banner.title}</Text>
                <Text style={promoStyles.subtitle}>{banner.subtitle}</Text>
                <View style={promoStyles.ctaButton}>
                  <Text style={promoStyles.ctaText}>Khám phá ngay</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </View>
              </View>
              <Image source={{ uri: banner.image }} style={promoStyles.image} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={promoStyles.dots}>
        {PROMO_BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              promoStyles.dot,
              index === activeIndex && promoStyles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const promoStyles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  banner: {
    width: width - 24,
    height: 140,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    marginTop: 6,
    fontWeight: "500",
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
    gap: 6,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
  image: {
    width: 110,
    height: 90,
    borderRadius: 12,
    opacity: 0.25,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
});

// ============================================================================
// 7. RECENT PROJECTS (Dự án gần đây)
// ============================================================================
interface RecentProject {
  id: number;
  name: string;
  image: string;
  progress: number;
  status: "active" | "pending" | "completed";
  lastUpdate: string;
}

const RECENT_PROJECTS: RecentProject[] = [
  {
    id: 1,
    name: "Nhà phố 3 tầng - Q7",
    image: "https://picsum.photos/150/100?random=40",
    progress: 75,
    status: "active",
    lastUpdate: "2 giờ trước",
  },
  {
    id: 2,
    name: "Biệt thự sân vườn",
    image: "https://picsum.photos/150/100?random=41",
    progress: 45,
    status: "active",
    lastUpdate: "1 ngày trước",
  },
  {
    id: 3,
    name: "Văn phòng công ty",
    image: "https://picsum.photos/150/100?random=42",
    progress: 100,
    status: "completed",
    lastUpdate: "3 ngày trước",
  },
];

export const RecentProjectsSection = memo(() => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return COLORS.primary;
      case "pending":
        return COLORS.warning;
      case "completed":
        return COLORS.success;
      default:
        return COLORS.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang thi công";
      case "pending":
        return "Chờ xử lý";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  return (
    <View style={projectStyles.container}>
      <View style={projectStyles.header}>
        <Text style={projectStyles.title}>📁 DỰ ÁN GẦN ĐÂY</Text>
        <TouchableOpacity onPress={() => router.push("/projects" as Href)}>
          <Text style={projectStyles.seeAll}>XEM TẤT CẢ</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={projectStyles.list}
      >
        {RECENT_PROJECTS.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={projectStyles.card}
            onPress={() => router.push(`/projects/${project.id}` as Href)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: project.image }}
              style={projectStyles.image}
            />
            <View style={projectStyles.content}>
              <Text style={projectStyles.name} numberOfLines={1}>
                {project.name}
              </Text>
              <View style={projectStyles.statusRow}>
                <View
                  style={[
                    projectStyles.statusDot,
                    { backgroundColor: getStatusColor(project.status) },
                  ]}
                />
                <Text style={projectStyles.statusText}>
                  {getStatusText(project.status)}
                </Text>
              </View>
              <View style={projectStyles.progressContainer}>
                <View
                  style={[
                    projectStyles.progressBar,
                    {
                      width: `${project.progress}%`,
                      backgroundColor: getStatusColor(project.status),
                    },
                  ]}
                />
              </View>
              <View style={projectStyles.footer}>
                <Text style={projectStyles.progress}>{project.progress}%</Text>
                <Text style={projectStyles.update}>{project.lastUpdate}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const projectStyles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  list: {
    gap: 12,
  },
  card: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 100,
    backgroundColor: COLORS.border,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progress: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },
  update: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});
