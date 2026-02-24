/**
 * Modern Minimalist Design System
 * Teal - Black - White palette (Professional & Clean)
 * Sophisticated, Simple, Timeless
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Primary colors (Professional Teal)
    primary: "#0D9488", // Teal
    secondary: "#333333", // Charcoal gray
    accent: "#14B8A6", // Bright teal

    // Semantic colors
    success: "#10B981", // Green
    warning: "#F59E0B", // Amber
    error: "#EF4444", // Red
    info: "#0D9488", // Teal

    // Text colors (High contrast)
    text: "#000000", // Pure black
    textMuted: "#666666", // Medium gray
    textInverse: "#FFFFFF", // Pure white

    // Background colors (Clean white base)
    background: "#FFFFFF", // Pure white
    surface: "#FFFFFF", // Pure white
    surfaceMuted: "#F5F5F5", // Off white
    surfaceAlt: "#F5F5F5", // Off white
    card: "#FFFFFF", // Pure white cards

    // Border colors (Subtle)
    border: "#E0E0E0", // Light gray border
    borderStrong: "#999999", // Medium border

    // Tab bar
    tabIconDefault: "#666666", // Gray
    tabIconSelected: "#0D9488", // Teal

    // Legacy compatibility
    tint: "#0D9488", // Teal
    icon: "#000000", // Pure black
    danger: "#EF4444",
    shadow: "rgba(0,0,0,0.08)", // Subtle shadow
    overlay: "rgba(0,0,0,0.85)",
    chipBackground: "#F0FDFA",
    chipText: "#0D9488",
    accentSoft: "#F0FDFA", // Light teal tint

    // Additional elements
    gold: "#F59E0B",
    goldLight: "#FFFBEB",
    goldDark: "#B45309",
    marble: "#F5F5F5",
    charcoal: "#000000",

    // Basic colors
    white: "#FFFFFF",
    black: "#000000",
    textSecondary: "#666666",
    secondaryText: "#666666",
  },
  dark: {
    // Primary colors (dark mode)
    primary: "#14B8A6", // Bright teal
    secondary: "#999999", // Light gray
    accent: "#14B8A6", // Bright teal

    // Semantic colors
    success: "#10B981", // Green
    warning: "#F59E0B", // Amber
    error: "#F87171", // Red
    info: "#14B8A6", // Bright teal

    // Text colors (dark contrast)
    text: "#FFFFFF", // Pure white
    textMuted: "#999999", // Light gray
    textInverse: "#000000", // Pure black

    // Background colors (Deep black base)
    background: "#000000", // Pure black
    surface: "#1A1A1A", // Soft black
    surfaceMuted: "#2A2A2A", // Dark gray
    surfaceAlt: "#2A2A2A", // Dark gray
    card: "#1A1A1A", // Soft black cards

    // Border colors
    border: "#2A2A2A", // Dark border
    borderStrong: "#404040", // Medium border

    // Tab bar
    tabIconDefault: "#999999",
    tabIconSelected: "#14B8A6", // Bright teal

    // Legacy compatibility
    tint: "#14B8A6",
    icon: "#FFFFFF",
    danger: "#F87171",
    shadow: "rgba(0,0,0,0.5)",
    overlay: "rgba(0,0,0,0.9)",
    chipBackground: "#1A2A2A",
    chipText: "#14B8A6",
    accentSoft: "#0D1F1D",

    // Additional elements
    gold: "#F59E0B",
    goldLight: "#1A2A1A",
    goldDark: "#14B8A6",
    marble: "#1A1A1A",
    charcoal: "#0A0A0A",

    // Basic colors
    white: "#FFFFFF",
    black: "#000000",
    textSecondary: "#999999",
    secondaryText: "#999999",
  },
};

// Default colors export for backward compatibility
// Use Colors.light or Colors.dark for theme-aware colors
export const DefaultColors = Colors.light;

// Common color shortcuts (default to light theme)
export const {
  primary,
  secondary,
  accent,
  success,
  warning,
  error,
  info,
  text,
  textMuted,
  textInverse,
  background,
  surface,
  border,
} = Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Design tokens for spacing, fonts, and radius
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  title: 20,
  heading: 28,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Backward compatibility alias
export const COLORS = {
  ...Colors.light,
  errorLight: "#FEF2F2", // Light red background for errors
  successLight: "#F0FDF4", // Light green background for success
  warningLight: "#FFFBEB", // Light amber background for warnings
  infoLight: "#F0FDFA", // Light teal background for info
  primaryLight: "#F0FDFA", // Light primary background
  textTertiary: "#999999", // Tertiary text color
};

// Typography constants for consistent text styling
export const TYPOGRAPHY = {
  fontFamily: {
    regular: Platform.select({
      ios: "System",
      android: "Roboto",
      default: "System",
    }),
    medium: Platform.select({
      ios: "System",
      android: "Roboto-Medium",
      default: "System",
    }),
    bold: Platform.select({
      ios: "System",
      android: "Roboto-Bold",
      default: "System",
    }),
    light: Platform.select({
      ios: "System",
      android: "Roboto-Light",
      default: "System",
    }),
  },
  fontSize: FONT_SIZE,
  sizes: FONT_SIZE, // Alias for backward compatibility
  lineHeight: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
    xxl: 36,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Extended colors with errorLight for backward compatibility
export const ExtendedColors = {
  ...Colors.light,
  errorLight: "#FEF2F2", // Light red background for errors
  successLight: "#F0FDF4", // Light green background for success
  warningLight: "#FFFBEB", // Light amber background for warnings
  infoLight: "#F0FDFA", // Light teal background for info
  primaryLight: "#F0FDFA", // Light primary background
  textTertiary: "#999999", // Tertiary text color
};

// Theme object for backward compatibility
export const theme = {
  colors: ExtendedColors,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  typography: TYPOGRAPHY,
  fonts: Fonts,
};
