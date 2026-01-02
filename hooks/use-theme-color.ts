/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Hook để lấy theme color
 * @param propsOrColorName - Có thể là object {light, dark} hoặc trực tiếp colorName
 * @param colorName - Tên color (nếu param đầu là object)
 * @returns Color value theo theme hiện tại
 * 
 * Cách dùng:
 * - useThemeColor('background') - shorthand
 * - useThemeColor({}, 'background') - legacy
 * - useThemeColor({ light: '#fff', dark: '#000' }, 'background') - with overrides
 */
export function useThemeColor(
  propsOrColorName: { light?: string; dark?: string } | ColorName,
  colorName?: ColorName
): string {
  const theme = useColorScheme() ?? 'light';
  
  // Shorthand: useThemeColor('background')
  if (typeof propsOrColorName === 'string') {
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
