import { Radii, Spacing } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

type SurfaceCardProps = ViewProps & {
  padding?: 'none' | 'sm' | 'md';
  elevated?: boolean;
};

const paddingMap: Record<NonNullable<SurfaceCardProps['padding']>, number> = {
  none: 0,
  sm: Spacing.sm,
  md: Spacing.md,
};

export function SurfaceCard({
  children,
  style,
  padding = 'sm',
  elevated = true,
  ...rest
}: SurfaceCardProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const shadowColor = useThemeColor({}, 'shadow');

  const paddingValue = paddingMap[padding];

  return (
    <View
      {...rest}
      style={[
        styles.card,
        elevated ? [styles.shadow, Platform.select({ web: null, default: { shadowColor } })] : null,
        { backgroundColor: surface, borderColor: border },
        paddingValue ? { padding: paddingValue } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  shadow: {
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
