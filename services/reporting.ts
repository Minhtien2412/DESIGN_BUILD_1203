/**
 * Reporting & Analytics Service
 * API integration for reports, dashboards, and analytics
 */

import type {
    AnalyticsResult,
    CreateDashboardParams,
    CreateReportParams,
    CreateScheduleParams,
    Dashboard,
    ExportConfig,
    GetDashboardsParams,
    GetReportsParams,
    KPI,
    Report,
    ReportFormat,
    ReportSchedule,
    ReportTemplate,
    RunAnalyticsParams,
    UpdateDashboardParams,
    UpdateReportParams,
    UpdateScheduleParams,
} from '@/types/reporting';
import { apiFetch } from './api';

// Report Templates
export async function getReportTemplates(projectId?: string): Promise<ReportTemplate[]> {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  return apiFetch(`/report-templates?${queryParams.toString()}`);
}

export async function getReportTemplate(id: string): Promise<ReportTemplate> {
  return apiFetch(`/report-templates/${id}`);
}

export async function createReportTemplate(params: Partial<ReportTemplate>): Promise<ReportTemplate> {
  return apiFetch('/report-templates', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateReportTemplate(id: string, params: Partial<ReportTemplate>): Promise<ReportTemplate> {
  return apiFetch(`/report-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

export async function deleteReportTemplate(id: string): Promise<void> {
  return apiFetch(`/report-templates/${id}`, {
    method: 'DELETE',
  });
}

// Reports
export async function getReports(params: GetReportsParams): Promise<Report[]> {
  const queryParams = new URLSearchParams();
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.templateId) queryParams.append('templateId', params.templateId);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.generatedBy) queryParams.append('generatedBy', params.generatedBy);

  return apiFetch(`/reports?${queryParams.toString()}`);
}

export async function getReport(id: string): Promise<Report> {
  return apiFetch(`/reports/${id}`);
}

export async function createReport(params: CreateReportParams): Promise<Report> {
  return apiFetch('/reports', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateReport(params: UpdateReportParams): Promise<Report> {
  const { id, ...data } = params;
  return apiFetch(`/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReport(id: string): Promise<void> {
  return apiFetch(`/reports/${id}`, {
    method: 'DELETE',
  });
}

export async function generateReport(id: string): Promise<Report> {
  return apiFetch(`/reports/${id}/generate`, {
    method: 'POST',
  });
}

export async function regenerateReport(id: string): Promise<Report> {
  return apiFetch(`/reports/${id}/regenerate`, {
    method: 'POST',
  });
}

export async function deliverReport(id: string): Promise<Report> {
  return apiFetch(`/reports/${id}/deliver`, {
    method: 'POST',
  });
}

export async function downloadReport(id: string, format: ReportFormat): Promise<Blob> {
  return apiFetch(`/reports/${id}/download?format=${format}`, {
    responseType: 'blob',
  });
}

export async function exportReport(id: string, config: ExportConfig): Promise<Blob> {
  return apiFetch(`/reports/${id}/export`, {
    method: 'POST',
    body: JSON.stringify(config),
    responseType: 'blob',
  });
}

// Report Schedules
export async function getReportSchedules(projectId?: string): Promise<ReportSchedule[]> {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  return apiFetch(`/report-schedules?${queryParams.toString()}`);
}

export async function getReportSchedule(id: string): Promise<ReportSchedule> {
  return apiFetch(`/report-schedules/${id}`);
}

export async function createReportSchedule(params: CreateScheduleParams): Promise<ReportSchedule> {
  return apiFetch('/report-schedules', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateReportSchedule(params: UpdateScheduleParams): Promise<ReportSchedule> {
  const { id, ...data } = params;
  return apiFetch(`/report-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReportSchedule(id: string): Promise<void> {
  return apiFetch(`/report-schedules/${id}`, {
    method: 'DELETE',
  });
}

export async function runScheduleNow(id: string): Promise<Report> {
  return apiFetch(`/report-schedules/${id}/run`, {
    method: 'POST',
  });
}

// Dashboards
export async function getDashboards(params: GetDashboardsParams): Promise<Dashboard[]> {
  const queryParams = new URLSearchParams();
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());
  if (params.createdBy) queryParams.append('createdBy', params.createdBy);

  return apiFetch(`/dashboards?${queryParams.toString()}`);
}

export async function getDashboard(id: string): Promise<Dashboard> {
  return apiFetch(`/dashboards/${id}`);
}

export async function createDashboard(params: CreateDashboardParams): Promise<Dashboard> {
  return apiFetch('/dashboards', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateDashboard(params: UpdateDashboardParams): Promise<Dashboard> {
  const { id, ...data } = params;
  return apiFetch(`/dashboards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDashboard(id: string): Promise<void> {
  return apiFetch(`/dashboards/${id}`, {
    method: 'DELETE',
  });
}

export async function cloneDashboard(id: string, name: string): Promise<Dashboard> {
  return apiFetch(`/dashboards/${id}/clone`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function shareDashboard(id: string, userIds: string[]): Promise<Dashboard> {
  return apiFetch(`/dashboards/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
}

// Analytics
export async function runAnalytics(params: RunAnalyticsParams): Promise<AnalyticsResult> {
  return apiFetch('/analytics/query', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getProjectAnalytics(projectId: string, period: string): Promise<any> {
  return apiFetch(`/analytics/projects/${projectId}?period=${period}`);
}

export async function getFinancialAnalytics(projectId: string, fromDate: string, toDate: string): Promise<any> {
  return apiFetch(`/analytics/financial/${projectId}?fromDate=${fromDate}&toDate=${toDate}`);
}

export async function getScheduleAnalytics(projectId: string): Promise<any> {
  return apiFetch(`/analytics/schedule/${projectId}`);
}

export async function getResourceAnalytics(projectId: string, period: string): Promise<any> {
  return apiFetch(`/analytics/resources/${projectId}?period=${period}`);
}

export async function getQualityAnalytics(projectId: string, fromDate: string, toDate: string): Promise<any> {
  return apiFetch(`/analytics/quality/${projectId}?fromDate=${fromDate}&toDate=${toDate}`);
}

export async function getSafetyAnalytics(projectId: string, period: string): Promise<any> {
  return apiFetch(`/analytics/safety/${projectId}?period=${period}`);
}

export async function getRiskAnalytics(projectId: string): Promise<any> {
  return apiFetch(`/analytics/risks/${projectId}`);
}

// KPIs
export async function getKPIs(projectId?: string): Promise<KPI[]> {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  return apiFetch(`/kpis?${queryParams.toString()}`);
}

export async function getKPI(id: string): Promise<KPI> {
  return apiFetch(`/kpis/${id}`);
}

export async function createKPI(params: Partial<KPI>): Promise<KPI> {
  return apiFetch('/kpis', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateKPI(id: string, params: Partial<KPI>): Promise<KPI> {
  return apiFetch(`/kpis/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

export async function deleteKPI(id: string): Promise<void> {
  return apiFetch(`/kpis/${id}`, {
    method: 'DELETE',
  });
}

export async function refreshKPI(id: string): Promise<KPI> {
  return apiFetch(`/kpis/${id}/refresh`, {
    method: 'POST',
  });
}

// Data Export
export async function exportProjectData(projectId: string, format: ReportFormat): Promise<Blob> {
  return apiFetch(`/analytics/export/${projectId}?format=${format}`, {
    responseType: 'blob',
  });
}

export async function exportDashboardData(dashboardId: string, format: ReportFormat): Promise<Blob> {
  return apiFetch(`/dashboards/${dashboardId}/export?format=${format}`, {
    responseType: 'blob',
  });
}

// Trending & Insights
export async function getTrendingMetrics(projectId: string): Promise<any> {
  return apiFetch(`/analytics/trending/${projectId}`);
}

export async function getInsights(projectId: string): Promise<any> {
  return apiFetch(`/analytics/insights/${projectId}`);
}

export async function getAnomalies(projectId: string, metricType: string): Promise<any> {
  return apiFetch(`/analytics/anomalies/${projectId}?metricType=${metricType}`);
}

export async function getForecast(projectId: string, metric: string, days: number): Promise<any> {
  return apiFetch(`/analytics/forecast/${projectId}?metric=${metric}&days=${days}`);
}

// Comparison
export async function compareProjects(projectIds: string[], metric: string): Promise<any> {
  return apiFetch('/analytics/compare/projects', {
    method: 'POST',
    body: JSON.stringify({ projectIds, metric }),
  });
}

export async function comparePeriods(projectId: string, period1: any, period2: any): Promise<any> {
  return apiFetch('/analytics/compare/periods', {
    method: 'POST',
    body: JSON.stringify({ projectId, period1, period2 }),
  });
}
