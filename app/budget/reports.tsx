/**
 * Budget Reports Screen - Modern Minimalist Design
 * Features: Animated cards, glassmorphism stats, dark mode, haptic feedback
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Report {
  id: number;
  name: string;
  type: "daily" | "weekly" | "monthly" | "quarterly";
  projectName: string;
  period: string;
  totalExpense: number;
  totalIncome: number;
  balance: number;
  status: "draft" | "completed";
  createdAt: string;
}

// Report Card Component with animations
const ReportCard = ({
  report,
  index,
  textColor,
  surfaceColor,
  borderColor,
  isDark,
  onPress,
  formatCurrency,
}: {
  report: Report;
  index: number;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  isDark: boolean;
  onPress: () => void;
  formatCurrency: (amount: number) => string;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const getTypeConfig = (type: string) => {
    const configs: Record<
      string,
      { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }
    > = {
      daily: { color: "#3b82f6", icon: "today", label: "Hàng ngày" },
      weekly: { color: "#8b5cf6", icon: "calendar", label: "Hàng tuần" },
      monthly: {
        color: "#10b981",
        icon: "calendar-outline",
        label: "Hàng tháng",
      },
      quarterly: { color: "#f59e0b", icon: "stats-chart", label: "Hàng quý" },
    };
    return configs[type] || configs.monthly;
  };

  const typeConfig = getTypeConfig(report.type);

  return (
    <Animated.View
      style={[
        styles.reportCardWrapper,
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
          styles.reportCard,
          { backgroundColor: surfaceColor, borderColor },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Header with type and status */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: typeConfig.color + "15" },
            ]}
          >
            <Ionicons
              name={typeConfig.icon}
              size={12}
              color={typeConfig.color}
            />
            <Text style={[styles.typeText, { color: typeConfig.color }]}>
              {typeConfig.label}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  report.status === "completed"
                    ? isDark
                      ? "#10b98120"
                      : "#ecfdf5"
                    : isDark
                      ? "#f59e0b20"
                      : "#fef3c7",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    report.status === "completed" ? "#10b981" : "#f59e0b",
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: report.status === "completed" ? "#10b981" : "#f59e0b",
                },
              ]}
            >
              {report.status === "completed" ? "Hoàn thành" : "Nháp"}
            </Text>
          </View>
        </View>

        {/* Report Name */}
        <Text style={[styles.reportName, { color: textColor }]}>
          {report.name}
        </Text>
        <Text style={[styles.projectName, { color: textColor + "60" }]}>
          {report.projectName}
        </Text>

        {/* Stats Row */}
        <View style={[styles.statsRow, { borderColor }]}>
          <View style={styles.statItem}>
            <Ionicons name="arrow-down-circle" size={16} color="#ef4444" />
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Chi
            </Text>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>
              {formatCurrency(report.totalExpense)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="arrow-up-circle" size={16} color="#10b981" />
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Thu
            </Text>
            <Text style={[styles.statValue, { color: "#10b981" }]}>
              {formatCurrency(report.totalIncome)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons
              name="wallet"
              size={16}
              color={report.balance >= 0 ? "#3b82f6" : "#ef4444"}
            />
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Số dư
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: report.balance >= 0 ? "#3b82f6" : "#ef4444" },
              ]}
            >
              {formatCurrency(report.balance)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={textColor + "50"}
            />
            <Text style={[styles.footerText, { color: textColor + "50" }]}>
              {report.period}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={textColor + "40"} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function BudgetReportsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock data
  const reports: Report[] = [
    {
      id: 1,
      name: "Báo cáo chi phí tháng 1/2025",
      type: "monthly",
      projectName: "Tòa nhà Sunrise Tower",
      period: "01/2025",
      totalExpense: 1500000000,
      totalIncome: 2000000000,
      balance: 500000000,
      status: "completed",
      createdAt: "2025-02-01",
    },
    {
      id: 2,
      name: "Báo cáo chi phí tuần 3/2025",
      type: "weekly",
      projectName: "Biệt thự Phú Mỹ Hưng",
      period: "Tuần 3 - T1/2025",
      totalExpense: 350000000,
      totalIncome: 400000000,
      balance: 50000000,
      status: "completed",
      createdAt: "2025-01-21",
    },
    {
      id: 3,
      name: "Báo cáo ngày 20/01/2025",
      type: "daily",
      projectName: "Chung cư The Manor",
      period: "20/01/2025",
      totalExpense: 85000000,
      totalIncome: 0,
      balance: -85000000,
      status: "draft",
      createdAt: "2025-01-20",
    },
    {
      id: 4,
      name: "Báo cáo Q4/2024",
      type: "quarterly",
      projectName: "Tất cả dự án",
      period: "Q4/2024",
      totalExpense: 8500000000,
      totalIncome: 10000000000,
      balance: 1500000000,
      status: "completed",
      createdAt: "2025-01-05",
    },
  ];

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    let formatted;
    if (absAmount >= 1000000000) {
      formatted = `${(absAmount / 1000000000).toFixed(1)} tỷ`;
    } else if (absAmount >= 1000000) {
      formatted = `${(absAmount / 1000000).toFixed(0)}M`;
    } else {
      formatted = absAmount.toLocaleString("vi-VN");
    }
    return isNegative ? `-${formatted}` : formatted;
  };

  const filteredReports = reports.filter((report) => {
    const matchSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "all" || report.type === filterType;
    return matchSearch && matchType;
  });

  const typeFilters = [
    { key: "all", label: "Tất cả", icon: "apps" as const },
    { key: "daily", label: "Ngày", icon: "today" as const },
    { key: "weekly", label: "Tuần", icon: "calendar" as const },
    { key: "monthly", label: "Tháng", icon: "calendar-outline" as const },
    { key: "quarterly", label: "Quý", icon: "stats-chart" as const },
  ];

  const totalExpense = reports.reduce((sum, r) => sum + r.totalExpense, 0);
  const totalIncome = reports.reduce((sum, r) => sum + r.totalIncome, 0);
  const netBalance = totalIncome - totalExpense;

  const handleFilterPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterType(key);
  };

  const handleReportPress = (report: Report) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to report detail
  };

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
            Báo cáo tài chính
          </Text>
          <Text style={[styles.subtitle, { color: textColor + "60" }]}>
            {reports.length} báo cáo
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#6366f1" }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={
              isDark ? ["#ef444420", "#ef444410"] : ["#fef2f2", "#fff5f5"]
            }
            style={styles.summaryCard}
          >
            <View style={styles.summaryIconWrap}>
              <Ionicons name="arrow-down-circle" size={22} color="#ef4444" />
            </View>
            <Text style={styles.summaryLabel}>Tổng chi</Text>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={
              isDark ? ["#10b98120", "#10b98110"] : ["#ecfdf5", "#f0fdf4"]
            }
            style={styles.summaryCard}
          >
            <View style={styles.summaryIconWrap}>
              <Ionicons name="arrow-up-circle" size={22} color="#10b981" />
            </View>
            <Text style={styles.summaryLabel}>Tổng thu</Text>
            <Text style={[styles.summaryValue, { color: "#10b981" }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={
              netBalance >= 0
                ? isDark
                  ? ["#3b82f620", "#3b82f610"]
                  : ["#eff6ff", "#f0f9ff"]
                : isDark
                  ? ["#ef444420", "#ef444410"]
                  : ["#fef2f2", "#fff5f5"]
            }
            style={styles.summaryCardFull}
          >
            <View style={styles.summaryIconWrap}>
              <Ionicons
                name="wallet"
                size={22}
                color={netBalance >= 0 ? "#3b82f6" : "#ef4444"}
              />
            </View>
            <View style={styles.summaryTextWrap}>
              <Text style={styles.summaryLabel}>Cân đối ròng</Text>
              <Text
                style={[
                  styles.summaryValueLarge,
                  { color: netBalance >= 0 ? "#3b82f6" : "#ef4444" },
                ]}
              >
                {formatCurrency(netBalance)}
              </Text>
            </View>
            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor: netBalance >= 0 ? "#10b98115" : "#ef444415",
                },
              ]}
            >
              <Ionicons
                name={netBalance >= 0 ? "trending-up" : "trending-down"}
                size={14}
                color={netBalance >= 0 ? "#10b981" : "#ef4444"}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: netBalance >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {netBalance >= 0 ? "+" : ""}
                {((netBalance / (totalIncome || 1)) * 100).toFixed(0)}%
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: surfaceColor, borderColor },
          ]}
        >
          <Ionicons name="search" size={20} color={textColor + "50"} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm kiếm báo cáo..."
            placeholderTextColor={textColor + "40"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={textColor + "40"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {typeFilters.map((filter) => {
            const isActive = filterType === filter.key;
            const count =
              filter.key === "all"
                ? reports.length
                : reports.filter((r) => r.type === filter.key).length;

            return (
              <TouchableOpacity
                key={filter.key}
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
                onPress={() => handleFilterPress(filter.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={filter.icon}
                  size={14}
                  color={isActive ? "#fff" : textColor + "80"}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? "#fff" : textColor },
                  ]}
                >
                  {filter.label}
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

        {/* Reports List */}
        <View style={styles.listContainer}>
          {filteredReports.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
                ]}
              >
                <Ionicons
                  name="document-outline"
                  size={40}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
              </View>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Không tìm thấy báo cáo
              </Text>
            </View>
          ) : (
            filteredReports.map((report, index) => (
              <ReportCard
                key={report.id}
                report={report}
                index={index}
                textColor={textColor}
                surfaceColor={surfaceColor}
                borderColor={borderColor}
                isDark={isDark}
                onPress={() => handleReportPress(report)}
                formatCurrency={formatCurrency}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  summaryCardFull: {
    width: SCREEN_WIDTH - 40,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
  },
  summaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  summaryValueLarge: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  filterScroll: {
    paddingBottom: 16,
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
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContainer: {
    gap: 12,
  },
  reportCardWrapper: {},
  reportCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  reportName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  projectName: {
    fontSize: 13,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e5e7eb",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
});
