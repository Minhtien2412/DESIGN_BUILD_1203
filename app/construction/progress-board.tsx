/**
 * Construction Progress Board - Kanban + Timeline View
 * Features: Drag & drop tasks, visual progress, stage management
 * Based on HTML demo board layout
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

// ==================== TYPES ====================

type TaskStatus = 'pending' | 'in_progress' | 'done' | 'late';

interface Stage {
  id: string;
  label: string;
  order: number;
}

interface Task {
  id: string;
  stageId: string;
  label: string;
  status: TaskStatus;
  notes: string;
  createdAt: string;
}

// ==================== CONFIG ====================

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; progress: number }> = {
  pending: { label: 'Chưa bắt đầu', color: '#9e9e9e', bg: '#f0f0f0', progress: 0 },
  in_progress: { label: 'Đang thực hiện', color: '#ffb300', bg: '#fff8e1', progress: 0.5 },
  done: { label: 'Hoàn thành', color: '#4caf50', bg: '#e8f5e9', progress: 1 },
  late: { label: 'Trễ tiến độ', color: '#e53935', bg: '#ffebee', progress: 0.3 },
};

const DEFAULT_STAGES: Stage[] = [
  { id: 'S1', label: '01 - Khởi đầu', order: 1 },
  { id: 'S2', label: '02 - Kết cấu', order: 2 },
  { id: 'S3', label: '03 - Hoàn thiện', order: 3 },
  { id: 'S4', label: '04 - Bàn giao', order: 4 },
];

const DEFAULT_TASKS: Task[] = [
  { id: 'T1', stageId: 'S1', label: 'Chuẩn bị mặt bằng', status: 'done', notes: '', createdAt: new Date().toISOString() },
  { id: 'T2', stageId: 'S1', label: 'Đào móng – ép cọc', status: 'in_progress', notes: '', createdAt: new Date().toISOString() },
  { id: 'T3', stageId: 'S2', label: 'Đổ sàn tầng 1', status: 'in_progress', notes: '', createdAt: new Date().toISOString() },
  { id: 'T4', stageId: 'S2', label: 'Đổ sàn mái', status: 'pending', notes: '', createdAt: new Date().toISOString() },
  { id: 'T5', stageId: 'S3', label: 'Xây tường – tô trát', status: 'pending', notes: '', createdAt: new Date().toISOString() },
  { id: 'T6', stageId: 'S3', label: 'MEP, trần thạch cao', status: 'pending', notes: '', createdAt: new Date().toISOString() },
];

const STORAGE_KEY = 'construction_progress_board_v1';

// ==================== MAIN COMPONENT ====================

export default function ConstructionProgressBoard() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'timeline'>('board');

  // Load from storage
  useEffect(() => {
    loadData();
  }, []);

  // Save to storage
  useEffect(() => {
    saveData();
  }, [tasks]);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.tasks) setTasks(data.tasks);
        if (data.stages) setStages(data.stages);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ stages, tasks }));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  };

  // Calculate stage progress
  const calcStageProgress = (stageId: string): number => {
    const stageTasks = tasks.filter(t => t.stageId === stageId);
    if (stageTasks.length === 0) return 0;
    const sum = stageTasks.reduce((acc, t) => acc + STATUS_CONFIG[t.status].progress, 0);
    return sum / stageTasks.length;
  };

  // Calculate overall progress
  const calcOverallProgress = (): number => {
    if (stages.length === 0) return 0;
    const sum = stages.reduce((acc, s) => acc + calcStageProgress(s.id), 0);
    return sum / stages.length;
  };

  const overallProgress = Math.round(calcOverallProgress() * 100);

  // Move task to different stage
  const moveTask = (taskId: string, newStageId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, stageId: newStageId } : t))
    );
  };

  // Update task status
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status } : t))
    );
  };

  // Update task notes
  const updateTaskNotes = (taskId: string, notes: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, notes } : t))
    );
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Xóa hạng mục',
      'Bạn có chắc muốn xóa hạng mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setSelectedTaskId(null);
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tiến độ thi công</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Board kéo thả & Timeline
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Progress Summary */}
      <View style={[styles.progressSummary, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Tiến độ tổng thể</Text>
        <View style={[styles.progressBadge, {
          backgroundColor: overallProgress < 40 ? '#ffebee' : overallProgress < 80 ? '#fff8e1' : '#e8f5e9'
        }]}>
          <Text style={[styles.progressText, {
            color: overallProgress < 40 ? '#c62828' : overallProgress < 80 ? '#ef6c00' : '#2e7d32'
          }]}>
            {overallProgress}%
          </Text>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'board' && { backgroundColor: colors.accent }]}
          onPress={() => setViewMode('board')}
        >
          <Text style={[styles.toggleText, { color: viewMode === 'board' ? '#fff' : colors.textMuted }]}>
            Board
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'timeline' && { backgroundColor: colors.accent }]}
          onPress={() => setViewMode('timeline')}
        >
          <Text style={[styles.toggleText, { color: viewMode === 'timeline' ? '#fff' : colors.textMuted }]}>
            Timeline
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'board' ? (
        <BoardView
          stages={stages}
          tasks={tasks}
          colors={colors}
          onTaskPress={(taskId) => {
            setSelectedTaskId(taskId);
            setShowDetailModal(true);
          }}
          onMoveTask={moveTask}
          onUpdateStatus={updateTaskStatus}
          calcStageProgress={calcStageProgress}
        />
      ) : (
        <TimelineView
          stages={stages}
          tasks={tasks}
          colors={colors}
          calcStageProgress={calcStageProgress}
          onTaskPress={(taskId) => {
            setSelectedTaskId(taskId);
            setShowDetailModal(true);
          }}
        />
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        stages={stages}
        colors={colors}
        onAdd={(label, stageId, notes) => {
          const newTask: Task = {
            id: 'T' + Date.now(),
            stageId,
            label,
            status: 'pending',
            notes,
            createdAt: new Date().toISOString(),
          };
          setTasks(prev => [...prev, newTask]);
          setShowAddModal(false);
        }}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          visible={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTaskId(null);
          }}
          task={selectedTask}
          stage={stages.find(s => s.id === selectedTask.stageId)}
          colors={colors}
          onUpdateStatus={(status) => updateTaskStatus(selectedTask.id, status)}
          onUpdateNotes={(notes) => updateTaskNotes(selectedTask.id, notes)}
          onDelete={() => deleteTask(selectedTask.id)}
        />
      )}
    </View>
  );
}

// ==================== BOARD VIEW ====================

interface BoardViewProps {
  stages: Stage[];
  tasks: Task[];
  colors: any;
  onTaskPress: (taskId: string) => void;
  onMoveTask: (taskId: string, newStageId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  calcStageProgress: (stageId: string) => number;
}

function BoardView({ stages, tasks, colors, onTaskPress, calcStageProgress }: BoardViewProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardContainer}>
      {stages.map(stage => {
        const stageTasks = tasks.filter(t => t.stageId === stage.id);
        const progress = Math.round(calcStageProgress(stage.id) * 100);

        return (
          <View key={stage.id} style={[styles.column, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Column Header */}
            <View style={[styles.columnHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.columnTitle, { color: colors.text }]}>{stage.label}</Text>
              <Text style={[styles.columnProgress, { color: colors.textMuted }]}>{progress}%</Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.columnProgressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.columnProgressFill, { width: `${progress}%` }]} />
            </View>

            {/* Tasks */}
            <ScrollView style={styles.columnTasks} showsVerticalScrollIndicator={false}>
              {stageTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  colors={colors}
                  onPress={() => onTaskPress(task.id)}
                />
              ))}
              {stageTasks.length === 0 && (
                <Text style={[styles.emptyColumn, { color: colors.textMuted }]}>
                  Chưa có hạng mục
                </Text>
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ==================== TASK CARD ====================

interface TaskCardProps {
  task: Task;
  colors: any;
  onPress: () => void;
}

function TaskCard({ task, colors, onPress }: TaskCardProps) {
  const status = STATUS_CONFIG[task.status];

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: status.bg, borderColor: status.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.taskCardHeader}>
        <View style={[styles.taskStatusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.taskCardTitle, { color: colors.text }]} numberOfLines={2}>
          {task.label}
        </Text>
      </View>

      <View style={styles.taskCardFooter}>
        <Text style={[styles.taskStatusText, { color: status.color }]} numberOfLines={1}>
          {status.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ==================== TIMELINE VIEW ====================

interface TimelineViewProps {
  stages: Stage[];
  tasks: Task[];
  colors: any;
  calcStageProgress: (stageId: string) => number;
  onTaskPress: (taskId: string) => void;
}

function TimelineView({ stages, tasks, colors, calcStageProgress, onTaskPress }: TimelineViewProps) {
  return (
    <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
      {stages.map((stage, index) => {
        const stageTasks = tasks.filter(t => t.stageId === stage.id);
        const progress = Math.round(calcStageProgress(stage.id) * 100);
        const isLast = index === stages.length - 1;

        return (
          <View key={stage.id} style={styles.timelineStage}>
            {/* Stage Node */}
            <View style={styles.timelineNodeContainer}>
              <View style={[styles.timelineNode, { backgroundColor: colors.accent }]}>
                <Text style={styles.timelineNodeText}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              {!isLast && (
                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
              )}
            </View>

            {/* Stage Content */}
            <View style={styles.timelineContent}>
              <View style={[styles.timelineHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.timelineStageTitle, { color: colors.text }]}>{stage.label}</Text>
                <Text style={[styles.timelineProgress, { color: colors.accent }]}>{progress}%</Text>
              </View>

              {/* Stage Tasks */}
              {stageTasks.map(task => {
                const status = STATUS_CONFIG[task.status];
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.timelineTask, { backgroundColor: status.bg, borderColor: status.color }]}
                    onPress={() => onTaskPress(task.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.taskStatusDot, { backgroundColor: status.color }]} />
                    <View style={styles.timelineTaskContent}>
                      <Text style={[styles.timelineTaskTitle, { color: colors.text }]}>{task.label}</Text>
                      <Text style={[styles.timelineTaskStatus, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {stageTasks.length === 0 && (
                <Text style={[styles.emptyTimeline, { color: colors.textMuted }]}>
                  Chưa có hạng mục nào
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ==================== ADD TASK MODAL ====================

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  stages: Stage[];
  colors: any;
  onAdd: (label: string, stageId: string, notes: string) => void;
}

function AddTaskModal({ visible, onClose, stages, colors, onAdd }: AddTaskModalProps) {
  const [label, setLabel] = useState('');
  const [stageId, setStageId] = useState(stages[0]?.id || '');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!label.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hạng mục');
      return;
    }
    onAdd(label.trim(), stageId, notes.trim());
    setLabel('');
    setNotes('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Thêm hạng mục mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Tên hạng mục *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={label}
              onChangeText={setLabel}
              placeholder="VD: Thi công trần thạch cao"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Giai đoạn *</Text>
            <View style={styles.stageSelect}>
              {stages.map(stage => (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.stageOption,
                    { borderColor: colors.border },
                    stageId === stage.id && { backgroundColor: colors.accent, borderColor: colors.accent }
                  ]}
                  onPress={() => setStageId(stage.id)}
                >
                  <Text style={[
                    styles.stageOptionText,
                    { color: stageId === stage.id ? '#fff' : colors.text }
                  ]}>
                    {stage.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Ghi chú</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="VD: Ưu tiên xong trong tháng 12"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={onClose}>
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleAdd}>
              <Text style={styles.modalButtonTextPrimary}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== TASK DETAIL MODAL ====================

interface TaskDetailModalProps {
  visible: boolean;
  onClose: () => void;
  task: Task;
  stage?: Stage;
  colors: any;
  onUpdateStatus: (status: TaskStatus) => void;
  onUpdateNotes: (notes: string) => void;
  onDelete: () => void;
}

function TaskDetailModal({ visible, onClose, task, stage, colors, onUpdateStatus, onUpdateNotes, onDelete }: TaskDetailModalProps) {
  const [notes, setNotes] = useState(task.notes);

  useEffect(() => {
    setNotes(task.notes);
  }, [task.notes]);

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
    Alert.alert('Thành công', 'Đã lưu ghi chú');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Chi tiết hạng mục</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.taskDetailTitle, { color: colors.text }]}>{task.label}</Text>
            {stage && (
              <View style={[styles.taskDetailTag, { backgroundColor: colors.chipBackground }]}>
                <Text style={[styles.taskDetailTagText, { color: colors.accent }]}>{stage.label}</Text>
              </View>
            )}

            <Text style={[styles.modalLabel, { color: colors.textMuted, marginTop: 16 }]}>Trạng thái</Text>
            <View style={styles.statusSelect}>
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(statusKey => {
                const status = STATUS_CONFIG[statusKey];
                return (
                  <TouchableOpacity
                    key={statusKey}
                    style={[
                      styles.statusOption,
                      { borderColor: colors.border },
                      task.status === statusKey && { backgroundColor: status.color, borderColor: status.color }
                    ]}
                    onPress={() => onUpdateStatus(statusKey)}
                  >
                    <View style={[styles.taskStatusDot, {
                      backgroundColor: task.status === statusKey ? '#fff' : status.color
                    }]} />
                    <Text style={[
                      styles.statusOptionText,
                      { color: task.status === statusKey ? '#fff' : colors.text }
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Ghi chú</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Thêm ghi chú..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.saveNotesButton} onPress={handleSaveNotes}>
              <Text style={[styles.saveNotesText, { color: colors.accent }]}>Lưu ghi chú</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="#e53935" />
              <Text style={styles.deleteButtonText}>Xóa hạng mục</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary, { flex: 1 }]} onPress={onClose}>
              <Text style={styles.modalButtonTextPrimary}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    padding: 4,
  },
  progressSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e0e4f5',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  boardContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  column: {
    width: 240,
    marginHorizontal: 6,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  columnProgress: {
    fontSize: 11,
  },
  columnProgressBar: {
    height: 4,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 2,
  },
  columnProgressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  columnTasks: {
    padding: 8,
    maxHeight: 500,
  },
  emptyColumn: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  taskCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  taskStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  taskCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  taskCardFooter: {
    marginTop: 6,
    marginLeft: 16,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timelineContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timelineStage: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  timelineNodeContainer: {
    alignItems: 'center',
    paddingRight: 16,
  },
  timelineNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  timelineStageTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineProgress: {
    fontSize: 13,
    fontWeight: '600',
  },
  timelineTask: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  timelineTaskContent: {
    flex: 1,
    marginLeft: 8,
  },
  timelineTaskTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  timelineTaskStatus: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyTimeline: {
    fontSize: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stageSelect: {
    gap: 8,
  },
  stageOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  stageOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusSelect: {
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  taskDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskDetailTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  taskDetailTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  saveNotesButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  saveNotesText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e53935',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#e0e4f5',
  },
  modalButtonPrimary: {
    backgroundColor: '#1f912c',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
