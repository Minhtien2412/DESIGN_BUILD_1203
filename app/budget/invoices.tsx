import { useInvoices } from '@/hooks/useBudget';
import type { InvoiceStatus } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  DRAFT: {
    label: 'Nháp',
    color: '#9E9E9E',
    bgColor: '#F5F5F5',
    icon: 'document-outline',
  },
  SENT: {
    label: 'Đã gửi',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    icon: 'send',
  },
  VIEWED: {
    label: 'Đã xem',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: 'eye',
  },
  PAID: {
    label: 'Đã thanh toán',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    icon: 'checkmark-circle',
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: '#F44336',
    bgColor: '#FFEBEE',
    icon: 'alert-circle',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: '#607D8B',
    bgColor: '#ECEFF1',
    icon: 'close-circle',
  },
};

export default function InvoicesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { invoices, loading, deleteInvoice, sendInvoice } = useInvoices(projectId!);

  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'ALL'>('ALL');

  const filteredInvoices =
    filterStatus === 'ALL'
      ? invoices
      : invoices.filter((inv) => inv.status === filterStatus);

  const statusCounts = {
    ALL: invoices.length,
    DRAFT: invoices.filter((inv) => inv.status === 'DRAFT').length,
    SENT: invoices.filter((inv) => inv.status === 'SENT').length,
    VIEWED: invoices.filter((inv) => inv.status === 'VIEWED').length,
    PAID: invoices.filter((inv) => inv.status === 'PAID').length,
    OVERDUE: invoices.filter((inv) => inv.status === 'OVERDUE').length,
    CANCELLED: invoices.filter((inv) => inv.status === 'CANCELLED').length,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate: string, status: InvoiceStatus) => {
    if (status === 'PAID' || status === 'CANCELLED') return false;
    return new Date(dueDate) < new Date();
  };

  const handleSendInvoice = async (invoiceId: string, invoiceNumber: string) => {
    Alert.alert(
      'Gửi hóa đơn',
      `Xác nhận gửi hóa đơn ${invoiceNumber} cho khách hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: async () => {
            try {
              await sendInvoice(invoiceId);
              Alert.alert('Thành công', 'Đã gửi hóa đơn cho khách hàng');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể gửi hóa đơn');
            }
          },
        },
      ]
    );
  };

  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    Alert.alert(
      'Xóa hóa đơn',
      `Bạn có chắc muốn xóa hóa đơn ${invoiceNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvoice(invoiceId);
              Alert.alert('Thành công', 'Đã xóa hóa đơn');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa hóa đơn');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterStatus === 'ALL' && styles.filterChipActive,
          ]}
          onPress={() => setFilterStatus('ALL')}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === 'ALL' && styles.filterTextActive,
            ]}
          >
            Tất cả ({statusCounts.ALL})
          </Text>
        </TouchableOpacity>

        {(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'] as InvoiceStatus[]).map(
          (status) => {
            const config = STATUS_CONFIG[status];
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                  filterStatus === status && { backgroundColor: config.bgColor },
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterStatus === status && {
                      color: config.color,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {config.label} ({statusCounts[status]})
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </ScrollView>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tổng hóa đơn</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(
              invoices.reduce((sum, inv) => sum + inv.total, 0)
            )}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Đã thu</Text>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {formatCurrency(
              invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
            )}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Còn nợ</Text>
          <Text style={[styles.summaryValue, { color: '#F44336' }]}>
            {formatCurrency(
              invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0)
            )}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredInvoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {filterStatus === 'ALL'
                ? 'Chưa có hóa đơn nào'
                : `Không có hóa đơn ${STATUS_CONFIG[filterStatus as InvoiceStatus]?.label.toLowerCase()}`}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push(`/budget/create-invoice?projectId=${projectId}`)
              }
            >
              <Text style={styles.emptyButtonText}>Tạo hóa đơn đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredInvoices.map((invoice) => {
            const statusConfig = STATUS_CONFIG[invoice.status];
            const overdue = isOverdue(new Date(invoice.dueDate).toISOString(), invoice.status);
            const actualStatus = overdue && invoice.status !== 'PAID' ? 'OVERDUE' : invoice.status;
            const displayConfig = overdue ? STATUS_CONFIG.OVERDUE : statusConfig;

            return (
              <TouchableOpacity
                key={invoice.id}
                style={styles.invoiceCard}
                onPress={() => router.push(`/budget/invoice/${invoice.id}?projectId=${projectId}` as Href)}
              >
                {/* Header */}
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceLeft}>
                    <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                    <Text style={styles.clientName}>{invoice.clientName}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: displayConfig.bgColor },
                    ]}
                  >
                    <Ionicons
                      name={displayConfig.icon as any}
                      size={14}
                      color={displayConfig.color}
                    />
                    <Text style={[styles.statusText, { color: displayConfig.color }]}>
                      {displayConfig.label}
                    </Text>
                  </View>
                </View>

                {/* Amounts */}
                <View style={styles.amountsRow}>
                  <View style={styles.amountBlock}>
                    <Text style={styles.amountLabel}>Tổng tiền</Text>
                    <Text style={styles.totalAmount}>
                      {formatCurrency(invoice.total)}
                    </Text>
                  </View>

                  {invoice.paidAmount > 0 && (
                    <View style={styles.amountBlock}>
                      <Text style={styles.amountLabel}>Đã thanh toán</Text>
                      <Text style={[styles.paidAmount]}>
                        {formatCurrency(invoice.paidAmount)}
                      </Text>
                    </View>
                  )}

                  {invoice.remainingAmount > 0 && (
                    <View style={styles.amountBlock}>
                      <Text style={styles.amountLabel}>Còn lại</Text>
                      <Text style={styles.remainingAmount}>
                        {formatCurrency(invoice.remainingAmount)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Dates */}
                <View style={styles.datesRow}>
                  <View style={styles.dateItem}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.dateText}>
                      Ngày: {formatDate(new Date(invoice.issueDate).toISOString())}
                    </Text>
                  </View>

                  <View style={styles.dateItem}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={overdue ? '#F44336' : '#666'}
                    />
                    <Text
                      style={[
                        styles.dateText,
                        overdue && { color: '#F44336', fontWeight: '600' },
                      ]}
                    >
                      Hạn: {formatDate(new Date(invoice.dueDate).toISOString())}
                    </Text>
                  </View>
                </View>

                {/* Items Count */}
                <View style={styles.itemsRow}>
                  <Ionicons name="list-outline" size={14} color="#999" />
                  <Text style={styles.itemsText}>
                    {invoice.items.length} mục hàng
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  {invoice.status === 'DRAFT' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.sendButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSendInvoice(invoice.id, invoice.invoiceNumber);
                      }}
                    >
                      <Ionicons name="send" size={14} color="#fff" />
                      <Text style={styles.actionButtonText}>Gửi</Text>
                    </TouchableOpacity>
                  )}

                  {(invoice.status === 'SENT' || invoice.status === 'VIEWED' || invoice.status === 'OVERDUE') && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.paymentButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/budget/invoice/${invoice.id}?projectId=${projectId}&action=payment` as Href);
                      }}
                    >
                      <Ionicons name="cash" size={14} color="#fff" />
                      <Text style={styles.actionButtonText}>Ghi nhận TT</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/budget/invoice/${invoice.id}?projectId=${projectId}` as Href);
                    }}
                  >
                    <Ionicons name="eye-outline" size={14} color="#2196F3" />
                    <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>
                      Chi tiết
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteInvoice(invoice.id, invoice.invoiceNumber);
                    }}
                  >
                    <Ionicons name="trash-outline" size={14} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      {invoices.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push(`/budget/create-invoice?projectId=${projectId}`)
          }
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContent: {
    padding: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#E3F2FD',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
  },
  filterTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  invoiceCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceLeft: {
    flex: 1,
    gap: 4,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clientName: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  amountBlock: {
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    color: '#999',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  remainingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemsText: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    flex: 1,
    justifyContent: 'center',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingHorizontal: 10,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
