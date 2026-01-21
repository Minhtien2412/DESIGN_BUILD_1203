/**
 * PDFViewerService.test.ts
 *
 * Unit tests for PDF Viewer Service
 *
 * Story: VIEW-001 - PDF Viewer
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(),
  documentDirectory: "/mock/documents/",
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
    addAnnotation,
    addBookmark,
    addToRecent,
    Annotation,
    ANNOTATION_COLORS,
    Bookmark,
    BOOKMARK_COLORS,
    calculateFitHeight,
    calculateFitPage,
    calculateFitWidth,
    // Utility functions
    calculateProgress,
    clampZoom,
    clearReadingProgress,
    clearRecentDocuments,
    copyPDFToStorage,
    // Search
    createSearchState,
    // Constants
    DEFAULT_PDF_SETTINGS,
    deletePDFFromStorage,
    estimateReadingTime,
    formatFileSize,
    formatPageRange,
    formatReadingTime,
    getCurrentSearchResult,
    getDocumentAnnotations,
    getDocumentBookmarks,
    getPageAnnotations,
    // File Operations
    getPDFInfo,
    getReadingProgress,
    isPageBookmarked,
    // Reading Progress
    loadAllProgress,
    // Annotations
    loadAnnotations,
    // Bookmarks
    loadBookmarks,
    // Settings
    loadPDFSettings,
    // Recent Documents
    loadRecentDocuments,
    nextSearchResult,
    // Types
    PDFDocument,
    // Service
    PDFViewerService,
    prevSearchResult,
    ReadingProgress,
    removeAnnotation,
    removeBookmark,
    removeBookmarkByPage,
    removeFromRecent,
    resetPDFSettings,
    savePDFSettings,
    saveReadingProgress,
    SearchState,
    sharePDF,
    toggleBookmark,
    updateAnnotation,
    updateBookmark,
    ZOOM_CONSTRAINTS
} from "../../services/PDFViewerService";

describe("PDFViewerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  // ==========================================================================
  // Constants Tests
  // ==========================================================================

  describe("Constants", () => {
    test("DEFAULT_PDF_SETTINGS has correct defaults", () => {
      expect(DEFAULT_PDF_SETTINGS.defaultZoom).toBe(1.0);
      expect(DEFAULT_PDF_SETTINGS.fitMode).toBe("width");
      expect(DEFAULT_PDF_SETTINGS.scrollDirection).toBe("vertical");
      expect(DEFAULT_PDF_SETTINGS.pageSpacing).toBe(10);
      expect(DEFAULT_PDF_SETTINGS.showPageNumbers).toBe(true);
      expect(DEFAULT_PDF_SETTINGS.nightMode).toBe(false);
      expect(DEFAULT_PDF_SETTINGS.brightness).toBe(1.0);
      expect(DEFAULT_PDF_SETTINGS.keepScreenAwake).toBe(true);
      expect(DEFAULT_PDF_SETTINGS.enableCaching).toBe(true);
      expect(DEFAULT_PDF_SETTINGS.maxCachedPages).toBe(10);
      expect(DEFAULT_PDF_SETTINGS.renderAhead).toBe(2);
      expect(DEFAULT_PDF_SETTINGS.enableDoubleTapZoom).toBe(true);
      expect(DEFAULT_PDF_SETTINGS.doubleTapZoomScale).toBe(2.5);
      expect(DEFAULT_PDF_SETTINGS.enableSwipeNavigation).toBe(true);
    });

    test("ZOOM_CONSTRAINTS has correct values", () => {
      expect(ZOOM_CONSTRAINTS.MIN).toBe(0.5);
      expect(ZOOM_CONSTRAINTS.MAX).toBe(5.0);
      expect(ZOOM_CONSTRAINTS.STEP).toBe(0.25);
      expect(ZOOM_CONSTRAINTS.DEFAULT).toBe(1.0);
    });

    test("BOOKMARK_COLORS has multiple colors", () => {
      expect(BOOKMARK_COLORS.length).toBeGreaterThan(0);
      expect(BOOKMARK_COLORS[0]).toBe("#FF6B6B");
    });

    test("ANNOTATION_COLORS has color arrays", () => {
      expect(ANNOTATION_COLORS.highlight).toBeDefined();
      expect(ANNOTATION_COLORS.underline).toBeDefined();
      expect(ANNOTATION_COLORS.strikethrough).toBeDefined();
      expect(ANNOTATION_COLORS.highlight.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Utility Functions Tests
  // ==========================================================================

  describe("calculateProgress", () => {
    test("calculates correct percentage", () => {
      expect(calculateProgress(1, 10)).toBe(10);
      expect(calculateProgress(5, 10)).toBe(50);
      expect(calculateProgress(10, 10)).toBe(100);
      expect(calculateProgress(3, 12)).toBe(25);
    });

    test("handles edge cases", () => {
      expect(calculateProgress(0, 10)).toBe(0);
      expect(calculateProgress(1, 0)).toBe(0);
      expect(calculateProgress(0, 0)).toBe(0);
    });
  });

  describe("formatFileSize", () => {
    test("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1572864)).toBe("1.5 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });
  });

  describe("formatPageRange", () => {
    test("formats page range correctly", () => {
      expect(formatPageRange(1, 10)).toBe("1 / 10");
      expect(formatPageRange(50, 100)).toBe("50 / 100");
      expect(formatPageRange(200, 200)).toBe("200 / 200");
    });
  });

  describe("calculateFitWidth", () => {
    test("calculates zoom to fit width", () => {
      // pageWidth=100, containerWidth=440, padding=20 -> (440-40)/100 = 4
      expect(calculateFitWidth(100, 440, 20)).toBe(4);
      // pageWidth=200, containerWidth=440, padding=20 -> (440-40)/200 = 2
      expect(calculateFitWidth(200, 440, 20)).toBe(2);
    });

    test("uses default padding of 20", () => {
      expect(calculateFitWidth(100, 440)).toBe(4);
    });
  });

  describe("calculateFitHeight", () => {
    test("calculates zoom to fit height", () => {
      expect(calculateFitHeight(100, 540, 20)).toBe(5);
      expect(calculateFitHeight(200, 440, 20)).toBe(2);
    });
  });

  describe("calculateFitPage", () => {
    test("returns minimum of fitWidth and fitHeight", () => {
      // Page 100x200, container 440x540
      // fitWidth = (440-40)/100 = 4
      // fitHeight = (540-40)/200 = 2.5
      // min = 2.5
      expect(calculateFitPage(100, 200, 440, 540, 20)).toBe(2.5);

      // Page 200x100, container 440x540
      // fitWidth = (440-40)/200 = 2
      // fitHeight = (540-40)/100 = 5
      // min = 2
      expect(calculateFitPage(200, 100, 440, 540, 20)).toBe(2);
    });
  });

  describe("clampZoom", () => {
    test("clamps zoom within constraints", () => {
      expect(clampZoom(1.0)).toBe(1.0);
      expect(clampZoom(0.1)).toBe(ZOOM_CONSTRAINTS.MIN);
      expect(clampZoom(10.0)).toBe(ZOOM_CONSTRAINTS.MAX);
      expect(clampZoom(2.5)).toBe(2.5);
    });
  });

  describe("estimateReadingTime", () => {
    test("estimates reading time correctly", () => {
      // 2 minutes per page
      expect(estimateReadingTime(10)).toBe(20);
      expect(estimateReadingTime(10, 5)).toBe(10);
      expect(estimateReadingTime(100)).toBe(200);
    });
  });

  describe("formatReadingTime", () => {
    test("formats minutes correctly", () => {
      expect(formatReadingTime(30)).toBe("30 phút");
      expect(formatReadingTime(60)).toBe("1 giờ");
      expect(formatReadingTime(90)).toBe("1 giờ 30 phút");
      expect(formatReadingTime(120)).toBe("2 giờ");
      expect(formatReadingTime(150)).toBe("2 giờ 30 phút");
    });
  });

  // ==========================================================================
  // Settings Tests
  // ==========================================================================

  describe("Settings Management", () => {
    describe("loadPDFSettings", () => {
      test("returns default settings when no stored data", async () => {
        const settings = await loadPDFSettings();
        expect(settings).toEqual(DEFAULT_PDF_SETTINGS);
      });

      test("merges stored settings with defaults", async () => {
        const stored = { nightMode: true, defaultZoom: 1.5 };
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(stored)
        );

        const settings = await loadPDFSettings();
        expect(settings.nightMode).toBe(true);
        expect(settings.defaultZoom).toBe(1.5);
        expect(settings.fitMode).toBe("width"); // Default
      });

      test("handles corrupted data gracefully", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("invalid json");

        const settings = await loadPDFSettings();
        expect(settings).toEqual(DEFAULT_PDF_SETTINGS);
      });
    });

    describe("savePDFSettings", () => {
      test("saves settings to storage", async () => {
        await savePDFSettings({ nightMode: true });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@pdf_viewer_settings",
          expect.stringContaining('"nightMode":true')
        );
      });

      test("merges with existing settings", async () => {
        const existing = { nightMode: true };
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(existing)
        );

        await savePDFSettings({ defaultZoom: 2.0 });

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData.nightMode).toBe(true);
        expect(savedData.defaultZoom).toBe(2.0);
      });
    });

    describe("resetPDFSettings", () => {
      test("removes settings from storage", async () => {
        await resetPDFSettings();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          "@pdf_viewer_settings"
        );
      });
    });
  });

  // ==========================================================================
  // Bookmarks Tests
  // ==========================================================================

  describe("Bookmarks Management", () => {
    const mockBookmarks: Bookmark[] = [
      {
        id: "bm-1",
        documentId: "doc-1",
        pageNumber: 5,
        label: "Chapter 1",
        createdAt: Date.now(),
        color: "#FF6B6B",
      },
      {
        id: "bm-2",
        documentId: "doc-1",
        pageNumber: 15,
        createdAt: Date.now(),
      },
      {
        id: "bm-3",
        documentId: "doc-2",
        pageNumber: 10,
        createdAt: Date.now(),
      },
    ];

    describe("loadBookmarks", () => {
      test("returns empty array when no bookmarks", async () => {
        const bookmarks = await loadBookmarks();
        expect(bookmarks).toEqual([]);
      });

      test("returns stored bookmarks", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        const bookmarks = await loadBookmarks();
        expect(bookmarks).toHaveLength(3);
      });
    });

    describe("getDocumentBookmarks", () => {
      test("filters bookmarks by documentId", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        const bookmarks = await getDocumentBookmarks("doc-1");
        expect(bookmarks).toHaveLength(2);
        expect(bookmarks[0].documentId).toBe("doc-1");
      });

      test("sorts bookmarks by page number", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        const bookmarks = await getDocumentBookmarks("doc-1");
        expect(bookmarks[0].pageNumber).toBe(5);
        expect(bookmarks[1].pageNumber).toBe(15);
      });
    });

    describe("addBookmark", () => {
      test("adds new bookmark", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const bookmark = await addBookmark("doc-1", 10, "Test Label");

        expect(bookmark.documentId).toBe("doc-1");
        expect(bookmark.pageNumber).toBe(10);
        expect(bookmark.label).toBe("Test Label");
        expect(bookmark.id).toBeDefined();
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      test("returns existing bookmark if already exists", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        const bookmark = await addBookmark("doc-1", 5);

        expect(bookmark.id).toBe("bm-1");
        // setItem should not be called because bookmark exists
      });

      test("uses default color if not specified", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const bookmark = await addBookmark("doc-1", 10);

        expect(bookmark.color).toBe(BOOKMARK_COLORS[0]);
      });
    });

    describe("removeBookmark", () => {
      test("removes bookmark by id", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        await removeBookmark("bm-1");

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(
          savedData.find((b: Bookmark) => b.id === "bm-1")
        ).toBeUndefined();
        expect(savedData).toHaveLength(2);
      });
    });

    describe("removeBookmarkByPage", () => {
      test("removes bookmark by document and page", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        await removeBookmarkByPage("doc-1", 5);

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(
          savedData.find(
            (b: Bookmark) => b.documentId === "doc-1" && b.pageNumber === 5
          )
        ).toBeUndefined();
      });
    });

    describe("updateBookmark", () => {
      test("updates bookmark properties", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        await updateBookmark("bm-1", {
          label: "Updated Label",
          color: "#00FF00",
        });

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        const updated = savedData.find((b: Bookmark) => b.id === "bm-1");
        expect(updated.label).toBe("Updated Label");
        expect(updated.color).toBe("#00FF00");
      });
    });

    describe("isPageBookmarked", () => {
      test("returns true if page is bookmarked", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        const result = await isPageBookmarked("doc-1", 5);
        expect(result).toBe(true);
      });

      test("returns false if page is not bookmarked", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        const result = await isPageBookmarked("doc-1", 20);
        expect(result).toBe(false);
      });
    });

    describe("toggleBookmark", () => {
      test("adds bookmark if not exists", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const result = await toggleBookmark("doc-1", 10, "New Bookmark");

        expect(result.isBookmarked).toBe(true);
        expect(result.bookmark).toBeDefined();
        expect(result.bookmark?.pageNumber).toBe(10);
      });

      test("removes bookmark if exists", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockBookmarks)
        );

        const result = await toggleBookmark("doc-1", 5);

        expect(result.isBookmarked).toBe(false);
        expect(result.bookmark).toBeUndefined();
      });
    });
  });

  // ==========================================================================
  // Reading Progress Tests
  // ==========================================================================

  describe("Reading Progress", () => {
    const mockProgress: Record<string, ReadingProgress> = {
      "doc-1": {
        documentId: "doc-1",
        currentPage: 25,
        totalPages: 100,
        percentage: 25,
        lastReadAt: Date.now(),
      },
    };

    describe("loadAllProgress", () => {
      test("returns empty object when no progress", async () => {
        const progress = await loadAllProgress();
        expect(progress).toEqual({});
      });

      test("returns stored progress", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockProgress)
        );

        const progress = await loadAllProgress();
        expect(progress["doc-1"]).toBeDefined();
      });
    });

    describe("getReadingProgress", () => {
      test("returns progress for document", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockProgress)
        );

        const progress = await getReadingProgress("doc-1");
        expect(progress?.currentPage).toBe(25);
        expect(progress?.percentage).toBe(25);
      });

      test("returns null if no progress", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockProgress)
        );

        const progress = await getReadingProgress("doc-2");
        expect(progress).toBeNull();
      });
    });

    describe("saveReadingProgress", () => {
      test("saves reading progress", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("{}");

        const progress = await saveReadingProgress("doc-1", 50, 100);

        expect(progress.currentPage).toBe(50);
        expect(progress.percentage).toBe(50);
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      test("updates existing progress", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockProgress)
        );

        await saveReadingProgress("doc-1", 75, 100);

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData["doc-1"].currentPage).toBe(75);
        expect(savedData["doc-1"].percentage).toBe(75);
      });
    });

    describe("clearReadingProgress", () => {
      test("clears progress for document", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockProgress)
        );

        await clearReadingProgress("doc-1");

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData["doc-1"]).toBeUndefined();
      });
    });
  });

  // ==========================================================================
  // Recent Documents Tests
  // ==========================================================================

  describe("Recent Documents", () => {
    const mockDocument: PDFDocument = {
      id: "doc-1",
      uri: "/path/to/doc.pdf",
      filename: "document.pdf",
      totalPages: 50,
      fileSize: 1024000,
      createdAt: Date.now(),
      lastOpenedAt: Date.now(),
      lastPage: 1,
    };

    describe("loadRecentDocuments", () => {
      test("returns empty array when no recent docs", async () => {
        const docs = await loadRecentDocuments();
        expect(docs).toEqual([]);
      });

      test("returns stored recent documents", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockDocument])
        );

        const docs = await loadRecentDocuments();
        expect(docs).toHaveLength(1);
        expect(docs[0].filename).toBe("document.pdf");
      });
    });

    describe("addToRecent", () => {
      test("adds document to recent", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        await addToRecent(mockDocument);

        expect(AsyncStorage.setItem).toHaveBeenCalled();
        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData).toHaveLength(1);
        expect(savedData[0].id).toBe("doc-1");
      });

      test("moves existing document to top", async () => {
        const existingDocs = [
          { ...mockDocument, id: "doc-2", filename: "other.pdf" },
          mockDocument,
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(existingDocs)
        );

        await addToRecent(mockDocument);

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData[0].id).toBe("doc-1");
      });

      test("limits to 20 recent documents", async () => {
        const manyDocs = Array.from({ length: 25 }, (_, i) => ({
          ...mockDocument,
          id: `doc-${i}`,
        }));
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(manyDocs)
        );

        await addToRecent({ ...mockDocument, id: "doc-new" });

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData).toHaveLength(20);
        expect(savedData[0].id).toBe("doc-new");
      });
    });

    describe("removeFromRecent", () => {
      test("removes document from recent", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockDocument])
        );

        await removeFromRecent("doc-1");

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData).toHaveLength(0);
      });
    });

    describe("clearRecentDocuments", () => {
      test("clears all recent documents", async () => {
        await clearRecentDocuments();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          "@pdf_recent_documents"
        );
      });
    });
  });

  // ==========================================================================
  // Annotations Tests
  // ==========================================================================

  describe("Annotations", () => {
    const mockAnnotations: Annotation[] = [
      {
        id: "ann-1",
        documentId: "doc-1",
        pageNumber: 5,
        type: "highlight",
        color: "#FFFF00",
        rects: [{ x: 10, y: 20, width: 100, height: 20 }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "ann-2",
        documentId: "doc-1",
        pageNumber: 10,
        type: "note",
        color: "#00FF00",
        note: "Important!",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    describe("loadAnnotations", () => {
      test("returns empty array when no annotations", async () => {
        const annotations = await loadAnnotations();
        expect(annotations).toEqual([]);
      });

      test("returns stored annotations", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockAnnotations)
        );

        const annotations = await loadAnnotations();
        expect(annotations).toHaveLength(2);
      });
    });

    describe("getDocumentAnnotations", () => {
      test("filters annotations by documentId", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockAnnotations)
        );

        const annotations = await getDocumentAnnotations("doc-1");
        expect(annotations).toHaveLength(2);
      });

      test("returns empty array for unknown document", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockAnnotations)
        );

        const annotations = await getDocumentAnnotations("unknown");
        expect(annotations).toHaveLength(0);
      });
    });

    describe("getPageAnnotations", () => {
      test("filters annotations by page", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockAnnotations)
        );

        const annotations = await getPageAnnotations("doc-1", 5);
        expect(annotations).toHaveLength(1);
        expect(annotations[0].pageNumber).toBe(5);
      });
    });

    describe("addAnnotation", () => {
      test("adds new annotation", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const annotation = await addAnnotation({
          documentId: "doc-1",
          pageNumber: 15,
          type: "highlight",
          color: "#FFFF00",
        });

        expect(annotation.id).toBeDefined();
        expect(annotation.createdAt).toBeDefined();
        expect(annotation.updatedAt).toBeDefined();
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    describe("updateAnnotation", () => {
      test("updates annotation", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockAnnotations)
        );

        await updateAnnotation("ann-1", { color: "#FF0000", note: "Updated" });

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        const updated = savedData.find((a: Annotation) => a.id === "ann-1");
        expect(updated.color).toBe("#FF0000");
        expect(updated.note).toBe("Updated");
      });
    });

    describe("removeAnnotation", () => {
      test("removes annotation", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockAnnotations)
        );

        await removeAnnotation("ann-1");

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(
          savedData.find((a: Annotation) => a.id === "ann-1")
        ).toBeUndefined();
      });
    });
  });

  // ==========================================================================
  // File Operations Tests
  // ==========================================================================

  describe("File Operations", () => {
    describe("getPDFInfo", () => {
      test("returns PDF info", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
          size: 1024000,
        });

        const info = await getPDFInfo("/path/to/document.pdf");

        expect(info.uri).toBe("/path/to/document.pdf");
        expect(info.filename).toBe("document.pdf");
        expect(info.fileSize).toBe(1024000);
      });

      test("throws error if file not found", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });

        await expect(getPDFInfo("/path/to/missing.pdf")).rejects.toThrow(
          "File not found"
        );
      });
    });

    describe("sharePDF", () => {
      test("shares PDF when available", async () => {
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
        (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

        const result = await sharePDF("/path/to/doc.pdf");

        expect(result).toBe(true);
        expect(Sharing.shareAsync).toHaveBeenCalledWith("/path/to/doc.pdf", {
          mimeType: "application/pdf",
          dialogTitle: "Chia sẻ PDF",
        });
      });

      test("returns false when sharing not available", async () => {
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

        const result = await sharePDF("/path/to/doc.pdf");

        expect(result).toBe(false);
      });
    });

    describe("copyPDFToStorage", () => {
      test("copies PDF to app storage", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
        });
        (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);

        const destUri = await copyPDFToStorage("/source/doc.pdf", "doc.pdf");

        expect(destUri).toBe("/mock/documents/pdfs/doc.pdf");
        expect(FileSystem.copyAsync).toHaveBeenCalled();
      });

      test("creates directory if not exists", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });
        (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(
          undefined
        );
        (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);

        await copyPDFToStorage("/source/doc.pdf", "doc.pdf");

        expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
          "/mock/documents/pdfs/",
          { intermediates: true }
        );
      });
    });

    describe("deletePDFFromStorage", () => {
      test("deletes PDF if exists", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
        });
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

        await deletePDFFromStorage("/path/to/doc.pdf");

        expect(FileSystem.deleteAsync).toHaveBeenCalledWith("/path/to/doc.pdf");
      });

      test("does nothing if file not exists", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });

        await deletePDFFromStorage("/path/to/doc.pdf");

        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // Search Tests
  // ==========================================================================

  describe("Search", () => {
    describe("createSearchState", () => {
      test("creates initial search state", () => {
        const state = createSearchState();

        expect(state.query).toBe("");
        expect(state.results).toEqual([]);
        expect(state.currentIndex).toBe(-1);
        expect(state.isSearching).toBe(false);
        expect(state.totalMatches).toBe(0);
      });
    });

    describe("nextSearchResult", () => {
      test("moves to next result", () => {
        const state: SearchState = {
          query: "test",
          results: [
            { pageNumber: 1, text: "test1", rects: [] },
            { pageNumber: 2, text: "test2", rects: [] },
            { pageNumber: 3, text: "test3", rects: [] },
          ],
          currentIndex: 0,
          isSearching: false,
          totalMatches: 3,
        };

        const next = nextSearchResult(state);
        expect(next.currentIndex).toBe(1);
      });

      test("wraps around to first result", () => {
        const state: SearchState = {
          query: "test",
          results: [
            { pageNumber: 1, text: "test1", rects: [] },
            { pageNumber: 2, text: "test2", rects: [] },
          ],
          currentIndex: 1,
          isSearching: false,
          totalMatches: 2,
        };

        const next = nextSearchResult(state);
        expect(next.currentIndex).toBe(0);
      });

      test("returns same state if no results", () => {
        const state = createSearchState();
        const next = nextSearchResult(state);
        expect(next).toEqual(state);
      });
    });

    describe("prevSearchResult", () => {
      test("moves to previous result", () => {
        const state: SearchState = {
          query: "test",
          results: [
            { pageNumber: 1, text: "test1", rects: [] },
            { pageNumber: 2, text: "test2", rects: [] },
          ],
          currentIndex: 1,
          isSearching: false,
          totalMatches: 2,
        };

        const prev = prevSearchResult(state);
        expect(prev.currentIndex).toBe(0);
      });

      test("wraps around to last result", () => {
        const state: SearchState = {
          query: "test",
          results: [
            { pageNumber: 1, text: "test1", rects: [] },
            { pageNumber: 2, text: "test2", rects: [] },
          ],
          currentIndex: 0,
          isSearching: false,
          totalMatches: 2,
        };

        const prev = prevSearchResult(state);
        expect(prev.currentIndex).toBe(1);
      });
    });

    describe("getCurrentSearchResult", () => {
      test("returns current result", () => {
        const state: SearchState = {
          query: "test",
          results: [
            { pageNumber: 1, text: "test1", rects: [] },
            { pageNumber: 2, text: "test2", rects: [] },
          ],
          currentIndex: 1,
          isSearching: false,
          totalMatches: 2,
        };

        const result = getCurrentSearchResult(state);
        expect(result?.pageNumber).toBe(2);
        expect(result?.text).toBe("test2");
      });

      test("returns null if no current result", () => {
        const state = createSearchState();
        const result = getCurrentSearchResult(state);
        expect(result).toBeNull();
      });
    });
  });

  // ==========================================================================
  // PDFViewerService Class Tests
  // ==========================================================================

  describe("PDFViewerService Class", () => {
    test("initializes service", async () => {
      await PDFViewerService.initialize();
      // Should not throw
    });

    test("getSettings returns settings", async () => {
      const settings = await PDFViewerService.getSettings();
      expect(settings).toBeDefined();
      expect(settings.defaultZoom).toBeDefined();
    });

    test("updateSettings updates settings", async () => {
      await PDFViewerService.updateSettings({ nightMode: true });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("getBookmarks returns bookmarks", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

      const bookmarks = await PDFViewerService.getBookmarks("doc-1");
      expect(bookmarks).toEqual([]);
    });

    test("addBookmark adds bookmark", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

      const bookmark = await PDFViewerService.addBookmark("doc-1", 10);
      expect(bookmark.pageNumber).toBe(10);
    });

    test("getProgress returns progress", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("{}");

      const progress = await PDFViewerService.getProgress("doc-1");
      expect(progress).toBeNull();
    });

    test("saveProgress saves progress", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("{}");

      const progress = await PDFViewerService.saveProgress("doc-1", 50, 100);
      expect(progress.currentPage).toBe(50);
    });

    test("getRecent returns recent documents", async () => {
      const recent = await PDFViewerService.getRecent();
      expect(recent).toEqual([]);
    });

    test("getAnnotations returns annotations", async () => {
      const annotations = await PDFViewerService.getAnnotations("doc-1");
      expect(annotations).toEqual([]);
    });
  });
});
