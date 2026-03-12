/**
 * Resource Planning & Allocation Service
 */

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
import { apiFetch } from './api';

// Resource Pools
export const getResourcePools = async (type?: string): Promise<ResourcePool[]> => {
  const params = type ? `?type=${type}` : '';
  return apiFetch(`/resource-pools${params}`);
};

export const getResourcePool = async (id: string): Promise<ResourcePool> => {
  return apiFetch(`/resource-pools/${id}`);
};

export const createResourcePool = async (data: {
  name: string;
  type: string;
  description?: string;
  location: string;
  managerId: string;
  totalCapacity: number;
}): Promise<ResourcePool> => {
  return apiFetch('/resource-pools', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateResourcePool = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    location: string;
    managerId: string;
    totalCapacity: number;
    status: string;
  }>
): Promise<ResourcePool> => {
  return apiFetch(`/resource-pools/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Resources
export const getResources = async (params?: GetResourcesParams): Promise<Resource[]> => {
  const queryParams = new URLSearchParams();
  if (params?.poolId) queryParams.append('poolId', params.poolId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.availability) queryParams.append('availability', params.availability);
  if (params?.location) queryParams.append('location', params.location);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  
  const query = queryParams.toString();
  return apiFetch(`/resources${query ? `?${query}` : ''}`);
};

export const getResource = async (id: string): Promise<Resource> => {
  return apiFetch(`/resources/${id}`);
};

export const createResource = async (data: CreateResourceParams): Promise<Resource> => {
  return apiFetch('/resources', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateResource = async (
  id: string,
  data: Partial<CreateResourceParams>
): Promise<Resource> => {
  return apiFetch(`/resources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteResource = async (id: string): Promise<void> => {
  return apiFetch(`/resources/${id}`, { method: 'DELETE' });
};

export const getResourceAvailability = async (
  resourceId: string,
  fromDate: string,
  toDate: string
): Promise<{
  resourceId: string;
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  periods: {
    date: string;
    available: number;
    allocated: number;
    status: string;
  }[];
}> => {
  return apiFetch(`/resources/${resourceId}/availability?fromDate=${fromDate}&toDate=${toDate}`);
};

// Resource Allocations
export const getAllocations = async (params?: GetAllocationsParams): Promise<ResourceAllocation[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.resourceId) queryParams.append('resourceId', params.resourceId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  
  const query = queryParams.toString();
  return apiFetch(`/resource-allocations${query ? `?${query}` : ''}`);
};

export const getAllocation = async (id: string): Promise<ResourceAllocation> => {
  return apiFetch(`/resource-allocations/${id}`);
};

export const createAllocation = async (data: CreateAllocationParams): Promise<ResourceAllocation> => {
  return apiFetch('/resource-allocations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAllocation = async (data: UpdateAllocationParams): Promise<ResourceAllocation> => {
  return apiFetch(`/resource-allocations/${data.id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteAllocation = async (id: string): Promise<void> => {
  return apiFetch(`/resource-allocations/${id}`, { method: 'DELETE' });
};

export const approveAllocation = async (id: string, comments?: string): Promise<ResourceAllocation> => {
  return apiFetch(`/resource-allocations/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectAllocation = async (id: string, reason: string): Promise<ResourceAllocation> => {
  return apiFetch(`/resource-allocations/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const startAllocation = async (id: string, actualStartDate: string): Promise<ResourceAllocation> => {
  return apiFetch(`/resource-allocations/${id}/start`, {
    method: 'POST',
    body: JSON.stringify({ actualStartDate }),
  });
};

export const completeAllocation = async (
  id: string,
  data: {
    actualEndDate: string;
    actualUtilization: number;
    actualCost: number;
    performanceRating?: number;
    notes?: string;
  }
): Promise<ResourceAllocation> => {
  return apiFetch(`/resource-allocations/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const cancelAllocation = async (id: string, reason: string): Promise<ResourceAllocation> => {
  return apiFetch(`/resource-allocations/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Allocation Requests
export const getAllocationRequests = async (projectId?: string): Promise<AllocationRequest[]> => {
  const params = projectId ? `?projectId=${projectId}` : '';
  return apiFetch(`/allocation-requests${params}`);
};

export const getAllocationRequest = async (id: string): Promise<AllocationRequest> => {
  return apiFetch(`/allocation-requests/${id}`);
};

export const createAllocationRequest = async (
  data: CreateAllocationRequestParams
): Promise<AllocationRequest> => {
  return apiFetch('/allocation-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveRequest = async (
  id: string,
  data: {
    selectedResourceId: string;
    comments?: string;
  }
): Promise<AllocationRequest> => {
  return apiFetch(`/allocation-requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const rejectRequest = async (id: string, reason: string): Promise<AllocationRequest> => {
  return apiFetch(`/allocation-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Resource Calendar
export const getResourceCalendar = async (
  resourceId: string,
  fromDate: string,
  toDate: string
): Promise<ResourceCalendar> => {
  return apiFetch(`/resources/${resourceId}/calendar?fromDate=${fromDate}&toDate=${toDate}`);
};

export const addBlockedPeriod = async (
  resourceId: string,
  data: {
    reason: string;
    startDate: string;
    endDate: string;
    description?: string;
  }
): Promise<ResourceCalendar> => {
  return apiFetch(`/resources/${resourceId}/calendar/block`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const removeBlockedPeriod = async (
  resourceId: string,
  periodId: string
): Promise<ResourceCalendar> => {
  return apiFetch(`/resources/${resourceId}/calendar/block/${periodId}`, {
    method: 'DELETE',
  });
};

// Conflicts
export const getConflicts = async (
  projectId?: string,
  severity?: string
): Promise<AllocationConflict[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (severity) params.append('severity', severity);
  
  const query = params.toString();
  return apiFetch(`/allocation-conflicts${query ? `?${query}` : ''}`);
};

export const getConflict = async (id: string): Promise<AllocationConflict> => {
  return apiFetch(`/allocation-conflicts/${id}`);
};

export const resolveConflict = async (
  id: string,
  data: {
    method: string;
    description: string;
  }
): Promise<AllocationConflict> => {
  return apiFetch(`/allocation-conflicts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const detectConflicts = async (projectId: string): Promise<AllocationConflict[]> => {
  return apiFetch(`/projects/${projectId}/detect-conflicts`, {
    method: 'POST',
  });
};

// Resource Leveling
export const getResourceLevelings = async (projectId: string): Promise<ResourceLeveling[]> => {
  return apiFetch(`/projects/${projectId}/resource-levelings`);
};

export const createResourceLeveling = async (
  data: ResourceLevelingParams
): Promise<ResourceLeveling> => {
  return apiFetch('/resource-levelings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const simulateResourceLeveling = async (id: string): Promise<ResourceLeveling> => {
  return apiFetch(`/resource-levelings/${id}/simulate`, {
    method: 'POST',
  });
};

export const applyResourceLeveling = async (id: string): Promise<ResourceLeveling> => {
  return apiFetch(`/resource-levelings/${id}/apply`, {
    method: 'POST',
  });
};

// Resource Forecast
export const getResourceForecast = async (
  projectId: string,
  fromDate: string,
  toDate: string,
  resourceType?: string
): Promise<ResourceForecast> => {
  const params = new URLSearchParams({
    fromDate,
    toDate,
  });
  if (resourceType) params.append('resourceType', resourceType);
  
  return apiFetch(`/projects/${projectId}/resource-forecast?${params.toString()}`);
};

export const generateForecast = async (
  projectId: string,
  data: {
    startDate: string;
    endDate: string;
    resourceTypes?: string[];
    includeSubcontractors?: boolean;
  }
): Promise<ResourceForecast> => {
  return apiFetch(`/projects/${projectId}/resource-forecast/generate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Analytics
export const getResourceAnalytics = async (
  projectId?: string,
  fromDate?: string,
  toDate?: string
): Promise<ResourceAnalytics> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString();
  return apiFetch(`/resource-analytics${query ? `?${query}` : ''}`);
};

export const getUtilizationReport = async (
  resourceType?: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  overall: {
    totalCapacity: number;
    allocated: number;
    available: number;
    utilizationRate: number;
  };
  byResource: {
    resourceId: string;
    resourceName: string;
    type: string;
    capacity: number;
    allocated: number;
    utilizationRate: number;
    level: string;
  }[];
  byProject: {
    projectId: string;
    projectName: string;
    allocated: number;
    utilizationRate: number;
  }[];
  trend: {
    date: string;
    utilizationRate: number;
  }[];
}> => {
  const params = new URLSearchParams();
  if (resourceType) params.append('resourceType', resourceType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString();
  return apiFetch(`/resource-analytics/utilization${query ? `?${query}` : ''}`);
};

export const getCostReport = async (
  projectId?: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  totalPlanned: number;
  totalActual: number;
  variance: number;
  variancePercentage: number;
  byType: {
    type: string;
    planned: number;
    actual: number;
    variance: number;
  }[];
  byProject: {
    projectId: string;
    projectName: string;
    planned: number;
    actual: number;
    variance: number;
  }[];
  trend: {
    date: string;
    planned: number;
    actual: number;
  }[];
}> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString();
  return apiFetch(`/resource-analytics/cost${query ? `?${query}` : ''}`);
};

export const exportResourceRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' | 'CSV'
): Promise<Blob> => {
  return apiFetch(`/projects/${projectId}/resource-register/export?format=${format}`, {
    responseType: 'blob',
  });
};

export const exportAllocationSchedule = async (
  projectId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch(`/projects/${projectId}/allocation-schedule/export?format=${format}`, {
    responseType: 'blob',
  });
};
