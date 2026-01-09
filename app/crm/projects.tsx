/**
 * Perfex CRM - Projects Management Screen
 * ========================================
 * 
 * Màn hình quản lý dự án với khả năng lọc, tìm kiếm và xem chi tiết
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useProjects } from '@/hooks/usePerfexAPI';
import type { Project } from '@/types/perfex';

// Helper functions
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getProjectStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    '1': 'Chưa bắt đầu',
    '2': 'Đang tiến hành',
    '3': 'Tạm dừng',
    '4': 'Hoàn thành',
    '5': 'Đã hủy',
  };
  return statusMap[status] || 'Không xác định';
};

// ==================== FILTER OPTIONS ====================

const STATUS_FILTERS = [
  { id: 'all', label: 'Tất cả', value: null },
  { id: '1', label: 'Chưa bắt đầu', value: '1' },
  { id: '2', label: 'Đang tiến hành', value: '2' },
  { id: '3', label: 'Tạm dừng', value: '3' },
  { id: '4', label: 'Hoàn thành', value: '4' },
  { id: '5', label: 'Đã hủy', value: '5' },
];

// ==================== MAIN CONTENT ====================

function ProjectsContent() {
  const { 
    projects, 
    stats, 
    loading, 
    error, 
    refresh, 
    search 
  } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Handle search with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (search) search(query);
  }, [search]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by status
    if (selectedStatus) {
      result = result.filter(p => p.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.clientid && p.clientid.toLowerCase().includes(query))
      );
    }

    return result;
  }, [projects, selectedStatus, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Stats already calculated by hook
  // stats includes: total, inProgress, completed, totalValue

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard project={item} />
  );

  // Loading state
  if (loading && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý dự án</Text>
          <View style={styles.refreshButton} />
        </View>
        <View style={[styles.emptyContainer, { flex: 1 }]}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý dự án</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={22} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        <View style={[styles.emptyContainer, { flex: 1 }]}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.emptyText, { marginTop: 16, color: '#EF4444' }]}>Lỗi tải dữ liệu</Text>
          <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 12 }}>
            <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý dự án</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          label="Tổng dự án"
          value={stats.total.toString()}
          icon="folder"
          color="#3B82F6"
        />
        <StatCard
          label="Đang thực hiện"
          value={stats.inProgress.toString()}
          icon="play"
          color="#0066CC"
        />
        <StatCard
          label="Hoàn thành"
          value={stats.finished.toString()}
          icon="checkmark-circle"
          color="#0066CC"
        />
      </View>

      {/* Total Value */}
      <View style={styles.totalValueCard}>
        <Text style={styles.totalValueLabel}>Tổng giá trị</Text>
        <Text style={styles.totalValueAmount}>{formatVND(stats.totalValue)}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dự án..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === item.value && styles.filterChipActive,
              item.value === null && selectedStatus === null && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                (selectedStatus === item.value || (item.value === null && selectedStatus === null))
                  && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        keyExtractor={item => item.id}
        renderItem={renderProject}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery || selectedStatus
                ? 'Không tìm thấy dự án phù hợp'
                : 'Chưa có dự án nào'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ==================== STAT CARD ====================

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ==================== PROJECT CARD ====================

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const statusColor = getStatusColor(project.status);
  const progress = parseInt(project.progress || '0');

  return (
    <TouchableOpacity style={styles.projectCard} activeOpacity={0.7}>
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleRow}>
          <Text style={styles.projectName} numberOfLines={2}>
            {project.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {getProjectStatusName(project.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.projectCustomer}>
          <Ionicons name="person-outline" size={12} color="#6B7280" /> Khách hàng #{project.clientid || 'N/A'}
        </Text>
      </View>

      <View style={styles.projectBody}>
        <View style={styles.projectInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>{formatDate(project.start_date)}</Text>
          </View>
          {project.deadline && (
            <View style={styles.infoItem}>
              <Ionicons name="flag-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{formatDate(project.deadline)}</Text>
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: getProgressColor(progress),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.projectFooter}>
          <Text style={styles.projectValue}>
            {formatVND(parseFloat(project.project_cost || '0'))}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ==================== HELPERS ====================

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    '1': '#6B7280', // Not Started
    '2': '#3B82F6', // In Progress
    '3': '#0066CC', // On Hold
    '4': '#0066CC', // Finished
    '5': '#000000', // Cancelled
  };
  return colors[status] || '#6B7280';
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return '#0066CC';
  if (progress >= 50) return '#3B82F6';
  if (progress >= 25) return '#0066CC';
  return '#000000';
}

// ==================== EXPORTED SCREEN ====================

export default function ProjectsScreen() {
  return <ProjectsContent />;
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  totalValueCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  totalValueLabel: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.8,
  },
  totalValueAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  projectHeader: {
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  projectCustomer: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  projectBody: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  projectInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
