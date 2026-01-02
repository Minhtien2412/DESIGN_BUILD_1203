/**
 * Document Control Hooks
 * State management for document control and version management
 */

import * as DocumentControlService from '@/services/document-control';
import type {
    ControlledDocument,
    DistributionMethod,
    DistributionRecord,
    DocumentControlAnalytics,
    DocumentControlSummary,
    DocumentRegister,
    DocumentReview,
    DocumentRevision,
    DocumentSearchFilters,
    DocumentTransmittal,
    ReviewDecision,
    ReviewType,
} from '@/types/document-control';
import { useEffect, useState } from 'react';

// ============================================================================
// Controlled Documents
// ============================================================================

export const useControlledDocuments = (filters?: DocumentSearchFilters) => {
  const [documents, setDocuments] = useState<ControlledDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DocumentControlService.getControlledDocuments(filters);
      setDocuments(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [
    filters?.projectId,
    filters?.category,
    filters?.status,
    filters?.accessLevel,
    filters?.search,
  ]);

  const createDocument = async (data: Partial<ControlledDocument>) => {
    try {
      setError(null);
      const newDocument = await DocumentControlService.createControlledDocument(data);
      setDocuments((prev) => [newDocument, ...prev]);
      return newDocument;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateDocument = async (id: string, data: Partial<ControlledDocument>) => {
    try {
      setError(null);
      const updated = await DocumentControlService.updateControlledDocument(id, data);
      setDocuments((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setError(null);
      await DocumentControlService.deleteControlledDocument(id);
      setDocuments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const uploadFile = async (
    documentId: string,
    file: File,
    metadata?: { pageCount?: number; description?: string }
  ) => {
    try {
      setError(null);
      const result = await DocumentControlService.uploadDocumentFile(
        documentId,
        file,
        metadata
      );
      const updated = await DocumentControlService.getControlledDocument(documentId);
      setDocuments((prev) =>
        prev.map((item) => (item.id === documentId ? updated : item))
      );
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const submitForReview = async (
    documentId: string,
    reviewData: {
      reviewers: {
        id: string;
        name: string;
        role: string;
        reviewType: ReviewType;
      }[];
      dueDate?: string;
      comments?: string;
    }
  ) => {
    try {
      setError(null);
      const updated = await DocumentControlService.submitForReview(
        documentId,
        reviewData
      );
      setDocuments((prev) =>
        prev.map((item) => (item.id === documentId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const approveDocument = async (
    documentId: string,
    approvalData: {
      approvedBy: { id: string; name: string; role?: string };
      comments?: string;
    }
  ) => {
    try {
      setError(null);
      const updated = await DocumentControlService.approveDocument(
        documentId,
        approvalData
      );
      setDocuments((prev) =>
        prev.map((item) => (item.id === documentId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const issueDocument = async (
    documentId: string,
    issueData: {
      issuedDate: string;
      effectiveDate?: string;
      distributionList?: string[];
    }
  ) => {
    try {
      setError(null);
      const updated = await DocumentControlService.issueDocument(
        documentId,
        issueData
      );
      setDocuments((prev) =>
        prev.map((item) => (item.id === documentId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    refresh: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
    submitForReview,
    approveDocument,
    issueDocument,
  };
};

// ============================================================================
// Single Controlled Document
// ============================================================================

export const useControlledDocument = (id?: string) => {
  const [document, setDocument] = useState<ControlledDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocument = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentControlService.getControlledDocument(id);
      setDocument(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  return {
    document,
    loading,
    error,
    refresh: fetchDocument,
  };
};

// ============================================================================
// Document Revisions
// ============================================================================

export const useDocumentRevisions = (documentId?: string) => {
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRevisions = async () => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentControlService.getDocumentRevisions(documentId);
      setRevisions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, [documentId]);

  const createRevision = async (data: Partial<DocumentRevision>) => {
    if (!documentId) return;
    try {
      setError(null);
      const newRevision = await DocumentControlService.createDocumentRevision(
        documentId,
        data
      );
      setRevisions((prev) => [newRevision, ...prev]);
      return newRevision;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const approveRevision = async (
    revisionId: string,
    approvalData: {
      approvedBy: { id: string; name: string; role?: string };
      comments?: string;
    }
  ) => {
    if (!documentId) return;
    try {
      setError(null);
      const updated = await DocumentControlService.approveDocumentRevision(
        documentId,
        revisionId,
        approvalData
      );
      setRevisions((prev) =>
        prev.map((item) => (item.id === revisionId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    revisions,
    loading,
    error,
    refresh: fetchRevisions,
    createRevision,
    approveRevision,
  };
};

// ============================================================================
// Document Reviews
// ============================================================================

export const useDocumentReviews = (documentId?: string) => {
  const [reviews, setReviews] = useState<DocumentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = async () => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentControlService.getDocumentReviews(documentId);
      setReviews(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [documentId]);

  const createReview = async (data: Partial<DocumentReview>) => {
    if (!documentId) return;
    try {
      setError(null);
      const newReview = await DocumentControlService.createDocumentReview(
        documentId,
        data
      );
      setReviews((prev) => [newReview, ...prev]);
      return newReview;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateReview = async (
    reviewId: string,
    data: Partial<DocumentReview>
  ) => {
    if (!documentId) return;
    try {
      setError(null);
      const updated = await DocumentControlService.updateDocumentReview(
        documentId,
        reviewId,
        data
      );
      setReviews((prev) =>
        prev.map((item) => (item.id === reviewId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const completeReview = async (
    reviewId: string,
    completionData: {
      decision: ReviewDecision;
      overallComments?: string;
      conditions?: string[];
      actionItems?: string[];
    }
  ) => {
    if (!documentId) return;
    try {
      setError(null);
      const updated = await DocumentControlService.completeDocumentReview(
        documentId,
        reviewId,
        completionData
      );
      setReviews((prev) =>
        prev.map((item) => (item.id === reviewId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const submitResponse = async (
    reviewId: string,
    responseData: {
      response: string;
      responseBy: { id: string; name: string };
    }
  ) => {
    if (!documentId) return;
    try {
      setError(null);
      const updated = await DocumentControlService.submitReviewResponse(
        documentId,
        reviewId,
        responseData
      );
      setReviews((prev) =>
        prev.map((item) => (item.id === reviewId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    refresh: fetchReviews,
    createReview,
    updateReview,
    completeReview,
    submitResponse,
  };
};

// ============================================================================
// Distribution Records
// ============================================================================

export const useDistributionRecords = (documentId?: string) => {
  const [distributions, setDistributions] = useState<DistributionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDistributions = async () => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DocumentControlService.getDistributionRecords(documentId);
      setDistributions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, [documentId]);

  const distributeDocument = async (distributionData: {
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
  }) => {
    if (!documentId) return;
    try {
      setError(null);
      const newDistributions = await DocumentControlService.distributeDocument(
        documentId,
        distributionData
      );
      setDistributions((prev) => [...newDistributions, ...prev]);
      return newDistributions;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    distributions,
    loading,
    error,
    refresh: fetchDistributions,
    distributeDocument,
  };
};

// ============================================================================
// Transmittals
// ============================================================================

export const useDocumentTransmittals = (projectId?: string) => {
  const [transmittals, setTransmittals] = useState<DocumentTransmittal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransmittals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DocumentControlService.getDocumentTransmittals(projectId);
      setTransmittals(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransmittals();
  }, [projectId]);

  const createTransmittal = async (data: Partial<DocumentTransmittal>) => {
    try {
      setError(null);
      const newTransmittal = await DocumentControlService.createDocumentTransmittal(data);
      setTransmittals((prev) => [newTransmittal, ...prev]);
      return newTransmittal;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const sendTransmittal = async (
    transmittalId: string,
    sendData: {
      deliveryMethod: DistributionMethod;
      sendDate?: string;
    }
  ) => {
    try {
      setError(null);
      const updated = await DocumentControlService.sendTransmittal(
        transmittalId,
        sendData
      );
      setTransmittals((prev) =>
        prev.map((item) => (item.id === transmittalId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    transmittals,
    loading,
    error,
    refresh: fetchTransmittals,
    createTransmittal,
    sendTransmittal,
  };
};

// ============================================================================
// Analytics
// ============================================================================

export const useDocumentRegister = (projectId?: string) => {
  const [register, setRegister] = useState<DocumentRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchRegister = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DocumentControlService.getDocumentRegister(projectId);
        setRegister(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegister();
  }, [projectId]);

  return { register, loading, error };
};

export const useDocumentControlSummary = (
  projectId?: string,
  dateRange?: { startDate: string; endDate: string }
) => {
  const [summary, setSummary] = useState<DocumentControlSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DocumentControlService.getDocumentControlSummary(
          projectId,
          dateRange
        );
        setSummary(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [projectId, dateRange?.startDate, dateRange?.endDate]);

  return { summary, loading, error };
};

export const useDocumentControlAnalytics = (
  projectId?: string,
  period: string = 'month'
) => {
  const [analytics, setAnalytics] = useState<DocumentControlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DocumentControlService.getDocumentControlAnalytics(
          projectId,
          period
        );
        setAnalytics(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId, period]);

  return { analytics, loading, error };
};
