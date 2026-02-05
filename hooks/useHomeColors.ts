/**
 * Home Screen Theme Colors Hook
 * Provides dark/light mode aware colors for Home screen
 * Use this hook instead of hardcoded COLORS in Home screen
 */

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface HomeColors {
  bg: string;
  white: string;
  primary: string;
  text: string;
  textLight: string;
  border: string;
  liveBadge: string;
  chipBg: string;
  chipActiveBg: string;
  chipActiveText: string;
  card: string;
  surface: string;
  overlay: string;
}

/**
 * Hook để lấy colors cho Home screen với dark mode support
 */
export function useHomeColors(): HomeColors {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Use theme colors from constants/theme.ts
  const themeColors = useThemeColor();

  return {
    bg: themeColors.background,
    white: isDark ? "#1A1A1A" : "#FFFFFF",
    primary: themeColors.primary,
    text: themeColors.text,
    textLight: themeColors.textMuted,
    border: themeColors.border,
    liveBadge: "#E53935", // Always red for live badge
    chipBg: themeColors.surfaceMuted,
    chipActiveBg: themeColors.primary,
    chipActiveText: isDark ? "#000000" : "#FFFFFF",
    card: themeColors.card,
    surface: themeColors.surface,
    overlay: themeColors.overlay,
  };
}

/**
 * Hook để check dark mode
 */
export function useIsDarkMode(): boolean {
  const colorScheme = useColorScheme();
  return colorScheme === "dark";
}

/**
 * Static colors for legacy compatibility
 * Use useHomeColors() instead for dark mode support
 */
export const LEGACY_COLORS = {
  bg: "#F8F9FA",
  white: "#FFFFFF",
  primary: "#7CB342",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  liveBadge: "#E53935",
  chipBg: "#F5F5F5",
  chipActiveBg: "#7CB342",
  chipActiveText: "#FFFFFF",
} as const;

export const SPACING = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 8,
  xl: 12,
} as const;
