/**
 * Communication Hub Tab - Zalo Style
 * Unified tab with Messages, Calls, and Contacts
 */

import Avatar from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Types
interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  title: string;
  avatarUrl?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned?: boolean;
  isOnline?: boolean;
}

interface CallRecord {
  id: number;
  type: "video" | "audio";
  status: "missed" | "ended" | "rejected";
  createdAt: string;
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  isOutgoing: boolean;
}

type TabKey = "messages" | "calls" | "contacts";

export default function CommunicationHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth();

  // Theme
  const primary = useThemeColor({}, "primary");
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const _border = useThemeColor({}, "border");
  const success = "#4CAF50";
  const danger = "#F44336";

  // State
  const [activeTab, setActiveTab] = useState<TabKey>("messages");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Animation
  const tabIndicatorX = useSharedValue(0);
  const searchHeight = useSharedValue(0);

  // Tab indicator animation
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorX.value }],
  }));

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!accessToken) return;

    try {
      // Fetch conversations
      const convRes = await fetch(
        "https://baotienweb.cloud/api/v1/conversations",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-API-Key": "thietke-resort-api-key-2024",
          },
        },
      );

      if (convRes.ok) {
        const data = await convRes.json();
        setConversations(data.items || []);
      }

      // Fetch call history
      const callRes = await fetch(
        "https://baotienweb.cloud/api/v1/call/history",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-API-Key": "thietke-resort-api-key-2024",
          },
        },
      );

      if (callRes.ok) {
        const data = await callRes.json();
        const callList = data.value || data || [];
        // Transform to simplified format
        setCalls(
          callList.map((c: any) => ({
            id: c.id,
            type: c.type,
            status: c.status,
            createdAt: c.createdAt,
            otherUser: c.callerId === user?.id ? c.callee : c.caller,
            isOutgoing: c.callerId === user?.id,
          })),
        );
      }
    } catch (error) {
      console.error("[CommunicationHub] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle tab change
  const handleTabChange = (tab: TabKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    const tabIndex = ["messages", "calls", "contacts"].indexOf(tab);
    tabIndicatorX.value = withSpring(tabIndex * (width / 3));
  };

  // Toggle search
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    searchHeight.value = withTiming(showSearch ? 0 : 50);
    if (showSearch) setSearchQuery("");
  };

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    height: searchHeight.value,
    opacity: searchHeight.value / 50,
  }));

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Hôm qua";
    } else if (diffDays < 7) {
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Render conversation
  const renderConversation = ({
    item,
    index,
  }: {
    item: Conversation;
    index: number;
  }) => (
    <Animated.View entering={FadeInRight.delay(index * 30).duration(200)}>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push(`/messages/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            source={item.avatarUrl ? { uri: item.avatarUrl } : undefined}
            name={item.title}
            pixelSize={52}
          />
          {item.isOnline && (
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: success, borderColor: surface },
              ]}
            />
          )}
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text
              style={[
                styles.itemTitle,
                { color: text },
                item.unreadCount > 0 && styles.unreadText,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.itemTime, { color: textMuted }]}>
              {formatTime(item.lastMessageAt || item.id)}
            </Text>
          </View>
          <View style={styles.itemFooter}>
            <Text
              style={[
                styles.itemSubtitle,
                { color: item.unreadCount > 0 ? text : textMuted },
                item.unreadCount > 0 && styles.unreadText,
              ]}
              numberOfLines={1}
            >
              {item.lastMessagePreview || "Bắt đầu trò chuyện"}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: danger }]}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render call
  const renderCall = ({ item, index }: { item: CallRecord; index: number }) => {
    const isMissed = item.status === "missed" || item.status === "rejected";

    return (
      <Animated.View entering={FadeInRight.delay(index * 30).duration(200)}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() =>
            router.push(`/call/${item.otherUser.id}?type=${item.type}`)
          }
          activeOpacity={0.7}
        >
          <Avatar
            source={
              item.otherUser.avatar ? { uri: item.otherUser.avatar } : undefined
            }
            name={item.otherUser.name}
            pixelSize={52}
          />

          <View style={styles.itemContent}>
            <Text
              style={[styles.itemTitle, { color: isMissed ? danger : text }]}
              numberOfLines={1}
            >
              {item.otherUser.name}
            </Text>
            <View style={styles.callMeta}>
              <Ionicons
                name={item.isOutgoing ? "arrow-up" : "arrow-down"}
                size={14}
                color={isMissed ? danger : item.isOutgoing ? success : primary}
                style={{ transform: [{ rotate: "45deg" }] }}
              />
              <Ionicons
                name={item.type === "video" ? "videocam" : "call"}
                size={14}
                color={textMuted}
              />
              <Text style={[styles.itemSubtitle, { color: textMuted }]}>
                {isMissed ? "Cuộc gọi nhỡ" : formatTime(item.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.callActions}>
            <Pressable
              style={[styles.callButton, { backgroundColor: `${success}15` }]}
              onPress={() =>
                router.push(`/call/${item.otherUser.id}?type=audio`)
              }
            >
              <Ionicons name="call" size={20} color={success} />
            </Pressable>
            <Pressable
              style={[styles.callButton, { backgroundColor: `${primary}15` }]}
              onPress={() =>
                router.push(`/call/${item.otherUser.id}?type=video`)
              }
            >
              <Ionicons name="videocam" size={20} color={primary} />
            </Pressable>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render quick actions
  const renderQuickActions = () => (
    <View style={[styles.quickActions, { backgroundColor: surface }]}>
      {[
        {
          icon: "chatbubble-ellipses",
          label: "Chat mới",
          color: primary,
          onPress: () => router.push("/messages/new-conversation" as any),
        },
        {
          icon: "call",
          label: "Gọi điện",
          color: success,
          onPress: () => router.push("/call/contacts" as any),
        },
        {
          icon: "videocam",
          label: "Video call",
          color: "#9C27B0",
          onPress: () => router.push("/meeting" as any),
        },
        {
          icon: "radio",
          label: "Livestream",
          color: "#FF5722",
          onPress: () => router.push("/livestream"),
        },
      ].map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickAction}
          onPress={action.onPress}
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: `${action.color}15` },
            ]}
          >
            <Ionicons
              name={action.icon as any}
              size={24}
              color={action.color}
            />
          </View>
          <Text style={[styles.quickActionLabel, { color: textMuted }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render contacts placeholder
  const renderContacts = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={textMuted} />
      <Text style={[styles.emptyTitle, { color: text }]}>Danh bạ</Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        Đồng bộ danh bạ để tìm bạn bè
      </Text>
      <TouchableOpacity
        style={[styles.syncButton, { backgroundColor: primary }]}
        onPress={() =>
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }
      >
        <Ionicons name="sync" size={18} color="#fff" />
        <Text style={styles.syncButtonText}>Đồng bộ danh bạ</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmpty = (type: "messages" | "calls") => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={type === "messages" ? "chatbubbles-outline" : "call-outline"}
        size={64}
        color={textMuted}
      />
      <Text style={[styles.emptyTitle, { color: text }]}>
        {type === "messages" ? "Chưa có tin nhắn" : "Chưa có cuộc gọi"}
      </Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        {type === "messages"
          ? "Bắt đầu trò chuyện ngay!"
          : "Thực hiện cuộc gọi đầu tiên!"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: primary, paddingTop: insets.top },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Liên lạc</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={toggleSearch}>
              <Ionicons name="search" size={22} color="#fff" />
            </Pressable>
            <Pressable
              style={styles.headerButton}
              onPress={() => router.push("/(tabs)/settings" as any)}
            >
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <Animated.View style={[styles.searchWrapper, searchAnimatedStyle]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={textMuted} />
            <TextInput
              style={[styles.searchInput, { color: text }]}
              placeholder="Tìm kiếm..."
              placeholderTextColor={textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { key: "messages", label: "Tin nhắn", icon: "chatbubble" },
            { key: "calls", label: "Cuộc gọi", icon: "call" },
            { key: "contacts", label: "Danh bạ", icon: "people" },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabChange(tab.key as TabKey)}
            >
              <Ionicons
                name={
                  (activeTab === tab.key
                    ? tab.icon
                    : `${tab.icon}-outline`) as any
                }
                size={20}
                color={activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.6)"}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.6)",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}

          {/* Tab Indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              { backgroundColor: "#fff" },
              tabIndicatorStyle,
            ]}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              colors={[primary]}
              tintColor={primary}
            />
          }
        >
          {/* Quick Actions */}
          {renderQuickActions()}

          {/* Tab Content */}
          {activeTab === "messages" &&
            (conversations.length === 0 ? (
              renderEmpty("messages")
            ) : (
              <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ))}

          {activeTab === "calls" &&
            (calls.length === 0 ? (
              renderEmpty("calls")
            ) : (
              <FlatList
                data={calls}
                renderItem={renderCall}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ))}

          {activeTab === "contacts" && renderContacts()}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (activeTab === "messages") {
            router.push("/messages/new-conversation" as any);
          } else if (activeTab === "calls") {
            router.push("/call/contacts" as any);
          } else {
            router.push("/contacts" as any);
          }
        }}
      >
        <Ionicons
          name={
            activeTab === "messages"
              ? "create"
              : activeTab === "calls"
                ? "call"
                : "person-add"
          }
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabsContainer: {
    flexDirection: "row",
    position: "relative",
    marginTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width / 3,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginBottom: 8,
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  itemTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemSubtitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadText: {
    fontWeight: "700",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  callMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  callActions: {
    flexDirection: "row",
    gap: 8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
