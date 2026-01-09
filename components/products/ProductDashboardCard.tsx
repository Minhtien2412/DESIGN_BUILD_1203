import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { Product } from '@/data/products';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatPrice } from '../ui/product-card';
import { ProductOwnerBadge } from './ProductOwnerBadge';

/**
 * ProductDashboardCard - Enhanced product card with analytics metrics
 * For admin dashboard and product management screens
 */

interface ProductDashboardCardProps {
  product: Product;
  showMetrics?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  onModerate?: (product: Product) => void; // Admin moderation action
  currentUserId?: string; // ID người dùng hiện tại
  isAdmin?: boolean;      // Có phải admin không
}

export function ProductDashboardCard({
  product,
  showMetrics = true,
  onEdit,
  onDelete,
  onViewDetails,
  onModerate,
  currentUserId,
  isAdmin = false,
}: ProductDashboardCardProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const textMuted = useThemeColor({}, 'textMuted');
  const text = useThemeColor({}, 'text');
  const success = '#0066CC';
  const warning = '#0066CC';
  const danger = '#000000';

  const hasDiscount = typeof product.discountPercent === 'number' && product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - (product.discountPercent ?? 0) / 100))
    : product.price;

  // Check if current user can edit/delete this product
  const canEdit = isAdmin || (currentUserId && product.createdBy === currentUserId);

  const stockStatus =
    !product.stock || product.stock === 0
      ? { label: 'Hết hàng', color: danger }
      : product.stock < 10
      ? { label: 'Sắp hết', color: warning }
      : { label: 'Còn hàng', color: success };

  const moderationStatus = product.status || 'APPROVED';
  const statusColors: Record<string, string> = {
    PENDING: warning,
    APPROVED: success,
    REJECTED: danger,
    DRAFT: textMuted,
    ACTIVE: success,
    INACTIVE: textMuted,
  };
  const statusLabels: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    DRAFT: 'Bản nháp',
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Ngừng',
  };

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      {/* Header: Image & Quick Actions */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.image} contentFit="cover" />
          
          {/* Badges */}
          <View style={styles.badgeContainer}>
            {hasDiscount && (
              <View style={[styles.badge, { backgroundColor: accent }]}>
                <ThemedText style={styles.badgeText}>-{product.discountPercent}%</ThemedText>
              </View>
            )}
            {product.flashSale && (
              <View style={[styles.badge, { backgroundColor: danger }]}>
                <ThemedText style={styles.badgeText}>FLASH</ThemedText>
              </View>
            )}
            {product.isBestseller && (
              <View style={[styles.badge, { backgroundColor: '#0066CC' }]}>
                <ThemedText style={styles.badgeText}>BÁN CHẠY</ThemedText>
              </View>
            )}
            {product.isNew && (
              <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
                <ThemedText style={styles.badgeText}>MỚI</ThemedText>
              </View>
            )}
            {/* Moderation Status Badge */}
            {moderationStatus !== 'APPROVED' && (
              <View style={[styles.badge, { backgroundColor: statusColors[moderationStatus] }]}>
                <ThemedText style={styles.badgeText}>{statusLabels[moderationStatus]}</ThemedText>
              </View>
            )}
          </View>

          {/* Stock Status Indicator */}
          <View style={[styles.stockIndicator, { backgroundColor: stockStatus.color }]}>
            <ThemedText style={styles.stockText}>{stockStatus.label}</ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {onEdit && canEdit && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: accent + '20' }]}
              onPress={() => onEdit(product)}
            >
              <Ionicons name="create-outline" size={20} color={accent} />
            </Pressable>
          )}
          {onModerate && isAdmin && moderationStatus === 'PENDING' && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: warning + '20' }]}
              onPress={() => onModerate(product)}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={warning} />
            </Pressable>
          )}
          {onDelete && canEdit && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: danger + '20' }]}
              onPress={() => onDelete(product.id)}
            >
              <Ionicons name="trash-outline" size={20} color={danger} />
            </Pressable>
          )}
          {onViewDetails && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: accent + '20' }]}
              onPress={() => onViewDetails(product.id)}
            >
              <Ionicons name="eye-outline" size={20} color={accent} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.infoSection}>
        {/* Owner Badge */}
        {product.createdBy && (
          <ProductOwnerBadge
            createdBy={product.createdBy}
            createdAt={product.createdAt}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        )}

        <View style={styles.titleRow}>
          <ThemedText numberOfLines={2} style={styles.title}>
            {product.name}
          </ThemedText>
          <Link href={`/product/${product.id}` as any} asChild>
            <Pressable>
              <Ionicons name="open-outline" size={18} color={accent} />
            </Pressable>
          </Link>
        </View>

        {/* Category & Brand */}
        <View style={styles.metaRow}>
          {product.category && (
            <View style={[styles.tag, { backgroundColor: border }]}>
              <ThemedText style={[styles.tagText, { color: textMuted }]}>
                {product.category}
              </ThemedText>
            </View>
          )}
          {product.brand && (
            <View style={[styles.tag, { backgroundColor: border }]}>
              <ThemedText style={[styles.tagText, { color: textMuted }]}>
                {product.brand}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          {hasDiscount && (
            <ThemedText style={[styles.oldPrice, { color: textMuted }]}>
              {formatPrice(product.price)}
            </ThemedText>
          )}
          <ThemedText type="defaultSemiBold" style={[styles.price, { color: accent }]}>
            {formatPrice(finalPrice)}
          </ThemedText>
        </View>
      </View>

      {/* Metrics Section */}
      {showMetrics && (
        <View style={[styles.metricsSection, { borderTopColor: border }]}>
          <View style={styles.metricItem}>
            <Ionicons name="star" size={16} color="#0066CC" />
            <ThemedText style={[styles.metricValue, { color: text }]}>
              {product.rating?.toFixed(1) || '0.0'}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: textMuted }]}>
              ({product.reviewCount || 0})
            </ThemedText>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Ionicons name="cart" size={16} color={accent} />
            <ThemedText style={[styles.metricValue, { color: text }]}>
              {product.sold || 0}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: textMuted }]}>đã bán</ThemedText>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Ionicons name="cube" size={16} color={stockStatus.color} />
            <ThemedText style={[styles.metricValue, { color: text }]}>
              {product.stock || 0}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: textMuted }]}>kho</ThemedText>
          </View>
        </View>
      )}

      {/* Additional Features */}
      <View style={styles.featuresRow}>
        {product.freeShipping && (
          <View style={[styles.featureBadge, { backgroundColor: success + '20' }]}>
            <Ionicons name="car-outline" size={12} color={success} />
            <ThemedText style={[styles.featureText, { color: success }]}>Freeship</ThemedText>
          </View>
        )}
        {product.warranty && (
          <View style={[styles.featureBadge, { backgroundColor: accent + '20' }]}>
            <Ionicons name="shield-checkmark-outline" size={12} color={accent} />
            <ThemedText style={[styles.featureText, { color: accent }]}>
              BH {product.warranty}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  stockIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  quickActions: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  oldPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 17,
  },
  metricsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    marginBottom: Spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 11,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
