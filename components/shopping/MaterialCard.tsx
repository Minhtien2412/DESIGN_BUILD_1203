/**
 * Enhanced Material Card Component
 * Modern card design with image, price, rating, quick actions
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface Material {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  discount?: number;
}

interface MaterialCardProps {
  material: Material;
  onPress?: () => void;
  onAddToCart?: () => void;
  showQuickAdd?: boolean;
}

export function MaterialCard({
  material,
  onPress,
  onAddToCart,
  showQuickAdd = true,
}: MaterialCardProps) {
  const finalPrice = material.discount
    ? material.price * (1 - material.discount / 100)
    : material.price;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {material.image ? (
          <Image source={{ uri: material.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color={Colors.light.textMuted} />
          </View>
        )}
        
        {/* Discount Badge */}
        {material.discount && material.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{material.discount}%</Text>
          </View>
        )}

        {/* Stock Status */}
        {material.inStock === false && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>
          {material.name}
        </Text>

        {/* Category */}
        <Text style={styles.category} numberOfLines={1}>
          {material.category}
        </Text>

        {/* Rating */}
        {material.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#0D9488" />
            <Text style={styles.ratingText}>{material.rating.toFixed(1)}</Text>
            {material.reviews !== undefined && (
              <Text style={styles.reviewsText}>({material.reviews})</Text>
            )}
          </View>
        )}

        {/* Price Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            {material.discount && material.discount > 0 && (
              <Text style={styles.originalPrice}>
                {material.price.toLocaleString('vi-VN')}đ
              </Text>
            )}
            <Text style={styles.price}>
              {finalPrice.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.unit}>/{material.unit}</Text>
          </View>

          {/* Quick Add Button */}
          {showQuickAdd && material.inStock !== false && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart?.();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    height: 38, // 2 lines fixed height
  },
  category: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  reviewsText: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  unit: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
