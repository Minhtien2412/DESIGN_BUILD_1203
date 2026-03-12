/**
 * Badge Component
 * Small status or count indicators
 */

import { type ReactNode } from 'react';
import {
    StyleSheet,
    Text,
    View,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  outline?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  outline = false,
  style,
  textStyle,
}: BadgeProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const infoColor = useThemeColor({}, 'info');
  const surfaceMutedColor = useThemeColor({}, 'surfaceMuted');
  const textColor = useThemeColor({}, 'text');

  const colorMap: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: primaryColor, text: '#FFFFFF' },
    secondary: { bg: secondaryColor, text: '#FFFFFF' },
    success: { bg: successColor, text: '#FFFFFF' },
    error: { bg: errorColor, text: '#FFFFFF' },
    warning: { bg: warningColor, text: '#FFFFFF' },
    info: { bg: infoColor, text: '#FFFFFF' },
    neutral: { bg: surfaceMutedColor, text: textColor },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: Spacing[2],
      paddingVertical: Spacing[1],
      fontSize: 10,
      minWidth: 16,
      height: 16,
      dotSize: 6,
    },
    md: {
      paddingHorizontal: Spacing[2],
      paddingVertical: Spacing[1],
      fontSize: TextVariants.caption.fontSize,
      minWidth: 20,
      height: 20,
      dotSize: 8,
    },
    lg: {
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[2],
      fontSize: TextVariants.body2.fontSize,
      minWidth: 24,
      height: 24,
      dotSize: 10,
    },
  };

  const currentSize = sizeStyles[size];
  const colors = colorMap[variant];

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          {
            width: currentSize.dotSize,
            height: currentSize.dotSize,
            backgroundColor: outline ? 'transparent' : colors.bg,
            borderColor: colors.bg,
            borderWidth: outline ? 2 : 0,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          minWidth: currentSize.minWidth,
          height: currentSize.height,
          backgroundColor: outline ? 'transparent' : colors.bg,
          borderColor: colors.bg,
          borderWidth: outline ? 1 : 0,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: currentSize.fontSize,
            color: outline ? colors.bg : colors.text,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  dot: {
    borderRadius: BorderRadius.full,
  },
});

// Notification Badge (positioned absolutely)
interface NotificationBadgeProps {
  count: number;
  max?: number;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function NotificationBadge({
  count,
  max = 99,
  size = 'sm',
  style,
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const badgeStyle: ViewStyle = {
    position: 'absolute',
    top: -4,
    right: -4,
    ...style,
  };

  return (
    <Badge variant="error" size={size} style={badgeStyle}>
      {displayCount}
    </Badge>
  );
}
