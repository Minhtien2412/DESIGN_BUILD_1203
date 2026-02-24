/**
 * Project Charts Screen - Biểu đồ dự án
 * Hiển thị thống kê và biểu đồ trực quan cho dự án
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

// Mock data cho biểu đồ
const projectStats = {
  totalProjects: 15,
  completed: 8,
  inProgress: 5,
  pending: 2,
  budget: {
    total: 5200000000,
    spent: 3800000000,
    remaining: 1400000000,
  },
  timeline: {
    onTime: 10,
    delayed: 3,
    ahead: 2,
  },
};

const monthlyData = [
  { month: "T1", value: 85 },
  { month: "T2", value: 92 },
  { month: "T3", value: 78 },
  { month: "T4", value: 88 },
  { month: "T5", value: 95 },
  { month: "T6", value: 82 },
];

const categoryData = [
  { name: "Nhà ở", count: 8, color: COLORS.primary },
  { name: "Biệt thự", count: 4, color: COLORS.secondary },
  { name: "Chung cư", count: 2, color: COLORS.accent },
  { name: "Khác", count: 1, color: COLORS.purple },
];

const recentActivities = [
  {
    id: "1",
    project: "Nhà phố Q7",
    action: "Hoàn thành giai đoạn móng",
    date: "08/01/2026",
    status: "completed",
  },
  {
    id: "2",
    project: "Biệt thự Thảo Điền",
    action: "Thanh toán đợt 3",
    date: "07/01/2026",
    status: "payment",
  },
  {
    id: "3",
    project: "Căn hộ Sala",
    action: "Bắt đầu thi công điện",
    date: "06/01/2026",
    status: "progress",
  },
  {
    id: "4",
    project: "Nhà xưởng Bình Dương",
    action: "Nghiệm thu hoàn công",
    date: "05/01/2026",
    status: "inspection",
  },
];

export default function ProjectChartsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(1) + " tỷ";
    }
    return (price / 1000000).toFixed(0) + " triệu";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: "checkmark-circle", color: COLORS.success };
      case "payment":
        return { icon: "cash", color: COLORS.accent };
      case "progress":
        return { icon: "construct", color: COLORS.secondary };
      case "inspection":
        return { icon: "clipboard-outline", color: COLORS.purple };
      default:
        return { icon: "ellipse", color: COLORS.textLight };
    }
  };

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: "grid-outline" },
    { id: "budget", label: "Ngân sách", icon: "cash-outline" },
    { id: "timeline", label: "Tiến độ", icon: "time-outline" },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Biểu đồ dự án",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: "#fff",
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBg }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.id ? COLORS.primary : COLORS.textLight}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="folder-open" size={28} color="#fff" />
            <Text style={styles.statNumber}>{projectStats.totalProjects}</Text>
            <Text style={styles.statLabel}>Tổng dự án</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.success }]}>
            <Ionicons name="checkmark-circle" size={28} color="#fff" />
            <Text style={styles.statNumber}>{projectStats.completed}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: COLORS.secondary }]}
          >
            <Ionicons name="construct" size={28} color="#fff" />
            <Text style={styles.statNumber}>{projectStats.inProgress}</Text>
            <Text style={styles.statLabel}>Đang XD</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.accent }]}>
            <Ionicons name="time" size={28} color="#fff" />
            <Text style={styles.statNumber}>{projectStats.pending}</Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>
        </View>

        {/* Budget Overview */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              <Ionicons name="wallet-outline" size={18} /> Ngân sách tổng
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Tổng ngân sách</Text>
              <Text style={[styles.budgetValue, { color: COLORS.primary }]}>
                {formatPrice(projectStats.budget.total)}
              </Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Đã chi</Text>
              <Text style={[styles.budgetValue, { color: COLORS.danger }]}>
                {formatPrice(projectStats.budget.spent)}
              </Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Còn lại</Text>
              <Text style={[styles.budgetValue, { color: COLORS.success }]}>
                {formatPrice(projectStats.budget.remaining)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(projectStats.budget.spent / projectStats.budget.total) * 100}%`,
                    backgroundColor: COLORS.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {(
                (projectStats.budget.spent / projectStats.budget.total) *
                100
              ).toFixed(1)}
              % đã sử dụng
            </Text>
          </View>
        </View>

        {/* Monthly Chart (Simple Bar) */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            <Ionicons name="bar-chart-outline" size={18} /> Tiến độ theo tháng
            (%)
          </Text>
          <View style={styles.barChart}>
            {monthlyData.map((item, index) => (
              <View key={index} style={styles.barItem}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${item.value}%`,
                        backgroundColor:
                          item.value >= 90
                            ? COLORS.success
                            : item.value >= 80
                              ? COLORS.primary
                              : COLORS.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.month}</Text>
                <Text style={styles.barValue}>{item.value}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Distribution */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            <Ionicons name="pie-chart-outline" size={18} /> Phân loại dự án
          </Text>
          {categoryData.map((item, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View
                  style={[styles.categoryDot, { backgroundColor: item.color }]}
                />
                <Text style={[styles.categoryName, { color: textColor }]}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryFill,
                    {
                      width: `${(item.count / projectStats.totalProjects) * 100}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{item.count}</Text>
            </View>
          ))}
        </View>

        {/* Timeline Status */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            <Ionicons name="time-outline" size={18} /> Tình trạng tiến độ
          </Text>
          <View style={styles.timelineGrid}>
            <View
              style={[styles.timelineCard, { borderLeftColor: COLORS.success }]}
            >
              <Text style={[styles.timelineNumber, { color: COLORS.success }]}>
                {projectStats.timeline.onTime}
              </Text>
              <Text style={styles.timelineLabel}>Đúng tiến độ</Text>
            </View>
            <View
              style={[styles.timelineCard, { borderLeftColor: COLORS.danger }]}
            >
              <Text style={[styles.timelineNumber, { color: COLORS.danger }]}>
                {projectStats.timeline.delayed}
              </Text>
              <Text style={styles.timelineLabel}>Chậm tiến độ</Text>
            </View>
            <View
              style={[
                styles.timelineCard,
                { borderLeftColor: COLORS.secondary },
              ]}
            >
              <Text
                style={[styles.timelineNumber, { color: COLORS.secondary }]}
              >
                {projectStats.timeline.ahead}
              </Text>
              <Text style={styles.timelineLabel}>Vượt tiến độ</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            <Ionicons name="flash-outline" size={18} /> Hoạt động gần đây
          </Text>
          {recentActivities.map((activity) => {
            const statusStyle = getStatusIcon(activity.status);
            return (
              <View key={activity.id} style={styles.activityRow}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: statusStyle.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={statusStyle.icon as any}
                    size={20}
                    color={statusStyle.color}
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityProject, { color: textColor }]}>
                    {activity.project}
                  </Text>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                </View>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary + "20",
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    margin: 12,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetItem: {
    alignItems: "center",
  },
  budgetLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
    textAlign: "right",
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
    paddingTop: 20,
  },
  barItem: {
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    height: 100,
    width: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 6,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 13,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  categoryFill: {
    height: "100%",
    borderRadius: 4,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    width: 30,
    textAlign: "right",
  },
  timelineGrid: {
    flexDirection: "row",
    gap: 12,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  timelineNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  timelineLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityProject: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityAction: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  activityDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
