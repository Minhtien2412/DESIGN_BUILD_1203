/**
 * Trình mẫu - Lưu mẫu - Step 3: Xác nhận chất lượng vật tư
 * Route: /vlxd/sample-approval
 * Face ID xác nhận NCC & Kỹ sư giám sát
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

// ── Types ──────────────────────────────────────────────────────────────
type ApprovalStatus = "pending" | "approved" | "rejected";

interface SampleItem {
  id: string;
  name: string;
  category: string;
  quality: ApprovalStatus;
  notes: string;
}

// ── Data ───────────────────────────────────────────────────────────────
const INITIAL_SAMPLES: SampleItem[] = [
  {
    id: "da_mi",
    name: "Đá mi",
    category: "Đá",
    quality: "pending",
    notes: "",
  },
  {
    id: "cat_bt",
    name: "Cát bê tông",
    category: "Cát",
    quality: "pending",
    notes: "",
  },
  {
    id: "thep_cb4",
    name: "Thép VN CB4",
    category: "Thép",
    quality: "pending",
    notes: "",
  },
  {
    id: "xm_htien",
    name: "Xi măng Hà Tiên đa dụng",
    category: "Xi măng",
    quality: "pending",
    notes: "",
  },
  {
    id: "gach_qt",
    name: "Gạch tuynen Quốc Toàn",
    category: "Gạch",
    quality: "pending",
    notes: "",
  },
];

// ── Component ──────────────────────────────────────────────────────────
export default function SampleApprovalScreen() {
  const [samples, setSamples] = useState<SampleItem[]>(INITIAL_SAMPLES);
  const [supplierConfirmed, setSupplierConfirmed] = useState(false);
  const [engineerConfirmed, setEngineerConfirmed] = useState(false);

  const updateQuality = (id: string, quality: ApprovalStatus) => {
    setSamples((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quality } : s)),
    );
  };

  const allSamplesReviewed = samples.every((s) => s.quality !== "pending");
  const approvedCount = samples.filter((s) => s.quality === "approved").length;
  const rejectedCount = samples.filter((s) => s.quality === "rejected").length;

  const handleFaceID = (role: "supplier" | "engineer") => {
    // Simulate Face ID
    Alert.alert(
      "Xác nhận Face ID",
      `${role === "supplier" ? "Nhà cung cấp" : "Kỹ sư giám sát"} xác nhận bằng Face ID`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => {
            if (role === "supplier") setSupplierConfirmed(true);
            else setEngineerConfirmed(true);
          },
        },
      ],
    );
  };

  const handleSubmit = () => {
    if (!allSamplesReviewed) {
      Alert.alert("Chưa hoàn tất", "Vui lòng đánh giá tất cả mẫu vật tư");
      return;
    }
    if (!supplierConfirmed || !engineerConfirmed) {
      Alert.alert(
        "Chưa xác nhận",
        "Cần xác nhận Face ID từ cả NCC và KS giám sát",
      );
      return;
    }
    Alert.alert("Thành công", "Trình mẫu đã được xác nhận", [
      {
        text: "Chọn NCC & Đặt hàng",
        onPress: () => router.push("/vlxd/supplier-selection" as any),
      },
    ]);
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
          <Text style={styles.headerTitle}>Trình mẫu - Lưu mẫu</Text>
          <Text style={styles.headerStep}>Bước 3/4 • MS102</Text>
        </View>
        <View style={styles.stepIndicator}>
          <View style={styles.stepDotDone} />
          <View style={styles.stepDotDone} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: "#0D9488" }]}>
            <Text style={styles.statValue}>{samples.length}</Text>
            <Text style={styles.statLabel}>Tổng mẫu</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {approvedCount}
            </Text>
            <Text style={styles.statLabel}>Đạt</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#EF4444" }]}>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>
              {rejectedCount}
            </Text>
            <Text style={styles.statLabel}>Không đạt</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {samples.length - approvedCount - rejectedCount}
            </Text>
            <Text style={styles.statLabel}>Chờ</Text>
          </View>
        </View>

        {/* Section: Đánh giá mẫu */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flask-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Đánh giá chất lượng mẫu</Text>
          </View>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, { flex: 2.5 }]}>Hạng mục</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: "center" }]}>
              Chất lượng
            </Text>
            <Text style={[styles.thText, { flex: 1.5, textAlign: "center" }]}>
              Đánh giá
            </Text>
          </View>

          {samples.map((sample, idx) => (
            <View
              key={sample.id}
              style={[styles.sampleRow, idx % 2 === 0 && styles.sampleRowAlt]}
            >
              <View style={{ flex: 2.5 }}>
                <Text style={styles.sampleName}>{sample.name}</Text>
                <Text style={styles.sampleCategory}>{sample.category}</Text>
              </View>

              {/* Quality indicator */}
              <View style={{ flex: 1, alignItems: "center" }}>
                {sample.quality === "approved" ? (
                  <View style={styles.qualityBadgeApproved}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10B981"
                    />
                    <Text style={styles.qualityTextApproved}>Đạt</Text>
                  </View>
                ) : sample.quality === "rejected" ? (
                  <View style={styles.qualityBadgeRejected}>
                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                    <Text style={styles.qualityTextRejected}>Không đạt</Text>
                  </View>
                ) : (
                  <View style={styles.qualityBadgePending}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={16}
                      color="#F59E0B"
                    />
                    <Text style={styles.qualityTextPending}>Chờ</Text>
                  </View>
                )}
              </View>

              {/* Action buttons */}
              <View style={styles.actionBtns}>
                <Pressable
                  style={[
                    styles.actionBtn,
                    sample.quality === "approved" && styles.actionBtnActiveY,
                  ]}
                  onPress={() => updateQuality(sample.id, "approved")}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      sample.quality === "approved" &&
                        styles.actionBtnTextActiveY,
                    ]}
                  >
                    Y
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.actionBtn,
                    sample.quality === "rejected" && styles.actionBtnActiveN,
                  ]}
                  onPress={() => updateQuality(sample.id, "rejected")}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      sample.quality === "rejected" &&
                        styles.actionBtnTextActiveN,
                    ]}
                  >
                    N
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Section: Face ID Confirmation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="finger-print-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Xác nhận phê duyệt</Text>
          </View>

          <View style={styles.confirmRow}>
            {/* Nhà cung cấp */}
            <View style={styles.confirmCard}>
              <LinearGradient
                colors={
                  supplierConfirmed
                    ? ["#10B981", "#059669"]
                    : ["#F1F5F9", "#E2E8F0"]
                }
                style={styles.confirmIcon}
              >
                <Ionicons
                  name={
                    supplierConfirmed
                      ? "checkmark-circle"
                      : "finger-print-outline"
                  }
                  size={32}
                  color={supplierConfirmed ? "#fff" : "#94A3B8"}
                />
              </LinearGradient>
              <Text style={styles.confirmLabel}>Nhà cung cấp</Text>
              <Text style={styles.confirmSub}>
                {supplierConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}
              </Text>
              {!supplierConfirmed && (
                <Pressable
                  style={styles.faceIdBtn}
                  onPress={() => handleFaceID("supplier")}
                >
                  <Ionicons name="finger-print" size={16} color="#0D9488" />
                  <Text style={styles.faceIdBtnText}>Face ID</Text>
                </Pressable>
              )}
            </View>

            {/* Kỹ sư giám sát */}
            <View style={styles.confirmCard}>
              <LinearGradient
                colors={
                  engineerConfirmed
                    ? ["#10B981", "#059669"]
                    : ["#F1F5F9", "#E2E8F0"]
                }
                style={styles.confirmIcon}
              >
                <Ionicons
                  name={
                    engineerConfirmed
                      ? "checkmark-circle"
                      : "finger-print-outline"
                  }
                  size={32}
                  color={engineerConfirmed ? "#fff" : "#94A3B8"}
                />
              </LinearGradient>
              <Text style={styles.confirmLabel}>Kỹ sư giám sát</Text>
              <Text style={styles.confirmSub}>
                {engineerConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}
              </Text>
              {!engineerConfirmed && (
                <Pressable
                  style={styles.faceIdBtn}
                  onPress={() => handleFaceID("engineer")}
                >
                  <Ionicons name="finger-print" size={16} color="#0D9488" />
                  <Text style={styles.faceIdBtnText}>Face ID</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
          <Text style={styles.infoText}>
            Mẫu vật tư sau khi được xác nhận sẽ được lưu làm chuẩn so sánh cho
            các lô hàng tiếp theo.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.backFooterBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#64748B" />
          <Text style={styles.backFooterText}>Quay lại</Text>
        </Pressable>
        <Pressable
          style={[
            styles.submitBtn,
            (!allSamplesReviewed || !supplierConfirmed || !engineerConfirmed) &&
              styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>Xác nhận & Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
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

  body: { flex: 1 },
  bodyContent: { padding: 16 },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderLeftWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  statLabel: { fontSize: 10, color: "#94A3B8", marginTop: 2 },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    marginBottom: 4,
  },
  thText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  sampleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  sampleRowAlt: { backgroundColor: "#F8FAFC" },
  sampleName: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  sampleCategory: { fontSize: 11, color: "#94A3B8", marginTop: 2 },

  qualityBadgeApproved: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qualityTextApproved: { fontSize: 11, fontWeight: "700", color: "#10B981" },
  qualityBadgeRejected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qualityTextRejected: { fontSize: 11, fontWeight: "700", color: "#EF4444" },
  qualityBadgePending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qualityTextPending: { fontSize: 11, fontWeight: "700", color: "#F59E0B" },

  actionBtns: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  actionBtnActiveY: { backgroundColor: "#D1FAE5", borderColor: "#10B981" },
  actionBtnActiveN: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  actionBtnText: { fontSize: 14, fontWeight: "800", color: "#94A3B8" },
  actionBtnTextActiveY: { color: "#10B981" },
  actionBtnTextActiveN: { color: "#EF4444" },

  confirmRow: { flexDirection: "row", gap: 12 },
  confirmCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  confirmLabel: { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  confirmSub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  faceIdBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  faceIdBtnText: { fontSize: 12, fontWeight: "600", color: "#0D9488" },

  infoBox: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 12, color: "#0D9488", flex: 1, lineHeight: 18 },

  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 10,
  },
  backFooterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backFooterText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0D9488",
  },
  submitBtnDisabled: { backgroundColor: "#94A3B8" },
  submitBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
