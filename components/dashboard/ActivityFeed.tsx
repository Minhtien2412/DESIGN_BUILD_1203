/**
 * Activity Feed Component
 * Shows recent activities/events in dashboard
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export interface Activity {
  id: string;
  type: 'user' | 'project' | 'payment' | 'task' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxHeight?: number;
}

const ACTIVITY_ICONS: Record<Activity['type'], keyof typeof Ionicons.glyphMap> = {
  user: 'person-add',
  project: 'briefcase',
  payment: 'cash',
  task: 'checkmark-circle',
  system: 'information-circle',
};

const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  user: Colors.light.primary,
  project: '#8B5CF6',
  payment: '#10B981',
  task: '#F59E0B',
  system: '#6B7280',
};

export function ActivityFeed({ activities, maxHeight = 400 }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color={Colors.light.textMuted} />
        <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { maxHeight }]} showsVerticalScrollIndicator={false}>
      {activities.map((activity, index) => (
        <View key={activity.id} style={styles.activityItem}>
          {/* Timeline indicator */}
          <View style={styles.timeline}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: activity.color || ACTIVITY_COLORS[activity.type] },
              ]}
            >
              <Ionicons
                name={activity.icon || ACTIVITY_ICONS[activity.type]}
                size={12}
                color="#fff"
              />
            </View>
            {index < activities.length - 1 && <View style={styles.timelineLine} />}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{activity.title}</Text>
            <Text style={styles.description}>{activity.description}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(activity.timestamp)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  timeline: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.light.border,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginBottom: 6,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
});
