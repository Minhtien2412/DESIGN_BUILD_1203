/**
 * Perfex CRM Hooks
 * React hooks để tích hợp Perfex CRM vào components
 * 
 * @author ThietKeResort Team
 * @updated 2025-12-30
 */

import PerfexCRM, {
    PerfexCustomer,
    PerfexEstimate,
    PerfexInvoice,
    PerfexLead,
    PerfexProject,
    PerfexTask,
    testPerfexConnection,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useState } from 'react';

// ==================== CONNECTION HOOK ====================

interface ConnectionState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  version?: string;
}

/**
 * Hook để kiểm tra kết nối Perfex CRM
 */
export function usePerfexConnection() {
  const [state, setState] = useState<ConnectionState>({
    connected: false,
    loading: true,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await testPerfexConnection();
      setState({
        connected: result.connected,
        loading: false,
        error: result.connected ? null : result.message,
        version: result.version,
      });
    } catch (error: any) {
      setState({
        connected: false,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...state,
    refresh: checkConnection,
  };
}

// ==================== CUSTOMERS HOOK ====================

interface CustomersState {
  customers: PerfexCustomer[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook để quản lý customers từ Perfex CRM
 */
export function usePerfexCustomers(params?: { page?: number; limit?: number; search?: string }) {
  const [state, setState] = useState<CustomersState>({
    customers: [],
    loading: true,
    error: null,
    total: 0,
  });

  const fetchCustomers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await PerfexCRM.Customers.getAll(params);
      setState({
        customers: result.data,
        loading: false,
        error: null,
        total: result.total,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [params?.page, params?.limit, params?.search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = useCallback(async (data: Partial<PerfexCustomer>) => {
    const newCustomer = await PerfexCRM.Customers.create(data);
    setState(prev => ({
      ...prev,
      customers: [newCustomer, ...prev.customers],
      total: prev.total + 1,
    }));
    return newCustomer;
  }, []);

  const updateCustomer = useCallback(async (id: string, data: Partial<PerfexCustomer>) => {
    const updated = await PerfexCRM.Customers.update(id, data);
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.userid === id ? updated : c),
    }));
    return updated;
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    await PerfexCRM.Customers.delete(id);
    setState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.userid !== id),
      total: prev.total - 1,
    }));
  }, []);

  return {
    ...state,
    refresh: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

// ==================== PROJECTS HOOK ====================

interface ProjectsState {
  projects: PerfexProject[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook để quản lý projects từ Perfex CRM
 */
export function usePerfexProjects(params?: { 
  page?: number; 
  limit?: number; 
  clientid?: string;
  status?: number;
}) {
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    loading: true,
    error: null,
    total: 0,
  });

  const fetchProjects = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await PerfexCRM.Projects.getAll(params);
      setState({
        projects: result.data,
        loading: false,
        error: null,
        total: result.total,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [params?.page, params?.limit, params?.clientid, params?.status]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (data: Partial<PerfexProject>) => {
    const newProject = await PerfexCRM.Projects.create(data);
    setState(prev => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      total: prev.total + 1,
    }));
    return newProject;
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<PerfexProject>) => {
    const updated = await PerfexCRM.Projects.update(id, data);
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? updated : p),
    }));
    return updated;
  }, []);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    const updated = await PerfexCRM.Projects.updateProgress(id, progress);
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? updated : p),
    }));
    return updated;
  }, []);

  return {
    ...state,
    refresh: fetchProjects,
    createProject,
    updateProject,
    updateProgress,
  };
}

// ==================== TASKS HOOK ====================

interface TasksState {
  tasks: PerfexTask[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook để quản lý tasks từ Perfex CRM
 */
export function usePerfexTasks(params?: { 
  page?: number; 
  limit?: number;
  rel_type?: string;
  rel_id?: string;
  status?: number;
}) {
  const [state, setState] = useState<TasksState>({
    tasks: [],
    loading: true,
    error: null,
    total: 0,
  });

  const fetchTasks = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await PerfexCRM.Tasks.getAll(params);
      setState({
        tasks: result.data,
        loading: false,
        error: null,
        total: result.total,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [params?.page, params?.limit, params?.rel_type, params?.rel_id, params?.status]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: Partial<PerfexTask>) => {
    const newTask = await PerfexCRM.Tasks.create(data);
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      total: prev.total + 1,
    }));
    return newTask;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<PerfexTask>) => {
    const updated = await PerfexCRM.Tasks.update(id, data);
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? updated : t),
    }));
    return updated;
  }, []);

  const markComplete = useCallback(async (id: string) => {
    const updated = await PerfexCRM.Tasks.markComplete(id);
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? updated : t),
    }));
    return updated;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await PerfexCRM.Tasks.delete(id);
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
      total: prev.total - 1,
    }));
  }, []);

  return {
    ...state,
    refresh: fetchTasks,
    createTask,
    updateTask,
    markComplete,
    deleteTask,
  };
}

// ==================== INVOICES HOOK ====================

interface InvoicesState {
  invoices: PerfexInvoice[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook để quản lý invoices từ Perfex CRM
 */
export function usePerfexInvoices(params?: { 
  page?: number; 
  limit?: number;
  clientid?: string;
  status?: number;
}) {
  const [state, setState] = useState<InvoicesState>({
    invoices: [],
    loading: true,
    error: null,
    total: 0,
  });

  const fetchInvoices = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await PerfexCRM.Invoices.getAll(params);
      setState({
        invoices: result.data,
        loading: false,
        error: null,
        total: result.total,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [params?.page, params?.limit, params?.clientid, params?.status]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    ...state,
    refresh: fetchInvoices,
    send: PerfexCRM.Invoices.send,
    markPaid: PerfexCRM.Invoices.markPaid,
  };
}

// ==================== LEADS HOOK ====================

interface LeadsState {
  leads: PerfexLead[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook để quản lý leads từ Perfex CRM
 */
export function usePerfexLeads(params?: { 
  page?: number; 
  limit?: number;
  status?: number;
}) {
  const [state, setState] = useState<LeadsState>({
    leads: [],
    loading: true,
    error: null,
    total: 0,
  });

  const fetchLeads = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await PerfexCRM.Leads.getAll(params);
      setState({
        leads: result.data,
        loading: false,
        error: null,
        total: result.total,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [params?.page, params?.limit, params?.status]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = useCallback(async (data: Partial<PerfexLead>) => {
    const newLead = await PerfexCRM.Leads.create(data);
    setState(prev => ({
      ...prev,
      leads: [newLead, ...prev.leads],
      total: prev.total + 1,
    }));
    return newLead;
  }, []);

  const convertToCustomer = useCallback(async (id: string) => {
    const result = await PerfexCRM.Leads.convertToCustomer(id);
    setState(prev => ({
      ...prev,
      leads: prev.leads.filter(l => l.id !== id),
      total: prev.total - 1,
    }));
    return result;
  }, []);

  return {
    ...state,
    refresh: fetchLeads,
    createLead,
    convertToCustomer,
  };
}

// ==================== ESTIMATES HOOK ====================

interface EstimatesState {
  estimates: PerfexEstimate[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook để quản lý estimates (báo giá) từ Perfex CRM
 */
export function usePerfexEstimates(params?: { 
  page?: number; 
  limit?: number;
  clientid?: string;
  status?: number;
}) {
  const [state, setState] = useState<EstimatesState>({
    estimates: [],
    loading: true,
    error: null,
    total: 0,
  });

  const fetchEstimates = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await PerfexCRM.Estimates.getAll(params);
      setState({
        estimates: result.data,
        loading: false,
        error: null,
        total: result.total,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [params?.page, params?.limit, params?.clientid, params?.status]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  return {
    ...state,
    refresh: fetchEstimates,
    send: PerfexCRM.Estimates.send,
    convertToInvoice: PerfexCRM.Estimates.convertToInvoice,
  };
}

// ==================== SYNC HOOK ====================

interface SyncState {
  syncing: boolean;
  lastSync: Date | null;
  results: {
    success: number;
    failed: number;
    errors: string[];
  } | null;
}

/**
 * Hook để sync data giữa app và Perfex CRM
 */
export function usePerfexSync() {
  const [state, setState] = useState<SyncState>({
    syncing: false,
    lastSync: null,
    results: null,
  });

  const syncUsers = useCallback(async (users: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
  }[]) => {
    setState(prev => ({ ...prev, syncing: true }));
    try {
      const results = await PerfexCRM.Sync.syncAllUsers(users);
      setState({
        syncing: false,
        lastSync: new Date(),
        results,
      });
      return results;
    } catch (error) {
      setState(prev => ({ ...prev, syncing: false }));
      throw error;
    }
  }, []);

  const syncProjects = useCallback(async (projects: {
    id: string;
    name: string;
    description?: string;
    clientId: string;
    startDate: string;
    endDate?: string;
    progress: number;
    status: string;
  }[]) => {
    setState(prev => ({ ...prev, syncing: true }));
    try {
      const results = await PerfexCRM.Sync.syncAllProjects(projects);
      setState({
        syncing: false,
        lastSync: new Date(),
        results,
      });
      return results;
    } catch (error) {
      setState(prev => ({ ...prev, syncing: false }));
      throw error;
    }
  }, []);

  return {
    ...state,
    syncUsers,
    syncProjects,
  };
}
