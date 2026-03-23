/**
 * StatsBar — Live platform statistics banner
 *
 * Shows key numbers: total products, workers, sold, avg rating.
 * Data from useHomePageData → stats.
 *
 * @created 2026-02-26
 */

import type { HomeStats } from "@/hooks/useHomePageData";
import { createShadow } from "@/utils/shadowStyles";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

function shortNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}

const StatItem = memo<StatItemProps>(({ icon, value, label, color }) => (
  <View style={s.item}>
    <View style={[s.iconWrap, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={s.value}>{value}</Text>
    <Text style={s.label}>{label}</Text>
  </View>
));

export interface StatsBarProps {
  stats: HomeStats;
  loading?: boolean;
}

export const StatsBar = memo<StatsBarProps>(({ stats, loading }) => {
  if (loading) {
    return (
      <View style={s.container}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={`ssk-${i}`} style={s.item}>
            <View style={sk.icon} />
            <View style={sk.val} />
            <View style={sk.lbl} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatItem
        icon="cube-outline"
        value={shortNum(stats.totalProducts)}
        label="Sản phẩm"
        color="#0D9488"
      />
      <StatItem
        icon="people-outline"
        value={shortNum(stats.totalWorkers)}
        label="Thợ xây"
        color="#3B82F6"
      />
      <StatItem
        icon="bag-check-outline"
        value={shortNum(stats.totalSold)}
        label="Đã bán"
        color="#EF4444"
      />
      <StatItem
        icon="star-outline"
        value={stats.avgRating.toFixed(1)}
        label="Đánh giá"
        color="#F59E0B"
      />
    </View>
  );
});

const sk = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    marginBottom: 4,
  },
  val: {
    width: 30,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    marginBottom: 2,
  },
  lbl: {
    width: 40,
    height: 10,
    borderRadius: 3,
    backgroundColor: "#F1F5F9",
  },
});

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...createShadow({ offsetY: 1, blurRadius: 3, opacity: 0.04 }),
  },
  item: { alignItems: "center" },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 1,
  },
});
