/**
 * Payment History Screen - Modern Minimalist Design
 * Features: Animated cards, statistics summary, filter chips, dark mode
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PaymentHistory {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  methodIcon: string;
  methodColor: string;
  status: "success" | "pending" | "failed";
  date: string;
  items: number;
}

const PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: "1",
    orderId: "#DH123456",
    amount: 2280000,
    method: "MoMo",
    methodIcon: "wallet",
    methodColor: "#A50064",
    status: "success",
    date: "2025-02-08 14:30",
    items: 3,
  },
  {
    id: "2",
    orderId: "#DH123455",
    amount: 1580000,
    method: "ZaloPay",
    methodIcon: "card",
    methodColor: "#008FE5",
    status: "success",
    date: "2025-02-05 10:15",
    items: 2,
  },
  {
    id: "3",
    orderId: "#DH123454",
    amount: 890000,
    method: "COD",
    methodIcon: "cash",
    methodColor: "#10b981",
    status: "pending",
    date: "2025-02-03 16:45",
    items: 1,
  },
  {
    id: "4",
    orderId: "#DH123453",
    amount: 3200000,
    method: "VNPAY",
    methodIcon: "card",
    methodColor: "#0066B2",
    status: "failed",
    date: "2025-02-01 09:20",
    items: 4,
  },
  {
    id: "5",
    orderId: "#DH123452",
    amount: 1750000,
    method: "Bank Transfer",
    methodIcon: "business",
    methodColor: "#6366f1",
    status: "success",
    date: "2025-01-28 11:00",
    items: 2,
  },
];

type FilterType = "all" | "success" | "pending" | "failed";

const FILTERS: {
  id: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "all", label: "Tất cả", icon: "layers-outline" },
  { id: "success", label: "Thành công", icon: "checkmark-circle-outline" },
  { id: "pending", label: "Đang xử lý", icon: "time-outline" },
  { id: "failed", label: "Thất bại", icon: "close-circle-outline" },
];

const STATUS_CONFIG = {
  success: {
    label: "Thành công",
    color: "#10b981",
    bg: "#10b98115",
    icon: "checkmark-circle",
  },
  pending: {
    label: "Đang xử lý",
    color: "#f59e0b",
    bg: "#f59e0b15",
    icon: "time",
  },
  failed: {
    label: "Thất bại",
    color: "#ef4444",
    bg: "#ef444415",
    icon: "close-circle",
  },
};

// Payment Card Component
const PaymentCard = ({
  item,
  index,
  textColor,
  surfaceColor,
  borderColor,
  onPress,
}: {
  item: PaymentHistory;
  index: number;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const statusConfig = STATUS_CONFIG[item.status];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: scaleAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.paymentCard,
          { backgroundColor: surfaceColor, borderColor },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.methodIcon,
                { backgroundColor: item.methodColor + "15" },
              ]}
            >
              <Ionicons
                name={item.methodIcon as any}
                size={20}
                color={item.methodColor}
              />
            </View>
            <View>
              <Text style={[styles.orderId, { color: textColor }]}>
                {item.orderId}
              </Text>
              <Text style={[styles.paymentDate, { color: textColor + "60" }]}>
                {new Date(item.date).toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
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

        {/* Card Body */}
        <View style={[styles.cardBody, { borderColor }]}>
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={16} color={textColor + "60"} />
            <Text style={[styles.infoLabel, { color: textColor + "60" }]}>
              Phương thức
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {item.method}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={16} color={textColor + "60"} />
            <Text style={[styles.infoLabel, { color: textColor + "60" }]}>
              Số lượng
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {item.items} sản phẩm
            </Text>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={[styles.totalLabel, { color: textColor + "60" }]}>
            Tổng thanh toán
          </Text>
          <Text style={styles.totalAmount}>
            {item.amount.toLocaleString("vi-VN")}₫
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [filter, setFilter] = useState<FilterType>("all");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredHistory =
    filter === "all"
      ? PAYMENT_HISTORY
      : PAYMENT_HISTORY.filter((p) => p.status === filter);

  // Calculate statistics
  const stats = {
    total: PAYMENT_HISTORY.reduce((sum, p) => sum + p.amount, 0),
    success: PAYMENT_HISTORY.filter((p) => p.status === "success").reduce(
      (sum, p) => sum + p.amount,
      0
    ),
    pending: PAYMENT_HISTORY.filter((p) => p.status === "pending").reduce(
      (sum, p) => sum + p.amount,
      0
    ),
    transactions: PAYMENT_HISTORY.length,
  };

  const handleItemPress = (item: PaymentHistory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to order detail
    router.push(`/orders/${item.orderId.replace("#", "")}` as any);
  };

  const renderPaymentItem = ({
    item,
    index,
  }: {
    item: PaymentHistory;
    index: number;
  }) => (
    <PaymentCard
      item={item}
      index={index}
      textColor={textColor}
      surfaceColor={surfaceColor}
      borderColor={borderColor}
      onPress={() => handleItemPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconWrap,
          { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
        ]}
      >
        <Ionicons
          name="receipt-outline"
          size={48}
          color={isDark ? "#6b7280" : "#9ca3af"}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Chưa có giao dịch
      </Text>
      <Text style={[styles.emptyDesc, { color: textColor + "80" }]}>
        Lịch sử thanh toán của bạn sẽ hiển thị tại đây
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push("/(tabs)")}
        activeOpacity={0.8}
      >
        <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: surfaceColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: textColor }]}>
            Lịch sử thanh toán
          </Text>
          <Text style={[styles.subtitle, { color: textColor + "60" }]}>
            {stats.transactions} giao dịch
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: surfaceColor }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="download-outline" size={20} color={textColor} />
        </TouchableOpacity>
      </Animated.View>

      {/* Statistics Cards */}
      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <View style={[styles.statCard, { backgroundColor: "#6366f115" }]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="wallet" size={20} color="#6366f1" />
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>
              {(stats.total / 1000000).toFixed(1)}M
            </Text>
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Tổng chi tiêu
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#10b98115" }]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>
              {(stats.success / 1000000).toFixed(1)}M
            </Text>
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Thành công
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#f59e0b15" }]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="time" size={20} color="#f59e0b" />
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>
              {(stats.pending / 1000000).toFixed(1)}M
            </Text>
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Đang xử lý
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Filter Chips */}
      <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filterItem) => {
            const count =
              filterItem.id === "all"
                ? PAYMENT_HISTORY.length
                : PAYMENT_HISTORY.filter((p) => p.status === filterItem.id)
                    .length;
            const isActive = filter === filterItem.id;

            return (
              <TouchableOpacity
                key={filterItem.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? "#6366f1"
                        : "#1a1a1a"
                      : surfaceColor,
                    borderColor: isActive ? "transparent" : borderColor,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilter(filterItem.id);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={filterItem.icon}
                  size={14}
                  color={isActive ? "#fff" : textColor + "80"}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? "#fff" : textColor },
                  ]}
                >
                  {filterItem.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      {
                        backgroundColor: isActive
                          ? "rgba(255,255,255,0.2)"
                          : borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        { color: isActive ? "#fff" : textColor + "80" },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Payment List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredHistory.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    marginBottom: 8,
  },
  statsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    alignItems: "flex-start",
  },
  statIconWrap: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyListContent: {
    flex: 1,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  paymentCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orderId: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  totalLabel: {
    fontSize: 13,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6366f1",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  shopButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
