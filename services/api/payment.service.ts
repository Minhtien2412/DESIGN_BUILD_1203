/**
 * @deprecated Use `services/paymentService.ts` instead — this file is Stripe-only
 * and not imported by any screen. Kept for barrel re-export compatibility.
 *
 * Payment Service (Stripe only)
 * Handles Stripe payment integration
 */

import { apiClient } from "./client";

// ==================== TYPES ====================

export interface CreatePaymentDto {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  created: string;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionDto {
  priceId: string;
  customerId?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionResponse {
  id: string;
  customerId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  items: {
    priceId: string;
    quantity: number;
  }[];
}

export interface PaymentHistory {
  payments: PaymentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface RefundDto {
  paymentId: string;
  amount?: number;
  reason?: string;
}

// ==================== SERVICE ====================

export const paymentService = {
  /**
   * Create Payment Intent (one-time payment)
   */
  async createPaymentIntent(
    data: CreatePaymentDto,
  ): Promise<PaymentIntentResponse> {
    return apiClient.post<PaymentIntentResponse>("/payment/intent", data);
  },

  /**
   * Confirm payment after client completes on Stripe
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(
      `/payment/intent/${paymentIntentId}/confirm`,
    );
  },

  /**
   * Create subscription (recurring payment)
   */
  async createSubscription(
    data: CreateSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    return apiClient.post<SubscriptionResponse>("/payment/subscription", data);
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
  ): Promise<SubscriptionResponse> {
    return apiClient.delete(`/payment/subscription/${subscriptionId}`);
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaymentHistory> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.status) queryParams.status = params.status;

    return apiClient.get<PaymentHistory>("/payment/history", queryParams);
  },

  /**
   * Get user subscriptions
   */
  async getSubscriptions(): Promise<SubscriptionResponse[]> {
    return apiClient.get<SubscriptionResponse[]>("/payment/subscriptions");
  },

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    data?: RefundDto,
  ): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(
      `/payment/refund/${paymentId}`,
      data,
    );
  },
};

export default paymentService;
