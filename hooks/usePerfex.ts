/**
 * Enhanced Perfex CRM Hooks
 * React hooks for comprehensive CRM features
 */

import { useCallback, useState } from 'react';
import {
    DashboardStats,
    InvoiceDetails,
    Payment,
    perfexService,
    PerfexTask,
    ProjectDetails,
    ProjectExpense,
    ProjectMilestone,
    TimeEntry
} from '../services/perfexService';

// ==================== PROJECT MANAGEMENT HOOK ====================

export function useProjects() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projects = await perfexService.getProjects();
      return projects;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const project = await perfexService.getProject(id);
      return project;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (project: Partial<ProjectDetails>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.createProject(project);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<ProjectDetails>) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.updateProject(id, updates);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.deleteProject(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (projectId: string, staffId: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.addProjectMember(projectId, staffId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (projectId: string, staffId: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.removeProjectMember(projectId, staffId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
  };
}

// ==================== TASK MANAGEMENT HOOK ====================

export function useTasks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTasks = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await perfexService.getTasks(projectId ? { projectId } : undefined);
      return tasks;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const task = await perfexService.getTask(id);
      return task;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: Partial<PerfexTask>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.createTask(task);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<PerfexTask>) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.updateTask(id, updates);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.deleteTask(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignTask = useCallback(async (taskId: string, staffIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.assignTask(taskId, staffIds);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (taskId: string, status: any) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.updateTaskStatus(taskId, status);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (taskId: string, comment: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.addTaskComment(taskId, comment);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addChecklistItem = useCallback(async (taskId: string, description: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.addTaskChecklistItem(taskId, description);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleChecklistItem = useCallback(async (taskId: string, itemId: string, finished: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.toggleChecklistItem(taskId, itemId, finished);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    updateStatus,
    addComment,
    addChecklistItem,
    toggleChecklistItem,
  };
}

// ==================== TIME TRACKING HOOK ====================

export function useTimeTracking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logTime = useCallback(async (entry: TimeEntry) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.logTime(entry);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTimeEntries = useCallback(async (params: { projectId?: string; taskId?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const entries = await perfexService.getTimeEntries(params);
      return entries;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTimeEntry = useCallback(async (id: string, updates: Partial<TimeEntry>) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.updateTimeEntry(id, updates);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTimeEntry = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.deleteTimeEntry(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectTotalHours = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const total = await perfexService.getProjectTotalHours(projectId);
      return total;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    logTime,
    getTimeEntries,
    updateTimeEntry,
    deleteTimeEntry,
    getProjectTotalHours,
  };
}

// ==================== INVOICE MANAGEMENT HOOK ====================

export function useInvoices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInvoices = useCallback(async (customerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const invoices = await perfexService.getInvoices(customerId ? { customerId } : undefined);
      return invoices;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const invoice = await perfexService.getInvoice(id);
      return invoice;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (invoice: Partial<InvoiceDetails>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.createInvoice(invoice);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, updates: Partial<InvoiceDetails>) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.updateInvoice(id, updates);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.deleteInvoice(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendInvoice = useCallback(async (id: string, email?: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.sendInvoiceToCustomer(id, email);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordPayment = useCallback(async (payment: Payment) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.recordPayment(payment);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    recordPayment,
  };
}

// ==================== MILESTONES HOOK ====================

export function useMilestones() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMilestones = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const milestones = await perfexService.getMilestones(projectId);
      return milestones;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createMilestone = useCallback(async (milestone: ProjectMilestone) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.createMilestone(milestone);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMilestone = useCallback(async (id: string, updates: Partial<ProjectMilestone>) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.updateMilestone(id, updates);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMilestone = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.deleteMilestone(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const markComplete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.markMilestoneComplete(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    markComplete,
  };
}

// ==================== EXPENSES HOOK ====================

export function useExpenses() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getExpenses = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const expenses = await perfexService.getExpenses(projectId);
      return expenses;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = useCallback(async (expense: ProjectExpense) => {
    setLoading(true);
    setError(null);
    try {
      const result = await perfexService.createExpense(expense);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<ProjectExpense>) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.updateExpense(id, updates);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await perfexService.deleteExpense(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}

// ==================== DASHBOARD HOOK ====================

export function useDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await perfexService.getDashboardStats();
      setStats(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecentActivity = useCallback(async (limit: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const activity = await perfexService.getRecentActivity(limit);
      return activity;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    stats,
    loadDashboard,
    getRecentActivity,
  };
}
