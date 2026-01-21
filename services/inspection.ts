/**
 * Inspection & Testing API Service
 */

import type {
    CreateInspectionParams,
    CreateNCRParams,
    CreateTestParams,
    GetInspectionsParams,
    GetNCRsParams,
    GetTestsParams,
    Inspection,
    InspectionAnalytics,
    InspectionChecklist,
    NonConformanceReport,
    SubmitInspectionResultParams,
    SubmitTestResultParams,
    Test,
    UpdateInspectionParams,
} from '@/types/inspection';
import { apiFetch } from './api';

const BASE_URL = '/inspection';

// Inspections
export const getInspections = async (params?: GetInspectionsParams): Promise<Inspection[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`${BASE_URL}/inspections?${queryParams.toString()}`);
};

export const getInspection = async (id: string): Promise<Inspection> => {
  return apiFetch(`${BASE_URL}/inspections/${id}`);
};

export const createInspection = async (params: CreateInspectionParams): Promise<Inspection> => {
  return apiFetch(`${BASE_URL}/inspections`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateInspection = async (params: UpdateInspectionParams): Promise<Inspection> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/inspections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteInspection = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/inspections/${id}`, {
    method: 'DELETE',
  });
};

export const startInspection = async (id: string): Promise<Inspection> => {
  return apiFetch(`${BASE_URL}/inspections/${id}/start`, {
    method: 'POST',
  });
};

export const submitInspectionResult = async (params: SubmitInspectionResultParams): Promise<Inspection> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/inspections/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveInspection = async (id: string): Promise<Inspection> => {
  return apiFetch(`${BASE_URL}/inspections/${id}/approve`, {
    method: 'POST',
  });
};

export const rescheduleInspection = async (id: string, newDate: string, reason: string): Promise<Inspection> => {
  return apiFetch(`${BASE_URL}/inspections/${id}/reschedule`, {
    method: 'POST',
    body: JSON.stringify({ newDate, reason }),
  });
};

export const cancelInspection = async (id: string, reason: string): Promise<Inspection> => {
  return apiFetch(`${BASE_URL}/inspections/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const exportInspectionReport = async (id: string): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/inspections/${id}/report`, {
    headers: {
      Accept: 'application/pdf',
    },
  });
};

// Inspection Checklists
export const getInspectionChecklists = async (type?: string): Promise<InspectionChecklist[]> => {
  const queryParams = type ? `?type=${type}` : '';
  return apiFetch(`${BASE_URL}/checklists${queryParams}`);
};

export const getInspectionChecklist = async (id: string): Promise<InspectionChecklist> => {
  return apiFetch(`${BASE_URL}/checklists/${id}`);
};

export const createInspectionChecklist = async (data: Omit<InspectionChecklist, 'id' | 'createdAt' | 'totalItems'>): Promise<InspectionChecklist> => {
  return apiFetch(`${BASE_URL}/checklists`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Tests
export const getTests = async (params?: GetTestsParams): Promise<Test[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`${BASE_URL}/tests?${queryParams.toString()}`);
};

export const getTest = async (id: string): Promise<Test> => {
  return apiFetch(`${BASE_URL}/tests/${id}`);
};

export const createTest = async (params: CreateTestParams): Promise<Test> => {
  return apiFetch(`${BASE_URL}/tests`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateTest = async (id: string, data: Partial<CreateTestParams>): Promise<Test> => {
  return apiFetch(`${BASE_URL}/tests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteTest = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/tests/${id}`, {
    method: 'DELETE',
  });
};

export const startTest = async (id: string): Promise<Test> => {
  return apiFetch(`${BASE_URL}/tests/${id}/start`, {
    method: 'POST',
  });
};

export const submitTestResult = async (params: SubmitTestResultParams): Promise<Test> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/tests/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveTest = async (id: string): Promise<Test> => {
  return apiFetch(`${BASE_URL}/tests/${id}/approve`, {
    method: 'POST',
  });
};

export const requestRetest = async (id: string, reason: string, parameters?: string[]): Promise<Test> => {
  return apiFetch(`${BASE_URL}/tests/${id}/retest`, {
    method: 'POST',
    body: JSON.stringify({ reason, parameters }),
  });
};

export const exportTestCertificate = async (id: string): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/tests/${id}/certificate`, {
    headers: {
      Accept: 'application/pdf',
    },
  });
};

// Non-Conformance Reports (NCRs)
export const getNCRs = async (params?: GetNCRsParams): Promise<NonConformanceReport[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`${BASE_URL}/ncr?${queryParams.toString()}`);
};

export const getNCR = async (id: string): Promise<NonConformanceReport> => {
  return apiFetch(`${BASE_URL}/ncr/${id}`);
};

export const createNCR = async (params: CreateNCRParams): Promise<NonConformanceReport> => {
  return apiFetch(`${BASE_URL}/ncr`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateNCR = async (id: string, data: Partial<CreateNCRParams>): Promise<NonConformanceReport> => {
  return apiFetch(`${BASE_URL}/ncr/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteNCR = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/ncr/${id}`, {
    method: 'DELETE',
  });
};

export const resolveNCR = async (
  id: string,
  data: {
    implementedDate: string;
    implementedBy: string;
    comments?: string;
  }
): Promise<NonConformanceReport> => {
  return apiFetch(`${BASE_URL}/ncr/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const verifyNCR = async (
  id: string,
  data: {
    effectiveness: 'EFFECTIVE' | 'INEFFECTIVE';
    comments?: string;
  }
): Promise<NonConformanceReport> => {
  return apiFetch(`${BASE_URL}/ncr/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const closeNCR = async (id: string, comments?: string): Promise<NonConformanceReport> => {
  return apiFetch(`${BASE_URL}/ncr/${id}/close`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectNCR = async (id: string, reason: string): Promise<NonConformanceReport> => {
  return apiFetch(`${BASE_URL}/ncr/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Analytics & Reports
export const getInspectionAnalytics = async (
  projectId?: string,
  fromDate?: string,
  toDate?: string
): Promise<InspectionAnalytics> => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);

  return apiFetch(`${BASE_URL}/analytics?${queryParams.toString()}`);
};

export const getComplianceReport = async (projectId: string): Promise<{
  overallCompliance: number;
  byCategory: {
    category: string;
    compliance: number;
    passed: number;
    total: number;
  }[];
  byStandard: {
    standard: string;
    compliance: number;
    violations: number;
  }[];
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  openNCRs: number;
  overdueNCRs: number;
}> => {
  return apiFetch(`${BASE_URL}/projects/${projectId}/compliance`);
};

export const getInspectionSchedule = async (
  projectId: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  date: string;
  inspections: Inspection[];
  tests: Test[];
}[]> => {
  const queryParams = new URLSearchParams();
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);

  return apiFetch(`${BASE_URL}/projects/${projectId}/schedule?${queryParams.toString()}`);
};

export const exportInspectionRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' | 'CSV'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/projects/${projectId}/register/export?format=${format}`, {
    headers: {
      Accept: format === 'PDF' ? 'application/pdf' : 'application/octet-stream',
    },
  });
};

// File Upload
export const uploadInspectionPhoto = async (
  file: File,
  inspectionId?: string,
  testId?: string,
  caption?: string
): Promise<{ url: string; thumbnailUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (inspectionId) formData.append('inspectionId', inspectionId);
  if (testId) formData.append('testId', testId);
  if (caption) formData.append('caption', caption);

  return apiFetch(`${BASE_URL}/photos/upload`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};

export const uploadTestCertificate = async (
  file: File,
  testId: string
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('testId', testId);

  return apiFetch(`${BASE_URL}/tests/certificate/upload`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};
