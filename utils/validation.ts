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
