/**
 * As-Built Documentation Service
 * API integration for as-built drawings and redlines
 */

import type {
    AsBuiltAnalytics,
    AsBuiltDrawing,
    AsBuiltExportOptions,
    AsBuiltSummary,
    DrawingPackage,
    DrawingRegister,
    DrawingReview,
    DrawingRevision,
    DrawingStatus,
    DrawingType,
    MarkupType,
    Redline
} from '@/types/as-built';
import { apiFetch } from './api';

// ============================================================================
// As-Built Drawings
// ============================================================================

export interface GetAsBuiltDrawingsParams {
  projectId?: string;
  drawingType?: DrawingType;
  status?: DrawingStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAsBuiltDrawings = async (
  params?: GetAsBuiltDrawingsParams
): Promise<AsBuiltDrawing[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.drawingType) queryParams.append('drawingType', params.drawingType);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return apiFetch<AsBuiltDrawing[]>(`/as-built/drawings?${queryParams}`);
};

export const getAsBuiltDrawing = async (id: string): Promise<AsBuiltDrawing> => {
  return apiFetch<AsBuiltDrawing>(`/as-built/drawings/${id}`);
};

export const createAsBuiltDrawing = async (
  data: Partial<AsBuiltDrawing>
): Promise<AsBuiltDrawing> => {
  return apiFetch<AsBuiltDrawing>('/as-built/drawings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAsBuiltDrawing = async (
  id: string,
  data: Partial<AsBuiltDrawing>
): Promise<AsBuiltDrawing> => {
  return apiFetch<AsBuiltDrawing>(`/as-built/drawings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteAsBuiltDrawing = async (id: string): Promise<void> => {
  return apiFetch<void>(`/as-built/drawings/${id}`, { method: 'DELETE' });
};

// ============================================================================
// Drawing Files
// ============================================================================

export const uploadDrawingFile = async (
  drawingId: string,
  file: File,
  metadata?: {
    fileFormat?: string;
    scale?: string;
    pageCount?: number;
  }
): Promise<{ fileUrl: string; fileSize: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }
  
  return apiFetch<{ fileUrl: string; fileSize: number }>(
    `/as-built/drawings/${drawingId}/upload`,
    { method: 'POST', body: formData }
  );
};

export const deleteDrawingFile = async (
  drawingId: string,
  fileUrl: string
): Promise<void> => {
  return apiFetch<void>(`/as-built/drawings/${drawingId}/files`, {
    method: 'DELETE',
    body: JSON.stringify({ fileUrl }),
  });
};

// ============================================================================
// Drawing Revisions
// ============================================================================

export const getDrawingRevisions = async (
  drawingId: string
): Promise<DrawingRevision[]> => {
  return apiFetch<DrawingRevision[]>(`/as-built/drawings/${drawingId}/revisions`);
};

export const createDrawingRevision = async (
  drawingId: string,
  data: Partial<DrawingRevision>
): Promise<DrawingRevision> => {
  return apiFetch<DrawingRevision>(`/as-built/drawings/${drawingId}/revisions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateDrawingRevision = async (
  drawingId: string,
  revisionId: string,
  data: Partial<DrawingRevision>
): Promise<DrawingRevision> => {
  return apiFetch<DrawingRevision>(
    `/as-built/drawings/${drawingId}/revisions/${revisionId}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
};

export const approveDrawingRevision = async (
  drawingId: string,
  revisionId: string,
  data: {
    approvedBy: { id: string; name: string; role?: string };
    comments?: string;
  }
): Promise<DrawingRevision> => {
  return apiFetch<DrawingRevision>(
    `/as-built/drawings/${drawingId}/revisions/${revisionId}/approve`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

// ============================================================================
// Redlines (Markups)
// ============================================================================

export const getRedlines = async (
  drawingId: string,
  filters?: {
    markupType?: MarkupType;
    status?: string;
  }
): Promise<Redline[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.markupType) queryParams.append('markupType', filters.markupType);
  if (filters?.status) queryParams.append('status', filters.status);
  
  return apiFetch<Redline[]>(
    `/as-built/drawings/${drawingId}/redlines?${queryParams}`
  );
};

export const createRedline = async (
  drawingId: string,
  data: Partial<Redline>
): Promise<Redline> => {
  return apiFetch<Redline>(`/as-built/drawings/${drawingId}/redlines`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateRedline = async (
  drawingId: string,
  redlineId: string,
  data: Partial<Redline>
): Promise<Redline> => {
  return apiFetch<Redline>(
    `/as-built/drawings/${drawingId}/redlines/${redlineId}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
};

export const resolveRedline = async (
  drawingId: string,
  redlineId: string,
  data: {
    resolution: string;
    resolvedBy: { id: string; name: string };
  }
): Promise<Redline> => {
  return apiFetch<Redline>(
    `/as-built/drawings/${drawingId}/redlines/${redlineId}/resolve`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const incorporateRedline = async (
  drawingId: string,
  redlineId: string,
  revisionId: string
): Promise<Redline> => {
  return apiFetch<Redline>(
    `/as-built/drawings/${drawingId}/redlines/${redlineId}/incorporate`,
    { method: 'POST', body: JSON.stringify({ revisionId }) }
  );
};

export const deleteRedline = async (
  drawingId: string,
  redlineId: string
): Promise<void> => {
  return apiFetch<void>(
    `/as-built/drawings/${drawingId}/redlines/${redlineId}`,
    { method: 'DELETE' }
  );
};

// ============================================================================
// Drawing Reviews
// ============================================================================

export const getDrawingReviews = async (
  drawingId: string
): Promise<DrawingReview[]> => {
  return apiFetch<DrawingReview[]>(`/as-built/drawings/${drawingId}/reviews`);
};

export const createDrawingReview = async (
  drawingId: string,
  data: Partial<DrawingReview>
): Promise<DrawingReview> => {
  return apiFetch<DrawingReview>(`/as-built/drawings/${drawingId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateDrawingReview = async (
  drawingId: string,
  reviewId: string,
  data: Partial<DrawingReview>
): Promise<DrawingReview> => {
  return apiFetch<DrawingReview>(
    `/as-built/drawings/${drawingId}/reviews/${reviewId}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
};

export const submitReviewResponse = async (
  drawingId: string,
  reviewId: string,
  data: {
    response: string;
    responseBy: { id: string; name: string };
  }
): Promise<DrawingReview> => {
  return apiFetch<DrawingReview>(
    `/as-built/drawings/${drawingId}/reviews/${reviewId}/respond`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

// ============================================================================
// Drawing Packages
// ============================================================================

export const getDrawingPackages = async (
  projectId?: string
): Promise<DrawingPackage[]> => {
  const queryParams = projectId ? `?projectId=${projectId}` : '';
  return apiFetch<DrawingPackage[]>(`/as-built/packages${queryParams}`);
};

export const getDrawingPackage = async (id: string): Promise<DrawingPackage> => {
  return apiFetch<DrawingPackage>(`/as-built/packages/${id}`);
};

export const createDrawingPackage = async (
  data: Partial<DrawingPackage>
): Promise<DrawingPackage> => {
  return apiFetch<DrawingPackage>('/as-built/packages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateDrawingPackage = async (
  id: string,
  data: Partial<DrawingPackage>
): Promise<DrawingPackage> => {
  return apiFetch<DrawingPackage>(`/as-built/packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const issueDrawingPackage = async (
  id: string,
  data: {
    issuedDate: string;
    transmittalNumber?: string;
    transmittedTo?: string[];
  }
): Promise<DrawingPackage> => {
  return apiFetch<DrawingPackage>(`/as-built/packages/${id}/issue`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveDrawingPackage = async (
  id: string,
  data: {
    approvedBy: { id: string; name: string; role?: string };
    comments?: string;
  }
): Promise<DrawingPackage> => {
  return apiFetch<DrawingPackage>(`/as-built/packages/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ============================================================================
// Analytics
// ============================================================================

export const getDrawingRegister = async (
  projectId: string
): Promise<DrawingRegister> => {
  return apiFetch<DrawingRegister>(`/as-built/register/${projectId}`);
};

export const getAsBuiltSummary = async (
  projectId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<AsBuiltSummary> => {
  const queryParams = new URLSearchParams();
  if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
  if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);
  
  return apiFetch<AsBuiltSummary>(
    `/as-built/summary/${projectId}?${queryParams}`
  );
};

export const getAsBuiltAnalytics = async (
  projectId: string,
  period: string = 'month'
): Promise<AsBuiltAnalytics> => {
  return apiFetch<AsBuiltAnalytics>(
    `/as-built/analytics/${projectId}?period=${period}`
  );
};

// ============================================================================
// Exports
// ============================================================================

export const exportDrawingRegister = async (
  projectId: string,
  options?: Partial<AsBuiltExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/as-built/export/register', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportDrawingPackage = async (
  packageId: string,
  options?: Partial<AsBuiltExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/as-built/export/package', {
    method: 'POST',
    body: JSON.stringify({ packageId, ...options }),
  });
};

export const exportDrawing = async (
  drawingId: string,
  options?: Partial<AsBuiltExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/as-built/export/drawing', {
    method: 'POST',
    body: JSON.stringify({ drawingId, ...options }),
  });
};
