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
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUS_COLORS = {
  planning: '#f97316',
  active: '#3b82f6',
  completed: '#22c55e',
  paused: '#ef4444',
};

const STATUS_LABELS = {
  planning: 'Lên kế hoạch',
  active: 'Đang thực hiện',
  completed: 'Hoàn thành',
  paused: 'Tạm dừng',
};

// Mock workflow phases - replace with real data from API
const MOCK_WORKFLOW: WorkflowPhase[] = [
  {
    id: '1',
    name: 'Khảo sát & Thiết kế',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-01',
    endDate: '2024-02-15',
    tasks: 12,
    completedTasks: 12,
  },
  {
    id: '2',
    name: 'Chuẩn bị mặt bằng',
    status: 'completed',
    progress: 100,
    startDate: '2024-02-16',
    endDate: '2024-03-10',
    tasks: 8,
    completedTasks: 8,
  },
  {
    id: '3',
    name: 'Đổ móng & Kết cấu',
    status: 'active',
    progress: 65,
    startDate: '2024-03-11',
    endDate: '2024-05-20',
    tasks: 15,
    completedTasks: 10,
  },
  {
    id: '4',
    name: 'Xây tường & Trát',
    status: 'pending',
    progress: 0,
    startDate: '2024-05-21',
    endDate: '2024-07-15',
    tasks: 20,
    completedTasks: 0,
  },
  {
    id: '5',
    name: 'Lắp đặt điện nước',
    status: 'pending',
    progress: 0,
    startDate: '2024-07-16',
    endDate: '2024-08-30',
    tasks: 18,
    completedTasks: 0,
  },
  {
    id: '6',
    name: 'Hoàn thiện & Bàn giao',
    status: 'pending',
    progress: 0,
    startDate: '2024-09-01',
    endDate: '2024-10-15',
    tasks: 10,
    completedTasks: 0,
  },
];

// Mock team members - replace with real data from API
const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    role: 'Giám đốc dự án',
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    joinedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    role: 'Kiến trúc sư',
    phone: '0907654321',
    email: 'tranthib@example.com',
    joinedAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    role: 'Kỹ sư thi công',
    phone: '0909876543',
    email: 'levanc@example.com',
    joinedAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    role: 'Kỹ thuật viên',
    phone: '0908765432',
    joinedAt: '2024-02-01',
  },
];

// Mock documents - replace with real data from API
const MOCK_DOCUMENTS: ProjectDocument[] = [
  {
    id: '1',
    name: 'Hợp đồng thi công.pdf',
    type: 'contract',
    size: 2457600, // 2.4 MB
    mimeType: 'application/pdf',
    url: '/documents/contract.pdf',
    uploadedBy: 'Nguyễn Văn A',
    uploadedAt: '2024-01-15',
    tags: ['hợp đồng', 'quan trọng'],
  },
  {
    id: '2',
    name: 'Bản vẽ thiết kế tổng thể.dwg',
    type: 'design',
    size: 8945000, // 8.9 MB
    mimeType: 'application/acad',
    url: '/documents/design-master.dwg',
    uploadedBy: 'Trần Thị B',
    uploadedAt: '2024-01-20',
    tags: ['thiết kế', 'bản vẽ'],
  },
  {
    id: '3',
    name: 'Báo cáo tiến độ tháng 3.docx',
    type: 'report',
    size: 1024000, // 1 MB
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/documents/report-mar.docx',
    uploadedBy: 'Lê Văn C',
    uploadedAt: '2024-03-31',
    tags: ['báo cáo', 'tháng 3'],
  },
  {
    id: '4',
    name: 'Giấy phép xây dựng.pdf',
    type: 'permit',
    size: 512000, // 512 KB
    mimeType: 'application/pdf',
    url: '/documents/building-permit.pdf',
    uploadedBy: 'Nguyễn Văn A',
    uploadedAt: '2024-01-10',
    tags: ['giấy phép', 'pháp lý'],
  },
  {
    id: '5',
    name: 'Hóa đơn vật tư tháng 3.xlsx',
    type: 'invoice',
    size: 768000, // 768 KB
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: '/documents/invoice-mar.xlsx',
    uploadedBy: 'Phạm Thị D',
    uploadedAt: '2024-03-15',
    tags: ['hóa đơn', 'vật tư'],
  },
  {
    id: '6',
    name: 'Bản vẽ móng.pdf',
    type: 'design',
    size: 3456000, // 3.5 MB
    mimeType: 'application/pdf',
    url: '/documents/foundation-plan.pdf',
    uploadedBy: 'Trần Thị B',
    uploadedAt: '2024-02-05',
    tags: ['thiết kế', 'móng'],
  },
  {
    id: '7',
    name: 'Báo cáo khảo sát địa chất.pdf',
    type: 'report',
    size: 5120000, // 5 MB
    mimeType: 'application/pdf',
    url: '/documents/geological-survey.pdf',
    uploadedBy: 'Lê Văn C',
    uploadedAt: '2024-01-25',
    tags: ['báo cáo', 'khảo sát'],
  },
];

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

  const { project, loading, error, refresh } = useProjectDetail(id ? parseInt(id) : null);
  const { addExpense, addTask, toggleTaskStatus } = useProjectData();
  const budgetData = useProjectBudget(id || '');
  const projectTasks = useProjectTasks(id || '');

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
          members={MOCK_TEAM}
          editable={true}
          onAddMember={() => {
            Alert.alert('Thêm thành viên', 'Tính năng thêm thành viên sẽ được tích hợp');
          }}
          onMemberPress={(member) => {
            Alert.alert('Thông tin', `${member.name} - ${member.role}`);
          }}
          onRemoveMember={(member) => {
            Alert.alert('Xác nhận', `Xóa ${member.name} khỏi dự án?`);
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

          <WorkflowMap phases={MOCK_WORKFLOW} orientation={workflowOrientation} />
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
