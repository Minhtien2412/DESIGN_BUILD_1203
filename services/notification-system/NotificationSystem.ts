/**
 * Notification System - Core Engine
 * ===================================
 *
 * Telegram-inspired: tách logic (System) khỏi hiển thị (Renderer).
 * System xử lý: queue, dedupe, grouping, skip/mute rules.
 *
 * Luồng:
 *   WS event → System.ingest() → dedupe → rules check → queue → group → emit to Renderer
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
    NotificationCategory,
    NotificationGroup,
    NotificationItem,
    NotificationUserSettings,
    PushNotificationEvent,
} from "./types";
import { DEFAULT_NOTIFICATION_SETTINGS } from "./types";

// ============================================================================
// CONSTANTS
// ============================================================================

const SETTINGS_STORAGE_KEY = "@ntf_system_settings";
const SEEN_DEDUPE_KEYS_KEY = "@ntf_seen_dedupe_keys";
const ITEMS_CACHE_KEY = "@ntf_items_cache";
const MAX_DEDUPE_CACHE = 500;
const MAX_ITEMS = 200; // Evict oldest when exceeded
const DEFAULT_GROUP_WINDOW_MS = 2000;
const MAX_QUEUE_SIZE = 50;
const PERSIST_DEBOUNCE_MS = 3000; // Debounce AsyncStorage writes

// ============================================================================
// EVENT EMITTER (lightweight, no external deps)
// ============================================================================

type SystemEvent =
  | { type: "show_toast"; notification: NotificationItem }
  | { type: "show_group_toast"; group: NotificationGroup }
  | { type: "update_center"; notifications: NotificationItem[] }
  | { type: "badge_update"; count: number }
  | { type: "settings_changed"; settings: NotificationUserSettings };

type SystemEventListener = (event: SystemEvent) => void;

// ============================================================================
// NOTIFICATION SYSTEM CLASS
// ============================================================================

class NotificationSystem {
  private items: Map<string, NotificationItem> = new Map();
  private groups: Map<string, NotificationGroup> = new Map();
  private settings: NotificationUserSettings = {
    ...DEFAULT_NOTIFICATION_SETTINGS,
  };
  private listeners: Set<SystemEventListener> = new Set();

  // Dedupe: lưu set dedupeKey đã thấy
  private seenDedupeKeys: Set<string> = new Set();

  // Queue: nhóm notifications theo category+context trước khi show
  private groupQueue: Map<
    string,
    { items: NotificationItem[]; timer: ReturnType<typeof setTimeout> | null }
  > = new Map();

  private initialized = false;
  private persistDedupeTimer: ReturnType<typeof setTimeout> | null = null;
  private persistItemsTimer: ReturnType<typeof setTimeout> | null = null;

  // Cached sorted array (invalidated on mutation)
  private cachedSortedItems: NotificationItem[] | null = null;
  private itemsDirty = true;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load settings
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        this.settings = {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...JSON.parse(settingsJson),
        };
      }

      // Load dedupe cache
      const dedupeJson = await AsyncStorage.getItem(SEEN_DEDUPE_KEYS_KEY);
      if (dedupeJson) {
        const keys: string[] = JSON.parse(dedupeJson);
        keys.forEach((k) => this.seenDedupeKeys.add(k));
      }

      // Load cached items (restore after app restart)
      const itemsJson = await AsyncStorage.getItem(ITEMS_CACHE_KEY);
      if (itemsJson) {
        try {
          const items: NotificationItem[] = JSON.parse(itemsJson);
          items.forEach((item) => this.items.set(item.id, item));
          this.itemsDirty = true;
        } catch {
          // Corrupted cache, ignore
        }
      }

      this.initialized = true;
      console.log(
        "[NotificationSystem] Initialized with",
        this.seenDedupeKeys.size,
        "dedupe keys,",
        this.items.size,
        "cached items",
      );
    } catch (error) {
      console.error("[NotificationSystem] Init error:", error);
      this.initialized = true; // Continue anyway
    }
  }

  /** Wait for initialization before processing (non-blocking) */
  isReady(): boolean {
    return this.initialized;
  }

  // ==========================================================================
  // EVENT SUBSCRIPTION
  // ==========================================================================

  subscribe(listener: SystemEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: SystemEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("[NotificationSystem] Listener error:", error);
      }
    });
  }

  // ==========================================================================
  // INGEST: Main entry point for new notifications
  // ==========================================================================

  /**
   * Nhận notification mới từ WS hoặc REST.
   * Xử lý: dedupe → rules check → queue/group → emit
   */
  ingest(event: PushNotificationEvent): NotificationItem | null {
    // 0. Guard: validate required fields
    if (!event?.id || !event?.title) {
      console.warn(
        "[NotificationSystem] Invalid event (missing id/title):",
        event,
      );
      return null;
    }

    // 1. Dedupe
    if (this.isDuplicate(event)) {
      return null;
    }

    // 2. Convert to NotificationItem
    const item: NotificationItem = {
      id: event.id,
      category: event.category || "system",
      severity: event.severity || "info",
      title: event.title,
      body: event.body || "",
      deeplink: event.deeplink,
      createdAt: event.createdAt || new Date().toISOString(),
      read: false,
      displayState: "queued",
      dedupeKey: event.dedupeKey,
      data: event.data as Record<string, unknown> | undefined,
      source: "ws",
    };

    // 3. Store + evict oldest if over limit
    this.items.set(item.id, item);
    this.evictOldItems();
    this.markDedupeKey(event.dedupeKey || event.id);
    this.itemsDirty = true;

    // 4. Rules check: skip / mute / silent
    const skipResult = this.computeSkipState(item, event.silent);

    if (skipResult === "muted") {
      item.displayState = "muted";
      this.emit({ type: "update_center", notifications: this.getAllItems() });
      this.emit({ type: "badge_update", count: this.getUnreadCount() });
      return item;
    }

    // 5. Grouping check
    if (this.settings.groupingEnabled) {
      this.enqueueForGrouping(item);
    } else {
      // Show immediately
      item.displayState = "displayed";
      this.emit({ type: "show_toast", notification: item });
    }

    // 6. Update center + badge
    this.emit({ type: "update_center", notifications: this.getAllItems() });
    this.emit({ type: "badge_update", count: this.getUnreadCount() });

    return item;
  }

  /**
   * Ingest multiple notifications from REST API (sync on reconnect)
   */
  ingestBatch(events: PushNotificationEvent[]): void {
    let added = 0;
    for (const event of events) {
      const item: NotificationItem = {
        id: event.id,
        category: event.category,
        severity: event.severity,
        title: event.title,
        body: event.body,
        deeplink: event.deeplink,
        createdAt: event.createdAt,
        read: false,
        displayState: "queued",
        dedupeKey: event.dedupeKey,
        data: event.data as Record<string, unknown> | undefined,
        source: "rest",
      };

      if (!this.items.has(item.id) && !this.isDuplicate(event)) {
        this.items.set(item.id, item);
        this.markDedupeKey(event.dedupeKey || event.id);
        added++;
      }
    }

    if (added > 0) {
      this.evictOldItems();
      this.itemsDirty = true;
      this.schedulePersistItems();
      this.emit({ type: "update_center", notifications: this.getAllItems() });
      this.emit({ type: "badge_update", count: this.getUnreadCount() });
    }
  }

  // ==========================================================================
  // DEDUPE
  // ==========================================================================

  private isDuplicate(event: PushNotificationEvent): boolean {
    const key = event.dedupeKey || event.id;

    // Check by ID first
    if (this.items.has(event.id)) return true;

    // Check by dedupe key
    if (this.seenDedupeKeys.has(key)) return true;

    return false;
  }

  private markDedupeKey(key: string): void {
    this.seenDedupeKeys.add(key);

    // Trim to max size
    if (this.seenDedupeKeys.size > MAX_DEDUPE_CACHE) {
      const arr = Array.from(this.seenDedupeKeys);
      const toRemove = arr.slice(0, arr.length - MAX_DEDUPE_CACHE);
      toRemove.forEach((k) => this.seenDedupeKeys.delete(k));
    }

    // Persist async (debounced)
    this.schedulePersistDedupeKeys();
  }

  /** Debounced persist to avoid excessive AsyncStorage writes */
  private schedulePersistDedupeKeys(): void {
    if (this.persistDedupeTimer) clearTimeout(this.persistDedupeTimer);
    this.persistDedupeTimer = setTimeout(() => {
      this.persistDedupeTimer = null;
      const arr = Array.from(this.seenDedupeKeys);
      AsyncStorage.setItem(SEEN_DEDUPE_KEYS_KEY, JSON.stringify(arr)).catch(
        () => {},
      );
    }, PERSIST_DEBOUNCE_MS);
  }

  /** Debounced persist notification items */
  private schedulePersistItems(): void {
    if (this.persistItemsTimer) clearTimeout(this.persistItemsTimer);
    this.persistItemsTimer = setTimeout(() => {
      this.persistItemsTimer = null;
      // Only persist last 100 items to keep storage reasonable
      const items = this.getAllItems().slice(0, 100);
      AsyncStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(items)).catch(
        () => {},
      );
    }, PERSIST_DEBOUNCE_MS);
  }

  /** Evict oldest items when over MAX_ITEMS */
  private evictOldItems(): void {
    if (this.items.size <= MAX_ITEMS) return;
    const sorted = this.getAllItems();
    const toRemove = sorted.slice(MAX_ITEMS);
    toRemove.forEach((item) => this.items.delete(item.id));
    this.itemsDirty = true;
  }

  // ==========================================================================
  // SKIP / MUTE RULES (Telegram-style computeSkipState)
  // ==========================================================================

  private computeSkipState(
    item: NotificationItem,
    silent?: boolean,
  ): "show" | "muted" {
    // Global mute
    if (this.settings.globalMute) return "muted";

    // Silent flag from server
    if (silent) return "muted";

    // Muted category
    if (this.settings.mutedCategories.includes(item.category)) return "muted";

    // Muted thread (e.g. chatId in data)
    const threadId = item.data?.chatId as string | undefined;
    if (threadId && this.settings.mutedThreads.includes(threadId))
      return "muted";

    // Quiet hours
    if (this.isInQuietHours()) return "muted";

    return "show";
  }

  private isInQuietHours(): boolean {
    const { quietHoursStart, quietHoursEnd } = this.settings;
    if (!quietHoursStart || !quietHoursEnd) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = quietHoursStart.split(":").map(Number);
    const [endH, endM] = quietHoursEnd.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      // Same day range (e.g. 09:00 - 17:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight range (e.g. 22:00 - 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  // ==========================================================================
  // GROUPING (Telegram-style queue + timer + gom nhóm)
  // ==========================================================================

  private enqueueForGrouping(item: NotificationItem): void {
    // Group key = category + optional context (e.g. chatId)
    const contextKey = item.data?.chatId || item.data?.projectId || "";
    const groupKey = `${item.category}:${contextKey}`;
    item.groupKey = groupKey;

    let entry = this.groupQueue.get(groupKey);
    if (!entry) {
      entry = { items: [], timer: null };
      this.groupQueue.set(groupKey, entry);
    }

    entry.items.push(item);

    // Reset timer
    if (entry.timer) {
      clearTimeout(entry.timer);
    }

    // Wait groupingWindowMs before flushing
    const windowMs = this.settings.groupingWindowMs || DEFAULT_GROUP_WINDOW_MS;
    entry.timer = setTimeout(() => {
      this.flushGroup(groupKey);
    }, windowMs);

    // Safety: if queue too large, flush immediately
    if (entry.items.length >= MAX_QUEUE_SIZE) {
      if (entry.timer) clearTimeout(entry.timer);
      this.flushGroup(groupKey);
    }
  }

  private flushGroup(groupKey: string): void {
    const entry = this.groupQueue.get(groupKey);
    if (!entry || entry.items.length === 0) return;

    const items = entry.items;
    this.groupQueue.delete(groupKey);

    if (items.length === 1) {
      // Single item → show as regular toast
      const item = items[0];
      item.displayState = "displayed";
      this.emit({ type: "show_toast", notification: item });
    } else {
      // Multiple items → create group
      const category = items[0].category;
      const group: NotificationGroup = {
        groupKey,
        category,
        title: this.buildGroupTitle(category, items.length),
        count: items.length,
        latestAt: items[items.length - 1].createdAt,
        itemIds: items.map((i) => i.id),
        deeplink: items[0].deeplink,
      };

      // Mark items as grouped
      items.forEach((item) => {
        item.displayState = "grouped";
        item.groupKey = groupKey;
      });

      // Store group
      this.groups.set(groupKey, group);

      // Emit grouped toast
      this.emit({ type: "show_group_toast", group });
    }
  }

  private buildGroupTitle(
    category: NotificationCategory,
    count: number,
  ): string {
    const categoryLabels: Record<string, string> = {
      chat: `Bạn có ${count} tin nhắn mới`,
      booking: `Bạn có ${count} đơn đặt mới`,
      call: `Bạn có ${count} cuộc gọi nhỡ`,
      payment: `Bạn có ${count} cập nhật thanh toán`,
      project: `Bạn có ${count} cập nhật dự án`,
      task: `Bạn có ${count} cập nhật công việc`,
      system: `${count} thông báo hệ thống`,
      social: `${count} hoạt động mới từ bạn bè`,
      meeting: `${count} cập nhật cuộc họp`,
      delivery: `${count} cập nhật giao hàng`,
    };
    return categoryLabels[category] || `Bạn có ${count} thông báo mới`;
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  getAllItems(): NotificationItem[] {
    if (!this.itemsDirty && this.cachedSortedItems) {
      return this.cachedSortedItems;
    }
    this.cachedSortedItems = Array.from(this.items.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    this.itemsDirty = false;
    return this.cachedSortedItems;
  }

  getItemsByCategory(category: NotificationCategory): NotificationItem[] {
    return this.getAllItems().filter((item) => item.category === category);
  }

  getGroups(): NotificationGroup[] {
    return Array.from(this.groups.values());
  }

  getUnreadCount(): number {
    return Array.from(this.items.values()).filter((item) => !item.read).length;
  }

  getUnreadCountByCategory(category: NotificationCategory): number {
    return Array.from(this.items.values()).filter(
      (item) => !item.read && item.category === category,
    ).length;
  }

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  markAsRead(id: string): void {
    const item = this.items.get(id);
    if (item && !item.read) {
      item.read = true;
      item.displayState = "tapped";
      this.itemsDirty = true;
      this.schedulePersistItems();
      this.emit({ type: "update_center", notifications: this.getAllItems() });
      this.emit({ type: "badge_update", count: this.getUnreadCount() });
    }
  }

  markAllAsRead(): void {
    let changed = false;
    this.items.forEach((item) => {
      if (!item.read) {
        item.read = true;
        changed = true;
      }
    });
    if (changed) {
      this.itemsDirty = true;
      this.schedulePersistItems();
      this.emit({ type: "update_center", notifications: this.getAllItems() });
      this.emit({ type: "badge_update", count: 0 });
    }
  }

  removeItem(id: string): void {
    this.items.delete(id);
    this.itemsDirty = true;
    this.schedulePersistItems();
    this.emit({ type: "update_center", notifications: this.getAllItems() });
    this.emit({ type: "badge_update", count: this.getUnreadCount() });
  }

  clearAll(): void {
    this.items.clear();
    this.groups.clear();
    this.itemsDirty = true;
    this.cachedSortedItems = null;
    AsyncStorage.removeItem(ITEMS_CACHE_KEY).catch(() => {});
    this.emit({ type: "update_center", notifications: [] });
    this.emit({ type: "badge_update", count: 0 });
  }

  // ==========================================================================
  // SETTINGS
  // ==========================================================================

  getSettings(): NotificationUserSettings {
    return { ...this.settings };
  }

  async updateSettings(
    partial: Partial<NotificationUserSettings>,
  ): Promise<void> {
    this.settings = { ...this.settings, ...partial };
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(this.settings),
      );
    } catch {
      // noop
    }
    this.emit({ type: "settings_changed", settings: this.settings });
  }

  muteCategory(category: NotificationCategory): void {
    if (!this.settings.mutedCategories.includes(category)) {
      this.updateSettings({
        mutedCategories: [...this.settings.mutedCategories, category],
      });
    }
  }

  unmuteCategory(category: NotificationCategory): void {
    this.updateSettings({
      mutedCategories: this.settings.mutedCategories.filter(
        (c) => c !== category,
      ),
    });
  }

  muteThread(threadId: string): void {
    if (!this.settings.mutedThreads.includes(threadId)) {
      this.updateSettings({
        mutedThreads: [...this.settings.mutedThreads, threadId],
      });
    }
  }

  unmuteThread(threadId: string): void {
    this.updateSettings({
      mutedThreads: this.settings.mutedThreads.filter((t) => t !== threadId),
    });
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  destroy(): void {
    // Clear all timers
    this.groupQueue.forEach((entry) => {
      if (entry.timer) clearTimeout(entry.timer);
    });
    this.groupQueue.clear();
    if (this.persistDedupeTimer) clearTimeout(this.persistDedupeTimer);
    if (this.persistItemsTimer) clearTimeout(this.persistItemsTimer);
    this.persistDedupeTimer = null;
    this.persistItemsTimer = null;
    this.listeners.clear();
    this.cachedSortedItems = null;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const notificationSystem = new NotificationSystem();
export default notificationSystem;
