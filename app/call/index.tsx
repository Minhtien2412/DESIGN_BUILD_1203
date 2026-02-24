/**
 * Call Index - Lịch sử cuộc gọi
 * Route: /call
 * Data: API via unifiedCallService + AsyncStorage cache
 * @updated 2026-02-07
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router, Stack, useFocusEffect } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/useThemeColor";
import {
    getCallHistory,
    type UnifiedCall,
} from "@/services/unifiedCallService";

// ============================================================================
// TYPES & HELPERS
// ============================================================================
type FilterType = "all" | "missed" | "incoming" | "outgoing";

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: "all", label: "Tất cả", icon: "list" },
  { key: "missed", label: "Nhỡ", icon: "call-outline" },
  { key: "incoming", label: "Đến", icon: "arrow-down" },
  { key: "outgoing", label: "Đi", icon: "arrow-up" },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return "Vừa xong";
  if (diffHours < 24) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffHours < 48) return "Hôm qua";
  if (diffHours < 168) {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function getCallIcon(call: UnifiedCall): {
  name: string;
  color: string;
  bg: string;
} {
  if (call.status === "missed" || call.status === "no_answer") {
    return { name: "call", color: "#EF4444", bg: "#FEE2E2" };
  }
  if (call.type === "video") {
    return { name: "videocam", color: "#7C3AED", bg: "#EDE9FE" };
  }
  if (call.isOutgoing) {
    return { name: "call", color: "#0D9488", bg: "#CCFBF1" };
  }
  return { name: "call", color: "#10B981", bg: "#D1FAE5" };
}

function getStatusLabel(call: UnifiedCall): string {
  if (call.status === "missed" || call.status === "no_answer")
    return "Cuộc gọi nhỡ";
  if (call.type === "video") return "Video call";
  if (call.isOutgoing) return "Gọi đi";
  return "Gọi đến";
}

// ============================================================================
// CALL ITEM
// ============================================================================
const CallItem = memo<{ call: UnifiedCall }>(({ call }) => {
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icon");
  const cardBg = useThemeColor({}, "background");
  const icon = getCallIcon(call);
  const isMissed = call.status === "missed" || call.status === "no_answer";

  return (
    <Pressable
      style={[styles.callItem, { backgroundColor: cardBg }]}
      onPress={() =>
        router.push(`/call/${call.participant?.id || call.id}` as Href)
      }
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
    >
      {/* Avatar / Icon */}
      <View style={[styles.avatarBox, { backgroundColor: icon.bg }]}>
        {call.participant?.avatar ? (
          <Image
            source={{ uri: call.participant.avatar }}
            style={styles.avatarImage}
          />
        ) : (
          <Ionicons name="person" size={24} color={icon.color} />
        )}
        <View style={[styles.callTypeBadge, { backgroundColor: icon.bg }]}>
          {call.isOutgoing ? (
            <Ionicons name="arrow-up" size={10} color={icon.color} />
          ) : (
            <Ionicons name="arrow-down" size={10} color={icon.color} />
          )}
        </View>
      </View>

      {/* Info */}
      <View style={styles.callInfo}>
        <Text
          style={[styles.callName, { color: isMissed ? "#EF4444" : textColor }]}
          numberOfLines={1}
        >
          {call.participant?.name || "Không xác định"}
        </Text>
        <View style={styles.callMeta}>
          <Ionicons
            name={icon.name as any}
            size={13}
            color={isMissed ? "#EF4444" : mutedColor}
          />
          <Text
            style={[
              styles.callStatus,
              { color: isMissed ? "#EF4444" : mutedColor },
            ]}
          >
            {getStatusLabel(call)}
          </Text>
          {call.duration > 0 && (
            <Text style={[styles.callDuration, { color: mutedColor }]}>
              • {formatDuration(call.duration)}
            </Text>
          )}
        </View>
      </View>

      {/* Time + Action */}
      <View style={styles.callRight}>
        <Text style={[styles.timeText, { color: mutedColor }]}>
          {formatTime(call.createdAt)}
        </Text>
        <Pressable
          style={styles.callActionBtn}
          onPress={() =>
            router.push(`/call/${call.participant?.id || call.id}` as Href)
          }
          hitSlop={8}
        >
          <Ionicons
            name={call.type === "video" ? "videocam-outline" : "call-outline"}
            size={20}
            color="#0D9488"
          />
        </Pressable>
      </View>
    </Pressable>
  );
});

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function CallIndexScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, "background");
  const surfaceBg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icon");

  const [calls, setCalls] = useState<UnifiedCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch call history from API (with cache fallback)
  const fetchCalls = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      const result = await getCallHistory({ page: pageNum, limit: 30 });
      if (append) {
        setCalls((prev) => [...prev, ...result.calls]);
      } else {
        setCalls(result.calls);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.warn("[CallIndex] Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCalls(1);
    }, [fetchCalls]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCalls(1);
  }, [fetchCalls]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchCalls(page + 1, true);
    }
  }, [loading, hasMore, page, fetchCalls]);

  const filteredCalls = useMemo(() => {
    if (filter === "all") return calls;
    if (filter === "missed")
      return calls.filter(
        (c) => c.status === "missed" || c.status === "no_answer",
      );
    if (filter === "incoming") return calls.filter((c) => !c.isOutgoing);
    if (filter === "outgoing") return calls.filter((c) => c.isOutgoing);
    return calls;
  }, [calls, filter]);

  const missedCount = useMemo(
    () =>
      calls.filter((c) => c.status === "missed" || c.status === "no_answer")
        .length,
    [calls],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.container, { backgroundColor: bg }]}>
        {/* Header */}
        <LinearGradient
          colors={["#0D9488", "#0F766E"]}
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>Cuộc gọi</Text>
            <Pressable
              onPress={() => router.push("/call/history" as Href)}
              hitSlop={12}
            >
              <Ionicons name="time-outline" size={24} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calls.length}</Text>
              <Text style={styles.statLabel}>Tổng cộng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#FCA5A5" }]}>
                {missedCount}
              </Text>
              <Text style={styles.statLabel}>Nhỡ</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {calls.filter((c) => c.isOutgoing).length}
              </Text>
              <Text style={styles.statLabel}>Gọi đi</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={[styles.filterRow, { backgroundColor: surfaceBg }]}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Ionicons
                name={f.icon as any}
                size={14}
                color={filter === f.key ? "#fff" : mutedColor}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? "#fff" : textColor },
                ]}
              >
                {f.label}
                {f.key === "missed" && missedCount > 0
                  ? ` (${missedCount})`
                  : ""}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Call List */}
        {loading && calls.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={[styles.loadingText, { color: mutedColor }]}>
              Đang tải lịch sử cuộc gọi...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCalls}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CallItem call={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0D9488"]}
                tintColor="#0D9488"
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              hasMore && calls.length > 0 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#0D9488" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="call-outline" size={48} color="#CBD5E1" />
                </View>
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  Chưa có cuộc gọi nào
                </Text>
                <Text style={[styles.emptySubtitle, { color: mutedColor }]}>
                  Lịch sử cuộc gọi sẽ hiển thị ở đây
                </Text>
              </View>
            }
          />
        )}

        {/* Quick Actions */}
        <View style={[styles.quickActions, { bottom: insets.bottom + 16 }]}>
          <Pressable
            style={[styles.quickBtn, { backgroundColor: "#0D9488" }]}
            onPress={() => router.push("/call/video" as Href)}
          >
            <Ionicons name="videocam" size={22} color="#fff" />
            <Text style={styles.quickBtnText}>Video Call</Text>
          </Pressable>
          <Pressable
            style={[styles.quickBtn, { backgroundColor: "#0D9488" }]}
            onPress={() => router.push("/meetings" as Href)}
          >
            <Ionicons name="people" size={22} color="#fff" />
            <Text style={styles.quickBtnText}>Họp nhóm</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 16,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  filterChipActive: { backgroundColor: "#0D9488" },
  filterText: { fontSize: 13, fontWeight: "500" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  listContent: { paddingBottom: 120 },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  callTypeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  callInfo: { flex: 1, marginLeft: 12 },
  callName: { fontSize: 15, fontWeight: "600" },
  callMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  callStatus: { fontSize: 12 },
  callDuration: { fontSize: 12 },
  callRight: { alignItems: "flex-end", gap: 6 },
  timeText: { fontSize: 12 },
  callActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(13,148,136,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.04)",
    marginLeft: 76,
  },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
  emptyContainer: { alignItems: "center", paddingVertical: 80, gap: 8 },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySubtitle: { fontSize: 13 },
  quickActions: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  quickBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
