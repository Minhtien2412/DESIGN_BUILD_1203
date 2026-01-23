/**
 * QRScannerService.ts
 *
 * QR code and barcode scanning service with history tracking,
 * multiple format support, and scan result handling.
 *
 * Story: CAM-003 - QR/Barcode Scanner
 * Dependencies: expo-camera (BarcodeScanningResult)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

// ============================================================================
// Types
// ============================================================================

/**
 * Supported barcode types
 */
export type BarcodeType =
  | "qr"
  | "aztec"
  | "codabar"
  | "code39"
  | "code93"
  | "code128"
  | "datamatrix"
  | "ean8"
  | "ean13"
  | "itf14"
  | "pdf417"
  | "upc_a"
  | "upc_e";

/**
 * Barcode scanning result
 */
export interface ScanResult {
  id: string;
  type: BarcodeType;
  data: string;
  timestamp: number;
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  cornerPoints?: { x: number; y: number }[];
}

/**
 * Scan history entry
 */
export interface ScanHistoryEntry extends ScanResult {
  label?: string;
  favorite: boolean;
  category: ScanResultCategory;
}

/**
 * Categories for scan results
 */
export type ScanResultCategory =
  | "url"
  | "phone"
  | "email"
  | "sms"
  | "wifi"
  | "vcard"
  | "geo"
  | "text"
  | "product"
  | "unknown";

/**
 * WiFi configuration from QR
 */
export interface WiFiConfig {
  ssid: string;
  password?: string;
  security: "WPA" | "WEP" | "nopass" | "unknown";
  hidden: boolean;
}

/**
 * Contact (vCard) data
 */
export interface VCardData {
  name?: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  url?: string;
  address?: string;
  note?: string;
}

/**
 * Scanner settings
 */
export interface ScannerSettings {
  enableVibration: boolean;
  enableSound: boolean;
  autoOpenUrls: boolean;
  saveToHistory: boolean;
  maxHistoryItems: number;
  allowedBarcodeTypes: BarcodeType[];
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  HISTORY: "@qr_scan_history",
  SETTINGS: "@qr_scanner_settings",
} as const;

/**
 * Default scanner settings
 */
export const DEFAULT_SCANNER_SETTINGS: ScannerSettings = {
  enableVibration: true,
  enableSound: true,
  autoOpenUrls: false,
  saveToHistory: true,
  maxHistoryItems: 100,
  allowedBarcodeTypes: [
    "qr",
    "aztec",
    "code128",
    "code39",
    "code93",
    "datamatrix",
    "ean8",
    "ean13",
    "itf14",
    "pdf417",
    "upc_a",
    "upc_e",
  ],
};

/**
 * Barcode type display names
 */
export const BARCODE_TYPE_NAMES: Record<BarcodeType, string> = {
  qr: "QR Code",
  aztec: "Aztec",
  codabar: "Codabar",
  code39: "Code 39",
  code93: "Code 93",
  code128: "Code 128",
  datamatrix: "Data Matrix",
  ean8: "EAN-8",
  ean13: "EAN-13",
  itf14: "ITF-14",
  pdf417: "PDF417",
  upc_a: "UPC-A",
  upc_e: "UPC-E",
};

/**
 * Category icons (Ionicons names)
 */
export const CATEGORY_ICONS: Record<ScanResultCategory, string> = {
  url: "link-outline",
  phone: "call-outline",
  email: "mail-outline",
  sms: "chatbubble-outline",
  wifi: "wifi-outline",
  vcard: "person-outline",
  geo: "location-outline",
  text: "document-text-outline",
  product: "barcode-outline",
  unknown: "help-circle-outline",
};

/**
 * Category labels (Vietnamese)
 */
export const CATEGORY_LABELS: Record<ScanResultCategory, string> = {
  url: "Liên kết",
  phone: "Số điện thoại",
  email: "Email",
  sms: "Tin nhắn SMS",
  wifi: "WiFi",
  vcard: "Danh bạ",
  geo: "Vị trí",
  text: "Văn bản",
  product: "Sản phẩm",
  unknown: "Không xác định",
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
 * Detect category from scan data
 */
export function detectCategory(data: string): ScanResultCategory {
  const trimmed = data.trim();
  const upper = trimmed.toUpperCase();

  // Email (check before URL to avoid matching .com in email)
  if (/^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "email";
  }

  // URL patterns
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^www\./i.test(trimmed) ||
    /\.(com|net|org|vn|io|app|dev|edu|gov)/i.test(trimmed)
  ) {
    return "url";
  }

  // Phone number
  if (
    /^tel:/i.test(trimmed) ||
    /^(\+84|0)\d{9,10}$/.test(trimmed.replace(/[\s-]/g, ""))
  ) {
    return "phone";
  }

  // SMS
  if (/^sms:/i.test(trimmed) || /^smsto:/i.test(trimmed)) {
    return "sms";
  }

  // WiFi
  if (upper.startsWith("WIFI:")) {
    return "wifi";
  }

  // vCard
  if (upper.startsWith("BEGIN:VCARD")) {
    return "vcard";
  }

  // Geo location
  if (/^geo:/i.test(trimmed)) {
    return "geo";
  }

  // Product codes (typically numeric)
  if (/^\d{8,14}$/.test(trimmed)) {
    return "product";
  }

  // Default to text
  return trimmed.length > 0 ? "text" : "unknown";
}

/**
 * Parse WiFi QR data
 * Format: WIFI:T:WPA;S:network_name;P:password;H:true;;
 */
export function parseWiFiQR(data: string): WiFiConfig | null {
  if (!data.toUpperCase().startsWith("WIFI:")) {
    return null;
  }

  const config: WiFiConfig = {
    ssid: "",
    security: "unknown",
    hidden: false,
  };

  // Extract fields
  const content = data.substring(5); // Remove 'WIFI:'
  const parts = content.split(";");

  for (const part of parts) {
    const [key, ...valueParts] = part.split(":");
    const value = valueParts.join(":"); // Handle colons in password

    switch (key?.toUpperCase()) {
      case "T":
        if (value === "WPA" || value === "WPA2" || value === "WPA3") {
          config.security = "WPA";
        } else if (value === "WEP") {
          config.security = "WEP";
        } else if (value === "nopass" || value === "") {
          config.security = "nopass";
        }
        break;
      case "S":
        config.ssid = value;
        break;
      case "P":
        config.password = value;
        break;
      case "H":
        config.hidden = value?.toLowerCase() === "true";
        break;
    }
  }

  return config.ssid ? config : null;
}

/**
 * Parse vCard data
 */
export function parseVCard(data: string): VCardData | null {
  if (!data.toUpperCase().includes("BEGIN:VCARD")) {
    return null;
  }

  const vcard: VCardData = {};
  const lines = data.split(/\r?\n/);

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const field = line.substring(0, colonIndex).toUpperCase();
    const value = line.substring(colonIndex + 1).trim();

    // Handle common fields
    if (field.startsWith("FN") || field === "N") {
      vcard.name = vcard.name || value.replace(/;/g, " ").trim();
    } else if (field.startsWith("TEL")) {
      vcard.phone = vcard.phone || value;
    } else if (field.startsWith("EMAIL")) {
      vcard.email = vcard.email || value;
    } else if (field.startsWith("ORG")) {
      vcard.organization = value;
    } else if (field.startsWith("TITLE")) {
      vcard.title = value;
    } else if (field.startsWith("URL")) {
      vcard.url = value;
    } else if (field.startsWith("ADR")) {
      vcard.address = value.replace(/;/g, ", ").trim();
    } else if (field.startsWith("NOTE")) {
      vcard.note = value;
    }
  }

  return Object.keys(vcard).length > 0 ? vcard : null;
}

/**
 * Extract phone number from data
 */
export function extractPhoneNumber(data: string): string {
  if (data.toLowerCase().startsWith("tel:")) {
    return data.substring(4);
  }
  return data.replace(/[\s-]/g, "");
}

/**
 * Extract email from data
 */
export function extractEmail(data: string): string {
  if (data.toLowerCase().startsWith("mailto:")) {
    const parts = data.substring(7).split("?");
    return parts[0];
  }
  return data;
}

/**
 * Format scan result for display
 */
export function formatScanResult(result: ScanResult): string {
  const category = detectCategory(result.data);

  switch (category) {
    case "wifi": {
      const wifi = parseWiFiQR(result.data);
      if (wifi) {
        return `WiFi: ${wifi.ssid}`;
      }
      break;
    }
    case "vcard": {
      const vcard = parseVCard(result.data);
      if (vcard?.name) {
        return `Danh bạ: ${vcard.name}`;
      }
      break;
    }
    case "phone":
      return `Điện thoại: ${extractPhoneNumber(result.data)}`;
    case "email":
      return `Email: ${extractEmail(result.data)}`;
    case "url":
      return result.data.length > 50
        ? `${result.data.substring(0, 50)}...`
        : result.data;
  }

  // Truncate long text
  if (result.data.length > 100) {
    return `${result.data.substring(0, 100)}...`;
  }

  return result.data;
}

/**
 * Format timestamp for display
 */
export function formatScanTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  // Within last hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return minutes <= 1 ? "Vừa xong" : `${minutes} phút trước`;
  }

  // Today
  if (date.toDateString() === now.toDateString()) {
    return `Hôm nay ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Hôm qua ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN");
}

// ============================================================================
// Settings Management
// ============================================================================

/**
 * Load scanner settings
 */
export async function loadScannerSettings(): Promise<ScannerSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SCANNER_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error("[QRScanner] Load settings failed:", error);
  }
  return { ...DEFAULT_SCANNER_SETTINGS };
}

/**
 * Save scanner settings
 */
export async function saveScannerSettings(
  settings: Partial<ScannerSettings>
): Promise<void> {
  try {
    const current = await loadScannerSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("[QRScanner] Save settings failed:", error);
    throw error;
  }
}

// ============================================================================
// History Management
// ============================================================================

/**
 * Load scan history
 */
export async function loadScanHistory(): Promise<ScanHistoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[QRScanner] Load history failed:", error);
  }
  return [];
}

/**
 * Save scan to history
 */
export async function saveScanToHistory(
  result: ScanResult
): Promise<ScanHistoryEntry> {
  try {
    const settings = await loadScannerSettings();
    if (!settings.saveToHistory) {
      return {
        ...result,
        favorite: false,
        category: detectCategory(result.data),
      };
    }

    const history = await loadScanHistory();

    // Create history entry
    const entry: ScanHistoryEntry = {
      ...result,
      id: generateId(),
      favorite: false,
      category: detectCategory(result.data),
    };

    // Add to beginning
    history.unshift(entry);

    // Limit history size
    const trimmed = history.slice(0, settings.maxHistoryItems);

    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));

    return entry;
  } catch (error) {
    console.error("[QRScanner] Save to history failed:", error);
    throw error;
  }
}

/**
 * Update history entry
 */
export async function updateHistoryEntry(
  id: string,
  updates: Partial<ScanHistoryEntry>
): Promise<void> {
  try {
    const history = await loadScanHistory();
    const index = history.findIndex((e) => e.id === id);

    if (index >= 0) {
      history[index] = { ...history[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  } catch (error) {
    console.error("[QRScanner] Update history failed:", error);
    throw error;
  }
}

/**
 * Delete history entry
 */
export async function deleteHistoryEntry(id: string): Promise<void> {
  try {
    const history = await loadScanHistory();
    const filtered = history.filter((e) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error("[QRScanner] Delete history failed:", error);
    throw error;
  }
}

/**
 * Clear all history
 */
export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error("[QRScanner] Clear history failed:", error);
    throw error;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: string): Promise<boolean> {
  const history = await loadScanHistory();
  const entry = history.find((e) => e.id === id);

  if (entry) {
    const newFavorite = !entry.favorite;
    await updateHistoryEntry(id, { favorite: newFavorite });
    return newFavorite;
  }

  return false;
}

/**
 * Get favorites
 */
export async function getFavorites(): Promise<ScanHistoryEntry[]> {
  const history = await loadScanHistory();
  return history.filter((e) => e.favorite);
}

/**
 * Search history
 */
export async function searchHistory(
  query: string
): Promise<ScanHistoryEntry[]> {
  const history = await loadScanHistory();
  const lower = query.toLowerCase();

  return history.filter(
    (e) =>
      e.data.toLowerCase().includes(lower) ||
      e.label?.toLowerCase().includes(lower) ||
      CATEGORY_LABELS[e.category].toLowerCase().includes(lower)
  );
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Copy scan result to clipboard
 */
export async function copyToClipboard(data: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(data);
    return true;
  } catch (error) {
    console.error("[QRScanner] Copy failed:", error);
    return false;
  }
}

/**
 * Share scan result
 */
export async function shareScanResult(result: ScanResult): Promise<boolean> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      // Fallback to clipboard
      await copyToClipboard(result.data);
      Alert.alert("Đã sao chép", "Nội dung đã được sao chép vào bộ nhớ tạm");
      return true;
    }

    // Create shareable text
    const category = detectCategory(result.data);
    const formatted = formatScanResult(result);
    const text = `${CATEGORY_LABELS[category]}: ${formatted}\n\n${result.data}`;

    // For sharing, we need a file - fallback to clipboard for now
    await copyToClipboard(text);
    Alert.alert("Đã sao chép", "Nội dung đã được sao chép vào bộ nhớ tạm");
    return true;
  } catch (error) {
    console.error("[QRScanner] Share failed:", error);
    return false;
  }
}

/**
 * Open URL
 */
export async function openUrl(url: string): Promise<boolean> {
  try {
    let finalUrl = url;

    // Add protocol if missing
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = `https://${finalUrl}`;
    }

    const canOpen = await Linking.canOpenURL(finalUrl);
    if (canOpen) {
      await Linking.openURL(finalUrl);
      return true;
    }

    Alert.alert("Lỗi", "Không thể mở liên kết này");
    return false;
  } catch (error) {
    console.error("[QRScanner] Open URL failed:", error);
    return false;
  }
}

/**
 * Call phone number
 */
export async function callPhone(phone: string): Promise<boolean> {
  try {
    const number = extractPhoneNumber(phone);
    const url = `tel:${number}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi");
    return false;
  } catch (error) {
    console.error("[QRScanner] Call failed:", error);
    return false;
  }
}

/**
 * Send email
 */
export async function sendEmail(email: string): Promise<boolean> {
  try {
    const address = extractEmail(email);
    const url = `mailto:${address}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    Alert.alert("Lỗi", "Không thể mở ứng dụng email");
    return false;
  } catch (error) {
    console.error("[QRScanner] Email failed:", error);
    return false;
  }
}

/**
 * Send SMS
 */
export async function sendSMS(data: string): Promise<boolean> {
  try {
    let url = data;

    if (!data.toLowerCase().startsWith("sms:")) {
      url = `sms:${data}`;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    Alert.alert("Lỗi", "Không thể mở ứng dụng tin nhắn");
    return false;
  } catch (error) {
    console.error("[QRScanner] SMS failed:", error);
    return false;
  }
}

/**
 * Open map location
 */
export async function openLocation(data: string): Promise<boolean> {
  try {
    // Parse geo: URI
    const match = data.match(/geo:(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (!match) {
      Alert.alert("Lỗi", "Định dạng vị trí không hợp lệ");
      return false;
    }

    const [, lat, lng] = match;

    // Try Google Maps first, then Apple Maps
    const googleUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const canOpen = await Linking.canOpenURL(googleUrl);

    if (canOpen) {
      await Linking.openURL(googleUrl);
      return true;
    }

    Alert.alert("Lỗi", "Không thể mở ứng dụng bản đồ");
    return false;
  } catch (error) {
    console.error("[QRScanner] Open location failed:", error);
    return false;
  }
}

/**
 * Perform default action based on category
 */
export async function performDefaultAction(
  result: ScanResult
): Promise<boolean> {
  const category = detectCategory(result.data);

  switch (category) {
    case "url":
      return openUrl(result.data);
    case "phone":
      return callPhone(result.data);
    case "email":
      return sendEmail(result.data);
    case "sms":
      return sendSMS(result.data);
    case "geo":
      return openLocation(result.data);
    default:
      // Copy to clipboard for other types
      const copied = await copyToClipboard(result.data);
      if (copied) {
        Alert.alert("Đã sao chép", "Nội dung đã được sao chép vào bộ nhớ tạm");
      }
      return copied;
  }
}

/**
 * Get available actions for a scan result
 */
export function getAvailableActions(result: ScanResult): {
  id: string;
  label: string;
  icon: string;
  action: () => Promise<boolean>;
}[] {
  const category = detectCategory(result.data);
  const actions: {
    id: string;
    label: string;
    icon: string;
    action: () => Promise<boolean>;
  }[] = [];

  // Category-specific actions
  switch (category) {
    case "url":
      actions.push({
        id: "open",
        label: "Mở liên kết",
        icon: "open-outline",
        action: () => openUrl(result.data),
      });
      break;
    case "phone":
      actions.push({
        id: "call",
        label: "Gọi điện",
        icon: "call-outline",
        action: () => callPhone(result.data),
      });
      actions.push({
        id: "sms",
        label: "Gửi tin nhắn",
        icon: "chatbubble-outline",
        action: () => sendSMS(extractPhoneNumber(result.data)),
      });
      break;
    case "email":
      actions.push({
        id: "email",
        label: "Gửi email",
        icon: "mail-outline",
        action: () => sendEmail(result.data),
      });
      break;
    case "sms":
      actions.push({
        id: "sms",
        label: "Gửi tin nhắn",
        icon: "chatbubble-outline",
        action: () => sendSMS(result.data),
      });
      break;
    case "geo":
      actions.push({
        id: "map",
        label: "Mở bản đồ",
        icon: "map-outline",
        action: () => openLocation(result.data),
      });
      break;
    case "wifi":
      actions.push({
        id: "wifi",
        label: "Sao chép mật khẩu",
        icon: "wifi-outline",
        action: async () => {
          const wifi = parseWiFiQR(result.data);
          if (wifi?.password) {
            const copied = await copyToClipboard(wifi.password);
            if (copied) {
              Alert.alert(
                "Đã sao chép",
                `Mật khẩu WiFi "${wifi.ssid}" đã được sao chép`
              );
            }
            return copied;
          }
          Alert.alert("Thông báo", "WiFi không có mật khẩu");
          return false;
        },
      });
      break;
  }

  // Common actions
  actions.push({
    id: "copy",
    label: "Sao chép",
    icon: "copy-outline",
    action: async () => {
      const copied = await copyToClipboard(result.data);
      if (copied) {
        Alert.alert("Đã sao chép", "Nội dung đã được sao chép");
      }
      return copied;
    },
  });

  actions.push({
    id: "share",
    label: "Chia sẻ",
    icon: "share-outline",
    action: () => shareScanResult(result),
  });

  return actions;
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook for scanner settings
 */
export function useScannerSettings() {
  const [settings, setSettings] = useState<ScannerSettings>(
    DEFAULT_SCANNER_SETTINGS
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScannerSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<ScannerSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await saveScannerSettings(updates);
    },
    [settings]
  );

  return { settings, loading, updateSettings };
}

/**
 * Hook for scan history
 */
export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadScanHistory();
      setHistory(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(async (result: ScanResult) => {
    const entry = await saveScanToHistory(result);
    setHistory((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    await deleteHistoryEntry(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleFav = useCallback(async (id: string) => {
    const newFavorite = await toggleFavorite(id);
    setHistory((prev) =>
      prev.map((e) => (e.id === id ? { ...e, favorite: newFavorite } : e))
    );
    return newFavorite;
  }, []);

  const clear = useCallback(async () => {
    await clearScanHistory();
    setHistory([]);
  }, []);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return refresh();
      }
      const results = await searchHistory(query);
      setHistory(results);
    },
    [refresh]
  );

  return {
    history,
    loading,
    refresh,
    addEntry,
    removeEntry,
    toggleFavorite: toggleFav,
    clear,
    search,
  };
}

/**
 * Hook for QR scanner
 */
export function useQRScanner(onScan?: (result: ScanResult) => void) {
  const [isScanning, setIsScanning] = useState(true);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const lastScanTime = useRef<number>(0);
  const cooldownMs = 1500; // Prevent duplicate scans

  const handleBarCodeScanned = useCallback(
    (scanResult: {
      type: string;
      data: string;
      bounds?: unknown;
      cornerPoints?: unknown;
    }) => {
      // Prevent rapid duplicate scans
      const now = Date.now();
      if (now - lastScanTime.current < cooldownMs) {
        return;
      }

      // Skip if same data scanned recently
      if (
        lastScan?.data === scanResult.data &&
        now - lastScanTime.current < 5000
      ) {
        return;
      }

      lastScanTime.current = now;

      const result: ScanResult = {
        id: generateId(),
        type: mapBarcodeType(scanResult.type),
        data: scanResult.data,
        timestamp: now,
        bounds: scanResult.bounds as ScanResult["bounds"],
        cornerPoints: scanResult.cornerPoints as ScanResult["cornerPoints"],
      };

      setLastScan(result);
      onScan?.(result);
    },
    [lastScan, onScan]
  );

  const resetScanner = useCallback(() => {
    setLastScan(null);
    lastScanTime.current = 0;
    setIsScanning(true);
  }, []);

  const pauseScanner = useCallback(() => {
    setIsScanning(false);
  }, []);

  const resumeScanner = useCallback(() => {
    setIsScanning(true);
  }, []);

  return {
    isScanning,
    lastScan,
    handleBarCodeScanned,
    resetScanner,
    pauseScanner,
    resumeScanner,
  };
}

/**
 * Map expo-camera barcode type to our type
 */
function mapBarcodeType(expoType: string): BarcodeType {
  const mapping: Record<string, BarcodeType> = {
    "org.iso.QRCode": "qr",
    "org.iso.Aztec": "aztec",
    "org.iso.Code128": "code128",
    "org.iso.Code39": "code39",
    "org.iso.Code93": "code93",
    "org.iso.DataMatrix": "datamatrix",
    "org.gs1.EAN-8": "ean8",
    "org.gs1.EAN-13": "ean13",
    "org.gs1.ITF-14": "itf14",
    "org.iso.PDF417": "pdf417",
    "org.gs1.UPC-A": "upc_a",
    "org.gs1.UPC-E": "upc_e",
    // Android types
    QR_CODE: "qr",
    AZTEC: "aztec",
    CODE_128: "code128",
    CODE_39: "code39",
    CODE_93: "code93",
    DATA_MATRIX: "datamatrix",
    EAN_8: "ean8",
    EAN_13: "ean13",
    ITF: "itf14",
    PDF_417: "pdf417",
    UPC_A: "upc_a",
    UPC_E: "upc_e",
    // Numeric types
    "256": "qr",
    "1": "code128",
  };

  return mapping[expoType] || "qr";
}

// ============================================================================
// Service Class (Singleton)
// ============================================================================

class QRScannerServiceClass {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load settings
    await loadScannerSettings();

    this.initialized = true;
    console.log("[QRScanner] Service initialized");
  }

  async getSettings() {
    return loadScannerSettings();
  }

  async updateSettings(settings: Partial<ScannerSettings>) {
    return saveScannerSettings(settings);
  }

  async getHistory() {
    return loadScanHistory();
  }

  async addToHistory(result: ScanResult) {
    return saveScanToHistory(result);
  }

  async clearHistory() {
    return clearScanHistory();
  }

  detectCategory(data: string) {
    return detectCategory(data);
  }

  getActions(result: ScanResult) {
    return getAvailableActions(result);
  }

  async performAction(result: ScanResult) {
    return performDefaultAction(result);
  }
}

export const QRScannerService = new QRScannerServiceClass();
export default QRScannerService;
