/**
 * Project Mindmap Components
 * Interactive mindmap visualization with drag-drop, vector connections
 * Supports 3 layers: Progress, Content, Todos
 * 
 * Components:
 * - MindmapCanvas: Main container with zoom/pan
 * - MindmapNode: Individual node with status styling
 * - ConnectionLine: SVG vector line between nodes
 * - NodeEditor: Modal for editing node details
 * - LayerHeader: Header for each layer
 * - TodoItem: Todo item in the todos layer
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Defs, Marker, Path } from 'react-native-svg';

import {
    CONNECTION_TYPE_CONFIG,
    MindmapLayer,
    MindmapNode as MindmapNodeType,
    MindmapPermission,
    MindmapPosition,
    NODE_STATUS_CONFIG,
    NODE_TYPE_CONFIG,
    NodeConnection,
    NodeStatus,
    NodeType,
    ProjectTodo,
    TODO_PRIORITY_CONFIG,
    TODO_STATUS_CONFIG,
    TodoPriority,
    TodoStatus
} from '@/types/project-mindmap';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Theme colors based on user mockup
const COLORS = {
  primary: '#0066CC',
  primaryLight: '#3399FF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E0E0E0',
  
  // Node colors from mockup
  nodeBrown: '#D39878',
  nodeRed: '#E82A34',
  nodeOrange: '#FFA84D',
  nodeGreen: '#14B159',
  nodeGreenBadge: '#4AA14A',
  nodePurple: '#999999',
  nodeBlue: '#0066CC',
  nodeGray: '#999999',
  
  // Layer colors
  progressLayer: '#0066CC',
  contentLayer: '#0066CC',
  todosLayer: '#0066CC',
};

// ==================== MINDMAP NODE COMPONENT ====================

interface MindmapNodeProps {
  node: MindmapNodeType;
  isSelected: boolean;
  isDragging: boolean;
  permission: MindmapPermission;
  onPress: () => void;
  onLongPress: () => void;
  onDragStart: () => void;
  onDragMove: (position: MindmapPosition) => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  scale: number;
}

export const MindmapNodeComponent: React.FC<MindmapNodeProps> = ({
  node,
  isSelected,
  isDragging,
  permission,
  onPress,
  onLongPress,
  onDragStart,
  onDragMove,
  onDragEnd,
  onEdit,
  onDelete,
  scale,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: node.position.x, y: node.position.y })).current;
  const statusConfig = NODE_STATUS_CONFIG[node.status];
  const typeConfig = NODE_TYPE_CONFIG[node.type];
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => permission.canDragNode,
      onMoveShouldSetPanResponder: () => permission.canDragNode,
      onPanResponderGrant: () => {
        onDragStart();
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: (_, gesture) => {
        const newX = node.position.x + gesture.dx / scale;
        const newY = node.position.y + gesture.dy / scale;
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_, gesture);
        onDragMove({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        onDragEnd();
      },
    })
  ).current;
  
  // Determine node size based on type
  const getNodeSize = () => {
    switch (node.type) {
      case 'START':
      case 'END':
        return { width: 80, height: 80, borderRadius: 40 };
      case 'MILESTONE':
      case 'CHECKPOINT':
        return { width: 100, height: 100, borderRadius: 50 };
      case 'PHASE':
        return { width: 140, height: 60, borderRadius: 12 };
      case 'TASK':
        return { width: 160, height: 120, borderRadius: 12 };
      case 'SUBTASK':
        return { width: 140, height: 100, borderRadius: 10 };
      case 'TODO':
        return { width: 150, height: 80, borderRadius: 8 };
      default:
        return { width: 140, height: 100, borderRadius: 12 };
    }
  };
  
  const nodeSize = getNodeSize();
  
  return (
    <Animated.View
      style={[
        styles.nodeContainer,
        {
          position: 'absolute',
          left: node.position.x - nodeSize.width / 2,
          top: node.position.y - nodeSize.height / 2,
          width: nodeSize.width,
          height: nodeSize.height,
          borderRadius: nodeSize.borderRadius,
          backgroundColor: statusConfig.bgColor,
          borderWidth: isSelected ? 3 : 2,
          borderColor: isSelected ? COLORS.primary : statusConfig.borderColor,
          opacity: isDragging ? 0.7 : 1,
          transform: [{ scale: isDragging ? 1.05 : 1 }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.nodeContent}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        {/* Location badge */}
        {node.location && (
          <View style={[styles.locationBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.locationText}>{node.location}</Text>
          </View>
        )}
        
        {/* Node icon */}
        <View style={[styles.nodeIcon, { backgroundColor: statusConfig.color }]}>
          <Ionicons 
            name={typeConfig.icon as any} 
            size={node.type === 'TASK' ? 20 : 16} 
            color="#FFFFFF" 
          />
        </View>
        
        {/* Node name */}
        <Text 
          style={[styles.nodeName, { color: COLORS.text }]} 
          numberOfLines={2}
        >
          {node.name}
        </Text>
        
        {/* Duration */}
        {node.duration && (
          <Text style={styles.nodeDuration}>{node.duration}</Text>
        )}
        
        {/* Progress bar for tasks */}
        {(node.type === 'TASK' || node.type === 'SUBTASK') && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${node.progressPercent}%`,
                    backgroundColor: statusConfig.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{node.progressPercent}%</Text>
          </View>
        )}
        
        {/* Action buttons row */}
        {node.type === 'TASK' && (
          <View style={styles.actionRow}>
            {node.reportUrl && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.actionText}>Report</Text>
              </TouchableOpacity>
            )}
            {node.notes && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.actionText}>Note</Text>
              </TouchableOpacity>
            )}
            {node.images.length > 0 && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="image-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.actionText}>{node.images.length}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Status indicator */}
        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
      </TouchableOpacity>
      
      {/* Edit/Delete buttons when selected */}
      {isSelected && (
        <View style={styles.nodeActions}>
          {permission.canEditNode && (
            <TouchableOpacity style={styles.nodeActionBtn} onPress={onEdit}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {permission.canDeleteNode && (
            <TouchableOpacity 
              style={[styles.nodeActionBtn, { backgroundColor: COLORS.nodeRed }]} 
              onPress={onDelete}
            >
              <Ionicons name="trash" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

// ==================== CONNECTION LINE COMPONENT ====================

interface ConnectionLineProps {
  connection: NodeConnection;
  fromNode: MindmapNodeType;
  toNode: MindmapNodeType;
  isSelected: boolean;
  onSelect: () => void;
  scale: number;
}

export const ConnectionLineComponent: React.FC<ConnectionLineProps> = ({
  connection,
  fromNode,
  toNode,
  isSelected,
  onSelect,
  scale,
}) => {
  const config = CONNECTION_TYPE_CONFIG[connection.type];
  
  // Calculate line points
  const startX = fromNode.position.x;
  const startY = fromNode.position.y;
  const endX = toNode.position.x;
  const endY = toNode.position.y;
  
  // Calculate control points for curved line
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Generate path based on style
  let pathD: string;
  if (connection.controlPoints) {
    // Custom bezier curve
    const { cp1, cp2 } = connection.controlPoints;
    pathD = `M ${startX} ${startY} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endX} ${endY}`;
  } else {
    // Auto curve based on layer difference
    const layerDiff = toNode.position.y - fromNode.position.y;
    if (Math.abs(layerDiff) > 50) {
      // Curved line for cross-layer connections
      const cp1x = startX + (endX - startX) * 0.3;
      const cp1y = startY;
      const cp2x = startX + (endX - startX) * 0.7;
      const cp2y = endY;
      pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
    } else {
      // Straight line for same layer
      pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
    }
  }
  
  // Get stroke dash array based on style
  const getStrokeDashArray = () => {
    switch (connection.style) {
      case 'DASHED': return '8,4';
      case 'DOTTED': return '2,4';
      default: return undefined;
    }
  };
  
  return (
    <TouchableOpacity
      style={StyleSheet.absoluteFill}
      onPress={onSelect}
      activeOpacity={1}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Marker
            id={`arrow-${connection.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <Path
              d="M0,0 L0,7 L10,3.5 z"
              fill={connection.color || config.color}
            />
          </Marker>
        </Defs>
        
        {/* Main path */}
        <Path
          d={pathD}
          stroke={isSelected ? COLORS.primary : (connection.color || config.color)}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={getStrokeDashArray()}
          fill="none"
          markerEnd={`url(#arrow-${connection.id})`}
        />
        
        {/* Invisible wider touch area */}
        <Path
          d={pathD}
          stroke="transparent"
          strokeWidth={20}
          fill="none"
        />
      </Svg>
      
      {/* Connection label */}
      {connection.label && (
        <View 
          style={[
            styles.connectionLabel,
            { 
              left: midX - 30, 
              top: midY - 10,
              backgroundColor: connection.color || config.color,
            }
          ]}
        >
          <Text style={styles.connectionLabelText}>{connection.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ==================== LAYER HEADER COMPONENT ====================

interface LayerHeaderProps {
  layer: MindmapLayer;
  nodeCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const LayerHeader: React.FC<LayerHeaderProps> = ({
  layer,
  nodeCount,
  isExpanded,
  onToggle,
}) => {
  const getLayerConfig = () => {
    switch (layer) {
      case 'PROGRESS':
        return { 
          label: 'Đường tiến độ', 
          color: COLORS.progressLayer, 
          icon: 'flag-outline' 
        };
      case 'CONTENT':
        return { 
          label: 'Đường nội dung', 
          color: COLORS.contentLayer, 
          icon: 'construct-outline' 
        };
      case 'TODOS':
        return { 
          label: 'Đường todos', 
          color: COLORS.todosLayer, 
          icon: 'checkbox-outline' 
        };
    }
  };
  
  const config = getLayerConfig();
  
  return (
    <TouchableOpacity style={styles.layerHeader} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.layerHeaderLeft}>
        <View style={[styles.layerIcon, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.layerTitle}>{config.label}</Text>
        <View style={[styles.layerBadge, { backgroundColor: config.color }]}>
          <Text style={styles.layerBadgeText}>{nodeCount}</Text>
        </View>
      </View>
      <Ionicons 
        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
        size={20} 
        color={COLORS.textSecondary} 
      />
    </TouchableOpacity>
  );
};

// ==================== TODO ITEM COMPONENT ====================

interface TodoItemProps {
  todo: ProjectTodo;
  permission: MindmapPermission;
  onPress: () => void;
  onStatusChange: (status: TodoStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  permission,
  onPress,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const statusConfig = TODO_STATUS_CONFIG[todo.status];
  const priorityConfig = TODO_PRIORITY_CONFIG[todo.priority];
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'DONE';
  
  return (
    <TouchableOpacity 
      style={[
        styles.todoItem,
        { borderLeftColor: priorityConfig.color },
        isOverdue && styles.todoItemOverdue,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.todoCheckbox,
          todo.status === 'DONE' && styles.todoCheckboxDone,
          { borderColor: statusConfig.color },
        ]}
        onPress={() => {
          if (permission.canCompleteTodo) {
            onStatusChange(todo.status === 'DONE' ? 'TODO' : 'DONE');
          }
        }}
        disabled={!permission.canCompleteTodo}
      >
        {todo.status === 'DONE' && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      
      {/* Content */}
      <View style={styles.todoContent}>
        <Text 
          style={[
            styles.todoTitle,
            todo.status === 'DONE' && styles.todoTitleDone,
          ]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>
        
        <View style={styles.todoMeta}>
          {/* Priority */}
          <View style={[styles.todoPriority, { backgroundColor: priorityConfig.bgColor }]}>
            <Ionicons name={priorityConfig.icon as any} size={10} color={priorityConfig.color} />
            <Text style={[styles.todoPriorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
          
          {/* Due date */}
          {todo.dueDate && (
            <View style={[styles.todoDueDate, isOverdue && styles.todoDueDateOverdue]}>
              <Ionicons 
                name="calendar-outline" 
                size={10} 
                color={isOverdue ? COLORS.nodeRed : COLORS.textSecondary} 
              />
              <Text 
                style={[
                  styles.todoDueDateText,
                  isOverdue && { color: COLORS.nodeRed },
                ]}
              >
                {new Date(todo.dueDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
          
          {/* Assignee */}
          {todo.assignedToName && (
            <View style={styles.todoAssignee}>
              <Ionicons name="person-outline" size={10} color={COLORS.textSecondary} />
              <Text style={styles.todoAssigneeText}>{todo.assignedToName}</Text>
            </View>
          )}
        </View>
        
        {/* Checklist progress */}
        {todo.checklist && todo.checklist.length > 0 && (
          <View style={styles.todoChecklist}>
            <Ionicons name="list-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.todoChecklistText}>
              {todo.checklist.filter(c => c.completed).length}/{todo.checklist.length}
            </Text>
          </View>
        )}
      </View>
      
      {/* Actions */}
      <View style={styles.todoActions}>
        {permission.canEditTodo && (
          <TouchableOpacity style={styles.todoActionBtn} onPress={onEdit}>
            <Ionicons name="pencil-outline" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        {permission.canDeleteTodo && (
          <TouchableOpacity style={styles.todoActionBtn} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={COLORS.nodeRed} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ==================== NODE EDITOR MODAL ====================

interface NodeEditorProps {
  visible: boolean;
  node?: MindmapNodeType;
  mode: 'create' | 'edit';
  permission: MindmapPermission;
  onSave: (data: Partial<MindmapNodeType>) => void;
  onClose: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({
  visible,
  node,
  mode,
  permission,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(node?.name || '');
  const [description, setDescription] = useState(node?.description || '');
  const [location, setLocation] = useState(node?.location || '');
  const [duration, setDuration] = useState(node?.duration || '');
  const [nodeType, setNodeType] = useState<NodeType>(node?.type || 'TASK');
  const [status, setStatus] = useState<NodeStatus>(node?.status || 'NOT_STARTED');
  const [notes, setNotes] = useState(node?.notes || '');
  
  const handleSave = () => {
    onSave({
      name,
      description,
      location,
      duration,
      type: nodeType,
      status,
      notes,
    });
  };
  
  const nodeTypes: NodeType[] = ['TASK', 'SUBTASK', 'MILESTONE', 'PHASE', 'CHECKPOINT', 'TODO'];
  const statuses: NodeStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'PENDING_CHECK', 'COMPLETED', 'APPROVED', 'ON_HOLD'];
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'create' ? 'Tạo Node mới' : 'Chỉnh sửa Node'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên công việc *</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="VD: Xây tường"
              />
            </View>
            
            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Vị trí (F1, W1, ...)</Text>
              <TextInput
                style={styles.formInput}
                value={location}
                onChangeText={setLocation}
                placeholder="VD: F1C1"
              />
            </View>
            
            {/* Duration */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Thời gian</Text>
              <TextInput
                style={styles.formInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="VD: 2 Day, 1 Week"
              />
            </View>
            
            {/* Node Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loại Node</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {nodeTypes.map((type) => {
                    const config = NODE_TYPE_CONFIG[type];
                    const isActive = nodeType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeChip,
                          isActive && { backgroundColor: config.defaultColor },
                        ]}
                        onPress={() => setNodeType(type)}
                      >
                        <Ionicons 
                          name={config.icon as any} 
                          size={14} 
                          color={isActive ? '#FFFFFF' : config.defaultColor} 
                        />
                        <Text 
                          style={[
                            styles.typeChipText,
                            isActive && { color: '#FFFFFF' },
                          ]}
                        >
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
            
            {/* Status */}
            {mode === 'edit' && permission.canUpdateStatus && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Trạng thái</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {statuses.map((s) => {
                      const config = NODE_STATUS_CONFIG[s];
                      const isActive = status === s;
                      return (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.statusChip,
                            { borderColor: config.color },
                            isActive && { backgroundColor: config.bgColor },
                          ]}
                          onPress={() => setStatus(s)}
                        >
                          <Ionicons 
                            name={config.icon as any} 
                            size={12} 
                            color={config.color} 
                          />
                          <Text style={[styles.statusChipText, { color: config.color }]}>
                            {config.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
            
            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô tả</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả chi tiết..."
                multiline
                numberOfLines={3}
              />
            </View>
            
            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Ghi chú thêm..."
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>
          
          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, !name && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={!name}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {mode === 'create' ? 'Tạo' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== TODO EDITOR MODAL ====================

interface TodoEditorProps {
  visible: boolean;
  todo?: ProjectTodo;
  mode: 'create' | 'edit';
  permission: MindmapPermission;
  onSave: (data: Partial<ProjectTodo>) => void;
  onClose: () => void;
}

export const TodoEditor: React.FC<TodoEditorProps> = ({
  visible,
  todo,
  mode,
  permission,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority || 'MEDIUM');
  const [status, setStatus] = useState<TodoStatus>(todo?.status || 'TODO');
  const [dueDate, setDueDate] = useState(todo?.dueDate || '');
  
  const handleSave = () => {
    onSave({
      title,
      description,
      priority,
      status,
      dueDate: dueDate || undefined,
    });
  };
  
  const priorities: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const statuses: TodoStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'create' ? 'Tạo Todo mới' : 'Chỉnh sửa Todo'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tiêu đề *</Text>
              <TextInput
                style={styles.formInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Việc cần làm..."
              />
            </View>
            
            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Độ ưu tiên</Text>
              <View style={styles.chipContainer}>
                {priorities.map((p) => {
                  const config = TODO_PRIORITY_CONFIG[p];
                  const isActive = priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityChip,
                        { borderColor: config.color },
                        isActive && { backgroundColor: config.bgColor },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Ionicons 
                        name={config.icon as any} 
                        size={12} 
                        color={config.color} 
                      />
                      <Text style={[styles.priorityChipText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            
            {/* Status (only in edit mode) */}
            {mode === 'edit' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Trạng thái</Text>
                <View style={styles.chipContainer}>
                  {statuses.map((s) => {
                    const config = TODO_STATUS_CONFIG[s];
                    const isActive = status === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusChip,
                          { borderColor: config.color },
                          isActive && { backgroundColor: config.bgColor },
                        ]}
                        onPress={() => setStatus(s)}
                      >
                        <Ionicons 
                          name={config.icon as any} 
                          size={12} 
                          color={config.color} 
                        />
                        <Text style={[styles.statusChipText, { color: config.color }]}>
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            
            {/* Due Date */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hạn hoàn thành</Text>
              <TextInput
                style={styles.formInput}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô tả</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Chi tiết việc cần làm..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
          
          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, !title && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={!title}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {mode === 'create' ? 'Tạo' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== START/END NODE BADGES ====================

interface StartEndBadgeProps {
  type: 'START' | 'END';
  date?: string;
  position: MindmapPosition;
}

export const StartEndBadge: React.FC<StartEndBadgeProps> = ({ type, date, position }) => {
  const isStart = type === 'START';
  
  return (
    <View 
      style={[
        styles.startEndBadge,
        { 
          left: position.x - 30,
          top: position.y - 20,
          backgroundColor: isStart ? COLORS.nodeGreen : COLORS.nodeRed,
        }
      ]}
    >
      <Ionicons 
        name={isStart ? 'play' : 'stop'} 
        size={14} 
        color="#FFFFFF" 
      />
      <Text style={styles.startEndText}>{isStart ? 'Start' : 'End'}</Text>
    </View>
  );
};

// ==================== ORDER BADGE (01, 02, 03...) ====================

interface OrderBadgeProps {
  order: number;
  color: string;
  position: MindmapPosition;
}

export const OrderBadge: React.FC<OrderBadgeProps> = ({ order, color, position }) => {
  return (
    <View 
      style={[
        styles.orderBadge,
        { 
          left: position.x - 15,
          top: position.y - 15,
          backgroundColor: color,
        }
      ]}
    >
      <Text style={styles.orderText}>
        {order.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

// ==================== ZOOM CONTROLS ====================

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <View style={styles.zoomControls}>
      <TouchableOpacity style={styles.zoomButton} onPress={onZoomIn}>
        <Ionicons name="add" size={20} color={COLORS.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.zoomReset} onPress={onReset}>
        <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.zoomButton} onPress={onZoomOut}>
        <Ionicons name="remove" size={20} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
};

// ==================== FLOATING ACTION BUTTON ====================

interface FABProps {
  permission: MindmapPermission;
  onAddNode: () => void;
  onAddTodo: () => void;
  onAddConnection: () => void;
}

export const MindmapFAB: React.FC<FABProps> = ({
  permission,
  onAddNode,
  onAddTodo,
  onAddConnection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <View style={styles.fabContainer}>
      {isOpen && (
        <>
          {permission.canCreateNode && (
            <TouchableOpacity 
              style={[styles.fabSecondary, { bottom: 180 }]} 
              onPress={() => { onAddNode(); setIsOpen(false); }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.fabSecondaryText}>Node</Text>
            </TouchableOpacity>
          )}
          {permission.canCreateTodo && (
            <TouchableOpacity 
              style={[styles.fabSecondary, { bottom: 130 }]} 
              onPress={() => { onAddTodo(); setIsOpen(false); }}
            >
              <Ionicons name="checkbox-outline" size={20} color="#FFFFFF" />
              <Text style={styles.fabSecondaryText}>Todo</Text>
            </TouchableOpacity>
          )}
          {permission.canConnectNodes && (
            <TouchableOpacity 
              style={[styles.fabSecondary, { bottom: 80 }]} 
              onPress={() => { onAddConnection(); setIsOpen(false); }}
            >
              <MaterialCommunityIcons name="vector-line" size={20} color="#FFFFFF" />
              <Text style={styles.fabSecondaryText}>Connect</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      <TouchableOpacity 
        style={[styles.fabMain, isOpen && styles.fabMainOpen]} 
        onPress={() => setIsOpen(!isOpen)}
      >
        <Ionicons name={isOpen ? 'close' : 'add'} size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // Node styles
  nodeContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeContent: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBadge: {
    position: 'absolute',
    top: -8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  nodeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  nodeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  nodeDuration: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginLeft: 4,
    width: 28,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeActions: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
    gap: 4,
  },
  nodeActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Connection styles
  connectionLabel: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  connectionLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Layer header styles
  layerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  layerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  layerBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  layerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Todo styles
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todoItemOverdue: {
    backgroundColor: '#FFF5F5',
  },
  todoCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  todoCheckboxDone: {
    backgroundColor: COLORS.nodeGreen,
    borderColor: COLORS.nodeGreen,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  todoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  todoPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todoPriorityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  todoDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  todoDueDateOverdue: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todoDueDateText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  todoAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  todoAssigneeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  todoChecklist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  todoChecklistText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  todoActions: {
    flexDirection: 'row',
    gap: 4,
  },
  todoActionBtn: {
    padding: 4,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Start/End badge
  startEndBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  startEndText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Order badge
  orderBadge: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Zoom controls
  zoomControls: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomReset: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  zoomText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
  fabMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  fabMainOpen: {
    backgroundColor: COLORS.nodeRed,
  },
  fabSecondary: {
    position: 'absolute',
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: COLORS.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fabSecondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default {
  MindmapNodeComponent,
  ConnectionLineComponent,
  LayerHeader,
  TodoItem,
  NodeEditor,
  TodoEditor,
  StartEndBadge,
  OrderBadge,
  ZoomControls,
  MindmapFAB,
};
