/**
 * Safety & Compliance Service
 * API integration for safety incidents, PPE, training, and audits
 */

import type {
    CreateAuditParams,
    CreateIncidentParams,
    CreatePPEParams,
    CreateTrainingProgramParams,
    CreateTrainingSessionParams,
    DistributePPEParams,
    GetAuditsParams,
    GetIncidentsParams,
    GetPPEParams,
    GetSafetyStatsParams,
    GetTrainingSessionsParams,
    PPEDistribution,
    PPEItem,
    RecordAttendanceParams,
    SafetyAudit,
    SafetyIncident,
    SafetyStats,
    TrainingProgram,
    TrainingSession,
    UpdateAuditParams,
    UpdateIncidentParams,
    WorkerCertification,
} from '@/types/safety';
import { apiFetch } from './api';

// ============================================================================
// SAFETY INCIDENTS
// ============================================================================

export async function getIncidents(params: GetIncidentsParams): Promise<SafetyIncident[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    ...(params.status && { status: params.status.join(',') }),
    ...(params.severity && { severity: params.severity.join(',') }),
    ...(params.type && { type: params.type.join(',') }),
    ...(params.startDate && { startDate: params.startDate.toISOString() }),
    ...(params.endDate && { endDate: params.endDate.toISOString() }),
  });

  return apiFetch<SafetyIncident[]>(`/safety/incidents?${queryParams}`);
}

export async function getIncident(incidentId: string): Promise<SafetyIncident> {
  return apiFetch<SafetyIncident>(`/safety/incidents/${incidentId}`);
}

export async function createIncident(params: CreateIncidentParams): Promise<SafetyIncident> {
  return apiFetch<SafetyIncident>('/safety/incidents', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateIncident(
  incidentId: string,
  params: UpdateIncidentParams
): Promise<SafetyIncident> {
  return apiFetch<SafetyIncident>(`/safety/incidents/${incidentId}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
}

export async function deleteIncident(incidentId: string): Promise<void> {
  return apiFetch(`/safety/incidents/${incidentId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// PPE MANAGEMENT
// ============================================================================

export async function getPPEItems(params: GetPPEParams): Promise<PPEItem[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    ...(params.type && { type: params.type.join(',') }),
    ...(params.condition && { condition: params.condition.join(',') }),
    ...(params.assignedTo && { assignedTo: params.assignedTo }),
    ...(params.needsInspection !== undefined && {
      needsInspection: params.needsInspection.toString(),
    }),
  });

  return apiFetch<PPEItem[]>(`/safety/ppe?${queryParams}`);
}

export async function getPPEItem(itemId: string): Promise<PPEItem> {
  return apiFetch<PPEItem>(`/safety/ppe/${itemId}`);
}

export async function createPPEItem(params: CreatePPEParams): Promise<PPEItem> {
  return apiFetch<PPEItem>('/safety/ppe', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updatePPEItem(
  itemId: string,
  params: Partial<CreatePPEParams>
): Promise<PPEItem> {
  return apiFetch<PPEItem>(`/safety/ppe/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
}

export async function deletePPEItem(itemId: string): Promise<void> {
  return apiFetch(`/safety/ppe/${itemId}`, {
    method: 'DELETE',
  });
}

export async function distributePPE(params: DistributePPEParams): Promise<PPEDistribution> {
  return apiFetch<PPEDistribution>('/safety/ppe/distribute', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function returnPPE(
  distributionId: string,
  returnedQuantity: number,
  condition: string,
  notes?: string
): Promise<PPEDistribution> {
  return apiFetch<PPEDistribution>(`/safety/ppe/distributions/${distributionId}/return`, {
    method: 'POST',
    body: JSON.stringify({ returnedQuantity, condition, notes }),
  });
}

export async function getPPEDistributions(projectId: string): Promise<PPEDistribution[]> {
  return apiFetch<PPEDistribution[]>(`/safety/ppe/distributions?projectId=${projectId}`);
}

// ============================================================================
// TRAINING
// ============================================================================

export async function getTrainingPrograms(projectId: string): Promise<TrainingProgram[]> {
  return apiFetch<TrainingProgram[]>(`/safety/training/programs?projectId=${projectId}`);
}

export async function getTrainingProgram(programId: string): Promise<TrainingProgram> {
  return apiFetch<TrainingProgram>(`/safety/training/programs/${programId}`);
}

export async function createTrainingProgram(
  params: CreateTrainingProgramParams
): Promise<TrainingProgram> {
  return apiFetch<TrainingProgram>('/safety/training/programs', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getTrainingSessions(
  params: GetTrainingSessionsParams
): Promise<TrainingSession[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    ...(params.status && { status: params.status.join(',') }),
    ...(params.programId && { programId: params.programId }),
    ...(params.startDate && { startDate: params.startDate.toISOString() }),
    ...(params.endDate && { endDate: params.endDate.toISOString() }),
  });

  return apiFetch<TrainingSession[]>(`/safety/training/sessions?${queryParams}`);
}

export async function getTrainingSession(sessionId: string): Promise<TrainingSession> {
  return apiFetch<TrainingSession>(`/safety/training/sessions/${sessionId}`);
}

export async function createTrainingSession(
  params: CreateTrainingSessionParams
): Promise<TrainingSession> {
  return apiFetch<TrainingSession>('/safety/training/sessions', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateTrainingSession(
  sessionId: string,
  params: Partial<TrainingSession>
): Promise<TrainingSession> {
  return apiFetch<TrainingSession>(`/safety/training/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
}

export async function recordAttendance(
  params: RecordAttendanceParams
): Promise<TrainingSession> {
  return apiFetch<TrainingSession>(
    `/safety/training/sessions/${params.sessionId}/attendance`,
    {
      method: 'POST',
      body: JSON.stringify({ participants: params.participants }),
    }
  );
}

export async function getWorkerCertifications(
  workerId: string
): Promise<WorkerCertification[]> {
  return apiFetch<WorkerCertification[]>(
    `/safety/training/certifications?workerId=${workerId}`
  );
}

export async function issueVCertification(
  sessionId: string,
  workerId: string
): Promise<WorkerCertification> {
  return apiFetch<WorkerCertification>('/safety/training/certifications', {
    method: 'POST',
    body: JSON.stringify({ sessionId, workerId }),
  });
}

// ============================================================================
// SAFETY AUDITS
// ============================================================================

export async function getAudits(params: GetAuditsParams): Promise<SafetyAudit[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    ...(params.type && { type: params.type.join(',') }),
    ...(params.status && { status: params.status.join(',') }),
    ...(params.startDate && { startDate: params.startDate.toISOString() }),
    ...(params.endDate && { endDate: params.endDate.toISOString() }),
  });

  return apiFetch<SafetyAudit[]>(`/safety/audits?${queryParams}`);
}

export async function getAudit(auditId: string): Promise<SafetyAudit> {
  return apiFetch<SafetyAudit>(`/safety/audits/${auditId}`);
}

export async function createAudit(params: CreateAuditParams): Promise<SafetyAudit> {
  return apiFetch<SafetyAudit>('/safety/audits', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateAudit(
  auditId: string,
  params: UpdateAuditParams
): Promise<SafetyAudit> {
  return apiFetch<SafetyAudit>(`/safety/audits/${auditId}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
}

export async function deleteAudit(auditId: string): Promise<void> {
  return apiFetch(`/safety/audits/${auditId}`, {
    method: 'DELETE',
  });
}

export async function getAuditTemplates(type?: string) {
  const queryParams = type ? `?type=${type}` : '';
  return apiFetch(`/safety/audits/templates${queryParams}`);
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getSafetyStats(params: GetSafetyStatsParams): Promise<SafetyStats> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    startDate: params.startDate.toISOString(),
    endDate: params.endDate.toISOString(),
  });

  return apiFetch<SafetyStats>(`/safety/statistics?${queryParams}`);
}

export async function getIncidentTrends(projectId: string, months: number = 6) {
  return apiFetch(`/safety/incidents/trends?projectId=${projectId}&months=${months}`);
}

export async function getTrainingCompliance(projectId: string) {
  return apiFetch(`/safety/training/compliance?projectId=${projectId}`);
}
