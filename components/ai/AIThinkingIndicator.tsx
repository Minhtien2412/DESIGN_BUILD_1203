/**
 * AI Thinking Indicator Component
 * Shows animated dots when AI is processing
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export function AIThinkingIndicator() {
  const tintColor = useThemeColor({}, 'tint');
  
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      createAnimation(dot1, 0),
      createAnimation(dot2, 150),
      createAnimation(dot3, 300),
    ]);

    animation.start();

    return () => animation.stop();
  }, []);

  const dotStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
        <Text style={[styles.avatarText, { color: tintColor }]}>AI</Text>
      </View>

      <View style={styles.bubble}>
        <Text style={styles.text}>AI đang suy nghĩ</Text>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[styles.dot, { backgroundColor: tintColor }, dotStyle(dot1)]}
          />
          <Animated.View
            style={[styles.dot, { backgroundColor: tintColor }, dotStyle(dot2)]}
          />
          <Animated.View
            style={[styles.dot, { backgroundColor: tintColor }, dotStyle(dot3)]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 15,
    color: '#666',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
