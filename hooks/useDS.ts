/**
 * useDS — Design System hook
 * Provides theme-aware colors + all DS tokens in one import
 *
 * Usage:
 *   const { colors, spacing, radius, font, text, shadow, layout } = useDS();
 *   <View style={{ backgroundColor: colors.bg, padding: spacing.xl }}>
 *     <Text style={[text.h2, { color: colors.text }]}>Title</Text>
 *   </View>
 */

import { DS, DSColors } from "@/constants/ds";
import { useColorScheme } from "react-native";

export function useDS() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors: DSColors = isDark ? DS.dark : DS.colors;

  return {
    isDark,
    colors,
    palette: DS.palette,
    spacing: DS.spacing,
    radius: DS.radius,
    font: DS.font,
    text: DS.text,
    shadow: DS.shadow,
    screen: DS.screen,
    layout: DS.layout,
    animation: DS.animation,
    icon: DS.icon,
  };
}

/** Quick color-only hook */
export function useDSColors(): DSColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? DS.dark : DS.colors;
}

/** Check dark mode */
export function useIsDark(): boolean {
  return useColorScheme() === "dark";
}
