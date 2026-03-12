/**
 * FlashSaleSection — Shopee-style flash sale with countdown
 *
 * Features:
 * - Countdown timer (hh:mm:ss)
 * - Horizontal product cards with price, discount %, sold progress bar
 * - "Live" badge on promotional items
 * - Voucher label under price
 *
 * Data comes from useHomePageData → flashSaleProducts
 *
 * @created 2026-02-26
 */

import type { FlashSaleItem } from "@/hooks/useHomePageData";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ────────── Countdown Timer ──────────

function useCountdown(hours = 3) {
  const [secs, setSecs] = useState(hours * 3600);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setSecs((p) => (p <= 0 ? hours * 3600 : p - 1));
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [hours]);

  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return { h, m, s };
}

const TimerDigit = memo<{ value: string }>(({ value }) => (
  <View style={ts.digitBox}>
    <Text style={ts.digitTxt}>{value}</Text>
  </View>
));

const TimerSeparator = memo(() => <Text style={ts.sep}>:</Text>);

const CountdownTimer = memo(() => {
  const { h, m, s } = useCountdown(3);
  return (
    <View style={ts.row}>
      <TimerDigit value={h} />
      <TimerSeparator />
      <TimerDigit value={m} />
      <TimerSeparator />
      <TimerDigit value={s} />
    </View>
  );
});

const ts = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  digitBox: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 22,
    alignItems: "center",
  },
  digitTxt: { fontSize: 11, fontWeight: "800", color: "#fff" },
  sep: {
    fontSize: 12,
    fontWeight: "800",
    color: "#EF4444",
    marginHorizontal: 1,
  },
});

// ────────── Flash Sale Header ──────────

const FlashSaleHeader = memo<{ onSeeMore?: () => void }>(({ onSeeMore }) => (
  <View style={fh.container}>
    <View style={fh.left}>
      <Ionicons name="flash" size={18} color="#EF4444" />
      <Text style={fh.title}>FLASH SALE</Text>
      <CountdownTimer />
    </View>
    <TouchableOpacity onPress={onSeeMore} hitSlop={8}>
      <Text style={fh.seeMore}>XEM THÊM {">"}</Text>
    </TouchableOpacity>
  </View>
));

const fh = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
  seeMore: { fontSize: 11, fontWeight: "600", color: "#0D9488" },
});

// ────────── Product Card ──────────

function formatVND(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}đ`;
}

function discountPercent(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

const FlashSaleCard = memo<{ item: FlashSaleItem }>(({ item }) => {
  const pct = discountPercent(item.originalPrice, item.salePrice);
  const soldPct =
    item.total > 0 ? Math.min((item.sold / item.total) * 100, 100) : 0;

  const onPress = useCallback(() => {
    const route = item.route || `/product/${item.id}`;
    router.push(route as Href);
  }, [item.route, item.id]);

  return (
    <TouchableOpacity style={fc.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      <View style={fc.imgWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={fc.img}
            resizeMode="cover"
          />
        ) : (
          <View style={[fc.img, { backgroundColor: "#E2E8F0" }]} />
        )}

        {/* Discount badge */}
        {pct > 0 && (
          <View style={fc.discBadge}>
            <Text style={fc.discTxt}>-{pct}%</Text>
          </View>
        )}

        {/* Live badge */}
        {item.isLive && (
          <View style={fc.liveBadge}>
            <View style={fc.liveDot} />
            <Text style={fc.liveTxt}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Price */}
      <Text style={fc.price}>₫{formatVND(item.salePrice)}</Text>

      {/* Voucher */}
      {item.hasVoucher && (
        <View style={fc.voucherTag}>
          <Text style={fc.voucherTxt}>{item.voucherText || "Mã giảm"}</Text>
        </View>
      )}

      {/* Sold bar */}
      <View style={fc.soldRow}>
        <View style={fc.soldBarBg}>
          <View
            style={[fc.soldBarFg, { width: `${soldPct}%` as `${number}%` }]}
          />
        </View>
        <Text style={fc.soldTxt}>
          {soldPct >= 80 ? "Sắp hết" : `Đã bán ${item.sold}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const fc = StyleSheet.create({
  card: {
    width: 120,
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
  imgWrap: { width: 120, height: 120, position: "relative" },
  img: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  discBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  discTxt: { fontSize: 10, fontWeight: "800", color: "#fff" },
  liveBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  liveTxt: { fontSize: 8, fontWeight: "700", color: "#fff" },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  voucherTag: {
    marginHorizontal: 8,
    marginTop: 3,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
  voucherTxt: { fontSize: 8, fontWeight: "600", color: "#EF4444" },
  soldRow: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  soldBarBg: {
    width: "100%",
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FEE2E2",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
  },
  soldBarFg: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#EF4444",
    borderRadius: 7,
  },
  soldTxt: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    position: "absolute",
    textAlign: "center",
  },
});

// ────────── Main Component ──────────

export interface FlashSaleSectionProps {
  data: FlashSaleItem[];
  loading?: boolean;
}

export const FlashSaleSection = memo<FlashSaleSectionProps>(
  ({ data, loading }) => {
    if (!data.length && !loading) return null;

    return (
      <View>
        <FlashSaleHeader onSeeMore={() => router.push("/search" as Href)} />

        {loading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={`fsk-${i}`} style={fsk.card}>
                <View style={fsk.imgBox} />
                <View style={fsk.priceBar} />
                <View style={fsk.soldBar} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {data.map((item) => (
              <FlashSaleCard key={item.id} item={item} />
            ))}
          </ScrollView>
        )}
      </View>
    );
  },
);

const fsk = StyleSheet.create({
  card: { width: 120, borderRadius: 10, overflow: "hidden" },
  imgBox: {
    width: 120,
    height: 120,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },
  priceBar: {
    width: 80,
    height: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginTop: 8,
    marginLeft: 8,
  },
  soldBar: {
    width: 100,
    height: 14,
    backgroundColor: "#FEE2E2",
    borderRadius: 7,
    marginTop: 6,
    marginHorizontal: 8,
  },
});
