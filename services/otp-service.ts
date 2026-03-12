/**
 * OTP Service
 * Handle sending and verifying OTP codes via phone/email
 */


// OTP Types
export interface SendOtpRequest {
  type: 'phone' | 'email';
  value: string;
  purpose: 'register' | 'reset-password' | 'verify-phone' | 'verify-email';
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn: number; // seconds until OTP expires
  retryAfter?: number; // seconds until can resend
}

export interface VerifyOtpRequest {
  type: 'phone' | 'email';
  value: string;
  code: string;
  purpose: 'register' | 'reset-password' | 'verify-phone' | 'verify-email';
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string; // Temporary token for next step (e.g., complete registration)
}

// OTP Storage for demo/development
const OTP_STORE = new Map<string, { code: string; expiresAt: number; attempts: number }>();

/**
 * Generate a random 6-digit OTP code
 */
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to phone number or email
 * In production, this would call the backend API
 */
export async function sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
  const { type, value, purpose } = request;

  // Validate input
  if (!value) {
    throw new Error(type === 'phone' ? 'Số điện thoại không được để trống' : 'Email không được để trống');
  }

  if (type === 'phone') {
    const phone = value.replace(/[^0-9]/g, '');
    if (phone.length < 10) {
      throw new Error('Số điện thoại không hợp lệ');
    }
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Email không hợp lệ');
    }
  }

  try {
    // In production, call the backend API
    // const response = await apiFetch<SendOtpResponse>('/auth/send-otp', {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // });
    // return response;

    // For demo/development, simulate OTP sending
    const key = `${type}:${value}:${purpose}`;
    const code = generateOtpCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    OTP_STORE.set(key, { code, expiresAt, attempts: 0 });

    // Log OTP for testing (remove in production!)
    console.log(`[OTP Service] Generated OTP for ${type} ${value}: ${code}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: type === 'phone' 
        ? `Mã OTP đã được gửi đến số ${value}` 
        : `Mã OTP đã được gửi đến ${value}`,
      expiresIn: 300, // 5 minutes
      retryAfter: 60, // 1 minute
    };
  } catch (error: any) {
    console.error('[OTP Service] Send OTP error:', error);
    throw new Error(error.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
  }
}

/**
 * Verify OTP code
 * In production, this would call the backend API
 */
export async function verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { type, value, code, purpose } = request;

  // Validate input
  if (!code || code.length !== 6) {
    throw new Error('Mã OTP phải có 6 chữ số');
  }

  try {
    // In production, call the backend API
    // const response = await apiFetch<VerifyOtpResponse>('/auth/verify-otp', {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // });
    // return response;

    // For demo/development, verify against stored OTP
    const key = `${type}:${value}:${purpose}`;
    const stored = OTP_STORE.get(key);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if OTP exists
    if (!stored) {
      throw new Error('Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    // Check if expired
    if (Date.now() > stored.expiresAt) {
      OTP_STORE.delete(key);
      throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    // Check attempts
    if (stored.attempts >= 3) {
      OTP_STORE.delete(key);
      throw new Error('Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
    }

    // Verify code (accept "123456" for testing)
    if (code !== stored.code && code !== '123456') {
      stored.attempts++;
      throw new Error(`Mã OTP không đúng. Bạn còn ${3 - stored.attempts} lần thử.`);
    }

    // Success - remove OTP from store
    OTP_STORE.delete(key);

    // Generate temporary token for next step
    const token = `otp_verified_${Date.now()}_${Math.random().toString(36).substr(2)}`;

    return {
      success: true,
      message: 'Xác thực thành công!',
      token,
    };
  } catch (error: any) {
    console.error('[OTP Service] Verify OTP error:', error);
    throw new Error(error.message || 'Xác thực thất bại. Vui lòng thử lại.');
  }
}

/**
 * Resend OTP
 */
export async function resendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
  // Simply call sendOtp again
  return sendOtp(request);
}

// Export service object
export const otpService = {
  send: sendOtp,
  verify: verifyOtp,
  resend: resendOtp,
};

export default otpService;
