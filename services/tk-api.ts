import { buildApiUrl } from '@/config';
import createClient from 'openapi-fetch';
import { apiFetch } from './api';
// types/api is not always present during migration; use any to avoid TS errors
type paths = any;

// Create API client with proper base URL handling
export const tkApi = createClient<any>({ 
  baseUrl: buildApiUrl('') // Use buildApiUrl to respect prefix
});

// Health check type based on actual API
export type HealthResponse = paths['/health']['get']['responses']['200'];

// Payment types matching ThietKe Resort API specification
export interface Payment {
  id: string;
  order_code: string;
  amount: number;
  currency: string;
  provider: string;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  meta?: any;
  /** Some legacy components expect meta_json; provide optional alias */
  meta_json?: any;
  created_at: string;
  updated_at?: string | null;
}

export interface PaymentCreateInput {
  order_code: string;
  amount: number;
  currency?: string;
  provider?: string;
  meta?: any;
}

export interface PaymentUpdateInput {
  status?: 'pending' | 'paid' | 'failed' | 'canceled';
  amount?: number;
  meta?: any;
}

export interface PaymentConfirmInput {
  status?: 'paid' | 'failed' | 'canceled';
  meta?: any;
}

export interface PaymentListQuery {
  page?: number;
  page_size?: number;
  status?: 'pending' | 'paid' | 'failed' | 'canceled';
  order_code?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Payment API client matching ThietKe Resort API specification
 * Base URL: https://api.thietkeresort.com.vn
 * All endpoints require: Authorization: Bearer <access_token>
 */
export class PaymentClient {
  /**
   * List payments with pagination and filters
   * GET /payments?page=1&page_size=20&status=pending&order_code=DH
   */
  async listPayments(query: PaymentListQuery = {}, accessToken?: string): Promise<PaymentListResponse> {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.set('page', query.page.toString());
    if (query.page_size) searchParams.set('page_size', query.page_size.toString());
    if (query.status) searchParams.set('status', query.status);
    if (query.order_code) searchParams.set('order_code', query.order_code);
    
    const queryString = searchParams.toString();
    const path = queryString ? `/payments?${queryString}` : '/payments';
    
    return await apiFetch<PaymentListResponse>(path, {
      method: 'GET',
      token: accessToken
    });
  }

  /**
   * Create a new payment
   * POST /payments
   */
  async createPayment(input: PaymentCreateInput, accessToken?: string): Promise<{ payment: Payment }> {
    return await apiFetch<{ payment: Payment }>('/payments', {
      method: 'POST',
      body: JSON.stringify(input),
      token: accessToken
    });
  }

  /**
   * Get payment by ID
   * GET /payments/{id}
   */
  async getPayment(id: string, accessToken?: string): Promise<{ payment: Payment }> {
    return await apiFetch<{ payment: Payment }>(`/payments/${id}`, {
      method: 'GET',
      token: accessToken
    });
  }

  /**
   * Update payment
   * PATCH /payments/{id}
   */
  async updatePayment(id: string, input: PaymentUpdateInput, accessToken?: string): Promise<{ payment: Payment }> {
    return await apiFetch<{ payment: Payment }>(`/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      token: accessToken
    });
  }

  /**
   * Delete payment
   * DELETE /payments/{id}
   */
  async deletePayment(id: string, accessToken?: string): Promise<void> {
    return await apiFetch<void>(`/payments/${id}`, {
      method: 'DELETE',
      token: accessToken
    });
  }

  /**
   * Confirm payment
   * POST /payments/{id}/confirm
   */
  async confirmPayment(id: string, input: PaymentConfirmInput = { status: 'paid' }, accessToken?: string): Promise<{ payment: Payment }> {
    return await apiFetch<{ payment: Payment }>(`/payments/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(input),
      token: accessToken
    });
  }

  /**
   * Health check (no auth required)
   * GET /health
   */
  async healthCheck(): Promise<any> {
    return await apiFetch<any>('/health', {
      method: 'GET'
    });
  }

  /**
   * Get videos list (legacy endpoint)
   */
  async getVideos(limit: number = 20): Promise<any> {
    try {
      const response = await apiFetch(`/videos?limit=${limit}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.warn('[VideoService] Videos endpoint not available, returning empty list');
      return { videos: [], total: 0 };
    }
  }
}

// Export singleton instance
export const paymentClient = new PaymentClient();

// Convenience functions matching the pseudo-code in documentation
export const listPayments = (accessToken: string, query?: string) => {
  const params = query ? query.substring(1) : 'page=1&page_size=20'; // Remove leading '?'
  const searchParams = new URLSearchParams(params);
  const queryObj: PaymentListQuery = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
    page_size: searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : undefined,
    status: searchParams.get('status') as any,
    order_code: searchParams.get('order_code') || undefined,
  };
  return paymentClient.listPayments(queryObj, accessToken);
};

export const createPayment = (accessToken: string, payload: PaymentCreateInput) => 
  paymentClient.createPayment(payload, accessToken);

export const getPayment = (accessToken: string, id: string) => 
  paymentClient.getPayment(id, accessToken);

export const updatePayment = (accessToken: string, id: string, payload: PaymentUpdateInput) => 
  paymentClient.updatePayment(id, payload, accessToken);

export const deletePayment = (accessToken: string, id: string) => 
  paymentClient.deletePayment(id, accessToken);

export const confirmPayment = (accessToken: string, id: string, payload: PaymentConfirmInput = { status: 'paid' }) => 
  paymentClient.confirmPayment(id, payload, accessToken);
