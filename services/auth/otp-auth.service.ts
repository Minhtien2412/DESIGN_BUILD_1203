/**
 * OTP Authentication Service
 * ==========================
 *
 * Integrate với Backend API cho OTP authentication
 *
 * Endpoints:
 * - POST /zalo/otp     - Send OTP via Zalo ZNS hoặc GetOTP
 * - POST /zalo/verify  - Verify OTP và get token
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { apiFetch } from "@/services/api";

// ============================================================================
// Types
// ============================================================================

export type OtpChannel = "zns" | "sms" | "voice";

export interface SendOtpRequest {
  phone: string;
  channel?: OtpChannel;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  retryAfter?: number;
  transactionId?: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
  };
  isNewUser?: boolean;
}

export interface OtpState {
  phone: string;
  channel: OtpChannel;
  sentAt: number;
  expiresAt: number;
  retryAt: number;
  attempts: number;
}

// ============================================================================
// Service Class
// ============================================================================

class OtpAuthService {
  private currentOtpState: OtpState | null = null;

  /**
   * Format phone number to Vietnam format
   */
  private formatPhone(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, "");

    // Handle Vietnam format
    if (cleaned.startsWith("84")) {
      cleaned = "0" + cleaned.slice(2);
    } else if (cleaned.startsWith("+84")) {
      cleaned = "0" + cleaned.slice(3);
    }

    // Ensure starts with 0
    if (!cleaned.startsWith("0")) {
      cleaned = "0" + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate phone number
   */
  private validatePhone(phone: string): void {
    const formatted = this.formatPhone(phone);
    if (formatted.length < 10 || formatted.length > 11) {
      throw new Error("Số điện thoại không hợp lệ");
    }
  }

  /**
   * Send OTP via backend API
   */
  async sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
    const { phone, channel = "sms" } = request;

    // Validate
    this.validatePhone(phone);

    // Check rate limit
    if (this.currentOtpState && Date.now() < this.currentOtpState.retryAt) {
      const waitSecs = Math.ceil(
        (this.currentOtpState.retryAt - Date.now()) / 1000,
      );
      throw new Error(`Vui lòng đợi ${waitSecs} giây trước khi gửi lại`);
    }

    const formattedPhone = this.formatPhone(phone);

    try {
      const response = await apiFetch<{
        success?: boolean;
        message?: string;
        error?: string;
      }>("/zalo/otp", {
        method: "POST",
        body: JSON.stringify({
          phone: formattedPhone,
          channel,
        }),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Update state
      const now = Date.now();
      this.currentOtpState = {
        phone: formattedPhone,
        channel,
        sentAt: now,
        expiresAt: now + 5 * 60 * 1000, // 5 minutes
        retryAt: now + 60 * 1000, // 1 minute cooldown
        attempts: 0,
      };

      return {
        success: true,
        message: response.message || `Mã OTP đã được gửi đến ${formattedPhone}`,
        expiresIn: 300,
        retryAfter: 60,
      };
    } catch (error: any) {
      console.error("[OtpAuth] Send OTP error:", error);
      throw new Error(
        error.message || "Không thể gửi mã OTP. Vui lòng thử lại.",
      );
    }
  }

  /**
   * Verify OTP via backend API
   */
  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { phone, code } = request;

    // Validate code format
    if (!code || !/^\d{6}$/.test(code)) {
      throw new Error("Mã OTP phải có 6 chữ số");
    }

    // Check state
    if (this.currentOtpState) {
      // Check expired
      if (Date.now() > this.currentOtpState.expiresAt) {
        this.currentOtpState = null;
        throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
      }

      // Check attempts
      if (this.currentOtpState.attempts >= 5) {
        this.currentOtpState = null;
        throw new Error(
          "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.",
        );
      }
    }

    const formattedPhone = this.formatPhone(phone);

    try {
      const response = await apiFetch<{
        success?: boolean;
        message?: string;
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        user?: any;
        isNewUser?: boolean;
        error?: string;
      }>("/zalo/verify", {
        method: "POST",
        body: JSON.stringify({
          phone: formattedPhone,
          code,
        }),
      });

      if (response.error) {
        // Increment attempts
        if (this.currentOtpState) {
          this.currentOtpState.attempts++;
        }
        throw new Error(response.error);
      }

      // Clear state on success
      this.currentOtpState = null;

      return {
        success: true,
        message: response.message || "Xác thực thành công!",
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        user: response.user,
        isNewUser: response.isNewUser,
      };
    } catch (error: any) {
      console.error("[OtpAuth] Verify OTP error:", error);

      // Increment attempts on failed verify
      if (this.currentOtpState) {
        this.currentOtpState.attempts++;
        const remaining = 5 - this.currentOtpState.attempts;
        if (remaining > 0) {
          throw new Error(
            error.message || `Mã OTP không đúng. Bạn còn ${remaining} lần thử.`,
          );
        }
      }

      throw new Error(error.message || "Xác thực thất bại. Vui lòng thử lại.");
    }
  }

  /**
   * Resend OTP with rate limiting
   */
  async resendOtp(channel?: OtpChannel): Promise<SendOtpResponse> {
    if (!this.currentOtpState) {
      throw new Error("Vui lòng nhập số điện thoại trước");
    }

    return this.sendOtp({
      phone: this.currentOtpState.phone,
      channel: channel || this.currentOtpState.channel,
    });
  }

  /**
   * Get current OTP state
   */
  getOtpState(): OtpState | null {
    return this.currentOtpState;
  }

  /**
   * Check if can resend OTP
   */
  canResend(): boolean {
    if (!this.currentOtpState) return true;
    return Date.now() >= this.currentOtpState.retryAt;
  }

  /**
   * Get remaining time until can resend (seconds)
   */
  getResendCooldown(): number {
    if (!this.currentOtpState) return 0;
    return Math.max(
      0,
      Math.ceil((this.currentOtpState.retryAt - Date.now()) / 1000),
    );
  }

  /**
   * Get remaining time until OTP expires (seconds)
   */
  getExpiryTime(): number {
    if (!this.currentOtpState) return 0;
    return Math.max(
      0,
      Math.ceil((this.currentOtpState.expiresAt - Date.now()) / 1000),
    );
  }

  /**
   * Clear current OTP state
   */
  clearState(): void {
    this.currentOtpState = null;
  }
}

// Export singleton
export const otpAuthService = new OtpAuthService();
export default otpAuthService;
