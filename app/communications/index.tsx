/**
 * Communications Screen
 * Unified view for Messages and Calls with tabs (like Zalo)
 */

import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "messages" | "calls";

interface OtherUser {
  id: number;
  name: string;
  avatar: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

interface LastMessage {
  content: string;
  type: string;
  sentAt: string;
  isFromMe: boolean;
  isRead: boolean;
}

interface Conversation {
  id: number;
  otherUser: OtherUser;
  lastMessage: LastMessage;
  unreadCount: number;
}

interface Call {
  id: number;
  type: "video" | "audio";
  status: "missed" | "completed" | "declined" | "failed";
  duration: number;
  startedAt: string;
  endedAt: string | null;
  isIncoming: boolean;
  otherUser: OtherUser;
}

export default function CommunicationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("messages");

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesRefreshing, setMessagesRefreshing] = useState(false);
  const [messagesLoadingMore, setMessagesLoadingMore] = useState(false);
  const [messagesHasMore, setMessagesHasMore] = useState(true);
  const [messagesOffset, setMessagesOffset] = useState(0);

  // Calls state
  const [calls, setCalls] = useState<Call[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsRefreshing, setCallsRefreshing] = useState(false);
  const [callsLoadingMore, setCallsLoadingMore] = useState(false);
  const [callsHasMore, setCallsHasMore] = useState(true);
  const [callsOffset, setCallsOffset] = useState(0);

  const limit = 20;

  // Fetch conversations
  const fetchConversations = useCallback(
    async (isRefresh = false, currentOffset?: number) => {
      try {
        if (isRefresh) {
          setMessagesRefreshing(true);
        } else if (currentOffset !== undefined && currentOffset > 0) {
          setMessagesLoadingMore(true);
        } else {
          setMessagesLoading(true);
        }

        const offsetToUse = isRefresh ? 0 : (currentOffset ?? messagesOffset);
        const data = await apiFetch(
          `/api/messages?limit=${limit}&offset=${offsetToUse}`,
        );

        const newConversations = data.conversations || [];

        if (isRefresh) {
          setConversations(newConversations);
          setMessagesOffset(newConversations.length);
        } else if (currentOffset !== undefined && currentOffset > 0) {
          setConversations((prev) => [...prev, ...newConversations]);
          setMessagesOffset(offsetToUse + newConversations.length);
        } else {
          setConversations(newConversations);
          setMessagesOffset(newConversations.length);
        }

        setMessagesHasMore(data.pagination?.hasMore || false);
      } catch (error: any) {
        // Gracefully handle missing endpoint during development
        const status = error?.status ?? error?.data?.statusCode;
        if (status === 404) {
          setConversations([]);
          setMessagesHasMore(false);
        } else {
          console.error("Failed to fetch conversations:", error);
        }
      } finally {
        setMessagesLoading(false);
        setMessagesRefreshing(false);
        setMessagesLoadingMore(false);
      }
    },
    [],
  );

  // Fetch calls
  const fetchCalls = useCallback(
    async (isRefresh = false, currentOffset?: number) => {
      try {
        if (isRefresh) {
          setCallsRefreshing(true);
        } else if (currentOffset !== undefined && currentOffset > 0) {
          setCallsLoadingMore(true);
        } else {
          setCallsLoading(true);
        }

        const offsetToUse = isRefresh ? 0 : (currentOffset ?? callsOffset);
        const data = await apiFetch(
          `/api/calls?limit=${limit}&offset=${offsetToUse}`,
        );

        const newCalls = data.calls || [];

        if (isRefresh) {
          setCalls(newCalls);
          setCallsOffset(newCalls.length);
        } else if (currentOffset !== undefined && currentOffset > 0) {
          setCalls((prev) => [...prev, ...newCalls]);
          setCallsOffset(offsetToUse + newCalls.length);
        } else {
          setCalls(newCalls);
          setCallsOffset(newCalls.length);
        }

        setCallsHasMore(data.pagination?.hasMore || false);
      } catch (error: any) {
        // Gracefully handle missing endpoint during development
        const status = error?.status ?? error?.data?.statusCode;
        if (status === 404) {
          setCalls([]);
          setCallsHasMore(false);
        } else {
          console.error("Failed to fetch calls:", error);
        }
      } finally {
        setCallsLoading(false);
        setCallsRefreshing(false);
        setCallsLoadingMore(false);
      }
    },
    [],
  );

  // Initial fetch
  useEffect(() => {
    if (activeTab === "messages") {
      fetchConversations();
    } else {
      fetchCalls();
    }
  }, [activeTab]);

  const handleRefresh = () => {
    if (activeTab === "messages") {
      fetchConversations(true, 0);
    } else {
      fetchCalls(true, 0);
    }
  };

  const handleLoadMore = () => {
    if (activeTab === "messages") {
      if (!messagesLoadingMore && messagesHasMore) {
        fetchConversations(false, messagesOffset);
      }
    } else {
      if (!callsLoadingMore && callsHasMore) {
        fetchCalls(false, callsOffset);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatCallDuration = (seconds: number) => {
    if (seconds === 0) return "Không trả lời";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case "missed":
        return "#000000";
      case "completed":
        return "#0066CC";
      case "declined":
        return "#0066CC";
      case "failed":
        return "#000000";
      default:
        return "#999";
    }
  };

  const getCallStatusText = (status: string, isIncoming: boolean) => {
    switch (status) {
      case "missed":
        return isIncoming ? "Nhớ cuộc gọi" : "Không trả lời";
      case "completed":
        return isIncoming ? "Cuộc gọi đến" : "Cuộc gọi đi";
      case "declined":
        return "Từ chối";
      case "failed":
        return "Thất bại";
      default:
        return "";
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/messages/${item.otherUser.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.otherUser.avatar ? (
          <Image
            source={{ uri: item.otherUser.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#999" />
          </View>
        )}
        {item.otherUser.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.otherUser.name}
          </Text>
          <Text style={styles.time}>{formatTime(item.lastMessage.sentAt)}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              !item.lastMessage.isRead &&
                !item.lastMessage.isFromMe &&
                styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.isFromMe ? "Bạn: " : ""}
            {item.lastMessage.type === "text"
              ? item.lastMessage.content
              : "📷 Hình ảnh"}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCallItem = ({ item }: { item: Call }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/messages/${item.otherUser.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.otherUser.avatar ? (
          <Image
            source={{ uri: item.otherUser.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#999" />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.otherUser.name}
          </Text>
          <Text style={styles.time}>{formatTime(item.startedAt)}</Text>
        </View>

        <View style={styles.callRow}>
          <Ionicons
            name={item.type === "video" ? "videocam" : "call"}
            size={16}
            color={getCallStatusColor(item.status)}
            style={styles.callIcon}
          />
          <Text
            style={[
              styles.callStatus,
              { color: getCallStatusColor(item.status) },
            ]}
          >
            {getCallStatusText(item.status, item.isIncoming)}
          </Text>
          <Text style={styles.callDuration}>
            {" "}
            • {formatCallDuration(item.duration)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => {
          // Tất cả cuộc gọi thực hiện trong app
          router.push(`/call/${item.otherUser.id}?type=${item.type}`);
        }}
      >
        <Ionicons
          name={item.type === "video" ? "videocam" : "call"}
          size={24}
          color="#0068FF"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={activeTab === "messages" ? "chatbubbles-outline" : "call-outline"}
        size={64}
        color="#ccc"
      />
      <Text style={styles.emptyText}>
        {activeTab === "messages" ? "Chưa có tin nhắn" : "Chưa có cuộc gọi"}
      </Text>
    </View>
  );

  const renderFooter = () => {
    const isLoadingMore =
      activeTab === "messages" ? messagesLoadingMore : callsLoadingMore;
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#0066CC" />
      </View>
    );
  };

  const isLoading = activeTab === "messages" ? messagesLoading : callsLoading;
  const isRefreshing =
    activeTab === "messages" ? messagesRefreshing : callsRefreshing;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn & Cuộc gọi</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "messages" && styles.activeTab]}
          onPress={() => setActiveTab("messages")}
        >
          <Ionicons
            name="chatbubbles"
            size={20}
            color={activeTab === "messages" ? "#0066CC" : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "messages" && styles.activeTabText,
            ]}
          >
            Tin nhắn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "calls" && styles.activeTab]}
          onPress={() => setActiveTab("calls")}
        >
          <Ionicons
            name="call"
            size={20}
            color={activeTab === "calls" ? "#0066CC" : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "calls" && styles.activeTabText,
            ]}
          >
            Cuộc gọi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : activeTab === "messages" ? (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#0066CC"]}
              tintColor="#0066CC"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      ) : (
        <FlatList
          data={calls}
          renderItem={renderCallItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={
            calls.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#0066CC"]}
              tintColor="#0066CC"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  searchButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0066CC",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
  },
  activeTabText: {
    color: "#0066CC",
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0066CC",
    borderWidth: 2,
    borderColor: "#fff",
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
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginRight: 8,
  },
  time: {
    fontSize: 13,
    color: "#999",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  unreadMessage: {
    color: "#111",
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  callRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  callIcon: {
    marginRight: 4,
  },
  callStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  callDuration: {
    fontSize: 13,
    color: "#999",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
});
