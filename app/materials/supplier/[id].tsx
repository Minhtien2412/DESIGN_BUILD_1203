import { useCart } from '@/context/cart-context';
import { Product } from '@/data/products';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Material {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  popular?: boolean;
  discount?: number;
  inStock: boolean;
  minQuantity?: number;
}

interface Supplier {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  category: string;
  address: string;
  distance: string;
  verified: boolean;
}

// Mock data
const MOCK_SUPPLIER: Supplier = {
  id: '1',
  name: 'Thế Giới Vật Liệu Xây Dựng',
  image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
  rating: 4.9,
  deliveryTime: '2-4 giờ',
  deliveryFee: 50000,
  category: 'Vật liệu tổng hợp',
  address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
  distance: '3.2 km',
  verified: true,
};

const MOCK_MATERIALS: Material[] = [
  {
    id: 'm1',
    name: 'Xi Măng Portland PCB40',
    description: 'Xi măng chất lượng cao, độ bền tốt. Bao 50kg',
    price: 110000,
    unit: 'bao',
    image: 'https://images.unsplash.com/photo-1618219941906-0a9f7950ed0e?w=200',
    category: 'Xi Măng',
    popular: true,
    inStock: true,
    minQuantity: 10
  },
  {
    id: 'm2',
    name: 'Gạch Block 10x20x40',
    description: 'Gạch block nhẹ, cách nhiệt tốt, giá rẻ',
    price: 4500,
    unit: 'viên',
    image: 'https://images.unsplash.com/photo-1591452995944-0a2e891a4d9c?w=200',
    category: 'Gạch',
    popular: true,
    inStock: true,
    minQuantity: 100
  },
  {
    id: 'm3',
    name: 'Cát Vàng Xây Dựng',
    description: 'Cát vàng tự nhiên, sạch, độ mịn cao',
    price: 180000,
    unit: 'm³',
    image: 'https://images.unsplash.com/photo-1509006297117-0a6c1e9c0bc7?w=200',
    category: 'Cát - Đá',
    inStock: true,
    minQuantity: 3
  },
  {
    id: 'm4',
    name: 'Đá 1x2 Xây Dựng',
    description: 'Đá dăm 1x2 dùng xây móng, đổ bê tông',
    price: 280000,
    unit: 'm³',
    image: 'https://images.unsplash.com/photo-1602542637316-72a0bc43d8ee?w=200',
    category: 'Cát - Đá',
    inStock: true,
    discount: 10,
    minQuantity: 3
  },
  {
    id: 'm5',
    name: 'Gạch Ốp Lát 60x60',
    description: 'Gạch granite cao cấp, bóng kính',
    price: 85000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=200',
    category: 'Gạch Ốp Lát',
    popular: true,
    inStock: true,
    minQuantity: 20
  },
  {
    id: 'm6',
    name: 'Sắt Thép D10 Việt Nhật',
    description: 'Thép phi 10, chiều dài 11.7m',
    price: 185000,
    unit: 'cây',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=200',
    category: 'Sắt Thép',
    inStock: true,
    minQuantity: 10
  },
  {
    id: 'm7',
    name: 'Sơn Nước Nội Thất Dulux',
    description: 'Sơn nội thất cao cấp, màu trắng, 5L',
    price: 620000,
    unit: 'thùng',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200',
    category: 'Sơn',
    popular: true,
    inStock: true,
    discount: 15
  },
  {
    id: 'm8',
    name: 'Ống Nước Bình Minh D21',
    description: 'Ống nhựa PVC phi 21, dài 4m',
    price: 32000,
    unit: 'cây',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200',
    category: 'Ống Nước',
    inStock: true,
    minQuantity: 10
  },
];

const CATEGORIES = ['Tất cả', 'Xi Măng', 'Gạch', 'Cát - Đá', 'Gạch Ốp Lát', 'Sắt Thép', 'Sơn', 'Ống Nước'];

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [supplier] = useState<Supplier>(MOCK_SUPPLIER);
  const [materials] = useState<Material[]>(MOCK_MATERIALS);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredMaterials = selectedCategory === 'Tất cả'
    ? materials
    : materials.filter(m => m.category === selectedCategory);

  const handleAddToCart = (material: Material) => {
    const quantity = material.minQuantity || 1;
    // Convert material to Product format for cart
    const product: Product = {
      id: material.id,
      name: material.name,
      price: material.price,
      image: material.image,
      description: material.description,
      category: material.category,
      stock: material.inStock ? 999 : 0,
    };
    addToCart(product, quantity);
    Alert.alert('Đã thêm vào giỏ', `${material.name} x${quantity}`);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <View style={styles.fixedHeader}>
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>
          {supplier.name}
        </Animated.Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/shopping/cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSupplierInfo = () => (
    <View style={styles.supplierSection}>
      <Image source={{ uri: supplier.image }} style={styles.supplierImage} />
      <View style={styles.supplierOverlay}>
        <View style={styles.supplierHeader}>
          <View style={styles.supplierTitleRow}>
            <Text style={styles.supplierName}>{supplier.name}</Text>
            {supplier.verified && (
              <Ionicons name="shield-checkmark" size={20} color="#00B14F" />
            )}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#0066CC" />
            <Text style={styles.ratingText}>{supplier.rating}</Text>
          </View>
        </View>
        <View style={styles.supplierMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.metaText}>{supplier.deliveryTime}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.metaText}>{supplier.distance}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMaterial = (material: Material) => {
    const discountPrice = material.discount 
      ? material.price * (1 - material.discount / 100)
      : material.price;

    return (
      <View key={material.id} style={styles.materialCard}>
        <Image source={{ uri: material.image }} style={styles.materialImage} />
        
        <View style={styles.materialInfo}>
          <View style={styles.materialHeader}>
            <View style={styles.materialTitleContainer}>
              <Text style={styles.materialName} numberOfLines={2}>
                {material.name}
              </Text>
              {material.popular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="flame" size={12} color="#0066CC" />
                  <Text style={styles.popularText}>Bán chạy</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.materialDescription} numberOfLines={2}>
            {material.description}
          </Text>

          {material.minQuantity && (
            <Text style={styles.minQuantityText}>
              Tối thiểu: {material.minQuantity} {material.unit}
            </Text>
          )}

          <View style={styles.materialFooter}>
            <View>
              {material.discount && (
                <Text style={styles.originalPrice}>
                  {material.price.toLocaleString('vi-VN')}đ
                </Text>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.materialPrice}>
                  {discountPrice.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.unitText}>/{material.unit}</Text>
                {material.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{material.discount}%</Text>
                  </View>
                )}
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.addButton,
                !material.inStock && styles.addButtonDisabled
              ]}
              onPress={() => handleAddToCart(material)}
              disabled={!material.inStock}
            >
              <Ionicons 
                name={material.inStock ? "add" : "close"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {!material.inStock && (
            <Text style={styles.outOfStockText}>Tạm hết hàng</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderSupplierInfo()}
        {renderCategories()}
        
        <View style={styles.materialsGrid}>
          {filteredMaterials.map(renderMaterial)}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 44,
    height: 88,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  supplierSection: {
    marginTop: 44,
  },
  supplierImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  supplierOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  supplierHeader: {
    marginBottom: 8,
  },
  supplierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  supplierName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  supplierMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  metaText: {
    fontSize: 13,
    color: '#fff',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#00B14F',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  materialsGrid: {
    padding: 16,
    paddingTop: 8,
  },
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  materialImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  materialInfo: {
    flex: 1,
    padding: 12,
  },
  materialHeader: {
    marginBottom: 6,
  },
  materialTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  materialName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0066CC',
  },
  materialDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },
  minQuantityText: {
    fontSize: 11,
    color: '#00B14F',
    marginBottom: 8,
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  materialPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF3B30',
  },
  unitText: {
    fontSize: 12,
    color: '#666',
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00B14F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  outOfStockText: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 4,
  },
});
