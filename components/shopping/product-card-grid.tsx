/**
 * Product Card Grid Component - Shopee 2-Column Style
 * Created: 12/12/2025
 * 
 * Features:
 * - 2-column grid layout
 * - Discount badge (top-right)
 * - New badge (top-left)
 * - Favorite button (heart icon)
 * - Rating stars display
 * - Sold count
 * - Price with strikethrough original price
 * - Product image with aspect ratio 1:1
 * 
 * Usage:
 * <ProductCardGrid product={product} onFavorite={handleFavorite} />
 */

import {
    MODERN_COLORS,
    MODERN_DIMENSIONS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from '@/constants/modern-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: any; // require() or { uri: string }
  rating?: number;
  sold?: number;
  isNew?: boolean;
  isFavorite?: boolean;
  category?: string;
}

interface ProductCardGridProps {
  product: Product;
  onFavorite?: (productId: string) => void;
}

export default function ProductCardGrid({ product, onFavorite }: ProductCardGridProps) {
  // Calculate discount percentage
  const discountPercent = product.discount || (product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0);

  // Format sold count (1234 -> 1.2k)
  const formatSold = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/shopping/product/${product.id}`)}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={product.image} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Discount Badge (Top-Right) */}
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}
        
        {/* New Badge (Top-Left) */}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>MỚI</Text>
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent card click
            onFavorite?.(product.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={product.isFavorite ? 'heart' : 'heart-outline'} 
            size={20} 
            color={product.isFavorite ? MODERN_COLORS.favorite : '#FFF'} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {/* Product Name (2 lines max) */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        {/* Rating & Sold Count */}
        {(product.rating || product.sold) && (
          <View style={styles.ratingRow}>
            {product.rating && (
              <>
                <Ionicons name="star" size={12} color={MODERN_COLORS.secondary} />
                <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
              </>
            )}
            {product.sold && (
              <Text style={styles.sold}>
                {product.rating && ' | '}
                Đã bán {formatSold(product.sold)}
              </Text>
            )}
          </View>
        )}
        
        {/* Price Row */}
        <View style={styles.priceRow}>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              ₫{product.originalPrice.toLocaleString('vi-VN')}
            </Text>
          )}
          <Text style={styles.price}>
            ₫{product.price.toLocaleString('vi-VN')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: MODERN_DIMENSIONS.productCardWidth,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    overflow: 'hidden',
    ...MODERN_SHADOWS.sm,
  },
  
  // Image Section
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square image
    backgroundColor: MODERN_COLORS.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Badges
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: MODERN_COLORS.flashSale,
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: MODERN_SPACING.xxs,
    borderBottomLeftRadius: MODERN_RADIUS.md,
  },
  discountText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.textOnPrimary,
  },
  newBadge: {
    position: 'absolute',
    top: MODERN_SPACING.xs,
    left: MODERN_SPACING.xs,
    backgroundColor: MODERN_COLORS.new,
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: MODERN_SPACING.xxs,
    borderRadius: MODERN_RADIUS.sm,
  },
  newText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.textOnPrimary,
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: MODERN_SPACING.xs,
    right: MODERN_SPACING.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content Section
  content: {
    padding: MODERN_SPACING.sm,
    gap: 6,
  },
  name: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.tight,
    color: MODERN_COLORS.text,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular,
    height: MODERN_TYPOGRAPHY.lineHeight.tight * 2, // Exactly 2 lines
  },
  
  // Rating & Sold
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular,
  },
  sold: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textDisabled,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular,
  },
  
  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textDisabled,
    textDecorationLine: 'line-through',
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular,
  },
  price: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.flashSale,
  },
});
