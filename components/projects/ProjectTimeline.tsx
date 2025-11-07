import { Colors } from '@/constants/theme';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface TimelineEvent {
  id: number;
  event_type: 'checkin' | 'progress_update' | 'milestone_completed' | 'task_completed' | 'comment' | 'file_upload' | 'status_change' | 'other';
  title: string;
  description: string;
  metadata: any;
  created_at: string;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
}

interface Props {
  projectId: number;
  limit?: number;
}

export default function ProjectTimeline({ projectId, limit = 20 }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeline();
  }, [projectId]);

  const fetchTimeline = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setOffset(0);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const currentOffset = isRefresh ? 0 : offset;
      const response = await apiFetch(
        `/api/projects/${projectId}/timeline?limit=${limit}&offset=${currentOffset}`
      );

      const newEvents = response.data.items;
      
      if (isRefresh) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      setHasMore(response.data.pagination.hasMore);
      setOffset(currentOffset + newEvents.length);
    } catch (err: any) {
      console.error('Failed to fetch timeline:', err);
      setError(err.message || 'Không thể tải timeline');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    fetchTimeline(true);
  }, [projectId]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchTimeline(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'checkin':
        return 'location';
      case 'progress_update':
        return 'trending-up';
      case 'milestone_completed':
        return 'flag';
      case 'task_completed':
        return 'checkmark-circle';
      case 'comment':
        return 'chatbubble';
      case 'file_upload':
        return 'document-attach';
      case 'status_change':
        return 'swap-horizontal';
      default:
        return 'ellipse';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'checkin':
        return '#2196F3';
      case 'progress_update':
        return '#4CAF50';
      case 'milestone_completed':
        return '#9C27B0';
      case 'task_completed':
        return '#4CAF50';
      case 'comment':
        return '#FF9800';
      case 'file_upload':
        return '#00BCD4';
      case 'status_change':
        return '#FFC107';
      default:
        return colors.accent;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEvent = ({ item, index }: { item: TimelineEvent; index: number }) => {
    const eventColor = getEventColor(item.event_type);
    const isLast = index === events.length - 1;

    return (
      <View style={styles.eventContainer}>
        {/* Timeline Line & Dot */}
        <View style={styles.timelineLeft}>
          <View style={[styles.eventDot, { backgroundColor: eventColor }]}>
            <Ionicons
              name={getEventIcon(item.event_type) as any}
              size={16}
              color="#fff"
            />
          </View>
          {!isLast && (
            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
          )}
        </View>

        {/* Event Content */}
        <View style={[styles.eventContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.eventHeader}>
            <View style={styles.eventHeaderLeft}>
              {item.user_avatar ? (
                <Image source={{ uri: item.user_avatar }} style={styles.userAvatar} />
              ) : (
                <View style={[styles.userAvatarPlaceholder, { backgroundColor: colors.accent }]}>
                  <Ionicons name="person" size={16} color="#fff" />
                </View>
              )}
              <View style={styles.eventHeaderText}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {item.user_name}
                </Text>
                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                  {formatTimestamp(item.created_at)}
                </Text>
              </View>
            </View>
            <View style={[styles.eventTypeBadge, { backgroundColor: eventColor + '20' }]}>
              <Text style={[styles.eventTypeText, { color: eventColor }]}>
                {item.event_type.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={[styles.eventDescription, { color: colors.textMuted }]}>
              {item.description}
            </Text>
          )}

          {/* Photo (if check-in with photo) */}
          {item.metadata?.photo_url && (
            <TouchableOpacity
              style={styles.photoContainer}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.metadata.photo_url }}
                style={styles.eventPhoto}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Check-in Distance (if applicable) */}
          {item.event_type === 'checkin' && item.metadata?.distance !== undefined && (
            <View
              style={[
                styles.distanceBadge,
                {
                  backgroundColor: item.metadata.is_within_range
                    ? '#4CAF50' + '20'
                    : '#FF9800' + '20',
                },
              ]}
            >
              <Ionicons
                name={item.metadata.is_within_range ? 'checkmark-circle' : 'warning'}
                size={14}
                color={item.metadata.is_within_range ? '#4CAF50' : '#FF9800'}
              />
              <Text
                style={[
                  styles.distanceText,
                  {
                    color: item.metadata.is_within_range ? '#4CAF50' : '#FF9800',
                  },
                ]}
              >
                {item.metadata.distance < 1000
                  ? `${Math.round(item.metadata.distance)}m`
                  : `${(item.metadata.distance / 1000).toFixed(1)}km`}{' '}
                từ công trình
              </Text>
            </View>
          )}

          {/* Location (if check-in) */}
          {item.metadata?.latitude && item.metadata?.longitude && (
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>
                {item.metadata.latitude.toFixed(6)}°, {item.metadata.longitude.toFixed(6)}°
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && events.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Đang tải timeline...
        </Text>
      </View>
    );
  }

  if (error && events.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="time-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Chưa có sự kiện nào
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
          Timeline sẽ hiển thị các hoạt động của dự án tại đây
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={renderEvent}
      keyExtractor={(item) => item.id.toString()}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.loadMoreText, { color: colors.textMuted }]}>
              Đang tải thêm...
            </Text>
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  eventDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
    minHeight: 20,
  },
  eventContent: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
  },
  eventTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  photoContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 11,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 12,
  },
});
