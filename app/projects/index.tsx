/**
 * Projects Index — Danh sách dự án
 * Route: /projects
 * Migrated to DS layout templates
 */

import { DSChip } from "@/components/ds";
import { DSListScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ── Types ──────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  location: string;
  manager: string;
}

// ── Data ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  planning: {
    label: "Lập kế hoạch",
    color: "#FF9800",
    icon: "clipboard-outline" as const,
  },
  in_progress: {
    label: "Đang thi công",
    color: "#2196F3",
    icon: "construct-outline" as const,
  },
  completed: {
    label: "Hoàn thành",
    color: "#4CAF50",
    icon: "checkmark-circle-outline" as const,
  },
  on_hold: {
    label: "Tạm dừng",
    color: "#F44336",
    icon: "pause-circle-outline" as const,
  },
};

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Nhà phố 3 tầng Quận 7",
    description: "Xây dựng nhà phố hiện đại 3 tầng với tầng hầm để xe",
    status: "in_progress",
    progress: 65,
    budget: 2500000000,
    spent: 1625000000,
    startDate: "2024-03-15",
    endDate: "2024-12-30",
    location: "Quận 7, TP.HCM",
    manager: "Nguyễn Văn Hùng",
  },
  {
    id: "proj-2",
    name: "Biệt thự vườn Thủ Đức",
    description: "Thiết kế và thi công biệt thự vườn phong cách Pháp",
    status: "planning",
    progress: 15,
    budget: 5000000000,
    spent: 150000000,
    startDate: "2024-06-01",
    location: "TP. Thủ Đức",
    manager: "Trần Minh Đức",
  },
  {
    id: "proj-3",
    name: "Căn hộ Penthouse Q1",
    description: "Nội thất cao cấp căn hộ Penthouse",
    status: "completed",
    progress: 100,
    budget: 800000000,
    spent: 785000000,
    startDate: "2024-01-10",
    endDate: "2024-04-20",
    location: "Quận 1, TP.HCM",
    manager: "Lê Thị Mai",
  },
  {
    id: "proj-4",
    name: "Văn phòng Startup Hub",
    description: "Cải tạo và fit-out văn phòng coworking space",
    status: "on_hold",
    progress: 40,
    budget: 1200000000,
    spent: 480000000,
    startDate: "2024-02-20",
    location: "Quận Bình Thạnh",
    manager: "Phạm Anh Tuấn",
  },
];

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "in_progress", label: "Đang làm" },
  { key: "completed", label: "Hoàn thành" },
] as const;

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
  const cfg = STATUS_CONFIG[project.status];
  const budgetPct = (project.spent / project.budget) * 100;

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
        {project.description}
      </Text>

      {/* Location */}
      <View style={st.row}>
        <Ionicons
          name="location-outline"
          size={14}
          color={colors.textTertiary}
        />
        <Text style={[st.locText, { color: colors.textTertiary }]}>
          {project.location}
        </Text>
      </View>

      {/* Progress */}
      <View style={{ marginTop: spacing.sm }}>
        <View style={st.spaceBetween}>
          <Text style={[st.label, { color: colors.textSecondary }]}>
            Tiến độ
          </Text>
          <Text style={[st.pctText, { color: colors.text }]}>
            {project.progress}%
          </Text>
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
                width: `${project.progress}%`,
                backgroundColor: cfg.color,
                borderRadius: radius.xs,
              },
            ]}
          />
        </View>
      </View>

      {/* Budget */}
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
            {formatCurrency(project.budget)}
          </Text>
        </View>
        <View style={[st.budgetDiv, { backgroundColor: colors.divider }]} />
        <View style={st.budgetItem}>
          <Text style={[st.label, { color: colors.textTertiary }]}>Đã chi</Text>
          <Text
            style={[
              st.budgetVal,
              { color: budgetPct > 90 ? colors.error : colors.text },
            ]}
          >
            {formatCurrency(project.spent)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[st.cardFooter, { borderTopColor: colors.divider }]}>
        <View style={st.row}>
          <Ionicons
            name="person-circle-outline"
            size={16}
            color={colors.textTertiary}
          />
          <Text style={[st.managerName, { color: colors.textSecondary }]}>
            {project.manager}
          </Text>
        </View>
        <Text style={[st.dateText, { color: colors.textTertiary }]}>
          {new Date(project.startDate).toLocaleDateString("vi-VN")}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function ProjectsIndexScreen() {
  const { colors, spacing } = useDS();
  const [filter, setFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredProjects = useMemo(() => {
    if (filter === "all") return MOCK_PROJECTS;
    return MOCK_PROJECTS.filter((p) => p.status === filter);
  }, [filter]);

  const stats = useMemo(
    () => ({
      total: MOCK_PROJECTS.length,
      inProgress: MOCK_PROJECTS.filter((p) => p.status === "in_progress")
        .length,
      completed: MOCK_PROJECTS.filter((p) => p.status === "completed").length,
    }),
    [],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
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
