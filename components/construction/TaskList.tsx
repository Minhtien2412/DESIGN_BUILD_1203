import { Task } from '@/types/construction-map';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  selectedIds: string[];
  onSelect: (taskId: string) => void;
  onCreate?: (task: Partial<Task>) => Promise<Task | null>;
  onUpdate?: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  onDelete?: (id: string) => Promise<boolean | void>;
  compact?: boolean;
  groupByStage?: boolean;
}

/**
 * Task List Component
 * Displays a scrollable list of tasks with optional grouping
 */
export default function TaskList({
  tasks,
  selectedIds,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  compact = true,
  groupByStage = false,
}: TaskListProps) {
  const handleTaskPress = (taskId: string) => {
    onSelect(taskId);
  };

  const handleTaskUpdate = (taskId: string) => async (updates: Partial<Task>) => {
    if (onUpdate) {
      await onUpdate(taskId, updates);
    }
  };

  const handleTaskDelete = (taskId: string) => async () => {
    if (onDelete) {
      await onDelete(taskId);
    }
  };

  // Group tasks by stage if enabled
  const groupedTasks = groupByStage
    ? tasks.reduce((acc, task) => {
        const stageId = task.stageId || 'unassigned';
        if (!acc[stageId]) {
          acc[stageId] = [];
        }
        acc[stageId].push(task);
        return acc;
      }, {} as Record<string, Task[]>)
    : { all: tasks };

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks available</Text>
        {onCreate && (
          <TouchableOpacity style={styles.createButton} onPress={() => onCreate({})}>
            <Text style={styles.createButtonText}>➕ Create Task</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks ({tasks.length})</Text>
        {onCreate && (
          <TouchableOpacity style={styles.headerButton} onPress={() => onCreate({})}>
            <Text style={styles.headerButtonText}>➕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {Object.entries(groupedTasks).map(([stageId, stageTasks]) => (
          <View key={stageId}>
            {groupByStage && (
              <Text style={styles.groupHeader}>
                {stageId === 'unassigned' ? '📋 Unassigned' : `Stage ${stageId}`}
              </Text>
            )}
            {stageTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedIds.includes(task.id)}
                onPress={() => handleTaskPress(task.id)}
                onUpdate={onUpdate ? handleTaskUpdate(task.id) : undefined}
                onDelete={onDelete ? handleTaskDelete(task.id) : undefined}
                compact={compact}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 8,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  createButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0D9488',
    borderRadius: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
