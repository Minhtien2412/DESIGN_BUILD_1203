/**
 * Steel Calculator - Tính nhanh Thép
 * Quick steel weight and cost calculation
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Steel types and specifications
const STEEL_TYPES = [
  { id: "round", icon: "⚫", label: "Thép tròn", desc: "Thép xây dựng" },
  { id: "pipe", icon: "⭕", label: "Ống thép", desc: "Ống hộp, ống tròn" },
  { id: "sheet", icon: "▬", label: "Thép tấm", desc: "Tấm, cuộn" },
  { id: "angle", icon: "∟", label: "Thép hình", desc: "V, U, I, H" },
];

// Round bar specifications
const ROUND_BARS = [
  { id: "d6", name: "Φ6", diameter: 6, kgPerM: 0.222, pricePerKg: 17000 },
  { id: "d8", name: "Φ8", diameter: 8, kgPerM: 0.395, pricePerKg: 17000 },
  { id: "d10", name: "Φ10", diameter: 10, kgPerM: 0.617, pricePerKg: 16500 },
  { id: "d12", name: "Φ12", diameter: 12, kgPerM: 0.888, pricePerKg: 16500 },
  { id: "d14", name: "Φ14", diameter: 14, kgPerM: 1.21, pricePerKg: 16000 },
  { id: "d16", name: "Φ16", diameter: 16, kgPerM: 1.58, pricePerKg: 16000 },
  { id: "d18", name: "Φ18", diameter: 18, kgPerM: 2.0, pricePerKg: 15500 },
  { id: "d20", name: "Φ20", diameter: 20, kgPerM: 2.47, pricePerKg: 15500 },
  { id: "d22", name: "Φ22", diameter: 22, kgPerM: 2.98, pricePerKg: 15500 },
  { id: "d25", name: "Φ25", diameter: 25, kgPerM: 3.85, pricePerKg: 15500 },
  { id: "d28", name: "Φ28", diameter: 28, kgPerM: 4.83, pricePerKg: 15500 },
  { id: "d32", name: "Φ32", diameter: 32, kgPerM: 6.31, pricePerKg: 15500 },
];

// Steel pipes
const STEEL_PIPES = [
  {
    id: "p21",
    name: "Φ21 (DN15)",
    outer: 21.3,
    thickness: 2.8,
    kgPerM: 1.27,
    pricePerKg: 18000,
  },
  {
    id: "p27",
    name: "Φ27 (DN20)",
    outer: 26.9,
    thickness: 2.9,
    kgPerM: 1.68,
    pricePerKg: 18000,
  },
  {
    id: "p34",
    name: "Φ34 (DN25)",
    outer: 33.7,
    thickness: 3.4,
    kgPerM: 2.5,
    pricePerKg: 18000,
  },
  {
    id: "p42",
    name: "Φ42 (DN32)",
    outer: 42.4,
    thickness: 3.6,
    kgPerM: 3.39,
    pricePerKg: 17500,
  },
  {
    id: "p48",
    name: "Φ48 (DN40)",
    outer: 48.3,
    thickness: 3.7,
    kgPerM: 4.05,
    pricePerKg: 17500,
  },
  {
    id: "p60",
    name: "Φ60 (DN50)",
    outer: 60.3,
    thickness: 4.0,
    kgPerM: 5.44,
    pricePerKg: 17000,
  },
];

// Square/Rectangular tubes
const STEEL_TUBES = [
  { id: "t20x20", name: "20×20×1.2", kgPerM: 0.72, pricePerKg: 19000 },
  { id: "t25x25", name: "25×25×1.4", kgPerM: 1.05, pricePerKg: 19000 },
  { id: "t30x30", name: "30×30×1.4", kgPerM: 1.27, pricePerKg: 18500 },
  { id: "t40x40", name: "40×40×1.4", kgPerM: 1.69, pricePerKg: 18500 },
  { id: "t50x50", name: "50×50×2.0", kgPerM: 2.91, pricePerKg: 18000 },
  { id: "t60x60", name: "60×60×2.3", kgPerM: 4.03, pricePerKg: 18000 },
  { id: "t30x60", name: "30×60×2.0", kgPerM: 2.65, pricePerKg: 18000 },
  { id: "t40x80", name: "40×80×2.0", kgPerM: 3.56, pricePerKg: 18000 },
];

// Steel sheet
const STEEL_SHEETS = [
  {
    id: "s0.5",
    name: "Dày 0.5mm",
    thickness: 0.5,
    kgPerM2: 3.93,
    pricePerKg: 20000,
  },
  {
    id: "s0.8",
    name: "Dày 0.8mm",
    thickness: 0.8,
    kgPerM2: 6.28,
    pricePerKg: 20000,
  },
  {
    id: "s1.0",
    name: "Dày 1.0mm",
    thickness: 1.0,
    kgPerM2: 7.85,
    pricePerKg: 19500,
  },
  {
    id: "s1.2",
    name: "Dày 1.2mm",
    thickness: 1.2,
    kgPerM2: 9.42,
    pricePerKg: 19500,
  },
  {
    id: "s1.5",
    name: "Dày 1.5mm",
    thickness: 1.5,
    kgPerM2: 11.78,
    pricePerKg: 19000,
  },
  {
    id: "s2.0",
    name: "Dày 2.0mm",
    thickness: 2.0,
    kgPerM2: 15.7,
    pricePerKg: 18500,
  },
  {
    id: "s3.0",
    name: "Dày 3.0mm",
    thickness: 3.0,
    kgPerM2: 23.55,
    pricePerKg: 18000,
  },
  {
    id: "s4.0",
    name: "Dày 4.0mm",
    thickness: 4.0,
    kgPerM2: 31.4,
    pricePerKg: 17500,
  },
];

// Steel angles
const STEEL_ANGLES = [
  { id: "v25", name: "V25×25×3", kgPerM: 1.12, pricePerKg: 18000 },
  { id: "v30", name: "V30×30×3", kgPerM: 1.36, pricePerKg: 18000 },
  { id: "v40", name: "V40×40×4", kgPerM: 2.42, pricePerKg: 17500 },
  { id: "v50", name: "V50×50×5", kgPerM: 3.77, pricePerKg: 17500 },
  { id: "v63", name: "V63×63×6", kgPerM: 5.72, pricePerKg: 17000 },
  { id: "v75", name: "V75×75×8", kgPerM: 8.92, pricePerKg: 17000 },
];

type SteelType = "round" | "pipe" | "sheet" | "angle";

interface SteelEntry {
  id: string;
  name: string;
  length: string;
  quantity: string;
  kgPerUnit: number;
  pricePerKg: number;
  unit: string;
}

export default function SteelCalculatorScreen() {
  const insets = useSafeAreaInsets();

  // Steel type
  const [steelType, setSteelType] = useState<SteelType>("round");

  // Entries
  const [entries, setEntries] = useState<SteelEntry[]>([]);

  // Show results
  const [showResults, setShowResults] = useState(false);

  // Get specs for current type
  const getSpecs = useCallback(() => {
    switch (steelType) {
      case "round":
        return ROUND_BARS;
      case "pipe":
        return [...STEEL_PIPES, ...STEEL_TUBES];
      case "sheet":
        return STEEL_SHEETS;
      case "angle":
        return STEEL_ANGLES;
      default:
        return [];
    }
  }, [steelType]);

  // Calculations
  const calculations = useMemo(() => {
    let totalWeight = 0;
    let totalCost = 0;

    const items = entries.map((entry) => {
      const length = parseFloat(entry.length) || 0;
      const qty = parseInt(entry.quantity) || 1;
      const weight = length * qty * entry.kgPerUnit;
      const cost = weight * entry.pricePerKg;

      totalWeight += weight;
      totalCost += cost;

      return { ...entry, weight, cost };
    });

    return { items, totalWeight, totalCost };
  }, [entries]);

  const handleBack = useCallback(() => router.back(), []);

  const handleAddItem = useCallback(
    (spec: any) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const unit = steelType === "sheet" ? "m²" : "m";
      const kgPerUnit = steelType === "sheet" ? spec.kgPerM2 : spec.kgPerM;

      setEntries((prev) => [
        ...prev,
        {
          id: `${spec.id}-${Date.now()}`,
          name: spec.name,
          length: "",
          quantity: "1",
          kgPerUnit,
          pricePerKg: spec.pricePerKg,
          unit,
        },
      ]);
    },
    [steelType],
  );

  const handleUpdateEntry = useCallback(
    (index: number, field: keyof SteelEntry, value: any) => {
      setEntries((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    [],
  );

  const handleRemoveEntry = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert("Xóa tất cả", "Bạn có chắc muốn xóa tất cả các mục?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", onPress: () => setEntries([]), style: "destructive" },
    ]);
  }, []);

  const handleCalculate = useCallback(() => {
    if (entries.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất 1 mục thép");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResults(true);
  }, [entries]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)} triệu`;
    }
    return `${amount.toLocaleString("vi-VN")} đ`;
  };

  const specs = getSpecs();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🔩 Tính Thép</Text>
          <Text style={styles.headerSubtitle}>Khối lượng & Chi phí</Text>
        </View>
        {entries.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Ionicons
              name="trash-outline"
              size={20}
              color={MODERN_COLORS.error}
            />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Steel Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại thép</Text>
            <View style={styles.typeGrid}>
              {STEEL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    steelType === type.id && styles.typeCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSteelType(type.id as SteelType);
                  }}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      steelType === type.id && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.typeDesc}>{type.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Specs Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn quy cách</Text>
            <View style={styles.specGrid}>
              {specs.map((spec) => (
                <TouchableOpacity
                  key={spec.id}
                  style={styles.specCard}
                  onPress={() => handleAddItem(spec)}
                >
                  <Text style={styles.specName}>{spec.name}</Text>
                  <Text style={styles.specWeight}>
                    {steelType === "sheet"
                      ? `${(spec as any).kgPerM2} kg/m²`
                      : `${(spec as any).kgPerM} kg/m`}
                  </Text>
                  <Text style={styles.specPrice}>
                    {((spec as any).pricePerKg / 1000).toFixed(0)}k/kg
                  </Text>
                  <Ionicons
                    name="add-circle"
                    size={20}
                    color="#0D9488"
                    style={styles.specAddIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Entries List */}
          {entries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Danh sách tính ({entries.length})
              </Text>
              {entries.map((entry, index) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryName}>{entry.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveEntry(index)}>
                      <Ionicons
                        name="close-circle"
                        size={22}
                        color={MODERN_COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.entryInputs}>
                    <View style={styles.entryInputItem}>
                      <Text style={styles.entryLabel}>
                        {steelType === "sheet" ? "Diện tích" : "Chiều dài"}
                      </Text>
                      <View style={styles.entryInputRow}>
                        <TextInput
                          style={styles.entryInput}
                          value={entry.length}
                          onChangeText={(text) =>
                            handleUpdateEntry(index, "length", text)
                          }
                          placeholder="0"
                          placeholderTextColor={MODERN_COLORS.textTertiary}
                          keyboardType="decimal-pad"
                        />
                        <Text style={styles.entryUnit}>{entry.unit}</Text>
                      </View>
                    </View>
                    <View style={styles.entryInputItem}>
                      <Text style={styles.entryLabel}>Số lượng</Text>
                      <View style={styles.entryInputRow}>
                        <TextInput
                          style={styles.entryInput}
                          value={entry.quantity}
                          onChangeText={(text) =>
                            handleUpdateEntry(index, "quantity", text)
                          }
                          placeholder="1"
                          placeholderTextColor={MODERN_COLORS.textTertiary}
                          keyboardType="number-pad"
                        />
                        <Text style={styles.entryUnit}>cây</Text>
                      </View>
                    </View>
                    <View style={styles.entryInputItem}>
                      <Text style={styles.entryLabel}>Đơn giá</Text>
                      <View style={styles.entryInputRow}>
                        <TextInput
                          style={styles.entryInput}
                          value={entry.pricePerKg.toString()}
                          onChangeText={(text) =>
                            handleUpdateEntry(
                              index,
                              "pricePerKg",
                              parseInt(text) || 0,
                            )
                          }
                          keyboardType="number-pad"
                        />
                        <Text style={styles.entryUnit}>đ/kg</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quick Summary */}
          {calculations.totalWeight > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng khối lượng</Text>
                <Text style={styles.summaryValue}>
                  {calculations.totalWeight.toFixed(2)} kg
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ước tính chi phí</Text>
                <Text style={styles.summaryTotal}>
                  {formatCurrency(calculations.totalCost)}
                </Text>
              </View>
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
          >
            <LinearGradient
              colors={["#0D9488", "#0D9488"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính toán chi tiết</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Results */}
          {showResults && calculations.items.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>📊 Bảng khối lượng thép</Text>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Quy cách</Text>
                <Text style={styles.tableCell}>Dài/DT</Text>
                <Text style={styles.tableCell}>SL</Text>
                <Text style={styles.tableCell}>KL (kg)</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  Thành tiền
                </Text>
              </View>

              {/* Table Rows */}
              {calculations.items.map((item, index) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text
                    style={[styles.tableCellText, { flex: 2 }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.tableCellText}>
                    {parseFloat(item.length) || 0}
                  </Text>
                  <Text style={styles.tableCellText}>{item.quantity}</Text>
                  <Text style={styles.tableCellText}>
                    {item.weight.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.5 }]}>
                    {formatCurrency(item.cost)}
                  </Text>
                </View>
              ))}

              {/* Total Row */}
              <View style={styles.tableTotalRow}>
                <Text style={[styles.tableTotalLabel, { flex: 2 }]}>TỔNG</Text>
                <Text style={styles.tableTotalLabel}></Text>
                <Text style={styles.tableTotalLabel}></Text>
                <Text style={styles.tableTotalValue}>
                  {calculations.totalWeight.toFixed(1)} kg
                </Text>
                <Text style={[styles.tableTotalValue, { flex: 1.5 }]}>
                  {formatCurrency(calculations.totalCost)}
                </Text>
              </View>

              {/* Grand Total */}
              <View style={styles.grandTotalCard}>
                <LinearGradient
                  colors={["#0D9488", "#0D9488"]}
                  style={styles.grandTotalGradient}
                >
                  <View style={styles.grandTotalRow}>
                    <View>
                      <Text style={styles.grandTotalLabel}>
                        Tổng khối lượng
                      </Text>
                      <Text style={styles.grandTotalWeight}>
                        {calculations.totalWeight.toFixed(2)} kg
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.grandTotalLabel}>Tổng chi phí</Text>
                      <Text style={styles.grandTotalValue}>
                        {formatCurrency(calculations.totalCost)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MODERN_COLORS.background },
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, marginLeft: MODERN_SPACING.sm },
  headerTitle: { fontSize: 18, fontWeight: "700", color: MODERN_COLORS.text },
  headerSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  clearBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: MODERN_SPACING.md },

  section: { marginBottom: MODERN_SPACING.lg },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },

  // Type Grid
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: MODERN_SPACING.sm },
  typeCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...MODERN_SHADOWS.sm,
  },
  typeCardActive: { borderColor: "#0D9488", backgroundColor: "#CCFBF1" },
  typeIcon: { fontSize: 24, marginBottom: 6 },
  typeLabel: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  typeLabelActive: { color: "#0D9488" },
  typeDesc: { fontSize: 10, color: MODERN_COLORS.textSecondary, marginTop: 4 },

  // Spec Grid
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: MODERN_SPACING.sm },
  specCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 2) / 3,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    position: "relative",
    ...MODERN_SHADOWS.sm,
  },
  specName: { fontSize: 13, fontWeight: "600", color: MODERN_COLORS.text },
  specWeight: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  specPrice: { fontSize: 10, color: "#0D9488", marginTop: 2 },
  specAddIcon: { position: "absolute", top: 4, right: 4 },

  // Entry Card
  entryCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  entryName: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  entryInputs: { flexDirection: "row", gap: MODERN_SPACING.sm },
  entryInputItem: { flex: 1 },
  entryLabel: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 4,
  },
  entryInputRow: { flexDirection: "row", alignItems: "center" },
  entryInput: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  entryUnit: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginLeft: 4,
    width: 30,
  },

  // Summary
  summaryCard: {
    backgroundColor: "#CCFBF1",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 14, color: "#0F766E" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#0F766E" },
  summaryTotal: { fontSize: 16, fontWeight: "700", color: "#0D9488" },

  // Calculate Button
  calculateBtn: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    marginBottom: MODERN_SPACING.lg,
  },
  calculateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  calculateText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Results
  resultsSection: { marginTop: MODERN_SPACING.md },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.md,
  },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#CCFBF1",
    borderRadius: MODERN_RADIUS.sm,
    paddingVertical: 10,
    paddingHorizontal: MODERN_SPACING.sm,
    marginBottom: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#0F766E",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  tableCellText: {
    flex: 1,
    fontSize: 12,
    color: MODERN_COLORS.text,
    textAlign: "center",
  },
  tableTotalRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.sm,
    marginTop: 4,
  },
  tableTotalLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    textAlign: "center",
  },
  tableTotalValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0D9488",
    textAlign: "center",
  },

  // Grand Total
  grandTotalCard: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    marginTop: MODERN_SPACING.md,
    ...MODERN_SHADOWS.lg,
  },
  grandTotalGradient: { padding: MODERN_SPACING.lg },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotalLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  grandTotalWeight: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
});
