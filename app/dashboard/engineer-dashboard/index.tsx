/**
 * Engineer Dashboard Screen
 * Dashboard for engineers with project-focused metrics
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dashboardApi } from "@/services/dashboardApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EngineerDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const primaryColor = "#0080FF";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await dashboardApi.getEngineerDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
          Engineer Dashboard
        </Text>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={primaryColor}
          />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="My Projects"
            value={stats?.activeProjects || 0}
            subtitle="Active"
            icon="briefcase-outline"
            color={primaryColor}
          />
          <StatCard
            title="Tasks Today"
            value={stats?.pendingTasks || 0}
            subtitle="Pending"
            icon="checkbox-outline"
            trend={{ value: 5, direction: "down" }}
            color="#007AFF"
          />
          <StatCard
            title="Inspections"
            value={stats?.pendingInspections || 0}
            subtitle="This week"
            icon="clipboard-outline"
            color="#FF9500"
          />
          <StatCard
            title="Completion"
            value={`${Math.round(((stats?.completedTasks || 0) / (stats?.totalTasks || 1)) * 100)}%`}
            subtitle="Overall"
            icon="trending-up-outline"
            trend={{ value: 12, direction: "up" }}
            color="#34C759"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={[styles.actionCard, { backgroundColor: "#007AFF20" }]}
              onPress={() =>
                router.push("/quality-assurance/inspections/create")
              }
            >
              <Ionicons name="clipboard-outline" size={32} color="#007AFF" />
              <Text style={[styles.actionLabel, { color: textColor }]}>
                New Inspection
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionCard, { backgroundColor: "#FF950020" }]}
              onPress={() => router.push("/daily-report")}
            >
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#FF9500"
              />
              <Text style={[styles.actionLabel, { color: textColor }]}>
                Daily Report
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionCard, { backgroundColor: "#34C75920" }]}
              onPress={() => router.push("/materials")}
            >
              <Ionicons name="cube-outline" size={32} color="#34C759" />
              <Text style={[styles.actionLabel, { color: textColor }]}>
                Materials
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionCard, { backgroundColor: "#FF3B3020" }]}
              onPress={() => router.push("/safety")}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={32}
                color="#FF3B30"
              />
              <Text style={[styles.actionLabel, { color: textColor }]}>
                Safety Check
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Activities */}
        {stats?.recentActivities && stats.recentActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Recent Activities
            </Text>
            <View style={styles.activitiesList}>
              {stats.recentActivities
                .slice(0, 5)
                .map((activity: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.activityItem,
                      { backgroundColor: cardColor },
                    ]}
                  >
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: `${primaryColor}20` },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={primaryColor}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={[styles.activityText, { color: textColor }]}>
                        {activity.description}
                      </Text>
                      <Text style={[styles.activityTime, { color: "#999" }]}>
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}
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
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  activitiesList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: "500",
  },
});
