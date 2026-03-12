/**
 * AuthBackground
 *
 * Premium dark animated backdrop for auth screens.
 * Uses floating blobs with animated transforms for a modern glass feel.
 * Consistent with the AUTH_THEME design tokens.
 */

import { AUTH_THEME as T } from "@/constants/auth-theme";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, ViewProps } from "react-native";

type Props = ViewProps & {
  children: React.ReactNode;
};

export default function AuthBackground({ style, children, ...rest }: Props) {
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopFloat = (anim: Animated.Value, to: number, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: to,
            duration: 6000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, {
            toValue: -to,
            duration: 6000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();

    const loopRotate = () =>
      Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 18000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

    loopFloat(float1, 12);
    loopFloat(float2, 16, 800);
    loopRotate();
  }, [float1, float2, rotate]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, style]} {...rest}>
      {/* Subtle floating blob - top left */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: T.primaryGlow,
            pointerEvents: "none",
            transform: [
              { translateY: float1 },
              { translateX: float2 },
              { scale: 1.05 },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      />
      {/* Subtle floating blob - bottom right */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobRight,
          {
            backgroundColor: T.accentGlow,
            pointerEvents: "none",
            transform: [
              { translateY: float2 },
              { translateX: float1 },
              { scale: 0.95 },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: T.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  blob: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    top: -120,
    left: -120,
  },
  blobRight: {
    top: undefined,
    bottom: -140,
    right: -140,
    left: undefined,
  },
});
