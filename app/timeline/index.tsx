/**
 * Timeline Screen - Project Progress & Milestones
 * Modern implementation with Timeline API integration + Real-time WebSocket updates
 */

import { MilestoneCard } from '@/components/timeline/MilestoneCard';
import { ProgressDashboard } from '@/components/timeline/ProgressDashboard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTimelineWebSocket } from '@/hooks/useTimelineWebSocket';
import {
    Phase,
    ProjectTimeline,
    getProjectTimeline,
} from '@/services/timeline-api';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TimelineScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'delayed' | 'completed'>('all');

  // Use default project ID if not provided
  const currentProjectId = projectId || '1';

  // Fetch timeline data
  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const data = await getProjectTimeline(Number(currentProjectId));
      setTimeline(data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      Alert.alert('Lỗi', 'Không thể tải timeline. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh timeline
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTimeline();
  }, [currentProjectId]);

  // ============================================================================
  // Real-time WebSocket Updates
  // ============================================================================

  // Handle phase created
  const handlePhaseCreated = useCallback((phase: Phase) => {
    setTimeline((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: [...prev.phases, phase],
      };
    });
  }, []);

  // Handle phase updated
  const handlePhaseUpdated = useCallback((updatedPhase: Phase) => {
    setTimeline((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.map((p) => 
          p.id === updatedPhase.id ? updatedPhase : p
        ),
      };
    });
  }, []);

  // Handle phase deleted
  const handlePhaseDeleted = useCallback((phaseId: number) => {
    setTimeline((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.filter((p) => p.id !== phaseId),
      };
    });
  }, []);

  // Handle phase progress updated
  const handlePhaseProgressUpdated = useCallback(
    (data: { phaseId: number; progress: number }) => {
      setTimeline((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phases: prev.phases.map((p) =>
            p.id === data.phaseId ? { ...p, progress: data.progress } : p
          ),
        };
      });
    },
    []
  );

  // Handle phases reordered
  const handlePhaseReordered = useCallback(
    (data: { phases: { id: number; order: number }[] }) => {
      setTimeline((prev) => {
        if (!prev) return prev;
        const orderMap = new Map(data.phases.map((p) => [p.id, p.order]));
        return {
          ...prev,
          phases: prev.phases
            .map((p) => ({
              ...p,
              order: orderMap.get(p.id) ?? p.order,
            }))
            .sort((a, b) => a.order - b.order),
        };
      });
    },
    []
  );

  // Connect to WebSocket timeline updates
  const { connected: wsConnected } = useTimelineWebSocket(currentProjectId, {
    onPhaseCreated: handlePhaseCreated,
    onPhaseUpdated: handlePhaseUpdated,
    onPhaseDeleted: handlePhaseDeleted,
    onPhaseProgressUpdated: handlePhaseProgressUpdated,
    onPhaseReordered: handlePhaseReordered,
    // Task events would trigger a refresh
    onTaskCreated: () => handleRefresh(),
    onTaskUpdated: () => handleRefresh(),
    onTaskDeleted: () => handleRefresh(),
  });

  // ============================================================================
  // Filter Phases
  // ============================================================================

  // Filter phases
  const getFilteredPhases = (): Phase[] => {
    if (!timeline) return [];

    switch (filter) {
      case 'active':
        return timeline.phases.filter((p) => p.status === 'IN_PROGRESS');
      case 'delayed':
        return timeline.delayedPhases;
      case 'completed':
        return timeline.phases.filter((p) => p.status === 'COMPLETED');
      default:
        return timeline.phases;
    }
  };

  const filteredPhases = getFilteredPhases();

  // Create new phase
  const handleCreatePhase = () => {
    router.push(`/timeline/create-phase?projectId=${currentProjectId}`);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: textColor }]}>Đang tải timeline...</Text>
      </View>
    );
  }

  if (!timeline) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#000000" />
        <Text style={[styles.errorText, { color: textColor }]}>
          Không thể tải timeline
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTimeline}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Timeline Dự Án</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePhase}>
          <Ionicons name="add-circle" size={24} color="#3B82F6" />
          <Text style={styles.createButtonText}>Tạo giai đoạn</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            Tất cả ({timeline.phases.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'active' && styles.filterTabTextActive,
            ]}
          >
            Đang làm ({timeline.phases.filter((p) => p.status === 'IN_PROGRESS').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'delayed' && styles.filterTabActive]}
          onPress={() => setFilter('delayed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'delayed' && styles.filterTabTextActive,
            ]}
          >
            Trễ hạn ({timeline.delayedPhases.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'completed' && styles.filterTabTextActive,
            ]}
          >
            Hoàn thành ({timeline.phases.filter((p) => p.status === 'COMPLETED').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Content */}
      <FlatList
        data={filteredPhases}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <ProgressDashboard phases={timeline.phases} projectName="Dự án" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
            <Text style={[styles.emptyText, { color: textColor }]}>
              Chưa có giai đoạn nào
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreatePhase}>
              <Ionicons name="add-circle" size={20} color="#3B82F6" />
              <Text style={styles.createButtonText}>Tạo giai đoạn đầu tiên</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <MilestoneCard
            phase={item}
            onPress={() => router.push(`/timeline/phase/${item.id}` as Href)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
});
