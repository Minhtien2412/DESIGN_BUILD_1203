/**
 * Safety Service
 * Frontend service for safety API endpoints
 * - Safety audits and findings
 * - Incident reports
 * - PPE distribution
 * - Safety trainings
 */

import { get, patch, post, put } from "./api";

// ============ TYPES ============

export enum AuditStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum AuditType {
  ROUTINE = "ROUTINE",
  SURPRISE = "SURPRISE",
  COMPLIANCE = "COMPLIANCE",
  INCIDENT_FOLLOW_UP = "INCIDENT_FOLLOW_UP",
}

export enum FindingSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum IncidentStatus {
  REPORTED = "REPORTED",
  INVESTIGATING = "INVESTIGATING",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum IncidentSeverity {
  MINOR = "MINOR",
  MODERATE = "MODERATE",
  MAJOR = "MAJOR",
  FATAL = "FATAL",
}

export enum TrainingStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface AuditFinding {
  id: number;
  description: string;
  severity: FindingSeverity;
  location: string;
  photos?: string[];
  correctiveAction?: string;
  dueDate?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SafetyAudit {
  id: number;
  projectId: number;
  auditType: AuditType;
  status: AuditStatus;
  scheduledDate: string;
  auditorId: number;
  auditorName: string;
  location: string;
  checklist?: string[];
  findings: AuditFinding[];
  score?: number;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyIncident {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  incidentDate: string;
  location: string;
  reportedById: number;
  reportedByName: string;
  injuredWorkers?: { workerId: number; name: string; injuryType: string }[];
  witnesses?: { workerId: number; name: string; statement?: string }[];
  photos?: string[];
  rootCause?: string;
  correctiveActions?: string[];
  lostWorkDays?: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PPEDistribution {
  id: number;
  projectId: number;
  workerId: number;
  workerName: string;
  ppeType: string;
  quantity: number;
  size?: string;
  distributedAt: string;
  distributedBy: string;
  returnedAt?: string;
  condition?: string;
  notes?: string;
}

export interface SafetyTraining {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  trainingType: string;
  status: TrainingStatus;
  scheduledDate: string;
  duration: number; // minutes
  location: string;
  trainerId: number;
  trainerName: string;
  maxParticipants?: number;
  attendees: {
    workerId: number;
    name: string;
    attended: boolean;
    passedExam?: boolean;
  }[];
  materials?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SafetyDashboard {
  totalAudits: number;
  completedAudits: number;
  averageAuditScore: number;
  totalIncidents: number;
  openIncidents: number;
  incidentsBySeverity: { severity: IncidentSeverity; count: number }[];
  totalTrainings: number;
  trainingCompletionRate: number;
  totalPPEDistributed: number;
  recentIncidents: SafetyIncident[];
  upcomingAudits: SafetyAudit[];
  upcomingTrainings: SafetyTraining[];
}

// ============ DTOs ============

export interface QueryAuditDto {
  projectId?: number;
  status?: AuditStatus;
  auditType?: AuditType;
  fromDate?: string;
  toDate?: string;
}

export interface CreateAuditDto {
  projectId: number;
  auditType: AuditType;
  scheduledDate: string;
  auditorId: number;
  location: string;
  checklist?: string[];
  notes?: string;
}

export interface UpdateAuditDto {
  status?: AuditStatus;
  scheduledDate?: string;
  location?: string;
  checklist?: string[];
  score?: number;
  notes?: string;
}

export interface AddFindingDto {
  description: string;
  severity: FindingSeverity;
  location: string;
  photos?: string[];
  correctiveAction?: string;
  dueDate?: string;
}

export interface QueryIncidentDto {
  projectId?: number;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  fromDate?: string;
  toDate?: string;
}

export interface CreateIncidentDto {
  projectId: number;
  title: string;
  description: string;
  severity: IncidentSeverity;
  incidentDate: string;
  location: string;
  reportedById: number;
  injuredWorkers?: { workerId: number; injuryType: string }[];
  witnesses?: { workerId: number }[];
  photos?: string[];
}

export interface UpdateIncidentDto {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  description?: string;
  rootCause?: string;
  correctiveActions?: string[];
  lostWorkDays?: number;
}

export interface DistributePPEDto {
  projectId: number;
  workerId: number;
  ppeType: string;
  quantity: number;
  size?: string;
  distributedBy: string;
  notes?: string;
}

export interface ReturnPPEDto {
  condition: string;
  notes?: string;
}

export interface CreateTrainingDto {
  projectId: number;
  title: string;
  description?: string;
  trainingType: string;
  scheduledDate: string;
  duration: number;
  location: string;
  trainerId: number;
  maxParticipants?: number;
  materials?: string[];
}

export interface UpdateTrainingDto {
  status?: TrainingStatus;
  scheduledDate?: string;
  duration?: number;
  location?: string;
  maxParticipants?: number;
  materials?: string[];
}

export interface RecordAttendanceDto {
  workerId: number;
  attended: boolean;
  passedExam?: boolean;
}

// ============ API FUNCTIONS ============

const BASE_PATH = "/safety";

/**
 * Get safety dashboard metrics
 */
export async function getDashboard(
  projectId?: number
): Promise<SafetyDashboard> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/dashboard?${queryString}`
    : `${BASE_PATH}/dashboard`;

  return get<SafetyDashboard>(url);
}

// ============ AUDITS ============

/**
 * Get safety audits with filtering
 */
export async function getAudits(
  query: QueryAuditDto = {}
): Promise<SafetyAudit[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.status) params.append("status", query.status);
  if (query.auditType) params.append("auditType", query.auditType);
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/audits?${queryString}`
    : `${BASE_PATH}/audits`;

  return get<SafetyAudit[]>(url);
}

/**
 * Get audit by ID
 */
export async function getAuditById(id: number): Promise<SafetyAudit> {
  return get<SafetyAudit>(`${BASE_PATH}/audits/${id}`);
}

/**
 * Create a new safety audit
 */
export async function createAudit(dto: CreateAuditDto): Promise<SafetyAudit> {
  return post<SafetyAudit>(`${BASE_PATH}/audits`, dto);
}

/**
 * Update a safety audit
 */
export async function updateAudit(
  id: number,
  dto: UpdateAuditDto
): Promise<SafetyAudit> {
  return put<SafetyAudit>(`${BASE_PATH}/audits/${id}`, dto);
}

/**
 * Add finding to an audit
 */
export async function addFinding(
  auditId: number,
  dto: AddFindingDto
): Promise<AuditFinding> {
  return post<AuditFinding>(`${BASE_PATH}/audits/${auditId}/findings`, dto);
}

/**
 * Resolve an audit finding
 */
export async function resolveFinding(
  auditId: number,
  findingId: number
): Promise<AuditFinding> {
  return patch<AuditFinding>(
    `${BASE_PATH}/audits/${auditId}/findings/${findingId}/resolve`,
    {}
  );
}

// ============ INCIDENTS ============

/**
 * Get safety incidents with filtering
 */
export async function getIncidents(
  query: QueryIncidentDto = {}
): Promise<SafetyIncident[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.status) params.append("status", query.status);
  if (query.severity) params.append("severity", query.severity);
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/incidents?${queryString}`
    : `${BASE_PATH}/incidents`;

  return get<SafetyIncident[]>(url);
}

/**
 * Get incident by ID
 */
export async function getIncidentById(id: number): Promise<SafetyIncident> {
  return get<SafetyIncident>(`${BASE_PATH}/incidents/${id}`);
}

/**
 * Report a new safety incident
 */
export async function createIncident(
  dto: CreateIncidentDto
): Promise<SafetyIncident> {
  return post<SafetyIncident>(`${BASE_PATH}/incidents`, dto);
}

/**
 * Update a safety incident
 */
export async function updateIncident(
  id: number,
  dto: UpdateIncidentDto
): Promise<SafetyIncident> {
  return put<SafetyIncident>(`${BASE_PATH}/incidents/${id}`, dto);
}

// ============ PPE ============

/**
 * Get PPE distributions
 */
export async function getPPEDistributions(
  projectId?: number,
  workerId?: number
): Promise<PPEDistribution[]> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));
  if (workerId) params.append("workerId", String(workerId));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/ppe?${queryString}`
    : `${BASE_PATH}/ppe`;

  return get<PPEDistribution[]>(url);
}

/**
 * Distribute PPE to a worker
 */
export async function distributePPE(
  dto: DistributePPEDto
): Promise<PPEDistribution> {
  return post<PPEDistribution>(`${BASE_PATH}/ppe/distribute`, dto);
}

/**
 * Record PPE return
 */
export async function returnPPE(
  id: number,
  dto: ReturnPPEDto
): Promise<PPEDistribution> {
  return patch<PPEDistribution>(`${BASE_PATH}/ppe/${id}/return`, dto);
}

// ============ TRAININGS ============

/**
 * Get safety trainings
 */
export async function getTrainings(
  projectId?: number,
  status?: TrainingStatus
): Promise<SafetyTraining[]> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));
  if (status) params.append("status", status);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/trainings?${queryString}`
    : `${BASE_PATH}/trainings`;

  return get<SafetyTraining[]>(url);
}

/**
 * Get training by ID
 */
export async function getTrainingById(id: number): Promise<SafetyTraining> {
  return get<SafetyTraining>(`${BASE_PATH}/trainings/${id}`);
}

/**
 * Create a new safety training
 */
export async function createTraining(
  dto: CreateTrainingDto
): Promise<SafetyTraining> {
  return post<SafetyTraining>(`${BASE_PATH}/trainings`, dto);
}

/**
 * Update a safety training
 */
export async function updateTraining(
  id: number,
  dto: UpdateTrainingDto
): Promise<SafetyTraining> {
  return put<SafetyTraining>(`${BASE_PATH}/trainings/${id}`, dto);
}

/**
 * Record training attendance
 */
export async function recordAttendance(
  trainingId: number,
  dto: RecordAttendanceDto
): Promise<SafetyTraining> {
  return post<SafetyTraining>(
    `${BASE_PATH}/trainings/${trainingId}/attendance`,
    dto
  );
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{
  status: string;
  service: string;
  timestamp: string;
}> {
  return get(`${BASE_PATH}/health`);
}

export default {
  getDashboard,
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  addFinding,
  resolveFinding,
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  getPPEDistributions,
  distributePPE,
  returnPPE,
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  recordAttendance,
  healthCheck,
};
