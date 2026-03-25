/**
 * Quotation List — Danh sách báo giá
 * Route: /projects/quotation-list
 * Status: UI ready — mock data (needs backend: GET /api/quotations)
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

interface Quotation {
  id: string;
  title: string;
  contractor: string;
  amount: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
  items: number;
}

// TODO: Replace with real API: GET /api/quotations?status=&page=
const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: "1",
    title: "Xây nhà phố 3 tầng",
    contractor: "XD Bảo Tiền",
    amount: "1.2 tỷ",
    date: "15/05/2025",
    status: "pending",
    items: 24,
  },
  {
    id: "2",
    title: "Nội thất phòng khách",
    contractor: "NT Minh Phát",
    amount: "450 triệu",
    date: "12/05/2025",
    status: "accepted",
    items: 15,
  },
  {
    id: "3",
    title: "Sửa chữa mái nhà",
    contractor: "XD An Phước",
    amount: "85 triệu",
    date: "10/05/2025",
    status: "rejected",
    items: 8,
  },
  {
    id: "4",
    title: "Ốp lát sàn tầng 2",
    contractor: "Hoàn thiện ABC",
    amount: "120 triệu",
    date: "08/05/2025",
    status: "pending",
    items: 6,
  },
];

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

const STATUS_MAP = {
  pending: {
    label: "Chờ duyệt",
    color: "#FFA000",
    bg: "#FFF8E1",
    icon: "time-outline" as const,
  },
  accepted: {
    label: "Đã duyệt",
    color: "#43A047",
    bg: "#E8F5E9",
    icon: "checkmark-circle-outline" as const,
  },
  rejected: {
    label: "Từ chối",
    color: "#E53935",
    bg: "#FFEBEE",
    icon: "close-circle-outline" as const,
  },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "accepted", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
];

export default function QuotationListScreen() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filtered =
    filter === "all"
      ? MOCK_QUOTATIONS
      : MOCK_QUOTATIONS.filter((q) => q.status === filter);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({ item }: { item: Quotation }) => {
    const s = STATUS_MAP[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/projects/${item.id}` as any)}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.contractor}>
              <Ionicons name="business-outline" size={12} color="#999" />{" "}
              {item.contractor}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon} size={12} color={s.color} />
            <Text style={[styles.badgeText, { color: s.color }]}>
              {s.label}
            </Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.amount}>{item.amount}</Text>
          <Text style={styles.itemCount}>{item.items} hạng mục</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có báo giá nào</Text>
      <Text style={styles.emptyDesc}>
        Tạo yêu cầu báo giá để nhận đề xuất từ nhà thầu
      </Text>
      <TouchableOpacity style={styles.emptyCta}>
        <Text style={styles.emptyCtaText}>Tạo yêu cầu báo giá</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Danh sách báo giá</Text>
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
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  contractor: { fontSize: 13, color: "#666", marginTop: 4 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  amount: { fontSize: 15, fontWeight: "700", color: "#E53935" },
  itemCount: { fontSize: 12, color: "#666" },
  date: { fontSize: 12, color: "#999" },
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
