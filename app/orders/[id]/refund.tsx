import { Container } from "@/components/ui/container";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiFetch } from "@/services/api";
import {
    formatPrice,
    getOrderRefunds,
    getRefundStatusColor,
    REFUND_REASON_LABELS,
    REFUND_STATUS_LABELS,
    requestRefund,
    type RefundReasonType,
    type RefundRequest,
    type RefundStatus,
} from "@/services/api/orders.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const REASON_TYPES: RefundReasonType[] = [
  "DAMAGED",
  "WRONG_ITEM",
  "NOT_RECEIVED",
  "QUALITY",
  "OTHER",
];

export default function OrderRefundScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = parseInt(id || "0");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "tint");

  const [order, setOrder] = useState<any>(null);
  const [existingRefunds, setExistingRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedReason, setSelectedReason] =
    useState<RefundReasonType>("DAMAGED");
  const [reasonText, setReasonText] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const fetchData = useCallback(async () => {
    if (!orderId) return;
    try {
      const [orderRes, refundsRes] = await Promise.all([
        apiFetch(`/orders/${orderId}`),
        getOrderRefunds(orderId).catch(() => ({ success: true, data: [] })),
      ]);
      setOrder((orderRes as any)?.data || orderRes);
      setExistingRefunds(refundsRes.data || []);
      // Pre-fill amount with order total
      const total = (orderRes as any)?.data?.total || (orderRes as any)?.total;
      if (total) setRefundAmount(String(total));
    } catch {
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!reasonText.trim()) {
      Alert.alert("Lỗi", "Vui lòng mô tả lý do hoàn tiền");
      return;
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setSubmitting(true);
    try {
      await requestRefund(orderId, {
        reason: reasonText,
        reasonType: selectedReason,
        amount,
      });

      Alert.alert(
        "Thành công",
        "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ xem xét trong 1-3 ngày làm việc.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || "Không thể gửi yêu cầu";
      Alert.alert("Lỗi", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ backgroundColor }}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </Container>
    );
  }

  const hasPendingRefund = existingRefunds.some(
    (r) => r.status === "PENDING" || r.status === "PROCESSING",
  );

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: textColor }]}>
          Yêu cầu hoàn tiền
        </Text>

        {/* Order Info */}
        {order && (
          <View style={[styles.orderCard, { borderColor }]}>
            <Text style={[styles.orderNumber, { color: textColor }]}>
              Đơn hàng: #{order.orderNumber}
            </Text>
            <Text style={[styles.orderTotal, { color: primaryColor }]}>
              Tổng: {formatPrice(order.total)}
            </Text>
          </View>
        )}

        {/* Existing Refunds */}
        {existingRefunds.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Lịch sử yêu cầu hoàn tiền
            </Text>
            {existingRefunds.map((refund) => (
              <RefundCard
                key={refund.id}
                refund={refund}
                textColor={textColor}
                borderColor={borderColor}
              />
            ))}
          </View>
        )}

        {/* Refund Form */}
        {!hasPendingRefund ? (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Lý do hoàn tiền
              </Text>
              <View style={styles.reasonGrid}>
                {REASON_TYPES.map((type) => {
                  const isSelected = selectedReason === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.reasonChip,
                        {
                          backgroundColor: isSelected
                            ? primaryColor
                            : "#F5F5F5",
                          borderColor: isSelected ? primaryColor : borderColor,
                        },
                      ]}
                      onPress={() => setSelectedReason(type)}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          { color: isSelected ? "#FFF" : textColor },
                        ]}
                      >
                        {REFUND_REASON_LABELS[type]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>
                Mô tả chi tiết <Text style={{ color: "#EF4444" }}>*</Text>
              </Text>
              <TextInput
                style={[styles.textArea, { color: textColor, borderColor }]}
                placeholder="Mô tả lý do yêu cầu hoàn tiền..."
                placeholderTextColor="#999"
                value={reasonText}
                onChangeText={setReasonText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>
                Số tiền yêu cầu hoàn (VNĐ)
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Nhập số tiền"
                placeholderTextColor="#999"
                value={refundAmount}
                onChangeText={setRefundAmount}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: primaryColor,
                  opacity: submitting ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Gửi yêu cầu hoàn tiền
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.pendingBanner, { borderColor: "#F59E0B" }]}>
            <Ionicons name="time-outline" size={24} color="#F59E0B" />
            <Text style={[styles.pendingText, { color: textColor }]}>
              Bạn đã có yêu cầu hoàn tiền đang chờ xử lý. Vui lòng chờ kết quả
              trước khi gửi yêu cầu mới.
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

function RefundCard({
  refund,
  textColor,
  borderColor,
}: {
  refund: RefundRequest;
  textColor: string;
  borderColor: string;
}) {
  const statusColor = getRefundStatusColor(refund.status);
  const statusLabel =
    REFUND_STATUS_LABELS[refund.status as RefundStatus] || refund.status;

  return (
    <View style={[styles.refundCard, { borderColor }]}>
      <View style={styles.refundHeader}>
        <Text style={[styles.refundReason, { color: textColor }]}>
          {REFUND_REASON_LABELS[refund.reasonType as RefundReasonType] ||
            refund.reasonType}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
      <Text style={[styles.refundDetail, { color: "#666" }]} numberOfLines={2}>
        {refund.reason}
      </Text>
      <View style={styles.refundFooter}>
        <Text style={[styles.refundAmount, { color: textColor }]}>
          {formatPrice(refund.amount)}
        </Text>
        <Text style={[styles.refundDate, { color: "#999" }]}>
          {new Date(refund.createdAt).toLocaleDateString("vi-VN")}
        </Text>
      </View>
      {refund.adminNote && (
        <Text style={[styles.adminNote, { color: "#666" }]}>
          Admin: {refund.adminNote}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: { fontSize: 15, fontWeight: "600" },
  orderTotal: { fontSize: 16, fontWeight: "bold" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  label: { fontSize: 15, fontWeight: "500", marginBottom: 8 },
  reasonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  reasonChipText: { fontSize: 13, fontWeight: "500" },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FFF8E1",
  },
  pendingText: { flex: 1, fontSize: 14 },
  refundCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  refundHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  refundReason: { fontSize: 14, fontWeight: "600", flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600" },
  refundDetail: { fontSize: 13, marginBottom: 8 },
  refundFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refundAmount: { fontSize: 15, fontWeight: "600" },
  refundDate: { fontSize: 12 },
  adminNote: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5E5",
  },
});
