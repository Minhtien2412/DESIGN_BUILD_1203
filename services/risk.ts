/**
 * Risk Management Service
 * API integration for construction risk management
 */

import type {
    AddMitigationActionParams,
    AssessRiskParams,
    CreateRiskParams,
    GetRiskReportParams,
    GetRisksParams,
    RecordRiskOccurrenceParams,
    Risk,
    RiskEvent,
    RiskRegister,
    RiskReport,
    UpdateMitigationActionParams,
    UpdateRiskParams,
} from '@/types/risk';
import { apiFetch } from './api';

// Risk CRUD
export async function getRisks(params: GetRisksParams): Promise<Risk[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', params.projectId);
  if (params.category) queryParams.append('category', params.category);
  if (params.status) queryParams.append('status', params.status);
  if (params.level) queryParams.append('level', params.level);
  if (params.owner) queryParams.append('owner', params.owner);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`/risks?${queryParams.toString()}`);
}

export async function getRisk(id: string): Promise<Risk> {
  return apiFetch(`/risks/${id}`);
}

export async function createRisk(params: CreateRiskParams): Promise<Risk> {
  return apiFetch('/risks', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateRisk(params: UpdateRiskParams): Promise<Risk> {
  const { id, ...data } = params;
  return apiFetch(`/risks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRisk(id: string): Promise<void> {
  return apiFetch(`/risks/${id}`, {
    method: 'DELETE',
  });
}

// Risk Assessment
export async function assessRisk(params: AssessRiskParams): Promise<Risk> {
  const { id, ...data } = params;
  return apiFetch(`/risks/${id}/assess`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function reassessRisk(id: string): Promise<Risk> {
  return apiFetch(`/risks/${id}/reassess`, {
    method: 'POST',
  });
}

// Mitigation Actions
export async function addMitigationAction(params: AddMitigationActionParams): Promise<Risk> {
  const { riskId, ...data } = params;
  return apiFetch(`/risks/${riskId}/mitigation-actions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMitigationAction(params: UpdateMitigationActionParams): Promise<Risk> {
  const { riskId, actionId, ...data } = params;
  return apiFetch(`/risks/${riskId}/mitigation-actions/${actionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMitigationAction(riskId: string, actionId: string): Promise<Risk> {
  return apiFetch(`/risks/${riskId}/mitigation-actions/${actionId}`, {
    method: 'DELETE',
  });
}

// Risk Events
export async function recordRiskOccurrence(params: RecordRiskOccurrenceParams): Promise<Risk> {
  const { id, ...data } = params;
  return apiFetch(`/risks/${id}/occur`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resolveRisk(id: string, resolution: string, lessonsLearned?: string): Promise<Risk> {
  return apiFetch(`/risks/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution, lessonsLearned }),
  });
}

export async function closeRisk(id: string, closureNotes?: string): Promise<Risk> {
  return apiFetch(`/risks/${id}/close`, {
    method: 'POST',
    body: JSON.stringify({ closureNotes }),
  });
}

export async function escalateRisk(id: string, escalatedTo: string, reason: string): Promise<Risk> {
  return apiFetch(`/risks/${id}/escalate`, {
    method: 'POST',
    body: JSON.stringify({ escalatedTo, reason }),
  });
}

// Risk Register
export async function getRiskRegister(projectId: string): Promise<RiskRegister> {
  return apiFetch(`/risks/register/${projectId}`);
}

export async function exportRiskRegister(projectId: string, format: 'PDF' | 'EXCEL'): Promise<Blob> {
  return apiFetch(`/risks/register/${projectId}/export?format=${format}`, {
    responseType: 'blob',
  });
}

// Risk History & Events
export async function getRiskEvents(riskId: string): Promise<RiskEvent[]> {
  return apiFetch(`/risks/${riskId}/events`);
}

export async function getProjectRiskEvents(projectId: string): Promise<RiskEvent[]> {
  return apiFetch(`/risks/projects/${projectId}/events`);
}

// Reports & Analytics
export async function getRiskReport(params: GetRiskReportParams): Promise<RiskReport> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', params.projectId);
  queryParams.append('startDate', params.startDate);
  queryParams.append('endDate', params.endDate);

  return apiFetch(`/risks/reports?${queryParams.toString()}`);
}

export async function getRiskTrends(projectId: string, days: number = 30): Promise<any> {
  return apiFetch(`/risks/trends/${projectId}?days=${days}`);
}

export async function getRiskHeatmap(projectId: string): Promise<any> {
  return apiFetch(`/risks/heatmap/${projectId}`);
}

export async function getTopRisks(projectId: string, limit: number = 10): Promise<Risk[]> {
  return apiFetch(`/risks/top/${projectId}?limit=${limit}`);
}

export async function getOverdueActions(projectId: string): Promise<any> {
  return apiFetch(`/risks/overdue-actions/${projectId}`);
}

// Risk Analysis
export async function analyzeCategoryRisks(projectId: string, category: string): Promise<any> {
  return apiFetch(`/risks/analyze/category/${projectId}?category=${category}`);
}

export async function calculateRiskExposure(projectId: string): Promise<{
  totalExposure: number;
  byCategory: Record<string, number>;
  contingencyRecommendation: number;
}> {
  return apiFetch(`/risks/exposure/${projectId}`);
}

export async function getMonteCarloSimulation(
  projectId: string,
  iterations: number = 1000
): Promise<any> {
  return apiFetch(`/risks/monte-carlo/${projectId}?iterations=${iterations}`);
}
