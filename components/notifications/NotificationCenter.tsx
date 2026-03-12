/**
 * Notification Center - Zalo-style
 * Push notifications, In-app alerts, Badge management
 */

import { MODERN_SHADOWS } from "@/constants/modern-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

// Lazy load expo-notifications to avoid Expo Go SDK 53+ crash
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[NotificationCenter] expo-notifications not available");
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Notification types
export type NotificationType =
  | "message"
  | "call_missed"
  | "call_incoming"
  | "project_update"
  | "task_assigned"
  | "task_completed"
  | "payment_received"
  | "system"
  | "promotion";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: number;
  isRead: boolean;
  avatar?: string;
  actionUrl?: string;
  priority?: "high" | "normal" | "low";
}

// Icon mapping
const NOTIFICATION_ICONS: Record<
  NotificationType,
  { name: string; color: string; bg: string }
> = {
  message: { name: "chatbubble", color: "#0D9488", bg: "#CCFBF1" },
  call_missed: { name: "call", color: "#EF4444", bg: "#FEE2E2" },
  call_incoming: { name: "call", color: "#10B981", bg: "#D1FAE5" },
  project_update: { name: "folder", color: "#F59E0B", bg: "#FEF3C7" },
  task_assigned: { name: "checkbox", color: "#8B5CF6", bg: "#EDE9FE" },
  task_completed: { name: "checkmark-circle", color: "#10B981", bg: "#D1FAE5" },
  payment_received: { name: "card", color: "#10B981", bg: "#D1FAE5" },
  system: { name: "settings", color: "#6B7280", bg: "#F3F4F6" },
  promotion: { name: "gift", color: "#EC4899", bg: "#FCE7F3" },
};

// ==================== IN-APP NOTIFICATION TOAST ====================

interface ToastProps {
  notification: AppNotification;
  onPress?: () => void;
  onDismiss?: () => void;
  duration?: number;
}

export function NotificationToast({
  notification,
  onPress,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, "background");

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss?.());
  };

  const icon = NOTIFICATION_ICONS[notification.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: background,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable style={styles.toastContent} onPress={onPress}>
        {notification.avatar ? (
          <Image
            source={{ uri: notification.avatar }}
            style={styles.toastAvatar}
          />
        ) : (
          <View style={[styles.toastIcon, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name as any} size={20} color={icon.color} />
          </View>
        )}

        <View style={styles.toastBody}>
          <Text style={styles.toastTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.toastMessage} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        <Pressable onPress={handleDismiss} style={styles.toastClose}>
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

// ==================== NOTIFICATION LIST ITEM ====================

interface NotificationItemProps {
  item: AppNotification;
  onPress?: (item: AppNotification) => void;
  onDelete?: (id: string) => void;
}

export function NotificationItem({
  item,
  onPress,
  onDelete,
}: NotificationItemProps) {
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const [showDelete, setShowDelete] = useState(false);

  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");

  const icon = NOTIFICATION_ICONS[item.type];

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <View style={styles.itemWrapper}>
      {/* Delete button (revealed on swipe) */}
      <Pressable
        style={[styles.deleteButton, { opacity: showDelete ? 1 : 0 }]}
        onPress={() => onDelete?.(item.id)}
      >
        <Ionicons name="trash" size={24} color="#fff" />
      </Pressable>

      <Animated.View
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.isRead ? background : surface,
            transform: [{ translateX: swipeAnim }],
          },
        ]}
      >
        <Pressable style={styles.itemContent} onPress={() => onPress?.(item)}>
          {/* Unread indicator */}
          {!item.isRead && <View style={styles.unreadDot} />}

          {/* Avatar or Icon */}
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.itemAvatar} />
          ) : (
            <View style={[styles.itemIcon, { backgroundColor: icon.bg }]}>
              <Ionicons name={icon.name as any} size={24} color={icon.color} />
            </View>
          )}

          {/* Content */}
          <View style={styles.itemBody}>
            <View style={styles.itemHeader}>
              <Text
                style={[
                  styles.itemTitle,
                  { color: text },
                  !item.isRead && styles.itemTitleUnread,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.itemTime, { color: textMuted }]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
            <Text
              style={[styles.itemMessage, { color: textMuted }]}
              numberOfLines={2}
            >
              {item.body}
            </Text>
          </View>

          {/* Priority badge */}
          {item.priority === "high" && (
            <View style={styles.priorityBadge}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ==================== NOTIFICATION CENTER SCREEN ====================

interface NotificationCenterProps {
  notifications: AppNotification[];
  onNotificationPress?: (notification: AppNotification) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  onDeleteNotification?: (id: string) => void;
}

export function NotificationCenter({
  notifications,
  onNotificationPress,
  onMarkAllRead,
  onClearAll,
  onDeleteNotification,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const primary = useThemeColor({}, "primary");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const FilterTab = ({
    type,
    label,
  }: {
    type: NotificationType | "all";
    label: string;
  }) => (
    <Pressable
      style={[
        styles.filterTab,
        filter === type && { backgroundColor: primary, borderColor: primary },
      ]}
      onPress={() => setFilter(type)}
    >
      <Text
        style={[styles.filterTabText, filter === type && { color: "#fff" }]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={64} color={textMuted} />
      <Text style={[styles.emptyTitle, { color: text }]}>
        Không có thông báo
      </Text>
      <Text style={[styles.emptyMessage, { color: textMuted }]}>
        Bạn sẽ nhận được thông báo khi có cập nhật mới
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: text }]}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <Pressable style={styles.headerBtn} onPress={onMarkAllRead}>
              <Ionicons name="checkmark-done" size={22} color={primary} />
            </Pressable>
          )}
          <Pressable style={styles.headerBtn} onPress={onClearAll}>
            <Ionicons name="trash-outline" size={22} color={textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={
            [
              { type: "all", label: "Tất cả" },
              { type: "message", label: "Tin nhắn" },
              { type: "call_missed", label: "Cuộc gọi" },
              { type: "project_update", label: "Dự án" },
              { type: "task_assigned", label: "Tasks" },
              { type: "system", label: "Hệ thống" },
            ] as { type: NotificationType | "all"; label: string }[]
          }
          keyExtractor={(item) => item.type}
          renderItem={({ item }) => <FilterTab {...item} />}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onPress={onNotificationPress}
            onDelete={onDeleteNotification}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ==================== PUSH NOTIFICATION SETUP ====================

export async function setupPushNotifications() {
  if (!Notifications) {
    console.log("[Notifications] Not available in Expo Go");
    return null;
  }

  // Configure notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission denied");
    return null;
  }

  // Get push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: "your-project-id", // Replace with actual project ID
  });

  return token.data;
}

// Schedule local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  trigger?: any,
) {
  if (!Notifications) {
    console.log("[Notifications] Not available in Expo Go");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      badge: 1,
    },
    trigger: trigger || null, // null = immediate
  });
}

// Update badge count
export async function updateBadgeCount(count: number) {
  if (!Notifications) return;
  await Notifications.setBadgeCountAsync(count);
}

const styles = StyleSheet.create({
  // Toast styles
  toast: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 16,
    ...MODERN_SHADOWS.lg,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  toastAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  toastIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  toastBody: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  toastMessage: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  toastClose: {
    padding: 4,
  },

  // Notification item styles
  itemWrapper: {
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  unreadDot: {
    position: "absolute",
    left: 0,
    top: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0D9488",
  },
  itemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  itemBody: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  itemTitleUnread: {
    fontWeight: "600",
  },
  itemTime: {
    fontSize: 12,
  },
  itemMessage: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  priorityBadge: {
    marginLeft: 8,
  },

  // Container styles
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerBtn: {
    padding: 4,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
