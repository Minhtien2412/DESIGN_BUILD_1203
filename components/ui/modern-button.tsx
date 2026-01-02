/**
 * Modern Button Component - Shopee/Grab Style
 * Created: 12/12/2025
 * 
 * Features:
 * - 4 variants: primary (gradient), secondary, outline, ghost
 * - 3 sizes: small, medium, large
 * - Loading states with spinner
 * - Disabled states
 * - Icon support (left/right)
 * - Full width option
 * 
 * Usage:
 * <ModernButton variant="primary" size="medium" onPress={() => {}}>
 *   Click Me
 * </ModernButton>
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ModernButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  children: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function ModernButton({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ModernButtonProps) {
  const isDisabled = disabled || loading;

  // Size configurations
  const sizeConfig = {
    small: {
      height: 36,
      paddingHorizontal: MODERN_SPACING.md,
      fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
      iconSize: 16,
    },
    medium: {
      height: 48,
      paddingHorizontal: MODERN_SPACING.xl,
      fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
      iconSize: 20,
    },
    large: {
      height: 56,
      paddingHorizontal: MODERN_SPACING.xxl,
      fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
      iconSize: 24,
    },
  };

  const currentSize = sizeConfig[size];

  // Render Primary Button (with gradient)
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          { height: currentSize.height },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={isDisabled ? ['#BDBDBD', '#9E9E9E'] : MODERN_COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            { paddingHorizontal: currentSize.paddingHorizontal },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={MODERN_COLORS.textOnPrimary} size="small" />
          ) : (
            <View style={styles.content}>
              {icon && iconPosition === 'left' && (
                <Ionicons
                  name={icon}
                  size={currentSize.iconSize}
                  color={MODERN_COLORS.textOnPrimary}
                />
              )}
              <Text
                style={[
                  styles.textPrimary,
                  { fontSize: currentSize.fontSize },
                  textStyle,
                ]}
              >
                {children}
              </Text>
              {icon && iconPosition === 'right' && (
                <Ionicons
                  name={icon}
                  size={currentSize.iconSize}
                  color={MODERN_COLORS.textOnPrimary}
                />
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Render Secondary Button
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          styles.buttonSecondary,
          {
            height: currentSize.height,
            paddingHorizontal: currentSize.paddingHorizontal,
          },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={MODERN_COLORS.text} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={currentSize.iconSize}
                color={MODERN_COLORS.text}
              />
            )}
            <Text
              style={[
                styles.textSecondary,
                { fontSize: currentSize.fontSize },
                isDisabled && styles.textDisabled,
                textStyle,
              ]}
            >
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={currentSize.iconSize}
                color={MODERN_COLORS.text}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Render Outline Button
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          styles.buttonOutline,
          {
            height: currentSize.height,
            paddingHorizontal: currentSize.paddingHorizontal,
          },
          fullWidth && styles.fullWidth,
          isDisabled && styles.outlineDisabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={MODERN_COLORS.primary} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={currentSize.iconSize}
                color={isDisabled ? MODERN_COLORS.textDisabled : MODERN_COLORS.primary}
              />
            )}
            <Text
              style={[
                styles.textOutline,
                { fontSize: currentSize.fontSize },
                isDisabled && styles.textDisabled,
                textStyle,
              ]}
            >
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={currentSize.iconSize}
                color={isDisabled ? MODERN_COLORS.textDisabled : MODERN_COLORS.primary}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Render Ghost Button
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          height: currentSize.height,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={MODERN_COLORS.primary} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={isDisabled ? MODERN_COLORS.textDisabled : MODERN_COLORS.primary}
            />
          )}
          <Text
            style={[
              styles.textGhost,
              { fontSize: currentSize.fontSize },
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={isDisabled ? MODERN_COLORS.textDisabled : MODERN_COLORS.primary}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: MODERN_RADIUS.md,
    overflow: 'hidden',
    ...MODERN_SHADOWS.md,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: MODERN_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...MODERN_SHADOWS.sm,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: MODERN_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MODERN_SPACING.xs,
  },
  textPrimary: {
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textOnPrimary,
    letterSpacing: 0.3,
  },
  textSecondary: {
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    letterSpacing: 0.3,
  },
  textOutline: {
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.primary,
    letterSpacing: 0.3,
  },
  textGhost: {
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.primary,
    letterSpacing: 0.3,
  },
  textDisabled: {
    color: MODERN_COLORS.textDisabled,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  outlineDisabled: {
    borderColor: MODERN_COLORS.border,
  },
});
