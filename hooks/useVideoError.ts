/**
 * useVideoError - Hook để quản lý video error state và retry logic
 *
 * @see PRODUCT_BACKLOG.md VIDEO-002
 */

import {
    FallbackQuality,
    VideoError,
    VideoErrorType,
    calculateRetryDelay,
    createVideoError,
    logErrorTelemetry,
    selectFallbackUrl,
    videoErrorManager,
} from "@/services/VideoErrorHandler";
import { useCallback, useRef, useState } from "react";

interface UseVideoErrorOptions {
  videoId: string;
  maxRetries?: number;
  fallbackQualities?: FallbackQuality[];
  onError?: (error: VideoError) => void;
  onRetrySuccess?: () => void;
  onFallback?: (url: string) => void;
}

interface UseVideoErrorReturn {
  error: VideoError | null;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
  currentUrl: string | null;
  handleError: (error: any, url?: string) => VideoError;
  retry: () => Promise<boolean>;
  reset: () => void;
  tryFallback: () => string | null;
}

export function useVideoError(
  options: UseVideoErrorOptions
): UseVideoErrorReturn {
  const {
    videoId,
    maxRetries = 3,
    fallbackQualities = [],
    onError,
    onRetrySuccess,
    onFallback,
  } = options;

  const [error, setError] = useState<VideoError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const retryStartTime = useRef<number>(0);
  const triedUrls = useRef<Set<string>>(new Set());

  /**
   * Handle a video error
   */
  const handleError = useCallback(
    (err: any, url?: string): VideoError => {
      const videoError = createVideoError(err, { videoId, url });

      // Track URL as tried
      if (url) {
        triedUrls.current.add(url);
        setCurrentUrl(url);
      }

      setError(videoError);
      onError?.(videoError);

      // Log telemetry
      logErrorTelemetry({
        errorType: videoError.type,
        videoId,
        url,
        retryCount,
        resolved: false,
        timestamp: Date.now(),
      });

      return videoError;
    },
    [videoId, retryCount, onError]
  );

  /**
   * Retry current video
   */
  const retry = useCallback(async (): Promise<boolean> => {
    if (!error?.retryable || retryCount >= maxRetries) {
      return false;
    }

    setIsRetrying(true);
    retryStartTime.current = Date.now();

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    // Calculate delay with exponential backoff
    const delay = calculateRetryDelay(retryCount);

    // Wait for delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Clear error to trigger reload
    setError(null);
    setIsRetrying(false);

    // Log retry attempt
    logErrorTelemetry({
      errorType: error.type,
      videoId,
      url: currentUrl || undefined,
      retryCount: newRetryCount,
      resolved: false, // Will be updated if retry succeeds
      resolutionMethod: "retry",
      timestamp: Date.now(),
      duration: Date.now() - retryStartTime.current,
    });

    // Notify success callback (caller should verify if video plays)
    onRetrySuccess?.();

    return true;
  }, [error, retryCount, maxRetries, videoId, currentUrl, onRetrySuccess]);

  /**
   * Try fallback quality
   */
  const tryFallback = useCallback((): string | null => {
    if (fallbackQualities.length === 0) {
      return null;
    }

    // Find a quality we haven't tried yet
    const availableQualities = fallbackQualities.filter(
      (q) => !triedUrls.current.has(q.url)
    );

    if (availableQualities.length === 0) {
      return null;
    }

    const fallbackUrl = selectFallbackUrl(
      availableQualities,
      currentUrl || "",
      true // Prefer lower quality
    );

    if (fallbackUrl) {
      triedUrls.current.add(fallbackUrl);
      setCurrentUrl(fallbackUrl);
      setError(null); // Clear error to trigger reload

      // Log fallback attempt
      logErrorTelemetry({
        errorType: error?.type || VideoErrorType.UNKNOWN,
        videoId,
        url: fallbackUrl,
        retryCount,
        resolved: false,
        resolutionMethod: "fallback",
        timestamp: Date.now(),
      });

      onFallback?.(fallbackUrl);
    }

    return fallbackUrl;
  }, [fallbackQualities, currentUrl, error, videoId, retryCount, onFallback]);

  /**
   * Reset error state
   */
  const reset = useCallback(() => {
    setError(null);
    setIsRetrying(false);
    setRetryCount(0);
    setCurrentUrl(null);
    triedUrls.current.clear();
    videoErrorManager.resetErrors(videoId);
  }, [videoId]);

  return {
    error,
    isRetrying,
    retryCount,
    canRetry: error?.retryable === true && retryCount < maxRetries,
    currentUrl,
    handleError,
    retry,
    reset,
    tryFallback,
  };
}

/**
 * Simplified hook for error display only
 */
export function useVideoErrorDisplay(videoId: string) {
  const lastError = videoErrorManager.getLastError(videoId);
  const retryCount = videoErrorManager.getRetryCount(videoId);
  const hasExceeded = videoErrorManager.hasExceededRetries(videoId);

  return {
    error: lastError,
    retryCount,
    hasExceededRetries: hasExceeded,
  };
}
