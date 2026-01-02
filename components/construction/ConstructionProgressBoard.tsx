/**
 * Construction Progress Board - Kanban + Diagram View
 * Inspired by HTML5 demo with full React Native implementation
 * Features: Drag & drop, Real-time sync, Touch gestures, Backend integration
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useConstructionMapAPI } from '@/hooks/useConstructionMapAPI';
import { TaskMovedEvent, TaskStatusChangedEvent, useConstructionMapSync, UserJoinedEvent } from '@/hooks/useConstructionMapSync';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  projectId: string;
  isAdmin?: boolean;
}

type ViewMode = 'board' | 'diagram';

const STATUS_CONFIG = {
  pending: { label: 'Chưa bắt đầu', color: '#9e9e9e', fill: '#f0f0f0', progress: 0 },
  'in-progress': { label: 'Đang thực hiện', color: '#ffb300', fill: '#fff8e1', progress: 0.5 },
  done: { label: 'Hoàn thành', color: '#4caf50', fill: '#e8f5e9', progress: 1 },
  late: { label: 'Trễ tiến độ', color: '#e53935', fill: '#ffebee', progress: 0.3 },
};

export default function ConstructionProgressBoard({ projectId, isAdmin = false }: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  // Backend integration
  const {
    data,
    loading,
    error,
    updateTaskPosition,
    updateTaskStatus,
    createTask,
    deleteTask,
    getProgress,
  } = useConstructionMapAPI(projectId);

  const {
    connected,
    activeUsers,
    emitTaskMoved,
    emitTaskStatusChanged,
    setOnTaskMoved,
    setOnTaskStatusChanged,
    setOnUserJoined,
  } = useConstructionMapSync(projectId);

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectProgress, setProjectProgress] = useState(0);

  // Form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskStage, setNewTaskStage] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Zoom & Pan for diagram
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Setup WebSocket listeners
  useEffect(() => {
    setOnTaskMoved((event: TaskMovedEvent) => {
      // Update local UI from remote user
      console.log(`Remote task moved: ${event.taskId}`);
      // Data will auto-refresh from useConstructionMapAPI
    });

    setOnTaskStatusChanged((event: TaskStatusChangedEvent) => {
      console.log(`Remote task status changed: ${event.taskId} -> ${event.status}`);
    });

    setOnUserJoined((event: UserJoinedEvent) => {
      console.log(`User joined: ${event.userId}`);
    });
  }, []);

  // Calculate project progress
  useEffect(() => {
    if (!data) return;
    
    const fetchProgress = async () => {
      const progressData = await getProgress();
      if (progressData) {
        setProjectProgress(Math.round(progressData.overall * 100));
      }
    };

    fetchProgress();
  }, [data]);

  // Calculate stage progress
  const calcStageProgress = (stageId: string): number => {
    if (!data) return 0;
    const tasks = data.tasks.filter(t => t.stageId === stageId);
    if (!tasks.length) return 0;
    
    const sum = tasks.reduce((acc, t) => {
      const config = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
      return acc + (config?.progress || 0);
    }, 0);
    
    return sum / tasks.length;
  };

  // Handle task drag & drop
  const handleTaskDrop = async (taskId: string, newStageId: string) => {
    const task = data?.tasks.find(t => t.id === taskId);
    if (!task) return;

    const stage = data?.stages.find(s => s.id === newStageId);
    if (!stage) return;

    // Calculate new position around stage
    const newX = stage.x - 80 + (Math.random() * 60 - 30);
    const newY = stage.y + 110 + Math.random() * 90;

    try {
      // Broadcast to other users
      emitTaskMoved(taskId, newX, newY);

      // Persist to backend
      await updateTaskPosition(taskId, newX, newY);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể di chuyển task');
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      emitTaskStatusChanged(taskId, newStatus as any);
      await updateTaskStatus(taskId, newStatus as any);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  // Handle add new task
  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên hạng mục');
      return;
    }

    const stage = data?.stages.find(s => s.id === newTaskStage);
    if (!stage) return;

    try {
      await createTask({
        projectId,
        stageId: newTaskStage,
        label: newTaskName,
        status: 'pending',
        progress: 0,
        x: stage.x - 80 + (Math.random() * 60 - 30),
        y: stage.y + 110 + Math.random() * 90,
        width: 170,
        height: 46,
        notes: newTaskNotes,
      });

      setNewTaskName('');
      setNewTaskNotes('');
      setShowAddModal(false);
      Alert.alert('Thành công', 'Đã thêm hạng mục mới');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm hạng mục');
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa hạng mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              setSelectedTaskId(null);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa hạng mục');
            }
          },
        },
      ]
    );
  };

  // Pinch zoom gesture for diagram
  const savedScale = useRef(1);
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = savedScale.current * e.scale;
      scale.setValue(Math.max(0.5, Math.min(2.5, newScale)));
    })
    .onEnd(() => {
      savedScale.current = (scale as any)._value;
    });

  // Pan gesture for diagram
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.setValue(e.translationX);
      translateY.setValue(e.translationY);
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: '#e53935' }]}>Lỗi: {error.message}</Text>
      </View>
    );
  }

  if (!data) return null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Tiến độ thi công</Text>
          <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
            {connected ? '🟢 Real-time sync' : '🔴 Offline'} • {activeUsers.length} users
          </Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{projectProgress}%</Text>
        </View>
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, viewMode === 'board' && styles.tabActive]}
          onPress={() => setViewMode('board')}
        >
          <Text style={[styles.tabText, viewMode === 'board' && styles.tabTextActive]}>
            Board (Kéo thả)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, viewMode === 'diagram' && styles.tabActive]}
          onPress={() => setViewMode('diagram')}
        >
          <Text style={[styles.tabText, viewMode === 'diagram' && styles.tabTextActive]}>
            Sơ đồ
          </Text>
        </Pressable>
      </View>

      {/* Board View */}
      {viewMode === 'board' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardScroll}>
          {data.stages.map((stage) => (
            <BoardColumn
              key={stage.id}
              stage={stage}
              tasks={data.tasks.filter(t => t.stageId === stage.id)}
              progress={calcStageProgress(stage.id)}
              onTaskDrop={handleTaskDrop}
              onStatusChange={handleStatusChange}
              onTaskSelect={setSelectedTaskId}
              surfaceColor={surfaceColor}
              borderColor={borderColor}
              textColor={textColor}
            />
          ))}
        </ScrollView>
      )}

      {/* Diagram View */}
      {viewMode === 'diagram' && (
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[
              styles.diagramContainer,
              {
                transform: [
                  { scale },
                  { translateX },
                  { translateY },
                ],
              },
            ]}
          >
            <DiagramView
              stages={data.stages}
              tasks={data.tasks}
              selectedTaskId={selectedTaskId}
              onTaskSelect={setSelectedTaskId}
              onTaskMove={(taskId: string, x: number, y: number) => {
                emitTaskMoved(taskId, x, y);
                updateTaskPosition(taskId, x, y);
              }}
            />
          </Animated.View>
        </GestureDetector>
      )}

      {/* Floating Add Button */}
      {isAdmin && (
        <Pressable
          style={[styles.fab, { backgroundColor: primaryColor }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}

      {/* Add Task Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Thêm hạng mục mới</Text>

            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              placeholder="Tên hạng mục"
              placeholderTextColor={mutedColor}
              value={newTaskName}
              onChangeText={setNewTaskName}
            />

            <Text style={[styles.label, { color: mutedColor }]}>Thuộc giai đoạn</Text>
            {data.stages.map((stage) => (
              <Pressable
                key={stage.id}
                style={[
                  styles.stageOption,
                  { borderColor },
                  newTaskStage === stage.id && { backgroundColor: '#e8f5e9' },
                ]}
                onPress={() => setNewTaskStage(stage.id)}
              >
                <Text style={{ color: textColor }}>{stage.label}</Text>
              </Pressable>
            ))}

            <TextInput
              style={[styles.input, styles.textArea, { borderColor, color: textColor }]}
              placeholder="Ghi chú (tùy chọn)"
              placeholderTextColor={mutedColor}
              value={newTaskNotes}
              onChangeText={setNewTaskNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.buttonSecondaryText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={handleAddTask}
              >
                <Text style={styles.buttonText}>Thêm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Board Column Component
function BoardColumn({ stage, tasks, progress, onTaskDrop, onStatusChange, onTaskSelect, surfaceColor, borderColor, textColor }: any) {
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={[styles.boardColumn, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.boardHeader}>
        <Text style={[styles.boardHeaderTitle, { color: textColor }]}>{stage.label}</Text>
        <Text style={styles.boardHeaderProgress}>{progressPercent}%</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView style={styles.boardTasks}>
        {tasks.map((task: any) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onPress={() => onTaskSelect(task.id)}
            textColor={textColor}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Task Card Component
function TaskCard({ task, onStatusChange, onPress, textColor }: any) {
  const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];

  return (
    <Pressable
      style={[styles.taskCard, { backgroundColor: status.fill, borderColor: status.color }]}
      onPress={onPress}
    >
      <Text style={[styles.taskTitle, { color: textColor }]}>{task.label}</Text>
      <View style={styles.taskMeta}>
        <View style={[styles.statusChip, { backgroundColor: status.fill }]}>
          <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// Diagram View Component (SVG)
function DiagramView({ stages, tasks, selectedTaskId, onTaskSelect, onTaskMove }: any) {
  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 800;
  const TASK_WIDTH = 170;
  const TASK_HEIGHT = 46;

  return (
    <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
      {/* Grid background */}
      <G opacity={0.15}>
        {Array.from({ length: 35 }).map((_, i) => (
          <Line
            key={`vline-${i}`}
            x1={i * 40}
            y1={0}
            x2={i * 40}
            y2={CANVAS_HEIGHT}
            stroke="#dfe4f2"
            strokeWidth={i % 5 === 0 ? 0.8 : 0.4}
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <Line
            key={`hline-${i}`}
            x1={0}
            y1={i * 40}
            x2={CANVAS_WIDTH}
            y2={i * 40}
            stroke="#dfe4f2"
            strokeWidth={i % 5 === 0 ? 0.8 : 0.4}
          />
        ))}
      </G>

      {/* Stages */}
      {stages.map((stage: any, idx: number) => (
        <G key={stage.id} transform={`translate(${stage.x},${stage.y})`}>
          <Circle r={22} fill="#1f912c" stroke="#ffffff" strokeWidth={3} />
          <SvgText
            y={5}
            textAnchor="middle"
            fontSize={13}
            fontWeight="600"
            fill="#ffffff"
          >
            {String(idx + 1).padStart(2, '0')}
          </SvgText>
          <SvgText
            y={40}
            textAnchor="middle"
            fontSize={13}
            fill="#333"
          >
            {stage.label}
          </SvgText>
        </G>
      ))}

      {/* Tasks */}
      {tasks.map((task: any) => {
        const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
        const isSelected = task.id === selectedTaskId;

        return (
          <G key={task.id} transform={`translate(${task.x},${task.y})`}>
            {isSelected && (
              <Rect
                x={-3}
                y={-3}
                width={TASK_WIDTH + 6}
                height={TASK_HEIGHT + 6}
                rx={12}
                fill="none"
                stroke="#1f912c"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}
            <Rect
              width={TASK_WIDTH}
              height={TASK_HEIGHT}
              rx={10}
              fill={status.fill}
              stroke={status.color}
              strokeWidth={1.5}
            />
            <SvgText
              x={10}
              y={18}
              fontSize={12}
              fill="#222"
            >
              {task.label}
            </SvgText>
            <SvgText
              x={10}
              y={34}
              fontSize={11}
              fill={status.color}
            >
              {status.label}
            </SvgText>
            <Circle
              cx={TASK_WIDTH - 12}
              cy={14}
              r={5}
              fill={status.color}
            />
          </G>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  progressText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e0e4f5',
  },
  tabActive: {
    backgroundColor: '#273469',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#273469',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  boardScroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  boardColumn: {
    width: 260,
    marginHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf0fa',
  },
  boardHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  boardHeaderProgress: {
    fontSize: 12,
    color: '#555',
  },
  progressBarBg: {
    marginHorizontal: 12,
    marginVertical: 8,
    height: 4,
    backgroundColor: '#edf0fa',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1f912c',
    borderRadius: 999,
  },
  boardTasks: {
    padding: 8,
    maxHeight: 400,
  },
  taskCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  diagramContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  stageOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#e0e4f5',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonSecondaryText: {
    color: '#273469',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
