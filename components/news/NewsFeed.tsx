/**
 * News Feed Component
 * ===================
 * 
 * Component hiển thị danh sách tin tức với các category tabs.
 * Tập trung vào tin tức xây dựng và bất động sản.
 * Tích hợp external content từ GNews khi không có dữ liệu từ database.
 * 
 * @author ThietKeResort Team
 * @created 2025-01-12
 * @updated 2026-01-16 - Thêm external content fallback
 */

import { TappableImage } from '@/components/ui/full-media-viewer';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Linking,
    RefreshControl,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { ExternalNewsSection } from '@/components/ExternalContentSection';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useExternalNews } from '@/hooks/useExternalContent';
import {
    getNews,
    NEWS_CATEGORY_LABELS,
    type NewsArticle,
    type NewsCategory
} from '../../services/newsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// Types
// ============================================
interface NewsFeedProps {
  /** Default category to show */
  defaultCategory?: NewsCategory;
  /** Categories to show in tabs */
  categories?: NewsCategory[];
  /** Number of articles per page */
  pageSize?: number;
  /** Show category tabs */
  showTabs?: boolean;
  /** Show search bar */
  showSearch?: boolean;
  /** Custom style */
  style?: any;
  /** On article press callback */
  onArticlePress?: (article: NewsArticle) => void;
}

interface NewsCardProps {
  article: NewsArticle;
  onPress: () => void;
  onShare: () => void;
  featured?: boolean;
}

// ============================================
// News Card Component
// ============================================
function NewsCard({ article, onPress, onShare, featured = false }: NewsCardProps) {
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (featured) {
    return (
      <TouchableOpacity 
        style={[styles.featuredCard, { backgroundColor: cardColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {article.imageUrl ? (
          <TappableImage 
            source={{ uri: article.imageUrl }} 
            style={styles.featuredImage}
            title={article.title}
            description={article.description || undefined}
          />
        ) : (
          <View style={[styles.featuredImage, styles.placeholderImage]}>
            <Ionicons name="newspaper-outline" size={48} color={secondaryText} />
          </View>
        )}
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <View style={styles.sourceRow}>
            <Text style={styles.featuredSource}>{article.source.name}</Text>
            <Text style={styles.featuredDate}>{formatDate(article.publishedAt)}</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={3}>
            {article.title}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={[styles.cardSource, { color: secondaryText }]}>
            {article.source.name}
          </Text>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
            {article.title}
          </Text>
          {article.description && (
            <Text style={[styles.cardDescription, { color: secondaryText }]} numberOfLines={2}>
              {article.description}
            </Text>
          )}
          <View style={styles.cardMeta}>
            <Text style={[styles.cardDate, { color: secondaryText }]}>
              {formatDate(article.publishedAt)}
            </Text>
            <TouchableOpacity onPress={onShare} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="share-social-outline" size={16} color={secondaryText} />
            </TouchableOpacity>
          </View>
        </View>
        {article.imageUrl ? (
          <TappableImage 
            source={{ uri: article.imageUrl }} 
            style={styles.cardImage}
            title={article.title}
            description={article.description || undefined}
          />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImageSmall]}>
            <Ionicons name="image-outline" size={24} color={secondaryText} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// Category Tab Component
// ============================================
function CategoryTabs({ 
  categories, 
  activeCategory, 
  onSelect 
}: { 
  categories: NewsCategory[];
  activeCategory: NewsCategory;
  onSelect: (category: NewsCategory) => void;
}) {
  const primaryColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  
  return (
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContainer}
      renderItem={({ item }) => {
        const isActive = item === activeCategory;
        return (
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: isActive ? primaryColor : cardColor },
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={[
              styles.tabText,
              { color: isActive ? '#fff' : secondaryText },
            ]}>
              {NEWS_CATEGORY_LABELS[item]}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

// ============================================
// Main Component
// ============================================
export function NewsFeed({
  defaultCategory = 'construction',
  categories = ['construction', 'realestate', 'general', 'business', 'technology'],
  pageSize = 20,
  showTabs = true,
  showSearch = false,
  style,
  onArticlePress,
}: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(defaultCategory);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'tabIconDefault');

  // Fetch external news as fallback when no DB data
  const { 
    articles: externalArticles, 
    isLoading: externalLoading 
  } = useExternalNews({ 
    category: 'general',
    max: 10,
    enabled: articles.length === 0 && !loading // Only fetch when no DB articles
  });

  // Fetch news
  const fetchNews = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      
      const data = await getNews({
        category: activeCategory,
        pageSize,
      });
      
      setArticles(data.articles);
    } catch (err: any) {
      console.error('[NewsFeed] Error:', err);
      setError(err.message || 'Không thể tải tin tức');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews(true);
  }, [fetchNews]);

  // Handle category change
  const handleCategoryChange = useCallback((category: NewsCategory) => {
    setActiveCategory(category);
    setArticles([]);
  }, []);

  // Handle article press
  const handleArticlePress = useCallback(async (article: NewsArticle) => {
    if (onArticlePress) {
      onArticlePress(article);
    } else {
      // Open in browser
      try {
        await Linking.openURL(article.url);
      } catch (err) {
        console.error('Cannot open URL:', err);
      }
    }
  }, [onArticlePress]);

  // Handle share
  const handleShare = useCallback(async (article: NewsArticle) => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.url}`,
        url: article.url,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  }, []);

  // Memoized list header (featured article)
  const ListHeader = useMemo(() => {
    if (articles.length === 0) return null;
    
    const featured = articles[0];
    return (
      <NewsCard
        article={featured}
        featured
        onPress={() => handleArticlePress(featured)}
        onShare={() => handleShare(featured)}
      />
    );
  }, [articles, handleArticlePress, handleShare]);

  // Remaining articles (skip first)
  const remainingArticles = useMemo(() => {
    return articles.slice(1);
  }, [articles]);

  // Loading state
  if (loading && articles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }, style]}>
        {showTabs && (
          <CategoryTabs
            categories={categories as NewsCategory[]}
            activeCategory={activeCategory}
            onSelect={handleCategoryChange}
          />
        )}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: secondaryText }]}>
            Đang tải tin tức...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && articles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }, style]}>
        {showTabs && (
          <CategoryTabs
            categories={categories as NewsCategory[]}
            activeCategory={activeCategory}
            onSelect={handleCategoryChange}
          />
        )}
        <View style={styles.errorContainer}>
          <Ionicons name="newspaper-outline" size={48} color={secondaryText} />
          <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={() => fetchNews()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {showTabs && (
        <CategoryTabs
          categories={categories as NewsCategory[]}
          activeCategory={activeCategory}
          onSelect={handleCategoryChange}
        />
      )}
      
      <FlatList
        data={remainingArticles}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onPress={() => handleArticlePress(item)}
            onShare={() => handleShare(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[primaryColor]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={secondaryText} />
            <Text style={[styles.emptyText, { color: secondaryText }]}>
              Không có tin tức nào từ database
            </Text>
            {/* External News Fallback */}
            {externalArticles.length > 0 && (
              <View style={styles.externalSection}>
                <ExternalNewsSection 
                  articles={externalArticles}
                  title="📰 Tin tham khảo"
                  subtitle="Tin tức từ GNews API"
                  isLoading={externalLoading}
                  layout="vertical"
                />
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          // Show external news at bottom when DB has few articles
          articles.length > 0 && articles.length < 5 && externalArticles.length > 0 ? (
            <View style={styles.externalSection}>
              <ExternalNewsSection 
                articles={externalArticles}
                title="📰 Tin tham khảo thêm"
                subtitle="Nội dung từ GNews"
                isLoading={externalLoading}
                layout="vertical"
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Tabs
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  
  // External Content Section
  externalSection: {
    width: SCREEN_WIDTH - 32,
    marginTop: 16,
  },
  
  // List
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  
  // Featured Card
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featuredSource: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  shareButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Regular Card
  card: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  cardSource: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 11,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  
  // Placeholders
  placeholderImage: {
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImageSmall: {
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NewsFeed;
