import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Budget {
  id: number;
  name: string;
  projectName: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  status: 'on-track' | 'warning' | 'over-budget';
  startDate: string;
  endDate: string;
  categories: {
    name: string;
    allocated: number;
    spent: number;
  }[];
}

export default function BudgetsScreen() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const budgets: Budget[] = [
    {
      id: 1,
      name: 'Ngân sách Q1 2025',
      projectName: 'Tòa nhà Sunrise Tower',
      totalBudget: 5000000000,
      spent: 2800000000,
      remaining: 2200000000,
      status: 'on-track',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      categories: [
        { name: 'Vật liệu', allocated: 2500000000, spent: 1400000000 },
        { name: 'Nhân công', allocated: 1500000000, spent: 900000000 },
        { name: 'Thiết bị', allocated: 800000000, spent: 400000000 },
        { name: 'Khác', allocated: 200000000, spent: 100000000 },
      ],
    },
    {
      id: 2,
      name: 'Ngân sách nội thất',
      projectName: 'Biệt thự Phú Mỹ Hưng',
      totalBudget: 1200000000,
      spent: 950000000,
      remaining: 250000000,
      status: 'warning',
      startDate: '2025-01-15',
      endDate: '2025-02-28',
      categories: [
        { name: 'Nội thất', allocated: 800000000, spent: 700000000 },
        { name: 'Thiết bị điện', allocated: 300000000, spent: 200000000 },
        { name: 'Khác', allocated: 100000000, spent: 50000000 },
      ],
    },
    {
      id: 3,
      name: 'Ngân sách móng',
      projectName: 'Chung cư The Manor',
      totalBudget: 800000000,
      spent: 850000000,
      remaining: -50000000,
      status: 'over-budget',
      startDate: '2024-12-01',
      endDate: '2025-01-31',
      categories: [
        { name: 'Bê tông', allocated: 400000000, spent: 450000000 },
        { name: 'Cốt thép', allocated: 300000000, spent: 320000000 },
        { name: 'Nhân công', allocated: 100000000, spent: 80000000 },
      ],
    },
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu`;
    }
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'over-budget': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track': return 'Đúng kế hoạch';
      case 'warning': return 'Cần chú ý';
      case 'over-budget': return 'Vượt ngân sách';
      default: return status;
    }
  };

  const getProgressPercent = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100);
  };

  const filteredBudgets = budgets.filter(
    budget =>
      budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý ngân sách</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: '#EEF2FF' }]}>
            <Text style={styles.summaryLabel}>Tổng ngân sách</Text>
            <Text style={[styles.summaryValue, { color: Colors.light.primary }]}>
              {formatCurrency(budgets.reduce((sum, b) => sum + b.totalBudget, 0))}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.summaryLabel}>Đã chi</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.summaryLabel}>Còn lại</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {formatCurrency(budgets.reduce((sum, b) => sum + b.remaining, 0))}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm ngân sách..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Budget List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
          ) : (
            filteredBudgets.map((budget) => (
              <TouchableOpacity
                key={budget.id}
                style={styles.budgetCard}
                onPress={() => {}}
              >
                <View style={styles.budgetHeader}>
                  <View>
                    <Text style={styles.budgetName}>{budget.name}</Text>
                    <Text style={styles.projectName}>{budget.projectName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(budget.status)}20` }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(budget.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(budget.status) }]}>
                      {getStatusText(budget.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${getProgressPercent(budget.spent, budget.totalBudget)}%`,
                          backgroundColor: getStatusColor(budget.status),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {((budget.spent / budget.totalBudget) * 100).toFixed(0)}%
                  </Text>
                </View>

                <View style={styles.budgetStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Ngân sách</Text>
                    <Text style={styles.statValue}>{formatCurrency(budget.totalBudget)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Đã chi</Text>
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                      {formatCurrency(budget.spent)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Còn lại</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: budget.remaining >= 0 ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {formatCurrency(budget.remaining)}
                    </Text>
                  </View>
                </View>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                  <Text style={styles.dateText}>
                    {new Date(budget.startDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(budget.endDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  loader: {
    marginTop: 40,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  projectName: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 36,
    textAlign: 'right',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
