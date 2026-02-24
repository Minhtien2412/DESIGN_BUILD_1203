import { useThemeColor } from "@/hooks/use-theme-color";
import { useProjectDetail } from "@/hooks/useProjects";
import {
    constructionDesignerRoute,
    constructionPaymentProgressRoute,
} from "@/utils/routes";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ProjectStatus = "planning" | "active" | "completed" | "paused";

const STATUS_CONFIG = {
  planning: {
    color: "#0D9488",
    label: "Lên kế hoạch",
    icon: "calendar-outline" as const,
  },
  active: {
    color: "#0D9488",
    label: "Đang thực hiện",
    icon: "hammer-outline" as const,
  },
  completed: {
    color: "#0D9488",
    label: "Hoàn thành",
    icon: "checkmark-circle-outline" as const,
  },
  paused: {
    color: "#000000",
    label: "Tạm dừng",
    icon: "pause-circle-outline" as const,
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

// Quick Action Card Component
function QuickActionCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickActionCard, { borderColor: color }]}
      onPress={onPress}
    >
      <View
        style={[styles.quickActionIconBox, { backgroundColor: `${color}15` }]}
      >
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        {subtitle && <Text style={styles.quickActionSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <View
      style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}
    >
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function ProjectDetailScreen() {
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");
  const tint = useThemeColor({}, "tint");

  const { id } = useLocalSearchParams<{ id: string }>();
  const { project, loading, error, refresh } = useProjectDetail(
    id ? parseInt(id) : null,
  );

  const [activeTab, setActiveTab] = useState<
    "overview" | "progress" | "team" | "documents"
  >("overview");

  if (loading && !project) {
    return (
      <SafeAreaView
        style={[styles.centerContainer, { backgroundColor: background }]}
      >
        <Stack.Screen
          options={{ title: "Chi tiết dự án", headerShown: false }}
        />
        <ActivityIndicator size="large" color={tint} />
        <Text style={[styles.loadingText, { color: textMuted }]}>
          Đang tải dự án...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !project) {
    return (
      <SafeAreaView
        style={[styles.centerContainer, { backgroundColor: background }]}
      >
        <Stack.Screen
          options={{ title: "Chi tiết dự án", headerShown: false }}
        />
        <Ionicons name="alert-circle-outline" size={64} color="#000000" />
        <Text style={[styles.errorText, { color: text }]}>
          Không thể tải dự án
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: tint }]}
          onPress={refresh}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusConfig =
    STATUS_CONFIG[project.status as ProjectStatus] || STATUS_CONFIG.planning;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View
        style={[
          styles.customHeader,
          { backgroundColor: surface, borderBottomColor: border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: text }]} numberOfLines={1}>
            {project.name}
          </Text>
          <View
            style={[
              styles.headerStatusBadge,
              { backgroundColor: `${statusConfig.color}15` },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={12}
              color={statusConfig.color}
            />
            <Text
              style={[styles.headerStatusText, { color: statusConfig.color }]}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={24} color={text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Project Image */}
        <View style={styles.heroSection}>
          {project.images && project.images.length > 0 ? (
            <Image
              source={{ uri: project.images[0] }}
              style={styles.heroImage}
            />
          ) : (
            <View
              style={[styles.heroPlaceholder, { backgroundColor: `${tint}20` }]}
            >
              <Ionicons name="business-outline" size={64} color={tint} />
            </View>
          )}
          <View style={styles.heroOverlay}>
            <View
              style={[
                styles.progressRing,
                { borderColor: `${statusConfig.color}40` },
              ]}
            >
              <Text
                style={[styles.progressRingText, { color: statusConfig.color }]}
              >
                {project.progress || 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Ngân sách"
            value={formatCurrency(350000000)}
            icon="wallet-outline"
            color="#0D9488"
          />
          <StatCard
            label="Thời gian"
            value="6 tháng"
            icon="time-outline"
            color="#0D9488"
          />
          <StatCard
            label="Thành viên"
            value="12 người"
            icon="people-outline"
            color="#0D9488"
          />
          <StatCard
            label="Nhiệm vụ"
            value="45/83"
            icon="checkbox-outline"
            color="#666666"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            Truy cập nhanh
          </Text>
          <QuickActionCard
            icon="cash-outline"
            title="Tiến độ thanh toán"
            subtitle="Xem chi tiết các khoản thanh toán"
            color="#0D9488"
            onPress={() =>
              router.push(constructionPaymentProgressRoute(id) as any)
            }
          />
          <QuickActionCard
            icon="create-outline"
            title="Thiết kế sơ đồ"
            subtitle="Chỉnh sửa workflow và sơ đồ thi công"
            color="#0D9488"
            onPress={() => router.push(constructionDesignerRoute())}
          />
          <QuickActionCard
            icon="images-outline"
            title="Thư viện ảnh"
            subtitle="24 ảnh tiến độ thi công"
            color="#0D9488"
            onPress={() => router.push(`/projects/${id}/gallery` as any)}
          />
          <QuickActionCard
            icon="document-text-outline"
            title="Tài liệu dự án"
            subtitle="Hợp đồng, bản vẽ, báo cáo"
            color="#666666"
            onPress={() => router.push(`/projects/${id}/documents` as any)}
          />
        </View>

        {/* Project Info */}
        <View
          style={[
            styles.section,
            { backgroundColor: surface, borderRadius: 12, padding: 16 },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: text }]}>
            Thông tin dự án
          </Text>

          {project.description && (
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={tint}
              />
              <Text style={[styles.infoText, { color: text }]}>
                {project.description}
              </Text>
            </View>
          )}

          {project.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={tint} />
              <Text style={[styles.infoText, { color: text }]}>
                {project.location}
              </Text>
            </View>
          )}

          {project.start_date && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={tint} />
              <Text style={[styles.infoText, { color: text }]}>
                Bắt đầu: {formatDate(project.start_date)}
                {project.end_date &&
                  ` • Kết thúc: ${formatDate(project.end_date)}`}
              </Text>
            </View>
          )}
        </View>

        {/* Overall Progress Bar */}
        <View
          style={[
            styles.section,
            { backgroundColor: surface, borderRadius: 12, padding: 16 },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>
              Tiến độ tổng thể
            </Text>
            <Text
              style={[styles.progressPercentage, { color: statusConfig.color }]}
            >
              {project.progress || 0}%
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: `${statusConfig.color}20` },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: statusConfig.color,
                  width: `${project.progress || 0}%`,
                },
              ]}
            />
          </View>
          <View style={styles.progressMilestones}>
            <View style={styles.milestone}>
              <View
                style={[styles.milestoneMarker, { backgroundColor: "#0D9488" }]}
              />
              <Text style={[styles.milestoneText, { color: textMuted }]}>
                Móng
              </Text>
            </View>
            <View style={styles.milestone}>
              <View
                style={[
                  styles.milestoneMarker,
                  { backgroundColor: statusConfig.color },
                ]}
              />
              <Text style={[styles.milestoneText, { color: textMuted }]}>
                Tầng trệt
              </Text>
            </View>
            <View style={styles.milestone}>
              <View
                style={[styles.milestoneMarker, { backgroundColor: "#D1D5DB" }]}
              />
              <Text style={[styles.milestoneText, { color: textMuted }]}>
                Hoàn thiện
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 15 },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // Custom Header
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitleContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  headerStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  headerStatusText: { fontSize: 11, fontWeight: "600" },
  headerAction: { padding: 4 },

  // Hero Section
  heroSection: { position: "relative", width: "100%", height: 220 },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  heroOverlay: { position: "absolute", top: 16, right: 16 },
  progressRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressRingText: { fontSize: 18, fontWeight: "700" },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  statValue: { fontSize: 18, fontWeight: "700" },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  // Quick Action Card
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionContent: { flex: 1, marginLeft: 12 },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  quickActionSubtitle: { fontSize: 13, color: "#6B7280" },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Progress
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressPercentage: { fontSize: 24, fontWeight: "700" },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: { height: "100%", borderRadius: 6 },
  progressMilestones: { flexDirection: "row", justifyContent: "space-between" },
  milestone: { alignItems: "center", gap: 6 },
  milestoneMarker: { width: 10, height: 10, borderRadius: 5 },
  milestoneText: { fontSize: 11, fontWeight: "500" },
});
