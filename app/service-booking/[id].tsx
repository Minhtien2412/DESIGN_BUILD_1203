/**
 * Service Order Detail Screen
 * Shows order info with Work Process timeline + Cost breakdown tabs
 * Matches Vua Thợ-style order detail UI
 */

import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// WORK PROCESS STEPS
// ============================================================================
const WORK_STEPS = [
  { id: 1, label: "Bắt đầu đi", icon: "walk" as const },
  { id: 2, label: "Đã đến nhà", icon: "home" as const },
  { id: 3, label: "Đang thoả thuận", icon: "handshake" as const },
  { id: 4, label: "Đang làm việc", icon: "wrench" as const },
  { id: 5, label: "Thanh toán", icon: "cash" as const },
];

export default function ServiceOrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    price: string;
    category: string;
    categoryLabel: string;
    avatar: string;
  }>();

  const [activeTab, setActiveTab] = useState<"process" | "cost">("cost");
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started yet

  const workerName = params.name || "Thợ";
  const workerAvatar = params.avatar || "https://i.pravatar.cc/150?img=11";
  const price = parseInt(params.price || "150000", 10);
  const categoryLabel = params.categoryLabel || "Dịch vụ";
  const orderCode = Math.floor(10000 + Math.random() * 90000).toString();

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  const handleCall = useCallback(() => {
    Linking.openURL("tel:0901234567");
  }, []);

  const handleChat = useCallback(() => {
    router.push(`/messages/${params.id}` as any);
  }, [params.id]);

  const handleCancel = useCallback(() => {
    Alert.alert("Huỷ đơn", "Bạn có chắc muốn huỷ đơn dịch vụ này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Huỷ đơn",
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);
  }, []);

  const handleSupport = useCallback(() => {
    router.push("/customer-support" as any);
  }, []);

  const renderProcessTab = () => (
    <View style={s.tabContent}>
      {WORK_STEPS.map((step, index) => (
        <View key={step.id} style={s.stepRow}>
          <View style={s.stepIndicator}>
            <View
              style={[s.stepCircle, index <= currentStep && s.stepCircleActive]}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <View
                  style={[s.stepDot, index <= currentStep && s.stepDotActive]}
                />
              )}
            </View>
            {index < WORK_STEPS.length - 1 && (
              <View
                style={[s.stepLine, index < currentStep && s.stepLineActive]}
              />
            )}
          </View>
          <Text
            style={[s.stepLabel, index <= currentStep && s.stepLabelActive]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderCostTab = () => (
    <View style={s.tabContent}>
      <View style={s.costRow}>
        <Text style={s.costLabel}>Giá chốt</Text>
        <Text style={s.costValue}>{formatPrice(price)}</Text>
      </View>
      <View style={s.costDivider} />
      <View style={s.costRow}>
        <Text style={s.costTotalLabel}>Tổng cộng</Text>
        <Text style={s.costTotalValue}>{formatPrice(price)}</Text>
      </View>
      <View style={s.costDetailRow}>
        <Text style={s.costLabel}>Chi tiết</Text>
        <TouchableOpacity>
          <Text style={s.costDetailLink}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Brand Banner */}
        <View style={s.brandBanner}>
          <View style={s.brandContent}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={s.brandLogo}
              resizeMode="contain"
            />
            <Text style={s.brandSlogan}>THIẾT KẾ & XÂY DỰNG</Text>
          </View>
        </View>

        {/* Order Code */}
        <View style={s.orderCodeRow}>
          <Text style={s.orderCodeLabel}>Mã dịch vụ: </Text>
          <Text style={s.orderCode}>{orderCode}</Text>
        </View>

        {/* Worker Card */}
        <View style={s.workerCard}>
          <Image source={{ uri: workerAvatar }} style={s.workerAvatar} />
          <View style={s.workerInfo}>
            <Text style={s.workerName}>{workerName}</Text>
          </View>
          <TouchableOpacity style={s.actionButton} onPress={handleChat}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#FFC107" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionButton, s.callButton]}
            onPress={handleCall}
          >
            <Ionicons name="call" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          <TouchableOpacity
            style={[s.tab, activeTab === "process" && s.tabActive]}
            onPress={() => setActiveTab("process")}
          >
            <Text
              style={[s.tabText, activeTab === "process" && s.tabTextActive]}
            >
              Quy trình làm việc
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === "cost" && s.tabActive]}
            onPress={() => setActiveTab("cost")}
          >
            <Text style={[s.tabText, activeTab === "cost" && s.tabTextActive]}>
              Chi phí hạng mục
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={s.tabContentCard}>
          {activeTab === "process" ? renderProcessTab() : renderCostTab()}
        </View>

        {/* Service Info Card */}
        <View style={s.serviceInfoCard}>
          <Text style={s.serviceTitle}>{categoryLabel}</Text>
          <Text style={s.serviceDescription}>
            {categoryLabel} - Dịch vụ tại nhà
          </Text>

          <View style={s.serviceDetailRow}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={s.serviceDetailText}>
              {new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date().toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity>
              <Text style={s.editLink}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          <View style={s.serviceDetailRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={s.serviceDetailText} numberOfLines={2}>
              E7 Đường Số 3 Phường Tân Sơn Nhì, Quận Tân Phú, Thành Phố Hồ Chí
              Minh
            </Text>
          </View>
        </View>

        {/* Cancel Order */}
        <TouchableOpacity style={s.cancelButton} onPress={handleCancel}>
          <Text style={s.cancelButtonText}>Huỷ đơn</Text>
        </TouchableOpacity>

        {/* Contact Support */}
        <TouchableOpacity style={s.supportButton} onPress={handleSupport}>
          <View style={s.supportBadge}>
            <Text style={s.supportBadgeText}>1</Text>
          </View>
          <Text style={s.supportText}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFC107",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Brand Banner
  brandBanner: {
    backgroundColor: "#FFC107",
    paddingBottom: 40,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  brandContent: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 24,
    borderRadius: 16,
  },
  brandLogo: {
    width: 180,
    height: 60,
  },
  brandSlogan: {
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
    marginTop: 4,
    letterSpacing: 2,
  },

  // Order Code
  orderCodeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 12,
  },
  orderCodeLabel: {
    fontSize: 13,
    color: "#999",
  },
  orderCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  // Worker Card
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0E0E0",
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: "#FFC107",
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#333",
  },
  tabText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#333",
    fontWeight: "700",
  },

  // Tab Content
  tabContentCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabContent: {},

  // Process Steps
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 48,
  },
  stepIndicator: {
    alignItems: "center",
    width: 24,
    marginRight: 12,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepCircleActive: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  stepDotActive: {
    backgroundColor: "#fff",
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: "#E0E0E0",
    marginVertical: 2,
  },
  stepLineActive: {
    backgroundColor: "#4CAF50",
  },
  stepLabel: {
    fontSize: 15,
    color: "#999",
    paddingTop: 2,
  },
  stepLabelActive: {
    color: "#333",
    fontWeight: "600",
  },

  // Cost Tab
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  costLabel: {
    fontSize: 15,
    color: "#666",
  },
  costValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
  costDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  costTotalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  costTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
  },
  costDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  costDetailLink: {
    fontSize: 14,
    color: "#FFC107",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Service Info
  serviceInfoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  serviceDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  serviceDetailText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  editLink: {
    fontSize: 13,
    color: "#FFC107",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Cancel
  cancelButton: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#999",
    textDecorationLine: "underline",
  },

  // Support
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  supportBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F44336",
    alignItems: "center",
    justifyContent: "center",
  },
  supportBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  supportText: {
    fontSize: 14,
    color: "#666",
  },
});
