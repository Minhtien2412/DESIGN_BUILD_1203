/**
 * Zalo Mini App Authentication Service
 * =====================================
 *
 * 📱 Tích hợp đăng nhập/đăng ký qua Zalo Mini App SDK
 *
 * Dựa trên tài liệu: https://miniapp.zaloplatforms.com/documents/
 *
 * Các API sử dụng:
 * - getAccessToken: Lấy token xác thực người dùng
 * - getUserInfo: Lấy thông tin user (id, name, avatar)
 * - getPhoneNumber: Lấy số điện thoại (cần xin quyền)
 * - authorize: Xin cấp quyền từ người dùng
 *
 * Quy trình:
 * 1. Kiểm tra môi trường Zalo Mini App
 * 2. Authorize để xin quyền (userInfo, phoneNumber)
 * 3. Lấy access token
 * 4. Lấy thông tin user
 * 5. Gọi backend để verify và tạo session
 *
 * @author Design Build Team
 * @version 1.0.0
 * @created 2026-01-17
 */

import ENV from "@/config/env";
import { post } from "./api";

// ==================== CONFIG ====================

const ZALO_MINIAPP_CONFIG = {
  appId: process.env.EXPO_PUBLIC_ZALO_APP_ID || "1408601745775286980",
  secretKey: process.env.ZALO_APP_SECRET || "",
  graphApiUrl: "https://graph.zalo.me/v2.0/me/info",
  apiBaseUrl: ENV.API_BASE_URL || "https://baotienweb.cloud/api/v1",
};

// ==================== TYPES ====================

/**
 * Zalo User từ Mini App SDK
 */
export interface ZaloMiniAppUser {
  id: string; // Unique ID theo Zalo App
  name: string; // Tên hiển thị
  avatar: string; // URL ảnh đại diện
  idByOA?: string; // ID theo Official Account
  followedOA?: boolean; // Đã follow OA chưa
  isSensitive?: boolean; // User nhạy cảm (trẻ em, etc)
}

/**
 * Kết quả authorize
 */
export interface AuthorizeResult {
  "scope.userInfo"?: boolean;
  "scope.userLocation"?: boolean;
  "scope.userPhonenumber"?: boolean;
}

/**
 * Kết quả lấy số điện thoại
 */
export interface PhoneNumberResult {
  token: string; // Token để verify trên server
}

/**
 * Thông tin SĐT đã verify
 */
export interface VerifiedPhoneNumber {
  number: string; // Format: 849123456789
}

/**
 * Kết quả đăng nhập
 */
export interface ZaloMiniAppLoginResult {
  success: boolean;
  message: string;
  user?: ZaloMiniAppUser;
  phoneNumber?: string;
  accessToken?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  error?: string;
  errorCode?: number;
}

/**
 * Kết quả xác thực từ backend
 */
export interface BackendAuthResult {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    avatar?: string;
    zaloId: string;
    isNewUser: boolean;
  };
}

// ==================== MOCK ZMP-SDK (for development) ====================

/**
 * Mock các hàm từ zmp-sdk/apis cho development
 * Production: import thật từ 'zmp-sdk/apis'
 */

// Kiểm tra có đang trong Zalo Mini App không
function isInZaloMiniApp(): boolean {
  if (typeof window === "undefined") return false;

  // Kiểm tra user agent
  const ua = window.navigator?.userAgent || "";
  if (ua.includes("Zalo") || ua.includes("ZaloMiniApp")) {
    return true;
  }

  // Kiểm tra có ZMP object không
  if (typeof (window as any).ZMP !== "undefined") {
    return true;
  }

  return false;
}

/**
 * Mock getAccessToken
 * Real: import { getAccessToken } from 'zmp-sdk/apis'
 */
async function mockGetAccessToken(): Promise<string> {
  // Development mock
  console.log("[ZaloMiniApp] Mock getAccessToken called");
  return `mock_access_token_${Date.now()}`;
}

/**
 * Mock getUserInfo
 * Real: import { getUserInfo } from 'zmp-sdk/apis'
 */
async function mockGetUserInfo(options?: {
  autoRequestPermission?: boolean;
  avatarType?: "small" | "normal" | "large";
}): Promise<{ userInfo: ZaloMiniAppUser }> {
  console.log("[ZaloMiniApp] Mock getUserInfo called", options);
  return {
    userInfo: {
      id: "mock_zalo_user_123",
      name: "Nguyễn Văn Test",
      avatar: "https://via.placeholder.com/150",
      followedOA: false,
      isSensitive: false,
    },
  };
}

/**
 * Mock getPhoneNumber
 * Real: import { getPhoneNumber } from 'zmp-sdk/apis'
 */
async function mockGetPhoneNumber(): Promise<PhoneNumberResult> {
  console.log("[ZaloMiniApp] Mock getPhoneNumber called");
  return {
    token: `mock_phone_token_${Date.now()}`,
  };
}

/**
 * Mock authorize
 * Real: import { authorize } from 'zmp-sdk/apis'
 */
async function mockAuthorize(options: {
  scopes: string[];
}): Promise<AuthorizeResult> {
  console.log("[ZaloMiniApp] Mock authorize called", options);

  const result: AuthorizeResult = {};
  options.scopes.forEach((scope) => {
    (result as any)[scope] = true;
  });

  return result;
}

/**
 * Mock getSetting
 * Real: import { getSetting } from 'zmp-sdk/apis'
 */
async function mockGetSetting(): Promise<{ authSetting: AuthorizeResult }> {
  console.log("[ZaloMiniApp] Mock getSetting called");
  return {
    authSetting: {
      "scope.userInfo": true,
      "scope.userPhonenumber": false,
    },
  };
}

// ==================== DYNAMIC SDK LOADER ====================

// Zalo SDK interface for type safety
interface ZaloSDKInterface {
  getAccessToken: () => Promise<string>;
  getUserInfo: (options?: {
    autoRequestPermission?: boolean;
    avatarType?: "small" | "normal" | "large";
  }) => Promise<{ userInfo: ZaloMiniAppUser }>;
  getPhoneNumber: () => Promise<PhoneNumberResult>;
  authorize: (options: { scopes: string[] }) => Promise<AuthorizeResult>;
  getSetting: () => Promise<{ authSetting: AuthorizeResult }>;
}

/**
 * Load Zalo Mini App SDK dynamically
 * Trong Zalo Mini App thực, SDK đã có sẵn
 */
async function getZaloSDK(): Promise<ZaloSDKInterface> {
  if (isInZaloMiniApp()) {
    try {
      // Thử import SDK thực - chỉ hoạt động trong Zalo Mini App environment
      // @ts-ignore - zmp-sdk chỉ available trong Zalo Mini App
      // eslint-disable-next-line import/no-unresolved
      const zmpSdk = await import("zmp-sdk/apis").catch(() => null);
      if (zmpSdk) {
        return {
          getAccessToken: zmpSdk.getAccessToken,
          getUserInfo: zmpSdk.getUserInfo,
          getPhoneNumber: zmpSdk.getPhoneNumber,
          authorize: zmpSdk.authorize,
          getSetting: zmpSdk.getSetting,
        };
      }
    } catch (_e) {
      console.log("[ZaloMiniApp] SDK not available, using mock");
    }
  }

  // Fallback to mock
  return {
    getAccessToken: mockGetAccessToken,
    getUserInfo: mockGetUserInfo,
    getPhoneNumber: mockGetPhoneNumber,
    authorize: mockAuthorize,
    getSetting: mockGetSetting,
  };
}

// ==================== ERROR CODES ====================

/**
 * Mã lỗi Zalo Mini App
 * Ref: https://miniapp.zaloplatforms.com/documents/api/errorCode/
 */
export const ZALO_ERROR_CODES = {
  USER_DENIED: -201, // Người dùng từ chối cấp quyền
  USER_DENIED_PERMISSION: -1401, // Từ chối quyền cụ thể
  INVALID_TOKEN: -1001, // Token không hợp lệ
  EXPIRED_TOKEN: -1002, // Token hết hạn
  NETWORK_ERROR: -1003, // Lỗi mạng
  UNKNOWN: -9999, // Lỗi không xác định
};

// ==================== MAIN SERVICE CLASS ====================

class ZaloMiniAppAuthService {
  private sdk: any = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  /**
   * Khởi tạo SDK
   */
  private async init() {
    if (this.isInitialized) return;

    this.sdk = await getZaloSDK();
    this.isInitialized = true;
    console.log(
      "[ZaloMiniApp] Service initialized, inMiniApp:",
      isInZaloMiniApp()
    );
  }

  /**
   * Đảm bảo SDK đã sẵn sàng
   */
  private async ensureSDK() {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.sdk;
  }

  // ============ MAIN AUTH FLOW ============

  /**
   * Đăng nhập qua Zalo Mini App
   *
   * Flow:
   * 1. Authorize xin quyền userInfo + phoneNumber
   * 2. Lấy access token
   * 3. Lấy user info
   * 4. Lấy phone number (nếu cần)
   * 5. Gửi lên backend để xác thực
   *
   * @example
   * const result = await zaloMiniAppAuth.login();
   * if (result.success) {
   *   await saveTokens(result.accessToken, result.refreshToken);
   *   navigation.replace('/(tabs)');
   * }
   */
  async login(options?: {
    requirePhone?: boolean;
    autoRequestPermission?: boolean;
  }): Promise<ZaloMiniAppLoginResult> {
    try {
      const sdk = await this.ensureSDK();

      // Step 1: Check & request permissions
      const { authSetting } = await sdk.getSetting();
      console.log("[ZaloMiniApp] Current settings:", authSetting);

      const scopesToRequest: string[] = [];

      // Luôn cần userInfo
      if (!authSetting["scope.userInfo"]) {
        scopesToRequest.push("scope.userInfo");
      }

      // Phone number nếu yêu cầu
      if (options?.requirePhone && !authSetting["scope.userPhonenumber"]) {
        scopesToRequest.push("scope.userPhonenumber");
      }

      // Request permissions nếu cần
      if (scopesToRequest.length > 0) {
        try {
          const authorizeResult = await sdk.authorize({
            scopes: scopesToRequest,
          });
          console.log("[ZaloMiniApp] Authorize result:", authorizeResult);

          // Check nếu user từ chối
          if (
            scopesToRequest.includes("scope.userInfo") &&
            !authorizeResult["scope.userInfo"]
          ) {
            return {
              success: false,
              message: "Bạn cần cho phép truy cập thông tin để đăng nhập",
              errorCode: ZALO_ERROR_CODES.USER_DENIED,
            };
          }
        } catch (error: any) {
          if (error?.code === ZALO_ERROR_CODES.USER_DENIED) {
            return {
              success: false,
              message: "Bạn đã từ chối cấp quyền",
              errorCode: error.code,
            };
          }
          throw error;
        }
      }

      // Step 2: Get access token
      const accessToken = await sdk.getAccessToken();
      console.log("[ZaloMiniApp] Got access token");

      // Step 3: Get user info
      const { userInfo } = await sdk.getUserInfo({
        autoRequestPermission: options?.autoRequestPermission ?? true,
        avatarType: "large",
      });
      console.log("[ZaloMiniApp] Got user info:", userInfo.name);

      // Step 4: Get phone number (optional)
      let phoneNumber: string | undefined;
      if (options?.requirePhone) {
        try {
          const phoneResult = await sdk.getPhoneNumber();

          // Verify phone token with backend
          const verifiedPhone = await this.verifyPhoneToken(
            phoneResult.token,
            accessToken
          );

          if (verifiedPhone) {
            phoneNumber = this.formatPhoneNumber(verifiedPhone.number);
          }
        } catch (error: any) {
          console.log(
            "[ZaloMiniApp] Phone number not available:",
            error.message
          );
          // Continue without phone - có thể yêu cầu sau
        }
      }

      // Step 5: Authenticate with backend
      const backendResult = await this.authenticateWithBackend({
        zaloId: userInfo.id,
        zaloAccessToken: accessToken,
        name: userInfo.name,
        avatar: userInfo.avatar,
        phoneNumber,
        idByOA: userInfo.idByOA,
      });

      if (!backendResult.success) {
        return {
          success: false,
          message: "Không thể xác thực với server",
          user: userInfo,
        };
      }

      return {
        success: true,
        message: backendResult.user.isNewUser
          ? "Đăng ký thành công!"
          : "Đăng nhập thành công!",
        user: userInfo,
        phoneNumber,
        accessToken: backendResult.accessToken,
        refreshToken: backendResult.refreshToken,
        isNewUser: backendResult.user.isNewUser,
      };
    } catch (error: any) {
      console.error("[ZaloMiniApp] Login error:", error);

      return {
        success: false,
        message: error.message || "Đã có lỗi xảy ra",
        errorCode: error.code || ZALO_ERROR_CODES.UNKNOWN,
        error: error.message,
      };
    }
  }

  /**
   * Chỉ lấy thông tin user (không đăng nhập)
   */
  async getUserInfo(): Promise<ZaloMiniAppUser | null> {
    try {
      const sdk = await this.ensureSDK();
      const { userInfo } = await sdk.getUserInfo({
        autoRequestPermission: true,
        avatarType: "large",
      });
      return userInfo;
    } catch (error) {
      console.error("[ZaloMiniApp] Get user info error:", error);
      return null;
    }
  }

  /**
   * Yêu cầu số điện thoại riêng
   * Dùng khi cần SĐT cho tính năng cụ thể (đặt hàng, etc)
   */
  async requestPhoneNumber(): Promise<string | null> {
    try {
      const sdk = await this.ensureSDK();

      // Request permission first
      await sdk.authorize({ scopes: ["scope.userPhonenumber"] });

      // Get phone token
      const phoneResult = await sdk.getPhoneNumber();

      // Get access token for verification
      const accessToken = await sdk.getAccessToken();

      // Verify on backend
      const verifiedPhone = await this.verifyPhoneToken(
        phoneResult.token,
        accessToken
      );

      if (verifiedPhone) {
        return this.formatPhoneNumber(verifiedPhone.number);
      }

      return null;
    } catch (error) {
      console.error("[ZaloMiniApp] Request phone error:", error);
      return null;
    }
  }

  /**
   * Kiểm tra trạng thái quyền hiện tại
   */
  async checkPermissions(): Promise<AuthorizeResult> {
    try {
      const sdk = await this.ensureSDK();
      const { authSetting } = await sdk.getSetting();
      return authSetting;
    } catch (error) {
      console.error("[ZaloMiniApp] Check permissions error:", error);
      return {};
    }
  }

  /**
   * Kiểm tra có đang trong Zalo Mini App không
   */
  isInMiniApp(): boolean {
    return isInZaloMiniApp();
  }

  // ============ BACKEND INTEGRATION ============

  /**
   * Verify phone token với Zalo Graph API
   * Gọi từ backend vì cần secret_key
   */
  private async verifyPhoneToken(
    token: string,
    accessToken: string
  ): Promise<VerifiedPhoneNumber | null> {
    try {
      // Gọi backend để verify (backend sẽ gọi Zalo Graph API)
      const response = await post<{ data: VerifiedPhoneNumber }>(
        "/auth/zalo/verify-phone",
        {
          token,
          accessToken,
        }
      );

      return response.data;
    } catch (error) {
      console.error("[ZaloMiniApp] Verify phone error:", error);

      // Mock for development
      if (!isInZaloMiniApp()) {
        return { number: "84912345678" };
      }

      return null;
    }
  }

  /**
   * Xác thực với backend và tạo session
   */
  private async authenticateWithBackend(data: {
    zaloId: string;
    zaloAccessToken: string;
    name: string;
    avatar: string;
    phoneNumber?: string;
    idByOA?: string;
  }): Promise<BackendAuthResult> {
    try {
      const response = await post<BackendAuthResult>("/auth/zalo/login", data);

      return response;
    } catch (error) {
      console.error("[ZaloMiniApp] Backend auth error:", error);

      // Mock for development
      if (!isInZaloMiniApp()) {
        return {
          success: true,
          accessToken: `app_token_${Date.now()}`,
          refreshToken: `refresh_token_${Date.now()}`,
          user: {
            id: "user_123",
            phone: data.phoneNumber || "0912345678",
            name: data.name,
            avatar: data.avatar,
            zaloId: data.zaloId,
            isNewUser: true,
          },
        };
      }

      return {
        success: false,
        accessToken: "",
        refreshToken: "",
        user: {
          id: "",
          phone: "",
          name: "",
          zaloId: "",
          isNewUser: false,
        },
      };
    }
  }

  // ============ HELPER FUNCTIONS ============

  /**
   * Format số điện thoại từ Zalo (849xxx) sang format Việt Nam
   */
  private formatPhoneNumber(zaloPhone: string): string {
    // Zalo trả về format: 849123456789
    // Chuyển thành: +84912345678
    if (zaloPhone.startsWith("84")) {
      return "+" + zaloPhone;
    }
    return zaloPhone;
  }
}

// ==================== SINGLETON EXPORT ====================

export const zaloMiniAppAuth = new ZaloMiniAppAuthService();

export default zaloMiniAppAuth;

// ==================== HOOKS (for React components) ====================

/**
 * Custom hook để sử dụng Zalo Mini App Auth
 *
 * @example
 * function LoginScreen() {
 *   const { login, isLoading, user } = useZaloMiniAppAuth();
 *
 *   const handleLogin = async () => {
 *     const result = await login({ requirePhone: true });
 *     if (result.success) {
 *       // Navigate to home
 *     }
 *   };
 * }
 */
export function useZaloMiniAppAuth() {
  // Note: Implement with React hooks in actual component
  return {
    login: zaloMiniAppAuth.login.bind(zaloMiniAppAuth),
    getUserInfo: zaloMiniAppAuth.getUserInfo.bind(zaloMiniAppAuth),
    requestPhoneNumber:
      zaloMiniAppAuth.requestPhoneNumber.bind(zaloMiniAppAuth),
    checkPermissions: zaloMiniAppAuth.checkPermissions.bind(zaloMiniAppAuth),
    isInMiniApp: zaloMiniAppAuth.isInMiniApp.bind(zaloMiniAppAuth),
  };
}
