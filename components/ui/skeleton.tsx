/**
 * Skeleton Loader Component
 * Shows placeholder while content is loading
 */

import { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    type ViewStyle,
} from 'react-native';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useThemeColor } from '../../hooks/use-theme-color';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const backgroundColor = useThemeColor({}, 'surfaceMuted');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        } as any,
        { opacity },
        style,
      ]}
    />
  );
}

// Preset skeleton components
export function SkeletonText({ lines = 3, style }: { lines?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.skeletonText, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={16}
          style={styles.textLine}
        />
      ))}
    </View>
  );
}

export function SkeletonCircle({ size = 40, style }: { size?: number; style?: ViewStyle }) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.skeletonCard, style]}>
      <Skeleton height={150} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Skeleton height={20} width="80%" style={styles.cardTitle} />
        <Skeleton height={16} width="100%" style={styles.cardText} />
        <Skeleton height={16} width="90%" />
      </View>
    </View>
  );
}

export function SkeletonAvatar({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.skeletonAvatar, style]}>
      <SkeletonCircle size={48} style={styles.avatar} />
      <View style={styles.avatarText}>
        <Skeleton height={16} width={120} style={styles.avatarName} />
        <Skeleton height={14} width={80} />
      </View>
    </View>
  );
}

export function SkeletonList({
  count = 5,
  style,
}: {
  count?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonAvatar key={index} style={styles.listItem} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonText: {
    gap: Spacing[2],
  },
  textLine: {
    marginBottom: Spacing[1],
  },
  skeletonCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  cardContent: {
    padding: Spacing[4],
    gap: Spacing[2],
  },
  cardTitle: {
    marginBottom: Spacing[1],
  },
  cardText: {
    marginBottom: Spacing[1],
  },
  skeletonAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  avatar: {
    // No additional styles needed
  },
  avatarText: {
    flex: 1,
    gap: Spacing[2],
  },
  avatarName: {
    marginBottom: Spacing[1],
  },
  listItem: {
    marginBottom: Spacing[4],
  },
});

export default Skeleton;
