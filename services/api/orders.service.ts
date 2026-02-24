/**
 * Order API Service
 * Quản lý đơn hàng từ checkout đến theo dõi
 * Created: 03/02/2026
 */

import type { Product } from "@/data/products";
import { apiFetch } from "../api";

// ==================== TYPES ====================

export type OrderStatus =
  | "PENDING" // Chờ xác nhận
  | "CONFIRMED" // Đã xác nhận
  | "PROCESSING" // Đang xử lý
  | "SHIPPING" // Đang giao hàng
  | "DELIVERED" // Đã giao hàng
  | "COMPLETED" // Hoàn thành
  | "CANCELLED" // Đã hủy
  | "REFUNDED"; // Đã hoàn tiền

export type PaymentMethod =
  | "COD" // Thanh toán khi nhận hàng
  | "BANK_TRANSFER" // Chuyển khoản ngân hàng
  | "VNPAY" // VNPay
  | "MOMO" // MoMo
  | "ZALOPAY"; // ZaloPay

export type PaymentStatus =
  | "PENDING" // Chờ thanh toán
  | "PAID" // Đã thanh toán
  | "FAILED" // Thanh toán thất bại
  | "REFUNDED"; // Đã hoàn tiền

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  note?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  note?: string;
  couponCode?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

// ==================== API FUNCTIONS ====================

const BASE_PATH = "/orders";

/**
 * Tạo đơn hàng mới từ giỏ hàng
 */
export async function createOrder(data: CreateOrderDto): Promise<Order> {
  try {
    console.log("[OrderService] Creating order...");

    const order = await apiFetch<Order>(BASE_PATH, {
      method: "POST",
      body: JSON.stringify(data),
    });

    console.log("[OrderService] ✅ Order created:", order.orderNumber);
    return order;
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to create order:", error);
    throw new Error(
      error.message || "Không thể tạo đơn hàng. Vui lòng thử lại.",
    );
  }
}

/**
 * Lấy danh sách đơn hàng của user
 */
export async function getOrders(
  params: OrderQueryParams = {},
): Promise<OrdersResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    console.log("[OrderService] Fetching orders...");

    const response = await apiFetch<any>(url, { method: "GET" });

    // Handle different response formats
    const orders = Array.isArray(response)
      ? response
      : response?.data || response?.orders || [];
    const meta = response?.meta || {};

    console.log("[OrderService] ✅ Orders loaded:", orders.length);

    return {
      orders,
      total: meta?.total || orders.length,
      page: meta?.page || params.page || 1,
      limit: meta?.limit || params.limit || 20,
      hasMore: meta?.hasMore || false,
    };
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to fetch orders:", error);
    throw new Error("Không thể tải danh sách đơn hàng.");
  }
}

/**
 * Lấy chi tiết đơn hàng
 */
export async function getOrderById(orderId: string): Promise<Order> {
  try {
    console.log("[OrderService] Fetching order:", orderId);

    const order = await apiFetch<Order>(`${BASE_PATH}/${orderId}`, {
      method: "GET",
    });

    console.log("[OrderService] ✅ Order loaded:", order.orderNumber);
    return order;
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to fetch order:", error);
    throw new Error("Không tìm thấy đơn hàng.");
  }
}

/**
 * Hủy đơn hàng
 */
export async function cancelOrder(
  orderId: string,
  reason?: string,
): Promise<Order> {
  try {
    console.log("[OrderService] Cancelling order:", orderId);

    const order = await apiFetch<Order>(`${BASE_PATH}/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });

    console.log("[OrderService] ✅ Order cancelled:", order.orderNumber);
    return order;
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to cancel order:", error);
    throw new Error(error.message || "Không thể hủy đơn hàng.");
  }
}

/**
 * Lấy thông tin vận chuyển/tracking
 */
export async function getOrderTracking(orderId: string): Promise<{
  trackingNumber: string;
  carrier: string;
  status: string;
  history: Array<{
    status: string;
    location: string;
    timestamp: string;
  }>;
}> {
  try {
    console.log("[OrderService] Fetching tracking info:", orderId);

    const tracking = await apiFetch<any>(`${BASE_PATH}/${orderId}/tracking`, {
      method: "GET",
    });

    console.log("[OrderService] ✅ Tracking info loaded");
    return tracking;
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to fetch tracking:", error);
    throw new Error("Không thể tải thông tin vận chuyển.");
  }
}

/**
 * Xác nhận đã nhận hàng
 */
export async function confirmDelivery(orderId: string): Promise<Order> {
  try {
    console.log("[OrderService] Confirming delivery:", orderId);

    const order = await apiFetch<Order>(
      `${BASE_PATH}/${orderId}/confirm-delivery`,
      {
        method: "POST",
      },
    );

    console.log("[OrderService] ✅ Delivery confirmed:", order.orderNumber);
    return order;
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to confirm delivery:", error);
    throw new Error("Không thể xác nhận nhận hàng.");
  }
}

/**
 * Cập nhật trạng thái thanh toán sau khi callback
 */
export async function updatePaymentStatus(
  orderId: string,
  data: {
    paymentStatus: PaymentStatus;
    transactionId?: string;
    gateway?: string;
  },
): Promise<Order> {
  try {
    console.log(
      "[OrderService] Updating payment status:",
      orderId,
      data.paymentStatus,
    );

    const order = await apiFetch<Order>(
      `${BASE_PATH}/${orderId}/payment-status`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );

    console.log(
      "[OrderService] ✅ Payment status updated:",
      order.paymentStatus,
    );
    return order;
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to update payment status:", error);
    throw new Error("Không thể cập nhật trạng thái thanh toán.");
  }
}

// ==================== PAYMENT FUNCTIONS ====================

/**
 * Khởi tạo thanh toán VNPay
 */
export async function initiateVNPayPayment(
  orderId: string,
): Promise<{ paymentUrl: string }> {
  try {
    console.log("[OrderService] Initiating VNPay payment:", orderId);

    const response = await apiFetch<{ paymentUrl: string }>(
      `${BASE_PATH}/${orderId}/pay/vnpay`,
      {
        method: "POST",
      },
    );

    console.log("[OrderService] ✅ VNPay URL generated");
    return response;
  } catch (error: any) {
    console.error("[OrderService] ❌ VNPay init failed:", error);
    throw new Error("Không thể khởi tạo thanh toán VNPay.");
  }
}

/**
 * Khởi tạo thanh toán MoMo
 */
export async function initiateMoMoPayment(
  orderId: string,
): Promise<{ paymentUrl: string; deeplink: string }> {
  try {
    console.log("[OrderService] Initiating MoMo payment:", orderId);

    const response = await apiFetch<{ paymentUrl: string; deeplink: string }>(
      `${BASE_PATH}/${orderId}/pay/momo`,
      {
        method: "POST",
      },
    );

    console.log("[OrderService] ✅ MoMo URL generated");
    return response;
  } catch (error: any) {
    console.error("[OrderService] ❌ MoMo init failed:", error);
    throw new Error("Không thể khởi tạo thanh toán MoMo.");
  }
}

/**
 * Kiểm tra trạng thái thanh toán
 */
export async function checkPaymentStatus(orderId: string): Promise<{
  paid: boolean;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}> {
  try {
    console.log("[OrderService] Checking payment status:", orderId);

    const response = await apiFetch<any>(
      `${BASE_PATH}/${orderId}/payment-status`,
      {
        method: "GET",
      },
    );

    console.log("[OrderService] ✅ Payment status:", response.paymentStatus);
    return response;
  } catch (error: any) {
    console.error("[OrderService] ❌ Failed to check payment:", error);
    throw new Error("Không thể kiểm tra trạng thái thanh toán.");
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy label tiếng Việt cho trạng thái đơn hàng
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    REFUNDED: "Đã hoàn tiền",
  };
  return labels[status] || status;
}

/**
 * Lấy màu cho trạng thái đơn hàng
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    PENDING: "#FFA500", // Orange
    CONFIRMED: "#2196F3", // Blue
    PROCESSING: "#9C27B0", // Purple
    SHIPPING: "#00BCD4", // Cyan
    DELIVERED: "#4CAF50", // Green
    COMPLETED: "#8BC34A", // Light Green
    CANCELLED: "#F44336", // Red
    REFUNDED: "#795548", // Brown
  };
  return colors[status] || "#757575";
}

/**
 * Lấy label tiếng Việt cho phương thức thanh toán
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    COD: "Thanh toán khi nhận hàng",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
    VNPAY: "VNPay",
    MOMO: "Ví MoMo",
    ZALOPAY: "ZaloPay",
  };
  return labels[method] || method;
}

/**
 * Format giá tiền VND
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  getOrderTracking,
  confirmDelivery,
  updatePaymentStatus,
  initiateVNPayPayment,
  initiateMoMoPayment,
  checkPaymentStatus,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentMethodLabel,
  formatPrice,
};
