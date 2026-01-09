/**
 * Voucher Service
 * Handle voucher-related API calls to the backend
 */

import { BackendResult, getJson, postJson } from './backendClient';

// Types
export interface Voucher {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount: number;
  type: 'percent' | 'fixed';
  minOrder?: number;
  maxDiscount?: number;
  expiresAt: string;
  isUsed: boolean;
  isExpired: boolean;
  usedAt?: string;
  createdAt?: string;
}

export interface VoucherListResponse {
  vouchers: Voucher[];
  total: number;
}

export interface VoucherValidateResponse {
  valid: boolean;
  voucher?: Voucher;
  discount?: number;
  message?: string;
}

// API Endpoints
const ENDPOINTS = {
  list: '/api/vouchers',
  myVouchers: '/api/vouchers/my',
  validate: '/api/vouchers/validate',
  redeem: (code: string) => `/api/vouchers/${code}/redeem`,
};

/**
 * Get list of available vouchers for current user
 */
export async function getMyVouchers(): Promise<BackendResult<VoucherListResponse>> {
  const result = await getJson<VoucherListResponse>(ENDPOINTS.myVouchers, { retry: 2 });
  return result;
}

/**
 * Get all public vouchers
 */
export async function getPublicVouchers(): Promise<BackendResult<VoucherListResponse>> {
  const result = await getJson<VoucherListResponse>(ENDPOINTS.list, { retry: 2 });
  return result;
}

/**
 * Validate a voucher code for a given order amount
 */
export async function validateVoucher(
  code: string,
  orderAmount?: number
): Promise<BackendResult<VoucherValidateResponse>> {
  const result = await postJson<VoucherValidateResponse>(
    ENDPOINTS.validate,
    { code, orderAmount }
  );
  return result;
}

/**
 * Redeem/apply a voucher
 */
export async function redeemVoucher(
  code: string,
  orderId?: string
): Promise<BackendResult<{ success: boolean; voucher?: Voucher }>> {
  const result = await postJson(
    ENDPOINTS.redeem(code),
    { orderId }
  );
  return result;
}

// Mock data fallback
export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: '1',
    code: 'WELCOME2024',
    title: 'Giảm 10% đơn đầu tiên',
    description: 'Áp dụng cho đơn hàng từ 500.000đ',
    discount: 10,
    type: 'percent',
    minOrder: 500000,
    maxDiscount: 200000,
    expiresAt: '2025-12-31',
    isUsed: false,
    isExpired: false,
  },
  {
    id: '2',
    code: 'FREESHIP50',
    title: 'Giảm 50.000đ phí vận chuyển',
    description: 'Áp dụng cho tất cả đơn hàng',
    discount: 50000,
    type: 'fixed',
    expiresAt: '2025-06-30',
    isUsed: false,
    isExpired: false,
  },
  {
    id: '3',
    code: 'SUMMER20',
    title: 'Giảm 20% mùa hè',
    description: 'Tối đa 500.000đ',
    discount: 20,
    type: 'percent',
    minOrder: 1000000,
    maxDiscount: 500000,
    expiresAt: '2025-08-31',
    isUsed: false,
    isExpired: false,
  },
  {
    id: '4',
    code: 'VIP100K',
    title: 'Giảm 100.000đ cho VIP',
    description: 'Dành cho khách hàng VIP',
    discount: 100000,
    type: 'fixed',
    minOrder: 800000,
    expiresAt: '2025-12-31',
    isUsed: true,
    isExpired: false,
    usedAt: '2025-01-15',
  },
  {
    id: '5',
    code: 'EXPIRED01',
    title: 'Voucher hết hạn',
    discount: 15,
    type: 'percent',
    expiresAt: '2024-12-01',
    isUsed: false,
    isExpired: true,
  },
];

export default {
  getMyVouchers,
  getPublicVouchers,
  validateVoucher,
  redeemVoucher,
  MOCK_VOUCHERS,
};
