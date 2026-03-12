/**
 * Custom Gesture Hooks
 * Provides reusable gesture detection with haptic feedback
 */

import { HapticFeedback } from '@/utils/haptics';
import { useCallback, useRef } from 'react';
import { GestureResponderEvent } from 'react-native';

interface UseDoubleTapOptions {
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
  delay?: number; // ms to wait for second tap
}

/**
 * Hook to detect double tap gestures
 * Usage: const doubleTapHandlers = useDoubleTap({ onDoubleTap: () => {} })
 */
export const useDoubleTap = ({
  onDoubleTap,
  onSingleTap,
  delay = 300,
}: UseDoubleTapOptions) => {
  const lastTap = useRef<number>(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTap.current;

    if (delta < delay) {
      // Double tap detected
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      HapticFeedback.doubleTap();
      onDoubleTap?.();
      lastTap.current = 0;
    } else {
      // Possible single tap - wait for second tap
      lastTap.current = now;
      
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      
      tapTimer.current = setTimeout(() => {
        HapticFeedback.light();
        onSingleTap?.();
        tapTimer.current = null;
      }, delay);
    }
  }, [onDoubleTap, onSingleTap, delay]);

  return {
    onPress: handlePress,
  };
};

interface UseLongPressOptions {
  onLongPress?: () => void;
  onPress?: () => void;
  delayLongPress?: number; // ms to trigger long press
}

/**
 * Hook to detect long press with haptic feedback
 * Usage: const longPressHandlers = useLongPress({ onLongPress: () => {} })
 */
export const useLongPress = ({
  onLongPress,
  onPress,
  delayLongPress = 500,
}: UseLongPressOptions) => {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handlePressIn = useCallback(() => {
    isLongPress.current = false;
    HapticFeedback.light();
    
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      HapticFeedback.longPress();
      onLongPress?.();
    }, delayLongPress);
  }, [onLongPress, delayLongPress]);

  const handlePressOut = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    if (!isLongPress.current) {
      onPress?.();
    }
  }, [onPress]);

  return {
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    delayLongPress,
  };
};

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minDistance?: number; // minimum swipe distance in pixels
}

/**
 * Hook to detect swipe gestures
 * Usage: const swipeHandlers = useSwipe({ onSwipeLeft: () => {} })
 */
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  minDistance = 50,
}: UseSwipeOptions) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStart.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: GestureResponderEvent) => {
      if (!touchStart.current) return;

      const deltaX = e.nativeEvent.pageX - touchStart.current.x;
      const deltaY = e.nativeEvent.pageY - touchStart.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine swipe direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (absDeltaX > minDistance) {
          if (deltaX > 0) {
            HapticFeedback.swipe();
            onSwipeRight?.();
          } else {
            HapticFeedback.swipe();
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (absDeltaY > minDistance) {
          if (deltaY > 0) {
            HapticFeedback.swipe();
            onSwipeDown?.();
          } else {
            HapticFeedback.swipe();
            onSwipeUp?.();
          }
        }
      }

      touchStart.current = null;
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minDistance]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

/**
 * Combine multiple gesture handlers
 * Usage: const handlers = useCombinedGestures([doubleTapHandlers, swipeHandlers])
 */
export const useCombinedGestures = (...handlers: any[]) => {
  return handlers.reduce((acc, handler) => {
    return { ...acc, ...handler };
  }, {});
};

/**
 * Hook to detect pull to refresh gesture at top of scroll
 */
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const isRefreshing = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing.current) return;
    
    isRefreshing.current = true;
    HapticFeedback.refresh();
    
    try {
      await onRefresh();
    } finally {
      isRefreshing.current = false;
    }
  }, [onRefresh]);

  return {
    onRefresh: handleRefresh,
    refreshing: isRefreshing.current,
  };
};

/**
 * Hook to detect edge swipe (from screen edge)
 */
interface UseEdgeSwipeOptions {
  onSwipeFromLeft?: () => void;
  onSwipeFromRight?: () => void;
  onSwipeFromBottom?: () => void;
  edgeThreshold?: number; // pixels from edge to trigger
  minDistance?: number;
}

export const useEdgeSwipe = ({
  onSwipeFromLeft,
  onSwipeFromRight,
  onSwipeFromBottom,
  edgeThreshold = 30,
  minDistance = 80,
}: UseEdgeSwipeOptions) => {
  const touchStart = useRef<{ x: number; y: number; isEdge: boolean } | null>(null);

  const handleTouchStart = useCallback(
    (e: GestureResponderEvent, screenWidth: number, screenHeight: number) => {
      const x = e.nativeEvent.pageX;
      const y = e.nativeEvent.pageY;

      const isLeftEdge = x < edgeThreshold;
      const isRightEdge = x > screenWidth - edgeThreshold;
      const isBottomEdge = y > screenHeight - edgeThreshold;

      touchStart.current = {
        x,
        y,
        isEdge: isLeftEdge || isRightEdge || isBottomEdge,
      };
    },
    [edgeThreshold]
  );

  const handleTouchEnd = useCallback(
    (e: GestureResponderEvent, screenWidth: number, screenHeight: number) => {
      if (!touchStart.current || !touchStart.current.isEdge) {
        touchStart.current = null;
        return;
      }

      const deltaX = e.nativeEvent.pageX - touchStart.current.x;
      const deltaY = e.nativeEvent.pageY - touchStart.current.y;

      // Swipe from left edge
      if (touchStart.current.x < edgeThreshold && deltaX > minDistance) {
        HapticFeedback.menuOpen();
        onSwipeFromLeft?.();
      }
      // Swipe from right edge
      else if (
        touchStart.current.x > screenWidth - edgeThreshold &&
        deltaX < -minDistance
      ) {
        HapticFeedback.menuOpen();
        onSwipeFromRight?.();
      }
      // Swipe from bottom edge
      else if (
        touchStart.current.y > screenHeight - edgeThreshold &&
        deltaY < -minDistance
      ) {
        HapticFeedback.menuOpen();
        onSwipeFromBottom?.();
      }

      touchStart.current = null;
    },
    [onSwipeFromLeft, onSwipeFromRight, onSwipeFromBottom, edgeThreshold, minDistance]
  );

  return {
    handleTouchStart,
    handleTouchEnd,
  };
};
