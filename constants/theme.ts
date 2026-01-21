/**
 * Modern Minimalist Design System
 * Blue - Black - White palette (Professional & Clean)
 * Sophisticated, Simple, Timeless
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Primary colors (Professional Blue)
    primary: "#0066CC", // Professional blue
    secondary: "#333333", // Charcoal gray
    accent: "#0080FF", // Bright blue

    // Semantic colors
    success: "#0066CC", // Blue
    warning: "#0080FF", // Bright blue
    error: "#000000", // Black
    info: "#0066CC", // Professional blue

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
    tabIconSelected: "#0066CC", // Professional blue

    // Legacy compatibility
    tint: "#0066CC", // Professional blue
    icon: "#000000", // Pure black
    danger: "#000000",
    shadow: "rgba(0,0,0,0.08)", // Subtle shadow
    overlay: "rgba(0,0,0,0.85)",
    chipBackground: "#F5F5F5",
    chipText: "#333333",
    accentSoft: "#E6F2FF", // Light blue tint

    // Additional elements
    gold: "#0066CC",
    goldLight: "#E6F2FF",
    goldDark: "#004C99",
    marble: "#F5F5F5",
    charcoal: "#000000",
  },
  dark: {
    // Primary colors (dark mode)
    primary: "#0080FF", // Bright blue
    secondary: "#999999", // Light gray
    accent: "#0080FF", // Bright blue

    // Semantic colors
    success: "#0080FF", // Bright blue
    warning: "#0080FF", // Bright blue
    error: "#E0E0E0", // Light gray
    info: "#0080FF", // Bright blue

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
    tabIconSelected: "#0080FF", // Bright blue

    // Legacy compatibility
    tint: "#0080FF",
    icon: "#FFFFFF",
    danger: "#E0E0E0",
    shadow: "rgba(0,0,0,0.5)",
    overlay: "rgba(0,0,0,0.9)",
    chipBackground: "#2A2A2A",
    chipText: "#0080FF",
    accentSoft: "#0D1F33",

    // Additional elements
    gold: "#0066CC",
    goldLight: "#1A2A3A",
    goldDark: "#0080FF",
    marble: "#1A1A1A",
    charcoal: "#0A0A0A",
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
export const COLORS = Colors.light;
