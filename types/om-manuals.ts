/**
 * O&M Manuals Types
 * Operations & Maintenance documentation management
 */

// Manual Status
export enum ManualStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// Equipment Category
export enum EquipmentCategory {
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HVAC = 'HVAC',
  FIRE_PROTECTION = 'FIRE_PROTECTION',
  LIFE_SAFETY = 'LIFE_SAFETY',
  SECURITY = 'SECURITY',
  BUILDING_AUTOMATION = 'BUILDING_AUTOMATION',
  COMMUNICATIONS = 'COMMUNICATIONS',
  ELEVATORS = 'ELEVATORS',
  LANDSCAPING = 'LANDSCAPING',
  ARCHITECTURAL = 'ARCHITECTURAL',
  OTHER = 'OTHER',
}

// Document Type
export enum DocumentType {
  OPERATION_MANUAL = 'OPERATION_MANUAL',
  MAINTENANCE_MANUAL = 'MAINTENANCE_MANUAL',
  TECHNICAL_SPECIFICATION = 'TECHNICAL_SPECIFICATION',
  WARRANTY = 'WARRANTY',
  PARTS_LIST = 'PARTS_LIST',
  DRAWING = 'DRAWING',
  SCHEMATIC = 'SCHEMATIC',
  CERTIFICATE = 'CERTIFICATE',
  TEST_REPORT = 'TEST_REPORT',
  TRAINING_MATERIAL = 'TRAINING_MATERIAL',
  SAFETY_DATA_SHEET = 'SAFETY_DATA_SHEET',
  OTHER = 'OTHER',
}

// Maintenance Type
export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  EMERGENCY = 'EMERGENCY',
}

// Maintenance Frequency
export enum MaintenanceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
  BI_ANNUAL = 'BI_ANNUAL',
  AS_NEEDED = 'AS_NEEDED',
}

// Review Status
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONDITIONALLY_APPROVED = 'CONDITIONALLY_APPROVED',
}

// Training Status
export enum TrainingStatus {
  NOT_STARTED = 'NOT_STARTED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Equipment Item
export interface EquipmentItem {
  id: string;
  equipmentNumber: string;
  equipmentName: string;
  description?: string;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  location: string;
  building?: string;
  floor?: string;
  room?: string;
  installationDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  expectedLifespan?: number; // years
  specifications: Record<string, any>;
  capacity?: string;
  power?: string;
  voltage?: string;
  criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  
  // Documentation
  documents: EquipmentDocument[];
  photos: EquipmentPhoto[];
  
  // Maintenance
  maintenanceSchedule: MaintenanceSchedule[];
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  
  // Parts
  spareParts: SparePart[];
  
  // Contacts
  installedBy?: {
    company: string;
    contact?: string;
    phone?: string;
    email?: string;
  };
  maintainedBy?: {
    company: string;
    contact?: string;
    phone?: string;
    email?: string;
  };
  
  // Metadata
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// Equipment Document
export interface EquipmentDocument {
  id: string;
  name: string;
  documentType: DocumentType;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  version?: string;
  revision?: string;
  language?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  expiryDate?: string;
}

// Equipment Photo
export interface EquipmentPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  photoType: 'GENERAL' | 'NAMEPLATE' | 'INSTALLATION' | 'DETAIL' | 'LOCATION';
  takenBy?: string;
  takenAt: string;
}

// Maintenance Schedule
export interface MaintenanceSchedule {
  id: string;
  taskName: string;
  description: string;
  maintenanceType: MaintenanceType;
  frequency: MaintenanceFrequency;
  duration?: number; // minutes
  
  // Scheduling
  startDate: string;
  nextDueDate: string;
  lastCompletedDate?: string;
  
  // Task Details
  procedures: string[];
  requiredTools?: string[];
  requiredParts?: string[];
  safetyPrecautions?: string[];
  
  // Assignment
  assignedTo?: {
    id: string;
    name: string;
    company?: string;
  };
  
  // Status
  isActive: boolean;
  notificationDays?: number; // days before due
  
  // History
  completionHistory: MaintenanceCompletion[];
}

// Maintenance Completion
export interface MaintenanceCompletion {
  id: string;
  completedDate: string;
  completedBy: string;
  duration?: number; // minutes
  notes?: string;
  issues?: string;
  partsUsed?: {
    partNumber: string;
    quantity: number;
  }[];
  nextDueDate?: string;
  photos?: string[];
}

// Spare Part
export interface SparePart {
  id: string;
  partNumber: string;
  partName: string;
  description?: string;
  manufacturer?: string;
  specification?: string;
  
  // Inventory
  minimumStock: number;
  currentStock: number;
  unit: string; // e.g., 'pcs', 'meters', 'liters'
  location?: string;
  
  // Pricing
  unitPrice?: number;
  supplier?: string;
  supplierContact?: string;
  leadTime?: number; // days
  
  // Usage
  lastOrderDate?: string;
  lastUsedDate?: string;
  
  isActive: boolean;
}

// O&M Manual Package
export interface OMManualPackage {
  id: string;
  packageNumber: string;
  title: string;
  description?: string;
  status: ManualStatus;
  
  // Project Info
  projectId: string;
  projectName: string;
  contractorId?: string;
  contractorName?: string;
  
  // Content
  equipmentItems: string[]; // Equipment IDs
  totalEquipment: number;
  
  // Documents Summary
  totalDocuments: number;
  documentsByType: Record<DocumentType, number>;
  
  // Dates
  submissionDate?: string;
  targetSubmissionDate?: string;
  reviewDate?: string;
  approvalDate?: string;
  
  // Review
  reviews: ManualReview[];
  currentReview?: ManualReview;
  
  // Distribution
  distributedTo?: string[];
  distributionDate?: string;
  
  // Training
  trainingRequired: boolean;
  trainingSessions?: TrainingSession[];
  
  // Attachments
  coverPage?: string;
  indexDocument?: string;
  certifications?: string[];
  
  // Metadata
  preparedBy: {
    id: string;
    name: string;
    company?: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  
  createdAt: string;
  updatedAt: string;
  version?: string;
  tags?: string[];
}

// Manual Review
export interface ManualReview {
  id: string;
  reviewNumber: number;
  reviewedBy: {
    id: string;
    name: string;
    role: string;
    company?: string;
  };
  reviewDate: string;
  status: ReviewStatus;
  
  // Review Details
  overallComments?: string;
  itemReviews: ItemReview[];
  
  // Deficiencies
  deficienciesFound: number;
  deficiencies: ReviewDeficiency[];
  
  // Recommendation
  recommendation: 'APPROVE' | 'REJECT' | 'REVISE' | 'CONDITIONALLY_APPROVE';
  conditions?: string[];
  
  // Response
  responseRequired: boolean;
  responseDueDate?: string;
  response?: string;
  responseDate?: string;
}

// Item Review
export interface ItemReview {
  equipmentId: string;
  equipmentNumber: string;
  equipmentName: string;
  status: ReviewStatus;
  comments?: string;
  issues?: string[];
  missingDocuments?: DocumentType[];
}

// Review Deficiency
export interface ReviewDeficiency {
  id: string;
  equipmentId?: string;
  category: 'MISSING_DOCUMENT' | 'INCOMPLETE_INFO' | 'INCORRECT_INFO' | 'QUALITY_ISSUE' | 'OTHER';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  
  identifiedDate: string;
  dueDate?: string;
  resolvedDate?: string;
  
  assignedTo?: string;
  resolution?: string;
}

// Training Session
export interface TrainingSession {
  id: string;
  sessionNumber: string;
  title: string;
  description?: string;
  status: TrainingStatus;
  
  // Scheduling
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: number; // minutes
  location?: string;
  
  // Equipment Coverage
  equipmentCovered: string[];
  
  // Trainer
  trainer: {
    id: string;
    name: string;
    company?: string;
    qualifications?: string;
  };
  
  // Attendees
  attendees: TrainingAttendee[];
  requiredAttendees?: string[];
  maximumAttendees?: number;
  
  // Materials
  materials?: {
    name: string;
    url: string;
  }[];
  
  // Agenda
  agenda?: string[];
  
  // Completion
  completedDate?: string;
  certificatesIssued?: boolean;
  
  notes?: string;
}

// Training Attendee
export interface TrainingAttendee {
  id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  
  // Attendance
  registered: boolean;
  attended: boolean;
  attendanceDate?: string;
  
  // Certification
  certificateIssued: boolean;
  certificateNumber?: string;
  certificateUrl?: string;
}

// O&M Manual Summary
export interface OMManualSummary {
  projectId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  
  // Overall Statistics
  totalPackages: number;
  packagesByStatus: Record<ManualStatus, number>;
  totalEquipment: number;
  equipmentByCategory: Record<EquipmentCategory, number>;
  
  // Documentation
  totalDocuments: number;
  documentsByType: Record<DocumentType, number>;
  documentsPerEquipment: number;
  
  // Review Statistics
  totalReviews: number;
  reviewsByStatus: Record<ReviewStatus, number>;
  averageReviewTime?: number; // days
  deficienciesFound: number;
  deficienciesResolved: number;
  
  // Training Statistics
  totalTrainingSessions: number;
  sessionsCompleted: number;
  totalAttendees: number;
  certificatesIssued: number;
  
  // Compliance
  completionRate: number; // percentage
  onTimeSubmissions: number;
  lateSubmissions: number;
  
  // Top Equipment
  topCategories: {
    category: EquipmentCategory;
    count: number;
    documentationRate: number;
  }[];
}

// O&M Analytics
export interface OMAnalytics {
  projectId: string;
  period: string;
  summary: OMManualSummary;
  
  // Trends
  submissionTrend: {
    month: string;
    packagesSubmitted: number;
    packagesApproved: number;
    equipmentDocumented: number;
  }[];
  
  reviewTrend: {
    month: string;
    reviewsCompleted: number;
    averageReviewTime: number;
    approvalRate: number;
  }[];
  
  trainingTrend: {
    month: string;
    sessionsHeld: number;
    attendees: number;
    certificatesIssued: number;
  }[];
  
  // Performance Analysis
  contractorPerformance: {
    contractorId: string;
    contractorName: string;
    packagesSubmitted: number;
    onTimeRate: number;
    approvalRate: number;
    deficienciesPerPackage: number;
  }[];
  
  categoryCompletion: {
    category: EquipmentCategory;
    totalEquipment: number;
    documented: number;
    completionRate: number;
    averageDocuments: number;
  }[];
  
  // Quality Metrics
  documentationQuality: {
    averageDocumentsPerEquipment: number;
    completeDocumentationRate: number;
    missingDocumentRate: number;
    averageReviewCycles: number;
  };
}

// Export Options
export interface OMExportOptions {
  format: 'PDF' | 'EXCEL';
  includePhotos?: boolean;
  includeDrawings?: boolean;
  includeWarranties?: boolean;
  includeMaintenanceSchedules?: boolean;
  includeTrainingRecords?: boolean;
  groupBy?: 'CATEGORY' | 'LOCATION' | 'BUILDING';
  sortBy?: 'EQUIPMENT_NUMBER' | 'NAME' | 'CATEGORY' | 'LOCATION';
  template?: string;
}
