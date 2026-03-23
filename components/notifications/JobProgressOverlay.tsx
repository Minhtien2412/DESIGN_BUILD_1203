/**
 * Job Progress Overlay
 * =====================
 *
 * Floating overlay hiển thị các pending jobs (thông báo chờ).
 * Giống mini-player: nổi góc dưới, thu gọn được, hiện progress bar.
 *
 * Dùng: đặt ở root layout, luôn render.
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

import { usePendingJobs } from "@/context/NotificationControllerContext";
import type { PendingJob } from "@/services/notification-system";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
    Animated,
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    UIManager,
    View,
} from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function JobProgressOverlay() {
  const { pendingJobs, hasActiveJobs, cancelJob } = usePendingJobs();
  const [collapsed, setCollapsed] = useState(false);
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = visible, 0 = collapsed

  const toggleCollapse = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((prev) => !prev);
  }, []);

  // Don't render if no active jobs
  if (!hasActiveJobs && pendingJobs.length === 0) return null;

  const activeJobs = pendingJobs.filter(
    (j) => j.status === "pending" || j.status === "in_progress",
  );
  const recentCompletedJobs = pendingJobs.filter(
    (j) => j.status === "completed" || j.status === "failed",
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable style={styles.header} onPress={toggleCollapse}>
        <View style={styles.headerLeft}>
          <Ionicons name="hourglass-outline" size={18} color="#0D9488" />
          <Text style={styles.headerTitle}>
            {activeJobs.length > 0
              ? `${activeJobs.length} tác vụ đang xử lý`
              : `${recentCompletedJobs.length} tác vụ hoàn thành`}
          </Text>
        </View>
        <Ionicons
          name={collapsed ? "chevron-up" : "chevron-down"}
          size={18}
          color="#666"
        />
      </Pressable>

      {/* Job list (when not collapsed) */}
      {!collapsed && (
        <View style={styles.jobList}>
          {activeJobs.map((job) => (
            <JobItem key={job.jobId} job={job} onCancel={cancelJob} />
          ))}
          {recentCompletedJobs.map((job) => (
            <JobItem key={job.jobId} job={job} onCancel={cancelJob} />
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// JOB ITEM
// ============================================================================

function JobItem({
  job,
  onCancel,
}: {
  job: PendingJob;
  onCancel: (jobId: string) => void;
}) {
  const isActive = job.status === "pending" || job.status === "in_progress";
  const isDone = job.status === "completed";
  const isFailed = job.status === "failed" || job.status === "cancelled";

  return (
    <View style={styles.jobItem}>
      <View style={styles.jobRow}>
        {/* Status icon */}
        <Ionicons
          name={
            isDone ? "checkmark-circle" : isFailed ? "close-circle" : "sync"
          }
          size={20}
          color={isDone ? "#0D9488" : isFailed ? "#EF4444" : "#F59E0B"}
        />

        {/* Label + message */}
        <View style={styles.jobContent}>
          <Text style={styles.jobLabel} numberOfLines={1}>
            {job.label}
          </Text>
          <Text style={styles.jobMessage} numberOfLines={1}>
            {job.message}
          </Text>
        </View>

        {/* Cancel button (only for active) */}
        {isActive && (
          <Pressable
            onPress={() => onCancel(job.jobId)}
            style={styles.cancelBtn}
          >
            <Ionicons name="close" size={16} color="#999" />
          </Pressable>
        )}
      </View>

      {/* Progress bar (only for active) */}
      {isActive && (
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, job.progress))}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    maxHeight: 300,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  jobList: {
    paddingVertical: 4,
  },
  jobItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  jobRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  jobContent: {
    flex: 1,
  },
  jobLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  jobMessage: {
    fontSize: 12,
    color: "#888",
    marginTop: 1,
  },
  cancelBtn: {
    padding: 4,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0D9488",
    borderRadius: 2,
  },
});
