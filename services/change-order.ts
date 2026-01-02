/**
 * Change Order Service
 * Handles change order operations
 */

import type {
    ApproveChangeOrderParams,
    ChangeOrder,
    ChangeOrderAnalytics,
    ChangeOrderLog,
    ChangeOrderSummary,
    ChangeOrderTemplate,
    CreateChangeOrderParams,
    GetChangeOrdersParams,
    ImplementChangeOrderParams,
    UpdateChangeOrderParams
} from '@/types/change-order';
import { apiFetch } from './api';

const BASE_URL = '/change-orders';

/**
 * Change Orders
 */
export const getChangeOrders = async (params?: GetChangeOrdersParams): Promise<ChangeOrder[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.requestedById) queryParams.append('requestedById', params.requestedById);
  if (params?.approverId) queryParams.append('approverId', params.approverId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.costImpactType) queryParams.append('costImpactType', params.costImpactType);
  if (params?.minCostImpact !== undefined)
    queryParams.append('minCostImpact', String(params.minCostImpact));
  if (params?.maxCostImpact !== undefined)
    queryParams.append('maxCostImpact', String(params.maxCostImpact));
  if (params?.search) queryParams.append('search', params.search);

  return apiFetch(`${BASE_URL}?${queryParams.toString()}`);
};

export const getChangeOrder = async (id: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}`);
};

export const createChangeOrder = async (data: CreateChangeOrderParams): Promise<ChangeOrder> => {
  return apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateChangeOrder = async (
  id: string,
  data: UpdateChangeOrderParams
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteChangeOrder = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};

export const submitChangeOrder = async (id: string, notes?: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
};

export const reviewChangeOrder = async (
  id: string,
  comments: string,
  requestRevision?: boolean
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ comments, requestRevision }),
  });
};

export const approveChangeOrder = async (
  id: string,
  data: ApproveChangeOrderParams
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const rejectChangeOrder = async (id: string, reason: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const implementChangeOrder = async (
  id: string,
  data: ImplementChangeOrderParams
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/implement`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const completeChangeOrder = async (
  id: string,
  completionNotes?: string
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ completionNotes }),
  });
};

export const cancelChangeOrder = async (id: string, reason: string): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const createRevision = async (
  id: string,
  revisionNumber: string,
  changes: string,
  notes?: string
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/revisions`, {
    method: 'POST',
    body: JSON.stringify({ revisionNumber, changes, notes }),
  });
};

export const delegateApproval = async (
  id: string,
  approvalId: string,
  delegateToId: string,
  reason?: string
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/approvals/${approvalId}/delegate`, {
    method: 'POST',
    body: JSON.stringify({ delegateToId, reason }),
  });
};

export const updateImplementationProgress = async (
  id: string,
  progress: number,
  description: string
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/${id}/implementation/progress`, {
    method: 'PUT',
    body: JSON.stringify({ progress, description }),
  });
};

/**
 * Attachments
 */
export const uploadChangeOrderAttachment = async (
  id: string,
  file: File,
  category:
    | 'PROPOSAL'
    | 'JUSTIFICATION'
    | 'COST_ESTIMATE'
    | 'DRAWING'
    | 'APPROVAL'
    | 'IMPLEMENTATION'
    | 'GENERAL',
  description?: string
): Promise<{ url: string; thumbnailUrl?: string; attachmentId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (description) formData.append('description', description);

  return apiFetch(`${BASE_URL}/${id}/attachments`, {
    method: 'POST',
    body: formData,
  });
};

export const deleteChangeOrderAttachment = async (
  id: string,
  attachmentId: string
): Promise<void> => {
  return apiFetch(`${BASE_URL}/${id}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
};

/**
 * Templates
 */
export const getChangeOrderTemplates = async (type?: string): Promise<ChangeOrderTemplate[]> => {
  const url = type ? `${BASE_URL}/templates?type=${type}` : `${BASE_URL}/templates`;
  return apiFetch(url);
};

export const getChangeOrderTemplate = async (id: string): Promise<ChangeOrderTemplate> => {
  return apiFetch(`${BASE_URL}/templates/${id}`);
};

export const createFromTemplate = async (
  templateId: string,
  projectId: string,
  title: string,
  requiredDate: string,
  customization?: Partial<CreateChangeOrderParams>
): Promise<ChangeOrder> => {
  return apiFetch(`${BASE_URL}/templates/${templateId}/create`, {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      title,
      requiredDate,
      ...customization,
    }),
  });
};

/**
 * Summary
 */
export const getChangeOrderSummary = async (projectId: string): Promise<ChangeOrderSummary> => {
  return apiFetch(`${BASE_URL}/summary?projectId=${projectId}`);
};

export const updateChangeOrderSummary = async (
  changeOrderNumber: string,
  costChange?: number,
  scheduleDays?: number
): Promise<ChangeOrderSummary> => {
  return apiFetch(`${BASE_URL}/summary/${changeOrderNumber}`, {
    method: 'PUT',
    body: JSON.stringify({ costChange, scheduleDays }),
  });
};

/**
 * Logs
 */
export const getChangeOrderLogs = async (id: string): Promise<ChangeOrderLog[]> => {
  return apiFetch(`${BASE_URL}/${id}/logs`);
};

export const getProjectChangeOrderLogs = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<ChangeOrderLog[]> => {
  const queryParams = new URLSearchParams({ projectId });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  return apiFetch(`${BASE_URL}/logs?${queryParams.toString()}`);
};

/**
 * Analytics
 */
export const getChangeOrderAnalytics = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<ChangeOrderAnalytics> => {
  const queryParams = new URLSearchParams({ projectId });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  return apiFetch(`${BASE_URL}/analytics?${queryParams.toString()}`);
};

export const getCostAnalysis = async (
  projectId?: string
): Promise<{
  totalIncrease: number;
  totalDecrease: number;
  netChange: number;
  currency: string;
  byType: { type: string; increase: number; decrease: number; net: number }[];
  budgetImpact: {
    originalBudget: number;
    currentBudget: number;
    variance: number;
    percentageChange: number;
  };
}> => {
  const url = projectId
    ? `${BASE_URL}/analytics/cost?projectId=${projectId}`
    : `${BASE_URL}/analytics/cost`;
  return apiFetch(url);
};

export const getScheduleAnalysis = async (
  projectId?: string
): Promise<{
  totalDelay: number;
  totalAcceleration: number;
  netChange: number;
  criticalPathImpact: number;
  averageDelay: number;
  byType: { type: string; delay: number; acceleration: number; net: number }[];
}> => {
  const url = projectId
    ? `${BASE_URL}/analytics/schedule?projectId=${projectId}`
    : `${BASE_URL}/analytics/schedule`;
  return apiFetch(url);
};

/**
 * Reports
 */
export const exportChangeOrderRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' | 'CSV' = 'PDF'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/reports/register?projectId=${projectId}&format=${format}`, {
    headers: { Accept: 'application/octet-stream' },
  });
};

export const exportChangeOrderLog = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' = 'PDF'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/reports/log?projectId=${projectId}&format=${format}`, {
    headers: { Accept: 'application/octet-stream' },
  });
};

export const exportChangeOrderPackage = async (
  id: string,
  includeAttachments: boolean = true
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/${id}/export?includeAttachments=${includeAttachments}`, {
    headers: { Accept: 'application/octet-stream' },
  });
};

export const exportCostSummary = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' = 'PDF'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/reports/cost-summary?projectId=${projectId}&format=${format}`, {
    headers: { Accept: 'application/octet-stream' },
  });
};
