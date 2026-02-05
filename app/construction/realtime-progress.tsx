/**
 * Real-time Progress Dashboard Screen
 * Dashboard tiến độ thi công với cập nhật WebSocket real-time
 *
 * @created 2026-02-04
 *
 * Features:
 * - Real-time updates via WebSocket
 * - Project overview stats
 * - Task list with live progress
 * - Connection status indicator
 * - Offline fallback with polling
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    ConnectionStatusBanner,
    MiniProgressIndicator,
    RealTimeProgressCard,
} from "@/components/construction/RealTimeProgressCard";
import { useProgressWebSocket } from "@/context/ProgressWebSocketContext";
import {
    useMultipleTasksProgress,
    useProjectProgress
} from "@/hooks/useProgressSocket";

const { width } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PLANNING"
  | "ON_HOLD"
  | "DELAYED";

interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  phase: string;
  assignee?: string;
  dueDate?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

interface Phase {
  id: string;
  name: string;
  tasks: Task[];
}

// ============================================================================
// Mock Data (sẽ được thay bằng API call)
// ============================================================================

const MOCK_PROJECT_ID = "proj-001";

const MOCK_PHASES: Phase[] = [
  {
    id: "phase-1",
    name: "Nền móng",
    tasks: [
      {
        id: "t1",
        name: "Đào đất nền móng",
        status: "COMPLETED",
        progress: 100,
        phase: "Nền móng",
        assignee: "Đội A",
        priority: "HIGH",
      },
      {
        id: "t2",
        name: "Gia cố nền đất",
        status: "COMPLETED",
        progress: 100,
        phase: "Nền móng",
        assignee: "Đội A",
        priority: "HIGH",
      },
      {
        id: "t3",
        name: "Làm thép móng",
        status: "COMPLETED",
        progress: 100,
        phase: "Nền móng",
        assignee: "Đội B",
        priority: "MEDIUM",
      },
      {
        id: "t4",
        name: "Đổ bê tông móng",
        status: "COMPLETED",
        progress: 100,
        phase: "Nền móng",
        assignee: "Đội B",
        priority: "HIGH",
      },
    ],
  },
  {
    id: "phase-2",
    name: "Kết cấu",
    tasks: [
      {
        id: "t5",
        name: "Xây dựng cột tầng 1",
        status: "COMPLETED",
        progress: 100,
        phase: "Kết cấu",
        assignee: "Đội C",
        priority: "HIGH",
      },
      {
        id: "t6",
        name: "Xây tường tầng 1",
        status: "IN_PROGRESS",
        progress: 75,
        phase: "Kết cấu",
        assignee: "Đội C",
        priority: "MEDIUM",
      },
      {
        id: "t7",
        name: "Đổ sàn tầng 2",
        status: "IN_PROGRESS",
        progress: 45,
        phase: "Kết cấu",
        assignee: "Đội D",
        priority: "HIGH",
      },
      {
        id: "t8",
        name: "Xây dựng cầu thang",
        status: "TODO",
        progress: 0,
        phase: "Kết cấu",
        assignee: "Đội D",
        priority: "MEDIUM",
      },
    ],
  },
  {
    id: "phase-3",
    name: "Hoàn thiện thô",
    tasks: [
      {
        id: "t9",
        name: "Tô tường trong",
        status: "TODO",
        progress: 0,
        phase: "Hoàn thiện thô",
        priority: "MEDIUM",
      },
      {
        id: "t10",
        name: "Chống thấm",
        status: "TODO",
        progress: 0,
        phase: "Hoàn thiện thô",
        priority: "HIGH",
      },
      {
        id: "t11",
        name: "Lắp đặt cửa",
        status: "PLANNING",
        progress: 0,
        phase: "Hoàn thiện thô",
        priority: "MEDIUM",
      },
    ],
  },
  {
    id: "phase-4",
    name: "Hoàn thiện tinh",
    tasks: [
      {
        id: "t12",
        name: "Sơn tường",
        status: "PLANNING",
        progress: 0,
        phase: "Hoàn thiện tinh",
        priority: "LOW",
      },
      {
        id: "t13",
        name: "Lát gạch",
        status: "PLANNING",
        progress: 0,
        phase: "Hoàn thiện tinh",
        priority: "MEDIUM",
      },
      {
        id: "t14",
        name: "Lắp đặt thiết bị điện",
        status: "PLANNING",
        progress: 0,
        phase: "Hoàn thiện tinh",
        priority: "HIGH",
      },
      {
        id: "t15",
        name: "Lắp đặt thiết bị vệ sinh",
        status: "PLANNING",
        progress: 0,
        phase: "Hoàn thiện tinh",
        priority: "MEDIUM",
      },
    ],
  },
];

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
  primary: "#EE4D2D",
  secondary: "#0066CC",
  success: "#00BFA5",
  warning: "#FFB800",
  error: "#EF4444",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  background: "#F5F5F5",
  surface: "#FFFFFF",
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: "Chưa bắt đầu", color: COLORS.textSecondary },
  PLANNING: { label: "Lên kế hoạch", color: COLORS.secondary },
  IN_PROGRESS: { label: "Đang thực hiện", color: COLORS.primary },
  COMPLETED: { label: "Hoàn thành", color: COLORS.success },
  ON_HOLD: { label: "Tạm dừng", color: COLORS.warning },
  DELAYED: { label: "Chậm tiến độ", color: COLORS.error },
};

// ============================================================================
// Main Component
// ============================================================================

export default function RealTimeProgressDashboard() {
  const params = useLocalSearchParams<{ projectId?: string }>();
  const projectId = params.projectId || MOCK_PROJECT_ID;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [phases, setPhases] = useState<Phase[]>(MOCK_PHASES);
  const pulseAnim = useState(() => new Animated.Value(1))[0];

  // WebSocket context
  const { connected, connecting, error, connect, disconnect } =
    useProgressWebSocket();

  // Subscribe to project progress
  const {
    projectProgress,
    loading: projectLoading,
    refresh: refreshProject,
  } = useProjectProgress({
    projectId,
    onUpdate: (data) => {
      console.log("[Dashboard] Project progress update:", data);
      // Update local state if needed
    },
    onError: (err) => {
      console.error("[Dashboard] Project progress error:", err);
    },
  });

  // Subscribe to all tasks
  const taskIds = useMemo(
    () => phases.flatMap((phase) => phase.tasks.map((t) => t.id)),
    [phases],
  );

  const { tasksProgress, loading: tasksLoading } = useMultipleTasksProgress({
    taskIds,
    onUpdate: (taskId, data) => {
      console.log(`[Dashboard] Task ${taskId} update:`, data);
      // Update local state
      setPhases((prevPhases) =>
        prevPhases.map((phase) => ({
          ...phase,
          tasks: phase.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  progress: data.progress,
                  status: data.status as TaskStatus,
                }
              : task,
          ),
        })),
      );
    },
  });

  // Pulse animation for live indicator
  useEffect(() => {
    if (connected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [connected, pulseAnim]);

  // Merge tasks with real-time data
  const mergedPhases = useMemo(() => {
    return phases.map((phase) => ({
      ...phase,
      tasks: phase.tasks.map((task) => {
        const realTimeData = tasksProgress.get(task.id);
        if (realTimeData) {
          return {
            ...task,
            progress: realTimeData.progress,
            status: realTimeData.status as TaskStatus,
          };
        }
        return task;
      }),
    }));
  }, [phases, tasksProgress]);

  // Calculate stats
  const stats = useMemo(() => {
    const allTasks = mergedPhases.flatMap((p) => p.tasks);
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = allTasks.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;
    const delayed = allTasks.filter((t) => t.status === "DELAYED").length;
    const avgProgress =
      total > 0
        ? Math.round(allTasks.reduce((acc, t) => acc + t.progress, 0) / total)
        : 0;

    return { total, completed, inProgress, delayed, avgProgress };
  }, [mergedPhases]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProject();
      // Reload mock data in real app, this would be an API call
      await new Promise((r) => setTimeout(r, 1000));
    } finally {
      setRefreshing(false);
    }
  }, [refreshProject]);

  const handleRetryConnection = useCallback(() => {
    connect();
  }, [connect]);

  const handleTaskPress = useCallback((task: Task) => {
    // Navigate to task detail
    router.push(`/construction/task-detail?taskId=${task.id}` as any);
  }, []);

  const handlePhasePress = useCallback((phaseId: string) => {
    setSelectedPhaseId((prev) => (prev === phaseId ? null : phaseId));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <LinearGradient colors={["#0066CC", "#3399FF"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tiến Độ Real-time</Text>
          <View style={styles.liveIndicator}>
            <Animated.View
              style={[
                styles.liveDot,
                {
                  backgroundColor: connected ? COLORS.success : COLORS.error,
                  transform: [{ scale: connected ? pulseAnim : 1 }],
                },
              ]}
            />
            <Text style={styles.liveText}>
              {connected ? "Live" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {projectProgress?.overallProgress ?? stats.avgProgress}%
            </Text>
            <Text style={styles.statLabel}>Tổng tiến độ</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.completed}/{stats.total}
            </Text>
            <Text style={styles.statLabel}>Công việc</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statValue,
                stats.delayed > 0 && { color: COLORS.error },
              ]}
            >
              {stats.delayed}
            </Text>
            <Text style={styles.statLabel}>Chậm</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.mainProgressBar}>
          <View
            style={[
              styles.mainProgressFill,
              {
                width: `${projectProgress?.overallProgress ?? stats.avgProgress}%`,
              },
            ]}
          />
        </View>
      </LinearGradient>

      {/* Connection Banner */}
      <ConnectionStatusBanner
        connected={connected}
        connecting={connecting}
        error={error}
        onRetry={handleRetryConnection}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Real-time Project Card */}
        <View style={styles.section}>
          <RealTimeProgressCard
            title="Dự án Biệt Thự Nhà Xinh"
            progress={projectProgress?.overallProgress ?? stats.avgProgress}
            status={
              stats.avgProgress >= 100
                ? "COMPLETED"
                : stats.delayed > 0
                  ? "DELAYED"
                  : "IN_PROGRESS"
            }
            connected={connected}
            lastUpdated={
              projectProgress?.lastUpdated || new Date().toISOString()
            }
            completedTasks={stats.completed}
            totalTasks={stats.total}
            onRefresh={handleRefresh}
            variant="project"
          />
        </View>

        {/* Phases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giai đoạn thi công</Text>

          {mergedPhases.map((phase, index) => {
            const phaseTasks = phase.tasks;
            const phaseCompleted = phaseTasks.filter(
              (t) => t.status === "COMPLETED",
            ).length;
            const phaseProgress =
              phaseTasks.length > 0
                ? Math.round(
                    phaseTasks.reduce((acc, t) => acc + t.progress, 0) /
                      phaseTasks.length,
                  )
                : 0;
            const isExpanded = selectedPhaseId === phase.id;

            return (
              <View key={phase.id} style={styles.phaseCard}>
                <TouchableOpacity
                  style={styles.phaseHeader}
                  onPress={() => handlePhasePress(phase.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.phaseLeft}>
                    <View
                      style={[
                        styles.phaseNumber,
                        {
                          backgroundColor:
                            phaseProgress >= 100
                              ? COLORS.success
                              : phaseProgress > 0
                                ? COLORS.primary
                                : COLORS.textSecondary,
                        },
                      ]}
                    >
                      <Text style={styles.phaseNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.phaseInfo}>
                      <Text style={styles.phaseName}>{phase.name}</Text>
                      <Text style={styles.phaseStats}>
                        {phaseCompleted}/{phaseTasks.length} công việc •{" "}
                        {phaseProgress}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.phaseRight}>
                    <MiniProgressIndicator
                      progress={phaseProgress}
                      connected={connected}
                    />
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded Tasks */}
                {isExpanded && (
                  <View style={styles.tasksList}>
                    {phaseTasks.map((task) => {
                      const realTimeData = tasksProgress.get(task.id);
                      const taskProgress =
                        realTimeData?.progress ?? task.progress;
                      const taskStatus =
                        (realTimeData?.status as TaskStatus) ?? task.status;
                      const statusConfig = STATUS_CONFIG[taskStatus];

                      return (
                        <TouchableOpacity
                          key={task.id}
                          style={styles.taskItem}
                          onPress={() => handleTaskPress(task)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.taskMain}>
                            <View style={styles.taskInfo}>
                              <Text style={styles.taskName}>{task.name}</Text>
                              <View style={styles.taskMeta}>
                                {task.assignee && (
                                  <View style={styles.metaItem}>
                                    <Ionicons
                                      name="person-outline"
                                      size={12}
                                      color={COLORS.textTertiary}
                                    />
                                    <Text style={styles.metaText}>
                                      {task.assignee}
                                    </Text>
                                  </View>
                                )}
                                <View
                                  style={[
                                    styles.statusChip,
                                    {
                                      backgroundColor:
                                        statusConfig.color + "15",
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.statusText,
                                      { color: statusConfig.color },
                                    ]}
                                  >
                                    {statusConfig.label}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            {/* Progress Circle */}
                            <View style={styles.progressCircle}>
                              <View
                                style={[
                                  styles.progressCircleInner,
                                  {
                                    borderColor:
                                      taskProgress >= 100
                                        ? COLORS.success
                                        : taskStatus === "DELAYED"
                                          ? COLORS.error
                                          : COLORS.primary,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.progressCircleText,
                                    {
                                      color:
                                        taskProgress >= 100
                                          ? COLORS.success
                                          : taskStatus === "DELAYED"
                                            ? COLORS.error
                                            : COLORS.primary,
                                    },
                                  ]}
                                >
                                  {Math.round(taskProgress)}%
                                </Text>
                              </View>
                              {connected && (
                                <View style={styles.taskLiveIndicator}>
                                  <View style={styles.taskLiveDot} />
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Task Progress Bar */}
                          <View style={styles.taskProgressBar}>
                            <View
                              style={[
                                styles.taskProgressFill,
                                {
                                  width: `${taskProgress}%`,
                                  backgroundColor:
                                    taskProgress >= 100
                                      ? COLORS.success
                                      : taskStatus === "DELAYED"
                                        ? COLORS.error
                                        : COLORS.primary,
                                },
                              ]}
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Chú thích</Text>
          <View style={styles.legendGrid}>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <View key={key} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: config.color }]}
                />
                <Text style={styles.legendText}>{config.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Loading Overlay */}
      {(projectLoading || tasksLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  mainProgressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    marginTop: 16,
    overflow: "hidden",
  },
  mainProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  phaseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  phaseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  phaseNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  phaseStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phaseRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tasksList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  taskItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  taskMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  progressCircle: {
    position: "relative",
  },
  progressCircleInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  progressCircleText: {
    fontSize: 11,
    fontWeight: "700",
  },
  taskLiveIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  taskLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  taskProgressBar: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    overflow: "hidden",
  },
  taskProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  legendSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
