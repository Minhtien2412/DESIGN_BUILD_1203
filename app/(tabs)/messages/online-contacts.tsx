/**
 * Online Contacts Screen (Messages Tab)
 * =======================================
 *
 * Danh bạ nhanh — hiển thị liên hệ online/offline
 * - Phần "Đang hoạt động" trên cùng
 * - Danh sách A-Z
 * - Quick call / message
 * - Search
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
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
  primaryLight: "#F0FDFA",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSec: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  online: "#22C55E",
  blue: "#3B82F6",
  purple: "#7C3AED",
};

// ─── Contact type ───
interface Contact {
  id: number;
  name: string;
  role: string;
  phone?: string;
  isOnline: boolean;
  lastSeen?: string;
  isFavorite: boolean;
}

// ─── Mock data ───
const CONTACTS: Contact[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    role: "Kiến trúc sư",
    phone: "0901234567",
    isOnline: true,
    isFavorite: true,
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    role: "Kỹ sư xây dựng",
    phone: "0902345678",
    isOnline: true,
    isFavorite: false,
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    role: "Giám sát",
    phone: "0903456789",
    isOnline: false,
    lastSeen: "15 phút trước",
    isFavorite: true,
  },
  {
    id: 4,
    name: "Phạm Minh Đức",
    role: "Thiết kế nội thất",
    phone: "0904567890",
    isOnline: true,
    isFavorite: false,
  },
  {
    id: 5,
    name: "Hoàng Thị Lan",
    role: "Quản lý dự án",
    phone: "0905678901",
    isOnline: false,
    lastSeen: "1 giờ trước",
    isFavorite: true,
  },
  {
    id: 6,
    name: "Vũ Đình Toàn",
    role: "Kỹ sư điện",
    phone: "0906789012",
    isOnline: true,
    isFavorite: false,
  },
  {
    id: 7,
    name: "Ngô Thị Hương",
    role: "Kế toán",
    phone: "0907890123",
    isOnline: false,
    lastSeen: "3 giờ trước",
    isFavorite: false,
  },
  {
    id: 8,
    name: "Đặng Quốc Khánh",
    role: "Kỹ sư cơ điện",
    phone: "0908901234",
    isOnline: true,
    isFavorite: true,
  },
  {
    id: 9,
    name: "Bùi Văn Long",
    role: "Thợ xây",
    phone: "0909012345",
    isOnline: false,
    lastSeen: "Hôm qua",
    isFavorite: false,
  },
  {
    id: 10,
    name: "Mai Thị Ngọc",
    role: "HR",
    phone: "0910123456",
    isOnline: true,
    isFavorite: false,
  },
  {
    id: 11,
    name: "Cao Đức Phong",
    role: "Lái xe",
    phone: "0911234567",
    isOnline: false,
    lastSeen: "2 ngày trước",
    isFavorite: false,
  },
  {
    id: 12,
    name: "Trương Văn Quang",
    role: "Bảo vệ",
    phone: "0912345678",
    isOnline: false,
    lastSeen: "5 giờ trước",
    isFavorite: false,
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ═══════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════
export default function OnlineContactsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQ, setSearchQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredContacts = useMemo(() => {
    let list = CONTACTS;
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q),
      );
    }
    // Online first, then favorites, then alphabetical
    return list.sort((a, b) => {
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return a.name.localeCompare(b.name, "vi");
    });
  }, [searchQ]);

  const onlineCount = useMemo(
    () => CONTACTS.filter((c) => c.isOnline).length,
    [],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleMessage = useCallback((contact: Contact) => {
    router.push({
      pathname: "/chat/[chatId]",
      params: { chatId: String(contact.id), chatName: contact.name },
    } as any);
  }, []);

  const handleCall = useCallback((contact: Contact) => {
    router.push({
      pathname: "/call/[userId]",
      params: { userId: String(contact.id), type: "audio" },
    } as any);
  }, []);

  const handleVideoCall = useCallback((contact: Contact) => {
    router.push({
      pathname: "/call/[userId]",
      params: { userId: String(contact.id), type: "video" },
    } as any);
  }, []);

  // ─── Online bubble strip ───
  const renderOnlineStrip = () => {
    const onlineUsers = CONTACTS.filter((c) => c.isOnline);
    if (onlineUsers.length === 0) return null;

    return (
      <View style={s.onlineStrip}>
        <Text style={s.onlineStripLabel}>Đang hoạt động ({onlineCount})</Text>
        <FlatList
          horizontal
          data={onlineUsers}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.onlineBubbles}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.onlineBubble}
              onPress={() => handleMessage(item)}
              activeOpacity={0.7}
            >
              <View style={s.bubbleAvatar}>
                <Text style={s.bubbleAvatarText}>{getInitials(item.name)}</Text>
                <View style={s.bubbleOnlineDot} />
              </View>
              <Text style={s.bubbleName} numberOfLines={1}>
                {item.name.split(" ").pop()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // ─── Contact item ───
  const renderContact = useCallback(
    ({ item }: { item: Contact }) => (
      <TouchableOpacity
        style={s.contactItem}
        activeOpacity={0.6}
        onPress={() => handleMessage(item)}
      >
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View
            style={[
              s.avatar,
              {
                backgroundColor: item.isFavorite
                  ? "#FEF3C7"
                  : item.isOnline
                    ? C.primaryLight
                    : "#F1F5F9",
              },
            ]}
          >
            <Text
              style={[
                s.avatarText,
                {
                  color: item.isFavorite
                    ? "#D97706"
                    : item.isOnline
                      ? C.primary
                      : C.textMuted,
                },
              ]}
            >
              {getInitials(item.name)}
            </Text>
          </View>
          {item.isOnline && <View style={s.onlineDot} />}
          {item.isFavorite && (
            <View style={s.favBadge}>
              <Ionicons name="star" size={7} color="#D97706" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={s.contactInfo}>
          <Text style={s.contactName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={s.contactMeta}>
            <Text style={s.contactRole}>{item.role}</Text>
            {!item.isOnline && item.lastSeen && (
              <Text style={s.lastSeen}> · {item.lastSeen}</Text>
            )}
            {item.isOnline && <Text style={s.onlineLabel}> · Trực tuyến</Text>}
          </View>
        </View>

        {/* Actions */}
        <View style={s.contactActions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => handleCall(item)}
            activeOpacity={0.6}
          >
            <Ionicons name="call" size={14} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => handleVideoCall(item)}
            activeOpacity={0.6}
          >
            <Ionicons name="videocam" size={14} color={C.blue} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [handleMessage, handleCall, handleVideoCall],
  );

  // ─── Header ───
  const renderHeader = () => (
    <View>
      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={15} color={C.textMuted} />
        <TextInput
          nativeID="contacts-search"
          accessibilityLabel="Tìm kiếm liên hệ"
          style={s.searchInput}
          placeholder="Tìm liên hệ..."
          placeholderTextColor={C.textMuted}
          value={searchQ}
          onChangeText={setSearchQ}
        />
        {searchQ.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQ("")}>
            <Ionicons name="close-circle" size={15} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Online strip */}
      {!searchQ && renderOnlineStrip()}

      {/* Count */}
      <View style={s.countRow}>
        <Text style={s.countText}>
          {filteredContacts.length} liên hệ
          {searchQ ? " tìm thấy" : ""}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/messages/contacts" as any)}
          activeOpacity={0.7}
        >
          <Text style={s.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderContact}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Ionicons name="people-outline" size={40} color={C.textMuted} />
            <Text style={s.emptyTitle}>Không tìm thấy liên hệ</Text>
          </View>
        }
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
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
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.text,
  },

  // Online strip
  onlineStrip: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  onlineStripLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSec,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  onlineBubbles: {
    paddingHorizontal: 12,
    gap: 14,
  },
  onlineBubble: {
    alignItems: "center",
    width: 52,
  },
  bubbleAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
    position: "relative",
  },
  bubbleAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
  },
  bubbleOnlineDot: {
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
  bubbleName: {
    fontSize: 10,
    color: C.textSec,
    fontWeight: "500",
    textAlign: "center",
  },

  // Count row
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 11,
    color: C.textMuted,
  },
  viewAllText: {
    fontSize: 11,
    color: C.primary,
    fontWeight: "600",
  },

  // Contact item
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.white,
  },
  avatarWrap: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
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
  favBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 1,
  },
  contactMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactRole: {
    fontSize: 11,
    color: C.textMuted,
  },
  lastSeen: {
    fontSize: 11,
    color: C.textMuted,
  },
  onlineLabel: {
    fontSize: 11,
    color: C.online,
    fontWeight: "500",
  },

  // Actions
  contactActions: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Separator
  separator: {
    paddingLeft: 62,
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
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginTop: 10,
  },
});
