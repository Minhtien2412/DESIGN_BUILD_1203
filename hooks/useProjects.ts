import { useCallback, useEffect, useState } from 'react';
import projectsApi, { Project as BackendProject } from '../services/api/projectsApi';
import { cache, CacheTTL } from '../utils/cache';
import { getOfflineData, saveOfflineData } from '../utils/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';

// Define backward-compatible types for existing UI code
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';
export type ProjectType = 'residential' | 'commercial' | 'landscape' | 'interior' | 'renovation';

// TeamMember type for project team
export interface TeamMemberInfo {
  id: number;
  userId: number;
  role: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

// Extended Project type that combines backend data with UI expectations
export interface Project extends Omit<BackendProject, 'status' | 'client' | 'id'> {
  id: number | string; // Accept both for backward compatibility with mock data
  name: string; // Maps from backend 'title'
  type?: ProjectType; // Not in backend yet
  location?: string; // Not in backend yet
  progress?: number; // Not in backend yet (0-100)
  status: ProjectStatus; // UI format (planning, active, etc)
  // Legacy aliases for backward compatibility with UI
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string; // Mock data format
  client?: {
    id: number | string;
    name: string;
    email: string;
    phone?: string; // Not in backend yet
  } | null;
  teamMembers?: TeamMemberInfo[]; // Team members on the project
  team?: { id: string; name: string; role: string }[]; // Mock data format
  documents?: number | { id: string; name: string; url: string; size: number; uploaded_at: string }[]; // Document count or array for mock
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
  error: Error | null;
  retrying: boolean;
  pagination: null; // Backend doesn't support pagination yet, return null for compatibility
  refresh: () => Promise<void>;
  refreshProjects: () => Promise<void>; // Alias for backward compatibility
  fetchMore: () => Promise<void>; // No-op for now
  hasMore: boolean; // Always false for now
}

/**
 * Hook to fetch and manage list of projects from backend API
 * Uses real API endpoint: GET /projects (protected)
 * 
 * Note: Currently backend doesn't support query params (status, search, type, pagination).
 * Client-side filtering is handled by the UI component.
 */
export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { autoFetch = true } = options;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const { isOffline } = useNetworkStatus();

  const fetchProjects = useCallback(async (isRetry = false) => {
    const CACHE_KEY = 'projects:all';
    const OFFLINE_KEY = 'projects_offline';
    
    try {
      // If offline, use offline storage
      if (isOffline) {
        console.log('[useProjects] Device offline, using offline storage');
        const offlineData = await getOfflineData<Project[]>(OFFLINE_KEY);
        if (offlineData) {
          setProjects(offlineData);
          setLoading(false);
          setError(null);
          return;
        }
        throw new Error('No offline data available. Please connect to the internet.');
      }
      
      // Try cache first (unless retrying)
      if (!isRetry) {
        const cachedProjects = cache.get<Project[]>(CACHE_KEY);
        if (cachedProjects) {
          console.log('[useProjects] Using cached data');
          setProjects(cachedProjects);
          setLoading(false);
          setError(null);
          
          // Background refresh
          projectsApi.getProjects()
            .then(response => {
              const mappedProjects = (response.value || []).map(p => ({
                ...p,
                name: p.title,
                type: 'commercial' as ProjectType,
                location: '',
                start_date: p.startDate,
                end_date: p.endDate,
                created_at: p.createdAt,
                client: p.client ? { ...p.client, phone: '' } : undefined,
                status: p.status === 'PLANNING' ? 'planning' as ProjectStatus
                  : p.status === 'IN_PROGRESS' ? 'active' as ProjectStatus
                  : p.status === 'COMPLETED' ? 'completed' as ProjectStatus
                  : p.status === 'ON_HOLD' ? 'paused' as ProjectStatus
                  : 'planning' as ProjectStatus,
              })) as Project[];
              cache.set(CACHE_KEY, mappedProjects, CacheTTL.MEDIUM);
              saveOfflineData(OFFLINE_KEY, mappedProjects); // Persist for offline
              setProjects(mappedProjects);
            })
            .catch(err => {
              console.error('[useProjects] Background refresh failed:', err);
            });
          
          return;
        }
      }
      
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await projectsApi.getProjects();
      // Backend returns { value: Project[], Count: number }
      // Map backend projects to UI-compatible format
      const mappedProjects = (response.value || []).map(p => ({
        ...p,
        // Map backend fields to UI expectations
        name: p.title, // UI uses 'name', backend uses 'title'
        type: 'commercial' as ProjectType, // Backend doesn't have type yet, default
        location: '', // Backend doesn't have location yet
        // Legacy aliases for backward compatibility
        start_date: p.startDate,
        end_date: p.endDate,
        created_at: p.createdAt,
        client: p.client ? {
          ...p.client,
          phone: '', // Backend doesn't have phone yet
        } : undefined,
        // Map backend status (PLANNING, IN_PROGRESS, etc) to UI status (planning, active, etc)
        status: p.status === 'PLANNING' ? 'planning' as ProjectStatus
          : p.status === 'IN_PROGRESS' ? 'active' as ProjectStatus
          : p.status === 'COMPLETED' ? 'completed' as ProjectStatus
          : p.status === 'ON_HOLD' ? 'paused' as ProjectStatus
          : 'planning' as ProjectStatus,
      })) as Project[];
      
      // Cache the mapped projects
      cache.set(CACHE_KEY, mappedProjects, CacheTTL.MEDIUM);
      
      // Save to offline storage
      await saveOfflineData(OFFLINE_KEY, mappedProjects);
      
      setProjects(mappedProjects);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load projects');
      setError(error);
      console.error('[useProjects] Error:', err);
      setProjects([]);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProjects();
    }
  }, [autoFetch, fetchProjects]);

  const handleRetry = useCallback(async () => {
    await fetchProjects(true);
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    retrying,
    pagination: null, // Backend doesn't provide pagination yet
    refresh: handleRetry,
    refreshProjects: handleRetry, // Alias for backward compatibility
    fetchMore: async () => {}, // No-op: no pagination support
    hasMore: false, // No pagination support
  };
}

/**
 * Hook to fetch single project detail by ID
 * Uses real API endpoint: GET /projects/:id (protected)
 */
export function useProjectDetail(projectId: number | null) {
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
      const data = await projectsApi.getProject(projectId);
      // Map backend project to UI format
      const mappedProject: Project = {
        ...data,
        name: data.title,
        type: 'commercial' as ProjectType,
        location: '',
        progress: undefined,
        // Legacy aliases for backward compatibility
        start_date: data.startDate,
        end_date: data.endDate,
        created_at: data.createdAt,
        client: data.client ? {
          ...data.client,
          phone: '',
        } : null,
        status: data.status === 'PLANNING' ? 'planning'
          : data.status === 'IN_PROGRESS' ? 'active'
          : data.status === 'COMPLETED' ? 'completed'
          : data.status === 'ON_HOLD' ? 'paused'
          : 'planning',
      };
      setProject(mappedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      console.error('[useProjectDetail] Error:', err);
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
    refresh: fetchProject,
  };
}
