/**
 * As-Built Documentation Types
 * As-built drawings and redline management
 */

// Drawing Status
export enum DrawingStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  ISSUED = 'ISSUED',
  SUPERSEDED = 'SUPERSEDED',
  ARCHIVED = 'ARCHIVED',
}

// Drawing Type
export enum DrawingType {
  ARCHITECTURAL = 'ARCHITECTURAL',
  STRUCTURAL = 'STRUCTURAL',
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HVAC = 'HVAC',
  FIRE_PROTECTION = 'FIRE_PROTECTION',
  SITE_PLAN = 'SITE_PLAN',
  LANDSCAPE = 'LANDSCAPE',
  DETAIL = 'DETAIL',
  SECTION = 'SECTION',
  ELEVATION = 'ELEVATION',
  FLOOR_PLAN = 'FLOOR_PLAN',
  OTHER = 'OTHER',
}

// Revision Type
export enum RevisionType {
  DESIGN_CHANGE = 'DESIGN_CHANGE',
  FIELD_CHANGE = 'FIELD_CHANGE',
  CORRECTION = 'CORRECTION',
  CLARIFICATION = 'CLARIFICATION',
  ADDITION = 'ADDITION',
  DELETION = 'DELETION',
  AS_BUILT = 'AS_BUILT',
}

// Markup Type
export enum MarkupType {
  REDLINE = 'REDLINE',
  COMMENT = 'COMMENT',
  DIMENSION = 'DIMENSION',
  ANNOTATION = 'ANNOTATION',
  HIGHLIGHT = 'HIGHLIGHT',
  PHOTO_REFERENCE = 'PHOTO_REFERENCE',
}

// Review Status
export enum ReviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  APPROVED_WITH_COMMENTS = 'APPROVED_WITH_COMMENTS',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
}

// As-Built Drawing
export interface AsBuiltDrawing {
  id: string;
  drawingNumber: string;
  title: string;
  description?: string;
  drawingType: DrawingType;
  status: DrawingStatus;
  
  // Project Info
  projectId: string;
  projectName?: string;
  buildingName?: string;
  floor?: string;
  zone?: string;
  
  // Original Design
  originalDrawingNumber?: string;
  originalDrawingUrl?: string;
  designDate?: string;
  designedBy?: {
    id: string;
    name: string;
    company?: string;
  };
  
  // As-Built Version
  asBuiltUrl: string;
  asBuiltDate: string;
  preparedBy: {
    id: string;
    name: string;
    company?: string;
  };
  
  // File Information
  fileFormat: string; // PDF, DWG, DXF, etc.
  fileSize: number;
  pageCount?: number;
  scale?: string;
  
  // Revisions
  revisionNumber: string;
  revisions: DrawingRevision[];
  totalRevisions: number;
  
  // Redlines
  hasRedlines: boolean;
  redlines: Redline[];
  totalRedlines: number;
  
  // Review
  reviews: DrawingReview[];
  currentReview?: DrawingReview;
  
  // Related
  relatedDrawings?: string[]; // Drawing IDs
  supersedes?: string; // Previous drawing ID
  supersededBy?: string; // Newer drawing ID
  
  // Discipline
  discipline?: string;
  consultant?: string;
  
  // Metadata
  keywords?: string[];
  tags?: string[];
  isConfidential?: boolean;
  
  // Distribution
  distributedTo?: string[];
  distributionDate?: string;
  
  // Approval
  approvedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  approvalDate?: string;
  
  // Timestamps
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  
  notes?: string;
}

// Drawing Revision
export interface DrawingRevision {
  id: string;
  revisionNumber: string;
  revisionDate: string;
  revisionType: RevisionType;
  description: string;
  
  // Changes
  changesSummary?: string;
  changesDetail?: string[];
  
  // Redlines Reference
  redlineIds?: string[];
  
  // Files
  drawingUrl: string;
  redlineUrl?: string;
  
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
  
  // Reason
  reason?: string;
  rfiReference?: string;
  changeOrderReference?: string;
  
  notes?: string;
}

// Redline (Markup)
export interface Redline {
  id: string;
  drawingId: string;
  drawingNumber: string;
  markupType: MarkupType;
  
  // Content
  title?: string;
  description: string;
  location?: string; // Zone, area, or coordinates
  
  // Visual Data (for annotation tools)
  coordinates?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  
  // Color and Style
  color?: string;
  lineWidth?: number;
  
  // Status
  status: 'OPEN' | 'ADDRESSED' | 'INCORPORATED' | 'REJECTED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Author
  createdBy: {
    id: string;
    name: string;
    role?: string;
    company?: string;
  };
  createdAt: string;
  
  // Resolution
  resolvedBy?: {
    id: string;
    name: string;
  };
  resolvedAt?: string;
  resolution?: string;
  
  // Linked Items
  photoReferences?: string[]; // Photo URLs
  relatedRedlines?: string[]; // Related markup IDs
  
  // Incorporation
  incorporatedInRevision?: string;
  incorporationDate?: string;
  
  updatedAt: string;
  notes?: string;
}

// Drawing Review
export interface DrawingReview {
  id: string;
  reviewNumber: number;
  drawingId: string;
  status: ReviewStatus;
  
  // Reviewer
  reviewer: {
    id: string;
    name: string;
    role: string;
    company?: string;
  };
  
  // Dates
  assignedDate: string;
  dueDate?: string;
  reviewDate?: string;
  
  // Review Content
  overallComments?: string;
  markups: ReviewMarkup[];
  
  // Decision
  recommendation: 'APPROVE' | 'APPROVE_WITH_COMMENTS' | 'REVISE' | 'REJECT';
  conditions?: string[];
  
  // Response
  responseRequired: boolean;
  response?: string;
  responseDate?: string;
  responseBy?: {
    id: string;
    name: string;
  };
  
  attachments?: ReviewAttachment[];
  
  createdAt: string;
  updatedAt: string;
}

// Review Markup
export interface ReviewMarkup {
  id: string;
  page?: number;
  location?: string;
  category: 'DESIGN' | 'COMPLIANCE' | 'COORDINATION' | 'CLARIFICATION' | 'OTHER';
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  comment: string;
  suggestedAction?: string;
  status: 'OPEN' | 'ADDRESSED' | 'RESOLVED';
  
  coordinates?: {
    x: number;
    y: number;
  };
  
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

// Review Attachment
export interface ReviewAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

// Drawing Package
export interface DrawingPackage {
  id: string;
  packageNumber: string;
  title: string;
  description?: string;
  packageType: 'SUBMITTAL' | 'CONSTRUCTION' | 'AS_BUILT' | 'RECORD' | 'OTHER';
  
  // Project Info
  projectId: string;
  projectName?: string;
  
  // Drawings
  drawings: string[]; // Drawing IDs
  totalDrawings: number;
  
  // Status
  status: DrawingStatus;
  
  // Transmittal
  transmittalNumber?: string;
  transmittalDate?: string;
  transmittedTo?: string[];
  
  // Dates
  issuedDate?: string;
  dueDate?: string;
  
  // Prepared By
  preparedBy: {
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
  
  // Cover Sheet
  coverSheetUrl?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  notes?: string;
}

// Drawing Register
export interface DrawingRegister {
  id: string;
  projectId: string;
  projectName: string;
  
  // Summary
  totalDrawings: number;
  drawingsByType: Record<DrawingType, number>;
  drawingsByStatus: Record<DrawingStatus, number>;
  
  // Revisions
  totalRevisions: number;
  recentRevisions: number; // Last 30 days
  
  // Redlines
  totalRedlines: number;
  openRedlines: number;
  addressedRedlines: number;
  
  // Reviews
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  
  // Packages
  totalPackages: number;
  issuedPackages: number;
  
  // Compliance
  asBuiltCompletionRate: number; // percentage
  
  generatedAt: string;
}

// As-Built Summary
export interface AsBuiltSummary {
  projectId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  
  // Overall Statistics
  totalDrawings: number;
  drawingsByType: Record<DrawingType, number>;
  drawingsByStatus: Record<DrawingStatus, number>;
  
  // Discipline Distribution
  drawingsByDiscipline: Record<string, number>;
  
  // Revisions
  totalRevisions: number;
  revisionsByType: Record<RevisionType, number>;
  averageRevisionsPerDrawing: number;
  
  // Redlines
  totalRedlines: number;
  redlinesByStatus: Record<string, number>;
  redlinesByType: Record<MarkupType, number>;
  redlineResolutionRate: number; // percentage
  
  // Reviews
  totalReviews: number;
  reviewsByStatus: Record<ReviewStatus, number>;
  averageReviewTime?: number; // days
  approvalRate: number; // percentage
  
  // Quality Metrics
  drawingsWithRedlines: number;
  averageRedlinesPerDrawing: number;
  
  // Top Categories
  topDrawingTypes: {
    type: DrawingType;
    count: number;
    completionRate: number;
  }[];
  
  topConsultants: {
    consultant: string;
    drawingCount: number;
    revisionCount: number;
  }[];
}

// As-Built Analytics
export interface AsBuiltAnalytics {
  projectId: string;
  period: string;
  summary: AsBuiltSummary;
  
  // Trends
  drawingTrend: {
    month: string;
    drawingsAdded: number;
    drawingsApproved: number;
    revisionsCreated: number;
  }[];
  
  redlineTrend: {
    month: string;
    redlinesCreated: number;
    redlinesResolved: number;
    openRedlines: number;
  }[];
  
  reviewTrend: {
    month: string;
    reviewsCompleted: number;
    approvalRate: number;
    averageReviewTime: number;
  }[];
  
  // Performance Analysis
  disciplinePerformance: {
    discipline: string;
    drawingCount: number;
    averageRevisions: number;
    redlineRate: number; // redlines per drawing
    approvalRate: number;
  }[];
  
  consultantPerformance: {
    consultant: string;
    drawingCount: number;
    onTimeSubmissions: number;
    revisionCount: number;
    qualityScore?: number;
  }[];
  
  // Quality Metrics
  qualityMetrics: {
    firstTimeApprovalRate: number;
    averageReviewCycles: number;
    redlineIncorporationRate: number;
    documentationCompleteness: number;
  };
}

// Export Options
export interface AsBuiltExportOptions {
  format: 'PDF' | 'DWG' | 'ZIP';
  includeRevisions?: boolean;
  includeRedlines?: boolean;
  includeReviews?: boolean;
  drawingTypes?: DrawingType[];
  quality?: 'LOW' | 'MEDIUM' | 'HIGH';
  template?: string;
}
