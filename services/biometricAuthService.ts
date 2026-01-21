/**
 * Biometric Authentication Service
 * =================================
 *
 * 🔐 Xác thực sinh trắc học (Vân tay / Face ID)
 *
 * Tính năng:
 * ✅ Kiểm tra thiết bị hỗ trợ biometric
 * ✅ Đăng ký biometric cho tài khoản
 * ✅ Xác thực nhanh bằng vân tay/FaceID
 * ✅ Lưu trữ credentials an toàn với SecureStore
 * ✅ Fallback về PIN/Password khi cần
 *
 * Flow:
 * 1. User đăng nhập thành công → Hỏi kích hoạt biometric
 * 2. User đồng ý → Lưu credentials mã hóa vào SecureStore
 * 3. Lần sau mở app → Prompt biometric → Auto-login
 *
 * @author Design Build Team
 * @version 1.0.0
 * @created 2026-01-17
 */

import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ==================== CONFIG ====================

const BIOMETRIC_CONFIG = {
  // SecureStore keys
  CREDENTIALS_KEY: "@biometric_credentials",
  ENABLED_KEY: "@biometric_enabled",
  USER_ID_KEY: "@biometric_user_id",
  LAST_AUTH_KEY: "@biometric_last_auth",

  // Settings
  promptMessage: "Xác thực để đăng nhập",
  cancelLabel: "Hủy",
  fallbackLabel: "Dùng mật khẩu",

  // Timeouts
  authTimeout: 30000, // 30 giây
  sessionDuration: 5 * 60 * 1000, // 5 phút session không cần xác thực lại
};

// ==================== TYPES ====================

export type BiometricType = "fingerprint" | "facial" | "iris" | "none";

export interface BiometricCapability {
  isSupported: boolean;
  isEnrolled: boolean;
  biometricTypes: BiometricType[];
  securityLevel: "none" | "weak" | "strong";
  availableMethods: string[];
}

export interface StoredCredentials {
  userId: string;
  email?: string;
  phone?: string;
  accessToken: string;
  refreshToken: string;
  encryptedPassword?: string; // Cho email login
  storedAt: number;
  lastUsed: number;
}

export interface BiometricAuthResult {
  success: boolean;
  message: string;
  credentials?: StoredCredentials;
  error?: string;
}

export interface BiometricSetupResult {
  success: boolean;
  message: string;
  biometricType?: BiometricType;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Map LocalAuthentication types to our BiometricType
 */
function mapBiometricType(
  type: LocalAuthentication.AuthenticationType
): BiometricType {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return "fingerprint";
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return "facial";
    case LocalAuthentication.AuthenticationType.IRIS:
      return "iris";
    default:
      return "none";
  }
}

/**
 * Get user-friendly biometric name
 */
export function getBiometricName(type: BiometricType): string {
  switch (type) {
    case "fingerprint":
      return Platform.OS === "ios" ? "Touch ID" : "Vân tay";
    case "facial":
      return Platform.OS === "ios" ? "Face ID" : "Nhận diện khuôn mặt";
    case "iris":
      return "Quét mống mắt";
    default:
      return "Sinh trắc học";
  }
}

/**
 * Get biometric icon name (Ionicons)
 */
export function getBiometricIcon(type: BiometricType): string {
  switch (type) {
    case "fingerprint":
      return "finger-print";
    case "facial":
      return "scan";
    case "iris":
      return "eye";
    default:
      return "shield-checkmark";
  }
}

// ==================== MAIN SERVICE CLASS ====================

class BiometricAuthService {
  private lastAuthTime: number = 0;

  // ============ CAPABILITY CHECK ============

  /**
   * Kiểm tra thiết bị có hỗ trợ biometric không
   *
   * @example
   * const capability = await biometricAuth.checkCapability();
   * if (capability.isSupported && capability.isEnrolled) {
   *   // Show biometric option
   * }
   */
  async checkCapability(): Promise<BiometricCapability> {
    try {
      // Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      // Get security level
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      // Get available authentication types
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      const biometricTypes = supportedTypes.map(mapBiometricType);

      // Determine security level string
      let securityLevelStr: "none" | "weak" | "strong" = "none";
      if (
        securityLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG
      ) {
        securityLevelStr = "strong";
      } else if (
        securityLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK
      ) {
        securityLevelStr = "weak";
      }

      // Get method names for display
      const availableMethods = biometricTypes
        .filter((t) => t !== "none")
        .map(getBiometricName);

      console.log("[BiometricAuth] Capability check:", {
        hasHardware,
        isEnrolled,
        securityLevel: securityLevelStr,
        biometricTypes,
      });

      return {
        isSupported: hasHardware,
        isEnrolled,
        biometricTypes,
        securityLevel: securityLevelStr,
        availableMethods,
      };
    } catch (error) {
      console.error("[BiometricAuth] Capability check failed:", error);
      return {
        isSupported: false,
        isEnrolled: false,
        biometricTypes: [],
        securityLevel: "none",
        availableMethods: [],
      };
    }
  }

  /**
   * Get primary biometric type available
   */
  async getPrimaryBiometricType(): Promise<BiometricType> {
    const capability = await this.checkCapability();

    // Prefer facial recognition on iOS (Face ID)
    if (capability.biometricTypes.includes("facial")) {
      return "facial";
    }
    if (capability.biometricTypes.includes("fingerprint")) {
      return "fingerprint";
    }
    if (capability.biometricTypes.includes("iris")) {
      return "iris";
    }
    return "none";
  }

  // ============ BIOMETRIC AUTHENTICATION ============

  /**
   * Prompt biometric authentication
   *
   * @example
   * const result = await biometricAuth.authenticate('Xác nhận đăng nhập');
   * if (result.success) {
   *   // Proceed with login
   * }
   */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      // Check if within session window (don't re-authenticate)
      const now = Date.now();
      if (now - this.lastAuthTime < BIOMETRIC_CONFIG.sessionDuration) {
        console.log("[BiometricAuth] Within session window, skipping prompt");
        const credentials = await this.getStoredCredentials();
        if (credentials) {
          return {
            success: true,
            message: "Đã xác thực (trong phiên)",
            credentials,
          };
        }
      }

      // Check capability first
      const capability = await this.checkCapability();
      if (!capability.isSupported) {
        return {
          success: false,
          message: "Thiết bị không hỗ trợ xác thực sinh trắc học",
          error: "NOT_SUPPORTED",
        };
      }

      if (!capability.isEnrolled) {
        return {
          success: false,
          message:
            "Chưa đăng ký vân tay/Face ID trên thiết bị. Vui lòng vào Cài đặt để thiết lập.",
          error: "NOT_ENROLLED",
        };
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || BIOMETRIC_CONFIG.promptMessage,
        cancelLabel: BIOMETRIC_CONFIG.cancelLabel,
        fallbackLabel: BIOMETRIC_CONFIG.fallbackLabel,
        disableDeviceFallback: false, // Allow PIN/Password fallback
      });

      console.log("[BiometricAuth] Authentication result:", result);

      if (result.success) {
        this.lastAuthTime = Date.now();
        await SecureStore.setItemAsync(
          BIOMETRIC_CONFIG.LAST_AUTH_KEY,
          this.lastAuthTime.toString()
        );

        // Get stored credentials
        const credentials = await this.getStoredCredentials();

        return {
          success: true,
          message: "Xác thực thành công",
          credentials: credentials || undefined,
        };
      } else {
        // Handle different error types
        let message = "Xác thực thất bại";
        let error = "AUTH_FAILED";

        if (result.error === "user_cancel") {
          message = "Đã hủy xác thực";
          error = "USER_CANCEL";
        } else if (result.error === "user_fallback") {
          message = "Chuyển sang nhập mật khẩu";
          error = "USER_FALLBACK";
        } else if (result.error === "system_cancel") {
          message = "Xác thực bị hệ thống hủy";
          error = "SYSTEM_CANCEL";
        } else if (result.error === "authentication_failed") {
          message = "Quá nhiều lần thử. Vui lòng đợi và thử lại.";
          error = "LOCKOUT";
        } else if (result.error === "passcode_not_set") {
          message = "Biometric bị khóa. Vui lòng mở khóa thiết bị trước.";
          error = "LOCKOUT_PERMANENT";
        }

        return {
          success: false,
          message,
          error,
        };
      }
    } catch (error) {
      console.error("[BiometricAuth] Authentication error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi xác thực",
        error: "UNKNOWN_ERROR",
      };
    }
  }

  // ============ CREDENTIALS MANAGEMENT ============

  /**
   * Lưu credentials sau khi đăng nhập thành công
   * Gọi sau khi user đồng ý kích hoạt biometric
   */
  async saveCredentials(
    credentials: Omit<StoredCredentials, "storedAt" | "lastUsed">
  ): Promise<BiometricSetupResult> {
    try {
      const capability = await this.checkCapability();
      if (!capability.isSupported || !capability.isEnrolled) {
        return {
          success: false,
          message: "Thiết bị chưa sẵn sàng cho xác thực sinh trắc học",
        };
      }

      const dataToStore: StoredCredentials = {
        ...credentials,
        storedAt: Date.now(),
        lastUsed: Date.now(),
      };

      // Store credentials securely
      await SecureStore.setItemAsync(
        BIOMETRIC_CONFIG.CREDENTIALS_KEY,
        JSON.stringify(dataToStore)
      );

      // Mark biometric as enabled
      await SecureStore.setItemAsync(BIOMETRIC_CONFIG.ENABLED_KEY, "true");
      await SecureStore.setItemAsync(
        BIOMETRIC_CONFIG.USER_ID_KEY,
        credentials.userId
      );

      const biometricType = await this.getPrimaryBiometricType();

      console.log(
        "[BiometricAuth] Credentials saved for user:",
        credentials.userId
      );

      return {
        success: true,
        message: `Đã kích hoạt ${getBiometricName(biometricType)}`,
        biometricType,
      };
    } catch (error) {
      console.error("[BiometricAuth] Save credentials error:", error);
      return {
        success: false,
        message: "Không thể lưu thông tin đăng nhập",
      };
    }
  }

  /**
   * Lấy credentials đã lưu
   */
  async getStoredCredentials(): Promise<StoredCredentials | null> {
    try {
      const data = await SecureStore.getItemAsync(
        BIOMETRIC_CONFIG.CREDENTIALS_KEY
      );
      if (!data) return null;

      const credentials: StoredCredentials = JSON.parse(data);

      // Update last used time
      credentials.lastUsed = Date.now();
      await SecureStore.setItemAsync(
        BIOMETRIC_CONFIG.CREDENTIALS_KEY,
        JSON.stringify(credentials)
      );

      return credentials;
    } catch (error) {
      console.error("[BiometricAuth] Get credentials error:", error);
      return null;
    }
  }

  /**
   * Xóa credentials (khi đăng xuất hoặc disable biometric)
   */
  async clearCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_CONFIG.CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_CONFIG.ENABLED_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_CONFIG.USER_ID_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_CONFIG.LAST_AUTH_KEY);
      this.lastAuthTime = 0;

      console.log("[BiometricAuth] Credentials cleared");
    } catch (error) {
      console.error("[BiometricAuth] Clear credentials error:", error);
    }
  }

  // ============ STATUS CHECK ============

  /**
   * Kiểm tra biometric đã được kích hoạt chưa
   */
  async isEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(
        BIOMETRIC_CONFIG.ENABLED_KEY
      );
      return enabled === "true";
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra có thể dùng biometric login không
   * (thiết bị hỗ trợ + đã kích hoạt + có credentials)
   */
  async canUseBiometricLogin(): Promise<boolean> {
    try {
      const capability = await this.checkCapability();
      if (!capability.isSupported || !capability.isEnrolled) {
        return false;
      }

      const enabled = await this.isEnabled();
      if (!enabled) return false;

      const credentials = await this.getStoredCredentials();
      return credentials !== null;
    } catch {
      return false;
    }
  }

  /**
   * Lấy user ID của tài khoản đã kích hoạt biometric
   */
  async getEnabledUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(BIOMETRIC_CONFIG.USER_ID_KEY);
    } catch {
      return null;
    }
  }

  // ============ FULL BIOMETRIC LOGIN FLOW ============

  /**
   * Thực hiện đăng nhập bằng biometric
   * Kết hợp authenticate + get credentials
   *
   * @example
   * const result = await biometricAuth.loginWithBiometric();
   * if (result.success && result.credentials) {
   *   // Use credentials to restore session
   *   await restoreSession(result.credentials);
   * }
   */
  async loginWithBiometric(): Promise<BiometricAuthResult> {
    // Check if biometric login is available
    const canUse = await this.canUseBiometricLogin();
    if (!canUse) {
      return {
        success: false,
        message: "Đăng nhập sinh trắc học chưa được kích hoạt",
        error: "NOT_ENABLED",
      };
    }

    // Get biometric type for custom message
    const biometricType = await this.getPrimaryBiometricType();
    const biometricName = getBiometricName(biometricType);

    // Authenticate
    const authResult = await this.authenticate(
      `Dùng ${biometricName} để đăng nhập`
    );

    return authResult;
  }

  /**
   * Disable biometric login
   */
  async disable(): Promise<void> {
    await this.clearCredentials();
  }
}

// ==================== SINGLETON EXPORT ====================

export const biometricAuth = new BiometricAuthService();

// Export class for testing
export { BiometricAuthService };

// Export config for customization
    export { BIOMETRIC_CONFIG };

