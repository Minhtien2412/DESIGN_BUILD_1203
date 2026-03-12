/**
 * Seller Revenue Analytics - Shopee/TikTok Style
 * Thống kê doanh thu của người bán
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Types
interface RevenueStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  lastMonth: number;
  total: number;
}

interface OrderStats {
  pending: number;
  completed: number;
  cancelled: number;
  total: number;
}

interface TopProduct {
  id: number;
  name: string;
  image: string;
  revenue: number;
  soldCount: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

type TimePeriod = "today" | "week" | "month" | "year";

export default function SellerRevenueScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<TimePeriod>("week");
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    total: 0,
  });
  const [orderStats, setOrderStats] = useState<OrderStats>({
    pending: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    try {
      // In production, call real API
      // const response = await apiFetch('/seller/revenue', { params: { period } });

      // Mock data for demo
      setRevenueStats({
        today: 2500000,
        yesterday: 1800000,
        thisWeek: 15600000,
        thisMonth: 68500000,
        lastMonth: 52300000,
        total: 245000000,
      });

      setOrderStats({
        pending: 5,
        completed: 128,
        cancelled: 3,
        total: 136,
      });

      setTopProducts([
        {
          id: 1,
          name: "Thiết kế biệt thự hiện đại",
          image:
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200",
          revenue: 45000000,
          soldCount: 15,
        },
        {
          id: 2,
          name: "Thiết kế nội thất phòng khách",
          image:
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200",
          revenue: 32000000,
          soldCount: 28,
        },
        {
          id: 3,
          name: "Bản vẽ xây dựng nhà phố",
          image:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200",
          revenue: 28500000,
          soldCount: 12,
        },
        {
          id: 4,
          name: "Thiết kế cảnh quan sân vườn",
          image:
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200",
          revenue: 18000000,
          soldCount: 9,
        },
        {
          id: 5,
          name: "Tư vấn phong thủy",
          image:
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200",
          revenue: 12000000,
          soldCount: 24,
        },
      ]);

      setDailyRevenue([
        { date: "T2", revenue: 2100000, orders: 4 },
        { date: "T3", revenue: 3500000, orders: 6 },
        { date: "T4", revenue: 1800000, orders: 3 },
        { date: "T5", revenue: 4200000, orders: 8 },
        { date: "T6", revenue: 2800000, orders: 5 },
        { date: "T7", revenue: 1200000, orders: 2 },
        { date: "CN", revenue: 0, orders: 0 },
      ]);
    } catch (error) {
      console.error("[SellerRevenue] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRevenueData();
  };

  // Format currency
  const formatCurrency = (amount: number, short = false) => {
    if (short && amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + "tr";
    }
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Get max revenue for chart scaling
  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#14B8A6"]}
          />
        }
      >
        {/* Main Revenue Card */}
        <LinearGradient
          colors={["#14B8A6", "#FF8C5A", "#FFB088"]}
          style={styles.mainCard}
        >
          <Text style={styles.mainLabel}>Tổng doanh thu</Text>
          <Text style={styles.mainAmount}>
            {formatCurrency(revenueStats.total)}
          </Text>

          <View style={styles.periodButtons}>
            {(["today", "week", "month", "year"] as TimePeriod[]).map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.periodBtn,
                  period === p && styles.activePeriodBtn,
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    period === p && styles.activePeriodBtnText,
                  ]}
                >
                  {p === "today"
                    ? "Hôm nay"
                    : p === "week"
                      ? "Tuần"
                      : p === "month"
                        ? "Tháng"
                        : "Năm"}
                </Text>
              </Pressable>
            ))}
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <View style={styles.quickStatHeader}>
              <Ionicons name="today-outline" size={20} color="#14B8A6" />
              <Text style={styles.quickStatLabel}>Hôm nay</Text>
            </View>
            <Text style={styles.quickStatAmount}>
              {formatCurrency(revenueStats.today)}
            </Text>
            <View style={styles.changeRow}>
              {Number(
                getPercentageChange(revenueStats.today, revenueStats.yesterday),
              ) >= 0 ? (
                <Ionicons name="trending-up" size={14} color="#10B981" />
              ) : (
                <Ionicons name="trending-down" size={14} color="#EF4444" />
              )}
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      Number(
                        getPercentageChange(
                          revenueStats.today,
                          revenueStats.yesterday,
                        ),
                      ) >= 0
                        ? "#10B981"
                        : "#EF4444",
                  },
                ]}
              >
                {getPercentageChange(
                  revenueStats.today,
                  revenueStats.yesterday,
                )}
                %
              </Text>
            </View>
          </View>

          <View style={styles.quickStatCard}>
            <View style={styles.quickStatHeader}>
              <Ionicons name="calendar-outline" size={20} color="#0D9488" />
              <Text style={styles.quickStatLabel}>Tháng này</Text>
            </View>
            <Text style={styles.quickStatAmount}>
              {formatCurrency(revenueStats.thisMonth, true)}
            </Text>
            <View style={styles.changeRow}>
              {Number(
                getPercentageChange(
                  revenueStats.thisMonth,
                  revenueStats.lastMonth,
                ),
              ) >= 0 ? (
                <Ionicons name="trending-up" size={14} color="#10B981" />
              ) : (
                <Ionicons name="trending-down" size={14} color="#EF4444" />
              )}
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      Number(
                        getPercentageChange(
                          revenueStats.thisMonth,
                          revenueStats.lastMonth,
                        ),
                      ) >= 0
                        ? "#10B981"
                        : "#EF4444",
                  },
                ]}
              >
                {getPercentageChange(
                  revenueStats.thisMonth,
                  revenueStats.lastMonth,
                )}
                %
              </Text>
            </View>
          </View>
        </View>

        {/* Order Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê đơn hàng</Text>
          <View style={styles.orderStatsRow}>
            <View style={styles.orderStatCard}>
              <View
                style={[styles.orderStatIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Ionicons name="time-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.orderStatNumber}>{orderStats.pending}</Text>
              <Text style={styles.orderStatLabel}>Chờ xử lý</Text>
            </View>
            <View style={styles.orderStatCard}>
              <View
                style={[styles.orderStatIcon, { backgroundColor: "#D1FAE5" }]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#10B981"
                />
              </View>
              <Text style={styles.orderStatNumber}>{orderStats.completed}</Text>
              <Text style={styles.orderStatLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.orderStatCard}>
              <View
                style={[styles.orderStatIcon, { backgroundColor: "#FEE2E2" }]}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color="#EF4444"
                />
              </View>
              <Text style={styles.orderStatNumber}>{orderStats.cancelled}</Text>
              <Text style={styles.orderStatLabel}>Đã hủy</Text>
            </View>
            <View style={styles.orderStatCard}>
              <View
                style={[styles.orderStatIcon, { backgroundColor: "#CCFBF1" }]}
              >
                <Ionicons name="receipt-outline" size={24} color="#0D9488" />
              </View>
              <Text style={styles.orderStatNumber}>{orderStats.total}</Text>
              <Text style={styles.orderStatLabel}>Tổng đơn</Text>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doanh thu theo ngày</Text>
          <View style={styles.chartContainer}>
            {dailyRevenue.map((day, index) => (
              <View key={day.date} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height:
                        maxRevenue > 0 ? (day.revenue / maxRevenue) * 120 : 0,
                      backgroundColor: index === 3 ? "#14B8A6" : "#FFB088",
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{day.date}</Text>
                <Text style={styles.chartValue}>
                  {formatCurrency(day.revenue, true)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
            <Pressable>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </Pressable>
          </View>

          {topProducts.map((product, index) => (
            <View key={product.id} style={styles.productRow}>
              <Text style={styles.productRank}>{index + 1}</Text>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productStats}>
                  Đã bán: {product.soldCount} |{" "}
                  {formatCurrency(product.revenue, true)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          ))}
        </View>

        {/* Withdraw Button */}
        <View style={styles.section}>
          <Pressable style={styles.withdrawButton}>
            <LinearGradient
              colors={["#14B8A6", "#FF8C5A"]}
              style={styles.withdrawGradient}
            >
              <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
              <Text style={styles.withdrawText}>Rút tiền về tài khoản</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>
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
  mainCard: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  mainLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  mainAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  periodButtons: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 8,
    padding: 4,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activePeriodBtn: {
    backgroundColor: "#FFFFFF",
  },
  periodBtnText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  activePeriodBtnText: {
    color: "#14B8A6",
    fontWeight: "600",
  },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  quickStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 6,
  },
  quickStatAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: "#14B8A6",
  },
  orderStatsRow: {
    flexDirection: "row",
    gap: 8,
  },
  orderStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  orderStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  orderStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  chartContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  chartValue: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  productRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF5F2",
    textAlign: "center",
    lineHeight: 28,
    fontSize: 14,
    fontWeight: "600",
    color: "#14B8A6",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  productStats: {
    fontSize: 12,
    color: "#6B7280",
  },
  withdrawButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  withdrawGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  withdrawText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
