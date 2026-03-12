/**
 * Chọn NCC & Đặt hàng Coffa - Đơn hàng cốp pha
 * Route: /vlxd/coffa-order
 * MS102 - Vinhomes Q9 - Cấp Coffa - 26/03/2026
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    View
} from "react-native";

const { width } = Dimensions.get("window");

// ── Types ──────────────────────────────────────────────────────────────
interface CoffaItem {
  id: string;
  brand: string;
  size: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

// ── Data ───────────────────────────────────────────────────────────────
const ORDER_INFO = {
  code: "MS102",
  location: "Vinhomes Q9",
  job: "Cấp Coffa",
  date: "26/03/2026",
};

const INITIAL_ITEMS: CoffaItem[] = [
  // Thành Nam
  {
    id: "tn_20x4",
    brand: "Thành Nam",
    size: "20 x 4m",
    unit: "tấm",
    unitPrice: 91000,
    quantity: 0,
    category: "Thành Nam",
  },
  {
    id: "tn_25x4",
    brand: "Thành Nam",
    size: "25 x 4m",
    unit: "tấm",
    unitPrice: 114000,
    quantity: 0,
    category: "Thành Nam",
  },
  {
    id: "tn_30x4",
    brand: "Thành Nam",
    size: "30 x 4m",
    unit: "tấm",
    unitPrice: 136000,
    quantity: 0,
    category: "Thành Nam",
  },
  {
    id: "tn_35x4",
    brand: "Thành Nam",
    size: "35 x 4m",
    unit: "tấm",
    unitPrice: 159000,
    quantity: 0,
    category: "Thành Nam",
  },
  {
    id: "tn_40x4",
    brand: "Thành Nam",
    size: "40 x 4m",
    unit: "tấm",
    unitPrice: 182000,
    quantity: 0,
    category: "Thành Nam",
  },
  {
    id: "tn_50x4",
    brand: "Thành Nam",
    size: "50 x 4m",
    unit: "tấm",
    unitPrice: 227000,
    quantity: 0,
    category: "Thành Nam",
  },
  // Việt Mỹ
  {
    id: "vm_20x4",
    brand: "Việt Mỹ",
    size: "20 x 4m",
    unit: "tấm",
    unitPrice: 109000,
    quantity: 0,
    category: "Việt Mỹ",
  },
  {
    id: "vm_25x4",
    brand: "Việt Mỹ",
    size: "25 x 4m",
    unit: "tấm",
    unitPrice: 136000,
    quantity: 0,
    category: "Việt Mỹ",
  },
  {
    id: "vm_30x4",
    brand: "Việt Mỹ",
    size: "30 x 4m",
    unit: "tấm",
    unitPrice: 163000,
    quantity: 0,
    category: "Việt Mỹ",
  },
  {
    id: "vm_35x4",
    brand: "Việt Mỹ",
    size: "35 x 4m",
    unit: "tấm",
    unitPrice: 191000,
    quantity: 0,
    category: "Việt Mỹ",
  },
  {
    id: "vm_40x4",
    brand: "Việt Mỹ",
    size: "40 x 4m",
    unit: "tấm",
    unitPrice: 218000,
    quantity: 0,
    category: "Việt Mỹ",
  },
  {
    id: "vm_50x4",
    brand: "Việt Mỹ",
    size: "50 x 4m",
    unit: "tấm",
    unitPrice: 272000,
    quantity: 0,
    category: "Việt Mỹ",
  },
  // Ván Phim Mỹ Anh
  {
    id: "ma_16ly",
    brand: "Ván Phim Mỹ Anh",
    size: "16 ly (1m x 2m)",
    unit: "tấm",
    unitPrice: 375000,
    quantity: 0,
    category: "Ván Phim Mỹ Anh",
  },
  {
    id: "ma_18ly",
    brand: "Ván Phim Mỹ Anh",
    size: "18 ly (1m x 2m)",
    unit: "tấm",
    unitPrice: 395000,
    quantity: 0,
    category: "Ván Phim Mỹ Anh",
  },
];

// Pre-filled quantities matching the spec
const PREFILLED: Record<string, number> = {
  tn_20x4: 10,
  tn_25x4: 5,
  tn_40x4: 10,
  vm_20x4: 20,
  vm_30x4: 15,
  ma_16ly: 5,
  ma_18ly: 5,
};

// Brand colors & icons
const BRAND_META: Record<string, { color: string; icon: string }> = {
  "Thành Nam": { color: "#0D9488", icon: "🏗️" },
  "Việt Mỹ": { color: "#8B5CF6", icon: "🇺🇸" },
  "Ván Phim Mỹ Anh": { color: "#F59E0B", icon: "📐" },
};

// ── Helpers ────────────────────────────────────────────────────────────
function formatVND(n: number): string {
  if (n === 0) return "-";
  return n.toLocaleString("vi-VN");
}

// ── Component ──────────────────────────────────────────────────────────
export default function CoffaOrderScreen() {
  const [items, setItems] = useState<CoffaItem[]>(() =>
    INITIAL_ITEMS.map((item) => ({
      ...item,
      quantity: PREFILLED[item.id] || 0,
    })),
  );
  const [showImages, setShowImages] = useState(false);

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

  const brandTotals = useMemo(() => {
    const map: Record<string, { total: number; count: number; qty: number }> =
      {};
    for (const item of orderedItems) {
      if (!map[item.category])
        map[item.category] = { total: 0, count: 0, qty: 0 };
      map[item.category].total += item.unitPrice * item.quantity;
      map[item.category].count += 1;
      map[item.category].qty += item.quantity;
    }
    return map;
  }, [orderedItems]);

  // Group items by brand
  const brands = useMemo(() => {
    const map: Record<string, CoffaItem[]> = {};
    for (const item of items) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [items]);

  const handleSubmit = () => {
    if (orderedItems.length === 0) {
      Alert.alert("Chưa có vật tư", "Vui lòng chọn ít nhất một mặt hàng coffa");
      return;
    }
    Alert.alert(
      "Xác nhận đơn hàng Coffa",
      `Mã đơn: ${ORDER_INFO.code}\nVị trí: ${ORDER_INFO.location}\n\nTổng ${orderedItems.length} mặt hàng\nTổng SL: ${orderedItems.reduce((s, i) => s + i.quantity, 0)} tấm\nThành tiền: ${formatVND(grandTotal)} ₫`,
      [
        { text: "Sửa đơn", style: "cancel" },
        {
          text: "Xác nhận đơn hàng",
          onPress: () => router.push("/vlxd/order-summary" as any),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#1E293B", "#334155", "#475569"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Đặt hàng Coffa</Text>
            <Text style={styles.headerSub}>Chọn NCC & xác nhận đơn hàng</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>4/4</Text>
          </View>
        </View>

        {/* Order info pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.orderPills}
        >
          {[
            { icon: "document-text", label: ORDER_INFO.code },
            { icon: "location", label: ORDER_INFO.location },
            { icon: "construct", label: ORDER_INFO.job },
            { icon: "calendar", label: ORDER_INFO.date },
          ].map((p) => (
            <View key={p.label} style={styles.orderPill}>
              <Ionicons name={p.icon as any} size={13} color="#A7F3D0" />
              <Text style={styles.orderPillText}>{p.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orderedItems.length}</Text>
            <Text style={styles.statLabel}>Mặt hàng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {orderedItems.reduce((s, i) => s + i.quantity, 0)}
            </Text>
            <Text style={styles.statLabel}>Tổng tấm</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Object.keys(brandTotals).length}
            </Text>
            <Text style={styles.statLabel}>Nhà SX</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "#10B981" }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {grandTotal > 0 ? (grandTotal / 1000000).toFixed(1) + "M" : "0"}
            </Text>
            <Text style={styles.statLabel}>Thành tiền</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* ── Image placeholder ── */}
        <Pressable
          style={styles.imageSection}
          onPress={() => setShowImages(!showImages)}
        >
          <Ionicons name="camera-outline" size={22} color="#0D9488" />
          <Text style={styles.imageSectionText}>
            Hình ảnh công trình (bấm để thêm)
          </Text>
          <Ionicons
            name={showImages ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </Pressable>

        {/* ── Bảng đặt hàng theo nhãn hiệu ── */}
        {Object.entries(brands).map(([brand, brandItems]) => {
          const meta = BRAND_META[brand] || { color: "#64748B", icon: "📦" };
          const bt = brandTotals[brand];
          return (
            <View key={brand} style={styles.brandSection}>
              {/* Brand header */}
              <LinearGradient
                colors={[meta.color, meta.color + "CC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.brandHeader}
              >
                <Text style={styles.brandIcon}>{meta.icon}</Text>
                <View style={styles.brandInfo}>
                  <Text style={styles.brandName}>{brand}</Text>
                  {bt && (
                    <Text style={styles.brandSub}>
                      {bt.count} mặt hàng • {bt.qty} tấm
                    </Text>
                  )}
                </View>
                {bt && (
                  <Text style={styles.brandTotal}>{formatVND(bt.total)} ₫</Text>
                )}
              </LinearGradient>

              {/* Table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1.5 }]}>Kích thước</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>Đơn giá</Text>
                <Text style={[styles.th, { flex: 0.3, textAlign: "center" }]}>
                  ×
                </Text>
                <Text style={[styles.th, { flex: 0.8 }]}>SL</Text>
                <Text style={[styles.th, { flex: 0.5 }]}>ĐVT</Text>
                <Text style={[styles.th, { flex: 1.3, textAlign: "right" }]}>
                  Thành tiền
                </Text>
              </View>

              {/* Rows */}
              {brandItems.map((item, idx) => {
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
                        { flex: 1.5 },
                        hasQty && { color: meta.color, fontWeight: "700" },
                      ]}
                    >
                      {item.size}
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
                        style={[
                          styles.qtyInput,
                          hasQty && [
                            styles.qtyInputActive,
                            { borderColor: meta.color },
                          ],
                        ]}
                        value={item.quantity > 0 ? String(item.quantity) : ""}
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
                        { flex: 1.3 },
                        hasQty && { color: "#1E293B", fontWeight: "700" },
                      ]}
                    >
                      {lineTotal > 0 ? formatVND(lineTotal) : "-"}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* ── Tổng hợp theo nhãn hiệu ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            <Ionicons name="receipt-outline" size={16} color="#0D9488" /> Bảng
            tổng hợp Coffa
          </Text>

          {/* Brand breakdown */}
          {Object.entries(brandTotals).map(([brand, bt]) => {
            const meta = BRAND_META[brand] || { color: "#64748B", icon: "📦" };
            return (
              <View key={brand} style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View
                    style={[styles.summaryDot, { backgroundColor: meta.color }]}
                  />
                  <Text style={styles.summaryCat}>{brand}</Text>
                  <Text style={styles.summaryMeta}>
                    ({bt.count} loại • {bt.qty} tấm)
                  </Text>
                </View>
                <Text style={styles.summaryAmount}>
                  {formatVND(bt.total)} ₫
                </Text>
              </View>
            );
          })}

          <View style={styles.divider} />

          {/* Summary stats */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryCat}>Tổng mặt hàng</Text>
            <Text style={styles.summaryAmount}>
              {orderedItems.length} mặt hàng
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryCat}>Tổng số lượng</Text>
            <Text style={styles.summaryAmount}>
              {orderedItems.reduce((s, i) => s + i.quantity, 0)} tấm
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>THÀNH TIỀN</Text>
            <Text style={styles.grandTotalValue}>
              {formatVND(grandTotal)} ₫
            </Text>
          </View>
        </View>

        {/* ── Chi tiết đã chọn ── */}
        {orderedItems.length > 0 && (
          <View style={styles.orderedCard}>
            <Text style={styles.orderedTitle}>
              <Ionicons
                name="checkmark-done-outline"
                size={16}
                color="#10B981"
              />{" "}
              Coffa đã chọn ({orderedItems.length})
            </Text>
            {orderedItems.map((item) => {
              const meta = BRAND_META[item.category] || {
                color: "#64748B",
                icon: "📦",
              };
              return (
                <View key={item.id} style={styles.orderedItem}>
                  <View style={styles.orderedItemLeft}>
                    <View style={styles.orderedItemHeader}>
                      <View
                        style={[
                          styles.orderedBrandDot,
                          { backgroundColor: meta.color },
                        ]}
                      />
                      <Text style={styles.orderedItemBrand}>{item.brand}</Text>
                    </View>
                    <Text style={styles.orderedItemName}>{item.size}</Text>
                    <Text style={styles.orderedItemMeta}>
                      {formatVND(item.unitPrice)} × {item.quantity} {item.unit}
                    </Text>
                  </View>
                  <Text
                    style={[styles.orderedItemTotal, { color: meta.color }]}
                  >
                    {formatVND(item.unitPrice * item.quantity)} ₫
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── So sánh giá theo kích thước ── */}
        <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>
            <Ionicons name="swap-horizontal" size={16} color="#8B5CF6" /> So
            sánh giá Thành Nam vs Việt Mỹ
          </Text>
          {[
            "20 x 4m",
            "25 x 4m",
            "30 x 4m",
            "35 x 4m",
            "40 x 4m",
            "50 x 4m",
          ].map((size) => {
            const tn = items.find(
              (i) => i.category === "Thành Nam" && i.size === size,
            );
            const vm = items.find(
              (i) => i.category === "Việt Mỹ" && i.size === size,
            );
            if (!tn || !vm) return null;
            const diff = vm.unitPrice - tn.unitPrice;
            const cheaper = diff > 0 ? "Thành Nam" : "Việt Mỹ";
            return (
              <View key={size} style={styles.compareRow}>
                <Text style={styles.compareSize}>{size}</Text>
                <View style={styles.comparePrices}>
                  <View
                    style={[
                      styles.comparePrice,
                      diff > 0 && styles.comparePriceBest,
                    ]}
                  >
                    <Text style={styles.comparePriceBrand}>TN</Text>
                    <Text
                      style={[
                        styles.comparePriceValue,
                        diff > 0 && { color: "#10B981", fontWeight: "700" },
                      ]}
                    >
                      {formatVND(tn.unitPrice)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.comparePrice,
                      diff <= 0 && styles.comparePriceBest,
                    ]}
                  >
                    <Text style={styles.comparePriceBrand}>VM</Text>
                    <Text
                      style={[
                        styles.comparePriceValue,
                        diff <= 0 && { color: "#10B981", fontWeight: "700" },
                      ]}
                    >
                      {formatVND(vm.unitPrice)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.compareDiff}>
                  {cheaper} rẻ hơn {formatVND(Math.abs(diff))}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Thành tiền</Text>
          <Text style={styles.footerTotal}>{formatVND(grandTotal)} ₫</Text>
          <Text style={styles.footerMeta}>
            {orderedItems.length} mặt hàng •{" "}
            {orderedItems.reduce((s, i) => s + i.quantity, 0)} tấm
          </Text>
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

  // Header
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  stepBadge: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  orderPills: { marginBottom: 12 },
  orderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
  },
  orderPillText: { fontSize: 12, color: "#E2E8F0", fontWeight: "500" },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 10, color: "#94A3B8", marginTop: 2 },

  body: { flex: 1 },

  // Image section
  imageSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    margin: 12,
    marginBottom: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#0D9488",
  },
  imageSectionText: { flex: 1, fontSize: 13, color: "#64748B" },

  // Brand sections
  brandSection: { marginBottom: 4 },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  brandIcon: { fontSize: 20 },
  brandInfo: { flex: 1 },
  brandName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  brandSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  brandTotal: { fontSize: 14, fontWeight: "700", color: "#A7F3D0" },

  // Table
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 7,
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
  td: { fontSize: 12, color: "#64748B" },
  tdName: { fontWeight: "500", color: "#1E293B" },
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

  // Summary
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    margin: 12,
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
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  summaryDot: { width: 10, height: 10, borderRadius: 5 },
  summaryCat: { fontSize: 13, color: "#64748B" },
  summaryMeta: { fontSize: 11, color: "#94A3B8" },
  summaryAmount: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 8 },
  grandTotalRow: {
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: "#0D9488",
  },
  grandTotalLabel: { fontSize: 15, fontWeight: "800", color: "#0D9488" },
  grandTotalValue: { fontSize: 20, fontWeight: "800", color: "#0D9488" },

  // Ordered items
  orderedCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
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
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  orderedItemLeft: { flex: 1 },
  orderedItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  orderedBrandDot: { width: 8, height: 8, borderRadius: 4 },
  orderedItemBrand: { fontSize: 11, fontWeight: "600", color: "#94A3B8" },
  orderedItemName: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  orderedItemMeta: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  orderedItemTotal: { fontSize: 14, fontWeight: "700" },

  // Compare
  compareCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
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
  compareTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
  },
  compareRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  compareSize: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  comparePrices: { flexDirection: "row", gap: 8, marginBottom: 4 },
  comparePrice: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  comparePriceBest: { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
  comparePriceBrand: { fontSize: 11, fontWeight: "700", color: "#94A3B8" },
  comparePriceValue: { fontSize: 12, color: "#64748B" },
  compareDiff: { fontSize: 11, color: "#10B981", fontStyle: "italic" },

  // Footer
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
  footerTotal: { fontSize: 22, fontWeight: "800", color: "#0D9488" },
  footerMeta: { fontSize: 11, color: "#64748B" },
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
