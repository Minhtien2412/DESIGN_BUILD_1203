/**
 * Chat Delta Sync Service
 * =======================
 *
 * Service để sync messages với BE sử dụng delta sync protocol:
 * - Watermark-based sync (chỉ lấy messages mới)
 * - Batch sync cho nhiều conversations
 * - Auto-retry với exponential backoff
 * - Offline queue support
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { get, post } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================
// TYPES
// ============================================

export interface Watermark {
  conversationId: string;
  lastSeq: number;
}

export interface DeltaSyncRequest {
  watermarks: Watermark[];
  limit?: number;
  includeNewConversations?: boolean;
}

export interface DeltaMessage {
  id: string;
  seq: number;
  content: string;
  type: string;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
  attachments?: DeltaAttachment[];
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface DeltaAttachment {
  id: string;
  type: string;
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface DeltaConversation {
  conversationId: string;
  lastSeq: number;
  messages: DeltaMessage[];
  hasMore: boolean;
}

export interface DeltaSyncResponse {
  success: boolean;
  conversations: DeltaConversation[];
  syncTimestamp: string;
  totalNewMessages: number;
  hasMore: boolean;
}

export interface SupportUser {
  id: string;
  numericId: number;
  name: string;
  avatar: string;
  role: string;
  department: string;
  isOnline: boolean;
  welcomeMessage: string;
  responseTime: string;
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  WATERMARKS: "chat_watermarks",
  LAST_SYNC: "chat_last_sync",
  OFFLINE_QUEUE: "chat_offline_queue",
};

// ============================================
// DELTA SYNC SERVICE
// ============================================

class ChatDeltaSyncService {
  private watermarks: Map<string, number> = new Map();
  private offlineQueue: any[] = [];
  private isSyncing: boolean = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadWatermarks();
  }

  // ============================================
  // WATERMARK MANAGEMENT
  // ============================================

  /**
   * Load watermarks từ storage
   */
  async loadWatermarks(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WATERMARKS);
      if (stored) {
        const data = JSON.parse(stored) as Record<string, number>;
        this.watermarks = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error("[DeltaSync] Failed to load watermarks:", error);
    }
  }

  /**
   * Save watermarks to storage
   */
  async saveWatermarks(): Promise<void> {
    try {
      const data = Object.fromEntries(this.watermarks);
      await AsyncStorage.setItem(STORAGE_KEYS.WATERMARKS, JSON.stringify(data));
    } catch (error) {
      console.error("[DeltaSync] Failed to save watermarks:", error);
    }
  }

  /**
   * Update watermark cho conversation
   */
  updateWatermark(conversationId: string, seq: number): void {
    const current = this.watermarks.get(conversationId) || 0;
    if (seq > current) {
      this.watermarks.set(conversationId, seq);
      this.saveWatermarks();
    }
  }

  /**
   * Get watermark cho conversation
   */
  getWatermark(conversationId: string): number {
    return this.watermarks.get(conversationId) || 0;
  }

  /**
   * Get all watermarks
   */
  getAllWatermarks(): Watermark[] {
    return Array.from(this.watermarks.entries()).map(
      ([conversationId, lastSeq]) => ({
        conversationId,
        lastSeq,
      }),
    );
  }

  // ============================================
  // DELTA SYNC
  // ============================================

  /**
   * Perform delta sync với server
   */
  async deltaSync(options?: {
    conversationIds?: string[];
    limit?: number;
    includeNewConversations?: boolean;
  }): Promise<DeltaSyncResponse> {
    if (this.isSyncing) {
      console.log("[DeltaSync] Sync already in progress, skipping...");
      return {
        success: false,
        conversations: [],
        syncTimestamp: new Date().toISOString(),
        totalNewMessages: 0,
        hasMore: false,
      };
    }

    this.isSyncing = true;

    try {
      // Prepare watermarks
      let watermarks: Watermark[];
      if (options?.conversationIds) {
        watermarks = options.conversationIds.map((id) => ({
          conversationId: id,
          lastSeq: this.getWatermark(id),
        }));
      } else {
        watermarks = this.getAllWatermarks();
      }

      const request: DeltaSyncRequest = {
        watermarks,
        limit: options?.limit || 100,
        includeNewConversations: options?.includeNewConversations ?? true,
      };

      const response = await post<DeltaSyncResponse>(
        "/chat/sync/delta",
        request,
      );

      if (response.success) {
        // Update watermarks từ response
        for (const conv of response.conversations) {
          if (conv.lastSeq > 0) {
            this.updateWatermark(conv.conversationId, conv.lastSeq);
          }
        }

        // Save last sync time
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_SYNC,
          new Date().toISOString(),
        );
      }

      return response;
    } catch (error) {
      console.error("[DeltaSync] Sync failed:", error);
      return {
        success: false,
        conversations: [],
        syncTimestamp: new Date().toISOString(),
        totalNewMessages: 0,
        hasMore: false,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Full sync (cho new clients hoặc reset)
   */
  async fullSync(limit?: number): Promise<DeltaSyncResponse> {
    try {
      // Clear existing watermarks
      this.watermarks.clear();
      await this.saveWatermarks();

      const response = await get<DeltaSyncResponse>("/chat/sync/full", {
        params: { limit: limit || 50 },
      });

      if (response.success) {
        // Set watermarks từ response
        for (const conv of response.conversations) {
          if (conv.lastSeq > 0) {
            this.updateWatermark(conv.conversationId, conv.lastSeq);
          }
        }
      }

      return response;
    } catch (error) {
      console.error("[DeltaSync] Full sync failed:", error);
      return {
        success: false,
        conversations: [],
        syncTimestamp: new Date().toISOString(),
        totalNewMessages: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Sync single conversation
   */
  async syncConversation(
    conversationId: string,
  ): Promise<DeltaConversation | null> {
    const response = await this.deltaSync({
      conversationIds: [conversationId],
      includeNewConversations: false,
    });

    return (
      response.conversations.find((c) => c.conversationId === conversationId) ||
      null
    );
  }

  // ============================================
  // SUPPORT USERS
  // ============================================

  /**
   * Get support users từ server
   */
  async getSupportUsers(): Promise<SupportUser[]> {
    try {
      const response = await get<{ users: SupportUser[] }>(
        "/chat/sync/support-users",
      );
      return response.users || [];
    } catch (error) {
      console.error("[DeltaSync] Failed to get support users:", error);
      return [];
    }
  }

  /**
   * Create hoặc get support conversation
   */
  async getOrCreateSupportConversation(supportUserId: number): Promise<{
    conversationId: string;
    isNew: boolean;
  } | null> {
    try {
      const response = await post<{
        conversationId: string;
        isNew: boolean;
      }>("/chat/sync/support-conversation", { supportUserId });
      return response;
    } catch (error) {
      console.error(
        "[DeltaSync] Failed to create support conversation:",
        error,
      );
      return null;
    }
  }

  // ============================================
  // OFFLINE QUEUE
  // ============================================

  /**
   * Add message to offline queue
   */
  async queueOfflineMessage(message: any): Promise<void> {
    this.offlineQueue.push({
      ...message,
      queuedAt: new Date().toISOString(),
    });
    await this.saveOfflineQueue();
  }

  /**
   * Process offline queue
   */
  async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const message of queue) {
      try {
        await post("/chat/messages", message);
      } catch (error) {
        console.error("[DeltaSync] Failed to send queued message:", error);
        // Re-queue failed messages
        this.offlineQueue.push(message);
      }
    }

    await this.saveOfflineQueue();
  }

  /**
   * Save offline queue to storage
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(this.offlineQueue),
      );
    } catch (error) {
      console.error("[DeltaSync] Failed to save offline queue:", error);
    }
  }

  /**
   * Load offline queue from storage
   */
  async loadOfflineQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("[DeltaSync] Failed to load offline queue:", error);
    }
  }

  // ============================================
  // AUTO SYNC
  // ============================================

  /**
   * Start auto sync interval
   */
  startAutoSync(intervalMs: number = 30000): void {
    this.stopAutoSync();
    this.syncInterval = setInterval(() => {
      this.deltaSync();
    }, intervalMs);
    console.log(`[DeltaSync] Auto sync started (${intervalMs}ms)`);
  }

  /**
   * Stop auto sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log("[DeltaSync] Auto sync stopped");
    }
  }

  // ============================================
  // UTILS
  // ============================================

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    this.watermarks.clear();
    this.offlineQueue = [];
    this.stopAutoSync();

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.WATERMARKS),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC),
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE),
    ]);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const chatDeltaSyncService = new ChatDeltaSyncService();

export default chatDeltaSyncService;
