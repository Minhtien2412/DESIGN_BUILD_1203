/**
 * LuxuryAvatar - Premium avatar component
 * European luxury design with badge support and fallback initials
 */

import { LuxuryBadge } from '@/components/ui/luxury-badge';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface LuxuryAvatarProps {
  source?: string | { uri: string };
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  badge?: {
    show: boolean;
    variant?: 'dot' | 'number' | 'icon';
    color?: 'accent' | 'success' | 'error' | 'warning' | 'info';
    icon?: keyof typeof Ionicons.glyphMap;
    value?: string | number;
  };
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
}

export function LuxuryAvatar({
  source,
  name,
  size = 'medium',
  badge,
  borderColor,
  borderWidth = 0,
  style,
}: LuxuryAvatarProps) {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'large':
        return { width: 80, height: 80, borderRadius: 40 };
      case 'xlarge':
        return { width: 120, height: 120, borderRadius: 60 };
      default:
        return { width: 48, height: 48, borderRadius: 24 };
    }
  };

  const getInitialsSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: 12, fontWeight: '600' as const };
      case 'large':
        return { fontSize: 28, fontWeight: '700' as const };
      case 'xlarge':
        return { fontSize: 42, fontWeight: '700' as const };
      default:
        return { fontSize: 18, fontWeight: '600' as const };
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return 'small' as const;
      case 'large':
      case 'xlarge':
        return 'large' as const;
      default:
        return 'medium' as const;
    }
  };

  const getBadgeIconSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
      case 'xlarge':
        return 14;
      default:
        return 10;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.avatar,
          getSizeStyle(),
          borderWidth > 0 && {
            borderWidth,
            borderColor: borderColor || Colors.light.accent,
          },
        ]}
      >
        {imageSource ? (
          <Image source={imageSource} style={[styles.image, getSizeStyle()]} />
        ) : (
          <View style={[styles.fallback, getSizeStyle()]}>
            <Text style={[styles.initials, getInitialsSize()]}>
              {name ? getInitials(name) : '?'}
            </Text>
          </View>
        )}
      </View>

      {badge?.show && (
        <>
          {badge.variant === 'icon' && badge.icon ? (
            <View
              style={[
                styles.badgeContainer,
                {
                  backgroundColor: badge.color
                    ? Colors.light[badge.color]
                    : Colors.light.accent,
                },
                size === 'small' && styles.badgeContainerSmall,
                size === 'large' && styles.badgeContainerLarge,
                size === 'xlarge' && styles.badgeContainerXLarge,
              ]}
            >
              <Ionicons
                name={badge.icon}
                size={getBadgeIconSize()}
                color={Colors.light.surface}
              />
            </View>
          ) : (
            <LuxuryBadge
              variant={badge.variant === 'icon' ? 'dot' : (badge.variant || 'dot')}
              color={badge.color || 'accent'}
              value={badge.value}
              size={getBadgeSize()}
              position="bottom-right"
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: Colors.light.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.light.accent,
    letterSpacing: 0.5,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.surface,
  },
  badgeContainerSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    bottom: -1,
    right: -1,
  },
  badgeContainerLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    bottom: -3,
    right: -3,
  },
  badgeContainerXLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    bottom: -4,
    right: -4,
  },
});
