/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;
type ThemeColors = typeof Colors.light;

/**
 * Hook để lấy theme color
 * @param propsOrColorName - Có thể là object {light, dark}, colorName, hoặc không có tham số
 * @param colorName - Tên color (nếu param đầu là object)
 * @returns Color value theo theme hiện tại hoặc toàn bộ colors object
 *
 * Cách dùng:
 * - useThemeColor() - trả về object colors theo theme
 * - useThemeColor('background') - shorthand
 * - useThemeColor({}, 'background') - legacy
 * - useThemeColor({ light: '#fff', dark: '#000' }, 'background') - with overrides
 */
export function useThemeColor(): ThemeColors;
export function useThemeColor(colorName: ColorName): string;
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName,
): string;
export function useThemeColor(
  propsOrColorName?: { light?: string; dark?: string } | ColorName,
  colorName?: ColorName,
): string | ThemeColors {
  const theme = useColorScheme() ?? "light";

  // No params: return all colors
  if (propsOrColorName === undefined) {
    return Colors[theme];
  }

  // Shorthand: useThemeColor('background')
  if (typeof propsOrColorName === "string") {
    return Colors[theme][propsOrColorName as ColorName];
  }

  // Full syntax: useThemeColor({ light, dark }, 'colorName')
  const props = propsOrColorName;
  const name = colorName!;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][name];
  }
}
