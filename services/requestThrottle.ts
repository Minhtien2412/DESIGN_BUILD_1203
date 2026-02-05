/**
 * Request Throttle Service
 * =========================
 *
 * Quản lý số lượng request đồng thời để tránh:
 * 1. Overload server
 * 2. Overload device (CPU/Memory)
 * 3. UI freeze do quá nhiều state updates
 *
 * Features:
 * - Request queue với priority
 * - Concurrent limit (default 6 giống browser)
 * - Per-domain throttling
 * - Request batching cho cùng endpoint
 *
 * @author ThietKeResort Team
 * @created 2026-01-29
 */

// ============================================================================
// TYPES
// ============================================================================

export type RequestPriority = "critical" | "high" | "normal" | "low";

export interface QueuedRequest<T = unknown> {
  id: string;
  priority: RequestPriority;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
  domain?: string;
}

export interface ThrottleConfig {
  maxConcurrent: number;
  maxPerDomain: number;
  timeout: number;
  priorityBoost: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRIORITY_WEIGHTS: Record<RequestPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

const DEFAULT_CONFIG: ThrottleConfig = {
  maxConcurrent: 6,
  maxPerDomain: 4,
  timeout: 30000,
  priorityBoost: true,
};

// ============================================================================
// REQUEST THROTTLE SERVICE
// ============================================================================

class RequestThrottleService {
  private static instance: RequestThrottleService;
  private queue: QueuedRequest[] = [];
  private activeCount = 0;
  private activeByDomain: Map<string, number> = new Map();
  private config: ThrottleConfig;
  private isProcessing = false;
  private requestIdCounter = 0;

  private constructor(config: Partial<ThrottleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<ThrottleConfig>): RequestThrottleService {
    if (!RequestThrottleService.instance) {
      RequestThrottleService.instance = new RequestThrottleService(config);
    }
    return RequestThrottleService.instance;
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  /**
   * Enqueue a request with priority
   */
  async enqueue<T>(
    execute: () => Promise<T>,
    options: {
      priority?: RequestPriority;
      domain?: string;
      id?: string;
    } = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: options.id || `req_${++this.requestIdCounter}`,
        priority: options.priority || "normal",
        execute: execute as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
        domain: options.domain,
      };

      this.addToQueue(request);
      this.processQueue();
    });
  }

  /**
   * Execute immediately if possible, otherwise queue
   */
  async executeWithThrottle<T>(
    execute: () => Promise<T>,
    domain?: string,
  ): Promise<T> {
    // Check if we can execute immediately
    if (this.canExecute(domain)) {
      return this.executeRequest({
        execute,
        domain,
      } as QueuedRequest) as Promise<T>;
    }

    // Otherwise queue it
    return this.enqueue(execute, { domain });
  }

  /**
   * Get current queue status
   */
  getStatus(): {
    activeCount: number;
    queueLength: number;
    byDomain: Record<string, number>;
  } {
    return {
      activeCount: this.activeCount,
      queueLength: this.queue.length,
      byDomain: Object.fromEntries(this.activeByDomain),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ThrottleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear the queue (optionally by domain)
   */
  clearQueue(domain?: string): number {
    const before = this.queue.length;

    if (domain) {
      this.queue = this.queue.filter((r) => r.domain !== domain);
    } else {
      this.queue.forEach((r) => r.reject(new Error("Queue cleared")));
      this.queue = [];
    }

    return before - this.queue.length;
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(id: string): boolean {
    const index = this.queue.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.queue[index].reject(new Error("Request cancelled"));
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private addToQueue(request: QueuedRequest): void {
    // Insert at correct position based on priority
    const insertIndex = this.findInsertIndex(request);
    this.queue.splice(insertIndex, 0, request);
  }

  private findInsertIndex(request: QueuedRequest): number {
    const weight = this.getEffectiveWeight(request);

    for (let i = 0; i < this.queue.length; i++) {
      if (weight > this.getEffectiveWeight(this.queue[i])) {
        return i;
      }
    }

    return this.queue.length;
  }

  private getEffectiveWeight(request: QueuedRequest): number {
    let weight = PRIORITY_WEIGHTS[request.priority];

    // Boost priority for older requests
    if (this.config.priorityBoost) {
      const age = Date.now() - request.timestamp;
      const ageBonus = Math.min(age / 10000, 1); // Max 1 point bonus after 10s
      weight += ageBonus;
    }

    return weight;
  }

  private canExecute(domain?: string): boolean {
    if (this.activeCount >= this.config.maxConcurrent) {
      return false;
    }

    if (domain) {
      const domainCount = this.activeByDomain.get(domain) || 0;
      if (domainCount >= this.config.maxPerDomain) {
        return false;
      }
    }

    return true;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        // Find next executable request
        const nextIndex = this.findNextExecutable();
        if (nextIndex === -1) {
          // No request can be executed now
          break;
        }

        const request = this.queue.splice(nextIndex, 1)[0];
        this.executeRequest(request).catch(() => {
          // Error already handled in executeRequest
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private findNextExecutable(): number {
    for (let i = 0; i < this.queue.length; i++) {
      const request = this.queue[i];
      if (this.canExecute(request.domain)) {
        return i;
      }
    }
    return -1;
  }

  private async executeRequest<T>(request: QueuedRequest<T>): Promise<T> {
    this.activeCount++;
    if (request.domain) {
      const current = this.activeByDomain.get(request.domain) || 0;
      this.activeByDomain.set(request.domain, current + 1);
    }

    try {
      const result = await Promise.race([
        request.execute(),
        this.timeoutPromise(this.config.timeout),
      ]);

      request.resolve(result as T);
      return result as T;
    } catch (error) {
      request.reject(error as Error);
      throw error;
    } finally {
      this.activeCount--;
      if (request.domain) {
        const current = this.activeByDomain.get(request.domain) || 1;
        this.activeByDomain.set(request.domain, current - 1);
      }

      // Process next items in queue
      setTimeout(() => this.processQueue(), 0);
    }
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const requestThrottle = RequestThrottleService.getInstance();
export default RequestThrottleService;

// ============================================================================
// UTILITY FUNCTION
// ============================================================================

/**
 * Helper function to wrap fetch calls with throttling
 */
export function throttledFetch(
  url: string,
  options?: RequestInit,
  priority: RequestPriority = "normal",
): Promise<Response> {
  const domain = new URL(url).hostname;

  return requestThrottle.enqueue(() => fetch(url, options), {
    priority,
    domain,
    id: `fetch_${url}`,
  });
}
