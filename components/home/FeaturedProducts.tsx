/**
 * Featured Products - Horizontal Carousel
 * Modern Western design with smooth scrolling
 * Auto-fetches from backend with local fallback
 */

import { ProductCard } from '@/components/ui/product-card';
import { PRODUCTS, SELLERS, type Product } from '@/data/products';
import { productService } from '@/services/api/product.service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

// Fallback local products with placeholder images and seller info
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'sample1',
    name: 'Thiết Kế Nội Thất Phòng Khách Cao Cấp',
    price: 0,
    priceType: 'contact',
    image: require('@/assets/images/react-logo.webp'),
    description: 'Thiết kế phòng khách hiện đại sang trọng, tư vấn và thi công trọn gói',
    category: 'interior',
    brand: 'Nhà Xinh Design',
    type: 'Thiết kế nội thất',
    seller: SELLERS[0],
    soldCount: 15,
    location: 'TP. Hồ Chí Minh',
  },
  {
    id: 'sample2',
    name: 'Biệt Thự Hiện Đại Cao Cấp',
    price: 450000000,
    priceType: 'fixed',
    image: require('@/assets/images/react-logo.webp'),
    description: 'Thiết kế biệt thự hiện đại sang trọng',
    category: 'villa',
    brand: 'Nhà Xinh Design',
    type: 'Biệt thự hiện đại',
    discountPercent: 10,
    flashSale: true,
    stock: 3,
    seller: SELLERS[2],
    soldCount: 2,
    location: 'Quận 7, TP.HCM',
  },
  {
    id: 'sample3',
    name: 'Gói Thiết Kế Nội Thất Phòng Ngủ Master',
    price: 0,
    priceType: 'contact',
    image: require('@/assets/images/react-logo.webp'),
    description: 'Thiết kế phòng ngủ master lãng mạn, ấm cúng với vật liệu cao cấp',
    category: 'interior',
    brand: 'Interior Design Pro',
    type: 'Thiết kế nội thất',
    seller: SELLERS[1],
    soldCount: 8,
    location: 'TP. Hồ Chí Minh',
  },
];

const FEATURED = PRODUCTS.filter(p => p.flashSale || (p.discountPercent && p.discountPercent > 0)).slice(0, 8);

export function FeaturedProducts() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [products, setProducts] = useState<Product[]>(FEATURED.length > 0 ? FEATURED : FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[FeaturedProducts] 🔄 Fetching from backend...');
      
      const response = await productService.getProducts({
        status: 'APPROVED',
        limit: 8,
      });

      if (response.data && response.data.length > 0) {
        console.log(`[FeaturedProducts] ✅ Loaded ${response.data.length} products from backend`);
        
        // Map backend products to local format
        const mappedProducts: Product[] = response.data.map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Sản phẩm',
          price: p.price || 0,
          image: p.images?.[0] 
            ? { uri: p.images[0] }
            : require('@/assets/images/react-logo.webp'),
          description: p.description || '',
          category: p.category || '',
          brand: p.brand || '',
          type: p.type || '',
          discountPercent: p.discountPercent || 0,
          flashSale: p.flashSale || false,
          stock: p.stock || 0,
        }));
        
        setProducts(mappedProducts);
      } else {
        throw new Error('Backend returned no products');
      }
    } catch (err: any) {
      console.warn('[FeaturedProducts] ⚠️ Backend error, using fallback:', err.message);
      setError(err.message);
      
      // Use local PRODUCTS or FALLBACK
      const localProducts = FEATURED.length > 0 ? FEATURED : FALLBACK_PRODUCTS;
      console.log(`[FeaturedProducts] 📦 Using ${localProducts.length} local products`);
      setProducts(localProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Always ensure we have products to display
  const displayProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flame" size={24} color="#10B981" />
          <Text style={styles.title}>Featured Deals</Text>
          {error && <Text style={styles.errorBadge}>Offline</Text>}
        </View>
        <Pressable 
          onPress={() => router.push('/shopping/index' as any)}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color="#0A6847" />
        </Pressable>
      </View>

      {/* Products Carousel */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A6847" />
        </View>
      ) : (
        <Animated.FlatList
          horizontal
          data={displayProducts}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={182}
          decelerationRate="fast"
          pagingEnabled={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard product={item} variant="horizontal" />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  errorBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B6B',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A6847',
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
  },
  cardWrapper: {
    width: 170,
    marginRight: 12,
  },
});
