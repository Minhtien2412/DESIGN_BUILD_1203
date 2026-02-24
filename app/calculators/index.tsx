/**
 * Dự toán xây dựng — Project Hub
 * ================================
 * Grand, modern estimation dashboard with project-based workflow.
 * Minimal icons, focus on data density and easy project management.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BUILDING_TYPE_META,
    type EstimateProject,
    GRADE_META,
    type ProjectStatus,
    deleteProject,
    duplicateProject,
    formatDate,
    formatVND,
    getAllProjects,
    seqLabel,
} from "@/services/constructionEstimateEngine";

// ─── Palette ───────────────────────────────────────────────────────
const C = {
  bg: "#F3F4F6",
  card: "#FFFFFF",
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#CCFBF1",
  accent: "#0D9488",
  warn: "#F59E0B",
  danger: "#EF4444",
  text: "#111827",
  textSec: "#6B7280",
  textTer: "#9CA3AF",
  border: "#E5E7EB",
  badgeDraft: "#FEF3C7",
  badgeActive: "#CCFBF1",
  badgeDone: "#D1FAE5",
  badgeArchived: "#F3F4F6",
} as const;

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Nháp",
  "in-progress": "Đang thực hiện",
  completed: "Hoàn thành",
  archived: "Lưu trữ",
};
const STATUS_COLOR: Record<ProjectStatus, string> = {
  draft: C.warn,
  "in-progress": C.accent,
  completed: C.primary,
  archived: C.textTer,
};
const STATUS_BG: Record<ProjectStatus, string> = {
  draft: C.badgeDraft,
  "in-progress": C.badgeActive,
  completed: C.badgeDone,
  archived: C.badgeArchived,
};

// ─── Component ─────────────────────────────────────────────────────
export default function EstimateHub() {
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<EstimateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">(
    "all",
  );

  // ── Load ─────────────────
  const load = useCallback(async () => {
    try {
      const list = await getAllProjects();
      setProjects(list);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // ── Filter & Search ──────
  const filtered = useMemo(() => {
    let list = projects;
    if (filterStatus !== "all")
      list = list.filter((p) => p.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.clientName && p.clientName.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          seqLabel(p.seq).toLowerCase().includes(q),
      );
    }
    return list;
  }, [projects, filterStatus, search]);

  // ── Stats ────────────────
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "in-progress").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const totalValue = projects.reduce(
      (s, p) => s + (p.lastResult?.grandTotal || 0),
      0,
    );
    return { total, active, completed, totalValue };
  }, [projects]);

  // ── Actions ──────────────
  const onNewProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/calculators/project-estimate" as any);
  };

  const onOpenProject = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/calculators/project-estimate?id=${id}` as any);
  };

  const onDuplicate = async (p: EstimateProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await duplicateProject(p.id);
    load();
  };

  const onDelete = (p: EstimateProject) => {
    Alert.alert(
      "Xóa dự toán",
      `Xóa "${p.name}"? Hành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            await deleteProject(p.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            load();
          },
        },
      ],
    );
  };

  const onLongPress = (p: EstimateProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(seqLabel(p.seq), p.name, [
      { text: "Mở", onPress: () => onOpenProject(p.id) },
      { text: "Nhân bản", onPress: () => onDuplicate(p) },
      { text: "Xóa", style: "destructive", onPress: () => onDelete(p) },
      { text: "Đóng", style: "cancel" },
    ]);
  };

  // ── Render helpers ───────
  const renderStatCard = (label: string, value: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]} key={label}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderProject = ({ item }: { item: EstimateProject }) => {
    const bt = BUILDING_TYPE_META[item.buildingType];
    const gr = GRADE_META[item.grade];
    const total = item.lastResult?.grandTotal;
    const perM2 = item.lastResult?.perM2;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.projectCard,
          pressed && styles.cardPressed,
        ]}
        onPress={() => onOpenProject(item.id)}
        onLongPress={() => onLongPress(item)}
        android_ripple={{ color: C.primaryLight }}
      >
        {/* Top: seq + status */}
        <View style={styles.cardTopRow}>
          <Text style={styles.seqText}>{seqLabel(item.seq)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_BG[item.status] },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLOR[item.status] },
              ]}
            />
            <Text
              style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}
            >
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Meta row */}
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>{bt.label}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.cardMeta}>{gr.label}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.cardMeta}>{item.floors.length} tầng</Text>
          <View style={styles.metaDot} />
          <Text style={styles.cardMeta}>{item.landArea} m²</Text>
        </View>

        {/* Client + address */}
        {(item.clientName || item.address) && (
          <Text style={styles.cardSub} numberOfLines={1}>
            {[item.clientName, item.address].filter(Boolean).join(" · ")}
          </Text>
        )}

        {/* Bottom: cost + date */}
        <View style={styles.cardBottom}>
          <View>
            {total ? (
              <>
                <Text style={styles.cardTotal}>{formatVND(total)}</Text>
                {perM2 ? (
                  <Text style={styles.cardPerM2}>{formatVND(perM2)}/m²</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.cardNoCost}>Chưa tính toán</Text>
            )}
          </View>
          <Text style={styles.cardDate}>{formatDate(item.updatedAt)}</Text>
        </View>
      </Pressable>
    );
  };

  // ── Empty state ──────────
  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Ionicons name="document-text-outline" size={56} color={C.textTer} />
      <Text style={styles.emptyTitle}>
        {search ? "Không tìm thấy dự toán" : "Chưa có dự toán nào"}
      </Text>
      <Text style={styles.emptyDesc}>
        {search
          ? "Thử thay đổi từ khóa tìm kiếm"
          : "Tạo dự toán đầu tiên để bắt đầu tính toán chi phí xây dựng chi tiết"}
      </Text>
      {!search && (
        <Pressable style={styles.emptyBtn} onPress={onNewProject}>
          <Text style={styles.emptyBtnText}>Tạo dự toán mới</Text>
        </Pressable>
      )}
    </View>
  );

  // ── Main render ──────────
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={[C.primaryDark, C.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Dự toán xây dựng</Text>
            <Text style={styles.headerSub}>Quản lý & tính toán chi phí</Text>
          </View>
          <Pressable style={styles.newBtn} onPress={onNewProject}>
            <Ionicons name="add" size={22} color={C.primary} />
            <Text style={styles.newBtnText}>Tạo mới</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {renderStatCard("Tổng dự toán", String(stats.total), "#fff")}
          {renderStatCard("Đang thực hiện", String(stats.active), C.warn)}
          {renderStatCard("Hoàn thành", String(stats.completed), "#10B981")}
          {renderStatCard(
            "Tổng giá trị",
            formatVND(stats.totalValue),
            C.accent,
          )}
        </View>
      </LinearGradient>

      {/* ── Feature Cards ── */}
      <View style={styles.featureRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featureScroll}
        >
          {(
            [
              {
                icon: "flash-outline" as const,
                label: "Dự toán nhanh",
                color: "#F59E0B",
                route: "/calculators/quick-estimate",
              },
              {
                icon: "albums-outline" as const,
                label: "Mẫu dự toán",
                color: "#8B5CF6",
                route: "/calculators/templates",
              },
              {
                icon: "list-outline" as const,
                label: "Bảng vật tư",
                color: "#0D9488",
                route: "/calculators/material-list",
              },
              {
                icon: "calendar-outline" as const,
                label: "Lịch thanh toán",
                color: "#EC4899",
                route: "/calculators/payment-schedule",
              },
              {
                icon: "git-compare-outline" as const,
                label: "So sánh",
                color: "#10B981",
                route: "/calculators/compare",
              },
            ] as const
          ).map((f) => (
            <Pressable
              key={f.route}
              style={styles.featureCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(f.route as any);
              }}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: f.color + "18" },
                ]}
              >
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Search + Filter ── */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={C.textTer} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, khách hàng, mã..."
            placeholderTextColor={C.textTer}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={C.textTer} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {(
            ["all", "draft", "in-progress", "completed", "archived"] as const
          ).map((st) => {
            const active = filterStatus === st;
            const label = st === "all" ? "Tất cả" : STATUS_LABEL[st];
            return (
              <Pressable
                key={st}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilterStatus(st);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Project List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={renderProject}
        contentContainerStyle={[
          styles.listContent,
          filtered.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            colors={[C.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  newBtnText: { fontSize: 13, fontWeight: "600", color: C.primary },

  // Stats
  statsRow: { flexDirection: "row", marginTop: 14, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
  },
  statValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 },

  // Feature cards
  featureRow: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  featureScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  featureCard: {
    alignItems: "center",
    width: 72,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textSec,
    textAlign: "center",
  },

  // Filter
  filterBar: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  filterChips: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.bg,
  },
  chipActive: { backgroundColor: C.primaryLight },
  chipText: { fontSize: 12, fontWeight: "500", color: C.textSec },
  chipTextActive: { color: C.primary, fontWeight: "600" },

  // List
  listContent: { padding: 16, gap: 12, paddingBottom: 100 },

  // Card
  projectCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  seqText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cardMeta: { fontSize: 12, color: C.textSec },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.border,
  },
  cardSub: { fontSize: 12, color: C.textTer, marginTop: 2, marginBottom: 4 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  cardTotal: { fontSize: 18, fontWeight: "800", color: C.primary },
  cardPerM2: { fontSize: 11, color: C.textSec, marginTop: 1 },
  cardNoCost: { fontSize: 13, color: C.textTer, fontStyle: "italic" },
  cardDate: { fontSize: 11, color: C.textTer },

  // Empty
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
