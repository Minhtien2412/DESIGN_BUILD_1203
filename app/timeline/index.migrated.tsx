/**
 * Project Timeline Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { MilestoneCard } from '@/components/timeline/MilestoneCard';
import { ProgressDashboard } from '@/components/timeline/ProgressDashboard';
import { Loader } from '@/components/ui/loader';
import { UniversalList } from '@/components/universal/UniversalList';
import { useTimelineWebSocket } from '@/hooks/useTimelineWebSocket';
import {
    Phase,
    ProjectTimeline,
    getProjectTimeline,
} from '@/services/timeline-api';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TimelineScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'delayed' | 'completed'>('all');
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentProjectId = projectId || '';

  // Fetch timeline
  const fetchTimeline = useCallback(async () => {
    if (!currentProjectId) return;

    try {
      setLoading(true);
      const data = await getProjectTimeline(Number(currentProjectId));
      setTimeline(data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải timeline');
    } finally {
      setLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  }, [fetchTimeline]);

  // WebSocket handlers
  const handlePhaseCreated = useCallback((phase: Phase) => {
    setTimeline((prev: ProjectTimeline | null) => {
      if (!prev) return prev;
      return { ...prev, phases: [...prev.phases, phase] };
    });
  }, []);

  const handlePhaseUpdated = useCallback((phase: Phase) => {
    setTimeline((prev: ProjectTimeline | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.map((p) => (p.id === phase.id ? phase : p)),
      };
    });
  }, []);

  const handlePhaseDeleted = useCallback((phaseId: number) => {
    setTimeline((prev: ProjectTimeline | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.filter((p) => p.id !== phaseId),
      };
    });
  }, []);

  const handlePhaseProgressUpdated = useCallback(
    (data: { phaseId: number; progress: number }) => {
      setTimeline((prev: ProjectTimeline | null) => {
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

  const handlePhaseReordered = useCallback(
    (data: { phases: Array<{ id: number; order: number }> }) => {
      setTimeline((prev: ProjectTimeline | null) => {
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
    onTaskCreated: () => handleRefresh(),
    onTaskUpdated: () => handleRefresh(),
    onTaskDeleted: () => handleRefresh(),
  });

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

  const handleCreatePhase = () => {
    router.push(`/timeline/create-phase?projectId=${currentProjectId}` as any);
  };

  if (loading) {
    return <Loader />;
  }

  if (!timeline) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Không thể tải timeline</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTimeline}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeCount = timeline.phases.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedCount = timeline.phases.filter((p) => p.status === 'COMPLETED').length;
  const delayedCount = timeline.delayedPhases.length;

  return (
    <>
      <Stack.Screen options={{ title: 'Timeline Dự Án', headerShown: false }} />

      <ModuleLayout
        title="Timeline Dự Án"
        subtitle={`${timeline.phases.length} giai đoạn • ${activeCount} đang làm • ${completedCount} hoàn thành`}
        showBackButton
        scrollable={false}
        padding={false}
        headerRight={
          <TouchableOpacity onPress={handleCreatePhase}>
            <Ionicons name="add-circle" size={28} color="#3B82F6" />
          </TouchableOpacity>
        }
      >
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Tất cả ({timeline.phases.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Text
              style={[styles.filterTabText, filter === 'active' && styles.filterTabTextActive]}
            >
              Đang làm ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'delayed' && styles.filterTabActive]}
            onPress={() => setFilter('delayed')}
          >
            <Text
              style={[styles.filterTabText, filter === 'delayed' && styles.filterTabTextActive]}
            >
              Trễ hạn ({delayedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
            onPress={() => setFilter('completed')}
          >
            <Text
              style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}
            >
              Hoàn thành ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Universal List with ProgressDashboard header */}
        <UniversalList<Phase>
          config={{
            data: filteredPhases,
            keyExtractor: (item) => item.id.toString(),
            renderItem: (item) => (
              <MilestoneCard
                phase={item}
                onPress={() => router.push(`/timeline/phase/${item.id}` as any)}
              />
            ),
            onRefresh: handleRefresh,
            refreshing: refreshing,
            emptyIcon: 'calendar-outline',
            emptyMessage: 'Chưa có giai đoạn nào',
            emptyAction: {
              label: 'Tạo giai đoạn đầu tiên',
              onPress: handleCreatePhase,
            },
            ListHeaderComponent: (
              <ProgressDashboard phases={timeline.phases} projectName="Dự án" />
            ),
          }}
        />
      </ModuleLayout>
    </>
  );
}

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
