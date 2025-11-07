/**
 * Chip/Tag Component
 * Small, compact elements for categories, filters, or selections
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { BorderRadius, IconSize, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

export type ChipVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral';

export type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: keyof typeof Ionicons.glyphMap;
  avatar?: React.ReactNode;
  onPress?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  disabled?: boolean;
  outline?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Chip({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  avatar,
  onPress,
  onDelete,
  selected = false,
  disabled = false,
  outline = false,
  style,
  textStyle,
}: ChipProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const infoColor = useThemeColor({}, 'info');
  const surfaceMutedColor = useThemeColor({}, 'surfaceMuted');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');

  const colorMap: Record<ChipVariant, { bg: string; text: string; border: string }> = {
    primary: { bg: primaryColor, text: '#FFFFFF', border: primaryColor },
    secondary: { bg: secondaryColor, text: '#FFFFFF', border: secondaryColor },
    success: { bg: successColor, text: '#FFFFFF', border: successColor },
    error: { bg: errorColor, text: '#FFFFFF', border: errorColor },
    warning: { bg: warningColor, text: '#FFFFFF', border: warningColor },
    info: { bg: infoColor, text: '#FFFFFF', border: infoColor },
    neutral: { bg: surfaceMutedColor, text: textColor, border: surfaceMutedColor },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: Spacing[2],
      paddingVertical: Spacing[1],
      fontSize: 11,
      iconSize: 14,
      height: 24,
    },
    md: {
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[2],
      fontSize: TextVariants.caption.fontSize,
      iconSize: IconSize.sm,
      height: 32,
    },
    lg: {
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[2],
      fontSize: TextVariants.body2.fontSize,
      iconSize: IconSize.md,
      height: 40,
    },
  };

  const currentSize = sizeStyles[size];
  const colors = colorMap[variant];

  const chipStyle: ViewStyle = {
    backgroundColor: outline ? surfaceColor : selected ? colors.bg : colors.bg,
    borderColor: colors.border,
    borderWidth: outline ? 1 : 0,
    opacity: disabled ? 0.5 : selected ? 1 : outline ? 1 : 0.9,
  };

  const chipTextColor = outline ? colors.bg : colors.text;

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.chip,
        chipStyle,
        {
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          height: currentSize.height,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {avatar && <View style={styles.avatar}>{avatar}</View>}
      {icon && !avatar && (
        <Ionicons
          name={icon}
          size={currentSize.iconSize}
          color={chipTextColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            fontSize: currentSize.fontSize,
            color: chipTextColor,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          disabled={disabled}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close-circle"
            size={currentSize.iconSize}
            color={chipTextColor}
          />
        </TouchableOpacity>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  avatar: {
    marginRight: Spacing[2],
    marginLeft: -Spacing[1],
  },
  icon: {
    marginRight: Spacing[2],
  },
  label: {
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: Spacing[1],
    padding: Spacing[1],
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chipGroupItem: {
    marginBottom: Spacing[2],
  },
});

// Chip Group Component
interface ChipGroupProps {
  chips: Array<{
    key: string;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
  }>;
  selected?: string[];
  onChange?: (selected: string[]) => void;
  variant?: ChipVariant;
  size?: ChipSize;
  multiSelect?: boolean;
  style?: ViewStyle;
}

export function ChipGroup({
  chips,
  selected = [],
  onChange,
  variant = 'primary',
  size = 'md',
  multiSelect = false,
  style,
}: ChipGroupProps) {
  const handleChipPress = (key: string) => {
    if (!onChange) return;

    if (multiSelect) {
      const newSelected = selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key];
      onChange(newSelected);
    } else {
      onChange([key]);
    }
  };

  return (
    <View style={[styles.chipGroup, style]}>
      {chips.map(chip => (
        <Chip
          key={chip.key}
          label={chip.label}
          icon={chip.icon}
          variant={variant}
          size={size}
          selected={selected.includes(chip.key)}
          onPress={() => handleChipPress(chip.key)}
          outline={!selected.includes(chip.key)}
          style={styles.chipGroupItem}
        />
      ))}
    </View>
  );
}

const chipGroupStyles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chipGroupItem: {
    marginBottom: Spacing[2],
  },
});

// Merge styles
Object.assign(styles, chipGroupStyles);
