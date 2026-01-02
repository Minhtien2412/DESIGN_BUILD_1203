/**
 * Luxury Button Component
 * European-inspired elegant button with smooth animations
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury';
type ButtonSize = 'small' | 'medium' | 'large';

interface LuxuryButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function LuxuryButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: LuxuryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        damping: 20,
        mass: 1,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 20,
        mass: 1,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'luxury':
        return {
          container: styles.luxuryContainer,
          text: styles.luxuryText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const iconSize = size === 'small' ? 16 : size === 'large' ? 22 : 18;
  const iconColor = variant === 'outline' || variant === 'ghost' 
    ? Colors.light.primary 
    : variant === 'luxury'
    ? Colors.light.accent
    : Colors.light.textInverse;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        fullWidth && { width: '100%' },
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          variantStyles.container,
          sizeStyles.container,
          fullWidth && { width: '100%' },
          disabled && styles.disabled,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' || variant === 'ghost' ? Colors.light.primary : Colors.light.textInverse} 
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} style={{ marginRight: 8 }} />
            )}
            <Text style={[variantStyles.text, sizeStyles.text, textStyle]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} style={{ marginLeft: 8 }} />
            )}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  // Variants
  primaryContainer: {
    backgroundColor: Colors.light.primary,
  },
  primaryText: {
    color: Colors.light.textInverse,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  secondaryContainer: {
    backgroundColor: Colors.light.secondary,
  },
  secondaryText: {
    color: Colors.light.textInverse,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  outlineText: {
    color: Colors.light.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: Colors.light.primary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  luxuryContainer: {
    backgroundColor: Colors.light.accent,
    borderWidth: 1,
    borderColor: Colors.light.goldDark,
  },
  luxuryText: {
    color: Colors.light.primary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 13,
  },

  // Sizes
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  smallText: {
    fontSize: 13,
  },

  mediumContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  mediumText: {
    fontSize: 15,
  },

  largeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  largeText: {
    fontSize: 17,
  },

  disabled: {
    opacity: 0.5,
  },
});
