/**
 * As-Built Documentation Hooks
 * State management for as-built drawings and redlines
 */

import * as AsBuiltService from '@/services/as-built';
import type {
    AsBuiltAnalytics,
    AsBuiltDrawing,
    AsBuiltSummary,
    DrawingPackage,
    DrawingRegister,
    DrawingReview,
    DrawingRevision,
    DrawingStatus,
    DrawingType,
    MarkupType,
    Redline,
} from '@/types/as-built';
import { useEffect, useState } from 'react';

// ============================================================================
// As-Built Drawings
// ============================================================================

export const useAsBuiltDrawings = (filters?: {
  projectId?: string;
  drawingType?: DrawingType;
  status?: DrawingStatus;
  search?: string;
}) => {
  const [drawings, setDrawings] = useState<AsBuiltDrawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AsBuiltService.getAsBuiltDrawings(filters);
      setDrawings(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawings();
  }, [
    filters?.projectId,
    filters?.drawingType,
    filters?.status,
    filters?.search,
  ]);

  const createDrawing = async (data: Partial<AsBuiltDrawing>) => {
    try {
      setError(null);
      const newDrawing = await AsBuiltService.createAsBuiltDrawing(data);
      setDrawings((prev) => [newDrawing, ...prev]);
      return newDrawing;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateDrawing = async (id: string, data: Partial<AsBuiltDrawing>) => {
    try {
      setError(null);
      const updated = await AsBuiltService.updateAsBuiltDrawing(id, data);
      setDrawings((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteDrawing = async (id: string) => {
    try {
      setError(null);
      await AsBuiltService.deleteAsBuiltDrawing(id);
      setDrawings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const uploadFile = async (
    drawingId: string,
    file: File,
    metadata?: {
      fileFormat?: string;
      scale?: string;
      pageCount?: number;
    }
  ) => {
    try {
      setError(null);
      const result = await AsBuiltService.uploadDrawingFile(
        drawingId,
        file,
        metadata
      );
      // Refresh the specific drawing
      const updated = await AsBuiltService.getAsBuiltDrawing(drawingId);
      setDrawings((prev) =>
        prev.map((item) => (item.id === drawingId ? updated : item))
      );
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    drawings,
    loading,
    error,
    refresh: fetchDrawings,
    createDrawing,
    updateDrawing,
    deleteDrawing,
    uploadFile,
  };
};

// ============================================================================
// Single As-Built Drawing
// ============================================================================

export const useAsBuiltDrawing = (id?: string) => {
  const [drawing, setDrawing] = useState<AsBuiltDrawing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDrawing = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AsBuiltService.getAsBuiltDrawing(id);
      setDrawing(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawing();
  }, [id]);

  return {
    drawing,
    loading,
    error,
    refresh: fetchDrawing,
  };
};

// ============================================================================
// Drawing Revisions
// ============================================================================

export const useDrawingRevisions = (drawingId?: string) => {
  const [revisions, setRevisions] = useState<DrawingRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRevisions = async () => {
    if (!drawingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AsBuiltService.getDrawingRevisions(drawingId);
      setRevisions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, [drawingId]);

  const createRevision = async (data: Partial<DrawingRevision>) => {
    if (!drawingId) return;
    try {
      setError(null);
      const newRevision = await AsBuiltService.createDrawingRevision(
        drawingId,
        data
      );
      setRevisions((prev) => [newRevision, ...prev]);
      return newRevision;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateRevision = async (
    revisionId: string,
    data: Partial<DrawingRevision>
  ) => {
    if (!drawingId) return;
    try {
      setError(null);
      const updated = await AsBuiltService.updateDrawingRevision(
        drawingId,
        revisionId,
        data
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

  const approveRevision = async (
    revisionId: string,
    approvalData: {
      approvedBy: { id: string; name: string; role?: string };
      comments?: string;
    }
  ) => {
    if (!drawingId) return;
    try {
      setError(null);
      const updated = await AsBuiltService.approveDrawingRevision(
        drawingId,
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
    updateRevision,
    approveRevision,
  };
};

// ============================================================================
// Redlines (Markups)
// ============================================================================

export const useRedlines = (
  drawingId?: string,
  filters?: {
    markupType?: MarkupType;
    status?: string;
  }
) => {
  const [redlines, setRedlines] = useState<Redline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRedlines = async () => {
    if (!drawingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AsBuiltService.getRedlines(drawingId, filters);
      setRedlines(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedlines();
  }, [drawingId, filters?.markupType, filters?.status]);

  const createRedline = async (data: Partial<Redline>) => {
    if (!drawingId) return;
    try {
      setError(null);
      const newRedline = await AsBuiltService.createRedline(drawingId, data);
      setRedlines((prev) => [newRedline, ...prev]);
      return newRedline;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateRedline = async (redlineId: string, data: Partial<Redline>) => {
    if (!drawingId) return;
    try {
      setError(null);
      const updated = await AsBuiltService.updateRedline(
        drawingId,
        redlineId,
        data
      );
      setRedlines((prev) =>
        prev.map((item) => (item.id === redlineId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const resolveRedline = async (
    redlineId: string,
    resolutionData: {
      resolution: string;
      resolvedBy: { id: string; name: string };
    }
  ) => {
    if (!drawingId) return;
    try {
      setError(null);
      const updated = await AsBuiltService.resolveRedline(
        drawingId,
        redlineId,
        resolutionData
      );
      setRedlines((prev) =>
        prev.map((item) => (item.id === redlineId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const incorporateRedline = async (redlineId: string, revisionId: string) => {
    if (!drawingId) return;
    try {
      setError(null);
      const updated = await AsBuiltService.incorporateRedline(
        drawingId,
        redlineId,
        revisionId
      );
      setRedlines((prev) =>
        prev.map((item) => (item.id === redlineId ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteRedline = async (redlineId: string) => {
    if (!drawingId) return;
    try {
      setError(null);
      await AsBuiltService.deleteRedline(drawingId, redlineId);
      setRedlines((prev) => prev.filter((item) => item.id !== redlineId));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    redlines,
    loading,
    error,
    refresh: fetchRedlines,
    createRedline,
    updateRedline,
    resolveRedline,
    incorporateRedline,
    deleteRedline,
  };
};

// ============================================================================
// Drawing Reviews
// ============================================================================

export const useDrawingReviews = (drawingId?: string) => {
  const [reviews, setReviews] = useState<DrawingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = async () => {
    if (!drawingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AsBuiltService.getDrawingReviews(drawingId);
      setReviews(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [drawingId]);

  const createReview = async (data: Partial<DrawingReview>) => {
    if (!drawingId) return;
    try {
      setError(null);
      const newReview = await AsBuiltService.createDrawingReview(
        drawingId,
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
    data: Partial<DrawingReview>
  ) => {
    if (!drawingId) return;
    try {
      setError(null);
      const updated = await AsBuiltService.updateDrawingReview(
        drawingId,
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

  const submitResponse = async (
    reviewId: string,
    responseData: {
      response: string;
      responseBy: { id: string; name: string };
    }
  ) => {
    if (!drawingId) return;
    try {
      setError(null);
      const updated = await AsBuiltService.submitReviewResponse(
        drawingId,
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
    submitResponse,
  };
};

// ============================================================================
// Drawing Packages
// ============================================================================

export const useDrawingPackages = (projectId?: string) => {
  const [packages, setPackages] = useState<DrawingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AsBuiltService.getDrawingPackages(projectId);
      setPackages(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [projectId]);

  const createPackage = async (data: Partial<DrawingPackage>) => {
    try {
      setError(null);
      const newPackage = await AsBuiltService.createDrawingPackage(data);
      setPackages((prev) => [newPackage, ...prev]);
      return newPackage;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updatePackage = async (id: string, data: Partial<DrawingPackage>) => {
    try {
      setError(null);
      const updated = await AsBuiltService.updateDrawingPackage(id, data);
      setPackages((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const issuePackage = async (
    id: string,
    issueData: {
      issuedDate: string;
      transmittalNumber?: string;
      transmittedTo?: string[];
    }
  ) => {
    try {
      setError(null);
      const updated = await AsBuiltService.issueDrawingPackage(id, issueData);
      setPackages((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const approvePackage = async (
    id: string,
    approvalData: {
      approvedBy: { id: string; name: string; role?: string };
      comments?: string;
    }
  ) => {
    try {
      setError(null);
      const updated = await AsBuiltService.approveDrawingPackage(
        id,
        approvalData
      );
      setPackages((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    packages,
    loading,
    error,
    refresh: fetchPackages,
    createPackage,
    updatePackage,
    issuePackage,
    approvePackage,
  };
};

// ============================================================================
// Analytics
// ============================================================================

export const useDrawingRegister = (projectId?: string) => {
  const [register, setRegister] = useState<DrawingRegister | null>(null);
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
        const data = await AsBuiltService.getDrawingRegister(projectId);
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

export const useAsBuiltSummary = (
  projectId?: string,
  dateRange?: { startDate: string; endDate: string }
) => {
  const [summary, setSummary] = useState<AsBuiltSummary | null>(null);
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
        const data = await AsBuiltService.getAsBuiltSummary(projectId, dateRange);
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

export const useAsBuiltAnalytics = (projectId?: string, period: string = 'month') => {
  const [analytics, setAnalytics] = useState<AsBuiltAnalytics | null>(null);
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
        const data = await AsBuiltService.getAsBuiltAnalytics(projectId, period);
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
