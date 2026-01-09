import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '../../utils/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES = {
  primary: {
    backgroundColor: '#0066CC',
    color: '#FFF',
    borderColor: '#0066CC',
  },
  secondary: {
    backgroundColor: '#6B7280',
    color: '#FFF',
    borderColor: '#6B7280',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#0066CC',
    borderColor: '#0066CC',
  },
  danger: {
    backgroundColor: '#000000',
    color: '#FFF',
    borderColor: '#000000',
  },
};

const SIZE_STYLES = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    fontSize: 18,
  },
};

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: AnimatedButtonProps) {
  const { animatedStyle, scaleIn, scaleOut } = useScaleAnimation();

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={scaleIn}
      onPressOut={scaleOut}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
      ] as any}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.color} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: variantStyle.color, fontSize: sizeStyle.fontSize },
              icon && styles.textWithIcon,
            ] as any}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
  },
  textWithIcon: {
    marginLeft: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
