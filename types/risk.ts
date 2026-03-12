/**
 * Risk Management Types
 * Construction project risk identification and mitigation
 */

// Enums
export enum RiskCategory {
  SAFETY = 'SAFETY',
  TECHNICAL = 'TECHNICAL',
  FINANCIAL = 'FINANCIAL',
  SCHEDULE = 'SCHEDULE',
  QUALITY = 'QUALITY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  LEGAL = 'LEGAL',
  RESOURCE = 'RESOURCE',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
  WEATHER = 'WEATHER',
  STAKEHOLDER = 'STAKEHOLDER',
  REGULATORY = 'REGULATORY',
  OTHER = 'OTHER',
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export enum RiskProbability {
  VERY_LOW = 'VERY_LOW',      // < 10%
  LOW = 'LOW',                 // 10-30%
  MEDIUM = 'MEDIUM',           // 30-50%
  HIGH = 'HIGH',               // 50-70%
  VERY_HIGH = 'VERY_HIGH',     // > 70%
}

export enum RiskImpact {
  NEGLIGIBLE = 'NEGLIGIBLE',   // Minimal impact
  MINOR = 'MINOR',             // Small impact
  MODERATE = 'MODERATE',       // Noticeable impact
  MAJOR = 'MAJOR',             // Significant impact
  SEVERE = 'SEVERE',           // Critical impact
}

export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
  ANALYZING = 'ANALYZING',
  PLANNING = 'PLANNING',
  MONITORING = 'MONITORING',
  MITIGATING = 'MITIGATING',
  RESOLVED = 'RESOLVED',
  OCCURRED = 'OCCURRED',
  CLOSED = 'CLOSED',
}

export enum RiskTreatment {
  AVOID = 'AVOID',             // Eliminate the risk
  MITIGATE = 'MITIGATE',       // Reduce probability or impact
  TRANSFER = 'TRANSFER',       // Transfer to third party (insurance)
  ACCEPT = 'ACCEPT',           // Accept and monitor
  EXPLOIT = 'EXPLOIT',         // For opportunities
}

export enum MitigationStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

// Interfaces
export interface Risk {
  id: string;
  projectId: string;
  riskNumber: string; // e.g., "RISK-001"
  
  // Classification
  category: RiskCategory;
  title: string;
  description: string;
  
  // Assessment
  probability: RiskProbability;
  impact: RiskImpact;
  riskScore: number; // Calculated: probability × impact (1-25)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // Based on score
  
  // Context
  causes?: string[];
  triggers?: string[]; // Early warning signs
  affectedAreas?: string[]; // Work areas, phases, etc.
  affectedStakeholders?: string[];
  
  // Treatment
  status: RiskStatus;
  treatment: RiskTreatment;
  
  // Mitigation
  mitigationPlan?: string;
  mitigationActions?: {
    id: string;
    action: string;
    responsible: string;
    responsibleName?: string;
    dueDate: string;
    status: MitigationStatus;
    cost?: number;
    completedAt?: string;
    notes?: string;
  }[];
  
  // Contingency
  contingencyPlan?: string;
  contingencyBudget?: number;
  
  // Timeline
  identifiedDate: string;
  expectedOccurrenceDate?: string;
  occurrenceDate?: string;
  resolvedDate?: string;
  
  // Impact Details
  costImpact?: {
    minimum: number;
    mostLikely: number;
    maximum: number;
  };
  scheduleImpact?: {
    delayDays: number;
    criticalPathAffected: boolean;
  };
  qualityImpact?: string;
  safetyImpact?: string;
  
  // Ownership
  owner: string; // Risk owner
  ownerName?: string;
  identifiedBy: string;
  identifiedByName?: string;
  
  // Monitoring
  lastReviewDate?: string;
  nextReviewDate?: string;
  reviewFrequency?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  
  // Escalation
  escalationRequired?: boolean;
  escalatedTo?: string;
  escalatedAt?: string;
  
  // Documentation
  relatedDocuments?: string[];
  relatedIncidents?: string[];
  photos?: string[];
  
  // Notes
  notes?: string;
  lessonsLearned?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface RiskRegister {
  id: string;
  projectId: string;
  projectName: string;
  version: string;
  
  risks: Risk[];
  
  // Summary
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  
  activeRisks: number;
  resolvedRisks: number;
  occurredRisks: number;
  
  totalExposure: number; // Sum of (probability × cost impact)
  contingencyReserve: number;
  
  // Review
  lastUpdated: string;
  nextReviewDate: string;
  reviewedBy?: string;
  
  createdBy: string;
  createdAt: string;
}

export interface RiskAssessmentMatrix {
  probability: RiskProbability;
  impact: RiskImpact;
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  color: string;
  description: string;
}

export interface RiskTrend {
  date: string;
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  averageScore: number;
  totalExposure: number;
}

export interface RiskReport {
  projectId: string;
  reportDate: string;
  period: {
    startDate: string;
    endDate: string;
  };
  
  summary: {
    totalRisks: number;
    newRisks: number;
    closedRisks: number;
    activeRisks: number;
    
    byCategory: Record<RiskCategory, number>;
    byLevel: Record<string, number>;
    byStatus: Record<RiskStatus, number>;
    
    topRisks: Risk[];
    emergingRisks: Risk[];
    overdueActions: number;
  };
  
  financialImpact: {
    totalExposure: number;
    contingencyUsed: number;
    contingencyRemaining: number;
    potentialSavings: number;
  };
  
  scheduleImpact: {
    totalDelayRisk: number; // days
    criticalPathRisks: number;
  };
  
  trends: RiskTrend[];
  
  recommendations: string[];
  keyFindings: string[];
}

export interface RiskEvent {
  id: string;
  riskId: string;
  riskTitle: string;
  
  eventType: 'IDENTIFIED' | 'UPDATED' | 'ESCALATED' | 'OCCURRED' | 'MITIGATED' | 'RESOLVED' | 'CLOSED';
  description: string;
  
  // Changes
  previousStatus?: RiskStatus;
  newStatus?: RiskStatus;
  previousLevel?: string;
  newLevel?: string;
  
  // Impact
  actualCost?: number;
  actualDelay?: number;
  
  performedBy: string;
  performedByName?: string;
  occurredAt: string;
  
  notes?: string;
}

// API Request/Response Types
export interface GetRisksParams {
  projectId: string;
  category?: RiskCategory;
  status?: RiskStatus;
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  owner?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateRiskParams {
  projectId: string;
  category: RiskCategory;
  title: string;
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  treatment?: RiskTreatment;
  owner?: string;
  causes?: string[];
  triggers?: string[];
  affectedAreas?: string[];
  mitigationPlan?: string;
  contingencyPlan?: string;
  contingencyBudget?: number;
}

export interface UpdateRiskParams extends Partial<CreateRiskParams> {
  id: string;
  status?: RiskStatus;
}

export interface AssessRiskParams {
  id: string;
  probability: RiskProbability;
  impact: RiskImpact;
  costImpact?: Risk['costImpact'];
  scheduleImpact?: Risk['scheduleImpact'];
  notes?: string;
}

export interface AddMitigationActionParams {
  riskId: string;
  action: string;
  responsible: string;
  responsibleName?: string;
  dueDate: string;
  cost?: number;
}

export interface UpdateMitigationActionParams {
  riskId: string;
  actionId: string;
  status?: MitigationStatus;
  completedAt?: string;
  notes?: string;
}

export interface RecordRiskOccurrenceParams {
  id: string;
  occurrenceDate: string;
  actualCost?: number;
  actualDelay?: number;
  description: string;
  lessonsLearned?: string;
}

export interface GetRiskReportParams {
  projectId: string;
  startDate: string;
  endDate: string;
}
