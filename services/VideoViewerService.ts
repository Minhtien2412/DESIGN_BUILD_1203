/**
 * VideoViewerService.ts
 *
 * Comprehensive video viewer service for playing videos from File Manager
 * Supports fullscreen playback, playlists, PiP, offline saving, and playback controls
 *
 * Story: VIEW-003 - Video Viewer (from File Manager)
 */

import * as FileSystem from "@/utils/FileSystemCompat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";

// =============================================================================
// Types
// =============================================================================

export interface VideoSource {
  id: string;
  uri: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  size?: number;
  mimeType?: string;
}

export interface PlaylistItem extends VideoSource {
  position: number;
}

export interface VideoMetadata {
  uri: string;
  filename: string;
  duration?: number;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  creationTime?: number;
  modificationTime?: number;
}

export interface PlaybackPosition {
  videoId: string;
  position: number;
  duration: number;
  timestamp: number;
}

export interface VideoViewerSettings {
  // Playback
  defaultPlaybackSpeed: number;
  autoPlay: boolean;
  loopVideo: boolean;
  loopPlaylist: boolean;

  // Controls
  showControls: boolean;
  autoHideControlsDelay: number; // ms
  seekIntervalSeconds: number;
  volumeStep: number;

  // Display
  fullscreenByDefault: boolean;
  allowPictureInPicture: boolean;
  maintainAspectRatio: boolean;
  backgroundColor: string;

  // Subtitles
  showSubtitles: boolean;
  subtitleFontSize: number;
  subtitleBackgroundOpacity: number;

  // Offline
  maxOfflineVideos: number;
  autoDeleteWatched: boolean;

  // Resume
  savePlaybackPosition: boolean;
  resumeThreshold: number; // % of video watched before not resuming
}

export interface OfflineVideo {
  id: string;
  originalUri: string;
  localUri: string;
  title: string;
  size: number;
  downloadedAt: number;
  lastWatchedAt?: number;
}

export interface PlaybackSpeed {
  value: number;
  label: string;
}

// =============================================================================
// Constants
// =============================================================================

export const DEFAULT_VIDEO_SETTINGS: VideoViewerSettings = {
  defaultPlaybackSpeed: 1.0,
  autoPlay: true,
  loopVideo: false,
  loopPlaylist: false,
  showControls: true,
  autoHideControlsDelay: 3000,
  seekIntervalSeconds: 10,
  volumeStep: 0.1,
  fullscreenByDefault: false,
  allowPictureInPicture: true,
  maintainAspectRatio: true,
  backgroundColor: "#000000",
  showSubtitles: false,
  subtitleFontSize: 16,
  subtitleBackgroundOpacity: 0.7,
  maxOfflineVideos: 10,
  autoDeleteWatched: false,
  savePlaybackPosition: true,
  resumeThreshold: 90,
};

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [
  { value: 0.25, label: "0.25x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1.0, label: "Normal" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2.0, label: "2x" },
];

export const SUPPORTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/quicktime",
  "video/x-matroska",
  "video/webm",
  "video/x-msvideo",
  "video/mpeg",
];

export const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/x-matroska": ".mkv",
  "video/webm": ".webm",
  "video/x-msvideo": ".avi",
  "video/mpeg": ".mpeg",
};

const STORAGE_KEYS = {
  SETTINGS: "@video_viewer_settings",
  PLAYBACK_POSITIONS: "@video_playback_positions",
  OFFLINE_VIDEOS: "@offline_videos",
  PLAYLIST: "@video_playlist",
};

// =============================================================================
// Utility Functions
// =============================================================================

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatBitrate(bytesPerSecond: number): string {
  const kbps = (bytesPerSecond * 8) / 1000;
  if (kbps < 1000) {
    return `${Math.round(kbps)} kbps`;
  }
  return `${(kbps / 1000).toFixed(1)} Mbps`;
}

export function calculateProgress(position: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.min(100, Math.max(0, (position / duration) * 100));
}

export function isLocalFile(uri: string): boolean {
  return (
    uri.startsWith("file://") ||
    uri.startsWith("/") ||
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://")
  );
}

export function isRemoteUri(uri: string): boolean {
  return uri.startsWith("http://") || uri.startsWith("https://");
}

export function getFilenameFromUri(uri: string): string {
  const parts = uri.split("/");
  const filename = parts[parts.length - 1];
  // Remove query params
  return filename.split("?")[0] || "video";
}

export function getExtensionFromFilename(filename: string): string {
  const parts = filename.split(".");
  if (parts.length > 1) {
    return `.${parts[parts.length - 1].toLowerCase()}`;
  }
  return "";
}

export function isSupportedFormat(mimeType: string): boolean {
  return SUPPORTED_VIDEO_FORMATS.includes(mimeType);
}

export function shouldResumePlayback(
  position: number,
  duration: number,
  threshold: number,
): boolean {
  if (duration === 0) return false;
  const progress = (position / duration) * 100;
  return progress > 5 && progress < threshold;
}

export function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume));
}

export function clampPlaybackRate(rate: number): number {
  return Math.max(0.25, Math.min(2, rate));
}

export function getNextPlaybackSpeed(currentSpeed: number): PlaybackSpeed {
  const currentIndex = PLAYBACK_SPEEDS.findIndex(
    (s) => s.value === currentSpeed,
  );
  const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
  return PLAYBACK_SPEEDS[nextIndex];
}

export function getPreviousPlaybackSpeed(currentSpeed: number): PlaybackSpeed {
  const currentIndex = PLAYBACK_SPEEDS.findIndex(
    (s) => s.value === currentSpeed,
  );
  const prevIndex =
    currentIndex <= 0 ? PLAYBACK_SPEEDS.length - 1 : currentIndex - 1;
  return PLAYBACK_SPEEDS[prevIndex];
}

// =============================================================================
// Settings Management
// =============================================================================

export async function loadVideoSettings(): Promise<VideoViewerSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_VIDEO_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error("Error loading video settings:", error);
  }
  return DEFAULT_VIDEO_SETTINGS;
}

export async function saveVideoSettings(
  settings: Partial<VideoViewerSettings>,
): Promise<void> {
  try {
    const current = await loadVideoSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving video settings:", error);
    throw error;
  }
}

export async function resetVideoSettings(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

// =============================================================================
// Playback Position Management
// =============================================================================

export async function loadPlaybackPositions(): Promise<
  Record<string, PlaybackPosition>
> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PLAYBACK_POSITIONS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading playback positions:", error);
    return {};
  }
}

export async function getPlaybackPosition(
  videoId: string,
): Promise<PlaybackPosition | null> {
  const positions = await loadPlaybackPositions();
  return positions[videoId] || null;
}

export async function savePlaybackPosition(
  videoId: string,
  position: number,
  duration: number,
): Promise<void> {
  try {
    const positions = await loadPlaybackPositions();
    positions[videoId] = {
      videoId,
      position,
      duration,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      STORAGE_KEYS.PLAYBACK_POSITIONS,
      JSON.stringify(positions),
    );
  } catch (error) {
    console.error("Error saving playback position:", error);
  }
}

export async function clearPlaybackPosition(videoId: string): Promise<void> {
  try {
    const positions = await loadPlaybackPositions();
    delete positions[videoId];
    await AsyncStorage.setItem(
      STORAGE_KEYS.PLAYBACK_POSITIONS,
      JSON.stringify(positions),
    );
  } catch (error) {
    console.error("Error clearing playback position:", error);
  }
}

export async function clearAllPlaybackPositions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.PLAYBACK_POSITIONS);
}

// =============================================================================
// Playlist Management
// =============================================================================

export async function loadPlaylist(): Promise<PlaylistItem[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLIST);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading playlist:", error);
    return [];
  }
}

export async function savePlaylist(playlist: PlaylistItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(playlist));
  } catch (error) {
    console.error("Error saving playlist:", error);
    throw error;
  }
}

export async function addToPlaylist(
  video: VideoSource,
): Promise<PlaylistItem[]> {
  const playlist = await loadPlaylist();

  // Check if already in playlist
  const existing = playlist.find((item) => item.id === video.id);
  if (existing) {
    return playlist;
  }

  const newItem: PlaylistItem = {
    ...video,
    position: playlist.length,
  };

  playlist.push(newItem);
  await savePlaylist(playlist);
  return playlist;
}

export async function removeFromPlaylist(
  videoId: string,
): Promise<PlaylistItem[]> {
  let playlist = await loadPlaylist();
  playlist = playlist.filter((item) => item.id !== videoId);

  // Reorder positions
  playlist = playlist.map((item, index) => ({
    ...item,
    position: index,
  }));

  await savePlaylist(playlist);
  return playlist;
}

export async function reorderPlaylist(
  fromIndex: number,
  toIndex: number,
): Promise<PlaylistItem[]> {
  const playlist = await loadPlaylist();

  if (
    fromIndex < 0 ||
    fromIndex >= playlist.length ||
    toIndex < 0 ||
    toIndex >= playlist.length
  ) {
    return playlist;
  }

  const [moved] = playlist.splice(fromIndex, 1);
  playlist.splice(toIndex, 0, moved);

  // Update positions
  const reordered = playlist.map((item, index) => ({
    ...item,
    position: index,
  }));

  await savePlaylist(reordered);
  return reordered;
}

export async function clearPlaylist(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.PLAYLIST);
}

export function getNextInPlaylist(
  playlist: PlaylistItem[],
  currentId: string,
  loop: boolean = false,
): PlaylistItem | null {
  const currentIndex = playlist.findIndex((item) => item.id === currentId);
  if (currentIndex === -1) return null;

  const nextIndex = currentIndex + 1;
  if (nextIndex < playlist.length) {
    return playlist[nextIndex];
  }

  return loop ? playlist[0] : null;
}

export function getPreviousInPlaylist(
  playlist: PlaylistItem[],
  currentId: string,
  loop: boolean = false,
): PlaylistItem | null {
  const currentIndex = playlist.findIndex((item) => item.id === currentId);
  if (currentIndex === -1) return null;

  const prevIndex = currentIndex - 1;
  if (prevIndex >= 0) {
    return playlist[prevIndex];
  }

  return loop ? playlist[playlist.length - 1] : null;
}

// =============================================================================
// Offline Video Management
// =============================================================================

export async function loadOfflineVideos(): Promise<OfflineVideo[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_VIDEOS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading offline videos:", error);
    return [];
  }
}

export async function saveOfflineVideo(video: OfflineVideo): Promise<void> {
  try {
    let offline = await loadOfflineVideos();

    // Check if already saved
    const existing = offline.find((v) => v.id === video.id);
    if (existing) {
      return;
    }

    offline.push(video);
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_VIDEOS,
      JSON.stringify(offline),
    );
  } catch (error) {
    console.error("Error saving offline video:", error);
    throw error;
  }
}

export async function deleteOfflineVideo(videoId: string): Promise<void> {
  try {
    let offline = await loadOfflineVideos();
    const video = offline.find((v) => v.id === videoId);

    if (video) {
      // Delete file
      const fileInfo = await FileSystem.getInfoAsync(video.localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(video.localUri);
      }

      // Remove from list
      offline = offline.filter((v) => v.id !== videoId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_VIDEOS,
        JSON.stringify(offline),
      );
    }
  } catch (error) {
    console.error("Error deleting offline video:", error);
    throw error;
  }
}

export async function isVideoOffline(videoId: string): Promise<boolean> {
  const offline = await loadOfflineVideos();
  return offline.some((v) => v.id === videoId);
}

export async function getOfflineVideo(
  videoId: string,
): Promise<OfflineVideo | null> {
  const offline = await loadOfflineVideos();
  return offline.find((v) => v.id === videoId) || null;
}

export async function clearOfflineVideos(): Promise<void> {
  try {
    const offline = await loadOfflineVideos();

    // Delete all files
    for (const video of offline) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(video.localUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(video.localUri);
        }
      } catch (error) {
        console.error("Error deleting offline video file:", error);
      }
    }

    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_VIDEOS);
  } catch (error) {
    console.error("Error clearing offline videos:", error);
    throw error;
  }
}

// =============================================================================
// Video Operations
// =============================================================================

export async function getVideoInfo(uri: string): Promise<VideoMetadata> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      throw new Error("Video file not found");
    }

    const filename = getFilenameFromUri(uri);
    const extension = getExtensionFromFilename(filename);

    return {
      uri,
      filename,
      size: fileInfo.size || 0,
      mimeType: Object.keys(VIDEO_EXTENSIONS).find(
        (key) => VIDEO_EXTENSIONS[key] === extension,
      ),
      modificationTime: fileInfo.modificationTime,
    };
  } catch (error) {
    console.error("Error getting video info:", error);
    throw error;
  }
}

export async function shareVideo(uri: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    await Sharing.shareAsync(uri, {
      dialogTitle: "Chia sẻ video",
    });

    return true;
  } catch (error) {
    console.error("Error sharing video:", error);
    return false;
  }
}

export async function saveVideoToGallery(uri: string): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      return false;
    }

    // If remote, download first
    if (isRemoteUri(uri)) {
      const filename = getFilenameFromUri(uri);
      const localUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.downloadAsync(uri, localUri);
      uri = localUri;
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch (error) {
    console.error("Error saving video to gallery:", error);
    return false;
  }
}

export async function downloadVideoForOffline(
  video: VideoSource,
  onProgress?: (progress: number) => void,
): Promise<OfflineVideo | null> {
  try {
    if (!isRemoteUri(video.uri)) {
      // Already local
      return null;
    }

    const filename = getFilenameFromUri(video.uri);
    const localUri = `${FileSystem.documentDirectory}offline_videos/${video.id}_${filename}`;

    // Create directory if needed
    const dirUri = `${FileSystem.documentDirectory}offline_videos/`;
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }

    // Download with progress
    const downloadResumable = FileSystem.createDownloadResumable(
      video.uri,
      localUri,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        onProgress?.(progress * 100);
      },
    );

    const result = await downloadResumable.downloadAsync();
    if (!result) {
      throw new Error("Download failed");
    }

    const fileInfo = await FileSystem.getInfoAsync(result.uri);

    const offlineVideo: OfflineVideo = {
      id: video.id,
      originalUri: video.uri,
      localUri: result.uri,
      title: video.title || getFilenameFromUri(video.uri),
      size: fileInfo.size || 0,
      downloadedAt: Date.now(),
    };

    await saveOfflineVideo(offlineVideo);
    return offlineVideo;
  } catch (error) {
    console.error("Error downloading video for offline:", error);
    return null;
  }
}

export async function deleteVideo(uri: string): Promise<boolean> {
  try {
    if (!isLocalFile(uri)) {
      return false;
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return false;
    }

    await FileSystem.deleteAsync(uri);
    return true;
  } catch (error) {
    console.error("Error deleting video:", error);
    return false;
  }
}

// =============================================================================
// React Hooks
// =============================================================================

export function useVideoSettings() {
  const [settings, setSettings] = useState<VideoViewerSettings>(
    DEFAULT_VIDEO_SETTINGS,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoSettings().then((loaded) => {
      setSettings(loaded);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<VideoViewerSettings>) => {
      await saveVideoSettings(updates);
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const resetSettings = useCallback(async () => {
    await resetVideoSettings();
    setSettings(DEFAULT_VIDEO_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings, loading };
}

export function usePlaybackPosition(videoId: string) {
  const [position, setPosition] = useState<PlaybackPosition | null>(null);

  useEffect(() => {
    getPlaybackPosition(videoId).then(setPosition);
  }, [videoId]);

  const savePosition = useCallback(
    async (pos: number, duration: number) => {
      await savePlaybackPosition(videoId, pos, duration);
      setPosition({ videoId, position: pos, duration, timestamp: Date.now() });
    },
    [videoId],
  );

  const clearPosition = useCallback(async () => {
    await clearPlaybackPosition(videoId);
    setPosition(null);
  }, [videoId]);

  return { position, savePosition, clearPosition };
}

export function usePlaylist() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylist().then((loaded) => {
      setPlaylist(loaded);
      setLoading(false);
    });
  }, []);

  const addVideo = useCallback(async (video: VideoSource) => {
    const updated = await addToPlaylist(video);
    setPlaylist(updated);
  }, []);

  const removeVideo = useCallback(async (videoId: string) => {
    const updated = await removeFromPlaylist(videoId);
    setPlaylist(updated);
  }, []);

  const reorder = useCallback(async (fromIndex: number, toIndex: number) => {
    const updated = await reorderPlaylist(fromIndex, toIndex);
    setPlaylist(updated);
  }, []);

  const clear = useCallback(async () => {
    await clearPlaylist();
    setPlaylist([]);
  }, []);

  const getNext = useCallback(
    (currentId: string, loop: boolean = false) => {
      return getNextInPlaylist(playlist, currentId, loop);
    },
    [playlist],
  );

  const getPrevious = useCallback(
    (currentId: string, loop: boolean = false) => {
      return getPreviousInPlaylist(playlist, currentId, loop);
    },
    [playlist],
  );

  return {
    playlist,
    addVideo,
    removeVideo,
    reorder,
    clear,
    getNext,
    getPrevious,
    loading,
  };
}

export function useOfflineVideos() {
  const [videos, setVideos] = useState<OfflineVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfflineVideos().then((loaded) => {
      setVideos(loaded);
      setLoading(false);
    });
  }, []);

  const download = useCallback(
    async (video: VideoSource, onProgress?: (progress: number) => void) => {
      const offline = await downloadVideoForOffline(video, onProgress);
      if (offline) {
        setVideos((prev) => [...prev, offline]);
      }
      return offline;
    },
    [],
  );

  const deleteVideo = useCallback(async (videoId: string) => {
    await deleteOfflineVideo(videoId);
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  }, []);

  const clearAll = useCallback(async () => {
    await clearOfflineVideos();
    setVideos([]);
  }, []);

  const isOffline = useCallback(
    (videoId: string) => {
      return videos.some((v) => v.id === videoId);
    },
    [videos],
  );

  return { videos, download, deleteVideo, clearAll, isOffline, loading };
}

// =============================================================================
// Service Class
// =============================================================================

class VideoViewerServiceClass {
  private static instance: VideoViewerServiceClass;

  private constructor() {}

  static getInstance(): VideoViewerServiceClass {
    if (!VideoViewerServiceClass.instance) {
      VideoViewerServiceClass.instance = new VideoViewerServiceClass();
    }
    return VideoViewerServiceClass.instance;
  }

  async initialize(): Promise<void> {
    // Pre-load settings
    await loadVideoSettings();
    this.log("Service initialized");
  }

  // Settings
  async getSettings(): Promise<VideoViewerSettings> {
    return loadVideoSettings();
  }

  async updateSettings(settings: Partial<VideoViewerSettings>): Promise<void> {
    await saveVideoSettings(settings);
  }

  async resetSettings(): Promise<void> {
    await resetVideoSettings();
  }

  // Playback Position
  async getPosition(videoId: string): Promise<PlaybackPosition | null> {
    return getPlaybackPosition(videoId);
  }

  async savePosition(
    videoId: string,
    position: number,
    duration: number,
  ): Promise<void> {
    await savePlaybackPosition(videoId, position, duration);
  }

  // Playlist
  async getPlaylist(): Promise<PlaylistItem[]> {
    return loadPlaylist();
  }

  async addToPlaylist(video: VideoSource): Promise<PlaylistItem[]> {
    return addToPlaylist(video);
  }

  async removeFromPlaylist(videoId: string): Promise<PlaylistItem[]> {
    return removeFromPlaylist(videoId);
  }

  // Offline
  async getOfflineVideos(): Promise<OfflineVideo[]> {
    return loadOfflineVideos();
  }

  async downloadForOffline(
    video: VideoSource,
    onProgress?: (progress: number) => void,
  ): Promise<OfflineVideo | null> {
    return downloadVideoForOffline(video, onProgress);
  }

  async deleteOffline(videoId: string): Promise<void> {
    await deleteOfflineVideo(videoId);
  }

  // Operations
  async share(uri: string): Promise<boolean> {
    return shareVideo(uri);
  }

  async saveToGallery(uri: string): Promise<boolean> {
    return saveVideoToGallery(uri);
  }

  async delete(uri: string): Promise<boolean> {
    return deleteVideo(uri);
  }

  async getInfo(uri: string): Promise<VideoMetadata> {
    return getVideoInfo(uri);
  }

  private log(message: string, data?: any): void {
    console.log(`[VideoViewer] ${message}`, data ? data : "");
  }
}

export const VideoViewerService = VideoViewerServiceClass.getInstance();
