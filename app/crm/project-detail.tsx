/**
 * Project Detail Screen - Perfex CRM Style
 * ==========================================
 * 
 * Màn hình chi tiết dự án với đầy đủ tabs như Perfex CRM:
 * - Tổng quan dự án
 * - Phân công
 * - Biểu đồ thời gian
 * - Cột mốc
 * - Các tập tin
 * - Trao đổi
 * - Gantt Chart
 * - Ghi chú
 * - Hoạt động
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useMilestones, useProjects, useTasks } from '@/hooks/usePerfex';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Tab configuration matching Perfex CRM
const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: 'grid-outline' },
  { id: 'tasks', label: 'Phân công', icon: 'checkbox-outline' },
  { id: 'timeline', label: 'Timeline', icon: 'time-outline' },
  { id: 'milestones', label: 'Cột mốc', icon: 'flag-outline' },
  { id: 'files', label: 'Tập tin', icon: 'folder-outline' },
  { id: 'discussions', label: 'Trao đổi', icon: 'chatbubbles-outline' },
  { id: 'gantt', label: 'Gantt', icon: 'bar-chart-outline' },
  { id: 'notes', label: 'Ghi chú', icon: 'document-text-outline' },
  { id: 'activity', label: 'Hoạt động', icon: 'pulse-outline' },
];

type TabId = typeof TABS[number]['id'];

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  const { loading: projectLoading, getProject } = useProjects();
  const { loading: tasksLoading, getTasks } = useTasks();
  const { loading: milestonesLoading, getMilestones } = useMilestones();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;
    
    const [projectData, tasksData, milestonesData] = await Promise.all([
      getProject(projectId),
      getTasks(projectId),
      getMilestones(projectId),
    ]);
    
    setProject(projectData);
    setTasks(tasksData);
    setMilestones(milestonesData.filter((m: any) => m.id).map((m: any) => ({ ...m, id: m.id! })));
  };

  const navigateToScreen = (screen: string) => {
    router.push(`/crm/${screen}?projectId=${projectId}` as any);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      '1': '#f59e0b', // Chưa bắt đầu
      '2': '#3b82f6', // Đang thực hiện
      '3': '#8b5cf6', // Tạm dừng
      '4': '#22c55e', // Hoàn thành
      '5': '#ef4444', // Đã hủy
      'not_started': '#f59e0b',
      'in_progress': '#3b82f6',
      'on_hold': '#8b5cf6',
      'finished': '#22c55e',
      'cancelled': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      '1': 'Chưa bắt đầu',
      '2': 'Đang thực hiện',
      '3': 'Tạm dừng',
      '4': 'Hoàn thành',
      '5': 'Đã hủy',
      'not_started': 'Chưa bắt đầu',
      'in_progress': 'Đang thực hiện',
      'on_hold': 'Tạm dừng',
      'finished': 'Hoàn thành',
      'cancelled': 'Đã hủy',
    };
    return labels[status] || status;
  };

  // Render Tab Bar
  const renderTabBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.tabBar, { backgroundColor: cardBg, borderBottomColor: borderColor }]}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && { borderBottomColor: primaryColor, borderBottomWidth: 2 },
          ]}
          onPress={() => {
            if (['gantt', 'files', 'discussions', 'notes', 'activity'].includes(tab.id)) {
              navigateToScreen(tab.id === 'gantt' ? 'gantt-chart' : tab.id);
            } else {
              setActiveTab(tab.id as TabId);
            }
          }}
        >
          <Ionicons
            name={tab.icon as any}
            size={18}
            color={activeTab === tab.id ? primaryColor : textColor}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? primaryColor : textColor },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Overview Tab Content
  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {/* Project Info Card */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Thông tin dự án</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project?.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(project?.status)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textColor }]}>Tên dự án:</Text>
          <Text style={[styles.infoValue, { color: textColor }]}>{project?.name}</Text>
        </View>
        
        {project?.description && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textColor }]}>Mô tả:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{project?.description}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textColor }]}>Ngày bắt đầu:</Text>
          <Text style={[styles.infoValue, { color: textColor }]}>
            {project?.start_date ? new Date(project.start_date).toLocaleDateString('vi-VN') : '-'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textColor }]}>Deadline:</Text>
          <Text style={[styles.infoValue, { color: textColor }]}>
            {project?.deadline ? new Date(project.deadline).toLocaleDateString('vi-VN') : '-'}
          </Text>
        </View>
      </View>

      {/* Progress Card */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Tiến độ dự án</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${project?.progress || 0}%`, backgroundColor: primaryColor },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: primaryColor }]}>
            {project?.progress || 0}%
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}
          onPress={() => setActiveTab('tasks')}
        >
          <Ionicons name="checkbox-outline" size={28} color="#3b82f6" />
          <Text style={[styles.statValue, { color: textColor }]}>{tasks.length}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Tasks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}
          onPress={() => setActiveTab('milestones')}
        >
          <Ionicons name="flag-outline" size={28} color="#f59e0b" />
          <Text style={[styles.statValue, { color: textColor }]}>{milestones.length}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Cột mốc</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}
          onPress={() => navigateToScreen('files')}
        >
          <Ionicons name="folder-outline" size={28} color="#8b5cf6" />
          <Text style={[styles.statValue, { color: textColor }]}>0</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Tập tin</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}
          onPress={() => navigateToScreen('discussions')}
        >
          <Ionicons name="chatbubbles-outline" size={28} color="#22c55e" />
          <Text style={[styles.statValue, { color: textColor }]}>0</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Trao đổi</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Truy cập nhanh</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#3b82f620' }]}
            onPress={() => navigateToScreen('gantt-chart')}
          >
            <Ionicons name="bar-chart-outline" size={24} color="#3b82f6" />
            <Text style={[styles.quickActionText, { color: '#3b82f6' }]}>Gantt Chart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#22c55e20' }]}
            onPress={() => navigateToScreen('time-tracking')}
          >
            <Ionicons name="time-outline" size={24} color="#22c55e" />
            <Text style={[styles.quickActionText, { color: '#22c55e' }]}>Chấm công</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#f59e0b20' }]}
            onPress={() => navigateToScreen('expenses')}
          >
            <Ionicons name="wallet-outline" size={24} color="#f59e0b" />
            <Text style={[styles.quickActionText, { color: '#f59e0b' }]}>Chi phí</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#8b5cf620' }]}
            onPress={() => navigateToScreen('activity')}
          >
            <Ionicons name="pulse-outline" size={24} color="#8b5cf6" />
            <Text style={[styles.quickActionText, { color: '#8b5cf6' }]}>Hoạt động</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // Tasks Tab Content
  const renderTasks = () => (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={[styles.taskCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.taskHeader}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
            <Text style={[styles.taskName, { color: textColor }]} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          {item.dueDate && (
            <Text style={[styles.taskDue, { color: textColor }]}>
              Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
            </Text>
          )}
          <View style={[styles.taskStatus, { backgroundColor: getTaskStatusColor(item.status) + '20' }]}>
            <Text style={[styles.taskStatusText, { color: getTaskStatusColor(item.status) }]}>
              {getTaskStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="checkbox-outline" size={48} color="#6b7280" />
          <Text style={[styles.emptyText, { color: textColor }]}>Chưa có task nào</Text>
        </View>
      }
    />
  );

  // Timeline Tab Content
  const renderTimeline = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.timeline}>
        {tasks.map((task, index) => (
          <View key={task.id} style={styles.timelineItem}>
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, { backgroundColor: primaryColor }]} />
              {index < tasks.length - 1 && (
                <View style={[styles.timelineConnector, { backgroundColor: borderColor }]} />
              )}
            </View>
            <View style={[styles.timelineContent, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.timelineTitle, { color: textColor }]}>{task.name}</Text>
              {task.startDate && (
                <Text style={[styles.timelineDate, { color: textColor }]}>
                  {new Date(task.startDate).toLocaleDateString('vi-VN')}
                  {task.dueDate && ` - ${new Date(task.dueDate).toLocaleDateString('vi-VN')}`}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      {tasks.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#6b7280" />
          <Text style={[styles.emptyText, { color: textColor }]}>Chưa có dữ liệu timeline</Text>
        </View>
      )}
    </ScrollView>
  );

  // Milestones Tab Content  
  const renderMilestones = () => (
    <FlatList
      data={milestones}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={[styles.milestoneCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.milestoneHeader}>
            <Ionicons
              name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={item.isCompleted ? '#22c55e' : primaryColor}
            />
            <View style={styles.milestoneInfo}>
              <Text style={[styles.milestoneName, { color: textColor }]}>{item.name}</Text>
              <Text style={[styles.milestoneDate, { color: textColor }]}>
                Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={48} color="#6b7280" />
          <Text style={[styles.emptyText, { color: textColor }]}>Chưa có cột mốc nào</Text>
        </View>
      }
    />
  );

  // Helper functions
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: '#22c55e',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444',
    };
    return colors[priority] || '#6b7280';
  };

  const getTaskStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      not_started: '#6b7280',
      in_progress: '#3b82f6',
      testing: '#8b5cf6',
      awaiting_feedback: '#f59e0b',
      complete: '#22c55e',
    };
    return colors[status] || '#6b7280';
  };

  const getTaskStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      not_started: 'Chưa bắt đầu',
      in_progress: 'Đang làm',
      testing: 'Đang test',
      awaiting_feedback: 'Chờ phản hồi',
      complete: 'Hoàn thành',
    };
    return labels[status] || status;
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tasks':
        return renderTasks();
      case 'timeline':
        return renderTimeline();
      case 'milestones':
        return renderMilestones();
      default:
        return renderOverview();
    }
  };

  if (projectLoading && !project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.projectName, { color: textColor }]} numberOfLines={1}>
            {project?.name || 'Chi tiết dự án'}
          </Text>
          <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(project?.status) }]}>
            <Text style={styles.statusTextSmall}>{getStatusLabel(project?.status)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  menuButton: {
    marginLeft: 12,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTextSmall: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  tabBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 4,
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (width - 60) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  taskCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  taskDue: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  taskStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  milestoneCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  milestoneDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    opacity: 0.7,
  },
});
