/**
 * CRM Tasks Management Screen
 * ============================
 * 
 * Quản lý tasks từ Perfex CRM với Kanban board
 * Tích hợp hook useCRMTasks
 * 
 * @author ThietKeResort Team
 * @since 2025-01-03
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING } from '@/constants/modern-theme';
import { useTasks } from '@/hooks/usePerfexAPI';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3 - MODERN_SPACING.md;

// Filter tabs for task views
type ViewMode = 'kanban' | 'list' | 'my-tasks';

// Priority colors
const PRIORITY_COLORS = {
  urgent: '#000000',
  high: '#0066CC',
  medium: '#3B82F6',
  low: '#0066CC',
};

// Match Perfex CRM status values
const STATUS_COLORS = {
  not_started: '#6B7280',
  in_progress: '#3B82F6',
  testing: '#666666',
  awaiting_feedback: '#0066CC',
  complete: '#0066CC',
};

const STATUS_LABELS = {
  not_started: 'Chờ xử lý',
  in_progress: 'Đang làm',
  testing: 'Đang test',
  awaiting_feedback: 'Chờ phản hồi',
  complete: 'Hoàn thành',
};

export default function CRMTasksScreen() {
  const { 
    tasks, 
    stats, 
    loading, 
    error, 
    refresh, 
    createTask, 
    updateTask, 
    deleteTask 
  } = useTasks();
  
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({
        name: newTaskTitle,
        priority: 'medium',
        status: 'not_started',
      });
      setNewTaskTitle('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Create task error:', err);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: '5' }); // 5 = Complete in Perfex
    } catch (err) {
      console.error('Complete task error:', err);
    }
  };

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Tasks</Text>
        </View>
        <View style={[styles.emptyState, { flex: 1 }]}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Tasks</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerAction}>
            <Ionicons name="refresh" size={22} color={MODERN_COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.emptyState, { flex: 1 }]}>
          <Ionicons name="alert-circle-outline" size={48} color={MODERN_COLORS.error} />
          <Text style={[styles.emptyText, { marginTop: 16, color: MODERN_COLORS.error }]}>Lỗi tải dữ liệu</Text>
          <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 12 }}>
            <Text style={{ color: MODERN_COLORS.primary, fontWeight: '600' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Group tasks by status (matching CRM status values)
  const pendingTasks = tasks.filter(t => t.status === 'not_started' || t.status === 'awaiting_feedback');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'testing');
  const completedTasks = tasks.filter(t => t.status === 'complete');

  const renderStatCard = (label: string, value: number, color: string, icon: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderTaskCard = (task: any) => {
    const priorityColor = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
    const statusColor = STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.not_started;
    
    return (
      <TouchableOpacity 
        key={task.id}
        style={styles.taskCard}
        onPress={() => setSelectedTask(task)}
        activeOpacity={0.8}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
        
        {/* Task content */}
        <View style={styles.taskContent}>
          <Text style={styles.taskName} numberOfLines={2}>{task.name}</Text>
          
          {task.projectName && (
            <View style={styles.taskMeta}>
              <Ionicons name="folder-outline" size={12} color="#666" />
              <Text style={styles.taskMetaText}>{task.projectName}</Text>
            </View>
          )}
          
          <View style={styles.taskFooter}>
            {task.dueDate && (
              <View style={styles.taskFooterItem}>
                <Ionicons name="calendar-outline" size={12} color="#666" />
                <Text style={styles.taskFooterText}>
                  {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
            
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS] || task.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Complete button */}
        {task.status !== 'complete' && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => handleCompleteTask(task.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color={MODERN_COLORS.success} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderKanbanColumn = (title: string, columnTasks: any[], color: string) => (
    <View style={styles.kanbanColumn}>
      <View style={styles.columnHeader}>
        <View style={[styles.columnDot, { backgroundColor: color }]} />
        <Text style={styles.columnTitle}>{title}</Text>
        <View style={[styles.columnBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.columnBadgeText, { color }]}>{columnTasks.length}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.columnScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.columnContent}
      >
        {columnTasks.length === 0 ? (
          <View style={styles.emptyColumn}>
            <Ionicons name="document-text-outline" size={32} color="#CCC" />
            <Text style={styles.emptyText}>Không có task</Text>
          </View>
        ) : (
          columnTasks.map(task => renderTaskCard(task))
        )}
      </ScrollView>
    </View>
  );

  const renderListView = () => (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => renderTaskCard(item)}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyList}>
          <Ionicons name="document-text-outline" size={64} color="#CCC" />
          <Text style={styles.emptyListText}>Chưa có task nào</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.createButtonText}>Tạo Task Mới</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quản Lý Tasks</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle" size={28} color={MODERN_COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        {renderStatCard('Chờ xử lý', stats.notStarted, '#6B7280', 'hourglass-outline')}
        {renderStatCard('Đang làm', stats.inProgress, '#3B82F6', 'sync-outline')}
        {renderStatCard('Hoàn thành', stats.completed, '#0066CC', 'checkmark-circle-outline')}
        {renderStatCard('Đang test', stats.testing, '#000000', 'alert-circle-outline')}
      </ScrollView>

      {/* View Mode Tabs */}
      <View style={styles.viewTabs}>
        <TouchableOpacity 
          style={[styles.viewTab, viewMode === 'kanban' && styles.viewTabActive]}
          onPress={() => setViewMode('kanban')}
        >
          <Ionicons 
            name="grid-outline" 
            size={18} 
            color={viewMode === 'kanban' ? MODERN_COLORS.primary : '#666'} 
          />
          <Text style={[styles.viewTabText, viewMode === 'kanban' && styles.viewTabTextActive]}>
            Kanban
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewTab, viewMode === 'list' && styles.viewTabActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons 
            name="list-outline" 
            size={18} 
            color={viewMode === 'list' ? MODERN_COLORS.primary : '#666'} 
          />
          <Text style={[styles.viewTabText, viewMode === 'list' && styles.viewTabTextActive]}>
            Danh sách
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kanbanContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderKanbanColumn('Chờ xử lý', pendingTasks, '#6B7280')}
          {renderKanbanColumn('Đang làm', inProgressTasks, '#3B82F6')}
          {renderKanbanColumn('Hoàn thành', completedTasks, '#0066CC')}
        </ScrollView>
      ) : (
        renderListView()
      )}

      {/* Create Task Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Task Mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Tên task..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalConfirmButton,
                  !newTaskTitle.trim() && styles.modalButtonDisabled
                ]}
                onPress={handleCreateTask}
                disabled={!newTaskTitle.trim()}
              >
                <Text style={styles.modalConfirmText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        visible={!!selectedTask}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết Task</Text>
              <TouchableOpacity onPress={() => setSelectedTask(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedTask && (
              <ScrollView style={styles.detailContent}>
                <Text style={styles.detailTitle}>{selectedTask.name}</Text>
                
                {selectedTask.description && (
                  <Text style={styles.detailDescription}>{selectedTask.description}</Text>
                )}

                <View style={styles.detailRow}>
                  <Ionicons name="flag-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Ưu tiên:</Text>
                  <View style={[
                    styles.priorityBadge, 
                    { backgroundColor: (PRIORITY_COLORS[selectedTask.priority as keyof typeof PRIORITY_COLORS] || '#3B82F6') + '20' }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: PRIORITY_COLORS[selectedTask.priority as keyof typeof PRIORITY_COLORS] || '#3B82F6' }
                    ]}>
                      {selectedTask.priority === 'urgent' ? 'Khẩn cấp' :
                       selectedTask.priority === 'high' ? 'Cao' :
                       selectedTask.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="sync-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Trạng thái:</Text>
                  <View style={[
                    styles.statusBadgeLarge,
                    { backgroundColor: (STATUS_COLORS[selectedTask.status as keyof typeof STATUS_COLORS] || '#6B7280') + '20' }
                  ]}>
                    <Text style={[
                      styles.statusTextLarge,
                      { color: STATUS_COLORS[selectedTask.status as keyof typeof STATUS_COLORS] || '#6B7280' }
                    ]}>
                      {STATUS_LABELS[selectedTask.status as keyof typeof STATUS_LABELS] || selectedTask.status}
                    </Text>
                  </View>
                </View>

                {selectedTask.dueDate && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text style={styles.detailLabel}>Hạn:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedTask.dueDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                )}

                {selectedTask.projectName && (
                  <View style={styles.detailRow}>
                    <Ionicons name="folder-outline" size={20} color="#666" />
                    <Text style={styles.detailLabel}>Dự án:</Text>
                    <Text style={styles.detailValue}>{selectedTask.projectName}</Text>
                  </View>
                )}

                {selectedTask.status !== 'complete' && (
                  <TouchableOpacity 
                    style={styles.completeTaskButton}
                    onPress={() => {
                      handleCompleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                    <Text style={styles.completeTaskText}>Đánh dấu hoàn thành</Text>
                  </TouchableOpacity>
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
  headerAction: {
    padding: MODERN_SPACING.xs,
  },
  headerCenter: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
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
  addButton: {
    padding: MODERN_SPACING.xs,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    width: 110,
    borderLeftWidth: 3,
    ...MODERN_SHADOWS.sm,
    marginRight: MODERN_SPACING.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.xs,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // View Tabs
  viewTabs: {
    flexDirection: 'row',
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  viewTabActive: {
    backgroundColor: MODERN_COLORS.primary + '10',
    borderColor: MODERN_COLORS.primary,
  },
  viewTabText: {
    fontSize: 13,
    color: '#666',
  },
  viewTabTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: '600',
  },

  // Kanban
  kanbanContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  kanbanColumn: {
    width: COLUMN_WIDTH,
    backgroundColor: '#F1F5F9',
    borderRadius: MODERN_RADIUS.md,
    marginRight: MODERN_SPACING.sm,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: MODERN_SPACING.sm,
    gap: 8,
  },
  columnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  columnTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  columnBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  columnBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  columnScroll: {
    flex: 1,
    maxHeight: 500,
  },
  columnContent: {
    padding: MODERN_SPACING.xs,
    gap: MODERN_SPACING.xs,
  },
  emptyColumn: {
    padding: MODERN_SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: MODERN_SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  // Task Card
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: MODERN_RADIUS.sm,
    overflow: 'hidden',
    ...MODERN_SHADOWS.sm,
    marginBottom: MODERN_SPACING.xs,
  },
  priorityIndicator: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: MODERN_SPACING.sm,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  taskMetaText: {
    fontSize: 11,
    color: '#666',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskFooterText: {
    fontSize: 11,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  completeButton: {
    padding: MODERN_SPACING.sm,
    justifyContent: 'center',
  },

  // List View
  listContent: {
    padding: MODERN_SPACING.md,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyListText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
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
    padding: MODERN_SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: MODERN_SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: MODERN_SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },

  // Detail Modal
  detailModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.lg,
    maxHeight: '70%',
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: MODERN_SPACING.sm,
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: MODERN_SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: MODERN_SPACING.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextLarge: {
    fontSize: 12,
    fontWeight: '600',
  },
  completeTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MODERN_COLORS.success,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    marginTop: MODERN_SPACING.lg,
    gap: MODERN_SPACING.sm,
  },
  completeTaskText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
