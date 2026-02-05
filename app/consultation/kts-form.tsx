/**
 * KTS Form Screen - Architect Cost Estimation Form
 * Form báo giá cho kiến trúc sư - "Phần dành cho KTS"
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

// Building types
const BUILDING_TYPES = [
  { id: "nha-pho", label: "Nhà phố" },
  { id: "biet-thu", label: "Biệt thự" },
  { id: "chung-cu", label: "Chung cư" },
  { id: "nha-vuon", label: "Nhà vườn" },
];

// Design styles
const DESIGN_STYLES = [
  { id: "hien-dai", label: "Hiện đại" },
  { id: "tan-co-dien", label: "Tân cổ điển" },
  { id: "co-dien", label: "Cổ điển" },
  { id: "toi-gian", label: "Tối giản" },
];

// Cost calculation rates
const COST_RATES = {
  design: 800000, // VND per m2
  construction: 6500000, // VND per m2
  interior: 2500000, // VND per m2
  landscape: 500000, // VND per m2
};

interface FormData {
  soNha: string;
  duong: string;
  phuong: string;
  thanhPho: string;
  khuDuAn: string;
  dienTichDat: string;
  matDoXayDung: string;
  soTang: string;
  luiTruoc: string;
  luiSau: string;
  luiTrai: string;
  luiPhai: string;
  buildingType: string;
  designStyle: string;
}

export default function KTSFormScreen() {
  const insets = useSafeAreaInsets();

  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    soNha: "",
    duong: "",
    phuong: "",
    thanhPho: "TP. Hồ Chí Minh",
    khuDuAn: "",
    dienTichDat: "",
    matDoXayDung: "70",
    soTang: "3",
    luiTruoc: "3",
    luiSau: "2",
    luiTrai: "0",
    luiPhai: "0",
    buildingType: "nha-pho",
    designStyle: "hien-dai",
  });

  // Customers list (mock)
  const customers = [
    { id: 1, name: "Nguyễn Văn A", phone: "0901234567" },
    { id: 2, name: "Trần Thị B", phone: "0912345678" },
    { id: 3, name: "Lê Văn C", phone: "0923456789" },
  ];

  // Calculate costs
  const calculations = useMemo(() => {
    const dienTich = parseFloat(formData.dienTichDat) || 0;
    const matDo = parseFloat(formData.matDoXayDung) || 70;
    const soTang = parseInt(formData.soTang) || 1;

    const dienTichXayDung = (dienTich * matDo) / 100;
    const dienTichSuDung = dienTichXayDung * soTang;

    const heSoPhongCach =
      formData.designStyle === "tan-co-dien"
        ? 1.3
        : formData.designStyle === "co-dien"
          ? 1.5
          : 1.0;

    const heSoLoaiNha = formData.buildingType === "biet-thu" ? 1.2 : 1.0;

    const chiPhiThietKe = Math.round(
      dienTichSuDung * COST_RATES.design * heSoPhongCach * heSoLoaiNha,
    );
    const chiPhiXayDung = Math.round(
      dienTichSuDung * COST_RATES.construction * heSoLoaiNha,
    );
    const chiPhiNoiThat = Math.round(
      dienTichSuDung * COST_RATES.interior * heSoPhongCach,
    );
    const chiPhiSanVuon = Math.round(dienTich * COST_RATES.landscape);

    const tongChiPhi =
      chiPhiThietKe + chiPhiXayDung + chiPhiNoiThat + chiPhiSanVuon;

    return {
      dienTichXayDung,
      dienTichSuDung,
      heSoPhongCach,
      heSoLoaiNha,
      chiPhiThietKe,
      chiPhiXayDung,
      chiPhiNoiThat,
      chiPhiSanVuon,
      tongChiPhi,
    };
  }, [formData]);

  const handleBack = useCallback(() => router.back(), []);

  const updateFormData = useCallback((key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectCustomer = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCustomerIndex(index);
  }, []);

  const handleSelectBuildingType = useCallback((typeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({ ...prev, buildingType: typeId }));
  }, []);

  const handleSelectStyle = useCallback((styleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({ ...prev, designStyle: styleId }));
  }, []);

  const handleSaveQuote = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Thành công", "Đã lưu báo giá cho khách hàng", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }, []);

  const handleSendToCustomer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Gửi báo giá",
      `Gửi báo giá cho ${customers[selectedCustomerIndex].name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Đã gửi", "Báo giá đã được gửi cho khách hàng");
          },
        },
      ],
    );
  }, [selectedCustomerIndex, customers]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu`;
    }
    return `${amount.toLocaleString("vi-VN")} đ`;
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
          <Text style={styles.headerTitle}>Quy trình thiết kế</Text>
          <Text style={styles.headerSubtitle}>(Phần dành cho KTS)</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveQuote}>
          <Ionicons
            name="save-outline"
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
          {/* Customer Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn khách hàng</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.customerList}
            >
              {customers.map((customer, index) => (
                <TouchableOpacity
                  key={customer.id}
                  style={[
                    styles.customerItem,
                    selectedCustomerIndex === index &&
                      styles.customerItemActive,
                  ]}
                  onPress={() => handleSelectCustomer(index)}
                >
                  <View style={styles.customerAvatar}>
                    <Text style={styles.customerAvatarText}>
                      {customer.name.charAt(0)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.customerName,
                      selectedCustomerIndex === index &&
                        styles.customerNameActive,
                    ]}
                  >
                    {customer.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Hidden Column Note */}
          <View style={styles.hiddenNote}>
            <Ionicons name="eye-off" size={16} color="#f59e0b" />
            <Text style={styles.hiddenNoteText}>Cột này ẩn với khách hàng</Text>
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin địa chỉ</Text>
            <View style={styles.formTable}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Số nhà</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.soNha}
                  onChangeText={(v) => updateFormData("soNha", v)}
                  placeholder="Nhập số nhà"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                />
              </View>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Đường</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.duong}
                  onChangeText={(v) => updateFormData("duong", v)}
                  placeholder="Nhập tên đường"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                />
              </View>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Phường/Xã</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.phuong}
                  onChangeText={(v) => updateFormData("phuong", v)}
                  placeholder="Nhập phường/xã"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                />
              </View>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Thành phố</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.thanhPho}
                  onChangeText={(v) => updateFormData("thanhPho", v)}
                  placeholder="Nhập thành phố"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                />
              </View>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Khu dự án</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.khuDuAn}
                  onChangeText={(v) => updateFormData("khuDuAn", v)}
                  placeholder="Nhập khu dự án (nếu có)"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                />
              </View>
            </View>
          </View>

          {/* Land Dimensions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông số xây dựng</Text>
            <View style={styles.formTable}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Diện tích đất (m²)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.dienTichDat}
                  onChangeText={(v) => updateFormData("dienTichDat", v)}
                  placeholder="VD: 100"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Mật độ xây dựng (%)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.matDoXayDung}
                  onChangeText={(v) => updateFormData("matDoXayDung", v)}
                  placeholder="VD: 70"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Số tầng</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.soTang}
                  onChangeText={(v) => updateFormData("soTang", v)}
                  placeholder="VD: 3"
                  placeholderTextColor={MODERN_COLORS.textDisabled}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Setbacks Grid */}
            <Text style={styles.subSectionTitle}>Khoảng lùi (m)</Text>
            <View style={styles.setbacksGrid}>
              <View style={styles.setbackItem}>
                <Text style={styles.setbackLabel}>Trước</Text>
                <TextInput
                  style={styles.setbackInput}
                  value={formData.luiTruoc}
                  onChangeText={(v) => updateFormData("luiTruoc", v)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.setbackItem}>
                <Text style={styles.setbackLabel}>Sau</Text>
                <TextInput
                  style={styles.setbackInput}
                  value={formData.luiSau}
                  onChangeText={(v) => updateFormData("luiSau", v)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.setbackItem}>
                <Text style={styles.setbackLabel}>Trái</Text>
                <TextInput
                  style={styles.setbackInput}
                  value={formData.luiTrai}
                  onChangeText={(v) => updateFormData("luiTrai", v)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.setbackItem}>
                <Text style={styles.setbackLabel}>Phải</Text>
                <TextInput
                  style={styles.setbackInput}
                  value={formData.luiPhai}
                  onChangeText={(v) => updateFormData("luiPhai", v)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Building Type & Style */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại công trình</Text>
            <View style={styles.optionsRow}>
              {BUILDING_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionChip,
                    formData.buildingType === type.id &&
                      styles.optionChipActive,
                  ]}
                  onPress={() => handleSelectBuildingType(type.id)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.buildingType === type.id &&
                        styles.optionChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[styles.sectionTitle, { marginTop: MODERN_SPACING.md }]}
            >
              Phong cách
            </Text>
            <View style={styles.optionsRow}>
              {DESIGN_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.optionChip,
                    formData.designStyle === style.id &&
                      styles.optionChipActive,
                  ]}
                  onPress={() => handleSelectStyle(style.id)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.designStyle === style.id &&
                        styles.optionChipTextActive,
                    ]}
                  >
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cost Calculation Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bảng tính chi phí</Text>
            <View style={styles.costTable}>
              {/* Header */}
              <View style={styles.costTableHeader}>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costTableHeaderText,
                    { flex: 2 },
                  ]}
                >
                  Hạng mục
                </Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costTableHeaderText,
                    { flex: 1 },
                  ]}
                >
                  Diện tích
                </Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costTableHeaderText,
                    { flex: 1 },
                  ]}
                >
                  Hệ số
                </Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costTableHeaderText,
                    { flex: 1.5 },
                  ]}
                >
                  Chi phí
                </Text>
              </View>

              {/* Design Fee */}
              <View style={styles.costTableRow}>
                <Text style={[styles.costTableCell, { flex: 2 }]}>
                  Thiết kế
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>
                  {calculations.dienTichSuDung.toFixed(0)}m²
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>
                  {calculations.heSoPhongCach.toFixed(1)}
                </Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costValue,
                    { flex: 1.5 },
                  ]}
                >
                  {formatCurrency(calculations.chiPhiThietKe)}
                </Text>
              </View>

              {/* Construction */}
              <View style={styles.costTableRow}>
                <Text style={[styles.costTableCell, { flex: 2 }]}>
                  Xây dựng
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>
                  {calculations.dienTichSuDung.toFixed(0)}m²
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>
                  {calculations.heSoLoaiNha.toFixed(1)}
                </Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costValue,
                    { flex: 1.5 },
                  ]}
                >
                  {formatCurrency(calculations.chiPhiXayDung)}
                </Text>
              </View>

              {/* Interior */}
              <View style={styles.costTableRow}>
                <Text style={[styles.costTableCell, { flex: 2 }]}>
                  Nội thất
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>
                  {calculations.dienTichSuDung.toFixed(0)}m²
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>
                  {calculations.heSoPhongCach.toFixed(1)}
                </Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costValue,
                    { flex: 1.5 },
                  ]}
                >
                  {formatCurrency(calculations.chiPhiNoiThat)}
                </Text>
              </View>

              {/* Landscape */}
              <View style={styles.costTableRow}>
                <Text style={[styles.costTableCell, { flex: 2 }]}>
                  Sân vườn
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>
                  {formData.dienTichDat || 0}m²
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}>1.0</Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costValue,
                    { flex: 1.5 },
                  ]}
                >
                  {formatCurrency(calculations.chiPhiSanVuon)}
                </Text>
              </View>

              {/* Total */}
              <View style={[styles.costTableRow, styles.costTableTotalRow]}>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costTableTotalText,
                    { flex: 2 },
                  ]}
                >
                  TỔNG CỘNG
                </Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}></Text>
                <Text style={[styles.costTableCell, { flex: 1 }]}></Text>
                <Text
                  style={[
                    styles.costTableCell,
                    styles.costTableTotalValue,
                    { flex: 1.5 },
                  ]}
                >
                  {formatCurrency(calculations.tongChiPhi)}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.sendToCustomerBtn}
          onPress={handleSendToCustomer}
        >
          <LinearGradient
            colors={[MODERN_COLORS.primary, "#16a34a"]}
            style={styles.sendBtnGradient}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.sendBtnText}>Gửi cho khách hàng</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  flex1: {
    flex: 1,
  },
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: MODERN_SPACING.md,
  },

  // Section
  section: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },

  // Hidden Note
  hiddenNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    padding: MODERN_SPACING.sm,
    backgroundColor: "#fef3c7",
    borderRadius: MODERN_RADIUS.md,
  },
  hiddenNoteText: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: "500",
  },

  // Customer Selector
  customerList: {
    gap: MODERN_SPACING.sm,
    paddingVertical: 4,
  },
  customerItem: {
    alignItems: "center",
    padding: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    minWidth: 80,
  },
  customerItemActive: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  customerAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  customerName: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
  },
  customerNameActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  // Form Table
  formTable: {
    gap: 0,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  formLabel: {
    flex: 1,
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  formInput: {
    flex: 1.5,
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.text,
    textAlign: "right",
    padding: 8,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
  },

  // Setbacks Grid
  setbacksGrid: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  setbackItem: {
    flex: 1,
    alignItems: "center",
  },
  setbackLabel: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 4,
  },
  setbackInput: {
    width: "100%",
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.text,
    textAlign: "center",
    padding: 8,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },

  // Options (Building Type / Style)
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  optionChip: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 8,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.full,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  optionChipActive: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    borderColor: MODERN_COLORS.primary,
  },
  optionChipText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  optionChipTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  // Cost Table
  costTable: {
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
  },
  costTableHeader: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.primary,
    paddingVertical: 10,
  },
  costTableHeaderText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  costTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
    paddingVertical: 10,
  },
  costTableCell: {
    paddingHorizontal: 8,
    fontSize: 12,
    color: MODERN_COLORS.text,
  },
  costValue: {
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  costTableTotalRow: {
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 0,
  },
  costTableTotalText: {
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  costTableTotalValue: {
    fontWeight: "700",
    fontSize: 13,
    color: MODERN_COLORS.primary,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.lg,
  },
  sendToCustomerBtn: {
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
  },
  sendBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
