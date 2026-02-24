import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

// Types
type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed';
type AreaStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed';
type AreaType = 'floor' | 'column' | 'wall' | 'beam' | 'room';

type Task = {
  id: string;
  name: string;
  status: TaskStatus;
  assignedWorker?: string;
  completedAt?: string;
};

type FloorArea = {
  id: string;
  code: string;
  name: string;
  type: AreaType;
  x: number;
  y: number;
  width: number;
  height: number;
  progress: number;
  status: AreaStatus;
  tasks: Task[];
};

type BuildingFloor = {
  id: string;
  level: number;
  name: string;
  height: number;
  areas: FloorArea[];
  overallProgress: number;
};

// Initial mock data
const INITIAL_FLOORS: BuildingFloor[] = [
  {
    id: 'ground',
    level: 0,
    name: 'Tầng trệt',
    height: 4.0,
    overallProgress: 50,
    areas: [
      {
        id: 'f1',
        code: 'F1',
        name: 'Phòng khách',
        type: 'floor',
        x: 100,
        y: 100,
        width: 180,
        height: 140,
        progress: 60,
        status: 'in-progress',
        tasks: [
          { id: 't1', name: 'Xây tường', status: 'completed' },
          { id: 't2', name: 'Tô tường', status: 'in-progress' },
          { id: 't3', name: 'Lát gạch', status: 'not-started' },
        ],
      },
    ],
  },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const GRID_SIZE = 30;

export default function MinimapEditorScreen() {
  const params = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const [floors, setFloors] = useState<BuildingFloor[]>(INITIAL_FLOORS);
  const [selectedFloor, setSelectedFloor] = useState<BuildingFloor>(INITIAL_FLOORS[0]);
  const [selectedArea, setSelectedArea] = useState<FloorArea | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Modals
  const [showNewAreaModal, setShowNewAreaModal] = useState(false);
  const [showEditAreaModal, setShowEditAreaModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWorkerAssignModal, setShowWorkerAssignModal] = useState(false);

  // Form states
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCode, setNewAreaCode] = useState('');
  const [newAreaType, setNewAreaType] = useState<AreaType>('room');
  const [editingProgress, setEditingProgress] = useState('0');
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [workerName, setWorkerName] = useState('');

  // Colors
  const COLORS = {
    completed: '#14B159',
    inProgress: '#FFA84D',
    notStarted: '#E5E7EB',
    delayed: '#E82A34',
    border: '#9CA3AF',
    selected: '#0D9488',
    drawing: '#666666',
  };

  const getStatusColor = (status: AreaStatus) => {
    switch (status) {
      case 'completed': return COLORS.completed;
      case 'in-progress': return COLORS.inProgress;
      case 'delayed': return COLORS.delayed;
      default: return COLORS.notStarted;
    }
  };

  // Handle drawing new area with drag
  const handleCanvasPanStart = (x: number, y: number) => {
    setIsDrawing(true);
    setDrawStart({ x, y });
    setDrawEnd({ x, y });
  };

  const handleCanvasPanMove = (x: number, y: number) => {
    if (isDrawing && drawStart) {
      setDrawEnd({ x, y });
    }
  };

  const handleCanvasPanEnd = () => {
    if (isDrawing && drawStart && drawEnd) {
      // Calculate area dimensions
      const width = Math.abs(drawEnd.x - drawStart.x);
      const height = Math.abs(drawEnd.y - drawStart.y);
      
      // Minimum size check
      if (width > 20 && height > 20) {
        setShowNewAreaModal(true);
      } else {
        Alert.alert('Khu vực quá nhỏ', 'Vui lòng vẽ khu vực lớn hơn');
      }
    }
    setIsDrawing(false);
  };

  // Create new area
  const handleCreateArea = () => {
    if (!newAreaName || !newAreaCode || !drawStart || !drawEnd) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const x = Math.min(drawStart.x, drawEnd.x);
    const y = Math.min(drawStart.y, drawEnd.y);
    const width = Math.abs(drawEnd.x - drawStart.x);
    const height = Math.abs(drawEnd.y - drawStart.y);

    const newArea: FloorArea = {
      id: `area_${Date.now()}`,
      code: newAreaCode,
      name: newAreaName,
      type: newAreaType,
      x,
      y,
      width,
      height,
      progress: 0,
      status: 'not-started',
      tasks: [],
    };

    // Update selected floor
    const updatedFloors = floors.map(floor => {
      if (floor.id === selectedFloor.id) {
        return {
          ...floor,
          areas: [...floor.areas, newArea],
        };
      }
      return floor;
    });

    setFloors(updatedFloors);
    setSelectedFloor(updatedFloors.find(f => f.id === selectedFloor.id)!);
    
    // Reset
    setShowNewAreaModal(false);
    setNewAreaName('');
    setNewAreaCode('');
    setNewAreaType('room');
    setDrawStart(null);
    setDrawEnd(null);
  };

  // Edit area progress
  const handleUpdateProgress = () => {
    if (!selectedArea) return;

    const progress = parseInt(editingProgress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      Alert.alert('Lỗi', 'Tiến độ phải từ 0-100');
      return;
    }

    // Determine status based on progress
    let status: AreaStatus = 'not-started';
    if (progress === 100) status = 'completed';
    else if (progress > 0) status = 'in-progress';

    const updatedFloors = floors.map(floor => {
      if (floor.id === selectedFloor.id) {
        return {
          ...floor,
          areas: floor.areas.map(area => {
            if (area.id === selectedArea.id) {
              return { ...area, progress, status };
            }
            return area;
          }),
        };
      }
      return floor;
    });

    setFloors(updatedFloors);
    setSelectedFloor(updatedFloors.find(f => f.id === selectedFloor.id)!);
    setShowEditAreaModal(false);
    setSelectedArea(null);
  };

  // Add task to area
  const handleAddTask = () => {
    if (!selectedArea || !newTaskName) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên công việc');
      return;
    }

    const newTask: Task = {
      id: `task_${Date.now()}`,
      name: newTaskName,
      status: 'not-started',
    };

    const updatedFloors = floors.map(floor => {
      if (floor.id === selectedFloor.id) {
        return {
          ...floor,
          areas: floor.areas.map(area => {
            if (area.id === selectedArea.id) {
              return {
                ...area,
                tasks: [...area.tasks, newTask],
              };
            }
            return area;
          }),
        };
      }
      return floor;
    });

    setFloors(updatedFloors);
    setSelectedFloor(updatedFloors.find(f => f.id === selectedFloor.id)!);
    setNewTaskName('');
    setShowTaskModal(false);
  };

  // Toggle task completion
  const handleToggleTaskStatus = (task: Task) => {
    if (!selectedArea) return;

    const newStatus: TaskStatus = 
      task.status === 'completed' ? 'in-progress' : 
      task.status === 'in-progress' ? 'completed' : 
      task.status === 'not-started' ? 'in-progress' : 'not-started';

    const updatedFloors = floors.map(floor => {
      if (floor.id === selectedFloor.id) {
        return {
          ...floor,
          areas: floor.areas.map(area => {
            if (area.id === selectedArea.id) {
              return {
                ...area,
                tasks: area.tasks.map(t => {
                  if (t.id === task.id) {
                    return {
                      ...t,
                      status: newStatus,
                      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
                    };
                  }
                  return t;
                }),
              };
            }
            return area;
          }),
        };
      }
      return floor;
    });

    setFloors(updatedFloors);
    setSelectedFloor(updatedFloors.find(f => f.id === selectedFloor.id)!);
  };

  // Assign worker to task
  const handleAssignWorker = () => {
    if (!selectedTask || !selectedArea || !workerName) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thợ');
      return;
    }

    const updatedFloors = floors.map(floor => {
      if (floor.id === selectedFloor.id) {
        return {
          ...floor,
          areas: floor.areas.map(area => {
            if (area.id === selectedArea.id) {
              return {
                ...area,
                tasks: area.tasks.map(t => {
                  if (t.id === selectedTask.id) {
                    return { ...t, assignedWorker: workerName };
                  }
                  return t;
                }),
              };
            }
            return area;
          }),
        };
      }
      return floor;
    });

    setFloors(updatedFloors);
    setSelectedFloor(updatedFloors.find(f => f.id === selectedFloor.id)!);
    setShowWorkerAssignModal(false);
    setSelectedTask(null);
    setWorkerName('');
  };

  // Delete area
  const handleDeleteArea = (area: FloorArea) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa khu vực "${area.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const updatedFloors = floors.map(floor => {
              if (floor.id === selectedFloor.id) {
                return {
                  ...floor,
                  areas: floor.areas.filter(a => a.id !== area.id),
                };
              }
              return floor;
            });
            setFloors(updatedFloors);
            setSelectedFloor(updatedFloors.find(f => f.id === selectedFloor.id)!);
          },
        },
      ]
    );
  };

  // Render grid
  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i <= SVG_WIDTH; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`v${i}`}
          x1={i}
          y1={0}
          x2={i}
          y2={SVG_HEIGHT}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }
    for (let i = 0; i <= SVG_HEIGHT; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`h${i}`}
          x1={0}
          y1={i}
          x2={SVG_WIDTH}
          y2={i}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }
    return lines;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Chỉnh sửa Minimap',
          headerBackTitle: 'Quay lại',
          headerRight: () => (
            <Pressable onPress={() => Alert.alert('Lưu', 'Dữ liệu đã được lưu!')}>
              <Ionicons name="save-outline" size={24} color={primaryColor} />
            </Pressable>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor }]}>
        {/* Toolbar */}
        <View style={[styles.toolbar, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
          <Text style={[styles.toolbarTitle, { color: textColor }]}>
            {selectedFloor.name}
          </Text>
          <View style={styles.toolbarActions}>
            <Pressable
              style={[styles.toolButton, { backgroundColor: primaryColor }]}
              onPress={() => setIsDrawing(true)}
            >
              <MaterialCommunityIcons name="vector-square" size={20} color="#FFF" />
              <Text style={styles.toolButtonText}>Vẽ khu vực</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Canvas */}
          <View style={[styles.canvasContainer, { backgroundColor: '#F9FAFB' }]}>
            <Text style={[styles.instruction, { color: mutedColor }]}>
              {isDrawing ? 'Kéo để vẽ khu vực mới' : 'Nhấn "Vẽ khu vực" rồi kéo trên canvas'}
            </Text>
            
            <Svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
              {/* Grid */}
              {renderGrid()}

              {/* Existing areas */}
              {selectedFloor.areas.map(area => (
                <React.Fragment key={area.id}>
                  <Rect
                    x={area.x}
                    y={area.y}
                    width={area.width}
                    height={area.height}
                    fill={getStatusColor(area.status)}
                    fillOpacity={0.3}
                    stroke={selectedArea?.id === area.id ? COLORS.selected : getStatusColor(area.status)}
                    strokeWidth={selectedArea?.id === area.id ? 3 : 2}
                    onPress={() => setSelectedArea(area)}
                  />
                  <SvgText
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2}
                    fontSize={12}
                    fontWeight="bold"
                    fill="#374151"
                    textAnchor="middle"
                  >
                    {area.code}
                  </SvgText>
                  <SvgText
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2 + 15}
                    fontSize={10}
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    {area.progress}%
                  </SvgText>
                </React.Fragment>
              ))}

              {/* Drawing preview */}
              {isDrawing && drawStart && drawEnd && (
                <Rect
                  x={Math.min(drawStart.x, drawEnd.x)}
                  y={Math.min(drawStart.y, drawEnd.y)}
                  width={Math.abs(drawEnd.x - drawStart.x)}
                  height={Math.abs(drawEnd.y - drawStart.y)}
                  fill={COLORS.drawing}
                  fillOpacity={0.2}
                  stroke={COLORS.drawing}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
            </Svg>
          </View>

          {/* Selected area details */}
          {selectedArea && (
            <View style={[styles.detailsCard, { backgroundColor: surfaceColor }]}>
              <View style={styles.detailsHeader}>
                <View>
                  <Text style={[styles.detailsTitle, { color: textColor }]}>
                    {selectedArea.code} - {selectedArea.name}
                  </Text>
                  <Text style={[styles.detailsSubtitle, { color: mutedColor }]}>
                    Tiến độ: {selectedArea.progress}%
                  </Text>
                </View>
                <Pressable onPress={() => handleDeleteArea(selectedArea)}>
                  <Ionicons name="trash-outline" size={24} color="#E82A34" />
                </Pressable>
              </View>

              {/* Action buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.actionButton, { borderColor }]}
                  onPress={() => {
                    setEditingProgress(selectedArea.progress.toString());
                    setShowEditAreaModal(true);
                  }}
                >
                  <Ionicons name="trending-up-outline" size={20} color={primaryColor} />
                  <Text style={[styles.actionButtonText, { color: primaryColor }]}>
                    Cập nhật tiến độ
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, { borderColor }]}
                  onPress={() => setShowTaskModal(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={primaryColor} />
                  <Text style={[styles.actionButtonText, { color: primaryColor }]}>
                    Thêm công việc
                  </Text>
                </Pressable>
              </View>

              {/* Tasks list */}
              <Text style={[styles.sectionTitle, { color: textColor }]}>Công việc</Text>
              {selectedArea.tasks.length === 0 ? (
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  Chưa có công việc nào
                </Text>
              ) : (
                selectedArea.tasks.map(task => (
                  <View key={task.id} style={[styles.taskItem, { borderColor }]}>
                    <Pressable
                      style={styles.taskCheckbox}
                      onPress={() => handleToggleTaskStatus(task)}
                    >
                      <Ionicons
                        name={
                          task.status === 'completed'
                            ? 'checkmark-circle'
                            : 'ellipse-outline'
                        }
                        size={24}
                        color={
                          task.status === 'completed'
                            ? COLORS.completed
                            : task.status === 'in-progress'
                            ? COLORS.inProgress
                            : COLORS.notStarted
                        }
                      />
                    </Pressable>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskName, { color: textColor }]}>
                        {task.name}
                      </Text>
                      {task.assignedWorker && (
                        <Text style={[styles.taskWorker, { color: mutedColor }]}>
                          Thợ: {task.assignedWorker}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => {
                        setSelectedTask(task);
                        setWorkerName(task.assignedWorker || '');
                        setShowWorkerAssignModal(true);
                      }}
                    >
                      <Ionicons name="person-add-outline" size={20} color={primaryColor} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* New Area Modal */}
        <Modal
          visible={showNewAreaModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNewAreaModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Tạo khu vực mới</Text>

              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="Mã khu vực (VD: F1, C1, W1)"
                placeholderTextColor={mutedColor}
                value={newAreaCode}
                onChangeText={setNewAreaCode}
              />

              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="Tên khu vực (VD: Phòng khách)"
                placeholderTextColor={mutedColor}
                value={newAreaName}
                onChangeText={setNewAreaName}
              />

              <Text style={[styles.label, { color: textColor }]}>Loại khu vực:</Text>
              <View style={styles.typeButtons}>
                {(['room', 'floor', 'column', 'wall', 'beam'] as AreaType[]).map(type => (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeButton,
                      { borderColor },
                      newAreaType === type && { backgroundColor: primaryColor },
                    ]}
                    onPress={() => setNewAreaType(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: newAreaType === type ? '#FFF' : textColor },
                      ]}
                    >
                      {type === 'room' ? 'Phòng' :
                       type === 'floor' ? 'Sàn' :
                       type === 'column' ? 'Cột' :
                       type === 'wall' ? 'Tường' : 'Dầm'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, { borderColor }]}
                  onPress={() => setShowNewAreaModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: textColor }]}>Hủy</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: primaryColor }]}
                  onPress={handleCreateArea}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Tạo</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Progress Modal */}
        <Modal
          visible={showEditAreaModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditAreaModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Cập nhật tiến độ</Text>

              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="Tiến độ (0-100)"
                placeholderTextColor={mutedColor}
                keyboardType="number-pad"
                value={editingProgress}
                onChangeText={setEditingProgress}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, { borderColor }]}
                  onPress={() => setShowEditAreaModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: textColor }]}>Hủy</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: primaryColor }]}
                  onPress={handleUpdateProgress}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Cập nhật</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Task Modal */}
        <Modal
          visible={showTaskModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTaskModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Thêm công việc</Text>

              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="Tên công việc (VD: Xây tường)"
                placeholderTextColor={mutedColor}
                value={newTaskName}
                onChangeText={setNewTaskName}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, { borderColor }]}
                  onPress={() => setShowTaskModal(false)}
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

        {/* Assign Worker Modal */}
        <Modal
          visible={showWorkerAssignModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWorkerAssignModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Phân công thợ</Text>

              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="Tên thợ (VD: Nguyễn Văn A)"
                placeholderTextColor={mutedColor}
                value={workerName}
                onChangeText={setWorkerName}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, { borderColor }]}
                  onPress={() => setShowWorkerAssignModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: textColor }]}>Hủy</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: primaryColor }]}
                  onPress={handleAssignWorker}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Phân công</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  toolbarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toolButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  canvasContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  taskCheckbox: {
    padding: 4,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  taskWorker: {
    fontSize: 13,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
