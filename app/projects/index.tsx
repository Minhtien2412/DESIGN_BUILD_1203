/**
 * Projects Index — Danh sách dự án
 * Route: /projects
 * Migrated to DS layout templates + REAL API via useProjects hook
 */

import { DSChip } from "@/components/ds";
import { DSListScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";
import { type Project, useProjects } from "@/hooks/useProjects";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ── Data ───────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  planning: {
    label: "Lập kế hoạch",
    color: "#FF9800",
    icon: "clipboard-outline",
  },
  active: {
    label: "Đang thi công",
    color: "#2196F3",
    icon: "construct-outline",
  },
  in_progress: {
    label: "Đang thi công",
    color: "#2196F3",
    icon: "construct-outline",
  },
  completed: {
    label: "Hoàn thành",
    color: "#4CAF50",
    icon: "checkmark-circle-outline",
  },
  paused: {
    label: "Tạm dừng",
    color: "#F44336",
    icon: "pause-circle-outline",
  },
  on_hold: {
    label: "Tạm dừng",
    color: "#F44336",
    icon: "pause-circle-outline",
  },
};

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang làm" },
  { key: "planning", label: "Lập kế hoạch" },
  { key: "completed", label: "Hoàn thành" },
  { key: "paused", label: "Tạm dừng" },
] as const;

const DEFAULT_STATUS = {
  label: "Không rõ",
  color: "#9E9E9E",
  icon: "help-circle-outline" as keyof typeof Ionicons.glyphMap,
};

// ── Helpers ────────────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)} tỷ`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(0)} triệu`;
  return amount.toLocaleString("vi-VN");
}

// ── ProjectCard ────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  const { colors, spacing, radius, shadow } = useDS();
  const cfg = STATUS_CONFIG[project.status] || DEFAULT_STATUS;
  const budget = (project as any).budget || 0;
  const spent = (project as any).spent || 0;
  const progress = project.progress || 0;
  const budgetPct = budget > 0 ? (spent / budget) * 100 : 0;
  const location = (project as any).location || "";
  const manager = project.client?.name || (project as any).engineerName || "";
  const description = project.description || "";
  const startDate =
    (project as any).start_date || project.startDate || project.createdAt || "";

  return (
    <Pressable
      style={[
        st.card,
        shadow.sm,
        {
          backgroundColor: colors.bgSurface,
          borderRadius: radius.lg,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={onPress}
    >
      {/* Status + more */}
      <View style={st.cardHeader}>
        <View
          style={[
            st.statusBadge,
            { backgroundColor: cfg.color + "20", borderRadius: radius.full },
          ]}
        >
          <Ionicons name={cfg.icon} size={14} color={cfg.color} />
          <Text style={[st.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* Title & desc */}
      <Text style={[st.projectName, { color: colors.text }]} numberOfLines={1}>
        {project.name}
      </Text>
      <Text
        style={[st.projectDesc, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {description}
      </Text>

      {/* Location */}
      {location ? (
        <View style={st.row}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textTertiary}
          />
          <Text style={[st.locText, { color: colors.textTertiary }]}>
            {location}
          </Text>
        </View>
      ) : null}

      {/* Progress */}
      <View style={{ marginTop: spacing.sm }}>
        <View style={st.spaceBetween}>
          <Text style={[st.label, { color: colors.textSecondary }]}>
            Tiến độ
          </Text>
          <Text style={[st.pctText, { color: colors.text }]}>{progress}%</Text>
        </View>
        <View
          style={[
            st.progressBar,
            { backgroundColor: colors.bgMuted, borderRadius: radius.xs },
          ]}
        >
          <View
            style={[
              st.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: cfg.color,
                borderRadius: radius.xs,
              },
            ]}
          />
        </View>
      </View>

      {/* Budget */}
      {budget > 0 ? (
        <View
          style={[
            st.budgetRow,
            {
              borderTopColor: colors.divider,
              marginTop: spacing.sm,
              paddingTop: spacing.sm,
            },
          ]}
        >
          <View style={st.budgetItem}>
            <Text style={[st.label, { color: colors.textTertiary }]}>
              Ngân sách
            </Text>
            <Text style={[st.budgetVal, { color: colors.text }]}>
              {formatCurrency(budget)}
            </Text>
          </View>
          <View style={[st.budgetDiv, { backgroundColor: colors.divider }]} />
          <View style={st.budgetItem}>
            <Text style={[st.label, { color: colors.textTertiary }]}>
              Đã chi
            </Text>
            <Text
              style={[
                st.budgetVal,
                { color: budgetPct > 90 ? colors.error : colors.text },
              ]}
            >
              {formatCurrency(spent)}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Footer */}
      <View style={[st.cardFooter, { borderTopColor: colors.divider }]}>
        <View style={st.row}>
          <Ionicons
            name="person-circle-outline"
            size={16}
            color={colors.textTertiary}
          />
          <Text style={[st.managerName, { color: colors.textSecondary }]}>
            {manager || "Chưa gán"}
          </Text>
        </View>
        {startDate ? (
          <Text style={[st.dateText, { color: colors.textTertiary }]}>
            {new Date(startDate).toLocaleDateString("vi-VN")}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function ProjectsIndexScreen() {
  const { colors, spacing } = useDS();
  const [filter, setFilter] = useState<string>("all");
  const { projects, loading, error, refresh } = useProjects();

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.status === filter);
  }, [filter, projects]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      inProgress: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "completed").length,
    }),
    [projects],
  );

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const renderItem = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard
        project={item}
        onPress={() => router.push(`/projects/${item.id}` as Href)}
      />
    ),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Stats Row */}
        <View
          style={[
            st.statsRow,
            {
              backgroundColor: colors.bgSurface,
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <View style={st.stat}>
            <Text
              style={{ fontSize: 20, fontWeight: "700", color: colors.text }}
            >
              {stats.total}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Tổng
            </Text>
          </View>
          <View style={st.stat}>
            <Text
              style={{ fontSize: 20, fontWeight: "700", color: colors.info }}
            >
              {stats.inProgress}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Đang làm
            </Text>
          </View>
          <View style={st.stat}>
            <Text
              style={{ fontSize: 20, fontWeight: "700", color: colors.success }}
            >
              {stats.completed}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Hoàn thành
            </Text>
          </View>
        </View>
        {/* Filters */}
        <View
          style={[
            st.filterRow,
            {
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              gap: spacing.xs,
            },
          ]}
        >
          {FILTERS.map((f) => (
            <DSChip
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </View>
      </View>
    ),
    [filter, stats, colors, spacing],
  );

  return (
    <DSListScreen<Project>
      title="Dự án"
      subtitle={`${stats.total} dự án`}
      gradientHeader
      data={filteredProjects}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      refreshing={loading}
      onRefresh={onRefresh}
      ListHeaderComponent={ListHeader}
      emptyIcon="folder-open-outline"
      emptyTitle="Chưa có dự án nào"
      emptyMessage="Nhấn + để tạo dự án mới"
      fab={{
        icon: "add",
        onPress: () => router.push("/projects/create" as Href),
      }}
      headerRight={
        <Pressable
          onPress={() => router.push("/projects/management" as Href)}
          hitSlop={8}
          style={{ padding: 8 }}
        >
          <Ionicons name="settings-outline" size={22} color="#FFF" />
        </Pressable>
      }
    />
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  card: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: "500" },
  projectName: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  projectDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  locText: { fontSize: 12 },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontSize: 11 },
  pctText: { fontSize: 12, fontWeight: "600" },
  progressBar: { height: 6, overflow: "hidden" },
  progressFill: { height: "100%" },
  budgetRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1 },
  budgetItem: { flex: 1 },
  budgetDiv: { width: 1, height: 30, marginHorizontal: 16 },
  budgetVal: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  managerName: { fontSize: 12 },
  dateText: { fontSize: 11 },
  statsRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 12 },
  stat: {
    flex: 1,
    alignItems: "center",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap" },
});
