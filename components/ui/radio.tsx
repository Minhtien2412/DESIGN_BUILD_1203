/**
 * Radio Button Component
 * Supports single selection from a group
 */

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle
} from 'react-native';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

export interface RadioOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  style?: ViewStyle;
  direction?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

export default function RadioGroup({
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
  required = false,
  style,
  direction = 'vertical',
  size = 'md',
}: RadioGroupProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  const backgroundColor = useThemeColor({}, 'background');
  const mutedColor = useThemeColor({}, 'textMuted');

  const sizeMap = {
    sm: { outer: 16, inner: 8 },
    md: { outer: 20, inner: 10 },
    lg: { outer: 24, inner: 12 },
  };

  const currentSize = sizeMap[size];

  const handleSelect = (optionValue: string | number) => {
    if (!disabled) {
      onChange(optionValue);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>
          {label}
          {required && <Text style={{ color: errorColor }}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.optionsContainer,
          direction === 'horizontal' && styles.horizontal,
        ]}
      >
        {options.map(option => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[
                styles.option,
                direction === 'horizontal' && styles.horizontalOption,
              ]}
              onPress={() => handleSelect(option.value)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      width: currentSize.outer,
                      height: currentSize.outer,
                      borderColor: error
                        ? errorColor
                        : isSelected
                        ? primaryColor
                        : borderColor,
                      backgroundColor,
                    },
                    isDisabled && styles.disabled,
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        {
                          width: currentSize.inner,
                          height: currentSize.inner,
                          backgroundColor: primaryColor,
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isDisabled ? mutedColor : textColor,
                      },
                      isSelected && styles.selectedLabel,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text
                      style={[
                        styles.description,
                        {
                          color: isDisabled ? mutedColor : mutedColor,
                        },
                      ]}
                    >
                      {option.description}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  label: {
    fontSize: TextVariants.body2.fontSize,
    fontWeight: TextVariants.h6.fontWeight,
    marginBottom: Spacing[3],
  },
  optionsContainer: {
    gap: Spacing[3],
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flex: 1,
  },
  horizontalOption: {
    marginRight: Spacing[4],
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  radioOuter: {
    borderWidth: 2,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    borderRadius: BorderRadius.full,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: TextVariants.body2.fontSize,
    fontWeight: TextVariants.body2.fontWeight,
  },
  selectedLabel: {
    fontWeight: TextVariants.button.fontWeight,
  },
  description: {
    fontSize: TextVariants.caption.fontSize,
    marginTop: Spacing[1],
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: TextVariants.caption.fontSize,
    marginTop: Spacing[2],
  },
});
