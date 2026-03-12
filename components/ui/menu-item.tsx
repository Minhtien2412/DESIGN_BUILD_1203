import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export type MenuItemProps = {
  icon: React.ReactNode;
  text: string;
  onPress?: () => void;
  iconBg?: string;
  divider?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function MenuItem({ icon, text, onPress, iconBg, divider = true, style, accessibilityLabel }: MenuItemProps) {
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        divider && styles.divider,
        divider && { borderBottomColor: border },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || text}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg ?? surfaceMuted }]}>
        {icon}
      </View>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      <Ionicons name="chevron-forward-outline" size={22} color={textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
});
