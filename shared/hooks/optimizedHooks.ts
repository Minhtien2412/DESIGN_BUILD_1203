/**
 * Optimized Custom Hooks
 * Performance-optimized hooks cho data fetching và caching
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { projectProgressService } from '../../services/projectProgressService';
import { ProgressDashboard, ProjectPayment, ProjectTask, UserRole } from '../../types/projectProgress';
import { useGlobalState } from '../stores/globalStore';

// =================
// CACHE UTILITIES
// =================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class DataCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultExpiry = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: T, expiry?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.expiry;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.expiry;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Global cache instances
const projectCache = new DataCache<any>();
const taskCache = new DataCache<ProjectTask[]>();
const paymentCache = new DataCache<ProjectPayment[]>();
const dashboardCache = new DataCache<ProgressDashboard>();

// =================
// DATA FETCHING HOOKS
// =================

/**
 * Hook cho việc fetch project dashboard với caching
 */
export const useProjectDashboard = (projectId: string, userRole: UserRole) => {
  const [data, setData] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setError: setGlobalError } = useGlobalState();

  const cacheKey = `dashboard_${projectId}_${userRole}`;

  const fetchDashboard = useCallback(async (force = false) => {
    // Check cache first
    if (!force && dashboardCache.has(cacheKey)) {
      const cached = dashboardCache.get(cacheKey);
      if (cached) {
        setData(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await projectProgressService.getProgressDashboard(projectId, userRole);
      
      if (response.success && response.data) {
        setData(response.data);
        dashboardCache.set(cacheKey, response.data);
      } else {
        const errorMsg = 'Failed to load dashboard';
        setError(errorMsg);
        setGlobalError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setGlobalError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [projectId, userRole, cacheKey, setGlobalError]);

  const refresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook cho việc fetch project tasks với filtering
 */
export const useProjectTasks = (projectId: string, filters?: any) => {
  const [data, setData] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTasks, getTasksByProject } = useGlobalState();

  const cacheKey = `tasks_${projectId}_${JSON.stringify(filters || {})}`;

  const fetchTasks = useCallback(async (force = false) => {
    // Check cache first
    if (!force && taskCache.has(cacheKey)) {
      const cached = taskCache.get(cacheKey);
      if (cached) {
        setData(cached);
        setTasks(projectId, cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await projectProgressService.getProjectTasks(projectId, filters);
      
      if (response.success && response.data) {
        setData(response.data);
        setTasks(projectId, response.data);
        taskCache.set(cacheKey, response.data);
      } else {
        setError('Failed to load tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, cacheKey, setTasks]);

  const refresh = useCallback(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  // Get cached data from global state
  const cachedTasks = useMemo(() => {
    return getTasksByProject(projectId);
  }, [getTasksByProject, projectId]);

  useEffect(() => {
    if (cachedTasks.length > 0) {
      setData(cachedTasks);
    } else {
      fetchTasks();
    }
  }, [fetchTasks, cachedTasks]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook cho việc fetch project payments
 */
export const useProjectPayments = (projectId: string) => {
  const [data, setData] = useState<ProjectPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setPayments, getPaymentsByProject } = useGlobalState();

  const cacheKey = `payments_${projectId}`;

  const fetchPayments = useCallback(async (force = false) => {
    // Check cache first
    if (!force && paymentCache.has(cacheKey)) {
      const cached = paymentCache.get(cacheKey);
      if (cached) {
        setData(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await projectProgressService.getPaymentSchedule(projectId);
      
      if (response.success && response.data?.scheduledPayments) {
        const payments = response.data.scheduledPayments;
        setData(payments);
        setPayments(projectId, payments);
        paymentCache.set(cacheKey, payments);
      } else {
        setError('Failed to load payments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId, cacheKey, setPayments]);

  const refresh = useCallback(() => {
    fetchPayments(true);
  }, [fetchPayments]);

  // Get cached data from global state
  const cachedPayments = useMemo(() => {
    return getPaymentsByProject(projectId);
  }, [getPaymentsByProject, projectId]);

  useEffect(() => {
    if (cachedPayments.length > 0) {
      setData(cachedPayments);
    } else {
      fetchPayments();
    }
  }, [fetchPayments, cachedPayments]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

// =================
// MUTATION HOOKS
// =================

/**
 * Hook cho task submission mutations
 */
export const useTaskMutations = () => {
  const [loading, setLoading] = useState(false);
  const { updateTask, addNotification } = useGlobalState();

  const submitProgress = useCallback(async (
    taskId: string,
    submission: any
  ) => {
    setLoading(true);
    try {
      const response = await projectProgressService.submitTaskProgress(taskId, submission);
      
      if (response.success) {
        // Update task in global state
        updateTask(taskId, {
          updatedAt: new Date().toISOString(),
        });

        addNotification({
          type: 'success',
          title: 'Progress Submitted',
          message: 'Task progress has been submitted successfully',
        });

        // Invalidate cache
        taskCache.clear();
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [updateTask, addNotification]);

  const reviewSubmission = useCallback(async (
    submissionId: string,
    review: any
  ) => {
    setLoading(true);
    try {
      const response = await projectProgressService.reviewTaskSubmission(submissionId, review);
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Review Completed',
          message: 'Submission review has been completed',
        });

        // Invalidate cache
        taskCache.clear();
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Review failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Review Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  return {
    submitProgress,
    reviewSubmission,
    loading,
  };
};

/**
 * Hook cho payment mutations
 */
export const usePaymentMutations = () => {
  const [loading, setLoading] = useState(false);
  const { addPayment, updatePayment, addNotification } = useGlobalState();

  const createPayment = useCallback(async (
    projectId: string,
    paymentData: any
  ) => {
    setLoading(true);
    try {
      const response = await projectProgressService.createPayment(paymentData);
      
      if (response.success && response.data) {
        addPayment(projectId, response.data);
        
        addNotification({
          type: 'success',
          title: 'Payment Created',
          message: 'Payment has been created successfully',
        });

        // Invalidate cache
        paymentCache.clear();
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Payment creation failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Payment Creation Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [addPayment, addNotification]);

  const approvePayment = useCallback(async (
    paymentId: string,
    approver: any
  ) => {
    setLoading(true);
    try {
      const response = await projectProgressService.approvePayment(paymentId, approver);
      
      if (response.success) {
        updatePayment(paymentId, {
          approvalStatus: 'admin-approved',
          updatedAt: new Date().toISOString(),
        });

        addNotification({
          type: 'success',
          title: 'Payment Approved',
          message: 'Payment has been approved successfully',
        });

        // Invalidate cache
        paymentCache.clear();
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Payment approval failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [updatePayment, addNotification]);

  const processPayment = useCallback(async (
    paymentId: string,
    paymentDetails: any
  ) => {
    setLoading(true);
    try {
      const response = await projectProgressService.processPayment(paymentId, paymentDetails);
      
      if (response.success) {
        updatePayment(paymentId, {
          status: 'completed',
          completedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        addNotification({
          type: 'success',
          title: 'Payment Processed',
          message: 'Payment has been processed successfully',
        });

        // Invalidate cache
        paymentCache.clear();
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [updatePayment, addNotification]);

  return {
    createPayment,
    approvePayment,
    processPayment,
    loading,
  };
};

// =================
// UTILITY HOOKS
// =================

/**
 * Hook cho debounced values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook cho previous values
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Hook cho intersection observer (for lazy loading)
 */
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isIntersecting;
};

/**
 * Hook cho local storage sync
 */
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      setValue(prevValue => {
        const valueToStore = newValue instanceof Function ? newValue(prevValue) : newValue;
        localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  }, [key]);

  return [value, setStoredValue] as const;
};

/**
 * Hook cho performance monitoring
 */
export const usePerformanceMonitor = (operationName: string) => {
  const startTime = useRef<number | undefined>(undefined);
  
  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`${operationName} took ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  }, [operationName]);

  return { start, end };
};

// =================
// CACHE MANAGEMENT
// =================

/**
 * Hook cho cache management
 */
export const useCacheManager = () => {
  const clearAllCaches = useCallback(() => {
    projectCache.clear();
    taskCache.clear();
    paymentCache.clear();
    dashboardCache.clear();
  }, []);

  const clearProjectCache = useCallback((projectId: string) => {
    // Clear specific project caches
    const keysToRemove: string[] = [];
    
    // This would need proper implementation based on cache structure
    clearAllCaches(); // For now, clear everything
  }, [clearAllCaches]);

  return {
    clearAllCaches,
    clearProjectCache,
  };
};