/**
 * Add Expense Form Modal
 * Form for adding new expenses to project budgets
 */

import { Button } from "@/components/ui/button";
import { BudgetCategory } from "@/components/ui/cost-tracker";
import { SpacingSemantic } from "@/constants/spacing";
import { TextVariants } from "@/constants/typography";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export interface ExpenseFormData {
  category: string;
  description: string;
  amount: number;
  date: string;
  type: "expense" | "income";
  status: "pending" | "approved" | "paid";
}

interface AddExpenseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  categories: BudgetCategory[];
  projectId?: string;
}

export default function AddExpenseForm({
  visible,
  onClose,
  onSubmit,
  categories,
}: AddExpenseFormProps) {
  const background = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");
  const primary = useThemeColor({}, "primary");
  const chipBackground = useThemeColor({}, "chipBackground");

  const [formData, setFormData] = useState<ExpenseFormData>({
    category: categories[0]?.id || "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    status: "pending",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ExpenseFormData, string>>
  >({});
  const [amountText, setAmountText] = useState("");

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9]/g, "");
    setAmountText(cleaned);

    const numValue = parseInt(cleaned) || 0;
    setFormData((prev) => ({ ...prev, amount: numValue }));

    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const formatAmount = (value: string) => {
    if (!value) return "";
    return parseInt(value).toLocaleString("vi-VN");
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};

    if (!formData.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
    }
    if (!formData.date) {
      newErrors.date = "Vui lòng chọn ngày";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      category: categories[0]?.id || "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      status: "pending",
    });
    setAmountText("");
    setErrors({});
    onClose();
  };

  const selectedCategory = categories.find((c) => c.id === formData.category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: border }]}>
            <Text style={[TextVariants.h3, { color: text }]}>
              {formData.type === "expense" ? "Thêm chi phí" : "Thêm thu nhập"}
            </Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Type Toggle */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>
                Loại giao dịch
              </Text>
              <View style={styles.typeToggle}>
                <Pressable
                  style={[
                    styles.typeButton,
                    { borderColor: border, backgroundColor: chipBackground },
                    formData.type === "expense" && {
                      backgroundColor: primary,
                      borderColor: primary,
                    },
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, type: "expense" }))
                  }
                >
                  <Ionicons
                    name="arrow-down-circle-outline"
                    size={20}
                    color={formData.type === "expense" ? "#fff" : textMuted}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: formData.type === "expense" ? "#fff" : text },
                    ]}
                  >
                    Chi phí
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.typeButton,
                    { borderColor: border, backgroundColor: chipBackground },
                    formData.type === "income" && {
                      backgroundColor: "#0D9488",
                      borderColor: "#0D9488",
                    },
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, type: "income" }))
                  }
                >
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={20}
                    color={formData.type === "income" ? "#fff" : textMuted}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: formData.type === "income" ? "#fff" : text },
                    ]}
                  >
                    Thu nhập
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>
                Danh mục <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      { borderColor: border, backgroundColor: chipBackground },
                      formData.category === category.id && {
                        backgroundColor: category.color + "20",
                        borderColor: category.color,
                      },
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({
                        ...prev,
                        category: category.id,
                      }));
                      if (errors.category) {
                        setErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                  >
                    {category.icon && (
                      <Ionicons
                        name={category.icon}
                        size={16}
                        color={
                          formData.category === category.id
                            ? category.color
                            : textMuted
                        }
                      />
                    )}
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color:
                            formData.category === category.id
                              ? category.color
                              : text,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            {/* Amount Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>
                Số tiền (VND) <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { borderColor: errors.amount ? "#000000" : border },
                ]}
              >
                <Ionicons name="cash-outline" size={20} color={textMuted} />
                <TextInput
                  style={[styles.input, { color: text }]}
                  value={amountText ? formatAmount(amountText) : ""}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor={textMuted}
                  keyboardType="number-pad"
                />
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
              {selectedCategory && formData.amount > 0 && (
                <Text style={[styles.hint, { color: textMuted }]}>
                  Đã chi: ₫{selectedCategory.spent.toLocaleString("vi-VN")} / ₫
                  {selectedCategory.budgeted.toLocaleString("vi-VN")}
                </Text>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>
                Mô tả <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { borderColor: errors.description ? "#000000" : border },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={textMuted}
                />
                <TextInput
                  style={[styles.input, { color: text }]}
                  value={formData.description}
                  onChangeText={(value) => {
                    setFormData((prev) => ({ ...prev, description: value }));
                    if (errors.description) {
                      setErrors((prev) => ({
                        ...prev,
                        description: undefined,
                      }));
                    }
                  }}
                  placeholder="VD: Xi măng Holcim 100 bao"
                  placeholderTextColor={textMuted}
                  multiline
                  numberOfLines={2}
                />
              </View>
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {/* Date Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>
                Ngày <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { borderColor: errors.date ? "#000000" : border },
                ]}
              >
                <Ionicons name="calendar-outline" size={20} color={textMuted} />
                <TextInput
                  style={[styles.input, { color: text }]}
                  value={formData.date}
                  onChangeText={(value) => {
                    setFormData((prev) => ({ ...prev, date: value }));
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: undefined }));
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={textMuted}
                />
              </View>
              {errors.date && (
                <Text style={styles.errorText}>{errors.date}</Text>
              )}
              <Text style={[styles.hint, { color: textMuted }]}>
                Định dạng: YYYY-MM-DD
              </Text>
            </View>

            {/* Status Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>Trạng thái</Text>
              <View style={styles.statusGrid}>
                {(["pending", "approved", "paid"] as const).map((status) => (
                  <Pressable
                    key={status}
                    style={[
                      styles.statusChip,
                      { borderColor: border, backgroundColor: chipBackground },
                      formData.status === status && {
                        backgroundColor: primary + "20",
                        borderColor: primary,
                      },
                    ]}
                    onPress={() => setFormData((prev) => ({ ...prev, status }))}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        { color: formData.status === status ? primary : text },
                      ]}
                    >
                      {status === "pending"
                        ? "Chờ duyệt"
                        : status === "approved"
                          ? "Đã duyệt"
                          : status === "paid"
                            ? "Đã thanh toán"
                            : ""}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: border }]}>
            <Button
              title="Hủy"
              variant="secondary"
              onPress={handleClose}
              style={{ flex: 1 }}
            />
            <Button title="Thêm" onPress={handleSubmit} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SpacingSemantic.lg,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: SpacingSemantic.lg,
  },
  field: {
    marginBottom: SpacingSemantic.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: SpacingSemantic.sm,
  },
  required: {
    color: "#000000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SpacingSemantic.md,
    paddingVertical: SpacingSemantic.sm,
    gap: SpacingSemantic.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  errorText: {
    color: "#000000",
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  typeToggle: {
    flexDirection: "row",
    gap: SpacingSemantic.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SpacingSemantic.sm,
    paddingVertical: SpacingSemantic.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SpacingSemantic.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statusGrid: {
    flexDirection: "row",
    gap: SpacingSemantic.sm,
  },
  statusChip: {
    flex: 1,
    paddingVertical: SpacingSemantic.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: SpacingSemantic.md,
    padding: SpacingSemantic.lg,
    borderTopWidth: 1,
  },
});
