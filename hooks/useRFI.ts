/**
 * RFI Hooks
 * Custom hooks for Request for Information (RFI) management
 */

import * as RFIService from '@/services/rfi';
import type {
    CreateRFIParams,
    GetRFIsParams,
    RequestClarificationParams,
    RespondToRFIParams,
    RFI,
    RFIAnalytics,
    RFILog,
    RFISchedule,
    RFITemplate,
    UpdateRFIParams,
} from '@/types/rfi';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for managing RFIs
 */
export const useRFIs = (params?: GetRFIsParams) => {
  const [rfis, setRFIs] = useState<RFI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRFIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFIService.getRFIs(params);
      setRFIs(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRFIs();
  }, [fetchRFIs]);

  const createRFI = async (data: CreateRFIParams) => {
    const newRFI = await RFIService.createRFI(data);
    setRFIs(prev => [newRFI, ...prev]);
    return newRFI;
  };

  const updateRFI = async (id: string, data: UpdateRFIParams) => {
    const updated = await RFIService.updateRFI(id, data);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  const deleteRFI = async (id: string) => {
    await RFIService.deleteRFI(id);
    setRFIs(prev => prev.filter(rfi => rfi.id !== id));
  };

  const submitRFI = async (id: string, notes?: string) => {
    const updated = await RFIService.submitRFI(id, notes);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  const respondToRFI = async (id: string, data: RespondToRFIParams) => {
    const updated = await RFIService.respondToRFI(id, data);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  const requestClarification = async (id: string, data: RequestClarificationParams) => {
    const updated = await RFIService.requestClarification(id, data);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  const closeRFI = async (id: string, closureNotes?: string) => {
    const updated = await RFIService.closeRFI(id, closureNotes);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  const reopenRFI = async (id: string, reason: string) => {
    const updated = await RFIService.reopenRFI(id, reason);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  const cancelRFI = async (id: string, reason: string) => {
    const updated = await RFIService.cancelRFI(id, reason);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  const reassignRFI = async (id: string, assignedToId: string, reason?: string) => {
    const updated = await RFIService.reassignRFI(id, assignedToId, reason);
    setRFIs(prev => prev.map(rfi => (rfi.id === id ? updated : rfi)));
    return updated;
  };

  return {
    rfis,
    loading,
    error,
    refresh: fetchRFIs,
    createRFI,
    updateRFI,
    deleteRFI,
    submitRFI,
    respondToRFI,
    requestClarification,
    closeRFI,
    reopenRFI,
    cancelRFI,
    reassignRFI,
  };
};

/**
 * Hook for single RFI
 */
export const useRFI = (id: string) => {
  const [rfi, setRFI] = useState<RFI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRFI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFIService.getRFI(id);
      setRFI(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRFI();
    }
  }, [id, fetchRFI]);

  return {
    rfi,
    loading,
    error,
    refresh: fetchRFI,
  };
};

/**
 * Hook for RFI templates
 */
export const useRFITemplates = (category?: string) => {
  const [templates, setTemplates] = useState<RFITemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFIService.getRFITemplates(category);
      setTemplates(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refresh: fetchTemplates,
  };
};

/**
 * Hook for RFI schedule
 */
export const useRFISchedule = (projectId: string) => {
  const [schedule, setSchedule] = useState<RFISchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFIService.getRFISchedule(projectId);
      setSchedule(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchSchedule();
    }
  }, [projectId, fetchSchedule]);

  const updateSchedule = async (
    rfiNumber: string,
    plannedSubmitDate?: string,
    requiredResponseDate?: string
  ) => {
    const updated = await RFIService.updateRFISchedule(
      rfiNumber,
      plannedSubmitDate,
      requiredResponseDate
    );
    setSchedule(updated);
    return updated;
  };

  return {
    schedule,
    loading,
    error,
    refresh: fetchSchedule,
    updateSchedule,
  };
};

/**
 * Hook for RFI logs
 */
export const useRFILogs = (id: string) => {
  const [logs, setLogs] = useState<RFILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFIService.getRFILogs(id);
      setLogs(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchLogs();
    }
  }, [id, fetchLogs]);

  return {
    logs,
    loading,
    error,
    refresh: fetchLogs,
  };
};

/**
 * Hook for RFI analytics
 */
export const useRFIAnalytics = (projectId?: string, startDate?: string, endDate?: string) => {
  const [analytics, setAnalytics] = useState<RFIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await RFIService.getRFIAnalytics(projectId, startDate, endDate);
      setAnalytics(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics,
  };
};
