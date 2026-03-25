/**
 * Order List Screen - Shopee Style
 * Danh sách đơn hàng với tabs theo trạng thái
 *
 * @created 2026-02-04
 *
 * Features:
 * - Tab navigation: Tất cả, Chờ xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy
 * - Search orders
 * - Pull to refresh
 * - Order cards with status badge
 * - Empty state per tab
 */

import {
    getOrders,
    type Order as ApiOrder,
} from "@/services/api/orders.service";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Theme Colors
const THEME = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#14B8A6",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  border: "#E0E0E0",
  divider: "#EEEEEE",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#0D9488",
};

// Order Status Types
type OrderStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "return";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  variant?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  shopName: string;
  shopAvatar?: string;
  canCancel: boolean;
  canReview: boolean;
  canReorder: boolean;
}

// Status Config
const STATUS_CONFIG: Record<
  Exclude<OrderStatus, "all">,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  pending: {
    label: "Chờ xác nhận",
    color: "#FFB800",
    bgColor: "#FFF8E1",
    icon: "time-outline",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "#0D9488",
    bgColor: "#E3F2FD",
    icon: "checkmark-circle-outline",
  },
  processing: {
    label: "Đang xử lý",
    color: "#8B5CF6",
    bgColor: "#F3E5F5",
    icon: "settings-outline",
  },
  shipping: {
    label: "Đang giao",
    color: "#10B981",
    bgColor: "#E8F5E9",
    icon: "car-outline",
  },
  delivered: {
    label: "Hoàn thành",
    color: "#00BFA5",
    bgColor: "#E0F2F1",
    icon: "checkmark-done-outline",
  },
  cancelled: {
    label: "Đã hủy",
    color: "#EF4444",
    bgColor: "#FFEBEE",
    icon: "close-circle-outline",
  },
  return: {
    label: "Trả hàng",
    color: "#FF9800",
    bgColor: "#FFF3E0",
    icon: "return-down-back-outline",
  },
};

// Tab Config
const TABS: { key: OrderStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "return", label: "Trả hàng" },
];

export default function OrderListScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter orders by tab and search
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.items.some((item) => item.name.toLowerCase().includes(query)),
      );
    }
    return result;
  }, [orders, activeTab, searchQuery]);

  // Load orders
  const loadOrders = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await getOrders({ page: 1, limit: 50 });
      const mapped: Order[] = response.orders.map((o: ApiOrder) => ({
        id: o.id,
        orderNumber: o.orderNumber || `#DH${o.id}`,
        createdAt: o.createdAt,
        status: o.status.toLowerCase() as OrderStatus,
        shopName: "Nhà Xinh Official",
        total: o.total,
        canCancel: o.status === "PENDING",
        canReview: o.status === "DELIVERED" || o.status === "COMPLETED",
        canReorder: true,
        items: o.items.map((item: any) => ({
          id: item.id,
          name: item.product?.name || `Sản phẩm #${item.productId}`,
          quantity: item.quantity,
          price: item.price,
          image:
            (item.product as any)?.image?.uri ||
            `https://picsum.photos/200/200?random=${item.id}`,
          variant: (item as any).variant,
        })),
      }));
      setOrders(mapped);
    } catch (error) {
      console.error("[Orders] Error loading orders:", error);
      setOrders([]); // Show empty state on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(false);
  }, [loadOrders]);

  const handleOrderPress = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleBuyAgain = (order: Order) => {
    // TODO: Add items to cart
    router.push("/cart");
  };

  const handleReview = (order: Order) => {
    router.push(`/reviews/create?orderId=${order.id}`);
  };

  const handleCancelOrder = (order: Order) => {
    // TODO: Show cancel modal
    console.log("Cancel order:", order.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render Tab Item
  const renderTab = ({ key, label }: { key: OrderStatus; label: string }) => {
    const isActive = activeTab === key;
    const count =
      key === "all"
        ? orders.length
        : orders.filter((o) => o.status === key).length;

    return (
      <TouchableOpacity
        key={key}
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => setActiveTab(key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {label}
          {count > 0 && key !== "all" && ` (${count})`}
        </Text>
        {isActive && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    );
  };

  // Render Order Item
  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const statusConfig =
      STATUS_CONFIG[order.status as Exclude<OrderStatus, "all">];
    const firstItem = order.items[0];
    const moreCount = order.items.length - 1;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(order.id)}
        activeOpacity={0.7}
      >
        {/* Shop Header */}
        <View style={styles.shopHeader}>
          <View style={styles.shopInfo}>
            <Image
              source={{ uri: order.shopAvatar }}
              style={styles.shopAvatar}
            />
            <Text style={styles.shopName} numberOfLines={1}>
              {order.shopName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productSection}>
          <Image
            source={{ uri: firstItem.image }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {firstItem.name}
            </Text>
            {firstItem.variant && (
              <Text style={styles.productVariant}>
                Phân loại: {firstItem.variant}
              </Text>
            )}
            <View style={styles.productPriceRow}>
              <Text style={styles.productPrice}>
                ₫{formatCurrency(firstItem.price)}
              </Text>
              <Text style={styles.productQty}>x{firstItem.quantity}</Text>
            </View>
          </View>
        </View>

        {moreCount > 0 && (
          <Text style={styles.moreItems}>
            Xem thêm {moreCount} sản phẩm khác
          </Text>
        )}

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Total & Actions */}
        <View style={styles.orderFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>
              {order.items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm:
            </Text>
            <Text style={styles.totalValue}>
              ₫{formatCurrency(order.total)}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {order.canCancel && (
              <TouchableOpacity
                style={styles.actionBtnOutline}
                onPress={() => handleCancelOrder(order)}
              >
                <Text style={styles.actionBtnOutlineText}>Hủy đơn</Text>
              </TouchableOpacity>
            )}
            {order.canReview && (
              <TouchableOpacity
                style={styles.actionBtnOutline}
                onPress={() => handleReview(order)}
              >
                <Text style={styles.actionBtnOutlineText}>Đánh giá</Text>
              </TouchableOpacity>
            )}
            {order.canReorder && (
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => handleBuyAgain(order)}
              >
                <Text style={styles.actionBtnPrimaryText}>Mua lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render Empty State
  const renderEmpty = () => {
    const emptyMessages: Record<
      OrderStatus,
      { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }
    > = {
      all: {
        icon: "receipt-outline",
        title: "Chưa có đơn hàng nào",
        desc: "Hãy khám phá và đặt hàng ngay!",
      },
      pending: {
        icon: "time-outline",
        title: "Không có đơn chờ xác nhận",
        desc: "Các đơn hàng mới sẽ hiển thị ở đây",
      },
      shipping: {
        icon: "car-outline",
        title: "Không có đơn đang giao",
        desc: "Đơn hàng đang vận chuyển sẽ hiển thị ở đây",
      },
      delivered: {
        icon: "checkmark-done-outline",
        title: "Không có đơn đã giao",
        desc: "Đơn hàng hoàn thành sẽ hiển thị ở đây",
      },
      cancelled: {
        icon: "close-circle-outline",
        title: "Không có đơn đã hủy",
        desc: "Rất tốt! Không có đơn hàng nào bị hủy",
      },
      return: {
        icon: "return-down-back-outline",
        title: "Không có đơn trả hàng",
        desc: "Đơn yêu cầu trả hàng sẽ hiển thị ở đây",
      },
      confirmed: {
        icon: "checkmark-circle-outline",
        title: "Không có đơn đã xác nhận",
        desc: "",
      },
      processing: {
        icon: "settings-outline",
        title: "Không có đơn đang xử lý",
        desc: "",
      },
    };

    const empty = emptyMessages[activeTab];

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={empty.icon} size={80} color={THEME.textTertiary} />
        <Text style={styles.emptyTitle}>{empty.title}</Text>
        <Text style={styles.emptyDesc}>{empty.desc}</Text>
        <TouchableOpacity
          style={styles.shopNowBtn}
          onPress={() => router.push("/shop")}
        >
          <Text style={styles.shopNowText}>Mua sắm ngay</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
          <TouchableOpacity
            onPress={() => router.push("/search")}
            style={styles.headerBtn}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color={THEME.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm đơn hàng..."
            placeholderTextColor={THEME.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={THEME.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map(renderTab)}
        </ScrollView>
      </View>

      {/* Order List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME.primary]}
              tintColor={THEME.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },

  // Header
  header: { backgroundColor: THEME.primary },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  headerBtn: { padding: 8 },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: THEME.text, padding: 0 },

  // Tabs
  tabsWrapper: {
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
  },
  tabsContainer: { paddingHorizontal: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 14, position: "relative" },
  tabActive: {},
  tabText: { fontSize: 14, color: THEME.textSecondary },
  tabTextActive: { color: THEME.primary, fontWeight: "600" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: THEME.primary,
    borderRadius: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: THEME.textSecondary },

  // List
  listContent: { paddingVertical: 8 },
  itemSeparator: { height: 8 },

  // Order Card
  orderCard: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Shop Header
  shopHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  shopInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  shopAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  shopName: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    flex: 1,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
  statusText: { fontSize: 12, fontWeight: "500" },

  // Product
  productSection: { flexDirection: "row", marginBottom: 8 },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: THEME.background,
  },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, color: THEME.text, lineHeight: 20 },
  productVariant: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  productPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  productPrice: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "500",
  },
  productQty: { fontSize: 13, color: THEME.textSecondary },

  moreItems: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 8,
  },

  cardDivider: {
    height: 1,
    backgroundColor: THEME.divider,
    marginVertical: 12,
  },

  // Footer
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalSection: { flexDirection: "row", alignItems: "center" },
  totalLabel: { fontSize: 13, color: THEME.textSecondary },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.primary,
    marginLeft: 8,
  },

  // Actions
  actionButtons: { flexDirection: "row", gap: 8 },
  actionBtnOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  actionBtnOutlineText: { fontSize: 13, color: THEME.textSecondary },
  actionBtnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: THEME.primary,
  },
  actionBtnPrimaryText: { fontSize: 13, fontWeight: "600", color: "#fff" },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  shopNowBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: THEME.primary,
    borderRadius: 4,
  },
  shopNowText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
