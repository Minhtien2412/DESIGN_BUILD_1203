/**
 * Perfex CRM Full Sync Service
 * =============================
 * 
 * Đồng bộ đầy đủ dữ liệu từ Perfex CRM về App
 * Bao gồm: Customers, Projects, Staff, Invoices, Leads, Tasks, Tickets...
 * 
 * @author ThietKeResort Team
 * @since 2025-12-30
 */

import ENV from '@/config/env';
import { deleteItem, getItem, setItem } from '@/utils/storage';
import { EventEmitter } from 'events';

// ==================== CONFIG ====================

const SYNC_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  authToken: ENV.PERFEX_API_TOKEN || '',
  
  // Sync intervals
  autoSyncInterval: 5 * 60 * 1000, // 5 phút
  minSyncInterval: 30 * 1000,       // 30 giây
  
  // Cache TTL (thời gian sống của cache)
  cacheTTL: {
    customers: 10 * 60 * 1000,  // 10 phút
    projects: 5 * 60 * 1000,    // 5 phút
    staff: 30 * 60 * 1000,      // 30 phút (ít thay đổi)
    invoices: 5 * 60 * 1000,    // 5 phút
    leads: 5 * 60 * 1000,       // 5 phút
    tasks: 3 * 60 * 1000,       // 3 phút (thay đổi thường xuyên)
    tickets: 3 * 60 * 1000,     // 3 phút
    estimates: 10 * 60 * 1000,  // 10 phút
    contracts: 15 * 60 * 1000,  // 15 phút
    expenses: 10 * 60 * 1000,   // 10 phút
    dashboard: 2 * 60 * 1000,   // 2 phút
  },
  
  timeout: 30000,
};

// Storage keys
const CACHE_KEYS = {
  CUSTOMERS: 'perfex_full_customers',
  PROJECTS: 'perfex_full_projects',
  STAFF: 'perfex_full_staff',
  INVOICES: 'perfex_full_invoices',
  LEADS: 'perfex_full_leads',
  TASKS: 'perfex_full_tasks',
  TICKETS: 'perfex_full_tickets',
  ESTIMATES: 'perfex_full_estimates',
  CONTRACTS: 'perfex_full_contracts',
  EXPENSES: 'perfex_full_expenses',
  DASHBOARD: 'perfex_full_dashboard',
  LAST_SYNC: 'perfex_full_last_sync',
  SYNC_STATUS: 'perfex_full_sync_status',
};

// ==================== TYPES ====================

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastError: string | null;
  syncProgress: number;
  currentEntity: string | null;
  availableEndpoints: string[];
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface SyncEvent {
  type: 'sync_start' | 'sync_progress' | 'sync_complete' | 'sync_error' | 'data_updated' | 'endpoint_status';
  entity?: string;
  data?: any;
  error?: string;
  progress?: number;
}

// ========== Entity Types ==========

export interface Customer {
  userid: string;
  company: string;
  vat?: string;
  phonenumber: string;
  country?: string;
  city: string;
  zip?: string;
  state?: string;
  address: string;
  website: string;
  datecreated: string;
  active: string;
  leadid?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  longitude?: string;
  latitude?: string;
  default_language?: string;
  default_currency?: string;
  show_primary_contact?: string;
  stripe_id?: string;
  registration_confirmed?: string;
  addedfrom?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  clientid: string;
  billing_type?: string;
  start_date: string;
  deadline: string | null;
  project_created?: string;
  date_finished?: string | null;
  progress: string;
  project_cost: string;
  project_rate_per_hour?: string;
  estimated_hours?: string;
  addedfrom?: string;
  contact_notification?: string;
  notify_contacts?: string;
  // Joined fields
  company: string;
  phonenumber: string;
  city: string;
}

export interface Staff {
  staffid: string;
  email: string;
  firstname: string;
  lastname: string;
  facebook?: string;
  linkedin?: string;
  phonenumber: string;
  skype?: string;
  password?: string; // Usually not returned
  datecreated?: string;
  profile_image?: string;
  last_ip?: string;
  last_login?: string;
  last_activity?: string;
  last_password_change?: string;
  new_pass_key?: string;
  new_pass_key_requested?: string;
  admin?: string;
  role?: string;
  active?: string;
  default_language?: string;
  direction?: string;
  media_path_slug?: string;
  is_not_staff?: string;
  hourly_rate?: string;
  two_factor_auth_enabled?: string;
  two_factor_auth_code?: string;
  two_factor_auth_code_requested?: string;
  email_signature?: string;
  // Full name helper
  fullName?: string;
}

export interface Invoice {
  id: string;
  sent: string;
  datesend?: string;
  clientid: string;
  deleted_customer_name?: string;
  number: string;
  prefix?: string;
  number_format?: string;
  datecreated: string;
  date: string;
  duedate?: string;
  currency?: string;
  subtotal: string;
  total_tax?: string;
  total: string;
  adjustment?: string;
  addedfrom?: string;
  hash?: string;
  status: string;
  clientnote?: string;
  adminnote?: string;
  last_overdue_reminder?: string;
  last_due_reminder?: string;
  cancel_overdue_reminders?: string;
  allowed_payment_modes?: string;
  token?: string;
  discount_percent?: string;
  discount_total?: string;
  discount_type?: string;
  recurring?: string;
  recurring_type?: string;
  custom_recurring?: string;
  cycles?: string;
  total_cycles?: string;
  is_recurring_from?: string;
  last_recurring_date?: string;
  terms?: string;
  sale_agent?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  include_shipping?: string;
  show_shipping_on_invoice?: string;
  show_quantity_as?: string;
  project_id?: string;
  subscription_id?: string;
  short_link?: string;
  // Joined
  company?: string;
}

export interface Lead {
  id: string;
  hash?: string;
  name: string;
  title?: string;
  description?: string;
  country?: string;
  zip?: string;
  city?: string;
  state?: string;
  address?: string;
  assigned?: string;
  dateadded?: string;
  from_form_id?: string;
  status: string;
  source?: string;
  lastcontact?: string;
  dateassigned?: string;
  last_status_change?: string;
  addedfrom?: string;
  email?: string;
  website?: string;
  leadorder?: string;
  phonenumber?: string;
  date_converted?: string;
  lost?: string;
  junk?: string;
  last_lead_status?: string;
  is_imported_from_email_integration?: string;
  email_integration_uid?: string;
  is_public?: string;
  default_language?: string;
  client_id?: string;
  // Joined
  status_name?: string;
  source_name?: string;
  assigned_name?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  priority?: string;
  dateadded?: string;
  startdate: string;
  duedate?: string;
  datefinished?: string;
  addedfrom?: string;
  is_added_from_contact?: string;
  status: string;
  recurring_type?: string;
  repeat_every?: string;
  recurring?: string;
  is_recurring_from?: string;
  cycles?: string;
  total_cycles?: string;
  custom_recurring?: string;
  last_recurring_date?: string;
  rel_id?: string;
  rel_type?: string;
  is_public?: string;
  billable?: string;
  billed?: string;
  invoice_id?: string;
  hourly_rate?: string;
  milestone?: string;
  kanban_order?: string;
  milestone_order?: string;
  visible_to_client?: string;
  deadline_notified?: string;
  // Joined
  assignees?: string[];
  status_name?: string;
}

export interface Ticket {
  ticketid: string;
  adminreplying?: string;
  userid: string;
  contactid?: string;
  merged_ticket_id?: string;
  email?: string;
  name?: string;
  department: string;
  priority: string;
  status: string;
  service?: string;
  ticketkey?: string;
  subject: string;
  message?: string;
  admin?: string;
  date: string;
  project_id?: string;
  lastreply?: string;
  clientread?: string;
  adminread?: string;
  assigned?: string;
  staff_id_replying?: string;
  cc?: string;
  // Joined
  department_name?: string;
  priority_name?: string;
  status_name?: string;
  assigned_name?: string;
}

export interface Estimate {
  id: string;
  sent: string;
  datesend?: string;
  clientid: string;
  deleted_customer_name?: string;
  project_id?: string;
  number: string;
  prefix?: string;
  number_format?: string;
  hash?: string;
  datecreated: string;
  date: string;
  expirydate?: string;
  currency?: string;
  subtotal: string;
  total_tax?: string;
  total: string;
  adjustment?: string;
  addedfrom?: string;
  status: string;
  clientnote?: string;
  adminnote?: string;
  discount_percent?: string;
  discount_total?: string;
  discount_type?: string;
  invoiceid?: string;
  invoiced_date?: string;
  terms?: string;
  reference_no?: string;
  sale_agent?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  include_shipping?: string;
  show_shipping_on_estimate?: string;
  show_quantity_as?: string;
  pipeline_order?: string;
  is_expiry_notified?: string;
  acceptance_firstname?: string;
  acceptance_lastname?: string;
  acceptance_email?: string;
  acceptance_date?: string;
  acceptance_ip?: string;
  signature?: string;
  short_link?: string;
  // Joined
  company?: string;
}

export interface Contract {
  id: string;
  content?: string;
  description?: string;
  subject: string;
  client: string;
  datestart: string;
  dateend?: string;
  contract_type?: string;
  project_id?: string;
  addedfrom?: string;
  dateadded?: string;
  isexpirynotified?: string;
  contract_value?: string;
  trash?: string;
  not_visible_to_client?: string;
  hash?: string;
  signed?: string;
  signature?: string;
  marked_as_signed?: string;
  acceptance_firstname?: string;
  acceptance_lastname?: string;
  acceptance_email?: string;
  acceptance_date?: string;
  acceptance_ip?: string;
  short_link?: string;
  // Joined
  company?: string;
  contract_type_name?: string;
}

export interface Expense {
  id: string;
  category: string;
  currency?: string;
  amount: string;
  tax?: string;
  tax2?: string;
  reference_no?: string;
  note?: string;
  expense_name?: string;
  clientid?: string;
  project_id?: string;
  billable?: string;
  invoiceid?: string;
  paymentmode?: string;
  date: string;
  recurring_type?: string;
  repeat_every?: string;
  recurring?: string;
  cycles?: string;
  total_cycles?: string;
  custom_recurring?: string;
  last_recurring_date?: string;
  is_recurring_from?: string;
  create_invoice_billable?: string;
  send_invoice_to_customer?: string;
  recurring_from?: string;
  dateadded?: string;
  addedfrom?: string;
  // Joined
  category_name?: string;
  company?: string;
}

export interface DashboardStats {
  // Counts
  totalCustomers: number;
  activeCustomers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalStaff: number;
  activeStaff: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalLeads: number;
  convertedLeads: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalTickets: number;
  openTickets: number;
  totalEstimates: number;
  acceptedEstimates: number;
  totalContracts: number;
  activeContracts: number;
  totalExpenses: number;
  
  // Financial
  totalRevenue: number;
  totalOutstanding: number;
  totalExpenseAmount: number;
  projectsValue: number;
  
  // Recent items
  recentProjects: Project[];
  recentInvoices: Invoice[];
  recentLeads: Lead[];
  recentTasks: Task[];
  
  // By status
  projectsByStatus: Record<string, number>;
  invoicesByStatus: Record<string, number>;
  leadsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
}

// ==================== ENDPOINT STATUS ====================

interface EndpointStatus {
  endpoint: string;
  available: boolean;
  lastCheck: number;
  error?: string;
}

// ==================== FULL SYNC MANAGER ====================

class PerfexFullSyncManager extends EventEmitter {
  private state: SyncState = {
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
    syncProgress: 0,
    currentEntity: null,
    availableEndpoints: [],
  };

  private autoSyncTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private endpointStatus: Map<string, EndpointStatus> = new Map();

  // All supported endpoints
  private readonly ENDPOINTS = [
    'customers',
    'projects', 
    'staff',
    'invoices',
    'leads',
    'tasks',
    'tickets',
    'estimates',
    'contracts',
    'expenses',
  ];

  // ========== INITIALIZATION ==========

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[PerfexFullSync] Initializing...');

    // Load last sync time
    const lastSync = await getItem(CACHE_KEYS.LAST_SYNC);
    if (lastSync) {
      this.state.lastSyncTime = parseInt(lastSync);
    }

    // Check available endpoints
    await this.checkAvailableEndpoints();

    this.isInitialized = true;
    console.log('[PerfexFullSync] Initialized. Available endpoints:', this.state.availableEndpoints);

    // Start auto sync
    this.startAutoSync();
    
    // Initial sync
    this.syncAll();
  }

  // ========== ENDPOINT CHECKING ==========

  private async checkAvailableEndpoints(): Promise<void> {
    console.log('[PerfexFullSync] Checking available endpoints...');
    
    const available: string[] = [];
    
    for (const endpoint of this.ENDPOINTS) {
      try {
        const response = await this.fetchWithTimeout(`/api/${endpoint}`, { method: 'HEAD' });
        
        if (response.ok || response.status === 200) {
          available.push(endpoint);
          this.endpointStatus.set(endpoint, {
            endpoint,
            available: true,
            lastCheck: Date.now(),
          });
        } else {
          this.endpointStatus.set(endpoint, {
            endpoint,
            available: false,
            lastCheck: Date.now(),
            error: `Status ${response.status}`,
          });
        }
      } catch (error: any) {
        // Try GET request if HEAD fails
        try {
          const data = await this.apiRequest(`/api/${endpoint}`);
          if (data) {
            available.push(endpoint);
            this.endpointStatus.set(endpoint, {
              endpoint,
              available: true,
              lastCheck: Date.now(),
            });
          }
        } catch {
          this.endpointStatus.set(endpoint, {
            endpoint,
            available: false,
            lastCheck: Date.now(),
            error: error.message,
          });
        }
      }
    }

    this.state.availableEndpoints = available;
    this.emit('sync', { 
      type: 'endpoint_status', 
      data: { available, total: this.ENDPOINTS.length } 
    } as SyncEvent);
  }

  getEndpointStatus(): Map<string, EndpointStatus> {
    return this.endpointStatus;
  }

  // ========== AUTO SYNC ==========

  startAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }

    this.autoSyncTimer = setInterval(() => {
      this.syncAll();
    }, SYNC_CONFIG.autoSyncInterval);

    console.log(`[PerfexFullSync] Auto sync started (every ${SYNC_CONFIG.autoSyncInterval / 1000}s)`);
  }

  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
    console.log('[PerfexFullSync] Auto sync stopped');
  }

  // ========== SYNC OPERATIONS ==========

  async syncAll(force = false): Promise<void> {
    if (!force && this.state.lastSyncTime) {
      const elapsed = Date.now() - this.state.lastSyncTime;
      if (elapsed < SYNC_CONFIG.minSyncInterval) {
        console.log('[PerfexFullSync] Skipping sync (too soon)');
        return;
      }
    }

    if (this.state.isSyncing) {
      console.log('[PerfexFullSync] Sync already in progress');
      return;
    }

    try {
      this.state.isSyncing = true;
      this.state.syncProgress = 0;
      this.state.lastError = null;
      this.emit('sync', { type: 'sync_start' } as SyncEvent);

      const totalEndpoints = this.state.availableEndpoints.length || 2; // At least customers & projects
      let completed = 0;

      // Sync each available endpoint
      const syncOperations = [
        { name: 'customers', fn: () => this.syncCustomers() },
        { name: 'projects', fn: () => this.syncProjects() },
        { name: 'staff', fn: () => this.syncStaff() },
        { name: 'invoices', fn: () => this.syncInvoices() },
        { name: 'leads', fn: () => this.syncLeads() },
        { name: 'tasks', fn: () => this.syncTasks() },
        { name: 'tickets', fn: () => this.syncTickets() },
        { name: 'estimates', fn: () => this.syncEstimates() },
        { name: 'contracts', fn: () => this.syncContracts() },
        { name: 'expenses', fn: () => this.syncExpenses() },
      ];

      for (const op of syncOperations) {
        if (this.state.availableEndpoints.includes(op.name) || 
            ['customers', 'projects'].includes(op.name)) {
          this.state.currentEntity = op.name;
          this.emit('sync', { 
            type: 'sync_progress', 
            entity: op.name,
            progress: this.state.syncProgress 
          } as SyncEvent);

          try {
            await op.fn();
            completed++;
            this.state.syncProgress = Math.round((completed / totalEndpoints) * 90);
          } catch (error: any) {
            console.warn(`[PerfexFullSync] Failed to sync ${op.name}:`, error.message);
          }
        }
      }

      // Calculate dashboard stats
      this.state.currentEntity = 'dashboard';
      await this.calculateDashboard();
      this.state.syncProgress = 100;

      // Update last sync time
      this.state.lastSyncTime = Date.now();
      await setItem(CACHE_KEYS.LAST_SYNC, this.state.lastSyncTime.toString());

      this.state.currentEntity = null;
      this.emit('sync', { type: 'sync_complete' } as SyncEvent);
      console.log('[PerfexFullSync] Sync completed successfully');

    } catch (error: any) {
      this.state.lastError = error.message;
      this.emit('sync', { type: 'sync_error', error: error.message } as SyncEvent);
      console.error('[PerfexFullSync] Sync error:', error);
    } finally {
      this.state.isSyncing = false;
      this.state.currentEntity = null;
    }
  }

  // ========== INDIVIDUAL SYNC METHODS ==========

  private async syncCustomers(): Promise<Customer[]> {
    const data = await this.apiRequest<Customer[]>('/api/customers');
    const customers = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.CUSTOMERS, customers, SYNC_CONFIG.cacheTTL.customers);
    this.emit('sync', { type: 'data_updated', entity: 'customers', data: customers } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${customers.length} customers`);
    return customers;
  }

  private async syncProjects(): Promise<Project[]> {
    const data = await this.apiRequest<Project | Project[]>('/api/projects');
    const projects = Array.isArray(data) ? data : (data ? [data] : []);
    await this.saveToCache(CACHE_KEYS.PROJECTS, projects, SYNC_CONFIG.cacheTTL.projects);
    this.emit('sync', { type: 'data_updated', entity: 'projects', data: projects } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${projects.length} projects`);
    return projects;
  }

  private async syncStaff(): Promise<Staff[]> {
    if (!this.state.availableEndpoints.includes('staff')) {
      return [];
    }
    const data = await this.apiRequest<Staff[]>('/api/staff');
    const staff = Array.isArray(data) ? data : [];
    // Add fullName helper
    staff.forEach(s => {
      s.fullName = `${s.firstname || ''} ${s.lastname || ''}`.trim();
    });
    await this.saveToCache(CACHE_KEYS.STAFF, staff, SYNC_CONFIG.cacheTTL.staff);
    this.emit('sync', { type: 'data_updated', entity: 'staff', data: staff } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${staff.length} staff members`);
    return staff;
  }

  private async syncInvoices(): Promise<Invoice[]> {
    if (!this.state.availableEndpoints.includes('invoices')) {
      return [];
    }
    const data = await this.apiRequest<Invoice[]>('/api/invoices');
    const invoices = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.INVOICES, invoices, SYNC_CONFIG.cacheTTL.invoices);
    this.emit('sync', { type: 'data_updated', entity: 'invoices', data: invoices } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${invoices.length} invoices`);
    return invoices;
  }

  private async syncLeads(): Promise<Lead[]> {
    if (!this.state.availableEndpoints.includes('leads')) {
      return [];
    }
    const data = await this.apiRequest<Lead[]>('/api/leads');
    const leads = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.LEADS, leads, SYNC_CONFIG.cacheTTL.leads);
    this.emit('sync', { type: 'data_updated', entity: 'leads', data: leads } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${leads.length} leads`);
    return leads;
  }

  private async syncTasks(): Promise<Task[]> {
    if (!this.state.availableEndpoints.includes('tasks')) {
      return [];
    }
    const data = await this.apiRequest<Task[]>('/api/tasks');
    const tasks = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.TASKS, tasks, SYNC_CONFIG.cacheTTL.tasks);
    this.emit('sync', { type: 'data_updated', entity: 'tasks', data: tasks } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${tasks.length} tasks`);
    return tasks;
  }

  private async syncTickets(): Promise<Ticket[]> {
    if (!this.state.availableEndpoints.includes('tickets')) {
      return [];
    }
    const data = await this.apiRequest<Ticket[]>('/api/tickets');
    const tickets = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.TICKETS, tickets, SYNC_CONFIG.cacheTTL.tickets);
    this.emit('sync', { type: 'data_updated', entity: 'tickets', data: tickets } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${tickets.length} tickets`);
    return tickets;
  }

  private async syncEstimates(): Promise<Estimate[]> {
    if (!this.state.availableEndpoints.includes('estimates')) {
      return [];
    }
    const data = await this.apiRequest<Estimate[]>('/api/estimates');
    const estimates = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.ESTIMATES, estimates, SYNC_CONFIG.cacheTTL.estimates);
    this.emit('sync', { type: 'data_updated', entity: 'estimates', data: estimates } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${estimates.length} estimates`);
    return estimates;
  }

  private async syncContracts(): Promise<Contract[]> {
    if (!this.state.availableEndpoints.includes('contracts')) {
      return [];
    }
    const data = await this.apiRequest<Contract[]>('/api/contracts');
    const contracts = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.CONTRACTS, contracts, SYNC_CONFIG.cacheTTL.contracts);
    this.emit('sync', { type: 'data_updated', entity: 'contracts', data: contracts } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${contracts.length} contracts`);
    return contracts;
  }

  private async syncExpenses(): Promise<Expense[]> {
    if (!this.state.availableEndpoints.includes('expenses')) {
      return [];
    }
    const data = await this.apiRequest<Expense[]>('/api/expenses');
    const expenses = Array.isArray(data) ? data : [];
    await this.saveToCache(CACHE_KEYS.EXPENSES, expenses, SYNC_CONFIG.cacheTTL.expenses);
    this.emit('sync', { type: 'data_updated', entity: 'expenses', data: expenses } as SyncEvent);
    console.log(`[PerfexFullSync] Synced ${expenses.length} expenses`);
    return expenses;
  }

  // ========== DASHBOARD CALCULATION ==========

  private async calculateDashboard(): Promise<DashboardStats> {
    const [customers, projects, staff, invoices, leads, tasks, tickets, estimates, contracts, expenses] = 
      await Promise.all([
        this.getCustomers(),
        this.getProjects(),
        this.getStaff(),
        this.getInvoices(),
        this.getLeads(),
        this.getTasks(),
        this.getTickets(),
        this.getEstimates(),
        this.getContracts(),
        this.getExpenses(),
      ]);

    const stats: DashboardStats = {
      // Customers
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.active === '1').length,
      
      // Projects
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === '2').length,
      completedProjects: projects.filter(p => p.status === '4').length,
      projectsValue: projects.reduce((sum, p) => sum + parseFloat(p.project_cost || '0'), 0),
      projectsByStatus: this.groupByStatus(projects, 'status'),
      
      // Staff
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.active === '1').length,
      
      // Invoices
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(i => i.status === '2').length, // Paid
      unpaidInvoices: invoices.filter(i => i.status === '1').length, // Unpaid
      overdueInvoices: invoices.filter(i => i.status === '6').length, // Overdue
      totalRevenue: invoices
        .filter(i => i.status === '2')
        .reduce((sum, i) => sum + parseFloat(i.total || '0'), 0),
      totalOutstanding: invoices
        .filter(i => ['1', '6'].includes(i.status))
        .reduce((sum, i) => sum + parseFloat(i.total || '0'), 0),
      invoicesByStatus: this.groupByStatus(invoices, 'status'),
      
      // Leads
      totalLeads: leads.length,
      convertedLeads: leads.filter(l => l.client_id).length,
      leadsByStatus: this.groupByStatus(leads, 'status'),
      
      // Tasks
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === '5').length, // Complete
      pendingTasks: tasks.filter(t => ['1', '2', '3', '4'].includes(t.status)).length,
      tasksByStatus: this.groupByStatus(tasks, 'status'),
      
      // Tickets
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status !== '5').length, // Not closed
      
      // Estimates
      totalEstimates: estimates.length,
      acceptedEstimates: estimates.filter(e => e.status === '4').length, // Accepted
      
      // Contracts
      totalContracts: contracts.length,
      activeContracts: contracts.filter(c => !c.trash && c.signed === '1').length,
      
      // Expenses
      totalExpenses: expenses.length,
      totalExpenseAmount: expenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0),
      
      // Recent items
      recentProjects: projects.slice(0, 5),
      recentInvoices: invoices.slice(0, 5),
      recentLeads: leads.slice(0, 5),
      recentTasks: tasks.slice(0, 5),
    };

    await this.saveToCache(CACHE_KEYS.DASHBOARD, stats, SYNC_CONFIG.cacheTTL.dashboard);
    this.emit('sync', { type: 'data_updated', entity: 'dashboard', data: stats } as SyncEvent);
    
    return stats;
  }

  private groupByStatus<T extends { status?: string }>(items: T[], key: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
      const status = String(item[key] || 'unknown');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // ========== DATA GETTERS (with cache) ==========

  async getCustomers(forceRefresh = false): Promise<Customer[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Customer[]>(CACHE_KEYS.CUSTOMERS);
      if (cached) return cached;
    }
    return this.syncCustomers();
  }

  async getProjects(forceRefresh = false): Promise<Project[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Project[]>(CACHE_KEYS.PROJECTS);
      if (cached) return cached;
    }
    return this.syncProjects();
  }

  async getStaff(forceRefresh = false): Promise<Staff[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Staff[]>(CACHE_KEYS.STAFF);
      if (cached) return cached;
    }
    return this.syncStaff();
  }

  async getInvoices(forceRefresh = false): Promise<Invoice[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Invoice[]>(CACHE_KEYS.INVOICES);
      if (cached) return cached;
    }
    return this.syncInvoices();
  }

  async getLeads(forceRefresh = false): Promise<Lead[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Lead[]>(CACHE_KEYS.LEADS);
      if (cached) return cached;
    }
    return this.syncLeads();
  }

  async getTasks(forceRefresh = false): Promise<Task[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Task[]>(CACHE_KEYS.TASKS);
      if (cached) return cached;
    }
    return this.syncTasks();
  }

  async getTickets(forceRefresh = false): Promise<Ticket[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Ticket[]>(CACHE_KEYS.TICKETS);
      if (cached) return cached;
    }
    return this.syncTickets();
  }

  async getEstimates(forceRefresh = false): Promise<Estimate[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Estimate[]>(CACHE_KEYS.ESTIMATES);
      if (cached) return cached;
    }
    return this.syncEstimates();
  }

  async getContracts(forceRefresh = false): Promise<Contract[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Contract[]>(CACHE_KEYS.CONTRACTS);
      if (cached) return cached;
    }
    return this.syncContracts();
  }

  async getExpenses(forceRefresh = false): Promise<Expense[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Expense[]>(CACHE_KEYS.EXPENSES);
      if (cached) return cached;
    }
    return this.syncExpenses();
  }

  async getDashboard(forceRefresh = false): Promise<DashboardStats> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<DashboardStats>(CACHE_KEYS.DASHBOARD);
      if (cached) return cached;
    }
    return this.calculateDashboard();
  }

  // ========== SEARCH & FILTER HELPERS ==========

  async searchCustomers(query: string): Promise<Customer[]> {
    const customers = await this.getCustomers();
    const q = query.toLowerCase();
    return customers.filter(c => 
      c.company.toLowerCase().includes(q) ||
      c.phonenumber?.includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  }

  async searchProjects(query: string): Promise<Project[]> {
    const projects = await this.getProjects();
    const q = query.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.company?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }

  async getProjectsByCustomer(customerId: string): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter(p => p.clientid === customerId);
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(t => t.rel_type === 'project' && t.rel_id === projectId);
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const invoices = await this.getInvoices();
    return invoices.filter(i => i.clientid === customerId);
  }

  // ========== STATE GETTERS ==========

  getState(): SyncState {
    return { ...this.state };
  }

  isAvailable(endpoint: string): boolean {
    return this.state.availableEndpoints.includes(endpoint);
  }

  // ========== CACHE HELPERS ==========

  private async saveToCache<T>(key: string, data: T, ttl: number): Promise<void> {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };
    await setItem(key, JSON.stringify(cached));
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const raw = await getItem(key);
      if (!raw) return null;

      const cached: CachedData<T> = JSON.parse(raw);
      if (Date.now() > cached.expiry) {
        await deleteItem(key);
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }

  async clearCache(): Promise<void> {
    const keys = Object.values(CACHE_KEYS);
    await Promise.all(keys.map(key => deleteItem(key)));
    console.log('[PerfexFullSync] Cache cleared');
  }

  // ========== API HELPERS ==========

  private async fetchWithTimeout(path: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_CONFIG.timeout);

    try {
      const url = `${SYNC_CONFIG.baseUrl}${path}`;
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'authtoken': SYNC_CONFIG.authToken,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await this.fetchWithTimeout(path, options);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text) return [] as unknown as T;

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON response');
    }
  }

  // ========== CLEANUP ==========

  destroy(): void {
    this.stopAutoSync();
    this.removeAllListeners();
    this.isInitialized = false;
    console.log('[PerfexFullSync] Destroyed');
  }
}

// ==================== SINGLETON INSTANCE ====================

export const perfexFullSync = new PerfexFullSyncManager();

// ==================== UTILITY FUNCTIONS ====================

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
}

// Status name maps
export const PROJECT_STATUS = {
  '1': 'Chưa bắt đầu',
  '2': 'Đang thực hiện',
  '3': 'Tạm dừng',
  '4': 'Hoàn thành',
  '5': 'Đã hủy',
};

export const INVOICE_STATUS = {
  '1': 'Chưa thanh toán',
  '2': 'Đã thanh toán',
  '3': 'Thanh toán một phần',
  '4': 'Quá hạn',
  '5': 'Đã hủy',
  '6': 'Thanh toán thất bại',
};

export const TASK_STATUS = {
  '1': 'Chưa bắt đầu',
  '2': 'Đang thực hiện',
  '3': 'Đang kiểm tra',
  '4': 'Chờ phản hồi',
  '5': 'Hoàn thành',
};

export const LEAD_STATUS = {
  '1': 'Tiềm năng',
  '2': 'Liên hệ',
  '3': 'Đề xuất',
  '4': 'Đã chuyển đổi',
  '5': 'Mất',
};

export function getStatusName(type: 'project' | 'invoice' | 'task' | 'lead', status: string): string {
  const maps: Record<string, Record<string, string>> = {
    project: PROJECT_STATUS,
    invoice: INVOICE_STATUS,
    task: TASK_STATUS,
    lead: LEAD_STATUS,
  };
  return maps[type]?.[status] || 'Không xác định';
}

export function getStatusColor(type: 'project' | 'invoice' | 'task' | 'lead', status: string): string {
  const colors: Record<string, Record<string, string>> = {
    project: { '1': '#6B7280', '2': '#0066CC', '3': '#0066CC', '4': '#3B82F6', '5': '#000000' },
    invoice: { '1': '#0066CC', '2': '#0066CC', '3': '#3B82F6', '4': '#000000', '5': '#6B7280', '6': '#000000' },
    task: { '1': '#6B7280', '2': '#3B82F6', '3': '#666666', '4': '#0066CC', '5': '#0066CC' },
    lead: { '1': '#3B82F6', '2': '#0066CC', '3': '#666666', '4': '#0066CC', '5': '#000000' },
  };
  return colors[type]?.[status] || '#6B7280';
}

export default perfexFullSync;
