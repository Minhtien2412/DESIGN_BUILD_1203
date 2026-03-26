/**
 * Confirm Booking Screen — Step 6 of booking flow
 * Summary of booking + payment method selection (MoMo, VNPay, Bank — NO cash)
 *
 * Data: BookingContext.createNewBooking() → API POST /services/bookings
 */

import { R } from "@/constants/route-registry";
import { useBooking } from "@/context/BookingContext";
import { PaymentMethod } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  desc: string;
}[] = [
  {
    id: "momo",
    label: "Ví MoMo",
    icon: "wallet-outline",
    color: "#A50064",
    desc: "Thanh toán qua ví điện tử MoMo",
  },
  {
    id: "vnpay",
    label: "VNPay",
    icon: "card-outline",
    color: "#005BAA",
    desc: "Thanh toán qua VNPay QR",
  },
  {
    id: "bank_transfer",
    label: "Chuyển khoản ngân hàng",
    icon: "business-outline",
    color: "#0D9488",
    desc: "Chuyển khoản qua tài khoản ngân hàng",
  },
];

export default function ConfirmBookingScreen() {
  const { createNewBooking } = useBooking();
  const p = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    address: string;
    district: string;
    city: string;
    note: string;
    date: string;
    time: string;
    workerId: string;
    workerName: string;
    workerPrice: string;
    workerRating: string;
    workerSpecialty: string;
    workerDistance: string;
    workerArrival: string;
  }>();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = parseInt(p.workerPrice || "0", 10);
  const serviceFee = 20000; // phí dịch vụ
  const totalEstimate = price * 2 + serviceFee; // giả sử 2 giờ + phí

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.workerName || "T")}&background=0D9488&color=fff&size=128`;

  const onConfirm = useCallback(async () => {
    if (!selectedPayment) {
      Alert.alert("Chọn phương thức", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = await createNewBooking(
        {
          id: p.workerId || "",
          name: p.workerName || "",
          rating: parseFloat(p.workerRating || "0"),
          category: p.workerSpecialty || "",
        },
        {
          serviceId: parseInt(p.serviceId || "0", 10),
          startDate: p.date || new Date().toISOString().split("T")[0],
          endDate: p.date || new Date().toISOString().split("T")[0],
          notes: p.note
            ? `${p.note}\nĐịa chỉ: ${p.address}${p.district ? `, ${p.district}` : ""}${p.city ? `, ${p.city}` : ""}\nThanh toán: ${selectedPayment}`
            : `Địa chỉ: ${p.address}\nThanh toán: ${selectedPayment}`,
        },
        totalEstimate,
        p.time,
      );

      router.replace({
        pathname: R.SERVICE_BOOKING.REQUEST_SENT as any,
        params: {
          bookingId: booking.apiBookingId
            ? String(booking.apiBookingId)
            : booking.id,
          serviceName: p.serviceName,
          address: p.address,
          scheduledDate: p.date || new Date().toISOString().split("T")[0],
          scheduledTime: p.time || "Càng sớm càng tốt",
        },
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo đơn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPayment, p, totalEstimate, createNewBooking]);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Xác nhận đặt thợ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* Worker summary */}
        <View style={s.workerCard}>
          <Image source={{ uri: avatarUrl }} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.workerName}>{p.workerName}</Text>
            <Text style={s.workerSpec}>{p.workerSpecialty}</Text>
            <View style={s.workerMeta}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={s.metaVal}>{p.workerRating}</Text>
              <Text style={s.metaSep}>·</Text>
              <Ionicons name="navigate-outline" size={12} color="#6B7280" />
              <Text style={s.metaVal}>{p.workerDistance}</Text>
              <Text style={s.metaSep}>·</Text>
              <Text style={s.metaVal}>~{p.workerArrival}</Text>
            </View>
          </View>
        </View>

        {/* Booking details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Chi tiết booking</Text>

          <View style={s.detailRow}>
            <Ionicons name="construct-outline" size={18} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={s.detailLabel}>Dịch vụ</Text>
              <Text style={s.detailValue}>{p.serviceName}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.detailRow}>
            <Ionicons name="location-outline" size={18} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={s.detailLabel}>Địa chỉ</Text>
              <Text style={s.detailValue}>
                {p.address}
                {p.district ? `, ${p.district}` : ""}
                {p.city ? `, ${p.city}` : ""}
              </Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={s.detailLabel}>Thời gian</Text>
              <Text style={s.detailValue}>
                {p.date || "Hôm nay"} · {p.time || "Càng sớm càng tốt"}
              </Text>
            </View>
          </View>

          {p.note ? (
            <>
              <View style={s.divider} />
              <View style={s.detailRow}>
                <Ionicons name="chatbubble-outline" size={18} color="#0D9488" />
                <View style={{ flex: 1 }}>
                  <Text style={s.detailLabel}>Ghi chú</Text>
                  <Text style={s.detailValue}>{p.note}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* Price breakdown */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Chi phí dự kiến</Text>

          <View style={s.priceRow}>
            <Text style={s.priceLabel}>
              Giá thợ ({(price / 1000).toFixed(0)}K/h × 2 giờ)
            </Text>
            <Text style={s.priceVal}>
              {((price * 2) / 1000).toFixed(0)}.000đ
            </Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Phí dịch vụ nền tảng</Text>
            <Text style={s.priceVal}>
              {(serviceFee / 1000).toFixed(0)}.000đ
            </Text>
          </View>
          <View style={s.priceDivider} />
          <View style={s.priceRow}>
            <Text style={s.totalLabel}>Tổng dự kiến</Text>
            <Text style={s.totalVal}>
              {(totalEstimate / 1000).toFixed(0)}.000đ
            </Text>
          </View>

          <View style={s.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#6B7280"
            />
            <Text style={s.noteText}>
              Chi phí thực tế có thể thay đổi tùy theo phạm vi công việc. Bạn và
              thợ sẽ xác nhận lại trước khi bắt đầu.
            </Text>
          </View>
        </View>

        {/* Payment methods */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Phương thức thanh toán</Text>
          <Text style={s.paymentNote}>
            Chỉ hỗ trợ thanh toán online — không nhận tiền mặt
          </Text>

          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                s.paymentCard,
                selectedPayment === method.id && s.paymentCardActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  s.paymentIcon,
                  { backgroundColor: method.color + "15" },
                ]}
              >
                <Ionicons name={method.icon} size={22} color={method.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.paymentLabel}>{method.label}</Text>
                <Text style={s.paymentDesc}>{method.desc}</Text>
              </View>
              <View
                style={[
                  s.radio,
                  selectedPayment === method.id && s.radioActive,
                ]}
              >
                {selectedPayment === method.id && <View style={s.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomCta}>
        <View style={s.totalRow}>
          <Text style={s.ctaTotal}>
            Tổng: {(totalEstimate / 1000).toFixed(0)}.000đ
          </Text>
          {selectedPayment && (
            <Text style={s.ctaPayment}>
              {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.label}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            s.ctaBtn,
            (!selectedPayment || isSubmitting) && s.ctaBtnDisabled,
          ]}
          onPress={onConfirm}
          disabled={!selectedPayment || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <Text style={s.ctaText}>Đang xử lý...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={s.ctaText}>Xác nhận đặt thợ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },

  // Worker card
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
  },
  workerName: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  workerSpec: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  workerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaVal: { fontSize: 12, fontWeight: "500", color: "#4B5563" },
  metaSep: { fontSize: 12, color: "#D1D5DB" },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },

  // Details
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 4,
  },
  detailLabel: { fontSize: 11, color: "#9CA3AF" },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1F2937",
    marginTop: 1,
  },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },

  // Price
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  priceLabel: { fontSize: 13, color: "#6B7280" },
  priceVal: { fontSize: 13, fontWeight: "500", color: "#1F2937" },
  priceDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  totalVal: { fontSize: 18, fontWeight: "800", color: "#FF6B35" },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  noteText: { flex: 1, fontSize: 11, color: "#6B7280", lineHeight: 16 },

  // Payment
  paymentNote: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "500",
    marginBottom: 10,
    marginTop: -4,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    gap: 12,
  },
  paymentCardActive: {
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentLabel: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  paymentDesc: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: "#0D9488" },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0D9488",
  },

  // Bottom CTA
  bottomCta: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ctaTotal: { fontSize: 16, fontWeight: "800", color: "#1F2937" },
  ctaPayment: { fontSize: 12, color: "#0D9488", fontWeight: "600" },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  ctaBtnDisabled: { opacity: 0.4 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
