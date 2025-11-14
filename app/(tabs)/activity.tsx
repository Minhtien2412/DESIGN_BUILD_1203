/**
 * Activity Feed Screen
 * Real-time activity stream with Socket.IO
 */

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import socketManager, { ActivityFeedEvent } from '@/services/socket';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const ACTIVITY_ICONS: Record<ActivityFeedEvent['type'], string> = {
  project_created: 'briefcase',
  payment_received: 'cash',
  milestone_completed: 'checkmark-circle',
  user_joined: 'person-add',
  comment_added: 'chatbubble',
};

const ACTIVITY_COLORS: Record<ActivityFeedEvent['type'], string> = {
  project_created: '#3B82F6',
  payment_received: '#10B981',
  milestone_completed: '#8B5CF6',
  user_joined: '#F59E0B',
  comment_added: '#EF4444',
};

export default function ActivityFeedScreen() {
  const [activities, setActivities] = useState<ActivityFeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    let mounted = true;

    const setupActivityFeed = async () => {
      try {
        const socket = await socketManager.connect();
        
        if (!mounted) return;
        
        setConnected(true);
        socketManager.subscribeToActivityFeed();

        // Listen for new activity events
        const handleActivity = (event: ActivityFeedEvent) => {
          if (!mounted) return;
          setActivities((prev) => [event, ...prev]);
        };

        socketManager.onActivityFeed(handleActivity);

        setLoading(false);
      } catch (error) {
        console.error('Failed to setup activity feed:', error);
        setLoading(false);
      }
    };

    setupActivityFeed();

    return () => {
      mounted = false;
      socketManager.unsubscribeFromActivityFeed();
      socketManager.offActivityFeed();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, fetch activities from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderActivity = ({ item }: { item: ActivityFeedEvent }) => {
    const iconName = ACTIVITY_ICONS[item.type] as any;
    const color = ACTIVITY_COLORS[item.type];

    return (
      <View style={[styles.activityCard, { borderColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={iconName} size={24} color={color} />
        </View>

        <View style={styles.activityContent}>
          <View style={styles.header}>
            {item.userAvatar ? (
              <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { borderColor }]}>
                <Ionicons name="person" size={16} color={textColor} />
              </View>
            )}
            <Text style={[styles.userName, { color: textColor }]}>{item.userName}</Text>
            <Text style={[styles.timestamp, { color: useThemeColor({}, 'textMuted') }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>

          <Text style={[styles.message, { color: textColor }]}>{item.message}</Text>

          {item.data && (
            <View style={[styles.dataCard, { backgroundColor: useThemeColor({}, 'surface') }]}>
              <Text style={[styles.dataText, { color: useThemeColor({}, 'textMuted') }]}>
                {JSON.stringify(item.data, null, 2)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  return (
    <Container fullWidth style={{ backgroundColor }}>
      {/* Header */}
      <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Activity Feed</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: connected ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.statusText, { color: useThemeColor({}, 'textMuted') }]}>
              {connected ? 'Live' : 'Disconnected'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pulse-outline" size={64} color={useThemeColor({}, 'textMuted')} />
            <Text style={[styles.emptyText, { color: textColor }]}>No activities yet</Text>
            <Text style={[styles.emptySubtext, { color: useThemeColor({}, 'textMuted') }]}>
              Activity will appear here in real-time
            </Text>
          </View>
        }
      />
    </Container>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  activityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  dataCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
