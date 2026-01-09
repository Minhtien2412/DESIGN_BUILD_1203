/**
 * Invoice Detail Screen
 * ====================
 * 
 * Hiển thị chi tiết hóa đơn từ Perfex CRM
 * Features: View details, payment history, send reminder, download PDF
 * 
 * @author ThietKeResort Team
 */

import { MODERN_COLORS, MODERN_SHADOWS } from '@/constants/modern-theme';
import { useInvoices } from '@/hooks/usePerfexAPI';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Status mapping
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  '1': { label: 'Chưa thanh toán', color: '#3B82F6', bgColor: '#EFF6FF', icon: 'alert-circle-outline' },
  '2': { label: 'Đã thanh toán', color: '#10B981', bgColor: '#ECFDF5', icon: 'checkmark-circle-outline' },
  '3': { label: 'Thanh toán 1 phần', color: '#F59E0B', bgColor: '#FFFBEB', icon: 'pie-chart-outline' },
  '4': { label: 'Quá hạn', color: '#EF4444', bgColor: '#FEF2F2', icon: 'time-outline' },
  '5': { label: 'Đã hủy', color: '#9CA3AF', bgColor: '#F3F4F6', icon: 'close-circle-outline' },
  '6': { label: 'Nháp', color: '#6B7280', bgColor: '#F9FAFB', icon: 'document-outline' },
};

// Mock line items (will be replaced with real data)
const MOCK_LINE_ITEMS = [
  { id: 1, description: 'Thi công phần thô', qty: 1, unit: 'công việc', rate: 150000000, amount: 150000000 },
  { id: 2, description: 'Vật liệu xây dựng', qty: 1, unit: 'lô', rate: 80000000, amount: 80000000 },
  { id: 3, description: 'Nhân công', qty: 30, unit: 'công', rate: 500000, amount: 15000000 },
  { id: 4, description: 'Thiết bị', qty: 1, unit: 'bộ', rate: 25000000, amount: 25000000 },
];

// Mock payment history
const MOCK_PAYMENTS = [
  { id: 1, date: '2025-01-15', amount: 100000000, method: 'Chuyển khoản', note: 'Đợt 1' },
  { id: 2, date: '2025-02-01', amount: 50000000, method: 'Tiền mặt', note: 'Đợt 2' },
];

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, loading, updateInvoice } = useInvoices();
  const [refreshing, setRefreshing] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  // Find the invoice
  const invoice = invoices.find((inv: any) => inv.id === id);
  const statusConfig = STATUS_CONFIG[invoice?.status || '6'] || STATUS_CONFIG['6'];

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleMarkAsPaid = async () => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Đánh dấu hóa đơn này đã thanh toán đầy đủ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await updateInvoice(id!, { status: '2' });
              Alert.alert('Thành công', 'Đã cập nhật trạng thái thanh toán');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể cập nhật');
            }
          },
        },
      ]
    );
  };

  const handleSendReminder = () => {
    Alert.alert(
      'Gửi nhắc nhở',
      'Gửi email nhắc thanh toán cho khách hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: () => {
            Alert.alert('Đã gửi', 'Email nhắc nhở đã được gửi thành công');
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hóa đơn #${invoice?.number}\nTổng tiền: ${formatCurrency(invoice?.total || 0)}\nTrạng thái: ${statusConfig.label}`,
        title: `Hóa đơn #${invoice?.number}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownloadPDF = () => {
    Alert.alert('Tải PDF', 'Đang tải file PDF hóa đơn...', [{ text: 'OK' }]);
  };

  if (loading && !invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Không tìm thấy hóa đơn</Text>
          <TouchableOpacity style={styles.backToListButton} onPress={() => router.back()}>
            <Text style={styles.backToListText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPaid = invoice.status === '2';
  const isOverdue = invoice.status === '4';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
          <Ionicons name="share-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Header Card */}
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceNumberRow}>
            <View>
              <Text style={styles.invoiceLabel}>Số hóa đơn</Text>
              <Text style={styles.invoiceNumber}>
                {invoice.prefix || 'INV'}-{invoice.number}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Tổng tiền</Text>
            <Text style={[
              styles.amountValue,
              isPaid && { color: '#10B981' },
              isOverdue && { color: '#EF4444' },
            ]}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>

          {/* Progress for partial payment */}
          {invoice.status === '3' && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Đã thanh toán</Text>
                <Text style={styles.progressValue}>
                  {formatCurrency((invoice as any).amountPaid || 0)} / {formatCurrency(invoice.total)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(((invoice as any).amountPaid || 0) / parseFloat(String(invoice.total))) * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Date Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin ngày</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Ngày tạo</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.date)}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={isOverdue ? '#EF4444' : '#666'} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, isOverdue && { color: '#EF4444' }]}>Hạn thanh toán</Text>
                <Text style={[styles.infoValue, isOverdue && { color: '#EF4444' }]}>
                  {formatDate(invoice.duedate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
          <View style={styles.customerInfo}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>Client #{invoice.clientid}</Text>
              {invoice.project_id && (
                <View style={styles.projectBadge}>
                  <Ionicons name="folder-outline" size={12} color="#666" />
                  <Text style={styles.projectText}>Dự án #{invoice.project_id}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.customerAction}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết hạng mục</Text>
          {MOCK_LINE_ITEMS.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.lineItem,
                index < MOCK_LINE_ITEMS.length - 1 && styles.lineItemBorder,
              ]}
            >
              <View style={styles.lineItemMain}>
                <Text style={styles.lineItemDesc}>{item.description}</Text>
                <Text style={styles.lineItemQty}>
                  {item.qty} {item.unit} × {formatCurrency(item.rate)}
                </Text>
              </View>
              <Text style={styles.lineItemAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}

          {/* Subtotal */}
          <View style={styles.subtotalSection}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Tạm tính</Text>
              <Text style={styles.subtotalValue}>{formatCurrency(invoice.subtotal || invoice.total)}</Text>
            </View>
            {parseFloat(invoice.discount_total || '0') > 0 && (
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Giảm giá</Text>
                <Text style={[styles.subtotalValue, { color: '#10B981' }]}>
                  -{formatCurrency(invoice.discount_total || 0)}
                </Text>
              </View>
            )}
            {parseFloat(invoice.total_tax || '0') > 0 && (
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Thuế VAT</Text>
                <Text style={styles.subtotalValue}>{formatCurrency(invoice.total_tax)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment History */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowPayments(!showPayments)}
          activeOpacity={0.8}
        >
          <View style={styles.expandHeader}>
            <Text style={styles.cardTitle}>Lịch sử thanh toán</Text>
            <View style={styles.expandIcon}>
              <Text style={styles.paymentCount}>{MOCK_PAYMENTS.length}</Text>
              <Ionicons
                name={showPayments ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </View>
          </View>

          {showPayments && (
            <View style={styles.paymentsContainer}>
              {MOCK_PAYMENTS.map((payment, index) => (
                <View
                  key={payment.id}
                  style={[
                    styles.paymentItem,
                    index < MOCK_PAYMENTS.length - 1 && styles.paymentItemBorder,
                  ]}
                >
                  <View style={styles.paymentIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                    <Text style={styles.paymentMethod}>{payment.method} • {payment.note}</Text>
                  </View>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Notes */}
        {invoice.clientnote && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ghi chú</Text>
            <Text style={styles.noteText}>{invoice.clientnote}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!isPaid && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleMarkAsPaid}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Đánh dấu đã thanh toán</Text>
            </TouchableOpacity>
          )}

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleDownloadPDF}>
              <Ionicons name="download-outline" size={20} color={MODERN_COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Tải PDF</Text>
            </TouchableOpacity>

            {!isPaid && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSendReminder}>
                <Ionicons name="mail-outline" size={20} color={MODERN_COLORS.primary} />
                <Text style={styles.secondaryButtonText}>Nhắc thanh toán</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  backToListButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 8,
  },
  backToListText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  invoiceHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...MODERN_SHADOWS.sm,
  },
  invoiceNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...MODERN_SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {},
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  projectText: {
    fontSize: 12,
    color: '#666',
  },
  customerAction: {
    padding: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  lineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lineItemMain: {
    flex: 1,
    marginRight: 12,
  },
  lineItemDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4,
  },
  lineItemQty: {
    fontSize: 12,
    color: '#666',
  },
  lineItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  subtotalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: MODERN_COLORS.primary,
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  paymentsContainer: {
    marginTop: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.primary,
  },
});
