/**
 * Perfex Full Sync Context
 * =========================
 * 
 * React Context cung cấp dữ liệu CRM đồng bộ cho toàn bộ App
 * Tự động sync khi app khởi động và khi quay lại foreground
 * 
 * @author ThietKeResort Team
 * @since 2025-12-30
 */

import perfexFullSync, {
    Contract,
    Customer,
    DashboardStats,
    Estimate,
    Expense,
    Invoice,
    Lead,
    Project,
    Staff,
    SyncEvent,
    SyncState,
    Task,
    Ticket,
} from '@/services/perfexFullSync';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ==================== CONTEXT TYPES ====================

interface PerfexFullSyncContextValue {
  // State
  syncState: SyncState;
  isLoading: boolean;
  error: string | null;
  
  // Data
  customers: Customer[];
  projects: Project[];
  staff: Staff[];
  invoices: Invoice[];
  leads: Lead[];
  tasks: Task[];
  tickets: Ticket[];
  estimates: Estimate[];
  contracts: Contract[];
  expenses: Expense[];
  dashboard: DashboardStats | null;
  
  // Available endpoints
  availableEndpoints: string[];
  isEndpointAvailable: (endpoint: string) => boolean;
  
  // Actions
  refresh: (entities?: string[]) => Promise<void>;
  refreshAll: () => Promise<void>;
  clearCache: () => Promise<void>;
  
  // Search helpers
  searchCustomers: (query: string) => Promise<Customer[]>;
  searchProjects: (query: string) => Promise<Project[]>;
  
  // Filter helpers
  getProjectsByCustomer: (customerId: string) => Project[];
  getInvoicesByCustomer: (customerId: string) => Invoice[];
  getTasksByProject: (projectId: string) => Task[];
  getCustomerById: (id: string) => Customer | undefined;
  getProjectById: (id: string) => Project | undefined;
  getStaffById: (id: string) => Staff | undefined;
}

const defaultDashboard: DashboardStats = {
  totalCustomers: 0,
  activeCustomers: 0,
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalStaff: 0,
  activeStaff: 0,
  totalInvoices: 0,
  paidInvoices: 0,
  unpaidInvoices: 0,
  overdueInvoices: 0,
  totalLeads: 0,
  convertedLeads: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  totalTickets: 0,
  openTickets: 0,
  totalEstimates: 0,
  acceptedEstimates: 0,
  totalContracts: 0,
  activeContracts: 0,
  totalExpenses: 0,
  totalRevenue: 0,
  totalOutstanding: 0,
  totalExpenseAmount: 0,
  projectsValue: 0,
  recentProjects: [],
  recentInvoices: [],
  recentLeads: [],
  recentTasks: [],
  projectsByStatus: {},
  invoicesByStatus: {},
  leadsByStatus: {},
  tasksByStatus: {},
};

// ==================== CONTEXT ====================

const PerfexFullSyncContext = createContext<PerfexFullSyncContextValue | null>(null);

// ==================== PROVIDER ====================

interface PerfexFullSyncProviderProps {
  children: ReactNode;
  autoSync?: boolean;
}

export function PerfexFullSyncProvider({ children, autoSync = true }: PerfexFullSyncProviderProps) {
  // Sync state
  const [syncState, setSyncState] = useState<SyncState>(perfexFullSync.getState());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [availableEndpoints, setAvailableEndpoints] = useState<string[]>([]);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await perfexFullSync.initialize();
        
        // Load initial data
        const [
          customersData,
          projectsData,
          staffData,
          invoicesData,
          leadsData,
          tasksData,
          ticketsData,
          estimatesData,
          contractsData,
          expensesData,
          dashboardData,
        ] = await Promise.all([
          perfexFullSync.getCustomers(),
          perfexFullSync.getProjects(),
          perfexFullSync.getStaff(),
          perfexFullSync.getInvoices(),
          perfexFullSync.getLeads(),
          perfexFullSync.getTasks(),
          perfexFullSync.getTickets(),
          perfexFullSync.getEstimates(),
          perfexFullSync.getContracts(),
          perfexFullSync.getExpenses(),
          perfexFullSync.getDashboard(),
        ]);

        setCustomers(customersData);
        setProjects(projectsData);
        setStaff(staffData);
        setInvoices(invoicesData);
        setLeads(leadsData);
        setTasks(tasksData);
        setTickets(ticketsData);
        setEstimates(estimatesData);
        setContracts(contractsData);
        setExpenses(expensesData);
        setDashboard(dashboardData);
        setAvailableEndpoints(perfexFullSync.getState().availableEndpoints);
        
      } catch (err: any) {
        setError(err.message);
        console.error('[PerfexFullSyncContext] Initialize error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Listen for sync events
  useEffect(() => {
    const handleSyncEvent = (event: SyncEvent) => {
      setSyncState(perfexFullSync.getState());

      switch (event.type) {
        case 'sync_start':
          setIsLoading(true);
          setError(null);
          break;
          
        case 'sync_complete':
          setIsLoading(false);
          break;
          
        case 'sync_error':
          setIsLoading(false);
          setError(event.error || 'Sync failed');
          break;
          
        case 'data_updated':
          if (event.entity && event.data) {
            switch (event.entity) {
              case 'customers':
                setCustomers(event.data);
                break;
              case 'projects':
                setProjects(event.data);
                break;
              case 'staff':
                setStaff(event.data);
                break;
              case 'invoices':
                setInvoices(event.data);
                break;
              case 'leads':
                setLeads(event.data);
                break;
              case 'tasks':
                setTasks(event.data);
                break;
              case 'tickets':
                setTickets(event.data);
                break;
              case 'estimates':
                setEstimates(event.data);
                break;
              case 'contracts':
                setContracts(event.data);
                break;
              case 'expenses':
                setExpenses(event.data);
                break;
              case 'dashboard':
                setDashboard(event.data);
                break;
            }
          }
          break;
          
        case 'endpoint_status':
          if (event.data?.available) {
            setAvailableEndpoints(event.data.available);
          }
          break;
      }
    };

    perfexFullSync.on('sync', handleSyncEvent);
    return () => {
      perfexFullSync.off('sync', handleSyncEvent);
    };
  }, []);

  // Handle app state changes
  useEffect(() => {
    if (!autoSync) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[PerfexFullSyncContext] App became active, syncing...');
        perfexFullSync.syncAll();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [autoSync]);

  // Actions
  const refresh = useCallback(async (entities?: string[]) => {
    if (!entities || entities.length === 0) {
      await perfexFullSync.syncAll(true);
    } else {
      // Refresh specific entities
      for (const entity of entities) {
        switch (entity) {
          case 'customers':
            setCustomers(await perfexFullSync.getCustomers(true));
            break;
          case 'projects':
            setProjects(await perfexFullSync.getProjects(true));
            break;
          case 'staff':
            setStaff(await perfexFullSync.getStaff(true));
            break;
          case 'invoices':
            setInvoices(await perfexFullSync.getInvoices(true));
            break;
          case 'leads':
            setLeads(await perfexFullSync.getLeads(true));
            break;
          case 'tasks':
            setTasks(await perfexFullSync.getTasks(true));
            break;
          case 'tickets':
            setTickets(await perfexFullSync.getTickets(true));
            break;
          case 'estimates':
            setEstimates(await perfexFullSync.getEstimates(true));
            break;
          case 'contracts':
            setContracts(await perfexFullSync.getContracts(true));
            break;
          case 'expenses':
            setExpenses(await perfexFullSync.getExpenses(true));
            break;
          case 'dashboard':
            setDashboard(await perfexFullSync.getDashboard(true));
            break;
        }
      }
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await perfexFullSync.syncAll(true);
  }, []);

  const clearCache = useCallback(async () => {
    await perfexFullSync.clearCache();
    setCustomers([]);
    setProjects([]);
    setStaff([]);
    setInvoices([]);
    setLeads([]);
    setTasks([]);
    setTickets([]);
    setEstimates([]);
    setContracts([]);
    setExpenses([]);
    setDashboard(null);
  }, []);

  // Search helpers
  const searchCustomers = useCallback(async (query: string) => {
    return perfexFullSync.searchCustomers(query);
  }, []);

  const searchProjects = useCallback(async (query: string) => {
    return perfexFullSync.searchProjects(query);
  }, []);

  // Filter helpers (memoized)
  const getProjectsByCustomer = useCallback((customerId: string) => {
    return projects.filter(p => p.clientid === customerId);
  }, [projects]);

  const getInvoicesByCustomer = useCallback((customerId: string) => {
    return invoices.filter(i => i.clientid === customerId);
  }, [invoices]);

  const getTasksByProject = useCallback((projectId: string) => {
    return tasks.filter(t => t.rel_type === 'project' && t.rel_id === projectId);
  }, [tasks]);

  const getCustomerById = useCallback((id: string) => {
    return customers.find(c => c.userid === id);
  }, [customers]);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const getStaffById = useCallback((id: string) => {
    return staff.find(s => s.staffid === id);
  }, [staff]);

  const isEndpointAvailable = useCallback((endpoint: string) => {
    return availableEndpoints.includes(endpoint);
  }, [availableEndpoints]);

  // Context value
  const value = useMemo<PerfexFullSyncContextValue>(() => ({
    syncState,
    isLoading,
    error,
    customers,
    projects,
    staff,
    invoices,
    leads,
    tasks,
    tickets,
    estimates,
    contracts,
    expenses,
    dashboard: dashboard || defaultDashboard,
    availableEndpoints,
    isEndpointAvailable,
    refresh,
    refreshAll,
    clearCache,
    searchCustomers,
    searchProjects,
    getProjectsByCustomer,
    getInvoicesByCustomer,
    getTasksByProject,
    getCustomerById,
    getProjectById,
    getStaffById,
  }), [
    syncState,
    isLoading,
    error,
    customers,
    projects,
    staff,
    invoices,
    leads,
    tasks,
    tickets,
    estimates,
    contracts,
    expenses,
    dashboard,
    availableEndpoints,
    isEndpointAvailable,
    refresh,
    refreshAll,
    clearCache,
    searchCustomers,
    searchProjects,
    getProjectsByCustomer,
    getInvoicesByCustomer,
    getTasksByProject,
    getCustomerById,
    getProjectById,
    getStaffById,
  ]);

  return (
    <PerfexFullSyncContext.Provider value={value}>
      {children}
    </PerfexFullSyncContext.Provider>
  );
}

// ==================== HOOKS ====================

export function usePerfexFullSync() {
  const context = useContext(PerfexFullSyncContext);
  if (!context) {
    throw new Error('usePerfexFullSync must be used within PerfexFullSyncProvider');
  }
  return context;
}

// Individual data hooks
export function usePerfexCustomers() {
  const { customers, isLoading, refresh } = usePerfexFullSync();
  return { 
    customers, 
    isLoading, 
    refresh: () => refresh(['customers']) 
  };
}

export function usePerfexProjects() {
  const { projects, isLoading, refresh, getProjectsByCustomer } = usePerfexFullSync();
  return { 
    projects, 
    isLoading, 
    refresh: () => refresh(['projects']),
    getByCustomer: getProjectsByCustomer,
  };
}

export function usePerfexStaff() {
  const { staff, isLoading, refresh, isEndpointAvailable } = usePerfexFullSync();
  return { 
    staff, 
    isLoading, 
    refresh: () => refresh(['staff']),
    available: isEndpointAvailable('staff'),
  };
}

export function usePerfexInvoices() {
  const { invoices, isLoading, refresh, getInvoicesByCustomer, isEndpointAvailable } = usePerfexFullSync();
  return { 
    invoices, 
    isLoading, 
    refresh: () => refresh(['invoices']),
    getByCustomer: getInvoicesByCustomer,
    available: isEndpointAvailable('invoices'),
  };
}

export function usePerfexLeads() {
  const { leads, isLoading, refresh, isEndpointAvailable } = usePerfexFullSync();
  return { 
    leads, 
    isLoading, 
    refresh: () => refresh(['leads']),
    available: isEndpointAvailable('leads'),
  };
}

export function usePerfexTasks() {
  const { tasks, isLoading, refresh, getTasksByProject, isEndpointAvailable } = usePerfexFullSync();
  return { 
    tasks, 
    isLoading, 
    refresh: () => refresh(['tasks']),
    getByProject: getTasksByProject,
    available: isEndpointAvailable('tasks'),
  };
}

export function usePerfexTickets() {
  const { tickets, isLoading, refresh, isEndpointAvailable } = usePerfexFullSync();
  return { 
    tickets, 
    isLoading, 
    refresh: () => refresh(['tickets']),
    available: isEndpointAvailable('tickets'),
  };
}

export function usePerfexDashboard() {
  const { dashboard, isLoading, refresh } = usePerfexFullSync();
  return { 
    dashboard, 
    isLoading, 
    refresh: () => refresh(['dashboard']),
  };
}

export default PerfexFullSyncProvider;
