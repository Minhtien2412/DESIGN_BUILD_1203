/**
 * Utilities API Client
 * Handles all CRUD operations for app utilities/features
 * Backend: https://baotienweb.cloud/api/v1/utilities
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Utility Type Enum (matches backend Prisma schema)
 */
export type UtilityType = 
  | 'CALCULATOR'  // Công cụ tính toán
  | 'AI'          // Trí tuệ nhân tạo
  | 'MEDIA'       // Đa phương tiện (video, live)
  | 'DOCUMENT'    // Tài liệu, mẫu biểu
  | 'OTHER';      // Khác

/**
 * Utility Interface (matches backend Utility model)
 */
export interface Utility {
  id: number;
  name: string;
  type: UtilityType;
  icon: string;
  color: string;
  description?: string;
  enabled: boolean;
  route?: string;
  useCount?: number;
  createdBy: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Query parameters for listing utilities
 */
export interface UtilityQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: UtilityType | string;
  enabled?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response from backend
 */
export interface UtilityResponse {
  data: Utility[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Single utility response
 */
export interface UtilityDetailResponse {
  data: Utility;
}

/**
 * DTO for creating a utility
 */
export interface CreateUtilityDto {
  name: string;
  type: UtilityType;
  icon: string;
  color: string;
  description?: string;
  enabled?: boolean;
  route?: string;
}

/**
 * DTO for updating a utility (all fields optional)
 */
export interface UpdateUtilityDto {
  name?: string;
  type?: UtilityType;
  icon?: string;
  color?: string;
  description?: string;
  enabled?: boolean;
  route?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Utilities API Client
 * All methods return promises and throw errors on failure
 */
export const utilitiesApi = {
  /**
   * Get all utilities with pagination and filtering
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of utilities
   * 
   * @example
   * const response = await utilitiesApi.getAll({ 
   *   page: 1, 
   *   limit: 20, 
   *   type: 'CALCULATOR',
   *   enabled: true
   * });
   */
  getAll: async (query?: UtilityQuery): Promise<UtilityResponse> => {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.enabled !== undefined) params.append('enabled', query.enabled.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/utilities?${queryString}` : '/utilities';
    
    return apiFetch<UtilityResponse>(endpoint);
  },

  /**
   * Get a single utility by ID
   * @param id - Utility ID
   * @returns Utility detail
   * 
   * @example
   * const response = await utilitiesApi.getById(1);
   * console.log(response.data.name);
   */
  getById: async (id: number): Promise<UtilityDetailResponse> => {
    return apiFetch<UtilityDetailResponse>(`/utilities/${id}`);
  },

  /**
   * Create a new utility (requires authentication)
   * @param data - Utility creation data
   * @returns Created utility
   * 
   * @example
   * const newUtility = await utilitiesApi.create({
   *   name: 'Tính toán vật liệu',
   *   type: 'CALCULATOR',
   *   icon: 'calculator-outline',
   *   color: '#3B82F6',
   *   enabled: true,
   *   route: '/utilities/material-calculator'
   * });
   */
  create: async (data: CreateUtilityDto): Promise<UtilityDetailResponse> => {
    return apiFetch<UtilityDetailResponse>('/utilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing utility (requires authentication)
   * @param id - Utility ID
   * @param data - Fields to update
   * @returns Updated utility
   * 
   * @example
   * const updated = await utilitiesApi.update(1, {
   *   enabled: false,
   *   color: '#EF4444'
   * });
   */
  update: async (id: number, data: UpdateUtilityDto): Promise<UtilityDetailResponse> => {
    return apiFetch<UtilityDetailResponse>(`/utilities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a utility (requires authentication)
   * @param id - Utility ID
   * 
   * @example
   * await utilitiesApi.delete(1);
   */
  delete: async (id: number): Promise<void> => {
    return apiFetch<void>(`/utilities/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle utility enabled status
   * @param id - Utility ID
   * @returns Updated utility
   * 
   * @example
   * const toggled = await utilitiesApi.toggleEnabled(1);
   * console.log(toggled.data.enabled); // true or false
   */
  toggleEnabled: async (id: number): Promise<UtilityDetailResponse> => {
    return apiFetch<UtilityDetailResponse>(`/utilities/${id}/toggle-enabled`, {
      method: 'PATCH',
    });
  },

  /**
   * Increment use count for a utility
   * @param id - Utility ID
   * @returns Updated utility with incremented useCount
   * 
   * @example
   * // User tapped on calculator utility
   * await utilitiesApi.incrementUse(1);
   */
  incrementUse: async (id: number): Promise<UtilityDetailResponse> => {
    return apiFetch<UtilityDetailResponse>(`/utilities/${id}/use`, {
      method: 'POST',
    });
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper: Get display name for utility type
 */
export const getUtilityTypeName = (type: UtilityType): string => {
  const names: Record<UtilityType, string> = {
    CALCULATOR: 'Công cụ tính',
    AI: 'Trí tuệ nhân tạo',
    MEDIA: 'Đa phương tiện',
    DOCUMENT: 'Tài liệu',
    OTHER: 'Khác',
  };
  return names[type] || type;
};

/**
 * Helper: Get icon name for utility type
 */
export const getUtilityTypeIcon = (type: UtilityType): string => {
  const icons: Record<UtilityType, string> = {
    CALCULATOR: 'calculator',
    AI: 'sparkles',
    MEDIA: 'film',
    DOCUMENT: 'document-text',
    OTHER: 'apps',
  };
  return icons[type] || 'apps';
};

/**
 * Helper: Get default color for utility type
 */
export const getUtilityTypeColor = (type: UtilityType): string => {
  const colors: Record<UtilityType, string> = {
    CALCULATOR: '#3B82F6', // Blue
    AI: '#8B5CF6',         // Purple
    MEDIA: '#EF4444',      // Red
    DOCUMENT: '#10B981',   // Green
    OTHER: '#6B7280',      // Gray
  };
  return colors[type] || '#6B7280';
};

/**
 * Helper: Format use count
 */
export const formatUseCount = (count?: number): string => {
  if (!count || count === 0) return 'Chưa sử dụng';
  if (count === 1) return '1 lần';
  if (count < 1000) return `${count} lần`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K lần`;
  return `${(count / 1000000).toFixed(1)}M lần`;
};

/**
 * Helper: Validate icon name (Ionicons)
 */
export const isValidIonicon = (icon: string): boolean => {
  // Common Ionicons patterns
  const validPatterns = [
    /^[a-z-]+$/, // lowercase with hyphens
    /^[a-z-]+-outline$/, // outline variant
    /^[a-z-]+-sharp$/, // sharp variant
  ];
  
  return validPatterns.some(pattern => pattern.test(icon));
};

/**
 * Helper: Validate hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate utility creation data
 */
export const validateUtilityData = (data: CreateUtilityDto): { 
  valid: boolean; 
  errors: string[]; 
} => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push('Tên tiện ích phải có ít nhất 3 ký tự');
  }

  if (!data.type) {
    errors.push('Vui lòng chọn loại tiện ích');
  }

  if (!data.icon || data.icon.trim().length === 0) {
    errors.push('Vui lòng nhập tên icon');
  } else if (!isValidIonicon(data.icon)) {
    errors.push('Tên icon không hợp lệ (dùng format: icon-name hoặc icon-name-outline)');
  }

  if (!data.color || data.color.trim().length === 0) {
    errors.push('Vui lòng nhập màu sắc');
  } else if (!isValidHexColor(data.color)) {
    errors.push('Màu sắc không hợp lệ (dùng format: #RRGGBB)');
  }

  if (data.route && !data.route.startsWith('/')) {
    errors.push('Route phải bắt đầu bằng /');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// COMMON UTILITIES DATA
// ============================================================================

/**
 * Predefined utility templates for quick creation
 */
export const UTILITY_TEMPLATES: Partial<CreateUtilityDto>[] = [
  {
    name: 'Tính toán vật liệu',
    type: 'CALCULATOR',
    icon: 'calculator-outline',
    color: '#3B82F6',
    description: 'Tính toán lượng vật liệu cần thiết cho công trình',
    route: '/utilities/material-calculator',
  },
  {
    name: 'Dự toán chi phí',
    type: 'CALCULATOR',
    icon: 'cash-outline',
    color: '#10B981',
    description: 'Ước tính chi phí xây dựng theo diện tích',
    route: '/utilities/cost-estimator',
  },
  {
    name: 'Trò chuyện AI',
    type: 'AI',
    icon: 'chatbubbles-outline',
    color: '#8B5CF6',
    description: 'Tư vấn kiến trúc, xây dựng qua AI',
    route: '/utilities/ai-chat',
  },
  {
    name: 'Phân tích ảnh công trình',
    type: 'AI',
    icon: 'camera-outline',
    color: '#EC4899',
    description: 'Phân tích tiến độ và chất lượng qua hình ảnh',
    route: '/utilities/ai-image-analysis',
  },
  {
    name: 'Live Stream',
    type: 'MEDIA',
    icon: 'videocam-outline',
    color: '#EF4444',
    description: 'Phát trực tiếp tiến độ công trình',
    route: '/live',
  },
  {
    name: 'Video hướng dẫn',
    type: 'MEDIA',
    icon: 'play-circle-outline',
    color: '#F59E0B',
    description: 'Thư viện video hướng dẫn thi công',
    route: '/videos',
  },
  {
    name: 'Thư viện bản vẽ mẫu',
    type: 'DOCUMENT',
    icon: 'document-text-outline',
    color: '#10B981',
    description: 'Bản vẽ kiến trúc, kết cấu mẫu',
    route: '/utilities/drawing-library',
  },
  {
    name: 'Hợp đồng mẫu',
    type: 'DOCUMENT',
    icon: 'newspaper-outline',
    color: '#0EA5E9',
    description: 'Mẫu hợp đồng xây dựng, thiết kế',
    route: '/utilities/contract-templates',
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export default utilitiesApi;
