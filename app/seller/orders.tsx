/**
 * Seller Orders Management - Shopee/TikTok Style
 * Quản lý đơn hàng của người bán
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiFetch } from "@/services/api";

// Types
interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface SellerOrder {
  id: number;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPING"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  customer: {
    name: string;
    phone: string;
    avatar?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  note?: string;
  shippingAddress: string;
}

type OrderTab =
  | "all"
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

const ORDER_TABS: { key: OrderTab; label: string; color: string }[] = [
  { key: "all", label: "Tất cả", color: "#6B7280" },
  { key: "pending", label: "Chờ xác nhận", color: "#F59E0B" },
  { key: "confirmed", label: "Đã xác nhận", color: "#3B82F6" },
  { key: "shipping", label: "Đang giao", color: "#8B5CF6" },
  { key: "delivered", label: "Đã giao", color: "#10B981" },
  { key: "cancelled", label: "Đã hủy", color: "#EF4444" },
];

export default function SellerOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await apiFetch<{
        data: SellerOrder[];
        meta: { total: number };
      }>("/orders/seller");

      if (response?.data) {
        setOrders(response.data);

        // Calculate stats
        setStats({
          total: response.data.length,
          pending: response.data.filter((o) => o.status === "PENDING").length,
          confirmed: response.data.filter((o) => o.status === "CONFIRMED")
            .length,
          shipping: response.data.filter((o) => o.status === "SHIPPING").length,
          delivered: response.data.filter((o) => o.status === "DELIVERED")
            .length,
          cancelled: response.data.filter((o) => o.status === "CANCELLED")
            .length,
        });
      }
    } catch (error) {
      console.error("[SellerOrders] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Filter orders by tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status.toLowerCase() === activeTab;
  });

  // Update order status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        data: { status: newStatus },
      });
      await fetchOrders();
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  // Handle order action
  const handleOrderAction = (order: SellerOrder, action: string) => {
    switch (action) {
      case "confirm":
        Alert.alert(
          "Xác nhận đơn hàng",
          "Bạn có chắc muốn xác nhận đơn hàng này?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Xác nhận",
              onPress: () => updateOrderStatus(order.id, "CONFIRMED"),
            },
          ],
        );
        break;
      case "ship":
        Alert.alert(
          "Giao hàng",
          "Xác nhận đã gửi hàng cho đơn vị vận chuyển?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Đã gửi",
              onPress: () => updateOrderStatus(order.id, "SHIPPING"),
            },
          ],
        );
        break;
      case "cancel":
        Alert.alert("Hủy đơn hàng", "Bạn có chắc muốn hủy đơn hàng này?", [
          { text: "Không", style: "cancel" },
          {
            text: "Hủy đơn",
            style: "destructive",
            onPress: () => updateOrderStatus(order.id, "CANCELLED"),
          },
        ]);
        break;
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge
  const getStatusBadge = (status: SellerOrder["status"]) => {
    const statusMap = {
      PENDING: { color: "#F59E0B", bg: "#FEF3C7", text: "Chờ xác nhận" },
      CONFIRMED: { color: "#3B82F6", bg: "#DBEAFE", text: "Đã xác nhận" },
      PROCESSING: { color: "#8B5CF6", bg: "#EDE9FE", text: "Đang xử lý" },
      SHIPPING: { color: "#8B5CF6", bg: "#EDE9FE", text: "Đang giao" },
      DELIVERED: { color: "#10B981", bg: "#D1FAE5", text: "Đã giao" },
      CANCELLED: { color: "#EF4444", bg: "#FEE2E2", text: "Đã hủy" },
      RETURNED: { color: "#6B7280", bg: "#F3F4F6", text: "Trả hàng" },
    };
    return (
      statusMap[status] || { color: "#6B7280", bg: "#F3F4F6", text: status }
    );
  };

  // Render order item
  const renderOrder = ({ item: order }: { item: SellerOrder }) => {
    const statusBadge = getStatusBadge(order.status);

    return (
      <View style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.customerInfo}>
            <Image
              source={{
                uri:
                  order.customer.avatar ||
                  "https://ui-avatars.com/api/?name=KH&size=40&background=4CAF50&color=fff",
              }}
              style={styles.customerAvatar}
            />
            <View>
              <Text style={styles.customerName}>{order.customer.name}</Text>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}
          >
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        {/* Items */}
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.productImage }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.productName}
              </Text>
              {item.variant && (
                <Text style={styles.itemVariant}>{item.variant}</Text>
              )}
              <Text style={styles.itemPrice}>
                {formatPrice(item.price)} x {item.quantity}
              </Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.footerLabel}>Tổng đơn hàng:</Text>
            <Text style={styles.totalAmount}>
              {formatPrice(order.totalAmount)}
            </Text>
          </View>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.detailBtn}
            onPress={() =>
              router.push(`/seller/order-detail?id=${order.id}` as Href)
            }
          >
            <Text style={styles.detailBtnText}>Chi tiết</Text>
          </Pressable>

          {order.status === "PENDING" && (
            <>
              <Pressable
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleOrderAction(order, "cancel")}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => handleOrderAction(order, "confirm")}
              >
                <Text style={styles.confirmBtnText}>Xác nhận</Text>
              </Pressable>
            </>
          )}

          {order.status === "CONFIRMED" && (
            <Pressable
              style={[styles.actionBtn, styles.confirmBtn]}
              onPress={() => handleOrderAction(order, "ship")}
            >
              <Ionicons name="cube-outline" size={16} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}> Gửi hàng</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Stats Header */}
      <LinearGradient
        colors={["#FF6B35", "#FF8C5A"]}
        style={styles.headerGradient}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Chờ xác nhận</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.shipping}</Text>
            <Text style={styles.statLabel}>Đang giao</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ORDER_TABS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.tab, activeTab === item.key && styles.activeTab]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.key && styles.activeTabText,
                ]}
              >
                {item.label}
              </Text>
              {item.key !== "all" &&
                stats[item.key as keyof typeof stats] > 0 && (
                  <View
                    style={[styles.tabBadge, { backgroundColor: item.color }]}
                  >
                    <Text style={styles.tabBadgeText}>
                      {stats[item.key as keyof typeof stats]}
                    </Text>
                  </View>
                )}
            </Pressable>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B35"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        }
      />
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
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B35",
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderNumber: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: "#FF6B35",
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FAFAFA",
  },
  footerLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
    marginTop: 2,
  },
  orderDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    gap: 8,
  },
  detailBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailBtnText: {
    fontSize: 13,
    color: "#6B7280",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: "#FEE2E2",
  },
  cancelBtnText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
  },
  confirmBtn: {
    backgroundColor: "#FF6B35",
  },
  confirmBtnText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
});
