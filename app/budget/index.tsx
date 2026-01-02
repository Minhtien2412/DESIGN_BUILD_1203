import { useBudgetSummary, useBudgets } from '@/hooks/useBudget';
import type { BudgetCategory } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_CONFIG: Record<
  BudgetCategory,
  { label: string; icon: string; color: string }
> = {
  LABOR: { label: 'Nhân công', icon: 'people', color: '#2196F3' },
  MATERIALS: { label: 'Vật liệu', icon: 'cube', color: '#4CAF50' },
  EQUIPMENT: { label: 'Thiết bị', icon: 'construct', color: '#FF9800' },
  SUBCONTRACTOR: { label: 'Thầu phụ', icon: 'business', color: '#9C27B0' },
  PERMITS: { label: 'Giấy phép', icon: 'document-text', color: '#F44336' },
  UTILITIES: { label: 'Tiện ích', icon: 'flash', color: '#00BCD4' },
  INSURANCE: { label: 'Bảo hiểm', icon: 'shield-checkmark', color: '#795548' },
  OVERHEAD: { label: 'Chi phí chung', icon: 'ellipsis-horizontal', color: '#607D8B' },
  CONTINGENCY: { label: 'Dự phòng', icon: 'warning', color: '#FFC107' },
  OTHER: { label: 'Khác', icon: 'apps', color: '#9E9E9E' },
};

export default function BudgetDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { summary, loading: summaryLoading } = useBudgetSummary(projectId!);
  const { budgets, loading: budgetsLoading } = useBudgets(projectId!);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompact = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  if (summaryLoading || budgetsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Cards */}
        {summary && (
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.totalCard]}>
                <Ionicons name="wallet" size={24} color="#2196F3" />
                <Text style={styles.summaryLabel}>Tổng ngân sách</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(summary.totalBudget)}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.halfCard]}>
                <Ionicons name="trending-down" size={20} color="#F44336" />
                <Text style={styles.summaryLabel}>Đã chi</Text>
                <Text style={[styles.summaryValue, { fontSize: 18, color: '#F44336' }]}>
                  {formatCurrency(summary.totalSpent)}
                </Text>
                <Text style={styles.percentageText}>
                  {summary.percentageUsed.toFixed(1)}% đã sử dụng
                </Text>
              </View>

              <View style={[styles.summaryCard, styles.halfCard]}>
                <Ionicons name="cash" size={20} color="#4CAF50" />
                <Text style={styles.summaryLabel}>Còn lại</Text>
                <Text style={[styles.summaryValue, { fontSize: 18, color: '#4CAF50' }]}>
                  {formatCurrency(summary.totalRemaining)}
                </Text>
                <Text style={styles.percentageText}>
                  {(100 - summary.percentageUsed).toFixed(1)}% khả dụng
                </Text>
              </View>
            </View>

            {/* Overall Progress */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Tiến độ sử dụng</Text>
                <Text style={styles.progressPercentage}>
                  {summary.percentageUsed.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(summary.percentageUsed, 100)}%`,
                      backgroundColor:
                        summary.percentageUsed > 90
                          ? '#F44336'
                          : summary.percentageUsed > 75
                          ? '#FF9800'
                          : '#4CAF50',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Alerts */}
            {summary.overBudgetCategories.length > 0 && (
              <View style={styles.alertBox}>
                <Ionicons name="alert-circle" size={18} color="#F44336" />
                <Text style={styles.alertText}>
                  {summary.overBudgetCategories.length} hạng mục vượt ngân sách
                </Text>
              </View>
            )}

            {summary.nearLimitCategories.length > 0 && (
              <View style={[styles.alertBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="warning" size={18} color="#FF9800" />
                <Text style={[styles.alertText, { color: '#E65100' }]}>
                  {summary.nearLimitCategories.length} hạng mục gần hết ngân sách
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Category Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phân bổ theo hạng mục</Text>
            <TouchableOpacity onPress={() => router.push('/budget/budgets' as any)}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {summary &&
            Object.entries(summary.byCategory).map(([category, data]) => {
              const config = CATEGORY_CONFIG[category as BudgetCategory];
              const isOverBudget = data.spent > data.allocated;
              const isNearLimit = data.percentage > 85 && !isOverBudget;

              return (
                <View key={category} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryLeft}>
                      <View
                        style={[styles.categoryIcon, { backgroundColor: config.color + '20' }]}
                      >
                        <Ionicons
                          name={config.icon as any}
                          size={20}
                          color={config.color}
                        />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{config.label}</Text>
                        <Text style={styles.categoryAmount}>
                          {formatCompact(data.spent)} / {formatCompact(data.allocated)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.categoryRight}>
                      {isOverBudget && (
                        <View style={styles.warningBadge}>
                          <Ionicons name="alert-circle" size={14} color="#F44336" />
                          <Text style={styles.warningText}>Vượt</Text>
                        </View>
                      )}
                      {isNearLimit && (
                        <View style={[styles.warningBadge, { backgroundColor: '#FFF3E0' }]}>
                          <Ionicons name="warning" size={14} color="#FF9800" />
                          <Text style={[styles.warningText, { color: '#FF9800' }]}>
                            {data.percentage.toFixed(0)}%
                          </Text>
                        </View>
                      )}
                      {!isOverBudget && !isNearLimit && (
                        <Text style={styles.percentageLabel}>
                          {data.percentage.toFixed(0)}%
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.categoryProgress}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        {
                          width: `${Math.min(data.percentage, 100)}%`,
                          backgroundColor: isOverBudget
                            ? '#F44336'
                            : isNearLimit
                            ? '#FF9800'
                            : config.color,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.categoryFooter}>
                    <Text style={styles.categoryFooterText}>
                      Còn lại: {formatCurrency(data.remaining)}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/budget/expenses')}
            >
              <Ionicons name="receipt" size={28} color="#2196F3" />
              <Text style={styles.actionLabel}>Chi tiêu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/budget/invoices')}
            >
              <Ionicons name="document-text" size={28} color="#4CAF50" />
              <Text style={styles.actionLabel}>Hóa đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/budget/estimates' as any)}
            >
              <Ionicons name="calculator" size={28} color="#FF9800" />
              <Text style={styles.actionLabel}>Ước tính</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/budget/reports' as any)}
            >
              <Ionicons name="stats-chart" size={28} color="#9C27B0" />
              <Text style={styles.actionLabel}>Báo cáo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Budgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ngân sách gần đây</Text>
            <TouchableOpacity
              onPress={() => router.push(`/budget/create-budget?projectId=${projectId}` as any)}
            >
              <Ionicons name="add-circle" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>

          {budgets.slice(0, 5).map((budget) => {
            const config = CATEGORY_CONFIG[budget.category];
            return (
              <View key={budget.id} style={styles.budgetItem}>
                <View
                  style={[styles.categoryIcon, { backgroundColor: config.color + '20' }]}
                >
                  <Ionicons name={config.icon as any} size={18} color={config.color} />
                </View>
                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetName}>{budget.name}</Text>
                  <Text style={styles.budgetAmount}>
                    {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.allocatedAmount)}
                  </Text>
                </View>
                <View style={styles.budgetProgress}>
                  <View
                    style={[
                      styles.budgetProgressBar,
                      {
                        width: `${budget.percentageUsed}%`,
                        backgroundColor: config.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  summarySection: {
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  halfCard: {
    flex: 1,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  percentageText: {
    fontSize: 11,
    color: '#999',
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 12,
    color: '#666',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F44336',
  },
  percentageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryProgress: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  categoryProgressFill: {
    height: '100%',
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  categoryFooterText: {
    fontSize: 11,
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: 11,
    color: '#666',
  },
  budgetProgress: {
    width: 60,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  budgetProgressBar: {
    height: '100%',
  },
});
