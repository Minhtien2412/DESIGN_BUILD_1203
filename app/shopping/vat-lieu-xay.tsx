import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  rating: number;
  sold: number;
  stock: number;
  brand: string;
  category: string;
  discount?: number;
  badge?: string;
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Xi măng PCB40 bao 50kg',
    price: 95000,
    unit: 'bao',
    image: '🏗️',
    rating: 4.8,
    sold: 2340,
    stock: 500,
    brand: 'Xi măng Hoàng Thạch',
    category: 'Xi măng',
    badge: 'Bán chạy',
  },
  {
    id: 2,
    name: 'Cát xây dựng loại 1',
    price: 180000,
    unit: 'm³',
    image: '⛏️',
    rating: 4.7,
    sold: 1890,
    stock: 100,
    brand: 'Cát Tiến Phát',
    category: 'Cát đá',
  },
  {
    id: 3,
    name: 'Đá 1x2 xây móng',
    price: 320000,
    unit: 'm³',
    image: '🪨',
    rating: 4.6,
    sold: 1560,
    stock: 80,
    brand: 'Đá Tân Long',
    category: 'Cát đá',
  },
  {
    id: 4,
    name: 'Gạch block 8.5x19x39cm',
    price: 3200,
    unit: 'viên',
    image: '🧱',
    rating: 4.9,
    sold: 4560,
    stock: 10000,
    brand: 'Gạch Đồng Tâm',
    category: 'Gạch xây',
    discount: 10,
  },
  {
    id: 5,
    name: 'Sắt thép D10 Pomina',
    price: 16500,
    unit: 'kg',
    image: '🔩',
    rating: 4.8,
    sold: 3210,
    stock: 5000,
    brand: 'Thép Pomina',
    category: 'Sắt thép',
    badge: 'Chính hãng',
  },
  {
    id: 6,
    name: 'Cốt pha gỗ 12mm',
    price: 245000,
    unit: 'tấm',
    image: '📐',
    rating: 4.7,
    sold: 890,
    stock: 200,
    brand: 'Cốt pha Việt Úc',
    category: 'Ván khuôn',
  },
  {
    id: 7,
    name: 'Gạch 4 lỗ 6x9x19cm',
    price: 1800,
    unit: 'viên',
    image: '🧱',
    rating: 4.6,
    sold: 3450,
    stock: 8000,
    brand: 'Gạch Xuân Mai',
    category: 'Gạch xây',
  },
  {
    id: 8,
    name: 'Lưới thép D6 ô 15x15cm',
    price: 85000,
    unit: 'm²',
    image: '🕸️',
    rating: 4.5,
    sold: 1230,
    stock: 300,
    brand: 'Lưới Hòa Phát',
    category: 'Sắt thép',
    discount: 5,
  },
];

const CATEGORIES = ['Tất cả', 'Xi măng', 'Cát đá', 'Gạch xây', 'Sắt thép', 'Ván khuôn'];

export default function BuildingMaterialsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sold'>('default');
  const [showSortModal, setShowSortModal] = useState(false);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Tất cả' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'sold':
        return b.sold - a.sold;
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tất cả');
    setSortBy('default');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vật liệu xây dựng</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm vật liệu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort & Filter Bar */}
        <View style={styles.sortBar}>
          <Text style={styles.resultsCount}>
            {filteredProducts.length} sản phẩm
          </Text>
          <View style={styles.sortActions}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="swap-vertical" size={16} color="#666" />
              <Text style={styles.sortButtonText}>Sắp xếp</Text>
            </TouchableOpacity>
            {(selectedCategory !== 'Tất cả' || searchQuery || sortBy !== 'default') && (
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetButton}>Đặt lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                {product.badge && (
                  <View style={styles.productBadge}>
                    <Text style={styles.productBadgeText}>{product.badge}</Text>
                  </View>
                )}
                {product.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                )}
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>{product.image}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#ffa000" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                    <Text style={styles.soldText}>| Đã bán {product.sold}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.productPrice}>
                        {formatPrice(product.price)}₫
                        <Text style={styles.productUnit}>/{product.unit}</Text>
                      </Text>
                      {product.discount && (
                        <Text style={styles.originalPrice}>
                          {formatPrice(Math.round(product.price / (1 - product.discount / 100)))}₫
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.stockText}>
                    Còn {product.stock} {product.unit}
                  </Text>
                </View>
                <TouchableOpacity style={styles.addToCartButton}>
                  <Ionicons name="cart-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            <TouchableOpacity onPress={resetFilters} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#4caf50" />
          <Text style={styles.infoBannerText}>
            Giao hàng nhanh • Đảm bảo chất lượng
          </Text>
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Sắp xếp theo</Text>
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'default' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('default');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === 'default' && styles.sortOptionTextActive]}>
                Mặc định
              </Text>
              {sortBy === 'default' && <Ionicons name="checkmark" size={20} color={Colors.light.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'sold' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('sold');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === 'sold' && styles.sortOptionTextActive]}>
                Bán chạy nhất
              </Text>
              {sortBy === 'sold' && <Ionicons name="checkmark" size={20} color={Colors.light.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'price-asc' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('price-asc');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === 'price-asc' && styles.sortOptionTextActive]}>
                Giá thấp đến cao
              </Text>
              {sortBy === 'price-asc' && <Ionicons name="checkmark" size={20} color={Colors.light.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortOption, sortBy === 'price-desc' && styles.sortOptionActive]}
              onPress={() => {
                setSortBy('price-desc');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === 'price-desc' && styles.sortOptionTextActive]}>
                Giá cao đến thấp
              </Text>
              {sortBy === 'price-desc' && <Ionicons name="checkmark" size={20} color={Colors.light.primary} />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cartButton: {
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  backgroundColor: Colors.light.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  sortActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  resetButton: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
  backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1,
  },
  productBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffa000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  productImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 48,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
    height: 36,
  },
  productBrand: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  soldText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  color: Colors.light.primary,
  },
  productUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  stockText: {
    fontSize: 11,
    color: '#666',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  backgroundColor: Colors.light.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#33691e',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sortOptionActive: {
    backgroundColor: Colors.light.chipBackground,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#000',
  },
  sortOptionTextActive: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
