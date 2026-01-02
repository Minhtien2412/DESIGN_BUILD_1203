/**
 * Enhanced Materials Catalog
 * Modern shopping experience with filters, search, cart
 * Updated: 30/12/2025 - Sử dụng API thật từ /contract/materials
 */

import { Category, CategoryFilter } from '@/components/shopping/CategoryFilter';
import { Material, MaterialCard } from '@/components/shopping/MaterialCard';
import { SortFilter, SortOption } from '@/components/shopping/SortFilter';
import { Colors } from '@/constants/theme';
import { ContractsService } from '@/services/featureServiceWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data
const MOCK_MATERIALS: Material[] = [
  {
    id: '1',
    name: 'Xi măng PCB40',
    category: 'Xi măng',
    price: 85000,
    unit: 'bao',
    image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400',
    rating: 4.8,
    reviews: 245,
    inStock: true,
    discount: 10,
  },
  {
    id: '2',
    name: 'Gạch ốp lát Viglacera 60x60',
    category: 'Gạch',
    price: 280000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    rating: 4.6,
    reviews: 189,
    inStock: true,
  },
  {
    id: '3',
    name: 'Sơn Dulux ngoại thất',
    category: 'Sơn',
    price: 450000,
    unit: 'thùng',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    rating: 4.9,
    reviews: 312,
    inStock: true,
    discount: 15,
  },
  {
    id: '4',
    name: 'Cát xây dựng',
    category: 'Cát đá',
    price: 320000,
    unit: 'm³',
    image: 'https://images.unsplash.com/photo-1615738270084-e34cf9764c92?w=400',
    rating: 4.5,
    reviews: 98,
    inStock: true,
  },
  {
    id: '5',
    name: 'Thép Hòa Phát D10',
    category: 'Thép',
    price: 18500,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400',
    rating: 4.7,
    reviews: 156,
    inStock: false,
  },
  {
    id: '6',
    name: 'Gỗ thông Chile',
    category: 'Gỗ',
    price: 850000,
    unit: 'm³',
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400',
    rating: 4.8,
    reviews: 203,
    inStock: true,
  },
];

const CATEGORIES: Category[] = [
  { id: 'cement', name: 'Xi măng', icon: 'cube', count: 1 },
  { id: 'tiles', name: 'Gạch', icon: 'grid', count: 1 },
  { id: 'paint', name: 'Sơn', icon: 'color-palette', count: 1 },
  { id: 'sand', name: 'Cát đá', icon: 'analytics', count: 1 },
  { id: 'steel', name: 'Thép', icon: 'barbell', count: 1 },
  { id: 'wood', name: 'Gỗ', icon: 'leaf', count: 1 },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'popular', label: 'Phổ biến', icon: 'flame' },
  { id: 'price-asc', label: 'Giá thấp đến cao', icon: 'arrow-up' },
  { id: 'price-desc', label: 'Giá cao đến thấp', icon: 'arrow-down' },
  { id: 'rating', label: 'Đánh giá cao nhất', icon: 'star' },
  { id: 'newest', label: 'Mới nhất', icon: 'time' },
];

export default function MaterialsEnhancedScreen() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('api');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Load data from API
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const result = await ContractsService.getMaterials();
      if (result.success && result.data) {
        // Transform API data to Material format
        const apiMaterials = Array.isArray(result.data) ? result.data : [];
        const transformedMaterials: Material[] = apiMaterials.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.materialName,
          category: item.category || item.type || 'Khác',
          price: item.price || item.unitPrice || 0,
          unit: item.unit || 'cái',
          image: item.image || item.imageUrl || 'https://via.placeholder.com/300',
          rating: item.rating || 4.5,
          reviews: item.reviewCount || 0,
          inStock: item.inStock !== false,
          discount: item.discount,
        }));
        setMaterials(transformedMaterials);
        setDataSource(result.source === 'api' ? 'api' : 'mock');
      }
    } catch (error) {
      console.error('Error loading materials:', error);
      // Fallback to mock if needed
      setMaterials(MOCK_MATERIALS);
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted materials
  const filteredMaterials = useMemo(() => {
    let result = [...materials];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      const categoryName = CATEGORIES.find((c) => c.id === selectedCategory)?.name;
      if (categoryName) {
        result = result.filter((m) => m.category === categoryName);
      }
    }

    // Sort
    switch (selectedSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        // Would use createdAt in real data
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
    }

    return result;
  }, [materials, searchQuery, selectedCategory, selectedSort]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMaterials();
    setRefreshing(false);
  };

  const handleAddToCart = (material: Material) => {
    Alert.alert('Đã thêm vào giỏ hàng', material.name);
  };

  const handleMaterialPress = (material: Material) => {
    // Navigate to material detail
    console.log('Material detail:', material.id);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Vật liệu xây dựng',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => console.log('Navigate to cart')}
              style={styles.cartButton}
            >
              <Ionicons name="cart-outline" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm vật liệu..."
            placeholderTextColor={Colors.light.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.light.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredMaterials.length} sản phẩm
        </Text>
        {selectedCategory && (
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Materials Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMaterials}
          renderItem={({ item }) => (
            <MaterialCard
              material={item}
              onPress={() => handleMaterialPress(item)}
              onAddToCart={() => handleAddToCart(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={Colors.light.textMuted} />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      )}

      {/* Sort Modal */}
      <SortFilter
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        options={SORT_OPTIONS}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  cartButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  gridContent: {
    padding: 16,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textMuted,
    marginTop: 16,
  },
});
