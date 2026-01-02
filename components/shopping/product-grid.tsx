/**
 * Product Grid Container - 2 Columns with Infinite Scroll
 * Created: 12/12/2025
 * 
 * Features:
 * - FlatList with 2 columns
 * - Infinite scroll (load more on scroll)
 * - Pull-to-refresh
 * - Loading footer
 * - Empty state
 * - Error state
 * 
 * Usage:
 * <ProductGrid 
 *   products={products}
 *   onLoadMore={fetchMore}
 *   onRefresh={refetch}
 *   isLoading={loading}
 *   hasMore={hasNextPage}
 * />
 */

import { MODERN_COLORS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import ProductCardGrid, { Product } from './product-card-grid';

interface ProductGridProps {
  products: Product[];
  onFavorite?: (productId: string) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  hasMore?: boolean;
  error?: string | null;
}

export default function ProductGrid({
  products,
  onFavorite,
  onLoadMore,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  hasMore = false,
  error = null,
}: ProductGridProps) {
  
  // Render each product card
  const renderItem = ({ item }: { item: Product }) => (
    <ProductCardGrid product={item} onFavorite={onFavorite} />
  );

  // Loading footer when fetching more
  const renderFooter = () => {
    if (!isLoading || !hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  };

  // Empty state
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.emptyText}>Đang tải sản phẩm...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.emptySubtext}>Vui lòng thử lại sau</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
        <Text style={styles.emptySubtext}>Thử tìm kiếm khác hoặc quay lại sau</Text>
      </View>
    );
  };

  // Key extractor
  const keyExtractor = (item: Product) => item.id;

  // Get item layout for performance
  const getItemLayout = (_data: any, index: number) => ({
    length: MODERN_SPACING.md + 200, // Approximate card height
    offset: (MODERN_SPACING.md + 200) * Math.floor(index / 2),
    index,
  });

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[
        styles.container,
        products.length === 0 && styles.containerEmpty,
      ]}
      showsVerticalScrollIndicator={false}
      
      // Infinite scroll
      onEndReached={hasMore && !isLoading ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      
      // Pull to refresh
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[MODERN_COLORS.primary]}
            tintColor={MODERN_COLORS.primary}
          />
        ) : undefined
      }
      
      // Empty state
      ListEmptyComponent={renderEmpty}
      
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      initialNumToRender={6}
      getItemLayout={getItemLayout}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.xxl,
  },
  containerEmpty: {
    flex: 1,
  },
  
  // Row (2 columns)
  row: {
    justifyContent: 'space-between',
    marginBottom: MODERN_SPACING.xs,
  },
  
  // Loading footer
  footer: {
    paddingVertical: MODERN_SPACING.lg,
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
  },
  loadingText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: MODERN_SPACING.xxxl,
    gap: MODERN_SPACING.sm,
  },
  emptyText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.danger,
    textAlign: 'center',
  },
});
