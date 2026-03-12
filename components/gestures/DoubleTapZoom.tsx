/**
 * Double Tap to Zoom Component
 * Nhấn đúp để zoom in/out
 */

import React, { useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';

interface DoubleTapZoomProps {
  children: React.ReactNode;
  zoomScale?: number;
  style?: ViewStyle;
}

export function DoubleTapZoom({
  children,
  zoomScale = 2,
  style,
}: DoubleTapZoomProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isZoomed = useRef(false);

  const onDoubleTap = () => {
    const toValue = isZoomed.current ? 1 : zoomScale;
    
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

    isZoomed.current = !isZoomed.current;
  };

  return (
    <TapGestureHandler
      onActivated={onDoubleTap}
      numberOfTaps={2}
    >
      <Animated.View style={[styles.container, style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
