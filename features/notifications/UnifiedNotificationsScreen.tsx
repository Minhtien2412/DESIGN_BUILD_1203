/**
 * Unified Notifications Screen
 * =============================
 * 
 * Hiển thị thông báo đồng bộ từ cả CRM và App Backend
 * 
 * Features:
 * - Tabs: Tất cả | CRM | Hệ thống
 * - Date grouping
 * - Source badge (CRM / APP)
 * - Auto-sync every 5 minutes
 * - Pull to refresh
 * - Mark read/unread
 * 
 * @author ThietKeResort Team
 * @created 2025-01-08
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import { useUnifiedNotifications } from '@/hooks/useNotifications';
import { UnifiedNotification } from '@/services/notificationSyncService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type TabType = 'all' | 'crm' | 'app';

interface NotificationGroup {
  title: string;
  data: UnifiedNotification[];
}

export default function UnifiedNotificationsScreen() {
  const {
    notifications,
    crmNotifications,
    appNotifications,
    unreadCount,
    crmUnreadCount,
    appUnreadCount,
    loading,
    syncing,
    isOffline,
    lastSyncTime,
    sync,
    markAsRead,
    markAllAsRead,
  } = useUnifiedNotifications({
    autoSync: true,
    syncIntervalMs: 5 * 60 * 1000, // 5 phút
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const router = useRouter();

  // Get notifications based on selected tab
  const getFilteredNotifications = () => {
    switch (selectedTab) {
      case 'crm':
        return crmNotifications;
      case 'app':
        return appNotifications;
      default:
        return notifications;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sync(true);
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markAllAsRead();
  };

  const handleNotificationPress = async (item: UnifiedNotification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markAsRead(item.id);
    
    // Navigate based on notification type and related data
    const relatedType = item.relatedType?.toLowerCase();
    const relatedId = item.relatedId;
    
    if (relatedType === 'task' && relatedId) {
      router.push(`/tasks/${relatedId}` as any);
    } else if (relatedType === 'project' && relatedId) {
      router.push(`/projects/${relatedId}` as any);
    } else if (relatedType === 'ticket' && relatedId) {
      router.push(`/tickets/${relatedId}` as any);
    } else if (relatedType === 'chat' && relatedId) {
      router.push({ pathname: '/chat/[chatId]', params: { chatId: String(relatedId) } } as any);
    } else if (relatedType === 'payment' && relatedId) {
      router.push(`/payments/${relatedId}` as any);
    }
  };

  const handleNotificationLongPress = (item: UnifiedNotification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      item.title,
      `Nguồn: ${item.source === 'CRM' ? 'CRM' : 'Hệ thống'}\n\nChọn hành động:`,
      [
        {
          text: item.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc',
          onPress: () => markAsRead(item.id),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  // Group notifications by date
  const groupedNotifications = (): NotificationGroup[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayNotifs: UnifiedNotification[] = [];
    const yesterdayNotifs: UnifiedNotification[] = [];
    const thisWeekNotifs: UnifiedNotification[] = [];
    const olderNotifs: UnifiedNotification[] = [];

    const filteredNotifs = getFilteredNotifications();

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
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Chưa đồng bộ';
    const date = new Date(dateString);
    return `Đồng bộ: ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'TASK':
        return { name: 'checkmark-circle-outline', color: MODERN_COLORS.success };
      case 'PROJECT':
        return { name: 'folder-outline', color: MODERN_COLORS.warning };
      case 'TICKET':
        return { name: 'help-buoy-outline', color: MODERN_COLORS.error };
      case 'MESSAGE':
        return { name: 'chatbubble-outline', color: MODERN_COLORS.secondary };
      case 'PAYMENT':
        return { name: 'card-outline', color: '#22c55e' };
      case 'WARNING':
        return { name: 'warning-outline', color: MODERN_COLORS.warning };
      case 'ERROR':
        return { name: 'alert-circle-outline', color: MODERN_COLORS.error };
      case 'SUCCESS':
        return { name: 'checkmark-done-outline', color: MODERN_COLORS.success };
      default:
        return { name: 'information-circle-outline', color: MODERN_COLORS.primary };
    }
  };

  const getSourceColor = (source: 'CRM' | 'APP') => {
    return source === 'CRM' ? '#8b5cf6' : MODERN_COLORS.primary;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return MODERN_COLORS.error;
      case 'HIGH':
        return MODERN_COLORS.warning;
      case 'MEDIUM':
        return MODERN_COLORS.secondary;
      default:
        return MODERN_COLORS.textSecondary;
    }
  };

  const renderNotification = ({ item }: { item: UnifiedNotification }) => {
    const icon = getNotificationIcon(item.type);
    const isUnread = !item.isRead;
    const sourceColor = getSourceColor(item.source);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isUnread && styles.notificationCardUnread,
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleNotificationLongPress(item)}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.sourceBadge, { backgroundColor: sourceColor + '20' }]}>
                <Text style={[styles.sourceBadgeText, { color: sourceColor }]}>
                  {item.source}
                </Text>
              </View>
            </View>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {formatTime(item.createdAt)}
            </Text>
            {item.priority !== 'LOW' && item.priority !== 'MEDIUM' && (
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority === 'URGENT' ? 'Khẩn cấp' : 'Quan trọng'}
                </Text>
              </View>
            )}
            <Ionicons 
              name="chevron-forward" 
              size={14} 
              color={MODERN_COLORS.textSecondary} 
              style={styles.chevronIcon}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: NotificationGroup }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>({section.data.length})</Text>
    </View>
  );

  const renderTab = (tab: TabType, label: string, count: number) => {
    const isActive = selectedTab === tab;
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedTab(tab);
        }}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
              {count > 99 ? '99+' : count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="notifications-off-outline" 
        size={64} 
        color={MODERN_COLORS.textSecondary} 
      />
      <Text style={styles.emptyTitle}>Không có thông báo</Text>
      <Text style={styles.emptySubtitle}>
        {isOffline ? 'Bạn đang offline. Kết nối mạng để đồng bộ thông báo mới.' : 
          'Các thông báo mới từ CRM và hệ thống sẽ xuất hiện ở đây.'}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh-outline" size={20} color={MODERN_COLORS.primary} />
        <Text style={styles.refreshButtonText}>Làm mới</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Đang đồng bộ thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <View style={styles.headerActions}>
            {syncing && (
              <ActivityIndicator 
                size="small" 
                color={MODERN_COLORS.primary} 
                style={styles.syncingIndicator}
              />
            )}
            {unreadCount > 0 && (
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={handleMarkAllRead}
              >
                <Ionicons name="checkmark-done" size={20} color={MODERN_COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Sync Status */}
        <View style={styles.syncStatus}>
          <Text style={styles.syncStatusText}>
            {formatLastSync(lastSyncTime)}
          </Text>
          {isOffline && (
            <View style={styles.offlineBadge}>
              <Ionicons name="cloud-offline-outline" size={14} color={MODERN_COLORS.warning} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {renderTab('all', 'Tất cả', unreadCount)}
          {renderTab('crm', 'CRM', crmUnreadCount)}
          {renderTab('app', 'Hệ thống', appUnreadCount)}
        </View>
      </View>

      {/* Notification List */}
      <SectionList
        sections={groupedNotifications()}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={MODERN_COLORS.primary}
            colors={[MODERN_COLORS.primary]}
          />
        }
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: MODERN_SPACING.md,
  },
  loadingText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
  },
  header: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.xs,
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
  },
  syncingIndicator: {
    marginRight: MODERN_SPACING.xs,
  },
  markAllButton: {
    padding: MODERN_SPACING.xs,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.sm,
  },
  syncStatusText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MODERN_COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.xs,
  },
  offlineText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.warning,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: MODERN_SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    gap: MODERN_SPACING.xs,
  },
  tabActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  tabText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: MODERN_COLORS.error + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.full,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#ffffff40',
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.error,
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: MODERN_SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  sectionCount: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    marginLeft: MODERN_SPACING.xs,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
    gap: MODERN_SPACING.md,
  },
  notificationCardUnread: {
    backgroundColor: MODERN_COLORS.primary + '08',
    borderLeftWidth: 3,
    borderLeftColor: MODERN_COLORS.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: MODERN_SPACING.sm,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
  },
  notificationTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    flex: 1,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.xs,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: MODERN_COLORS.primary,
  },
  notificationMessage: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  priorityBadge: {
    marginLeft: MODERN_SPACING.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.xs,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: MODERN_SPACING.xl * 2,
    paddingHorizontal: MODERN_SPACING.lg,
    gap: MODERN_SPACING.md,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.primary + '15',
    borderRadius: MODERN_RADIUS.full,
    marginTop: MODERN_SPACING.md,
  },
  refreshButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.primary,
  },
});
