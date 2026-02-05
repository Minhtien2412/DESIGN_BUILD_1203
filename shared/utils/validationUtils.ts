/**
 * Validation Utilities
 * Xác thực dữ liệu đầu vào
 */

// ============================================
// TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

// ============================================
// BASIC VALIDATORS
// ============================================

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Validate required field
 */
export function validateRequired(
  value: any,
  fieldName?: string,
): ValidationResult {
  const isValid = !isEmpty(value);
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Trường này"} là bắt buộc`,
  };
}

// ============================================
// STRING VALIDATORS
// ============================================

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName?: string,
): ValidationResult {
  const isValid = value.length >= minLength;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} phải có ít nhất ${minLength} ký tự`,
  };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName?: string,
): ValidationResult {
  const isValid = value.length <= maxLength;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} không được quá ${maxLength} ký tự`,
  };
}

/**
 * Validate length range
 */
export function validateLengthRange(
  value: string,
  min: number,
  max: number,
  fieldName?: string,
): ValidationResult {
  const isValid = value.length >= min && value.length <= max;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} phải từ ${min} đến ${max} ký tự`,
  };
}

// ============================================
// NUMBER VALIDATORS
// ============================================

/**
 * Validate is number
 */
export function validateIsNumber(
  value: any,
  fieldName?: string,
): ValidationResult {
  const isValid = !isNaN(Number(value));
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Trường này"} phải là số`,
  };
}

/**
 * Validate minimum value
 */
export function validateMin(
  value: number,
  min: number,
  fieldName?: string,
): ValidationResult {
  const isValid = value >= min;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} phải lớn hơn hoặc bằng ${min}`,
  };
}

/**
 * Validate maximum value
 */
export function validateMax(
  value: number,
  max: number,
  fieldName?: string,
): ValidationResult {
  const isValid = value <= max;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} phải nhỏ hơn hoặc bằng ${max}`,
  };
}

/**
 * Validate range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName?: string,
): ValidationResult {
  const isValid = value >= min && value <= max;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} phải từ ${min} đến ${max}`,
  };
}

/**
 * Validate is positive
 */
export function validatePositive(
  value: number,
  fieldName?: string,
): ValidationResult {
  const isValid = value > 0;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} phải là số dương`,
  };
}

/**
 * Validate is integer
 */
export function validateInteger(
  value: number,
  fieldName?: string,
): ValidationResult {
  const isValid = Number.isInteger(value);
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Trường này"} phải là số nguyên`,
  };
}

// ============================================
// PHONE VALIDATORS
// ============================================

/**
 * Vietnam phone regex patterns
 */
const VIETNAM_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
const VIETNAM_LANDLINE_REGEX = /^(0|\+84)(2[0-9]{1,2})[0-9]{6,7}$/;

/**
 * Validate Vietnam phone number
 */
export function validateVietnamesePhone(
  phone: string,
  fieldName?: string,
): ValidationResult {
  const cleaned = phone.replace(/[\s\-\.]/g, "");
  const isValid =
    VIETNAM_PHONE_REGEX.test(cleaned) || VIETNAM_LANDLINE_REGEX.test(cleaned);
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Số điện thoại"} không hợp lệ`,
  };
}

/**
 * Validate phone number (generic)
 */
export function validatePhone(
  phone: string,
  fieldName?: string,
): ValidationResult {
  const cleaned = phone.replace(/[\s\-\.\(\)]/g, "");
  const isValid = /^\+?[0-9]{9,15}$/.test(cleaned);
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Số điện thoại"} không hợp lệ`,
  };
}

// ============================================
// EMAIL VALIDATORS
// ============================================

/**
 * Email regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email
 */
export function validateEmail(
  email: string,
  fieldName?: string,
): ValidationResult {
  const isValid = EMAIL_REGEX.test(email);
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Email"} không hợp lệ`,
  };
}

// ============================================
// PASSWORD VALIDATORS
// ============================================

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  } = {},
): ValidationResult {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options;

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Mật khẩu phải có ít nhất ${minLength} ký tự`,
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Mật khẩu phải có ít nhất 1 chữ hoa",
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Mật khẩu phải có ít nhất 1 chữ thường",
    };
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Mật khẩu phải có ít nhất 1 chữ số",
    };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
    };
  }

  return { isValid: true };
}

/**
 * Validate password confirmation
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): ValidationResult {
  const isValid = password === confirmPassword;
  return {
    isValid,
    error: isValid ? undefined : "Mật khẩu xác nhận không khớp",
  };
}

// ============================================
// ID VALIDATORS
// ============================================

/**
 * Validate Vietnam Citizen ID (CCCD)
 */
export function validateCCCD(
  cccd: string,
  fieldName?: string,
): ValidationResult {
  const isValid = /^[0-9]{12}$/.test(cccd);
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Số CCCD"} phải có đúng 12 chữ số`,
  };
}

/**
 * Validate old Vietnam ID (CMND)
 */
export function validateCMND(
  cmnd: string,
  fieldName?: string,
): ValidationResult {
  const isValid = /^[0-9]{9}$/.test(cmnd);
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Số CMND"} phải có đúng 9 chữ số`,
  };
}

/**
 * Validate tax ID (MST)
 */
export function validateTaxId(
  taxId: string,
  fieldName?: string,
): ValidationResult {
  const isValid = /^[0-9]{10}(-[0-9]{3})?$/.test(taxId);
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Mã số thuế"} không hợp lệ`,
  };
}

// ============================================
// URL VALIDATORS
// ============================================

/**
 * Validate URL
 */
export function validateUrl(url: string, fieldName?: string): ValidationResult {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: `${fieldName || "URL"} không hợp lệ`,
    };
  }
}

// ============================================
// DATE VALIDATORS
// ============================================

/**
 * Validate date
 */
export function validateDate(date: Date, fieldName?: string): ValidationResult {
  const isValid = date instanceof Date && !isNaN(date.getTime());
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Ngày"} không hợp lệ`,
  };
}

/**
 * Validate date is in past
 */
export function validatePastDate(
  date: Date,
  fieldName?: string,
): ValidationResult {
  const isValid = date < new Date();
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Ngày"} phải trong quá khứ`,
  };
}

/**
 * Validate date is in future
 */
export function validateFutureDate(
  date: Date,
  fieldName?: string,
): ValidationResult {
  const isValid = date > new Date();
  return {
    isValid,
    error: isValid ? undefined : `${fieldName || "Ngày"} phải trong tương lai`,
  };
}

/**
 * Validate age (18+)
 */
export function validateAge(
  birthDate: Date,
  minAge: number = 18,
  fieldName?: string,
): ValidationResult {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;

  const isValid = actualAge >= minAge;
  return {
    isValid,
    error: isValid
      ? undefined
      : `${fieldName || "Bạn"} phải từ ${minAge} tuổi trở lên`,
  };
}

// ============================================
// FORM VALIDATION
// ============================================

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
}

/**
 * Validate a single field with multiple rules
 */
export function validateField(
  value: any,
  rules: ValidationRule[],
): ValidationResult {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return { isValid: false, error: rule.message };
    }
  }
  return { isValid: true };
}

/**
 * Validate a form (multiple fields)
 */
export function validateForm(
  fields: Record<string, FieldValidation>,
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  for (const [key, field] of Object.entries(fields)) {
    results[key] = validateField(field.value, field.rules);
  }
  return results;
}

/**
 * Check if form is valid
 */
export function isFormValid(
  results: Record<string, ValidationResult>,
): boolean {
  return Object.values(results).every((r) => r.isValid);
}

/**
 * Get first error from form results
 */
export function getFirstError(
  results: Record<string, ValidationResult>,
): string | undefined {
  for (const result of Object.values(results)) {
    if (!result.isValid && result.error) {
      return result.error;
    }
  }
  return undefined;
}

// ============================================
// EXPORTS
// ============================================

export const validationUtils = {
  isEmpty,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateLengthRange,
  validateIsNumber,
  validateMin,
  validateMax,
  validateRange,
  validatePositive,
  validateInteger,
  validateVietnamesePhone,
  validatePhone,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateCCCD,
  validateCMND,
  validateTaxId,
  validateUrl,
  validateDate,
  validatePastDate,
  validateFutureDate,
  validateAge,
  validateField,
  validateForm,
  isFormValid,
  getFirstError,
};

export default validationUtils;
