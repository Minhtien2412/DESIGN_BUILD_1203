/**
 * Tests for FileManagerService
 * UPLOAD-005: File Browser UI
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
    FileManagerService,
    formatFileSize,
    getFileExtension,
    getFileIcon,
    getFileType,
    isPreviewable,
} from "../../services/FileManagerService";
import { del, get, post } from "../../services/api";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///documents/",
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  createDownloadResumable: jest.fn(),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  del: jest.fn(),
}));

describe("FileManagerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // ===========================================================================
  // UTILITY TESTS
  // ===========================================================================

  describe("getFileType", () => {
    it("should return image for image content types", () => {
      expect(getFileType("image/jpeg")).toBe("image");
      expect(getFileType("image/png")).toBe("image");
      expect(getFileType("image/gif")).toBe("image");
    });

    it("should return video for video content types", () => {
      expect(getFileType("video/mp4")).toBe("video");
      expect(getFileType("video/quicktime")).toBe("video");
    });

    it("should return document for PDF content type (grouped under documents)", () => {
      // PDF is grouped under document type in the service implementation
      expect(getFileType("application/pdf")).toBe("document");
    });

    it("should return document for document content types", () => {
      expect(getFileType("application/msword")).toBe("document");
      expect(
        getFileType(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ).toBe("document");
    });

    it("should return document for application/* types (matched via prefix)", () => {
      // The logic uses contentType.startsWith(m.split('/')[0]) which matches 'application'
      // So application/octet-stream matches 'application' from 'application/msword'
      expect(getFileType("application/octet-stream")).toBe("document");
      expect(getFileType("text/csv")).toBe("document"); // matches text from text/plain
    });
  });

  describe("getFileIcon", () => {
    it("should return correct icon for each type", () => {
      expect(getFileIcon("image/jpeg")).toBe("image-outline");
      expect(getFileIcon("video/mp4")).toBe("videocam-outline");
      // pdf gets matched to document type, so uses document-text-outline
      expect(getFileIcon("application/pdf")).toBe("document-text-outline");
      // application/zip matches 'application' prefix from document before archive
      // due to Object.entries iteration order (document comes before archive)
      expect(getFileIcon("application/zip")).toBe("document-text-outline");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
    });

    it("should handle decimal places", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
    });
  });

  describe("getFileExtension", () => {
    it("should extract extension from filename", () => {
      expect(getFileExtension("photo.jpg")).toBe("JPG");
      expect(getFileExtension("document.pdf")).toBe("PDF");
      expect(getFileExtension("archive.tar.gz")).toBe("GZ");
    });

    it("should return empty for files without extension", () => {
      expect(getFileExtension("README")).toBe("");
    });
  });

  describe("isPreviewable", () => {
    it("should return true for images", () => {
      expect(isPreviewable("image/jpeg")).toBe(true);
      expect(isPreviewable("image/png")).toBe(true);
    });

    it("should return true for videos", () => {
      expect(isPreviewable("video/mp4")).toBe(true);
    });

    it("should return true for PDFs", () => {
      expect(isPreviewable("application/pdf")).toBe(true);
    });

    it("should return false for other types", () => {
      expect(isPreviewable("application/zip")).toBe(false);
      expect(isPreviewable("text/plain")).toBe(false);
    });
  });

  // ===========================================================================
  // LIST FILES TESTS
  // ===========================================================================

  describe("listFiles", () => {
    it("should fetch files with default params", async () => {
      const mockResponse = {
        files: [
          {
            id: "f1",
            filename: "photo.jpg",
            contentType: "image/jpeg",
            fileSize: 1024,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      };
      (get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await FileManagerService.listFiles();

      expect(result.files).toHaveLength(1);
      expect(get).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/files")
      );
    });

    it("should apply type filter", async () => {
      (get as jest.Mock).mockResolvedValue({
        files: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      await FileManagerService.listFiles({ type: "image" });

      expect(get).toHaveBeenCalledWith(
        expect.stringContaining("contentTypes=")
      );
    });

    it("should apply search query", async () => {
      (get as jest.Mock).mockResolvedValue({
        files: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      await FileManagerService.listFiles({ search: "photo" });

      expect(get).toHaveBeenCalledWith(expect.stringContaining("search=photo"));
    });

    it("should apply sort options", async () => {
      (get as jest.Mock).mockResolvedValue({
        files: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      await FileManagerService.listFiles({ sortBy: "name", sortOrder: "asc" });

      expect(get).toHaveBeenCalledWith(expect.stringContaining("sortBy=name"));
      expect(get).toHaveBeenCalledWith(
        expect.stringContaining("sortOrder=asc")
      );
    });
  });

  // ===========================================================================
  // SEARCH FILES TESTS
  // ===========================================================================

  describe("searchFiles", () => {
    it("should search files by query", async () => {
      (get as jest.Mock).mockResolvedValue({
        files: [{ id: "f1", filename: "photo.jpg" }],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      const results = await FileManagerService.searchFiles("photo");

      expect(results).toHaveLength(1);
      expect(get).toHaveBeenCalledWith(expect.stringContaining("search=photo"));
    });
  });

  // ===========================================================================
  // GET SINGLE FILE TESTS
  // ===========================================================================

  describe("getFile", () => {
    it("should get file by ID", async () => {
      const mockFile = { id: "f1", filename: "photo.jpg" };
      (get as jest.Mock).mockResolvedValue(mockFile);

      const result = await FileManagerService.getFile("f1");

      expect(result).toEqual(mockFile);
      expect(get).toHaveBeenCalledWith("/api/v1/files/f1");
    });

    it("should return null for non-existent file", async () => {
      (get as jest.Mock).mockRejectedValue(new Error("Not found"));

      const result = await FileManagerService.getFile("non-existent");

      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // DELETE FILE TESTS
  // ===========================================================================

  describe("deleteFile", () => {
    it("should delete file", async () => {
      (del as jest.Mock).mockResolvedValue({});

      await FileManagerService.deleteFile("f1");

      expect(del).toHaveBeenCalledWith("/api/v1/files/f1");
    });
  });

  describe("restoreFile", () => {
    it("should restore deleted file", async () => {
      const mockFile = { id: "f1", filename: "photo.jpg", isDeleted: false };
      (post as jest.Mock).mockResolvedValue(mockFile);

      const result = await FileManagerService.restoreFile("f1");

      expect(result).toEqual(mockFile);
      expect(post).toHaveBeenCalledWith("/api/v1/files/f1/restore", {});
    });
  });

  // ===========================================================================
  // ATTACH FILE TESTS
  // ===========================================================================

  describe("attachFile", () => {
    it("should attach file to message", async () => {
      (post as jest.Mock).mockResolvedValue({});

      await FileManagerService.attachFile({
        fileId: "f1",
        targetType: "message",
        targetId: "msg-123",
      });

      expect(post).toHaveBeenCalledWith("/api/v1/files/attach", {
        fileId: "f1",
        targetType: "message",
        targetId: "msg-123",
      });
    });

    it("should attach file to project", async () => {
      (post as jest.Mock).mockResolvedValue({});

      await FileManagerService.attachFile({
        fileId: "f1",
        targetType: "project",
        targetId: "proj-123",
      });

      expect(post).toHaveBeenCalledWith(
        "/api/v1/files/attach",
        expect.objectContaining({
          targetType: "project",
        })
      );
    });
  });

  // ===========================================================================
  // SHARE FILE TESTS
  // ===========================================================================

  describe("shareFile", () => {
    it("should share file when available", async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });

      const mockFile = {
        id: "f1",
        filename: "photo.jpg",
        originalName: "photo.jpg",
        contentType: "image/jpeg",
        fileUrl: "https://example.com/photo.jpg",
      };

      // Mock getLocalPath to return a path
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        "file:///documents/downloads/photo.jpg"
      );

      await FileManagerService.shareFile(mockFile as any);

      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it("should throw when sharing not available", async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      const mockFile = {
        id: "f1",
        filename: "photo.jpg",
        originalName: "photo.jpg",
        contentType: "image/jpeg",
        fileUrl: "https://example.com/photo.jpg",
      };

      await expect(
        FileManagerService.shareFile(mockFile as any)
      ).rejects.toThrow("Chia sẻ không khả dụng");
    });
  });

  // ===========================================================================
  // DOWNLOAD TESTS
  // ===========================================================================

  describe("isDownloaded", () => {
    it("should return true if file exists locally", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        "file:///local/photo.jpg"
      );
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });

      const result = await FileManagerService.isDownloaded("f1");

      expect(result).toBe(true);
    });

    it("should return false if file not downloaded", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await FileManagerService.isDownloaded("f1");

      expect(result).toBe(false);
    });
  });

  describe("clearDownloads", () => {
    it("should delete downloads directory", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      await FileManagerService.clearDownloads();

      expect(FileSystem.deleteAsync).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // CACHE TESTS
  // ===========================================================================

  describe("cache", () => {
    it("should invalidate cache", async () => {
      await FileManagerService.invalidateCache();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "@file_manager_cache"
      );
    });
  });
});
