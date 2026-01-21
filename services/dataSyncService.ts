/**
 * Data Sync Service
 * Đồng bộ dữ liệu giữa Backend chính (baotienweb.cloud) và Perfex CRM
 * 
 * Luồng hoạt động:
 * 1. User đăng nhập qua Backend chính
 * 2. Sau khi đăng nhập thành công, tự động đồng bộ với Perfex CRM
 * 3. Lấy dữ liệu từ Perfex CRM (projects, invoices, estimates, tickets)
 * 4. Merge dữ liệu vào app state
 * 
 * @author ThietKeResort Team
 * @created 2026-01-02
 */

import ENV from '@/config/env';
import { getItem, setItem } from '@/utils/storage';

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  apiKey: ENV.PERFEX_API_KEY || '',
  apiVersion: '/api/v1',
  timeout: 15000,
};

const MAIN_BACKEND_URL = ENV.API_BASE_URL || 'https://baotienweb.cloud/api/v1';

// Storage keys for sync state
const SYNC_STORAGE_KEYS = {
  LAST_SYNC: 'sync:last_sync_time',
  PERFEX_USER: 'sync:perfex_user',
  SYNC_STATUS: 'sync:status',
  CACHED_DATA: 'sync:cached_data',
};

// ==================== TYPES ====================

export interface SyncStatus {
  lastSync: number | null;
  perfexLinked: boolean;
  mainBackendLinked: boolean;
  dataVersion: string;
}

export interface SyncedUserData {
  // Main backend data
  mainUser: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  
  // Perfex CRM data
  perfexUser: {
    id: string;
    contactId: string | null;
    customerId: string | null;
    email: string;
    fullName: string;
    company?: string;
    isStaff: boolean;
  } | null;
  
  // Merged data
  linkedAccounts: boolean;
}

export interface PerfexProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  deadline?: string;
  cost?: number;
  billingType?: string;
}

export interface PerfexInvoice {
  id: string;
  number: string;
  total: number;
  status: string;
  dueDate?: string;
  paidDate?: string;
}

export interface PerfexEstimate {
  id: string;
  number: string;
  total: number;
  status: string;
  expiryDate?: string;
}

export interface PerfexTicket {
  id: string;
  subject: string;
  message?: string;
  status: string;
  priority: string;
  lastReply?: string;
}

export interface SyncedCRMData {
  projects: PerfexProject[];
  invoices: PerfexInvoice[];
  estimates: PerfexEstimate[];
  tickets: PerfexTicket[];
  dashboard: {
    totalProjects: number;
    totalInvoices: number;
    pendingInvoices: number;
    openTickets: number;
  } | null;
}

// ==================== API HELPER ====================

async function perfexFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  userAuth?: { userType: string; userId: string }
): Promise<T | null> {
  const url = `${PERFEX_CONFIG.baseUrl}${PERFEX_CONFIG.apiVersion}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': PERFEX_CONFIG.apiKey,
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (userAuth) {
    headers['X-User-Type'] = userAuth.userType;
    headers['X-User-Id'] = userAuth.userId;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PERFEX_CONFIG.timeout);

  try {
    console.log(`[DataSync] Perfex ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('[DataSync] Perfex returned non-JSON response');
      return null;
    }

    const data = await response.json();
    
    if (data.status === false || data.error) {
      console.warn('[DataSync] Perfex API error:', data.error || data.message);
      return null;
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.warn('[DataSync] Perfex request timeout');
    } else {
      console.warn('[DataSync] Perfex request failed:', error.message);
    }
    return null;
  }
}

// ==================== SYNC SERVICE ====================

class DataSyncService {
  private syncStatus: SyncStatus = {
    lastSync: null,
    perfexLinked: false,
    mainBackendLinked: false,
    dataVersion: '1.0',
  };

  private cachedData: SyncedCRMData | null = null;

  /**
   * Khởi tạo service, load trạng thái sync từ storage
   */
  async initialize(): Promise<void> {
    try {
      const statusJson = await getItem(SYNC_STORAGE_KEYS.SYNC_STATUS);
      if (statusJson) {
        this.syncStatus = JSON.parse(statusJson);
      }
      
      const cachedJson = await getItem(SYNC_STORAGE_KEYS.CACHED_DATA);
      if (cachedJson) {
        this.cachedData = JSON.parse(cachedJson);
      }
      
      console.log('[DataSync] Initialized, last sync:', 
        this.syncStatus.lastSync ? new Date(this.syncStatus.lastSync).toISOString() : 'never');
    } catch (error) {
      console.warn('[DataSync] Failed to load sync status:', error);
    }
  }

  /**
   * Đồng bộ user sau khi đăng nhập thành công từ main backend
   * Tự động tìm/tạo user tương ứng trên Perfex CRM
   */
  async syncUserAfterLogin(mainUser: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
  }): Promise<SyncedUserData> {
    console.log('[DataSync] Syncing user after login:', mainUser.email);
    
    const result: SyncedUserData = {
      mainUser,
      perfexUser: null,
      linkedAccounts: false,
    };

    try {
      // Thử đăng nhập vào Perfex CRM với cùng email/password
      // Hoặc tìm contact by email
      const perfexUser = await this.findOrCreatePerfexUser(mainUser);
      
      if (perfexUser) {
        result.perfexUser = perfexUser;
        result.linkedAccounts = true;
        
        // Lưu Perfex user info
        await setItem(SYNC_STORAGE_KEYS.PERFEX_USER, JSON.stringify(perfexUser));
        
        console.log('[DataSync] ✅ Linked with Perfex CRM:', perfexUser.fullName);
      } else {
        console.log('[DataSync] ⚠️ Could not link with Perfex CRM');
      }

      // Cập nhật sync status
      this.syncStatus.mainBackendLinked = true;
      this.syncStatus.perfexLinked = result.linkedAccounts;
      this.syncStatus.lastSync = Date.now();
      await this.saveSyncStatus();

    } catch (error) {
      console.error('[DataSync] Sync error:', error);
    }

    return result;
  }

  /**
   * Tìm hoặc tạo user trên Perfex CRM
   */
  private async findOrCreatePerfexUser(mainUser: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<SyncedUserData['perfexUser']> {
    // 1. Thử tìm contact by email trong Perfex
    const searchResult = await perfexFetch<any>(`/contacts/search?email=${encodeURIComponent(mainUser.email)}`);
    
    if (searchResult?.data?.length > 0) {
      const contact = searchResult.data[0];
      return {
        id: contact.id,
        contactId: contact.id,
        customerId: contact.userid,
        email: contact.email,
        fullName: `${contact.firstname} ${contact.lastname}`.trim(),
        company: contact.company,
        isStaff: false,
      };
    }

    // 2. Nếu không tìm thấy, thử tìm staff by email
    const staffResult = await perfexFetch<any>(`/staff/search?email=${encodeURIComponent(mainUser.email)}`);
    
    if (staffResult?.data?.length > 0) {
      const staff = staffResult.data[0];
      return {
        id: staff.staffid,
        contactId: null,
        customerId: null,
        email: staff.email,
        fullName: `${staff.firstname} ${staff.lastname}`.trim(),
        isStaff: true,
      };
    }

    // 3. Nếu vẫn không tìm thấy, có thể tự động tạo contact mới
    // (Tùy thuộc vào yêu cầu business)
    console.log('[DataSync] User not found in Perfex CRM, consider auto-creating');
    
    // Uncomment để tự động tạo:
    // return await this.createPerfexContact(mainUser);
    
    return null;
  }

  /**
   * Tạo contact mới trên Perfex CRM
   */
  private async createPerfexContact(data: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<SyncedUserData['perfexUser']> {
    const nameParts = data.name.split(' ');
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(' ') || firstname;

    const result = await perfexFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: Math.random().toString(36).slice(-12), // Random password
        firstname,
        lastname,
        phone: data.phone,
      }),
    });

    if (result?.success && result.contactId) {
      return {
        id: result.contactId,
        contactId: result.contactId,
        customerId: result.customerId,
        email: data.email,
        fullName: data.name,
        isStaff: false,
      };
    }

    return null;
  }

  /**
   * Lấy dữ liệu CRM từ Perfex
   */
  async fetchPerfexCRMData(forceRefresh = false): Promise<SyncedCRMData | null> {
    // Check cache
    if (!forceRefresh && this.cachedData && this.isCacheValid()) {
      console.log('[DataSync] Using cached CRM data');
      return this.cachedData;
    }

    const perfexUserJson = await getItem(SYNC_STORAGE_KEYS.PERFEX_USER);
    if (!perfexUserJson) {
      console.warn('[DataSync] No Perfex user linked');
      return null;
    }

    const perfexUser = JSON.parse(perfexUserJson);
    const userAuth = {
      userType: perfexUser.isStaff ? 'staff' : 'contact',
      userId: perfexUser.isStaff ? perfexUser.id : perfexUser.contactId,
    };

    console.log('[DataSync] Fetching CRM data from Perfex...');

    // Fetch all data in parallel
    const [projects, invoices, estimates, tickets, dashboard] = await Promise.all([
      perfexFetch<any>('/projects', {}, userAuth),
      perfexFetch<any>('/invoices', {}, userAuth),
      perfexFetch<any>('/estimates', {}, userAuth),
      perfexFetch<any>('/tickets', {}, userAuth),
      perfexFetch<any>('/dashboard', {}, userAuth),
    ]);

    const crmData: SyncedCRMData = {
      projects: this.mapProjects(projects?.data || []),
      invoices: this.mapInvoices(invoices?.data || []),
      estimates: this.mapEstimates(estimates?.data || []),
      tickets: this.mapTickets(tickets?.data || []),
      dashboard: dashboard?.data || null,
    };

    // Cache data
    this.cachedData = crmData;
    await setItem(SYNC_STORAGE_KEYS.CACHED_DATA, JSON.stringify(crmData));
    
    console.log('[DataSync] ✅ CRM data fetched:', {
      projects: crmData.projects.length,
      invoices: crmData.invoices.length,
      estimates: crmData.estimates.length,
      tickets: crmData.tickets.length,
    });

    return crmData;
  }

  /**
   * Đồng bộ project từ main backend sang Perfex CRM
   */
  async syncProjectToPerfex(project: {
    name: string;
    description?: string;
    customerId?: string;
    startDate?: string;
    deadline?: string;
  }): Promise<{ success: boolean; perfexProjectId?: string }> {
    const perfexUserJson = await getItem(SYNC_STORAGE_KEYS.PERFEX_USER);
    if (!perfexUserJson) {
      return { success: false };
    }

    const perfexUser = JSON.parse(perfexUserJson);
    
    const result = await perfexFetch<any>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: project.name,
        description: project.description,
        clientid: perfexUser.customerId,
        start_date: project.startDate,
        deadline: project.deadline,
        billing_type: 1, // Fixed rate
        status: 1, // Not started
      }),
    }, {
      userType: 'staff',
      userId: '1', // Admin or system user
    });

    if (result?.success) {
      console.log('[DataSync] ✅ Project synced to Perfex:', result.id);
      return { success: true, perfexProjectId: result.id };
    }

    return { success: false };
  }

  /**
   * Đồng bộ invoice từ main backend sang Perfex CRM
   */
  async syncInvoiceToPerfex(invoice: {
    projectId?: string;
    customerId: string;
    items: {
      description: string;
      qty: number;
      rate: number;
    }[];
    dueDate?: string;
  }): Promise<{ success: boolean; perfexInvoiceId?: string }> {
    const result = await perfexFetch<any>('/invoices', {
      method: 'POST',
      body: JSON.stringify({
        clientid: invoice.customerId,
        project_id: invoice.projectId,
        duedate: invoice.dueDate,
        newitems: invoice.items.map(item => ({
          description: item.description,
          qty: item.qty,
          rate: item.rate,
        })),
        status: 1, // Unpaid
      }),
    }, {
      userType: 'staff',
      userId: '1',
    });

    if (result?.success) {
      console.log('[DataSync] ✅ Invoice synced to Perfex:', result.id);
      return { success: true, perfexInvoiceId: result.id };
    }

    return { success: false };
  }

  // ==================== HELPERS ====================

  private mapProjects(data: any[]): PerfexProject[] {
    return data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: this.getProjectStatusText(p.status),
      startDate: p.start_date,
      deadline: p.deadline,
      cost: parseFloat(p.project_cost) || 0,
      billingType: p.billing_type === 1 ? 'fixed' : 'hourly',
    }));
  }

  private mapInvoices(data: any[]): PerfexInvoice[] {
    return data.map(i => ({
      id: i.id,
      number: i.number,
      total: parseFloat(i.total) || 0,
      status: this.getInvoiceStatusText(i.status),
      dueDate: i.duedate,
      paidDate: i.datepaid,
    }));
  }

  private mapEstimates(data: any[]): PerfexEstimate[] {
    return data.map(e => ({
      id: e.id,
      number: e.number,
      total: parseFloat(e.total) || 0,
      status: this.getEstimateStatusText(e.status),
      expiryDate: e.expirydate,
    }));
  }

  private mapTickets(data: any[]): PerfexTicket[] {
    return data.map(t => ({
      id: t.ticketid,
      subject: t.subject,
      message: t.message,
      status: this.getTicketStatusText(t.status),
      priority: this.getTicketPriorityText(t.priority),
      lastReply: t.lastreply,
    }));
  }

  private getProjectStatusText(status: number): string {
    const statuses: Record<number, string> = {
      1: 'Chưa bắt đầu',
      2: 'Đang tiến hành',
      3: 'Đang chờ',
      4: 'Hoàn thành',
      5: 'Đã hủy',
    };
    return statuses[status] || 'Không xác định';
  }

  private getInvoiceStatusText(status: number): string {
    const statuses: Record<number, string> = {
      1: 'Chưa thanh toán',
      2: 'Đã thanh toán',
      3: 'Thanh toán một phần',
      4: 'Quá hạn',
      5: 'Đã hủy',
    };
    return statuses[status] || 'Không xác định';
  }

  private getEstimateStatusText(status: number): string {
    const statuses: Record<number, string> = {
      1: 'Nháp',
      2: 'Đã gửi',
      3: 'Đã chấp nhận',
      4: 'Từ chối',
      5: 'Hết hạn',
    };
    return statuses[status] || 'Không xác định';
  }

  private getTicketPriorityText(priority: number): string {
    const priorities: Record<number, string> = {
      1: 'Thấp',
      2: 'Trung bình',
      3: 'Cao',
    };
    return priorities[priority] || 'Trung bình';
  }

  private getTicketStatusText(status: number): string {
    const statuses: Record<number, string> = {
      1: 'Mở',
      2: 'Đang xử lý',
      3: 'Đã trả lời',
      4: 'Đang chờ',
      5: 'Đã đóng',
    };
    return statuses[status] || 'Không xác định';
  }

  private isCacheValid(): boolean {
    const cacheTimeout = 5 * 60 * 1000; // 5 minutes
    return this.syncStatus.lastSync !== null && 
           (Date.now() - this.syncStatus.lastSync) < cacheTimeout;
  }

  private async saveSyncStatus(): Promise<void> {
    await setItem(SYNC_STORAGE_KEYS.SYNC_STATUS, JSON.stringify(this.syncStatus));
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get cached data
   */
  getCachedData(): SyncedCRMData | null {
    return this.cachedData;
  }

  /**
   * Clear all sync data (on logout)
   */
  async clearSyncData(): Promise<void> {
    this.syncStatus = {
      lastSync: null,
      perfexLinked: false,
      mainBackendLinked: false,
      dataVersion: '1.0',
    };
    this.cachedData = null;
    
    await Promise.all([
      setItem(SYNC_STORAGE_KEYS.SYNC_STATUS, JSON.stringify(this.syncStatus)),
      setItem(SYNC_STORAGE_KEYS.PERFEX_USER, ''),
      setItem(SYNC_STORAGE_KEYS.CACHED_DATA, ''),
    ]);
    
    console.log('[DataSync] Cleared all sync data');
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();
export default dataSyncService;
