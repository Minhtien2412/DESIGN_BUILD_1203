/**
 * Quick Estimate Screen — Dự toán nhanh
 * =========================================
 * Fast instant estimate: area + type + grade → result in seconds.
 * No need for full project wizard — ideal for quick consultations.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BUILDING_TYPE_META,
    type BuildingType,
    type ConstructionGrade,
    GRADE_META,
    type QuickEstimateResult,
    formatVND,
    formatVNDFull,
    quickEstimate,
} from "../../services/constructionEstimateEngine";

// ─── Palette ────────────────────────────────────────────────────────
const C = {
  bg: "#F3F4F6",
  card: "#FFFFFF",
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#CCFBF1",
  accent: "#F59E0B",
  text: "#111827",
  textSec: "#6B7280",
  textTer: "#9CA3AF",
  border: "#E5E7EB",
  inputBg: "#F9FAFB",
  success: "#10B981",
};

export default function QuickEstimateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Form state
  const [buildingType, setBuildingType] = useState<BuildingType>("nha-pho");
  const [grade, setGrade] = useState<ConstructionGrade>("standard");
  const [landArea, setLandArea] = useState("100");
  const [density, setDensity] = useState("80");
  const [numFloors, setNumFloors] = useState("3");

  // Result
  const [result, setResult] = useState<QuickEstimateResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const animVal = useRef(new Animated.Value(0)).current;

  const doQuickEstimate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = quickEstimate({
      buildingType,
      grade,
      landArea: parseFloat(landArea) || 100,
      density: parseFloat(density) || 80,
      numFloors: parseInt(numFloors, 10) || 1,
    });
    setResult(res);
    setShowResult(true);
    Animated.spring(animVal, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [buildingType, grade, landArea, density, numFloors, animVal]);

  const resetForm = useCallback(() => {
    setShowResult(false);
    setResult(null);
    animVal.setValue(0);
  }, [animVal]);

  const TypeButton = ({
    type,
    label,
  }: {
    type: BuildingType;
    label: string;
  }) => (
    <Pressable
      style={[styles.typeBtn, buildingType === type && styles.typeBtnActive]}
      onPress={() => {
        setBuildingType(type);
        Haptics.selectionAsync();
      }}
    >
      <Text
        style={[
          styles.typeBtnText,
          buildingType === type && styles.typeBtnTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const GradeButton = ({
    g,
    label,
    mult,
  }: {
    g: ConstructionGrade;
    label: string;
    mult: number;
  }) => (
    <Pressable
      style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}
      onPress={() => {
        setGrade(g);
        Haptics.selectionAsync();
      }}
    >
      <Text
        style={[
          styles.gradeBtnLabel,
          grade === g && styles.gradeBtnLabelActive,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[styles.gradeBtnMult, grade === g && styles.gradeBtnMultActive]}
      >
        ×{mult}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={[C.primaryDark, C.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Dự toán nhanh</Text>
          <Ionicons name="flash" size={22} color={C.accent} />
        </View>
        <Text style={styles.headerSub}>
          Nhập thông tin cơ bản → nhận kết quả tức thì
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!showResult ? (
            <>
              {/* Building type */}
              <Text style={styles.sectionLabel}>Loại công trình</Text>
              <View style={styles.typeGrid}>
                {(
                  Object.entries(BUILDING_TYPE_META) as [
                    BuildingType,
                    (typeof BUILDING_TYPE_META)[BuildingType],
                  ][]
                ).map(([key, meta]) => (
                  <TypeButton key={key} type={key} label={meta.label} />
                ))}
              </View>

              {/* Grade */}
              <Text style={styles.sectionLabel}>Cấp xây dựng</Text>
              <View style={styles.gradeGrid}>
                {(
                  Object.entries(GRADE_META) as [
                    ConstructionGrade,
                    (typeof GRADE_META)[ConstructionGrade],
                  ][]
                ).map(([key, meta]) => (
                  <GradeButton
                    key={key}
                    g={key}
                    label={meta.label}
                    mult={meta.multiplier}
                  />
                ))}
              </View>

              {/* Inputs */}
              <Text style={styles.sectionLabel}>Thông số</Text>
              <View style={styles.card}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Diện tích đất</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={landArea}
                      onChangeText={setLandArea}
                      keyboardType="numeric"
                      placeholder="100"
                      placeholderTextColor={C.textTer}
                    />
                    <Text style={styles.inputUnit}>m²</Text>
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Mật độ xây dựng</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={density}
                      onChangeText={setDensity}
                      keyboardType="numeric"
                      placeholder="80"
                      placeholderTextColor={C.textTer}
                    />
                    <Text style={styles.inputUnit}>%</Text>
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Số tầng</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={numFloors}
                      onChangeText={setNumFloors}
                      keyboardType="numeric"
                      placeholder="3"
                      placeholderTextColor={C.textTer}
                    />
                    <Text style={styles.inputUnit}>tầng</Text>
                  </View>
                </View>

                {/* Quick info box */}
                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={C.primary}
                  />
                  <Text style={styles.infoText}>
                    Diện tích sàn XD:{" "}
                    {(
                      ((parseFloat(landArea) || 0) *
                        (parseFloat(density) || 0)) /
                      100
                    ).toFixed(0)}{" "}
                    m² × {numFloors || "1"} tầng ≈{" "}
                    {(
                      (((parseFloat(landArea) || 0) *
                        (parseFloat(density) || 0)) /
                        100) *
                      (parseInt(numFloors, 10) || 1)
                    ).toFixed(0)}{" "}
                    m²
                  </Text>
                </View>
              </View>

              {/* Calculate button */}
              <Pressable style={styles.calcBtn} onPress={doQuickEstimate}>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.calcBtnText}>Tính ngay</Text>
              </Pressable>
            </>
          ) : result ? (
            <Animated.View
              style={{
                opacity: animVal,
                transform: [
                  {
                    translateY: animVal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Grand total card */}
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>DỰ TOÁN NHANH</Text>
                <Text style={styles.totalValue}>
                  {formatVNDFull(result.grandTotal)}
                </Text>
                <View style={styles.totalMeta}>
                  <View style={styles.totalMetaItem}>
                    <Text style={styles.totalMetaLabel}>Diện tích</Text>
                    <Text style={styles.totalMetaVal}>
                      {result.totalArea} m²
                    </Text>
                  </View>
                  <View style={styles.totalMetaDivider} />
                  <View style={styles.totalMetaItem}>
                    <Text style={styles.totalMetaLabel}>Đơn giá/m²</Text>
                    <Text style={styles.totalMetaVal}>
                      {formatVND(result.perM2)}
                    </Text>
                  </View>
                  <View style={styles.totalMetaDivider} />
                  <View style={styles.totalMetaItem}>
                    <Text style={styles.totalMetaLabel}>Nhân công</Text>
                    <Text style={styles.totalMetaVal}>
                      {result.laborDays} công
                    </Text>
                  </View>
                </View>
              </View>

              {/* Config summary */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Cấu hình</Text>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Loại công trình</Text>
                  <Text style={styles.configValue}>
                    {BUILDING_TYPE_META[result.buildingType].label}
                  </Text>
                </View>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Cấp xây dựng</Text>
                  <Text style={styles.configValue}>
                    {GRADE_META[result.grade].label}
                  </Text>
                </View>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Diện tích đất</Text>
                  <Text style={styles.configValue}>{landArea} m²</Text>
                </View>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Số tầng</Text>
                  <Text style={styles.configValue}>{numFloors} tầng</Text>
                </View>
              </View>

              {/* Breakdown */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Phân tích chi phí</Text>
                {result.breakdown.map((item) => (
                  <View key={item.label} style={styles.breakdownRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.breakdownLabel}>{item.label}</Text>
                      <View style={styles.bar}>
                        <View
                          style={[
                            styles.barFill,
                            { width: `${Math.min(item.pct, 100)}%` },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.breakdownRight}>
                      <Text style={styles.breakdownValue}>
                        {formatVND(item.value)}
                      </Text>
                      <Text style={styles.breakdownPct}>
                        {item.pct.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <Pressable style={styles.actionOutline} onPress={resetForm}>
                  <Ionicons name="refresh" size={18} color={C.primary} />
                  <Text style={styles.actionOutlineText}>Tính lại</Text>
                </Pressable>
                <Pressable
                  style={styles.actionFill}
                  onPress={() =>
                    router.push("/calculators/project-estimate" as any)
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.actionFillText}>
                    Tạo dự toán chi tiết
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    marginLeft: 36,
  },

  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 100 },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
    marginTop: 16,
  },

  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    minWidth: "30%",
    alignItems: "center",
  },
  typeBtnActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  typeBtnText: { fontSize: 12, fontWeight: "600", color: C.textSec },
  typeBtnTextActive: { color: C.primaryDark },

  gradeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
  },
  gradeBtnActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  gradeBtnLabel: { fontSize: 11, fontWeight: "600", color: C.textSec },
  gradeBtnLabelActive: { color: C.primaryDark },
  gradeBtnMult: { fontSize: 10, color: C.textTer, marginTop: 2 },
  gradeBtnMultActive: { color: C.primary },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },

  inputRow: { marginBottom: 14 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 6,
  },
  inputWrap: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  inputUnit: {
    fontSize: 13,
    color: C.textSec,
    marginLeft: 8,
    minWidth: 35,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  infoText: { fontSize: 12, color: C.primaryDark, fontWeight: "500", flex: 1 },

  calcBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.primary,
    borderRadius: 24,
    paddingVertical: 16,
    marginTop: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calcBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Result
  totalCard: {
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginTop: 6,
  },
  totalMeta: {
    flexDirection: "row",
    marginTop: 16,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  totalMetaItem: { alignItems: "center" },
  totalMetaLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)" },
  totalMetaVal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginTop: 2,
  },
  totalMetaDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  configLabel: { fontSize: 13, color: C.textSec },
  configValue: { fontSize: 13, fontWeight: "600", color: C.text },

  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  breakdownLabel: {
    fontSize: 13,
    color: C.text,
    fontWeight: "500",
    marginBottom: 4,
  },
  bar: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, backgroundColor: C.primary, borderRadius: 2 },
  breakdownRight: { alignItems: "flex-end", marginLeft: 12, minWidth: 80 },
  breakdownValue: { fontSize: 13, fontWeight: "700", color: C.text },
  breakdownPct: { fontSize: 10, color: C.textTer, marginTop: 1 },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  actionOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: C.card,
  },
  actionOutlineText: { fontSize: 13, fontWeight: "600", color: C.primary },
  actionFill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  actionFillText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});
