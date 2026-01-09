/**
 * Project Progress Hook
 * Comprehensive hook for project progress tracking
 */

import { useCallback, useEffect, useState } from 'react';
import { projectProgressService } from '../../../services/projectProgressService';
import { ProjectProgress, UserRole } from '../../../types/projectProgress';

export const useProjectProgress = (projectId: string, userRole: UserRole) => {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectProgressService.getProjectProgress(projectId);
      
      if (response.success && response.data) {
        setProgress(response.data);
      } else {
        setError('Failed to load project progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const refresh = useCallback(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refresh,
  };
};
