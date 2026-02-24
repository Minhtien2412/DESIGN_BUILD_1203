/**
 * Gantt Chart Screen - Quản lý tiến độ dạng Gantt
 * Hiển thị lịch trình dự án theo dạng biểu đồ Gantt
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const DAY_WIDTH = 30;
const TASK_HEIGHT = 40;

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

// Mock projects
const projects = [
  { id: "1", name: "Nhà phố Q7", code: "NP-Q7-001" },
  { id: "2", name: "Biệt thự Thảo Điền", code: "BT-TD-002" },
  { id: "3", name: "Căn hộ Sala", code: "CH-SL-003" },
];

// Mock tasks với thời gian
const ganttTasks = [
  {
    id: "1",
    name: "Khảo sát mặt bằng",
    startDay: 1,
    duration: 3,
    progress: 100,
    color: COLORS.success,
    phase: "Chuẩn bị",
  },
  {
    id: "2",
    name: "Thiết kế kiến trúc",
    startDay: 4,
    duration: 7,
    progress: 100,
    color: COLORS.secondary,
    phase: "Thiết kế",
    dependencies: ["1"],
  },
  {
    id: "3",
    name: "Thiết kế kết cấu",
    startDay: 8,
    duration: 5,
    progress: 80,
    color: COLORS.secondary,
    phase: "Thiết kế",
    dependencies: ["2"],
  },
  {
    id: "4",
    name: "Xin giấy phép XD",
    startDay: 11,
    duration: 10,
    progress: 60,
    color: COLORS.accent,
    phase: "Pháp lý",
    dependencies: ["2"],
  },
  {
    id: "5",
    name: "Thi công móng",
    startDay: 21,
    duration: 8,
    progress: 40,
    color: COLORS.primary,
    phase: "Thi công",
    dependencies: ["4"],
  },
  {
    id: "6",
    name: "Thi công thô",
    startDay: 29,
    duration: 20,
    progress: 0,
    color: COLORS.primary,
    phase: "Thi công",
    dependencies: ["5"],
  },
  {
    id: "7",
    name: "Lắp đặt điện nước",
    startDay: 35,
    duration: 15,
    progress: 0,
    color: COLORS.purple,
    phase: "MEP",
    dependencies: ["5"],
  },
  {
    id: "8",
    name: "Hoàn thiện nội thất",
    startDay: 49,
    duration: 14,
    progress: 0,
    color: COLORS.accent,
    phase: "Hoàn thiện",
    dependencies: ["6", "7"],
  },
];

const months = ["T1", "T2", "T3", "T4", "T5", "T6"];
const totalDays = 65;

export default function GanttChartScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return COLORS.success;
    if (progress >= 50) return COLORS.primary;
    if (progress > 0) return COLORS.accent;
    return COLORS.textLight;
  };

  const renderTask = ({ item }: { item: (typeof ganttTasks)[0] }) => {
    const progressColor = getProgressColor(item.progress);

    return (
      <View style={styles.taskRow}>
        {/* Task Name Column */}
        <View style={styles.taskNameCell}>
          <View style={[styles.phaseDot, { backgroundColor: item.color }]} />
          <View style={styles.taskNameContent}>
            <Text
              style={[styles.taskName, { color: textColor }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={styles.taskPhase}>{item.phase}</Text>
          </View>
          <View
            style={[
              styles.progressBadge,
              { backgroundColor: progressColor + "20" },
            ]}
          >
            <Text style={[styles.progressText, { color: progressColor }]}>
              {item.progress}%
            </Text>
          </View>
        </View>

        {/* Gantt Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.ganttScroll}
        >
          <View style={[styles.ganttRow, { width: totalDays * DAY_WIDTH }]}>
            {/* Grid lines */}
            {Array.from({ length: totalDays }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dayLine,
                  { left: i * DAY_WIDTH },
                  i % 7 === 0 && styles.weekLine,
                ]}
              />
            ))}

            {/* Task Bar */}
            <View
              style={[
                styles.taskBar,
                {
                  left: (item.startDay - 1) * DAY_WIDTH,
                  width: item.duration * DAY_WIDTH - 4,
                  backgroundColor: item.color + "40",
                },
              ]}
            >
              <View
                style={[
                  styles.taskBarProgress,
                  {
                    width: `${item.progress}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
              <Text style={styles.taskBarText} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Gantt Chart",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.secondary },
          headerTintColor: "#fff",
        }}
      />

      {/* Project Selector */}
      <View style={[styles.projectSelector, { backgroundColor: cardBg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.projectChip,
                selectedProject.id === project.id && styles.projectChipActive,
              ]}
              onPress={() => setSelectedProject(project)}
            >
              <Text
                style={[
                  styles.projectChipText,
                  selectedProject.id === project.id &&
                    styles.projectChipTextActive,
                ]}
              >
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.success + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.success }]}>3</Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.primary + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.primary }]}>2</Text>
          <Text style={styles.statLabel}>Đang thực hiện</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.textLight + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.textLight }]}>3</Text>
          <Text style={styles.statLabel}>Chưa bắt đầu</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.danger + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.danger }]}>0</Text>
          <Text style={styles.statLabel}>Trễ hạn</Text>
        </View>
      </View>

      {/* Timeline Header */}
      <View style={[styles.timelineHeader, { backgroundColor: cardBg }]}>
        <View style={styles.taskNameHeader}>
          <Text style={[styles.headerText, { color: textColor }]}>
            Công việc
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.daysHeader, { width: totalDays * DAY_WIDTH }]}>
            {Array.from(
              { length: Math.ceil(totalDays / 7) },
              (_, weekIndex) => (
                <View
                  key={weekIndex}
                  style={[styles.weekHeader, { width: 7 * DAY_WIDTH }]}
                >
                  <Text style={styles.weekText}>Tuần {weekIndex + 1}</Text>
                </View>
              ),
            )}
          </View>
        </ScrollView>
      </View>

      {/* Tasks List */}
      <FlatList
        data={ganttTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: cardBg }]}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.success }]}
          />
          <Text style={styles.legendText}>Chuẩn bị</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.secondary }]}
          />
          <Text style={styles.legendText}>Thiết kế</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
          />
          <Text style={styles.legendText}>Thi công</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.purple }]}
          />
          <Text style={styles.legendText}>MEP</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.accent }]}
          />
          <Text style={styles.legendText}>Hoàn thiện</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  projectSelector: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  projectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  projectChipActive: {
    backgroundColor: COLORS.secondary,
  },
  projectChipText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  projectChipTextActive: {
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  timelineHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  taskNameHeader: {
    width: 160,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  daysHeader: {
    flexDirection: "row",
    height: 40,
  },
  weekHeader: {
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  weekText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 80,
  },
  taskRow: {
    flexDirection: "row",
    height: TASK_HEIGHT + 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  taskNameCell: {
    width: 160,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskNameContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 12,
    fontWeight: "500",
  },
  taskPhase: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  progressBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "600",
  },
  ganttScroll: {
    flex: 1,
  },
  ganttRow: {
    height: TASK_HEIGHT + 12,
    position: "relative",
    paddingVertical: 6,
  },
  dayLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#f5f5f5",
  },
  weekLine: {
    backgroundColor: "#E0E0E0",
  },
  taskBar: {
    position: "absolute",
    height: TASK_HEIGHT,
    top: 6,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  taskBarProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  taskBarText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
