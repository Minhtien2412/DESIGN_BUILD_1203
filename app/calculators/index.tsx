/**
 * Dự toán xây dựng — Project Hub (DS-Migrated)
 * Route: /calculators
 */

import { useDS } from "@/hooks/useDS";
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

// ── Meta ───────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Nháp",
  "in-progress": "Đang thực hiện",
  completed: "Hoàn thành",
  archived: "Lưu trữ",
};
const STATUS_ALL = [
  "all",
  "draft",
  "in-progress",
  "completed",
  "archived",
] as const;

const FEATURES = [
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
] as const;

// ── ProjectCard ────────────────────────────────────────────────────────
function ProjectCard({
  item,
  onOpen,
  onLong,
  colors,
  radius,
}: {
  item: EstimateProject;
  onOpen: () => void;
  onLong: () => void;
  colors: any;
  radius: any;
}) {
  const bt = BUILDING_TYPE_META[item.buildingType];
  const gr = GRADE_META[item.grade];
  const total = item.lastResult?.grandTotal;
  const perM2 = item.lastResult?.perM2;
  const statusColor =
    item.status === "draft"
      ? "#F59E0B"
      : item.status === "in-progress"
        ? "#0D9488"
        : item.status === "completed"
          ? "#10B981"
          : colors.textTertiary;
  const statusBg = statusColor + "18";

  return (
    <Pressable
      style={({ pressed }) => [
        st.card,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
          borderRadius: radius.xl,
        },
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}
      onPress={onOpen}
      onLongPress={onLong}
      android_ripple={{ color: colors.primary + "15" }}
    >
      <View style={st.cardTop}>
        <Text style={[st.seq, { color: colors.primary }]}>
          {seqLabel(item.seq)}
        </Text>
        <View
          style={[
            st.badge,
            { backgroundColor: statusBg, borderRadius: radius.full },
          ]}
        >
          <View style={[st.dot, { backgroundColor: statusColor }]} />
          <Text style={[st.badgeText, { color: statusColor }]}>
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
      </View>
      <Text style={[st.cardName, { color: colors.text }]} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={st.metaRow}>
        <Text style={[st.meta, { color: colors.textSecondary }]}>
          {bt.label}
        </Text>
        <View style={[st.metaDot, { backgroundColor: colors.border }]} />
        <Text style={[st.meta, { color: colors.textSecondary }]}>
          {gr.label}
        </Text>
        <View style={[st.metaDot, { backgroundColor: colors.border }]} />
        <Text style={[st.meta, { color: colors.textSecondary }]}>
          {item.floors.length} tầng
        </Text>
        <View style={[st.metaDot, { backgroundColor: colors.border }]} />
        <Text style={[st.meta, { color: colors.textSecondary }]}>
          {item.landArea} m²
        </Text>
      </View>
      {(item.clientName || item.address) && (
        <Text
          style={[st.cardSub, { color: colors.textTertiary }]}
          numberOfLines={1}
        >
          {[item.clientName, item.address].filter(Boolean).join(" · ")}
        </Text>
      )}
      <View style={[st.cardBottom, { borderTopColor: colors.divider }]}>
        <View>
          {total ? (
            <>
              <Text style={[st.total, { color: colors.primary }]}>
                {formatVND(total)}
              </Text>
              {perM2 ? (
                <Text style={[st.perM2, { color: colors.textSecondary }]}>
                  {formatVND(perM2)}/m²
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={[st.noCost, { color: colors.textTertiary }]}>
              Chưa tính toán
            </Text>
          )}
        </View>
        <Text style={[st.date, { color: colors.textTertiary }]}>
          {formatDate(item.updatedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export default function EstimateHub() {
  const { colors, spacing, radius, shadow, isDark } = useDS();
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<EstimateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">(
    "all",
  );

  const load = useCallback(async () => {
    try {
      setProjects(await getAllProjects());
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

  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "in-progress").length,
      completed: projects.filter((p) => p.status === "completed").length,
      totalValue: projects.reduce(
        (s, p) => s + (p.lastResult?.grandTotal || 0),
        0,
      ),
    }),
    [projects],
  );

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };
  const openProject = (id: string) =>
    go(`/calculators/project-estimate?id=${id}`);
  const newProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/calculators/project-estimate" as any);
  };

  const onLongPress = (p: EstimateProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(seqLabel(p.seq), p.name, [
      { text: "Mở", onPress: () => openProject(p.id) },
      {
        text: "Nhân bản",
        onPress: async () => {
          await duplicateProject(p.id);
          load();
        },
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () =>
          Alert.alert("Xóa dự toán", `Xóa "${p.name}"?`, [
            { text: "Hủy", style: "cancel" },
            {
              text: "Xóa",
              style: "destructive",
              onPress: async () => {
                await deleteProject(p.id);
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                load();
              },
            },
          ]),
      },
      { text: "Đóng", style: "cancel" },
    ]);
  };

  if (loading)
    return (
      <View
        style={[
          st.screen,
          {
            backgroundColor: colors.bg,
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  const StatCard = ({
    label,
    value,
    accent,
  }: {
    label: string;
    value: string;
    accent: string;
  }) => (
    <View style={[st.statCard, { borderLeftColor: accent }]}>
      <Text style={st.statVal}>{value}</Text>
      <Text style={st.statLbl}>{label}</Text>
    </View>
  );

  return (
    <View
      style={[
        st.screen,
        { backgroundColor: colors.bg, paddingTop: insets.top },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#0f4f4a", "#0D9488"] : ["#0F766E", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.header}
      >
        <View style={st.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={st.headerTitle}>Dự toán xây dựng</Text>
            <Text style={st.headerSub}>Quản lý & tính toán chi phí</Text>
          </View>
          <Pressable style={st.newBtn} onPress={newProject}>
            <Ionicons name="add" size={22} color="#0D9488" />
            <Text style={st.newBtnText}>Tạo mới</Text>
          </Pressable>
        </View>
        <View style={st.statsRow}>
          <StatCard
            label="Tổng dự toán"
            value={String(stats.total)}
            accent="#fff"
          />
          <StatCard
            label="Đang thực hiện"
            value={String(stats.active)}
            accent="#F59E0B"
          />
          <StatCard
            label="Hoàn thành"
            value={String(stats.completed)}
            accent="#10B981"
          />
          <StatCard
            label="Tổng giá trị"
            value={formatVND(stats.totalValue)}
            accent="#0D9488"
          />
        </View>
      </LinearGradient>

      {/* Features */}
      <View
        style={[
          st.featureRow,
          {
            backgroundColor: colors.bgSurface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 10 }}
        >
          {FEATURES.map((f) => (
            <Pressable
              key={f.route}
              style={{ alignItems: "center", width: 72 }}
              onPress={() => go(f.route)}
            >
              <View
                style={[
                  st.featureIcon,
                  { backgroundColor: f.color + "18", borderRadius: radius.lg },
                ]}
              >
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={[st.featureLabel, { color: colors.textSecondary }]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Search + Filter */}
      <View
        style={[
          st.filterBar,
          {
            backgroundColor: colors.bgSurface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            st.searchBox,
            { backgroundColor: colors.bgMuted, borderRadius: radius.md },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[st.searchInput, { color: colors.text }]}
            placeholder="Tìm theo tên, khách hàng, mã..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: 10,
            paddingBottom: 6,
            gap: 8,
          }}
        >
          {STATUS_ALL.map((s) => {
            const active = filterStatus === s;
            const label = s === "all" ? "Tất cả" : STATUS_LABEL[s];
            return (
              <Pressable
                key={s}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilterStatus(s);
                }}
                style={[
                  st.chip,
                  {
                    backgroundColor: active
                      ? colors.primary + "15"
                      : colors.bgMuted,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    st.chipText,
                    {
                      color: active ? colors.primary : colors.textSecondary,
                      fontWeight: active ? "600" : "500",
                    },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProjectCard
            item={item}
            onOpen={() => openProject(item.id)}
            onLong={() => onLongPress(item)}
            colors={colors}
            radius={radius}
          />
        )}
        contentContainerStyle={[
          st.listContent,
          filtered.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={
          <View style={st.emptyWrap}>
            <Ionicons
              name="document-text-outline"
              size={56}
              color={colors.textTertiary}
            />
            <Text style={[st.emptyTitle, { color: colors.text }]}>
              {search ? "Không tìm thấy dự toán" : "Chưa có dự toán nào"}
            </Text>
            <Text style={[st.emptyDesc, { color: colors.textSecondary }]}>
              {search
                ? "Thử thay đổi từ khóa tìm kiếm"
                : "Tạo dự toán đầu tiên để bắt đầu tính toán chi phí xây dựng chi tiết"}
            </Text>
            {!search && (
              <Pressable
                style={[
                  st.emptyBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: radius.full,
                  },
                ]}
                onPress={newProject}
              >
                <Text style={st.emptyBtnText}>Tạo dự toán mới</Text>
              </Pressable>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  screen: { flex: 1 },
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
  newBtnText: { fontSize: 13, fontWeight: "600", color: "#0D9488" },
  statsRow: { flexDirection: "row", marginTop: 14, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
  },
  statVal: { fontSize: 16, fontWeight: "700", color: "#fff" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  featureRow: { paddingVertical: 10, borderBottomWidth: 1 },
  featureIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  featureLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  filterBar: { paddingTop: 10, paddingBottom: 6, borderBottomWidth: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontSize: 12 },
  listContent: { padding: 16, gap: 12, paddingBottom: 100 },
  // Card
  card: { padding: 16, borderWidth: 1 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  seq: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  meta: { fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  cardSub: { fontSize: 12, marginTop: 2, marginBottom: 4 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  total: { fontSize: 18, fontWeight: "800" },
  perM2: { fontSize: 11, marginTop: 1 },
  noCost: { fontSize: 13, fontStyle: "italic" },
  date: { fontSize: 11 },
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
    marginTop: 16,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 19,
  },
  emptyBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
