import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { DesignSystem } from '../../constants/design-system';

interface ServiceCardProps {
  id: number | string;
  name: string;
  icon: ImageSourcePropType;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'large';
  showArrow?: boolean;
}

/**
 * Enhanced Service Card with Better Visual Hierarchy
 * - 3 size variants
 * - Press animation
 * - Optional badge
 * - Better spacing and typography
 */
export default function EnhancedServiceCard({
  id,
  name,
  icon,
  subtitle,
  badge,
  onPress,
  variant = 'default',
  showArrow = false,
}: ServiceCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  // Variant styles
  const variantStyles = {
    default: {
      container: styles.containerDefault,
      iconSize: 56,
      nameSize: 13,
    },
    compact: {
      container: styles.containerCompact,
      iconSize: 40,
      nameSize: 11,
    },
    large: {
      container: styles.containerLarge,
      iconSize: 72,
      nameSize: 15,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay((id as number) * 50)}
      style={animatedStyle}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, currentVariant.container]}
      >
        {/* Badge */}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* Icon Container */}
        <View style={[styles.iconContainer, { width: currentVariant.iconSize, height: currentVariant.iconSize }]}>
          <Image
            source={icon}
            style={[styles.icon, { width: currentVariant.iconSize - 16, height: currentVariant.iconSize - 16 }]}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.name, { fontSize: currentVariant.nameSize }]}
            numberOfLines={2}
          >
            {name}
          </Text>
          
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Arrow Indicator */}
        {showArrow && (
          <View style={styles.arrowContainer}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={DesignSystem.colors.text.hint}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
    ...DesignSystem.shadows.sm,
    overflow: 'hidden',
  },
  containerDefault: {
    padding: 12,
    alignItems: 'center',
    minHeight: 110,
  },
  containerCompact: {
    padding: 8,
    alignItems: 'center',
    minHeight: 90,
  },
  containerLarge: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: DesignSystem.colors.error.main,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: DesignSystem.borderRadius.round,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  iconContainer: {
    backgroundColor: DesignSystem.colors.primary.main + '10',
    borderRadius: DesignSystem.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    tintColor: undefined, // Preserve original colors
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 10,
    color: DesignSystem.colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});
