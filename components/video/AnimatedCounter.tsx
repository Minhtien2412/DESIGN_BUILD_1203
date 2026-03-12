/**
 * AnimatedCounter - Animated number counter with easing
 * VIDEO-005: Real-time counter animation
 */

import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TextStyle, ViewStyle } from "react-native";

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  prefix?: string;
  suffix?: string;
}

/**
 * Format large numbers (1K, 1M, 1B)
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  if (num < 1000000000)
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  return `${(num / 1000000000).toFixed(1).replace(/\.0$/, "")}B`;
}

/**
 * Animated counter component with smooth transitions
 */
export function AnimatedCounter({
  value,
  duration = 300,
  formatFn = formatCompactNumber,
  style,
  containerStyle,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps): React.ReactElement {
  const [displayValue, setDisplayValue] = useState(value);
  const animatedValue = useRef(new Animated.Value(value)).current;
  const previousValue = useRef(value);

  useEffect(() => {
    // Animate from previous to new value
    const fromValue = previousValue.current;
    previousValue.current = value;

    // Reset animated value
    animatedValue.setValue(fromValue);

    // Start animation
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    // Listen to animated value changes
    const listenerId = animatedValue.addListener(({ value: animValue }) => {
      setDisplayValue(Math.round(animValue));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration]);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.text, style]}>
        {prefix}
        {formatFn(displayValue)}
        {suffix}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * Pulse animation on value change
 */
export function usePulseAnimation(value: number): Animated.Value {
  const scale = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current !== value) {
      previousValue.current = value;

      // Pulse animation sequence
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [value]);

  return scale;
}

/**
 * Like button animation hook
 */
export function useLikeAnimation() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animateLike = (isLiked: boolean) => {
    if (isLiked) {
      // Pop effect when liking
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.4,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]),
        // Heart burst effect
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Quick scale down when unliking
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return {
    scale,
    burstOpacity: opacity,
    animateLike,
  };
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AnimatedCounter;
