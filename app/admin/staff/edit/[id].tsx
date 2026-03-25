/**
 * Staff Edit Screen — Chỉnh sửa nhân sự
 * Uses StaffForm component + new permission system
 */

import StaffForm, { type StaffFormValues } from "@/components/staff/StaffForm";
import { canEditStaff } from "@/constants/staffPermissions";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDepartments } from "@/hooks/useDepartments";
import { useStaffDetail } from "@/hooks/useStaffDetail";
import { useTeams } from "@/hooks/useTeams";
import { updateStaff } from "@/services/staffService";
import { CompanyRole, type StaffFormData } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StaffEditScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const staffId = id ? parseInt(id, 10) : null;

  const userRole = useMemo<CompanyRole>(() => {
    const r = user?.role as CompanyRole | undefined;
    if (r && Object.values(CompanyRole).includes(r)) return r;
    if (user?.admin) return CompanyRole.ADMIN;
    return CompanyRole.STAFF;
  }, [user]);

  const canEdit = canEditStaff(userRole) || !!user?.admin;

  const { staff, loading, error } = useStaffDetail(staffId);
  const { departments } = useDepartments(true);
  const { teams } = useTeams(undefined, true);

  const [values, setValues] = useState<StaffFormValues | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form once staff loads
  useEffect(() => {
    if (staff && !values) {
      setValues({
        first_name: staff.first_name ?? "",
        last_name: staff.last_name ?? "",
        email: staff.email ?? "",
        phone: staff.phone ?? "",
        role: staff.role,
        job_title: staff.job_title ?? "",
        department_id: staff.department_id ?? null,
        team_id: staff.team_id ?? null,
        manager_id: staff.manager_id ?? null,
        status: staff.status,
        skills: staff.skills?.join(", ") ?? "",
        password: "",
        confirm_password: "",
      });
    }
  }, [staff, values]);

  const validate = useCallback((): boolean => {
    if (!values) return false;
    const e: Record<string, string> = {};
    if (!values.first_name.trim()) e.first_name = "Vui lòng nhập tên";
    if (!values.last_name.trim()) e.last_name = "Vui lòng nhập họ";
    if (!values.email.trim()) {
      e.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      e.email = "Email không hợp lệ";
    }
    // Password optional on edit — only validate if provided
    if (values.password && values.password.length < 6) {
      e.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (values.password && values.password !== values.confirm_password) {
      e.confirm_password = "Mật khẩu không khớp";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [values]);

  const handleSubmit = useCallback(async () => {
    if (!values || !staffId || !validate()) return;
    setSubmitting(true);
    try {
      const payload: StaffFormData = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim() || undefined,
        role: values.role,
        job_title: values.job_title.trim() || undefined,
        department_id: values.department_id,
        team_id: values.team_id,
        manager_id: values.manager_id,
        status: values.status,
        skills: values.skills
          ? values.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      };
      await updateStaff(staffId, payload);
      Alert.alert("Thành công", "Thông tin nhân sự đã được cập nhật", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không thể cập nhật nhân sự");
    } finally {
      setSubmitting(false);
    }
  }, [values, staffId, validate]);

  // Guard
  if (!canEdit) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Chỉnh sửa nhân sự" }} />
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={[styles.guardText, { color: colors.text }]}>
          Không có quyền chỉnh sửa
        </Text>
      </View>
    );
  }

  // Loading
  if (loading || !values) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: "Chỉnh sửa nhân sự",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Đang tải...
        </Text>
      </View>
    );
  }

  // Error
  if (error || !staff) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: "Chỉnh sửa nhân sự",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Ionicons name="warning-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || "Không tìm thấy nhân sự"}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Sửa: ${staff.full_name}`,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <StaffForm
        values={values}
        onChange={setValues}
        departments={departments}
        teams={teams}
        errors={errors}
        isEdit
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  guardText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
