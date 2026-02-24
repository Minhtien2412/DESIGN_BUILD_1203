/**
 * Project Timeline Screen
 * 🔥 UPDATED: Now uses real data from Perfex CRM Tasks
 */

import Badge from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/list-item';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PerfexTask, PerfexTasksService } from '@/services/perfexCRM';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type TimelinePhase = {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
  startDate: string;
  endDate: string;
  progress: number;
  tasks: string[];
  icon: string;
  color: string;
};

// Phase configs for grouping tasks
const PHASE_CONFIG: Record<string, { icon: string; order: number }> = {
  'khởi công': { icon: 'flag', order: 1 },
  'móng': { icon: 'foundation', order: 2 },
  'tường': { icon: 'wall', order: 3 },
  'mái': { icon: 'home-roof', order: 4 },
  'điện': { icon: 'flash', order: 5 },
  'nước': { icon: 'water', order: 6 },
  'hoàn thiện': { icon: 'hammer-wrench', order: 7 },
};

// Map Perfex task status to timeline status
function mapTaskStatus(status: number): 'completed' | 'active' | 'pending' {
  switch (status) {
    case 5: return 'completed'; // Complete
    case 4: return 'active';    // In Progress
    case 2: return 'active';    // Testing
    default: return 'pending';
  }
}

// Format date from CRM
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Convert Perfex tasks to timeline phases
function convertTasksToTimeline(tasks: PerfexTask[]): TimelinePhase[] {
  if (!tasks.length) return [];
  
  // Group tasks by milestone or just show individual tasks as phases
  const phases: TimelinePhase[] = tasks.map((task, index) => {
    // Determine icon based on task name
    let icon = 'checkbox-outline';
    const lowerName = task.name.toLowerCase();
    for (const [keyword, config] of Object.entries(PHASE_CONFIG)) {
      if (lowerName.includes(keyword)) {
        icon = config.icon;
        break;
      }
    }
    
    const status = mapTaskStatus(task.status);
    const progress = status === 'completed' ? 100 : status === 'active' ? 50 : 0;
    
    return {
      id: task.id,
      name: task.name,
      status,
      startDate: formatDate(task.startdate || ''),
      endDate: formatDate(task.duedate || ''),
      progress,
      tasks: task.description ? task.description.split('\n').filter(Boolean) : ['Công việc đang thực hiện'],
      icon,
      color: status === 'completed' ? '#0D9488' : status === 'active' ? '#0D9488' : '#6B7280',
    };
  });
  
  return phases;
}

const TimelineItem = ({ phase, isLast }: { phase: TimelinePhase; isLast: boolean }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const inverseText = useThemeColor({}, 'textInverse');
  const getStatusIcon = () => {
    switch (phase.status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'ellipse';
      case 'pending':
        return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.timelineItem}>
      {/* Timeline Line */}
      <View style={styles.timelineIndicator}>
        <Ionicons
          name={getStatusIcon()}
          size={24}
          color={phase.color}
        />
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: phase.color }]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.timelineContent, { backgroundColor: surfaceColor }]}>
        <View style={styles.phaseHeader}>
          <View style={[styles.phaseIcon, { backgroundColor: surfaceMuted }]}>
            <MaterialCommunityIcons
              name={phase.icon as any}
              size={24}
              color={phase.color}
            />
          </View>
          
          <View style={styles.phaseInfo}>
            <Text style={[styles.phaseName, { color: textColor }]}>{phase.name}</Text>
            <Text style={[styles.phaseDate, { color: mutedColor }]}>
              {phase.startDate} - {phase.endDate}
            </Text>
          </View>

          <Badge
            variant="primary"
            style={{ backgroundColor: phase.color }}
          >
            <Text style={{ color: inverseText, fontSize: 12 }}>
              {phase.status === 'completed' ? 'Hoàn thành' :
               phase.status === 'active' ? 'Đang làm' :
               'Chưa bắt đầu'}
            </Text>
          </Badge>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: mutedColor + '33' }]}>
            <View style={[styles.progressFill, { width: `${phase.progress}%`, backgroundColor: phase.color }]} />
          </View>
          <Text style={[styles.progressText, { color: textColor }]}>{phase.progress}%</Text>
        </View>

        {/* Tasks */}
        <View style={styles.tasksContainer}>
          {phase.tasks.map((task, index) => (
            <View key={index} style={styles.task}>
              <Ionicons
                name={phase.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={phase.status === 'completed' ? phase.color : mutedColor}
              />
              <Text style={[
                styles.taskText,
                { color: textColor },
                phase.status === 'completed' && { color: mutedColor, textDecorationLine: 'line-through' }
              ]}>
                {task}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function ProjectTimelineScreen() {
  const params = useLocalSearchParams();
  const projectId = params.id as string;
  
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const infoColor = useThemeColor({}, 'info');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeline, setTimeline] = useState<TimelinePhase[]>([]);
  const [dataSource, setDataSource] = useState<'crm' | 'empty'>('empty');
  
  // Load tasks from CRM
  const loadTimeline = useCallback(async () => {
    if (!projectId) {
      console.warn('⚠️ No projectId provided');
      return;
    }
    
    try {
      const response = await PerfexTasksService.getAll({ rel_type: 'project', rel_id: projectId }) as any;
      
      if (response.success && response.data) {
        const phases = convertTasksToTimeline(response.data);
        setTimeline(phases);
        setDataSource(phases.length ? 'crm' : 'empty');
        console.log(`✅ Loaded ${phases.length} phases from CRM tasks`);
      } else {
        throw new Error('CRM không phản hồi');
      }
    } catch (error) {
      console.warn('CRM unavailable, showing empty timeline:', error);
      setTimeline([]);
      setDataSource('empty');
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTimeline();
    setRefreshing(false);
  };
  
  const completedPhases = timeline.filter(p => p.status === 'completed').length;
  const totalPhases = timeline.length;
  const overallProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={infoColor} />
        <Text style={[styles.loadingText, { color: mutedColor }]}>Đang tải tiến độ...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tiến độ dự án',
          headerBackTitle: 'Quay lại',
        }}
      />

      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Data Source Indicator */}
        {dataSource === 'empty' && (
          <View style={styles.mockIndicator}>
            <Text style={styles.mockIndicatorText}>No timeline data yet.</Text>
          </View>
        )}
        
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: surfaceColor }] }>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Tổng quan tiến độ</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: infoColor }]}>{completedPhases}/{totalPhases}</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Giai đoạn hoàn thành</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
            
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: infoColor }]}>{overallProgress}%</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Tiến độ tổng thể</Text>
            </View>
          </View>

          <View style={styles.overallProgress}>
            <View style={[styles.progressBar, { backgroundColor: mutedColor + '33' }]}>
              <View style={[styles.progressFill, { width: `${overallProgress}%`, backgroundColor: infoColor }]} />
            </View>
          </View>
        </View>

        {/* Timeline */}
        <SectionHeader title="Các giai đoạn" />
        
        <View style={styles.timeline}>
          {timeline.map((phase, index) => (
            <TimelineItem
              key={phase.id}
              phase={phase}
              isLast={index === timeline.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  mockIndicator: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  mockIndicatorText: {
    color: '#92400E',
    fontSize: 12,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D9488',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  overallProgress: {
    marginTop: 8,
  },
  timeline: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  phaseDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 45,
    textAlign: 'right',
  },
  tasksContainer: {
    gap: 8,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  taskCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
});
