/**
 * Document Management Service
 * 
 * API service layer for document operations including
 * upload, organization, sharing, and version control
 */

import type {
    AddCommentRequest,
    CreateFolderRequest,
    CreateVersionRequest,
    Document,
    DocumentActivity,
    DocumentComment,
    DocumentFolder,
    DocumentSearchFilters,
    DocumentShare,
    DocumentSummary,
    DocumentVersion,
    ReviewDocumentRequest,
    ShareDocumentRequest,
    StorageStats,
    UpdateDocumentRequest,
    UploadDocumentRequest,
} from '@/types/document';
import { apiFetch } from './api';

const BASE_URL = '/documents';

// ============================================================================
// Document Operations
// ============================================================================

export const getDocuments = async (
  projectId: string,
  filters?: Partial<DocumentSearchFilters>
): Promise<Document[]> => {
  const params = new URLSearchParams({ projectId });
  
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.fileType) params.append('fileType', filters.fileType);
  if (filters?.uploadedBy) params.append('uploadedBy', filters.uploadedBy);
  if (filters?.folderId) params.append('folderId', filters.folderId);
  if (filters?.searchTerm) params.append('search', filters.searchTerm);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
  
  return apiFetch(`${BASE_URL}?${params}`);
};

export const getDocument = async (id: string): Promise<Document> => {
  return apiFetch(`${BASE_URL}/${id}`);
};

export const uploadDocument = async (
  data: UploadDocumentRequest
): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('projectId', data.projectId);
  formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  formData.append('category', data.category);
  if (data.accessLevel) formData.append('accessLevel', data.accessLevel);
  if (data.folderId) formData.append('folderId', data.folderId);
  if (data.tags?.length) formData.append('tags', JSON.stringify(data.tags));
  
  return apiFetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header for FormData, browser will set it with boundary
  });
};

export const updateDocument = async (
  id: string,
  data: UpdateDocumentRequest
): Promise<Document> => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteDocument = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};

export const downloadDocument = async (id: string): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/${id}/download`, {
    method: 'GET',
  });
};

export const restoreDocument = async (id: string): Promise<Document> => {
  return apiFetch(`${BASE_URL}/${id}/restore`, {
    method: 'POST',
  });
};

// ============================================================================
// Folder Operations
// ============================================================================

export const getFolders = async (projectId: string): Promise<DocumentFolder[]> => {
  return apiFetch(`${BASE_URL}/folders?projectId=${projectId}`);
};

export const getFolder = async (id: string): Promise<DocumentFolder> => {
  return apiFetch(`${BASE_URL}/folders/${id}`);
};

export const createFolder = async (
  data: CreateFolderRequest
): Promise<DocumentFolder> => {
  return apiFetch(`${BASE_URL}/folders`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateFolder = async (
  id: string,
  data: Partial<CreateFolderRequest>
): Promise<DocumentFolder> => {
  return apiFetch(`${BASE_URL}/folders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteFolder = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/folders/${id}`, {
    method: 'DELETE',
  });
};

export const moveDocumentToFolder = async (
  documentId: string,
  folderId: string | null
): Promise<Document> => {
  return apiFetch(`${BASE_URL}/${documentId}/move`, {
    method: 'POST',
    body: JSON.stringify({ folderId }),
  });
};

// ============================================================================
// Sharing Operations
// ============================================================================

export const getDocumentShares = async (
  documentId: string
): Promise<DocumentShare[]> => {
  return apiFetch(`${BASE_URL}/${documentId}/shares`);
};

export const createShare = async (
  data: ShareDocumentRequest
): Promise<DocumentShare> => {
  return apiFetch(`${BASE_URL}/${data.documentId}/shares`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateShare = async (
  shareId: string,
  data: Partial<ShareDocumentRequest>
): Promise<DocumentShare> => {
  return apiFetch(`${BASE_URL}/shares/${shareId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteShare = async (shareId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/shares/${shareId}`, {
    method: 'DELETE',
  });
};

export const getSharedWithMe = async (projectId: string): Promise<Document[]> => {
  return apiFetch(`${BASE_URL}/shared-with-me?projectId=${projectId}`);
};

// ============================================================================
// Version Control
// ============================================================================

export const getDocumentVersions = async (
  documentId: string
): Promise<DocumentVersion[]> => {
  return apiFetch(`${BASE_URL}/${documentId}/versions`);
};

export const createVersion = async (
  data: CreateVersionRequest
): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.versionLabel) formData.append('versionLabel', data.versionLabel);
  if (data.changes) formData.append('changes', data.changes);
  
  return apiFetch(`${BASE_URL}/${data.documentId}/versions`, {
    method: 'POST',
    body: formData,
  });
};

export const restoreVersion = async (
  documentId: string,
  versionId: string
): Promise<Document> => {
  return apiFetch(`${BASE_URL}/${documentId}/versions/${versionId}/restore`, {
    method: 'POST',
  });
};

export const compareVersions = async (
  documentId: string,
  versionId1: string,
  versionId2: string
): Promise<any> => {
  return apiFetch(
    `${BASE_URL}/${documentId}/versions/compare?v1=${versionId1}&v2=${versionId2}`
  );
};

// ============================================================================
// Review & Approval
// ============================================================================

export const reviewDocument = async (
  data: ReviewDocumentRequest
): Promise<Document> => {
  return apiFetch(`${BASE_URL}/${data.documentId}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getPendingReviews = async (
  projectId: string
): Promise<Document[]> => {
  return apiFetch(`${BASE_URL}/pending-reviews?projectId=${projectId}`);
};

export const assignReviewers = async (
  documentId: string,
  reviewerIds: string[]
): Promise<Document> => {
  return apiFetch(`${BASE_URL}/${documentId}/reviewers`, {
    method: 'POST',
    body: JSON.stringify({ reviewerIds }),
  });
};

// ============================================================================
// Comments & Annotations
// ============================================================================

export const getDocumentComments = async (
  documentId: string
): Promise<DocumentComment[]> => {
  return apiFetch(`${BASE_URL}/${documentId}/comments`);
};

export const addComment = async (
  data: AddCommentRequest
): Promise<DocumentComment> => {
  return apiFetch(`${BASE_URL}/${data.documentId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateComment = async (
  commentId: string,
  content: string
): Promise<DocumentComment> => {
  return apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
};

export const deleteComment = async (commentId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
  });
};

// ============================================================================
// Activity & Audit
// ============================================================================

export const getDocumentActivity = async (
  documentId: string
): Promise<DocumentActivity[]> => {
  return apiFetch(`${BASE_URL}/${documentId}/activity`);
};

export const getProjectActivity = async (
  projectId: string,
  limit?: number
): Promise<DocumentActivity[]> => {
  const params = new URLSearchParams({ projectId });
  if (limit) params.append('limit', limit.toString());
  
  return apiFetch(`${BASE_URL}/activity?${params}`);
};

// ============================================================================
// Analytics & Summary
// ============================================================================

export const getDocumentSummary = async (
  projectId: string
): Promise<DocumentSummary> => {
  return apiFetch(`${BASE_URL}/summary?projectId=${projectId}`);
};

export const getStorageStats = async (
  projectId: string
): Promise<StorageStats> => {
  return apiFetch(`${BASE_URL}/storage-stats?projectId=${projectId}`);
};

export const getRecentDocuments = async (
  projectId: string,
  limit: number = 10
): Promise<Document[]> => {
  return apiFetch(`${BASE_URL}/recent?projectId=${projectId}&limit=${limit}`);
};

export const searchDocuments = async (
  filters: DocumentSearchFilters
): Promise<Document[]> => {
  return apiFetch(`${BASE_URL}/search`, {
    method: 'POST',
    body: JSON.stringify(filters),
  });
};

// ============================================================================
// Bulk Operations
// ============================================================================

export const bulkDownload = async (documentIds: string[]): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/bulk-download`, {
    method: 'POST',
    body: JSON.stringify({ documentIds }),
  });
};

export const bulkDelete = async (documentIds: string[]): Promise<void> => {
  return apiFetch(`${BASE_URL}/bulk-delete`, {
    method: 'POST',
    body: JSON.stringify({ documentIds }),
  });
};

export const bulkMove = async (
  documentIds: string[],
  folderId: string | null
): Promise<Document[]> => {
  return apiFetch(`${BASE_URL}/bulk-move`, {
    method: 'POST',
    body: JSON.stringify({ documentIds, folderId }),
  });
};

export const bulkUpdateCategory = async (
  documentIds: string[],
  category: string
): Promise<Document[]> => {
  return apiFetch(`${BASE_URL}/bulk-update-category`, {
    method: 'POST',
    body: JSON.stringify({ documentIds, category }),
  });
};

// ============================================================================
// Export Operations
// ============================================================================

export const exportDocumentList = async (
  projectId: string,
  format: 'csv' | 'xlsx' | 'pdf' = 'xlsx'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/export?projectId=${projectId}&format=${format}`);
};

export const exportActivityLog = async (
  projectId: string,
  format: 'csv' | 'xlsx' | 'pdf' = 'xlsx'
): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/export-activity?projectId=${projectId}&format=${format}`);
};
