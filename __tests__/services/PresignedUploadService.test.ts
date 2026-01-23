/**
 * Tests for PresignedUploadService
 * UPLOAD-001: Presigned Upload
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
// FileSystemCompat is mocked via moduleNameMapper in jest.config.js
import * as FileSystem from "@/utils/FileSystemCompat";

import {
    calculateChecksum,
    PresignedUploadService,
    validateFile,
} from "../../services/PresignedUploadService";
import { post } from "../../services/api";

// Mock FileSystemCompat module with all needed functions
jest.mock("@/utils/FileSystemCompat", () => ({
  documentDirectory: "file:///documents/",
  cacheDirectory: "file:///cache/",
  EncodingType: { UTF8: "utf8", Base64: "base64" },
  FileSystemUploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1024 })),
  readAsStringAsync: jest.fn(() => Promise.resolve("base64data")),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  createUploadTask: jest.fn(() => ({
    uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: "{}" })),
    cancelAsync: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-crypto", () => ({
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: {
    MD5: "MD5",
    SHA256: "SHA-256",
  },
  CryptoEncoding: {
    BASE64: "base64",
  },
}));

jest.mock("../../services/api", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe("PresignedUploadService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // ===========================================================================
  // VALIDATION TESTS
  // ===========================================================================

  describe("validateFile", () => {
    it("should accept valid image file", () => {
      const result = validateFile("photo.jpg", "image/jpeg", 5 * 1024 * 1024);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid video file", () => {
      const result = validateFile("video.mp4", "video/mp4", 100 * 1024 * 1024);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid PDF file", () => {
      const result = validateFile(
        "document.pdf",
        "application/pdf",
        10 * 1024 * 1024,
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject unsupported content type", () => {
      const result = validateFile("file.txt", "text/plain", 1024);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Loại file không được hỗ trợ: text/plain",
      );
    });

    it("should reject file exceeding image size limit (20MB)", () => {
      const result = validateFile(
        "big-image.jpg",
        "image/jpeg",
        25 * 1024 * 1024,
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("File quá lớn"))).toBe(true);
    });

    it("should reject file exceeding video size limit (500MB)", () => {
      const result = validateFile(
        "big-video.mp4",
        "video/mp4",
        600 * 1024 * 1024,
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("File quá lớn"))).toBe(true);
    });

    it("should reject empty file", () => {
      const result = validateFile("empty.jpg", "image/jpeg", 0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("File rỗng.");
    });

    it("should reject dangerous file extensions", () => {
      const result = validateFile(
        "script.exe",
        "application/octet-stream",
        1024,
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Loại file không được phép.");
    });

    it("should reject .bat files", () => {
      const result = validateFile(
        "script.bat",
        "application/octet-stream",
        1024,
      );
      expect(result.valid).toBe(false);
    });

    it("should reject filename over 255 chars", () => {
      const longName = "a".repeat(256) + ".jpg";
      const result = validateFile(longName, "image/jpeg", 1024);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Tên file không hợp lệ.");
    });
  });

  // ===========================================================================
  // CHECKSUM TESTS
  // ===========================================================================

  describe("calculateChecksum", () => {
    it("should calculate SHA256 checksum", async () => {
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        "base64content",
      );
      (Crypto.digestStringAsync as jest.Mock).mockResolvedValue("abc123hash");

      const result = await calculateChecksum("file:///test.jpg", "sha256");

      expect(result).toBe("abc123hash");
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
        "file:///test.jpg",
        {
          encoding: "base64",
        },
      );
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        "SHA-256",
        "base64content",
        expect.any(Object),
      );
    });

    it("should calculate MD5 checksum", async () => {
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        "base64content",
      );
      (Crypto.digestStringAsync as jest.Mock).mockResolvedValue("md5hash");

      const result = await calculateChecksum("file:///test.jpg", "md5");

      expect(result).toBe("md5hash");
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        "MD5",
        "base64content",
        expect.any(Object),
      );
    });

    it("should throw on read error", async () => {
      (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(
        new Error("Read failed"),
      );

      await expect(calculateChecksum("file:///test.jpg")).rejects.toThrow(
        "Không thể tính checksum file",
      );
    });
  });

  // ===========================================================================
  // PRESIGNED URL TESTS
  // ===========================================================================

  describe("getPresignedUrl", () => {
    it("should request presigned URL from server", async () => {
      (post as jest.Mock).mockResolvedValue({
        uploadId: "upload-123",
        uploadUrl: "https://s3.example.com/presigned",
        expiresAt: Date.now() + 3600000,
        maxFileSize: 20 * 1024 * 1024,
      });

      const result = await PresignedUploadService.getPresignedUrl({
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024 * 1024,
      });

      expect(result.uploadId).toBe("upload-123");
      expect(result.uploadUrl).toBe("https://s3.example.com/presigned");
      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/presign",
        expect.objectContaining({
          filename: "photo.jpg",
          contentType: "image/jpeg",
          fileSize: 1024 * 1024,
        }),
      );
    });

    it("should throw validation error for invalid file", async () => {
      await expect(
        PresignedUploadService.getPresignedUrl({
          filename: "script.exe",
          contentType: "application/octet-stream",
          fileSize: 1024,
        }),
      ).rejects.toThrow();
    });

    it("should include context in request", async () => {
      (post as jest.Mock).mockResolvedValue({
        uploadId: "upload-123",
        uploadUrl: "https://s3.example.com/presigned",
        expiresAt: Date.now() + 3600000,
        maxFileSize: 20 * 1024 * 1024,
      });

      await PresignedUploadService.getPresignedUrl({
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024 * 1024,
        context: { type: "project", id: "proj-123" },
      });

      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/presign",
        expect.objectContaining({
          context: { type: "project", id: "proj-123" },
        }),
      );
    });

    it("should include checksum in request", async () => {
      (post as jest.Mock).mockResolvedValue({
        uploadId: "upload-123",
        uploadUrl: "https://s3.example.com/presigned",
        expiresAt: Date.now() + 3600000,
        maxFileSize: 20 * 1024 * 1024,
      });

      await PresignedUploadService.getPresignedUrl({
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024 * 1024,
        checksum: "sha256hash",
        checksumAlgorithm: "sha256",
      });

      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/presign",
        expect.objectContaining({
          checksum: "sha256hash",
          checksumAlgorithm: "sha256",
        }),
      );
    });
  });

  // ===========================================================================
  // RATE LIMITING TESTS
  // ===========================================================================

  describe("rate limiting", () => {
    it("should allow upload within rate limit", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ timestamps: [Date.now() - 10000] }),
      );
      (post as jest.Mock).mockResolvedValue({
        uploadId: "upload-123",
        uploadUrl: "https://s3.example.com/presigned",
        expiresAt: Date.now() + 3600000,
        maxFileSize: 20 * 1024 * 1024,
      });

      const result = await PresignedUploadService.getPresignedUrl({
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024 * 1024,
      });

      expect(result.uploadId).toBe("upload-123");
    });

    it("should reject upload exceeding rate limit", async () => {
      // 10 uploads in last minute
      const timestamps = Array(10)
        .fill(0)
        .map((_, i) => Date.now() - i * 1000);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ timestamps }),
      );

      await expect(
        PresignedUploadService.getPresignedUrl({
          filename: "photo.jpg",
          contentType: "image/jpeg",
          fileSize: 1024 * 1024,
        }),
      ).rejects.toThrow(/Quá nhiều upload/);
    });

    it("should allow after rate limit window expires", async () => {
      // 10 uploads more than 1 minute ago
      const timestamps = Array(10)
        .fill(0)
        .map(() => Date.now() - 65000);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ timestamps }),
      );
      (post as jest.Mock).mockResolvedValue({
        uploadId: "upload-123",
        uploadUrl: "https://s3.example.com/presigned",
        expiresAt: Date.now() + 3600000,
        maxFileSize: 20 * 1024 * 1024,
      });

      const result = await PresignedUploadService.getPresignedUrl({
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024 * 1024,
      });

      expect(result.uploadId).toBe("upload-123");
    });
  });

  // ===========================================================================
  // UPLOAD FILE TESTS
  // ===========================================================================

  describe("uploadFile", () => {
    const mockPresignResponse = {
      uploadId: "upload-123",
      uploadUrl: "https://s3.example.com/presigned",
      headers: { "Content-Type": "image/jpeg" },
      expiresAt: Date.now() + 3600000,
      maxFileSize: 20 * 1024 * 1024,
    };

    it("should upload file with progress tracking", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 1024,
      });

      let progressCallback:
        | ((progress: {
            totalBytesSent: number;
            totalBytesExpectedToSend: number;
          }) => void)
        | undefined;
      const mockUploadAsync = jest.fn().mockResolvedValue({ status: 200 });
      const mockCancelAsync = jest.fn();

      (FileSystem.createUploadTask as jest.Mock).mockImplementation(
        (_, __, ___, cb) => {
          progressCallback = cb;
          return {
            uploadAsync: mockUploadAsync,
            cancelAsync: mockCancelAsync,
          };
        },
      );

      const onProgress = jest.fn();
      const uploadPromise = PresignedUploadService.uploadFile(
        "file:///test.jpg",
        mockPresignResponse,
        onProgress,
      );

      // Simulate progress
      setTimeout(() => {
        progressCallback?.({
          totalBytesSent: 512,
          totalBytesExpectedToSend: 1024,
        });
        progressCallback?.({
          totalBytesSent: 1024,
          totalBytesExpectedToSend: 1024,
        });
      }, 10);

      const result = await uploadPromise;

      expect(result).toBe("upload-123");
      expect(FileSystem.createUploadTask).toHaveBeenCalledWith(
        "https://s3.example.com/presigned",
        "file:///test.jpg",
        expect.objectContaining({
          httpMethod: "PUT",
          headers: { "Content-Type": "image/jpeg" },
        }),
        expect.any(Function),
      );
    });

    it("should reject on upload failure", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 1024,
      });
      (FileSystem.createUploadTask as jest.Mock).mockReturnValue({
        uploadAsync: jest.fn().mockResolvedValue({ status: 500 }),
        cancelAsync: jest.fn(),
      });

      await expect(
        PresignedUploadService.uploadFile(
          "file:///test.jpg",
          mockPresignResponse,
        ),
      ).rejects.toThrow("Upload failed: 500");
    });
  });

  // ===========================================================================
  // COMPLETE UPLOAD TESTS
  // ===========================================================================

  describe("completeUpload", () => {
    it("should complete upload and save to history", async () => {
      const mockResponse = {
        fileId: "file-123",
        fileUrl: "https://cdn.example.com/file.jpg",
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024,
        createdAt: new Date().toISOString(),
      };
      (post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await PresignedUploadService.completeUpload({
        uploadId: "upload-123",
        checksum: "sha256hash",
        checksumAlgorithm: "sha256",
      });

      expect(result).toEqual(mockResponse);
      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/complete",
        expect.objectContaining({
          uploadId: "upload-123",
          checksum: "sha256hash",
        }),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should include metadata in complete request", async () => {
      (post as jest.Mock).mockResolvedValue({
        fileId: "file-123",
        fileUrl: "https://cdn.example.com/file.jpg",
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024,
        createdAt: new Date().toISOString(),
      });

      await PresignedUploadService.completeUpload({
        uploadId: "upload-123",
        checksum: "sha256hash",
        checksumAlgorithm: "sha256",
        metadata: { projectId: "proj-123", tags: ["construction"] },
      });

      expect(post).toHaveBeenCalledWith(
        "/api/v1/upload/complete",
        expect.objectContaining({
          metadata: { projectId: "proj-123", tags: ["construction"] },
        }),
      );
    });
  });

  // ===========================================================================
  // HISTORY TESTS
  // ===========================================================================

  describe("upload history", () => {
    it("should get upload history", async () => {
      const mockHistory = [
        {
          fileId: "file-1",
          fileUrl: "https://cdn.example.com/file1.jpg",
          filename: "photo1.jpg",
          contentType: "image/jpeg",
          fileSize: 1024,
          createdAt: new Date().toISOString(),
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory),
      );

      const result = await PresignedUploadService.getHistory();

      expect(result).toEqual(mockHistory);
    });

    it("should return empty array when no history", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await PresignedUploadService.getHistory();

      expect(result).toEqual([]);
    });

    it("should clear history", async () => {
      await PresignedUploadService.clearHistory();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "@presigned_upload_history",
      );
    });
  });

  // ===========================================================================
  // CANCEL UPLOAD TESTS
  // ===========================================================================

  describe("cancelUpload", () => {
    it("should cancel active upload", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 1024,
      });

      const mockCancelAsync = jest.fn();
      let resolveUpload: () => void;
      const uploadPromise = new Promise<{ status: number }>((resolve) => {
        resolveUpload = () => resolve({ status: 200 });
      });

      (FileSystem.createUploadTask as jest.Mock).mockReturnValue({
        uploadAsync: jest.fn().mockReturnValue(uploadPromise),
        cancelAsync: mockCancelAsync,
      });

      const mockPresignResponse = {
        uploadId: "upload-cancel-test",
        uploadUrl: "https://s3.example.com/presigned",
        headers: {},
        expiresAt: Date.now() + 3600000,
        maxFileSize: 20 * 1024 * 1024,
      };

      const uploadTask = PresignedUploadService.uploadFile(
        "file:///test.jpg",
        mockPresignResponse,
      );

      // Wait a tick for the upload to start
      await new Promise((r) => setTimeout(r, 10));

      // Cancel the upload
      PresignedUploadService.cancelUpload("upload-cancel-test");

      expect(mockCancelAsync).toHaveBeenCalled();

      // Cleanup - resolve promise to avoid hanging test
      resolveUpload!();
      await uploadTask.catch(() => {});
    });
  });
});
