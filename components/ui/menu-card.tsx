import { ThemedText } from '@/components/themed-text';
import { Radii } from '@/constants/layout';
import type { ServiceIconKey } from '@/constants/service-icons';
import type { ServiceImageKey } from '@/constants/service-images';
import { useThemeColor } from '@/hooks/use-theme-color';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, type Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { ServiceIcon } from './service-icon';
import { ServiceImageIcon } from './service-image-icon';

export type MenuCardItem = {
  key: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  route?: Href; // optional to allow disabled/placeholder items without a registered route
  color?: string;
  disabled?: boolean;
  badge?: string;          // small text inside badge (e.g. number or LIVE)
  badgeType?: 'count' | 'live';
  serviceIcon?: ServiceIconKey; // optional: use our service icon mapping
  serviceImage?: ServiceImageKey; // optional: use PNG image asset mapping
};

export function MenuCard({ item, style }: { item: MenuCardItem; style?: ViewStyle }) {
  const { icon, serviceIcon, serviceImage, label, route, color, disabled, badge, badgeType } = item;
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const content = (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.card,
        { backgroundColor: surface, borderColor: border },
        style,
        color ? { backgroundColor: color } : null,
        disabled ? styles.disabled : null,
      ]}
    >
  {serviceImage ? (
    <ServiceImageIcon name={serviceImage} size={44} />
  ) : serviceIcon ? (
    <ServiceIcon name={serviceIcon} size={30} />
  ) : (
    <MaterialIcons name={icon} size={30} color={text} />
  )}
  <ThemedText style={styles.label} numberOfLines={1}>{label}</ThemedText>
      {badge ? (
        <ThemedText
          style={[
            styles.badge,
            badgeType === 'live' ? styles.badgeLive : styles.badgeCount,
          ]}
        >
          {badge}
        </ThemedText>
      ) : null}
    </Pressable>
  );

  if (disabled || !route) return content;
  return <Link href={route} asChild>{content}</Link>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 3,
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 5,
    fontSize: 9,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    color: '#fff',
    fontWeight: '600',
  },
  badgeCount: {
    backgroundColor: '#404040',
  },
  badgeLive: {
    backgroundColor: '#0D9488',
  },
});
