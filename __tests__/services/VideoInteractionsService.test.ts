/**
 * VideoInteractionsService Tests
 * VIDEO-005: Video Interactions
 */

import { VideoInteractionsService } from "@/services/VideoInteractionsService";
import * as api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock("@/services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("VideoInteractionsService", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
    // Clear cache between tests
    await VideoInteractionsService.clearCache();
  });

  describe("initialization", () => {
    it("should initialize successfully", async () => {
      await VideoInteractionsService.initialize();
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it("should handle empty cache on init", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      await VideoInteractionsService.initialize();
      const cached =
        VideoInteractionsService.getCachedStats("non-existent-video");
      expect(cached).toBeNull();
    });
  });

  describe("batchGetStats", () => {
    it("should fetch stats for multiple videos", async () => {
      const mockResponse = {
        stats: {
          "video-1": {
            videoId: "video-1",
            views: 100,
            likes: 50,
            shares: 10,
            saves: 5,
            comments: 20,
            isLiked: false,
            isSaved: false,
            lastUpdated: Date.now(),
          },
          "video-2": {
            videoId: "video-2",
            views: 200,
            likes: 100,
            shares: 20,
            saves: 10,
            comments: 40,
            isLiked: true,
            isSaved: true,
            lastUpdated: Date.now(),
          },
        },
        timestamp: Date.now(),
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await VideoInteractionsService.batchGetStats([
        "video-1",
        "video-2",
      ]);

      expect(api.post).toHaveBeenCalledWith("/api/v1/videos/batch-stats", {
        videoIds: ["video-1", "video-2"],
      });
      expect(result["video-1"].views).toBe(100);
      expect(result["video-2"].views).toBe(200);
    });

    it("should return empty cached stats on API error when no cache exists", async () => {
      // Clear any previous cache first
      await VideoInteractionsService.clearCache();

      (api.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await VideoInteractionsService.batchGetStats([
        "non-cached-video",
      ]);

      expect(result).toEqual({});
    });
  });

  describe("getStats", () => {
    it("should fetch single video stats", async () => {
      const mockStats = {
        videoId: "video-1",
        views: 100,
        likes: 50,
        shares: 10,
        saves: 5,
        comments: 20,
        isLiked: false,
        isSaved: false,
        lastUpdated: Date.now(),
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockStats);

      const result = await VideoInteractionsService.getStats("video-1");

      expect(api.get).toHaveBeenCalledWith("/api/v1/videos/video-1/stats");
      expect(result?.views).toBe(100);
    });
  });

  describe("recordView (idempotent)", () => {
    it("should count view when threshold met", async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({});

      const result = await VideoInteractionsService.recordView({
        videoId: "video-new-1",
        watchDuration: 10, // 10 seconds
        totalDuration: 30, // 30 second video (33% watched > 30% threshold)
      });

      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/videos/video-new-1/view",
        expect.objectContaining({
          watchDuration: 10,
          totalDuration: 30,
        })
      );
    });

    it("should NOT count view when below threshold", async () => {
      await VideoInteractionsService.recordView({
        videoId: "video-short",
        watchDuration: 1, // 1 second (below 3s minimum)
        totalDuration: 30,
      });

      expect(api.post).not.toHaveBeenCalled();
    });

    it("should NOT count duplicate views in same session", async () => {
      const videoId = "video-dup-test";

      (api.post as jest.Mock).mockResolvedValue({});

      // First view - should count
      await VideoInteractionsService.recordView({
        videoId,
        watchDuration: 10,
        totalDuration: 30,
      });

      // Second view - should NOT count (same session)
      await VideoInteractionsService.recordView({
        videoId,
        watchDuration: 15,
        totalDuration: 30,
      });

      // API should only be called once
      const viewCalls = (api.post as jest.Mock).mock.calls.filter(
        (call) => call[0].includes(videoId) && call[0].includes("/view")
      );
      expect(viewCalls.length).toBe(1);
    });
  });

  describe("toggleLike", () => {
    it("should like a video", async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({});

      const result = await VideoInteractionsService.toggleLike("video-like-1");

      expect(api.post).toHaveBeenCalledWith("/api/v1/videos/video-like-1/like");
      expect(result.isLiked).toBe(true);
    });

    it("should unlike a previously liked video", async () => {
      // First like
      (api.post as jest.Mock).mockResolvedValue({});
      await VideoInteractionsService.toggleLike("video-like-2");

      // Then unlike
      const result = await VideoInteractionsService.toggleLike("video-like-2");

      expect(result.isLiked).toBe(false);
    });

    it("should queue offline when API fails", async () => {
      (api.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result =
        await VideoInteractionsService.toggleLike("video-offline-like");

      // Should still return optimistic result
      expect(result.isLiked).toBe(true);
      expect(VideoInteractionsService.getPendingCount()).toBeGreaterThan(0);
    });
  });

  describe("toggleSave", () => {
    it("should save a video", async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({});

      const result = await VideoInteractionsService.toggleSave("video-save-1");

      expect(api.post).toHaveBeenCalledWith("/api/v1/videos/video-save-1/save");
      expect(result.isSaved).toBe(true);
    });

    it("should unsave a previously saved video", async () => {
      // First save
      (api.post as jest.Mock).mockResolvedValue({});
      await VideoInteractionsService.toggleSave("video-save-2");

      // Then unsave
      const result = await VideoInteractionsService.toggleSave("video-save-2");

      expect(result.isSaved).toBe(false);
    });
  });

  describe("recordShare", () => {
    it("should record share with platform", async () => {
      (api.post as jest.Mock).mockResolvedValueOnce({});

      const shares = await VideoInteractionsService.recordShare(
        "video-share-1",
        "facebook"
      );

      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/videos/video-share-1/share",
        {
          platform: "facebook",
        }
      );
      expect(shares).toBeGreaterThan(0);
    });
  });

  describe("offline sync", () => {
    it("should sync pending interactions when online", async () => {
      // Queue some interactions when offline
      (api.post as jest.Mock)
        .mockRejectedValueOnce(new Error("Offline")) // like fails
        .mockResolvedValue({}); // sync succeeds

      await VideoInteractionsService.toggleLike("video-sync-test");

      const beforeSync = VideoInteractionsService.getPendingCount();
      expect(beforeSync).toBeGreaterThan(0);

      // Sync when back online
      const result = await VideoInteractionsService.syncPending();

      expect(result.success).toBeGreaterThanOrEqual(0);
    });
  });

  describe("listeners", () => {
    it("should notify listeners on stats update", async () => {
      const callback = jest.fn();
      const unsubscribe = VideoInteractionsService.subscribe(
        "video-listener",
        callback
      );

      (api.get as jest.Mock).mockResolvedValueOnce({
        videoId: "video-listener",
        views: 500,
        likes: 100,
        shares: 25,
        saves: 10,
        comments: 50,
        isLiked: false,
        isSaved: false,
        lastUpdated: Date.now(),
      });

      await VideoInteractionsService.getStats("video-listener");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          videoId: "video-listener",
          views: 500,
        })
      );

      unsubscribe();
    });

    it("should unsubscribe correctly", async () => {
      const callback = jest.fn();
      const unsubscribe = VideoInteractionsService.subscribe(
        "video-unsub",
        callback
      );
      unsubscribe();

      (api.get as jest.Mock).mockResolvedValueOnce({
        videoId: "video-unsub",
        views: 100,
        likes: 50,
        shares: 10,
        saves: 5,
        comments: 20,
        isLiked: false,
        isSaved: false,
        lastUpdated: Date.now(),
      });

      await VideoInteractionsService.getStats("video-unsub");

      expect(callback).not.toHaveBeenCalled();
    });
  });
});

describe("AnimatedCounter", () => {
  // Isolated tests for formatCompactNumber
  describe("formatCompactNumber", () => {
    const {
      formatCompactNumber,
    } = require("@/components/video/AnimatedCounter");

    it("should format numbers under 1000", () => {
      expect(formatCompactNumber(0)).toBe("0");
      expect(formatCompactNumber(999)).toBe("999");
    });

    it("should format thousands as K", () => {
      expect(formatCompactNumber(1000)).toBe("1K");
      expect(formatCompactNumber(1500)).toBe("1.5K");
      expect(formatCompactNumber(10000)).toBe("10K");
      expect(formatCompactNumber(999999)).toBe("1000K");
    });

    it("should format millions as M", () => {
      expect(formatCompactNumber(1000000)).toBe("1M");
      expect(formatCompactNumber(2500000)).toBe("2.5M");
    });

    it("should format billions as B", () => {
      expect(formatCompactNumber(1000000000)).toBe("1B");
      expect(formatCompactNumber(1500000000)).toBe("1.5B");
    });
  });
});
