/**
 * Sort Filter Component
 * Dropdown/modal for sorting options
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type SortOption = {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

interface SortFilterProps {
  visible: boolean;
  onClose: () => void;
  options: SortOption[];
  selectedSort: string;
  onSelectSort: (sortId: string) => void;
}

export function SortFilter({
  visible,
  onClose,
  options,
  selectedSort,
  onSelectSort,
}: SortFilterProps) {
  const handleSelect = (sortId: string) => {
    onSelectSort(sortId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.header}>
              <Text style={styles.title}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {options.map((option) => {
                const isSelected = selectedSort === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.option, isSelected && styles.optionActive]}
                    onPress={() => handleSelect(option.id)}
                    activeOpacity={0.7}
                  >
                    {option.icon && (
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={isSelected ? Colors.light.primary : Colors.light.textMuted}
                      />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={Colors.light.primary}
                        style={styles.checkmark}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  optionActive: {
    backgroundColor: `${Colors.light.primary}08`,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  optionTextActive: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
  checkmark: {
    marginLeft: 'auto',
  },
});
