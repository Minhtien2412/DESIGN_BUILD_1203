/**
 * Quality Assurance & Testing Service
 * API integration for QA/QC management
 */

import type {
    DefectSeverity,
    DefectStatus,
    InspectionStatus,
    InspectionType,
    NCRStatus,
    NonConformanceReport,
    QAAnalytics,
    QAExportOptions,
    QARegister,
    QASummary,
    QualityDefect,
    QualityInspection,
    QualityTest,
    TestCategory,
    TestStatus,
} from '@/types/quality-assurance';
import { apiFetch } from './api';

// ============================================================================
// Quality Tests
// ============================================================================

export interface GetQualityTestsParams {
  projectId?: string;
  category?: TestCategory;
  status?: TestStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getQualityTests = async (
  params?: GetQualityTestsParams
): Promise<QualityTest[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<QualityTest[]>(`/quality/tests?${queryParams}`);
};

export const getQualityTest = async (id: string): Promise<QualityTest> => {
  return apiFetch<QualityTest>(`/quality/tests/${id}`);
};

export const createQualityTest = async (
  data: Partial<QualityTest>
): Promise<QualityTest> => {
  return apiFetch<QualityTest>('/quality/tests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateQualityTest = async (
  id: string,
  data: Partial<QualityTest>
): Promise<QualityTest> => {
  return apiFetch<QualityTest>(`/quality/tests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteQualityTest = async (id: string): Promise<void> => {
  return apiFetch<void>(`/quality/tests/${id}`, { method: 'DELETE' });
};

// Test Workflow
export const startTest = async (
  testId: string,
  data: {
    actualStartDate: string;
    testPerformedBy: {
      id: string;
      name: string;
      company?: string;
      certification?: string;
    };
  }
): Promise<QualityTest> => {
  return apiFetch<QualityTest>(`/quality/tests/${testId}/start`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const completeTest = async (
  testId: string,
  data: {
    result: 'PASS' | 'FAIL' | 'CONDITIONAL';
    actualResults: string;
    actualEndDate?: string;
    measurements?: any[];
  }
): Promise<QualityTest> => {
  return apiFetch<QualityTest>(`/quality/tests/${testId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveTest = async (
  testId: string,
  data: {
    approvedBy: { id: string; name: string; signature?: string };
    comments?: string;
  }
): Promise<QualityTest> => {
  return apiFetch<QualityTest>(`/quality/tests/${testId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ============================================================================
// Quality Inspections
// ============================================================================

export interface GetQualityInspectionsParams {
  projectId?: string;
  inspectionType?: InspectionType;
  status?: InspectionStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getQualityInspections = async (
  params?: GetQualityInspectionsParams
): Promise<QualityInspection[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.inspectionType) queryParams.append('inspectionType', params.inspectionType);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<QualityInspection[]>(`/quality/inspections?${queryParams}`);
};

export const getQualityInspection = async (id: string): Promise<QualityInspection> => {
  return apiFetch<QualityInspection>(`/quality/inspections/${id}`);
};

export const createQualityInspection = async (
  data: Partial<QualityInspection>
): Promise<QualityInspection> => {
  return apiFetch<QualityInspection>('/quality/inspections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateQualityInspection = async (
  id: string,
  data: Partial<QualityInspection>
): Promise<QualityInspection> => {
  return apiFetch<QualityInspection>(`/quality/inspections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteQualityInspection = async (id: string): Promise<void> => {
  return apiFetch<void>(`/quality/inspections/${id}`, { method: 'DELETE' });
};

// Inspection Workflow
export const startInspection = async (
  inspectionId: string,
  data: {
    actualDate: string;
    attendees?: any[];
  }
): Promise<QualityInspection> => {
  return apiFetch<QualityInspection>(`/quality/inspections/${inspectionId}/start`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const completeInspection = async (
  inspectionId: string,
  data: {
    overallResult: 'PASS' | 'FAIL' | 'CONDITIONAL';
    findings?: any[];
    inspectorSignature?: any;
  }
): Promise<QualityInspection> => {
  return apiFetch<QualityInspection>(`/quality/inspections/${inspectionId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const uploadInspectionPhoto = async (
  inspectionId: string,
  file: File,
  metadata?: {
    caption?: string;
    location?: string;
    checklistItemId?: string;
  }
): Promise<{ photoUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }
  
  return apiFetch<{ photoUrl: string }>(
    `/quality/inspections/${inspectionId}/photos`,
    { method: 'POST', body: formData }
  );
};

// ============================================================================
// Quality Defects
// ============================================================================

export interface GetQualityDefectsParams {
  projectId?: string;
  severity?: DefectSeverity;
  status?: DefectStatus;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getQualityDefects = async (
  params?: GetQualityDefectsParams
): Promise<QualityDefect[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<QualityDefect[]>(`/quality/defects?${queryParams}`);
};

export const getQualityDefect = async (id: string): Promise<QualityDefect> => {
  return apiFetch<QualityDefect>(`/quality/defects/${id}`);
};

export const createQualityDefect = async (
  data: Partial<QualityDefect>
): Promise<QualityDefect> => {
  return apiFetch<QualityDefect>('/quality/defects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateQualityDefect = async (
  id: string,
  data: Partial<QualityDefect>
): Promise<QualityDefect> => {
  return apiFetch<QualityDefect>(`/quality/defects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteQualityDefect = async (id: string): Promise<void> => {
  return apiFetch<void>(`/quality/defects/${id}`, { method: 'DELETE' });
};

// Defect Workflow
export const assignDefect = async (
  defectId: string,
  data: {
    assignedTo: { id: string; name: string; company?: string };
    targetDate?: string;
    comments?: string;
  }
): Promise<QualityDefect> => {
  return apiFetch<QualityDefect>(`/quality/defects/${defectId}/assign`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const resolveDefect = async (
  defectId: string,
  data: {
    correctiveAction: string;
    resolvedBy: { id: string; name: string };
    resolvedDate?: string;
  }
): Promise<QualityDefect> => {
  return apiFetch<QualityDefect>(`/quality/defects/${defectId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const verifyDefect = async (
  defectId: string,
  data: {
    verifiedBy: { id: string; name: string };
    verificationMethod?: string;
    comments?: string;
  }
): Promise<QualityDefect> => {
  return apiFetch<QualityDefect>(`/quality/defects/${defectId}/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const closeDefect = async (
  defectId: string,
  comments?: string
): Promise<QualityDefect> => {
  return apiFetch<QualityDefect>(`/quality/defects/${defectId}/close`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

// ============================================================================
// Non-Conformance Reports
// ============================================================================

export interface GetNCRsParams {
  projectId?: string;
  category?: string;
  status?: NCRStatus;
  severity?: DefectSeverity;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getNonConformanceReports = async (
  params?: GetNCRsParams
): Promise<NonConformanceReport[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch<NonConformanceReport[]>(`/quality/ncrs?${queryParams}`);
};

export const getNonConformanceReport = async (
  id: string
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${id}`);
};

export const createNonConformanceReport = async (
  data: Partial<NonConformanceReport>
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>('/quality/ncrs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateNonConformanceReport = async (
  id: string,
  data: Partial<NonConformanceReport>
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteNonConformanceReport = async (id: string): Promise<void> => {
  return apiFetch<void>(`/quality/ncrs/${id}`, { method: 'DELETE' });
};

// NCR Workflow
export const submitNCR = async (
  ncrId: string,
  data?: { comments?: string }
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${ncrId}/submit`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
};

export const reviewNCR = async (
  ncrId: string,
  data: {
    reviewedBy: { id: string; name: string; role?: string };
    comments?: string;
  }
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${ncrId}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveNCR = async (
  ncrId: string,
  data: {
    approvedBy: { id: string; name: string; role?: string };
    disposition?: string;
    comments?: string;
  }
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${ncrId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const implementCorrectiveAction = async (
  ncrId: string,
  data: {
    correctiveAction: string;
    correctiveActionBy: { id: string; name: string; company?: string };
    correctiveActionDate?: string;
  }
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${ncrId}/corrective-action`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const verifyNCR = async (
  ncrId: string,
  data: {
    verifiedBy: { id: string; name: string };
    verificationComments?: string;
  }
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${ncrId}/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const closeNCR = async (
  ncrId: string,
  data: {
    closedBy: { id: string; name: string };
    closureComments?: string;
  }
): Promise<NonConformanceReport> => {
  return apiFetch<NonConformanceReport>(`/quality/ncrs/${ncrId}/close`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ============================================================================
// Analytics
// ============================================================================

export const getQARegister = async (projectId: string): Promise<QARegister> => {
  return apiFetch<QARegister>(`/quality/register/${projectId}`);
};

export const getQASummary = async (
  projectId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<QASummary> => {
  const queryParams = new URLSearchParams();
  if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
  if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);
  
  return apiFetch<QASummary>(`/quality/summary/${projectId}?${queryParams}`);
};

export const getQAAnalytics = async (
  projectId: string,
  period: string = 'month'
): Promise<QAAnalytics> => {
  return apiFetch<QAAnalytics>(`/quality/analytics/${projectId}?period=${period}`);
};

// ============================================================================
// Exports
// ============================================================================

export const exportQARegister = async (
  projectId: string,
  options?: Partial<QAExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/quality/export/register', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportTests = async (
  projectId: string,
  options?: Partial<QAExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/quality/export/tests', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportInspections = async (
  projectId: string,
  options?: Partial<QAExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/quality/export/inspections', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportDefects = async (
  projectId: string,
  options?: Partial<QAExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/quality/export/defects', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportNCRs = async (
  projectId: string,
  options?: Partial<QAExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/quality/export/ncrs', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};
