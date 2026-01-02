/**
 * useConstructionStages Hook
 * Simplified hook for stage management
 */

import { useState, useCallback, useEffect } from 'react';
import { constructionMapApi, Stage } from '../services/api/constructionMapApi';

export interface UseConstructionStagesProps {
  projectId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseConstructionStagesReturn {
  stages: Stage[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createStage: (data: Partial<Stage>) => Promise<Stage | null>;
  updateStage: (id: string, data: Partial<Stage>) => Promise<Stage | null>;
  deleteStage: (id: string) => Promise<boolean>;
  refreshStages: () => Promise<void>;
  
  // Helpers
  getStage: (id: string) => Stage | undefined;
  activeStages: Stage[];
  completedStages: Stage[];
}

export function useConstructionStages({
  projectId,
  autoRefresh = false,
  refreshInterval = 30000,
}: UseConstructionStagesProps): UseConstructionStagesReturn {
  
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load stages
  const loadStages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await constructionMapApi.getStages(projectId);
      setStages(res.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load stages');
      setLoading(false);
    }
  }, [projectId]);
  
  // Create stage
  const createStage = useCallback(async (data: Partial<Stage>): Promise<Stage | null> => {
    try {
      const res = await constructionMapApi.createStage({ ...data, projectId });
      const newStage = res.data;
      
      setStages(prev => [...prev, newStage]);
      return newStage;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [projectId]);
  
  // Update stage
  const updateStage = useCallback(async (id: string, data: Partial<Stage>): Promise<Stage | null> => {
    try {
      const res = await constructionMapApi.updateStage(id, data);
      const updatedStage = res.data;
      
      setStages(prev => prev.map(s => s.id === id ? updatedStage : s));
      return updatedStage;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);
  
  // Delete stage
  const deleteStage = useCallback(async (id: string): Promise<boolean> => {
    try {
      await constructionMapApi.deleteStage(id);
      setStages(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);
  
  // Refresh
  const refreshStages = useCallback(async () => {
    await loadStages();
  }, [loadStages]);
  
  // Get stage by ID
  const getStage = useCallback((id: string) => {
    return stages.find(s => s.id === id);
  }, [stages]);
  
  // Computed
  const activeStages = stages.filter(s => s.status === 'active');
  const completedStages = stages.filter(s => s.status === 'completed');
  
  // Effects
  useEffect(() => {
    loadStages();
  }, [loadStages]);
  
  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(refreshStages, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, refreshInterval, refreshStages]);
  
  return {
    stages,
    loading,
    error,
    
    createStage,
    updateStage,
    deleteStage,
    refreshStages,
    
    getStage,
    activeStages,
    completedStages,
  };
}
