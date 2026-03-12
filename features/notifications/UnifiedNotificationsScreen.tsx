/**
 * Unified Notifications Screen - Modern Redesign
 * ================================================
 *
 * Hiện đại - Căn chỉnh chuẩn - Xác thực máy chủ khi mở thông báo
 *
 * Features:
 * - Tabs: Tất cả | Tin nhắn | Cuộc gọi | CRM | Hệ thống
 * - Date grouping with modern section dividers
 * - Server-verified notification open (ack before navigation)
 * - Rich notification cards with priority indicators
 * - Animated interactions & smooth transitions
 * - Source badges (CRM / APP)
 * - Auto-sync every 5 minutes + pull to refresh
 * - Real-time WebSocket updates
 *
 * @author ThietKeResort Team
 * @created 2025-01-08
 * @updated 2026-06-01 - Modern redesign + server verification
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-theme";
import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { useUnifiedNotifications } from "@/hooks/useNotifications";
import { handleNotificationItemPress } from "@/services/notificationNavigator";
import { remoteAck, remoteMarkRead } from "@/services/notificationsApi";
import { UnifiedNotification } from "@/services/notificationSyncService";
import { getAccessToken } from "@/services/token.service";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ==================== TYPES ====================

type TabType = "all" | "messages" | "calls" | "crm" | "app";
type CommunicationTab = "messages" | "calls" | "meetings";

interface NotificationGroup {
  title: string;
  data: UnifiedNotification[];
}

/** Server verification result returned after opening a notification */
interface VerifyResult {
  verified: boolean;
  error?: string;
}

// ==================== CONSTANTS ====================

const TABS: {
  key: TabType;
  label: string;
  icon: string;
  iconActive: string;
}[] = [
  { key: "all", label: "Tất cả", icon: "grid-outline", iconActive: "grid" },
  {
    key: "messages",
    label: "Tin nhắn",
    icon: "chatbubbles-outline",
    iconActive: "chatbubbles",
  },
  { key: "calls", label: "Cuộc gọi", icon: "call-outline", iconActive: "call" },
  {
    key: "crm",
    label: "CRM",
    icon: "briefcase-outline",
    iconActive: "briefcase",
  },
  { key: "app", label: "Hệ thống", icon: "cog-outline", iconActive: "cog" },
];

/** Maps notification type → icon name + color */
const ICON_MAP: Record<
  string,
  { icon: string; iconFilled: string; color: string }
> = {
  task: {
    icon: "checkmark-circle-outline",
    iconFilled: "checkmark-circle",
    color: "#22C55E",
  },
  project: { icon: "folder-outline", iconFilled: "folder", color: "#F59E0B" },
  ticket: {
    icon: "help-buoy-outline",
    iconFilled: "help-buoy",
    color: "#EF4444",
  },
  message: {
    icon: "chatbubble-outline",
    iconFilled: "chatbubble",
    color: "#0D9488",
  },
  chat: {
    icon: "chatbubbles-outline",
    iconFilled: "chatbubbles",
    color: "#0D9488",
  },
  call: { icon: "call-outline", iconFilled: "call", color: "#F97316" },
  meeting: {
    icon: "videocam-outline",
    iconFilled: "videocam",
    color: "#EC4899",
  },
  order: { icon: "cart-outline", iconFilled: "cart", color: "#8B5CF6" },
  payment: { icon: "card-outline", iconFilled: "card", color: "#10B981" },
  construction: {
    icon: "construct-outline",
    iconFilled: "construct",
    color: "#F97316",
  },
  warning: { icon: "warning-outline", iconFilled: "warning", color: "#F59E0B" },
  error: {
    icon: "alert-circle-outline",
    iconFilled: "alert-circle",
    color: "#EF4444",
  },
  success: {
    icon: "checkmark-done-outline",
    iconFilled: "checkmark-done",
    color: "#22C55E",
  },
  info: {
    icon: "information-circle-outline",
    iconFilled: "information-circle",
    color: "#0D9488",
  },
  system: {
    icon: "notifications-outline",
    iconFilled: "notifications",
    color: "#64748B",
  },
};

const PRIORITY_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  URGENT: { label: "Khẩn cấp", color: "#DC2626", bg: "#FEE2E2" },
  HIGH: { label: "Quan trọng", color: "#F59E0B", bg: "#FEF3C7" },
  MEDIUM: { label: "Bình thường", color: "#6B7280", bg: "#F3F4F6" },
  LOW: { label: "", color: "", bg: "" },
};

// ==================== COMPONENT ====================

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
    syncIntervalMs: 5 * 60 * 1000,
  });

  const { syncWithNotifications, badges } = useUnifiedBadge();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("all");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const router = useRouter();

  // Animated banner value
  const bannerAnim = useRef(new Animated.Value(0)).current;

  // Pulse the unread banner when unreadCount > 0
  const pulseUnreadBanner = useCallback(() => {
    Animated.sequence([
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(bannerAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bannerAnim]);

  // ==================== FILTERS ====================

  const messageNotifs = useMemo(
    () =>
      notifications.filter(
        (n) => n.type === "MESSAGE" || n.relatedType === "chat",
      ),
    [notifications],
  );

  const callNotifs = useMemo(
    () =>
      notifications.filter(
        (n) => n.type === "CALL" || n.relatedType === "call",
      ),
    [notifications],
  );

  const getTabCount = (tab: TabType): number => {
    switch (tab) {
      case "all":
        return unreadCount;
      case "messages":
        return badges.messages + messageNotifs.filter((n) => !n.isRead).length;
      case "calls":
        return badges.missedCalls + callNotifs.filter((n) => !n.isRead).length;
      case "crm":
        return crmUnreadCount;
      case "app":
        return appUnreadCount;
      default:
        return 0;
    }
  };

  const getFilteredNotifications = (): UnifiedNotification[] => {
    switch (selectedTab) {
      case "messages":
        return messageNotifs;
      case "calls":
        return callNotifs;
      case "crm":
        return crmNotifications;
      case "app":
        return appNotifications;
      default:
        return notifications;
    }
  };

  // ==================== SERVER-VERIFIED OPEN ====================

  /**
   * Verify notification with server: ack + markRead, then navigate.
   * Shows a loading indicator on the card while verifying.
   */
  const verifyAndOpenNotification = useCallback(
    async (item: UnifiedNotification): Promise<VerifyResult> => {
      try {
        const token = await getAccessToken();
        if (!token) {
          // No token — proceed without server verification
          return { verified: false, error: "no_token" };
        }
        // Run ack + mark-read in parallel
        await Promise.all([
          remoteAck({ token, ids: [item.id] }).catch(() => null),
          remoteMarkRead({ token, ids: [item.id] }).catch(() => null),
        ]);
        return { verified: true };
      } catch {
        // Network error — still allow navigation (graceful degradation)
        return { verified: false, error: "network" };
      }
    },
    [],
  );

  // ==================== HANDLERS ====================

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sync(true);
    pulseUnreadBanner();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markAllAsRead();
    syncWithNotifications(0);
    // Also acknowledge all on server
    const token = await getAccessToken();
    if (token) {
      const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (ids.length > 0) {
        remoteMarkRead({ token, ids, all: true }).catch(() => {});
      }
    }
  };

  const openCommunicationTab = useCallback(
    (tab: CommunicationTab) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: "/(tabs)/communication",
        params: { tab },
      } as any);
    },
    [router],
  );

  const handleNotificationPress = async (item: UnifiedNotification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Show verifying state
    setVerifyingId(item.id);

    // Optimistic local update
    await markAsRead(item.id);
    const newUnreadCount = unreadCount - (item.isRead ? 0 : 1);
    syncWithNotifications(Math.max(0, newUnreadCount));

    // Server verification (runs in background, doesn't block navigation)
    const verifyResult = await verifyAndOpenNotification(item);

    setVerifyingId(null);

    if (!verifyResult.verified) {
      console.log("[Notifications] Server verify skipped:", verifyResult.error);
    }

    // Navigate using the navigator service
    const navResult = handleNotificationItemPress({
      id: item.id,
      type: item.type,
      relatedType: item.relatedType,
      relatedId: item.relatedId,
    });

    console.log(
      "[Notifications] Nav:",
      navResult.destination,
      "| Verified:",
      verifyResult.verified,
    );
  };

  const handleNotificationLongPress = (item: UnifiedNotification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      item.title,
      `Nguồn: ${item.source === "CRM" ? "CRM" : "Hệ thống"}`,
      [
        {
          text: item.isRead ? "Chưa đọc" : "Đã đọc",
          onPress: () => markAsRead(item.id),
        },
        { text: "Hủy", style: "cancel" },
      ],
    );
  };

  // ==================== GROUPING ====================

  const groupedNotifications = (): NotificationGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const buckets: Record<string, UnifiedNotification[]> = {
      today: [],
      yesterday: [],
      week: [],
      older: [],
    };

    for (const notif of getFilteredNotifications()) {
      const d = new Date(notif.createdAt);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) buckets.today.push(notif);
      else if (d.getTime() === yesterday.getTime())
        buckets.yesterday.push(notif);
      else if (d >= weekAgo) buckets.week.push(notif);
      else buckets.older.push(notif);
    }

    const labels: Record<string, string> = {
      today: "Hôm nay",
      yesterday: "Hôm qua",
      week: "Tuần này",
      older: "Trước đó",
    };

    return (["today", "yesterday", "week", "older"] as const)
      .filter((k) => buckets[k].length > 0)
      .map((k) => ({ title: labels[k], data: buckets[k] }));
  };

  // ==================== FORMATTERS ====================

  const formatTime = (dateString: string): string => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins}ph`;
    const hrs = Math.floor(diff / 3_600_000);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(diff / 86_400_000);
    if (days < 7) return `${days}d`;
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatLastSync = (dateString: string | null): string => {
    if (!dateString) return "Chưa đồng bộ";
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (type: string, relatedType?: string) => {
    const key = (relatedType || type || "system").toLowerCase();
    return ICON_MAP[key] || ICON_MAP.system;
  };

  const getSourceStyle = (source: "CRM" | "APP") =>
    source === "CRM"
      ? { color: "#7C3AED", bg: "#EDE9FE" }
      : { color: "#0D9488", bg: "#CCFBF1" };

  // ==================== RENDER ITEMS ====================

  const renderNotification = ({ item }: { item: UnifiedNotification }) => {
    const iconData = getIcon(item.type, item.relatedType);
    const isUnread = !item.isRead;
    const src = getSourceStyle(item.source);
    const priority = PRIORITY_META[item.priority] || PRIORITY_META.LOW;
    const isVerifying = verifyingId === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleNotificationLongPress(item)}
        activeOpacity={0.65}
        delayLongPress={400}
        disabled={isVerifying}
      >
        {/* Left accent bar for unread */}
        {isUnread && <View style={styles.unreadBar} />}

        {/* Icon */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: iconData.color + "14" },
          ]}
        >
          {isVerifying ? (
            <ActivityIndicator size="small" color={iconData.color} />
          ) : (
            <Ionicons
              name={(isUnread ? iconData.iconFilled : iconData.icon) as any}
              size={22}
              color={iconData.color}
            />
          )}
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          {/* Row 1: title + badges */}
          <View style={styles.row1}>
            <Text
              style={[styles.cardTitle, isUnread && styles.cardTitleBold]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={styles.badges}>
              <View style={[styles.srcBadge, { backgroundColor: src.bg }]}>
                <Text style={[styles.srcText, { color: src.color }]}>
                  {item.source}
                </Text>
              </View>
              {isUnread && <View style={styles.dot} />}
            </View>
          </View>

          {/* Row 2: message */}
          <Text style={styles.cardMsg} numberOfLines={2}>
            {item.message}
          </Text>

          {/* Row 3: time + priority + verified icon */}
          <View style={styles.row3}>
            <Ionicons
              name="time-outline"
              size={12}
              color="#9CA3AF"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>

            {priority.label !== "" && (
              <View style={[styles.priBadge, { backgroundColor: priority.bg }]}>
                <View
                  style={[styles.priDot, { backgroundColor: priority.color }]}
                />
                <Text style={[styles.priText, { color: priority.color }]}>
                  {priority.label}
                </Text>
              </View>
            )}

            {/* Server verified indicator */}
            {isVerifying && (
              <View style={styles.verifyingBadge}>
                <ActivityIndicator size={10} color="#0D9488" />
                <Text style={styles.verifyingText}>Xác thực...</Text>
              </View>
            )}

            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: NotificationGroup }) => (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionLabel}>
        {section.title}
        <Text style={styles.sectionCount}>{`  ${section.data.length}`}</Text>
      </Text>
      <View style={styles.sectionLine} />
    </View>
  );

  // ==================== TABS ====================

  const renderTabs = () => (
    <View style={styles.tabStrip}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroll}
      >
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.key;
          const count = getTabCount(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTab(tab.key);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? tab.iconActive : tab.icon) as any}
                size={16}
                color={isActive ? "#fff" : MODERN_COLORS.textSecondary}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[styles.tabCount, isActive && styles.tabCountActive]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      isActive && styles.tabCountTextActive,
                    ]}
                  >
                    {count > 99 ? "99+" : String(count)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ==================== EMPTY STATE ====================

  const renderEmpty = () => {
    const empty: Record<TabType, { icon: string; title: string; sub: string }> =
      {
        all: {
          icon: "notifications-off-outline",
          title: "Không có thông báo",
          sub: "Thông báo từ CRM và hệ thống sẽ xuất hiện ở đây",
        },
        messages: {
          icon: "chatbubbles-outline",
          title: "Không có tin nhắn",
          sub: "Tin nhắn mới sẽ hiển thị ở đây",
        },
        calls: {
          icon: "call-outline",
          title: "Không có cuộc gọi nhỡ",
          sub: "Cuộc gọi nhỡ sẽ hiển thị ở đây",
        },
        crm: {
          icon: "briefcase-outline",
          title: "Không có thông báo CRM",
          sub: "Cập nhật từ công việc, dự án sẽ hiển thị ở đây",
        },
        app: {
          icon: "cog-outline",
          title: "Không có thông báo hệ thống",
          sub: "Thông báo hệ thống sẽ hiển thị ở đây",
        },
      };
    const e = empty[selectedTab];

    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyCircle}>
          <Ionicons
            name={e.icon as any}
            size={44}
            color={MODERN_COLORS.primary + "50"}
          />
        </View>
        <Text style={styles.emptyTitle}>{e.title}</Text>
        <Text style={styles.emptySub}>
          {isOffline ? "Bạn đang offline. Kết nối mạng để đồng bộ." : e.sub}
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.emptyBtnText}>Làm mới</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ==================== LOADING STATE ====================

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#0D9488", "#004C99"]}
          style={styles.loadingFull}
        >
          <View style={styles.loadingPulse}>
            <Ionicons
              name="notifications"
              size={40}
              color="rgba(255,255,255,0.3)"
            />
          </View>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingLabel}>Đang đồng bộ thông báo...</Text>
          <Text style={styles.loadingSub}>Xác thực từ máy chủ</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ==================== MAIN RENDER ====================

  const sections = groupedNotifications();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D9488" />

      {/* ---- Header ---- */}
      <LinearGradient colors={["#0D9488", "#004C99"]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            <View style={styles.syncRow}>
              <View
                style={[
                  styles.syncDot,
                  { backgroundColor: isOffline ? "#EF4444" : "#34D399" },
                ]}
              />
              <Text style={styles.syncLabel}>
                {isOffline ? "Offline" : formatLastSync(lastSyncTime)}
              </Text>
              {syncing && (
                <ActivityIndicator
                  size={12}
                  color="rgba(255,255,255,0.7)"
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>
          </View>

          <View style={styles.headerBtns}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={handleMarkAllRead}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-done" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Unread summary chips */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.unreadChipRow,
              {
                transform: [
                  {
                    scale: bannerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.unreadChip}>
              <Text style={styles.unreadChipNum}>{unreadCount}</Text>
              <Text style={styles.unreadChipLabel}>chưa đọc</Text>
            </View>
            {crmUnreadCount > 0 && (
              <View
                style={[
                  styles.unreadChip,
                  { backgroundColor: "rgba(124,58,237,0.25)" },
                ]}
              >
                <Text style={styles.unreadChipNum}>{crmUnreadCount}</Text>
                <Text style={styles.unreadChipLabel}>CRM</Text>
              </View>
            )}
            {appUnreadCount > 0 && (
              <View
                style={[
                  styles.unreadChip,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Text style={styles.unreadChipNum}>{appUnreadCount}</Text>
                <Text style={styles.unreadChipLabel}>Hệ thống</Text>
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.commShortcutRow}>
          <TouchableOpacity
            style={styles.commShortcutBtn}
            onPress={() => openCommunicationTab("messages")}
            activeOpacity={0.75}
          >
            <Ionicons name="chatbubbles" size={15} color="#fff" />
            <Text style={styles.commShortcutText}>Tin nhắn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commShortcutBtn}
            onPress={() => openCommunicationTab("calls")}
            activeOpacity={0.75}
          >
            <Ionicons name="call" size={15} color="#fff" />
            <Text style={styles.commShortcutText}>Cuộc gọi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commShortcutBtn}
            onPress={() => openCommunicationTab("meetings")}
            activeOpacity={0.75}
          >
            <Ionicons name="videocam" size={15} color="#fff" />
            <Text style={styles.commShortcutText}>Cuộc họp</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ---- Tabs ---- */}
      {renderTabs()}

      {/* ---- List ---- */}
      <SectionList
        sections={sections}
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
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listPad}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  // ---- Loading ----
  loadingFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  loadingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loadingSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  // ---- Header ----
  header: {
    paddingHorizontal: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.lg,
    paddingBottom: MODERN_SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  syncLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
  },
  headerBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  unreadChipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  commShortcutRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  commShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: MODERN_RADIUS.full,
  },
  commShortcutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  unreadChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  unreadChipNum: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  unreadChipLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },

  // ---- Tabs ----
  tabStrip: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabScroll: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#0D9488",
    ...MODERN_SHADOWS.sm,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabLabelActive: {
    color: "#fff",
  },
  tabCount: {
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tabCountActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  tabCountTextActive: {
    color: "#fff",
  },

  // ---- Section ----
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: 12,
    backgroundColor: "#F8F9FB",
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontWeight: "400",
    color: "#D1D5DB",
  },

  // ---- Card ----
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: 8,
    borderRadius: MODERN_RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    ...MODERN_SHADOWS.sm,
    overflow: "hidden",
  },
  cardUnread: {
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#0D9488",
    borderTopLeftRadius: MODERN_RADIUS.lg,
    borderBottomLeftRadius: MODERN_RADIUS.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  cardTitleBold: {
    fontWeight: "700",
    color: "#111827",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  srcBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  srcText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0D9488",
  },
  cardMsg: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  row3: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginRight: 6,
  },
  priBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  priDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  priText: {
    fontSize: 10,
    fontWeight: "600",
  },
  verifyingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 4,
  },
  verifyingText: {
    fontSize: 10,
    color: "#0D9488",
    fontWeight: "500",
  },

  // ---- Empty ----
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: MODERN_SPACING.xl,
    gap: 10,
  },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptySub: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: MODERN_RADIUS.full,
    marginTop: 12,
    ...MODERN_SHADOWS.sm,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },

  // ---- List padding ----
  listPad: {
    paddingTop: 4,
    paddingBottom: 40,
  },
});
