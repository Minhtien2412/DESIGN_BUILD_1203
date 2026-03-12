/**
 * Custom Hook for Forgot Password & Reset Password Flow
 * Manages state and logic for password reset functionality
 */

import { forgotPassword, resetPassword, validateResetToken } from '@/services/auth';
import type {
    ForgotPasswordResponse,
    ResetPasswordResponse,
    ValidateTokenResponse,
} from '@/types/auth-password';
import { isValidEmail, passwordsMatch, validatePassword } from '@/types/auth-password';
import { useCallback, useState } from 'react';

// ==================== Forgot Password Hook ====================

export interface UseForgotPasswordState {
  email: string;
  loading: boolean;
  sent: boolean;
  error: string | null;
}

export interface UseForgotPasswordActions {
  setEmail: (email: string) => void;
  submit: () => Promise<boolean>;
  reset: () => void;
}

export function useForgotPassword(): UseForgotPasswordState & UseForgotPasswordActions {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (): Promise<boolean> => {
    // Clear previous error
    setError(null);

    // Validate email
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return false;
    }

    if (!isValidEmail(email)) {
      setError('Địa chỉ email không hợp lệ');
      return false;
    }

    setLoading(true);

    try {
      const response: ForgotPasswordResponse = await forgotPassword(email.trim());

      if (response.success) {
        setSent(true);
        return true;
      } else {
        setError(response.message || 'Không thể gửi email');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [email]);

  const reset = useCallback(() => {
    setEmail('');
    setLoading(false);
    setSent(false);
    setError(null);
  }, []);

  return {
    email,
    loading,
    sent,
    error,
    setEmail,
    submit,
    reset,
  };
}

// ==================== Reset Password Hook ====================

export interface UseResetPasswordState {
  token: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  success: boolean;
  error: string | null;
  tokenValid: boolean | null;
  validationErrors: string[];
}

export interface UseResetPasswordActions {
  setToken: (token: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  validateToken: () => Promise<boolean>;
  submit: () => Promise<boolean>;
  reset: () => void;
}

export function useResetPassword(
  initialToken?: string
): UseResetPasswordState & UseResetPasswordActions {
  const [token, setToken] = useState(initialToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate token with backend
  const validateTokenHandler = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError('Token không hợp lệ');
      setTokenValid(false);
      return false;
    }

    setLoading(true);
    try {
      const response: ValidateTokenResponse = await validateResetToken(token);

      if (response.valid) {
        setTokenValid(true);
        setError(null);
        return true;
      } else {
        setTokenValid(false);
        setError(response.message || 'Token không hợp lệ hoặc đã hết hạn');
        return false;
      }
    } catch (err: any) {
      setTokenValid(false);
      setError(err.message || 'Không thể kiểm tra token');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Submit new password
  const submit = useCallback(async (): Promise<boolean> => {
    // Clear previous errors
    setError(null);
    setValidationErrors([]);

    // Validate token
    if (!token) {
      setError('Token không hợp lệ. Vui lòng sử dụng link từ email.');
      return false;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setValidationErrors(passwordValidation.errors);
      setError(passwordValidation.errors[0]);
      return false;
    }

    // Check if passwords match
    if (!passwordsMatch(newPassword, confirmPassword)) {
      setError('Mật khẩu xác nhận không khớp');
      setValidationErrors(['Mật khẩu xác nhận không khớp']);
      return false;
    }

    setLoading(true);

    try {
      const response: ResetPasswordResponse = await resetPassword(token, newPassword);

      if (response.success) {
        setSuccess(true);
        setError(null);
        return true;
      } else {
        setError(response.message || 'Không thể đặt lại mật khẩu');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, newPassword, confirmPassword]);

  const reset = useCallback(() => {
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    setSuccess(false);
    setError(null);
    setTokenValid(null);
    setValidationErrors([]);
  }, []);

  return {
    token,
    newPassword,
    confirmPassword,
    loading,
    success,
    error,
    tokenValid,
    validationErrors,
    setToken,
    setNewPassword,
    setConfirmPassword,
    validateToken: validateTokenHandler,
    submit,
    reset,
  };
}

// ==================== Combined Hook (Optional) ====================

/**
 * Combined hook that manages both forgot and reset flows
 * Useful if you want to handle both in a single component
 */
export interface UsePasswordResetFlow {
  forgot: UseForgotPasswordState & UseForgotPasswordActions;
  reset: UseResetPasswordState & UseResetPasswordActions;
}

export function usePasswordResetFlow(initialToken?: string): UsePasswordResetFlow {
  const forgot = useForgotPassword();
  const reset = useResetPassword(initialToken);

  return {
    forgot,
    reset,
  };
}
