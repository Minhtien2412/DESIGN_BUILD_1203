/**
 * LuxuryInput - Premium text input component
 * European luxury design with smooth animations
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';

interface LuxuryInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outline' | 'filled';
  containerStyle?: any;
}

export function LuxuryInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  containerStyle,
  value,
  onFocus,
  onBlur,
  ...props
}: LuxuryInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -8],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? Colors.light.error : Colors.light.border,
      error ? Colors.light.error : Colors.light.accent,
    ],
  });

  const getContainerStyle = () => {
    switch (variant) {
      case 'filled':
        return styles.containerFilled;
      case 'outline':
        return styles.containerOutline;
      default:
        return styles.containerDefault;
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Animated.View
        style={[
          styles.container,
          getContainerStyle(),
          { borderColor },
          error && styles.containerError,
        ]}
      >
        {label && (
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: error
                  ? Colors.light.error
                  : isFocused
                  ? Colors.light.accent
                  : Colors.light.textMuted,
              },
            ]}
          >
            {label}
          </Animated.Text>
        )}

        <View style={styles.inputContainer}>
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              <Ionicons
                name={leftIcon}
                size={20}
                color={error ? Colors.light.error : Colors.light.textMuted}
              />
            </View>
          )}

          <TextInput
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
            ]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={Colors.light.textMuted}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconContainer}
              activeOpacity={0.7}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={error ? Colors.light.error : Colors.light.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    position: 'relative',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
  },
  containerDefault: {
    borderColor: Colors.light.border,
  },
  containerOutline: {
    borderColor: Colors.light.border,
    backgroundColor: 'transparent',
  },
  containerFilled: {
    borderColor: 'transparent',
    backgroundColor: Colors.light.surfaceMuted,
  },
  containerError: {
    borderColor: Colors.light.error,
  },
  label: {
    position: 'absolute',
    left: 16,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: 16,
  },
  rightIconContainer: {
    paddingRight: 16,
    padding: 8,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 16,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.error,
    letterSpacing: 0.2,
  },
});
