/**
 * Order Detail - Shopee/TikTok Style
 * Chi tiết đơn hàng
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  variant?: string;
  quantity: number;
  price: number;
}

interface OrderTimeline {
  status: string;
  timestamp: string;
  description: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "refunded";
  customer: {
    id: number;
    name: string;
    phone: string;
    avatar: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    district: string;
    city: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "refunded";
  note?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  // Fetch order detail
  const fetchOrderDetail = useCallback(async () => {
    try {
      // In production: const response = await apiFetch(`/orders/${id}`);

      // Mock data
      setOrder({
        id: 1,
        orderNumber: "DH20240115001",
        status: "confirmed",
        customer: {
          id: 201,
          name: "Nguyễn Văn An",
          phone: "0901234567",
          avatar: "https://i.pravatar.cc/150?img=1",
        },
        shippingAddress: {
          name: "Nguyễn Văn An",
          phone: "0901234567",
          address: "123 Nguyễn Văn Linh",
          district: "Quận 7",
          city: "TP. Hồ Chí Minh",
        },
        items: [
          {
            id: 1,
            productId: 101,
            productName: "Thiết kế biệt thự hiện đại 3 tầng",
            productImage:
              "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300",
            variant: "Bản vẽ 2D + 3D",
            quantity: 1,
            price: 15000000,
          },
          {
            id: 2,
            productId: 102,
            productName: "Thiết kế nội thất phòng khách",
            productImage:
              "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300",
            quantity: 1,
            price: 5000000,
          },
        ],
        subtotal: 20000000,
        shippingFee: 0,
        discount: 2000000,
        total: 18000000,
        paymentMethod: "Chuyển khoản ngân hàng",
        paymentStatus: "paid",
        note: "Khách yêu cầu gửi file qua email trong 24h",
        timeline: [
          {
            status: "created",
            timestamp: "2024-01-15T08:30:00Z",
            description: "Đơn hàng đã được tạo",
          },
          {
            status: "paid",
            timestamp: "2024-01-15T08:35:00Z",
            description: "Đã thanh toán thành công",
          },
          {
            status: "confirmed",
            timestamp: "2024-01-15T09:00:00Z",
            description: "Shop đã xác nhận đơn hàng",
          },
        ],
        createdAt: "2024-01-15T08:30:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      });
    } catch (error) {
      console.error("[OrderDetail] Fetch error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  // Format date
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Get status info
  const getStatusInfo = (status: Order["status"]) => {
    const statusMap = {
      pending: {
        label: "Chờ xác nhận",
        color: "#F59E0B",
        icon: "time-outline",
      },
      confirmed: {
        label: "Đã xác nhận",
        color: "#3B82F6",
        icon: "checkmark-circle-outline",
      },
      shipping: { label: "Đang giao", color: "#8B5CF6", icon: "car-outline" },
      delivered: {
        label: "Đã giao",
        color: "#10B981",
        icon: "checkmark-done-outline",
      },
      cancelled: {
        label: "Đã hủy",
        color: "#EF4444",
        icon: "close-circle-outline",
      },
      refunded: {
        label: "Đã hoàn tiền",
        color: "#6B7280",
        icon: "refresh-outline",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // Update order status
  const handleUpdateStatus = async (newStatus: Order["status"]) => {
    try {
      // In production: await apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: { status: newStatus } });

      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  // Call customer
  const handleCall = () => {
    if (order?.customer.phone) {
      Linking.openURL(`tel:${order.customer.phone}`);
    }
  };

  // Copy order number
  const handleCopyOrderNumber = () => {
    // In production: Clipboard.setString(order?.orderNumber || '');
    Alert.alert("Đã sao chép", order?.orderNumber);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView>
        {/* Order Status Header */}
        <LinearGradient
          colors={[statusInfo.color, `${statusInfo.color}CC`]}
          style={styles.statusHeader}
        >
          <View style={styles.statusIconContainer}>
            <Ionicons name={statusInfo.icon as any} size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.statusLabel}>{statusInfo.label}</Text>
          <Pressable
            style={styles.orderNumberRow}
            onPress={handleCopyOrderNumber}
          >
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Ionicons
              name="copy-outline"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
          </Pressable>
        </LinearGradient>

        {/* Customer Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          </View>
          <View style={styles.customerRow}>
            <Image
              source={{ uri: order.customer.avatar }}
              style={styles.customerAvatar}
            />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{order.customer.name}</Text>
              <Text style={styles.customerPhone}>{order.customer.phone}</Text>
            </View>
            <Pressable style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#10B981" />
            </Pressable>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressPhone}>
              {order.shippingAddress.phone}
            </Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.address}, {order.shippingAddress.district},{" "}
              {order.shippingAddress.city}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cart-outline" size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>
              Sản phẩm ({order.items.length})
            </Text>
          </View>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image
                source={{ uri: item.productImage }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productName}
                </Text>
                {item.variant && (
                  <Text style={styles.productVariant}>{item.variant}</Text>
                )}
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                  <Text style={styles.productQuantity}>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {order.shippingFee === 0
                ? "Miễn phí"
                : formatCurrency(order.shippingFee)}
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
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức</Text>
              <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Trạng thái</Text>
              <View
                style={[
                  styles.paymentStatusBadge,
                  {
                    backgroundColor:
                      order.paymentStatus === "paid" ? "#D1FAE5" : "#FEF3C7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.paymentStatusText,
                    {
                      color:
                        order.paymentStatus === "paid" ? "#10B981" : "#F59E0B",
                    },
                  ]}
                >
                  {order.paymentStatus === "paid"
                    ? "Đã thanh toán"
                    : "Chờ thanh toán"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note */}
        {order.note && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#6B7280"
              />
              <Text style={styles.sectionTitle}>Ghi chú từ khách hàng</Text>
            </View>
            <Text style={styles.noteText}>{order.note}</Text>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Lịch sử đơn hàng</Text>
          </View>
          {order.timeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < order.timeline.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDescription}>
                  {event.description}
                </Text>
                <Text style={styles.timelineTime}>
                  {formatDateTime(event.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        {(order.status === "pending" || order.status === "confirmed") && (
          <View style={styles.actionsSection}>
            {order.status === "pending" && (
              <>
                <Pressable
                  style={[styles.actionBtn, styles.confirmBtn]}
                  onPress={() => handleUpdateStatus("confirmed")}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Xác nhận đơn hàng</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => {
                    Alert.alert(
                      "Xác nhận",
                      "Bạn có chắc muốn hủy đơn hàng này?",
                      [
                        { text: "Không", style: "cancel" },
                        {
                          text: "Hủy đơn",
                          style: "destructive",
                          onPress: () => handleUpdateStatus("cancelled"),
                        },
                      ],
                    );
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>
                    Hủy đơn hàng
                  </Text>
                </Pressable>
              </>
            )}
            {order.status === "confirmed" && (
              <Pressable
                style={[styles.actionBtn, styles.shipBtn]}
                onPress={() => handleUpdateStatus("shipping")}
              >
                <Ionicons name="car" size={20} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Gửi hàng</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statusHeader: {
    padding: 24,
    alignItems: "center",
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  orderNumberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginRight: 6,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  customerPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  addressContent: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  addressPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  addressText: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  productVariant: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B35",
  },
  productQuantity: {
    fontSize: 13,
    color: "#6B7280",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1F2937",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  paymentInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  paymentValue: {
    fontSize: 13,
    color: "#1F2937",
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  noteText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
  },
  timelineItem: {
    flexDirection: "row",
    paddingLeft: 8,
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF6B35",
    marginTop: 4,
  },
  timelineLine: {
    position: "absolute",
    left: 13,
    top: 16,
    width: 2,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
  },
  timelineDescription: {
    fontSize: 14,
    color: "#1F2937",
  },
  timelineTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  actionsSection: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmBtn: {
    backgroundColor: "#10B981",
  },
  shipBtn: {
    backgroundColor: "#3B82F6",
  },
  cancelBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
