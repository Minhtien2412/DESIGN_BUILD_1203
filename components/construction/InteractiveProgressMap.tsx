import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types
type TaskStatus = 'pending' | 'in-progress' | 'done' | 'late';
type StageStatus = 'active' | 'completed' | 'upcoming';

type Task = {
  id: string;
  stageId: string;
  label: string;
  status: TaskStatus;
  x: number;
  y: number;
  notes?: string;
  assignedWorker?: string;
};

type Stage = {
  id: string;
  number: string;
  label: string;
  x: number;
  y: number;
  status: StageStatus;
};

type Props = {
  projectName: string;
  isAdmin?: boolean;
};

const STATUS_CONFIG = {
  pending: { label: 'Chưa bắt đầu', color: '#999999', fill: '#f0f0f0', progress: 0 },
  'in-progress': { label: 'Đang thực hiện', color: '#0D9488', fill: '#F0F8FF', progress: 0.5 },
  done: { label: 'Hoàn thành', color: '#0D9488', fill: '#e8f5e9', progress: 1 },
  late: { label: 'Trễ tiến độ', color: '#000000', fill: '#ffebee', progress: 0.3 },
};

const TASK_WIDTH = 170;
const TASK_HEIGHT = 46;
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;

export default function InteractiveProgressMap({ projectName, isAdmin = false }: Props) {
  const params = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  // Data
  const [stages, setStages] = useState<Stage[]>([
    { id: 'S1', number: '01', label: 'Khởi đầu', x: 200, y: 120, status: 'completed' },
    { id: 'S2', number: '02', label: 'Kết cấu', x: 500, y: 120, status: 'active' },
    { id: 'S3', number: '03', label: 'Hoàn thiện', x: 800, y: 120, status: 'upcoming' },
    { id: 'S4', number: '04', label: 'Bàn giao', x: 1100, y: 120, status: 'upcoming' },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 'T1', stageId: 'S1', label: 'Chuẩn bị mặt bằng', status: 'done', x: 150, y: 200 },
    { id: 'T2', stageId: 'S1', label: 'Đào móng – ép cọc', status: 'in-progress', x: 250, y: 250 },
    { id: 'T3', stageId: 'S2', label: 'Đổ sàn tầng 1', status: 'in-progress', x: 450, y: 220 },
    { id: 'T4', stageId: 'S2', label: 'Đổ sàn mái', status: 'pending', x: 550, y: 260 },
    { id: 'T5', stageId: 'S3', label: 'Xây tường – tô trát', status: 'pending', x: 780, y: 220 },
    { id: 'T6', stageId: 'S3', label: 'MEP, trần thạch cao', status: 'pending', x: 880, y: 260 },
    { id: 'T7', stageId: 'S4', label: 'Hoàn thiện nội thất', status: 'pending', x: 1080, y: 220 },
    { id: 'T8', stageId: 'S4', label: 'Vệ sinh & bàn giao', status: 'pending', x: 1180, y: 260 },
  ]);

  // UI State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStageList, setShowStageList] = useState(true);
  const [showDetail, setShowDetail] = useState(true);

  // Zoom & Pan
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  // Form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskStage, setNewTaskStage] = useState(stages[0]?.id || '');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Calculate stage progress
  const calcStageProgress = (stageId: string) => {
    const stageTasks = tasks.filter(t => t.stageId === stageId);
    if (stageTasks.length === 0) return 0;
    const sum = stageTasks.reduce((acc, t) => acc + STATUS_CONFIG[t.status].progress, 0);
    return sum / stageTasks.length;
  };

  // Calculate project progress
  const calcProjectProgress = () => {
    let total = 0;
    stages.forEach(s => {
      total += calcStageProgress(s.id);
    });
    return stages.length ? Math.round((total / stages.length) * 100) : 0;
  };

  // Zoom functions
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleZoomReset = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  // Pan responder for dragging canvas
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !draggingTask,
      onMoveShouldSetPanResponder: () => !draggingTask,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gesture) => {
        if (!draggingTask) {
          setTranslateX(prev => prev + gesture.dx / scale);
          setTranslateY(prev => prev + gesture.dy / scale);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Task drag handlers
  const handleTaskDragStart = (task: Task) => {
    setDraggingTask(task);
  };

  const handleTaskDragMove = (dx: number, dy: number) => {
    if (draggingTask) {
      setTasks(prev =>
        prev.map(t =>
          t.id === draggingTask.id
            ? { ...t, x: t.x + dx / scale, y: t.y + dy / scale }
            : t
        )
      );
    }
  };

  const handleTaskDragEnd = () => {
    setDraggingTask(null);
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      alert('Vui lòng nhập tên hạng mục');
      return;
    }

    const stage = stages.find(s => s.id === newTaskStage);
    if (!stage) return;

    const newTask: Task = {
      id: `T${Date.now()}`,
      stageId: newTaskStage,
      label: newTaskName,
      status: 'pending',
      x: stage.x - TASK_WIDTH / 2 + (Math.random() * 80 - 40),
      y: stage.y + 100 + Math.random() * 80,
      notes: newTaskNotes,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    setNewTaskNotes('');
    setShowAddModal(false);
    setSelectedTask(newTask);
  };

  // Update task status
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status } : t))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => (prev ? { ...prev, status } : null));
    }
  };

  // Render grid
  const renderGrid = () => {
    const lines = [];
    const gridSpacing = 40;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSpacing) {
      lines.push(
        <Line
          key={`vg${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={CANVAS_HEIGHT}
          stroke="#dfe4f2"
          strokeWidth={x % 200 === 0 ? 0.8 : 0.4}
          opacity={0.3}
        />
      );
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSpacing) {
      lines.push(
        <Line
          key={`hg${y}`}
          x1={0}
          y1={y}
          x2={CANVAS_WIDTH}
          y2={y}
          stroke="#dfe4f2"
          strokeWidth={y % 200 === 0 ? 0.8 : 0.4}
          opacity={0.3}
        />
      );
    }
    
    return lines;
  };

  // Render connection lines
  const renderLinks = () => {
    return tasks.map(task => {
      const stage = stages.find(s => s.id === task.stageId);
      if (!stage) return null;

      const sx = stage.x;
      const sy = stage.y + 30;
      const tx = task.x + TASK_WIDTH / 2;
      const ty = task.y;
      const mx = (sx + tx) / 2;

      return (
        <Path
          key={`link-${task.id}`}
          d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`}
          fill="none"
          stroke="#c5c8d8"
          strokeWidth={1.2}
        />
      );
    });
  };

  const projectProgress = calcProjectProgress();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.projectName, { color: textColor }]}>{projectName}</Text>
          <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
            Tiến độ thi công - Tương tác (zoom, kéo thả)
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.progressBadge, projectProgress >= 80 ? styles.progressHigh : projectProgress >= 40 ? styles.progressMedium : styles.progressLow]}>
            <Text style={styles.progressText}>{projectProgress}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Sidebar - Stages */}
        {showStageList && (
          <View style={[styles.sidebar, { backgroundColor: surfaceColor, borderRightColor: borderColor }]}>
            <ScrollView>
              <Text style={[styles.sidebarTitle, { color: textColor }]}>Giai đoạn thi công</Text>
              
              {stages.map(stage => {
                const progress = calcStageProgress(stage.id);
                return (
                  <Pressable
                    key={stage.id}
                    style={[styles.stageItem, { borderColor }]}
                    onPress={() => {
                      // Center on stage
                      const centerX = SCREEN_WIDTH / 2 - stage.x * scale;
                      const centerY = SCREEN_HEIGHT / 2 - stage.y * scale;
                      setTranslateX(centerX / scale);
                      setTranslateY(centerY / scale);
                      setScale(1.2);
                    }}
                  >
                    <Text style={[styles.stageLabel, { color: textColor }]}>{stage.label}</Text>
                    <Text style={[styles.stagePercent, { color: mutedColor }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </Pressable>
                );
              })}

              <View style={styles.divider} />

              <Text style={[styles.sidebarTitle, { color: textColor }]}>Thêm hạng mục</Text>
              
              <Pressable
                style={[styles.addButton, { backgroundColor: primaryColor }]}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Thêm hạng mục mới</Text>
              </Pressable>

              <View style={[styles.helpBox, { backgroundColor: '#f0f0f0' }]}>
                <Text style={[styles.helpTitle, { color: textColor }]}>Hướng dẫn</Text>
                <Text style={[styles.helpText, { color: mutedColor }]}>
                  • Kéo thả các block{'\n'}
                  • Click để chỉnh sửa{'\n'}
                  • Zoom với 2 ngón tay{'\n'}
                  • Nút +/− để zoom
                </Text>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvasWrapper}>
          {/* Toolbar */}
          <View style={styles.toolbar}>
            <Pressable style={[styles.toolButton, { backgroundColor: surfaceColor, borderColor }]} onPress={handleZoomIn}>
              <Ionicons name="add" size={18} color={textColor} />
            </Pressable>
            <Pressable style={[styles.toolButton, { backgroundColor: surfaceColor, borderColor }]} onPress={handleZoomOut}>
              <Ionicons name="remove" size={18} color={textColor} />
            </Pressable>
            <Pressable style={[styles.toolButton, { backgroundColor: surfaceColor, borderColor }]} onPress={handleZoomReset}>
              <Ionicons name="refresh" size={18} color={textColor} />
            </Pressable>
            
            <View style={styles.toolSpacer} />
            
            <Pressable
              style={[styles.toolButton, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() => setShowStageList(!showStageList)}
            >
              <Ionicons name="list" size={18} color={textColor} />
            </Pressable>
            <Pressable
              style={[styles.toolButton, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() => setShowDetail(!showDetail)}
            >
              <Ionicons name="information-circle" size={18} color={textColor} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            style={styles.canvasScroll}
            contentContainerStyle={styles.canvasScrollContent}
            {...panResponder.panHandlers}
          >
            <Svg
              width={CANVAS_WIDTH * scale}
              height={CANVAS_HEIGHT * scale}
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            >
              <G transform={`translate(${translateX}, ${translateY})`}>
                {/* Grid */}
                {renderGrid()}

                {/* Links */}
                <G>{renderLinks()}</G>

                {/* Stages */}
                {stages.map(stage => {
                  const progress = calcStageProgress(stage.id);
                  return (
                    <G key={stage.id} transform={`translate(${stage.x}, ${stage.y})`}>
                      {/* Stage circle */}
                      <Circle r={22} fill="#1f912c" stroke="#FFF" strokeWidth={3} />
                      <SvgText
                        y={5}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight="600"
                        fill="#FFF"
                      >
                        {stage.number}
                      </SvgText>

                      {/* Label */}
                      <SvgText
                        y={40}
                        textAnchor="middle"
                        fontSize={13}
                        fill="#333"
                      >
                        {stage.label}
                      </SvgText>

                      {/* Progress bar */}
                      <Rect x={-50} y={50} width={100} height={6} rx={3} fill="#e0e4f5" />
                      <Rect
                        x={-50}
                        y={50}
                        width={100 * progress}
                        height={6}
                        rx={3}
                        fill="#1f912c"
                      />
                      <SvgText
                        y={66}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#555"
                      >
                        {Math.round(progress * 100)}%
                      </SvgText>
                    </G>
                  );
                })}

                {/* Tasks */}
                {tasks.map(task => {
                  const config = STATUS_CONFIG[task.status];
                  const isSelected = selectedTask?.id === task.id;

                  return (
                    <G
                      key={task.id}
                      transform={`translate(${task.x}, ${task.y})`}
                      onPress={() => setSelectedTask(task)}
                    >
                      {/* Selection indicator */}
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

                      {/* Task box */}
                      <Rect
                        width={TASK_WIDTH}
                        height={TASK_HEIGHT}
                        rx={10}
                        fill={config.fill}
                        stroke={config.color}
                        strokeWidth={1.5}
                      />

                      {/* Task label */}
                      <SvgText
                        x={10}
                        y={18}
                        fontSize={12}
                        fill="#222"
                      >
                        {task.label.length > 20 ? task.label.substring(0, 20) + '...' : task.label}
                      </SvgText>

                      {/* Status */}
                      <SvgText
                        x={10}
                        y={34}
                        fontSize={11}
                        fill={config.color}
                      >
                        {config.label}
                      </SvgText>

                      {/* Status dot */}
                      <Circle cx={TASK_WIDTH - 12} cy={14} r={5} fill={config.color} />
                    </G>
                  );
                })}
              </G>
            </Svg>
          </ScrollView>
        </View>

        {/* Right Sidebar - Details */}
        {showDetail && (
          <View style={[styles.detailPanel, { backgroundColor: surfaceColor, borderLeftColor: borderColor }]}>
            <ScrollView>
              <Text style={[styles.sidebarTitle, { color: textColor }]}>Chi tiết hạng mục</Text>

              {selectedTask ? (
                <>
                  <View style={[styles.detailCard, { borderColor }]}>
                    <Text style={[styles.taskDetailName, { color: textColor }]}>
                      {selectedTask.label}
                    </Text>
                    <View style={[styles.tag, { backgroundColor: primaryColor + '20' }]}>
                      <Text style={[styles.tagText, { color: primaryColor }]}>
                        {stages.find(s => s.id === selectedTask.stageId)?.label}
                      </Text>
                    </View>

                    <Text style={[styles.label, { color: textColor }]}>Trạng thái</Text>
                    <View style={styles.statusButtons}>
                      {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(status => (
                        <Pressable
                          key={status}
                          style={[
                            styles.statusButton,
                            { borderColor },
                            selectedTask.status === status && {
                              backgroundColor: STATUS_CONFIG[status].color,
                              borderColor: STATUS_CONFIG[status].color,
                            },
                          ]}
                          onPress={() => handleUpdateTaskStatus(selectedTask.id, status)}
                        >
                          <Text
                            style={[
                              styles.statusButtonText,
                              { color: selectedTask.status === status ? '#FFF' : textColor },
                            ]}
                          >
                            {STATUS_CONFIG[status].label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={[styles.label, { color: textColor }]}>Ghi chú</Text>
                    <TextInput
                      style={[styles.notesInput, { borderColor, color: textColor }]}
                      placeholder="Thêm ghi chú..."
                      placeholderTextColor={mutedColor}
                      multiline
                      value={selectedTask.notes || ''}
                      onChangeText={text => {
                        setTasks(prev =>
                          prev.map(t => (t.id === selectedTask.id ? { ...t, notes: text } : t))
                        );
                        setSelectedTask(prev => (prev ? { ...prev, notes: text } : null));
                      }}
                    />

                    <Text style={[styles.helpText, { color: mutedColor }]}>
                      Kéo block trên sơ đồ để thay đổi vị trí
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={[styles.noSelection, { color: mutedColor }]}>
                  Chưa chọn hạng mục. Click vào block trên sơ đồ.
                </Text>
              )}

              <View style={styles.divider} />

              <Text style={[styles.sidebarTitle, { color: textColor }]}>Chú thích</Text>
              
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(status => {
                const config = STATUS_CONFIG[status];
                return (
                  <View key={status} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: config.color }]} />
                    <Text style={[styles.legendText, { color: textColor }]}>{config.label}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Thêm hạng mục mới</Text>

            <Text style={[styles.label, { color: textColor }]}>Tên hạng mục</Text>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              placeholder="VD: Thi công trần thạch cao"
              placeholderTextColor={mutedColor}
              value={newTaskName}
              onChangeText={setNewTaskName}
            />

            <Text style={[styles.label, { color: textColor }]}>Thuộc giai đoạn</Text>
            <View style={styles.stageSelect}>
              {stages.map(stage => (
                <Pressable
                  key={stage.id}
                  style={[
                    styles.stageOption,
                    { borderColor },
                    newTaskStage === stage.id && { backgroundColor: primaryColor, borderColor: primaryColor },
                  ]}
                  onPress={() => setNewTaskStage(stage.id)}
                >
                  <Text
                    style={[
                      styles.stageOptionText,
                      { color: newTaskStage === stage.id ? '#FFF' : textColor },
                    ]}
                  >
                    {stage.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: textColor }]}>Ghi chú (tuỳ chọn)</Text>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              placeholder="VD: Ưu tiên xong trong tháng 12"
              placeholderTextColor={mutedColor}
              multiline
              numberOfLines={3}
              value={newTaskNotes}
              onChangeText={setNewTaskNotes}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { borderColor }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: primaryColor }]}
                onPress={handleAddTask}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Thêm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  progressLow: {
    backgroundColor: '#ffebee',
  },
  progressMedium: {
    backgroundColor: '#F0F8FF',
  },
  progressHigh: {
    backgroundColor: '#e8f5e9',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  stageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  stagePercent: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e4f0',
    marginVertical: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 999,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  helpBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
  },
  toolbar: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toolSpacer: {
    width: 8,
  },
  canvasScroll: {
    flex: 1,
  },
  canvasScrollContent: {
    padding: 20,
  },
  detailPanel: {
    width: 280,
    borderLeftWidth: 1,
    padding: 16,
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  taskDetailName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 11,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    marginTop: 8,
  },
  statusButtons: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 12,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  noSelection: {
    fontSize: 13,
    textAlign: 'center',
    padding: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  stageSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  stageOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  stageOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
