/**
 * Call Index Page - Lịch sử cuộc gọi
 * Route: /call
 */

import { Ionicons } from "@expo/vector-icons";
import { Href, router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CallRecord {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  type: "incoming" | "outgoing" | "missed" | "video";
  duration?: number; // seconds
  timestamp: Date;
}

const MOCK_CALLS: CallRecord[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    type: "incoming",
    duration: 125,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    name: "Shop Vật Liệu XYZ",
    phone: "0287654321",
    type: "outgoing",
    duration: 300,
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: "3",
    name: "Thợ Xây Minh",
    phone: "0909876543",
    type: "missed",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: "4",
    name: "Kiến trúc sư Hùng",
    phone: "0918765432",
    type: "video",
    duration: 1800,
    timestamp: new Date(Date.now() - 172800000),
  },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return "Vừa xong";
  if (diffHours < 24) return `${Math.floor(diffHours)} giờ trước`;
  if (diffHours < 48) return "Hôm qua";
  return date.toLocaleDateString("vi-VN");
}

function CallItem({
  call,
  onPress,
}: {
  call: CallRecord;
  onPress: () => void;
}) {
  const iconConfig = {
    incoming: { name: "call-received" as const, color: "#4CAF50" },
    outgoing: { name: "call-made" as const, color: "#2196F3" },
    missed: { name: "call-missed" as const, color: "#F44336" },
    video: { name: "videocam" as const, color: "#9C27B0" },
  };

  const config = iconConfig[call.type];

  return (
    <Pressable style={styles.callItem} onPress={onPress}>
      <View
        style={[
          styles.avatarContainer,
          { backgroundColor: config.color + "20" },
        ]}
      >
        <Ionicons name="person" size={24} color={config.color} />
      </View>

      <View style={styles.callInfo}>
        <ThemedText style={styles.callName}>{call.name}</ThemedText>
        <View style={styles.callMeta}>
          <Ionicons name={config.name as any} size={14} color={config.color} />
          <ThemedText style={styles.callPhone}>{call.phone}</ThemedText>
          {call.duration && (
            <ThemedText style={styles.callDuration}>
              • {formatDuration(call.duration)}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.callTime}>
        <ThemedText style={styles.timeText}>
          {formatTime(call.timestamp)}
        </ThemedText>
        <Pressable style={styles.callButton}>
          <Ionicons name="call" size={20} color="#4CAF50" />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function CallIndexScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "missed">("all");
  const backgroundColor = useThemeColor({}, "background");

  const filteredCalls = useMemo(() => {
    if (filter === "missed") {
      return MOCK_CALLS.filter((c) => c.type === "missed");
    }
    return MOCK_CALLS;
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Cuộc gọi",
          headerStyle: { backgroundColor: "#4CAF50" },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <Pressable
              style={styles.headerButton}
              onPress={() => router.push("/call/history" as Href)}
            >
              <Ionicons name="time-outline" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor }]}>
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <Pressable
            style={[
              styles.filterTab,
              filter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <ThemedText
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              Tất cả
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.filterTab,
              filter === "missed" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("missed")}
          >
            <ThemedText
              style={[
                styles.filterText,
                filter === "missed" && styles.filterTextActive,
              ]}
            >
              Nhỡ
            </ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={filteredCalls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CallItem
              call={item}
              onPress={() => router.push(`/call/${item.id}` as Href)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="call-outline" size={64} color="#CCCCCC" />
              <ThemedText style={styles.emptyText}>
                Chưa có cuộc gọi nào
              </ThemedText>
            </View>
          }
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={[styles.quickAction, { backgroundColor: "#4CAF50" }]}
            onPress={() => router.push("/call/video" as Href)}
          >
            <Ionicons name="videocam" size={24} color="#FFFFFF" />
            <ThemedText style={styles.quickActionText}>Video Call</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.quickAction, { backgroundColor: "#2196F3" }]}
            onPress={() => router.push("/meetings" as Href)}
          >
            <Ionicons name="people" size={24} color="#FFFFFF" />
            <ThemedText style={styles.quickActionText}>Họp nhóm</ThemedText>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: {
    borderBottomColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#757575",
  },
  filterTextActive: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 100,
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  callInfo: {
    flex: 1,
    marginLeft: 12,
  },
  callName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  callMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  callPhone: {
    fontSize: 13,
    color: "#757575",
  },
  callDuration: {
    fontSize: 13,
    color: "#757575",
  },
  callTime: {
    alignItems: "flex-end",
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#999999",
  },
  callButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#888888",
  },
  quickActions: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  quickActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
