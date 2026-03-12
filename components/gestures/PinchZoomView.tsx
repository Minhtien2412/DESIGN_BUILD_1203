/**
 * Pinch to Zoom Component
 * Hỗ trợ zoom ảnh bằng gesture pinch (2 ngón)
 */

import React, { useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';

interface PinchZoomViewProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  style?: ViewStyle;
}

export function PinchZoomView({
  children,
  minScale = 1,
  maxScale = 4,
  style,
}: PinchZoomViewProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(1);

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: PinchGestureHandlerGestureEvent) => {
    const { scale: eventScale } = event.nativeEvent;
    
    // Tính scale mới
    const newScale = baseScale.current * eventScale;
    
    // Giới hạn trong min/max
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
    
    // Khi kết thúc gesture, lưu scale hiện tại
    if (event.nativeEvent.state === 5) { // ENDED
      baseScale.current = clampedScale;
      
      // Reset về 1x nếu scale < 1.2
      if (clampedScale < 1.2) {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
        baseScale.current = 1;
      }
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
    >
      <Animated.View style={[styles.container, style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
