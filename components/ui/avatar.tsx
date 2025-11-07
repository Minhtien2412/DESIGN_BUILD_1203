/**
 * Avatar Component
 * User profile images with fallback to initials
 */

import { resolveAvatar } from '@/utils/avatar';
import { Ionicons } from '@expo/vector-icons';
import {
    Image,
    StyleSheet,
    Text,
    View,
    type ImageSourcePropType,
    type ViewStyle,
} from 'react-native';
import { AvatarSize, BorderRadius } from '../../constants/spacing';
import { useThemeColor } from '../../hooks/use-theme-color';

export type AvatarSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type AvatarShape = 'circle' | 'square' | 'rounded';

interface AvatarProps {
  source?: ImageSourcePropType;
  /** Raw avatar path or absolute URL; can be relative like /uploads/... */
  avatar?: string | null;
  name?: string;
  /** Optional user identifier to seed deterministic placeholder */
  userId?: string | number;
  size?: AvatarSizeType;
  /** Override pixel size instead of semantic size mapping */
  pixelSize?: number;
  shape?: AvatarShape;
  icon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
  onlineStatus?: 'online' | 'offline' | 'busy' | 'away';
  /** Append cache-busting token to resolved URI after upload */
  cacheBust?: string | number;
}

export default function Avatar({
  source,
  avatar,
  name,
  userId,
  size = 'md',
  pixelSize,
  shape = 'circle',
  icon,
  backgroundColor,
  textColor,
  style,
  showBadge = false,
  badgeColor,
  onlineStatus,
  cacheBust,
}: AvatarProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const surfaceMutedColor = useThemeColor({}, 'surfaceMuted');
  const defaultTextColor = useThemeColor({}, 'text');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');

  const avatarSize = pixelSize ?? AvatarSize[size];
  const bgColor = backgroundColor || primaryColor;
  const txtColor = textColor || '#FFFFFF';

  // Get initials from name
  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get border radius based on shape
  const getBorderRadius = (): number => {
    if (shape === 'circle') return BorderRadius.full;
    if (shape === 'square') return 0;
    return BorderRadius.lg;
  };

  // Get status badge color
  const getStatusColor = (): string => {
    if (badgeColor) return badgeColor;
    switch (onlineStatus) {
      case 'online':
        return successColor;
      case 'offline':
        return surfaceMutedColor;
      case 'busy':
        return errorColor;
      case 'away':
        return warningColor;
      default:
        return primaryColor;
    }
  };

  const iconSizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  };

  const fontSizeMap = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  };

  const badgeSizeMap = {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14,
    xl: 18,
    '2xl': 22,
    '3xl': 26,
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: getBorderRadius(),
            backgroundColor: source ? 'transparent' : bgColor,
          },
        ]}
      >
        {/* Prefer explicit source; otherwise, if avatar or userId provided, resolve to URI; else fallback to icon/initials */}
        {source ? (
          <Image
            source={source}
            style={[
              styles.image,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: getBorderRadius(),
              },
            ]}
          />
        ) : (avatar || userId) ? (
          <Image
            source={{
              uri: resolveAvatar(avatar ?? null, {
                userId: userId != null ? String(userId) : undefined,
                nameFallback: name,
                size: typeof avatarSize === 'number' ? Math.round(avatarSize) : undefined,
                cacheBust,
              }),
            }}
            style={[
              styles.image,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: getBorderRadius(),
              },
            ]}
          />
        ) : icon ? (
          <Ionicons name={icon} size={iconSizeMap[size]} color={txtColor} />
        ) : (
          <Text
            style={[
              styles.initials,
              {
                color: txtColor,
                fontSize: fontSizeMap[size],
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        )}
      </View>

      {/* Status Badge */}
      {(showBadge || onlineStatus) && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSizeMap[size],
              height: badgeSizeMap[size],
              backgroundColor: getStatusColor(),
              borderRadius: badgeSizeMap[size] / 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    position: 'relative',
  },
  groupAvatarBorder: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

// Avatar Group Component
interface AvatarGroupProps {
  avatars: Array<{
    source?: ImageSourcePropType;
    name?: string;
    id: string | number;
    avatar?: string | null;
    userId?: string | number;
  }>;
  max?: number;
  size?: AvatarSizeType;
  shape?: AvatarShape;
  style?: ViewStyle;
}

export function AvatarGroup({
  avatars,
  max = 5,
  size = 'md',
  shape = 'circle',
  style,
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const avatarSize = AvatarSize[size];
  const overlap = avatarSize * 0.25;

  return (
    <View style={[styles.group, style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={avatar.id}
          style={[
            styles.groupAvatar,
            {
              marginLeft: index > 0 ? -overlap : 0,
              zIndex: displayAvatars.length - index,
            },
          ]}
        >
          <Avatar
            source={avatar.source}
            avatar={avatar.avatar}
            userId={avatar.userId}
            name={avatar.name}
            size={size}
            shape={shape}
            style={styles.groupAvatarBorder}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupAvatar,
            {
              marginLeft: -overlap,
              zIndex: 0,
            },
          ]}
        >
          <Avatar
            name={`+${remaining}`}
            size={size}
            shape={shape}
            backgroundColor="#6B7280"
            style={styles.groupAvatarBorder}
          />
        </View>
      )}
    </View>
  );
}
