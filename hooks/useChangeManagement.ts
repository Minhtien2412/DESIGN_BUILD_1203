/**
 * Change Management Hooks
 */

import * as changeManagementService from '@/services/change-management';
import type {
    AssessChangeImpactParams,
    ChangeAnalytics,
    ChangeLog,
    ChangeOrder,
    ChangeRequest,
    CreateChangeOrderParams,
    CreateChangeRequestParams,
    GetChangeOrdersParams,
    GetChangeRequestsParams,
    UpdateChangeRequestParams,
} from '@/types/change-management';
import { useEffect, useState } from 'react';

// Change Requests Hook
export const useChangeRequests = (params?: GetChangeRequestsParams) => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await changeManagementService.getChangeRequests(params);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch change requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [JSON.stringify(params)]);

  const createRequest = async (data: CreateChangeRequestParams) => {
    try {
      const newRequest = await changeManagementService.createChangeRequest(data);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      throw err;
    }
  };

  const updateRequest = async (data: UpdateChangeRequestParams) => {
    try {
      const updated = await changeManagementService.updateChangeRequest(data);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      await changeManagementService.deleteChangeRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const submitRequest = async (id: string) => {
    try {
      const updated = await changeManagementService.submitChangeRequest(id);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const assessImpact = async (data: AssessChangeImpactParams) => {
    try {
      const updated = await changeManagementService.assessChangeImpact(data);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const approveRequest = async (id: string, comments?: string) => {
    try {
      const updated = await changeManagementService.approveChangeRequest(id, comments);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rejectRequest = async (id: string, reason: string) => {
    try {
      const updated = await changeManagementService.rejectChangeRequest(id, reason);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const holdRequest = async (id: string, reason: string) => {
    try {
      const updated = await changeManagementService.holdChangeRequest(id, reason);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const implementRequest = async (id: string) => {
    try {
      const updated = await changeManagementService.implementChangeRequest(id);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const cancelRequest = async (id: string, reason: string) => {
    try {
      const updated = await changeManagementService.cancelChangeRequest(id, reason);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    refresh: fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    submitRequest,
    assessImpact,
    approveRequest,
    rejectRequest,
    holdRequest,
    implementRequest,
    cancelRequest,
  };
};

// Single Change Request Hook
export const useChangeRequest = (id: string) => {
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await changeManagementService.getChangeRequest(id);
        setRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch change request');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [id]);

  return { request, loading, error };
};

// Change Orders Hook
export const useChangeOrders = (params?: GetChangeOrdersParams) => {
  const [orders, setOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await changeManagementService.getChangeOrders(params);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch change orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [JSON.stringify(params)]);

  const createOrder = async (data: CreateChangeOrderParams) => {
    try {
      const newOrder = await changeManagementService.createChangeOrder(data);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      throw err;
    }
  };

  const updateOrder = async (
    id: string,
    data: Partial<Omit<CreateChangeOrderParams, 'changeRequestId'>>
  ) => {
    try {
      const updated = await changeManagementService.updateChangeOrder(id, data);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await changeManagementService.deleteChangeOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const issueOrder = async (id: string) => {
    try {
      const updated = await changeManagementService.issueChangeOrder(id);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const acceptOrder = async (id: string, comments?: string) => {
    try {
      const updated = await changeManagementService.acceptChangeOrder(id, comments);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rejectOrder = async (id: string, reason: string) => {
    try {
      const updated = await changeManagementService.rejectChangeOrder(id, reason);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const startExecution = async (id: string, startDate: string) => {
    try {
      const updated = await changeManagementService.startExecution(id, startDate);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const updateProgress = async (id: string, progress: number) => {
    try {
      const updated = await changeManagementService.updateExecutionProgress(id, progress);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const completeExecution = async (id: string, completionDate: string) => {
    try {
      const updated = await changeManagementService.completeExecution(id, completionDate);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const closeOrder = async (id: string) => {
    try {
      const updated = await changeManagementService.closeChangeOrder(id);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    issueOrder,
    acceptOrder,
    rejectOrder,
    startExecution,
    updateProgress,
    completeExecution,
    closeOrder,
  };
};

// Single Change Order Hook
export const useChangeOrder = (id: string) => {
  const [order, setOrder] = useState<ChangeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await changeManagementService.getChangeOrder(id);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch change order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  return { order, loading, error };
};

// Change Logs Hook
export const useChangeLogs = (changeRequestId?: string, changeOrderId?: string) => {
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: ChangeLog[] = [];
        if (changeRequestId) {
          data = await changeManagementService.getChangeLogs(changeRequestId);
        } else if (changeOrderId) {
          data = await changeManagementService.getChangeOrderLogs(changeOrderId);
        }
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    if (changeRequestId || changeOrderId) {
      fetchLogs();
    }
  }, [changeRequestId, changeOrderId]);

  return { logs, loading, error };
};

// Change Analytics Hook
export const useChangeAnalytics = (projectId?: string, fromDate?: string, toDate?: string) => {
  const [analytics, setAnalytics] = useState<ChangeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await changeManagementService.getChangeAnalytics(projectId, fromDate, toDate);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId, fromDate, toDate]);

  return { analytics, loading, error };
};

// Project Change Impact Hook
export const useProjectChangeImpact = (projectId: string) => {
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await changeManagementService.getProjectChangeImpact(projectId);
        setImpact(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch impact');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchImpact();
    }
  }, [projectId]);

  return { impact, loading, error };
};
