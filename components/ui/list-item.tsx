/**
 * List Item Component
 * Flexible list item with avatar, icon, and actions
 */

import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle,
} from 'react-native';
import { IconSize, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  divider?: boolean;
}

export default function ListItem({
  title,
  subtitle,
  description,
  leading,
  trailing,
  icon,
  badge,
  onPress,
  disabled = false,
  style,
  divider = true,
}: ListItemProps) {
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        divider && styles.divider,
        divider && { borderBottomColor: borderColor },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {/* Leading (Avatar/Icon) */}
      {leading && <View style={styles.leading}>{leading}</View>}
      {icon && !leading && (
        <View style={styles.leading}>
          <Ionicons name={icon} size={IconSize.lg} color={textColor} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: textColor }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {badge !== undefined && (
            <View style={[styles.badge, { backgroundColor: primaryColor }]}>
              <Text style={styles.badgeText}>
                {typeof badge === 'number' && badge > 99 ? '99+' : badge}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: textMutedColor }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {description && (
          <Text
            style={[styles.description, { color: textMutedColor }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Trailing (Actions/Chevron) */}
      {trailing && <View style={styles.trailing}>{trailing}</View>}
      {onPress && !trailing && (
        <View style={styles.trailing}>
          <Ionicons name="chevron-forward" size={IconSize.md} color={textMutedColor} />
        </View>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    minHeight: 60,
  },
  divider: {
    borderBottomWidth: 1,
  },
  leading: {
    marginRight: Spacing[3],
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  title: {
    fontSize: TextVariants.body1.fontSize,
    fontWeight: '500',
    flex: 1,
  },
  subtitle: {
    fontSize: TextVariants.body2.fontSize,
    marginTop: Spacing[1],
  },
  description: {
    fontSize: TextVariants.caption.fontSize,
    marginTop: Spacing[1],
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  trailing: {
    marginLeft: Spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  sectionTitle: {
    fontSize: TextVariants.h6.fontSize,
    fontWeight: TextVariants.h6.fontWeight,
  },
});

// Section Header Component
interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, style }: SectionHeaderProps) {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      {action && <View>{action}</View>}
    </View>
  );
}
