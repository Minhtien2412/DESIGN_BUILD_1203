/**
 * Tasks Kanban Board - Modernized with Nordic Green Theme
 * Drag & drop columns: Todo, In Progress, Done
 * Updated: 13/12/2025
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/services/api/tasksApi';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_WIDTH = SCREEN_WIDTH / 3 - MODERN_SPACING.lg;

type KanbanStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

const STATUS_CONFIG: Record<KanbanStatus, { label: string; color: string; icon: string }> = {
  'TODO': { 
    label: 'Todo', 
    color: MODERN_COLORS.textSecondary, 
    icon: 'ellipse-outline' 
  },
  'IN_PROGRESS': { 
    label: 'In Progress', 
    color: MODERN_COLORS.warning, 
    icon: 'sync-circle' 
  },
  'DONE': { 
    label: 'Done', 
    color: MODERN_COLORS.success, 
    icon: 'checkmark-circle' 
  },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Thấp', color: MODERN_COLORS.success, icon: 'arrow-down-circle' },
  MEDIUM: { label: 'Trung bình', color: MODERN_COLORS.warning, icon: 'remove-circle' },
  HIGH: { label: 'Cao', color: MODERN_COLORS.danger, icon: 'arrow-up-circle' },
  URGENT: { label: 'Khẩn cấp', color: MODERN_COLORS.danger, icon: 'alert-circle' },
};

interface TasksKanbanBoardProps {
  projectId?: number;
}

export default function TasksKanbanBoard({ projectId }: TasksKanbanBoardProps) {
  const { tasks, loading, refresh } = useTasks(projectId);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'DONE');

  const renderTaskCard = (task: Task) => {
    const priorityConfig = PRIORITY_CONFIG[task.priority];
    const daysLeft = task.dueDate 
      ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const isOverdue = daysLeft !== null && daysLeft < 0;
    const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

    return (
      <TouchableOpacity 
        key={task.id} 
        style={styles.taskCard}
        activeOpacity={0.8}
      >
        {/* Priority Badge */}
        {task.priority !== 'LOW' && (
          <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '15' }]}>
            <Ionicons 
              name={priorityConfig.icon as any} 
              size={14} 
              color={priorityConfig.color} 
            />
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
        )}

        {/* Task Title */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {task.title}
        </Text>

        {/* Description */}
        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={3}>
            {task.description}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.taskFooter}>
          {/* Due Date */}
          {task.dueDate && (
            <View style={styles.taskFooterItem}>
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color={isOverdue ? MODERN_COLORS.danger : isDueSoon ? MODERN_COLORS.warning : MODERN_COLORS.textSecondary} 
              />
              <Text 
                style={[
                  styles.taskFooterText,
                  isOverdue && { color: MODERN_COLORS.danger },
                  isDueSoon && { color: MODERN_COLORS.warning },
                ]}
              >
                {isOverdue 
                  ? `Quá hạn ${Math.abs(daysLeft)} ngày` 
                  : isDueSoon 
                    ? `${daysLeft} ngày nữa`
                    : new Date(task.dueDate).toLocaleDateString('vi-VN', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })
                }
              </Text>
            </View>
          )}

          {/* Assignee Avatar */}
          {task.assignedTo && (
            <View style={styles.assigneeAvatar}>
              <Text style={styles.assigneeInitial}>
                {task.assignedTo.name?.[0]?.toUpperCase() || task.assignedTo.email[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderColumn = (
    status: KanbanStatus, 
    columnTasks: Task[]
  ) => {
    const config = STATUS_CONFIG[status];

    return (
      <View style={styles.column}>
        {/* Column Header */}
        <View style={styles.columnHeader}>
          <View style={styles.columnHeaderLeft}>
            <Ionicons 
              name={config.icon as any} 
              size={20} 
              color={config.color} 
            />
            <Text style={styles.columnTitle}>{config.label}</Text>
          </View>
          <View style={[styles.columnBadge, { backgroundColor: config.color + '15' }]}>
            <Text style={[styles.columnBadgeText, { color: config.color }]}>
              {columnTasks.length}
            </Text>
          </View>
        </View>

        {/* Tasks List */}
        <ScrollView
          style={styles.columnScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.columnScrollContent}
        >
          {columnTasks.length === 0 ? (
            <View style={styles.emptyColumn}>
              <Ionicons 
                name="document-text-outline" 
                size={32} 
                color={MODERN_COLORS.divider} 
              />
              <Text style={styles.emptyColumnText}>Chưa có task</Text>
            </View>
          ) : (
            columnTasks.map(task => renderTaskCard(task))
          )}
        </ScrollView>

        {/* Add Task Button */}
        <TouchableOpacity style={styles.addTaskButton}>
          <Ionicons name="add" size={18} color={MODERN_COLORS.primary} />
          <Text style={styles.addTaskText}>Thêm task</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải tasks...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={MODERN_COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kanban Board</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="filter-outline" size={22} color={MODERN_COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={22} color={MODERN_COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tổng tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: MODERN_COLORS.warning }]}>
              {inProgressTasks.length}
            </Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: MODERN_COLORS.success }]}>
              {completedTasks.length}
            </Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>

        {/* Kanban Columns */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.columnsContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[MODERN_COLORS.primary]}
              tintColor={MODERN_COLORS.primary}
            />
          }
        >
          {renderColumn('TODO', todoTasks)}
          {renderColumn('IN_PROGRESS', inProgressTasks)}
          {renderColumn('DONE', completedTasks)}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MODERN_COLORS.background,
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: MODERN_SPACING.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    alignItems: 'center',
    ...MODERN_SHADOWS.sm,
  },
  statValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  statLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.xxs,
  },
  columnsContainer: {
    paddingHorizontal: MODERN_SPACING.lg,
    paddingBottom: MODERN_SPACING.xl,
    gap: MODERN_SPACING.md,
  },
  column: {
    width: COLUMN_WIDTH,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.sm,
  },
  columnHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
  },
  columnTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  columnBadge: {
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xxs,
    borderRadius: MODERN_RADIUS.full,
  },
  columnBadgeText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  columnScroll: {
    flex: 1,
  },
  columnScrollContent: {
    gap: MODERN_SPACING.sm,
    paddingBottom: MODERN_SPACING.md,
  },
  emptyColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: MODERN_SPACING.xxxl,
  },
  emptyColumnText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
  },
  taskCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
    borderLeftWidth: 3,
    borderLeftColor: MODERN_COLORS.primary,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xxs,
    borderRadius: MODERN_RADIUS.full,
    gap: MODERN_SPACING.xxs,
    marginBottom: MODERN_SPACING.sm,
  },
  priorityText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  taskTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  taskDescription: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: MODERN_SPACING.sm,
  },
  taskFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xxs,
  },
  taskFooterText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeInitial: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.surface,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MODERN_SPACING.xs,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
    borderStyle: 'dashed',
  },
  addTaskText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
});
