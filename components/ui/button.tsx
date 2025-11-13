import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'default' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = PressableProps & {
  title?: string;
  children?: ReactNode;
  loading?: boolean;
  style?: ViewStyle;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  hitSlop?: number | { top?: number; right?: number; bottom?: number; left?: number };
};

export function Button({ title, children, loading, style, variant = 'primary', size = 'md', fullWidth, hitSlop, ...props }: Props) {
  const tint = useThemeColor({}, 'tint');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textInverse = useThemeColor({}, 'textInverse');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  const sizeStyle = size === 'lg' ? styles.sizeLg : size === 'sm' ? styles.sizeSm : styles.sizeMd;

  // Variant styles
  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: tint }
      : variant === 'destructive'
      ? { backgroundColor: danger }
      : variant === 'secondary' || variant === 'outline'
      ? { backgroundColor: surface, borderWidth: 1, borderColor: border }
      : variant === 'default'
      ? { backgroundColor: surface }
      : { backgroundColor: 'transparent' };

  const textStyle = {
    color: variant === 'primary' || variant === 'destructive' ? textInverse : text,
  } as const;
  const spinnerColor = variant === 'primary' || variant === 'destructive' ? textInverse : text;
  const defaultHitSlop = hitSlop ?? { top: 8, bottom: 8, left: 8, right: 8 };

  const content = children || title;

  return (
    <Pressable
      {...props}
      hitSlop={defaultHitSlop}
      style={({ pressed }) => [
        styles.buttonBase, 
        sizeStyle, 
        variantStyle, 
        fullWidth && { width: '100%' },
        style, 
        pressed && { opacity: 0.9 }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : typeof content === 'string' ? (
        <ThemedText style={[styles.textBase, textStyle]}>{content}</ThemedText>
      ) : (
        content
      )}
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

  textBase: { fontSize: 14, fontWeight: '700' },
});
