/**
 * Seller Analytics - Shopee/TikTok Style
 * Phân tích dữ liệu nâng cao
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
interface VisitorData {
  total: number;
  unique: number;
  returning: number;
  bounceRate: number;
}

interface ConversionData {
  views: number;
  addToCart: number;
  checkout: number;
  purchased: number;
  rate: number;
}

interface TrafficSource {
  name: string;
  visitors: number;
  percentage: number;
  icon: string;
  color: string;
}

interface TopSearchTerm {
  term: string;
  count: number;
  conversionRate: number;
}

interface DailyMetric {
  date: string;
  visitors: number;
  orders: number;
  revenue: number;
}

type TimePeriod = "7d" | "30d" | "90d";

export default function SellerAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<TimePeriod>("7d");
  const [visitors, setVisitors] = useState<VisitorData>({
    total: 0,
    unique: 0,
    returning: 0,
    bounceRate: 0,
  });
  const [conversion, setConversion] = useState<ConversionData>({
    views: 0,
    addToCart: 0,
    checkout: 0,
    purchased: 0,
    rate: 0,
  });
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [topSearchTerms, setTopSearchTerms] = useState<TopSearchTerm[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      // In production: const response = await apiFetch('/seller/analytics', { params: { period } });

      // Mock data
      setVisitors({
        total: 12580,
        unique: 8432,
        returning: 4148,
        bounceRate: 35.2,
      });

      setConversion({
        views: 12580,
        addToCart: 1856,
        checkout: 892,
        purchased: 645,
        rate: 5.13,
      });

      setTrafficSources([
        {
          name: "Tìm kiếm trong app",
          visitors: 5234,
          percentage: 41.6,
          icon: "search",
          color: "#3B82F6",
        },
        {
          name: "Link trực tiếp",
          visitors: 3156,
          percentage: 25.1,
          icon: "link",
          color: "#10B981",
        },
        {
          name: "Facebook",
          visitors: 2345,
          percentage: 18.6,
          icon: "logo-facebook",
          color: "#1877F2",
        },
        {
          name: "Quảng cáo",
          visitors: 1245,
          percentage: 9.9,
          icon: "megaphone",
          color: "#F59E0B",
        },
        {
          name: "Khác",
          visitors: 600,
          percentage: 4.8,
          icon: "ellipsis-horizontal",
          color: "#6B7280",
        },
      ]);

      setTopSearchTerms([
        { term: "thiết kế biệt thự", count: 456, conversionRate: 8.2 },
        { term: "nội thất phòng khách", count: 312, conversionRate: 6.5 },
        { term: "bản vẽ nhà phố", count: 289, conversionRate: 7.1 },
        { term: "thiết kế sân vườn", count: 234, conversionRate: 5.4 },
        { term: "tư vấn phong thủy", count: 198, conversionRate: 9.8 },
      ]);

      setDailyMetrics([
        { date: "T2", visitors: 1580, orders: 85, revenue: 12500000 },
        { date: "T3", visitors: 1890, orders: 102, revenue: 15800000 },
        { date: "T4", visitors: 1720, orders: 91, revenue: 13200000 },
        { date: "T5", visitors: 2100, orders: 118, revenue: 18500000 },
        { date: "T6", visitors: 2450, orders: 142, revenue: 22800000 },
        { date: "T7", visitors: 1890, orders: 89, revenue: 14200000 },
        { date: "CN", visitors: 950, orders: 18, revenue: 2800000 },
      ]);
    } catch (error) {
      console.error("[SellerAnalytics] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "tr";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  // Get max value for chart
  const maxVisitors = Math.max(...dailyMetrics.map((d) => d.visitors));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
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
            colors={["#FF6B35"]}
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(["7d", "30d", "90d"] as TimePeriod[]).map((p) => (
            <Pressable
              key={p}
              style={[styles.periodBtn, period === p && styles.activePeriodBtn]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  period === p && styles.activePeriodBtnText,
                ]}
              >
                {p === "7d" ? "7 ngày" : p === "30d" ? "30 ngày" : "90 ngày"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Visitor Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lượt truy cập</Text>
          <View style={styles.visitorGrid}>
            <View style={styles.visitorCard}>
              <View
                style={[styles.visitorIcon, { backgroundColor: "#DBEAFE" }]}
              >
                <Ionicons name="eye-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.visitorNumber}>
                {formatNumber(visitors.total)}
              </Text>
              <Text style={styles.visitorLabel}>Tổng lượt xem</Text>
            </View>
            <View style={styles.visitorCard}>
              <View
                style={[styles.visitorIcon, { backgroundColor: "#D1FAE5" }]}
              >
                <Ionicons name="person-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.visitorNumber}>
                {formatNumber(visitors.unique)}
              </Text>
              <Text style={styles.visitorLabel}>Khách mới</Text>
            </View>
            <View style={styles.visitorCard}>
              <View
                style={[styles.visitorIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Ionicons name="refresh-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.visitorNumber}>
                {formatNumber(visitors.returning)}
              </Text>
              <Text style={styles.visitorLabel}>Khách quay lại</Text>
            </View>
            <View style={styles.visitorCard}>
              <View
                style={[styles.visitorIcon, { backgroundColor: "#FEE2E2" }]}
              >
                <Ionicons name="exit-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.visitorNumber}>{visitors.bounceRate}%</Text>
              <Text style={styles.visitorLabel}>Tỷ lệ thoát</Text>
            </View>
          </View>
        </View>

        {/* Conversion Funnel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phễu chuyển đổi</Text>
          <View style={styles.funnelContainer}>
            {[
              { label: "Lượt xem", value: conversion.views, color: "#3B82F6" },
              {
                label: "Thêm giỏ hàng",
                value: conversion.addToCart,
                color: "#8B5CF6",
              },
              {
                label: "Thanh toán",
                value: conversion.checkout,
                color: "#F59E0B",
              },
              {
                label: "Đã mua",
                value: conversion.purchased,
                color: "#10B981",
              },
            ].map((step, index, arr) => {
              const widthPercentage = (step.value / conversion.views) * 100;
              const nextValue = arr[index + 1]?.value;
              const dropRate = nextValue
                ? (((step.value - nextValue) / step.value) * 100).toFixed(1)
                : null;

              return (
                <View key={step.label} style={styles.funnelStep}>
                  <View style={styles.funnelBarContainer}>
                    <View
                      style={[
                        styles.funnelBar,
                        {
                          width: `${widthPercentage}%`,
                          backgroundColor: step.color,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.funnelInfo}>
                    <Text style={styles.funnelLabel}>{step.label}</Text>
                    <Text style={styles.funnelValue}>
                      {formatNumber(step.value)}
                    </Text>
                    {dropRate && (
                      <Text style={styles.dropRate}>-{dropRate}%</Text>
                    )}
                  </View>
                </View>
              );
            })}

            <View style={styles.conversionRateBox}>
              <Text style={styles.conversionRateLabel}>Tỷ lệ chuyển đổi</Text>
              <Text style={styles.conversionRateValue}>{conversion.rate}%</Text>
            </View>
          </View>
        </View>

        {/* Daily Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biểu đồ lượt truy cập</Text>
          <View style={styles.chartContainer}>
            {dailyMetrics.map((day, index) => (
              <View key={day.date} style={styles.chartColumn}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height:
                        maxVisitors > 0
                          ? (day.visitors / maxVisitors) * 100
                          : 0,
                      backgroundColor: index === 4 ? "#FF6B35" : "#FFB088",
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{day.date}</Text>
                <Text style={styles.chartValue}>
                  {formatNumber(day.visitors)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Traffic Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nguồn truy cập</Text>
          {trafficSources.map((source) => (
            <View key={source.name} style={styles.sourceRow}>
              <View
                style={[
                  styles.sourceIcon,
                  { backgroundColor: `${source.color}15` },
                ]}
              >
                <Ionicons
                  name={source.icon as any}
                  size={20}
                  color={source.color}
                />
              </View>
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <View style={styles.sourceBar}>
                  <View
                    style={[
                      styles.sourceBarFill,
                      {
                        width: `${source.percentage}%`,
                        backgroundColor: source.color,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.sourceStats}>
                <Text style={styles.sourceVisitors}>
                  {formatNumber(source.visitors)}
                </Text>
                <Text style={styles.sourcePercentage}>
                  {source.percentage}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top Search Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Từ khóa tìm kiếm phổ biến</Text>
          {topSearchTerms.map((term, index) => (
            <View key={term.term} style={styles.searchTermRow}>
              <Text style={styles.searchRank}>{index + 1}</Text>
              <View style={styles.searchTermInfo}>
                <Text style={styles.searchTerm}>{term.term}</Text>
                <View style={styles.searchStats}>
                  <Text style={styles.searchCount}>{term.count} lượt</Text>
                  <Text style={styles.searchConversion}>
                    Chuyển đổi: {term.conversionRate}%
                  </Text>
                </View>
              </View>
              <Ionicons name="trending-up" size={18} color="#10B981" />
            </View>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <LinearGradient
            colors={["#FFF5F2", "#FFFFFF"]}
            style={styles.tipsGradient}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={24} color="#FF6B35" />
              <Text style={styles.tipsTitle}>Gợi ý cải thiện</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.tipText}>
                Tối ưu tiêu đề sản phẩm với từ khóa "thiết kế biệt thự" để tăng
                chuyển đổi
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.tipText}>
                Đăng sản phẩm mới vào thứ 5-6 để có lượng truy cập cao nhất
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.tipText}>
                Giảm tỷ lệ thoát bằng cách thêm video giới thiệu sản phẩm
              </Text>
            </View>
          </LinearGradient>
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
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activePeriodBtn: {
    backgroundColor: "#FF6B35",
  },
  periodBtnText: {
    fontSize: 14,
    color: "#6B7280",
  },
  activePeriodBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  visitorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  visitorCard: {
    width: (width - 56) / 2,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  visitorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  visitorNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  visitorLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  funnelContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  funnelStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  funnelBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  funnelBar: {
    height: "100%",
    borderRadius: 4,
  },
  funnelInfo: {
    width: 100,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  funnelLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  funnelValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  dropRate: {
    fontSize: 10,
    color: "#EF4444",
  },
  conversionRateBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversionRateLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  conversionRateValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    paddingTop: 20,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
  },
  chartBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 8,
  },
  chartValue: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sourceInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  sourceName: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 6,
  },
  sourceBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
  },
  sourceBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  sourceStats: {
    alignItems: "flex-end",
  },
  sourceVisitors: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  sourcePercentage: {
    fontSize: 12,
    color: "#6B7280",
  },
  searchTermRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF5F2",
    textAlign: "center",
    lineHeight: 28,
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  searchTermInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  searchTerm: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  searchStats: {
    flexDirection: "row",
    marginTop: 4,
  },
  searchCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  searchConversion: {
    fontSize: 12,
    color: "#10B981",
    marginLeft: 12,
  },
  tipsSection: {
    margin: 16,
    marginTop: 4,
  },
  tipsGradient: {
    borderRadius: 12,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    marginLeft: 8,
    lineHeight: 20,
  },
});
