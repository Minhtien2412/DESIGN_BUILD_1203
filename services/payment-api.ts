/**
 * Payment API Service
 * Handles payment operations, invoices, subscriptions, and transaction history
 * 
 * Backend: Stripe (international) + Ready for VNPay/MoMo/ZaloPay (Vietnam)
 * Endpoints from: src/payment/payment.controller.ts
 */

import { del, get, post } from './api';

// ============================================================================
// Types
// ============================================================================

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  currency: string; // 'VND' | 'USD'
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'stripe' | 'vnpay' | 'momo' | 'zalopay' | 'bank_transfer';
  paymentIntentId?: string;
  transactionId?: string;
  description: string;
  metadata?: Record<string, any>;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingAmount: number;
  completedPayments: number;
  failedPayments: number;
  refundedAmount: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
  paymentsByMethod: {
    method: string;
    count: number;
    amount: number;
  }[];
  paymentsByStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreatePaymentDto {
  amount: number;
  currency?: string; // Default: 'VND'
  method: 'stripe' | 'vnpay' | 'momo' | 'zalopay';
  description: string;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionDto {
  plan: 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  paymentMethod?: 'stripe' | 'vnpay';
}

// ============================================================================
// API Functions - Stripe Integration (Current Backend)
// ============================================================================

/**
 * Create Payment Intent for one-time payment
 * POST /payment/intent
 */
export async function createPaymentIntent(
  dto: CreatePaymentDto
): Promise<PaymentIntent> {
  return post('/payment/intent', dto);
}

/**
 * Confirm payment after client completes on Stripe
 * POST /payment/intent/:paymentIntentId/confirm
 */
export async function confirmPayment(
  paymentIntentId: string
): Promise<Payment> {
  return post(`/payment/intent/${paymentIntentId}/confirm`, {});
}

/**
 * Create subscription (recurring payment)
 * POST /payment/subscription
 */
export async function createSubscription(
  dto: CreateSubscriptionDto
): Promise<Subscription> {
  return post('/payment/subscription', dto);
}

/**
 * Cancel subscription
 * DELETE /payment/subscription/:id
 */
export async function cancelSubscription(
  subscriptionId: number
): Promise<void> {
  return del(`/payment/subscription/${subscriptionId}`);
}

/**
 * Get payment history for current user
 * GET /payment/history
 */
export async function getPaymentHistory(): Promise<Payment[]> {
  return get('/payment/history');
}

/**
 * Get user's active subscriptions
 * GET /payment/subscriptions
 */
export async function getUserSubscriptions(): Promise<Subscription[]> {
  return get('/payment/subscriptions');
}

/**
 * Request refund for a payment
 * POST /payment/refund/:id
 */
export async function refundPayment(paymentId: number): Promise<Payment> {
  return post(`/payment/refund/${paymentId}`, {});
}

// ============================================================================
// API Functions - Vietnamese Payment Gateways (To Be Implemented)
// ============================================================================

/**
 * Create VNPay payment URL
 * Future: POST /payment/vnpay/create
 */
export async function createVNPayPayment(dto: {
  amount: number;
  orderInfo: string;
  returnUrl: string;
}): Promise<{ paymentUrl: string }> {
  // TODO: Implement when backend ready
  return post('/payment/vnpay/create', dto);
}

/**
 * Verify VNPay payment callback
 * Future: POST /payment/vnpay/callback
 */
export async function verifyVNPayPayment(params: Record<string, string>): Promise<Payment> {
  // TODO: Implement when backend ready
  return post('/payment/vnpay/callback', params);
}

/**
 * Create MoMo payment request
 * Future: POST /payment/momo/create
 */
export async function createMoMoPayment(dto: {
  amount: number;
  orderInfo: string;
  returnUrl: string;
}): Promise<{ payUrl: string; deeplink: string; qrCodeUrl: string }> {
  // TODO: Implement when backend ready
  return post('/payment/momo/create', dto);
}

/**
 * Create ZaloPay order
 * Future: POST /payment/zalopay/create
 */
export async function createZaloPayOrder(dto: {
  amount: number;
  description: string;
  redirectUrl: string;
}): Promise<{ orderUrl: string; orderToken: string }> {
  // TODO: Implement when backend ready
  return post('/payment/zalopay/create', dto);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format amount to VND currency string
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format amount to USD currency string
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format amount based on currency
 */
export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'VND') {
    return formatVND(amount);
  }
  return formatUSD(amount);
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: Payment['status']): string {
  switch (status) {
    case 'completed':
      return '#0D9488'; // Emerald
    case 'pending':
      return '#0D9488'; // Emerald
    case 'failed':
      return '#1A1A1A'; // Black
    case 'refunded':
      return '#4A4A4A'; // Gray
    default:
      return '#1A1A1A'; // Black
  }
}

/**
 * Get payment status label (Vietnamese)
 */
export function getPaymentStatusLabel(status: Payment['status']): string {
  switch (status) {
    case 'completed':
      return 'Đã thanh toán';
    case 'pending':
      return 'Chờ xử lý';
    case 'failed':
      return 'Thất bại';
    case 'refunded':
      return 'Đã hoàn tiền';
    default:
      return 'Không xác định';
  }
}

/**
 * Get payment method label (Vietnamese)
 */
export function getPaymentMethodLabel(method: Payment['method']): string {
  switch (method) {
    case 'stripe':
      return 'Thẻ quốc tế (Stripe)';
    case 'vnpay':
      return 'VNPay';
    case 'momo':
      return 'Ví MoMo';
    case 'zalopay':
      return 'ZaloPay';
    case 'bank_transfer':
      return 'Chuyển khoản ngân hàng';
    default:
      return method;
  }
}

/**
 * Get payment method icon name (Ionicons)
 */
export function getPaymentMethodIcon(method: Payment['method']): string {
  switch (method) {
    case 'stripe':
      return 'card-outline';
    case 'vnpay':
      return 'wallet-outline';
    case 'momo':
      return 'wallet-outline';
    case 'zalopay':
      return 'wallet-outline';
    case 'bank_transfer':
      return 'business-outline';
    default:
      return 'cash-outline';
  }
}

/**
 * Get subscription plan label (Vietnamese)
 */
export function getSubscriptionPlanLabel(plan: Subscription['plan']): string {
  switch (plan) {
    case 'free':
      return 'Miễn phí';
    case 'pro':
      return 'Pro (₫199,000/tháng)';
    case 'enterprise':
      return 'Enterprise (₫999,000/tháng)';
    default:
      return plan;
  }
}

/**
 * Get subscription status color
 */
export function getSubscriptionStatusColor(status: Subscription['status']): string {
  switch (status) {
    case 'active':
      return '#0D9488'; // Emerald
    case 'past_due':
      return '#0D9488'; // Emerald
    case 'cancelled':
    case 'unpaid':
      return '#1A1A1A'; // Black
    default:
      return '#1A1A1A';
  }
}

/**
 * Get subscription status label (Vietnamese)
 */
export function getSubscriptionStatusLabel(status: Subscription['status']): string {
  switch (status) {
    case 'active':
      return 'Đang hoạt động';
    case 'cancelled':
      return 'Đã hủy';
    case 'past_due':
      return 'Quá hạn';
    case 'unpaid':
      return 'Chưa thanh toán';
    default:
      return status;
  }
}

/**
 * Calculate total amount from payment array
 */
export function calculateTotalAmount(payments: Payment[]): number {
  return payments.reduce((sum, payment) => {
    if (payment.status === 'completed') {
      return sum + payment.amount;
    }
    return sum;
  }, 0);
}

/**
 * Group payments by date
 */
export function groupPaymentsByDate(payments: Payment[]): Record<string, Payment[]> {
  return payments.reduce((groups, payment) => {
    const date = new Date(payment.createdAt).toLocaleDateString('vi-VN');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(payment);
    return groups;
  }, {} as Record<string, Payment[]>);
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isSubscriptionExpiringSoon(subscription: Subscription): boolean {
  const expiryDate = new Date(subscription.currentPeriodEnd);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

/**
 * Get days until subscription expires
 */
export function getDaysUntilExpiry(subscription: Subscription): number {
  const expiryDate = new Date(subscription.currentPeriodEnd);
  const today = new Date();
  return Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Stripe
  createPaymentIntent,
  confirmPayment,
  createSubscription,
  cancelSubscription,
  getPaymentHistory,
  getUserSubscriptions,
  refundPayment,
  
  // Vietnamese Gateways (Future)
  createVNPayPayment,
  verifyVNPayPayment,
  createMoMoPayment,
  createZaloPayOrder,
  
  // Helpers
  formatVND,
  formatUSD,
  formatCurrency,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
  getSubscriptionPlanLabel,
  getSubscriptionStatusColor,
  getSubscriptionStatusLabel,
  calculateTotalAmount,
  groupPaymentsByDate,
  isSubscriptionExpiringSoon,
  getDaysUntilExpiry,
};
