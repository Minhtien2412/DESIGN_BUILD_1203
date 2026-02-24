/**
 * AIWidget Component - Quick AI access from Homepage
 * Displays AI insights and quick actions
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AIWidgetProps {
  insights?: {
    todayProgress?: string;
    upcomingTasks?: number;
    aiSuggestions?: number;
  };
}

export default function AIWidget({ insights }: AIWidgetProps) {
  const quickActions = [
    {
      id: 1,
      icon: 'camera-outline',
      label: 'Phân tích ảnh',
      route: '/ai/photo-analysis',
      color: '#0D9488',
    },
    {
      id: 2,
      icon: 'chatbubble-outline',
      label: 'Chat AI',
      route: '/ai/index',
      color: '#0D9488',
    },
    {
      id: 3,
      icon: 'document-text-outline',
      label: 'Báo cáo',
      route: '/ai/generate-report',
      color: '#0D9488',
    },
    {
      id: 4,
      icon: 'cube-outline',
      label: 'VL Check',
      route: '/ai/material-check',
      color: '#666666',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Widget Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <Ionicons name="flash" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>AI Assistant</Text>
            <Text style={styles.subtitle}>Trợ lý thông minh 24/7</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/ai/index' as any)}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Insights Section */}
      {insights && (
        <View style={styles.insightsContainer}>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="trending-up" size={16} color="#0D9488" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Tiến độ hôm nay</Text>
              <Text style={styles.insightValue}>
                {insights.todayProgress || '+12%'}
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Công việc</Text>
              <Text style={styles.insightValue}>
                {insights.upcomingTasks || 5} việc
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb" size={16} color="#0D9488" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Gợi ý AI</Text>
              <Text style={styles.insightValue}>
                {insights.aiSuggestions || 3} mới
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={() => router.push(action.route as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel} numberOfLines={1}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Status Indicator */}
      <View style={styles.statusBar}>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>AI đang hoạt động</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.learnMoreText}>Tìm hiểu thêm →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  insightsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#6B7280',
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
