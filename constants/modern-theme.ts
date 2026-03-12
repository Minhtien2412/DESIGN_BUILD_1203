/**
 * Modern Theme - Minimalist Blue + Black + White
 * Updated: 01/05/2026
 *
 * Usage:
 * import { MODERN_COLORS } from '@/constants/modern-theme';
 * backgroundColor: MODERN_COLORS.primary
 */

/**
 * Modern Dimensions
 */
import { Dimensions } from "react-native";

export const MODERN_COLORS = {
  // Primary - Professional Teal
  primary: "#0D9488",
  primaryLight: "#14B8A6",
  primaryDark: "#0F766E",
  primaryBg: "#F0FDFA",

  // Secondary - Charcoal Gray (Minimalist)
  secondary: "#333333",
  secondaryLight: "#666666",
  secondaryDark: "#000000",
  secondaryBg: "#F5F5F5",

  // Gradients (Teal-based)
  gradientPrimary: ["#14B8A6", "#0D9488"], // Teal gradient
  gradientSecondary: ["#333333", "#000000"], // Charcoal gradient
  gradientPurple: ["#0D9488", "#0F766E"], // Deep teal
  gradientBlue: ["#14B8A6", "#0D9488"], // Teal gradient

  // E-commerce Special (Teal Theme)
  flashSale: "#0D9488", // Teal for hot items
  discount: "#14B8A6", // Bright teal for discounts
  new: "#14B8A6", // Bright teal for new items
  favorite: "#14B8A6", // Bright teal for wishlist

  // Neutrals - Clean Minimalist
  background: "#FFFFFF", // Pure white background
  surface: "#FFFFFF", // Pure white cards
  surfaceHover: "#F5F5F5", // Off-white hover
  border: "#E0E0E0", // Light gray borders
  divider: "#E0E0E0", // Light gray dividers

  // Gray Scale
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#E0E0E0",
  gray300: "#CCCCCC",
  gray400: "#999999",
  gray500: "#666666",
  gray600: "#4D4D4D",
  gray700: "#333333",
  gray800: "#1A1A1A",
  gray900: "#0D0D0D",

  // Accent Scale (teal tints)
  orange50: "#F0FDFA",
  orange500: "#14B8A6",

  // Text (High Contrast)
  text: "#000000", // Pure black primary text
  textSecondary: "#333333", // Charcoal secondary text
  textTertiary: "#666666", // Gray tertiary text
  textDisabled: "#999999", // Light gray disabled
  textOnPrimary: "#FFFFFF", // White on teal

  // Semantic Colors
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#0D9488",
  error: "#EF4444",

  // Overlays (Darker for sophistication)
  overlay: "rgba(0, 0, 0, 0.85)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
  overlayDark: "rgba(0, 0, 0, 0.95)",
} as const;

/**
 * Modern Shadow Presets
 */
export const MODERN_SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

/**
 * Modern Spacing Scale (based on 4px grid)
 */
export const MODERN_SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Modern Border Radius
 */
export const MODERN_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

/**
 * Typography Scale
 */
export const MODERN_TYPOGRAPHY = {
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
  },
  // Font Weights
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  // Line Heights (absolute values for React Native)
  // React Native requires absolute pixel values, not multipliers
  lineHeight: {
    tight: 16, // ~1.2x for small text
    normal: 20, // ~1.5x for body text (sm=12, md=14)
    relaxed: 24, // ~1.75x for larger text
  },
} as const;

/**
 * Helper function to create gradient background style
 *
 * Usage:
 * import { LinearGradient } from 'expo-linear-gradient';
 * <LinearGradient colors={MODERN_COLORS.gradientPrimary} ...>
 */
export const createGradient = (colors: readonly string[]) => ({
  colors,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const MODERN_DIMENSIONS = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  // Product Grid (2 columns)
  productCardWidth:
    (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.xs) / 2,

  // Common Heights
  headerHeight: 56,
  tabBarHeight: 60,
  searchBarHeight: 44,
  bannerHeight: 160,
  buttonHeight: 48,
  inputHeight: 48,
} as const;

/**
 * Export all as default for convenience
 */
export default {
  colors: MODERN_COLORS,
  shadows: MODERN_SHADOWS,
  spacing: MODERN_SPACING,
  radius: MODERN_RADIUS,
  typography: MODERN_TYPOGRAPHY,
  dimensions: MODERN_DIMENSIONS,
};
