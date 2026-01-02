/**
 * Password Reset Types
 * Types for forgot password and reset password functionality
 */

// ==================== Request Types ====================

/**
 * Request to initiate password reset
 * POST /auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Request to reset password with token
 * POST /auth/reset-password
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Request to validate reset token
 * GET /auth/validate-reset-token?token=xxx
 */
export interface ValidateTokenRequest {
  token: string;
}

// ==================== Response Types ====================

/**
 * Response from forgot password request
 */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  /** When token expires (optional, for client-side validation) */
  expiresAt?: string;
}

/**
 * Response from reset password request
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Response from token validation
 */
export interface ValidateTokenResponse {
  valid: boolean;
  email?: string;
  expiresAt?: string;
  message?: string;
}

// ==================== Domain Models ====================

/**
 * Password reset token (stored server-side)
 */
export interface PasswordResetToken {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

/**
 * Password reset email template data
 */
export interface PasswordResetEmailData {
  email: string;
  resetLink: string;
  expiresIn: string; // e.g., "1 hour"
  timestamp: string;
}

// ==================== Error Types ====================

/**
 * Password reset specific errors
 */
export enum PasswordResetErrorCode {
  INVALID_EMAIL = 'INVALID_EMAIL',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_ALREADY_USED = 'TOKEN_ALREADY_USED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  SAME_AS_OLD_PASSWORD = 'SAME_AS_OLD_PASSWORD',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Password reset error with code
 */
export interface PasswordResetError {
  code: PasswordResetErrorCode;
  message: string;
  field?: 'email' | 'token' | 'newPassword';
}

// ==================== Validation Rules ====================

/**
 * Password validation rules (client-side)
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: false,
  REQUIRE_LOWERCASE: false,
  REQUIRE_NUMBER: false,
  REQUIRE_SPECIAL: false,
} as const;

/**
 * Token expiration time (from backend)
 */
export const TOKEN_EXPIRY = {
  DURATION_MS: 60 * 60 * 1000, // 1 hour
  DURATION_HUMAN: '1 giờ',
} as const;

// ==================== Helper Types ====================

/**
 * Form state for forgot password screen
 */
export interface ForgotPasswordFormState {
  email: string;
  loading: boolean;
  sent: boolean;
  error: string | null;
}

/**
 * Form state for reset password screen
 */
export interface ResetPasswordFormState {
  token: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  success: boolean;
  error: string | null;
  tokenValid: boolean | null;
}

// ==================== Utility Functions ====================

/**
 * Validate email format (simple regex)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || password.length < PASSWORD_RULES.MIN_LENGTH) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_RULES.MIN_LENGTH} ký tự`);
  }

  if (password.length > PASSWORD_RULES.MAX_LENGTH) {
    errors.push(`Mật khẩu không được quá ${PASSWORD_RULES.MAX_LENGTH} ký tự`);
  }

  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
  }

  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
  }

  if (PASSWORD_RULES.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 số');
  }

  if (PASSWORD_RULES.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Format time remaining for token expiry
 */
export function formatTimeRemaining(expiresAt: Date | string): string {
  const now = new Date();
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) return 'Đã hết hạn';

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes} phút`;
  }

  return `${minutes} phút`;
}
