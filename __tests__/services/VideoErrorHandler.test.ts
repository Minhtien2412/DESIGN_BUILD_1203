/**
 * Tests for VideoErrorHandler
 * @see PRODUCT_BACKLOG.md VIDEO-002
 */

import {
    calculateRetryDelay,
    classifyError,
    createVideoError,
    getErrorMessage,
    selectFallbackUrl,
    shouldRetry,
    VideoErrorManager,
    VideoErrorType,
} from "@/services/VideoErrorHandler";

describe("VideoErrorHandler", () => {
  describe("classifyError", () => {
    it("should classify network errors", () => {
      expect(classifyError({ message: "Network error" })).toBe(
        VideoErrorType.NETWORK
      );
      expect(classifyError({ message: "Connection failed" })).toBe(
        VideoErrorType.NETWORK
      );
      expect(classifyError({ name: "NetworkError" })).toBe(
        VideoErrorType.NETWORK
      );
    });

    it("should classify timeout errors", () => {
      expect(classifyError({ message: "Request timeout" })).toBe(
        VideoErrorType.TIMEOUT
      );
      expect(classifyError({ message: "Operation timed out" })).toBe(
        VideoErrorType.TIMEOUT
      );
      expect(classifyError({ name: "TimeoutError" })).toBe(
        VideoErrorType.TIMEOUT
      );
    });

    it("should classify codec errors", () => {
      expect(classifyError({ message: "Unsupported codec" })).toBe(
        VideoErrorType.CODEC
      );
      expect(classifyError({ message: "Cannot decode video" })).toBe(
        VideoErrorType.CODEC
      );
      expect(classifyError({ code: "MEDIA_ERR_SRC_NOT_SUPPORTED" })).toBe(
        VideoErrorType.CODEC
      );
    });

    it("should classify HTTP status errors", () => {
      expect(classifyError({}, 403)).toBe(VideoErrorType.FORBIDDEN);
      expect(classifyError({}, 404)).toBe(VideoErrorType.NOT_FOUND);
      expect(classifyError({}, 500)).toBe(VideoErrorType.SERVER_ERROR);
      expect(classifyError({}, 502)).toBe(VideoErrorType.SERVER_ERROR);
    });

    it("should return UNKNOWN for unclassifiable errors", () => {
      expect(classifyError({})).toBe(VideoErrorType.UNKNOWN);
      expect(classifyError({ message: "Something went wrong" })).toBe(
        VideoErrorType.UNKNOWN
      );
    });
  });

  describe("createVideoError", () => {
    it("should create a structured error object", () => {
      const error = new Error("Network error");
      const videoError = createVideoError(error, {
        videoId: "video-1",
        url: "http://test.com/video.mp4",
      });

      expect(videoError.type).toBe(VideoErrorType.NETWORK);
      expect(videoError.message).toBeTruthy();
      expect(videoError.videoId).toBe("video-1");
      expect(videoError.url).toBe("http://test.com/video.mp4");
      expect(videoError.timestamp).toBeLessThanOrEqual(Date.now());
      expect(videoError.retryable).toBe(true);
    });

    it("should mark non-retryable errors correctly", () => {
      const error = createVideoError(
        { message: "not found" },
        { httpStatus: 404 }
      );
      expect(error.retryable).toBe(false);

      const forbiddenError = createVideoError({}, { httpStatus: 403 });
      expect(forbiddenError.retryable).toBe(false);
    });

    it("should mark retryable errors correctly", () => {
      const networkError = createVideoError({ message: "network error" });
      expect(networkError.retryable).toBe(true);

      const timeoutError = createVideoError({ message: "timeout" });
      expect(timeoutError.retryable).toBe(true);

      const serverError = createVideoError({}, { httpStatus: 500 });
      expect(serverError.retryable).toBe(true);
    });
  });

  describe("getErrorMessage", () => {
    it("should return Vietnamese error messages", () => {
      expect(getErrorMessage(VideoErrorType.NETWORK)).toContain("kết nối");
      expect(getErrorMessage(VideoErrorType.TIMEOUT)).toContain("thời gian");
      expect(getErrorMessage(VideoErrorType.NOT_FOUND)).toContain(
        "không tồn tại"
      );
      expect(getErrorMessage(VideoErrorType.FORBIDDEN)).toContain("quyền");
    });
  });

  describe("calculateRetryDelay", () => {
    it("should calculate exponential backoff", () => {
      const delay0 = calculateRetryDelay(0);
      const delay1 = calculateRetryDelay(1);
      const delay2 = calculateRetryDelay(2);

      // Base delay should be around 1000ms
      expect(delay0).toBeGreaterThan(800);
      expect(delay0).toBeLessThan(1200);

      // Each subsequent delay should be roughly double
      expect(delay1).toBeGreaterThan(delay0);
      expect(delay2).toBeGreaterThan(delay1);
    });

    it("should not exceed max delay", () => {
      const delay = calculateRetryDelay(10, {
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        maxRetries: 3,
        backoffMultiplier: 2,
      });

      expect(delay).toBeLessThanOrEqual(10000 * 1.2); // Allow for jitter
    });
  });

  describe("shouldRetry", () => {
    it("should return true for retryable errors within limit", () => {
      const error = createVideoError({ message: "network error" });
      expect(shouldRetry(error, 0)).toBe(true);
      expect(shouldRetry(error, 1)).toBe(true);
      expect(shouldRetry(error, 2)).toBe(true);
    });

    it("should return false when max retries exceeded", () => {
      const error = createVideoError({ message: "network error" });
      expect(shouldRetry(error, 3)).toBe(false);
      expect(shouldRetry(error, 4)).toBe(false);
    });

    it("should return false for non-retryable errors", () => {
      const error = createVideoError({}, { httpStatus: 404 });
      expect(shouldRetry(error, 0)).toBe(false);
    });
  });

  describe("selectFallbackUrl", () => {
    const qualities = [
      { label: "HD", url: "http://test.com/hd.mp4", resolution: "1080p" },
      { label: "SD", url: "http://test.com/sd.mp4", resolution: "720p" },
      { label: "Low", url: "http://test.com/low.mp4", resolution: "480p" },
    ];

    it("should select lower quality as fallback", () => {
      const fallback = selectFallbackUrl(
        qualities,
        "http://test.com/hd.mp4",
        true
      );
      expect(fallback).toBe("http://test.com/sd.mp4");
    });

    it("should return first available if current not in list", () => {
      const fallback = selectFallbackUrl(
        qualities,
        "http://test.com/unknown.mp4",
        true
      );
      expect(fallback).toBe("http://test.com/hd.mp4");
    });

    it("should return null if no fallback available", () => {
      const singleQuality = [
        { label: "HD", url: "http://test.com/hd.mp4", resolution: "1080p" },
      ];
      const fallback = selectFallbackUrl(
        singleQuality,
        "http://test.com/hd.mp4",
        true
      );
      expect(fallback).toBeNull();
    });
  });

  describe("VideoErrorManager", () => {
    let manager: VideoErrorManager;

    beforeEach(() => {
      manager = new VideoErrorManager();
    });

    it("should record errors", () => {
      manager.recordError("video-1", new Error("Test error"));

      const lastError = manager.getLastError("video-1");
      expect(lastError).not.toBeNull();
      expect(lastError?.videoId).toBe("video-1");
    });

    it("should track retry count", () => {
      expect(manager.getRetryCount("video-1")).toBe(0);

      manager.incrementRetryCount("video-1");
      expect(manager.getRetryCount("video-1")).toBe(1);

      manager.incrementRetryCount("video-1");
      expect(manager.getRetryCount("video-1")).toBe(2);
    });

    it("should check if exceeded retries", () => {
      expect(manager.hasExceededRetries("video-1")).toBe(false);

      manager.incrementRetryCount("video-1");
      manager.incrementRetryCount("video-1");
      manager.incrementRetryCount("video-1");

      expect(manager.hasExceededRetries("video-1")).toBe(true);
    });

    it("should reset errors", () => {
      manager.recordError("video-1", new Error("Test"));
      manager.incrementRetryCount("video-1");

      manager.resetErrors("video-1");

      expect(manager.getLastError("video-1")).toBeNull();
      expect(manager.getRetryCount("video-1")).toBe(0);
    });

    it("should get all errors for a video", () => {
      manager.recordError("video-1", new Error("Error 1"));
      manager.recordError("video-1", new Error("Error 2"));

      const errors = manager.getErrors("video-1");
      expect(errors).toHaveLength(2);
    });

    it("should clear all errors", () => {
      manager.recordError("video-1", new Error("Error 1"));
      manager.recordError("video-2", new Error("Error 2"));

      manager.clearAll();

      expect(manager.getLastError("video-1")).toBeNull();
      expect(manager.getLastError("video-2")).toBeNull();
    });
  });
});
