/**
 * Daily Report Service
 * API integration for construction daily reports
 */

import type {
    DailyReport,
    DailyReportAnalytics,
    DailyReportExportOptions,
    DailyReportStatus,
    DailyReportSummary,
    DailyReportTemplate,
    WeatherCondition
} from '@/types/daily-report';
import { apiFetch } from './api';

// Daily Reports
export const getDailyReports = async (params?: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status?: DailyReportStatus;
  submittedById?: string;
  weatherCondition?: WeatherCondition;
  search?: string;
}): Promise<DailyReport[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.submittedById) queryParams.append('submittedById', params.submittedById);
  if (params?.weatherCondition) queryParams.append('weatherCondition', params.weatherCondition);
  if (params?.search) queryParams.append('search', params.search);

  return apiFetch<DailyReport[]>(`/daily-reports?${queryParams.toString()}`);
};

export const getDailyReport = async (id: string): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${id}`);
};

export const createDailyReport = async (
  data: Partial<DailyReport>
): Promise<DailyReport> => {
  return apiFetch<DailyReport>('/daily-reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateDailyReport = async (
  id: string,
  data: Partial<DailyReport>
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteDailyReport = async (id: string): Promise<void> => {
  return apiFetch<void>(`/daily-reports/${id}`, {
    method: 'DELETE',
  });
};

// Submit for review
export const submitDailyReport = async (
  id: string,
  notes?: string
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
};

// Review & approve
export const reviewDailyReport = async (
  id: string,
  data: {
    approved: boolean;
    comments?: string;
    requestRevision?: boolean;
    revisionNotes?: string;
  }
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveDailyReport = async (
  id: string,
  comments?: string
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectDailyReport = async (
  id: string,
  reason: string
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Work activities
export const addWorkActivity = async (
  reportId: string,
  activity: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/work-activities`, {
    method: 'POST',
    body: JSON.stringify(activity),
  });
};

export const updateWorkActivity = async (
  reportId: string,
  activityId: string,
  data: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/work-activities/${activityId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWorkActivity = async (
  reportId: string,
  activityId: string
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/work-activities/${activityId}`, {
    method: 'DELETE',
  });
};

// Manpower
export const addManpowerRecord = async (
  reportId: string,
  manpower: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/manpower`, {
    method: 'POST',
    body: JSON.stringify(manpower),
  });
};

export const updateManpowerRecord = async (
  reportId: string,
  manpowerId: string,
  data: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/manpower/${manpowerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Equipment
export const addEquipmentRecord = async (
  reportId: string,
  equipment: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/equipment`, {
    method: 'POST',
    body: JSON.stringify(equipment),
  });
};

// Materials
export const addMaterialDelivery = async (
  reportId: string,
  material: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/materials`, {
    method: 'POST',
    body: JSON.stringify(material),
  });
};

// Progress
export const addProgressUpdate = async (
  reportId: string,
  progress: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/progress`, {
    method: 'POST',
    body: JSON.stringify(progress),
  });
};

// Safety
export const addSafetyIncident = async (
  reportId: string,
  incident: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/safety/incidents`, {
    method: 'POST',
    body: JSON.stringify(incident),
  });
};

export const addNearMiss = async (
  reportId: string,
  nearMiss: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/safety/near-misses`, {
    method: 'POST',
    body: JSON.stringify(nearMiss),
  });
};

export const updateSafetyReport = async (
  reportId: string,
  safetyData: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/safety`, {
    method: 'PUT',
    body: JSON.stringify(safetyData),
  });
};

// Issues & Delays
export const addIssue = async (
  reportId: string,
  issue: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/issues`, {
    method: 'POST',
    body: JSON.stringify(issue),
  });
};

export const addDelay = async (
  reportId: string,
  delay: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/delays`, {
    method: 'POST',
    body: JSON.stringify(delay),
  });
};

// Visitors
export const addVisitor = async (
  reportId: string,
  visitor: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/visitors`, {
    method: 'POST',
    body: JSON.stringify(visitor),
  });
};

// Inspections
export const addInspection = async (
  reportId: string,
  inspection: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/inspections`, {
    method: 'POST',
    body: JSON.stringify(inspection),
  });
};

// Quality observations
export const addQualityObservation = async (
  reportId: string,
  observation: any
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-reports/${reportId}/quality-observations`, {
    method: 'POST',
    body: JSON.stringify(observation),
  });
};

// Photos
export const uploadReportPhoto = async (
  reportId: string,
  photo: FormData
): Promise<{ url: string; thumbnailUrl?: string; photoId: string }> => {
  return apiFetch<{ url: string; thumbnailUrl?: string; photoId: string }>(
    `/daily-reports/${reportId}/photos`,
    {
      method: 'POST',
      body: photo,
      headers: {}, // Let browser set multipart/form-data boundary
    }
  );
};

export const deleteReportPhoto = async (
  reportId: string,
  photoId: string
): Promise<void> => {
  return apiFetch<void>(`/daily-reports/${reportId}/photos/${photoId}`, {
    method: 'DELETE',
  });
};

// Attachments
export const uploadReportAttachment = async (
  reportId: string,
  attachment: FormData
): Promise<{ url: string; attachmentId: string }> => {
  return apiFetch<{ url: string; attachmentId: string }>(
    `/daily-reports/${reportId}/attachments`,
    {
      method: 'POST',
      body: attachment,
      headers: {},
    }
  );
};

export const deleteReportAttachment = async (
  reportId: string,
  attachmentId: string
): Promise<void> => {
  return apiFetch<void>(`/daily-reports/${reportId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
};

// Templates
export const getDailyReportTemplates = async (
  projectId?: string
): Promise<DailyReportTemplate[]> => {
  const params = projectId ? `?projectId=${projectId}` : '';
  return apiFetch<DailyReportTemplate[]>(`/daily-report-templates${params}`);
};

export const getDailyReportTemplate = async (
  id: string
): Promise<DailyReportTemplate> => {
  return apiFetch<DailyReportTemplate>(`/daily-report-templates/${id}`);
};

export const createFromTemplate = async (
  templateId: string,
  data: {
    reportDate: string;
    projectId: string;
  }
): Promise<DailyReport> => {
  return apiFetch<DailyReport>(`/daily-report-templates/${templateId}/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Summary & Analytics
export const getDailyReportSummary = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<DailyReportSummary> => {
  const params = new URLSearchParams({ projectId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  return apiFetch<DailyReportSummary>(`/daily-reports/summary?${params.toString()}`);
};

export const getDailyReportAnalytics = async (
  projectId: string,
  period: string
): Promise<DailyReportAnalytics> => {
  return apiFetch<DailyReportAnalytics>(
    `/daily-reports/analytics?projectId=${projectId}&period=${period}`
  );
};

// Get reports by date
export const getDailyReportByDate = async (
  projectId: string,
  date: string
): Promise<DailyReport | null> => {
  try {
    return await apiFetch<DailyReport>(
      `/daily-reports/by-date?projectId=${projectId}&date=${date}`
    );
  } catch (error) {
    return null; // No report for this date
  }
};

// Copy from previous report
export const copyFromPreviousReport = async (
  projectId: string,
  date: string,
  sections: string[]
): Promise<Partial<DailyReport>> => {
  return apiFetch<Partial<DailyReport>>('/daily-reports/copy-previous', {
    method: 'POST',
    body: JSON.stringify({ projectId, date, sections }),
  });
};

// Reports
export const exportDailyReport = async (
  id: string,
  options: DailyReportExportOptions
): Promise<Blob> => {
  return apiFetch<Blob>(`/daily-reports/${id}/export`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

export const exportDailyReportRegister = async (
  projectId: string,
  startDate: string,
  endDate: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch<Blob>(
    `/daily-reports/export-register?projectId=${projectId}&startDate=${startDate}&endDate=${endDate}&format=${format}`
  );
};

export const exportWeeklyReport = async (
  projectId: string,
  weekStart: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch<Blob>(
    `/daily-reports/export-weekly?projectId=${projectId}&weekStart=${weekStart}&format=${format}`
  );
};

export const exportMonthlyReport = async (
  projectId: string,
  month: string,
  year: number,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch<Blob>(
    `/daily-reports/export-monthly?projectId=${projectId}&month=${month}&year=${year}&format=${format}`
  );
};
