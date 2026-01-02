/**
 * Daily Report Types
 * Construction daily report tracking system
 */

// Enums
export enum WeatherCondition {
  CLEAR = 'CLEAR',
  PARTLY_CLOUDY = 'PARTLY_CLOUDY',
  CLOUDY = 'CLOUDY',
  LIGHT_RAIN = 'LIGHT_RAIN',
  HEAVY_RAIN = 'HEAVY_RAIN',
  STORM = 'STORM',
  FOG = 'FOG',
  SNOW = 'SNOW',
  EXTREME_HEAT = 'EXTREME_HEAT',
}

export enum DailyReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISED = 'REVISED',
}

export enum WorkType {
  CIVIL = 'CIVIL',
  STRUCTURAL = 'STRUCTURAL',
  ARCHITECTURAL = 'ARCHITECTURAL',
  MEP = 'MEP',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HVAC = 'HVAC',
  FINISHING = 'FINISHING',
  LANDSCAPING = 'LANDSCAPING',
  DEMOLITION = 'DEMOLITION',
  EXCAVATION = 'EXCAVATION',
  FOUNDATION = 'FOUNDATION',
  OTHER = 'OTHER',
}

export enum SafetyIncidentSeverity {
  NONE = 'NONE',
  FIRST_AID = 'FIRST_AID',
  MEDICAL_TREATMENT = 'MEDICAL_TREATMENT',
  LOST_TIME = 'LOST_TIME',
  FATALITY = 'FATALITY',
  NEAR_MISS = 'NEAR_MISS',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
}

export enum EquipmentStatus {
  OPERATIONAL = 'OPERATIONAL',
  BREAKDOWN = 'BREAKDOWN',
  MAINTENANCE = 'MAINTENANCE',
  STANDBY = 'STANDBY',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export enum DelayImpact {
  NO_IMPACT = 'NO_IMPACT',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
}

// Main Daily Report
export interface DailyReport {
  id: string;
  reportNumber: string;
  reportDate: string; // Date in YYYY-MM-DD format
  projectId: string;
  projectName: string;
  
  // Report status
  status: DailyReportStatus;
  submittedBy: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
  submittedDate?: string;
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
  };
  reviewedDate?: string;
  approvedBy?: {
    id: string;
    name: string;
    role: string;
  };
  approvedDate?: string;
  
  // Weather information
  weather: WeatherInformation;
  
  // Work performed
  workPerformed: WorkActivity[];
  workSummary: string;
  
  // Manpower
  manpower: ManpowerRecord[];
  totalManpower: number;
  
  // Equipment
  equipment: EquipmentRecord[];
  
  // Materials
  materials: MaterialDelivery[];
  
  // Progress
  progress: ProgressUpdate[];
  overallProgressPercent: number;
  
  // Safety
  safety: SafetyReport;
  
  // Issues & delays
  issues: Issue[];
  delays: Delay[];
  
  // Visitors
  visitors?: Visitor[];
  
  // Inspections
  inspections?: Inspection[];
  
  // Quality observations
  qualityObservations?: QualityObservation[];
  
  // Photos
  photos: ReportPhoto[];
  
  // Notes & comments
  siteConditions: string;
  specialRemarks?: string;
  tomorrowPlan?: string;
  
  // Attachments
  attachments: DailyReportAttachment[];
  
  // Review comments
  reviewComments?: string;
  revisionRequested?: boolean;
  revisionNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  workingHours: {
    start: string; // HH:MM format
    end: string;
    totalHours: number;
    breakTime?: number;
    overtimeHours?: number;
  };
}

// Weather Information
export interface WeatherInformation {
  condition: WeatherCondition;
  temperature: {
    morning: number; // Celsius
    afternoon: number;
    evening: number;
  };
  humidity?: number; // Percentage
  windSpeed?: number; // km/h
  rainfall?: number; // mm
  weatherImpact: boolean;
  weatherImpactDescription?: string;
  workStoppageHours?: number;
}

// Work Activity
export interface WorkActivity {
  id: string;
  type: WorkType;
  description: string;
  location: string; // Building/Floor/Zone
  contractor: string;
  crewSize: number;
  hoursWorked: number;
  percentComplete: number;
  startTime?: string;
  endTime?: string;
  remarks?: string;
}

// Manpower Record
export interface ManpowerRecord {
  id: string;
  contractor: string;
  trade: string;
  workers: number;
  supervisors: number;
  engineers: number;
  totalCount: number;
  hoursWorked: number;
  overtimeHours?: number;
  remarks?: string;
}

// Equipment Record
export interface EquipmentRecord {
  id: string;
  equipmentType: string;
  equipmentId: string;
  operator?: string;
  status: EquipmentStatus;
  hoursOperated: number;
  location: string;
  fuelConsumption?: number;
  breakdownDescription?: string;
  maintenanceNotes?: string;
  remarks?: string;
}

// Material Delivery
export interface MaterialDelivery {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  supplier: string;
  deliveryTime: string;
  receivedBy: string;
  deliveryNoteNumber?: string;
  qualityAccepted: boolean;
  rejectedQuantity?: number;
  rejectionReason?: string;
  storageLocation?: string;
  remarks?: string;
}

// Progress Update
export interface ProgressUpdate {
  id: string;
  activity: string;
  discipline: WorkType;
  location: string;
  plannedProgress: number;
  actualProgress: number;
  variance: number; // actualProgress - plannedProgress
  cumulativeProgress: number;
  remarks?: string;
}

// Safety Report
export interface SafetyReport {
  safetyMeetingHeld: boolean;
  safetyMeetingAttendees?: number;
  safetyMeetingTopics?: string[];
  
  incidents: SafetyIncident[];
  incidentCount: number;
  
  nearMisses: NearMiss[];
  nearMissCount: number;
  
  safetyObservations: SafetyObservation[];
  
  ppeComplianceRate: number; // Percentage
  housekeepingScore?: number; // 1-10
  
  safetyInspectionConducted: boolean;
  safetyInspectionFindings?: string;
  
  lostTimeHours: number;
  daysWithoutIncident: number;
  
  correctiveActions?: CorrectiveAction[];
}

// Safety Incident
export interface SafetyIncident {
  id: string;
  time: string;
  location: string;
  severity: SafetyIncidentSeverity;
  description: string;
  injuredPerson?: {
    name: string;
    company: string;
    trade: string;
  };
  treatment?: string;
  rootCause?: string;
  immediateAction: string;
  reportedToAuthorities: boolean;
  investigationRequired: boolean;
  photos?: string[];
}

// Near Miss
export interface NearMiss {
  id: string;
  time: string;
  location: string;
  description: string;
  potentialSeverity: SafetyIncidentSeverity;
  reportedBy: string;
  preventiveAction: string;
}

// Safety Observation
export interface SafetyObservation {
  id: string;
  type: 'POSITIVE' | 'NEGATIVE';
  category: string;
  description: string;
  location: string;
  observedBy: string;
  actionRequired: boolean;
  actionTaken?: string;
}

// Corrective Action
export interface CorrectiveAction {
  id: string;
  issue: string;
  action: string;
  assignedTo: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  completedDate?: string;
}

// Issue
export interface Issue {
  id: string;
  category: string;
  description: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reportedBy: string;
  assignedTo?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  photos?: string[];
}

// Delay
export interface Delay {
  id: string;
  reason: string;
  category: string; // Weather, Material, Manpower, Equipment, Design, Client, Other
  startTime: string;
  endTime?: string;
  durationHours: number;
  impact: DelayImpact;
  affectedActivities: string[];
  mitigation?: string;
  responsibleParty?: string;
  costImpact?: number;
}

// Visitor
export interface Visitor {
  id: string;
  name: string;
  company: string;
  purpose: string;
  arrivalTime: string;
  departureTime?: string;
  accompaniedBy: string;
  areasVisited?: string[];
}

// Inspection
export interface Inspection {
  id: string;
  type: string;
  inspector: string;
  inspectorCompany: string;
  location: string;
  time: string;
  result: 'PASSED' | 'FAILED' | 'CONDITIONAL' | 'PENDING';
  findings?: string;
  correctiveActions?: string[];
  reinspectionRequired: boolean;
  reinspectionDate?: string;
}

// Quality Observation
export interface QualityObservation {
  id: string;
  activity: string;
  location: string;
  observation: string;
  conformance: 'CONFORMING' | 'NON_CONFORMING' | 'REQUIRES_ATTENTION';
  observedBy: string;
  actionRequired: boolean;
  actionTaken?: string;
  photos?: string[];
}

// Report Photo
export interface ReportPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption: string;
  category: 'PROGRESS' | 'SAFETY' | 'QUALITY' | 'ISSUE' | 'GENERAL';
  location?: string;
  takenBy: string;
  takenAt: string;
  tags?: string[];
}

// Daily Report Attachment
export interface DailyReportAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  category: 'DELIVERY_NOTE' | 'INSPECTION_REPORT' | 'TEST_RESULT' | 'OTHER';
  uploadedBy: string;
  uploadedAt: string;
}

// Daily Report Template
export interface DailyReportTemplate {
  id: string;
  name: string;
  projectId?: string;
  sections: {
    weather: boolean;
    workPerformed: boolean;
    manpower: boolean;
    equipment: boolean;
    materials: boolean;
    progress: boolean;
    safety: boolean;
    issues: boolean;
    delays: boolean;
    visitors: boolean;
    inspections: boolean;
    qualityObservations: boolean;
  };
  requiredFields: string[];
  defaultWorkTypes: WorkType[];
  defaultContractors: string[];
  customFields?: CustomField[];
}

// Custom Field
export interface CustomField {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN';
  options?: string[];
  required: boolean;
  defaultValue?: any;
}

// Daily Report Summary
export interface DailyReportSummary {
  projectId: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalReports: number;
  approvedReports: number;
  pendingReports: number;
  
  totalManpower: number;
  averageManpower: number;
  peakManpower: number;
  
  totalWorkingDays: number;
  weatherImpactDays: number;
  totalDelayHours: number;
  
  safetyMetrics: {
    totalIncidents: number;
    lostTimeIncidents: number;
    nearMisses: number;
    daysWithoutIncident: number;
    averagePPECompliance: number;
  };
  
  progressMetrics: {
    averageProgress: number;
    onScheduleActivities: number;
    behindScheduleActivities: number;
    aheadScheduleActivities: number;
  };
  
  equipmentUtilization: {
    totalHours: number;
    breakdownHours: number;
    maintenanceHours: number;
    utilizationRate: number;
  };
  
  materialDeliveries: number;
  qualityRejections: number;
  
  issuesSummary: {
    total: number;
    open: number;
    resolved: number;
    byCategory: Record<string, number>;
  };
}

// Daily Report Analytics
export interface DailyReportAnalytics {
  projectId: string;
  period: string;
  
  summary: DailyReportSummary;
  
  manpowerTrend: {
    date: string;
    total: number;
    byContractor: Record<string, number>;
  }[];
  
  progressTrend: {
    date: string;
    planned: number;
    actual: number;
    variance: number;
  }[];
  
  safetyTrend: {
    date: string;
    incidents: number;
    nearMisses: number;
    ppeCompliance: number;
  }[];
  
  weatherImpact: {
    condition: WeatherCondition;
    days: number;
    impactHours: number;
  }[];
  
  delayAnalysis: {
    category: string;
    count: number;
    totalHours: number;
    percentage: number;
  }[];
  
  productivityMetrics: {
    date: string;
    manHours: number;
    progressAchieved: number;
    productivityIndex: number;
  }[];
  
  topIssues: {
    category: string;
    count: number;
    openCount: number;
    averageResolutionDays: number;
  }[];
  
  equipmentPerformance: {
    equipmentType: string;
    totalHours: number;
    breakdownCount: number;
    availability: number;
  }[];
}

// Export types
export interface DailyReportExportOptions {
  format: 'PDF' | 'EXCEL' | 'WORD';
  includePhotos: boolean;
  includeAttachments: boolean;
  sections?: string[];
  template?: string;
}
