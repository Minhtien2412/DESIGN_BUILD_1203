/**
 * useDragDrop Hook
 * Handles drag and drop functionality for construction map tasks
 * Features: Touch/mouse support, snap-to-grid, real-time sync, visual feedback
 */

import { useState, useCallback, useRef } from 'react';
import { PanResponder, Animated } from 'react-native';

// ============================================
// Types
// ============================================

export interface DragDropConfig {
  snapToGrid?: boolean;
  gridSize?: number;
  onDragStart?: (itemId: string) => void;
  onDragMove?: (itemId: string, x: number, y: number) => void;
  onDragEnd?: (itemId: string, x: number, y: number) => void;
  disabled?: boolean;
}

export interface DraggableItem {
  id: string;
  x: number;
  y: number;
}

export interface UseDragDropReturn {
  isDragging: boolean;
  draggedItemId: string | null;
  position: Animated.ValueXY;
  panResponder: any;
  startDrag: (itemId: string, initialX: number, initialY: number) => void;
  resetPosition: () => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Snap coordinates to grid
 */
const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Clamp value between min and max
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// ============================================
// useDragDrop Hook
// ============================================

export const useDragDrop = (config: DragDropConfig = {}): UseDragDropReturn => {
  const {
    snapToGrid: enableSnap = true,
    gridSize = 20,
    onDragStart,
    onDragMove,
    onDragEnd,
    disabled = false,
  } = config;

  // State
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Animated position
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Initial position when drag starts
  const initialPosition = useRef({ x: 0, y: 0 });

  // Start drag operation
  const startDrag = useCallback((itemId: string, initialX: number, initialY: number) => {
    if (disabled) return;

    setDraggedItemId(itemId);
    initialPosition.current = { x: initialX, y: initialY };
    position.setValue({ x: initialX, y: initialY });

    if (onDragStart) {
      onDragStart(itemId);
    }
  }, [disabled, onDragStart, position]);

  // Reset position to initial
  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: initialPosition.current,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start(() => {
      setIsDragging(false);
      setDraggedItemId(null);
    });
  }, [position]);

  // Create PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: () => {
        setIsDragging(true);
        // Set offset to current value
        position.setOffset({
          x: (position.x as any)._value,
          y: (position.y as any)._value,
        });
        position.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (evt, gestureState) => {
        if (!draggedItemId) return;

        // Update position
        position.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });

        // Calculate absolute position
        const currentX = initialPosition.current.x + gestureState.dx;
        const currentY = initialPosition.current.y + gestureState.dy;

        // Call move callback (throttled in practice)
        if (onDragMove) {
          onDragMove(draggedItemId, currentX, currentY);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (!draggedItemId) return;

        // Flatten offset
        position.flattenOffset();

        // Calculate final position
        let finalX = initialPosition.current.x + gestureState.dx;
        let finalY = initialPosition.current.y + gestureState.dy;

        // Apply snap to grid
        if (enableSnap) {
          finalX = snapToGrid(finalX, gridSize);
          finalY = snapToGrid(finalY, gridSize);
        }

        // Clamp to canvas bounds (will be configured by parent)
        // For now, just ensure positive values
        finalX = Math.max(0, finalX);
        finalY = Math.max(0, finalY);

        // Animate to final position
        Animated.spring(position, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          tension: 100,
          friction: 10,
        }).start(() => {
          // Update initial position for next drag
          initialPosition.current = { x: finalX, y: finalY };

          // Call end callback
          if (onDragEnd) {
            onDragEnd(draggedItemId, finalX, finalY);
          }

          // Reset drag state
          setIsDragging(false);
          setDraggedItemId(null);
        });
      },

      onPanResponderTerminate: () => {
        // Drag was cancelled, reset to initial position
        resetPosition();
      },
    })
  ).current;

  return {
    isDragging,
    draggedItemId,
    position,
    panResponder,
    startDrag,
    resetPosition,
  };
};

export default useDragDrop;
