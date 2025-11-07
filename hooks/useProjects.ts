import { ApiError, apiFetch } from '@/services/api';
import { getToken } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';
export type ProjectType = 'residential' | 'commercial' | 'landscape' | 'interior' | 'renovation';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  location?: string;
  budget?: number;
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  team?: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  start_date?: string;
  end_date?: string;
  images?: string[];
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    uploaded_at: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseProjectsOptions {
  status?: ProjectStatus;
  page?: number;
  limit?: number;
  search?: string;
  autoFetch?: boolean;
  mine?: boolean; // only projects created by current user
  type?: ProjectType; // filter by project type
}

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  pagination: ProjectsResponse['pagination'] | null;
  refresh: () => Promise<void>;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { status, page = 1, limit = 20, search, autoFetch = true, mine, type } = options;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProjectsResponse['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchProjects = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const token = await getToken();
      if (!token) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Build query params
      const params: Record<string, string> = {
        page: pageNum.toString(),
        limit: limit.toString(),
      };
      if (status) params.status = status;
  if (search) params.search = search;
  if (type) params.type = type;
      if (mine) {
        // Support both conventions; backend will ignore unknown keys
        params.mine = '1';
        params.owner = 'self';
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await apiFetch<{ success: boolean; data: ProjectsResponse }>(
        `/api/projects?${queryString}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = response.data || response;
      const rawProjects = data.projects || [];
      // Normalize server fields: ensure we have 'name' even if API returns 'title'
      const newProjects = rawProjects.map((p: any) => ({
        ...p,
        name: p?.name ?? p?.title ?? '',
      })) as Project[];

      if (append) {
        setProjects(prev => [...prev, ...newProjects]);
      } else {
        setProjects(newProjects);
      }

      setPagination(data.pagination);
      setCurrentPage(pageNum);
    } catch (err) {
      // Silent handling for auth errors
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          setProjects([]);
          setError(null);
        } else {
          setError(err.data?.message || err.message || 'Failed to load projects');
          console.error('[useProjects] API Error:', err.status, err.data);
        }
      } else {
        setError('Unknown error occurred');
        console.error('[useProjects] Error:', err);
      }
      if (!append) {
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  }, [status, limit, search]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await fetchProjects(1, false);
  }, [fetchProjects]);

  const fetchMore = useCallback(async () => {
    if (pagination && currentPage < pagination.totalPages) {
      await fetchProjects(currentPage + 1, true);
    }
  }, [fetchProjects, currentPage, pagination]);

  const hasMore = pagination ? currentPage < pagination.totalPages : false;

  useEffect(() => {
    if (autoFetch) {
      fetchProjects(1, false);
    }
  }, [autoFetch, fetchProjects]);

  return {
    projects,
    loading,
    error,
    pagination,
    refresh,
    fetchMore,
    hasMore
  };
}

// Hook for single project detail
export function useProjectDetail(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(!!projectId);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setProject(null);
        setLoading(false);
        return;
      }

      const response = await apiFetch<{ success: boolean; data: Project }>(
        `/api/projects/${projectId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setProject(response.data || response);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          setProject(null);
          setError(null);
        } else {
          setError(err.data?.message || err.message || 'Failed to load project');
          console.error('[useProjectDetail] API Error:', err.status, err.data);
        }
      } else {
        setError('Unknown error occurred');
        console.error('[useProjectDetail] Error:', err);
      }
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refresh: fetchProject
  };
}
