/**
 * Create Budget Screen
 * =====================
 * Modal form to create a new budget for a project.
 * Fields: name, category, amount, date range, description, notes.
 */
import { useBudgets } from "@/hooks/useBudget";
import { BudgetCategory, type CreateBudgetRequest } from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME = {
  primary: "#0D9488",
  bg: "#F8FAFB",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSec: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
};

const CATEGORY_OPTIONS: {
  value: BudgetCategory;
  label: string;
  icon: string;
}[] = [
  {
    value: BudgetCategory.LABOR,
    label: "Nhân công",
    icon: "people-outline",
  },
  {
    value: BudgetCategory.MATERIALS,
    label: "Vật liệu",
    icon: "cube-outline",
  },
  {
    value: BudgetCategory.EQUIPMENT,
    label: "Thiết bị",
    icon: "construct-outline",
  },
  {
    value: BudgetCategory.SUBCONTRACTOR,
    label: "Nhà thầu phụ",
    icon: "business-outline",
  },
  {
    value: BudgetCategory.PERMITS,
    label: "Giấy phép",
    icon: "document-text-outline",
  },
  {
    value: BudgetCategory.UTILITIES,
    label: "Tiện ích",
    icon: "flash-outline",
  },
  {
    value: BudgetCategory.INSURANCE,
    label: "Bảo hiểm",
    icon: "shield-checkmark-outline",
  },
  {
    value: BudgetCategory.OVERHEAD,
    label: "Chi phí quản lý",
    icon: "briefcase-outline",
  },
  {
    value: BudgetCategory.CONTINGENCY,
    label: "Dự phòng",
    icon: "alert-circle-outline",
  },
  {
    value: BudgetCategory.OTHER,
    label: "Khác",
    icon: "ellipsis-horizontal-circle-outline",
  },
];

export default function CreateBudgetScreen() {
  const insets = useSafeAreaInsets();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { createBudget } = useBudgets(projectId || "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BudgetCategory>(
    BudgetCategory.MATERIALS,
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const formatCurrency = (val: string) => {
    const num = val.replace(/[^0-9]/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("vi-VN");
  };

  const parseCurrency = (val: string) => {
    return Number(val.replace(/[^0-9]/g, "")) || 0;
  };

  const selectedCat = CATEGORY_OPTIONS.find((c) => c.value === category);

  const validate = useCallback((): string | null => {
    if (!name.trim()) return "Vui lòng nhập tên ngân sách";
    if (!amount || parseCurrency(amount) <= 0)
      return "Vui lòng nhập số tiền phân bổ";
    if (!startDate) return "Vui lòng nhập ngày bắt đầu";
    if (!endDate) return "Vui lòng nhập ngày kết thúc";
    if (new Date(endDate) <= new Date(startDate))
      return "Ngày kết thúc phải sau ngày bắt đầu";
    return null;
  }, [name, amount, startDate, endDate]);

  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) {
      Alert.alert("Thiếu thông tin", err);
      return;
    }

    setSubmitting(true);
    try {
      const request: CreateBudgetRequest = {
        projectId: projectId || "default",
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        allocatedAmount: parseCurrency(amount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes.trim() || undefined,
      };
      await createBudget(request);
      Alert.alert("Thành công", "Đã tạo ngân sách mới", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể tạo ngân sách",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    validate,
    projectId,
    name,
    description,
    category,
    amount,
    startDate,
    endDate,
    notes,
    createBudget,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Project ID info */}
        {projectId && (
          <View style={styles.projectBanner}>
            <Ionicons name="folder-outline" size={16} color={THEME.primary} />
            <Text style={styles.projectText}>Dự án: {projectId}</Text>
          </View>
        )}

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Tên ngân sách <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="VD: Ngân sách vật liệu Giai đoạn 1"
            placeholderTextColor={THEME.textSec}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Danh mục <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Ionicons
              name={(selectedCat?.icon || "grid-outline") as any}
              size={18}
              color={THEME.primary}
            />
            <Text style={styles.pickerText}>
              {selectedCat?.label || "Chọn danh mục"}
            </Text>
            <Ionicons
              name={showCategoryPicker ? "chevron-up" : "chevron-down"}
              size={16}
              color={THEME.textSec}
            />
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((cat) => {
                const active = cat.value === category;
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.catOption, active && styles.catOptionActive]}
                    onPress={() => {
                      setCategory(cat.value);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={active ? "#FFF" : THEME.text}
                    />
                    <Text
                      style={[
                        styles.catOptionText,
                        active && styles.catOptionTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Số tiền phân bổ <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={amount}
              onChangeText={(v) => setAmount(formatCurrency(v))}
              placeholder="0"
              placeholderTextColor={THEME.textSec}
              keyboardType="numeric"
            />
            <Text style={styles.currency}>VNĐ</Text>
          </View>
          {amount && parseCurrency(amount) > 0 && (
            <Text style={styles.amountPreview}>
              ≈ {(parseCurrency(amount) / 1_000_000).toFixed(1)} triệu VNĐ
            </Text>
          )}
        </View>

        {/* Date range */}
        <View style={styles.dateRow}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>
              Ngày bắt đầu <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={THEME.textSec}
            />
          </View>
          <View style={styles.dateArrow}>
            <Ionicons name="arrow-forward" size={18} color={THEME.textSec} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>
              Ngày kết thúc <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={THEME.textSec}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả chi tiết ngân sách..."
            placeholderTextColor={THEME.textSec}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú thêm..."
            placeholderTextColor={THEME.textSec}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Summary preview */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tóm tắt</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tên:</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {name || "—"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Danh mục:</Text>
            <Text style={styles.summaryValue}>{selectedCat?.label || "—"}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số tiền:</Text>
            <Text style={[styles.summaryValue, { color: THEME.primary }]}>
              {amount ? `${amount} VNĐ` : "—"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thời gian:</Text>
            <Text style={styles.summaryValue}>
              {startDate} → {endDate}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.submitText}>Tạo ngân sách</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    padding: 16,
  },

  // Project banner
  projectBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  projectText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: "500",
  },

  // Fields
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 6,
  },
  required: {
    color: THEME.error,
  },
  input: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.text,
  },
  textArea: {
    minHeight: 72,
    paddingTop: 12,
  },

  // Amount
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  currency: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textSec,
  },
  amountPreview: {
    fontSize: 12,
    color: THEME.primary,
    marginTop: 4,
  },

  // Picker
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  pickerText: {
    flex: 1,
    fontSize: 14,
    color: THEME.text,
  },

  // Category grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  catOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  catOptionActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  catOptionText: {
    fontSize: 13,
    color: THEME.text,
    fontWeight: "500",
  },
  catOptionTextActive: {
    color: "#FFF",
  },

  // Date
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 0,
  },
  dateArrow: {
    paddingBottom: 28,
    paddingHorizontal: 8,
  },

  // Summary
  summaryCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryLabel: {
    fontSize: 13,
    color: THEME.textSec,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
    maxWidth: "55%",
    textAlign: "right",
  },

  // Bottom bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textSec,
  },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
