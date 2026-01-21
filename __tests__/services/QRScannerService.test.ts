/**
 * QRScannerService.test.ts
 *
 * Tests for QR/Barcode scanner service
 * Story: CAM-003
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock("expo-linking", () => ({
  canOpenURL: jest.fn().mockResolvedValue(true),
  openURL: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}));

import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import {
    BARCODE_TYPE_NAMES,
    callPhone,
    CATEGORY_ICONS,
    CATEGORY_LABELS,
    clearScanHistory,
    copyToClipboard,
    DEFAULT_SCANNER_SETTINGS,
    deleteHistoryEntry,
    detectCategory,
    extractEmail,
    extractPhoneNumber,
    formatScanResult,
    formatScanTime,
    getAvailableActions,
    getFavorites,
    loadScanHistory,
    loadScannerSettings,
    openLocation,
    openUrl,
    parseVCard,
    parseWiFiQR,
    saveScannerSettings,
    saveScanToHistory,
    ScanHistoryEntry,
    ScanResult,
    searchHistory,
    sendEmail,
    toggleFavorite,
    updateHistoryEntry,
} from "../../services/QRScannerService";

describe("QRScannerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  // ==========================================================================
  // Category Detection Tests
  // ==========================================================================

  describe("detectCategory", () => {
    it("should detect URL with http", () => {
      expect(detectCategory("https://example.com")).toBe("url");
      expect(detectCategory("http://test.com/path")).toBe("url");
    });

    it("should detect URL with www", () => {
      expect(detectCategory("www.example.com")).toBe("url");
    });

    it("should detect URL by domain extension", () => {
      expect(detectCategory("example.com")).toBe("url");
      expect(detectCategory("test.vn")).toBe("url");
      expect(detectCategory("app.io")).toBe("url");
    });

    it("should detect phone numbers", () => {
      expect(detectCategory("tel:+84901234567")).toBe("phone");
      expect(detectCategory("+84901234567")).toBe("phone");
      expect(detectCategory("0901234567")).toBe("phone");
      expect(detectCategory("0901-234-567")).toBe("phone");
    });

    it("should detect email", () => {
      expect(detectCategory("mailto:test@example.com")).toBe("email");
      expect(detectCategory("test@example.com")).toBe("email");
    });

    it("should detect SMS", () => {
      expect(detectCategory("sms:+84901234567")).toBe("sms");
      expect(detectCategory("smsto:123456")).toBe("sms");
    });

    it("should detect WiFi", () => {
      expect(detectCategory("WIFI:T:WPA;S:MyNetwork;P:password;;")).toBe(
        "wifi"
      );
      expect(detectCategory("wifi:S:Test;P:pass;;")).toBe("wifi");
    });

    it("should detect vCard", () => {
      expect(
        detectCategory("BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD")
      ).toBe("vcard");
    });

    it("should detect geo location", () => {
      expect(detectCategory("geo:10.762622,106.660172")).toBe("geo");
    });

    it("should detect product codes (numeric)", () => {
      expect(detectCategory("12345678")).toBe("product");
      expect(detectCategory("8901234567890")).toBe("product");
    });

    it("should return text for general text", () => {
      expect(detectCategory("Hello World")).toBe("text");
      expect(detectCategory("Some random text")).toBe("text");
    });

    it("should return unknown for empty string", () => {
      expect(detectCategory("")).toBe("unknown");
      expect(detectCategory("   ")).toBe("unknown");
    });
  });

  // ==========================================================================
  // WiFi QR Parsing Tests
  // ==========================================================================

  describe("parseWiFiQR", () => {
    it("should parse WPA WiFi QR", () => {
      const result = parseWiFiQR("WIFI:T:WPA;S:MyNetwork;P:mypassword;;");
      expect(result).toEqual({
        ssid: "MyNetwork",
        password: "mypassword",
        security: "WPA",
        hidden: false,
      });
    });

    it("should parse WPA2 WiFi QR", () => {
      const result = parseWiFiQR("WIFI:T:WPA2;S:SecureNet;P:pass123;;");
      expect(result?.security).toBe("WPA");
      expect(result?.ssid).toBe("SecureNet");
    });

    it("should parse WEP WiFi QR", () => {
      const result = parseWiFiQR("WIFI:T:WEP;S:OldNetwork;P:wepkey;;");
      expect(result?.security).toBe("WEP");
    });

    it("should parse open WiFi QR", () => {
      const result = parseWiFiQR("WIFI:T:nopass;S:OpenNetwork;;");
      expect(result?.security).toBe("nopass");
      expect(result?.password).toBeUndefined();
    });

    it("should parse hidden network", () => {
      const result = parseWiFiQR("WIFI:T:WPA;S:HiddenNet;P:pass;H:true;;");
      expect(result?.hidden).toBe(true);
    });

    it("should handle password with special characters", () => {
      const result = parseWiFiQR("WIFI:T:WPA;S:Network;P:pass:word:123;;");
      expect(result?.password).toBe("pass:word:123");
    });

    it("should return null for non-WiFi data", () => {
      expect(parseWiFiQR("https://example.com")).toBeNull();
      expect(parseWiFiQR("Hello World")).toBeNull();
    });

    it("should return null for invalid WiFi format", () => {
      expect(parseWiFiQR("WIFI:invalid")).toBeNull();
    });
  });

  // ==========================================================================
  // vCard Parsing Tests
  // ==========================================================================

  describe("parseVCard", () => {
    it("should parse basic vCard", () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+84901234567
EMAIL:john@example.com
END:VCARD`;

      const result = parseVCard(vcard);
      expect(result?.name).toBe("John Doe");
      expect(result?.phone).toBe("+84901234567");
      expect(result?.email).toBe("john@example.com");
    });

    it("should parse vCard with organization", () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
ORG:Acme Corp
TITLE:Manager
END:VCARD`;

      const result = parseVCard(vcard);
      expect(result?.organization).toBe("Acme Corp");
      expect(result?.title).toBe("Manager");
    });

    it("should parse vCard with URL", () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Test User
URL:https://example.com
END:VCARD`;

      const result = parseVCard(vcard);
      expect(result?.url).toBe("https://example.com");
    });

    it("should return null for non-vCard data", () => {
      expect(parseVCard("Hello World")).toBeNull();
      expect(parseVCard("https://example.com")).toBeNull();
    });
  });

  // ==========================================================================
  // Utility Function Tests
  // ==========================================================================

  describe("extractPhoneNumber", () => {
    it("should extract phone from tel: URI", () => {
      expect(extractPhoneNumber("tel:+84901234567")).toBe("+84901234567");
    });

    it("should remove spaces and dashes", () => {
      expect(extractPhoneNumber("0901-234-567")).toBe("0901234567");
      expect(extractPhoneNumber("0901 234 567")).toBe("0901234567");
    });
  });

  describe("extractEmail", () => {
    it("should extract email from mailto: URI", () => {
      expect(extractEmail("mailto:test@example.com")).toBe("test@example.com");
    });

    it("should handle mailto with query params", () => {
      expect(extractEmail("mailto:test@example.com?subject=Hello")).toBe(
        "test@example.com"
      );
    });

    it("should return plain email as-is", () => {
      expect(extractEmail("test@example.com")).toBe("test@example.com");
    });
  });

  describe("formatScanResult", () => {
    it("should format WiFi result", () => {
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "WIFI:T:WPA;S:MyNetwork;P:pass;;",
        timestamp: Date.now(),
      };
      expect(formatScanResult(result)).toBe("WiFi: MyNetwork");
    });

    it("should format phone result", () => {
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "tel:+84901234567",
        timestamp: Date.now(),
      };
      expect(formatScanResult(result)).toBe("Điện thoại: +84901234567");
    });

    it("should truncate long URLs", () => {
      const longUrl = "https://example.com/" + "a".repeat(100);
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: longUrl,
        timestamp: Date.now(),
      };
      expect(formatScanResult(result).length).toBeLessThanOrEqual(53);
      expect(formatScanResult(result).endsWith("...")).toBe(true);
    });

    it("should truncate long text", () => {
      const longText = "x".repeat(150);
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: longText,
        timestamp: Date.now(),
      };
      expect(formatScanResult(result).length).toBeLessThanOrEqual(103);
    });
  });

  describe("formatScanTime", () => {
    it('should format recent time as "Vừa xong"', () => {
      const now = Date.now();
      expect(formatScanTime(now - 30 * 1000)).toBe("Vừa xong");
    });

    it("should format minutes ago", () => {
      const now = Date.now();
      const result = formatScanTime(now - 5 * 60 * 1000);
      expect(result).toContain("phút trước");
    });

    it("should format today with time", () => {
      const today = new Date();
      today.setHours(today.getHours() - 3);
      const result = formatScanTime(today.getTime());
      expect(result).toContain("Hôm nay");
    });

    it("should format yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);
      const result = formatScanTime(yesterday.getTime());
      expect(result).toContain("Hôm qua");
    });
  });

  // ==========================================================================
  // Settings Tests
  // ==========================================================================

  describe("loadScannerSettings", () => {
    it("should return default settings when none stored", async () => {
      const settings = await loadScannerSettings();
      expect(settings).toEqual(DEFAULT_SCANNER_SETTINGS);
    });

    it("should merge stored settings with defaults", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ enableVibration: false })
      );

      const settings = await loadScannerSettings();
      expect(settings.enableVibration).toBe(false);
      expect(settings.enableSound).toBe(DEFAULT_SCANNER_SETTINGS.enableSound);
    });

    it("should handle storage errors", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const settings = await loadScannerSettings();
      expect(settings).toEqual(DEFAULT_SCANNER_SETTINGS);
    });
  });

  describe("saveScannerSettings", () => {
    it("should save settings to storage", async () => {
      await saveScannerSettings({ enableVibration: false });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should throw on storage error", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      await expect(
        saveScannerSettings({ enableVibration: false })
      ).rejects.toThrow();
    });
  });

  // ==========================================================================
  // History Tests
  // ==========================================================================

  describe("loadScanHistory", () => {
    it("should return empty array when no history", async () => {
      const history = await loadScanHistory();
      expect(history).toEqual([]);
    });

    it("should return stored history", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "test",
          timestamp: Date.now(),
          favorite: false,
          category: "text",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      const history = await loadScanHistory();
      expect(history).toHaveLength(1);
      expect(history[0].data).toBe("test");
    });
  });

  describe("saveScanToHistory", () => {
    it("should save scan to history", async () => {
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "https://example.com",
        timestamp: Date.now(),
      };

      const entry = await saveScanToHistory(result);

      expect(entry.category).toBe("url");
      expect(entry.favorite).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should not save when saveToHistory is disabled", async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "@qr_scanner_settings") {
          return JSON.stringify({
            ...DEFAULT_SCANNER_SETTINGS,
            saveToHistory: false,
          });
        }
        return null;
      });

      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "test",
        timestamp: Date.now(),
      };

      const entry = await saveScanToHistory(result);

      expect(entry.category).toBe("text");
      // setItem should only be called for settings, not history
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
        "@qr_scan_history",
        expect.any(String)
      );
    });

    it("should limit history to maxHistoryItems", async () => {
      const existingHistory = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        type: "qr" as const,
        data: `item${i}`,
        timestamp: Date.now() - i * 1000,
        favorite: false,
        category: "text" as const,
      }));

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "@qr_scan_history") {
          return JSON.stringify(existingHistory);
        }
        return null;
      });

      const result: ScanResult = {
        id: "new",
        type: "qr",
        data: "new item",
        timestamp: Date.now(),
      };

      await saveScanToHistory(result);

      const savedHistory = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls.find(
          (call: unknown[]) => call[0] === "@qr_scan_history"
        )[1]
      );

      expect(savedHistory.length).toBeLessThanOrEqual(100);
    });
  });

  describe("updateHistoryEntry", () => {
    it("should update existing entry", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "test",
          timestamp: Date.now(),
          favorite: false,
          category: "text",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      await updateHistoryEntry("1", { label: "My Label" });

      const savedHistory = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedHistory[0].label).toBe("My Label");
    });

    it("should do nothing for non-existent entry", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

      await updateHistoryEntry("nonexistent", { label: "Test" });

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("deleteHistoryEntry", () => {
    it("should delete entry from history", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "a",
          timestamp: 1,
          favorite: false,
          category: "text",
        },
        {
          id: "2",
          type: "qr",
          data: "b",
          timestamp: 2,
          favorite: false,
          category: "text",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      await deleteHistoryEntry("1");

      const savedHistory = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedHistory).toHaveLength(1);
      expect(savedHistory[0].id).toBe("2");
    });
  });

  describe("clearScanHistory", () => {
    it("should clear all history", async () => {
      await clearScanHistory();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@qr_scan_history");
    });
  });

  describe("toggleFavorite", () => {
    it("should toggle favorite status", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "test",
          timestamp: 1,
          favorite: false,
          category: "text",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      const result = await toggleFavorite("1");

      expect(result).toBe(true);
    });

    it("should return false for non-existent entry", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");

      const result = await toggleFavorite("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("getFavorites", () => {
    it("should return only favorites", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "a",
          timestamp: 1,
          favorite: true,
          category: "text",
        },
        {
          id: "2",
          type: "qr",
          data: "b",
          timestamp: 2,
          favorite: false,
          category: "text",
        },
        {
          id: "3",
          type: "qr",
          data: "c",
          timestamp: 3,
          favorite: true,
          category: "url",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      const favorites = await getFavorites();

      expect(favorites).toHaveLength(2);
      expect(favorites.every((f) => f.favorite)).toBe(true);
    });
  });

  describe("searchHistory", () => {
    it("should search by data content", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "https://example.com",
          timestamp: 1,
          favorite: false,
          category: "url",
        },
        {
          id: "2",
          type: "qr",
          data: "Hello World",
          timestamp: 2,
          favorite: false,
          category: "text",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      const results = await searchHistory("example");

      expect(results).toHaveLength(1);
      expect(results[0].data).toContain("example");
    });

    it("should search by label", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "data1",
          timestamp: 1,
          favorite: false,
          category: "text",
          label: "My Website",
        },
        {
          id: "2",
          type: "qr",
          data: "data2",
          timestamp: 2,
          favorite: false,
          category: "text",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      const results = await searchHistory("website");

      expect(results).toHaveLength(1);
    });

    it("should search by category label", async () => {
      const mockHistory: ScanHistoryEntry[] = [
        {
          id: "1",
          type: "qr",
          data: "https://example.com",
          timestamp: 1,
          favorite: false,
          category: "url",
        },
        {
          id: "2",
          type: "qr",
          data: "Hello",
          timestamp: 2,
          favorite: false,
          category: "text",
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistory)
      );

      const results = await searchHistory("liên kết");

      expect(results).toHaveLength(1);
      expect(results[0].category).toBe("url");
    });
  });

  // ==========================================================================
  // Action Tests
  // ==========================================================================

  describe("copyToClipboard", () => {
    it("should copy data to clipboard", async () => {
      const result = await copyToClipboard("test data");

      expect(Clipboard.setStringAsync).toHaveBeenCalledWith("test data");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      (Clipboard.setStringAsync as jest.Mock).mockRejectedValue(
        new Error("Copy failed")
      );

      const result = await copyToClipboard("test");

      expect(result).toBe(false);
    });
  });

  describe("openUrl", () => {
    it("should open URL", async () => {
      const result = await openUrl("https://example.com");

      expect(Linking.openURL).toHaveBeenCalledWith("https://example.com");
      expect(result).toBe(true);
    });

    it("should add https if missing", async () => {
      await openUrl("example.com");

      expect(Linking.openURL).toHaveBeenCalledWith("https://example.com");
    });

    it("should handle cannot open URL", async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const result = await openUrl("invalid://url");

      expect(result).toBe(false);
    });
  });

  describe("callPhone", () => {
    beforeEach(() => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    });

    it("should call phone number", async () => {
      const result = await callPhone("+84901234567");

      expect(Linking.openURL).toHaveBeenCalledWith("tel:+84901234567");
      expect(result).toBe(true);
    });

    it("should handle tel: prefix", async () => {
      await callPhone("tel:+84901234567");

      expect(Linking.openURL).toHaveBeenCalledWith("tel:+84901234567");
    });
  });

  describe("sendEmail", () => {
    beforeEach(() => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    });

    it("should open email client", async () => {
      const result = await sendEmail("test@example.com");

      expect(Linking.openURL).toHaveBeenCalledWith("mailto:test@example.com");
      expect(result).toBe(true);
    });
  });

  describe("openLocation", () => {
    beforeEach(() => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    });

    it("should open Google Maps", async () => {
      const result = await openLocation("geo:10.762622,106.660172");

      expect(Linking.openURL).toHaveBeenCalledWith(
        "https://www.google.com/maps?q=10.762622,106.660172"
      );
      expect(result).toBe(true);
    });

    it("should handle invalid geo format", async () => {
      const result = await openLocation("invalid");

      expect(result).toBe(false);
    });
  });

  describe("getAvailableActions", () => {
    it("should return URL-specific actions for URL", () => {
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "https://example.com",
        timestamp: Date.now(),
      };

      const actions = getAvailableActions(result);

      expect(actions.some((a) => a.id === "open")).toBe(true);
      expect(actions.some((a) => a.id === "copy")).toBe(true);
      expect(actions.some((a) => a.id === "share")).toBe(true);
    });

    it("should return phone-specific actions for phone", () => {
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "tel:+84901234567",
        timestamp: Date.now(),
      };

      const actions = getAvailableActions(result);

      expect(actions.some((a) => a.id === "call")).toBe(true);
      expect(actions.some((a) => a.id === "sms")).toBe(true);
    });

    it("should return WiFi-specific actions for WiFi", () => {
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "WIFI:T:WPA;S:MyNetwork;P:pass;;",
        timestamp: Date.now(),
      };

      const actions = getAvailableActions(result);

      expect(actions.some((a) => a.id === "wifi")).toBe(true);
    });

    it("should always include copy and share", () => {
      const result: ScanResult = {
        id: "1",
        type: "qr",
        data: "random text",
        timestamp: Date.now(),
      };

      const actions = getAvailableActions(result);

      expect(actions.some((a) => a.id === "copy")).toBe(true);
      expect(actions.some((a) => a.id === "share")).toBe(true);
    });
  });

  // ==========================================================================
  // Constants Tests
  // ==========================================================================

  describe("Constants", () => {
    it("should have all barcode type names", () => {
      const types = ["qr", "aztec", "code128", "ean13", "upc_a"];
      types.forEach((type) => {
        expect(
          BARCODE_TYPE_NAMES[type as keyof typeof BARCODE_TYPE_NAMES]
        ).toBeDefined();
      });
    });

    it("should have all category icons", () => {
      const categories = ["url", "phone", "email", "wifi", "text"];
      categories.forEach((cat) => {
        expect(
          CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]
        ).toBeDefined();
      });
    });

    it("should have all category labels in Vietnamese", () => {
      expect(CATEGORY_LABELS.url).toBe("Liên kết");
      expect(CATEGORY_LABELS.phone).toBe("Số điện thoại");
      expect(CATEGORY_LABELS.wifi).toBe("WiFi");
    });

    it("should have correct default settings", () => {
      expect(DEFAULT_SCANNER_SETTINGS.enableVibration).toBe(true);
      expect(DEFAULT_SCANNER_SETTINGS.enableSound).toBe(true);
      expect(DEFAULT_SCANNER_SETTINGS.autoOpenUrls).toBe(false);
      expect(DEFAULT_SCANNER_SETTINGS.saveToHistory).toBe(true);
      expect(DEFAULT_SCANNER_SETTINGS.maxHistoryItems).toBe(100);
      expect(DEFAULT_SCANNER_SETTINGS.allowedBarcodeTypes).toContain("qr");
    });
  });
});
