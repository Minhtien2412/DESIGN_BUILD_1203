/**
 * GetOTP Service Integration
 * ==========================
 * 
 * Tích hợp GetOTP API (https://otp.dev) để gửi và xác thực OTP
 * qua SMS, Viber, Voice, và Telegram.
 * 
 * API Documentation: https://otp.dev/en/docs/
 * 
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

import ENV from '@/config/env';

// ==================== CONFIG ====================

const GETOTP_CONFIG = {
  apiKey: ENV.GETOTP_API_KEY || 'b2c885626ab1e17735372aa843edb431',
  baseUrl: 'https://api.otp.dev/v1',
  defaultSender: 'ThietKe',
  defaultCodeLength: 6,
  defaultExpiry: 300, // 5 phút
};

// ==================== TYPES ====================

export type GetOTPChannel = 'sms' | 'viber' | 'voice' | 'telegram';

export interface GetOTPSendRequest {
  phone: string;
  channel?: GetOTPChannel;
  sender?: string;
  template?: string; // UUID của template từ GetOTP dashboard
  codeLength?: number;
  customCode?: string; // Tự tạo code (không khuyến khích)
  ttl?: number; // Time to live in seconds
}

export interface GetOTPSendResponse {
  success: boolean;
  data?: {
    account_id: string;
    message_id: string;
    phone: string;
    channel: string;
    create_date: string;
    expire_date: string;
    status?: string;
  };
  message: string;
  error?: {
    code: number;
    message: string;
  };
}

export interface GetOTPVerifyRequest {
  phone: string;
  code: string;
}

export interface GetOTPVerifyResponse {
  success: boolean;
  verified: boolean;
  data?: {
    account_id: string;
    message_id: string;
    phone: string;
    channel: string;
    create_date: string;
    expire_date: string;
    verify_date?: string;
  }[];
  message: string;
  error?: {
    code: number;
    message: string;
  };
}

export interface GetOTPBalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  message: string;
}

// Error codes từ GetOTP API
const GETOTP_ERROR_CODES: Record<number, string> = {
  1136: 'API key không hợp lệ hoặc không được phép',
  1512: 'Thiếu số điện thoại',
  1513: 'Số điện thoại không hợp lệ',
  1514: 'Kênh gửi không hợp lệ',
  1515: 'Template không tồn tại',
  1520: 'Thiếu mã OTP để xác thực',
  1521: 'Mã OTP không hợp lệ',
  1632: 'Số dư tài khoản không đủ',
};

// ==================== HELPERS ====================

/**
 * Format số điện thoại theo chuẩn quốc tế
 * Vietnam: +84xxxxxxxxx
 */
function formatPhoneNumber(phone: string): string {
  // Loại bỏ khoảng trắng và ký tự đặc biệt
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Nếu bắt đầu bằng 0, thay bằng +84 (Vietnam)
  if (cleaned.startsWith('0')) {
    cleaned = '+84' + cleaned.substring(1);
  }
  
  // Nếu bắt đầu bằng 84, thêm +
  if (cleaned.startsWith('84') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  // Nếu chưa có mã quốc gia, mặc định +84
  if (!cleaned.startsWith('+')) {
    cleaned = '+84' + cleaned;
  }
  
  return cleaned;
}

/**
 * Thực hiện API request đến GetOTP
 */
async function getOTPFetch<T>(
  endpoint: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    params?: Record<string, string>;
  }
): Promise<T> {
  let url = `${GETOTP_CONFIG.baseUrl}${endpoint}`;
  
  // Thêm query params nếu có
  if (options.params) {
    const queryString = new URLSearchParams(options.params).toString();
    url += `?${queryString}`;
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-OTP-Key': GETOTP_CONFIG.apiKey,
  };
  
  const fetchOptions: RequestInit = {
    method: options.method,
    headers,
  };
  
  if (options.body && options.method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  console.log('[GetOTP] Request:', options.method, url);
  
  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    console.log('[GetOTP] Response:', response.status, data);
    
    if (!response.ok) {
      const errorCode = data?.error?.code || response.status;
      const errorMessage = GETOTP_ERROR_CODES[errorCode] || data?.error?.message || 'Có lỗi xảy ra';
      throw new GetOTPError(errorMessage, errorCode, response.status);
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof GetOTPError) {
      throw error;
    }
    console.error('[GetOTP] Network error:', error);
    throw new GetOTPError(
      'Không thể kết nối đến dịch vụ OTP. Vui lòng thử lại.',
      0,
      0
    );
  }
}

// ==================== ERROR CLASS ====================

export class GetOTPError extends Error {
  code: number;
  status: number;
  
  constructor(message: string, code: number, status: number) {
    super(message);
    this.name = 'GetOTPError';
    this.code = code;
    this.status = status;
  }
}

// ==================== SERVICE CLASS ====================

class GetOTPService {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || GETOTP_CONFIG.apiKey;
  }
  
  /**
   * Gửi OTP qua SMS
   * 
   * @example
   * const result = await getOTP.sendSMS({
   *   phone: '0912345678',
   *   sender: 'ThietKe'
   * });
   */
  async sendSMS(request: GetOTPSendRequest): Promise<GetOTPSendResponse> {
    return this.sendOTP({ ...request, channel: 'sms' });
  }
  
  /**
   * Gửi OTP qua Viber
   */
  async sendViber(request: GetOTPSendRequest): Promise<GetOTPSendResponse> {
    return this.sendOTP({ ...request, channel: 'viber' });
  }
  
  /**
   * Gửi OTP qua Voice Call
   */
  async sendVoice(request: GetOTPSendRequest): Promise<GetOTPSendResponse> {
    return this.sendOTP({ ...request, channel: 'voice' });
  }
  
  /**
   * Gửi OTP qua Telegram
   */
  async sendTelegram(request: GetOTPSendRequest): Promise<GetOTPSendResponse> {
    return this.sendOTP({ ...request, channel: 'telegram' });
  }
  
  /**
   * Gửi OTP - Core method
   * 
   * API: POST https://api.otp.dev/v1/verifications
   * Header: X-OTP-Key
   * Body: { data: { channel, sender, phone, template?, code_length? } }
   */
  async sendOTP(request: GetOTPSendRequest): Promise<GetOTPSendResponse> {
    const phone = formatPhoneNumber(request.phone);
    
    const body = {
      data: {
        channel: request.channel || 'sms',
        sender: request.sender || GETOTP_CONFIG.defaultSender,
        phone: phone,
        code_length: request.codeLength || GETOTP_CONFIG.defaultCodeLength,
        ...(request.template && { template: request.template }),
        ...(request.customCode && { custom_code: request.customCode }),
        ...(request.ttl && { ttl: request.ttl }),
      }
    };
    
    try {
      const response = await getOTPFetch<{
        data: GetOTPSendResponse['data'];
      }>('/verifications', {
        method: 'POST',
        body,
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Mã OTP đã được gửi thành công',
      };
    } catch (error) {
      if (error instanceof GetOTPError) {
        return {
          success: false,
          message: error.message,
          error: {
            code: error.code,
            message: error.message,
          }
        };
      }
      return {
        success: false,
        message: 'Không thể gửi mã OTP. Vui lòng thử lại.',
        error: {
          code: 0,
          message: 'Unknown error',
        }
      };
    }
  }
  
  /**
   * Xác thực OTP
   * 
   * API: GET https://api.otp.dev/v1/verifications?code={code}&phone={phone}
   * Header: X-OTP-Key
   * 
   * Response trả về data array:
   * - Nếu rỗng: OTP không hợp lệ hoặc hết hạn
   * - Nếu có data: OTP hợp lệ
   */
  async verifyOTP(request: GetOTPVerifyRequest): Promise<GetOTPVerifyResponse> {
    const phone = formatPhoneNumber(request.phone);
    
    try {
      const response = await getOTPFetch<{
        data: GetOTPVerifyResponse['data'];
      }>('/verifications', {
        method: 'GET',
        params: {
          code: request.code,
          phone: phone,
        },
      });
      
      // GetOTP trả về array rỗng nếu không tìm thấy OTP hợp lệ
      const verified = response.data && response.data.length > 0;
      
      if (verified) {
        return {
          success: true,
          verified: true,
          data: response.data,
          message: 'Xác thực OTP thành công',
        };
      } else {
        return {
          success: true,
          verified: false,
          message: 'Mã OTP không đúng hoặc đã hết hạn',
        };
      }
    } catch (error) {
      if (error instanceof GetOTPError) {
        return {
          success: false,
          verified: false,
          message: error.message,
          error: {
            code: error.code,
            message: error.message,
          }
        };
      }
      return {
        success: false,
        verified: false,
        message: 'Không thể xác thực OTP. Vui lòng thử lại.',
        error: {
          code: 0,
          message: 'Unknown error',
        }
      };
    }
  }
  
  /**
   * Kiểm tra số dư tài khoản GetOTP
   * 
   * API: GET https://api.otp.dev/v1/account
   */
  async getBalance(): Promise<GetOTPBalanceResponse> {
    try {
      const response = await getOTPFetch<{
        data: {
          balance: number;
          currency: string;
        };
      }>('/account', {
        method: 'GET',
      });
      
      return {
        success: true,
        balance: response.data?.balance,
        currency: response.data?.currency || 'USD',
        message: 'Lấy thông tin tài khoản thành công',
      };
    } catch (error) {
      if (error instanceof GetOTPError) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: 'Không thể lấy thông tin tài khoản',
      };
    }
  }
  
  /**
   * Gửi OTP với auto-fallback
   * Thử SMS trước, nếu thất bại thử Viber, sau đó Voice
   */
  async sendOTPWithFallback(
    phone: string,
    options?: Omit<GetOTPSendRequest, 'phone' | 'channel'>
  ): Promise<GetOTPSendResponse & { usedChannel: GetOTPChannel }> {
    const channels: GetOTPChannel[] = ['sms', 'viber', 'voice'];
    
    for (const channel of channels) {
      console.log(`[GetOTP] Trying channel: ${channel}`);
      
      const result = await this.sendOTP({
        ...options,
        phone,
        channel,
      });
      
      if (result.success) {
        return {
          ...result,
          usedChannel: channel,
        };
      }
      
      console.log(`[GetOTP] Channel ${channel} failed:`, result.message);
    }
    
    // Tất cả channels đều thất bại
    return {
      success: false,
      message: 'Không thể gửi OTP qua bất kỳ kênh nào. Vui lòng thử lại sau.',
      usedChannel: 'sms',
    };
  }
  
  /**
   * Format số điện thoại (public method)
   */
  formatPhone(phone: string): string {
    return formatPhoneNumber(phone);
  }
  
  /**
   * Validate số điện thoại Vietnam
   */
  isValidVietnamesePhone(phone: string): boolean {
    const formatted = formatPhoneNumber(phone);
    // Vietnam phone: +84 followed by 9 or 10 digits
    return /^\+84[1-9][0-9]{8,9}$/.test(formatted);
  }
}

// ==================== SINGLETON INSTANCE ====================

export const getOTPService = new GetOTPService();

// Export class for custom instances
export { GetOTPService };

// ==================== CONVENIENCE FUNCTIONS ====================

/**
 * Quick send SMS OTP
 */
export async function sendSMSOTP(phone: string): Promise<GetOTPSendResponse> {
  return getOTPService.sendSMS({ phone });
}

/**
 * Quick verify OTP
 */
export async function verifySMSOTP(
  phone: string, 
  code: string
): Promise<GetOTPVerifyResponse> {
  return getOTPService.verifyOTP({ phone, code });
}

/**
 * Send OTP with auto channel selection
 */
export async function sendAutoOTP(phone: string): Promise<GetOTPSendResponse> {
  return getOTPService.sendOTPWithFallback(phone);
}

export default getOTPService;
