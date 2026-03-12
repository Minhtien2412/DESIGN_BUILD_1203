/**
 * Sổ tay KSXD - Construction Engineer Handbook Main Screen
 * Vietnamese Engineer Handbook inspired UI with teal/green theme
 */
import type { HandbookItem } from "@/data/handbook";
import { HANDBOOK_CATEGORIES, searchHandbook } from "@/data/handbook";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");

// Theme colors
const COLORS = {
  light: {
    bg: "#F0F9F6",
    card: "#FFFFFF",
    text: "#1A2B3C",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    surface: "#FFFFFF",
    searchBg: "rgba(255,255,255,0.9)",
  },
  dark: {
    bg: "#0A0F1A",
    card: "#1A2332",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#2D3A4A",
    surface: "#1A2332",
    searchBg: "rgba(255,255,255,0.08)",
  },
};

const TEAL = "#0D9488";
const TEAL_DARK = "#065F56";
const TEAL_LIGHT = "#14B8A6";

export default function HandbookIndexScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? COLORS.dark : COLORS.light;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HandbookItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      setIsSearching(true);
      setSearchResults(searchHandbook(text));
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/handbook/${categoryId}` as Href);
  };

  const handleItemPress = (item: HandbookItem) => {
    if (item.type === "calculator" && item.formula) {
      router.push({
        pathname: "/handbook/calculator",
        params: { itemId: item.id },
      });
    } else {
      router.push({
        pathname: "/handbook/reference",
        params: { itemId: item.id },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={
          isDark
            ? ["#0A2A2A", "#0D4444", TEAL_DARK]
            : [TEAL_DARK, TEAL, TEAL_LIGHT]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="home-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>SỔ TAY KSXD</Text>
            <Text style={styles.headerSubtitle}>
              Vietnamese Engineer Handbook
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.mascotBadge}>
              <Text style={styles.mascotEmoji}>🏗️</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: C.searchBg }]}>
          <Ionicons
            name="search"
            size={18}
            color={isDark ? "#94A3B8" : "#64748B"}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? "#F1F5F9" : "#1A2B3C" },
            ]}
            placeholder="Tìm kiếm công cụ, định mức..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 20,
          }}
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                Không tìm thấy kết quả cho "{searchQuery}"
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.searchResultItem,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.searchResultIcon,
                  { backgroundColor: TEAL + "15" },
                ]}
              >
                <Ionicons
                  name={(item.icon as any) || "document-text-outline"}
                  size={20}
                  color={TEAL}
                />
              </View>
              <View style={styles.searchResultContent}>
                <Text
                  style={[styles.searchResultTitle, { color: C.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.searchResultDesc, { color: C.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.description ||
                    (item.type === "calculator"
                      ? "Công cụ tính toán"
                      : item.type === "reference"
                        ? "Bảng tra cứu"
                        : item.type === "checklist"
                          ? "Checklist thi công"
                          : "Hướng dẫn")}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={C.textSecondary}
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Stats bar */}
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
            >
              <Text style={[styles.statValue, { color: TEAL }]}>
                {HANDBOOK_CATEGORIES.reduce(
                  (sum, cat) => sum + cat.items.length,
                  0,
                )}
              </Text>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                Công cụ
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
            >
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                {HANDBOOK_CATEGORIES.length}
              </Text>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                Danh mục
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
            >
              <Text style={[styles.statValue, { color: "#EF4444" }]}>
                {HANDBOOK_CATEGORIES[0].items.length}
              </Text>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                Máy tính
              </Text>
            </View>
          </View>

          {/* Categories */}
          {HANDBOOK_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.bgColor },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={category.color}
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryTitle, { color: C.text }]}>
                    {category.title}
                  </Text>
                  <Text
                    style={[styles.categoryDesc, { color: C.textSecondary }]}
                    numberOfLines={1}
                  >
                    {category.description}
                  </Text>
                  <View style={styles.categoryMeta}>
                    <View
                      style={[
                        styles.itemCountBadge,
                        { backgroundColor: category.color + "15" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemCountText,
                          { color: category.color },
                        ]}
                      >
                        {category.items.length} mục
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={C.textSecondary}
              />
            </TouchableOpacity>
          ))}

          {/* Quick tip */}
          <View style={[styles.tipCard, { borderColor: TEAL + "30" }]}>
            <LinearGradient
              colors={isDark ? ["#0A2A2A", "#0D3333"] : ["#F0FDFA", "#CCFBF1"]}
              style={styles.tipGradient}
            >
              <Ionicons name="bulb-outline" size={24} color={TEAL} />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: C.text }]}>
                  💡 Mẹo sử dụng
                </Text>
                <Text style={[styles.tipText, { color: C.textSecondary }]}>
                  Tất cả công cụ tính toán đều hỗ trợ nhập liệu nhanh với giá
                  trị mặc định. Bạn chỉ cần điều chỉnh thông số cần thay đổi.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  headerRight: { width: 38, alignItems: "center" },
  mascotBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  mascotEmoji: { fontSize: 20 },
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  // Categories
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  categoryLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 14, fontWeight: "700" },
  categoryDesc: { fontSize: 12, marginTop: 2 },
  categoryMeta: { flexDirection: "row", marginTop: 6 },
  itemCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  itemCountText: { fontSize: 10, fontWeight: "700" },
  // Tip
  tipCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  tipGradient: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 10,
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  tipText: { fontSize: 12, lineHeight: 18 },
  // Search results
  emptySearch: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  searchResultContent: { flex: 1 },
  searchResultTitle: { fontSize: 14, fontWeight: "600" },
  searchResultDesc: { fontSize: 12, marginTop: 2 },
});
