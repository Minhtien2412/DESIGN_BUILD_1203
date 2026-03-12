/**
 * Commissioning Types
 * Construction project commissioning and systems testing
 */

// Enums
export enum CommissioningStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  FAILED = 'FAILED',
}

export enum SystemCategory {
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HVAC = 'HVAC',
  FIRE_PROTECTION = 'FIRE_PROTECTION',
  LIFE_SAFETY = 'LIFE_SAFETY',
  SECURITY = 'SECURITY',
  BUILDING_AUTOMATION = 'BUILDING_AUTOMATION',
  COMMUNICATIONS = 'COMMUNICATIONS',
  ENERGY_MANAGEMENT = 'ENERGY_MANAGEMENT',
  ELEVATOR = 'ELEVATOR',
  OTHER = 'OTHER',
}

export enum TestStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL_PASS = 'CONDITIONAL_PASS',
  RETEST_REQUIRED = 'RETEST_REQUIRED',
  WAIVED = 'WAIVED',
}

export enum TestType {
  FUNCTIONAL = 'FUNCTIONAL',
  PERFORMANCE = 'PERFORMANCE',
  INTEGRATION = 'INTEGRATION',
  STARTUP = 'STARTUP',
  CALIBRATION = 'CALIBRATION',
  LOAD_TEST = 'LOAD_TEST',
  ENDURANCE = 'ENDURANCE',
  SAFETY = 'SAFETY',
}

export enum DeficiencyPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DeficiencyStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
  DEFERRED = 'DEFERRED',
}

export enum HandoverStatus {
  NOT_READY = 'NOT_READY',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// Interfaces
export interface CommissioningTest {
  id: string;
  testNumber: string;
  systemId: string;
  
  // Test identification
  testName: string;
  description: string;
  testType: TestType;
  category: SystemCategory;
  status: TestStatus;
  
  // Test details
  testProcedure?: string;
  acceptanceCriteria: string[];
  designParameters?: Record<string, any>;
  actualParameters?: Record<string, any>;
  
  // Scheduling
  scheduledDate?: string;
  scheduledTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration?: number; // minutes
  
  // Personnel
  testedBy?: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
  witnessedBy?: {
    id: string;
    name: string;
    role: string;
    company: string;
  }[];
  
  // Test execution
  testSteps: TestStep[];
  completedSteps: number;
  totalSteps: number;
  
  // Results
  testResults?: string;
  passCriteria?: boolean;
  deviations?: string[];
  observations?: string[];
  recommendations?: string[];
  
  // Deficiencies
  deficienciesFound: number;
  deficiencies?: CommissioningDeficiency[];
  
  // Documentation
  photos: CommissioningPhoto[];
  attachments: CommissioningAttachment[];
  dataLogs?: string[]; // URLs to data log files
  instrumentsUsed?: {
    name: string;
    serialNumber: string;
    calibrationDate: string;
  }[];
  
  // Environmental conditions
  environmentalConditions?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    weather?: string;
  };
  
  // Retesting
  retestCount: number;
  retestRequired: boolean;
  retestReason?: string;
  originalTestId?: string; // If this is a retest
  
  // Sign-off
  contractorSignOff?: {
    signedBy: string;
    signedDate: string;
    signature?: string;
    comments?: string;
  };
  engineerSignOff?: {
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
}

export interface TestStep {
  id: string;
  stepNumber: number;
  description: string;
  expectedResult: string;
  actualResult?: string;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  notes?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface CommissioningDeficiency {
  id: string;
  deficiencyNumber: string;
  testId: string;
  
  // Identification
  description: string;
  severity: DeficiencyPriority;
  status: DeficiencyStatus;
  category: SystemCategory;
  
  // Assignment
  responsibleParty: string;
  assignedTo?: {
    id: string;
    name: string;
    company: string;
  };
  assignedDate?: string;
  
  // Dates
  identifiedDate: string;
  dueDate?: string;
  resolvedDate?: string;
  verifiedDate?: string;
  closedDate?: string;
  
  // Resolution
  resolution?: string;
  correctiveAction?: string;
  rootCause?: string;
  
  // Verification
  verifiedBy?: string;
  verificationNotes?: string;
  retestRequired: boolean;
  
  // Documentation
  photos: CommissioningPhoto[];
  attachments: CommissioningAttachment[];
  
  // Cost/schedule impact
  hasCostImpact: boolean;
  estimatedCost?: number;
  hasScheduleImpact: boolean;
  estimatedDays?: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissioningPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  takenBy?: string;
  takenAt: string;
}

export interface CommissioningAttachment {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  category?: string;
}

export interface CommissioningSystem {
  id: string;
  systemNumber: string;
  
  // System identification
  systemName: string;
  description: string;
  category: SystemCategory;
  location: string;
  building?: string;
  floor?: string;
  
  // Status
  status: CommissioningStatus;
  commissioningProgress: number; // Percentage
  
  // System details
  manufacturer?: string;
  model?: string;
  capacity?: string;
  specifications?: Record<string, any>;
  
  // Contractors
  installationContractor?: {
    id: string;
    name: string;
    company: string;
  };
  commissioningAgent?: {
    id: string;
    name: string;
    company: string;
  };
  
  // Testing
  tests: CommissioningTest[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  
  // Deficiencies
  totalDeficiencies: number;
  openDeficiencies: number;
  resolvedDeficiencies: number;
  
  // Dates
  installationCompleteDate?: string;
  commissioningStartDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  
  // Documentation
  drawings?: string[];
  manuals?: string[];
  warranties?: {
    type: string;
    startDate: string;
    endDate: string;
    provider: string;
  }[];
  
  // Training
  trainingRequired: boolean;
  trainingCompleted: boolean;
  trainingDate?: string;
  trainedPersonnel?: string[];
  
  // Handover
  handoverStatus: HandoverStatus;
  handoverDocuments?: string[];
  handoverNotes?: string;
  
  // Metadata
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface CommissioningPlan {
  id: string;
  planNumber: string;
  
  // Project info
  projectId: string;
  projectName?: string;
  
  // Plan details
  title: string;
  description?: string;
  status: 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  
  // Systems
  systems: CommissioningSystem[];
  totalSystems: number;
  completedSystems: number;
  
  // Schedule
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  
  // Team
  commissioningManager: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
  teamMembers: {
    id: string;
    name: string;
    role: string;
    company: string;
  }[];
  
  // Progress
  overallProgress: number; // Percentage
  totalTests: number;
  completedTests: number;
  passedTests: number;
  failedTests: number;
  
  // Deficiencies
  totalDeficiencies: number;
  openDeficiencies: number;
  criticalDeficiencies: number;
  
  // Documentation
  attachments: CommissioningAttachment[];
  
  // Sign-off
  approvedBy?: {
    id: string;
    name: string;
    role: string;
  };
  approvedDate?: string;
  
  // Metadata
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommissioningReport {
  id: string;
  reportNumber: string;
  
  // Report details
  title: string;
  reportType: 'PROGRESS' | 'FINAL' | 'SUMMARY' | 'DEFICIENCY';
  reportDate: string;
  reportingPeriod?: {
    startDate: string;
    endDate: string;
  };
  
  // Systems covered
  systemIds: string[];
  systemSummaries: {
    systemId: string;
    systemName: string;
    status: CommissioningStatus;
    testsCompleted: number;
    testsPassed: number;
    deficiencies: number;
  }[];
  
  // Executive summary
  executiveSummary: string;
  
  // Progress
  overallProgress: number;
  progressSinceLastReport?: number;
  
  // Test results summary
  totalTestsConducted: number;
  testsPassed: number;
  testsFailed: number;
  testsConditionalPass: number;
  retestsRequired: number;
  
  // Deficiencies summary
  deficienciesIdentified: number;
  deficienciesResolved: number;
  deficienciesOutstanding: number;
  criticalDeficiencies: number;
  
  // Key findings
  keyFindings: string[];
  majorIssues: string[];
  recommendations: string[];
  
  // Schedule
  scheduleStatus: 'ON_TRACK' | 'DELAYED' | 'AHEAD';
  scheduleDays?: number; // Positive = ahead, negative = delayed
  
  // Next steps
  upcomingTests: string[];
  nextMilestones: string[];
  
  // Attachments
  attachments: CommissioningAttachment[];
  photos: CommissioningPhoto[];
  
  // Distribution
  distributedTo: string[];
  distributedDate?: string;
  
  // Metadata
  preparedBy: {
    id: string;
    name: string;
    role: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommissioningSummary {
  projectId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  
  // Overall statistics
  totalSystems: number;
  systemsByCategory: Record<SystemCategory, number>;
  systemsByStatus: Record<CommissioningStatus, number>;
  
  // Testing statistics
  totalTests: number;
  testsByType: Record<TestType, number>;
  testsByStatus: Record<TestStatus, number>;
  
  // Progress metrics
  overallProgress: number;
  averageSystemProgress: number;
  systemsCompleted: number;
  completionRate: number;
  
  // Quality metrics
  firstTimePassRate: number;
  retestRate: number;
  averageRetestsPerTest: number;
  
  // Deficiency metrics
  totalDeficiencies: number;
  deficienciesByCategory: Record<SystemCategory, number>;
  deficienciesByPriority: Record<DeficiencyPriority, number>;
  deficienciesByStatus: Record<DeficiencyStatus, number>;
  deficiencyResolutionRate: number;
  averageDaysToResolve: number;
  
  // Schedule metrics
  systemsOnSchedule: number;
  systemsDelayed: number;
  averageDaysDelayed: number;
  
  // Top categories
  topSystemCategories: {
    category: SystemCategory;
    count: number;
    completionRate: number;
  }[];
  
  topDeficiencyCategories: {
    category: SystemCategory;
    count: number;
    resolutionRate: number;
  }[];
}

export interface CommissioningAnalytics {
  projectId: string;
  period: string;
  summary: CommissioningSummary;
  
  // Test completion trend
  testCompletionTrend: {
    month: string;
    testsCompleted: number;
    testsPassed: number;
    testsFailed: number;
    passRate: number;
  }[];
  
  // System progress trend
  systemProgressTrend: {
    month: string;
    systemsStarted: number;
    systemsCompleted: number;
    averageProgress: number;
  }[];
  
  // Deficiency trend
  deficiencyTrend: {
    month: string;
    identified: number;
    resolved: number;
    outstanding: number;
  }[];
  
  // Category performance
  categoryPerformance: {
    category: SystemCategory;
    totalTests: number;
    passRate: number;
    averageRetests: number;
    deficiencies: number;
    completionRate: number;
  }[];
  
  // Contractor performance
  contractorPerformance: {
    contractorId: string;
    contractorName: string;
    systemsResponsible: number;
    testsCompleted: number;
    passRate: number;
    deficiencies: number;
    onTimeCompletion: number;
  }[];
}

export interface CommissioningExportOptions {
  format: 'PDF' | 'EXCEL';
  includePhotos?: boolean;
  includeAttachments?: boolean;
  includeTestDetails?: boolean;
  includeDeficiencies?: boolean;
  sections?: string[];
  template?: string;
}
