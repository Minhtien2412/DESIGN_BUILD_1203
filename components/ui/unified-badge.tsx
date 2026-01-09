/**
 * Unified Badge Component
 * Hiển thị badge thông báo thống nhất - Zalo style
 * 
 * @author AI Assistant
 * @date 03/01/2026
 */

import { StyleSheet, Text, View } from 'react-native';

interface BadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  type?: 'default' | 'dot' | 'warning' | 'success';
  style?: object;
}

export function Badge({
  count,
  maxCount = 99,
  size = 'medium',
  type = 'default',
  style,
}: BadgeProps) {
  if (count <= 0 && type !== 'dot') return null;

  // Dot only
  if (type === 'dot') {
    return (
      <View style={[
        styles.dot,
        size === 'small' && styles.dotSmall,
        size === 'large' && styles.dotLarge,
        style,
      ]} />
    );
  }

  // Get display text
  const displayText = count > maxCount ? `${maxCount}+` : String(count);

  // Size styles
  const sizeStyles = {
    small: { minWidth: 16, height: 16, fontSize: 10, paddingHorizontal: 4 },
    medium: { minWidth: 20, height: 20, fontSize: 12, paddingHorizontal: 6 },
    large: { minWidth: 24, height: 24, fontSize: 14, paddingHorizontal: 8 },
  };

  // Type colors
  const typeColors = {
    default: '#000000', // Red
    warning: '#0066CC', // Orange
    success: '#0066CC', // Green
    dot: '#000000',
  };

  return (
    <View
      style={[
        styles.container,
        {
          minWidth: sizeStyles[size].minWidth,
          height: sizeStyles[size].height,
          backgroundColor: typeColors[type],
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: sizeStyles[size].fontSize },
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default Badge;
