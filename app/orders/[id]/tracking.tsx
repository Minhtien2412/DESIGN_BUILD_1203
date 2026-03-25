/**
 * Order Tracking Timeline Screen
 * Shows real-time order status progression with timeline visualization
 */
import { MISC } from "@/constants/route-registry";
import {
    getOrderById,
    type Order,
    type OrderStatus,
} from "@/services/api/orders.service";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Status Pipeline ───
const STATUS_PIPELINE: {
  key: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}[] = [
  {
    key: "PENDING",
    label: "Chờ xác nhận",
    icon: "time-outline",
    description: "Đơn hàng đang chờ xác nhận từ người bán",
  },
  {
    key: "CONFIRMED",
    label: "Đã xác nhận",
    icon: "checkmark-circle-outline",
    description: "Đơn hàng đã được xác nhận",
  },
  {
    key: "PROCESSING",
    label: "Đang xử lý",
    icon: "construct-outline",
    description: "Đơn hàng đang được chuẩn bị",
  },
  {
    key: "SHIPPING",
    label: "Đang giao hàng",
    icon: "car-outline",
    description: "Đơn hàng đang trên đường giao",
  },
  {
    key: "DELIVERED",
    label: "Đã giao hàng",
    icon: "archive-outline",
    description: "Đơn hàng đã được giao thành công",
  },
  {
    key: "COMPLETED",
    label: "Hoàn thành",
    icon: "checkmark-done-circle-outline",
    description: "Đơn hàng hoàn tất",
  },
];

const CANCELLED_STATUS = {
  key: "CANCELLED" as OrderStatus,
  label: "Đã hủy",
  icon: "close-circle-outline" as keyof typeof Ionicons.glyphMap,
};
const REFUNDED_STATUS = {
  key: "REFUNDED" as OrderStatus,
  label: "Đã hoàn tiền",
  icon: "return-down-back-outline" as keyof typeof Ionicons.glyphMap,
};

function getStatusIndex(status: OrderStatus): number {
  return STATUS_PIPELINE.findIndex((s) => s.key === status);
}

const COLORS = {
  primary: "#7FAF4D",
  primaryLight: "#EEF7DA",
  gray: "#9CA3AF",
  grayLight: "#F3F4F6",
  text: "#111827",
  textSecondary: "#6B7280",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  white: "#FFFFFF",
  warning: "#F59E0B",
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrder();
  }, [fetchOrder]);

  const isCancelledOrRefunded =
    order?.status === "CANCELLED" || order?.status === "REFUNDED";
  const currentIndex = order ? getStatusIndex(order.status) : -1;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Stack.Screen options={{ title: "Theo dõi đơn hàng" }} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={s.container}>
        <Stack.Screen options={{ title: "Theo dõi đơn hàng" }} />
        <View style={s.center}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.danger}
          />
          <Text style={s.errorText}>{error || "Đơn hàng không tồn tại"}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={fetchOrder}>
            <Text style={s.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: `Đơn #${order.orderNumber}`,
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Order Summary Card */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Trạng thái đơn hàng</Text>
            <View
              style={[
                s.statusBadge,
                {
                  backgroundColor: isCancelledOrRefunded
                    ? COLORS.dangerLight
                    : COLORS.primaryLight,
                },
              ]}
            >
              <Text
                style={[
                  s.statusBadgeText,
                  {
                    color: isCancelledOrRefunded
                      ? COLORS.danger
                      : COLORS.primary,
                  },
                ]}
              >
                {isCancelledOrRefunded
                  ? order.status === "CANCELLED"
                    ? "Đã hủy"
                    : "Đã hoàn tiền"
                  : STATUS_PIPELINE[currentIndex]?.label || order.status}
              </Text>
            </View>
          </View>

          {order.trackingNumber && (
            <View style={s.trackingRow}>
              <Ionicons
                name="barcode-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={s.trackingText}>
                Mã vận đơn: {order.trackingNumber}
              </Text>
            </View>
          )}
          {order.estimatedDelivery && (
            <View style={s.trackingRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={s.trackingText}>
                Dự kiến giao:{" "}
                {new Date(order.estimatedDelivery).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Tiến trình đơn hàng</Text>
          <View style={s.timeline}>
            {isCancelledOrRefunded ? (
              /* Cancelled/Refunded: show special status */
              <View style={s.timelineItem}>
                <View
                  style={[s.timelineDot, { backgroundColor: COLORS.danger }]}
                >
                  <Ionicons
                    name={
                      order.status === "CANCELLED"
                        ? CANCELLED_STATUS.icon
                        : REFUNDED_STATUS.icon
                    }
                    size={14}
                    color={COLORS.white}
                  />
                </View>
                <View style={s.timelineContent}>
                  <Text style={[s.timelineLabel, { color: COLORS.danger }]}>
                    {order.status === "CANCELLED"
                      ? CANCELLED_STATUS.label
                      : REFUNDED_STATUS.label}
                  </Text>
                  <Text style={s.timelineTime}>
                    {new Date(order.updatedAt).toLocaleString("vi-VN")}
                  </Text>
                </View>
              </View>
            ) : (
              STATUS_PIPELINE.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isLast = index === STATUS_PIPELINE.length - 1;

                return (
                  <View key={step.key} style={s.timelineItem}>
                    {/* Vertical Line */}
                    {!isLast && (
                      <View
                        style={[
                          s.timelineLine,
                          {
                            backgroundColor:
                              isCompleted && !isCurrent
                                ? COLORS.primary
                                : COLORS.grayLight,
                          },
                        ]}
                      />
                    )}

                    {/* Dot */}
                    <View
                      style={[
                        s.timelineDot,
                        {
                          backgroundColor: isCompleted
                            ? COLORS.primary
                            : COLORS.grayLight,
                          borderWidth: isCurrent ? 3 : 0,
                          borderColor: isCurrent
                            ? COLORS.primaryLight
                            : "transparent",
                        },
                      ]}
                    >
                      <Ionicons
                        name={step.icon}
                        size={14}
                        color={isCompleted ? COLORS.white : COLORS.gray}
                      />
                    </View>

                    {/* Content */}
                    <View style={s.timelineContent}>
                      <Text
                        style={[
                          s.timelineLabel,
                          {
                            color: isCompleted ? COLORS.text : COLORS.gray,
                            fontWeight: isCurrent ? "700" : "500",
                          },
                        ]}
                      >
                        {step.label}
                      </Text>
                      {isCurrent && (
                        <Text style={s.timelineDescription}>
                          {step.description}
                        </Text>
                      )}
                      {isCompleted && !isCurrent && (
                        <Text style={s.timelineTime}>✓</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Payment Info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Thanh toán</Text>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Phương thức</Text>
            <Text style={s.infoValue}>
              {getPaymentMethodLabel(order.paymentMethod)}
            </Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Trạng thái</Text>
            <Text
              style={[
                s.infoValue,
                {
                  color:
                    order.paymentStatus === "PAID"
                      ? COLORS.primary
                      : COLORS.warning,
                },
              ]}
            >
              {getPaymentStatusLabel(order.paymentStatus)}
            </Text>
          </View>
          <View style={[s.infoRow, s.infoRowTotal]}>
            <Text style={s.infoLabelTotal}>Tổng cộng</Text>
            <Text style={s.infoValueTotal}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sản phẩm ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.id} style={s.itemRow}>
              <View style={s.itemInfo}>
                <Text style={s.itemName} numberOfLines={1}>
                  {item.product?.name || `SP #${item.productId}`}
                </Text>
                <Text style={s.itemQty}>x{item.quantity}</Text>
              </View>
              <Text style={s.itemPrice}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => router.push(`/orders/${id}` as any)}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={s.actionBtnText}>Chi tiết đơn</Text>
          </TouchableOpacity>
          {order.status === "COMPLETED" && (
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnPrimary]}
              onPress={() => router.push(MISC.COMING_SOON as any)}
            >
              <Ionicons name="refresh-outline" size={18} color={COLORS.white} />
              <Text style={[s.actionBtnText, { color: COLORS.white }]}>
                Mua lại
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helpers ───
function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    COD: "Thanh toán khi nhận hàng",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
    VNPAY: "VNPay",
    MOMO: "Ví MoMo",
    ZALOPAY: "ZaloPay",
  };
  return map[method] || method;
}

function getPaymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
  };
  return map[status] || status;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// ─── Styles ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  errorText: {
    marginTop: 12,
    color: COLORS.danger,
    fontSize: 15,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryBtnText: { color: COLORS.white, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  trackingText: { fontSize: 13, color: COLORS.textSecondary },
  timeline: { paddingLeft: 4 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 13,
    top: 28,
    width: 2,
    height: 28,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timelineContent: { flex: 1, paddingTop: 3 },
  timelineLabel: { fontSize: 14 },
  timelineDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timelineTime: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  infoRowTotal: { borderBottomWidth: 0, paddingTop: 12 },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  infoLabelTotal: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  infoValueTotal: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, color: COLORS.text },
  itemQty: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  actions: { flexDirection: "row", gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
});
