/**
 * Perfex CRM API Service
 * =======================
 * 
 * Unified API service cho tất cả Perfex CRM modules.
 * Hỗ trợ 17 modules với 90+ endpoints.
 * 
 * Architecture:
 * - Type-safe với TypeScript interfaces từ types/perfex.ts
 * - Error handling và logging
 * - Request/Response transformation
 * 
 * @author ThietKeResort Team
 * @created January 7, 2026
 */

import ENV from '@/config/env';
import type {
    Contact,
    Contract,
    CreditNote,
    Customer,
    Estimate,
    Expense,
    ExpenseCategory,
    Invoice,
    Lead,
    Milestone,
    Payment,
    PaymentMode,
    Product,
    Project,
    Staff,
    Task,
    Ticket,
} from '@/types/perfex';

// ==================== CONFIG ====================

const API_CONFIG = {
  baseURL: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  token: ENV.PERFEX_API_TOKEN || '',
  timeout: 30000,
};

console.log('[PerfexAPI] Config:', {
  baseURL: API_CONFIG.baseURL,
  hasToken: !!API_CONFIG.token,
});

// ==================== API CLIENT ====================

class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class PerfexAPIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.baseURL}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'authtoken': API_CONFIG.token,
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    console.log(`[PerfexAPI] ${options.method || 'GET'} ${endpoint}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PerfexAPI] Error:', response.status, errorText);
        throw new APIError(
          response.status,
          response.statusText,
          `API Error: ${response.status} ${response.statusText}`,
          errorText
        );
      }

      const data = await response.json();
      console.log(`[PerfexAPI] Success:`, endpoint);
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error('[PerfexAPI] Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new PerfexAPIClient();

// ==================== CUSTOMERS API ====================

export const customersAPI = {
  /**
   * Get all customers
   */
  async list(): Promise<Customer[]> {
    return apiClient.get<Customer[]>('/customers');
  },

  /**
   * Get customer by ID
   */
  async get(id: string): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  /**
   * Search customers by query
   */
  async search(query: string): Promise<Customer[]> {
    return apiClient.get<Customer[]>(`/customers/search/${encodeURIComponent(query)}`);
  },

  /**
   * Create new customer
   */
  async create(data: Partial<Customer>): Promise<Customer> {
    return apiClient.post<Customer>('/customers', data);
  },

  /**
   * Update existing customer
   */
  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return apiClient.post<Customer>(`/customers/${id}`, data);
  },

  /**
   * Delete customer
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/customers/${id}`);
  },
};

// ==================== CONTACTS API ====================

export const contactsAPI = {
  async list(): Promise<Contact[]> {
    return apiClient.get<Contact[]>('/contacts');
  },

  async get(id: string): Promise<Contact> {
    return apiClient.get<Contact>(`/contacts/${id}`);
  },

  async search(query: string): Promise<Contact[]> {
    return apiClient.get<Contact[]>(`/contacts/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Contact>): Promise<Contact> {
    return apiClient.post<Contact>('/contacts', data);
  },

  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    return apiClient.post<Contact>(`/contacts/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/contacts/${id}`);
  },
};

// ==================== INVOICES API ====================

export const invoicesAPI = {
  async list(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/invoices');
  },

  async get(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  },

  async search(query: string): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>(`/invoices/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>('/invoices', data);
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>(`/invoices/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/invoices/${id}`);
  },
};

// ==================== PRODUCTS API ====================

export const productsAPI = {
  /**
   * Get all products (Read-only)
   */
  async list(): Promise<Product[]> {
    return apiClient.get<Product[]>('/products');
  },

  /**
   * Search products (Read-only)
   */
  async search(query: string): Promise<Product[]> {
    return apiClient.get<Product[]>(`/products/search/${encodeURIComponent(query)}`);
  },
};

// ==================== LEADS API ====================

export const leadsAPI = {
  async list(): Promise<Lead[]> {
    return apiClient.get<Lead[]>('/leads');
  },

  async get(id: string): Promise<Lead> {
    return apiClient.get<Lead>(`/leads/${id}`);
  },

  async search(query: string): Promise<Lead[]> {
    return apiClient.get<Lead[]>(`/leads/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Lead>): Promise<Lead> {
    return apiClient.post<Lead>('/leads', data);
  },

  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    return apiClient.post<Lead>(`/leads/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/leads/${id}`);
  },
};

// ==================== MILESTONES API ====================

export const milestonesAPI = {
  async list(): Promise<Milestone[]> {
    return apiClient.get<Milestone[]>('/milestones');
  },

  async get(id: string): Promise<Milestone> {
    return apiClient.get<Milestone>(`/milestones/${id}`);
  },

  async search(query: string): Promise<Milestone[]> {
    return apiClient.get<Milestone[]>(`/milestones/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Milestone>): Promise<Milestone> {
    return apiClient.post<Milestone>('/milestones', data);
  },

  async update(id: string, data: Partial<Milestone>): Promise<Milestone> {
    return apiClient.post<Milestone>(`/milestones/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/milestones/${id}`);
  },
};

// ==================== PROJECTS API ====================

export const projectsAPI = {
  async list(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  },

  async get(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async search(query: string): Promise<Project[]> {
    return apiClient.get<Project[]>(`/projects/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Project>): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    return apiClient.post<Project>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};

// ==================== STAFF API ====================

export const staffAPI = {
  async list(): Promise<Staff[]> {
    return apiClient.get<Staff[]>('/staff');
  },

  async get(id: string): Promise<Staff> {
    return apiClient.get<Staff>(`/staff/${id}`);
  },

  async search(query: string): Promise<Staff[]> {
    return apiClient.get<Staff[]>(`/staff/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Staff>): Promise<Staff> {
    return apiClient.post<Staff>('/staff', data);
  },

  async update(id: string, data: Partial<Staff>): Promise<Staff> {
    return apiClient.post<Staff>(`/staff/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/staff/${id}`);
  },
};

// ==================== TASKS API ====================

export const tasksAPI = {
  async list(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks');
  },

  async get(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  async search(query: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/tasks/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Task>): Promise<Task> {
    return apiClient.post<Task>('/tasks', data);
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    return apiClient.post<Task>(`/tasks/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};

// ==================== TICKETS API ====================

export const ticketsAPI = {
  async list(): Promise<Ticket[]> {
    return apiClient.get<Ticket[]>('/tickets');
  },

  async get(id: string): Promise<Ticket> {
    return apiClient.get<Ticket>(`/tickets/${id}`);
  },

  async search(query: string): Promise<Ticket[]> {
    return apiClient.get<Ticket[]>(`/tickets/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Ticket>): Promise<Ticket> {
    return apiClient.post<Ticket>('/tickets', data);
  },

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    return apiClient.post<Ticket>(`/tickets/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/tickets/${id}`);
  },
};

// ==================== CONTRACTS API ====================

export const contractsAPI = {
  /**
   * Get all contracts
   */
  async list(): Promise<Contract[]> {
    return apiClient.get<Contract[]>('/contracts');
  },

  /**
   * Create new contract (Limited)
   */
  async create(data: Partial<Contract>): Promise<Contract> {
    return apiClient.post<Contract>('/contracts', data);
  },

  /**
   * Delete contract (Limited)
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/contracts/${id}`);
  },
};

// ==================== CREDIT NOTES API ====================

export const creditNotesAPI = {
  async list(): Promise<CreditNote[]> {
    return apiClient.get<CreditNote[]>('/credit_notes');
  },

  async get(id: string): Promise<CreditNote> {
    return apiClient.get<CreditNote>(`/credit_notes/${id}`);
  },

  async search(query: string): Promise<CreditNote[]> {
    return apiClient.get<CreditNote[]>(`/credit_notes/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<CreditNote>): Promise<CreditNote> {
    return apiClient.post<CreditNote>('/credit_notes', data);
  },

  async update(id: string, data: Partial<CreditNote>): Promise<CreditNote> {
    return apiClient.post<CreditNote>(`/credit_notes/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/credit_notes/${id}`);
  },
};

// ==================== ESTIMATES API ====================

export const estimatesAPI = {
  async list(): Promise<Estimate[]> {
    return apiClient.get<Estimate[]>('/estimates');
  },

  async get(id: string): Promise<Estimate> {
    return apiClient.get<Estimate>(`/estimates/${id}`);
  },

  async search(query: string): Promise<Estimate[]> {
    return apiClient.get<Estimate[]>(`/estimates/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Estimate>): Promise<Estimate> {
    return apiClient.post<Estimate>('/estimates', data);
  },

  async update(id: string, data: Partial<Estimate>): Promise<Estimate> {
    return apiClient.post<Estimate>(`/estimates/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/estimates/${id}`);
  },
};

// ==================== EXPENSES API ====================

export const expensesAPI = {
  async list(): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/expenses');
  },

  async get(id: string): Promise<Expense> {
    return apiClient.get<Expense>(`/expenses/${id}`);
  },

  async search(query: string): Promise<Expense[]> {
    return apiClient.get<Expense[]>(`/expenses/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Expense>): Promise<Expense> {
    return apiClient.post<Expense>('/expenses', data);
  },

  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    return apiClient.post<Expense>(`/expenses/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/expenses/${id}`);
  },
};

// ==================== EXPENSE CATEGORIES API ====================

export const expenseCategoriesAPI = {
  /**
   * Get all expense categories (Read-only)
   */
  async list(): Promise<ExpenseCategory[]> {
    return apiClient.get<ExpenseCategory[]>('/expense_categories');
  },
};

// ==================== PAYMENTS API ====================

export const paymentsAPI = {
  async list(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments');
  },

  async search(query: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(`/payments/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Payment>): Promise<Payment> {
    return apiClient.post<Payment>('/payments', data);
  },

  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/payments/${id}`);
  },
};

// ==================== PAYMENT MODES API ====================

export const paymentModesAPI = {
  /**
   * Get all payment modes (Read-only)
   */
  async list(): Promise<PaymentMode[]> {
    return apiClient.get<PaymentMode[]>('/payment_modes');
  },
};

// ==================== MAIN EXPORT ====================

/**
 * Perfex CRM API Service
 * 
 * Usage:
 * ```typescript
 * import { perfexAPI } from '@/services/perfexAPI';
 * 
 * // Customers
 * const customers = await perfexAPI.customers.list();
 * const customer = await perfexAPI.customers.get('123');
 * await perfexAPI.customers.create({ company: 'New Company' });
 * 
 * // Invoices
 * const invoices = await perfexAPI.invoices.list();
 * await perfexAPI.invoices.update('1', { status: 2 });
 * ```
 */
export const perfexAPI = {
  customers: customersAPI,
  contacts: contactsAPI,
  invoices: invoicesAPI,
  products: productsAPI,
  leads: leadsAPI,
  milestones: milestonesAPI,
  projects: projectsAPI,
  staff: staffAPI,
  tasks: tasksAPI,
  tickets: ticketsAPI,
  contracts: contractsAPI,
  creditNotes: creditNotesAPI,
  estimates: estimatesAPI,
  expenses: expensesAPI,
  expenseCategories: expenseCategoriesAPI,
  payments: paymentsAPI,
  paymentModes: paymentModesAPI,
};

export default perfexAPI;
