// Construction Projects Hook
// React hook for managing construction projects state and operations

import { useAuth } from '@/context/AuthContext';
import { constructionProjectService } from '@/services/constructionProjects';
import {
    ConstructionProject,
    CreateProjectFormData,
    ProjectStatsResponse,
    ProjectTemplate,
    UpdateProjectFormData
} from '@/types/construction';
import { useCallback, useEffect, useState } from 'react';

export interface UseConstructionProjectsOptions {
  autoFetch?: boolean;
  pageSize?: number;
}

export interface UseConstructionProjectsResult {
  // Data
  projects: ConstructionProject[];
  currentProject: ConstructionProject | null;
  stats: ProjectStatsResponse | null;
  templates: ProjectTemplate[];
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchProjects: (params?: { page?: number; status?: string; search?: string }) => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  createProject: (data: CreateProjectFormData) => Promise<ConstructionProject | null>;
  updateProject: (projectId: string, data: UpdateProjectFormData) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  
  // Utility functions
  refreshProjects: () => Promise<void>;
  clearError: () => void;
  resetCurrentProject: () => void;
}

export const useConstructionProjects = (options: UseConstructionProjectsOptions = {}): UseConstructionProjectsResult => {
  const { autoFetch = true, pageSize = 10 } = options;
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [currentProject, setCurrentProject] = useState<ConstructionProject | null>(null);
  const [stats, setStats] = useState<ProjectStatsResponse | null>(null);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    hasMore: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset current project
  const resetCurrentProject = useCallback(() => {
    setCurrentProject(null);
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async (params: { 
    page?: number; 
    status?: string; 
    search?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { page = 1, status, search } = params;
      
      const response = await constructionProjectService.getMyProjects({
        page,
        limit: pageSize,
        status,
        search,
      });
      
      setProjects(response.projects);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        hasMore: response.has_more,
      });
      
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách dự án');
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Fetch single project
  const fetchProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const project = await constructionProjectService.getProject(projectId);
      setCurrentProject(project);
      
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin dự án');
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create project
  const createProject = useCallback(async (data: CreateProjectFormData): Promise<ConstructionProject | null> => {
    try {
      setCreating(true);
      setError(null);
      
      // Validate data
      const validation = constructionProjectService.validateProjectData(data);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return null;
      }
      
      const project = await constructionProjectService.createProject(data);
      
      // Add to projects list
      setProjects(prev => [project, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      
      return project;
      
    } catch (err: any) {
      setError(err.message || 'Không thể tạo dự án');
      console.error('Failed to create project:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (projectId: string, data: UpdateProjectFormData): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedProject = await constructionProjectService.updateProject(projectId, data);
      
      // Update in projects list
      setProjects(prev => 
        prev.map(p => p.id === projectId ? updatedProject : p)
      );
      
      // Update current project if it's the same
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      return true;
      
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật dự án');
      console.error('Failed to update project:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [currentProject]);

  // Delete project
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      
      await constructionProjectService.deleteProject(projectId);
      
      // Remove from projects list
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      
      // Clear current project if it's the same
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
      }
      
      return true;
      
    } catch (err: any) {
      setError(err.message || 'Không thể xóa dự án');
      console.error('Failed to delete project:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [currentProject]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await constructionProjectService.getProjectStats(user?.id);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, [user?.id]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const templatesData = await constructionProjectService.getProjectTemplates();
      setTemplates(templatesData);
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
    }
  }, []);

  // Refresh projects
  const refreshProjects = useCallback(async () => {
    await fetchProjects({ page: 1 });
  }, [fetchProjects]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && user) {
      fetchProjects();
      fetchStats();
      fetchTemplates();
    }
  }, [autoFetch, user, fetchProjects, fetchStats, fetchTemplates]);

  return {
    // Data
    projects,
    currentProject,
    stats,
    templates,
    pagination,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    
    // Error handling
    error,
    
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchStats,
    fetchTemplates,
    refreshProjects,
    clearError,
    resetCurrentProject,
  };
};

// Hook for admin to manage all projects
export const useAdminConstructionProjects = () => {
  const { user } = useAuth();
  const [allProjects, setAllProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProjects = useCallback(async (params: {
    page?: number;
    status?: string;
    project_type?: string;
    search?: string;
  } = {}) => {
    if (!user || !user.id.includes('admin')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await constructionProjectService.getProjects(params);
      setAllProjects(response.projects);
      
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách dự án');
      console.error('Failed to fetch all projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const assignAdmin = useCallback(async (projectId: string, adminId: string): Promise<boolean> => {
    try {
      await constructionProjectService.assignAdmin(projectId, adminId);
      
      // Update projects list
      setAllProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, assigned_admin_id: adminId }
            : p
        )
      );
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Không thể phân công admin');
      return false;
    }
  }, []);

  const updateProjectStatus = useCallback(async (
    projectId: string, 
    status: ConstructionProject['status'],
    notes?: string
  ): Promise<boolean> => {
    try {
      await constructionProjectService.updateProjectStatus(projectId, status, notes);
      
      // Update projects list
      setAllProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, status, admin_notes: notes }
            : p
        )
      );
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật trạng thái');
      return false;
    }
  }, []);

  useEffect(() => {
    if (user && user.id.includes('admin')) {
      fetchAllProjects();
    }
  }, [user, fetchAllProjects]);

  return {
    projects: allProjects,
    loading,
    error,
    fetchAllProjects,
    assignAdmin,
    updateProjectStatus,
    clearError: () => setError(null),
  };
};
