/**
 * API Error Classes
 * 
 * Structured error types for better error handling
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public endpoint: string,
    message?: string
  ) {
    super(message || `API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }

  /**
   * Check if error is a specific HTTP status
   */
  is(status: number): boolean {
    return this.status === status;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if feature is not implemented (404)
   */
  isNotImplemented(): boolean {
    return this.status === 404;
  }

  /**
   * Check if unauthorized (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if forbidden (403)
   */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if validation error (400)
   */
  isValidationError(): boolean {
    return this.status === 400;
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error Parser Utility
 */
export class ErrorParser {
  /**
   * Parse any error into structured format
   */
  static parse(error: unknown): {
    type: 'api' | 'network' | 'validation' | 'unknown';
    message: string;
    title: string;
    canRetry: boolean;
    error: Error;
  } {
    if (error instanceof ApiError) {
      if (error.isNotImplemented()) {
        return {
          type: 'api',
          title: 'Tính năng đang phát triển',
          message: 'Tính năng này chưa sẵn sàng. Vui lòng quay lại sau.',
          canRetry: false,
          error,
        };
      }

      if (error.isUnauthorized()) {
        return {
          type: 'api',
          title: 'Phiên đăng nhập hết hạn',
          message: 'Vui lòng đăng nhập lại để tiếp tục.',
          canRetry: false,
          error,
        };
      }

      if (error.isForbidden()) {
        return {
          type: 'api',
          title: 'Không có quyền truy cập',
          message: 'Bạn không có quyền thực hiện hành động này.',
          canRetry: false,
          error,
        };
      }

      if (error.isValidationError()) {
        return {
          type: 'validation',
          title: 'Dữ liệu không hợp lệ',
          message: 'Thông tin bạn cung cấp không đúng định dạng.',
          canRetry: false,
          error,
        };
      }

      if (error.isServerError()) {
        return {
          type: 'api',
          title: 'Lỗi hệ thống',
          message: 'Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.',
          canRetry: true,
          error,
        };
      }

      return {
        type: 'api',
        title: 'Đã xảy ra lỗi',
        message: error.message,
        canRetry: true,
        error,
      };
    }

    if (error instanceof NetworkError) {
      return {
        type: 'network',
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        canRetry: true,
        error,
      };
    }

    if (error instanceof ValidationError) {
      return {
        type: 'validation',
        title: 'Dữ liệu không hợp lệ',
        message: error.message,
        canRetry: false,
        error,
      };
    }

    if (error instanceof Error) {
      // Try to detect network errors
      if (
        error.message.includes('Network') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout')
      ) {
        return {
          type: 'network',
          title: 'Lỗi kết nối',
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
          canRetry: true,
          error,
        };
      }

      return {
        type: 'unknown',
        title: 'Đã xảy ra lỗi',
        message: error.message || 'Không thể hoàn thành yêu cầu.',
        canRetry: true,
        error,
      };
    }

    // Unknown error type
    const unknownError = new Error(String(error));
    return {
      type: 'unknown',
      title: 'Đã xảy ra lỗi',
      message: 'Không thể hoàn thành yêu cầu.',
      canRetry: true,
      error: unknownError,
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    return this.parse(error).message;
  }

  /**
   * Check if error is retryable
   */
  static canRetry(error: unknown): boolean {
    return this.parse(error).canRetry;
  }
}
