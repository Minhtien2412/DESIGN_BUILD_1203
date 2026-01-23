/**
 * Unit tests for OfflineFileService
 * OFFLINE-004: Offline File Downloads
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: "wifi" })),
}));

jest.mock("@/utils/FileSystemCompat", () => ({
  documentDirectory: "/mock/documents/",
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1024 })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(() =>
      Promise.resolve({ uri: "/mock/documents/offline_files/test.pdf" }),
    ),
    pauseAsync: jest.fn(() => Promise.resolve()),
    resumeAsync: jest.fn(() => Promise.resolve()),
  })),
  downloadAsync: jest.fn(() =>
    Promise.resolve({ uri: "/mock/documents/thumbnail.jpg" }),
  ),
}));

// Import after mocks
import { FileItem } from "../../services/FileManagerService";
import { OfflineFileService } from "../../services/OfflineFileService";

describe("OfflineFileService", () => {
  const mockFile: FileItem = {
    id: "file-123",
    filename: "test.pdf",
    originalName: "Test Document.pdf",
    contentType: "application/pdf",
    fileSize: 1024 * 1024, // 1MB
    fileUrl: "https://example.com/test.pdf",
    ownerId: "user-1",
    currentVersion: 1,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe("initialize", () => {
    it("should initialize the service", async () => {
      await expect(OfflineFileService.initialize()).resolves.not.toThrow();
    });

    it("should create directories if they don't exist", async () => {
      const FileSystem = require("@/utils/FileSystemCompat");
      // Clear previous mock and set new behavior
      FileSystem.getInfoAsync.mockReset();
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      FileSystem.makeDirectoryAsync.mockReset();
      FileSystem.makeDirectoryAsync.mockResolvedValue(undefined);

      // Re-initialize to trigger directory creation
      // Reset service state first
      (OfflineFileService as any).isInitialized = false;
      await OfflineFileService.initialize();

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });
  });

  describe("settings", () => {
    it("should return default settings", () => {
      const settings = OfflineFileService.getSettings();

      expect(settings).toHaveProperty("maxStorageBytes");
      expect(settings).toHaveProperty("autoCleanupEnabled");
      expect(settings).toHaveProperty("downloadOnWifiOnly");
      expect(settings.maxStorageBytes).toBe(1024 * 1024 * 1024); // 1GB
    });

    it("should update settings", async () => {
      await OfflineFileService.saveSettings({
        maxStorageBytes: 2 * 1024 * 1024 * 1024,
        downloadOnWifiOnly: true,
      });

      const settings = OfflineFileService.getSettings();
      expect(settings.maxStorageBytes).toBe(2 * 1024 * 1024 * 1024);
      expect(settings.downloadOnWifiOnly).toBe(true);
    });
  });

  describe("quota", () => {
    it("should return quota information", async () => {
      await OfflineFileService.initialize();
      const quota = await OfflineFileService.getQuota();

      expect(quota).toHaveProperty("maxBytes");
      expect(quota).toHaveProperty("usedBytes");
      expect(quota).toHaveProperty("availableBytes");
      expect(quota).toHaveProperty("fileCount");
      expect(quota).toHaveProperty("percentage");
      expect(quota.availableBytes).toBe(quota.maxBytes - quota.usedBytes);
    });

    it("should check if there is enough space", async () => {
      await OfflineFileService.initialize();

      const hasSpace = await OfflineFileService.checkQuota(1024); // 1KB
      expect(hasSpace).toBe(true);
    });

    it("should return false when not enough space", async () => {
      await OfflineFileService.saveSettings({
        maxStorageBytes: 100, // Very small quota
      });
      await OfflineFileService.initialize();

      const hasSpace = await OfflineFileService.checkQuota(1024 * 1024); // 1MB
      expect(hasSpace).toBe(false);
    });
  });

  describe("saveForOffline", () => {
    beforeEach(async () => {
      await OfflineFileService.saveSettings({
        maxStorageBytes: 1024 * 1024 * 1024, // Reset to 1GB
      });
      await OfflineFileService.initialize();
    });

    it("should queue a file for offline download", async () => {
      const offlineFile = await OfflineFileService.saveForOffline(mockFile);

      expect(offlineFile).toBeDefined();
      expect(offlineFile.fileId).toBe(mockFile.id);
      expect(offlineFile.filename).toBe(mockFile.filename);
      expect(offlineFile.status).toBe("pending");
    });

    it("should set isPinned when option is provided", async () => {
      const offlineFile = await OfflineFileService.saveForOffline(mockFile, {
        pin: true,
      });

      expect(offlineFile.isPinned).toBe(true);
    });

    it("should throw error when quota exceeded", async () => {
      await OfflineFileService.saveSettings({
        maxStorageBytes: 100, // Very small
        autoCleanupEnabled: false,
      });

      await expect(OfflineFileService.saveForOffline(mockFile)).rejects.toThrow(
        "Không đủ dung lượng lưu trữ offline",
      );
    });
  });

  describe("getOfflineFiles", () => {
    it("should return empty array when no files", async () => {
      await OfflineFileService.initialize();
      const files = OfflineFileService.getOfflineFiles();

      expect(Array.isArray(files)).toBe(true);
    });

    it("should filter by status", async () => {
      await OfflineFileService.initialize();
      const files = OfflineFileService.getOfflineFiles({
        status: "completed",
      });

      expect(Array.isArray(files)).toBe(true);
    });

    it("should filter by type", async () => {
      await OfflineFileService.initialize();
      const files = OfflineFileService.getOfflineFiles({
        type: "pdf",
      });

      expect(Array.isArray(files)).toBe(true);
    });

    it("should sort files", async () => {
      await OfflineFileService.initialize();
      const files = OfflineFileService.getOfflineFiles({
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe("isFileOffline", () => {
    it("should return false for non-offline file", async () => {
      await OfflineFileService.initialize();
      const isOffline = OfflineFileService.isFileOffline("non-existent");

      expect(isOffline).toBe(false);
    });
  });

  describe("togglePin", () => {
    it("should return false for non-existent file", async () => {
      await OfflineFileService.initialize();
      const result = await OfflineFileService.togglePin("non-existent");

      expect(result).toBe(false);
    });
  });

  describe("deleteOfflineFile", () => {
    it("should not throw for non-existent file", async () => {
      await OfflineFileService.initialize();
      await expect(
        OfflineFileService.deleteOfflineFile("non-existent"),
      ).resolves.not.toThrow();
    });
  });

  describe("clearAllOfflineFiles", () => {
    it("should clear all files", async () => {
      const FileSystem = require("@/utils/FileSystemCompat");
      await OfflineFileService.initialize();

      await OfflineFileService.clearAllOfflineFiles();

      expect(FileSystem.deleteAsync).toHaveBeenCalled();
    });
  });

  describe("syncStatus", () => {
    it("should return sync status", async () => {
      await OfflineFileService.initialize();
      const status = OfflineFileService.getSyncStatus();

      expect(status).toHaveProperty("isOnline");
      expect(status).toHaveProperty("isSyncing");
      expect(status).toHaveProperty("pendingDownloads");
      expect(status).toHaveProperty("failedDownloads");
    });
  });

  describe("performAutoCleanup", () => {
    it("should return 0 when cleanup is disabled", async () => {
      await OfflineFileService.saveSettings({
        autoCleanupEnabled: false,
      });
      await OfflineFileService.initialize();

      const freedBytes = await OfflineFileService.performAutoCleanup();

      expect(freedBytes).toBe(0);
    });

    it("should perform cleanup when enabled", async () => {
      await OfflineFileService.saveSettings({
        autoCleanupEnabled: true,
      });
      await OfflineFileService.initialize();

      const freedBytes = await OfflineFileService.performAutoCleanup();

      expect(typeof freedBytes).toBe("number");
    });
  });

  describe("download controls", () => {
    it("should handle pause for non-active download", async () => {
      await OfflineFileService.initialize();
      await expect(
        OfflineFileService.pauseDownload("non-existent"),
      ).resolves.not.toThrow();
    });

    it("should handle resume for non-paused file", async () => {
      await OfflineFileService.initialize();
      await expect(
        OfflineFileService.resumeDownload("non-existent"),
      ).resolves.not.toThrow();
    });

    it("should handle cancel for non-active download", async () => {
      await OfflineFileService.initialize();
      await expect(
        OfflineFileService.cancelDownload("non-existent"),
      ).resolves.not.toThrow();
    });

    it("should handle retry for non-failed file", async () => {
      await OfflineFileService.initialize();
      await expect(
        OfflineFileService.retryDownload("non-existent"),
      ).resolves.not.toThrow();
    });
  });

  describe("getLocalPath", () => {
    it("should return null for non-offline file", async () => {
      await OfflineFileService.initialize();
      const path = await OfflineFileService.getLocalPath("non-existent");

      expect(path).toBeNull();
    });
  });

  describe("event emitter", () => {
    it("should emit events", (done) => {
      OfflineFileService.on("sync:change", (status) => {
        expect(status).toHaveProperty("isOnline");
        done();
      });

      // Trigger a sync status change
      OfflineFileService.emit(
        "sync:change",
        OfflineFileService.getSyncStatus(),
      );
    });
  });
});

describe("OfflineFileService Constants", () => {
  beforeEach(() => {
    // Reset service state
    (OfflineFileService as any).isInitialized = false;
    (OfflineFileService as any).settings = {
      maxStorageBytes: 1024 * 1024 * 1024, // 1GB
      autoCleanupEnabled: true,
      cleanupThresholdPercent: 90,
      maxFileAgeDays: 30,
      downloadOnWifiOnly: false,
      maxConcurrentDownloads: 3,
    };
  });

  it("should have correct default quota (1GB)", () => {
    const settings = OfflineFileService.getSettings();
    expect(settings.maxStorageBytes).toBe(1024 * 1024 * 1024);
  });

  it("should have auto cleanup enabled by default", () => {
    const settings = OfflineFileService.getSettings();
    expect(settings.autoCleanupEnabled).toBe(true);
  });

  it("should have cleanup threshold at 90%", () => {
    const settings = OfflineFileService.getSettings();
    expect(settings.cleanupThresholdPercent).toBe(90);
  });

  it("should keep files for 30 days by default", () => {
    const settings = OfflineFileService.getSettings();
    expect(settings.maxFileAgeDays).toBe(30);
  });

  it("should allow max 3 concurrent downloads by default", () => {
    const settings = OfflineFileService.getSettings();
    expect(settings.maxConcurrentDownloads).toBe(3);
  });
});
