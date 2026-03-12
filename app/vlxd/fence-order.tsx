/**
 * Sắt hàng rào bao che - 4-Step Ordering Workflow
 * Route: /vlxd/fence-order
 *
 * Bước 1: Đặt hàng (Kỹ sư / Chủ nhà)
 * Bước 2: Báo giá NCC (App thu 5% trên đơn giá)
 * Bước 3: Trình mẫu - Lưu mẫu (Face ID xác nhận)
 * Bước 4: Chọn nhà cung cấp & xác nhận đơn hàng
 */

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Types ──────────────────────────────────────────────────────────────
interface FenceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  dimensions: string; // e.g. "4 x 3"
  unitPrice: number;
}

interface SupplierQuote {
  id: string;
  name: string;
  code: string;
  rating: number;
  deliveryTime: string;
  color: string;
  items: FenceItem[];
  commission: number; // 5% app commission
}

interface SampleItem {
  id: string;
  name: string;
  quality: "pending" | "approved" | "rejected";
}

type Step = 1 | 2 | 3 | 4;

// ── Helpers ────────────────────────────────────────────────────────────
function formatVND(n: number): string {
  if (n === 0) return "-";
  return n.toLocaleString("vi-VN");
}

const APP_COMMISSION_RATE = 0.05; // 5%

// ── Supplier Data ──────────────────────────────────────────────────────
const SUPPLIERS: SupplierQuote[] = [
  {
    id: "ncc1",
    name: "Hoài Nam",
    code: "NCC1",
    rating: 4.7,
    deliveryTime: "3-5 ngày",
    color: "#0D9488",
    commission: APP_COMMISSION_RATE,
    items: [
      {
        id: "tole_khung",
        name: "Tole + khung 40x40",
        description: "Tole lợp + khung sắt vuông 40x40mm",
        quantity: 1,
        unit: "bộ",
        dimensions: "4 x 3",
        unitPrice: 700000,
      },
      {
        id: "han_cot",
        name: "Hàn 4 cột",
        description: "Hàn trụ cột đỡ hàng rào",
        quantity: 4,
        unit: "cột",
        dimensions: "",
        unitPrice: 1000000,
      },
    ],
  },
  {
    id: "ncc2",
    name: "Thành Đạt",
    code: "NCC2",
    rating: 4.5,
    deliveryTime: "4-6 ngày",
    color: "#8B5CF6",
    commission: APP_COMMISSION_RATE,
    items: [
      {
        id: "tole_khung",
        name: "Tole + khung 40x40",
        description: "Tole lợp + khung sắt vuông 40x40mm",
        quantity: 1,
        unit: "bộ",
        dimensions: "4 x 3",
        unitPrice: 680000,
      },
      {
        id: "han_cot",
        name: "Hàn 4 cột",
        description: "Hàn trụ cột đỡ hàng rào",
        quantity: 4,
        unit: "cột",
        dimensions: "",
        unitPrice: 1050000,
      },
    ],
  },
  {
    id: "ncc3",
    name: "Phước Lộc",
    code: "NCC3",
    rating: 4.8,
    deliveryTime: "2-4 ngày",
    color: "#F59E0B",
    commission: APP_COMMISSION_RATE,
    items: [
      {
        id: "tole_khung",
        name: "Tole + khung 40x40",
        description: "Tole lợp + khung sắt vuông 40x40mm",
        quantity: 1,
        unit: "bộ",
        dimensions: "4 x 3",
        unitPrice: 720000,
      },
      {
        id: "han_cot",
        name: "Hàn 4 cột",
        description: "Hàn trụ cột đỡ hàng rào",
        quantity: 4,
        unit: "cột",
        dimensions: "",
        unitPrice: 950000,
      },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────
export default function FenceOrderScreen() {
  const [step, setStep] = useState<Step>(1);

  // ── Step 1: Order info ──
  const [orderCode] = useState("MS102");
  const [location, setLocation] = useState("Anh Dung Q12");
  const [jobDescription, setJobDescription] = useState("Sản xuất hàng rào");
  const [scheduleDate, setScheduleDate] = useState("26/03/2026");
  const [detailDescription, setDetailDescription] = useState(
    "Làm hàng rào ngang 4m x cao 3m",
  );
  const [images, setImages] = useState<string[]>([]);

  // ── Step 2: Quotation ──
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // ── Step 3: Sample approval ──
  const [samples, setSamples] = useState<SampleItem[]>([
    { id: "tole", name: "Tole + khung 40x40", quality: "pending" },
    { id: "cot", name: "Hàn cột", quality: "pending" },
    { id: "son", name: "Sơn chống rỉ", quality: "pending" },
  ]);
  const [supplierConfirmed, setSupplierConfirmed] = useState(false);
  const [engineerConfirmed, setEngineerConfirmed] = useState(false);

  // ── Computed ──
  const supplierTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of SUPPLIERS) {
      let total = 0;
      for (const item of s.items) {
        if (item.dimensions) {
          const parts = item.dimensions
            .split("x")
            .map((p) => parseFloat(p.trim()));
          const area = parts.reduce((a, b) => a * b, 1);
          total += area * item.unitPrice;
        } else {
          total += item.quantity * item.unitPrice;
        }
      }
      map[s.id] = total;
    }
    return map;
  }, []);

  const chosenSupplier = SUPPLIERS.find((s) => s.id === selectedSupplier);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFaceID = (role: "supplier" | "engineer") => {
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

  const updateSampleQuality = (
    id: string,
    quality: "approved" | "rejected",
  ) => {
    setSamples((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quality } : s)),
    );
  };

  const allSamplesReviewed = samples.every((s) => s.quality !== "pending");
  const approvedCount = samples.filter((s) => s.quality === "approved").length;

  const handleConfirmOrder = () => {
    if (!chosenSupplier) return;
    const total = supplierTotals[chosenSupplier.id];
    Alert.alert(
      "Xác nhận đơn hàng",
      `Mã đơn: ${orderCode}\nVị trí: ${location}\nNCC: ${chosenSupplier.name}\nThành tiền: ${formatVND(total)} ₫`,
      [
        { text: "Sửa đơn", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => router.push("/vlxd/order-summary" as any),
        },
      ],
    );
  };

  // ── Step navigation ──
  const canNext = (): boolean => {
    switch (step) {
      case 1:
        return !!(location.trim() && scheduleDate.trim());
      case 2:
        return !!selectedSupplier;
      case 3:
        return allSamplesReviewed && supplierConfirmed && engineerConfirmed;
      case 4:
        return !!selectedSupplier;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as Step);
    else router.back();
  };

  const STEP_LABELS = ["Đặt hàng", "Báo giá NCC", "Trình mẫu", "Chọn NCC"];

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#1E293B", "#334155", "#475569"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Sắt hàng rào bao che</Text>
            <Text style={styles.headerSub}>{STEP_LABELS[step - 1]}</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{step}/4</Text>
          </View>
        </View>

        {/* Step indicator */}
        <View style={styles.stepsRow}>
          {STEP_LABELS.map((label, idx) => {
            const s = idx + 1;
            const active = s === step;
            const done = s < step;
            return (
              <Pressable
                key={label}
                style={[
                  styles.stepItem,
                  active && styles.stepItemActive,
                  done && styles.stepItemDone,
                ]}
                onPress={() => {
                  if (s < step) setStep(s as Step);
                }}
              >
                <View
                  style={[
                    styles.stepCircle,
                    active && styles.stepCircleActive,
                    done && styles.stepCircleDone,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        (active || done) && { color: "#fff" },
                      ]}
                    >
                      {s}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    active && styles.stepLabelActive,
                    done && styles.stepLabelDone,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Order info pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.orderPills}
        >
          {[
            { icon: "document-text", label: orderCode },
            { icon: "location", label: location || "Vị trí" },
            { icon: "construct", label: jobDescription || "Công việc" },
            { icon: "calendar", label: scheduleDate || "Lịch cấp" },
          ].map((p) => (
            <View key={p.label} style={styles.orderPill}>
              <Ionicons name={p.icon as any} size={13} color="#A7F3D0" />
              <Text style={styles.orderPillText}>{p.label}</Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* ═══════════════ STEP 1: ĐẶT HÀNG ═══════════════ */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#0D9488"
                />{" "}
                Thông tin đơn hàng
              </Text>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mã đơn hàng</Text>
                <View style={styles.fieldValueBox}>
                  <Text style={styles.fieldValueFixed}>{orderCode}</Text>
                </View>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Vị trí</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Nhập vị trí công trình"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Công việc</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={jobDescription}
                  onChangeText={setJobDescription}
                  placeholder="Nhập loại công việc"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Lịch cấp hàng</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={scheduleDate}
                  onChangeText={setScheduleDate}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mô tả chi tiết</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputMulti]}
                  value={detailDescription}
                  onChangeText={setDetailDescription}
                  placeholder="Mô tả yêu cầu chi tiết..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Images */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="camera-outline" size={16} color="#0D9488" />{" "}
                Hình ảnh
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesRow}
              >
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.imageThumb}>
                    <Image source={{ uri }} style={styles.imageThumbImg} />
                    <Pressable
                      style={styles.imageRemove}
                      onPress={() => removeImage(idx)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                ))}
                <Pressable style={styles.imageAdd} onPress={pickImages}>
                  <Ionicons name="add" size={28} color="#0D9488" />
                  <Text style={styles.imageAddText}>Thêm ảnh</Text>
                </Pressable>
              </ScrollView>
            </View>

            {/* Role info */}
            <View style={styles.infoCard}>
              <Ionicons name="person-outline" size={18} color="#0D9488" />
              <Text style={styles.infoText}>
                Kỹ sư hoặc Chủ nhà tạo đơn hàng. Đơn sẽ được gửi đến các Nhà
                cung cấp để báo giá.
              </Text>
            </View>
          </View>
        )}

        {/* ═══════════════ STEP 2: BÁO GIÁ NCC ═══════════════ */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={18} color="#F59E0B" />
              <Text style={styles.infoText}>
                App thu 5% trên đơn giá. NCC tự động điều chỉnh giá cho phù hợp.
              </Text>
            </View>

            {SUPPLIERS.map((supplier) => {
              const total = supplierTotals[supplier.id];
              const isSelected = selectedSupplier === supplier.id;
              const lowestTotal = Math.min(...Object.values(supplierTotals));
              const isCheapest = total === lowestTotal;

              return (
                <Pressable
                  key={supplier.id}
                  style={[
                    styles.supplierCard,
                    isSelected && {
                      borderColor: supplier.color,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedSupplier(supplier.id)}
                >
                  {/* Supplier header */}
                  <LinearGradient
                    colors={[supplier.color, supplier.color + "CC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.supplierHeader}
                  >
                    <View style={styles.supplierHeaderLeft}>
                      <Text style={styles.supplierCode}>{supplier.code}</Text>
                      <Text style={styles.supplierName}>{supplier.name}</Text>
                    </View>
                    <View style={styles.supplierHeaderRight}>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{supplier.rating}</Text>
                      </View>
                      <Text style={styles.deliveryText}>
                        {supplier.deliveryTime}
                      </Text>
                    </View>
                  </LinearGradient>

                  {/* Quote items */}
                  <View style={styles.quoteTable}>
                    <View style={styles.quoteHeader}>
                      <Text style={[styles.qh, { flex: 2 }]}>
                        Danh mục vật tư
                      </Text>
                      <Text
                        style={[styles.qh, { flex: 2, textAlign: "right" }]}
                      >
                        Đơn giá
                      </Text>
                      <Text
                        style={[styles.qh, { flex: 1.5, textAlign: "right" }]}
                      >
                        Thành tiền
                      </Text>
                    </View>

                    {supplier.items.map((item) => {
                      let lineTotal: number;
                      let priceDisplay: string;
                      if (item.dimensions) {
                        const parts = item.dimensions
                          .split("x")
                          .map((p) => parseFloat(p.trim()));
                        const area = parts.reduce((a, b) => a * b, 1);
                        lineTotal = area * item.unitPrice;
                        priceDisplay = `${item.dimensions} x ${formatVND(item.unitPrice)}`;
                      } else {
                        lineTotal = item.quantity * item.unitPrice;
                        priceDisplay = `${item.quantity} x ${formatVND(item.unitPrice)}`;
                      }

                      return (
                        <View key={item.id} style={styles.quoteRow}>
                          <Text style={[styles.qd, styles.qdName, { flex: 2 }]}>
                            {item.name}
                          </Text>
                          <Text
                            style={[styles.qd, { flex: 2, textAlign: "right" }]}
                          >
                            {priceDisplay}
                          </Text>
                          <Text
                            style={[
                              styles.qd,
                              styles.qdTotal,
                              { flex: 1.5, textAlign: "right" },
                            ]}
                          >
                            {formatVND(lineTotal)}
                          </Text>
                        </View>
                      );
                    })}

                    {/* Total */}
                    <View style={styles.quoteTotalRow}>
                      <Text style={styles.quoteTotalLabel}>Thành tiền</Text>
                      <Text style={styles.quoteTotalValue}>
                        {formatVND(total)} ₫
                      </Text>
                    </View>
                  </View>

                  {/* Cheapest badge */}
                  {isCheapest && (
                    <View style={styles.cheapestBadge}>
                      <Ionicons name="trophy" size={14} color="#F59E0B" />
                      <Text style={styles.cheapestText}>Giá tốt nhất</Text>
                    </View>
                  )}

                  {/* Select indicator */}
                  <View style={styles.selectRow}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && { borderColor: supplier.color },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: supplier.color },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.selectText,
                        isSelected && {
                          color: supplier.color,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {isSelected
                        ? "Đã chọn nhà cung cấp"
                        : "Chọn nhà cung cấp"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ═══════════════ STEP 3: TRÌNH MẪU ═══════════════ */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="clipboard-outline" size={16} color="#0D9488" />{" "}
                Kiểm tra chất lượng
              </Text>
              <Text style={styles.sectionSub}>
                Đánh giá từng hạng mục. Cần duyệt tất cả trước khi xác nhận.
              </Text>

              {samples.map((sample) => (
                <View key={sample.id} style={styles.sampleRow}>
                  <View style={styles.sampleInfo}>
                    <Text style={styles.sampleName}>{sample.name}</Text>
                    <Text
                      style={[
                        styles.sampleStatus,
                        sample.quality === "approved" && { color: "#10B981" },
                        sample.quality === "rejected" && { color: "#EF4444" },
                      ]}
                    >
                      {sample.quality === "pending"
                        ? "Chờ đánh giá"
                        : sample.quality === "approved"
                          ? "Đạt ✓"
                          : "Không đạt ✗"}
                    </Text>
                  </View>
                  <View style={styles.sampleActions}>
                    <Pressable
                      style={[
                        styles.sampleBtn,
                        styles.sampleBtnApprove,
                        sample.quality === "approved" && styles.sampleBtnActive,
                      ]}
                      onPress={() => updateSampleQuality(sample.id, "approved")}
                    >
                      <Text style={styles.sampleBtnText}>Y</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.sampleBtn,
                        styles.sampleBtnReject,
                        sample.quality === "rejected" &&
                          styles.sampleBtnRejectActive,
                      ]}
                      onPress={() => updateSampleQuality(sample.id, "rejected")}
                    >
                      <Text style={styles.sampleBtnText}>N</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              {/* Progress */}
              <View style={styles.sampleProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(samples.filter((s) => s.quality !== "pending").length / samples.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {approvedCount}/{samples.length} đạt chất lượng
                </Text>
              </View>
            </View>

            {/* Face ID Confirmation */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Ionicons
                  name="finger-print-outline"
                  size={16}
                  color="#0D9488"
                />{" "}
                Phần xác nhận
              </Text>

              <View style={styles.faceIdRow}>
                <View style={styles.faceIdBox}>
                  <Text style={styles.faceIdLabel}>Nhà cung cấp</Text>
                  <Pressable
                    style={[
                      styles.faceIdBtn,
                      supplierConfirmed && styles.faceIdBtnDone,
                    ]}
                    onPress={() => handleFaceID("supplier")}
                    disabled={supplierConfirmed}
                  >
                    <Ionicons
                      name={
                        supplierConfirmed ? "checkmark-circle" : "scan-outline"
                      }
                      size={32}
                      color={supplierConfirmed ? "#10B981" : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.faceIdBtnText,
                        supplierConfirmed && { color: "#10B981" },
                      ]}
                    >
                      {supplierConfirmed ? "Đã xác nhận" : "Face ID"}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.faceIdBox}>
                  <Text style={styles.faceIdLabel}>Kỹ sư giám sát</Text>
                  <Pressable
                    style={[
                      styles.faceIdBtn,
                      engineerConfirmed && styles.faceIdBtnDone,
                    ]}
                    onPress={() => handleFaceID("engineer")}
                    disabled={engineerConfirmed}
                  >
                    <Ionicons
                      name={
                        engineerConfirmed ? "checkmark-circle" : "scan-outline"
                      }
                      size={32}
                      color={engineerConfirmed ? "#10B981" : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.faceIdBtnText,
                        engineerConfirmed && { color: "#10B981" },
                      ]}
                    >
                      {engineerConfirmed ? "Đã xác nhận" : "Face ID"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ═══════════════ STEP 4: CHỌN NCC & XÁC NHẬN ═══════════════ */}
        {step === 4 && chosenSupplier && (
          <View style={styles.stepContent}>
            {/* Order summary card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="receipt-outline" size={16} color="#0D9488" />{" "}
                Đơn hàng xác nhận
              </Text>

              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryFieldLabel}>Mã đơn hàng</Text>
                <Text style={styles.summaryFieldValue}>{orderCode}</Text>
              </View>
              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryFieldLabel}>Vị trí</Text>
                <Text style={styles.summaryFieldValue}>{location}</Text>
              </View>
              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryFieldLabel}>Công việc</Text>
                <Text style={styles.summaryFieldValue}>{jobDescription}</Text>
              </View>
              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryFieldLabel}>Lịch cấp hàng</Text>
                <Text style={styles.summaryFieldValue}>{scheduleDate}</Text>
              </View>
              {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((uri, idx) => (
                    <Image
                      key={idx}
                      source={{ uri }}
                      style={styles.summaryImage}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Supplier & quote details */}
            <View style={styles.sectionCard}>
              <LinearGradient
                colors={[chosenSupplier.color, chosenSupplier.color + "CC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chosenSupplierBanner}
              >
                <View>
                  <Text style={styles.chosenSupplierCode}>
                    {chosenSupplier.code}
                  </Text>
                  <Text style={styles.chosenSupplierName}>
                    {chosenSupplier.name}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{chosenSupplier.rating}</Text>
                </View>
              </LinearGradient>

              {/* Quote breakdown */}
              <View style={styles.quoteTable}>
                <View style={styles.quoteHeader}>
                  <Text style={[styles.qh, { flex: 2 }]}>Danh mục vật tư</Text>
                  <Text style={[styles.qh, { flex: 2, textAlign: "right" }]}>
                    Đơn giá
                  </Text>
                  <Text style={[styles.qh, { flex: 1.5, textAlign: "right" }]}>
                    Thành tiền
                  </Text>
                </View>

                {chosenSupplier.items.map((item) => {
                  let lineTotal: number;
                  let priceDisplay: string;
                  if (item.dimensions) {
                    const parts = item.dimensions
                      .split("x")
                      .map((p) => parseFloat(p.trim()));
                    const area = parts.reduce((a, b) => a * b, 1);
                    lineTotal = area * item.unitPrice;
                    priceDisplay = `${item.dimensions} x ${formatVND(item.unitPrice)}`;
                  } else {
                    lineTotal = item.quantity * item.unitPrice;
                    priceDisplay = `${item.quantity} x ${formatVND(item.unitPrice)}`;
                  }

                  return (
                    <View key={item.id} style={styles.quoteRow}>
                      <Text style={[styles.qd, styles.qdName, { flex: 2 }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.qd, { flex: 2, textAlign: "right" }]}
                      >
                        {priceDisplay}
                      </Text>
                      <Text
                        style={[
                          styles.qd,
                          styles.qdTotal,
                          { flex: 1.5, textAlign: "right" },
                        ]}
                      >
                        {formatVND(lineTotal)}
                      </Text>
                    </View>
                  );
                })}

                <View style={styles.quoteTotalRow}>
                  <Text style={styles.quoteTotalLabel}>THÀNH TIỀN</Text>
                  <Text style={styles.quoteTotalValue}>
                    {formatVND(supplierTotals[chosenSupplier.id])} ₫
                  </Text>
                </View>
              </View>
            </View>

            {/* Sample results */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#10B981"
                />{" "}
                Kết quả trình mẫu
              </Text>
              {samples.map((s) => (
                <View key={s.id} style={styles.sampleResultRow}>
                  <Text style={styles.sampleResultName}>{s.name}</Text>
                  <View
                    style={[
                      styles.sampleResultBadge,
                      s.quality === "approved"
                        ? { backgroundColor: "#DCFCE7" }
                        : { backgroundColor: "#FEE2E2" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sampleResultText,
                        s.quality === "approved"
                          ? { color: "#10B981" }
                          : { color: "#EF4444" },
                      ]}
                    >
                      {s.quality === "approved" ? "Đạt" : "Không đạt"}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={styles.confirmRow}>
                <View style={styles.confirmItem}>
                  <Ionicons
                    name={
                      supplierConfirmed ? "checkmark-circle" : "close-circle"
                    }
                    size={18}
                    color={supplierConfirmed ? "#10B981" : "#94A3B8"}
                  />
                  <Text style={styles.confirmLabel}>NCC xác nhận</Text>
                </View>
                <View style={styles.confirmItem}>
                  <Ionicons
                    name={
                      engineerConfirmed ? "checkmark-circle" : "close-circle"
                    }
                    size={18}
                    color={engineerConfirmed ? "#10B981" : "#94A3B8"}
                  />
                  <Text style={styles.confirmLabel}>KS xác nhận</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 1 && (
          <Pressable style={styles.backStepBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={18} color="#64748B" />
            <Text style={styles.backStepText}>Quay lại</Text>
          </Pressable>
        )}
        <View style={styles.footerLeft}>
          {step === 2 && selectedSupplier && (
            <>
              <Text style={styles.footerLabel}>Thành tiền</Text>
              <Text style={styles.footerTotal}>
                {formatVND(supplierTotals[selectedSupplier])} ₫
              </Text>
            </>
          )}
          {step === 4 && chosenSupplier && (
            <>
              <Text style={styles.footerLabel}>Tổng đơn</Text>
              <Text style={styles.footerTotal}>
                {formatVND(supplierTotals[chosenSupplier.id])} ₫
              </Text>
            </>
          )}
        </View>
        <Pressable
          style={[styles.submitBtn, !canNext() && styles.submitBtnDisabled]}
          onPress={step === 4 ? handleConfirmOrder : goNext}
          disabled={!canNext()}
        >
          <Ionicons
            name={step === 4 ? "bag-check" : "arrow-forward"}
            size={20}
            color="#fff"
          />
          <Text style={styles.submitBtnText}>
            {step === 4 ? "Xác nhận đơn" : "Tiếp tục"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  stepBadge: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // Step indicator
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 4,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    opacity: 0.5,
  },
  stepItemActive: { opacity: 1 },
  stepItemDone: { opacity: 0.8 },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: { backgroundColor: "#0D9488" },
  stepCircleDone: { backgroundColor: "#10B981" },
  stepNumber: { fontSize: 11, fontWeight: "700", color: "#94A3B8" },
  stepLabel: { fontSize: 10, color: "#94A3B8", fontWeight: "500" },
  stepLabelActive: { color: "#fff", fontWeight: "700" },
  stepLabelDone: { color: "#A7F3D0" },

  orderPills: { marginBottom: 4 },
  orderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
  },
  orderPillText: { fontSize: 12, color: "#E2E8F0", fontWeight: "500" },

  body: { flex: 1 },
  stepContent: { padding: 12 },

  // Section cards
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
  },
  sectionSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 12,
    marginTop: -8,
  },

  // Info card
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 18 },

  // Form fields
  fieldRow: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1E293B",
  },
  fieldInputMulti: {
    height: 80,
    textAlignVertical: "top",
  },
  fieldValueBox: {
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#0D948833",
  },
  fieldValueFixed: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D9488",
  },

  // Images
  imagesRow: { marginTop: 4 },
  imageThumb: { width: 80, height: 80, marginRight: 8, borderRadius: 8 },
  imageThumbImg: { width: 80, height: 80, borderRadius: 8 },
  imageRemove: { position: "absolute", top: -6, right: -6 },
  imageAdd: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  imageAddText: { fontSize: 10, color: "#0D9488", marginTop: 2 },

  // Supplier cards (Step 2)
  supplierCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  supplierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  supplierHeaderLeft: {},
  supplierCode: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  supplierName: { fontSize: 16, fontWeight: "800", color: "#fff" },
  supplierHeaderRight: { alignItems: "flex-end", gap: 4 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  deliveryText: { fontSize: 11, color: "rgba(255,255,255,0.8)" },

  // Quote table
  quoteTable: { padding: 4 },
  quoteHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    marginBottom: 2,
  },
  qh: { fontSize: 11, fontWeight: "700", color: "#94A3B8" },
  quoteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  qd: { fontSize: 12, color: "#64748B" },
  qdName: { fontWeight: "600", color: "#1E293B" },
  qdTotal: { fontWeight: "700", color: "#1E293B" },
  quoteTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: "#0D9488",
  },
  quoteTotalLabel: { fontSize: 14, fontWeight: "800", color: "#0D9488" },
  quoteTotalValue: { fontSize: 18, fontWeight: "800", color: "#0D9488" },

  cheapestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  cheapestText: { fontSize: 12, fontWeight: "700", color: "#D97706" },

  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#F1F5F9",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  selectText: { fontSize: 13, color: "#64748B" },

  // Sample approval (Step 3)
  sampleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  sampleInfo: { flex: 1 },
  sampleName: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  sampleStatus: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  sampleActions: { flexDirection: "row", gap: 8 },
  sampleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  sampleBtnApprove: { borderColor: "#D1FAE5" },
  sampleBtnReject: { borderColor: "#FECACA" },
  sampleBtnActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  sampleBtnRejectActive: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  sampleBtnText: { fontSize: 14, fontWeight: "700", color: "#1E293B" },

  sampleProgress: { marginTop: 14 },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
    textAlign: "right",
  },

  // Face ID
  faceIdRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  faceIdBox: { flex: 1, alignItems: "center" },
  faceIdLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  faceIdBtn: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    gap: 6,
  },
  faceIdBtnDone: {
    borderColor: "#10B981",
    borderStyle: "solid",
    backgroundColor: "#F0FDF4",
  },
  faceIdBtnText: { fontSize: 13, fontWeight: "600", color: "#64748B" },

  // Step 4 summary
  summaryFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  summaryFieldLabel: { fontSize: 13, color: "#94A3B8" },
  summaryFieldValue: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 8,
  },
  chosenSupplierBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  chosenSupplierCode: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  chosenSupplierName: { fontSize: 16, fontWeight: "800", color: "#fff" },

  sampleResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  sampleResultName: { fontSize: 13, fontWeight: "500", color: "#1E293B" },
  sampleResultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sampleResultText: { fontSize: 12, fontWeight: "700" },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
  },
  confirmItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confirmLabel: { fontSize: 12, color: "#64748B" },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  footerLeft: { flex: 1 },
  footerLabel: { fontSize: 11, color: "#94A3B8" },
  footerTotal: { fontSize: 20, fontWeight: "800", color: "#0D9488" },
  backStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backStepText: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0D9488",
  },
  submitBtnDisabled: { backgroundColor: "#94A3B8" },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
