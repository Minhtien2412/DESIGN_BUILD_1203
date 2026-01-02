/**
 * LuxuryBadge - Premium badge component
 * European luxury design for notifications, counts, and status indicators
 */

import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface LuxuryBadgeProps {
  variant?: 'dot' | 'number' | 'text';
  color?: 'accent' | 'success' | 'error' | 'warning' | 'info' | 'primary';
  value?: string | number;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function LuxuryBadge({
  variant = 'dot',
  color = 'accent',
  value,
  size = 'medium',
  style,
  position = 'top-right',
}: LuxuryBadgeProps) {
  const getColorStyle = () => {
    switch (color) {
      case 'success':
        return { backgroundColor: Colors.light.success };
      case 'error':
        return { backgroundColor: Colors.light.error };
      case 'warning':
        return { backgroundColor: Colors.light.warning };
      case 'info':
        return { backgroundColor: Colors.light.info };
      case 'primary':
        return { backgroundColor: Colors.light.primary };
      default:
        return { backgroundColor: Colors.light.accent };
    }
  };

  const getSizeStyle = () => {
    if (variant === 'dot') {
      switch (size) {
        case 'small':
          return { width: 6, height: 6, borderRadius: 3 };
        case 'large':
          return { width: 12, height: 12, borderRadius: 6 };
        default:
          return { width: 8, height: 8, borderRadius: 4 };
      }
    } else {
      switch (size) {
        case 'small':
          return { minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4 };
        case 'large':
          return { minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 8 };
        default:
          return { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6 };
      }
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: 9, fontWeight: '700' as const };
      case 'large':
        return { fontSize: 13, fontWeight: '700' as const };
      default:
        return { fontSize: 11, fontWeight: '700' as const };
    }
  };

  const getPositionStyle = (): ViewStyle => {
    const offset = size === 'small' ? -4 : size === 'large' ? -8 : -6;
    switch (position) {
      case 'top-left':
        return { position: 'absolute', top: offset, left: offset };
      case 'bottom-right':
        return { position: 'absolute', bottom: offset, right: offset };
      case 'bottom-left':
        return { position: 'absolute', bottom: offset, left: offset };
      default:
        return { position: 'absolute', top: offset, right: offset };
    }
  };

  if (variant === 'dot') {
    return (
      <View
        style={[
          styles.badge,
          styles.dotBadge,
          getSizeStyle(),
          getColorStyle(),
          getPositionStyle(),
          style,
        ]}
      />
    );
  }

  const displayValue =
    variant === 'number' && typeof value === 'number' && value > 99 ? '99+' : value;

  return (
    <View
      style={[
        styles.badge,
        getSizeStyle(),
        getColorStyle(),
        getPositionStyle(),
        style,
      ]}
    >
      <Text style={[styles.text, getTextSize()]}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.surface,
  },
  dotBadge: {
    borderWidth: 1.5,
  },
  text: {
    color: Colors.light.surface,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
