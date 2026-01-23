/**
 * Advanced Search Screen - Modern Minimalist Design
 * Features: Animated search results, popular tags, category grid, dark mode
 */

import { ProductCard } from "@/components/ui/product-card";
import { SearchBar, SearchSuggestion } from "@/components/ui/search-bar";
import { PRODUCTS } from "@/data/products";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const POPULAR_SEARCHES = [
  { text: "xi măng", icon: "cube", color: "#6366f1" },
  { text: "gạch men", icon: "grid", color: "#10b981" },
  { text: "sơn", icon: "color-palette", color: "#f59e0b" },
  { text: "cửa gỗ", icon: "enter", color: "#ef4444" },
  { text: "điều hòa", icon: "snow", color: "#3b82f6" },
  { text: "nội thất", icon: "home", color: "#8b5cf6" },
  { text: "vật liệu xây", icon: "construct", color: "#ec4899" },
  { text: "thợ xây", icon: "person", color: "#14b8a6" },
];

const CATEGORIES: {
  name: string;
  icon: string;
  color: string;
  gradient: [string, string];
}[] = [
  {
    name: "Vật liệu xây",
    icon: "cube-outline",
    color: "#6366f1",
    gradient: ["#6366f1", "#818cf8"],
  },
  {
    name: "Điện nước",
    icon: "flash-outline",
    color: "#f59e0b",
    gradient: ["#f59e0b", "#fbbf24"],
  },
  {
    name: "Sơn",
    icon: "color-palette-outline",
    color: "#10b981",
    gradient: ["#10b981", "#34d399"],
  },
  {
    name: "Gạch men",
    icon: "grid-outline",
    color: "#ef4444",
    gradient: ["#ef4444", "#f87171"],
  },
  {
    name: "Nội thất",
    icon: "home-outline",
    color: "#8b5cf6",
    gradient: ["#8b5cf6", "#a78bfa"],
  },
  {
    name: "Điều hòa",
    icon: "snow-outline",
    color: "#3b82f6",
    gradient: ["#3b82f6", "#60a5fa"],
  },
];

// History Tag Component
const HistoryTag = ({
  item,
  index,
  textColor,
  surfaceColor,
  borderColor,
  onPress,
}: {
  item: string;
  index: number;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: scaleAnim, transform: [{ scale: scaleAnim }] }}
    >
      <TouchableOpacity
        style={[
          styles.historyTag,
          { backgroundColor: surfaceColor, borderColor },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={14} color={textColor + "60"} />
        <Text style={[styles.tagText, { color: textColor }]}>{item}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Popular Tag Component
const PopularTag = ({
  item,
  index,
  isDark,
  onPress,
}: {
  item: { text: string; icon: string; color: string };
  index: number;
  isDark: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 60,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: scaleAnim, transform: [{ scale: scaleAnim }] }}
    >
      <TouchableOpacity
        style={[
          styles.popularTag,
          { backgroundColor: item.color + (isDark ? "25" : "15") },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name={item.icon as any} size={14} color={item.color} />
        <Text style={[styles.popularTagText, { color: item.color }]}>
          {item.text}
        </Text>
        <Ionicons name="trending-up" size={12} color={item.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Category Card Component
const CategoryCard = ({
  category,
  index,
  onPress,
}: {
  category: {
    name: string;
    icon: string;
    color: string;
    gradient: [string, string];
  };
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.categoryCardWrapper,
        {
          opacity: scaleAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={category.gradient}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryIconWrap}>
            <Ionicons name={category.icon as any} size={28} color="#fff" />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { history, addToHistory, clearHistory } = useSearchHistory();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Generate suggestions based on query
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    if (!query.trim()) {
      return history.map((text, index) => ({
        id: `history-${index}`,
        text,
        type: "history" as const,
      }));
    }

    const queryLower = query.toLowerCase();
    const productSuggestions = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(queryLower)
    )
      .slice(0, 5)
      .map((p) => ({
        id: `product-${p.id}`,
        text: p.name,
        type: "product" as const,
      }));

    const popularSuggestions = POPULAR_SEARCHES.filter((s) =>
      s.text.toLowerCase().includes(queryLower)
    ).map((item, index) => ({
      id: `popular-${index}`,
      text: item.text,
      type: "suggestion" as const,
    }));

    return [...productSuggestions, ...popularSuggestions];
  }, [query, history]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const queryLower = query.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower)
    );
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuery(searchQuery);
    setShowResults(true);
    addToHistory(searchQuery);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const handlePopularPress = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuery(text);
    handleSearch(text);
  };

  const handleClearHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearHistory();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: surfaceColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSearch={handleSearch}
            suggestions={suggestions}
            showSuggestions={!showResults}
            onSuggestionPress={handleSuggestionPress}
            onClear={() => setShowResults(false)}
            autoFocus
          />
        </View>
      </Animated.View>

      {/* Content */}
      {showResults ? (
        <View style={styles.resultsContainer}>
          {/* Results Header */}
          <View
            style={[
              styles.resultsHeader,
              { backgroundColor: surfaceColor, borderColor },
            ]}
          >
            <View style={styles.resultsInfo}>
              <Text style={[styles.resultsTitle, { color: textColor }]}>
                Tìm thấy{" "}
                <Text style={{ color: "#6366f1", fontWeight: "700" }}>
                  {filteredProducts.length}
                </Text>{" "}
                kết quả
              </Text>
              <Text style={[styles.resultsQuery, { color: textColor + "60" }]}>
                cho "{query}"
              </Text>
            </View>
            {filteredProducts.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
                ]}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              >
                <Ionicons name="options-outline" size={18} color={textColor} />
              </TouchableOpacity>
            )}
          </View>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.productList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                Không tìm thấy kết quả
              </Text>
              <Text style={[styles.emptyText, { color: textColor + "60" }]}>
                Thử tìm kiếm với từ khóa khác
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => {
                  setQuery("");
                  setShowResults(false);
                }}
              >
                <Text style={styles.emptyButtonText}>Tìm kiếm mới</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.defaultContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search History */}
          {history.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <Ionicons name="time" size={18} color="#6366f1" />
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Tìm kiếm gần đây
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClearHistory}>
                  <Text style={styles.clearText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagContainer}>
                {history.map((item, index) => (
                  <HistoryTag
                    key={index}
                    item={item}
                    index={index}
                    textColor={textColor}
                    surfaceColor={surfaceColor}
                    borderColor={borderColor}
                    onPress={() => handleSearch(item)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View style={styles.section}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="flame" size={18} color="#ef4444" />
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Tìm kiếm phổ biến
              </Text>
            </View>
            <View style={styles.tagContainer}>
              {POPULAR_SEARCHES.map((item, index) => (
                <PopularTag
                  key={index}
                  item={item}
                  index={index}
                  isDark={isDark}
                  onPress={() => handlePopularPress(item.text)}
                />
              ))}
            </View>
          </View>

          {/* Quick Categories */}
          <View style={styles.section}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="apps" size={18} color="#10b981" />
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Danh mục nổi bật
              </Text>
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category, index) => (
                <CategoryCard
                  key={index}
                  category={category}
                  index={index}
                  onPress={() => handlePopularPress(category.name)}
                />
              ))}
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  resultsInfo: {},
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultsQuery: {
    fontSize: 13,
    marginTop: 2,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  productList: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
    gap: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  defaultContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  clearText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "500",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  historyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  popularTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popularTagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCardWrapper: {
    width: (SCREEN_WIDTH - 52) / 3,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryGradient: {
    paddingVertical: 20,
    alignItems: "center",
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  bottomPadding: {
    height: 100,
  },
});
