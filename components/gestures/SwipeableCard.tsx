/**
 * Swipeable Card Component
 * Hỗ trợ vuốt trái/phải để thực hiện các hành động
 */

import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useThemeColor } from '../../hooks/use-theme-color';

interface SwipeAction {
  label: string;
  color: string;
  icon?: string;
  onPress: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number; // Ngưỡng kích hoạt action (px)
  style?: ViewStyle;
}

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  threshold = 80,
  style,
}: SwipeableCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, velocityX } = event.nativeEvent;

    // Vuốt trái (rightAction)
    if (translationX < -threshold && rightAction) {
      Animated.timing(translateX, {
        toValue: -150,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        rightAction.onPress();
        resetPosition();
      });
    }
    // Vuốt phải (leftAction)
    else if (translationX > threshold && leftAction) {
      Animated.timing(translateX, {
        toValue: 150,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        leftAction.onPress();
        resetPosition();
      });
    }
    // Reset về vị trí ban đầu
    else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: background, borderColor: border }, style]}>
      {/* Left Action */}
      {leftAction && (
        <View style={[styles.actionContainer, styles.leftAction, { backgroundColor: leftAction.color }]}>
          <Text style={styles.actionText}>{leftAction.label}</Text>
        </View>
      )}

      {/* Right Action */}
      {rightAction && (
        <View style={[styles.actionContainer, styles.rightAction, { backgroundColor: rightAction.color }]}>
          <Text style={styles.actionText}>{rightAction.label}</Text>
        </View>
      )}

      {/* Swipeable Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: background, transform: [{ translateX }] },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 6,
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    zIndex: 1,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    zIndex: 2,
    padding: 16,
    borderRadius: 12,
  },
});
