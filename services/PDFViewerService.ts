/**
 * PDFViewerService.ts
 *
 * PDF viewing service with page navigation, search, bookmarks,
 * thumbnails, and reading preferences.
 *
 * Story: VIEW-001 - PDF Viewer
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * PDF document metadata
 */
export interface PDFDocument {
  id: string;
  uri: string;
  filename: string;
  totalPages: number;
  fileSize: number;
  createdAt: number;
  lastOpenedAt: number;
  lastPage: number;
}

/**
 * PDF page info
 */
export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
}

/**
 * Bookmark entry
 */
export interface Bookmark {
  id: string;
  documentId: string;
  pageNumber: number;
  label?: string;
  createdAt: number;
  color?: string;
}

/**
 * Search result
 */
export interface SearchResult {
  pageNumber: number;
  text: string;
  rects: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

/**
 * Reading progress
 */
export interface ReadingProgress {
  documentId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: number;
}

/**
 * PDF viewer settings
 */
export interface PDFViewerSettings {
  // Display
  defaultZoom: number;
  fitMode: "width" | "height" | "page";
  scrollDirection: "horizontal" | "vertical";
  pageSpacing: number;
  showPageNumbers: boolean;

  // Reading
  nightMode: boolean;
  brightness: number;
  keepScreenAwake: boolean;

  // Performance
  enableCaching: boolean;
  maxCachedPages: number;
  renderAhead: number;

  // Interaction
  enableDoubleTapZoom: boolean;
  doubleTapZoomScale: number;
  enableSwipeNavigation: boolean;
}

/**
 * Thumbnail data
 */
export interface Thumbnail {
  pageNumber: number;
  uri: string;
  width: number;
  height: number;
}

/**
 * Annotation (highlight, note)
 */
export interface Annotation {
  id: string;
  documentId: string;
  pageNumber: number;
  type: "highlight" | "underline" | "note" | "strikethrough";
  color: string;
  rects?: Array<{ x: number; y: number; width: number; height: number }>;
  text?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  SETTINGS: "@pdf_viewer_settings",
  BOOKMARKS: "@pdf_bookmarks",
  PROGRESS: "@pdf_reading_progress",
  RECENT: "@pdf_recent_documents",
  ANNOTATIONS: "@pdf_annotations",
} as const;

/**
 * Default PDF viewer settings
 */
export const DEFAULT_PDF_SETTINGS: PDFViewerSettings = {
  // Display
  defaultZoom: 1.0,
  fitMode: "width",
  scrollDirection: "vertical",
  pageSpacing: 10,
  showPageNumbers: true,

  // Reading
  nightMode: false,
  brightness: 1.0,
  keepScreenAwake: true,

  // Performance
  enableCaching: true,
  maxCachedPages: 10,
  renderAhead: 2,

  // Interaction
  enableDoubleTapZoom: true,
  doubleTapZoomScale: 2.5,
  enableSwipeNavigation: true,
};

/**
 * Zoom constraints
 */
export const ZOOM_CONSTRAINTS = {
  MIN: 0.5,
  MAX: 5.0,
  STEP: 0.25,
  DEFAULT: 1.0,
} as const;

/**
 * Bookmark colors
 */
export const BOOKMARK_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
] as const;

/**
 * Annotation colors
 */
export const ANNOTATION_COLORS = {
  highlight: ["#FFFF00", "#00FF00", "#00FFFF", "#FF00FF", "#FFA500"],
  underline: ["#FF0000", "#0000FF", "#008000", "#800080"],
  strikethrough: ["#FF0000", "#000000"],
} as const;

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
 * Calculate reading percentage
 */
export function calculateProgress(
  currentPage: number,
  totalPages: number
): number {
  if (totalPages <= 0) return 0;
  return Math.round((currentPage / totalPages) * 100);
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
 * Format page range
 */
export function formatPageRange(current: number, total: number): string {
  return `${current} / ${total}`;
}

/**
 * Calculate zoom to fit width
 */
export function calculateFitWidth(
  pageWidth: number,
  containerWidth: number,
  padding: number = 20
): number {
  return (containerWidth - padding * 2) / pageWidth;
}

/**
 * Calculate zoom to fit height
 */
export function calculateFitHeight(
  pageHeight: number,
  containerHeight: number,
  padding: number = 20
): number {
  return (containerHeight - padding * 2) / pageHeight;
}

/**
 * Calculate zoom to fit page
 */
export function calculateFitPage(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: number = 20
): number {
  const fitWidth = calculateFitWidth(pageWidth, containerWidth, padding);
  const fitHeight = calculateFitHeight(pageHeight, containerHeight, padding);
  return Math.min(fitWidth, fitHeight);
}

/**
 * Clamp zoom level
 */
export function clampZoom(zoom: number): number {
  return Math.max(ZOOM_CONSTRAINTS.MIN, Math.min(ZOOM_CONSTRAINTS.MAX, zoom));
}

/**
 * Get estimated reading time (minutes)
 * Based on average 2 minutes per page
 */
export function estimateReadingTime(
  totalPages: number,
  pagesRead: number = 0
): number {
  const remainingPages = totalPages - pagesRead;
  return Math.ceil(remainingPages * 2);
}

/**
 * Format reading time
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
}

// ============================================================================
// Settings Management
// ============================================================================

/**
 * Load PDF viewer settings
 */
export async function loadPDFSettings(): Promise<PDFViewerSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_PDF_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error("[PDFViewer] Load settings failed:", error);
  }
  return { ...DEFAULT_PDF_SETTINGS };
}

/**
 * Save PDF viewer settings
 */
export async function savePDFSettings(
  settings: Partial<PDFViewerSettings>
): Promise<void> {
  try {
    const current = await loadPDFSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("[PDFViewer] Save settings failed:", error);
    throw error;
  }
}

/**
 * Reset settings to default
 */
export async function resetPDFSettings(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

// ============================================================================
// Bookmarks Management
// ============================================================================

/**
 * Load all bookmarks
 */
export async function loadBookmarks(): Promise<Bookmark[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[PDFViewer] Load bookmarks failed:", error);
  }
  return [];
}

/**
 * Get bookmarks for a document
 */
export async function getDocumentBookmarks(
  documentId: string
): Promise<Bookmark[]> {
  const bookmarks = await loadBookmarks();
  return bookmarks
    .filter((b) => b.documentId === documentId)
    .sort((a, b) => a.pageNumber - b.pageNumber);
}

/**
 * Add bookmark
 */
export async function addBookmark(
  documentId: string,
  pageNumber: number,
  label?: string,
  color?: string
): Promise<Bookmark> {
  const bookmarks = await loadBookmarks();

  // Check if bookmark exists
  const existing = bookmarks.find(
    (b) => b.documentId === documentId && b.pageNumber === pageNumber
  );
  if (existing) {
    return existing;
  }

  const bookmark: Bookmark = {
    id: generateId(),
    documentId,
    pageNumber,
    label,
    color: color || BOOKMARK_COLORS[0],
    createdAt: Date.now(),
  };

  bookmarks.push(bookmark);
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));

  return bookmark;
}

/**
 * Remove bookmark
 */
export async function removeBookmark(id: string): Promise<void> {
  const bookmarks = await loadBookmarks();
  const filtered = bookmarks.filter((b) => b.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
}

/**
 * Remove bookmark by page
 */
export async function removeBookmarkByPage(
  documentId: string,
  pageNumber: number
): Promise<void> {
  const bookmarks = await loadBookmarks();
  const filtered = bookmarks.filter(
    (b) => !(b.documentId === documentId && b.pageNumber === pageNumber)
  );
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
}

/**
 * Update bookmark
 */
export async function updateBookmark(
  id: string,
  updates: Partial<Bookmark>
): Promise<void> {
  const bookmarks = await loadBookmarks();
  const index = bookmarks.findIndex((b) => b.id === id);
  if (index >= 0) {
    bookmarks[index] = { ...bookmarks[index], ...updates };
    await AsyncStorage.setItem(
      STORAGE_KEYS.BOOKMARKS,
      JSON.stringify(bookmarks)
    );
  }
}

/**
 * Check if page is bookmarked
 */
export async function isPageBookmarked(
  documentId: string,
  pageNumber: number
): Promise<boolean> {
  const bookmarks = await loadBookmarks();
  return bookmarks.some(
    (b) => b.documentId === documentId && b.pageNumber === pageNumber
  );
}

/**
 * Toggle bookmark
 */
export async function toggleBookmark(
  documentId: string,
  pageNumber: number,
  label?: string
): Promise<{ isBookmarked: boolean; bookmark?: Bookmark }> {
  const isMarked = await isPageBookmarked(documentId, pageNumber);

  if (isMarked) {
    await removeBookmarkByPage(documentId, pageNumber);
    return { isBookmarked: false };
  } else {
    const bookmark = await addBookmark(documentId, pageNumber, label);
    return { isBookmarked: true, bookmark };
  }
}

// ============================================================================
// Reading Progress
// ============================================================================

/**
 * Load all reading progress
 */
export async function loadAllProgress(): Promise<
  Record<string, ReadingProgress>
> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[PDFViewer] Load progress failed:", error);
  }
  return {};
}

/**
 * Get reading progress for a document
 */
export async function getReadingProgress(
  documentId: string
): Promise<ReadingProgress | null> {
  const progress = await loadAllProgress();
  return progress[documentId] || null;
}

/**
 * Save reading progress
 */
export async function saveReadingProgress(
  documentId: string,
  currentPage: number,
  totalPages: number
): Promise<ReadingProgress> {
  const allProgress = await loadAllProgress();

  const progress: ReadingProgress = {
    documentId,
    currentPage,
    totalPages,
    percentage: calculateProgress(currentPage, totalPages),
    lastReadAt: Date.now(),
  };

  allProgress[documentId] = progress;
  await AsyncStorage.setItem(
    STORAGE_KEYS.PROGRESS,
    JSON.stringify(allProgress)
  );

  return progress;
}

/**
 * Clear reading progress
 */
export async function clearReadingProgress(documentId: string): Promise<void> {
  const allProgress = await loadAllProgress();
  delete allProgress[documentId];
  await AsyncStorage.setItem(
    STORAGE_KEYS.PROGRESS,
    JSON.stringify(allProgress)
  );
}

// ============================================================================
// Recent Documents
// ============================================================================

/**
 * Load recent documents
 */
export async function loadRecentDocuments(): Promise<PDFDocument[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[PDFViewer] Load recent docs failed:", error);
  }
  return [];
}

/**
 * Add to recent documents
 */
export async function addToRecent(document: PDFDocument): Promise<void> {
  try {
    const recent = await loadRecentDocuments();

    // Remove if exists
    const filtered = recent.filter((d) => d.id !== document.id);

    // Add to beginning
    filtered.unshift({
      ...document,
      lastOpenedAt: Date.now(),
    });

    // Keep only last 20
    const trimmed = filtered.slice(0, 20);

    await AsyncStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(trimmed));
  } catch (error) {
    console.error("[PDFViewer] Add to recent failed:", error);
  }
}

/**
 * Remove from recent
 */
export async function removeFromRecent(documentId: string): Promise<void> {
  const recent = await loadRecentDocuments();
  const filtered = recent.filter((d) => d.id !== documentId);
  await AsyncStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(filtered));
}

/**
 * Clear recent documents
 */
export async function clearRecentDocuments(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.RECENT);
}

// ============================================================================
// Annotations
// ============================================================================

/**
 * Load all annotations
 */
export async function loadAnnotations(): Promise<Annotation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ANNOTATIONS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[PDFViewer] Load annotations failed:", error);
  }
  return [];
}

/**
 * Get annotations for a document
 */
export async function getDocumentAnnotations(
  documentId: string
): Promise<Annotation[]> {
  const annotations = await loadAnnotations();
  return annotations.filter((a) => a.documentId === documentId);
}

/**
 * Get annotations for a page
 */
export async function getPageAnnotations(
  documentId: string,
  pageNumber: number
): Promise<Annotation[]> {
  const annotations = await loadAnnotations();
  return annotations.filter(
    (a) => a.documentId === documentId && a.pageNumber === pageNumber
  );
}

/**
 * Add annotation
 */
export async function addAnnotation(
  annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt">
): Promise<Annotation> {
  const annotations = await loadAnnotations();

  const newAnnotation: Annotation = {
    ...annotation,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  annotations.push(newAnnotation);
  await AsyncStorage.setItem(
    STORAGE_KEYS.ANNOTATIONS,
    JSON.stringify(annotations)
  );

  return newAnnotation;
}

/**
 * Update annotation
 */
export async function updateAnnotation(
  id: string,
  updates: Partial<Annotation>
): Promise<void> {
  const annotations = await loadAnnotations();
  const index = annotations.findIndex((a) => a.id === id);

  if (index >= 0) {
    annotations[index] = {
      ...annotations[index],
      ...updates,
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(
      STORAGE_KEYS.ANNOTATIONS,
      JSON.stringify(annotations)
    );
  }
}

/**
 * Remove annotation
 */
export async function removeAnnotation(id: string): Promise<void> {
  const annotations = await loadAnnotations();
  const filtered = annotations.filter((a) => a.id !== id);
  await AsyncStorage.setItem(
    STORAGE_KEYS.ANNOTATIONS,
    JSON.stringify(filtered)
  );
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Get PDF info from URI
 */
export async function getPDFInfo(uri: string): Promise<Partial<PDFDocument>> {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    if (!info.exists) {
      throw new Error("File not found");
    }

    // Extract filename from URI
    const filename = uri.split("/").pop() || "document.pdf";

    return {
      uri,
      filename,
      fileSize: info.size || 0,
    };
  } catch (error) {
    console.error("[PDFViewer] Get PDF info failed:", error);
    throw error;
  }
}

/**
 * Share PDF
 */
export async function sharePDF(uri: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn("[PDFViewer] Sharing not available");
      return false;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Chia sẻ PDF",
    });

    return true;
  } catch (error) {
    console.error("[PDFViewer] Share PDF failed:", error);
    return false;
  }
}

/**
 * Copy PDF to app storage
 */
export async function copyPDFToStorage(
  sourceUri: string,
  filename: string
): Promise<string> {
  try {
    const destDir = `${FileSystem.documentDirectory}pdfs/`;

    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(destDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
    }

    const destUri = `${destDir}${filename}`;
    await FileSystem.copyAsync({ from: sourceUri, to: destUri });

    return destUri;
  } catch (error) {
    console.error("[PDFViewer] Copy PDF failed:", error);
    throw error;
  }
}

/**
 * Delete PDF from storage
 */
export async function deletePDFFromStorage(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error("[PDFViewer] Delete PDF failed:", error);
    throw error;
  }
}

// ============================================================================
// Search
// ============================================================================

/**
 * Search state
 */
export interface SearchState {
  query: string;
  results: SearchResult[];
  currentIndex: number;
  isSearching: boolean;
  totalMatches: number;
}

/**
 * Create initial search state
 */
export function createSearchState(): SearchState {
  return {
    query: "",
    results: [],
    currentIndex: -1,
    isSearching: false,
    totalMatches: 0,
  };
}

/**
 * Navigate to next search result
 */
export function nextSearchResult(state: SearchState): SearchState {
  if (state.results.length === 0) return state;

  const nextIndex = (state.currentIndex + 1) % state.results.length;
  return { ...state, currentIndex: nextIndex };
}

/**
 * Navigate to previous search result
 */
export function prevSearchResult(state: SearchState): SearchState {
  if (state.results.length === 0) return state;

  const prevIndex =
    state.currentIndex <= 0 ? state.results.length - 1 : state.currentIndex - 1;
  return { ...state, currentIndex: prevIndex };
}

/**
 * Get current search result
 */
export function getCurrentSearchResult(
  state: SearchState
): SearchResult | null {
  if (state.currentIndex < 0 || state.currentIndex >= state.results.length) {
    return null;
  }
  return state.results[state.currentIndex];
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook for PDF viewer settings
 */
export function usePDFSettings() {
  const [settings, setSettings] =
    useState<PDFViewerSettings>(DEFAULT_PDF_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPDFSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<PDFViewerSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await savePDFSettings(updates);
    },
    [settings]
  );

  const reset = useCallback(async () => {
    await resetPDFSettings();
    setSettings(DEFAULT_PDF_SETTINGS);
  }, []);

  return { settings, loading, updateSettings, reset };
}

/**
 * Hook for bookmarks
 */
export function useBookmarks(documentId: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocumentBookmarks(documentId);
      setBookmarks(data);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (pageNumber: number, label?: string) => {
      const bookmark = await addBookmark(documentId, pageNumber, label);
      setBookmarks((prev) =>
        [...prev, bookmark].sort((a, b) => a.pageNumber - b.pageNumber)
      );
      return bookmark;
    },
    [documentId]
  );

  const remove = useCallback(async (id: string) => {
    await removeBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const toggle = useCallback(
    async (pageNumber: number, label?: string) => {
      const result = await toggleBookmark(documentId, pageNumber, label);
      if (result.isBookmarked && result.bookmark) {
        setBookmarks((prev) =>
          [...prev, result.bookmark!].sort(
            (a, b) => a.pageNumber - b.pageNumber
          )
        );
      } else {
        setBookmarks((prev) => prev.filter((b) => b.pageNumber !== pageNumber));
      }
      return result.isBookmarked;
    },
    [documentId]
  );

  const isBookmarked = useCallback(
    (pageNumber: number) => {
      return bookmarks.some((b) => b.pageNumber === pageNumber);
    },
    [bookmarks]
  );

  return { bookmarks, loading, refresh, add, remove, toggle, isBookmarked };
}

/**
 * Hook for reading progress
 */
export function useReadingProgress(documentId: string, totalPages: number) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    getReadingProgress(documentId).then(setProgress);
  }, [documentId]);

  const updateProgress = useCallback(
    async (currentPage: number) => {
      const newProgress = await saveReadingProgress(
        documentId,
        currentPage,
        totalPages
      );
      setProgress(newProgress);
      return newProgress;
    },
    [documentId, totalPages]
  );

  const clear = useCallback(async () => {
    await clearReadingProgress(documentId);
    setProgress(null);
  }, [documentId]);

  return { progress, updateProgress, clear };
}

/**
 * Hook for PDF viewer state
 */
export function usePDFViewer(uri: string, totalPages: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const documentId = useRef(uri).current;
  const { settings } = usePDFSettings();
  const {
    bookmarks,
    toggle: toggleBookmark,
    isBookmarked,
  } = useBookmarks(documentId);
  const { progress, updateProgress } = useReadingProgress(
    documentId,
    totalPages
  );

  // Load saved position
  useEffect(() => {
    if (progress?.currentPage) {
      setCurrentPage(progress.currentPage);
    }
    setIsLoading(false);
  }, [progress]);

  // Go to page
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
      updateProgress(validPage);
    },
    [totalPages, updateProgress]
  );

  // Next page
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  // Previous page
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // First/Last page
  const goToFirst = useCallback(() => goToPage(1), [goToPage]);
  const goToLast = useCallback(
    () => goToPage(totalPages),
    [goToPage, totalPages]
  );

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom((prev) => clampZoom(prev + ZOOM_CONSTRAINTS.STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => clampZoom(prev - ZOOM_CONSTRAINTS.STEP));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setZoom(clampZoom(level));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(settings.defaultZoom);
  }, [settings.defaultZoom]);

  return {
    // State
    currentPage,
    zoom,
    isLoading,
    error,
    totalPages,
    progress,
    bookmarks,
    settings,

    // Page navigation
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,

    // Zoom
    zoomIn,
    zoomOut,
    setZoomLevel,
    resetZoom,

    // Bookmarks
    toggleBookmark: (label?: string) => toggleBookmark(currentPage, label),
    isCurrentPageBookmarked: () => isBookmarked(currentPage),
  };
}

/**
 * Hook for search
 */
export function usePDFSearch() {
  const [state, setState] = useState<SearchState>(createSearchState());

  const search = useCallback((query: string, results: SearchResult[]) => {
    setState({
      query,
      results,
      currentIndex: results.length > 0 ? 0 : -1,
      isSearching: false,
      totalMatches: results.length,
    });
  }, []);

  const startSearch = useCallback((query: string) => {
    setState((prev) => ({
      ...prev,
      query,
      isSearching: true,
    }));
  }, []);

  const next = useCallback(() => {
    setState((prev) => nextSearchResult(prev));
  }, []);

  const prev = useCallback(() => {
    setState((prev) => prevSearchResult(prev));
  }, []);

  const clear = useCallback(() => {
    setState(createSearchState());
  }, []);

  const currentResult = getCurrentSearchResult(state);

  return {
    ...state,
    currentResult,
    search,
    startSearch,
    next,
    prev,
    clear,
  };
}

// ============================================================================
// Service Class (Singleton)
// ============================================================================

class PDFViewerServiceClass {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load settings
    await loadPDFSettings();

    this.initialized = true;
    console.log("[PDFViewer] Service initialized");
  }

  // Settings
  async getSettings() {
    return loadPDFSettings();
  }

  async updateSettings(settings: Partial<PDFViewerSettings>) {
    return savePDFSettings(settings);
  }

  // Bookmarks
  async getBookmarks(documentId: string) {
    return getDocumentBookmarks(documentId);
  }

  async addBookmark(documentId: string, pageNumber: number, label?: string) {
    return addBookmark(documentId, pageNumber, label);
  }

  async removeBookmark(id: string) {
    return removeBookmark(id);
  }

  // Progress
  async getProgress(documentId: string) {
    return getReadingProgress(documentId);
  }

  async saveProgress(
    documentId: string,
    currentPage: number,
    totalPages: number
  ) {
    return saveReadingProgress(documentId, currentPage, totalPages);
  }

  // Recent
  async getRecent() {
    return loadRecentDocuments();
  }

  async addToRecent(document: PDFDocument) {
    return addToRecent(document);
  }

  // Annotations
  async getAnnotations(documentId: string) {
    return getDocumentAnnotations(documentId);
  }

  async addAnnotation(
    annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt">
  ) {
    return addAnnotation(annotation);
  }

  // File operations
  async share(uri: string) {
    return sharePDF(uri);
  }
}

export const PDFViewerService = new PDFViewerServiceClass();
export default PDFViewerService;
