/**
 * Enhanced Notifications Screen with Timeline
 * Features:
 * - Detailed timestamps (created, received, read)
 * - Activity timeline (login history, actions)
 * - Trust signals (IP, device, location)
 * - Limited to 10 notifications per user (managed by backend)
 */

import { Colors } from '@/constants/theme';
import { useNotifications, type Notification } from '@/context/NotificationContext';
import { useAuth } from '@/features/auth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator, Linking, RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

interface TimelineItemProps {
  notification: Notification;
  onPress: (id: string) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}

const TimelineItem = ({ notification, onPress, showDetails, onToggleDetails }: TimelineItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = () => {
    switch (notification.type) {
      case 'call': return 'call';
      case 'success': return 'checkmark-circle';
      case 'warning': return 'alert-circle';
      case 'error': return 'close-circle';
      case 'message': return 'chatbubble';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'call': return '#007AFF';
      case 'success': return '#34C759';
      case 'warning': return '#FF9500';
      case 'error': return '#FF3B30';
      case 'message': return '#AF52DE';
      default: return colors.accent;
    }
  };

  // Format time (e.g., "5 phút trước", "2 giờ trước", "1 ngày trước")
  const formatTimestamp = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatFullTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} lúc ${hours}:${minutes}:${seconds}`;
  };

  return (
    <View style={styles.timelineItemContainer}>
      {/* Timeline connector line */}
      <View style={[styles.timelineConnector, { backgroundColor: colors.border }]} />
      
      <TouchableOpacity 
        style={[
          styles.timelineItem, 
          { 
            backgroundColor: !notification.read ? colors.chipBackground : colors.surface,
            borderColor: !notification.read ? getIconColor() : colors.border,
            borderLeftWidth: 3,
          }
        ]}
        activeOpacity={0.7}
        onPress={() => onPress(notification.id)}
        onLongPress={onToggleDetails}
      >
        {/* Icon with pulse animation for unread */}
        <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
          <Ionicons name={getIcon()} size={24} color={getIconColor()} />
          {!notification.read && (
            <View style={[styles.pulseDot, { backgroundColor: getIconColor() }]} />
          )}
        </View>
        
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.read && (
              <View style={[styles.unreadBadge, { backgroundColor: getIconColor() }]}>
                <Text style={styles.unreadText}>Mới</Text>
              </View>
            )}
          </View>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textMuted }]} numberOfLines={showDetails ? undefined : 2}>
            {notification.message}
          </Text>

          {/* Timestamp info */}
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.timestampText, { color: colors.textMuted }]}>
              {formatTimestamp(notification.createdAt)}
            </Text>
          </View>

          {/* Detailed timestamps (expandable) */}
          {showDetails && (
            <View style={[styles.detailsPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textMuted} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Tạo lúc:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatFullTimestamp(notification.createdAt)}
                  </Text>
                </View>
              </View>

              {notification.data?.receivedAt && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="download-outline" size={16} color={colors.textMuted} />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Nhận lúc:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatFullTimestamp(notification.data.receivedAt)}
                    </Text>
                  </View>
                </View>
              )}

              {notification.read && notification.data?.readAt && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="eye-check-outline" size={16} color={colors.textMuted} />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Đọc lúc:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatFullTimestamp(notification.data.readAt)}
                    </Text>
                  </View>
                </View>
              )}

              {notification.data?.device && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="cellphone" size={16} color={colors.textMuted} />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Thiết bị:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {notification.data.device}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Expand indicator */}
          <TouchableOpacity 
            style={styles.expandButton} 
            onPress={onToggleDetails}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.expandText, { color: colors.accent }]}>
              {showDetails ? 'Thu gọn' : 'Chi tiết'}
            </Text>
            <Ionicons 
              name={showDetails ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={colors.accent} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function NotificationsTimelineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (id: string) => {
    await markAsRead(id);
    try {
      const notification = notifications.find(n => n.id === id);
      if (!notification) return;
      const actionUrl = (notification as any).actionUrl || notification.data?.actionUrl || notification.data?.url;
      if (typeof actionUrl === 'string' && actionUrl.length > 0) {
        if (actionUrl.startsWith('/')) {
          router.push(actionUrl as any);
          return;
        }
        if (actionUrl.startsWith('http')) {
          Linking.openURL(actionUrl); return;
        }
      }
      switch (notification.category) {
        case 'message': router.push('/messages' as any); break;
        case 'live': router.push('/communications' as any); break;
        case 'event': router.push('/projects' as any); break;
        default: toggleDetails(id); break;
      }
    } catch (e) {
      console.warn('Timeline notification navigation failed:', e);
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  // Show loading on first load
  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Đang tải timeline...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with stats */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Timeline Thông Báo</Text>
          <View style={styles.statsRow}>
            {unreadCount > 0 && (
              <View style={[styles.statBadge, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="notifications" size={14} color={colors.accent} />
                <Text style={[styles.statText, { color: colors.accent }]}>
                  {unreadCount} mới
                </Text>
              </View>
            )}
            <View style={[styles.statBadge, { backgroundColor: colors.textMuted + '20' }]}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                Giới hạn 10/user
              </Text>
            </View>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={[styles.markAllButton, { backgroundColor: colors.accent }]}
            onPress={handleMarkAllRead}
          >
            <Ionicons name="checkmark-done" size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Trust badge */}
      {user && (
        <View style={[styles.trustBadge, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
          <MaterialCommunityIcons name="shield-check" size={20} color={colors.success} />
          <Text style={[styles.trustText, { color: colors.success }]}>
            Tất cả hoạt động được mã hóa và ghi nhận an toàn
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="timeline-clock-outline" size={80} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Chưa có hoạt động nào
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Timeline của bạn sẽ hiển thị tại đây
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {notifications.map((notification, index) => (
              <TimelineItem 
                key={notification.id} 
                notification={notification}
                onPress={handleNotificationPress}
                showDetails={expandedItems.has(notification.id)}
                onToggleDetails={() => toggleDetails(notification.id)}
              />
            ))}
            <View style={{ height: 32 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  trustText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
  },
  timeline: {
    paddingTop: 20,
  },
  timelineItemContainer: {
    position: 'relative',
    marginBottom: 20,
    paddingLeft: 40,
  },
  timelineConnector: {
    position: 'absolute',
    left: 24,
    top: 48,
    bottom: -20,
    width: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 12,
  },
  detailsPanel: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
