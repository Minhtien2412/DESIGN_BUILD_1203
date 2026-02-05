/**
 * Skeleton Loader Component
 * Shows placeholder while content is loading
 */

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { useThemeColor } from "../../hooks/use-theme-color";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const backgroundColor = useThemeColor({}, "surfaceMuted");

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
      ]),
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
export function SkeletonText({
  lines = 3,
  style,
}: {
  lines?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.skeletonText, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? "60%" : "100%"}
          height={16}
          style={styles.textLine}
        />
      ))}
    </View>
  );
}

export function SkeletonCircle({
  size = 40,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
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

// ============================================================================
// Specialized Skeletons for App Sections
// ============================================================================

/** Grid skeleton for category icons */
export function SkeletonGrid({
  columns = 4,
  rows = 2,
  iconSize = 50,
  style,
}: {
  columns?: number;
  rows?: number;
  iconSize?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.gridContainer, style]}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <View key={colIndex} style={styles.gridItem}>
              <SkeletonCircle size={iconSize} />
              <Skeleton
                width={iconSize - 10}
                height={10}
                style={{ marginTop: 8 }}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Horizontal card list skeleton */
export function SkeletonHorizontalList({
  count = 3,
  cardWidth = 150,
  cardHeight = 120,
  style,
}: {
  count?: number;
  cardWidth?: number;
  cardHeight?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.horizontalList, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.horizontalCard, { width: cardWidth }]}>
          <Skeleton
            width="100%"
            height={cardHeight}
            borderRadius={BorderRadius.md}
          />
          <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
          <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

/** Home screen full skeleton */
export function SkeletonHome() {
  return (
    <View style={styles.homeContainer}>
      {/* Search bar */}
      <Skeleton
        width="100%"
        height={44}
        borderRadius={22}
        style={{ marginBottom: 16 }}
      />

      {/* Banner */}
      <Skeleton
        width="100%"
        height={160}
        borderRadius={BorderRadius.lg}
        style={{ marginBottom: 20 }}
      />

      {/* Category grid */}
      <SkeletonGrid columns={4} rows={2} style={{ marginBottom: 20 }} />

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Skeleton width={120} height={18} />
        <Skeleton width={60} height={14} />
      </View>

      {/* Horizontal products */}
      <SkeletonHorizontalList count={3} cardWidth={160} cardHeight={100} />

      {/* Another section */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Skeleton width={100} height={18} />
        <Skeleton width={60} height={14} />
      </View>

      {/* Vertical cards */}
      <SkeletonCard style={{ marginBottom: 12 }} />
      <SkeletonCard />
    </View>
  );
}

/** Profile screen skeleton */
export function SkeletonProfile() {
  return (
    <View style={styles.profileContainer}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <SkeletonCircle size={100} />
        <View style={styles.profileInfo}>
          <Skeleton width={150} height={20} />
          <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
          <Skeleton width={100} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.statItem}>
            <Skeleton width={40} height={24} />
            <Skeleton width={50} height={12} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Menu sections */}
      <View style={styles.menuSection}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.menuItem}>
            <SkeletonCircle size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
            </View>
            <Skeleton width={20} height={20} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Worker card skeleton */
export function SkeletonWorkerCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.workerCard, style]}>
      <SkeletonCircle size={70} />
      <View style={styles.workerInfo}>
        <Skeleton width={100} height={16} />
        <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
        <View style={styles.workerMeta}>
          <Skeleton width={50} height={14} />
          <Skeleton width={60} height={14} />
        </View>
      </View>
    </View>
  );
}

/** Product card skeleton */
export function SkeletonProductCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.productCard, style]}>
      <Skeleton width="100%" height={150} borderRadius={BorderRadius.md} />
      <View style={styles.productInfo}>
        <Skeleton width="90%" height={14} />
        <Skeleton width="60%" height={12} style={{ marginTop: 6 }} />
        <View style={styles.productFooter}>
          <Skeleton width={80} height={18} />
          <Skeleton width={50} height={14} />
        </View>
      </View>
    </View>
  );
}

/** Service card skeleton */
export function SkeletonServiceCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.serviceCard, style]}>
      <Skeleton width="100%" height={120} borderRadius={BorderRadius.md} />
      <View style={{ padding: Spacing[3] }}>
        <Skeleton width="80%" height={16} />
        <Skeleton width="100%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
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
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "center",
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
  // Grid styles
  gridContainer: {
    padding: Spacing[4],
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing[4],
  },
  gridItem: {
    alignItems: "center",
  },
  // Horizontal list
  horizontalList: {
    flexDirection: "row",
    gap: Spacing[3],
  },
  horizontalCard: {
    marginRight: Spacing[3],
  },
  // Home skeleton
  homeContainer: {
    padding: Spacing[4],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[3],
  },
  // Profile skeleton
  profileContainer: {
    padding: Spacing[4],
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing[5],
  },
  profileInfo: {
    marginLeft: Spacing[4],
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing[4],
    marginBottom: Spacing[4],
  },
  statItem: {
    alignItems: "center",
  },
  menuSection: {
    gap: Spacing[2],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[3],
  },
  // Worker card
  workerCard: {
    flexDirection: "row",
    padding: Spacing[3],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[3],
  },
  workerInfo: {
    flex: 1,
    marginLeft: Spacing[3],
    justifyContent: "center",
  },
  workerMeta: {
    flexDirection: "row",
    marginTop: Spacing[2],
    gap: Spacing[3],
  },
  // Product card
  productCard: {
    width: 160,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  productInfo: {
    padding: Spacing[2],
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing[2],
  },
  // Service card
  serviceCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing[3],
  },
});

export default Skeleton;
