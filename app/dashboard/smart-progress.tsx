/**
 * Smart Progress Dashboard
 * Cross-project progress view with delay detection + bottleneck highlighting
 * Uses timelineApi (phases/milestones/tasks) + real-time WebSocket updates
 */

import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import {
    type Phase,
    type PhaseStatus,
    type Task,
    getPhases,
    getTasks,
} from "@/services/timelineApi";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

const C = {
  primary: "#7FAF4D",
  primaryBg: "#EEF7DA",
  blue: "#3B82F6",
  blueBg: "#EFF6FF",
  orange: "#F59E0B",
  orangeBg: "#FFFBEB",
  red: "#EF4444",
  redBg: "#FEF2F2",
  purple: "#8B5CF6",
  purpleBg: "#F5F3FF",
  teal: "#14B8A6",
  text: "#111827",
  textSec: "#6B7280",
  bg: "#F9FAFB",
  card: "#FFFFFF",
  border: "#E5E7EB",
  gray: "#9CA3AF",
};

interface ProjectSnapshot {
  projectId: string;
  projectName: string;
  phases: Phase[];
  tasks: Task[];
  overallProgress: number;
  delayedPhases: Phase[];
  blockedTasks: Task[];
  urgentTasks: Task[];
}

// Dynamic project fetching — no more hardcoded IDs

export default function SmartProgressScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { projects: apiProjects } = useProjects();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const results: ProjectSnapshot[] = [];

      // Use real projects from API (filter to active ones only)
      const activeProjects = apiProjects.filter(
        (p) => p.status === "active" || p.status === "planning",
      );

      // If no projects available, show empty state gracefully
      if (activeProjects.length === 0) {
        setSnapshots([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      for (const proj of activeProjects) {
        try {
          const projId = String(proj.id);
          const [phases, tasks] = await Promise.all([
            getPhases(projId),
            getTasks(projId),
          ]);

          const phasesArr = Array.isArray(phases) ? phases : [];
          const tasksArr = Array.isArray(tasks) ? tasks : [];

          const totalProgress =
            phasesArr.length > 0
              ? Math.round(
                  phasesArr.reduce((sum, p) => sum + (p.progress || 0), 0) /
                    phasesArr.length,
                )
              : 0;

          const delayedPhases = phasesArr.filter((p) => p.status === "DELAYED");
          const blockedTasks = tasksArr.filter((t) => t.status === "BLOCKED");
          const urgentTasks = tasksArr.filter(
            (t) => t.priority === "URGENT" && t.status !== "COMPLETED",
          );

          results.push({
            projectId: projId,
            projectName: proj.name,
            phases: phasesArr,
            tasks: tasksArr,
            overallProgress: totalProgress,
            delayedPhases,
            blockedTasks,
            urgentTasks,
          });
        } catch {
          // Skip failed project, continue
        }
      }

      setSnapshots(results);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiProjects]);

  useEffect(() => {
    if (apiProjects.length > 0) {
      fetchAll();
    } else {
      // Still loading projects or no projects
      setLoading(false);
    }
  }, [fetchAll, apiProjects.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  const totalDelayed = snapshots.reduce(
    (s, p) => s + p.delayedPhases.length,
    0,
  );
  const totalBlocked = snapshots.reduce((s, p) => s + p.blockedTasks.length, 0);
  const totalUrgent = snapshots.reduce((s, p) => s + p.urgentTasks.length, 0);
  const avgProgress =
    snapshots.length > 0
      ? Math.round(
          snapshots.reduce((s, p) => s + p.overallProgress, 0) /
            snapshots.length,
        )
      : 0;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Stack.Screen options={{ title: "Tiến độ thông minh" }} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Tiến độ thông minh",
          headerStyle: { backgroundColor: C.card },
        }}
      />

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        {error && (
          <View style={s.errorRow}>
            <Ionicons name="warning-outline" size={16} color={C.red} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Overview Ring */}
        <View style={s.overviewCard}>
          <View style={s.ringOuter}>
            <View
              style={[
                s.ringInner,
                {
                  borderColor:
                    avgProgress >= 70
                      ? C.primary
                      : avgProgress >= 40
                        ? C.orange
                        : C.red,
                },
              ]}
            >
              <Text style={s.ringPct}>{avgProgress}%</Text>
              <Text style={s.ringLabel}>Tổng tiến độ</Text>
            </View>
          </View>
          <View style={s.overviewStats}>
            <StatPill
              icon="alert-circle-outline"
              value={totalDelayed}
              label="Trễ hạn"
              color={C.red}
            />
            <StatPill
              icon="ban-outline"
              value={totalBlocked}
              label="Tắc nghẽn"
              color={C.orange}
            />
            <StatPill
              icon="flame-outline"
              value={totalUrgent}
              label="Gấp"
              color={C.purple}
            />
          </View>
        </View>

        {/* Per-project cards */}
        {snapshots.map((snap) => (
          <View key={snap.projectId} style={s.projCard}>
            <TouchableOpacity
              style={s.projHeader}
              onPress={() => router.push(`/(tabs)/timeline` as any)}
            >
              <View style={s.projTitleRow}>
                <Text style={s.projName}>{snap.projectName}</Text>
                <Ionicons name="chevron-forward" size={18} color={C.textSec} />
              </View>
              <ProgressBar pct={snap.overallProgress} />
            </TouchableOpacity>

            {/* Phases */}
            <View style={s.phaseList}>
              {snap.phases.slice(0, 5).map((phase) => (
                <View key={phase.id} style={s.phaseRow}>
                  <View
                    style={[
                      s.phaseDot,
                      { backgroundColor: getPhaseColor(phase.status) },
                    ]}
                  />
                  <View style={s.phaseInfo}>
                    <Text style={s.phaseName} numberOfLines={1}>
                      {phase.name}
                    </Text>
                    <Text style={s.phaseMeta}>
                      {phase.completedTasksCount ?? 0}/{phase.tasksCount ?? 0}{" "}
                      tasks
                      {phase.status === "DELAYED" && " • Trễ hạn"}
                    </Text>
                  </View>
                  <Text
                    style={[s.phasePct, { color: getPhaseColor(phase.status) }]}
                  >
                    {phase.progress}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Alerts */}
            {(snap.delayedPhases.length > 0 ||
              snap.blockedTasks.length > 0) && (
              <View style={s.alertBox}>
                {snap.delayedPhases.map((p) => (
                  <View key={p.id} style={s.alertRow}>
                    <Ionicons name="time-outline" size={14} color={C.red} />
                    <Text style={s.alertText}>
                      <Text style={{ fontWeight: "600" }}>{p.name}</Text> đang
                      trễ hạn
                    </Text>
                  </View>
                ))}
                {snap.blockedTasks.map((t) => (
                  <View key={t.id} style={s.alertRow}>
                    <Ionicons name="ban-outline" size={14} color={C.orange} />
                    <Text style={s.alertText}>
                      <Text style={{ fontWeight: "600" }}>{t.name}</Text> bị
                      chặn
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {snapshots.length === 0 && !error && (
          <View style={s.emptyCard}>
            <Ionicons name="bar-chart-outline" size={40} color={C.gray} />
            <Text style={s.emptyText}>Chưa có dữ liệu tiến độ</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───
function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={s.statPill}>
      <View style={[s.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? C.primary : pct >= 40 ? C.orange : C.red;
  return (
    <View style={s.barBg}>
      <View
        style={[
          s.barFill,
          { width: `${Math.min(pct, 100)}%`, backgroundColor: color },
        ]}
      />
      <Text style={s.barText}>{pct}%</Text>
    </View>
  );
}

// ─── Helpers ───
function getPhaseColor(status: PhaseStatus): string {
  return (
    {
      PENDING: C.gray,
      IN_PROGRESS: C.blue,
      COMPLETED: C.primary,
      DELAYED: C.red,
      CANCELLED: C.gray,
    }[status] || C.gray
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.redBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: { color: C.red, fontSize: 13, flex: 1 },

  overviewCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  ringOuter: { marginBottom: 16 },
  ringInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  ringPct: { fontSize: 24, fontWeight: "800", color: C.text },
  ringLabel: { fontSize: 11, color: C.textSec },
  overviewStats: { flexDirection: "row", gap: 20 },
  statPill: { alignItems: "center" },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11, color: C.textSec },

  projCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  projHeader: { marginBottom: 12 },
  projTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projName: { fontSize: 16, fontWeight: "700", color: C.text },
  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
    overflow: "hidden",
    position: "relative",
  },
  barFill: { height: 8, borderRadius: 4 },
  barText: {
    position: "absolute",
    right: 0,
    top: -16,
    fontSize: 11,
    fontWeight: "600",
    color: C.textSec,
  },

  phaseList: { borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 8 },
  phaseRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  phaseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  phaseInfo: { flex: 1 },
  phaseName: { fontSize: 13, fontWeight: "500", color: C.text },
  phaseMeta: { fontSize: 11, color: C.textSec, marginTop: 1 },
  phasePct: { fontSize: 13, fontWeight: "600" },

  alertBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: C.redBg,
    borderRadius: 10,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  alertText: { fontSize: 12, color: C.text, flex: 1 },

  emptyCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 40,
    alignItems: "center",
    elevation: 1,
  },
  emptyText: { color: C.textSec, fontSize: 14, marginTop: 10 },
});
