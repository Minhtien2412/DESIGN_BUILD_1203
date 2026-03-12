/**
 * Badge Icon Component
 * Icon với badge số lượng (như Shopee)
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface BadgeIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  badgeCount?: number;
  maxCount?: number;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  showZero?: boolean;
}

export function BadgeIcon({
  iconName,
  iconSize = 24,
  iconColor = '#000',
  badgeCount = 0,
  maxCount = 99,
  badgeBackgroundColor = '#0D9488',
  badgeTextColor = '#FFF',
  showZero = false,
}: BadgeIconProps) {
  const shouldShowBadge = badgeCount > 0 || showZero;
  const displayCount = badgeCount > maxCount ? `${maxCount}+` : badgeCount.toString();

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
      
      {shouldShowBadge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeBackgroundColor },
            badgeCount > 99 && styles.badgeLarge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: badgeTextColor },
              badgeCount > 99 && styles.badgeTextSmall,
            ]}
          >
            {displayCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeLarge: {
    minWidth: 22,
    height: 18,
    borderRadius: 9,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  badgeTextSmall: {
    fontSize: 9,
  },
});
