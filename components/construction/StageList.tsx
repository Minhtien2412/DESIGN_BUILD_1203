import { Stage } from '@/types/construction-map';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StageCard from './StageCard';

interface StageListProps {
  stages: Stage[];
  selectedIds: string[];
  onSelect: (stageId: string) => void;
  onCreate?: (stage: Partial<Stage>) => Promise<Stage | null>;
  onUpdate?: (id: string, updates: Partial<Stage>) => Promise<Stage | null>;
  onDelete?: (id: string) => Promise<boolean | void>;
  taskCounts?: Record<string, number>;
  completedCounts?: Record<string, number>;
  compact?: boolean;
}

/**
 * Stage List Component
 * Displays a scrollable list of stages with task statistics
 */
export default function StageList({
  stages,
  selectedIds,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  taskCounts = {},
  completedCounts = {},
  compact = true,
}: StageListProps) {
  const handleStagePress = (stageId: string) => {
    onSelect(stageId);
  };

  const handleStageUpdate = (stageId: string) => async (updates: Partial<Stage>) => {
    if (onUpdate) {
      await onUpdate(stageId, updates);
    }
  };

  const handleStageDelete = (stageId: string) => async () => {
    if (onDelete) {
      await onDelete(stageId);
    }
  };

  // Sort stages by order
  const sortedStages = [...stages].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  if (stages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No stages available</Text>
        {onCreate && (
          <TouchableOpacity style={styles.createButton} onPress={() => onCreate({})}>
            <Text style={styles.createButtonText}>➕ Create Stage</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stages ({stages.length})</Text>
        {onCreate && (
          <TouchableOpacity style={styles.headerButton} onPress={() => onCreate({})}>
            <Text style={styles.headerButtonText}>➕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {sortedStages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            taskCount={taskCounts[stage.id] || 0}
            completedTasks={completedCounts[stage.id] || 0}
            isSelected={selectedIds.includes(stage.id)}
            onPress={() => handleStagePress(stage.id)}
            onUpdate={onUpdate ? handleStageUpdate(stage.id) : undefined}
            onDelete={onDelete ? handleStageDelete(stage.id) : undefined}
            compact={compact}
          />
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
