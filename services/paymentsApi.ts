/**
 * Payments API Service
 * Based on FRONTEND-INTEGRATION-GUIDE.md
 * 
 * Endpoints:
 * - GET /api/payments - Get list of payments
 * - GET /api/payments/:id - Get payment details
 * - POST /api/payments - Create new payment
 * - PUT /api/payments/:id/status - Update payment status (Admin only)
 */

import { get, post, put } from './apiClient';

// ============================================================================
// Types
// ============================================================================

export interface Payment {
  id: string;
  projectId: string;
  userId: string;
  amount: number;
  method: 'bank_transfer' | 'credit_card' | 'e_wallet' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId: string | null;
  description: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface PaymentsParams {
  page?: number;
  limit?: number;
  status?: Payment['status'];
  projectId?: string;
  method?: Payment['method'];
}

export interface PaymentsResponse {
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePaymentData {
  projectId: string;
  amount: number;
  method: Payment['method'];
  description: string;
}

export interface UpdatePaymentStatusData {
  status: Payment['status'];
  transactionId?: string;
}

// ============================================================================
// Payments API Functions
// ============================================================================

/**
 * Get list of payments with pagination and filters
 */
export async function getPayments(params: PaymentsParams = {}): Promise<PaymentsResponse> {
  console.log('[PaymentsAPI] Fetching payments with params:', params);
  
  const response = await get<PaymentsResponse>('/api/payments', {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.projectId && { projectId: params.projectId }),
      ...(params.method && { method: params.method }),
    },
  });

  console.log('[PaymentsAPI] ✅ Fetched', response.data.length, 'payments');
  
  return response;
}

/**
 * Get payment details by ID
 */
export async function getPayment(id: string): Promise<Payment> {
  console.log('[PaymentsAPI] Fetching payment:', id);
  
  const response = await get<Payment>(`/api/payments/${id}`);

  console.log('[PaymentsAPI] ✅ Payment fetched:', response.id);
  
  return response;
}

/**
 * Create new payment
 */
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  console.log('[PaymentsAPI] Creating payment:', data);
  
  const response = await post<Payment>('/api/payments', data);

  console.log('[PaymentsAPI] ✅ Payment created:', response.id);
  
  return response;
}

/**
 * Update payment status (Admin only)
 */
export async function updatePaymentStatus(
  id: string,
  data: UpdatePaymentStatusData
): Promise<Payment> {
  console.log('[PaymentsAPI] Updating payment status:', id, data.status);
  
  const response = await put<Payment>(`/api/payments/${id}/status`, data);

  console.log('[PaymentsAPI] ✅ Payment status updated');
  
  return response;
}

/**
 * Get payments for a specific project
 */
export async function getProjectPayments(projectId: string): Promise<Payment[]> {
  console.log('[PaymentsAPI] Fetching payments for project:', projectId);
  
  const response = await getPayments({ projectId });

  return response.data;
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(projectId?: string): Promise<{
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
  completedAmount: number;
}> {
  console.log('[PaymentsAPI] Fetching payment statistics');
  
  const response = await get<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalAmount: number;
    completedAmount: number;
  }>('/api/payments/stats', {
    params: projectId ? { projectId } : undefined,
  });

  return response;
}

/**
 * Cancel payment (if not completed)
 */
export async function cancelPayment(id: string, reason?: string): Promise<Payment> {
  console.log('[PaymentsAPI] Cancelling payment:', id);
  
  const response = await put<Payment>(`/api/payments/${id}/cancel`, {
    reason,
  });

  console.log('[PaymentsAPI] ✅ Payment cancelled');
  
  return response;
}

/**
 * Request refund (if completed)
 */
export async function requestRefund(id: string, reason: string): Promise<Payment> {
  console.log('[PaymentsAPI] Requesting refund for payment:', id);
  
  const response = await post<Payment>(`/api/payments/${id}/refund`, {
    reason,
  });

  console.log('[PaymentsAPI] ✅ Refund requested');
  
  return response;
}

// ============================================================================
// Export
// ============================================================================

export default {
  getPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
  getProjectPayments,
  getPaymentStats,
  cancelPayment,
  requestRefund,
};
