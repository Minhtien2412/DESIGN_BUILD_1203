import { useWorkers } from '@/hooks/useLabor';
import { WorkerRole, WorkerStatus } from '@/types/labor';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ROLE_LABELS: Record<WorkerRole, string> = {
  [WorkerRole.FOREMAN]: 'Đốc công',
  [WorkerRole.SKILLED_WORKER]: 'Thợ chính',
  [WorkerRole.UNSKILLED_WORKER]: 'Phụ hồ',
  [WorkerRole.EQUIPMENT_OPERATOR]: 'Vận hành máy',
  [WorkerRole.ELECTRICIAN]: 'Thợ điện',
  [WorkerRole.PLUMBER]: 'Thợ nước',
  [WorkerRole.CARPENTER]: 'Thợ mộc',
  [WorkerRole.MASON]: 'Thợ nề',
  [WorkerRole.PAINTER]: 'Thợ sơn',
  [WorkerRole.WELDER]: 'Thợ hàn',
  [WorkerRole.SAFETY_OFFICER]: 'An toàn',
  [WorkerRole.ENGINEER]: 'Kỹ sư',
  [WorkerRole.SUPERVISOR]: 'Giám sát',
  [WorkerRole.OTHER]: 'Khác',
};

const STATUS_LABELS: Record<WorkerStatus, string> = {
  [WorkerStatus.ACTIVE]: 'Đang làm',
  [WorkerStatus.INACTIVE]: 'Nghỉ việc',
  [WorkerStatus.ON_LEAVE]: 'Nghỉ phép',
  [WorkerStatus.SUSPENDED]: 'Tạm ngưng',
  [WorkerStatus.TERMINATED]: 'Thôi việc',
};

const STATUS_COLORS: Record<WorkerStatus, string> = {
  [WorkerStatus.ACTIVE]: '#4CAF50',
  [WorkerStatus.INACTIVE]: '#9E9E9E',
  [WorkerStatus.ON_LEAVE]: '#FF9800',
  [WorkerStatus.SUSPENDED]: '#F44336',
  [WorkerStatus.TERMINATED]: '#4A4A4A',
};

export default function WorkersScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { workers, loading, deleteWorker } = useWorkers(projectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<WorkerRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | 'ALL'>('ALL');

  const handleDelete = async (workerId: string, workerName: string) => {
    Alert.alert('Xóa nhân công', `Bạn có chắc muốn xóa "${workerName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWorker(workerId);
            Alert.alert('Thành công', 'Đã xóa nhân công');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa nhân công');
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      searchQuery === '' ||
      worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phoneNumber.includes(searchQuery);

    const matchesRole = roleFilter === 'ALL' || worker.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || worker.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleCounts = {
    ALL: workers.length,
    ...Object.values(WorkerRole).reduce(
      (acc, role) => {
        acc[role] = workers.filter((w) => w.role === role).length;
        return acc;
      },
      {} as Record<WorkerRole, number>
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
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, mã NV, SĐT..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
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
            Tất cả ({workers.length})
          </Text>
        </TouchableOpacity>

        {Object.values(WorkerStatus).map((status) => (
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
              {STATUS_LABELS[status]} ({workers.filter((w) => w.status === status).length})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Role Filter */}
      <ScrollView horizontal style={styles.filterBar} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterChip, roleFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setRoleFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              roleFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Tất cả ({roleCounts.ALL})
          </Text>
        </TouchableOpacity>

        {Object.values(WorkerRole).map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.filterChip, roleFilter === role && styles.filterChipActive]}
            onPress={() => setRoleFilter(role)}
          >
            <Text
              style={[
                styles.filterChipText,
                roleFilter === role && styles.filterChipTextActive,
              ]}
            >
              {ROLE_LABELS[role]} ({roleCounts[role]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView}>
        {filteredWorkers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Không tìm thấy nhân công nào'
                : 'Chưa có nhân công nào'}
            </Text>
            {workers.length === 0 && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push(`/labor/create-worker?projectId=${projectId}`)}
              >
                <Text style={styles.emptyButtonText}>Thêm nhân công đầu tiên</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredWorkers.map((worker) => (
            <View key={worker.id} style={styles.workerCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#2196F3" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.workerName}>{worker.fullName}</Text>
                    <Text style={styles.employeeId}>Mã NV: {worker.employeeId}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[worker.status] + '20' },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: STATUS_COLORS[worker.status] }]}
                  >
                    {STATUS_LABELS[worker.status]}
                  </Text>
                </View>
              </View>

              {/* Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="build-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{ROLE_LABELS[worker.role]}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{worker.phoneNumber}</Text>
                </View>

                {worker.email && (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{worker.email}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {formatCurrency(worker.hourlyRate)}/giờ
                  </Text>
                </View>

                {worker.skills && worker.skills.length > 0 && (
                  <View style={styles.skillsRow}>
                    <Ionicons name="ribbon-outline" size={16} color="#666" />
                    <View style={styles.skillsContainer}>
                      {worker.skills.slice(0, 3).map((skill, idx) => (
                        <View key={idx} style={styles.skillChip}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                      {worker.skills.length > 3 && (
                        <Text style={styles.moreSkills}>+{worker.skills.length - 3}</Text>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    router.push(
                      `/labor/worker-detail?workerId=${worker.id}&projectId=${projectId}` as Href
                    )
                  }
                >
                  <Ionicons name="eye-outline" size={16} color="#2196F3" />
                  <Text style={styles.viewButtonText}>Chi tiết</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(worker.id, worker.fullName)}
                >
                  <Ionicons name="trash-outline" size={16} color="#F44336" />
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {filteredWorkers.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/labor/create-worker?projectId=${projectId}`)}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
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
  workerCard: {
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
  skillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#E3F2FD',
  },
  skillText: {
    fontSize: 11,
    color: '#2196F3',
  },
  moreSkills: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
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
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F44336',
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
