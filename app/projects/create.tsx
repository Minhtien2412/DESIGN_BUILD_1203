/**
 * Create Project — Tạo dự án mới
 * Route: /projects/create
 * Migrated to DSFormScreen layout
 */

import { DSFormScreen } from "@/components/ds/layouts";
import { useAuth } from "@/context/AuthContext";
import { useDS } from "@/hooks/useDS";
import { createProject, CreateProjectDto } from "@/services/api/projectsApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

// ── Types ──────────────────────────────────────────────────────────────
interface FormData {
  title: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
  location: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

interface FormErrors {
  title?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  clientName?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────
function SectionTitle({ icon, label }: { icon: string; label: string }) {
  const { colors } = useDS();
  return (
    <View style={st.sectionTitleRow}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <Text style={[st.sectionTitle, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function Field({
  label,
  required,
  error,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  const { colors } = useDS();
  return (
    <View style={st.field}>
      <Text style={[st.label, { color: colors.textSecondary }]}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      {children}
      {error && (
        <Text style={[st.errorText, { color: colors.error }]}>{error}</Text>
      )}
      {helper && !error && (
        <Text style={[st.helperText, { color: colors.textTertiary }]}>
          {helper}
        </Text>
      )}
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────
export default function CreateProjectScreen() {
  const { user } = useAuth();
  const { colors, radius, shadow } = useDS();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    location: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.title.trim()) e.title = "Tên dự án không được để trống";
    else if (formData.title.length < 3)
      e.title = "Tên dự án phải có ít nhất 3 ký tự";
    if (formData.budget && isNaN(Number(formData.budget)))
      e.budget = "Ngân sách phải là số";
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate))
        e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (formData.clientName && formData.clientName.length < 2)
      e.clientName = "Tên khách hàng ít nhất 2 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin");
      return;
    }
    setLoading(true);
    try {
      const dto: CreateProjectDto = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };
      const newProject = await createProject(dto);
      Alert.alert("Thành công", "Dự án đã được tạo thành công!", [
        {
          text: "Xem dự án",
          onPress: () => router.replace(`/projects/${newProject.id}` as any),
        },
        {
          text: "Tạo dự án khác",
          onPress: () =>
            setFormData({
              title: "",
              description: "",
              budget: "",
              startDate: "",
              endDate: "",
              location: "",
              clientName: "",
              clientPhone: "",
              clientEmail: "",
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.message || "Không thể tạo dự án. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    st.input,
    {
      borderColor: colors.border,
      backgroundColor: colors.bgMuted,
      borderRadius: radius.md,
      color: colors.text,
    },
  ];
  const inputErrorStyle = [
    st.input,
    {
      borderColor: colors.error,
      backgroundColor: colors.bgMuted,
      borderRadius: radius.md,
      color: colors.text,
    },
  ];

  return (
    <DSFormScreen
      title="Tạo Dự Án Mới"
      submitLabel="Tạo dự án"
      onSubmit={handleSubmit}
      submitLoading={loading}
    >
      {/* Project Info */}
      <View
        style={[
          st.section,
          shadow.sm,
          { backgroundColor: colors.bgSurface, borderRadius: radius.lg },
        ]}
      >
        <SectionTitle icon="information-circle" label="Thông tin dự án" />

        <Field label="Tên dự án" required error={errors.title}>
          <TextInput
            style={errors.title ? inputErrorStyle : inputStyle}
            placeholder="VD: Xây dựng biệt thự 3 tầng"
            placeholderTextColor={colors.textTertiary}
            value={formData.title}
            onChangeText={(v) => updateField("title", v)}
            editable={!loading}
          />
        </Field>

        <Field label="Mô tả dự án">
          <TextInput
            style={[...inputStyle, st.textArea]}
            placeholder="Mô tả chi tiết về dự án..."
            placeholderTextColor={colors.textTertiary}
            value={formData.description}
            onChangeText={(v) => updateField("description", v)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </Field>

        <Field label="Địa điểm">
          <TextInput
            style={inputStyle}
            placeholder="VD: Quận 9, TP.HCM"
            placeholderTextColor={colors.textTertiary}
            value={formData.location}
            onChangeText={(v) => updateField("location", v)}
            editable={!loading}
          />
        </Field>

        <Field
          label="Ngân sách (VNĐ)"
          error={errors.budget}
          helper={
            formData.budget && !errors.budget
              ? `~ ${Number(formData.budget).toLocaleString("vi-VN")} đ`
              : undefined
          }
        >
          <TextInput
            style={errors.budget ? inputErrorStyle : inputStyle}
            placeholder="VD: 500000000"
            placeholderTextColor={colors.textTertiary}
            value={formData.budget}
            onChangeText={(v) => updateField("budget", v)}
            keyboardType="numeric"
            editable={!loading}
          />
        </Field>
      </View>

      {/* Timeline */}
      <View
        style={[
          st.section,
          shadow.sm,
          { backgroundColor: colors.bgSurface, borderRadius: radius.lg },
        ]}
      >
        <SectionTitle icon="calendar" label="Thời gian thực hiện" />
        <View style={st.row}>
          <View style={st.half}>
            <Field label="Ngày bắt đầu" error={errors.startDate}>
              <TextInput
                style={errors.startDate ? inputErrorStyle : inputStyle}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                value={formData.startDate}
                onChangeText={(v) => updateField("startDate", v)}
                editable={!loading}
              />
            </Field>
          </View>
          <View style={st.half}>
            <Field label="Ngày kết thúc" error={errors.endDate}>
              <TextInput
                style={errors.endDate ? inputErrorStyle : inputStyle}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                value={formData.endDate}
                onChangeText={(v) => updateField("endDate", v)}
                editable={!loading}
              />
            </Field>
          </View>
        </View>
      </View>

      {/* Client Info */}
      <View
        style={[
          st.section,
          shadow.sm,
          { backgroundColor: colors.bgSurface, borderRadius: radius.lg },
        ]}
      >
        <SectionTitle icon="person" label="Thông tin khách hàng" />

        <Field label="Tên khách hàng" error={errors.clientName}>
          <TextInput
            style={errors.clientName ? inputErrorStyle : inputStyle}
            placeholder="VD: Nguyễn Văn A"
            placeholderTextColor={colors.textTertiary}
            value={formData.clientName}
            onChangeText={(v) => updateField("clientName", v)}
            editable={!loading}
          />
        </Field>

        <Field label="Số điện thoại">
          <TextInput
            style={inputStyle}
            placeholder="VD: 0901234567"
            placeholderTextColor={colors.textTertiary}
            value={formData.clientPhone}
            onChangeText={(v) => updateField("clientPhone", v)}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </Field>

        <Field label="Email">
          <TextInput
            style={inputStyle}
            placeholder="VD: client@example.com"
            placeholderTextColor={colors.textTertiary}
            value={formData.clientEmail}
            onChangeText={(v) => updateField("clientEmail", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </Field>
      </View>

      {/* Info Box */}
      <View
        style={[
          st.infoBox,
          { backgroundColor: colors.primaryLight, borderRadius: radius.md },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.primary}
        />
        <Text style={[st.infoText, { color: colors.primary }]}>
          Các thông tin đánh dấu (*) là bắt buộc. Bạn có thể cập nhật sau khi
          tạo dự án.
        </Text>
      </View>
    </DSFormScreen>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  section: { padding: 16, marginBottom: 16 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  input: { borderWidth: 1, padding: 12, fontSize: 15 },
  textArea: { height: 100, paddingTop: 12 },
  errorText: { fontSize: 12, marginTop: 4 },
  helperText: { fontSize: 12, marginTop: 4 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  infoBox: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
