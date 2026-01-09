/**
 * Cost Tracker Component
 * For tracking project budgets, expenses, and financial progress
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import Badge from './badge';
import { Button } from './button';
import Card, { CardContent } from './card';
import { SectionHeader } from './list-item';

// ============================================
// TYPES
// ============================================

export interface CostItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
  status?: 'pending' | 'approved' | 'paid';
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface CostTrackerProps {
  totalBudget: number;
  totalSpent: number;
  categories?: BudgetCategory[];
  recentTransactions?: CostItem[];
  onAddExpense?: () => void;
  onViewDetails?: (categoryId: string) => void;
}

// ============================================
// BUDGET OVERVIEW COMPONENT
// ============================================

function BudgetOverview({ totalBudget, totalSpent }: { totalBudget: number; totalSpent: number }) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');

  const remaining = totalBudget - totalSpent;
  const percentage = (totalSpent / totalBudget) * 100;
  const isOverBudget = totalSpent > totalBudget;

  const getProgressColor = () => {
    if (isOverBudget) return '#000000';
    if (percentage > 80) return '#0066CC';
    return primary;
  };

  return (
    <Card variant="elevated">
      <CardContent>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={[TextVariants.caption, { color: textMuted }]}>Total Budget</Text>
            <Text style={[TextVariants.h2, { color: text }]}>${totalBudget.toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[TextVariants.caption, { color: textMuted }]}>Remaining</Text>
            <Text style={[TextVariants.h2, { color: isOverBudget ? '#000000' : '#0066CC' }]}>
              ${Math.abs(remaining).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginTop: SpacingSemantic.md }}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[TextVariants.caption, { color: textMuted }]}>
              ${totalSpent.toLocaleString()} spent
            </Text>
            <Text style={[TextVariants.caption, { color: textMuted }]}>{percentage.toFixed(1)}%</Text>
          </View>
        </View>

        {isOverBudget && (
          <View style={[styles.warningBanner, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="warning" size={16} color="#000000" />
            <Text style={[TextVariants.caption, { color: '#000000', marginLeft: SpacingSemantic.xs }]}>
              Over budget by ${Math.abs(remaining).toLocaleString()}
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// CATEGORY BREAKDOWN COMPONENT
// ============================================

function CategoryBreakdown({
  categories,
  onViewDetails,
}: {
  categories: BudgetCategory[];
  onViewDetails?: (categoryId: string) => void;
}) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  return (
    <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
      <CardContent>
        <SectionHeader title="Budget by Category" />
        {categories.map((category, index) => {
          const percentage = (category.spent / category.budgeted) * 100;
          const isOverBudget = category.spent > category.budgeted;

          return (
            <View key={category.id}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: border }]} />}
              <Pressable
                style={styles.categoryItem}
                onPress={() => onViewDetails?.(category.id)}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    {category.icon && (
                      <View
                        style={[
                          styles.categoryIconContainer,
                          { backgroundColor: `${category.color}20` },
                        ]}
                      >
                        <Ionicons name={category.icon} size={20} color={category.color} />
                      </View>
                    )}
                    <View>
                      <Text style={[TextVariants.body1, { color: text }]}>{category.name}</Text>
                      <Text style={[TextVariants.caption, { color: textMuted }]}>
                        ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        TextVariants.body1,
                        { color: isOverBudget ? '#000000' : text, fontWeight: '600' },
                      ]}
                    >
                      ${(category.budgeted - category.spent).toLocaleString()}
                    </Text>
                    <Text style={[TextVariants.caption, { color: textMuted }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>

                {/* Mini Progress Bar */}
                <View style={styles.miniProgressBar}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? '#000000' : category.color,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            </View>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ============================================
// RECENT TRANSACTIONS COMPONENT
// ============================================

function RecentTransactions({ transactions }: { transactions: CostItem[] }) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'success' as const;
      case 'pending':
        return 'warning' as const;
      case 'paid':
        return 'info' as const;
      default:
        return 'neutral' as const;
    }
  };

  return (
    <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
      <CardContent>
        <SectionHeader title="Recent Transactions" />
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color={textMuted} />
            <Text style={[TextVariants.body2, { color: textMuted, marginTop: SpacingSemantic.sm }]}>
              No transactions yet
            </Text>
          </View>
        ) : (
          transactions.map((transaction, index) => (
            <View key={transaction.id}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: border }]} />}
              <View style={styles.transactionItem}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        transaction.type === 'expense' ? '#FEE2E2' : '#D1FAE5',
                    },
                  ]}
                >
                  <Ionicons
                    name={transaction.type === 'expense' ? 'arrow-down' : 'arrow-up'}
                    size={16}
                    color={transaction.type === 'expense' ? '#000000' : '#0066CC'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[TextVariants.body1, { color: text }]}>
                    {transaction.description}
                  </Text>
                  <Text style={[TextVariants.caption, { color: textMuted }]}>
                    {transaction.category} • {transaction.date}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      TextVariants.body1,
                      {
                        color: transaction.type === 'expense' ? '#000000' : '#0066CC',
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {transaction.type === 'expense' ? '-' : '+'}$
                    {transaction.amount.toLocaleString()}
                  </Text>
                  {transaction.status && (
                    <Badge variant={getStatusBadgeVariant(transaction.status)} size="sm">
                      {transaction.status}
                    </Badge>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COST TRACKER COMPONENT
// ============================================

export default function CostTracker({
  totalBudget,
  totalSpent,
  categories = [],
  recentTransactions = [],
  onAddExpense,
  onViewDetails,
}: CostTrackerProps) {
  return (
    <View style={styles.container}>
      <BudgetOverview totalBudget={totalBudget} totalSpent={totalSpent} />

      {categories.length > 0 && (
        <CategoryBreakdown categories={categories} onViewDetails={onViewDetails} />
      )}

      <RecentTransactions transactions={recentTransactions} />

      {onAddExpense && (
        <Button
          title="Add Expense"
          onPress={onAddExpense}
          style={{ marginTop: SpacingSemantic.md }}
        />
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SpacingSemantic.xs,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SpacingSemantic.sm,
    borderRadius: BorderRadius.md,
    marginTop: SpacingSemantic.md,
  },
  categoryItem: {
    paddingVertical: SpacingSemantic.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SpacingSemantic.xs,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingSemantic.sm,
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: SpacingSemantic.xs,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  divider: {
    height: 1,
    marginVertical: SpacingSemantic.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingSemantic.sm,
    paddingVertical: SpacingSemantic.sm,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SpacingSemantic.xl,
  },
});
