/**
 * StaffForm — Reusable form for creating / editing staff members
 */

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    TouchableOpacity,
    View,
} from "react-native";

export interface StaffFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: CompanyRole;
  job_title: string;
  department_id: number | null;
  team_id: number | null;
  manager_id: number | null;
  status: StaffStatus;
  skills: string;
  password: string;
  confirm_password: string;
}

export const EMPTY_FORM: StaffFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: CompanyRole.STAFF,
  job_title: "",
  department_id: null,
  team_id: null,
  manager_id: null,
  status: StaffStatus.ACTIVE,
  skills: "",
  password: "",
  confirm_password: "",
};

interface StaffFormProps {
  values: StaffFormValues;
  onChange: (next: StaffFormValues) => void;
  departments: Department[];
  teams: Team[];
  errors: Record<string, string>;
  isEdit?: boolean;
  submitting?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function StaffForm({
  values,
  onChange,
  departments,
  teams,
  errors,
  isEdit = false,
  submitting = false,
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [rolePicker, setRolePicker] = useState(false);
  const [statusPicker, setStatusPicker] = useState(false);
  const [deptPicker, setDeptPicker] = useState(false);
  const [teamPicker, setTeamPicker] = useState(false);

  const set = (key: keyof StaffFormValues, val: any) =>
    onChange({ ...values, [key]: val });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Section — Personal Info */}
      <SectionLabel label="Thông tin cá nhân" colors={colors} />

      <Input
        label="Họ *"
        value={values.last_name}
        onChangeText={(t) => set("last_name", t)}
        placeholder="Nguyễn"
        error={errors.last_name}
        autoCapitalize="words"
      />
      <Input
        label="Tên *"
        value={values.first_name}
        onChangeText={(t) => set("first_name", t)}
        placeholder="Văn A"
        error={errors.first_name}
        autoCapitalize="words"
      />
      <Input
        label="Email *"
        value={values.email}
        onChangeText={(t) => set("email", t)}
        placeholder="email@congty.vn"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Input
        label="Số điện thoại"
        value={values.phone}
        onChangeText={(t) => set("phone", t)}
        placeholder="0901234567"
        keyboardType="phone-pad"
      />

      {/* Section — Position */}
      <SectionLabel label="Vị trí & Vai trò" colors={colors} />

      <Input
        label="Chức danh"
        value={values.job_title}
        onChangeText={(t) => set("job_title", t)}
        placeholder="Kỹ sư xây dựng"
      />
      <Input
        label="Kỹ năng (ngăn cách bởi dấu phẩy)"
        value={values.skills}
        onChangeText={(t) => set("skills", t)}
        placeholder="AutoCAD, Revit, Quản lý..."
      />

      {/* Role picker */}
      <PickerButton
        label="Vai trò *"
        value={COMPANY_ROLE_LABELS[values.role]}
        error={errors.role}
        colors={colors}
        onPress={() => setRolePicker(true)}
      />

      {/* Status picker */}
      <PickerButton
        label="Trạng thái"
        value={STAFF_STATUS_LABELS[values.status]}
        colors={colors}
        onPress={() => setStatusPicker(true)}
      />

      {/* Department picker */}
      <PickerButton
        label="Phòng ban"
        value={
          values.department_id
            ? (departments.find((d) => d.id === values.department_id)?.name ??
              "—")
            : "Chưa chọn"
        }
        colors={colors}
        onPress={() => setDeptPicker(true)}
      />

      {/* Team picker */}
      <PickerButton
        label="Team"
        value={
          values.team_id
            ? (teams.find((t) => t.id === values.team_id)?.name ?? "—")
            : "Chưa chọn"
        }
        colors={colors}
        onPress={() => setTeamPicker(true)}
      />

      {/* Section — Account */}
      {!isEdit && (
        <>
          <SectionLabel label="Tài khoản" colors={colors} />
          <Input
            label="Mật khẩu *"
            value={values.password}
            onChangeText={(t) => set("password", t)}
            placeholder="Tối thiểu 6 ký tự"
            error={errors.password}
            secureTextEntry
          />
          <Input
            label="Xác nhận mật khẩu *"
            value={values.confirm_password}
            onChangeText={(t) => set("confirm_password", t)}
            placeholder="Nhập lại mật khẩu"
            error={errors.confirm_password}
            secureTextEntry
          />
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant="ghost"
          title="Hủy"
          onPress={onCancel}
          style={styles.cancelBtn}
        />
        <Button
          title={isEdit ? "Cập nhật" : "Tạo nhân sự"}
          loading={submitting}
          onPress={onSubmit}
          style={styles.submitBtn}
        />
      </View>

      {/* Modals */}
      <ListPickerModal
        visible={rolePicker}
        title="Chọn vai trò"
        options={INTERNAL_ROLES.map((r) => ({
          label: COMPANY_ROLE_LABELS[r],
          value: r,
        }))}
        selected={values.role}
        onSelect={(v) => {
          set("role", v);
          setRolePicker(false);
        }}
        onClose={() => setRolePicker(false)}
        colors={colors}
      />
      <ListPickerModal
        visible={statusPicker}
        title="Chọn trạng thái"
        options={Object.values(StaffStatus).map((s) => ({
          label: STAFF_STATUS_LABELS[s],
          value: s,
        }))}
        selected={values.status}
        onSelect={(v) => {
          set("status", v);
          setStatusPicker(false);
        }}
        onClose={() => setStatusPicker(false)}
        colors={colors}
      />
      <ListPickerModal
        visible={deptPicker}
        title="Chọn phòng ban"
        options={[
          { label: "Không chọn", value: null },
          ...departments.map((d) => ({ label: d.name, value: d.id })),
        ]}
        selected={values.department_id}
        onSelect={(v) => {
          set("department_id", v);
          setDeptPicker(false);
        }}
        onClose={() => setDeptPicker(false)}
        colors={colors}
      />
      <ListPickerModal
        visible={teamPicker}
        title="Chọn team"
        options={[
          { label: "Không chọn", value: null },
          ...teams.map((t) => ({ label: t.name, value: t.id })),
        ]}
        selected={values.team_id}
        onSelect={(v) => {
          set("team_id", v);
          setTeamPicker(false);
        }}
        onClose={() => setTeamPicker(false)}
        colors={colors}
      />
    </ScrollView>
  );
}

// ---- Sub-components ----

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <ThemedText
      type="subtitle"
      style={[styles.sectionLabel, { color: colors.text }]}
    >
      {label}
    </ThemedText>
  );
}

function PickerButton({
  label,
  value,
  error,
  colors,
  onPress,
}: {
  label: string;
  value: string;
  error?: string;
  colors: any;
  onPress: () => void;
}) {
  return (
    <View style={styles.pickerField}>
      <ThemedText type="defaultSemiBold" style={styles.pickerLabel}>
        {label}
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.pickerBtn,
          {
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.surfaceMuted,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.pickerValue, { color: colors.text }]}>
          {value}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

function ListPickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: { label: string; value: any }[];
  selected: any;
  onSelect: (v: any) => void;
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
        <ScrollView style={styles.optionList} bounces={false}>
          {options.map((opt, idx) => {
            const isActive =
              opt.value === selected ||
              (opt.value === null && selected === null);
            return (
              <TouchableOpacity
                key={String(opt.value ?? idx)}
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
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },
  pickerField: {
    marginBottom: 10,
  },
  pickerLabel: {
    marginBottom: 3,
    fontWeight: "500",
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerValue: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 3,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
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
    maxHeight: "55%",
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
