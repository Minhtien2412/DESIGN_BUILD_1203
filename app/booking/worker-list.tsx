/**
 * Worker List Screen — Step 4 of booking flow
 * Shows list of nearby workers found during scan, sorted by proximity
 */

import { generateMockWorkers, NearbyWorker } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type SortBy = "distance" | "rating" | "price";

export default function WorkerListScreen() {
  const params = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    address: string;
    district: string;
    city: string;
    note: string;
    date: string;
    time: string;
    workerCount: string;
  }>();

  const [sortBy, setSortBy] = useState<SortBy>("distance");

  const workers = useMemo(() => {
    const count = parseInt(params.workerCount || "8", 10);
    return generateMockWorkers(params.serviceId || "", count);
  }, [params.serviceId, params.workerCount]);

  const sorted = useMemo(() => {
    const copy = [...workers];
    switch (sortBy) {
      case "distance":
        return copy.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
        );
      case "rating":
        return copy.sort((a, b) => b.rating - a.rating);
      case "price":
        return copy.sort((a, b) => a.pricePerHour - b.pricePerHour);
      default:
        return copy;
    }
  }, [workers, sortBy]);

  const onSelectWorker = useCallback(
    (worker: NearbyWorker) => {
      router.push({
        pathname: "/booking/worker-detail",
        params: {
          serviceId: params.serviceId,
          serviceName: params.serviceName,
          address: params.address,
          district: params.district,
          city: params.city,
          note: params.note,
          date: params.date,
          time: params.time,
          workerId: worker.id,
          workerName: worker.name,
          workerRating: String(worker.rating),
          workerReviews: String(worker.reviewCount),
          workerJobs: String(worker.completedJobs),
          workerDistance: worker.distance,
          workerArrival: worker.estimatedArrival,
          workerPrice: String(worker.pricePerHour),
          workerVerified: String(worker.verified),
          workerExp: String(worker.yearsExperience),
          workerSpecialty: worker.specialty,
        },
      } as Href);
    },
    [params],
  );

  const renderWorker = useCallback(
    ({ item, index }: { item: NearbyWorker; index: number }) => (
      <TouchableOpacity
        style={s.card}
        onPress={() => onSelectWorker(item)}
        activeOpacity={0.7}
      >
        {/* Rank badge for top 3 */}
        {index < 3 && (
          <View
            style={[
              s.rankBadge,
              {
                backgroundColor:
                  index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
              },
            ]}
          >
            <Text style={s.rankText}>#{index + 1}</Text>
          </View>
        )}

        <View style={s.cardRow}>
          {/* Avatar */}
          <View style={s.avatarWrap}>
            <Image source={{ uri: item.avatar }} style={s.avatar} />
            {item.online && <View style={s.onlineDot} />}
          </View>

          {/* Info */}
          <View style={s.cardInfo}>
            <View style={s.nameRow}>
              <Text style={s.name}>{item.name}</Text>
              {item.verified && (
                <Ionicons name="shield-checkmark" size={14} color="#0D9488" />
              )}
            </View>
            <Text style={s.specialty}>{item.specialty}</Text>

            <View style={s.statsRow}>
              <View style={s.stat}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={s.statVal}>{item.rating}</Text>
                <Text style={s.statLabel}>({item.reviewCount})</Text>
              </View>
              <View style={s.stat}>
                <Ionicons name="briefcase-outline" size={12} color="#6B7280" />
                <Text style={s.statVal}>{item.completedJobs}</Text>
                <Text style={s.statLabel}>việc</Text>
              </View>
              <View style={s.stat}>
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text style={s.statVal}>{item.yearsExperience}</Text>
                <Text style={s.statLabel}>năm</Text>
              </View>
            </View>
          </View>

          {/* Right info */}
          <View style={s.rightCol}>
            <View style={s.distBadge}>
              <Ionicons name="navigate-outline" size={12} color="#0D9488" />
              <Text style={s.distText}>{item.distance}</Text>
            </View>
            <Text style={s.arrivalText}>~{item.estimatedArrival}</Text>
            <Text style={s.priceText}>
              {(item.pricePerHour / 1000).toFixed(0)}K/h
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [onSelectWorker],
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Thợ gần bạn</Text>
          <Text style={s.headerSub}>
            {sorted.length} thợ · {params.serviceName}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Sort tabs */}
      <View style={s.sortRow}>
        {(
          [
            { key: "distance", label: "Gần nhất", icon: "navigate-outline" },
            { key: "rating", label: "Đánh giá", icon: "star-outline" },
            { key: "price", label: "Giá thấp", icon: "trending-down-outline" },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.sortChip, sortBy === tab.key && s.sortChipActive]}
            onPress={() => setSortBy(tab.key)}
          >
            <Ionicons
              name={tab.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={sortBy === tab.key ? "#fff" : "#6B7280"}
            />
            <Text
              style={[s.sortLabel, sortBy === tab.key && s.sortLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Worker list */}
      <FlatList
        data={sorted}
        renderItem={renderWorker}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  headerSub: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
  },

  // Sort
  sortRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#fff",
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    gap: 4,
  },
  sortChipActive: { backgroundColor: "#0D9488" },
  sortLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  sortLabelActive: { color: "#fff" },

  // Card
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  rankText: { fontSize: 10, fontWeight: "800", color: "#fff" },

  cardRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { position: "relative", marginRight: 12 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E5E7EB",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#fff",
  },

  cardInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  specialty: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  stat: { flexDirection: "row", alignItems: "center", gap: 2 },
  statVal: { fontSize: 12, fontWeight: "600", color: "#1F2937" },
  statLabel: { fontSize: 10, color: "#9CA3AF" },

  rightCol: { alignItems: "flex-end", gap: 4, marginLeft: 8 },
  distBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  distText: { fontSize: 11, fontWeight: "600", color: "#0D9488" },
  arrivalText: { fontSize: 10, color: "#6B7280" },
  priceText: { fontSize: 13, fontWeight: "700", color: "#FF6B35" },
});
