/**
 * Services Booking API
 * Backend: https://baotienweb.cloud/api/v1/services
 * 
 * Endpoints theo BACKEND_API_SPECS.md:
 * - GET    /services              - List all services (public)
 * - GET    /services/:id          - Get service details (public)
 * - GET    /services/:id/details  - Get enhanced service details with reviews (public)
 * - POST   /services/bookings     - Create booking (auth required)
 * - GET    /services/bookings     - Get user bookings (auth required)
 * - GET    /services/categories   - Get service categories (public)
 */

import { apiFetch } from './api';

// ============================================================================
// Type Definitions
// ============================================================================

export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ServiceCreator {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface ServiceReview {
  id: number;
  userId: number;
  rating: number;  // 1-5
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;          // VND
  unit?: string;          // e.g., "m²", "project", "day"
  duration?: string;      // e.g., "30 ngày"
  features?: string[];
  images?: string[];
  status: ServiceStatus;
  rating?: number;        // Average rating (1-5)
  reviewCount?: number;
  viewCount?: number;
  orderCount?: number;
  creator?: ServiceCreator;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDetails extends Service {
  recentReviews?: ServiceReview[];
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  serviceCount?: number;
}

export interface ServiceBooking {
  id: number;
  serviceId: number;
  userId: number;
  status: BookingStatus;
  startDate: string;      // ISO date YYYY-MM-DD
  endDate: string;        // ISO date YYYY-MM-DD
  totalPrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  service?: Service;
}

// Request/Response Types
export interface CreateBookingData {
  serviceId: number;
  startDate: string;      // Format: YYYY-MM-DD
  endDate: string;        // Format: YYYY-MM-DD
  notes?: string;         // Max 1000 chars
}

export interface ServiceFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: ServiceStatus;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedServicesResponse {
  success: boolean;
  data: Service[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: ServiceBooking;
  error?: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Public API Functions (No Auth Required)
// ============================================================================

/**
 * Get list of services with filters
 * GET /services
 */
export async function getServices(filters?: ServiceFilters): Promise<PaginatedServicesResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    const query = params.toString();
    const url = `/services${query ? `?${query}` : ''}`;
    
    return await apiFetch<PaginatedServicesResponse>(url);
  } catch (error) {
    console.error('[ServicesAPI] Error fetching services:', error);
    throw error;
  }
}

/**
 * Get service by ID
 * GET /services/:id
 */
export async function getServiceById(id: number): Promise<{ success: boolean; data: Service }> {
  try {
    return await apiFetch<{ success: boolean; data: Service }>(`/services/${id}`);
  } catch (error) {
    console.error(`[ServicesAPI] Error fetching service ${id}:`, error);
    throw error;
  }
}

/**
 * Get enhanced service details with reviews
 * GET /services/:id/details
 */
export async function getServiceDetails(id: number): Promise<{ success: boolean; data: ServiceDetails }> {
  try {
    return await apiFetch<{ success: boolean; data: ServiceDetails }>(`/services/${id}/details`);
  } catch (error) {
    console.error(`[ServicesAPI] Error fetching service details ${id}:`, error);
    throw error;
  }
}

/**
 * Get service categories
 * GET /services/categories
 */
export async function getServiceCategories(): Promise<{ success: boolean; data: ServiceCategory[] }> {
  try {
    return await apiFetch<{ success: boolean; data: ServiceCategory[] }>('/services/categories');
  } catch (error) {
    console.error('[ServicesAPI] Error fetching categories:', error);
    throw error;
  }
}

// ============================================================================
// Protected API Functions (Auth Required)
// ============================================================================

/**
 * Create service booking
 * POST /services/bookings
 * 
 * @param data - Booking data
 * @returns Created booking
 */
export async function createBooking(data: CreateBookingData): Promise<BookingResponse> {
  // Client-side validation
  if (!data.serviceId) {
    return {
      success: false,
      message: 'Vui lòng chọn dịch vụ',
      data: {} as ServiceBooking,
      error: 'VALIDATION_ERROR',
    };
  }

  if (!data.startDate || !data.endDate) {
    return {
      success: false,
      message: 'Vui lòng chọn ngày bắt đầu và kết thúc',
      data: {} as ServiceBooking,
      error: 'VALIDATION_ERROR',
    };
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  if (endDate <= startDate) {
    return {
      success: false,
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      data: {} as ServiceBooking,
      error: 'VALIDATION_ERROR',
      details: { endDate: ['Ngày kết thúc phải sau ngày bắt đầu'] },
    };
  }

  if (data.notes && data.notes.length > 1000) {
    return {
      success: false,
      message: 'Ghi chú không được vượt quá 1000 ký tự',
      data: {} as ServiceBooking,
      error: 'VALIDATION_ERROR',
      details: { notes: ['Ghi chú tối đa 1000 ký tự'] },
    };
  }

  try {
    const response = await apiFetch<BookingResponse>('/services/bookings', {
      method: 'POST',
      data,
    });
    return response;
  } catch (error: any) {
    console.error('[ServicesAPI] Error creating booking:', error);
    return {
      success: false,
      message: error.message || 'Đặt dịch vụ thất bại',
      data: {} as ServiceBooking,
      error: error.code || 'BOOKING_FAILED',
    };
  }
}

/**
 * Get user's bookings
 * GET /services/bookings
 */
export async function getUserBookings(filters?: {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}): Promise<{ success: boolean; data: ServiceBooking[]; meta: { total: number; page: number; limit: number } }> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    const url = `/services/bookings${query ? `?${query}` : ''}`;
    
    return await apiFetch(url);
  } catch (error) {
    console.error('[ServicesAPI] Error fetching bookings:', error);
    throw error;
  }
}

/**
 * Cancel booking
 * PATCH /services/bookings/:id/cancel
 */
export async function cancelBooking(bookingId: number): Promise<BookingResponse> {
  try {
    return await apiFetch<BookingResponse>(`/services/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  } catch (error: any) {
    console.error(`[ServicesAPI] Error cancelling booking ${bookingId}:`, error);
    return {
      success: false,
      message: error.message || 'Hủy đặt dịch vụ thất bại',
      data: {} as ServiceBooking,
      error: error.code || 'CANCEL_FAILED',
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format price in VND
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get status display text
 */
export function getBookingStatusText(status: BookingStatus): string {
  const statusMap: Record<BookingStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return statusMap[status] || status;
}

/**
 * Get status color
 */
export function getBookingStatusColor(status: BookingStatus): string {
  const colorMap: Record<BookingStatus, string> = {
    PENDING: '#0D9488',     // Orange
    CONFIRMED: '#0D9488',   // Blue
    IN_PROGRESS: '#999999', // Purple
    COMPLETED: '#0D9488',   // Green
    CANCELLED: '#000000',   // Red
  };
  return colorMap[status] || '#999999';
}
