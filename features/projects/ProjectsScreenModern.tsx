/**
 * Modern Projects Screen - Shopee + LinkedIn Hybrid Design
 * 
 * Features:
 * - Gradient header with search bar
 * - Filter tabs (All/Active/Planning/Completed)
 * - Modern project cards with progress bars
 * - FAB for add new project
 * - Pull to refresh
 */

import { MODERN_COLORS, MODERN_SHADOWS, MODERN_SPACING } from '@/constants/modern-theme';
import { Project, ProjectStatus, useProjects } from '@/hooks/useProjects';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// FILTER TAB COMPONENT
// ============================================================================
const FilterTab = ({ label, active, count, onPress }: {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.filterTab,
      active && styles.filterTabActive,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
      {label}
    </Text>
    {typeof count === 'number' && (
      <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
        <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// ============================================================================
// PROJECT CARD COMPONENT
// ============================================================================
const ProjectCard = ({ project, onPress }: {
  project: Project;
  onPress: () => void;
}) => {
  const getStatusColor = () => {
    switch (project.status) {
      case 'active': return MODERN_COLORS.secondary;
      case 'completed': return MODERN_COLORS.success;
      case 'planning': return MODERN_COLORS.warning;
      case 'paused': return MODERN_COLORS.danger;
      default: return MODERN_COLORS.gray500;
    }
  };

  const getStatusLabel = () => {
    switch (project.status) {
      case 'active': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'planning': return 'Lên kế hoạch';
      case 'paused': return 'Tạm dừng';
      default: return 'Khác';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'Chưa xác định';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Mock progress (normally would come from project data)
  const progress = project.status === 'completed' ? 100 
    : project.status === 'active' ? 65 
    : project.status === 'planning' ? 25 
    : 50;

  const progressColor = progress >= 80 ? MODERN_COLORS.success 
    : progress >= 50 ? MODERN_COLORS.secondary 
    : MODERN_COLORS.warning;

  return (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectName} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.projectLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={MODERN_COLORS.gray600} />
            {' '}{project.location || 'Chưa xác định'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Tiến độ</Text>
          <Text style={[styles.progressPercent, { color: progressColor }]}>
            {progress}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progress}%`, backgroundColor: progressColor }
            ]} 
          />
        </View>
      </View>

      {/* Metadata */}
      <View style={styles.cardFooter}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={MODERN_COLORS.gray600} />
          <Text style={styles.metaText}>
            {formatDate(project.start_date ?? undefined)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="wallet-outline" size={14} color={MODERN_COLORS.gray600} />
          <Text style={styles.metaText}>
            {formatCurrency(project.budget ?? undefined)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push('/projects/project-management' as any);
          }}
        >
          <Ionicons name="analytics-outline" size={16} color={MODERN_COLORS.primary} />
          <Text style={styles.actionButtonText}>Quản lý tiến độ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/projects/${project.id}` as any);
          }}
        >
          <Ionicons name="document-text-outline" size={16} color={MODERN_COLORS.secondary} />
          <Text style={[styles.actionButtonText, { color: MODERN_COLORS.secondary }]}>Chi tiết</Text>
        </TouchableOpacity>
      </View>

      {/* Chevron */}
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={16} color={MODERN_COLORS.gray400} />
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ProjectsScreenModern() {
  const { projects, loading, refresh } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Filter & search
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter(p => p.status === activeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.client?.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [projects, activeFilter, searchQuery]);

  // Count by status
  const statusCounts = useMemo(() => ({
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    planning: projects.filter(p => p.status === 'planning').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }), [projects]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={MODERN_COLORS.primary} />

      {/* Header with Gradient */}
      <LinearGradient
        colors={MODERN_COLORS.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dự án</Text>
        
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={MODERN_COLORS.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dự án..."
            placeholderTextColor={MODERN_COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={MODERN_COLORS.gray400} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          <FilterTab 
            label="Tất cả" 
            active={activeFilter === 'all'} 
            count={statusCounts.all}
            onPress={() => setActiveFilter('all')} 
          />
          <FilterTab 
            label="Đang thực hiện" 
            active={activeFilter === 'active'} 
            count={statusCounts.active}
            onPress={() => setActiveFilter('active')} 
          />
          <FilterTab 
            label="Lên kế hoạch" 
            active={activeFilter === 'planning'} 
            count={statusCounts.planning}
            onPress={() => setActiveFilter('planning')} 
          />
          <FilterTab 
            label="Hoàn thành" 
            active={activeFilter === 'completed'} 
            count={statusCounts.completed}
            onPress={() => setActiveFilter('completed')} 
          />
        </ScrollView>
      </LinearGradient>

      {/* Projects List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[MODERN_COLORS.primary]}
            tintColor={MODERN_COLORS.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Đang tải...</Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={MODERN_COLORS.gray300} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Không tìm thấy dự án' : 'Chưa có dự án nào'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : 'Nhấn nút + để tạo dự án mới'}
            </Text>
          </View>
        ) : (
          filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => router.push(`/projects/${project.id}` as any)}
            />
          ))
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/projects/create' as any)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={MODERN_COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.secondaryBg,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: MODERN_SPACING.lg,
    paddingHorizontal: MODERN_SPACING.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: MODERN_SPACING.md,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
    gap: MODERN_SPACING.xs,
    ...MODERN_SHADOWS.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: MODERN_COLORS.text,
  },

  // Filter Tabs
  filterContainer: {
    marginHorizontal: -MODERN_SPACING.md,
  },
  filterContentContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.xs,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#fff',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  filterTabTextActive: {
    color: MODERN_COLORS.primary,
  },
  filterBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: MODERN_COLORS.primary + '15',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  filterBadgeTextActive: {
    color: MODERN_COLORS.primary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
  },

  // Project Card
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: MODERN_COLORS.text,
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 12,
    color: MODERN_COLORS.gray600,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Progress
  progressContainer: {
    marginBottom: MODERN_SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: MODERN_COLORS.gray600,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: MODERN_COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    gap: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: MODERN_COLORS.gray600,
  },

  // Quick Actions
  cardActions: {
    flexDirection: 'row',
    gap: MODERN_SPACING.xs,
    marginTop: MODERN_SPACING.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: MODERN_COLORS.orange50,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary + '30',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: MODERN_COLORS.primary,
  },

  // Chevron
  chevronContainer: {
    position: 'absolute',
    right: MODERN_SPACING.md,
    top: MODERN_SPACING.md,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.xs,
  },
  emptyText: {
    fontSize: 14,
    color: MODERN_COLORS.gray600,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: MODERN_SPACING.lg,
    bottom: MODERN_SPACING.lg + 60, // Above tab bar
    ...MODERN_SHADOWS.xl,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
