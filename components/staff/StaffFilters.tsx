/**
 * StaffFilters — Filter bar for staff list (role, department, team, status)
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Department, Team } from "@/types/staff";
import {
    COMPANY_ROLE_LABELS,
    CompanyRole,
    INTERNAL_ROLES,
    STAFF_STATUS_LABELS,
    StaffStatus,
} from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export interface StaffFilterValues {
  search: string;
  role?: CompanyRole;
  department_id?: number;
  team_id?: number;
  status?: StaffStatus;
}

interface StaffFiltersProps {
  values: StaffFilterValues;
  onChange: (next: StaffFilterValues) => void;
  departments: Department[];
  teams: Team[];
}

type FilterKey = "role" | "department" | "team" | "status";

export default function StaffFilters({
  values,
  onChange,
  departments,
  teams,
}: StaffFiltersProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [pickerOpen, setPickerOpen] = useState<FilterKey | null>(null);

  const activeCount =
    (values.role ? 1 : 0) +
    (values.department_id ? 1 : 0) +
    (values.team_id ? 1 : 0) +
    (values.status ? 1 : 0);

  const clearFilters = () => {
    onChange({ search: values.search });
  };

  // Options builders
  const roleOptions: { label: string; value: CompanyRole }[] =
    INTERNAL_ROLES.map((r) => ({ label: COMPANY_ROLE_LABELS[r], value: r }));

  const deptOptions = departments.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const teamOptions = teams.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  const statusOptions = Object.values(StaffStatus).map((s) => ({
    label: STAFF_STATUS_LABELS[s],
    value: s,
  }));

  return (
    <View>
      {/* Search */}
      <View
        style={[
          styles.searchRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm theo tên, email, mã NV..."
          placeholderTextColor={colors.textMuted}
          value={values.search}
          onChangeText={(text) => onChange({ ...values, search: text })}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {values.search ? (
          <TouchableOpacity
            onPress={() => onChange({ ...values, search: "" })}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip
          label={values.role ? COMPANY_ROLE_LABELS[values.role] : "Vai trò"}
          active={!!values.role}
          colors={colors}
          onPress={() => setPickerOpen("role")}
        />
        <Chip
          label={
            values.department_id
              ? (departments.find((d) => d.id === values.department_id)?.name ??
                "Phòng ban")
              : "Phòng ban"
          }
          active={!!values.department_id}
          colors={colors}
          onPress={() => setPickerOpen("department")}
        />
        <Chip
          label={
            values.team_id
              ? (teams.find((t) => t.id === values.team_id)?.name ?? "Team")
              : "Team"
          }
          active={!!values.team_id}
          colors={colors}
          onPress={() => setPickerOpen("team")}
        />
        <Chip
          label={
            values.status ? STAFF_STATUS_LABELS[values.status] : "Trạng thái"
          }
          active={!!values.status}
          colors={colors}
          onPress={() => setPickerOpen("status")}
        />
        {activeCount > 0 && (
          <TouchableOpacity
            style={[styles.clearBtn]}
            onPress={clearFilters}
            hitSlop={8}
          >
            <Ionicons name="close" size={16} color={colors.error} />
            <Text style={[styles.clearText, { color: colors.error }]}>
              Xóa lọc
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Picker modals */}
      <PickerModal
        visible={pickerOpen === "role"}
        title="Chọn vai trò"
        options={roleOptions}
        selected={values.role}
        onSelect={(v) => {
          onChange({ ...values, role: v as CompanyRole | undefined });
          setPickerOpen(null);
        }}
        onClear={() => {
          onChange({ ...values, role: undefined });
          setPickerOpen(null);
        }}
        onClose={() => setPickerOpen(null)}
        colors={colors}
      />
      <PickerModal
        visible={pickerOpen === "department"}
        title="Chọn phòng ban"
        options={deptOptions}
        selected={values.department_id}
        onSelect={(v) => {
          onChange({ ...values, department_id: v as number | undefined });
          setPickerOpen(null);
        }}
        onClear={() => {
          onChange({ ...values, department_id: undefined });
          setPickerOpen(null);
        }}
        onClose={() => setPickerOpen(null)}
        colors={colors}
      />
      <PickerModal
        visible={pickerOpen === "team"}
        title="Chọn team"
        options={teamOptions}
        selected={values.team_id}
        onSelect={(v) => {
          onChange({ ...values, team_id: v as number | undefined });
          setPickerOpen(null);
        }}
        onClear={() => {
          onChange({ ...values, team_id: undefined });
          setPickerOpen(null);
        }}
        onClose={() => setPickerOpen(null)}
        colors={colors}
      />
      <PickerModal
        visible={pickerOpen === "status"}
        title="Chọn trạng thái"
        options={statusOptions}
        selected={values.status}
        onSelect={(v) => {
          onChange({ ...values, status: v as StaffStatus | undefined });
          setPickerOpen(null);
        }}
        onClear={() => {
          onChange({ ...values, status: undefined });
          setPickerOpen(null);
        }}
        onClose={() => setPickerOpen(null)}
        colors={colors}
      />
    </View>
  );
}

// ---- Chip ----

function Chip({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.chipText, { color: active ? "#fff" : colors.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={14}
        color={active ? "#fff" : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

// ---- PickerModal ----

function PickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClear,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: { label: string; value: any }[];
  selected: any;
  onSelect: (v: any) => void;
  onClear: () => void;
  onClose: () => void;
  colors: any;
}) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {selected !== undefined && (
          <TouchableOpacity style={styles.clearRow} onPress={onClear}>
            <Text style={[styles.clearRowText, { color: colors.error }]}>
              Bỏ chọn
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView style={styles.optionList} bounces={false}>
          {options.map((opt) => {
            const isActive = opt.value === selected;
            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.optionItem,
                  isActive && { backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => onSelect(opt.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isActive ? colors.primary : colors.text },
                    isActive && { fontWeight: "700" },
                  ]}
                >
                  {opt.label}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  chips: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 34,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  clearRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  clearRowText: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionList: {
    paddingHorizontal: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 15,
  },
});
