/**
 * Payment Dashboard Component
 * Overview of financial status with charts and statistics
 * 
 * Features:
 * - Revenue vs Expenses chart
 * - Payment status breakdown
 * - Key financial metrics
 * - Overdue alerts
 * - Monthly trends
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Payment, formatVND } from '@/services/payment-api';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

// ============================================================================
// Types
// ============================================================================

interface PaymentDashboardProps {
  payments: Payment[];
  totalRevenue?: number;
  totalExpenses?: number;
  pendingAmount?: number;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({ icon, label, value, color, trend }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {trend && (
          <View style={styles.trendBadge}>
            <Ionicons
              name={trend.direction === 'up' ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend.direction === 'up' ? '#0066CC' : '#000000'}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend.direction === 'up' ? '#0066CC' : '#000000' },
              ]}
            >
              {trend.percentage}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PaymentDashboard({
  payments,
  totalRevenue,
  totalExpenses,
  pendingAmount,
}: PaymentDashboardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // ============================================================================
  // Calculations
  // ============================================================================

  // Calculate stats from payments if not provided
  const revenue = totalRevenue ?? payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const expenses = totalExpenses ?? 0;

  const pending = pendingAmount ?? payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = payments.filter(p => p.status === 'completed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;
  const refundedCount = payments.filter(p => p.status === 'refunded').length;

  const netProfit = revenue - expenses;

  // Calculate overdue (pending for more than 30 days)
  const overduePayments = payments.filter(p => {
    if (p.status !== 'pending') return false;
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince > 30;
  });

  const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  // Payment status percentages for breakdown bar
  const total = payments.length || 1;
  const completedPercentage = (completedCount / total) * 100;
  const pendingPercentage = (pendingCount / total) * 100;
  const failedPercentage = (failedCount / total) * 100;
  const refundedPercentage = (refundedCount / total) * 100;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Key Metrics Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="cash"
          label="Doanh thu"
          value={formatVND(revenue)}
          color="#0066CC"
          trend={{ direction: 'up', percentage: 12 }}
        />
        <StatCard
          icon="trending-down"
          label="Chi phí"
          value={formatVND(expenses)}
          color="#000000"
        />
        <StatCard
          icon="hourglass"
          label="Chờ thanh toán"
          value={formatVND(pending)}
          color="#0066CC"
        />
        <StatCard
          icon="stats-chart"
          label="Lợi nhuận"
          value={formatVND(netProfit)}
          color={netProfit >= 0 ? '#0066CC' : '#000000'}
          trend={netProfit >= 0 ? { direction: 'up', percentage: 8 } : undefined}
        />
      </View>

      {/* Overdue Alert (if any) */}
      {overduePayments.length > 0 && (
        <View style={styles.alertBox}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={20} color="#000000" />
            <Text style={styles.alertTitle}>
              Cảnh báo quá hạn ({overduePayments.length})
            </Text>
          </View>
          <Text style={styles.alertText}>
            {overduePayments.length} thanh toán quá hạn 30 ngày
          </Text>
          <Text style={styles.alertAmount}>
            Tổng: {formatVND(overdueAmount)}
          </Text>
        </View>
      )}

      {/* Payment Status Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Trạng thái thanh toán
        </Text>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          {completedPercentage > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${completedPercentage}%`,
                  backgroundColor: '#0066CC',
                },
              ]}
            />
          )}
          {pendingPercentage > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${pendingPercentage}%`,
                  backgroundColor: '#0066CC',
                },
              ]}
            />
          )}
          {failedPercentage > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${failedPercentage}%`,
                  backgroundColor: '#000000',
                },
              ]}
            />
          )}
          {refundedPercentage > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${refundedPercentage}%`,
                  backgroundColor: '#999999',
                },
              ]}
            />
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
            <Text style={styles.legendText}>
              Hoàn thành ({completedCount})
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
            <Text style={styles.legendText}>
              Chờ xử lý ({pendingCount})
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#000000' }]} />
            <Text style={styles.legendText}>
              Thất bại ({failedCount})
            </Text>
          </View>
          {refundedCount > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#999999' }]} />
              <Text style={styles.legendText}>
                Hoàn tiền ({refundedCount})
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Completion Rate */}
      <View style={styles.completionSection}>
        <View style={styles.completionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Tỉ lệ thanh toán thành công
          </Text>
          <Text style={styles.completionPercentage}>
            {Math.round(completedPercentage)}%
          </Text>
        </View>
        <View style={styles.completionBarContainer}>
          <View
            style={[
              styles.completionBarFill,
              { width: `${completedPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.completionInfo}>
          {completedCount} trên {payments.length} thanh toán
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  alertBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#000000',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991B1B',
  },
  alertText: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 4,
  },
  alertAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  breakdownSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBar: {
    height: 24,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  statusSegment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
  },
  completionSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0066CC',
  },
  completionBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  completionBarFill: {
    height: '100%',
    backgroundColor: '#0066CC',
    borderRadius: 4,
  },
  completionInfo: {
    fontSize: 13,
    color: '#6B7280',
  },
});
