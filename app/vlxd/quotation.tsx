/**
 * Báo giá NCC - Step 2: So sánh báo giá nhà cung cấp
 * Route: /vlxd/quotation
 * App thu 5% trên đơn giá, NCC tự động điều chỉnh giá cho phù hợp
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Types ──────────────────────────────────────────────────────────────
interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  category: string;
}

interface SupplierQuote {
  id: string;
  name: string;
  code: string;
  rating: number;
  deliveryTime: string;
  color: string;
  prices: Record<string, number>; // materialId -> price
}

// ── Data ───────────────────────────────────────────────────────────────
const MATERIAL_CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "cat", label: "Cát" },
  { key: "da", label: "Đá" },
  { key: "xi_mang", label: "Xi măng" },
  { key: "gach", label: "Gạch" },
  { key: "thep", label: "Thép" },
  { key: "khac", label: "Khác" },
];

const MATERIALS: MaterialItem[] = [
  { id: "cat_lon", name: "Cát bê tông hạt lớn", unit: "m³", category: "cat" },
  { id: "cat_vang", name: "Cát bê tông vàng", unit: "m³", category: "cat" },
  { id: "cat_lap", name: "Cát lấp", unit: "m³", category: "cat" },
  { id: "da_mi", name: "Đá mi", unit: "m³", category: "da" },
  { id: "da_1x2", name: "Đá 1x2 xanh trắng", unit: "m³", category: "da" },
  { id: "da_46", name: "Đá 4-6", unit: "m³", category: "da" },
  {
    id: "xm_saomai",
    name: "Xi măng Sao Mai",
    unit: "bao",
    category: "xi_mang",
  },
  {
    id: "xm_htdd",
    name: "Xi măng Hà Tiên đa dụng",
    unit: "bao",
    category: "xi_mang",
  },
  {
    id: "xm_htxt",
    name: "Xi măng Hà Tiên xây tô",
    unit: "bao",
    category: "xi_mang",
  },
  {
    id: "gach_tt",
    name: "Gạch tuynen Thành Tâm",
    unit: "viên",
    category: "gach",
  },
  {
    id: "gach_qt",
    name: "Gạch tuynen Quốc Toàn",
    unit: "viên",
    category: "gach",
  },
  { id: "gach_chay", name: "Gạch cháy", unit: "viên", category: "gach" },
  { id: "thep_10", name: "Thép phi 10", unit: "cây", category: "thep" },
  { id: "thep_12", name: "Thép phi 12", unit: "cây", category: "thep" },
  { id: "thep_14", name: "Thép phi 14", unit: "cây", category: "thep" },
  { id: "thep_16", name: "Thép phi 16", unit: "cây", category: "thep" },
  { id: "thep_18", name: "Thép phi 18", unit: "cây", category: "thep" },
  { id: "thep_20", name: "Thép phi 20", unit: "cây", category: "thep" },
  { id: "dinh_chi", name: "Đinh chì, kẽm", unit: "kg", category: "khac" },
];

const SUPPLIERS: SupplierQuote[] = [
  {
    id: "ncc1",
    name: "VLXD Đức Hạnh",
    code: "NCC1",
    rating: 4.8,
    deliveryTime: "2-4h",
    color: "#0D9488",
    prices: {
      cat_lon: 460000,
      cat_vang: 460000,
      cat_lap: 330000,
      da_mi: 490000,
      da_1x2: 560000,
      da_46: 500000,
      xm_saomai: 83000,
      xm_htdd: 83000,
      xm_htxt: 82000,
      gach_tt: 1450,
      gach_qt: 1370,
      gach_chay: 950,
      thep_10: 114000,
      thep_12: 169000,
      thep_14: 229000,
      thep_16: 290000,
      thep_18: 370000,
      thep_20: 457000,
      dinh_chi: 20000,
    },
  },
  {
    id: "ncc2",
    name: "VLXD Phương Nam",
    code: "NCC2",
    rating: 4.6,
    deliveryTime: "3-5h",
    color: "#8B5CF6",
    prices: {
      cat_lon: 470000,
      cat_vang: 465000,
      cat_lap: 340000,
      da_mi: 500000,
      da_1x2: 570000,
      da_46: 510000,
      xm_saomai: 85000,
      xm_htdd: 85000,
      xm_htxt: 84000,
      gach_tt: 1500,
      gach_qt: 1400,
      gach_chay: 980,
      thep_10: 116000,
      thep_12: 172000,
      thep_14: 232000,
      thep_16: 295000,
      thep_18: 375000,
      thep_20: 462000,
      dinh_chi: 21000,
    },
  },
  {
    id: "ncc3",
    name: "Hòa Phát VLXD",
    code: "NCC3",
    rating: 4.9,
    deliveryTime: "4-6h",
    color: "#F59E0B",
    prices: {
      cat_lon: 455000,
      cat_vang: 450000,
      cat_lap: 325000,
      da_mi: 485000,
      da_1x2: 555000,
      da_46: 495000,
      xm_saomai: 82000,
      xm_htdd: 82000,
      xm_htxt: 81000,
      gach_tt: 1420,
      gach_qt: 1350,
      gach_chay: 930,
      thep_10: 112000,
      thep_12: 166000,
      thep_14: 226000,
      thep_16: 285000,
      thep_18: 365000,
      thep_20: 450000,
      dinh_chi: 19500,
    },
  },
  {
    id: "ncc4",
    name: "VLXD Miền Đông",
    code: "NCC4",
    rating: 4.5,
    deliveryTime: "3-4h",
    color: "#EF4444",
    prices: {
      cat_lon: 465000,
      cat_vang: 458000,
      cat_lap: 335000,
      da_mi: 495000,
      da_1x2: 565000,
      da_46: 505000,
      xm_saomai: 84000,
      xm_htdd: 84000,
      xm_htxt: 83000,
      gach_tt: 1480,
      gach_qt: 1390,
      gach_chay: 960,
      thep_10: 115000,
      thep_12: 170000,
      thep_14: 230000,
      thep_16: 292000,
      thep_18: 372000,
      thep_20: 460000,
      dinh_chi: 20500,
    },
  },
];

const APP_FEE_PERCENT = 5; // App thu 5%

// ── Helpers ────────────────────────────────────────────────────────────
function formatPrice(n: number): string {
  return n.toLocaleString("vi-VN");
}

function findLowestPrice(materialId: string): string {
  let lowest = Infinity;
  let supplierId = "";
  for (const s of SUPPLIERS) {
    const p = s.prices[materialId];
    if (p && p < lowest) {
      lowest = p;
      supplierId = s.id;
    }
  }
  return supplierId;
}

// ── Component ──────────────────────────────────────────────────────────
export default function QuotationScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const filteredMaterials =
    selectedCategory === "all"
      ? MATERIALS
      : MATERIALS.filter((m) => m.category === selectedCategory);

  const handleSelectSupplier = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    const supplier = SUPPLIERS.find((s) => s.id === supplierId);
    Alert.alert(
      "Chọn nhà cung cấp",
      `Bạn đã chọn ${supplier?.name}.\nTiếp tục trình mẫu?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Trình mẫu",
          onPress: () => router.push("/vlxd/sample-approval" as any),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Báo giá nhà cung cấp</Text>
          <Text style={styles.headerStep}>Bước 2/4 • MS102</Text>
        </View>
        <View style={styles.stepIndicator}>
          <View style={styles.stepDotDone} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#0D9488" />
        <Text style={styles.infoText}>
          App thu {APP_FEE_PERCENT}% trên đơn giá • NCC tự điều chỉnh giá cho
          phù hợp
        </Text>
      </View>

      {/* Supplier pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.supplierPills}
        contentContainerStyle={styles.supplierPillsContent}
      >
        {SUPPLIERS.map((s) => (
          <Pressable
            key={s.id}
            style={[
              styles.supplierPill,
              selectedSupplier === s.id && {
                backgroundColor: s.color + "15",
                borderColor: s.color,
              },
            ]}
            onPress={() =>
              setSelectedSupplier(selectedSupplier === s.id ? null : s.id)
            }
          >
            <View style={[styles.supplierDot, { backgroundColor: s.color }]} />
            <View>
              <Text
                style={[
                  styles.supplierPillName,
                  selectedSupplier === s.id && { color: s.color },
                ]}
              >
                {s.code} - {s.name}
              </Text>
              <View style={styles.supplierMeta}>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <Text style={styles.supplierRating}>{s.rating}</Text>
                <Text style={styles.supplierDelivery}>• {s.deliveryTime}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryBarContent}
      >
        {MATERIAL_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[
              styles.categoryChip,
              selectedCategory === cat.key && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.key && styles.categoryChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Price table */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thCell, { flex: 2.5 }]}>Danh mục vật tư</Text>
          {SUPPLIERS.map((s) => (
            <Text
              key={s.id}
              style={[styles.thCell, { flex: 1, color: s.color }]}
            >
              {s.code}
            </Text>
          ))}
          <Text style={[styles.thCell, { flex: 0.8 }]}>ĐVT</Text>
        </View>

        {/* Table rows */}
        {filteredMaterials.map((mat, idx) => {
          const lowestSupplier = findLowestPrice(mat.id);
          return (
            <View
              key={mat.id}
              style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}
            >
              <Text style={[styles.tdCell, styles.tdName, { flex: 2.5 }]}>
                {mat.name}
              </Text>
              {SUPPLIERS.map((s) => {
                const price = s.prices[mat.id];
                const isLowest = lowestSupplier === s.id;
                return (
                  <View key={s.id} style={[styles.tdPriceWrap, { flex: 1 }]}>
                    <Text
                      style={[styles.tdPrice, isLowest && styles.tdPriceLowest]}
                    >
                      {price ? formatPrice(price) : "-"}
                    </Text>
                    {isLowest && (
                      <View style={styles.lowestBadge}>
                        <Text style={styles.lowestBadgeText}>Thấp nhất</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              <Text style={[styles.tdCell, styles.tdUnit, { flex: 0.8 }]}>
                {mat.unit}
              </Text>
            </View>
          );
        })}

        {/* Summary per supplier */}
        <Text style={styles.summaryTitle}>
          <Ionicons name="analytics-outline" size={16} color="#0D9488" /> Tổng
          hợp đánh giá NCC
        </Text>

        {SUPPLIERS.map((s) => {
          const totalMaterials = Object.keys(s.prices).length;
          const avgPrice =
            Object.values(s.prices).reduce((a, b) => a + b, 0) / totalMaterials;
          const lowestCount = MATERIALS.filter(
            (m) => findLowestPrice(m.id) === s.id,
          ).length;

          return (
            <View key={s.id} style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View
                  style={[styles.summaryDot, { backgroundColor: s.color }]}
                />
                <Text style={styles.summaryName}>{s.name}</Text>
                <View style={styles.summaryRating}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.summaryRatingText}>{s.rating}</Text>
                </View>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatValue}>{totalMaterials}</Text>
                  <Text style={styles.summaryStatLabel}>Mặt hàng</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatValue}>{lowestCount}</Text>
                  <Text style={styles.summaryStatLabel}>Giá thấp nhất</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatValue}>{s.deliveryTime}</Text>
                  <Text style={styles.summaryStatLabel}>Giao hàng</Text>
                </View>
              </View>
              <Pressable
                style={[styles.selectBtn, { borderColor: s.color }]}
                onPress={() => handleSelectSupplier(s.id)}
              >
                <Text style={[styles.selectBtnText, { color: s.color }]}>
                  Chọn {s.code}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
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

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F0FDFA",
    borderBottomWidth: 1,
    borderBottomColor: "#CCFBF1",
  },
  infoText: { fontSize: 12, color: "#0D9488", fontWeight: "500", flex: 1 },

  supplierPills: { maxHeight: 80, backgroundColor: "#fff" },
  supplierPillsContent: { padding: 12, gap: 8 },
  supplierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  supplierDot: { width: 10, height: 10, borderRadius: 5 },
  supplierPillName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  supplierMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  supplierRating: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  supplierDelivery: { fontSize: 11, color: "#94A3B8" },

  categoryBar: {
    maxHeight: 48,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  categoryBarContent: { paddingHorizontal: 12, alignItems: "center", gap: 6 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    marginRight: 6,
  },
  categoryChipActive: { backgroundColor: "#0D9488" },
  categoryChipText: { fontSize: 12, fontWeight: "500", color: "#64748B" },
  categoryChipTextActive: { color: "#fff" },

  body: { flex: 1 },

  // Table
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#1E293B",
  },
  thCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  tableRowAlt: { backgroundColor: "#F8FAFC" },
  tdCell: { fontSize: 12, color: "#475569" },
  tdName: { fontWeight: "600", color: "#1E293B" },
  tdPriceWrap: { alignItems: "center" },
  tdPrice: { fontSize: 11, color: "#475569", textAlign: "center" },
  tdPriceLowest: { color: "#10B981", fontWeight: "700" },
  lowestBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  lowestBadgeText: { fontSize: 8, color: "#059669", fontWeight: "700" },
  tdUnit: { textAlign: "center", color: "#94A3B8", fontSize: 11 },

  // Summary
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
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
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  summaryDot: { width: 12, height: 12, borderRadius: 6 },
  summaryName: { fontSize: 14, fontWeight: "700", color: "#1E293B", flex: 1 },
  summaryRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  summaryRatingText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  summaryStats: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    borderRadius: 8,
  },
  summaryStatValue: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  summaryStatLabel: { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  selectBtn: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  selectBtnText: { fontSize: 13, fontWeight: "700" },
});
