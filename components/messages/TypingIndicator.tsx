/**
 * TypingIndicator Component
 * Shows when other user is typing (animated dots)
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface TypingIndicatorProps {
  userName?: string;
}

export default function TypingIndicator({ userName }: TypingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      const duration = 400;
      const delay = 150;

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.sequence([
              Animated.timing(dot1, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(dot1, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot2, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(dot2, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.delay(delay * 2),
              Animated.timing(dot3, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(dot3, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      ).start();
    };

    animate();
  }, []);

  const getDotStyle = (animValue: Animated.Value) => ({
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
});
