/**
 * Services API Client
 * Handles all CRUD operations for construction services
 * Backend: https://baotienweb.cloud/api/v1/services
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Service Category Enum (matches backend Prisma schema)
 */
export type ServiceCategory = 
  | 'CONSTRUCTION'  // Thi công
  | 'DESIGN'        // Thiết kế
  | 'CONSULTING'    // Tư vấn
  | 'MAINTENANCE'   // Bảo trì
  | 'INSPECTION'    // Kiểm tra
  | 'OTHER';        // Khác

/**
 * Service Status Enum (matches backend Prisma schema)
 */
export type ServiceStatus = 
  | 'DRAFT'      // Bản nháp
  | 'ACTIVE'     // Đang hoạt động
  | 'INACTIVE'   // Tạm ngưng
  | 'ARCHIVED';  // Lưu trữ

/**
 * Service Interface (matches backend Service model)
 */
export interface Service {
  id: number;
  name: string;
  category: ServiceCategory;
  status: ServiceStatus;
  price: number;
  unit: string;
  description?: string;
  duration?: string;
  images?: string[];
  features?: string[];
  createdBy: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Query parameters for listing services
 */
export interface ServiceQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: ServiceCategory | string;
  status?: ServiceStatus | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response from backend
 */
export interface ServiceResponse {
  data: Service[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Single service response
 */
export interface ServiceDetailResponse {
  data: Service;
}

/**
 * DTO for creating a service
 */
export interface CreateServiceDto {
  name: string;
  category: ServiceCategory;
  price: number;
  unit: string;
  status?: ServiceStatus;
  description?: string;
  duration?: string;
  images?: string[];
  features?: string[];
}

/**
 * DTO for updating a service (all fields optional)
 */
export interface UpdateServiceDto {
  name?: string;
  category?: ServiceCategory;
  price?: number;
  unit?: string;
  status?: ServiceStatus;
  description?: string;
  duration?: string;
  images?: string[];
  features?: string[];
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Services API Client
 * All methods return promises and throw errors on failure
 */
export const servicesApi = {
  /**
   * Get all services with pagination and filtering
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of services
   * 
   * @example
   * const response = await servicesApi.getAll({ 
   *   page: 1, 
   *   limit: 20, 
   *   category: 'DESIGN',
   *   status: 'ACTIVE',
   *   search: 'thiết kế'
   * });
   */
  getAll: async (query?: ServiceQuery): Promise<ServiceResponse> => {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.category) params.append('category', query.category);
    if (query?.status) params.append('status', query.status);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    
    return apiFetch<ServiceResponse>(endpoint);
  },

  /**
   * Get a single service by ID
   * @param id - Service ID
   * @returns Service detail
   * 
   * @example
   * const response = await servicesApi.getById(1);
   * console.log(response.data.name);
   */
  getById: async (id: number): Promise<ServiceDetailResponse> => {
    return apiFetch<ServiceDetailResponse>(`/services/${id}`);
  },

  /**
   * Create a new service (requires authentication)
   * @param data - Service creation data
   * @returns Created service
   * 
   * @example
   * const newService = await servicesApi.create({
   *   name: 'Thiết kế kiến trúc',
   *   category: 'DESIGN',
   *   price: 500000,
   *   unit: 'm²',
   *   status: 'ACTIVE',
   *   description: 'Thiết kế bản vẽ 2D/3D'
   * });
   */
  create: async (data: CreateServiceDto): Promise<ServiceDetailResponse> => {
    return apiFetch<ServiceDetailResponse>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing service (requires authentication)
   * @param id - Service ID
   * @param data - Fields to update
   * @returns Updated service
   * 
   * @example
   * const updated = await servicesApi.update(1, {
   *   price: 550000,
   *   status: 'INACTIVE'
   * });
   */
  update: async (id: number, data: UpdateServiceDto): Promise<ServiceDetailResponse> => {
    return apiFetch<ServiceDetailResponse>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a service (requires authentication)
   * @param id - Service ID
   * 
   * @example
   * await servicesApi.delete(1);
   */
  delete: async (id: number): Promise<void> => {
    return apiFetch<void>(`/services/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle service status between ACTIVE and INACTIVE
   * @param id - Service ID
   * @returns Updated service
   * 
   * @example
   * const toggled = await servicesApi.toggleStatus(1);
   * console.log(toggled.data.status); // 'ACTIVE' or 'INACTIVE'
   */
  toggleStatus: async (id: number): Promise<ServiceDetailResponse> => {
    return apiFetch<ServiceDetailResponse>(`/services/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper: Get display name for service category
 */
export const getServiceCategoryName = (category: ServiceCategory): string => {
  const names: Record<ServiceCategory, string> = {
    CONSTRUCTION: 'Thi công',
    DESIGN: 'Thiết kế',
    CONSULTING: 'Tư vấn',
    MAINTENANCE: 'Bảo trì',
    INSPECTION: 'Kiểm tra',
    OTHER: 'Khác',
  };
  return names[category] || category;
};

/**
 * Helper: Get display name for service status
 */
export const getServiceStatusName = (status: ServiceStatus): string => {
  const names: Record<ServiceStatus, string> = {
    DRAFT: 'Bản nháp',
    ACTIVE: 'Đang hoạt động',
    INACTIVE: 'Tạm ngưng',
    ARCHIVED: 'Lưu trữ',
  };
  return names[status] || status;
};

/**
 * Helper: Get status color
 */
export const getServiceStatusColor = (status: ServiceStatus): string => {
  const colors: Record<ServiceStatus, string> = {
    DRAFT: '#6B7280',    // Gray
    ACTIVE: '#0066CC',   // Green
    INACTIVE: '#0066CC', // Orange
    ARCHIVED: '#000000', // Red
  };
  return colors[status] || '#6B7280';
};

/**
 * Helper: Format price with unit
 */
export const formatServicePrice = (price: number, unit: string): string => {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
  
  return `${formattedPrice}/${unit}`;
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate service creation data
 */
export const validateServiceData = (data: CreateServiceDto): { 
  valid: boolean; 
  errors: string[]; 
} => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push('Tên dịch vụ phải có ít nhất 3 ký tự');
  }

  if (!data.category) {
    errors.push('Vui lòng chọn danh mục');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Giá dịch vụ phải lớn hơn 0');
  }

  if (!data.unit || data.unit.trim().length === 0) {
    errors.push('Vui lòng nhập đơn vị tính');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default servicesApi;
