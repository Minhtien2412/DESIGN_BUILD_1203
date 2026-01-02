/**
 * Document Control Service
 * API integration for document management and version control
 */

import type {
    ControlledDocument,
    DistributionMethod,
    DistributionRecord,
    DocumentControlAnalytics,
    DocumentControlSummary,
    DocumentExportOptions,
    DocumentRegister,
    DocumentReview,
    DocumentRevision,
    DocumentSearchFilters,
    DocumentTransmittal,
    ReviewDecision,
    ReviewType
} from '@/types/document-control';
import { apiFetch } from './api';

// ============================================================================
// Controlled Documents
// ============================================================================

export const getControlledDocuments = async (
  filters?: DocumentSearchFilters
): Promise<ControlledDocument[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.projectId) queryParams.append('projectId', filters.projectId);
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.accessLevel) queryParams.append('accessLevel', filters.accessLevel);
  if (filters?.author) queryParams.append('author', filters.author);
  if (filters?.owner) queryParams.append('owner', filters.owner);
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.keywords) {
    filters.keywords.forEach(k => queryParams.append('keywords', k));
  }
  if (filters?.tags) {
    filters.tags.forEach(t => queryParams.append('tags', t));
  }
  
  return apiFetch<ControlledDocument[]>(`/document-control/documents?${queryParams}`);
};

export const getControlledDocument = async (id: string): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(`/document-control/documents/${id}`);
};

export const createControlledDocument = async (
  data: Partial<ControlledDocument>
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>('/document-control/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateControlledDocument = async (
  id: string,
  data: Partial<ControlledDocument>
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(`/document-control/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteControlledDocument = async (id: string): Promise<void> => {
  return apiFetch<void>(`/document-control/documents/${id}`, { method: 'DELETE' });
};

// ============================================================================
// Document Files
// ============================================================================

export const uploadDocumentFile = async (
  documentId: string,
  file: File,
  metadata?: {
    pageCount?: number;
    description?: string;
  }
): Promise<{ fileUrl: string; fileName: string; fileSize: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }
  
  return apiFetch<{ fileUrl: string; fileName: string; fileSize: number }>(
    `/document-control/documents/${documentId}/upload`,
    { method: 'POST', body: formData }
  );
};

export const deleteDocumentFile = async (
  documentId: string,
  fileUrl: string
): Promise<void> => {
  return apiFetch<void>(`/document-control/documents/${documentId}/files`, {
    method: 'DELETE',
    body: JSON.stringify({ fileUrl }),
  });
};

// ============================================================================
// Document Workflow
// ============================================================================

export const submitForReview = async (
  documentId: string,
  data: {
    reviewers: {
      id: string;
      name: string;
      role: string;
      reviewType: ReviewType;
    }[];
    dueDate?: string;
    comments?: string;
  }
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(
    `/document-control/documents/${documentId}/submit-review`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const approveDocument = async (
  documentId: string,
  data: {
    approvedBy: { id: string; name: string; role?: string };
    comments?: string;
  }
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(
    `/document-control/documents/${documentId}/approve`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const rejectDocument = async (
  documentId: string,
  data: {
    rejectedBy: { id: string; name: string; role?: string };
    reason: string;
    comments?: string;
  }
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(
    `/document-control/documents/${documentId}/reject`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const issueDocument = async (
  documentId: string,
  data: {
    issuedDate: string;
    effectiveDate?: string;
    distributionList?: string[];
  }
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(
    `/document-control/documents/${documentId}/issue`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const supersedeDocument = async (
  documentId: string,
  supersededById: string
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(
    `/document-control/documents/${documentId}/supersede`,
    { method: 'POST', body: JSON.stringify({ supersededById }) }
  );
};

export const archiveDocument = async (
  documentId: string,
  reason?: string
): Promise<ControlledDocument> => {
  return apiFetch<ControlledDocument>(
    `/document-control/documents/${documentId}/archive`,
    { method: 'POST', body: JSON.stringify({ reason }) }
  );
};

// ============================================================================
// Document Revisions
// ============================================================================

export const getDocumentRevisions = async (
  documentId: string
): Promise<DocumentRevision[]> => {
  return apiFetch<DocumentRevision[]>(
    `/document-control/documents/${documentId}/revisions`
  );
};

export const createDocumentRevision = async (
  documentId: string,
  data: Partial<DocumentRevision>
): Promise<DocumentRevision> => {
  return apiFetch<DocumentRevision>(
    `/document-control/documents/${documentId}/revisions`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const approveDocumentRevision = async (
  documentId: string,
  revisionId: string,
  data: {
    approvedBy: { id: string; name: string; role?: string };
    comments?: string;
  }
): Promise<DocumentRevision> => {
  return apiFetch<DocumentRevision>(
    `/document-control/documents/${documentId}/revisions/${revisionId}/approve`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

// ============================================================================
// Document Reviews
// ============================================================================

export const getDocumentReviews = async (
  documentId: string
): Promise<DocumentReview[]> => {
  return apiFetch<DocumentReview[]>(
    `/document-control/documents/${documentId}/reviews`
  );
};

export const createDocumentReview = async (
  documentId: string,
  data: Partial<DocumentReview>
): Promise<DocumentReview> => {
  return apiFetch<DocumentReview>(
    `/document-control/documents/${documentId}/reviews`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const updateDocumentReview = async (
  documentId: string,
  reviewId: string,
  data: Partial<DocumentReview>
): Promise<DocumentReview> => {
  return apiFetch<DocumentReview>(
    `/document-control/documents/${documentId}/reviews/${reviewId}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
};

export const completeDocumentReview = async (
  documentId: string,
  reviewId: string,
  data: {
    decision: ReviewDecision;
    overallComments?: string;
    conditions?: string[];
    actionItems?: string[];
  }
): Promise<DocumentReview> => {
  return apiFetch<DocumentReview>(
    `/document-control/documents/${documentId}/reviews/${reviewId}/complete`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const submitReviewResponse = async (
  documentId: string,
  reviewId: string,
  data: {
    response: string;
    responseBy: { id: string; name: string };
  }
): Promise<DocumentReview> => {
  return apiFetch<DocumentReview>(
    `/document-control/documents/${documentId}/reviews/${reviewId}/respond`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

// ============================================================================
// Distribution
// ============================================================================

export const getDistributionRecords = async (
  documentId: string
): Promise<DistributionRecord[]> => {
  return apiFetch<DistributionRecord[]>(
    `/document-control/documents/${documentId}/distributions`
  );
};

export const distributeDocument = async (
  documentId: string,
  data: {
    recipients: {
      id: string;
      name: string;
      email?: string;
      company?: string;
      role?: string;
    }[];
    distributionMethod: DistributionMethod;
    transmittalNumber?: string;
    notes?: string;
  }
): Promise<DistributionRecord[]> => {
  return apiFetch<DistributionRecord[]>(
    `/document-control/documents/${documentId}/distribute`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const acknowledgeDistribution = async (
  distributionId: string,
  data: {
    acknowledgementBy: string;
    comments?: string;
  }
): Promise<DistributionRecord> => {
  return apiFetch<DistributionRecord>(
    `/document-control/distributions/${distributionId}/acknowledge`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

// ============================================================================
// Transmittals
// ============================================================================

export const getDocumentTransmittals = async (
  projectId?: string
): Promise<DocumentTransmittal[]> => {
  const queryParams = projectId ? `?projectId=${projectId}` : '';
  return apiFetch<DocumentTransmittal[]>(
    `/document-control/transmittals${queryParams}`
  );
};

export const getDocumentTransmittal = async (
  id: string
): Promise<DocumentTransmittal> => {
  return apiFetch<DocumentTransmittal>(`/document-control/transmittals/${id}`);
};

export const createDocumentTransmittal = async (
  data: Partial<DocumentTransmittal>
): Promise<DocumentTransmittal> => {
  return apiFetch<DocumentTransmittal>('/document-control/transmittals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const sendTransmittal = async (
  transmittalId: string,
  data: {
    deliveryMethod: DistributionMethod;
    sendDate?: string;
  }
): Promise<DocumentTransmittal> => {
  return apiFetch<DocumentTransmittal>(
    `/document-control/transmittals/${transmittalId}/send`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

export const acknowledgeTransmittal = async (
  transmittalId: string,
  data: {
    acknowledgedBy: string;
    comments?: string;
  }
): Promise<DocumentTransmittal> => {
  return apiFetch<DocumentTransmittal>(
    `/document-control/transmittals/${transmittalId}/acknowledge`,
    { method: 'POST', body: JSON.stringify(data) }
  );
};

// ============================================================================
// Analytics
// ============================================================================

export const getDocumentRegister = async (
  projectId: string
): Promise<DocumentRegister> => {
  return apiFetch<DocumentRegister>(
    `/document-control/register/${projectId}`
  );
};

export const getDocumentControlSummary = async (
  projectId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<DocumentControlSummary> => {
  const queryParams = new URLSearchParams();
  if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
  if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);
  
  return apiFetch<DocumentControlSummary>(
    `/document-control/summary/${projectId}?${queryParams}`
  );
};

export const getDocumentControlAnalytics = async (
  projectId: string,
  period: string = 'month'
): Promise<DocumentControlAnalytics> => {
  return apiFetch<DocumentControlAnalytics>(
    `/document-control/analytics/${projectId}?period=${period}`
  );
};

// ============================================================================
// Exports
// ============================================================================

export const exportDocumentRegister = async (
  projectId: string,
  options?: Partial<DocumentExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/document-control/export/register', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...options }),
  });
};

export const exportDocuments = async (
  documentIds: string[],
  options?: Partial<DocumentExportOptions>
): Promise<Blob> => {
  return apiFetch<Blob>('/document-control/export/documents', {
    method: 'POST',
    body: JSON.stringify({ documentIds, ...options }),
  });
};

export const exportTransmittals = async (
  projectId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<Blob> => {
  return apiFetch<Blob>('/document-control/export/transmittals', {
    method: 'POST',
    body: JSON.stringify({ projectId, ...dateRange }),
  });
};
