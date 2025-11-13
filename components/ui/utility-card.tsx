import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { DesignSystem } from '../../constants/design-system';

interface UtilityCardProps {
  id: number | string;
  name: string;
  icon: ImageSourcePropType;
  location?: string;
  count?: number;
  price?: string;
  rating?: number;
  onPress?: () => void;
  variant?: 'default' | 'horizontal' | 'featured';
}

/**
 * Utility Card Component for Services
 * - Location & count display
 * - Rating display
 * - Price tag
 * - Multiple variants
 */
export default function UtilityCard({
  id,
  name,
  icon,
  location,
  count,
  price,
  rating,
  onPress,
  variant = 'default',
}: UtilityCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const renderDefault = () => (
    <View style={styles.defaultContainer}>
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Image source={icon} style={styles.icon} resizeMode="cover" />
        
        {/* Overlay Badge */}
        {count !== undefined && (
          <View style={styles.countOverlay}>
            <Text style={styles.countText}>{count}+</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        
        <View style={styles.meta}>
          {location && (
            <View style={styles.metaItem}>
              <Ionicons name="location" size={12} color={DesignSystem.colors.text.secondary} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          )}
          
          {rating && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color={DesignSystem.colors.warning.main} />
              <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {price && (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{price}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHorizontal = () => (
    <View style={styles.horizontalContainer}>
      <Image source={icon} style={styles.horizontalIcon} resizeMode="cover" />
      
      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalName} numberOfLines={1}>
          {name}
        </Text>
        
        <View style={styles.horizontalMeta}>
          {location && (
            <Text style={styles.horizontalLocation}>
              <Ionicons name="location" size={12} /> {location}
            </Text>
          )}
          {count !== undefined && (
            <Text style={styles.horizontalCount}>{count}+ đánh giá</Text>
          )}
        </View>

        {price && (
          <Text style={styles.horizontalPrice}>{price}</Text>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={DesignSystem.colors.text.hint}
      />
    </View>
  );

  const renderFeatured = () => (
    <View style={styles.featuredContainer}>
      <Image source={icon} style={styles.featuredImage} resizeMode="cover" />
      
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredName}>{name}</Text>
        
        <View style={styles.featuredFooter}>
          {location && (
            <View style={styles.featuredLocation}>
              <Ionicons name="location" size={14} color="#FFFFFF" />
              <Text style={styles.featuredLocationText}>{location}</Text>
            </View>
          )}
          
          {price && (
            <View style={styles.featuredPrice}>
              <Text style={styles.featuredPriceText}>{price}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'horizontal':
        return renderHorizontal();
      case 'featured':
        return renderFeatured();
      default:
        return renderDefault();
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay((id as number) * 40)}
      style={animatedStyle}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ 
  // Default Variant
  defaultContainer: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
    overflow: 'hidden',
    width: 160,
    ...DesignSystem.shadows.sm,
  },
  iconWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  countOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: DesignSystem.colors.overlay.dark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DesignSystem.borderRadius.md,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: DesignSystem.colors.text.secondary,
  },
  priceTag: {
    marginTop: 8,
    backgroundColor: DesignSystem.colors.success.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DesignSystem.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignSystem.colors.success.dark,
  },

  // Horizontal Variant
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
    padding: 12,
    gap: 12,
    ...DesignSystem.shadows.sm,
  },
  horizontalIcon: {
    width: 60,
    height: 60,
    borderRadius: DesignSystem.borderRadius.md,
  },
  horizontalContent: {
    flex: 1,
    gap: 4,
  },
  horizontalName: {
    fontSize: 15,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
  },
  horizontalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  horizontalLocation: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
  },
  horizontalCount: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
  },
  horizontalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: DesignSystem.colors.primary.main,
  },

  // Featured Variant
  featuredContainer: {
    width: 280,
    height: 200,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    ...DesignSystem.shadows.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    backgroundColor: DesignSystem.colors.overlay.light,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredLocationText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  featuredPrice: {
    backgroundColor: DesignSystem.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DesignSystem.borderRadius.round,
  },
  featuredPriceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
} as any);
