/**
 * App Initializer Service
 * ========================
 *
 * Quản lý việc khởi tạo app một cách có trật tự để tránh:
 * 1. Quá nhiều request đồng thời gây đơ app
 * 2. WebSocket connection với expired token
 * 3. Cascading errors gây crash app
 *
 * Chiến lược:
 * - Priority-based initialization (critical services first)
 * - Lazy loading for non-essential features
 * - Error isolation (một service fail không ảnh hưởng service khác)
 * - Token validation trước khi connect WebSocket
 *
 * @author ThietKeResort Team
 * @created 2026-01-29
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessToken, doRefreshToken as refreshToken } from "./apiClient";

// ============================================================================
// TYPES
// ============================================================================

export type InitPhase = "auth" | "essential" | "background" | "optional";

export interface InitTask {
  name: string;
  phase: InitPhase;
  priority: number; // Lower = higher priority
  execute: () => Promise<void>;
  timeout?: number; // ms
  retryCount?: number;
  critical?: boolean; // If true, failure stops init
}

export interface InitResult {
  success: boolean;
  phase: InitPhase;
  taskName: string;
  duration: number;
  error?: Error;
}

export type InitProgressCallback = (
  phase: InitPhase,
  progress: number,
  taskName: string,
) => void;

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TIMEOUT = 10000; // 10s
const DEFAULT_RETRY_COUNT = 2;
const MAX_CONCURRENT_TASKS = 3;
const INIT_STATE_KEY = "@app_init_state";

// ============================================================================
// APP INITIALIZER SERVICE
// ============================================================================

class AppInitializerService {
  private static instance: AppInitializerService;
  private tasks: Map<string, InitTask> = new Map();
  private results: InitResult[] = [];
  private isInitializing = false;
  private currentPhase: InitPhase | null = null;
  private progressCallback: InitProgressCallback | null = null;
  private abortController: AbortController | null = null;

  private constructor() {}

  static getInstance(): AppInitializerService {
    if (!AppInitializerService.instance) {
      AppInitializerService.instance = new AppInitializerService();
    }
    return AppInitializerService.instance;
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  /**
   * Register a task to be executed during initialization
   */
  registerTask(task: InitTask): void {
    this.tasks.set(task.name, task);
  }

  /**
   * Set progress callback
   */
  onProgress(callback: InitProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * Check if token is valid before WebSocket connections
   */
  async ensureValidToken(): Promise<boolean> {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.log("[AppInit] No token available");
        return false;
      }

      // Check if token is expired (decode JWT without verification)
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to ms
      const now = Date.now();
      const buffer = 60000; // 1 minute buffer

      if (exp - now < buffer) {
        console.log("[AppInit] Token expiring soon, refreshing...");
        const refreshed = await refreshToken();
        return !!refreshed;
      }

      return true;
    } catch (error) {
      console.warn("[AppInit] Token validation failed:", error);
      return false;
    }
  }

  /**
   * Run initialization with phases
   */
  async initialize(): Promise<InitResult[]> {
    if (this.isInitializing) {
      console.log("[AppInit] Already initializing, skipping...");
      return this.results;
    }

    this.isInitializing = true;
    this.results = [];
    this.abortController = new AbortController();

    const phases: InitPhase[] = ["auth", "essential", "background", "optional"];

    try {
      for (const phase of phases) {
        if (this.abortController.signal.aborted) break;

        this.currentPhase = phase;
        console.log(`[AppInit] Starting phase: ${phase}`);

        const phaseTasks = Array.from(this.tasks.values())
          .filter((t) => t.phase === phase)
          .sort((a, b) => a.priority - b.priority);

        if (phaseTasks.length === 0) continue;

        // For auth and essential phases, run sequentially
        if (phase === "auth" || phase === "essential") {
          for (const task of phaseTasks) {
            const result = await this.executeTask(task);
            this.results.push(result);

            // Stop if critical task fails
            if (task.critical && !result.success) {
              console.error(
                `[AppInit] Critical task failed: ${task.name}`,
                result.error,
              );
              throw result.error || new Error(`${task.name} failed`);
            }
          }
        } else {
          // For background and optional phases, run in parallel with limit
          const chunks = this.chunkArray(phaseTasks, MAX_CONCURRENT_TASKS);
          for (const chunk of chunks) {
            const results = await Promise.allSettled(
              chunk.map((t) => this.executeTask(t)),
            );

            results.forEach((r, i) => {
              if (r.status === "fulfilled") {
                this.results.push(r.value);
              } else {
                this.results.push({
                  success: false,
                  phase,
                  taskName: chunk[i].name,
                  duration: 0,
                  error: r.reason,
                });
              }
            });
          }
        }
      }

      // Save init state
      await this.saveInitState();
    } catch (error) {
      console.error("[AppInit] Initialization failed:", error);
    } finally {
      this.isInitializing = false;
      this.currentPhase = null;
    }

    return this.results;
  }

  /**
   * Cancel ongoing initialization
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Get initialization status
   */
  getStatus(): {
    isInitializing: boolean;
    currentPhase: InitPhase | null;
    completedTasks: number;
    failedTasks: number;
  } {
    return {
      isInitializing: this.isInitializing,
      currentPhase: this.currentPhase,
      completedTasks: this.results.filter((r) => r.success).length,
      failedTasks: this.results.filter((r) => !r.success).length,
    };
  }

  /**
   * Clear all registered tasks
   */
  clearTasks(): void {
    this.tasks.clear();
    this.results = [];
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private async executeTask(task: InitTask): Promise<InitResult> {
    const startTime = Date.now();
    const timeout = task.timeout || DEFAULT_TIMEOUT;
    const retryCount = task.retryCount ?? DEFAULT_RETRY_COUNT;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        // Report progress
        this.reportProgress(task.phase, task.name);

        // Execute with timeout
        await Promise.race([
          task.execute(),
          this.timeoutPromise(timeout, task.name),
        ]);

        return {
          success: true,
          phase: task.phase,
          taskName: task.name,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[AppInit] Task ${task.name} failed (attempt ${attempt + 1}/${retryCount + 1}):`,
          error,
        );

        if (attempt < retryCount) {
          // Wait before retry with exponential backoff
          await this.delay(Math.pow(2, attempt) * 500);
        }
      }
    }

    return {
      success: false,
      phase: task.phase,
      taskName: task.name,
      duration: Date.now() - startTime,
      error: lastError,
    };
  }

  private timeoutPromise(ms: number, taskName: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Task ${taskName} timed out after ${ms}ms`)),
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

  private reportProgress(phase: InitPhase, taskName: string): void {
    if (!this.progressCallback) return;

    const phaseTasks = Array.from(this.tasks.values()).filter(
      (t) => t.phase === phase,
    );
    const completed = this.results.filter((r) => r.phase === phase).length;
    const progress = phaseTasks.length > 0 ? completed / phaseTasks.length : 0;

    this.progressCallback(phase, progress, taskName);
  }

  private async saveInitState(): Promise<void> {
    try {
      const state = {
        lastInit: Date.now(),
        results: this.results.map((r) => ({
          taskName: r.taskName,
          success: r.success,
          duration: r.duration,
        })),
      };
      await AsyncStorage.setItem(INIT_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("[AppInit] Failed to save init state:", error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const appInitializer = AppInitializerService.getInstance();
export default AppInitializerService;
