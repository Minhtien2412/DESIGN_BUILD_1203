/**
 * Perfex CRM Sync Context
 * ========================
 * 
 * React Context để quản lý đồng bộ dữ liệu Perfex CRM
 * 
 * Features:
 * - Auto sync khi app mở
 * - Manual sync trigger
 * - Real-time data updates
 * - Loading states
 * - Error handling
 * 
 * @author ThietKeResort Team
 * @since 2025-12-30
 */

import perfexSync, {
    Customer,
    DashboardData,
    Project,
    SyncEvent,
    SyncState,
} from '@/services/perfexSync';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ==================== TYPES ====================

interface PerfexSyncContextType {
  // State
  syncState: SyncState;
  isLoading: boolean;
  error: string | null;
  
  // Data
  customers: Customer[];
  projects: Project[];
  dashboard: DashboardData | null;
  
  // Actions
  sync: (force?: boolean) => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearCache: () => Promise<void>;
  
  // Helpers
  getProjectById: (id: string) => Project | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getProjectsByCustomer: (customerId: string) => Project[];
}

const defaultContext: PerfexSyncContextType = {
  syncState: {
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
    syncProgress: 0,
  },
  isLoading: true,
  error: null,
  customers: [],
  projects: [],
  dashboard: null,
  sync: async () => {},
  refreshCustomers: async () => {},
  refreshProjects: async () => {},
  refreshDashboard: async () => {},
  clearCache: async () => {},
  getProjectById: () => undefined,
  getCustomerById: () => undefined,
  getProjectsByCustomer: () => [],
};

// ==================== CONTEXT ====================

const PerfexSyncContext = createContext<PerfexSyncContextType>(defaultContext);

// ==================== PROVIDER ====================

export function PerfexSyncProvider({ children }: { children: React.ReactNode }) {
  const [syncState, setSyncState] = useState<SyncState>(defaultContext.syncState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  
  const appState = useRef(AppState.currentState);

  // ========== INITIALIZE ==========

  useEffect(() => {
    initializeSync();
    
    // Handle app state changes (sync when app comes to foreground)
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      perfexSync.stopAutoSync();
    };
  }, []);

  const initializeSync = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize sync manager
      await perfexSync.initialize();
      
      // Load initial data from cache
      const [cachedCustomers, cachedProjects, cachedDashboard] = await Promise.all([
        perfexSync.getCustomers(false),
        perfexSync.getProjects(false),
        perfexSync.getDashboard(false),
      ]);
      
      setCustomers(cachedCustomers);
      setProjects(cachedProjects);
      setDashboard(cachedDashboard);
      
      // Setup event listeners
      setupEventListeners();
      
      // Trigger initial sync
      await perfexSync.syncAll();
      
    } catch (err: any) {
      console.error('[PerfexSyncContext] Init error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    perfexSync.on('sync', (event: SyncEvent) => {
      switch (event.type) {
        case 'sync_start':
          setSyncState(perfexSync.getState());
          break;
          
        case 'sync_complete':
          setSyncState(perfexSync.getState());
          setError(null);
          break;
          
        case 'sync_error':
          setSyncState(perfexSync.getState());
          setError(event.error || 'Sync error');
          break;
          
        case 'data_updated':
          handleDataUpdate(event.entity, event.data);
          break;
      }
    });
  };

  const handleDataUpdate = (entity: string | undefined, data: any) => {
    switch (entity) {
      case 'customers':
        setCustomers(data);
        break;
      case 'projects':
        setProjects(data);
        break;
      case 'dashboard':
        setDashboard(data);
        break;
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Sync when app comes to foreground
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('[PerfexSyncContext] App came to foreground, syncing...');
      perfexSync.syncAll();
    }
    appState.current = nextAppState;
  };

  // ========== ACTIONS ==========

  const sync = useCallback(async (force = false) => {
    try {
      setError(null);
      await perfexSync.syncAll(force);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const refreshCustomers = useCallback(async () => {
    try {
      const data = await perfexSync.syncCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const data = await perfexSync.syncProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await perfexSync.syncDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const clearCache = useCallback(async () => {
    await perfexSync.clearCache();
    setCustomers([]);
    setProjects([]);
    setDashboard(null);
  }, []);

  // ========== HELPERS ==========

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const getCustomerById = useCallback((id: string) => {
    return customers.find(c => c.userid === id);
  }, [customers]);

  const getProjectsByCustomer = useCallback((customerId: string) => {
    return projects.filter(p => p.clientid === customerId);
  }, [projects]);

  // ========== RENDER ==========

  const value: PerfexSyncContextType = {
    syncState,
    isLoading,
    error,
    customers,
    projects,
    dashboard,
    sync,
    refreshCustomers,
    refreshProjects,
    refreshDashboard,
    clearCache,
    getProjectById,
    getCustomerById,
    getProjectsByCustomer,
  };

  return (
    <PerfexSyncContext.Provider value={value}>
      {children}
    </PerfexSyncContext.Provider>
  );
}

// ==================== HOOKS ====================

/**
 * Hook để sử dụng Perfex Sync context
 */
export function usePerfexSync() {
  const context = useContext(PerfexSyncContext);
  if (!context) {
    throw new Error('usePerfexSync must be used within PerfexSyncProvider');
  }
  return context;
}

/**
 * Hook để lấy danh sách customers
 */
export function usePerfexCustomers() {
  const { customers, isLoading, error, refreshCustomers } = usePerfexSync();
  return {
    customers,
    isLoading,
    error,
    refresh: refreshCustomers,
  };
}

/**
 * Hook để lấy danh sách projects
 */
export function usePerfexProjects() {
  const { projects, isLoading, error, refreshProjects, getProjectsByCustomer } = usePerfexSync();
  return {
    projects,
    isLoading,
    error,
    refresh: refreshProjects,
    getByCustomer: getProjectsByCustomer,
  };
}

/**
 * Hook để lấy dashboard data
 */
export function usePerfexDashboard() {
  const { dashboard, isLoading, error, refreshDashboard } = usePerfexSync();
  return {
    dashboard,
    isLoading,
    error,
    refresh: refreshDashboard,
  };
}

/**
 * Hook để lấy chi tiết project
 */
export function usePerfexProject(projectId: string) {
  const { getProjectById, getCustomerById, isLoading } = usePerfexSync();
  const project = getProjectById(projectId);
  const customer = project ? getCustomerById(project.clientid) : undefined;
  
  return {
    project,
    customer,
    isLoading,
  };
}

/**
 * Hook để lấy sync state
 */
export function usePerfexSyncState() {
  const { syncState, sync } = usePerfexSync();
  return {
    ...syncState,
    sync,
  };
}

export default PerfexSyncContext;
