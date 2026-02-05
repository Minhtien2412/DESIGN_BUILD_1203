import { MODERN_COLORS } from "@/constants/modern-theme";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface ProgressTrackingTemplateProps {
  projectId: string;
  trackingType: "progress" | "timeline" | "budget" | "quality";
  apiEndpoint: string;
  enablePhotoUpload?: boolean;
  enableComments?: boolean;
  showMilestones?: boolean;
}

interface Milestone {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed" | "delayed";
  progress: number;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
}

interface ProjectProgress {
  overall: number;
  milestones: Milestone[];
  lastUpdated: string;
}

const STATUS_CONFIG = {
  pending: { label: "Chờ", color: "#999", icon: "time-outline" },
  "in-progress": { label: "Đang làm", color: "#0066CC", icon: "sync-outline" },
  completed: {
    label: "Hoàn thành",
    color: "#0066CC",
    icon: "checkmark-circle",
  },
  delayed: { label: "Trễ", color: "#000000", icon: "alert-circle" },
};

export function ProgressTrackingTemplate({
  projectId,
  trackingType,
  apiEndpoint,
  enablePhotoUpload = false,
  enableComments = false,
  showMilestones = true,
}: ProgressTrackingTemplateProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProjectProgress | null>(null);

  useEffect(() => {
    loadProgressData();
  }, [projectId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(apiEndpoint);
      setData(response as ProjectProgress);
    } catch (error) {
      // Fallback mock data
      setData({
        overall: 45,
        lastUpdated: new Date().toISOString(),
        milestones: [
          {
            id: "1",
            name: "Khảo sát hiện trạng",
            status: "completed",
            progress: 100,
            startDate: "2025-01-01",
            endDate: "2025-01-05",
            actualEndDate: "2025-01-04",
          },
          {
            id: "2",
            name: "Thiết kế bản vẽ",
            status: "completed",
            progress: 100,
            startDate: "2025-01-06",
            endDate: "2025-01-15",
            actualEndDate: "2025-01-15",
          },
          {
            id: "3",
            name: "Đào móng",
            status: "in-progress",
            progress: 60,
            startDate: "2025-01-16",
            endDate: "2025-01-25",
          },
          {
            id: "4",
            name: "Ép cọc",
            status: "pending",
            progress: 0,
            startDate: "2025-01-26",
            endDate: "2025-02-05",
          },
          {
            id: "5",
            name: "Đổ bê tông móng",
            status: "pending",
            progress: 0,
            startDate: "2025-02-06",
            endDate: "2025-02-15",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (progress: number) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    );
  };

  const renderMilestone = (milestone: Milestone) => {
    const config = STATUS_CONFIG[milestone.status];

    return (
      <View key={milestone.id} style={styles.milestoneCard}>
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneLeft}>
            <Ionicons
              name={config.icon as any}
              size={20}
              color={config.color}
            />
            <Text style={styles.milestoneName}>{milestone.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
            <Text style={styles.statusText}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.milestoneProgress}>
          {renderProgressBar(milestone.progress)}
          <Text style={styles.progressText}>{milestone.progress}%</Text>
        </View>

        <View style={styles.milestoneDates}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.dateText}>
              {new Date(milestone.startDate).toLocaleDateString("vi-VN")} -
              {new Date(milestone.endDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          {milestone.actualEndDate && (
            <View style={styles.dateItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color="#0066CC"
              />
              <Text style={[styles.dateText, { color: "#0066CC" }]}>
                Hoàn thành:{" "}
                {new Date(milestone.actualEndDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProgressData}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {trackingType === "progress"
            ? "Tiến độ thi công"
            : trackingType === "timeline"
              ? "Timeline dự án"
              : trackingType === "budget"
                ? "Ngân sách"
                : "Kiểm soát chất lượng"}
        </Text>
        <TouchableOpacity onPress={loadProgressData}>
          <Ionicons name="refresh" size={24} color={MODERN_COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overall Progress */}
        <View style={styles.overallSection}>
          <Text style={styles.overallLabel}>Tiến độ tổng thể</Text>
          <View style={styles.overallProgress}>
            <View style={styles.circleProgress}>
              <Text style={styles.circleText}>{data.overall}%</Text>
            </View>
            <View style={styles.overallInfo}>
              <Text style={styles.overallTitle}>Đang tiến hành tốt</Text>
              <Text style={styles.overallDate}>
                Cập nhật: {new Date(data.lastUpdated).toLocaleString("vi-VN")}
              </Text>
            </View>
          </View>
        </View>

        {/* Milestones */}
        {showMilestones && (
          <View style={styles.milestonesSection}>
            <Text style={styles.sectionTitle}>Các giai đoạn</Text>
            {data.milestones.map(renderMilestone)}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {enablePhotoUpload && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="camera" size={20} color={MODERN_COLORS.primary} />
              <Text style={styles.actionText}>Tải ảnh hiện trường</Text>
            </TouchableOpacity>
          )}
          {enableComments && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="chatbubbles"
                size={20}
                color={MODERN_COLORS.primary}
              />
              <Text style={styles.actionText}>Thêm nhận xét</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  overallSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  overallLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  overallProgress: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  circleProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  circleText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  },
  overallInfo: {
    marginLeft: 16,
    flex: 1,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  overallDate: {
    fontSize: 12,
    color: "#666",
  },
  milestonesSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: 16,
  },
  milestoneCard: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  milestoneLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  milestoneName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#fff",
  },
  milestoneProgress: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  progressBarFill: {
    flex: 1,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#666",
    width: 40,
  },
  milestoneDates: {
    gap: 4,
  },
  dateItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  dateText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  actionsSection: {
    padding: 16,
    backgroundColor: "#fff",
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600" as const,
    color: MODERN_COLORS.primary,
  },
};
