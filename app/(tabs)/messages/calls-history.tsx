/**
 * Calls History Screen (Messages Tab)
 * ====================================
 *
 * Lịch sử cuộc gọi compact — Zalo-style
 * - Filter: Tất cả / Gọi nhỡ / Gọi đi / Gọi đến
 * - Quick callback (audio / video)
 * - Grouped by date sections
 * - Pull-to-refresh
 */

import { useCall } from "@/hooks/useCall";
import {
    type CallHistoryItem,
    type CallType,
} from "@/services/api/call.service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
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
  success: "#22C55E",
  danger: "#EF4444",
  warning: "#F59E0B",
  blue: "#3B82F6",
};

// ─── Filter ───
type Filter = "all" | "missed" | "outgoing" | "incoming";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "missed", label: "Gọi nhỡ" },
  { key: "outgoing", label: "Gọi đi" },
  { key: "incoming", label: "Gọi đến" },
];

// ─── Mock data (fallback when API unavailable) ───
const MOCK_CALLS: CallHistoryItem[] = [
  {
    id: 1,
    callerId: 1,
    calleeId: 2,
    roomId: "room-1",
    status: "ended",
    type: "video",
    duration: 325,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    caller: { id: 1, name: "Bạn", email: "" },
    callee: { id: 2, name: "Nguyễn Văn An", email: "an@email.com" },
    isOutgoing: true,
    otherUser: { id: 2, name: "Nguyễn Văn An", email: "an@email.com" },
    statusText: "5 phút 25 giây",
    durationText: "5:25",
  },
  {
    id: 2,
    callerId: 3,
    calleeId: 1,
    roomId: "room-2",
    status: "missed",
    type: "audio",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    caller: { id: 3, name: "Trần Thị Bình", email: "binh@email.com" },
    callee: { id: 1, name: "Bạn", email: "" },
    isOutgoing: false,
    otherUser: { id: 3, name: "Trần Thị Bình", email: "binh@email.com" },
    statusText: "Cuộc gọi nhỡ",
    durationText: "",
  },
  {
    id: 3,
    callerId: 1,
    calleeId: 4,
    roomId: "room-3",
    status: "ended",
    type: "audio",
    duration: 180,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    caller: { id: 1, name: "Bạn", email: "" },
    callee: { id: 4, name: "Lê Văn Cường", email: "cuong@email.com" },
    isOutgoing: true,
    otherUser: { id: 4, name: "Lê Văn Cường", email: "cuong@email.com" },
    statusText: "3 phút",
    durationText: "3:00",
  },
  {
    id: 4,
    callerId: 5,
    calleeId: 1,
    roomId: "room-4",
    status: "ended",
    type: "video",
    duration: 610,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    caller: { id: 5, name: "Phạm Minh Đức", email: "duc@email.com" },
    callee: { id: 1, name: "Bạn", email: "" },
    isOutgoing: false,
    otherUser: { id: 5, name: "Phạm Minh Đức", email: "duc@email.com" },
    statusText: "10 phút 10 giây",
    durationText: "10:10",
  },
  {
    id: 5,
    callerId: 6,
    calleeId: 1,
    roomId: "room-5",
    status: "rejected",
    type: "audio",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    caller: { id: 6, name: "Hoàng Thị Lan", email: "lan@email.com" },
    callee: { id: 1, name: "Bạn", email: "" },
    isOutgoing: false,
    otherUser: { id: 6, name: "Hoàng Thị Lan", email: "lan@email.com" },
    statusText: "Từ chối",
    durationText: "",
  },
  {
    id: 6,
    callerId: 1,
    calleeId: 7,
    roomId: "room-6",
    status: "missed",
    type: "video",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    caller: { id: 1, name: "Bạn", email: "" },
    callee: { id: 7, name: "Vũ Đình Toàn", email: "toan@email.com" },
    isOutgoing: true,
    otherUser: { id: 7, name: "Vũ Đình Toàn", email: "toan@email.com" },
    statusText: "Không trả lời",
    durationText: "",
  },
];

// ─── Helpers ───
function formatCallTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  if (days < 7) {
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return dayNames[d.getDay()];
  }
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatDuration(secs?: number): string {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0
    ? `${m}:${s.toString().padStart(2, "0")}`
    : `0:${s.toString().padStart(2, "0")}`;
}

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
export default function CallsHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Try using the real call hook
  const callHook = useCall({ autoLoadHistory: true, historyLimit: 50 });
  const rawCalls =
    callHook.callHistory.length > 0 ? callHook.callHistory : MOCK_CALLS;
  const loading = callHook.loading && callHook.callHistory.length === 0;

  // ─── Filtered calls ───
  const calls = useMemo(() => {
    let list = rawCalls;
    switch (filter) {
      case "missed":
        list = list.filter(
          (c) => c.status === "missed" || c.status === "rejected",
        );
        break;
      case "outgoing":
        list = list.filter((c) => c.isOutgoing);
        break;
      case "incoming":
        list = list.filter((c) => !c.isOutgoing);
        break;
    }
    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rawCalls, filter]);

  const missedCount = useMemo(
    () =>
      rawCalls.filter((c) => c.status === "missed" || c.status === "rejected")
        .length,
    [rawCalls],
  );

  // ─── Actions ───
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await callHook.refreshHistory?.();
    } catch {
      // keep mock
    }
    setRefreshing(false);
  }, [callHook]);

  const handleCallback = useCallback((userId: number, type: CallType) => {
    router.push({
      pathname: "/call/[userId]",
      params: { userId: String(userId), type },
    } as any);
  }, []);

  const handleOpenFullHistory = useCallback(() => {
    router.push("/call/unified-history" as any);
  }, []);

  // ─── Render call item ───
  const renderCall = useCallback(
    ({ item }: { item: CallHistoryItem }) => {
      const isMissed = item.status === "missed" || item.status === "rejected";
      const nameColor = isMissed ? C.danger : C.text;

      return (
        <TouchableOpacity
          style={s.callItem}
          activeOpacity={0.6}
          onPress={() => handleCallback(item.otherUser.id, item.type)}
        >
          {/* Avatar */}
          <View style={s.avatarWrap}>
            <View
              style={[
                s.avatar,
                {
                  backgroundColor: isMissed
                    ? "#FEE2E2"
                    : item.type === "video"
                      ? "#DBEAFE"
                      : C.primaryLight,
                },
              ]}
            >
              <Text
                style={[
                  s.avatarText,
                  {
                    color: isMissed
                      ? C.danger
                      : item.type === "video"
                        ? C.blue
                        : C.primary,
                  },
                ]}
              >
                {getInitials(item.otherUser.name)}
              </Text>
            </View>
            <View
              style={[
                s.callTypeDot,
                {
                  backgroundColor: item.type === "video" ? C.blue : C.primary,
                },
              ]}
            >
              <Ionicons
                name={item.type === "video" ? "videocam" : "call"}
                size={7}
                color="#fff"
              />
            </View>
          </View>

          {/* Info */}
          <View style={s.callInfo}>
            <View style={s.callTopRow}>
              <Text
                style={[s.callName, { color: nameColor }]}
                numberOfLines={1}
              >
                {item.otherUser.name}
              </Text>
              <Text style={s.callTime}>{formatCallTime(item.createdAt)}</Text>
            </View>
            <View style={s.callBottomRow}>
              <Ionicons
                name={item.isOutgoing ? "arrow-up" : "arrow-down"}
                size={12}
                color={isMissed ? C.danger : C.success}
                style={{ marginRight: 3 }}
              />
              <Text style={[s.callStatus, isMissed && { color: C.danger }]}>
                {isMissed
                  ? item.isOutgoing
                    ? "Không trả lời"
                    : "Cuộc gọi nhỡ"
                  : item.duration
                    ? formatDuration(item.duration)
                    : "Đã kết nối"}
              </Text>
              {item.type === "video" && (
                <View style={s.videoTag}>
                  <Text style={s.videoTagText}>Video</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick call buttons */}
          <View style={s.callActions}>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => handleCallback(item.otherUser.id, "audio")}
              activeOpacity={0.6}
            >
              <Ionicons name="call" size={15} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => handleCallback(item.otherUser.id, "video")}
              activeOpacity={0.6}
            >
              <Ionicons name="videocam" size={15} color={C.blue} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [handleCallback],
  );

  // ─── Header ───
  const renderHeader = () => (
    <View>
      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Ionicons name="call" size={16} color={C.primary} />
          <Text style={s.statNum}>{rawCalls.length}</Text>
          <Text style={s.statLabel}>Tổng</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="arrow-down" size={16} color={C.danger} />
          <Text style={[s.statNum, { color: C.danger }]}>{missedCount}</Text>
          <Text style={s.statLabel}>Nhỡ</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="videocam" size={16} color={C.blue} />
          <Text style={[s.statNum, { color: C.blue }]}>
            {rawCalls.filter((c) => c.type === "video").length}
          </Text>
          <Text style={s.statLabel}>Video</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="time" size={16} color={C.warning} />
          <Text style={[s.statNum, { color: C.warning }]}>
            {Math.round(
              rawCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / 60,
            )}
            p
          </Text>
          <Text style={s.statLabel}>Tổng phút</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterTab, filter === f.key && s.filterTabActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[s.filterText, filter === f.key && s.filterTextActive]}
            >
              {f.label}
            </Text>
            {f.key === "missed" && missedCount > 0 && (
              <View style={s.missedDot}>
                <Text style={s.missedDotText}>{missedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <Text style={s.countText}>{calls.length} cuộc gọi</Text>
    </View>
  );

  return (
    <View style={s.container}>
      {/* List */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <FlatList
          data={calls}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCall}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="call-outline" size={40} color={C.textMuted} />
              <Text style={s.emptyTitle}>
                {filter === "missed"
                  ? "Không có cuộc gọi nhỡ"
                  : "Chưa có cuộc gọi nào"}
              </Text>
              <Text style={s.emptyDesc}>
                Bắt đầu cuộc gọi với đồng nghiệp hoặc khách hàng
              </Text>
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
          ListFooterComponent={
            rawCalls.length > 0 ? (
              <TouchableOpacity
                style={s.footerBtn}
                onPress={handleOpenFullHistory}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={14} color={C.primary} />
                <Text style={s.footerBtnText}>Xem toàn bộ lịch sử</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
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

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  statNum: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  statLabel: {
    fontSize: 9,
    color: C.textMuted,
    fontWeight: "500",
  },

  // Filter
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textSec,
  },
  filterTextActive: {
    color: "#fff",
  },
  missedDot: {
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  missedDotText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#fff",
  },

  // Count
  countText: {
    fontSize: 11,
    color: C.textMuted,
    paddingHorizontal: 14,
    marginBottom: 6,
  },

  // Call item
  callItem: {
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
  callTypeDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.white,
  },
  callInfo: {
    flex: 1,
  },
  callTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  callName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginRight: 6,
  },
  callTime: {
    fontSize: 10,
    color: C.textMuted,
  },
  callBottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  callStatus: {
    fontSize: 11,
    color: C.textSec,
  },
  videoTag: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "#EFF6FF",
  },
  videoTagText: {
    fontSize: 9,
    fontWeight: "600",
    color: C.blue,
  },

  // Call actions
  callActions: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 6,
  },
  callBtn: {
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
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 17,
  },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: C.textMuted,
  },

  // Footer
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 5,
    marginTop: 8,
  },
  footerBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
  },
});
