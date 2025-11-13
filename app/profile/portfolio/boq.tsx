import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/list-item';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type BOQItem = {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'approved' | 'pending' | 'rejected';
};

const MOCK_BOQ: BOQItem[] = [
  {
    id: '1',
    code: 'A.01',
    name: 'Đào đất móng',
    unit: 'm³',
    quantity: 45,
    unitPrice: 150000,
    total: 6750000,
    status: 'approved',
  },
  {
    id: '2',
    code: 'A.02',
    name: 'Đổ bê tông móng',
    unit: 'm³',
    quantity: 20,
    unitPrice: 2500000,
    total: 50000000,
    status: 'approved',
  },
  {
    id: '3',
    code: 'A.03',
    name: 'Xây tường gạch',
    unit: 'm²',
    quantity: 150,
    unitPrice: 180000,
    total: 27000000,
    status: 'pending',
  },
  {
    id: '4',
    code: 'A.04',
    name: 'Tô trát tường',
    unit: 'm²',
    quantity: 300,
    unitPrice: 80000,
    total: 24000000,
    status: 'pending',
  },
  {
    id: '5',
    code: 'A.05',
    name: 'Sơn tường nội thất',
    unit: 'm²',
    quantity: 300,
    unitPrice: 45000,
    total: 13500000,
    status: 'pending',
  },
];

export default function BOQScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleExportPDF = () => {
    setExporting(true);
    // Simulate PDF export
    setTimeout(() => {
      setExporting(false);
      Alert.alert('Thành công', 'Đã xuất file PDF dự toán');
    }, 2000);
  };

  const handleApprove = (itemId: string) => {
    Alert.alert(
      'Duyệt hạng mục',
      'Xác nhận duyệt hạng mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Duyệt', onPress: () => {
          // Update item status
          Alert.alert('Đã duyệt hạng mục');
        }},
      ]
    );
  };

  const handleReject = (itemId: string) => {
    Alert.alert(
      'Từ chối hạng mục',
      'Xác nhận từ chối hạng mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Từ chối', style: 'destructive', onPress: () => {
          Alert.alert('Đã từ chối hạng mục');
        }},
      ]
    );
  };

  // Filter logic
  const filteredBOQ = MOCK_BOQ.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredBOQ.reduce((sum, item) => sum + item.total, 0);
  const approvedAmount = filteredBOQ.filter(item => item.status === 'approved').reduce((sum, item) => sum + item.total, 0);
  const pendingAmount = filteredBOQ.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.total, 0);
  const approvalProgress = totalAmount > 0 ? (approvedAmount / totalAmount) * 100 : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'BOQ / Dự toán tóm tắt',
          headerBackTitle: 'Quay lại',
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleExportPDF}
              disabled={exporting}
              style={{ marginRight: 16 }}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#0891B2" />
              ) : (
                <Ionicons name="download-outline" size={24} color="#0891B2" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng quan dự toán</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng giá trị:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đã duyệt:</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {formatCurrency(approvedAmount)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Chờ duyệt:</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {formatCurrency(pendingAmount)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số hạng mục:</Text>
            <Text style={styles.summaryValue}>{filteredBOQ.length}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ duyệt</Text>
              <Text style={styles.progressPercent}>{approvalProgress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${approvalProgress}%` }]} />
            </View>
          </View>
        </Card>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã hoặc tên hạng mục..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === 'approved' && styles.filterChipActive]}
            onPress={() => setStatusFilter('approved')}
          >
            <Ionicons name="checkmark-circle" size={16} color={statusFilter === 'approved' ? '#FFFFFF' : '#10B981'} />
            <Text style={[styles.filterText, statusFilter === 'approved' && styles.filterTextActive]}>
              Đã duyệt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === 'pending' && styles.filterChipActive]}
            onPress={() => setStatusFilter('pending')}
          >
            <Ionicons name="time" size={16} color={statusFilter === 'pending' ? '#FFFFFF' : '#F59E0B'} />
            <Text style={[styles.filterText, statusFilter === 'pending' && styles.filterTextActive]}>
              Chờ duyệt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === 'rejected' && styles.filterChipActive]}
            onPress={() => setStatusFilter('rejected')}
          >
            <Ionicons name="close-circle" size={16} color={statusFilter === 'rejected' ? '#FFFFFF' : '#EF4444'} />
            <Text style={[styles.filterText, statusFilter === 'rejected' && styles.filterTextActive]}>
              Từ chối
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* BOQ Items */}
        <SectionHeader title={`Danh sách hạng mục (${filteredBOQ.length})`} />
        
        {filteredBOQ.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Không tìm thấy hạng mục</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có hạng mục nào'}
            </Text>
          </View>
        ) : (
          <>
            {filteredBOQ.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              
              return (
                <View key={item.id} style={styles.boqItem}>
                  <TouchableOpacity 
                    style={styles.boqHeader}
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.boqTitleRow}>
                      <Text style={styles.boqCode}>{item.code}</Text>
                      <View style={styles.headerRight}>
                        <Badge
                          variant="primary"
                          style={{ backgroundColor: getStatusColor(item.status), marginRight: 8 }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                            {getStatusText(item.status)}
                          </Text>
                        </Badge>
                        <Ionicons 
                          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                          size={20} 
                          color="#6B7280" 
                        />
                      </View>
                    </View>
                    <Text style={styles.boqName}>{item.name}</Text>
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <>
                      <View style={styles.boqDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Đơn vị:</Text>
                          <Text style={styles.detailValue}>{item.unit}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Khối lượng:</Text>
                          <Text style={styles.detailValue}>{item.quantity}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Đơn giá:</Text>
                          <Text style={styles.detailValue}>{formatCurrency(item.unitPrice)}</Text>
                        </View>
                        
                        <View style={[styles.detailRow, styles.totalRow]}>
                          <Text style={styles.totalLabel}>Thành tiền:</Text>
                          <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
                        </View>
                      </View>

                      {/* Approval Actions */}
                      {item.status === 'pending' && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleApprove(item.id)}
                          >
                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Duyệt</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleReject(item.id)}
                          >
                            <Ionicons name="close" size={18} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Từ chối</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}
        
        {/* Total Footer */}
        {filteredBOQ.length > 0 && (
          <View style={styles.totalFooter}>
            <Text style={styles.footerLabel}>TỔNG CỘNG</Text>
            <Text style={styles.footerValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  summaryCard: {
    margin: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  boqItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  boqHeader: {
    marginBottom: 0,
  },
  boqTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boqCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  boqName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  boqDetails: {
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  totalFooter: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
