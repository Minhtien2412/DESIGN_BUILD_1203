/**
 * Shadow Styles Utility
 * Converts deprecated shadow* props to modern boxShadow format
 * Compatible with React Native Web and native platforms
 */

import { Platform, TextStyle, ViewStyle } from "react-native";

interface ShadowConfig {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blurRadius?: number;
  spreadRadius?: number;
  opacity?: number;
}

interface LegacyShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

interface TextShadowConfig {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blurRadius?: number;
}

interface LegacyTextShadowStyle {
  textShadowColor?: string;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
}

/**
 * Convert RGBA color to hex with opacity
 */
const colorWithOpacity = (color: string, opacity: number): string => {
  // If color is already rgba, adjust the alpha
  if (color.startsWith("rgba")) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
  }

  // If color is hex
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Default fallback
  return `rgba(0, 0, 0, ${opacity})`;
};

/**
 * Create cross-platform shadow styles
 * Uses boxShadow for web, native shadow props for iOS/Android
 */
export const createShadow = (config: ShadowConfig): ViewStyle => {
  const {
    color = "#000000",
    offsetX = 0,
    offsetY = 2,
    blurRadius = 4,
    spreadRadius = 0,
    opacity = 0.25,
  } = config;

  const shadowColor = colorWithOpacity(color, opacity);

  if (Platform.OS === "web") {
    return {
      // @ts-ignore - boxShadow is valid for web
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${shadowColor}`,
    };
  }

  // Native platforms (iOS/Android)
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
    elevation: Math.max(1, Math.round(blurRadius / 2)), // Android elevation
  };
};

/**
 * Create cross-platform text shadow styles
 */
export const createTextShadow = (config: TextShadowConfig): TextStyle => {
  const {
    color = "#000000",
    offsetX = 0,
    offsetY = 1,
    blurRadius = 2,
  } = config;

  if (Platform.OS === "web") {
    return {
      // @ts-ignore - textShadow is valid for web
      textShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${color}`,
    };
  }

  // Native platforms
  return {
    textShadowColor: color,
    textShadowOffset: { width: offsetX, height: offsetY },
    textShadowRadius: blurRadius,
  };
};

/**
 * Convert legacy shadow style to modern format
 */
export const convertLegacyShadow = (
  legacyStyle: LegacyShadowStyle,
): ViewStyle => {
  const {
    shadowColor = "#000000",
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.25,
    shadowRadius = 4,
    elevation = 4,
  } = legacyStyle;

  return createShadow({
    color: shadowColor,
    offsetX: shadowOffset.width,
    offsetY: shadowOffset.height,
    blurRadius: shadowRadius,
    opacity: shadowOpacity,
  });
};

/**
 * Convert legacy text shadow style to modern format
 */
export const convertLegacyTextShadow = (
  legacyStyle: LegacyTextShadowStyle,
): TextStyle => {
  const {
    textShadowColor = "#000000",
    textShadowOffset = { width: 0, height: 1 },
    textShadowRadius = 2,
  } = legacyStyle;

  return createTextShadow({
    color: textShadowColor,
    offsetX: textShadowOffset.width,
    offsetY: textShadowOffset.height,
    blurRadius: textShadowRadius,
  });
};

// ============================================
// Pre-defined shadow presets
// ============================================

export const shadowPresets = {
  // Small shadow (cards, buttons)
  sm: createShadow({
    offsetY: 1,
    blurRadius: 2,
    opacity: 0.1,
  }),

  // Medium shadow (modals, dropdowns)
  md: createShadow({
    offsetY: 2,
    blurRadius: 4,
    opacity: 0.15,
  }),

  // Large shadow (floating elements)
  lg: createShadow({
    offsetY: 4,
    blurRadius: 8,
    opacity: 0.2,
  }),

  // Extra large shadow (dialogs)
  xl: createShadow({
    offsetY: 8,
    blurRadius: 16,
    opacity: 0.25,
  }),

  // Card shadow
  card: createShadow({
    offsetY: 2,
    blurRadius: 8,
    opacity: 0.1,
  }),

  // Button shadow
  button: createShadow({
    offsetY: 2,
    blurRadius: 4,
    opacity: 0.15,
  }),

  // Floating action button
  fab: createShadow({
    offsetY: 4,
    blurRadius: 8,
    opacity: 0.3,
  }),

  // Input focus shadow
  inputFocus: createShadow({
    color: "#3B82F6",
    offsetY: 0,
    blurRadius: 4,
    spreadRadius: 2,
    opacity: 0.3,
  }),

  // Error shadow
  error: createShadow({
    color: "#EF4444",
    offsetY: 0,
    blurRadius: 4,
    spreadRadius: 1,
    opacity: 0.3,
  }),

  // Success shadow
  success: createShadow({
    color: "#22C55E",
    offsetY: 0,
    blurRadius: 4,
    spreadRadius: 1,
    opacity: 0.3,
  }),

  // No shadow
  none:
    Platform.OS === "web"
      ? ({ boxShadow: "none" } as ViewStyle)
      : ({ shadowColor: "transparent", elevation: 0 } as ViewStyle),
};

export const textShadowPresets = {
  // Subtle text shadow
  subtle: createTextShadow({
    offsetY: 1,
    blurRadius: 2,
    color: "rgba(0,0,0,0.3)",
  }),

  // Strong text shadow
  strong: createTextShadow({
    offsetY: 2,
    blurRadius: 4,
    color: "rgba(0,0,0,0.5)",
  }),

  // Glow effect
  glow: createTextShadow({
    offsetY: 0,
    blurRadius: 8,
    color: "rgba(255,255,255,0.8)",
  }),

  // None
  none:
    Platform.OS === "web"
      ? ({ textShadow: "none" } as TextStyle)
      : ({ textShadowColor: "transparent" } as TextStyle),
};

export default {
  createShadow,
  createTextShadow,
  convertLegacyShadow,
  convertLegacyTextShadow,
  presets: shadowPresets,
  textPresets: textShadowPresets,
};
