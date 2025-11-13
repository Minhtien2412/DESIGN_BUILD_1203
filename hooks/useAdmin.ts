import { ApiError, apiFetch } from '@/services/api';
import { getToken } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

// ===== TYPES =====

export interface StaffMember {
  staffid: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber?: string;
  profile_image?: string;
  role: {
    roleid: number;
    name: string;
  };
  departments?: Array<{
    departmentid: number;
    name: string;
  }>;
  active: number;
  last_login?: string;
  created_at: string;
}

export interface StaffDetail extends StaffMember {
  permissions: Array<{
    feature: string;
    capabilities: string[];
  }>;
  statistics?: {
    total_projects: number;
    active_tasks: number;
    completed_tasks: number;
    total_hours_logged: number;
  };
}

export interface Role {
  roleid: number;
  name: string;
  permissions: Record<string, string[]>;
  total_staff?: number;
}

export interface Department {
  departmentid: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  total_staff?: number;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_staff: number;
  total_clients: number;
  revenue_this_month: number;
  revenue_this_year: number;
}

export interface Activity {
  id: number;
  staff: {
    staffid: number;
    firstname: string;
    lastname: string;
    profile_image?: string;
  };
  type: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface PermissionFeature {
  name: string;
  label: string;
  capabilities: Array<{
    name: string;
    label: string;
  }>;
}

interface StaffFilters {
  role?: number;
  active?: 0 | 1;
  search?: string;
}

interface ActivityFilters {
  staff_id?: number;
  type?: string;
  date_from?: string;
  date_to?: string;
}

// ===== HOOKS =====

/**
 * Hook to fetch dashboard statistics and recent data
 */
export function useDashboard(autoFetch = true) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const data = await apiFetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(data.stats);
      setRecentProjects(data.recent_projects || []);
      setRecentActivities(data.recent_activities || []);
      setPendingTasks(data.pending_tasks || []);
    } catch (err: any) {
      // Silent for auth errors (401/403)
      if (err instanceof ApiError && err.status && [401, 403].includes(err.status!)) {
        console.log('[Dashboard] Auth required');
      } else {
        console.error('[Dashboard] Error:', err);
        setError(err.data?.message || err.message || 'Failed to fetch dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchDashboard();
    }
  }, [autoFetch, fetchDashboard]);

  return {
    stats,
    recentProjects,
    recentActivities,
    pendingTasks,
    loading,
    error,
    refresh: fetchDashboard,
  };
}

/**
 * Hook to fetch and manage staff members
 */
export function useStaff(
  options: {
    page?: number;
    limit?: number;
    filters?: StaffFilters;
    autoFetch?: boolean;
  } = {}
) {
  const { page = 1, limit = 20, filters = {}, autoFetch = true } = options;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(
    async (currentPage = page) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No authentication token');
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          ...(filters as Record<string, string>),
        });

        const data = await apiFetch(`/api/admin/staff?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStaff(data.staff || []);
        setPagination(data.pagination);
      } catch (err: any) {
        if (err instanceof ApiError && [401, 403].includes(err.status!)) {
          console.log('[Staff] Auth required');
        } else {
          console.error('[Staff] Error:', err);
          setError(err.data?.message || 'Failed to fetch staff');
        }
      } finally {
        setLoading(false);
      }
    },
    [page, limit, filters]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchStaff();
    }
  }, [autoFetch, fetchStaff]);

  const createStaff = async (data: any) => {
    const token = await getToken();
    return apiFetch('/api/admin/staff', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  };

  const updateStaff = async (staffid: number, data: any) => {
    const token = await getToken();
    return apiFetch(`/api/admin/staff/${staffid}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  };

  const deleteStaff = async (staffid: number, transfer_data_to: number) => {
    const token = await getToken();
    return apiFetch(`/api/admin/staff/${staffid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ transfer_data_to }),
    });
  };

  return {
    staff,
    pagination,
    loading,
    error,
    refresh: fetchStaff,
    fetchMore: () => fetchStaff(pagination.page + 1),
    hasMore: pagination.page < pagination.totalPages,
    createStaff,
    updateStaff,
    deleteStaff,
  };
}

/**
 * Hook to fetch single staff detail
 */
export function useStaffDetail(staffid: number | string) {
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffDetail = useCallback(async () => {
    if (!staffid) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const data = await apiFetch(`/api/admin/staff/${staffid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStaff(data);
    } catch (err: any) {
      if (err instanceof ApiError && [401, 403].includes(err.status!)) {
        console.log('[StaffDetail] Auth required');
      } else {
        console.error('[StaffDetail] Error:', err);
        setError(err.data?.message || 'Failed to fetch staff detail');
      }
    } finally {
      setLoading(false);
    }
  }, [staffid]);

  useEffect(() => {
    fetchStaffDetail();
  }, [fetchStaffDetail]);

  return {
    staff,
    loading,
    error,
    refresh: fetchStaffDetail,
  };
}

/**
 * Hook to fetch and manage roles
 */
export function useRoles(autoFetch = true) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const data = await apiFetch('/api/admin/roles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoles(data.roles || []);
    } catch (err: any) {
      if (err instanceof ApiError && [401, 403].includes(err.status!)) {
        console.log('[Roles] Auth required');
      } else {
        console.error('[Roles] Error:', err);
        setError(err.data?.message || 'Failed to fetch roles');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchRoles();
    }
  }, [autoFetch, fetchRoles]);

  const createRole = async (data: { name: string; permissions: Record<string, string[]> }) => {
    const token = await getToken();
    return apiFetch('/api/admin/roles', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  };

  const updateRole = async (roleid: number, data: any) => {
    const token = await getToken();
    return apiFetch(`/api/admin/roles/${roleid}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  };

  const deleteRole = async (roleid: number) => {
    const token = await getToken();
    return apiFetch(`/api/admin/roles/${roleid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return {
    roles,
    loading,
    error,
    refresh: fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}

/**
 * Hook to fetch permission features
 */
export function usePermissionFeatures() {
  const [features, setFeatures] = useState<PermissionFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const data = await apiFetch('/api/admin/permissions/features', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFeatures(data.features || []);
    } catch (err: any) {
      if (err instanceof ApiError && [401, 403].includes(err.status!)) {
        console.log('[PermissionFeatures] Auth required');
      } else {
        console.error('[PermissionFeatures] Error:', err);
        setError(err.data?.message || 'Failed to fetch features');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    loading,
    error,
    refresh: fetchFeatures,
  };
}

/**
 * Hook to fetch activity logs
 */
export function useActivityLog(
  options: {
    page?: number;
    limit?: number;
    filters?: ActivityFilters;
    autoFetch?: boolean;
  } = {}
) {
  const { page = 1, limit = 50, filters = {}, autoFetch = true } = options;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(
    async (currentPage = page) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No authentication token');
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          ...(filters as Record<string, string>),
        });

        const data = await apiFetch(`/api/admin/activity-log?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setActivities(data.activities || []);
        setPagination(data.pagination);
      } catch (err: any) {
        if (err instanceof ApiError && [401, 403].includes(err.status!)) {
          console.log('[ActivityLog] Auth required');
        } else {
          console.error('[ActivityLog] Error:', err);
          setError(err.data?.message || 'Failed to fetch activities');
        }
      } finally {
        setLoading(false);
      }
    },
    [page, limit, filters]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchActivities();
    }
  }, [autoFetch, fetchActivities]);

  return {
    activities,
    pagination,
    loading,
    error,
    refresh: fetchActivities,
    fetchMore: () => fetchActivities(pagination.page + 1),
    hasMore: pagination.page < pagination.totalPages,
  };
}

/**
 * Hook to fetch departments
 */
export function useDepartments(autoFetch = true) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const data = await apiFetch('/api/admin/departments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepartments(data.departments || []);
    } catch (err: any) {
      if (err instanceof ApiError && [401, 403].includes(err.status!)) {
        console.log('[Departments] Auth required');
      } else {
        console.error('[Departments] Error:', err);
        setError(err.data?.message || 'Failed to fetch departments');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchDepartments();
    }
  }, [autoFetch, fetchDepartments]);

  return {
    departments,
    loading,
    error,
    refresh: fetchDepartments,
  };
}
