/**
 * CRM Notifications Screen Component
 * ===================================
 *
 * Màn hình hiển thị thông báo từ Perfex CRM
 *
 * @author AI Assistant
 * @date 14/01/2026
 */

import { Container } from "@/components/ui/container";
import { Loader } from "@/components/ui/loader";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePerfexNotifications } from "@/hooks/usePerfexNotifications";
import {
    PerfexNotification,
    PerfexNotificationType,
} from "@/services/perfexNotificationService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ==================== TYPES ====================

interface NotificationItemProps {
  notification: PerfexNotification;
  onPress: (notification: PerfexNotification) => void;
  onMarkAsRead: (id: string) => void;
}

// ==================== ICON MAPPING ====================

const getNotificationIcon = (
  type: PerfexNotificationType
): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  const iconMap: Record<
    PerfexNotificationType,
    { name: keyof typeof Ionicons.glyphMap; color: string }
  > = {
    project_created: { name: "folder-open", color: "#4CAF50" },
    project_updated: { name: "create", color: "#2196F3" },
    project_completed: { name: "checkmark-circle", color: "#4CAF50" },
    task_assigned: { name: "clipboard", color: "#FF9800" },
    task_completed: { name: "checkbox", color: "#4CAF50" },
    task_comment: { name: "chatbubble", color: "#9C27B0" },
    invoice_created: { name: "document-text", color: "#607D8B" },
    invoice_paid: { name: "wallet", color: "#4CAF50" },
    estimate_created: { name: "calculator", color: "#795548" },
    estimate_accepted: { name: "thumbs-up", color: "#4CAF50" },
    estimate_declined: { name: "thumbs-down", color: "#F44336" },
    contract_signed: { name: "document", color: "#3F51B5" },
    ticket_created: { name: "ticket", color: "#E91E63" },
    ticket_reply: { name: "chatbubbles", color: "#00BCD4" },
    lead_created: { name: "person-add", color: "#FF5722" },
    proposal_created: { name: "newspaper", color: "#8BC34A" },
    announcement: { name: "megaphone", color: "#F44336" },
    reminder: { name: "alarm", color: "#FF9800" },
    custom: { name: "notifications", color: "#9E9E9E" },
  };

  return iconMap[type] || iconMap.custom;
};

const getTypeLabel = (type: PerfexNotificationType): string => {
  const labels: Record<PerfexNotificationType, string> = {
    project_created: "Dự án mới",
    project_updated: "Cập nhật dự án",
    project_completed: "Hoàn thành dự án",
    task_assigned: "Task được giao",
    task_completed: "Task hoàn thành",
    task_comment: "Bình luận",
    invoice_created: "Hóa đơn mới",
    invoice_paid: "Thanh toán",
    estimate_created: "Báo giá mới",
    estimate_accepted: "Duyệt báo giá",
    estimate_declined: "Từ chối báo giá",
    contract_signed: "Ký hợp đồng",
    ticket_created: "Ticket mới",
    ticket_reply: "Phản hồi ticket",
    lead_created: "Lead mới",
    proposal_created: "Đề xuất mới",
    announcement: "Thông báo",
    reminder: "Nhắc nhở",
    custom: "Khác",
  };

  return labels[type] || "Thông báo";
};

// ==================== NOTIFICATION ITEM ====================

const NotificationItem: React.FC<NotificationItemProps> = React.memo(
  ({ notification, onPress, onMarkAsRead }) => {
    const textColor = useThemeColor({}, "text");
    const cardBackground = useThemeColor({}, "surface");
    const subtextColor = useThemeColor({}, "textMuted");

    const isUnread = notification.isread === "0";
    const icon = getNotificationIcon(notification.type);

    const formattedDate = useMemo(() => {
      try {
        const date = new Date(notification.date);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch {
        return notification.date;
      }
    }, [notification.date]);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: cardBackground },
          isUnread && styles.unreadItem,
        ]}
        onPress={() => onPress(notification)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: icon.color + "20" }]}
        >
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.typeLabel, { color: icon.color }]}>
              {getTypeLabel(notification.type)}
            </Text>
            <Text style={[styles.dateText, { color: subtextColor }]}>
              {formattedDate}
            </Text>
          </View>

          <Text
            style={[
              styles.titleText,
              { color: textColor },
              isUnread && styles.unreadText,
            ]}
            numberOfLines={2}
          >
            {notification.title}
          </Text>

          {notification.message && (
            <Text
              style={[styles.messageText, { color: subtextColor }]}
              numberOfLines={2}
            >
              {notification.message}
            </Text>
          )}
        </View>

        {/* Unread indicator */}
        {isUnread && <View style={styles.unreadDot} />}

        {/* Mark as read button */}
        {isUnread && (
          <Pressable
            style={styles.markReadButton}
            onPress={() => onMarkAsRead(notification.id)}
            hitSlop={10}
          >
            <Ionicons name="checkmark" size={18} color={subtextColor} />
          </Pressable>
        )}
      </TouchableOpacity>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

// ==================== MAIN COMPONENT ====================

export function CrmNotificationsScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");

  const {
    notifications,
    unreadCount,
    loading,
    error,
    isPolling,
    refresh,
    markAsRead,
    markAllAsRead,
  } = usePerfexNotifications({
    autoPolling: true,
    pollingInterval: 60000,
  });

  // ==================== HANDLERS ====================

  const handleNotificationPress = useCallback(
    (notification: PerfexNotification) => {
      // Mark as read
      if (notification.isread === "0") {
        markAsRead(notification.id);
      }

      // Navigate based on type
      if (notification.link) {
        // Could open in WebView or external browser
        console.log("Open link:", notification.link);
      }

      // Or navigate to detail screen
      // router.push({
      //   pathname: '/notification-detail',
      //   params: { id: notification.id }
      // });
    },
    [markAsRead]
  );

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
    },
    [markAsRead]
  );

  // ==================== RENDER HELPERS ====================

  const renderItem = useCallback(
    ({ item }: { item: PerfexNotification }) => (
      <NotificationItem
        notification={item}
        onPress={handleNotificationPress}
        onMarkAsRead={handleMarkAsRead}
      />
    ),
    [handleNotificationPress, handleMarkAsRead]
  );

  const keyExtractor = useCallback((item: PerfexNotification) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
        <Text style={[styles.emptyText, { color: textColor }]}>
          Không có thông báo nào
        </Text>
        <Text style={styles.emptySubtext}>
          Thông báo từ CRM sẽ hiển thị ở đây
        </Text>
      </View>
    ),
    [textColor]
  );

  const ListHeaderComponent = useCallback(() => {
    if (unreadCount === 0) return null;

    return (
      <View style={styles.headerContainer}>
        <Text style={[styles.unreadBadge, { backgroundColor: primaryColor }]}>
          {unreadCount} thông báo mới
        </Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={[styles.markAllText, { color: primaryColor }]}>
            Đánh dấu tất cả đã đọc
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [unreadCount, primaryColor, markAllAsRead]);

  // ==================== MAIN RENDER ====================

  if (loading && notifications.length === 0) {
    return (
      <Container style={[styles.container, { backgroundColor }]}>
        <Loader />
      </Container>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <Container style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={64} color="#F44336" />
          <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { backgroundColor }]}>
      {/* Status indicator */}
      {isPolling && (
        <View style={styles.pollingIndicator}>
          <View style={styles.pollingDot} />
          <Text style={styles.pollingText}>Đang theo dõi CRM</Text>
        </View>
      )}

      {/* Notification list */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[primaryColor]}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Container>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  unreadBadge: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "500",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
    lineHeight: 20,
  },
  unreadText: {
    fontWeight: "700",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    position: "absolute",
    top: 14,
    right: 14,
  },
  markReadButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 4,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  pollingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#E8F5E9",
  },
  pollingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  pollingText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
});

export default CrmNotificationsScreen;
