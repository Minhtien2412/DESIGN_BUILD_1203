/**
 * FilterPanel.tsx
 * Advanced multi-criteria filtering for Construction Map tasks and stages
 *
 * Features:
 * - Multi-select status filter (Pending/InProgress/Completed/Cancelled)
 * - Priority filter (Low/Medium/High)
 * - Assignee filter (multi-select)
 * - Date range picker (start/end dates)
 * - Text search (name/description)
 * - Filter presets (save/load/delete)
 * - Active filter count badge
 * - Clear all filters
 */

import { TaskPriority, TaskStatus } from "@/types/construction-map";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export interface FilterCriteria {
  // Status filters
  statuses: TaskStatus[];

  // Priority filters
  priorities: TaskPriority[];

  // Assignee filters
  assigneeIds: string[];

  // Date range
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;

  // Text search
  searchText: string;

  // Show only overdue tasks
  onlyOverdue: boolean;

  // Show only unassigned tasks
  onlyUnassigned: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  criteria: FilterCriteria;
  createdAt: Date;
}

interface FilterPanelProps {
  visible: boolean;
  currentFilters: FilterCriteria;
  onApplyFilters: (criteria: FilterCriteria) => void;
  onClose: () => void;
  assigneeOptions?: { id: string; name: string }[];
  presets?: FilterPreset[];
  onSavePreset?: (name: string, criteria: FilterCriteria) => void;
  onDeletePreset?: (presetId: string) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
}

const defaultFilters: FilterCriteria = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  searchText: "",
  onlyOverdue: false,
  onlyUnassigned: false,
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  currentFilters,
  onApplyFilters,
  onClose,
  assigneeOptions = [],
  presets = [],
  onSavePreset,
  onDeletePreset,
  onLoadPreset,
}) => {
  const [filters, setFilters] = useState<FilterCriteria>(currentFilters);
  const [showDatePicker, setShowDatePicker] = useState<{
    field: "startFrom" | "startTo" | "endFrom" | "endTo" | null;
  }>({ field: null });
  const [showPresetSave, setShowPresetSave] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "status",
  );

  useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  // Toggle status filter
  const toggleStatus = (status: TaskStatus) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  // Toggle priority filter
  const togglePriority = (priority: TaskPriority) => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  // Toggle assignee filter
  const toggleAssignee = (assigneeId: string) => {
    setFilters((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(assigneeId)
        ? prev.assigneeIds.filter((id) => id !== assigneeId)
        : [...prev.assigneeIds, assigneeId],
    }));
  };

  // Handle date picker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker({ field: null });
      return;
    }

    if (selectedDate && showDatePicker.field) {
      const field = showDatePicker.field;
      setFilters((prev) => ({
        ...prev,
        ...(field === "startFrom" && { startDateFrom: selectedDate }),
        ...(field === "startTo" && { startDateTo: selectedDate }),
        ...(field === "endFrom" && { endDateFrom: selectedDate }),
        ...(field === "endTo" && { endDateTo: selectedDate }),
      }));
    }
    setShowDatePicker({ field: null });
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters(defaultFilters);
  };

  // Apply filters
  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  // Save preset
  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName("");
      setShowPresetSave(false);
    }
  };

  // Load preset
  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.criteria);
    if (onLoadPreset) {
      onLoadPreset(preset);
    }
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.statuses.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.assigneeIds.length > 0) count++;
    if (filters.startDateFrom || filters.startDateTo) count++;
    if (filters.endDateFrom || filters.endDateTo) count++;
    if (filters.searchText.trim()) count++;
    if (filters.onlyOverdue) count++;
    if (filters.onlyUnassigned) count++;
    return count;
  };

  // Get status color
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case "pending":
        return "#0066CC";
      case "in-progress":
        return "#3B82F6";
      case "completed":
        return "#0066CC";
      case "blocked":
        return "#000000";
      default:
        return "#6B7280";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case "low":
        return "#0066CC";
      case "medium":
        return "#0066CC";
      case "high":
        return "#000000";
      default:
        return "#6B7280";
    }
  };

  // Render collapsible section
  const renderSection = (
    title: string,
    key: string,
    content: React.ReactNode,
    badgeCount?: number,
  ) => {
    const isExpanded = expandedSection === key;
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setExpandedSection(isExpanded ? null : key)}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {badgeCount !== undefined && badgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCount}</Text>
              </View>
            )}
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        {isExpanded && <View style={styles.sectionContent}>{content}</View>}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Bộ Lọc</Text>
              {getActiveFilterCount() > 0 && (
                <View style={styles.activeCountBadge}>
                  <Text style={styles.activeCountText}>
                    {getActiveFilterCount()}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={filters.searchText}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, searchText: text }))
                }
              />
              {filters.searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, searchText: "" }))
                  }
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Status Filter */}
            {renderSection(
              "Trạng Thái",
              "status",
              <View style={styles.chipContainer}>
                {(
                  [
                    "pending",
                    "in-progress",
                    "completed",
                    "blocked",
                  ] as TaskStatus[]
                ).map((status) => {
                  const isSelected = filters.statuses.includes(status);
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.chip,
                        isSelected && {
                          backgroundColor: getStatusColor(status),
                          borderColor: getStatusColor(status),
                        },
                      ]}
                      onPress={() => toggleStatus(status)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {status === "pending"
                          ? "Đang Chờ"
                          : status === "in-progress"
                            ? "Đang Làm"
                            : status === "completed"
                              ? "Hoàn Thành"
                              : status === "blocked"
                                ? "Bị Chặn"
                                : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>,
              filters.statuses.length,
            )}

            {/* Priority Filter */}
            {renderSection(
              "Độ Ưu Tiên",
              "priority",
              <View style={styles.chipContainer}>
                {(["low", "medium", "high"] as TaskPriority[]).map(
                  (priority) => {
                    const isSelected = filters.priorities.includes(priority);
                    return (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.chip,
                          isSelected && {
                            backgroundColor: getPriorityColor(priority),
                            borderColor: getPriorityColor(priority),
                          },
                        ]}
                        onPress={() => togglePriority(priority)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {priority === "low"
                            ? "Thấp"
                            : priority === "medium"
                              ? "Trung Bình"
                              : priority === "high"
                                ? "Cao"
                                : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>,
              filters.priorities.length,
            )}

            {/* Assignee Filter */}
            {assigneeOptions.length > 0 &&
              renderSection(
                "Người Thực Hiện",
                "assignee",
                <View style={styles.assigneeList}>
                  {assigneeOptions.map((assignee) => {
                    const isSelected = filters.assigneeIds.includes(
                      assignee.id,
                    );
                    return (
                      <TouchableOpacity
                        key={assignee.id}
                        style={styles.assigneeItem}
                        onPress={() => toggleAssignee(assignee.id)}
                      >
                        <Text style={styles.assigneeName}>{assignee.name}</Text>
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>,
                filters.assigneeIds.length,
              )}

            {/* Date Range Filter */}
            {renderSection(
              "Ngày Bắt Đầu",
              "startDate",
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Từ:</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker({ field: "startFrom" })}
                  >
                    <Text style={styles.dateButtonText}>
                      {filters.startDateFrom
                        ? filters.startDateFrom.toLocaleDateString("vi-VN")
                        : "Chọn ngày"}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                  {filters.startDateFrom && (
                    <TouchableOpacity
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          startDateFrom: undefined,
                        }))
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="#000000" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Đến:</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker({ field: "startTo" })}
                  >
                    <Text style={styles.dateButtonText}>
                      {filters.startDateTo
                        ? filters.startDateTo.toLocaleDateString("vi-VN")
                        : "Chọn ngày"}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                  {filters.startDateTo && (
                    <TouchableOpacity
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          startDateTo: undefined,
                        }))
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="#000000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>,
              filters.startDateFrom || filters.startDateTo ? 1 : 0,
            )}

            {/* Toggle Filters */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>
                  Chỉ hiện công việc quá hạn
                </Text>
                <Switch
                  value={filters.onlyOverdue}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, onlyOverdue: value }))
                  }
                  trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>
                  Chỉ hiện công việc chưa giao
                </Text>
                <Switch
                  value={filters.onlyUnassigned}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, onlyUnassigned: value }))
                  }
                  trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                />
              </View>
            </View>

            {/* Presets */}
            {presets.length > 0 && onLoadPreset && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bộ Lọc Đã Lưu</Text>
                <View style={styles.presetList}>
                  {presets.map((preset) => (
                    <View key={preset.id} style={styles.presetItem}>
                      <TouchableOpacity
                        style={styles.presetButton}
                        onPress={() => handleLoadPreset(preset)}
                      >
                        <Ionicons name="bookmark" size={16} color="#3B82F6" />
                        <Text style={styles.presetName}>{preset.name}</Text>
                      </TouchableOpacity>
                      {onDeletePreset && (
                        <TouchableOpacity
                          onPress={() => onDeletePreset(preset.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#000000"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Xóa Tất Cả</Text>
            </TouchableOpacity>

            {onSavePreset && (
              <TouchableOpacity
                style={styles.savePresetButton}
                onPress={() => setShowPresetSave(true)}
              >
                <Ionicons name="bookmark-outline" size={18} color="#FFF" />
                <Text style={styles.savePresetButtonText}>Lưu</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Áp Dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker */}
      {showDatePicker.field && (
        <DateTimePicker
          value={
            (showDatePicker.field === "startFrom" && filters.startDateFrom) ||
            (showDatePicker.field === "startTo" && filters.startDateTo) ||
            (showDatePicker.field === "endFrom" && filters.endDateFrom) ||
            (showDatePicker.field === "endTo" && filters.endDateTo) ||
            new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Save Preset Modal */}
      <Modal
        visible={showPresetSave}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPresetSave(false)}
      >
        <View style={styles.presetModalOverlay}>
          <View style={styles.presetModalContent}>
            <Text style={styles.presetModalTitle}>Lưu Bộ Lọc</Text>
            <TextInput
              style={styles.presetInput}
              placeholder="Nhập tên bộ lọc..."
              value={presetName}
              onChangeText={setPresetName}
              autoFocus
            />
            <View style={styles.presetModalActions}>
              <TouchableOpacity
                style={styles.presetCancelButton}
                onPress={() => {
                  setShowPresetSave(false);
                  setPresetName("");
                }}
              >
                <Text style={styles.presetCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.presetSaveButton,
                  !presetName.trim() && styles.presetSaveButtonDisabled,
                ]}
                onPress={handleSavePreset}
                disabled={!presetName.trim()}
              >
                <Text style={styles.presetSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  activeCountBadge: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  activeCountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#E8F4FF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "#1E40AF",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionContent: {
    paddingTop: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
  },
  chipText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },
  assigneeList: {
    gap: 8,
  },
  assigneeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  assigneeName: {
    fontSize: 14,
    color: "#111827",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  dateRangeContainer: {
    gap: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: "#6B7280",
    width: 40,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#111827",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 14,
    color: "#111827",
  },
  presetList: {
    gap: 8,
    marginTop: 8,
  },
  presetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  presetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  presetName: {
    fontSize: 14,
    color: "#111827",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  savePresetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#6B7280",
    borderRadius: 8,
  },
  savePresetButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  presetModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  presetModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  presetModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  presetInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  presetModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  presetCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  presetCancelButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  presetSaveButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    alignItems: "center",
  },
  presetSaveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  presetSaveButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
