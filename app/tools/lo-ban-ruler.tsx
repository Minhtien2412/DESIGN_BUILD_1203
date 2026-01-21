/**
 * Thước Lỗ Ban - Công cụ đo phong thủy
 * Tính toán kích thước theo thước Lỗ Ban (Lu Ban ruler)
 * Created: 19/01/2026
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
import React, { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==================== LỖ BAN DATA ====================

// Thước Lỗ Ban có 8 cung, mỗi cung 5.4cm = 54mm
const LO_BAN_UNIT = 54; // mm

// 8 Cung của thước Lỗ Ban (theo thứ tự)
const LO_BAN_CUNG = [
  {
    id: 1,
    name: "Tài",
    nameHan: "財",
    meaning: "Tài lộc, của cải",
    description: "Đại cát - Mang lại tài lộc, thịnh vượng",
    type: "good",
    color: "#22c55e",
    subCung: [
      { name: "Tài Đức", meaning: "Đức độ mang tài lộc" },
      { name: "Bảo Khố", meaning: "Kho báu dồi dào" },
      { name: "Lục Hợp", meaning: "Thuận hòa mọi bề" },
      { name: "Nghênh Phúc", meaning: "Đón phúc đến nhà" },
    ],
  },
  {
    id: 2,
    name: "Bệnh",
    nameHan: "病",
    meaning: "Bệnh tật, ốm đau",
    description: "Hung - Dễ gây ra bệnh tật, sức khỏe kém",
    type: "bad",
    color: "#ef4444",
    subCung: [
      { name: "Thoái Tài", meaning: "Mất của cải" },
      { name: "Công Sự", meaning: "Kiện cáo tranh chấp" },
      { name: "Lao Chấp", meaning: "Lao tù khốn khổ" },
      { name: "Cô Quả", meaning: "Cô đơn góa bụa" },
    ],
  },
  {
    id: 3,
    name: "Ly",
    nameHan: "離",
    meaning: "Ly biệt, chia cách",
    description: "Hung - Chia ly, xa cách người thân",
    type: "bad",
    color: "#f97316",
    subCung: [
      { name: "Trường Khố", meaning: "Mất mát kéo dài" },
      { name: "Kiếp Tài", meaning: "Bị cướp của cải" },
      { name: "Quan Quỷ", meaning: "Gặp quỷ quan làm hại" },
      { name: "Thất Thoát", meaning: "Mất mát hao tổn" },
    ],
  },
  {
    id: 4,
    name: "Nghĩa",
    nameHan: "義",
    meaning: "Nghĩa khí, đạo đức",
    description: "Cát - Tình nghĩa, đạo lý tốt đẹp",
    type: "good",
    color: "#3b82f6",
    subCung: [
      { name: "Thiêm Đinh", meaning: "Thêm con cháu" },
      { name: "Ích Lợi", meaning: "Được lợi ích" },
      { name: "Quý Tử", meaning: "Con cái quý hiển" },
      { name: "Đại Cát", meaning: "Vô cùng tốt lành" },
    ],
  },
  {
    id: 5,
    name: "Quan",
    nameHan: "官",
    meaning: "Quan lộc, công danh",
    description: "Cát - Thăng quan tiến chức",
    type: "good",
    color: "#8b5cf6",
    subCung: [
      { name: "Thuận Khoa", meaning: "Thi đỗ thuận lợi" },
      { name: "Hoành Tài", meaning: "Tiền của bất ngờ" },
      { name: "Tiến Ích", meaning: "Tăng tiến ích lợi" },
      { name: "Phú Quý", meaning: "Giàu sang phú quý" },
    ],
  },
  {
    id: 6,
    name: "Kiếp",
    nameHan: "劫",
    meaning: "Kiếp nạn, tai họa",
    description: "Đại hung - Gặp tai ương, kiếp nạn",
    type: "bad",
    color: "#dc2626",
    subCung: [
      { name: "Tử Biệt", meaning: "Sinh ly tử biệt" },
      { name: "Thoái Khẩu", meaning: "Cãi vã bất hòa" },
      { name: "Ly Hương", meaning: "Xa quê hương" },
      { name: "Tài Thất", meaning: "Mất hết tài sản" },
    ],
  },
  {
    id: 7,
    name: "Hại",
    nameHan: "害",
    meaning: "Tai hại, tổn thương",
    description: "Hung - Gây hại cho sức khỏe và tài lộc",
    type: "bad",
    color: "#ea580c",
    subCung: [
      { name: "Tai Chí", meaning: "Tai họa đến" },
      { name: "Tử Tuyệt", meaning: "Diệt vong tuyệt tự" },
      { name: "Bệnh Lâm", meaning: "Bệnh tật ập đến" },
      { name: "Khẩu Thiệt", meaning: "Thị phi miệng lưỡi" },
    ],
  },
  {
    id: 8,
    name: "Bản",
    nameHan: "本",
    meaning: "Căn bản, gốc rễ",
    description: "Cát - Vững chắc, ổn định",
    type: "good",
    color: "#10b981",
    subCung: [
      { name: "Tài Chí", meaning: "Tài lộc đến" },
      { name: "Đăng Khoa", meaning: "Thi cử đỗ đạt" },
      { name: "Tiến Bảo", meaning: "Được của báu" },
      { name: "Hưng Vượng", meaning: "Hưng thịnh vượng phát" },
    ],
  },
];

// Các loại kích thước phổ biến
const DIMENSION_TYPES = [
  {
    id: "door",
    label: "Cửa chính",
    icon: "enter-outline",
    placeholder: "VD: 2100",
  },
  {
    id: "window",
    label: "Cửa sổ",
    icon: "grid-outline",
    placeholder: "VD: 1200",
  },
  { id: "bed", label: "Giường", icon: "bed-outline", placeholder: "VD: 1800" },
  {
    id: "desk",
    label: "Bàn làm việc",
    icon: "desktop-outline",
    placeholder: "VD: 1200",
  },
  {
    id: "altar",
    label: "Bàn thờ",
    icon: "flame-outline",
    placeholder: "VD: 1070",
  },
  {
    id: "cabinet",
    label: "Tủ",
    icon: "file-tray-stacked-outline",
    placeholder: "VD: 800",
  },
];

// ==================== UTILITIES ====================

interface LoBanResult {
  cung: (typeof LO_BAN_CUNG)[0];
  subCung: { name: string; meaning: string };
  position: number; // Vị trí trong cung (1-4)
  isGood: boolean;
  nearestGood: number | null; // Kích thước tốt gần nhất
}

function calculateLoBan(sizeInMm: number): LoBanResult {
  // Tính vị trí trong chu kỳ 8 cung (432mm = 8 x 54mm)
  const cycleLength = LO_BAN_UNIT * 8; // 432mm
  const positionInCycle = sizeInMm % cycleLength;

  // Xác định cung (0-7)
  const cungIndex = Math.floor(positionInCycle / LO_BAN_UNIT);
  const cung = LO_BAN_CUNG[cungIndex];

  // Xác định tiểu cung (0-3) trong cung
  const positionInCung = positionInCycle % LO_BAN_UNIT;
  const subCungIndex = Math.floor((positionInCung / LO_BAN_UNIT) * 4);
  const subCung = cung.subCung[Math.min(subCungIndex, 3)];

  // Tìm kích thước tốt gần nhất
  let nearestGood: number | null = null;
  if (cung.type === "bad") {
    // Tìm cung tốt gần nhất
    const goodCungIndexes = [0, 3, 4, 7]; // Tài, Nghĩa, Quan, Bản
    let minDiff = Infinity;

    for (const goodIdx of goodCungIndexes) {
      // Tính khoảng cách đến đầu cung tốt
      const goodCungStart =
        Math.floor(sizeInMm / cycleLength) * cycleLength +
        goodIdx * LO_BAN_UNIT;
      const diff = Math.abs(goodCungStart - sizeInMm);
      const diffNext = Math.abs(goodCungStart + cycleLength - sizeInMm);
      const diffPrev = Math.abs(goodCungStart - cycleLength - sizeInMm);

      const closestDiff = Math.min(diff, diffNext, diffPrev);
      if (closestDiff < minDiff) {
        minDiff = closestDiff;
        if (diff === closestDiff) nearestGood = goodCungStart + LO_BAN_UNIT / 2;
        else if (diffNext === closestDiff)
          nearestGood = goodCungStart + cycleLength + LO_BAN_UNIT / 2;
        else nearestGood = goodCungStart - cycleLength + LO_BAN_UNIT / 2;
      }
    }

    // Làm tròn đến mm
    if (nearestGood !== null && nearestGood > 0) {
      nearestGood = Math.round(nearestGood);
    }
  }

  return {
    cung,
    subCung,
    position: subCungIndex + 1,
    isGood: cung.type === "good",
    nearestGood,
  };
}

// ==================== COMPONENTS ====================

interface CungCardProps {
  cung: (typeof LO_BAN_CUNG)[0];
  isActive?: boolean;
  onPress?: () => void;
}

const CungCard: React.FC<CungCardProps> = ({ cung, isActive, onPress }) => (
  <TouchableOpacity
    style={[
      styles.cungCard,
      isActive && { borderColor: cung.color, borderWidth: 2 },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.cungIcon, { backgroundColor: cung.color + "20" }]}>
      <Text style={[styles.cungHan, { color: cung.color }]}>
        {cung.nameHan}
      </Text>
    </View>
    <Text style={styles.cungName}>{cung.name}</Text>
    <View
      style={[
        styles.cungBadge,
        { backgroundColor: cung.type === "good" ? "#22c55e" : "#ef4444" },
      ]}
    >
      <Text style={styles.cungBadgeText}>
        {cung.type === "good" ? "Cát" : "Hung"}
      </Text>
    </View>
  </TouchableOpacity>
);

// ==================== MAIN SCREEN ====================

export default function LoBanRulerScreen() {
  const [inputValue, setInputValue] = useState("");
  const [unit, setUnit] = useState<"mm" | "cm" | "m">("mm");
  const [dimensionType, setDimensionType] = useState("door");
  const [selectedCung, setSelectedCung] = useState<
    (typeof LO_BAN_CUNG)[0] | null
  >(null);

  // Convert input to mm
  const sizeInMm = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return 0;
    switch (unit) {
      case "cm":
        return num * 10;
      case "m":
        return num * 1000;
      default:
        return num;
    }
  }, [inputValue, unit]);

  // Calculate Lo Ban result
  const result = useMemo(() => {
    if (sizeInMm <= 0) return null;
    return calculateLoBan(sizeInMm);
  }, [sizeInMm]);

  // Handle calculate
  const handleCalculate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Handle suggest good size
  const handleSuggestSize = useCallback(() => {
    if (result?.nearestGood) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      let suggested = result.nearestGood;
      switch (unit) {
        case "cm":
          suggested = suggested / 10;
          break;
        case "m":
          suggested = suggested / 1000;
          break;
      }
      setInputValue(suggested.toString());
    }
  }, [result, unit]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={MODERN_COLORS.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerHan}>魯班尺</Text>
          <Text style={styles.headerText}>Thước Lỗ Ban</Text>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setSelectedCung(LO_BAN_CUNG[0])}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={MODERN_COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dimension Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Loại kích thước</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeRow}>
              {DIMENSION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    dimensionType === type.id && styles.typeChipActive,
                  ]}
                  onPress={() => setDimensionType(type.id)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={18}
                    color={
                      dimensionType === type.id
                        ? "#fff"
                        : MODERN_COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      dimensionType === type.id && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 Nhập kích thước</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={
                DIMENSION_TYPES.find((t) => t.id === dimensionType)?.placeholder
              }
              placeholderTextColor={MODERN_COLORS.textSecondary}
              keyboardType="numeric"
              onSubmitEditing={handleCalculate}
            />
            <View style={styles.unitSelector}>
              {(["mm", "cm", "m"] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitButton,
                    unit === u && styles.unitButtonActive,
                  ]}
                  onPress={() => setUnit(u)}
                >
                  <Text
                    style={[
                      styles.unitText,
                      unit === u && styles.unitTextActive,
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Result Section */}
        {result && (
          <View style={styles.resultSection}>
            <LinearGradient
              colors={
                result.isGood
                  ? ["#22c55e15", "#22c55e05"]
                  : ["#ef444415", "#ef444405"]
              }
              style={styles.resultCard}
            >
              <View style={styles.resultHeader}>
                <View
                  style={[
                    styles.resultCungIcon,
                    { backgroundColor: result.cung.color },
                  ]}
                >
                  <Text style={styles.resultCungHan}>
                    {result.cung.nameHan}
                  </Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultCungName}>{result.cung.name}</Text>
                  <Text style={styles.resultMeaning}>
                    {result.cung.meaning}
                  </Text>
                </View>
                <View
                  style={[
                    styles.resultBadge,
                    { backgroundColor: result.isGood ? "#22c55e" : "#ef4444" },
                  ]}
                >
                  <Ionicons
                    name={result.isGood ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.resultBadgeText}>
                    {result.isGood ? "CÁT" : "HUNG"}
                  </Text>
                </View>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.subCungInfo}>
                <Text style={styles.subCungLabel}>Tiểu cung:</Text>
                <Text style={styles.subCungName}>{result.subCung.name}</Text>
                <Text style={styles.subCungMeaning}>
                  {result.subCung.meaning}
                </Text>
              </View>

              <Text style={styles.resultDescription}>
                {result.cung.description}
              </Text>

              {!result.isGood && result.nearestGood && (
                <TouchableOpacity
                  style={styles.suggestButton}
                  onPress={handleSuggestSize}
                >
                  <Ionicons name="bulb" size={18} color="#fff" />
                  <Text style={styles.suggestText}>
                    Gợi ý kích thước tốt: {result.nearestGood}
                    {unit === "mm" ? "" : unit === "cm" ? "/10" : "/1000"}{" "}
                    {unit}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Lo Ban Ruler Visual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧭 Bảng 8 Cung Lỗ Ban</Text>
          <View style={styles.cungGrid}>
            {LO_BAN_CUNG.map((cung) => (
              <CungCard
                key={cung.id}
                cung={cung}
                isActive={result?.cung.id === cung.id}
                onPress={() => setSelectedCung(cung)}
              />
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Về Thước Lỗ Ban</Text>
          <Text style={styles.infoText}>
            Thước Lỗ Ban (魯班尺) là công cụ đo lường phong thủy có nguồn gốc từ
            Trung Quốc cổ đại. Thước gồm 8 cung, mỗi cung dài 5.4cm (54mm), tổng
            chu kỳ 43.2cm.
          </Text>
          <Text style={styles.infoText}>
            • <Text style={{ color: "#22c55e" }}>4 Cung Cát (Tốt)</Text>: Tài,
            Nghĩa, Quan, Bản{"\n"}•{" "}
            <Text style={{ color: "#ef4444" }}>4 Cung Hung (Xấu)</Text>: Bệnh,
            Ly, Kiếp, Hại
          </Text>
          <Text style={styles.infoText}>
            Sử dụng để đo kích thước cửa, bàn thờ, giường, tủ... để chọn kích
            thước hợp phong thủy.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cung Detail Modal */}
      {selectedCung && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCung(null)}
        >
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: selectedCung.color },
              ]}
            >
              <Text style={styles.modalHan}>{selectedCung.nameHan}</Text>
              <Text style={styles.modalName}>{selectedCung.name}</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalMeaning}>{selectedCung.meaning}</Text>
              <Text style={styles.modalDescription}>
                {selectedCung.description}
              </Text>
              <View style={styles.modalDivider} />
              <Text style={styles.modalSubTitle}>4 Tiểu cung:</Text>
              {selectedCung.subCung.map((sub, idx) => (
                <View key={idx} style={styles.modalSubItem}>
                  <Text style={styles.modalSubName}>
                    {idx + 1}. {sub.name}
                  </Text>
                  <Text style={styles.modalSubMeaning}>{sub.meaning}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedCung(null)}
            >
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    alignItems: "center",
  },
  headerHan: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  headerText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: MODERN_SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },
  typeRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  typeChipText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },
  typeChipTextActive: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  unitSelector: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: 4,
  },
  unitButton: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
  },
  unitButtonActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  unitTextActive: {
    color: "#fff",
  },
  resultSection: {
    paddingHorizontal: MODERN_SPACING.md,
  },
  resultCard: {
    borderRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.lg,
    ...MODERN_SHADOWS.md,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  resultCungIcon: {
    width: 56,
    height: 56,
    borderRadius: MODERN_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  resultCungHan: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  resultInfo: {
    flex: 1,
  },
  resultCungName: {
    fontSize: 22,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  resultMeaning: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  resultBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  resultDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginVertical: MODERN_SPACING.md,
  },
  subCungInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.sm,
  },
  subCungLabel: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  subCungName: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  subCungMeaning: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    fontStyle: "italic",
  },
  resultDescription: {
    fontSize: 14,
    color: MODERN_COLORS.textPrimary,
    lineHeight: 20,
  },
  suggestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22c55e",
    paddingVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    marginTop: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  suggestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  cungGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  cungCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 3) / 4,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.sm,
    alignItems: "center",
  },
  cungIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cungHan: {
    fontSize: 18,
    fontWeight: "700",
  },
  cungName: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 4,
  },
  cungBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cungBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
  },
  infoSection: {
    margin: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: MODERN_SPACING.sm,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: MODERN_SPACING.lg,
  },
  modalContent: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.xl,
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
  },
  modalHeader: {
    padding: MODERN_SPACING.lg,
    alignItems: "center",
  },
  modalHan: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  modalName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  modalBody: {
    padding: MODERN_SPACING.md,
  },
  modalMeaning: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  modalDescription: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
  },
  modalDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginVertical: MODERN_SPACING.md,
  },
  modalSubTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },
  modalSubItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: MODERN_SPACING.sm,
  },
  modalSubName: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
  },
  modalSubMeaning: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    fontStyle: "italic",
  },
  modalClose: {
    padding: MODERN_SPACING.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
});
