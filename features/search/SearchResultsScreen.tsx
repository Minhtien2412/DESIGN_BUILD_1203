/**
 * Search Results Screen - Modernized with Nordic Green Theme
 * Features: Filters, sort, grid/list toggle, category chips
 * Updated: 13/12/2025
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import { PRODUCTS, Product } from '@/data/products';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type ViewMode = 'grid' | 'list';
type SortBy = 'relevance' | 'price-asc' | 'price-desc' | 'name';
type FilterCategory = 'all' | 'villa' | 'design' | 'construction' | 'consult';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: 'apps-outline' },
  { id: 'villa', label: 'Biệt thự', icon: 'home-outline' },
  { id: 'design', label: 'Thiết kế', icon: 'color-palette-outline' },
  { id: 'construction', label: 'Thi công', icon: 'construct-outline' },
  { id: 'consult', label: 'Tư vấn', icon: 'chatbubbles-outline' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Liên quan' },
  { id: 'price-asc', label: 'Giá: Thấp → Cao' },
  { id: 'price-desc', label: 'Giá: Cao → Thấp' },
  { id: 'name', label: 'Tên A-Z' },
];

export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q || '');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [showSortModal, setShowSortModal] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let results = PRODUCTS;

    // Text search
    if (query.trim()) {
      const normalizedQuery = query.toLowerCase().trim();
      results = results.filter(p => 
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.description?.toLowerCase().includes(normalizedQuery) ||
        p.category?.toLowerCase().includes(normalizedQuery)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(p => p.category === selectedCategory);
    }

    // Price range filter
    results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return results;
  }, [query, selectedCategory, sortBy, priceRange]);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)}M`;
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  const renderCategoryChip = (category: typeof CATEGORIES[0]) => {
    const isActive = selectedCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryChip,
          isActive && styles.categoryChipActive,
        ]}
        onPress={() => setSelectedCategory(category.id as FilterCategory)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={category.icon as any} 
          size={18} 
          color={isActive ? MODERN_COLORS.surface : MODERN_COLORS.text} 
        />
        <Text style={[
          styles.categoryChipText,
          isActive && styles.categoryChipTextActive,
        ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductGrid = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
        style={styles.gridImage}
        resizeMode="cover"
      />
      {item.discountPercent && item.discountPercent > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discountPercent}%</Text>
        </View>
      )}
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color={MODERN_COLORS.surface} />
      </TouchableOpacity>
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.gridPriceRow}>
          <Text style={styles.gridPrice}>{formatPrice(item.price)}</Text>
          {item.stock !== undefined && (
            <Text style={styles.gridStock}>Còn {item.stock}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductList = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
        style={styles.listImage}
        resizeMode="cover"
      />
      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={2}>{item.name}</Text>
        {item.description && (
          <Text style={styles.listDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
        <View style={styles.listFooter}>
          <Text style={styles.listPrice}>{formatPrice(item.price)}</Text>
          {item.discountPercent && item.discountPercent > 0 && (
            <View style={styles.listDiscountBadge}>
              <Text style={styles.listDiscountText}>-{item.discountPercent}%</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.listFavoriteButton}>
        <Ionicons name="heart-outline" size={22} color={MODERN_COLORS.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={MODERN_COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={MODERN_COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm, dịch vụ..."
            placeholderTextColor={MODERN_COLORS.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={MODERN_COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(renderCategoryChip)}
      </ScrollView>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <Text style={styles.resultCount}>
            {filteredProducts.length} kết quả
          </Text>
        </View>
        <View style={styles.toolbarRight}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical-outline" size={18} color={MODERN_COLORS.text} />
            <Text style={styles.toolbarButtonText}>Sắp xếp</Text>
          </TouchableOpacity>
          <View style={styles.viewModeButtons}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'grid' && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons 
                name="grid-outline" 
                size={18} 
                color={viewMode === 'grid' ? MODERN_COLORS.primary : MODERN_COLORS.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'list' && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list-outline" 
                size={18} 
                color={viewMode === 'list' ? MODERN_COLORS.primary : MODERN_COLORS.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Results */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={MODERN_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
          <Text style={styles.emptySubtitle}>
            Thử tìm kiếm với từ khóa khác
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={viewMode === 'grid' ? renderProductGrid : renderProductList}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={[
            styles.listContent,
            viewMode === 'grid' && styles.gridContent,
          ]}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModal}>
            <View style={styles.sortHeader}>
              <Text style={styles.sortTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={MODERN_COLORS.text} />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option.id as SortBy);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.id && styles.sortOptionTextActive,
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={20} color={MODERN_COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    height: 44,
    gap: MODERN_SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },
  categoriesContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  categoriesContent: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  categoryChipActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  categoryChipText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  categoryChipTextActive: {
    color: MODERN_COLORS.surface,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  toolbarLeft: {
    flex: 1,
  },
  resultCount: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.md,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xxs,
  },
  toolbarButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.text,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
    padding: 2,
  },
  viewModeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MODERN_RADIUS.sm,
  },
  viewModeButtonActive: {
    backgroundColor: MODERN_COLORS.surface,
  },
  listContent: {
    paddingVertical: MODERN_SPACING.sm,
  },
  gridContent: {
    paddingHorizontal: MODERN_SPACING.sm,
  },
  gridRow: {
    gap: MODERN_SPACING.sm,
  },
  gridItem: {
    flex: 1,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    overflow: 'hidden',
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  gridImage: {
    width: '100%',
    height: 140,
    backgroundColor: MODERN_COLORS.background,
  },
  discountBadge: {
    position: 'absolute',
    top: MODERN_SPACING.sm,
    left: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.danger,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xxs,
    borderRadius: MODERN_RADIUS.sm,
  },
  discountText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.surface,
  },
  favoriteButton: {
    position: 'absolute',
    top: MODERN_SPACING.sm,
    right: MODERN_SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    padding: MODERN_SPACING.sm,
  },
  gridName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  gridPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  gridStock: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: MODERN_COLORS.background,
  },
  listInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
    justifyContent: 'space-between',
  },
  listName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  listDescription: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
  },
  listPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  listDiscountBadge: {
    backgroundColor: MODERN_COLORS.danger + '15',
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xxs,
    borderRadius: MODERN_RADIUS.sm,
  },
  listDiscountText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.danger,
  },
  listFavoriteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MODERN_SPACING.xl,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: MODERN_RADIUS.lg,
    borderTopRightRadius: MODERN_RADIUS.lg,
    paddingBottom: MODERN_SPACING.xl,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  sortTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
  },
  sortOptionText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },
  sortOptionTextActive: {
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.primary,
  },
});
