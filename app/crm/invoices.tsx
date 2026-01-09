/**
 * CRM Invoices Screen
 * ====================
 * 
 * Quản lý hóa đơn và thanh toán từ Perfex CRM
 * Updated: January 7, 2026 - Using new API hooks
 * 
 * @author ThietKeResort Team
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING } from '@/constants/modern-theme';
import { useInvoices } from '@/hooks/usePerfexAPI';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Status mapping from Perfex API (1=Unpaid, 2=Paid, 3=Partial, 4=Overdue, 5=Cancelled, 6=Draft)
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: 'alert-circle-outline' | 'checkmark-circle-outline' | 'pie-chart-outline' | 'time-outline' | 'close-circle-outline' | 'document-outline' }> = {
  '1': { label: 'Chưa thanh toán', color: '#0066CC', icon: 'alert-circle-outline' },
  '2': { label: 'Đã thanh toán', color: '#10B981', icon: 'checkmark-circle-outline' },
  '3': { label: 'Thanh toán 1 phần', color: '#F59E0B', icon: 'pie-chart-outline' },
  '4': { label: 'Quá hạn', color: '#EF4444', icon: 'time-outline' },
  '5': { label: 'Đã hủy', color: '#9CA3AF', icon: 'close-circle-outline' },
  '6': { label: 'Nháp', color: '#6B7280', icon: 'document-outline' },
};

type FilterType = 'all' | 'unpaid' | 'paid' | 'overdue';

export default function CRMInvoicesScreen() {
  const { 
    invoices, 
    stats, 
    loading, 
    error, 
    refresh, 
    updateInvoice 
  } = useInvoices();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Đánh dấu hóa đơn này đã thanh toán?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await updateInvoice(invoiceId, { status: '2' }); // 2 = Paid
              setSelectedInvoice(null);
              Alert.alert('Thành công', 'Đã cập nhật trạng thái thanh toán');
            } catch (err: any) {
              console.error('Mark as paid error:', err);
              Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái');
            }
          },
        },
      ]
    );
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    if (filterType === 'all') return true;
    if (filterType === 'unpaid') return ['1', '3', '6'].includes(inv.status); // Unpaid, Partial, Draft
    if (filterType === 'paid') return inv.status === '2'; // Paid
    if (filterType === 'overdue') return inv.status === '4'; // Overdue
    return true;
  });

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Show loading on initial fetch
  if (loading && invoices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.loadingText}>{error}</Text>
          <TouchableOpacity style={styles.headerAction} onPress={refresh}>
            <Text style={styles.loadingText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Tổng quan thanh toán</Text>
        <View style={styles.dataSourceBadge}>
          <View style={styles.dataSourceDot} />
          <Text style={styles.dataSourceText}>{invoices.length > 0 ? 'Live CRM' : 'Demo'}</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Tổng cộng</Text>
          <Text style={styles.statsValue}>{formatCurrency(stats.totalAmount)}</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Đã nhận</Text>
          <Text style={[styles.statsValue, { color: MODERN_COLORS.success }]}>
            {formatCurrency(stats.totalPaid)}
          </Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Còn lại</Text>
          <Text style={[styles.statsValue, { color: MODERN_COLORS.warning }]}>
            {formatCurrency(stats.totalDue)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${stats.totalAmount > 0 ? (stats.totalPaid / stats.totalAmount) * 100 : 0}%`,
                backgroundColor: MODERN_COLORS.success 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {stats.totalAmount > 0 ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1) : 0}% hoàn thành
        </Text>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {[
        { key: 'all' as FilterType, label: 'Tất cả', count: invoices.length },
        { key: 'unpaid' as FilterType, label: 'Chưa TT', count: invoices.filter(i => ['1', '3', '6'].includes(i.status)).length },
        { key: 'paid' as FilterType, label: 'Đã TT', count: invoices.filter(i => i.status === '2').length },
        { key: 'overdue' as FilterType, label: 'Quá hạn', count: invoices.filter(i => i.status === '4').length },
      ].map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterTab,
            filterType === filter.key && styles.filterTabActive,
          ]}
          onPress={() => setFilterType(filter.key as FilterType)}
        >
          <Text style={[
            styles.filterText,
            filterType === filter.key && styles.filterTextActive,
          ]}>
            {filter.label}
          </Text>
          <View style={[
            styles.filterBadge,
            filterType === filter.key && styles.filterBadgeActive,
          ]}>
            <Text style={[
              styles.filterBadgeText,
              filterType === filter.key && styles.filterBadgeTextActive,
            ]}>
              {filter.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const handleViewDetail = (invoice: any) => {
    router.push(`/crm/invoice-detail?id=${invoice.id}`);
  };

  const renderInvoiceCard = ({ item: invoice }: { item: any }) => {
    const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG['6'];
    const isPaid = invoice.status === '2';
    const isOverdue = invoice.status === '4';
    
    return (
      <TouchableOpacity 
        style={styles.invoiceCard}
        onPress={() => handleViewDetail(invoice)}
        activeOpacity={0.8}
      >
        {/* Status indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: statusConfig.color }]} />
        
        <View style={styles.invoiceContent}>
          {/* Header row */}
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceNumber}>
              {invoice.prefix || 'INV'}-{invoice.number}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Customer */}
          <Text style={styles.customerName} numberOfLines={1}>
            Client ID: {invoice.clientid}
          </Text>

          {/* Project */}
          {invoice.project_id && (
            <View style={styles.projectRow}>
              <Ionicons name="folder-outline" size={12} color="#666" />
              <Text style={styles.projectName} numberOfLines={1}>
                Project #{invoice.project_id}
              </Text>
            </View>
          )}

          {/* Amount row */}
          <View style={styles.amountRow}>
            <View style={styles.amountInfo}>
              <Text style={styles.amountLabel}>Tổng tiền</Text>
              <Text style={[
                styles.amountValue,
                isPaid && { color: MODERN_COLORS.success },
                isOverdue && { color: MODERN_COLORS.danger },
              ]}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
            
            {/* Due date */}
            {invoice.duedate && !isPaid && (
              <View style={styles.dueDateContainer}>
                <Ionicons 
                  name="calendar-outline" 
                  size={12} 
                  color={isOverdue ? MODERN_COLORS.danger : '#666'} 
                />
                <Text style={[
                  styles.dueDate,
                  isOverdue && { color: MODERN_COLORS.danger },
                ]}>
                  {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
          </View>

          {/* Partial payment indicator */}
          {invoice.status === 'partially-paid' && invoice.amountPaid > 0 && (
            <View style={styles.partialPayment}>
              <Text style={styles.partialPaymentText}>
                Đã thanh toán: {formatCurrency(invoice.amountPaid)}
              </Text>
              <View style={styles.partialBar}>
                <View 
                  style={[
                    styles.partialFill,
                    { width: `${(invoice.amountPaid / invoice.total) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {/* Quick pay button for unpaid */}
        {!isPaid && invoice.status !== 'cancelled' && (
          <TouchableOpacity 
            style={styles.quickPayButton}
            onPress={() => handleMarkAsPaid(invoice.id)}
          >
            <Ionicons name="card-outline" size={20} color={MODERN_COLORS.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hóa Đơn & Thanh Toán</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="search-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      {renderStatsCard()}

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Invoice List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Không có hóa đơn nào</Text>
          </View>
        }
      />

      {/* Invoice Detail Modal */}
      <Modal
        visible={!!selectedInvoice}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvoice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết hóa đơn</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedInvoice && (
              <ScrollView style={styles.detailContent}>
                {/* Invoice Number & Status */}
                <View style={styles.detailHeader}>
                  <Text style={styles.detailNumber}>#{selectedInvoice.number}</Text>
                  <View style={[
                    styles.detailStatus,
                    { backgroundColor: (STATUS_CONFIG[selectedInvoice.status as keyof typeof STATUS_CONFIG]?.color || '#6B7280') + '20' }
                  ]}>
                    <Text style={[
                      styles.detailStatusText,
                      { color: STATUS_CONFIG[selectedInvoice.status as keyof typeof STATUS_CONFIG]?.color || '#6B7280' }
                    ]}>
                      {STATUS_CONFIG[selectedInvoice.status as keyof typeof STATUS_CONFIG]?.label || selectedInvoice.status}
                    </Text>
                  </View>
                </View>

                {/* Customer Info */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Khách hàng</Text>
                  <Text style={styles.detailCustomerName}>{selectedInvoice.customerName || 'N/A'}</Text>
                </View>

                {/* Project */}
                {selectedInvoice.projectName && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Dự án</Text>
                    <Text style={styles.detailValue}>{selectedInvoice.projectName}</Text>
                  </View>
                )}

                {/* Amounts */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Số tiền</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tổng cộng:</Text>
                    <Text style={styles.detailAmount}>{formatCurrency(selectedInvoice.total)}</Text>
                  </View>
                  
                  {selectedInvoice.amountPaid > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Đã thanh toán:</Text>
                      <Text style={[styles.detailAmount, { color: MODERN_COLORS.success }]}>
                        {formatCurrency(selectedInvoice.amountPaid)}
                      </Text>
                    </View>
                  )}
                  
                  {selectedInvoice.amountDue > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Còn lại:</Text>
                      <Text style={[styles.detailAmount, { color: MODERN_COLORS.warning }]}>
                        {formatCurrency(selectedInvoice.amountDue)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Dates */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Ngày tháng</Text>
                  
                  {selectedInvoice.date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Ngày lập:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedInvoice.date).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  )}
                  
                  {selectedInvoice.dueDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Hạn thanh toán:</Text>
                      <Text style={[
                        styles.detailValue,
                        selectedInvoice.status === 'overdue' && { color: MODERN_COLORS.danger }
                      ]}>
                        {new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                  <View style={styles.detailActions}>
                    <TouchableOpacity 
                      style={styles.payButton}
                      onPress={() => handleMarkAsPaid(selectedInvoice.id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <Text style={styles.payButtonText}>Đánh dấu đã thanh toán</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="download-outline" size={20} color={MODERN_COLORS.primary} />
                        <Text style={styles.actionButtonText}>Tải PDF</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={20} color={MODERN_COLORS.primary} />
                        <Text style={styles.actionButtonText}>Chia sẻ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    fontSize: 14,
    color: '#666',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: MODERN_SPACING.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginLeft: MODERN_SPACING.sm,
  },
  headerAction: {
    padding: MODERN_SPACING.xs,
  },

  // Stats Card
  statsCard: {
    backgroundColor: '#FFF',
    margin: MODERN_SPACING.md,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    ...MODERN_SHADOWS.md,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dataSourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dataSourceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  progressContainer: {
    marginTop: MODERN_SPACING.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },

  // Filter Tabs
  filterContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    gap: MODERN_SPACING.xs,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: MODERN_SPACING.xs,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  filterBadgeTextActive: {
    color: '#FFF',
  },

  // Invoice List
  listContent: {
    padding: MODERN_SPACING.md,
  },
  invoiceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: MODERN_RADIUS.md,
    marginBottom: MODERN_SPACING.sm,
    overflow: 'hidden',
    ...MODERN_SHADOWS.sm,
  },
  statusIndicator: {
    width: 4,
  },
  invoiceContent: {
    flex: 1,
    padding: MODERN_SPACING.md,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountInfo: {},
  amountLabel: {
    fontSize: 11,
    color: '#666',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  partialPayment: {
    marginTop: MODERN_SPACING.xs,
  },
  partialPaymentText: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
  },
  partialBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  partialFill: {
    height: '100%',
    backgroundColor: '#666666',
    borderRadius: 2,
  },
  quickPayButton: {
    padding: MODERN_SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },

  // Empty State
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: MODERN_SPACING.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: MODERN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  detailContent: {
    padding: MODERN_SPACING.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.lg,
  },
  detailNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  detailStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: MODERN_SPACING.lg,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: MODERN_SPACING.xs,
  },
  detailCustomerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: MODERN_SPACING.xs,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#111',
  },
  detailAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  detailActions: {
    marginTop: MODERN_SPACING.lg,
    gap: MODERN_SPACING.md,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MODERN_COLORS.success,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: MODERN_SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MODERN_COLORS.primary + '10',
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.xs,
  },
  actionButtonText: {
    color: MODERN_COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
