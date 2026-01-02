/**
 * Punch List Service
 * API integration for construction punch list management
 */

import type {
    InspectionResult,
    PunchItemCategory,
    PunchItemPriority,
    PunchItemStatus,
    PunchList,
    PunchListAnalytics,
    PunchListExportOptions,
    PunchListItem,
    PunchListStatus,
    PunchListSummary,
    PunchListTemplate,
    VerificationMethod,
} from '@/types/punch-list';
import { apiFetch } from './api';

// Punch Lists
export const getPunchLists = async (params?: {
  projectId?: string;
  status?: PunchListStatus;
  listType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<PunchList[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.listType) queryParams.append('listType', params.listType);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.search) queryParams.append('search', params.search);
  
  return apiFetch(`/punch-lists?${queryParams.toString()}`);
};

export const getPunchList = async (id: string): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}`);
};

export const createPunchList = async (data: Partial<PunchList>): Promise<PunchList> => {
  return apiFetch('/punch-lists', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePunchList = async (id: string, data: Partial<PunchList>): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deletePunchList = async (id: string): Promise<void> => {
  return apiFetch(`/punch-lists/${id}`, {
    method: 'DELETE',
  });
};

// Punch List workflow
export const submitPunchList = async (id: string, notes?: string): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
};

export const approvePunchList = async (id: string, comments?: string): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const closePunchList = async (id: string, comments?: string): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}/close`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const distributePunchList = async (id: string, userIds: string[]): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}/distribute`, {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
};

// Punch Items
export const getPunchItems = async (punchListId: string, params?: {
  status?: PunchItemStatus;
  priority?: PunchItemPriority;
  category?: PunchItemCategory;
  responsibleParty?: string;
  assignedTo?: string;
  overdue?: boolean;
}): Promise<PunchListItem[]> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.responsibleParty) queryParams.append('responsibleParty', params.responsibleParty);
  if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
  if (params?.overdue !== undefined) queryParams.append('overdue', params.overdue.toString());
  
  return apiFetch(`/punch-lists/${punchListId}/items?${queryParams.toString()}`);
};

export const getPunchItem = async (punchListId: string, itemId: string): Promise<PunchListItem> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}`);
};

export const addPunchItem = async (punchListId: string, data: Partial<PunchListItem>): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePunchItem = async (punchListId: string, itemId: string, data: Partial<PunchListItem>): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deletePunchItem = async (punchListId: string, itemId: string): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}`, {
    method: 'DELETE',
  });
};

// Punch Item workflow
export const assignPunchItem = async (
  punchListId: string,
  itemId: string,
  assignedTo: { id: string; name: string; company: string; trade: string }
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedTo }),
  });
};

export const updatePunchItemProgress = async (
  punchListId: string,
  itemId: string,
  percentComplete: number,
  comments?: string
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ percentComplete, comments }),
  });
};

export const markItemReadyForReview = async (
  punchListId: string,
  itemId: string,
  comments?: string
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/ready-for-review`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const verifyPunchItem = async (
  punchListId: string,
  itemId: string,
  data: {
    verificationMethod: VerificationMethod;
    inspectionResult: InspectionResult;
    verificationNotes?: string;
    inspectionNotes?: string;
  }
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const rejectPunchItem = async (
  punchListId: string,
  itemId: string,
  reason: string
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const closePunchItem = async (
  punchListId: string,
  itemId: string,
  comments?: string
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/close`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

// Sign-off
export const signOffPunchItem = async (
  punchListId: string,
  itemId: string,
  signOffType: 'CONTRACTOR' | 'OWNER',
  data: {
    signedBy: string;
    signature?: string;
    comments?: string;
  }
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/sign-off/${signOffType.toLowerCase()}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const signOffPunchList = async (
  id: string,
  signOffType: 'CONTRACTOR' | 'OWNER',
  data: {
    signedBy: string;
    signature?: string;
    comments?: string;
  }
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}/sign-off/${signOffType.toLowerCase()}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Photos & attachments
export const uploadPunchItemPhoto = async (
  punchListId: string,
  itemId: string,
  photoType: 'BEFORE' | 'AFTER' | 'GENERAL',
  file: File,
  caption?: string
): Promise<{ url: string; thumbnailUrl: string; photoId: string }> => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('photoType', photoType);
  if (caption) formData.append('caption', caption);
  
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/photos`, {
    method: 'POST',
    body: formData,
  });
};

export const deletePunchItemPhoto = async (
  punchListId: string,
  itemId: string,
  photoId: string
): Promise<void> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/photos/${photoId}`, {
    method: 'DELETE',
  });
};

export const uploadPunchItemAttachment = async (
  punchListId: string,
  itemId: string,
  file: File,
  category?: string
): Promise<{ url: string; attachmentId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/attachments`, {
    method: 'POST',
    body: formData,
  });
};

export const deletePunchItemAttachment = async (
  punchListId: string,
  itemId: string,
  attachmentId: string
): Promise<void> => {
  return apiFetch(`/punch-lists/${punchListId}/items/${itemId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
};

// Templates
export const getPunchListTemplates = async (category?: PunchItemCategory): Promise<PunchListTemplate[]> => {
  const queryParams = category ? `?category=${category}` : '';
  return apiFetch(`/punch-list-templates${queryParams}`);
};

export const getPunchListTemplate = async (id: string): Promise<PunchListTemplate> => {
  return apiFetch(`/punch-list-templates/${id}`);
};

export const createFromTemplate = async (
  templateId: string,
  data: {
    projectId: string;
    title: string;
    listType: string;
    area?: string;
  }
): Promise<PunchList> => {
  return apiFetch(`/punch-list-templates/${templateId}/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// All punch items across lists
export const getAllPunchItems = async (params?: {
  projectId?: string;
  status?: PunchItemStatus;
  priority?: PunchItemPriority;
  category?: PunchItemCategory;
  assignedTo?: string;
  overdue?: boolean;
}): Promise<PunchListItem[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
  if (params?.overdue !== undefined) queryParams.append('overdue', params.overdue.toString());
  
  return apiFetch(`/punch-items?${queryParams.toString()}`);
};

// Comments
export const addPunchListComment = async (
  id: string,
  comment: string,
  mentions?: string[]
): Promise<PunchList> => {
  return apiFetch(`/punch-lists/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment, mentions }),
  });
};

// Summary & Analytics
export const getPunchListSummary = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<PunchListSummary> => {
  const queryParams = new URLSearchParams({ projectId });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  return apiFetch(`/punch-lists/summary?${queryParams.toString()}`);
};

export const getPunchListAnalytics = async (
  projectId: string,
  period: string
): Promise<PunchListAnalytics> => {
  return apiFetch(`/punch-lists/analytics?projectId=${projectId}&period=${period}`);
};

// Exports
export const exportPunchList = async (
  id: string,
  options: PunchListExportOptions
): Promise<Blob> => {
  return apiFetch(`/punch-lists/${id}/export`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

export const exportPunchListRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch(`/punch-lists/export-register?projectId=${projectId}&format=${format}`);
};

export const exportOutstandingItems = async (
  projectId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch(`/punch-lists/export-outstanding?projectId=${projectId}&format=${format}`);
};
