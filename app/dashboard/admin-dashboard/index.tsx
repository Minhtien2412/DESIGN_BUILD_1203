/**
 * Admin Dashboard Screen
 * Comprehensive dashboard with project statistics, costs, and analytics
 */

import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { dashboardApi } from '@/services/dashboardApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type TabType = 'overview' | 'projects' | 'costs' | 'workers';

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<any>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = '#0066CC';

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
      console.error('Failed to load dashboard:', error);
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
          borderColor: selectedTab === tab ? primaryColor : '#E5E5E5',
        },
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={selectedTab === tab ? '#fff' : textColor}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: selectedTab === tab ? '#fff' : textColor },
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
            trend={{ value: 12, direction: 'up' }}
            color={primaryColor}
          />
          <StatCard
            title="Total Revenue"
            value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            subtitle="This month"
            icon="trending-up-outline"
            trend={{ value: 8, direction: 'up' }}
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
                labels: ['Completed', 'Pending'],
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
                color: ['#34C759', '#007AFF', '#FF9500', '#FF3B30'][
                  index % 4
                ],
                legendFontColor: textColor,
              }))}
            />
          </View>
        )}
      </View>
    );
  };

  const renderProjectsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.comingSoonContainer}>
        <Ionicons name="construct-outline" size={48} color="#999" />
        <Text style={[styles.comingSoonText, { color: textColor }]}>
          Project Analytics
        </Text>
        <Text style={[styles.comingSoonSubtext, { color: '#999' }]}>
          Detailed project insights coming soon
        </Text>
      </View>
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
              labels: ['Materials', 'Labor', 'Equipment', 'Other'],
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

  const renderWorkersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.comingSoonContainer}>
        <Ionicons name="people-outline" size={48} color="#999" />
        <Text style={[styles.comingSoonText, { color: textColor }]}>
          Worker Analytics
        </Text>
        <Text style={[styles.comingSoonSubtext, { color: '#999' }]}>
          Productivity and performance metrics coming soon
        </Text>
      </View>
    </View>
  );

  if (loading && !stats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['top']}
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
      edges={['top']}
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
        {renderTabButton('overview', 'Overview', 'grid-outline')}
        {renderTabButton('projects', 'Projects', 'briefcase-outline')}
        {renderTabButton('costs', 'Costs', 'trending-up-outline')}
        {renderTabButton('workers', 'Workers', 'people-outline')}
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
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'projects' && renderProjectsTab()}
        {selectedTab === 'costs' && renderCostsTab()}
        {selectedTab === 'workers' && renderWorkersTab()}
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  tabsContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  comingSoonSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
