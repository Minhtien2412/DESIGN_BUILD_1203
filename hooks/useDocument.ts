/**
 * Document Management Hooks
 * 
 * Custom React hooks for document operations with
 * state management and optimistic updates
 */

import * as documentService from '@/services/document';
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
import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// Document Hooks
// ============================================================================

export const useDocuments = (
  projectId: string,
  filters?: Partial<DocumentSearchFilters>
) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocuments(projectId, filters);
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(
    async (data: UploadDocumentRequest) => {
      const newDoc = await documentService.uploadDocument(data);
      setDocuments((prev) => [newDoc, ...prev]);
      return newDoc;
    },
    []
  );

  const updateDocument = useCallback(
    async (id: string, data: UpdateDocumentRequest) => {
      const updated = await documentService.updateDocument(id, data);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? updated : doc))
      );
      return updated;
    },
    []
  );

  const deleteDocument = useCallback(async (id: string) => {
    await documentService.deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const moveDocument = useCallback(
    async (documentId: string, folderId: string | null) => {
      const updated = await documentService.moveDocumentToFolder(
        documentId,
        folderId
      );
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? updated : doc))
      );
      return updated;
    },
    []
  );

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    moveDocument,
  };
};

export const useDocument = (projectId: string, id: string) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocument(id);
        setDocument(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const deleteDocument = async () => {
    try {
      await documentService.deleteDocument(id);
      setDocument(null);
    } catch (err) {
      throw err;
    }
  };

  return { document, loading, error, deleteDocument };
};

// ============================================================================
// Folder Hooks
// ============================================================================

export const useFolders = (projectId: string) => {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getFolders(projectId);
      setFolders(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = useCallback(async (data: CreateFolderRequest) => {
    const newFolder = await documentService.createFolder(data);
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  }, []);

  const updateFolder = useCallback(
    async (id: string, data: Partial<CreateFolderRequest>) => {
      const updated = await documentService.updateFolder(id, data);
      setFolders((prev) =>
        prev.map((folder) => (folder.id === id ? updated : folder))
      );
      return updated;
    },
    []
  );

  const deleteFolder = useCallback(async (id: string) => {
    await documentService.deleteFolder(id);
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
  }, []);

  return {
    folders,
    loading,
    error,
    refetch: fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
};

// ============================================================================
// Sharing Hooks
// ============================================================================

export const useDocumentShares = (projectId: string, documentId: string) => {
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShares = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocumentShares(documentId);
      setShares(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const createShare = useCallback(async (data: ShareDocumentRequest) => {
    const newShare = await documentService.createShare(data);
    setShares((prev) => [...prev, newShare]);
    return newShare;
  }, []);

  const updateShare = useCallback(
    async (shareId: string, data: Partial<ShareDocumentRequest>) => {
      const updated = await documentService.updateShare(shareId, data);
      setShares((prev) =>
        prev.map((share) => (share.id === shareId ? updated : share))
      );
      return updated;
    },
    []
  );

  const deleteShare = useCallback(async (shareId: string) => {
    await documentService.deleteShare(shareId);
    setShares((prev) => prev.filter((share) => share.id !== shareId));
  }, []);

  return {
    shares,
    loading,
    error,
    refetch: fetchShares,
    createShare,
    updateShare,
    deleteShare,
  };
};

export const useSharedWithMe = (projectId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSharedDocs = async () => {
      try {
        setLoading(true);
        const data = await documentService.getSharedWithMe(projectId);
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDocs();
  }, [projectId]);

  return { documents, loading, error };
};

// ============================================================================
// Version Control Hooks
// ============================================================================

export const useDocumentVersions = (projectId: string, documentId: string) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocumentVersions(documentId);
      setVersions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const createVersion = useCallback(async (data: CreateVersionRequest) => {
    const newDoc = await documentService.createVersion(data);
    await fetchVersions(); // Refresh version list
    return newDoc;
  }, [fetchVersions]);

  const restoreVersion = useCallback(
    async (versionId: string) => {
      const restored = await documentService.restoreVersion(
        documentId,
        versionId
      );
      await fetchVersions();
      return restored;
    },
    [documentId, fetchVersions]
  );

  return {
    versions,
    loading,
    error,
    refetch: fetchVersions,
    createVersion,
    restoreVersion,
  };
};

// ============================================================================
// Review & Approval Hooks
// ============================================================================

export const usePendingReviews = (projectId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPendingReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getPendingReviews(projectId);
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  const reviewDocument = useCallback(
    async (data: ReviewDocumentRequest) => {
      const updated = await documentService.reviewDocument(data);
      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== data.documentId)
      );
      return updated;
    },
    []
  );

  return {
    documents,
    loading,
    error,
    refetch: fetchPendingReviews,
    reviewDocument,
  };
};

// ============================================================================
// Comments Hooks
// ============================================================================

export const useDocumentComments = (projectId: string, documentId: string) => {
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocumentComments(documentId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(async (data: AddCommentRequest) => {
    const newComment = await documentService.addComment(data);
    setComments((prev) => [...prev, newComment]);
    return newComment;
  }, []);

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      const updated = await documentService.updateComment(commentId, content);
      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? updated : comment))
      );
      return updated;
    },
    []
  );

  const deleteComment = useCallback(async (commentId: string) => {
    await documentService.deleteComment(commentId);
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  }, []);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
};

// ============================================================================
// Activity Hooks
// ============================================================================

export const useDocumentActivity = (projectId: string, documentId: string) => {
  const [activities, setActivities] = useState<DocumentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocumentActivity(documentId);
        setActivities(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [documentId]);

  return { activities, loading, error };
};

export const useProjectActivity = (projectId: string, limit?: number) => {
  const [activities, setActivities] = useState<DocumentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await documentService.getProjectActivity(projectId, limit);
        setActivities(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [projectId, limit]);

  return { activities, loading, error };
};

// ============================================================================
// Analytics Hooks
// ============================================================================

export const useDocumentSummary = (projectId: string) => {
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocumentSummary(projectId);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [projectId]);

  return { summary, loading, error };
};

export const useStorageStats = (projectId: string) => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await documentService.getStorageStats(projectId);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId]);

  return { stats, loading, error };
};

export const useRecentDocuments = (projectId: string, limit: number = 10) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        const data = await documentService.getRecentDocuments(projectId, limit);
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [projectId, limit]);

  return { documents, loading, error };
};
