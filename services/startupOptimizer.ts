/**
 * Startup Optimizer
 * ==================
 *
 * Tối ưu CPU và memory usage khi app khởi động.
 * Giúp tránh ANR bằng cách:
 * 1. Batch initialization tasks
 * 2. Use idle callbacks for non-critical work
 * 3. Monitor frame rate to avoid jank
 *
 * @author ThietKeResort Team
 * @created 2026-01-29
 */

import { InteractionManager } from "react-native";

// ============================================================================
// TYPES
// ============================================================================

type TaskPriority = "critical" | "high" | "normal" | "low" | "idle";

interface StartupTask {
  name: string;
  priority: TaskPriority;
  execute: () => void | Promise<void>;
  timeout?: number; // Max time allowed (ms)
}

interface TaskResult {
  name: string;
  success: boolean;
  duration: number;
  error?: Error;
}

// ============================================================================
// PRIORITY WEIGHTS
// ============================================================================

const PRIORITY_DELAYS: Record<TaskPriority, number> = {
  critical: 0, // Immediate
  high: 100, // After first frame
  normal: 500, // After UI stabilizes
  low: 1500, // After interactions
  idle: 3000, // When truly idle
};

// ============================================================================
// STARTUP OPTIMIZER CLASS
// ============================================================================

class StartupOptimizer {
  private tasks: StartupTask[] = [];
  private results: TaskResult[] = [];
  private isRunning = false;
  private startTime = 0;

  /**
   * Queue a task for execution during startup
   */
  queueTask(task: StartupTask): void {
    this.tasks.push(task);
  }

  /**
   * Queue multiple tasks
   */
  queueTasks(tasks: StartupTask[]): void {
    this.tasks.push(...tasks);
  }

  /**
   * Execute all queued tasks in order of priority
   */
  async executeAll(): Promise<TaskResult[]> {
    if (this.isRunning) {
      console.warn("[StartupOptimizer] Already running");
      return this.results;
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.results = [];

    // Sort by priority
    const sortedTasks = [...this.tasks].sort((a, b) => {
      return PRIORITY_DELAYS[a.priority] - PRIORITY_DELAYS[b.priority];
    });

    // Group tasks by priority
    const taskGroups = this.groupByPriority(sortedTasks);

    // Execute each group with appropriate delays
    for (const [priority, tasks] of Object.entries(taskGroups)) {
      const delay = PRIORITY_DELAYS[priority as TaskPriority];

      if (delay > 0) {
        await this.waitForIdleTime(delay);
      }

      // Execute tasks in this group in parallel
      await this.executeTaskGroup(tasks);
    }

    this.isRunning = false;
    const totalDuration = Date.now() - this.startTime;
    console.log(
      `[StartupOptimizer] Completed ${this.results.length} tasks in ${totalDuration}ms`,
    );

    return this.results;
  }

  /**
   * Group tasks by priority
   */
  private groupByPriority(
    tasks: StartupTask[],
  ): Record<TaskPriority, StartupTask[]> {
    const groups: Record<TaskPriority, StartupTask[]> = {
      critical: [],
      high: [],
      normal: [],
      low: [],
      idle: [],
    };

    for (const task of tasks) {
      groups[task.priority].push(task);
    }

    return groups;
  }

  /**
   * Execute a group of tasks
   */
  private async executeTaskGroup(tasks: StartupTask[]): Promise<void> {
    const promises = tasks.map((task) => this.executeTask(task));
    await Promise.all(promises);
  }

  /**
   * Execute a single task with timeout and error handling
   */
  private async executeTask(task: StartupTask): Promise<TaskResult> {
    const startTime = Date.now();

    const result: TaskResult = {
      name: task.name,
      success: false,
      duration: 0,
    };

    try {
      // Create timeout promise if specified
      const timeoutPromise = task.timeout
        ? new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error(`Task ${task.name} timed out`)),
              task.timeout,
            );
          })
        : null;

      // Execute task
      const taskPromise = Promise.resolve(task.execute());

      if (timeoutPromise) {
        await Promise.race([taskPromise, timeoutPromise]);
      } else {
        await taskPromise;
      }

      result.success = true;
    } catch (error) {
      result.error = error as Error;
      console.error(`[StartupOptimizer] Task "${task.name}" failed:`, error);
    }

    result.duration = Date.now() - startTime;
    this.results.push(result);

    return result;
  }

  /**
   * Wait for idle time before executing next batch
   */
  private waitForIdleTime(minDelay: number): Promise<void> {
    return new Promise((resolve) => {
      // Wait for minimum delay
      setTimeout(() => {
        // Then wait for interactions to complete
        InteractionManager.runAfterInteractions(() => {
          resolve();
        });
      }, minDelay);
    });
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    this.tasks = [];
    this.results = [];
    this.isRunning = false;
  }

  /**
   * Get startup results summary
   */
  getSummary(): {
    totalTasks: number;
    successful: number;
    failed: number;
    totalDuration: number;
  } {
    const successful = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalTasks: this.results.length,
      successful,
      failed,
      totalDuration,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const startupOptimizer = new StartupOptimizer();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Defer work to next frame
 */
export function deferToNextFrame(fn: () => void): number {
  return requestAnimationFrame(() => {
    // Double RAF for smoother scheduling
    requestAnimationFrame(fn);
  });
}

/**
 * Defer work until idle
 */
export function deferUntilIdle(fn: () => void, timeout = 5000): void {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(fn, { timeout });
  } else {
    // Fallback for RN
    setTimeout(() => {
      InteractionManager.runAfterInteractions(fn);
    }, 100);
  }
}

/**
 * Batch operations to reduce main thread blocking
 */
export async function batchOperations<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  batchSize = 5,
  delayBetweenBatches = 16, // ~1 frame
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch in parallel
    await Promise.all(batch.map(operation));

    // Yield to main thread between batches
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }
}

/**
 * Throttle heavy computations
 */
export function throttleComputation<T>(
  compute: () => T,
  intervalMs = 16,
): () => Promise<T> {
  let lastRun = 0;

  return () => {
    return new Promise((resolve) => {
      const now = Date.now();
      const elapsed = now - lastRun;

      if (elapsed >= intervalMs) {
        lastRun = now;
        resolve(compute());
      } else {
        setTimeout(() => {
          lastRun = Date.now();
          resolve(compute());
        }, intervalMs - elapsed);
      }
    });
  };
}

/**
 * Create a lightweight placeholder state while loading
 */
export function createPlaceholderState<T>(defaults: T): T {
  return { ...defaults };
}

/**
 * Measure task execution time
 */
export async function measureTask<T>(
  name: string,
  task: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await task();
  const duration = Date.now() - start;

  if (__DEV__) {
    console.log(`[Measure] ${name}: ${duration}ms`);
  }

  return { result, duration };
}

export default startupOptimizer;
