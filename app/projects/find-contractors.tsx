/**
 * Find Contractors — Tìm nhà thầu
 * Route: /projects/find-contractors
 * Status: UI ready — mock data (needs backend: GET /api/contractors)
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Contractor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  projects: number;
  location: string;
  verified: boolean;
}

// TODO: Replace with real API call: GET /api/contractors?search=&page=
const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: "1",
    name: "Xây dựng Bảo Tiền",
    specialty: "Nhà phố, biệt thự",
    rating: 4.8,
    projects: 52,
    location: "TP.HCM",
    verified: true,
  },
  {
    id: "2",
    name: "Nội thất Minh Phát",
    specialty: "Nội thất cao cấp",
    rating: 4.6,
    projects: 38,
    location: "Hà Nội",
    verified: true,
  },
  {
    id: "3",
    name: "Xây dựng An Phước",
    specialty: "Công trình công nghiệp",
    rating: 4.5,
    projects: 45,
    location: "Đà Nẵng",
    verified: false,
  },
  {
    id: "4",
    name: "Kiến trúc Tân Phú",
    specialty: "Thiết kế - Thi công",
    rating: 4.7,
    projects: 31,
    location: "TP.HCM",
    verified: true,
  },
  {
    id: "5",
    name: "Nội thất Hòa Bình",
    specialty: "Văn phòng, showroom",
    rating: 4.4,
    projects: 27,
    location: "Bình Dương",
    verified: false,
  },
];

export default function FindContractorsScreen() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = MOCK_CONTRACTORS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch from API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({ item }: { item: Contractor }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/projects/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="business" size={22} color="#fff" />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#43A047" />
            )}
          </View>
          <Text style={styles.cardSpecialty}>{item.specialty}</Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.metaChip}>
          <Ionicons name="star" size={13} color="#FFA000" />
          <Text style={styles.metaText}>{item.rating}</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="construct-outline" size={13} color="#666" />
          <Text style={styles.metaText}>{item.projects} dự án</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="location-outline" size={13} color="#666" />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.contactBtn}>
        <Ionicons name="chatbubble-outline" size={16} color="#fff" />
        <Text style={styles.contactBtnText}>Liên hệ</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>Không tìm thấy nhà thầu</Text>
      <Text style={styles.emptyDesc}>
        Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Tìm nhà thầu</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="filter-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Data source banner */}
      <View style={styles.mockBanner}>
        <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
        <Text style={styles.mockBannerText}>
          Dữ liệu demo — kết nối API khi có backend
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, chuyên môn, địa điểm..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.resultCount}>{filtered.length} nhà thầu</Text>

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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  resultCount: {
    fontSize: 13,
    color: "#666",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardName: { fontSize: 15, fontWeight: "600", color: "#333", flex: 1 },
  cardSpecialty: { fontSize: 13, color: "#666", marginTop: 2 },
  cardMeta: { flexDirection: "row", gap: 12, marginBottom: 12 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#666" },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E53935",
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#666", marginTop: 12 },
  emptyDesc: { fontSize: 13, color: "#999", marginTop: 4, textAlign: "center" },
});
