/**
 * Enhanced Home Components
 * Thêm các section mới cho trang chủ sinh động hơn
 * @created 2026-02-04
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// ANIMATION HOOKS
// ============================================================================

/** Fade-in + slide-up entrance animation */
const useEntranceAnim = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
};

/** Animated number counter — counts from 0 to target */
const useAnimatedCounter = (target: number, duration = 1200) => {
  const [display, setDisplay] = useState(0);
  const animRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (target <= 0) return;
    animRef.setValue(0);
    const listener = animRef.addListener(({ value }) => {
      setDisplay(Math.round(value));
    });
    const anim = Animated.timing(animRef, {
      toValue: target,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    });
    anim.start();
    return () => {
      anim.stop();
      animRef.removeListener(listener);
    };
  }, [target, duration, animRef]);

  return display;
};

const { width } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#0D9488",
  secondary: "#0284C7",
  accent: "#F97316",
  white: "#FFFFFF",
  bg: "#F0F4F8",
  text: "#1E293B",
  textLight: "#64748B",
  border: "#CBD5E1",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#0EA5E9",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const formatPrice = (price: number) => {
  return price.toLocaleString("vi-VN") + "đ";
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
    label: "Chat tư vấn",
    color: "#2196F3",
    route: "/chat",
  },
  {
    id: "ai",
    icon: "sparkles",
    label: "AI Thiết kế",
    color: "#7C3AED",
    route: "/ai-design",
  },
  {
    id: "workers",
    icon: "construct",
    label: "Tìm thợ",
    color: "#EF6C00",
    route: "/workers",
  },
  {
    id: "calculator",
    icon: "calculator",
    label: "Dự toán",
    color: "#00897B",
    route: "/calculators",
  },
];

export const QuickActionsSection = memo(() => {
  return (
    <View style={quickStyles.container}>
      <Text style={quickStyles.title}>TRUY CẬP NHANH</Text>
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
    flexWrap: "wrap",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    rowGap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    alignItems: "center",
    width: "33%",
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
    colors: ["#0D9488", "#FF7043"],
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
// 2. FLASH SALE COUNTDOWN - SHOPEE STYLE (Now accepts real data)
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
  route?: string;
}

// Fallback items only used when no API data
const FLASH_SALE_FALLBACK: FlashSaleItem[] = [
  {
    id: 1,
    name: "Gạch AAC siêu nhẹ 60x20x10cm",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300",
    originalPrice: 55000,
    salePrice: 42000,
    sold: 306,
    total: 500,
    rating: 4.8,
    hasVoucher: true,
    voucherText: "2.2",
    location: "TP. Hồ Chí Minh",
    deliveryDays: "3-5 ngày",
  },
  {
    id: 2,
    name: "Sơn Dulux Inspire nội thất 5L",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300",
    originalPrice: 580000,
    salePrice: 450000,
    sold: 212,
    total: 400,
    rating: 4.9,
    isLive: true,
    location: "Hà Nội",
    deliveryDays: "4 Giờ",
  },
  {
    id: 3,
    name: "Đèn LED âm trần 9W",
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300",
    originalPrice: 120000,
    salePrice: 85000,
    sold: 255,
    total: 350,
    rating: 4.7,
    hasVoucher: true,
    voucherText: "XTRA",
    location: "Bình Dương",
  },
];

export const FlashSaleSection = memo(
  ({ items }: { items?: FlashSaleItem[] }) => {
    const displayItems =
      items && items.length > 0 ? items : FLASH_SALE_FALLBACK;
    const entrance = useEntranceAnim(100);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const [timeLeft, setTimeLeft] = useState({
      hours: 2,
      minutes: 30,
      seconds: 45,
    });

    // Pulse the "FLASH SALE" title every 2 seconds
    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }, [pulseAnim]);

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

    const TimeBox = ({ value, label }: { value: number; label: string }) => (
      <View style={flashStyles.timeBox}>
        <Text style={flashStyles.timeValue}>
          {String(value).padStart(2, "0")}
        </Text>
        <Text style={flashStyles.timeLabel}>{label}</Text>
      </View>
    );

    return (
      <Animated.View style={[flashStyles.container, entrance]}>
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={flashStyles.header}
        >
          <View style={flashStyles.headerLeft}>
            <Animated.Text
              style={[flashStyles.title, { transform: [{ scale: pulseAnim }] }]}
            >
              🔥 FLASH SALE
            </Animated.Text>
            <View style={flashStyles.countdown}>
              <TimeBox value={timeLeft.hours} label="giờ" />
              <Text style={flashStyles.separator}>:</Text>
              <TimeBox value={timeLeft.minutes} label="phút" />
              <Text style={flashStyles.separator}>:</Text>
              <TimeBox value={timeLeft.seconds} label="giây" />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/shopping/flash-sale" as Href)}
          >
            <Text style={flashStyles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={flashStyles.itemsContainer}
        >
          {displayItems.map((item) => {
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
                onPress={() =>
                  router.push((item.route || `/product/${item.id}`) as Href)
                }
                activeOpacity={0.8}
              >
                <View style={flashStyles.imageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={flashStyles.image}
                  />
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
                  <Ionicons name="pricetag-outline" size={12} color="#0D9488" />
                </View>

                {/* Sold count */}
                <Text style={flashStyles.soldText}>Đã bán {soldDisplay}</Text>

                {/* Delivery & Location */}
                {(item.deliveryDays || item.location) && (
                  <View style={flashStyles.deliveryContainer}>
                    {item.deliveryDays && (
                      <View style={flashStyles.deliveryBadge}>
                        <Ionicons
                          name="car-outline"
                          size={10}
                          color="#26AA99"
                        />
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
                        <Text
                          style={flashStyles.locationText}
                          numberOfLines={1}
                        >
                          {item.location}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Progress bar */}
                <View style={flashStyles.progressContainer}>
                  <LinearGradient
                    colors={["#FF6B6B", "#0D9488"] as [string, string]}
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
      </Animated.View>
    );
  },
);

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
    backgroundColor: "#0D9488",
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
    backgroundColor: "#0D9488",
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
    backgroundColor: "#0D9488",
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
    color: "#0D9488",
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
            <Ionicons name="chevron-forward" size={16} color="#0D9488" />
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
            <Ionicons name="chevron-forward" size={16} color="#0D9488" />
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
    color: "#0D9488",
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
    backgroundColor: "#0D9488",
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
// 3. TOP RATED WORKERS (Now accepts real API data)
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
  completedJobs?: number;
  experience?: number;
  dailyRate?: number;
}

const TOP_WORKERS_FALLBACK: TopWorker[] = [
  {
    id: 1,
    name: "Nguyễn Văn Hùng",
    avatar: "https://i.pravatar.cc/100?img=1",
    specialty: "Thợ xây",
    rating: 4.8,
    reviews: 156,
    location: "TP.HCM",
    verified: true,
    completedJobs: 45,
  },
  {
    id: 2,
    name: "Trần Minh Đức",
    avatar: "https://i.pravatar.cc/100?img=2",
    specialty: "Thợ điện",
    rating: 4.9,
    reviews: 203,
    location: "TP.HCM",
    verified: true,
    completedJobs: 67,
  },
  {
    id: 3,
    name: "Lê Thị Mai",
    avatar: "https://i.pravatar.cc/100?img=3",
    specialty: "Thợ sơn",
    rating: 4.7,
    reviews: 89,
    location: "TP.HCM",
    verified: true,
    completedJobs: 38,
  },
];

export const TopRatedWorkersSection = memo(
  ({ workers }: { workers?: TopWorker[] }) => {
    const displayWorkers =
      workers && workers.length > 0 ? workers : TOP_WORKERS_FALLBACK;
    const entrance = useEntranceAnim(150);

    return (
      <Animated.View style={[workerStyles.container, entrance]}>
        <View style={workerStyles.header}>
          <View style={workerStyles.headerLeft}>
            <Text style={workerStyles.title}>THỢ ĐÁNH GIÁ CAO</Text>
            <View style={workerStyles.countBadge}>
              <Text style={workerStyles.countText}>
                {displayWorkers.length}
              </Text>
            </View>
          </View>
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
          {displayWorkers.map((worker) => (
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
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4CAF50"
                    />
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
              {worker.completedJobs != null && worker.completedJobs > 0 && (
                <View style={workerStyles.jobsRow}>
                  <Ionicons
                    name="briefcase-outline"
                    size={10}
                    color="#4CAF50"
                  />
                  <Text style={workerStyles.jobsText}>
                    {worker.completedJobs} dự án
                  </Text>
                </View>
              )}
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
      </Animated.View>
    );
  },
);

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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    backgroundColor: "#0D9488",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
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
  jobsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 3,
  },
  jobsText: {
    fontSize: 9,
    color: "#4CAF50",
    fontWeight: "500",
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
// 6. PROMOTION BANNER SLIDER - Local banners from assets/banner
// ============================================================================
interface PromoBanner {
  id: number;
  image: any;
  title: string;
  subtitle: string;
  colors: [string, string];
  route: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 1,
    image: require("@/assets/banner/BANNER-1.jpg"),
    title: "Xây Dựng Dễ Dàng, Nhanh Chóng",
    subtitle: "Giảm ngay 15% dịch vụ đầu tiên",
    colors: ["#2E7D32", "#43A047"],
    route: "/services",
  },
  {
    id: 2,
    image: require("@/assets/banner/BANNER-2.jpeg"),
    title: "Nhân Lực Xây Dựng",
    subtitle: "Tìm thợ nhanh • Chất lượng • Uy tín",
    colors: ["#1B5E20", "#388E3C"],
    route: "/workers",
  },
  {
    id: 3,
    image: require("@/assets/banner/BANNER-3.jpeg"),
    title: "Mua sắm trang thiết bị",
    subtitle: "Đa dạng sản phẩm • Giá tốt mỗi ngày",
    colors: ["#0D47A1", "#1565C0"],
    route: "/shop",
  },
  {
    id: 4,
    image: require("@/assets/banner/BANNER-4.jpeg"),
    title: "Tiện ích thiết kế",
    subtitle: "Kiến tạo không gian sống • Giảm đến 10%",
    colors: ["#00695C", "#00897B"],
    route: "/services/house-design",
  },
  {
    id: 5,
    image: require("@/assets/banner/BANNER-5.jpeg"),
    title: "Tiện ích hoàn thiện",
    subtitle: "Trọn gói từ A-Z • Tư vấn & thiết kế 3D miễn phí",
    colors: ["#1A237E", "#283593"],
    route: "/finishing",
  },
  {
    id: 6,
    image: require("@/assets/banner/BANNER-6.jpeg"),
    title: "Tiện ích xây dựng",
    subtitle: "Hỗ trợ cho công ty xây dựng và nhà thầu",
    colors: ["#33691E", "#558B2F"],
    route: "/workers",
  },
];

export const PromoBannerSlider = memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);

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
        {PROMO_BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            onPress={() => router.push(banner.route as Href)}
            activeOpacity={0.92}
          >
            <View style={promoStyles.banner}>
              <Image
                source={banner.image}
                style={promoStyles.bannerImage}
                resizeMode="contain"
              />
              {/* Dark overlay gradient for text readability */}
              <LinearGradient
                colors={["rgba(0,0,0,0.45)", "transparent", "rgba(0,0,0,0.3)"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={promoStyles.overlay}
              />
              {/* CTA badge */}
              <View style={promoStyles.ctaContainer}>
                <View style={promoStyles.ctaButton}>
                  <Text style={promoStyles.ctaText}>Khám phá</Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFF" />
                </View>
              </View>
            </View>
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
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    backgroundColor: COLORS.bg,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  ctaContainer: {
    position: "absolute",
    bottom: 12,
    left: 16,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: "#2E7D32",
    borderRadius: 4,
  },
});

// ============================================================================
// 7. TRENDING PRODUCTS (Replaces old RecentProjects - now with real API data)
// ============================================================================
interface TrendingProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  soldCount: number;
  viewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  seller: string;
  sellerId?: string;
  route: string;
}

const formatCompactNumber = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

export const TrendingProductsSection = memo(
  ({ products }: { products?: TrendingProduct[] }) => {
    if (!products || products.length === 0) return null;

    const entrance = useEntranceAnim(200);

    return (
      <Animated.View style={[trendingStyles.container, entrance]}>
        <View style={trendingStyles.header}>
          <View style={trendingStyles.headerLeft}>
            <Text style={trendingStyles.title}>🔥 SẢN PHẨM NỔI BẬT</Text>
            <View style={trendingStyles.newBadge}>
              <Text style={trendingStyles.newText}>MỚI</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/shop" as Href)}>
            <Text style={trendingStyles.seeAll}>XEM TẤT CẢ</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={trendingStyles.list}
        >
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={trendingStyles.card}
              onPress={() => router.push(product.route as Href)}
              activeOpacity={0.8}
            >
              <View style={trendingStyles.imageWrap}>
                <Image
                  source={{ uri: product.image }}
                  style={trendingStyles.image}
                />
                {product.isNew && (
                  <View style={trendingStyles.productBadge}>
                    <Text style={trendingStyles.badgeText}>MỚI</Text>
                  </View>
                )}
                {product.isBestseller && (
                  <View
                    style={[
                      trendingStyles.productBadge,
                      { backgroundColor: "#c4ee2d" },
                    ]}
                  >
                    <Text style={trendingStyles.badgeText}>BÁN CHẠY</Text>
                  </View>
                )}
              </View>
              <View style={trendingStyles.content}>
                <Text style={trendingStyles.name} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={trendingStyles.price}>
                  {formatPrice(product.price)}
                </Text>
                <View style={trendingStyles.statsRow}>
                  <View style={trendingStyles.stat}>
                    <Ionicons
                      name="eye-outline"
                      size={10}
                      color={COLORS.textLight}
                    />
                    <Text style={trendingStyles.statText}>
                      {formatCompactNumber(product.viewCount)}
                    </Text>
                  </View>
                  <View style={trendingStyles.stat}>
                    <Ionicons name="cart-outline" size={10} color="#52d63d" />
                    <Text
                      style={[trendingStyles.statText, { color: "#4ce4b1" }]}
                    >
                      {formatCompactNumber(product.soldCount)}
                    </Text>
                  </View>
                </View>
                <Text style={trendingStyles.seller} numberOfLines={1}>
                  <Text
                    onPress={() =>
                      product.sellerId &&
                      router.push(`/profile/${product.sellerId}` as Href)
                    }
                    style={
                      product.sellerId
                        ? { textDecorationLine: "underline" as const }
                        : undefined
                    }
                  >
                    {product.seller}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  },
);

// Keep RecentProjectsSection as alias for backward compatibility
export const RecentProjectsSection = memo(() => null);

const trendingStyles = StyleSheet.create({
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  newBadge: {
    backgroundColor: "#0D9488",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "700",
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
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.border,
  },
  productBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "700",
  },
  content: {
    padding: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 16,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D9488",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  seller: {
    fontSize: 9,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
});

// ============================================================================
// 8. STATS BAR - Live statistics from server
// ============================================================================
interface HomeStats {
  totalProducts: number;
  totalWorkers: number;
  totalSold: number;
  avgRating: number;
}

/** Animated stat counter item */
const AnimatedStatItem = memo(
  ({
    icon,
    target,
    suffix,
    label,
    color,
    delay,
    isDecimal,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    target: number;
    suffix: string;
    label: string;
    color: string;
    delay: number;
    isDecimal?: boolean;
  }) => {
    const animTarget = isDecimal ? Math.round(target * 10) : target;
    const count = useAnimatedCounter(animTarget, 1200);
    const entrance = useEntranceAnim(delay);
    const displayValue = isDecimal ? (count / 10).toFixed(1) : `${count}`;
    return (
      <Animated.View style={[statsStyles.item, entrance]}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[statsStyles.value, { color }]}>
          {displayValue}
          {suffix}
        </Text>
        <Text style={statsStyles.label}>{label}</Text>
      </Animated.View>
    );
  },
);

export const StatsBar = memo(({ stats }: { stats?: HomeStats }) => {
  if (!stats || stats.totalProducts === 0) return null;

  const entrance = useEntranceAnim(100);

  return (
    <Animated.View style={[statsStyles.container, entrance]}>
      <AnimatedStatItem
        icon="cube-outline"
        target={stats.totalProducts}
        suffix="+"
        label="Sản phẩm"
        color="#2196F3"
        delay={200}
      />
      <AnimatedStatItem
        icon="people-outline"
        target={stats.totalWorkers}
        suffix="+"
        label="Thợ uy tín"
        color="#4CAF50"
        delay={350}
      />
      <AnimatedStatItem
        icon="cart-outline"
        target={stats.totalSold}
        suffix="+"
        label="Đã bán"
        color="#0D9488"
        delay={500}
      />
      <AnimatedStatItem
        icon="star"
        target={stats.avgRating}
        suffix=""
        label="Đánh giá"
        color="#FFB300"
        delay={650}
        isDecimal
      />
    </Animated.View>
  );
});

const statsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
