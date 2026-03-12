/**
 * Enhanced Input Component with Floating Label
 * Reusable across all auth screens
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface FloatingInputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

export function FloatingInput({
  label,
  icon,
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
  ...props
}: FloatingInputProps) {
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const animateLabel = (active: boolean) => {
    Animated.timing(labelAnim, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    onFocus();
    animateLabel(true);
  };

  const handleBlur = () => {
    onBlur();
    animateLabel(value.length > 0);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    animateLabel(text.length > 0);
  };

  return (
    <View style={styles.container}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? primary : textMuted}
          style={styles.icon}
        />
      )}
      <Animated.Text
        style={[
          styles.label,
          {
            color: isFocused ? primary : textMuted,
            top: labelAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [14, -8],
            }),
            fontSize: labelAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 12],
            }) as any,
            backgroundColor: surface,
            pointerEvents: 'none',
          },
        ]}
      >
        {label}
      </Animated.Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: isFocused ? primary : border,
            backgroundColor: surface,
            color: text,
          },
        ]}
        placeholder=""
        selectionColor={primary}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  label: {
    position: 'absolute',
    left: 48,
    zIndex: 1,
    paddingHorizontal: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 48,
    fontSize: 14,
  },
});
