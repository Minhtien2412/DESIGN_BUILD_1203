/**
 * Auth Utilities
 * Helper functions cho authentication
 */

import { validateEmail, validateName, validatePassword } from '@/utils/validation';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Role types matching backend Prisma enum
export type UserRole = 'CLIENT' | 'ENGINEER' | 'CONTRACTOR' | 'ARCHITECT' | 'DESIGNER' | 'SUPPLIER' | 'STAFF' | 'ADMIN';

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role?: UserRole;
  acceptTerms: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  general?: string;
}

/**
 * Validate login form
 */
export const validateLoginForm = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return errors;
};

/**
 * Validate register form
 */
export const validateRegisterForm = (data: RegisterFormData): FormErrors => {
  const errors: FormErrors = {};

  // Name validation
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }

  // Email validation
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  // Confirm password validation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }

  // Phone validation (Vietnamese format)
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(data.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
  }

  // Terms validation
  if (!data.acceptTerms) {
    errors.general = 'Vui lòng đồng ý với điều khoản sử dụng';
  }

  return errors;
};

/**
 * Check if form has errors
 */
export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get error message for field
 */
export const getFieldError = (errors: FormErrors, field: keyof FormErrors): string => {
  return errors[field] || '';
};

/**
 * Format API error message for user display
 */
export const formatAuthError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    // Map common error messages to Vietnamese
    const errorMap: Record<string, string> = {
      'Email already exists': 'Email đã tồn tại',
      'Invalid credentials': 'Email hoặc mật khẩu không đúng',
      'User not found': 'Không tìm thấy tài khoản',
      'Network request failed': 'Lỗi kết nối mạng',
      'Timeout': 'Kết nối quá thời gian chờ',
    };
    
    return errorMap[error.message] || error.message;
  }
  
  return 'Đã có lỗi xảy ra. Vui lòng thử lại';
};

/**
 * Sanitize form data before submission
 */
export const sanitizeLoginData = (data: LoginFormData): { email: string; password: string } => {
  return {
    email: data.email.trim().toLowerCase(),
    password: data.password,
  };
};

/**
 * Sanitize register data before submission
 */
export const sanitizeRegisterData = (data: RegisterFormData) => {
  return {
    email: data.email.trim().toLowerCase(),
    password: data.password,
    name: data.name.trim(),
    phone: data.phone.trim(),
    role: data.role,
    location: data.location,
  };
};
