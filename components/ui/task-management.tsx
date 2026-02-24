/**
 * Task Management Component
 * For managing project tasks, assignments, and progress tracking
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AvatarGroup } from './avatar';
import Badge from './badge';
import { Button } from './button';
import Card, { CardContent } from './card';
import Checkbox from './checkbox';

// ============================================
// TYPES
// ============================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignees?: { id: string; name: string; avatar?: string }[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  tags?: string[];
}

interface TaskManagementProps {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
  onTaskPress?: (task: Task) => void;
  onAddTask?: () => void;
  showFilters?: boolean;
  groupBy?: 'status' | 'priority' | 'none';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getPriorityConfig = (priority: Task['priority']) => {
  switch (priority) {
    case 'urgent':
      return { color: '#000000', label: 'Urgent', icon: 'flash' as const };
    case 'high':
      return { color: '#0D9488', label: 'High', icon: 'arrow-up' as const };
    case 'medium':
      return { color: '#0D9488', label: 'Medium', icon: 'remove' as const };
    case 'low':
      return { color: '#6B7280', label: 'Low', icon: 'arrow-down' as const };
  }
};

const getStatusConfig = (status: Task['status']) => {
  switch (status) {
    case 'completed':
      return { color: '#0D9488', label: 'Completed', variant: 'success' as const };
    case 'in-progress':
      return { color: '#0D9488', label: 'In Progress', variant: 'info' as const };
    case 'blocked':
      return { color: '#000000', label: 'Blocked', variant: 'error' as const };
    case 'todo':
      return { color: '#6B7280', label: 'To Do', variant: 'neutral' as const };
  }
};

// ============================================
// TASK ITEM COMPONENT
// ============================================

function TaskItem({
  task,
  onToggle,
  onPress,
}: {
  task: Task;
  onToggle?: (taskId: string) => void;
  onPress?: (task: Task) => void;
}) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const isCompleted = task.status === 'completed';

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Pressable
      style={[styles.taskItem, { borderColor: border }]}
      onPress={() => onPress?.(task)}
    >
      {/* Checkbox */}
      <View style={styles.taskCheckbox}>
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggle?.(task.id)}
          size="md"
        />
      </View>

      {/* Task Content */}
      <View style={styles.taskContent}>
        {/* Title & Priority */}
        <View style={styles.taskHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                TextVariants.body1,
                {
                  color: isCompleted ? textMuted : text,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text
                style={[TextVariants.caption, { color: textMuted, marginTop: SpacingSemantic.xs }]}
                numberOfLines={1}
              >
                {task.description}
              </Text>
            )}
          </View>

          {/* Priority Indicator */}
          <View
            style={[
              styles.priorityIndicator,
              { backgroundColor: `${priorityConfig.color}20` },
            ]}
          >
            <Ionicons name={priorityConfig.icon} size={14} color={priorityConfig.color} />
          </View>
        </View>

        {/* Task Meta Info */}
        <View style={styles.taskMeta}>
          {/* Status Badge */}
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>

          {/* Due Date */}
          {task.dueDate && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={textMuted} />
              <Text style={[TextVariants.caption, { color: textMuted, marginLeft: 4 }]}>
                {task.dueDate}
              </Text>
            </View>
          )}

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={14} color={textMuted} />
              <Text style={[TextVariants.caption, { color: textMuted, marginLeft: 4 }]}>
                {completedSubtasks}/{totalSubtasks}
              </Text>
            </View>
          )}
        </View>

        {/* Assignees & Tags */}
        {(task.assignees || task.tags) && (
          <View style={styles.taskFooter}>
            {task.assignees && task.assignees.length > 0 && (
              <AvatarGroup
                avatars={task.assignees.map((a) => ({ id: a.id, name: a.name, uri: a.avatar }))}
                max={3}
                size="sm"
              />
            )}

            {task.tags && task.tags.length > 0 && (
              <View style={styles.tags}>
                {task.tags.slice(0, 2).map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={[TextVariants.caption, { color: textMuted }]}>{tag}</Text>
                  </View>
                ))}
                {task.tags.length > 2 && (
                  <Text style={[TextVariants.caption, { color: textMuted }]}>
                    +{task.tags.length - 2}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ============================================
// TASK GROUP COMPONENT
// ============================================

function TaskGroup({
  title,
  tasks,
  count,
  color,
  onToggle,
  onPress,
}: {
  title: string;
  tasks: Task[];
  count: number;
  color?: string;
  onToggle?: (taskId: string) => void;
  onPress?: (task: Task) => void;
}) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.taskGroup}>
      <View style={styles.groupHeader}>
        {color && <View style={[styles.groupIndicator, { backgroundColor: color }]} />}
        <Text style={[TextVariants.h3, { color: text }]}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: color || '#E5E7EB' }]}>
          <Text
            style={[
              TextVariants.caption,
              { color: color ? '#FFFFFF' : text, fontWeight: '600' },
            ]}
          >
            {count}
          </Text>
        </View>
      </View>

      <View style={styles.groupTasks}>
        {tasks.map((task, index) => (
          <View key={task.id}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: border }]} />}
            <TaskItem task={task} onToggle={onToggle} onPress={onPress} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================
// MAIN TASK MANAGEMENT COMPONENT
// ============================================

export default function TaskManagement({
  tasks,
  onTaskToggle,
  onTaskPress,
  onAddTask,
  showFilters = false,
  groupBy = 'status',
}: TaskManagementProps) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');

  // Filter tasks
  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  // Group tasks
  const groupedTasks: Record<string, Task[]> = {};

  if (groupBy === 'status') {
    filteredTasks.forEach((task) => {
      if (!groupedTasks[task.status]) {
        groupedTasks[task.status] = [];
      }
      groupedTasks[task.status].push(task);
    });
  } else if (groupBy === 'priority') {
    filteredTasks.forEach((task) => {
      if (!groupedTasks[task.priority]) {
        groupedTasks[task.priority] = [];
      }
      groupedTasks[task.priority].push(task);
    });
  } else {
    groupedTasks.all = filteredTasks;
  }

  // Calculate progress
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Progress Overview */}
      <Card variant="elevated">
        <CardContent>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[TextVariants.caption, { color: textMuted }]}>Overall Progress</Text>
              <Text style={[TextVariants.h2, { color: text }]}>
                {completedCount}/{totalCount} Tasks
              </Text>
            </View>
            <View style={styles.percentageCircle}>
              <Text style={[TextVariants.h3, { color: text }]}>{percentage.toFixed(0)}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: percentage === 100 ? '#0D9488' : '#0D9488',
                },
              ]}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={[TextVariants.h3, { color: text }]}>
                {tasks.filter((t) => t.status === 'in-progress').length}
              </Text>
              <Text style={[TextVariants.caption, { color: textMuted }]}>In Progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TextVariants.h3, { color: text }]}>
                {tasks.filter((t) => t.status === 'todo').length}
              </Text>
              <Text style={[TextVariants.caption, { color: textMuted }]}>To Do</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TextVariants.h3, { color: text }]}>
                {tasks.filter((t) => t.status === 'blocked').length}
              </Text>
              <Text style={[TextVariants.caption, { color: textMuted }]}>Blocked</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Task Groups */}
      {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
        const config =
          groupBy === 'status'
            ? getStatusConfig(groupKey as Task['status'])
            : groupBy === 'priority'
            ? getPriorityConfig(groupKey as Task['priority'])
            : { label: 'All Tasks', color: '#6B7280' };

        return (
          <TaskGroup
            key={groupKey}
            title={config.label}
            tasks={groupTasks}
            count={groupTasks.length}
            color={config.color}
            onToggle={onTaskToggle}
            onPress={onTaskPress}
          />
        );
      })}

      {/* Empty State */}
      {tasks.length === 0 && (
        <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
          <CardContent>
            <View style={styles.emptyState}>
              <Ionicons name="checkbox-outline" size={48} color={textMuted} />
              <Text style={[TextVariants.h3, { color: text, marginTop: SpacingSemantic.md }]}>
                No tasks yet
              </Text>
              <Text
                style={[
                  TextVariants.body2,
                  { color: textMuted, marginTop: SpacingSemantic.xs, textAlign: 'center' },
                ]}
              >
                Create your first task to get started
              </Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Add Task Button */}
      {onAddTask && (
        <Button
          title="Add Task"
          onPress={onAddTask}
          style={{ marginTop: SpacingSemantic.md }}
        />
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SpacingSemantic.md,
  },
  percentageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: SpacingSemantic.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SpacingSemantic.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  taskGroup: {
    marginTop: SpacingSemantic.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingSemantic.sm,
    marginBottom: SpacingSemantic.sm,
  },
  groupIndicator: {
    width: 4,
    height: 20,
    borderRadius: BorderRadius.full,
  },
  countBadge: {
    paddingHorizontal: SpacingSemantic.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 'auto',
  },
  groupTasks: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    padding: SpacingSemantic.md,
    gap: SpacingSemantic.sm,
  },
  taskCheckbox: {
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
    gap: SpacingSemantic.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: SpacingSemantic.sm,
  },
  priorityIndicator: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingSemantic.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SpacingSemantic.xs,
  },
  tag: {
    paddingHorizontal: SpacingSemantic.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  divider: {
    height: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SpacingSemantic.xl,
  },
});
