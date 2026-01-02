/**
 * Budget Tracking Service
 * Enhanced budget management with detailed tracking, variance analysis, forecasting
 */

import { BaseApiService } from './base.service';
import type { ApiResponse, PaginatedResponse } from './types';

// ==================== TYPES ====================

export type BudgetCategory =
  | 'LABOR'
  | 'MATERIALS'
  | 'EQUIPMENT'
  | 'SUBCONTRACTOR'
  | 'OVERHEAD'
  | 'PERMITS'
  | 'DESIGN'
  | 'CONTINGENCY'
  | 'OTHER';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'OTHER';

export interface Budget {
  id: number;
  projectId: number;
  projectName?: string;
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  totalRemaining: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'CLOSED' | 'ON_HOLD';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLine {
  id: number;
  budgetId: number;
  category: BudgetCategory;
  phase?: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  committedAmount: number;
  variance: number;
  variancePercent: number;
  notes?: string;
}

export interface Expense {
  id: number;
  projectId: number;
  budgetId: number;
  category: BudgetCategory;
  phase?: string;
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  vendor?: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  invoiceNumber?: string;
  paymentMethod?: PaymentMethod;
  paidBy?: number;
  paidByName?: string;
  paidAt?: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  notes?: string;
  tags?: string[];
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  projectId: number;
  budgetId: number;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  items: InvoiceItem[];
  notes?: string;
  termsAndConditions?: string;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  amount: number;
  taxable: boolean;
}

export interface PaymentSchedule {
  id: number;
  projectId: number;
  budgetId: number;
  milestoneId?: number;
  description: string;
  amount: number;
  percentage: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidDate?: string;
  paidAmount?: number;
  invoiceId?: number;
  notes?: string;
}

export interface BudgetForecast {
  projectId: number;
  budgetId: number;
  forecastDate: string;
  projectedTotalCost: number;
  projectedVariance: number;
  projectedVariancePercent: number;
  completionPercentage: number;
  estimatedCompletionDate?: string;
  riskFactors: string[];
  recommendations: string[];
}

export interface BudgetVarianceAnalysis {
  budgetId: number;
  category: BudgetCategory;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
  trend: 'OVER_BUDGET' | 'UNDER_BUDGET' | 'ON_TRACK';
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CreateBudgetData {
  projectId: number;
  totalBudget: number;
  currency?: string;
  startDate: string;
  endDate?: string;
  lines?: Omit<BudgetLine, 'id' | 'budgetId'>[];
}

export interface UpdateBudgetData {
  totalBudget?: number;
  status?: 'ACTIVE' | 'CLOSED' | 'ON_HOLD';
  endDate?: string;
}

export interface CreateExpenseData {
  projectId: number;
  budgetId: number;
  category: BudgetCategory;
  phase?: string;
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  vendor?: string;
  receiptUrl?: string;
  invoiceNumber?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  tags?: string[];
}

export interface UpdateExpenseData {
  category?: BudgetCategory;
  description?: string;
  amount?: number;
  vendor?: string;
  status?: ExpenseStatus;
  receiptUrl?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateInvoiceData {
  projectId: number;
  budgetId: number;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  clientId: number;
  items: Omit<InvoiceItem, 'id'>[];
  taxRate?: number;
  discount?: number;
  currency?: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  dueDate?: string;
  items?: Omit<InvoiceItem, 'id'>[];
  taxRate?: number;
  discount?: number;
  notes?: string;
}

export interface BudgetFilters {
  projectId?: number;
  status?: 'ACTIVE' | 'CLOSED' | 'ON_HOLD';
  page?: number;
  limit?: number;
}

export interface ExpenseFilters {
  projectId?: number;
  budgetId?: number;
  category?: BudgetCategory;
  status?: ExpenseStatus;
  vendor?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'amount' | 'createdAt' | 'paidAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceFilters {
  projectId?: number;
  budgetId?: number;
  status?: InvoiceStatus;
  clientId?: number;
  dateFrom?: string;
  dateTo?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
}

// ==================== SERVICE ====================

class BudgetTrackingService extends BaseApiService {
  constructor() {
    super('BudgetTracking', {
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      },
      cache: {
        enabled: true,
        ttl: 2 * 60 * 1000, // 2 minutes
      },
      offlineSupport: true,
    });
  }

  // ==================== BUDGETS ====================

  /**
   * Get all budgets with filters
   */
  async getBudgets(filters?: BudgetFilters): Promise<PaginatedResponse<Budget>> {
    return this.get<PaginatedResponse<Budget>>('/budgets', filters as any, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get budget by ID
   */
  async getBudget(id: number): Promise<ApiResponse<Budget>> {
    return this.get<ApiResponse<Budget>>(`/budgets/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Get budget for project
   */
  async getProjectBudget(projectId: number): Promise<ApiResponse<Budget>> {
    return this.get<ApiResponse<Budget>>(`/projects/${projectId}/budget`, undefined, {
      cache: true,
    });
  }

  /**
   * Create budget
   */
  async createBudget(data: CreateBudgetData): Promise<ApiResponse<Budget>> {
    const result = await this.post<ApiResponse<Budget>>('/budgets', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/budgets');

    return result;
  }

  /**
   * Update budget
   */
  async updateBudget(id: number, data: UpdateBudgetData): Promise<ApiResponse<Budget>> {
    const result = await this.put<ApiResponse<Budget>>(`/budgets/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/budgets');
    await this.invalidateCache(`/budgets/${id}`);

    return result;
  }

  /**
   * Delete budget
   */
  async deleteBudget(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/budgets/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/budgets');

    return result;
  }

  // ==================== BUDGET LINES ====================

  /**
   * Get budget lines
   */
  async getBudgetLines(budgetId: number): Promise<ApiResponse<BudgetLine[]>> {
    return this.get<ApiResponse<BudgetLine[]>>(`/budgets/${budgetId}/lines`, undefined, {
      cache: true,
    });
  }

  /**
   * Create budget line
   */
  async createBudgetLine(budgetId: number, data: Omit<BudgetLine, 'id' | 'budgetId'>): Promise<ApiResponse<BudgetLine>> {
    const result = await this.post<ApiResponse<BudgetLine>>(`/budgets/${budgetId}/lines`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache(`/budgets/${budgetId}/lines`);

    return result;
  }

  /**
   * Update budget line
   */
  async updateBudgetLine(budgetId: number, lineId: number, data: Partial<BudgetLine>): Promise<ApiResponse<BudgetLine>> {
    const result = await this.put<ApiResponse<BudgetLine>>(`/budgets/${budgetId}/lines/${lineId}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache(`/budgets/${budgetId}/lines`);

    return result;
  }

  /**
   * Delete budget line
   */
  async deleteBudgetLine(budgetId: number, lineId: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/budgets/${budgetId}/lines/${lineId}`, {
      offlineQueue: true,
    });

    await this.invalidateCache(`/budgets/${budgetId}/lines`);

    return result;
  }

  // ==================== EXPENSES ====================

  /**
   * Get expenses with filters
   */
  async getExpenses(filters?: ExpenseFilters): Promise<PaginatedResponse<Expense>> {
    return this.get<PaginatedResponse<Expense>>('/expenses', filters as any, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get expense by ID
   */
  async getExpense(id: number): Promise<ApiResponse<Expense>> {
    return this.get<ApiResponse<Expense>>(`/expenses/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Create expense
   */
  async createExpense(data: CreateExpenseData): Promise<ApiResponse<Expense>> {
    const result = await this.post<ApiResponse<Expense>>('/expenses', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/expenses');
    await this.invalidateCache(`/budgets/${data.budgetId}`);

    return result;
  }

  /**
   * Update expense
   */
  async updateExpense(id: number, data: UpdateExpenseData): Promise<ApiResponse<Expense>> {
    const result = await this.put<ApiResponse<Expense>>(`/expenses/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/expenses');
    await this.invalidateCache(`/expenses/${id}`);

    return result;
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/expenses/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/expenses');

    return result;
  }

  /**
   * Approve expense
   */
  async approveExpense(id: number): Promise<ApiResponse<Expense>> {
    const result = await this.post<ApiResponse<Expense>>(`/expenses/${id}/approve`, undefined, {
      offlineQueue: true,
    });

    await this.invalidateCache('/expenses');
    await this.invalidateCache(`/expenses/${id}`);

    return result;
  }

  /**
   * Reject expense
   */
  async rejectExpense(id: number, reason: string): Promise<ApiResponse<Expense>> {
    const result = await this.post<ApiResponse<Expense>>(`/expenses/${id}/reject`, { reason }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/expenses');
    await this.invalidateCache(`/expenses/${id}`);

    return result;
  }

  /**
   * Mark expense as paid
   */
  async markExpensePaid(id: number, paymentMethod: PaymentMethod, paidAt?: string): Promise<ApiResponse<Expense>> {
    const result = await this.post<ApiResponse<Expense>>(`/expenses/${id}/pay`, {
      paymentMethod,
      paidAt,
    }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/expenses');
    await this.invalidateCache(`/expenses/${id}`);

    return result;
  }

  // ==================== INVOICES ====================

  /**
   * Get invoices with filters
   */
  async getInvoices(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
    return this.get<PaginatedResponse<Invoice>>('/invoices', filters as any, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(id: number): Promise<ApiResponse<Invoice>> {
    return this.get<ApiResponse<Invoice>>(`/invoices/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Create invoice
   */
  async createInvoice(data: CreateInvoiceData): Promise<ApiResponse<Invoice>> {
    const result = await this.post<ApiResponse<Invoice>>('/invoices', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/invoices');

    return result;
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: number, data: UpdateInvoiceData): Promise<ApiResponse<Invoice>> {
    const result = await this.put<ApiResponse<Invoice>>(`/invoices/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/invoices');
    await this.invalidateCache(`/invoices/${id}`);

    return result;
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/invoices/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/invoices');

    return result;
  }

  /**
   * Send invoice to client
   */
  async sendInvoice(id: number, email?: string): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`/invoices/${id}/send`, { email }, {
      offlineQueue: false, // Don't queue email sends
    });
  }

  /**
   * Record payment for invoice
   */
  async recordPayment(id: number, amount: number, paymentMethod: PaymentMethod, paidAt?: string): Promise<ApiResponse<Invoice>> {
    const result = await this.post<ApiResponse<Invoice>>(`/invoices/${id}/payments`, {
      amount,
      paymentMethod,
      paidAt,
    }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/invoices');
    await this.invalidateCache(`/invoices/${id}`);

    return result;
  }

  // ==================== PAYMENT SCHEDULE ====================

  /**
   * Get payment schedule for project
   */
  async getPaymentSchedule(projectId: number): Promise<ApiResponse<PaymentSchedule[]>> {
    return this.get<ApiResponse<PaymentSchedule[]>>(`/projects/${projectId}/payment-schedule`, undefined, {
      cache: true,
    });
  }

  /**
   * Create payment milestone
   */
  async createPaymentMilestone(data: Omit<PaymentSchedule, 'id' | 'status'>): Promise<ApiResponse<PaymentSchedule>> {
    const result = await this.post<ApiResponse<PaymentSchedule>>('/payment-schedule', data, {
      offlineQueue: true,
    });

    await this.invalidateCache(`/projects/${data.projectId}/payment-schedule`);

    return result;
  }

  /**
   * Update payment milestone
   */
  async updatePaymentMilestone(id: number, data: Partial<PaymentSchedule>): Promise<ApiResponse<PaymentSchedule>> {
    const result = await this.put<ApiResponse<PaymentSchedule>>(`/payment-schedule/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/payment-schedule');

    return result;
  }

  // ==================== ANALYTICS & REPORTS ====================

  /**
   * Get budget variance analysis
   */
  async getVarianceAnalysis(budgetId: number): Promise<ApiResponse<BudgetVarianceAnalysis[]>> {
    return this.get<ApiResponse<BudgetVarianceAnalysis[]>>(`/budgets/${budgetId}/variance-analysis`, undefined, {
      cache: true,
    });
  }

  /**
   * Get budget forecast
   */
  async getBudgetForecast(budgetId: number): Promise<ApiResponse<BudgetForecast>> {
    return this.get<ApiResponse<BudgetForecast>>(`/budgets/${budgetId}/forecast`, undefined, {
      cache: true,
    });
  }

  /**
   * Get expense summary by category
   */
  async getExpenseSummary(budgetId: number): Promise<ApiResponse<Record<BudgetCategory, number>>> {
    return this.get<ApiResponse<Record<BudgetCategory, number>>>(`/budgets/${budgetId}/expense-summary`, undefined, {
      cache: true,
    });
  }

  /**
   * Get cashflow projection
   */
  async getCashflowProjection(projectId: number, months: number = 6): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(`/projects/${projectId}/cashflow`, { months }, {
      cache: true,
    });
  }

  /**
   * Export budget report (PDF/Excel)
   */
  async exportBudgetReport(budgetId: number, format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await this.get<any>(`/budgets/${budgetId}/export`, { format });
    return response; // Returns blob for download
  }
}

// Export singleton instance
export const budgetService = new BudgetTrackingService();
export default budgetService;
