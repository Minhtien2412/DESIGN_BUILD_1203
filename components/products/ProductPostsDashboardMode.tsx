import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProductStats, ProductStatsCard } from '@/components/products/ProductStatsCard';
import type { Product } from '@/services/api/types';

type Props = {
  products: Product[];
};

export function ProductPostsDashboardMode({ products }: Props) {
  const stats: ProductStats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => !p.stock || p.stock === 0).length;
    const lowStock = products.filter((p) => !!p.stock && p.stock > 0 && p.stock < 10).length;
    const activeProducts = products.filter((p) => p.status === 'APPROVED' && !!p.stock && p.stock > 0).length;

    return {
      totalProducts: total,
      activeProducts,
      outOfStock,
      lowStock,
      totalRevenue: 0,
    };
  }, [products]);

  const statusCounts = useMemo(() => {
    const pending = products.filter((p) => p.status === 'PENDING').length;
    const approved = products.filter((p) => p.status === 'APPROVED').length;
    const rejected = products.filter((p) => p.status === 'REJECTED').length;
    return { pending, approved, rejected };
  }, [products]);

  return (
    <View style={styles.container}>
      <ProductStatsCard stats={stats} />

      <View style={styles.statusRow}>
        <View style={[styles.statusPill, styles.pending]}>
          <Text style={[styles.statusPillText, styles.pendingText]}>Chờ duyệt: {statusCounts.pending}</Text>
        </View>
        <View style={[styles.statusPill, styles.approved]}>
          <Text style={[styles.statusPillText, styles.approvedText]}>Đã duyệt: {statusCounts.approved}</Text>
        </View>
        <View style={[styles.statusPill, styles.rejected]}>
          <Text style={[styles.statusPillText, styles.rejectedText]}>Từ chối: {statusCounts.rejected}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pending: {
    backgroundColor: '#fef3c7',
    borderColor: '#0066CC',
  },
  pendingText: {
    color: '#92400e',
  },
  approved: {
    backgroundColor: '#d1fae5',
    borderColor: '#0066CC',
  },
  approvedText: {
    color: '#065f46',
  },
  rejected: {
    backgroundColor: '#fee2e2',
    borderColor: '#000000',
  },
  rejectedText: {
    color: '#991b1b',
  },
});
