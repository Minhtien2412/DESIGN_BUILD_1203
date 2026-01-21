/**
 * API Type Definitions
 * Shared types across all API services
 */

// ==================== COMMON TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ApiError is exported from ./client to avoid duplicate exports

// ==================== AUTH TYPES ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  username?: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==================== USER TYPES ====================

export type UserRole = "ADMIN" | "ENGINEER" | "CLIENT" | "CONTRACTOR";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== PROJECT TYPES ====================

export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  clientId: number;
  clientName?: string;
  engineerId?: number;
  engineerName?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  clientId: number;
  engineerId?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: ProjectStatus;
  progress?: number;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  clientId?: number;
  engineerId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AssignUserData {
  userId: number;
}

// ==================== DASHBOARD TYPES ====================

export interface AdminDashboard {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalRevenue: number;
    activeUsers: number;
  };
  recentProjects: Project[];
  recentActivities: Activity[];
  systemHealth: SystemHealth;
}

export interface EngineerDashboard {
  stats: {
    assignedProjects: number;
    completedTasks: number;
    pendingQC: number;
    todayTasks: number;
  };
  projects: Project[];
  tasks: Task[];
  qcInspections: any[];
}

// Payment Schedule interface
export interface PaymentSchedule {
  id: number;
  projectId: number;
  projectName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  description?: string;
}

// Project Progress interface
export interface ProjectProgress {
  id: number;
  projectId?: number;
  name: string;
  projectName?: string;
  progress: number;
  status: string;
  dueDate?: string;
  currentPhase?: string;
  lastUpdate?: string;
}

// Project Update interface
export interface ProjectUpdate {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  message?: string;
  timestamp?: string;
  type: "milestone" | "payment" | "status" | "general";
  createdAt: string;
  icon?: string;
}

export interface ClientDashboard {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedMilestones: number;
    upcomingPayments: number;
  };
  projects: Project[];
  recentUpdates: ProjectUpdate[];
  payments: PaymentSchedule[];
  totalInvestment?: number;
  totalPaid?: number;
  totalPending?: number;
  upcomingPayments?: PaymentSchedule[];
}

export interface Activity {
  id: number;
  type: string;
  message: string;
  userId: number;
  userName: string;
  timestamp: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down" | "warning" | "critical";
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
}

// ==================== TASK TYPES ====================

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED"
  | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  projectName?: string;
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  assigneeId?: number;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus;
}

export interface TaskFilters {
  projectId?: number;
  assigneeId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== TIMELINE TYPES ====================

export type PhaseStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED";

export interface ProjectTimeline {
  projectId: number;
  phases: Phase[];
  milestones: Milestone[];
  isDelayed: boolean;
  overallProgress: number;
}

export interface Phase {
  id: number;
  name: string;
  description?: string;
  projectId: number;
  status: PhaseStatus;
  progress: number;
  startDate: string;
  endDate: string;
  order: number;
  tasks: PhaseTask[];
  createdAt: string;
  updatedAt: string;
}

export interface PhaseTask {
  id: number;
  phaseId: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
}

export interface Milestone {
  id: number;
  name: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CreatePhaseData {
  name: string;
  description?: string;
  projectId: number;
  startDate: string;
  endDate: string;
  order: number;
}

export interface UpdatePhaseData extends Partial<CreatePhaseData> {
  status?: PhaseStatus;
  progress?: number;
}

export interface UpdatePhaseProgressData {
  progress: number;
  notes?: string;
}

export interface CreatePhaseTaskData {
  phaseId: number;
  title: string;
  description?: string;
  order: number;
}

export interface ReorderPhasesData {
  projectId: number;
  phaseOrders: {
    phaseId: number;
    order: number;
  }[];
}

// ==================== QC TYPES ====================

export type QCStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PASSED"
  | "FAILED"
  | "REQUIRES_REWORK";
export type BugSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type BugStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface QCCategory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QCChecklist {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  items: QCChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QCChecklistItem {
  id: number;
  checklistId: number;
  description: string;
  isRequired: boolean;
  order: number;
}

export interface QCInspection {
  id: number;
  projectId: number;
  projectName?: string;
  phaseId?: number;
  phaseName?: string;
  checklistId: number;
  checklistName?: string;
  inspectorId: number;
  inspectorName?: string;
  status: QCStatus;
  scheduledDate: string;
  completedDate?: string;
  items: QCInspectionItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QCInspectionItem {
  id: number;
  inspectionId: number;
  checklistItemId: number;
  description: string;
  isPassed: boolean;
  notes?: string;
  photos?: string[];
}

export interface Bug {
  id: number;
  projectId: number;
  projectName?: string;
  phaseId?: number;
  phaseName?: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  reporterId: number;
  reporterName?: string;
  assigneeId?: number;
  assigneeName?: string;
  photos?: string[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQCInspectionData {
  projectId: number;
  phaseId?: number;
  checklistId: number;
  scheduledDate: string;
  notes?: string;
}

export interface UpdateQCInspectionData {
  status?: QCStatus;
  completedDate?: string;
  notes?: string;
}

export interface UpdateQCInspectionItemData {
  isPassed: boolean;
  notes?: string;
  photos?: string[];
}

export interface CreateBugData {
  projectId: number;
  phaseId?: number;
  title: string;
  description: string;
  severity: BugSeverity;
  assigneeId?: number;
  photos?: string[];
}

export interface UpdateBugData extends Partial<CreateBugData> {
  status?: BugStatus;
}

export interface QCReport {
  projectId: number;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  passRate: number;
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  bugsByPhase: {
    phaseId: number;
    phaseName: string;
    bugCount: number;
  }[];
  bugsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// ==================== UPLOAD TYPES ====================

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string; // For video files
}

export interface MultiUploadResponse {
  files: UploadResponse[];
}

export interface PresignedUrlResponse {
  url: string;
  uploadUrl: string;
  filename: string;
  expiresIn: number;
}

// ==================== PRODUCT TYPES ====================

export enum ProductCategory {
  ELECTRONICS = "ELECTRONICS",
  FASHION = "FASHION",
  HOME = "HOME",
  BEAUTY = "BEAUTY",
  SPORTS = "SPORTS",
  BOOKS = "BOOKS",
  TOYS = "TOYS",
  FOOD = "FOOD",
  OTHER = "OTHER",
}

export enum ProductStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  stock: number;
  images: string[];
  createdBy: number;
  reviewedBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
  viewCount: number;
  soldCount: number;
  isBestseller: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProductQuery {
  category?: ProductCategory | string;
  status?: ProductStatus | string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  category: ProductCategory | string;
  stock: number;
  // NOTE: Backend does not accept images field in create/update
  // images?: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory | string;
  stock?: number;
  // NOTE: Backend does not accept images field in create/update
  // images?: string[];
}

export interface UpdateProductStatusDto {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
