/**
 * Shipping API Service
 * Tính phí vận chuyển theo vùng miền
 * Created: 2026-03-04
 */

import { apiFetch } from "../api";

// ==================== TYPES ====================

export interface ShippingEstimate {
  fee: number;
  estimatedDays: number;
  zoneName: string;
  freeShipping: boolean;
  freeShippingThreshold: number | null;
}

export interface ShippingZone {
  id?: number;
  name: string;
  provinces: string[];
  baseRate: number;
  perKgRate: number;
  freeShippingThreshold: number | null;
  estimatedDays: number;
}

// ==================== API CALLS ====================

/**
 * Estimate shipping cost based on destination
 */
export async function estimateShipping(params: {
  city: string;
  district?: string;
  totalWeight?: number;
  itemCount?: number;
  subtotal?: number;
}): Promise<{ success: boolean; data: ShippingEstimate }> {
  return apiFetch("/shipping/estimate", {
    method: "POST",
    data: params,
  }) as any;
}

/**
 * Get all shipping zones with rates
 */
export async function getShippingZones(): Promise<{
  success: boolean;
  data: ShippingZone[];
}> {
  return apiFetch("/shipping/zones") as any;
}

/**
 * Format shipping fee for display
 */
export function formatShippingFee(fee: number): string {
  if (fee === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(fee);
}

/**
 * Format estimated delivery days
 */
export function formatEstimatedDelivery(days: number): string {
  if (days <= 1) return "Giao trong ngày";
  return `Giao trong ${days} ngày`;
}

export default {
  estimateShipping,
  getShippingZones,
  formatShippingFee,
  formatEstimatedDelivery,
};
