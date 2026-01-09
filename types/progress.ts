/**
 * Construction Progress Types
 * Types for tracking construction progress with role-based access
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

// ==================== ENUMS ====================

export enum ProgressStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  ON_HOLD = 'on_hold',
}

export enum UserRole {
  ADMIN = 'admin',
  ENGINEER = 'engineer',
  SUPERVISOR = 'supervisor',
  WORKER = 'worker',
  VIEWER = 'viewer',
}

export enum StageType {
  PREPARATION = 'preparation',
  FOUNDATION = 'foundation',
  STRUCTURE = 'structure',
  MEP = 'mep',
  FINISHING = 'finishing',
  HANDOVER = 'handover',
}

// ==================== INTERFACES ====================

export interface ProgressPhoto {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  takenAt: string;
  uploadedBy: string;
  uploadedByName: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ProgressComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProgressTask {
  id: string;
  projectId: string;
  stageId: string;
  stageName: string;
  
  // Task info
  title: string;
  description?: string;
  status: ProgressStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Progress tracking
  progress: number; // 0-100
  estimatedHours?: number;
  actualHours?: number;
  
  // Dates
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Assignment
  assignedTo?: string[];
  assignedToNames?: string[];
  supervisorId?: string;
  supervisorName?: string;
  
  // Media
  photos: ProgressPhoto[];
  comments: ProgressComment[];
  
  // Audit
  createdBy: string;
  createdByName: string;
  createdByRole: UserRole;
  createdAt: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedByRole?: UserRole;
  updatedAt?: string;
  
  // Metadata
  tags?: string[];
  notes?: string;
  issues?: string[];
}

export interface ProgressStage {
  id: string;
  projectId: string;
  name: string;
  type: StageType;
  order: number;
  description?: string;
  
  // Progress
  status: ProgressStatus;
  progress: number; // 0-100
  tasksTotal: number;
  tasksCompleted: number;
  
  // Dates
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Tasks
  tasks: ProgressTask[];
  
  // Audit
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectProgress {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  
  // Overall progress
  overallProgress: number;
  status: ProgressStatus;
  
  // Stages
  stages: ProgressStage[];
  stagesTotal: number;
  stagesCompleted: number;
  
  // Stats
  tasksTotal: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksDelayed: number;
  
  // Dates
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  
  // Team
  teamMembers: {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
  }[];
  
  // Last update
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
  lastUpdatedAt?: string;
}

// ==================== API TYPES ====================

export interface CreateTaskInput {
  projectId: string;
  stageId: string;
  title: string;
  description?: string;
  status?: ProgressStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  plannedStartDate: string;
  plannedEndDate: string;
  assignedTo?: string[];
  supervisorId?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: ProgressStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  assignedTo?: string[];
  supervisorId?: string;
  notes?: string;
  tags?: string[];
  issues?: string[];
}

export interface AddPhotoInput {
  taskId: string;
  url: string;
  caption?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface AddCommentInput {
  taskId: string;
  text: string;
}

export interface ProgressFilter {
  projectId?: string;
  stageId?: string;
  status?: ProgressStatus[];
  priority?: string[];
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ==================== STATUS CONFIG ====================

export const STATUS_CONFIG: Record<ProgressStatus, {
  label: string;
  labelVi: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  [ProgressStatus.PENDING]: {
    label: 'Pending',
    labelVi: 'Chưa bắt đầu',
    color: '#999999',
    bgColor: '#F5F5F5',
    icon: 'time-outline',
  },
  [ProgressStatus.IN_PROGRESS]: {
    label: 'In Progress',
    labelVi: 'Đang thực hiện',
    color: '#0066CC',
    bgColor: '#E8F4FF',
    icon: 'construct-outline',
  },
  [ProgressStatus.COMPLETED]: {
    label: 'Completed',
    labelVi: 'Hoàn thành',
    color: '#0066CC',
    bgColor: '#E8F5E9',
    icon: 'checkmark-circle-outline',
  },
  [ProgressStatus.DELAYED]: {
    label: 'Delayed',
    labelVi: 'Trễ tiến độ',
    color: '#000000',
    bgColor: '#FFEBEE',
    icon: 'alert-circle-outline',
  },
  [ProgressStatus.ON_HOLD]: {
    label: 'On Hold',
    labelVi: 'Tạm dừng',
    color: '#999999',
    bgColor: '#F3E5F5',
    icon: 'pause-circle-outline',
  },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Thấp', color: '#999999', icon: 'arrow-down' },
  medium: { label: 'Trung bình', color: '#0066CC', icon: 'remove' },
  high: { label: 'Cao', color: '#0066CC', icon: 'arrow-up' },
  critical: { label: 'Khẩn cấp', color: '#000000', icon: 'alert' },
};

export const ROLE_PERMISSIONS: Record<UserRole, {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canApprove: boolean;
}> = {
  [UserRole.ADMIN]: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canAssign: true,
    canApprove: true,
  },
  [UserRole.ENGINEER]: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canAssign: true,
    canApprove: false,
  },
  [UserRole.SUPERVISOR]: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canAssign: false,
    canApprove: false,
  },
  [UserRole.WORKER]: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canAssign: false,
    canApprove: false,
  },
  [UserRole.VIEWER]: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canAssign: false,
    canApprove: false,
  },
};
