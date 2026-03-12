/**
 * useColors - Hook để lấy toàn bộ colors object theo theme hiện tại
 * Dùng cho các components cần nhiều colors cùng lúc
 * @author AI Assistant
 * @date 13/01/2026
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Base theme colors from Colors constant
type BaseThemeColors = typeof Colors.light;

// Extended theme colors với các alias phổ biến
export interface ThemeColors extends BaseThemeColors {
  cardBackground: string;
  textSecondary: string;
  inputBackground: string;
  divider: string;
}

/**
 * Hook trả về toàn bộ colors object theo theme hiện tại
 * Bao gồm cả alias colors để tương thích với các components cũ
 * 
 * @returns Colors object với extended properties
 * 
 * @example
 * const colors = useColors();
 * <View style={{ backgroundColor: colors.cardBackground }}>
 *   <Text style={{ color: colors.textSecondary }}>{content}</Text>
 * </View>
 */
export function useColors(): ThemeColors {
  const theme = useColorScheme() ?? 'light';
  const baseColors = Colors[theme];
  
  // Extend với các alias colors cho backward compatibility
  return {
    ...baseColors,
    // Card/Surface aliases
    cardBackground: baseColors.card || baseColors.surface,
    inputBackground: baseColors.surfaceMuted,
    // Text aliases
    textSecondary: baseColors.textMuted,
    // Border aliases
    divider: baseColors.border,
  };
}

export default useColors;
