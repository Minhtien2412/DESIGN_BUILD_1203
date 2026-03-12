/**
 * Screen Loading Fallback Component
 * Used for Suspense boundaries when lazy loading screens
 *
 * @module components/ui/ScreenLoadingFallback
 * @created 2026-01-23
 */

import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../constants/theme";

const { width, height } = Dimensions.get("window");

interface ScreenLoadingFallbackProps {
  /** Loading message */
  message?: string;
  /** Show logo */
  showLogo?: boolean;
  /** Background color */
  backgroundColor?: string;
}

/**
 * Full screen loading fallback for lazy loaded screens
 */
export function ScreenLoadingFallback({
  message = "Đang tải...",
  showLogo = false,
  backgroundColor = COLORS.background,
}: ScreenLoadingFallbackProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Design Build</Text>
        </View>
      )}
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

/**
 * Skeleton loader for list items
 */
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Card skeleton for grid layouts
 */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.cardSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.cardSkeleton}>
          <View style={styles.cardSkeletonImage} />
          <View style={styles.cardSkeletonContent}>
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Inline loading indicator
 */
export function InlineLoading({
  size = "small",
}: {
  size?: "small" | "large";
}) {
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: height * 0.5,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
  },
  // Skeleton styles
  skeletonContainer: {
    padding: SPACING.md,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    padding: SPACING.sm,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  skeletonLineShort: {
    width: "60%",
  },
  // Card skeleton
  cardSkeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.sm,
  },
  cardSkeleton: {
    width: (width - SPACING.md * 3) / 2,
    margin: SPACING.xs,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },
  cardSkeletonImage: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.border,
  },
  cardSkeletonContent: {
    padding: SPACING.sm,
  },
  // Inline
  inlineContainer: {
    padding: SPACING.md,
    alignItems: "center",
  },
});

export default ScreenLoadingFallback;
