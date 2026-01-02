/**
 * Resource Planning & Allocation Hooks
 */

import * as resourceService from '@/services/resource-planning';
import type {
    AllocationConflict,
    AllocationRequest,
    CreateAllocationParams,
    CreateAllocationRequestParams,
    CreateResourceParams,
    GetAllocationsParams,
    GetResourcesParams,
    Resource,
    ResourceAllocation,
    ResourceAnalytics,
    ResourceCalendar,
    ResourceForecast,
    ResourceLeveling,
    ResourceLevelingParams,
    ResourcePool,
    UpdateAllocationParams,
} from '@/types/resource-planning';
import { useEffect, useState } from 'react';

// Resource Pools Hook
export const useResourcePools = (type?: string) => {
  const [pools, setPools] = useState<ResourcePool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getResourcePools(type);
      setPools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resource pools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, [type]);

  const createPool = async (data: {
    name: string;
    type: string;
    description?: string;
    location: string;
    managerId: string;
    totalCapacity: number;
  }) => {
    try {
      const newPool = await resourceService.createResourcePool(data);
      setPools(prev => [newPool, ...prev]);
      return newPool;
    } catch (err) {
      throw err;
    }
  };

  const updatePool = async (id: string, data: Partial<ResourcePool>) => {
    try {
      const updated = await resourceService.updateResourcePool(id, data);
      setPools(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    pools,
    loading,
    error,
    refresh: fetchPools,
    createPool,
    updatePool,
  };
};

// Resources Hook
export const useResources = (params?: GetResourcesParams) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getResources(params);
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [JSON.stringify(params)]);

  const createResource = async (data: CreateResourceParams) => {
    try {
      const newResource = await resourceService.createResource(data);
      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      throw err;
    }
  };

  const updateResource = async (id: string, data: Partial<CreateResourceParams>) => {
    try {
      const updated = await resourceService.updateResource(id, data);
      setResources(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await resourceService.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    refresh: fetchResources,
    createResource,
    updateResource,
    deleteResource,
  };
};

// Single Resource Hook
export const useResource = (id: string) => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await resourceService.getResource(id);
        setResource(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resource');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id]);

  return { resource, loading, error };
};

// Resource Allocations Hook
export const useAllocations = (params?: GetAllocationsParams) => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAllocations(params);
      setAllocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [JSON.stringify(params)]);

  const createAllocation = async (data: CreateAllocationParams) => {
    try {
      const newAllocation = await resourceService.createAllocation(data);
      setAllocations(prev => [newAllocation, ...prev]);
      return newAllocation;
    } catch (err) {
      throw err;
    }
  };

  const updateAllocation = async (data: UpdateAllocationParams) => {
    try {
      const updated = await resourceService.updateAllocation(data);
      setAllocations(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteAllocation = async (id: string) => {
    try {
      await resourceService.deleteAllocation(id);
      setAllocations(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const approveAllocation = async (id: string, comments?: string) => {
    try {
      const updated = await resourceService.approveAllocation(id, comments);
      setAllocations(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rejectAllocation = async (id: string, reason: string) => {
    try {
      const updated = await resourceService.rejectAllocation(id, reason);
      setAllocations(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const startAllocation = async (id: string, actualStartDate: string) => {
    try {
      const updated = await resourceService.startAllocation(id, actualStartDate);
      setAllocations(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const completeAllocation = async (
    id: string,
    data: {
      actualEndDate: string;
      actualUtilization: number;
      actualCost: number;
      performanceRating?: number;
      notes?: string;
    }
  ) => {
    try {
      const updated = await resourceService.completeAllocation(id, data);
      setAllocations(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const cancelAllocation = async (id: string, reason: string) => {
    try {
      const updated = await resourceService.cancelAllocation(id, reason);
      setAllocations(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    allocations,
    loading,
    error,
    refresh: fetchAllocations,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    approveAllocation,
    rejectAllocation,
    startAllocation,
    completeAllocation,
    cancelAllocation,
  };
};

// Allocation Requests Hook
export const useAllocationRequests = (projectId?: string) => {
  const [requests, setRequests] = useState<AllocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAllocationRequests(projectId);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [projectId]);

  const createRequest = async (data: CreateAllocationRequestParams) => {
    try {
      const newRequest = await resourceService.createAllocationRequest(data);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      throw err;
    }
  };

  const approveRequest = async (
    id: string,
    data: {
      selectedResourceId: string;
      comments?: string;
    }
  ) => {
    try {
      const updated = await resourceService.approveRequest(id, data);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rejectRequest = async (id: string, reason: string) => {
    try {
      const updated = await resourceService.rejectRequest(id, reason);
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
    approveRequest,
    rejectRequest,
  };
};

// Conflicts Hook
export const useConflicts = (projectId?: string, severity?: string) => {
  const [conflicts, setConflicts] = useState<AllocationConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getConflicts(projectId, severity);
      setConflicts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conflicts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [projectId, severity]);

  const resolveConflict = async (
    id: string,
    data: {
      method: string;
      description: string;
    }
  ) => {
    try {
      const updated = await resourceService.resolveConflict(id, data);
      setConflicts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const detectConflicts = async (projectId: string) => {
    try {
      const detected = await resourceService.detectConflicts(projectId);
      setConflicts(detected);
      return detected;
    } catch (err) {
      throw err;
    }
  };

  return {
    conflicts,
    loading,
    error,
    refresh: fetchConflicts,
    resolveConflict,
    detectConflicts,
  };
};

// Resource Calendar Hook
export const useResourceCalendar = (
  resourceId: string,
  fromDate: string,
  toDate: string
) => {
  const [calendar, setCalendar] = useState<ResourceCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await resourceService.getResourceCalendar(resourceId, fromDate, toDate);
        setCalendar(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch calendar');
      } finally {
        setLoading(false);
      }
    };

    if (resourceId && fromDate && toDate) {
      fetchCalendar();
    }
  }, [resourceId, fromDate, toDate]);

  return { calendar, loading, error };
};

// Resource Analytics Hook
export const useResourceAnalytics = (
  projectId?: string,
  fromDate?: string,
  toDate?: string
) => {
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await resourceService.getResourceAnalytics(projectId, fromDate, toDate);
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

// Resource Forecast Hook
export const useResourceForecast = (
  projectId: string,
  fromDate: string,
  toDate: string,
  resourceType?: string
) => {
  const [forecast, setForecast] = useState<ResourceForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await resourceService.getResourceForecast(
          projectId,
          fromDate,
          toDate,
          resourceType
        );
        setForecast(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
      } finally {
        setLoading(false);
      }
    };

    if (projectId && fromDate && toDate) {
      fetchForecast();
    }
  }, [projectId, fromDate, toDate, resourceType]);

  return { forecast, loading, error };
};

// Resource Leveling Hook
export const useResourceLevelings = (projectId: string) => {
  const [levelings, setLevelings] = useState<ResourceLeveling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getResourceLevelings(projectId);
      setLevelings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch levelings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchLevelings();
    }
  }, [projectId]);

  const createLeveling = async (data: ResourceLevelingParams) => {
    try {
      const newLeveling = await resourceService.createResourceLeveling(data);
      setLevelings(prev => [newLeveling, ...prev]);
      return newLeveling;
    } catch (err) {
      throw err;
    }
  };

  const simulateLeveling = async (id: string) => {
    try {
      const simulated = await resourceService.simulateResourceLeveling(id);
      setLevelings(prev => prev.map(l => (l.id === simulated.id ? simulated : l)));
      return simulated;
    } catch (err) {
      throw err;
    }
  };

  const applyLeveling = async (id: string) => {
    try {
      const applied = await resourceService.applyResourceLeveling(id);
      setLevelings(prev => prev.map(l => (l.id === applied.id ? applied : l)));
      return applied;
    } catch (err) {
      throw err;
    }
  };

  return {
    levelings,
    loading,
    error,
    refresh: fetchLevelings,
    createLeveling,
    simulateLeveling,
    applyLeveling,
  };
};
