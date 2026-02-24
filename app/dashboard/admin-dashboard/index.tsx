/**
 * Admin Dashboard Screen
 * Comprehensive dashboard with project statistics, costs, and analytics
 */

import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dashboardApi } from "@/services/dashboardApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

type TabType = "overview" | "projects" | "costs" | "workers";

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<any>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const primaryColor = "#0D9488";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await dashboardApi.getAdminDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <Pressable
      style={[
        styles.tabButton,
        {
          backgroundColor: selectedTab === tab ? primaryColor : cardColor,
          borderColor: selectedTab === tab ? primaryColor : "#E5E5E5",
        },
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={selectedTab === tab ? "#fff" : textColor}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: selectedTab === tab ? "#fff" : textColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderOverviewTab = () => {
    if (!stats) return null;

    return (
      <View style={styles.tabContent}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Projects"
            value={stats.totalProjects || 0}
            subtitle="Active projects"
            icon="briefcase-outline"
            trend={{ value: 12, direction: "up" }}
            color={primaryColor}
          />
          <StatCard
            title="Total Revenue"
            value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            subtitle="This month"
            icon="trending-up-outline"
            trend={{ value: 8, direction: "up" }}
            color="#34C759"
          />
          <StatCard
            title="Active Tasks"
            value={stats.pendingTasks || 0}
            subtitle="In progress"
            icon="checkbox-outline"
            color="#007AFF"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            subtitle="Registered"
            icon="people-outline"
            color="#FF9500"
          />
        </View>

        {/* Task Completion Chart */}
        {stats.completedTasks && stats.totalTasks && (
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: textColor }]}>
              Task Completion
            </Text>
            <ProgressChart
              type="circular"
              data={{
                labels: ["Completed", "Pending"],
                data: [
                  stats.completedTasks,
                  stats.totalTasks - stats.completedTasks,
                ],
              }}
            />
          </View>
        )}

        {/* Projects Status Chart */}
        {stats.projectsByStatus && (
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: textColor }]}>
              Projects by Status
            </Text>
            <ProgressChart
              type="pie"
              data={stats.projectsByStatus.map((item: any, index: number) => ({
                name: item.status,
                value: item.count,
                color: ["#34C759", "#007AFF", "#FF9500", "#FF3B30"][index % 4],
                legendFontColor: textColor,
              }))}
            />
          </View>
        )}
      </View>
    );
  };

  const MOCK_PROJECTS = [
    {
      id: "p1",
      name: "Chung cư Sunrise City",
      status: "Đang thi công",
      progress: 72,
      budget: 45.5,
      spent: 32.8,
      workers: 85,
      dueDate: "2025-06-30",
    },
    {
      id: "p2",
      name: "Biệt thự Thảo Điền",
      status: "Đang thi công",
      progress: 45,
      budget: 12.0,
      spent: 5.4,
      workers: 32,
      dueDate: "2025-09-15",
    },
    {
      id: "p3",
      name: "Nhà xưởng KCN Long Hậu",
      status: "Hoàn thiện",
      progress: 95,
      budget: 28.0,
      spent: 26.6,
      workers: 48,
      dueDate: "2025-02-28",
    },
    {
      id: "p4",
      name: "Trung tâm thương mại Q7",
      status: "Lập kế hoạch",
      progress: 15,
      budget: 120.0,
      spent: 8.5,
      workers: 12,
      dueDate: "2026-12-31",
    },
    {
      id: "p5",
      name: "Cầu vượt Nguyễn Hữu Thọ",
      status: "Đang thi công",
      progress: 60,
      budget: 85.0,
      spent: 51.0,
      workers: 120,
      dueDate: "2025-08-15",
    },
  ];

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "Đang thi công":
        return "#0D9488";
      case "Hoàn thiện":
        return "#10b981";
      case "Lập kế hoạch":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const renderProjectsTab = () => (
    <View style={styles.tabContent}>
      {MOCK_PROJECTS.map((project) => (
        <View
          key={project.id}
          style={[
            styles.projectCard,
            { backgroundColor: cardColor, borderColor: "#E5E5E5" },
          ]}
        >
          <View style={styles.projectHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.projectName, { color: textColor }]}>
                {project.name}
              </Text>
              <View
                style={[
                  styles.projectStatusBadge,
                  {
                    backgroundColor:
                      getProjectStatusColor(project.status) + "20",
                  },
                ]}
              >
                <View
                  style={[
                    styles.projectStatusDot,
                    { backgroundColor: getProjectStatusColor(project.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.projectStatusText,
                    { color: getProjectStatusColor(project.status) },
                  ]}
                >
                  {project.status}
                </Text>
              </View>
            </View>
            <View style={styles.progressCircle}>
              <Text style={[styles.progressText, { color: primaryColor }]}>
                {project.progress}%
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${project.progress}%`,
                  backgroundColor: getProjectStatusColor(project.status),
                },
              ]}
            />
          </View>
          <View style={styles.projectStatsRow}>
            <View style={styles.projectStatItem}>
              <Ionicons name="cash-outline" size={14} color="#999" />
              <Text style={{ color: "#999", fontSize: 12 }}>
                {project.spent}/{project.budget}B đ
              </Text>
            </View>
            <View style={styles.projectStatItem}>
              <Ionicons name="people-outline" size={14} color="#999" />
              <Text style={{ color: "#999", fontSize: 12 }}>
                {project.workers} CN
              </Text>
            </View>
            <View style={styles.projectStatItem}>
              <Ionicons name="calendar-outline" size={14} color="#999" />
              <Text style={{ color: "#999", fontSize: 12 }}>
                {project.dueDate}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCostsTab = () => {
    if (!stats?.revenueByMonth) return null;

    const monthlyData = stats.revenueByMonth.slice(0, 6);

    return (
      <View style={styles.tabContent}>
        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: textColor }]}>
            Monthly Revenue
          </Text>
          <ProgressChart
            type="line"
            data={{
              labels: monthlyData.map((item: any) => item.month.slice(0, 3)),
              datasets: [
                {
                  data: monthlyData.map((item: any) => item.revenue / 1000000),
                  color: () => primaryColor,
                },
              ],
            }}
          />
        </View>

        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: textColor }]}>
            Cost by Category
          </Text>
          <ProgressChart
            type="bar"
            data={{
              labels: ["Materials", "Labor", "Equipment", "Other"],
              datasets: [
                {
                  data: [45, 30, 15, 10],
                },
              ],
            }}
          />
        </View>
      </View>
    );
  };

  const MOCK_WORKERS = [
    {
      id: "w1",
      name: "Đội thợ xây 1",
      lead: "Nguyễn Văn Minh",
      count: 15,
      attendance: 93,
      productivity: 87,
      project: "Sunrise City",
    },
    {
      id: "w2",
      name: "Đội điện nước",
      lead: "Trần Hoàng Phúc",
      count: 8,
      attendance: 96,
      productivity: 92,
      project: "Sunrise City",
    },
    {
      id: "w3",
      name: "Đội cốp pha",
      lead: "Lê Thanh Tùng",
      count: 12,
      attendance: 88,
      productivity: 78,
      project: "Cầu vượt NHT",
    },
    {
      id: "w4",
      name: "Đội sắt thép",
      lead: "Phạm Đức Anh",
      count: 10,
      attendance: 91,
      productivity: 85,
      project: "Biệt thự TĐ",
    },
    {
      id: "w5",
      name: "Đội hoàn thiện",
      lead: "Võ Minh Tuấn",
      count: 20,
      attendance: 95,
      productivity: 90,
      project: "Nhà xưởng LH",
    },
  ];

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "#10b981";
    if (value >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const renderWorkersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.workerSummaryRow}>
        <View
          style={[styles.workerSummaryCard, { backgroundColor: cardColor }]}
        >
          <Ionicons name="people" size={24} color={primaryColor} />
          <Text style={[styles.workerSummaryValue, { color: textColor }]}>
            {MOCK_WORKERS.reduce((sum, w) => sum + w.count, 0)}
          </Text>
          <Text style={styles.workerSummaryLabel}>Tổng công nhân</Text>
        </View>
        <View
          style={[styles.workerSummaryCard, { backgroundColor: cardColor }]}
        >
          <Ionicons name="checkmark-done" size={24} color="#10b981" />
          <Text style={[styles.workerSummaryValue, { color: textColor }]}>
            {(
              MOCK_WORKERS.reduce((sum, w) => sum + w.attendance, 0) /
              MOCK_WORKERS.length
            ).toFixed(0)}
            %
          </Text>
          <Text style={styles.workerSummaryLabel}>Chuyên cần TB</Text>
        </View>
      </View>
      {MOCK_WORKERS.map((worker) => (
        <View
          key={worker.id}
          style={[
            styles.projectCard,
            { backgroundColor: cardColor, borderColor: "#E5E5E5" },
          ]}
        >
          <View style={styles.projectHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.projectName, { color: textColor }]}>
                {worker.name}
              </Text>
              <Text style={{ color: "#999", fontSize: 13, marginTop: 2 }}>
                Đội trưởng: {worker.lead} • {worker.count} người
              </Text>
            </View>
          </View>
          <View style={styles.workerMetricsRow}>
            <View style={styles.workerMetric}>
              <Text style={{ color: "#999", fontSize: 11 }}>Chuyên cần</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${worker.attendance}%`,
                      backgroundColor: getPerformanceColor(worker.attendance),
                    },
                  ]}
                />
              </View>
              <Text
                style={{
                  color: getPerformanceColor(worker.attendance),
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                {worker.attendance}%
              </Text>
            </View>
            <View style={styles.workerMetric}>
              <Text style={{ color: "#999", fontSize: 11 }}>Năng suất</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${worker.productivity}%`,
                      backgroundColor: getPerformanceColor(worker.productivity),
                    },
                  ]}
                />
              </View>
              <Text
                style={{
                  color: getPerformanceColor(worker.productivity),
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                {worker.productivity}%
              </Text>
            </View>
          </View>
          <View style={[styles.projectStatItem, { marginTop: 8 }]}>
            <Ionicons name="briefcase-outline" size={14} color="#999" />
            <Text style={{ color: "#999", fontSize: 12 }}>
              {worker.project}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading && !stats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={["top"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Admin Dashboard
        </Text>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </Pressable>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {renderTabButton("overview", "Overview", "grid-outline")}
        {renderTabButton("projects", "Projects", "briefcase-outline")}
        {renderTabButton("costs", "Costs", "trending-up-outline")}
        {renderTabButton("workers", "Workers", "people-outline")}
      </ScrollView>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={primaryColor}
          />
        }
      >
        {selectedTab === "overview" && renderOverviewTab()}
        {selectedTab === "projects" && renderProjectsTab()}
        {selectedTab === "costs" && renderCostsTab()}
        {selectedTab === "workers" && renderWorkersTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  tabsContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  comingSoonContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  comingSoonSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  projectCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
  },
  projectStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    marginTop: 6,
  },
  projectStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  projectStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0D948815",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 15,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
    flex: 1,
    marginBottom: 12,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  projectStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  projectStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workerSummaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  workerSummaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    gap: 6,
  },
  workerSummaryValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  workerSummaryLabel: {
    fontSize: 12,
    color: "#999",
  },
  workerMetricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  workerMetric: {
    flex: 1,
    gap: 4,
  },
});
