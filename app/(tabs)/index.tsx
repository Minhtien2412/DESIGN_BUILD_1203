/**
 * Home Screen — Redesigned to match Figma layout
 * Clean section-based layout with inline search hints
 *
 * Sections:
 * 1. Search bar
 * 2. DỊCH VỤ — Core services grid (3 rows × 4 cols)
 * 3. DESIGN LIVE — Horizontal live thumbnails
 * 4. Banner carousel
 * 5. TIỆN ÍCH THIẾT KẾ — Design services (2×4) with search hint
 * 6. TIỆN ÍCH XÂY DỰNG — Construction workers (3×4) with search hint
 * 7. TIỆN ÍCH HOÀN THIỆN — Finishing workers (2×4) with search hint
 * 8. Banner
 * 9. TIỆN ÍCH BẢO TRÌ - SỬA CHỮA — Maintenance (2×4) with search hint
 * 10. Banner
 * 11. TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ — Equipment (2×4) with search hint
 * 12. Banner
 * 13. CỘNG ĐỒNG — Community icons (2×3) Ionicons grid
 * 14. VIDEO CONSTRUCTIONS — Horizontal video thumbnails
 *
 * @redesigned 2026-03-05
 */

import { useSafeAreaInsets } from "@/components/ui/safe-area";
import { useCart } from "@/context/cart-context";
import { NotificationControllerContext } from "@/context/NotificationControllerContext";
import { useRole } from "@/context/RoleContext";
import {
  CATEGORY_ITEMS,
  COMMUNITY_ITEMS,
  CommunityItem,
  CONSTRUCTION_WORKERS,
  DESIGN_LIVE,
  DESIGN_SERVICES,
  EQUIPMENT_ITEMS,
  FINISHING_WORKERS,
  MAINTENANCE_WORKERS,
  SERVICES,
  WorkerItem,
} from "@/data/home-data";
import { getPopularVideos, VideoItem } from "@/data/videos";
import { useTabBarPadding } from "@/hooks/ui/use-tab-bar-padding";
import { useWorkerStats, WORKER_TYPE_MAP } from "@/hooks/useWorkerStats";
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;

// ═══════════════════════════════════════════════════════════════════════
// SEARCH HEADER — With role switch (Khách / Thợ)
// ═══════════════════════════════════════════════════════════════════════
const SearchHeader = memo<{
  isCustomer: boolean;
  onToggleRole: () => void;
  cartCount?: number;
  notifCount?: number;
  workerLabel?: string;
  customerLabel?: string;
  searchPlaceholder?: string;
}>(
  ({
    isCustomer,
    onToggleRole,
    cartCount = 0,
    notifCount = 0,
    workerLabel = "Thợ",
    customerLabel = "Khách",
    searchPlaceholder = "Tìm kiếm sản phẩm, dịch vụ...",
  }) => (
    <View style={hdr.wrapper}>
      {/* Role Switch Row */}
      <View style={hdr.roleRow}>
        <Text style={[hdr.roleLabel, !isCustomer && hdr.roleLabelActive]}>
          {workerLabel}
        </Text>
        <Switch
          value={isCustomer}
          onValueChange={onToggleRole}
          trackColor={{ false: "#4DA8DA", true: "#0D9488" }}
          thumbColor="#fff"
          style={hdr.switch}
        />
        <Text style={[hdr.roleLabel, isCustomer && hdr.roleLabelActive]}>
          {customerLabel}
        </Text>
      </View>

      {/* Search Bar Row */}
      <View style={hdr.container}>
        <TouchableOpacity
          style={hdr.searchBar}
          onPress={() => router.push("/search" as Href)}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <Text style={hdr.placeholder}>{searchPlaceholder}</Text>
        </TouchableOpacity>

        {/* Cart */}
        <TouchableOpacity
          style={hdr.iconBtn}
          onPress={() => router.push("/cart" as Href)}
        >
          <Ionicons name="cart-outline" size={22} color="#444" />
          {cartCount > 0 && (
            <View style={hdr.badge}>
              <Text style={hdr.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={hdr.iconBtn}
          onPress={() => router.push("/notification-center" as Href)}
        >
          <Ionicons name="notifications-outline" size={22} color="#444" />
          {notifCount > 0 && (
            <View style={hdr.badge}>
              <Text style={hdr.badgeText}>
                {notifCount > 99 ? "99+" : notifCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Menu */}
        <TouchableOpacity
          style={hdr.menuBtn}
          onPress={() => router.push("/(tabs)/menu" as Href)}
        >
          <Ionicons name="grid-outline" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  ),
);

const hdr = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 6,
    paddingBottom: 2,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  roleLabelActive: {
    color: "#0D9488",
    fontWeight: "700",
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PAD,
    paddingVertical: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  placeholder: { fontSize: 13, color: "#9CA3AF" },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  },
  badge: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION HEADER — Title + optional inline search hint
// ═══════════════════════════════════════════════════════════════════════
const SectionHeader = memo<{
  title: string;
  searchHint?: string;
  seeMore?: string;
  seeMoreLabel?: string;
}>(({ title, searchHint, seeMore, seeMoreLabel }) => (
  <View style={sec.container}>
    <View style={sec.left}>
      <Text style={sec.title}>{title}</Text>
    </View>
    {searchHint ? (
      <TouchableOpacity
        style={sec.searchPill}
        onPress={() => router.push("/search" as Href)}
        activeOpacity={0.7}
      >
        <Text style={sec.hintText} numberOfLines={1}>
          {searchHint}
        </Text>
        <Ionicons name="search-outline" size={10} color="#999" />
      </TouchableOpacity>
    ) : seeMore ? (
      <TouchableOpacity
        onPress={() => router.push(seeMore as Href)}
        hitSlop={8}
        style={sec.seeMoreBtn}
      >
        <Text style={sec.seeMoreText}>{seeMoreLabel || "XEM THÊM"}</Text>
        <Ionicons name="chevron-forward" size={12} color="#161616" />
      </TouchableOpacity>
    ) : null}
  </View>
));

const sec = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PAD,
    marginTop: 20,
    marginBottom: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: "#161616",
    letterSpacing: 0.5,
  },
  searchPill: {
    flex: 1,
    maxWidth: 230,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  hintText: {
    fontSize: 9,
    fontStyle: "italic",
    color: "rgba(0,0,0,0.7)",
    flex: 1,
    marginRight: 6,
  },
  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeMoreText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#161616",
  },
});

// ═══════════════════════════════════════════════════════════════════════
// ICON GRID — Simple icon + label grid (4 cols)
// ═══════════════════════════════════════════════════════════════════════
interface GridItem {
  id: number;
  label: string;
  icon: ImageSourcePropType;
  route: string;
}

const IconGrid = memo<{ data: GridItem[]; columns?: number }>(
  ({ data, columns = 4 }) => {
    const cellW = (SW - PAD * 2) / columns;

    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: PAD,
        }}
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{ width: cellW, alignItems: "center", marginBottom: 14 }}
            onPress={() => router.push(item.route as Href)}
            activeOpacity={0.7}
          >
            <View style={ig.box}>
              <Image source={item.icon} style={ig.img} resizeMode="contain" />
            </View>
            <Text style={ig.label} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
);

const ig = StyleSheet.create({
  box: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  img: { width: 48, height: 48 },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    lineHeight: 13,
    maxWidth: 72,
  },
});

// ═══════════════════════════════════════════════════════════════════════
// WORKER GRID — Simple icon + label grid for WorkerItem[]
// ═══════════════════════════════════════════════════════════════════════
const WorkerIconGrid = memo<{ data: WorkerItem[] }>(({ data }) => {
  const cellW = (SW - PAD * 2) / 4;

  const onWorkerPress = useCallback((item: WorkerItem) => {
    // Non-worker items (materials, equipment, etc.) navigate directly to their route
    if (!item.route.includes("specialty=")) {
      router.push(item.route as Href);
      return;
    }
    // Navigate to the booking flow with the worker's specialty pre-selected
    const serviceId =
      item.route.split("specialty=")[1] ||
      item.label.toLowerCase().replace(/\s+/g, "-");
    router.push({
      pathname: "/booking/search-service",
      params: { preselect: serviceId, serviceName: item.label },
    } as Href);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: PAD,
      }}
    >
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={{ width: cellW, alignItems: "center", marginBottom: 14 }}
          onPress={() => onWorkerPress(item)}
          activeOpacity={0.7}
        >
          <View style={ig.box}>
            <Image source={item.icon} style={ig.img} resizeMode="contain" />
          </View>
          <Text style={ig.label} numberOfLines={2}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// COMMUNITY GRID — Ionicons-based 3-column grid for community section
// ═══════════════════════════════════════════════════════════════════════
const CommunityGrid = memo<{ data: CommunityItem[] }>(({ data }) => {
  const cellW = (SW - PAD * 2) / 3;

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: PAD,
      }}
    >
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={{ width: cellW, alignItems: "center", marginBottom: 14 }}
          onPress={() => router.push(item.route as Href)}
          activeOpacity={0.7}
        >
          <View style={[cg.box, { backgroundColor: item.bgColor }]}>
            <Ionicons
              name={item.iconName as any}
              size={26}
              color={item.iconColor}
            />
          </View>
          <Text style={ig.label} numberOfLines={2}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const cg = StyleSheet.create({
  box: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});

// ═══════════════════════════════════════════════════════════════════════
// DESIGN LIVE — Horizontal live thumbnails with LIVE badge
// ═══════════════════════════════════════════════════════════════════════
const LiveSection = memo(() => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: PAD, gap: 6 }}
  >
    {DESIGN_LIVE.map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push(item.route as Href)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.image }} style={lv.thumb} />
        {item.badge && (
          <View style={lv.badge}>
            <View style={lv.dot} />
            <Text style={lv.badgeTxt}>Live</Text>
          </View>
        )}
      </TouchableOpacity>
    ))}
  </ScrollView>
));

const lv = StyleSheet.create({
  thumb: {
    width: 80,
    height: 110,
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
  },
  badge: {
    position: "absolute",
    top: 3,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 1,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF0000",
  },
  badgeTxt: {
    fontSize: 8,
    fontWeight: "600",
    color: "#fff",
  },
});

// ═══════════════════════════════════════════════════════════════════════
// PROMO BANNER CAROUSEL — 4 independent sets, no duplicates across sections
// ═══════════════════════════════════════════════════════════════════════
type BannerItem = { id: string; image: ImageSourcePropType; route: string };

/** Banner 0 — sau DỊCH VỤ: banner-home 1-3 (dịch vụ & thiết kế) */
const DESIGN_BANNERS: BannerItem[] = [
  {
    id: "d1",
    image: require("@/assets/banner/banner-home-1.jpg"),
    route: "/design-library",
  },
  {
    id: "d2",
    image: require("@/assets/banner/banner-home-2.jpg"),
    route: "/consultation",
  },
  {
    id: "d3",
    image: require("@/assets/banner/banner-home-3.jpg"),
    route: "/categories",
  },
];

/** Banner 1 — sau XÂY DỰNG & HOÀN THIỆN: banner-home 4-6 + BANNER-1 (thi công) */
const CONSTRUCTION_BANNERS: BannerItem[] = [
  {
    id: "c1",
    image: require("@/assets/banner/banner-home-4.jpg"),
    route: "/construction",
  },
  {
    id: "c2",
    image: require("@/assets/banner/banner-home-5.jpg"),
    route: "/find-workers",
  },
  {
    id: "c3",
    image: require("@/assets/banner/banner-home-6.jpg"),
    route: "/budget",
  },
  {
    id: "c4",
    image: require("@/assets/banner/BANNER-1.jpg"),
    route: "/construction",
  },
];

/** Banner 2 — sau BẢO TRÌ SỬA CHỮA: BANNER-4/5/6 (bảo trì) */
const MAINTENANCE_BANNERS: BannerItem[] = [
  {
    id: "m1",
    image: require("@/assets/banner/BANNER-4.jpeg"),
    route: "/find-workers",
  },
  {
    id: "m2",
    image: require("@/assets/banner/BANNER-5.jpeg"),
    route: "/customer-support",
  },
  {
    id: "m3",
    image: require("@/assets/banner/BANNER-6.jpeg"),
    route: "/quote-request",
  },
];

/** Banner 3 — sau MUA SẮM: ảnh banner-promo (khuyến mãi / mua sắm) */
const SHOPPING_BANNERS: BannerItem[] = [
  {
    id: "s1",
    image: require("@/assets/banner/banner-promo-1.jpg"),
    route: "/categories",
  },
  {
    id: "s2",
    image: require("@/assets/banner/banner-promo-2.jpg"),
    route: "/categories",
  },
  {
    id: "s3",
    image: require("@/assets/banner/banner-promo-3.jpg"),
    route: "/search",
  },
  {
    id: "s4",
    image: require("@/assets/banner/banner-promo-4.jpg"),
    route: "/search",
  },
  {
    id: "s5",
    image: require("@/assets/banner/banner-promo-5.jpg"),
    route: "/cart",
  },
];

const BANNER_W = SW - PAD * 2;
const BANNER_H = BANNER_W * 0.56;

const PromoBanner = memo<{ data: BannerItem[] }>(({ data }) => {
  const flatRef = useRef<FlatList>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = (indexRef.current + 1) % data.length;
      indexRef.current = next;
      setActiveIdx(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
    }, 5000);
  }, [data.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_W);
      indexRef.current = idx;
      setActiveIdx(idx);
      startTimer();
    },
    [startTimer],
  );

  return (
    <View style={{ marginTop: 16, paddingHorizontal: PAD }}>
      <FlatList
        ref={flatRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: BANNER_W,
          offset: BANNER_W * index,
          index,
        })}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(item.route as Href)}
            style={{ width: BANNER_W }}
          >
            <Image
              source={item.image}
              style={{
                width: BANNER_W,
                height: BANNER_H,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
      <View style={bn.dots}>
        {data.map((_, i) => (
          <View key={i} style={[bn.dot, i === activeIdx && bn.dotActive]} />
        ))}
      </View>
    </View>
  );
});

const bn = StyleSheet.create({
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#0D9488",
    borderRadius: 4,
  },
});

// ═══════════════════════════════════════════════════════════════════════
// VIDEO SECTION — Horizontal video thumbnails with Live badge
// ═══════════════════════════════════════════════════════════════════════
const VideoSection = memo<{ offset?: number }>(({ offset = 0 }) => {
  const videos = useMemo(() => {
    const all = getPopularVideos(20);
    return all.slice(offset, offset + 6);
  }, [offset]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: PAD, gap: 6 }}
    >
      {videos.map((v: VideoItem) => (
        <TouchableOpacity
          key={v.id}
          onPress={() => router.push("/demo-videos" as Href)}
          activeOpacity={0.85}
        >
          <View style={{ position: "relative" }}>
            <Image source={{ uri: v.thumbnail }} style={vs.thumb} />
            <View style={vs.liveBadge}>
              <View style={vs.liveDot} />
              <Text style={vs.liveTxt}>Live</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const vs = StyleSheet.create({
  thumb: {
    width: 80,
    height: 110,
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
  },
  liveBadge: {
    position: "absolute",
    top: 3,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 1,
    gap: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF0000",
  },
  liveTxt: {
    fontSize: 8,
    fontWeight: "600",
    color: "#fff",
  },
});

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY CHIPS — Below VIDEO CONSTRUCTIONS section
// ═══════════════════════════════════════════════════════════════════════
const CategoryRow = memo(() => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      paddingHorizontal: PAD,
      gap: 20,
      marginTop: 8,
    }}
  >
    {CATEGORY_ITEMS.slice(0, 4).map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push(item.route as Href)}
        activeOpacity={0.7}
      >
        <Text style={catRow.label}>{item.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
));

const catRow = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
});

// ═══════════════════════════════════════════════════════════════════════
// MAIN HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { isCustomer, toggleRole } = useRole();
  const { totalItems: cartCount } = useCart();
  const { t } = useI18n();
  const notifCtx = useContext(NotificationControllerContext);
  const notifCount = notifCtx?.unreadCount ?? 0;
  const tabBarPadding = useTabBarPadding();
  const insets = useSafeAreaInsets();

  const {
    stats: workerStats,
    refresh: refreshStats,
    getWorkerCount,
  } = useWorkerStats();

  // Dynamic construction workers with API stats
  const dynamicConstructionWorkers = useMemo(() => {
    return CONSTRUCTION_WORKERS.map((worker) => {
      const workerType = WORKER_TYPE_MAP[worker.id];
      if (!workerType || worker.id === 16) return worker;
      const { location, count } = getWorkerCount(workerType);
      return { ...worker, price: `${location} - ${count}` };
    });
  }, [getWorkerCount, workerStats]);

  // Dynamic finishing workers with API stats
  const dynamicFinishingWorkers = useMemo(() => {
    return FINISHING_WORKERS.map((worker) => {
      const workerType = WORKER_TYPE_MAP[worker.id + 100];
      if (!workerType || worker.id === 16) return worker;
      const { location, count } = getWorkerCount(workerType);
      return { ...worker, price: `${location} - ${count}` };
    });
  }, [getWorkerCount, workerStats]);

  // Design services as simple grid items (first 8)
  const designGridItems = useMemo(
    () =>
      DESIGN_SERVICES.slice(0, 8).map((s) => ({
        id: s.id,
        label: s.label,
        icon: s.icon,
        route: s.route,
      })),
    [],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshStats().finally(() => {
      setTimeout(() => setRefreshing(false), 1200);
    });
  }, [refreshStats]);

  return (
    <View style={[m.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SearchHeader
        isCustomer={isCustomer}
        onToggleRole={toggleRole}
        cartCount={cartCount}
        notifCount={notifCount}
        workerLabel={t("home.worker")}
        customerLabel={t("home.customer")}
        searchPlaceholder={t("home.searchPlaceholder")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D9488"]}
            tintColor="#0D9488"
          />
        }
      >
        {/* ══════ 1. DỊCH VỤ ══════ */}
        <SectionHeader title={t("home.services")} />
        <IconGrid data={SERVICES.slice(0, 12)} />

        {/* ══════ 2. DESIGN LIVE ══════ */}
        <SectionHeader
          title={t("home.designLive")}
          seeMore="/live"
          seeMoreLabel={t("home.seeMore")}
        />
        <LiveSection />

        {/* ══════ 3. Banner — Dịch vụ & Thiết kế ══════ */}
        <PromoBanner data={DESIGN_BANNERS} />

        {/* ══════ 4. TIỆN ÍCH THIẾT KẾ ══════ */}
        <SectionHeader
          title={t("home.designUtils")}
          searchHint={t("home.searchDesign")}
        />
        <IconGrid data={designGridItems} />

        {/* ══════ 5. TIỆN ÍCH XÂY DỰNG ══════ */}
        <SectionHeader
          title={t("home.constructionUtils")}
          searchHint={t("home.searchConstruction")}
        />
        <WorkerIconGrid data={dynamicConstructionWorkers.slice(0, 12)} />

        {/* ══════ 6. TIỆN ÍCH HOÀN THIỆN ══════ */}
        <SectionHeader
          title={t("home.finishingUtils")}
          searchHint={t("home.searchFinishing")}
        />
        <WorkerIconGrid data={dynamicFinishingWorkers.slice(0, 8)} />

        {/* ══════ 7. Banner — Xây dựng & Hoàn thiện ══════ */}
        <PromoBanner data={CONSTRUCTION_BANNERS} />

        {/* ══════ 8. TIỆN ÍCH BẢO TRÌ - SỬA CHỮA ══════ */}
        <SectionHeader
          title={t("home.maintenanceUtils")}
          searchHint={t("home.searchMaintenance")}
        />
        <WorkerIconGrid data={MAINTENANCE_WORKERS} />

        {/* ══════ 9. Banner — Bảo trì & Sửa chữa ══════ */}
        <PromoBanner data={MAINTENANCE_BANNERS} />

        {/* ══════ 10. TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ ══════ */}
        <SectionHeader
          title={t("home.equipmentUtils")}
          searchHint={t("home.searchEquipment")}
        />
        <IconGrid data={EQUIPMENT_ITEMS.slice(0, 8)} />

        {/* ══════ 11. Banner — Mua sắm trang thiết bị ══════ */}
        <PromoBanner data={SHOPPING_BANNERS} />

        {/* ══════ 12. CỘNG ĐỒNG ══════ */}
        <SectionHeader
          title={t("home.community")}
          seeMore="/(tabs)/social"
          seeMoreLabel={t("home.seeMore")}
        />
        <CommunityGrid data={COMMUNITY_ITEMS} />

        {/* ══════ 13. VIDEO CONSTRUCTIONS ══════ */}
        <SectionHeader title={t("home.videoConstructions")} />
        <VideoSection offset={0} />
        <CategoryRow />
      </ScrollView>
    </View>
  );
}

const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
});
