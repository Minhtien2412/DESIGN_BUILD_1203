/**
 * Lazy Loader Service
 * ====================
 *
 * Quản lý việc tải data theo thứ tự ưu tiên:
 * 1. Critical: Auth, user profile
 * 2. Essential: Home data, navigation data
 * 3. Background: Notifications, badges
 * 4. Deferred: Analytics, prefetch
 *
 * Tránh overload khi app khởi động
 *
 * @author ThietKeResort Team
 * @created 2026-01-29
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type LoadPriority = "critical" | "essential" | "background" | "deferred";

export interface LazyTask<T = unknown> {
  id: string;
  priority: LoadPriority;
  load: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  timeout?: number;
  retryCount?: number;
}

export interface TaskResult<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRIORITY_DELAYS: Record<LoadPriority, number> = {
  critical: 0,
  essential: 100,
  background: 500,
  deferred: 2000,
};

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRY = 1;

// ============================================================================
// LAZY LOADER CLASS
// ============================================================================

class LazyLoaderService {
  private static instance: LazyLoaderService;
  private tasks: Map<string, LazyTask> = new Map();
  private results: Map<string, TaskResult> = new Map();
  private isLoading = false;
  private completedPriorities: Set<LoadPriority> = new Set();

  private constructor() {}

  static getInstance(): LazyLoaderService {
    if (!LazyLoaderService.instance) {
      LazyLoaderService.instance = new LazyLoaderService();
    }
    return LazyLoaderService.instance;
  }

  /**
   * Register a task
   */
  register<T>(task: LazyTask<T>): void {
    this.tasks.set(task.id, task as LazyTask<unknown>);
  }

  /**
   * Unregister a task
   */
  unregister(id: string): void {
    this.tasks.delete(id);
    this.results.delete(id);
  }

  /**
   * Load all tasks by priority
   */
  async loadAll(): Promise<Map<string, TaskResult>> {
    if (this.isLoading) {
      console.log("[LazyLoader] Already loading, skipping...");
      return this.results;
    }

    this.isLoading = true;
    this.completedPriorities.clear();

    const priorities: LoadPriority[] = [
      "critical",
      "essential",
      "background",
      "deferred",
    ];

    for (const priority of priorities) {
      await this.loadPriority(priority);
      this.completedPriorities.add(priority);
    }

    this.isLoading = false;
    return this.results;
  }

  /**
   * Load only up to a certain priority
   */
  async loadUpTo(maxPriority: LoadPriority): Promise<Map<string, TaskResult>> {
    const priorities: LoadPriority[] = [
      "critical",
      "essential",
      "background",
      "deferred",
    ];
    const maxIndex = priorities.indexOf(maxPriority);

    for (let i = 0; i <= maxIndex; i++) {
      if (!this.completedPriorities.has(priorities[i])) {
        await this.loadPriority(priorities[i]);
        this.completedPriorities.add(priorities[i]);
      }
    }

    return this.results;
  }

  /**
   * Load a single task immediately
   */
  async loadTask<T>(id: string): Promise<TaskResult<T> | null> {
    const task = this.tasks.get(id) as LazyTask<T> | undefined;
    if (!task) {
      console.warn(`[LazyLoader] Task ${id} not found`);
      return null;
    }

    return this.executeTask(task);
  }

  /**
   * Get result for a task
   */
  getResult<T>(id: string): TaskResult<T> | null {
    return (this.results.get(id) as TaskResult<T>) || null;
  }

  /**
   * Check if priority is completed
   */
  isPriorityComplete(priority: LoadPriority): boolean {
    return this.completedPriorities.has(priority);
  }

  /**
   * Reset all results
   */
  reset(): void {
    this.results.clear();
    this.completedPriorities.clear();
    this.isLoading = false;
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private async loadPriority(priority: LoadPriority): Promise<void> {
    const tasks = Array.from(this.tasks.values()).filter(
      (t) => t.priority === priority,
    );

    if (tasks.length === 0) return;

    console.log(`[LazyLoader] Loading ${tasks.length} ${priority} tasks...`);

    // Add delay based on priority
    await this.delay(PRIORITY_DELAYS[priority]);

    // For critical/essential, load sequentially
    // For background/deferred, load in parallel (limited)
    if (priority === "critical" || priority === "essential") {
      for (const task of tasks) {
        await this.executeTask(task);
      }
    } else {
      // Load in parallel with limit of 3
      const chunks = this.chunkArray(tasks, 3);
      for (const chunk of chunks) {
        await Promise.allSettled(chunk.map((t) => this.executeTask(t)));
      }
    }
  }

  private async executeTask<T>(task: LazyTask<T>): Promise<TaskResult<T>> {
    const startTime = Date.now();
    const timeout = task.timeout || DEFAULT_TIMEOUT;
    const retryCount = task.retryCount ?? DEFAULT_RETRY;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const data = await Promise.race([
          task.load(),
          this.timeoutPromise<T>(timeout, task.id),
        ]);

        const result: TaskResult<T> = {
          id: task.id,
          success: true,
          data,
          duration: Date.now() - startTime,
        };

        this.results.set(task.id, result as TaskResult<unknown>);
        task.onSuccess?.(data);

        console.log(`[LazyLoader] ✓ ${task.id} loaded in ${result.duration}ms`);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[LazyLoader] ${task.id} failed (attempt ${attempt + 1}/${retryCount + 1}):`,
          (error as Error).message,
        );

        if (attempt < retryCount) {
          await this.delay(500 * (attempt + 1));
        }
      }
    }

    const result: TaskResult<T> = {
      id: task.id,
      success: false,
      error: lastError,
      duration: Date.now() - startTime,
    };

    this.results.set(task.id, result as TaskResult<unknown>);
    task.onError?.(lastError!);

    console.log(`[LazyLoader] ✗ ${task.id} failed after ${result.duration}ms`);
    return result;
  }

  private timeoutPromise<T>(ms: number, taskId: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Task ${taskId} timed out after ${ms}ms`)),
        ms,
      );
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const lazyLoader = LazyLoaderService.getInstance();

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook to use lazy loading in components
 */
export function useLazyLoad<T>(
  taskId: string,
  loader: () => Promise<T>,
  options: {
    priority?: LoadPriority;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {},
): {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
  reload: () => Promise<void>;
} {
  const {
    priority = "essential",
    enabled = true,
    onSuccess,
    onError,
  } = options;
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await loader();
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
        onError?.(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, loader, onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;

    // Register with lazy loader
    lazyLoader.register({
      id: taskId,
      priority,
      load: async () => {
        const result = await loader();
        if (mountedRef.current) {
          setData(result);
        }
        return result;
      },
      onSuccess: (result) => {
        if (mountedRef.current) {
          setData(result as T);
          setIsLoading(false);
          onSuccess?.(result as T);
        }
      },
      onError: (err) => {
        if (mountedRef.current) {
          setError(err);
          setIsLoading(false);
          onError?.(err);
        }
      },
    });

    // Check if already loaded
    const existing = lazyLoader.getResult<T>(taskId);
    if (existing?.success && existing.data !== undefined) {
      setData(existing.data);
    } else if (enabled) {
      setIsLoading(true);
    }

    return () => {
      mountedRef.current = false;
      lazyLoader.unregister(taskId);
    };
  }, [taskId, priority, enabled]);

  return {
    data,
    isLoading,
    error,
    reload: load,
  };
}

/**
 * Hook to wait for a priority level to complete
 */
export function useWaitForPriority(
  priority: LoadPriority,
  onComplete?: () => void,
): boolean {
  const [isComplete, setIsComplete] = useState(() =>
    lazyLoader.isPriorityComplete(priority),
  );

  useEffect(() => {
    if (isComplete) {
      onComplete?.();
      return;
    }

    const checkInterval = setInterval(() => {
      if (lazyLoader.isPriorityComplete(priority)) {
        setIsComplete(true);
        onComplete?.();
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [priority, isComplete, onComplete]);

  return isComplete;
}

export default LazyLoaderService;
