/**
 * Products from Backend Screen
 * Full catalog with filters and search
 * API: https://baotienweb.cloud/api/v1/products
 */

import { MODERN_COLORS, MODERN_SHADOWS, MODERN_SPACING } from '@/constants/modern-theme';
import { getMyProducts } from '@/services/products';
import type { Product } from '@/types/products';
import { ProductCategory, ProductStatus } from '@/types/products';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.MATERIAL]: 'Vật liệu',
  [ProductCategory.TOOL]: 'Công cụ',
  [ProductCategory.EQUIPMENT]: 'Thiết bị',
  [ProductCategory.SERVICE]: 'Dịch vụ',
};

const CATEGORY_ICONS: Record<ProductCategory, any> = {
  [ProductCategory.MATERIAL]: 'cube',
  [ProductCategory.TOOL]: 'hammer',
  [ProductCategory.EQUIPMENT]: 'construct',
  [ProductCategory.SERVICE]: 'briefcase',
};

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', value: undefined, icon: 'apps' },
  { id: ProductCategory.MATERIAL, label: CATEGORY_LABELS[ProductCategory.MATERIAL], value: ProductCategory.MATERIAL, icon: 'cube' },
  { id: ProductCategory.TOOL, label: CATEGORY_LABELS[ProductCategory.TOOL], value: ProductCategory.TOOL, icon: 'hammer' },
  { id: ProductCategory.EQUIPMENT, label: CATEGORY_LABELS[ProductCategory.EQUIPMENT], value: ProductCategory.EQUIPMENT, icon: 'construct' },
  { id: ProductCategory.SERVICE, label: CATEGORY_LABELS[ProductCategory.SERVICE], value: ProductCategory.SERVICE, icon: 'briefcase' },
];

type SortOption = 'createdAt' | 'price' | 'name';

export default function ProductsFromBackendScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProducts(1, true);
  }, [selectedCategory, sortBy, sortOrder, searchQuery]);

  const loadProducts = async (pageNum: number, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getMyProducts({
        category: selectedCategory,
        status: ProductStatus.APPROVED,
        limit: 20,
        page: pageNum,
        isAvailable: true,
        sortBy,
        sortOrder,
        search: searchQuery || undefined,
      });

      if (reset) {
        setProducts(response.products);
      } else {
        setProducts((prev) => [...prev, ...response.products]);
      }
      
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setPage(pageNum);
    } catch (err: any) {
      console.error('[ProductsFromBackend] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts(1, true);
  }, [selectedCategory, sortBy, sortOrder, searchQuery]);

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      loadProducts(page + 1, false);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/shopping/product-detail?id=${product.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name={CATEGORY_ICONS[item.category] || 'cube-outline'}
              size={40}
              color={MODERN_COLORS.textTertiary}
            />
          </View>
        )}
        
        <View style={styles.categoryBadge}>
          <Ionicons
            name={CATEGORY_ICONS[item.category] || 'cube-outline'}
            size={12}
            color="#fff"
          />
          <Text style={styles.categoryText}>
            {CATEGORY_LABELS[item.category]}
          </Text>
        </View>

        {!item.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Hết hàng</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <Text style={styles.unit}>/{item.unit}</Text>
        </View>

        {item.stock !== undefined && (
          <View style={styles.stockRow}>
            <Ionicons name="cube-outline" size={14} color={MODERN_COLORS.textSecondary} />
            <Text style={styles.stockText}>Kho: {item.stock}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={MODERN_COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={MODERN_COLORS.textTertiary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={MODERN_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryPill,
              selectedCategory === cat.value && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.value ? '#fff' : MODERN_COLORS.textSecondary}
            />
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === cat.value && styles.categoryPillTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortOptions}
        >
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'createdAt' && styles.sortButtonActive]}
            onPress={() => setSortBy('createdAt')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'createdAt' && styles.sortButtonTextActive]}>
              Mới nhất
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'price' && styles.sortButtonTextActive]}>
              Giá
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
              Tên A-Z
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          >
            <Ionicons
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={MODERN_COLORS.primary}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {total} sản phẩm
        </Text>
        {loading && <ActivityIndicator size="small" color={MODERN_COLORS.primary} />}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={MODERN_COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
      <Text style={styles.emptySubtitle}>
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={MODERN_COLORS.primary} />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sản phẩm từ Backend',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
          },
        }}
      />
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {loading && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={MODERN_COLORS.primary}
                colors={[MODERN_COLORS.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
    borderRadius: 12,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 10,
    marginBottom: MODERN_SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: MODERN_COLORS.text,
    marginLeft: MODERN_SPACING.xs,
  },
  categoriesScroll: {
    paddingVertical: MODERN_SPACING.xs,
    gap: MODERN_SPACING.xs,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.background,
    marginRight: MODERN_SPACING.xs,
  },
  categoryPillActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.textSecondary,
  },
  categoryPillTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: MODERN_SPACING.sm,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginRight: MODERN_SPACING.sm,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: MODERN_SPACING.xs,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: MODERN_COLORS.background,
  },
  sortButtonActive: {
    backgroundColor: MODERN_COLORS.primaryLight,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: MODERN_COLORS.textSecondary,
  },
  sortButtonTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: '600',
  },
  orderButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: MODERN_COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: MODERN_SPACING.xs,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: MODERN_SPACING.sm,
  },
  resultsText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: MODERN_SPACING.md,
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...MODERN_SHADOWS.sm,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: MODERN_COLORS.background,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.border,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: MODERN_COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unavailableText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  productInfo: {
    padding: MODERN_SPACING.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: MODERN_COLORS.primary,
  },
  unit: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginLeft: 2,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.xs,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: MODERN_SPACING.lg,
    alignItems: 'center',
  },
});
