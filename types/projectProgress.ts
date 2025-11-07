/**
 * Project Progress Management Types
 * Quản lý tiến độ dự án và thanh toán
 */

export interface ProjectTask {
  id: string;
  projectId: string;
  name: string;
  description: string;
  category: 'foundation' | 'structure' | 'roofing' | 'walls' | 'electrical' | 'plumbing' | 'finishing' | 'landscaping';
  estimatedDuration: number; // days
  actualDuration?: number; // days
  startDate?: string;
  endDate?: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'delayed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[]; // task IDs
  assignedTo: {
    type: 'contractor' | 'company' | 'worker';
    id: string;
    name: string;
    contact: string;
  };
  submissions: TaskSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  submittedBy: {
    type: 'contractor' | 'company' | 'worker';
    id: string;
    name: string;
  };
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'revision-required';
  completionPercentage: number; // 0-100
  description: string;
  evidencePhotos: string[]; // photo URLs
  evidenceDocuments: string[]; // document URLs
  qualityScore?: number; // 1-10
  reviewNotes?: string;
  reviewedBy?: {
    id: string;
    name: string;
    role: 'admin' | 'manager' | 'supervisor';
  };
  submittedAt: string;
  reviewedAt?: string;
}

export interface ProjectPayment {
  id: string;
  projectId: string;
  type: 'milestone' | 'progress' | 'material' | 'bonus' | 'penalty';
  category: 'initial' | 'foundation' | 'structure' | 'finishing' | 'final' | 'retention';
  amount: number;
  scheduledAmount: number;
  currency: 'VND' | 'USD';
  status: 'scheduled' | 'pending' | 'processing' | 'completed' | 'overdue' | 'cancelled';
  dueDate: string;
  completedDate?: string;
  
  // Payment triggers
  triggerType: 'time-based' | 'task-completion' | 'milestone' | 'manual';
  triggerConditions: {
    requiredTasks?: string[]; // task IDs that must be completed
    requiredMilestone?: string;
    requiredDate?: string;
    requiredApproval?: boolean;
  };
  
  // Approval workflow
  approvalStatus: 'pending' | 'manager-approved' | 'admin-approved' | 'rejected';
  approvedBy?: {
    managerId?: string;
    managerName?: string;
    managerApprovedAt?: string;
    adminId?: string;
    adminName?: string;
    adminApprovedAt?: string;
  };
  rejectionReason?: string;
  
  // Payment details
  paymentMethod: 'bank-transfer' | 'cash' | 'check' | 'digital-wallet';
  paymentReference?: string;
  invoiceNumber?: string;
  taxAmount?: number;
  netAmount: number;
  
  // Related entities
  relatedTasks: string[]; // task IDs
  contractorId?: string;
  contractorName?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PaymentSchedule {
  id: string;
  projectId: string;
  totalBudget: number;
  currency: 'VND' | 'USD';
  
  // Payment breakdown
  breakdown: {
    initial: number; // % of total
    foundation: number;
    structure: number;
    finishing: number;
    final: number;
    retention: number; // held for warranty period
  };
  
  // Scheduled payments
  scheduledPayments: ProjectPayment[];
  
  // Financial tracking
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  retentionAmount: number;
  retentionReleaseDate: string;
  
  // Budget variance
  budgetVariance: number; // actual vs planned
  costOverruns: {
    category: string;
    planned: number;
    actual: number;
    variance: number;
    reason: string;
  }[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  projectId: string;
  overallProgress: number; // 0-100
  
  // Task progress
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  delayedTasks: number;
  
  // Phase progress
  phases: {
    [key: string]: {
      name: string;
      progress: number; // 0-100
      status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
      tasks: string[]; // task IDs
      startDate?: string;
      endDate?: string;
      estimatedCompletion?: string;
    };
  };
  
  // Timeline tracking
  originalStartDate: string;
  originalEndDate: string;
  actualStartDate?: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  daysDelayed: number;
  
  // Quality metrics
  qualityMetrics: {
    averageQualityScore: number;
    tasksRequiringRevision: number;
    qualityIssues: {
      taskId: string;
      taskName: string;
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      status: 'open' | 'resolved';
      reportedAt: string;
    }[];
  };
  
  // Financial progress
  budgetUtilization: number; // % of budget used
  costEfficiency: number; // planned vs actual cost ratio
  
  lastUpdated: string;
}

export interface ProgressDashboard {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  
  progress: ProjectProgress;
  paymentSchedule: PaymentSchedule;
  recentSubmissions: TaskSubmission[];
  upcomingPayments: ProjectPayment[];
  alerts: {
    type: 'delay' | 'budget' | 'quality' | 'payment';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    taskId?: string;
    paymentId?: string;
    createdAt: string;
  }[];
  
  // Performance indicators
  kpis: {
    schedulePerformance: number; // SPI
    costPerformance: number; // CPI
    qualityIndex: number;
    stakeholderSatisfaction: number;
  };
}

// User role types for different workflows
export type UserRole = 'admin' | 'manager' | 'supervisor' | 'contractor' | 'worker';

export interface ProgressFilters {
  projectId?: string;
  status?: ProjectTask['status'][];
  category?: ProjectTask['category'][];
  assignedTo?: string;
  priority?: ProjectTask['priority'][];
  dateRange?: {
    from: string;
    to: string;
  };
  paymentStatus?: ProjectPayment['status'][];
  approvalStatus?: ProjectPayment['approvalStatus'][];
}