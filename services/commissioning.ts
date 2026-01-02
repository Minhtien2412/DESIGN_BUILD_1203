/**
 * Commissioning Service
 * API integration for construction commissioning management
 */

import type {
    CommissioningAnalytics,
    CommissioningDeficiency,
    CommissioningExportOptions,
    CommissioningPlan,
    CommissioningReport,
    CommissioningStatus,
    CommissioningSummary,
    CommissioningSystem,
    CommissioningTest,
    DeficiencyStatus,
    SystemCategory,
    TestStatus,
} from '@/types/commissioning';
import { apiFetch } from './api';

// Commissioning Plans
export const getCommissioningPlans = async (params?: {
  projectId?: string;
  status?: string;
  search?: string;
}): Promise<CommissioningPlan[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch(`/commissioning-plans?${queryParams.toString()}`);
};

export const getCommissioningPlan = async (id: string): Promise<CommissioningPlan> => {
  return apiFetch(`/commissioning-plans/${id}`);
};

export const createCommissioningPlan = async (data: Partial<CommissioningPlan>): Promise<CommissioningPlan> => {
  return apiFetch('/commissioning-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCommissioningPlan = async (id: string, data: Partial<CommissioningPlan>): Promise<CommissioningPlan> => {
  return apiFetch(`/commissioning-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCommissioningPlan = async (id: string): Promise<void> => {
  return apiFetch(`/commissioning-plans/${id}`, {
    method: 'DELETE',
  });
};

// Commissioning Systems
export const getCommissioningSystems = async (planId: string, params?: {
  category?: SystemCategory;
  status?: CommissioningStatus;
  search?: string;
}): Promise<CommissioningSystem[]> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch(`/commissioning-plans/${planId}/systems?${queryParams.toString()}`);
};

export const getCommissioningSystem = async (planId: string, systemId: string): Promise<CommissioningSystem> => {
  return apiFetch(`/commissioning-plans/${planId}/systems/${systemId}`);
};

export const addCommissioningSystem = async (planId: string, data: Partial<CommissioningSystem>): Promise<CommissioningPlan> => {
  return apiFetch(`/commissioning-plans/${planId}/systems`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCommissioningSystem = async (planId: string, systemId: string, data: Partial<CommissioningSystem>): Promise<CommissioningPlan> => {
  return apiFetch(`/commissioning-plans/${planId}/systems/${systemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCommissioningSystem = async (planId: string, systemId: string): Promise<CommissioningPlan> => {
  return apiFetch(`/commissioning-plans/${planId}/systems/${systemId}`, {
    method: 'DELETE',
  });
};

// Commissioning Tests
export const getCommissioningTests = async (systemId: string, params?: {
  testType?: string;
  status?: TestStatus;
}): Promise<CommissioningTest[]> => {
  const queryParams = new URLSearchParams();
  if (params?.testType) queryParams.append('testType', params.testType);
  if (params?.status) queryParams.append('status', params.status);
  
  return apiFetch(`/commissioning-systems/${systemId}/tests?${queryParams.toString()}`);
};

export const getCommissioningTest = async (systemId: string, testId: string): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}`);
};

export const createCommissioningTest = async (systemId: string, data: Partial<CommissioningTest>): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCommissioningTest = async (systemId: string, testId: string, data: Partial<CommissioningTest>): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCommissioningTest = async (systemId: string, testId: string): Promise<void> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}`, {
    method: 'DELETE',
  });
};

// Test execution
export const startTest = async (systemId: string, testId: string): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/start`, {
    method: 'POST',
  });
};

export const completeTestStep = async (
  systemId: string,
  testId: string,
  stepId: string,
  data: {
    actualResult: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED';
    notes?: string;
  }
): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/steps/${stepId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const completeTest = async (
  systemId: string,
  testId: string,
  data: {
    testResults: string;
    passCriteria: boolean;
    deviations?: string[];
    observations?: string[];
    recommendations?: string[];
  }
): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const retestRequired = async (
  systemId: string,
  testId: string,
  reason: string
): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/retest`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Deficiencies
export const getCommissioningDeficiencies = async (params?: {
  projectId?: string;
  systemId?: string;
  testId?: string;
  status?: DeficiencyStatus;
  severity?: string;
}): Promise<CommissioningDeficiency[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.systemId) queryParams.append('systemId', params.systemId);
  if (params?.testId) queryParams.append('testId', params.testId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.severity) queryParams.append('severity', params.severity);
  
  return apiFetch(`/commissioning-deficiencies?${queryParams.toString()}`);
};

export const addCommissioningDeficiency = async (
  systemId: string,
  testId: string,
  data: Partial<CommissioningDeficiency>
): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/deficiencies`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCommissioningDeficiency = async (
  deficiencyId: string,
  data: Partial<CommissioningDeficiency>
): Promise<CommissioningDeficiency> => {
  return apiFetch(`/commissioning-deficiencies/${deficiencyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const resolveCommissioningDeficiency = async (
  deficiencyId: string,
  data: {
    resolution: string;
    correctiveAction: string;
    rootCause?: string;
  }
): Promise<CommissioningDeficiency> => {
  return apiFetch(`/commissioning-deficiencies/${deficiencyId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const verifyCommissioningDeficiency = async (
  deficiencyId: string,
  verificationNotes?: string
): Promise<CommissioningDeficiency> => {
  return apiFetch(`/commissioning-deficiencies/${deficiencyId}/verify`, {
    method: 'POST',
    body: JSON.stringify({ verificationNotes }),
  });
};

// Sign-offs
export const signOffTest = async (
  systemId: string,
  testId: string,
  signOffType: 'CONTRACTOR' | 'ENGINEER' | 'OWNER',
  data: {
    signedBy: string;
    signature?: string;
    comments?: string;
  }
): Promise<CommissioningTest> => {
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/sign-off/${signOffType.toLowerCase()}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Photos & attachments
export const uploadTestPhoto = async (
  systemId: string,
  testId: string,
  file: File,
  caption?: string
): Promise<{ url: string; thumbnailUrl: string; photoId: string }> => {
  const formData = new FormData();
  formData.append('photo', file);
  if (caption) formData.append('caption', caption);
  
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/photos`, {
    method: 'POST',
    body: formData,
  });
};

export const uploadTestAttachment = async (
  systemId: string,
  testId: string,
  file: File,
  category?: string
): Promise<{ url: string; attachmentId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  
  return apiFetch(`/commissioning-systems/${systemId}/tests/${testId}/attachments`, {
    method: 'POST',
    body: formData,
  });
};

// Reports
export const getCommissioningReports = async (planId: string, params?: {
  reportType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<CommissioningReport[]> => {
  const queryParams = new URLSearchParams();
  if (params?.reportType) queryParams.append('reportType', params.reportType);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  return apiFetch(`/commissioning-plans/${planId}/reports?${queryParams.toString()}`);
};

export const createCommissioningReport = async (
  planId: string,
  data: Partial<CommissioningReport>
): Promise<CommissioningReport> => {
  return apiFetch(`/commissioning-plans/${planId}/reports`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Summary & Analytics
export const getCommissioningSummary = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<CommissioningSummary> => {
  const queryParams = new URLSearchParams({ projectId });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  return apiFetch(`/commissioning/summary?${queryParams.toString()}`);
};

export const getCommissioningAnalytics = async (
  projectId: string,
  period: string
): Promise<CommissioningAnalytics> => {
  return apiFetch(`/commissioning/analytics?projectId=${projectId}&period=${period}`);
};

// Exports
export const exportCommissioningPlan = async (
  id: string,
  options: CommissioningExportOptions
): Promise<Blob> => {
  return apiFetch(`/commissioning-plans/${id}/export`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

export const exportCommissioningReport = async (
  reportId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch(`/commissioning-reports/${reportId}/export?format=${format}`);
};

export const exportSystemTests = async (
  systemId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch(`/commissioning-systems/${systemId}/export-tests?format=${format}`);
};
