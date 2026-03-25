/**
 * Construction Portfolio — Portfolio xây dựng
 * Route: /projects/construction-portfolio
 * Status: UI ready — mock data (needs backend: GET /api/portfolios?type=construction)
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  budget: string;
  status: "completed" | "in-progress";
  year: string;
  progress: number;
}

// TODO: Replace with real API: GET /api/portfolios?type=construction&page=
const MOCK_ITEMS: PortfolioItem[] = [
  {
    id: "1",
    title: "Biệt thự Thảo Điền",
    type: "Xây mới",
    budget: "3.5 tỷ",
    status: "completed",
    year: "2024",
    progress: 100,
  },
  {
    id: "2",
    title: "Văn phòng Landmark",
    type: "Xây mới",
    budget: "8.2 tỷ",
    status: "in-progress",
    year: "2024",
    progress: 65,
  },
  {
    id: "3",
    title: "Nhà phố Quận 9",
    type: "Sửa chữa",
    budget: "1.8 tỷ",
    status: "completed",
    year: "2023",
    progress: 100,
  },
  {
    id: "4",
    title: "Chung cư Riverside",
    type: "Nội thất",
    budget: "2.1 tỷ",
    status: "in-progress",
    year: "2024",
    progress: 40,
  },
  {
    id: "5",
    title: "Kho xưởng Long An",
    type: "Xây mới",
    budget: "5.6 tỷ",
    status: "in-progress",
    year: "2024",
    progress: 80,
  },
  {
    id: "6",
    title: "Nhà ở xã hội Bình Tân",
    type: "Xây mới",
    budget: "12 tỷ",
    status: "completed",
    year: "2023",
    progress: 100,
  },
];

type StatusFilter = "all" | "completed" | "in-progress";

const STATUS_MAP = {
  completed: {
    label: "Hoàn thành",
    color: "#43A047",
    bg: "#E8F5E9",
    icon: "checkmark-circle-outline" as const,
  },
  "in-progress": {
    label: "Đang thi công",
    color: "#1E88E5",
    bg: "#E3F2FD",
    icon: "build-outline" as const,
  },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "in-progress", label: "Đang thi công" },
  { key: "completed", label: "Hoàn thành" },
];

export default function ConstructionPortfolioScreen() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filtered =
    filter === "all"
      ? MOCK_ITEMS
      : MOCK_ITEMS.filter((item) => item.status === filter);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({ item }: { item: PortfolioItem }) => {
    const s = STATUS_MAP[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/projects/${item.id}` as any)}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconWrapper}>
            <Ionicons name="construct-outline" size={24} color="#E53935" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardType}>
              {item.type} • {item.year}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon} size={12} color={s.color} />
            <Text style={[styles.badgeText, { color: s.color }]}>
              {s.label}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.progress}%`, backgroundColor: s.color },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.budget}>{item.budget}</Text>
          <TouchableOpacity style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color="#E53935" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="construct-outline" size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có dự án xây dựng</Text>
      <Text style={styles.emptyDesc}>
        Thêm dự án đầu tiên để theo dõi tiến độ
      </Text>
      <TouchableOpacity style={styles.emptyCta}>
        <Text style={styles.emptyCtaText}>Thêm dự án</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Portfolio xây dựng</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="add-circle-outline" size={24} color="#E53935" />
        </TouchableOpacity>
      </View>

      <View style={styles.mockBanner}>
        <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
        <Text style={styles.mockBannerText}>
          Dữ liệu demo — kết nối API khi có backend
        </Text>
      </View>

      {/* Status filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E53935"]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#333" },
  mockBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DBEAFE",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mockBannerText: { fontSize: 12, color: "#2563EB", flex: 1 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: { backgroundColor: "#E53935", borderColor: "#E53935" },
  filterText: { fontSize: 13, color: "#666" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  cardType: { fontSize: 13, color: "#666", marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
  },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    width: 36,
    textAlign: "right",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  budget: { fontSize: 15, fontWeight: "700", color: "#E53935" },
  detailBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  detailBtnText: { fontSize: 13, color: "#E53935", fontWeight: "500" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#666", marginTop: 12 },
  emptyDesc: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyCta: {
    backgroundColor: "#E53935",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyCtaText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
