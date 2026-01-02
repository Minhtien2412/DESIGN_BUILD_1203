/**
 * Quality Assurance & Testing Types
 * QA/QC management and testing procedures
 */

// Test Status
export enum TestStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL_PASS = 'CONDITIONAL_PASS',
  CANCELLED = 'CANCELLED',
  PENDING_RETEST = 'PENDING_RETEST',
}

// Test Category
export enum TestCategory {
  MATERIAL = 'MATERIAL',
  STRUCTURAL = 'STRUCTURAL',
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HVAC = 'HVAC',
  FIRE_SAFETY = 'FIRE_SAFETY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  PERFORMANCE = 'PERFORMANCE',
  FUNCTIONAL = 'FUNCTIONAL',
  LOAD = 'LOAD',
  PRESSURE = 'PRESSURE',
  LEAK = 'LEAK',
  OTHER = 'OTHER',
}

// Inspection Type
export enum InspectionType {
  PRELIMINARY = 'PRELIMINARY',
  PROGRESS = 'PROGRESS',
  FINAL = 'FINAL',
  ACCEPTANCE = 'ACCEPTANCE',
  THIRD_PARTY = 'THIRD_PARTY',
  REGULATORY = 'REGULATORY',
  COMPLIANCE = 'COMPLIANCE',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
}

// Inspection Status
export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL_PASS = 'CONDITIONAL_PASS',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

// Defect Severity
export enum DefectSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  COSMETIC = 'COSMETIC',
}

// Defect Status
export enum DefectStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

// NCR Status (Non-Conformance Report)
export enum NCRStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_CORRECTION = 'IN_CORRECTION',
  CORRECTED = 'CORRECTED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
}

// Quality Test
export interface QualityTest {
  id: string;
  testNumber: string;
  testName: string;
  description?: string;
  category: TestCategory;
  status: TestStatus;
  
  // Project Info
  projectId: string;
  projectName?: string;
  location?: string;
  zone?: string;
  
  // Test Details
  testProcedure?: string;
  testStandard?: string;
  acceptanceCriteria: string;
  
  // Scheduling
  scheduledDate?: string;
  scheduledTime?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  duration?: number; // in minutes
  
  // Personnel
  testPerformedBy?: {
    id: string;
    name: string;
    company?: string;
    certification?: string;
  };
  
  witnessedBy?: {
    id: string;
    name: string;
    company?: string;
    role?: string;
  }[];
  
  // Test Equipment
  equipment?: {
    name: string;
    serialNumber?: string;
    calibrationDate?: string;
    calibrationDue?: string;
  }[];
  
  // Results
  result?: 'PASS' | 'FAIL' | 'CONDITIONAL';
  actualResults?: string;
  measurements?: TestMeasurement[];
  
  // Conditions
  weatherConditions?: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    conditions?: string;
  };
  
  environmentalConditions?: string;
  
  // Documentation
  photos?: string[];
  videos?: string[];
  attachments?: {
    name: string;
    fileUrl: string;
    fileType: string;
  }[];
  
  // Deficiencies
  deficiencies?: string[];
  correctiveActions?: string[];
  
  // Retest
  retestRequired: boolean;
  retestDate?: string;
  retestReason?: string;
  originalTestId?: string;
  
  // Sign-off
  testedBy?: {
    id: string;
    name: string;
    signature?: string;
    date?: string;
  };
  
  approvedBy?: {
    id: string;
    name: string;
    signature?: string;
    date?: string;
  };
  
  // References
  relatedInspectionId?: string;
  relatedNCRId?: string;
  
  notes?: string;
  
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Test Measurement
export interface TestMeasurement {
  id: string;
  parameter: string;
  unit: string;
  expectedValue?: string;
  actualValue: string;
  tolerance?: string;
  result: 'PASS' | 'FAIL' | 'ACCEPTABLE';
  location?: string;
  notes?: string;
}

// Quality Inspection
export interface QualityInspection {
  id: string;
  inspectionNumber: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  
  // Project Info
  projectId: string;
  projectName?: string;
  location: string;
  area?: string;
  
  // Scope
  scopeOfWork: string;
  inspectionCriteria: string[];
  
  // Scheduling
  scheduledDate: string;
  scheduledTime?: string;
  actualDate?: string;
  duration?: number;
  
  // Inspector
  inspector: {
    id: string;
    name: string;
    company?: string;
    certification?: string;
  };
  
  // Attendees
  attendees?: {
    id: string;
    name: string;
    company?: string;
    role?: string;
  }[];
  
  // Checklist
  checklistItems: InspectionChecklistItem[];
  completionRate: number; // percentage
  
  // Results
  overallResult?: 'PASS' | 'FAIL' | 'CONDITIONAL';
  passedItems: number;
  failedItems: number;
  naItems: number;
  
  // Findings
  findings?: InspectionFinding[];
  defects?: string[]; // Defect IDs
  
  // Documentation
  photos?: InspectionPhoto[];
  attachments?: {
    name: string;
    fileUrl: string;
    fileType: string;
  }[];
  
  // Report
  reportUrl?: string;
  reportGeneratedAt?: string;
  
  // Sign-off
  inspectorSignature?: {
    signature: string;
    date: string;
  };
  
  contractorSignature?: {
    name: string;
    signature: string;
    date: string;
  };
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: string;
  followUpInspectionId?: string;
  
  notes?: string;
  
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Inspection Checklist Item
export interface InspectionChecklistItem {
  id: string;
  itemNumber: string;
  description: string;
  requirement?: string;
  category?: string;
  
  status: 'PASS' | 'FAIL' | 'NA' | 'PENDING';
  
  inspectedBy?: string;
  inspectedDate?: string;
  
  comments?: string;
  photo?: string;
  
  defectId?: string;
}

// Inspection Finding
export interface InspectionFinding {
  id: string;
  findingNumber: string;
  category: 'DEFICIENCY' | 'OBSERVATION' | 'RECOMMENDATION' | 'NON_COMPLIANCE';
  severity: DefectSeverity;
  
  description: string;
  location: string;
  
  requirement?: string;
  deviation?: string;
  
  photos?: string[];
  
  correctiveAction?: string;
  responsibleParty?: string;
  dueDate?: string;
  
  status: 'OPEN' | 'ADDRESSED' | 'VERIFIED' | 'CLOSED';
  
  resolvedDate?: string;
  resolvedBy?: string;
  resolution?: string;
}

// Inspection Photo
export interface InspectionPhoto {
  id: string;
  photoUrl: string;
  caption?: string;
  location?: string;
  checklistItemId?: string;
  findingId?: string;
  takenBy?: string;
  takenAt: string;
}

// Quality Defect
export interface QualityDefect {
  id: string;
  defectNumber: string;
  title: string;
  description: string;
  severity: DefectSeverity;
  status: DefectStatus;
  
  // Location
  projectId: string;
  projectName?: string;
  location: string;
  area?: string;
  zone?: string;
  
  // Classification
  category: string;
  defectType: string;
  
  // Discovery
  discoveredDate: string;
  discoveredBy: {
    id: string;
    name: string;
    company?: string;
  };
  discoveryMethod: 'INSPECTION' | 'TEST' | 'OBSERVATION' | 'COMPLAINT' | 'OTHER';
  
  // Source
  inspectionId?: string;
  testId?: string;
  ncrId?: string;
  
  // Impact
  impactOnSchedule: boolean;
  impactOnCost: boolean;
  impactOnSafety: boolean;
  impactOnQuality: boolean;
  
  estimatedCost?: number;
  scheduleDelay?: number; // in days
  
  // Assignment
  assignedTo?: {
    id: string;
    name: string;
    company?: string;
  };
  assignedDate?: string;
  
  responsibleContractor?: string;
  responsibleTrade?: string;
  
  // Resolution
  correctiveAction?: string;
  preventiveAction?: string;
  
  targetDate?: string;
  resolvedDate?: string;
  resolvedBy?: {
    id: string;
    name: string;
  };
  
  // Verification
  verifiedBy?: {
    id: string;
    name: string;
  };
  verifiedDate?: string;
  verificationMethod?: string;
  
  // Documentation
  photos?: {
    url: string;
    caption?: string;
    type: 'BEFORE' | 'DURING' | 'AFTER';
    takenAt: string;
  }[];
  
  attachments?: {
    name: string;
    fileUrl: string;
    fileType: string;
  }[];
  
  // Root Cause
  rootCause?: string;
  rootCauseCategory?: 'DESIGN' | 'WORKMANSHIP' | 'MATERIAL' | 'EQUIPMENT' | 'PROCEDURE' | 'OTHER';
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Non-Conformance Report (NCR)
export interface NonConformanceReport {
  id: string;
  ncrNumber: string;
  title: string;
  description: string;
  status: NCRStatus;
  
  // Project Info
  projectId: string;
  projectName?: string;
  location: string;
  
  // Classification
  category: 'DESIGN' | 'MATERIAL' | 'WORKMANSHIP' | 'DOCUMENTATION' | 'PROCEDURE' | 'OTHER';
  severity: DefectSeverity;
  
  // Discovery
  discoveredDate: string;
  discoveredBy: {
    id: string;
    name: string;
    company?: string;
  };
  
  // Non-Conformance Details
  specification?: string;
  requirement?: string;
  actualCondition: string;
  deviation: string;
  
  // Impact Assessment
  impactAssessment: string;
  safetyImpact: boolean;
  performanceImpact: boolean;
  costImpact: boolean;
  
  estimatedCost?: number;
  
  // Root Cause Analysis
  rootCause?: string;
  contributingFactors?: string[];
  
  // Disposition
  disposition?: 'USE_AS_IS' | 'REPAIR' | 'REWORK' | 'SCRAP' | 'RETURN' | 'OTHER';
  dispositionJustification?: string;
  
  // Corrective Action
  correctiveAction?: string;
  correctiveActionBy?: {
    id: string;
    name: string;
    company?: string;
  };
  correctiveActionDate?: string;
  
  // Preventive Action
  preventiveAction?: string;
  preventiveActionOwner?: string;
  
  // Approval
  reviewedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  reviewDate?: string;
  
  approvedBy?: {
    id: string;
    name: string;
    role?: string;
  };
  approvalDate?: string;
  
  // Verification
  verifiedBy?: {
    id: string;
    name: string;
  };
  verifiedDate?: string;
  verificationComments?: string;
  
  // Closure
  closedBy?: {
    id: string;
    name: string;
  };
  closedDate?: string;
  closureComments?: string;
  
  // Documentation
  photos?: string[];
  attachments?: {
    name: string;
    fileUrl: string;
    fileType: string;
  }[];
  
  // Related Items
  relatedDefectIds?: string[];
  relatedInspectionId?: string;
  relatedTestId?: string;
  
  notes?: string;
  
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// QA Register
export interface QARegister {
  id: string;
  projectId: string;
  projectName: string;
  
  // Tests Summary
  totalTests: number;
  testsByCategory: Record<TestCategory, number>;
  testsByStatus: Record<TestStatus, number>;
  testsPassRate: number;
  
  // Inspections Summary
  totalInspections: number;
  inspectionsByType: Record<InspectionType, number>;
  inspectionsByStatus: Record<InspectionStatus, number>;
  inspectionsPassRate: number;
  
  // Defects Summary
  totalDefects: number;
  defectsBySeverity: Record<DefectSeverity, number>;
  defectsByStatus: Record<DefectStatus, number>;
  openDefects: number;
  
  // NCRs Summary
  totalNCRs: number;
  ncrsByCategory: Record<string, number>;
  ncrsByStatus: Record<NCRStatus, number>;
  openNCRs: number;
  
  generatedAt: string;
}

// QA Summary
export interface QASummary {
  projectId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  
  // Tests
  totalTests: number;
  testsByCategory: Record<TestCategory, number>;
  testsByStatus: Record<TestStatus, number>;
  passedTests: number;
  failedTests: number;
  testPassRate: number;
  averageTestDuration?: number;
  
  // Inspections
  totalInspections: number;
  inspectionsByType: Record<InspectionType, number>;
  inspectionsByStatus: Record<InspectionStatus, number>;
  passedInspections: number;
  failedInspections: number;
  inspectionPassRate: number;
  averageCompletionRate: number;
  
  // Defects
  totalDefects: number;
  defectsBySeverity: Record<DefectSeverity, number>;
  defectsByStatus: Record<DefectStatus, number>;
  openDefects: number;
  closedDefects: number;
  averageResolutionTime?: number; // days
  
  // NCRs
  totalNCRs: number;
  ncrsByCategory: Record<string, number>;
  ncrsByStatus: Record<NCRStatus, number>;
  openNCRs: number;
  closedNCRs: number;
  
  // Quality Metrics
  qualityMetrics: {
    firstTimePassRate: number;
    defectDensity: number; // defects per inspection
    retestRate: number;
    ncrRate: number; // NCRs per test/inspection
  };
}

// QA Analytics
export interface QAAnalytics {
  projectId: string;
  period: string;
  summary: QASummary;
  
  // Trends
  testTrend: {
    month: string;
    testsCompleted: number;
    passRate: number;
    failedTests: number;
  }[];
  
  inspectionTrend: {
    month: string;
    inspectionsCompleted: number;
    passRate: number;
    averageCompletionRate: number;
  }[];
  
  defectTrend: {
    month: string;
    defectsCreated: number;
    defectsClosed: number;
    openDefects: number;
  }[];
  
  ncrTrend: {
    month: string;
    ncrsCreated: number;
    ncrsClosed: number;
    openNCRs: number;
  }[];
  
  // Performance Analysis
  categoryPerformance: {
    category: TestCategory;
    testsCompleted: number;
    passRate: number;
    averageDuration: number;
  }[];
  
  inspectorPerformance: {
    inspector: string;
    inspectionsCompleted: number;
    passRate: number;
    defectsFound: number;
  }[];
  
  // Quality Indicators
  qualityIndicators: {
    overallQualityScore: number;
    testReliability: number;
    inspectionEffectiveness: number;
    defectResolutionEfficiency: number;
    complianceRate: number;
  };
}

// Export Options
export interface QAExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV';
  includeTests?: boolean;
  includeInspections?: boolean;
  includeDefects?: boolean;
  includeNCRs?: boolean;
  includePhotos?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}
