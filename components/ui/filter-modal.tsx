import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSection {
  title: string;
  key: string;
  options: FilterOption[];
  selectedValue: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  sections: FilterSection[];
  onApply: (filters: Record<string, string>) => void;
  onReset?: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  sections,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    sections.forEach((section) => {
      initial[section.key] = section.selectedValue;
    });
    return initial;
  });

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: Record<string, string> = {};
    sections.forEach((section) => {
      resetFilters[section.key] = section.options[0]?.value || '';
    });
    setLocalFilters(resetFilters);
    if (onReset) onReset();
  };

  const hasActiveFilters = sections.some((section) => {
    const firstOption = section.options[0]?.value || '';
    return localFilters[section.key] !== firstOption;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={handleReset} disabled={!hasActiveFilters}>
              <Text style={[styles.resetText, !hasActiveFilters && styles.resetTextDisabled]}>
                Đặt lại
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {sections.map((section, sectionIndex) => (
              <View key={section.key} style={styles.filterSection}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.optionsGrid}>
                  {section.options.map((option) => {
                    const isSelected = localFilters[section.key] === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.optionButton, isSelected && styles.optionButtonActive]}
                        onPress={() => {
                          setLocalFilters((prev) => ({
                            ...prev,
                            [section.key]: option.value,
                          }));
                        }}
                      >
                        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={Colors.light.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  resetText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
    width: 60,
    textAlign: 'right',
  },
  resetTextDisabled: {
    color: '#ccc',
  },
  filterContent: {
    flex: 1,
  },
  filterSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  optionButtonActive: {
    backgroundColor: '#fff5f0',
    borderColor: Colors.light.primary,
  },
  optionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  optionTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  applyButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
