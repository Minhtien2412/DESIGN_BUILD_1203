import * as budgetService from '@/services/budget';
import type {
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
    RecordPaymentRequest,
    UpdateBudgetRequest,
    UpdateCostEstimateRequest,
    UpdateExpenseRequest,
    UpdateInvoiceRequest
} from '@/types/budget';
import { useCallback, useEffect, useState } from 'react';

// ==================== BUDGETS ====================

export const useBudgets = (projectId: string) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await budgetService.getBudgets(projectId);
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const createBudget = useCallback(async (data: CreateBudgetRequest) => {
    const newBudget = await budgetService.createBudget(data);
    setBudgets((prev) => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudget = useCallback(async (budgetId: string, data: UpdateBudgetRequest) => {
    const updated = await budgetService.updateBudget(budgetId, data);
    setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updated : b)));
    return updated;
  }, []);

  const deleteBudget = useCallback(async (budgetId: string) => {
    await budgetService.deleteBudget(budgetId);
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  }, []);

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
};

export const useBudgetSummary = (projectId: string) => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await budgetService.getBudgetSummary(projectId);
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};

// ==================== COST ESTIMATES ====================

export const useCostEstimates = (projectId: string, phaseId?: string) => {
  const [estimates, setEstimates] = useState<CostEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await budgetService.getCostEstimates(projectId, phaseId);
      setEstimates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  }, [projectId, phaseId]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  const createEstimate = useCallback(async (data: CreateCostEstimateRequest) => {
    const newEstimate = await budgetService.createCostEstimate(data);
    setEstimates((prev) => [...prev, newEstimate]);
    return newEstimate;
  }, []);

  const updateEstimate = useCallback(
    async (estimateId: string, data: UpdateCostEstimateRequest) => {
      const updated = await budgetService.updateCostEstimate(estimateId, data);
      setEstimates((prev) => prev.map((e) => (e.id === estimateId ? updated : e)));
      return updated;
    },
    []
  );

  const deleteEstimate = useCallback(async (estimateId: string) => {
    await budgetService.deleteCostEstimate(estimateId);
    setEstimates((prev) => prev.filter((e) => e.id !== estimateId));
  }, []);

  return {
    estimates,
    loading,
    error,
    refetch: fetchEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate,
  };
};

// ==================== EXPENSES ====================

export const useExpenses = (projectId: string, budgetId?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await budgetService.getExpenses(projectId, budgetId);
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [projectId, budgetId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = useCallback(async (data: CreateExpenseRequest) => {
    const newExpense = await budgetService.createExpense(data);
    setExpenses((prev) => [...prev, newExpense]);
    return newExpense;
  }, []);

  const updateExpense = useCallback(async (expenseId: string, data: UpdateExpenseRequest) => {
    const updated = await budgetService.updateExpense(expenseId, data);
    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
    return updated;
  }, []);

  const deleteExpense = useCallback(async (expenseId: string) => {
    await budgetService.deleteExpense(expenseId);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }, []);

  const approveExpense = useCallback(async (expenseId: string, notes?: string) => {
    const approved = await budgetService.approveExpense({ expenseId, notes });
    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? approved : e)));
    return approved;
  }, []);

  const rejectExpense = useCallback(async (expenseId: string, reason: string) => {
    const rejected = await budgetService.rejectExpense({ expenseId, reason });
    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? rejected : e)));
    return rejected;
  }, []);

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
  };
};

// ==================== INVOICES ====================

export const useInvoices = (projectId: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await budgetService.getInvoices(projectId);
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = useCallback(async (data: CreateInvoiceRequest) => {
    const newInvoice = await budgetService.createInvoice(data);
    setInvoices((prev) => [...prev, newInvoice]);
    return newInvoice;
  }, []);

  const updateInvoice = useCallback(async (invoiceId: string, data: UpdateInvoiceRequest) => {
    const updated = await budgetService.updateInvoice(invoiceId, data);
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? updated : i)));
    return updated;
  }, []);

  const deleteInvoice = useCallback(async (invoiceId: string) => {
    await budgetService.deleteInvoice(invoiceId);
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
  }, []);

  const sendInvoice = useCallback(async (invoiceId: string) => {
    const sent = await budgetService.sendInvoice(invoiceId);
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? sent : i)));
    return sent;
  }, []);

  const recordPayment = useCallback(async (data: RecordPaymentRequest) => {
    const payment = await budgetService.recordPayment(data);
    await fetchInvoices(); // Refresh to get updated invoice
    return payment;
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    recordPayment,
  };
};

// ==================== REPORTS ====================

export const useCostReport = (projectId: string, startDate: Date, endDate: Date) => {
  const [report, setReport] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await budgetService.getCostReport(projectId, startDate, endDate);
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }, [projectId, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
};

export const useCashFlowProjection = (projectId: string, months: number = 6) => {
  const [projection, setProjection] = useState<CashFlowProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjection = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await budgetService.getCashFlowProjection(projectId, months);
      setProjection(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projection');
    } finally {
      setLoading(false);
    }
  }, [projectId, months]);

  useEffect(() => {
    fetchProjection();
  }, [fetchProjection]);

  return { projection, loading, error, refetch: fetchProjection };
};
