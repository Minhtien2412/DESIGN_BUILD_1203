import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useConstructionMap } from '../../hooks/useConstructionMap';
import MapControls from './MapControls';
import TaskList from './TaskList';
import StageList from './StageList';
import TaskForm, { TaskFormData } from './TaskForm';
import StageForm, { StageFormData } from './StageForm';
import { Task, Stage } from '@/types/construction-map';

interface ConstructionMapCanvasProps {
  projectId: string;
  showControls?: boolean;
  showTaskList?: boolean;
  showStageList?: boolean;
  onTaskSelect?: (taskId: string) => void;
  onStageSelect?: (stageId: string) => void;
  autoSaveInterval?: number;
}

/**
 * Main Construction Map Canvas Component
 * Integrates canvas rendering, controls, and data management
 */
export default function ConstructionMapCanvas({
  projectId,
  showControls = true,
  showTaskList = false,
  showStageList = false,
  onTaskSelect,
  onStageSelect,
  autoSaveInterval = 3000,
}: ConstructionMapCanvasProps) {
  // Form modal states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showStageForm, setShowStageForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  const {
    containerRef,
    engine,
    loading,
    error,
    syncing,
    tasks,
    stages,
    mapState,
    zoom,
    selectedTaskId,
    selectedStageId,
    activeUsers,
    zoomIn,
    zoomOut,
    zoomTo,
    resetView,
    createTask,
    updateTask,
    deleteTask,
    createStage,
    updateStage,
    deleteStage,
    saveMapState,
  } = useConstructionMap({
    projectId,
    autoSaveInterval,
    enableWebSocket: true,
  });

  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    if (onTaskSelect) {
      onTaskSelect(taskId);
    }
  };

  // Handle stage selection
  const handleStageSelect = (stageId: string) => {
    if (onStageSelect) {
      onStageSelect(stageId);
    }
  };

  // Handle create task button
  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Handle task form submit
  const handleTaskFormSubmit = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, data);
      } else {
        // Create new task
        await createTask(data);
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Task form submit error:', error);
      throw error; // Re-throw to let form handle it
    }
  };

  // Handle create stage button
  const handleCreateStage = () => {
    setEditingStage(null);
    setShowStageForm(true);
  };

  // Handle edit stage
  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setShowStageForm(true);
  };

  // Handle stage form submit
  const handleStageFormSubmit = async (data: StageFormData) => {
    try {
      if (editingStage) {
        // Update existing stage
        await updateStage(editingStage.id, data);
      } else {
        // Create new stage
        await createStage(data);
      }
      setShowStageForm(false);
      setEditingStage(null);
    } catch (error) {
      console.error('Stage form submit error:', error);
      throw error; // Re-throw to let form handle it
    }
  };

  // Log engine state for debugging
  useEffect(() => {
    if (engine) {
      console.log('[ConstructionMapCanvas] Engine initialized:', {
        taskCount: tasks.length,
        stageCount: stages.length,
        zoom: zoom,
        activeUsers: activeUsers.length,
      });
    }
  }, [engine, tasks.length, stages.length, zoom, activeUsers.length]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading construction map...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ Error loading map</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Canvas Container */}
      <View
        ref={containerRef as any}
        style={styles.canvasContainer}
      >
        {/* Syncing Indicator */}
        {syncing && (
          <View style={styles.syncingBadge}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.syncingText}>Syncing...</Text>
          </View>
        )}

        {/* Active Users Indicator */}
        {activeUsers.length > 0 && (
          <View style={styles.usersBadge}>
            <Text style={styles.usersText}>
              👥 {activeUsers.length} user{activeUsers.length > 1 ? 's' : ''} online
            </Text>
          </View>
        )}

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, styles.fabTask]}
            onPress={handleCreateTask}
            activeOpacity={0.8}
          >
            <Text style={styles.fabText}>+ Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fab, styles.fabStage]}
            onPress={handleCreateStage}
            activeOpacity={0.8}
          >
            <Text style={styles.fabText}>+ Stage</Text>
          </TouchableOpacity>
        </View>

        {/* Map Controls Overlay */}
        {showControls && (
          <MapControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={resetView}
            mapState={mapState}
          />
        )}
      </View>

      {/* Side Panels */}
      <View style={styles.sidePanels}>
        {/* Task List Panel */}
        {showTaskList && (
          <TaskList
            tasks={tasks}
            selectedIds={selectedTaskId ? [selectedTaskId] : []}
            onSelect={handleTaskSelect}
            onCreate={createTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}

        {/* Stage List Panel */}
        {showStageList && (
          <StageList
            stages={stages}
            selectedIds={selectedStageId ? [selectedStageId] : []}
            onSelect={handleStageSelect}
            onCreate={createStage}
            onUpdate={updateStage}
            onDelete={deleteStage}
          />
        )}
      </View>

      {/* Map Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📊 {tasks.length} tasks | 🎯 {stages.length} stages | 🔍 {Math.round(zoom * 100)}%
        </Text>
        {mapState && (
          <Text style={styles.footerText}>
            📍 Pan: ({Math.round(mapState.panX || 0)}, {Math.round(mapState.panY || 0)})
          </Text>
        )}
      </View>

      {/* Task Form Modal */}
      <TaskForm
        visible={showTaskForm}
        task={editingTask}
        projectId={projectId}
        onSubmit={handleTaskFormSubmit}
        onCancel={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        assigneeOptions={[
          { id: 'user1', name: 'Nguyễn Văn A' },
          { id: 'user2', name: 'Trần Thị B' },
          { id: 'user3', name: 'Lê Văn C' },
        ]}
      />

      {/* Stage Form Modal */}
      <StageForm
        visible={showStageForm}
        stage={editingStage}
        projectId={projectId}
        onSubmit={handleStageFormSubmit}
        onCancel={() => {
          setShowStageForm(false);
          setEditingStage(null);
        }}
        existingStages={stages}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 1000,
  },
  syncingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  usersBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 1000,
  },
  usersText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sidePanels: {
    flexDirection: 'row',
    maxHeight: '30%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    flexDirection: 'column',
    gap: 12,
    zIndex: 999,
  },
  fab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  fabTask: {
    backgroundColor: '#0D9488',
  },
  fabStage: {
    backgroundColor: '#0D9488',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
