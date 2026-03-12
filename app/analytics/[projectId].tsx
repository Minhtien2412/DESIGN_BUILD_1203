/**
 * Project Analytics Detail Screen
 * Phân tích chi tiết dự án - Budget, Timeline, Safety, Quality
 *
 * Features:
 * - Budget breakdown pie/bar visualization
 * - Timeline milestones with status
 * - Quality inspection results
 * - Safety incident tracking
 * - Export reports (PDF, Excel)
 *
 * API: GET /analytics/projects/:id via analyticsService
 * @created 2026-02-27
 */

import {
    analyticsService,
    type ProjectAnalytics,
} from "@/services/analyticsApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

const COLORS = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSec: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
};

const BUDGET_COLORS = [
  "#0D9488",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];
const TIMELINE_STATUS: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  completed: {
    label: "Hoàn thành",
    color: COLORS.success,
    icon: "checkmark-circle",
  },
  "in-progress": { label: "Đang thực hiện", color: COLORS.info, icon: "time" },
  pending: {
    label: "Chờ",
    color: COLORS.textSec,
    icon: "ellipsis-horizontal-circle",
  },
  delayed: { label: "Trễ hạn", color: COLORS.error, icon: "alert-circle" },
};

function fmt(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} tr`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${n}`;
}

function pct(n: number): string {
  return `${Math.round(n * 100) / 100}%`;
}

// ═══════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════

const StatCard = React.memo<{
  icon: string;
  label: string;
  value: string;
  color: string;
  sub?: string;
}>(({ icon, label, value, color, sub }) => (
  <View style={s.statCard}>
    <View style={[s.statIcon, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon as any} size={18} color={color} />
    </View>
    <Text style={s.statLabel}>{label}</Text>
    <Text style={[s.statValue, { color }]}>{value}</Text>
    {sub && <Text style={s.statSub}>{sub}</Text>}
  </View>
));

// ═══════════════════════════════════════════════════════════════════════
// PROGRESS RING
// ═══════════════════════════════════════════════════════════════════════

const ProgressRing = React.memo<{
  percent: number;
  color: string;
  size?: number;
  label: string;
}>(({ percent, color, size = 80, label }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const displayPercent = Math.min(100, Math.max(0, percent));

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background circle */}
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color + "20",
          }}
        />
        {/* We simulate filled circle with a percentage overlay */}
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: displayPercent > 25 ? color : "transparent",
            borderRightColor: displayPercent > 50 ? color : "transparent",
            borderBottomColor: displayPercent > 75 ? color : "transparent",
            transform: [{ rotate: "-90deg" }],
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "800", color }}>
          {Math.round(displayPercent)}%
        </Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          color: COLORS.textSec,
          marginTop: 6,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// BAR CHART
// ═══════════════════════════════════════════════════════════════════════

const HorizontalBar = React.memo<{
  label: string;
  allocated: number;
  spent: number;
  color: string;
}>(({ label, allocated, spent, color }) => {
  const ratio = allocated > 0 ? Math.min(1, spent / allocated) : 0;
  const overBudget = spent > allocated;

  return (
    <View style={s.barItem}>
      <View style={s.barHeader}>
        <View style={s.barLabelRow}>
          <View style={[s.barDot, { backgroundColor: color }]} />
          <Text style={s.barLabel}>{label}</Text>
        </View>
        <Text style={s.barValue}>
          {fmt(spent)} / {fmt(allocated)}
        </Text>
      </View>
      <View style={s.barTrack}>
        <View
          style={[
            s.barFill,
            {
              width: `${Math.min(100, ratio * 100)}%`,
              backgroundColor: overBudget ? COLORS.error : color,
            },
          ]}
        />
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// MILESTONE ITEM
// ═══════════════════════════════════════════════════════════════════════

const MilestoneItem = React.memo<{
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: string;
  isLast?: boolean;
}>(({ name, plannedDate, actualDate, status, isLast }) => {
  const config = TIMELINE_STATUS[status] || TIMELINE_STATUS.pending;
  return (
    <View style={s.milestoneItem}>
      <View style={s.milestoneTimeline}>
        <View style={[s.milestoneDot, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={14} color="#fff" />
        </View>
        {!isLast && (
          <View
            style={[s.milestoneLine, { backgroundColor: config.color + "30" }]}
          />
        )}
      </View>
      <View style={s.milestoneContent}>
        <Text style={s.milestoneName}>{name}</Text>
        <View style={s.milestoneDates}>
          <Text style={s.milestoneDate}>
            <Ionicons name="calendar-outline" size={10} /> Kế hoạch:{" "}
            {new Date(plannedDate).toLocaleDateString("vi-VN")}
          </Text>
          {actualDate && (
            <Text style={[s.milestoneDate, { color: config.color }]}>
              <Ionicons name="checkmark-circle-outline" size={10} /> Thực tế:{" "}
              {new Date(actualDate).toLocaleDateString("vi-VN")}
            </Text>
          )}
        </View>
        <View
          style={[s.milestoneStatus, { backgroundColor: config.color + "15" }]}
        >
          <Text style={[s.milestoneStatusText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function ProjectAnalyticsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await analyticsService.getProjectAnalytics(
        projectId || "default",
      );
      setData(result);
    } catch (error) {
      console.error("[ProjectAnalytics] Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleExport = useCallback(
    async (format: "pdf" | "excel" | "csv") => {
      setExporting(true);
      try {
        const result = await analyticsService.exportReport({
          reportType: "project",
          format,
          filters: { projectId: projectId || "default" },
        });
        Alert.alert(
          "Thành công",
          `Báo cáo đã được xuất: ${result.url || "OK"}`,
        );
      } catch (error) {
        Alert.alert("Lỗi", "Không thể xuất báo cáo");
      } finally {
        setExporting(false);
      }
    },
    [projectId],
  );

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.loadingText}>Đang tải phân tích...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={s.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="analytics-outline" size={64} color={COLORS.textSec} />
        <Text style={s.errorTitle}>Không có dữ liệu</Text>
        <TouchableOpacity style={s.retryBtn} onPress={loadData}>
          <Text style={s.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timelineStatusLabel =
    data.overview.timelineStatus === "on-track"
      ? "Đúng tiến độ"
      : data.overview.timelineStatus === "ahead"
        ? "Vượt tiến độ"
        : "Chậm tiến độ";
  const timelineStatusColor =
    data.overview.timelineStatus === "on-track"
      ? COLORS.success
      : data.overview.timelineStatus === "ahead"
        ? COLORS.info
        : COLORS.error;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={s.header}
        >
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={s.headerInfo}>
              <Text style={s.headerTitle} numberOfLines={1}>
                {data.projectName}
              </Text>
              <Text style={s.headerSub}>
                {data.period.startDate} → {data.period.endDate}
              </Text>
            </View>
            <TouchableOpacity
              style={s.exportBtn}
              onPress={() =>
                Alert.alert("Xuất báo cáo", "Chọn định dạng", [
                  { text: "PDF", onPress: () => handleExport("pdf") },
                  { text: "Excel", onPress: () => handleExport("excel") },
                  { text: "CSV", onPress: () => handleExport("csv") },
                  { text: "Hủy", style: "cancel" },
                ])
              }
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="share-outline" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Progress Rings */}
          <View style={s.ringsRow}>
            <ProgressRing
              percent={data.overview.progress}
              color="#fff"
              label="Tiến độ"
            />
            <ProgressRing
              percent={data.overview.budgetUtilization}
              color="#FCD34D"
              label="Ngân sách"
            />
            <ProgressRing
              percent={data.quality?.passRate || 0}
              color="#A7F3D0"
              label="Chất lượng"
            />
          </View>
        </LinearGradient>

        <ScrollView
          style={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* ─── OVERVIEW STATS ─── */}
          <View style={s.statsGrid}>
            <StatCard
              icon="checkmark-done-outline"
              label="Công việc"
              value={`${data.overview.tasksCompleted}/${data.overview.tasksTotal}`}
              color={COLORS.primary}
            />
            <StatCard
              icon="people-outline"
              label="Nhân sự"
              value={`${data.overview.teamSize}`}
              color={COLORS.info}
            />
            <StatCard
              icon="timer-outline"
              label="Tiến độ"
              value={timelineStatusLabel}
              color={timelineStatusColor}
              sub={`${data.timeline.daysRemaining} ngày còn lại`}
            />
            <StatCard
              icon="shield-checkmark-outline"
              label="An toàn"
              value={`${data.safety?.incidentsReported || 0}`}
              color={
                data.safety?.incidentsReported ? COLORS.warning : COLORS.success
              }
              sub="sự cố"
            />
          </View>

          {/* ─── BUDGET SECTION ─── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ngân sách</Text>
            <View style={s.budgetSummary}>
              <View style={s.budgetItem}>
                <Text style={s.budgetLabel}>Tổng ngân sách</Text>
                <Text style={s.budgetValue}>
                  {fmt(data.budget.totalBudget)}
                </Text>
              </View>
              <View style={s.budgetItem}>
                <Text style={s.budgetLabel}>Đã chi</Text>
                <Text style={[s.budgetValue, { color: COLORS.warning }]}>
                  {fmt(data.budget.spent)}
                </Text>
              </View>
              <View style={s.budgetItem}>
                <Text style={s.budgetLabel}>Còn lại</Text>
                <Text style={[s.budgetValue, { color: COLORS.success }]}>
                  {fmt(data.budget.remaining)}
                </Text>
              </View>
            </View>

            {/* Budget by Category */}
            <View style={s.budgetBars}>
              {data.budget.byCategory.map((cat, i) => (
                <HorizontalBar
                  key={cat.category}
                  label={cat.category}
                  allocated={cat.allocated}
                  spent={cat.spent}
                  color={BUDGET_COLORS[i % BUDGET_COLORS.length]}
                />
              ))}
            </View>
          </View>

          {/* ─── TIMELINE SECTION ─── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Mốc tiến độ</Text>
            <View style={s.timelineInfo}>
              <View style={s.timelineRow}>
                <Text style={s.timelineLabel}>Kế hoạch</Text>
                <Text style={s.timelineValue}>
                  {data.timeline.plannedDuration} ngày
                </Text>
              </View>
              <View style={s.timelineRow}>
                <Text style={s.timelineLabel}>Thực tế</Text>
                <Text style={s.timelineValue}>
                  {data.timeline.actualDuration} ngày
                </Text>
              </View>
            </View>

            {data.timeline.milestones.map((m, i) => (
              <MilestoneItem
                key={m.name}
                name={m.name}
                plannedDate={m.plannedDate}
                actualDate={m.actualDate}
                status={m.status}
                isLast={i === data.timeline.milestones.length - 1}
              />
            ))}
          </View>

          {/* ─── QUALITY SECTION ─── */}
          {data.quality && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Chất lượng</Text>
              <View style={s.qualityGrid}>
                <View style={s.qualityCard}>
                  <Ionicons
                    name="clipboard-outline"
                    size={20}
                    color={COLORS.info}
                  />
                  <Text style={s.qualityValue}>
                    {data.quality.inspectionsCompleted}
                  </Text>
                  <Text style={s.qualityLabel}>Kiểm tra</Text>
                </View>
                <View style={s.qualityCard}>
                  <Ionicons
                    name="checkmark-done"
                    size={20}
                    color={COLORS.success}
                  />
                  <Text style={s.qualityValue}>
                    {data.quality.inspectionsPassed}
                  </Text>
                  <Text style={s.qualityLabel}>Đạt</Text>
                </View>
                <View style={s.qualityCard}>
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={COLORS.error}
                  />
                  <Text style={s.qualityValue}>
                    {data.quality.defectsFound}
                  </Text>
                  <Text style={s.qualityLabel}>Lỗi phát hiện</Text>
                </View>
                <View style={s.qualityCard}>
                  <Ionicons
                    name="construct-outline"
                    size={20}
                    color={COLORS.warning}
                  />
                  <Text style={s.qualityValue}>
                    {data.quality.defectsResolved}
                  </Text>
                  <Text style={s.qualityLabel}>Đã sửa</Text>
                </View>
              </View>
            </View>
          )}

          {/* ─── RESOURCES SECTION ─── */}
          {data.resources && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Tài nguyên</Text>
              <View style={s.resourcesGrid}>
                <View style={s.resourceItem}>
                  <MaterialCommunityIcons
                    name="excavator"
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={s.resourceValue}>
                    {data.resources.equipment}
                  </Text>
                  <Text style={s.resourceLabel}>Thiết bị</Text>
                </View>
                <View style={s.resourceItem}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={24}
                    color={COLORS.warning}
                  />
                  <Text style={s.resourceValue}>
                    {data.resources.materials}
                  </Text>
                  <Text style={s.resourceLabel}>Vật liệu</Text>
                </View>
                <View style={s.resourceItem}>
                  <Ionicons name="people" size={24} color={COLORS.info} />
                  <Text style={s.resourceValue}>
                    {data.resources.workforce}
                  </Text>
                  <Text style={s.resourceLabel}>Nhân công</Text>
                </View>
                <View style={s.resourceItem}>
                  <Ionicons name="pulse" size={24} color={COLORS.success} />
                  <Text style={s.resourceValue}>
                    {pct(data.resources.utilization)}
                  </Text>
                  <Text style={s.resourceLabel}>Hiệu suất</Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSec },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    padding: 40,
  },
  errorTitle: { fontSize: 16, color: COLORS.textSec, marginVertical: 16 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  // Header
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  exportBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
  },

  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },

  // Content
  content: { flex: 1 },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 8,
  },
  statCard: {
    width: (SW - 40) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: { fontSize: 11, color: COLORS.textSec, marginTop: 8 },
  statValue: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  statSub: { fontSize: 10, color: COLORS.textSec, marginTop: 1 },

  // Section
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },

  // Budget
  budgetSummary: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  budgetItem: { flex: 1, alignItems: "center" },
  budgetLabel: { fontSize: 11, color: COLORS.textSec },
  budgetValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },
  budgetBars: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  barItem: { marginBottom: 10 },
  barHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  barLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  barDot: { width: 8, height: 8, borderRadius: 4 },
  barLabel: { fontSize: 12, color: COLORS.text, fontWeight: "500" },
  barValue: { fontSize: 11, color: COLORS.textSec },
  barTrack: { height: 6, backgroundColor: "#F1F5F9", borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },

  // Timeline
  timelineInfo: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  timelineLabel: { fontSize: 13, color: COLORS.textSec },
  timelineValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },

  // Milestone
  milestoneItem: { flexDirection: "row", marginBottom: 0 },
  milestoneTimeline: { width: 30, alignItems: "center" },
  milestoneDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneLine: { width: 2, flex: 1, marginVertical: 4 },
  milestoneContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginLeft: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  milestoneName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  milestoneDates: { marginTop: 6 },
  milestoneDate: { fontSize: 11, color: COLORS.textSec, marginTop: 2 },
  milestoneStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  milestoneStatusText: { fontSize: 10, fontWeight: "600" },

  // Quality
  qualityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  qualityCard: {
    width: (SW - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qualityValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 6,
  },
  qualityLabel: { fontSize: 11, color: COLORS.textSec, marginTop: 2 },

  // Resources
  resourcesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  resourceItem: {
    width: (SW - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resourceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 6,
  },
  resourceLabel: { fontSize: 11, color: COLORS.textSec, marginTop: 2 },
});
