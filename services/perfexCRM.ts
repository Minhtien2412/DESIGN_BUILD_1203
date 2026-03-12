/**
 * Perfex CRM Integration Service
 * Kết nối với Perfex CRM để quản lý users, projects, tasks, tiến độ
 * 
 * Setup Perfex CRM:
 * 1. Tạo API Token trong Perfex: Setup > Settings > API
 * 2. Cấu hình PERFEX_CRM_URL và PERFEX_API_TOKEN trong .env
 * 
 * @author ThietKeResort Team
 * @updated 2025-12-30
 */

import ENV from '@/config/env';

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  apiToken: ENV.PERFEX_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibmhheGluaGQiLCJuYW1lIjoidGhpZXRrZXJlc29ydCIsIkFQSV9USU1FIjoxNzY3MDYzNzE1fQ.L9Mcg_xEOdcEYXbz9BprB93RD7ZuonhsshYPPInQm4Q',
  timeout: 30000,
  // Sử dụng Official API (API Module đã kích hoạt)
  // Tham khảo: https://perfexcrm.themesic.com/apiguide/
  useCustomApi: false,
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
  active: number;
  leadid?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  longitude?: string;
  latitude?: string;
  default_language?: string;
  default_currency?: number;
  show_primary_contact?: number;
  stripe_id?: string;
  registration_confirmed?: number;
  addedfrom?: number;
}

export interface PerfexContact {
  id: string;
  userid: string;
  is_primary: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  title: string;
  datecreated: string;
  password?: string;
  new_pass_key?: string;
  new_pass_key_requested?: string;
  email_verified_at?: string;
  email_verification_key?: string;
  last_ip?: string;
  last_login?: string;
  last_password_change?: string;
  active: number;
  profile_image?: string;
  direction?: string;
  invoice_emails?: number;
  estimate_emails?: number;
  credit_note_emails?: number;
  contract_emails?: number;
  task_emails?: number;
  project_emails?: number;
  ticket_emails?: number;
}

export interface PerfexProject {
  id: string;
  name: string;
  description: string;
  status: number; // 1=Not Started, 2=In Progress, 3=On Hold, 4=Cancelled, 5=Finished
  clientid: string;
  billing_type: number;
  start_date: string;
  deadline?: string;
  project_created: string;
  date_finished?: string;
  progress: number;
  progress_from_tasks: number;
  project_cost?: string;
  project_rate_per_hour?: string;
  estimated_hours?: string;
  addedfrom: number;
  contact_notification?: number;
  notify_contacts?: string;
}

export interface PerfexTask {
  id: string;
  name: string;
  description: string;
  priority: number; // 1=Low, 2=Medium, 3=High, 4=Urgent
  dateadded: string;
  startdate: string;
  duedate?: string;
  datefinished?: string;
  addedfrom: number;
  is_added_from_contact: number;
  status: number; // 1=Not Started, 2=In Progress, 3=Testing, 4=Awaiting Feedback, 5=Complete
  recurring_type?: string;
  repeat_every?: number;
  recurring?: number;
  is_recurring_from?: string;
  cycles?: number;
  total_cycles?: number;
  custom_recurring?: number;
  last_recurring_date?: string;
  rel_id?: string;
  rel_type?: string; // project, invoice, customer, etc.
  is_public: number;
  billable: number;
  billed: number;
  invoice_id?: number;
  hourly_rate?: string;
  milestone?: number;
  milestone_id?: number;
  progress?: number;
  kanban_order?: number;
  milestone_order?: number;
  visible_to_client: number;
  deadline_notified?: number;
}

export interface PerfexInvoice {
  id: string;
  sent: number;
  datesend?: string;
  clientid: string;
  deleted_customer_name?: string;
  number: number;
  prefix?: string;
  number_format: number;
  datecreated: string;
  date: string;
  duedate?: string;
  currency: number;
  subtotal: string;
  total_tax: string;
  total: string;
  adjustment?: string;
  addedfrom: number;
  hash: string;
  status: number; // 1=Unpaid, 2=Paid, 3=Partially Paid, 4=Overdue, 5=Cancelled, 6=Draft
  clientnote?: string;
  adminnote?: string;
  last_overdue_reminder?: string;
  cancel_overdue_reminders?: number;
  allowed_payment_modes?: string;
  token?: string;
  discount_percent?: string;
  discount_total?: string;
  discount_type?: string;
  recurring?: number;
  recurring_type?: string;
  custom_recurring?: number;
  cycles?: number;
  total_cycles?: number;
  is_recurring_from?: string;
  last_recurring_date?: string;
  terms?: string;
  sale_agent?: number;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  include_shipping?: number;
  show_shipping_on_invoice?: number;
  show_quantity_as?: number;
  project_id?: number;
  subscription_id?: number;
  short_link?: string;
}

export interface PerfexLead {
  id: string;
  hash: string;
  name: string;
  title?: string;
  company?: string;
  description?: string;
  country?: string;
  zip?: string;
  city?: string;
  state?: string;
  address?: string;
  assigned: number;
  dateadded: string;
  from_form_id?: number;
  status: number;
  source: number;
  lastcontact?: string;
  dateassigned?: string;
  last_status_change?: string;
  addedfrom: number;
  email?: string;
  website?: string;
  leadorder?: number;
  phonenumber?: string;
  date_converted?: string;
  lost: number;
  junk: number;
  last_lead_status?: number;
  is_imported_from_email_integration?: number;
  email_integration_uid?: string;
  is_public: number;
  default_language?: string;
  client_id?: number;
}

export interface PerfexEstimate {
  id: string;
  sent: number;
  datesend?: string;
  clientid: string;
  deleted_customer_name?: string;
  project_id?: number;
  number: number;
  prefix?: string;
  number_format: number;
  hash: string;
  datecreated: string;
  date: string;
  expirydate?: string;
  currency: number;
  subtotal: string;
  total_tax: string;
  total: string;
  adjustment?: string;
  addedfrom: number;
  status: number; // 1=Draft, 2=Sent, 3=Declined, 4=Accepted, 5=Expired
  clientnote?: string;
  adminnote?: string;
  discount_percent?: string;
  discount_total?: string;
  discount_type?: string;
  invoiceid?: number;
  invoiced_date?: string;
  terms?: string;
  reference_no?: string;
  sale_agent?: number;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  include_shipping?: number;
  show_shipping_on_estimate?: number;
  show_quantity_as?: number;
  pipeline_order?: number;
  is_expiry_notified?: number;
  acceptance_firstname?: string;
  acceptance_lastname?: string;
  acceptance_email?: string;
  acceptance_date?: string;
  acceptance_ip?: string;
  signature?: string;
  short_link?: string;
}

// API Response types
export interface PerfexAPIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PerfexListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== API CLIENT ====================

class PerfexAPIError extends Error {
  status?: number;
  code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'PerfexAPIError';
    this.status = status;
    this.code = code;
  }
}

async function perfexFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Sử dụng Custom API endpoint nếu được bật
  const apiPath = PERFEX_CONFIG.useCustomApi ? '/custom_api' : '/api';
  const url = `${PERFEX_CONFIG.baseUrl}${apiPath}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Custom API dùng X-API-Key header
    'X-API-Key': PERFEX_CONFIG.apiToken,
    // Official API dùng authtoken header
    'authtoken': PERFEX_CONFIG.apiToken,
    ...(options.headers as Record<string, string> || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PERFEX_CONFIG.timeout);

  try {
    console.log(`[PerfexCRM] ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new PerfexAPIError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data.code
      );
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new PerfexAPIError('Request timeout', 408, 'TIMEOUT');
    }
    
    if (error instanceof PerfexAPIError) {
      throw error;
    }
    
    throw new PerfexAPIError('Network error', 0, 'NETWORK_ERROR');
  }
}

// ==================== CUSTOMERS SERVICE ====================

export const PerfexCustomersService = {
  /**
   * Lấy danh sách khách hàng
   */
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return perfexFetch<PerfexListResponse<PerfexCustomer>>(
      `/customers${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết khách hàng
   */
  getById: async (id: string) => {
    return perfexFetch<PerfexCustomer>(`/customers/${id}`);
  },

  /**
   * Tạo khách hàng mới
   */
  create: async (data: Partial<PerfexCustomer>) => {
    return perfexFetch<PerfexCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật khách hàng
   */
  update: async (id: string, data: Partial<PerfexCustomer>) => {
    return perfexFetch<PerfexCustomer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa khách hàng
   */
  delete: async (id: string) => {
    return perfexFetch<{ success: boolean }>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Lấy contacts của khách hàng
   */
  getContacts: async (customerId: string) => {
    return perfexFetch<PerfexContact[]>(`/customers/${customerId}/contacts`);
  },

  /**
   * Sync user từ app sang Perfex CRM
   */
  syncFromApp: async (appUser: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    company?: string;
  }) => {
    // Kiểm tra customer đã tồn tại chưa (theo email)
    const existing = await PerfexCustomersService.getAll({ search: appUser.email });
    
    if (existing.data.length > 0) {
      // Update existing
      return PerfexCustomersService.update(existing.data[0].userid, {
        company: appUser.company || appUser.name,
        phonenumber: appUser.phone,
        address: appUser.address,
      });
    } else {
      // Create new
      return PerfexCustomersService.create({
        company: appUser.company || appUser.name,
        phonenumber: appUser.phone,
        address: appUser.address,
        active: 1,
      });
    }
  },
};

// ==================== CONTACTS SERVICE ====================

export const PerfexContactsService = {
  /**
   * Lấy tất cả contacts
   */
  getAll: async (params?: { page?: number; limit?: number; customer_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
    
    const query = queryParams.toString();
    return perfexFetch<PerfexListResponse<PerfexContact>>(
      `/contacts${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy contact theo ID
   */
  getById: async (id: string) => {
    return perfexFetch<PerfexContact>(`/contacts/${id}`);
  },

  /**
   * Tạo contact mới
   */
  create: async (customerId: string, data: Partial<PerfexContact>) => {
    return perfexFetch<PerfexContact>(`/customers/${customerId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật contact
   */
  update: async (id: string, data: Partial<PerfexContact>) => {
    return perfexFetch<PerfexContact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa contact
   */
  delete: async (id: string) => {
    return perfexFetch<{ success: boolean }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PROJECTS SERVICE ====================

export const PerfexProjectsService = {
  /**
   * Lấy danh sách projects
   */
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    clientid?: string;
    status?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.clientid) queryParams.append('clientid', params.clientid);
    if (params?.status) queryParams.append('status', params.status.toString());
    
    const query = queryParams.toString();
    return perfexFetch<PerfexListResponse<PerfexProject>>(
      `/projects${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết project
   */
  getById: async (id: string) => {
    return perfexFetch<PerfexProject>(`/projects/${id}`);
  },

  /**
   * Tạo project mới
   */
  create: async (data: Partial<PerfexProject>) => {
    return perfexFetch<PerfexProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật project
   */
  update: async (id: string, data: Partial<PerfexProject>) => {
    return perfexFetch<PerfexProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật tiến độ project
   */
  updateProgress: async (id: string, progress: number) => {
    return perfexFetch<PerfexProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  },

  /**
   * Lấy tasks của project
   */
  getTasks: async (projectId: string) => {
    return perfexFetch<PerfexTask[]>(`/projects/${projectId}/tasks`);
  },

  /**
   * Sync project từ app sang Perfex
   */
  syncFromApp: async (appProject: {
    id: string;
    name: string;
    description?: string;
    clientId: string;
    startDate: string;
    endDate?: string;
    progress: number;
    status: string;
  }) => {
    // Map app status to Perfex status
    const statusMap: Record<string, number> = {
      'not_started': 1,
      'in_progress': 2,
      'on_hold': 3,
      'cancelled': 4,
      'completed': 5,
    };

    const perfexData: Partial<PerfexProject> = {
      name: appProject.name,
      description: appProject.description,
      clientid: appProject.clientId,
      start_date: appProject.startDate,
      deadline: appProject.endDate,
      progress: appProject.progress,
      status: statusMap[appProject.status] || 1,
    };

    // Check if project exists (by name and client)
    const existing = await PerfexProjectsService.getAll({ 
      clientid: appProject.clientId 
    });
    
    const existingProject = existing.data.find(p => p.name === appProject.name);
    
    if (existingProject) {
      return PerfexProjectsService.update(existingProject.id, perfexData);
    } else {
      return PerfexProjectsService.create(perfexData);
    }
  },
};

// ==================== TASKS SERVICE ====================

export const PerfexTasksService = {
  /**
   * Lấy danh sách tasks
   */
  getAll: async (params?: { 
    page?: number; 
    limit?: number;
    rel_type?: string;
    rel_id?: string;
    status?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rel_type) queryParams.append('rel_type', params.rel_type);
    if (params?.rel_id) queryParams.append('rel_id', params.rel_id);
    if (params?.status) queryParams.append('status', params.status.toString());
    
    const query = queryParams.toString();
    return perfexFetch<PerfexListResponse<PerfexTask>>(
      `/tasks${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết task
   */
  getById: async (id: string) => {
    return perfexFetch<PerfexTask>(`/tasks/${id}`);
  },

  /**
   * Tạo task mới
   */
  create: async (data: Partial<PerfexTask>) => {
    return perfexFetch<PerfexTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật task
   */
  update: async (id: string, data: Partial<PerfexTask>) => {
    return perfexFetch<PerfexTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Đánh dấu task hoàn thành
   */
  markComplete: async (id: string) => {
    return perfexFetch<PerfexTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 5 }), // 5 = Complete
    });
  },

  /**
   * Xóa task
   */
  delete: async (id: string) => {
    return perfexFetch<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Sync task từ app sang Perfex
   */
  syncFromApp: async (appTask: {
    name: string;
    description?: string;
    projectId: string;
    startDate: string;
    dueDate?: string;
    priority: string;
    status: string;
  }) => {
    const priorityMap: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'urgent': 4,
    };

    const statusMap: Record<string, number> = {
      'not_started': 1,
      'in_progress': 2,
      'testing': 3,
      'awaiting_feedback': 4,
      'complete': 5,
    };

    return PerfexTasksService.create({
      name: appTask.name,
      description: appTask.description,
      rel_type: 'project',
      rel_id: appTask.projectId,
      startdate: appTask.startDate,
      duedate: appTask.dueDate,
      priority: priorityMap[appTask.priority] || 2,
      status: statusMap[appTask.status] || 1,
      is_public: 0,
      billable: 0,
      visible_to_client: 1,
    });
  },
};

// ==================== INVOICES SERVICE ====================

export const PerfexInvoicesService = {
  /**
   * Lấy danh sách invoices
   */
  getAll: async (params?: { 
    page?: number; 
    limit?: number;
    clientid?: string;
    status?: number;
    project_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.clientid) queryParams.append('clientid', params.clientid);
    if (params?.status) queryParams.append('status', params.status.toString());
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    
    const query = queryParams.toString();
    return perfexFetch<PerfexListResponse<PerfexInvoice>>(
      `/invoices${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết invoice
   */
  getById: async (id: string) => {
    return perfexFetch<PerfexInvoice>(`/invoices/${id}`);
  },

  /**
   * Tạo invoice mới
   */
  create: async (data: Partial<PerfexInvoice> & { items: any[] }) => {
    return perfexFetch<PerfexInvoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật invoice
   */
  update: async (id: string, data: Partial<PerfexInvoice>) => {
    return perfexFetch<PerfexInvoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Gửi invoice cho khách hàng
   */
  send: async (id: string) => {
    return perfexFetch<{ success: boolean }>(`/invoices/${id}/send`, {
      method: 'POST',
    });
  },

  /**
   * Đánh dấu đã thanh toán
   */
  markPaid: async (id: string, paymentData: {
    amount: number;
    paymentmode: string;
    date: string;
    note?: string;
  }) => {
    return perfexFetch<{ success: boolean }>(`/invoices/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};

// ==================== LEADS SERVICE ====================

export const PerfexLeadsService = {
  /**
   * Lấy danh sách leads
   */
  getAll: async (params?: { 
    page?: number; 
    limit?: number;
    status?: number;
    source?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status.toString());
    if (params?.source) queryParams.append('source', params.source.toString());
    
    const query = queryParams.toString();
    return perfexFetch<PerfexListResponse<PerfexLead>>(
      `/leads${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết lead
   */
  getById: async (id: string) => {
    return perfexFetch<PerfexLead>(`/leads/${id}`);
  },

  /**
   * Tạo lead mới
   */
  create: async (data: Partial<PerfexLead>) => {
    return perfexFetch<PerfexLead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật lead
   */
  update: async (id: string, data: Partial<PerfexLead>) => {
    return perfexFetch<PerfexLead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Convert lead thành customer
   */
  convertToCustomer: async (id: string) => {
    return perfexFetch<{ customer_id: string }>(`/leads/${id}/convert`, {
      method: 'POST',
    });
  },

  /**
   * Tạo lead từ app registration
   */
  createFromAppUser: async (user: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    source?: string;
  }) => {
    return PerfexLeadsService.create({
      name: user.name,
      email: user.email,
      phonenumber: user.phone,
      company: user.company,
      source: 1, // Default source, configure in Perfex
      status: 1, // Default status
      is_public: 0,
    });
  },
};

// ==================== ESTIMATES SERVICE ====================

export const PerfexEstimatesService = {
  /**
   * Lấy danh sách estimates
   */
  getAll: async (params?: { 
    page?: number; 
    limit?: number;
    clientid?: string;
    status?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.clientid) queryParams.append('clientid', params.clientid);
    if (params?.status) queryParams.append('status', params.status.toString());
    
    const query = queryParams.toString();
    return perfexFetch<PerfexListResponse<PerfexEstimate>>(
      `/estimates${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết estimate
   */
  getById: async (id: string) => {
    return perfexFetch<PerfexEstimate>(`/estimates/${id}`);
  },

  /**
   * Tạo estimate mới (báo giá)
   */
  create: async (data: Partial<PerfexEstimate> & { items: any[] }) => {
    return perfexFetch<PerfexEstimate>('/estimates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Gửi estimate cho khách hàng
   */
  send: async (id: string) => {
    return perfexFetch<{ success: boolean }>(`/estimates/${id}/send`, {
      method: 'POST',
    });
  },

  /**
   * Convert estimate thành invoice
   */
  convertToInvoice: async (id: string) => {
    return perfexFetch<{ invoice_id: string }>(`/estimates/${id}/convert`, {
      method: 'POST',
    });
  },
};

// ==================== SYNC SERVICE ====================

export const PerfexSyncService = {
  /**
   * Sync tất cả users từ app sang Perfex
   */
  syncAllUsers: async (users: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
  }[]) => {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const user of users) {
      try {
        await PerfexCustomersService.syncFromApp(user);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`User ${user.email}: ${error.message}`);
      }
    }

    return results;
  },

  /**
   * Sync tất cả projects từ app sang Perfex
   */
  syncAllProjects: async (projects: {
    id: string;
    name: string;
    description?: string;
    clientId: string;
    startDate: string;
    endDate?: string;
    progress: number;
    status: string;
  }[]) => {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const project of projects) {
      try {
        await PerfexProjectsService.syncFromApp(project);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Project ${project.name}: ${error.message}`);
      }
    }

    return results;
  },

  /**
   * Webhook handler - Nhận data từ Perfex
   */
  handleWebhook: async (event: string, data: any) => {
    console.log(`[PerfexCRM] Webhook received: ${event}`, data);
    
    switch (event) {
      case 'customer.created':
      case 'customer.updated':
        // Sync customer back to app
        break;
      case 'project.updated':
        // Update project progress in app
        break;
      case 'task.completed':
        // Notify app about completed task
        break;
      case 'invoice.paid':
        // Update payment status in app
        break;
      default:
        console.log(`[PerfexCRM] Unhandled event: ${event}`);
    }
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Test connection to Perfex CRM
 */
export async function testPerfexConnection(): Promise<{
  connected: boolean;
  message: string;
  version?: string;
}> {
  try {
    const result = await perfexFetch<{ version: string }>('/info');
    return {
      connected: true,
      message: 'Connected successfully',
      version: result.version,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: error.message || 'Connection failed',
    };
  }
}

/**
 * Format Perfex date to app date
 */
export function formatPerfexDate(perfexDate: string): string {
  return new Date(perfexDate).toISOString().split('T')[0];
}

/**
 * Format app date to Perfex date
 */
export function formatAppDateForPerfex(appDate: string): string {
  return new Date(appDate).toISOString().split('T')[0];
}

// Export all services
export const PerfexCRM = {
  Customers: PerfexCustomersService,
  Contacts: PerfexContactsService,
  Projects: PerfexProjectsService,
  Tasks: PerfexTasksService,
  Invoices: PerfexInvoicesService,
  Leads: PerfexLeadsService,
  Estimates: PerfexEstimatesService,
  Sync: PerfexSyncService,
  testConnection: testPerfexConnection,
};

export default PerfexCRM;
