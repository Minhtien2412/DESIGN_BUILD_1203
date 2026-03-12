/**
 * Environmental Management Service
 * API integration for environmental monitoring, waste, emissions, and compliance
 */

import type {
    ComplianceStatus,
    EmissionRecord,
    EmissionType,
    EnvironmentalAnalytics,
    EnvironmentalExportOptions,
    EnvironmentalIncident,
    EnvironmentalMonitoring,
    EnvironmentalPermit,
    EnvironmentalRegister,
    EnvironmentalSummary,
    MonitoringStatus,
    MonitoringType,
    PermitStatus,
    WasteRecord,
    WasteStatus,
    WasteType,
} from '@/types/environmental';
import { apiFetch } from './api';

// ============================================================================
// Environmental Monitoring
// ============================================================================

export interface GetMonitoringParams {
  projectId?: string;
  monitoringType?: MonitoringType;
  status?: MonitoringStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getEnvironmentalMonitoring = async (
  params?: GetMonitoringParams
): Promise<EnvironmentalMonitoring[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.monitoringType) queryParams.append('monitoringType', params.monitoringType);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<EnvironmentalMonitoring[]>(`/environmental/monitoring?${queryParams}`);
};

export const getMonitoring = async (id: string): Promise<EnvironmentalMonitoring> => {
  return apiFetch<EnvironmentalMonitoring>(`/environmental/monitoring/${id}`);
};

export const createMonitoring = async (
  data: Partial<EnvironmentalMonitoring>
): Promise<EnvironmentalMonitoring> => {
  return apiFetch<EnvironmentalMonitoring>('/environmental/monitoring', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMonitoring = async (
  id: string,
  data: Partial<EnvironmentalMonitoring>
): Promise<EnvironmentalMonitoring> => {
  return apiFetch<EnvironmentalMonitoring>(`/environmental/monitoring/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteMonitoring = async (id: string): Promise<void> => {
  return apiFetch<void>(`/environmental/monitoring/${id}`, { method: 'DELETE' });
};

export const recordMeasurement = async (
  monitoringId: string,
  data: {
    measuredValue: number;
    result: 'PASS' | 'FAIL' | 'WARNING';
    measurements?: any[];
  }
): Promise<EnvironmentalMonitoring> => {
  return apiFetch<EnvironmentalMonitoring>(
    `/environmental/monitoring/${monitoringId}/measure`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

// ============================================================================
// Waste Management
// ============================================================================

export interface GetWasteParams {
  projectId?: string;
  wasteType?: WasteType;
  status?: WasteStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getWasteRecords = async (
  params?: GetWasteParams
): Promise<WasteRecord[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.wasteType) queryParams.append('wasteType', params.wasteType);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<WasteRecord[]>(`/environmental/waste?${queryParams}`);
};

export const getWasteRecord = async (id: string): Promise<WasteRecord> => {
  return apiFetch<WasteRecord>(`/environmental/waste/${id}`);
};

export const createWasteRecord = async (
  data: Partial<WasteRecord>
): Promise<WasteRecord> => {
  return apiFetch<WasteRecord>('/environmental/waste', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateWasteRecord = async (
  id: string,
  data: Partial<WasteRecord>
): Promise<WasteRecord> => {
  return apiFetch<WasteRecord>(`/environmental/waste/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWasteRecord = async (id: string): Promise<void> => {
  return apiFetch<void>(`/environmental/waste/${id}`, { method: 'DELETE' });
};

export const markWasteCollected = async (
  wasteId: string,
  data: {
    collectedDate: string;
    transporter?: any;
    manifestNumber?: string;
  }
): Promise<WasteRecord> => {
  return apiFetch<WasteRecord>(`/environmental/waste/${wasteId}/collect`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const markWasteDisposed = async (
  wasteId: string,
  data: {
    disposedDate: string;
    actualQuantity?: number;
    disposalCost?: number;
  }
): Promise<WasteRecord> => {
  return apiFetch<WasteRecord>(`/environmental/waste/${wasteId}/dispose`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ============================================================================
// Emissions Tracking
// ============================================================================

export interface GetEmissionsParams {
  projectId?: string;
  emissionType?: EmissionType;
  dateFrom?: string;
  dateTo?: string;
  scope?: string;
  search?: string;
}

export const getEmissionRecords = async (
  params?: GetEmissionsParams
): Promise<EmissionRecord[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.emissionType) queryParams.append('emissionType', params.emissionType);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.scope) queryParams.append('scope', params.scope);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<EmissionRecord[]>(`/environmental/emissions?${queryParams}`);
};

export const getEmissionRecord = async (id: string): Promise<EmissionRecord> => {
  return apiFetch<EmissionRecord>(`/environmental/emissions/${id}`);
};

export const createEmissionRecord = async (
  data: Partial<EmissionRecord>
): Promise<EmissionRecord> => {
  return apiFetch<EmissionRecord>('/environmental/emissions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateEmissionRecord = async (
  id: string,
  data: Partial<EmissionRecord>
): Promise<EmissionRecord> => {
  return apiFetch<EmissionRecord>(`/environmental/emissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteEmissionRecord = async (id: string): Promise<void> => {
  return apiFetch<void>(`/environmental/emissions/${id}`, { method: 'DELETE' });
};

export const calculateEmissions = async (
  data: {
    emissionType: EmissionType;
    emissionSource: string;
    activityData: any;
    emissionFactor?: number;
  }
): Promise<{ emissionsQuantity: number; co2Equivalent?: number }> => {
  return apiFetch<{ emissionsQuantity: number; co2Equivalent?: number }>(
    '/environmental/emissions/calculate',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

// ============================================================================
// Environmental Incidents
// ============================================================================

export interface GetIncidentsParams {
  projectId?: string;
  severity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getEnvironmentalIncidents = async (
  params?: GetIncidentsParams
): Promise<EnvironmentalIncident[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<EnvironmentalIncident[]>(`/environmental/incidents?${queryParams}`);
};

export const getEnvironmentalIncident = async (
  id: string
): Promise<EnvironmentalIncident> => {
  return apiFetch<EnvironmentalIncident>(`/environmental/incidents/${id}`);
};

export const createEnvironmentalIncident = async (
  data: Partial<EnvironmentalIncident>
): Promise<EnvironmentalIncident> => {
  return apiFetch<EnvironmentalIncident>('/environmental/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateEnvironmentalIncident = async (
  id: string,
  data: Partial<EnvironmentalIncident>
): Promise<EnvironmentalIncident> => {
  return apiFetch<EnvironmentalIncident>(`/environmental/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteEnvironmentalIncident = async (id: string): Promise<void> => {
  return apiFetch<void>(`/environmental/incidents/${id}`, { method: 'DELETE' });
};

export const markCleanupCompleted = async (
  incidentId: string,
  data: {
    cleanupDate: string;
    cleanupCost?: number;
    cleanupDetails?: string;
  }
): Promise<EnvironmentalIncident> => {
  return apiFetch<EnvironmentalIncident>(
    `/environmental/incidents/${incidentId}/cleanup`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

// ============================================================================
// Environmental Permits
// ============================================================================

export interface GetPermitsParams {
  projectId?: string;
  status?: PermitStatus;
  complianceStatus?: ComplianceStatus;
  search?: string;
}

export const getEnvironmentalPermits = async (
  params?: GetPermitsParams
): Promise<EnvironmentalPermit[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.complianceStatus) queryParams.append('complianceStatus', params.complianceStatus);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<EnvironmentalPermit[]>(`/environmental/permits?${queryParams}`);
};

export const getEnvironmentalPermit = async (
  id: string
): Promise<EnvironmentalPermit> => {
  return apiFetch<EnvironmentalPermit>(`/environmental/permits/${id}`);
};

export const createEnvironmentalPermit = async (
  data: Partial<EnvironmentalPermit>
): Promise<EnvironmentalPermit> => {
  return apiFetch<EnvironmentalPermit>('/environmental/permits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateEnvironmentalPermit = async (
  id: string,
  data: Partial<EnvironmentalPermit>
): Promise<EnvironmentalPermit> => {
  return apiFetch<EnvironmentalPermit>(`/environmental/permits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteEnvironmentalPermit = async (id: string): Promise<void> => {
  return apiFetch<void>(`/environmental/permits/${id}`, { method: 'DELETE' });
};

export const renewPermit = async (
  permitId: string,
  data: {
    renewalApplicationDate: string;
    renewalDate?: string;
  }
): Promise<EnvironmentalPermit> => {
  return apiFetch<EnvironmentalPermit>(`/environmental/permits/${permitId}/renew`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ============================================================================
// Analytics
// ============================================================================

export const getEnvironmentalRegister = async (
  projectId: string
): Promise<EnvironmentalRegister> => {
  return apiFetch<EnvironmentalRegister>(`/environmental/register/${projectId}`);
};

export const getEnvironmentalSummary = async (
  projectId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<EnvironmentalSummary> => {
  const queryParams = new URLSearchParams();
  if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
  if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);
  
  return apiFetch<EnvironmentalSummary>(
    `/environmental/summary/${projectId}?${queryParams}`
  );
};

export const getEnvironmentalAnalytics = async (
  projectId: string,
  period: string = 'month'
): Promise<EnvironmentalAnalytics> => {
  return apiFetch<EnvironmentalAnalytics>(
    `/environmental/analytics/${projectId}?period=${period}`
  );
};

// ============================================================================
// Exports
// ============================================================================

export const exportEnvironmentalRegister = async (
  projectId: string,
  options?: Partial<EnvironmentalExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/environmental/export/register', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportMonitoring = async (
  projectId: string,
  options?: Partial<EnvironmentalExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/environmental/export/monitoring', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportWaste = async (
  projectId: string,
  options?: Partial<EnvironmentalExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/environmental/export/waste', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportEmissions = async (
  projectId: string,
  options?: Partial<EnvironmentalExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/environmental/export/emissions', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};
