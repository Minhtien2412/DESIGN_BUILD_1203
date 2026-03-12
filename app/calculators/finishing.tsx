/**
 * Finishing Calculator - Tính Chi phí Hoàn thiện
 * Painting, plastering, tiling, doors/windows estimation
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

// Finishing categories with default rates
const FINISHING_ITEMS = {
  plastering: {
    label: "Trát tường",
    icon: "🪣",
    variants: [
      { id: "rough", name: "Trát thô (15mm)", rate: 80000, unit: "m²" },
      { id: "fine", name: "Trát mịn (5mm)", rate: 45000, unit: "m²" },
      { id: "texture", name: "Trát gai/texture", rate: 120000, unit: "m²" },
    ],
  },
  flooring: {
    label: "Ốp lát nền",
    icon: "🏠",
    variants: [
      { id: "ceramic40", name: "Gạch ceramic 40x40", rate: 280000, unit: "m²" },
      { id: "ceramic60", name: "Gạch ceramic 60x60", rate: 350000, unit: "m²" },
      { id: "granite60", name: "Gạch granite 60x60", rate: 450000, unit: "m²" },
      { id: "granite80", name: "Gạch granite 80x80", rate: 550000, unit: "m²" },
      { id: "porcelain", name: "Gạch porcelain", rate: 650000, unit: "m²" },
      { id: "marble", name: "Đá marble", rate: 1200000, unit: "m²" },
    ],
  },
  wallTiles: {
    label: "Ốp tường",
    icon: "🧱",
    variants: [
      { id: "ceramic30", name: "Gạch ốp 30x60", rate: 250000, unit: "m²" },
      { id: "ceramic30x45", name: "Gạch ốp 30x45", rate: 200000, unit: "m²" },
      { id: "mosaic", name: "Mosaic", rate: 450000, unit: "m²" },
    ],
  },
  painting: {
    label: "Sơn",
    icon: "🎨",
    variants: [
      { id: "interior", name: "Sơn nội thất", rate: 45000, unit: "m²" },
      { id: "exterior", name: "Sơn ngoại thất", rate: 55000, unit: "m²" },
      { id: "premium", name: "Sơn cao cấp", rate: 75000, unit: "m²" },
      { id: "antiMold", name: "Sơn chống thấm", rate: 85000, unit: "m²" },
    ],
  },
  doors: {
    label: "Cửa đi",
    icon: "🚪",
    variants: [
      { id: "woodFrame", name: "Cửa gỗ khung", rate: 3500000, unit: "bộ" },
      { id: "woodSolid", name: "Cửa gỗ đặc", rate: 5500000, unit: "bộ" },
      { id: "composite", name: "Cửa composite", rate: 2800000, unit: "bộ" },
      { id: "aluminum", name: "Cửa nhôm kính", rate: 4500000, unit: "bộ" },
      { id: "steel", name: "Cửa thép chống cháy", rate: 6000000, unit: "bộ" },
    ],
  },
  windows: {
    label: "Cửa sổ",
    icon: "🪟",
    variants: [
      {
        id: "aluminumSingle",
        name: "Nhôm kính đơn",
        rate: 1800000,
        unit: "m²",
      },
      {
        id: "aluminumDouble",
        name: "Nhôm kính đôi",
        rate: 2500000,
        unit: "m²",
      },
      { id: "upvc", name: "Cửa uPVC", rate: 2200000, unit: "m²" },
      { id: "system", name: "Nhôm hệ cao cấp", rate: 3500000, unit: "m²" },
    ],
  },
  ceiling: {
    label: "Trần",
    icon: "⬆️",
    variants: [
      {
        id: "thachCao",
        name: "Trần thạch cao phẳng",
        rate: 180000,
        unit: "m²",
      },
      {
        id: "thachCaoGiat",
        name: "Trần thạch cao giật cấp",
        rate: 250000,
        unit: "m²",
      },
      { id: "goNhua", name: "Trần gỗ nhựa", rate: 280000, unit: "m²" },
      { id: "nhuaVan", name: "Trần nhựa PVC", rate: 150000, unit: "m²" },
    ],
  },
  staircase: {
    label: "Cầu thang",
    icon: "🪜",
    variants: [
      { id: "concrete", name: "CT bê tông ốp đá", rate: 6500000, unit: "bậc" },
      { id: "steel", name: "CT thép xương cá", rate: 5000000, unit: "bậc" },
      { id: "wood", name: "CT gỗ tự nhiên", rate: 8000000, unit: "bậc" },
      { id: "glass", name: "CT kính cường lực", rate: 7500000, unit: "bậc" },
    ],
  },
};

interface FinishingEntry {
  category: string;
  variant: string;
  quantity: string;
  customRate: string;
}

export default function FinishingCalculatorScreen() {
  const insets = useSafeAreaInsets();

  // Entries list
  const [entries, setEntries] = useState<FinishingEntry[]>([
    { category: "plastering", variant: "rough", quantity: "", customRate: "" },
  ]);

  // Active entry for editing
  const [activeIndex, setActiveIndex] = useState(0);

  // Show results
  const [showResults, setShowResults] = useState(false);

  // Calculations
  const calculations = useMemo(() => {
    const items = entries.map((entry) => {
      const category =
        FINISHING_ITEMS[entry.category as keyof typeof FINISHING_ITEMS];
      const variant = category?.variants.find((v) => v.id === entry.variant);
      const qty = parseFloat(entry.quantity) || 0;
      const rate = entry.customRate
        ? parseFloat(entry.customRate)
        : variant?.rate || 0;
      const total = qty * rate;

      return {
        category: entry.category,
        categoryLabel: category?.label || "",
        categoryIcon: category?.icon || "",
        variantName: variant?.name || "",
        unit: variant?.unit || "",
        quantity: qty,
        rate,
        total,
      };
    });

    const totalCost = items.reduce((sum, item) => sum + item.total, 0);

    return { items, totalCost };
  }, [entries]);

  const handleBack = useCallback(() => router.back(), []);

  const handleAddEntry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newEntry: FinishingEntry = {
      category: "plastering",
      variant: "rough",
      quantity: "",
      customRate: "",
    };
    setEntries([...entries, newEntry]);
    setActiveIndex(entries.length);
  }, [entries]);

  const handleRemoveEntry = useCallback(
    (index: number) => {
      if (entries.length <= 1) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
      if (activeIndex >= newEntries.length) {
        setActiveIndex(newEntries.length - 1);
      }
    },
    [entries, activeIndex],
  );

  const handleUpdateEntry = useCallback(
    (index: number, field: keyof FinishingEntry, value: string) => {
      const newEntries = [...entries];
      newEntries[index] = { ...newEntries[index], [field]: value };

      // Reset variant when category changes
      if (field === "category") {
        const category = FINISHING_ITEMS[value as keyof typeof FINISHING_ITEMS];
        newEntries[index].variant = category?.variants[0]?.id || "";
        newEntries[index].customRate = "";
      }

      setEntries(newEntries);
    },
    [entries],
  );

  const handleCalculate = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResults(true);
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

  const currentEntry = entries[activeIndex];
  const currentCategory =
    FINISHING_ITEMS[currentEntry?.category as keyof typeof FINISHING_ITEMS];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>✨ Tính Hoàn thiện</Text>
          <Text style={styles.headerSubtitle}>
            Trát, ốp lát, sơn, cửa, trần
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddEntry}>
          <Ionicons name="add" size={24} color={MODERN_COLORS.primary} />
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
          {/* Entry Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.entryTabsContainer}
            contentContainerStyle={styles.entryTabs}
          >
            {entries.map((entry, index) => {
              const cat =
                FINISHING_ITEMS[entry.category as keyof typeof FINISHING_ITEMS];
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.entryTab,
                    activeIndex === index && styles.entryTabActive,
                  ]}
                  onPress={() => setActiveIndex(index)}
                >
                  <Text style={styles.entryTabIcon}>{cat?.icon}</Text>
                  <Text
                    style={[
                      styles.entryTabText,
                      activeIndex === index && styles.entryTabTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {cat?.label || `Mục ${index + 1}`}
                  </Text>
                  {entries.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemoveEntry(index)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={MODERN_COLORS.error}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Current Entry Editor */}
          {currentEntry && (
            <View style={styles.editorSection}>
              {/* Category Selection */}
              <Text style={styles.sectionTitle}>Hạng mục hoàn thiện</Text>
              <View style={styles.categoryGrid}>
                {Object.entries(FINISHING_ITEMS).map(([key, cat]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryCard,
                      currentEntry.category === key &&
                        styles.categoryCardActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleUpdateEntry(activeIndex, "category", key);
                    }}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        currentEntry.category === key &&
                          styles.categoryLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Variant Selection */}
              {currentCategory && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Loại {currentCategory.label.toLowerCase()}
                  </Text>
                  <View style={styles.variantGrid}>
                    {currentCategory.variants.map((variant) => (
                      <TouchableOpacity
                        key={variant.id}
                        style={[
                          styles.variantCard,
                          currentEntry.variant === variant.id &&
                            styles.variantCardActive,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          handleUpdateEntry(activeIndex, "variant", variant.id);
                          handleUpdateEntry(activeIndex, "customRate", "");
                        }}
                      >
                        <Text
                          style={[
                            styles.variantName,
                            currentEntry.variant === variant.id &&
                              styles.variantNameActive,
                          ]}
                          numberOfLines={2}
                        >
                          {variant.name}
                        </Text>
                        <Text style={styles.variantRate}>
                          {formatCurrency(variant.rate)}/{variant.unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Quantity & Custom Rate */}
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>
                      Số lượng (
                      {currentCategory?.variants.find(
                        (v) => v.id === currentEntry.variant,
                      )?.unit || "m²"}
                      )
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={currentEntry.quantity}
                      onChangeText={(text) =>
                        handleUpdateEntry(activeIndex, "quantity", text)
                      }
                      placeholder="VD: 100"
                      placeholderTextColor={MODERN_COLORS.textTertiary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Đơn giá tùy chỉnh (đ)</Text>
                    <TextInput
                      style={styles.input}
                      value={currentEntry.customRate}
                      onChangeText={(text) =>
                        handleUpdateEntry(activeIndex, "customRate", text)
                      }
                      placeholder="Để trống = mặc định"
                      placeholderTextColor={MODERN_COLORS.textTertiary}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Quick Preview */}
              {parseFloat(currentEntry.quantity) > 0 && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewLabel}>Ước tính mục này:</Text>
                  <Text style={styles.previewValue}>
                    {formatCurrency(
                      calculations.items[activeIndex]?.total || 0,
                    )}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính tổng chi phí</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Results */}
          {showResults && calculations.items.some((i) => i.quantity > 0) && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>
                📊 Bảng dự toán hoàn thiện
              </Text>

              {calculations.items
                .filter((item) => item.quantity > 0)
                .map((item, index) => (
                  <View key={index} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultIcon}>{item.categoryIcon}</Text>
                      <Text style={styles.resultCategory}>
                        {item.categoryLabel}
                      </Text>
                    </View>
                    <Text style={styles.resultVariant}>{item.variantName}</Text>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Số lượng</Text>
                      <Text style={styles.resultValue}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Đơn giá</Text>
                      <Text style={styles.resultValue}>
                        {formatCurrency(item.rate)}/{item.unit}
                      </Text>
                    </View>
                    <View style={styles.resultDivider} />
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Thành tiền</Text>
                      <Text style={styles.resultTotal}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  </View>
                ))}

              {/* Grand Total */}
              <View style={styles.grandTotalCard}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.grandTotalGradient}
                >
                  <Text style={styles.grandTotalLabel}>
                    TỔNG CHI PHÍ HOÀN THIỆN
                  </Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(calculations.totalCost)}
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
  addBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.primaryLight,
    borderRadius: MODERN_RADIUS.md,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: MODERN_SPACING.md },

  // Entry Tabs
  entryTabsContainer: { marginBottom: MODERN_SPACING.md },
  entryTabs: { gap: MODERN_SPACING.sm },
  entryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    borderWidth: 2,
    borderColor: "transparent",
  },
  entryTabActive: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.primaryLight,
  },
  entryTabIcon: { fontSize: 16 },
  entryTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    maxWidth: 80,
  },
  entryTabTextActive: { color: MODERN_COLORS.primary },
  removeBtn: { marginLeft: 4 },

  // Editor Section
  editorSection: { marginBottom: MODERN_SPACING.lg },
  section: { marginBottom: MODERN_SPACING.md },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 3) / 4,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryCardActive: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.primaryLight,
  },
  categoryIcon: { fontSize: 22, marginBottom: 4 },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    textAlign: "center",
  },
  categoryLabelActive: { color: MODERN_COLORS.primary },

  // Variant Grid
  variantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  variantCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  variantCardActive: { borderColor: "#10b981", backgroundColor: "#d1fae5" },
  variantName: { fontSize: 13, fontWeight: "600", color: MODERN_COLORS.text },
  variantNameActive: { color: "#059669" },
  variantRate: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
  },

  // Input
  inputRow: { flexDirection: "row", gap: MODERN_SPACING.sm },
  inputHalf: { flex: 1 },
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

  // Preview
  previewCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
  },
  previewLabel: { fontSize: 13, color: "#065f46" },
  previewValue: { fontSize: 16, fontWeight: "700", color: "#059669" },

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
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  resultIcon: { fontSize: 18 },
  resultCategory: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  resultVariant: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
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
  resultTotal: { fontSize: 15, fontWeight: "700", color: "#10b981" },

  // Grand Total
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
});
