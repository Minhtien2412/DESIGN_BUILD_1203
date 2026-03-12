/**
 * Warranty Service
 * API integration for warranty management
 */

import type {
    ClaimPriority,
    ClaimStatus,
    ResolutionType,
    WarrantyAnalytics,
    WarrantyClaim,
    WarrantyExportOptions,
    WarrantyItem,
    WarrantyRegister,
    WarrantyStatus,
    WarrantySummary,
    WarrantyType,
} from '@/types/warranty';
import { apiFetch } from './api';

// Warranty Items
export const getWarrantyItems = async (params?: {
  projectId?: string;
  status?: WarrantyStatus;
  warrantyType?: WarrantyType;
  search?: string;
  expiringWithinDays?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.warrantyType) queryParams.append('warrantyType', params.warrantyType);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.expiringWithinDays)
    queryParams.append('expiringWithinDays', params.expiringWithinDays.toString());

  return apiFetch<WarrantyItem[]>(`/warranties?${queryParams.toString()}`);
};

export const getWarrantyItem = async (id: string) => {
  return apiFetch<WarrantyItem>(`/warranties/${id}`);
};

export const createWarrantyItem = async (data: Partial<WarrantyItem>) => {
  return apiFetch<WarrantyItem>('/warranties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateWarrantyItem = async (id: string, data: Partial<WarrantyItem>) => {
  return apiFetch<WarrantyItem>(`/warranties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWarrantyItem = async (id: string) => {
  return apiFetch(`/warranties/${id}`, { method: 'DELETE' });
};

// Warranty Documents
export const uploadWarrantyDocument = async (
  warrantyId: string,
  file: File,
  documentType: string,
  metadata?: {
    expiryDate?: string;
  }
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  if (metadata?.expiryDate) formData.append('expiryDate', metadata.expiryDate);

  return apiFetch<{ url: string; documentId: string }>(
    `/warranties/${warrantyId}/documents`,
    {
      method: 'POST',
      body: formData,
    }
  );
};

export const deleteWarrantyDocument = async (warrantyId: string, documentId: string) => {
  return apiFetch(`/warranties/${warrantyId}/documents/${documentId}`, {
    method: 'DELETE',
  });
};

// Warranty Claims
export const getWarrantyClaims = async (params?: {
  warrantyId?: string;
  projectId?: string;
  status?: ClaimStatus;
  priority?: ClaimPriority;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.warrantyId) queryParams.append('warrantyId', params.warrantyId);
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.search) queryParams.append('search', params.search);

  return apiFetch<WarrantyClaim[]>(`/warranty-claims?${queryParams.toString()}`);
};

export const getWarrantyClaim = async (id: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}`);
};

export const createWarrantyClaim = async (data: Partial<WarrantyClaim>) => {
  return apiFetch<WarrantyClaim>('/warranty-claims', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateWarrantyClaim = async (id: string, data: Partial<WarrantyClaim>) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWarrantyClaim = async (id: string) => {
  return apiFetch(`/warranty-claims/${id}`, { method: 'DELETE' });
};

// Claim Workflow
export const submitClaim = async (id: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/submit`, {
    method: 'POST',
  });
};

export const acknowledgeClaim = async (id: string, comments?: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const approveClaim = async (id: string, approvedAmount?: number, comments?: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approvedAmount, comments }),
  });
};

export const rejectClaim = async (id: string, reason: string, details?: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason, details }),
  });
};

export const assignClaim = async (id: string, assignedTo: {
  id: string;
  name: string;
  company?: string;
  role?: string;
}) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedTo }),
  });
};

export const scheduleInspection = async (id: string, inspectionDate: string, inspector: {
  id: string;
  name: string;
  company?: string;
}) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/schedule-inspection`, {
    method: 'POST',
    body: JSON.stringify({ inspectionDate, inspector }),
  });
};

export const completeInspection = async (id: string, report: string, photos?: string[]) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/complete-inspection`, {
    method: 'POST',
    body: JSON.stringify({ report, photos }),
  });
};

export const startWork = async (id: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/start-work`, {
    method: 'POST',
  });
};

export const completeClaim = async (id: string, resolution: {
  resolutionType: ResolutionType;
  resolutionDescription: string;
  workPerformed?: string;
  partsReplaced?: {
    partName: string;
    partNumber?: string;
    quantity: number;
    cost?: number;
  }[];
  laborHours?: number;
  actualCost?: number;
}) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(resolution),
  });
};

export const closeClaim = async (id: string, satisfactionRating?: number, feedback?: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/close`, {
    method: 'POST',
    body: JSON.stringify({ satisfactionRating, feedback }),
  });
};

export const submitAppeal = async (id: string, appealReason: string) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${id}/appeal`, {
    method: 'POST',
    body: JSON.stringify({ appealReason }),
  });
};

// Claim Photos & Attachments
export const uploadClaimPhoto = async (
  claimId: string,
  photo: File,
  photoType: string,
  caption?: string
) => {
  const formData = new FormData();
  formData.append('photo', photo);
  formData.append('photoType', photoType);
  if (caption) formData.append('caption', caption);

  return apiFetch<{ url: string; thumbnailUrl: string; photoId: string }>(
    `/warranty-claims/${claimId}/photos`,
    {
      method: 'POST',
      body: formData,
    }
  );
};

export const deleteClaimPhoto = async (claimId: string, photoId: string) => {
  return apiFetch(`/warranty-claims/${claimId}/photos/${photoId}`, {
    method: 'DELETE',
  });
};

export const uploadClaimAttachment = async (
  claimId: string,
  file: File,
  category?: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);

  return apiFetch<{ url: string; attachmentId: string }>(
    `/warranty-claims/${claimId}/attachments`,
    {
      method: 'POST',
      body: formData,
    }
  );
};

export const deleteClaimAttachment = async (claimId: string, attachmentId: string) => {
  return apiFetch(`/warranty-claims/${claimId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
};

// Claim Updates
export const addClaimUpdate = async (claimId: string, update: {
  updateType: string;
  message: string;
  attachments?: string[];
  photos?: string[];
}) => {
  return apiFetch<WarrantyClaim>(`/warranty-claims/${claimId}/updates`, {
    method: 'POST',
    body: JSON.stringify(update),
  });
};

// Warranty Register
export const getWarrantyRegister = async (projectId: string) => {
  return apiFetch<WarrantyRegister>(`/warranties/register?projectId=${projectId}`);
};

// Analytics
export const getWarrantySummary = async (
  projectId?: string,
  startDate?: string,
  endDate?: string
) => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  return apiFetch<WarrantySummary>(`/warranties/summary?${queryParams.toString()}`);
};

export const getWarrantyAnalytics = async (projectId: string, period: string) => {
  return apiFetch<WarrantyAnalytics>(
    `/warranties/analytics?projectId=${projectId}&period=${period}`
  );
};

// Exports
export const exportWarrantyRegister = async (
  projectId: string,
  options: WarrantyExportOptions
) => {
  return apiFetch<{ url: string }>(`/warranties/export/register`, {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportWarrantyClaims = async (
  projectId: string,
  format: 'PDF' | 'EXCEL',
  filters?: {
    status?: ClaimStatus;
    startDate?: string;
    endDate?: string;
  }
) => {
  return apiFetch<Blob>(`/warranties/export/claims`, {
    method: 'POST',
    body: JSON.stringify({ projectId, format, filters }),
  });
};

export const exportExpiringWarranties = async (
  projectId: string,
  days: number,
  format: 'PDF' | 'EXCEL'
) => {
  return apiFetch<Blob>(
    `/warranties/export/expiring?projectId=${projectId}&days=${days}&format=${format}`
  );
};
