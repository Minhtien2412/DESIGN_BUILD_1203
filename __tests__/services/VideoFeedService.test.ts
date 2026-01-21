/**
 * Tests for VideoFeedService
 * VIDEO-004: Feed APIs
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock api module
jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
}));

import { get } from "../../services/api";
import {
    decodeCursor,
    encodeCursor,
    VideoFeedService,
    VideoItem
} from "../../services/VideoFeedService";

const mockGet = get as jest.MockedFunction<typeof get>;

// Mock video data
const createMockVideo = (id: string): VideoItem => ({
  id,
  url: `https://example.com/video/${id}.mp4`,
  thumbnailUrl: `https://example.com/thumb/${id}.jpg`,
  title: `Video ${id}`,
  description: `Description for video ${id}`,
  duration: 30,
  views: 1000,
  likes: 100,
  shares: 10,
  saves: 50,
  comments: 25,
  createdAt: new Date().toISOString(),
  author: {
    id: `author-${id}`,
    username: `user${id}`,
    displayName: `User ${id}`,
    avatarUrl: `https://example.com/avatar/${id}.jpg`,
    isVerified: false,
  },
  tags: ["tag1", "tag2"],
});

describe("VideoFeedService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    VideoFeedService.clearCache();
  });

  describe("Cursor Encoding/Decoding", () => {
    it("should encode cursor correctly", () => {
      const data = {
        lastId: "video-123",
        lastTimestamp: 1705555200000,
        feedType: "for_you" as const,
      };

      const encoded = encodeCursor(data);

      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);
    });

    it("should decode cursor correctly", () => {
      const original = {
        lastId: "video-456",
        lastTimestamp: 1705555200000,
        feedType: "trending" as const,
        offset: 10,
      };

      const encoded = encodeCursor(original);
      const decoded = decodeCursor(encoded);

      expect(decoded).toEqual(original);
    });

    it("should return null for invalid cursor", () => {
      const decoded = decodeCursor("invalid-cursor");
      expect(decoded).toBeNull();
    });
  });

  describe("getFeed", () => {
    it("should fetch for_you feed", async () => {
      const mockVideos = [createMockVideo("1"), createMockVideo("2")];

      mockGet.mockResolvedValueOnce({
        data: mockVideos,
        pagination: {
          nextCursor: "cursor-abc",
          prevCursor: null,
          hasMore: true,
          total: 100,
        },
      });

      const response = await VideoFeedService.getForYouFeed();

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/feed/for-you", {
        params: { limit: 10 },
      });
      expect(response.videos).toHaveLength(2);
      expect(response.hasMore).toBe(true);
      expect(response.feedType).toBe("for_you");
    });

    it("should fetch following feed", async () => {
      const mockVideos = [createMockVideo("3")];

      mockGet.mockResolvedValueOnce({
        data: mockVideos,
        pagination: {
          nextCursor: null,
          prevCursor: null,
          hasMore: false,
        },
      });

      const response = await VideoFeedService.getFollowingFeed();

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/feed/following", {
        params: { limit: 10 },
      });
      expect(response.feedType).toBe("following");
    });

    it("should fetch trending feed", async () => {
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("4")],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      const response = await VideoFeedService.getTrendingFeed();

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/feed/trending", {
        params: { limit: 10 },
      });
      expect(response.feedType).toBe("trending");
    });

    it("should pass cursor for pagination", async () => {
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("5")],
        pagination: {
          nextCursor: "cursor-xyz",
          prevCursor: "cursor-abc",
          hasMore: true,
        },
      });

      await VideoFeedService.getForYouFeed("cursor-abc");

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/feed/for-you", {
        params: { limit: 10, cursor: "cursor-abc" },
      });
    });
  });

  describe("Deduplication", () => {
    it("should dedupe duplicate videos", async () => {
      const video1 = createMockVideo("dup-1");
      const video2 = createMockVideo("dup-1"); // Same ID
      const video3 = createMockVideo("dup-2");

      mockGet.mockResolvedValueOnce({
        data: [video1, video2, video3],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      const response = await VideoFeedService.getForYouFeed(undefined, true);

      // Should only have 2 unique videos
      expect(response.videos).toHaveLength(2);
      expect(response.videos.map((v) => v.id)).toEqual(["dup-1", "dup-2"]);
    });

    it("should dedupe across multiple loads", async () => {
      // First load
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("multi-1"), createMockVideo("multi-2")],
        pagination: { nextCursor: "cursor-1", prevCursor: null, hasMore: true },
      });

      const response1 = await VideoFeedService.getForYouFeed(undefined, true);
      expect(response1.videos).toHaveLength(2);

      // Second load with one duplicate
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("multi-2"), createMockVideo("multi-3")], // multi-2 is duplicate
        pagination: {
          nextCursor: null,
          prevCursor: "cursor-1",
          hasMore: false,
        },
      });

      const response2 = await VideoFeedService.getForYouFeed("cursor-1");

      // Should only have 1 new video (multi-3), dedupe removes multi-2
      expect(response2.videos).toHaveLength(1);
      expect(response2.videos[0].id).toBe("multi-3");
    });

    it("should reset dedupe on refresh", async () => {
      // First load
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("reset-1")],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      await VideoFeedService.getForYouFeed(undefined, true);

      // Refresh with same video
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("reset-1")], // Same ID but should not be deduped after refresh
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      const response = await VideoFeedService.getForYouFeed(undefined, true);

      // Should have the video since dedupe was reset
      expect(response.videos).toHaveLength(1);
    });
  });

  describe("Cache", () => {
    it("should cache initial feed", async () => {
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("cache-1")],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      // First call
      await VideoFeedService.getForYouFeed();

      // Second call - should use cache
      const response = await VideoFeedService.getForYouFeed();

      // API should only be called once
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(response.videos).toHaveLength(1);
    });

    it("should bypass cache on refresh", async () => {
      mockGet.mockResolvedValue({
        data: [createMockVideo("fresh-1")],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      // First call
      await VideoFeedService.getForYouFeed();

      // Refresh - should bypass cache
      await VideoFeedService.getForYouFeed(undefined, true);

      // API should be called twice
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should clear cache", async () => {
      mockGet.mockResolvedValue({
        data: [createMockVideo("clear-1")],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      await VideoFeedService.getForYouFeed();
      VideoFeedService.clearCache();
      await VideoFeedService.getForYouFeed();

      // API should be called twice (cache was cleared)
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe("Search", () => {
    it("should search videos", async () => {
      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("search-1"), createMockVideo("search-2")],
        pagination: {
          nextCursor: null,
          prevCursor: null,
          hasMore: false,
          total: 2,
        },
      });

      const response = await VideoFeedService.searchVideos("test query");

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/search", {
        params: expect.objectContaining({
          q: "test query",
          limit: 10,
        }),
      });
      expect(response.videos).toHaveLength(2);
      expect(response.feedType).toBe("search");
    });
  });

  describe("Single Video", () => {
    it("should get single video by ID", async () => {
      const mockVideo = createMockVideo("single-1");
      mockGet.mockResolvedValueOnce(mockVideo);

      const video = await VideoFeedService.getVideo("single-1");

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/single-1");
      expect(video).toEqual(mockVideo);
    });

    it("should return null for non-existent video", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));

      const video = await VideoFeedService.getVideo("non-existent");

      expect(video).toBeNull();
    });
  });

  describe("Related Videos", () => {
    it("should get related videos", async () => {
      const mockVideos = [
        createMockVideo("related-1"),
        createMockVideo("related-2"),
      ];
      mockGet.mockResolvedValueOnce({ data: mockVideos });

      const videos = await VideoFeedService.getRelatedVideos("video-1");

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/video-1/related", {
        params: { limit: 10 },
      });
      expect(videos).toHaveLength(2);
    });
  });

  describe("Filters", () => {
    it("should apply tag filters", async () => {
      mockGet.mockResolvedValueOnce({
        data: [],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      await VideoFeedService.getDiscoverFeed(undefined, {
        tags: ["funny", "pets"],
      });

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/feed/discover", {
        params: expect.objectContaining({
          tags: "funny,pets",
        }),
      });
    });

    it("should apply author filter", async () => {
      mockGet.mockResolvedValueOnce({
        data: [],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      await VideoFeedService.getAuthorVideos("author-123");

      expect(mockGet).toHaveBeenCalledWith("/api/v1/videos/feed/discover", {
        params: expect.objectContaining({
          authorId: "author-123",
        }),
      });
    });
  });

  describe("Dedupe Stats", () => {
    it("should track dedupe stats", async () => {
      VideoFeedService.clearCache(); // Reset stats

      mockGet.mockResolvedValueOnce({
        data: [createMockVideo("stat-1"), createMockVideo("stat-2")],
        pagination: { nextCursor: null, prevCursor: null, hasMore: false },
      });

      await VideoFeedService.getForYouFeed(undefined, true);

      const stats = VideoFeedService.getDedupeStats();
      expect(stats.seenCount).toBe(2);
      expect(stats.sessionStart).toBeLessThanOrEqual(Date.now());
    });
  });
});
