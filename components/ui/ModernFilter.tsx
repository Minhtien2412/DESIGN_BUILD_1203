/**
 * Modern Filter Component - Bộ lọc hiện đại, gọn gàng
 * Dùng chung cho các trang: Workers, Contractors, Companies, Products
 * @created 2025-01-30
 */

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#14B8A6",
  primaryLight: "#FFF0EB",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E8E8E8",
  background: "#F8F9FA",
  white: "#FFFFFF",
  success: "#4CAF50",
};

// ============================================================================
// TYPES
// ============================================================================
export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

export interface FilterValues {
  [key: string]: string | string[];
}

interface ModernFilterProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (filterId: string, value: string | string[]) => void;
  onClear?: () => void;
  showClearButton?: boolean;
}

// ============================================================================
// CHIP FILTER (Horizontal Scroll)
// ============================================================================
interface ChipFilterProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
  showAll?: boolean;
}

export function ChipFilter({
  options,
  selected,
  onSelect,
  showAll = true,
}: ChipFilterProps) {
  const allOptions = showAll
    ? [{ id: "all", label: "Tất cả" }, ...options]
    : options;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={chipStyles.container}
      contentContainerStyle={chipStyles.content}
    >
      {allOptions.map((option) => {
        const isActive = selected === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[chipStyles.chip, isActive && chipStyles.chipActive]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <Ionicons
                name={option.icon as any}
                size={14}
                color={isActive ? COLORS.white : COLORS.textSecondary}
                style={chipStyles.chipIcon}
              />
            )}
            <Text
              style={[
                chipStyles.chipText,
                isActive && chipStyles.chipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const chipStyles = StyleSheet.create({
  container: {
    maxHeight: 50,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  chipTextActive: {
    color: COLORS.white,
  },
});

// ============================================================================
// DROPDOWN FILTER
// ============================================================================
interface DropdownFilterProps {
  label: string;
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export function DropdownFilter({
  label,
  options,
  selected,
  onSelect,
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.id === selected);

  return (
    <>
      <TouchableOpacity
        style={dropdownStyles.trigger}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={dropdownStyles.triggerLabel}>{label}</Text>
        <View style={dropdownStyles.triggerValue}>
          <Text
            style={[
              dropdownStyles.triggerText,
              selected &&
                selected !== "all" &&
                dropdownStyles.triggerTextActive,
            ]}
            numberOfLines={1}
          >
            {selectedOption?.label || "Tất cả"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={dropdownStyles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={dropdownStyles.dropdown}>
            <View style={dropdownStyles.header}>
              <Text style={dropdownStyles.headerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={dropdownStyles.optionsList}>
              <TouchableOpacity
                style={[
                  dropdownStyles.option,
                  (!selected || selected === "all") &&
                    dropdownStyles.optionActive,
                ]}
                onPress={() => {
                  onSelect("all");
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    dropdownStyles.optionText,
                    (!selected || selected === "all") &&
                      dropdownStyles.optionTextActive,
                  ]}
                >
                  Tất cả
                </Text>
                {(!selected || selected === "all") && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    dropdownStyles.option,
                    selected === option.id && dropdownStyles.optionActive,
                  ]}
                  onPress={() => {
                    onSelect(option.id);
                    setIsOpen(false);
                  }}
                >
                  {option.icon && (
                    <Ionicons
                      name={option.icon as any}
                      size={18}
                      color={
                        selected === option.id
                          ? COLORS.primary
                          : COLORS.textSecondary
                      }
                      style={dropdownStyles.optionIcon}
                    />
                  )}
                  <Text
                    style={[
                      dropdownStyles.optionText,
                      selected === option.id && dropdownStyles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selected === option.id && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const dropdownStyles = StyleSheet.create({
  trigger: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 120,
  },
  triggerLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  triggerValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
  },
  triggerTextActive: {
    color: COLORS.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: "100%",
    maxWidth: 340,
    maxHeight: "70%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  optionsList: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

// ============================================================================
// FILTER BAR (Multiple Dropdowns in a Row)
// ============================================================================
interface FilterBarProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (filterId: string, value: string) => void;
  onClear?: () => void;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
}: FilterBarProps) {
  const activeCount = Object.values(values).filter(
    (v) => v && v !== "all",
  ).length;

  return (
    <View style={filterBarStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={filterBarStyles.content}
      >
        {filters.map((filter) => (
          <DropdownFilter
            key={filter.id}
            label={filter.label}
            options={filter.options}
            selected={values[filter.id] as string}
            onSelect={(value) => onChange(filter.id, value)}
          />
        ))}
      </ScrollView>
      {activeCount > 0 && onClear && (
        <TouchableOpacity style={filterBarStyles.clearBtn} onPress={onClear}>
          <Ionicons name="close-circle" size={18} color={COLORS.primary} />
          <Text style={filterBarStyles.clearText}>Xóa ({activeCount})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const filterBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: "row",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 16,
    gap: 4,
  },
  clearText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
});

// ============================================================================
// FULL FILTER MODAL
// ============================================================================
interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (filterId: string, value: string | string[]) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterModal({
  visible,
  onClose,
  filters,
  values,
  onChange,
  onApply,
  onClear,
}: FilterModalProps) {
  const activeCount = Object.values(values).filter(
    (v) => v && v !== "all" && (Array.isArray(v) ? v.length > 0 : true),
  ).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView
            style={modalStyles.content}
            showsVerticalScrollIndicator={false}
          >
            {filters.map((filter) => (
              <View key={filter.id} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>{filter.label}</Text>
                <View style={modalStyles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      modalStyles.optionChip,
                      (!values[filter.id] || values[filter.id] === "all") &&
                        modalStyles.optionChipActive,
                    ]}
                    onPress={() => onChange(filter.id, "all")}
                  >
                    <Text
                      style={[
                        modalStyles.optionChipText,
                        (!values[filter.id] || values[filter.id] === "all") &&
                          modalStyles.optionChipTextActive,
                      ]}
                    >
                      Tất cả
                    </Text>
                  </TouchableOpacity>
                  {filter.options.map((option) => {
                    const isSelected = filter.multiSelect
                      ? (values[filter.id] as string[])?.includes(option.id)
                      : values[filter.id] === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          modalStyles.optionChip,
                          isSelected && modalStyles.optionChipActive,
                        ]}
                        onPress={() => {
                          if (filter.multiSelect) {
                            const current =
                              (values[filter.id] as string[]) || [];
                            const updated = isSelected
                              ? current.filter((id) => id !== option.id)
                              : [...current, option.id];
                            onChange(filter.id, updated);
                          } else {
                            onChange(filter.id, option.id);
                          }
                        }}
                      >
                        {option.icon && (
                          <Ionicons
                            name={option.icon as any}
                            size={14}
                            color={isSelected ? COLORS.white : COLORS.text}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            modalStyles.optionChipText,
                            isSelected && modalStyles.optionChipTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={modalStyles.clearButton}
              onPress={onClear}
              disabled={activeCount === 0}
            >
              <Text
                style={[
                  modalStyles.clearButtonText,
                  activeCount === 0 && { opacity: 0.5 },
                ]}
              >
                Đặt lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.applyButton} onPress={onApply}>
              <Text style={modalStyles.applyButtonText}>
                Áp dụng {activeCount > 0 ? `(${activeCount})` : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  optionChipTextActive: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
});

// ============================================================================
// SEARCH HEADER WITH FILTER BUTTON
// ============================================================================
interface SearchHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  filterCount?: number;
}

export function SearchHeader({
  value,
  onChangeText,
  placeholder = "Tìm kiếm...",
  onFilterPress,
  filterCount = 0,
}: SearchHeaderProps) {
  return (
    <View style={searchStyles.container}>
      <View style={searchStyles.inputContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={searchStyles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {onFilterPress && (
        <TouchableOpacity
          style={searchStyles.filterBtn}
          onPress={onFilterPress}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          {filterCount > 0 && (
            <View style={searchStyles.filterBadge}>
              <Text style={searchStyles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const searchStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
});

// ============================================================================
// SORT OPTIONS
// ============================================================================
export interface SortOption {
  id: string;
  label: string;
  icon?: string;
}

interface SortBarProps {
  options: SortOption[];
  selected: string;
  onSelect: (id: string) => void;
  resultCount?: number;
}

export function SortBar({
  options,
  selected,
  onSelect,
  resultCount,
}: SortBarProps) {
  const [showOptions, setShowOptions] = useState(false);
  const selectedOption = options.find((o) => o.id === selected);

  return (
    <View style={sortStyles.container}>
      {resultCount !== undefined && (
        <Text style={sortStyles.resultText}>{resultCount} kết quả</Text>
      )}
      <TouchableOpacity
        style={sortStyles.sortBtn}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Ionicons name="swap-vertical" size={16} color={COLORS.primary} />
        <Text style={sortStyles.sortText}>
          {selectedOption?.label || "Sắp xếp"}
        </Text>
        <Ionicons
          name={showOptions ? "chevron-up" : "chevron-down"}
          size={14}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      {showOptions && (
        <View style={sortStyles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                sortStyles.option,
                selected === option.id && sortStyles.optionActive,
              ]}
              onPress={() => {
                onSelect(option.id);
                setShowOptions(false);
              }}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={
                    selected === option.id
                      ? COLORS.primary
                      : COLORS.textSecondary
                  }
                />
              )}
              <Text
                style={[
                  sortStyles.optionText,
                  selected === option.id && sortStyles.optionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {selected === option.id && (
                <Ionicons name="checkmark" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const sortStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  resultText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.primary,
  },
  dropdown: {
    position: "absolute",
    top: 45,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  optionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

// Export default for convenience
export default {
  ChipFilter,
  DropdownFilter,
  FilterBar,
  FilterModal,
  SearchHeader,
  SortBar,
};
