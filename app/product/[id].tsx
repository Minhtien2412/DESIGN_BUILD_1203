/**
 * Product Detail Screen
 * Updated: 12/12/2025
 * 
 * Modern product page with real app data integration
 */

import ModernButton from '@/components/ui/modern-button';
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from '@/constants/modern-theme';
import { useCart } from '@/context/cart-context';
import type { Product as MockProduct } from '@/data/products';
import { PRODUCTS } from '@/data/products';
import { productService } from '@/services/api/product.service';
import type { Product } from '@/services/api/types';
import { ProductStatus } from '@/types/products';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [mockProduct, setMockProduct] = useState<MockProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFromApi, setIsFromApi] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid product ID');
      }
      
      // Try API first (if ID is numeric)
      const productId = parseInt(id, 10);
      if (!isNaN(productId)) {
        try {
          console.log('[ProductDetail] Fetching from API, ID:', productId);
          const data = await productService.getProduct(productId);
          setProduct(data);
          setIsFromApi(true);
          console.log('[ProductDetail] ✅ Loaded from API');
          return;
        } catch (apiError) {
          console.log('[ProductDetail] ⚠️ API failed, falling back to mock data');
        }
      }
      
      // Fallback to mock data
      console.log('[ProductDetail] Loading from mock data, ID:', id);
      const mockData = PRODUCTS.find(p => p.id === id);
      if (mockData) {
        setMockProduct(mockData);
        setIsFromApi(false);
        console.log('[ProductDetail] ✅ Loaded from mock data');
      } else {
        throw new Error('Product not found in mock data');
      }
    } catch (error) {
      console.error('[ProductDetail] ❌ Failed to load product:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = useCallback(() => router.back(), []);
  const handleShare = useCallback(() => {
    const displayProduct = product || mockProduct;
    console.log('Share product:', displayProduct?.id);
  }, [product, mockProduct]);
  const handleFavoriteToggle = useCallback(() => setIsFavorite(prev => !prev), []);

  const increaseQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const decreaseQuantity = useCallback(() => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  }, [quantity]);

  const handleAddToCart = useCallback(() => {
    const displayProduct = product || mockProduct;
    if (!displayProduct) return;
    
    // Convert to cart format
    if (isFromApi && product) {
      // From API
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: product.images?.[0] || require('@/assets/images/react-logo.png'),
        description: product.description,
        category: product.category,
      }, quantity);
    } else if (mockProduct) {
      // From mock data
      addToCart({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
        image: mockProduct.image,
        description: mockProduct.description,
        category: mockProduct.category,
      }, quantity);
    }
    
    Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    router.push('/cart');
  }, [product, mockProduct, quantity, addToCart, isFromApi]);

  const handleImageScroll = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setSelectedImageIndex(index);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!product && !mockProduct) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={MODERN_COLORS.textSecondary} />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <ModernButton variant="primary" onPress={handleBack} style={{ marginTop: 16 }}>
          Quay lại
        </ModernButton>
      </View>
    );
  }

  // Use API product if available, otherwise mock product
  const displayProduct = product || mockProduct;
  if (!displayProduct) return null;
  
  const productImage = isFromApi 
    ? (product?.images?.[0] || require('@/assets/images/react-logo.png'))
    : (mockProduct?.image || require('@/assets/images/react-logo.png'));

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.container}>
        <View style={styles.imageGalleryContainer}>
          <Image
            source={typeof productImage === 'string' ? { uri: productImage } : productImage}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          <View style={styles.topActions}>
            <TouchableOpacity onPress={handleBack} style={styles.actionButton}>
              <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.surface} />
            </TouchableOpacity>
            
            <View style={styles.rightActions}>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={24} color={MODERN_COLORS.surface} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleFavoriteToggle} style={styles.actionButton}>
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? MODERN_COLORS.favorite : MODERN_COLORS.surface} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <View style={styles.priceSection}>
              <Text style={styles.price}>₫{displayProduct.price.toLocaleString('vi-VN')}</Text>
            </View>
            
            <Text style={styles.productName}>{displayProduct.name}</Text>
            
            <View style={styles.statsRow}>
              {isFromApi && product?.createdAt && (
                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={16} color={MODERN_COLORS.textSecondary} />
                  <Text style={styles.statText}>
                    {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}
              
              <View style={styles.statItem}>
                <Ionicons 
                  name={isFromApi && product?.status === ProductStatus.APPROVED ? "checkmark-circle" : "checkmark-circle"} 
                  size={16} 
                  color={MODERN_COLORS.primary} 
                />
                <Text style={styles.statText}>
                  {isFromApi && product?.status ? 
                    (product.status === ProductStatus.APPROVED ? 'Có sẵn' : 'Đang xử lý') : 
                    'Có sẵn'
                  }
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton} disabled={quantity <= 1}>
                <Ionicons name="remove" size={20} color={quantity <= 1 ? MODERN_COLORS.textDisabled : MODERN_COLORS.text} />
              </TouchableOpacity>
              
              <Text style={styles.quantityValue}>{quantity}</Text>
              
              <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
                <Ionicons name="add" size={20} color={MODERN_COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {displayProduct.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
              <Text style={styles.description}>{displayProduct.description}</Text>
            </View>
          )}

          {displayProduct.category && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{displayProduct.category}</Text>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']} style={styles.bottomGradient} />
          <View style={styles.bottomContent}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalPrice}>₫{(displayProduct.price * quantity).toLocaleString('vi-VN')}</Text>
            </View>
            
            <ModernButton 
              variant="primary" 
              size="large" 
              onPress={handleAddToCart} 
              icon="cart-outline" 
              iconPosition="left" 
              style={styles.addToCartButton}
            >
              Thêm vào giỏ
            </ModernButton>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MODERN_COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: MODERN_COLORS.background, gap: 12 },
  loadingText: { fontSize: MODERN_TYPOGRAPHY.fontSize.md, color: MODERN_COLORS.textSecondary },
  errorText: { fontSize: MODERN_TYPOGRAPHY.fontSize.md, color: MODERN_COLORS.textSecondary, marginTop: 8 },
  imageGalleryContainer: { position: 'relative', height: SCREEN_WIDTH, backgroundColor: MODERN_COLORS.surface },
  productImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  topActions: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: MODERN_SPACING.md },
  rightActions: { flexDirection: 'row', gap: MODERN_SPACING.sm },
  actionButton: { width: 40, height: 40, borderRadius: MODERN_RADIUS.full, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  contentScroll: { flex: 1 },
  infoCard: { backgroundColor: MODERN_COLORS.surface, padding: MODERN_SPACING.md, marginBottom: MODERN_SPACING.sm },
  priceSection: { marginBottom: MODERN_SPACING.sm },
  price: { fontSize: MODERN_TYPOGRAPHY.fontSize.xxxl, fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold, color: MODERN_COLORS.primary },
  productName: { fontSize: MODERN_TYPOGRAPHY.fontSize.lg, fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold, color: MODERN_COLORS.text, lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal, marginBottom: MODERN_SPACING.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: MODERN_SPACING.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: MODERN_SPACING.xxs },
  statText: { fontSize: MODERN_TYPOGRAPHY.fontSize.sm, fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium, color: MODERN_COLORS.textSecondary },
  section: { backgroundColor: MODERN_COLORS.surface, padding: MODERN_SPACING.md, marginBottom: MODERN_SPACING.sm },
  sectionTitle: { fontSize: MODERN_TYPOGRAPHY.fontSize.md, fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold, color: MODERN_COLORS.text, marginBottom: MODERN_SPACING.sm },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: MODERN_SPACING.md },
  quantityButton: { width: 32, height: 32, borderRadius: MODERN_RADIUS.sm, borderWidth: 1, borderColor: MODERN_COLORS.divider, justifyContent: 'center', alignItems: 'center', backgroundColor: MODERN_COLORS.background },
  quantityValue: { fontSize: MODERN_TYPOGRAPHY.fontSize.md, fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold, color: MODERN_COLORS.text, minWidth: 40, textAlign: 'center' },
  description: { fontSize: MODERN_TYPOGRAPHY.fontSize.md, fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular, color: MODERN_COLORS.textSecondary, lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed },
  categoryBadge: { backgroundColor: `${MODERN_COLORS.primary}10`, paddingHorizontal: MODERN_SPACING.md, paddingVertical: MODERN_SPACING.sm, borderRadius: MODERN_RADIUS.md, alignSelf: 'flex-start' },
  categoryText: { fontSize: MODERN_TYPOGRAPHY.fontSize.sm, fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium, color: MODERN_COLORS.primary },
  bottomSpacing: { height: 100 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' },
  bottomGradient: { position: 'absolute', top: -20, left: 0, right: 0, height: 20 },
  bottomContent: { flexDirection: 'row', alignItems: 'center', gap: MODERN_SPACING.md, paddingHorizontal: MODERN_SPACING.md, paddingVertical: MODERN_SPACING.sm, backgroundColor: MODERN_COLORS.surface, ...MODERN_SHADOWS.lg },
  totalContainer: { flex: 1 },
  totalLabel: { fontSize: MODERN_TYPOGRAPHY.fontSize.xs, fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium, color: MODERN_COLORS.textSecondary },
  totalPrice: { fontSize: MODERN_TYPOGRAPHY.fontSize.xl, fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold, color: MODERN_COLORS.primary },
  addToCartButton: { flex: 1.2 },
});
