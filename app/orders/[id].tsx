/**
 * Order Detail Screen
 * Hiển thị chi tiết đơn hàng với timeline trạng thái
 *
 * @updated 2026-02-03
 *
 * Features:
 * - Order timeline/status tracking
 * - Product list with images
 * - Shipping & payment info
 * - Actions: Cancel, Reorder, Contact support
 * - Pull to refresh
 */

import { OrderTrackingModal } from "@/components/modals/OrderTrackingModal";
import { Container } from "@/components/ui/container";
import ModernButton from "@/components/ui/modern-button";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
    cancelOrder as apiCancelOrder,
    getOrderById,
} from "@/services/api/orders.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// Types
// ============================================================================

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "delivered"
  | "cancelled";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  variant?: string;
}

interface OrderTimeline {
  status: OrderStatus;
  label: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  note?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_ORDER: OrderDetail = {
  id: "1",
  orderNumber: "#DH123456",
  createdAt: "2026-02-01T10:30:00",
  updatedAt: "2026-02-02T14:20:00",
  status: "shipping",
  items: [
    {
      id: "1",
      name: "Xi măng PCB40 Holcim",
      quantity: 10,
      price: 100000,
      image: "https://picsum.photos/200/200?random=1",
      variant: "50kg/bao",
    },
    {
      id: "2",
      name: "Gạch ốp lát Viglacera 60x60",
      quantity: 50,
      price: 25600,
      image: "https://picsum.photos/200/200?random=2",
      variant: "Màu trắng ngà",
    },
    {
      id: "3",
      name: "Sơn Dulux Weathershield",
      quantity: 5,
      price: 280000,
      image: "https://picsum.photos/200/200?random=3",
      variant: "18L - Màu trắng",
    },
  ],
  subtotal: 3680000,
  shippingFee: 50000,
  discount: 100000,
  total: 3630000,
  shippingAddress: {
    name: "Nguyễn Văn A",
    phone: "0912 345 678",
    address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  },
  paymentMethod: "Thanh toán khi nhận hàng (COD)",
  paymentStatus: "pending",
  note: "Giao hàng giờ hành chính",
  trackingNumber: "VN123456789",
  estimatedDelivery: "2026-02-05",
};

// ============================================================================
// Status Config
// ============================================================================

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: { label: "Chờ xác nhận", color: "#FFB800", icon: "time-outline" },
  confirmed: {
    label: "Đã xác nhận",
    color: "#0D9488",
    icon: "checkmark-circle-outline",
  },
  processing: {
    label: "Đang xử lý",
    color: "#8B5CF6",
    icon: "settings-outline",
  },
  shipping: { label: "Đang giao hàng", color: "#10B981", icon: "car-outline" },
  delivered: {
    label: "Đã giao hàng",
    color: "#0D9488",
    icon: "checkmark-done-outline",
  },
  cancelled: {
    label: "Đã hủy",
    color: "#EF4444",
    icon: "close-circle-outline",
  },
};

// ============================================================================
// Component
// ============================================================================

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const primary = useThemeColor({}, "primary");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  // Load order detail
  const loadOrder = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        if (!id) throw new Error("Missing order ID");
        const apiOrder = await getOrderById(id);
        // Map API order to component's OrderDetail format
        setOrder({
          id: apiOrder.id,
          orderNumber: apiOrder.orderNumber || `#DH${apiOrder.id}`,
          createdAt: apiOrder.createdAt,
          updatedAt: apiOrder.updatedAt,
          status: apiOrder.status.toLowerCase() as OrderStatus,
          items: apiOrder.items.map((item) => ({
            id: item.id,
            name: item.product?.name || `Sản phẩm #${item.productId}`,
            quantity: item.quantity,
            price: item.price,
            image:
              (item.product as any)?.image?.uri ||
              `https://picsum.photos/200/200?random=${item.id}`,
            variant: (item as any).variant,
          })),
          subtotal: apiOrder.subtotal,
          shippingFee: apiOrder.shippingFee,
          discount: apiOrder.discount,
          total: apiOrder.total,
          shippingAddress: {
            name: apiOrder.shippingAddress?.fullName || "",
            phone: apiOrder.shippingAddress?.phone || "",
            address: [
              apiOrder.shippingAddress?.address,
              apiOrder.shippingAddress?.ward,
              apiOrder.shippingAddress?.district,
              apiOrder.shippingAddress?.city,
            ]
              .filter(Boolean)
              .join(", "),
          },
          paymentMethod: apiOrder.paymentMethod || "COD",
          paymentStatus: (apiOrder.paymentStatus?.toLowerCase() ||
            "pending") as "pending" | "paid" | "failed",
          note: apiOrder.note,
          trackingNumber: apiOrder.trackingNumber,
          estimatedDelivery: apiOrder.estimatedDelivery,
        });
      } catch (error) {
        console.error("[OrderDetail] Error loading order:", error);
        // Fallback to mock data
        setOrder({ ...MOCK_ORDER, id: id || "1" });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrder(false);
  }, [loadOrder]);

  // Generate timeline based on current status
  const getTimeline = (): OrderTimeline[] => {
    if (!order) return [];

    const statuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
    ];
    const currentIndex = statuses.indexOf(order.status);

    if (order.status === "cancelled") {
      return [
        {
          status: "pending",
          label: "Chờ xác nhận",
          completed: true,
          current: false,
          date: order.createdAt,
        },
        {
          status: "cancelled",
          label: "Đã hủy",
          completed: true,
          current: true,
          date: order.updatedAt,
        },
      ];
    }

    return statuses.map((status, index) => ({
      status,
      label: STATUS_CONFIG[status].label,
      completed: index <= currentIndex,
      current: index === currentIndex,
      date:
        index <= currentIndex
          ? index === currentIndex
            ? order.updatedAt
            : order.createdAt
          : undefined,
    }));
  };

  const handleCancelOrder = () => {
    if (!order || order.status !== "pending") {
      Alert.alert("Không thể hủy", "Đơn hàng đã được xử lý, không thể hủy");
      return;
    }

    Alert.alert(
      "Hủy đơn hàng",
      `Bạn có chắc muốn hủy đơn hàng ${order.orderNumber}?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await apiCancelOrder(order.id, "Khách hàng yêu cầu hủy");
              setOrder((prev) =>
                prev ? { ...prev, status: "cancelled" } : null,
              );
              Alert.alert("Thành công", "Đơn hàng đã được hủy");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy đơn hàng");
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const handleReorder = () => {
    if (!order) return;
    Alert.alert(
      "Đặt lại đơn hàng",
      "Các sản phẩm sẽ được thêm vào giỏ hàng của bạn",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thêm vào giỏ",
          onPress: () => {
            // TODO: Add items to cart
            router.push("/cart");
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    if (!order) return;
    try {
      await Share.share({
        message: `Đơn hàng ${order.orderNumber}\nTổng: ${formatCurrency(order.total)}\nTrạng thái: ${STATUS_CONFIG[order.status].label}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleContactSupport = () => {
    router.push("/customer-support");
  };

  const handleTrackShipping = () => {
    setShowTracking(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </Container>
    );
  }

  // Error state
  if (!order) {
    return (
      <Container>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
          <ModernButton onPress={() => router.back()}>Quay lại</ModernButton>
        </View>
      </Container>
    );
  }

  const timeline = getTimeline();
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Order Status Badge */}
          <View style={styles.statusBadgeContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.color + "20" },
              ]}
            >
              <Ionicons
                name={statusConfig.icon}
                size={20}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
            <View style={styles.timeline}>
              {timeline.map((item, index) => (
                <View key={item.status} style={styles.timelineItem}>
                  <View style={styles.timelineDot}>
                    <View
                      style={[
                        styles.dot,
                        item.completed && styles.dotCompleted,
                        item.current && styles.dotCurrent,
                      ]}
                    >
                      {item.completed && (
                        <Ionicons
                          name={
                            item.current
                              ? STATUS_CONFIG[item.status].icon
                              : "checkmark"
                          }
                          size={12}
                          color="#fff"
                        />
                      )}
                    </View>
                    {index < timeline.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          item.completed && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        item.current && styles.timelineLabelCurrent,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.date && (
                      <Text style={styles.timelineDate}>
                        {formatDate(item.date)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Tracking Number */}
            {order.trackingNumber && order.status === "shipping" && (
              <TouchableOpacity
                style={styles.trackingCard}
                onPress={handleTrackShipping}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={MODERN_COLORS.primary}
                />
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingLabel}>Mã vận đơn</Text>
                  <Text style={styles.trackingNumber}>
                    {order.trackingNumber}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Sản phẩm ({order.items.length})
            </Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.productItem}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.variant && (
                    <Text style={styles.productVariant}>{item.variant}</Text>
                  )}
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>
                      {formatCurrency(item.price)}
                    </Text>
                    <Text style={styles.productQty}>x{item.quantity}</Text>
                  </View>
                </View>
                <Text style={styles.productTotal}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
            <View style={styles.addressCard}>
              <View style={styles.addressIcon}>
                <Ionicons
                  name="location"
                  size={20}
                  color={MODERN_COLORS.primary}
                />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>
                  {order.shippingAddress.name}
                </Text>
                <Text style={styles.addressPhone}>
                  {order.shippingAddress.phone}
                </Text>
                <Text style={styles.addressText}>
                  {order.shippingAddress.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thanh toán</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Phương thức</Text>
                <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Trạng thái</Text>
                <Text
                  style={[
                    styles.paymentValue,
                    {
                      color:
                        order.paymentStatus === "paid" ? "#10B981" : "#FFB800",
                    },
                  ]}
                >
                  {order.paymentStatus === "paid"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.shippingFee)}
                </Text>
              </View>
              {order.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Giảm giá</Text>
                  <Text style={[styles.summaryValue, { color: "#10B981" }]}>
                    -{formatCurrency(order.discount)}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
                <Text style={styles.summaryTotalValue}>
                  {formatCurrency(order.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Note */}
          {order.note && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ghi chú</Text>
              <View style={styles.noteCard}>
                <Ionicons name="document-text-outline" size={18} color="#666" />
                <Text style={styles.noteText}>{order.note}</Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsSection}>
            {order.status === "pending" && (
              <ModernButton
                onPress={handleCancelOrder}
                variant="outline"
                style={styles.cancelButton}
                loading={cancelling}
              >
                {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
              </ModernButton>
            )}

            {order.status === "delivered" && (
              <>
                <ModernButton
                  onPress={handleReorder}
                  style={styles.reorderButton}
                >
                  Đặt lại đơn hàng
                </ModernButton>
                <ModernButton
                  onPress={() => router.push(`/orders/${order.id}/refund`)}
                  variant="outline"
                  icon="return-down-back-outline"
                  style={styles.refundButton}
                >
                  Yêu cầu hoàn tiền
                </ModernButton>
              </>
            )}

            {order.status === "completed" && (
              <ModernButton
                onPress={() => router.push(`/orders/${order.id}/refund`)}
                variant="outline"
                icon="return-down-back-outline"
                style={styles.refundButton}
              >
                Yêu cầu hoàn tiền / Khiếu nại
              </ModernButton>
            )}

            <ModernButton
              onPress={handleContactSupport}
              variant="secondary"
              icon="chatbubble-ellipses-outline"
              style={styles.supportButton}
            >
              Liên hệ hỗ trợ
            </ModernButton>
          </View>

          {/* Order Info Footer */}
          <View style={styles.orderInfoFooter}>
            <Text style={styles.orderInfoText}>
              Đơn hàng được tạo lúc {formatDate(order.createdAt)}
            </Text>
            {order.estimatedDelivery &&
              order.status !== "delivered" &&
              order.status !== "cancelled" && (
                <Text style={styles.orderInfoText}>
                  Dự kiến giao hàng:{" "}
                  {new Date(order.estimatedDelivery).toLocaleDateString(
                    "vi-VN",
                  )}
                </Text>
              )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Order Tracking Modal */}
        <OrderTrackingModal
          visible={showTracking}
          orderId={order.id}
          onClose={() => setShowTracking(false)}
        />
      </View>
    </>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: MODERN_SPACING.xl,
  },
  errorText: {
    marginVertical: MODERN_SPACING.lg,
    color: "#666",
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: MODERN_SPACING.lg,
    paddingHorizontal: MODERN_SPACING.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: MODERN_SPACING.sm,
    marginLeft: -MODERN_SPACING.sm,
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: "#fff",
  },
  shareButton: {
    padding: MODERN_SPACING.sm,
    marginRight: -MODERN_SPACING.sm,
  },
  statusBadgeContainer: {
    marginTop: MODERN_SPACING.lg,
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    gap: MODERN_SPACING.xs,
  },
  statusText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  orderNumber: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: MODERN_SPACING.sm,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: MODERN_SPACING.sm,
    padding: MODERN_SPACING.lg,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: "#333",
    marginBottom: MODERN_SPACING.md,
  },
  timeline: {
    paddingLeft: MODERN_SPACING.sm,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 60,
  },
  timelineDot: {
    alignItems: "center",
    width: 24,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  dotCompleted: {
    backgroundColor: MODERN_COLORS.primary,
  },
  dotCurrent: {
    backgroundColor: MODERN_COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: MODERN_COLORS.primary,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
  },
  timelineLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#666",
  },
  timelineLabelCurrent: {
    color: "#333",
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  timelineDate: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#999",
    marginTop: 2,
  },
  trackingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary + "10",
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    marginTop: MODERN_SPACING.md,
  },
  trackingInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },
  trackingLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#666",
  },
  trackingNumber: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.primary,
  },
  productItem: {
    flexDirection: "row",
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: "#F5F5F5",
  },
  productInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },
  productName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: "#333",
  },
  productVariant: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#666",
    marginTop: 2,
  },
  productPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: MODERN_SPACING.xs,
    gap: MODERN_SPACING.sm,
  },
  productPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.primary,
  },
  productQty: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#999",
  },
  productTotal: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: "#333",
    marginLeft: MODERN_SPACING.md,
    alignSelf: "center",
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_COLORS.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  addressInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },
  addressName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: "#333",
  },
  addressPhone: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#666",
    marginTop: 2,
  },
  addressText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#666",
    marginTop: 4,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: "#F9F9F9",
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xs,
  },
  paymentLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#666",
  },
  paymentValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#333",
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  summaryCard: {
    backgroundColor: "#F9F9F9",
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xs,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginTop: MODERN_SPACING.sm,
    paddingTop: MODERN_SPACING.md,
  },
  summaryLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#666",
  },
  summaryValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#333",
  },
  summaryTotalLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: "#333",
  },
  summaryTotalValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: "#666",
    lineHeight: 20,
  },
  actionsSection: {
    padding: MODERN_SPACING.lg,
    gap: MODERN_SPACING.md,
  },
  cancelButton: {
    borderColor: "#EF4444",
  },
  reorderButton: {},
  refundButton: {
    borderColor: "#F59E0B",
  },
  supportButton: {},
  orderInfoFooter: {
    alignItems: "center",
    paddingVertical: MODERN_SPACING.lg,
  },
  orderInfoText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#999",
    marginTop: 4,
  },
});
