import { useCart } from '@/context/cart-context';
import type { Product as StoreProduct } from '@/data/products';
import { productService } from '@/services/api/product.service';
import { ProductStatus, type Product as ApiProduct } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
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
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  sold: number;
  discount?: number;
  inStock?: boolean;
  colors?: string[];
  badges?: string[];
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'apps' as const },
  { id: 'kitchen', name: 'Bếp', icon: 'restaurant' as const },
  { id: 'bathroom', name: 'Vệ sinh', icon: 'water' as const },
  { id: 'electric', name: 'Điện', icon: 'flash' as const },
  { id: 'water', name: 'Nước', icon: 'rainy' as const },
  { id: 'furniture', name: 'Nội thất', icon: 'bed' as const },
  { id: 'safety', name: 'PCCC', icon: 'shield-checkmark' as const },
];

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bếp từ đôi Canzy',
    category: 'kitchen',
    brand: 'Canzy',
    price: 4500000,
    oldPrice: 6000000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/6d/7e/26/be6d4c5e0e45208805ddbd2f8f2b2a9e.jpg',
    rating: 4.8,
    sold: 350,
    discount: 25,
    inStock: true,
    colors: ['#111', '#555'],
    badges: ['Bán chạy'],
  },
  {
    id: '2',
    name: 'Máy hút mùi Taka',
    category: 'kitchen',
    brand: 'Taka',
    price: 2800000,
    oldPrice: 3500000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/91/5d/14/fc5f5e3bb897bbc23a06b8e0c2db7b1c.jpg',
    rating: 4.6,
    sold: 280,
    discount: 20,
    inStock: true,
    colors: ['#333'],
  },
  {
    id: '3',
    name: 'Chậu rửa Inox 304',
    category: 'kitchen',
    brand: 'Sơn Hà',
    price: 1200000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/07/50/14/a80c6e2c7a5cd67fa36d8e71a1b64c1a.jpg',
    rating: 4.7,
    sold: 520,
    inStock: true,
  },
  {
    id: '4',
    name: 'Bồn cầu Toto',
    category: 'bathroom',
    brand: 'Toto',
    price: 12500000,
    oldPrice: 15000000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/c8/6e/dc/6f8be75d8bedc1eada80dde0da5c9cf1.jpg',
    rating: 4.9,
    sold: 180,
    discount: 17,
    inStock: true,
    badges: ['Free lắp đặt'],
  },
  {
    id: '5',
    name: 'Sen tắm cây Inax',
    category: 'bathroom',
    brand: 'Inax',
    price: 3500000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/88/7f/e6/c9e8f09e4bc3d7c1acec77c7e65b3e41.jpg',
    rating: 4.5,
    sold: 420,
    inStock: true,
  },
  {
    id: '6',
    name: 'Lavabo American',
    category: 'bathroom',
    brand: 'American',
    price: 2800000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/3c/22/e1/eb1f5fc0c54f14d10cf34c72e4f2f837.jpg',
    rating: 4.6,
    sold: 310,
    inStock: true,
  },
  {
    id: '7',
    name: 'Ổ cắm Schneider',
    category: 'electric',
    brand: 'Schneider',
    price: 250000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/f4/17/3e/6e6e1e26a0c6b1f8a6f0dcf0b0e2a8a4.jpg',
    rating: 4.8,
    sold: 1200,
    inStock: true,
  },
  {
    id: '8',
    name: 'Đèn LED Rạng Đông',
    category: 'electric',
    brand: 'Rạng Đông',
    price: 85000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/e0/7a/29/1e7a29c8c0f2e1f3a2b4c5d6e7f8g9h0.jpg',
    rating: 4.4,
    sold: 2500,
    inStock: true,
    colors: ['#fff', '#ffea00', '#f2f2f2'],
  },
  {
    id: '9',
    name: 'Máy bơm Panasonic',
    category: 'water',
    brand: 'Panasonic',
    price: 2400000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/a1/b2/c3/d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9.jpg',
    rating: 4.6,
    sold: 380,
    inStock: true,
  },
  {
    id: '10',
    name: 'Bồn nước Inox 500L',
    category: 'water',
    brand: 'Sơn Hà',
    price: 3200000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/t1/u2/v3/w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9.jpg',
    rating: 4.5,
    sold: 220,
    inStock: false,
    badges: ['Hết hàng tạm thời'],
  },
  {
    id: '11',
    name: 'Tủ bếp Acrylic',
    category: 'furniture',
    brand: 'Acado',
    price: 25000000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/m1/n2/o3/p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9.jpg',
    rating: 4.8,
    sold: 85,
    inStock: true,
    colors: ['#ffffff', '#8b5e3c', '#000000'],
  },
  {
    id: '12',
    name: 'Sofa da thật',
    category: 'furniture',
    brand: 'Nhà Xinh',
    price: 18000000,
    oldPrice: 22000000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/f1/g2/h3/i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9.jpg',
    rating: 4.7,
    sold: 120,
    discount: 18,
    inStock: true,
    colors: ['#7f5539', '#000', '#c9ada7'],
  },
  {
    id: '13',
    name: 'Bình PCCC MFZ4',
    category: 'safety',
    brand: 'Việt Nam',
    price: 450000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/y1/z2/a3/b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9.jpg',
    rating: 4.7,
    sold: 650,
    inStock: true,
  },
  {
    id: '14',
    name: 'Sprinkler Viking',
    category: 'safety',
    brand: 'Viking',
    price: 320000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/r1/s2/t3/u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9.jpg',
    rating: 4.8,
    sold: 420,
    inStock: true,
  },
  {
    id: '15',
    name: 'CB chống giật 2P 20A',
    category: 'electric',
    brand: 'LS',
    price: 185000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/ls/cb/mcb20a.jpg',
    rating: 4.5,
    sold: 980,
    inStock: true,
    badges: ['Ưu đãi'],
  },
  {
    id: '16',
    name: 'Máy lọc nước RO 8 lõi',
    category: 'water',
    brand: 'Karofi',
    price: 4300000,
    oldPrice: 5200000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/ka/ro/ro8.jpg',
    rating: 4.6,
    sold: 410,
    discount: 17,
    inStock: true,
  },
  {
    id: '17',
    name: 'Bàn ăn 6 ghế gỗ sồi',
    category: 'furniture',
    brand: 'An Cường',
    price: 12500000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/an/cuong/ban-an.jpg',
    rating: 4.4,
    sold: 150,
    inStock: true,
    colors: ['#d4a373', '#8d5524'],
  },
  {
    id: '18',
    name: 'Gương đèn LED cảm ứng',
    category: 'bathroom',
    brand: 'Navado',
    price: 2150000,
    image: 'https://salt.tikicdn.com/cache/280x280/ts/product/nav/ado/guong-led.jpg',
    rating: 4.7,
    sold: 275,
    inStock: true,
    badges: ['Mẫu trưng bày'],
  },
];

const SORTS = [
  { id: 'popular', label: 'Bán chạy' },
  { id: 'priceLow', label: 'Giá thấp' },
  { id: 'priceHigh', label: 'Giá cao' },
  { id: 'rating', label: 'Đánh giá' },
];

const formatK = (n: number) => `${(n / 1000).toFixed(0)}K`;

function ColorDots({ colors }: { colors?: string[] }) {
  if (!colors || colors.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
      {colors.slice(0, 4).map((c) => (
        <View
          key={c}
          style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c, borderWidth: 1, borderColor: '#eee' }}
        />
      ))}
    </View>
  );
}

function StockPill({ inStock }: { inStock?: boolean }) {
  if (inStock === undefined) return null;
  return (
    <View style={{
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: inStock ? '#e8f7e9' : '#ffe8e6',
      marginTop: 6,
    }}>
      <Text style={{ fontSize: 11, color: inStock ? '#2f8f3d' : '#b3261e' }}>
        {inStock ? 'Còn hàng' : 'Tạm hết hàng'}
      </Text>
    </View>
  );
}

function BadgeTag({ text }: { text: string }) {
  return (
    <View style={{ backgroundColor: '#fff0e8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 6 }}>
      <Text style={{ fontSize: 11, color: '#0066CC' }}>{text}</Text>
    </View>
  );
}

export default function ProductsCatalogScreen() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'priceLow' | 'priceHigh' | 'rating'>('popular');
  const [onlyStock, setOnlyStock] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  // API Integration
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('[ProductsCatalog] 📦 Fetching products from API...');
      const response = await productService.getProducts({
        status: ProductStatus.APPROVED, // Only show approved products
        limit: 100,
      });
      
      // Ensure we always set an array
      const productData = Array.isArray(response.data) ? response.data : [];
      setProducts(productData);
      console.log(`[ProductsCatalog] ✅ Loaded ${productData.length} products`);
    } catch (err: any) {
      console.error('[ProductsCatalog] ❌ Failed to load products:', err);
      setError(err.message || 'Không thể tải sản phẩm');
      setProducts([]); // Reset to empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadProducts(true);
  };

  // Convert API product to display product
  const toDisplayProduct = (apiProduct: ApiProduct): Product => ({
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    category: apiProduct.category.toLowerCase(),
    brand: apiProduct.seller?.name || 'Unknown',
    price: apiProduct.price,
    image: apiProduct.images[0] || 'https://via.placeholder.com/280',
    rating: 4.5, // Default rating (can be enhanced later)
    sold: apiProduct.soldCount,
    inStock: apiProduct.stock > 0,
    badges: [
      apiProduct.isBestseller && 'Bán chạy',
      apiProduct.isNew && 'Mới',
      apiProduct.stock === 0 && 'Hết hàng',
    ].filter(Boolean) as string[],
  });

  // Filter and sort products (with safety check)
  const displayProducts = Array.isArray(products) ? products.map(toDisplayProduct) : [];

  const filteredProducts = displayProducts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (onlyStock && !p.inStock) return false;
    if (onlyDiscount && !p.discount) return false;
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    if (minRating !== undefined && p.rating < minRating) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return b.sold - a.sold; // popular
    }
  });

  const toStoreProduct = (p: Product): StoreProduct => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image as any,
    category: p.category,
    brand: p.brand,
    rating: p.rating,
    sold: p.sold,
  });

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => router.push('/shopping/products-catalog')}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setFavorites((f) => ({ ...f, [item.id]: !f[item.id] }))}
        style={styles.favBtn}
        activeOpacity={0.7}
      >
        <Ionicons name={favorites[item.id] ? 'heart' : 'heart-outline'} size={18} color={favorites[item.id] ? '#0066CC' : '#fff'} />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#ffa500" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.soldText}>Đã bán {item.sold}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatK(item.price)}</Text>
          {item.oldPrice && (
            <Text style={styles.oldPrice}>{formatK(item.oldPrice)}</Text>
          )}
        </View>

        <ColorDots colors={item.colors} />
        <StockPill inStock={item.inStock} />

        {item.badges && item.badges.length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            {item.badges.slice(0, 2).map((t) => (
              <BadgeTag key={t} text={t} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.cardFooter}> 
        <TouchableOpacity
          disabled={item.inStock === false}
          style={[styles.addBtn, item.inStock === false && styles.addBtnDisabled]}
          activeOpacity={0.8}
          onPress={() => addToCart(toStoreProduct(item), 1)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addText}>Thêm</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, title: 'Thư Viện Thiết Bị' }} />
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0066CC', '#3399FF']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thư Viện Thiết Bị</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/shopping/cart')}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={20}
                color={selectedCategory === cat.id ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort & Count */}
      <View style={styles.sortSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sortChip, sortBy === (s.id as any) && styles.sortChipActive]}
              onPress={() => setSortBy(s.id as any)}
            >
              <Text style={[styles.sortText, sortBy === (s.id as any) && styles.sortTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setOnlyStock((v) => !v)}
            style={[styles.sortChip, onlyStock && styles.sortChipActive]}
          >
            <Text style={[styles.sortText, onlyStock && styles.sortTextActive]}>Còn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOnlyDiscount((v) => !v)}
            style={[styles.sortChip, onlyDiscount && styles.sortChipActive]}
          >
            <Text style={[styles.sortText, onlyDiscount && styles.sortTextActive]}>Có giảm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilter(true)}
            style={[styles.sortChip, showFilter && styles.sortChipActive]}
          >
            <Ionicons name="filter" size={16} color={showFilter ? '#0066CC' : '#666'} />
            <Text style={[styles.sortText, showFilter && styles.sortTextActive]}>Lọc</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Products Count */}
      <View style={styles.countSection}>
        <Text style={styles.countText}>
          {sortedProducts.length} sản phẩm
        </Text>
      </View>

      {/* Loading State */}
      {loading && products.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      )}

      {/* Error State */}
      {error && products.length === 0 && !loading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#0066CC" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadProducts()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
        </View>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <FlatList
          data={sortedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0066CC']} />
          }
        />
      )}
      {showFilter && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.filterHeaderRow}>
              <Text style={styles.filterTitle}>Bộ lọc nâng cao</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)} style={styles.closeFilterBtn}>
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterBody}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Tìm kiếm</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="search" size={16} color="#888" />
                  <Text style={styles.inputPlaceholder}>{searchQuery || 'Nhập tên sản phẩm...'}</Text>
                </View>
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Giá tối thiểu (K)</Text>
                <View style={styles.sliderStub}><Text style={styles.sliderText}>{minPrice ? (minPrice/1000).toFixed(0) : '—'}</Text></View>
                <Text style={styles.filterLabel}>Giá tối đa (K)</Text>
                <View style={styles.sliderStub}><Text style={styles.sliderText}>{maxPrice ? (maxPrice/1000).toFixed(0) : '—'}</Text></View>
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Đánh giá tối thiểu</Text>
                <View style={styles.sliderStub}><Text style={styles.sliderText}>{minRating ?? '—'}</Text></View>
              </View>
              <View style={styles.filterGroupRow}>
                <TouchableOpacity onPress={() => setOnlyDiscount((v)=>!v)} style={[styles.toggleBtn, onlyDiscount && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleText, onlyDiscount && styles.toggleTextActive]}>Chỉ giảm giá</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOnlyStock((v)=>!v)} style={[styles.toggleBtn, onlyStock && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleText, onlyStock && styles.toggleTextActive]}>Chỉ còn hàng</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.filterFooter}>
              <TouchableOpacity
                onPress={() => { setMinPrice(undefined); setMaxPrice(undefined); setMinRating(undefined); setOnlyDiscount(false); setOnlyStock(false); setSearchQuery(''); }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetText}>Thiết lập lại</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilter(false)} style={styles.applyBtn}>
                <Text style={styles.applyText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  cartBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  countSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  sortSection: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#f6f6f6',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  sortChipActive: {
    backgroundColor: '#fff0e8',
    borderColor: '#0066CC',
  },
  sortText: {
    fontSize: 13,
    color: '#666',
  },
  sortTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  productsList: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: '#f8f8f8',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#ffcc00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0066CC',
  },
  productInfo: {
    padding: 12,
  },
  brandText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    height: 40,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginRight: 8,
  },
  soldText: {
    fontSize: 11,
    color: '#999',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066CC',
  },
  oldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cardFooter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0066CC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtnDisabled: {
    backgroundColor: '#d6d6d6',
  },
  addText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeFilterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  filterBody: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  filterGroup: {
    width: '100%',
  },
  filterGroupRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  inputPlaceholder: {
    fontSize: 13,
    color: '#888',
  },
  sliderStub: {
    height: 40,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sliderText: {
    fontSize: 13,
    color: '#555',
  },
  toggleBtn: {
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e4',
  },
  toggleBtnActive: {
    backgroundColor: '#fff0e8',
    borderColor: '#0066CC',
  },
  toggleText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  filterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  // Loading, Error, Empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
  },
});
