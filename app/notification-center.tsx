/**
 * Notification Center Screen
 * ============================
 *
 * Danh sách thông báo đầy đủ, lọc theo category, "Mark all read".
 * Sử dụng NotificationControllerContext.
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

import {
    useNotificationCenter,
    useNotificationController,
} from "@/context/NotificationControllerContext";
import type {
    NotificationCategory,
    NotificationItem,
} from "@/services/notification-system";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// CATEGORY FILTER TABS
// ============================================================================

const CATEGORY_FILTERS: {
  key: NotificationCategory | "all";
  label: string;
  icon: string;
}[] = [
  { key: "all", label: "Tất cả", icon: "notifications" },
  { key: "chat", label: "Tin nhắn", icon: "chatbubbles" },
  { key: "booking", label: "Đặt lịch", icon: "calendar" },
  { key: "project", label: "Dự án", icon: "briefcase" },
  { key: "payment", label: "Thanh toán", icon: "card" },
  { key: "system", label: "Hệ thống", icon: "settings" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function NotificationCenterScreen() {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationCenter();

  const { isWsConnected } = useNotificationController();

  const [activeFilter, setActiveFilter] = useState<
    NotificationCategory | "all"
  >("all");

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter((n) => n.category === activeFilter);
  }, [notifications, activeFilter]);

  // ---- Handlers ----

  const handlePress = useCallback(
    (item: NotificationItem) => {
      if (!item.read) {
        markAsRead(item.id);
      }
      if (item.deeplink) {
        router.push(item.deeplink as any);
      }
    },
    [markAsRead],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification(id);
    },
    [deleteNotification],
  );

  // ---- Renderers ----

  const renderCategoryTab = useCallback(
    ({ key, label, icon }: (typeof CATEGORY_FILTERS)[0]) => (
      <Pressable
        key={key}
        style={[
          styles.filterTab,
          activeFilter === key && styles.filterTabActive,
        ]}
        onPress={() => setActiveFilter(key)}
      >
        <Ionicons
          name={icon as any}
          size={16}
          color={activeFilter === key ? "#fff" : "#666"}
        />
        <Text
          style={[
            styles.filterTabText,
            activeFilter === key && styles.filterTabTextActive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    ),
    [activeFilter],
  );

  const renderNotification = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <Pressable
        style={[styles.notifItem, !item.read && styles.notifItemUnread]}
        onPress={() => handlePress(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.notifIcon}>
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={24}
            color={getSeverityColor(item.severity)}
          />
        </View>
        <View style={styles.notifContent}>
          <Text
            style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.notifBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </Pressable>
    ),
    [handlePress, handleDelete],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Không có thông báo nào</Text>
      </View>
    ),
    [],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Thông báo",
          headerRight: () =>
            unreadCount > 0 ? (
              <Pressable onPress={markAllAsRead} style={styles.markAllBtn}>
                <Text style={styles.markAllText}>Đọc hết</Text>
              </Pressable>
            ) : null,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Connection status banner */}
        {!isWsConnected && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={14} color="#F59E0B" />
            <Text style={styles.offlineBannerText}>
              Đang kết nối lại... Kéo xuống để làm mới
            </Text>
          </View>
        )}

        {/* Category filter tabs */}
        <View style={styles.filterRow}>
          <FlatList
            horizontal
            data={CATEGORY_FILTERS}
            renderItem={({ item }) => renderCategoryTab(item)}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          />
        </View>

        {/* Notification list */}
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshNotifications}
            />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    chat: "chatbubbles",
    booking: "calendar",
    call: "call",
    project: "briefcase",
    task: "checkbox",
    payment: "card",
    system: "settings",
    security: "shield-checkmark",
    social: "people",
    crm: "business",
    report: "document-text",
    delivery: "car",
    meeting: "videocam",
    livestream: "radio",
  };
  return (iconMap[category] || "notifications") as string;
}

function getSeverityColor(severity: string): string {
  const colorMap: Record<string, string> = {
    info: "#0068FF",
    success: "#0D9488",
    warning: "#F59E0B",
    error: "#EF4444",
    critical: "#DC2626",
  };
  return colorMap[severity] || "#666";
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  filterRow: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: "#0D9488",
  },
  filterTabText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: "#fff",
  },
  listContent: {
    flexGrow: 1,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  notifItemUnread: {
    backgroundColor: "#F0FAF9",
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  notifTitleUnread: {
    fontWeight: "700",
    color: "#1A1A1A",
  },
  notifBody: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: "#999",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0D9488",
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 72,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  markAllBtn: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    color: "#0D9488",
    fontWeight: "600",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  offlineBannerText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
  },
});
