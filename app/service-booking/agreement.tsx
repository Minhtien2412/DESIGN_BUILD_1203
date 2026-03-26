/**
 * Agreement Screen — S09: Biên bản / Thoả thuận dịch vụ
 *
 * Status: quoted → awaiting_customer_confirmation → confirmed
 *
 * Displays the worker's quote, service scope, and allows customer
 * to accept/reject with optional negotiation chat link.
 */

import QuoteCard, { type QuoteData } from "@/components/booking/QuoteCard";
import { useBooking } from "@/context/BookingContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    SERVICE_ORDER_STATUS_META,
    type ServiceOrderStatus
} from "@/types/service-order";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AgreementScreen() {
  const router = useRouter();
  const colors = useThemeColor();
  const { getBookingById } = useBooking();
  const params = useLocalSearchParams<{
    bookingId: string;
    workerName?: string;
    workerAvatar?: string;
    workerRating?: string;
    laborCost?: string;
    materialCost?: string;
    transportCost?: string;
    discount?: string;
    quoteNotes?: string;
    estimatedHours?: string;
    validUntil?: string;
    serviceName?: string;
    address?: string;
  }>();

  const [submitting, setSubmitting] = useState(false);

  // Try real booking data, fall back to params
  const booking = useMemo(
    () => (params.bookingId ? getBookingById?.(params.bookingId) : null),
    [params.bookingId, getBookingById],
  );

  const status: ServiceOrderStatus = "awaiting_customer_confirmation";
  const statusMeta = SERVICE_ORDER_STATUS_META[status];

  const quoteData: QuoteData = {
    quoteId: params.bookingId || "",
    workerName: params.workerName || booking?.workerInfo?.name || "Thợ",
    workerAvatar: params.workerAvatar || booking?.workerInfo?.avatar,
    workerRating: params.workerRating
      ? parseFloat(params.workerRating)
      : booking?.workerInfo?.rating,
    laborCost: parseInt(params.laborCost || "0", 10) || booking?.price || 0,
    materialCost: parseInt(params.materialCost || "0", 10),
    transportCost: parseInt(params.transportCost || "0", 10),
    discount: parseInt(params.discount || "0", 10),
    notes: params.quoteNotes,
    validUntil: params.validUntil,
    estimatedHours: params.estimatedHours
      ? parseInt(params.estimatedHours, 10)
      : undefined,
  };

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      // TODO: call API → PATCH /bookings/:id/accept-quote
      Alert.alert(
        "Đã chấp nhận",
        "Bạn đã đồng ý báo giá. Đơn sẽ chuyển sang lên lịch.",
      );
      router.back();
    } catch {
      Alert.alert("Lỗi", "Không thể xác nhận. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      "Từ chối báo giá",
      "Bạn có muốn từ chối báo giá này? Bạn có thể nhắn thợ để thương lượng thêm.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: () => {
            // TODO: call API → PATCH /bookings/:id/reject-quote
            router.back();
          },
        },
      ],
    );
  };

  const handleChat = () => {
    const workerId = booking?.workerId || "worker";
    const name = encodeURIComponent(
      params.workerName || booking?.workerInfo?.name || "",
    );
    router.push(`/chat/${workerId}?name=${name}` as any);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          Thoả thuận dịch vụ
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.body}>
        {/* Status badge */}
        <View style={[s.statusBadge, { backgroundColor: statusMeta.bgColor }]}>
          <Ionicons
            name={statusMeta.icon as any}
            size={14}
            color={statusMeta.color}
          />
          <Text style={[s.statusText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
        </View>

        {/* Service summary */}
        <View style={[s.card, { backgroundColor: colors.card }]}>
          <Text style={[s.cardTitle, { color: colors.text }]}>
            Dịch vụ yêu cầu
          </Text>
          {params.serviceName && (
            <View style={s.infoRow}>
              <Ionicons name="construct-outline" size={16} color="#0D9488" />
              <Text style={[s.infoText, { color: colors.text }]}>
                {params.serviceName}
              </Text>
            </View>
          )}
          {params.address && (
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={16} color="#0D9488" />
              <Text style={[s.infoText, { color: colors.textSecondary }]}>
                {params.address}
              </Text>
            </View>
          )}
        </View>

        {/* Quote card */}
        <Text style={[s.sectionLabel, { color: colors.text }]}>
          Báo giá từ thợ
        </Text>
        <QuoteCard
          quote={quoteData}
          onAccept={handleAccept}
          onReject={handleReject}
          onChat={handleChat}
        />

        {/* Info */}
        <View style={s.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#3B82F6"
          />
          <Text style={s.infoBoxText}>
            Chấp nhận báo giá = đồng ý để thợ bắt đầu. Bạn có thể nhắn tin
            thương lượng trước khi quyết định.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  body: { padding: 16, paddingBottom: 40 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  statusText: { fontSize: 13, fontWeight: "600" },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  infoText: { fontSize: 13, flex: 1 },
  sectionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    marginTop: 8,
  },
  infoBoxText: { flex: 1, fontSize: 12, color: "#1E40AF", lineHeight: 18 },
});
