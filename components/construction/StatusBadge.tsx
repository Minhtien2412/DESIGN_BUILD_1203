/**
 * Status Badge Component
 * Hiển thị trạng thái với màu sắc phù hợp
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
}

const VARIANT_COLORS = {
  success: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  error: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  info: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  neutral: { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
};

const SIZE_STYLES = {
  small: { paddingVertical: 4, paddingHorizontal: 8, fontSize: 11, iconSize: 12 },
  medium: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 13, iconSize: 14 },
  large: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, iconSize: 16 },
};

export default function StatusBadge({ 
  label, 
  variant = 'neutral', 
  icon,
  size = 'medium' 
}: StatusBadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const sizing = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: sizing.paddingVertical,
          paddingHorizontal: sizing.paddingHorizontal,
        },
      ]}
    >
      {icon && (
        <Ionicons 
          name={icon} 
          size={sizing.iconSize} 
          color={colors.text}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: colors.text, fontSize: sizing.fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});
