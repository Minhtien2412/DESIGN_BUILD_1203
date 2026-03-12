/**
 * Card Component
 * Flexible container for content with variants
 */

import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ImageSourcePropType,
    type ViewStyle,
} from 'react-native';
import { Shadows } from '../../constants/shadows';
import { BorderRadiusSemantic, IconSize, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  disabled?: boolean;
}

export default function Card({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = Spacing[4],
  disabled = false,
}: CardProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const surfaceMutedColor = useThemeColor({}, 'surfaceMuted');

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: surfaceColor,
      borderRadius: BorderRadiusSemantic.card,
      padding,
    };

    switch (variant) {
      case 'elevated':
        return { ...baseStyle, ...Shadows.card };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: surfaceMutedColor,
        };
      default:
        return baseStyle;
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {children}
    </Component>
  );
}

// Card Header Component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: ReactNode;
  action?: ReactNode;
  style?: ViewStyle;
}

export function CardHeader({
  title,
  subtitle,
  avatar,
  action,
  style,
}: CardHeaderProps) {
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');

  return (
    <View style={[styles.header, style]}>
      {avatar && <View style={styles.avatar}>{avatar}</View>}
      <View style={styles.headerText}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: textMutedColor }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

// Card Media Component
interface CardMediaProps {
  source: ImageSourcePropType;
  aspectRatio?: number;
  style?: ViewStyle;
}

export function CardMedia({ source, aspectRatio = 16 / 9, style }: CardMediaProps) {
  return (
    <View style={[styles.media, { aspectRatio }, style]}>
      <Image source={source} style={styles.mediaImage} />
    </View>
  );
}

// Card Content Component
interface CardContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

// Card Footer/Actions Component
interface CardActionsProps {
  children: ReactNode;
  style?: ViewStyle;
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
}

export function CardActions({
  children,
  style,
  justify = 'flex-end',
}: CardActionsProps) {
  return (
    <View style={[styles.actions, { justifyContent: justify }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  avatar: {
    marginRight: Spacing[3],
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: TextVariants.body1.fontSize,
    fontWeight: TextVariants.h6.fontWeight,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontSize: TextVariants.caption.fontSize,
  },
  action: {
    marginLeft: Spacing[2],
  },
  media: {
    width: '100%',
    marginHorizontal: -Spacing[4],
    marginTop: -Spacing[4],
    marginBottom: Spacing[3],
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    marginBottom: Spacing[3],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  productCard: {
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productBadge: {
    position: 'absolute',
    top: Spacing[2],
    left: Spacing[2],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 4,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productContent: {
    padding: Spacing[3],
  },
  productTitle: {
    fontSize: TextVariants.body2.fontSize,
    fontWeight: '500',
    marginBottom: Spacing[2],
    minHeight: 36,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[2],
    gap: Spacing[1],
  },
  productRatingText: {
    fontSize: TextVariants.caption.fontSize,
  },
  productPrice: {
    fontSize: TextVariants.body1.fontSize,
    fontWeight: TextVariants.button.fontWeight,
  },
});

// Product Card Example (Preset)
interface ProductCardProps {
  image: ImageSourcePropType;
  title: string;
  price: string;
  rating?: number;
  badge?: string;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  style?: ViewStyle;
}

export function ProductCard({
  image,
  title,
  price,
  rating,
  badge,
  onPress,
  onFavorite,
  isFavorite = false,
  style,
}: ProductCardProps) {
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  return (
    <Card variant="elevated" onPress={onPress} padding={0} style={style}>
      <View style={styles.productImageContainer}>
        <Image source={image} style={styles.productImage} />
        {badge && (
          <View style={[styles.productBadge, { backgroundColor: primaryColor }]}>
            <Text style={styles.productBadgeText}>{badge}</Text>
          </View>
        )}
        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={IconSize.lg}
              color={isFavorite ? errorColor : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.productContent}>
        <Text style={[styles.productTitle, { color: textColor }]} numberOfLines={2}>
          {title}
        </Text>
        {rating && (
          <View style={styles.productRating}>
            <Ionicons name="star" size={IconSize.sm} color="#FFA500" />
            <Text style={[styles.productRatingText, { color: textMutedColor }]}>
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
        <Text style={[styles.productPrice, { color: primaryColor }]}>{price}</Text>
      </View>
    </Card>
  );
}
