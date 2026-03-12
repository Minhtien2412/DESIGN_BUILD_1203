import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Construction phases and tasks
interface Task {
  id: string;
  name: string;
  location: string;
  floor: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: "completed" | "in-progress" | "pending" | "delayed";
  progress: number;
  workers: number;
  hasBlueprint: boolean;
  hasReport: boolean;
  notes: string[];
  images: string[];
}

interface Phase {
  id: string;
  name: string;
  order: number;
  status: "completed" | "in-progress" | "pending";
  tasks: Task[];
}

const CONSTRUCTION_PHASES: Phase[] = [
  {
    id: "phase1",
    name: "GIAI ĐOẠN 1 - NỀN MÓNG",
    order: 1,
    status: "completed",
    tasks: [
      {
        id: "t1",
        name: "Làm thép",
        location: "F1C4",
        floor: "F1",
        startDate: "20/06",
        endDate: "22/06",
        duration: "2 Day",
        status: "completed",
        progress: 100,
        workers: 8,
        hasBlueprint: true,
        hasReport: true,
        notes: ["Hoàn thành đúng tiến độ", "Chất lượng tốt"],
        images: [
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&q=80",
        ],
      },
      {
        id: "t2",
        name: "Làm thép",
        location: "F1C3",
        floor: "F1",
        startDate: "20/06",
        endDate: "22/06",
        duration: "2 Day",
        status: "completed",
        progress: 100,
        workers: 8,
        hasBlueprint: true,
        hasReport: true,
        notes: [],
        images: [],
      },
      {
        id: "t3",
        name: "Ván khuôn",
        location: "F1C2",
        floor: "F1",
        startDate: "20/06",
        endDate: "20/06",
        duration: "1 Day",
        status: "completed",
        progress: 100,
        workers: 6,
        hasBlueprint: true,
        hasReport: true,
        notes: [],
        images: [],
      },
      {
        id: "t4",
        name: "Bắn Laser",
        location: "F1C1",
        floor: "F1",
        startDate: "20/06",
        endDate: "20/06",
        duration: "1 Day",
        status: "completed",
        progress: 100,
        workers: 4,
        hasBlueprint: true,
        hasReport: true,
        notes: [],
        images: [],
      },
    ],
  },
  {
    id: "phase2",
    name: "GIAI ĐOẠN 2 - KẾT CẤU",
    order: 2,
    status: "in-progress",
    tasks: [
      {
        id: "t5",
        name: "Xây dựng cột",
        location: "FC1",
        floor: "F1",
        startDate: "20/06",
        endDate: "23/06",
        duration: "3 Day",
        status: "in-progress",
        progress: 65,
        workers: 12,
        hasBlueprint: true,
        hasReport: true,
        notes: ["Đang thi công", "Cần bổ sung vật liệu"],
        images: [
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&q=80",
        ],
      },
      {
        id: "t6",
        name: "Xây Tường",
        location: "W1",
        floor: "F1",
        startDate: "20/06",
        endDate: "20/12",
        duration: "3 Month",
        status: "in-progress",
        progress: 35,
        workers: 15,
        hasBlueprint: true,
        hasReport: true,
        notes: ["Thi công chậm do thời tiết"],
        images: [],
      },
    ],
  },
  {
    id: "phase3",
    name: "GIAI ĐOẠN 3 - HOÀN THIỆN THÔ",
    order: 3,
    status: "pending",
    tasks: [
      {
        id: "t7",
        name: "Bảo dưỡng",
        location: "F1",
        floor: "F1",
        startDate: "20/06",
        endDate: "20/12",
        duration: "3 Month",
        status: "pending",
        progress: 0,
        workers: 0,
        hasBlueprint: true,
        hasReport: false,
        notes: [],
        images: [],
      },
      {
        id: "t8",
        name: "Tô tường",
        location: "F1",
        floor: "F1",
        startDate: "20/06",
        endDate: "20/12",
        duration: "3 Month",
        status: "pending",
        progress: 0,
        workers: 0,
        hasBlueprint: true,
        hasReport: false,
        notes: [],
        images: [],
      },
      {
        id: "t9",
        name: "Chống thấm",
        location: "F1",
        floor: "F1",
        startDate: "20/06",
        endDate: "20/12",
        duration: "3 Month",
        status: "pending",
        progress: 0,
        workers: 0,
        hasBlueprint: true,
        hasReport: false,
        notes: [],
        images: [],
      },
      {
        id: "t10",
        name: "Lát gạch",
        location: "F1",
        floor: "F1",
        startDate: "20/06",
        endDate: "20/12",
        duration: "3 Month",
        status: "pending",
        progress: 0,
        workers: 0,
        hasBlueprint: true,
        hasReport: false,
        notes: [],
        images: [],
      },
    ],
  },
];

const FLOOR_LABELS = ["F1", "F2", "F3", "F4"];

export default function ProgressTrackingScreen() {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "gantt">("timeline");

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "#0D9488";
      case "in-progress":
        return "#0D9488";
      case "delayed":
        return "#000000";
      default:
        return "#999999";
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in-progress":
        return "Đang thi công";
      case "delayed":
        return "Trễ tiến độ";
      default:
        return "Chưa bắt đầu";
    }
  };

  const totalTasks = CONSTRUCTION_PHASES.reduce(
    (sum, phase) => sum + phase.tasks.length,
    0,
  );
  const completedTasks = CONSTRUCTION_PHASES.reduce(
    (sum, phase) =>
      sum + phase.tasks.filter((t) => t.status === "completed").length,
    0,
  );
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#0D9488", "#14B8A6"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tiến Độ Thi Công Biệt Thự</Text>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress summary */}
        <View style={styles.progressSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{overallProgress}%</Text>
            <Text style={styles.summaryLabel}>Tổng tiến độ</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {completedTasks}/{totalTasks}
            </Text>
            <Text style={styles.summaryLabel}>Công việc</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>3</Text>
            <Text style={styles.summaryLabel}>Giai đoạn</Text>
          </View>
        </View>

        {/* View mode toggle */}
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "timeline" && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode("timeline")}
          >
            <Ionicons
              name="list"
              size={18}
              color={viewMode === "timeline" ? "#fff" : "#fff9"}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === "timeline" && styles.viewModeTextActive,
              ]}
            >
              Timeline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "gantt" && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode("gantt")}
          >
            <Ionicons
              name="bar-chart"
              size={18}
              color={viewMode === "gantt" ? "#fff" : "#fff9"}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === "gantt" && styles.viewModeTextActive,
              ]}
            >
              Gantt
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === "timeline" ? (
          // Timeline view
          <View style={styles.timelineContainer}>
            {CONSTRUCTION_PHASES.map((phase, phaseIndex) => (
              <View key={phase.id} style={styles.phaseSection}>
                {/* Phase header */}
                <TouchableOpacity
                  style={styles.phaseHeader}
                  onPress={() =>
                    setSelectedPhase(
                      selectedPhase?.id === phase.id ? null : phase,
                    )
                  }
                >
                  <View style={styles.phaseLeft}>
                    <View
                      style={[
                        styles.phaseNumber,
                        {
                          backgroundColor:
                            phase.status === "completed"
                              ? "#0D9488"
                              : phase.status === "in-progress"
                                ? "#0D9488"
                                : "#999999",
                        },
                      ]}
                    >
                      <Text style={styles.phaseNumberText}>
                        {String(phaseIndex + 1).padStart(2, "0")}
                      </Text>
                    </View>
                    <View style={styles.phaseInfo}>
                      <Text style={styles.phaseName}>{phase.name}</Text>
                      <Text style={styles.phaseTaskCount}>
                        {
                          phase.tasks.filter((t) => t.status === "completed")
                            .length
                        }
                        /{phase.tasks.length} công việc
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={
                      selectedPhase?.id === phase.id
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>

                {/* Tasks list */}
                {selectedPhase?.id === phase.id && (
                  <View style={styles.tasksContainer}>
                    {phase.tasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={styles.taskCard}
                        onPress={() => handleTaskPress(task)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.taskHeader}>
                          <View style={styles.taskTitleRow}>
                            <Text style={styles.taskName}>{task.name}</Text>
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor: getStatusColor(task.status),
                                },
                              ]}
                            >
                              <Text style={styles.statusText}>
                                {getStatusText(task.status)}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.taskMeta}>
                            <View style={styles.metaItem}>
                              <Ionicons
                                name="location-outline"
                                size={14}
                                color="#666"
                              />
                              <Text style={styles.metaText}>
                                {task.location} - {task.floor}
                              </Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Ionicons
                                name="calendar-outline"
                                size={14}
                                color="#666"
                              />
                              <Text style={styles.metaText}>
                                {task.startDate} - {task.endDate}
                              </Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Ionicons
                                name="time-outline"
                                size={14}
                                color="#666"
                              />
                              <Text style={styles.metaText}>
                                {task.duration}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Progress bar */}
                        {task.status !== "pending" && (
                          <View style={styles.progressSection}>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${task.progress}%`,
                                    backgroundColor: getStatusColor(
                                      task.status,
                                    ),
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {task.progress}%
                            </Text>
                          </View>
                        )}

                        {/* Task actions */}
                        <View style={styles.taskActions}>
                          {task.hasBlueprint && (
                            <View style={styles.actionChip}>
                              <Ionicons
                                name="document-text"
                                size={14}
                                color="#0D9488"
                              />
                              <Text style={styles.actionChipText}>Bản vẽ</Text>
                            </View>
                          )}
                          {task.hasReport && (
                            <View style={styles.actionChip}>
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color="#0D9488"
                              />
                              <Text style={styles.actionChipText}>Báo cáo</Text>
                            </View>
                          )}
                          {task.workers > 0 && (
                            <View style={styles.actionChip}>
                              <Ionicons
                                name="people"
                                size={14}
                                color="#0D9488"
                              />
                              <Text style={styles.actionChipText}>
                                {task.workers} người
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Phase connector line */}
                {phaseIndex < CONSTRUCTION_PHASES.length - 1 && (
                  <View style={styles.phaseConnector} />
                )}
              </View>
            ))}
          </View>
        ) : (
          // Gantt chart view (simplified)
          <View style={styles.ganttContainer}>
            <Text style={styles.ganttTitle}>Biểu đồ Gantt (Đơn giản hóa)</Text>

            {/* Timeline header */}
            <View style={styles.ganttHeader}>
              <View style={styles.ganttTaskColumn}>
                <Text style={styles.ganttHeaderText}>Công việc</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.ganttTimelineHeader}>
                  {["T6", "T7", "T8", "T9", "T10", "T11", "T12"].map(
                    (month) => (
                      <View key={month} style={styles.ganttMonthCell}>
                        <Text style={styles.ganttHeaderText}>{month}</Text>
                      </View>
                    ),
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Gantt rows */}
            {CONSTRUCTION_PHASES.map((phase) => (
              <View key={phase.id}>
                <Text style={styles.ganttPhaseTitle}>{phase.name}</Text>
                {phase.tasks.map((task) => (
                  <View key={task.id} style={styles.ganttRow}>
                    <View style={styles.ganttTaskColumn}>
                      <Text style={styles.ganttTaskName} numberOfLines={1}>
                        {task.name}
                      </Text>
                      <Text style={styles.ganttTaskLocation}>
                        {task.location}
                      </Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.ganttTimelineRow}>
                        {/* Simplified bar representation */}
                        <View style={styles.ganttBarContainer}>
                          <View
                            style={[
                              styles.ganttBar,
                              { backgroundColor: getStatusColor(task.status) },
                            ]}
                          >
                            <Text style={styles.ganttBarText}>
                              {task.duration}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Task detail modal */}
      <Modal
        visible={showTaskDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết công việc</Text>
              <TouchableOpacity onPress={() => setShowTaskDetail(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Task info */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalTaskName}>{selectedTask.name}</Text>
                  <View
                    style={[
                      styles.modalStatusBadge,
                      { backgroundColor: getStatusColor(selectedTask.status) },
                    ]}
                  >
                    <Text style={styles.modalStatusText}>
                      {getStatusText(selectedTask.status)}
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                {selectedTask.status !== "pending" && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Tiến độ</Text>
                    <View style={styles.modalProgressBar}>
                      <View
                        style={[
                          styles.modalProgressFill,
                          {
                            width: `${selectedTask.progress}%`,
                            backgroundColor: getStatusColor(
                              selectedTask.status,
                            ),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.modalProgressText}>
                      {selectedTask.progress}% hoàn thành
                    </Text>
                  </View>
                )}

                {/* Details */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Thông tin</Text>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="location" size={18} color="#666" />
                    <Text style={styles.modalDetailText}>
                      Vị trí: {selectedTask.location} - {selectedTask.floor}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="calendar" size={18} color="#666" />
                    <Text style={styles.modalDetailText}>
                      Thời gian: {selectedTask.startDate} đến{" "}
                      {selectedTask.endDate}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="time" size={18} color="#666" />
                    <Text style={styles.modalDetailText}>
                      Thời lượng: {selectedTask.duration}
                    </Text>
                  </View>
                  {selectedTask.workers > 0 && (
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="people" size={18} color="#666" />
                      <Text style={styles.modalDetailText}>
                        Nhân công: {selectedTask.workers} người
                      </Text>
                    </View>
                  )}
                </View>

                {/* Notes */}
                {selectedTask.notes.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Ghi chú</Text>
                    {selectedTask.notes.map((note, index) => (
                      <View key={index} style={styles.noteItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#0D9488"
                        />
                        <Text style={styles.noteText}>{note}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Images */}
                {selectedTask.images.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Hình ảnh thi công</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.imagesRow}>
                        {selectedTask.images.map((image, index) => (
                          <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.taskImage}
                          />
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => Alert.alert("Bản vẽ", "Xem bản vẽ gốc")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color="#0D9488"
                    />
                    <Text style={styles.modalActionText}>Bản vẽ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() =>
                      Alert.alert("Báo cáo", "Xem báo cáo tiến độ")
                    }
                  >
                    <Ionicons
                      name="bar-chart-outline"
                      size={24}
                      color="#0D9488"
                    />
                    <Text style={styles.modalActionText}>Báo cáo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => Alert.alert("Ghi chú", "Thêm ghi chú mới")}
                  >
                    <Ionicons name="create-outline" size={24} color="#0D9488" />
                    <Text style={styles.modalActionText}>Ghi chú</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    padding: 8,
  },
  progressSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#fff9",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  viewModeToggle: {
    flexDirection: "row",
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  viewModeButtonActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  viewModeText: {
    fontSize: 14,
    color: "#fff9",
    fontWeight: "500",
  },
  viewModeTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  timelineContainer: {
    padding: 16,
  },
  phaseSection: {
    marginBottom: 8,
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  phaseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  phaseNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  phaseTaskCount: {
    fontSize: 12,
    color: "#666",
  },
  phaseConnector: {
    width: 2,
    height: 20,
    backgroundColor: "#e0e0e0",
    marginLeft: 36,
    marginVertical: 4,
  },
  tasksContainer: {
    marginTop: 12,
    gap: 12,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginLeft: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: "#0D9488",
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  taskName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  taskMeta: {
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
  },
  actionChipText: {
    fontSize: 11,
    color: "#666",
  },
  ganttContainer: {
    padding: 16,
  },
  ganttTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  ganttHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  ganttTaskColumn: {
    width: 120,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  ganttHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  ganttTimelineHeader: {
    flexDirection: "row",
  },
  ganttMonthCell: {
    width: 60,
    padding: 12,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  ganttPhaseTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D9488",
    marginTop: 16,
    marginBottom: 8,
  },
  ganttRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 4,
    overflow: "hidden",
  },
  ganttTaskName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  ganttTaskLocation: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  ganttTimelineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  ganttBarContainer: {
    paddingHorizontal: 8,
  },
  ganttBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    minWidth: 80,
  },
  ganttBarText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTaskName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalStatusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  modalProgressBar: {
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  modalProgressFill: {
    height: "100%",
  },
  modalProgressText: {
    fontSize: 13,
    color: "#666",
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  imagesRow: {
    flexDirection: "row",
    gap: 12,
  },
  taskImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  modalActionButton: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#fff5f0",
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  modalActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D9488",
  },
});
