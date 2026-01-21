/**
 * ImageViewerService.test.ts
 *
 * Unit tests for Image Viewer Service
 *
 * Story: VIEW-002 - Image Viewer
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
  cacheDirectory: "/mock/cache/",
  downloadAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: "base64",
  },
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn(),
  saveToLibraryAsync: jest.fn(),
}));

jest.mock("react-native", () => ({
  Dimensions: {
    get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  },
}));

import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

import {
    // Constants
    DEFAULT_IMAGE_SETTINGS,
    // Types
    GalleryImage,
    IMAGE_EXTENSIONS,
    IMAGE_ZOOM_CONSTRAINTS,
    // Service
    ImageViewerService,
    SUPPORTED_IMAGE_FORMATS,
    addToFavorites,
    addToRecent,
    calculateAspectRatio,
    calculateFitDimensions,
    calculatePanBoundaries,
    calculatePinchZoom,
    clampTranslation,
    clampZoom,
    clearRecentImages,
    deleteImage,
    formatDimensions,
    formatFileSize,
    getExtensionFromFilename,
    getFilenameFromUri,
    getImageBase64,
    // Operations
    getImageInfo,
    getNextRotation,
    getRotationTransform,
    // Utility functions
    getScreenDimensions,
    isFavorite,
    isLocalFile,
    isRemoteUri,
    isSupportedFormat,
    // Favorites
    loadFavorites,
    // Settings
    loadImageSettings,
    // Recent
    loadRecentImages,
    preloadAdjacentImages,
    preloadImage,
    removeFromFavorites,
    resetImageSettings,
    saveImageSettings,
    saveImageToGallery,
    shareImage,
    toggleFavorite,
} from "../../services/ImageViewerService";

describe("ImageViewerService", () => {
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
    test("DEFAULT_IMAGE_SETTINGS has correct defaults", () => {
      expect(DEFAULT_IMAGE_SETTINGS.minZoom).toBe(1);
      expect(DEFAULT_IMAGE_SETTINGS.maxZoom).toBe(5);
      expect(DEFAULT_IMAGE_SETTINGS.doubleTapZoom).toBe(2.5);
      expect(DEFAULT_IMAGE_SETTINGS.enableDoubleTapZoom).toBe(true);
      expect(DEFAULT_IMAGE_SETTINGS.enablePinchZoom).toBe(true);
      expect(DEFAULT_IMAGE_SETTINGS.enablePan).toBe(true);
      expect(DEFAULT_IMAGE_SETTINGS.enableSwipeToClose).toBe(true);
      expect(DEFAULT_IMAGE_SETTINGS.swipeToCloseThreshold).toBe(150);
      expect(DEFAULT_IMAGE_SETTINGS.showImageInfo).toBe(false);
      expect(DEFAULT_IMAGE_SETTINGS.backgroundColor).toBe("#000000");
      expect(DEFAULT_IMAGE_SETTINGS.enableImageCaching).toBe(true);
      expect(DEFAULT_IMAGE_SETTINGS.maxCachedImages).toBe(50);
      expect(DEFAULT_IMAGE_SETTINGS.preloadAdjacent).toBe(true);
    });

    test("IMAGE_ZOOM_CONSTRAINTS has correct values", () => {
      expect(IMAGE_ZOOM_CONSTRAINTS.MIN).toBe(0.5);
      expect(IMAGE_ZOOM_CONSTRAINTS.MAX).toBe(10);
      expect(IMAGE_ZOOM_CONSTRAINTS.DEFAULT).toBe(1);
      expect(IMAGE_ZOOM_CONSTRAINTS.DOUBLE_TAP).toBe(2.5);
    });

    test("SUPPORTED_IMAGE_FORMATS includes common formats", () => {
      expect(SUPPORTED_IMAGE_FORMATS).toContain("image/jpeg");
      expect(SUPPORTED_IMAGE_FORMATS).toContain("image/png");
      expect(SUPPORTED_IMAGE_FORMATS).toContain("image/gif");
      expect(SUPPORTED_IMAGE_FORMATS).toContain("image/webp");
    });

    test("IMAGE_EXTENSIONS maps mime types to extensions", () => {
      expect(IMAGE_EXTENSIONS["image/jpeg"]).toBe(".jpg");
      expect(IMAGE_EXTENSIONS["image/png"]).toBe(".png");
      expect(IMAGE_EXTENSIONS["image/gif"]).toBe(".gif");
    });
  });

  // ==========================================================================
  // Utility Functions Tests
  // ==========================================================================

  describe("getScreenDimensions", () => {
    test("returns screen dimensions", () => {
      const dims = getScreenDimensions();
      expect(dims.width).toBe(375);
      expect(dims.height).toBe(812);
    });
  });

  describe("calculateAspectRatio", () => {
    test("calculates correct aspect ratio", () => {
      expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(1.778);
      expect(calculateAspectRatio(1080, 1920)).toBeCloseTo(0.5625);
      expect(calculateAspectRatio(100, 100)).toBe(1);
    });

    test("handles zero height", () => {
      expect(calculateAspectRatio(100, 0)).toBe(1);
    });
  });

  describe("calculateFitDimensions", () => {
    test("contains image within container (landscape image)", () => {
      const result = calculateFitDimensions(1920, 1080, 375, 812, "contain");
      expect(result.width).toBe(375);
      expect(result.height).toBeCloseTo(210.9375);
    });

    test("contains image within container (portrait image)", () => {
      const result = calculateFitDimensions(1080, 1920, 375, 812, "contain");
      // Portrait image (1080x1920) in container (375x812)
      // Width constraint: 375, resulting height = 375 * (1920/1080) = 666.67
      expect(result.width).toBe(375);
      expect(result.height).toBeCloseTo(666.67, 1);
    });

    test("covers container with image", () => {
      const result = calculateFitDimensions(1920, 1080, 375, 812, "cover");
      expect(result.height).toBe(812);
      expect(result.width).toBeGreaterThan(375);
    });
  });

  describe("clampZoom", () => {
    test("clamps zoom within default constraints", () => {
      expect(clampZoom(1)).toBe(1);
      expect(clampZoom(0.1)).toBe(IMAGE_ZOOM_CONSTRAINTS.MIN);
      expect(clampZoom(20)).toBe(IMAGE_ZOOM_CONSTRAINTS.MAX);
    });

    test("clamps with custom constraints", () => {
      expect(clampZoom(0.5, 1, 3)).toBe(1);
      expect(clampZoom(5, 1, 3)).toBe(3);
      expect(clampZoom(2, 1, 3)).toBe(2);
    });
  });

  describe("calculatePinchZoom", () => {
    test("calculates pinch zoom correctly", () => {
      expect(calculatePinchZoom(1, 2, 0.5, 5)).toBe(2);
      expect(calculatePinchZoom(2, 1.5, 0.5, 5)).toBe(3);
    });

    test("clamps result within limits", () => {
      expect(calculatePinchZoom(1, 0.1, 0.5, 5)).toBe(0.5);
      expect(calculatePinchZoom(3, 5, 0.5, 5)).toBe(5);
    });
  });

  describe("calculatePanBoundaries", () => {
    test("calculates pan boundaries for zoomed image", () => {
      const boundaries = calculatePanBoundaries(200, 300, 375, 812, 2);
      // scaledWidth = 400, scaledHeight = 600
      // overflowX = max(0, (400 - 375) / 2) = 12.5
      // overflowY = max(0, (600 - 812) / 2) = 0 (no overflow)
      expect(boundaries.minX).toBe(-12.5);
      expect(boundaries.maxX).toBe(12.5);
      // Use toBeCloseTo for -0/0 comparison
      expect(boundaries.minY).toBeCloseTo(0);
      expect(boundaries.maxY).toBeCloseTo(0);
    });

    test("returns zero boundaries for non-zoomed image", () => {
      const boundaries = calculatePanBoundaries(200, 300, 375, 812, 1);
      // Use toBeCloseTo for -0/0 comparison
      expect(boundaries.minX).toBeCloseTo(0);
      expect(boundaries.maxX).toBeCloseTo(0);
      expect(boundaries.minY).toBeCloseTo(0);
      expect(boundaries.maxY).toBeCloseTo(0);
    });
  });

  describe("clampTranslation", () => {
    test("clamps translation within boundaries", () => {
      const boundaries = { minX: -100, maxX: 100, minY: -50, maxY: 50 };

      expect(clampTranslation(50, 25, boundaries)).toEqual({ x: 50, y: 25 });
      expect(clampTranslation(150, 25, boundaries)).toEqual({ x: 100, y: 25 });
      expect(clampTranslation(-150, 25, boundaries)).toEqual({
        x: -100,
        y: 25,
      });
      expect(clampTranslation(50, 75, boundaries)).toEqual({ x: 50, y: 50 });
    });
  });

  describe("getRotationTransform", () => {
    test("returns correct rotation transform", () => {
      expect(getRotationTransform(0)).toBe("rotate(0deg)");
      expect(getRotationTransform(90)).toBe("rotate(90deg)");
      expect(getRotationTransform(180)).toBe("rotate(180deg)");
      expect(getRotationTransform(270)).toBe("rotate(270deg)");
    });
  });

  describe("getNextRotation", () => {
    test("rotates clockwise", () => {
      expect(getNextRotation(0, true)).toBe(90);
      expect(getNextRotation(90, true)).toBe(180);
      expect(getNextRotation(180, true)).toBe(270);
      expect(getNextRotation(270, true)).toBe(0);
    });

    test("rotates counter-clockwise", () => {
      expect(getNextRotation(0, false)).toBe(270);
      expect(getNextRotation(90, false)).toBe(0);
      expect(getNextRotation(180, false)).toBe(90);
      expect(getNextRotation(270, false)).toBe(180);
    });
  });

  describe("formatFileSize", () => {
    test("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });
  });

  describe("formatDimensions", () => {
    test("formats dimensions correctly", () => {
      expect(formatDimensions(1920, 1080)).toBe("1920 × 1080");
      expect(formatDimensions(100, 200)).toBe("100 × 200");
    });
  });

  describe("isLocalFile", () => {
    test("identifies local files", () => {
      expect(isLocalFile("file:///path/to/image.jpg")).toBe(true);
      expect(isLocalFile("/path/to/image.jpg")).toBe(true);
      expect(isLocalFile("content://media/image.jpg")).toBe(true);
      expect(isLocalFile("ph://photo.jpg")).toBe(true);
      expect(isLocalFile("assets-library://image.jpg")).toBe(true);
    });

    test("rejects remote URLs", () => {
      expect(isLocalFile("https://example.com/image.jpg")).toBe(false);
      expect(isLocalFile("http://example.com/image.jpg")).toBe(false);
    });
  });

  describe("isRemoteUri", () => {
    test("identifies remote URIs", () => {
      expect(isRemoteUri("https://example.com/image.jpg")).toBe(true);
      expect(isRemoteUri("http://example.com/image.jpg")).toBe(true);
    });

    test("rejects local files", () => {
      expect(isRemoteUri("file:///path/to/image.jpg")).toBe(false);
      expect(isRemoteUri("/path/to/image.jpg")).toBe(false);
    });
  });

  describe("getFilenameFromUri", () => {
    test("extracts filename from URI", () => {
      expect(getFilenameFromUri("/path/to/image.jpg")).toBe("image.jpg");
      expect(getFilenameFromUri("https://example.com/photos/image.png")).toBe(
        "image.png"
      );
      expect(
        getFilenameFromUri("https://example.com/image.jpg?size=large")
      ).toBe("image.jpg");
    });

    test("returns image for empty filename", () => {
      expect(getFilenameFromUri("/path/")).toBe("image");
    });
  });

  describe("getExtensionFromFilename", () => {
    test("extracts extension from filename", () => {
      expect(getExtensionFromFilename("image.jpg")).toBe(".jpg");
      expect(getExtensionFromFilename("photo.PNG")).toBe(".png");
      expect(getExtensionFromFilename("file.name.gif")).toBe(".gif");
    });

    test("returns empty for no extension", () => {
      expect(getExtensionFromFilename("noextension")).toBe("");
    });
  });

  describe("isSupportedFormat", () => {
    test("returns true for supported formats", () => {
      expect(isSupportedFormat("image/jpeg")).toBe(true);
      expect(isSupportedFormat("image/png")).toBe(true);
      expect(isSupportedFormat("image/gif")).toBe(true);
      expect(isSupportedFormat("image/webp")).toBe(true);
    });

    test("returns false for unsupported formats", () => {
      expect(isSupportedFormat("image/tiff")).toBe(false);
      expect(isSupportedFormat("video/mp4")).toBe(false);
      expect(isSupportedFormat("application/pdf")).toBe(false);
    });
  });

  // ==========================================================================
  // Settings Tests
  // ==========================================================================

  describe("Settings Management", () => {
    describe("loadImageSettings", () => {
      test("returns default settings when no stored data", async () => {
        const settings = await loadImageSettings();
        expect(settings).toEqual(DEFAULT_IMAGE_SETTINGS);
      });

      test("merges stored settings with defaults", async () => {
        const stored = { minZoom: 0.5, maxZoom: 8 };
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(stored)
        );

        const settings = await loadImageSettings();
        expect(settings.minZoom).toBe(0.5);
        expect(settings.maxZoom).toBe(8);
        expect(settings.doubleTapZoom).toBe(2.5); // Default
      });

      test("handles corrupted data gracefully", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("invalid json");

        const settings = await loadImageSettings();
        expect(settings).toEqual(DEFAULT_IMAGE_SETTINGS);
      });
    });

    describe("saveImageSettings", () => {
      test("saves settings to storage", async () => {
        await saveImageSettings({ minZoom: 0.5 });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@image_viewer_settings",
          expect.stringContaining('"minZoom":0.5')
        );
      });
    });

    describe("resetImageSettings", () => {
      test("removes settings from storage", async () => {
        await resetImageSettings();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          "@image_viewer_settings"
        );
      });
    });
  });

  // ==========================================================================
  // Favorites Tests
  // ==========================================================================

  describe("Favorites Management", () => {
    describe("loadFavorites", () => {
      test("returns empty array when no favorites", async () => {
        const favorites = await loadFavorites();
        expect(favorites).toEqual([]);
      });

      test("returns stored favorites", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(["img-1", "img-2"])
        );

        const favorites = await loadFavorites();
        expect(favorites).toEqual(["img-1", "img-2"]);
      });
    });

    describe("addToFavorites", () => {
      test("adds image to favorites", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        await addToFavorites("img-1");

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@image_viewer_favorites",
          JSON.stringify(["img-1"])
        );
      });

      test("does not add duplicate", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(["img-1"])
        );

        await addToFavorites("img-1");

        // setItem should not be called because already exists
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      });
    });

    describe("removeFromFavorites", () => {
      test("removes image from favorites", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(["img-1", "img-2"])
        );

        await removeFromFavorites("img-1");

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@image_viewer_favorites",
          JSON.stringify(["img-2"])
        );
      });
    });

    describe("toggleFavorite", () => {
      test("adds to favorites if not favorite", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const result = await toggleFavorite("img-1");

        expect(result).toBe(true);
      });

      test("removes from favorites if already favorite", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(["img-1"])
        );

        const result = await toggleFavorite("img-1");

        expect(result).toBe(false);
      });
    });

    describe("isFavorite", () => {
      test("returns true if favorite", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(["img-1"])
        );

        const result = await isFavorite("img-1");
        expect(result).toBe(true);
      });

      test("returns false if not favorite", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(["img-2"])
        );

        const result = await isFavorite("img-1");
        expect(result).toBe(false);
      });
    });
  });

  // ==========================================================================
  // Recent Images Tests
  // ==========================================================================

  describe("Recent Images", () => {
    const mockImage: GalleryImage = {
      id: "img-1",
      uri: "file:///image.jpg",
      title: "Test Image",
    };

    describe("loadRecentImages", () => {
      test("returns empty array when no recent", async () => {
        const recent = await loadRecentImages();
        expect(recent).toEqual([]);
      });

      test("returns stored recent images", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockImage])
        );

        const recent = await loadRecentImages();
        expect(recent).toHaveLength(1);
        expect(recent[0].id).toBe("img-1");
      });
    });

    describe("addToRecent", () => {
      test("adds image to recent", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        await addToRecent(mockImage);

        expect(AsyncStorage.setItem).toHaveBeenCalled();
        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData[0].id).toBe("img-1");
      });

      test("moves existing image to top", async () => {
        const existing = [{ id: "img-2", uri: "file:///img2.jpg" }, mockImage];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(existing)
        );

        await addToRecent(mockImage);

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData[0].id).toBe("img-1");
      });

      test("limits to 50 recent images", async () => {
        const manyImages = Array.from({ length: 55 }, (_, i) => ({
          id: `img-${i}`,
          uri: `file:///img${i}.jpg`,
        }));
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(manyImages)
        );

        await addToRecent({ id: "img-new", uri: "file:///new.jpg" });

        const savedData = JSON.parse(
          (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
        );
        expect(savedData).toHaveLength(50);
        expect(savedData[0].id).toBe("img-new");
      });
    });

    describe("clearRecentImages", () => {
      test("clears recent images", async () => {
        await clearRecentImages();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          "@image_viewer_recent"
        );
      });
    });
  });

  // ==========================================================================
  // Image Operations Tests
  // ==========================================================================

  describe("Image Operations", () => {
    describe("getImageInfo", () => {
      test("returns image info", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
          size: 102400,
        });

        const info = await getImageInfo("/path/to/image.jpg");

        expect(info.uri).toBe("/path/to/image.jpg");
        expect(info.filename).toBe("image.jpg");
        expect(info.fileSize).toBe(102400);
      });

      test("throws error if file not found", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });

        await expect(getImageInfo("/path/to/missing.jpg")).rejects.toThrow(
          "File not found"
        );
      });
    });

    describe("shareImage", () => {
      test("shares image when available", async () => {
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
        (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

        const result = await shareImage("/path/to/image.jpg");

        expect(result).toBe(true);
        expect(Sharing.shareAsync).toHaveBeenCalledWith("/path/to/image.jpg", {
          dialogTitle: "Chia sẻ ảnh",
        });
      });

      test("returns false when sharing not available", async () => {
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

        const result = await shareImage("/path/to/image.jpg");

        expect(result).toBe(false);
      });
    });

    describe("saveImageToGallery", () => {
      test("saves local image to gallery", async () => {
        (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
          status: "granted",
        });
        (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValue({});

        const result = await saveImageToGallery("file:///image.jpg");

        expect(result).toBe(true);
        expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalledWith(
          "file:///image.jpg"
        );
      });

      test("downloads and saves remote image", async () => {
        (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
          status: "granted",
        });
        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
          uri: "/local/image.jpg",
        });
        (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValue({});

        const result = await saveImageToGallery(
          "https://example.com/image.jpg"
        );

        expect(result).toBe(true);
        expect(FileSystem.downloadAsync).toHaveBeenCalled();
      });

      test("returns false when permission denied", async () => {
        (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
          status: "denied",
        });

        const result = await saveImageToGallery("file:///image.jpg");

        expect(result).toBe(false);
      });
    });

    describe("getImageBase64", () => {
      test("returns base64 for local file", async () => {
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
          "base64data"
        );

        const result = await getImageBase64("file:///image.jpg");

        expect(result).toBe("base64data");
      });

      test("downloads remote file first", async () => {
        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
          uri: "/local/image.jpg",
        });
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
          "base64data"
        );

        const result = await getImageBase64("https://example.com/image.jpg");

        expect(result).toBe("base64data");
        expect(FileSystem.downloadAsync).toHaveBeenCalled();
      });

      test("returns null on error", async () => {
        (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(
          new Error("Read failed")
        );

        const result = await getImageBase64("file:///image.jpg");

        expect(result).toBeNull();
      });
    });

    describe("deleteImage", () => {
      test("deletes local image", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
        });
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

        const result = await deleteImage("file:///image.jpg");

        expect(result).toBe(true);
        expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
          "file:///image.jpg"
        );
      });

      test("returns false for remote URI", async () => {
        const result = await deleteImage("https://example.com/image.jpg");

        expect(result).toBe(false);
      });

      test("returns false if file not exists", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });

        const result = await deleteImage("file:///image.jpg");

        expect(result).toBe(false);
      });
    });

    describe("preloadImage", () => {
      test("returns true for local file", async () => {
        const result = await preloadImage("file:///image.jpg");

        expect(result).toBe(true);
      });

      test("downloads remote file to cache", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });
        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
          uri: "/cache/image.jpg",
        });

        const result = await preloadImage("https://example.com/image.jpg");

        expect(result).toBe(true);
        expect(FileSystem.downloadAsync).toHaveBeenCalled();
      });

      test("skips download if already cached", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
        });

        const result = await preloadImage("https://example.com/image.jpg");

        expect(result).toBe(true);
        expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
      });
    });

    describe("preloadAdjacentImages", () => {
      test("preloads adjacent images", async () => {
        const images: GalleryImage[] = [
          { id: "1", uri: "https://example.com/1.jpg" },
          { id: "2", uri: "https://example.com/2.jpg" },
          { id: "3", uri: "https://example.com/3.jpg" },
          { id: "4", uri: "https://example.com/4.jpg" },
          { id: "5", uri: "https://example.com/5.jpg" },
        ];

        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });
        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
          uri: "/cache/img.jpg",
        });

        await preloadAdjacentImages(images, 2, 2);

        // Should preload indices 3, 1, 4, 0 (2 ahead and 2 behind)
        expect(FileSystem.downloadAsync).toHaveBeenCalledTimes(4);
      });
    });
  });

  // ==========================================================================
  // Service Class Tests
  // ==========================================================================

  describe("ImageViewerService Class", () => {
    test("initializes service", async () => {
      await ImageViewerService.initialize();
      // Should not throw
    });

    test("getSettings returns settings", async () => {
      const settings = await ImageViewerService.getSettings();
      expect(settings).toBeDefined();
      expect(settings.minZoom).toBeDefined();
    });

    test("updateSettings updates settings", async () => {
      await ImageViewerService.updateSettings({ minZoom: 0.5 });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("getFavorites returns favorites", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

      const favorites = await ImageViewerService.getFavorites();
      expect(favorites).toEqual([]);
    });

    test("toggleFavorite toggles favorite", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

      const result = await ImageViewerService.toggleFavorite("img-1");
      expect(result).toBe(true);
    });

    test("getRecent returns recent images", async () => {
      const recent = await ImageViewerService.getRecent();
      expect(recent).toEqual([]);
    });

    test("share shares image", async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await ImageViewerService.share("/image.jpg");
      expect(result).toBe(true);
    });

    test("saveToGallery saves image", async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValue({});

      const result =
        await ImageViewerService.saveToGallery("file:///image.jpg");
      expect(result).toBe(true);
    });

    test("delete deletes image", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await ImageViewerService.delete("file:///image.jpg");
      expect(result).toBe(true);
    });
  });
});
