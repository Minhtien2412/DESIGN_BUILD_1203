/**
 * Construction Map - Main Index Screen
 * Displays list of projects with construction map access
 */

import { Container } from "@/components/ui/container";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "on-hold" | "completed";
  progress: number;
  taskCount: number;
  stageCount: number;
  lastUpdated: string;
  thumbnail?: string;
}

export default function ConstructionMapIndexScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Load projects
  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects when search or filter changes
  useEffect(() => {
    filterProjects();
  }, [searchQuery, filterStatus, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Try API first
      const response = await projectService.list({ page: 1, limit: 50 });
      const items: ApiProject[] = response?.data ?? [];
      if (Array.isArray(items) && items.length > 0) {
        const mapped: Project[] = items.map((p: ApiProject) => ({
          id: String(p.id),
          name: p.name,
          description: p.description || "",
          status:
            p.status === "IN_PROGRESS"
              ? ("active" as const)
              : p.status === "COMPLETED"
                ? ("completed" as const)
                : p.status === "ON_HOLD"
                  ? ("on-hold" as const)
                  : ("planning" as const),
          progress: p.progress || 0,
          taskCount: 0,
          stageCount: 0,
          lastUpdated: p.updatedAt || new Date().toISOString(),
        }));
        setProjects(mapped);
        console.log("[ConstructionMapIndex] Loaded", mapped.length, "from API");
        return;
      }
    } catch (apiError) {
      console.log("[ConstructionMapIndex] API error, using mock:", apiError);
    }
    // Fallback to mock
    try {
      const mockProjects: Project[] = [
        {
          id: "villa-001",
          name: "Villa Luxury Resort",
          description: "Biệt thự cao cấp 5 sao tại Phú Quốc",
          status: "active",
          progress: 65,
          taskCount: 45,
          stageCount: 8,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "hotel-002",
          name: "Khách sạn Seaside",
          description: "Khách sạn 20 tầng view biển",
          status: "active",
          progress: 40,
          taskCount: 78,
          stageCount: 12,
          lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "resort-003",
          name: "Khu nghỉ dưỡng Paradise",
          description: "Resort 4 sao với 50 căn villa",
          status: "planning",
          progress: 15,
          taskCount: 32,
          stageCount: 6,
          lastUpdated: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "building-004",
          name: "Tòa nhà văn phòng Central",
          description: "Văn phòng hạng A 15 tầng",
          status: "on-hold",
          progress: 55,
          taskCount: 60,
          stageCount: 10,
          lastUpdated: new Date(Date.now() - 604800000).toISOString(),
        },
        {
          id: "villa-005",
          name: "Biệt thự Ocean View",
          description: "Biệt thự đơn lập view biển",
          status: "completed",
          progress: 100,
          taskCount: 38,
          stageCount: 7,
          lastUpdated: new Date(Date.now() - 2592000000).toISOString(),
        },
      ];
      setProjects(mockProjects);
    } catch (error) {
      console.error("[ConstructionMapIndex] Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "#0D9488";
      case "completed":
        return "#10B981";
      case "on-hold":
        return "#F59E0B";
      case "planning":
        return "#94A3B8";
      default:
        return "#94A3B8";
    }
  };

  const getStatusLabel = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "Đang thi công";
      case "completed":
        return "Hoàn thành";
      case "on-hold":
        return "Tạm dừng";
      case "planning":
        return "Lên kế hoạch";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleProjectPress = (projectId: string) => {
    router.push(`/construction/map/${projectId}`);
  };

  const renderProjectCard = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, { borderColor }]}
      onPress={() => handleProjectPress(item.id)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text
            style={[styles.projectName, { color: textColor }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Tiến độ</Text>
          <Text
            style={[
              styles.progressPercent,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.progress}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.progress}%`,
                backgroundColor: getStatusColor(item.status),
              },
            ]}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.taskCount} tasks</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="layers-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.stageCount} stages</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.statText}>{formatDate(item.lastUpdated)}</Text>
        </View>
      </View>

      {/* Open Button */}
      <View style={styles.cardFooter}>
        <Ionicons name="map-outline" size={18} color="#0D9488" />
        <Text style={styles.openText}>Xem bản đồ thi công</Text>
        <Ionicons name="chevron-forward" size={18} color="#0D9488" />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: textColor }]}>Bản đồ Thi công</Text>
      <Text style={styles.subtitle}>
        Quản lý tiến độ trực quan với Construction Map
      </Text>

      {/* Search */}
      <View style={[styles.searchContainer, { borderColor }]}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm kiếm dự án..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {["all", "active", "planning", "on-hold", "completed"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive,
              filterStatus === status && {
                borderColor: getStatusColor(status as any),
              },
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive,
                filterStatus === status && {
                  color: getStatusColor(status as any),
                },
              ]}
            >
              {status === "all"
                ? "Tất cả"
                : getStatusLabel(status as Project["status"])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredProjects.length} dự án
        {searchQuery && ` cho "${searchQuery}"`}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Không tìm thấy dự án nào</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery
          ? "Thử tìm kiếm với từ khóa khác"
          : "Chưa có dự án với Construction Map"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Đang tải dự án...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D9488"]}
            tintColor="#0D9488"
          />
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  filterTabActive: {
    backgroundColor: "#f0f8ff",
    borderWidth: 2,
  },
  filterTabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  filterTabTextActive: {
    fontWeight: "600",
  },
  resultsCount: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
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
  projectDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#999",
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  openText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#0D9488",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 8,
  },
});
