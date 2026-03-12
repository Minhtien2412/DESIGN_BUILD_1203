/**
 * DocumentScanService.test.ts
 *
 * Tests for document scanning service
 * Story: CAM-002
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
// FileSystemCompat is mocked via moduleNameMapper in jest.config.js
import * as FileSystem from "@/utils/FileSystemCompat";
import * as ImageManipulator from "expo-image-manipulator";
import * as Sharing from "expo-sharing";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
  },
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock("../../services/CameraService", () => ({
  CameraService: {},
  checkCameraPermissions: jest.fn(),
  requestAllPermissions: jest.fn(),
}));

import {
    // Constants
    DEFAULT_ENHANCEMENTS,
    DEFAULT_PDF_OPTIONS,
    // Types
    DocumentCorners,
    ImageEnhancements,
    PAGE_SIZES,
    SCAN_QUALITY_PRESETS,
    ScanSession,
    ScannedPage,
    // Page Management
    addPageToSession,
    applyEnhancements,
    // Image Processing
    applyPerspectiveCorrection,
    autoCropDocument,
    calculateAspectRatio,
    // Session Management
    createScanSession,
    deleteScanSession,
    // Edge Detection
    detectDocumentEdges,
    exportAsImages,
    // Export
    exportAsPDF,
    formatFileSize,
    formatSessionDate,
    generateThumbnail,
    getAllSessions,
    getCurrentSession,
    // Utilities
    getSessionStats,
    isA4AspectRatio,
    reorderPages,
    saveScanSession,
    shareDocument,
    validateCorners,
} from "../../services/DocumentScanService";

describe("DocumentScanService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: "file:///processed.jpg",
    });

    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      size: 500000,
      exists: true,
    });

    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  // ===========================================================================
  // Edge Detection
  // ===========================================================================

  describe("detectDocumentEdges", () => {
    it("should return corners with confidence", () => {
      const result = detectDocumentEdges({ width: 3000, height: 4000 });

      expect(result.success).toBe(true);
      expect(result.corners).not.toBeNull();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.imageWidth).toBe(3000);
      expect(result.imageHeight).toBe(4000);
    });

    it("should return default corners with margin", () => {
      const result = detectDocumentEdges({ width: 1000, height: 1000 });

      // 5% margin on 1000 = 50
      expect(result.corners?.topLeft.x).toBe(50);
      expect(result.corners?.topLeft.y).toBe(50);
      expect(result.corners?.bottomRight.x).toBe(950);
      expect(result.corners?.bottomRight.y).toBe(950);
    });
  });

  describe("validateCorners", () => {
    it("should validate correct corners", () => {
      const corners: DocumentCorners = {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 100, y: 0 },
        bottomRight: { x: 100, y: 100 },
        bottomLeft: { x: 0, y: 100 },
      };

      expect(validateCorners(corners)).toBe(true);
    });

    it("should reject invalid corners (negative)", () => {
      const corners: DocumentCorners = {
        topLeft: { x: -10, y: 0 },
        topRight: { x: 100, y: 0 },
        bottomRight: { x: 100, y: 100 },
        bottomLeft: { x: 0, y: 100 },
      };

      expect(validateCorners(corners)).toBe(false);
    });

    it("should reject non-convex quadrilateral", () => {
      const corners: DocumentCorners = {
        topLeft: { x: 100, y: 0 }, // topLeft is right of topRight
        topRight: { x: 0, y: 0 },
        bottomRight: { x: 100, y: 100 },
        bottomLeft: { x: 0, y: 100 },
      };

      expect(validateCorners(corners)).toBe(false);
    });
  });

  describe("calculateAspectRatio", () => {
    it("should calculate correct aspect ratio", () => {
      const corners: DocumentCorners = {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 210, y: 0 },
        bottomRight: { x: 210, y: 297 },
        bottomLeft: { x: 0, y: 297 },
      };

      const ratio = calculateAspectRatio(corners);
      expect(ratio).toBeCloseTo(210 / 297, 2);
    });
  });

  describe("isA4AspectRatio", () => {
    it("should detect A4 ratio", () => {
      const a4Ratio = 210 / 297;
      expect(isA4AspectRatio(a4Ratio)).toBe(true);
    });

    it("should reject non-A4 ratio", () => {
      expect(isA4AspectRatio(1.0)).toBe(false); // Square
      expect(isA4AspectRatio(16 / 9)).toBe(false); // Widescreen
    });
  });

  // ===========================================================================
  // Image Processing
  // ===========================================================================

  describe("applyPerspectiveCorrection", () => {
    it("should apply crop and resize", async () => {
      const corners: DocumentCorners = {
        topLeft: { x: 100, y: 100 },
        topRight: { x: 900, y: 100 },
        bottomRight: { x: 900, y: 1200 },
        bottomLeft: { x: 100, y: 1200 },
      };

      const result = await applyPerspectiveCorrection(
        "file:///original.jpg",
        corners,
      );

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
      expect(result).toBe("file:///processed.jpg");
    });
  });

  describe("autoCropDocument", () => {
    it("should auto-crop with detected edges", async () => {
      const result = await autoCropDocument("file:///original.jpg");

      expect(result.uri).toBeDefined();
      expect(result.corners).toBeDefined();
    });
  });

  describe("applyEnhancements", () => {
    it("should apply enhancements", async () => {
      const enhancements: ImageEnhancements = {
        brightness: 0.1,
        contrast: 1.2,
        saturation: 1,
        sharpen: true,
        grayscale: false,
        autoEnhance: true,
      };

      const result = await applyEnhancements("file:///input.jpg", enhancements);

      expect(result).toBe("file:///processed.jpg");
    });

    it("should return original on error", async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValueOnce(
        new Error("Processing failed"),
      );

      const result = await applyEnhancements(
        "file:///input.jpg",
        DEFAULT_ENHANCEMENTS,
      );

      expect(result).toBe("file:///input.jpg");
    });
  });

  describe("generateThumbnail", () => {
    it("should generate thumbnail with max size", async () => {
      const result = await generateThumbnail("file:///input.jpg", 200);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        "file:///input.jpg",
        [{ resize: { width: 200 } }],
        expect.any(Object),
      );
      expect(result).toBe("file:///processed.jpg");
    });
  });

  // ===========================================================================
  // Session Management
  // ===========================================================================

  describe("createScanSession", () => {
    it("should create new session with default name", async () => {
      const session = await createScanSession();

      expect(session.id).toBeDefined();
      expect(session.name).toContain("Tài liệu");
      expect(session.pages).toEqual([]);
      expect(session.status).toBe("active");

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should create session with custom name", async () => {
      const session = await createScanSession("Hợp đồng ABC");

      expect(session.name).toBe("Hợp đồng ABC");
    });
  });

  describe("getAllSessions", () => {
    it("should return empty array when no sessions", async () => {
      const sessions = await getAllSessions();
      expect(sessions).toEqual([]);
    });

    it("should return stored sessions", async () => {
      const mockSessions: ScanSession[] = [
        {
          id: "session-1",
          name: "Test Session",
          pages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active",
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockSessions),
      );

      const sessions = await getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe("session-1");
    });
  });

  describe("getCurrentSession", () => {
    it("should return null when no current session", async () => {
      const session = await getCurrentSession();
      expect(session).toBeNull();
    });

    it("should return current session", async () => {
      const mockSessions: ScanSession[] = [
        {
          id: "session-1",
          name: "Test Session",
          pages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active",
        },
      ];

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("session-1") // Current session ID
        .mockResolvedValueOnce(JSON.stringify(mockSessions)); // All sessions

      const session = await getCurrentSession();
      expect(session?.id).toBe("session-1");
    });
  });

  describe("saveScanSession", () => {
    it("should save new session", async () => {
      const session: ScanSession = {
        id: "new-session",
        name: "New Session",
        pages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      };

      await saveScanSession(session);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should update existing session", async () => {
      const existingSessions: ScanSession[] = [
        {
          id: "session-1",
          name: "Old Name",
          pages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active",
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(existingSessions),
      );

      const updatedSession: ScanSession = {
        ...existingSessions[0],
        name: "New Name",
      };

      await saveScanSession(updatedSession);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("deleteScanSession", () => {
    it("should delete session and its files", async () => {
      const mockSession: ScanSession = {
        id: "session-to-delete",
        name: "Delete Me",
        pages: [
          {
            id: "page-1",
            originalUri: "file:///original.jpg",
            processedUri: "file:///processed.jpg",
            thumbnailUri: "file:///thumb.jpg",
            corners: null,
            timestamp: Date.now(),
            pageNumber: 1,
            enhancements: DEFAULT_ENHANCEMENTS,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([mockSession]),
      );

      await deleteScanSession("session-to-delete");

      expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(3); // 3 files per page
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Page Management
  // ===========================================================================

  describe("addPageToSession", () => {
    it("should add page with auto-processing", async () => {
      const mockSession: ScanSession = {
        id: "session-1",
        name: "Test",
        pages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockSession]),
      );

      const page = await addPageToSession(
        "session-1",
        "file:///captured.jpg",
        true,
      );

      expect(page.pageNumber).toBe(1);
      expect(page.processedUri).toBeDefined();
      expect(page.thumbnailUri).toBeDefined();
    });

    it("should throw if session not found", async () => {
      await expect(
        addPageToSession("non-existent", "file:///captured.jpg"),
      ).rejects.toThrow("Session not found");
    });
  });

  describe("reorderPages", () => {
    it("should reorder pages and renumber", async () => {
      const mockSession: ScanSession = {
        id: "session-1",
        name: "Test",
        pages: [
          { id: "page-1", pageNumber: 1 } as ScannedPage,
          { id: "page-2", pageNumber: 2 } as ScannedPage,
          { id: "page-3", pageNumber: 3 } as ScannedPage,
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockSession]),
      );

      await reorderPages("session-1", ["page-3", "page-1", "page-2"]);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Export
  // ===========================================================================

  describe("exportAsPDF", () => {
    it("should export session as PDF", async () => {
      const mockSession: ScanSession = {
        id: "session-1",
        name: "Export Test",
        pages: [
          {
            id: "page-1",
            originalUri: "file:///original.jpg",
            processedUri: "file:///processed.jpg",
            thumbnailUri: "file:///thumb.jpg",
            corners: null,
            timestamp: Date.now(),
            pageNumber: 1,
            enhancements: DEFAULT_ENHANCEMENTS,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockSession]),
      );

      const result = await exportAsPDF("session-1");

      expect(result.success).toBe(true);
      expect(result.format).toBe("pdf");
      expect(result.pageCount).toBe(1);
    });

    it("should fail if session empty", async () => {
      const emptySession: ScanSession = {
        id: "session-1",
        name: "Empty",
        pages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([emptySession]),
      );

      const result = await exportAsPDF("session-1");

      expect(result.success).toBe(false);
      expect(result.error).toContain("không có trang");
    });
  });

  describe("exportAsImages", () => {
    it("should export session as images", async () => {
      const mockSession: ScanSession = {
        id: "session-1",
        name: "Export Test",
        pages: [
          {
            id: "page-1",
            originalUri: "file:///original.jpg",
            processedUri: "file:///processed.jpg",
            thumbnailUri: "file:///thumb.jpg",
            corners: null,
            timestamp: Date.now(),
            pageNumber: 1,
            enhancements: DEFAULT_ENHANCEMENTS,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockSession]),
      );

      const result = await exportAsImages("session-1", "high");

      expect(result.success).toBe(true);
      expect(result.format).toBe("images");
    });
  });

  describe("shareDocument", () => {
    it("should share document when available", async () => {
      const result = await shareDocument("file:///export.pdf");

      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///export.pdf");
      expect(result).toBe(true);
    });

    it("should return false when sharing unavailable", async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      const result = await shareDocument("file:///export.pdf");

      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // Utilities
  // ===========================================================================

  describe("getSessionStats", () => {
    it("should calculate session statistics", () => {
      const session: ScanSession = {
        id: "session-1",
        name: "Stats Test",
        pages: [
          {
            id: "p1",
            corners: {
              topLeft: { x: 0, y: 0 },
              topRight: { x: 1, y: 0 },
              bottomRight: { x: 1, y: 1 },
              bottomLeft: { x: 0, y: 1 },
            },
          } as ScannedPage,
          { id: "p2", corners: null } as ScannedPage,
        ],
        createdAt: 1000,
        updatedAt: 2000,
        status: "active",
      };

      const stats = getSessionStats(session);

      expect(stats.pageCount).toBe(2);
      expect(stats.duration).toBe(1000);
      expect(stats.averageConfidence).toBeGreaterThan(0);
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1500)).toBe("1.5 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1500000)).toBe("1.4 MB");
    });

    it("should format gigabytes", () => {
      expect(formatFileSize(1500000000)).toBe("1.40 GB");
    });
  });

  describe("formatSessionDate", () => {
    it("should format timestamp as Vietnamese date", () => {
      const date = new Date("2024-03-15T10:30:00").getTime();
      const formatted = formatSessionDate(date);

      // Should contain date parts
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  // ===========================================================================
  // Constants
  // ===========================================================================

  describe("DEFAULT_ENHANCEMENTS", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_ENHANCEMENTS.brightness).toBe(0);
      expect(DEFAULT_ENHANCEMENTS.contrast).toBe(1);
      expect(DEFAULT_ENHANCEMENTS.saturation).toBe(1);
      expect(DEFAULT_ENHANCEMENTS.autoEnhance).toBe(true);
    });
  });

  describe("SCAN_QUALITY_PRESETS", () => {
    it("should have all presets", () => {
      expect(SCAN_QUALITY_PRESETS.draft).toBeDefined();
      expect(SCAN_QUALITY_PRESETS.standard).toBeDefined();
      expect(SCAN_QUALITY_PRESETS.high).toBeDefined();
      expect(SCAN_QUALITY_PRESETS.archive).toBeDefined();
    });

    it("should have increasing quality", () => {
      expect(SCAN_QUALITY_PRESETS.draft.jpegQuality).toBeLessThan(
        SCAN_QUALITY_PRESETS.standard.jpegQuality,
      );
      expect(SCAN_QUALITY_PRESETS.standard.jpegQuality).toBeLessThan(
        SCAN_QUALITY_PRESETS.high.jpegQuality,
      );
    });
  });

  describe("PAGE_SIZES", () => {
    it("should have A4 dimensions", () => {
      expect(PAGE_SIZES.A4).toEqual({ width: 595, height: 842 });
    });

    it("should have Letter dimensions", () => {
      expect(PAGE_SIZES.Letter).toEqual({ width: 612, height: 792 });
    });
  });

  describe("DEFAULT_PDF_OPTIONS", () => {
    it("should have correct defaults", () => {
      expect(DEFAULT_PDF_OPTIONS.quality).toBe("high");
      expect(DEFAULT_PDF_OPTIONS.pageSize).toBe("A4");
      expect(DEFAULT_PDF_OPTIONS.orientation).toBe("auto");
    });
  });
});
