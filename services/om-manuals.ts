/**
 * O&M Manuals Service
 * API integration for Operations & Maintenance documentation
 */

import type {
    EquipmentCategory,
    EquipmentItem,
    MaintenanceSchedule,
    ManualReview,
    ManualStatus,
    OMAnalytics,
    OMExportOptions,
    OMManualPackage,
    OMManualSummary,
    TrainingSession,
    TrainingStatus
} from '@/types/om-manuals';
import { apiFetch } from './api';

// O&M Manual Packages
export const getOMManualPackages = async (params?: {
  projectId?: string;
  status?: ManualStatus;
  contractorId?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.contractorId) queryParams.append('contractorId', params.contractorId);
  if (params?.search) queryParams.append('search', params.search);

  return apiFetch<OMManualPackage[]>(
    `/om-manuals/packages?${queryParams.toString()}`
  );
};

export const getOMManualPackage = async (id: string) => {
  return apiFetch<OMManualPackage>(`/om-manuals/packages/${id}`);
};

export const createOMManualPackage = async (data: Partial<OMManualPackage>) => {
  return apiFetch<OMManualPackage>('/om-manuals/packages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateOMManualPackage = async (
  id: string,
  data: Partial<OMManualPackage>
) => {
  return apiFetch<OMManualPackage>(`/om-manuals/packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteOMManualPackage = async (id: string) => {
  return apiFetch(`/om-manuals/packages/${id}`, { method: 'DELETE' });
};

// Package Workflow
export const submitOMManualPackage = async (id: string) => {
  return apiFetch<OMManualPackage>(`/om-manuals/packages/${id}/submit`, {
    method: 'POST',
  });
};

export const approveOMManualPackage = async (id: string, comments?: string) => {
  return apiFetch<OMManualPackage>(`/om-manuals/packages/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectOMManualPackage = async (id: string, reason: string) => {
  return apiFetch<OMManualPackage>(`/om-manuals/packages/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const distributeOMManualPackage = async (id: string, recipients: string[]) => {
  return apiFetch<OMManualPackage>(`/om-manuals/packages/${id}/distribute`, {
    method: 'POST',
    body: JSON.stringify({ recipients }),
  });
};

// Equipment Items
export const getEquipmentItems = async (packageId: string, params?: {
  category?: EquipmentCategory;
  status?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  return apiFetch<EquipmentItem[]>(
    `/om-manuals/packages/${packageId}/equipment?${queryParams.toString()}`
  );
};

export const getEquipmentItem = async (packageId: string, equipmentId: string) => {
  return apiFetch<EquipmentItem>(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}`
  );
};

export const addEquipmentItem = async (
  packageId: string,
  data: Partial<EquipmentItem>
) => {
  return apiFetch<EquipmentItem>(
    `/om-manuals/packages/${packageId}/equipment`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

export const updateEquipmentItem = async (
  packageId: string,
  equipmentId: string,
  data: Partial<EquipmentItem>
) => {
  return apiFetch<EquipmentItem>(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};

export const deleteEquipmentItem = async (packageId: string, equipmentId: string) => {
  return apiFetch(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}`,
    { method: 'DELETE' }
  );
};

// Equipment Documents
export const uploadEquipmentDocument = async (
  packageId: string,
  equipmentId: string,
  file: File,
  documentType: string,
  metadata?: {
    version?: string;
    revision?: string;
    language?: string;
    description?: string;
  }
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  if (metadata?.version) formData.append('version', metadata.version);
  if (metadata?.revision) formData.append('revision', metadata.revision);
  if (metadata?.language) formData.append('language', metadata.language);
  if (metadata?.description) formData.append('description', metadata.description);

  return apiFetch<{ url: string; documentId: string }>(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/documents`,
    {
      method: 'POST',
      body: formData,
    }
  );
};

export const deleteEquipmentDocument = async (
  packageId: string,
  equipmentId: string,
  documentId: string
) => {
  return apiFetch(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/documents/${documentId}`,
    { method: 'DELETE' }
  );
};

// Equipment Photos
export const uploadEquipmentPhoto = async (
  packageId: string,
  equipmentId: string,
  photo: File,
  photoType: string,
  caption?: string
) => {
  const formData = new FormData();
  formData.append('photo', photo);
  formData.append('photoType', photoType);
  if (caption) formData.append('caption', caption);

  return apiFetch<{ url: string; thumbnailUrl: string; photoId: string }>(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/photos`,
    {
      method: 'POST',
      body: formData,
    }
  );
};

export const deleteEquipmentPhoto = async (
  packageId: string,
  equipmentId: string,
  photoId: string
) => {
  return apiFetch(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/photos/${photoId}`,
    { method: 'DELETE' }
  );
};

// Maintenance Schedules
export const getMaintenanceSchedules = async (
  packageId: string,
  equipmentId: string
) => {
  return apiFetch<MaintenanceSchedule[]>(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/maintenance`
  );
};

export const addMaintenanceSchedule = async (
  packageId: string,
  equipmentId: string,
  data: Partial<MaintenanceSchedule>
) => {
  return apiFetch<MaintenanceSchedule>(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/maintenance`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

export const updateMaintenanceSchedule = async (
  packageId: string,
  equipmentId: string,
  scheduleId: string,
  data: Partial<MaintenanceSchedule>
) => {
  return apiFetch<MaintenanceSchedule>(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/maintenance/${scheduleId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};

export const deleteMaintenanceSchedule = async (
  packageId: string,
  equipmentId: string,
  scheduleId: string
) => {
  return apiFetch(
    `/om-manuals/packages/${packageId}/equipment/${equipmentId}/maintenance/${scheduleId}`,
    { method: 'DELETE' }
  );
};

// Manual Reviews
export const getManualReviews = async (packageId: string) => {
  return apiFetch<ManualReview[]>(`/om-manuals/packages/${packageId}/reviews`);
};

export const createManualReview = async (
  packageId: string,
  data: Partial<ManualReview>
) => {
  return apiFetch<ManualReview>(`/om-manuals/packages/${packageId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateManualReview = async (
  packageId: string,
  reviewId: string,
  data: Partial<ManualReview>
) => {
  return apiFetch<ManualReview>(
    `/om-manuals/packages/${packageId}/reviews/${reviewId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};

export const submitReviewResponse = async (
  packageId: string,
  reviewId: string,
  response: string
) => {
  return apiFetch<ManualReview>(
    `/om-manuals/packages/${packageId}/reviews/${reviewId}/response`,
    {
      method: 'POST',
      body: JSON.stringify({ response }),
    }
  );
};

// Training Sessions
export const getTrainingSessions = async (params?: {
  packageId?: string;
  status?: TrainingStatus;
  startDate?: string;
  endDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.packageId) queryParams.append('packageId', params.packageId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  return apiFetch<TrainingSession[]>(
    `/om-manuals/training?${queryParams.toString()}`
  );
};

export const getTrainingSession = async (id: string) => {
  return apiFetch<TrainingSession>(`/om-manuals/training/${id}`);
};

export const createTrainingSession = async (data: Partial<TrainingSession>) => {
  return apiFetch<TrainingSession>('/om-manuals/training', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTrainingSession = async (
  id: string,
  data: Partial<TrainingSession>
) => {
  return apiFetch<TrainingSession>(`/om-manuals/training/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteTrainingSession = async (id: string) => {
  return apiFetch(`/om-manuals/training/${id}`, { method: 'DELETE' });
};

export const recordAttendance = async (
  sessionId: string,
  attendeeId: string,
  attended: boolean
) => {
  return apiFetch(`/om-manuals/training/${sessionId}/attendance`, {
    method: 'POST',
    body: JSON.stringify({ attendeeId, attended }),
  });
};

export const issueCertificate = async (
  sessionId: string,
  attendeeId: string,
  certificateNumber: string
) => {
  return apiFetch<{ certificateUrl: string }>(
    `/om-manuals/training/${sessionId}/certificate`,
    {
      method: 'POST',
      body: JSON.stringify({ attendeeId, certificateNumber }),
    }
  );
};

// Analytics
export const getOMManualSummary = async (
  projectId: string,
  startDate?: string,
  endDate?: string
) => {
  const queryParams = new URLSearchParams({ projectId });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  return apiFetch<OMManualSummary>(
    `/om-manuals/summary?${queryParams.toString()}`
  );
};

export const getOMAnalytics = async (projectId: string, period: string) => {
  return apiFetch<OMAnalytics>(
    `/om-manuals/analytics?projectId=${projectId}&period=${period}`
  );
};

// Exports
export const exportOMManualPackage = async (
  packageId: string,
  options: OMExportOptions
) => {
  return apiFetch<{ url: string }>(`/om-manuals/packages/${packageId}/export`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

export const exportEquipmentRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL'
) => {
  return apiFetch<Blob>(
    `/om-manuals/export/equipment-register?projectId=${projectId}&format=${format}`
  );
};

export const exportMaintenanceSchedules = async (
  projectId: string,
  format: 'PDF' | 'EXCEL'
) => {
  return apiFetch<Blob>(
    `/om-manuals/export/maintenance-schedules?projectId=${projectId}&format=${format}`
  );
};
