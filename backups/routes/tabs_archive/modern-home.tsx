/**
 * Modern Shopping Home Screen
 * Created: 12/12/2025
 * 
 * Shopee/Grab style layout with:
 * - Modern Search Bar with voice & camera
 * - Banner Carousel with flash sale countdown
 * - Category Grid (8 categories, scrollable)
 * - Product Grid with infinite scroll
 * 
 * Features:
 * - Pull-to-refresh
 * - Infinite scroll
 * - Filter by category
 * - Search navigation
 */

import ModernSearchBar from '@/components/navigation/modern-search-bar';
import BannerCarousel from '@/components/shopping/banner-carousel';
import CategoryGrid from '@/components/shopping/category-grid';
import { Product } from '@/components/shopping/product-card-grid';
import ProductGrid from '@/components/shopping/product-grid';
import {
    MODERN_COLORS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from '@/constants/modern-theme';
import {
    MOCK_BANNERS,
    MOCK_CATEGORIES,
    MOCK_PRODUCTS,
    MOCK_SEARCH_SUGGESTIONS,
} from '@/data/mock-shopping-products';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ModernHomeScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Using mock data for now - will switch to API when backend is ready
  // const { products, loading, error, loadMore, refresh, refreshing, hasMore, setFilters } = useShoppingProducts({
  //   filters: { categoryId: activeCategory },
  //   autoFetch: true,
  // });

  // Mock state for demo
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore] = useState(true);

  // Handle category selection
  const handleCategoryPress = useCallback((category: any) => {
    setActiveCategory(category.id === activeCategory ? '' : category.id);
    // When API is ready: setFilters({ categoryId: category.id });
  }, [activeCategory]);

  // Handle product card press
  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.id}`);
  }, []);

  // Handle favorite toggle
  const handleFavorite = useCallback((productId: string) => {
    console.log('Toggle favorite:', productId);
    // TODO: Implement favorite API call
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    console.log('Search:', query);
    // Navigate to search results screen
    // router.push(`/search-results?q=${encodeURIComponent(query)}` as any);
  }, []);

  // Handle banner press
  const handleBannerPress = useCallback((banner: any) => {
    console.log('Banner pressed:', banner);
    // Navigate to flash sale or promotion page
  }, []);

  // Handle load more (infinite scroll)
  const handleLoadMore = useCallback(async () => {
    // await loadMore();
    console.log('Load more products');
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // await refresh();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Filter products by category
  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={MODERN_COLORS.surface} />
      
      <View style={styles.container}>
        {/* Header with Search */}
        <View style={styles.header}>
          <ModernSearchBar
            placeholder="Tìm kiếm sản phẩm..."
            onSearch={handleSearch}
            showVoice={true}
            showCamera={true}
            showSuggestions={true}
            suggestions={MOCK_SEARCH_SUGGESTIONS}
          />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Section Title - Flash Sale */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flash" size={20} color={MODERN_COLORS.flashSale} />
              <Text style={styles.sectionTitle}>Flash Sale</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* Banner Carousel */}
          <BannerCarousel
            banners={MOCK_BANNERS}
            autoScroll={true}
            interval={3000}
            onBannerPress={handleBannerPress}
            showCountdown={true}
          />

          {/* Quick Actions - Calls & Contacts */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#E8F4FF' }]}
              onPress={() => router.push('/(tabs)/contacts' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={24} color="#0EA5E9" />
              <Text style={styles.quickActionText}>Gọi điện</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#D1FAE5' }]}
              onPress={() => router.push('/(tabs)/call-test' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam" size={24} color="#10B981" />
              <Text style={styles.quickActionText}>Video Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#FEF3C7' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="people" size={24} color="#F59E0B" />
              <Text style={styles.quickActionText}>Họp nhóm</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#FCE7F3' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubbles" size={24} color="#EC4899" />
              <Text style={styles.quickActionText}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Section Title - Categories */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="grid-outline" size={20} color={MODERN_COLORS.primary} />
              <Text style={styles.sectionTitle}>Danh mục</Text>
            </View>
          </View>

          {/* Category Grid */}
          <CategoryGrid
            categories={MOCK_CATEGORIES}
            onCategoryPress={handleCategoryPress}
            activeCategory={activeCategory}
            scrollable={false}
            columns={4}
          />

          {/* Section Title - Products */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="gift-outline" size={20} color={MODERN_COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {activeCategory 
                  ? MOCK_CATEGORIES.find(c => c.id === activeCategory)?.name || 'Sản phẩm'
                  : 'Gợi ý hôm nay'}
              </Text>
            </View>
            {activeCategory && (
              <TouchableOpacity 
                onPress={() => setActiveCategory('')}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFilterText}>Xóa lọc</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Product Grid */}
          <ProductGrid
            products={filteredProducts}
            onFavorite={handleFavorite}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            isLoading={loading}
            isRefreshing={refreshing}
            hasMore={hasMore}
            error={null}
          />

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  
  // Header
  header: {
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.sm,
    zIndex: 10,
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.xs,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  seeAllText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.primary,
  },
  clearFilterText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.error,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
  },
  quickActionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 72,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    textAlign: 'center',
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: MODERN_SPACING.xxxl,
  },
});
