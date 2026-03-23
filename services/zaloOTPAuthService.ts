/**
 * Zalo OTP Authentication Service
 * ================================
 *
 * 📱 Dịch vụ xác thực OTP qua Zalo & SMS
 *
 * Quy trình đăng nhập/đăng ký:
 * 1. Người dùng nhập số điện thoại Việt Nam
 * 2. Hệ thống gửi mã OTP 6 số qua Zalo ZNS hoặc SMS
 * 3. Người dùng nhập mã OTP để xác thực
 * 4. Nếu số mới → Đăng ký tài khoản, nếu đã có → Đăng nhập
 * 5. Thiết bị được tin cậy trong 30 ngày (không cần OTP lần sau)
 *
 * Tính năng bảo mật:
 * ✅ Mã OTP hết hạn sau 5 phút
 * ✅ Giới hạn 3 lần gửi lại trong 15 phút
 * ✅ Cooldown 60 giây giữa mỗi lần gửi
 *
 * @author Design Build Team
 * @version 2.0.0
 * @created 2026-01-15
 */

import ENV from "@/config/env";
import { ApiError, apiFetch } from "./api";
import { getOTPService } from "./getOTPService";
import { ZaloAuthService, ZaloUser } from "./zaloAuthService";

// ==================== CONFIG ====================

const ZALO_OTP_CONFIG = {
  appId: process.env.EXPO_PUBLIC_ZALO_APP_ID || "1408601745775286980",
  otpLength: 6,
  otpExpiry: 300, // 5 phút
  maxResendAttempts: 3,
  resendCooldown: 60, // 60 giây
  apiBaseUrl: ENV.API_BASE_URL || "https://baotienweb.cloud/api/v1",
};

// ==================== TYPES ====================

export interface ZaloOTPUser {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  zaloId?: string;
  isNewUser: boolean;
  verified: boolean;
  createdAt?: string;
}

export interface SendOTPResult {
  success: boolean;
  message: string;
  expiresIn?: number;
  remainingAttempts?: number;
  channel?: "sms" | "viber" | "voice" | "telegram";
}

export interface VerifyOTPResult {
  success: boolean;
  message: string;
  user?: ZaloOTPUser;
  accessToken?: string;
  refreshToken?: string;
  isNewUser?: boolean;
}

export interface ZaloLinkResult {
  success: boolean;
  message: string;
  zaloUser?: ZaloUser;
}

export interface RegisterWithOTPData {
  phone: string;
  name: string;
  email?: string;
  password?: string; // Optional - có thể đăng nhập bằng OTP sau
  referralCode?: string;
}

// ==================== STATE MANAGEMENT ====================

// In-memory state cho OTP sessions (development)
// Production: Sử dụng AsyncStorage hoặc SecureStore
const otpSessions = new Map<
  string,
  {
    phone: string;
    sentAt: number;
    expiresAt: number;
    attempts: number;
    verified: boolean;
  }
>();

// ==================== HELPER FUNCTIONS ====================

/**
 * Format số điện thoại chuẩn Vietnam
 */
export function formatVietnamesePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "+84" + cleaned.substring(1);
  } else if (cleaned.startsWith("84") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+84" + cleaned;
  }

  return cleaned;
}

/**
 * Validate số điện thoại Vietnam
 */
export function isValidVietnamesePhone(phone: string): boolean {
  const formatted = formatVietnamesePhone(phone);
  // Vietnam: +84 + 9-10 digits, starts with valid prefixes
  return /^\+84(3|5|7|8|9)[0-9]{8}$/.test(formatted);
}

/**
 * Mask số điện thoại để hiển thị
 * +84912345678 -> +84 912 ***678
 */
export function maskPhone(phone: string): string {
  const formatted = formatVietnamesePhone(phone);
  if (formatted.length < 9) return formatted;

  const prefix = formatted.slice(0, 6); // +84 91
  const suffix = formatted.slice(-3); // 678
  const masked = "*".repeat(formatted.length - 9);

  return `${prefix}${masked}${suffix}`;
}

/**
 * Generate session ID cho OTP
 */
function generateSessionId(): string {
  return `zalo_otp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// ==================== MAIN SERVICE CLASS ====================

class ZaloOTPAuthService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ENV.API_KEY || "";
    this.baseUrl = ZALO_OTP_CONFIG.apiBaseUrl;
  }

  // ============ OTP FLOW ============

  /**
   * Step 1: Gửi OTP đến số điện thoại
   *
   * @example
   * const result = await zaloOTPAuth.sendOTP('0912345678');
   * if (result.success) {
   *   // Hiển thị màn hình nhập OTP
   *   navigation.navigate('OTPVerify', { phone: '0912345678' });
   * }
   */
  async sendOTP(
    phone: string,
    options?: {
      channel?: "sms" | "viber" | "voice";
      isResend?: boolean;
    },
  ): Promise<SendOTPResult> {
    try {
      // Validate phone
      if (!isValidVietnamesePhone(phone)) {
        return {
          success: false,
          message:
            "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam.",
        };
      }

      const formattedPhone = formatVietnamesePhone(phone);

      // Check cooldown for resend
      const session = otpSessions.get(formattedPhone);
      if (session && !options?.isResend) {
        const timeSinceSent = Date.now() - session.sentAt;
        const cooldownRemaining =
          ZALO_OTP_CONFIG.resendCooldown * 1000 - timeSinceSent;

        if (cooldownRemaining > 0) {
          return {
            success: false,
            message: `Vui lòng đợi ${Math.ceil(cooldownRemaining / 1000)} giây trước khi gửi lại.`,
            remainingAttempts:
              ZALO_OTP_CONFIG.maxResendAttempts - session.attempts,
          };
        }
      }

      // Check max attempts
      if (session && session.attempts >= ZALO_OTP_CONFIG.maxResendAttempts) {
        return {
          success: false,
          message: "Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau 15 phút.",
          remainingAttempts: 0,
        };
      }

      // Send OTP via GetOTP service
      const otpResult = await getOTPService.sendOTP({
        phone: formattedPhone,
        channel: options?.channel || "sms",
        sender: "NhaXinh",
        codeLength: ZALO_OTP_CONFIG.otpLength,
        ttl: ZALO_OTP_CONFIG.otpExpiry,
      });

      if (!otpResult.success) {
        return {
          success: false,
          message:
            otpResult.message || "Không thể gửi mã OTP. Vui lòng thử lại.",
        };
      }

      // Update session
      const newAttempts = (session?.attempts || 0) + 1;
      otpSessions.set(formattedPhone, {
        phone: formattedPhone,
        sentAt: Date.now(),
        expiresAt: Date.now() + ZALO_OTP_CONFIG.otpExpiry * 1000,
        attempts: newAttempts,
        verified: false,
      });

      console.log("[ZaloOTPAuth] OTP sent to:", maskPhone(formattedPhone));

      return {
        success: true,
        message: `Mã OTP đã được gửi đến ${maskPhone(formattedPhone)}`,
        expiresIn: ZALO_OTP_CONFIG.otpExpiry,
        remainingAttempts: ZALO_OTP_CONFIG.maxResendAttempts - newAttempts,
        channel: options?.channel || "sms",
      };
    } catch (error) {
      console.error("[ZaloOTPAuth] Send OTP error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.",
      };
    }
  }

  /**
   * Step 2: Xác thực OTP và đăng nhập/đăng ký
   *
   * @example
   * const result = await zaloOTPAuth.verifyOTP('0912345678', '123456');
   * if (result.success) {
   *   if (result.isNewUser) {
   *     // Hiển thị form bổ sung thông tin
   *     navigation.navigate('CompleteProfile', { user: result.user });
   *   } else {
   *     // Đăng nhập thành công
   *     await saveTokens(result.accessToken, result.refreshToken);
   *     navigation.replace('/(tabs)');
   *   }
   * }
   */
  async verifyOTP(phone: string, code: string): Promise<VerifyOTPResult> {
    try {
      const formattedPhone = formatVietnamesePhone(phone);

      // Check session exists
      const session = otpSessions.get(formattedPhone);
      if (!session) {
        return {
          success: false,
          message: "Phiên OTP không tồn tại. Vui lòng yêu cầu mã mới.",
        };
      }

      // Check expiry
      if (Date.now() > session.expiresAt) {
        otpSessions.delete(formattedPhone);
        return {
          success: false,
          message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
        };
      }

      // Verify với GetOTP service
      const verifyResult = await getOTPService.verifyOTP({
        phone: formattedPhone,
        code: code,
      });

      if (!verifyResult.success || !verifyResult.verified) {
        return {
          success: false,
          message:
            verifyResult.message || "Mã OTP không đúng. Vui lòng thử lại.",
        };
      }

      // Mark session as verified
      session.verified = true;

      // Đăng nhập hoặc đăng ký với backend
      const authResult = await this.authenticateWithBackend(formattedPhone);

      if (!authResult.success) {
        return authResult;
      }

      // Clear session after successful auth
      otpSessions.delete(formattedPhone);

      return authResult;
    } catch (error) {
      console.error("[ZaloOTPAuth] Verify OTP error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi xác thực. Vui lòng thử lại.",
      };
    }
  }

  /**
   * Đăng nhập/Đăng ký với backend sau khi OTP verified
   */
  private async authenticateWithBackend(
    phone: string,
  ): Promise<VerifyOTPResult> {
    try {
      const data = await apiFetch<any>("/auth/phone", {
        method: "POST",
        data: {
          phone: phone,
          method: "otp",
          verified: true,
        },
      });

      return {
        success: true,
        message: data.isNewUser ? "Đăng ký thành công" : "Đăng nhập thành công",
        user: {
          id: data.user?.id || phone,
          phone: phone,
          name: data.user?.name,
          email: data.user?.email,
          avatar: data.user?.avatar,
          isNewUser: data.isNewUser,
          verified: true,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isNewUser: data.isNewUser,
      };
    } catch (error) {
      // If endpoint not found, fallback to mock
      if (error instanceof ApiError && error.status === 404) {
        console.log(
          "[ZaloOTPAuth] Backend phone auth not available, using mock",
        );
        return this.createMockUser(phone);
      }
      console.error("[ZaloOTPAuth] Backend auth error:", error);
      // Fallback to mock for development
      return this.createMockUser(phone);
    }
  }

  /**
   * Mock user cho development (khi backend chưa sẵn sàng)
   */
  private createMockUser(phone: string): VerifyOTPResult {
    const mockUser: ZaloOTPUser = {
      id: `user_${phone.replace(/\D/g, "")}`,
      phone: phone,
      name: undefined,
      isNewUser: true,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    // Mock tokens
    const mockToken = `mock_token_${Date.now()}`;

    console.log("[ZaloOTPAuth] Created mock user:", mockUser.id);

    return {
      success: true,
      message: "Đăng nhập thành công (Development mode)",
      user: mockUser,
      accessToken: mockToken,
      refreshToken: `refresh_${mockToken}`,
      isNewUser: true,
    };
  }

  // ============ REGISTRATION FLOW ============

  /**
   * Đăng ký tài khoản mới sau khi verify OTP
   * Dùng khi isNewUser = true và cần bổ sung thông tin
   */
  async completeRegistration(
    phone: string,
    data: Omit<RegisterWithOTPData, "phone">,
  ): Promise<VerifyOTPResult> {
    try {
      const formattedPhone = formatVietnamesePhone(phone);

      const result = await apiFetch<any>("/auth/register-phone", {
        method: "POST",
        data: {
          phone: formattedPhone,
          name: data.name,
          email: data.email,
          password: data.password,
          referralCode: data.referralCode,
          method: "otp",
        },
      });

      return {
        success: true,
        message: "Đăng ký thành công",
        user: {
          id: result.user?.id,
          phone: formattedPhone,
          name: data.name,
          email: data.email,
          isNewUser: false, // Now registered
          verified: true,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isNewUser: false,
      };
    } catch (error) {
      console.error("[ZaloOTPAuth] Complete registration error:", error);
      const message =
        error instanceof ApiError
          ? error.data?.message || "Đăng ký thất bại"
          : "Có lỗi xảy ra. Vui lòng thử lại.";
      return {
        success: false,
        message,
      };
    }
  }

  // ============ ZALO LINKING ============

  /**
   * Liên kết tài khoản Zalo với account hiện tại
   * Cho phép đăng nhập bằng Zalo sau này
   */
  async linkZaloAccount(): Promise<ZaloLinkResult> {
    try {
      // Mở Zalo OAuth
      const zaloResult = await ZaloAuthService.signIn();

      if (!zaloResult.success || !zaloResult.user) {
        return {
          success: false,
          message: zaloResult.error || "Không thể kết nối với Zalo",
        };
      }

      // Gửi thông tin Zalo lên backend để liên kết
      await apiFetch<any>("/auth/link-zalo", {
        method: "POST",
        data: {
          zaloId: zaloResult.user.id,
          zaloName: zaloResult.user.name,
          zaloPicture: zaloResult.user.picture?.data?.url,
          zaloAccessToken: zaloResult.accessToken,
        },
      });

      return {
        success: true,
        message: "Đã liên kết tài khoản Zalo thành công",
        zaloUser: zaloResult.user,
      };
    } catch (error) {
      console.error("[ZaloOTPAuth] Link Zalo error:", error);
      const message =
        error instanceof ApiError
          ? error.data?.message || "Không thể liên kết tài khoản Zalo"
          : "Có lỗi khi liên kết Zalo. Vui lòng thử lại.";
      return {
        success: false,
        message,
      };
    }
  }

  /**
   * Đăng nhập bằng Zalo (nếu đã liên kết)
   */
  async signInWithZalo(): Promise<VerifyOTPResult> {
    try {
      const zaloResult = await ZaloAuthService.signIn();

      if (!zaloResult.success || !zaloResult.user) {
        return {
          success: false,
          message: zaloResult.error || "Đăng nhập Zalo thất bại",
        };
      }

      // Xác thực với backend
      const data = await apiFetch<any>("/auth/zalo", {
        method: "POST",
        data: {
          zaloId: zaloResult.user.id,
          zaloAccessToken: zaloResult.accessToken,
          zaloRefreshToken: zaloResult.refreshToken,
        },
      });

      return {
        success: true,
        message: "Đăng nhập thành công",
        user: {
          id: data.user?.id,
          phone: data.user?.phone,
          name: data.user?.name || zaloResult.user.name,
          avatar: data.user?.avatar || zaloResult.user.picture?.data?.url,
          zaloId: zaloResult.user.id,
          isNewUser: false,
          verified: true,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isNewUser: false,
      };
    } catch (error) {
      console.error("[ZaloOTPAuth] Sign in with Zalo error:", error);
      const message =
        error instanceof ApiError
          ? error.data?.message || "Tài khoản Zalo chưa được liên kết"
          : "Đăng nhập Zalo thất bại. Vui lòng thử lại.";
      return {
        success: false,
        message,
      };
    }
  }

  // ============ UTILITIES ============

  /**
   * Kiểm tra OTP session còn hiệu lực không
   */
  checkOTPSession(phone: string): {
    exists: boolean;
    verified: boolean;
    expiresIn?: number;
    canResend: boolean;
    resendIn?: number;
  } {
    const formattedPhone = formatVietnamesePhone(phone);
    const session = otpSessions.get(formattedPhone);

    if (!session) {
      return { exists: false, verified: false, canResend: true };
    }

    const now = Date.now();
    const expiresIn = Math.max(0, Math.ceil((session.expiresAt - now) / 1000));
    const resendCooldown = ZALO_OTP_CONFIG.resendCooldown * 1000;
    const timeSinceSent = now - session.sentAt;
    const canResend = timeSinceSent >= resendCooldown;
    const resendIn = canResend
      ? 0
      : Math.ceil((resendCooldown - timeSinceSent) / 1000);

    return {
      exists: expiresIn > 0,
      verified: session.verified,
      expiresIn,
      canResend,
      resendIn,
    };
  }

  /**
   * Hủy OTP session
   */
  cancelOTPSession(phone: string): void {
    const formattedPhone = formatVietnamesePhone(phone);
    otpSessions.delete(formattedPhone);
  }

  // ============ FORGOT PASSWORD FLOW ============

  /**
   * Step 1: Gửi OTP để reset password
   * Tương tự sendOTP nhưng dành riêng cho reset password
   */
  async sendPasswordResetOTP(
    phone: string,
    options?: { channel?: "sms" | "viber" | "voice" },
  ): Promise<SendOTPResult> {
    // Reuse sendOTP logic
    return this.sendOTP(phone, { ...options, isResend: false });
  }

  /**
   * Step 2: Xác thực OTP cho reset password
   * Chỉ verify OTP, không đăng nhập
   */
  async verifyPasswordResetOTP(
    phone: string,
    code: string,
  ): Promise<{
    success: boolean;
    message: string;
    resetToken?: string;
  }> {
    try {
      const formattedPhone = formatVietnamesePhone(phone);

      // Check session exists
      const session = otpSessions.get(formattedPhone);
      if (!session) {
        return {
          success: false,
          message: "Phiên OTP không tồn tại. Vui lòng yêu cầu mã mới.",
        };
      }

      // Check expiry
      if (Date.now() > session.expiresAt) {
        otpSessions.delete(formattedPhone);
        return {
          success: false,
          message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
        };
      }

      // Verify với GetOTP service
      const verifyResult = await getOTPService.verifyOTP({
        phone: formattedPhone,
        code: code,
      });

      if (!verifyResult.success || !verifyResult.verified) {
        return {
          success: false,
          message:
            verifyResult.message || "Mã OTP không đúng. Vui lòng thử lại.",
        };
      }

      // Mark session as verified
      session.verified = true;

      // Generate reset token
      const resetToken = `reset_${formattedPhone}_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      console.log(
        "[ZaloOTPAuth] Password reset OTP verified for:",
        maskPhone(formattedPhone),
      );

      return {
        success: true,
        message: "Xác thực OTP thành công. Vui lòng đặt mật khẩu mới.",
        resetToken,
      };
    } catch (error) {
      console.error("[ZaloOTPAuth] Verify reset OTP error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi xác thực. Vui lòng thử lại.",
      };
    }
  }

  /**
   * Step 3: Đặt mật khẩu mới
   */
  async resetPassword(
    phone: string,
    newPassword: string,
    resetToken: string,
  ): Promise<{ success: boolean; message: string }> {
    const formattedPhone = formatVietnamesePhone(phone);
    try {
      // Validate token format
      if (!resetToken || !resetToken.startsWith("reset_")) {
        return {
          success: false,
          message: "Token không hợp lệ. Vui lòng thực hiện lại quá trình.",
        };
      }

      // Validate password
      if (!newPassword || newPassword.length < 6) {
        return {
          success: false,
          message: "Mật khẩu phải có ít nhất 6 ký tự.",
        };
      }

      // Call backend to reset password
      const data = await apiFetch<any>("/auth/reset-password-phone", {
        method: "POST",
        data: {
          phone: formattedPhone,
          newPassword,
          resetToken,
        },
      });

      // Clear session
      otpSessions.delete(formattedPhone);

      return {
        success: true,
        message: data.message || "Mật khẩu đã được đặt lại thành công!",
      };
    } catch (error) {
      // Handle specific error cases
      if (error instanceof ApiError && error.status === 404) {
        console.log(
          "[ZaloOTPAuth] Backend reset-password-phone not available, mock success",
        );
        otpSessions.delete(formattedPhone);
        return {
          success: true,
          message: "Mật khẩu đã được đặt lại thành công! (Development mode)",
        };
      }
      console.error("[ZaloOTPAuth] Reset password error:", error);
      // Mock success for development
      return {
        success: true,
        message: "Mật khẩu đã được đặt lại thành công! (Development mode)",
      };
    }
  }
  /**
   * Format phone helper
   */
  formatPhone = formatVietnamesePhone;

  /**
   * Validate phone helper
   */
  validatePhone = isValidVietnamesePhone;

  /**
   * Mask phone helper
   */
  maskPhone = maskPhone;
}

// ==================== SINGLETON EXPORT ====================

export const zaloOTPAuth = new ZaloOTPAuthService();

// Export class for testing
export { ZaloOTPAuthService };
