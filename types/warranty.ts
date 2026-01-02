/**
 * Warranty Management Types
 * Warranty tracking and claims management
 */

// Warranty Status
export enum WarrantyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

// Warranty Type
export enum WarrantyType {
  MANUFACTURER = 'MANUFACTURER',
  CONTRACTOR = 'CONTRACTOR',
  EXTENDED = 'EXTENDED',
  SERVICE_CONTRACT = 'SERVICE_CONTRACT',
  PERFORMANCE_BOND = 'PERFORMANCE_BOND',
  MATERIAL = 'MATERIAL',
  WORKMANSHIP = 'WORKMANSHIP',
  SYSTEM = 'SYSTEM',
}

// Claim Status
export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
  DISPUTED = 'DISPUTED',
}

// Claim Priority
export enum ClaimPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY',
}

// Claim Type
export enum ClaimType {
  DEFECT = 'DEFECT',
  MALFUNCTION = 'MALFUNCTION',
  DAMAGE = 'DAMAGE',
  FAILURE = 'FAILURE',
  PERFORMANCE_ISSUE = 'PERFORMANCE_ISSUE',
  SAFETY_CONCERN = 'SAFETY_CONCERN',
  OTHER = 'OTHER',
}

// Coverage Type
export enum CoverageType {
  PARTS = 'PARTS',
  LABOR = 'LABOR',
  PARTS_AND_LABOR = 'PARTS_AND_LABOR',
  REPLACEMENT = 'REPLACEMENT',
  REPAIR = 'REPAIR',
  SERVICE = 'SERVICE',
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
}

// Resolution Type
export enum ResolutionType {
  REPAIRED = 'REPAIRED',
  REPLACED = 'REPLACED',
  REFUNDED = 'REFUNDED',
  CREDIT_ISSUED = 'CREDIT_ISSUED',
  NO_ACTION_REQUIRED = 'NO_ACTION_REQUIRED',
  REJECTED = 'REJECTED',
}

// Warranty Item
export interface WarrantyItem {
  id: string;
  warrantyNumber: string;
  warrantyType: WarrantyType;
  status: WarrantyStatus;
  
  // Item Information
  itemName: string;
  itemDescription?: string;
  itemCategory?: string;
  equipmentId?: string;
  equipmentNumber?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  
  // Location
  location?: string;
  building?: string;
  floor?: string;
  room?: string;
  
  // Coverage
  coverageType: CoverageType[];
  coverageDetails?: string;
  exclusions?: string[];
  limitations?: string;
  
  // Dates
  purchaseDate?: string;
  installationDate?: string;
  startDate: string;
  endDate: string;
  warrantyPeriod: number; // months
  remainingDays?: number;
  
  // Provider
  providedBy: {
    type: 'MANUFACTURER' | 'CONTRACTOR' | 'SUPPLIER' | 'INSTALLER' | 'OTHER';
    company: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  
  // Terms
  terms?: string;
  conditions?: string[];
  maintenanceRequired?: boolean;
  maintenanceFrequency?: string;
  transferable?: boolean;
  
  // Financial
  warrantyValue?: number;
  deductible?: number;
  
  // Documentation
  documents: WarrantyDocument[];
  certificateUrl?: string;
  
  // Claims
  claimCount: number;
  totalClaimValue?: number;
  lastClaimDate?: string;
  
  // Notifications
  notificationDays?: number; // days before expiry
  notificationSent?: boolean;
  
  // Project Info
  projectId?: string;
  projectName?: string;
  contractorId?: string;
  contractorName?: string;
  
  // Metadata
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  notes?: string;
}

// Warranty Document
export interface WarrantyDocument {
  id: string;
  name: string;
  documentType: 'WARRANTY_CERTIFICATE' | 'TERMS_CONDITIONS' | 'PURCHASE_ORDER' | 'INVOICE' | 'SERVICE_AGREEMENT' | 'OTHER';
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
}

// Warranty Claim
export interface WarrantyClaim {
  id: string;
  claimNumber: string;
  warrantyId: string;
  warrantyNumber: string;
  status: ClaimStatus;
  priority: ClaimPriority;
  claimType: ClaimType;
  
  // Claim Information
  title: string;
  description: string;
  issueDate: string;
  reportedBy: {
    id: string;
    name: string;
    role?: string;
    company?: string;
  };
  
  // Item Details
  itemName: string;
  equipmentId?: string;
  equipmentNumber?: string;
  location?: string;
  
  // Issue Details
  symptoms?: string[];
  causeAnalysis?: string;
  impactAssessment?: string;
  safetyIssue?: boolean;
  operationalImpact?: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  
  // Documentation
  photos: ClaimPhoto[];
  videos?: ClaimVideo[];
  attachments: ClaimAttachment[];
  
  // Financial
  estimatedCost?: number;
  actualCost?: number;
  approvedAmount?: number;
  deductibleAmount?: number;
  
  // Timeline
  submittedDate?: string;
  acknowledgedDate?: string;
  inspectionDate?: string;
  approvalDate?: string;
  rejectionDate?: string;
  workStartDate?: string;
  completionDate?: string;
  closedDate?: string;
  
  // Assignment
  assignedTo?: {
    id: string;
    name: string;
    company?: string;
    role?: string;
  };
  
  // Review
  reviewedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  reviewDate?: string;
  reviewComments?: string;
  
  // Resolution
  resolutionType?: ResolutionType;
  resolutionDescription?: string;
  resolutionDate?: string;
  workPerformed?: string;
  partsReplaced?: {
    partName: string;
    partNumber?: string;
    quantity: number;
    cost?: number;
  }[];
  laborHours?: number;
  
  // Inspection
  inspectionRequired: boolean;
  inspectionCompleted?: boolean;
  inspector?: {
    id: string;
    name: string;
    company?: string;
  };
  inspectionReport?: string;
  inspectionPhotos?: string[];
  
  // Rejection
  rejectionReason?: string;
  rejectionDetails?: string;
  appealSubmitted?: boolean;
  appealDate?: string;
  appealOutcome?: 'PENDING' | 'UPHELD' | 'OVERTURNED';
  
  // Communication
  updates: ClaimUpdate[];
  
  // Satisfaction
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// Claim Photo
export interface ClaimPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  photoType: 'BEFORE' | 'DURING' | 'AFTER' | 'DEFECT' | 'DAMAGE' | 'GENERAL';
  takenBy?: string;
  takenAt: string;
}

// Claim Video
export interface ClaimVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: number; // seconds
  uploadedBy: string;
  uploadedAt: string;
}

// Claim Attachment
export interface ClaimAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Claim Update
export interface ClaimUpdate {
  id: string;
  updateType: 'STATUS_CHANGE' | 'COMMENT' | 'INSPECTION' | 'APPROVAL' | 'REJECTION' | 'COMPLETION' | 'OTHER';
  message: string;
  updatedBy: {
    id: string;
    name: string;
    role?: string;
  };
  updatedAt: string;
  attachments?: string[];
  photos?: string[];
}

// Warranty Register
export interface WarrantyRegister {
  id: string;
  projectId: string;
  projectName: string;
  
  // Summary
  totalWarranties: number;
  activeWarranties: number;
  expiringWarranties: number; // within 90 days
  expiredWarranties: number;
  
  // By Type
  warrantiesByType: Record<WarrantyType, number>;
  
  // By Status
  warrantiesByStatus: Record<WarrantyStatus, number>;
  
  // Claims
  totalClaims: number;
  openClaims: number;
  resolvedClaims: number;
  claimResolutionRate: number; // percentage
  averageClaimDuration?: number; // days
  
  // Financial
  totalWarrantyValue?: number;
  totalClaimValue?: number;
  
  // Dates
  earliestExpiry?: string;
  latestExpiry?: string;
  
  // Top Items
  topClaimedItems: {
    itemName: string;
    warrantyId: string;
    claimCount: number;
  }[];
  
  generatedAt: string;
}

// Warranty Summary
export interface WarrantySummary {
  projectId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  
  // Overall Statistics
  totalWarranties: number;
  warrantiesByType: Record<WarrantyType, number>;
  warrantiesByStatus: Record<WarrantyStatus, number>;
  
  // Coverage
  totalCoverageValue?: number;
  averageWarrantyPeriod?: number; // months
  
  // Expiry
  expiringWithin30Days: number;
  expiringWithin60Days: number;
  expiringWithin90Days: number;
  expired: number;
  
  // Claims Statistics
  totalClaims: number;
  claimsByStatus: Record<ClaimStatus, number>;
  claimsByType: Record<ClaimType, number>;
  claimsByPriority: Record<ClaimPriority, number>;
  
  // Performance
  claimResolutionRate: number;
  averageResolutionTime?: number; // days
  approvalRate: number;
  rejectionRate: number;
  
  // Financial
  totalClaimValue?: number;
  approvedClaimValue?: number;
  averageClaimValue?: number;
  
  // Top Categories
  topClaimedCategories: {
    category: string;
    claimCount: number;
    resolutionRate: number;
  }[];
  
  topProviders: {
    company: string;
    warrantyCount: number;
    claimCount: number;
    responseTime?: number; // days
  }[];
}

// Warranty Analytics
export interface WarrantyAnalytics {
  projectId: string;
  period: string;
  summary: WarrantySummary;
  
  // Trends
  warrantyTrend: {
    month: string;
    warrantiesAdded: number;
    warrantiesExpired: number;
    activeWarranties: number;
  }[];
  
  claimTrend: {
    month: string;
    claimsSubmitted: number;
    claimsApproved: number;
    claimsRejected: number;
    claimsResolved: number;
    averageResolutionTime: number;
  }[];
  
  expiryTrend: {
    month: string;
    expiring: number;
    renewed?: number;
  }[];
  
  // Performance Analysis
  providerPerformance: {
    company: string;
    warrantyType: WarrantyType;
    activeWarranties: number;
    totalClaims: number;
    approvedClaims: number;
    averageResolutionTime: number;
    satisfactionRating?: number;
  }[];
  
  categoryAnalysis: {
    category: string;
    warrantyCount: number;
    claimCount: number;
    claimRate: number; // claims per warranty
    averageClaimValue: number;
  }[];
  
  // Quality Metrics
  qualityMetrics: {
    meanTimeBetweenFailures?: number; // days
    warrantyUtilizationRate: number; // percentage of warranties with claims
    repeatClaimRate: number; // percentage of items with multiple claims
    firstTimeFixRate: number; // percentage resolved on first attempt
  };
}

// Export Options
export interface WarrantyExportOptions {
  format: 'PDF' | 'EXCEL';
  includeExpired?: boolean;
  includeDocuments?: boolean;
  includeClaims?: boolean;
  groupBy?: 'TYPE' | 'STATUS' | 'PROVIDER' | 'CATEGORY';
  sortBy?: 'START_DATE' | 'END_DATE' | 'WARRANTY_NUMBER' | 'ITEM_NAME';
  template?: string;
}
