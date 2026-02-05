/**
 * Structure Calculator - Tính toán Kết cấu
 * Foundation, columns, beams, slabs, roof structural calculations
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

// Foundation types
const FOUNDATION_TYPES = [
  {
    id: "don",
    label: "Móng đơn",
    icon: "🧱",
    factor: 1.0,
    desc: "Đất cứng, tải nhẹ",
  },
  {
    id: "bang",
    label: "Móng băng",
    icon: "📐",
    factor: 1.3,
    desc: "Đất trung bình",
  },
  {
    id: "be",
    label: "Móng bè",
    icon: "🏗️",
    factor: 1.8,
    desc: "Đất yếu, nhà cao",
  },
  {
    id: "coc",
    label: "Móng cọc",
    icon: "📍",
    factor: 2.5,
    desc: "Đất rất yếu",
  },
];

// Default unit rates (editable)
const DEFAULT_RATES = {
  // Foundation
  foundationConcrete: { label: "Bê tông móng (m³)", rate: 2800000, unit: "m³" },
  foundationSteel: { label: "Thép móng (kg)", rate: 18000, unit: "kg" },
  foundationFormwork: { label: "Cốp pha móng (m²)", rate: 150000, unit: "m²" },

  // Column
  columnConcrete: { label: "Bê tông cột (m³)", rate: 3000000, unit: "m³" },
  columnSteel: { label: "Thép cột (kg)", rate: 20000, unit: "kg" },
  columnFormwork: { label: "Cốp pha cột (m²)", rate: 180000, unit: "m²" },

  // Beam
  beamConcrete: { label: "Bê tông dầm (m³)", rate: 2900000, unit: "m³" },
  beamSteel: { label: "Thép dầm (kg)", rate: 19000, unit: "kg" },
  beamFormwork: { label: "Cốp pha dầm (m²)", rate: 170000, unit: "m²" },

  // Slab
  slabConcrete: { label: "Bê tông sàn (m³)", rate: 2700000, unit: "m³" },
  slabSteel: { label: "Thép sàn (kg)", rate: 17000, unit: "kg" },
  slabFormwork: { label: "Cốp pha sàn (m²)", rate: 140000, unit: "m²" },

  // Roof
  roofFrame: { label: "Khung mái thép (m²)", rate: 450000, unit: "m²" },
  roofTile: { label: "Ngói/Tôn lợp (m²)", rate: 180000, unit: "m²" },

  // Wall
  wallBrick: { label: "Xây tường gạch (m²)", rate: 280000, unit: "m²" },

  // Labor
  laborRate: { label: "Nhân công (ngày)", rate: 350000, unit: "ngày" },
};

interface RateValue {
  label: string;
  rate: number;
  unit: string;
}

interface Rates {
  [key: string]: RateValue;
}

// Structure calculation formulas
const FORMULAS = {
  foundation: {
    title: "Công thức tính móng",
    items: [
      "V_bêtông = (S_móng × H) × Hệ_số_móng",
      "Thép_móng ≈ V_bêtông × 80-120 kg/m³",
      "Cốp_pha ≈ S_móng × 2.5 m²/m² sàn",
    ],
  },
  column: {
    title: "Công thức tính cột",
    items: [
      "Số_cột = (S_sàn / 25-40 m²) × Số_tầng",
      "V_cột = Số_cột × (0.25×0.25×3.5)",
      "Thép_cột ≈ V_cột × 180-220 kg/m³",
    ],
  },
  beam: {
    title: "Công thức tính dầm",
    items: [
      "Chiều_dài = Chu_vi + Dầm_phụ",
      "V_dầm = L × (0.22×0.4) × Số_tầng",
      "Thép_dầm ≈ V_dầm × 130-160 kg/m³",
    ],
  },
  slab: {
    title: "Công thức tính sàn",
    items: [
      "V_sàn = S_sàn × 0.10-0.12 m × Số_tầng",
      "Thép_sàn ≈ V_sàn × 80-100 kg/m³",
      "Cốp_pha = S_sàn × Số_tầng m²",
    ],
  },
};

export default function StructureCalculatorScreen() {
  const insets = useSafeAreaInsets();

  // Basic inputs
  const [floorArea, setFloorArea] = useState("");
  const [numFloors, setNumFloors] = useState("3");
  const [floorHeight, setFloorHeight] = useState("3.5");
  const [foundationType, setFoundationType] = useState("bang");

  // Custom rates
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [showRatesEditor, setShowRatesEditor] = useState(false);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState("");

  // Active section
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Show results
  const [showResults, setShowResults] = useState(false);

  // Calculations
  const calculations = useMemo(() => {
    const area = parseFloat(floorArea) || 0;
    const floors = parseInt(numFloors) || 1;
    const height = parseFloat(floorHeight) || 3.5;
    const foundationData = FOUNDATION_TYPES.find(
      (f) => f.id === foundationType,
    );
    const foundationFactor = foundationData?.factor || 1.0;

    // Total construction area
    const totalArea = area * floors;
    const perimeter = Math.sqrt(area) * 4; // Approximate

    // Foundation calculations
    const foundationThickness = 0.4; // m
    const foundationConcreteVol = area * foundationThickness * foundationFactor;
    const foundationSteelKg = foundationConcreteVol * 100; // ~100 kg/m³
    const foundationFormworkArea = area * 2.5;

    // Column calculations
    const columnsPerFloor = Math.ceil(area / 30); // 1 column per 30m²
    const totalColumns = columnsPerFloor;
    const columnSection = 0.25 * 0.25; // 25x25cm
    const columnHeight = height * floors;
    const columnConcreteVol = totalColumns * columnSection * columnHeight;
    const columnSteelKg = columnConcreteVol * 200; // ~200 kg/m³
    const columnFormworkArea = totalColumns * 0.25 * 4 * columnHeight;

    // Beam calculations
    const beamLength = perimeter + perimeter * 0.5 * floors; // Main + secondary
    const beamSection = 0.22 * 0.4; // 22x40cm
    const beamConcreteVol = beamLength * beamSection;
    const beamSteelKg = beamConcreteVol * 150; // ~150 kg/m³
    const beamFormworkArea = beamLength * (0.4 * 2 + 0.22);

    // Slab calculations
    const slabThickness = 0.1; // 10cm
    const slabConcreteVol = totalArea * slabThickness;
    const slabSteelKg = slabConcreteVol * 90; // ~90 kg/m³
    const slabFormworkArea = totalArea;

    // Roof calculations (last floor)
    const roofArea = area * 1.2; // Pitch factor

    // Wall calculations
    const wallHeight = height * floors;
    const wallLength = perimeter + perimeter * 0.3; // External + internal
    const wallArea = wallLength * wallHeight;

    // Calculate costs
    const foundationCost =
      foundationConcreteVol * rates.foundationConcrete.rate +
      foundationSteelKg * rates.foundationSteel.rate +
      foundationFormworkArea * rates.foundationFormwork.rate;

    const columnCost =
      columnConcreteVol * rates.columnConcrete.rate +
      columnSteelKg * rates.columnSteel.rate +
      columnFormworkArea * rates.columnFormwork.rate;

    const beamCost =
      beamConcreteVol * rates.beamConcrete.rate +
      beamSteelKg * rates.beamSteel.rate +
      beamFormworkArea * rates.beamFormwork.rate;

    const slabCost =
      slabConcreteVol * rates.slabConcrete.rate +
      slabSteelKg * rates.slabSteel.rate +
      slabFormworkArea * rates.slabFormwork.rate;

    const roofCost =
      roofArea * rates.roofFrame.rate + roofArea * rates.roofTile.rate;

    const wallCost = wallArea * rates.wallBrick.rate;

    // Labor (rough estimate: 30% of material cost)
    const materialTotal =
      foundationCost + columnCost + beamCost + slabCost + roofCost + wallCost;
    const laborDays = Math.ceil(totalArea * 0.5); // ~0.5 day per m²
    const laborCost = laborDays * rates.laborRate.rate;

    const totalCost = materialTotal + laborCost;

    return {
      area,
      floors,
      height,
      totalArea,
      perimeter,
      // Foundation
      foundationConcreteVol,
      foundationSteelKg,
      foundationFormworkArea,
      foundationCost,
      // Columns
      totalColumns,
      columnConcreteVol,
      columnSteelKg,
      columnFormworkArea,
      columnCost,
      // Beams
      beamLength,
      beamConcreteVol,
      beamSteelKg,
      beamFormworkArea,
      beamCost,
      // Slabs
      slabConcreteVol,
      slabSteelKg,
      slabFormworkArea,
      slabCost,
      // Roof
      roofArea,
      roofCost,
      // Walls
      wallArea,
      wallCost,
      // Labor
      laborDays,
      laborCost,
      // Totals
      materialTotal,
      totalCost,
      costPerM2: totalArea > 0 ? totalCost / totalArea : 0,
    };
  }, [floorArea, numFloors, floorHeight, foundationType, rates]);

  const handleBack = useCallback(() => router.back(), []);

  const handleCalculate = useCallback(() => {
    if (!floorArea || parseFloat(floorArea) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập diện tích sàn hợp lệ");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResults(true);
  }, [floorArea]);

  const handleUpdateRate = useCallback((key: string, newRate: number) => {
    setRates((prev) => ({
      ...prev,
      [key]: { ...prev[key], rate: newRate },
    }));
  }, []);

  const handleResetRates = useCallback(() => {
    Alert.alert("Đặt lại", "Bạn có muốn đặt lại đơn giá về mặc định?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đặt lại", onPress: () => setRates(DEFAULT_RATES) },
    ]);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return `${amount.toLocaleString("vi-VN")} đ`;
  };

  const formatNumber = (num: number, decimals = 1) => {
    return num.toFixed(decimals).replace(/\.0$/, "");
  };

  const renderFormulaSection = (key: keyof typeof FORMULAS) => {
    const formula = FORMULAS[key];
    return (
      <TouchableOpacity
        style={[
          styles.formulaCard,
          activeSection === key && styles.formulaCardActive,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveSection(activeSection === key ? null : key);
        }}
      >
        <View style={styles.formulaHeader}>
          <Text style={styles.formulaTitle}>{formula.title}</Text>
          <Ionicons
            name={activeSection === key ? "chevron-up" : "chevron-down"}
            size={20}
            color={MODERN_COLORS.textSecondary}
          />
        </View>
        {activeSection === key && (
          <View style={styles.formulaContent}>
            {formula.items.map((item, index) => (
              <View key={index} style={styles.formulaRow}>
                <Text style={styles.formulaBullet}>•</Text>
                <Text style={styles.formulaText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🧱 Tính toán Kết cấu</Text>
          <Text style={styles.headerSubtitle}>Móng, cột, dầm, sàn, mái</Text>
        </View>
        <TouchableOpacity
          style={styles.ratesBtn}
          onPress={() => setShowRatesEditor(!showRatesEditor)}
        >
          <Ionicons
            name={showRatesEditor ? "pricetag" : "pricetag-outline"}
            size={22}
            color={MODERN_COLORS.primary}
          />
        </TouchableOpacity>
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
          {/* Basic Inputs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông số công trình</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Diện tích sàn (m²)</Text>
                <TextInput
                  style={styles.input}
                  value={floorArea}
                  onChangeText={setFloorArea}
                  placeholder="VD: 80"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Số tầng</Text>
                <TextInput
                  style={styles.input}
                  value={numFloors}
                  onChangeText={setNumFloors}
                  placeholder="3"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputItemFull}>
                <Text style={styles.inputLabel}>Chiều cao tầng (m)</Text>
                <TextInput
                  style={styles.input}
                  value={floorHeight}
                  onChangeText={setFloorHeight}
                  placeholder="3.5"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Foundation Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại móng</Text>
            <View style={styles.foundationGrid}>
              {FOUNDATION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.foundationCard,
                    foundationType === type.id && styles.foundationCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFoundationType(type.id);
                  }}
                >
                  <Text style={styles.foundationIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.foundationLabel,
                      foundationType === type.id &&
                        styles.foundationLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.foundationDesc}>{type.desc}</Text>
                  <Text style={styles.foundationFactor}>x{type.factor}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Formulas Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📐 Công thức tính toán</Text>
            {renderFormulaSection("foundation")}
            {renderFormulaSection("column")}
            {renderFormulaSection("beam")}
            {renderFormulaSection("slab")}
          </View>

          {/* Rates Editor */}
          {showRatesEditor && (
            <View style={styles.section}>
              <View style={styles.ratesHeader}>
                <Text style={styles.sectionTitle}>💰 Đơn giá vật tư</Text>
                <TouchableOpacity onPress={handleResetRates}>
                  <Text style={styles.resetText}>Đặt lại</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.ratesGrid}>
                {Object.entries(rates).map(([key, value]) => (
                  <View key={key} style={styles.rateItem}>
                    <Text style={styles.rateLabel} numberOfLines={1}>
                      {value.label}
                    </Text>
                    <View style={styles.rateInputRow}>
                      <TextInput
                        style={styles.rateInput}
                        value={value.rate.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text.replace(/\D/g, "")) || 0;
                          handleUpdateRate(key, num);
                        }}
                        keyboardType="number-pad"
                      />
                      <Text style={styles.rateUnit}>đ/{value.unit}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
          >
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính toán kết cấu</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Results */}
          {showResults && calculations.totalArea > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>
                📊 Bảng khối lượng & Chi phí
              </Text>

              {/* Summary Info */}
              <View style={styles.summaryInfo}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Tổng DT sàn</Text>
                  <Text style={styles.summaryValue}>
                    {formatNumber(calculations.totalArea)} m²
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Chu vi</Text>
                  <Text style={styles.summaryValue}>
                    ~{formatNumber(calculations.perimeter)} m
                  </Text>
                </View>
              </View>

              {/* Foundation */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>🧱 Móng</Text>
                  <Text style={styles.resultCardTotal}>
                    {formatCurrency(calculations.foundationCost)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bê tông</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.foundationConcreteVol)} m³
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Thép</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.foundationSteelKg, 0)} kg
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Cốp pha</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.foundationFormworkArea)} m²
                  </Text>
                </View>
              </View>

              {/* Columns */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>
                    🏛️ Cột ({calculations.totalColumns} cột)
                  </Text>
                  <Text style={styles.resultCardTotal}>
                    {formatCurrency(calculations.columnCost)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bê tông</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.columnConcreteVol)} m³
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Thép</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.columnSteelKg, 0)} kg
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Cốp pha</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.columnFormworkArea)} m²
                  </Text>
                </View>
              </View>

              {/* Beams */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>
                    📐 Dầm ({formatNumber(calculations.beamLength, 0)}m)
                  </Text>
                  <Text style={styles.resultCardTotal}>
                    {formatCurrency(calculations.beamCost)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bê tông</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.beamConcreteVol)} m³
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Thép</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.beamSteelKg, 0)} kg
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Cốp pha</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.beamFormworkArea)} m²
                  </Text>
                </View>
              </View>

              {/* Slabs */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>
                    🏢 Sàn ({formatNumber(calculations.totalArea)} m²)
                  </Text>
                  <Text style={styles.resultCardTotal}>
                    {formatCurrency(calculations.slabCost)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Bê tông</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.slabConcreteVol)} m³
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Thép</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.slabSteelKg, 0)} kg
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Cốp pha</Text>
                  <Text style={styles.resultQty}>
                    {formatNumber(calculations.slabFormworkArea)} m²
                  </Text>
                </View>
              </View>

              {/* Roof */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>
                    🏠 Mái ({formatNumber(calculations.roofArea)} m²)
                  </Text>
                  <Text style={styles.resultCardTotal}>
                    {formatCurrency(calculations.roofCost)}
                  </Text>
                </View>
              </View>

              {/* Walls */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>
                    🧱 Tường ({formatNumber(calculations.wallArea)} m²)
                  </Text>
                  <Text style={styles.resultCardTotal}>
                    {formatCurrency(calculations.wallCost)}
                  </Text>
                </View>
              </View>

              {/* Labor */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>
                    👷 Nhân công ({calculations.laborDays} ngày)
                  </Text>
                  <Text style={styles.resultCardTotal}>
                    {formatCurrency(calculations.laborCost)}
                  </Text>
                </View>
              </View>

              {/* Grand Total */}
              <View style={styles.grandTotalCard}>
                <LinearGradient
                  colors={["#f59e0b", "#d97706"]}
                  style={styles.grandTotalGradient}
                >
                  <Text style={styles.grandTotalLabel}>
                    TỔNG CHI PHÍ KẾT CẤU
                  </Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(calculations.totalCost)}
                  </Text>
                  <Text style={styles.grandTotalMeta}>
                    Đơn giá: {formatCurrency(calculations.costPerM2)}/m² sàn XD
                  </Text>
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
  ratesBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.primaryLight,
    borderRadius: MODERN_RADIUS.md,
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

  // Input Grid
  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: MODERN_SPACING.sm },
  inputItem: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
  },
  inputItemFull: { width: "100%" },
  inputLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  // Foundation
  foundationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  foundationCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...MODERN_SHADOWS.sm,
  },
  foundationCardActive: { borderColor: "#f59e0b", backgroundColor: "#fef3c7" },
  foundationIcon: { fontSize: 28, marginBottom: 6 },
  foundationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  foundationLabelActive: { color: "#d97706" },
  foundationDesc: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  foundationFactor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f59e0b",
    marginTop: 6,
  },

  // Formula
  formulaCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  formulaCardActive: { borderWidth: 1, borderColor: MODERN_COLORS.primary },
  formulaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formulaTitle: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  formulaContent: {
    marginTop: MODERN_SPACING.sm,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  formulaRow: { flexDirection: "row", marginBottom: 4 },
  formulaBullet: { width: 16, fontSize: 12, color: MODERN_COLORS.primary },
  formulaText: {
    flex: 1,
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  // Rates Editor
  ratesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  resetText: { fontSize: 13, color: MODERN_COLORS.primary, fontWeight: "600" },
  ratesGrid: { gap: MODERN_SPACING.sm },
  rateItem: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rateLabel: { flex: 1, fontSize: 13, color: MODERN_COLORS.text },
  rateInputRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rateInput: {
    width: 90,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    textAlign: "right",
  },
  rateUnit: { fontSize: 11, color: MODERN_COLORS.textSecondary, width: 50 },

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
  summaryInfo: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 12, color: MODERN_COLORS.textSecondary },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginTop: 4,
  },

  resultCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  resultCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
    paddingBottom: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  resultCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  resultCardTotal: { fontSize: 14, fontWeight: "700", color: "#f59e0b" },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  resultLabel: { fontSize: 13, color: MODERN_COLORS.textSecondary },
  resultQty: { fontSize: 13, fontWeight: "600", color: MODERN_COLORS.text },

  grandTotalCard: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    marginTop: MODERN_SPACING.md,
    ...MODERN_SHADOWS.lg,
  },
  grandTotalGradient: { padding: MODERN_SPACING.lg, alignItems: "center" },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  grandTotalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  grandTotalMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
});
