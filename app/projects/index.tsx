/**
 * Projects Index Page - Danh sách dự án
 * Route: /projects
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Project {
  id: string;
  name: string;
  description: string;
  image?: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  location: string;
  manager: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Nhà phố 3 tầng Quận 7",
    description: "Xây dựng nhà phố hiện đại 3 tầng với tầng hầm để xe",
    status: "in_progress",
    progress: 65,
    budget: 2500000000,
    spent: 1625000000,
    startDate: "2024-03-15",
    endDate: "2024-12-30",
    location: "Quận 7, TP.HCM",
    manager: "Nguyễn Văn Hùng",
  },
  {
    id: "proj-2",
    name: "Biệt thự vườn Thủ Đức",
    description: "Thiết kế và thi công biệt thự vườn phong cách Pháp",
    status: "planning",
    progress: 15,
    budget: 5000000000,
    spent: 150000000,
    startDate: "2024-06-01",
    location: "TP. Thủ Đức",
    manager: "Trần Minh Đức",
  },
  {
    id: "proj-3",
    name: "Căn hộ Penthouse Q1",
    description: "Nội thất cao cấp căn hộ Penthouse",
    status: "completed",
    progress: 100,
    budget: 800000000,
    spent: 785000000,
    startDate: "2024-01-10",
    endDate: "2024-04-20",
    location: "Quận 1, TP.HCM",
    manager: "Lê Thị Mai",
  },
  {
    id: "proj-4",
    name: "Văn phòng Startup Hub",
    description: "Cải tạo và fit-out văn phòng coworking space",
    status: "on_hold",
    progress: 40,
    budget: 1200000000,
    spent: 480000000,
    startDate: "2024-02-20",
    location: "Quận Bình Thạnh",
    manager: "Phạm Anh Tuấn",
  },
];

const STATUS_CONFIG = {
  planning: {
    label: "Lập kế hoạch",
    color: "#FF9800",
    icon: "clipboard-outline",
  },
  in_progress: {
    label: "Đang thi công",
    color: "#2196F3",
    icon: "construct-outline",
  },
  completed: {
    label: "Hoàn thành",
    color: "#4CAF50",
    icon: "checkmark-circle-outline",
  },
  on_hold: {
    label: "Tạm dừng",
    color: "#F44336",
    icon: "pause-circle-outline",
  },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu`;
  }
  return amount.toLocaleString("vi-VN");
}

function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  const statusConfig = STATUS_CONFIG[project.status];
  const budgetPercent = (project.spent / project.budget) * 100;

  return (
    <Pressable style={styles.projectCard} onPress={onPress}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.color + "20" },
          ]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={14}
            color={statusConfig.color}
          />
          <ThemedText
            style={[styles.statusText, { color: statusConfig.color }]}
          >
            {statusConfig.label}
          </ThemedText>
        </View>
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={18} color="#888" />
        </Pressable>
      </View>

      {/* Project Info */}
      <ThemedText style={styles.projectName} numberOfLines={1}>
        {project.name}
      </ThemedText>
      <ThemedText style={styles.projectDesc} numberOfLines={2}>
        {project.description}
      </ThemedText>

      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color="#888" />
        <ThemedText style={styles.locationText}>{project.location}</ThemedText>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText style={styles.progressLabel}>Tiến độ</ThemedText>
          <ThemedText style={styles.progressPercent}>
            {project.progress}%
          </ThemedText>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${project.progress}%`,
                backgroundColor: statusConfig.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Budget Info */}
      <View style={styles.budgetSection}>
        <View style={styles.budgetItem}>
          <ThemedText style={styles.budgetLabel}>Ngân sách</ThemedText>
          <ThemedText style={styles.budgetValue}>
            {formatCurrency(project.budget)}
          </ThemedText>
        </View>
        <View style={styles.budgetDivider} />
        <View style={styles.budgetItem}>
          <ThemedText style={styles.budgetLabel}>Đã chi</ThemedText>
          <ThemedText
            style={[
              styles.budgetValue,
              budgetPercent > 90 && styles.budgetWarning,
            ]}
          >
            {formatCurrency(project.spent)}
          </ThemedText>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.managerInfo}>
          <Ionicons name="person-circle-outline" size={16} color="#888" />
          <ThemedText style={styles.managerName}>{project.manager}</ThemedText>
        </View>
        <ThemedText style={styles.dateText}>
          {new Date(project.startDate).toLocaleDateString("vi-VN")}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function ProjectsIndexScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">(
    "all",
  );
  const backgroundColor = useThemeColor({}, "background");

  const filteredProjects = useMemo(() => {
    if (filter === "all") return MOCK_PROJECTS;
    return MOCK_PROJECTS.filter((p) => p.status === filter);
  }, [filter]);

  const stats = useMemo(() => {
    return {
      total: MOCK_PROJECTS.length,
      inProgress: MOCK_PROJECTS.filter((p) => p.status === "in_progress")
        .length,
      completed: MOCK_PROJECTS.filter((p) => p.status === "completed").length,
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Dự án",
          headerStyle: { backgroundColor: "#2196F3" },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable
                style={styles.headerButton}
                onPress={() => router.push("/projects/management" as Href)}
              >
                <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.headerButton}
                onPress={() => router.push("/projects/create" as Href)}
              >
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </Pressable>
            </View>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor }]}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
            <ThemedText style={styles.statLabel}>Tổng dự án</ThemedText>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <ThemedText style={[styles.statNumber, { color: "#2196F3" }]}>
              {stats.inProgress}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Đang thực hiện</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: "#4CAF50" }]}>
              {stats.completed}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Hoàn thành</ThemedText>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(["all", "in_progress", "completed"] as const).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f === "all"
                  ? "Tất cả"
                  : f === "in_progress"
                    ? "Đang làm"
                    : "Hoàn thành"}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Project List */}
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => router.push(`/projects/${item.id}` as Href)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2196F3"]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="folder-open-outline"
                size={64}
                color="#CCCCCC"
              />
              <ThemedText style={styles.emptyText}>
                Chưa có dự án nào
              </ThemedText>
              <Pressable
                style={styles.createButton}
                onPress={() => router.push("/projects/create" as Href)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <ThemedText style={styles.createButtonText}>
                  Tạo dự án mới
                </ThemedText>
              </Pressable>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  filterTabActive: {
    backgroundColor: "#2196F3",
  },
  filterText: {
    fontSize: 13,
    color: "#757575",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreButton: {
    padding: 4,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 6,
  },
  projectDesc: {
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: "#888888",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#757575",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#212121",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  budgetSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginBottom: 12,
  },
  budgetItem: {
    flex: 1,
  },
  budgetDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  budgetLabel: {
    fontSize: 11,
    color: "#999999",
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
  },
  budgetWarning: {
    color: "#F44336",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  managerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  managerName: {
    fontSize: 12,
    color: "#757575",
  },
  dateText: {
    fontSize: 11,
    color: "#999999",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#888888",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
