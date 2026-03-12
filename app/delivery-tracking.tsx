/**
 * Delivery Tracking Screen - Tiến độ giao hàng
 * Grab/Shopee-style real-time delivery tracking with animated map
 *
 * Features:
 * - Animated delivery route with driver pin
 * - Live status timeline (ordered → confirmed → shipping → delivered)
 * - Driver info card with contact actions
 * - Estimated delivery time
 * - Order items summary
 * - Pull-to-refresh for status updates
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

type DeliveryStatus =
  | "ordered"
  | "confirmed"
  | "preparing"
  | "picked_up"
  | "in_transit"
  | "nearby"
  | "delivered";

interface DeliveryStep {
  id: string;
  status: DeliveryStatus;
  label: string;
  time?: string;
  description?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
  totalDeliveries: number;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  status: DeliveryStatus;
  estimatedTime: string;
  estimatedMinutes: number;
  pickupAddress: string;
  deliveryAddress: string;
  driver: DriverInfo;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  deliverySteps: DeliveryStep[];
  trackingNote?: string;
}

// ============================================================================
// Colors
// ============================================================================

const C = {
  primary: "#0D9488",
  primaryLight: "#F0FDFA",
  primaryDark: "#0F766E",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  blue: "#3B82F6",
  blueLight: "#DBEAFE",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  bg: "#F8FAFB",
  white: "#FFFFFF",
  border: "#E5E7EB",
  mapBg: "#E8F5E9",
};

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_ORDER: DeliveryOrder = {
  id: "del-001",
  orderNumber: "DH-2026-0227-001",
  status: "in_transit",
  estimatedTime: "14:30",
  estimatedMinutes: 25,
  pickupAddress: "Kho VLXD Đại Phát, 123 Nguyễn Văn Linh, Q7, TP.HCM",
  deliveryAddress:
    "Công trình Biệt thự Vinhomes, Lô A12, Ocean Park, Gia Lâm, Hà Nội",
  driver: {
    id: "drv-001",
    name: "Nguyễn Văn Tài",
    phone: "0987654321",
    avatar:
      "https://ui-avatars.com/api/?name=NT&background=0D9488&color=fff&size=100",
    vehicleType: "Xe tải 2.5 tấn",
    vehiclePlate: "30H-123.45",
    rating: 4.8,
    totalDeliveries: 1234,
  },
  items: [
    {
      id: "1",
      name: "Xi măng Hà Tiên PCB40 (50kg)",
      image: "https://placehold.co/80/0D9488/white?text=XM",
      quantity: 100,
      price: 95000,
    },
    {
      id: "2",
      name: "Thép Pomina D10 (cây 11.7m)",
      image: "https://placehold.co/80/14B8A6/white?text=TH",
      quantity: 200,
      price: 145000,
    },
    {
      id: "3",
      name: "Gạch ống 4 lỗ (viên)",
      image: "https://placehold.co/80/115E59/white?text=GA",
      quantity: 5000,
      price: 850,
    },
  ],
  totalAmount: 42750000,
  shippingFee: 2500000,
  deliverySteps: [
    {
      id: "s1",
      status: "ordered",
      label: "Đơn hàng đã đặt",
      time: "08:00, 27/02/2026",
      description: "Đơn hàng được xác nhận và gửi đến kho",
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: "s2",
      status: "confirmed",
      label: "Kho xác nhận",
      time: "08:45, 27/02/2026",
      description: "Kho đã xác nhận và chuẩn bị hàng",
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: "s3",
      status: "preparing",
      label: "Đang đóng gói",
      time: "10:00, 27/02/2026",
      description: "Hàng đang được kiểm tra và đóng gói lên xe",
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: "s4",
      status: "picked_up",
      label: "Đã lấy hàng",
      time: "11:30, 27/02/2026",
      description: "Tài xế đã nhận hàng và bắt đầu vận chuyển",
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: "s5",
      status: "in_transit",
      label: "Đang giao hàng",
      time: "Dự kiến 14:30",
      description: "Tài xế đang trên đường giao — còn ~25 phút",
      isCompleted: false,
      isCurrent: true,
    },
    {
      id: "s6",
      status: "nearby",
      label: "Gần đến nơi",
      isCompleted: false,
      isCurrent: false,
    },
    {
      id: "s7",
      status: "delivered",
      label: "Đã giao hàng",
      isCompleted: false,
      isCurrent: false,
    },
  ],
  trackingNote: "Tài xế đang di chuyển trên cao tốc Pháp Vân — Cầu Giẽ",
};

// ============================================================================
// Helpers
// ============================================================================

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStepIcon(status: DeliveryStatus): string {
  switch (status) {
    case "ordered":
      return "cart-outline";
    case "confirmed":
      return "checkmark-circle-outline";
    case "preparing":
      return "cube-outline";
    case "picked_up":
      return "car-outline";
    case "in_transit":
      return "navigate-outline";
    case "nearby":
      return "location-outline";
    case "delivered":
      return "home-outline";
    default:
      return "ellipse-outline";
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Simulated Map View — draws a stylized route on a green-ish background */
function DeliveryMapView({
  order,
  pulseAnim,
}: {
  order: DeliveryOrder;
  pulseAnim: Animated.Value;
}) {
  const insets = useSafeAreaInsets();

  const driverProgress = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Simulate driver moving
    Animated.loop(
      Animated.sequence([
        Animated.timing(driverProgress, {
          toValue: 0.72,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(driverProgress, {
          toValue: 0.65,
          duration: 3000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={[mapStyles.container, { paddingTop: insets.top }]}>
      {/* Simulated map background */}
      <LinearGradient
        colors={["#E0F2F1", "#B2DFDB", "#C8E6C9"]}
        style={mapStyles.mapBg}
      >
        {/* "Streets" */}
        <View style={mapStyles.gridOverlay}>
          {[...Array(8)].map((_, i) => (
            <View
              key={`h-${i}`}
              style={[
                mapStyles.streetH,
                { top: 30 + i * 40, opacity: 0.15 + (i % 3) * 0.05 },
              ]}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <View
              key={`v-${i}`}
              style={[
                mapStyles.streetV,
                { left: 30 + i * 60, opacity: 0.12 + (i % 2) * 0.06 },
              ]}
            />
          ))}
        </View>

        {/* Route Path */}
        <View style={mapStyles.routePath}>
          {/* From dot */}
          <View style={mapStyles.fromDot}>
            <View style={mapStyles.fromDotInner} />
            <Text style={mapStyles.pointLabel}>Kho</Text>
          </View>

          {/* Dashed route */}
          <View style={mapStyles.routeLine}>
            {[...Array(20)].map((_, i) => (
              <View
                key={`dash-${i}`}
                style={[
                  mapStyles.routeDash,
                  i < 12 && { backgroundColor: C.primary },
                ]}
              />
            ))}
          </View>

          {/* Driver icon (animated) */}
          <Animated.View
            style={[
              mapStyles.driverPin,
              {
                left: driverProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          >
            <Animated.View
              style={[
                mapStyles.driverPulse,
                {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 0],
                  }),
                },
              ]}
            />
            <View style={mapStyles.driverDot}>
              <Ionicons name="car" size={16} color="#fff" />
            </View>
          </Animated.View>

          {/* To dot */}
          <View style={mapStyles.toDot}>
            <Ionicons name="location" size={20} color={C.error} />
            <Text style={mapStyles.pointLabel}>Giao</Text>
          </View>
        </View>

        {/* Back button overlay */}
        <TouchableOpacity
          style={[mapStyles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>

        {/* ETA overlay */}
        <View style={[mapStyles.etaCard, { top: insets.top + 8 }]}>
          <Ionicons name="time-outline" size={16} color={C.primary} />
          <Text style={mapStyles.etaText}>
            Còn ~{order.estimatedMinutes} phút
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function DriverCard({
  driver,
  onCall,
  onChat,
}: {
  driver: DriverInfo;
  onCall: () => void;
  onChat: () => void;
}) {
  return (
    <View style={styles.driverCard}>
      <View style={styles.driverInfo}>
        <Image source={{ uri: driver.avatar }} style={styles.driverAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={styles.driverMeta}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{driver.rating}</Text>
            </View>
            <Text style={styles.driverDeliveries}>
              {driver.totalDeliveries.toLocaleString()} đơn
            </Text>
          </View>
          <View style={styles.vehicleRow}>
            <Ionicons name="car-outline" size={14} color={C.textSecondary} />
            <Text style={styles.vehicleText}>
              {driver.vehicleType} • {driver.vehiclePlate}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.driverActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onCall}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[C.success, "#059669"]}
            style={styles.actionGradient}
          >
            <Ionicons name="call" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.actionLabel}>Gọi điện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onChat}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[C.primary, C.primaryDark]}
            style={styles.actionGradient}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.actionLabel}>Nhắn tin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <View style={[styles.actionGradient, { backgroundColor: "#F3F4F6" }]}>
            <Ionicons name="share-social" size={20} color={C.textSecondary} />
          </View>
          <Text style={styles.actionLabel}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TrackingTimeline({ steps }: { steps: DeliveryStep[] }) {
  return (
    <View style={styles.timelineSection}>
      <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const icon = getStepIcon(step.status);
        const dotColor = step.isCompleted
          ? C.success
          : step.isCurrent
            ? C.primary
            : C.border;

        return (
          <View key={step.id} style={styles.timelineItem}>
            {/* Left column — dot + line */}
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: dotColor },
                  step.isCurrent && styles.timelineDotCurrent,
                ]}
              >
                {step.isCompleted ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Ionicons
                    name={icon as any}
                    size={12}
                    color={step.isCurrent ? "#fff" : C.textMuted}
                  />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    {
                      backgroundColor: step.isCompleted ? C.success : C.border,
                    },
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View
              style={[
                styles.timelineContent,
                step.isCurrent && styles.timelineContentCurrent,
              ]}
            >
              <Text
                style={[
                  styles.timelineLabel,
                  step.isCurrent && { color: C.primary, fontWeight: "700" },
                  !step.isCompleted &&
                    !step.isCurrent && { color: C.textMuted },
                ]}
              >
                {step.label}
              </Text>
              {step.time && (
                <Text style={styles.timelineTime}>{step.time}</Text>
              )}
              {step.description && step.isCurrent && (
                <Text style={styles.timelineDesc}>{step.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function OrderItemsSection({ items }: { items: OrderItem[] }) {
  return (
    <View style={styles.itemsSection}>
      <Text style={styles.sectionTitle}>
        Sản phẩm ({items.length} mặt hàng)
      </Text>
      {items.map((item) => (
        <View key={item.id} style={styles.orderItem}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>
            {formatVND(item.price * item.quantity)}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function DeliveryTrackingScreen() {
  const [order, setOrder] = useState<DeliveryOrder>(MOCK_ORDER);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleCallDriver = () => {
    Linking.openURL(`tel:${order.driver.phone}`);
  };

  const handleChatDriver = () => {
    router.push("/chat");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Map section */}
      <DeliveryMapView order={order} pulseAnim={pulseAnim} />

      {/* Content sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.primary]}
            tintColor={C.primary}
          />
        }
      >
        {/* Drag handle */}
        <View style={styles.sheetHandle} />

        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusIcon}>
            <Ionicons name="navigate" size={24} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Đang vận chuyển</Text>
            <Text style={styles.statusSubtitle}>
              Dự kiến giao lúc {order.estimatedTime} • còn ~
              {order.estimatedMinutes} phút
            </Text>
          </View>
        </View>

        {/* Tracking Note */}
        {order.trackingNote && (
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={18} color={C.blue} />
            <Text style={styles.noteText}>{order.trackingNote}</Text>
          </View>
        )}

        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: C.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Lấy hàng</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {order.pickupAddress}
              </Text>
            </View>
          </View>
          <View style={styles.addressDivider} />
          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: C.error }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Giao đến</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {order.deliveryAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Driver */}
        <DriverCard
          driver={order.driver}
          onCall={handleCallDriver}
          onChat={handleChatDriver}
        />

        {/* Timeline */}
        <TrackingTimeline steps={order.deliverySteps} />

        {/* Order Items */}
        <OrderItemsSection items={order.items} />

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền hàng</Text>
            <Text style={styles.totalValue}>
              {formatVND(order.totalAmount)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Phí vận chuyển</Text>
            <Text style={styles.totalValue}>
              {formatVND(order.shippingFee)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.grandTotalValue}>
              {formatVND(order.totalAmount + order.shippingFee)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.helpBtn}
            activeOpacity={0.7}
            onPress={() => router.push("/customer-support")}
          >
            <Ionicons name="headset-outline" size={18} color={C.primary} />
            <Text style={styles.helpBtnText}>Hỗ trợ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmDeliveryBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmDeliveryText}>
              Xác nhận đã nhận hàng
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Map Styles
// ============================================================================

const mapStyles = StyleSheet.create({
  container: { height: 280 },
  mapBg: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  streetH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "#fff",
  },
  streetV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: "#fff",
  },
  routePath: {
    position: "absolute",
    left: 40,
    right: 40,
    top: "55%",
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  fromDot: {
    alignItems: "center",
    zIndex: 2,
  },
  fromDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.primary,
    borderWidth: 3,
    borderColor: "#fff",
  },
  toDot: {
    alignItems: "center",
    zIndex: 2,
  },
  pointLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: C.text,
    marginTop: 2,
  },
  routeLine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginHorizontal: 8,
    position: "relative",
  },
  routeDash: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.border,
  },
  driverPin: {
    position: "absolute",
    top: -14,
    marginLeft: -18,
    alignItems: "center",
    zIndex: 5,
  },
  driverPulse: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
  },
  driverDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  etaCard: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  etaText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
  },
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  sheetContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 16,
  },

  // Status Banner
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
  },

  // Note
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.blueLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 17,
  },

  // Address
  addressSection: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: C.text,
    lineHeight: 19,
  },
  addressDivider: {
    width: 1,
    height: 20,
    backgroundColor: C.border,
    marginLeft: 4,
    marginVertical: 6,
  },

  // Driver
  driverCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: C.primaryLight,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  driverDeliveries: {
    fontSize: 12,
    color: C.textSecondary,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vehicleText: {
    fontSize: 12,
    color: C.textSecondary,
  },
  driverActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionBtn: { alignItems: "center", gap: 6 },
  actionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "500",
  },

  // Timeline
  timelineSection: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 48,
  },
  timelineLeft: {
    width: 28,
    alignItems: "center",
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotCurrent: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: "#CCFBF1",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 16,
  },
  timelineContentCurrent: {
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    padding: 10,
    marginLeft: 8,
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  timelineTime: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  timelineDesc: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },

  // Items
  itemsSection: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    color: C.textMuted,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },

  // Total
  totalSection: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    color: C.textSecondary,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: C.primary,
  },

  // Bottom actions
  bottomActions: {
    flexDirection: "row",
    gap: 12,
  },
  helpBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  helpBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.primary,
  },
  confirmDeliveryBtn: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeliveryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
