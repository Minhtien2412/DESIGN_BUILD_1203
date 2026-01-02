/**
 * Product Detail Screen - Full Featured
 * Features: Image gallery, video, reviews, ratings, like, share, specs
 */

import { MODERN_COLORS, MODERN_SHADOWS, MODERN_SPACING } from '@/constants/modern-theme';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/types/products';
import { ProductCategory, ProductStatus } from '@/types/products';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  MATERIAL: 'Vật liệu',
  TOOL: 'Công cụ',
  EQUIPMENT: 'Thiết bị',
  SERVICE: 'Dịch vụ',
};

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const productId = params.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await getProductById(productId);
      // setProduct(response);
      
      // Mock data for demo
      setProduct({
        id: parseInt(productId),
        name: 'Xi măng Portland PCB40',
        description: 'Xi măng chất lượng cao, phù hợp cho các công trình xây dựng dân dụng và công nghiệp',
        category: 'MATERIAL' as ProductCategory,
        price: 85000,
        unit: 'bao',
        stock: 500,
        sku: 'XM-PCB40-001',
        images: [
          'https://salt.tikicdn.com/cache/750x750/ts/product/e0/7a/29/1e7a29c8c0f2e1f3a2b4c5d6e7f8g9h0.jpg',
          'https://salt.tikicdn.com/cache/750x750/ts/product/07/50/14/a80c6e2c7a5cd67fa36d8e71a1b64c1a.jpg',
          'https://salt.tikicdn.com/cache/750x750/ts/product/91/5d/14/fc5f5e3bb897bbc23a06b8e0c2db7b1c.jpg',
        ],
        specifications: {
          'Xuất xứ': 'Việt Nam',
          'Thương hiệu': 'Holcim',
          'Khối lượng': '50kg/bao',
          'Cường độ': '40 MPa',
          'Tiêu chuẩn': 'TCVN 2682:2009',
        },
        tags: ['Xi măng', 'Vật liệu xây dựng', 'Chất lượng cao'],
        isAvailable: true,
        status: ProductStatus.APPROVED,
        vendorId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[ProductDetail] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem sản phẩm ${product?.name} - ${formatPrice(product?.price || 0)}/${product?.unit}\nhttps://baotienweb.cloud/products/${productId}`,
        title: product?.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Call API to save to favorites
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Convert to data/products format
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      description: product.description,
      category: product.category,
    }, quantity);
    Alert.alert('Thành công', `Đã thêm ${quantity} ${product.unit} vào giỏ hàng`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={MODERN_COLORS.error} />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowImageGallery(true)}
          >
            <Image
              source={{ uri: product.images?.[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
              contentContainerStyle={styles.thumbnailContent}
            >
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Header Actions */}
          <View style={[styles.headerActions, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.headerButton, isLiked && styles.headerButtonLiked]}
                onPress={handleLike}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? '#FF3B30' : '#fff'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {CATEGORY_LABELS[product.category]}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating & Reviews */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= 4 ? '#FFB800' : '#E0E0E0'}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>4.0</Text>
            <Text style={styles.reviewCount}>(128 đánh giá)</Text>
            <Text style={styles.soldCount}>• Đã bán 1.2K</Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>

          {/* Stock */}
          <View style={styles.stockRow}>
            <Ionicons name="cube-outline" size={18} color={MODERN_COLORS.success} />
            <Text style={styles.stockText}>Còn {product.stock} {product.unit}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
            <View style={styles.specsContainer}>
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setReviewsExpanded(!reviewsExpanded)}
            >
              <Text style={styles.sectionTitle}>Đánh giá sản phẩm (128)</Text>
              <Ionicons
                name={reviewsExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={MODERN_COLORS.text}
              />
            </TouchableOpacity>

            {reviewsExpanded && (
              <View style={styles.reviewsContainer}>
                {/* Rating Summary */}
                <View style={styles.ratingSummary}>
                  <View style={styles.overallRating}>
                    <Text style={styles.overallScore}>4.0</Text>
                    <View style={styles.starsLarge}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={20}
                          color={star <= 4 ? '#FFB800' : '#E0E0E0'}
                        />
                      ))}
                    </View>
                    <Text style={styles.totalReviews}>128 đánh giá</Text>
                  </View>

                  <View style={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <View key={star} style={styles.ratingBarRow}>
                        <Text style={styles.starLabel}>{star}★</Text>
                        <View style={styles.barContainer}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: star === 5 ? '60%' : star === 4 ? '30%' : '5%',
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.barCount}>
                          {star === 5 ? 77 : star === 4 ? 38 : 6}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Sample Reviews */}
                <View style={styles.reviewsList}>
                  {[1, 2, 3].map((review) => (
                    <View key={review} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Image
                          source={{ uri: `https://i.pravatar.cc/150?img=${review}` }}
                          style={styles.reviewerAvatar}
                        />
                        <View style={styles.reviewerInfo}>
                          <Text style={styles.reviewerName}>Nguyễn Văn {review}</Text>
                          <View style={styles.reviewStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={star}
                                name="star"
                                size={12}
                                color={star <= 4 ? '#FFB800' : '#E0E0E0'}
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.reviewDate}>2 ngày trước</Text>
                      </View>
                      <Text style={styles.reviewText}>
                        Sản phẩm chất lượng tốt, đúng mô tả. Giao hàng nhanh. Sẽ ủng hộ lần sau.
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Related Products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {[1, 2, 3, 4].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.relatedCard}
                  onPress={() => router.push(`/shopping/product-detail?id=${item}`)}
                >
                  <Image
                    source={{
                      uri: 'https://salt.tikicdn.com/cache/280x280/ts/product/e0/7a/29/1e7a29c8c0f2e1f3a2b4c5d6e7f8g9h0.jpg',
                    }}
                    style={styles.relatedImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.relatedName} numberOfLines={2}>
                    Sản phẩm liên quan {item}
                  </Text>
                  <Text style={styles.relatedPrice}>₫85.000</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={MODERN_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={MODERN_COLORS.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyNowButton} activeOpacity={0.8}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Image Gallery Modal */}
      <Modal
        visible={showImageGallery}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageGallery(false)}
      >
        <View style={styles.galleryModal}>
          <TouchableOpacity
            style={styles.galleryClose}
            onPress={() => setShowImageGallery(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.images?.map((img, index) => (
              <View key={index} style={styles.gallerySlide}>
                <Image
                  source={{ uri: img }}
                  style={styles.galleryImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.galleryIndicator}>
            <Text style={styles.galleryIndicatorText}>
              {selectedImageIndex + 1} / {product.images?.length || 0}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
    padding: MODERN_SPACING.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
  },
  backButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width,
    height: width,
    backgroundColor: '#f0f0f0',
  },
  thumbnailScroll: {
    backgroundColor: '#fff',
    paddingVertical: MODERN_SPACING.sm,
  },
  thumbnailContent: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.xs,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: MODERN_COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonLiked: {
    backgroundColor: 'rgba(255,59,48,0.2)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: MODERN_SPACING.xs,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 80,
    left: MODERN_SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: MODERN_SPACING.lg,
    paddingHorizontal: MODERN_SPACING.md,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: MODERN_COLORS.text,
    lineHeight: 30,
    marginBottom: MODERN_SPACING.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.md,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginRight: MODERN_SPACING.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginRight: MODERN_SPACING.xs,
  },
  reviewCount: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  soldCount: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    marginLeft: MODERN_SPACING.xs,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: MODERN_SPACING.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: MODERN_COLORS.primary,
  },
  unit: {
    fontSize: 16,
    color: MODERN_COLORS.textSecondary,
    marginLeft: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: MODERN_SPACING.lg,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    color: MODERN_COLORS.success,
  },
  section: {
    marginBottom: MODERN_SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: MODERN_COLORS.textSecondary,
  },
  specsContainer: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: 12,
    padding: MODERN_SPACING.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  specKey: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MODERN_SPACING.xs,
  },
  tag: {
    backgroundColor: MODERN_COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: MODERN_COLORS.primary,
    fontWeight: '600',
  },
  reviewsContainer: {
    marginTop: MODERN_SPACING.md,
  },
  ratingSummary: {
    flexDirection: 'row',
    backgroundColor: MODERN_COLORS.background,
    borderRadius: 12,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
  },
  overallRating: {
    alignItems: 'center',
    marginRight: MODERN_SPACING.lg,
  },
  overallScore: {
    fontSize: 36,
    fontWeight: '700',
    color: MODERN_COLORS.text,
  },
  starsLarge: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: MODERN_SPACING.xs,
  },
  totalReviews: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  ratingBars: {
    flex: 1,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    width: 30,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: MODERN_SPACING.xs,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  barCount: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  reviewsList: {
    gap: MODERN_SPACING.md,
  },
  reviewItem: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: 12,
    padding: MODERN_SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: MODERN_SPACING.sm,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: MODERN_COLORS.textSecondary,
  },
  relatedScroll: {
    paddingVertical: MODERN_SPACING.xs,
    gap: MODERN_SPACING.sm,
  },
  relatedCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...MODERN_SHADOWS.sm,
  },
  relatedImage: {
    width: '100%',
    height: 140,
    backgroundColor: MODERN_COLORS.background,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    padding: MODERN_SPACING.sm,
    lineHeight: 18,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingBottom: MODERN_SPACING.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    flexDirection: 'row',
    gap: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: MODERN_COLORS.success,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  galleryModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  galleryClose: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gallerySlide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width,
    height: width,
  },
  galleryIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  galleryIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});
