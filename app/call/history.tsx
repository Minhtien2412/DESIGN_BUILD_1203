/**
 * Call History Screen
 * Displays call history with video/audio calls, missed/completed status
 * + Badge sync với UnifiedBadgeContext (Zalo-style)
 * Updated: 03/02/2026
 */

import { CallHistoryHeader } from "@/components/navigation/CallHeader";
import Avatar from "@/components/ui/avatar";
import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { useCall } from "@/hooks/useCall";
import {
    CallHistoryItem,
    getCallStatusColor,
} from "@/services/api/call.service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CallHistoryScreen() {
  // Unified Badge Context - clear missed calls badge khi xem lịch sử
  const { clearBadge, badges } = useUnifiedBadge();

  const {
    callHistory: apiCallHistory,
    loading,
    refreshing,
    hasMoreHistory,
    refreshHistory,
    loadMoreHistory,
  } = useCall({ autoLoadHistory: true, historyLimit: 50 });

  // Filter state
  const [activeFilter, setActiveFilter] = useState<
    "all" | "missed" | "incoming" | "outgoing"
  >("all");

  const callHistory = useMemo(() => apiCallHistory, [apiCallHistory]);

  // Filter calls based on active filter
  const filteredCalls = useMemo(() => {
    if (activeFilter === "all") return callHistory;
    if (activeFilter === "missed")
      return callHistory.filter((c) => c.status === "missed");
    if (activeFilter === "incoming")
      return callHistory.filter((c) => !c.isOutgoing);
    if (activeFilter === "outgoing")
      return callHistory.filter((c) => c.isOutgoing);
    return callHistory;
  }, [callHistory, activeFilter]);

  // Count missed calls
  const missedCount = useMemo(() => {
    return callHistory.filter((c) => c.status === "missed").length;
  }, [callHistory]);

  // Clear missed calls badge khi vào màn hình này (Zalo-style)
  useEffect(() => {
    if (badges.missedCalls > 0) {
      clearBadge("missedCalls");
    }
  }, [badges.missedCalls, clearBadge]);

  const handleCallPress = (call: CallHistoryItem) => {
    // Tất cả cuộc gọi thực hiện trong app
    const otherUserId = call.otherUser.id;
    router.push(`/call/${otherUserId}?type=${call.type}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCallIcon = (call: CallHistoryItem) => {
    if (call.status === "missed") {
      return "call-outline";
    }
    return "call";
  };

  const renderCall = ({ item }: { item: CallHistoryItem }) => {
    const isIncoming = !item.isOutgoing;
    const statusColor = getCallStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.callItem}
        onPress={() => handleCallPress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            avatar={item.otherUser.avatar || null}
            userId={String(item.otherUser.id)}
            name={item.otherUser.name}
            pixelSize={56}
          />

          {/* Call type badge */}
          <View
            style={[
              styles.callTypeBadge,
              item.type === "video" ? styles.videoBadge : styles.audioBadge,
            ]}
          >
            <Ionicons
              name={item.type === "video" ? "videocam" : "call"}
              size={12}
              color="#fff"
            />
          </View>
        </View>

        {/* Call info */}
        <View style={styles.callInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUser.name}
          </Text>

          <View style={styles.callDetails}>
            <Ionicons
              name={getCallIcon(item)}
              size={14}
              color={statusColor}
              style={{
                transform: [
                  {
                    rotate: isIncoming ? "135deg" : "-45deg",
                  },
                ],
              }}
            />
            <Text style={[styles.callStatus, { color: statusColor }]}>
              {item.statusText}
            </Text>
            {item.durationText && item.durationText !== "0:00" && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.duration}>{item.durationText}</Text>
              </>
            )}
          </View>

          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>

        {/* Call action button - gọi trực tiếp trong app */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={() =>
            router.push(`/call/${item.otherUser.id}?type=${item.type}`)
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={item.type === "video" ? "videocam" : "call"}
            size={22}
            color="#0068FF"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!hasMoreHistory || callHistory.length === 0) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="call-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Chưa có cuộc gọi</Text>
        <Text style={styles.emptySubtitle}>
          Lịch sử cuộc gọi của bạn sẽ hiển thị ở đây
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải lịch sử cuộc gọi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#22C55E"
        translucent
      />

      {/* Call History Header - Zalo style */}
      <CallHistoryHeader
        title="Cuộc gọi"
        missedCount={missedCount}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSearchPress={() => router.push("/search-messages")}
      />

      {/* Calls list */}
      <FlatList
        data={filteredCalls}
        renderItem={renderCall}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshHistory}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        onEndReached={loadMoreHistory}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          callHistory.length === 0 ? styles.emptyList : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  callItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    alignItems: "center",
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
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  callTypeBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  videoBadge: {
    backgroundColor: "#3b82f6",
  },
  audioBadge: {
    backgroundColor: "#0066CC",
  },
  callInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  callDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  callStatus: {
    fontSize: 13,
    marginLeft: 6,
  },
  separator: {
    fontSize: 13,
    color: "#999",
    marginHorizontal: 6,
  },
  duration: {
    fontSize: 13,
    color: "#666",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#999",
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
