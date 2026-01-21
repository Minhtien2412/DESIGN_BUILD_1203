/**
 * Document Management Service
 * Handle project documents, drawings, specs, permits, contracts, photos
 */

import { BaseApiService } from './base.service';
import type { ApiResponse, PaginatedResponse } from './types';

// ==================== TYPES ====================

export type DocumentCategory = 
  | 'DRAWING'
  | 'SPECIFICATION'
  | 'PERMIT'
  | 'CONTRACT'
  | 'PHOTO'
  | 'REPORT'
  | 'INVOICE'
  | 'CERTIFICATE'
  | 'OTHER';

export type DocumentStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface Document {
  id: number;
  projectId: number;
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: string; // MIME type
  version: number;
  tags: string[];
  uploadedBy: number;
  uploadedByName?: string;
  uploadedAt: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  folderId?: number;
  parentDocumentId?: number; // For versions
  metadata?: Record<string, any>;
}

export interface DocumentFolder {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  parentId?: number;
  path: string; // Full path like "/Drawings/Structural"
  documentCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  version: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  changes: string;
  uploadedBy: number;
  uploadedByName?: string;
  uploadedAt: string;
}

export interface DocumentComment {
  id: number;
  documentId: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentShare {
  id: number;
  documentId: number;
  sharedWith: number;
  sharedWithName?: string;
  sharedBy: number;
  sharedByName?: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
  expiresAt?: string;
  createdAt: string;
}

export interface CreateDocumentData {
  projectId: number;
  name: string;
  category: DocumentCategory;
  description?: string;
  file: File | Blob;
  folderId?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateDocumentData {
  name?: string;
  category?: DocumentCategory;
  description?: string;
  status?: DocumentStatus;
  tags?: string[];
  folderId?: number;
  metadata?: Record<string, any>;
}

export interface DocumentFilters {
  projectId?: number;
  category?: DocumentCategory;
  status?: DocumentStatus;
  folderId?: number;
  tags?: string[];
  search?: string;
  uploadedBy?: number;
  uploadedAfter?: string;
  uploadedBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'uploadedAt' | 'size' | 'version';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFolderData {
  projectId: number;
  name: string;
  description?: string;
  parentId?: number;
}

export interface UpdateFolderData {
  name?: string;
  description?: string;
  parentId?: number;
}

export interface UploadVersionData {
  documentId: number;
  file: File | Blob;
  changes: string;
}

export interface AddCommentData {
  documentId: number;
  comment: string;
}

export interface ShareDocumentData {
  documentId: number;
  sharedWith: number;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
  expiresAt?: string;
}

// ==================== SERVICE ====================

class DocumentManagementService extends BaseApiService {
  constructor() {
    super('DocumentManagement', {
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      },
      cache: {
        enabled: true,
        ttl: 3 * 60 * 1000, // 3 minutes for document lists
      },
      offlineSupport: true,
    });
  }

  // ==================== DOCUMENTS ====================

  /**
   * Get all documents with filters
   */
  async getDocuments(filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    return this.get<PaginatedResponse<Document>>('/documents', filters as any, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get document by ID
   */
  async getDocument(id: number): Promise<ApiResponse<Document>> {
    return this.get<ApiResponse<Document>>(`/documents/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Upload new document
   */
  async uploadDocument(data: CreateDocumentData): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', data.file as any);
    formData.append('projectId', data.projectId.toString());
    formData.append('name', data.name);
    formData.append('category', data.category);
    
    if (data.description) formData.append('description', data.description);
    if (data.folderId) formData.append('folderId', data.folderId.toString());
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const result = await this.post<ApiResponse<Document>>('/documents', formData, {
      offlineQueue: false, // Don't queue file uploads
    });

    // Invalidate cache
    await this.invalidateCache('/documents');

    return result;
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: number, data: UpdateDocumentData): Promise<ApiResponse<Document>> {
    const result = await this.put<ApiResponse<Document>>(`/documents/${id}`, data, {
      offlineQueue: true,
    });

    // Invalidate cache
    await this.invalidateCache('/documents');
    await this.invalidateCache(`/documents/${id}`);

    return result;
  }

  /**
   * Delete document
   */
  async deleteDocument(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/documents/${id}`, {
      offlineQueue: true,
    });

    // Invalidate cache
    await this.invalidateCache('/documents');

    return result;
  }

  /**
   * Approve document
   */
  async approveDocument(id: number): Promise<ApiResponse<Document>> {
    const result = await this.post<ApiResponse<Document>>(`/documents/${id}/approve`, undefined, {
      offlineQueue: true,
    });

    await this.invalidateCache('/documents');
    await this.invalidateCache(`/documents/${id}`);

    return result;
  }

  /**
   * Reject document
   */
  async rejectDocument(id: number, reason: string): Promise<ApiResponse<Document>> {
    const result = await this.post<ApiResponse<Document>>(`/documents/${id}/reject`, { reason }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/documents');
    await this.invalidateCache(`/documents/${id}`);

    return result;
  }

  // ==================== FOLDERS ====================

  /**
   * Get folders for project
   */
  async getFolders(projectId: number): Promise<ApiResponse<DocumentFolder[]>> {
    return this.get<ApiResponse<DocumentFolder[]>>('/documents/folders', { projectId }, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get folder by ID
   */
  async getFolder(id: number): Promise<ApiResponse<DocumentFolder>> {
    return this.get<ApiResponse<DocumentFolder>>(`/documents/folders/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Create folder
   */
  async createFolder(data: CreateFolderData): Promise<ApiResponse<DocumentFolder>> {
    const result = await this.post<ApiResponse<DocumentFolder>>('/documents/folders', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/documents/folders');

    return result;
  }

  /**
   * Update folder
   */
  async updateFolder(id: number, data: UpdateFolderData): Promise<ApiResponse<DocumentFolder>> {
    const result = await this.put<ApiResponse<DocumentFolder>>(`/documents/folders/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/documents/folders');
    await this.invalidateCache(`/documents/folders/${id}`);

    return result;
  }

  /**
   * Delete folder
   */
  async deleteFolder(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/documents/folders/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/documents/folders');

    return result;
  }

  // ==================== VERSIONS ====================

  /**
   * Get document versions
   */
  async getVersions(documentId: number): Promise<ApiResponse<DocumentVersion[]>> {
    return this.get<ApiResponse<DocumentVersion[]>>(`/documents/${documentId}/versions`, undefined, {
      cache: true,
    });
  }

  /**
   * Upload new version
   */
  async uploadVersion(data: UploadVersionData): Promise<ApiResponse<DocumentVersion>> {
    const formData = new FormData();
    formData.append('file', data.file as any);
    formData.append('changes', data.changes);

    const result = await this.post<ApiResponse<DocumentVersion>>(
      `/documents/${data.documentId}/versions`,
      formData,
      { offlineQueue: false }
    );

    await this.invalidateCache(`/documents/${data.documentId}`);
    await this.invalidateCache(`/documents/${data.documentId}/versions`);

    return result;
  }

  // ==================== COMMENTS ====================

  /**
   * Get document comments
   */
  async getComments(documentId: number): Promise<ApiResponse<DocumentComment[]>> {
    return this.get<ApiResponse<DocumentComment[]>>(`/documents/${documentId}/comments`, undefined, {
      cache: false, // Don't cache comments (real-time)
    });
  }

  /**
   * Add comment
   */
  async addComment(data: AddCommentData): Promise<ApiResponse<DocumentComment>> {
    return this.post<ApiResponse<DocumentComment>>(
      `/documents/${data.documentId}/comments`,
      { comment: data.comment },
      { offlineQueue: true }
    );
  }

  /**
   * Update comment
   */
  async updateComment(documentId: number, commentId: number, comment: string): Promise<ApiResponse<DocumentComment>> {
    return this.put<ApiResponse<DocumentComment>>(
      `/documents/${documentId}/comments/${commentId}`,
      { comment },
      { offlineQueue: true }
    );
  }

  /**
   * Delete comment
   */
  async deleteComment(documentId: number, commentId: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/documents/${documentId}/comments/${commentId}`,
      { offlineQueue: true }
    );
  }

  // ==================== SHARING ====================

  /**
   * Get document shares
   */
  async getShares(documentId: number): Promise<ApiResponse<DocumentShare[]>> {
    return this.get<ApiResponse<DocumentShare[]>>(`/documents/${documentId}/shares`);
  }

  /**
   * Share document
   */
  async shareDocument(data: ShareDocumentData): Promise<ApiResponse<DocumentShare>> {
    return this.post<ApiResponse<DocumentShare>>(
      `/documents/${data.documentId}/shares`,
      {
        sharedWith: data.sharedWith,
        permission: data.permission,
        expiresAt: data.expiresAt,
      },
      { offlineQueue: true }
    );
  }

  /**
   * Revoke share
   */
  async revokeShare(documentId: number, shareId: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/documents/${documentId}/shares/${shareId}`,
      { offlineQueue: true }
    );
  }

  // ==================== SEARCH & FILTER ====================

  /**
   * Search documents
   */
  async searchDocuments(query: string, filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    return this.get<PaginatedResponse<Document>>('/documents/search', {
      ...filters,
      q: query,
    } as any, {
      deduplicate: true,
    });
  }

  /**
   * Get documents by tag
   */
  async getDocumentsByTag(tag: string, projectId?: number): Promise<ApiResponse<Document[]>> {
    return this.get<ApiResponse<Document[]>>('/documents/by-tag', {
      tag,
      projectId,
    } as any, {
      cache: true,
    });
  }

  /**
   * Get all tags for project
   */
  async getTags(projectId: number): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>('/documents/tags', { projectId }, {
      cache: true,
    });
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk upload documents
   */
  async bulkUpload(files: { file: File | Blob; data: Omit<CreateDocumentData, 'file'> }[]): Promise<ApiResponse<Document[]>> {
    const formData = new FormData();
    
    files.forEach((item, index) => {
      formData.append(`files[${index}]`, item.file as any);
      formData.append(`data[${index}]`, JSON.stringify(item.data));
    });

    const result = await this.post<ApiResponse<Document[]>>('/documents/bulk-upload', formData, {
      offlineQueue: false,
    });

    await this.invalidateCache('/documents');

    return result;
  }

  /**
   * Bulk delete documents
   */
  async bulkDelete(documentIds: number[]): Promise<ApiResponse<void>> {
    const result = await this.post<ApiResponse<void>>('/documents/bulk-delete', { documentIds }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/documents');

    return result;
  }

  /**
   * Move documents to folder
   */
  async moveToFolder(documentIds: number[], folderId: number): Promise<ApiResponse<void>> {
    const result = await this.post<ApiResponse<void>>('/documents/move', {
      documentIds,
      folderId,
    }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/documents');

    return result;
  }
}

// Export singleton instance
export const documentService = new DocumentManagementService();
export default documentService;
