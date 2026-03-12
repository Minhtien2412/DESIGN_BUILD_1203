/**
 * House Designs Gallery Screen
 * Browse design templates from real API
 *
 * Features:
 * - Filter by type (Nhà phố, Biệt thự, etc.)
 * - Filter by style (Hiện đại, Tân cổ điển, etc.)
 * - Sort by rating, cost, view count
 * - Pull to refresh + infinite scroll
 * - Masonry-style card layout
 *
 * API: GET /services/house-designs, GET /services/house-designs/types
 *      GET /services/house-designs/featured
 */

import {
    DesignStyle,
    DesignType,
    getHouseDesigns,
    type HouseDesign,
    type HouseDesignQueryParams
} from "@/services/house-design.api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 36) / 2;

const THEME = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  star: "#FFCE3D",
  error: "#EF4444",
};

const TYPE_LABELS: Record<string, string> = {
  NHA_PHO: "Nhà phố",
  BIET_THU: "Biệt thự",
  NHA_CAP_4: "Nhà cấp 4",
  NHA_VUON: "Nhà vườn",
  NHA_2_TANG: "Nhà 2 tầng",
  NHA_3_TANG: "Nhà 3 tầng",
  NHA_4_TANG: "Nhà 4 tầng",
  CAN_HO: "Căn hộ",
  CHUNG_CU: "Chung cư",
  SHOP_HOUSE: "Shop House",
  RESORT: "Resort",
  VAN_PHONG: "Văn phòng",
  NHA_HANG: "Nhà hàng",
  CAFE: "Café",
  KHAC: "Khác",
};

const STYLE_LABELS: Record<string, string> = {
  HIEN_DAI: "Hiện đại",
  TAN_CO_DIEN: "Tân cổ điển",
  MINIMALIST: "Minimalist",
  INDOCHINE: "Indochine",
  NHAT_BAN: "Nhật Bản",
  DIA_TRUNG_HAI: "Địa Trung Hải",
  INDUSTRIAL: "Industrial",
  SCANDINAVIAN: "Scandinavian",
};

// Fallback data when API fails
const FALLBACK_DESIGNS: HouseDesign[] = [
  {
    id: "1",
    title: "Biệt thự hiện đại 3 tầng",
    description: "Thiết kế sang trọng với không gian mở",
    designType: DesignType.BIET_THU,
    style: DesignStyle.HIEN_DAI,
    area: 350,
    floors: 3,
    bedrooms: 4,
    bathrooms: 4,
    estimatedCost: 5500000000,
    images: [
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    designer: { id: "1", name: "KTS. Nguyễn Văn A", company: "Design Studio" },
    rating: 4.8,
    reviewCount: 89,
    viewCount: 1520,
    featured: true,
    status: "APPROVED" as any,
    location: "TP. Hồ Chí Minh",
    createdAt: "2026-01-15",
    updatedAt: "2026-02-01",
  },
  {
    id: "2",
    title: "Nhà phố tân cổ điển 4 tầng",
    description: "Kiến trúc Pháp cổ kết hợp hiện đại",
    designType: DesignType.NHA_PHO,
    style: DesignStyle.TAN_CO_DIEN,
    area: 180,
    floors: 4,
    bedrooms: 3,
    bathrooms: 3,
    estimatedCost: 3200000000,
    images: [
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    designer: { id: "2", name: "KTS. Trần B", company: "Arc Firm" },
    rating: 4.6,
    reviewCount: 56,
    viewCount: 980,
    featured: true,
    status: "APPROVED" as any,
    location: "Hà Nội",
    createdAt: "2026-01-20",
    updatedAt: "2026-02-05",
  },
  {
    id: "3",
    title: "Nhà vườn minimalist",
    description: "Không gian xanh hòa quyện thiên nhiên",
    designType: DesignType.NHA_VUON,
    style: DesignStyle.MINIMALIST,
    area: 220,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    estimatedCost: 2800000000,
    images: [
      "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    designer: { id: "3", name: "KTS. Lê C", company: "Green Design" },
    rating: 4.9,
    reviewCount: 122,
    viewCount: 2100,
    featured: true,
    status: "APPROVED" as any,
    location: "Đà Nẵng",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-10",
  },
  {
    id: "4",
    title: "Café phong cách Indochine",
    description: "Quán café Đông Dương phong cách retro",
    designType: DesignType.CAFE,
    style: DesignStyle.INDOCHINE,
    area: 120,
    floors: 2,
    bedrooms: 0,
    bathrooms: 2,
    estimatedCost: 1500000000,
    images: [
      "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    designer: { id: "4", name: "KTS. Phạm D", company: "Retro Arts" },
    rating: 4.7,
    reviewCount: 45,
    viewCount: 870,
    featured: false,
    status: "APPROVED" as any,
    location: "Hội An",
    createdAt: "2026-02-05",
    updatedAt: "2026-02-15",
  },
];

export default function HouseDesignsGalleryScreen() {
  const insets = useSafeAreaInsets();
  const [designs, setDesigns] = useState<HouseDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter state
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "rating" | "viewCount" | "estimatedCost"
  >("rating");
  const [showFilters, setShowFilters] = useState(false);

  const fetchDesigns = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params: HouseDesignQueryParams = {
          page: pageNum,
          limit: 10,
          sortBy,
          sortOrder: "desc",
          status: "APPROVED" as any,
        };

        if (selectedType !== "all") {
          params.designType = selectedType as DesignType;
        }
        if (selectedStyle !== "all") {
          params.style = selectedStyle as DesignStyle;
        }

        const response = await getHouseDesigns(params);
        const newDesigns = response?.data || [];
        const total = response?.meta?.total || 0;

        if (append) {
          setDesigns((prev) => [...prev, ...newDesigns]);
        } else {
          setDesigns(newDesigns.length > 0 ? newDesigns : FALLBACK_DESIGNS);
        }

        setHasMore(
          newDesigns.length === 10 &&
            designs.length + newDesigns.length < total,
        );
        setPage(pageNum);
      } catch {
        if (!append) {
          setDesigns(FALLBACK_DESIGNS);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [selectedType, selectedStyle, sortBy],
  );

  useEffect(() => {
    fetchDesigns(1);
  }, [selectedType, selectedStyle, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDesigns(1);
  }, [fetchDesigns]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchDesigns(page + 1, true);
  }, [hasMore, loadingMore, page, fetchDesigns]);

  const formatCost = (n: number) => {
    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + " tỷ";
    if (n >= 1000000) return (n / 1000000).toFixed(0) + " tr";
    return new Intl.NumberFormat("vi-VN").format(n);
  };

  const handleDesignPress = useCallback((design: HouseDesign) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/design-library/${design.id}`);
  }, []);

  const typeFilters = [
    { key: "all", label: "Tất cả" },
    ...Object.entries(TYPE_LABELS).map(([key, label]) => ({ key, label })),
  ];

  const styleFilters = [
    { key: "all", label: "Tất cả" },
    ...Object.entries(STYLE_LABELS).map(([key, label]) => ({ key, label })),
  ];

  const renderDesignCard = useCallback(
    ({ item }: { item: HouseDesign }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleDesignPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{
            uri:
              item.images?.[0] ||
              "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Badges */}
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color="#FFF" />
            <Text style={styles.featuredText}>Nổi bật</Text>
          </View>
        )}

        <View style={styles.cardInfo}>
          {/* Type & Style */}
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>
              {TYPE_LABELS[item.designType] || item.designType}
            </Text>
            <Text style={styles.styleDot}>•</Text>
            <Text style={styles.styleLabel}>
              {STYLE_LABELS[item.style] || item.style}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Specs */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Ionicons
                name="resize-outline"
                size={12}
                color={THEME.textSecondary}
              />
              <Text style={styles.specText}>{item.area}m²</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons
                name="layers-outline"
                size={12}
                color={THEME.textSecondary}
              />
              <Text style={styles.specText}>{item.floors} tầng</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons
                name="bed-outline"
                size={12}
                color={THEME.textSecondary}
              />
              <Text style={styles.specText}>{item.bedrooms} PN</Text>
            </View>
          </View>

          {/* Cost */}
          <Text style={styles.costText}>
            ~{formatCost(item.estimatedCost)}đ
          </Text>

          {/* Rating & Views */}
          <View style={styles.bottomRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color={THEME.star} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              <Text style={styles.reviewText}>({item.reviewCount})</Text>
            </View>
            <View style={styles.viewsBox}>
              <Ionicons
                name="eye-outline"
                size={12}
                color={THEME.textSecondary}
              />
              <Text style={styles.viewsText}>
                {item.viewCount > 1000
                  ? `${(item.viewCount / 1000).toFixed(1)}k`
                  : item.viewCount}
              </Text>
            </View>
          </View>

          {/* Designer */}
          {item.designer && (
            <Text style={styles.designerText} numberOfLines={1}>
              {item.designer.name}
              {item.designer.company ? ` • ${item.designer.company}` : ""}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mẫu thiết kế nhà",
          headerShown: true,
          headerStyle: { backgroundColor: THEME.primary },
          headerTintColor: "#FFF",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={{ marginRight: 12 }}
            >
              <Ionicons
                name={showFilters ? "filter" : "filter-outline"}
                size={22}
                color="#FFF"
              />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {/* Type filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {typeFilters.slice(0, 10).map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, selectedType === f.key && styles.chipActive]}
              onPress={() => setSelectedType(f.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedType === f.key && styles.chipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Extended filters */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterTitle}>Phong cách</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {styleFilters.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.chip,
                    selectedStyle === f.key && styles.chipActive,
                  ]}
                  onPress={() => setSelectedStyle(f.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedStyle === f.key && styles.chipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterTitle, { marginTop: 10 }]}>
              Sắp xếp theo
            </Text>
            <View style={styles.sortRow}>
              {(
                [
                  { key: "rating", label: "Đánh giá" },
                  { key: "viewCount", label: "Lượt xem" },
                  { key: "estimatedCost", label: "Giá" },
                ] as const
              ).map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.sortChip,
                    sortBy === s.key && styles.sortChipActive,
                  ]}
                  onPress={() => setSortBy(s.key)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortBy === s.key && styles.sortChipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>Đang tải mẫu thiết kế...</Text>
          </View>
        ) : (
          <FlatList
            data={designs}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={renderDesignCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[THEME.primary]}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  style={{ paddingVertical: 20 }}
                  color={THEME.primary}
                />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyCenter}>
                <Ionicons
                  name="home-outline"
                  size={48}
                  color={THEME.textSecondary}
                />
                <Text style={styles.emptyText}>
                  Không tìm thấy mẫu thiết kế nào
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textSecondary,
  },
  emptyCenter: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: THEME.textSecondary,
  },

  // Chips
  chipRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  chipActive: {
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  chipText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: THEME.primary,
    fontWeight: "600",
  },

  // Filter panel
  filterPanel: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 6,
    marginLeft: 4,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FAFAFA",
  },
  sortChipActive: {
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  sortChipText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  sortChipTextActive: {
    color: THEME.primary,
    fontWeight: "600",
  },

  // List
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },

  // Card
  card: {
    width: CARD_W,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardImage: {
    width: "100%",
    height: CARD_W * 0.75,
    backgroundColor: "#F0F0F0",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: THEME.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "600",
  },
  cardInfo: {
    padding: 10,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.primary,
    textTransform: "uppercase",
  },
  styleDot: {
    fontSize: 8,
    color: THEME.textSecondary,
  },
  styleLabel: {
    fontSize: 10,
    color: THEME.textSecondary,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  specsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  specText: {
    fontSize: 11,
    color: THEME.textSecondary,
  },
  costText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.error,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.text,
  },
  reviewText: {
    fontSize: 10,
    color: THEME.textSecondary,
  },
  viewsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewsText: {
    fontSize: 11,
    color: THEME.textSecondary,
  },
  designerText: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
  },
});
