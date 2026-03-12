/**
 * News Listing Screen
 * ====================
 * Displays news articles from multiple sources (GNews, TheNewsAPI, mock fallback).
 * Features category tabs, search, pull-to-refresh, and article detail webview.
 */
import { useAuth } from "@/context/AuthContext";
import {
    getNews,
    NEWS_CATEGORIES,
    NEWS_CATEGORY_LABELS,
    type NewsArticle,
    type NewsCategory,
} from "@/services/newsApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const THEME = {
  primary: "#0D9488",
  bg: "#F8FAFB",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSec: "#6B7280",
  border: "#E5E7EB",
  accent: "#FF6B35",
  error: "#EF4444",
};

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState<NewsCategory>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [source, setSource] = useState<string>("");

  const searchAnim = useRef(new Animated.Value(0)).current;

  const loadArticles = useCallback(
    async (pageNum = 1, append = false, cat?: NewsCategory, query?: string) => {
      try {
        if (pageNum === 1 && !append) setLoading(true);
        if (append) setLoadingMore(true);

        const response = await getNews({
          category: cat ?? category,
          q: (query ?? searchQuery) || undefined,
          pageSize: 20,
          page: pageNum,
        });

        const newArticles = response.articles || [];
        setSource(response.source);

        if (append) {
          setArticles((prev) => [...prev, ...newArticles]);
        } else {
          setArticles(newArticles);
        }

        setHasMore(newArticles.length >= 20);
        setPage(pageNum);
      } catch (error) {
        console.error("[News] Load error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [category, searchQuery],
  );

  useEffect(() => {
    loadArticles(1, false, category, searchQuery);
  }, [category]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadArticles(1, false, category, searchQuery);
  }, [category, searchQuery, loadArticles]);

  const onLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadArticles(page + 1, true);
    }
  }, [loadingMore, hasMore, loading, page, loadArticles]);

  const handleSearch = useCallback(() => {
    loadArticles(1, false, category, searchQuery);
  }, [category, searchQuery, loadArticles]);

  const toggleSearch = useCallback(() => {
    const newShow = !showSearch;
    setShowSearch(newShow);
    Animated.timing(searchAnim, {
      toValue: newShow ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
    if (!newShow) {
      setSearchQuery("");
      loadArticles(1, false, category, "");
    }
  }, [showSearch, searchAnim, category, loadArticles]);

  const openArticle = useCallback((article: NewsArticle) => {
    if (article.url) {
      Linking.openURL(article.url).catch(() => {});
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56],
  });

  // ============================================================
  // Render helpers
  // ============================================================

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.catRow}
    >
      {NEWS_CATEGORIES.map((cat) => {
        const active = cat === category;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, active && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, active && styles.catTextActive]}>
              {NEWS_CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderFeaturedArticle = (article: NewsArticle) => (
    <TouchableOpacity
      key={article.id}
      style={styles.featuredCard}
      onPress={() => openArticle(article)}
      activeOpacity={0.85}
    >
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.featuredImage, styles.imagePlaceholder]}>
          <Ionicons name="newspaper-outline" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.featuredOverlay} />
      <View style={styles.featuredContent}>
        {article.category && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>
              {NEWS_CATEGORY_LABELS[article.category as NewsCategory] ||
                article.category}
            </Text>
          </View>
        )}
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredSource}>{article.source.name}</Text>
          <Text style={styles.featuredDot}>•</Text>
          <Text style={styles.featuredDate}>
            {formatDate(article.publishedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderArticleCard = ({
    item,
    index,
  }: {
    item: NewsArticle;
    index: number;
  }) => {
    // First article is featured
    if (index === 0 && !searchQuery) {
      return renderFeaturedArticle(item);
    }

    return (
      <TouchableOpacity
        style={styles.articleCard}
        onPress={() => openArticle(item)}
        activeOpacity={0.85}
      >
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.articleDesc} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.articleMeta}>
            <View style={styles.sourceRow}>
              <Ionicons
                name="newspaper-outline"
                size={12}
                color={THEME.textSec}
              />
              <Text style={styles.sourceName} numberOfLines={1}>
                {item.source.name}
              </Text>
            </View>
            <Text style={styles.articleDate}>
              {formatDate(item.publishedAt)}
            </Text>
          </View>
        </View>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.articleImage, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={20} color="#ccc" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={THEME.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Không có tin tức</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `Không tìm thấy kết quả cho "${searchQuery}"`
            : "Chưa có bài viết nào trong danh mục này"}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ============================================================
  // Loading skeleton
  // ============================================================
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonFeatured} />
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine1} />
            <View style={styles.skeletonLine2} />
            <View style={styles.skeletonLine3} />
          </View>
          <View style={styles.skeletonImage} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin tức</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleSearch} style={styles.headerBtn}>
            <Ionicons
              name={showSearch ? "close" : "search"}
              size={20}
              color={THEME.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          { height: searchHeight, overflow: "hidden" },
        ]}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={THEME.textSec} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin tức..."
            placeholderTextColor={THEME.textSec}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                loadArticles(1, false, category, "");
              }}
            >
              <Ionicons name="close-circle" size={18} color={THEME.textSec} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Category tabs */}
      {renderCategoryTabs()}

      {/* Source indicator */}
      {source && !loading && (
        <View style={styles.sourceIndicator}>
          <Ionicons name="globe-outline" size={12} color={THEME.textSec} />
          <Text style={styles.sourceIndicatorText}>
            Nguồn: {source === "mock" ? "Demo" : source.toUpperCase()} •{" "}
            {articles.length} bài viết
          </Text>
        </View>
      )}

      {/* Article list */}
      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticleCard}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchContainer: {
    backgroundColor: THEME.card,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.text,
    padding: 0,
  },

  // Categories
  catRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  catChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  catText: {
    fontSize: 13,
    fontWeight: "500",
    color: THEME.textSec,
  },
  catTextActive: {
    color: "#FFF",
  },

  // Source indicator
  sourceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 4,
  },
  sourceIndicatorText: {
    fontSize: 11,
    color: THEME.textSec,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Featured card
  featuredCard: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: THEME.card,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featuredImage: {
    width: "100%",
    height: 200,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredBadge: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
    textTransform: "uppercase",
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 6,
    lineHeight: 22,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredSource: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  featuredDot: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 6,
  },
  featuredDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  // Article card
  articleCard: {
    flexDirection: "row",
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    gap: 12,
  },
  articleContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  articleDesc: {
    fontSize: 12,
    color: THEME.textSec,
    lineHeight: 17,
    marginBottom: 6,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  sourceName: {
    fontSize: 11,
    color: THEME.textSec,
    flex: 1,
  },
  articleDate: {
    fontSize: 11,
    color: THEME.textSec,
  },
  articleImage: {
    width: 88,
    height: 88,
    borderRadius: 10,
  },
  imagePlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.textSec,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  // Footer
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },

  // Skeleton
  skeletonContainer: {
    padding: 16,
  },
  skeletonFeatured: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  skeletonCard: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 10,
    backgroundColor: THEME.card,
    borderRadius: 12,
    gap: 12,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonLine1: {
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    width: "90%",
  },
  skeletonLine2: {
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    width: "70%",
  },
  skeletonLine3: {
    height: 10,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    width: "50%",
  },
  skeletonImage: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
});
