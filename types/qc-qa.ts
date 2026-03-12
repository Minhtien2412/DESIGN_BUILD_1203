// QC/QA System Types
// Quality Control and Quality Assurance for construction projects

// ============ Enums ============

export enum ChecklistType {
  FOUNDATION = 'FOUNDATION',
  STRUCTURE = 'STRUCTURE',
  MEP = 'MEP',
  FINISHING = 'FINISHING',
  LANDSCAPE = 'LANDSCAPE',
}

export enum InspectionStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NA = 'NA', // Not Applicable
  PENDING = 'PENDING',
}

export enum DefectSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  HIGH = 'HIGH',
  MINOR = 'MINOR',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  COSMETIC = 'COSMETIC',
}

export enum DefectStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
}

export enum ComplianceLevel {
  FULLY_COMPLIANT = 'FULLY_COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
}

// ============ Base Interfaces ============

export interface ChecklistItem {
  id: string;
  checklistId: string;
  category: string;
  description: string;
  specification?: string;
  status: InspectionStatus;
  photos: string[];
  notes?: string;
  inspectedBy?: string;
  inspectedAt?: Date;
  order: number;
}

export interface Checklist {
  id: string;
  projectId: string;
  type: ChecklistType;
  title: string;
  description?: string;
  items: ChecklistItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  totalItems: number;
  passedItems: number;
  failedItems: number;
  naItems: number;
  compliancePercentage: number;
}

export interface Inspection {
  id: string;
  projectId: string;
  checklistId: string;
  inspectorId: string;
  inspectorName: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  findings: string;
  recommendations: string;
  overallCompliance: ComplianceLevel;
  photos: string[];
  documents: string[];
  signatureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Defect {
  id: string;
  projectId: string;
  checklistId?: string;
  checklistItemId?: string;
  title: string;
  description: string;
  location: string;
  severity: DefectSeverity;
  status: DefectStatus;
  photos: string[];
  reportedBy: string;
  reportedByName: string;
  reportedAt: Date;
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: Date;
  resolvedAt?: Date;
  verifiedAt?: Date;
  closedAt?: Date;
  resolution?: string;
  comments: DefectComment[];
  estimatedCost?: number;
  actualCost?: number;
  dueDate?: Date;
}

export interface DefectComment {
  id: string;
  defectId: string;
  userId: string;
  userName: string;
  comment: string;
  photos: string[];
  createdAt: Date;
}

// ============ Checklist Templates ============

export interface FoundationChecklistTemplate {
  excavation: {
    depth: boolean;
    width: boolean;
    soilCondition: boolean;
    dewatering: boolean;
  };
  soil: {
    compaction: boolean;
    bearingCapacity: boolean;
    testing: boolean;
  };
  reinforcement: {
    barSize: boolean;
    spacing: boolean;
    coverage: boolean;
    tying: boolean;
  };
  concrete: {
    mix: boolean;
    slump: boolean;
    pouring: boolean;
    curing: boolean;
  };
  waterproofing: {
    membrane: boolean;
    application: boolean;
    testing: boolean;
  };
}

export interface StructureChecklistTemplate {
  columns: {
    dimensions: boolean;
    reinforcement: boolean;
    formwork: boolean;
    alignment: boolean;
  };
  beams: {
    dimensions: boolean;
    reinforcement: boolean;
    formwork: boolean;
    support: boolean;
  };
  slabs: {
    thickness: boolean;
    reinforcement: boolean;
    formwork: boolean;
    levelness: boolean;
  };
  connections: {
    splicing: boolean;
    anchoring: boolean;
    welding: boolean;
  };
}

export interface MEPChecklistTemplate {
  electrical: {
    wiring: boolean;
    conduits: boolean;
    panels: boolean;
    grounding: boolean;
    testing: boolean;
  };
  plumbing: {
    pipes: boolean;
    fixtures: boolean;
    drainage: boolean;
    pressureTesting: boolean;
  };
  hvac: {
    ductwork: boolean;
    insulation: boolean;
    equipment: boolean;
    controls: boolean;
  };
  fireSafety: {
    sprinklers: boolean;
    alarms: boolean;
    extinguishers: boolean;
    exits: boolean;
  };
}

export interface FinishingChecklistTemplate {
  walls: {
    plastering: boolean;
    painting: boolean;
    tiling: boolean;
    quality: boolean;
  };
  floors: {
    screed: boolean;
    tiling: boolean;
    finish: boolean;
    levelness: boolean;
  };
  ceilings: {
    framing: boolean;
    boarding: boolean;
    finishing: boolean;
  };
  doorsWindows: {
    installation: boolean;
    operation: boolean;
    sealing: boolean;
    hardware: boolean;
  };
}

export interface LandscapeChecklistTemplate {
  hardscape: {
    paving: boolean;
    drainage: boolean;
    retainingWalls: boolean;
    walkways: boolean;
  };
  softscape: {
    soilPreparation: boolean;
    planting: boolean;
    mulching: boolean;
    turfing: boolean;
  };
  irrigation: {
    layout: boolean;
    installation: boolean;
    testing: boolean;
    controls: boolean;
  };
  lighting: {
    fixtures: boolean;
    wiring: boolean;
    controls: boolean;
    testing: boolean;
  };
}

// ============ Reports & Analytics ============

export interface ComplianceReport {
  id: string;
  projectId: string;
  reportDate: Date;
  generatedBy: string;
  overallCompliance: ComplianceLevel;
  totalChecklists: number;
  completedChecklists: number;
  totalDefects: number;
  openDefects: number;
  criticalDefects: number;
  checklistsSummary: {
    type: ChecklistType;
    total: number;
    completed: number;
    compliancePercentage: number;
  }[];
  defectsSummary: {
    severity: DefectSeverity;
    count: number;
    percentage: number;
  }[];
  recommendations: string[];
  pdfUrl?: string;
}

export interface QualityMetrics {
  projectId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  overallQualityScore: number;
  complianceRate: number;
  defectRate: number;
  avgResolutionTime: number; // in hours
  inspectionCount: number;
  passRate: number;
  failRate: number;
  trends: {
    date: Date;
    qualityScore: number;
    defectCount: number;
    complianceRate: number;
  }[];
}

// ============ API Request/Response Types ============

export interface CreateChecklistRequest {
  projectId: string;
  type: ChecklistType;
  title: string;
  description?: string;
  items: Omit<ChecklistItem, 'id' | 'checklistId'>[];
}

export interface UpdateChecklistRequest {
  title?: string;
  description?: string;
  status?: Checklist['status'];
}

export interface UpdateChecklistItemRequest {
  status?: InspectionStatus;
  photos?: string[];
  notes?: string;
}

export interface CreateInspectionRequest {
  projectId: string;
  checklistId: string;
  scheduledDate: Date;
  inspectorId: string;
}

export interface UpdateInspectionRequest {
  status?: Inspection['status'];
  findings?: string;
  recommendations?: string;
  overallCompliance?: ComplianceLevel;
  photos?: string[];
  documents?: string[];
  signatureUrl?: string;
}

export interface CreateDefectRequest {
  projectId: string;
  checklistId?: string;
  checklistItemId?: string;
  title: string;
  description: string;
  location: string;
  severity: DefectSeverity;
  photos?: string[];
  assignedTo?: string;
  dueDate?: Date;
}

export interface UpdateDefectRequest {
  title?: string;
  description?: string;
  location?: string;
  severity?: DefectSeverity;
  status?: DefectStatus;
  assignedTo?: string;
  resolution?: string;
  estimatedCost?: number;
  actualCost?: number;
  dueDate?: Date;
}

export interface AddDefectCommentRequest {
  comment: string;
  photos?: string[];
}

export interface GenerateComplianceReportRequest {
  projectId: string;
  includeChecklists?: boolean;
  includeDefects?: boolean;
  includePhotos?: boolean;
}

export interface GetChecklistsParams {
  projectId: string;
  type?: ChecklistType;
  status?: Checklist['status'];
  page?: number;
  limit?: number;
}

export interface GetInspectionsParams {
  projectId?: string;
  checklistId?: string;
  inspectorId?: string;
  status?: Inspection['status'];
  page?: number;
  limit?: number;
}

export interface GetDefectsParams {
  projectId: string;
  severity?: DefectSeverity;
  status?: DefectStatus;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export interface GetQualityMetricsParams {
  projectId: string;
  startDate?: Date;
  endDate?: Date;
}

// ============ Response Types ============

export interface ChecklistResponse {
  checklist: Checklist;
}

export interface ChecklistsResponse {
  checklists: Checklist[];
  total: number;
  page: number;
  limit: number;
}

export interface InspectionResponse {
  inspection: Inspection;
}

export interface InspectionsResponse {
  inspections: Inspection[];
  total: number;
  page: number;
  limit: number;
}

export interface DefectResponse {
  defect: Defect;
}

export interface DefectsResponse {
  defects: Defect[];
  total: number;
  page: number;
  limit: number;
}

export interface ComplianceReportResponse {
  report: ComplianceReport;
}

export interface QualityMetricsResponse {
  metrics: QualityMetrics;
}
