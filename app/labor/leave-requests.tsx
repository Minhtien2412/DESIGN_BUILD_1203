import { useLeaveRequests } from '@/hooks/useLabor';
import { LeaveStatus, LeaveType } from '@/types/labor';
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

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Nghỉ phép năm',
  [LeaveType.SICK]: 'Nghỉ ốm',
  [LeaveType.PERSONAL]: 'Nghỉ cá nhân',
  [LeaveType.MATERNITY]: 'Nghỉ thai sản',
  [LeaveType.PATERNITY]: 'Nghỉ thai sản (bố)',
  [LeaveType.UNPAID]: 'Nghỉ không lương',
  [LeaveType.EMERGENCY]: 'Nghỉ khẩn cấp',
  [LeaveType.OTHER]: 'Khác',
};

const STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'Chờ duyệt',
  [LeaveStatus.APPROVED]: 'Đã duyệt',
  [LeaveStatus.REJECTED]: 'Từ chối',
  [LeaveStatus.CANCELLED]: 'Đã hủy',
};

const STATUS_COLORS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: '#0D9488',
  [LeaveStatus.APPROVED]: '#0D9488',
  [LeaveStatus.REJECTED]: '#000000',
  [LeaveStatus.CANCELLED]: '#999999',
};

export default function LeaveRequestsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const {
    leaveRequests,
    loading,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
  } = useLeaveRequests(projectId, statusFilter === 'ALL' ? undefined : statusFilter);

  const handleApprove = async (requestId: string, workerName: string) => {
    Alert.alert('Duyệt đơn', `Xác nhận duyệt đơn nghỉ phép của "${workerName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Duyệt',
        onPress: async () => {
          try {
            await approveLeaveRequest(requestId, 'admin'); // Replace with actual user ID
            Alert.alert('Thành công', 'Đã duyệt đơn nghỉ phép');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể duyệt đơn');
          }
        },
      },
    ]);
  };

  const handleReject = async (requestId: string, workerName: string) => {
    Alert.prompt(
      'Từ chối đơn',
      `Nhập lý do từ chối đơn của "${workerName}":`,
      async (reason) => {
        if (reason && reason.trim()) {
          try {
            await rejectLeaveRequest(requestId, reason.trim());
            Alert.alert('Thành công', 'Đã từ chối đơn');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể từ chối đơn');
          }
        }
      }
    );
  };

  const handleCancel = async (requestId: string, workerName: string) => {
    Alert.alert('Hủy đơn', `Xác nhận hủy đơn nghỉ phép của "${workerName}"?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelLeaveRequest(requestId);
            Alert.alert('Thành công', 'Đã hủy đơn');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể hủy đơn');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const statusCounts = {
    ALL: leaveRequests.length,
    ...Object.values(LeaveStatus).reduce(
      (acc, status) => {
        acc[status] = leaveRequests.filter((r) => r.status === status).length;
        return acc;
      },
      {} as Record<LeaveStatus, number>
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

        {Object.values(LeaveStatus).map((status) => (
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
        {leaveRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {statusFilter === 'ALL' ? 'Chưa có đơn nghỉ phép nào' : 'Không có đơn nào'}
            </Text>
            {statusFilter === 'ALL' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() =>
                  router.push(`/labor/create-leave-request?projectId=${projectId}`)
                }
              >
                <Text style={styles.emptyButtonText}>Tạo đơn nghỉ phép</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          leaveRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#0D9488" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.workerName}>
                      {request.worker?.fullName || 'N/A'}
                    </Text>
                    <Text style={styles.employeeId}>
                      {request.worker?.employeeId || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[request.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[request.status] },
                    ]}
                  >
                    {STATUS_LABELS[request.status]}
                  </Text>
                </View>
              </View>

              {/* Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {LEAVE_TYPE_LABELS[request.leaveType]}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.totalDays} ngày</Text>
                </View>

                <View style={styles.reasonSection}>
                  <Text style={styles.reasonLabel}>Lý do:</Text>
                  <Text style={styles.reasonText}>{request.reason}</Text>
                </View>

                {request.rejectionReason && (
                  <View style={styles.rejectionSection}>
                    <Text style={styles.rejectionLabel}>Lý do từ chối:</Text>
                    <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              {request.status === LeaveStatus.PENDING && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() =>
                      handleApprove(request.id, request.worker?.fullName || 'N/A')
                    }
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#0D9488" />
                    <Text style={styles.approveButtonText}>Duyệt</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() =>
                      handleReject(request.id, request.worker?.fullName || 'N/A')
                    }
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#000000" />
                    <Text style={styles.rejectButtonText}>Từ chối</Text>
                  </TouchableOpacity>
                </View>
              )}

              {(request.status === LeaveStatus.APPROVED ||
                request.status === LeaveStatus.PENDING) && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() =>
                      handleCancel(request.id, request.worker?.fullName || 'N/A')
                    }
                  >
                    <Ionicons name="trash-outline" size={16} color="#666" />
                    <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {leaveRequests.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/labor/create-leave-request?projectId=${projectId}`)}
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
    backgroundColor: '#0D9488',
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
    backgroundColor: '#0D9488',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  requestCard: {
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
    backgroundColor: '#F0FDFA',
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
  infoSection: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  reasonSection: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#333',
  },
  rejectionSection: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    color: '#D32F2F',
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
    borderColor: '#0D9488',
    borderRadius: 6,
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
