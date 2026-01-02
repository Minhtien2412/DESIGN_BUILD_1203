/**
 * Mitigation Actions Dashboard
 * Track and manage risk mitigation actions
 */

import { useOverdueActions, useRisks } from '@/hooks/useRisk';
import { MitigationStatus } from '@/types/risk';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MitigationActionsScreen() {
  const [projectId] = useState('project-1');
  const [selectedTab, setSelectedTab] = useState<MitigationStatus | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { risks, loading, addAction } = useRisks({ projectId });
  const { overdueActions, loading: loadingOverdue } = useOverdueActions(projectId);

  const [newAction, setNewAction] = useState({
    action: '',
    responsible: '',
    responsibleName: '',
    dueDate: new Date(),
  });

  // Flatten all mitigation actions from all risks
  const allActions = risks.flatMap((risk) =>
    (risk.mitigationActions || []).map((action) => ({
      ...action,
      riskId: risk.id,
      riskTitle: risk.title,
      riskLevel: risk.riskLevel,
    }))
  );

  const filteredActions =
    selectedTab === 'ALL'
      ? allActions
      : allActions.filter((a) => a.status === selectedTab);

  const stats = {
    total: allActions.length,
    planned: allActions.filter((a) => a.status === 'PLANNED').length,
    inProgress: allActions.filter((a) => a.status === 'IN_PROGRESS').length,
    overdue: allActions.filter((a) => a.status === 'OVERDUE').length,
  };

  const handleAddAction = async () => {
    if (!selectedRiskId || !newAction.action.trim() || !newAction.responsible.trim()) {
      return;
    }

    try {
      await addAction({
        riskId: selectedRiskId,
        action: newAction.action,
        responsible: newAction.responsible,
        responsibleName: newAction.responsibleName,
        dueDate: newAction.dueDate.toISOString(),
      });
      setShowAddModal(false);
      setNewAction({
        action: '',
        responsible: '',
        responsibleName: '',
        dueDate: new Date(),
      });
      setSelectedRiskId(null);
    } catch (err) {
      console.error('Failed to add action:', err);
    }
  };

  const getStatusColor = (status: MitigationStatus) => {
    switch (status) {
      case 'PLANNED':
        return '#2196F3';
      case 'IN_PROGRESS':
        return '#FF9800';
      case 'COMPLETED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#9E9E9E';
      case 'OVERDUE':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: MitigationStatus) => {
    switch (status) {
      case 'PLANNED':
        return 'ĐÃ LÊN KẾ HOẠCH';
      case 'IN_PROGRESS':
        return 'ĐANG THỰC HIỆN';
      case 'COMPLETED':
        return 'HOÀN THÀNH';
      case 'CANCELLED':
        return 'ĐÃ HỦY';
      case 'OVERDUE':
        return 'QUÁ HẠN';
      default:
        return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return '#B71C1C';
      case 'HIGH':
        return '#F44336';
      case 'MEDIUM':
        return '#FF9800';
      case 'LOW':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const isOverdue = (dueDate: string, status: MitigationStatus) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false;
    return new Date(dueDate) < new Date();
  };

  const renderActionCard = ({ item }: { item: any }) => {
    const overdue = isOverdue(item.dueDate, item.status);

    return (
      <View style={[styles.actionCard, overdue && styles.actionCardOverdue]}>
        {/* Risk context */}
        <View style={styles.riskContext}>
          <View style={[styles.levelDot, { backgroundColor: getLevelColor(item.riskLevel) }]} />
          <Text style={styles.riskTitle} numberOfLines={1}>
            {item.riskTitle}
          </Text>
        </View>

        {/* Action title */}
        <Text style={styles.actionTitle}>{item.action}</Text>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
        </View>

        {/* Responsible & Due date */}
        <View style={styles.actionMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="person" size={14} color="#666" />
            <Text style={styles.metaText}>{item.responsibleName || item.responsible}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar"
              size={14}
              color={overdue ? '#F44336' : '#666'}
            />
            <Text style={[styles.metaText, overdue && styles.overdueText]}>
              {new Date(item.dueDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Cost */}
        {item.cost && (
          <View style={styles.costRow}>
            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
            <Text style={styles.costText}>
              {item.cost.toLocaleString('vi-VN')} VND
            </Text>
          </View>
        )}

        {/* Completed info */}
        {item.status === 'COMPLETED' && item.completedAt && (
          <View style={styles.completedInfo}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.completedText}>
              Hoàn thành: {new Date(item.completedAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}

        {/* Notes */}
        {item.notes && (
          <Text style={styles.actionNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    );
  };

  if (loading && allActions.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải hành động...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats header */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.planned}</Text>
          <Text style={styles.statLabel}>Lên kế hoạch</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Đang thực hiện</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>{stats.overdue}</Text>
          <Text style={styles.statLabel}>Quá hạn</Text>
        </View>
      </View>

      {/* Overdue warning */}
      {stats.overdue > 0 && (
        <View style={styles.overdueWarning}>
          <Ionicons name="warning" size={20} color="#F44336" />
          <Text style={styles.overdueWarningText}>
            {stats.overdue} hành động quá hạn cần xử lý
          </Text>
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'ALL' && styles.tabActive]}
          onPress={() => setSelectedTab('ALL')}
        >
          <Text style={[styles.tabText, selectedTab === 'ALL' && styles.tabTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'PLANNED' && styles.tabActive]}
          onPress={() => setSelectedTab(MitigationStatus.PLANNED)}
        >
          <Text style={[styles.tabText, selectedTab === 'PLANNED' && styles.tabTextActive]}>
            Lên kế hoạch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'IN_PROGRESS' && styles.tabActive]}
          onPress={() => setSelectedTab(MitigationStatus.IN_PROGRESS)}
        >
          <Text style={[styles.tabText, selectedTab === 'IN_PROGRESS' && styles.tabTextActive]}>
            Đang thực hiện
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'COMPLETED' && styles.tabActive]}
          onPress={() => setSelectedTab(MitigationStatus.COMPLETED)}
        >
          <Text style={[styles.tabText, selectedTab === 'COMPLETED' && styles.tabTextActive]}>
            Hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions list */}
      <FlatList
        data={filteredActions}
        keyExtractor={(item) => item.id}
        renderItem={renderActionCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có hành động nào</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyButtonText}>Thêm hành động</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add action modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm hành động giảm thiểu</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Select risk */}
              <Text style={styles.inputLabel}>Chọn rủi ro</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.riskChips}>
                {risks.slice(0, 10).map((risk) => (
                  <TouchableOpacity
                    key={risk.id}
                    style={[
                      styles.riskChip,
                      { borderColor: getLevelColor(risk.riskLevel) },
                      selectedRiskId === risk.id && {
                        backgroundColor: `${getLevelColor(risk.riskLevel)}15`,
                      },
                    ]}
                    onPress={() => setSelectedRiskId(risk.id)}
                  >
                    <Text
                      style={[
                        styles.riskChipText,
                        { color: getLevelColor(risk.riskLevel) },
                      ]}
                      numberOfLines={1}
                    >
                      {risk.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Action */}
              <Text style={styles.inputLabel}>Hành động</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả hành động giảm thiểu"
                value={newAction.action}
                onChangeText={(text) => setNewAction({ ...newAction, action: text })}
                multiline
                numberOfLines={3}
              />

              {/* Responsible */}
              <Text style={styles.inputLabel}>Người chịu trách nhiệm</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập ID người chịu trách nhiệm"
                value={newAction.responsible}
                onChangeText={(text) => setNewAction({ ...newAction, responsible: text })}
              />

              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Tên người chịu trách nhiệm (tùy chọn)"
                value={newAction.responsibleName}
                onChangeText={(text) => setNewAction({ ...newAction, responsibleName: text })}
              />

              {/* Due date */}
              <Text style={styles.inputLabel}>Hạn hoàn thành</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  {newAction.dueDate.toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newAction.dueDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewAction({ ...newAction, dueDate: selectedDate });
                    }
                  }}
                />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddAction}
              >
                <Text style={styles.modalButtonTextPrimary}>Thêm hành động</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
  },
  overdueWarningText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  actionCard: {
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
  actionCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  riskContext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskTitle: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  overdueText: {
    color: '#F44336',
    fontWeight: '600',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  costText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  actionNotes: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  riskChips: {
    marginBottom: 12,
  },
  riskChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 200,
  },
  riskChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  modalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
