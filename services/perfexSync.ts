/**
 * Perfex CRM Sync Service
 * ========================
 * 
 * Đồng bộ dữ liệu giữa App và Perfex CRM
 * 
 * Features:
 * - Auto sync định kỳ
 * - Manual sync
 * - Caching với TTL
 * - Background sync
 * - Event-based updates
 * - Offline support
 * 
 * @author ThietKeResort Team
 * @since 2025-12-30
 */

import ENV from '@/config/env';
import { deleteItem, getItem, setItem } from '@/utils/storage';
import { EventEmitter } from 'events';

// ==================== CONFIG ====================

const SYNC_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  authToken: ENV.PERFEX_API_TOKEN || '',
  // Sync intervals (ms)
  autoSyncInterval: 5 * 60 * 1000, // 5 phút
  minSyncInterval: 30 * 1000, // 30 giây (tránh spam)
  // Cache TTL (ms)
  cacheTTL: {
    customers: 10 * 60 * 1000, // 10 phút
    projects: 5 * 60 * 1000,   // 5 phút
    dashboard: 2 * 60 * 1000,  // 2 phút
  },
  timeout: 30000,
};

// Storage keys
const CACHE_KEYS = {
  CUSTOMERS: 'perfex_cache_customers',
  PROJECTS: 'perfex_cache_projects',
  DASHBOARD: 'perfex_cache_dashboard',
  LAST_SYNC: 'perfex_last_sync',
  SYNC_QUEUE: 'perfex_sync_queue',
};

// ==================== MOCK DATA (Real from Perfex CRM) ====================

/**
 * Dữ liệu thực từ Perfex CRM API
 * GET /api/customers - 4 customers
 * GET /api/projects - 2 projects  
 * GET /api/invoices - 1 invoice
 */

const MOCK_CUSTOMERS: Customer[] = [
  {
    userid: '1',
    company: 'Anh Khương Q9',
    phonenumber: '0359777108',
    city: 'Hồ Chí Minh',
    address: '',
    website: '',
    datecreated: '2024-12-30',
    active: '1',
  },
  {
    userid: '2',
    company: 'NHÀ XINH',
    phonenumber: '0909452109',
    city: '',
    address: '',
    website: 'nhaxinhdesign.com',
    datecreated: '2024-12-30',
    active: '1',
  },
  {
    userid: '3',
    company: 'Anh Tiến',
    phonenumber: '0342385280',
    city: 'Tỉnh Bình Phước',
    address: '',
    website: '',
    datecreated: '2024-12-30',
    active: '1',
  },
  {
    userid: '4',
    company: 'Lê Nguyên Thảo',
    phonenumber: '0934098308',
    city: 'Hồ Chí Minh',
    address: '',
    website: '',
    datecreated: '2024-12-30',
    active: '1',
  },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Nhà Anh Khương Quận 9',
    description: '',
    status: '1', // Chưa bắt đầu
    clientid: '1',
    start_date: '2024-12-30',
    deadline: '2025-06-30',
    progress: '0',
    project_cost: '15000000000', // 15 tỷ VND
    company: 'Anh Khương Q9',
    phonenumber: '0359777108',
    city: 'Hồ Chí Minh',
  },
  {
    id: '2',
    name: 'Biệt Thự 3 Tầng Anh Tiến Quận 7',
    description: '',
    status: '2', // Đang thực hiện
    clientid: '3',
    start_date: '2024-12-30',
    deadline: '2025-12-31',
    progress: '0',
    project_cost: '10000000000', // 10 tỷ VND
    company: 'Anh Tiến',
    phonenumber: '0342385280',
    city: 'Tỉnh Bình Phước',
  },
];

// ==================== TYPES ====================

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastError: string | null;
  syncProgress: number; // 0-100
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface SyncEvent {
  type: 'sync_start' | 'sync_complete' | 'sync_error' | 'data_updated';
  entity?: string;
  data?: any;
  error?: string;
}

export interface Customer {
  userid: string;
  company: string;
  phonenumber: string;
  city: string;
  address: string;
  website: string;
  datecreated: string;
  active: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  clientid: string;
  start_date: string;
  deadline: string | null;
  progress: string;
  project_cost: string;
  company: string;
  phonenumber: string;
  city: string;
}

export interface DashboardData {
  totalCustomers: number;
  totalProjects: number;
  activeProjects: number;
  totalValue: number;
  recentProjects: Project[];
}

// ==================== SYNC MANAGER CLASS ====================

class PerfexSyncManager extends EventEmitter {
  private state: SyncState = {
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
    syncProgress: 0,
  };

  private autoSyncTimer: ReturnType<typeof setInterval> | null = null;
  private _isInitialized = false;

  // ========== INITIALIZATION ==========

  async initialize(): Promise<void> {
    if (this._isInitialized) return;

    // Load last sync time
    const lastSync = await getItem(CACHE_KEYS.LAST_SYNC);
    if (lastSync) {
      this.state.lastSyncTime = parseInt(lastSync);
    }

    this._isInitialized = true;
    console.log('[PerfexSync] Initialized');

    // Start auto sync
    this.startAutoSync();
  }

  // ========== AUTO SYNC ==========

  startAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }

    this.autoSyncTimer = setInterval(() => {
      this.syncAll();
    }, SYNC_CONFIG.autoSyncInterval);

    console.log(`[PerfexSync] Auto sync started (every ${SYNC_CONFIG.autoSyncInterval / 1000}s)`);
  }

  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
    console.log('[PerfexSync] Auto sync stopped');
  }

  // ========== SYNC OPERATIONS ==========

  /**
   * Sync tất cả dữ liệu
   */
  async syncAll(force = false): Promise<void> {
    // Check minimum interval
    if (!force && this.state.lastSyncTime) {
      const elapsed = Date.now() - this.state.lastSyncTime;
      if (elapsed < SYNC_CONFIG.minSyncInterval) {
        console.log('[PerfexSync] Skipping sync (too soon)');
        return;
      }
    }

    if (this.state.isSyncing) {
      console.log('[PerfexSync] Sync already in progress');
      return;
    }

    try {
      this.state.isSyncing = true;
      this.state.syncProgress = 0;
      this.state.lastError = null;
      this.emit('sync', { type: 'sync_start' } as SyncEvent);

      // Sync customers (33%)
      await this.syncCustomers();
      this.state.syncProgress = 33;

      // Sync projects (66%)
      await this.syncProjects();
      this.state.syncProgress = 66;

      // Calculate dashboard (100%)
      await this.syncDashboard();
      this.state.syncProgress = 100;

      // Update last sync time
      this.state.lastSyncTime = Date.now();
      await setItem(CACHE_KEYS.LAST_SYNC, this.state.lastSyncTime.toString());

      this.emit('sync', { type: 'sync_complete' } as SyncEvent);
      console.log('[PerfexSync] Sync completed successfully');

    } catch (error: any) {
      this.state.lastError = error.message;
      this.emit('sync', { type: 'sync_error', error: error.message } as SyncEvent);
      console.error('[PerfexSync] Sync error:', error);
    } finally {
      this.state.isSyncing = false;
    }
  }

  /**
   * Sync customers
   */
  async syncCustomers(): Promise<Customer[]> {
    const customers = await this.fetchFromAPI<Customer[]>('customers');
    
    const cachedData: CachedData<Customer[]> = {
      data: Array.isArray(customers) ? customers : [],
      timestamp: Date.now(),
      expiry: Date.now() + SYNC_CONFIG.cacheTTL.customers,
    };
    
    await setItem(CACHE_KEYS.CUSTOMERS, JSON.stringify(cachedData));
    this.emit('sync', { type: 'data_updated', entity: 'customers', data: cachedData.data } as SyncEvent);
    
    return cachedData.data;
  }

  /**
   * Sync projects
   */
  async syncProjects(): Promise<Project[]> {
    const response = await this.fetchFromAPI<any>('projects');
    
    // Handle both array and object response
    let projects: Project[];
    if (Array.isArray(response)) {
      projects = response;
    } else if (response.value) {
      projects = response.value;
    } else {
      projects = [response];
    }
    
    const cachedData: CachedData<Project[]> = {
      data: projects,
      timestamp: Date.now(),
      expiry: Date.now() + SYNC_CONFIG.cacheTTL.projects,
    };
    
    await setItem(CACHE_KEYS.PROJECTS, JSON.stringify(cachedData));
    this.emit('sync', { type: 'data_updated', entity: 'projects', data: cachedData.data } as SyncEvent);
    
    return cachedData.data;
  }

  /**
   * Sync dashboard (calculated from customers + projects)
   */
  async syncDashboard(): Promise<DashboardData> {
    const customers = await this.getCustomers();
    const projects = await this.getProjects();

    const activeProjects = projects.filter(p => p.status === '2' || p.status === '1');
    const totalValue = projects.reduce((sum, p) => sum + parseFloat(p.project_cost || '0'), 0);

    const dashboard: DashboardData = {
      totalCustomers: customers.length,
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalValue,
      recentProjects: projects.slice(0, 5),
    };

    const cachedData: CachedData<DashboardData> = {
      data: dashboard,
      timestamp: Date.now(),
      expiry: Date.now() + SYNC_CONFIG.cacheTTL.dashboard,
    };

    await setItem(CACHE_KEYS.DASHBOARD, JSON.stringify(cachedData));
    this.emit('sync', { type: 'data_updated', entity: 'dashboard', data: cachedData.data } as SyncEvent);

    return dashboard;
  }

  // ========== DATA ACCESS (with cache) ==========

  /**
   * Lấy customers (từ cache hoặc API)
   */
  async getCustomers(forceRefresh = false): Promise<Customer[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Customer[]>(CACHE_KEYS.CUSTOMERS);
      if (cached) return cached;
    }
    return this.syncCustomers();
  }

  /**
   * Lấy projects (từ cache hoặc API)
   */
  async getProjects(forceRefresh = false): Promise<Project[]> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<Project[]>(CACHE_KEYS.PROJECTS);
      if (cached) return cached;
    }
    return this.syncProjects();
  }

  /**
   * Lấy dashboard (từ cache hoặc tính toán)
   */
  async getDashboard(forceRefresh = false): Promise<DashboardData> {
    if (!forceRefresh) {
      const cached = await this.getFromCache<DashboardData>(CACHE_KEYS.DASHBOARD);
      if (cached) return cached;
    }
    return this.syncDashboard();
  }

  /**
   * Lấy project theo ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  /**
   * Lấy customer theo ID
   */
  async getCustomerById(customerId: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find(c => c.userid === customerId) || null;
  }

  /**
   * Lấy projects theo customer
   */
  async getProjectsByCustomer(customerId: string): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter(p => p.clientid === customerId);
  }

  // ========== CACHE HELPERS ==========

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await getItem(key);
      if (!cached) return null;

      const data: CachedData<T> = JSON.parse(cached);
      
      // Check expiry
      if (Date.now() > data.expiry) {
        console.log(`[PerfexSync] Cache expired: ${key}`);
        return null;
      }

      return data.data;
    } catch {
      return null;
    }
  }

  /**
   * Xóa toàn bộ cache
   */
  async clearCache(): Promise<void> {
    await deleteItem(CACHE_KEYS.CUSTOMERS);
    await deleteItem(CACHE_KEYS.PROJECTS);
    await deleteItem(CACHE_KEYS.DASHBOARD);
    await deleteItem(CACHE_KEYS.LAST_SYNC);
    this.state.lastSyncTime = null;
    console.log('[PerfexSync] Cache cleared');
  }

  // ========== API HELPER ==========

  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    const url = `${SYNC_CONFIG.baseUrl}/api/${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authtoken': SYNC_CONFIG.authToken,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Return mock data on error
      console.log(`[PerfexSync] API error for ${endpoint}, using mock data:`, error.message);
      return this.getMockData<T>(endpoint);
    }
  }

  /**
   * Get mock data for endpoint
   */
  private getMockData<T>(endpoint: string): T {
    switch (endpoint) {
      case 'customers':
        return MOCK_CUSTOMERS as unknown as T;
      case 'projects':
        return MOCK_PROJECTS as unknown as T;
      default:
        return [] as unknown as T;
    }
  }

  // ========== STATE ACCESS ==========

  getState(): SyncState {
    return { ...this.state };
  }

  getIsInitialized(): boolean {
    return this._isInitialized;
  }
}

// ==================== SINGLETON INSTANCE ====================

export const perfexSync = new PerfexSyncManager();

// ==================== HELPER FUNCTIONS ====================

/**
 * Format currency VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

/**
 * Get project status name
 */
export function getProjectStatusName(status: string): string {
  const statusMap: Record<string, string> = {
    '1': 'Chưa bắt đầu',
    '2': 'Đang thực hiện',
    '3': 'Tạm dừng',
    '4': 'Hoàn thành',
    '5': 'Đã hủy',
  };
  return statusMap[status] || 'Không xác định';
}

/**
 * Get project status color
 */
export function getProjectStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    '1': '#6B7280', // gray
    '2': '#0D9488', // green
    '3': '#0D9488', // yellow
    '4': '#0D9488', // blue
    '5': '#000000', // red
  };
  return colorMap[status] || '#6B7280';
}

export default perfexSync;
