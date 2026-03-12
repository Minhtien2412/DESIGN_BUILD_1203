/**
 * Perfex CRM API Service
 * ========================
 * 
 * Sử dụng Module "API" (Themesic Interactive) với JWT Token
 * 
 * API Endpoints đã test hoạt động:
 * - GET /api/customers - Danh sách khách hàng ✅
 * - GET /api/projects - Danh sách dự án ✅
 * 
 * Authentication: Header "authtoken" với JWT Token
 * 
 * @author ThietKeResort Team
 * @created 2025-12-30
 */

import ENV from '@/config/env';
import { deleteItem, getItem, setItem } from '@/utils/storage';

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  // JWT Token từ Module API (Themesic)
  authToken: ENV.PERFEX_API_TOKEN || '',
  timeout: 30000,
};

// Storage keys
const STORAGE_KEYS = {
  PERFEX_USER: 'perfex_crm_user',
  PERFEX_CUSTOMER_ID: 'perfex_crm_customer_id',
  PERFEX_CONTACT_ID: 'perfex_crm_contact_id',
  PERFEX_SESSION: 'perfex_crm_session',
};

// ==================== TYPES ====================

export interface PerfexCustomer {
  userid: string;
  company: string;
  vat: string;
  phonenumber: string;
  country: string;
  city: string;
  zip: string;
  state: string;
  address: string;
  website: string;
  datecreated: string;
  active: string;
  leadid: string | null;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  longitude: string | null;
  latitude: string | null;
  default_language: string;
  default_currency: string;
  show_primary_contact: string;
  stripe_id: string | null;
  registration_confirmed: string;
  addedfrom: string;
}

export interface PerfexProject {
  id: string;
  name: string;
  description: string;
  status: string;
  clientid: string;
  billing_type: string;
  start_date: string;
  deadline: string | null;
  project_created: string;
  date_finished: string | null;
  progress: string;
  progress_from_tasks: string;
  project_cost: string;
  project_rate_per_hour: string;
  estimated_hours: string | null;
  addedfrom: string;
  contact_notification: string;
  // Customer info (joined)
  userid: string;
  company: string;
  phonenumber: string;
  city: string;
  address: string;
}

export interface PerfexContact {
  id: string;
  userid: string; // customer id
  is_primary: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  title: string;
  datecreated: string;
  password: string;
  new_pass_key: string | null;
  new_pass_key_requested: string | null;
  email_verified_at: string | null;
  email_verification_key: string | null;
  active: string;
  profile_image: string | null;
  direction: string;
  invoice_emails: string;
  estimate_emails: string;
  credit_note_emails: string;
  contract_emails: string;
  task_emails: string;
  project_emails: string;
  ticket_emails: string;
}

export interface PerfexUser {
  id: string;
  customerId: string;
  contactId: string;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  active: boolean;
}

// ==================== ERROR CLASS ====================

export class PerfexCrmError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'PerfexCrmError';
    this.code = code;
    this.status = status;
  }
}

// ==================== API HELPER ====================

/**
 * Gọi Perfex CRM API endpoint
 * URL: /api/{endpoint}
 * Auth: Header "authtoken" với JWT Token
 */
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
    console.log(`[PerfexCRM] ${options.method || 'GET'} /api/${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check HTTP status
    if (!response.ok) {
      throw new PerfexCrmError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new PerfexCrmError(
          `Invalid JSON response: ${text.substring(0, 200)}`,
          'INVALID_RESPONSE',
          response.status
        );
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new PerfexCrmError('Request timeout', 'TIMEOUT', 408);
    }
    
    if (error instanceof PerfexCrmError) {
      throw error;
    }
    
    throw new PerfexCrmError(
      error.message || 'Network error',
      'NETWORK_ERROR',
      0
    );
  }
}

// ==================== SERVICE ====================

export const PerfexCrmService = {
  // ==================== CUSTOMERS ====================

  /**
   * Lấy danh sách khách hàng
   */
  getCustomers: async (): Promise<PerfexCustomer[]> => {
    const data = await apiFetch<PerfexCustomer[]>('customers');
    return Array.isArray(data) ? data : [];
  },

  /**
   * Lấy chi tiết khách hàng theo ID
   */
  getCustomer: async (customerId: string): Promise<PerfexCustomer | null> => {
    try {
      const data = await apiFetch<PerfexCustomer>(`customers/${customerId}`);
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Tìm khách hàng theo email
   */
  findCustomerByEmail: async (email: string): Promise<PerfexCustomer | null> => {
    const customers = await PerfexCrmService.getCustomers();
    // Need to get contacts to match email
    // For now, return first match by company (placeholder)
    return customers.find(c => c.website?.includes(email.split('@')[1])) || null;
  },

  // ==================== PROJECTS ====================

  /**
   * Lấy danh sách dự án
   */
  getProjects: async (): Promise<PerfexProject[]> => {
    const response = await apiFetch<{ value: PerfexProject[]; Count: number }>('projects');
    return response.value || [];
  },

  /**
   * Lấy chi tiết dự án theo ID
   */
  getProject: async (projectId: string): Promise<PerfexProject | null> => {
    try {
      const data = await apiFetch<PerfexProject>(`projects/${projectId}`);
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Lấy dự án theo khách hàng
   */
  getProjectsByCustomer: async (customerId: string): Promise<PerfexProject[]> => {
    const projects = await PerfexCrmService.getProjects();
    return projects.filter(p => p.clientid === customerId || p.userid === customerId);
  },

  // ==================== CONTACTS ====================

  /**
   * Lấy danh sách contacts
   */
  getContacts: async (): Promise<PerfexContact[]> => {
    try {
      const data = await apiFetch<PerfexContact[]>('contacts');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * Tìm contact theo email
   */
  findContactByEmail: async (email: string): Promise<PerfexContact | null> => {
    const contacts = await PerfexCrmService.getContacts();
    return contacts.find(c => c.email === email) || null;
  },

  // ==================== AUTHENTICATION (Custom) ====================

  /**
   * Đăng nhập bằng email
   * Lưu ý: Module API không có endpoint login, chúng ta tìm contact theo email
   */
  loginByEmail: async (email: string): Promise<PerfexUser | null> => {
    try {
      // Find contact by email
      const contact = await PerfexCrmService.findContactByEmail(email);
      if (!contact) {
        throw new PerfexCrmError('Email không tồn tại trong hệ thống', 'EMAIL_NOT_FOUND', 404);
      }

      // Get customer info
      const customer = await PerfexCrmService.getCustomer(contact.userid);
      
      const user: PerfexUser = {
        id: contact.id,
        customerId: contact.userid,
        contactId: contact.id,
        email: contact.email,
        firstname: contact.firstname,
        lastname: contact.lastname,
        fullName: `${contact.firstname} ${contact.lastname}`.trim(),
        phone: contact.phonenumber,
        company: customer?.company || '',
        address: customer?.address || '',
        city: customer?.city || '',
        active: contact.active === '1',
      };

      // Save to storage
      await setItem(STORAGE_KEYS.PERFEX_USER, JSON.stringify(user));
      await setItem(STORAGE_KEYS.PERFEX_CUSTOMER_ID, contact.userid);
      await setItem(STORAGE_KEYS.PERFEX_CONTACT_ID, contact.id);
      await setItem(STORAGE_KEYS.PERFEX_SESSION, Date.now().toString());

      console.log('[PerfexCRM] Login successful:', email);
      return user;
    } catch (error) {
      console.error('[PerfexCRM] Login error:', error);
      throw error;
    }
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    await deleteItem(STORAGE_KEYS.PERFEX_USER);
    await deleteItem(STORAGE_KEYS.PERFEX_CUSTOMER_ID);
    await deleteItem(STORAGE_KEYS.PERFEX_CONTACT_ID);
    await deleteItem(STORAGE_KEYS.PERFEX_SESSION);
    console.log('[PerfexCRM] Logout successful');
  },

  /**
   * Lấy user đang đăng nhập
   */
  getCurrentUser: async (): Promise<PerfexUser | null> => {
    try {
      const userJson = await getItem(STORAGE_KEYS.PERFEX_USER);
      if (!userJson) return null;
      return JSON.parse(userJson) as PerfexUser;
    } catch {
      return null;
    }
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isLoggedIn: async (): Promise<boolean> => {
    const user = await PerfexCrmService.getCurrentUser();
    return user !== null;
  },

  /**
   * Lấy dự án của user hiện tại
   */
  getMyProjects: async (): Promise<PerfexProject[]> => {
    const customerId = await getItem(STORAGE_KEYS.PERFEX_CUSTOMER_ID);
    if (!customerId) return [];
    return PerfexCrmService.getProjectsByCustomer(customerId);
  },

  // ==================== UTILITY ====================

  /**
   * Test API connection
   */
  testConnection: async (): Promise<boolean> => {
    try {
      await PerfexCrmService.getCustomers();
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

export default PerfexCrmService;
