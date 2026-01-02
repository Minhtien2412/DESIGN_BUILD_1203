import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewProps } from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
};

/**
 * AuthBackground
 * Lightweight animated backdrop for auth screens using theme colors.
 * Avoids extra deps (no LinearGradient/Lottie) and runs on RN Animated.
 */
export default function AuthBackground({ style, children, ...rest }: Props) {
  const bg = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');
  const surface = useThemeColor({}, 'surface');

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopFloat = (anim: Animated.Value, to: number, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: to, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true, delay }),
          Animated.timing(anim, { toValue: -to, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();

    const loopRotate = () =>
      Animated.loop(
        Animated.timing(rotate, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true })
      ).start();

    loopFloat(float1, 12);
    loopFloat(float2, 16, 800);
    loopRotate();
  }, [float1, float2, rotate]);

  const rotateInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]} {...rest}>
      {/* Subtle radial-ish layers using large blurred circles */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: primary + '33', // ~20% opacity
            pointerEvents: 'none',
            transform: [
              { translateY: float1 },
              { translateX: float2 },
              { scale: 1.05 },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobRight,
          {
            backgroundColor: accent + '2A', // ~16% opacity
            pointerEvents: 'none',
            transform: [
              { translateY: float2 },
              { translateX: float1 },
              { scale: 0.95 },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      />

      {/* Soft top gradient bar imitation */}
      <View style={[styles.topShade, { backgroundColor: surface + 'AA' }]} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  blob: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 420 / 2,
    top: -120,
    left: -120,
    // mimic blur by layering + transparency
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  blobRight: {
    top: undefined,
    bottom: -140,
    right: -140,
    left: undefined,
  },
  topShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
});
