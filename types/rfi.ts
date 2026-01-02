/**
 * Request for Information (RFI) Types
 * Manages questions, clarifications, and information requests during construction
 */

/**
 * RFI Priority Levels
 */
export enum RFIPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

/**
 * RFI Status
 */
export enum RFIStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ANSWERED = 'ANSWERED',
  CLARIFICATION_REQUIRED = 'CLARIFICATION_REQUIRED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  REOPENED = 'REOPENED',
}

/**
 * RFI Category
 */
export enum RFICategory {
  DESIGN_CLARIFICATION = 'DESIGN_CLARIFICATION',
  SPECIFICATION_CONFLICT = 'SPECIFICATION_CONFLICT',
  DRAWING_DISCREPANCY = 'DRAWING_DISCREPANCY',
  MATERIAL_SUBSTITUTION = 'MATERIAL_SUBSTITUTION',
  CONSTRUCTION_METHOD = 'CONSTRUCTION_METHOD',
  COORDINATION = 'COORDINATION',
  FIELD_CONDITION = 'FIELD_CONDITION',
  CODE_COMPLIANCE = 'CODE_COMPLIANCE',
  SCHEDULING = 'SCHEDULING',
  COST_IMPACT = 'COST_IMPACT',
  SAFETY = 'SAFETY',
  QUALITY = 'QUALITY',
  OTHER = 'OTHER',
}

/**
 * RFI Impact Level
 */
export enum RFIImpact {
  NO_IMPACT = 'NO_IMPACT',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SIGNIFICANT = 'SIGNIFICANT',
  CRITICAL = 'CRITICAL',
}

/**
 * Response Type
 */
export enum ResponseType {
  ANSWER = 'ANSWER',
  CLARIFICATION_REQUEST = 'CLARIFICATION_REQUEST',
  REDIRECT = 'REDIRECT',
  SEE_ATTACHED = 'SEE_ATTACHED',
  NO_RESPONSE_REQUIRED = 'NO_RESPONSE_REQUIRED',
}

/**
 * Request for Information (RFI)
 */
export interface RFI {
  id: string;
  rfiNumber: string;
  revisionNumber: string;
  projectId: string;
  projectName: string;

  // Classification
  category: RFICategory;
  subject: string;
  description: string;
  status: RFIStatus;
  priority: RFIPriority;

  // Initiator
  createdBy: {
    id: string;
    name: string;
    company: string;
    role: string;
    email: string;
    phone?: string;
  };
  createdDate: string;

  // Assignment
  assignedTo: {
    id: string;
    name: string;
    company: string;
    role: string;
    email: string;
  };
  assignedDate?: string;

  // Dates & Timing
  submittedDate?: string;
  requiredDate: string;
  responseDueDate?: string;
  responseDays: number;
  respondedDate?: string;
  closedDate?: string;

  // Question Details
  question: string;
  backgroundInfo?: string;
  proposedSolution?: string;
  references: {
    drawings?: string[];
    specifications?: string[];
    submittals?: string[];
    otherRFIs?: string[];
  };

  // Location
  location: {
    building?: string;
    floor?: string;
    zone?: string;
    gridLine?: string;
    room?: string;
    specificLocation?: string;
  };

  // Impact Assessment
  impact: {
    level: RFIImpact;
    schedule: {
      affectsSchedule: boolean;
      delayDays?: number;
      affectedActivities?: string[];
      criticalPath?: boolean;
    };
    cost: {
      affectsCost: boolean;
      estimatedAmount?: number;
      currency?: string;
      costType?: 'INCREASE' | 'DECREASE' | 'TBD';
    };
    safety: {
      affectsSafety: boolean;
      description?: string;
    };
  };

  // Response
  response?: RFIResponse;
  responseType?: ResponseType;
  responseBy?: {
    id: string;
    name: string;
    role: string;
    company: string;
  };

  // Attachments
  attachments: RFIAttachment[];
  totalAttachments: number;

  // Related Items
  relatedItems: {
    submittals?: string[];
    drawings?: string[];
    changeOrders?: string[];
    otherRFIs?: string[];
  };

  // Tracking
  isOverdue: boolean;
  daysOverdue?: number;
  responseDuration?: number; // in days
  revisions: RFIRevision[];
  previousVersion?: string;

  // Distribution
  distributionList: {
    id: string;
    name: string;
    company: string;
    role: string;
    email: string;
    notificationSent: boolean;
  }[];

  // Workflow
  workflowSteps: RFIWorkflowStep[];
  currentStep: number;

  // Notes & Tags
  notes?: string;
  tags?: string[];
}

/**
 * RFI Response
 */
export interface RFIResponse {
  id: string;
  rfiId: string;
  responseNumber: string;
  responseType: ResponseType;
  answer: string;
  recommendation?: string;
  technicalJustification?: string;
  respondedBy: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
  respondedDate: string;
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
    reviewDate: string;
  };
  attachments: RFIAttachment[];
  requiresFollowUp: boolean;
  followUpDueDate?: string;
  additionalComments?: string;
}

/**
 * RFI Attachment
 */
export interface RFIAttachment {
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
  category: 'QUESTION' | 'REFERENCE' | 'RESPONSE' | 'CLARIFICATION' | 'GENERAL';
}

/**
 * RFI Workflow Step
 */
export interface RFIWorkflowStep {
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
 * RFI Revision
 */
export interface RFIRevision {
  revisionNumber: string;
  rfiId: string;
  submittedDate: string;
  submittedBy: string;
  status: RFIStatus;
  responseType?: ResponseType;
  respondedDate?: string;
  respondedBy?: string;
  changes: string;
  attachments: RFIAttachment[];
}

/**
 * RFI Log Entry
 */
export interface RFILog {
  id: string;
  rfiId: string;
  rfiNumber: string;
  action:
    | 'CREATED'
    | 'SUBMITTED'
    | 'ASSIGNED'
    | 'REASSIGNED'
    | 'RESPONDED'
    | 'CLARIFICATION_REQUESTED'
    | 'REVISED'
    | 'CLOSED'
    | 'REOPENED'
    | 'CANCELLED'
    | 'COMMENTED'
    | 'ATTACHMENT_ADDED'
    | 'STATUS_CHANGED';
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  performedAt: string;
  details: {
    fromStatus?: RFIStatus;
    toStatus?: RFIStatus;
    fromAssignee?: string;
    toAssignee?: string;
    responseType?: ResponseType;
    comments?: string;
    attachmentName?: string;
  };
  description: string;
}

/**
 * RFI Template
 */
export interface RFITemplate {
  id: string;
  name: string;
  category: RFICategory;
  description?: string;
  defaultAssignee?: {
    role: string;
    company?: string;
  };
  defaultPriority: RFIPriority;
  defaultResponseDays: number;
  questionTemplate: string;
  requiredFields: string[];
  distributionList: string[]; // role IDs
  checklist?: {
    item: string;
    required: boolean;
  }[];
  instructions?: string;
  isActive: boolean;
}

/**
 * RFI Register Entry (for reporting)
 */
export interface RFIRegisterEntry {
  rfiNumber: string;
  revisionNumber: string;
  category: RFICategory;
  subject: string;
  status: RFIStatus;
  priority: RFIPriority;
  createdBy: string;
  createdDate: string;
  assignedTo: string;
  submittedDate?: string;
  requiredDate: string;
  responseDueDate?: string;
  respondedDate?: string;
  responseType?: ResponseType;
  responseDuration?: number;
  isOverdue: boolean;
  daysOverdue?: number;
  impactLevel: RFIImpact;
  affectsSchedule: boolean;
  affectsCost: boolean;
  location: string;
}

/**
 * RFI Schedule
 */
export interface RFISchedule {
  projectId: string;
  rfis: {
    rfiNumber: string;
    subject: string;
    category: RFICategory;
    priority: RFIPriority;
    status: RFIStatus;
    createdDate: string;
    plannedSubmitDate: string;
    actualSubmitDate?: string;
    requiredResponseDate: string;
    actualResponseDate?: string;
    isLate: boolean;
    daysLate?: number;
    relatedActivity?: string;
    criticalPath: boolean;
  }[];
  milestones: {
    name: string;
    date: string;
    rfis: string[];
  }[];
  summary: {
    totalRFIs: number;
    submitted: number;
    answered: number;
    pending: number;
    overdue: number;
  };
}

/**
 * RFI Analytics
 */
export interface RFIAnalytics {
  summary: {
    total: number;
    submitted: number;
    underReview: number;
    answered: number;
    closed: number;
    overdue: number;
    averageResponseDays: number;
  };
  byCategory: {
    category: RFICategory;
    count: number;
    answered: number;
    pending: number;
    averageResponseDays: number;
  }[];
  byStatus: {
    status: RFIStatus;
    count: number;
    percentage: number;
  }[];
  byPriority: {
    priority: RFIPriority;
    count: number;
    answered: number;
    pending: number;
    averageResponseDays: number;
  }[];
  byImpact: {
    impact: RFIImpact;
    count: number;
    percentage: number;
  }[];
  responsePerformance: {
    averageResponseDays: number;
    onTimeResponseRate: number; // percentage
    overdueCount: number;
    fastestResponse: number; // in days
    slowestResponse: number; // in days
    within7Days: number;
    within14Days: number;
    over14Days: number;
  };
  trendData: {
    period: string;
    created: number;
    answered: number;
    closed: number;
    pending: number;
  }[];
  topInitiators: {
    userId: string;
    name: string;
    company: string;
    count: number;
    answered: number;
    pending: number;
    averageResponseDays: number;
  }[];
  topResponders: {
    userId: string;
    name: string;
    company: string;
    count: number;
    averageResponseDays: number;
    onTimeRate: number;
  }[];
  criticalRFIs: {
    rfiNumber: string;
    subject: string;
    priority: RFIPriority;
    daysOverdue: number;
    impactLevel: RFIImpact;
    affectedActivities: string[];
  }[];
  impactAnalysis: {
    scheduleImpact: {
      totalRFIs: number;
      totalDelayDays: number;
      criticalPathImpact: number;
    };
    costImpact: {
      totalRFIs: number;
      totalEstimatedCost: number;
      currency: string;
    };
    safetyImpact: {
      totalRFIs: number;
      criticalCount: number;
    };
  };
  complianceMetrics: {
    onTimeResponseRate: number;
    averageResolutionDays: number;
    closureRate: number;
    reopenRate: number;
  };
}

/**
 * API Parameters
 */
export interface GetRFIsParams {
  projectId?: string;
  category?: RFICategory;
  status?: RFIStatus;
  priority?: RFIPriority;
  createdById?: string;
  assignedToId?: string;
  startDate?: string;
  endDate?: string;
  isOverdue?: boolean;
  search?: string;
}

export interface CreateRFIParams {
  projectId: string;
  category: RFICategory;
  subject: string;
  description: string;
  priority: RFIPriority;
  question: string;
  backgroundInfo?: string;
  proposedSolution?: string;
  requiredDate: string;
  responseDays: number;
  assignedToId: string;
  location?: {
    building?: string;
    floor?: string;
    zone?: string;
    gridLine?: string;
    room?: string;
    specificLocation?: string;
  };
  references?: {
    drawings?: string[];
    specifications?: string[];
    submittals?: string[];
    otherRFIs?: string[];
  };
  impact?: {
    level: RFIImpact;
    schedule?: {
      affectsSchedule: boolean;
      delayDays?: number;
      affectedActivities?: string[];
      criticalPath?: boolean;
    };
    cost?: {
      affectsCost: boolean;
      estimatedAmount?: number;
      currency?: string;
      costType?: 'INCREASE' | 'DECREASE' | 'TBD';
    };
    safety?: {
      affectsSafety: boolean;
      description?: string;
    };
  };
  distributionList?: string[];
  notes?: string;
  tags?: string[];
}

export interface UpdateRFIParams {
  subject?: string;
  description?: string;
  priority?: RFIPriority;
  question?: string;
  backgroundInfo?: string;
  proposedSolution?: string;
  requiredDate?: string;
  assignedToId?: string;
  location?: {
    building?: string;
    floor?: string;
    zone?: string;
    gridLine?: string;
    room?: string;
    specificLocation?: string;
  };
  impact?: {
    level: RFIImpact;
    schedule?: {
      affectsSchedule: boolean;
      delayDays?: number;
      affectedActivities?: string[];
      criticalPath?: boolean;
    };
    cost?: {
      affectsCost: boolean;
      estimatedAmount?: number;
      currency?: string;
      costType?: 'INCREASE' | 'DECREASE' | 'TBD';
    };
    safety?: {
      affectsSafety: boolean;
      description?: string;
    };
  };
  notes?: string;
  tags?: string[];
}

export interface RespondToRFIParams {
  responseType: ResponseType;
  answer: string;
  recommendation?: string;
  technicalJustification?: string;
  requiresFollowUp?: boolean;
  followUpDueDate?: string;
  additionalComments?: string;
}

export interface RequestClarificationParams {
  clarificationRequest: string;
  specificQuestions: string[];
  responseByDate: string;
}
