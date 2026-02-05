/**
 * Chat Sync Service (Zalo-Style Watermark Protocol)
 * =================================================
 *
 * Handles delta synchronization between local SQLite and server:
 * 1. Get local watermarks (lastSeq per conversation)
 * 2. Request only new messages from server (seq > watermark)
 * 3. Merge into local database
 * 4. Update watermarks
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import NetInfo from "@react-native-community/netinfo";
import { apiFetch } from "./api";
import chatLocalDB, {
    LocalMessage,
    bulkInsertMessages,
    getPendingMessages,
    getWatermarks,
    markMessageSynced,
    upsertConversation
} from "./chatLocalDB";
import { realtimeMessaging } from "./realtime-messaging.service";

// ============================================
// TYPES
// ============================================

interface SyncStatus {
  lastSyncAt: Date | null;
  isSyncing: boolean;
  pendingCount: number;
  error: string | null;
}

interface ServerMessage {
  id: string;
  conversationId: string;
  seq: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  type: string;
  content?: string;
  attachments?: any[];
  createdAt: string;
}

interface SyncResponse {
  conversations: Array<{
    id: string;
    name?: string;
    type: "direct" | "group";
    lastSeq: number;
    unreadCount: number;
    messages: ServerMessage[];
  }>;
}

// ============================================
// SYNC SERVICE
// ============================================

class ChatSyncService {
  private status: SyncStatus = {
    lastSyncAt: null,
    isSyncing: false,
    pendingCount: 0,
    error: null,
  };

  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  /**
   * Start periodic sync (every 30 seconds when online)
   */
  startPeriodicSync(intervalMs: number = 30000): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncIfOnline();
    }, intervalMs);

    // Initial sync
    this.syncIfOnline();

    console.log("[ChatSync] Periodic sync started");
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log("[ChatSync] Periodic sync stopped");
  }

  /**
   * Sync only if online
   */
  private async syncIfOnline(): Promise<void> {
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      await this.fullSync();
    }
  }

  /**
   * Full sync using watermark protocol (Zalo-style)
   *
   * Protocol:
   * 1. Get local watermarks { conversationId, lastSeq }[]
   * 2. Send to server
   * 3. Server returns only messages where seq > lastSeq
   * 4. Insert into local DB
   * 5. Update watermarks
   */
  async fullSync(): Promise<void> {
    if (this.status.isSyncing) {
      console.log("[ChatSync] Already syncing, skipping...");
      return;
    }

    this.updateStatus({ isSyncing: true, error: null });

    try {
      // 1. Get local watermarks
      const watermarks = await getWatermarks();
      console.log("[ChatSync] Watermarks:", watermarks.length, "conversations");

      // 2. Try WebSocket sync first (faster, real-time connection)
      let syncData: SyncResponse | null = null;

      if (realtimeMessaging.isConnected()) {
        syncData = await this.syncViaWebSocket(watermarks);
      }

      // 3. Fallback to REST API if WebSocket not available
      if (!syncData) {
        syncData = await this.syncViaREST(watermarks);
      }

      // 4. Process sync data
      if (syncData) {
        await this.processSyncData(syncData);
      }

      // 5. Send pending (offline) messages
      await this.syncPendingMessages();

      this.updateStatus({
        isSyncing: false,
        lastSyncAt: new Date(),
        error: null,
      });

      console.log("[ChatSync] Full sync completed");
    } catch (error: any) {
      console.error("[ChatSync] Sync failed:", error);
      this.updateStatus({
        isSyncing: false,
        error: error.message || "Sync failed",
      });
    }
  }

  /**
   * Sync via WebSocket (preferred, lower latency)
   */
  private async syncViaWebSocket(
    watermarks: { conversationId: string; lastSeq: number }[],
  ): Promise<SyncResponse | null> {
    try {
      const data = await realtimeMessaging.syncConversations(
        watermarks.map((w) => ({
          conversationId: w.conversationId,
          lastSeq: w.lastSeq,
        })),
      );

      // Convert to SyncResponse format
      if (Array.isArray(data) && data.length > 0) {
        return { conversations: data };
      }

      return null;
    } catch (error) {
      console.warn("[ChatSync] WebSocket sync failed, falling back to REST");
      return null;
    }
  }

  /**
   * Sync via REST API (fallback)
   */
  private async syncViaREST(
    watermarks: { conversationId: string; lastSeq: number }[],
  ): Promise<SyncResponse | null> {
    try {
      const response = await apiFetch<SyncResponse>("/chat/sync", {
        method: "POST",
        data: { watermarks },
      });

      return response;
    } catch (error: any) {
      // 404 means endpoint not implemented yet
      if (error.status === 404) {
        console.warn("[ChatSync] Sync endpoint not available, skipping");
        return null;
      }
      throw error;
    }
  }

  /**
   * Process sync data - insert messages and update conversations
   */
  private async processSyncData(data: SyncResponse): Promise<void> {
    for (const conv of data.conversations) {
      // Update conversation metadata
      await upsertConversation({
        id: conv.id,
        name: conv.name,
        type: conv.type,
        lastSeq: conv.lastSeq,
        unreadCount: conv.unreadCount,
        isMuted: false,
        isPinned: false,
      });

      // Insert new messages
      if (conv.messages && conv.messages.length > 0) {
        const localMessages: LocalMessage[] = conv.messages.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          seq: m.seq,
          senderId: m.senderId,
          senderName: m.senderName,
          senderAvatar: m.senderAvatar,
          type: m.type,
          content: m.content,
          attachments: m.attachments,
          status: "sent" as const,
          createdAt: new Date(m.createdAt),
          synced: true,
        }));

        await bulkInsertMessages(localMessages);
        console.log(
          `[ChatSync] Inserted ${localMessages.length} messages for ${conv.id}`,
        );
      }
    }
  }

  /**
   * Sync pending (offline) messages to server
   */
  private async syncPendingMessages(): Promise<void> {
    const pendingMessages = await getPendingMessages();

    if (pendingMessages.length === 0) return;

    console.log(
      `[ChatSync] Syncing ${pendingMessages.length} pending messages`,
    );

    for (const msg of pendingMessages) {
      try {
        if (realtimeMessaging.isConnected()) {
          // Send via WebSocket
          const ack = await realtimeMessaging.sendMessage({
            conversationId: msg.conversationId,
            clientMessageId: msg.clientMessageId || msg.id,
            type: msg.type as any,
            content: msg.content,
            attachments: msg.attachments,
          });

          if (ack.success && ack.messageId && ack.seq) {
            await markMessageSynced(
              msg.clientMessageId || msg.id,
              ack.messageId,
              ack.seq,
            );
          }
        } else {
          // Send via REST API
          const response = await apiFetch<{
            id: string;
            seq: number;
          }>(`/conversations/${msg.conversationId}/messages`, {
            method: "POST",
            data: {
              content: msg.content,
              type: msg.type,
              attachments: msg.attachments,
              clientMessageId: msg.clientMessageId,
            },
          });

          await markMessageSynced(
            msg.clientMessageId || msg.id,
            response.id,
            response.seq,
          );
        }
      } catch (error) {
        console.error(`[ChatSync] Failed to sync message ${msg.id}:`, error);
        // Will retry next sync cycle
      }
    }

    // Update pending count
    const remaining = await getPendingMessages();
    this.updateStatus({ pendingCount: remaining.length });
  }

  /**
   * Incremental sync for single conversation
   */
  async syncConversation(conversationId: string): Promise<void> {
    try {
      const conv = await chatLocalDB.getConversation(conversationId);
      const lastSeq = conv?.lastSeq || 0;

      // Request messages since lastSeq
      const response = await apiFetch<{ messages: ServerMessage[] }>(
        `/conversations/${conversationId}/messages?since_seq=${lastSeq}&limit=100`,
      );

      if (response.messages && response.messages.length > 0) {
        const localMessages: LocalMessage[] = response.messages.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          seq: m.seq,
          senderId: m.senderId,
          senderName: m.senderName,
          senderAvatar: m.senderAvatar,
          type: m.type,
          content: m.content,
          attachments: m.attachments,
          status: "sent" as const,
          createdAt: new Date(m.createdAt),
          synced: true,
        }));

        await bulkInsertMessages(localMessages);
        console.log(
          `[ChatSync] Incremental sync: ${localMessages.length} new messages`,
        );
      }
    } catch (error) {
      console.error(
        `[ChatSync] Failed to sync conversation ${conversationId}:`,
        error,
      );
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private updateStatus(partial: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...partial };
    this.listeners.forEach((l) => l(this.status));
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const chatSyncService = new ChatSyncService();

export default chatSyncService;
