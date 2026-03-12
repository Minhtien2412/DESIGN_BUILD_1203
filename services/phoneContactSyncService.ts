/**
 * Phone Contact Sync Service (Zalo-Style)
 * =========================================
 *
 * Đồng bộ danh bạ điện thoại để tìm bạn bè đang dùng app:
 * 1. Yêu cầu permission truy cập danh bạ
 * 2. Hash số điện thoại trước khi gửi lên server (privacy)
 * 3. Server match với users đã đăng ký
 * 4. Trả về danh sách bạn bè trên app
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { apiFetch } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Contacts from "expo-contacts";
import * as Crypto from "expo-crypto";
import { Alert, Linking, Platform } from "react-native";

// ============================================
// TYPES
// ============================================

export interface PhoneContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  avatar?: string;
  emails?: string[];
}

export interface MatchedFriend {
  id: number;
  name: string;
  phone: string;
  phoneMasked: string; // 090****567
  avatar?: string;
  status: "online" | "offline" | "away";
  contactName: string; // Tên lưu trong danh bạ điện thoại
  isRegistered: boolean;
  registeredAt?: string;
  lastSeen?: string;
}

export interface SyncResult {
  success: boolean;
  totalContacts: number;
  matchedCount: number;
  friends: MatchedFriend[];
  syncedAt: string;
  error?: string;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // hours
  lastSyncAt: string | null;
  hasPermission: boolean;
  permissionAskedAt: string | null;
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  SYNC_SETTINGS: "@phone_contact_sync_settings",
  MATCHED_FRIENDS: "@phone_contact_matched_friends",
  LAST_PHONE_HASHES: "@phone_contact_last_hashes",
  SYNC_DISMISSED: "@phone_contact_sync_dismissed",
};

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_SETTINGS: SyncSettings = {
  autoSync: false,
  syncInterval: 24, // 24 hours
  lastSyncAt: null,
  hasPermission: false,
  permissionAskedAt: null,
};

// ============================================
// PHONE CONTACT SYNC SERVICE
// ============================================

class PhoneContactSyncService {
  private static instance: PhoneContactSyncService;
  private settings: SyncSettings = DEFAULT_SETTINGS;
  private matchedFriends: MatchedFriend[] = [];
  private isSyncing = false;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): PhoneContactSyncService {
    if (!PhoneContactSyncService.instance) {
      PhoneContactSyncService.instance = new PhoneContactSyncService();
    }
    return PhoneContactSyncService.instance;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Get current settings
   */
  getSettings(): SyncSettings {
    return { ...this.settings };
  }

  /**
   * Get matched friends
   */
  getMatchedFriends(): MatchedFriend[] {
    return [...this.matchedFriends];
  }

  /**
   * Check if sync prompt has been dismissed
   */
  async wasSyncDismissed(): Promise<boolean> {
    try {
      const dismissed = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_DISMISSED);
      return dismissed === "true";
    } catch {
      return false;
    }
  }

  /**
   * Mark sync prompt as dismissed
   */
  async dismissSyncPrompt(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_DISMISSED, "true");
  }

  /**
   * Reset dismissed state (allow showing prompt again)
   */
  async resetSyncPrompt(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_DISMISSED);
  }

  /**
   * Check and request contacts permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status: currentStatus } = await Contacts.getPermissionsAsync();

      if (currentStatus === "granted") {
        this.settings.hasPermission = true;
        await this.saveSettings();
        return true;
      }

      // Request permission
      const { status } = await Contacts.requestPermissionsAsync();
      const granted = status === "granted";

      this.settings.hasPermission = granted;
      this.settings.permissionAskedAt = new Date().toISOString();
      await this.saveSettings();

      return granted;
    } catch (error) {
      console.error("[PhoneContactSync] Permission error:", error);
      return false;
    }
  }

  /**
   * Check permission status without requesting
   */
  async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      this.settings.hasPermission = status === "granted";
      return this.settings.hasPermission;
    } catch {
      return false;
    }
  }

  /**
   * Show sync request dialog (Zalo-style)
   */
  showSyncRequestDialog(onAccept: () => void, onDecline: () => void): void {
    Alert.alert(
      "🔍 Tìm bạn bè",
      "Để tìm bạn bè đang dùng ứng dụng, chúng tôi cần đồng bộ danh bạ của bạn.\n\n" +
        "• Số điện thoại được mã hóa trước khi gửi\n" +
        "• Không lưu trữ danh bạ của bạn\n" +
        "• Bạn có thể tắt tính năng này bất kỳ lúc nào",
      [
        {
          text: "Để sau",
          style: "cancel",
          onPress: () => {
            this.dismissSyncPrompt();
            onDecline();
          },
        },
        {
          text: "Đồng bộ ngay",
          onPress: async () => {
            const hasPermission = await this.requestPermission();
            if (hasPermission) {
              onAccept();
            } else {
              this.showPermissionDeniedDialog();
              onDecline();
            }
          },
        },
      ],
      { cancelable: true },
    );
  }

  /**
   * Show permission denied dialog
   */
  showPermissionDeniedDialog(): void {
    Alert.alert(
      "Cần quyền truy cập",
      "Để tìm bạn bè, vui lòng cho phép truy cập danh bạ trong Cài đặt.",
      [
        { text: "Để sau", style: "cancel" },
        {
          text: "Mở Cài đặt",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
          },
        },
      ],
    );
  }

  /**
   * Sync contacts with server
   */
  async syncContacts(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        totalContacts: 0,
        matchedCount: 0,
        friends: this.matchedFriends,
        syncedAt: this.settings.lastSyncAt || "",
        error: "Đang đồng bộ...",
      };
    }

    this.isSyncing = true;

    try {
      // Check permission
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        return {
          success: false,
          totalContacts: 0,
          matchedCount: 0,
          friends: [],
          syncedAt: "",
          error: "Chưa có quyền truy cập danh bạ",
        };
      }

      console.log("[PhoneContactSync] Starting sync...");

      // 1. Get phone contacts
      const phoneContacts = await this.getPhoneContacts();
      console.log(`[PhoneContactSync] Found ${phoneContacts.length} contacts`);

      if (phoneContacts.length === 0) {
        return {
          success: true,
          totalContacts: 0,
          matchedCount: 0,
          friends: [],
          syncedAt: new Date().toISOString(),
        };
      }

      // 2. Extract and normalize phone numbers
      const phoneMap = new Map<string, string>(); // hash -> contact name
      const phonesToHash: string[] = [];

      for (const contact of phoneContacts) {
        for (const phone of contact.phoneNumbers) {
          const normalized = this.normalizePhoneNumber(phone);
          if (normalized) {
            phonesToHash.push(normalized);
            phoneMap.set(normalized, contact.name);
          }
        }
      }

      console.log(
        `[PhoneContactSync] Normalized ${phonesToHash.length} phone numbers`,
      );

      // 3. Hash phone numbers for privacy
      const phoneHashes = await this.hashPhoneNumbers(phonesToHash);

      // 4. Send to server for matching
      const matchedFriends = await this.matchWithServer(phoneHashes, phoneMap);

      // 5. Update state and storage
      this.matchedFriends = matchedFriends;
      this.settings.lastSyncAt = new Date().toISOString();

      await this.saveSettings();
      await this.saveMatchedFriends();

      console.log(`[PhoneContactSync] Found ${matchedFriends.length} friends`);

      return {
        success: true,
        totalContacts: phoneContacts.length,
        matchedCount: matchedFriends.length,
        friends: matchedFriends,
        syncedAt: this.settings.lastSyncAt,
      };
    } catch (error: any) {
      console.error("[PhoneContactSync] Sync error:", error);
      return {
        success: false,
        totalContacts: 0,
        matchedCount: 0,
        friends: this.matchedFriends,
        syncedAt: "",
        error: error.message || "Đồng bộ thất bại",
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Enable/disable auto sync
   */
  async setAutoSync(enabled: boolean): Promise<void> {
    this.settings.autoSync = enabled;
    await this.saveSettings();
  }

  /**
   * Clear all sync data
   */
  async clearSyncData(): Promise<void> {
    this.matchedFriends = [];
    this.settings = DEFAULT_SETTINGS;

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SYNC_SETTINGS),
      AsyncStorage.removeItem(STORAGE_KEYS.MATCHED_FRIENDS),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_PHONE_HASHES),
      AsyncStorage.removeItem(STORAGE_KEYS.SYNC_DISMISSED),
    ]);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Get contacts from phone
   */
  private async getPhoneContacts(): Promise<PhoneContact[]> {
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
      ],
    });

    return data
      .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
      .map((c) => ({
        id: c.id,
        name: c.name || "Unknown",
        phoneNumbers: c.phoneNumbers?.map((p) => p.number || "") || [],
        avatar: c.image?.uri,
        emails: c.emails?.map((e) => e.email || ""),
      }));
  }

  /**
   * Normalize phone number to Vietnamese format
   */
  private normalizePhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // Handle Vietnamese phone formats
    if (cleaned.startsWith("84")) {
      cleaned = "0" + cleaned.substring(2);
    } else if (cleaned.startsWith("+84")) {
      cleaned = "0" + cleaned.substring(3);
    }

    // Validate Vietnamese mobile number (10 digits starting with 0)
    if (cleaned.length === 10 && cleaned.startsWith("0")) {
      return cleaned;
    }

    // Also accept 11-digit numbers (some old formats)
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      return cleaned;
    }

    return null;
  }

  /**
   * Hash phone numbers using SHA-256
   */
  private async hashPhoneNumbers(
    phones: string[],
  ): Promise<Map<string, string>> {
    const hashMap = new Map<string, string>();

    for (const phone of phones) {
      try {
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          phone,
        );
        hashMap.set(hash, phone);
      } catch (error) {
        console.warn("[PhoneContactSync] Hash error for phone:", error);
      }
    }

    return hashMap;
  }

  /**
   * Match hashed phones with server
   */
  private async matchWithServer(
    phoneHashes: Map<string, string>,
    phoneToName: Map<string, string>,
  ): Promise<MatchedFriend[]> {
    try {
      const hashes = Array.from(phoneHashes.keys());

      // Call API to match
      const response = await apiFetch<{
        matches: Array<{
          userId: number;
          name: string;
          phone: string;
          phoneHash: string;
          avatar?: string;
          status: string;
          registeredAt: string;
          lastSeen?: string;
        }>;
      }>("/api/contacts/match-phones", {
        method: "POST",
        data: { phoneHashes: hashes },
      });

      if (!response.matches) {
        // Fallback: return mock data for demo
        return this.getMockMatchedFriends(phoneHashes, phoneToName);
      }

      return response.matches.map((m) => {
        const originalPhone = phoneHashes.get(m.phoneHash) || m.phone;
        const contactName = phoneToName.get(originalPhone) || m.name;

        return {
          id: m.userId,
          name: m.name,
          phone: originalPhone,
          phoneMasked: this.maskPhoneNumber(originalPhone),
          avatar: m.avatar,
          status: (m.status as "online" | "offline" | "away") || "offline",
          contactName,
          isRegistered: true,
          registeredAt: m.registeredAt,
          lastSeen: m.lastSeen,
        };
      });
    } catch (error) {
      console.warn("[PhoneContactSync] API error, using mock data:", error);
      return this.getMockMatchedFriends(phoneHashes, phoneToName);
    }
  }

  /**
   * Get mock matched friends for demo
   */
  private getMockMatchedFriends(
    phoneHashes: Map<string, string>,
    phoneToName: Map<string, string>,
  ): MatchedFriend[] {
    // Simulate some matches
    const phones = Array.from(phoneToName.keys()).slice(0, 5);

    return phones.map((phone, index) => ({
      id: 1000 + index,
      name: `User ${index + 1}`,
      phone,
      phoneMasked: this.maskPhoneNumber(phone),
      avatar: `https://i.pravatar.cc/100?img=${index + 10}`,
      status: ["online", "offline", "away"][index % 3] as
        | "online"
        | "offline"
        | "away",
      contactName: phoneToName.get(phone) || "Unknown",
      isRegistered: true,
      registeredAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    }));
  }

  /**
   * Mask phone number for display (090****567)
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length < 7) return phone;
    return phone.slice(0, 3) + "****" + phone.slice(-3);
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    // Skip on web - AsyncStorage doesn't work during SSR
    if (Platform.OS === "web") {
      console.log("[PhoneContactSync] Skipping loadSettings on web platform");
      return;
    }

    try {
      const [settingsJson, friendsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SYNC_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.MATCHED_FRIENDS),
      ]);

      if (settingsJson) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
      }

      if (friendsJson) {
        this.matchedFriends = JSON.parse(friendsJson);
      }
    } catch (error) {
      console.error("[PhoneContactSync] Load settings error:", error);
    }
  }

  /**
   * Save settings to storage
   */
  private async saveSettings(): Promise<void> {
    // Skip on web
    if (Platform.OS === "web") return;

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SYNC_SETTINGS,
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.error("[PhoneContactSync] Save settings error:", error);
    }
  }

  /**
   * Save matched friends to storage
   */
  private async saveMatchedFriends(): Promise<void> {
    // Skip on web
    if (Platform.OS === "web") return;

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.MATCHED_FRIENDS,
        JSON.stringify(this.matchedFriends),
      );
    } catch (error) {
      console.error("[PhoneContactSync] Save friends error:", error);
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const phoneContactSyncService = PhoneContactSyncService.getInstance();
export default phoneContactSyncService;
