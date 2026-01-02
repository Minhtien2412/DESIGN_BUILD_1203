/**
 * Submittal Management Types
 */

// Enums
export enum SubmittalType {
  PRODUCT_DATA = 'PRODUCT_DATA',
  SHOP_DRAWING = 'SHOP_DRAWING',
  SAMPLE = 'SAMPLE',
  MOCK_UP = 'MOCK_UP',
  MATERIAL_CERTIFICATE = 'MATERIAL_CERTIFICATE',
  TEST_REPORT = 'TEST_REPORT',
  WARRANTY = 'WARRANTY',
  OPERATION_MANUAL = 'OPERATION_MANUAL',
  MAINTENANCE_MANUAL = 'MAINTENANCE_MANUAL',
  AS_BUILT_DRAWING = 'AS_BUILT_DRAWING',
  METHOD_STATEMENT = 'METHOD_STATEMENT',
  QUALITY_PLAN = 'QUALITY_PLAN',
  SAFETY_PLAN = 'SAFETY_PLAN',
  OTHER = 'OTHER',
}

export enum SubmittalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  APPROVED_AS_NOTED = 'APPROVED_AS_NOTED',
  REVISE_AND_RESUBMIT = 'REVISE_AND_RESUBMIT',
  REJECTED = 'REJECTED',
  SUPERSEDED = 'SUPERSEDED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum SubmittalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum ActionCode {
  NO_EXCEPTION = 'NO_EXCEPTION',
  AS_NOTED = 'AS_NOTED',
  REVISE_RESUBMIT = 'REVISE_RESUBMIT',
  REJECTED = 'REJECTED',
  FOR_INFORMATION = 'FOR_INFORMATION',
  WITHDRAWN = 'WITHDRAWN',
}

// Submittal
export interface Submittal {
  id: string;
  submittalNumber: string;
  revisionNumber: string;
  projectId: string;
  projectName: string;
  
  // Classification
  type: SubmittalType;
  category?: string;
  specSection: string; // e.g., "03 30 00 - Cast-in-Place Concrete"
  title: string;
  description: string;
  
  // Status & Priority
  status: SubmittalStatus;
  priority: SubmittalPriority;
  
  // Submitter Information
  submittedBy: {
    id: string;
    name: string;
    company: string;
    role: string; // Contractor, Subcontractor, Supplier
    email: string;
    phone?: string;
  };
  submittedDate?: string;
  
  // Required Information
  requiredDate: string;
  leadTime: number; // days
  deliveryDate?: string;
  
  // Review Information
  reviewers: SubmittalReviewer[];
  currentReviewer?: string;
  reviewDueDate?: string;
  reviewedDate?: string;
  reviewDuration?: number; // days
  
  // Response
  actionCode?: ActionCode;
  reviewComments?: string;
  markups?: string[]; // URLs to marked-up documents
  
  // Related Information
  relatedSubmittals?: string[];
  relatedRFIs?: string[];
  relatedDrawings?: string[];
  affectedActivities?: string[];
  
  // Documents
  documents: SubmittalDocument[];
  totalDocuments: number;
  
  // Workflow
  workflow: SubmittalWorkflowStep[];
  currentStep?: number;
  
  // Tracking
  responseDays?: number;
  isOverdue: boolean;
  daysOverdue?: number;
  
  // History
  revisions?: SubmittalRevision[];
  previousSubmittalId?: string;
  supersededBy?: string;
  
  // Notes
  purpose?: string;
  notes?: string;
  tags?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

// Submittal Document
export interface SubmittalDocument {
  id: string;
  name: string;
  type: 'PDF' | 'DWG' | 'IMAGE' | 'EXCEL' | 'WORD' | 'OTHER';
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  version?: string;
  isMarkedUp?: boolean;
  markupUrl?: string;
  description?: string;
}

// Submittal Reviewer
export interface SubmittalReviewer {
  id: string;
  userId: string;
  name: string;
  role: string; // Architect, Engineer, Project Manager, QC Manager
  company: string;
  email: string;
  
  order: number; // Review sequence
  isRequired: boolean;
  
  status: ReviewStatus;
  assignedDate: string;
  dueDate: string;
  reviewedDate?: string;
  
  actionCode?: ActionCode;
  comments?: string;
  markups?: string[];
  
  notificationSent?: boolean;
  remindersSent?: number;
}

// Submittal Workflow Step
export interface SubmittalWorkflowStep {
  step: number;
  name: string;
  description?: string;
  assignee?: string;
  assigneeRole?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  duration?: number; // hours
  actionTaken?: string;
  comments?: string;
}

// Submittal Revision
export interface SubmittalRevision {
  revisionNumber: string;
  submittalId: string;
  submittedDate: string;
  submittedBy: string;
  status: SubmittalStatus;
  actionCode?: ActionCode;
  reviewedDate?: string;
  reviewedBy?: string;
  changes: string;
  documents: string[];
}

// Submittal Register Entry
export interface SubmittalRegisterEntry {
  submittalNumber: string;
  specSection: string;
  title: string;
  type: SubmittalType;
  submitter: string;
  submittedDate?: string;
  requiredDate: string;
  status: SubmittalStatus;
  actionCode?: ActionCode;
  reviewedDate?: string;
  daysToReview?: number;
  isOverdue: boolean;
}

// Submittal Log
export interface SubmittalLog {
  id: string;
  submittalId: string;
  submittalNumber: string;
  
  action: 'CREATED' | 'SUBMITTED' | 'ASSIGNED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'REVISED' | 'RESUBMITTED' | 'WITHDRAWN' | 'SUPERSEDED' | 'COMMENTED' | 'DOCUMENT_ADDED' | 'STATUS_CHANGED';
  
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  performedAt: string;
  
  details?: {
    fromStatus?: SubmittalStatus;
    toStatus?: SubmittalStatus;
    actionCode?: ActionCode;
    comments?: string;
    documentName?: string;
    [key: string]: any;
  };
  
  description: string;
}

// Submittal Template
export interface SubmittalTemplate {
  id: string;
  name: string;
  type: SubmittalType;
  category?: string;
  specSection?: string;
  
  description?: string;
  
  // Default Workflow
  defaultReviewers: {
    role: string;
    order: number;
    isRequired: boolean;
    reviewDays: number;
  }[];
  
  defaultLeadTime: number; // days
  defaultPriority: SubmittalPriority;
  
  // Required Fields
  requiredFields: string[];
  requiredDocuments: string[];
  
  // Checklist
  checklist?: {
    item: string;
    isRequired: boolean;
  }[];
  
  // Instructions
  instructions?: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Submittal Schedule
export interface SubmittalSchedule {
  projectId: string;
  submittals: {
    submittalNumber: string;
    title: string;
    type: SubmittalType;
    specSection: string;
    
    plannedSubmitDate: string;
    actualSubmitDate?: string;
    
    requiredDate: string;
    approvalDate?: string;
    
    status: SubmittalStatus;
    priority: SubmittalPriority;
    
    submitter: string;
    
    isLate: boolean;
    daysLate?: number;
    
    relatedActivity?: string;
    criticalPath?: boolean;
  }[];
  
  milestones: {
    date: string;
    title: string;
    submittals: string[];
  }[];
  
  summary: {
    total: number;
    submitted: number;
    approved: number;
    pending: number;
    overdue: number;
  };
}

// Submittal Analytics
export interface SubmittalAnalytics {
  summary: {
    totalSubmittals: number;
    submitted: number;
    underReview: number;
    approved: number;
    rejected: number;
    pending: number;
    overdue: number;
  };
  
  byType: {
    type: SubmittalType;
    count: number;
    approved: number;
    rejected: number;
    pending: number;
    averageReviewDays: number;
  }[];
  
  byStatus: {
    status: SubmittalStatus;
    count: number;
    percentage: number;
  }[];
  
  byActionCode: {
    code: ActionCode;
    count: number;
    percentage: number;
  }[];
  
  reviewPerformance: {
    averageReviewDays: number;
    onTimeReviewRate: number; // percentage
    overdueReviews: number;
    fastestReview: number; // days
    slowestReview: number; // days
  };
  
  submissionTrend: {
    date: string;
    submitted: number;
    approved: number;
    rejected: number;
    pending: number;
  }[];
  
  topSubmitters: {
    name: string;
    company: string;
    totalSubmittals: number;
    approvalRate: number;
    averageReviewDays: number;
  }[];
  
  criticalSubmittals: {
    submittalNumber: string;
    title: string;
    status: SubmittalStatus;
    daysOverdue: number;
    priority: SubmittalPriority;
    affectedActivities: string[];
  }[];
  
  complianceRate: {
    onTimeSubmission: number; // percentage
    firstTimeApproval: number; // percentage
    resubmissionRate: number; // percentage
  };
}

// API Parameter Types
export interface GetSubmittalsParams {
  projectId?: string;
  type?: SubmittalType;
  status?: SubmittalStatus;
  priority?: SubmittalPriority;
  specSection?: string;
  submitterId?: string;
  reviewerId?: string;
  fromDate?: string;
  toDate?: string;
  isOverdue?: boolean;
}

export interface CreateSubmittalParams {
  projectId: string;
  type: SubmittalType;
  category?: string;
  specSection: string;
  title: string;
  description: string;
  priority: SubmittalPriority;
  requiredDate: string;
  leadTime: number;
  reviewers: {
    userId: string;
    role: string;
    order: number;
    isRequired: boolean;
    reviewDays: number;
  }[];
  relatedSubmittals?: string[];
  relatedRFIs?: string[];
  relatedDrawings?: string[];
  affectedActivities?: string[];
  purpose?: string;
  notes?: string;
}

export interface UpdateSubmittalParams {
  id: string;
  type?: SubmittalType;
  category?: string;
  specSection?: string;
  title?: string;
  description?: string;
  priority?: SubmittalPriority;
  requiredDate?: string;
  leadTime?: number;
  purpose?: string;
  notes?: string;
}

export interface SubmitSubmittalParams {
  id: string;
  documents: File[];
  notes?: string;
}

export interface ReviewSubmittalParams {
  id: string;
  actionCode: ActionCode;
  comments: string;
  markups?: File[];
  requiresResubmission?: boolean;
  notifySubmitter?: boolean;
}

export interface CreateRevisionParams {
  submittalId: string;
  changes: string;
  documents: File[];
  notes?: string;
}
