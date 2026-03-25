/**
 * ProgressDashboard Component
 * Overall project progress dashboard with charts
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Phase, calculateProjectProgress } from "@/services/timeline-api";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface ProgressDashboardProps {
  phases: Phase[];
  projectName?: string;
}

export function ProgressDashboard({
  phases: phasesProp,
  projectName,
}: ProgressDashboardProps) {
  const phases = phasesProp ?? [];
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  // Calculate statistics
  const totalPhases = phases.length;
  const completedPhases = phases.filter((p) => p.status === "COMPLETED").length;
  const inProgressPhases = phases.filter(
    (p) => p.status === "IN_PROGRESS",
  ).length;
  const delayedPhases = phases.filter((p) => p.status === "DELAYED").length;
  const notStartedPhases = phases.filter(
    (p) => p.status === "NOT_STARTED",
  ).length;
  const overallProgress = calculateProjectProgress(phases);

  // Calculate completion rate
  const completionRate =
    totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      {/* Header */}
      {projectName && (
        <Text style={[styles.projectName, { color: textColor }]}>
          {projectName}
        </Text>
      )}

      {/* Overall Progress Circle */}
      <View style={styles.progressCircleContainer}>
        <View style={styles.progressCircle}>
          <Text style={[styles.progressPercentage, { color: textColor }]}>
            {overallProgress}%
          </Text>
          <Text style={[styles.progressLabel, { color: textColor }]}>
            Tiến độ
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Total Phases */}
        <View style={[styles.statCard, { backgroundColor, borderColor }]}>
          <Ionicons name="layers-outline" size={24} color="#6B7280" />
          <Text style={[styles.statValue, { color: textColor }]}>
            {totalPhases}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>
            Tổng giai đoạn
          </Text>
        </View>

        {/* Completed */}
        <View style={[styles.statCard, { backgroundColor, borderColor }]}>
          <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
          <Text style={[styles.statValue, { color: "#0D9488" }]}>
            {completedPhases}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>
            Hoàn thành
          </Text>
        </View>

        {/* In Progress */}
        <View style={[styles.statCard, { backgroundColor, borderColor }]}>
          <Ionicons name="play-circle" size={24} color="#0080FF" />
          <Text style={[styles.statValue, { color: "#0080FF" }]}>
            {inProgressPhases}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Đang làm</Text>
        </View>

        {/* Delayed */}
        <View style={[styles.statCard, { backgroundColor, borderColor }]}>
          <Ionicons name="alert-circle" size={24} color="#000000" />
          <Text style={[styles.statValue, { color: "#000000" }]}>
            {delayedPhases}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Trễ hạn</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarSection}>
        <View style={styles.progressBarHeader}>
          <Text style={[styles.progressBarLabel, { color: textColor }]}>
            Tỷ lệ hoàn thành
          </Text>
          <Text style={[styles.progressBarValue, { color: "#0D9488" }]}>
            {completionRate}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${completionRate}%`, backgroundColor: "#0D9488" },
            ]}
          />
        </View>
        <Text style={[styles.progressBarSubtext, { color: textColor }]}>
          {completedPhases} / {totalPhases} giai đoạn đã hoàn thành
        </Text>
      </View>

      {/* Status Breakdown */}
      <View style={styles.statusBreakdown}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Phân bổ trạng thái
        </Text>

        <View style={styles.statusBar}>
          {completedPhases > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${(completedPhases / totalPhases) * 100}%`,
                  backgroundColor: "#0D9488",
                },
              ]}
            />
          )}
          {inProgressPhases > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${(inProgressPhases / totalPhases) * 100}%`,
                  backgroundColor: "#0080FF",
                },
              ]}
            />
          )}
          {delayedPhases > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${(delayedPhases / totalPhases) * 100}%`,
                  backgroundColor: "#000000",
                },
              ]}
            />
          )}
          {notStartedPhases > 0 && (
            <View
              style={[
                styles.statusSegment,
                {
                  width: `${(notStartedPhases / totalPhases) * 100}%`,
                  backgroundColor: "#9CA3AF",
                },
              ]}
            />
          )}
        </View>

        <View style={styles.legend}>
          {completedPhases > 0 && (
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#0D9488" }]}
              />
              <Text style={[styles.legendText, { color: textColor }]}>
                Hoàn thành ({completedPhases})
              </Text>
            </View>
          )}
          {inProgressPhases > 0 && (
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#0080FF" }]}
              />
              <Text style={[styles.legendText, { color: textColor }]}>
                Đang làm ({inProgressPhases})
              </Text>
            </View>
          )}
          {delayedPhases > 0 && (
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#000000" }]}
              />
              <Text style={[styles.legendText, { color: textColor }]}>
                Trễ hạn ({delayedPhases})
              </Text>
            </View>
          )}
          {notStartedPhases > 0 && (
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#9CA3AF" }]}
              />
              <Text style={[styles.legendText, { color: textColor }]}>
                Chưa bắt đầu ({notStartedPhases})
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  progressCircleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#0080FF",
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: "700",
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  progressBarSection: {
    marginBottom: 20,
  },
  progressBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressBarSubtext: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  statusBreakdown: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  statusBar: {
    height: 24,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 12,
  },
  statusSegment: {
    height: "100%",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
