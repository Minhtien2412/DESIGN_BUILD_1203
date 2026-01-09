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

interface Report {
  id: number;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  projectName: string;
  period: string;
  totalExpense: number;
  totalIncome: number;
  balance: number;
  status: 'draft' | 'completed';
  createdAt: string;
}

export default function BudgetReportsScreen() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data
  const reports: Report[] = [
    {
      id: 1,
      name: 'Báo cáo chi phí tháng 1/2025',
      type: 'monthly',
      projectName: 'Tòa nhà Sunrise Tower',
      period: '01/2025',
      totalExpense: 1500000000,
      totalIncome: 2000000000,
      balance: 500000000,
      status: 'completed',
      createdAt: '2025-02-01',
    },
    {
      id: 2,
      name: 'Báo cáo chi phí tuần 3/2025',
      type: 'weekly',
      projectName: 'Biệt thự Phú Mỹ Hưng',
      period: 'Tuần 3 - T1/2025',
      totalExpense: 350000000,
      totalIncome: 400000000,
      balance: 50000000,
      status: 'completed',
      createdAt: '2025-01-21',
    },
    {
      id: 3,
      name: 'Báo cáo ngày 20/01/2025',
      type: 'daily',
      projectName: 'Chung cư The Manor',
      period: '20/01/2025',
      totalExpense: 85000000,
      totalIncome: 0,
      balance: -85000000,
      status: 'draft',
      createdAt: '2025-01-20',
    },
    {
      id: 4,
      name: 'Báo cáo Q4/2024',
      type: 'quarterly',
      projectName: 'Tất cả dự án',
      period: 'Q4/2024',
      totalExpense: 8500000000,
      totalIncome: 10000000000,
      balance: 1500000000,
      status: 'completed',
      createdAt: '2025-01-05',
    },
  ];

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    let formatted;
    if (absAmount >= 1000000000) {
      formatted = `${(absAmount / 1000000000).toFixed(1)} tỷ`;
    } else if (absAmount >= 1000000) {
      formatted = `${(absAmount / 1000000).toFixed(0)} triệu`;
    } else {
      formatted = absAmount.toLocaleString('vi-VN') + ' ₫';
    }
    return isNegative ? `-${formatted}` : formatted;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return '#3B82F6';
      case 'weekly': return '#0066CC';
      case 'monthly': return '#0066CC';
      case 'quarterly': return '#666666';
      default: return '#94A3B8';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'daily': return 'Hàng ngày';
      case 'weekly': return 'Hàng tuần';
      case 'monthly': return 'Hàng tháng';
      case 'quarterly': return 'Hàng quý';
      default: return type;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       report.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || report.type === filterType;
    return matchSearch && matchType;
  });

  const typeFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'daily', label: 'Ngày' },
    { key: 'weekly', label: 'Tuần' },
    { key: 'monthly', label: 'Tháng' },
    { key: 'quarterly', label: 'Quý' },
  ];

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo tài chính</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-down-circle" size={24} color="#000000" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Tổng chi</Text>
              <Text style={[styles.summaryValue, { color: '#000000' }]}>
                {formatCurrency(reports.reduce((sum, r) => sum + r.totalExpense, 0))}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-up-circle" size={24} color="#0066CC" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Tổng thu</Text>
              <Text style={[styles.summaryValue, { color: '#0066CC' }]}>
                {formatCurrency(reports.reduce((sum, r) => sum + r.totalIncome, 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm báo cáo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {typeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                filterType === filter.key && styles.filterTabActive,
              ]}
              onPress={() => setFilterType(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reports List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
          ) : (
            filteredReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => {}}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor(report.type)}15` }]}>
                    <Text style={[styles.typeText, { color: getTypeColor(report.type) }]}>
                      {getTypeText(report.type)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: report.status === 'completed' ? '#ECFDF5' : '#FEF3C7' }]}>
                    <Text style={[styles.statusText, { color: report.status === 'completed' ? '#0066CC' : '#0066CC' }]}>
                      {report.status === 'completed' ? 'Hoàn thành' : 'Nháp'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reportName}>{report.name}</Text>
                <Text style={styles.projectName}>{report.projectName}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Chi</Text>
                    <Text style={[styles.statValue, { color: '#000000' }]}>
                      {formatCurrency(report.totalExpense)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Thu</Text>
                    <Text style={[styles.statValue, { color: '#0066CC' }]}>
                      {formatCurrency(report.totalIncome)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Số dư</Text>
                    <Text style={[styles.statValue, { color: report.balance >= 0 ? '#0066CC' : '#000000' }]}>
                      {formatCurrency(report.balance)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text style={styles.footerText}>{report.period}</Text>
                  </View>
                  <View style={styles.footerInfo}>
                    <Ionicons name="time-outline" size={14} color="#94A3B8" />
                    <Text style={styles.footerText}>
                      {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
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
  filterContainer: {
    marginTop: 12,
    maxHeight: 44,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  loader: {
    marginTop: 40,
  },
  reportCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
