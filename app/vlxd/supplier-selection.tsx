/**
 * Chọn NCC & Đặt hàng - Step 4: Chọn vật tư, số lượng, tính thành tiền
 * Route: /vlxd/supplier-selection
 * Bảng đặt hàng chi tiết với tính toán tự động
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Types ──────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

// ── Data ───────────────────────────────────────────────────────────────
const INITIAL_ITEMS: OrderItem[] = [
  {
    id: "cat_lon",
    name: "Cát bê tông hạt lớn",
    unit: "m³",
    unitPrice: 460000,
    quantity: 0,
    category: "Cát",
  },
  {
    id: "cat_vang",
    name: "Cát bê tông vàng",
    unit: "m³",
    unitPrice: 460000,
    quantity: 0,
    category: "Cát",
  },
  {
    id: "cat_lap",
    name: "Cát lấp",
    unit: "m³",
    unitPrice: 330000,
    quantity: 0,
    category: "Cát",
  },
  {
    id: "da_mi",
    name: "Đá mi",
    unit: "m³",
    unitPrice: 490000,
    quantity: 0,
    category: "Đá",
  },
  {
    id: "da_1x2",
    name: "Đá 1x2 xanh trắng",
    unit: "m³",
    unitPrice: 560000,
    quantity: 0,
    category: "Đá",
  },
  {
    id: "da_46",
    name: "Đá 4-6",
    unit: "m³",
    unitPrice: 500000,
    quantity: 0,
    category: "Đá",
  },
  {
    id: "xm_saomai",
    name: "Xi măng Sao Mai",
    unit: "bao",
    unitPrice: 83000,
    quantity: 0,
    category: "Xi măng",
  },
  {
    id: "xm_htdd",
    name: "Xi măng Hà Tiên đa dụng",
    unit: "bao",
    unitPrice: 83000,
    quantity: 0,
    category: "Xi măng",
  },
  {
    id: "xm_htxt",
    name: "Xi măng Hà Tiên xây tô",
    unit: "bao",
    unitPrice: 82000,
    quantity: 0,
    category: "Xi măng",
  },
  {
    id: "gach_tt",
    name: "Gạch tuynen Thành Tâm",
    unit: "viên",
    unitPrice: 1450,
    quantity: 0,
    category: "Gạch",
  },
  {
    id: "gach_qt",
    name: "Gạch tuynen Quốc Toàn",
    unit: "viên",
    unitPrice: 1370,
    quantity: 0,
    category: "Gạch",
  },
  {
    id: "gach_chay",
    name: "Gạch cháy",
    unit: "viên",
    unitPrice: 950,
    quantity: 0,
    category: "Gạch",
  },
  {
    id: "thep_10",
    name: "Thép phi 10",
    unit: "cây",
    unitPrice: 114000,
    quantity: 0,
    category: "Thép",
  },
  {
    id: "thep_12",
    name: "Thép phi 12",
    unit: "cây",
    unitPrice: 169000,
    quantity: 0,
    category: "Thép",
  },
  {
    id: "thep_14",
    name: "Thép phi 14",
    unit: "cây",
    unitPrice: 229000,
    quantity: 0,
    category: "Thép",
  },
  {
    id: "thep_16",
    name: "Thép phi 16",
    unit: "cây",
    unitPrice: 290000,
    quantity: 0,
    category: "Thép",
  },
  {
    id: "thep_18",
    name: "Thép phi 18",
    unit: "cây",
    unitPrice: 370000,
    quantity: 0,
    category: "Thép",
  },
  {
    id: "thep_20",
    name: "Thép phi 20",
    unit: "cây",
    unitPrice: 457000,
    quantity: 0,
    category: "Thép",
  },
  {
    id: "dinh_chi",
    name: "Đinh chì, kẽm",
    unit: "kg",
    unitPrice: 20000,
    quantity: 0,
    category: "Khác",
  },
];

// Pre-filled quantities matching the spec
const PREFILLED: Record<string, number> = {
  cat_lon: 2,
  da_mi: 1,
  xm_htdd: 100,
  gach_qt: 1000,
  thep_10: 20,
  thep_12: 30,
  thep_14: 10,
};

// ── Helpers ────────────────────────────────────────────────────────────
function formatVND(n: number): string {
  if (n === 0) return "-";
  return n.toLocaleString("vi-VN");
}

// ── Component ──────────────────────────────────────────────────────────
export default function SupplierSelectionScreen() {
  const [items, setItems] = useState<OrderItem[]>(() =>
    INITIAL_ITEMS.map((item) => ({
      ...item,
      quantity: PREFILLED[item.id] || 0,
    })),
  );

  const updateQuantity = (id: string, qty: string) => {
    const num = parseInt(qty.replace(/[^0-9]/g, ""), 10) || 0;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: num } : item)),
    );
  };

  // Computed
  const orderedItems = useMemo(
    () => items.filter((i) => i.quantity > 0),
    [items],
  );

  const grandTotal = useMemo(
    () => orderedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [orderedItems],
  );

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of orderedItems) {
      map[item.category] =
        (map[item.category] || 0) + item.unitPrice * item.quantity;
    }
    return map;
  }, [orderedItems]);

  const handleSubmit = () => {
    if (orderedItems.length === 0) {
      Alert.alert("Chưa có vật tư", "Vui lòng chọn ít nhất một mặt hàng");
      return;
    }
    Alert.alert(
      "Xác nhận đơn hàng",
      `Tổng ${orderedItems.length} mặt hàng\nThành tiền: ${formatVND(grandTotal)} ₫`,
      [
        { text: "Sửa đơn", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => router.push("/vlxd/order-summary" as any),
        },
      ],
    );
  };

  // Group items by category
  const categories = useMemo(() => {
    const cats: Record<string, OrderItem[]> = {};
    for (const item of items) {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    }
    return cats;
  }, [items]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chọn NCC & Đặt hàng</Text>
          <Text style={styles.headerStep}>Bước 4/4 • MS102</Text>
        </View>
        <View style={styles.stepIndicator}>
          <View style={styles.stepDotDone} />
          <View style={styles.stepDotDone} />
          <View style={styles.stepDotDone} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
        </View>
      </View>

      {/* Order info bar */}
      <View style={styles.orderInfoBar}>
        <View style={styles.orderInfoItem}>
          <Ionicons name="document-text" size={14} color="#0D9488" />
          <Text style={styles.orderInfoText}>MS102</Text>
        </View>
        <View style={styles.orderInfoItem}>
          <Ionicons name="location" size={14} color="#0D9488" />
          <Text style={styles.orderInfoText}>Vinhomes Q9</Text>
        </View>
        <View style={styles.orderInfoItem}>
          <Ionicons name="calendar" size={14} color="#0D9488" />
          <Text style={styles.orderInfoText}>26/03/2026</Text>
        </View>
        <View style={styles.orderInfoItem}>
          <Ionicons name="storefront" size={14} color="#0D9488" />
          <Text style={styles.orderInfoText}>VLXD Đức Hạnh</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Material table by category */}
        {Object.entries(categories).map(([category, catItems]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {categoryTotals[category] > 0 && (
                <Text style={styles.categoryTotal}>
                  {formatVND(categoryTotals[category])} ₫
                </Text>
              )}
            </View>

            {/* Sub-table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2.2 }]}>Danh mục vật tư</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Đơn giá</Text>
              <Text style={[styles.th, { flex: 0.3, textAlign: "center" }]}>
                ×
              </Text>
              <Text style={[styles.th, { flex: 0.8 }]}>SL</Text>
              <Text style={[styles.th, { flex: 0.5 }]}>ĐVT</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>
                Thành tiền
              </Text>
            </View>

            {catItems.map((item, idx) => {
              const lineTotal = item.unitPrice * item.quantity;
              const hasQty = item.quantity > 0;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    idx % 2 === 0 && styles.tableRowAlt,
                    hasQty && styles.tableRowHighlight,
                  ]}
                >
                  <Text
                    style={[
                      styles.td,
                      styles.tdName,
                      { flex: 2.2 },
                      hasQty && { color: "#0D9488", fontWeight: "700" },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.td, { flex: 1.2 }]}>
                    {formatVND(item.unitPrice)}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      { flex: 0.3, textAlign: "center", color: "#94A3B8" },
                    ]}
                  >
                    ×
                  </Text>
                  <View style={{ flex: 0.8 }}>
                    <TextInput
                      style={[styles.qtyInput, hasQty && styles.qtyInputActive]}
                      value={
                        item.quantity > 0
                          ? item.quantity.toLocaleString("vi-VN")
                          : ""
                      }
                      onChangeText={(v) => updateQuantity(item.id, v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#CBD5E1"
                    />
                  </View>
                  <Text style={[styles.td, styles.tdUnit, { flex: 0.5 }]}>
                    {item.unit}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      styles.tdTotal,
                      { flex: 1.2 },
                      hasQty && { color: "#1E293B", fontWeight: "700" },
                    ]}
                  >
                    {lineTotal > 0 ? formatVND(lineTotal) : "-"}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}

        {/* Breakdown summary */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>
            <Ionicons name="receipt-outline" size={16} color="#0D9488" /> Bảng
            tổng hợp
          </Text>

          {Object.entries(categoryTotals).map(([cat, total]) => (
            <View key={cat} style={styles.breakdownRow}>
              <Text style={styles.breakdownCat}>{cat}</Text>
              <Text style={styles.breakdownAmount}>{formatVND(total)} ₫</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownCat}>Số mặt hàng</Text>
            <Text style={styles.breakdownAmount}>
              {orderedItems.length} mặt hàng
            </Text>
          </View>

          <View style={[styles.breakdownRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>THÀNH TIỀN</Text>
            <Text style={styles.grandTotalValue}>
              {formatVND(grandTotal)} ₫
            </Text>
          </View>
        </View>

        {/* Order items list (for ordered items) */}
        {orderedItems.length > 0 && (
          <View style={styles.orderedSection}>
            <Text style={styles.orderedTitle}>
              <Ionicons
                name="checkmark-done-outline"
                size={16}
                color="#10B981"
              />{" "}
              Vật tư đã chọn ({orderedItems.length})
            </Text>
            {orderedItems.map((item) => (
              <View key={item.id} style={styles.orderedItem}>
                <View style={styles.orderedItemLeft}>
                  <Text style={styles.orderedItemName}>{item.name}</Text>
                  <Text style={styles.orderedItemMeta}>
                    {formatVND(item.unitPrice)} ×{" "}
                    {item.quantity.toLocaleString("vi-VN")} {item.unit}
                  </Text>
                </View>
                <Text style={styles.orderedItemTotal}>
                  {formatVND(item.unitPrice * item.quantity)} ₫
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer with grand total */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Thành tiền</Text>
          <Text style={styles.footerTotal}>{formatVND(grandTotal)} ₫</Text>
          <Text style={styles.footerItems}>{orderedItems.length} mặt hàng</Text>
        </View>
        <Pressable
          style={[
            styles.submitBtn,
            orderedItems.length === 0 && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
        >
          <Ionicons name="bag-check" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>Xác nhận đơn</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { padding: 8, marginRight: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  headerStep: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  stepIndicator: { flexDirection: "row", gap: 4 },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  stepDotActive: { backgroundColor: "#0D9488", width: 20 },
  stepDotDone: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },

  orderInfoBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F0FDFA",
    borderBottomWidth: 1,
    borderBottomColor: "#CCFBF1",
    gap: 12,
  },
  orderInfoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  orderInfoText: { fontSize: 12, fontWeight: "600", color: "#0D9488" },

  body: { flex: 1 },

  categorySection: { marginBottom: 4 },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#0D9488",
  },
  categoryTitle: { fontSize: 13, fontWeight: "700", color: "#fff" },
  categoryTotal: { fontSize: 12, fontWeight: "700", color: "#A7F3D0" },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#1E293B",
  },
  th: { fontSize: 10, fontWeight: "700", color: "#94A3B8" },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
    minHeight: 44,
  },
  tableRowAlt: { backgroundColor: "#FAFBFC" },
  tableRowHighlight: { backgroundColor: "#F0FDFA" },
  td: { fontSize: 11, color: "#64748B" },
  tdName: { fontWeight: "500", color: "#1E293B", fontSize: 12 },
  tdUnit: { color: "#94A3B8", textAlign: "center", fontSize: 10 },
  tdTotal: { textAlign: "right", fontSize: 11 },

  qtyInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
    textAlign: "center",
    color: "#1E293B",
  },
  qtyInputActive: {
    backgroundColor: "#F0FDFA",
    borderColor: "#0D9488",
    fontWeight: "700",
  },

  breakdownSection: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  breakdownCat: { fontSize: 13, color: "#64748B" },
  breakdownAmount: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  grandTotalRow: {
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: "#0D9488",
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D9488",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D9488",
  },

  orderedSection: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  orderedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  orderedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  orderedItemLeft: { flex: 1 },
  orderedItemName: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  orderedItemMeta: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  orderedItemTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D9488",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  footerLeft: { flex: 1 },
  footerLabel: { fontSize: 11, color: "#94A3B8" },
  footerTotal: { fontSize: 20, fontWeight: "800", color: "#0D9488" },
  footerItems: { fontSize: 11, color: "#64748B" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0D9488",
  },
  submitBtnDisabled: { backgroundColor: "#94A3B8" },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
