/**
 * Design Portfolio — Portfolio thiết kế
 * Route: /projects/design-portfolio
 * Status: UI ready — mock data (needs backend: GET /api/portfolios?type=design)
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
  year: string;
  thumbnailColor: string;
  views: number;
}

// TODO: Replace with real API: GET /api/portfolios?type=design&page=
const MOCK_ITEMS: PortfolioItem[] = [
  {
    id: "1",
    title: "Biệt thự Thảo Điền",
    type: "Thiết kế kiến trúc",
    year: "2024",
    thumbnailColor: "#E3F2FD",
    views: 245,
  },
  {
    id: "2",
    title: "Căn hộ Riverside",
    type: "Thiết kế nội thất",
    year: "2024",
    thumbnailColor: "#FFF3E0",
    views: 189,
  },
  {
    id: "3",
    title: "Villa Đà Lạt",
    type: "Thiết kế cảnh quan",
    year: "2023",
    thumbnailColor: "#E8F5E9",
    views: 312,
  },
  {
    id: "4",
    title: "Nhà phố Quận 2",
    type: "Thiết kế kiến trúc",
    year: "2023",
    thumbnailColor: "#FCE4EC",
    views: 178,
  },
  {
    id: "5",
    title: "Penthouse Sky Garden",
    type: "Thiết kế nội thất",
    year: "2024",
    thumbnailColor: "#F3E5F5",
    views: 421,
  },
  {
    id: "6",
    title: "Nhà vườn Bình Dương",
    type: "Thiết kế cảnh quan",
    year: "2024",
    thumbnailColor: "#E0F2F1",
    views: 156,
  },
];

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Thiết kế kiến trúc": "business-outline",
  "Thiết kế nội thất": "bed-outline",
  "Thiết kế cảnh quan": "leaf-outline",
};

export default function DesignPortfolioScreen() {
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
          name={TYPE_ICON[item.type] || "image-outline"}
          size={32}
          color="#999"
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardType}>{item.type}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardYear}>{item.year}</Text>
          <View style={styles.viewCount}>
            <Ionicons name="eye-outline" size={10} color="#999" />
            <Text style={styles.viewText}>{item.views}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="color-palette-outline" size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có dự án nào</Text>
      <Text style={styles.emptyDesc}>Thêm dự án thiết kế đầu tiên của bạn</Text>
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
        <Text style={styles.title}>Portfolio thiết kế</Text>
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

      <Text style={styles.resultCount}>{MOCK_ITEMS.length} dự án</Text>

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
  cardType: { fontSize: 12, color: "#666", marginTop: 4 },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  cardYear: { fontSize: 12, color: "#999" },
  viewCount: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewText: { fontSize: 10, color: "#999" },
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
