/**
 * Document Control Types
 * Document management, version control, and distribution
 */

// Document Status
export enum DocumentStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  ISSUED = 'ISSUED',
  SUPERSEDED = 'SUPERSEDED',
  ARCHIVED = 'ARCHIVED',
  VOID = 'VOID',
}

// Document Category
export enum DocumentCategory {
  CONTRACT = 'CONTRACT',
  SPECIFICATION = 'SPECIFICATION',
  DRAWING = 'DRAWING',
  REPORT = 'REPORT',
  PROCEDURE = 'PROCEDURE',
  POLICY = 'POLICY',
  MANUAL = 'MANUAL',
  CORRESPONDENCE = 'CORRESPONDENCE',
  SUBMITTAL = 'SUBMITTAL',
  RFI = 'RFI',
  CHANGE_ORDER = 'CHANGE_ORDER',
  MEETING_MINUTES = 'MEETING_MINUTES',
  PERMIT = 'PERMIT',
  CERTIFICATE = 'CERTIFICATE',
  WARRANTY = 'WARRANTY',
  OTHER = 'OTHER',
}

// Access Level
export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  HIGHLY_CONFIDENTIAL = 'HIGHLY_CONFIDENTIAL',
}

// Review Type
export enum ReviewType {
  TECHNICAL = 'TECHNICAL',
  DESIGN = 'DESIGN',
  COMPLIANCE = 'COMPLIANCE',
  QUALITY = 'QUALITY',
  LEGAL = 'LEGAL',
  FINANCIAL = 'FINANCIAL',
  SAFETY = 'SAFETY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
}

// Review Decision
export enum ReviewDecision {
  APPROVE = 'APPROVE',
  APPROVE_WITH_COMMENTS = 'APPROVE_WITH_COMMENTS',
  REVISE_AND_RESUBMIT = 'REVISE_AND_RESUBMIT',
  REJECT = 'REJECT',
  ON_HOLD = 'ON_HOLD',
}

// Distribution Method
export enum DistributionMethod {
  EMAIL = 'EMAIL',
  PORTAL = 'PORTAL',
  PHYSICAL = 'PHYSICAL',
  FTP = 'FTP',
  CLOUD = 'CLOUD',
}

// Notification Type
export enum NotificationType {
  NEW_DOCUMENT = 'NEW_DOCUMENT',
  REVISION = 'REVISION',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  APPROVAL = 'APPROVAL',
  REJECTION = 'REJECTION',
  EXPIRY_WARNING = 'EXPIRY_WARNING',
  SUPERSEDED = 'SUPERSEDED',
}

// Controlled Document
export interface ControlledDocument {
  id: string;
  documentNumber: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  
  // Project Info
  projectId: string;
  projectName?: string;
  phase?: string;
  
  // Version Control
  version: string;
  revisionNumber: number;
  revisions: DocumentRevision[];
  
  // Current File
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  pageCount?: number;
  
  // Metadata
  author: {
    id: string;
    name: string;
    company?: string;
  };
  createdDate: string;
  
  // Ownership
  owner: {
    id: string;
    name: string;
    department?: string;
  };
  
  // Classification
  accessLevel: AccessLevel;
  isConfidential: boolean;
  keywords?: string[];
  tags?: string[];
  
  // Lifecycle
  issuedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  reviewDate?: string;
  
  // Workflow
  reviewRequired: boolean;
  approvalRequired: boolean;
  currentReview?: DocumentReview;
  reviews: DocumentReview[];
  
  // Approval
  approvedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  approvalDate?: string;
  
  // Distribution
  distributionList?: string[];
  distributedTo?: DistributionRecord[];
  
  // Related Documents
  relatedDocuments?: string[];
  supersedes?: string;
  supersededBy?: string;
  
  // References
  referenceDocuments?: {
    documentId?: string;
    documentNumber: string;
    title: string;
  }[];
  
  // Retention
  retentionPeriod?: number; // in years
  retentionEndDate?: string;
  
  // Tracking
  views?: number;
  downloads?: number;
  lastAccessedDate?: string;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  updatedBy?: {
    id: string;
    name: string;
  };
}

// Document Revision
export interface DocumentRevision {
  id: string;
  revisionNumber: number;
  version: string;
  revisionDate: string;
  
  // Changes
  changeDescription: string;
  changesDetail?: string[];
  reasonForChange?: string;
  
  // Impact
  impactLevel?: 'MINOR' | 'MAJOR' | 'CRITICAL';
  
  // File
  fileUrl: string;
  fileName: string;
  fileSize: number;
  
  // Author
  revisedBy: {
    id: string;
    name: string;
    company?: string;
  };
  
  // Approval
  approvedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  approvalDate?: string;
  
  // Distribution
  distributionRequired: boolean;
  distributedDate?: string;
  
  // References
  rfiReference?: string;
  changeOrderReference?: string;
  
  notes?: string;
}

// Document Review
export interface DocumentReview {
  id: string;
  reviewNumber: number;
  documentId: string;
  documentNumber: string;
  reviewType: ReviewType;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // Reviewer
  reviewer: {
    id: string;
    name: string;
    role: string;
    department?: string;
  };
  
  // Dates
  assignedDate: string;
  dueDate?: string;
  startedDate?: string;
  completedDate?: string;
  
  // Review Content
  comments?: ReviewComment[];
  overallComments?: string;
  
  // Decision
  decision?: ReviewDecision;
  conditions?: string[];
  actionItems?: string[];
  
  // Response
  responseRequired: boolean;
  response?: string;
  responseDate?: string;
  responseBy?: {
    id: string;
    name: string;
  };
  
  // Attachments
  attachments?: ReviewAttachment[];
  
  // Metrics
  reviewDuration?: number; // in hours
  
  createdAt: string;
  updatedAt: string;
}

// Review Comment
export interface ReviewComment {
  id: string;
  page?: number;
  section?: string;
  clause?: string;
  category: 'TECHNICAL' | 'EDITORIAL' | 'COMPLIANCE' | 'CLARIFICATION' | 'GENERAL';
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  comment: string;
  suggestedChange?: string;
  
  status: 'OPEN' | 'ADDRESSED' | 'RESOLVED' | 'REJECTED';
  
  response?: string;
  responseDate?: string;
  responseBy?: string;
  
  createdAt: string;
}

// Review Attachment
export interface ReviewAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  uploadedAt: string;
}

// Distribution Record
export interface DistributionRecord {
  id: string;
  documentId: string;
  documentNumber: string;
  version: string;
  
  // Recipient
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  recipientCompany?: string;
  recipientRole?: string;
  
  // Distribution
  distributionMethod: DistributionMethod;
  distributedDate: string;
  distributedBy: {
    id: string;
    name: string;
  };
  
  // Tracking
  deliveryStatus: 'SENT' | 'DELIVERED' | 'READ' | 'ACKNOWLEDGED' | 'FAILED';
  deliveryDate?: string;
  readDate?: string;
  acknowledgementDate?: string;
  acknowledgementBy?: string;
  
  // Transmittal
  transmittalNumber?: string;
  transmittalDate?: string;
  
  notes?: string;
}

// Document Transmittal
export interface DocumentTransmittal {
  id: string;
  transmittalNumber: string;
  transmittalDate: string;
  
  // Project
  projectId: string;
  projectName?: string;
  
  // Sender
  sender: {
    id: string;
    name: string;
    company?: string;
  };
  
  // Recipient
  recipient: {
    id: string;
    name: string;
    company?: string;
  };
  
  // Documents
  documents: {
    documentId: string;
    documentNumber: string;
    title: string;
    version: string;
    copies?: number;
  }[];
  totalDocuments: number;
  
  // Purpose
  purpose: 'SUBMITTAL' | 'APPROVAL' | 'REVIEW' | 'INFORMATION' | 'RECORD' | 'OTHER';
  purposeDescription?: string;
  
  // Response
  responseRequired: boolean;
  responseDueDate?: string;
  responseReceived?: boolean;
  responseDate?: string;
  
  // Delivery
  deliveryMethod: DistributionMethod;
  deliveryStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED';
  
  // Attachments
  coverLetterUrl?: string;
  attachments?: string[];
  
  notes?: string;
  createdAt: string;
}

// Document Register
export interface DocumentRegister {
  id: string;
  projectId: string;
  projectName: string;
  
  // Summary
  totalDocuments: number;
  documentsByCategory: Record<DocumentCategory, number>;
  documentsByStatus: Record<DocumentStatus, number>;
  
  // Access Levels
  documentsByAccessLevel: Record<AccessLevel, number>;
  
  // Reviews
  totalReviews: number;
  pendingReviews: number;
  completedReviews: number;
  
  // Distribution
  totalDistributions: number;
  
  // Compliance
  documentsExpiringSoon: number;
  expiredDocuments: number;
  documentsNeedingReview: number;
  
  // Storage
  totalStorageSize: number; // in bytes
  
  generatedAt: string;
}

// Document Control Summary
export interface DocumentControlSummary {
  projectId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  
  // Overall Statistics
  totalDocuments: number;
  documentsByCategory: Record<DocumentCategory, number>;
  documentsByStatus: Record<DocumentStatus, number>;
  
  // Access Control
  documentsByAccessLevel: Record<AccessLevel, number>;
  confidentialDocuments: number;
  
  // Versions
  totalRevisions: number;
  averageRevisionsPerDocument: number;
  documentsMostRevised: {
    documentNumber: string;
    title: string;
    revisions: number;
  }[];
  
  // Reviews
  totalReviews: number;
  reviewsByType: Record<ReviewType, number>;
  reviewsByDecision: Record<ReviewDecision, number>;
  averageReviewTime?: number; // days
  approvalRate: number; // percentage
  
  // Distribution
  totalDistributions: number;
  distributionsByMethod: Record<DistributionMethod, number>;
  totalTransmittals: number;
  
  // Activity
  documentsCreated: number;
  documentsApproved: number;
  documentsIssued: number;
  documentsSuperseded: number;
  
  // Compliance
  documentsExpiringSoon: number; // within 30 days
  expiredDocuments: number;
  documentsNeedingReview: number;
  
  // Storage
  totalStorageSize: number;
  averageDocumentSize: number;
  
  // Top Categories
  topCategories: {
    category: DocumentCategory;
    count: number;
    percentage: number;
  }[];
  
  topAuthors: {
    author: string;
    documentCount: number;
    revisionCount: number;
  }[];
}

// Document Control Analytics
export interface DocumentControlAnalytics {
  projectId: string;
  period: string;
  summary: DocumentControlSummary;
  
  // Trends
  documentTrend: {
    month: string;
    documentsCreated: number;
    documentsApproved: number;
    documentsIssued: number;
    revisionsCreated: number;
  }[];
  
  reviewTrend: {
    month: string;
    reviewsCompleted: number;
    approvalRate: number;
    averageReviewTime: number;
  }[];
  
  distributionTrend: {
    month: string;
    distributionsCompleted: number;
    acknowledgementRate: number;
  }[];
  
  // Performance Analysis
  categoryPerformance: {
    category: DocumentCategory;
    documentCount: number;
    averageRevisions: number;
    averageReviewTime: number;
    approvalRate: number;
  }[];
  
  reviewerPerformance: {
    reviewer: string;
    reviewsCompleted: number;
    averageReviewTime: number;
    onTimeCompletionRate: number;
  }[];
  
  // Quality Metrics
  qualityMetrics: {
    firstTimeApprovalRate: number;
    averageReviewCycles: number;
    documentCompleteness: number;
    complianceRate: number;
  };
  
  // Storage Analysis
  storageByCategory: Record<DocumentCategory, number>;
  storageGrowth: {
    month: string;
    totalSize: number;
    growth: number;
  }[];
}

// Document Search Filters
export interface DocumentSearchFilters {
  projectId?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  accessLevel?: AccessLevel;
  author?: string;
  owner?: string;
  dateFrom?: string;
  dateTo?: string;
  keywords?: string[];
  tags?: string[];
  search?: string;
}

// Export Options
export interface DocumentExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV' | 'ZIP';
  includeRevisions?: boolean;
  includeReviews?: boolean;
  includeDistributionRecords?: boolean;
  categories?: DocumentCategory[];
  statuses?: DocumentStatus[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}
