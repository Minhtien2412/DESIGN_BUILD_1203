/**
 * Email Validation Service
 * Real email validation sử dụng regex và domain verification
 */

// Common email domains để kiểm tra tính thực tế
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'apple.com', 'protonmail.com', 'tutanota.com',
  'company.com', 'business.com', 'enterprise.com',
  // Vietnamese domains
  'yandex.com', 'mail.ru', '126.com', '163.com',
  'qq.com', 'sina.com', 'sohu.com',
  // Corporate domains
  'thietkeresort.com', 'designbuild.com', 'construction.vn'
];

// Regex patterns for email validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const STRONG_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export interface EmailValidationResult {
  isValid: boolean;
  score: number; // 0-100 (higher = better)
  issues: string[];
  suggestions?: string[];
  domain: string;
  localPart: string;
}

/**
 * Validate email format và domain
 */
export function validateEmail(email: string): EmailValidationResult {
  const result: EmailValidationResult = {
    isValid: false,
    score: 0,
    issues: [],
    domain: '',
    localPart: ''
  };

  // Basic format check
  if (!email || typeof email !== 'string') {
    result.issues.push('Email không được để trống');
    return result;
  }

  email = email.trim().toLowerCase();

  // Length check
  if (email.length < 5) {
    result.issues.push('Email quá ngắn (tối thiểu 5 ký tự)');
    return result;
  }

  if (email.length > 254) {
    result.issues.push('Email quá dài (tối đa 254 ký tự)');
    return result;
  }

  // Basic regex check
  if (!EMAIL_REGEX.test(email)) {
    result.issues.push('Định dạng email không hợp lệ');
    return result;
  }

  // Strong regex check
  if (!STRONG_EMAIL_REGEX.test(email)) {
    result.issues.push('Email chứa ký tự không được phép');
    result.score = 20;
  } else {
    result.score = 50;
  }

  // Split email
  const atIndex = email.lastIndexOf('@');
  result.localPart = email.substring(0, atIndex);
  result.domain = email.substring(atIndex + 1);

  // Local part validation
  if (result.localPart.length > 64) {
    result.issues.push('Phần tên email quá dài (tối đa 64 ký tự)');
  }

  if (result.localPart.startsWith('.') || result.localPart.endsWith('.')) {
    result.issues.push('Tên email không thể bắt đầu hoặc kết thúc bằng dấu chấm');
  }

  if (result.localPart.includes('..')) {
    result.issues.push('Tên email không thể chứa hai dấu chấm liên tiếp');
  }

  // Domain validation
  if (result.domain.length < 3) {
    result.issues.push('Tên miền quá ngắn');
  }

  if (result.domain.startsWith('-') || result.domain.endsWith('-')) {
    result.issues.push('Tên miền không hợp lệ');
  }

  if (!result.domain.includes('.')) {
    result.issues.push('Tên miền phải có phần mở rộng (VD: .com)');
  }

  // Check for common domains
  const isCommonDomain = COMMON_DOMAINS.includes(result.domain);
  if (isCommonDomain) {
    result.score += 30;
  } else {
    result.score += 10;
    result.suggestions = [`Đề xuất: Sử dụng email từ nhà cung cấp phổ biến như ${COMMON_DOMAINS.slice(0, 3).join(', ')}`];
  }

  // Additional quality checks
  if (result.localPart.length >= 3) {
    result.score += 10;
  }

  if (!/^\d+$/.test(result.localPart)) { // Not all numbers
    result.score += 10;
  }

  // Final validation
  result.isValid = result.issues.length === 0 && result.score >= 60;

  return result;
}

/**
 * Validate email với suggestion cho user
 */
export function validateEmailWithSuggestions(email: string): {
  isValid: boolean;
  message: string;
  suggestions?: string[];
} {
  const validation = validateEmail(email);
  
  if (validation.isValid) {
    return {
      isValid: true,
      message: 'Email hợp lệ'
    };
  }

  const mainIssue = validation.issues[0] || 'Email không hợp lệ';
  
  return {
    isValid: false,
    message: mainIssue,
    suggestions: validation.suggestions
  };
}

/**
 * Suggest email corrections
 */
export function suggestEmailCorrections(email: string): string[] {
  const suggestions: string[] = [];
  
  if (!email) return suggestions;
  
  const lowerEmail = email.toLowerCase().trim();
  
  // Common typos
  const typoCorrections: { [key: string]: string } = {
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.cm': 'yahoo.com',
    'hotmail.co': 'hotmail.com',
    'hotmail.cm': 'hotmail.com',
    'outlook.co': 'outlook.com',
    'outlook.cm': 'outlook.com'
  };

  // Check for typos
  for (const [typo, correction] of Object.entries(typoCorrections)) {
    if (lowerEmail.includes(typo)) {
      suggestions.push(lowerEmail.replace(typo, correction));
    }
  }

  // If no @ symbol, suggest adding domain
  if (!lowerEmail.includes('@') && lowerEmail.length > 0) {
    suggestions.push(`${lowerEmail}@gmail.com`);
    suggestions.push(`${lowerEmail}@yahoo.com`);
  }

  return suggestions;
}

/**
 * Check email domain reputation
 */
export function checkEmailDomainReputation(domain: string): {
  isReputable: boolean;
  category: 'premium' | 'common' | 'suspicious' | 'unknown';
  score: number;
} {
  domain = domain.toLowerCase();

  // Premium domains
  const premiumDomains = ['gmail.com', 'outlook.com', 'icloud.com', 'apple.com', 'protonmail.com'];
  if (premiumDomains.includes(domain)) {
    return { isReputable: true, category: 'premium', score: 95 };
  }

  // Common domains  
  if (COMMON_DOMAINS.includes(domain)) {
    return { isReputable: true, category: 'common', score: 80 };
  }

  // Suspicious patterns
  const suspiciousPatterns = [
    /^temp/, /^fake/, /^test/, /^demo/, /^spam/,
    /\d{10,}/, // Too many numbers
    /(.)\1{4,}/ // Repeated characters
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(domain)) {
      return { isReputable: false, category: 'suspicious', score: 20 };
    }
  }

  // Unknown domain
  return { isReputable: true, category: 'unknown', score: 60 };
}
