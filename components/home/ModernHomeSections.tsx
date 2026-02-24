/**
 * ModernHomeSections - Redesigned home page sections
 * Modern glassmorphism cards, better typography, BE data integration
 * @created 2026-02-06
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
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

import { useFavorites } from "@/context/FavoritesContext";
import type {
    BestsellerItem,
    FlashSaleItem,
    HomeStats,
    NewArrivalItem,
    TopWorkerItem,
    TrendingProductItem,
    WorkerByType,
} from "@/hooks/useHomePageData";

const { width: SCREEN_W } = Dimensions.get("window");

// ============================================================================
// DESIGN TOKENS
// ============================================================================

// Spacing, radius, and shadow tokens (shared across themes)
const TLayout = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,

  // Radius – rounder for premium feel
  radiusSm: 10,
  radiusMd: 14,
  radiusLg: 18,
  radiusXl: 22,
  radiusFull: 999,

  // Shadow – deeper for elevated look
  shadow: Platform.select({
    ios: {
      shadowColor: "#0D9488",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    android: { elevation: 4 },
  }),
  shadowMd: Platform.select({
    ios: {
      shadowColor: "#0D9488",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: { elevation: 7 },
  }),
};

// Light mode color tokens
const TLightColors = {
  primary: "#0D9488",
  primaryLight: "#CCFBF1",
  secondary: "#0284C7",
  secondaryLight: "#E0F2FE",
  accent: "#F97316",
  accentLight: "#FFF7ED",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",

  white: "#FFFFFF",
  bg: "#F0F4F8",
  surface: "#FFFFFF",
  text: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#CBD5E1",
};

// Dark mode color tokens
const TDarkColors = {
  primary: "#14B8A6",
  primaryLight: "#134E48",
  secondary: "#38BDF8",
  secondaryLight: "#0C4A6E",
  accent: "#FB923C",
  accentLight: "#431407",
  danger: "#F87171",
  dangerLight: "#450A0A",
  purple: "#A78BFA",
  purpleLight: "#2E1065",

  white: "#1A1A2E",
  bg: "#0A0A0F",
  surface: "#1A1A2E",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  border: "#334155",
};

// Default T for static StyleSheet references (light mode fallback)
const T = { ...TLayout, ...TLightColors };

/**
 * Hook to get theme-aware design tokens.
 * Use inside components for dynamic color. Static layout values come from T directly.
 */
const useT = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  // Merge layout tokens with the correct color set
  return isDark ? { ...TLayout, ...TDarkColors } : T;
};

// ============================================================================
// ANIMATION HOOKS
// ============================================================================

const useEntranceAnim = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
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

const useAnimatedCounter = (target: number, duration = 1000) => {
  const [display, setDisplay] = useState(0);
  const animRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (target <= 0) return;
    animRef.setValue(0);
    const listener = animRef.addListener(({ value }) =>
      setDisplay(Math.round(value)),
    );
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

// ============================================================================
// UTILITY
// ============================================================================

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

// ============================================================================
// SHARED: Section Header
// ============================================================================
const SectionHeader = memo(
  ({
    title,
    emoji,
    badge,
    badgeColor,
    seeAllRoute,
    accentColor = T.primary,
  }: {
    title: string;
    emoji?: string;
    badge?: string | number;
    badgeColor?: string;
    seeAllRoute?: string;
    accentColor?: string;
  }) => {
    const t = useT();
    return (
      <View style={sectionHeaderStyles.container}>
        <View style={sectionHeaderStyles.left}>
          {emoji && <Text style={sectionHeaderStyles.emoji}>{emoji}</Text>}
          <Text style={[sectionHeaderStyles.title, { color: t.text }]}>
            {title}
          </Text>
          {badge != null && (
            <View
              style={[
                sectionHeaderStyles.badge,
                { backgroundColor: badgeColor || t.danger },
              ]}
            >
              <Text style={sectionHeaderStyles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {seeAllRoute && (
          <TouchableOpacity
            style={sectionHeaderStyles.seeAllBtn}
            onPress={() => router.push(seeAllRoute as Href)}
            hitSlop={8}
          >
            <Text
              style={[sectionHeaderStyles.seeAllText, { color: accentColor }]}
            >
              Xem tất cả
            </Text>
            <Ionicons name="chevron-forward" size={14} color={accentColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: T.lg,
    marginBottom: T.md,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 6 },
  emoji: { fontSize: 18 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: T.text,
    letterSpacing: 0.3,
  },
  badge: {
    borderRadius: T.radiusFull,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: { color: T.white, fontSize: 10, fontWeight: "700" },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: "600" },
});

// ============================================================================
// 1. STATS BAR - Animated counters
// ============================================================================

const StatItem = memo(
  ({
    icon,
    target,
    suffix,
    label,
    color,
    bgColor,
    delay,
    isDecimal,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    target: number;
    suffix: string;
    label: string;
    color: string;
    bgColor: string;
    delay: number;
    isDecimal?: boolean;
  }) => {
    const animTarget = isDecimal ? Math.round(target * 10) : target;
    const count = useAnimatedCounter(animTarget, 1000);
    const entrance = useEntranceAnim(delay);
    const val = isDecimal ? (count / 10).toFixed(1) : `${count}`;
    return (
      <Animated.View style={[statBarStyles.item, entrance]}>
        <View style={[statBarStyles.iconWrap, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text style={[statBarStyles.value, { color }]}>
          {val}
          {suffix}
        </Text>
        <Text style={statBarStyles.label}>{label}</Text>
      </Animated.View>
    );
  },
);

export const ModernStatsBar = memo(({ stats }: { stats?: HomeStats }) => {
  const t = useT();
  if (!stats || stats.totalProducts === 0) return null;
  return (
    <View
      style={[
        statBarStyles.container,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <StatItem
        icon="cube-outline"
        target={stats.totalProducts}
        suffix="+"
        label="Sản phẩm"
        color={t.secondary}
        bgColor={t.secondaryLight}
        delay={100}
      />
      <View style={[statBarStyles.divider, { backgroundColor: t.border }]} />
      <StatItem
        icon="people-outline"
        target={stats.totalWorkers}
        suffix="+"
        label="Thợ uy tín"
        color={t.primary}
        bgColor={t.primaryLight}
        delay={250}
      />
      <View style={[statBarStyles.divider, { backgroundColor: t.border }]} />
      <StatItem
        icon="cart-outline"
        target={stats.totalSold}
        suffix="+"
        label="Đã bán"
        color={t.accent}
        bgColor={t.accentLight}
        delay={400}
      />
      <View style={[statBarStyles.divider, { backgroundColor: t.border }]} />
      <StatItem
        icon="star"
        target={stats.avgRating}
        suffix=""
        label="Đánh giá"
        color="#EAB308"
        bgColor="#FEF9C3"
        delay={550}
        isDecimal
      />
    </View>
  );
});

const statBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: T.lg,
    marginTop: T.lg,
    backgroundColor: T.surface,
    borderRadius: T.radiusLg,
    paddingVertical: T.lg,
    paddingHorizontal: T.sm,
    borderWidth: 1,
    borderColor: "rgba(13,148,136,0.06)",
    ...T.shadowMd,
  } as any,
  item: { flex: 1, alignItems: "center" },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: T.radiusFull,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  value: { fontSize: 15, fontWeight: "800" },
  label: { fontSize: 10, color: T.textMuted, marginTop: 2, fontWeight: "500" },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: T.border,
  },
});

// ============================================================================
// 2. FLASH SALE - Modern design with countdown
// ============================================================================

export const ModernFlashSale = memo(
  ({ items }: { items?: FlashSaleItem[] }) => {
    if (!items || items.length === 0) return null;

    const t = useT();
    const entrance = useEntranceAnim(100);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const [timeLeft, setTimeLeft] = useState({
      hours: 2,
      minutes: 30,
      seconds: 45,
    });

    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
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
              if (hours < 0) return { hours: 23, minutes: 59, seconds: 59 };
            }
          }
          return { hours, minutes, seconds };
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const TimeBox = ({ value }: { value: number }) => (
      <View style={flashStyles.timeBox}>
        <Text style={flashStyles.timeValue}>
          {String(value).padStart(2, "0")}
        </Text>
      </View>
    );

    return (
      <Animated.View
        style={[flashStyles.wrapper, { backgroundColor: t.surface }, entrance]}
      >
        {/* Header */}
        <LinearGradient
          colors={["#EF4444", "#F97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={flashStyles.header}
        >
          <View style={flashStyles.headerLeft}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={flashStyles.headerTitle}>⚡ FLASH SALE</Text>
            </Animated.View>
            <View style={flashStyles.countdown}>
              <TimeBox value={timeLeft.hours} />
              <Text style={flashStyles.sep}>:</Text>
              <TimeBox value={timeLeft.minutes} />
              <Text style={flashStyles.sep}>:</Text>
              <TimeBox value={timeLeft.seconds} />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/flash-sale" as Href)}
            hitSlop={8}
          >
            <Text style={flashStyles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Items */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={flashStyles.list}
        >
          {items.map((item) => {
            const discount = Math.round(
              (1 - item.salePrice / item.originalPrice) * 100,
            );
            const progress = Math.min(item.sold / item.total, 1);
            return (
              <TouchableOpacity
                key={item.id}
                style={flashStyles.card}
                onPress={() =>
                  router.push((item.route || `/product/${item.id}`) as Href)
                }
                activeOpacity={0.85}
              >
                <View style={flashStyles.imgWrap}>
                  <Image source={{ uri: item.image }} style={flashStyles.img} />
                  <View style={flashStyles.discountTag}>
                    <Text style={flashStyles.discountText}>-{discount}%</Text>
                  </View>
                  {item.isLive && (
                    <View style={flashStyles.liveBadge}>
                      <View style={flashStyles.liveDot} />
                      <Text style={flashStyles.liveText}>LIVE</Text>
                    </View>
                  )}
                  {item.hasVoucher && item.voucherText && (
                    <View style={flashStyles.voucherTag}>
                      <Text style={flashStyles.voucherText}>
                        {item.voucherText}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={flashStyles.cardBody}>
                  <Text style={flashStyles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {item.rating > 0 && (
                    <View style={flashStyles.ratingRow}>
                      <Ionicons name="star" size={10} color="#EAB308" />
                      <Text style={flashStyles.ratingText}>{item.rating}</Text>
                    </View>
                  )}

                  <Text style={flashStyles.salePrice}>
                    {formatPrice(item.salePrice)}
                  </Text>
                  <Text style={flashStyles.originalPrice}>
                    {formatPrice(item.originalPrice)}
                  </Text>

                  {/* Progress bar */}
                  <View style={flashStyles.progressBg}>
                    <LinearGradient
                      colors={["#EF4444", "#F97316"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        flashStyles.progressFill,
                        {
                          width: `${Math.round(progress * 100)}%`,
                        },
                      ]}
                    />
                    <Text style={flashStyles.progressLabel}>
                      {progress >= 0.8
                        ? "SẮP HẾT"
                        : `Đã bán ${formatCompact(item.sold)}`}
                    </Text>
                  </View>
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
  wrapper: {
    marginTop: T.lg,
    backgroundColor: T.surface,
    borderTopWidth: 1,
    borderTopColor: "rgba(13,148,136,0.04)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: T.lg,
    paddingVertical: T.md,
    borderTopLeftRadius: T.radiusLg,
    borderTopRightRadius: T.radiusLg,
    marginHorizontal: T.lg,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 15, fontWeight: "800", color: T.white },
  countdown: { flexDirection: "row", alignItems: "center", gap: 3 },
  timeBox: {
    backgroundColor: "#000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: "center",
  },
  timeValue: { color: T.white, fontSize: 13, fontWeight: "700" },
  sep: { color: T.white, fontWeight: "800", fontSize: 13 },
  seeAll: { color: T.white, fontSize: 12, fontWeight: "600" },
  list: { paddingHorizontal: T.lg, paddingVertical: T.md, gap: 10 },
  card: {
    width: 155,
    backgroundColor: T.surface,
    borderRadius: T.radiusMd,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(13,148,136,0.1)",
    ...T.shadow,
  } as any,
  imgWrap: { position: "relative" },
  img: { width: "100%", height: 155, backgroundColor: T.border },
  discountTag: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: T.radiusSm,
  },
  discountText: { color: T.white, fontSize: 11, fontWeight: "700" },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EF4444",
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
    backgroundColor: T.white,
  },
  liveText: { color: T.white, fontSize: 9, fontWeight: "700" },
  voucherTag: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 4,
  },
  voucherText: { color: T.white, fontSize: 9, fontWeight: "700" },
  cardBody: { padding: T.sm },
  itemName: {
    fontSize: 12,
    color: T.text,
    fontWeight: "500",
    lineHeight: 16,
    height: 32,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  ratingText: { fontSize: 10, fontWeight: "600", color: T.text },
  salePrice: { fontSize: 15, fontWeight: "800", color: "#EF4444" },
  originalPrice: {
    fontSize: 10,
    color: T.textMuted,
    textDecorationLine: "line-through",
    marginBottom: 6,
  },
  progressBg: {
    height: 18,
    backgroundColor: "#FEE2E2",
    borderRadius: T.radiusFull,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: T.radiusFull,
  },
  progressLabel: {
    fontSize: 9,
    color: T.white,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

// ============================================================================
// 3. TOP RATED WORKERS - Modern card design
// ============================================================================

export const ModernTopWorkers = memo(
  ({ workers }: { workers?: TopWorkerItem[] }) => {
    if (!workers || workers.length === 0) return null;
    const t = useT();
    const entrance = useEntranceAnim(150);

    return (
      <Animated.View style={[topWorkerStyles.wrapper, entrance]}>
        <SectionHeader
          title="Thợ đánh giá cao"
          emoji="⭐"
          badge={workers.length}
          badgeColor={t.primary}
          seeAllRoute="/workers?sort=rating"
          accentColor={t.primary}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={topWorkerStyles.list}
        >
          {workers.map((w, idx) => (
            <TouchableOpacity
              key={w.id}
              style={[
                topWorkerStyles.card,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
              onPress={() => router.push(`/workers/${w.id}` as Href)}
              activeOpacity={0.85}
            >
              {/* Rank badge for top 3 */}
              {idx < 3 && (
                <View
                  style={[
                    topWorkerStyles.rankBadge,
                    {
                      backgroundColor:
                        idx === 0
                          ? "#EAB308"
                          : idx === 1
                            ? "#94A3B8"
                            : "#D97706",
                    },
                  ]}
                >
                  <Text style={topWorkerStyles.rankText}>#{idx + 1}</Text>
                </View>
              )}

              <View style={topWorkerStyles.avatarWrap}>
                <Image
                  source={{ uri: w.avatar }}
                  style={topWorkerStyles.avatar}
                />
                {w.verified && (
                  <View style={topWorkerStyles.verifiedIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={t.primary}
                    />
                  </View>
                )}
              </View>

              <Text style={topWorkerStyles.name} numberOfLines={1}>
                {w.name}
              </Text>

              <View style={topWorkerStyles.specialtyTag}>
                <Text style={topWorkerStyles.specialtyText}>{w.specialty}</Text>
              </View>

              <View style={topWorkerStyles.ratingRow}>
                <Ionicons name="star" size={12} color="#EAB308" />
                <Text style={topWorkerStyles.rating}>{w.rating}</Text>
                <Text style={topWorkerStyles.reviews}>({w.reviews})</Text>
              </View>

              {w.completedJobs > 0 && (
                <View style={topWorkerStyles.metaRow}>
                  <Ionicons
                    name="briefcase-outline"
                    size={10}
                    color={T.primary}
                  />
                  <Text style={topWorkerStyles.metaText}>
                    {w.completedJobs} dự án
                  </Text>
                </View>
              )}

              {w.dailyRate > 0 && (
                <Text style={topWorkerStyles.rate}>
                  {formatPrice(w.dailyRate)}/ngày
                </Text>
              )}

              <View style={topWorkerStyles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={10}
                  color={T.textMuted}
                />
                <Text style={topWorkerStyles.location}>{w.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  },
);

const topWorkerStyles = StyleSheet.create({
  wrapper: { marginTop: T.xl },
  list: { paddingHorizontal: T.lg, gap: 10 },
  card: {
    width: 130,
    backgroundColor: T.surface,
    borderRadius: T.radiusLg,
    padding: T.md,
    alignItems: "center",
    ...T.shadowMd,
    position: "relative",
    borderWidth: 1,
    borderColor: T.border,
  } as any,
  rankBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  rankText: { color: T.white, fontSize: 10, fontWeight: "800" },
  avatarWrap: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: T.border,
    borderWidth: 2,
    borderColor: T.primaryLight,
  },
  verifiedIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: T.white,
    borderRadius: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: "700",
    color: T.text,
    textAlign: "center",
    marginBottom: 4,
  },
  specialtyTag: {
    backgroundColor: T.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: T.radiusFull,
    marginBottom: 6,
  },
  specialtyText: { fontSize: 10, color: T.primary, fontWeight: "600" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  rating: { fontSize: 12, fontWeight: "700", color: T.text },
  reviews: { fontSize: 9, color: T.textMuted },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  metaText: { fontSize: 9, color: T.primary, fontWeight: "500" },
  rate: {
    fontSize: 10,
    fontWeight: "600",
    color: T.accent,
    marginBottom: 4,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  location: { fontSize: 9, color: T.textMuted },
});

// ============================================================================
// 4. TRENDING PRODUCTS - Modern Product Cards
// ============================================================================

export const ModernTrendingProducts = memo(
  ({ products }: { products?: TrendingProductItem[] }) => {
    if (!products || products.length === 0) return null;
    const t = useT();
    const entrance = useEntranceAnim(200);
    const { favorites, toggleFavorite } = useFavorites();

    const isFav = (id: string | number) =>
      favorites.some((f) => f.id === String(id));

    return (
      <Animated.View style={[trendingStyles.wrapper, entrance]}>
        <SectionHeader
          title="Sản phẩm nổi bật"
          emoji="🔥"
          badge="MỚI"
          badgeColor={t.danger}
          seeAllRoute="/shop"
          accentColor={t.accent}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={trendingStyles.list}
        >
          {products.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                trendingStyles.card,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
              onPress={() => router.push(p.route as Href)}
              activeOpacity={0.85}
            >
              <View style={trendingStyles.imgWrap}>
                <Image source={{ uri: p.image }} style={trendingStyles.img} />
                {p.isNew && (
                  <View
                    style={[
                      trendingStyles.badge,
                      { backgroundColor: t.primary },
                    ]}
                  >
                    <Text style={trendingStyles.badgeText}>MỚI</Text>
                  </View>
                )}
                {p.isBestseller && (
                  <View
                    style={[
                      trendingStyles.badge,
                      { backgroundColor: t.accent },
                    ]}
                  >
                    <Text style={trendingStyles.badgeText}>BÁN CHẠY</Text>
                  </View>
                )}
                {/* Heart / Favorite Button */}
                <TouchableOpacity
                  style={trendingStyles.heartBtn}
                  onPress={() =>
                    toggleFavorite({
                      id: String(p.id),
                      name: p.name,
                      price: p.price,
                      image: p.image || "",
                      type: "product" as const,
                    })
                  }
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons
                    name={isFav(p.id) ? "heart" : "heart-outline"}
                    size={18}
                    color={isFav(p.id) ? "#EE4D2D" : "#FFFFFF"}
                  />
                </TouchableOpacity>
              </View>
              <View style={trendingStyles.body}>
                <Text
                  style={[trendingStyles.name, { color: t.text }]}
                  numberOfLines={2}
                >
                  {p.name}
                </Text>
                <Text style={trendingStyles.price}>{formatPrice(p.price)}</Text>
                <View style={trendingStyles.metaRow}>
                  <View style={trendingStyles.metaItem}>
                    <Ionicons
                      name="eye-outline"
                      size={10}
                      color={t.textMuted}
                    />
                    <Text style={trendingStyles.metaText}>
                      {formatCompact(p.viewCount)}
                    </Text>
                  </View>
                  <View style={trendingStyles.metaItem}>
                    <Ionicons name="cart-outline" size={10} color={t.primary} />
                    <Text
                      style={[trendingStyles.metaText, { color: t.primary }]}
                    >
                      {formatCompact(p.soldCount)}
                    </Text>
                  </View>
                </View>
                <Text style={trendingStyles.seller} numberOfLines={1}>
                  <Text
                    onPress={() =>
                      p.sellerId &&
                      router.push(`/profile/${p.sellerId}` as Href)
                    }
                    style={
                      p.sellerId
                        ? { textDecorationLine: "underline" as const }
                        : undefined
                    }
                  >
                    {p.seller}
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

const trendingStyles = StyleSheet.create({
  wrapper: { marginTop: T.xl },
  list: { paddingHorizontal: T.lg, gap: 10 },
  card: {
    width: 165,
    backgroundColor: T.surface,
    borderRadius: T.radiusLg,
    overflow: "hidden",
    ...T.shadowMd,
    borderWidth: 1,
    borderColor: T.border,
  } as any,
  imgWrap: { position: "relative" },
  heartBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  } as any,
  img: {
    width: "100%",
    height: 130,
    backgroundColor: T.border,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: T.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: T.white, fontSize: 9, fontWeight: "700" },
  body: { padding: T.sm },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: T.text,
    marginBottom: 4,
    lineHeight: 16,
    height: 32,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#EF4444",
    marginBottom: 4,
  },
  metaRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 10, color: T.textMuted, fontWeight: "500" },
  seller: {
    fontSize: 9,
    color: T.textMuted,
    fontStyle: "italic",
  },
});

// ============================================================================
// 5. BESTSELLERS - Horizontal showcase
// ============================================================================

export const ModernBestsellers = memo(
  ({ items }: { items?: BestsellerItem[] }) => {
    if (!items || items.length === 0) return null;
    const t = useT();
    const entrance = useEntranceAnim(100);

    return (
      <Animated.View style={[bestStyles.wrapper, entrance]}>
        <SectionHeader
          title="Bán chạy nhất"
          emoji="🏆"
          seeAllRoute="/shop?sort=bestseller"
          accentColor={t.accent}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={bestStyles.list}
        >
          {items.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={bestStyles.card}
              onPress={() => router.push(item.route as Href)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  idx === 0
                    ? ["#FEF3C7", "#FFFBEB"]
                    : idx === 1
                      ? ["#F1F5F9", "#F8FAFC"]
                      : ["#FFF7ED", "#FFFBEB"]
                }
                style={bestStyles.cardGradient}
              >
                <View style={bestStyles.rankCircle}>
                  <Text style={bestStyles.rankNum}>#{idx + 1}</Text>
                </View>
                <Image source={{ uri: item.image }} style={bestStyles.img} />
                <Text style={bestStyles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={bestStyles.price}>{formatPrice(item.price)}</Text>
                <View style={bestStyles.statsRow}>
                  <Ionicons name="star" size={10} color="#EAB308" />
                  <Text style={bestStyles.statText}>{item.rating}</Text>
                  <Text style={bestStyles.soldText}>
                    • {formatCompact(item.soldCount)} đã bán
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  },
);

const bestStyles = StyleSheet.create({
  wrapper: { marginTop: T.xl },
  list: { paddingHorizontal: T.lg, gap: 10 },
  card: {
    width: 150,
    borderRadius: T.radiusLg,
    overflow: "hidden",
    ...T.shadowMd,
    borderWidth: 1,
    borderColor: T.border,
  } as any,
  cardGradient: {
    padding: T.md,
    alignItems: "center",
    minHeight: 200,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  rankNum: { color: T.white, fontSize: 11, fontWeight: "800" },
  img: {
    width: 80,
    height: 80,
    borderRadius: T.radiusMd,
    backgroundColor: T.border,
    marginBottom: 8,
  },
  name: {
    fontSize: 11,
    fontWeight: "600",
    color: T.text,
    textAlign: "center",
    lineHeight: 15,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
    marginBottom: 4,
  },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { fontSize: 10, fontWeight: "600", color: T.text },
  soldText: { fontSize: 9, color: T.textMuted },
});

// ============================================================================
// 6. NEW ARRIVALS - Timeline style
// ============================================================================

export const ModernNewArrivals = memo(
  ({ items }: { items?: NewArrivalItem[] }) => {
    if (!items || items.length === 0) return null;
    const t = useT();
    const entrance = useEntranceAnim(150);

    return (
      <Animated.View style={[newStyles.wrapper, entrance]}>
        <SectionHeader
          title="Hàng mới về"
          emoji="🆕"
          badge="NEW"
          badgeColor={t.secondary}
          seeAllRoute="/shop?sort=newest"
          accentColor={t.secondary}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={newStyles.list}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={newStyles.card}
              onPress={() => router.push(item.route as Href)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.image }} style={newStyles.img} />
              <View style={newStyles.newTag}>
                <Text style={newStyles.newTagText}>
                  {item.daysNew <= 1 ? "HÔM NAY" : `${item.daysNew} ngày`}
                </Text>
              </View>
              <View style={newStyles.body}>
                <Text style={newStyles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={newStyles.price}>{formatPrice(item.price)}</Text>
                <Text style={newStyles.seller} numberOfLines={1}>
                  <Text
                    onPress={() =>
                      item.sellerId &&
                      router.push(`/profile/${item.sellerId}` as Href)
                    }
                    style={
                      item.sellerId
                        ? { textDecorationLine: "underline" as const }
                        : undefined
                    }
                  >
                    {item.seller}
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

const newStyles = StyleSheet.create({
  wrapper: { marginTop: T.xl },
  list: { paddingHorizontal: T.lg, gap: 10 },
  card: {
    width: 140,
    backgroundColor: T.surface,
    borderRadius: T.radiusLg,
    overflow: "hidden",
    ...T.shadow,
    borderWidth: 1,
    borderColor: T.border,
  } as any,
  img: { width: "100%", height: 110, backgroundColor: T.border },
  newTag: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: T.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newTagText: { color: T.white, fontSize: 9, fontWeight: "700" },
  body: { padding: T.sm },
  name: {
    fontSize: 11,
    fontWeight: "600",
    color: T.text,
    lineHeight: 15,
    height: 30,
    marginBottom: 4,
  },
  price: { fontSize: 14, fontWeight: "800", color: "#EF4444", marginBottom: 2 },
  seller: { fontSize: 9, color: T.textMuted, fontStyle: "italic" },
});

// ============================================================================
// 7. WORKERS BY TYPE - Category chips
// ============================================================================

export const ModernWorkersByType = memo(
  ({ data }: { data?: WorkerByType[] }) => {
    if (!data || data.length === 0) return null;
    const t = useT();
    const entrance = useEntranceAnim(120);

    const COLORS_POOL = [
      t.primary,
      t.secondary,
      t.accent,
      t.purple,
      "#EC4899",
      "#14B8A6",
      "#F59E0B",
      "#6366F1",
    ];

    return (
      <Animated.View style={[wbtStyles.wrapper, entrance]}>
        <SectionHeader
          title="Nhân lực theo loại"
          emoji="👷"
          badge={data.length}
          badgeColor={t.accent}
          seeAllRoute="/workers"
          accentColor={t.accent}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={wbtStyles.list}
        >
          {data.slice(0, 10).map((item, idx) => {
            const color = COLORS_POOL[idx % COLORS_POOL.length];
            return (
              <TouchableOpacity
                key={item.type}
                style={[wbtStyles.chip, { borderColor: color + "40" }]}
                onPress={() =>
                  router.push(
                    `/workers?specialty=${item.type.toLowerCase()}` as Href,
                  )
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[color + "15", color + "08"]}
                  style={wbtStyles.chipGradient}
                >
                  <View
                    style={[
                      wbtStyles.iconCircle,
                      { backgroundColor: color + "20" },
                    ]}
                  >
                    <Ionicons name="construct" size={18} color={color} />
                  </View>
                  <Text style={wbtStyles.chipName} numberOfLines={1}>
                    {item.displayName}
                  </Text>
                  <View style={wbtStyles.chipMeta}>
                    <Text style={[wbtStyles.chipCount, { color }]}>
                      {item.count} thợ
                    </Text>
                    <View style={wbtStyles.chipRating}>
                      <Ionicons name="star" size={9} color="#EAB308" />
                      <Text style={wbtStyles.chipRatingText}>
                        {item.avgRating}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    );
  },
);

const wbtStyles = StyleSheet.create({
  wrapper: { marginTop: T.xl },
  list: { paddingHorizontal: T.lg, gap: 10 },
  chip: {
    width: 110,
    borderRadius: T.radiusLg,
    overflow: "hidden",
    borderWidth: 1.5,
    ...T.shadow,
  } as any,
  chipGradient: {
    padding: T.md,
    alignItems: "center",
    minHeight: 120,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  chipName: {
    fontSize: 11,
    fontWeight: "700",
    color: T.text,
    textAlign: "center",
    marginBottom: 6,
  },
  chipMeta: { alignItems: "center", gap: 3 },
  chipCount: { fontSize: 10, fontWeight: "700" },
  chipRating: { flexDirection: "row", alignItems: "center", gap: 2 },
  chipRatingText: { fontSize: 9, fontWeight: "600", color: T.text },
});

// ============================================================================
// 8. DEAL BANNERS - Modern gradient cards
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
    colors: ["#EF4444", "#F97316"],
    route: "/promotions/deal-1k",
    icon: "pricetag",
  },
  {
    id: 2,
    title: "GIẢM ĐẾN",
    discount: "88%",
    subtitle: "SĂN DEAL XD",
    colors: ["#16A34A", "#22C55E"],
    route: "/promotions/sale-88",
    icon: "flash",
  },
  {
    id: 3,
    title: "TÌ DEAL NHƯ MƠ",
    subtitle: "NĂM MỚI NHƯ Ý",
    colors: ["#F97316", "#FBBF24"],
    route: "/promotions/tet-deal",
    icon: "gift",
  },
];

export const ModernDealBanners = memo(() => (
  <View style={dealStyles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={dealStyles.list}
    >
      {DEAL_BANNERS.map((banner) => (
        <TouchableOpacity
          key={banner.id}
          activeOpacity={0.85}
          onPress={() => router.push(banner.route as Href)}
        >
          <LinearGradient
            colors={banner.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dealStyles.card}
          >
            <View style={dealStyles.cardContent}>
              <Text style={dealStyles.cardTitle}>{banner.title}</Text>
              {banner.discount && (
                <Text style={dealStyles.discount}>{banner.discount}</Text>
              )}
              {banner.subtitle && (
                <Text style={dealStyles.subtitle}>{banner.subtitle}</Text>
              )}
              <View style={dealStyles.ctaRow}>
                <Text style={dealStyles.ctaText}>MUA NGAY</Text>
                <Ionicons name="arrow-forward" size={11} color="#FFF" />
              </View>
            </View>
            {banner.icon && (
              <Ionicons
                name={banner.icon}
                size={42}
                color="rgba(255,255,255,0.2)"
                style={dealStyles.bgIcon}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
));

const dealStyles = StyleSheet.create({
  container: { marginTop: T.lg, paddingLeft: T.lg },
  list: { gap: 10, paddingRight: T.lg },
  card: {
    width: (SCREEN_W - 52) / 3,
    height: 110,
    borderRadius: T.radiusMd,
    padding: T.sm,
    overflow: "hidden",
    position: "relative",
  },
  cardContent: { flex: 1, justifyContent: "space-between" },
  cardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: T.white,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  discount: {
    fontSize: 26,
    fontWeight: "900",
    color: T.white,
    marginTop: -2,
  },
  subtitle: { fontSize: 10, fontWeight: "700", color: T.white },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 6,
  },
  ctaText: { fontSize: 9, fontWeight: "700", color: T.white },
  bgIcon: { position: "absolute", right: 6, top: 8, opacity: 0.4 },
});

// ============================================================================
// 9. QUICK ACTIONS - Modern circular buttons
// ============================================================================

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
  route?: string;
  action?: () => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "call",
    icon: "call",
    label: "Gọi ngay",
    color: "#16A34A",
    bgColor: "#DCFCE7",
    route: "/call",
  },
  {
    id: "chat",
    icon: "chatbubble-ellipses",
    label: "Chat tư vấn",
    color: "#0EA5E9",
    bgColor: "#E0F2FE",
    route: "/chat",
  },
  {
    id: "ai",
    icon: "sparkles",
    label: "AI Thiết kế",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    route: "/ai-design",
  },
  {
    id: "workers",
    icon: "construct",
    label: "Tìm thợ",
    color: "#F97316",
    bgColor: "#FFF7ED",
    route: "/workers",
  },
  {
    id: "calculator",
    icon: "calculator",
    label: "Dự toán",
    color: "#14B8A6",
    bgColor: "#CCFBF1",
    route: "/calculators",
  },
  {
    id: "handbook",
    icon: "book",
    label: "Sổ tay KSXD",
    color: "#0D9488",
    bgColor: "#CCFBF1",
    route: "/handbook",
  },
];

export const ModernQuickActions = memo(() => {
  const t = useT();
  return (
    <View
      style={[
        qaStyles.container,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={qaStyles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={qaStyles.item}
            onPress={() => {
              if (action.action) action.action();
              else if (action.route) router.push(action.route as Href);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[qaStyles.iconCircle, { backgroundColor: action.bgColor }]}
            >
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <Text style={[qaStyles.label, { color: t.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const qaStyles = StyleSheet.create({
  container: {
    marginHorizontal: T.lg,
    marginTop: T.md,
    backgroundColor: T.surface,
    borderRadius: T.radiusLg,
    paddingVertical: T.lg,
    paddingHorizontal: T.sm,
    borderWidth: 1,
    borderColor: "rgba(13,148,136,0.06)",
    ...T.shadow,
  } as any,
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: T.md,
  },
  item: { alignItems: "center", width: "33%" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: T.radiusFull,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  label: { fontSize: 11, color: T.text, fontWeight: "600" },
});

// ============================================================================
// 10. WEATHER WIDGET - Glassmorphism
// ============================================================================

export const ModernWeatherWidget = memo(() => {
  const [weather] = useState({
    temp: 32,
    condition: "sunny" as "sunny" | "cloudy" | "rainy" | "partly-sunny",
    humidity: 65,
    description: "Thời tiết đẹp, phù hợp thi công ngoài trời",
  });

  const getIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return "sunny";
      case "cloudy":
        return "cloudy" as const;
      case "rainy":
        return "rainy" as const;
      default:
        return "partly-sunny" as const;
    }
  };

  const getColors = (): [string, string] => {
    if (weather.temp >= 30) return ["#F97316", "#EF4444"];
    if (weather.temp >= 20) return ["#16A34A", "#22C55E"];
    return ["#0EA5E9", "#06B6D4"];
  };

  return (
    <TouchableOpacity
      style={weatherStyles.container}
      onPress={() => router.push("/weather" as Href)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={getColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={weatherStyles.gradient}
      >
        <View style={weatherStyles.left}>
          <Ionicons name={getIcon()} size={36} color={T.white} />
          <View>
            <Text style={weatherStyles.temp}>{weather.temp}°C</Text>
            <Text style={weatherStyles.humidity}>
              Độ ẩm: {weather.humidity}%
            </Text>
          </View>
        </View>
        <View style={weatherStyles.right}>
          <Text style={weatherStyles.desc}>{weather.description}</Text>
          <View style={weatherStyles.badge}>
            <Ionicons name="checkmark-circle" size={12} color={T.white} />
            <Text style={weatherStyles.badgeText}>Thi công OK</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const weatherStyles = StyleSheet.create({
  container: {
    marginHorizontal: T.lg,
    marginTop: T.lg,
    borderRadius: T.radiusLg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(13,148,136,0.08)",
    ...T.shadowMd,
  } as any,
  gradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: T.lg,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  temp: { fontSize: 22, fontWeight: "800", color: T.white },
  humidity: { fontSize: 11, color: "rgba(255,255,255,0.85)" },
  right: { alignItems: "flex-end", maxWidth: "48%" },
  desc: {
    fontSize: 11,
    color: T.white,
    textAlign: "right",
    marginBottom: 8,
    lineHeight: 15,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: T.radiusFull,
    gap: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "600", color: T.white },
});

// ============================================================================
// 11. AI ASSISTANT FLOATING BUTTON - Modern
// ============================================================================

export const ModernAIButton = memo(() => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim]);

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
          colors={["#7C3AED", "#0D9488"]}
          style={aiStyles.gradient}
        >
          <MaterialCommunityIcons
            name="robot-happy"
            size={26}
            color={T.white}
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
    right: T.lg,
    alignItems: "center",
  },
  button: {
    width: 54,
    height: 54,
    borderRadius: 27,
    ...T.shadowMd,
  } as any,
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: T.text,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  tooltipText: { fontSize: 10, color: T.white, fontWeight: "500" },
});

// ============================================================================
// 12. PROMO BANNER SLIDER - Modern
// ============================================================================

const PROMO_BANNERS = [
  {
    id: 1,
    image: require("@/assets/banner/BANNER-1.jpg"),
    route: "/services",
  },
  {
    id: 2,
    image: require("@/assets/banner/BANNER-2.jpeg"),
    route: "/workers",
  },
  {
    id: 3,
    image: require("@/assets/banner/BANNER-3.jpeg"),
    route: "/shop",
  },
  {
    id: 4,
    image: require("@/assets/banner/BANNER-4.jpeg"),
    route: "/services/house-design",
  },
  {
    id: 5,
    image: require("@/assets/banner/BANNER-5.jpeg"),
    route: "/finishing",
  },
  {
    id: 6,
    image: require("@/assets/banner/BANNER-6.jpeg"),
    route: "/workers",
  },
];

export const ModernPromoBanner = memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % PROMO_BANNERS.length;
        scrollRef.current?.scrollTo({
          x: next * (SCREEN_W - 32),
          animated: true,
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={promoStyles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / (SCREEN_W - 32),
          );
          setActiveIndex(idx);
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
                style={promoStyles.bannerImg}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.35)"]}
                style={promoStyles.overlay}
              />
              <View style={promoStyles.ctaWrap}>
                <View style={promoStyles.ctaBtn}>
                  <Text style={promoStyles.ctaText}>Khám phá</Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Dots */}
      <View style={promoStyles.dots}>
        {PROMO_BANNERS.map((_, idx) => (
          <View
            key={idx}
            style={[
              promoStyles.dot,
              idx === activeIndex && promoStyles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const promoStyles = StyleSheet.create({
  container: { marginTop: T.lg, paddingHorizontal: T.lg },
  banner: {
    width: SCREEN_W - 32,
    height: 195,
    borderRadius: T.radiusXl,
    overflow: "hidden",
    position: "relative",
    backgroundColor: T.border,
    borderWidth: 1,
    borderColor: "rgba(13,148,136,0.08)",
    ...T.shadowMd,
  } as any,
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  ctaWrap: { position: "absolute", bottom: 14, left: T.lg },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: T.radiusFull,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctaText: { fontSize: 12, fontWeight: "700", color: T.white },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.border,
  },
  dotActive: {
    width: 26,
    backgroundColor: T.primary,
    borderRadius: 5,
  },
});

// ============================================================================
// LIVE VIDEO SECTION - Modern
// ============================================================================

export const ModernLiveVideoSection = memo(() => {
  const LIVE_ITEMS = [
    {
      id: 1,
      title: "Kỹ thuật xây tường gạch",
      thumbnail: "https://picsum.photos/120/160?random=40",
      isLive: true,
    },
    {
      id: 2,
      title: "Thi công nội thất cao cấp",
      thumbnail: "https://picsum.photos/120/160?random=41",
      isLive: true,
    },
  ];
  const VIDEO_ITEMS = [
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

  return (
    <View style={liveStyles.wrapper}>
      <View style={liveStyles.row}>
        {/* LIVE */}
        <View style={[liveStyles.section, { backgroundColor: "#FEF2F2" }]}>
          <TouchableOpacity
            style={liveStyles.sectionHead}
            onPress={() => router.push("/live" as Href)}
          >
            <Text style={[liveStyles.sectionTitle, { color: "#EF4444" }]}>
              XÂY DỰNG LIVE
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#EF4444" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={liveStyles.scrollContent}
          >
            {LIVE_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={liveStyles.thumbWrap}
                onPress={() => router.push(`/live/${item.id}` as Href)}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={liveStyles.thumb}
                />
                {item.isLive && (
                  <View style={liveStyles.liveBadge}>
                    <View style={liveStyles.liveDot} />
                    <Text style={liveStyles.liveText}>LIVE</Text>
                  </View>
                )}
                <Text style={liveStyles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* VIDEO */}
        <View
          style={[liveStyles.section, { backgroundColor: T.secondaryLight }]}
        >
          <TouchableOpacity
            style={liveStyles.sectionHead}
            onPress={() => router.push("/videos" as Href)}
          >
            <Text style={[liveStyles.sectionTitle, { color: T.secondary }]}>
              VIDEO XÂY DỰNG
            </Text>
            <Ionicons name="chevron-forward" size={14} color={T.secondary} />
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={liveStyles.scrollContent}
          >
            {VIDEO_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={liveStyles.thumbWrap}
                onPress={() => router.push(`/videos/${item.id}` as Href)}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={liveStyles.thumb}
                />
                <View style={liveStyles.viewsBadge}>
                  <Ionicons name="eye-outline" size={10} color="#FFF" />
                  <Text style={liveStyles.viewsText}>{item.views}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
});

const liveStyles = StyleSheet.create({
  wrapper: {
    marginTop: T.lg,
    paddingHorizontal: T.lg,
  },
  row: { flexDirection: "row", gap: T.md },
  section: {
    flex: 1,
    borderRadius: T.radiusMd,
    padding: T.sm,
    overflow: "hidden",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: T.sm,
  },
  sectionTitle: { fontSize: 12, fontWeight: "700", flex: 1 },
  scrollContent: { gap: T.sm },
  thumbWrap: { width: 80 },
  thumb: {
    width: 80,
    height: 100,
    borderRadius: T.radiusSm,
    backgroundColor: T.border,
  },
  liveBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#EF4444",
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
    backgroundColor: T.white,
  },
  liveText: { color: T.white, fontSize: 8, fontWeight: "700" },
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
  viewsText: { color: T.white, fontSize: 9, fontWeight: "600" },
  itemTitle: { fontSize: 10, color: T.text, marginTop: 4, lineHeight: 13 },
});

// ============================================================================
// RE-EXPORT all for convenience
// ============================================================================
export { SectionHeader };
