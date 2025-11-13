import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface Supplier {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  deliveryTime: string;
  minOrder: number;
  distance: string;
  promo?: string;
  verified?: boolean;
}

const SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'Thế Giới Vật Liệu Xây Dựng',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
    rating: 4.9,
    reviews: 1850,
    category: 'Vật liệu tổng hợp',
    deliveryTime: '2-4 giờ',
    minOrder: 500000,
    distance: '3.2 km',
    promo: 'Giảm 10%',
    verified: true
  },
  {
    id: '2',
    name: 'Điện Nước Hoàng Long',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    rating: 4.7,
    reviews: 920,
    category: 'Điện - Nước',
    deliveryTime: '1-3 giờ',
    minOrder: 300000,
    distance: '1.8 km',
    verified: true
  },
  {
    id: '3',
    name: 'Thiết Bị Vệ Sinh Toto',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    rating: 4.8,
    reviews: 1240,
    category: 'Vệ sinh - Bếp',
    deliveryTime: '3-5 giờ',
    minOrder: 800000,
    distance: '4.5 km',
    promo: 'Freeship'
  },
  {
    id: '4',
    name: 'Xi Măng - Gạch Ngói Miền Nam',
    image: 'https://images.unsplash.com/photo-1590642916589-592bca10dfbf?w=400',
    rating: 4.6,
    reviews: 680,
    category: 'Xi măng - Gạch',
    deliveryTime: '4-6 giờ',
    minOrder: 1000000,
    distance: '5.8 km',
    verified: true
  },
  {
    id: '5',
    name: 'Sơn - Bả Dulux Chính Hãng',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    rating: 4.9,
    reviews: 2100,
    category: 'Sơn - Bả',
    deliveryTime: '2-3 giờ',
    minOrder: 400000,
    distance: '2.1 km',
    promo: 'Giảm 15%',
    verified: true
  },
  {
    id: '6',
    name: 'Cửa - Cửa Sổ Nhôm Kính',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400',
    rating: 4.7,
    reviews: 540,
    category: 'Cửa - Khóa',
    deliveryTime: '1 ngày',
    minOrder: 2000000,
    distance: '6.2 km'
  },
];

const CATEGORIES = [
  { id: '1', name: 'Tất cả', icon: 'apps-outline', color: '#00B14F' },
  { id: '2', name: 'Xi măng', icon: 'cube-outline', color: '#757575' },
  { id: '3', name: 'Gạch', icon: 'grid-outline', color: '#D84315' },
  { id: '4', name: 'Điện', icon: 'flash-outline', color: '#FFC107' },
  { id: '5', name: 'Nước', icon: 'water-outline', color: '#2196F3' },
  { id: '6', name: 'Sơn', icon: 'color-palette-outline', color: '#9C27B0' },
  { id: '7', name: 'Cửa', icon: 'lock-closed-outline', color: '#795548' },
  { id: '8', name: 'Vệ sinh', icon: 'medical-outline', color: '#00BCD4' },
];

export default function MaterialsShoppingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSupplierPress = (supplier: Supplier) => {
    router.push({ pathname: '/materials/supplier/[id]', params: { id: supplier.id } });
  };

  const handleCartPress = () => {
    router.push('/shopping/cart');
  };

  const filteredSuppliers = SUPPLIERS.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '1' || supplier.category.includes(CATEGORIES.find(c => c.id === selectedCategory)?.name || '');
    return matchesSearch && matchesCategory;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Mua Sắm Vật Liệu</Text>
          <Text style={styles.headerSubtitle}>Giao hàng nhanh chóng</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={handleCartPress}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>0</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm vật liệu, thiết bị..."
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
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.id ? '#fff' : category.color}
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSupplier = ({ item }: { item: Supplier }) => (
    <TouchableOpacity 
      style={styles.supplierCard}
      onPress={() => handleSupplierPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.supplierImage} />
      
      {item.promo && (
        <View style={styles.promoTag}>
          <Text style={styles.promoText}>{item.promo}</Text>
        </View>
      )}

      {item.verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#00B14F" />
        </View>
      )}

      <View style={styles.supplierInfo}>
        <View style={styles.supplierHeader}>
          <Text style={styles.supplierName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
        </View>

        <Text style={styles.categoryText} numberOfLines={1}>
          {item.category}
        </Text>

        <View style={styles.supplierMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.deliveryTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.minOrderContainer}>
          <Ionicons name="wallet-outline" size={14} color="#00B14F" />
          <Text style={styles.minOrderText}>
            Tối thiểu: {item.minOrder.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {renderHeader()}
        
        <FlatList
          data={filteredSuppliers}
          renderItem={renderSupplier}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderCategories}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy nhà cung cấp</Text>
              <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
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
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00B14F',
    borderColor: '#00B14F',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  supplierCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  supplierImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  promoTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  supplierInfo: {
    padding: 16,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  supplierMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  minOrderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  minOrderText: {
    fontSize: 12,
    color: '#00B14F',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
