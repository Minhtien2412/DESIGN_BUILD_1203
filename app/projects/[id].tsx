import AddExpenseForm, { ExpenseFormData } from '@/components/forms/add-expense-form';
import AddTaskForm, { TaskFormData } from '@/components/forms/add-task-form';
import { ProjectDocument } from '@/components/projects/document-manager';
import TeamManagement, { TeamMember } from '@/components/projects/team-management';
import WorkflowMap, { WorkflowPhase } from '@/components/projects/workflow-map';
import CostTracker from '@/components/ui/cost-tracker';
import TaskManagement from '@/components/ui/task-management';
import { Colors } from '@/constants/theme';
import { useProjectBudget, useProjectData, useProjectTasks } from '@/context/project-data-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProjectDetail } from '@/hooks/useProjects';
import {
    MOCK_DOCUMENTS,
    MOCK_TEAM,
    MOCK_WORKFLOW,
    ProjectDetailService
} from '@/services/projectDetailService';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUS_COLORS = {
  planning: '#0066CC',
  active: '#3b82f6',
  completed: '#0066CC',
  paused: '#000000',
};

const STATUS_LABELS = {
  planning: 'Lên kế hoạch',
  active: 'Đang thực hiện',
  completed: 'Hoàn thành',
  paused: 'Tạm dừng',
};

// Types from service are now exported
type WorkflowPhaseData = WorkflowPhase;
type TeamMemberData = TeamMember;
type ProjectDocumentData = ProjectDocument;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function ProjectDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workflowOrientation, setWorkflowOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  // State for API data - initialize with mock data immediately
  const [workflowPhases, setWorkflowPhases] = useState<WorkflowPhase[]>(MOCK_WORKFLOW);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM);
  const [documents, setDocuments] = useState<ProjectDocument[]>(MOCK_DOCUMENTS);
  const [loadingDetails, setLoadingDetails] = useState(false); // Don't block on loading

  const { project, loading, error, refresh } = useProjectDetail(id ? parseInt(id) : null);
  const { addExpense, addTask, toggleTaskStatus } = useProjectData();
  const budgetData = useProjectBudget(id || '');
  const projectTasks = useProjectTasks(id || '');

  // Fetch project details (workflow, team, documents) - non-blocking background fetch
  const fetchProjectDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const [workflowRes, teamRes, docsRes] = await Promise.all([
        ProjectDetailService.getProjectWorkflow(id),
        ProjectDetailService.getProjectTeam(id),
        ProjectDetailService.getProjectDocuments(id),
      ]);
      
      clearTimeout(timeoutId);
      
      setWorkflowPhases(workflowRes.phases);
      setTeamMembers(teamRes.members);
      setDocuments(docsRes.documents);
    } catch (error) {
      console.warn('Failed to fetch project details, using mock data:', error);
      // Keep existing mock data
    } finally {
      setLoadingDetails(false);
    }
  }, [id]);

  useEffect(() => {
    // Fetch in background after initial render
    const timer = setTimeout(() => {
      fetchProjectDetails();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchProjectDetails]);

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      // Generate unique ID for expense
      const expenseId = `exp_${Date.now()}`;
      
      const expense = {
        id: expenseId,
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date,
        type: data.type,
        status: data.status,
      };

      await addExpense(id, expense);
      
      Alert.alert(
        'Thành công', 
        `Đã thêm ${data.type === 'expense' ? 'chi phí' : 'thu nhập'}: ${data.description}`
      );
      
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      Alert.alert('Lỗi', 'Không thể thêm chi phí. Vui lòng thử lại.');
    }
  };

  const handleAddTask = async (data: TaskFormData) => {
    try {
      // Generate unique ID for task
      const taskId = `task_${Date.now()}`;
      
      const task = {
        id: taskId,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        tags: data.tags,
        assignees: [], // Will be assigned later
        subtasks: [],
        completed: false,
      };

      await addTask(id, task);
      
      Alert.alert('Thành công', `Đã thêm công việc: ${data.title}`);
      
      setShowTaskForm(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      Alert.alert('Lỗi', 'Không thể thêm công việc. Vui lòng thử lại.');
    }
  };

  if (loading && !project) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'Chi tiết dự án',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }} 
        />
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>
          Đang tải...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'Chi tiết dự án',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }} 
        />
        <Ionicons name="warning-outline" size={48} color={colors.tabIconDefault} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Không thể tải dự án
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={refresh}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'Chi tiết dự án',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }} 
        />
        <Ionicons name="document-outline" size={48} color={colors.tabIconDefault} />
        <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
          Không tìm thấy dự án
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: project.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {project.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[project.status] }]}>
            <Text style={styles.statusText}>
              {STATUS_LABELS[project.status]}
            </Text>
          </View>
        </View>

        {/* Description */}
        {project.description && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mô tả
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {project.description}
            </Text>
          </View>
        )}

        {/* Details Grid */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thông tin chi tiết
          </Text>

          {/* Location */}
          {project.location && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="location-outline" size={20} color={colors.tint} />
                <Text style={[styles.detailLabelText, { color: colors.tabIconDefault }]}>
                  Địa điểm
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {project.location}
              </Text>
            </View>
          )}

          {/* Progress */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons name="analytics-outline" size={20} color={colors.tint} />
              <Text style={[styles.detailLabelText, { color: colors.tabIconDefault }]}>
                Tiến độ
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.tint,
                      width: `${project.progress || 0}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {project.progress || 0}%
              </Text>
            </View>
          </View>

          {/* Start Date */}
          {project.start_date && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="calendar-outline" size={20} color={colors.tint} />
                <Text style={[styles.detailLabelText, { color: colors.tabIconDefault }]}>
                  Ngày bắt đầu
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(project.start_date)}
              </Text>
            </View>
          )}

          {/* End Date */}
          {project.end_date && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="flag-outline" size={20} color={colors.tint} />
                <Text style={[styles.detailLabelText, { color: colors.tabIconDefault }]}>
                  Ngày kết thúc
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(project.end_date)}
              </Text>
            </View>
          )}

          {/* Team Count */}
          {project.teamMembers && project.teamMembers.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="people-outline" size={20} color={colors.tint} />
                <Text style={[styles.detailLabelText, { color: colors.tabIconDefault }]}>
                  Thành viên
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {project.teamMembers.length} người
              </Text>
            </View>
          )}

          {/* Document Count */}
          {project.images && project.images.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="document-text-outline" size={20} color={colors.tint} />
                <Text style={[styles.detailLabelText, { color: colors.tabIconDefault }]}>
                  Tài liệu
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {project.images.length} file
              </Text>
            </View>
          )}
        </View>

        {/* Budget Tracker Section */}
        {budgetData && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quản lý ngân sách
            </Text>
            <CostTracker
              totalBudget={budgetData.totalBudget}
              totalSpent={budgetData.totalSpent}
              categories={budgetData.categories}
              recentTransactions={budgetData.recentTransactions}
              onAddExpense={() => {
                setShowExpenseForm(true);
              }}
              onViewDetails={(categoryId: string) => {
                const category = budgetData.categories.find((c: any) => c.id === categoryId);
                Alert.alert('Chi tiết danh mục', category?.name || 'N/A');
              }}
            />
          </View>
        )}

        {/* Task Management Section */}
        {projectTasks && projectTasks.length > 0 && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quản lý công việc
            </Text>
            <TaskManagement
              tasks={projectTasks}
              onTaskToggle={async (taskId: string) => {
                try {
                  await toggleTaskStatus(id, taskId);
                } catch (e) {
                  Alert.alert('Lỗi', 'Không thể cập nhật trạng thái công việc');
                }
              }}
              onTaskPress={(task) => {
                // Navigate to a future task detail route (stub). Using alert as fallback until screen exists.
                try {
                  // Define a canonical task detail route helper once implemented
                  // router.push(`/projects/${id}/task/${task.id}` as const);
                  Alert.alert('Chi tiết công việc', `${task.title}\nTrạng thái: ${task.status}`);
                } catch {
                  Alert.alert('Chi tiết công việc', task.title);
                }
              }}
              onAddTask={() => {
                setShowTaskForm(true);
              }}
              groupBy="status"
              showFilters={true}
            />
          </View>
        )}

        {/* Team Management Section */}
        <TeamManagement
          members={teamMembers}
          editable={true}
          onAddMember={async () => {
            // TODO: Show add member modal
            Alert.alert('Thêm thành viên', 'Tính năng thêm thành viên sẽ được tích hợp');
          }}
          onMemberPress={(member) => {
            Alert.alert('Thông tin', `${member.name} - ${member.role}`);
          }}
          onRemoveMember={async (member) => {
            Alert.alert(
              'Xác nhận', 
              `Xóa ${member.name} khỏi dự án?`,
              [
                { text: 'Hủy', style: 'cancel' },
                { 
                  text: 'Xóa', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await ProjectDetailService.removeTeamMember(id!, member.id);
                      setTeamMembers(prev => prev.filter(m => m.id !== member.id));
                    } catch (error) {
                      Alert.alert('Lỗi', 'Không thể xóa thành viên');
                    }
                  }
                }
              ]
            );
          }}
        />

        {/* Workflow Map Section */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={styles.workflowHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tiến độ thi công
            </Text>
            <View style={styles.orientationToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  workflowOrientation === 'horizontal' && { backgroundColor: colors.tint }
                ]}
                onPress={() => setWorkflowOrientation('horizontal')}
              >
                <Ionicons 
                  name="swap-horizontal" 
                  size={16} 
                  color={workflowOrientation === 'horizontal' ? '#fff' : colors.tabIconDefault} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  workflowOrientation === 'vertical' && { backgroundColor: colors.tint }
                ]}
                onPress={() => setWorkflowOrientation('vertical')}
              >
                <Ionicons 
                  name="swap-vertical" 
                  size={16} 
                  color={workflowOrientation === 'vertical' ? '#fff' : colors.tabIconDefault} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <WorkflowMap phases={workflowPhases} orientation={workflowOrientation} />
        </View>
      </ScrollView>

      {/* Add Expense Form Modal */}
      <AddExpenseForm
        visible={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={handleAddExpense}
        categories={budgetData?.categories || []}
        projectId={id}
      />

      {/* Add Task Form Modal */}
      <AddTaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleAddTask}
        projectId={id}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailLabelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    marginLeft: 28,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 28,
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
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  orientationToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
