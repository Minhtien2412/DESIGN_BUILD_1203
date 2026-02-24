/**
 * Chat List Component - Teams Style
 * Main conversation list with search, filters, and pinned chats
 */

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Participant {
  id: number;
  name: string;
  avatar: string | null;
  isOnline?: boolean;
}

interface LastMessage {
  content: string;
  type: "text" | "image" | "file" | "system";
  sentAt: string;
  isFromMe: boolean;
  isRead: boolean;
  sender?: Participant;
}

export interface Conversation {
  id: number;
  type: "direct" | "group" | "meeting";
  name?: string; // For group chats
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  updatedAt: string;
}

interface ChatListProps {
  conversations: Conversation[];
  onConversationPress: (conversationId: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onSearchPress?: () => void;
  onContactsPress?: () => void;
  onNewChatPress?: () => void;
}

export function ChatList({
  conversations,
  onConversationPress,
  onRefresh,
  refreshing = false,
  onSearchPress,
  onContactsPress,
  onNewChatPress,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "unread" | "pinned">(
    "all",
  );

  // Tạo cuộc trò chuyện đặc biệt với AI và Admin
  const specialConversations: Conversation[] = [
    {
      id: -2,
      type: "direct",
      name: "Trợ lý AI",
      participants: [
        {
          id: -2,
          name: "Trợ lý AI",
          avatar: null,
          isOnline: true,
        },
      ],
      lastMessage: {
        content: "Tôi có thể giúp bạn về dự án xây dựng, vật liệu, thiết kế...",
        type: "text",
        sentAt: new Date().toISOString(),
        isFromMe: false,
        isRead: false,
      },
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      updatedAt: new Date().toISOString(),
    },
    {
      id: -3,
      type: "direct",
      name: "Hỗ trợ Admin",
      participants: [
        {
          id: -3,
          name: "Hỗ trợ Admin",
          avatar: null,
          isOnline: true,
        },
      ],
      lastMessage: {
        content: "Đội ngũ hỗ trợ sẵn sàng giúp bạn 24/7",
        type: "text",
        sentAt: new Date().toISOString(),
        isFromMe: false,
        isRead: false,
      },
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      updatedAt: new Date().toISOString(),
    },
  ];

  // Kết hợp cuộc trò chuyện đặc biệt với danh sách thông thường
  const allConversations = [...specialConversations, ...conversations];

  const filteredConversations = allConversations.filter((conv) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name =
        conv.type === "group"
          ? conv.name || ""
          : conv.participants.find((p) => p.id !== 0)?.name || "";

      if (!name.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Status filter
    if (filterActive === "unread" && conv.unreadCount === 0) return false;
    if (filterActive === "pinned" && !conv.isPinned) return false;

    return true;
  });

  const pinnedChats = filteredConversations.filter((c) => c.isPinned);
  const regularChats = filteredConversations.filter((c) => !c.isPinned);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
    });
  };

  const getOtherParticipant = (conv: Conversation): Participant | undefined => {
    return conv.participants.find((p) => p.id !== 0); // Assuming 0 is current user
  };

  const renderChatItem = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherParticipant(item);
    const displayName = item.type === "group" ? item.name : otherUser?.name;
    const displayAvatar = otherUser?.avatar;
    const isOnline = otherUser?.isOnline;
    const isSystemMessage = item.id === -1;
    const isAIAssistant = item.id === -2;
    const isAdminSupport = item.id === -3;

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          item.unreadCount > 0 && styles.chatItemUnread,
          isSystemMessage && styles.systemChatItem,
        ]}
        onPress={() => onConversationPress(item.id)}
        activeOpacity={0.7}
        disabled={isSystemMessage}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {isSystemMessage ? (
            <View style={[styles.avatar, styles.systemAvatar]}>
              <Ionicons name="notifications" size={28} color="#fff" />
            </View>
          ) : isAIAssistant ? (
            <View style={[styles.avatar, styles.aiAvatar]}>
              <Ionicons name="sparkles" size={28} color="#fff" />
            </View>
          ) : isAdminSupport ? (
            <View style={[styles.avatar, styles.adminAvatar]}>
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </View>
          ) : displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons
                name={item.type === "group" ? "people" : "person"}
                size={24}
                color="#8A8886"
              />
            </View>
          )}
          {isOnline &&
            item.type === "direct" &&
            !isSystemMessage &&
            !isAIAssistant &&
            !isAdminSupport && <View style={styles.onlineIndicator} />}
          {item.type === "meeting" && (
            <View style={styles.meetingBadge}>
              <Ionicons name="videocam" size={12} color="#fff" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <View style={styles.titleRow}>
              {item.isPinned && (
                <Ionicons
                  name="pin"
                  size={14}
                  color="#6264A7"
                  style={styles.pinIcon}
                />
              )}
              <Text
                style={[
                  styles.chatName,
                  item.unreadCount > 0 && styles.chatNameUnread,
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {item.lastMessage ? formatTime(item.lastMessage.sentAt) : ""}
            </Text>
          </View>

          {item.lastMessage && (
            <View style={styles.messageRow}>
              <View style={styles.messagePreview}>
                {item.type === "group" && !item.lastMessage.isFromMe && (
                  <Text style={styles.senderName}>
                    {item.lastMessage.sender?.name}:
                  </Text>
                )}
                {item.lastMessage.type === "text" ? (
                  <Text
                    style={[
                      styles.messageText,
                      item.unreadCount > 0 && styles.messageTextUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.isFromMe ? "Bạn: " : ""}
                    {item.lastMessage.content}
                  </Text>
                ) : (
                  <View style={styles.mediaMessage}>
                    <Ionicons
                      name={
                        item.lastMessage.type === "image"
                          ? "image"
                          : item.lastMessage.type === "file"
                            ? "document"
                            : "alert-circle"
                      }
                      size={14}
                      color="#8A8886"
                    />
                    <Text style={styles.mediaText}>
                      {item.lastMessage.type === "image"
                        ? "Đã gửi ảnh"
                        : item.lastMessage.type === "file"
                          ? "Đã gửi tệp"
                          : "Tin nhắn hệ thống"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Right side indicators */}
              <View style={styles.indicators}>
                {item.isMuted && (
                  <Ionicons
                    name="notifications-off"
                    size={16}
                    color="#8A8886"
                  />
                )}
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {item.unreadCount > 99 ? "99+" : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onSearchPress}>
            <Ionicons name="search" size={18} color="#424242" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onContactsPress}
          >
            <Ionicons name="people" size={18} color="#424242" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onNewChatPress}
          >
            <Ionicons name="create-outline" size={18} color="#424242" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8A8886" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm cuộc trò chuyện"
          placeholderTextColor="#8A8886"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#8A8886" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterActive === "all" && styles.filterChipActive,
          ]}
          onPress={() => setFilterActive("all")}
        >
          <Text
            style={[
              styles.filterText,
              filterActive === "all" && styles.filterTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterActive === "unread" && styles.filterChipActive,
          ]}
          onPress={() => setFilterActive("unread")}
        >
          <Text
            style={[
              styles.filterText,
              filterActive === "unread" && styles.filterTextActive,
            ]}
          >
            Chưa đọc
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterActive === "pinned" && styles.filterChipActive,
          ]}
          onPress={() => setFilterActive("pinned")}
        >
          <Text
            style={[
              styles.filterText,
              filterActive === "pinned" && styles.filterTextActive,
            ]}
          >
            Đã ghim
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={[
          ...(pinnedChats.length > 0
            ? [{ type: "header", title: "Đã ghim" }]
            : []),
          ...pinnedChats.map((c) => ({ type: "chat", data: c })),
          ...(regularChats.length > 0 && pinnedChats.length > 0
            ? [{ type: "header", title: "Gần đây" }]
            : []),
          ...regularChats.map((c) => ({ type: "chat", data: c })),
        ]}
        keyExtractor={(item: any, index) =>
          item.type === "header" ? `header-${index}` : `chat-${item.data.id}`
        }
        renderItem={({ item }: any) =>
          item.type === "header"
            ? renderSectionHeader(item.title)
            : renderChatItem({ item: item.data })
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1DFDD",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#242424",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F2F1",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#242424",
    marginLeft: 8,
    padding: 0,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F2F1",
  },
  filterChipActive: {
    backgroundColor: "#E8E8F8",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#616161",
  },
  filterTextActive: {
    color: "#6264A7",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8A8886",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  chatItemUnread: {
    backgroundColor: "#F5F5FF",
  },
  systemChatItem: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 3,
    borderLeftColor: "#0D9488",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  systemAvatar: {
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
  },
  aiAvatar: {
    backgroundColor: "#666666",
    justifyContent: "center",
    alignItems: "center",
  },
  adminAvatar: {
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    backgroundColor: "#E1DFDD",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#92C353",
    borderWidth: 2,
    borderColor: "#fff",
  },
  meetingBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#6264A7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pinIcon: {
    marginRight: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#242424",
    flex: 1,
  },
  chatNameUnread: {
    fontWeight: "600",
  },
  timeText: {
    fontSize: 12,
    color: "#8A8886",
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messagePreview: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  senderName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8A8886",
    marginRight: 4,
  },
  messageText: {
    fontSize: 13,
    color: "#616161",
    flex: 1,
  },
  messageTextUnread: {
    color: "#242424",
    fontWeight: "500",
  },
  mediaMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mediaText: {
    fontSize: 13,
    color: "#8A8886",
    fontStyle: "italic",
  },
  indicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#C4314B",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
});
