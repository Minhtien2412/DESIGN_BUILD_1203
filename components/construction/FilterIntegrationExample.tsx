/**
 * FilterIntegrationExample.tsx
 * Example of integrating FilterPanel with ConstructionMapCanvas
 * 
 * Demonstrates:
 * - Filter button with active count
 * - Filter panel modal
 * - Filter persistence (localStorage)
 * - Preset management
 * - Real-time task filtering
 * - Filter summary display
 */

import { useConstructionMap } from '@/hooks/useConstructionMap';
import { getFilterSummary, useFilterTasks } from '@/hooks/useFilterTasks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FilterButton } from './FilterButton';
import { FilterCriteria, FilterPanel, FilterPreset } from './FilterPanel';

const FILTER_STORAGE_KEY = 'construction-map-filters';
const PRESET_STORAGE_KEY = 'construction-map-filter-presets';

const defaultFilters: FilterCriteria = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  searchText: '',
  onlyOverdue: false,
  onlyUnassigned: false,
};

export const ConstructionMapWithFilters: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  const { tasks, stages } = useConstructionMap({ projectId });
  // Assignees placeholder - hook doesn't return assignees currently
  const assignees: Array<{ userId: string; userName: string }> = [];
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria>(defaultFilters);
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Apply filters to tasks
  const {
    filteredTasks,
    totalCount,
    filteredCount,
    filterPercentage,
    isFiltering,
  } = useFilterTasks(tasks, currentFilters);

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters();
    loadSavedPresets();
  }, []);

  // Save filters when changed
  useEffect(() => {
    if (isFiltering) {
      saveFilters(currentFilters);
    }
  }, [currentFilters, isFiltering]);

  // Load filters from storage
  const loadSavedFilters = async () => {
    try {
      const saved = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        if (parsed.startDateFrom) parsed.startDateFrom = new Date(parsed.startDateFrom);
        if (parsed.startDateTo) parsed.startDateTo = new Date(parsed.startDateTo);
        if (parsed.endDateFrom) parsed.endDateFrom = new Date(parsed.endDateFrom);
        if (parsed.endDateTo) parsed.endDateTo = new Date(parsed.endDateTo);
        setCurrentFilters(parsed);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  // Save filters to storage
  const saveFilters = async (filters: FilterCriteria) => {
    try {
      await AsyncStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  };

  // Load presets from storage
  const loadSavedPresets = async () => {
    try {
      const saved = await AsyncStorage.getItem(PRESET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const presetsWithDates = parsed.map((preset: any) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
          criteria: {
            ...preset.criteria,
            startDateFrom: preset.criteria.startDateFrom
              ? new Date(preset.criteria.startDateFrom)
              : undefined,
            startDateTo: preset.criteria.startDateTo
              ? new Date(preset.criteria.startDateTo)
              : undefined,
            endDateFrom: preset.criteria.endDateFrom
              ? new Date(preset.criteria.endDateFrom)
              : undefined,
            endDateTo: preset.criteria.endDateTo
              ? new Date(preset.criteria.endDateTo)
              : undefined,
          },
        }));
        setPresets(presetsWithDates);
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  // Save presets to storage
  const savePresets = async (newPresets: FilterPreset[]) => {
    try {
      await AsyncStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(newPresets));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  };

  // Handle apply filters
  const handleApplyFilters = (filters: FilterCriteria) => {
    setCurrentFilters(filters);
  };

  // Handle save preset
  const handleSavePreset = (name: string, criteria: FilterCriteria) => {
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      criteria,
      createdAt: new Date(),
    };
    const newPresets = [...presets, newPreset];
    setPresets(newPresets);
    savePresets(newPresets);
  };

  // Handle delete preset
  const handleDeletePreset = (presetId: string) => {
    const newPresets = presets.filter((p) => p.id !== presetId);
    setPresets(newPresets);
    savePresets(newPresets);
  };

  // Handle load preset
  const handleLoadPreset = (preset: FilterPreset) => {
    setCurrentFilters(preset.criteria);
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (currentFilters.statuses.length > 0) count++;
    if (currentFilters.priorities.length > 0) count++;
    if (currentFilters.assigneeIds.length > 0) count++;
    if (currentFilters.startDateFrom || currentFilters.startDateTo) count++;
    if (currentFilters.endDateFrom || currentFilters.endDateTo) count++;
    if (currentFilters.searchText.trim()) count++;
    if (currentFilters.onlyOverdue) count++;
    if (currentFilters.onlyUnassigned) count++;
    return count;
  };

  // Get assignee options
  const assigneeOptions = assignees.map((a) => ({
    id: a.userId,
    name: a.userName,
  }));

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <FilterButton
        activeFilterCount={getActiveFilterCount()}
        onPress={() => setShowFilterPanel(true)}
        filterSummary={isFiltering ? getFilterSummary(currentFilters) : undefined}
        position="top-right"
      />

      {/* Filter Stats */}
      {isFiltering && (
        <View style={styles.filterStats}>
          <Text style={styles.filterStatsText}>
            Hiển thị {filteredCount} / {totalCount} công việc ({filterPercentage.toFixed(0)}%)
          </Text>
        </View>
      )}

      {/* Task List (Filtered) */}
      <ScrollView style={styles.taskList}>
        {filteredTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={styles.taskStatus}>{task.status}</Text>
            <Text style={styles.taskPriority}>{task.priority}</Text>
          </View>
        ))}
        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isFiltering
                ? 'Không tìm thấy công việc nào phù hợp với bộ lọc'
                : 'Chưa có công việc nào'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Panel */}
      <FilterPanel
        visible={showFilterPanel}
        currentFilters={currentFilters}
        onApplyFilters={handleApplyFilters}
        onClose={() => setShowFilterPanel(false)}
        assigneeOptions={assigneeOptions}
        presets={presets}
        onSavePreset={handleSavePreset}
        onDeletePreset={handleDeletePreset}
        onLoadPreset={handleLoadPreset}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterStats: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E8F4FF',
    borderBottomWidth: 1,
    borderBottomColor: '#0080FF',
  },
  filterStatsText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  taskPriority: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

/**
 * INTEGRATION GUIDE
 * ================
 * 
 * 1. Import Components:
 *    ```typescript
 *    import { FilterPanel, FilterCriteria } from '@/components/construction/FilterPanel';
 *    import { FilterButton } from '@/components/construction/FilterButton';
 *    import { useFilterTasks } from '@/hooks/useFilterTasks';
 *    ```
 * 
 * 2. Add State:
 *    ```typescript
 *    const [showFilterPanel, setShowFilterPanel] = useState(false);
 *    const [currentFilters, setCurrentFilters] = useState<FilterCriteria>(defaultFilters);
 *    ```
 * 
 * 3. Apply Filters:
 *    ```typescript
 *    const { filteredTasks, filteredCount, isFiltering } = useFilterTasks(tasks, currentFilters);
 *    ```
 * 
 * 4. Render Components:
 *    ```tsx
 *    <FilterButton
 *      activeFilterCount={getActiveFilterCount()}
 *      onPress={() => setShowFilterPanel(true)}
 *    />
 *    
 *    <FilterPanel
 *      visible={showFilterPanel}
 *      currentFilters={currentFilters}
 *      onApplyFilters={setCurrentFilters}
 *      onClose={() => setShowFilterPanel(false)}
 *    />
 *    ```
 * 
 * 5. Use Filtered Tasks:
 *    ```tsx
 *    {filteredTasks.map(task => <TaskCard key={task.id} task={task} />)}
 *    ```
 * 
 * FILTER FEATURES:
 * ================
 * ✓ Multi-select status (Pending/InProgress/Completed/Cancelled)
 * ✓ Multi-select priority (Low/Medium/High)
 * ✓ Multi-select assignees
 * ✓ Date range picker (start/end dates)
 * ✓ Text search (name/description)
 * ✓ Show only overdue tasks
 * ✓ Show only unassigned tasks
 * ✓ Save filter presets
 * ✓ Load saved presets
 * ✓ Delete presets
 * ✓ Clear all filters
 * ✓ Active filter count badge
 * ✓ Filter summary tooltip
 * ✓ Collapsible sections
 * ✓ Persistence (AsyncStorage)
 * 
 * NEXT STEPS:
 * ===========
 * 1. Integrate into ConstructionMapCanvas
 * 2. Add filter button to Canvas header
 * 3. Connect filtered tasks to map rendering
 * 4. Add filter animations (fade in/out filtered items)
 * 5. Test with large datasets (100+ tasks)
 */
