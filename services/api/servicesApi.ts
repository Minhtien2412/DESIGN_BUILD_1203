/**
 * Services API Client
 * Backend: https://baotienweb.cloud/api/v1/services
 * Note: This is a PUBLIC API - no authentication required!
 */

import ENV from '../../config/env';
import { apiFetch } from '../api';

const BASE_URL = `${ENV.API_BASE_URL}/services`;

// ==================== TYPES ====================

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string; // Backend returns string
  unit: string;
  duration: string;
  features: string[];
  images: string[];
  status: string; // 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  viewCount: number;
  orderCount: number;
  rating: number | null;
  reviewCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ServiceListResponse {
  data: Service[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface ServiceReview {
  id: number;
  serviceId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface CreateBookingDto {
  serviceId: number;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface ServiceBooking {
  id: number;
  serviceId: number;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
}

// ==================== API METHODS (PUBLIC - NO AUTH) ====================

/**
 * Get all services
 * Endpoint: GET /services
 */
export async function getServices(category?: string, page = 1, limit = 20): Promise<ServiceListResponse> {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `/services${queryString ? `?${queryString}` : ''}`;

    return await apiFetch<ServiceListResponse>(url);
  } catch (error) {
    console.error('[servicesApi] getServices error:', error);
    throw error;
  }
}

/**
 * Get a single service by ID
 * Endpoint: GET /services/:id
 */
export async function getService(id: number): Promise<Service> {
  try {
    return await apiFetch<Service>(`/services/${id}`);
  } catch (error) {
    console.error('[servicesApi] getService error:', error);
    throw error;
  }
}

/**
 * Get service categories
 * Endpoint: GET /services/categories
 */
export async function getCategories(): Promise<ServiceCategory[]> {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[servicesApi] getCategories error:', error);
    throw error;
  }
}

/**
 * Get reviews for a service
 * Endpoint: GET /services/:id/reviews
 */
export async function getServiceReviews(serviceId: number): Promise<ServiceReview[]> {
  try {
    const response = await fetch(`${BASE_URL}/${serviceId}/reviews`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[servicesApi] getServiceReviews error:', error);
    throw error;
  }
}

/**
 * Search services by query
 * Endpoint: GET /services/search?q=query
 */
export async function searchServices(query: string): Promise<Service[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search services: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[servicesApi] searchServices error:', error);
    throw error;
  }
}

// ==================== BOOKING METHODS (REQUIRES AUTH) ====================

/**
 * Create a booking (requires authentication)
 * Endpoint: POST /services/bookings
 */
export async function createBooking(dto: CreateBookingDto): Promise<ServiceBooking> {
  try {
    const token = await import('expo-secure-store').then(m => 
      m.getItemAsync('accessToken')
    );

    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[servicesApi] createBooking error:', error);
    throw error;
  }
}

/**
 * Get my bookings (requires authentication)
 * Endpoint: GET /services/bookings/my
 */
export async function getMyBookings(): Promise<ServiceBooking[]> {
  try {
    const token = await import('expo-secure-store').then(m => 
      m.getItemAsync('accessToken')
    );

    const response = await fetch(`${BASE_URL}/bookings/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[servicesApi] getMyBookings error:', error);
    throw error;
  }
}

// ==================== EXPORTS ====================

export const servicesApi = {
  getServices,
  getService,
  getCategories,
  getServiceReviews,
  searchServices,
  createBooking,
  getMyBookings
};

export default servicesApi;
