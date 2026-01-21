/**
 * useConstructionMap Hook
 * Main hook for Construction Map integration
 * Combines canvas engine, API, and WebSocket
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { constructionMapApi } from '../services/api/constructionMapApi';
import { constructionSocket, TaskMovedEvent, TaskStatusChangedEvent, UserJoinedEvent, UserLeftEvent, ZoomChangedEvent } from '../services/websocket/construction-socket';
import { MapState, Stage, Task } from '../types/construction-map';

// Import Construction Map Engine types
// Note: Adjust import path based on how library is integrated
type ConstructionMapEngine = any; // TODO: Import from @construction-app/canvas-map

// ============================================
// Hook Props Interface
// ============================================

export interface UseConstructionMapProps {
  projectId: string;
  userId?: string;
  userName?: string;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  enableWebSocket?: boolean;
}

// ============================================
// Hook Return Interface
// ============================================

export interface UseConstructionMapReturn {
  // Container ref for canvas
  containerRef: React.RefObject<HTMLDivElement | null>;
  
  // Canvas engine instance
  engine: ConstructionMapEngine | null;
  
  // Loading states
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  
  // Error state
  error: string | null;
  
  // Data
  tasks: Task[];
  stages: Stage[];
  mapState: MapState | null;
  
  // UI state
  zoom: number;
  selectedTaskId: string | null;
  selectedStageId: string | null;
  
  // Collaboration
  activeUsers: {
    userId: string;
    userName: string;
    color?: string;
  }[];
  
  // Actions - Canvas Controls
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number) => void;
  resetView: () => void;
  fitToScreen: () => void;
  
  // Actions - Tasks
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  selectTask: (id: string | null) => void;
  
  // Actions - Stages
  createStage: (data: Partial<Stage>) => Promise<Stage | null>;
  updateStage: (id: string, data: Partial<Stage>) => Promise<Stage | null>;
  deleteStage: (id: string) => Promise<boolean>;
  selectStage: (id: string | null) => void;
  
  // Actions - Map State
  saveMapState: () => Promise<void>;
  reloadData: () => Promise<void>;
  
  // Connection status
  isConnected: boolean;
  isWebSocketConnected: boolean;
}

// ============================================
// Main Hook
// ============================================

export function useConstructionMap({
  projectId,
  userId = 'anonymous',
  userName = 'Guest',
  readOnly = false,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  enableWebSocket = true,
}: UseConstructionMapProps): UseConstructionMapReturn {
  
  // ==========================================
  // Refs
  // ==========================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ConstructionMapEngine | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // ==========================================
  // State
  // ==========================================
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [mapState, setMapState] = useState<MapState | null>(null);
  
  const [zoom, setZoom] = useState(100);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  
  const [activeUsers, setActiveUsers] = useState<{
    userId: string;
    userName: string;
    color?: string;
  }[]>([]);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  
  // ==========================================
  // Load Project Data
  // ==========================================
  
  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[useConstructionMap] Loading project: ${projectId}`);
      
      // Load all data in parallel
      const [projectRes, stateRes] = await Promise.all([
        constructionMapApi.getProject(projectId),
        constructionMapApi.getMapState(projectId).catch(() => ({ data: null })),
      ]);
      
      const loadedTasks = projectRes.data.tasks || [];
      const loadedStages = projectRes.data.stages || [];
      const loadedState = stateRes.data;
      
      setTasks(loadedTasks);
      setStages(loadedStages);
      setMapState(loadedState);
      
      console.log(`[useConstructionMap] Loaded ${loadedStages.length} stages, ${loadedTasks.length} tasks`);
      
      // Initialize canvas if container is ready
      if (containerRef.current && !engineRef.current) {
        initializeCanvas(loadedStages, loadedTasks, loadedState);
      }
      
      setIsConnected(true);
      setLoading(false);
      
    } catch (err: any) {
      console.error('[useConstructionMap] Failed to load project:', err);
      setError(err.message || 'Failed to load construction map');
      setLoading(false);
      setIsConnected(false);
    }
  }, [projectId]);
  
  // ==========================================
  // Initialize Canvas Engine
  // ==========================================
  
  const initializeCanvas = useCallback((
    loadedStages: Stage[],
    loadedTasks: Task[],
    loadedState: MapState | null
  ) => {
    if (!containerRef.current) {
      console.warn('[useConstructionMap] Container not ready');
      return;
    }
    
    try {
      // TODO: Initialize ConstructionMapEngine
      // const engine = new ConstructionMapEngine({
      //   container: containerRef.current,
      //   minZoom: 0.1,
      //   maxZoom: 5.0,
      //   initialZoom: loadedState?.zoom || 1.0,
      //   readOnly,
      // });
      
      // engineRef.current = engine;
      
      // // Add stages first
      // loadedStages.forEach((stage) => {
      //   engine.addStage({
      //     id: stage.id,
      //     number: stage.number,
      //     label: stage.label,
      //     x: stage.x,
      //     y: stage.y,
      //     status: stage.status,
      //     color: stage.color,
      //   });
      // });
      
      // // Add tasks
      // loadedTasks.forEach((task) => {
      //   engine.addTask({
      //     id: task.id,
      //     stageId: task.stageId,
      //     label: task.label,
      //     x: task.x,
      //     y: task.y,
      //     status: task.status,
      //     progress: task.progress,
      //   });
      // });
      
      // // Restore map state
      // if (loadedState) {
      //   engine.zoomTo(loadedState.zoom);
      //   engine.panTo(loadedState.panX, loadedState.panY);
      // }
      
      // // Setup engine event listeners
      // setupEngineEvents(engine);
      
      console.log('[useConstructionMap] Canvas initialized');
      
    } catch (err) {
      console.error('[useConstructionMap] Failed to initialize canvas:', err);
    }
  }, [readOnly]);
  
  // ==========================================
  // Setup Engine Events
  // ==========================================
  
  const setupEngineEvents = useCallback((engine: ConstructionMapEngine) => {
    // TODO: Setup event listeners
    // engine.on('task-selected', (task: any) => {
    //   setSelectedTaskId(task?.id || null);
    // });
    
    // engine.on('stage-selected', (stage: any) => {
    //   setSelectedStageId(stage?.id || null);
    // });
    
    // engine.on('zoom-changed', ({ zoom }: any) => {
    //   setZoom(Math.round(zoom * 100));
    //   if (enableWebSocket && !readOnly) {
    //     constructionSocket.emitZoomChanged(zoom);
    //   }
    // });
    
    // engine.on('task-moved', async ({ task }: any) => {
    //   if (!readOnly) {
    //     try {
    //       await constructionMapApi.moveTask(task.id, task.x, task.y);
    //       if (enableWebSocket) {
    //         constructionSocket.emitTaskMoved(task.id, task.x, task.y);
    //       }
    //     } catch (err) {
    //       console.error('Failed to save task position:', err);
    //     }
    //   }
    // });
  }, [enableWebSocket, readOnly]);
  
  // ==========================================
  // Setup WebSocket
  // ==========================================
  
  const setupWebSocket = useCallback(() => {
    if (!enableWebSocket || readOnly) return;
    
    console.log('[useConstructionMap] Setting up WebSocket...');
    
    const socket = constructionSocket.connect(projectId, userId, userName) as any;
    if (!socket) return;
    
    // Connection events
    socket.on('connect', () => {
      console.log('[useConstructionMap] WebSocket connected');
      setIsWebSocketConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('[useConstructionMap] WebSocket disconnected');
      setIsWebSocketConnected(false);
    });
    
    // Real-time events
    constructionSocket.onTaskMoved(({ taskId, x, y }: TaskMovedEvent) => {
      console.log(`[useConstructionMap] Task moved: ${taskId}`);
      // TODO: Update engine
      // engineRef.current?.moveObject(taskId, x, y);
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, x, y } : t)
      );
    });
    
    constructionSocket.onTaskStatusChanged(({ taskId, status }: TaskStatusChangedEvent) => {
      console.log(`[useConstructionMap] Task status changed: ${taskId} -> ${status}`);
      // TODO: Update engine
      // engineRef.current?.updateTaskStatus(taskId, status);
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status } : t)
      );
    });
    
    constructionSocket.onZoomChanged(({ zoom }: ZoomChangedEvent) => {
      // TODO: Update engine
      // engineRef.current?.zoomTo(zoom);
      setZoom(Math.round(zoom * 100));
    });
    
    constructionSocket.onUserJoined(({ userId: joinedUserId, userName: joinedUserName }: UserJoinedEvent) => {
      console.log(`[useConstructionMap] User joined: ${joinedUserName}`);
      setActiveUsers(prev => {
        if (prev.find(u => u.userId === joinedUserId)) return prev;
        return [...prev, { userId: joinedUserId, userName: joinedUserName }];
      });
    });
    
    constructionSocket.onUserLeft(({ userId: leftUserId }: UserLeftEvent) => {
      console.log(`[useConstructionMap] User left: ${leftUserId}`);
      setActiveUsers(prev => prev.filter(u => u.userId !== leftUserId));
    });
    
  }, [enableWebSocket, readOnly, projectId, userId, userName]);
  
  // ==========================================
  // Auto Save
  // ==========================================
  
  const setupAutoSave = useCallback(() => {
    if (!autoSave || readOnly) return;
    
    console.log(`[useConstructionMap] Auto-save enabled (${autoSaveInterval}ms)`);
    
    autoSaveTimerRef.current = setInterval(async () => {
      try {
        await saveMapStateInternal();
      } catch (err) {
        console.error('[useConstructionMap] Auto-save failed:', err);
      }
    }, autoSaveInterval);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, readOnly]);
  
  // ==========================================
  // Actions - Canvas Controls
  // ==========================================
  
  const zoomIn = useCallback(() => {
    // TODO: Call engine method
    // engineRef.current?.zoomIn();
    const newZoom = zoom * 1.2;
    setZoom(Math.round(newZoom));
    if (enableWebSocket && !readOnly) {
      constructionSocket.emitZoomChanged(newZoom / 100);
    }
  }, [zoom, enableWebSocket, readOnly]);
  
  const zoomOut = useCallback(() => {
    // TODO: Call engine method
    // engineRef.current?.zoomOut();
    const newZoom = zoom * 0.8;
    setZoom(Math.round(newZoom));
    if (enableWebSocket && !readOnly) {
      constructionSocket.emitZoomChanged(newZoom / 100);
    }
  }, [zoom, enableWebSocket, readOnly]);
  
  const zoomTo = useCallback((level: number) => {
    // TODO: Call engine method
    // engineRef.current?.zoomTo(level);
    setZoom(Math.round(level * 100));
    if (enableWebSocket && !readOnly) {
      constructionSocket.emitZoomChanged(level);
    }
  }, [enableWebSocket, readOnly]);
  
  const resetView = useCallback(() => {
    // TODO: Call engine method
    // engineRef.current?.resetView();
    setZoom(100);
  }, []);
  
  const fitToScreen = useCallback(() => {
    // TODO: Call engine method
    // engineRef.current?.fitToScreen();
  }, []);
  
  // ==========================================
  // Actions - Tasks
  // ==========================================
  
  const createTask = useCallback(async (data: Partial<Task>): Promise<Task | null> => {
    try {
      setSyncing(true);
      const res = await constructionMapApi.createTask({ ...data, projectId });
      const newTask = res.data;
      
      setTasks(prev => [...prev, newTask]);
      // TODO: Add to engine
      // engineRef.current?.addTask(newTask);
      
      console.log(`[useConstructionMap] Task created: ${newTask.id}`);
      return newTask;
    } catch (err: any) {
      console.error('[useConstructionMap] Failed to create task:', err);
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [projectId]);
  
  const updateTask = useCallback(async (id: string, data: Partial<Task>): Promise<Task | null> => {
    try {
      setSyncing(true);
      const res = await constructionMapApi.updateTask(id, data);
      const updatedTask = res.data;
      
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      // TODO: Update engine
      // engineRef.current?.updateTask(id, data);
      
      return updatedTask;
    } catch (err: any) {
      console.error('[useConstructionMap] Failed to update task:', err);
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, []);
  
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      setSyncing(true);
      await constructionMapApi.deleteTask(id);
      
      setTasks(prev => prev.filter(t => t.id !== id));
      // TODO: Remove from engine
      // engineRef.current?.removeObject(id);
      
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
      
      return true;
    } catch (err: any) {
      console.error('[useConstructionMap] Failed to delete task:', err);
      setError(err.message);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [selectedTaskId]);
  
  const selectTask = useCallback((id: string | null) => {
    setSelectedTaskId(id);
    // TODO: Update engine selection
    // engineRef.current?.selectTask(id);
  }, []);
  
  // ==========================================
  // Actions - Stages
  // ==========================================
  
  const createStage = useCallback(async (data: Partial<Stage>): Promise<Stage | null> => {
    try {
      setSyncing(true);
      const res = await constructionMapApi.createStage({ ...data, projectId });
      const newStage = res.data;
      
      setStages(prev => [...prev, newStage]);
      // TODO: Add to engine
      // engineRef.current?.addStage(newStage);
      
      return newStage;
    } catch (err: any) {
      console.error('[useConstructionMap] Failed to create stage:', err);
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [projectId]);
  
  const updateStage = useCallback(async (id: string, data: Partial<Stage>): Promise<Stage | null> => {
    try {
      setSyncing(true);
      const res = await constructionMapApi.updateStage(id, data);
      const updatedStage = res.data;
      
      setStages(prev => prev.map(s => s.id === id ? updatedStage : s));
      // TODO: Update engine
      // engineRef.current?.updateStage(id, data);
      
      return updatedStage;
    } catch (err: any) {
      console.error('[useConstructionMap] Failed to update stage:', err);
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, []);
  
  const deleteStage = useCallback(async (id: string): Promise<boolean> => {
    try {
      setSyncing(true);
      await constructionMapApi.deleteStage(id);
      
      setStages(prev => prev.filter(s => s.id !== id));
      // TODO: Remove from engine
      // engineRef.current?.removeObject(id);
      
      if (selectedStageId === id) {
        setSelectedStageId(null);
      }
      
      return true;
    } catch (err: any) {
      console.error('[useConstructionMap] Failed to delete stage:', err);
      setError(err.message);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [selectedStageId]);
  
  const selectStage = useCallback((id: string | null) => {
    setSelectedStageId(id);
    // TODO: Update engine selection
    // engineRef.current?.selectStage(id);
  }, []);
  
  // ==========================================
  // Actions - Map State
  // ==========================================
  
  const saveMapStateInternal = async () => {
    if (readOnly || !engineRef.current) return;
    
    try {
      // TODO: Get state from engine
      // const zoom = engineRef.current.getZoom();
      // const { x: panX, y: panY } = engineRef.current.getPan();
      // const { width, height } = engineRef.current.getViewport();
      
      const state: Partial<MapState> = {
        projectId,
        zoom: zoom / 100,
        panX: 0,
        panY: 0,
        viewport: { width: 800, height: 600 },
      };
      
      await constructionMapApi.saveMapState(projectId, state);
      console.log('[useConstructionMap] Map state saved');
    } catch (err) {
      console.error('[useConstructionMap] Failed to save map state:', err);
    }
  };
  
  const saveMapState = useCallback(async () => {
    try {
      setSaving(true);
      await saveMapStateInternal();
    } finally {
      setSaving(false);
    }
  }, [readOnly, projectId, zoom]);
  
  const reloadData = useCallback(async () => {
    await loadProjectData();
  }, [loadProjectData]);
  
  // ==========================================
  // Effects
  // ==========================================
  
  // Initialize
  useEffect(() => {
    loadProjectData();
    
    return () => {
      // Cleanup
      if (engineRef.current) {
        // TODO: Destroy engine
        // engineRef.current.destroy();
        engineRef.current = null;
      }
      
      if (enableWebSocket) {
        constructionSocket.disconnect();
      }
      
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [loadProjectData]);
  
  // Setup WebSocket
  useEffect(() => {
    if (enableWebSocket && !loading && isConnected) {
      setupWebSocket();
    }
  }, [enableWebSocket, loading, isConnected, setupWebSocket]);
  
  // Setup Auto Save
  useEffect(() => {
    if (!loading && isConnected) {
      return setupAutoSave();
    }
  }, [loading, isConnected, setupAutoSave]);
  
  // ==========================================
  // Return
  // ==========================================
  
  return {
    containerRef,
    engine: engineRef.current,
    
    loading,
    saving,
    syncing,
    error,
    
    tasks,
    stages,
    mapState,
    
    zoom,
    selectedTaskId,
    selectedStageId,
    
    activeUsers,
    
    isConnected,
    isWebSocketConnected,
    
    zoomIn,
    zoomOut,
    zoomTo,
    resetView,
    fitToScreen,
    
    createTask,
    updateTask,
    deleteTask,
    selectTask,
    
    createStage,
    updateStage,
    deleteStage,
    selectStage,
    
    saveMapState,
    reloadData,
  };
}

export default useConstructionMap;
