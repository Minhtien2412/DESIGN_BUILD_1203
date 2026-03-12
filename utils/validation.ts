/**
 * Form Validation Utilities
 * Các hàm kiểm tra validation cho form
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Email không được để trống' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Email không đúng định dạng' };
  }
  
  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string, minLength: number = 6): ValidationResult {
  const trimmed = password.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Mật khẩu không được để trống' };
  }
  
  if (trimmed.length < minLength) {
    return { isValid: false, error: `Mật khẩu phải có ít nhất ${minLength} ký tự` };
  }
  
  // Check for at least one letter and one number
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ cái' };
  }
  
  if (!/[0-9]/.test(trimmed)) {
    return { isValid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ số' };
  }
  
  return { isValid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Tên không được để trống' };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Tên phải có ít nhất 2 ký tự' };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Tên không được quá 50 ký tự' };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number (Vietnam format)
 */
export function validatePhone(phone: string): ValidationResult {
  const trimmed = phone.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }
  
  // Vietnam phone format: 0xxxxxxxxx or +84xxxxxxxxx (10 digits after 0)
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(trimmed.replace(/\s/g, ''))) {
    return { isValid: false, error: 'Số điện thoại không đúng định dạng' };
  }
  
  return { isValid: true };
}

/**
 * Real-time validation with debounce
 */
export function debounceValidation(
  fn: (value: string) => ValidationResult,
  delay: number = 500
): (value: string, callback: (result: ValidationResult) => void) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (value: string, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = fn(value);
      callback(result);
    }, delay);
  };
}

/**
 * Password strength checker
 * Returns level 0-4 with corresponding text and color
 */
export interface PasswordStrength {
  level: 0 | 1 | 2 | 3 | 4;
  text: string;
  color: string;
  percentage: number;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { level: 0, text: '', color: '#E5E7EB', percentage: 0 };
  }

  let score = 0;
  
  // Length checks
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // Common patterns (penalty)
  if (/^[0-9]+$/.test(password)) score = Math.max(0, score - 1); // All numbers
  if (/^[a-zA-Z]+$/.test(password)) score = Math.max(0, score - 1); // All letters
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1); // Repeated chars

  if (score <= 1) return { level: 1, text: 'Rất yếu', color: '#DC2626', percentage: 25 };
  if (score <= 2) return { level: 2, text: 'Yếu', color: '#F97316', percentage: 50 };
  if (score <= 3) return { level: 3, text: 'Trung bình', color: '#EAB308', percentage: 75 };
  if (score <= 4) return { level: 4, text: 'Mạnh', color: '#22C55E', percentage: 100 };
  return { level: 4, text: 'Rất mạnh', color: '#16A34A', percentage: 100 };
}

/**
 * Validate confirm password matches
 */
export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Vui lòng xác nhận mật khẩu' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu xác nhận không khớp' };
  }
  
  return { isValid: true };
}

/**
 * Validate OTP code (6 digits)
 */
export function validateOtp(otp: string): ValidationResult {
  const trimmed = otp.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Vui lòng nhập mã OTP' };
  }
  
  if (!/^\d{6}$/.test(trimmed)) {
    return { isValid: false, error: 'Mã OTP phải là 6 chữ số' };
  }
  
  return { isValid: true };
}
