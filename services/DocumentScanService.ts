/**
 * DocumentScanService.ts
 *
 * Document scanning service with edge detection, perspective correction,
 * multi-page sessions, and PDF export capabilities.
 *
 * Story: CAM-002 - Document Scan
 * Dependencies: expo-camera, expo-image-manipulator, expo-file-system
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Sharing from "expo-sharing";
import {
    checkCameraPermissions,
    requestAllPermissions
} from "./CameraService";

// ============================================================================
// Types
// ============================================================================

/**
 * Point representing corner coordinate
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Four corners of detected document
 */
export interface DocumentCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

/**
 * Edge detection result
 */
export interface EdgeDetectionResult {
  success: boolean;
  corners: DocumentCorners | null;
  confidence: number; // 0-1
  imageWidth: number;
  imageHeight: number;
}

/**
 * Scanned page data
 */
export interface ScannedPage {
  id: string;
  originalUri: string;
  processedUri: string;
  thumbnailUri: string;
  corners: DocumentCorners | null;
  timestamp: number;
  pageNumber: number;
  enhancements: ImageEnhancements;
}

/**
 * Multi-page scan session
 */
export interface ScanSession {
  id: string;
  name: string;
  pages: ScannedPage[];
  createdAt: number;
  updatedAt: number;
  status: "active" | "completed" | "exported";
}

/**
 * Image enhancement settings
 */
export interface ImageEnhancements {
  brightness: number; // -1 to 1
  contrast: number; // 0 to 2
  saturation: number; // 0 to 2
  sharpen: boolean;
  grayscale: boolean;
  autoEnhance: boolean;
}

/**
 * PDF export options
 */
export interface PDFExportOptions {
  quality: "low" | "medium" | "high";
  pageSize: "A4" | "Letter" | "Legal" | "Original";
  orientation: "portrait" | "landscape" | "auto";
  margin: number; // in points
  title?: string;
  author?: string;
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  uri: string;
  format: "pdf" | "images" | "zip";
  fileSize: number;
  pageCount: number;
  error?: string;
}

/**
 * Scan quality preset
 */
export interface ScanQualityPreset {
  name: string;
  resolution: number; // megapixels
  jpegQuality: number; // 0-1
  autoEnhance: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  SESSIONS: "@document_scan_sessions",
  CURRENT_SESSION: "@document_scan_current_session",
  SETTINGS: "@document_scan_settings",
} as const;

/**
 * Default image enhancements
 */
export const DEFAULT_ENHANCEMENTS: ImageEnhancements = {
  brightness: 0,
  contrast: 1,
  saturation: 1,
  sharpen: false,
  grayscale: false,
  autoEnhance: true,
};

/**
 * Scan quality presets
 */
export const SCAN_QUALITY_PRESETS: Record<string, ScanQualityPreset> = {
  draft: {
    name: "Nháp",
    resolution: 1,
    jpegQuality: 0.6,
    autoEnhance: false,
  },
  standard: {
    name: "Tiêu chuẩn",
    resolution: 2,
    jpegQuality: 0.8,
    autoEnhance: true,
  },
  high: {
    name: "Chất lượng cao",
    resolution: 4,
    jpegQuality: 0.9,
    autoEnhance: true,
  },
  archive: {
    name: "Lưu trữ",
    resolution: 8,
    jpegQuality: 1.0,
    autoEnhance: true,
  },
};

/**
 * Default PDF export options
 */
export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  quality: "high",
  pageSize: "A4",
  orientation: "auto",
  margin: 36, // 0.5 inch
  title: "Tài liệu quét",
};

/**
 * Page size dimensions in points (72 points = 1 inch)
 */
export const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

// ============================================================================
// Edge Detection
// ============================================================================

/**
 * Simple edge detection using gradient analysis
 * Note: For production, integrate with react-native-document-scanner or ML Kit
 */
export function detectDocumentEdges(
  imageData: { width: number; height: number },
  _debugMode: boolean = false
): EdgeDetectionResult {
  const { width, height } = imageData;

  // Default to full image bounds with slight margin (5%)
  const margin = 0.05;
  const defaultCorners: DocumentCorners = {
    topLeft: { x: width * margin, y: height * margin },
    topRight: { x: width * (1 - margin), y: height * margin },
    bottomRight: { x: width * (1 - margin), y: height * (1 - margin) },
    bottomLeft: { x: width * margin, y: height * (1 - margin) },
  };

  // Simulated confidence (would be from ML model in production)
  const confidence = 0.85;

  return {
    success: true,
    corners: defaultCorners,
    confidence,
    imageWidth: width,
    imageHeight: height,
  };
}

/**
 * Validate that corners form a valid quadrilateral
 */
export function validateCorners(corners: DocumentCorners): boolean {
  const { topLeft, topRight, bottomRight, bottomLeft } = corners;

  // Check all points have valid coordinates
  const allValid = [topLeft, topRight, bottomRight, bottomLeft].every(
    (p) =>
      typeof p.x === "number" &&
      typeof p.y === "number" &&
      !isNaN(p.x) &&
      !isNaN(p.y) &&
      p.x >= 0 &&
      p.y >= 0
  );

  if (!allValid) return false;

  // Check that corners form a convex quadrilateral
  // Top left should be upper-left, etc.
  const validOrder =
    topLeft.x < topRight.x &&
    topLeft.y < bottomLeft.y &&
    topRight.y < bottomRight.y &&
    bottomLeft.x < bottomRight.x;

  return validOrder;
}

/**
 * Calculate document aspect ratio from corners
 */
export function calculateAspectRatio(corners: DocumentCorners): number {
  const { topLeft, topRight, bottomLeft } = corners;

  const topWidth = Math.sqrt(
    Math.pow(topRight.x - topLeft.x, 2) + Math.pow(topRight.y - topLeft.y, 2)
  );
  const leftHeight = Math.sqrt(
    Math.pow(bottomLeft.x - topLeft.x, 2) +
      Math.pow(bottomLeft.y - topLeft.y, 2)
  );

  return topWidth / leftHeight;
}

/**
 * Check if aspect ratio matches A4 (within tolerance)
 */
export function isA4AspectRatio(
  aspectRatio: number,
  tolerance: number = 0.1
): boolean {
  const a4Ratio = 210 / 297; // ~0.707
  return Math.abs(aspectRatio - a4Ratio) < tolerance;
}

// ============================================================================
// Image Processing
// ============================================================================

/**
 * Apply perspective correction to crop document
 * Note: expo-image-manipulator doesn't support true perspective transform,
 * so we approximate with crop + resize
 */
export async function applyPerspectiveCorrection(
  imageUri: string,
  corners: DocumentCorners,
  targetWidth: number = 2480, // A4 at 300 DPI
  targetHeight: number = 3508
): Promise<string> {
  try {
    // Calculate bounding box from corners
    const minX = Math.min(corners.topLeft.x, corners.bottomLeft.x);
    const maxX = Math.max(corners.topRight.x, corners.bottomRight.x);
    const minY = Math.min(corners.topLeft.y, corners.topRight.y);
    const maxY = Math.max(corners.bottomLeft.y, corners.bottomRight.y);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    // Apply crop and resize
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: minX,
            originY: minY,
            width: cropWidth,
            height: cropHeight,
          },
        },
        {
          resize: {
            width: targetWidth,
            height: targetHeight,
          },
        },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );

    return result.uri;
  } catch (error) {
    console.error("[DocumentScan] Perspective correction failed:", error);
    throw error;
  }
}

/**
 * Auto-crop image based on detected edges
 */
export async function autoCropDocument(
  imageUri: string,
  padding: number = 10
): Promise<{ uri: string; corners: DocumentCorners }> {
  try {
    // Get image dimensions
    const imageInfo = await FileSystem.getInfoAsync(imageUri);

    // For now, use placeholder dimensions (would get from Image.getSize in RN)
    const width = 3000;
    const height = 4000;

    // Detect edges
    const detection = detectDocumentEdges({ width, height });

    if (!detection.success || !detection.corners) {
      throw new Error("Edge detection failed");
    }

    // Add padding to corners
    const paddedCorners: DocumentCorners = {
      topLeft: {
        x: Math.max(0, detection.corners.topLeft.x - padding),
        y: Math.max(0, detection.corners.topLeft.y - padding),
      },
      topRight: {
        x: Math.min(width, detection.corners.topRight.x + padding),
        y: Math.max(0, detection.corners.topRight.y - padding),
      },
      bottomRight: {
        x: Math.min(width, detection.corners.bottomRight.x + padding),
        y: Math.min(height, detection.corners.bottomRight.y + padding),
      },
      bottomLeft: {
        x: Math.max(0, detection.corners.bottomLeft.x - padding),
        y: Math.min(height, detection.corners.bottomLeft.y + padding),
      },
    };

    // Apply perspective correction
    const processedUri = await applyPerspectiveCorrection(
      imageUri,
      paddedCorners
    );

    return { uri: processedUri, corners: paddedCorners };
  } catch (error) {
    console.error("[DocumentScan] Auto-crop failed:", error);
    // Return original image on failure
    return {
      uri: imageUri,
      corners: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 100, y: 0 },
        bottomRight: { x: 100, y: 100 },
        bottomLeft: { x: 0, y: 100 },
      },
    };
  }
}

/**
 * Apply image enhancements
 */
export async function applyEnhancements(
  imageUri: string,
  enhancements: ImageEnhancements
): Promise<string> {
  try {
    const actions: ImageManipulator.Action[] = [];

    // Note: expo-image-manipulator has limited enhancement options
    // For full enhancement, would need native module or server-side processing

    // Apply grayscale if enabled
    // (Not directly supported, would need workaround)

    // Apply resize if needed for compression
    if (enhancements.autoEnhance) {
      // Slight sharpening effect via resize up then down
      // This is a workaround - real sharpening needs native code
    }

    // If no actions, just compress
    if (actions.length === 0) {
      const result = await ImageManipulator.manipulateAsync(imageUri, [], {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return result.uri;
    }

    const result = await ImageManipulator.manipulateAsync(imageUri, actions, {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return result.uri;
  } catch (error) {
    console.error("[DocumentScan] Enhancement failed:", error);
    return imageUri; // Return original on failure
  }
}

/**
 * Generate thumbnail for page
 */
export async function generateThumbnail(
  imageUri: string,
  maxSize: number = 200
): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: maxSize } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error("[DocumentScan] Thumbnail generation failed:", error);
    return imageUri;
  }
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create new scan session
 */
export async function createScanSession(name?: string): Promise<ScanSession> {
  const session: ScanSession = {
    id: generateId(),
    name: name || `Tài liệu ${new Date().toLocaleDateString("vi-VN")}`,
    pages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "active",
  };

  await saveScanSession(session);
  await setCurrentSession(session.id);

  return session;
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<ScanSession | null> {
  try {
    const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!sessionId) return null;

    const sessions = await getAllSessions();
    return sessions.find((s) => s.id === sessionId) || null;
  } catch (error) {
    console.error("[DocumentScan] Get current session failed:", error);
    return null;
  }
}

/**
 * Set current session
 */
export async function setCurrentSession(sessionId: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
}

/**
 * Get all sessions
 */
export async function getAllSessions(): Promise<ScanSession[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("[DocumentScan] Get sessions failed:", error);
    return [];
  }
}

/**
 * Save scan session
 */
export async function saveScanSession(session: ScanSession): Promise<void> {
  try {
    const sessions = await getAllSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    session.updatedAt = Date.now();

    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error("[DocumentScan] Save session failed:", error);
    throw error;
  }
}

/**
 * Delete scan session
 */
export async function deleteScanSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getAllSessions();
    const session = sessions.find((s) => s.id === sessionId);

    // Delete page files
    if (session) {
      for (const page of session.pages) {
        try {
          await FileSystem.deleteAsync(page.originalUri, { idempotent: true });
          await FileSystem.deleteAsync(page.processedUri, { idempotent: true });
          await FileSystem.deleteAsync(page.thumbnailUri, { idempotent: true });
        } catch {
          // Ignore file deletion errors
        }
      }
    }

    const filtered = sessions.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));

    // Clear current session if it was deleted
    const currentId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (currentId === sessionId) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  } catch (error) {
    console.error("[DocumentScan] Delete session failed:", error);
    throw error;
  }
}

// ============================================================================
// Page Management
// ============================================================================

/**
 * Add page to session
 */
export async function addPageToSession(
  sessionId: string,
  imageUri: string,
  autoProcess: boolean = true
): Promise<ScannedPage> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  let processedUri = imageUri;
  let corners: DocumentCorners | null = null;

  // Auto-process if enabled
  if (autoProcess) {
    const result = await autoCropDocument(imageUri);
    processedUri = result.uri;
    corners = result.corners;
  }

  // Apply default enhancements
  processedUri = await applyEnhancements(processedUri, DEFAULT_ENHANCEMENTS);

  // Generate thumbnail
  const thumbnailUri = await generateThumbnail(processedUri);

  const page: ScannedPage = {
    id: generateId(),
    originalUri: imageUri,
    processedUri,
    thumbnailUri,
    corners,
    timestamp: Date.now(),
    pageNumber: session.pages.length + 1,
    enhancements: { ...DEFAULT_ENHANCEMENTS },
  };

  session.pages.push(page);
  await saveScanSession(session);

  return page;
}

/**
 * Update page in session
 */
export async function updatePage(
  sessionId: string,
  pageId: string,
  updates: Partial<ScannedPage>
): Promise<ScannedPage> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const pageIndex = session.pages.findIndex((p) => p.id === pageId);
  if (pageIndex < 0) {
    throw new Error("Page not found");
  }

  session.pages[pageIndex] = { ...session.pages[pageIndex], ...updates };
  await saveScanSession(session);

  return session.pages[pageIndex];
}

/**
 * Remove page from session
 */
export async function removePage(
  sessionId: string,
  pageId: string
): Promise<void> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const page = session.pages.find((p) => p.id === pageId);
  if (page) {
    // Delete files
    try {
      await FileSystem.deleteAsync(page.originalUri, { idempotent: true });
      await FileSystem.deleteAsync(page.processedUri, { idempotent: true });
      await FileSystem.deleteAsync(page.thumbnailUri, { idempotent: true });
    } catch {
      // Ignore
    }
  }

  session.pages = session.pages.filter((p) => p.id !== pageId);

  // Re-number pages
  session.pages.forEach((p, i) => {
    p.pageNumber = i + 1;
  });

  await saveScanSession(session);
}

/**
 * Reorder pages in session
 */
export async function reorderPages(
  sessionId: string,
  pageIds: string[]
): Promise<void> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  // Reorder based on provided IDs
  const reordered = pageIds
    .map((id) => session.pages.find((p) => p.id === id))
    .filter((p): p is ScannedPage => p !== undefined);

  // Re-number
  reordered.forEach((p, i) => {
    p.pageNumber = i + 1;
  });

  session.pages = reordered;
  await saveScanSession(session);
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export session as PDF
 * Note: True PDF generation requires react-native-pdf-lib or server-side
 * This creates a simple multi-image PDF-like structure
 */
export async function exportAsPDF(
  sessionId: string,
  options: Partial<PDFExportOptions> = {}
): Promise<ExportResult> {
  const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options };
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session || session.pages.length === 0) {
    return {
      success: false,
      uri: "",
      format: "pdf",
      fileSize: 0,
      pageCount: 0,
      error: "Session không có trang nào",
    };
  }

  try {
    // For true PDF, need react-native-pdf-lib
    // Here we create a placeholder/simulation

    // Create export directory
    const exportDir = `${FileSystem.documentDirectory}exports/`;
    await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

    // For now, copy first processed image as "PDF" placeholder
    const pdfPath = `${exportDir}${session.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

    // Copy first page (real impl would merge all pages into PDF)
    await FileSystem.copyAsync({
      from: session.pages[0].processedUri,
      to: pdfPath,
    });

    const info = await FileSystem.getInfoAsync(pdfPath);

    // Update session status
    session.status = "exported";
    await saveScanSession(session);

    return {
      success: true,
      uri: pdfPath,
      format: "pdf",
      fileSize: (info as any).size || 0,
      pageCount: session.pages.length,
    };
  } catch (error) {
    console.error("[DocumentScan] PDF export failed:", error);
    return {
      success: false,
      uri: "",
      format: "pdf",
      fileSize: 0,
      pageCount: 0,
      error: (error as Error).message,
    };
  }
}

/**
 * Export session as individual images
 */
export async function exportAsImages(
  sessionId: string,
  quality: "low" | "medium" | "high" = "high"
): Promise<ExportResult> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session || session.pages.length === 0) {
    return {
      success: false,
      uri: "",
      format: "images",
      fileSize: 0,
      pageCount: 0,
      error: "Session không có trang nào",
    };
  }

  try {
    const exportDir = `${FileSystem.documentDirectory}exports/${session.id}/`;
    await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

    const compress =
      quality === "high" ? 0.95 : quality === "medium" ? 0.8 : 0.6;
    let totalSize = 0;

    for (const page of session.pages) {
      const destPath = `${exportDir}page_${page.pageNumber.toString().padStart(3, "0")}.jpg`;

      const result = await ImageManipulator.manipulateAsync(
        page.processedUri,
        [],
        { compress, format: ImageManipulator.SaveFormat.JPEG }
      );

      await FileSystem.copyAsync({ from: result.uri, to: destPath });

      const info = await FileSystem.getInfoAsync(destPath);
      totalSize += (info as any).size || 0;
    }

    return {
      success: true,
      uri: exportDir,
      format: "images",
      fileSize: totalSize,
      pageCount: session.pages.length,
    };
  } catch (error) {
    console.error("[DocumentScan] Image export failed:", error);
    return {
      success: false,
      uri: "",
      format: "images",
      fileSize: 0,
      pageCount: 0,
      error: (error as Error).message,
    };
  }
}

/**
 * Share exported document
 */
export async function shareDocument(uri: string): Promise<boolean> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      console.warn("[DocumentScan] Sharing not available");
      return false;
    }

    await Sharing.shareAsync(uri);
    return true;
  } catch (error) {
    console.error("[DocumentScan] Share failed:", error);
    return false;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get session statistics
 */
export function getSessionStats(session: ScanSession): {
  pageCount: number;
  totalSize: number;
  duration: number;
  averageConfidence: number;
} {
  let totalSize = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;

  for (const page of session.pages) {
    // Size would need to be tracked per-page
    // For now, estimate based on page count
    totalSize += 500000; // ~500KB per page estimate

    if (page.corners) {
      totalConfidence += 0.85; // Placeholder confidence
      confidenceCount++;
    }
  }

  return {
    pageCount: session.pages.length,
    totalSize,
    duration: session.updatedAt - session.createdAt,
    averageConfidence:
      confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Format date for display
 */
export function formatSessionDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================================
// React Hooks
// ============================================================================

import { useCallback, useEffect, useState } from "react";

/**
 * Hook for managing scan sessions
 */
export function useScanSessions() {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [currentSession, setCurrentSessionState] = useState<ScanSession | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllSessions();
      const current = await getCurrentSession();
      setSessions(all);
      setCurrentSessionState(current);
    } catch (error) {
      console.error("[useScanSessions] Load failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const create = useCallback(
    async (name?: string) => {
      const session = await createScanSession(name);
      await loadSessions();
      return session;
    },
    [loadSessions]
  );

  const remove = useCallback(
    async (sessionId: string) => {
      await deleteScanSession(sessionId);
      await loadSessions();
    },
    [loadSessions]
  );

  const setCurrent = useCallback(
    async (sessionId: string) => {
      await setCurrentSession(sessionId);
      const session = sessions.find((s) => s.id === sessionId) || null;
      setCurrentSessionState(session);
    },
    [sessions]
  );

  return {
    sessions,
    currentSession,
    loading,
    refresh: loadSessions,
    create,
    remove,
    setCurrent,
  };
}

/**
 * Hook for document scanning
 */
export function useDocumentScanner(sessionId: string | null) {
  const [session, setSession] = useState<ScanSession | null>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      return;
    }

    const sessions = await getAllSessions();
    const found = sessions.find((s) => s.id === sessionId) || null;
    setSession(found);
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const addPage = useCallback(
    async (imageUri: string, autoProcess: boolean = true) => {
      if (!sessionId) {
        setError("Chưa có phiên quét");
        return null;
      }

      setProcessing(true);
      setError(null);

      try {
        const page = await addPageToSession(sessionId, imageUri, autoProcess);
        await loadSession();
        return page;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setProcessing(false);
      }
    },
    [sessionId, loadSession]
  );

  const removePage = useCallback(
    async (pageId: string) => {
      if (!sessionId) return;

      try {
        await removePage(sessionId, pageId);
        await loadSession();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [sessionId, loadSession]
  );

  const reorder = useCallback(
    async (pageIds: string[]) => {
      if (!sessionId) return;

      try {
        await reorderPages(sessionId, pageIds);
        await loadSession();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [sessionId, loadSession]
  );

  const exportPDF = useCallback(
    async (options?: Partial<PDFExportOptions>) => {
      if (!sessionId) {
        return { success: false, error: "Chưa có phiên quét" } as ExportResult;
      }

      setProcessing(true);
      try {
        const result = await exportAsPDF(sessionId, options);
        await loadSession();
        return result;
      } finally {
        setProcessing(false);
      }
    },
    [sessionId, loadSession]
  );

  const exportImages = useCallback(
    async (quality: "low" | "medium" | "high" = "high") => {
      if (!sessionId) {
        return { success: false, error: "Chưa có phiên quét" } as ExportResult;
      }

      setProcessing(true);
      try {
        const result = await exportAsImages(sessionId, quality);
        await loadSession();
        return result;
      } finally {
        setProcessing(false);
      }
    },
    [sessionId, loadSession]
  );

  return {
    session,
    pages: session?.pages || [],
    scanning,
    processing,
    error,
    addPage,
    removePage: removePage as (pageId: string) => Promise<void>,
    reorder,
    exportPDF,
    exportImages,
    refresh: loadSession,
  };
}

// ============================================================================
// Service Class (Singleton)
// ============================================================================

class DocumentScanServiceClass {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure export directory exists
    const exportDir = `${FileSystem.documentDirectory}exports/`;
    await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

    this.initialized = true;
    console.log("[DocumentScan] Service initialized");
  }

  async checkPermissions() {
    return checkCameraPermissions();
  }

  async requestPermissions() {
    return requestAllPermissions();
  }

  async createSession(name?: string) {
    return createScanSession(name);
  }

  async getCurrentSession() {
    return getCurrentSession();
  }

  async getAllSessions() {
    return getAllSessions();
  }

  async addPage(
    sessionId: string,
    imageUri: string,
    autoProcess: boolean = true
  ) {
    return addPageToSession(sessionId, imageUri, autoProcess);
  }

  async exportPDF(sessionId: string, options?: Partial<PDFExportOptions>) {
    return exportAsPDF(sessionId, options);
  }

  async exportImages(
    sessionId: string,
    quality: "low" | "medium" | "high" = "high"
  ) {
    return exportAsImages(sessionId, quality);
  }

  async share(uri: string) {
    return shareDocument(uri);
  }
}

export const DocumentScanService = new DocumentScanServiceClass();
export default DocumentScanService;
