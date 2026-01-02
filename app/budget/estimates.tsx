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

interface Estimate {
  id: number;
  name: string;
  projectName: string;
  totalEstimate: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string;
  categories: {
    name: string;
    amount: number;
    items: number;
  }[];
}

export default function EstimatesScreen() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  const estimates: Estimate[] = [
    {
      id: 1,
      name: 'Dự toán xây thô tầng 5-10',
      projectName: 'Tòa nhà Sunrise Tower',
      totalEstimate: 2500000000,
      status: 'approved',
      createdAt: '2025-01-10',
      createdBy: 'Nguyễn Văn A',
      categories: [
        { name: 'Vật liệu xây dựng', amount: 1500000000, items: 25 },
        { name: 'Nhân công', amount: 700000000, items: 12 },
        { name: 'Thiết bị', amount: 300000000, items: 8 },
      ],
    },
    {
      id: 2,
      name: 'Dự toán hoàn thiện nội thất',
      projectName: 'Biệt thự Phú Mỹ Hưng',
      totalEstimate: 800000000,
      status: 'pending',
      createdAt: '2025-01-15',
      createdBy: 'Trần Thị B',
      categories: [
        { name: 'Nội thất', amount: 500000000, items: 45 },
        { name: 'Đèn điện', amount: 150000000, items: 30 },
        { name: 'Sàn gỗ', amount: 150000000, items: 5 },
      ],
    },
    {
      id: 3,
      name: 'Dự toán M&E tầng hầm',
      projectName: 'Chung cư The Manor',
      totalEstimate: 450000000,
      status: 'draft',
      createdAt: '2025-01-18',
      createdBy: 'Lê Văn C',
      categories: [
        { name: 'Điện', amount: 200000000, items: 15 },
        { name: 'Nước', amount: 150000000, items: 12 },
        { name: 'PCCC', amount: 100000000, items: 8 },
      ],
    },
    {
      id: 4,
      name: 'Dự toán sơn ngoại thất',
      projectName: 'Nhà phố Quận 2',
      totalEstimate: 120000000,
      status: 'rejected',
      createdAt: '2025-01-08',
      createdBy: 'Phạm Văn D',
      categories: [
        { name: 'Sơn', amount: 80000000, items: 10 },
        { name: 'Nhân công', amount: 40000000, items: 3 },
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
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'draft': return '#94A3B8';
      case 'rejected': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'pending': return 'Chờ duyệt';
      case 'draft': return 'Nháp';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'draft': return 'document';
      case 'rejected': return 'close-circle';
      default: return 'ellipse';
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchSearch = estimate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       estimate.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || estimate.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'draft', label: 'Nháp' },
  ];

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dự toán</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{estimates.length}</Text>
            <Text style={styles.summaryLabel}>Tổng dự toán</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
              {estimates.filter(e => e.status === 'pending').length}
            </Text>
            <Text style={styles.summaryLabel}>Chờ duyệt</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#10B981' }]}>
              {estimates.filter(e => e.status === 'approved').length}
            </Text>
            <Text style={styles.summaryLabel}>Đã duyệt</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dự toán..."
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
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                filterStatus === filter.key && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Estimates List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
          ) : (
            filteredEstimates.map((estimate) => (
              <TouchableOpacity
                key={estimate.id}
                style={styles.estimateCard}
                onPress={() => {}}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Ionicons name="document-text" size={20} color={Colors.light.primary} />
                    <View style={styles.cardTitleContent}>
                      <Text style={styles.estimateName}>{estimate.name}</Text>
                      <Text style={styles.projectName}>{estimate.projectName}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(estimate.status)}15` }]}>
                    <Ionicons name={getStatusIcon(estimate.status) as any} size={14} color={getStatusColor(estimate.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(estimate.status) }]}>
                      {getStatusText(estimate.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng dự toán</Text>
                  <Text style={styles.totalValue}>{formatCurrency(estimate.totalEstimate)}</Text>
                </View>

                <View style={styles.categoriesContainer}>
                  {estimate.categories.map((cat, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
                      <Text style={styles.categoryItems}>{cat.items} mục</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <Ionicons name="person-outline" size={14} color="#94A3B8" />
                    <Text style={styles.footerText}>{estimate.createdBy}</Text>
                  </View>
                  <View style={styles.footerInfo}>
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text style={styles.footerText}>
                      {new Date(estimate.createdAt).toLocaleDateString('vi-VN')}
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
  summaryRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  estimateCard: {
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  cardTitleContent: {
    flex: 1,
  },
  estimateName: {
    fontSize: 15,
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
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  categoriesContainer: {
    gap: 8,
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryName: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    width: 100,
    textAlign: 'right',
  },
  categoryItems: {
    fontSize: 12,
    color: '#94A3B8',
    width: 60,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
