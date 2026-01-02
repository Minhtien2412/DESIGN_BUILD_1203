/**
 * Double Tap Heart Animation
 * Heart burst animation when double-tapping video
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface DoubleTapHeartProps {
  x: number;
  y: number;
}

export function DoubleTapHeart({ x, y }: DoubleTapHeartProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      // Scale up
      Animated.spring(scale, {
        toValue: 1.5,
        useNativeDriver: true,
        friction: 3,
        tension: 100,
      }),
      // Float up
      Animated.timing(translateY, {
        toValue: -100,
        duration: 800,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x - 50,
          top: y - 50,
          transform: [{ scale }, { translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name="heart" size={100} color="#FE2C55" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
});
