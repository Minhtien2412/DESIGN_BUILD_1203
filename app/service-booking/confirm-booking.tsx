/**
 * Confirm Booking Screen
 * Grab-style booking confirmation with:
 * - Map preview (worker → customer route)
 * - Worker info card
 * - Service details & pricing
 * - Address input
 * - Notes & scheduling
 * - Confirm CTA
 */

import WorkerMapView from "@/components/worker/WorkerMapView";
import { useBooking } from "@/context/BookingContext";
import { CATEGORY_LABELS } from "@/data/service-categories";
import { requestWorkerBooking } from "@/services/worker-location.service";
import {
    estimateTravelTime,
    formatDistance,
    formatTravelTime,
    locationToLatLng,
    type LatLng,
} from "@/utils/geo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
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

// ============================================================================
// Category labels — imported from @/data/service-categories
// ============================================================================

// ============================================================================
// Screen
// ============================================================================

export default function ConfirmBookingScreen() {
  const insets = useSafeAreaInsets();
  const { createNewBooking } = useBooking();

  const params = useLocalSearchParams<{
    workerId: string;
    workerName: string;
    workerAvatar: string;
    workerRating: string;
    workerDistance: string;
    workerETA: string;
    workerDailyRate: string;
    workerPhone: string;
    workerType: string;
    workerLocation: string;
    category: string;
    customerLat: string;
    customerLng: string;
    customerAddress: string;
  }>();

  const [customerAddress, setCustomerAddress] = useState(
    params.customerAddress || "",
  );
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash",
  );
  const [issueDescription, setIssueDescription] = useState("");

  // Parse params
  const workerRating = parseFloat(params.workerRating || "4.5");
  const workerDistance = parseFloat(params.workerDistance || "2");
  const workerETA =
    parseInt(params.workerETA || "15", 10) ||
    estimateTravelTime(workerDistance);
  const dailyRate = parseInt(params.workerDailyRate || "350000", 10);
  const categoryLabel = CATEGORY_LABELS[params.category || "all"] || "Dịch vụ";

  // Map locations
  const customerLocation: LatLng = useMemo(
    () => ({
      latitude: parseFloat(params.customerLat || "10.7769"),
      longitude: parseFloat(params.customerLng || "106.7009"),
    }),
    [params.customerLat, params.customerLng],
  );

  const workerLocation: LatLng = useMemo(
    () => locationToLatLng(params.workerLocation || "Quận 7"),
    [params.workerLocation],
  );

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // Service fee calculation
  const serviceFee = Math.round(dailyRate * 0.1);
  const totalPrice = dailyRate + serviceFee;

  // ============================================================================
  // Confirm handler
  // ============================================================================

  const handleConfirm = useCallback(async () => {
    if (!customerAddress.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập địa chỉ của bạn");
      return;
    }

    setConfirming(true);
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // 1. Request worker via API
      const result = await requestWorkerBooking({
        workerId: params.workerId || "",
        serviceCategory: params.category || "all",
        customerLatitude: customerLocation.latitude,
        customerLongitude: customerLocation.longitude,
        customerAddress: customerAddress.trim(),
        notes: [issueDescription, notes].filter(Boolean).join(" | "),
      });

      // 2. Create local booking via context
      await createNewBooking(
        {
          id: params.workerId || "",
          name: params.workerName || "Thợ",
          avatar: params.workerAvatar,
          phone: params.workerPhone,
          rating: workerRating,
          category: params.category || "",
        },
        {
          serviceId: parseInt(params.workerId || "0", 10) || 1,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          notes: issueDescription || notes || undefined,
        },
        totalPrice,
      );

      // 3. Navigate to live tracking
      router.replace({
        pathname: "/service-booking/live-tracking",
        params: {
          bookingId: result.bookingId,
          workerId: params.workerId || "",
          workerName: params.workerName || "",
          workerAvatar: params.workerAvatar || "",
          workerPhone: params.workerPhone || "",
          workerLat: String(workerLocation.latitude),
          workerLng: String(workerLocation.longitude),
          customerLat: String(customerLocation.latitude),
          customerLng: String(customerLocation.longitude),
          customerAddress: customerAddress.trim(),
          category: params.category || "",
          totalPrice: String(totalPrice),
        },
      } as any);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt thợ. Vui lòng thử lại.");
      console.error("[ConfirmBooking] Error:", error);
    } finally {
      setConfirming(false);
    }
  }, [
    customerAddress,
    issueDescription,
    notes,
    params,
    customerLocation,
    workerLocation,
    totalPrice,
    workerRating,
    createNewBooking,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Xác nhận đặt thợ</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── MAP PREVIEW ─── */}
        <View style={s.mapPreview}>
          <WorkerMapView
            userLocation={customerLocation}
            workers={[]}
            workerMovingLocation={workerLocation}
            height={180}
            interactive={false}
            showUserMarker
          />
          {/* ETA badge */}
          <View style={s.etaBadge}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={s.etaText}>~{formatTravelTime(workerETA)}</Text>
          </View>
        </View>

        {/* ─── WORKER INFO ─── */}
        <View style={s.card}>
          <View style={s.workerRow}>
            <Image
              source={{
                uri:
                  params.workerAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(params.workerName || "T")}&background=FF6B00&color=fff`,
              }}
              style={s.workerAvatar}
            />
            <View style={s.workerDetails}>
              <Text style={s.workerNameText}>{params.workerName || "Thợ"}</Text>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={13} color="#FFC107" />
                <Text style={s.ratingText}>{workerRating.toFixed(1)}</Text>
                <Text style={s.dotSep}>•</Text>
                <Ionicons name="location-outline" size={13} color="#FF6B00" />
                <Text style={s.distText}>{formatDistance(workerDistance)}</Text>
              </View>
              <Text style={s.categoryTag}>{categoryLabel}</Text>
            </View>

            {/* Call/Chat buttons */}
            <View style={s.contactBtns}>
              <TouchableOpacity style={s.contactBtn}>
                <Ionicons name="chatbubble-outline" size={18} color="#FF6B00" />
              </TouchableOpacity>
              <TouchableOpacity style={s.contactBtn}>
                <Ionicons name="call-outline" size={18} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── ADDRESS ─── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>
            <Ionicons name="location" size={14} color="#FF6B00" /> Địa chỉ của
            bạn
          </Text>
          <TextInput
            style={s.addressInput}
            value={customerAddress}
            onChangeText={setCustomerAddress}
            placeholder="Nhập địa chỉ (số nhà, đường, quận)..."
            placeholderTextColor="#bbb"
            multiline
          />
        </View>

        {/* ─── ISSUE DESCRIPTION ─── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={14}
              color="#FF6B00"
            />{" "}
            Mô tả vấn đề
          </Text>
          <TextInput
            style={s.noteInput}
            value={issueDescription}
            onChangeText={setIssueDescription}
            placeholder="Mô tả tình trạng cần sửa chữa..."
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ─── PAYMENT METHOD ─── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>
            <Ionicons name="wallet-outline" size={14} color="#FF6B00" /> Phương
            thức thanh toán
          </Text>
          <View style={s.paymentOptions}>
            <TouchableOpacity
              style={[
                s.payOption,
                paymentMethod === "cash" && s.payOptionActive,
              ]}
              onPress={() => setPaymentMethod("cash")}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={paymentMethod === "cash" ? "#FF6B00" : "#999"}
              />
              <Text
                style={[
                  s.payOptionText,
                  paymentMethod === "cash" && s.payOptionTextActive,
                ]}
              >
                Tiền mặt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.payOption,
                paymentMethod === "transfer" && s.payOptionActive,
              ]}
              onPress={() => setPaymentMethod("transfer")}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={paymentMethod === "transfer" ? "#FF6B00" : "#999"}
              />
              <Text
                style={[
                  s.payOptionText,
                  paymentMethod === "transfer" && s.payOptionTextActive,
                ]}
              >
                Chuyển khoản
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── PRICE BREAKDOWN ─── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>
            <Ionicons name="receipt-outline" size={14} color="#FF6B00" /> Chi
            phí dự kiến
          </Text>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Phí dịch vụ ({categoryLabel})</Text>
            <Text style={s.priceValue}>{formatPrice(dailyRate)}</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Phí nền tảng (10%)</Text>
            <Text style={s.priceValue}>{formatPrice(serviceFee)}</Text>
          </View>
          <View style={s.priceDivider} />
          <View style={s.priceRow}>
            <Text style={s.priceTotalLabel}>Tổng cộng</Text>
            <Text style={s.priceTotalValue}>{formatPrice(totalPrice)}</Text>
          </View>
          <Text style={s.priceNote}>
            * Giá cuối cùng sẽ được thoả thuận tại nhà
          </Text>
        </View>

        {/* ─── NOTES ─── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>
            <Ionicons name="chatbox-outline" size={14} color="#FF6B00" /> Ghi
            chú thêm (tuỳ chọn)
          </Text>
          <TextInput
            style={s.noteInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú cho thợ (vd: cổng màu xanh, tầng 3...)"
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Spacer for bottom CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── BOTTOM CTA ─── */}
      <View style={[s.bottomCTA, { paddingBottom: insets.bottom + 12 }]}>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Tổng thanh toán</Text>
          <Text style={s.totalValue}>{formatPrice(totalPrice)}</Text>
        </View>

        <TouchableOpacity
          style={[s.confirmBtn, confirming && s.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={confirming}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={confirming ? ["#ccc", "#bbb"] : ["#FF6B00", "#FF8F00"]}
            style={s.confirmBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {confirming ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={s.confirmBtnText}>Đang xử lý...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="account-hard-hat"
                  size={22}
                  color="#fff"
                />
                <Text style={s.confirmBtnText}>Xác nhận đặt thợ</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 12 },

  // Map preview
  mapPreview: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  etaBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  etaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  // Cards
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },

  // Worker
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  workerDetails: { flex: 1 },
  workerNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  dotSep: { color: "#ccc", fontSize: 10 },
  distText: {
    fontSize: 12,
    color: "#FF6B00",
    fontWeight: "600",
  },
  categoryTag: {
    fontSize: 11,
    color: "#fff",
    backgroundColor: "#FF6B00",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
    overflow: "hidden",
  },
  contactBtns: {
    flexDirection: "column",
    gap: 8,
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },

  // Address
  addressInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 44,
  },

  // Notes
  noteInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 60,
    textAlignVertical: "top",
  },

  // Payment
  paymentOptions: {
    flexDirection: "row",
    gap: 10,
  },
  payOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: 6,
  },
  payOptionActive: {
    borderColor: "#FF6B00",
    backgroundColor: "#FFF8F0",
  },
  payOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  payOptionTextActive: {
    color: "#FF6B00",
  },

  // Price
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  priceLabel: { fontSize: 13, color: "#666" },
  priceValue: { fontSize: 13, fontWeight: "600", color: "#333" },
  priceDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  priceTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FF6B00",
  },
  priceNote: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginTop: 6,
  },

  // Bottom CTA
  bottomCTA: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FF6B00",
  },
  confirmBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
});
