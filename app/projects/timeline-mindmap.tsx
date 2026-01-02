/**
 * Timeline Mindmap Screen
 * Interactive construction progress visualization with mindmap
 * Features: drag-drop nodes, vector connections, 3 layers, CRUD operations
 * 
 * Layers:
 * - Progress Line: Milestones, phases, checkpoints
 * - Content Line: Tasks, subtasks (construction work)
 * - Todos Line: Action items, assignments
 */

import {
    MindmapFAB,
    MindmapNodeComponent,
    NodeEditor,
    TodoEditor,
    TodoItem,
    ZoomControls
} from '@/components/project/mindmap-components';
import { useAuth } from '@/context/AuthContext';
import {
    calculateMindmapProgress,
    CustomerProject,
    generateConnectionId,
    generateNodeId,
    getLayerYPosition,
    getMindmapPermission,
    getNodesByLayer,
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
    Animated,
    Dimensions,
    FlatList,
    PanResponder,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Marker, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Canvas dimensions
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;

// Theme colors
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

// Mock data for demo
const MOCK_PROJECT: CustomerProject = {
  id: 'proj1',
  customerId: 'cust1',
  customerName: 'Nguyễn Văn A',
  name: 'Biệt thự Vinhomes Grand Park',
  description: 'Xây dựng biệt thự 3 tầng phong cách hiện đại',
  address: 'Quận 9, TP.HCM',
  projectType: 'VILLA',
  status: 'IN_PROGRESS',
  progressPercent: 65,
  estimatedBudget: 5500000000,
  plannedStartDate: '2024-01-15',
  plannedEndDate: '2024-12-31',
  actualStartDate: '2024-01-20',
  coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
  assignedContractors: [
    {
      id: 'c1',
      userId: 'u3',
      userName: 'Công ty XD ABC',
      companyName: 'Công ty TNHH ABC',
      phone: '0901234567',
      role: 'CONTRACTOR',
      assignedAt: '2024-01-15',
      assignedBy: 'u1',
    },
  ],
  totalNodes: 15,
  completedNodes: 8,
  totalTodos: 10,
  completedTodos: 6,
  createdAt: '2024-01-10',
  updatedAt: '2024-12-20',
};

const MOCK_NODES: MindmapNode[] = [
  // START node
  {
    id: 'start',
    projectId: 'proj1',
    name: 'Bắt đầu',
    type: 'START',
    layer: 'PROGRESS',
    status: 'COMPLETED',
    position: { x: 100, y: 100 },
    progressPercent: 100,
    connectedTo: ['phase1'],
    connectedFrom: [],
    images: [],
    order: 0,
    createdBy: 'u1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  // Phase 1
  {
    id: 'phase1',
    projectId: 'proj1',
    name: 'Giai đoạn 1: Móng',
    type: 'PHASE',
    layer: 'PROGRESS',
    status: 'COMPLETED',
    position: { x: 300, y: 100 },
    duration: '1 Month',
    durationDays: 30,
    progressPercent: 100,
    connectedTo: ['phase2'],
    connectedFrom: ['start'],
    images: [],
    order: 1,
    createdBy: 'u1',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-15',
  },
  // Phase 2
  {
    id: 'phase2',
    projectId: 'proj1',
    name: 'Giai đoạn 2: Thân',
    type: 'PHASE',
    layer: 'PROGRESS',
    status: 'IN_PROGRESS',
    position: { x: 550, y: 100 },
    duration: '3 Month',
    durationDays: 90,
    progressPercent: 60,
    connectedTo: ['phase3'],
    connectedFrom: ['phase1'],
    images: [],
    order: 2,
    createdBy: 'u1',
    createdAt: '2024-02-15',
    updatedAt: '2024-12-20',
  },
  // Task: Xây Tường
  {
    id: 'task1',
    projectId: 'proj1',
    name: 'Xây Tường',
    description: 'Xây tường gạch đỏ tầng 1',
    location: 'F1',
    type: 'TASK',
    layer: 'CONTENT',
    status: 'COMPLETED',
    position: { x: 200, y: 250 },
    duration: '2 Week',
    durationDays: 14,
    progressPercent: 100,
    connectedTo: ['task2'],
    connectedFrom: ['phase1'],
    reportUrl: 'https://example.com/report1',
    notes: 'Hoàn thành đúng tiến độ',
    images: ['https://picsum.photos/200'],
    order: 1,
    createdBy: 'u1',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-14',
  },
  // Task: Xây dựng cột
  {
    id: 'task2',
    projectId: 'proj1',
    name: 'Xây dựng cột',
    description: 'Dựng cột bê tông chịu lực',
    location: 'F1C1',
    type: 'TASK',
    layer: 'CONTENT',
    status: 'COMPLETED',
    position: { x: 400, y: 250 },
    duration: '10 Day',
    durationDays: 10,
    progressPercent: 100,
    connectedTo: ['task3'],
    connectedFrom: ['task1'],
    images: ['https://picsum.photos/201'],
    order: 2,
    createdBy: 'u1',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-25',
  },
  // Task: Bắn Laser
  {
    id: 'task3',
    projectId: 'proj1',
    name: 'Bắn Laser',
    description: 'Laser định vị mực xây',
    location: 'W1',
    type: 'TASK',
    layer: 'CONTENT',
    status: 'IN_PROGRESS',
    position: { x: 600, y: 250 },
    duration: '1 Day',
    durationDays: 1,
    progressPercent: 50,
    connectedTo: ['task4'],
    connectedFrom: ['task2'],
    images: [],
    order: 3,
    createdBy: 'u1',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-20',
  },
  // Task: Ván khuôn
  {
    id: 'task4',
    projectId: 'proj1',
    name: 'Ván khuôn',
    description: 'Lắp đặt ván khuôn dầm sàn',
    location: 'W3',
    type: 'TASK',
    layer: 'CONTENT',
    status: 'NOT_STARTED',
    position: { x: 800, y: 250 },
    duration: '1 Week',
    durationDays: 7,
    progressPercent: 0,
    connectedTo: [],
    connectedFrom: ['task3'],
    images: [],
    order: 4,
    createdBy: 'u1',
    createdAt: '2024-12-19',
    updatedAt: '2024-12-19',
  },
  // Task: Làm thép
  {
    id: 'task5',
    projectId: 'proj1',
    name: 'Làm thép',
    description: 'Gia công cốt thép dầm sàn',
    location: 'WB1',
    type: 'TASK',
    layer: 'CONTENT',
    status: 'NOT_STARTED',
    position: { x: 600, y: 350 },
    duration: '5 Day',
    durationDays: 5,
    progressPercent: 0,
    connectedTo: ['task4'],
    connectedFrom: [],
    images: [],
    order: 5,
    createdBy: 'u1',
    createdAt: '2024-12-19',
    updatedAt: '2024-12-19',
  },
  // Phase 3
  {
    id: 'phase3',
    projectId: 'proj1',
    name: 'Giai đoạn 3: Hoàn thiện',
    type: 'PHASE',
    layer: 'PROGRESS',
    status: 'NOT_STARTED',
    position: { x: 800, y: 100 },
    duration: '2 Month',
    durationDays: 60,
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
    projectId: 'proj1',
    name: 'Hoàn thành',
    type: 'END',
    layer: 'PROGRESS',
    status: 'NOT_STARTED',
    position: { x: 1000, y: 100 },
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

const MOCK_CONNECTIONS: NodeConnection[] = [
  {
    id: 'conn1',
    projectId: 'proj1',
    fromNodeId: 'start',
    toNodeId: 'phase1',
    type: 'SEQUENCE',
    style: 'SOLID',
    color: '#2196F3',
    createdBy: 'u1',
    createdAt: '2024-01-15',
  },
  {
    id: 'conn2',
    projectId: 'proj1',
    fromNodeId: 'phase1',
    toNodeId: 'phase2',
    type: 'SEQUENCE',
    style: 'SOLID',
    color: '#2196F3',
    createdBy: 'u1',
    createdAt: '2024-01-15',
  },
  {
    id: 'conn3',
    projectId: 'proj1',
    fromNodeId: 'phase2',
    toNodeId: 'phase3',
    type: 'SEQUENCE',
    style: 'SOLID',
    color: '#2196F3',
    createdBy: 'u1',
    createdAt: '2024-01-15',
  },
  {
    id: 'conn4',
    projectId: 'proj1',
    fromNodeId: 'phase3',
    toNodeId: 'end',
    type: 'SEQUENCE',
    style: 'SOLID',
    color: '#2196F3',
    createdBy: 'u1',
    createdAt: '2024-01-15',
  },
  {
    id: 'conn5',
    projectId: 'proj1',
    fromNodeId: 'task1',
    toNodeId: 'task2',
    type: 'SEQUENCE',
    style: 'SOLID',
    color: '#FF9800',
    createdBy: 'u1',
    createdAt: '2024-02-01',
  },
  {
    id: 'conn6',
    projectId: 'proj1',
    fromNodeId: 'task2',
    toNodeId: 'task3',
    type: 'SEQUENCE',
    style: 'SOLID',
    color: '#FF9800',
    createdBy: 'u1',
    createdAt: '2024-02-15',
  },
  {
    id: 'conn7',
    projectId: 'proj1',
    fromNodeId: 'task3',
    toNodeId: 'task4',
    type: 'SEQUENCE',
    style: 'SOLID',
    color: '#FF9800',
    createdBy: 'u1',
    createdAt: '2024-12-18',
  },
  {
    id: 'conn8',
    projectId: 'proj1',
    fromNodeId: 'task5',
    toNodeId: 'task4',
    type: 'DEPENDENCY',
    style: 'DASHED',
    color: '#F44336',
    label: 'Phụ thuộc',
    createdBy: 'u1',
    createdAt: '2024-12-19',
  },
];

const MOCK_TODOS: ProjectTodo[] = [
  {
    id: 'todo1',
    projectId: 'proj1',
    nodeId: 'task3',
    title: 'Kiểm tra thiết bị laser',
    description: 'Đảm bảo máy laser hoạt động chính xác',
    status: 'DONE',
    priority: 'HIGH',
    createdBy: 'u1',
    createdByName: 'Quản lý A',
    assignedTo: 'u3',
    assignedToName: 'Nhà thầu B',
    assignedToRole: 'CONTRACTOR',
    dueDate: '2024-12-19',
    completedAt: '2024-12-19',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-19',
  },
  {
    id: 'todo2',
    projectId: 'proj1',
    nodeId: 'task4',
    title: 'Đặt mua ván khuôn',
    description: 'Liên hệ nhà cung cấp và đặt hàng',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    createdBy: 'u1',
    createdByName: 'Quản lý A',
    assignedTo: 'u3',
    assignedToName: 'Nhà thầu B',
    assignedToRole: 'CONTRACTOR',
    dueDate: '2024-12-20',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-20',
  },
  {
    id: 'todo3',
    projectId: 'proj1',
    nodeId: 'task5',
    title: 'Chuẩn bị thép cốt',
    description: 'Kiểm tra và cắt thép theo bản vẽ',
    status: 'TODO',
    priority: 'MEDIUM',
    createdBy: 'u1',
    createdByName: 'Quản lý A',
    assignedTo: 'u3',
    assignedToName: 'Nhà thầu B',
    assignedToRole: 'CONTRACTOR',
    dueDate: '2024-12-22',
    createdAt: '2024-12-19',
    updatedAt: '2024-12-19',
  },
  {
    id: 'todo4',
    projectId: 'proj1',
    title: 'Báo cáo tiến độ tuần',
    description: 'Tổng hợp và gửi báo cáo cho khách hàng',
    status: 'TODO',
    priority: 'LOW',
    createdBy: 'u1',
    createdByName: 'Quản lý A',
    dueDate: '2024-12-23',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-20',
  },
];

export default function TimelineMindmapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<CustomerProject | null>(null);
  const [nodes, setNodes] = useState<MindmapNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [todos, setTodos] = useState<ProjectTodo[]>([]);
  
  // View state
  const [zoom, setZoom] = useState(0.8);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<MindmapLayer | 'ALL'>('ALL');
  const [editMode, setEditMode] = useState(false);
  
  // Layer expansion state
  const [expandedLayers, setExpandedLayers] = useState({
    PROGRESS: true,
    CONTENT: true,
    TODOS: true,
  });
  
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
  const [userRole, setUserRole] = useState<MindmapRole>('MANAGER'); // Default, will be determined by actual user
  const permission = useMemo(() => getMindmapPermission(userRole), [userRole]);
  
  // Animated values for pan
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  
  // Pan responder for canvas
  const canvasPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !draggingNodeId,
      onMoveShouldSetPanResponder: () => !draggingNodeId,
      onPanResponderMove: (_, gesture) => {
        if (!draggingNodeId) {
          setPanOffset(prev => ({
            x: prev.x + gesture.dx * 0.5,
            y: prev.y + gesture.dy * 0.5,
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
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProject(MOCK_PROJECT);
      setNodes(MOCK_NODES);
      setConnections(MOCK_CONNECTIONS);
      setTodos(MOCK_TODOS);
      
      // Determine user role based on project membership
      // For demo, using MANAGER role
      setUserRole('MANAGER');
    } catch (error) {
      console.error('Error loading mindmap data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu dự án');
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
      // Create connection
      handleCreateConnection(connectFromNode, nodeId);
      setConnectMode(false);
      setConnectFromNode(null);
    } else if (connectMode) {
      // Set from node
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
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, position } : n
    ));
  };
  
  const handleNodeDragEnd = () => {
    setDraggingNodeId(null);
    // TODO: Save new position to API
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
            setConnections(prev => prev.filter(
              c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
            ));
            setSelectedNodeId(null);
            // TODO: Delete from API
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
        name: data.name || 'New Node',
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
      setNodes(prev => prev.map(n => 
        n.id === editingNode.id
          ? { ...n, ...data, updatedAt: new Date().toISOString() }
          : n
      ));
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
    
    const existingConnection = connections.find(
      c => c.fromNodeId === fromNodeId && c.toNodeId === toNodeId
    );
    if (existingConnection) {
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
      color: COLORS.contentLayer,
      createdBy: user?.id || 'unknown',
      createdAt: new Date().toISOString(),
    };
    
    setConnections(prev => [...prev, newConnection]);
    
    // Update node connections
    setNodes(prev => prev.map(n => {
      if (n.id === fromNodeId) {
        return { ...n, connectedTo: [...n.connectedTo, toNodeId] };
      }
      if (n.id === toNodeId) {
        return { ...n, connectedFrom: [...n.connectedFrom, fromNodeId] };
      }
      return n;
    }));
  };
  
  const handleDeleteConnection = (connectionId: string) => {
    const conn = connections.find(c => c.id === connectionId);
    if (conn) {
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      setNodes(prev => prev.map(n => {
        if (n.id === conn.fromNodeId) {
          return { ...n, connectedTo: n.connectedTo.filter(id => id !== conn.toNodeId) };
        }
        if (n.id === conn.toNodeId) {
          return { ...n, connectedFrom: n.connectedFrom.filter(id => id !== conn.fromNodeId) };
        }
        return n;
      }));
    }
    setSelectedConnectionId(null);
  };
  
  // Todo operations
  const handleTodoStatusChange = (todoId: string, status: TodoStatus) => {
    setTodos(prev => prev.map(t => 
      t.id === todoId
        ? { 
            ...t, 
            status, 
            completedAt: status === 'DONE' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        : t
    ));
  };
  
  const handleSaveTodo = (data: Partial<ProjectTodo>) => {
    if (editorMode === 'create') {
      const newTodo: ProjectTodo = {
        id: `todo_${Date.now()}`,
        projectId: project?.id || '',
        title: data.title || 'New Todo',
        description: data.description,
        status: 'TODO',
        priority: data.priority || 'MEDIUM',
        createdBy: user?.id || 'unknown',
        createdByName: user?.name || 'Unknown',
        assignedTo: data.assignedTo,
        assignedToName: data.assignedToName,
        dueDate: data.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTodos(prev => [...prev, newTodo]);
    } else if (editingTodo) {
      setTodos(prev => prev.map(t => 
        t.id === editingTodo.id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t
      ));
    }
    setTodoEditorVisible(false);
    setEditingTodo(undefined);
  };
  
  const handleDeleteTodo = (todoId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa todo này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setTodos(prev => prev.filter(t => t.id !== todoId));
          },
        },
      ]
    );
  };
  
  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleZoomReset = () => {
    setZoom(0.8);
    setPanOffset({ x: 0, y: 0 });
  };
  
  // Filtered nodes by layer
  const progressNodes = useMemo(() => getNodesByLayer(nodes, 'PROGRESS'), [nodes]);
  const contentNodes = useMemo(() => getNodesByLayer(nodes, 'CONTENT'), [nodes]);
  const todosNodes = useMemo(() => getNodesByLayer(nodes, 'TODOS'), [nodes]);
  
  // Calculate project progress
  const calculatedProgress = useMemo(() => calculateMindmapProgress(nodes), [nodes]);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải mindmap...</Text>
      </SafeAreaView>
    );
  }
  
  if (!project) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Không tìm thấy dự án</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Tiến độ dự án',
          headerTitleStyle: { fontSize: 16, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={[styles.headerButton, editMode && styles.headerButtonActive]}
                onPress={() => setEditMode(!editMode)}
              >
                <Ionicons 
                  name={editMode ? 'lock-open' : 'lock-closed'} 
                  size={20} 
                  color={editMode ? COLORS.primary : COLORS.textSecondary} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      {/* Project Info Header */}
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.projectAddress} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            {' '}{project.address}
          </Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressValue}>{calculatedProgress}%</Text>
          <Text style={styles.progressLabel}>Tiến độ</Text>
        </View>
      </View>
      
      {/* Layer Tabs */}
      <View style={styles.layerTabs}>
        <TouchableOpacity
          style={[styles.layerTab, activeLayer === 'ALL' && styles.layerTabActive]}
          onPress={() => setActiveLayer('ALL')}
        >
          <Text style={[styles.layerTabText, activeLayer === 'ALL' && styles.layerTabTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.layerTab, activeLayer === 'PROGRESS' && styles.layerTabActive]}
          onPress={() => setActiveLayer('PROGRESS')}
        >
          <View style={[styles.layerDot, { backgroundColor: COLORS.progressLayer }]} />
          <Text style={[styles.layerTabText, activeLayer === 'PROGRESS' && styles.layerTabTextActive]}>
            Tiến độ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.layerTab, activeLayer === 'CONTENT' && styles.layerTabActive]}
          onPress={() => setActiveLayer('CONTENT')}
        >
          <View style={[styles.layerDot, { backgroundColor: COLORS.contentLayer }]} />
          <Text style={[styles.layerTabText, activeLayer === 'CONTENT' && styles.layerTabTextActive]}>
            Nội dung
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.layerTab, activeLayer === 'TODOS' && styles.layerTabActive]}
          onPress={() => setActiveLayer('TODOS')}
        >
          <View style={[styles.layerDot, { backgroundColor: COLORS.todosLayer }]} />
          <Text style={[styles.layerTabText, activeLayer === 'TODOS' && styles.layerTabTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Connect Mode Indicator */}
      {connectMode && (
        <View style={styles.connectModeBar}>
          <Ionicons name="link" size={16} color="#FFFFFF" />
          <Text style={styles.connectModeText}>
            {connectFromNode 
              ? 'Chọn node đích để tạo kết nối' 
              : 'Chọn node nguồn'}
          </Text>
          <TouchableOpacity 
            style={styles.connectModeCancel}
            onPress={() => {
              setConnectMode(false);
              setConnectFromNode(null);
            }}
          >
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Mindmap Canvas */}
      <ScrollView
        style={styles.canvasContainer}
        contentContainerStyle={[
          styles.canvasContent,
          { 
            width: CANVAS_WIDTH * zoom,
            height: CANVAS_HEIGHT * zoom,
            transform: [{ translateX: panOffset.x }, { translateY: panOffset.y }],
          }
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={2}
        minimumZoomScale={0.3}
        pinchGestureEnabled
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* SVG Connections Layer */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width={CANVAS_WIDTH * zoom} height={CANVAS_HEIGHT * zoom}>
            <Defs>
              {connections.map(conn => (
                <Marker
                  key={`marker-${conn.id}`}
                  id={`arrow-${conn.id}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <Path d="M0,0 L0,7 L10,3.5 z" fill={conn.color} />
                </Marker>
              ))}
            </Defs>
            
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.fromNodeId);
              const toNode = nodes.find(n => n.id === conn.toNodeId);
              if (!fromNode || !toNode) return null;
              
              // Filter by active layer
              if (activeLayer !== 'ALL') {
                if (fromNode.layer !== activeLayer && toNode.layer !== activeLayer) {
                  return null;
                }
              }
              
              const startX = fromNode.position.x * zoom;
              const startY = fromNode.position.y * zoom;
              const endX = toNode.position.x * zoom;
              const endY = toNode.position.y * zoom;
              
              // Calculate path
              const midX = (startX + endX) / 2;
              const layerDiff = Math.abs(fromNode.position.y - toNode.position.y);
              const pathD = layerDiff > 50
                ? `M ${startX} ${startY} Q ${midX} ${startY}, ${midX} ${(startY + endY) / 2} T ${endX} ${endY}`
                : `M ${startX} ${startY} L ${endX} ${endY}`;
              
              const isSelected = selectedConnectionId === conn.id;
              
              return (
                <Path
                  key={conn.id}
                  d={pathD}
                  stroke={isSelected ? COLORS.primary : conn.color}
                  strokeWidth={(isSelected ? 3 : 2) * zoom}
                  strokeDasharray={conn.style === 'DASHED' ? '8,4' : conn.style === 'DOTTED' ? '2,4' : undefined}
                  fill="none"
                  markerEnd={`url(#arrow-${conn.id})`}
                  onPress={() => setSelectedConnectionId(conn.id)}
                />
              );
            })}
          </Svg>
        </View>
        
        {/* Nodes Layer */}
        <View style={[styles.nodesLayer, { transform: [{ scale: zoom }] }]}>
          {nodes.map(node => {
            // Filter by active layer
            if (activeLayer !== 'ALL' && node.layer !== activeLayer) {
              return null;
            }
            
            const isSelected = selectedNodeId === node.id;
            const isDragging = draggingNodeId === node.id;
            
            return (
              <MindmapNodeComponent
                key={node.id}
                node={node}
                isSelected={isSelected}
                isDragging={isDragging}
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
            );
          })}
        </View>
      </ScrollView>
      
      {/* Todos List (when TODOS layer is active) */}
      {activeLayer === 'TODOS' && (
        <View style={styles.todosPanel}>
          <View style={styles.todosPanelHeader}>
            <Text style={styles.todosPanelTitle}>Danh sách Todos</Text>
            <Text style={styles.todosPanelCount}>
              {todos.filter(t => t.status === 'DONE').length}/{todos.length} hoàn thành
            </Text>
          </View>
          <FlatList
            data={todos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                permission={permission}
                onPress={() => {}}
                onStatusChange={(status) => handleTodoStatusChange(item.id, status)}
                onEdit={() => {
                  setEditingTodo(item);
                  setEditorMode('edit');
                  setTodoEditorVisible(true);
                }}
                onDelete={() => handleDeleteTodo(item.id)}
              />
            )}
            contentContainerStyle={styles.todosList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleZoomReset}
      />
      
      {/* FAB */}
      {editMode && (
        <MindmapFAB
          permission={permission}
          onAddNode={() => {
            setEditingNode(undefined);
            setEditorMode('create');
            setNodeEditorVisible(true);
          }}
          onAddTodo={() => {
            setEditingTodo(undefined);
            setEditorMode('create');
            setTodoEditorVisible(true);
          }}
          onAddConnection={() => {
            setConnectMode(true);
            setConnectFromNode(null);
          }}
        />
      )}
      
      {/* Selected Connection Actions */}
      {selectedConnectionId && (
        <View style={styles.connectionActions}>
          <TouchableOpacity 
            style={styles.connectionActionBtn}
            onPress={() => handleDeleteConnection(selectedConnectionId)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[styles.connectionActionText, { color: COLORS.error }]}>
              Xóa kết nối
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.connectionActionBtn}
            onPress={() => setSelectedConnectionId(null)}
          >
            <Ionicons name="close-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.connectionActionText}>Bỏ chọn</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Node Editor Modal */}
      <NodeEditor
        visible={nodeEditorVisible}
        node={editingNode}
        mode={editorMode}
        permission={permission}
        onSave={handleSaveNode}
        onClose={() => {
          setNodeEditorVisible(false);
          setEditingNode(undefined);
        }}
      />
      
      {/* Todo Editor Modal */}
      <TodoEditor
        visible={todoEditorVisible}
        todo={editingTodo}
        mode={editorMode}
        permission={permission}
        onSave={handleSaveTodo}
        onClose={() => {
          setTodoEditorVisible(false);
          setEditingTodo(undefined);
        }}
      />
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Header
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  headerButtonActive: {
    backgroundColor: '#FFEBE8',
  },
  
  // Project header
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  projectInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  projectAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.success,
  },
  
  // Layer tabs
  layerTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  layerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  layerTabActive: {
    backgroundColor: COLORS.background,
  },
  layerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  layerTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  layerTabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  
  // Connect mode
  connectModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
  },
  connectModeText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  connectModeCancel: {
    padding: 4,
  },
  
  // Canvas
  canvasContainer: {
    flex: 1,
  },
  canvasContent: {
    minWidth: SCREEN_WIDTH,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  nodesLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Todos panel
  todosPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.4,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  todosPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  todosPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  todosPanelCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  todosList: {
    padding: 12,
  },
  
  // Connection actions
  connectionActions: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionActionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
