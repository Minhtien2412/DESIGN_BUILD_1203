/**
 * Tests for ChunkedUploadService
 * UPLOAD-002: Chunked Upload + Resume
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
// FileSystemCompat is mocked via moduleNameMapper in jest.config.js
import * as FileSystem from "@/utils/FileSystemCompat";

import {
    calculateChunkSize,
    calculateTotalChunks,
    ChunkedUploadService,
    ChunkSplitter,
    getChunkRange,
} from "../../services/ChunkedUploadService";
import { post } from "../../services/api";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

jest.mock("../../services/PresignedUploadService", () => ({
  calculateChecksum: jest.fn().mockResolvedValue("test-checksum"),
}));

describe("ChunkedUploadService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // ===========================================================================
  // CHUNK CALCULATION TESTS
  // ===========================================================================

  describe("calculateChunkSize", () => {
    it("should return minimum 5MB for small files", () => {
      const size = calculateChunkSize(10 * 1024 * 1024); // 10MB
      expect(size).toBeGreaterThanOrEqual(5 * 1024 * 1024);
    });

    it("should calculate appropriate size for large files", () => {
      const size = calculateChunkSize(1024 * 1024 * 1024); // 1GB
      expect(size).toBeGreaterThan(5 * 1024 * 1024);
      expect(size).toBeLessThanOrEqual(100 * 1024 * 1024);
    });

    it("should not exceed 100MB", () => {
      const size = calculateChunkSize(50 * 1024 * 1024 * 1024); // 50GB
      expect(size).toBeLessThanOrEqual(100 * 1024 * 1024);
    });
  });

  describe("calculateTotalChunks", () => {
    it("should calculate correct number of chunks", () => {
      expect(calculateTotalChunks(100, 10)).toBe(10);
      expect(calculateTotalChunks(105, 10)).toBe(11);
      expect(calculateTotalChunks(10, 10)).toBe(1);
    });

    it("should handle exact divisibility", () => {
      const chunkSize = 5 * 1024 * 1024;
      const fileSize = 25 * 1024 * 1024;
      expect(calculateTotalChunks(fileSize, chunkSize)).toBe(5);
    });
  });

  describe("getChunkRange", () => {
    const chunkSize = 10;
    const fileSize = 95;

    it("should return correct range for first chunk", () => {
      const range = getChunkRange(1, chunkSize, fileSize);
      expect(range.start).toBe(0);
      expect(range.end).toBe(10);
      expect(range.size).toBe(10);
    });

    it("should return correct range for middle chunk", () => {
      const range = getChunkRange(5, chunkSize, fileSize);
      expect(range.start).toBe(40);
      expect(range.end).toBe(50);
      expect(range.size).toBe(10);
    });

    it("should return correct range for last partial chunk", () => {
      const range = getChunkRange(10, chunkSize, fileSize);
      expect(range.start).toBe(90);
      expect(range.end).toBe(95);
      expect(range.size).toBe(5);
    });
  });

  // ===========================================================================
  // CHUNK SPLITTER TESTS
  // ===========================================================================

  describe("ChunkSplitter", () => {
    it("should calculate total chunks correctly", () => {
      const splitter = new ChunkSplitter("file:///test.mp4", 100, 10);
      expect(splitter.totalChunks).toBe(10);
    });

    it("should read chunk data", async () => {
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        "base64data",
      );

      const splitter = new ChunkSplitter("file:///test.mp4", 100, 10);
      const { data, size } = await splitter.readChunk(1);

      expect(data).toBe("base64data");
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
        "file:///test.mp4",
        {
          encoding: "base64",
          position: 0,
          length: 10,
        },
      );
    });

    it("should get chunk info without reading", () => {
      const splitter = new ChunkSplitter("file:///test.mp4", 100, 10);
      const info = splitter.getChunkInfo(3);

      expect(info.start).toBe(20);
      expect(info.end).toBe(30);
      expect(info.size).toBe(10);
    });
  });

  // ===========================================================================
  // INITIATE UPLOAD TESTS
  // ===========================================================================

  describe("initiateUpload", () => {
    it("should initiate multipart upload", async () => {
      (post as jest.Mock).mockResolvedValue({
        uploadId: "mp-upload-123",
        key: "uploads/test.mp4",
        chunkSize: 5 * 1024 * 1024,
        totalChunks: 20,
        maxPartSize: 100 * 1024 * 1024,
      });

      const result = await ChunkedUploadService.initiateUpload({
        filename: "test.mp4",
        contentType: "video/mp4",
        fileSize: 100 * 1024 * 1024,
      });

      expect(result.uploadId).toBe("mp-upload-123");
      expect(result.totalChunks).toBe(20);
      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/multipart/initiate",
        expect.objectContaining({
          filename: "test.mp4",
          contentType: "video/mp4",
        }),
      );
    });

    it("should include metadata in initiate request", async () => {
      (post as jest.Mock).mockResolvedValue({
        uploadId: "mp-upload-123",
        key: "uploads/test.mp4",
        chunkSize: 5 * 1024 * 1024,
        totalChunks: 20,
        maxPartSize: 100 * 1024 * 1024,
      });

      await ChunkedUploadService.initiateUpload({
        filename: "test.mp4",
        contentType: "video/mp4",
        fileSize: 100 * 1024 * 1024,
        metadata: { projectId: "proj-123" },
      });

      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/multipart/initiate",
        expect.objectContaining({
          metadata: { projectId: "proj-123" },
        }),
      );
    });
  });

  // ===========================================================================
  // COMPLETE UPLOAD TESTS
  // ===========================================================================

  describe("completeUpload", () => {
    it("should complete multipart upload", async () => {
      (post as jest.Mock).mockResolvedValue({
        fileId: "file-123",
        fileUrl: "https://cdn.example.com/test.mp4",
        filename: "test.mp4",
        contentType: "video/mp4",
        fileSize: 100 * 1024 * 1024,
        checksum: "abc123",
        createdAt: new Date().toISOString(),
      });

      const result = await ChunkedUploadService.completeUpload({
        uploadId: "mp-upload-123",
        parts: [
          { partNumber: 1, etag: '"etag1"' },
          { partNumber: 2, etag: '"etag2"' },
        ],
      });

      expect(result.fileId).toBe("file-123");
      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/multipart/complete",
        expect.objectContaining({
          uploadId: "mp-upload-123",
          parts: expect.arrayContaining([
            { partNumber: 1, etag: '"etag1"' },
            { partNumber: 2, etag: '"etag2"' },
          ]),
        }),
      );
    });
  });

  // ===========================================================================
  // ABORT UPLOAD TESTS
  // ===========================================================================

  describe("abortUpload", () => {
    it("should abort multipart upload", async () => {
      (post as jest.Mock).mockResolvedValue({});

      await ChunkedUploadService.abortUpload("mp-upload-123");

      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/multipart/mp-upload-123/abort",
        {},
      );
    });
  });

  // ===========================================================================
  // PERSISTENCE TESTS
  // ===========================================================================

  describe("persistence", () => {
    it("should get pending uploads", async () => {
      const mockStates = {
        "upload-1": {
          uploadId: "upload-1",
          key: "uploads/file1.mp4",
          filename: "file1.mp4",
          fileUri: "file:///file1.mp4",
          contentType: "video/mp4",
          totalBytes: 100000000,
          chunkSize: 5242880,
          totalChunks: 20,
          completedParts: [{ partNumber: 1, etag: '"etag1"' }],
          failedChunks: [],
          startedAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockStates),
      );

      const pending = await ChunkedUploadService.getPendingUploads();

      expect(pending).toHaveLength(1);
      expect(pending[0].uploadId).toBe("upload-1");
      expect(pending[0].completedParts).toHaveLength(1);
    });

    it("should return empty array when no pending uploads", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const pending = await ChunkedUploadService.getPendingUploads();

      expect(pending).toEqual([]);
    });
  });

  // ===========================================================================
  // CONFIGURATION TESTS
  // ===========================================================================

  describe("configuration", () => {
    it("should update configuration", () => {
      ChunkedUploadService.configure({
        chunkSize: 10 * 1024 * 1024,
        maxConcurrent: 5,
      });

      // No direct way to test internal config, but should not throw
      expect(true).toBe(true);
    });
  });

  // ===========================================================================
  // PROGRESS TESTS
  // ===========================================================================

  describe("progress tracking", () => {
    it("should return null for non-existent upload", () => {
      const progress = ChunkedUploadService.getProgress("non-existent");
      expect(progress).toBeNull();
    });

    it("should allow subscribing to progress", () => {
      const callback = jest.fn();
      const unsubscribe = ChunkedUploadService.subscribe(
        "upload-123",
        callback,
      );

      expect(typeof unsubscribe).toBe("function");

      // Unsubscribe should not throw
      unsubscribe();
    });
  });

  // ===========================================================================
  // PAUSE/RESUME TESTS
  // ===========================================================================

  describe("pause and cancel", () => {
    it("should not throw when pausing non-existent upload", () => {
      expect(() => {
        ChunkedUploadService.pauseUpload("non-existent");
      }).not.toThrow();
    });

    it("should not throw when unpausing non-existent upload", () => {
      expect(() => {
        ChunkedUploadService.unpauseUpload("non-existent");
      }).not.toThrow();
    });

    it("should cancel upload and abort", async () => {
      (post as jest.Mock).mockResolvedValue({});

      await ChunkedUploadService.cancelUpload("upload-to-cancel");

      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/multipart/upload-to-cancel/abort",
        {},
      );
    });
  });
});
