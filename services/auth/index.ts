/**
 * Auth Module Exports
 *
 * Central export point for authentication services
 */

export { authService, formatPhoneNumber } from "./authService";
export type {
    AuthResult, AuthTokens, AuthUser, LoginCredentials,
    PhoneLoginRequest, PhoneRegisterData, RegisterData, SendOTPRequest,
    SendOTPResult, UserRole, VerifyOTPRequest,
    VerifyOTPResult, ZaloLoginRequest, ZaloUserInfo
} from "./authService";

