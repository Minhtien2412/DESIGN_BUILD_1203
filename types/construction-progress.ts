/**
 * Construction Progress Types
 * Hệ thống quản lý tiến độ thi công với phân quyền
 * Similar to Shopee order tracking but for construction
 */

// ==================== USER ROLES & PERMISSIONS ====================

export type ProgressRole = 
  | 'MANAGER'      // Quản lý dự án - Full quyền CRUD
  | 'ENGINEER'     // Kỹ sư - Có thể chỉnh sửa tiến độ
  | 'CONTRACTOR'   // Nhà thầu - Xác nhận công việc đang làm/hoàn thành
  | 'CLIENT'       // Khách hàng - Chỉ xem & xác nhận hoàn thiện
  | 'VIEWER';      // Người xem - Chỉ xem

export interface ProgressPermission {
  canCreate: boolean;      // Tạo dự án/task mới
  canEdit: boolean;        // Chỉnh sửa thông tin
  canDelete: boolean;      // Xóa dự án/task
  canUpdateStatus: boolean; // Cập nhật trạng thái
  canConfirm: boolean;     // Xác nhận hoàn thành
  canReview: boolean;      // Đánh giá
  canViewAll: boolean;     // Xem tất cả dự án
  canAssign: boolean;      // Phân công công việc
  canComment: boolean;     // Bình luận
  canUploadMedia: boolean; // Upload ảnh/video
}

// Permission matrix by role
export const ROLE_PERMISSIONS: Record<ProgressRole, ProgressPermission> = {
  MANAGER: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canUpdateStatus: true,
    canConfirm: true,
    canReview: true,
    canViewAll: true,
    canAssign: true,
    canComment: true,
    canUploadMedia: true,
  },
  ENGINEER: {
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canUpdateStatus: true,
    canConfirm: true,
    canReview: true,
    canViewAll: true,
    canAssign: false,
    canComment: true,
    canUploadMedia: true,
  },
  CONTRACTOR: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canUpdateStatus: true, // Chỉ update task được giao
    canConfirm: true,      // Xác nhận công việc
    canReview: false,
    canViewAll: false,     // Chỉ xem dự án được giao
    canAssign: false,
    canComment: true,
    canUploadMedia: true,
  },
  CLIENT: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canUpdateStatus: false,
    canConfirm: true,      // Xác nhận nghiệm thu
    canReview: true,       // Đánh giá chất lượng
    canViewAll: false,     // Chỉ xem dự án của mình
    canAssign: false,
    canComment: true,
    canUploadMedia: false,
  },
  VIEWER: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canUpdateStatus: false,
    canConfirm: false,
    canReview: false,
    canViewAll: false,
    canAssign: false,
    canComment: false,
    canUploadMedia: false,
  },
};

// ==================== PROJECT STATUS ====================

export type ProjectStatus = 
  | 'DRAFT'           // Nháp - chưa bắt đầu
  | 'PLANNING'        // Đang lên kế hoạch
  | 'IN_PROGRESS'     // Đang thi công
  | 'PENDING_REVIEW'  // Chờ nghiệm thu
  | 'COMPLETED'       // Hoàn thành
  | 'ON_HOLD'         // Tạm dừng
  | 'CANCELLED';      // Đã hủy

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  order: number;
}> = {
  DRAFT: { label: 'Nháp', color: '#999999', bgColor: '#F5F5F5', icon: 'document-outline', order: 0 },
  PLANNING: { label: 'Lên kế hoạch', color: '#0066CC', bgColor: '#E8F4FF', icon: 'clipboard-outline', order: 1 },
  IN_PROGRESS: { label: 'Đang thi công', color: '#0066CC', bgColor: '#E8F4FF', icon: 'hammer-outline', order: 2 },
  PENDING_REVIEW: { label: 'Chờ nghiệm thu', color: '#999999', bgColor: '#F3E5F5', icon: 'eye-outline', order: 3 },
  COMPLETED: { label: 'Hoàn thành', color: '#0066CC', bgColor: '#E8F5E9', icon: 'checkmark-circle-outline', order: 4 },
  ON_HOLD: { label: 'Tạm dừng', color: '#000000', bgColor: '#FFEBEE', icon: 'pause-circle-outline', order: 5 },
  CANCELLED: { label: 'Đã hủy', color: '#757575', bgColor: '#EEEEEE', icon: 'close-circle-outline', order: 6 },
};

// ==================== TASK STATUS (Like Shopee Order Steps) ====================

export type TaskStatus = 
  | 'NOT_STARTED'     // Chưa bắt đầu
  | 'IN_PROGRESS'     // Đang thực hiện
  | 'AWAITING_MATERIALS' // Chờ vật liệu
  | 'PAUSED'          // Tạm dừng
  | 'PENDING_CHECK'   // Chờ kiểm tra
  | 'COMPLETED'       // Hoàn thành
  | 'APPROVED'        // Đã nghiệm thu
  | 'REJECTED';       // Bị từ chối

export const TASK_STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  step: number;
}> = {
  NOT_STARTED: { label: 'Chưa bắt đầu', color: '#999999', bgColor: '#F5F5F5', icon: 'ellipse-outline', step: 0 },
  IN_PROGRESS: { label: 'Đang thực hiện', color: '#0066CC', bgColor: '#E8F4FF', icon: 'construct-outline', step: 1 },
  AWAITING_MATERIALS: { label: 'Chờ vật liệu', color: '#0066CC', bgColor: '#E8F4FF', icon: 'cube-outline', step: 1 },
  PAUSED: { label: 'Tạm dừng', color: '#000000', bgColor: '#FFEBEE', icon: 'pause-outline', step: 1 },
  PENDING_CHECK: { label: 'Chờ kiểm tra', color: '#999999', bgColor: '#F3E5F5', icon: 'search-outline', step: 2 },
  COMPLETED: { label: 'Hoàn thành', color: '#0066CC', bgColor: '#E8F5E9', icon: 'checkmark-outline', step: 3 },
  APPROVED: { label: 'Đã nghiệm thu', color: '#00C853', bgColor: '#E8F5E9', icon: 'checkmark-circle', step: 4 },
  REJECTED: { label: 'Bị từ chối', color: '#D32F2F', bgColor: '#E8E8E8', icon: 'close-circle-outline', step: 2 },
};

// ==================== DATA MODELS ====================

export interface ProjectMember {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userPhone?: string;
  role: ProgressRole;
  assignedAt: string;
  assignedBy?: string;
}

export interface TaskMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: ProgressRole;
  createdAt: string;
  updatedAt?: string;
  media?: TaskMedia[];
}

export interface TaskConfirmation {
  id: string;
  type: 'CONTRACTOR_CONFIRM' | 'ENGINEER_CHECK' | 'CLIENT_APPROVE';
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  userId: string;
  userName: string;
  userRole: ProgressRole;
  note?: string;
  confirmedAt?: string;
  media?: TaskMedia[];
}

export interface ConstructionTask {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  category: string; // e.g., "Móng", "Kết cấu", "Hoàn thiện"
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  // Timeline
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Progress
  progressPercent: number; // 0-100
  
  // Assignment
  assignedTo?: ProjectMember[];
  
  // Confirmations (like Shopee order confirmations)
  confirmations: TaskConfirmation[];
  
  // Activity
  comments: TaskComment[];
  media: TaskMedia[];
  
  // History
  statusHistory: {
    status: TaskStatus;
    changedBy: string;
    changedAt: string;
    note?: string;
  }[];
  
  // Order in the timeline
  order: number;
  parentTaskId?: string; // For subtasks
  
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionProject {
  id: string;
  name: string;
  description?: string;
  address: string;
  
  // Project info
  projectType: string; // e.g., "Nhà ở", "Biệt thự", "Văn phòng"
  totalArea?: number; // m2
  totalFloors?: number;
  estimatedBudget?: number;
  
  // Status
  status: ProjectStatus;
  progressPercent: number; // 0-100
  
  // Timeline
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Members
  members: ProjectMember[];
  ownerId: string; // Client who owns this project
  
  // Tasks
  tasks: ConstructionTask[];
  totalTasks: number;
  completedTasks: number;
  
  // Media
  coverImage?: string;
  media: TaskMedia[];
  
  // Reviews (after completion)
  reviews?: ProjectReview[];
  averageRating?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectReview {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  content?: string;
  media?: TaskMedia[];
  aspects?: {
    quality: number;      // Chất lượng thi công
    timeline: number;     // Đúng tiến độ
    communication: number; // Giao tiếp
    cleanliness: number;  // Vệ sinh công trường
    professionalism: number; // Chuyên nghiệp
  };
  createdAt: string;
}

// ==================== TIMELINE STEP (Like Shopee Order Timeline) ====================

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  icon: string;
  color: string;
  actor?: {
    name: string;
    role: ProgressRole;
    avatar?: string;
  };
  media?: TaskMedia[];
}

// ==================== API REQUEST/RESPONSE ====================

export interface CreateProjectDto {
  name: string;
  description?: string;
  address: string;
  projectType: string;
  totalArea?: number;
  totalFloors?: number;
  estimatedBudget?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  coverImage?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: ProjectStatus;
}

export interface CreateTaskDto {
  projectId: string;
  name: string;
  description?: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  plannedStartDate: string;
  plannedEndDate: string;
  parentTaskId?: string;
}

export interface UpdateTaskStatusDto {
  taskId: string;
  status: TaskStatus;
  note?: string;
  mediaIds?: string[];
}

export interface ConfirmTaskDto {
  taskId: string;
  type: 'CONTRACTOR_CONFIRM' | 'ENGINEER_CHECK' | 'CLIENT_APPROVE';
  status: 'CONFIRMED' | 'REJECTED';
  note?: string;
  mediaIds?: string[];
}

export interface AddCommentDto {
  taskId: string;
  content: string;
  mediaIds?: string[];
}

export interface AssignMemberDto {
  projectId: string;
  userId: string;
  role: ProgressRole;
}

export interface SubmitReviewDto {
  projectId: string;
  rating: number;
  content?: string;
  aspects?: {
    quality: number;
    timeline: number;
    communication: number;
    cleanliness: number;
    professionalism: number;
  };
  mediaIds?: string[];
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get user's role in a project
 */
export function getUserProjectRole(
  project: ConstructionProject, 
  userId: string
): ProgressRole | null {
  if (project.ownerId === userId) return 'CLIENT';
  const member = project.members.find(m => m.userId === userId);
  return member?.role || null;
}

/**
 * Check if user has specific permission in project
 */
export function hasPermission(
  role: ProgressRole | null,
  permission: keyof ProgressPermission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Calculate project progress from tasks
 */
export function calculateProjectProgress(tasks: ConstructionTask[]): number {
  if (tasks.length === 0) return 0;
  
  const totalWeight = tasks.length;
  const completedWeight = tasks.reduce((sum, task) => {
    if (task.status === 'APPROVED') return sum + 1;
    if (task.status === 'COMPLETED') return sum + 0.9;
    if (task.status === 'PENDING_CHECK') return sum + 0.8;
    return sum + (task.progressPercent / 100);
  }, 0);
  
  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Generate timeline steps from task (like Shopee order tracking)
 */
export function generateTaskTimeline(task: ConstructionTask): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      id: 'created',
      title: 'Tạo công việc',
      description: 'Công việc được tạo và phân công',
      status: 'completed',
      date: task.createdAt,
      icon: 'create-outline',
      color: '#0066CC',
    },
    {
      id: 'started',
      title: 'Bắt đầu thi công',
      description: 'Nhà thầu bắt đầu thực hiện công việc',
      status: task.actualStartDate ? 'completed' : 
              task.status === 'NOT_STARTED' ? 'pending' : 'current',
      date: task.actualStartDate,
      icon: 'hammer-outline',
      color: '#0066CC',
    },
    {
      id: 'in_progress',
      title: 'Đang thực hiện',
      description: `Tiến độ: ${task.progressPercent}%`,
      status: task.status === 'IN_PROGRESS' ? 'current' : 
              ['PENDING_CHECK', 'COMPLETED', 'APPROVED'].includes(task.status) ? 'completed' : 'pending',
      icon: 'construct-outline',
      color: '#0066CC',
    },
    {
      id: 'pending_check',
      title: 'Chờ kiểm tra',
      description: 'Kỹ sư kiểm tra chất lượng',
      status: task.status === 'PENDING_CHECK' ? 'current' :
              ['COMPLETED', 'APPROVED'].includes(task.status) ? 'completed' : 'pending',
      icon: 'search-outline',
      color: '#999999',
    },
    {
      id: 'completed',
      title: 'Hoàn thành',
      description: 'Công việc đã hoàn thành',
      status: task.status === 'COMPLETED' ? 'current' :
              task.status === 'APPROVED' ? 'completed' : 'pending',
      date: task.actualEndDate,
      icon: 'checkmark-outline',
      color: '#0066CC',
    },
    {
      id: 'approved',
      title: 'Nghiệm thu',
      description: 'Khách hàng xác nhận nghiệm thu',
      status: task.status === 'APPROVED' ? 'completed' : 'pending',
      icon: 'checkmark-circle',
      color: '#00C853',
    },
  ];
  
  // Add confirmations as actors
  task.confirmations.forEach(conf => {
    const step = steps.find(s => {
      if (conf.type === 'CONTRACTOR_CONFIRM' && s.id === 'completed') return true;
      if (conf.type === 'ENGINEER_CHECK' && s.id === 'pending_check') return true;
      if (conf.type === 'CLIENT_APPROVE' && s.id === 'approved') return true;
      return false;
    });
    if (step && conf.status === 'CONFIRMED') {
      step.actor = {
        name: conf.userName,
        role: conf.userRole,
      };
      step.date = conf.confirmedAt;
    }
  });
  
  return steps;
}

/**
 * Get next required action for a task based on user role
 */
export function getNextAction(
  task: ConstructionTask,
  userRole: ProgressRole
): { action: string; label: string } | null {
  switch (task.status) {
    case 'NOT_STARTED':
      if (userRole === 'CONTRACTOR') {
        return { action: 'START_WORK', label: 'Bắt đầu thi công' };
      }
      break;
    case 'IN_PROGRESS':
      if (userRole === 'CONTRACTOR') {
        return { action: 'UPDATE_PROGRESS', label: 'Cập nhật tiến độ' };
      }
      break;
    case 'PENDING_CHECK':
      if (userRole === 'ENGINEER' || userRole === 'MANAGER') {
        return { action: 'CHECK_QUALITY', label: 'Kiểm tra chất lượng' };
      }
      break;
    case 'COMPLETED':
      if (userRole === 'CLIENT') {
        return { action: 'APPROVE', label: 'Xác nhận nghiệm thu' };
      }
      break;
  }
  return null;
}
