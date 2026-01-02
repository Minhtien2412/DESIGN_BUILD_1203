import { usePayrolls } from '@/hooks/useLabor';
import { PaymentMethod, PayrollStatus } from '@/types/labor';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_LABELS: Record<PayrollStatus, string> = {
  [PayrollStatus.DRAFT]: 'Nháp',
  [PayrollStatus.PENDING_APPROVAL]: 'Chờ duyệt',
  [PayrollStatus.APPROVED]: 'Đã duyệt',
  [PayrollStatus.PAID]: 'Đã thanh toán',
  [PayrollStatus.CANCELLED]: 'Đã hủy',
};

const STATUS_COLORS: Record<PayrollStatus, string> = {
  [PayrollStatus.DRAFT]: '#9E9E9E',
  [PayrollStatus.PENDING_APPROVAL]: '#FF9800',
  [PayrollStatus.APPROVED]: '#4CAF50',
  [PayrollStatus.PAID]: '#2196F3',
  [PayrollStatus.CANCELLED]: '#F44336',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Tiền mặt',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản',
  [PaymentMethod.CHECK]: 'Séc',
  [PaymentMethod.MOBILE_PAYMENT]: 'Ví điện tử',
};

export default function PayrollScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [statusFilter, setStatusFilter] = useState<PayrollStatus | 'ALL'>('ALL');
  const { payrolls, loading, approvePayroll, processPayment } = usePayrolls(
    projectId,
    statusFilter === 'ALL' ? undefined : statusFilter
  );

  const handleApprove = async (payrollId: string, workerName: string) => {
    Alert.alert('Duyệt lương', `Xác nhận duyệt bảng lương của "${workerName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Duyệt',
        onPress: async () => {
          try {
            await approvePayroll(payrollId, 'admin'); // Replace with actual user ID
            Alert.alert('Thành công', 'Đã duyệt bảng lương');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể duyệt bảng lương');
          }
        },
      },
    ]);
  };

  const handleProcessPayment = async (payrollId: string, workerName: string) => {
    Alert.prompt(
      'Thanh toán',
      `Nhập mã tham chiếu thanh toán cho "${workerName}":`,
      async (reference) => {
        if (reference && reference.trim()) {
          try {
            await processPayment(payrollId, new Date().toISOString(), reference.trim());
            Alert.alert('Thành công', 'Đã ghi nhận thanh toán');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xử lý thanh toán');
          }
        }
      }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const statusCounts = {
    ALL: payrolls.length,
    ...Object.values(PayrollStatus).reduce(
      (acc, status) => {
        acc[status] = payrolls.filter((p) => p.status === status).length;
        return acc;
      },
      {} as Record<PayrollStatus, number>
    ),
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
      <ScrollView horizontal style={styles.filterBar} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setStatusFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Tất cả ({statusCounts.ALL})
          </Text>
        </TouchableOpacity>

        {Object.values(PayrollStatus).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {STATUS_LABELS[status]} ({statusCounts[status]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView}>
        {payrolls.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {statusFilter === 'ALL' ? 'Chưa có bảng lương nào' : 'Không có bảng lương nào'}
            </Text>
            {statusFilter === 'ALL' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push(`/labor/create-payroll?projectId=${projectId}`)}
              >
                <Text style={styles.emptyButtonText}>Tạo bảng lương</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          payrolls.map((payroll) => (
            <View key={payroll.id} style={styles.payrollCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#2196F3" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.workerName}>
                      {payroll.worker?.fullName || 'N/A'}
                    </Text>
                    <Text style={styles.employeeId}>
                      {payroll.worker?.employeeId || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[payroll.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[payroll.status] },
                    ]}
                  >
                    {STATUS_LABELS[payroll.status]}
                  </Text>
                </View>
              </View>

              {/* Period */}
              <View style={styles.periodSection}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.periodText}>
                  Kỳ: {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                </Text>
              </View>

              {/* Hours */}
              <View style={styles.hoursSection}>
                <View style={styles.hoursRow}>
                  <View style={styles.hoursItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.hoursLabel}>Giờ thường:</Text>
                    <Text style={styles.hoursValue}>{payroll.regularHours}h</Text>
                  </View>
                  {payroll.overtimeHours > 0 && (
                    <View style={styles.hoursItem}>
                      <Ionicons name="alarm-outline" size={16} color="#FF9800" />
                      <Text style={styles.hoursLabel}>Tăng ca:</Text>
                      <Text style={[styles.hoursValue, { color: '#FF9800' }]}>
                        {payroll.overtimeHours}h
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Earnings */}
              <View style={styles.earningsSection}>
                <Text style={styles.sectionLabel}>Thu nhập</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Lương cơ bản:</Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(payroll.regularPay)}
                  </Text>
                </View>
                {payroll.overtimePay > 0 && (
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Lương tăng ca:</Text>
                    <Text style={styles.amountValue}>
                      {formatCurrency(payroll.overtimePay)}
                    </Text>
                  </View>
                )}
                {(payroll.bonuses ?? 0) > 0 && (
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Thưởng:</Text>
                    <Text style={styles.amountValue}>
                      {formatCurrency(payroll.bonuses ?? 0)}
                    </Text>
                  </View>
                )}
                {(payroll.allowances ?? 0) > 0 && (
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Phụ cấp:</Text>
                    <Text style={styles.amountValue}>
                      {formatCurrency(payroll.allowances ?? 0)}
                    </Text>
                  </View>
                )}
                <View style={[styles.amountRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Tổng thu nhập:</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(payroll.grossPay)}
                  </Text>
                </View>
              </View>

              {/* Deductions */}
              {payroll.totalDeductions > 0 && (
                <View style={styles.deductionsSection}>
                  <Text style={styles.sectionLabel}>Khấu trừ</Text>
                  {(payroll.taxes ?? 0) > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Thuế:</Text>
                      <Text style={styles.deductionValue}>
                        -{formatCurrency(payroll.taxes ?? 0)}
                      </Text>
                    </View>
                  )}
                  {(payroll.insurance ?? 0) > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Bảo hiểm:</Text>
                      <Text style={styles.deductionValue}>
                        -{formatCurrency(payroll.insurance ?? 0)}
                      </Text>
                    </View>
                  )}
                  {(payroll.advances ?? 0) > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Ứng trước:</Text>
                      <Text style={styles.deductionValue}>
                        -{formatCurrency(payroll.advances ?? 0)}
                      </Text>
                    </View>
                  )}
                  {(payroll.otherDeductions ?? 0) > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Khác:</Text>
                      <Text style={styles.deductionValue}>
                        -{formatCurrency(payroll.otherDeductions ?? 0)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.amountRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng khấu trừ:</Text>
                    <Text style={[styles.totalValue, { color: '#F44336' }]}>
                      -{formatCurrency(payroll.totalDeductions)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Net Pay */}
              <View style={styles.netPaySection}>
                <Text style={styles.netPayLabel}>Thực lãnh</Text>
                <Text style={styles.netPayValue}>{formatCurrency(payroll.netPay)}</Text>
              </View>

              {/* Payment Info */}
              {payroll.status === PayrollStatus.PAID && (
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentRow}>
                    <Ionicons name="card-outline" size={16} color="#2196F3" />
                    <Text style={styles.paymentText}>
                      {PAYMENT_METHOD_LABELS[payroll.paymentMethod!]}
                    </Text>
                  </View>
                  {payroll.paymentReference && (
                    <View style={styles.paymentRow}>
                      <Ionicons name="document-text-outline" size={16} color="#666" />
                      <Text style={styles.paymentText}>
                        Mã GD: {payroll.paymentReference}
                      </Text>
                    </View>
                  )}
                  {payroll.paymentDate && (
                    <View style={styles.paymentRow}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.paymentText}>
                        {formatDate(payroll.paymentDate)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Actions */}
              {payroll.status === PayrollStatus.PENDING_APPROVAL && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() =>
                      handleApprove(payroll.id, payroll.worker?.fullName || 'N/A')
                    }
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                    <Text style={styles.approveButtonText}>Duyệt</Text>
                  </TouchableOpacity>
                </View>
              )}

              {payroll.status === PayrollStatus.APPROVED && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={() =>
                      handleProcessPayment(payroll.id, payroll.worker?.fullName || 'N/A')
                    }
                  >
                    <Ionicons name="card-outline" size={16} color="#2196F3" />
                    <Text style={styles.paymentButtonText}>Thanh toán</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {payrolls.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/labor/create-payroll?projectId=${projectId}`)}
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
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
  payrollCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  employeeId: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  periodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  periodText: {
    fontSize: 13,
    color: '#666',
  },
  hoursSection: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
  },
  hoursRow: {
    flexDirection: 'row',
    gap: 16,
  },
  hoursItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursLabel: {
    fontSize: 12,
    color: '#666',
  },
  hoursValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  earningsSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    color: '#666',
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  deductionsSection: {
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deductionValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F44336',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  netPaySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 6,
  },
  netPayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
  },
  netPayValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  paymentInfo: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 12,
    color: '#388E3C',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 6,
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 6,
  },
  paymentButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
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
