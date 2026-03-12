/**
 * Draggable Item Component
 * Kéo thả item trong danh sách
 */

import React, { useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

interface DraggableItemProps {
  children: React.ReactNode;
  onDragEnd?: (x: number, y: number) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function DraggableItem({
  children,
  onDragEnd,
  style,
  disabled = false,
}: DraggableItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { translationX: x, translationY: y } = event.nativeEvent;

    if (event.nativeEvent.state === 5) { // ENDED
      // Callback với vị trí cuối
      onDragEnd?.(x, y);

      // Reset về vị trí ban đầu
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
      ]).start();
    }
  };

  if (disabled) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles
  },
});
