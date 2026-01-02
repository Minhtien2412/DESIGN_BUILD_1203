/**
 * Project Mindmap Types
 * Hệ thống quản lý dự án dạng mindmap với phân quyền chuyên sâu
 * Bao gồm: Customer-Project hierarchy, Timeline mindmap, Todos management
 * 
 * Key Features:
 * - Manager → Customer list → Projects (like Shopee seller view)
 * - Contractor only sees assigned projects
 * - Interactive mindmap with drag-drop, vector connections
 * - 3 layers: Progress Line, Content Line, Todos Line
 */

// ==================== EXTENDED ROLE SYSTEM ====================

export type MindmapRole = 
  | 'ADMIN'        // Full system access - CRUD all
  | 'MANAGER'      // Quản lý dự án - CRUD projects, assign work
  | 'ENGINEER'     // Kỹ sư - Edit progress, check quality
  | 'CONTRACTOR'   // Nhà thầu - Only assigned tasks, mark complete
  | 'WORKER'       // Công nhân - View assigned, report progress
  | 'CLIENT'       // Khách hàng - View own projects, approve
  | 'VIEWER';      // Chỉ xem

export interface MindmapPermission {
  // Project level
  canViewAllProjects: boolean;     // Xem tất cả dự án
  canViewAssignedOnly: boolean;    // Chỉ xem dự án được giao
  canCreateProject: boolean;       // Tạo dự án mới
  canEditProject: boolean;         // Chỉnh sửa dự án
  canDeleteProject: boolean;       // Xóa dự án
  
  // Customer level
  canViewAllCustomers: boolean;    // Xem tất cả khách hàng
  canManageCustomers: boolean;     // Quản lý khách hàng
  
  // Node level
  canCreateNode: boolean;          // Tạo node mới
  canEditNode: boolean;            // Chỉnh sửa node
  canDeleteNode: boolean;          // Xóa node
  canDragNode: boolean;            // Kéo thả node
  canConnectNodes: boolean;        // Tạo kết nối giữa nodes
  
  // Todo level
  canCreateTodo: boolean;          // Tạo todo/plan
  canEditTodo: boolean;            // Chỉnh sửa todo
  canDeleteTodo: boolean;          // Xóa todo
  canCompleteTodo: boolean;        // Đánh dấu hoàn thành
  canAssignTodo: boolean;          // Phân công todo
  
  // Status & Progress
  canUpdateStatus: boolean;        // Cập nhật trạng thái
  canUpdateProgress: boolean;      // Cập nhật tiến độ
  canApprove: boolean;             // Phê duyệt/nghiệm thu
  canReject: boolean;              // Từ chối
  
  // Media & Comments
  canUploadMedia: boolean;         // Upload ảnh/video
  canComment: boolean;             // Bình luận
  canViewReport: boolean;          // Xem báo cáo
  canExportReport: boolean;        // Xuất báo cáo
}

// Permission matrix by role
export const MINDMAP_ROLE_PERMISSIONS: Record<MindmapRole, MindmapPermission> = {
  ADMIN: {
    canViewAllProjects: true,
    canViewAssignedOnly: false,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canViewAllCustomers: true,
    canManageCustomers: true,
    canCreateNode: true,
    canEditNode: true,
    canDeleteNode: true,
    canDragNode: true,
    canConnectNodes: true,
    canCreateTodo: true,
    canEditTodo: true,
    canDeleteTodo: true,
    canCompleteTodo: true,
    canAssignTodo: true,
    canUpdateStatus: true,
    canUpdateProgress: true,
    canApprove: true,
    canReject: true,
    canUploadMedia: true,
    canComment: true,
    canViewReport: true,
    canExportReport: true,
  },
  MANAGER: {
    canViewAllProjects: true,
    canViewAssignedOnly: false,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canViewAllCustomers: true,
    canManageCustomers: true,
    canCreateNode: true,
    canEditNode: true,
    canDeleteNode: true,
    canDragNode: true,
    canConnectNodes: true,
    canCreateTodo: true,
    canEditTodo: true,
    canDeleteTodo: true,
    canCompleteTodo: true,
    canAssignTodo: true,
    canUpdateStatus: true,
    canUpdateProgress: true,
    canApprove: true,
    canReject: true,
    canUploadMedia: true,
    canComment: true,
    canViewReport: true,
    canExportReport: true,
  },
  ENGINEER: {
    canViewAllProjects: true,
    canViewAssignedOnly: false,
    canCreateProject: false,
    canEditProject: true,
    canDeleteProject: false,
    canViewAllCustomers: true,
    canManageCustomers: false,
    canCreateNode: true,
    canEditNode: true,
    canDeleteNode: false,
    canDragNode: true,
    canConnectNodes: true,
    canCreateTodo: true,
    canEditTodo: true,
    canDeleteTodo: false,
    canCompleteTodo: true,
    canAssignTodo: true,
    canUpdateStatus: true,
    canUpdateProgress: true,
    canApprove: true,
    canReject: true,
    canUploadMedia: true,
    canComment: true,
    canViewReport: true,
    canExportReport: false,
  },
  CONTRACTOR: {
    canViewAllProjects: false,
    canViewAssignedOnly: true,  // Chỉ xem công trình được giao
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewAllCustomers: false,
    canManageCustomers: false,
    canCreateNode: false,
    canEditNode: false,
    canDeleteNode: false,
    canDragNode: false,
    canConnectNodes: false,
    canCreateTodo: false,
    canEditTodo: false,
    canDeleteTodo: false,
    canCompleteTodo: true,      // Có thể đánh dấu hoàn thành
    canAssignTodo: false,
    canUpdateStatus: true,      // Cập nhật trạng thái task được giao
    canUpdateProgress: true,    // Cập nhật tiến độ
    canApprove: false,
    canReject: false,
    canUploadMedia: true,       // Upload ảnh chứng minh
    canComment: true,
    canViewReport: true,
    canExportReport: false,
  },
  WORKER: {
    canViewAllProjects: false,
    canViewAssignedOnly: true,  // Chỉ xem công việc được giao
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewAllCustomers: false,
    canManageCustomers: false,
    canCreateNode: false,
    canEditNode: false,
    canDeleteNode: false,
    canDragNode: false,
    canConnectNodes: false,
    canCreateTodo: false,
    canEditTodo: false,
    canDeleteTodo: false,
    canCompleteTodo: true,
    canAssignTodo: false,
    canUpdateStatus: true,
    canUpdateProgress: true,
    canApprove: false,
    canReject: false,
    canUploadMedia: true,
    canComment: true,
    canViewReport: false,
    canExportReport: false,
  },
  CLIENT: {
    canViewAllProjects: false,
    canViewAssignedOnly: true,  // Chỉ xem dự án của mình
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewAllCustomers: false,
    canManageCustomers: false,
    canCreateNode: false,
    canEditNode: false,
    canDeleteNode: false,
    canDragNode: false,
    canConnectNodes: false,
    canCreateTodo: false,
    canEditTodo: false,
    canDeleteTodo: false,
    canCompleteTodo: false,
    canAssignTodo: false,
    canUpdateStatus: false,
    canUpdateProgress: false,
    canApprove: true,           // Nghiệm thu
    canReject: true,            // Từ chối nghiệm thu
    canUploadMedia: false,
    canComment: true,
    canViewReport: true,
    canExportReport: false,
  },
  VIEWER: {
    canViewAllProjects: false,
    canViewAssignedOnly: true,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewAllCustomers: false,
    canManageCustomers: false,
    canCreateNode: false,
    canEditNode: false,
    canDeleteNode: false,
    canDragNode: false,
    canConnectNodes: false,
    canCreateTodo: false,
    canEditTodo: false,
    canDeleteTodo: false,
    canCompleteTodo: false,
    canAssignTodo: false,
    canUpdateStatus: false,
    canUpdateProgress: false,
    canApprove: false,
    canReject: false,
    canUploadMedia: false,
    canComment: false,
    canViewReport: true,
    canExportReport: false,
  },
};

// ==================== CUSTOMER & PROJECT HIERARCHY ====================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  address?: string;
  companyName?: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: number;           // Tổng giá trị dự án
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProject {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  description?: string;
  address: string;
  projectType: MindmapProjectType;
  status: MindmapProjectStatus;
  progressPercent: number;
  estimatedBudget: number;
  actualCost?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  coverImage?: string;
  assignedManager?: string;
  assignedManagerName?: string;
  assignedContractors: ProjectContractor[];
  totalNodes: number;
  completedNodes: number;
  totalTodos: number;
  completedTodos: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectContractor {
  id: string;
  userId: string;
  userName: string;
  companyName?: string;
  phone: string;
  avatar?: string;
  role: MindmapRole;
  assignedAt: string;
  assignedBy: string;
}

export type MindmapProjectType = 
  | 'HOUSE'           // Nhà ở
  | 'VILLA'           // Biệt thự
  | 'APARTMENT'       // Căn hộ
  | 'OFFICE'          // Văn phòng
  | 'COMMERCIAL'      // Thương mại
  | 'INDUSTRIAL'      // Công nghiệp
  | 'RENOVATION'      // Sửa chữa
  | 'INTERIOR'        // Nội thất
  | 'LANDSCAPE'       // Cảnh quan
  | 'OTHER';          // Khác

export type MindmapProjectStatus = 
  | 'DRAFT'           // Nháp
  | 'PLANNING'        // Lên kế hoạch
  | 'IN_PROGRESS'     // Đang thi công
  | 'PENDING_REVIEW'  // Chờ nghiệm thu
  | 'COMPLETED'       // Hoàn thành
  | 'ON_HOLD'         // Tạm dừng
  | 'CANCELLED';      // Đã hủy

export const PROJECT_TYPE_CONFIG: Record<MindmapProjectType, {
  label: string;
  icon: string;
  color: string;
}> = {
  HOUSE: { label: 'Nhà ở', icon: 'home-outline', color: '#4CAF50' },
  VILLA: { label: 'Biệt thự', icon: 'business-outline', color: '#9C27B0' },
  APARTMENT: { label: 'Căn hộ', icon: 'layers-outline', color: '#2196F3' },
  OFFICE: { label: 'Văn phòng', icon: 'briefcase-outline', color: '#FF9800' },
  COMMERCIAL: { label: 'Thương mại', icon: 'storefront-outline', color: '#E91E63' },
  INDUSTRIAL: { label: 'Công nghiệp', icon: 'construct-outline', color: '#607D8B' },
  RENOVATION: { label: 'Sửa chữa', icon: 'hammer-outline', color: '#795548' },
  INTERIOR: { label: 'Nội thất', icon: 'bed-outline', color: '#00BCD4' },
  LANDSCAPE: { label: 'Cảnh quan', icon: 'leaf-outline', color: '#8BC34A' },
  OTHER: { label: 'Khác', icon: 'ellipsis-horizontal', color: '#9E9E9E' },
};

// ==================== MINDMAP NODE SYSTEM ====================

export type MindmapLayer = 
  | 'PROGRESS'   // Đường tiến độ - milestones
  | 'CONTENT'    // Đường nội dung - công việc chi tiết
  | 'TODOS';     // Đường todos - action items

export type NodeType = 
  | 'MILESTONE'      // Cột mốc chính (Progress layer)
  | 'PHASE'          // Giai đoạn (Progress layer)
  | 'TASK'           // Công việc (Content layer)
  | 'SUBTASK'        // Công việc con (Content layer)
  | 'TODO'           // Việc cần làm (Todos layer)
  | 'CHECKPOINT'     // Điểm kiểm tra (Progress layer)
  | 'START'          // Bắt đầu
  | 'END';           // Kết thúc

export type NodeStatus = 
  | 'NOT_STARTED'    // Chưa bắt đầu - Gray
  | 'IN_PROGRESS'    // Đang thực hiện - Orange
  | 'PENDING_CHECK'  // Chờ kiểm tra - Purple
  | 'COMPLETED'      // Hoàn thành - Green
  | 'APPROVED'       // Đã duyệt - Dark Green
  | 'REJECTED'       // Bị từ chối - Red
  | 'ON_HOLD'        // Tạm dừng - Yellow
  | 'BLOCKED';       // Bị chặn - Red

export const NODE_STATUS_CONFIG: Record<NodeStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  NOT_STARTED: { 
    label: 'Chưa bắt đầu', 
    color: '#9E9E9E', 
    bgColor: '#F5F5F5', 
    borderColor: '#E0E0E0',
    icon: 'ellipse-outline' 
  },
  IN_PROGRESS: { 
    label: 'Đang thực hiện', 
    color: '#FF9800', 
    bgColor: '#FFF3E0', 
    borderColor: '#FFA84D',
    icon: 'construct-outline' 
  },
  PENDING_CHECK: { 
    label: 'Chờ kiểm tra', 
    color: '#9C27B0', 
    bgColor: '#F3E5F5', 
    borderColor: '#AB47BC',
    icon: 'search-outline' 
  },
  COMPLETED: { 
    label: 'Hoàn thành', 
    color: '#14B159', 
    bgColor: '#E8F5E9', 
    borderColor: '#4AA14A',
    icon: 'checkmark-outline' 
  },
  APPROVED: { 
    label: 'Đã duyệt', 
    color: '#00C853', 
    bgColor: '#E8F5E9', 
    borderColor: '#00E676',
    icon: 'checkmark-circle' 
  },
  REJECTED: { 
    label: 'Bị từ chối', 
    color: '#E82A34', 
    bgColor: '#FFEBEE', 
    borderColor: '#F44336',
    icon: 'close-circle-outline' 
  },
  ON_HOLD: { 
    label: 'Tạm dừng', 
    color: '#FFC107', 
    bgColor: '#FFF8E1', 
    borderColor: '#FFCA28',
    icon: 'pause-circle-outline' 
  },
  BLOCKED: { 
    label: 'Bị chặn', 
    color: '#D32F2F', 
    bgColor: '#FFCDD2', 
    borderColor: '#EF5350',
    icon: 'alert-circle-outline' 
  },
};

export const NODE_TYPE_CONFIG: Record<NodeType, {
  label: string;
  icon: string;
  defaultColor: string;
  layer: MindmapLayer;
}> = {
  START: { label: 'Bắt đầu', icon: 'play-circle', defaultColor: '#4CAF50', layer: 'PROGRESS' },
  END: { label: 'Kết thúc', icon: 'stop-circle', defaultColor: '#F44336', layer: 'PROGRESS' },
  MILESTONE: { label: 'Cột mốc', icon: 'flag', defaultColor: '#2196F3', layer: 'PROGRESS' },
  PHASE: { label: 'Giai đoạn', icon: 'layers', defaultColor: '#9C27B0', layer: 'PROGRESS' },
  CHECKPOINT: { label: 'Kiểm tra', icon: 'shield-checkmark', defaultColor: '#FF9800', layer: 'PROGRESS' },
  TASK: { label: 'Công việc', icon: 'construct', defaultColor: '#D39878', layer: 'CONTENT' },
  SUBTASK: { label: 'Việc phụ', icon: 'git-branch', defaultColor: '#795548', layer: 'CONTENT' },
  TODO: { label: 'Todo', icon: 'checkbox', defaultColor: '#607D8B', layer: 'TODOS' },
};

export interface MindmapPosition {
  x: number;        // Vị trí x tương đối trong canvas
  y: number;        // Vị trí y tương đối trong canvas
}

export interface MindmapNode {
  id: string;
  projectId: string;
  
  // Display info
  name: string;
  description?: string;
  location?: string;          // e.g., "F1", "W1", "F1C1" (Floor/Wall position)
  
  // Type & Status
  type: NodeType;
  layer: MindmapLayer;
  status: NodeStatus;
  
  // Position for drag-drop
  position: MindmapPosition;
  
  // Timeline
  duration?: string;          // e.g., "1 Day", "2 Week", "3 Month"
  durationDays?: number;      // Duration in days for calculation
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Progress
  progressPercent: number;    // 0-100
  
  // Connections
  parentNodeId?: string;      // Parent node for hierarchy
  connectedTo: string[];      // IDs of connected nodes (forward connections)
  connectedFrom: string[];    // IDs of nodes connecting to this (backward)
  
  // Assignment
  assignedTo?: NodeAssignment[];
  
  // Content
  notes?: string;
  reportUrl?: string;
  keyPlanUrl?: string;
  images: string[];
  
  // Order for sorting
  order: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NodeAssignment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: MindmapRole;
  assignedAt: string;
  assignedBy: string;
}

// ==================== NODE CONNECTION (Vector Lines) ====================

export type ConnectionType = 
  | 'SEQUENCE'       // Tuần tự (từ trước đến sau)
  | 'DEPENDENCY'     // Phụ thuộc (phải hoàn thành A mới làm B)
  | 'PARALLEL'       // Song song (làm cùng lúc)
  | 'OPTIONAL'       // Tùy chọn
  | 'BRANCH';        // Rẽ nhánh

export type ConnectionStyle = 
  | 'SOLID'          // Nét liền
  | 'DASHED'         // Nét đứt
  | 'DOTTED';        // Chấm

export interface NodeConnection {
  id: string;
  projectId: string;
  fromNodeId: string;
  toNodeId: string;
  type: ConnectionType;
  style: ConnectionStyle;
  color: string;
  label?: string;
  
  // Control points for curved lines (Bezier)
  controlPoints?: {
    cp1: MindmapPosition;
    cp2: MindmapPosition;
  };
  
  createdBy: string;
  createdAt: string;
}

export const CONNECTION_TYPE_CONFIG: Record<ConnectionType, {
  label: string;
  color: string;
  style: ConnectionStyle;
  icon: string;
}> = {
  SEQUENCE: { label: 'Tuần tự', color: '#2196F3', style: 'SOLID', icon: 'arrow-forward' },
  DEPENDENCY: { label: 'Phụ thuộc', color: '#F44336', style: 'SOLID', icon: 'link' },
  PARALLEL: { label: 'Song song', color: '#4CAF50', style: 'DASHED', icon: 'git-branch' },
  OPTIONAL: { label: 'Tùy chọn', color: '#9E9E9E', style: 'DOTTED', icon: 'help-circle' },
  BRANCH: { label: 'Rẽ nhánh', color: '#FF9800', style: 'DASHED', icon: 'git-merge' },
};

// ==================== TODO SYSTEM (Admin/Manager creates, Contractor executes) ====================

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TodoStatus = 
  | 'TODO'           // Cần làm
  | 'IN_PROGRESS'    // Đang làm
  | 'REVIEW'         // Chờ kiểm tra
  | 'DONE'           // Hoàn thành
  | 'CANCELLED';     // Đã hủy

export interface ProjectTodo {
  id: string;
  projectId: string;
  nodeId?: string;            // Liên kết với node nếu có
  
  // Content
  title: string;
  description?: string;
  checklist?: TodoChecklistItem[];
  
  // Status & Priority
  status: TodoStatus;
  priority: TodoPriority;
  
  // Assignment
  createdBy: string;          // Admin/Manager creates
  createdByName: string;
  assignedTo?: string;        // Contractor executes
  assignedToName?: string;
  assignedToRole?: MindmapRole;
  
  // Timeline
  dueDate?: string;
  completedAt?: string;
  
  // Media
  attachments?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface TodoChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export const TODO_PRIORITY_CONFIG: Record<TodoPriority, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  LOW: { label: 'Thấp', color: '#9E9E9E', bgColor: '#F5F5F5', icon: 'arrow-down' },
  MEDIUM: { label: 'Trung bình', color: '#FF9800', bgColor: '#FFF3E0', icon: 'remove' },
  HIGH: { label: 'Cao', color: '#F44336', bgColor: '#FFEBEE', icon: 'arrow-up' },
  URGENT: { label: 'Khẩn cấp', color: '#D32F2F', bgColor: '#FFCDD2', icon: 'alert' },
};

export const TODO_STATUS_CONFIG: Record<TodoStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  TODO: { label: 'Cần làm', color: '#9E9E9E', bgColor: '#F5F5F5', icon: 'checkbox-outline' },
  IN_PROGRESS: { label: 'Đang làm', color: '#2196F3', bgColor: '#E3F2FD', icon: 'construct-outline' },
  REVIEW: { label: 'Chờ duyệt', color: '#9C27B0', bgColor: '#F3E5F5', icon: 'eye-outline' },
  DONE: { label: 'Hoàn thành', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'checkmark-circle' },
  CANCELLED: { label: 'Đã hủy', color: '#757575', bgColor: '#EEEEEE', icon: 'close-circle' },
};

// ==================== MINDMAP VIEW STATE ====================

export interface MindmapViewState {
  zoom: number;               // 0.5 - 2.0
  panX: number;               // Current pan X position
  panY: number;               // Current pan Y position
  selectedNodeId?: string;    // Currently selected node
  selectedConnectionId?: string;
  activeLayer: MindmapLayer | 'ALL';
  showGrid: boolean;
  showConnections: boolean;
  editMode: boolean;
}

export interface MindmapData {
  project: CustomerProject;
  nodes: MindmapNode[];
  connections: NodeConnection[];
  todos: ProjectTodo[];
  viewState: MindmapViewState;
}

// ==================== API REQUESTS/RESPONSES ====================

export interface CreateNodeDto {
  projectId: string;
  name: string;
  description?: string;
  location?: string;
  type: NodeType;
  layer: MindmapLayer;
  position: MindmapPosition;
  duration?: string;
  durationDays?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  parentNodeId?: string;
  order: number;
}

export interface UpdateNodeDto {
  name?: string;
  description?: string;
  location?: string;
  status?: NodeStatus;
  position?: MindmapPosition;
  duration?: string;
  durationDays?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progressPercent?: number;
  notes?: string;
  reportUrl?: string;
  keyPlanUrl?: string;
  images?: string[];
  order?: number;
}

export interface CreateConnectionDto {
  projectId: string;
  fromNodeId: string;
  toNodeId: string;
  type: ConnectionType;
  style?: ConnectionStyle;
  color?: string;
  label?: string;
  controlPoints?: {
    cp1: MindmapPosition;
    cp2: MindmapPosition;
  };
}

export interface CreateTodoDto {
  projectId: string;
  nodeId?: string;
  title: string;
  description?: string;
  checklist?: { text: string }[];
  priority: TodoPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  checklist?: TodoChecklistItem[];
  status?: TodoStatus;
  priority?: TodoPriority;
  assignedTo?: string;
  dueDate?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get user's permission based on role
 */
export function getMindmapPermission(role: MindmapRole): MindmapPermission {
  return MINDMAP_ROLE_PERMISSIONS[role];
}

/**
 * Check if user can perform specific action
 */
export function canPerformAction(
  role: MindmapRole,
  action: keyof MindmapPermission
): boolean {
  return MINDMAP_ROLE_PERMISSIONS[role][action];
}

/**
 * Get node color based on status
 */
export function getNodeColor(status: NodeStatus): string {
  return NODE_STATUS_CONFIG[status].color;
}

/**
 * Get node border color for mindmap display
 */
export function getNodeBorderColor(status: NodeStatus): string {
  return NODE_STATUS_CONFIG[status].borderColor;
}

/**
 * Calculate layer Y position for mindmap
 */
export function getLayerYPosition(layer: MindmapLayer): number {
  switch (layer) {
    case 'PROGRESS': return 100;  // Top layer
    case 'CONTENT': return 250;   // Middle layer
    case 'TODOS': return 400;     // Bottom layer
    default: return 250;
  }
}

/**
 * Generate unique node ID
 */
export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique connection ID
 */
export function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sort nodes by layer and order
 */
export function sortNodes(nodes: MindmapNode[]): MindmapNode[] {
  const layerOrder: Record<MindmapLayer, number> = {
    'PROGRESS': 1,
    'CONTENT': 2,
    'TODOS': 3,
  };
  
  return [...nodes].sort((a, b) => {
    const layerDiff = layerOrder[a.layer] - layerOrder[b.layer];
    if (layerDiff !== 0) return layerDiff;
    return a.order - b.order;
  });
}

/**
 * Filter nodes by layer
 */
export function getNodesByLayer(nodes: MindmapNode[], layer: MindmapLayer): MindmapNode[] {
  return nodes.filter(n => n.layer === layer);
}

/**
 * Calculate project progress from nodes
 */
export function calculateMindmapProgress(nodes: MindmapNode[]): number {
  const contentNodes = nodes.filter(n => n.layer === 'CONTENT');
  if (contentNodes.length === 0) return 0;
  
  const totalProgress = contentNodes.reduce((sum, node) => {
    if (node.status === 'APPROVED') return sum + 100;
    if (node.status === 'COMPLETED') return sum + 90;
    if (node.status === 'PENDING_CHECK') return sum + 80;
    return sum + node.progressPercent;
  }, 0);
  
  return Math.round(totalProgress / contentNodes.length);
}

/**
 * Get todo statistics
 */
export function getTodoStats(todos: ProjectTodo[]): {
  total: number;
  done: number;
  inProgress: number;
  pending: number;
  overdue: number;
} {
  const now = new Date();
  return {
    total: todos.length,
    done: todos.filter(t => t.status === 'DONE').length,
    inProgress: todos.filter(t => t.status === 'IN_PROGRESS').length,
    pending: todos.filter(t => t.status === 'TODO').length,
    overdue: todos.filter(t => 
      t.status !== 'DONE' && 
      t.status !== 'CANCELLED' && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length,
  };
}
