/**
 * Notifications Screen - Luxury Redesign
 * European luxury timeline design with elegant badges
 */

import { LuxuryBadge } from '@/components/ui/luxury-badge';
import { LuxuryCard } from '@/components/ui/luxury-card';
import { SafeScrollView } from '@/components/ui/safe-area';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type TabType = 'all' | 'unread' | 'system' | 'message';

interface FilterTabProps {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}

function FilterTab({ label, active, count, onPress }: FilterTabProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {count !== undefined && count > 0 && (
        <LuxuryBadge variant="number" value={count} size="small" color="accent" />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsScreenLuxury() {
  const { notifications, loading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.timing.elegant,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'call': return 'call';
      case 'success': return 'checkmark-circle';
      case 'warning': return 'alert-circle';
      case 'error': return 'close-circle';
      case 'message': return 'chatbubble';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'call': return Colors.light.info;
      case 'success': return Colors.light.success;
      case 'warning': return Colors.light.warning;
      case 'error': return Colors.light.error;
      case 'message': return Colors.light.accent;
      default: return Colors.light.primary;
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const systemCount = notifications.filter(n => n.type !== 'message').length;
  const messageCount = notifications.filter(n => n.type === 'message').length;

  const filteredNotifications = notifications.filter(n => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unread') return !n.read;
    if (selectedTab === 'system') return n.type !== 'message';
    if (selectedTab === 'message') return n.type === 'message';
    return true;
  });

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey = '';
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Hôm qua';
    } else {
      dateKey = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Thông báo</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={markAllAsRead}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={20} color={Colors.light.primary} />
                <Text style={styles.markAllText}>Đọc hết</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tabs */}
      <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          <FilterTab
            label="Tất cả"
            active={selectedTab === 'all'}
            count={notifications.length}
            onPress={() => setSelectedTab('all')}
          />
          <FilterTab
            label="Chưa đọc"
            active={selectedTab === 'unread'}
            count={unreadCount}
            onPress={() => setSelectedTab('unread')}
          />
          <FilterTab
            label="Hệ thống"
            active={selectedTab === 'system'}
            count={systemCount}
            onPress={() => setSelectedTab('system')}
          />
          <FilterTab
            label="Tin nhắn"
            active={selectedTab === 'message'}
            count={messageCount}
            onPress={() => setSelectedTab('message')}
          />
        </ScrollView>
      </Animated.View>

      {/* Notifications List */}
      <SafeScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.accent}
            colors={[Colors.light.accent]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {Object.entries(groupedNotifications).map(([dateKey, items]) => (
            <View key={dateKey} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <View style={styles.goldLine} />
                <Text style={styles.dateText}>{dateKey}</Text>
                <View style={[styles.goldLine, { flex: 1 }]} />
              </View>

              {items.map((notification, index) => {
                const color = getNotificationColor(notification.type);
                return (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => markAsRead(notification.id)}
                    activeOpacity={0.9}
                  >
                    <LuxuryCard
                      style={{
                        ...styles.notificationCard,
                        ...(!notification.read ? styles.unreadCard : {}),
                      }}
                    >
                      <View style={styles.cardContent}>
                        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                          <Ionicons
                            name={getNotificationIcon(notification.type) as any}
                            size={24}
                            color={color}
                          />
                        </View>

                        <View style={styles.textContent}>
                          <View style={styles.titleRow}>
                            <Text style={styles.notificationTitle} numberOfLines={1}>
                              {notification.title}
                            </Text>
                            {!notification.read && (
                              <View style={styles.unreadDot} />
                            )}
                          </View>
                          <Text style={styles.notificationMessage} numberOfLines={2}>
                            {notification.message}
                          </Text>
                          <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
                        </View>
                      </View>

                      {!notification.read && <View style={[styles.leftAccent, { backgroundColor: color }]} />}
                    </LuxuryCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {filteredNotifications.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={64} color={Colors.light.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Không có thông báo</Text>
              <Text style={styles.emptyText}>
                {selectedTab === 'unread'
                  ? 'Tất cả thông báo đã được đọc'
                  : 'Chưa có thông báo mới'}
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </SafeScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.surface,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.goldLight,
    letterSpacing: 0.3,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.goldLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
  },
  tabsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  tabs: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: Colors.light.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  goldLine: {
    height: 1,
    width: 40,
    backgroundColor: Colors.light.accent,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  notificationCard: {
    marginBottom: 12,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: Colors.light.goldLight + '10',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
});
