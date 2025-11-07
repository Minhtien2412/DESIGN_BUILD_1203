import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  style?: ViewStyle;
  variant?: ButtonVariant;
  size?: ButtonSize;
  hitSlop?: number | { top?: number; right?: number; bottom?: number; left?: number };
};

export function Button({ title, loading, style, variant = 'primary', size = 'md', hitSlop, ...props }: Props) {
  const textDark = useThemeColor({}, 'text');
  const sizeStyle = size === 'lg' ? styles.sizeLg : size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const variantStyle = { backgroundColor: '#333333' }; // Dark gray background for all buttons
  const textStyle = { color: textDark };
  const spinnerColor = textDark;
  const defaultHitSlop = hitSlop ?? { top: 8, bottom: 8, left: 8, right: 8 };

  return (
    <Pressable
      {...props}
      hitSlop={defaultHitSlop}
      style={({ pressed }) => [styles.buttonBase, sizeStyle, variantStyle, style, pressed && { opacity: 0.9 }] }
    >
      {loading ? <ActivityIndicator color={spinnerColor} /> : <ThemedText style={[styles.textBase, textStyle]}>{title}</ThemedText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    minHeight: 36,
  },
  sizeSm: { minHeight: 32, paddingVertical: 6, paddingHorizontal: 8 },
  sizeMd: { minHeight: 36, paddingVertical: 8, paddingHorizontal: 12 },
  sizeLg: { minHeight: 40, paddingVertical: 10, paddingHorizontal: 16 },

  textBase: { fontSize: 12, fontWeight: '600' },
});
