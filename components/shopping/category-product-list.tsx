/**
 * CategoryProductList Component
 * Reusable product list for any category with API integration
 */

import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { productService } from '@/services/api/product.service';
import { ProductStatus, type Product } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

interface CategoryProductListProps {
  category: string;
  title: string;
  description?: string;
}

export const CategoryProductList: React.FC<CategoryProductListProps> = ({
  category,
  title,
  description,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showRelated, setShowRelated] = useState(false);

  const loadProducts = async () => {
    try {
      console.log(`[CategoryProductList] Loading products for category: ${category}`);
      const response = await productService.getProducts({
        category,
        status: ProductStatus.APPROVED,
        search: search || undefined,
        limit: 100,
      });
      
      let items = response.data;
      console.log(`[CategoryProductList] Loaded ${items.length} products`);

      // Client-side sorting
      if (sortBy === 'price-low') items.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-high') items.sort((a, b) => b.price - a.price);
      else if (sortBy === 'popular') items.sort((a, b) => b.soldCount - a.soldCount);
      else items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setProducts(items);
    } catch (error) {
      console.error('[CategoryProductList] Load products failed:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [category, sortBy, search]);

  const handleSearch = () => {
    setLoading(true);
    loadProducts();
  };

  const loadRelatedProducts = async () => {
    try {
      // Load products from all categories except current one
      const response = await productService.getProducts({
        status: ProductStatus.APPROVED,
        limit: 20,
      });
      const filtered = response.data.filter(p => p.category !== category);
      setRelatedProducts(filtered.slice(0, 10));
    } catch (error) {
      console.error('[CategoryProductList] Load related products failed:', error);
    }
  };

  const handleShowMore = () => {
    setShowRelated(true);
    if (relatedProducts.length === 0) {
      loadRelatedProducts();
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <ImagePlaceholder
        source={item.images[0] ? { uri: item.images[0] } : undefined}
        fallbackText={item.name}
        size={160}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')}đ
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.metaText}>Đã bán {item.soldCount}</Text>
          {item.isBestseller && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔥 Hot</Text>
            </View>
          )}
          {item.isNew && (
            <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.badgeText}>Mới</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00B14F" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          {description && <Text style={styles.headerDesc}>{description}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); handleSearch(); }}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sắp xếp theo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sortOptions}>
            {[
              { key: 'newest' as SortOption, label: 'Mới nhất', icon: 'time-outline' },
              { key: 'popular' as SortOption, label: 'Bán chạy', icon: 'trending-up-outline' },
              { key: 'price-low' as SortOption, label: 'Giá thấp', icon: 'arrow-down-outline' },
              { key: 'price-high' as SortOption, label: 'Giá cao', icon: 'arrow-up-outline' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortButton,
                  sortBy === option.key && styles.sortButtonActive,
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={11}
                  color={sortBy === option.key ? '#fff' : '#666'}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === option.key && styles.sortButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Product Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          <Ionicons name="cube-outline" size={16} color="#666" /> {products.length} sản phẩm
        </Text>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00B14F']}
            tintColor="#00B14F"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {search ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
            </Text>
            {search && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => { setSearch(''); handleSearch(); }}
              >
                <Text style={styles.clearSearchText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          products.length > 0 ? (
            <View style={styles.footerContainer}>
              {/* End of current category */}
              <View style={styles.endSection}>
                <View style={styles.dividerLine} />
                <Text style={styles.endText}>Đã xem hết sản phẩm {title}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Related Products Section */}
              <View style={styles.relatedSection}>
                <View style={styles.relatedHeader}>
                  <Ionicons name="apps-outline" size={18} color="#EE4D2D" />
                  <Text style={styles.relatedTitle}>Sản phẩm liên quan</Text>
                </View>
                <Text style={styles.relatedSubtitle}>
                  Có thể bạn cũng thích những sản phẩm này
                </Text>
              </View>

              {/* Show More Button */}
              {!showRelated && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={handleShowMore}
                >
                  <Text style={styles.showMoreText}>Xem thêm sản phẩm</Text>
                  <Ionicons name="chevron-down" size={16} color="#EE4D2D" />
                </TouchableOpacity>
              )}

              {/* Related Products Grid */}
              {showRelated && relatedProducts.length > 0 && (
                <View style={styles.relatedGrid}>
                  {relatedProducts.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.relatedCard}
                      onPress={() => router.push(`/product/${item.id}`)}
                    >
                      <ImagePlaceholder
                        source={item.images[0] ? { uri: item.images[0] } : undefined}
                        fallbackText={item.name}
                        size={100}
                        style={styles.relatedImage}
                      />
                      <View style={styles.relatedInfo}>
                        <Text style={styles.relatedName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.relatedPrice}>
                          {item.price.toLocaleString('vi-VN')}đ
                        </Text>
                        <Text style={styles.relatedMeta}>
                          Đã bán {item.soldCount}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Back to top */}
              {showRelated && (
                <TouchableOpacity
                  style={styles.backToTopButton}
                  onPress={() => {
                    // Scroll to top logic would go here
                    setShowRelated(false);
                  }}
                >
                  <Ionicons name="arrow-up" size={16} color="#666" />
                  <Text style={styles.backToTopText}>Về đầu trang</Text>
                </TouchableOpacity>
              )}

              {/* Footer info */}
              <View style={styles.footerInfo}>
                <Text style={styles.footerInfoText}>Shopee - Nền tảng mua sắm #1</Text>
                <Text style={styles.footerInfoSubtext}>
                  Giao hàng nhanh • Đảm bảo chất lượng • Hoàn tiền 100%
                </Text>
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerDesc: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 8,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 0,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  sortContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  sortButtonActive: {
    backgroundColor: '#00B14F',
    borderColor: '#00B14F',
  },
  sortButtonText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  countText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  listContent: {
    padding: 4,
  },
  row: {
    gap: 4,
    marginBottom: 4,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
    height: 36,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EE4D2D',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: '#bbb',
  },
  badge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#00B14F',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 12,
  },
  endSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  endText: {
    fontSize: 11,
    color: '#999',
    marginHorizontal: 12,
  },
  relatedSection: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderTopWidth: 4,
    borderTopColor: '#f5f5f5',
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  relatedSubtitle: {
    fontSize: 11,
    color: '#888',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EE4D2D',
    gap: 6,
  },
  showMoreText: {
    fontSize: 13,
    color: '#EE4D2D',
    fontWeight: '600',
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 4,
  },
  relatedCard: {
    width: '49%',
    backgroundColor: '#fff',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 4,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 180,
  },
  relatedInfo: {
    padding: 8,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
    height: 36,
    lineHeight: 18,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EE4D2D',
    marginBottom: 2,
  },
  relatedMeta: {
    fontSize: 11,
    color: '#bbb',
  },
  backToTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginHorizontal: 4,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 6,
  },
  backToTopText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  footerInfo: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  footerInfoSubtext: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});
