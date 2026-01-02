/**
 * API Integration Service
 * =======================
 * 
 * Service tổng hợp để tích hợp tất cả API endpoints với fallback logic
 * - Ưu tiên sử dụng API thực từ backend
 * - Fallback sang mock data khi API fail
 * - Caching và error handling
 * - Retry logic
 * 
 * @author ThietKeResort Team
 * @created 2025-12-31
 */

import ENV from '@/config/env';
import { apiFetch } from './api';

// ==================== TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  source: 'api' | 'mock' | 'cache';
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==================== CONFIGURATION ====================

const INTEGRATION_CONFIG = {
  enableMockFallback: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 2,
  retryDelay: 1000,
  logRequests: __DEV__,
  detailedLogging: __DEV__, // Enable detailed logging in development
};

// ==================== LOGGING ====================

class ApiLogger {
  private enabled: boolean = INTEGRATION_CONFIG.detailedLogging;

  info(message: string, ...args: any[]) {
    if (this.enabled) {
      console.log(`[API Integration] ℹ️ ${message}`, ...args);
    }
  }

  success(message: string, ...args: any[]) {
    if (this.enabled) {
      console.log(`[API Integration] ✅ ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.enabled) {
      console.warn(`[API Integration] ⚠️ ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.enabled) {
      console.error(`[API Integration] ❌ ${message}`, ...args);
    }
  }

  cache(message: string, ...args: any[]) {
    if (this.enabled) {
      console.log(`[API Integration] 💾 ${message}`, ...args);
    }
  }

  mock(message: string, ...args: any[]) {
    if (this.enabled) {
      console.log(`[API Integration] 🔄 ${message}`, ...args);
    }
  }
}

const logger = new ApiLogger();

// ==================== CACHE MANAGER ====================

class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set<T>(key: string, data: T, ttl: number = INTEGRATION_CONFIG.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

const cache = new CacheManager();

// ==================== API INTEGRATION ====================

export class ApiIntegration {
  /**
   * Generic API call với caching và fallback
   */
  static async call<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: any;
      cache?: boolean;
      cacheKey?: string;
      mockData?: T;
      retries?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      data,
      cache: useCache = true,
      cacheKey = `${method}:${endpoint}`,
      mockData,
      retries = INTEGRATION_CONFIG.retryAttempts,
    } = options;

    // Check cache first
    if (useCache && method === 'GET') {
      const cached = cache.get<T>(cacheKey);
      if (cached !== null) {
        logger.cache(`Cache HIT: ${cacheKey}`);
        return {
          success: true,
          data: cached,
          source: 'cache',
          timestamp: Date.now(),
        };
      } else {
        logger.cache(`Cache MISS: ${cacheKey}`);
      }
    }

    // Try API call
    logger.info(`${method} ${endpoint}${data ? ' with data' : ''}`);
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.info(`Attempt ${attempt + 1}/${retries + 1}: ${method} ${endpoint}`);

        const response = await apiFetch<T>(endpoint, {
          method,
          ...(data && { body: JSON.stringify(data) }),
        });

        logger.success(`API call succeeded: ${endpoint}`);

        // Cache successful GET responses
        if (useCache && method === 'GET') {
          cache.set(cacheKey, response);
          logger.cache(`Cached: ${cacheKey}`);
        }

        return {
          success: true,
          data: response,
          source: 'api',
          timestamp: Date.now(),
        };
      } catch (error: any) {
        lastError = error;
        logger.error(`Attempt ${attempt + 1} failed: ${error.message}`);
        
        if (attempt < retries) {
          const delay = INTEGRATION_CONFIG.retryDelay * (attempt + 1);
          logger.warn(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // All retries failed
        logger.error(`All ${retries + 1} attempts failed for ${endpoint}`);
        
        // Try mock fallback
        if (INTEGRATION_CONFIG.enableMockFallback && mockData) {
          logger.mock(`Using mock data for ${endpoint}`);
          return {
            success: true,
            data: mockData,
            message: 'Using mock data (API unavailable)',
            source: 'mock',
            timestamp: Date.now(),
          };
        }
        
        // No fallback available
        throw error;
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new Error('Unknown error');
  }

  /**
   * GET request
   */
  static async get<T>(
    endpoint: string,
    options: {
      cache?: boolean;
      cacheKey?: string;
      mockData?: T;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.call<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  static async post<T>(
    endpoint: string,
    data: any,
    options: {
      mockData?: T;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.call<T>(endpoint, {
      method: 'POST',
      data,
      cache: false,
      ...options,
    });
  }

  /**
   * PUT request
   */
  static async put<T>(
    endpoint: string,
    data: any,
    options: {
      mockData?: T;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.call<T>(endpoint, {
      method: 'PUT',
      data,
      cache: false,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(
    endpoint: string,
    options: {
      mockData?: T;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.call<T>(endpoint, {
      method: 'DELETE',
      cache: false,
      ...options,
    });
  }

  /**
   * Clear cache
   */
  static clearCache(pattern?: string): void {
    cache.clear(pattern);
    if (INTEGRATION_CONFIG.logRequests) {
      console.log(`[ApiIntegration] Cache cleared${pattern ? ` (pattern: ${pattern})` : ''}`);
    }
  }

  /**
   * Check if data is cached
   */
  static isCached(cacheKey: string): boolean {
    return cache.has(cacheKey);
  }
}

// ==================== PERFEX CRM INTEGRATION ====================

export class PerfexApiIntegration {
  private static baseUrl = ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm';
  private static authToken = ENV.PERFEX_API_TOKEN || '';

  /**
   * Generic Perfex API call
   */
  static async call<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
      mockData?: T;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', data, mockData } = options;

    try {
      const url = `${this.baseUrl}/api${endpoint}`;
      
      if (INTEGRATION_CONFIG.logRequests) {
        console.log(`[PerfexIntegration] ${method} ${endpoint}`);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'authtoken': this.authToken,
        },
        ...(data && { body: JSON.stringify(data) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result,
        source: 'api',
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error(`[PerfexIntegration] Error:`, error.message);
      
      // Fallback to mock data
      if (INTEGRATION_CONFIG.enableMockFallback && mockData) {
        console.log(`[PerfexIntegration] Using mock data for ${endpoint}`);
        return {
          success: true,
          data: mockData,
          message: 'Using mock data (Perfex API unavailable)',
          source: 'mock',
          timestamp: Date.now(),
        };
      }
      
      throw error;
    }
  }

  /**
   * Get customers
   */
  static async getCustomers(): Promise<ApiResponse<any[]>> {
    const mockData = [
      {
        userid: '1',
        company: 'Anh Khương Q9',
        phonenumber: '0359777108',
        city: 'Hồ Chí Minh',
        website: 'baotienweb.cloud',
      },
      {
        userid: '2',
        company: 'NHÀ XINH',
        phonenumber: '0909452109',
        city: 'Hồ Chí Minh',
        website: 'nhaxinhdesign.com',
      },
    ];

    return this.call('/customers', { mockData });
  }

  /**
   * Get projects
   */
  static async getProjects(): Promise<ApiResponse<any[]>> {
    const mockData = [
      {
        id: '1',
        name: 'Villa Resort Project',
        clientid: '1',
        status: '2',
        start_date: '2025-01-01',
        deadline: '2025-12-31',
        progress: 45,
      },
    ];

    return this.call('/projects', { mockData });
  }

  /**
   * Get project by ID
   */
  static async getProject(id: string): Promise<ApiResponse<any>> {
    const mockData = {
      id,
      name: 'Villa Resort Project',
      description: 'Luxury villa resort construction',
      clientid: '1',
      status: '2',
      start_date: '2025-01-01',
      deadline: '2025-12-31',
      progress: 45,
    };

    return this.call(`/projects/${id}`, { mockData });
  }
}

// ==================== MAIN BACKEND INTEGRATION ====================

export class MainApiIntegration {
  /**
   * Get construction projects
   */
  static async getProjects(): Promise<ApiResponse<any[]>> {
    const mockData = [
      {
        id: '1',
        name: 'Villa Resort Construction',
        status: 'in_progress',
        progress: 45,
        budget: 15000000000,
        startDate: '2025-01-15',
        endDate: '2025-12-31',
      },
    ];

    return ApiIntegration.get('/projects', { mockData });
  }

  /**
   * Get project details
   */
  static async getProject(id: string): Promise<ApiResponse<any>> {
    const mockData = {
      id,
      name: 'Villa Resort Construction',
      description: 'Complete resort development',
      status: 'in_progress',
      progress: 45,
      budget: 15000000000,
      spent: 6750000000,
      startDate: '2025-01-15',
      endDate: '2025-12-31',
      client: 'Resort Hội An Paradise',
      location: 'Quảng Nam',
    };

    return ApiIntegration.get(`/projects/${id}`, { mockData });
  }

  /**
   * Get tasks for project
   */
  static async getProjectTasks(projectId: string): Promise<ApiResponse<any[]>> {
    const mockData = [
      {
        id: '1',
        projectId,
        name: 'Foundation Work',
        status: 'completed',
        progress: 100,
        dueDate: '2025-03-31',
      },
      {
        id: '2',
        projectId,
        name: 'Structure Construction',
        status: 'in_progress',
        progress: 60,
        dueDate: '2025-07-31',
      },
    ];

    return ApiIntegration.get(`/projects/${projectId}/tasks`, { mockData });
  }

  /**
   * Create new project
   */
  static async createProject(data: any): Promise<ApiResponse<any>> {
    const mockData = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    return ApiIntegration.post('/projects', data, { mockData });
  }

  /**
   * Update project
   */
  static async updateProject(id: string, data: any): Promise<ApiResponse<any>> {
    const mockData = {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return ApiIntegration.put(`/projects/${id}`, data, { mockData });
  }

  /**
   * Delete project
   */
  static async deleteProject(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const mockData = { success: true };
    return ApiIntegration.delete(`/projects/${id}`, { mockData });
  }
}

// ==================== EXPORT ====================

export default {
  api: ApiIntegration,
  perfex: PerfexApiIntegration,
  main: MainApiIntegration,
};
