import { useExpenses } from '@/hooks/useBudget';
import type { BudgetCategory, ExpenseStatus } from '@/types/budget';
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

const STATUS_CONFIG: Record<
  ExpenseStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: 'time',
  },
  APPROVED: {
    label: 'Đã duyệt',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    icon: 'checkmark-circle',
  },
  REJECTED: {
    label: 'Từ chối',
    color: '#F44336',
    bgColor: '#FFEBEE',
    icon: 'close-circle',
  },
  PAID: {
    label: 'Đã thanh toán',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    icon: 'cash',
  },
};

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  LABOR: 'Nhân công',
  MATERIALS: 'Vật liệu',
  EQUIPMENT: 'Thiết bị',
  SUBCONTRACTOR: 'Thầu phụ',
  PERMITS: 'Giấy phép',
  UTILITIES: 'Tiện ích',
  INSURANCE: 'Bảo hiểm',
  OVERHEAD: 'Chi phí chung',
  CONTINGENCY: 'Dự phòng',
  OTHER: 'Khác',
};

export default function ExpensesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const {
    expenses,
    loading,
    approveExpense,
    rejectExpense,
    deleteExpense,
  } = useExpenses(projectId!);

  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | 'ALL'>('ALL');

  const filteredExpenses =
    filterStatus === 'ALL'
      ? expenses
      : expenses.filter((e) => e.status === filterStatus);

  const statusCounts = {
    ALL: expenses.length,
    PENDING: expenses.filter((e) => e.status === 'PENDING').length,
    APPROVED: expenses.filter((e) => e.status === 'APPROVED').length,
    REJECTED: expenses.filter((e) => e.status === 'REJECTED').length,
    PAID: expenses.filter((e) => e.status === 'PAID').length,
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

  const handleApprove = async (expenseId: string, expenseName: string) => {
    Alert.alert('Duyệt chi tiêu', `Xác nhận duyệt chi tiêu "${expenseName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Duyệt',
        style: 'default',
        onPress: async () => {
          try {
            await approveExpense(expenseId);
            Alert.alert('Thành công', 'Đã duyệt chi tiêu');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể duyệt chi tiêu');
          }
        },
      },
    ]);
  };

  const handleReject = async (expenseId: string, expenseName: string) => {
    Alert.prompt(
      'Từ chối chi tiêu',
      `Nhập lý do từ chối chi tiêu "${expenseName}"`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async (reason?: string) => {
            if (!reason || reason.trim().length === 0) {
              Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
              return;
            }
            try {
              await rejectExpense(expenseId, reason.trim());
              Alert.alert('Thành công', 'Đã từ chối chi tiêu');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối chi tiêu');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDelete = async (expenseId: string, expenseName: string) => {
    Alert.alert(
      'Xóa chi tiêu',
      `Bạn có chắc muốn xóa chi tiêu "${expenseName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              Alert.alert('Thành công', 'Đã xóa chi tiêu');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa chi tiêu');
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

        {(['PENDING', 'APPROVED', 'REJECTED', 'PAID'] as ExpenseStatus[]).map(
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

      {/* Info Card for Pending Expenses */}
      {filterStatus === 'PENDING' && statusCounts.PENDING > 0 && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color="#FF9800" />
          <Text style={styles.infoText}>
            Có {statusCounts.PENDING} chi tiêu đang chờ duyệt. Vui lòng xem xét và
            phê duyệt hoặc từ chối.
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {filterStatus === 'ALL'
                ? 'Chưa có chi tiêu nào'
                : `Không có chi tiêu ${STATUS_CONFIG[filterStatus as ExpenseStatus]?.label.toLowerCase()}`}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push(`/budget/create-expense?projectId=${projectId}`)
              }
            >
              <Text style={styles.emptyButtonText}>Thêm chi tiêu đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredExpenses.map((expense) => {
            const statusConfig = STATUS_CONFIG[expense.status];
            return (
              <View key={expense.id} style={styles.expenseCard}>
                {/* Header */}
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseLeft}>
                    <Text style={styles.expenseName} numberOfLines={1}>
                      {expense.description}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {expense.category
                          ? CATEGORY_LABELS[expense.category]
                          : 'Không xác định'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig.bgColor },
                    ]}
                  >
                    <Ionicons
                      name={statusConfig.icon as any}
                      size={14}
                      color={statusConfig.color}
                    />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* Amount and Date */}
                <View style={styles.expenseDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.amountText}>
                      {formatCurrency(expense.amount)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{formatDate(expense.date.toString())}</Text>
                  </View>
                </View>

                {/* Vendor and Payment Method */}
                {expense.vendor && (
                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{expense.vendor}</Text>
                  </View>
                )}

                {expense.paymentMethod && (
                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {expense.paymentMethod === 'CASH'
                        ? 'Tiền mặt'
                        : expense.paymentMethod === 'BANK_TRANSFER'
                        ? 'Chuyển khoản'
                        : expense.paymentMethod === 'CHECK'
                        ? 'Séc'
                        : expense.paymentMethod === 'CREDIT_CARD'
                        ? 'Thẻ tín dụng'
                        : 'Ví điện tử'}
                    </Text>
                  </View>
                )}

                {/* Receipt */}
                {expense.receiptUrl && (
                  <TouchableOpacity style={styles.receiptButton}>
                    <Ionicons name="document-attach" size={16} color="#2196F3" />
                    <Text style={styles.receiptText}>Xem hóa đơn đính kèm</Text>
                  </TouchableOpacity>
                )}

                {/* Rejection Reason */}
                {expense.status === 'REJECTED' && expense.rejectionReason && (
                  <View style={styles.rejectionBox}>
                    <Ionicons name="alert-circle" size={14} color="#F44336" />
                    <Text style={styles.rejectionText}>
                      Lý do từ chối: {expense.rejectionReason}
                    </Text>
                  </View>
                )}

                {/* Approval Info */}
                {expense.approvedBy && expense.approvedAt && (
                  <View style={styles.approvalInfo}>
                    <Ionicons name="person-circle-outline" size={14} color="#666" />
                    <Text style={styles.approvalText}>
                      Duyệt bởi {expense.approvedBy as any} -{' '}
                      {formatDate(expense.approvedAt?.toString() || '')}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                  {expense.status === 'PENDING' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(expense.id, expense.description)}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Duyệt</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(expense.id, expense.description)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Từ chối</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(expense.id, expense.description)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      {expenses.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push(`/budget/create-expense?projectId=${projectId}`)
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 12,
    margin: 12,
    marginBottom: 0,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#E65100',
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
  expenseCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  expenseLeft: {
    flex: 1,
    gap: 6,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
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
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  receiptText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
  },
  rejectionText: {
    flex: 1,
    fontSize: 12,
    color: '#C62828',
  },
  approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  approvalText: {
    fontSize: 11,
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
  approveButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#F44336',
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
