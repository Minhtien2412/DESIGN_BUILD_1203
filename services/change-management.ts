/**
 * Change Management API Service
 */

import type {
    AssessChangeImpactParams,
    ChangeAnalytics,
    ChangeLog,
    ChangeOrder,
    ChangeRequest,
    CreateChangeOrderParams,
    CreateChangeRequestParams,
    GetChangeOrdersParams,
    GetChangeRequestsParams,
    UpdateChangeRequestParams,
} from '@/types/change-management';
import { apiFetch } from './api';

const BASE_URL = '/change-management';

// Change Requests
export const getChangeRequests = async (params?: GetChangeRequestsParams): Promise<ChangeRequest[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.origin) queryParams.append('origin', params.origin);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`${BASE_URL}/requests?${queryParams.toString()}`);
};

export const getChangeRequest = async (id: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}`);
};

export const createChangeRequest = async (params: CreateChangeRequestParams): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateChangeRequest = async (params: UpdateChangeRequestParams): Promise<ChangeRequest> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteChangeRequest = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/requests/${id}`, {
    method: 'DELETE',
  });
};

export const submitChangeRequest = async (id: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/submit`, {
    method: 'POST',
  });
};

export const assessChangeImpact = async (params: AssessChangeImpactParams): Promise<ChangeRequest> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/requests/${id}/assess`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveChangeRequest = async (id: string, comments?: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectChangeRequest = async (id: string, reason: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const holdChangeRequest = async (id: string, reason: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/hold`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const implementChangeRequest = async (id: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/implement`, {
    method: 'POST',
  });
};

export const cancelChangeRequest = async (id: string, reason: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const selectAlternative = async (requestId: string, alternativeId: string): Promise<ChangeRequest> => {
  return apiFetch(`${BASE_URL}/requests/${requestId}/select-alternative`, {
    method: 'POST',
    body: JSON.stringify({ alternativeId }),
  });
};

// Change Orders
export const getChangeOrders = async (params?: GetChangeOrdersParams): Promise<ChangeOrder[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`${BASE_URL}/orders?${queryParams.toString()}`);
};

export const getChangeOrder = async (id: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}`);
};

export const createChangeOrder = async (params: CreateChangeOrderParams): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateChangeOrder = async (
  id: string,
  data: Partial<Omit<CreateChangeOrderParams, 'changeRequestId'>>
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteChangeOrder = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/orders/${id}`, {
    method: 'DELETE',
  });
};

export const issueChangeOrder = async (id: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/issue`, {
    method: 'POST',
  });
};

export const acceptChangeOrder = async (id: string, comments?: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectChangeOrder = async (id: string, reason: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const startExecution = async (id: string, startDate: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/start`, {
    method: 'POST',
    body: JSON.stringify({ startDate }),
  });
};

export const updateExecutionProgress = async (id: string, progress: number): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/progress`, {
    method: 'PUT',
    body: JSON.stringify({ progress }),
  });
};

export const completeExecution = async (id: string, completionDate: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ completionDate }),
  });
};

export const closeChangeOrder = async (id: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/close`, {
    method: 'POST',
  });
};

export const exportChangeOrder = async (id: string): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/orders/${id}/export`, {
    headers: {
      Accept: 'application/pdf',
    },
  });
};

// Change Logs
export const getChangeLogs = async (changeRequestId: string): Promise<ChangeLog[]> => {
  return apiFetch(`${BASE_URL}/requests/${changeRequestId}/logs`);
};

export const getChangeOrderLogs = async (changeOrderId: string): Promise<ChangeLog[]> => {
  return apiFetch(`${BASE_URL}/orders/${changeOrderId}/logs`);
};

// Analytics & Reports
export const getChangeAnalytics = async (
  projectId?: string,
  fromDate?: string,
  toDate?: string
): Promise<ChangeAnalytics> => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);

  return apiFetch(`${BASE_URL}/analytics?${queryParams.toString()}`);
};

export const getProjectChangeImpact = async (projectId: string): Promise<{
  totalCostImpact: number;
  totalScheduleImpact: number;
  originalBudget: number;
  currentBudget: number;
  budgetVariance: number;
  originalDuration: number;
  currentDuration: number;
  scheduleVariance: number;
  changesByCategory: {
    category: string;
    count: number;
    costImpact: number;
    scheduleImpact: number;
  }[];
  changesByStatus: {
    status: string;
    count: number;
  }[];
  timeline: {
    month: string;
    changes: number;
    cost: number;
  }[];
}> => {
  return apiFetch(`${BASE_URL}/projects/${projectId}/impact`);
};

export const exportChangeRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' | 'CSV'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/projects/${projectId}/register/export?format=${format}`, {
    headers: {
      Accept: format === 'PDF' ? 'application/pdf' : 'application/octet-stream',
    },
  });
};

export const compareChangeAlternatives = async (
  requestId: string
): Promise<{
  alternatives: {
    id: string;
    title: string;
    costEstimate: number;
    duration: number;
    score: number;
    ranking: number;
    pros: string[];
    cons: string[];
  }[];
  recommendation: {
    alternativeId: string;
    reason: string;
  };
}> => {
  return apiFetch(`${BASE_URL}/requests/${requestId}/compare-alternatives`);
};

export const getForecast = async (projectId: string): Promise<{
  forecastedChanges: number;
  forecastedCost: number;
  forecastedDelay: number;
  confidence: number;
  basedOn: string;
  factors: {
    factor: string;
    impact: string;
  }[];
}> => {
  return apiFetch(`${BASE_URL}/projects/${projectId}/forecast`);
};

// File Upload
export const uploadAttachment = async (
  file: File,
  changeRequestId?: string,
  changeOrderId?: string,
  category?: string
): Promise<{ url: string; fileName: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (changeRequestId) formData.append('changeRequestId', changeRequestId);
  if (changeOrderId) formData.append('changeOrderId', changeOrderId);
  if (category) formData.append('category', category);

  return apiFetch(`${BASE_URL}/attachments/upload`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};
