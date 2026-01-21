/**
 * Tests for CameraService
 * CAM-001: Camera Capture
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

import {
    ASPECT_RATIOS,
    calculateZoomFromPinch,
    CameraService,
    capturePhotoWithPicker,
    captureVideoWithPicker,
    checkCameraPermissions,
    cycleFlashMode,
    formatRecordingDuration,
    formatZoomDisplay,
    getFlashIcon,
    getFlashLabel,
    isValidVideoDuration,
    loadCameraSettings,
    QUALITY_PRESETS,
    requestAllPermissions,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestMicrophonePermission,
    resetCameraSettings,
    saveCameraSettings,
    saveToGallery,
} from "../../services/CameraService";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  getCameraPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  getMicrophonePermissionsAsync: jest.fn(),
  requestMicrophonePermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  UIImagePickerControllerQualityType: {
    High: 1,
    Medium: 0,
    Low: 2,
  },
}));

jest.mock("expo-media-library", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  saveToLibraryAsync: jest.fn(),
}));

jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
  openSettings: jest.fn(),
}));

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: "ios",
  },
}));

describe("CameraService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // ===========================================================================
  // PERMISSION TESTS
  // ===========================================================================

  describe("checkCameraPermissions", () => {
    it("should return all permission states", async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (
        ImagePicker.getMicrophonePermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (MediaLibrary.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });

      const result = await checkCameraPermissions();

      expect(result.camera).toBe("granted");
      expect(result.microphone).toBe("granted");
      expect(result.mediaLibrary).toBe("denied");
    });
  });

  describe("requestCameraPermission", () => {
    it("should return true when permission granted", async () => {
      (
        ImagePicker.requestCameraPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });

      const result = await requestCameraPermission();

      expect(result).toBe(true);
    });

    it("should return false when permission denied", async () => {
      (
        ImagePicker.requestCameraPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "denied",
      });

      const result = await requestCameraPermission();

      expect(result).toBe(false);
    });
  });

  describe("requestMicrophonePermission", () => {
    it("should return true when permission granted", async () => {
      (
        ImagePicker.requestMicrophonePermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });

      const result = await requestMicrophonePermission();

      expect(result).toBe(true);
    });
  });

  describe("requestMediaLibraryPermission", () => {
    it("should return true when permission granted", async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });

      const result = await requestMediaLibraryPermission();

      expect(result).toBe(true);
    });
  });

  describe("requestAllPermissions", () => {
    it("should request all permissions at once", async () => {
      (
        ImagePicker.requestCameraPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (
        ImagePicker.requestMicrophonePermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });

      const result = await requestAllPermissions(true);

      expect(result.camera).toBe("granted");
      expect(result.microphone).toBe("granted");
      expect(result.mediaLibrary).toBe("granted");
    });
  });

  // ===========================================================================
  // SETTINGS TESTS
  // ===========================================================================

  describe("loadCameraSettings", () => {
    it("should return default settings when none stored", async () => {
      const settings = await loadCameraSettings();

      expect(settings.mode).toBe("photo");
      expect(settings.facing).toBe("back");
      expect(settings.flash).toBe("auto");
      expect(settings.quality).toBe(0.8);
    });

    it("should return stored settings", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ mode: "video", flash: "on" })
      );

      const settings = await loadCameraSettings();

      expect(settings.mode).toBe("video");
      expect(settings.flash).toBe("on");
    });
  });

  describe("saveCameraSettings", () => {
    it("should save settings to storage", async () => {
      await saveCameraSettings({ mode: "video" });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("resetCameraSettings", () => {
    it("should remove stored settings", async () => {
      const settings = await resetCameraSettings();

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
      expect(settings.mode).toBe("photo");
    });
  });

  // ===========================================================================
  // CAPTURE TESTS
  // ===========================================================================

  describe("capturePhotoWithPicker", () => {
    it("should capture photo when permission granted", async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file://photo.jpg",
            width: 1920,
            height: 1080,
            fileSize: 1024000,
          },
        ],
      });

      const result = await capturePhotoWithPicker();

      expect(result).not.toBeNull();
      expect(result?.type).toBe("photo");
      expect(result?.uri).toBe("file://photo.jpg");
    });

    it("should return null when user cancels", async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await capturePhotoWithPicker();

      expect(result).toBeNull();
    });

    it("should request permission if not granted", async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });
      (
        ImagePicker.requestCameraPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://photo.jpg" }],
      });

      await capturePhotoWithPicker();

      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe("captureVideoWithPicker", () => {
    it("should capture video when permissions granted", async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (
        ImagePicker.getMicrophonePermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file://video.mp4",
            width: 1920,
            height: 1080,
            duration: 15,
            fileSize: 5000000,
          },
        ],
      });

      const result = await captureVideoWithPicker();

      expect(result).not.toBeNull();
      expect(result?.type).toBe("video");
      expect(result?.duration).toBe(15);
    });
  });

  describe("saveToGallery", () => {
    it("should save media when permission granted", async () => {
      (MediaLibrary.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValue({});

      const result = await saveToGallery("file://photo.jpg");

      expect(result).toBe(true);
      expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalled();
    });

    it("should request permission if not granted", async () => {
      (MediaLibrary.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (MediaLibrary.saveToLibraryAsync as jest.Mock).mockResolvedValue({});

      await saveToGallery("file://photo.jpg");

      expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // ZOOM TESTS
  // ===========================================================================

  describe("calculateZoomFromPinch", () => {
    it("should calculate zoom from pinch scale", () => {
      const zoom = calculateZoomFromPinch(1.5, 0.5, 0.1);

      expect(zoom).toBeGreaterThan(0.5);
    });

    it("should clamp zoom between 0 and 1", () => {
      const zoomMax = calculateZoomFromPinch(10, 0.9, 0.5);
      const zoomMin = calculateZoomFromPinch(0.1, 0.1, 0.5);

      expect(zoomMax).toBeLessThanOrEqual(1);
      expect(zoomMin).toBeGreaterThanOrEqual(0);
    });
  });

  describe("formatZoomDisplay", () => {
    it("should format zoom as multiplier", () => {
      expect(formatZoomDisplay(0)).toBe("1.0x");
      expect(formatZoomDisplay(1)).toBe("10.0x");
      expect(formatZoomDisplay(0.5)).toBe("5.5x");
    });
  });

  // ===========================================================================
  // FLASH TESTS
  // ===========================================================================

  describe("cycleFlashMode", () => {
    it("should cycle through flash modes", () => {
      expect(cycleFlashMode("auto")).toBe("on");
      expect(cycleFlashMode("on")).toBe("off");
      expect(cycleFlashMode("off")).toBe("auto");
    });
  });

  describe("getFlashIcon", () => {
    it("should return correct icon for each mode", () => {
      expect(getFlashIcon("off")).toBe("flash-off-outline");
      expect(getFlashIcon("on")).toBe("flash-outline");
      expect(getFlashIcon("auto")).toBe("flash-outline");
      expect(getFlashIcon("torch")).toBe("flashlight-outline");
    });
  });

  describe("getFlashLabel", () => {
    it("should return Vietnamese labels", () => {
      expect(getFlashLabel("off")).toBe("Tắt");
      expect(getFlashLabel("on")).toBe("Bật");
      expect(getFlashLabel("auto")).toBe("Tự động");
    });
  });

  // ===========================================================================
  // DURATION TESTS
  // ===========================================================================

  describe("formatRecordingDuration", () => {
    it("should format seconds as mm:ss", () => {
      expect(formatRecordingDuration(0)).toBe("0:00");
      expect(formatRecordingDuration(5)).toBe("0:05");
      expect(formatRecordingDuration(65)).toBe("1:05");
      expect(formatRecordingDuration(125)).toBe("2:05");
    });
  });

  describe("isValidVideoDuration", () => {
    it("should validate video duration", () => {
      expect(isValidVideoDuration(1)).toBe(false); // too short
      expect(isValidVideoDuration(5)).toBe(true);
      expect(isValidVideoDuration(60)).toBe(true);
      expect(isValidVideoDuration(300)).toBe(true);
      expect(isValidVideoDuration(400)).toBe(false); // too long
    });
  });

  // ===========================================================================
  // CONSTANTS TESTS
  // ===========================================================================

  describe("QUALITY_PRESETS", () => {
    it("should have correct preset values", () => {
      expect(QUALITY_PRESETS).toHaveLength(4);
      expect(QUALITY_PRESETS[0].value).toBe(0.3);
      expect(QUALITY_PRESETS[3].value).toBe(1.0);
    });
  });

  describe("ASPECT_RATIOS", () => {
    it("should include standard ratios", () => {
      const values = ASPECT_RATIOS.map((r) => r.value);
      expect(values).toContain("4:3");
      expect(values).toContain("16:9");
      expect(values).toContain("1:1");
    });
  });

  // ===========================================================================
  // SERVICE CLASS TESTS
  // ===========================================================================

  describe("CameraService class", () => {
    it("should initialize with default settings", async () => {
      await CameraService.init();
      const settings = CameraService.getSettings();

      expect(settings.mode).toBe("photo");
      expect(settings.facing).toBe("back");
    });

    it("should update settings", async () => {
      await CameraService.init();
      await CameraService.updateSettings({ mode: "video" });
      const settings = CameraService.getSettings();

      expect(settings.mode).toBe("video");
    });

    it("should check permissions", async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (
        ImagePicker.getMicrophonePermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: "granted",
      });
      (MediaLibrary.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });

      const perms = await CameraService.checkPermissions();

      expect(perms.camera).toBe("granted");
    });
  });
});
