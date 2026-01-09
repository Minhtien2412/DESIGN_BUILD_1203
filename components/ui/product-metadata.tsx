/**
 * ProductMetadata Component
 * Hiển thị metadata chi tiết của sản phẩm: rating, reviews, sold, badges
 */

import type { Product } from '@/data/products';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface ProductMetadataProps {
  product: Product;
  layout?: 'horizontal' | 'vertical';
  showAll?: boolean;
}

export function ProductMetadata({ 
  product, 
  layout = 'horizontal',
  showAll = true 
}: ProductMetadataProps) {
  const isVertical = layout === 'vertical';

  return (
    <View style={[styles.container, isVertical && styles.vertical]}>
      {/* Badges */}
      <View style={[styles.badges, isVertical && styles.badgesVertical]}>
        {product.isBestseller && (
          <View style={[styles.badge, styles.bestsellerBadge]}>
            <Ionicons name="trophy" size={10} color="#FFB800" />
            <Text style={styles.bestsellerText}>Bán chạy</Text>
          </View>
        )}
        {product.isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.newText}>Mới</Text>
          </View>
        )}
        {product.flashSale && (
          <View style={[styles.badge, styles.flashSaleBadge]}>
            <Ionicons name="flash" size={10} color="#fff" />
            <Text style={styles.flashSaleText}>Flash Sale</Text>
          </View>
        )}
        {product.freeShipping && (
          <View style={[styles.badge, styles.shippingBadge]}>
            <Ionicons name="car-outline" size={10} color="#0066CC" />
            <Text style={styles.shippingText}>Freeship</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      {showAll && (
        <View style={[styles.stats, isVertical && styles.statsVertical]}>
          {/* Rating */}
          {product.rating && (
            <View style={styles.stat}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.statText}>{product.rating.toFixed(1)}</Text>
            </View>
          )}

          {/* Reviews */}
          {product.reviewCount && (
            <View style={styles.stat}>
              <Ionicons name="chatbubble-outline" size={12} color="#666" />
              <Text style={styles.statText}>
                {product.reviewCount > 1000 
                  ? `${(product.reviewCount / 1000).toFixed(1)}k` 
                  : product.reviewCount}
              </Text>
            </View>
          )}

          {/* Sold */}
          {product.sold && (
            <View style={styles.stat}>
              <Ionicons name="cart-outline" size={12} color="#666" />
              <Text style={styles.statText}>
                Đã bán {product.sold > 1000 
                  ? `${(product.sold / 1000).toFixed(1)}k` 
                  : product.sold}
              </Text>
            </View>
          )}

          {/* Stock */}
          {product.stock !== undefined && product.stock < 20 && (
            <View style={styles.stat}>
              <Ionicons name="warning-outline" size={12} color="#000000" />
              <Text style={[styles.statText, { color: '#000000' }]}>
                Còn {product.stock}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Additional Info */}
      {showAll && (
        <View style={[styles.additionalInfo, isVertical && styles.additionalInfoVertical]}>
          {product.warranty && (
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={12} color="#0066CC" />
              <Text style={styles.infoText}>BH: {product.warranty}</Text>
            </View>
          )}
          {product.origin && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.infoText}>{product.origin}</Text>
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {showAll && product.tags && product.tags.length > 0 && (
        <View style={styles.tags}>
          {product.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  vertical: {
    alignItems: 'flex-start',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badgesVertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  bestsellerBadge: {
    backgroundColor: '#FEF3C7',
  },
  bestsellerText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#D97706',
  },
  newBadge: {
    backgroundColor: '#E8F4FF',
  },
  newText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#0066CC',
  },
  flashSaleBadge: {
    backgroundColor: '#000000',
  },
  flashSaleText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
  },
  shippingBadge: {
    backgroundColor: '#D1FAE5',
  },
  shippingText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#0066CC',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsVertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  additionalInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  additionalInfoVertical: {
    flexDirection: 'column',
    gap: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    fontSize: 10,
    color: '#666',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    color: '#666',
  },
});
