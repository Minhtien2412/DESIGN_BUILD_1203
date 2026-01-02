/**
 * 3D Flip Card Component
 * Inspired by: 3D Login and Sign Up Form
 * 
 * Features:
 * - Card flip animation with perspective
 * - Smooth 3D rotation (rotateY)
 * - Front (Login) and Back (Sign Up) sides
 * - Toggle button with indicator
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.7, 560);

interface FlipCard3DProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
}

export function FlipCard3D({
  frontContent,
  backContent,
  isFlipped = false,
  onFlip,
}: FlipCard3DProps) {
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  
  const flipAnim = useRef(new Animated.Value(isFlipped ? 180 : 0)).current;
  const [flipped, setFlipped] = React.useState(isFlipped);

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [flipped]);

  const handleFlip = () => {
    const newFlipped = !flipped;
    setFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  // Front side interpolation
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 90.001, 180],
    outputRange: [1, 1, 0, 0],
  });

  // Back side interpolation
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 89.999, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={styles.container}>
      {/* Toggle Switch */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={handleFlip}
          style={[styles.toggleButton, { borderColor: primary }]}
          activeOpacity={0.7}
        >
          <View style={styles.toggleLabels}>
            <Text style={[
              styles.toggleLabel,
              { color: !flipped ? primary : text },
              !flipped && styles.toggleLabelActive,
            ]}>
              Log In
            </Text>
            <Text style={[
              styles.toggleLabel,
              { color: flipped ? primary : text },
              flipped && styles.toggleLabelActive,
            ]}>
              Sign Up
            </Text>
          </View>
          <Animated.View
            style={[
              styles.toggleIndicator,
              { backgroundColor: primary },
              {
                transform: [
                  {
                    translateX: flipAnim.interpolate({
                      inputRange: [0, 180],
                      outputRange: [0, 76],
                    }),
                  },
                ],
              },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* 3D Card Container */}
      <View style={styles.cardContainer}>
        {/* Front Side (Login) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { backgroundColor: surface },
            {
              opacity: frontOpacity,
              transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
              pointerEvents: flipped ? 'none' : 'auto',
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {frontContent}
          </ScrollView>
        </Animated.View>

        {/* Back Side (Sign Up) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { backgroundColor: surface },
            {
              opacity: backOpacity,
              transform: [{ perspective: 1000 }, { rotateY: backRotate }],
              pointerEvents: flipped ? 'auto' : 'none',
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {backContent}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  
  // Toggle Switch
  toggleContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  toggleButton: {
    width: 180,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  toggleLabels: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 2,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 76,
    textAlign: 'center',
  },
  toggleLabelActive: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 76,
    height: 36,
    borderRadius: 18,
    zIndex: 1,
  },
  
  // 3D Card
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    maxWidth: 400,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
});
