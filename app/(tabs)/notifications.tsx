import { EventNotificationCard } from '@/components/notifications/EventNotificationCard';
import { LiveNotificationCard } from '@/components/notifications/LiveNotificationCard';
import { MessageNotificationCard } from '@/components/notifications/MessageNotificationCard';
import { SystemNotificationCard } from '@/components/notifications/SystemNotificationCard';
import { Colors } from '@/constants/theme';
import { useNotifications, type Notification } from '@/context/NotificationContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

type TabType = 'all' | 'system' | 'event' | 'live' | 'message';

interface NotificationItemProps extends Notification {
  onPress: (id: string) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}

const NotificationItem = ({ id, type, title, message, createdAt, read, data, onPress, showDetails, onToggleDetails }: NotificationItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = () => {
    switch (type) {
      case 'call':
        return 'call';
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'alert-circle';
      case 'error':
        return 'close-circle';
      case 'message':
        return 'chatbubble';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'call':
        return '#007AFF';
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      case 'error':
        return '#FF3B30';
      case 'message':
        return '#AF52DE';
      default:
        return colors.accent;
    }
  };

  // Format time (e.g., "5 phút trước", "2 giờ trước", "1 ngày trước")
  const formatTime = (dateString: string) => {
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
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: !read ? colors.chipBackground : 'transparent',
          borderColor: !read ? getIconColor() : colors.border,
          borderLeftWidth: 3,
        }
      ]}
      activeOpacity={0.7}
      onPress={() => onPress(id)}
      onLongPress={onToggleDetails}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
        <Ionicons name={getIcon()} size={24} color={getIconColor()} />
        {!read && (
          <View style={[styles.pulseDot, { backgroundColor: getIconColor() }]} />
        )}
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {!read && (
            <View style={[styles.unreadBadgeSmall, { backgroundColor: getIconColor() }]}>
              <Text style={styles.badgeText}>Mới</Text>
            </View>
          )}
        </View>
        <Text style={[styles.notificationMessage, { color: colors.textMuted }]} numberOfLines={showDetails ? undefined : 2}>
          {message}
        </Text>
        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
            {formatTime(createdAt)}
          </Text>
        </View>

        {/* Detailed timestamps (expandable) */}
        {showDetails && (
          <View style={[styles.detailsPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMuted} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Tạo lúc:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatFullTimestamp(createdAt)}
                </Text>
              </View>
            </View>

            {data?.receivedAt && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="download-outline" size={14} color={colors.textMuted} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Nhận lúc:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatFullTimestamp(data.receivedAt)}
                  </Text>
                </View>
              </View>
            )}

            {read && data?.readAt && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="eye-check-outline" size={14} color={colors.textMuted} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Đọc lúc:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatFullTimestamp(data.readAt)}
                  </Text>
                </View>
              </View>
            )}

            {data?.device && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="cellphone" size={14} color={colors.textMuted} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Thiết bị:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {data.device}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Expand button */}
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
            size={14} 
            color={colors.accent} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const [refreshing, setRefreshing] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState<TabType>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (id: string) => {
    // Mark as read when pressed
    await markAsRead(id);
    // TODO: Navigate to related screen based on notification data
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

  // Filter notifications by active tab
  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.category === activeTab);
  }, [notifications, activeTab]);

  // Count notifications by category
  const categoryCount = React.useMemo(() => {
    const counts = {
      all: notifications.length,
      system: 0,
      event: 0,
      live: 0,
      message: 0,
    };
    notifications.forEach(n => {
      if (n.category === 'system') counts.system++;
      else if (n.category === 'event') counts.event++;
      else if (n.category === 'live') counts.live++;
      else if (n.category === 'message') counts.message++;
    });
    return counts;
  }, [notifications]);

  // Show loading on first load
  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Đang tải thông báo...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Thông báo</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadBadge, { color: colors.accent }]}>
              {unreadCount} chưa đọc
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markAllRead, { color: colors.accent }]}>
              Đánh dấu đã đọc
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && [styles.tabActive, { backgroundColor: colors.accent }]
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Ionicons 
            name="apps" 
            size={18} 
            color={activeTab === 'all' ? '#FFF' : colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'all' ? '#FFF' : colors.textMuted }
          ]}>
            Tất cả {categoryCount.all > 0 && `(${categoryCount.all})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'system' && [styles.tabActive, { backgroundColor: '#FF9500' }]
          ]}
          onPress={() => setActiveTab('system')}
        >
          <Ionicons 
            name="settings" 
            size={18} 
            color={activeTab === 'system' ? '#FFF' : colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'system' ? '#FFF' : colors.textMuted }
          ]}>
            Hệ thống {categoryCount.system > 0 && `(${categoryCount.system})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'event' && [styles.tabActive, { backgroundColor: '#007AFF' }]
          ]}
          onPress={() => setActiveTab('event')}
        >
          <Ionicons 
            name="calendar" 
            size={18} 
            color={activeTab === 'event' ? '#FFF' : colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'event' ? '#FFF' : colors.textMuted }
          ]}>
            Sự kiện {categoryCount.event > 0 && `(${categoryCount.event})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'live' && [styles.tabActive, { backgroundColor: '#FF3B30' }]
          ]}
          onPress={() => setActiveTab('live')}
        >
          <MaterialCommunityIcons 
            name="video" 
            size={18} 
            color={activeTab === 'live' ? '#FFF' : colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'live' ? '#FFF' : colors.textMuted }
          ]}>
            Live {categoryCount.live > 0 && `(${categoryCount.live})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'message' && [styles.tabActive, { backgroundColor: '#34C759' }]
          ]}
          onPress={() => setActiveTab('message')}
        >
          <Ionicons 
            name="chatbubbles" 
            size={18} 
            color={activeTab === 'message' ? '#FFF' : colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'message' ? '#FFF' : colors.textMuted }
          ]}>
            Tin nhắn {categoryCount.message > 0 && `(${categoryCount.message})`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {activeTab === 'all' 
                ? 'Chưa có thông báo nào' 
                : `Chưa có thông báo ${activeTab === 'system' ? 'hệ thống' : activeTab === 'event' ? 'sự kiện' : activeTab === 'live' ? 'live' : 'tin nhắn'}`}
            </Text>
          </View>
        ) : (
          <>
            {filteredNotifications.map((notification) => {
              // Render specific card based on category
              if (notification.category === 'system') {
                return (
                  <SystemNotificationCard
                    key={notification.id}
                    id={notification.id}
                    title={notification.title}
                    message={notification.message}
                    systemType={notification.data?.systemType || 'announcement'}
                    priority={notification.priority || 'normal'}
                    read={notification.read}
                    createdAt={notification.createdAt}
                    affectedServices={notification.data?.affectedServices}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                );
              }

              if (notification.category === 'event') {
                return (
                  <EventNotificationCard
                    key={notification.id}
                    id={notification.id}
                    title={notification.title}
                    message={notification.message}
                    eventType={notification.data?.eventType || 'reminder'}
                    priority={notification.priority || 'normal'}
                    read={notification.read}
                    createdAt={notification.createdAt}
                    eventDate={notification.data?.eventDate}
                    location={notification.data?.location}
                    participants={notification.data?.participants}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                );
              }

              if (notification.category === 'live') {
                return (
                  <LiveNotificationCard
                    key={notification.id}
                    id={notification.id}
                    title={notification.title}
                    message={notification.message}
                    liveType={notification.data?.liveType || 'stream'}
                    priority={notification.priority || 'normal'}
                    read={notification.read}
                    createdAt={notification.createdAt}
                    isActive={notification.data?.isActive || false}
                    viewerCount={notification.data?.viewerCount}
                    startedAt={notification.data?.startedAt}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                );
              }

              if (notification.category === 'message') {
                return (
                  <MessageNotificationCard
                    key={notification.id}
                    id={notification.id}
                    title={notification.title}
                    message={notification.message}
                    messageType={notification.data?.messageType || 'chat'}
                    priority={notification.priority || 'normal'}
                    read={notification.read}
                    createdAt={notification.createdAt}
                    senderName={notification.data?.senderName || 'Unknown'}
                    senderAvatar={notification.data?.senderAvatar}
                    preview={notification.data?.preview}
                    conversationId={notification.data?.conversationId}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                );
              }

              // Fallback to original NotificationItem for other types
              return (
                <NotificationItem 
                  key={notification.id} 
                  {...notification} 
                  onPress={handleNotificationPress}
                  showDetails={expandedItems.has(notification.id)}
                  onToggleDetails={() => toggleDetails(notification.id)}
                />
              );
            })}
            <View style={{ height: 32 }} />
          </>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  unreadBadge: {
    fontSize: 14,
    marginTop: 4,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    maxHeight: 60,
    marginVertical: 8,
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'center',
    marginLeft: 8,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  unreadBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
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
