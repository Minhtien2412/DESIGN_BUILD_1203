/**
 * Simplified State Management
 * Centralized state management without external dependencies
 */

import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { storage } from '../../services/storage';
import { ProjectPayment, ProjectProgress, ProjectTask, UserRole } from '../../types/projectProgress';

// =================
// TYPES
// =================
interface GlobalState {
  // Project state
  currentProjectId: string | null;
  projects: ProjectProgress[];
  
  // Task state
  tasks: ProjectTask[];
  tasksByProject: Record<string, ProjectTask[]>;
  
  // Payment state
  payments: ProjectPayment[];
  paymentsByProject: Record<string, ProjectPayment[]>;
  
  // User state
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    permissions: string[];
  } | null;
  isAuthenticated: boolean;
  
  // UI state
  loading: {
    global: boolean;
    projects: boolean;
    tasks: boolean;
    payments: boolean;
  };
  error: string | null;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
}

type GlobalAction = 
  // Project actions
  | { type: 'SET_CURRENT_PROJECT'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: ProjectProgress[] }
  | { type: 'ADD_PROJECT'; payload: ProjectProgress }
  | { type: 'UPDATE_PROJECT'; payload: { projectId: string; updates: Partial<ProjectProgress> } }
  
  // Task actions
  | { type: 'SET_TASKS'; payload: { projectId: string; tasks: ProjectTask[] } }
  | { type: 'ADD_TASK'; payload: { projectId: string; task: ProjectTask } }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<ProjectTask> } }
  | { type: 'REMOVE_TASK'; payload: string }
  
  // Payment actions
  | { type: 'SET_PAYMENTS'; payload: { projectId: string; payments: ProjectPayment[] } }
  | { type: 'ADD_PAYMENT'; payload: { projectId: string; payment: ProjectPayment } }
  | { type: 'UPDATE_PAYMENT'; payload: { paymentId: string; updates: Partial<ProjectPayment> } }
  | { type: 'REMOVE_PAYMENT'; payload: string }
  
  // User actions
  | { type: 'SET_USER'; payload: GlobalState['currentUser'] }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOGOUT' }
  
  // UI actions
  | { type: 'SET_LOADING'; payload: { key: keyof GlobalState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<GlobalState['notifications'][0], 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

// =================
// INITIAL STATE
// =================
const initialState: GlobalState = {
  // Project state
  currentProjectId: null,
  projects: [],
  
  // Task state
  tasks: [],
  tasksByProject: {},
  
  // Payment state
  payments: [],
  paymentsByProject: {},
  
  // User state
  currentUser: null,
  isAuthenticated: false,
  
  // UI state
  loading: {
    global: false,
    projects: false,
    tasks: false,
    payments: false,
  },
  error: null,
  notifications: [],
};

// =================
// REDUCER
// =================
const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    // Project actions
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProjectId: action.payload };
      
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
      
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
      
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.projectId === action.payload.projectId
            ? { ...project, ...action.payload.updates }
            : project
        )
      };

    // Task actions
    case 'SET_TASKS':
      return {
        ...state,
        tasksByProject: {
          ...state.tasksByProject,
          [action.payload.projectId]: action.payload.tasks
        },
        tasks: [
          ...state.tasks.filter(t => t.projectId !== action.payload.projectId),
          ...action.payload.tasks
        ]
      };
      
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload.task],
        tasksByProject: {
          ...state.tasksByProject,
          [action.payload.projectId]: [
            ...(state.tasksByProject[action.payload.projectId] || []),
            action.payload.task
          ]
        }
      };
      
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, ...action.payload.updates }
            : task
        ),
        tasksByProject: Object.fromEntries(
          Object.entries(state.tasksByProject).map(([projectId, tasks]) => [
            projectId,
            tasks.map(task =>
              task.id === action.payload.taskId
                ? { ...task, ...action.payload.updates }
                : task
            )
          ])
        )
      };
      
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        tasksByProject: Object.fromEntries(
          Object.entries(state.tasksByProject).map(([projectId, tasks]) => [
            projectId,
            tasks.filter(task => task.id !== action.payload)
          ])
        )
      };

    // Payment actions
    case 'SET_PAYMENTS':
      return {
        ...state,
        paymentsByProject: {
          ...state.paymentsByProject,
          [action.payload.projectId]: action.payload.payments
        },
        payments: [
          ...state.payments.filter(p => p.projectId !== action.payload.projectId),
          ...action.payload.payments
        ]
      };
      
    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, action.payload.payment],
        paymentsByProject: {
          ...state.paymentsByProject,
          [action.payload.projectId]: [
            ...(state.paymentsByProject[action.payload.projectId] || []),
            action.payload.payment
          ]
        }
      };
      
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.paymentId
            ? { ...payment, ...action.payload.updates }
            : payment
        ),
        paymentsByProject: Object.fromEntries(
          Object.entries(state.paymentsByProject).map(([projectId, payments]) => [
            projectId,
            payments.map(payment =>
              payment.id === action.payload.paymentId
                ? { ...payment, ...action.payload.updates }
                : payment
            )
          ])
        )
      };
      
    case 'REMOVE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload),
        paymentsByProject: Object.fromEntries(
          Object.entries(state.paymentsByProject).map(([projectId, payments]) => [
            projectId,
            payments.filter(payment => payment.id !== action.payload)
          ])
        )
      };

    // User actions
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: !!action.payload
      };
      
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
      
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false
      };

    // UI actions
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading
        }
      };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [{
          ...action.payload,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
        }, ...state.notifications]
      };
      
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
};

// =================
// CONTEXT
// =================
interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  
  // Convenience methods
  setCurrentProject: (projectId: string | null) => void;
  setProjects: (projects: ProjectProgress[]) => void;
  addProject: (project: ProjectProgress) => void;
  updateProject: (projectId: string, updates: Partial<ProjectProgress>) => void;
  
  setTasks: (projectId: string, tasks: ProjectTask[]) => void;
  addTask: (projectId: string, task: ProjectTask) => void;
  updateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  removeTask: (taskId: string) => void;
  
  setPayments: (projectId: string, payments: ProjectPayment[]) => void;
  addPayment: (projectId: string, payment: ProjectPayment) => void;
  updatePayment: (paymentId: string, updates: Partial<ProjectPayment>) => void;
  removePayment: (paymentId: string) => void;
  
  setUser: (user: GlobalState['currentUser']) => void;
  logout: () => void;
  
  setLoading: (key: keyof GlobalState['loading'], loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<GlobalState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Selectors
  getCurrentProject: () => ProjectProgress | null;
  getTasksByProject: (projectId: string) => ProjectTask[];
  getPaymentsByProject: (projectId: string) => ProjectPayment[];
  hasPermission: (permission: string) => boolean;
  canAccessPayments: () => boolean;
  canApprovePayments: () => boolean;
  canManageTasks: () => boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// =================
// PROVIDER
// =================
interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const savedState = await storage.get('global-state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          // Restore relevant state
          if (parsed.currentUser) {
            dispatch({ type: 'SET_USER', payload: parsed.currentUser });
          }
          if (parsed.currentProjectId) {
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: parsed.currentProjectId });
          }
        }
      } catch (error) {
        console.warn('Failed to load persisted state:', error);
      }
    };

    loadPersistedState();
  }, []);

  // Persist state changes
  useEffect(() => {
    const persistState = async () => {
      try {
        const stateToPersist = {
          currentUser: state.currentUser,
          currentProjectId: state.currentProjectId,
          isAuthenticated: state.isAuthenticated,
        };
        await storage.set('global-state', JSON.stringify(stateToPersist));
      } catch (error) {
        console.warn('Failed to persist state:', error);
      }
    };

    persistState();
  }, [state.currentUser, state.currentProjectId, state.isAuthenticated]);

  // Convenience methods
  const setCurrentProject = (projectId: string | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: projectId });
  };

  const setProjects = (projects: ProjectProgress[]) => {
    dispatch({ type: 'SET_PROJECTS', payload: projects });
  };

  const addProject = (project: ProjectProgress) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  };

  const updateProject = (projectId: string, updates: Partial<ProjectProgress>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { projectId, updates } });
  };

  const setTasks = (projectId: string, tasks: ProjectTask[]) => {
    dispatch({ type: 'SET_TASKS', payload: { projectId, tasks } });
  };

  const addTask = (projectId: string, task: ProjectTask) => {
    dispatch({ type: 'ADD_TASK', payload: { projectId, task } });
  };

  const updateTask = (taskId: string, updates: Partial<ProjectTask>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
  };

  const removeTask = (taskId: string) => {
    dispatch({ type: 'REMOVE_TASK', payload: taskId });
  };

  const setPayments = (projectId: string, payments: ProjectPayment[]) => {
    dispatch({ type: 'SET_PAYMENTS', payload: { projectId, payments } });
  };

  const addPayment = (projectId: string, payment: ProjectPayment) => {
    dispatch({ type: 'ADD_PAYMENT', payload: { projectId, payment } });
  };

  const updatePayment = (paymentId: string, updates: Partial<ProjectPayment>) => {
    dispatch({ type: 'UPDATE_PAYMENT', payload: { paymentId, updates } });
  };

  const removePayment = (paymentId: string) => {
    dispatch({ type: 'REMOVE_PAYMENT', payload: paymentId });
  };

  const setUser = (user: GlobalState['currentUser']) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const setLoading = (key: keyof GlobalState['loading'], loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, loading } });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const addNotification = (notification: Omit<GlobalState['notifications'][0], 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  // Selectors
  const getCurrentProject = (): ProjectProgress | null => {
    return state.projects.find(p => p.projectId === state.currentProjectId) || null;
  };

  const getTasksByProject = (projectId: string): ProjectTask[] => {
    return state.tasksByProject[projectId] || [];
  };

  const getPaymentsByProject = (projectId: string): ProjectPayment[] => {
    return state.paymentsByProject[projectId] || [];
  };

  const hasPermission = (permission: string): boolean => {
    return state.currentUser?.permissions.includes(permission) || false;
  };

  const canAccessPayments = (): boolean => {
    return state.currentUser?.role === 'admin' || state.currentUser?.role === 'manager' || false;
  };

  const canApprovePayments = (): boolean => {
    return state.currentUser?.role === 'admin' || state.currentUser?.role === 'manager' || false;
  };

  const canManageTasks = (): boolean => {
    return state.currentUser?.role === 'admin' || 
           state.currentUser?.role === 'manager' || 
           state.currentUser?.role === 'supervisor' || false;
  };

  const value: GlobalContextType = {
    state,
    dispatch,
    
    // Convenience methods
    setCurrentProject,
    setProjects,
    addProject,
    updateProject,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setPayments,
    addPayment,
    updatePayment,
    removePayment,
    setUser,
    logout,
    setLoading,
    setError,
    addNotification,
    markNotificationRead,
    clearNotifications,
    
    // Selectors
    getCurrentProject,
    getTasksByProject,
    getPaymentsByProject,
    hasPermission,
    canAccessPayments,
    canApprovePayments,
    canManageTasks,
  };

  return React.createElement(
    GlobalContext.Provider,
    { value },
    children
  );
};

// =================
// HOOKS
// =================
export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
};

// Specific hooks for convenience
export const useCurrentProject = () => {
  const { getCurrentProject } = useGlobalState();
  return getCurrentProject();
};

export const useProjectTasks = (projectId: string) => {
  const { getTasksByProject } = useGlobalState();
  return getTasksByProject(projectId);
};

export const useProjectPayments = (projectId: string) => {
  const { getPaymentsByProject } = useGlobalState();
  return getPaymentsByProject(projectId);
};

export const useUserPermissions = () => {
  const { hasPermission, canAccessPayments, canApprovePayments, canManageTasks } = useGlobalState();
  return {
    hasPermission,
    canAccessPayments,
    canApprovePayments,
    canManageTasks,
  };
};

export const useCurrentUser = () => {
  const { state } = useGlobalState();
  return state.currentUser;
};

export const useNotifications = () => {
  const { state, addNotification, markNotificationRead, clearNotifications } = useGlobalState();
  return {
    notifications: state.notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
  };
};

export const useLoadingState = () => {
  const { state, setLoading } = useGlobalState();
  return {
    loading: state.loading,
    setLoading,
  };
};
