/**
 * Total Estimate Calculator - Dự toán Tổng hợp
 * Comprehensive construction cost estimation with editable coefficients
 * Supports save, edit, delete with local storage and server sync
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import {
    createEstimate,
    EstimateItem,
    getEstimateById,
    updateEstimate,
} from "@/services/estimateService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
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

// Building types
const BUILDING_TYPES = [
  { id: "nha-pho", label: "Nhà phố", icon: "🏠", baseRate: 6500000 },
  { id: "biet-thu", label: "Biệt thự", icon: "🏛️", baseRate: 8500000 },
  { id: "chung-cu", label: "Căn hộ", icon: "🏢", baseRate: 5500000 },
  { id: "nha-cap-4", label: "Nhà cấp 4", icon: "🏡", baseRate: 4500000 },
];

// Construction levels
const CONSTRUCTION_LEVELS = [
  {
    id: "basic",
    label: "Cơ bản",
    multiplier: 0.8,
    desc: "Vật liệu tiêu chuẩn",
  },
  {
    id: "standard",
    label: "Tiêu chuẩn",
    multiplier: 1.0,
    desc: "Vật liệu tốt",
  },
  {
    id: "premium",
    label: "Cao cấp",
    multiplier: 1.3,
    desc: "Vật liệu nhập khẩu",
  },
  {
    id: "luxury",
    label: "Sang trọng",
    multiplier: 1.6,
    desc: "Vật liệu cao cấp nhất",
  },
];

// Default cost coefficients (editable)
const DEFAULT_COEFFICIENTS = {
  // Structure costs (% of total)
  foundation: { label: "Móng", percent: 12, editable: true },
  structure: { label: "Kết cấu (cột, dầm, sàn)", percent: 25, editable: true },
  roof: { label: "Mái", percent: 8, editable: true },
  walls: { label: "Tường xây", percent: 10, editable: true },

  // Finishing costs (% of total)
  plastering: { label: "Trát, láng", percent: 6, editable: true },
  flooring: { label: "Ốp lát nền", percent: 8, editable: true },
  painting: { label: "Sơn", percent: 5, editable: true },
  doors: { label: "Cửa đi, cửa sổ", percent: 8, editable: true },

  // MEP costs (% of total)
  electrical: { label: "Hệ thống điện", percent: 6, editable: true },
  plumbing: { label: "Hệ thống nước", percent: 5, editable: true },
  aircon: { label: "Điều hòa", percent: 4, editable: true },

  // Other costs
  contingency: { label: "Dự phòng", percent: 3, editable: true },
};

// Preset packages
const PRESET_PACKAGES = [
  {
    id: "economy",
    name: "Gói tiết kiệm",
    desc: "Tối ưu chi phí",
    icon: "💰",
    color: "#22c55e",
  },
  {
    id: "standard",
    name: "Gói tiêu chuẩn",
    desc: "Cân bằng giá - chất lượng",
    icon: "⭐",
    color: "#3b82f6",
  },
  {
    id: "premium",
    name: "Gói cao cấp",
    desc: "Chất lượng cao nhất",
    icon: "👑",
    color: "#f59e0b",
  },
];

interface CoefficientValue {
  label: string;
  percent: number;
  editable: boolean;
}

interface Coefficients {
  [key: string]: CoefficientValue;
}

export default function TotalEstimateScreen() {
  const insets = useSafeAreaInsets();
  const { estimateId } = useLocalSearchParams<{ estimateId?: string }>();

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<EstimateItem | null>(
    null,
  );
  const [estimateName, setEstimateName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Basic inputs
  const [buildingType, setBuildingType] = useState("nha-pho");
  const [constructionLevel, setConstructionLevel] = useState("standard");
  const [landArea, setLandArea] = useState("");
  const [buildingDensity, setBuildingDensity] = useState("70");
  const [floors, setFloors] = useState("3");
  const [basementFloors, setBasementFloors] = useState("0");

  // Coefficients
  const [coefficients, setCoefficients] =
    useState<Coefficients>(DEFAULT_COEFFICIENTS);
  const [showCoefficientsModal, setShowCoefficientsModal] = useState(false);
  const [editingCoefficient, setEditingCoefficient] = useState<string | null>(
    null,
  );

  // Results
  const [showResults, setShowResults] = useState(false);

  // Load existing estimate for editing
  useEffect(() => {
    if (estimateId) {
      loadEstimate(estimateId);
    }
  }, [estimateId]);

  const loadEstimate = async (id: string) => {
    try {
      const estimate = await getEstimateById(id);
      if (estimate) {
        setCurrentEstimate(estimate);
        setIsEditMode(true);
        setEstimateName(estimate.name);

        // Restore data
        const data = estimate.data;
        if (data.buildingType) setBuildingType(data.buildingType);
        if (data.constructionLevel)
          setConstructionLevel(data.constructionLevel);
        if (data.landArea) setLandArea(data.landArea.toString());
        if (data.buildingDensity)
          setBuildingDensity(data.buildingDensity.toString());
        if (data.floors) setFloors(data.floors.toString());
        if (data.basementFloors)
          setBasementFloors(data.basementFloors.toString());
        if (data.coefficients) setCoefficients(data.coefficients);
      }
    } catch (error) {
      console.error("Error loading estimate:", error);
    }
  };

  // Calculate all costs
  const calculations = useMemo(() => {
    const area = parseFloat(landArea) || 0;
    const density = parseFloat(buildingDensity) || 70;
    const numFloors = parseInt(floors) || 1;
    const numBasement = parseInt(basementFloors) || 0;

    const buildingTypeData = BUILDING_TYPES.find((t) => t.id === buildingType);
    const levelData = CONSTRUCTION_LEVELS.find(
      (l) => l.id === constructionLevel,
    );

    const baseRate = buildingTypeData?.baseRate || 6500000;
    const levelMultiplier = levelData?.multiplier || 1.0;

    // Total construction area
    const groundFloorArea = (area * density) / 100;
    const totalFloorArea = groundFloorArea * numFloors;
    const basementArea = groundFloorArea * numBasement * 1.3; // Basement costs more
    const totalArea = totalFloorArea + basementArea;

    // Total construction cost
    const totalCost = totalArea * baseRate * levelMultiplier;

    // Calculate individual items based on coefficients
    const breakdown: { [key: string]: number } = {};
    let totalPercent = 0;

    Object.entries(coefficients).forEach(([key, value]) => {
      breakdown[key] = Math.round((totalCost * value.percent) / 100);
      totalPercent += value.percent;
    });

    // Adjust if percentages don't equal 100
    const adjustmentFactor = 100 / totalPercent;
    Object.keys(breakdown).forEach((key) => {
      breakdown[key] = Math.round(breakdown[key] * adjustmentFactor);
    });

    // Group costs
    const structureCost =
      (breakdown.foundation || 0) +
      (breakdown.structure || 0) +
      (breakdown.roof || 0) +
      (breakdown.walls || 0);

    const finishingCost =
      (breakdown.plastering || 0) +
      (breakdown.flooring || 0) +
      (breakdown.painting || 0) +
      (breakdown.doors || 0);

    const mepCost =
      (breakdown.electrical || 0) +
      (breakdown.plumbing || 0) +
      (breakdown.aircon || 0);

    const otherCost = breakdown.contingency || 0;

    return {
      area,
      groundFloorArea,
      totalFloorArea,
      basementArea,
      totalArea,
      baseRate,
      levelMultiplier,
      totalCost,
      breakdown,
      structureCost,
      finishingCost,
      mepCost,
      otherCost,
      pricePerM2: totalArea > 0 ? totalCost / totalArea : 0,
    };
  }, [
    landArea,
    buildingDensity,
    floors,
    basementFloors,
    buildingType,
    constructionLevel,
    coefficients,
  ]);

  const handleBack = useCallback(() => router.back(), []);

  const handleCalculate = useCallback(() => {
    if (!landArea || parseFloat(landArea) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập diện tích đất hợp lệ");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResults(true);
  }, [landArea]);

  const handleSaveEstimate = useCallback(async () => {
    if (!estimateName.trim()) {
      setShowSaveModal(true);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const estimateData = {
        buildingType,
        constructionLevel,
        landArea: parseFloat(landArea) || 0,
        buildingDensity: parseFloat(buildingDensity) || 70,
        floors: parseInt(floors) || 1,
        basementFloors: parseInt(basementFloors) || 0,
        coefficients,
      };

      const results = {
        totalCost: calculations.totalCost,
        breakdown: {
          structureCost: calculations.structureCost,
          finishingCost: calculations.finishingCost,
          mepCost: calculations.mepCost,
          otherCost: calculations.otherCost,
        },
        unit: "m²",
        quantity: calculations.totalArea,
      };

      if (isEditMode && currentEstimate) {
        // Update existing
        await updateEstimate(currentEstimate.id, {
          name: estimateName,
          data: estimateData,
          results,
        });
        Alert.alert("Thành công", "Đã cập nhật dự toán!");
      } else {
        // Create new
        const newEstimate = await createEstimate({
          type: "total",
          name: estimateName,
          data: estimateData,
          results,
          status: "draft",
        });
        setCurrentEstimate(newEstimate);
        setIsEditMode(true);
        Alert.alert(
          "Thành công",
          `Đã lưu dự toán #${newEstimate.localId}: ${estimateName}`,
        );
      }

      setShowSaveModal(false);
    } catch (error) {
      console.error("Error saving estimate:", error);
      Alert.alert("Lỗi", "Không thể lưu dự toán");
    }
  }, [
    estimateName,
    buildingType,
    constructionLevel,
    landArea,
    buildingDensity,
    floors,
    basementFloors,
    coefficients,
    calculations,
    isEditMode,
    currentEstimate,
  ]);

  const handleShareEstimate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Chia sẻ", "Chọn hình thức chia sẻ", [
      { text: "PDF", onPress: () => {} },
      { text: "Excel", onPress: () => {} },
      { text: "Hủy", style: "cancel" },
    ]);
  }, []);

  const handleUpdateCoefficient = useCallback(
    (key: string, newPercent: number) => {
      setCoefficients((prev) => ({
        ...prev,
        [key]: { ...prev[key], percent: newPercent },
      }));
    },
    [],
  );

  const handleResetCoefficients = useCallback(() => {
    Alert.alert("Đặt lại", "Bạn có muốn đặt lại các hệ số về mặc định?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đặt lại",
        onPress: () => setCoefficients(DEFAULT_COEFFICIENTS),
      },
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

  const totalPercent = useMemo(() => {
    return Object.values(coefficients).reduce((sum, c) => sum + c.percent, 0);
  }, [coefficients]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            🏠 {isEditMode ? "Chỉnh sửa dự toán" : "Dự toán Tổng hợp"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditMode
              ? `#${currentEstimate?.localId} - ${estimateName}`
              : "Chi phí xây dựng toàn diện"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.coeffBtn}
          onPress={() => setShowCoefficientsModal(true)}
        >
          <Ionicons
            name="options-outline"
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
          {/* Building Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại công trình</Text>
            <View style={styles.typeGrid}>
              {BUILDING_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    buildingType === type.id && styles.typeCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBuildingType(type.id);
                  }}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      buildingType === type.id && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.typeRate}>
                    {(type.baseRate / 1000000).toFixed(1)}tr/m²
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Construction Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mức độ hoàn thiện</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.levelList}
            >
              {CONSTRUCTION_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelCard,
                    constructionLevel === level.id && styles.levelCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setConstructionLevel(level.id);
                  }}
                >
                  <Text
                    style={[
                      styles.levelLabel,
                      constructionLevel === level.id && styles.levelLabelActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text style={styles.levelDesc}>{level.desc}</Text>
                  <Text
                    style={[
                      styles.levelMultiplier,
                      constructionLevel === level.id &&
                        styles.levelMultiplierActive,
                    ]}
                  >
                    x{level.multiplier.toFixed(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dimensions Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông số xây dựng</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Diện tích đất (m²)</Text>
                <TextInput
                  style={styles.input}
                  value={landArea}
                  onChangeText={setLandArea}
                  placeholder="VD: 100"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Mật độ xây dựng (%)</Text>
                <TextInput
                  style={styles.input}
                  value={buildingDensity}
                  onChangeText={setBuildingDensity}
                  placeholder="70"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Số tầng nổi</Text>
                <TextInput
                  style={styles.input}
                  value={floors}
                  onChangeText={setFloors}
                  placeholder="3"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Số tầng hầm</Text>
                <TextInput
                  style={styles.input}
                  value={basementFloors}
                  onChangeText={setBasementFloors}
                  placeholder="0"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Quick Summary */}
          {landArea && parseFloat(landArea) > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Diện tích sàn xây dựng</Text>
                <Text style={styles.summaryValue}>
                  {calculations.totalArea.toFixed(1)} m²
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Đơn giá tham khảo</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(
                    calculations.baseRate * calculations.levelMultiplier,
                  )}
                  /m²
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Ước tính sơ bộ</Text>
                <Text style={styles.summaryTotalValue}>
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
              colors={["#22c55e", "#16a34a"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính toán chi tiết</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Detailed Results */}
          {showResults && calculations.totalCost > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  📊 Bảng dự toán chi tiết
                </Text>
                <TouchableOpacity onPress={handleShareEstimate}>
                  <Ionicons
                    name="share-outline"
                    size={22}
                    color={MODERN_COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Cost Categories */}
              <View style={styles.costCategory}>
                <View style={styles.costCategoryHeader}>
                  <Text style={styles.costCategoryTitle}>
                    🧱 Phần thô & Kết cấu
                  </Text>
                  <Text style={styles.costCategoryTotal}>
                    {formatCurrency(calculations.structureCost)}
                  </Text>
                </View>
                {["foundation", "structure", "roof", "walls"].map((key) => (
                  <View key={key} style={styles.costItem}>
                    <Text style={styles.costItemLabel}>
                      {coefficients[key]?.label}
                    </Text>
                    <Text style={styles.costItemPercent}>
                      {coefficients[key]?.percent}%
                    </Text>
                    <Text style={styles.costItemValue}>
                      {formatCurrency(calculations.breakdown[key] || 0)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.costCategory}>
                <View style={styles.costCategoryHeader}>
                  <Text style={styles.costCategoryTitle}>✨ Hoàn thiện</Text>
                  <Text style={styles.costCategoryTotal}>
                    {formatCurrency(calculations.finishingCost)}
                  </Text>
                </View>
                {["plastering", "flooring", "painting", "doors"].map((key) => (
                  <View key={key} style={styles.costItem}>
                    <Text style={styles.costItemLabel}>
                      {coefficients[key]?.label}
                    </Text>
                    <Text style={styles.costItemPercent}>
                      {coefficients[key]?.percent}%
                    </Text>
                    <Text style={styles.costItemValue}>
                      {formatCurrency(calculations.breakdown[key] || 0)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.costCategory}>
                <View style={styles.costCategoryHeader}>
                  <Text style={styles.costCategoryTitle}>
                    ⚡ Điện - Nước - M&E
                  </Text>
                  <Text style={styles.costCategoryTotal}>
                    {formatCurrency(calculations.mepCost)}
                  </Text>
                </View>
                {["electrical", "plumbing", "aircon"].map((key) => (
                  <View key={key} style={styles.costItem}>
                    <Text style={styles.costItemLabel}>
                      {coefficients[key]?.label}
                    </Text>
                    <Text style={styles.costItemPercent}>
                      {coefficients[key]?.percent}%
                    </Text>
                    <Text style={styles.costItemValue}>
                      {formatCurrency(calculations.breakdown[key] || 0)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.costCategory}>
                <View style={styles.costCategoryHeader}>
                  <Text style={styles.costCategoryTitle}>📋 Chi phí khác</Text>
                  <Text style={styles.costCategoryTotal}>
                    {formatCurrency(calculations.otherCost)}
                  </Text>
                </View>
                <View style={styles.costItem}>
                  <Text style={styles.costItemLabel}>
                    {coefficients.contingency?.label}
                  </Text>
                  <Text style={styles.costItemPercent}>
                    {coefficients.contingency?.percent}%
                  </Text>
                  <Text style={styles.costItemValue}>
                    {formatCurrency(calculations.breakdown.contingency || 0)}
                  </Text>
                </View>
              </View>

              {/* Grand Total */}
              <View style={styles.grandTotalCard}>
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  style={styles.grandTotalGradient}
                >
                  <View style={styles.grandTotalRow}>
                    <Text style={styles.grandTotalLabel}>
                      TỔNG CHI PHÍ DỰ TOÁN
                    </Text>
                    <Text style={styles.grandTotalValue}>
                      {formatCurrency(calculations.totalCost)}
                    </Text>
                  </View>
                  <View style={styles.grandTotalMeta}>
                    <Text style={styles.grandTotalMetaText}>
                      Diện tích: {calculations.totalArea.toFixed(1)} m² • Đơn
                      giá: {formatCurrency(calculations.pricePerM2)}/m²
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEstimate}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={20}
                  color={MODERN_COLORS.primary}
                />
                <Text style={styles.saveBtnText}>Lưu dự toán này</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Coefficients Modal */}
      <Modal
        visible={showCoefficientsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚙️ Chỉnh sửa hệ số</Text>
            <TouchableOpacity onPress={() => setShowCoefficientsModal(false)}>
              <Ionicons name="close" size={28} color={MODERN_COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.coeffSummary}>
            <Text style={styles.coeffSummaryText}>
              Tổng hệ số:{" "}
              <Text
                style={[
                  styles.coeffSummaryValue,
                  totalPercent !== 100 && styles.coeffSummaryWarning,
                ]}
              >
                {totalPercent}%
              </Text>
            </Text>
            {totalPercent !== 100 && (
              <Text style={styles.coeffWarning}>⚠️ Tổng nên bằng 100%</Text>
            )}
          </View>

          <ScrollView style={styles.coeffList}>
            {Object.entries(coefficients).map(([key, value]) => (
              <View key={key} style={styles.coeffItem}>
                <Text style={styles.coeffLabel}>{value.label}</Text>
                <View style={styles.coeffInputRow}>
                  <TouchableOpacity
                    style={styles.coeffBtn2}
                    onPress={() =>
                      handleUpdateCoefficient(
                        key,
                        Math.max(0, value.percent - 1),
                      )
                    }
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={MODERN_COLORS.text}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.coeffInput}
                    value={value.percent.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      handleUpdateCoefficient(
                        key,
                        Math.min(100, Math.max(0, num)),
                      );
                    }}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.coeffPercent}>%</Text>
                  <TouchableOpacity
                    style={styles.coeffBtn2}
                    onPress={() =>
                      handleUpdateCoefficient(
                        key,
                        Math.min(100, value.percent + 1),
                      )
                    }
                  >
                    <Ionicons name="add" size={18} color={MODERN_COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetCoefficients}
            >
              <Text style={styles.resetBtnText}>Đặt lại mặc định</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setShowCoefficientsModal(false)}
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Save Modal */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.saveModalOverlay}>
          <View style={styles.saveModalContent}>
            <Text style={styles.saveModalTitle}>
              {isEditMode ? "Cập nhật dự toán" : "Lưu dự toán mới"}
            </Text>
            <Text style={styles.saveModalSubtitle}>
              Nhập tên để lưu bản dự toán này
            </Text>

            <TextInput
              style={styles.saveModalInput}
              value={estimateName}
              onChangeText={setEstimateName}
              placeholder="VD: Nhà phố 3 tầng - Quận 7"
              placeholderTextColor={MODERN_COLORS.textTertiary}
              autoFocus
            />

            <View style={styles.saveModalInfo}>
              <View style={styles.saveModalInfoRow}>
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={MODERN_COLORS.textSecondary}
                />
                <Text style={styles.saveModalInfoText}>
                  {BUILDING_TYPES.find((t) => t.id === buildingType)?.label} •{" "}
                  {floors} tầng
                </Text>
              </View>
              <View style={styles.saveModalInfoRow}>
                <Ionicons
                  name="resize-outline"
                  size={16}
                  color={MODERN_COLORS.textSecondary}
                />
                <Text style={styles.saveModalInfoText}>
                  {calculations.totalArea.toFixed(0)} m² •{" "}
                  {formatCurrency(calculations.totalCost)}
                </Text>
              </View>
            </View>

            <View style={styles.saveModalBtns}>
              <TouchableOpacity
                style={styles.saveModalCancelBtn}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.saveModalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveModalSaveBtn,
                  !estimateName.trim() && styles.saveModalSaveBtnDisabled,
                ]}
                onPress={handleSaveEstimate}
                disabled={!estimateName.trim()}
              >
                <LinearGradient
                  colors={
                    estimateName.trim()
                      ? ["#22c55e", "#16a34a"]
                      : ["#d1d5db", "#9ca3af"]
                  }
                  style={styles.saveModalSaveGradient}
                >
                  <Ionicons name="save" size={18} color="#fff" />
                  <Text style={styles.saveModalSaveText}>
                    {isEditMode ? "Cập nhật" : "Lưu"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  coeffBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.primaryLight,
    borderRadius: MODERN_RADIUS.md,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: MODERN_SPACING.md },

  // Section
  section: { marginBottom: MODERN_SPACING.lg },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },

  // Building Types
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
  typeCardActive: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.primaryLight,
  },
  typeIcon: { fontSize: 32, marginBottom: 8 },
  typeLabel: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  typeLabelActive: { color: MODERN_COLORS.primary },
  typeRate: { fontSize: 11, color: MODERN_COLORS.textSecondary, marginTop: 4 },

  // Construction Level
  levelList: { gap: MODERN_SPACING.sm },
  levelCard: {
    width: 120,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...MODERN_SHADOWS.sm,
  },
  levelCardActive: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.primaryLight,
  },
  levelLabel: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  levelLabelActive: { color: MODERN_COLORS.primary },
  levelDesc: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  levelMultiplier: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.textSecondary,
    marginTop: 6,
  },
  levelMultiplierActive: { color: MODERN_COLORS.primary },

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

  // Summary Card
  summaryCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
    ...MODERN_SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: MODERN_COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  summaryDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginVertical: MODERN_SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

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

  // Results Section
  resultsSection: { marginTop: MODERN_SPACING.md },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.md,
  },
  resultsTitle: { fontSize: 16, fontWeight: "700", color: MODERN_COLORS.text },

  // Cost Category
  costCategory: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  costCategoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
    paddingBottom: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  costCategoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  costCategoryTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  costItem: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  costItemLabel: { flex: 1, fontSize: 13, color: MODERN_COLORS.textSecondary },
  costItemPercent: {
    width: 40,
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
    textAlign: "center",
  },
  costItemValue: {
    width: 90,
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    textAlign: "right",
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
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  grandTotalValue: { fontSize: 24, fontWeight: "700", color: "#fff" },
  grandTotalMeta: { marginTop: MODERN_SPACING.sm },
  grandTotalMetaText: { fontSize: 12, color: "rgba(255,255,255,0.8)" },

  // Save Button
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingVertical: 14,
    marginTop: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: MODERN_COLORS.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: MODERN_COLORS.text },
  coeffSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
  },
  coeffSummaryText: { fontSize: 14, color: MODERN_COLORS.text },
  coeffSummaryValue: { fontWeight: "700", color: MODERN_COLORS.primary },
  coeffSummaryWarning: { color: MODERN_COLORS.warning },
  coeffWarning: { fontSize: 12, color: MODERN_COLORS.warning },
  coeffList: { flex: 1, padding: MODERN_SPACING.md },
  coeffItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  coeffLabel: { flex: 1, fontSize: 14, color: MODERN_COLORS.text },
  coeffInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  coeffBtn2: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  coeffInput: {
    width: 50,
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    textAlign: "center",
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
    padding: 8,
  },
  coeffPercent: { fontSize: 14, color: MODERN_COLORS.textSecondary },
  modalFooter: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    padding: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.primary,
  },
  applyBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },

  // Save Modal
  saveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: MODERN_SPACING.lg,
  },
  saveModalContent: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.lg,
  },
  saveModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    textAlign: "center",
  },
  saveModalSubtitle: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  saveModalInput: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    fontSize: 16,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.lg,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  saveModalInfo: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.md,
    gap: 8,
  },
  saveModalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveModalInfoText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  saveModalBtns: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.lg,
  },
  saveModalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },
  saveModalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  saveModalSaveBtn: {
    flex: 1,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
  },
  saveModalSaveBtnDisabled: {
    opacity: 0.6,
  },
  saveModalSaveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  saveModalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
