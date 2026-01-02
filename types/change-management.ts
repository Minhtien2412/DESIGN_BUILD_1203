/**
 * Change Management Types
 * Change orders, variations, and project change tracking
 */

// Change request status
export enum ChangeRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
  IMPLEMENTED = 'IMPLEMENTED',
  CANCELLED = 'CANCELLED',
}

// Change category
export enum ChangeCategory {
  SCOPE = 'SCOPE',
  DESIGN = 'DESIGN',
  SPECIFICATION = 'SPECIFICATION',
  SCHEDULE = 'SCHEDULE',
  BUDGET = 'BUDGET',
  MATERIALS = 'MATERIALS',
  METHODOLOGY = 'METHODOLOGY',
  SAFETY = 'SAFETY',
  REGULATORY = 'REGULATORY',
  CLIENT_REQUEST = 'CLIENT_REQUEST',
  OTHER = 'OTHER',
}

// Change priority
export enum ChangePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

// Change impact level
export enum ChangeImpactLevel {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
}

// Change origin
export enum ChangeOrigin {
  CLIENT = 'CLIENT',
  CONSULTANT = 'CONSULTANT',
  CONTRACTOR = 'CONTRACTOR',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  REGULATORY = 'REGULATORY',
  INTERNAL = 'INTERNAL',
  SITE_CONDITION = 'SITE_CONDITION',
  OTHER = 'OTHER',
}

// Change request
export interface ChangeRequest {
  id: string;
  changeNumber: string; // e.g., "CR-2024-001"
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  category: ChangeCategory;
  priority: ChangePriority;
  status: ChangeRequestStatus;
  origin: ChangeOrigin;
  originatedBy: string;
  originatedByName: string;
  originatedDate: string;
  reason: string;
  justification?: string;
  currentSituation?: string;
  proposedSolution?: string;
  alternatives?: ChangeAlternative[];
  selectedAlternativeId?: string;
  impact: ChangeImpact;
  costEstimate: CostEstimate;
  scheduleImpact: ScheduleImpact;
  scopeChanges?: ScopeChange[];
  affectedAreas: string[];
  affectedActivities?: string[];
  affectedDrawings?: string[];
  dependencies?: string[];
  risks?: ChangeRisk[];
  approvalWorkflow: ApprovalStep[];
  currentApprovalStep?: number;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  implementedBy?: string;
  implementedByName?: string;
  implementedDate?: string;
  actualCost?: number;
  actualDuration?: number;
  attachments?: Attachment[];
  relatedChanges?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Change alternative
export interface ChangeAlternative {
  id: string;
  title: string;
  description: string;
  costEstimate: number;
  duration: number;
  pros: string[];
  cons: string[];
  recommendation?: string;
  isRecommended: boolean;
}

// Change impact
export interface ChangeImpact {
  overallLevel: ChangeImpactLevel;
  costImpact: {
    level: ChangeImpactLevel;
    estimatedCost: number;
    breakdown?: CostBreakdownItem[];
    contingency?: number;
  };
  scheduleImpact: {
    level: ChangeImpactLevel;
    delayDays: number;
    criticalPath: boolean;
    affectedMilestones?: string[];
  };
  scopeImpact: {
    level: ChangeImpactLevel;
    addedWork?: string;
    removedWork?: string;
    modifiedWork?: string;
  };
  qualityImpact: {
    level: ChangeImpactLevel;
    description?: string;
    mitigationMeasures?: string[];
  };
  safetyImpact: {
    level: ChangeImpactLevel;
    description?: string;
    additionalPrecautions?: string[];
  };
  resourceImpact: {
    level: ChangeImpactLevel;
    additionalLabor?: number;
    additionalEquipment?: string[];
    additionalMaterials?: string[];
  };
  stakeholderImpact?: {
    stakeholder: string;
    impact: string;
    mitigation?: string;
  }[];
}

// Cost estimate
export interface CostEstimate {
  labor: number;
  materials: number;
  equipment: number;
  subcontractors: number;
  overhead: number;
  contingency: number;
  total: number;
  currency: string;
  estimatedBy?: string;
  estimatedDate?: string;
  notes?: string;
}

// Cost breakdown item
export interface CostBreakdownItem {
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

// Schedule impact
export interface ScheduleImpact {
  delayDays: number;
  criticalPath: boolean;
  affectedActivities: ActivityImpact[];
  newCompletionDate?: string;
  floatImpact?: number;
  mitigationPlan?: string;
}

// Activity impact
export interface ActivityImpact {
  activityId: string;
  activityName: string;
  originalDuration: number;
  newDuration: number;
  delayDays: number;
  isCritical: boolean;
}

// Scope change
export interface ScopeChange {
  id: string;
  type: 'ADDITION' | 'DELETION' | 'MODIFICATION';
  description: string;
  quantity?: number;
  unit?: string;
  drawings?: string[];
  specifications?: string[];
}

// Change risk
export interface ChangeRisk {
  id: string;
  description: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigation: string;
}

// Approval step
export interface ApprovalStep {
  step: number;
  role: string;
  approverId: string;
  approverName: string;
  approverEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  requiredComments: boolean;
  approvedDate?: string;
  comments?: string;
  attachments?: string[];
}

// Attachment
export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  category?: 'DRAWING' | 'SPECIFICATION' | 'PHOTO' | 'REPORT' | 'OTHER';
}

// Change order
export interface ChangeOrder {
  id: string;
  orderNumber: string; // e.g., "CO-2024-001"
  changeRequestId: string;
  changeRequestNumber: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  category: ChangeCategory;
  status: 'DRAFT' | 'ISSUED' | 'ACCEPTED' | 'REJECTED' | 'EXECUTED' | 'CLOSED';
  issuedDate?: string;
  issuedBy?: string;
  issuedByName?: string;
  acceptedDate?: string;
  acceptedBy?: string;
  acceptedByName?: string;
  contractValue: number;
  changeValue: number;
  newContractValue: number;
  currency: string;
  costBreakdown: CostBreakdownItem[];
  scheduleExtension: number; // days
  originalCompletionDate: string;
  newCompletionDate: string;
  scopeOfWork: string;
  specifications?: string;
  drawings?: string[];
  paymentTerms?: string;
  warrantyImpact?: string;
  executionStartDate?: string;
  executionEndDate?: string;
  executionStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  executionProgress?: number;
  attachments?: Attachment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Change log
export interface ChangeLog {
  id: string;
  changeRequestId: string;
  changeOrderId?: string;
  action: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  oldValue?: any;
  newValue?: any;
  comments?: string;
}

// Change analytics
export interface ChangeAnalytics {
  projectId?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRequests: number;
    approved: number;
    rejected: number;
    pending: number;
    implemented: number;
    approvalRate: number;
  };
  byCategory: Array<{
    category: ChangeCategory;
    count: number;
    totalCost: number;
    avgCost: number;
  }>;
  byOrigin: Array<{
    origin: ChangeOrigin;
    count: number;
    percentage: number;
  }>;
  costImpact: {
    totalCost: number;
    avgCostPerChange: number;
    costByCategory: Array<{
      category: ChangeCategory;
      cost: number;
    }>;
  };
  scheduleImpact: {
    totalDelayDays: number;
    avgDelayPerChange: number;
    criticalPathChanges: number;
  };
  topChanges: ChangeRequest[];
  trends: Array<{
    month: string;
    requestCount: number;
    approvedCount: number;
    totalCost: number;
  }>;
}

// API request/response types
export interface CreateChangeRequestParams {
  projectId: string;
  title: string;
  description: string;
  category: ChangeCategory;
  priority: ChangePriority;
  origin: ChangeOrigin;
  reason: string;
  justification?: string;
  currentSituation?: string;
  proposedSolution?: string;
  alternatives?: Omit<ChangeAlternative, 'id'>[];
  affectedAreas: string[];
}

export interface UpdateChangeRequestParams {
  id: string;
  title?: string;
  description?: string;
  category?: ChangeCategory;
  priority?: ChangePriority;
  reason?: string;
  justification?: string;
  impact?: Partial<ChangeImpact>;
  costEstimate?: Partial<CostEstimate>;
  scheduleImpact?: Partial<ScheduleImpact>;
}

export interface AssessChangeImpactParams {
  id: string;
  impact: ChangeImpact;
  costEstimate: CostEstimate;
  scheduleImpact: ScheduleImpact;
  risks?: Omit<ChangeRisk, 'id'>[];
}

export interface CreateChangeOrderParams {
  changeRequestId: string;
  title: string;
  description: string;
  contractValue: number;
  changeValue: number;
  currency: string;
  costBreakdown: CostBreakdownItem[];
  scheduleExtension: number;
  originalCompletionDate: string;
  scopeOfWork: string;
  specifications?: string;
  paymentTerms?: string;
}

export interface GetChangeRequestsParams {
  projectId?: string;
  status?: ChangeRequestStatus;
  category?: ChangeCategory;
  priority?: ChangePriority;
  origin?: ChangeOrigin;
  fromDate?: string;
  toDate?: string;
}

export interface GetChangeOrdersParams {
  projectId?: string;
  status?: ChangeOrder['status'];
  fromDate?: string;
  toDate?: string;
}
