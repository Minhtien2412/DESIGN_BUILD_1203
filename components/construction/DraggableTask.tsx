/**
 * DraggableTask Component
 * Task component with drag-and-drop capability
 * Features: Touch/mouse drag, visual feedback, position sync
 */

import { Task } from '@/types/construction-map';
import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

// ============================================
// Props Interface
// ============================================

export interface DraggableTaskProps {
  task: Task;
  onDragStart?: (taskId: string) => void;
  onDragMove?: (taskId: string, x: number, y: number) => void;
  onDragEnd?: (taskId: string, x: number, y: number) => void;
  onPress?: (taskId: string) => void;
  isSelected?: boolean;
  isDraggingOther?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  disabled?: boolean;
  scale?: number;
}

// ============================================
// Helper Functions
// ============================================

const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

const getStatusColor = (status: Task['status']): string => {
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'in-progress':
      return '#3B82F6';
    case 'pending':
      return '#F59E0B';
    case 'blocked':
      return '#EF4444';
    default:
      return '#9CA3AF';
  }
};

const getPriorityColor = (priority: Task['priority']): string => {
  switch (priority) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#9CA3AF';
  }
};

// ============================================
// DraggableTask Component
// ============================================

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPress,
  isSelected = false,
  isDraggingOther = false,
  snapToGrid: enableSnap = true,
  gridSize = 20,
  disabled = false,
  scale = 1,
}) => {
  // Animated values
  const pan = useRef(new Animated.ValueXY({ x: task.x, y: task.y })).current;
  const dragScale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Drag state
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: task.x, y: task.y });

  // Update position when task.x or task.y changes from external source
  useEffect(() => {
    if (!isDragging.current) {
      pan.setValue({ x: task.x, y: task.y });
    }
  }, [task.x, task.y, pan]);

  // Create PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: (evt, gestureState) => {
        isDragging.current = true;
        dragStartPos.current = { x: task.x, y: task.y };

        // Set offset to current position
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });

        // Animate scale and opacity
        Animated.parallel([
          Animated.spring(dragScale, {
            toValue: 1.1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }),
          Animated.spring(opacity, {
            toValue: 0.8,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }),
        ]).start();

        if (onDragStart) {
          onDragStart(task.id);
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        // Update animated values
        pan.x.setValue(gestureState.dx);
        pan.y.setValue(gestureState.dy);
        
        // Calculate current absolute position
        const currentX = dragStartPos.current.x + gestureState.dx / scale;
        const currentY = dragStartPos.current.y + gestureState.dy / scale;

        // Throttled callback for real-time updates
        if (onDragMove) {
          onDragMove(task.id, currentX, currentY);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        isDragging.current = false;

        // Flatten offset
        pan.flattenOffset();

        // Calculate final position
        let finalX = dragStartPos.current.x + gestureState.dx / scale;
        let finalY = dragStartPos.current.y + gestureState.dy / scale;

        // Apply snap to grid
        if (enableSnap) {
          finalX = snapToGrid(finalX, gridSize);
          finalY = snapToGrid(finalY, gridSize);
        }

        // Ensure within bounds
        finalX = Math.max(0, finalX);
        finalY = Math.max(0, finalY);

        // Animate to final position
        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          tension: 100,
          friction: 10,
        }).start();

        // Reset scale and opacity
        Animated.parallel([
          Animated.spring(dragScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }),
        ]).start();

        // Call end callback
        if (onDragEnd) {
          onDragEnd(task.id, finalX, finalY);
        }
      },

      onPanResponderTerminate: () => {
        isDragging.current = false;

        // Reset to original position
        Animated.spring(pan, {
          toValue: dragStartPos.current,
          useNativeDriver: false,
          tension: 100,
          friction: 10,
        }).start();

        // Reset scale and opacity
        Animated.parallel([
          Animated.spring(dragScale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  // Handle press (single tap without drag)
  const handlePress = () => {
    if (onPress && !isDragging.current) {
      onPress(task.id);
    }
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: dragScale },
          ],
          opacity: isDraggingOther ? 0.4 : opacity,
          zIndex: isDragging.current ? 1000 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.taskCard,
          isSelected && styles.taskCardSelected,
          { borderLeftColor: getStatusColor(task.status) },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.taskName} numberOfLines={1}>
            {task.name || task.label}
          </Text>
          {task.priority && (
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            />
          )}
        </View>

        {/* Progress Bar */}
        {task.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${task.progress}%`,
                    backgroundColor: getStatusColor(task.status),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(task.progress)}%</Text>
          </View>
        )}

        {/* Assignee */}
        {task.assignedTo && (
          <Text style={styles.assignee} numberOfLines={1}>
            👤 {task.assignedTo}
          </Text>
        )}

        {/* Drag Handle Indicator */}
        <View style={styles.dragHandle}>
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
        </View>
      </View>
    </Animated.View>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    minWidth: 160,
    maxWidth: 200,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  taskCardSelected: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 32,
  },
  assignee: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  dragHandle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
});

export default DraggableTask;
