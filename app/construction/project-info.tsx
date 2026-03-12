/**
 * Construction Project Info Screen
 * ==================================
 *
 * Hiển thị thông tin chi tiết công trình
 * Features: Basic info, timeline, budget, team, documents
 *
 * @author ThietKeResort Team
 */

import { MODERN_SHADOWS } from "@/constants/modern-theme";
import { projectService } from "@/services/api/project.service";
import type { Project as ApiProject } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Mock project data
const MOCK_PROJECT = {
  id: "proj-001",
  name: "Biệt thự Vinhomes Grand Park",
  code: "VGP-2025-001",
  type: "Biệt thự",
  status: "in_progress", // pending, in_progress, completed, suspended
  priority: "high",

  // Location
  address: "123 Nguyễn Xiển, Long Thạnh Mỹ, Quận 9",
  city: "TP. Hồ Chí Minh",
  ward: "Long Thạnh Mỹ",
  district: "Quận 9",
  coordinates: { lat: 10.8231, lng: 106.8424 },

  // Area
  landArea: 250, // m2
  buildingArea: 420, // m2
  floors: 3,
  basements: 1,

  // Timeline
  startDate: "2025-01-15",
  estimatedEndDate: "2025-08-30",
  actualEndDate: null,
  duration: 228, // days
  daysRemaining: 180,
  progress: 35,

  // Budget
  totalBudget: 4500000000,
  usedBudget: 1575000000,
  remainingBudget: 2925000000,

  // Client
  client: {
    name: "Nguyễn Văn An",
    phone: "0901234567",
    email: "nguyenvanan@email.com",
    avatar: "https://i.pravatar.cc/150?img=33",
  },

  // Team
  projectManager: {
    name: "Trần Minh Đức",
    role: "Quản lý dự án",
    phone: "0912345678",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  engineer: {
    name: "Lê Hoàng Nam",
    role: "Kỹ sư giám sát",
    phone: "0923456789",
    avatar: "https://i.pravatar.cc/150?img=15",
  },

  // Stats
  stats: {
    tasks: { total: 45, completed: 18, inProgress: 8 },
    issues: { total: 5, resolved: 3 },
    documents: { total: 32 },
    photos: { total: 156 },
  },

  description:
    "Dự án xây dựng biệt thự 3 tầng, 1 tầng hầm với thiết kế hiện đại. Công trình bao gồm hệ thống smart home, hồ bơi và sân vườn.",
};

const STATUS_CONFIG = {
  pending: {
    label: "Chờ khởi công",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    icon: "time-outline",
  },
  in_progress: {
    label: "Đang thi công",
    color: "#0D9488",
    bgColor: "#F0FDFA",
    icon: "construct-outline",
  },
  completed: {
    label: "Hoàn thành",
    color: "#10B981",
    bgColor: "#ECFDF5",
    icon: "checkmark-circle-outline",
  },
  suspended: {
    label: "Tạm dừng",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    icon: "pause-circle-outline",
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Thấp", color: "#6B7280" },
  medium: { label: "Trung bình", color: "#F59E0B" },
  high: { label: "Cao", color: "#EF4444" },
};

export default function ProjectInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"info" | "team" | "docs">("info");
  const [project, setProject] = useState(MOCK_PROJECT);
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async () => {
    try {
      const projectId = Number(id);
      if (!projectId || Number.isNaN(projectId)) throw new Error("Invalid ID");
      const apiProject: ApiProject = await projectService.getById(projectId);
      if (apiProject && apiProject.id) {
        setProject({
          ...MOCK_PROJECT,
          id: String(apiProject.id),
          name: apiProject.name || MOCK_PROJECT.name,
          code: `PRJ-${apiProject.id}`,
          status:
            apiProject.status === "IN_PROGRESS"
              ? "in_progress"
              : apiProject.status === "COMPLETED"
                ? "completed"
                : apiProject.status === "ON_HOLD"
                  ? "suspended"
                  : "pending",
          startDate:
            apiProject.startDate?.split("T")[0] || MOCK_PROJECT.startDate,
          estimatedEndDate:
            apiProject.endDate?.split("T")[0] || MOCK_PROJECT.estimatedEndDate,
          totalBudget: apiProject.budget || MOCK_PROJECT.totalBudget,
          progress: apiProject.progress || MOCK_PROJECT.progress,
          usedBudget: apiProject.budget
            ? Math.round((apiProject.budget * (apiProject.progress || 0)) / 100)
            : MOCK_PROJECT.usedBudget,
          remainingBudget: apiProject.budget
            ? Math.round(
                apiProject.budget -
                  (apiProject.budget * (apiProject.progress || 0)) / 100,
              )
            : MOCK_PROJECT.remainingBudget,
          description: apiProject.description || MOCK_PROJECT.description,
          client: {
            ...MOCK_PROJECT.client,
            name: apiProject.clientName || MOCK_PROJECT.client.name,
          },
          engineer: {
            ...MOCK_PROJECT.engineer,
            name: apiProject.engineerName || MOCK_PROJECT.engineer.name,
          },
        });
        console.log("[ProjectInfo] Loaded from API:", apiProject.name);
      }
    } catch (error) {
      console.log("[ProjectInfo] API error, using mock:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const statusConfig =
    STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
  const priorityConfig =
    PRIORITY_CONFIG[project.priority as keyof typeof PRIORITY_CONFIG];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={["#0F766E", "#0D9488"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <SafeAreaView>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Thông tin công trình</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Project Title */}
        <View style={styles.headerContent}>
          <Text style={styles.projectCode}>{project.code}</Text>
          <Text style={styles.projectName}>{project.name}</Text>

          {/* Status & Priority */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <Ionicons
                name={statusConfig.icon as any}
                size={14}
                color="#fff"
              />
              <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityConfig.color },
              ]}
            >
              <Text style={styles.priorityBadgeText}>
                Ưu tiên {priorityConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ thi công</Text>
            <Text style={styles.progressValue}>{project.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${project.progress}%` }]}
            />
          </View>
          <Text style={styles.daysRemaining}>
            Còn {project.daysRemaining} ngày đến hạn dự kiến
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { key: "info", label: "Thông tin", icon: "information-circle-outline" },
        { key: "team", label: "Đội ngũ", icon: "people-outline" },
        { key: "docs", label: "Tài liệu", icon: "documents-outline" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.key ? "#0D9488" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInfoTab = () => (
    <>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/crm/tasks")}
        >
          <View style={[styles.statIcon, { backgroundColor: "#F0FDFA" }]}>
            <Ionicons name="checkbox-outline" size={24} color="#0D9488" />
          </View>
          <Text style={styles.statValue}>
            {project.stats.tasks.completed}/{project.stats.tasks.total}
          </Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/crm/invoices")}
        >
          <View style={[styles.statIcon, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="receipt-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.statValue}>
            {formatCurrency(project.usedBudget).replace("₫", "")}
          </Text>
          <Text style={styles.statLabel}>Đã chi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/documents")}
        >
          <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="document-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>{project.stats.documents.total}</Text>
          <Text style={styles.statLabel}>Tài liệu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="warning-outline" size={24} color="#EF4444" />
          </View>
          <Text style={styles.statValue}>
            {project.stats.issues.total - project.stats.issues.resolved}
          </Text>
          <Text style={styles.statLabel}>Vấn đề</Text>
        </TouchableOpacity>
      </View>

      {/* Location Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Địa điểm</Text>
        </View>
        <Text style={styles.addressText}>{project.address}</Text>
        <Text style={styles.cityText}>
          {project.ward}, {project.district}, {project.city}
        </Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push("/construction/map-view")}
        >
          <Ionicons name="map-outline" size={16} color="#0D9488" />
          <Text style={styles.mapButtonText}>Xem bản đồ</Text>
        </TouchableOpacity>
      </View>

      {/* Area Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="resize-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Diện tích & Quy mô</Text>
        </View>
        <View style={styles.areaGrid}>
          <View style={styles.areaItem}>
            <Text style={styles.areaValue}>{project.landArea} m²</Text>
            <Text style={styles.areaLabel}>Đất</Text>
          </View>
          <View style={styles.areaDivider} />
          <View style={styles.areaItem}>
            <Text style={styles.areaValue}>{project.buildingArea} m²</Text>
            <Text style={styles.areaLabel}>Xây dựng</Text>
          </View>
          <View style={styles.areaDivider} />
          <View style={styles.areaItem}>
            <Text style={styles.areaValue}>{project.floors}</Text>
            <Text style={styles.areaLabel}>Tầng</Text>
          </View>
          <View style={styles.areaDivider} />
          <View style={styles.areaItem}>
            <Text style={styles.areaValue}>{project.basements}</Text>
            <Text style={styles.areaLabel}>Hầm</Text>
          </View>
        </View>
      </View>

      {/* Timeline Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Tiến độ thời gian</Text>
        </View>
        <View style={styles.timelineRow}>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Khởi công</Text>
            <Text style={styles.timelineValue}>
              {formatDate(project.startDate)}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#CBD5E1" />
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Dự kiến hoàn thành</Text>
            <Text style={styles.timelineValue}>
              {formatDate(project.estimatedEndDate)}
            </Text>
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.durationText}>
            Thời gian: {project.duration} ngày
          </Text>
        </View>
      </View>

      {/* Budget Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Ngân sách</Text>
        </View>
        <View style={styles.budgetMain}>
          <Text style={styles.budgetTotal}>
            {formatCurrency(project.totalBudget)}
          </Text>
          <Text style={styles.budgetLabel}>Tổng ngân sách</Text>
        </View>
        <View style={styles.budgetProgress}>
          <View style={styles.budgetBar}>
            <View
              style={[
                styles.budgetFill,
                {
                  width: `${(project.usedBudget / project.totalBudget) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.budgetPercent}>
            {((project.usedBudget / project.totalBudget) * 100).toFixed(1)}% đã
            sử dụng
          </Text>
        </View>
        <View style={styles.budgetDetails}>
          <View style={styles.budgetItem}>
            <View style={[styles.budgetDot, { backgroundColor: "#0D9488" }]} />
            <Text style={styles.budgetItemLabel}>Đã chi:</Text>
            <Text style={styles.budgetItemValue}>
              {formatCurrency(project.usedBudget)}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <View style={[styles.budgetDot, { backgroundColor: "#E2E8F0" }]} />
            <Text style={styles.budgetItemLabel}>Còn lại:</Text>
            <Text style={styles.budgetItemValue}>
              {formatCurrency(project.remainingBudget)}
            </Text>
          </View>
        </View>
      </View>

      {/* Description Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Mô tả dự án</Text>
        </View>
        <Text style={styles.descriptionText}>{project.description}</Text>
      </View>
    </>
  );

  const renderTeamTab = () => (
    <>
      {/* Client Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Chủ đầu tư</Text>
        </View>
        <View style={styles.personCard}>
          <Image
            source={{ uri: project.client.avatar }}
            style={styles.personAvatar}
          />
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{project.client.name}</Text>
            <Text style={styles.personRole}>Khách hàng</Text>
          </View>
          <View style={styles.personActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={20} color="#0D9488" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#0D9488" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Project Manager */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="briefcase-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Quản lý dự án</Text>
        </View>
        <View style={styles.personCard}>
          <Image
            source={{ uri: project.projectManager.avatar }}
            style={styles.personAvatar}
          />
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{project.projectManager.name}</Text>
            <Text style={styles.personRole}>{project.projectManager.role}</Text>
          </View>
          <View style={styles.personActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={20} color="#0D9488" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#0D9488" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Engineer */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="construct-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Kỹ sư giám sát</Text>
        </View>
        <View style={styles.personCard}>
          <Image
            source={{ uri: project.engineer.avatar }}
            style={styles.personAvatar}
          />
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{project.engineer.name}</Text>
            <Text style={styles.personRole}>{project.engineer.role}</Text>
          </View>
          <View style={styles.personActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={20} color="#0D9488" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#0D9488" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );

  const renderDocsTab = () => (
    <>
      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/documents")}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#F0FDFA" }]}>
            <Ionicons name="folder-outline" size={24} color="#0D9488" />
          </View>
          <Text style={styles.quickLinkText}>Tất cả tài liệu</Text>
          <View style={styles.quickLinkBadge}>
            <Text style={styles.quickLinkBadgeText}>
              {project.stats.documents.total}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/crm/invoices")}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="receipt-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.quickLinkText}>Hoá đơn</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/contracts")}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons
              name="document-attach-outline"
              size={24}
              color="#8B5CF6"
            />
          </View>
          <Text style={styles.quickLinkText}>Hợp đồng</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/file-upload")}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="cloud-upload-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.quickLinkText}>Upload tài liệu</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderTabs()}

        <View style={styles.content}>
          {activeTab === "info" && renderInfoTab()}
          {activeTab === "team" && renderTeamTab()}
          {activeTab === "docs" && renderDocsTab()}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => router.push("/construction/progress")}
        >
          <Ionicons name="analytics-outline" size={24} color="#0D9488" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          onPress={() => router.push("/crm/tasks")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  projectCode: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginBottom: 4,
  },
  projectName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  progressSection: {
    paddingHorizontal: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  daysRemaining: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#F0FDFA",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  tabTextActive: {
    color: "#0D9488",
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    ...MODERN_SHADOWS.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...MODERN_SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  addressText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0D9488",
  },
  areaGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  areaItem: {
    flex: 1,
    alignItems: "center",
  },
  areaDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
  },
  areaValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  areaLabel: {
    fontSize: 12,
    color: "#666",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timelineItem: {},
  timelineLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  durationText: {
    fontSize: 13,
    color: "#666",
  },
  budgetMain: {
    marginBottom: 16,
  },
  budgetTotal: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  budgetLabel: {
    fontSize: 12,
    color: "#666",
  },
  budgetProgress: {
    marginBottom: 16,
  },
  budgetBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  budgetFill: {
    height: "100%",
    backgroundColor: "#0D9488",
    borderRadius: 4,
  },
  budgetPercent: {
    fontSize: 12,
    color: "#666",
  },
  budgetDetails: {
    gap: 8,
  },
  budgetItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  budgetItemLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  budgetItemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  personAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E2E8F0",
  },
  personInfo: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  personRole: {
    fontSize: 13,
    color: "#666",
  },
  personActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinks: {
    gap: 12,
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    ...MODERN_SHADOWS.sm,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
  quickLinkBadge: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quickLinkBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...MODERN_SHADOWS.md,
  },
  fabPrimary: {
    backgroundColor: "#0D9488",
  },
  fabSecondary: {
    backgroundColor: "#fff",
  },
});
