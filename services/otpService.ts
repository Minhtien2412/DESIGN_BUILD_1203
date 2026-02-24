/**
 * OTP Service
 * ===========
 * 
 * Service gửi và xác thực OTP (One-Time Password) qua SMS và Email.
 * Hỗ trợ: Twilio, eSMS Vietnam, StringeeX, Vonage
 * 
 * @author ThietKeResort Team
 * @created 2025-01-12
 */

import { EMAIL_CONFIG, isServiceConfigured, SMS_CONFIG } from '../config/externalApis';

// ============================================
// Types
// ============================================
export type OTPChannel = 'sms' | 'email' | 'call';

export interface SendOTPRequest {
  recipient: string; // Phone number hoặc email
  channel: OTPChannel;
  templateId?: string;
  customMessage?: string;
  locale?: 'vi' | 'en';
}

export interface SendOTPResponse {
  success: boolean;
  requestId: string;
  message: string;
  channel: OTPChannel;
  provider: string;
  expiresIn: number; // seconds
}

export interface VerifyOTPRequest {
  recipient: string;
  code: string;
  requestId?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  valid: boolean;
  message: string;
}

// ============================================
// OTP Generation
// ============================================

/**
 * Generate random OTP code
 */
function generateOTP(length = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Format phone number to E.164
 */
function formatPhoneNumber(phone: string, countryCode = '84'): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Vietnam phone numbers
  if (cleaned.startsWith('0')) {
    cleaned = countryCode + cleaned.slice(1);
  }
  
  // Add + if missing
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Get OTP message template
 */
function getOTPMessage(otp: string, locale: 'vi' | 'en' = 'vi'): string {
  const templates = {
    vi: `Ma xac thuc ThietKeResort cua ban la: ${otp}. Ma co hieu luc trong 5 phut. Khong chia se ma nay voi bat ky ai.`,
    en: `Your ThietKeResort verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
  };
  
  return templates[locale];
}

// ============================================
// In-memory OTP Storage (for demo/development)
// In production, use Redis or database
// ============================================
const otpStorage = new Map<string, { code: string; expiresAt: number; attempts: number }>();

function storeOTP(recipient: string, code: string, ttlSeconds = 300): void {
  otpStorage.set(recipient, {
    code,
    expiresAt: Date.now() + ttlSeconds * 1000,
    attempts: 0,
  });
}

function validateStoredOTP(recipient: string, code: string): { valid: boolean; message: string } {
  const stored = otpStorage.get(recipient);
  
  if (!stored) {
    return { valid: false, message: 'Mã OTP không tồn tại hoặc đã hết hạn' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(recipient);
    return { valid: false, message: 'Mã OTP đã hết hạn' };
  }
  
  if (stored.attempts >= 5) {
    otpStorage.delete(recipient);
    return { valid: false, message: 'Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.' };
  }
  
  if (stored.code !== code) {
    stored.attempts++;
    return { valid: false, message: `Mã OTP không đúng. Còn ${5 - stored.attempts} lần thử.` };
  }
  
  // Valid - remove from storage
  otpStorage.delete(recipient);
  return { valid: true, message: 'Xác thực thành công' };
}

// ============================================
// Twilio Implementation
// ============================================
async function sendViaTwilio(request: SendOTPRequest): Promise<SendOTPResponse | null> {
  const config = SMS_CONFIG.twilio;
  
  if (!config.accountSid || !config.authToken) return null;
  
  try {
    const formattedPhone = formatPhoneNumber(request.recipient);
    
    // If using Twilio Verify
    if (config.verifyServiceSid) {
      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${config.verifyServiceSid}/Verifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
          },
          body: new URLSearchParams({
            To: formattedPhone,
            Channel: request.channel === 'call' ? 'call' : 'sms',
            Locale: request.locale || 'vi',
          }),
        }
      );
      
      if (!res.ok) throw new Error('Twilio Verify error');
      
      const data = await res.json();
      
      return {
        success: true,
        requestId: data.sid,
        message: 'Mã xác thực đã được gửi',
        channel: request.channel,
        provider: 'twilio-verify',
        expiresIn: 300,
      };
    }
    
    // Standard SMS with generated OTP
    const otp = generateOTP();
    storeOTP(request.recipient, otp);
    
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: config.phoneNumber,
          Body: request.customMessage || getOTPMessage(otp, request.locale),
        }),
      }
    );
    
    if (!res.ok) throw new Error('Twilio SMS error');
    
    const data = await res.json();
    
    return {
      success: true,
      requestId: data.sid,
      message: 'Mã xác thực đã được gửi qua SMS',
      channel: 'sms',
      provider: 'twilio',
      expiresIn: 300,
    };
  } catch (error) {
    console.error('[OTPService] Twilio error:', error);
    return null;
  }
}

async function verifyViaTwilio(request: VerifyOTPRequest): Promise<VerifyOTPResponse | null> {
  const config = SMS_CONFIG.twilio;
  
  if (!config.accountSid || !config.authToken || !config.verifyServiceSid) return null;
  
  try {
    const formattedPhone = formatPhoneNumber(request.recipient);
    
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${config.verifyServiceSid}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
        },
        body: new URLSearchParams({
          To: formattedPhone,
          Code: request.code,
        }),
      }
    );
    
    if (!res.ok) throw new Error('Twilio Verify check error');
    
    const data = await res.json();
    
    return {
      success: true,
      valid: data.status === 'approved',
      message: data.status === 'approved' ? 'Xác thực thành công' : 'Mã OTP không đúng',
    };
  } catch (error) {
    console.error('[OTPService] Twilio verify error:', error);
    return null;
  }
}

// ============================================
// eSMS Vietnam Implementation
// ============================================
async function sendViaESMS(request: SendOTPRequest): Promise<SendOTPResponse | null> {
  const config = SMS_CONFIG.esms;
  
  if (!config.apiKey || !config.secretKey) return null;
  
  try {
    const formattedPhone = formatPhoneNumber(request.recipient).replace('+', '');
    const otp = generateOTP();
    storeOTP(request.recipient, otp);
    
    const res = await fetch(`${config.baseUrl}/SendMultipleMessage_V4_post_json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ApiKey: config.apiKey,
        SecretKey: config.secretKey,
        Content: request.customMessage || getOTPMessage(otp, request.locale),
        Phone: formattedPhone,
        Brandname: config.brandName,
        SmsType: config.smsType,
      }),
    });
    
    if (!res.ok) throw new Error('eSMS error');
    
    const data = await res.json();
    
    if (data.CodeResult !== '100') {
      throw new Error(data.ErrorMessage || 'eSMS failed');
    }
    
    return {
      success: true,
      requestId: data.SMSID || `esms-${Date.now()}`,
      message: 'Mã xác thực đã được gửi qua SMS',
      channel: 'sms',
      provider: 'esms',
      expiresIn: 300,
    };
  } catch (error) {
    console.error('[OTPService] eSMS error:', error);
    return null;
  }
}

// ============================================
// Vonage Implementation
// ============================================
async function sendViaVonage(request: SendOTPRequest): Promise<SendOTPResponse | null> {
  const config = SMS_CONFIG.vonage;
  
  if (!config.apiKey || !config.apiSecret) return null;
  
  try {
    const formattedPhone = formatPhoneNumber(request.recipient).replace('+', '');
    const otp = generateOTP();
    storeOTP(request.recipient, otp);
    
    const res = await fetch(`${config.baseUrl}/sms/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        api_secret: config.apiSecret,
        from: config.brandName,
        to: formattedPhone,
        text: request.customMessage || getOTPMessage(otp, request.locale),
        type: 'text',
      }),
    });
    
    if (!res.ok) throw new Error('Vonage error');
    
    const data = await res.json();
    
    if (data.messages?.[0]?.status !== '0') {
      throw new Error(data.messages?.[0]?.['error-text'] || 'Vonage failed');
    }
    
    return {
      success: true,
      requestId: data.messages[0]['message-id'],
      message: 'Mã xác thực đã được gửi qua SMS',
      channel: 'sms',
      provider: 'vonage',
      expiresIn: 300,
    };
  } catch (error) {
    console.error('[OTPService] Vonage error:', error);
    return null;
  }
}

// ============================================
// Email OTP Implementation
// ============================================
async function sendViaEmail(request: SendOTPRequest): Promise<SendOTPResponse | null> {
  // Use SendGrid if configured
  const sendgrid = EMAIL_CONFIG.sendgrid;
  
  if (!sendgrid.apiKey) return null;
  
  try {
    const otp = generateOTP();
    storeOTP(request.recipient, otp);
    
    const emailBody = {
      personalizations: [{ to: [{ email: request.recipient }] }],
      from: { email: sendgrid.fromEmail, name: 'ThietKeResort' },
      subject: `Mã xác thực của bạn: ${otp}`,
      content: [
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #0D9488;">Xác thực tài khoản ThietKeResort</h2>
              <p>Mã xác thực của bạn là:</p>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
              </div>
              <p>Mã có hiệu lực trong <strong>5 phút</strong>.</p>
              <p style="color: #6b7280; font-size: 14px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px;">© 2025 ThietKeResort. All rights reserved.</p>
            </div>
          `,
        },
      ],
    };
    
    const res = await fetch(`${sendgrid.baseUrl}/mail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sendgrid.apiKey}`,
      },
      body: JSON.stringify(emailBody),
    });
    
    if (!res.ok && res.status !== 202) {
      throw new Error('SendGrid error');
    }
    
    return {
      success: true,
      requestId: `email-${Date.now()}`,
      message: 'Mã xác thực đã được gửi qua Email',
      channel: 'email',
      provider: 'sendgrid',
      expiresIn: 300,
    };
  } catch (error) {
    console.error('[OTPService] Email error:', error);
    return null;
  }
}

// ============================================
// Main Service Functions
// ============================================

/**
 * Send OTP with automatic provider selection
 */
export async function sendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
  let result: SendOTPResponse | null = null;
  
  if (request.channel === 'email') {
    result = await sendViaEmail(request);
  } else {
    // Try SMS providers in order
    if (isServiceConfigured('twilio')) {
      result = await sendViaTwilio(request);
      if (result) return result;
    }
    
    if (isServiceConfigured('esms')) {
      result = await sendViaESMS(request);
      if (result) return result;
    }
    
    // Try Vonage as fallback
    result = await sendViaVonage(request);
  }
  
  if (result) return result;
  
  // Mock response for development
  const mockOTP = generateOTP();
  storeOTP(request.recipient, mockOTP);
  
  console.log(`[OTPService] MOCK OTP for ${request.recipient}: ${mockOTP}`);
  
  return {
    success: true,
    requestId: `mock-${Date.now()}`,
    message: `Mã xác thực (DEV): ${mockOTP}`,
    channel: request.channel,
    provider: 'mock',
    expiresIn: 300,
  };
}

/**
 * Verify OTP code
 */
export async function verifyOTP(request: VerifyOTPRequest): Promise<VerifyOTPResponse> {
  // Try Twilio Verify first if configured
  if (isServiceConfigured('twilio') && SMS_CONFIG.twilio.verifyServiceSid) {
    const twilioResult = await verifyViaTwilio(request);
    if (twilioResult) return twilioResult;
  }
  
  // Fall back to local storage verification
  const localResult = validateStoredOTP(request.recipient, request.code);
  
  return {
    success: true,
    valid: localResult.valid,
    message: localResult.message,
  };
}

/**
 * Resend OTP
 */
export async function resendOTP(
  recipient: string,
  channel: OTPChannel = 'sms',
  locale: 'vi' | 'en' = 'vi'
): Promise<SendOTPResponse> {
  // Clear any existing OTP
  otpStorage.delete(recipient);
  
  return sendOTP({ recipient, channel, locale });
}

/**
 * Check if recipient can receive OTP (rate limiting)
 */
export function canSendOTP(recipient: string): { allowed: boolean; waitSeconds?: number } {
  // Simple rate limiting - 1 OTP per 60 seconds
  const stored = otpStorage.get(recipient);
  
  if (stored) {
    const timeSinceCreation = Date.now() - (stored.expiresAt - 300000);
    const waitTime = 60000 - timeSinceCreation;
    
    if (waitTime > 0) {
      return {
        allowed: false,
        waitSeconds: Math.ceil(waitTime / 1000),
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Get formatted phone for display (hide middle digits)
 */
export function maskPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  const visible = 4;
  
  if (formatted.length <= visible * 2) return formatted;
  
  const start = formatted.slice(0, visible + 1); // +84xx
  const end = formatted.slice(-visible);
  const middle = '*'.repeat(formatted.length - visible * 2 - 1);
  
  return `${start}${middle}${end}`;
}

/**
 * Get formatted email for display (hide middle part)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  
  const visible = Math.min(2, Math.floor(local.length / 3));
  const start = local.slice(0, visible);
  const end = local.slice(-visible);
  const middle = '*'.repeat(Math.max(3, local.length - visible * 2));
  
  return `${start}${middle}${end}@${domain}`;
}

export default {
  sendOTP,
  verifyOTP,
  resendOTP,
  canSendOTP,
  maskPhoneNumber,
  maskEmail,
  generateOTP,
  formatPhoneNumber,
};
