/**
 * Document Management Types
 * 
 * Comprehensive type system for construction document management
 * including file uploads, categorization, sharing, and version control
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Document categories for construction projects
 */
export enum DocumentCategory {
  DESIGN = 'DESIGN',                   // Design drawings, blueprints
  CONTRACT = 'CONTRACT',               // Contracts, agreements
  PERMIT = 'PERMIT',                   // Permits, licenses
  SPECIFICATION = 'SPECIFICATION',     // Technical specifications
  REPORT = 'REPORT',                   // Progress reports, inspection reports
  PHOTO = 'PHOTO',                     // Site photos, progress photos
  INVOICE = 'INVOICE',                 // Invoices, receipts
  SCHEDULE = 'SCHEDULE',               // Project schedules, timelines
  SAFETY = 'SAFETY',                   // Safety documents, incident reports
  QUALITY = 'QUALITY',                 // QC/QA documents
  MEETING = 'MEETING',                 // Meeting minutes, notes
  CORRESPONDENCE = 'CORRESPONDENCE',   // Emails, letters
  SUBMITTAL = 'SUBMITTAL',             // Shop drawings, submittals
  WARRANTY = 'WARRANTY',               // Warranties, guarantees
  MANUAL = 'MANUAL',                   // Operation manuals, maintenance guides
  OTHER = 'OTHER',                     // Other documents
}

/**
 * Document status lifecycle
 */
export enum DocumentStatus {
  DRAFT = 'DRAFT',                     // Document being created
  UNDER_REVIEW = 'UNDER_REVIEW',       // Under review/approval
  APPROVED = 'APPROVED',               // Approved for use
  REJECTED = 'REJECTED',               // Rejected, needs revision
  SUPERSEDED = 'SUPERSEDED',           // Replaced by newer version
  ARCHIVED = 'ARCHIVED',               // Archived, no longer active
}

/**
 * Access level for document sharing
 */
export enum AccessLevel {
  PRIVATE = 'PRIVATE',                 // Only creator can access
  TEAM = 'TEAM',                       // Team members can access
  PROJECT = 'PROJECT',                 // All project members can access
  PUBLIC = 'PUBLIC',                   // Anyone with link can access
}

/**
 * Document action types for audit trail
 */
export enum DocumentAction {
  CREATED = 'CREATED',
  UPLOADED = 'UPLOADED',
  UPDATED = 'UPDATED',
  DOWNLOADED = 'DOWNLOADED',
  VIEWED = 'VIEWED',
  SHARED = 'SHARED',
  DELETED = 'DELETED',
  RESTORED = 'RESTORED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  VERSION_CREATED = 'VERSION_CREATED',
}

/**
 * File type groups
 */
export enum FileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  SPREADSHEET = 'SPREADSHEET',
  PRESENTATION = 'PRESENTATION',
  CAD = 'CAD',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  ARCHIVE = 'ARCHIVE',
  OTHER = 'OTHER',
}

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Base document model
 */
export interface Document {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  
  // File info
  fileName: string;
  fileSize: number;                    // In bytes
  fileType: FileType;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  
  // Version control
  version: number;
  versionLabel?: string;               // e.g., "v1.0", "Rev A"
  isLatestVersion: boolean;
  parentDocumentId?: string;           // For version history
  
  // Access control
  accessLevel: AccessLevel;
  uploadedBy: string;
  uploadedByName?: string;
  
  // Metadata
  tags: string[];
  customFields?: Record<string, any>;
  
  // Review/approval
  reviewers?: string[];
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  rejectedReason?: string;
  
  // Organization
  folder?: DocumentFolder;
  folderId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;                  // For time-sensitive documents
}

/**
 * Document folder for organization
 */
export interface DocumentFolder {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  parentFolderId?: string;             // For nested folders
  path: string;                        // Full path (e.g., "/Design/Architectural")
  
  // Access control
  accessLevel: AccessLevel;
  
  // Metadata
  documentCount: number;
  totalSize: number;                   // In bytes
  
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Document share record
 */
export interface DocumentShare {
  id: string;
  documentId: string;
  sharedBy: string;
  sharedByName?: string;
  sharedWith?: string;                 // User ID, null for public links
  sharedWithName?: string;
  
  // Share settings
  accessLevel: AccessLevel;
  canDownload: boolean;
  canEdit: boolean;
  canShare: boolean;
  expiresAt?: string;
  
  // Permissions object
  permissions: {
    canDownload: boolean;
    canEdit: boolean;
    canShare: boolean;
  };
  
  // Link sharing
  shareToken?: string;                 // For public share links
  shareUrl?: string;
  
  // Stats
  viewCount: number;
  downloadCount: number;
  
  createdAt: string;
  lastAccessedAt?: string;
}

/**
 * Document version history entry
 */
export interface DocumentVersion {
  id: string;
  documentId: string;                  // Current document ID
  versionNumber: number;
  versionLabel?: string;
  isLatestVersion?: boolean;
  
  // File info
  fileName: string;
  fileSize: number;
  fileUrl: string;
  
  // Change tracking
  changes?: string;                    // Description of changes
  uploadedBy: string;
  uploadedByName?: string;
  
  createdAt: string;
}

/**
 * Document activity/audit log
 */
export interface DocumentActivity {
  id: string;
  documentId: string;
  action: DocumentAction;
  performedBy: string;
  performedByName?: string;
  
  // Action details
  details?: string;
  metadata?: Record<string, any>;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
}

/**
 * Document comment/annotation
 */
export interface DocumentComment {
  id: string;
  documentId: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  // Optional page/location reference
  pageNumber?: number;
  coordinates?: {
    x: number;
    y: number;
  };
  
  // Author name (legacy)
  authorName?: string;
  
  // Threading
  parentCommentId?: string;
  replies?: DocumentComment[];
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface UploadDocumentRequest {
  projectId: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  accessLevel?: AccessLevel;
  tags?: string[];
  folderId?: string;
  
  // File data (typically FormData in actual implementation)
  file: File | Blob;
}

export interface CreateFolderRequest {
  projectId: string;
  name: string;
  description?: string;
  parentFolderId?: string;
  accessLevel?: AccessLevel;
}

export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  accessLevel?: AccessLevel;
  tags?: string[];
  versionLabel?: string;
}

export interface ShareDocumentRequest {
  documentId: string;
  sharedWith?: string;                 // User ID, omit for public link
  accessLevel: AccessLevel;
  canDownload?: boolean;
  canEdit?: boolean;
  canShare?: boolean;
  expiresAt?: string;
  permissions?: {
    canDownload: boolean;
    canEdit: boolean;
    canShare: boolean;
  };
}

export interface ReviewDocumentRequest {
  documentId: string;
  action: 'approve' | 'reject';
  comments?: string;
  rejectionReason?: string;
}

export interface CreateVersionRequest {
  documentId: string;
  versionLabel?: string;
  changes?: string;
  file: File | Blob;
}

export interface AddCommentRequest {
  documentId: string;
  content: string;
  pageNumber?: number;
  coordinates?: { x: number; y: number };
  parentCommentId?: string;
}

// ============================================================================
// Summary/Analytics Types
// ============================================================================

export interface DocumentSummary {
  totalDocuments: number;
  totalSize: number;
  
  // By category
  byCategory: Record<DocumentCategory, number>;
  
  // By status
  byStatus: Record<DocumentStatus, number>;
  
  // By file type
  byFileType: Record<FileType, number>;
  
  // Recent activity
  recentUploads: number;               // Last 7 days
  pendingReviews: number;
}

export interface StorageStats {
  totalUsed: number;                   // In bytes
  totalLimit: number;                  // In bytes
  percentUsed: number;
  
  // By category
  byCategory: Record<DocumentCategory, number>;
  
  // Largest files
  largestFiles: {
    id: string;
    name: string;
    size: number;
  }[];
}

export interface DocumentSearchFilters {
  projectId: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  fileType?: FileType;
  uploadedBy?: string;
  tags?: string[];
  folderId?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// UI Helper Types
// ============================================================================

export interface DocumentListItem extends Document {
  folder?: DocumentFolder;
  shareCount?: number;
  commentCount?: number;
}

export interface FolderTreeNode extends DocumentFolder {
  children?: FolderTreeNode[];
  documents?: Document[];
}
