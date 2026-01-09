import { ThemedText } from '@/components/themed-text';
import { Product } from '@/data/products';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

export function formatPrice(value: number) {
  try {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  } catch {
    return value + ' ₫';
  }
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (p: Product) => void;
  variant?: 'grid' | 'horizontal';
}

export function ProductCard({ product, onAddToCart, variant = 'grid' }: ProductCardProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const chipText = useThemeColor({}, 'chipText');
  const textMuted = useThemeColor({}, 'textMuted');
  const text = useThemeColor({}, 'text');
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [heartAnim] = useState(new Animated.Value(0));
  
  const isContactPrice = product.priceType === 'contact';
  const hasDiscount = !isContactPrice && typeof product.discountPercent === 'number' && product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - (product.discountPercent ?? 0) / 100))
    : product.price;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const heartScale = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  
  return (
    <Animated.View 
      style={[
        variant === 'grid' ? styles.cardGrid : styles.cardHorizontal, 
        { 
          backgroundColor: surface, 
          borderColor: border,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Link href={`/product/${product.id}` as any} asChild>
        <Pressable 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.imageContainer}
        >
          <Image 
            source={product.image} 
            style={styles.image} 
            contentFit="cover"
            transition={300}
            placeholder={require('@/assets/images/react-logo.webp')}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
            onError={(error) => {
              console.log('[ProductCard] Image load failed:', product.id, error);
            }}
          />
          
          {/* Gradient Overlay - Modern depth */}
          <View style={styles.gradientOverlay} />
          
          {/* Top badges row */}
          <View style={styles.badgesRow}>
            {hasDiscount && (
              <BlurView intensity={80} tint="dark" style={styles.discountBadge}>
                <ThemedText style={styles.discountText}>-{product.discountPercent}%</ThemedText>
              </BlurView>
            )}
            {product.flashSale && (
              <View style={[styles.flashTag, { backgroundColor: '#0066CC' }]}>
                <Ionicons name="flash" size={10} color="#FFF" />
                <ThemedText style={styles.flashText}>HOT</ThemedText>
              </View>
            )}
          </View>
          
          {/* Wishlist button - Top right */}
          <Pressable 
            style={styles.wishlistBtn}
            onPress={toggleWishlist}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BlurView intensity={80} tint="light" style={styles.wishlistBlur}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons 
                  name={isWishlisted ? "heart" : "heart-outline"} 
                  size={18} 
                  color={isWishlisted ? "#0066CC" : text}
                />
              </Animated.View>
            </BlurView>
          </Pressable>
          
          {/* Quick view button - Bottom */}
          <View style={styles.quickViewContainer}>
            <BlurView intensity={90} tint="light" style={styles.quickViewBtn}>
              <Ionicons name="eye-outline" size={16} color={text} />
              <ThemedText style={[styles.quickViewText, { color: text }]}>Quick View</ThemedText>
            </BlurView>
          </View>
        </Pressable>
      </Link>
      
      {/* Product info */}
      <View style={styles.infoContainer}>
        {product.brand && (
          <ThemedText style={[styles.brand, { color: textMuted }]}>{product.brand}</ThemedText>
        )}
        <ThemedText numberOfLines={2} style={[styles.title, { color: text }]}>
          {product.name}
        </ThemedText>
        
        {/* Seller info - Shopee style */}
        {product.seller && (
          <View style={styles.sellerRow}>
            {product.seller.logo && (
              <Image 
                source={product.seller.logo} 
                style={styles.sellerLogo}
                contentFit="cover"
              />
            )}
            <ThemedText style={[styles.sellerName, { color: textMuted }]} numberOfLines={1}>
              {product.seller.name}
            </ThemedText>
            {product.seller.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#0066CC" />
            )}
          </View>
        )}
        
        {/* Price or Contact */}
        <View style={styles.priceRow}>
          {isContactPrice ? (
            <View style={[styles.contactBadge, { backgroundColor: '#FFF5E6', borderColor: '#FFB800' }]}>
              <Ionicons name="call-outline" size={14} color="#FFB800" />
              <ThemedText style={[styles.contactText, { color: '#CC9200' }]}>
                Liên hệ
              </ThemedText>
            </View>
          ) : (
            <View style={styles.priceWrap}>
              <ThemedText type="defaultSemiBold" style={[styles.price, { color: primary }]}>
                {formatPrice(finalPrice)}
              </ThemedText>
              {hasDiscount && (
                <ThemedText style={[styles.oldPrice, { color: textMuted }]}>
                  {formatPrice(product.price)}
                </ThemedText>
              )}
            </View>
          )}
          
          {/* Rating stars */}
          {product.seller?.rating && (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <ThemedText style={[styles.ratingText, { color: textMuted }]}>
                {product.seller.rating.toFixed(1)}
              </ThemedText>
            </View>
          )}
        </View>
        
        {/* Sold count & Location */}
        {(product.soldCount || product.location) && (
          <View style={styles.metaRow}>
            {product.soldCount && (
              <ThemedText style={[styles.metaText, { color: textMuted }]}>
                Đã bán {product.soldCount}
              </ThemedText>
            )}
            {product.soldCount && product.location && (
              <ThemedText style={[styles.metaText, { color: textMuted }]}> • </ThemedText>
            )}
            {product.location && (
              <ThemedText style={[styles.metaText, { color: textMuted }]} numberOfLines={1}>
                {product.location}
              </ThemedText>
            )}
          </View>
        )}
        
        {/* Add to cart button or Contact button */}
        {isContactPrice ? (
          <Pressable 
            style={[styles.contactBtn, { borderColor: primary }]} 
            onPress={() => console.log('Contact seller:', product.seller?.name)}
            android_ripple={{ color: 'rgba(10,104,71,0.1)' }}
          >
            <Ionicons name="chatbubble-outline" size={16} color={primary} />
            <ThemedText style={[styles.contactBtnText, { color: primary }]}>Chat ngay</ThemedText>
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.addBtn, { backgroundColor: primary }]} 
            onPress={() => onAddToCart?.(product)}
            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <Ionicons name="cart-outline" size={16} color="#FFF" />
            <ThemedText style={styles.addBtnText}>Add to Cart</ThemedText>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardGrid: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHorizontal: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  badgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  flashTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flashText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  wishlistBlur: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  quickViewContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    opacity: 0.95,
  },
  quickViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  quickViewText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  infoContainer: {
    padding: 12,
    gap: 6,
  },
  brand: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  // Seller info styles
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sellerLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  // Contact price styles
  contactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  contactText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  contactBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#FFF',
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Meta info (sold count, location)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
