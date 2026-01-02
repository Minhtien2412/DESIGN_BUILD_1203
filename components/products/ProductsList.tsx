/**
 * Products List Component - Displays products from backend
 * Fetches from: https://baotienweb.cloud/api/v1/products
 */

import { MODERN_COLORS, MODERN_SHADOWS, MODERN_SPACING } from '@/constants/modern-theme';
import { getMyProducts } from '@/services/products';
import type { Product } from '@/types/products';
import { ProductCategory, ProductStatus } from '@/types/products';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

interface ProductsListProps {
  category?: ProductCategory;
  status?: ProductStatus;
  limit?: number;
  horizontal?: boolean;
  showHeader?: boolean;
  onProductPress?: (product: Product) => void;
}

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

export function ProductsList({
  category,
  status = ProductStatus.APPROVED,
  limit = 20,
  horizontal = false,
  showHeader = true,
  onProductPress,
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [category, status, limit]);

  const loadProducts = async () => {
    try {
      setError(null);
      const response = await getMyProducts({
        category,
        status,
        limit,
        page: 1,
        isAvailable: true,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      
      setProducts(response.products || []);
    } catch (err: any) {
      console.error('[ProductsList] Error loading products:', err);
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleProductPress = (product: Product) => {
    if (onProductPress) {
      onProductPress(product);
    } else {
      // Navigate to product detail screen
      router.push(`/shopping/product-detail?id=${product.id}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, horizontal && styles.horizontalCard]}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      {/* Product Image */}
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
        
        {/* Category Badge */}
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

        {/* Availability Badge */}
        {!item.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Hết hàng</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
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

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={MODERN_COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>Chưa có sản phẩm</Text>
      <Text style={styles.emptySubtitle}>
        {category
          ? `Chưa có sản phẩm trong danh mục ${CATEGORY_LABELS[category]}`
          : 'Chưa có sản phẩm nào'}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={MODERN_COLORS.error} />
      <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="storefront" size={24} color={MODERN_COLORS.primary} />
          <Text style={styles.headerTitle}>
            {category ? CATEGORY_LABELS[category] : 'Sản phẩm'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/shopping/products-catalog')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={18} color={MODERN_COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={horizontal ? undefined : 2}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          horizontal && styles.horizontalList,
        ]}
        columnWrapperStyle={!horizontal ? styles.columnWrapper : undefined}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          !horizontal ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={MODERN_COLORS.primary}
              colors={[MODERN_COLORS.primary]}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MODERN_COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: MODERN_COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.lg,
  },
  horizontalList: {
    paddingHorizontal: MODERN_SPACING.md,
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
  horizontalCard: {
    width: 200,
    marginRight: MODERN_SPACING.md,
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
    marginBottom: 6,
  },
  stockText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: MODERN_COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: MODERN_COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: MODERN_SPACING.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MODERN_COLORS.error,
    marginTop: MODERN_SPACING.md,
  },
  errorText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.xs,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
