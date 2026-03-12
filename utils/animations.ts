/**
 * Animation Utilities
 * Reusable animation presets using React Native Reanimated
 */

import { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

/**
 * Spring animation config
 */
export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

/**
 * Timing animation config
 */
export const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Fade in animation
 */
export const useFadeIn = (delay = 0) => {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      ...TIMING_CONFIG,
      duration: 300 + delay,
    }),
  }));

  const fadeIn = () => {
    opacity.value = 1;
  };

  return { animatedStyle, fadeIn };
};

/**
 * Slide in from bottom animation
 */
export const useSlideInBottom = (distance = 50) => {
  const translateY = useSharedValue(distance);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(translateY.value, SPRING_CONFIG) }],
  }));

  const slideIn = () => {
    translateY.value = 0;
  };

  const slideOut = () => {
    translateY.value = distance;
  };

  return { animatedStyle, slideIn, slideOut };
};

/**
 * Scale animation (for buttons)
 */
export const useScaleAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleIn = () => {
    scale.value = withSpring(0.95, SPRING_CONFIG);
  };

  const scaleOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  return { animatedStyle, scaleIn, scaleOut };
};

/**
 * Bounce animation
 */
export const useBounce = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bounce = () => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 2, stiffness: 300 }),
      withSpring(1, SPRING_CONFIG)
    );
  };

  return { animatedStyle, bounce };
};

/**
 * Shake animation (for errors)
 */
export const useShake = () => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return { animatedStyle, shake };
};

/**
 * Rotate animation
 */
export const useRotate = () => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rotate = (degrees: number = 360) => {
    rotation.value = withTiming(degrees, TIMING_CONFIG);
  };

  const reset = () => {
    rotation.value = withTiming(0, TIMING_CONFIG);
  };

  return { animatedStyle, rotate, reset };
};

/**
 * Progress bar animation
 */
export const useProgressBar = () => {
  const width = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const setProgress = (percentage: number) => {
    width.value = withSpring(percentage, SPRING_CONFIG);
  };

  return { animatedStyle, setProgress };
};

/**
 * Card flip animation
 */
export const useCardFlip = () => {
  const rotateY = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value + 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const flip = () => {
    rotateY.value = withSpring(rotateY.value === 0 ? 180 : 0, SPRING_CONFIG);
  };

  return { frontAnimatedStyle, backAnimatedStyle, flip };
};

/**
 * Stagger animation for lists
 */
export const useStagger = (index: number, delay = 50) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    }),
    transform: [
      {
        translateY: withTiming(translateY.value, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  const animate = () => {
    setTimeout(() => {
      opacity.value = 1;
      translateY.value = 0;
    }, index * delay);
  };

  return { animatedStyle, animate };
};

/**
 * Pulse animation (for notifications)
 */
export const usePulse = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 500 }),
      withTiming(1, { duration: 500 })
    );
  };

  return { animatedStyle, pulse };
};

/**
 * Skeleton loading animation
 */
export const useSkeletonLoading = () => {
  const opacity = useSharedValue(0.3);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0.3, { duration: 1000 })
    ),
  }));

  return { animatedStyle };
};

/**
 * Export all animation hooks
 */
export default {
  useFadeIn,
  useSlideInBottom,
  useScaleAnimation,
  useBounce,
  useShake,
  useRotate,
  useProgressBar,
  useCardFlip,
  useStagger,
  usePulse,
  useSkeletonLoading,
  SPRING_CONFIG,
  TIMING_CONFIG,
};
