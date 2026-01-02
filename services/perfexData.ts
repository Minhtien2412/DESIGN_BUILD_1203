/**
 * Perfex CRM Data Service
 * =========================
 * 
 * Service để lấy dữ liệu từ Perfex CRM thông qua Module API (Themesic)
 * 
 * API Base URL: /api/
 * Auth: Header "authtoken" với JWT Token
 * 
 * Endpoints hoạt động:
 * - GET /api/customers ✅
 * - GET /api/projects ✅
 * 
 * @author Mobile App Team
 * @since 2025-12-30
 */

import ENV from '@/config/env';

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  authToken: ENV.PERFEX_API_TOKEN || '',
  timeout: 30000,
};

// ==================== TYPES ====================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: number;
  statusName: string;
  startDate: string;
  deadline: string;
  customerId: string;
  billingType: string;
  totalBilled: number;
  progress: number;
  members: ProjectMember[];
}

export interface ProjectMember {
  staffId: string;
  name: string;
  email: string;
  role: string;
}

export interface Customer {
  userid: string;
  company: string;
  phonenumber: string;
  country: string;
  city: string;
  state: string;
  address: string;
  website: string;
  datecreated: string;
  active: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  projectId?: string;
  date: string;
  dueDate: string;
  total: number;
  status: number;
  statusName: string;
}

export interface Estimate {
  id: string;
  number: string;
  customerId: string;
  date: string;
  total: number;
  status: number;
  statusName: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: number;
  statusName: string;
  priority: number;
  startDate: string;
  dueDate: string;
  projectId?: string;
  progress: number;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalCustomers: number;
}

// ==================== HELPER FUNCTIONS ====================

function getProjectStatusName(status: number): string {
  const statusMap: Record<number, string> = {
    1: 'Chưa bắt đầu',
    2: 'Đang thực hiện',
    3: 'Tạm dừng',
    4: 'Hoàn thành',
    5: 'Đã hủy',
  };
  return statusMap[status] || 'Không xác định';
}

// ==================== ERROR CLASS ====================

export class PerfexDataError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'PerfexDataError';
    this.code = code;
    this.status = status;
  }
}

// ==================== API HELPER ====================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PERFEX_CONFIG.baseUrl}/api/${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'authtoken': PERFEX_CONFIG.authToken,
    ...(options.headers as Record<string, string> || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PERFEX_CONFIG.timeout);

  try {
    console.log(`[PerfexData] ${options.method || 'GET'} /api/${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new PerfexDataError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new PerfexDataError(
          `Invalid JSON: ${text.substring(0, 200)}`,
          'INVALID_RESPONSE',
          response.status
        );
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new PerfexDataError('Request timeout', 'TIMEOUT', 408);
    }
    
    if (error instanceof PerfexDataError) {
      throw error;
    }
    
    throw new PerfexDataError(
      error.message || 'Network error',
      'NETWORK_ERROR',
      0
    );
  }
}

// ==================== DATA SERVICE ====================

export const PerfexDataService = {
  // ========== PROJECTS ==========
  
  /**
   * Lấy danh sách dự án
   */
  getProjects: async (): Promise<{ data: Project[]; total: number }> => {
    const response = await apiFetch<any>('projects');
    
    // API có thể trả về array hoặc object có .value
    const projectsRaw = Array.isArray(response) 
      ? response 
      : (response.value || [response]);
    
    const projects: Project[] = projectsRaw.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      status: parseInt(p.status) || 0,
      statusName: getProjectStatusName(parseInt(p.status) || 0),
      startDate: p.start_date,
      deadline: p.deadline || '',
      customerId: p.clientid,
      billingType: p.billing_type,
      totalBilled: parseFloat(p.project_cost) || 0,
      progress: parseInt(p.progress) || 0,
      members: [],
    }));

    return {
      data: projects,
      total: response.Count || projects.length,
    };
  },

  /**
   * Lấy chi tiết dự án
   */
  getProject: async (projectId: string): Promise<Project | null> => {
    try {
      const response = await apiFetch<any>(`projects/${projectId}`);
      if (!response) return null;

      return {
        id: response.id,
        name: response.name,
        description: response.description || '',
        status: parseInt(response.status) || 0,
        statusName: getProjectStatusName(parseInt(response.status) || 0),
        startDate: response.start_date,
        deadline: response.deadline || '',
        customerId: response.clientid,
        billingType: response.billing_type,
        totalBilled: parseFloat(response.project_cost) || 0,
        progress: parseInt(response.progress) || 0,
        members: [],
      };
    } catch {
      return null;
    }
  },

  // ========== CUSTOMERS ==========

  /**
   * Lấy danh sách khách hàng
   */
  getCustomers: async (): Promise<Customer[]> => {
    const response = await apiFetch<Customer[]>('customers');
    return Array.isArray(response) ? response : [];
  },

  /**
   * Lấy chi tiết khách hàng
   */
  getCustomer: async (customerId: string): Promise<Customer | null> => {
    try {
      return await apiFetch<Customer>(`customers/${customerId}`);
    } catch {
      return null;
    }
  },

  // ========== DASHBOARD ==========

  /**
   * Lấy thống kê dashboard
   */
  getDashboard: async (): Promise<DashboardStats> => {
    try {
      const [projects, customers] = await Promise.all([
        PerfexDataService.getProjects(),
        PerfexDataService.getCustomers(),
      ]);

      const activeProjects = projects.data.filter(p => p.status === 2).length;

      return {
        totalProjects: projects.total,
        activeProjects,
        totalCustomers: customers.length,
      };
    } catch {
      return {
        totalProjects: 0,
        activeProjects: 0,
        totalCustomers: 0,
      };
    }
  },

  // ========== NOT AVAILABLE (Stub methods) ==========

  /**
   * Lấy danh sách hóa đơn (Not available in current API)
   */
  getInvoices: async (): Promise<{ data: Invoice[]; total: number }> => {
    console.warn('[PerfexData] /invoices endpoint not available');
    return { data: [], total: 0 };
  },

  /**
   * Lấy danh sách báo giá (Not available)
   */
  getEstimates: async (): Promise<{ data: Estimate[]; total: number }> => {
    console.warn('[PerfexData] /estimates endpoint not available');
    return { data: [], total: 0 };
  },

  /**
   * Lấy danh sách công việc (Not available)
   */
  getTasks: async (): Promise<{ data: Task[]; total: number }> => {
    console.warn('[PerfexData] /tasks endpoint not available');
    return { data: [], total: 0 };
  },

  // ========== UTILITY ==========

  /**
   * Test API connection
   */
  testConnection: async (): Promise<boolean> => {
    try {
      await PerfexDataService.getCustomers();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Lấy config hiện tại
   */
  getConfig: () => ({
    baseUrl: PERFEX_CONFIG.baseUrl,
    hasToken: !!PERFEX_CONFIG.authToken,
  }),
};

export default PerfexDataService;
