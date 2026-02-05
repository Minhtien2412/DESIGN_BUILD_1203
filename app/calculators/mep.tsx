/**
 * MEP Calculator - Tính hệ thống Điện - Nước - Cơ điện
 * Electrical, Plumbing, HVAC, Fire Protection estimation
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

// MEP Systems
const MEP_SYSTEMS = [
  { id: "electrical", icon: "⚡", label: "Điện", color: "#f59e0b" },
  { id: "plumbing", icon: "💧", label: "Nước", color: "#3b82f6" },
  { id: "hvac", icon: "❄️", label: "Điều hòa", color: "#06b6d4" },
  { id: "fire", icon: "🔥", label: "PCCC", color: "#ef4444" },
];

// Electrical components with default rates
const ELECTRICAL_ITEMS = {
  wiring: [
    { id: "wire1.5", name: "Dây điện 1.5mm²", rate: 8000, unit: "m" },
    { id: "wire2.5", name: "Dây điện 2.5mm²", rate: 12000, unit: "m" },
    { id: "wire4", name: "Dây điện 4mm²", rate: 18000, unit: "m" },
    { id: "wire6", name: "Dây điện 6mm²", rate: 28000, unit: "m" },
    { id: "wire10", name: "Dây điện 10mm²", rate: 45000, unit: "m" },
  ],
  conduit: [
    { id: "pvc16", name: "Ống luồn PVC D16", rate: 8000, unit: "m" },
    { id: "pvc20", name: "Ống luồn PVC D20", rate: 10000, unit: "m" },
    { id: "pvc25", name: "Ống luồn PVC D25", rate: 14000, unit: "m" },
  ],
  devices: [
    { id: "outlet", name: "Ổ cắm đơn", rate: 85000, unit: "bộ" },
    { id: "outletDouble", name: "Ổ cắm đôi", rate: 120000, unit: "bộ" },
    { id: "switch1", name: "Công tắc 1 chiều", rate: 65000, unit: "bộ" },
    { id: "switch2", name: "Công tắc 2 chiều", rate: 95000, unit: "bộ" },
    { id: "switchDim", name: "Dimmer", rate: 250000, unit: "bộ" },
    { id: "mcb1p", name: "MCB 1P", rate: 85000, unit: "cái" },
    { id: "mcb2p", name: "MCB 2P", rate: 150000, unit: "cái" },
    { id: "rcd", name: "RCBO/RCD", rate: 350000, unit: "cái" },
    { id: "panelBox", name: "Tủ điện tổng", rate: 2500000, unit: "bộ" },
    { id: "subPanel", name: "Tủ điện nhánh", rate: 800000, unit: "bộ" },
  ],
  lighting: [
    { id: "downlight", name: "Đèn downlight LED", rate: 180000, unit: "bộ" },
    { id: "panel", name: "Đèn panel LED", rate: 450000, unit: "bộ" },
    { id: "tracklight", name: "Đèn track", rate: 350000, unit: "bộ" },
    { id: "chandelier", name: "Đèn chùm", rate: 3500000, unit: "bộ" },
    { id: "wallLight", name: "Đèn tường", rate: 280000, unit: "bộ" },
    { id: "ledStrip", name: "LED dây", rate: 85000, unit: "m" },
  ],
};

// Plumbing components
const PLUMBING_ITEMS = {
  pipes: [
    { id: "ppr20", name: "Ống PPR D20", rate: 25000, unit: "m" },
    { id: "ppr25", name: "Ống PPR D25", rate: 35000, unit: "m" },
    { id: "ppr32", name: "Ống PPR D32", rate: 50000, unit: "m" },
    { id: "pvc60", name: "Ống PVC D60", rate: 28000, unit: "m" },
    { id: "pvc90", name: "Ống PVC D90", rate: 45000, unit: "m" },
    { id: "pvc114", name: "Ống PVC D114", rate: 65000, unit: "m" },
  ],
  fixtures: [
    { id: "toilet", name: "Bồn cầu", rate: 3500000, unit: "bộ" },
    { id: "toiletHang", name: "Bồn cầu treo", rate: 8500000, unit: "bộ" },
    { id: "lavabo", name: "Lavabo", rate: 1800000, unit: "bộ" },
    { id: "sink", name: "Bồn rửa bát", rate: 2500000, unit: "bộ" },
    { id: "shower", name: "Sen tắm đứng", rate: 2800000, unit: "bộ" },
    { id: "showerSet", name: "Bộ sen cây", rate: 5500000, unit: "bộ" },
    { id: "bathtub", name: "Bồn tắm", rate: 12000000, unit: "bộ" },
    { id: "faucet", name: "Vòi lavabo", rate: 850000, unit: "cái" },
    { id: "heater", name: "Máy nước nóng", rate: 4500000, unit: "cái" },
    { id: "waterTank", name: "Bồn nước inox 1000L", rate: 4500000, unit: "bộ" },
  ],
  drainage: [
    { id: "floor60", name: "Phễu thu D60", rate: 85000, unit: "cái" },
    { id: "floor90", name: "Phễu thu D90", rate: 120000, unit: "cái" },
    { id: "pTrap", name: "Lọ P-trap", rate: 150000, unit: "cái" },
    { id: "septic", name: "Bể phốt 3 ngăn", rate: 15000000, unit: "bộ" },
  ],
};

// HVAC components
const HVAC_ITEMS = [
  { id: "split1hp", name: "Điều hòa 1HP (9000BTU)", rate: 9500000, unit: "bộ" },
  {
    id: "split1.5hp",
    name: "Điều hòa 1.5HP (12000BTU)",
    rate: 12500000,
    unit: "bộ",
  },
  {
    id: "split2hp",
    name: "Điều hòa 2HP (18000BTU)",
    rate: 18000000,
    unit: "bộ",
  },
  { id: "multiOutdoor", name: "Dàn nóng Multi", rate: 35000000, unit: "bộ" },
  { id: "multiIndoor", name: "Dàn lạnh Multi", rate: 12000000, unit: "bộ" },
  { id: "duct", name: "Ống gió mềm", rate: 120000, unit: "m" },
  { id: "ventFan", name: "Quạt thông gió", rate: 850000, unit: "cái" },
  { id: "exhaustFan", name: "Quạt hút mùi", rate: 1500000, unit: "cái" },
];

// Fire protection
const FIRE_ITEMS = [
  {
    id: "extinguisher",
    name: "Bình chữa cháy 4kg",
    rate: 450000,
    unit: "bình",
  },
  { id: "smokeDetector", name: "Đầu báo khói", rate: 350000, unit: "cái" },
  { id: "heatDetector", name: "Đầu báo nhiệt", rate: 280000, unit: "cái" },
  { id: "fireAlarm", name: "Chuông báo cháy", rate: 450000, unit: "cái" },
  { id: "firePanel", name: "Tủ báo cháy", rate: 8500000, unit: "bộ" },
  { id: "sprinkler", name: "Sprinkler", rate: 180000, unit: "đầu" },
  { id: "fireCabinet", name: "Tủ chữa cháy", rate: 3500000, unit: "bộ" },
  { id: "exitSign", name: "Đèn exit", rate: 350000, unit: "cái" },
  { id: "emergencyLight", name: "Đèn sự cố", rate: 280000, unit: "cái" },
];

interface MEPEntry {
  itemId: string;
  itemName: string;
  quantity: string;
  rate: number;
  unit: string;
}

interface SystemEntries {
  [system: string]: MEPEntry[];
}

export default function MEPCalculatorScreen() {
  const insets = useSafeAreaInsets();

  // Active system tab
  const [activeSystem, setActiveSystem] = useState("electrical");

  // Entries by system
  const [entries, setEntries] = useState<SystemEntries>({
    electrical: [],
    plumbing: [],
    hvac: [],
    fire: [],
  });

  // Show results
  const [showResults, setShowResults] = useState(false);

  // Get items for current system
  const getSystemItems = useCallback((system: string) => {
    switch (system) {
      case "electrical":
        return [
          ...ELECTRICAL_ITEMS.wiring,
          ...ELECTRICAL_ITEMS.conduit,
          ...ELECTRICAL_ITEMS.devices,
          ...ELECTRICAL_ITEMS.lighting,
        ];
      case "plumbing":
        return [
          ...PLUMBING_ITEMS.pipes,
          ...PLUMBING_ITEMS.fixtures,
          ...PLUMBING_ITEMS.drainage,
        ];
      case "hvac":
        return HVAC_ITEMS;
      case "fire":
        return FIRE_ITEMS;
      default:
        return [];
    }
  }, []);

  // Calculations
  const calculations = useMemo(() => {
    const systemTotals: { [key: string]: number } = {};
    let grandTotal = 0;

    Object.entries(entries).forEach(([system, items]) => {
      const total = items.reduce((sum, entry) => {
        const qty = parseFloat(entry.quantity) || 0;
        return sum + qty * entry.rate;
      }, 0);
      systemTotals[system] = total;
      grandTotal += total;
    });

    return { systemTotals, grandTotal };
  }, [entries]);

  const handleBack = useCallback(() => router.back(), []);

  const handleAddItem = useCallback(
    (item: { id: string; name: string; rate: number; unit: string }) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newEntry: MEPEntry = {
        itemId: item.id,
        itemName: item.name,
        quantity: "1",
        rate: item.rate,
        unit: item.unit,
      };
      setEntries((prev) => ({
        ...prev,
        [activeSystem]: [...prev[activeSystem], newEntry],
      }));
    },
    [activeSystem],
  );

  const handleUpdateQuantity = useCallback(
    (index: number, qty: string) => {
      setEntries((prev) => {
        const updated = [...prev[activeSystem]];
        updated[index] = { ...updated[index], quantity: qty };
        return { ...prev, [activeSystem]: updated };
      });
    },
    [activeSystem],
  );

  const handleUpdateRate = useCallback(
    (index: number, rate: string) => {
      setEntries((prev) => {
        const updated = [...prev[activeSystem]];
        updated[index] = {
          ...updated[index],
          rate: parseFloat(rate) || updated[index].rate,
        };
        return { ...prev, [activeSystem]: updated };
      });
    },
    [activeSystem],
  );

  const handleRemoveItem = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setEntries((prev) => ({
        ...prev,
        [activeSystem]: prev[activeSystem].filter((_, i) => i !== index),
      }));
    },
    [activeSystem],
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

  const currentSystemItems = getSystemItems(activeSystem);
  const currentEntries = entries[activeSystem] || [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>⚡ Tính M&E</Text>
          <Text style={styles.headerSubtitle}>
            Điện - Nước - Điều hòa - PCCC
          </Text>
        </View>
      </View>

      {/* System Tabs */}
      <View style={styles.systemTabs}>
        {MEP_SYSTEMS.map((system) => (
          <TouchableOpacity
            key={system.id}
            style={[
              styles.systemTab,
              activeSystem === system.id && [
                styles.systemTabActive,
                { borderBottomColor: system.color },
              ],
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSystem(system.id);
            }}
          >
            <Text style={styles.systemIcon}>{system.icon}</Text>
            <Text
              style={[
                styles.systemLabel,
                activeSystem === system.id && { color: system.color },
              ]}
            >
              {system.label}
            </Text>
            {entries[system.id]?.length > 0 && (
              <View style={[styles.badge, { backgroundColor: system.color }]}>
                <Text style={styles.badgeText}>
                  {entries[system.id].length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
          {/* Item Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn thiết bị/vật tư</Text>
            <View style={styles.itemGrid}>
              {currentSystemItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => handleAddItem(item)}
                >
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemRate}>
                    {formatCurrency(item.rate)}/{item.unit}
                  </Text>
                  <View style={styles.addIconContainer}>
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={
                        MEP_SYSTEMS.find((s) => s.id === activeSystem)?.color ||
                        MODERN_COLORS.primary
                      }
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Selected Items */}
          {currentEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Danh sách đã chọn ({currentEntries.length})
              </Text>
              {currentEntries.map((entry, index) => (
                <View key={`${entry.itemId}-${index}`} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryName}>{entry.itemName}</Text>
                    <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={MODERN_COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.entryInputs}>
                    <View style={styles.entryInputItem}>
                      <Text style={styles.entryLabel}>Số lượng</Text>
                      <TextInput
                        style={styles.entryInput}
                        value={entry.quantity}
                        onChangeText={(text) =>
                          handleUpdateQuantity(index, text)
                        }
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.entryUnit}>{entry.unit}</Text>
                    </View>
                    <View style={styles.entryInputItem}>
                      <Text style={styles.entryLabel}>Đơn giá</Text>
                      <TextInput
                        style={styles.entryInput}
                        value={entry.rate.toString()}
                        onChangeText={(text) => handleUpdateRate(index, text)}
                        keyboardType="number-pad"
                      />
                      <Text style={styles.entryUnit}>đ</Text>
                    </View>
                  </View>
                  <View style={styles.entryTotal}>
                    <Text style={styles.entryTotalLabel}>Thành tiền:</Text>
                    <Text style={styles.entryTotalValue}>
                      {formatCurrency(
                        (parseFloat(entry.quantity) || 0) * entry.rate,
                      )}
                    </Text>
                  </View>
                </View>
              ))}

              {/* System Subtotal */}
              <View style={styles.subtotalCard}>
                <Text style={styles.subtotalLabel}>
                  Tổng {MEP_SYSTEMS.find((s) => s.id === activeSystem)?.label}:
                </Text>
                <Text
                  style={[
                    styles.subtotalValue,
                    {
                      color:
                        MEP_SYSTEMS.find((s) => s.id === activeSystem)?.color ||
                        MODERN_COLORS.primary,
                    },
                  ]}
                >
                  {formatCurrency(calculations.systemTotals[activeSystem] || 0)}
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
              colors={["#8b5cf6", "#7c3aed"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính tổng M&E</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Results Summary */}
          {showResults && calculations.grandTotal > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>📊 Tổng hợp chi phí M&E</Text>

              {MEP_SYSTEMS.map((system) => {
                const total = calculations.systemTotals[system.id] || 0;
                if (total === 0) return null;
                return (
                  <View key={system.id} style={styles.systemResultCard}>
                    <View style={styles.systemResultHeader}>
                      <Text style={styles.systemResultIcon}>{system.icon}</Text>
                      <Text style={styles.systemResultLabel}>
                        {system.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.systemResultValue,
                        { color: system.color },
                      ]}
                    >
                      {formatCurrency(total)}
                    </Text>
                    <View
                      style={[
                        styles.systemResultBar,
                        {
                          width: `${(total / calculations.grandTotal) * 100}%`,
                          backgroundColor: system.color,
                        },
                      ]}
                    />
                  </View>
                );
              })}

              {/* Grand Total */}
              <View style={styles.grandTotalCard}>
                <LinearGradient
                  colors={["#8b5cf6", "#7c3aed"]}
                  style={styles.grandTotalGradient}
                >
                  <Text style={styles.grandTotalLabel}>TỔNG CHI PHÍ M&E</Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(calculations.grandTotal)}
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
  scrollView: { flex: 1 },
  scrollContent: { padding: MODERN_SPACING.md },

  // System Tabs
  systemTabs: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  systemTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  systemTabActive: { borderBottomWidth: 3 },
  systemIcon: { fontSize: 18 },
  systemLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },

  // Section
  section: { marginBottom: MODERN_SPACING.lg },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },

  // Item Grid
  itemGrid: { flexDirection: "row", flexWrap: "wrap", gap: MODERN_SPACING.sm },
  itemCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 2) / 3,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    position: "relative",
    minHeight: 80,
    ...MODERN_SHADOWS.sm,
  },
  itemName: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: 4,
    paddingRight: 20,
  },
  itemRate: { fontSize: 10, color: MODERN_COLORS.textSecondary },
  addIconContainer: { position: "absolute", top: 4, right: 4 },

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
    alignItems: "flex-start",
    marginBottom: MODERN_SPACING.sm,
  },
  entryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  entryInputs: { flexDirection: "row", gap: MODERN_SPACING.md },
  entryInputItem: { flex: 1 },
  entryLabel: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 4,
  },
  entryInput: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  entryUnit: { fontSize: 11, color: MODERN_COLORS.textSecondary, marginTop: 4 },
  entryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: MODERN_SPACING.sm,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  entryTotalLabel: { fontSize: 13, color: MODERN_COLORS.textSecondary },
  entryTotalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },

  // Subtotal
  subtotalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
  },
  subtotalLabel: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  subtotalValue: { fontSize: 18, fontWeight: "700" },

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
  systemResultCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  systemResultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  systemResultIcon: { fontSize: 20 },
  systemResultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  systemResultValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: MODERN_SPACING.sm,
  },
  systemResultBar: { height: 4, borderRadius: 2, marginTop: MODERN_SPACING.sm },

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
