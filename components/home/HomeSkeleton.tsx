/**
 * HomeSkeleton — Loading skeleton for home screen sections (with pulse animation)
 */
import { memo, useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;

const SkeletonBox = memo<{
  width: number;
  height: number;
  borderRadius?: number;
  opacity: Animated.Value;
}>(({ width, height, borderRadius = 4, opacity }) => (
  <Animated.View
    style={[styles.skeleton, { width, height, borderRadius, opacity }]}
  />
));

export const HomeSkeleton = memo(() => {
  const cellW = (SW - PAD * 2) / 4;
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.container}>
      {/* Search bar skeleton */}
      <View style={styles.searchRow}>
        <SkeletonBox
          width={SW - PAD * 2 - 130}
          height={40}
          borderRadius={20}
          opacity={pulse}
        />
        <SkeletonBox width={36} height={36} borderRadius={18} opacity={pulse} />
        <SkeletonBox width={36} height={36} borderRadius={18} opacity={pulse} />
        <SkeletonBox width={36} height={36} borderRadius={4} opacity={pulse} />
      </View>

      {/* Section title skeleton */}
      <View style={styles.sectionRow}>
        <SkeletonBox width={120} height={14} opacity={pulse} />
        <SkeletonBox width={80} height={24} borderRadius={12} opacity={pulse} />
      </View>

      {/* Icon grid skeleton — 2 rows × 4 cols */}
      <View style={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.gridCell, { width: cellW }]}>
            <SkeletonBox width={60} height={60} opacity={pulse} />
            <SkeletonBox width={48} height={10} opacity={pulse} />
          </View>
        ))}
      </View>

      {/* Banner skeleton */}
      <View style={styles.bannerRow}>
        <SkeletonBox
          width={SW - PAD * 2}
          height={(SW - PAD * 2) * 0.48}
          borderRadius={8}
          opacity={pulse}
        />
      </View>

      {/* Another section */}
      <View style={styles.sectionRow}>
        <SkeletonBox width={140} height={14} opacity={pulse} />
      </View>

      {/* Second grid skeleton */}
      <View style={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`b-${i}`} style={[styles.gridCell, { width: cellW }]}>
            <SkeletonBox width={60} height={60} opacity={pulse} />
            <SkeletonBox width={48} height={10} opacity={pulse} />
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  skeleton: {
    backgroundColor: "#E5E7EB",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PAD,
    gap: 10,
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PAD,
    marginTop: 20,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
  },
  gridCell: {
    alignItems: "center",
    marginBottom: 14,
    gap: 6,
  },
  bannerRow: {
    paddingHorizontal: PAD,
    marginTop: 16,
  },
});
