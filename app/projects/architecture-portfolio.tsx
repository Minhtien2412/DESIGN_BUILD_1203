/**
 * Architecture Portfolio — Portfolio kiến trúc
 * Route: /projects/architecture-portfolio
 * Status: UI ready — mock data (needs backend: GET /api/portfolios?type=architecture)
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
  style: string;
  area: string;
  year: string;
  thumbnailColor: string;
  floors: number;
}

// TODO: Replace with real API: GET /api/portfolios?type=architecture&page=
const MOCK_ITEMS: PortfolioItem[] = [
  {
    id: "1",
    title: "Biệt thự hiện đại",
    style: "Modern",
    area: "350m²",
    year: "2024",
    thumbnailColor: "#E3F2FD",
    floors: 3,
  },
  {
    id: "2",
    title: "Nhà phố tân cổ điển",
    style: "Neo-classical",
    area: "180m²",
    year: "2024",
    thumbnailColor: "#FFF8E1",
    floors: 4,
  },
  {
    id: "3",
    title: "Văn phòng xanh",
    style: "Green Architecture",
    area: "500m²",
    year: "2023",
    thumbnailColor: "#E8F5E9",
    floors: 6,
  },
  {
    id: "4",
    title: "Resort Phú Quốc",
    style: "Tropical",
    area: "1200m²",
    year: "2023",
    thumbnailColor: "#FFF3E0",
    floors: 2,
  },
  {
    id: "5",
    title: "Townhouse Sala",
    style: "Modern",
    area: "220m²",
    year: "2024",
    thumbnailColor: "#F3E5F5",
    floors: 4,
  },
  {
    id: "6",
    title: "Nhà cấp 4 mái Nhật",
    style: "Japanese",
    area: "150m²",
    year: "2024",
    thumbnailColor: "#EFEBE9",
    floors: 1,
  },
];

const STYLE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Modern: "cube-outline",
  "Neo-classical": "library-outline",
  "Green Architecture": "leaf-outline",
  Tropical: "sunny-outline",
  Japanese: "home-outline",
};

export default function ArchitecturePortfolioScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({ item }: { item: PortfolioItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/projects/${item.id}` as any)}
    >
      <View
        style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}
      >
        <Ionicons
          name={STYLE_ICON[item.style] || "business-outline"}
          size={32}
          color="#999"
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardMeta}>
          {item.style} • {item.area}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.cardYear}>{item.year}</Text>
          <View style={styles.floorBadge}>
            <Text style={styles.floorText}>{item.floors} tầng</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="business-outline" size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có công trình nào</Text>
      <Text style={styles.emptyDesc}>Thêm công trình kiến trúc đầu tiên</Text>
      <TouchableOpacity style={styles.emptyCta}>
        <Text style={styles.emptyCtaText}>Thêm công trình</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Portfolio kiến trúc</Text>
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

      <Text style={styles.resultCount}>{MOCK_ITEMS.length} công trình</Text>

      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
  resultCount: {
    fontSize: 13,
    color: "#666",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  row: { justifyContent: "space-between", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "48%",
    overflow: "hidden",
    elevation: 1,
  },
  thumbnail: { height: 120, justifyContent: "center", alignItems: "center" },
  cardInfo: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  cardMeta: { fontSize: 12, color: "#666", marginTop: 4 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  cardYear: { fontSize: 12, color: "#999" },
  floorBadge: {
    backgroundColor: "#F3E5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  floorText: { fontSize: 10, color: "#7B1FA2" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#666", marginTop: 12 },
  emptyDesc: { fontSize: 13, color: "#999", marginTop: 4 },
  emptyCta: {
    backgroundColor: "#E53935",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyCtaText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
