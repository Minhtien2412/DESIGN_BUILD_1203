import { useHandoverRecords } from "@/hooks/useInventory";
import { MOCK_WAREHOUSES } from "@/mocks/inventory-advanced-mocks";
import type { CreateHandoverRequest } from "@/types/inventory";
import { MaterialUnit } from "@/types/inventory";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
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

type Condition = "NEW" | "GOOD" | "FAIR" | "DAMAGED";

interface HandoverItemInput {
  materialId: string;
  materialName: string;
  quantity: string;
  unit: MaterialUnit;
  condition: Condition;
  notes: string;
}

const MOCK_MATERIALS = [
  { id: "mat-001", name: "Xi măng Holcim PCB40", unit: MaterialUnit.KG },
  { id: "mat-002", name: "Thép Hòa Phát D16", unit: MaterialUnit.PIECE },
  { id: "mat-003", name: "Gạch lát Granite 60x60", unit: MaterialUnit.M2 },
  { id: "mat-004", name: "Sơn Dulux nội thất", unit: MaterialUnit.BAG },
  { id: "mat-005", name: "Ống PVC D110", unit: MaterialUnit.PIECE },
  { id: "mat-006", name: "Dây điện Cadivi 2.5mm", unit: MaterialUnit.M },
];

const MOCK_PEOPLE = [
  { id: "user-001", name: "Nguyễn Văn An", role: "Quản lý kho chính" },
  { id: "user-002", name: "Trần Minh Tuấn", role: "Chỉ huy công trình" },
  { id: "user-003", name: "Lê Thị Hương", role: "Quản lý kho tạm" },
  { id: "user-005", name: "Võ Hoàng Nam", role: "Đội trưởng thi công" },
  { id: "user-006", name: "Đặng Thanh Sơn", role: "Thợ điện trưởng" },
];

const CONDITION_OPTIONS: { key: Condition; label: string; color: string }[] = [
  { key: "NEW", label: "Mới", color: "#10B981" },
  { key: "GOOD", label: "Tốt", color: "#3B82F6" },
  { key: "FAIR", label: "Trung bình", color: "#F59E0B" },
  { key: "DAMAGED", label: "Hư hỏng", color: "#EF4444" },
];

export default function CreateHandoverScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { createHandover } = useHandoverRecords(projectId || "");
  const [toPersonId, setToPersonId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<HandoverItemInput[]>([
    {
      materialId: "",
      materialName: "",
      quantity: "",
      unit: MaterialUnit.KG,
      condition: "NEW",
      notes: "",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        materialId: "",
        materialName: "",
        quantity: "",
        unit: MaterialUnit.KG,
        condition: "NEW",
        notes: "",
      },
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof HandoverItemInput, value: string) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  const selectMaterial = useCallback((index: number, materialId: string) => {
    const mat = MOCK_MATERIALS.find((m) => m.id === materialId);
    if (!mat) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              materialId: mat.id,
              materialName: mat.name,
              unit: mat.unit,
            }
          : item,
      ),
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!toPersonId) {
      Alert.alert("Lỗi", "Vui lòng chọn người nhận bàn giao");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do bàn giao");
      return;
    }
    const validItems = items.filter(
      (i) => i.materialId && Number(i.quantity) > 0,
    );
    if (validItems.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất 1 vật tư");
      return;
    }

    setSubmitting(true);
    const request: CreateHandoverRequest = {
      toPersonId,
      warehouseId: warehouseId || undefined,
      items: validItems.map((i) => ({
        materialId: i.materialId,
        quantity: Number(i.quantity),
        condition: i.condition,
        notes: i.notes || undefined,
      })),
      reason: reason.trim(),
      handoverDate: new Date().toISOString(),
      witnessName: witnessName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await createHandover(request);
      Alert.alert("Thành công", "Biên bản bàn giao đã được tạo", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo biên bản bàn giao. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }, [toPersonId, warehouseId, reason, witnessName, notes, items]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* To Person */}
        <View style={styles.field}>
          <Text style={styles.label}>Người nhận bàn giao *</Text>
          {MOCK_PEOPLE.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.personOption,
                toPersonId === p.id && styles.personOptionActive,
              ]}
              onPress={() => setToPersonId(p.id)}
            >
              <View style={styles.personAvatar}>
                <Ionicons
                  name="person"
                  size={16}
                  color={toPersonId === p.id ? "#fff" : "#8B5CF6"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.personName,
                    toPersonId === p.id && { color: "#fff" },
                  ]}
                >
                  {p.name}
                </Text>
                <Text
                  style={[
                    styles.personRole,
                    toPersonId === p.id && { color: "#fff", opacity: 0.8 },
                  ]}
                >
                  {p.role}
                </Text>
              </View>
              {toPersonId === p.id && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Warehouse */}
        <View style={styles.field}>
          <Text style={styles.label}>Kho liên quan</Text>
          <View style={styles.warehouseOptions}>
            {MOCK_WAREHOUSES.map((wh) => (
              <TouchableOpacity
                key={wh.id}
                style={[
                  styles.whChip,
                  warehouseId === wh.id && styles.whChipActive,
                ]}
                onPress={() =>
                  setWarehouseId(warehouseId === wh.id ? "" : wh.id)
                }
              >
                <Text
                  style={[
                    styles.whChipText,
                    warehouseId === wh.id && styles.whChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {wh.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reason */}
        <View style={styles.field}>
          <Text style={styles.label}>Lý do bàn giao *</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Ví dụ: Bàn giao vật tư hoàn thiện tầng 1..."
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Items */}
        <View style={styles.field}>
          <View style={styles.itemsHeader}>
            <Text style={styles.label}>Danh sách vật tư bàn giao *</Text>
            <TouchableOpacity onPress={addItem} style={styles.addBtn}>
              <Ionicons name="add-circle" size={20} color="#F59E0B" />
              <Text style={styles.addBtnText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, i) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemIndex}>#{i + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(i)}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Material selector */}
              <Text style={styles.subLabel}>Vật tư</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {MOCK_MATERIALS.map((mat) => (
                  <TouchableOpacity
                    key={mat.id}
                    style={[
                      styles.matChip,
                      item.materialId === mat.id && styles.matChipActive,
                    ]}
                    onPress={() => selectMaterial(i, mat.id)}
                  >
                    <Text
                      style={[
                        styles.matChipText,
                        item.materialId === mat.id && styles.matChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {mat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Quantity + Condition */}
              <View style={styles.qtyCondRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subLabel}>Số lượng</Text>
                  <TextInput
                    style={styles.input}
                    value={item.quantity}
                    onChangeText={(v) => updateItem(i, "quantity", v)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={styles.unitBadge}>
                  <Text style={styles.unitText}>{item.unit}</Text>
                </View>
              </View>

              {/* Condition picker */}
              <Text style={styles.subLabel}>Tình trạng</Text>
              <View style={styles.conditionRow}>
                {CONDITION_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.condChip,
                      { borderColor: opt.color },
                      item.condition === opt.key && {
                        backgroundColor: opt.color,
                      },
                    ]}
                    onPress={() => updateItem(i, "condition", opt.key)}
                  >
                    <Text
                      style={[
                        styles.condChipText,
                        { color: opt.color },
                        item.condition === opt.key && { color: "#fff" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.input, { marginTop: 4 }]}
                value={item.notes}
                onChangeText={(v) => updateItem(i, "notes", v)}
                placeholder="Ghi chú (tùy chọn)"
              />
            </View>
          ))}
        </View>

        {/* Witness */}
        <View style={styles.field}>
          <Text style={styles.label}>Người chứng kiến</Text>
          <TextInput
            style={styles.input}
            value={witnessName}
            onChangeText={setWitnessName}
            placeholder="Tên người chứng kiến (tùy chọn)"
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Ghi chú chung</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú thêm..."
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.submitText}>
            {submitting ? "Đang tạo..." : "Tạo biên bản bàn giao"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  field: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  subLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  personOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  personOptionActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  personName: { fontSize: 14, fontWeight: "600", color: "#333" },
  personRole: { fontSize: 12, color: "#999" },
  warehouseOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  whChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  whChipActive: { backgroundColor: "#0D9488", borderColor: "#0D9488" },
  whChipText: { fontSize: 12, color: "#333" },
  whChipTextActive: { color: "#fff", fontWeight: "600" },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { fontSize: 13, color: "#F59E0B", fontWeight: "500" },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemIndex: { fontSize: 13, fontWeight: "700", color: "#F59E0B" },
  matChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  matChipActive: { backgroundColor: "#F59E0B" },
  matChipText: { fontSize: 12, color: "#666" },
  matChipTextActive: { color: "#fff", fontWeight: "600" },
  qtyCondRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
  },
  unitText: { fontSize: 13, fontWeight: "600", color: "#F59E0B" },
  conditionRow: { flexDirection: "row", gap: 6 },
  condChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  condChipText: { fontSize: 12, fontWeight: "600" },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F59E0B",
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
