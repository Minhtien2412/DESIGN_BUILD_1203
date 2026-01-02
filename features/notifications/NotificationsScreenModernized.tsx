/**
 * Notifications Screen - Modernized with Nordic Green Theme
 * Features: Date grouping, unread badges, mark all read, swipe actions
 * Updated: 13/12/2025
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import { useNotifications } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type NotificationType = 'all' | 'system' | 'project' | 'task' | 'message';

interface NotificationGroup {
  title: string;
  data: any[];
}

export default function NotificationsScreenModernized() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<NotificationType>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationPress = async (id: number) => {
    await markAsRead(id);
    // Navigate to relevant screen based on notification type
  };

  // Group notifications by date
  const groupedNotifications = (): NotificationGroup[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayNotifs: any[] = [];
    const yesterdayNotifs: any[] = [];
    const thisWeekNotifs: any[] = [];
    const olderNotifs: any[] = [];

    let filteredNotifs = notifications;
    
    // Filter by type if not 'all'
    if (selectedTab !== 'all') {
      filteredNotifs = notifications.filter(n => n.type?.toLowerCase() === selectedTab);
    }

    filteredNotifs.forEach(notif => {
      const notifDate = new Date(notif.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        todayNotifs.push(notif);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        yesterdayNotifs.push(notif);
      } else if (notifDate >= weekAgo) {
        thisWeekNotifs.push(notif);
      } else {
        olderNotifs.push(notif);
      }
    });

    const groups: NotificationGroup[] = [];
    if (todayNotifs.length > 0) groups.push({ title: 'Hôm nay', data: todayNotifs });
    if (yesterdayNotifs.length > 0) groups.push({ title: 'Hôm qua', data: yesterdayNotifs });
    if (thisWeekNotifs.length > 0) groups.push({ title: 'Tuần này', data: thisWeekNotifs });
    if (olderNotifs.length > 0) groups.push({ title: 'Cũ hơn', data: olderNotifs });

    return groups;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'system':
        return { name: 'notifications-outline', color: MODERN_COLORS.primary };
      case 'project':
        return { name: 'folder-outline', color: MODERN_COLORS.warning };
      case 'task':
        return { name: 'checkmark-circle-outline', color: MODERN_COLORS.success };
      case 'message':
        return { name: 'chatbubble-outline', color: MODERN_COLORS.secondary };
      default:
        return { name: 'information-circle-outline', color: MODERN_COLORS.textSecondary };
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const icon = getNotificationIcon(item.type);
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isUnread && styles.notificationCardUnread,
        ]}
        onPress={() => handleNotificationPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          
          <Text style={styles.notificationTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: NotificationGroup }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{section.data.length}</Text>
      </View>
    </View>
  );

  const renderTabButton = (type: NotificationType, label: string, icon: string) => {
    const isActive = selectedTab === type;
    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          isActive && styles.tabButtonActive,
        ]}
        onPress={() => setSelectedTab(type)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={icon as any} 
          size={18} 
          color={isActive ? MODERN_COLORS.primary : MODERN_COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabButtonText,
          isActive && styles.tabButtonTextActive,
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sections = groupedNotifications();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={MODERN_COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllRead}
            >
              <Ionicons name="checkmark-done-outline" size={18} color={MODERN_COLORS.primary} />
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <View style={styles.unreadBanner}>
            <Ionicons name="notifications-outline" size={20} color={MODERN_COLORS.primary} />
            <Text style={styles.unreadBannerText}>
              Bạn có {unreadCount} thông báo chưa đọc
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('all', 'Tất cả', 'apps-outline')}
        {renderTabButton('system', 'Hệ thống', 'notifications-outline')}
        {renderTabButton('project', 'Dự án', 'folder-outline')}
        {renderTabButton('task', 'Công việc', 'checkmark-circle-outline')}
        {renderTabButton('message', 'Tin nhắn', 'chatbubble-outline')}
      </View>

      {/* Notifications List */}
      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={MODERN_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Không có thông báo</Text>
          <Text style={styles.emptySubtitle}>
            {selectedTab === 'all' 
              ? 'Bạn chưa có thông báo nào'
              : `Không có thông báo ${selectedTab === 'system' ? 'hệ thống' : selectedTab === 'project' ? 'dự án' : selectedTab === 'task' ? 'công việc' : 'tin nhắn'}`
            }
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNotification}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[MODERN_COLORS.primary]}
              tintColor={MODERN_COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  header: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xxs,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    backgroundColor: MODERN_COLORS.primaryBg,
    borderRadius: MODERN_RADIUS.full,
  },
  markAllText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.primary,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.primaryBg,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
  },
  unreadBannerText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
    gap: MODERN_SPACING.xs,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xxs,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
  },
  tabButtonActive: {
    backgroundColor: MODERN_COLORS.primaryBg,
  },
  tabButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  listContent: {
    paddingVertical: MODERN_SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.background,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  sectionBadge: {
    backgroundColor: MODERN_COLORS.divider,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xxs,
    borderRadius: MODERN_RADIUS.full,
  },
  sectionBadgeText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    marginHorizontal: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    ...MODERN_SHADOWS.sm,
  },
  notificationCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: MODERN_COLORS.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: MODERN_SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.xxs,
  },
  notificationTitle: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.primary,
  },
  notificationMessage: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: MODERN_SPACING.xs,
  },
  notificationTime: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MODERN_SPACING.xl,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: 'center',
  },
});
