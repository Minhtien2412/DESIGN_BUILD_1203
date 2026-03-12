/**
 * Change Order Types
 * Manages construction change orders and variations
 */

/**
 * Change Order Type
 */
export enum ChangeOrderType {
  SCOPE_CHANGE = 'SCOPE_CHANGE',
  DESIGN_CHANGE = 'DESIGN_CHANGE',
  MATERIAL_SUBSTITUTION = 'MATERIAL_SUBSTITUTION',
  FIELD_CONDITION = 'FIELD_CONDITION',
  OWNER_REQUEST = 'OWNER_REQUEST',
  REGULATORY_REQUIREMENT = 'REGULATORY_REQUIREMENT',
  VALUE_ENGINEERING = 'VALUE_ENGINEERING',
  ERROR_OMISSION = 'ERROR_OMISSION',
  CONSTRUCTABILITY = 'CONSTRUCTABILITY',
  UNFORESEEN_CONDITION = 'UNFORESEEN_CONDITION',
  OTHER = 'OTHER',
}

/**
 * Change Order Status
 */
export enum ChangeOrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IMPLEMENTED = 'IMPLEMENTED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

/**
 * Change Order Priority
 */
export enum ChangeOrderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

/**
 * Cost Impact Type
 */
export enum CostImpactType {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  NO_IMPACT = 'NO_IMPACT',
}

/**
 * Schedule Impact Type
 */
export enum ScheduleImpactType {
  DELAY = 'DELAY',
  ACCELERATION = 'ACCELERATION',
  NO_IMPACT = 'NO_IMPACT',
}

/**
 * Approval Level
 */
export enum ApprovalLevel {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SENIOR_MANAGER = 'SENIOR_MANAGER',
  DIRECTOR = 'DIRECTOR',
  OWNER = 'OWNER',
  BOARD = 'BOARD',
}

/**
 * Change Order
 */
export interface ChangeOrder {
  id: string;
  changeOrderNumber: string;
  revisionNumber: string;
  projectId: string;
  projectName: string;

  // Classification
  type: ChangeOrderType;
  category: string;
  title: string;
  description: string;
  justification: string;
  status: ChangeOrderStatus;
  priority: ChangeOrderPriority;

  // Initiator
  requestedBy: {
    id: string;
    name: string;
    company: string;
    role: string;
    email: string;
    phone?: string;
  };
  requestedDate: string;

  // Dates
  submittedDate?: string;
  requiredDate: string;
  approvalDueDate?: string;
  approvedDate?: string;
  implementationDate?: string;
  completedDate?: string;

  // Cost Impact
  costImpact: {
    type: CostImpactType;
    originalAmount: number;
    proposedAmount: number;
    changeAmount: number;
    currency: string;
    breakdown: {
      labor?: number;
      material?: number;
      equipment?: number;
      subcontractor?: number;
      overhead?: number;
      contingency?: number;
      other?: number;
    };
    estimatedBy: string;
    estimatedDate: string;
    verified: boolean;
    verifiedBy?: string;
    verifiedDate?: string;
  };

  // Schedule Impact
  scheduleImpact: {
    type: ScheduleImpactType;
    originalDuration: number; // days
    proposedDuration: number; // days
    changeDuration: number; // days
    affectedActivities: string[];
    criticalPath: boolean;
    proposedMitigation?: string;
  };

  // Scope Details
  scopeChange: {
    originalScope: string;
    proposedScope: string;
    deletions?: string[];
    additions?: string[];
    modifications?: string[];
  };

  // Related Items
  relatedItems: {
    rfis?: string[];
    submittals?: string[];
    drawings?: string[];
    specifications?: string[];
    otherChangeOrders?: string[];
  };

  // Approval Workflow
  approvalWorkflow: ChangeOrderApproval[];
  currentApprover?: {
    id: string;
    name: string;
    role: string;
    level: ApprovalLevel;
  };
  requiredApprovalLevel: ApprovalLevel;

  // Attachments
  attachments: ChangeOrderAttachment[];
  totalAttachments: number;

  // Implementation
  implementation?: {
    assignedTo: string;
    assignedDate: string;
    startDate?: string;
    targetCompletionDate: string;
    actualCompletionDate?: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    progress: number; // percentage
    workLog: {
      date: string;
      description: string;
      performedBy: string;
    }[];
  };

  // Financial Tracking
  financial: {
    budgetCode?: string;
    costCenter?: string;
    billingStatus: 'NOT_BILLED' | 'PARTIALLY_BILLED' | 'FULLY_BILLED';
    billedAmount: number;
    outstandingAmount: number;
    paymentTerms?: string;
  };

  // Tracking
  revisions: ChangeOrderRevision[];
  previousVersion?: string;
  supersededBy?: string;

  // Workflow Steps
  workflowSteps: ChangeOrderWorkflowStep[];
  currentStep: number;

  // Notes & Tags
  notes?: string;
  tags?: string[];
}

/**
 * Change Order Approval
 */
export interface ChangeOrderApproval {
  id: string;
  level: ApprovalLevel;
  approver: {
    id: string;
    name: string;
    role: string;
    company: string;
    email: string;
  };
  order: number;
  isRequired: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'DELEGATED';
  requestedDate?: string;
  dueDate?: string;
  reviewedDate?: string;
  decision?: 'APPROVE' | 'REJECT' | 'CONDITIONAL_APPROVE' | 'REQUEST_REVISION';
  conditions?: string[];
  comments?: string;
  attachments?: ChangeOrderAttachment[];
  delegatedTo?: {
    id: string;
    name: string;
    role: string;
  };
}

/**
 * Change Order Attachment
 */
export interface ChangeOrderAttachment {
  id: string;
  name: string;
  type: 'PDF' | 'DWG' | 'IMAGE' | 'EXCEL' | 'WORD' | 'OTHER';
  size: number; // in bytes
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  version?: string;
  description?: string;
  category: 'PROPOSAL' | 'JUSTIFICATION' | 'COST_ESTIMATE' | 'DRAWING' | 'APPROVAL' | 'IMPLEMENTATION' | 'GENERAL';
}

/**
 * Change Order Workflow Step
 */
export interface ChangeOrderWorkflowStep {
  step: number;
  name: string;
  description?: string;
  assignee?: string;
  assigneeRole: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  duration?: number; // in hours
  actionTaken?: string;
  comments?: string;
}

/**
 * Change Order Revision
 */
export interface ChangeOrderRevision {
  revisionNumber: string;
  changeOrderId: string;
  submittedDate: string;
  submittedBy: string;
  status: ChangeOrderStatus;
  approvalStatus?: 'APPROVED' | 'REJECTED' | 'PENDING';
  approvedDate?: string;
  approvedBy?: string;
  changes: string;
  costChange?: number;
  scheduleChange?: number;
  attachments: ChangeOrderAttachment[];
}

/**
 * Change Order Log Entry
 */
export interface ChangeOrderLog {
  id: string;
  changeOrderId: string;
  changeOrderNumber: string;
  action:
    | 'CREATED'
    | 'SUBMITTED'
    | 'REVIEWED'
    | 'APPROVED'
    | 'REJECTED'
    | 'REVISED'
    | 'IMPLEMENTED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'COMMENTED'
    | 'ATTACHMENT_ADDED'
    | 'STATUS_CHANGED'
    | 'DELEGATED';
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  performedAt: string;
  details: {
    fromStatus?: ChangeOrderStatus;
    toStatus?: ChangeOrderStatus;
    decision?: string;
    comments?: string;
    attachmentName?: string;
    delegatedTo?: string;
  };
  description: string;
}

/**
 * Change Order Template
 */
export interface ChangeOrderTemplate {
  id: string;
  name: string;
  type: ChangeOrderType;
  description?: string;
  defaultPriority: ChangeOrderPriority;
  requiredApprovalLevel: ApprovalLevel;
  approvalWorkflow: {
    level: ApprovalLevel;
    role: string;
    order: number;
    required: boolean;
    autoApproveThreshold?: number; // amount
  }[];
  requiredFields: string[];
  requiredAttachments: string[];
  checklist?: {
    item: string;
    required: boolean;
  }[];
  instructions?: string;
  isActive: boolean;
}

/**
 * Change Order Register Entry (for reporting)
 */
export interface ChangeOrderRegisterEntry {
  changeOrderNumber: string;
  revisionNumber: string;
  type: ChangeOrderType;
  title: string;
  status: ChangeOrderStatus;
  priority: ChangeOrderPriority;
  requestedBy: string;
  requestedDate: string;
  approvedDate?: string;
  costImpactType: CostImpactType;
  costChange: number;
  scheduleImpactType: ScheduleImpactType;
  scheduleDays: number;
  currentApprover?: string;
  implementationStatus?: string;
}

/**
 * Change Order Summary
 */
export interface ChangeOrderSummary {
  projectId: string;
  changeOrders: {
    changeOrderNumber: string;
    title: string;
    type: ChangeOrderType;
    status: ChangeOrderStatus;
    requestedDate: string;
    approvedDate?: string;
    costChange: number;
    scheduleDays: number;
  }[];
  summary: {
    totalChangeOrders: number;
    approved: number;
    pending: number;
    rejected: number;
    totalCostIncrease: number;
    totalCostDecrease: number;
    netCostChange: number;
    totalScheduleDelay: number;
    totalScheduleAcceleration: number;
    netScheduleChange: number;
    currency: string;
  };
}

/**
 * Change Order Analytics
 */
export interface ChangeOrderAnalytics {
  summary: {
    total: number;
    draft: number;
    submitted: number;
    underReview: number;
    approved: number;
    rejected: number;
    implemented: number;
    averageApprovalDays: number;
  };
  byType: {
    type: ChangeOrderType;
    count: number;
    approved: number;
    rejected: number;
    totalCostImpact: number;
    averageApprovalDays: number;
  }[];
  byStatus: {
    status: ChangeOrderStatus;
    count: number;
    percentage: number;
  }[];
  byPriority: {
    priority: ChangeOrderPriority;
    count: number;
    approved: number;
    pending: number;
    averageApprovalDays: number;
  }[];
  costAnalysis: {
    totalIncrease: number;
    totalDecrease: number;
    netChange: number;
    currency: string;
    byCategory: {
      category: string;
      increase: number;
      decrease: number;
      net: number;
    }[];
    budgetImpact: {
      originalBudget: number;
      currentBudget: number;
      variance: number;
      percentageChange: number;
    };
  };
  scheduleAnalysis: {
    totalDelay: number; // days
    totalAcceleration: number; // days
    netChange: number; // days
    criticalPathImpact: number;
    averageDelay: number;
  };
  approvalPerformance: {
    averageApprovalDays: number;
    onTimeApprovalRate: number; // percentage
    overdueCount: number;
    fastestApproval: number; // in days
    slowestApproval: number; // in days
    within7Days: number;
    within14Days: number;
    over14Days: number;
  };
  trendData: {
    period: string;
    created: number;
    approved: number;
    rejected: number;
    costImpact: number;
    scheduleDays: number;
  }[];
  topInitiators: {
    userId: string;
    name: string;
    company: string;
    count: number;
    approved: number;
    rejected: number;
    totalCostImpact: number;
    approvalRate: number;
  }[];
  implementationTracking: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    onHold: number;
    averageCompletionDays: number;
    onTimeCompletionRate: number;
  };
}

/**
 * API Parameters
 */
export interface GetChangeOrdersParams {
  projectId?: string;
  type?: ChangeOrderType;
  status?: ChangeOrderStatus;
  priority?: ChangeOrderPriority;
  requestedById?: string;
  approverId?: string;
  startDate?: string;
  endDate?: string;
  costImpactType?: CostImpactType;
  minCostImpact?: number;
  maxCostImpact?: number;
  search?: string;
}

export interface CreateChangeOrderParams {
  projectId: string;
  type: ChangeOrderType;
  category: string;
  title: string;
  description: string;
  justification: string;
  priority: ChangeOrderPriority;
  requiredDate: string;
  scopeChange: {
    originalScope: string;
    proposedScope: string;
    deletions?: string[];
    additions?: string[];
    modifications?: string[];
  };
  costImpact: {
    type: CostImpactType;
    originalAmount: number;
    proposedAmount: number;
    currency: string;
    breakdown?: {
      labor?: number;
      material?: number;
      equipment?: number;
      subcontractor?: number;
      overhead?: number;
      contingency?: number;
      other?: number;
    };
  };
  scheduleImpact: {
    type: ScheduleImpactType;
    originalDuration: number;
    proposedDuration: number;
    affectedActivities?: string[];
    criticalPath?: boolean;
    proposedMitigation?: string;
  };
  relatedItems?: {
    rfis?: string[];
    submittals?: string[];
    drawings?: string[];
    specifications?: string[];
    otherChangeOrders?: string[];
  };
  notes?: string;
  tags?: string[];
}

export interface UpdateChangeOrderParams {
  title?: string;
  description?: string;
  justification?: string;
  priority?: ChangeOrderPriority;
  requiredDate?: string;
  scopeChange?: {
    originalScope: string;
    proposedScope: string;
    deletions?: string[];
    additions?: string[];
    modifications?: string[];
  };
  costImpact?: {
    type: CostImpactType;
    originalAmount: number;
    proposedAmount: number;
    breakdown?: {
      labor?: number;
      material?: number;
      equipment?: number;
      subcontractor?: number;
      overhead?: number;
      contingency?: number;
      other?: number;
    };
  };
  scheduleImpact?: {
    type: ScheduleImpactType;
    originalDuration: number;
    proposedDuration: number;
    affectedActivities?: string[];
    criticalPath?: boolean;
    proposedMitigation?: string;
  };
  notes?: string;
  tags?: string[];
}

export interface ApproveChangeOrderParams {
  decision: 'APPROVE' | 'REJECT' | 'CONDITIONAL_APPROVE' | 'REQUEST_REVISION';
  comments?: string;
  conditions?: string[];
}

export interface ImplementChangeOrderParams {
  assignedTo: string;
  targetCompletionDate: string;
  notes?: string;
}
