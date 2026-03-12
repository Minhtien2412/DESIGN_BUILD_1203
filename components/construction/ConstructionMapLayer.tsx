/**
 * ConstructionMapLayer Component
 * Canvas layer that renders draggable tasks and stages
 * Features: Real-time rendering, drag-drop, WebSocket sync
 */

import { Stage, Task } from '@/types/construction-map';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import DraggableTask from './DraggableTask';

// ============================================
// Props Interface
// ============================================

export interface ConstructionMapLayerProps {
  tasks: Task[];
  stages: Stage[];
  selectedTaskId?: string | null;
  selectedStageId?: string | null;
  onTaskDragStart?: (taskId: string) => void;
  onTaskDragMove?: (taskId: string, x: number, y: number) => void;
  onTaskDragEnd?: (taskId: string, x: number, y: number) => void;
  onTaskPress?: (taskId: string) => void;
  onStagePress?: (stageId: string) => void;
  zoom?: number;
  panX?: number;
  panY?: number;
  snapToGrid?: boolean;
  gridSize?: number;
  showGrid?: boolean;
  disabled?: boolean;
}

// ============================================
// Grid Background Component
// ============================================

const GridBackground: React.FC<{ gridSize: number; zoom: number }> = ({ gridSize, zoom }) => {
  const { width, height } = Dimensions.get('window');
  
  // Calculate grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const scaledGridSize = gridSize * zoom;
    const cols = Math.ceil(width / scaledGridSize) + 1;
    const rows = Math.ceil(height / scaledGridSize) + 1;

    // Vertical lines
    for (let i = 0; i < cols; i++) {
      lines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            {
              left: i * scaledGridSize,
              width: 1,
              height: '100%',
            },
          ]}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i < rows; i++) {
      lines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.gridLine,
            {
              top: i * scaledGridSize,
              height: 1,
              width: '100%',
            },
          ]}
        />
      );
    }

    return lines;
  }, [gridSize, zoom, width, height]);

  return <View style={styles.gridContainer}>{gridLines}</View>;
};

// ============================================
// Stage Component (Simple, non-draggable for now)
// ============================================

const StageMarker: React.FC<{
  stage: Stage;
  isSelected: boolean;
  onPress?: () => void;
}> = ({ stage, isSelected, onPress }) => {
  return (
    <View
      style={[
        styles.stageMarker,
        {
          left: stage.x,
          top: stage.y,
          backgroundColor: stage.color || '#0D9488',
          borderWidth: isSelected ? 3 : 1,
          borderColor: isSelected ? '#0F766E' : 'rgba(255,255,255,0.5)',
        },
      ]}
    >
      <View style={styles.stageContent}>
        <View style={styles.stageNameContainer}>
          {/* Simple text placeholder - will be enhanced later */}
        </View>
      </View>
    </View>
  );
};

// ============================================
// ConstructionMapLayer Component
// ============================================

export const ConstructionMapLayer: React.FC<ConstructionMapLayerProps> = ({
  tasks,
  stages,
  selectedTaskId,
  selectedStageId,
  onTaskDragStart,
  onTaskDragMove,
  onTaskDragEnd,
  onTaskPress,
  onStagePress,
  zoom = 1,
  panX = 0,
  panY = 0,
  snapToGrid = true,
  gridSize = 20,
  showGrid = false,
  disabled = false,
}) => {
  // Currently dragging task
  const [draggingTaskId, setDraggingTaskId] = React.useState<string | null>(null);

  // Handle drag start
  const handleDragStart = useCallback(
    (taskId: string) => {
      setDraggingTaskId(taskId);
      if (onTaskDragStart) {
        onTaskDragStart(taskId);
      }
    },
    [onTaskDragStart]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (taskId: string, x: number, y: number) => {
      if (onTaskDragMove) {
        onTaskDragMove(taskId, x, y);
      }
    },
    [onTaskDragMove]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (taskId: string, x: number, y: number) => {
      setDraggingTaskId(null);
      if (onTaskDragEnd) {
        onTaskDragEnd(taskId, x, y);
      }
    },
    [onTaskDragEnd]
  );

  return (
    <View style={styles.container}>
      {/* Grid Background */}
      {showGrid && <GridBackground gridSize={gridSize} zoom={zoom} />}

      {/* Canvas Content with Pan/Zoom Transform */}
      <View
        style={[
          styles.canvas,
          {
            transform: [
              { translateX: panX },
              { translateY: panY },
              { scale: zoom },
            ],
          },
        ]}
      >
        {/* Render Stages */}
        {stages.map((stage) => (
          <StageMarker
            key={stage.id}
            stage={stage}
            isSelected={stage.id === selectedStageId}
            onPress={() => onStagePress?.(stage.id)}
          />
        ))}

        {/* Render Draggable Tasks */}
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onPress={onTaskPress}
            isSelected={task.id === selectedTaskId}
            isDraggingOther={draggingTaskId !== null && draggingTaskId !== task.id}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            disabled={disabled}
            scale={zoom}
          />
        ))}
      </View>
    </View>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#E5E7EB',
    opacity: 0.3,
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  stageMarker: {
    position: 'absolute',
    width: 120,
    height: 80,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stageContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageNameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
});

export default ConstructionMapLayer;
