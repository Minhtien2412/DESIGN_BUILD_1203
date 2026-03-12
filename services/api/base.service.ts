/**
 * Base API Service
 * Unified service layer with:
 * - Automatic retry with exponential backoff
 * - Offline request queueing
 * - Standardized error handling
 * - Request deduplication
 * - Response caching
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { ApiError, apiFetch, ApiFetchOptions } from "../api";

// ==================== TYPES ====================

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: ApiError) => boolean;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // milliseconds
  key: string;
}

export interface OfflineQueueItem {
  id: string;
  endpoint: string;
  method: string;
  data?: any;
  timestamp: number;
  retries: number;
}

export interface ServiceConfig {
  baseUrl?: string;
  retry?: Partial<RetryConfig>;
  cache?: Partial<CacheConfig>;
  offlineSupport?: boolean;
}

// ==================== DEFAULT CONFIGS ====================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error: ApiError) => {
    // Retry on network errors, 5xx, and 429
    if (!error.status) return true; // Network error
    if (error.status >= 500) return true; // Server error
    if (error.status === 429) return true; // Rate limit
    return false;
  },
};

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: false,
  ttl: 5 * 60 * 1000, // 5 minutes
  key: "",
};

// ==================== BASE SERVICE CLASS ====================

export abstract class BaseApiService {
  protected serviceName: string;
  protected retryConfig: RetryConfig;
  protected cacheConfig: CacheConfig;
  protected offlineSupport: boolean;

  // Request deduplication cache
  private pendingRequests = new Map<string, Promise<any>>();

  // Offline status
  private isOnline: boolean = true;
  private offlineQueue: OfflineQueueItem[] = [];
  private isProcessingQueue: boolean = false;

  // Track which services have logged network status to prevent spam
  private static networkLoggedServices = new Set<string>();

  constructor(serviceName: string, config?: ServiceConfig) {
    this.serviceName = serviceName;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config?.retry };
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...config?.cache };
    this.offlineSupport = config?.offlineSupport ?? true;

    // Initialize network monitoring
    this.initNetworkMonitoring();

    // Load offline queue on startup
    this.loadOfflineQueue();
  }

  // ==================== NETWORK MONITORING ====================

  private initNetworkMonitoring() {
    // Skip network monitoring on web - always assume online
    if (Platform.OS === "web") {
      this.isOnline = true;
      return;
    }

    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Only log once per service to prevent spam during re-renders
      if (!BaseApiService.networkLoggedServices.has(this.serviceName)) {
        console.log(
          `[${this.serviceName}] Network status:`,
          this.isOnline ? "ONLINE" : "OFFLINE",
        );
        BaseApiService.networkLoggedServices.add(this.serviceName);
      }

      // Process queue when coming back online
      if (wasOffline && this.isOnline && this.offlineSupport) {
        this.processOfflineQueue();
      }
    });
  }

  // ==================== OFFLINE QUEUE ====================

  private async loadOfflineQueue() {
    if (!this.offlineSupport) return;

    // Skip on web - AsyncStorage uses window which doesn't exist in SSR
    if (Platform.OS === "web") {
      console.log(
        `[${this.serviceName}] Skipping offline queue on web platform`,
      );
      return;
    }

    try {
      const queueKey = `offline_queue_${this.serviceName}`;
      const stored = await AsyncStorage.getItem(queueKey);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        console.log(
          `[${this.serviceName}] Loaded ${this.offlineQueue.length} offline requests`,
        );
      }
    } catch (error) {
      console.error(
        `[${this.serviceName}] Failed to load offline queue:`,
        error,
      );
    }
  }

  private async saveOfflineQueue() {
    if (!this.offlineSupport) return;

    // Skip on web
    if (Platform.OS === "web") return;

    try {
      const queueKey = `offline_queue_${this.serviceName}`;
      await AsyncStorage.setItem(queueKey, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error(
        `[${this.serviceName}] Failed to save offline queue:`,
        error,
      );
    }
  }

  protected async queueOfflineRequest(
    endpoint: string,
    method: string,
    data?: any,
  ): Promise<void> {
    const item: OfflineQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.offlineQueue.push(item);
    await this.saveOfflineQueue();

    console.log(`[${this.serviceName}] Queued offline request:`, endpoint);
  }

  private async processOfflineQueue() {
    if (this.isProcessingQueue || this.offlineQueue.length === 0) return;

    this.isProcessingQueue = true;
    console.log(
      `[${this.serviceName}] Processing ${this.offlineQueue.length} offline requests`,
    );

    const results = {
      success: 0,
      failed: 0,
      total: this.offlineQueue.length,
    };

    while (this.offlineQueue.length > 0 && this.isOnline) {
      const item = this.offlineQueue[0];

      try {
        await apiFetch(item.endpoint, {
          method: item.method as any,
          data: item.data,
        });

        // Success - remove from queue
        this.offlineQueue.shift();
        results.success++;
      } catch (error) {
        item.retries++;

        // Max retries reached - remove from queue
        if (item.retries >= this.retryConfig.maxRetries) {
          console.error(
            `[${this.serviceName}] Max retries for offline request:`,
            item.endpoint,
          );
          this.offlineQueue.shift();
          results.failed++;
        } else {
          // Keep in queue for next attempt
          break;
        }
      }
    }

    await this.saveOfflineQueue();
    this.isProcessingQueue = false;

    console.log(`[${this.serviceName}] Offline queue processed:`, results);
  }

  // ==================== CACHING ====================

  private getCacheKey(endpoint: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : "";
    return `cache_${this.serviceName}_${endpoint}_${paramsStr}`;
  }

  protected async getCachedData<T>(
    endpoint: string,
    params?: any,
  ): Promise<T | null> {
    if (!this.cacheConfig.enabled) return null;

    try {
      const cacheKey = this.getCacheKey(endpoint, params);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Check if cache is still valid
      if (age < this.cacheConfig.ttl) {
        console.log(`[${this.serviceName}] Cache hit:`, endpoint);
        return data as T;
      } else {
        // Cache expired - remove it
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
    } catch (error) {
      console.error(`[${this.serviceName}] Cache read error:`, error);
      return null;
    }
  }

  protected async setCachedData<T>(
    endpoint: string,
    data: T,
    params?: any,
  ): Promise<void> {
    if (!this.cacheConfig.enabled) return;

    try {
      const cacheKey = this.getCacheKey(endpoint, params);
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`[${this.serviceName}] Cached:`, endpoint);
    } catch (error) {
      console.error(`[${this.serviceName}] Cache write error:`, error);
    }
  }

  protected async invalidateCache(endpoint?: string): Promise<void> {
    try {
      if (endpoint) {
        // Invalidate specific endpoint
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((key) =>
          key.startsWith(`cache_${this.serviceName}_${endpoint}`),
        );
        await AsyncStorage.multiRemove(cacheKeys);
      } else {
        // Invalidate all cache for this service
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((key) =>
          key.startsWith(`cache_${this.serviceName}_`),
        );
        await AsyncStorage.multiRemove(cacheKeys);
      }
      console.log(
        `[${this.serviceName}] Cache invalidated:`,
        endpoint || "all",
      );
    } catch (error) {
      console.error(`[${this.serviceName}] Cache invalidation error:`, error);
    }
  }

  // ==================== REQUEST DEDUPLICATION ====================

  private getRequestKey(endpoint: string, options?: any): string {
    return `${endpoint}_${JSON.stringify(options || {})}`;
  }

  protected async deduplicatedRequest<T>(
    endpoint: string,
    options?: ApiFetchOptions,
  ): Promise<T> {
    const key = this.getRequestKey(endpoint, options);

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`[${this.serviceName}] Deduplicating request:`, endpoint);
      return pending;
    }

    // Create new request
    const promise = this.requestWithRetry<T>(endpoint, options);
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(key);
    }
  }

  // ==================== RETRY LOGIC ====================

  protected async requestWithRetry<T>(
    endpoint: string,
    options?: ApiFetchOptions,
  ): Promise<T> {
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await apiFetch<T>(endpoint, options);
        return result;
      } catch (error) {
        lastError = error as ApiError;

        // Don't retry if shouldRetry returns false
        if (!this.retryConfig.shouldRetry(lastError)) {
          throw lastError;
        }

        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay,
        );

        console.log(
          `[${this.serviceName}] Retry ${attempt + 1}/${this.retryConfig.maxRetries} after ${delay}ms:`,
          endpoint,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // ==================== CORE REQUEST METHODS ====================

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: {
      cache?: boolean;
      deduplicate?: boolean;
    },
  ): Promise<T> {
    // Try cache first
    if (options?.cache) {
      const cached = await this.getCachedData<T>(endpoint, params);
      if (cached) return cached;
    }

    // Build URL with params - filter out undefined/null values
    let url = endpoint;
    if (params) {
      const filteredParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          filteredParams[key] = String(value);
        }
      }
      if (Object.keys(filteredParams).length > 0) {
        url = `${endpoint}?${new URLSearchParams(filteredParams)}`;
      }
    }

    // Make request
    const request = options?.deduplicate
      ? () => this.deduplicatedRequest<T>(url, { method: "GET" })
      : () => this.requestWithRetry<T>(url, { method: "GET" });

    const result = await request();

    // Cache result if enabled
    if (options?.cache) {
      await this.setCachedData(endpoint, result, params);
    }

    return result;
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    options?: {
      offlineQueue?: boolean;
    },
  ): Promise<T> {
    // Queue for offline if not connected
    if (!this.isOnline && this.offlineSupport && options?.offlineQueue) {
      await this.queueOfflineRequest(endpoint, "POST", data);
      throw new ApiError("Request queued for offline processing", {
        code: "OFFLINE_QUEUED",
      });
    }

    return this.requestWithRetry<T>(endpoint, {
      method: "POST",
      data,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    options?: {
      offlineQueue?: boolean;
    },
  ): Promise<T> {
    // Queue for offline if not connected
    if (!this.isOnline && this.offlineSupport && options?.offlineQueue) {
      await this.queueOfflineRequest(endpoint, "PUT", data);
      throw new ApiError("Request queued for offline processing", {
        code: "OFFLINE_QUEUED",
      });
    }

    return this.requestWithRetry<T>(endpoint, {
      method: "PUT",
      data,
    });
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
    options?: {
      offlineQueue?: boolean;
    },
  ): Promise<T> {
    // Queue for offline if not connected
    if (!this.isOnline && this.offlineSupport && options?.offlineQueue) {
      await this.queueOfflineRequest(endpoint, "PATCH", data);
      throw new ApiError("Request queued for offline processing", {
        code: "OFFLINE_QUEUED",
      });
    }

    return this.requestWithRetry<T>(endpoint, {
      method: "PATCH",
      data,
    });
  }

  protected async delete<T>(
    endpoint: string,
    options?: {
      offlineQueue?: boolean;
    },
  ): Promise<T> {
    // Queue for offline if not connected
    if (!this.isOnline && this.offlineSupport && options?.offlineQueue) {
      await this.queueOfflineRequest(endpoint, "DELETE");
      throw new ApiError("Request queued for offline processing", {
        code: "OFFLINE_QUEUED",
      });
    }

    return this.requestWithRetry<T>(endpoint, {
      method: "DELETE",
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if service is online
   */
  public isServiceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get offline queue status
   */
  public getOfflineQueueStatus() {
    return {
      count: this.offlineQueue.length,
      items: this.offlineQueue,
      isProcessing: this.isProcessingQueue,
    };
  }

  /**
   * Manually trigger offline queue processing
   */
  public async syncOfflineQueue(): Promise<void> {
    if (this.isOnline) {
      await this.processOfflineQueue();
    }
  }

  /**
   * Clear all offline queue items
   */
  public async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
  }
}
