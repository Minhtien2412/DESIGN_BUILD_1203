import { useMilestones, useMilestoneStats } from '@/hooks/useContracts';
import type { MilestoneStatus } from '@/types/contracts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
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
  MilestoneStatus,
  { label: string; color: string; icon: string }
> = {
  PENDING: { label: 'Chờ thực hiện', color: '#9E9E9E', icon: 'ellipse-outline' },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    color: '#2196F3',
    icon: 'hourglass-outline',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: '#4CAF50',
    icon: 'checkmark-circle',
  },
  PAID: { label: 'Đã thanh toán', color: '#00BCD4', icon: 'cash' },
  OVERDUE: { label: 'Quá hạn', color: '#F44336', icon: 'alert-circle' },
};

export default function MilestonesScreen() {
  const { id: contractId } = useLocalSearchParams<{ id: string }>();
  const { milestones, loading, completeMilestone } = useMilestones(contractId!);
  const { stats } = useMilestoneStats(contractId!);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCompleteMilestone = (milestoneId: string) => {
    Alert.prompt(
      'Hoàn thành cột mốc',
      'Nhập ghi chú (nếu có):',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async (notes?: string) => {
            try {
              await completeMilestone(milestoneId, notes);
              Alert.alert('Thành công', 'Cột mốc đã được đánh dấu hoàn thành');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hoàn thành cột mốc');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handlePayment = (milestoneId: string) => {
    Alert.alert(
      'Thanh toán',
      'Tính năng thanh toán sẽ được tích hợp trong Task #46 - Payment Gateway Integration',
      [{ text: 'OK' }]
    );
  };

  const handleAddMilestone = () => {
    Alert.alert(
      'Thêm cột mốc',
      'Tính năng thêm cột mốc sẽ được triển khai sau',
      [{ text: 'OK' }]
    );
  };

  const isOverdue = (dueDate: Date, status: MilestoneStatus) => {
    return (
      (status === 'PENDING' || status === 'IN_PROGRESS') &&
      new Date(dueDate) < new Date()
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
      <ScrollView style={styles.scrollView}>
        {/* Stats Header */}
        {stats && (
          <View style={styles.statsSection}>
            <View style={styles.statsHeader}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.completionRate.toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Tỷ lệ hoàn thành</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                  {formatCurrency(stats.paidValue)}
                </Text>
                <Text style={styles.statLabel}>Đã thanh toán</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${stats.completionRate}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {stats.completed}/{stats.total} cột mốc
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.miniStat}>
                <Ionicons name="ellipse-outline" size={16} color="#9E9E9E" />
                <Text style={styles.miniStatText}>{stats.pending} Chờ</Text>
              </View>
              <View style={styles.miniStat}>
                <Ionicons name="hourglass-outline" size={16} color="#2196F3" />
                <Text style={styles.miniStatText}>{stats.inProgress} Đang làm</Text>
              </View>
              <View style={styles.miniStat}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.miniStatText}>{stats.completed} Hoàn thành</Text>
              </View>
              <View style={styles.miniStat}>
                <Ionicons name="alert-circle" size={16} color="#F44336" />
                <Text style={styles.miniStatText}>{stats.overdue} Quá hạn</Text>
              </View>
            </View>
          </View>
        )}

        {/* Milestones List */}
        <View style={styles.milestonesSection}>
          {milestones.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có cột mốc nào</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddMilestone}>
                <Text style={styles.addButtonText}>Thêm cột mốc đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            milestones
              .sort((a, b) => a.order - b.order)
              .map((milestone, index) => {
                const isExpanded = expandedId === milestone.id;
                const statusConfig = STATUS_CONFIG[milestone.status];
                const overdue = isOverdue(milestone.dueDate, milestone.status);
                const displayStatus = overdue ? 'OVERDUE' : milestone.status;
                const displayConfig = overdue ? STATUS_CONFIG.OVERDUE : statusConfig;

                return (
                  <View key={milestone.id} style={styles.milestoneCard}>
                    <TouchableOpacity
                      style={styles.milestoneHeader}
                      onPress={() => handleToggleExpand(milestone.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.milestoneLeft}>
                        <View
                          style={[
                            styles.milestoneOrder,
                            { backgroundColor: displayConfig.color },
                          ]}
                        >
                          <Text style={styles.milestoneOrderText}>
                            {milestone.order}
                          </Text>
                        </View>
                        <View style={styles.milestoneInfo}>
                          <Text style={styles.milestoneName}>{milestone.name}</Text>
                          <View style={styles.milestoneMetaRow}>
                            <Ionicons name="calendar-outline" size={14} color="#666" />
                            <Text style={styles.milestoneMetaText}>
                              {formatDate(milestone.dueDate)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.milestoneRight}>
                        <Text style={styles.milestoneValue}>
                          {formatCurrency(milestone.value)}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: displayConfig.color + '20' },
                          ]}
                        >
                          <Ionicons
                            name={displayConfig.icon as any}
                            size={12}
                            color={displayConfig.color}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: displayConfig.color },
                            ]}
                          >
                            {displayConfig.label}
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#999"
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.milestoneBody}>
                        <Text style={styles.milestoneDescription}>
                          {milestone.description}
                        </Text>

                        {milestone.requirements.length > 0 && (
                          <View style={styles.section}>
                            <Text style={styles.subsectionTitle}>Yêu cầu:</Text>
                            {milestone.requirements.map((req, idx) => (
                              <View key={idx} style={styles.listItem}>
                                <Ionicons
                                  name="checkmark-circle-outline"
                                  size={16}
                                  color="#666"
                                />
                                <Text style={styles.listItemText}>{req}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {milestone.deliverables.length > 0 && (
                          <View style={styles.section}>
                            <Text style={styles.subsectionTitle}>Sản phẩm bàn giao:</Text>
                            {milestone.deliverables.map((del, idx) => (
                              <View key={idx} style={styles.listItem}>
                                <Ionicons name="document-outline" size={16} color="#666" />
                                <Text style={styles.listItemText}>{del}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {milestone.notes && (
                          <View style={styles.notesBox}>
                            <Ionicons name="chatbox-outline" size={16} color="#2196F3" />
                            <Text style={styles.notesText}>{milestone.notes}</Text>
                          </View>
                        )}

                        {milestone.completedDate && (
                          <View style={styles.completedBox}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={styles.completedText}>
                              Hoàn thành: {formatDate(milestone.completedDate)}
                            </Text>
                          </View>
                        )}

                        {milestone.paymentStatus && (
                          <View style={styles.paymentInfo}>
                            <Text style={styles.paymentLabel}>Trạng thái thanh toán:</Text>
                            <Text
                              style={[
                                styles.paymentStatus,
                                {
                                  color:
                                    milestone.paymentStatus === 'PAID'
                                      ? '#4CAF50'
                                      : '#FF9800',
                                },
                              ]}
                            >
                              {milestone.paymentStatus === 'PAID'
                                ? 'Đã thanh toán'
                                : milestone.paymentStatus === 'PROCESSING'
                                ? 'Đang xử lý'
                                : 'Chờ thanh toán'}
                            </Text>
                          </View>
                        )}

                        {/* Actions */}
                        <View style={styles.actions}>
                          {milestone.status === 'IN_PROGRESS' && (
                            <TouchableOpacity
                              style={styles.completeButton}
                              onPress={() => handleCompleteMilestone(milestone.id)}
                            >
                              <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color="#4CAF50"
                              />
                              <Text style={styles.completeButtonText}>
                                Hoàn thành
                              </Text>
                            </TouchableOpacity>
                          )}
                          {milestone.status === 'COMPLETED' &&
                            milestone.paymentStatus !== 'PAID' && (
                              <TouchableOpacity
                                style={styles.payButton}
                                onPress={() => handlePayment(milestone.id)}
                              >
                                <Ionicons name="cash" size={18} color="#fff" />
                                <Text style={styles.payButtonText}>Thanh toán</Text>
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>

      {/* Add Milestone FAB */}
      {milestones.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddMilestone}>
          <Ionicons name="add" size={28} color="#fff" />
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
  scrollView: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  miniStatText: {
    fontSize: 12,
    color: '#666',
  },
  milestonesSection: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  milestoneCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  milestoneOrder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  milestoneOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  milestoneMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  milestoneMetaText: {
    fontSize: 12,
    color: '#666',
  },
  milestoneRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  milestoneValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  milestoneBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  completedText: {
    fontSize: 13,
    color: '#4CAF50',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#666',
  },
  paymentStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
