/**
 * RoleBadge Component
 * Hiển thị huy hiệu vai trò của user
 */

import { ThemedText } from '@/components/themed-text';
import { getRoleBadge } from '@/constants/roles';
import { UserType } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

interface RoleBadgeProps {
  userType: UserType;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function RoleBadge({ userType, showIcon = true, size = 'medium' }: RoleBadgeProps) {
  const badge = getRoleBadge(userType);

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 10, paddingVertical: 6, fontSize: 14 },
  };

  const iconSizes = {
    small: 12,
    medium: 14,
    large: 16,
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badge.bgColor,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={badge.icon as any}
          size={iconSizes[size]}
          color={badge.textColor}
          style={styles.icon}
        />
      )}
      <ThemedText
        style={[
          styles.text,
          {
            color: badge.textColor,
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {badge.text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});
