/**
 * Payment Service (Canonical)
 * ============================
 *
 * Service xử lý thanh toán với VNPay, MoMo, ZaloPay, Stripe, ACB.
 * Hỗ trợ cả sandbox và production environments.
 *
 * Flow chuẩn:
 *  1) Frontend gọi createPaymentViaAPI() → Backend /v1/payment/init (unified)
 *  2) Backend tạo URL/QR → Frontend mở WebBrowser hoặc hiển thị QR
 *  3) Callback → payment-callback.tsx → verifyPayment
 *
 * Legacy: createPayment() build URL client-side (VNPay, MoMo, ZaloPay)
 *
 * @author ThietKeResort Team
 * @created 2025-01-12
 * @updated 2025-06-12 - Added ACB, unified backend API support
 */

import CryptoJS from "crypto-js";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { PAYMENT_CONFIG, isServiceConfigured } from "../config/externalApis";
import { get, post } from "./api";

// ============================================
// Types
// ============================================
export type PaymentProvider =
  | "vnpay"
  | "momo"
  | "zalopay"
  | "stripe"
  | "bank_transfer"
  | "acb";

/** Gateway enum matching backend UnifiedPaymentGateway */
export type UnifiedGateway =
  | "VNPAY"
  | "ACB"
  | "MOMO"
  | "STRIPE"
  | "BANK_TRANSFER";

const PROVIDER_TO_GATEWAY: Record<PaymentProvider, UnifiedGateway> = {
  vnpay: "VNPAY",
  momo: "MOMO",
  zalopay: "VNPAY", // ZaloPay routes through VNPay gateway on backend or handled separately
  stripe: "STRIPE",
  bank_transfer: "BANK_TRANSFER",
  acb: "ACB",
};

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  message: string;
  rawResponse?: any;
}

export interface PaymentMethod {
  id: PaymentProvider;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate random transaction ID
 */
function generateTransactionId(prefix: string = "TXN"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

/**
 * Format amount for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "VND",
): string {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Sort object keys and build query string
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });
  return sorted;
}

// ============================================
// VNPay Implementation
// ============================================
async function createVNPayPayment(order: PaymentOrder): Promise<string | null> {
  const config = PAYMENT_CONFIG.vnpay;

  if (!config.tmnCode || !config.hashSecret) return null;

  try {
    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
    const orderId = order.id || generateTransactionId("VNP");

    let vnpParams: Record<string, any> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: config.tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: order.description.slice(0, 255),
      vnp_OrderType: "other",
      vnp_Amount: order.amount * 100, // VNPay requires amount * 100
      vnp_ReturnUrl: config.returnUrl,
      vnp_IpAddr: "127.0.0.1",
      vnp_CreateDate: createDate,
    };

    // Sort and sign
    vnpParams = sortObject(vnpParams);

    const signData = Object.keys(vnpParams)
      .map((key) => `${key}=${vnpParams[key]}`)
      .join("&");

    const hmac = CryptoJS.HmacSHA512(signData, config.hashSecret);
    const secureHash = hmac.toString(CryptoJS.enc.Hex);

    vnpParams["vnp_SecureHash"] = secureHash;

    const queryString = Object.keys(vnpParams)
      .map((key) => `${key}=${vnpParams[key]}`)
      .join("&");

    return `${config.url}?${queryString}`;
  } catch (error) {
    console.error("[PaymentService] VNPay error:", error);
    return null;
  }
}

function verifyVNPayResponse(params: Record<string, string>): boolean {
  const config = PAYMENT_CONFIG.vnpay;

  if (!config.hashSecret) return false;

  const secureHash = params["vnp_SecureHash"];
  delete params["vnp_SecureHash"];
  delete params["vnp_SecureHashType"];

  const sortedParams = sortObject(params);
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join("&");

  const hmac = CryptoJS.HmacSHA512(signData, config.hashSecret);
  const checkHash = hmac.toString(CryptoJS.enc.Hex);

  return secureHash === checkHash;
}

// ============================================
// MoMo Implementation (API v3 - captureWallet)
// Docs: https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime/
// ============================================

export interface MoMoItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  manufacturer?: string;
  price: number;
  currency: string;
  quantity: number;
  unit?: string;
  totalPrice: number;
  taxAmount?: number;
}

export interface MoMoUserInfo {
  name?: string;
  phoneNumber?: string;
  email?: string;
}

export interface MoMoDeliveryInfo {
  deliveryAddress?: string;
  deliveryFee?: string;
  quantity?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  deeplinkMiniApp?: string;
  signature: string;
  userFee?: number;
}

async function createMoMoPayment(
  order: PaymentOrder,
  options?: {
    items?: MoMoItem[];
    userInfo?: MoMoUserInfo;
    deliveryInfo?: MoMoDeliveryInfo;
  },
): Promise<MoMoPaymentResponse | null> {
  const config = PAYMENT_CONFIG.momo;

  if (!config.partnerCode || !config.accessKey || !config.secretKey) {
    console.error("[MoMo] Missing credentials");
    return null;
  }

  try {
    const requestId = generateTransactionId("MM");
    const orderId = order.id || generateTransactionId("ORD");
    const requestType = "captureWallet";
    const extraData = order.metadata
      ? btoa(unescape(encodeURIComponent(JSON.stringify(order.metadata))))
      : "";
    const redirectUrl = "thietkeresort://payment/momo/callback";
    const ipnUrl = "https://api.baotienweb.cloud/payment/momo/ipn";

    // Build signature string (sorted a-z as per MoMo docs)
    const rawSignature = [
      `accessKey=${config.accessKey}`,
      `amount=${order.amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${order.description}`,
      `partnerCode=${config.partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join("&");

    const signature = CryptoJS.HmacSHA256(
      rawSignature,
      config.secretKey,
    ).toString();

    const requestBody: Record<string, any> = {
      partnerCode: config.partnerCode,
      partnerName: "Bảo Tiến Web",
      storeId: "BaoTienStore",
      requestId,
      amount: order.amount,
      orderId,
      orderInfo: order.description,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      extraData,
      requestType,
      signature,
      autoCapture: true, // Auto capture payment
    };

    // Add optional items (products being purchased)
    if (options?.items && options.items.length > 0) {
      requestBody.items = options.items.slice(0, 50); // Max 50 items
    }

    // Add optional user info
    if (options?.userInfo) {
      requestBody.userInfo = options.userInfo;
    }

    // Add optional delivery info
    if (options?.deliveryInfo) {
      requestBody.deliveryInfo = options.deliveryInfo;
    }

    console.log("[MoMo] Creating payment:", {
      orderId,
      amount: order.amount,
      endpoint: `${config.endpoint}/create`,
    });

    const response = await fetch(`${config.endpoint}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: MoMoPaymentResponse = await response.json();

    console.log("[MoMo] Response:", {
      resultCode: data.resultCode,
      message: data.message,
      orderId: data.orderId,
    });

    if (data.resultCode === 0) {
      return data;
    }

    console.error(
      "[MoMo] Payment failed:",
      data.message,
      `(Code: ${data.resultCode})`,
    );
    return data; // Return full response even on error for handling
  } catch (error) {
    console.error("[MoMo] Request error:", error);
    return null;
  }
}

/**
 * Create MoMo Quick Pay v2 payment (payWithMethod)
 * Supports one-click payment after user has linked payment method
 * Ref: https://developers.momo.vn/v3/vi/docs/payment/api/quick-pay-v2/
 */
async function createMoMoQuickPay(
  order: PaymentOrder,
  options?: {
    items?: MoMoItem[];
    userInfo?: MoMoUserInfo;
    deliveryInfo?: MoMoDeliveryInfo;
    paymentCode?: string; // For POS QR quick pay
  },
): Promise<MoMoPaymentResponse | null> {
  const config = PAYMENT_CONFIG.momo;

  if (!config.partnerCode || !config.accessKey || !config.secretKey) {
    console.error("[MoMo QuickPay] Missing credentials");
    return null;
  }

  try {
    const requestId = generateTransactionId("QP");
    const orderId = order.id || generateTransactionId("ORD");
    const requestType = "payWithMethod";
    const extraData = order.metadata
      ? btoa(unescape(encodeURIComponent(JSON.stringify(order.metadata))))
      : "";
    const redirectUrl = "thietkeresort://payment/momo/callback";
    const ipnUrl = "https://api.baotienweb.cloud/payment/momo/ipn";

    // Build signature string (sorted a-z as per MoMo docs)
    const rawSignature = [
      `accessKey=${config.accessKey}`,
      `amount=${order.amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${order.description}`,
      `partnerCode=${config.partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join("&");

    const signature = CryptoJS.HmacSHA256(
      rawSignature,
      config.secretKey,
    ).toString();

    const requestBody: Record<string, any> = {
      partnerCode: config.partnerCode,
      partnerName: "Bảo Tiến Web",
      storeId: "BaoTienStore",
      requestId,
      amount: order.amount,
      orderId,
      orderInfo: order.description,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      extraData,
      requestType,
      signature,
      autoCapture: true,
    };

    // Add optional items
    if (options?.items && options.items.length > 0) {
      requestBody.items = options.items.slice(0, 50);
    }

    // Add optional user info
    if (options?.userInfo) {
      requestBody.userInfo = options.userInfo;
    }

    // Add optional delivery info
    if (options?.deliveryInfo) {
      requestBody.deliveryInfo = options.deliveryInfo;
    }

    // Add payment code for POS QR pay
    if (options?.paymentCode) {
      requestBody.paymentCode = options.paymentCode;
    }

    console.log("[MoMo QuickPay] Creating payment:", {
      orderId,
      amount: order.amount,
      requestType,
      endpoint: `${config.endpoint}/create`,
    });

    const response = await fetch(`${config.endpoint}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: MoMoPaymentResponse = await response.json();

    console.log("[MoMo QuickPay] Response:", {
      resultCode: data.resultCode,
      message: data.message,
      orderId: data.orderId,
    });

    if (data.resultCode === 0) {
      return data;
    }

    console.error(
      "[MoMo QuickPay] Payment failed:",
      data.message,
      `(Code: ${data.resultCode})`,
    );
    return data;
  } catch (error) {
    console.error("[MoMo QuickPay] Request error:", error);
    return null;
  }
}

/**
 * Verify MoMo IPN/redirect callback signature
 */
function verifyMoMoSignature(params: {
  accessKey?: string;
  amount: number;
  extraData: string;
  message: string;
  orderId: string;
  orderInfo: string;
  orderType: string;
  partnerCode: string;
  payType: string;
  requestId: string;
  responseTime: number;
  resultCode: number;
  transId: number;
  signature: string;
}): boolean {
  const config = PAYMENT_CONFIG.momo;

  if (!config.secretKey) return false;

  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${params.amount}`,
    `extraData=${params.extraData}`,
    `message=${params.message}`,
    `orderId=${params.orderId}`,
    `orderInfo=${params.orderInfo}`,
    `orderType=${params.orderType}`,
    `partnerCode=${params.partnerCode}`,
    `payType=${params.payType}`,
    `requestId=${params.requestId}`,
    `responseTime=${params.responseTime}`,
    `resultCode=${params.resultCode}`,
    `transId=${params.transId}`,
  ].join("&");

  const expectedSignature = CryptoJS.HmacSHA256(
    rawSignature,
    config.secretKey,
  ).toString();

  return params.signature === expectedSignature;
}

/**
 * Check MoMo payment status
 */
async function checkMoMoPaymentStatus(
  orderId: string,
  requestId?: string,
): Promise<MoMoPaymentResponse | null> {
  const config = PAYMENT_CONFIG.momo;

  if (!config.partnerCode || !config.accessKey || !config.secretKey)
    return null;

  try {
    const reqId = requestId || generateTransactionId("CHK");

    const rawSignature = [
      `accessKey=${config.accessKey}`,
      `orderId=${orderId}`,
      `partnerCode=${config.partnerCode}`,
      `requestId=${reqId}`,
    ].join("&");

    const signature = CryptoJS.HmacSHA256(
      rawSignature,
      config.secretKey,
    ).toString();

    const response = await fetch(`${config.endpoint}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partnerCode: config.partnerCode,
        requestId: reqId,
        orderId,
        signature,
        lang: "vi",
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("[MoMo] Check status error:", error);
    return null;
  }
}

// ============================================
// ZaloPay Implementation
// ============================================
async function createZaloPayPayment(
  order: PaymentOrder,
): Promise<string | null> {
  const config = PAYMENT_CONFIG.zalopay;

  if (!config.appId || !config.key1) return null;

  try {
    const transId = Math.floor(Math.random() * 1000000);
    const appTransId = `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${transId}`;
    const appTime = Date.now();

    const embedData = JSON.stringify({
      redirecturl: "thietkeresort://payment/zalopay/callback",
    });

    const items = JSON.stringify([
      {
        itemid: order.id,
        itemname: order.description,
        itemprice: order.amount,
        itemquantity: 1,
      },
    ]);

    const hmacInput = [
      config.appId,
      appTransId,
      order.customerPhone || "user",
      order.amount,
      appTime,
      embedData,
      items,
    ].join("|");

    const mac = CryptoJS.HmacSHA256(hmacInput, config.key1).toString();

    const requestBody = {
      app_id: config.appId,
      app_user: order.customerPhone || "user",
      app_trans_id: appTransId,
      app_time: appTime,
      amount: order.amount,
      item: items,
      description: order.description,
      embed_data: embedData,
      bank_code: "",
      mac,
      callback_url: "https://api.thietkeresort.com/payment/zalopay/callback",
    };

    const response = await fetch(`${config.endpoint}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(requestBody as any).toString(),
    });

    const data = await response.json();

    if (data.return_code === 1 && data.order_url) {
      return data.order_url;
    }

    console.error("[PaymentService] ZaloPay error:", data.return_message);
    return null;
  } catch (error) {
    console.error("[PaymentService] ZaloPay error:", error);
    return null;
  }
}

// ============================================
// Unified Backend API Payment (RECOMMENDED)
// ============================================

/**
 * Response from unified /v1/payment/init endpoint
 */
export interface UnifiedPaymentResponse {
  transactionId: string;
  orderId: string;
  amount: number;
  status: string;
  gateway: UnifiedGateway;
  paymentUrl?: string;
  qrCodeUrl?: string;
  message?: string;
}

/**
 * Create payment via backend unified API (RECOMMENDED FLOW)
 * Secrets stay on server. Works for VNPay, ACB, Stripe.
 */
export async function createPaymentViaAPI(
  provider: PaymentProvider,
  order: PaymentOrder,
): Promise<PaymentResult> {
  const orderId = order.id || generateTransactionId("ORD");
  const gateway = PROVIDER_TO_GATEWAY[provider];

  // Bank transfer handled locally (no backend call needed)
  if (provider === "bank_transfer") {
    return {
      success: true,
      orderId,
      provider,
      status: "pending",
      amount: order.amount,
      message: "Vui lòng chuyển khoản theo thông tin bên dưới",
      rawResponse: getBankTransferInfo(orderId, order.amount),
    };
  }

  // MoMo: now routes through backend API (secrets stay on server)
  if (provider === "momo") {
    try {
      const response: UnifiedPaymentResponse = await post("/v1/payment/init", {
        gateway: "MOMO" as UnifiedGateway,
        amount: order.amount,
        orderId,
        description: order.description,
        returnUrl: `thietkeresort://payment/callback?gateway=momo&orderId=${orderId}`,
        notifyUrl: undefined,
        projectId: order.metadata?.projectId,
      });

      if (!response.paymentUrl && !response.qrCodeUrl) {
        return {
          success: false,
          orderId,
          provider,
          status: "failed" as PaymentStatus,
          amount: order.amount,
          message: response.message || "Không thể tạo thanh toán MoMo",
        };
      }

      // Open MoMo payment URL
      const url = response.paymentUrl || response.qrCodeUrl;
      if (url) {
        if (Platform.OS === "web") {
          window.location.href = url;
        } else {
          const result = await WebBrowser.openBrowserAsync(url, {
            showTitle: true,
            toolbarColor: "#A50064",
            enableBarCollapsing: true,
          });
          if (result.type === "cancel") {
            return {
              success: false,
              transactionId: response.transactionId,
              orderId,
              provider,
              status: "cancelled" as PaymentStatus,
              amount: order.amount,
              message: "Bạn đã hủy thanh toán",
            };
          }
        }
      }

      return {
        success: true,
        transactionId: response.transactionId,
        orderId,
        provider,
        status: "processing" as PaymentStatus,
        amount: order.amount,
        message: response.message || "Đang xử lý thanh toán MoMo...",
        rawResponse: response,
      };
    } catch (error: any) {
      console.error("[PaymentService] MoMo API error:", error);
      return {
        success: false,
        orderId,
        provider,
        status: "failed" as PaymentStatus,
        amount: order.amount,
        message: error.message || "Có lỗi xảy ra khi thanh toán MoMo",
      };
    }
  }

  // ZaloPay: still uses client-side flow (no backend service yet)
  if (provider === "zalopay") {
    return createPayment(provider, order);
  }

  try {
    const response: UnifiedPaymentResponse = await post("/v1/payment/init", {
      gateway,
      amount: order.amount,
      orderId,
      description: order.description,
      returnUrl: `thietkeresort://payment/callback?gateway=${provider}&orderId=${orderId}`,
      notifyUrl: undefined,
      projectId: order.metadata?.projectId,
    });

    if (!response.paymentUrl && !response.qrCodeUrl) {
      return {
        success: false,
        orderId,
        provider,
        status: "failed",
        amount: order.amount,
        message: response.message || "Không thể tạo thanh toán",
      };
    }

    // Open payment URL for VNPay/ACB
    const url = response.paymentUrl || response.qrCodeUrl;
    if (url && provider !== "stripe") {
      if (Platform.OS === "web") {
        window.location.href = url;
      } else {
        const result = await WebBrowser.openBrowserAsync(url, {
          showTitle: true,
          toolbarColor: "#0D9488",
          enableBarCollapsing: true,
        });

        if (result.type === "cancel") {
          return {
            success: false,
            transactionId: response.transactionId,
            orderId,
            provider,
            status: "cancelled",
            amount: order.amount,
            message: "Bạn đã hủy thanh toán",
          };
        }
      }
    }

    return {
      success: true,
      transactionId: response.transactionId,
      orderId,
      provider,
      status: "processing",
      amount: order.amount,
      message: response.message || "Đang xử lý thanh toán...",
      rawResponse: response,
    };
  } catch (error: any) {
    console.error(`[PaymentService] API payment error (${provider}):`, error);
    return {
      success: false,
      orderId,
      provider,
      status: "failed",
      amount: order.amount,
      message: error.message || "Có lỗi xảy ra khi thanh toán",
    };
  }
}

/**
 * Query VNPay transaction status via backend
 */
export async function queryVnpayTransaction(
  orderId: string,
  transDate: string,
): Promise<any> {
  return post("/v1/payment/vnpay/query", { orderId, transDate });
}

/**
 * Request VNPay refund via backend
 */
export async function refundVnpayTransaction(params: {
  orderId: string;
  amount: number;
  transactionNo: string;
  transDate: string;
  transactionType?: "02" | "03";
}): Promise<any> {
  return post("/v1/payment/vnpay/refund", params);
}

/**
 * Query MoMo transaction status via backend
 */
export async function queryMomoTransaction(orderId: string): Promise<any> {
  return post("/v1/payment/momo/query", { orderId });
}

/**
 * Request MoMo refund via backend
 */
export async function refundMomoTransaction(params: {
  orderId: string;
  amount: number;
  transId: number;
  description?: string;
}): Promise<any> {
  return post("/v1/payment/momo/refund", params);
}

/**
 * Get VNPay supported banks
 */
export async function getVnpayBanks(): Promise<any[]> {
  return get("/v1/payment/vnpay/banks");
}

// ============================================
// Main Payment Functions
// ============================================

/**
 * Get available payment methods
 */
export function getAvailablePaymentMethods(): PaymentMethod[] {
  const methods: PaymentMethod[] = [
    {
      id: "vnpay",
      name: "VNPay",
      icon: "card-outline",
      description: "Thanh toán qua VNPay QR, ATM, Visa/Mastercard",
      enabled: isServiceConfigured("vnpay"),
      minAmount: 10000,
      maxAmount: 500000000,
    },
    {
      id: "momo",
      name: "MoMo",
      icon: "wallet-outline",
      description: "Thanh toán qua ví MoMo",
      enabled: isServiceConfigured("momo"),
      minAmount: 1000,
      maxAmount: 50000000,
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      icon: "phone-portrait-outline",
      description: "Thanh toán qua ví ZaloPay",
      enabled: isServiceConfigured("zalopay"),
      minAmount: 1000,
      maxAmount: 50000000,
    },
    {
      id: "stripe",
      name: "Thẻ quốc tế",
      icon: "globe-outline",
      description: "Visa, Mastercard, JCB, AMEX",
      enabled: isServiceConfigured("stripe"),
      minAmount: 10000,
    },
    {
      id: "acb",
      name: "ACB ONE Connect",
      icon: "business-outline",
      description: "Thanh toán qua ACB Online / QR",
      enabled: true,
      minAmount: 10000,
      maxAmount: 500000000,
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản",
      icon: "business-outline",
      description: "Chuyển khoản ngân hàng",
      enabled: true,
    },
  ];

  return methods;
}

/**
 * Create payment and open payment URL
 */
export async function createPayment(
  provider: PaymentProvider,
  order: PaymentOrder,
): Promise<PaymentResult> {
  const orderId = order.id || generateTransactionId("ORD");

  try {
    let paymentUrl: string | null = null;
    let momoResponse: MoMoPaymentResponse | null = null;

    switch (provider) {
      case "vnpay":
        paymentUrl = await createVNPayPayment({ ...order, id: orderId });
        break;
      case "momo":
        momoResponse = await createMoMoPayment({ ...order, id: orderId });
        if (momoResponse?.resultCode === 0) {
          // Try deeplink first on mobile, fallback to payUrl
          if (Platform.OS !== "web" && momoResponse.deeplink) {
            paymentUrl = momoResponse.deeplink;
          } else {
            paymentUrl = momoResponse.payUrl || null;
          }
        } else if (momoResponse) {
          return {
            success: false,
            orderId,
            provider,
            status: "failed",
            amount: order.amount,
            message: momoResponse.message || "MoMo payment failed",
            rawResponse: momoResponse,
          };
        }
        break;
      case "zalopay":
        paymentUrl = await createZaloPayPayment({ ...order, id: orderId });
        break;
      case "bank_transfer":
        // Return bank transfer info
        return {
          success: true,
          orderId,
          provider,
          status: "pending",
          amount: order.amount,
          message: "Vui lòng chuyển khoản theo thông tin bên dưới",
          rawResponse: getBankTransferInfo(orderId, order.amount),
        };
      default:
        return {
          success: false,
          orderId,
          provider,
          status: "failed",
          amount: order.amount,
          message: "Phương thức thanh toán không được hỗ trợ",
        };
    }

    if (!paymentUrl) {
      return {
        success: false,
        orderId,
        provider,
        status: "failed",
        amount: order.amount,
        message: "Không thể tạo link thanh toán. Vui lòng thử lại sau.",
      };
    }

    // Open payment URL
    if (Platform.OS === "web") {
      window.location.href = paymentUrl;
    } else {
      // Use WebBrowser for in-app browser experience
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        showTitle: true,
        toolbarColor: "#0D9488",
        enableBarCollapsing: true,
      });

      // Check result
      if (result.type === "cancel") {
        return {
          success: false,
          orderId,
          provider,
          status: "cancelled",
          amount: order.amount,
          message: "Bạn đã hủy thanh toán",
        };
      }
    }

    return {
      success: true,
      orderId,
      provider,
      status: "processing",
      amount: order.amount,
      message: "Đang xử lý thanh toán...",
    };
  } catch (error: any) {
    console.error("[PaymentService] Error:", error);
    return {
      success: false,
      orderId,
      provider,
      status: "failed",
      amount: order.amount,
      message: error.message || "Có lỗi xảy ra khi thanh toán",
    };
  }
}

/**
 * Process payment callback/return URL
 */
export function processPaymentCallback(
  provider: PaymentProvider,
  params: Record<string, string>,
): PaymentResult {
  switch (provider) {
    case "vnpay": {
      const isValid = verifyVNPayResponse({ ...params });
      const responseCode = params["vnp_ResponseCode"];
      const transactionId = params["vnp_TransactionNo"];
      const orderId = params["vnp_TxnRef"];
      const amount = parseInt(params["vnp_Amount"], 10) / 100;

      if (!isValid) {
        return {
          success: false,
          transactionId,
          orderId,
          provider,
          status: "failed",
          amount,
          message: "Chữ ký không hợp lệ",
        };
      }

      if (responseCode === "00") {
        return {
          success: true,
          transactionId,
          orderId,
          provider,
          status: "completed",
          amount,
          message: "Thanh toán thành công",
          rawResponse: params,
        };
      }

      const errorMessages: Record<string, string> = {
        "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên hệ VNPay)",
        "09": "Thẻ/Tài khoản chưa đăng ký InternetBanking",
        "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
        "11": "Hết hạn chờ thanh toán",
        "12": "Thẻ/Tài khoản bị khóa",
        "13": "Nhập sai OTP",
        "24": "Khách hàng hủy giao dịch",
        "51": "Tài khoản không đủ số dư",
        "65": "Vượt hạn mức giao dịch trong ngày",
        "75": "Ngân hàng đang bảo trì",
        "79": "Nhập sai mật khẩu thanh toán",
        "99": "Lỗi không xác định",
      };

      return {
        success: false,
        transactionId,
        orderId,
        provider,
        status: responseCode === "24" ? "cancelled" : "failed",
        amount,
        message: errorMessages[responseCode] || "Thanh toán thất bại",
        rawResponse: params,
      };
    }

    case "momo": {
      const resultCode = params["resultCode"];
      const transactionId = params["transId"];
      const orderId = params["orderId"];
      const amount = parseInt(params["amount"], 10);

      if (resultCode === "0") {
        return {
          success: true,
          transactionId,
          orderId,
          provider,
          status: "completed",
          amount,
          message: "Thanh toán MoMo thành công",
          rawResponse: params,
        };
      }

      return {
        success: false,
        transactionId,
        orderId,
        provider,
        status: "failed",
        amount,
        message: params["message"] || "Thanh toán MoMo thất bại",
        rawResponse: params,
      };
    }

    case "zalopay": {
      const returnCode = params["return_code"];
      const transactionId = params["zp_trans_id"];
      const orderId = params["app_trans_id"];
      const amount = parseInt(params["amount"], 10);

      if (returnCode === "1") {
        return {
          success: true,
          transactionId,
          orderId,
          provider,
          status: "completed",
          amount,
          message: "Thanh toán ZaloPay thành công",
          rawResponse: params,
        };
      }

      return {
        success: false,
        transactionId,
        orderId,
        provider,
        status: "failed",
        amount,
        message: params["return_message"] || "Thanh toán ZaloPay thất bại",
        rawResponse: params,
      };
    }

    default:
      return {
        success: false,
        orderId: "",
        provider,
        status: "failed",
        amount: 0,
        message: "Provider không được hỗ trợ",
      };
  }
}

/**
 * Get bank transfer info
 */
function getBankTransferInfo(orderId: string, amount: number) {
  return {
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "CÔNG TY TNHH THIẾT KẾ RESORT",
    branch: "Chi nhánh TP.HCM",
    content: `THANHOAN ${orderId}`,
    amount: amount,
    formattedAmount: formatCurrency(amount),
    qrCode: `https://img.vietqr.io/image/VCB-1234567890-compact.png?amount=${amount}&addInfo=THANHOAN%20${orderId}`,
  };
}

/**
 * Check payment status (for polling)
 */
export async function checkPaymentStatus(
  provider: PaymentProvider,
  orderId: string,
): Promise<PaymentResult> {
  // Handle MoMo status check
  if (provider === "momo") {
    const momoStatus = await checkMoMoPaymentStatus(orderId);
    if (momoStatus) {
      const isSuccess = momoStatus.resultCode === 0;
      return {
        success: isSuccess,
        transactionId: String(momoStatus.responseTime || ""),
        orderId,
        provider,
        status: isSuccess
          ? "completed"
          : momoStatus.resultCode === 1000
            ? "pending"
            : "failed",
        amount: momoStatus.amount || 0,
        message: momoStatus.message,
        rawResponse: momoStatus,
      };
    }
  }

  // Default: return pending (would call backend for other providers)
  return {
    success: true,
    orderId,
    provider,
    status: "pending",
    amount: 0,
    message: "Đang kiểm tra trạng thái thanh toán...",
  };
}

// Export MoMo specific functions for direct use
export { checkMoMoPaymentStatus, createMoMoPayment, verifyMoMoSignature };

export default {
  getAvailablePaymentMethods,
  createPayment,
  createPaymentViaAPI,
  processPaymentCallback,
  checkPaymentStatus,
  formatCurrency,
  // Backend API helpers
  queryVnpayTransaction,
  refundVnpayTransaction,
  getVnpayBanks,
  queryMomoTransaction,
  refundMomoTransaction,
  // MoMo specific (legacy client-side)
  createMoMoPayment,
  createMoMoQuickPay,
  checkMoMoPaymentStatus,
  verifyMoMoSignature,
};
