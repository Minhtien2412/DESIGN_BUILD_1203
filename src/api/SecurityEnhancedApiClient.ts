// Note: Install these dependencies:
// npm install crypto-js expo-local-authentication
// npm install @types/crypto-js --save-dev

// For now, using placeholders - install actual packages when implementing
import * as SecureStore from 'expo-secure-store';
import { api } from './client';

// Placeholder interfaces for dependencies
interface CryptoJS {
  AES: {
    encrypt(data: string, key: string): { toString(): string };
    decrypt(data: string, key: string): { toString(encoding: any): string };
  };
  HmacSHA256(data: string, key: string): { toString(): string };
  lib: {
    WordArray: {
      random(size: number): { toString(): string };
    };
  };
  enc: {
    Utf8: any;
  };
}

interface LocalAuthentication {
  hasHardwareAsync(): Promise<boolean>;
  isEnrolledAsync(): Promise<boolean>;
  authenticateAsync(options: {
    promptMessage: string;
    cancelLabel: string;
    disableDeviceFallback: boolean;
  }): Promise<{ success: boolean }>;
}

// Mock implementations - replace with actual imports when packages are installed
const CryptoJS = {} as CryptoJS;
const LocalAuthentication = {} as LocalAuthentication;

/**
 * Enhanced Security Layer for REST API
 * Implements additional security measures for SQL server connection protection
 */

export class SecurityEnhancedApiClient {
  private static encryptionKey = 'your-secret-encryption-key'; // Should be from secure config
  private static requestCounter = 0;

  /**
   * 1. REQUEST ENCRYPTION
   * Encrypts sensitive data before sending to server
   */
  static encryptSensitiveData(data: any): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data), 
        this.encryptionKey
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Không thể mã hóa dữ liệu');
    }
  }

  static decryptSensitiveData(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Không thể giải mã dữ liệu');
    }
  }

  /**
   * 2. REQUEST SIGNING với HMAC
   * Signs requests to prevent tampering
   */
  static signRequest(data: any, timestamp: number): string {
    const payload = {
      data,
      timestamp,
      counter: ++this.requestCounter
    };
    
    const signature = CryptoJS.HmacSHA256(
      JSON.stringify(payload),
      this.encryptionKey
    ).toString();
    
    return signature;
  }

  static verifyRequestSignature(data: any, timestamp: number, signature: string): boolean {
    const expectedSignature = this.signRequest(data, timestamp);
    return signature === expectedSignature;
  }

  /**
   * 3. BIOMETRIC AUTHENTICATION
   * Adds biometric layer for sensitive operations
   */
  static async authenticateWithBiometric(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        console.warn('Thiết bị không hỗ trợ xác thực sinh trắc học');
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.warn('Chưa thiết lập xác thực sinh trắc học');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực để thực hiện thao tác bảo mật',
        cancelLabel: 'Hủy',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * 4. SECURE API CALLS
   * Enhanced API methods with additional security layers
   */
  static async securePost(endpoint: string, data: any, requireBiometric = false): Promise<any> {
    try {
      // Step 1: Biometric authentication if required
      if (requireBiometric) {
        const biometricSuccess = await this.authenticateWithBiometric();
        if (!biometricSuccess) {
          throw new Error('Xác thực sinh trắc học thất bại');
        }
      }

      // Step 2: Encrypt sensitive data
      const timestamp = Date.now();
      const encryptedData = this.encryptSensitiveData(data);
      
      // Step 3: Sign request
      const signature = this.signRequest(data, timestamp);

      // Step 4: Prepare secured payload
      const securedPayload = {
        encryptedData,
        timestamp,
        signature,
        requestId: CryptoJS.lib.WordArray.random(16).toString()
      };

      // Step 5: Make API call with security headers
      const response = await api.post(endpoint, securedPayload, {
        headers: {
          'X-Security-Level': 'enhanced',
          'X-Request-Timestamp': timestamp.toString(),
          'X-Request-Signature': signature,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Secure API call failed:', error);
      throw error;
    }
  }

  static async secureGet(endpoint: string, requireBiometric = false): Promise<any> {
    try {
      if (requireBiometric) {
        const biometricSuccess = await this.authenticateWithBiometric();
        if (!biometricSuccess) {
          throw new Error('Xác thực sinh trắc học thất bại');
        }
      }

      const timestamp = Date.now();
      const signature = this.signRequest({}, timestamp);

      const response = await api.get(endpoint, {
        headers: {
          'X-Security-Level': 'enhanced',
          'X-Request-Timestamp': timestamp.toString(),
          'X-Request-Signature': signature
        }
      });

      return response.data;
    } catch (error) {
      console.error('Secure API get failed:', error);
      throw error;
    }
  }

  /**
   * 5. SESSION SECURITY
   * Enhanced session management
   */
  static async secureStoreSession(key: string, value: string): Promise<void> {
    try {
      // Encrypt session data before storing
      const encryptedValue = this.encryptSensitiveData(value);
      await SecureStore.setItemAsync(key, encryptedValue);
    } catch (error) {
      console.error('Secure session storage failed:', error);
      throw new Error('Không thể lưu phiên làm việc an toàn');
    }
  }

  static async secureGetSession(key: string): Promise<string | null> {
    try {
      const encryptedValue = await SecureStore.getItemAsync(key);
      if (!encryptedValue) return null;
      
      return this.decryptSensitiveData(encryptedValue);
    } catch (error) {
      console.error('Secure session retrieval failed:', error);
      return null;
    }
  }

  /**
   * 6. RATE LIMITING PROTECTION
   * Client-side rate limiting to prevent abuse
   */
  private static requestLog: number[] = [];
  private static readonly MAX_REQUESTS_PER_MINUTE = 60;

  static canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old requests
    this.requestLog = this.requestLog.filter(time => time > oneMinuteAgo);
    
    // Check if under limit
    if (this.requestLog.length >= this.MAX_REQUESTS_PER_MINUTE) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
      return false;
    }
    
    // Log current request
    this.requestLog.push(now);
    return true;
  }

  /**
   * 7. CERTIFICATE PINNING (Configuration)
   * Note: Actual implementation depends on platform
   */
  static getCertificatePinningConfig() {
    return {
      'api.thietkeresort.com.vn': {
        // Replace with actual certificate hash
        certificateHash: 'SHA256:your-actual-certificate-hash-here',
        includeSubdomains: true
      }
    };
  }

  /**
   * 8. SECURITY AUDIT LOGGING
   * Log security events for monitoring
   */
  static logSecurityEvent(event: string, details: any) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      deviceId: 'device-id-here', // Get from device info
      appVersion: 'app-version-here'
    };
    
    console.log('Security Event:', securityLog);
    
    // In production, send to security monitoring service
    // this.sendToSecurityMonitoring(securityLog);
  }
}

/**
 * USAGE EXAMPLES
 */

// Example 1: Secure login
export const secureLogin = async (credentials: any) => {
  try {
    if (!SecurityEnhancedApiClient.canMakeRequest()) {
      throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
    }

    const response = await SecurityEnhancedApiClient.securePost(
      '/auth/login',
      credentials,
      false // No biometric for login
    );

    SecurityEnhancedApiClient.logSecurityEvent('login_attempt', {
      success: true,
      timestamp: Date.now()
    });

    return response;
  } catch (error) {
    SecurityEnhancedApiClient.logSecurityEvent('login_attempt', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
    throw error;
  }
};

// Example 2: Secure sensitive operation
export const updatePaymentInfo = async (paymentData: any) => {
  return await SecurityEnhancedApiClient.securePost(
    '/user/payment',
    paymentData,
    true // Require biometric for sensitive operations
  );
};

// Example 3: Secure session management
export const storeUserSession = async (sessionData: any) => {
  await SecurityEnhancedApiClient.secureStoreSession(
    'user_session',
    JSON.stringify(sessionData)
  );
};