// Error handling utilities for API and app-wide error management
// Integrates with existing error handling patterns

export class AppError extends Error {
  code: number;
  details?: any;
  originalError?: any;

  constructor(code: number, message: string, details?: any, originalError?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.originalError = originalError;
    this.name = 'AppError';
  }

  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}

// Network error type
export class NetworkError extends AppError {
  constructor(message: string = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet') {
    super(0, message);
    this.name = 'NetworkError';
  }
}

// Authentication error type
export class AuthError extends AppError {
  constructor(message: string = 'Phiên đăng nhập đã hết hạn') {
    super(401, message);
    this.name = 'AuthError';
  }
}

// Permission error type
export class PermissionError extends AppError {
  constructor(message: string = 'Bạn không có quyền thực hiện thao tác này') {
    super(403, message);
    this.name = 'PermissionError';
  }
}

// Validation error type
export class ValidationError extends AppError {
  constructor(message: string = 'Dữ liệu không hợp lệ', details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

// Server error type
export class ServerError extends AppError {
  constructor(message: string = 'Có lỗi xảy ra, vui lòng thử lại') {
    super(500, message);
    this.name = 'ServerError';
  }
}

// Rate limit error type
export class RateLimitError extends AppError {
  constructor(message: string = 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau') {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

// Main error handler function
export function handleApiError(error: any): AppError {
  // If already an AppError, return as-is
  if (error instanceof AppError) {
    return error;
  }

  // Handle Axios errors
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || getDefaultErrorMessage(status);
    
    switch (status) {
      case 400:
        return new ValidationError(message, data);
      case 401:
        return new AuthError(message);
      case 403:
        return new PermissionError(message);
      case 409:
        return new AppError(409, 'Dữ liệu bị xung đột', data);
      case 429:
        return new RateLimitError(message);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message);
      default:
        return new AppError(status, message, data, error);
    }
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || 
      error.code === 'ECONNREFUSED' || 
      error.code === 'ENOTFOUND' ||
      error.message?.includes('Network Error')) {
    return new NetworkError();
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new AppError(0, 'Yêu cầu quá thời gian chờ. Vui lòng thử lại');
  }

  // Default error
  return new AppError(0, error.message || 'Có lỗi không xác định xảy ra', null, error);
}

// Get default error message for HTTP status codes
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Dữ liệu không hợp lệ';
    case 401:
      return 'Phiên đăng nhập đã hết hạn';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này';
    case 404:
      return 'Không tìm thấy dữ liệu yêu cầu';
    case 409:
      return 'Dữ liệu bị xung đột';
    case 422:
      return 'Dữ liệu không thể xử lý';
    case 429:
      return 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau';
    case 500:
      return 'Lỗi máy chủ nội bộ';
    case 502:
      return 'Máy chủ không phản hồi';
    case 503:
      return 'Dịch vụ tạm thời không khả dụng';
    case 504:
      return 'Máy chủ quá thời gian chờ';
    default:
      return 'Có lỗi xảy ra, vui lòng thử lại';
  }
}

// Error logging utility
export function logError(error: AppError, context?: string) {
  const logLevel = error.code >= 500 ? 'error' : error.code >= 400 ? 'warn' : 'info';
  const contextStr = context ? ` [${context}]` : '';
  
  console[logLevel](`${contextStr} ${error.toString()}`, {
    code: error.code,
    message: error.message,
    details: error.details,
    stack: error.stack,
  });
}

// User-friendly error message getter
export function getUserFriendlyMessage(error: AppError): string {
  // Return custom user-facing message or fallback to error message
  return error.message;
}

// Check if error is retryable
export function isRetryableError(error: AppError): boolean {
  return error.code === 0 || // Network errors
         error.code === 429 || // Rate limit
         error.code >= 500;    // Server errors
}

// Error reporting (can integrate with crash analytics)
export function reportError(error: AppError, context?: any) {
  // This is where you'd integrate with services like Sentry, Crashlytics, etc.
  logError(error, context?.toString());
  
  // Example: Sentry.captureException(error, { extra: context });
}

// Legacy compatibility with existing error handling
export function createApiError(status: number, message: string, detail?: any): AppError {
  return new AppError(status, message, detail);
}

// Export all error types for convenience
export {
    AppError as ApiError
};

// Default export
export default {
  AppError,
  NetworkError,
  AuthError,
  PermissionError,
  ValidationError,
  ServerError,
  RateLimitError,
  handleApiError,
  logError,
  getUserFriendlyMessage,
  isRetryableError,
  reportError,
  createApiError,
};
