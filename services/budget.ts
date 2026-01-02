import type {
    ApproveExpenseRequest,
    Budget,
    BudgetSummary,
    CashFlowProjection,
    CostEstimate,
    CostReport,
    CreateBudgetRequest,
    CreateCostEstimateRequest,
    CreateExpenseRequest,
    CreateInvoiceRequest,
    Expense,
    Invoice,
    Payment,
    RecordPaymentRequest,
    RejectExpenseRequest,
    UpdateBudgetRequest,
    UpdateCostEstimateRequest,
    UpdateExpenseRequest,
    UpdateInvoiceRequest,
} from '@/types/budget';
import { apiFetch } from './api';

const BASE_URL = '/budget';

// ==================== BUDGETS ====================

export const getBudgets = async (projectId: string): Promise<Budget[]> => {
  return apiFetch(`${BASE_URL}/budgets?projectId=${projectId}`);
};

export const getBudget = async (budgetId: string): Promise<Budget> => {
  return apiFetch(`${BASE_URL}/budgets/${budgetId}`);
};

export const createBudget = async (data: CreateBudgetRequest): Promise<Budget> => {
  return apiFetch(`${BASE_URL}/budgets`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateBudget = async (
  budgetId: string,
  data: UpdateBudgetRequest
): Promise<Budget> => {
  return apiFetch(`${BASE_URL}/budgets/${budgetId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/budgets/${budgetId}`, {
    method: 'DELETE',
  });
};

export const getBudgetSummary = async (projectId: string): Promise<BudgetSummary> => {
  return apiFetch(`${BASE_URL}/budgets/summary?projectId=${projectId}`);
};

// ==================== COST ESTIMATES ====================

export const getCostEstimates = async (
  projectId: string,
  phaseId?: string
): Promise<CostEstimate[]> => {
  const params = new URLSearchParams({ projectId });
  if (phaseId) params.append('phaseId', phaseId);
  return apiFetch(`${BASE_URL}/estimates?${params.toString()}`);
};

export const getCostEstimate = async (estimateId: string): Promise<CostEstimate> => {
  return apiFetch(`${BASE_URL}/estimates/${estimateId}`);
};

export const createCostEstimate = async (
  data: CreateCostEstimateRequest
): Promise<CostEstimate> => {
  return apiFetch(`${BASE_URL}/estimates`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCostEstimate = async (
  estimateId: string,
  data: UpdateCostEstimateRequest
): Promise<CostEstimate> => {
  return apiFetch(`${BASE_URL}/estimates/${estimateId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCostEstimate = async (estimateId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/estimates/${estimateId}`, {
    method: 'DELETE',
  });
};

// ==================== EXPENSES ====================

export const getExpenses = async (
  projectId: string,
  budgetId?: string
): Promise<Expense[]> => {
  const params = new URLSearchParams({ projectId });
  if (budgetId) params.append('budgetId', budgetId);
  return apiFetch(`${BASE_URL}/expenses?${params.toString()}`);
};

export const getExpense = async (expenseId: string): Promise<Expense> => {
  return apiFetch(`${BASE_URL}/expenses/${expenseId}`);
};

export const createExpense = async (data: CreateExpenseRequest): Promise<Expense> => {
  return apiFetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateExpense = async (
  expenseId: string,
  data: UpdateExpenseRequest
): Promise<Expense> => {
  return apiFetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: 'DELETE',
  });
};

export const approveExpense = async (data: ApproveExpenseRequest): Promise<Expense> => {
  return apiFetch(`${BASE_URL}/expenses/${data.expenseId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes: data.notes }),
  });
};

export const rejectExpense = async (data: RejectExpenseRequest): Promise<Expense> => {
  return apiFetch(`${BASE_URL}/expenses/${data.expenseId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: data.reason }),
  });
};

// ==================== INVOICES ====================

export const getInvoices = async (projectId: string): Promise<Invoice[]> => {
  return apiFetch(`${BASE_URL}/invoices?projectId=${projectId}`);
};

export const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices/${invoiceId}`);
};

export const createInvoice = async (data: CreateInvoiceRequest): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateInvoice = async (
  invoiceId: string,
  data: UpdateInvoiceRequest
): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices/${invoiceId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/invoices/${invoiceId}`, {
    method: 'DELETE',
  });
};

export const sendInvoice = async (invoiceId: string): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices/${invoiceId}/send`, {
    method: 'POST',
  });
};

export const recordPayment = async (data: RecordPaymentRequest): Promise<Payment> => {
  return apiFetch(`${BASE_URL}/invoices/${data.invoiceId}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getInvoicePayments = async (invoiceId: string): Promise<Payment[]> => {
  return apiFetch(`${BASE_URL}/invoices/${invoiceId}/payments`);
};

export const downloadInvoicePDF = async (invoiceId: string): Promise<Blob> => {
  const response = await apiFetch(`${BASE_URL}/invoices/${invoiceId}/pdf`, {
    method: 'GET',
  });
  return response.blob();
};

// ==================== REPORTS ====================

export const getCostReport = async (
  projectId: string,
  startDate: Date,
  endDate: Date
): Promise<CostReport> => {
  return apiFetch(
    `${BASE_URL}/reports/cost?projectId=${projectId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );
};

export const getCashFlowProjection = async (
  projectId: string,
  months: number
): Promise<CashFlowProjection[]> => {
  return apiFetch(`${BASE_URL}/reports/cashflow?projectId=${projectId}&months=${months}`);
};

export const exportBudgetReport = async (
  projectId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  const response = await apiFetch(
    `${BASE_URL}/reports/budget/export?projectId=${projectId}&format=${format}`,
    { method: 'GET' }
  );
  return response.blob();
};

export const exportExpenseReport = async (
  projectId: string,
  startDate: Date,
  endDate: Date,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  const response = await apiFetch(
    `${BASE_URL}/reports/expenses/export?projectId=${projectId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}`,
    { method: 'GET' }
  );
  return response.blob();
};
