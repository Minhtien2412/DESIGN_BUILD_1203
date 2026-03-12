/**
 * VideoUploadService Tests
 * VIDEO-006: User Upload Video
 */

import {
    extractHashtags,
    formatCaption,
    validateVideo,
    VideoMetadata,
    VideoUploadService,
} from "@/services/VideoUploadService";
import * as api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Videos: "Videos",
  },
}));

jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(),
  createUploadTask: jest.fn(),
  FileSystemUploadType: {
    BINARY_CONTENT: 0,
  },
}));

jest.mock("@/services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("VideoUploadService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe("validateVideo", () => {
    it("should validate a valid video", () => {
      const metadata: VideoMetadata = {
        uri: "file://video.mp4",
        duration: 60,
        width: 1080,
        height: 1920,
        fileSize: 50 * 1024 * 1024, // 50MB
        mimeType: "video/mp4",
        filename: "test.mp4",
      };

      const result = validateVideo(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject video exceeding duration limit", () => {
      const metadata: VideoMetadata = {
        uri: "file://video.mp4",
        duration: 240, // 4 minutes (> 3 min limit)
        width: 1080,
        height: 1920,
        fileSize: 50 * 1024 * 1024,
        mimeType: "video/mp4",
        filename: "test.mp4",
      };

      const result = validateVideo(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Video quá dài. Tối đa 3 phút.");
    });

    it("should reject video too short", () => {
      const metadata: VideoMetadata = {
        uri: "file://video.mp4",
        duration: 0.5, // 0.5 seconds
        width: 1080,
        height: 1920,
        fileSize: 1024,
        mimeType: "video/mp4",
        filename: "test.mp4",
      };

      const result = validateVideo(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Video quá ngắn. Tối thiểu 1 giây.");
    });

    it("should reject video exceeding size limit", () => {
      const metadata: VideoMetadata = {
        uri: "file://video.mp4",
        duration: 60,
        width: 1080,
        height: 1920,
        fileSize: 250 * 1024 * 1024, // 250MB (> 200MB limit)
        mimeType: "video/mp4",
        filename: "test.mp4",
      };

      const result = validateVideo(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("File quá lớn. Tối đa 200MB.");
    });

    it("should reject unsupported format", () => {
      const metadata: VideoMetadata = {
        uri: "file://video.avi",
        duration: 60,
        width: 1080,
        height: 1920,
        fileSize: 50 * 1024 * 1024,
        mimeType: "video/avi",
        filename: "test.avi",
      };

      const result = validateVideo(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Định dạng không hỗ trợ. Chỉ hỗ trợ MP4, MOV, M4V."
      );
    });
  });

  describe("extractHashtags", () => {
    it("should extract hashtags from text", () => {
      const text = "Check out my #video about #construction #decor";
      const hashtags = extractHashtags(text);

      expect(hashtags).toEqual(["#video", "#construction", "#decor"]);
    });

    it("should handle text without hashtags", () => {
      const text = "Just a normal caption without any tags";
      const hashtags = extractHashtags(text);

      expect(hashtags).toEqual([]);
    });

    it("should dedupe duplicate hashtags", () => {
      const text = "#viral #trending #viral #fyp #trending";
      const hashtags = extractHashtags(text);

      expect(hashtags).toEqual(["#viral", "#trending", "#fyp"]);
    });

    it("should handle Vietnamese hashtags", () => {
      const text = "Nhà đẹp #xâydựng #thiếtkế #nộithất";
      const hashtags = extractHashtags(text);

      expect(hashtags).toHaveLength(3);
    });
  });

  describe("formatCaption", () => {
    it("should format caption with hashtags", () => {
      const caption = "My awesome video";
      const hashtags = ["viral", "fyp", "trending"];

      const result = formatCaption(caption, hashtags);

      expect(result).toBe("My awesome video\n\n#viral #fyp #trending");
    });

    it("should remove existing hashtags from caption", () => {
      const caption = "My video #old #tags here";
      const hashtags = ["new", "hashtags"];

      const result = formatCaption(caption, hashtags);

      expect(result).toBe("My video   here\n\n#new #hashtags");
    });

    it("should handle empty hashtags", () => {
      const caption = "Just caption";
      const hashtags: string[] = [];

      const result = formatCaption(caption, hashtags);

      expect(result).toBe("Just caption");
    });

    it("should handle hashtags with or without # prefix", () => {
      const caption = "Test";
      const hashtags = ["#already", "without"];

      const result = formatCaption(caption, hashtags);

      expect(result).toBe("Test\n\n#already #without");
    });
  });

  describe("uploadVideo", () => {
    const validMetadata: VideoMetadata = {
      uri: "file://video.mp4",
      duration: 60,
      width: 1080,
      height: 1920,
      fileSize: 50 * 1024 * 1024,
      mimeType: "video/mp4",
      filename: "test.mp4",
    };

    it("should create upload task for valid video", async () => {
      await VideoUploadService.initialize();

      // Mock presigned URL
      (api.post as jest.Mock).mockResolvedValueOnce({
        uploadId: "server-upload-123",
        uploadUrl: "https://storage.example.com/upload",
        expiresAt: Date.now() + 3600000,
      });

      // Mock file upload
      const mockUploadTask = {
        uploadAsync: jest.fn().mockResolvedValue({ status: 200 }),
        cancelAsync: jest.fn(),
      };
      (FileSystem.createUploadTask as jest.Mock).mockReturnValue(
        mockUploadTask
      );

      // Mock complete
      (api.post as jest.Mock).mockResolvedValueOnce({
        videoUrl: "https://cdn.example.com/video.mp4",
        thumbnailUrl: "https://cdn.example.com/thumb.jpg",
      });

      const task = await VideoUploadService.uploadVideo({
        video: validMetadata,
        caption: "Test video",
        hashtags: ["test"],
        visibility: "public",
        allowComments: true,
        allowDuet: true,
        allowStitch: true,
      });

      expect(task).toBeDefined();
      expect(task.id).toContain("upload-");
      expect(task.progress.status).toBe("preparing");
    });

    it("should reject invalid video", async () => {
      await VideoUploadService.initialize();

      const invalidMetadata: VideoMetadata = {
        ...validMetadata,
        duration: 300, // Too long
      };

      await expect(
        VideoUploadService.uploadVideo({
          video: invalidMetadata,
          caption: "Test",
          hashtags: [],
          visibility: "public",
          allowComments: true,
          allowDuet: true,
          allowStitch: true,
        })
      ).rejects.toThrow("Video quá dài");
    });
  });

  describe("getPendingUploads", () => {
    it("should return pending uploads", async () => {
      await VideoUploadService.initialize();

      const pending = VideoUploadService.getPendingUploads();

      expect(Array.isArray(pending)).toBe(true);
    });
  });

  describe("getRecentUploads", () => {
    it("should return recent uploads", async () => {
      await VideoUploadService.initialize();

      const recent = VideoUploadService.getRecentUploads(5);

      expect(Array.isArray(recent)).toBe(true);
    });
  });
});

describe("Video Picker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should request permissions before picking", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "denied",
    });

    const { pickVideoFromGallery } = require("@/services/VideoUploadService");

    await expect(pickVideoFromGallery()).rejects.toThrow(
      "Cần quyền truy cập thư viện"
    );

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
  });

  it("should return null when user cancels", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { pickVideoFromGallery } = require("@/services/VideoUploadService");

    const result = await pickVideoFromGallery();

    expect(result).toBeNull();
  });

  it("should return metadata on successful pick", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file://picked-video.mp4",
          duration: 30000, // 30 seconds in ms
          width: 1080,
          height: 1920,
          mimeType: "video/mp4",
          fileName: "picked.mp4",
        },
      ],
    });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      size: 25 * 1024 * 1024,
    });

    const { pickVideoFromGallery } = require("@/services/VideoUploadService");

    const result = await pickVideoFromGallery();

    expect(result).toBeDefined();
    expect(result.uri).toBe("file://picked-video.mp4");
    expect(result.duration).toBe(30); // Converted to seconds
  });
});

describe("Camera Recording", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should request camera permissions", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { recordVideo } = require("@/services/VideoUploadService");

    await expect(recordVideo()).rejects.toThrow("Cần quyền camera");

    expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
  });
});
