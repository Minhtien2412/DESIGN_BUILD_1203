/**
 * Change Order Hooks
 * Custom hooks for change order management
 */

import * as ChangeOrderService from '@/services/change-order';
import type {
    ApproveChangeOrderParams,
    ChangeOrder,
    ChangeOrderAnalytics,
    ChangeOrderLog,
    ChangeOrderSummary,
    ChangeOrderTemplate,
    CreateChangeOrderParams,
    GetChangeOrdersParams,
    ImplementChangeOrderParams,
    UpdateChangeOrderParams,
} from '@/types/change-order';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for managing change orders
 */
export const useChangeOrders = (params?: GetChangeOrdersParams) => {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChangeOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ChangeOrderService.getChangeOrders(params);
      setChangeOrders(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchChangeOrders();
  }, [fetchChangeOrders]);

  const createChangeOrder = async (data: CreateChangeOrderParams) => {
    const newCO = await ChangeOrderService.createChangeOrder(data);
    setChangeOrders(prev => [newCO, ...prev]);
    return newCO;
  };

  const updateChangeOrder = async (id: string, data: UpdateChangeOrderParams) => {
    const updated = await ChangeOrderService.updateChangeOrder(id, data);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const deleteChangeOrder = async (id: string) => {
    await ChangeOrderService.deleteChangeOrder(id);
    setChangeOrders(prev => prev.filter(co => co.id !== id));
  };

  const submitChangeOrder = async (id: string, notes?: string) => {
    const updated = await ChangeOrderService.submitChangeOrder(id, notes);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const reviewChangeOrder = async (id: string, comments: string, requestRevision?: boolean) => {
    const updated = await ChangeOrderService.reviewChangeOrder(id, comments, requestRevision);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const approveChangeOrder = async (id: string, data: ApproveChangeOrderParams) => {
    const updated = await ChangeOrderService.approveChangeOrder(id, data);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const rejectChangeOrder = async (id: string, reason: string) => {
    const updated = await ChangeOrderService.rejectChangeOrder(id, reason);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const implementChangeOrder = async (id: string, data: ImplementChangeOrderParams) => {
    const updated = await ChangeOrderService.implementChangeOrder(id, data);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const completeChangeOrder = async (id: string, completionNotes?: string) => {
    const updated = await ChangeOrderService.completeChangeOrder(id, completionNotes);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const cancelChangeOrder = async (id: string, reason: string) => {
    const updated = await ChangeOrderService.cancelChangeOrder(id, reason);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  const updateImplementationProgress = async (id: string, progress: number, description: string) => {
    const updated = await ChangeOrderService.updateImplementationProgress(id, progress, description);
    setChangeOrders(prev => prev.map(co => (co.id === id ? updated : co)));
    return updated;
  };

  return {
    changeOrders,
    loading,
    error,
    refresh: fetchChangeOrders,
    createChangeOrder,
    updateChangeOrder,
    deleteChangeOrder,
    submitChangeOrder,
    reviewChangeOrder,
    approveChangeOrder,
    rejectChangeOrder,
    implementChangeOrder,
    completeChangeOrder,
    cancelChangeOrder,
    updateImplementationProgress,
  };
};

/**
 * Hook for single change order
 */
export const useChangeOrder = (id: string) => {
  const [changeOrder, setChangeOrder] = useState<ChangeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChangeOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ChangeOrderService.getChangeOrder(id);
      setChangeOrder(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchChangeOrder();
    }
  }, [id, fetchChangeOrder]);

  return {
    changeOrder,
    loading,
    error,
    refresh: fetchChangeOrder,
  };
};

/**
 * Hook for change order templates
 */
export const useChangeOrderTemplates = (type?: string) => {
  const [templates, setTemplates] = useState<ChangeOrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ChangeOrderService.getChangeOrderTemplates(type);
      setTemplates(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [type]);

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
 * Hook for change order summary
 */
export const useChangeOrderSummary = (projectId: string) => {
  const [summary, setSummary] = useState<ChangeOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ChangeOrderService.getChangeOrderSummary(projectId);
      setSummary(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchSummary();
    }
  }, [projectId, fetchSummary]);

  const updateSummary = async (
    changeOrderNumber: string,
    costChange?: number,
    scheduleDays?: number
  ) => {
    const updated = await ChangeOrderService.updateChangeOrderSummary(
      changeOrderNumber,
      costChange,
      scheduleDays
    );
    setSummary(updated);
    return updated;
  };

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
    updateSummary,
  };
};

/**
 * Hook for change order logs
 */
export const useChangeOrderLogs = (id: string) => {
  const [logs, setLogs] = useState<ChangeOrderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ChangeOrderService.getChangeOrderLogs(id);
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
 * Hook for change order analytics
 */
export const useChangeOrderAnalytics = (
  projectId?: string,
  startDate?: string,
  endDate?: string
) => {
  const [analytics, setAnalytics] = useState<ChangeOrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ChangeOrderService.getChangeOrderAnalytics(projectId, startDate, endDate);
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
