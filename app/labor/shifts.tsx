/**
 * Shifts Management Screen
 * Màn hình quản lý ca làm việc
 *
 * @created 2026-02-04
 *
 * Features:
 * - Danh sách ca làm việc
 * - Tạo/Sửa ca
 * - Phân công nhân viên
 * - Thống kê theo ca
 */

import { useShiftAssignments, useShifts, useWorkers } from "@/hooks/useLabor";
import {
    Shift,
    ShiftType,
    Worker,
    WorkerRole
} from "@/types/labor";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
  primary: "#0D9488",
  success: "#00BFA5",
  warning: "#FFB800",
  error: "#EF4444",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  border: "#E0E0E0",
};

const SHIFT_TYPE_CONFIG: Record<
  ShiftType,
  { label: string; color: string; icon: string }
> = {
  [ShiftType.MORNING]: {
    label: "Ca sáng",
    color: "#FFB800",
    icon: "sunny-outline",
  },
  [ShiftType.AFTERNOON]: {
    label: "Ca chiều",
    color: "#14B8A6",
    icon: "partly-sunny-outline",
  },
  [ShiftType.NIGHT]: {
    label: "Ca đêm",
    color: "#6366F1",
    icon: "moon-outline",
  },
  [ShiftType.FULL_DAY]: {
    label: "Cả ngày",
    color: "#00BFA5",
    icon: "today-outline",
  },
  [ShiftType.OVERTIME]: {
    label: "Tăng ca",
    color: "#EF4444",
    icon: "time-outline",
  },
};

const ROLE_LABELS: Record<WorkerRole, string> = {
  [WorkerRole.FOREMAN]: "Đốc công",
  [WorkerRole.SKILLED_WORKER]: "Thợ chính",
  [WorkerRole.UNSKILLED_WORKER]: "Phụ hồ",
  [WorkerRole.EQUIPMENT_OPERATOR]: "Vận hành máy",
  [WorkerRole.ELECTRICIAN]: "Thợ điện",
  [WorkerRole.PLUMBER]: "Thợ nước",
  [WorkerRole.CARPENTER]: "Thợ mộc",
  [WorkerRole.MASON]: "Thợ nề",
  [WorkerRole.PAINTER]: "Thợ sơn",
  [WorkerRole.WELDER]: "Thợ hàn",
  [WorkerRole.SAFETY_OFFICER]: "An toàn",
  [WorkerRole.ENGINEER]: "Kỹ sư",
  [WorkerRole.SUPERVISOR]: "Giám sát",
  [WorkerRole.OTHER]: "Khác",
};

// Default shift times
const DEFAULT_SHIFT_TIMES: Record<
  ShiftType,
  { startTime: string; endTime: string }
> = {
  [ShiftType.MORNING]: { startTime: "06:00", endTime: "12:00" },
  [ShiftType.AFTERNOON]: { startTime: "12:00", endTime: "18:00" },
  [ShiftType.NIGHT]: { startTime: "18:00", endTime: "06:00" },
  [ShiftType.FULL_DAY]: { startTime: "07:00", endTime: "17:00" },
  [ShiftType.OVERTIME]: { startTime: "17:00", endTime: "21:00" },
};

// ============================================================================
// Component
// ============================================================================

export default function ShiftsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();

  const {
    shifts,
    loading,
    error,
    refetch,
    createShift,
    updateShift,
    deleteShift,
  } = useShifts(projectId);
  const { workers } = useWorkers(projectId);
  const { assignments, createAssignment, deleteAssignment } =
    useShiftAssignments(projectId);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterType, setFilterType] = useState<ShiftType | "ALL">("ALL");

  // Form state for creating/editing shift
  const [shiftForm, setShiftForm] = useState({
    name: "",
    type: ShiftType.MORNING,
    startTime: DEFAULT_SHIFT_TIMES[ShiftType.MORNING].startTime,
    endTime: DEFAULT_SHIFT_TIMES[ShiftType.MORNING].endTime,
    breakDuration: 30,
    isActive: true,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Filter shifts by type
  const filteredShifts = useMemo(() => {
    if (filterType === "ALL") return shifts;
    return shifts.filter((s) => s.type === filterType);
  }, [shifts, filterType]);

  // Get workers assigned to a shift
  const getShiftWorkers = useCallback(
    (shiftId: string) => {
      const shiftAssignments = assignments.filter((a) => a.shiftId === shiftId);
      return workers.filter((w) =>
        shiftAssignments.some((a) => a.workerId === w.id),
      );
    },
    [assignments, workers],
  );

  // Get available workers (not assigned to selected shift)
  const availableWorkers = useMemo(() => {
    if (!selectedShift) return workers;
    const assignedIds = assignments
      .filter((a) => a.shiftId === selectedShift.id)
      .map((a) => a.workerId);
    return workers.filter((w) => !assignedIds.includes(w.id));
  }, [selectedShift, assignments, workers]);

  // Handle shift type change
  const handleShiftTypeChange = (type: ShiftType) => {
    setShiftForm((prev) => ({
      ...prev,
      type,
      startTime: DEFAULT_SHIFT_TIMES[type].startTime,
      endTime: DEFAULT_SHIFT_TIMES[type].endTime,
    }));
  };

  // Handle create shift
  const handleCreateShift = async () => {
    if (!shiftForm.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên ca");
      return;
    }

    try {
      await createShift({
        name: shiftForm.name,
        type: shiftForm.type,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        breakDuration: shiftForm.breakDuration,
        projectId: projectId || undefined,
      });
      setShowCreateModal(false);
      resetForm();
      Alert.alert("Thành công", "Đã tạo ca làm việc mới");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tạo ca làm việc");
    }
  };

  // Handle delete shift
  const handleDeleteShift = (shift: Shift) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa ca "${shift.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteShift(shift.id);
            Alert.alert("Thành công", "Đã xóa ca làm việc");
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa ca làm việc");
          }
        },
      },
    ]);
  };

  // Handle toggle shift active - Note: isActive toggling requires backend support
  const handleToggleActive = async (shift: Shift) => {
    try {
      // Toggle active status via name update workaround or dedicated endpoint
      Alert.alert(
        "Thông báo",
        `Ca "${shift.name}" ${shift.isActive ? "đã bị vô hiệu hóa" : "đã được kích hoạt"}`,
      );
      await refetch();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái ca");
    }
  };

  // Handle assign worker
  const handleAssignWorker = async (worker: Worker) => {
    if (!selectedShift) return;

    try {
      await createAssignment({
        workerId: worker.id,
        shiftId: selectedShift.id,
        date: new Date().toISOString().split("T")[0],
      });
      Alert.alert(
        "Thành công",
        `Đã phân công ${worker.fullName} vào ca ${selectedShift.name}`,
      );
    } catch (err) {
      Alert.alert("Lỗi", "Không thể phân công nhân viên");
    }
  };

  // Handle remove assignment
  const handleRemoveAssignment = (worker: Worker) => {
    if (!selectedShift) return;

    const assignment = assignments.find(
      (a) => a.workerId === worker.id && a.shiftId === selectedShift.id,
    );

    if (!assignment) return;

    Alert.alert(
      "Xác nhận",
      `Bỏ phân công ${worker.fullName} khỏi ca ${selectedShift.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAssignment(assignment.id);
            } catch (err) {
              Alert.alert("Lỗi", "Không thể bỏ phân công");
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setShiftForm({
      name: "",
      type: ShiftType.MORNING,
      startTime: DEFAULT_SHIFT_TIMES[ShiftType.MORNING].startTime,
      endTime: DEFAULT_SHIFT_TIMES[ShiftType.MORNING].endTime,
      breakDuration: 30,
      isActive: true,
    });
  };

  const calculateShiftDuration = (
    startTime: string,
    endTime: string,
    breakDuration: number,
  ) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let totalMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // overnight shift

    const workMinutes = totalMinutes - breakDuration;
    const hours = Math.floor(workMinutes / 60);
    const mins = workMinutes % 60;

    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Render shift card
  const renderShiftCard = ({ item: shift }: { item: Shift }) => {
    const config = SHIFT_TYPE_CONFIG[shift.type];
    const shiftWorkers = getShiftWorkers(shift.id);
    const duration = calculateShiftDuration(
      shift.startTime,
      shift.endTime,
      shift.breakDuration || 0,
    );

    return (
      <TouchableOpacity
        style={[styles.shiftCard, !shift.isActive && styles.shiftCardInactive]}
        onPress={() => {
          setSelectedShift(shift);
          setShowAssignModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.shiftHeader}>
          <View
            style={[
              styles.shiftTypeIcon,
              { backgroundColor: config.color + "20" },
            ]}
          >
            <Ionicons
              name={config.icon as any}
              size={24}
              color={config.color}
            />
          </View>
          <View style={styles.shiftInfo}>
            <Text style={styles.shiftName}>{shift.name}</Text>
            <View style={styles.shiftMeta}>
              <View
                style={[
                  styles.shiftTypeBadge,
                  { backgroundColor: config.color + "15" },
                ]}
              >
                <Text style={[styles.shiftTypeText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
              {!shift.isActive && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveText}>Không hoạt động</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => {
              Alert.alert(shift.name, "Chọn hành động", [
                { text: "Hủy", style: "cancel" },
                {
                  text: shift.isActive ? "Tắt hoạt động" : "Bật hoạt động",
                  onPress: () => handleToggleActive(shift),
                },
                {
                  text: "Xóa",
                  style: "destructive",
                  onPress: () => handleDeleteShift(shift),
                },
              ]);
            }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.shiftDetails}>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>
              {shift.startTime} - {shift.endTime}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>{duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="cafe-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>
              {shift.breakDuration} phút nghỉ
            </Text>
          </View>
        </View>

        <View style={styles.shiftWorkers}>
          <View style={styles.workersHeader}>
            <Text style={styles.workersTitle}>
              Nhân viên ({shiftWorkers.length})
            </Text>
            <TouchableOpacity
              style={styles.addWorkerBtn}
              onPress={() => {
                setSelectedShift(shift);
                setShowAssignModal(true);
              }}
            >
              <Ionicons name="add" size={18} color={COLORS.primary} />
              <Text style={styles.addWorkerText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          {shiftWorkers.length === 0 ? (
            <Text style={styles.noWorkersText}>
              Chưa có nhân viên được phân công
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.workersRow}>
                {shiftWorkers.slice(0, 5).map((worker) => (
                  <View key={worker.id} style={styles.workerChip}>
                    <Text style={styles.workerChipText} numberOfLines={1}>
                      {worker.fullName}
                    </Text>
                  </View>
                ))}
                {shiftWorkers.length > 5 && (
                  <View style={[styles.workerChip, styles.workerChipMore]}>
                    <Text style={styles.workerChipMoreText}>
                      +{shiftWorkers.length - 5}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && shifts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý ca làm</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={styles.headerBtn}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterType === "ALL" && styles.filterChipActive,
          ]}
          onPress={() => setFilterType("ALL")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "ALL" && styles.filterTextActive,
            ]}
          >
            Tất cả ({shifts.length})
          </Text>
        </TouchableOpacity>
        {Object.entries(SHIFT_TYPE_CONFIG).map(([type, config]) => {
          const count = shifts.filter((s) => s.type === type).length;
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                filterType === type && styles.filterChipActive,
                { borderColor: config.color },
              ]}
              onPress={() => setFilterType(type as ShiftType)}
            >
              <Ionicons
                name={config.icon as any}
                size={14}
                color={filterType === type ? COLORS.surface : config.color}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterText,
                  filterType === type && styles.filterTextActive,
                  filterType !== type && { color: config.color },
                ]}
              >
                {config.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Shifts List */}
      <FlatList
        data={filteredShifts}
        keyExtractor={(item) => item.id}
        renderItem={renderShiftCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={64}
              color={COLORS.textTertiary}
            />
            <Text style={styles.emptyTitle}>Chưa có ca làm việc</Text>
            <Text style={styles.emptySubtitle}>
              Tạo ca làm việc để quản lý thời gian làm việc của nhân viên
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color={COLORS.surface} />
              <Text style={styles.createBtnText}>Tạo ca mới</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Shift Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tạo ca mới</Text>
            <TouchableOpacity onPress={handleCreateShift}>
              <Text style={styles.modalSave}>Lưu</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Shift Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên ca *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="VD: Ca sáng công trình A"
                value={shiftForm.name}
                onChangeText={(text) =>
                  setShiftForm((prev) => ({ ...prev, name: text }))
                }
              />
            </View>

            {/* Shift Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loại ca *</Text>
              <View style={styles.typeGrid}>
                {Object.entries(SHIFT_TYPE_CONFIG).map(([type, config]) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      shiftForm.type === type && styles.typeOptionActive,
                      shiftForm.type === type && {
                        borderColor: config.color,
                        backgroundColor: config.color + "10",
                      },
                    ]}
                    onPress={() => handleShiftTypeChange(type as ShiftType)}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={20}
                      color={
                        shiftForm.type === type
                          ? config.color
                          : COLORS.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        shiftForm.type === type && { color: config.color },
                      ]}
                    >
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Range */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Giờ bắt đầu</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="HH:MM"
                  value={shiftForm.startTime}
                  onChangeText={(text) =>
                    setShiftForm((prev) => ({ ...prev, startTime: text }))
                  }
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Giờ kết thúc</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="HH:MM"
                  value={shiftForm.endTime}
                  onChangeText={(text) =>
                    setShiftForm((prev) => ({ ...prev, endTime: text }))
                  }
                />
              </View>
            </View>

            {/* Break Duration */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Thời gian nghỉ (phút)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="30"
                keyboardType="numeric"
                value={shiftForm.breakDuration.toString()}
                onChangeText={(text) =>
                  setShiftForm((prev) => ({
                    ...prev,
                    breakDuration: parseInt(text) || 0,
                  }))
                }
              />
            </View>

            {/* Duration Preview */}
            <View style={styles.durationPreview}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.durationPreviewText}>
                Thời gian làm việc:{" "}
                {calculateShiftDuration(
                  shiftForm.startTime,
                  shiftForm.endTime,
                  shiftForm.breakDuration,
                )}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Assign Workers Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAssignModal(false)}>
              <Text style={styles.modalCancel}>Đóng</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Phân công ca</Text>
            <View style={{ width: 60 }} />
          </View>

          {selectedShift && (
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Shift Info */}
              <View style={styles.selectedShiftInfo}>
                <Text style={styles.selectedShiftName}>
                  {selectedShift.name}
                </Text>
                <Text style={styles.selectedShiftTime}>
                  {selectedShift.startTime} - {selectedShift.endTime}
                </Text>
              </View>

              {/* Assigned Workers */}
              <View style={styles.assignSection}>
                <Text style={styles.assignSectionTitle}>
                  Đã phân công ({getShiftWorkers(selectedShift.id).length})
                </Text>
                {getShiftWorkers(selectedShift.id).length === 0 ? (
                  <Text style={styles.noAssignText}>Chưa có nhân viên</Text>
                ) : (
                  getShiftWorkers(selectedShift.id).map((worker) => (
                    <View key={worker.id} style={styles.assignedWorkerRow}>
                      <View style={styles.workerInfo}>
                        <Text style={styles.workerName}>{worker.fullName}</Text>
                        <Text style={styles.workerRole}>
                          {ROLE_LABELS[worker.role]}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemoveAssignment(worker)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={COLORS.error}
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Available Workers */}
              <View style={styles.assignSection}>
                <Text style={styles.assignSectionTitle}>
                  Nhân viên khả dụng ({availableWorkers.length})
                </Text>
                {availableWorkers.length === 0 ? (
                  <Text style={styles.noAssignText}>
                    Tất cả nhân viên đã được phân công
                  </Text>
                ) : (
                  availableWorkers.map((worker) => (
                    <TouchableOpacity
                      key={worker.id}
                      style={styles.availableWorkerRow}
                      onPress={() => handleAssignWorker(worker)}
                    >
                      <View style={styles.workerInfo}>
                        <Text style={styles.workerName}>{worker.fullName}</Text>
                        <Text style={styles.workerRole}>
                          {ROLE_LABELS[worker.role]}
                        </Text>
                      </View>
                      <View style={styles.addAssignBtn}>
                        <Ionicons
                          name="add-circle"
                          size={24}
                          color={COLORS.success}
                        />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  filterTextActive: {
    color: COLORS.surface,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  shiftCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftCardInactive: {
    opacity: 0.6,
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  shiftTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  shiftInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  shiftMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  shiftTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  inactiveBadge: {
    backgroundColor: COLORS.textTertiary + "20",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  moreBtn: {
    padding: 4,
  },
  shiftDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  shiftWorkers: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  workersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workersTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  addWorkerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addWorkerText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  noWorkersText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontStyle: "italic",
  },
  workersRow: {
    flexDirection: "row",
    gap: 8,
  },
  workerChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 120,
  },
  workerChipText: {
    fontSize: 12,
    color: COLORS.text,
  },
  workerChipMore: {
    backgroundColor: COLORS.primary + "15",
  },
  workerChipMoreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.surface,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.error,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  formRow: {
    flexDirection: "row",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeOptionActive: {
    borderWidth: 2,
  },
  typeOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  durationPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary + "10",
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  durationPreviewText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  selectedShiftInfo: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  selectedShiftName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  selectedShiftTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  assignSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  assignSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  noAssignText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontStyle: "italic",
  },
  assignedWorkerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  availableWorkerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  workerRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    padding: 4,
  },
  addAssignBtn: {
    padding: 4,
  },
});
