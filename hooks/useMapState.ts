/**
 * useMapState Hook
 * Manage canvas map state (zoom, pan, viewport)
 */

import { useState, useCallback, useEffect } from 'react';
import { constructionMapApi, MapState } from '../services/api/constructionMapApi';

export interface UseMapStateProps {
  projectId: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export interface UseMapStateReturn {
  mapState: MapState | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Actions
  saveMapState: (state: Partial<MapState>) => Promise<void>;
  loadMapState: () => Promise<void>;
  
  // Convenience methods
  updateZoom: (zoom: number) => Promise<void>;
  updatePan: (panX: number, panY: number) => Promise<void>;
  updateViewport: (width: number, height: number) => Promise<void>;
}

export function useMapState({
  projectId,
  autoSave = false,
  autoSaveInterval = 30000,
}: UseMapStateProps): UseMapStateReturn {
  
  const [mapState, setMapState] = useState<MapState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingState, setPendingState] = useState<Partial<MapState> | null>(null);
  
  // Load map state
  const loadMapState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await constructionMapApi.getMapState(projectId);
      setMapState(res.data);
      setLoading(false);
    } catch (err: any) {
      // Map state might not exist yet, which is OK
      if (err.response?.status === 404) {
        setMapState(null);
      } else {
        setError(err.message || 'Failed to load map state');
      }
      setLoading(false);
    }
  }, [projectId]);
  
  // Save map state
  const saveMapState = useCallback(async (state: Partial<MapState>) => {
    try {
      setSaving(true);
      setError(null);
      
      const res = await constructionMapApi.saveMapState(projectId, state);
      setMapState(res.data);
      setPendingState(null);
      setSaving(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save map state');
      setSaving(false);
    }
  }, [projectId]);
  
  // Update zoom
  const updateZoom = useCallback(async (zoom: number) => {
    const newState = { ...mapState, zoom, projectId };
    setPendingState(newState);
    
    if (!autoSave) {
      await saveMapState(newState);
    }
  }, [mapState, projectId, autoSave, saveMapState]);
  
  // Update pan
  const updatePan = useCallback(async (panX: number, panY: number) => {
    const newState = { ...mapState, panX, panY, projectId };
    setPendingState(newState);
    
    if (!autoSave) {
      await saveMapState(newState);
    }
  }, [mapState, projectId, autoSave, saveMapState]);
  
  // Update viewport
  const updateViewport = useCallback(async (width: number, height: number) => {
    const newState = { 
      ...mapState, 
      viewport: { width, height },
      projectId 
    };
    setPendingState(newState);
    
    if (!autoSave) {
      await saveMapState(newState);
    }
  }, [mapState, projectId, autoSave, saveMapState]);
  
  // Auto-save effect
  useEffect(() => {
    if (autoSave && pendingState) {
      const timer = setTimeout(() => {
        saveMapState(pendingState);
      }, autoSaveInterval);
      
      return () => clearTimeout(timer);
    }
  }, [autoSave, autoSaveInterval, pendingState, saveMapState]);
  
  // Initial load
  useEffect(() => {
    loadMapState();
  }, [loadMapState]);
  
  return {
    mapState,
    loading,
    saving,
    error,
    
    saveMapState,
    loadMapState,
    
    updateZoom,
    updatePan,
    updateViewport,
  };
}
