import { useTransferOrders } from "@/hooks/useInventory";
import { MOCK_WAREHOUSES } from "@/mocks/inventory-advanced-mocks";
import type { CreateTransferOrderRequest } from "@/types/inventory";
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

interface TransferItem {
  materialId: string;
  materialName: string;
  requestedQuantity: string;
  unit: MaterialUnit;
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

export default function CreateTransferScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { createTransfer } = useTransferOrders(projectId || "");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<TransferItem[]>([
    {
      materialId: "",
      materialName: "",
      requestedQuantity: "",
      unit: MaterialUnit.KG,
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
        requestedQuantity: "",
        unit: MaterialUnit.KG,
        notes: "",
      },
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof TransferItem, value: string) => {
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
    if (!fromWarehouseId || !toWarehouseId) {
      Alert.alert("Lỗi", "Vui lòng chọn kho xuất và kho nhận");
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      Alert.alert("Lỗi", "Kho xuất và kho nhận không thể giống nhau");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do luân chuyển");
      return;
    }
    const validItems = items.filter(
      (i) => i.materialId && Number(i.requestedQuantity) > 0,
    );
    if (validItems.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất 1 vật tư");
      return;
    }

    setSubmitting(true);
    const request: CreateTransferOrderRequest = {
      fromWarehouseId,
      toWarehouseId,
      items: validItems.map((i) => ({
        materialId: i.materialId,
        requestedQuantity: Number(i.requestedQuantity),
        notes: i.notes || undefined,
      })),
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    };

    try {
      await createTransfer(request);
      Alert.alert("Thành công", "Phiếu luân chuyển đã được tạo", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo phiếu luân chuyển. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }, [fromWarehouseId, toWarehouseId, reason, notes, items]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* From Warehouse */}
        <View style={styles.field}>
          <Text style={styles.label}>Kho xuất *</Text>
          <View style={styles.warehouseOptions}>
            {MOCK_WAREHOUSES.map((wh) => (
              <TouchableOpacity
                key={wh.id}
                style={[
                  styles.warehouseOption,
                  fromWarehouseId === wh.id && styles.warehouseOptionActive,
                ]}
                onPress={() => setFromWarehouseId(wh.id)}
              >
                <Ionicons
                  name={
                    wh.type === "MAIN"
                      ? "business"
                      : wh.type === "SITE"
                        ? "construct"
                        : "cube"
                  }
                  size={16}
                  color={fromWarehouseId === wh.id ? "#fff" : "#0D9488"}
                />
                <Text
                  style={[
                    styles.warehouseOptionText,
                    fromWarehouseId === wh.id &&
                      styles.warehouseOptionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {wh.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* To Warehouse */}
        <View style={styles.field}>
          <Text style={styles.label}>Kho nhận *</Text>
          <View style={styles.warehouseOptions}>
            {MOCK_WAREHOUSES.filter((wh) => wh.id !== fromWarehouseId).map(
              (wh) => (
                <TouchableOpacity
                  key={wh.id}
                  style={[
                    styles.warehouseOption,
                    toWarehouseId === wh.id && styles.warehouseOptionActive,
                  ]}
                  onPress={() => setToWarehouseId(wh.id)}
                >
                  <Ionicons
                    name={
                      wh.type === "MAIN"
                        ? "business"
                        : wh.type === "SITE"
                          ? "construct"
                          : "cube"
                    }
                    size={16}
                    color={toWarehouseId === wh.id ? "#fff" : "#8B5CF6"}
                  />
                  <Text
                    style={[
                      styles.warehouseOptionText,
                      toWarehouseId === wh.id &&
                        styles.warehouseOptionTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {wh.name}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Reason */}
        <View style={styles.field}>
          <Text style={styles.label}>Lý do luân chuyển *</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Ví dụ: Bổ sung vật tư cho giai đoạn thi công..."
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Items */}
        <View style={styles.field}>
          <View style={styles.itemsHeader}>
            <Text style={styles.label}>Danh sách vật tư *</Text>
            <TouchableOpacity onPress={addItem} style={styles.addBtn}>
              <Ionicons name="add-circle" size={20} color="#0D9488" />
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.matScroll}
              >
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

              {/* Quantity */}
              <View style={styles.qtyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subLabel}>Số lượng</Text>
                  <TextInput
                    style={styles.input}
                    value={item.requestedQuantity}
                    onChangeText={(v) => updateItem(i, "requestedQuantity", v)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={styles.unitBadge}>
                  <Text style={styles.unitText}>{item.unit}</Text>
                </View>
              </View>

              {/* Item notes */}
              <TextInput
                style={[styles.input, { marginTop: 4 }]}
                value={item.notes}
                onChangeText={(v) => updateItem(i, "notes", v)}
                placeholder="Ghi chú (tùy chọn)"
              />
            </View>
          ))}
        </View>

        {/* General Notes */}
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
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.submitText}>
            {submitting ? "Đang tạo..." : "Tạo phiếu luân chuyển"}
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
  warehouseOptions: { gap: 8 },
  warehouseOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  warehouseOptionActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  warehouseOptionText: { fontSize: 13, color: "#333", flex: 1 },
  warehouseOptionTextActive: { color: "#fff", fontWeight: "600" },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { fontSize: 13, color: "#0D9488", fontWeight: "500" },
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
  itemIndex: { fontSize: 13, fontWeight: "700", color: "#0D9488" },
  matScroll: { marginBottom: 4 },
  matChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  matChipActive: { backgroundColor: "#0D9488" },
  matChipText: { fontSize: 12, color: "#666" },
  matChipTextActive: { color: "#fff", fontWeight: "600" },
  qtyRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
  },
  unitText: { fontSize: 13, fontWeight: "600", color: "#0D9488" },
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
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
