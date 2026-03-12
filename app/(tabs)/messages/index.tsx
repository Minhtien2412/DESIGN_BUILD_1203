/**
 * Messages Index Screen — Zalo/Messenger-style Chat List
 * =====================================================
 *
 * Real-time danh sách cuộc hội thoại với:
 * - Pinned / muted indicators
 * - Unread badges
 * - Online status dots
 * - Search + quick actions
 * - Pull-to-refresh
 * - Navigate to chat room or archive
 */

import { useAuth } from "@/context/AuthContext";
import { chatAPIService } from "@/services/chatAPIService";
import type { ChatRoom } from "@/services/ChatService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Colors ───
const C = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  accent: "#14B8A6",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  blue: "#3B82F6",
  text: "#1A1A1A",
  textSec: "#64748B",
  textMuted: "#94A3B8",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E2E8F0",
  card: "#FFFFFF",
  online: "#22C55E",
  unread: "#EF4444",
};

// ─── Helpers ───
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "group":
      return "people";
    case "channel":
      return "megaphone-outline";
    default:
      return "person";
  }
}

// ─── Screen ───
export default function MessagesIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // ─── Load rooms on focus ───
  const loadRooms = useCallback(async () => {
    try {
      const data = await chatAPIService.getChatRooms();
      setRooms(data);
    } catch {
      // Will show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [loadRooms]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  }, [loadRooms]);

  // ─── Filter + sort (pinned first, then by time) ───
  const filteredRooms = useMemo(() => {
    let list = rooms;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.lastMessage?.content?.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [rooms, searchQuery]);

  const totalUnread = useMemo(
    () => rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0),
    [rooms],
  );

  // ─── Navigate to chat ───
  const openChat = useCallback(
    (room: ChatRoom) => {
      router.push({
        pathname: "/chat/[chatId]",
        params: { chatId: room.id, chatName: room.name },
      } as any);
    },
    [router],
  );

  // ─── Render conversation item ───
  const renderItem = useCallback(
    ({ item }: { item: ChatRoom }) => {
      const hasUnread = (item.unreadCount || 0) > 0;
      const lastMsg = item.lastMessage;
      const isMe = lastMsg?.senderId === user?.id?.toString();
      const preview = lastMsg
        ? lastMsg.type === "image"
          ? "📷 Hình ảnh"
          : lastMsg.type === "file"
            ? "📎 Tệp đính kèm"
            : lastMsg.type === "video"
              ? "🎬 Video"
              : lastMsg.type === "audio"
                ? "🎵 Tin nhắn thoại"
                : lastMsg.content
        : "Chưa có tin nhắn";

      return (
        <TouchableOpacity
          style={[s.chatItem, item.isPinned && s.chatItemPinned]}
          onPress={() => openChat(item)}
          activeOpacity={0.6}
        >
          {/* Avatar */}
          <View style={s.avatarWrap}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarFallback]}>
                <Ionicons
                  name={getTypeIcon(item.type) as any}
                  size={18}
                  color="#fff"
                />
              </View>
            )}
            {/* Online dot */}
            {item.type === "private" && <View style={s.onlineDot} />}
            {/* Pinned icon */}
            {item.isPinned && (
              <View style={s.pinBadge}>
                <Ionicons name="pin" size={7} color={C.primary} />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={s.chatInfo}>
            <View style={s.chatTopRow}>
              <Text
                style={[s.chatName, hasUnread && s.chatNameBold]}
                numberOfLines={1}
              >
                {item.type === "channel" && (
                  <Ionicons name="megaphone" size={11} color={C.warning} />
                )}{" "}
                {item.name}
              </Text>
              <Text style={[s.chatTime, hasUnread && s.chatTimeUnread]}>
                {lastMsg ? timeAgo(lastMsg.timestamp) : ""}
              </Text>
            </View>
            <View style={s.chatBottomRow}>
              <Text
                style={[s.chatPreview, hasUnread && s.chatPreviewUnread]}
                numberOfLines={1}
              >
                {isMe && lastMsg ? "Bạn: " : ""}
                {preview}
              </Text>
              <View style={s.chatBadges}>
                {item.isMuted && (
                  <Ionicons
                    name="volume-mute"
                    size={12}
                    color={C.textMuted}
                    style={{ marginRight: 4 }}
                  />
                )}
                {hasUnread && (
                  <View style={s.unreadBadge}>
                    <Text style={s.unreadText}>
                      {item.unreadCount > 99 ? "99+" : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [openChat, user?.id],
  );

  // ─── Header ───
  const renderHeader = () => (
    <View style={[s.header, { paddingTop: insets.top + 4 }]}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Text style={s.title}>Tin nhắn</Text>
        <View style={s.topActions}>
          {totalUnread > 0 && (
            <View style={s.headerBadge}>
              <Text style={s.headerBadgeText}>
                {totalUnread > 99 ? "99+" : totalUnread}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={s.topBtn}
            onPress={() => router.push("/chat/search" as any)}
          >
            <Ionicons name="search" size={18} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.topBtn}
            onPress={() => router.push("/messages/new-conversation" as any)}
          >
            <Ionicons name="create-outline" size={18} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={15} color={C.textMuted} />
        <TextInput
          nativeID="messages-search"
          accessibilityLabel="Tìm kiếm tin nhắn"
          style={s.searchInput}
          placeholder="Tìm kiếm cuộc trò chuyện..."
          placeholderTextColor={C.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={15} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick actions — Zalo sub-tabs */}
      <View style={s.quickActions}>
        <TouchableOpacity
          style={s.quickBtn}
          onPress={() => router.push("/messages/groups" as any)}
        >
          <View style={[s.quickIcon, { backgroundColor: "#EDE9FE" }]}>
            <Ionicons name="people" size={15} color="#7C3AED" />
          </View>
          <Text style={s.quickLabel}>Nhóm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.quickBtn}
          onPress={() => router.push("/(tabs)/messages/calls-history" as any)}
        >
          <View style={[s.quickIcon, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="call" size={15} color="#D97706" />
          </View>
          <Text style={s.quickLabel}>Cuộc gọi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.quickBtn}
          onPress={() => router.push("/(tabs)/messages/online-contacts" as any)}
        >
          <View style={[s.quickIcon, { backgroundColor: "#D1FAE5" }]}>
            <Ionicons name="person-add" size={15} color="#059669" />
          </View>
          <Text style={s.quickLabel}>Danh bạ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.quickBtn}
          onPress={() => router.push("/(tabs)/messages/chat-archives" as any)}
        >
          <View style={[s.quickIcon, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="archive" size={15} color="#2563EB" />
          </View>
          <Text style={s.quickLabel}>Lưu trữ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Empty state ───
  const renderEmpty = () => (
    <View style={s.emptyWrap}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="chatbubbles-outline" size={40} color={C.textMuted} />
      </View>
      <Text style={s.emptyTitle}>Chưa có cuộc trò chuyện</Text>
      <Text style={s.emptyDesc}>
        Bắt đầu nhắn tin với đồng nghiệp, khách hàng hoặc nhóm dự án
      </Text>
      <TouchableOpacity
        style={s.emptyBtn}
        onPress={() => router.push("/messages/new-conversation" as any)}
      >
        <Ionicons name="add" size={15} color="#fff" />
        <Text style={s.emptyBtnText}>Tin nhắn mới</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Loading ───
  if (loading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        {renderHeader()}
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        ItemSeparatorComponent={() => (
          <View style={s.separator}>
            <View style={s.separatorLine} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB - New message */}
      <TouchableOpacity
        style={[s.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push("/messages/new-conversation" as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },

  // Header
  header: {
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  topBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    backgroundColor: C.unread,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginRight: 2,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 7 : 4,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.text,
  },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickBtn: {
    alignItems: "center",
    flex: 1,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  quickLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: C.textSec,
  },

  // Chat item
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.white,
  },
  chatItemPinned: {
    backgroundColor: "#F0FDFA",
  },
  avatarWrap: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E2E8F0",
  },
  avatarFallback: {
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: C.online,
    borderWidth: 2,
    borderColor: C.white,
  },
  pinBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  chatName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: C.text,
    marginRight: 6,
  },
  chatNameBold: {
    fontWeight: "700",
  },
  chatTime: {
    fontSize: 11,
    color: C.textMuted,
  },
  chatTimeUnread: {
    color: C.primary,
    fontWeight: "600",
  },
  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatPreview: {
    flex: 1,
    fontSize: 12,
    color: C.textMuted,
    marginRight: 6,
  },
  chatPreviewUnread: {
    color: C.textSec,
    fontWeight: "500",
  },
  chatBadges: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: C.unread,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  // Separator
  separator: {
    paddingLeft: 64,
    backgroundColor: C.white,
  },
  separatorLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
  },

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: C.textMuted,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
});
