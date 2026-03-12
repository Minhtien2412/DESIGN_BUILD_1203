/**
 * Order Tracking Popup Modal
 * Shows order timeline/status in a bottom sheet
 *
 * Features:
 * - Order status timeline with steps
 * - Tracking number & shipping info
 * - Copy tracking number
 * - Open full order detail
 * - Real-time status from API
 *
 * API: GET /orders/:id, GET /orders/:id/tracking
 */

import {
    getOrderById,
    getOrderTracking,
    type Order,
} from "@/services/api/orders.service";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { height: SH } = Dimensions.get("window");
const MODAL_HEIGHT = SH * 0.7;

const THEME = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  background: "#FFFFFF",
  surface: "#F8FAFB",
  text: "#1A1A1A",
  textSecondary: "#757575",
  border: "#E8E8E8",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

interface OrderTrackingModalProps {
  visible: boolean;
  orderId: string | null;
  onClose: () => void;
}

interface TrackingStep {
  status: string;
  label: string;
  time: string;
  description: string;
  completed: boolean;
  current: boolean;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: string;
    color: string;
  }
> = {
  PENDING: { label: "Chờ xác nhận", icon: "time", color: THEME.warning },
  CONFIRMED: {
    label: "Đã xác nhận",
    icon: "checkmark-circle",
    color: THEME.info,
  },
  PROCESSING: {
    label: "Đang xử lý",
    icon: "construct",
    color: THEME.primary,
  },
  SHIPPING: {
    label: "Đang giao hàng",
    icon: "car",
    color: THEME.info,
  },
  DELIVERED: {
    label: "Đã giao hàng",
    icon: "checkmark-done",
    color: THEME.success,
  },
  COMPLETED: {
    label: "Hoàn thành",
    icon: "trophy",
    color: THEME.success,
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: "close-circle",
    color: THEME.error,
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    icon: "cash",
    color: THEME.warning,
  },
};

const TIMELINE_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
] as const;

export function OrderTrackingModal({
  visible,
  orderId,
  onClose,
}: OrderTrackingModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const slideAnim = React.useRef(new Animated.Value(MODAL_HEIGHT)).current;

  // Fetch order data
  useEffect(() => {
    if (!visible || !orderId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderData, trackingData] = await Promise.allSettled([
          getOrderById(orderId),
          getOrderTracking(orderId),
        ]);

        if (!cancelled) {
          if (orderData.status === "fulfilled") {
            setOrder(orderData.value);
          }
          if (trackingData.status === "fulfilled") {
            setTracking(trackingData.value);
          }
        }
      } catch (err) {
        console.warn("[OrderTracking] Failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [visible, orderId]);

  // Animate
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleCopyTracking = useCallback(async () => {
    if (!order?.trackingNumber) return;
    await Clipboard.setStringAsync(order.trackingNumber);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Đã sao chép", "Mã vận đơn đã được sao chép vào clipboard");
  }, [order]);

  const handleViewDetail = useCallback(() => {
    if (!order) return;
    onClose();
    router.push(`/orders/${order.id}`);
  }, [order, onClose]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + "đ";

  // Build timeline steps
  const currentStatusIdx = order
    ? TIMELINE_STEPS.indexOf(order.status as any)
    : -1;

  const isCancelled =
    order?.status === "CANCELLED" || order?.status === "REFUNDED";

  const timelineSteps: TrackingStep[] = isCancelled
    ? [
        {
          status: order!.status,
          label: STATUS_CONFIG[order!.status]?.label || order!.status,
          time: formatDate(order!.updatedAt),
          description:
            order!.status === "CANCELLED"
              ? "Đơn hàng đã bị hủy"
              : "Đã hoàn tiền cho khách hàng",
          completed: true,
          current: true,
        },
      ]
    : TIMELINE_STEPS.map((step, idx) => ({
        status: step,
        label: STATUS_CONFIG[step]?.label || step,
        time: idx <= currentStatusIdx ? formatDate(order?.updatedAt) : "",
        description: getStepDescription(step),
        completed: idx <= currentStatusIdx,
        current: idx === currentStatusIdx,
      }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <Pressable onPress={() => {}}>
            {/* Handle */}
            <View style={styles.handleBar}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="navigate" size={20} color={THEME.primary} />
              <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={THEME.textSecondary} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.loadingText}>
                  Đang tải thông tin đơn hàng...
                </Text>
              </View>
            ) : order ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                {/* Order Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Mã đơn</Text>
                    <Text style={styles.summaryValue}>
                      #{order.orderNumber}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ngày đặt</Text>
                    <Text style={styles.summaryValue}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tổng tiền</Text>
                    <Text style={[styles.summaryValue, { color: THEME.error }]}>
                      {formatCurrency(order.total)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Thanh toán</Text>
                    <View
                      style={[
                        styles.paymentBadge,
                        {
                          backgroundColor:
                            order.paymentStatus === "PAID"
                              ? THEME.success + "15"
                              : THEME.warning + "15",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentBadgeText,
                          {
                            color:
                              order.paymentStatus === "PAID"
                                ? THEME.success
                                : THEME.warning,
                          },
                        ]}
                      >
                        {order.paymentStatus === "PAID"
                          ? "Đã thanh toán"
                          : "Chờ thanh toán"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <View style={styles.trackingCard}>
                    <View style={styles.trackingRow}>
                      <Ionicons
                        name="barcode-outline"
                        size={18}
                        color={THEME.primary}
                      />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.trackingLabel}>Mã vận đơn</Text>
                        <Text style={styles.trackingNumber}>
                          {order.trackingNumber}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={handleCopyTracking}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={16}
                          color={THEME.primary}
                        />
                        <Text style={styles.copyText}>Sao chép</Text>
                      </TouchableOpacity>
                    </View>
                    {order.estimatedDelivery && (
                      <View style={styles.estimatedRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={THEME.success}
                        />
                        <Text style={styles.estimatedText}>
                          Dự kiến giao: {formatDate(order.estimatedDelivery)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Timeline */}
                <View style={styles.timelineSection}>
                  <Text style={styles.timelineTitle}>Trạng thái đơn hàng</Text>
                  {timelineSteps.map((step, idx) => (
                    <View key={step.status} style={styles.timelineItem}>
                      {/* Line */}
                      {idx < timelineSteps.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            step.completed && styles.timelineLineCompleted,
                          ]}
                        />
                      )}
                      {/* Dot */}
                      <View
                        style={[
                          styles.timelineDot,
                          step.completed && styles.timelineDotCompleted,
                          step.current && styles.timelineDotCurrent,
                        ]}
                      >
                        {step.completed && (
                          <Ionicons
                            name={
                              step.current
                                ? ((STATUS_CONFIG[step.status]?.icon ||
                                    "ellipse") as any)
                                : "checkmark"
                            }
                            size={step.current ? 14 : 12}
                            color="#FFF"
                          />
                        )}
                      </View>
                      {/* Content */}
                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineLabel,
                            step.current && styles.timelineLabelCurrent,
                            !step.completed && styles.timelineLabelPending,
                          ]}
                        >
                          {step.label}
                        </Text>
                        {step.time ? (
                          <Text style={styles.timelineTime}>{step.time}</Text>
                        ) : null}
                        <Text style={styles.timelineDesc}>
                          {step.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* View full detail */}
                <TouchableOpacity
                  style={styles.viewFullBtn}
                  onPress={handleViewDetail}
                >
                  <Text style={styles.viewFullText}>Xem chi tiết đầy đủ</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={THEME.primary}
                  />
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={THEME.textSecondary}
                />
                <Text style={styles.emptyText}>
                  Không tìm thấy thông tin đơn hàng
                </Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function getStepDescription(status: string): string {
  switch (status) {
    case "PENDING":
      return "Đơn hàng đã được tạo, đang chờ xác nhận từ người bán";
    case "CONFIRMED":
      return "Người bán đã xác nhận đơn hàng của bạn";
    case "PROCESSING":
      return "Đơn hàng đang được đóng gói và chuẩn bị giao";
    case "SHIPPING":
      return "Đơn hàng đang trên đường giao đến bạn";
    case "DELIVERED":
      return "Đơn hàng đã được giao thành công";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: MODAL_HEIGHT,
    overflow: "hidden",
  },
  handleBar: { alignItems: "center", paddingVertical: 10 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: THEME.text,
  },
  loadingContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: THEME.textSecondary },
  emptyContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { marginTop: 12, fontSize: 15, color: THEME.textSecondary },

  // Summary
  summaryCard: {
    margin: 16,
    padding: 14,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Tracking
  trackingCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackingLabel: {
    fontSize: 11,
    color: THEME.textSecondary,
  },
  trackingNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  copyText: {
    fontSize: 12,
    fontWeight: "500",
    color: THEME.primary,
  },
  estimatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#CCFBF1",
  },
  estimatedText: {
    fontSize: 13,
    color: THEME.success,
    fontWeight: "500",
  },

  // Timeline
  timelineSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingLeft: 4,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 15,
    top: 28,
    width: 2,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  timelineLineCompleted: {
    backgroundColor: THEME.primary,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  timelineDotCompleted: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  timelineDotCurrent: {
    backgroundColor: THEME.primary,
    borderColor: "#CCFBF1",
    borderWidth: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  timelineLabelCurrent: {
    color: THEME.primary,
    fontWeight: "700",
  },
  timelineLabelPending: {
    color: THEME.textSecondary,
    fontWeight: "400",
  },
  timelineTime: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  timelineDesc: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },

  // View Full
  viewFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 4,
    marginTop: 8,
  },
  viewFullText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
  },
});

export default OrderTrackingModal;
