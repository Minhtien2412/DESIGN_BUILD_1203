/**
 * CompactFilter - Bộ lọc gọn nhẹ dạng dropdown
 * Sử dụng cho các màn hình danh sách cần filter
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Types
export interface FilterOption {
  value: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

export interface FilterValues {
  [key: string]: string;
}

interface CompactFilterProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (key: string, value: string) => void;
  onClear?: () => void;
  variant?: "dropdown" | "chip" | "modal";
  showActiveCount?: boolean;
  primaryColor?: string;
}

// Dropdown Filter Button
const FilterDropdownButton = ({
  filter,
  value,
  isActive,
  isOpen,
  onToggle,
  primaryColor,
}: {
  filter: FilterConfig;
  value: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  primaryColor: string;
}) => {
  const displayLabel = isActive
    ? filter.options.find((o) => o.value === value)?.label || value
    : filter.label;

  return (
    <TouchableOpacity
      style={[
        styles.dropdownBtn,
        isActive && [
          styles.dropdownBtnActive,
          { backgroundColor: primaryColor, borderColor: primaryColor },
        ],
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.dropdownBtnText,
          isActive && styles.dropdownBtnTextActive,
        ]}
        numberOfLines={1}
      >
        {displayLabel}
      </Text>
      <Ionicons
        name={isOpen ? "chevron-up" : "chevron-down"}
        size={12}
        color={isActive ? "#fff" : "#666"}
      />
    </TouchableOpacity>
  );
};

// Dropdown Menu
const FilterDropdownMenu = ({
  filter,
  value,
  onSelect,
  onClose,
  primaryColor,
}: {
  filter: FilterConfig;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  primaryColor: string;
}) => {
  return (
    <View style={styles.dropdownMenu}>
      <View style={styles.dropdownHeader}>
        <Text style={styles.dropdownTitle}>{filter.label}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.dropdownScroll}
        showsVerticalScrollIndicator={false}
      >
        {filter.options.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                isSelected && [
                  styles.dropdownItemActive,
                  { backgroundColor: primaryColor + "15" },
                ],
              ]}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              activeOpacity={0.7}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={isSelected ? primaryColor : "#666"}
                  style={styles.dropdownItemIcon}
                />
              )}
              <Text
                style={[
                  styles.dropdownItemText,
                  isSelected && [
                    styles.dropdownItemTextActive,
                    { color: primaryColor },
                  ],
                ]}
              >
                {option.label}
              </Text>
              {option.count !== undefined && (
                <Text style={styles.dropdownItemCount}>({option.count})</Text>
              )}
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={primaryColor} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Chip Filter (alternative style)
const FilterChips = ({
  filter,
  value,
  onSelect,
  primaryColor,
}: {
  filter: FilterConfig;
  value: string;
  onSelect: (value: string) => void;
  primaryColor: string;
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipScroll}
    >
      {filter.options.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              isSelected && [
                styles.chipActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={12}
                color={isSelected ? "#fff" : "#666"}
              />
            )}
            <Text
              style={[styles.chipText, isSelected && styles.chipTextActive]}
            >
              {option.label}
            </Text>
            {option.count !== undefined && (
              <View
                style={[
                  styles.chipBadge,
                  isSelected && { backgroundColor: "rgba(255,255,255,0.3)" },
                ]}
              >
                <Text
                  style={[
                    styles.chipBadgeText,
                    isSelected && { color: "#fff" },
                  ]}
                >
                  {option.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// Main Component
export const CompactFilter: React.FC<CompactFilterProps> = ({
  filters,
  values,
  onChange,
  onClear,
  variant = "dropdown",
  showActiveCount = true,
  primaryColor = "#0066CC",
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [modalFilter, setModalFilter] = useState<FilterConfig | null>(null);

  const activeCount = filters.filter(
    (f) =>
      values[f.key] && values[f.key] !== (f.defaultValue || f.options[0]?.value)
  ).length;

  const handleToggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleClear = () => {
    filters.forEach((f) => {
      onChange(f.key, f.defaultValue || f.options[0]?.value || "");
    });
    setOpenDropdown(null);
    onClear?.();
  };

  if (variant === "chip") {
    return (
      <View style={styles.container}>
        {filters.map((filter) => (
          <View key={filter.key} style={styles.chipSection}>
            <Text style={styles.chipSectionLabel}>{filter.label}:</Text>
            <FilterChips
              filter={filter}
              value={values[filter.key] || filter.defaultValue || ""}
              onSelect={(v) => onChange(filter.key, v)}
              primaryColor={primaryColor}
            />
          </View>
        ))}
      </View>
    );
  }

  if (variant === "modal") {
    return (
      <View style={styles.containerRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
        >
          {filters.map((filter) => {
            const currentValue =
              values[filter.key] ||
              filter.defaultValue ||
              filter.options[0]?.value;
            const isActive =
              currentValue !==
              (filter.defaultValue || filter.options[0]?.value);

            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.dropdownBtn,
                  isActive && [
                    styles.dropdownBtnActive,
                    {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    },
                  ],
                ]}
                onPress={() => setModalFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownBtnText,
                    isActive && styles.dropdownBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {isActive
                    ? filter.options.find((o) => o.value === currentValue)
                        ?.label || currentValue
                    : filter.label}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color={isActive ? "#fff" : "#666"}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {showActiveCount && activeCount > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}

        <Modal
          visible={!!modalFilter}
          transparent
          animationType="fade"
          onRequestClose={() => setModalFilter(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalFilter(null)}
          >
            <View style={styles.modalContent}>
              {modalFilter && (
                <FilterDropdownMenu
                  filter={modalFilter}
                  value={
                    values[modalFilter.key] || modalFilter.defaultValue || ""
                  }
                  onSelect={(v) => onChange(modalFilter.key, v)}
                  onClose={() => setModalFilter(null)}
                  primaryColor={primaryColor}
                />
              )}
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // Default: dropdown variant
  return (
    <View style={styles.containerRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowContent}
      >
        {filters.map((filter) => {
          const currentValue =
            values[filter.key] ||
            filter.defaultValue ||
            filter.options[0]?.value;
          const isActive =
            currentValue !== (filter.defaultValue || filter.options[0]?.value);
          const isOpen = openDropdown === filter.key;

          return (
            <View key={filter.key} style={styles.dropdownWrapper}>
              <FilterDropdownButton
                filter={filter}
                value={currentValue}
                isActive={isActive}
                isOpen={isOpen}
                onToggle={() => handleToggleDropdown(filter.key)}
                primaryColor={primaryColor}
              />

              {isOpen && (
                <View style={styles.dropdownMenuWrapper}>
                  <FilterDropdownMenu
                    filter={filter}
                    value={currentValue}
                    onSelect={(v) => onChange(filter.key, v)}
                    onClose={() => setOpenDropdown(null)}
                    primaryColor={primaryColor}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {showActiveCount && activeCount > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Ionicons name="close-circle" size={18} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Quick Filter Bar - Simplified version for common use cases
export const QuickFilterBar: React.FC<{
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  primaryColor?: string;
}> = ({ options, selected, onSelect, primaryColor = "#0066CC" }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickBarContent}
    >
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.quickChip,
              isSelected && [
                styles.quickChipActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.quickChipText,
                isSelected && styles.quickChipTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  containerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rowContent: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 8,
  },

  // Dropdown styles
  dropdownWrapper: {
    position: "relative",
    zIndex: 100,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    maxWidth: 130,
  },
  dropdownBtnActive: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },
  dropdownBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    flexShrink: 1,
  },
  dropdownBtnTextActive: {
    color: "#fff",
  },
  dropdownMenuWrapper: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 4,
    zIndex: 1000,
  },
  dropdownMenu: {
    minWidth: 160,
    maxWidth: SCREEN_WIDTH * 0.7,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#E8F4FF",
  },
  dropdownItemIcon: {
    width: 20,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  dropdownItemTextActive: {
    fontWeight: "600",
    color: "#0066CC",
  },
  dropdownItemCount: {
    fontSize: 12,
    color: "#999",
  },

  // Chip styles
  chipSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  chipSectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    width: 70,
  },
  chipScroll: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
  },
  chipActive: {
    backgroundColor: "#0066CC",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#666",
  },
  chipTextActive: {
    color: "#fff",
  },
  chipBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },

  // Clear button
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
  },

  // Quick filter bar
  quickBarContent: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },
  quickChipActive: {
    backgroundColor: "#0066CC",
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  quickChipTextActive: {
    color: "#fff",
  },
});

export default CompactFilter;
