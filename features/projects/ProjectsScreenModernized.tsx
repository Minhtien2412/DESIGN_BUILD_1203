/**
 * Projects Screen - Modernized with Nordic Green Theme
 * Shopee/Grab style card layout
 * Updated: 13/12/2025
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import { Project, useProjects } from '@/hooks/useProjects';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FilterType = 'all' | 'active' | 'completed' | 'planning' | 'paused';

export default function ProjectsScreenModernized() {
  const { projects, loading, refresh } = useProjects();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const statusCounts = {
    all: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    planning: projects.filter((p) => p.status === 'planning').length,
    paused: projects.filter((p) => p.status === 'paused').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return MODERN_COLORS.primary;
      case 'completed':
        return MODERN_COLORS.success;
      case 'planning':
        return MODERN_COLORS.warning;
      case 'paused':
        return MODERN_COLORS.danger;
      default:
        return MODERN_COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang làm';
      case 'completed':
        return 'Hoàn thành';
      case 'planning':
        return 'Lên kế hoạch';
      case 'paused':
        return 'Tạm dừng';
      default:
        return 'Khác';
    }
  };

  const renderFilterChip = (type: FilterType, label: string) => {
    const isActive = filter === type;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isActive && styles.filterChipActive,
        ]}
        onPress={() => setFilter(type)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {label}
        </Text>
        <View style={[styles.chipBadge, isActive && styles.chipBadgeActive]}>
          <Text style={[styles.chipBadgeText, isActive && styles.chipBadgeTextActive]}>
            {statusCounts[type]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProjectCard = ({ item }: { item: Project }) => {
    const statusColor = getStatusColor(item.status);
    const progress = item.progress || 0;

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => router.push(`/project/${item.id}` as any)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={MODERN_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.projectTitle} numberOfLines={2}>{item.name}</Text>
        
        {/* Description */}
        {item.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {item.startDate && (
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color={MODERN_COLORS.textSecondary} />
              <Text style={styles.statText}>
                {new Date(item.startDate).toLocaleDateString('vi-VN', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </Text>
            </View>
          )}
          {item.budget && (
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={16} color={MODERN_COLORS.textSecondary} />
              <Text style={styles.statText}>
                {(item.budget / 1000000).toFixed(0)}M
              </Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Ionicons name="person-outline" size={16} color={MODERN_COLORS.textSecondary} />
            <Text style={styles.statText} numberOfLines={1}>
              Quản lý
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={64} color={MODERN_COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Chưa có dự án</Text>
      <Text style={styles.emptySubtitle}>
        Tạo dự án mới để bắt đầu quản lý công việc
      </Text>
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="add-circle" size={20} color={MODERN_COLORS.surface} />
        <Text style={styles.createButtonText}>Tạo dự án mới</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dự án...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dự án</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add-circle-outline" size={28} color={MODERN_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={[
              { type: 'all' as FilterType, label: 'Tất cả' },
              { type: 'active' as FilterType, label: 'Đang làm' },
              { type: 'planning' as FilterType, label: 'Lên kế hoạch' },
              { type: 'completed' as FilterType, label: 'Hoàn thành' },
              { type: 'paused' as FilterType, label: 'Tạm dừng' },
            ]}
            keyExtractor={(item) => item.type}
            renderItem={({ item }) => renderFilterChip(item.type, item.label)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          />
        </View>

        {/* Projects List */}
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProjectCard}
          contentContainerStyle={[
            styles.listContent,
            filteredProjects.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[MODERN_COLORS.primary]}
              tintColor={MODERN_COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: 44,
    paddingBottom: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  headerButton: {
    padding: MODERN_SPACING.xs,
  },
  filtersContainer: {
    backgroundColor: MODERN_COLORS.surface,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  filtersContent: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
    gap: MODERN_SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  filterChipText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  filterChipTextActive: {
    color: MODERN_COLORS.surface,
  },
  chipBadge: {
    backgroundColor: MODERN_COLORS.divider,
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.full,
    minWidth: 20,
    alignItems: 'center',
  },
  chipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  chipBadgeText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  chipBadgeTextActive: {
    color: MODERN_COLORS.surface,
  },
  listContent: {
    padding: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  projectCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: MODERN_SPACING.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: MODERN_RADIUS.full,
  },
  statusText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.textSecondary,
  },
  menuButton: {
    padding: MODERN_SPACING.xs,
  },
  projectTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.tight,
  },
  projectDescription: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.md,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  progressSection: {
    marginBottom: MODERN_SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.xs,
  },
  progressLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  progressValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: MODERN_COLORS.divider,
    borderRadius: MODERN_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: MODERN_RADIUS.full,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MODERN_SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xxs,
  },
  statText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
  },
  loadingText: {
    marginTop: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.xl,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
    marginTop: MODERN_SPACING.lg,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: MODERN_RADIUS.md,
  },
  createButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.surface,
  },
});
