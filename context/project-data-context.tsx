import { BudgetCategory, CostItem } from '@/components/ui/cost-tracker';
import { Task } from '@/components/ui/task-management';
import { PROJECT_BUDGETS } from '@/data/project-budgets';
import { PROJECT_TASKS } from '@/data/project-tasks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Storage keys
const STORAGE_KEY_BUDGETS = '@project_budgets';
const STORAGE_KEY_TASKS = '@project_tasks';

// Project budget structure
export interface ProjectBudget {
  projectId: string;
  totalBudget: number;
  totalSpent: number;
  categories: BudgetCategory[];
  recentTransactions: CostItem[];
}

// Context state
interface ProjectDataState {
  budgets: Record<string, ProjectBudget>;
  tasks: Record<string, Task[]>;
  loading: boolean;
}

// Context actions
interface ProjectDataActions {
  // Budget operations
  addExpense: (projectId: string, expense: CostItem) => Promise<void>;
  updateExpense: (projectId: string, expenseId: string, updates: Partial<CostItem>) => Promise<void>;
  deleteExpense: (projectId: string, expenseId: string) => Promise<void>;
  
  // Task operations
  addTask: (projectId: string, task: Task) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  toggleTaskStatus: (projectId: string, taskId: string) => Promise<void>;
  
  // Utility
  refreshData: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

type ProjectDataContextType = ProjectDataState & ProjectDataActions;

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

export function ProjectDataProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Record<string, ProjectBudget>>({});
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load from storage
      const [storedBudgets, storedTasks] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_BUDGETS),
        AsyncStorage.getItem(STORAGE_KEY_TASKS),
      ]);

      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      } else {
        // Initialize with default data
        setBudgets(PROJECT_BUDGETS);
        await AsyncStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(PROJECT_BUDGETS));
      }

      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        // Initialize with default data - convert PROJECT_TASKS format
        const initialTasks: Record<string, Task[]> = {};
        Object.keys(PROJECT_TASKS).forEach(key => {
          initialTasks[key] = PROJECT_TASKS[key].tasks;
        });
        setTasks(initialTasks);
        await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(initialTasks));
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
      // Fallback to default data
      setBudgets(PROJECT_BUDGETS);
      const fallbackTasks: Record<string, Task[]> = {};
      Object.keys(PROJECT_TASKS).forEach(key => {
        fallbackTasks[key] = PROJECT_TASKS[key].tasks;
      });
      setTasks(fallbackTasks);
    } finally {
      setLoading(false);
    }
  };

  const saveBudgets = async (newBudgets: Record<string, ProjectBudget>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(newBudgets));
      setBudgets(newBudgets);
    } catch (error) {
      console.error('Failed to save budgets:', error);
      throw error;
    }
  };

  const saveTasks = async (newTasks: Record<string, Task[]>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
      throw error;
    }
  };

  // Budget operations
  const addExpense = async (projectId: string, expense: CostItem) => {
    const budget = budgets[projectId];
    if (!budget) {
      throw new Error(`Budget not found for project ${projectId}`);
    }

    // Add expense to transactions
    const updatedTransactions = [expense, ...budget.recentTransactions];

    // Update category spending
    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === expense.category) {
        const newSpent = expense.type === 'expense' 
          ? cat.spent + expense.amount 
          : cat.spent - expense.amount;
        return { ...cat, spent: newSpent };
      }
      return cat;
    });

    // Update total spent
    const totalChange = expense.type === 'expense' ? expense.amount : -expense.amount;
    const updatedBudget: ProjectBudget = {
      ...budget,
      totalSpent: budget.totalSpent + totalChange,
      categories: updatedCategories,
      recentTransactions: updatedTransactions,
    };

    const newBudgets = { ...budgets, [projectId]: updatedBudget };
    await saveBudgets(newBudgets);
  };

  const updateExpense = async (projectId: string, expenseId: string, updates: Partial<CostItem>) => {
    const budget = budgets[projectId];
    if (!budget) return;

    const updatedTransactions = budget.recentTransactions.map((t) =>
      t.id === expenseId ? { ...t, ...updates } : t
    );

    const updatedBudget = { ...budget, recentTransactions: updatedTransactions };
    const newBudgets = { ...budgets, [projectId]: updatedBudget };
    await saveBudgets(newBudgets);
  };

  const deleteExpense = async (projectId: string, expenseId: string) => {
    const budget = budgets[projectId];
    if (!budget) return;

    const expense = budget.recentTransactions.find((t) => t.id === expenseId);
    if (!expense) return;

    // Remove from transactions
    const updatedTransactions = budget.recentTransactions.filter((t) => t.id !== expenseId);

    // Update category spending
    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === expense.category) {
        const newSpent = expense.type === 'expense'
          ? cat.spent - expense.amount
          : cat.spent + expense.amount;
        return { ...cat, spent: newSpent };
      }
      return cat;
    });

    // Update total spent
    const totalChange = expense.type === 'expense' ? -expense.amount : expense.amount;
    const updatedBudget: ProjectBudget = {
      ...budget,
      totalSpent: budget.totalSpent + totalChange,
      categories: updatedCategories,
      recentTransactions: updatedTransactions,
    };

    const newBudgets = { ...budgets, [projectId]: updatedBudget };
    await saveBudgets(newBudgets);
  };

  // Task operations
  const addTask = async (projectId: string, task: Task) => {
    const projectTasks = tasks[projectId] || [];
    const updatedTasks = [task, ...projectTasks];
    const newTasks = { ...tasks, [projectId]: updatedTasks };
    await saveTasks(newTasks);
  };

  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    const projectTasks = tasks[projectId];
    if (!projectTasks) return;

    const updatedTasks = projectTasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t
    );
    const newTasks = { ...tasks, [projectId]: updatedTasks };
    await saveTasks(newTasks);
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    const projectTasks = tasks[projectId];
    if (!projectTasks) return;

    const updatedTasks = projectTasks.filter((t) => t.id !== taskId);
    const newTasks = { ...tasks, [projectId]: updatedTasks };
    await saveTasks(newTasks);
  };

  const toggleTaskStatus = async (projectId: string, taskId: string) => {
    const projectTasks = tasks[projectId];
    if (!projectTasks) return;

    const updatedTasks = projectTasks.map((t) => {
      if (t.id === taskId) {
        const newStatus: Task['status'] = t.status === 'completed' ? 'todo' : 'completed';
        return { ...t, status: newStatus };
      }
      return t;
    });
    const newTasks = { ...tasks, [projectId]: updatedTasks };
    await saveTasks(newTasks);
  };

  const refreshData = async () => {
    await loadData();
  };

  const resetToDefaults = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_BUDGETS, STORAGE_KEY_TASKS]);
      setBudgets(PROJECT_BUDGETS);
      
      // Convert PROJECT_TASKS format
      const initialTasks: Record<string, Task[]> = {};
      Object.keys(PROJECT_TASKS).forEach(key => {
        initialTasks[key] = PROJECT_TASKS[key].tasks;
      });
      setTasks(initialTasks);
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(PROJECT_BUDGETS)),
        AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(initialTasks)),
      ]);
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  const value: ProjectDataContextType = {
    budgets,
    tasks,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    refreshData,
    resetToDefaults,
  };

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error('useProjectData must be used within a ProjectDataProvider');
  }
  return context;
}

// Helper hook to get data for a specific project
export function useProjectBudget(projectId: string) {
  const { budgets } = useProjectData();
  return budgets[projectId];
}

export function useProjectTasks(projectId: string) {
  const { tasks } = useProjectData();
  return tasks[projectId] || [];
}
