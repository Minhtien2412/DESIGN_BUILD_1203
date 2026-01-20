/**
 * VideoErrorHandler - Utility để xử lý và phân loại video errors
 *
 * Features:
 * - Phân loại lỗi: network, timeout, codec, 403, 404
 * - Retry với exponential backoff
 * - Fallback policy cho quality khác
 * - Telemetry logging
 *
 * @see PRODUCT_BACKLOG.md VIDEO-002
 */

export enum VideoErrorType {
  NETWORK = "NETWORK",
  TIMEOUT = "TIMEOUT",
  CODEC = "CODEC",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN = "UNKNOWN",
}

export interface VideoError {
  type: VideoErrorType;
  code?: string | number;
  message: string;
  originalError?: any;
  timestamp: number;
  videoId?: string;
  url?: string;
  retryable: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface FallbackQuality {
  label: string;
  url: string;
  resolution: string;
}

// Default retry config
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Classify error based on error object or HTTP status
 */
export function classifyError(error: any, httpStatus?: number): VideoErrorType {
  // Check HTTP status first
  if (httpStatus) {
    if (httpStatus === 403) return VideoErrorType.FORBIDDEN;
    if (httpStatus === 404) return VideoErrorType.NOT_FOUND;
    if (httpStatus >= 500) return VideoErrorType.SERVER_ERROR;
  }

  // Check error message/code
  const errorMessage = error?.message?.toLowerCase() || "";
  const errorCode = error?.code?.toString().toLowerCase() || "";

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("offline") ||
    errorCode.includes("network") ||
    error?.name === "NetworkError"
  ) {
    return VideoErrorType.NETWORK;
  }

  // Timeout errors
  if (
    errorMessage.includes("timeout") ||
    errorMessage.includes("timed out") ||
    errorCode.includes("timeout") ||
    error?.name === "TimeoutError"
  ) {
    return VideoErrorType.TIMEOUT;
  }

  // Codec errors
  if (
    errorMessage.includes("codec") ||
    errorMessage.includes("unsupported") ||
    errorMessage.includes("decode") ||
    errorMessage.includes("format") ||
    errorCode.includes("media_err_src_not_supported")
  ) {
    return VideoErrorType.CODEC;
  }

  // Permission/Access errors
  if (
    errorMessage.includes("forbidden") ||
    errorMessage.includes("access denied") ||
    errorMessage.includes("permission")
  ) {
    return VideoErrorType.FORBIDDEN;
  }

  // Not found
  if (
    errorMessage.includes("not found") ||
    errorMessage.includes("404") ||
    errorMessage.includes("missing")
  ) {
    return VideoErrorType.NOT_FOUND;
  }

  return VideoErrorType.UNKNOWN;
}

/**
 * Create a structured VideoError object
 */
export function createVideoError(
  error: any,
  options?: {
    videoId?: string;
    url?: string;
    httpStatus?: number;
  }
): VideoError {
  const type = classifyError(error, options?.httpStatus);

  const retryableTypes = [
    VideoErrorType.NETWORK,
    VideoErrorType.TIMEOUT,
    VideoErrorType.SERVER_ERROR,
  ];

  return {
    type,
    code: error?.code || options?.httpStatus,
    message: getErrorMessage(type, error),
    originalError: error,
    timestamp: Date.now(),
    videoId: options?.videoId,
    url: options?.url,
    retryable: retryableTypes.includes(type),
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(type: VideoErrorType, _error?: any): string {
  const messages: Record<VideoErrorType, string> = {
    [VideoErrorType.NETWORK]:
      "Không thể kết nối mạng. Vui lòng kiểm tra kết nối.",
    [VideoErrorType.TIMEOUT]: "Quá thời gian chờ. Vui lòng thử lại.",
    [VideoErrorType.CODEC]: "Định dạng video không được hỗ trợ.",
    [VideoErrorType.FORBIDDEN]: "Không có quyền truy cập video này.",
    [VideoErrorType.NOT_FOUND]: "Video không tồn tại hoặc đã bị xóa.",
    [VideoErrorType.SERVER_ERROR]: "Lỗi máy chủ. Vui lòng thử lại sau.",
    [VideoErrorType.UNKNOWN]: "Không thể phát video. Vui lòng thử lại.",
  };

  return messages[type];
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay =
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attemptNumber);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Check if should retry based on error and attempt number
 */
export function shouldRetry(
  error: VideoError,
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): boolean {
  if (!error.retryable) return false;
  return attemptNumber < config.maxRetries;
}

/**
 * Retry handler with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, delay: number) => void
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const videoError = createVideoError(error);

      if (!shouldRetry(videoError, attempt, config)) {
        throw error;
      }

      const delay = calculateRetryDelay(attempt, config);
      onRetry?.(attempt + 1, delay);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Select fallback quality URL
 */
export function selectFallbackUrl(
  availableQualities: FallbackQuality[],
  currentUrl: string,
  preferLowerQuality: boolean = true
): string | null {
  // Find current quality index
  const currentIndex = availableQualities.findIndex(
    (q) => q.url === currentUrl
  );

  if (currentIndex === -1) {
    // Current URL not in list, return first available
    return availableQualities[0]?.url || null;
  }

  if (preferLowerQuality) {
    // Try lower quality first (higher index = lower quality)
    for (let i = currentIndex + 1; i < availableQualities.length; i++) {
      if (availableQualities[i].url !== currentUrl) {
        return availableQualities[i].url;
      }
    }
  }

  // Try any other quality
  for (const quality of availableQualities) {
    if (quality.url !== currentUrl) {
      return quality.url;
    }
  }

  return null;
}

/**
 * Telemetry logger for video errors
 */
export interface VideoErrorTelemetry {
  errorType: VideoErrorType;
  videoId?: string;
  url?: string;
  retryCount: number;
  resolved: boolean;
  resolutionMethod?: "retry" | "fallback" | "none";
  timestamp: number;
  duration?: number; // Time to resolve
}

type TelemetryCallback = (telemetry: VideoErrorTelemetry) => void;

let telemetryCallback: TelemetryCallback | null = null;

/**
 * Set telemetry callback for error logging
 */
export function setTelemetryCallback(callback: TelemetryCallback | null): void {
  telemetryCallback = callback;
}

/**
 * Log video error telemetry
 */
export function logErrorTelemetry(telemetry: VideoErrorTelemetry): void {
  // Console log in dev
  if (__DEV__) {
    console.log("[VideoError Telemetry]", telemetry);
  }

  // Call external telemetry callback if set
  telemetryCallback?.(telemetry);
}

/**
 * Video Error Handler class for managing error state
 */
export class VideoErrorManager {
  private errors: Map<string, VideoError[]> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Record an error for a video
   */
  recordError(videoId: string, error: any, url?: string): VideoError {
    const videoError = createVideoError(error, { videoId, url });

    const errors = this.errors.get(videoId) || [];
    errors.push(videoError);
    this.errors.set(videoId, errors);

    return videoError;
  }

  /**
   * Get retry count for a video
   */
  getRetryCount(videoId: string): number {
    return this.retryAttempts.get(videoId) || 0;
  }

  /**
   * Increment retry count
   */
  incrementRetryCount(videoId: string): number {
    const count = this.getRetryCount(videoId) + 1;
    this.retryAttempts.set(videoId, count);
    return count;
  }

  /**
   * Reset error state for a video
   */
  resetErrors(videoId: string): void {
    this.errors.delete(videoId);
    this.retryAttempts.delete(videoId);
  }

  /**
   * Check if video has too many errors
   */
  hasExceededRetries(videoId: string): boolean {
    return this.getRetryCount(videoId) >= this.config.maxRetries;
  }

  /**
   * Get last error for a video
   */
  getLastError(videoId: string): VideoError | null {
    const errors = this.errors.get(videoId);
    return errors?.[errors.length - 1] || null;
  }

  /**
   * Get all errors for a video
   */
  getErrors(videoId: string): VideoError[] {
    return this.errors.get(videoId) || [];
  }

  /**
   * Clear all errors
   */
  clearAll(): void {
    this.errors.clear();
    this.retryAttempts.clear();
  }
}

// Export singleton instance
export const videoErrorManager = new VideoErrorManager();
