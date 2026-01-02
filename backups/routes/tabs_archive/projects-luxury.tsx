/**
 * Projects Screen - Luxury Redesign
 * European luxury design with gradient header and premium cards
 */

import { LuxuryCard } from '@/components/ui/luxury-card';
import { SafeScrollView } from '@/components/ui/safe-area';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { ProjectStatus, useProjects } from '@/hooks/useProjects';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

function FilterChip({ label, active, onPress, count }: FilterChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.filterChip,
          active && styles.filterChipActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
            <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>
              {count}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ProjectsScreenLuxury() {
  const { projects, loading, refreshProjects } = useProjects();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ProjectStatus | 'all'>('all');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.timing.elegant,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  };

  const filteredProjects = selectedFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === selectedFilter);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    planning: projects.filter(p => p.status === 'planning').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.light.info;
      case 'completed': return Colors.light.success;
      case 'planning': return Colors.light.warning;
      case 'paused': return Colors.light.error;
      default: return Colors.light.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang làm';
      case 'completed': return 'Hoàn thành';
      case 'planning': return 'Kế hoạch';
      case 'paused': return 'Tạm dừng';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary, Colors.light.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Dự án</Text>
              <Text style={styles.headerSubtitle}>{stats.total} dự án đang quản lý</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/construction/create-project' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Đang làm</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.planning}</Text>
              <Text style={styles.statLabel}>Kế hoạch</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Filter Chips */}
      <Animated.View style={[styles.filtersContainer, { opacity: fadeAnim }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <FilterChip
            label="Tất cả"
            active={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            count={stats.total}
          />
          <FilterChip
            label="Đang làm"
            active={selectedFilter === 'active'}
            onPress={() => setSelectedFilter('active')}
            count={stats.active}
          />
          <FilterChip
            label="Kế hoạch"
            active={selectedFilter === 'planning'}
            onPress={() => setSelectedFilter('planning')}
            count={stats.planning}
          />
          <FilterChip
            label="Hoàn thành"
            active={selectedFilter === 'completed'}
            onPress={() => setSelectedFilter('completed')}
            count={stats.completed}
          />
        </ScrollView>
      </Animated.View>

      {/* Projects List */}
      <SafeScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.accent}
            colors={[Colors.light.accent]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {filteredProjects.map((project, index) => (
            <LuxuryCard
              key={project.id}
              style={styles.projectCard}
              onPress={() => router.push(`/construction/project-detail?id=${project.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.projectIcon, { backgroundColor: Colors.light.accent + '15' }]}>
                    <Ionicons name="business" size={24} color={Colors.light.accent} />
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <Text style={styles.projectLocation} numberOfLines={1}>
                      <Ionicons name="location" size={12} color={Colors.light.textMuted} />
                      {' '}{project.location || 'Chưa xác định'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                    {getStatusLabel(project.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardStats}>
                <View style={styles.cardStat}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.light.textMuted} />
                  <Text style={styles.cardStatText}>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </Text>
                </View>
                {project.budget && (
                  <View style={styles.cardStat}>
                    <Ionicons name="cash-outline" size={16} color={Colors.light.accent} />
                    <Text style={styles.cardStatText}>
                      {new Intl.NumberFormat('vi-VN', { 
                        notation: 'compact', 
                        compactDisplay: 'short' 
                      }).format(project.budget)} VNĐ
                    </Text>
                  </View>
                )}
              </View>
            </LuxuryCard>
          ))}

          {filteredProjects.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="folder-open-outline" size={64} color={Colors.light.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có dự án</Text>
              <Text style={styles.emptyText}>
                {selectedFilter === 'all' 
                  ? 'Bắt đầu bằng cách tạo dự án mới'
                  : `Không có dự án ${getStatusLabel(selectedFilter)}`}
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </SafeScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.surface,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.goldLight,
    letterSpacing: 0.3,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.surface,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.goldLight,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filtersContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
  filterChipTextActive: {
    color: Colors.light.surface,
  },
  chipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipBadgeActive: {
    backgroundColor: Colors.light.surface,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.accent,
  },
  chipBadgeTextActive: {
    color: Colors.light.accent,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  projectCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginBottom: 16,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardStatText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
