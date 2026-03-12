/**
 * Inspection & Testing Types
 * Quality inspections, material testing, and compliance verification
 */

// Inspection type
export enum InspectionType {
  FOUNDATION = 'FOUNDATION',
  STRUCTURAL = 'STRUCTURAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HVAC = 'HVAC',
  FIREPROOFING = 'FIREPROOFING',
  WATERPROOFING = 'WATERPROOFING',
  FINISHING = 'FINISHING',
  MECHANICAL = 'MECHANICAL',
  SAFETY = 'SAFETY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  FINAL = 'FINAL',
  OTHER = 'OTHER',
}

// Inspection status
export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL_PASS = 'CONDITIONAL_PASS',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  // QC/QA Checklist statuses
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL',
  NA = 'NA',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Checklist type enum
export type ChecklistType = 
  | 'FOUNDATION'   // Móng
  | 'STRUCTURE'    // Kết cấu
  | 'MEP'          // Điện nước
  | 'FINISHING'    // Hoàn thiện
  | 'LANDSCAPE'    // Cảnh quan
  | 'SAFETY'       // An toàn
  | 'QUALITY'      // Chất lượng
  | 'CUSTOM';      // Tùy chỉnh

// Test type
export enum TestType {
  CONCRETE_STRENGTH = 'CONCRETE_STRENGTH',
  SOIL_COMPACTION = 'SOIL_COMPACTION',
  STEEL_TENSILE = 'STEEL_TENSILE',
  WELD_QUALITY = 'WELD_QUALITY',
  WATER_TIGHTNESS = 'WATER_TIGHTNESS',
  ELECTRICAL_CONTINUITY = 'ELECTRICAL_CONTINUITY',
  PRESSURE_TEST = 'PRESSURE_TEST',
  LOAD_TEST = 'LOAD_TEST',
  ACOUSTIC = 'ACOUSTIC',
  THERMAL = 'THERMAL',
  AIR_QUALITY = 'AIR_QUALITY',
  CHEMICAL_ANALYSIS = 'CHEMICAL_ANALYSIS',
  NON_DESTRUCTIVE = 'NON_DESTRUCTIVE',
  OTHER = 'OTHER',
}

// Test status
export enum TestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  RETEST_REQUIRED = 'RETEST_REQUIRED',
  CANCELLED = 'CANCELLED',
}

// Inspection severity
export enum InspectionSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
}

// Inspection
export interface Inspection {
  id: string;
  inspectionNumber: string; // e.g., "INS-2024-001"
  projectId: string;
  projectName: string;
  type: InspectionType;
  title: string;
  description: string;
  status: InspectionStatus;
  scheduledDate: string;
  scheduledTime?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  location: string;
  scope: string;
  checklistId?: string;
  checklist?: InspectionChecklist;
  inspector: {
    id: string;
    name: string;
    company: string;
    certification?: string;
    phone: string;
    email: string;
  };
  attendees?: InspectionAttendee[];
  findings?: InspectionFinding[];
  result?: InspectionResult;
  photos?: Photo[];
  documents?: string[];
  requiresReInspection: boolean;
  reInspectionDate?: string;
  reInspectionOf?: string;
  referenceStandards?: string[];
  weatherConditions?: string;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// Inspection checklist
export interface InspectionChecklist {
  id: string;
  name: string;
  type: InspectionType;
  version: string;
  sections: ChecklistSection[];
  totalItems: number;
  createdAt: string;
}

// Checklist section
export interface ChecklistSection {
  id: string;
  title: string;
  order: number;
  items: ChecklistItem[];
}

// Checklist item
export interface ChecklistItem {
  id: string;
  checklistId: string; // Parent checklist ID
  category: string; // Phân loại (Cột, Dầm, Sàn, etc.)
  description: string;
  specification?: string; // Tiêu chuẩn kỹ thuật
  requirement?: string;
  acceptanceCriteria?: string;
  referenceStandard?: string;
  isMandatory?: boolean;
  order: number;
  status: InspectionStatus; // Changed from result
  notes?: string; // Changed from remarks
  photos?: string[]; // Array of photo URLs
  measuredValue?: string;
  expectedValue?: string;
  unit?: string;
}

// Inspection attendee
export interface InspectionAttendee {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  attended: boolean;
  signature?: string;
  signedAt?: string;
}

// Inspection finding
export interface InspectionFinding {
  id: string;
  findingNumber: string;
  severity: InspectionSeverity;
  category: string;
  location: string;
  description: string;
  requirement?: string;
  nonConformance?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  responsibleParty?: string;
  dueDate?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED';
  resolvedDate?: string;
  resolvedBy?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  photos?: Photo[];
  beforePhotos?: Photo[];
  afterPhotos?: Photo[];
  comments?: string;
  createdAt: string;
}

// Inspection result
export interface InspectionResult {
  overallStatus: InspectionStatus;
  passedItems: number;
  failedItems: number;
  naItems: number;
  totalItems: number;
  passRate: number;
  majorFindings: number;
  criticalFindings: number;
  recommendations?: string;
  nextSteps?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  reportUrl?: string;
}

// Test
export interface Test {
  id: string;
  testNumber: string; // e.g., "TEST-2024-001"
  projectId: string;
  projectName: string;
  type: TestType;
  title: string;
  description: string;
  status: TestStatus;
  sampleId?: string;
  sampleLocation: string;
  sampleDate: string;
  sampleSize?: number;
  sampleQuantity?: number;
  testDate?: string;
  testDuration?: number; // minutes
  laboratory?: {
    id: string;
    name: string;
    accreditation?: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
  testMethod?: string;
  testStandard?: string;
  parameters: TestParameter[];
  result?: TestResult;
  retestOf?: string;
  retestReason?: string;
  photos?: Photo[];
  certificateUrl?: string;
  reportUrl?: string;
  notes?: string;
  requestedBy: string;
  requestedByName: string;
  createdAt: string;
  updatedAt: string;
}

// Test parameter
export interface TestParameter {
  id: string;
  parameter: string;
  expectedValue?: string;
  measuredValue?: string;
  unit: string;
  tolerance?: string;
  minValue?: number;
  maxValue?: number;
  result?: 'PASS' | 'FAIL' | 'PENDING';
  remarks?: string;
}

// Test result
export interface TestResult {
  overallStatus: TestStatus;
  passedParameters: number;
  failedParameters: number;
  totalParameters: number;
  passRate: number;
  summary?: string;
  recommendations?: string;
  retestRequired: boolean;
  retestParameters?: string[];
  certifiedBy?: string;
  certifiedByName?: string;
  certifiedDate?: string;
  certificateNumber?: string;
}

// Photo
export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  takenBy?: string;
  takenAt: string;
  location?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Non-conformance report
export interface NonConformanceReport {
  id: string;
  ncrNumber: string; // e.g., "NCR-2024-001"
  projectId: string;
  projectName: string;
  inspectionId?: string;
  testId?: string;
  type: 'INSPECTION' | 'TEST' | 'GENERAL';
  severity: InspectionSeverity;
  category: string;
  title: string;
  description: string;
  location: string;
  detectedDate: string;
  detectedBy: string;
  detectedByName: string;
  requirement?: string;
  nonConformance: string;
  rootCause?: string;
  correctiveAction: string;
  preventiveAction?: string;
  responsibleParty: string;
  responsiblePartyName: string;
  targetDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED' | 'REJECTED';
  implementedDate?: string;
  implementedBy?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  closedDate?: string;
  effectiveness?: 'EFFECTIVE' | 'INEFFECTIVE' | 'PENDING';
  costImpact?: number;
  scheduleImpact?: number;
  photos?: Photo[];
  documents?: string[];
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// Inspection analytics
export interface InspectionAnalytics {
  projectId?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalInspections: number;
    passed: number;
    failed: number;
    conditionalPass: number;
    passRate: number;
    totalTests: number;
    testPassRate: number;
    totalNCRs: number;
    openNCRs: number;
  };
  byType: {
    type: InspectionType | TestType;
    count: number;
    passRate: number;
  }[];
  bySeverity: {
    severity: InspectionSeverity;
    count: number;
    percentage: number;
  }[];
  trends: {
    month: string;
    inspections: number;
    passRate: number;
    findings: number;
  }[];
  topIssues: {
    category: string;
    count: number;
    avgResolutionDays: number;
  }[];
  complianceRate: number;
}

// API request/response types
export interface CreateInspectionParams {
  projectId: string;
  type: InspectionType;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime?: string;
  location: string;
  scope: string;
  checklistId?: string;
  inspectorId: string;
  attendees?: Omit<InspectionAttendee, 'id' | 'attended'>[];
}

export interface UpdateInspectionParams {
  id: string;
  title?: string;
  description?: string;
  scheduledDate?: string;
  location?: string;
  status?: InspectionStatus;
}

export interface SubmitInspectionResultParams {
  id: string;
  actualStartDate: string;
  actualEndDate: string;
  checklistResults: {
    itemId: string;
    result: 'PASS' | 'FAIL' | 'N/A';
    remarks?: string;
    measuredValue?: string;
  }[];
  findings?: Omit<InspectionFinding, 'id' | 'findingNumber' | 'status' | 'createdAt'>[];
  recommendations?: string;
  nextSteps?: string;
}

export interface CreateTestParams {
  projectId: string;
  type: TestType;
  title: string;
  description: string;
  sampleLocation: string;
  sampleDate: string;
  sampleSize?: number;
  laboratoryId?: string;
  testMethod?: string;
  testStandard?: string;
  parameters: Omit<TestParameter, 'id' | 'result'>[];
}

export interface SubmitTestResultParams {
  id: string;
  testDate: string;
  parameterResults: {
    parameterId: string;
    measuredValue: string;
    result: 'PASS' | 'FAIL';
    remarks?: string;
  }[];
  summary?: string;
  recommendations?: string;
  certificateNumber?: string;
}

export interface CreateNCRParams {
  projectId: string;
  inspectionId?: string;
  testId?: string;
  type: 'INSPECTION' | 'TEST' | 'GENERAL';
  severity: InspectionSeverity;
  category: string;
  title: string;
  description: string;
  location: string;
  requirement?: string;
  nonConformance: string;
  correctiveAction: string;
  preventiveAction?: string;
  responsibleParty: string;
  targetDate: string;
}

export interface GetInspectionsParams {
  projectId?: string;
  type?: InspectionType;
  status?: InspectionStatus;
  fromDate?: string;
  toDate?: string;
}

export interface GetTestsParams {
  projectId?: string;
  type?: TestType;
  status?: TestStatus;
  fromDate?: string;
  toDate?: string;
}

export interface GetNCRsParams {
  projectId?: string;
  severity?: InspectionSeverity;
  status?: NonConformanceReport['status'];
  fromDate?: string;
  toDate?: string;
}
