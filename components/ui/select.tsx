/**
 * Enhanced Select/Dropdown Component
 * Supports single/multi-select, search, custom options
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { Shadows } from '../../constants/shadows';
import { BorderRadiusSemantic, IconSize, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | number | (string | number)[];
  options: SelectOption[];
  onChange: (value: string | number | (string | number)[]) => void;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  required?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  error,
  disabled = false,
  searchable = false,
  multiple = false,
  required = false,
  style,
  labelStyle,
  size = 'md',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = useThemeColor({}, 'error');
  const mutedColor = useThemeColor({}, 'textMuted');

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get selected label(s)
  const getSelectedLabel = () => {
    if (!value) return placeholder;
    
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      const selectedOptions = options.filter(opt => value.includes(opt.value));
      return selectedOptions.map(opt => opt.label).join(', ');
    }
    
    const selected = options.find(opt => opt.value === value);
    return selected?.label || placeholder;
  };

  // Handle option select
  const handleSelect = (optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
    setSearchQuery('');
  };

  // Check if option is selected
  const isSelected = (optionValue: string | number) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const sizeStyles = {
    sm: {
      height: 36,
      fontSize: TextVariants.caption.fontSize,
      iconSize: IconSize.sm,
    },
    md: {
      height: 48,
      fontSize: TextVariants.body2.fontSize,
      iconSize: IconSize.md,
    },
    lg: {
      height: 56,
      fontSize: TextVariants.body1.fontSize,
      iconSize: IconSize.lg,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, { color: textColor }, labelStyle]}>
          {label}
          {required && <Text style={{ color: errorColor }}> *</Text>}
        </Text>
      )}

      {/* Select Button */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            height: currentSize.height,
            borderColor: error ? errorColor : borderColor,
            backgroundColor,
          },
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            {
              fontSize: currentSize.fontSize,
              color: value ? textColor : mutedColor,
            },
          ]}
          numberOfLines={1}
        >
          {getSelectedLabel()}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={currentSize.iconSize}
          color={disabled ? mutedColor : textColor}
        />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}

      {/* Options Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {label || 'Select'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={IconSize.lg} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            {searchable && (
              <View style={[styles.searchContainer, { borderColor }]}>
                <Ionicons name="search" size={IconSize.md} color={mutedColor} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Search..."
                  placeholderTextColor={mutedColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={item => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.disabled && styles.optionDisabled,
                    { borderBottomColor: borderColor },
                  ]}
                  onPress={() => !item.disabled && handleSelect(item.value)}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <Ionicons
                      name={item.icon}
                      size={IconSize.md}
                      color={isSelected(item.value) ? primaryColor : textColor}
                      style={styles.optionIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected(item.value)
                          ? primaryColor
                          : item.disabled
                          ? mutedColor
                          : textColor,
                      },
                      isSelected(item.value) && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected(item.value) && (
                    <Ionicons
                      name="checkmark"
                      size={IconSize.md}
                      color={primaryColor}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  No options found
                </Text>
              }
            />

            {/* Done Button (for multiple select) */}
            {multiple && (
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: primaryColor }]}
                onPress={() => setIsOpen(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  label: {
    fontSize: TextVariants.body2.fontSize,
    fontWeight: TextVariants.body2.fontWeight,
    marginBottom: Spacing[2],
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderRadius: BorderRadiusSemantic.input,
  },
  selectText: {
    flex: 1,
    fontWeight: TextVariants.body2.fontWeight,
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: TextVariants.caption.fontSize,
    marginTop: Spacing[1],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing[4],
  },
  modalContent: {
    borderRadius: BorderRadiusSemantic.modal,
    maxHeight: '80%',
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: TextVariants.h6.fontSize,
    fontWeight: TextVariants.h6.fontWeight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    gap: Spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: TextVariants.body2.fontSize,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    gap: Spacing[3],
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    marginRight: Spacing[2],
  },
  optionText: {
    flex: 1,
    fontSize: TextVariants.body2.fontSize,
  },
  optionTextSelected: {
    fontWeight: TextVariants.button.fontWeight,
  },
  emptyText: {
    textAlign: 'center',
    padding: Spacing[6],
    fontSize: TextVariants.body2.fontSize,
  },
  doneButton: {
    margin: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadiusSemantic.button,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: TextVariants.button.fontSize,
    fontWeight: TextVariants.button.fontWeight,
  },
});
