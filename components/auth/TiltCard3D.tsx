/**
 * 3D Tilt Card Component
 * Adds perspective tilt effect on user interaction
 * Inspired by 3D card animations
 */

import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TiltCard3DProps {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  style?: any;
}

export function TiltCard3D({
  children,
  maxTilt = 20,
  perspective = 1000,
  style,
}: TiltCard3DProps) {
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        // Scale up slightly on press
        Animated.spring(scale, {
          toValue: 1.05,
          useNativeDriver: true,
          friction: 6,
        }).start();
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const cardWidth = SCREEN_WIDTH - 40;
        const cardHeight = 500;
        
        // Calculate rotation based on touch position
        // Center is 0, edges are ±maxTilt
        const centerX = cardWidth / 2;
        const centerY = cardHeight / 2;
        
        const tiltX = ((locationY - centerY) / centerY) * -maxTilt;
        const tiltY = ((locationX - centerX) / centerX) * maxTilt;
        
        Animated.parallel([
          Animated.spring(rotateX, {
            toValue: tiltX,
            useNativeDriver: true,
            friction: 6,
          }),
          Animated.spring(rotateY, {
            toValue: tiltY,
            useNativeDriver: true,
            friction: 6,
          }),
        ]).start();
      },
      
      onPanResponderRelease: () => {
        // Reset to original position
        Animated.parallel([
          Animated.spring(rotateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
          }),
          Animated.spring(rotateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
          }),
        ]).start();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { perspective },
      {
        rotateX: rotateX.interpolate({
          inputRange: [-maxTilt, maxTilt],
          outputRange: [`${-maxTilt}deg`, `${maxTilt}deg`],
        }),
      },
      {
        rotateY: rotateY.interpolate({
          inputRange: [-maxTilt, maxTilt],
          outputRange: [`${-maxTilt}deg`, `${maxTilt}deg`],
        }),
      },
      { scale },
    ],
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.container, style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
