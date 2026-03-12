/**
 * Safety & Compliance Module Types
 * Comprehensive type definitions for safety incidents, PPE, training, and audits
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Incident severity levels
 */
export enum IncidentSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SERIOUS = 'SERIOUS',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL',
}

/**
 * Incident types
 */
export enum IncidentType {
  FALL = 'FALL',
  STRUCK_BY = 'STRUCK_BY',
  CAUGHT_IN_BETWEEN = 'CAUGHT_IN_BETWEEN',
  ELECTRICAL = 'ELECTRICAL',
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
  CHEMICAL_EXPOSURE = 'CHEMICAL_EXPOSURE',
  FIRE = 'FIRE',
  EXPLOSION = 'EXPLOSION',
  COLLAPSE = 'COLLAPSE',
  SLIP_TRIP = 'SLIP_TRIP',
  CUT_LACERATION = 'CUT_LACERATION',
  BURN = 'BURN',
  STRAIN_SPRAIN = 'STRAIN_SPRAIN',
  NEAR_MISS = 'NEAR_MISS',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  OTHER = 'OTHER',
}

/**
 * Incident status
 */
export enum IncidentStatus {
  REPORTED = 'REPORTED',
  INVESTIGATING = 'INVESTIGATING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

/**
 * Body parts affected
 */
export enum BodyPart {
  HEAD = 'HEAD',
  EYES = 'EYES',
  FACE = 'FACE',
  NECK = 'NECK',
  SHOULDER = 'SHOULDER',
  ARM = 'ARM',
  HAND = 'HAND',
  FINGER = 'FINGER',
  CHEST = 'CHEST',
  BACK = 'BACK',
  ABDOMEN = 'ABDOMEN',
  LEG = 'LEG',
  KNEE = 'KNEE',
  ANKLE = 'ANKLE',
  FOOT = 'FOOT',
  MULTIPLE = 'MULTIPLE',
  OTHER = 'OTHER',
}

/**
 * PPE types
 */
export enum PPEType {
  HARD_HAT = 'HARD_HAT',
  SAFETY_GLASSES = 'SAFETY_GLASSES',
  FACE_SHIELD = 'FACE_SHIELD',
  EAR_PROTECTION = 'EAR_PROTECTION',
  RESPIRATOR = 'RESPIRATOR',
  DUST_MASK = 'DUST_MASK',
  SAFETY_VEST = 'SAFETY_VEST',
  GLOVES = 'GLOVES',
  SAFETY_SHOES = 'SAFETY_SHOES',
  SAFETY_HARNESS = 'SAFETY_HARNESS',
  COVERALLS = 'COVERALLS',
  RAIN_GEAR = 'RAIN_GEAR',
  WELDING_HELMET = 'WELDING_HELMET',
  KNEE_PADS = 'KNEE_PADS',
  OTHER = 'OTHER',
}

/**
 * PPE condition
 */
export enum PPECondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  WORN = 'WORN',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
}

/**
 * Training status
 */
export enum TrainingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Training types
 */
export enum TrainingType {
  ORIENTATION = 'ORIENTATION',
  TOOLBOX_TALK = 'TOOLBOX_TALK',
  HAZARD_COMMUNICATION = 'HAZARD_COMMUNICATION',
  FALL_PROTECTION = 'FALL_PROTECTION',
  SCAFFOLD_SAFETY = 'SCAFFOLD_SAFETY',
  ELECTRICAL_SAFETY = 'ELECTRICAL_SAFETY',
  EQUIPMENT_OPERATION = 'EQUIPMENT_OPERATION',
  CONFINED_SPACE = 'CONFINED_SPACE',
  FIRST_AID = 'FIRST_AID',
  FIRE_SAFETY = 'FIRE_SAFETY',
  EMERGENCY_RESPONSE = 'EMERGENCY_RESPONSE',
  PPE_USAGE = 'PPE_USAGE',
  EXCAVATION_SAFETY = 'EXCAVATION_SAFETY',
  CRANE_RIGGING = 'CRANE_RIGGING',
  HOT_WORK = 'HOT_WORK',
  REFRESHER = 'REFRESHER',
  OTHER = 'OTHER',
}

/**
 * Audit types
 */
export enum AuditType {
  SITE_INSPECTION = 'SITE_INSPECTION',
  PPE_COMPLIANCE = 'PPE_COMPLIANCE',
  EQUIPMENT_INSPECTION = 'EQUIPMENT_INSPECTION',
  HOUSEKEEPING = 'HOUSEKEEPING',
  FALL_PROTECTION = 'FALL_PROTECTION',
  SCAFFOLDING = 'SCAFFOLDING',
  ELECTRICAL = 'ELECTRICAL',
  EMERGENCY_PREPAREDNESS = 'EMERGENCY_PREPAREDNESS',
  HAZMAT = 'HAZMAT',
  DOCUMENTATION = 'DOCUMENTATION',
  REGULATORY_COMPLIANCE = 'REGULATORY_COMPLIANCE',
  OTHER = 'OTHER',
}

/**
 * Audit result
 */
export enum AuditResult {
  PASS = 'PASS',
  PASS_WITH_OBSERVATIONS = 'PASS_WITH_OBSERVATIONS',
  FAIL = 'FAIL',
  CRITICAL_FAIL = 'CRITICAL_FAIL',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Safety incident record
 */
export interface SafetyIncident {
  id: string;
  projectId: string;
  incidentNumber: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  occurredAt: Date;
  location: string;
  area?: string;
  injuredPerson?: {
    name: string;
    role: string;
    company?: string;
    age?: number;
    experience?: number; // years
  };
  bodyPartsAffected?: BodyPart[];
  witnesses?: string[];
  immediateAction: string;
  rootCause?: string;
  correctiveActions?: string[];
  preventiveMeasures?: string[];
  responsiblePerson: string;
  reportedBy: string;
  reportedAt: Date;
  investigatedBy?: string;
  investigationDate?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  closedBy?: string;
  closedAt?: Date;
  lostWorkDays?: number;
  medicalTreatment?: boolean;
  hospitalRequired?: boolean;
  fatalityOccurred?: boolean;
  propertyDamage?: number;
  environmentalImpact?: boolean;
  photos?: string[];
  documents?: string[];
  relatedIncidents?: string[];
  osha300Required?: boolean;
  regulatoryReported?: boolean;
  insuranceClaim?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PPE item
 */
export interface PPEItem {
  id: string;
  projectId: string;
  type: PPEType;
  name: string;
  manufacturer?: string;
  model?: string;
  size?: string;
  condition: PPECondition;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  purchaseDate?: Date;
  expiryDate?: Date;
  lastInspection?: Date;
  nextInspection?: Date;
  location?: string;
  assignedTo?: string;
  serialNumber?: string;
  certifications?: string[];
  notes?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PPE distribution record
 */
export interface PPEDistribution {
  id: string;
  projectId: string;
  ppeItemId: string;
  workerId: string;
  workerName: string;
  quantity: number;
  distributedAt: Date;
  distributedBy: string;
  returnedAt?: Date;
  returnedQuantity?: number;
  condition: PPECondition;
  returnNotes?: string;
  signature?: string;
  createdAt: Date;
}

/**
 * Training program
 */
export interface TrainingProgram {
  id: string;
  projectId: string;
  type: TrainingType;
  title: string;
  description?: string;
  objectives?: string[];
  duration: number; // minutes
  durationMinutes: number; // alias for duration
  validityPeriod?: number; // months
  validityPeriodMonths?: number; // alias for validityPeriod
  isMandatory: boolean;
  requiredFor?: string[]; // roles
  instructor?: string;
  materials?: string[];
  certificationIssued: boolean;
  maxParticipants?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Training session
 */
export interface TrainingSession {
  id: string;
  projectId: string;
  programId: string;
  programTitle: string;
  scheduledDate: Date | string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  instructor?: string;
  status: TrainingStatus;
  participants: {
    workerId: string;
    workerName: string;
    attended: boolean;
    score?: number;
    passed?: boolean;
    certificateIssued?: boolean;
    certificateNumber?: string;
    notes?: string;
  }[];
  actualDuration?: number; // minutes
  materials?: string[];
  topics?: string[];
  quiz?: {
    questions: number;
    passingScore: number;
  };
  feedback?: {
    workerId: string;
    rating: number;
    comments?: string;
  }[];
  notes?: string;
  photos?: string[];
  attendanceSheet?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Worker certification
 */
export interface WorkerCertification {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  programId: string;
  programTitle: string;
  trainingType: TrainingType;
  certificateNumber: string;
  issuedDate: Date;
  expiryDate?: Date;
  isValid: boolean;
  sessionId: string;
  score?: number;
  instructor: string;
  certificateUrl?: string;
  createdAt: Date;
}

/**
 * Safety audit
 */
export interface SafetyAudit {
  id: string;
  projectId: string;
  auditNumber: string;
  type: AuditType;
  title: string;
  description?: string;
  scheduledDate: Date;
  actualDate?: Date;
  auditor: string;
  participants?: string[];
  location: string;
  areas?: string[];
  checklist: {
    id: string;
    category: string;
    item: string;
    requirement: string;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'OBSERVATION' | 'N/A';
    notes?: string;
    photo?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  result: AuditResult;
  score?: number; // percentage
  findings: {
    id: string;
    category: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location?: string;
    photo?: string;
    immediateAction?: string;
    correctiveAction: string;
    responsiblePerson?: string;
    dueDate?: Date;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
    completedDate?: Date;
    verificationNotes?: string;
  }[];
  recommendations?: string[];
  summary?: string;
  nextAuditDate?: Date;
  photos?: string[];
  documents?: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Safety statistics
 */
export interface SafetyStats {
  projectId: string;
  period: {
    start: Date;
    end: Date;
  };
  incidents: {
    total: number;
    byType: Record<IncidentType, number>;
    bySeverity: Record<IncidentSeverity, number>;
    nearMisses: number;
    withInjury: number;
    fatalitites: number;
  };
  safety: {
    totalWorkHours: number;
    lostTimeDays: number;
    recordableIncidents: number;
    firstAidCases: number;
    medicalTreatmentCases: number;
    incidentRate: number; // per 200,000 hours
    lostTimeRate: number;
    severityRate: number;
    daysSinceLastIncident: number;
  };
  training: {
    sessionsCompleted: number;
    participantsTrained: number;
    certificationsIssued: number;
    complianceRate: number; // percentage
  };
  audits: {
    completed: number;
    averageScore: number;
    totalFindings: number;
    criticalFindings: number;
    openFindings: number;
  };
  ppe: {
    totalItems: number;
    distributed: number;
    needingReplacement: number;
    complianceRate: number;
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface GetIncidentsParams {
  projectId: string;
  status?: IncidentStatus[];
  severity?: IncidentSeverity[];
  type?: IncidentType[];
  startDate?: Date;
  endDate?: Date;
}

export interface CreateIncidentParams {
  projectId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  occurredAt: Date;
  location: string;
  area?: string;
  injuredPerson?: SafetyIncident['injuredPerson'];
  bodyPartsAffected?: BodyPart[];
  witnesses?: string[];
  immediateAction: string;
  responsiblePerson: string;
  lostWorkDays?: number;
  medicalTreatment?: boolean;
  hospitalRequired?: boolean;
  photos?: string[];
}

export interface UpdateIncidentParams {
  status?: IncidentStatus;
  rootCause?: string;
  correctiveActions?: string[];
  preventiveMeasures?: string[];
  investigatedBy?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface GetPPEParams {
  projectId: string;
  type?: PPEType[];
  condition?: PPECondition[];
  assignedTo?: string;
  needsInspection?: boolean;
}

export interface CreatePPEParams {
  projectId: string;
  type: PPEType;
  name: string;
  manufacturer?: string;
  model?: string;
  size?: string;
  condition: PPECondition;
  quantity: number;
  unitCost?: number;
  purchaseDate?: Date;
  expiryDate?: Date;
  location?: string;
  certifications?: string[];
}

export interface DistributePPEParams {
  projectId?: string;
  ppeItemId: string;
  workerId: string;
  workerName: string;
  quantity: number;
  distributedBy: string;
  condition?: PPECondition;
  signature?: string;
}

export interface GetTrainingSessionsParams {
  projectId: string;
  status?: TrainingStatus[];
  programId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateTrainingProgramParams {
  projectId: string;
  type: TrainingType;
  title: string;
  description?: string;
  objectives?: string[];
  duration: number;
  durationMinutes: number;
  validityPeriod?: number;
  validityPeriodMonths?: number;
  isMandatory: boolean;
  requiredFor?: string[];
  instructor?: string;
  materials?: string[];
  certificationIssued: boolean;
  maxParticipants?: number;
  createdBy?: string;
}

export interface CreateTrainingSessionParams {
  projectId: string;
  programId: string;
  scheduledDate: Date | string;
  startTime?: Date | string;
  endTime?: Date | string;
  location?: string;
  instructor?: string;
  maxParticipants?: number;
}

export interface RecordAttendanceParams {
  sessionId: string;
  participants: {
    workerId: string;
    workerName: string;
    attended: boolean;
    score?: number;
  }[];
}

export interface GetAuditsParams {
  projectId: string;
  type?: AuditType[];
  status?: ('SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')[];
  startDate?: Date;
  endDate?: Date;
}

export interface CreateAuditParams {
  projectId: string;
  type: AuditType;
  title: string;
  description?: string;
  scheduledDate: Date;
  auditor: string;
  location: string;
  areas?: string[];
  checklistTemplateId?: string;
}

export interface UpdateAuditParams {
  actualDate?: Date;
  checklist?: SafetyAudit['checklist'];
  result?: AuditResult;
  score?: number;
  findings?: SafetyAudit['findings'];
  recommendations?: string[];
  summary?: string;
  status?: SafetyAudit['status'];
}

export interface GetSafetyStatsParams {
  projectId: string;
  startDate: Date;
  endDate: Date;
}
