/**
 * Punch List Types
 * Construction project punch list (deficiency) management
 */

// Enums
export enum PunchListStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export enum PunchItemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
}

export enum PunchItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum PunchItemCategory {
  ARCHITECTURAL = 'ARCHITECTURAL',
  STRUCTURAL = 'STRUCTURAL',
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HVAC = 'HVAC',
  FIRE_PROTECTION = 'FIRE_PROTECTION',
  FINISHES = 'FINISHES',
  LANDSCAPING = 'LANDSCAPING',
  SAFETY = 'SAFETY',
  QUALITY = 'QUALITY',
  OTHER = 'OTHER',
}

export enum PunchItemType {
  DEFICIENCY = 'DEFICIENCY',
  INCOMPLETE_WORK = 'INCOMPLETE_WORK',
  NON_COMPLIANCE = 'NON_COMPLIANCE',
  DAMAGE = 'DAMAGE',
  MISSING_ITEM = 'MISSING_ITEM',
  COSMETIC = 'COSMETIC',
  FUNCTIONAL = 'FUNCTIONAL',
  SAFETY_ISSUE = 'SAFETY_ISSUE',
}

export enum ResponsibleParty {
  GENERAL_CONTRACTOR = 'GENERAL_CONTRACTOR',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  SUPPLIER = 'SUPPLIER',
  CONSULTANT = 'CONSULTANT',
  OWNER = 'OWNER',
  OTHER = 'OTHER',
}

export enum VerificationMethod {
  VISUAL_INSPECTION = 'VISUAL_INSPECTION',
  TESTING = 'TESTING',
  MEASUREMENT = 'MEASUREMENT',
  FUNCTIONAL_TEST = 'FUNCTIONAL_TEST',
  DOCUMENTATION_REVIEW = 'DOCUMENTATION_REVIEW',
  THIRD_PARTY_INSPECTION = 'THIRD_PARTY_INSPECTION',
}

export enum InspectionResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  CONDITIONAL = 'CONDITIONAL',
  PENDING = 'PENDING',
}

// Interfaces
export interface PunchListItem {
  id: string;
  punchListId: string;
  itemNumber: string;
  
  // Identification
  title: string;
  description: string;
  category: PunchItemCategory;
  type: PunchItemType;
  priority: PunchItemPriority;
  status: PunchItemStatus;
  
  // Location
  location: string;
  zone?: string;
  floor?: string;
  room?: string;
  gridReference?: string;
  
  // Responsibility
  responsibleParty: ResponsibleParty;
  contractorId?: string;
  contractorName?: string;
  contractorCompany?: string;
  assignedTo?: {
    id: string;
    name: string;
    company: string;
    trade: string;
  };
  assignedBy?: string;
  assignedDate?: string;
  
  // Dates
  identifiedDate: string;
  dueDate?: string;
  startedDate?: string;
  completedDate?: string;
  verifiedDate?: string;
  closedDate?: string;
  
  // Cost impact
  hasCostImpact: boolean;
  estimatedCost?: number;
  actualCost?: number;
  
  // Schedule impact
  hasScheduleImpact: boolean;
  estimatedDays?: number;
  actualDays?: number;
  
  // Documentation
  photos: PunchItemPhoto[];
  beforePhotos: PunchItemPhoto[];
  afterPhotos: PunchItemPhoto[];
  attachments: PunchItemAttachment[];
  specifications?: string[];
  drawingReferences?: string[];
  
  // Work tracking
  workDescription?: string;
  materialsRequired?: string[];
  toolsRequired?: string[];
  laborHours?: number;
  
  // Progress updates
  updates: PunchItemUpdate[];
  percentComplete?: number;
  
  // Review & verification
  verificationMethod?: VerificationMethod;
  verificationNotes?: string;
  verifiedBy?: {
    id: string;
    name: string;
    role: string;
  };
  inspectionResult?: InspectionResult;
  inspectionNotes?: string;
  inspectedBy?: string;
  inspectionDate?: string;
  
  // Rejection tracking
  rejectionCount: number;
  rejectionReasons?: string[];
  lastRejectionDate?: string;
  lastRejectedBy?: string;
  
  // Related items
  relatedItems?: string[]; // IDs of related punch items
  parentItemId?: string; // For sub-items
  childItems?: string[]; // Sub-items
  
  // Sign-off
  contractorSignOff?: {
    signedBy: string;
    signedDate: string;
    signature?: string;
    comments?: string;
  };
  ownerSignOff?: {
    signedBy: string;
    signedDate: string;
    signature?: string;
    comments?: string;
  };
  
  // Metadata
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface PunchItemPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  takenBy?: string;
  takenAt: string;
  annotated?: boolean;
  annotationUrl?: string;
}

export interface PunchItemAttachment {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  category?: string;
}

export interface PunchItemUpdate {
  id: string;
  date: string;
  updateType: 'STATUS_CHANGE' | 'PROGRESS_UPDATE' | 'COMMENT' | 'ASSIGNMENT' | 'REJECTION' | 'VERIFICATION';
  status?: PunchItemStatus;
  percentComplete?: number;
  comments?: string;
  updatedBy: {
    id: string;
    name: string;
    role: string;
  };
  photos?: string[]; // Photo IDs
  attachments?: string[]; // Attachment IDs
}

export interface PunchList {
  id: string;
  listNumber: string;
  
  // Project info
  projectId: string;
  projectName?: string;
  phaseId?: string;
  phaseName?: string;
  
  // Identification
  title: string;
  description?: string;
  status: PunchListStatus;
  
  // Type & scope
  listType: 'FINAL' | 'PARTIAL' | 'SUBSTANTIAL_COMPLETION' | 'PROGRESSIVE' | 'WARRANTY';
  scope?: string;
  area?: string;
  building?: string;
  
  // Items
  items: PunchListItem[];
  totalItems: number;
  openItems: number;
  inProgressItems: number;
  completedItems: number;
  verifiedItems: number;
  closedItems: number;
  rejectedItems: number;
  
  // Dates
  createdDate: string;
  targetCompletionDate?: string;
  submittedDate?: string;
  approvedDate?: string;
  closedDate?: string;
  
  // Participants
  preparedBy: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
  
  // Statistics
  completionRate: number; // Percentage
  averageDaysToComplete?: number;
  overdueItems: number;
  criticalItems: number;
  
  // Cost tracking
  totalEstimatedCost?: number;
  totalActualCost?: number;
  costVariance?: number;
  
  // Distribution
  distributedTo?: string[]; // User IDs
  distributedDate?: string;
  
  // Comments & notes
  comments?: PunchListComment[];
  generalNotes?: string;
  
  // Attachments
  attachments?: PunchItemAttachment[];
  
  // Sign-off
  finalSignOff?: {
    contractorSignOff?: {
      signedBy: string;
      signedDate: string;
      signature?: string;
      comments?: string;
    };
    ownerSignOff?: {
      signedBy: string;
      signedDate: string;
      signature?: string;
      comments?: string;
    };
    certifiedComplete: boolean;
  };
  
  // Metadata
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  version?: number;
  revisionHistory?: PunchListRevision[];
}

export interface PunchListComment {
  id: string;
  comment: string;
  commentedBy: {
    id: string;
    name: string;
    role: string;
  };
  commentedAt: string;
  mentions?: string[]; // User IDs
}

export interface PunchListRevision {
  version: number;
  date: string;
  revisedBy: string;
  changes: string;
  reason?: string;
}

export interface PunchListTemplate {
  id: string;
  name: string;
  description?: string;
  category: PunchItemCategory;
  defaultItems: Array<{
    title: string;
    description: string;
    category: PunchItemCategory;
    type: PunchItemType;
    priority: PunchItemPriority;
  }>;
  customFields?: Array<{
    id: string;
    name: string;
    type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN';
    options?: string[];
    required: boolean;
    defaultValue?: any;
  }>;
  createdBy: string;
  createdAt: string;
}

export interface PunchListSummary {
  projectId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  
  // Overall statistics
  totalLists: number;
  totalItems: number;
  
  // By status
  listsByStatus: Record<PunchListStatus, number>;
  itemsByStatus: Record<PunchItemStatus, number>;
  
  // By category
  itemsByCategory: Record<PunchItemCategory, number>;
  
  // By priority
  itemsByPriority: Record<PunchItemPriority, number>;
  
  // Completion metrics
  completionRate: number;
  averageItemsPerList: number;
  averageDaysToComplete: number;
  
  // Time metrics
  overdueItems: number;
  itemsDueThisWeek: number;
  itemsDueNextWeek: number;
  
  // Quality metrics
  rejectedItemsCount: number;
  rejectionRate: number;
  averageRejectionCount: number;
  
  // Cost metrics
  totalEstimatedCost: number;
  totalActualCost: number;
  costVariance: number;
  
  // Top issues
  topCategories: Array<{
    category: PunchItemCategory;
    count: number;
    percentage: number;
  }>;
  
  topResponsibleParties: Array<{
    party: ResponsibleParty;
    company: string;
    count: number;
    completionRate: number;
  }>;
}

export interface PunchListAnalytics {
  projectId: string;
  period: string;
  summary: PunchListSummary;
  
  // Trend analysis
  itemCreationTrend: Array<{
    month: string;
    created: number;
    completed: number;
    closed: number;
  }>;
  
  // Completion trend
  completionTrend: Array<{
    month: string;
    completionRate: number;
    averageDaysToComplete: number;
  }>;
  
  // Category analysis
  categoryAnalysis: Array<{
    category: PunchItemCategory;
    totalItems: number;
    completed: number;
    completionRate: number;
    averageDaysToComplete: number;
    costImpact: number;
  }>;
  
  // Contractor performance
  contractorPerformance: Array<{
    contractorId: string;
    contractorName: string;
    company: string;
    assignedItems: number;
    completedItems: number;
    completionRate: number;
    averageDaysToComplete: number;
    rejectedItems: number;
    rejectionRate: number;
  }>;
  
  // Priority distribution
  priorityDistribution: Array<{
    priority: PunchItemPriority;
    count: number;
    percentage: number;
    averageDaysToComplete: number;
  }>;
  
  // Cost analysis
  costAnalysis: {
    totalEstimated: number;
    totalActual: number;
    variance: number;
    byCategory: Record<PunchItemCategory, { estimated: number; actual: number }>;
  };
  
  // Aging analysis
  agingAnalysis: Array<{
    ageRange: string; // '0-7 days', '8-14 days', '15-30 days', '30+ days'
    count: number;
    percentage: number;
  }>;
}

export interface PunchListExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV';
  includePhotos?: boolean;
  includeAttachments?: boolean;
  includeUpdates?: boolean;
  groupBy?: 'CATEGORY' | 'PRIORITY' | 'RESPONSIBLE_PARTY' | 'STATUS' | 'LOCATION';
  sortBy?: 'ITEM_NUMBER' | 'PRIORITY' | 'DUE_DATE' | 'STATUS' | 'LOCATION';
  filterStatus?: PunchItemStatus[];
  filterPriority?: PunchItemPriority[];
  filterCategory?: PunchItemCategory[];
  template?: string;
}
