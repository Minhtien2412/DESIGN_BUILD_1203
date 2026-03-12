/**
 * TrendingSection — Sản phẩm nổi bật / Bán chạy / Mới nhất
 *
 * Three display modes in one component:
 *   - "trending"   → Horizontal cards with view count + sold count
 *   - "bestseller" → Horizontal cards with rating + sold count
 *   - "new"        → Horizontal cards with "MỚI" badge + days count
 *
 * Data from useHomePageData: trendingProducts, bestsellers, newArrivals
 *
 * @created 2026-02-26
 */

import type {
    BestsellerItem,
    NewArrivalItem,
    TrendingProductItem,
} from "@/hooks/useHomePageData";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo, useCallback } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function formatVND(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}đ`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ────────── Trending Product Card ──────────

const TrendingCard = memo<{
  item: TrendingProductItem;
  onQuickView?: (id: string) => void;
}>(({ item, onQuickView }) => {
  const onPress = useCallback(() => {
    router.push(item.route as Href);
  }, [item.route]);

  const onLongPress = useCallback(() => {
    onQuickView?.(String(item.id));
  }, [item.id, onQuickView]);

  return (
    <TouchableOpacity
      style={c.card}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.85}
    >
      <View style={c.imgWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={c.img}
            resizeMode="cover"
          />
        ) : (
          <View style={[c.img, { backgroundColor: "#E2E8F0" }]} />
        )}
        {item.isNew && (
          <View style={c.newBadge}>
            <Text style={c.newTxt}>MỚI</Text>
          </View>
        )}
        {item.isBestseller && (
          <View style={c.bestBadge}>
            <Text style={c.bestTxt}>HOT</Text>
          </View>
        )}
      </View>

      <View style={c.info}>
        <Text style={c.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={c.price}>₫{formatVND(item.price)}</Text>
        <View style={c.metaRow}>
          <Ionicons name="eye-outline" size={10} color="#94A3B8" />
          <Text style={c.metaTxt}>{formatCount(item.viewCount)}</Text>
          <Ionicons name="bag-check-outline" size={10} color="#94A3B8" />
          <Text style={c.metaTxt}>{formatCount(item.soldCount)}</Text>
        </View>
        <Text style={c.seller} numberOfLines={1}>
          {item.seller}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ────────── Bestseller Card ──────────

const BestsellerCard = memo<{
  item: BestsellerItem;
  onQuickView?: (id: string) => void;
}>(({ item, onQuickView }) => {
  const onPress = useCallback(() => {
    router.push(item.route as Href);
  }, [item.route]);

  const onLongPress = useCallback(() => {
    onQuickView?.(String(item.id));
  }, [item.id, onQuickView]);

  return (
    <TouchableOpacity
      style={c.card}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.85}
    >
      <View style={c.imgWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={c.img}
            resizeMode="cover"
          />
        ) : (
          <View style={[c.img, { backgroundColor: "#E2E8F0" }]} />
        )}
        <View style={c.bestBadge}>
          <Text style={c.bestTxt}>BÁN CHẠY</Text>
        </View>
      </View>

      <View style={c.info}>
        <Text style={c.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={c.price}>₫{formatVND(item.price)}</Text>
        <View style={c.metaRow}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={c.ratingTxt}>{item.rating.toFixed(1)}</Text>
          <Text style={c.metaTxt}>Đã bán {formatCount(item.soldCount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ────────── New Arrival Card ──────────

const NewArrivalCard = memo<{
  item: NewArrivalItem;
  onQuickView?: (id: string) => void;
}>(({ item, onQuickView }) => {
  const onPress = useCallback(() => {
    router.push(item.route as Href);
  }, [item.route]);

  const onLongPress = useCallback(() => {
    onQuickView?.(String(item.id));
  }, [item.id, onQuickView]);

  return (
    <TouchableOpacity
      style={c.card}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.85}
    >
      <View style={c.imgWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={c.img}
            resizeMode="cover"
          />
        ) : (
          <View style={[c.img, { backgroundColor: "#E2E8F0" }]} />
        )}
        <View style={c.newBadge}>
          <Text style={c.newTxt}>MỚI</Text>
        </View>
      </View>

      <View style={c.info}>
        <Text style={c.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={c.price}>₫{formatVND(item.price)}</Text>
        <View style={c.metaRow}>
          <Ionicons name="time-outline" size={10} color="#94A3B8" />
          <Text style={c.metaTxt}>{item.daysNew} ngày trước</Text>
        </View>
        <Text style={c.seller} numberOfLines={1}>
          {item.seller}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ────────── Skeleton ──────────

const ProductSkeleton = memo(() => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={c.scroll}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <View key={`psk-${i}`} style={c.card}>
        <View style={[c.img, { backgroundColor: "#E2E8F0" }]} />
        <View style={c.info}>
          <View style={psk.bar1} />
          <View style={psk.bar2} />
          <View style={psk.bar3} />
        </View>
      </View>
    ))}
  </ScrollView>
));

const psk = StyleSheet.create({
  bar1: {
    width: "80%",
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
  },
  bar2: {
    width: "50%",
    height: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginTop: 6,
  },
  bar3: {
    width: "60%",
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginTop: 4,
  },
});

// ────────── Main Exported Components ──────────

export interface TrendingSectionProps {
  data: TrendingProductItem[];
  loading?: boolean;
  onQuickView?: (id: string) => void;
}

export const TrendingSection = memo<TrendingSectionProps>(
  ({ data, loading, onQuickView }) => {
    if (loading) return <ProductSkeleton />;
    if (!data.length) return null;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={c.scroll}
      >
        {data.map((item) => (
          <TrendingCard key={item.id} item={item} onQuickView={onQuickView} />
        ))}
      </ScrollView>
    );
  },
);

export interface BestsellerSectionProps {
  data: BestsellerItem[];
  loading?: boolean;
  onQuickView?: (id: string) => void;
}

export const BestsellerSection = memo<BestsellerSectionProps>(
  ({ data, loading, onQuickView }) => {
    if (loading) return <ProductSkeleton />;
    if (!data.length) return null;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={c.scroll}
      >
        {data.map((item) => (
          <BestsellerCard key={item.id} item={item} onQuickView={onQuickView} />
        ))}
      </ScrollView>
    );
  },
);

export interface NewArrivalsSectionProps {
  data: NewArrivalItem[];
  loading?: boolean;
  onQuickView?: (id: string) => void;
}

export const NewArrivalsSection = memo<NewArrivalsSectionProps>(
  ({ data, loading, onQuickView }) => {
    if (loading) return <ProductSkeleton />;
    if (!data.length) return null;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={c.scroll}
      >
        {data.map((item) => (
          <NewArrivalCard key={item.id} item={item} onQuickView={onQuickView} />
        ))}
      </ScrollView>
    );
  },
);

// ────────── Shared Styles ──────────

const c = StyleSheet.create({
  scroll: { paddingHorizontal: 16, gap: 10 },
  card: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  imgWrap: { width: 140, height: 140, position: "relative" },
  img: {
    width: 140,
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  newBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#0D9488",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newTxt: { fontSize: 9, fontWeight: "700", color: "#fff" },
  bestBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestTxt: { fontSize: 9, fontWeight: "700", color: "#fff" },
  info: { padding: 8 },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 16,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  metaTxt: { fontSize: 9, color: "#94A3B8" },
  ratingTxt: { fontSize: 10, fontWeight: "700", color: "#F59E0B" },
  seller: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 3,
  },
});
