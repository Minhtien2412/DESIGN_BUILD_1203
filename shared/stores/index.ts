// @ts-nocheck
/**
 * Global State Management Store
 * Centralized state with Zustand
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ProjectPayment, ProjectProgress, ProjectTask, UserRole } from '../../types/projectProgress';

// =================
// PROJECT STORE
// =================
interface ProjectState {
  // State
  currentProjectId: string | null;
  projects: ProjectProgress[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentProject: (projectId: string) => void;
  setProjects: (projects: ProjectProgress[]) => void;
  addProject: (project: ProjectProgress) => void;
  updateProject: (projectId: string, updates: Partial<ProjectProgress>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentProjectId: null,
      projects: [],
      loading: false,
      error: null,

      // Actions
      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),
      
      setProjects: (projects) => set({ projects }),
      
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      
      updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map(project => 
          project.projectId === projectId 
            ? { ...project, ...updates }
            : project
        )
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'project-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        projects: state.projects,
      }),
    }
  )
);

// =================
// TASK STORE
// =================
interface TaskState {
  // State
  tasks: ProjectTask[];
  tasksByProject: Record<string, ProjectTask[]>;
  loading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (projectId: string, tasks: ProjectTask[]) => void;
  addTask: (projectId: string, task: ProjectTask) => void;
  updateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  removeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selectors
  getTasksByProject: (projectId: string) => ProjectTask[];
  getTask: (taskId: string) => ProjectTask | undefined;
  getTasksByAssignee: (assigneeId: string) => ProjectTask[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      tasksByProject: {},
      loading: false,
      error: null,

      // Actions
      setTasks: (projectId, tasks) => set((state) => ({
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: tasks
        },
        tasks: [...state.tasks.filter(t => t.projectId !== projectId), ...tasks]
      })),
      
      addTask: (projectId, task) => set((state) => ({
        tasks: [...state.tasks, task],
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: [...(state.tasksByProject[projectId] || []), task]
        }
      })),
      
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
        tasksByProject: Object.fromEntries(
          Object.entries(state.tasksByProject).map(([projectId, tasks]) => [
            projectId,
            tasks.map(task => task.id === taskId ? { ...task, ...updates } : task)
          ])
        )
      })),
      
      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        tasksByProject: Object.fromEntries(
          Object.entries(state.tasksByProject).map(([projectId, tasks]) => [
            projectId,
            tasks.filter(task => task.id !== taskId)
          ])
        )
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Selectors
      getTasksByProject: (projectId) => get().tasksByProject[projectId] || [],
      getTask: (taskId) => get().tasks.find(task => task.id === taskId),
      getTasksByAssignee: (assigneeId) => get().tasks.filter(task => task.assignedTo.id === assigneeId),
    }),
    {
      name: 'task-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        tasksByProject: state.tasksByProject,
      }),
    }
  )
);

// =================
// PAYMENT STORE
// =================
interface PaymentState {
  // State
  payments: ProjectPayment[];
  paymentsByProject: Record<string, ProjectPayment[]>;
  loading: boolean;
  error: string | null;
  
  // Actions
  setPayments: (projectId: string, payments: ProjectPayment[]) => void;
  addPayment: (projectId: string, payment: ProjectPayment) => void;
  updatePayment: (paymentId: string, updates: Partial<ProjectPayment>) => void;
  removePayment: (paymentId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selectors
  getPaymentsByProject: (projectId: string) => ProjectPayment[];
  getPayment: (paymentId: string) => ProjectPayment | undefined;
  getPendingPayments: (projectId: string) => ProjectPayment[];
  getOverduePayments: (projectId: string) => ProjectPayment[];
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      // Initial State
      payments: [],
      paymentsByProject: {},
      loading: false,
      error: null,

      // Actions
      setPayments: (projectId, payments) => set((state) => ({
        paymentsByProject: {
          ...state.paymentsByProject,
          [projectId]: payments
        },
        payments: [...state.payments.filter(p => p.projectId !== projectId), ...payments]
      })),
      
      addPayment: (projectId, payment) => set((state) => ({
        payments: [...state.payments, payment],
        paymentsByProject: {
          ...state.paymentsByProject,
          [projectId]: [...(state.paymentsByProject[projectId] || []), payment]
        }
      })),
      
      updatePayment: (paymentId, updates) => set((state) => ({
        payments: state.payments.map(payment => 
          payment.id === paymentId ? { ...payment, ...updates } : payment
        ),
        paymentsByProject: Object.fromEntries(
          Object.entries(state.paymentsByProject).map(([projectId, payments]) => [
            projectId,
            payments.map(payment => payment.id === paymentId ? { ...payment, ...updates } : payment)
          ])
        )
      })),
      
      removePayment: (paymentId) => set((state) => ({
        payments: state.payments.filter(payment => payment.id !== paymentId),
        paymentsByProject: Object.fromEntries(
          Object.entries(state.paymentsByProject).map(([projectId, payments]) => [
            projectId,
            payments.filter(payment => payment.id !== paymentId)
          ])
        )
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Selectors
      getPaymentsByProject: (projectId) => get().paymentsByProject[projectId] || [],
      getPayment: (paymentId) => get().payments.find(payment => payment.id === paymentId),
      getPendingPayments: (projectId) => {
        const payments = get().paymentsByProject[projectId] || [];
        return payments.filter(payment => payment.status === 'pending');
      },
      getOverduePayments: (projectId) => {
        const payments = get().paymentsByProject[projectId] || [];
        const now = new Date();
        return payments.filter(payment => 
          payment.status === 'pending' && new Date(payment.dueDate) < now
        );
      },
    }),
    {
      name: 'payment-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        payments: state.payments,
        paymentsByProject: state.paymentsByProject,
      }),
    }
  )
);

// =================
// USER STORE
// =================
interface UserState {
  // State
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    permissions: string[];
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: UserState['currentUser']) => void;
  setAuthenticated: (authenticated: boolean) => void;
  updatePermissions: (permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // Selectors
  hasPermission: (permission: string) => boolean;
  canAccessPayments: () => boolean;
  canApprovePayments: () => boolean;
  canManageTasks: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentUser: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      setUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      updatePermissions: (permissions) => set((state) => ({
        currentUser: state.currentUser ? {
          ...state.currentUser,
          permissions
        } : null
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),

      // Selectors
      hasPermission: (permission) => {
        const user = get().currentUser;
        return user?.permissions.includes(permission) || false;
      },
      canAccessPayments: () => {
        const user = get().currentUser;
        return user?.role === 'admin' || user?.role === 'manager' || false;
      },
      canApprovePayments: () => {
        const user = get().currentUser;
        return user?.role === 'admin' || user?.role === 'manager' || false;
      },
      canManageTasks: () => {
        const user = get().currentUser;
        return user?.role === 'admin' || user?.role === 'manager' || user?.role === 'supervisor' || false;
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// =================
// UI STORE
// =================
interface UIState {
  // State
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  loading: {
    global: boolean;
    projects: boolean;
    tasks: boolean;
    payments: boolean;
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial State
      theme: 'light',
      sidebarCollapsed: false,
      notifications: [],
      loading: {
        global: false,
        projects: false,
        tasks: false,
        payments: false,
      },

      // Actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [{
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
        }, ...state.notifications]
      })),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      setLoading: (key, loading) => set((state) => ({
        loading: { ...state.loading, [key]: loading }
      })),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// =================
// STORE HOOKS
// =================

// Combined hooks for convenience
export const useCurrentProject = () => {
  const currentProjectId = useProjectStore(state => state.currentProjectId);
  const projects = useProjectStore(state => state.projects);
  return projects.find(p => p.projectId === currentProjectId) || null;
};

export const useProjectTasks = (projectId: string) => {
  return useTaskStore(state => state.getTasksByProject(projectId));
};

export const useProjectPayments = (projectId: string) => {
  return usePaymentStore(state => state.getPaymentsByProject(projectId));
};

export const useUserPermissions = () => {
  const hasPermission = useUserStore(state => state.hasPermission);
  const canAccessPayments = useUserStore(state => state.canAccessPayments);
  const canApprovePayments = useUserStore(state => state.canApprovePayments);
  const canManageTasks = useUserStore(state => state.canManageTasks);
  
  return {
    hasPermission,
    canAccessPayments,
    canApprovePayments,
    canManageTasks,
  };
};

// Store subscriptions
export const useStoreSubscription = () => {
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const paymentStore = usePaymentStore();
  const userStore = useUserStore();
  const uiStore = useUIStore();
  
  return {
    project: projectStore,
    task: taskStore,
    payment: paymentStore,
    user: userStore,
    ui: uiStore,
  };
};