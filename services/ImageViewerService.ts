/**
 * ImageViewerService.ts
 *
 * Image viewing service with zoom, pan, rotate, gallery mode,
 * and image management capabilities.
 *
 * Story: VIEW-002 - Image Viewer
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions } from "react-native";

// ============================================================================
// Types
// ============================================================================

/**
 * Image source type
 */
export type ImageSource =
  | {
      uri: string;
      headers?: Record<string, string>;
    }
  | number; // For require() images

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Image metadata
 */
export interface ImageMetadata {
  id: string;
  uri: string;
  filename: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  createdAt?: number;
  modifiedAt?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  exif?: Record<string, unknown>;
}

/**
 * Gallery image item
 */
export interface GalleryImage {
  id: string;
  uri: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
}

/**
 * Zoom state
 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
  focalX: number;
  focalY: number;
}

/**
 * Image viewer settings
 */
export interface ImageViewerSettings {
  // Zoom
  minZoom: number;
  maxZoom: number;
  doubleTapZoom: number;
  enableDoubleTapZoom: boolean;

  // Gestures
  enablePinchZoom: boolean;
  enablePan: boolean;
  enableSwipeToClose: boolean;
  swipeToCloseThreshold: number;

  // Display
  showImageInfo: boolean;
  backgroundColor: string;
  showThumbnails: boolean;

  // Animation
  animationDuration: number;
  springConfig: {
    damping: number;
    stiffness: number;
  };

  // Performance
  enableImageCaching: boolean;
  maxCachedImages: number;
  preloadAdjacent: boolean;
}

/**
 * Image action
 */
export type ImageAction =
  | "share"
  | "save"
  | "rotate"
  | "delete"
  | "info"
  | "copy";

/**
 * Rotation angle
 */
export type RotationAngle = 0 | 90 | 180 | 270;

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  SETTINGS: "@image_viewer_settings",
  RECENT: "@image_viewer_recent",
  FAVORITES: "@image_viewer_favorites",
} as const;

/**
 * Default image viewer settings
 */
export const DEFAULT_IMAGE_SETTINGS: ImageViewerSettings = {
  // Zoom
  minZoom: 1,
  maxZoom: 5,
  doubleTapZoom: 2.5,
  enableDoubleTapZoom: true,

  // Gestures
  enablePinchZoom: true,
  enablePan: true,
  enableSwipeToClose: true,
  swipeToCloseThreshold: 150,

  // Display
  showImageInfo: false,
  backgroundColor: "#000000",
  showThumbnails: false,

  // Animation
  animationDuration: 300,
  springConfig: {
    damping: 15,
    stiffness: 150,
  },

  // Performance
  enableImageCaching: true,
  maxCachedImages: 50,
  preloadAdjacent: true,
};

/**
 * Zoom constraints
 */
export const IMAGE_ZOOM_CONSTRAINTS = {
  MIN: 0.5,
  MAX: 10,
  DEFAULT: 1,
  DOUBLE_TAP: 2.5,
} as const;

/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/heic",
  "image/heif",
] as const;

/**
 * Image format extensions
 */
export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/bmp": ".bmp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get screen dimensions
 */
export function getScreenDimensions(): ImageDimensions {
  const { width, height } = Dimensions.get("window");
  return { width, height };
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  if (height === 0) return 1;
  return width / height;
}

/**
 * Calculate fit dimensions to container
 */
export function calculateFitDimensions(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  mode: "contain" | "cover" = "contain"
): ImageDimensions {
  const imageRatio = calculateAspectRatio(imageWidth, imageHeight);
  const containerRatio = calculateAspectRatio(containerWidth, containerHeight);

  let width: number;
  let height: number;

  if (mode === "contain") {
    if (imageRatio > containerRatio) {
      width = containerWidth;
      height = containerWidth / imageRatio;
    } else {
      height = containerHeight;
      width = containerHeight * imageRatio;
    }
  } else {
    // cover
    if (imageRatio > containerRatio) {
      height = containerHeight;
      width = containerHeight * imageRatio;
    } else {
      width = containerWidth;
      height = containerWidth / imageRatio;
    }
  }

  return { width, height };
}

/**
 * Clamp zoom level
 */
export function clampZoom(
  zoom: number,
  min: number = IMAGE_ZOOM_CONSTRAINTS.MIN,
  max: number = IMAGE_ZOOM_CONSTRAINTS.MAX
): number {
  return Math.max(min, Math.min(max, zoom));
}

/**
 * Calculate zoom from pinch gesture
 */
export function calculatePinchZoom(
  baseScale: number,
  pinchScale: number,
  min: number,
  max: number
): number {
  const newScale = baseScale * pinchScale;
  return clampZoom(newScale, min, max);
}

/**
 * Calculate pan boundaries
 */
export function calculatePanBoundaries(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  scale: number
): { minX: number; maxX: number; minY: number; maxY: number } {
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  const overflowX = Math.max(0, (scaledWidth - containerWidth) / 2);
  const overflowY = Math.max(0, (scaledHeight - containerHeight) / 2);

  return {
    minX: -overflowX,
    maxX: overflowX,
    minY: -overflowY,
    maxY: overflowY,
  };
}

/**
 * Clamp translation within boundaries
 */
export function clampTranslation(
  translateX: number,
  translateY: number,
  boundaries: { minX: number; maxX: number; minY: number; maxY: number }
): { x: number; y: number } {
  return {
    x: Math.max(boundaries.minX, Math.min(boundaries.maxX, translateX)),
    y: Math.max(boundaries.minY, Math.min(boundaries.maxY, translateY)),
  };
}

/**
 * Calculate rotation matrix
 */
export function getRotationTransform(angle: RotationAngle): string {
  return `rotate(${angle}deg)`;
}

/**
 * Get next rotation angle
 */
export function getNextRotation(
  current: RotationAngle,
  clockwise: boolean = true
): RotationAngle {
  const rotations: RotationAngle[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(current);
  const nextIndex = clockwise
    ? (currentIndex + 1) % 4
    : (currentIndex - 1 + 4) % 4;
  return rotations[nextIndex];
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format dimensions
 */
export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

/**
 * Check if URI is local file
 */
export function isLocalFile(uri: string): boolean {
  return (
    uri.startsWith("file://") ||
    uri.startsWith("/") ||
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://")
  );
}

/**
 * Check if URI is remote
 */
export function isRemoteUri(uri: string): boolean {
  return uri.startsWith("http://") || uri.startsWith("https://");
}

/**
 * Get filename from URI
 */
export function getFilenameFromUri(uri: string): string {
  const parts = uri.split("/");
  const filename = parts[parts.length - 1];
  // Remove query params
  return filename.split("?")[0] || "image";
}

/**
 * Get extension from filename
 */
export function getExtensionFromFilename(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : "";
}

/**
 * Check if format is supported
 */
export function isSupportedFormat(mimeType: string): boolean {
  return SUPPORTED_IMAGE_FORMATS.includes(mimeType as any);
}

// ============================================================================
// Settings Management
// ============================================================================

/**
 * Load image viewer settings
 */
export async function loadImageSettings(): Promise<ImageViewerSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_IMAGE_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error("[ImageViewer] Load settings failed:", error);
  }
  return { ...DEFAULT_IMAGE_SETTINGS };
}

/**
 * Save image viewer settings
 */
export async function saveImageSettings(
  settings: Partial<ImageViewerSettings>
): Promise<void> {
  try {
    const current = await loadImageSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("[ImageViewer] Save settings failed:", error);
    throw error;
  }
}

/**
 * Reset settings to default
 */
export async function resetImageSettings(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

// ============================================================================
// Favorites Management
// ============================================================================

/**
 * Load favorite images
 */
export async function loadFavorites(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[ImageViewer] Load favorites failed:", error);
  }
  return [];
}

/**
 * Add to favorites
 */
export async function addToFavorites(imageId: string): Promise<void> {
  const favorites = await loadFavorites();
  if (!favorites.includes(imageId)) {
    favorites.push(imageId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(favorites)
    );
  }
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(imageId: string): Promise<void> {
  const favorites = await loadFavorites();
  const filtered = favorites.filter((id) => id !== imageId);
  await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
}

/**
 * Toggle favorite
 */
export async function toggleFavorite(imageId: string): Promise<boolean> {
  const favorites = await loadFavorites();
  const isFavorite = favorites.includes(imageId);

  if (isFavorite) {
    await removeFromFavorites(imageId);
  } else {
    await addToFavorites(imageId);
  }

  return !isFavorite;
}

/**
 * Check if image is favorite
 */
export async function isFavorite(imageId: string): Promise<boolean> {
  const favorites = await loadFavorites();
  return favorites.includes(imageId);
}

// ============================================================================
// Recent Images
// ============================================================================

/**
 * Load recent images
 */
export async function loadRecentImages(): Promise<GalleryImage[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[ImageViewer] Load recent failed:", error);
  }
  return [];
}

/**
 * Add to recent images
 */
export async function addToRecent(image: GalleryImage): Promise<void> {
  try {
    const recent = await loadRecentImages();

    // Remove if exists
    const filtered = recent.filter((img) => img.id !== image.id);

    // Add to beginning
    filtered.unshift(image);

    // Keep only last 50
    const trimmed = filtered.slice(0, 50);

    await AsyncStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(trimmed));
  } catch (error) {
    console.error("[ImageViewer] Add to recent failed:", error);
  }
}

/**
 * Clear recent images
 */
export async function clearRecentImages(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.RECENT);
}

// ============================================================================
// Image Operations
// ============================================================================

/**
 * Get image info
 */
export async function getImageInfo(
  uri: string
): Promise<Partial<ImageMetadata>> {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    if (!info.exists) {
      throw new Error("File not found");
    }

    const filename = getFilenameFromUri(uri);

    return {
      uri,
      filename,
      fileSize: info.size || 0,
    };
  } catch (error) {
    console.error("[ImageViewer] Get image info failed:", error);
    throw error;
  }
}

/**
 * Share image
 */
export async function shareImage(uri: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn("[ImageViewer] Sharing not available");
      return false;
    }

    await Sharing.shareAsync(uri, {
      dialogTitle: "Chia sẻ ảnh",
    });

    return true;
  } catch (error) {
    console.error("[ImageViewer] Share image failed:", error);
    return false;
  }
}

/**
 * Save image to device gallery
 */
export async function saveImageToGallery(uri: string): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("[ImageViewer] Media library permission denied");
      return false;
    }

    // If remote URI, download first
    let localUri = uri;
    if (isRemoteUri(uri)) {
      const filename = getFilenameFromUri(uri);
      const downloadDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory;
      localUri = `${downloadDir}${filename}`;

      const download = await FileSystem.downloadAsync(uri, localUri);
      localUri = download.uri;
    }

    await MediaLibrary.saveToLibraryAsync(localUri);
    return true;
  } catch (error) {
    console.error("[ImageViewer] Save to gallery failed:", error);
    return false;
  }
}

/**
 * Copy image to clipboard (returns base64)
 */
export async function getImageBase64(uri: string): Promise<string | null> {
  try {
    let localUri = uri;

    // Download if remote
    if (isRemoteUri(uri)) {
      const filename = getFilenameFromUri(uri);
      const downloadDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory;
      localUri = `${downloadDir}${filename}`;

      const download = await FileSystem.downloadAsync(uri, localUri);
      localUri = download.uri;
    }

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  } catch (error) {
    console.error("[ImageViewer] Get base64 failed:", error);
    return null;
  }
}

/**
 * Delete image
 */
export async function deleteImage(uri: string): Promise<boolean> {
  try {
    if (!isLocalFile(uri)) {
      console.warn("[ImageViewer] Cannot delete remote image");
      return false;
    }

    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[ImageViewer] Delete image failed:", error);
    return false;
  }
}

/**
 * Preload image
 */
export async function preloadImage(uri: string): Promise<boolean> {
  try {
    if (isRemoteUri(uri)) {
      const filename = getFilenameFromUri(uri);
      const cacheDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory;
      const localUri = `${cacheDir}images/${filename}`;

      // Check if already cached
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists) {
        return true;
      }

      // Download to cache
      await FileSystem.downloadAsync(uri, localUri);
      return true;
    }
    return true;
  } catch (error) {
    console.error("[ImageViewer] Preload failed:", error);
    return false;
  }
}

/**
 * Preload adjacent images in gallery
 */
export async function preloadAdjacentImages(
  images: GalleryImage[],
  currentIndex: number,
  count: number = 2
): Promise<void> {
  const indicesToPreload: number[] = [];

  for (let i = 1; i <= count; i++) {
    if (currentIndex + i < images.length) {
      indicesToPreload.push(currentIndex + i);
    }
    if (currentIndex - i >= 0) {
      indicesToPreload.push(currentIndex - i);
    }
  }

  await Promise.all(
    indicesToPreload.map((index) => preloadImage(images[index].uri))
  );
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook for image viewer settings
 */
export function useImageSettings() {
  const [settings, setSettings] = useState<ImageViewerSettings>(
    DEFAULT_IMAGE_SETTINGS
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImageSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<ImageViewerSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await saveImageSettings(updates);
    },
    [settings]
  );

  const reset = useCallback(async () => {
    await resetImageSettings();
    setSettings(DEFAULT_IMAGE_SETTINGS);
  }, []);

  return { settings, loading, updateSettings, reset };
}

/**
 * Hook for zoom and pan state
 */
export function useImageZoom(settings: ImageViewerSettings) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotation, setRotation] = useState<RotationAngle>(0);

  const baseScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const reset = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setRotation(0);
    baseScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  }, []);

  const handlePinchStart = useCallback(() => {
    baseScale.current = scale;
  }, [scale]);

  const handlePinch = useCallback(
    (pinchScale: number) => {
      const newScale = calculatePinchZoom(
        baseScale.current,
        pinchScale,
        settings.minZoom,
        settings.maxZoom
      );
      setScale(newScale);
    },
    [settings.minZoom, settings.maxZoom]
  );

  const handlePinchEnd = useCallback(() => {
    baseScale.current = scale;
  }, [scale]);

  const handlePanStart = useCallback(() => {
    lastTranslateX.current = translateX;
    lastTranslateY.current = translateY;
  }, [translateX, translateY]);

  const handlePan = useCallback(
    (
      dx: number,
      dy: number,
      boundaries?: ReturnType<typeof calculatePanBoundaries>
    ) => {
      let newX = lastTranslateX.current + dx;
      let newY = lastTranslateY.current + dy;

      if (boundaries) {
        const clamped = clampTranslation(newX, newY, boundaries);
        newX = clamped.x;
        newY = clamped.y;
      }

      setTranslateX(newX);
      setTranslateY(newY);
    },
    []
  );

  const handleDoubleTap = useCallback(
    (focalX: number, focalY: number) => {
      if (!settings.enableDoubleTapZoom) return;

      if (scale > 1) {
        // Reset to original
        reset();
      } else {
        // Zoom to focal point
        setScale(settings.doubleTapZoom);
        // Calculate offset to center on focal point
        const screen = getScreenDimensions();
        const offsetX =
          (screen.width / 2 - focalX) * (settings.doubleTapZoom - 1);
        const offsetY =
          (screen.height / 2 - focalY) * (settings.doubleTapZoom - 1);
        setTranslateX(offsetX);
        setTranslateY(offsetY);
      }
    },
    [scale, settings.enableDoubleTapZoom, settings.doubleTapZoom, reset]
  );

  const rotate = useCallback((clockwise: boolean = true) => {
    setRotation((prev) => getNextRotation(prev, clockwise));
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) =>
      clampZoom(prev + 0.5, settings.minZoom, settings.maxZoom)
    );
  }, [settings.minZoom, settings.maxZoom]);

  const zoomOut = useCallback(() => {
    setScale((prev) =>
      clampZoom(prev - 0.5, settings.minZoom, settings.maxZoom)
    );
  }, [settings.minZoom, settings.maxZoom]);

  return {
    scale,
    translateX,
    translateY,
    rotation,
    reset,
    handlePinchStart,
    handlePinch,
    handlePinchEnd,
    handlePanStart,
    handlePan,
    handleDoubleTap,
    rotate,
    zoomIn,
    zoomOut,
  };
}

/**
 * Hook for gallery navigation
 */
export function useGallery(images: GalleryImage[], initialIndex: number = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentImage = useMemo(() => {
    return images[currentIndex] || null;
  }, [images, currentIndex]);

  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length && index !== currentIndex) {
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    [images.length, currentIndex]
  );

  const next = useCallback(() => {
    if (hasNext) {
      goTo(currentIndex + 1);
    }
  }, [hasNext, currentIndex, goTo]);

  const prev = useCallback(() => {
    if (hasPrev) {
      goTo(currentIndex - 1);
    }
  }, [hasPrev, currentIndex, goTo]);

  const goToFirst = useCallback(() => goTo(0), [goTo]);
  const goToLast = useCallback(
    () => goTo(images.length - 1),
    [goTo, images.length]
  );

  // Preload adjacent images
  useEffect(() => {
    preloadAdjacentImages(images, currentIndex, 2);
  }, [images, currentIndex]);

  return {
    currentIndex,
    currentImage,
    totalImages: images.length,
    hasNext,
    hasPrev,
    isTransitioning,
    goTo,
    next,
    prev,
    goToFirst,
    goToLast,
  };
}

/**
 * Hook for image viewer
 */
export function useImageViewer(
  images: GalleryImage[],
  initialIndex: number = 0
) {
  const { settings, updateSettings } = useImageSettings();
  const gallery = useGallery(images, initialIndex);
  const zoom = useImageZoom(settings);

  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check favorite status
  useEffect(() => {
    if (gallery.currentImage) {
      isFavorite(gallery.currentImage.id).then(setIsFavorite);
    }
  }, [gallery.currentImage?.id]);

  // Reset zoom when changing images
  useEffect(() => {
    zoom.reset();
  }, [gallery.currentIndex]);

  const toggleInfo = useCallback(() => {
    setShowInfo((prev) => !prev);
  }, []);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  const handleToggleFavorite = useCallback(async () => {
    if (gallery.currentImage) {
      const newState = await toggleFavorite(gallery.currentImage.id);
      setIsFavorite(newState);
      return newState;
    }
    return false;
  }, [gallery.currentImage]);

  const handleShare = useCallback(async () => {
    if (gallery.currentImage) {
      return shareImage(gallery.currentImage.uri);
    }
    return false;
  }, [gallery.currentImage]);

  const handleSave = useCallback(async () => {
    if (gallery.currentImage) {
      return saveImageToGallery(gallery.currentImage.uri);
    }
    return false;
  }, [gallery.currentImage]);

  const handleDelete = useCallback(async () => {
    if (gallery.currentImage) {
      const success = await deleteImage(gallery.currentImage.uri);
      if (success && gallery.hasNext) {
        gallery.next();
      } else if (success && gallery.hasPrev) {
        gallery.prev();
      }
      return success;
    }
    return false;
  }, [gallery]);

  return {
    // Settings
    settings,
    updateSettings,

    // Gallery
    ...gallery,

    // Zoom
    ...zoom,

    // UI state
    showInfo,
    showControls,
    isFavorite,

    // Actions
    toggleInfo,
    toggleControls,
    toggleFavorite: handleToggleFavorite,
    share: handleShare,
    save: handleSave,
    delete: handleDelete,
  };
}

// ============================================================================
// Service Class (Singleton)
// ============================================================================

class ImageViewerServiceClass {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await loadImageSettings();

    this.initialized = true;
    console.log("[ImageViewer] Service initialized");
  }

  // Settings
  async getSettings() {
    return loadImageSettings();
  }

  async updateSettings(settings: Partial<ImageViewerSettings>) {
    return saveImageSettings(settings);
  }

  // Favorites
  async getFavorites() {
    return loadFavorites();
  }

  async toggleFavorite(imageId: string) {
    return toggleFavorite(imageId);
  }

  // Recent
  async getRecent() {
    return loadRecentImages();
  }

  async addToRecent(image: GalleryImage) {
    return addToRecent(image);
  }

  // Operations
  async share(uri: string) {
    return shareImage(uri);
  }

  async saveToGallery(uri: string) {
    return saveImageToGallery(uri);
  }

  async delete(uri: string) {
    return deleteImage(uri);
  }

  async preload(uri: string) {
    return preloadImage(uri);
  }
}

export const ImageViewerService = new ImageViewerServiceClass();
export default ImageViewerService;
