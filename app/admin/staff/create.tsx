/**
 * Staff Create Screen — Tạo nhân sự mới
 * Uses StaffForm component + new permission system
 */

import StaffForm, {
    EMPTY_FORM,
    type StaffFormValues,
} from "@/components/staff/StaffForm";
import { canCreateStaff } from "@/constants/staffPermissions";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { createStaff } from "@/services/staffService";
import { CompanyRole, type StaffFormData } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function StaffCreateScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  const userRole = useMemo<CompanyRole>(() => {
    const r = user?.role as CompanyRole | undefined;
    if (r && Object.values(CompanyRole).includes(r)) return r;
    if (user?.admin) return CompanyRole.ADMIN;
    return CompanyRole.STAFF;
  }, [user]);

  const canCreate = canCreateStaff(userRole) || !!user?.admin;

  const { departments } = useDepartments(true);
  const { teams } = useTeams(undefined, true);

  const [values, setValues] = useState<StaffFormValues>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!values.first_name.trim()) e.first_name = "Vui lòng nhập tên";
    if (!values.last_name.trim()) e.last_name = "Vui lòng nhập họ";
    if (!values.email.trim()) {
      e.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      e.email = "Email không hợp lệ";
    }
    if (!values.password) {
      e.password = "Vui lòng nhập mật khẩu";
    } else if (values.password.length < 6) {
      e.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (values.password !== values.confirm_password) {
      e.confirm_password = "Mật khẩu không khớp";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [values]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
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
      await createStaff(payload);
      Alert.alert("Thành công", "Nhân sự đã được tạo", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không thể tạo nhân sự");
    } finally {
      setSubmitting(false);
    }
  }, [values, validate]);

  // Guard
  if (!canCreate) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Tạo nhân sự" }} />
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={[styles.guardText, { color: colors.text }]}>
          Không có quyền tạo nhân sự
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tạo nhân sự mới",
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
        isEdit={false}
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
});
