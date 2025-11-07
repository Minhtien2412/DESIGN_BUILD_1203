import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

// ============================================
// CHECKBOX - Enhanced with Groups & States
// ============================================

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: CheckboxSize;
  disabled?: boolean;
  indeterminate?: boolean; // Partially checked state (e.g., select all with some selected)
  error?: boolean;
  style?: any;
}

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value: string[]; // Array of selected values
  onChange: (value: string[]) => void;
  size?: CheckboxSize;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  direction?: 'vertical' | 'horizontal';
  style?: any;
}

// Size mappings
const SIZE_MAP = {
  sm: { box: 16, icon: 10, gap: SpacingSemantic.xs },
  md: { box: 20, icon: 12, gap: SpacingSemantic.sm },
  lg: { box: 24, icon: 14, gap: SpacingSemantic.md },
};

// ============================================
// CHECKBOX COMPONENT
// ============================================

const Checkbox = React.forwardRef<View, CheckboxProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      size = 'md',
      disabled = false,
      indeterminate = false,
      error = false,
      style,
    },
    ref
  ) => {
    const primary = useThemeColor({}, 'primary');
    const border = useThemeColor({}, 'border');
    const text = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const errorColor = '#EF4444'; // Red-500
    const background = useThemeColor({}, 'background');

    const sizeConfig = SIZE_MAP[size];
    const isChecked = indeterminate || checked;

    const handlePress = () => {
      if (!disabled) {
        onChange(!checked);
      }
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        style={[styles.container, { gap: sizeConfig.gap }, style]}
      >
        {/* Checkbox Box */}
        <View
          style={[
            styles.box,
            {
              width: sizeConfig.box,
              height: sizeConfig.box,
              borderColor: error ? errorColor : isChecked ? primary : border,
              backgroundColor: isChecked ? primary : background,
              borderWidth: 2,
              borderRadius: BorderRadius.sm,
            },
            disabled && styles.disabled,
          ]}
        >
          {/* Checkmark or Indeterminate Line */}
          {indeterminate ? (
            <View
              style={[
                styles.indeterminateLine,
                { width: sizeConfig.icon, backgroundColor: '#FFFFFF' },
              ]}
            />
          ) : checked ? (
            <View
              style={[
                styles.checkmark,
                {
                  width: sizeConfig.icon * 0.5,
                  height: sizeConfig.icon,
                  borderColor: '#FFFFFF',
                },
              ]}
            />
          ) : null}
        </View>

        {/* Label & Description */}
        {(label || description) && (
          <View style={styles.textContainer}>
            {label && (
              <Text
                style={[
                  size === 'sm' ? TextVariants.caption : TextVariants.body2,
                  { color: disabled ? textMuted : text },
                ]}
              >
                {label}
              </Text>
            )}
            {description && (
              <Text
                style={[
                  TextVariants.caption,
                  { color: textMuted, marginTop: 2 },
                ]}
              >
                {description}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================
// CHECKBOX GROUP COMPONENT
// ============================================

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  disabled = false,
  error = false,
  errorMessage,
  direction = 'vertical',
  style,
}) => {
  const errorColor = '#EF4444';

  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    if (value.includes(optionValue)) {
      // Remove from array
      onChange(value.filter((v) => v !== optionValue));
    } else {
      // Add to array
      onChange([...value, optionValue]);
    }
  };

  return (
    <View style={style}>
      <View
        style={[
          styles.group,
          direction === 'horizontal' && styles.groupHorizontal,
        ]}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={value.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            label={option.label}
            description={option.description}
            size={size}
            disabled={disabled || option.disabled}
            error={error}
            style={direction === 'horizontal' && { flex: 1 }}
          />
        ))}
      </View>

      {/* Error Message */}
      {error && errorMessage && (
        <Text style={[TextVariants.caption, { color: errorColor, marginTop: SpacingSemantic.xs }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SpacingSemantic.xs,
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  checkmark: {
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }, { translateY: -2 }],
  },
  indeterminateLine: {
    height: 2,
    borderRadius: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  group: {
    gap: SpacingSemantic.sm,
  },
  groupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default Checkbox;
