/**
 * Construction Progress Mindmap Screen
 * Interactive mindmap visualization for construction project progress
 * Features: Drag-drop nodes, vector connections, 3 layers (Progress/Content/Todos)
 * Based on Shopee-style UI with construction management focus
 */

import {
    ConnectionLineComponent,
    MindmapFAB,
    MindmapNodeComponent,
    NodeEditor,
    TodoEditor,
    TodoItem,
    ZoomControls,
} from '@/components/project/mindmap-components';
import { useAuth } from '@/context/AuthContext';
import {
    ConstructionProject
} from '@/types/construction-progress';
import {
    generateConnectionId,
    generateNodeId,
    getLayerYPosition,
    getMindmapPermission,
    MindmapLayer,
    MindmapNode,
    MindmapPosition,
    MindmapRole,
    NODE_TYPE_CONFIG,
    NodeConnection,
    ProjectTodo,
    TodoStatus
} from '@/types/project-mindmap';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    PanResponder,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, G, Marker, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Canvas dimensions
const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 2000;

// Theme colors - Shopee style
const COLORS = {
  primary: '#EE4D2D',
  primaryLight: '#FF6B4D',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E0E0E0',
  success: '#14B159',
  warning: '#FF9800',
  error: '#E82A34',
  progressLayer: '#2196F3',
  contentLayer: '#FF9800',
  todosLayer: '#4CAF50',
};

// Layer heights
const LAYER_HEIGHT = 400;
const LAYER_SPACING = 100;

export default function ConstructionProgressMindmapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [nodes, setNodes] = useState<MindmapNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [todos, setTodos] = useState<ProjectTodo[]>([]);

  // View state
  const [zoom, setZoom] = useState(0.7);
  const [panOffset, setPanOffset] = useState({ x: SCREEN_WIDTH / 4, y: SCREEN_HEIGHT / 4 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<MindmapLayer | 'ALL'>('ALL');
  const [editMode, setEditMode] = useState(false);

  // Editor modals
  const [nodeEditorVisible, setNodeEditorVisible] = useState(false);
  const [todoEditorVisible, setTodoEditorVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<MindmapNode | undefined>();
  const [editingTodo, setEditingTodo] = useState<ProjectTodo | undefined>();
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Connection creation mode
  const [connectMode, setConnectMode] = useState(false);
  const [connectFromNode, setConnectFromNode] = useState<string | null>(null);

  // User role & permissions
  const [userRole, setUserRole] = useState<MindmapRole>('MANAGER');
  const permission = useMemo(() => getMindmapPermission(userRole), [userRole]);

  // Canvas pan responder
  const canvasPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !draggingNodeId,
      onMoveShouldSetPanResponder: () => !draggingNodeId,
      onPanResponderMove: (_, gesture) => {
        if (!draggingNodeId) {
          setPanOffset(prev => ({
            x: prev.x + gesture.dx * 0.8,
            y: prev.y + gesture.dy * 0.8,
          }));
        }
      },
    })
  ).current;

  // Load data
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock construction project data
      const mockProject: ConstructionProject = {
        id: id || '1',
        name: 'Biệt thự Vinhomes Grand Park',
        description: 'Xây dựng biệt thự 3 tầng phong cách hiện đại',
        address: 'Quận 9, TP.HCM',
        projectType: 'Biệt thự',
        totalArea: 450,
        totalFloors: 3,
        estimatedBudget: 5500000000,
        status: 'IN_PROGRESS',
        progressPercent: 65,
        plannedStartDate: '2024-01-15',
        plannedEndDate: '2024-12-31',
        actualStartDate: '2024-01-20',
        members: [
          { id: '1', userId: 'u1', userName: 'Nguyễn Văn A', role: 'MANAGER', assignedAt: '2024-01-15' },
          { id: '2', userId: 'u2', userName: 'Trần Văn B', role: 'ENGINEER', assignedAt: '2024-01-15' },
        ],
        ownerId: user?.id || 'u1',
        tasks: [],
        totalTasks: 10,
        completedTasks: 6,
        coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
        media: [],
        createdAt: '2024-01-10',
        updatedAt: '2024-12-25',
        createdBy: 'u1',
      };

      // Mock nodes with proper construction phases
      const mockNodes: MindmapNode[] = [
        // START node
        {
          id: 'start',
          projectId: id || '1',
          name: 'Bắt đầu dự án',
          type: 'START',
          layer: 'PROGRESS',
          status: 'COMPLETED',
          position: { x: 200, y: 250 },
          progressPercent: 100,
          connectedTo: ['phase1'],
          connectedFrom: [],
          images: [],
          order: 0,
          createdBy: 'u1',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
        // Phase 1: Foundation
        {
          id: 'phase1',
          projectId: id || '1',
          name: 'Móng & Nền',
          description: 'Thi công móng và nền công trình',
          type: 'PHASE',
          layer: 'PROGRESS',
          status: 'COMPLETED',
          position: { x: 500, y: 250 },
          duration: '45 ngày',
          durationDays: 45,
          progressPercent: 100,
          connectedTo: ['phase2'],
          connectedFrom: ['start'],
          images: [],
          order: 1,
          createdBy: 'u1',
          createdAt: '2024-01-15',
          updatedAt: '2024-03-01',
        },
        // Tasks for Phase 1
        {
          id: 'task1-1',
          projectId: id || '1',
          name: 'Đào móng',
          description: 'Đào đất và chuẩn bị móng',
          location: 'Khu A',
          type: 'TASK',
          layer: 'CONTENT',
          status: 'COMPLETED',
          position: { x: 400, y: 650 },
          duration: '10 ngày',
          progressPercent: 100,
          connectedTo: ['task1-2'],
          connectedFrom: [],
          images: [],
          order: 1,
          createdBy: 'u1',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-25',
        },
        {
          id: 'task1-2',
          projectId: id || '1',
          name: 'Đổ bê tông móng',
          description: 'Thi công đổ bê tông móng',
          location: 'Khu A',
          type: 'TASK',
          layer: 'CONTENT',
          status: 'COMPLETED',
          position: { x: 600, y: 650 },
          duration: '15 ngày',
          progressPercent: 100,
          connectedTo: [],
          connectedFrom: ['task1-1'],
          images: [],
          order: 2,
          createdBy: 'u1',
          createdAt: '2024-01-26',
          updatedAt: '2024-02-10',
        },
        // Phase 2: Structure
        {
          id: 'phase2',
          projectId: id || '1',
          name: 'Kết cấu',
          description: 'Thi công khung kết cấu bê tông',
          type: 'PHASE',
          layer: 'PROGRESS',
          status: 'IN_PROGRESS',
          position: { x: 900, y: 250 },
          duration: '60 ngày',
          durationDays: 60,
          progressPercent: 70,
          connectedTo: ['phase3'],
          connectedFrom: ['phase1'],
          images: [],
          order: 2,
          createdBy: 'u1',
          createdAt: '2024-03-02',
          updatedAt: '2024-12-25',
        },
        // Tasks for Phase 2
        {
          id: 'task2-1',
          projectId: id || '1',
          name: 'Cột tầng 1',
          description: 'Thi công cột tầng 1',
          location: 'Tầng 1',
          type: 'TASK',
          layer: 'CONTENT',
          status: 'COMPLETED',
          position: { x: 800, y: 650 },
          duration: '15 ngày',
          progressPercent: 100,
          connectedTo: ['task2-2'],
          connectedFrom: [],
          images: [],
          order: 3,
          createdBy: 'u1',
          createdAt: '2024-03-02',
          updatedAt: '2024-03-17',
        },
        {
          id: 'task2-2',
          projectId: id || '1',
          name: 'Sàn tầng 1',
          description: 'Thi công sàn tầng 1',
          location: 'Tầng 1',
          type: 'TASK',
          layer: 'CONTENT',
          status: 'IN_PROGRESS',
          position: { x: 1000, y: 650 },
          duration: '20 ngày',
          progressPercent: 60,
          connectedTo: [],
          connectedFrom: ['task2-1'],
          images: [],
          order: 4,
          createdBy: 'u1',
          createdAt: '2024-03-18',
          updatedAt: '2024-12-25',
        },
        // Phase 3: MEP
        {
          id: 'phase3',
          projectId: id || '1',
          name: 'Điện nước',
          description: 'Lắp đặt hệ thống điện nước',
          type: 'PHASE',
          layer: 'PROGRESS',
          status: 'NOT_STARTED',
          position: { x: 1300, y: 250 },
          duration: '30 ngày',
          durationDays: 30,
          progressPercent: 0,
          connectedTo: ['end'],
          connectedFrom: ['phase2'],
          images: [],
          order: 3,
          createdBy: 'u1',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
        // END node
        {
          id: 'end',
          projectId: id || '1',
          name: 'Hoàn thành',
          type: 'END',
          layer: 'PROGRESS',
          status: 'NOT_STARTED',
          position: { x: 1600, y: 250 },
          progressPercent: 0,
          connectedTo: [],
          connectedFrom: ['phase3'],
          images: [],
          order: 4,
          createdBy: 'u1',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
      ];

      // Mock connections
      const mockConnections: NodeConnection[] = [
        { id: 'c1', projectId: id || '1', fromNodeId: 'start', toNodeId: 'phase1', type: 'SEQUENCE', style: 'SOLID', color: '#2196F3', createdBy: 'u1', createdAt: '2024-01-15' },
        { id: 'c2', projectId: id || '1', fromNodeId: 'phase1', toNodeId: 'phase2', type: 'SEQUENCE', style: 'SOLID', color: '#2196F3', createdBy: 'u1', createdAt: '2024-01-15' },
        { id: 'c3', projectId: id || '1', fromNodeId: 'phase2', toNodeId: 'phase3', type: 'SEQUENCE', style: 'SOLID', color: '#2196F3', createdBy: 'u1', createdAt: '2024-01-15' },
        { id: 'c4', projectId: id || '1', fromNodeId: 'phase3', toNodeId: 'end', type: 'SEQUENCE', style: 'SOLID', color: '#2196F3', createdBy: 'u1', createdAt: '2024-01-15' },
        { id: 'c5', projectId: id || '1', fromNodeId: 'task1-1', toNodeId: 'task1-2', type: 'SEQUENCE', style: 'SOLID', color: '#2196F3', createdBy: 'u1', createdAt: '2024-01-15' },
        { id: 'c6', projectId: id || '1', fromNodeId: 'task2-1', toNodeId: 'task2-2', type: 'SEQUENCE', style: 'SOLID', color: '#2196F3', createdBy: 'u1', createdAt: '2024-01-15' },
      ];

      // Mock todos
      const mockTodos: ProjectTodo[] = [
        {
          id: 'todo1',
          projectId: id || '1',
          nodeId: 'task2-2',
          title: 'Kiểm tra cốt thép sàn',
          description: 'Kiểm tra số lượng và chất lượng cốt thép',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignedTo: 'u2',
          assignedToName: 'Trần Văn B',
          createdBy: 'u1',
          createdByName: 'Nguyễn Văn A',
          dueDate: '2024-12-26',
          createdAt: '2024-12-25',
          updatedAt: '2024-12-25',
        },
        {
          id: 'todo2',
          projectId: id || '1',
          nodeId: 'task2-2',
          title: 'Đặt hàng bê tông',
          description: 'Liên hệ nhà cung cấp đặt bê tông',
          status: 'TODO',
          priority: 'URGENT',
          assignedTo: 'u1',
          assignedToName: 'Nguyễn Văn A',
          createdBy: 'u1',
          createdByName: 'Nguyễn Văn A',
          dueDate: '2024-12-26',
          createdAt: '2024-12-25',
          updatedAt: '2024-12-25',
        },
      ];

      setProject(mockProject);
      setNodes(mockNodes);
      setConnections(mockConnections);
      setTodos(mockTodos);
      setUserRole('MANAGER');
    } catch (error) {
      console.error('Error loading mindmap data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu mindmap');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Node operations
  const handleNodePress = (nodeId: string) => {
    if (connectMode && connectFromNode) {
      handleCreateConnection(connectFromNode, nodeId);
      setConnectMode(false);
      setConnectFromNode(null);
    } else if (connectMode) {
      setConnectFromNode(nodeId);
    } else {
      setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
      setSelectedConnectionId(null);
    }
  };

  const handleNodeLongPress = (nodeId: string) => {
    if (permission.canEditNode) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setEditingNode(node);
        setEditorMode('edit');
        setNodeEditorVisible(true);
      }
    }
  };

  const handleNodeDragStart = (nodeId: string) => {
    setDraggingNodeId(nodeId);
  };

  const handleNodeDragMove = (nodeId: string, position: MindmapPosition) => {
    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, position } : n))
    );
  };

  const handleNodeDragEnd = () => {
    setDraggingNodeId(null);
  };

  const handleEditNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(node);
      setEditorMode('edit');
      setNodeEditorVisible(true);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa node này? Tất cả kết nối liên quan cũng sẽ bị xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setNodes(prev => prev.filter(n => n.id !== nodeId));
            setConnections(prev =>
              prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId)
            );
            setSelectedNodeId(null);
          },
        },
      ]
    );
  };

  const handleSaveNode = (data: Partial<MindmapNode>) => {
    if (editorMode === 'create') {
      const newNode: MindmapNode = {
        id: generateNodeId(),
        projectId: project?.id || '',
        name: data.name || 'Node mới',
        description: data.description,
        location: data.location,
        type: data.type || 'TASK',
        layer: NODE_TYPE_CONFIG[data.type || 'TASK'].layer,
        status: 'NOT_STARTED',
        position: {
          x: 500 + Math.random() * 200,
          y: getLayerYPosition(NODE_TYPE_CONFIG[data.type || 'TASK'].layer),
        },
        duration: data.duration,
        progressPercent: 0,
        connectedTo: [],
        connectedFrom: [],
        images: [],
        order: nodes.length,
        notes: data.notes,
        createdBy: user?.id || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNodes(prev => [...prev, newNode]);
    } else if (editingNode) {
      setNodes(prev =>
        prev.map(n =>
          n.id === editingNode.id
            ? { ...n, ...data, updatedAt: new Date().toISOString() }
            : n
        )
      );
    }
    setNodeEditorVisible(false);
    setEditingNode(undefined);
  };

  // Connection operations
  const handleCreateConnection = (fromNodeId: string, toNodeId: string) => {
    if (fromNodeId === toNodeId) {
      Alert.alert('Lỗi', 'Không thể kết nối node với chính nó');
      return;
    }

    const exists = connections.find(
      c => c.fromNodeId === fromNodeId && c.toNodeId === toNodeId
    );
    if (exists) {
      Alert.alert('Lỗi', 'Kết nối này đã tồn tại');
      return;
    }

    const newConnection: NodeConnection = {
      id: generateConnectionId(),
      projectId: project?.id || '',
      fromNodeId,
      toNodeId,
      type: 'SEQUENCE',
      style: 'SOLID',
      color: '#2196F3',
      createdBy: user?.id || 'unknown',
      createdAt: new Date().toISOString(),
    };

    setConnections(prev => [...prev, newConnection]);
    setNodes(prev =>
      prev.map(n => {
        if (n.id === fromNodeId) {
          return { ...n, connectedTo: [...n.connectedTo, toNodeId] };
        }
        if (n.id === toNodeId) {
          return { ...n, connectedFrom: [...n.connectedFrom, fromNodeId] };
        }
        return n;
      })
    );
  };

  const handleDeleteConnection = (connectionId: string) => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) return;

    setConnections(prev => prev.filter(c => c.id !== connectionId));
    setNodes(prev =>
      prev.map(n => {
        if (n.id === conn.fromNodeId) {
          return { ...n, connectedTo: n.connectedTo.filter(id => id !== conn.toNodeId) };
        }
        if (n.id === conn.toNodeId) {
          return { ...n, connectedFrom: n.connectedFrom.filter(id => id !== conn.fromNodeId) };
        }
        return n;
      })
    );
    setSelectedConnectionId(null);
  };

  // Todo operations
  const handleCreateTodo = () => {
    setEditingTodo(undefined);
    setEditorMode('create');
    setTodoEditorVisible(true);
  };

  const handleEditTodo = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      setEditingTodo(todo);
      setEditorMode('edit');
      setTodoEditorVisible(true);
    }
  };

  const handleSaveTodo = (data: Partial<ProjectTodo>) => {
    if (editorMode === 'create') {
      const newTodo: ProjectTodo = {
        id: `todo${Date.now()}`,
        projectId: project?.id || '',
        nodeId: data.nodeId,
        title: data.title || 'Todo mới',
        description: data.description,
        status: 'TODO',
        priority: data.priority || 'MEDIUM',
        assignedTo: data.assignedTo,
        assignedToName: data.assignedToName,
        createdBy: user?.id || 'unknown',
        createdByName: user?.name || 'Unknown',
        dueDate: data.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTodos(prev => [...prev, newTodo]);
    } else if (editingTodo) {
      setTodos(prev =>
        prev.map(t =>
          t.id === editingTodo.id
            ? { ...t, ...data, updatedAt: new Date().toISOString() }
            : t
        )
      );
    }
    setTodoEditorVisible(false);
    setEditingTodo(undefined);
  };

  const handleToggleTodo = (todoId: string) => {
    setTodos(prev =>
      prev.map(t =>
        t.id === todoId
          ? {
              ...t,
              status: (t.status === 'DONE' ? 'TODO' : 'DONE') as TodoStatus,
              completedAt: t.status === 'DONE' ? undefined : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleResetZoom = () => {
    setZoom(0.7);
    setPanOffset({ x: SCREEN_WIDTH / 4, y: SCREEN_HEIGHT / 4 });
  };

  // Filter nodes by layer
  const visibleNodes = useMemo(() => {
    if (activeLayer === 'ALL') return nodes;
    return nodes.filter(n => n.layer === activeLayer);
  }, [nodes, activeLayer]);

  // Render SVG connections
  const renderConnections = () => {
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.fromNodeId);
      const toNode = nodes.find(n => n.id === conn.toNodeId);
      if (!fromNode || !toNode) return null;

      if (activeLayer !== 'ALL' && fromNode.layer !== toNode.layer) return null;

      const isSelected = selectedConnectionId === conn.id;

      return (
        <ConnectionLineComponent
          key={conn.id}
          connection={conn}
          fromNode={fromNode}
          toNode={toNode}
          isSelected={isSelected}
          onSelect={() => setSelectedConnectionId(conn.id)}
          scale={zoom}
        />
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải mindmap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: project?.name || 'Mindmap tiến độ',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setEditMode(!editMode)}
              >
                <Ionicons
                  name={editMode ? 'checkmark' : 'pencil'}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Canvas container */}
      <View style={styles.canvasContainer} {...canvasPanResponder.panHandlers}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: CANVAS_WIDTH * zoom,
            height: CANVAS_HEIGHT * zoom,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: [
                { translateX: panOffset.x },
                { translateY: panOffset.y },
                { scale: zoom },
              ],
            }}
          >
            {/* Layer backgrounds */}
            <View style={[styles.layerBg, { top: 150, backgroundColor: `${COLORS.progressLayer}10` }]}>
              <Text style={[styles.layerLabel, { color: COLORS.progressLayer }]}>
                Tiến độ chung
              </Text>
            </View>
            <View style={[styles.layerBg, { top: 550, backgroundColor: `${COLORS.contentLayer}10` }]}>
              <Text style={[styles.layerLabel, { color: COLORS.contentLayer }]}>
                Công việc chi tiết
              </Text>
            </View>
            <View style={[styles.layerBg, { top: 950, backgroundColor: `${COLORS.todosLayer}10` }]}>
              <Text style={[styles.layerLabel, { color: COLORS.todosLayer }]}>
                Việc cần làm
              </Text>
            </View>

            {/* SVG Connections */}
            <Svg
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <Defs>
                <Marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <Path d="M0,0 L0,6 L9,3 z" fill={COLORS.textMuted} />
                </Marker>
              </Defs>
              <G>{renderConnections()}</G>
            </Svg>

            {/* Nodes */}
            {visibleNodes.map(node => (
              <MindmapNodeComponent
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isDragging={draggingNodeId === node.id}
                permission={permission}
                onPress={() => handleNodePress(node.id)}
                onLongPress={() => handleNodeLongPress(node.id)}
                onDragStart={() => handleNodeDragStart(node.id)}
                onDragMove={(pos) => handleNodeDragMove(node.id, pos)}
                onDragEnd={handleNodeDragEnd}
                onEdit={() => handleEditNode(node.id)}
                onDelete={() => handleDeleteNode(node.id)}
                scale={zoom}
              />
            ))}

            {/* Todos layer */}
            <View style={styles.todosContainer}>
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onPress={() => handleEditTodo(todo.id)}
                  onStatusChange={(status) => {
                    setTodos(prev =>
                      prev.map(t =>
                        t.id === todo.id
                          ? {
                              ...t,
                              status,
                              completedAt: status === 'DONE' ? new Date().toISOString() : undefined,
                              updatedAt: new Date().toISOString(),
                            }
                          : t
                      )
                    );
                  }}
                  onEdit={() => handleEditTodo(todo.id)}
                  onDelete={() => setTodos(prev => prev.filter(t => t.id !== todo.id))}
                  permission={permission}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Zoom controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
      />

      {/* Layer filter */}
      <View style={styles.layerFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['ALL', 'PROGRESS', 'CONTENT', 'TODOS'] as const).map(layer => (
            <TouchableOpacity
              key={layer}
              style={[
                styles.layerBtn,
                activeLayer === layer && styles.layerBtnActive,
              ]}
              onPress={() => setActiveLayer(layer)}
            >
              <Text
                style={[
                  styles.layerBtnText,
                  activeLayer === layer && styles.layerBtnTextActive,
                ]}
              >
                {layer === 'ALL' ? 'Tất cả' : layer === 'PROGRESS' ? 'Tiến độ' : layer === 'CONTENT' ? 'Công việc' : 'Todos'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FAB */}
      <MindmapFAB
        permission={permission}
        onAddNode={() => {
          setEditingNode(undefined);
          setEditorMode('create');
          setNodeEditorVisible(true);
        }}
        onAddTodo={handleCreateTodo}
        onAddConnection={() => {
          setConnectMode(!connectMode);
          setConnectFromNode(null);
        }}
      />

      {/* Node Editor Modal */}
      <NodeEditor
        visible={nodeEditorVisible}
        mode={editorMode}
        node={editingNode}
        onClose={() => {
          setNodeEditorVisible(false);
          setEditingNode(undefined);
        }}
        onSave={handleSaveNode}
        permission={permission}
      />

      {/* Todo Editor Modal */}
      <TodoEditor
        visible={todoEditorVisible}
        mode={editorMode}
        todo={editingTodo}
        onClose={() => {
          setTodoEditorVisible(false);
          setEditingTodo(undefined);
        }}
        onSave={handleSaveTodo}
        permission={permission}
      />

      {/* Connect mode indicator */}
      {connectMode && (
        <View style={styles.connectIndicator}>
          <Ionicons name="git-branch" size={20} color="#FFF" />
          <Text style={styles.connectText}>
            {connectFromNode ? 'Chọn node đích' : 'Chọn node nguồn'}
          </Text>
          <TouchableOpacity onPress={() => {
            setConnectMode(false);
            setConnectFromNode(null);
          }}>
            <Ionicons name="close-circle" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  canvasContainer: {
    flex: 1,
  },
  layerBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: LAYER_HEIGHT,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  layerLabel: {
    position: 'absolute',
    top: 16,
    left: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  todosContainer: {
    position: 'absolute',
    left: 1800,
    top: 950,
    width: 400,
    gap: 12,
  },
  layerFilter: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  layerBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  layerBtnActive: {
    backgroundColor: COLORS.primary,
  },
  layerBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  layerBtnTextActive: {
    color: '#FFF',
  },
  connectIndicator: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  connectText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
