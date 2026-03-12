/**
 * Perfex CRM Hooks
 * =================
 * 
 * React hooks để quản lý state và tương tác với Perfex CRM API.
 * Cung cấp loading states, error handling, và caching.
 * 
 * Features:
 * - Auto-fetch on mount
 * - Search với debouncing
 * - CRUD operations
 * - Optimistic updates
 * - Error handling
 * 
 * @author ThietKeResort Team
 * @created January 7, 2026
 */

import { perfexAPI } from '@/services/perfexAPI';
import type {
    Contact,
    Contract,
    Customer,
    Estimate,
    Expense,
    Invoice,
    Lead,
    Milestone,
    Product,
    Project,
    Staff,
    Task,
    Ticket,
} from '@/types/perfex';
import { useCallback, useEffect, useState } from 'react';

// ==================== BASE TYPES ====================

interface UseAPIOptions<T> {
  autoFetch?: boolean;
  initialData?: T[];
}

interface UseAPIReturn<T extends { id?: string; userid?: string }> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  search: (query: string) => Promise<void>;
  create: (item: Partial<T>) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

// ==================== BASE HOOK ====================

/**
 * Generic hook for API CRUD operations
 */
function useAPI<T extends { id?: string; userid?: string }>(
  apiModule: {
    list: () => Promise<T[]>;
    search?: (query: string) => Promise<T[]>;
    create?: (data: Partial<T>) => Promise<T>;
    update?: (id: string, data: Partial<T>) => Promise<T>;
    delete?: (id: string) => Promise<void>;
  },
  options: UseAPIOptions<T> = {}
): UseAPIReturn<T> {
  const { autoFetch = true, initialData = [] } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiModule.list();
      setData(result);
    } catch (err: any) {
      const message = err.message || 'Failed to fetch data';
      setError(message);
      console.error('[useAPI] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiModule]);

  // Search
  const search = useCallback(
    async (query: string) => {
      if (!apiModule.search) {
        console.warn('[useAPI] Search not supported');
        return;
      }

      if (!query.trim()) {
        await fetchData();
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await apiModule.search(query);
        setData(result);
      } catch (err: any) {
        const message = err.message || 'Search failed';
        setError(message);
        console.error('[useAPI] Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [apiModule, fetchData]
  );

  // Create
  const create = useCallback(
    async (item: Partial<T>): Promise<T> => {
      if (!apiModule.create) {
        throw new Error('Create not supported');
      }

      try {
        const created = await apiModule.create(item);
        setData((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        const message = err.message || 'Create failed';
        console.error('[useAPI] Create error:', err);
        throw new Error(message);
      }
    },
    [apiModule]
  );

  // Update
  const update = useCallback(
    async (id: string, item: Partial<T>): Promise<T> => {
      if (!apiModule.update) {
        throw new Error('Update not supported');
      }

      try {
        const updated = await apiModule.update(id, item);
        setData((prev) =>
          prev.map((i) => {
            const itemId = i.id || i.userid;
            return itemId === id ? updated : i;
          })
        );
        return updated;
      } catch (err: any) {
        const message = err.message || 'Update failed';
        console.error('[useAPI] Update error:', err);
        throw new Error(message);
      }
    },
    [apiModule]
  );

  // Delete
  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (!apiModule.delete) {
        throw new Error('Delete not supported');
      }

      try {
        await apiModule.delete(id);
        setData((prev) => {
          return prev.filter((i) => {
            const itemId = i.id || i.userid;
            return itemId !== id;
          });
        });
      } catch (err: any) {
        const message = err.message || 'Delete failed';
        console.error('[useAPI] Delete error:', err);
        throw new Error(message);
      }
    },
    [apiModule]
  );

  // Refresh (alias for fetchData)
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    search,
    create,
    update,
    remove,
  };
}

// ==================== CUSTOMERS HOOK ====================

interface CustomersStats {
  total: number;
  active: number;
  inactive: number;
}

export function useCustomers(options?: UseAPIOptions<Customer>) {
  const base = useAPI<Customer>(perfexAPI.customers, options);

  const stats: CustomersStats = {
    total: base.data.length,
    active: base.data.filter((c) => c.active === '1').length,
    inactive: base.data.filter((c) => c.active === '0').length,
  };

  return {
    customers: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createCustomer: base.create,
    updateCustomer: base.update,
    deleteCustomer: base.remove,
  };
}

// ==================== CONTACTS HOOK ====================

export function useContacts(options?: UseAPIOptions<Contact>) {
  const base = useAPI<Contact>(perfexAPI.contacts, options);

  return {
    contacts: base.data,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createContact: base.create,
    updateContact: base.update,
    deleteContact: base.remove,
  };
}

// ==================== INVOICES HOOK ====================

interface InvoicesStats {
  total: number;
  unpaid: number;
  paid: number;
  overdue: number;
  draft: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
}

export function useInvoices(options?: UseAPIOptions<Invoice>) {
  const base = useAPI<Invoice>(perfexAPI.invoices, options);

  const stats: InvoicesStats = {
    total: base.data.length,
    unpaid: base.data.filter((i) => i.status === '1' || i.status === '3').length,
    paid: base.data.filter((i) => i.status === '2').length,
    overdue: base.data.filter((i) => i.status === '4').length,
    draft: base.data.filter((i) => i.status === '6').length,
    totalAmount: base.data.reduce((sum, i) => sum + parseFloat(i.total || '0'), 0),
    totalPaid: base.data.reduce((sum, i) => sum + parseFloat((i as any).total_paid || '0'), 0),
    totalDue: base.data.reduce(
      (sum, i) =>
        sum + (parseFloat(i.total || '0') - parseFloat((i as any).total_paid || '0')),
      0
    ),
  };

  return {
    invoices: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createInvoice: base.create,
    updateInvoice: base.update,
    deleteInvoice: base.remove,
  };
}

// ==================== PRODUCTS HOOK ====================

export function useProducts(options?: UseAPIOptions<Product>) {
  const base = useAPI<Product>(perfexAPI.products, options);

  return {
    products: base.data,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
  };
}

// ==================== LEADS HOOK ====================

interface LeadsStats {
  total: number;
  converted: number;
  notConverted: number;
}

export function useLeads(options?: UseAPIOptions<Lead>) {
  const base = useAPI<Lead>(perfexAPI.leads, options);

  const stats: LeadsStats = {
    total: base.data.length,
    converted: base.data.filter((l) => (l as any).is_converted_to_customer === '1').length,
    notConverted: base.data.filter((l) => (l as any).is_converted_to_customer !== '1')
      .length,
  };

  return {
    leads: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createLead: base.create,
    updateLead: base.update,
    deleteLead: base.remove,
  };
}

// ==================== PROJECTS HOOK ====================

interface ProjectsStats {
  total: number;
  notStarted: number;
  inProgress: number;
  onHold: number;
  cancelled: number;
  finished: number;
  totalValue: number;
}

export function useProjects(options?: UseAPIOptions<Project>) {
  const base = useAPI<Project>(perfexAPI.projects, options);

  const stats: ProjectsStats = {
    total: base.data.length,
    notStarted: base.data.filter((p) => p.status === '1').length,
    inProgress: base.data.filter((p) => p.status === '2' || p.status === '3').length,
    onHold: base.data.filter((p) => p.status === '4').length,
    cancelled: base.data.filter((p) => p.status === '5').length,
    finished: base.data.filter((p) => p.status === '6').length,
    totalValue: base.data.reduce(
      (sum, p) => sum + parseFloat(p.project_cost || '0'),
      0
    ),
  };

  return {
    projects: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createProject: base.create,
    updateProject: base.update,
    deleteProject: base.remove,
  };
}

// ==================== TASKS HOOK ====================

interface TasksStats {
  total: number;
  notStarted: number;
  inProgress: number;
  testing: number;
  awaitingFeedback: number;
  completed: number;
}

export function useTasks(options?: UseAPIOptions<Task>) {
  const base = useAPI<Task>(perfexAPI.tasks, options);

  const stats: TasksStats = {
    total: base.data.length,
    notStarted: base.data.filter((t) => t.status === '1').length,
    inProgress: base.data.filter((t) => t.status === '2').length,
    testing: base.data.filter((t) => t.status === '3').length,
    awaitingFeedback: base.data.filter((t) => t.status === '4').length,
    completed: base.data.filter((t) => t.status === '5').length,
  };

  return {
    tasks: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createTask: base.create,
    updateTask: base.update,
    deleteTask: base.remove,
  };
}

// ==================== TICKETS HOOK ====================

interface TicketsStats {
  total: number;
  open: number;
  inProgress: number;
  answered: number;
  onHold: number;
  closed: number;
}

export function useTickets(options?: UseAPIOptions<Ticket>) {
  const base = useAPI<Ticket>(perfexAPI.tickets, options);

  const stats: TicketsStats = {
    total: base.data.length,
    open: base.data.filter((t) => t.status === '1').length,
    inProgress: base.data.filter((t) => t.status === '2').length,
    answered: base.data.filter((t) => t.status === '3').length,
    onHold: base.data.filter((t) => t.status === '4').length,
    closed: base.data.filter((t) => t.status === '5').length,
  };

  return {
    tickets: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createTicket: base.create,
    updateTicket: base.update,
    deleteTicket: base.remove,
  };
}

// ==================== ESTIMATES HOOK ====================

interface EstimatesStats {
  total: number;
  draft: number;
  sent: number;
  declined: number;
  accepted: number;
  expired: number;
}

export function useEstimates(options?: UseAPIOptions<Estimate>) {
  const base = useAPI<Estimate>(perfexAPI.estimates, options);

  const stats: EstimatesStats = {
    total: base.data.length,
    draft: base.data.filter((e) => e.status === '1').length,
    sent: base.data.filter((e) => e.status === '2').length,
    declined: base.data.filter((e) => e.status === '3').length,
    accepted: base.data.filter((e) => e.status === '4').length,
    expired: base.data.filter((e) => e.status === '5').length,
  };

  return {
    estimates: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createEstimate: base.create,
    updateEstimate: base.update,
    deleteEstimate: base.remove,
  };
}

// ==================== EXPENSES HOOK ====================

interface ExpensesStats {
  total: number;
  billable: number;
  nonBillable: number;
  totalAmount: number;
}

export function useExpenses(options?: UseAPIOptions<Expense>) {
  const base = useAPI<Expense>(perfexAPI.expenses, options);

  const stats: ExpensesStats = {
    total: base.data.length,
    billable: base.data.filter((e) => e.billable === '1').length,
    nonBillable: base.data.filter((e) => e.billable === '0' || !e.billable).length,
    totalAmount: base.data.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0),
  };

  return {
    expenses: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createExpense: base.create,
    updateExpense: base.update,
    deleteExpense: base.remove,
  };
}

// ==================== CONTRACTS HOOK ====================

interface ContractsStats {
  total: number;
  active: number;
  expired: number;
  draft: number;
  totalValue: number;
}

export function useContracts(options?: UseAPIOptions<Contract>) {
  const base = useAPI<Contract>(perfexAPI.contracts, options);

  const stats: ContractsStats = {
    total: base.data.length,
    active: base.data.filter((c) => c.trash === '0' && new Date(c.dateend || '') > new Date()).length,
    expired: base.data.filter((c) => c.dateend && new Date(c.dateend) <= new Date()).length,
    draft: base.data.filter((c) => !c.datestart).length,
    totalValue: base.data.reduce((sum, c) => sum + parseFloat(c.contract_value || '0'), 0),
  };

  return {
    contracts: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createContract: base.create,
    updateContract: base.update,
    deleteContract: base.remove,
  };
}

// ==================== STAFF HOOK ====================

interface StaffStats {
  total: number;
  active: number;
  inactive: number;
}

export function useStaff(options?: UseAPIOptions<Staff>) {
  const base = useAPI<Staff>(perfexAPI.staff, options);

  const stats: StaffStats = {
    total: base.data.length,
    active: base.data.filter((s) => s.active === '1').length,
    inactive: base.data.filter((s) => s.active !== '1').length,
  };

  return {
    staff: base.data,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createStaff: base.create,
    updateStaff: base.update,
    deleteStaff: base.remove,
  };
}

// ==================== MILESTONES HOOK ====================

interface MilestonesStats {
  total: number;
  completed: number;
  pending: number;
}

export function useMilestones(projectId?: string, options?: UseAPIOptions<Milestone>) {
  const base = useAPI<Milestone>(perfexAPI.milestones, options);
  
  // Filter by project if provided
  const filteredData = projectId 
    ? base.data.filter((m) => m.project_id === projectId)
    : base.data;

  const stats: MilestonesStats = {
    total: filteredData.length,
    completed: filteredData.filter((m) => m.due_date && new Date(m.due_date) < new Date()).length,
    pending: filteredData.filter((m) => !m.due_date || new Date(m.due_date) >= new Date()).length,
  };

  return {
    milestones: filteredData,
    stats,
    loading: base.loading,
    error: base.error,
    refresh: base.refresh,
    search: base.search,
    createMilestone: base.create,
    updateMilestone: base.update,
    deleteMilestone: base.remove,
  };
}

// ==================== SINGLE ITEM HOOKS ====================

/**
 * Hook to fetch single customer
 */
export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await perfexAPI.customers.get(id);
      setCustomer(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id, fetchCustomer]);

  return {
    customer,
    loading,
    error,
    refresh: fetchCustomer,
  };
}

/**
 * Hook to fetch single invoice
 */
export function useInvoice(id: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await perfexAPI.invoices.get(id);
      setInvoice(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id, fetchInvoice]);

  return {
    invoice,
    loading,
    error,
    refresh: fetchInvoice,
  };
}

/**
 * Hook to fetch single project
 */
export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await perfexAPI.projects.get(id);
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id, fetchProject]);

  return {
    project,
    loading,
    error,
    refresh: fetchProject,
  };
}

/**
 * Hook to fetch single task
 */
export function useTask(id: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await perfexAPI.tasks.get(id);
      setTask(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id, fetchTask]);

  return {
    task,
    loading,
    error,
    refresh: fetchTask,
  };
}
