/**
 * Payment Gateway Service — callback verification & legacy process
 * For new payment logic, prefer `services/paymentService.ts` + createPaymentViaAPI().
 * This file is used by `app/payment-callback.tsx` for verifyPayment().
 *
 * API paths standardized to /v1/payment/<gateway>/* routes.
 */

import { Linking } from "react-native";
import { apiFetch } from "../api";

export type PaymentGateway =
  | "momo"
  | "vnpay"
  | "stripe"
  | "acb"
  | "cash"
  | "bank-transfer";

export interface PaymentRequest {
  amount: number;
  currency?: string;
  description: string;
  orderId: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  qrCode?: string;
  deeplink?: string;
  error?: string;
}

export interface PaymentVerification {
  transactionId: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  amount: number;
  gateway: PaymentGateway;
  paidAt?: string;
  error?: string;
}

class PaymentService {
  private stripePublishableKey: string = "";

  /**
   * Initialize payment service
   */
  async initialize(stripeKey?: string) {
    if (stripeKey) {
      this.stripePublishableKey = stripeKey;
    }
  }

  /**
   * Process payment via selected gateway
   */
  async processPayment(
    gateway: PaymentGateway,
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      switch (gateway) {
        case "momo":
          return await this.processMoMoPayment(request);
        case "vnpay":
          return await this.processVNPayPayment(request);
        case "stripe":
          return await this.processStripePayment(request);
        case "acb":
          return await this.processAcbPayment(request);
        case "cash":
        case "bank-transfer":
          return this.processManualPayment(gateway, request);
        default:
          throw new Error(`Unsupported payment gateway: ${gateway}`);
      }
    } catch (error: any) {
      console.error(`Payment processing error (${gateway}):`, error);
      return {
        success: false,
        error: error.message || "Payment processing failed",
      };
    }
  }

  /**
   * Process MoMo payment
   */
  private async processMoMoPayment(
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      const response = await apiFetch("/v1/payment/momo/init", {
        method: "POST",
        body: JSON.stringify({
          amount: request.amount,
          orderId: request.orderId,
          description: request.description,
          returnUrl: request.returnUrl || "myapp://payment/callback",
          metadata: request.metadata,
        }),
      });

      if (response.success && response.paymentUrl) {
        // Try to open MoMo app via deeplink
        if (response.deeplink) {
          const canOpen = await Linking.canOpenURL(response.deeplink);
          if (canOpen) {
            await Linking.openURL(response.deeplink);
          } else {
            // Fallback to web payment
            await Linking.openURL(response.paymentUrl);
          }
        } else {
          await Linking.openURL(response.paymentUrl);
        }

        return {
          success: true,
          paymentUrl: response.paymentUrl,
          transactionId: response.transactionId,
          qrCode: response.qrCode,
        };
      }

      return {
        success: false,
        error: response.error || "MoMo payment initialization failed",
      };
    } catch (error: any) {
      throw new Error(`MoMo payment error: ${error.message}`);
    }
  }

  /**
   * Process VNPay payment
   */
  private async processVNPayPayment(
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      const response = await apiFetch("/v1/payment/vnpay/init", {
        method: "POST",
        body: JSON.stringify({
          amount: request.amount,
          orderId: request.orderId,
          description: request.description,
          returnUrl: request.returnUrl || "myapp://payment/callback",
          locale: "vn",
          metadata: request.metadata,
        }),
      });

      if (response.success && response.paymentUrl) {
        await Linking.openURL(response.paymentUrl);

        return {
          success: true,
          paymentUrl: response.paymentUrl,
          transactionId: response.transactionId,
        };
      }

      return {
        success: false,
        error: response.error || "VNPay payment initialization failed",
      };
    } catch (error: any) {
      throw new Error(`VNPay payment error: ${error.message}`);
    }
  }

  /**
   * Process Stripe payment
   */
  private async processStripePayment(
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      // Create payment intent on backend
      const response = await apiFetch("/v1/payment/stripe/intent", {
        method: "POST",
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency || "vnd",
          description: request.description,
          orderId: request.orderId,
          metadata: request.metadata,
        }),
      });

      if (response.success && response.clientSecret) {
        // For Stripe, we'll return the client secret
        // The UI component will handle the payment sheet
        return {
          success: true,
          transactionId: response.paymentIntentId,
          paymentUrl: response.clientSecret, // Store client secret in paymentUrl field
        };
      }

      return {
        success: false,
        error: response.error || "Stripe payment initialization failed",
      };
    } catch (error: any) {
      throw new Error(`Stripe payment error: ${error.message}`);
    }
  }

  /**
   * Process ACB ONE Connect payment
   */
  private async processAcbPayment(
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      const response = await apiFetch("/v1/payment/acb/init", {
        method: "POST",
        body: JSON.stringify({
          amount: request.amount,
          orderId: request.orderId,
          description: request.description,
          returnUrl: request.returnUrl || "myapp://payment/callback",
          metadata: request.metadata,
        }),
      });

      if (
        response.gateway === "ACB" &&
        (response.paymentUrl || response.qrCodeUrl)
      ) {
        // Try payment URL first, then QR code
        if (response.paymentUrl) {
          const canOpen = await Linking.canOpenURL(response.paymentUrl);
          if (canOpen) {
            await Linking.openURL(response.paymentUrl);
          }
        }

        return {
          success: true,
          paymentUrl: response.paymentUrl,
          transactionId: response.transactionId,
          qrCode: response.qrCodeUrl,
        };
      }

      return {
        success: false,
        error: response.message || "ACB payment initialization failed",
      };
    } catch (error: any) {
      throw new Error(`ACB payment error: ${error.message}`);
    }
  }

  /**
   * Process manual payment (cash/bank transfer)
   */
  private processManualPayment(
    gateway: "cash" | "bank-transfer",
    request: PaymentRequest,
  ): PaymentResponse {
    // Manual payments are recorded but not processed immediately
    return {
      success: true,
      transactionId: `${gateway}-${request.orderId}-${Date.now()}`,
    };
  }

  /**
   * Verify payment status
   */
  async verifyPayment(
    transactionId: string,
    gateway: PaymentGateway,
  ): Promise<PaymentVerification> {
    try {
      const response = await apiFetch(
        `/v1/payment/${gateway}/verify/${transactionId}`,
      );

      return {
        transactionId: response.transactionId,
        status: response.status,
        amount: response.amount,
        gateway,
        paidAt: response.paidAt,
      };
    } catch (error: any) {
      return {
        transactionId,
        status: "failed",
        amount: 0,
        gateway,
        error: error.message,
      };
    }
  }

  /**
   * Request refund
   */
  async requestRefund(
    transactionId: string,
    gateway: PaymentGateway,
    amount?: number,
    reason?: string,
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const response = await apiFetch(`/v1/payment/${gateway}/refund`, {
        method: "POST",
        body: JSON.stringify({
          transactionId,
          amount,
          reason,
        }),
      });

      return {
        success: response.success,
        refundId: response.refundId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment methods for a region
   */
  getAvailablePaymentMethods(): PaymentGateway[] {
    return ["momo", "vnpay", "stripe", "acb", "cash", "bank-transfer"];
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = "VND"): string {
    if (currency === "VND") {
      return `${amount.toLocaleString("vi-VN")}đ`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  }
}

export const paymentService = new PaymentService();
