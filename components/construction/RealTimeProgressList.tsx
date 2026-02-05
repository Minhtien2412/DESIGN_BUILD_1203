/**
 * RealTimeProgressList Component
 * Danh sách công việc với cập nhật real-time từ WebSocket
 *
 * @created 2026-02-04
 *
 * Features:
 * - Subscribe nhiều tasks real-time
 * - Grouped by status
 * - Pull to refresh
 * - Optimistic updates
 * - Offline fallback
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { useProgressWebSocket } from "@/context/ProgressWebSocketContext";
import {
    useMultipleTasksProgress,
    useProjectProgress,
} from "@/hooks/useProgressSocket";
import {
    ConnectionStatusBanner,
    MiniProgressIndicator
} from "./RealTimeProgressCard";

// ============================================================================
// Types
// ============================================================================

export interface ConstructionTask {
  id: string;
  name: string;
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "PLANNING"
    | "ON_HOLD"
    | "DELAYED";
  progress: number;
  phase?: string;
  assignedTo?: string;
  dueDate?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  description?: string;
}

export interface RealTimeProgressListProps {
  projectId: string;
  tasks: ConstructionTask[];
  onTaskPress?: (task: ConstructionTask) => void;
  onRefresh?: () => Promise<void>;
  showProjectOverview?: boolean;
  groupByPhase?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
  primary: "#EE4D2D",
  success: "#00BFA5",
  warning: "#FFB800",
  error: "#EF4444",
  info: "#3B82F6",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  border: "#E0E0E0",
};

const STATUS_ORDER = [
  "DELAYED",
  "IN_PROGRESS",
  "ON_HOLD",
  "TODO",
  "PLANNING",
  "COMPLETED",
];

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: COLORS.error,
  HIGH: COLORS.warning,
  MEDIUM: COLORS.info,
  LOW: COLORS.textTertiary,
};

// ============================================================================
// Component
// ============================================================================

export function RealTimeProgressList({
  projectId,
  tasks,
  onTaskPress,
  onRefresh,
  showProjectOverview = true,
  groupByPhase = false,
}: RealTimeProgressListProps) {
  const [refreshing, setRefreshing] = useState(false);

  // Get WebSocket context
  const { connected } = useProgressWebSocket();

  // Subscribe to project progress
  const { projectProgress } = useProjectProgress({
    projectId,
    onUpdate: (data) => {
      console.log("[RealTimeProgressList] Project update:", data);
    },
  });

  // Subscribe to multiple tasks
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const { tasksProgress } = useMultipleTasksProgress({
    taskIds,
    onUpdate: (taskId, data) => {
      console.log(`[RealTimeProgressList] Task ${taskId} update:`, data);
    },
  });

  // Merge local tasks with real-time updates
  const mergedTasks = useMemo(() => {
    return tasks.map((task) => {
      const realTimeData = tasksProgress.get(task.id);
      if (realTimeData) {
        return {
          ...task,
          progress: realTimeData.progress,
          status: realTimeData.status as ConstructionTask["status"],
        };
      }
      return task;
    });
  }, [tasks, tasksProgress]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupByPhase) {
      const groups = new Map<string, ConstructionTask[]>();
      mergedTasks.forEach((task) => {
        const phase = task.phase || "Khác";
        if (!groups.has(phase)) {
          groups.set(phase, []);
        }
        groups.get(phase)!.push(task);
      });
      return Array.from(groups.entries()).map(([phase, phaseTasks]) => ({
        title: phase,
        data: phaseTasks.sort(
          (a, b) =>
            STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
        ),
      }));
    }

    // Group by status
    const groups = new Map<string, ConstructionTask[]>();
    mergedTasks.forEach((task) => {
      if (!groups.has(task.status)) {
        groups.set(task.status, []);
      }
      groups.get(task.status)!.push(task);
    });

    return STATUS_ORDER.filter((status) => groups.has(status)).map(
      (status) => ({
        title: getStatusLabel(status),
        data: groups.get(status)!,
      }),
    );
  }, [mergedTasks, groupByPhase]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  // Calculate project stats
  const projectStats = useMemo(() => {
    const total = mergedTasks.length;
    const completed = mergedTasks.filter(
      (t) => t.status === "COMPLETED",
    ).length;
    const inProgress = mergedTasks.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;
    const delayed = mergedTasks.filter((t) => t.status === "DELAYED").length;
    const avgProgress =
      total > 0
        ? Math.round(
            mergedTasks.reduce((acc, t) => acc + t.progress, 0) / total,
          )
        : 0;

    return { total, completed, inProgress, delayed, avgProgress };
  }, [mergedTasks]);

  const renderHeader = () => {
    if (!showProjectOverview) return null;

    return (
      <View style={styles.headerSection}>
        {/* Connection Banner */}
        <ConnectionStatusBanner connected={connected} />

        {/* Project Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Tiến độ dự án</Text>
            <MiniProgressIndicator
              progress={
                projectProgress?.overallProgress || projectStats.avgProgress
              }
              connected={connected}
              size="medium"
            />
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{projectStats.total}</Text>
              <Text style={styles.statLabel}>Tổng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {projectStats.completed}
              </Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>
                {projectStats.inProgress}
              </Text>
              <Text style={styles.statLabel}>Đang làm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.error }]}>
                {projectStats.delayed}
              </Text>
              <Text style={styles.statLabel}>Chậm</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderTaskItem = ({ item }: { item: ConstructionTask }) => {
    const realTimeData = tasksProgress.get(item.id);
    const progress = realTimeData?.progress ?? item.progress;
    const status =
      (realTimeData?.status as ConstructionTask["status"]) ?? item.status;

    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => onTaskPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.taskMain}>
          <View style={styles.taskInfo}>
            <View style={styles.taskTitleRow}>
              <Text style={styles.taskName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.priority && (
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: PRIORITY_COLORS[item.priority] + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: PRIORITY_COLORS[item.priority] },
                    ]}
                  >
                    {item.priority === "URGENT"
                      ? "Gấp"
                      : item.priority === "HIGH"
                        ? "Cao"
                        : item.priority === "MEDIUM"
                          ? "TB"
                          : "Thấp"}
                  </Text>
                </View>
              )}
            </View>

            {item.assignedTo && (
              <View style={styles.assigneeRow}>
                <Ionicons
                  name="person-outline"
                  size={12}
                  color={COLORS.textTertiary}
                />
                <Text style={styles.assigneeText}>{item.assignedTo}</Text>
              </View>
            )}

            {item.dueDate && (
              <View style={styles.dueDateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={COLORS.textTertiary}
                />
                <Text style={styles.dueDateText}>
                  {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            )}
          </View>

          {/* Progress Circle */}
          <View style={styles.progressCircle}>
            <View
              style={[
                styles.progressCircleInner,
                {
                  borderColor:
                    progress >= 100
                      ? COLORS.success
                      : status === "DELAYED"
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
                      progress >= 100
                        ? COLORS.success
                        : status === "DELAYED"
                          ? COLORS.error
                          : COLORS.primary,
                  },
                ]}
              >
                {Math.round(progress)}%
              </Text>
            </View>
            {connected && (
              <View style={styles.liveIndicatorSmall}>
                <View style={styles.liveIndicatorDot} />
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.taskProgressBar}>
          <View
            style={[
              styles.taskProgressFill,
              {
                width: `${progress}%`,
                backgroundColor:
                  progress >= 100
                    ? COLORS.success
                    : status === "DELAYED"
                      ? COLORS.error
                      : COLORS.primary,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="clipboard-text-outline"
        size={64}
        color={COLORS.textTertiary}
      />
      <Text style={styles.emptyTitle}>Chưa có công việc</Text>
      <Text style={styles.emptyText}>
        Thêm công việc để bắt đầu theo dõi tiến độ
      </Text>
    </View>
  );

  // Flatten grouped data for FlatList
  const flatData = useMemo(() => {
    const result: Array<{ type: "header" | "item"; data: any }> = [];
    groupedTasks.forEach((group) => {
      result.push({ type: "header", data: { title: group.title } });
      group.data.forEach((task) => {
        result.push({ type: "item", data: task });
      });
    });
    return result;
  }, [groupedTasks]);

  return (
    <FlatList
      data={flatData}
      keyExtractor={(item, index) =>
        item.type === "header" ? `header-${index}` : item.data.id
      }
      renderItem={({ item }) =>
        item.type === "header"
          ? renderSectionHeader(item.data)
          : renderTaskItem({ item: item.data })
      }
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    />
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    TODO: "Chưa bắt đầu",
    PLANNING: "Lên kế hoạch",
    IN_PROGRESS: "Đang thực hiện",
    COMPLETED: "Hoàn thành",
    ON_HOLD: "Tạm dừng",
    DELAYED: "Chậm tiến độ",
  };
  return labels[status] || status;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 16,
  },
  overviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  taskItem: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  taskName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  assigneeText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  progressCircle: {
    position: "relative",
  },
  progressCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  progressCircleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  liveIndicatorSmall: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default RealTimeProgressList;
