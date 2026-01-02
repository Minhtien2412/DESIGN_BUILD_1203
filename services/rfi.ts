/**
 * RFI Service
 * Handles Request for Information (RFI) operations
 */

import type {
    CreateRFIParams,
    GetRFIsParams,
    RequestClarificationParams,
    RespondToRFIParams,
    RFI,
    RFIAnalytics,
    RFILog,
    RFIResponse,
    RFISchedule,
    RFITemplate,
    UpdateRFIParams
} from '@/types/rfi';
import { apiFetch } from './api';

const BASE_URL = '/rfis';

/**
 * RFIs
 */
export const getRFIs = async (params?: GetRFIsParams): Promise<RFI[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.createdById) queryParams.append('createdById', params.createdById);
  if (params?.assignedToId) queryParams.append('assignedToId', params.assignedToId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.isOverdue !== undefined) queryParams.append('isOverdue', String(params.isOverdue));
  if (params?.search) queryParams.append('search', params.search);

  return apiFetch(`${BASE_URL}?${queryParams.toString()}`);
};

export const getRFI = async (id: string): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}`);
};

export const createRFI = async (data: CreateRFIParams): Promise<RFI> => {
  return apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateRFI = async (id: string, data: UpdateRFIParams): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteRFI = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};

export const submitRFI = async (id: string, notes?: string): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
};

export const respondToRFI = async (id: string, data: RespondToRFIParams): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const requestClarification = async (
  id: string,
  data: RequestClarificationParams
): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/clarification`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const closeRFI = async (id: string, closureNotes?: string): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/close`, {
    method: 'POST',
    body: JSON.stringify({ closureNotes }),
  });
};

export const reopenRFI = async (id: string, reason: string): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const cancelRFI = async (id: string, reason: string): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const reassignRFI = async (id: string, assignedToId: string, reason?: string): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/reassign`, {
    method: 'POST',
    body: JSON.stringify({ assignedToId, reason }),
  });
};

export const addDistributionMember = async (
  id: string,
  userId: string,
  sendNotification: boolean = true
): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/distribution`, {
    method: 'POST',
    body: JSON.stringify({ userId, sendNotification }),
  });
};

export const removeDistributionMember = async (id: string, userId: string): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/${id}/distribution/${userId}`, {
    method: 'DELETE',
  });
};

/**
 * Attachments
 */
export const uploadRFIAttachment = async (
  id: string,
  file: File,
  category: 'QUESTION' | 'REFERENCE' | 'RESPONSE' | 'CLARIFICATION' | 'GENERAL',
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

export const deleteRFIAttachment = async (id: string, attachmentId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/${id}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
};

/**
 * Response
 */
export const getRFIResponse = async (id: string): Promise<RFIResponse | null> => {
  return apiFetch(`${BASE_URL}/${id}/response`);
};

export const updateRFIResponse = async (
  id: string,
  responseId: string,
  data: Partial<RespondToRFIParams>
): Promise<RFIResponse> => {
  return apiFetch(`${BASE_URL}/${id}/response/${responseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Templates
 */
export const getRFITemplates = async (category?: string): Promise<RFITemplate[]> => {
  const url = category ? `${BASE_URL}/templates?category=${category}` : `${BASE_URL}/templates`;
  return apiFetch(url);
};

export const getRFITemplate = async (id: string): Promise<RFITemplate> => {
  return apiFetch(`${BASE_URL}/templates/${id}`);
};

export const createFromTemplate = async (
  templateId: string,
  projectId: string,
  subject: string,
  requiredDate: string,
  customization?: Partial<CreateRFIParams>
): Promise<RFI> => {
  return apiFetch(`${BASE_URL}/templates/${templateId}/create`, {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      subject,
      requiredDate,
      ...customization,
    }),
  });
};

/**
 * Schedule
 */
export const getRFISchedule = async (projectId: string): Promise<RFISchedule> => {
  return apiFetch(`${BASE_URL}/schedule?projectId=${projectId}`);
};

export const updateRFISchedule = async (
  rfiNumber: string,
  plannedSubmitDate?: string,
  requiredResponseDate?: string
): Promise<RFISchedule> => {
  return apiFetch(`${BASE_URL}/schedule/${rfiNumber}`, {
    method: 'PUT',
    body: JSON.stringify({ plannedSubmitDate, requiredResponseDate }),
  });
};

/**
 * Logs
 */
export const getRFILogs = async (id: string): Promise<RFILog[]> => {
  return apiFetch(`${BASE_URL}/${id}/logs`);
};

export const getProjectRFILogs = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<RFILog[]> => {
  const queryParams = new URLSearchParams({ projectId });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  return apiFetch(`${BASE_URL}/logs?${queryParams.toString()}`);
};

/**
 * Analytics
 */
export const getRFIAnalytics = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<RFIAnalytics> => {
  const queryParams = new URLSearchParams({ projectId });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  return apiFetch(`${BASE_URL}/analytics?${queryParams.toString()}`);
};

export const getResponsePerformance = async (
  projectId?: string,
  responderId?: string
): Promise<{
  totalResponses: number;
  completed: number;
  pending: number;
  overdue: number;
  averageResponseDays: number;
  onTimeRate: number;
  byResponseType: { type: string; count: number }[];
}> => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (responderId) queryParams.append('responderId', responderId);

  return apiFetch(`${BASE_URL}/analytics/response-performance?${queryParams.toString()}`);
};

export const getInitiatorPerformance = async (
  projectId?: string,
  initiatorId?: string
): Promise<{
  totalRFIs: number;
  answered: number;
  pending: number;
  averageResponseDays: number;
  onTimeRate: number;
  byCategory: { category: string; count: number }[];
}> => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (initiatorId) queryParams.append('initiatorId', initiatorId);

  return apiFetch(`${BASE_URL}/analytics/initiator-performance?${queryParams.toString()}`);
};

/**
 * Reports
 */
export const exportRFIRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' | 'CSV' = 'PDF'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/reports/register?projectId=${projectId}&format=${format}`, {
    headers: { Accept: 'application/octet-stream' },
  });
};

export const exportRFILog = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' = 'PDF'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/reports/log?projectId=${projectId}&format=${format}`, {
    headers: { Accept: 'application/octet-stream' },
  });
};

export const exportRFIPackage = async (id: string, includeAttachments: boolean = true): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/${id}/export?includeAttachments=${includeAttachments}`, {
    headers: { Accept: 'application/octet-stream' },
  });
};
