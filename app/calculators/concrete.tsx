/**
 * Concrete Calculator - Tính nhanh Bê tông
 * Quick concrete volume and material calculation
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

// Calculation modes
const CALC_MODES = [
  { id: "slab", icon: "🏠", label: "Sàn/Đáy", desc: "Dài × Rộng × Dày" },
  { id: "column", icon: "🏛️", label: "Cột", desc: "Cạnh × Cạnh × Cao × SL" },
  { id: "beam", icon: "📐", label: "Dầm", desc: "Rộng × Cao × Dài" },
  { id: "foundation", icon: "🧱", label: "Móng", desc: "Dài × Rộng × Dày" },
];

// Concrete grades with mix ratios
const CONCRETE_GRADES = [
  {
    id: "M150",
    name: "M150",
    cement: 5.5,
    sand: 0.58,
    stone: 0.88,
    desc: "Lót nền, bó vỉa",
  },
  {
    id: "M200",
    name: "M200",
    cement: 7.5,
    sand: 0.5,
    stone: 0.85,
    desc: "Sàn, dầm phụ",
  },
  {
    id: "M250",
    name: "M250",
    cement: 8.5,
    sand: 0.48,
    stone: 0.82,
    desc: "Dầm, cột chính",
  },
  {
    id: "M300",
    name: "M300",
    cement: 9.5,
    sand: 0.46,
    stone: 0.8,
    desc: "Kết cấu chịu lực",
  },
  {
    id: "M350",
    name: "M350",
    cement: 10.5,
    sand: 0.44,
    stone: 0.78,
    desc: "Công trình cao tầng",
  },
];

// Unit prices (default, editable)
const DEFAULT_PRICES = {
  cement: 95000, // per bag (50kg)
  sand: 350000, // per m³
  stone: 380000, // per m³
  readyMix: 1450000, // per m³ ready-mix concrete
};

type CalcMode = "slab" | "column" | "beam" | "foundation";

export default function ConcreteCalculatorScreen() {
  const insets = useSafeAreaInsets();

  // Mode
  const [mode, setMode] = useState<CalcMode>("slab");

  // Dimensions
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");

  // Concrete grade
  const [grade, setGrade] = useState("M250");

  // Prices
  const [cementPrice, setCementPrice] = useState(
    DEFAULT_PRICES.cement.toString(),
  );
  const [sandPrice, setSandPrice] = useState(DEFAULT_PRICES.sand.toString());
  const [stonePrice, setStonePrice] = useState(DEFAULT_PRICES.stone.toString());
  const [readyMixPrice, setReadyMixPrice] = useState(
    DEFAULT_PRICES.readyMix.toString(),
  );

  // Wastage
  const [wastage, setWastage] = useState("5");

  // Show results
  const [showResults, setShowResults] = useState(false);

  // Calculations
  const calculations = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const qty = parseInt(quantity) || 1;
    const waste = parseFloat(wastage) || 5;

    // Calculate volume based on mode
    let volume = 0;
    switch (mode) {
      case "slab":
      case "foundation":
        volume = l * w * h;
        break;
      case "column":
        volume = w * w * h * qty; // Square column
        break;
      case "beam":
        volume = w * h * l;
        break;
    }

    // Add wastage
    const totalVolume = volume * (1 + waste / 100);

    // Get grade mix ratios
    const gradeData = CONCRETE_GRADES.find((g) => g.id === grade);
    const cementBags = totalVolume * (gradeData?.cement || 8);
    const sandM3 = totalVolume * (gradeData?.sand || 0.5);
    const stoneM3 = totalVolume * (gradeData?.stone || 0.85);

    // Calculate costs
    const cPrice = parseFloat(cementPrice) || DEFAULT_PRICES.cement;
    const sPrice = parseFloat(sandPrice) || DEFAULT_PRICES.sand;
    const stPrice = parseFloat(stonePrice) || DEFAULT_PRICES.stone;
    const rmPrice = parseFloat(readyMixPrice) || DEFAULT_PRICES.readyMix;

    const cementCost = Math.ceil(cementBags) * cPrice;
    const sandCost = sandM3 * sPrice;
    const stoneCost = stoneM3 * stPrice;
    const selfMixCost = cementCost + sandCost + stoneCost;
    const readyMixCost = totalVolume * rmPrice;

    return {
      volume,
      totalVolume,
      waste,
      cementBags,
      sandM3,
      stoneM3,
      cementCost,
      sandCost,
      stoneCost,
      selfMixCost,
      readyMixCost,
      savings: readyMixCost - selfMixCost,
    };
  }, [
    length,
    width,
    height,
    quantity,
    mode,
    grade,
    wastage,
    cementPrice,
    sandPrice,
    stonePrice,
    readyMixPrice,
  ]);

  const handleBack = useCallback(() => router.back(), []);

  const handleCalculate = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResults(true);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)} triệu`;
    }
    return `${amount.toLocaleString("vi-VN")} đ`;
  };

  const getInputLabels = () => {
    switch (mode) {
      case "slab":
        return { l: "Chiều dài (m)", w: "Chiều rộng (m)", h: "Độ dày (m)" };
      case "column":
        return { l: "Số cột", w: "Cạnh cột (m)", h: "Chiều cao (m)" };
      case "beam":
        return { l: "Chiều dài (m)", w: "Chiều rộng (m)", h: "Chiều cao (m)" };
      case "foundation":
        return { l: "Chiều dài (m)", w: "Chiều rộng (m)", h: "Độ dày (m)" };
      default:
        return { l: "Chiều dài", w: "Chiều rộng", h: "Chiều cao" };
    }
  };

  const labels = getInputLabels();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🏗️ Tính Bê tông</Text>
          <Text style={styles.headerSubtitle}>Khối lượng & Vật liệu</Text>
        </View>
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
          {/* Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại kết cấu</Text>
            <View style={styles.modeGrid}>
              {CALC_MODES.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.modeCard,
                    mode === m.id && styles.modeCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMode(m.id as CalcMode);
                    setShowResults(false);
                  }}
                >
                  <Text style={styles.modeIcon}>{m.icon}</Text>
                  <Text
                    style={[
                      styles.modeLabel,
                      mode === m.id && styles.modeLabelActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                  <Text style={styles.modeDesc}>{m.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dimensions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kích thước</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>{labels.l}</Text>
                <TextInput
                  style={styles.input}
                  value={mode === "column" ? quantity : length}
                  onChangeText={mode === "column" ? setQuantity : setLength}
                  placeholder="0"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>{labels.w}</Text>
                <TextInput
                  style={styles.input}
                  value={width}
                  onChangeText={setWidth}
                  placeholder="0"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>{labels.h}</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="0"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Hao hụt (%)</Text>
                <TextInput
                  style={styles.input}
                  value={wastage}
                  onChangeText={setWastage}
                  placeholder="5"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Concrete Grade */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mác bê tông</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gradeList}
            >
              {CONCRETE_GRADES.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.gradeCard,
                    grade === g.id && styles.gradeCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGrade(g.id);
                  }}
                >
                  <Text
                    style={[
                      styles.gradeName,
                      grade === g.id && styles.gradeNameActive,
                    ]}
                  >
                    {g.name}
                  </Text>
                  <Text style={styles.gradeDesc}>{g.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Unit Prices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đơn giá vật liệu</Text>
            <View style={styles.priceGrid}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Xi măng (đ/bao)</Text>
                <TextInput
                  style={styles.priceInput}
                  value={cementPrice}
                  onChangeText={setCementPrice}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Cát (đ/m³)</Text>
                <TextInput
                  style={styles.priceInput}
                  value={sandPrice}
                  onChangeText={setSandPrice}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Đá (đ/m³)</Text>
                <TextInput
                  style={styles.priceInput}
                  value={stonePrice}
                  onChangeText={setStonePrice}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>BT thương phẩm (đ/m³)</Text>
                <TextInput
                  style={styles.priceInput}
                  value={readyMixPrice}
                  onChangeText={setReadyMixPrice}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Quick Preview */}
          {calculations.volume > 0 && (
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Thể tích bê tông:</Text>
              <Text style={styles.previewValue}>
                {calculations.totalVolume.toFixed(2)} m³
              </Text>
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
          >
            <LinearGradient
              colors={["#6b7280", "#4b5563"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính toán chi tiết</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Results */}
          {showResults && calculations.totalVolume > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>📊 Kết quả tính toán</Text>

              {/* Volume */}
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultCardTitle}>
                    📐 Thể tích bê tông
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Thể tích tính toán</Text>
                  <Text style={styles.resultValue}>
                    {calculations.volume.toFixed(2)} m³
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    Hao hụt {calculations.waste}%
                  </Text>
                  <Text style={styles.resultValue}>
                    +
                    {(calculations.totalVolume - calculations.volume).toFixed(
                      2,
                    )}{" "}
                    m³
                  </Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Tổng thể tích cần</Text>
                  <Text style={styles.resultHighlight}>
                    {calculations.totalVolume.toFixed(2)} m³
                  </Text>
                </View>
              </View>

              {/* Materials */}
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultCardTitle}>
                    📦 Vật liệu tự trộn
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Xi măng</Text>
                  <Text style={styles.resultValue}>
                    {Math.ceil(calculations.cementBags)} bao
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Cát</Text>
                  <Text style={styles.resultValue}>
                    {calculations.sandM3.toFixed(2)} m³
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Đá 1×2</Text>
                  <Text style={styles.resultValue}>
                    {calculations.stoneM3.toFixed(2)} m³
                  </Text>
                </View>
              </View>

              {/* Cost Comparison */}
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultCardTitle}>💰 So sánh chi phí</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Tự trộn</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(calculations.selfMixCost)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>BT thương phẩm</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(calculations.readyMixCost)}
                  </Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    {calculations.savings > 0
                      ? "Tiết kiệm khi tự trộn"
                      : "Rẻ hơn khi mua BT TP"}
                  </Text>
                  <Text
                    style={[
                      styles.resultHighlight,
                      {
                        color: calculations.savings > 0 ? "#22c55e" : "#ef4444",
                      },
                    ]}
                  >
                    {formatCurrency(Math.abs(calculations.savings))}
                  </Text>
                </View>
              </View>

              {/* Recommendation */}
              <View style={styles.tipCard}>
                <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                <Text style={styles.tipText}>
                  {calculations.totalVolume > 3
                    ? "Khối lượng lớn, nên dùng bê tông thương phẩm để đảm bảo chất lượng và tiến độ."
                    : "Khối lượng nhỏ, có thể tự trộn tại công trình."}
                </Text>
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
  scrollView: { flex: 1 },
  scrollContent: { padding: MODERN_SPACING.md },

  section: { marginBottom: MODERN_SPACING.lg },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },

  // Mode Grid
  modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: MODERN_SPACING.sm },
  modeCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...MODERN_SHADOWS.sm,
  },
  modeCardActive: { borderColor: "#6b7280", backgroundColor: "#f3f4f6" },
  modeIcon: { fontSize: 28, marginBottom: 6 },
  modeLabel: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  modeLabelActive: { color: "#374151" },
  modeDesc: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  // Input Grid
  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: MODERN_SPACING.sm },
  inputItem: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
  },
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

  // Grade List
  gradeList: { gap: MODERN_SPACING.sm },
  gradeCard: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 90,
  },
  gradeCardActive: { borderColor: "#6b7280", backgroundColor: "#f3f4f6" },
  gradeName: { fontSize: 16, fontWeight: "700", color: MODERN_COLORS.text },
  gradeNameActive: { color: "#374151" },
  gradeDesc: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  // Price Grid
  priceGrid: { flexDirection: "row", flexWrap: "wrap", gap: MODERN_SPACING.sm },
  priceItem: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
  },
  priceLabel: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.sm,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  // Preview
  previewCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
  },
  previewLabel: { fontSize: 14, color: "#374151" },
  previewValue: { fontSize: 18, fontWeight: "700", color: "#111827" },

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
  resultCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  resultHeader: { marginBottom: MODERN_SPACING.sm },
  resultCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  resultLabel: { fontSize: 13, color: MODERN_COLORS.textSecondary },
  resultValue: { fontSize: 13, fontWeight: "600", color: MODERN_COLORS.text },
  resultDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginVertical: MODERN_SPACING.sm,
  },
  resultHighlight: { fontSize: 15, fontWeight: "700", color: "#374151" },

  // Tip
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#fef3c7",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
  },
  tipText: { flex: 1, fontSize: 12, color: "#92400e", lineHeight: 18 },
});
