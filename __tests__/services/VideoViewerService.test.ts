/**
 * VideoViewerService.test.ts
 *
 * Unit tests for Video Viewer Service
 *
 * Story: VIEW-003 - Video Viewer
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
  makeDirectoryAsync: jest.fn(),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(),
  })),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn(),
  saveToLibraryAsync: jest.fn(),
}));

import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

import {
    addToPlaylist,
    calculateProgress,
    clampPlaybackRate,
    clampVolume,
    clearAllPlaybackPositions,
    clearOfflineVideos,
    clearPlaybackPosition,
    clearPlaylist,
    // Constants
    DEFAULT_VIDEO_SETTINGS,
    deleteOfflineVideo,
    deleteVideo,
    formatBitrate,
    // Utility functions
    formatDuration,
    formatFileSize,
    getExtensionFromFilename,
    getFilenameFromUri,
    getNextInPlaylist,
    getNextPlaybackSpeed,
    getOfflineVideo,
    getPlaybackPosition,
    getPreviousInPlaylist,
    getPreviousPlaybackSpeed,
    // Operations
    getVideoInfo,
    isLocalFile,
    isRemoteUri,
    isSupportedFormat,
    isVideoOffline,
    // Offline
    loadOfflineVideos,
    // Playback Position
    loadPlaybackPositions,
    // Playlist
    loadPlaylist,
    // Settings
    loadVideoSettings,
    PLAYBACK_SPEEDS,
    PlaybackPosition,
    PlaylistItem,
    removeFromPlaylist,
    reorderPlaylist,
    resetVideoSettings,
    saveOfflineVideo,
    savePlaybackPosition,
    saveVideoSettings,
    saveVideoToGallery,
    shareVideo,
    shouldResumePlayback,
    SUPPORTED_VIDEO_FORMATS,
    // Types
    VideoSource,
    // Service
    VideoViewerService
} from "../../services/VideoViewerService";

describe("VideoViewerService", () => {
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
    test("DEFAULT_VIDEO_SETTINGS has correct defaults", () => {
      expect(DEFAULT_VIDEO_SETTINGS.defaultPlaybackSpeed).toBe(1.0);
      expect(DEFAULT_VIDEO_SETTINGS.autoPlay).toBe(true);
      expect(DEFAULT_VIDEO_SETTINGS.loopVideo).toBe(false);
      expect(DEFAULT_VIDEO_SETTINGS.showControls).toBe(true);
      expect(DEFAULT_VIDEO_SETTINGS.autoHideControlsDelay).toBe(3000);
      expect(DEFAULT_VIDEO_SETTINGS.allowPictureInPicture).toBe(true);
      expect(DEFAULT_VIDEO_SETTINGS.savePlaybackPosition).toBe(true);
    });

    test("PLAYBACK_SPEEDS has standard speeds", () => {
      expect(PLAYBACK_SPEEDS).toHaveLength(8);
      expect(PLAYBACK_SPEEDS[3].value).toBe(1.0);
      expect(PLAYBACK_SPEEDS[3].label).toBe("Normal");
    });

    test("SUPPORTED_VIDEO_FORMATS includes common formats", () => {
      expect(SUPPORTED_VIDEO_FORMATS).toContain("video/mp4");
      expect(SUPPORTED_VIDEO_FORMATS).toContain("video/webm");
    });
  });

  // ==========================================================================
  // Utility Functions Tests
  // ==========================================================================

  describe("formatDuration", () => {
    test("formats seconds correctly", () => {
      expect(formatDuration(0)).toBe("0:00");
      expect(formatDuration(59)).toBe("0:59");
      expect(formatDuration(60)).toBe("1:00");
      expect(formatDuration(3661)).toBe("1:01:01");
    });
  });

  describe("formatFileSize", () => {
    test("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });
  });

  describe("formatBitrate", () => {
    test("formats bitrate correctly", () => {
      // 125000 bytes/sec = 1000000 bits/sec = 1000 kbps = 1.0 Mbps
      expect(formatBitrate(125000)).toBe("1.0 Mbps");
      // 1250000 bytes/sec = 10000000 bits/sec = 10000 kbps = 10 Mbps
      expect(formatBitrate(1250000)).toBe("10.0 Mbps");
    });
  });

  describe("calculateProgress", () => {
    test("calculates progress percentage", () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(100, 100)).toBe(100);
    });

    test("handles zero duration", () => {
      expect(calculateProgress(50, 0)).toBe(0);
    });
  });

  describe("isLocalFile", () => {
    test("identifies local files", () => {
      expect(isLocalFile("file:///path/to/video.mp4")).toBe(true);
      expect(isLocalFile("/path/to/video.mp4")).toBe(true);
      expect(isLocalFile("content://media/video.mp4")).toBe(true);
    });

    test("rejects remote URLs", () => {
      expect(isLocalFile("https://example.com/video.mp4")).toBe(false);
    });
  });

  describe("isRemoteUri", () => {
    test("identifies remote URIs", () => {
      expect(isRemoteUri("https://example.com/video.mp4")).toBe(true);
      expect(isRemoteUri("http://example.com/video.mp4")).toBe(true);
    });

    test("rejects local files", () => {
      expect(isRemoteUri("file:///path/to/video.mp4")).toBe(false);
    });
  });

  describe("getFilenameFromUri", () => {
    test("extracts filename from URI", () => {
      expect(getFilenameFromUri("/path/to/video.mp4")).toBe("video.mp4");
      expect(
        getFilenameFromUri("https://example.com/video.mp4?size=large")
      ).toBe("video.mp4");
    });
  });

  describe("getExtensionFromFilename", () => {
    test("extracts extension", () => {
      expect(getExtensionFromFilename("video.mp4")).toBe(".mp4");
      expect(getExtensionFromFilename("file.name.MOV")).toBe(".mov");
    });
  });

  describe("isSupportedFormat", () => {
    test("returns true for supported formats", () => {
      expect(isSupportedFormat("video/mp4")).toBe(true);
      expect(isSupportedFormat("video/webm")).toBe(true);
    });

    test("returns false for unsupported formats", () => {
      expect(isSupportedFormat("audio/mp3")).toBe(false);
    });
  });

  describe("shouldResumePlayback", () => {
    test("returns true for valid resume position", () => {
      expect(shouldResumePlayback(50, 100, 90)).toBe(true);
    });

    test("returns false if too close to start", () => {
      expect(shouldResumePlayback(2, 100, 90)).toBe(false);
    });

    test("returns false if past threshold", () => {
      expect(shouldResumePlayback(95, 100, 90)).toBe(false);
    });
  });

  describe("clampVolume", () => {
    test("clamps volume between 0 and 1", () => {
      expect(clampVolume(-0.5)).toBe(0);
      expect(clampVolume(0.5)).toBe(0.5);
      expect(clampVolume(1.5)).toBe(1);
    });
  });

  describe("clampPlaybackRate", () => {
    test("clamps rate between 0.25 and 2", () => {
      expect(clampPlaybackRate(0.1)).toBe(0.25);
      expect(clampPlaybackRate(1)).toBe(1);
      expect(clampPlaybackRate(3)).toBe(2);
    });
  });

  describe("getNextPlaybackSpeed", () => {
    test("cycles to next speed", () => {
      const next = getNextPlaybackSpeed(1.0);
      expect(next.value).toBe(1.25);
    });

    test("wraps around from last to first", () => {
      const next = getNextPlaybackSpeed(2.0);
      expect(next.value).toBe(0.25);
    });
  });

  describe("getPreviousPlaybackSpeed", () => {
    test("cycles to previous speed", () => {
      const prev = getPreviousPlaybackSpeed(1.0);
      expect(prev.value).toBe(0.75);
    });

    test("wraps around from first to last", () => {
      const prev = getPreviousPlaybackSpeed(0.25);
      expect(prev.value).toBe(2.0);
    });
  });

  // ==========================================================================
  // Settings Tests
  // ==========================================================================

  describe("Settings Management", () => {
    describe("loadVideoSettings", () => {
      test("returns default settings when no stored data", async () => {
        const settings = await loadVideoSettings();
        expect(settings).toEqual(DEFAULT_VIDEO_SETTINGS);
      });

      test("merges stored settings with defaults", async () => {
        const stored = { defaultPlaybackSpeed: 1.5 };
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(stored)
        );

        const settings = await loadVideoSettings();
        expect(settings.defaultPlaybackSpeed).toBe(1.5);
        expect(settings.autoPlay).toBe(true); // Default
      });

      test("handles corrupted data gracefully", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("invalid json");

        const settings = await loadVideoSettings();
        expect(settings).toEqual(DEFAULT_VIDEO_SETTINGS);
      });
    });

    describe("saveVideoSettings", () => {
      test("saves settings to storage", async () => {
        await saveVideoSettings({ defaultPlaybackSpeed: 1.5 });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@video_viewer_settings",
          expect.stringContaining('"defaultPlaybackSpeed":1.5')
        );
      });
    });

    describe("resetVideoSettings", () => {
      test("removes settings from storage", async () => {
        await resetVideoSettings();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          "@video_viewer_settings"
        );
      });
    });
  });

  // ==========================================================================
  // Playback Position Tests
  // ==========================================================================

  describe("Playback Position", () => {
    const mockPosition: PlaybackPosition = {
      videoId: "video-1",
      position: 50,
      duration: 100,
      timestamp: Date.now(),
    };

    describe("loadPlaybackPositions", () => {
      test("returns empty object when no positions", async () => {
        const positions = await loadPlaybackPositions();
        expect(positions).toEqual({});
      });

      test("returns stored positions", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify({ "video-1": mockPosition })
        );

        const positions = await loadPlaybackPositions();
        expect(positions["video-1"]).toBeDefined();
      });
    });

    describe("getPlaybackPosition", () => {
      test("returns position for video", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify({ "video-1": mockPosition })
        );

        const position = await getPlaybackPosition("video-1");
        expect(position?.videoId).toBe("video-1");
      });

      test("returns null if no position", async () => {
        const position = await getPlaybackPosition("video-2");
        expect(position).toBeNull();
      });
    });

    describe("savePlaybackPosition", () => {
      test("saves position", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("{}");

        await savePlaybackPosition("video-1", 50, 100);

        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    describe("clearPlaybackPosition", () => {
      test("removes position", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify({ "video-1": mockPosition })
        );

        await clearPlaybackPosition("video-1");

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@video_playback_positions",
          "{}"
        );
      });
    });

    describe("clearAllPlaybackPositions", () => {
      test("removes all positions", async () => {
        await clearAllPlaybackPositions();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          "@video_playback_positions"
        );
      });
    });
  });

  // ==========================================================================
  // Playlist Tests
  // ==========================================================================

  describe("Playlist Management", () => {
    const mockVideo: VideoSource = {
      id: "video-1",
      uri: "file:///video.mp4",
      title: "Test Video",
    };

    describe("loadPlaylist", () => {
      test("returns empty array when no playlist", async () => {
        const playlist = await loadPlaylist();
        expect(playlist).toEqual([]);
      });

      test("returns stored playlist", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([{ ...mockVideo, position: 0 }])
        );

        const playlist = await loadPlaylist();
        expect(playlist).toHaveLength(1);
      });
    });

    describe("addToPlaylist", () => {
      test("adds video to playlist", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const playlist = await addToPlaylist(mockVideo);

        expect(playlist).toHaveLength(1);
        expect(playlist[0].id).toBe("video-1");
      });

      test("does not add duplicate", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([{ ...mockVideo, position: 0 }])
        );

        const playlist = await addToPlaylist(mockVideo);

        expect(playlist).toHaveLength(1);
      });
    });

    describe("removeFromPlaylist", () => {
      test("removes video from playlist", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([{ ...mockVideo, position: 0 }])
        );

        const playlist = await removeFromPlaylist("video-1");

        expect(playlist).toHaveLength(0);
      });

      test("reorders positions after removal", async () => {
        const mockPlaylist = [
          { id: "v1", uri: "uri1", position: 0 },
          { id: "v2", uri: "uri2", position: 1 },
          { id: "v3", uri: "uri3", position: 2 },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockPlaylist)
        );

        const playlist = await removeFromPlaylist("v2");

        expect(playlist).toHaveLength(2);
        expect(playlist[0].position).toBe(0);
        expect(playlist[1].position).toBe(1);
      });
    });

    describe("reorderPlaylist", () => {
      test("reorders videos", async () => {
        const mockPlaylist = [
          { id: "v1", uri: "uri1", position: 0 },
          { id: "v2", uri: "uri2", position: 1 },
          { id: "v3", uri: "uri3", position: 2 },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify(mockPlaylist)
        );

        const playlist = await reorderPlaylist(0, 2);

        expect(playlist[0].id).toBe("v2");
        expect(playlist[2].id).toBe("v1");
      });
    });

    describe("clearPlaylist", () => {
      test("clears playlist", async () => {
        await clearPlaylist();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@video_playlist");
      });
    });

    describe("getNextInPlaylist", () => {
      const mockPlaylist: PlaylistItem[] = [
        { id: "v1", uri: "uri1", position: 0 },
        { id: "v2", uri: "uri2", position: 1 },
        { id: "v3", uri: "uri3", position: 2 },
      ];

      test("returns next video", () => {
        const next = getNextInPlaylist(mockPlaylist, "v1");
        expect(next?.id).toBe("v2");
      });

      test("returns null at end without loop", () => {
        const next = getNextInPlaylist(mockPlaylist, "v3", false);
        expect(next).toBeNull();
      });

      test("loops to first when enabled", () => {
        const next = getNextInPlaylist(mockPlaylist, "v3", true);
        expect(next?.id).toBe("v1");
      });
    });

    describe("getPreviousInPlaylist", () => {
      const mockPlaylist: PlaylistItem[] = [
        { id: "v1", uri: "uri1", position: 0 },
        { id: "v2", uri: "uri2", position: 1 },
        { id: "v3", uri: "uri3", position: 2 },
      ];

      test("returns previous video", () => {
        const prev = getPreviousInPlaylist(mockPlaylist, "v2");
        expect(prev?.id).toBe("v1");
      });

      test("returns null at start without loop", () => {
        const prev = getPreviousInPlaylist(mockPlaylist, "v1", false);
        expect(prev).toBeNull();
      });

      test("loops to last when enabled", () => {
        const prev = getPreviousInPlaylist(mockPlaylist, "v1", true);
        expect(prev?.id).toBe("v3");
      });
    });
  });

  // ==========================================================================
  // Offline Videos Tests
  // ==========================================================================

  describe("Offline Videos", () => {
    const mockOfflineVideo = {
      id: "video-1",
      originalUri: "https://example.com/video.mp4",
      localUri: "file:///offline/video.mp4",
      title: "Test Video",
      size: 1048576,
      downloadedAt: Date.now(),
    };

    describe("loadOfflineVideos", () => {
      test("returns empty array when no offline videos", async () => {
        const videos = await loadOfflineVideos();
        expect(videos).toEqual([]);
      });

      test("returns stored offline videos", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockOfflineVideo])
        );

        const videos = await loadOfflineVideos();
        expect(videos).toHaveLength(1);
      });
    });

    describe("saveOfflineVideo", () => {
      test("saves offline video", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        await saveOfflineVideo(mockOfflineVideo);

        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      test("does not duplicate existing video", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockOfflineVideo])
        );

        await saveOfflineVideo(mockOfflineVideo);

        // setItem should not be called for duplicate
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      });
    });

    describe("deleteOfflineVideo", () => {
      test("deletes offline video and file", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockOfflineVideo])
        );
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
        });
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

        await deleteOfflineVideo("video-1");

        expect(FileSystem.deleteAsync).toHaveBeenCalled();
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@offline_videos",
          "[]"
        );
      });
    });

    describe("isVideoOffline", () => {
      test("returns true if video is offline", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockOfflineVideo])
        );

        const result = await isVideoOffline("video-1");
        expect(result).toBe(true);
      });

      test("returns false if video is not offline", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const result = await isVideoOffline("video-2");
        expect(result).toBe(false);
      });
    });

    describe("getOfflineVideo", () => {
      test("returns offline video", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockOfflineVideo])
        );

        const video = await getOfflineVideo("video-1");
        expect(video?.id).toBe("video-1");
      });

      test("returns null if not found", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

        const video = await getOfflineVideo("video-2");
        expect(video).toBeNull();
      });
    });

    describe("clearOfflineVideos", () => {
      test("clears all offline videos and files", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([mockOfflineVideo])
        );
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
        });
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

        await clearOfflineVideos();

        expect(FileSystem.deleteAsync).toHaveBeenCalled();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@offline_videos");
      });
    });
  });

  // ==========================================================================
  // Video Operations Tests
  // ==========================================================================

  describe("Video Operations", () => {
    describe("getVideoInfo", () => {
      test("returns video info", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
          size: 1048576,
        });

        const info = await getVideoInfo("/path/to/video.mp4");

        expect(info.uri).toBe("/path/to/video.mp4");
        expect(info.filename).toBe("video.mp4");
      });

      test("throws error if file not found", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: false,
        });

        await expect(getVideoInfo("/path/to/missing.mp4")).rejects.toThrow(
          "Video file not found"
        );
      });
    });

    describe("shareVideo", () => {
      test("shares video when available", async () => {
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
        (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

        const result = await shareVideo("/path/to/video.mp4");

        expect(result).toBe(true);
        expect(Sharing.shareAsync).toHaveBeenCalled();
      });

      test("returns false when sharing not available", async () => {
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

        const result = await shareVideo("/path/to/video.mp4");

        expect(result).toBe(false);
      });
    });

    describe("saveVideoToGallery", () => {
      test("saves local video to gallery", async () => {
        (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
          status: "granted",
        });
        (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValue({});

        const result = await saveVideoToGallery("file:///video.mp4");

        expect(result).toBe(true);
        expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalled();
      });

      test("returns false when permission denied", async () => {
        (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
          status: "denied",
        });

        const result = await saveVideoToGallery("file:///video.mp4");

        expect(result).toBe(false);
      });
    });

    describe("deleteVideo", () => {
      test("deletes local video", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
          exists: true,
        });
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

        const result = await deleteVideo("file:///video.mp4");

        expect(result).toBe(true);
        expect(FileSystem.deleteAsync).toHaveBeenCalled();
      });

      test("returns false for remote URI", async () => {
        const result = await deleteVideo("https://example.com/video.mp4");

        expect(result).toBe(false);
      });
    });
  });

  // ==========================================================================
  // Service Class Tests
  // ==========================================================================

  describe("VideoViewerService Class", () => {
    test("initializes service", async () => {
      await VideoViewerService.initialize();
      // Should not throw
    });

    test("getSettings returns settings", async () => {
      const settings = await VideoViewerService.getSettings();
      expect(settings).toBeDefined();
    });

    test("updateSettings updates settings", async () => {
      await VideoViewerService.updateSettings({ defaultPlaybackSpeed: 1.5 });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("getPosition returns position", async () => {
      const position = await VideoViewerService.getPosition("video-1");
      expect(position).toBeNull(); // No stored position
    });

    test("getPlaylist returns playlist", async () => {
      const playlist = await VideoViewerService.getPlaylist();
      expect(playlist).toEqual([]);
    });

    test("getOfflineVideos returns offline videos", async () => {
      const videos = await VideoViewerService.getOfflineVideos();
      expect(videos).toEqual([]);
    });

    test("share shares video", async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await VideoViewerService.share("/video.mp4");
      expect(result).toBe(true);
    });
  });
});
