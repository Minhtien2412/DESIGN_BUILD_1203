import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Equipment category mapping
const CATEGORY_INFO: Record<string, { title: string; icon: string; description: string }> = {
  'kitchen-equipment': {
    title: 'Thiết bị bếp',
    icon: '🍳',
    description: 'Bếp, máy hút mùi, tủ lạnh, lò nướng...'
  },
  'sanitary-equipment': {
    title: 'Thiết bị vệ sinh',
    icon: '🚿',
    description: 'Bồn cầu, vòi sen, chậu rửa, bồn tắm...'
  },
  'electrical': {
    title: 'Thiết bị điện',
    icon: '💡',
    description: 'Ổ cắm, công tắc, đèn LED, quạt...'
  },
  'plumbing': {
    title: 'Thiết bị nước',
    icon: '💧',
    description: 'Máy bơm, bình nóng lạnh, van khóa...'
  },
  'fire-safety': {
    title: 'Thiết bị PCCC',
    icon: '🧯',
    description: 'Bình cứu hỏa, báo cháy, vòi phun...'
  },
  'dining-tables': {
    title: 'Bàn ăn',
    icon: '🍽️',
    description: 'Bàn ăn gỗ, kính, đá marble...'
  },
  'study-desks': {
    title: 'Bàn học',
    icon: '📚',
    description: 'Bàn học sinh, bàn làm việc, ghế...'
  },
  'sofas': {
    title: 'Sofa',
    icon: '🛋️',
    description: 'Sofa da, vải, góc, giường...'
  },
};

// Mock product data - replace with API call
const MOCK_PRODUCTS: Record<string, any[]> = {
  'kitchen-equipment': [
    { id: 1, name: 'Bếp từ 4 vùng nấu', brand: 'Bosch', price: 15900000, image: 'https://via.placeholder.com/200', rating: 4.8, reviews: 124 },
    { id: 2, name: 'Máy hút mùi âm tủ', brand: 'Hafele', price: 8900000, image: 'https://via.placeholder.com/200', rating: 4.6, reviews: 89 },
    { id: 3, name: 'Tủ lạnh 4 cửa', brand: 'Samsung', price: 32900000, image: 'https://via.placeholder.com/200', rating: 4.9, reviews: 256 },
    { id: 4, name: 'Lò nướng âm tủ', brand: 'Electrolux', price: 12500000, image: 'https://via.placeholder.com/200', rating: 4.7, reviews: 142 },
  ],
  'sanitary-equipment': [
    { id: 1, name: 'Bồn cầu thông minh', brand: 'TOTO', price: 18500000, image: 'https://via.placeholder.com/200', rating: 4.9, reviews: 187 },
    { id: 2, name: 'Vòi sen cây', brand: 'Grohe', price: 5900000, image: 'https://via.placeholder.com/200', rating: 4.7, reviews: 95 },
    { id: 3, name: 'Chậu rửa mặt lavabo', brand: 'American Standard', price: 3200000, image: 'https://via.placeholder.com/200', rating: 4.6, reviews: 78 },
    { id: 4, name: 'Bồn tắm massage', brand: 'Caesar', price: 22900000, image: 'https://via.placeholder.com/200', rating: 4.8, reviews: 143 },
  ],
};

export default function ShoppingCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const categoryInfo = CATEGORY_INFO[category] || {
    title: 'Sản phẩm',
    icon: '🛒',
    description: 'Danh sách sản phẩm'
  };

  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [filterBrand, setFilterBrand] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);

  // Get products for this category (mock data for now)
  const products = MOCK_PRODUCTS[category] || [];

  // Extract unique brands
  const brands = Array.from(new Set(products.map(p => p.brand)));

  // Apply filters
  let filteredProducts = products;
  if (filterBrand.length > 0) {
    filteredProducts = filteredProducts.filter(p => filterBrand.includes(p.brand));
  }
  filteredProducts = filteredProducts.filter(
    p => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  // Apply sorting
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleProductPress = (product: any) => {
    try {
      if (product?.id == null) return;
      // Navigate to dynamic product detail route
      router.push(`/shopping/product/${product.id}`);
    } catch (e) {
      console.warn('Navigation error:', e);
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImagePlaceholderText}>📦</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.reviewCount}>({item.reviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: categoryInfo.title,
          headerBackTitle: 'Quay lại',
        }}
      />

      <View style={styles.container}>
        {/* Category Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.iconText}>{categoryInfo.icon}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{categoryInfo.title}</Text>
            <Text style={styles.headerDescription}>{categoryInfo.description}</Text>
          </View>
        </View>

        {/* Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'popular' && styles.filterChipActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.filterChipText, sortBy === 'popular' && styles.filterChipTextActive]}>
              Phổ biến
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'price-asc' && styles.filterChipActive]}
            onPress={() => setSortBy('price-asc')}
          >
            <Ionicons name="arrow-up" size={14} color={sortBy === 'price-asc' ? '#fff' : '#666'} />
            <Text style={[styles.filterChipText, sortBy === 'price-asc' && styles.filterChipTextActive]}>
              Giá
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'price-desc' && styles.filterChipActive]}
            onPress={() => setSortBy('price-desc')}
          >
            <Ionicons name="arrow-down" size={14} color={sortBy === 'price-desc' ? '#fff' : '#666'} />
            <Text style={[styles.filterChipText, sortBy === 'price-desc' && styles.filterChipTextActive]}>
              Giá
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'rating' && styles.filterChipActive]}
            onPress={() => setSortBy('rating')}
          >
            <Ionicons name="star" size={14} color={sortBy === 'rating' ? '#fff' : '#666'} />
            <Text style={[styles.filterChipText, sortBy === 'rating' && styles.filterChipTextActive]}>
              Đánh giá
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="options-outline" size={14} color="#666" />
            <Text style={styles.filterChipText}>Lọc</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Products Grid */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.productRow}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
              <Text style={styles.emptySubtext}>
                Thử thay đổi bộ lọc hoặc tìm kiếm khác
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 32,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 13,
    color: '#666',
  },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#90b44c',
    borderColor: '#90b44c',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  productList: {
    padding: 12,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 48,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  productInfo: {
    padding: 12,
  },
  brandText: {
    fontSize: 11,
    color: '#90b44c',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e74c3c',
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
