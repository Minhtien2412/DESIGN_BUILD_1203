/**
 * @deprecated Use `app/orders/index.tsx` instead — this is the old hardcoded
 * order list with no API integration. Kept for backward compatibility.
 * The new screen at `/orders` fetches from the backend with fallback mocks.
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const orders = [
  {
    id: "ORD001",
    date: "05/01/2026",
    status: "delivered",
    total: 2850000,
    items: [
      {
        name: "Gạch lát nền Granite 60x60",
        qty: 10,
        price: 185000,
        image:
          "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=80&q=80",
      },
      {
        name: "Keo dán gạch Weber",
        qty: 2,
        price: 175000,
        image:
          "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=80&q=80",
      },
    ],
  },
  {
    id: "ORD002",
    date: "03/01/2026",
    status: "shipping",
    total: 4500000,
    items: [
      {
        name: "Bồn cầu TOTO 1 khối",
        qty: 1,
        price: 4500000,
        image:
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=80&q=80",
      },
    ],
  },
  {
    id: "ORD003",
    date: "28/12/2025",
    status: "processing",
    total: 890000,
    items: [
      {
        name: "Sơn nội thất Dulux cao cấp",
        qty: 1,
        price: 890000,
        image:
          "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=80&q=80",
      },
    ],
  },
  {
    id: "ORD004",
    date: "20/12/2025",
    status: "cancelled",
    total: 1200000,
    items: [
      {
        name: "Sen vòi Inax cao cấp",
        qty: 2,
        price: 600000,
        image:
          "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=80&q=80",
      },
    ],
  },
];

const tabs = ["Tất cả", "Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "processing":
      return {
        label: "Đang xử lý",
        color: "#FF9800",
        bg: "#FFF3E0",
        icon: "time",
      };
    case "shipping":
      return {
        label: "Đang giao",
        color: "#2196F3",
        bg: "#E3F2FD",
        icon: "car",
      };
    case "delivered":
      return {
        label: "Đã giao",
        color: "#4CAF50",
        bg: "#E8F5E9",
        icon: "checkmark-circle",
      };
    case "cancelled":
      return {
        label: "Đã hủy",
        color: "#F44336",
        bg: "#FFEBEE",
        icon: "close-circle",
      };
    default:
      return {
        label: status,
        color: "#666",
        bg: "#f0f0f0",
        icon: "help-circle",
      };
  }
};

export default function OrderScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const filteredOrders =
    activeTab === "Tất cả"
      ? orders
      : orders.filter((order) => {
          if (activeTab === "Chờ xử lý") return order.status === "processing";
          if (activeTab === "Đang giao") return order.status === "shipping";
          if (activeTab === "Đã giao") return order.status === "delivered";
          if (activeTab === "Đã hủy") return order.status === "cancelled";
          return true;
        });

  const renderOrder = ({ item }: { item: (typeof orders)[0] }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={[styles.orderCard, { backgroundColor: cardBg }]}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderId, { color: textColor }]}>
              #{item.id}
            </Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <Ionicons
              name={statusConfig.icon as any}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Items */}
        {item.items.map((product, index) => (
          <View key={index} style={styles.productRow}>
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text
                style={[styles.productName, { color: textColor }]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <Text style={styles.productQty}>x{product.qty}</Text>
            </View>
            <Text style={styles.productPrice}>
              {formatPrice(product.price)}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{item.items.length} sản phẩm</Text>
            <View style={styles.totalValue}>
              <Text style={styles.totalText}>Tổng: </Text>
              <Text style={[styles.totalPrice, { color: "#0D9488" }]}>
                {formatPrice(item.total)}
              </Text>
            </View>
          </View>

          <View style={styles.actionBtns}>
            {item.status === "delivered" && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#FFF3E0" }]}
                >
                  <Text style={{ color: "#FF9800", fontWeight: "500" }}>
                    Đánh giá
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#0D9488" }]}
                >
                  <Text style={{ color: "#fff", fontWeight: "500" }}>
                    Mua lại
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === "shipping" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#E3F2FD" }]}
                onPress={() => router.push("/tracking" as any)}
              >
                <Text style={{ color: "#2196F3", fontWeight: "500" }}>
                  Theo dõi
                </Text>
              </TouchableOpacity>
            )}
            {item.status === "processing" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#FFEBEE" }]}
              >
                <Text style={{ color: "#F44336", fontWeight: "500" }}>
                  Hủy đơn
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#f0f0f0" }]}
            >
              <Text style={{ color: "#666", fontWeight: "500" }}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Đơn hàng", headerShown: true }} />

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có đơn hàng</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  tabsContainer: { paddingVertical: 4 },
  tab: { paddingVertical: 12, paddingHorizontal: 16 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#0D9488" },
  tabText: { color: "#6B7280", fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: "#0D9488", fontWeight: "700" },
  listContent: { padding: 16 },
  orderCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderId: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  orderDate: { color: "#6B7280", fontSize: 13, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: { fontSize: 12, fontWeight: "500" },
  productRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  productQty: { color: "#6B7280", fontSize: 13 },
  productPrice: { color: "#0D9488", fontWeight: "700" },
  orderFooter: { padding: 16 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: { color: "#6B7280", fontSize: 13 },
  totalValue: { flexDirection: "row", alignItems: "center" },
  totalText: { color: "#666", fontSize: 14 },
  totalPrice: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  actionBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: "#9CA3AF", marginTop: 12 },
});
