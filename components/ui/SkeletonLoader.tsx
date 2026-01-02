import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Basic skeleton loader with shimmer animation
 * Used for placeholder content while loading
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const skeletonColor = useThemeColor({}, 'border');
  const shimmerColor = useThemeColor({}, 'surface');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: skeletonColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: shimmerColor,
            opacity,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

/**
 * Service card skeleton matching the actual ServiceCard layout
 */
export function ServiceCardSkeleton() {
  const colors = {
    surface: useThemeColor({}, 'surface'),
    border: useThemeColor({}, 'border'),
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Header with category badge */}
      <View style={styles.cardHeader}>
        <SkeletonLoader width={80} height={24} borderRadius={12} />
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>

      {/* Title */}
      <SkeletonLoader
        width="80%"
        height={24}
        borderRadius={6}
        style={styles.titleSkeleton}
      />

      {/* Description lines */}
      <SkeletonLoader
        width="100%"
        height={16}
        borderRadius={4}
        style={styles.descSkeleton}
      />
      <SkeletonLoader
        width="90%"
        height={16}
        borderRadius={4}
        style={styles.descSkeleton}
      />

      {/* Price and duration */}
      <View style={styles.priceRow}>
        <SkeletonLoader width={100} height={20} borderRadius={4} />
        <SkeletonLoader width={80} height={20} borderRadius={4} />
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <SkeletonLoader width={70} height={36} borderRadius={8} />
        <SkeletonLoader width={70} height={36} borderRadius={8} />
        <SkeletonLoader width={70} height={36} borderRadius={8} />
      </View>
    </View>
  );
}

/**
 * Utility card skeleton matching the actual UtilityCard layout
 */
export function UtilityCardSkeleton() {
  const colors = {
    surface: useThemeColor({}, 'surface'),
    border: useThemeColor({}, 'border'),
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Header with icon and toggle */}
      <View style={styles.utilityHeader}>
        <View style={styles.utilityIconRow}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.utilityTextColumn}>
            <SkeletonLoader width={120} height={20} borderRadius={4} />
            <SkeletonLoader
              width={80}
              height={14}
              borderRadius={4}
              style={{ marginTop: 4 }}
            />
          </View>
        </View>
        <SkeletonLoader width={51} height={31} borderRadius={16} />
      </View>

      {/* Description */}
      <SkeletonLoader
        width="100%"
        height={16}
        borderRadius={4}
        style={styles.descSkeleton}
      />
      <SkeletonLoader
        width="70%"
        height={16}
        borderRadius={4}
        style={styles.descSkeleton}
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        <SkeletonLoader width={60} height={16} borderRadius={4} />
        <SkeletonLoader width={100} height={16} borderRadius={4} />
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <SkeletonLoader width={70} height={36} borderRadius={8} />
        <SkeletonLoader width={70} height={36} borderRadius={8} />
      </View>
    </View>
  );
}

/**
 * List skeleton - renders multiple card skeletons
 */
interface SkeletonListProps {
  count?: number;
  type?: 'service' | 'utility';
}

export function SkeletonList({ count = 3, type = 'service' }: SkeletonListProps) {
  const CardSkeleton = type === 'service' ? ServiceCardSkeleton : UtilityCardSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  descSkeleton: {
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  utilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  utilityIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  utilityTextColumn: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
});
