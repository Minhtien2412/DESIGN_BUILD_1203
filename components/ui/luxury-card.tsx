/**
 * Luxury Card Component
 * European-inspired elegant card with smooth animations
 */

import { Colors } from '@/constants/theme';
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface LuxuryCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  borderAccent?: boolean;
}

export function LuxuryCard({ 
  children, 
  onPress, 
  style, 
  elevated = true,
  borderAccent = false 
}: LuxuryCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(elevated ? 1 : 0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        damping: 15,
        mass: 1,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        mass: 1,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: elevated ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animatedShadow = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        elevated && {
          shadowOpacity: shadowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.08],
          }),
          elevation: animatedShadow,
        },
        borderAccent && styles.borderAccent,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{ marginBottom: 16 }}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  borderAccent: {
    borderTopWidth: 3,
    borderTopColor: Colors.light.accent,
  },
});
