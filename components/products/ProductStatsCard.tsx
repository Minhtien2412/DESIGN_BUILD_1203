import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

/**
 * ProductStatsCard - Displays product analytics statistics
 * For dashboard overview and product management
 */

export type ProductStats = {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalRevenue: number;
  topSelling?: {
    id: string;
    name: string;
    sold: number;
  };
  lowStock?: number; // products with stock < 10
};

interface ProductStatsCardProps {
  stats: ProductStats;
  onViewAll?: () => void;
  onManageStock?: () => void;
}

export function ProductStatsCard({ stats, onViewAll, onManageStock }: ProductStatsCardProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accent = useThemeColor({}, 'accent');

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
    } catch {
      return value + ' ₫';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: accent + '20' }]}>
            <Ionicons name="cube-outline" size={24} color={accent} />
          </View>
          <View>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Quản lý sản phẩm
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: textMuted }]}>
              Tổng quan hàng hóa
            </ThemedText>
          </View>
        </View>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <ThemedText style={{ color: accent, fontSize: 14 }}>Xem tất cả →</ThemedText>
          </Pressable>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Total Products */}
        <View style={[styles.statItem, { backgroundColor: '#3b82f6' + '15', borderColor: '#3b82f6' + '30' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="cube" size={20} color="#3b82f6" />
            <ThemedText style={[styles.statLabel, { color: textMuted }]}>Tổng SP</ThemedText>
          </View>
          <ThemedText type="title" style={[styles.statValue, { color: '#3b82f6' }]}>
            {stats.totalProducts}
          </ThemedText>
        </View>

        {/* Active Products */}
        <View style={[styles.statItem, { backgroundColor: '#22c55e' + '15', borderColor: '#22c55e' + '30' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <ThemedText style={[styles.statLabel, { color: textMuted }]}>Đang bán</ThemedText>
          </View>
          <ThemedText type="title" style={[styles.statValue, { color: '#22c55e' }]}>
            {stats.activeProducts}
          </ThemedText>
        </View>

        {/* Out of Stock */}
        <View style={[styles.statItem, { backgroundColor: '#ef4444' + '15', borderColor: '#ef4444' + '30' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="close-circle" size={20} color="#ef4444" />
            <ThemedText style={[styles.statLabel, { color: textMuted }]}>Hết hàng</ThemedText>
          </View>
          <ThemedText type="title" style={[styles.statValue, { color: '#ef4444' }]}>
            {stats.outOfStock}
          </ThemedText>
        </View>

        {/* Low Stock Warning */}
        {stats.lowStock !== undefined && stats.lowStock > 0 && (
          <View style={[styles.statItem, { backgroundColor: '#f97316' + '15', borderColor: '#f97316' + '30' }]}>
            <View style={styles.statHeader}>
              <Ionicons name="alert-circle" size={20} color="#f97316" />
              <ThemedText style={[styles.statLabel, { color: textMuted }]}>Sắp hết</ThemedText>
            </View>
            <ThemedText type="title" style={[styles.statValue, { color: '#f97316' }]}>
              {stats.lowStock}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Revenue Card */}
      <LinearGradient
        colors={[accent, accent + 'dd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.revenueCard}
      >
        <View style={styles.revenueHeader}>
          <Ionicons name="trending-up" size={28} color="#fff" />
          <ThemedText style={styles.revenueLabel}>Tổng doanh thu</ThemedText>
        </View>
        <ThemedText type="title" style={styles.revenueValue}>
          {formatCurrency(stats.totalRevenue)}
        </ThemedText>
      </LinearGradient>

      {/* Top Selling Product */}
      {stats.topSelling && (
        <View style={[styles.topSellingCard, { backgroundColor: border }]}>
          <View style={styles.topSellingHeader}>
            <Ionicons name="trophy" size={20} color="#f59e0b" />
            <ThemedText style={[styles.topSellingLabel, { color: text }]}>
              Sản phẩm bán chạy nhất
            </ThemedText>
          </View>
          <ThemedText numberOfLines={1} style={[styles.topSellingName, { color: text }]}>
            {stats.topSelling.name}
          </ThemedText>
          <ThemedText style={[styles.topSellingSold, { color: textMuted }]}>
            Đã bán: {stats.topSelling.sold} sản phẩm
          </ThemedText>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {onManageStock && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: accent }]}
            onPress={onManageStock}
          >
            <Ionicons name="settings-outline" size={18} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Quản lý kho</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 24,
  },
  revenueCard: {
    padding: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  revenueLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  revenueValue: {
    color: '#fff',
    fontSize: 28,
  },
  topSellingCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  topSellingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  topSellingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  topSellingName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  topSellingSold: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
