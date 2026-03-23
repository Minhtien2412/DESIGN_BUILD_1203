/**
 * TopWorkersSection — Top Rated Worker Cards
 *
 * Horizontal scrollable worker profile cards with:
 * - Avatar, name, specialty
 * - Star rating + review count
 * - Verified badge
 * - Location + completed jobs
 * - Daily rate
 *
 * Data from useHomePageData → topRatedWorkers
 *
 * @created 2026-02-26
 */

import type { TopWorkerItem } from "@/hooks/useHomePageData";
import { createShadow } from "@/utils/shadowStyles";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ────────── Single Worker Card ──────────

const WorkerProfileCard = memo<{
  worker: TopWorkerItem;
  onBookWorker?: (id: string) => void;
}>(({ worker, onBookWorker }) => {
  const onPress = useCallback(() => {
    router.push(`/workers/${worker.id}` as Href);
  }, [worker.id]);

  const onLongPress = useCallback(() => {
    onBookWorker?.(String(worker.id));
  }, [worker.id, onBookWorker]);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.85}
    >
      {/* Avatar */}
      <View style={s.avatarWrap}>
        {worker.avatar ? (
          <Image source={{ uri: worker.avatar }} style={s.avatar} />
        ) : (
          <View style={[s.avatar, { backgroundColor: "#CBD5E1" }]}>
            <Ionicons name="person" size={24} color="#94A3B8" />
          </View>
        )}
        {worker.verified && (
          <View style={s.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={s.name} numberOfLines={1}>
        {worker.name}
      </Text>

      {/* Specialty */}
      <Text style={s.specialty} numberOfLines={1}>
        {worker.specialty}
      </Text>

      {/* Rating */}
      <View style={s.ratingRow}>
        <Ionicons name="star" size={12} color="#F59E0B" />
        <Text style={s.ratingTxt}>{worker.rating.toFixed(1)}</Text>
        <Text style={s.reviewTxt}>({worker.reviews})</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statTag}>
          <Ionicons name="location-outline" size={10} color="#64748B" />
          <Text style={s.statTxt}>{worker.location}</Text>
        </View>
      </View>

      {/* Price */}
      <View style={s.priceRow}>
        <Text style={s.priceTxt}>
          {worker.dailyRate > 0
            ? `${(worker.dailyRate / 1000).toFixed(0)}K/ngày`
            : "Liên hệ"}
        </Text>
      </View>

      {/* Jobs completed */}
      <Text style={s.jobsTxt}>
        {worker.completedJobs > 0
          ? `${worker.completedJobs} công trình`
          : `${worker.experience || 0} năm KN`}
      </Text>
    </TouchableOpacity>
  );
});

// ────────── Skeleton ──────────

const WorkerSkeleton = memo(() => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={s.scroll}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <View key={`wsk-${i}`} style={s.card}>
        <View
          style={[
            s.avatar,
            { backgroundColor: "#E2E8F0", alignSelf: "center" },
          ]}
        />
        <View style={sk.bar1} />
        <View style={sk.bar2} />
        <View style={sk.bar3} />
      </View>
    ))}
  </ScrollView>
));

const sk = StyleSheet.create({
  bar1: {
    width: 80,
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginTop: 8,
    alignSelf: "center",
  },
  bar2: {
    width: 60,
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginTop: 4,
    alignSelf: "center",
  },
  bar3: {
    width: 50,
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginTop: 4,
    alignSelf: "center",
  },
});

// ────────── Main Component ──────────

export interface TopWorkersSectionProps {
  data: TopWorkerItem[];
  loading?: boolean;
  onBookWorker?: (id: string) => void;
}

export const TopWorkersSection = memo<TopWorkersSectionProps>(
  ({ data, loading, onBookWorker }) => {
    if (loading) return <WorkerSkeleton />;
    if (!data.length) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {data.map((worker) => (
          <WorkerProfileCard
            key={worker.id}
            worker={worker}
            onBookWorker={onBookWorker}
          />
        ))}
      </ScrollView>
    );
  },
);

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 16, gap: 10 },
  card: {
    width: 130,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    ...createShadow({ offsetY: 1, blurRadius: 4, opacity: 0.08 }),
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
    textAlign: "center",
  },
  specialty: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  ratingTxt: { fontSize: 11, fontWeight: "700", color: "#F59E0B" },
  reviewTxt: { fontSize: 9, color: "#94A3B8" },
  statsRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 4,
  },
  statTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  statTxt: { fontSize: 9, fontWeight: "500", color: "#64748B" },
  priceRow: {
    marginTop: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceTxt: { fontSize: 10, fontWeight: "700", color: "#16A34A" },
  jobsTxt: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 3,
  },
});
