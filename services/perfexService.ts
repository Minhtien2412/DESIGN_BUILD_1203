/**
 * Enhanced Perfex CRM Service
 * Full-featured integration with Perfex CRM API
 * 
 * Features:
 * - Projects: CRUD operations, tasks, milestones, files
 * - Tasks: Create, assign, track time, comments
 * - Invoices: Create, update, payments, send
 * - Estimates: Convert to invoice, accept/decline
 * - Expenses: Track project expenses
 * - Time tracking: Log billable/non-billable hours
 * - Customers: Manage customer data
 * - Staff: Team management
 * - Notes: Project and customer notes
 * - Files: Upload and manage documents
 * 
 * @author ThietKeResort Team
 * @created 2026-01-06
 */

import ENV from '@/config/env';

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  apiToken: ENV.PERFEX_API_TOKEN || '',
  timeout: 30000,
};

// ==================== ENHANCED TYPES ====================

// Project Management
export interface ProjectDetails extends PerfexProject {
  clientId: string;
  billingType: 'fixed' | 'project_hours' | 'task_hours';
  totalRate?: number;
  estimatedHours?: number;
  members?: ProjectMember[];
  settings?: ProjectSettings;
  progress?: number;
  totalLoggedTime?: number;
  customFields?: Record<string, any>;
}

export interface ProjectMember {
  staffId: string;
  name: string;
  email: string;
  role?: string;
}

export interface ProjectSettings {
  allowClientsViewTasks: boolean;
  allowClientsCreateTasks: boolean;
  allowClientsEditTasks: boolean;
  allowClientsCommentTasks: boolean;
  allowClientsViewTimesheet: boolean;
  allowClientsViewProjectMembers: boolean;
  allowClientsViewProjectFiles: boolean;
  allowClientsViewProjectDiscussions: boolean;
  allowClientsViewProjectGantt: boolean;
  allowClientsViewProjectMilestones: boolean;
}

// Task Management
export interface PerfexTask {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  assignedTo?: string[];
  relatedTo?: string;
  isPublic: boolean;
  billable: boolean;
  hourlyRate?: number;
  milestone?: string;
  tags?: string[];
  totalLoggedTime?: number;
  attachments?: number;
  checklistItems?: TaskChecklistItem[];
}

export type TaskStatus = 'not_started' | 'in_progress' | 'testing' | 'awaiting_feedback' | 'complete';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskChecklistItem {
  id: string;
  description: string;
  finished: boolean;
  addedFrom: string;
  dateFinished?: string;
  listOrder: number;
}

// Time Tracking
export interface TimeEntry {
  id?: string;
  taskId?: string;
  projectId?: string;
  staffId: string;
  startTime: string;
  endTime: string;
  hours: number;
  note?: string;
  hourlyRate?: number;
  isBillable: boolean;
  invoiceId?: string;
  tags?: string[];
}

// Milestones
export interface ProjectMilestone {
  id?: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  completedDate?: string;
  order?: number;
}

// Expenses
export interface ProjectExpense {
  id?: string;
  projectId?: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  name: string;
  note?: string;
  taxId?: string;
  customerId?: string;
  invoiceId?: string;
  isBillable: boolean;
  receipt?: string;
}

// Notes
export interface Note {
  id?: string;
  relatedTo: string; // 'project', 'customer', 'lead', etc.
  relId: string;
  description: string;
  dateContacted?: string;
  addedFrom: string;
  dateAdded?: string;
}

// Files
export interface ProjectFile {
  id?: string;
  relId: string;
  relType: string; // 'project', 'task', 'customer', etc.
  fileName: string;
  fileType: string;
  filePath?: string;
  dateAdded?: string;
  visibleToCustomer: boolean;
  staffId?: string;
  contactId?: string;
}

// Invoice Management
export interface InvoiceDetails {
  id?: string;
  clientId: string;
  number?: string;
  date: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  total: number;
  tax?: number;
  discount?: InvoiceDiscount;
  adjustmentAmount?: number;
  items: InvoiceItem[];
  status: InvoiceStatus;
  terms?: string;
  clientNote?: string;
  adminNote?: string;
  recurring?: RecurringSettings;
  allowedPaymentModes?: string[];
  projectId?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  longDescription?: string;
  quantity: number;
  rate: number;
  taxId?: string;
  unit?: string;
  order?: number;
}

export interface InvoiceDiscount {
  type: 'percent' | 'fixed';
  value: number;
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'draft';

export interface RecurringSettings {
  isRecurring: boolean;
  repeatEvery: number;
  repeatType: 'day' | 'week' | 'month' | 'year';
  cycles?: number;
  totalCycles?: number;
  customRecurring?: boolean;
}

// Payment
export interface Payment {
  id?: string;
  invoiceId: string;
  amount: number;
  paymentMode: string;
  date: string;
  note?: string;
  transactionId?: string;
}

// Estimate Management
export interface EstimateDetails {
  id?: string;
  clientId: string;
  number?: string;
  date: string;
  expiryDate: string;
  currency: string;
  subtotal: number;
  total: number;
  tax?: number;
  discount?: InvoiceDiscount;
  items: InvoiceItem[];
  status: EstimateStatus;
  reference?: string;
  adminNote?: string;
  clientNote?: string;
  terms?: string;
  projectId?: string;
}

export type EstimateStatus = 'draft' | 'sent' | 'declined' | 'accepted' | 'expired';

// Customer Management
export interface CustomerDetails {
  userId: string;
  company: string;
  vat?: string;
  phoneNumber?: string;
  country: string;
  city: string;
  zip?: string;
  state?: string;
  address?: string;
  website?: string;
  active: boolean;
  defaultLanguage?: string;
  defaultCurrency?: string;
  showPrimaryContact?: boolean;
  stripeId?: string;
  registrationConfirmed?: boolean;
  customFields?: Record<string, any>;
}

export interface Contact {
  id?: string;
  userId: string;
  isPrimary: boolean;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  phoneNumber?: string;
  direction?: string;
  password?: string;
  sendSetPasswordEmail?: boolean;
  doNotSendWelcomeEmail?: boolean;
  permissions?: string[];
  active?: boolean;
}

// Ticket Management
export interface TicketDetails {
  id?: string;
  subject: string;
  message: string;
  departmentId: string;
  priority: TicketPriority;
  status: TicketStatus;
  service?: string;
  contactId?: string;
  userId?: string;
  email?: string;
  name?: string;
  assignedTo?: string;
  projectId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  attachments?: ProjectFile[];
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'answered' | 'on_hold' | 'closed';

export interface TicketReply {
  ticketId: string;
  userId?: string;
  contactId?: string;
  name?: string;
  email?: string;
  message: string;
  attachments?: File[];
}

// Activity Log
export interface ActivityLog {
  id: string;
  description: string;
  date: string;
  relatedType: string;
  relatedId: string;
  staffId?: string;
  fullName?: string;
  additionalData?: string;
}

// Dashboard Stats
export interface DashboardStats {
  projects: {
    total: number;
    notStarted: number;
    inProgress: number;
    onHold: number;
    cancelled: number;
    finished: number;
  };
  tasks: {
    total: number;
    notStarted: number;
    inProgress: number;
    testing: number;
    awaitingFeedback: number;
    complete: number;
  };
  invoices: {
    total: number;
    unpaid: number;
    paid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  };
  estimates: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    declined: number;
    expired: number;
    totalAmount: number;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    answered: number;
    onHold: number;
    closed: number;
  };
  customers: {
    total: number;
    active: number;
    inactive: number;
  };
}

// Base types from original service
export interface PerfexProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  deadline?: string;
  cost?: number;
  billingType?: string;
}

export interface PerfexInvoice {
  id: string;
  number: string;
  total: number;
  status: string;
  dueDate?: string;
  paidDate?: string;
}

export interface PerfexEstimate {
  id: string;
  number: string;
  total: number;
  status: string;
  expiryDate?: string;
}

export interface PerfexTicket {
  id: string;
  subject: string;
  message?: string;
  status: string;
  priority: string;
  lastReply?: string;
}

// ==================== ENHANCED PERFEX CRM SERVICE ====================

class EnhancedPerfexService {
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = PERFEX_CONFIG.apiToken;
    this.baseUrl = PERFEX_CONFIG.baseUrl;
  }

  // ==================== HELPER METHODS ====================

  private async apiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const options: RequestInit = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[PerfexAPI] ${method} ${endpoint} failed:`, error);
      throw error;
    }
  }

  // ==================== PROJECT MANAGEMENT ====================

  async getProjects(): Promise<PerfexProject[]> {
    return this.apiCall<PerfexProject[]>('/projects');
  }

  async getProject(id: string): Promise<ProjectDetails> {
    return this.apiCall<ProjectDetails>(`/projects/${id}`);
  }

  async createProject(project: Partial<ProjectDetails>): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/projects', 'POST', project);
  }

  async updateProject(id: string, updates: Partial<ProjectDetails>): Promise<boolean> {
    await this.apiCall(`/projects/${id}`, 'PUT', updates);
    return true;
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.apiCall(`/projects/${id}`, 'DELETE');
    return true;
  }

  async addProjectMember(projectId: string, staffId: string): Promise<boolean> {
    return this.apiCall(`/projects/${projectId}/members`, 'POST', { staffId });
  }

  async removeProjectMember(projectId: string, staffId: string): Promise<boolean> {
    return this.apiCall(`/projects/${projectId}/members/${staffId}`, 'DELETE');
  }

  async getProjectActivity(projectId: string): Promise<ActivityLog[]> {
    return this.apiCall<ActivityLog[]>(`/projects/${projectId}/activity`);
  }

  // ==================== TASK MANAGEMENT ====================

  async getTasks(params?: { projectId?: string; status?: TaskStatus }): Promise<PerfexTask[]> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.apiCall<PerfexTask[]>(`/tasks${query}`);
  }

  async getTask(id: string): Promise<PerfexTask> {
    return this.apiCall<PerfexTask>(`/tasks/${id}`);
  }

  async createTask(task: Partial<PerfexTask>): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/tasks', 'POST', task);
  }

  async updateTask(id: string, updates: Partial<PerfexTask>): Promise<boolean> {
    await this.apiCall(`/tasks/${id}`, 'PUT', updates);
    return true;
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.apiCall(`/tasks/${id}`, 'DELETE');
    return true;
  }

  async assignTask(taskId: string, staffIds: string[]): Promise<boolean> {
    return this.apiCall(`/tasks/${taskId}/assign`, 'POST', { staffIds });
  }

  async addTaskComment(taskId: string, comment: string): Promise<boolean> {
    return this.apiCall(`/tasks/${taskId}/comments`, 'POST', { comment });
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
    return this.apiCall(`/tasks/${taskId}/status`, 'PUT', { status });
  }

  async addTaskChecklistItem(taskId: string, description: string): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>(`/tasks/${taskId}/checklist`, 'POST', { description });
  }

  async toggleChecklistItem(taskId: string, itemId: string, finished: boolean): Promise<boolean> {
    return this.apiCall(`/tasks/${taskId}/checklist/${itemId}`, 'PUT', { finished });
  }

  // ==================== TIME TRACKING ====================

  async logTime(entry: TimeEntry): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/timesheets', 'POST', entry);
  }

  async getTimeEntries(params: { projectId?: string; taskId?: string; staffId?: string }): Promise<TimeEntry[]> {
    const query = '?' + new URLSearchParams(params as any).toString();
    return this.apiCall<TimeEntry[]>(`/timesheets${query}`);
  }

  async updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<boolean> {
    await this.apiCall(`/timesheets/${id}`, 'PUT', updates);
    return true;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    await this.apiCall(`/timesheets/${id}`, 'DELETE');
    return true;
  }

  async getProjectTotalHours(projectId: string): Promise<{ total: number; billable: number; nonBillable: number }> {
    return this.apiCall(`/projects/${projectId}/total-hours`);
  }

  // ==================== MILESTONES ====================

  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    return this.apiCall<ProjectMilestone[]>(`/projects/${projectId}/milestones`);
  }

  async createMilestone(milestone: ProjectMilestone): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/milestones', 'POST', milestone);
  }

  async updateMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<boolean> {
    await this.apiCall(`/milestones/${id}`, 'PUT', updates);
    return true;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    await this.apiCall(`/milestones/${id}`, 'DELETE');
    return true;
  }

  async markMilestoneComplete(id: string): Promise<boolean> {
    return this.apiCall(`/milestones/${id}/complete`, 'PUT', { isCompleted: true });
  }

  // ==================== EXPENSES ====================

  async getExpenses(projectId?: string): Promise<ProjectExpense[]> {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.apiCall<ProjectExpense[]>(`/expenses${query}`);
  }

  async createExpense(expense: ProjectExpense): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/expenses', 'POST', expense);
  }

  async updateExpense(id: string, updates: Partial<ProjectExpense>): Promise<boolean> {
    await this.apiCall(`/expenses/${id}`, 'PUT', updates);
    return true;
  }

  async deleteExpense(id: string): Promise<boolean> {
    await this.apiCall(`/expenses/${id}`, 'DELETE');
    return true;
  }

  // ==================== INVOICE MANAGEMENT ====================

  async getInvoices(params?: { customerId?: string; projectId?: string; status?: InvoiceStatus }): Promise<PerfexInvoice[]> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.apiCall<PerfexInvoice[]>(`/invoices${query}`);
  }

  async getInvoice(id: string): Promise<InvoiceDetails> {
    return this.apiCall<InvoiceDetails>(`/invoices/${id}`);
  }

  async createInvoice(invoice: Partial<InvoiceDetails>): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/invoices', 'POST', invoice);
  }

  async updateInvoice(id: string, updates: Partial<InvoiceDetails>): Promise<boolean> {
    await this.apiCall(`/invoices/${id}`, 'PUT', updates);
    return true;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await this.apiCall(`/invoices/${id}`, 'DELETE');
    return true;
  }

  async sendInvoiceToCustomer(id: string, email?: string): Promise<boolean> {
    return this.apiCall(`/invoices/${id}/send`, 'POST', { email });
  }

  async markInvoiceAsSent(id: string): Promise<boolean> {
    return this.apiCall(`/invoices/${id}/mark-sent`, 'PUT', {});
  }

  async recordPayment(payment: Payment): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/payments', 'POST', payment);
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    return this.apiCall<Payment[]>(`/invoices/${invoiceId}/payments`);
  }

  // ==================== ESTIMATE MANAGEMENT ====================

  async getEstimates(params?: { customerId?: string; status?: EstimateStatus }): Promise<PerfexEstimate[]> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.apiCall<PerfexEstimate[]>(`/estimates${query}`);
  }

  async getEstimate(id: string): Promise<EstimateDetails> {
    return this.apiCall<EstimateDetails>(`/estimates/${id}`);
  }

  async createEstimate(estimate: Partial<EstimateDetails>): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/estimates', 'POST', estimate);
  }

  async updateEstimate(id: string, updates: Partial<EstimateDetails>): Promise<boolean> {
    await this.apiCall(`/estimates/${id}`, 'PUT', updates);
    return true;
  }

  async deleteEstimate(id: string): Promise<boolean> {
    await this.apiCall(`/estimates/${id}`, 'DELETE');
    return true;
  }

  async sendEstimateToCustomer(id: string, email?: string): Promise<boolean> {
    return this.apiCall(`/estimates/${id}/send`, 'POST', { email });
  }

  async convertEstimateToInvoice(estimateId: string): Promise<{ invoiceId: string }> {
    return this.apiCall<{ invoiceId: string }>(`/estimates/${estimateId}/convert`, 'POST', {});
  }

  async markEstimateAccepted(id: string): Promise<boolean> {
    return this.apiCall(`/estimates/${id}/accept`, 'PUT', {});
  }

  async markEstimateDeclined(id: string, reason?: string): Promise<boolean> {
    return this.apiCall(`/estimates/${id}/decline`, 'PUT', { reason });
  }

  // ==================== CONTRACTS ====================

  async getContracts(params?: { project_id?: string; client_id?: string }): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.apiCall<any[]>(`/contracts${query}`);
  }

  async getContract(id: string): Promise<any> {
    return this.apiCall(`/contracts/${id}`);
  }

  async createContract(contract: any): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/contracts', 'POST', contract);
  }

  async updateContract(id: string, updates: any): Promise<boolean> {
    await this.apiCall(`/contracts/${id}`, 'PUT', updates);
    return true;
  }

  async deleteContract(id: string): Promise<boolean> {
    await this.apiCall(`/contracts/${id}`, 'DELETE');
    return true;
  }

  // ==================== PROJECT DISCUSSIONS ====================

  async getProjectDiscussions(projectId: string): Promise<any[]> {
    return this.apiCall<any[]>(`/projects/${projectId}/discussions`);
  }

  async createProjectDiscussion(projectId: string, data: { subject: string; description: string }): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>(`/projects/${projectId}/discussions`, 'POST', data);
  }

  async getDiscussionComments(discussionId: string): Promise<any[]> {
    return this.apiCall<any[]>(`/discussions/${discussionId}/comments`);
  }

  async addDiscussionComment(discussionId: string, content: string): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>(`/discussions/${discussionId}/comments`, 'POST', { content });
  }

  // ==================== PROJECT NOTES ====================

  async getProjectNotes(projectId: string): Promise<any[]> {
    return this.apiCall<any[]>(`/projects/${projectId}/notes`);
  }

  async addProjectNote(projectId: string, data: { name: string; description: string }): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>(`/projects/${projectId}/notes`, 'POST', data);
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  async getCustomers(): Promise<CustomerDetails[]> {
    return this.apiCall<CustomerDetails[]>('/customers');
  }

  async getCustomer(id: string): Promise<CustomerDetails> {
    return this.apiCall<CustomerDetails>(`/customers/${id}`);
  }

  async createCustomer(customer: Partial<CustomerDetails>): Promise<{ userId: string }> {
    return this.apiCall<{ userId: string }>('/customers', 'POST', customer);
  }

  async updateCustomer(id: string, updates: Partial<CustomerDetails>): Promise<boolean> {
    await this.apiCall(`/customers/${id}`, 'PUT', updates);
    return true;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    await this.apiCall(`/customers/${id}`, 'DELETE');
    return true;
  }

  async getCustomerContacts(customerId: string): Promise<Contact[]> {
    return this.apiCall<Contact[]>(`/customers/${customerId}/contacts`);
  }

  async createContact(contact: Partial<Contact>): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/contacts', 'POST', contact);
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    await this.apiCall(`/contacts/${id}`, 'PUT', updates);
    return true;
  }

  // ==================== TICKET MANAGEMENT ====================

  async getTickets(params?: { status?: TicketStatus; assignedTo?: string }): Promise<PerfexTicket[]> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.apiCall<PerfexTicket[]>(`/tickets${query}`);
  }

  async getTicket(id: string): Promise<TicketDetails> {
    return this.apiCall<TicketDetails>(`/tickets/${id}`);
  }

  async createTicket(ticket: Partial<TicketDetails>): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/tickets', 'POST', ticket);
  }

  async updateTicket(id: string, updates: Partial<TicketDetails>): Promise<boolean> {
    await this.apiCall(`/tickets/${id}`, 'PUT', updates);
    return true;
  }

  async deleteTicket(id: string): Promise<boolean> {
    await this.apiCall(`/tickets/${id}`, 'DELETE');
    return true;
  }

  async replyToTicket(reply: TicketReply): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/tickets/reply', 'POST', reply);
  }

  async changeTicketStatus(ticketId: string, status: TicketStatus): Promise<boolean> {
    return this.apiCall(`/tickets/${ticketId}/status`, 'PUT', { status });
  }

  async assignTicket(ticketId: string, staffId: string): Promise<boolean> {
    return this.apiCall(`/tickets/${ticketId}/assign`, 'PUT', { staffId });
  }

  // ==================== NOTES ====================

  async getNotes(relatedTo: string, relId: string): Promise<Note[]> {
    return this.apiCall<Note[]>(`/notes?related_to=${relatedTo}&rel_id=${relId}`);
  }

  async createNote(note: Partial<Note>): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>('/notes', 'POST', note);
  }

  async updateNote(id: string, description: string): Promise<boolean> {
    await this.apiCall(`/notes/${id}`, 'PUT', { description });
    return true;
  }

  async deleteNote(id: string): Promise<boolean> {
    await this.apiCall(`/notes/${id}`, 'DELETE');
    return true;
  }

  // ==================== FILES ====================

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return this.apiCall<ProjectFile[]>(`/projects/${projectId}/files`);
  }

  async uploadFile(file: File, relType: string, relId: string, visibleToCustomer: boolean = false): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rel_type', relType);
    formData.append('rel_id', relId);
    formData.append('visible_to_customer', visibleToCustomer ? '1' : '0');

    const response = await fetch(`${this.baseUrl}/api/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
      body: formData,
    });

    return response.json();
  }

  async deleteFile(id: string): Promise<boolean> {
    await this.apiCall(`/files/${id}`, 'DELETE');
    return true;
  }

  // ==================== STAFF ====================

  async getStaff(): Promise<any[]> {
    return this.apiCall<any[]>('/staff');
  }

  async getStaffMember(id: string): Promise<any> {
    return this.apiCall(`/staff/${id}`);
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(): Promise<DashboardStats> {
    return this.apiCall<DashboardStats>('/dashboard/stats');
  }

  async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    return this.apiCall<ActivityLog[]>(`/activity?limit=${limit}`);
  }
}

// Export singleton instance
export const perfexService = new EnhancedPerfexService();
export default perfexService;
