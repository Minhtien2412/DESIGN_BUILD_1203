/**
 * ProjectSelector.tsx
 * Project selection and creation interface for Construction Map
 *
 * Features:
 * - List all user projects with search
 * - Create new project
 * - Project templates selection
 * - Quick stats display (tasks, progress)
 * - Recent projects section
 * - Empty state with CTA
 */

import { ConstructionProject } from "@/types/construction-map";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ProjectSelectorProps {
  visible: boolean;
  projects: ConstructionProject[];
  currentProjectId?: string;
  onSelectProject: (project: ConstructionProject) => void;
  onCreateProject: () => void;
  onClose: () => void;
  loading?: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  visible,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onClose,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "recent">("all");

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.projectId.toLowerCase().includes(query) ||
          (p.name && p.name.toLowerCase().includes(query)),
      );
    }

    // Recent filter - now enabled with ConstructionProject
    if (selectedTab === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter(
        (p) => p.updatedAt && new Date(p.updatedAt) > sevenDaysAgo,
      );
    }

    return result;
  }, [projects, searchQuery, selectedTab]);

  // Calculate project stats
  const getProjectStats = (project: ConstructionProject) => {
    const totalTasks = project.tasks?.length || 0;
    const completedTasks =
      project.tasks?.filter((t: { status: string }) => t.status === "completed")
        .length || 0;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return { totalTasks, completedTasks, progress };
  };

  // Get status color
  const getStatusColor = (status?: string): string => {
    switch (status) {
      case "Planning":
        return "#0D9488";
      case "InProgress":
        return "#0D9488";
      case "OnHold":
        return "#000000";
      case "Completed":
        return "#0D9488";
      case "Cancelled":
        return "#6B7280";
      default:
        return "#9CA3AF";
    }
  };

  // Render project card
  const renderProjectCard = (project: ConstructionProject) => {
    const stats = getProjectStats(project);
    const isSelected = project.projectId === currentProjectId;

    return (
      <TouchableOpacity
        key={project.id || project.projectId}
        style={[styles.projectCard, isSelected && styles.projectCardSelected]}
        onPress={() => onSelectProject(project)}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleRow}>
            <Text style={styles.projectName} numberOfLines={1}>
              {project.name || project.projectId}
            </Text>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(project.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {project.status === "Planning"
                ? "Lập kế hoạch"
                : project.status === "InProgress"
                  ? "Đang thi công"
                  : project.status === "OnHold"
                    ? "Tạm dừng"
                    : project.status === "Completed"
                      ? "Hoàn thành"
                      : project.status === "Cancelled"
                        ? "Đã hủy"
                        : ""}
            </Text>
          </View>
        </View>

        {project.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="list-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{stats.totalTasks} công việc</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#0D9488"
            />
            <Text style={styles.statText}>
              {stats.completedTasks} hoàn thành
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {stats.totalTasks > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${stats.progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {stats.progress.toFixed(0)}%
            </Text>
          </View>
        )}

        {/* Footer info */}
        <View style={styles.projectFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text style={styles.footerText}>
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString("vi-VN")
                : "Chưa bắt đầu"}
            </Text>
          </View>
          {project.updatedAt && (
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <Text style={styles.footerText}>
                {new Date(project.updatedAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn Dự Án</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dự án..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "all" && styles.tabActive]}
            onPress={() => setSelectedTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "all" && styles.tabTextActive,
              ]}
            >
              Tất cả ({projects.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "recent" && styles.tabActive]}
            onPress={() => setSelectedTab("recent")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "recent" && styles.tabTextActive,
              ]}
            >
              Gần đây
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D9488" />
              <Text style={styles.loadingText}>Đang tải dự án...</Text>
            </View>
          ) : filteredProjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "Không tìm thấy dự án" : "Chưa có dự án nào"}
              </Text>
              <Text style={styles.emptyDescription}>
                {searchQuery
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Tạo dự án đầu tiên để bắt đầu quản lý công trình"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={onCreateProject}
                >
                  <Ionicons name="add-circle" size={20} color="#FFF" />
                  <Text style={styles.createButtonText}>Tạo Dự Án Mới</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.projectList}>
              {filteredProjects.map(renderProjectCard)}
            </View>
          )}
        </ScrollView>

        {/* FAB Create Button */}
        {!loading && filteredProjects.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={onCreateProject}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFF",
  },
  tabActive: {
    backgroundColor: "#0D9488",
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  projectList: {
    padding: 16,
    gap: 12,
  },
  projectCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectCardSelected: {
    borderWidth: 2,
    borderColor: "#0D9488",
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  projectTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  selectedBadge: {
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "600",
  },
  projectDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: "#6B7280",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0D9488",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
