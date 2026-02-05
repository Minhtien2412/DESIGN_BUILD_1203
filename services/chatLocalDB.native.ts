/**
 * Chat Local Database Service (Zalo-Style) - NATIVE IMPLEMENTATION
 * =================================================================
 *
 * Local-first chat storage using SQLite for:
 * - Instant message display (no network latency)
 * - Offline support
 * - Efficient pagination with indexes
 * - Delta sync with watermarks
 *
 * This file is ONLY loaded on native platforms (iOS/Android).
 * For web, see chatLocalDB.web.ts
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import * as SQLite from "expo-sqlite";

// ============================================
// DATABASE INSTANCE
// ============================================

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database connection
 */
export async function initChatDB(): Promise<SQLite.SQLiteDatabase | null> {
  if (db) return db;

  try {
    db = await SQLite.openDatabaseAsync("chat_history.db");

    // Create tables
    await db.execAsync(`
      -- Messages table with efficient indexing
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        client_message_id TEXT UNIQUE,
        conversation_id TEXT NOT NULL,
        seq INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        sender_name TEXT,
        sender_avatar TEXT,
        type TEXT DEFAULT 'TEXT',
        content TEXT,
        attachments TEXT,
        reply_to TEXT,
        status TEXT DEFAULT 'sent',
        created_at INTEGER NOT NULL,
        edited_at INTEGER,
        synced INTEGER DEFAULT 1,
        UNIQUE(conversation_id, seq)
      );

      -- Index for fast loading by conversation (newest first)
      CREATE INDEX IF NOT EXISTS idx_messages_conv_seq 
        ON messages(conversation_id, seq DESC);
      
      -- Index for pending sync
      CREATE INDEX IF NOT EXISTS idx_messages_synced 
        ON messages(synced) WHERE synced = 0;

      -- Conversations table with watermarks
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT DEFAULT 'direct',
        avatar TEXT,
        last_seq INTEGER DEFAULT 0,
        last_message_preview TEXT,
        last_message_time INTEGER,
        unread_count INTEGER DEFAULT 0,
        is_muted INTEGER DEFAULT 0,
        is_pinned INTEGER DEFAULT 0,
        updated_at INTEGER,
        synced_at INTEGER
      );

      -- Index for conversation list (pinned first, then by time)
      CREATE INDEX IF NOT EXISTS idx_conversations_order 
        ON conversations(is_pinned DESC, last_message_time DESC);

      -- Read receipts (for tracking who read what)
      CREATE TABLE IF NOT EXISTS read_receipts (
        conversation_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        last_read_seq INTEGER NOT NULL,
        read_at INTEGER NOT NULL,
        PRIMARY KEY (conversation_id, user_id)
      );

      -- Typing indicators (ephemeral, cleaned up regularly)
      CREATE TABLE IF NOT EXISTS typing_status (
        conversation_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        started_at INTEGER NOT NULL,
        PRIMARY KEY (conversation_id, user_id)
      );
    `);

    console.log("[ChatLocalDB] Database initialized successfully");
    return db;
  } catch (error) {
    console.error("[ChatLocalDB] Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Get database instance (lazy init)
 */
export async function getDB(): Promise<SQLite.SQLiteDatabase | null> {
  if (!db) {
    return initChatDB();
  }
  return db;
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

export interface LocalMessage {
  id: string;
  clientMessageId?: string;
  conversationId: string;
  seq: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
  type: string;
  content?: string;
  attachments?: any[];
  replyTo?: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  createdAt: Date;
  editedAt?: Date;
  synced: boolean;
}

/**
 * Insert or update message (upsert)
 */
export async function upsertMessage(message: LocalMessage): Promise<void> {
  const database = await getDB();
  if (!database) {
    console.log("[ChatDB] Skipping upsertMessage - no database on web");
    return;
  }

  await database.runAsync(
    `INSERT OR REPLACE INTO messages (
      id, client_message_id, conversation_id, seq, sender_id,
      sender_name, sender_avatar, type, content, attachments,
      reply_to, status, created_at, edited_at, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.clientMessageId || null,
      message.conversationId,
      message.seq,
      message.senderId,
      message.senderName || null,
      message.senderAvatar || null,
      message.type,
      message.content || null,
      message.attachments ? JSON.stringify(message.attachments) : null,
      message.replyTo || null,
      message.status,
      message.createdAt.getTime(),
      message.editedAt?.getTime() || null,
      message.synced ? 1 : 0,
    ],
  );

  // Update conversation watermark if this is newer
  await database.runAsync(
    `UPDATE conversations 
     SET last_seq = MAX(last_seq, ?),
         last_message_preview = ?,
         last_message_time = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      message.seq,
      formatMessagePreview(message.type, message.content),
      message.createdAt.getTime(),
      Date.now(),
      message.conversationId,
    ],
  );
}

/**
 * Get messages for conversation (paginated, newest first)
 */
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  beforeSeq?: number,
): Promise<LocalMessage[]> {
  const database = await getDB();
  if (!database) {
    return [];
  }

  let query = `
    SELECT * FROM messages 
    WHERE conversation_id = ?
  `;
  const params: any[] = [conversationId];

  if (beforeSeq !== undefined) {
    query += ` AND seq < ?`;
    params.push(beforeSeq);
  }

  query += ` ORDER BY seq DESC LIMIT ?`;
  params.push(limit);

  const rows = await database.getAllAsync<any>(query, params);

  return rows.map(parseMessageRow).reverse(); // Return in ascending order
}

/**
 * Get pending (unsynced) messages
 */
export async function getPendingMessages(): Promise<LocalMessage[]> {
  const database = await getDB();
  if (!database) return [];

  const rows = await database.getAllAsync<any>(
    `SELECT * FROM messages WHERE synced = 0 ORDER BY created_at ASC`,
  );

  return rows.map(parseMessageRow);
}

/**
 * Mark message as synced
 */
export async function markMessageSynced(
  clientMessageId: string,
  serverId: string,
  seq: number,
): Promise<void> {
  const database = await getDB();
  if (!database) return;

  await database.runAsync(
    `UPDATE messages SET id = ?, seq = ?, synced = 1, status = 'sent' 
     WHERE client_message_id = ?`,
    [serverId, seq, clientMessageId],
  );
}

/**
 * Update message status
 */
export async function updateMessageStatus(
  messageId: string,
  status: LocalMessage["status"],
): Promise<void> {
  const database = await getDB();
  if (!database) return;

  await database.runAsync(`UPDATE messages SET status = ? WHERE id = ?`, [
    status,
    messageId,
  ]);
}

/**
 * Delete message locally
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const database = await getDB();
  if (!database) return;
  await database.runAsync(`DELETE FROM messages WHERE id = ?`, [messageId]);
}

/**
 * Search messages by content
 */
export async function searchMessages(
  query: string,
  conversationId?: string,
  limit: number = 50,
): Promise<LocalMessage[]> {
  const database = await getDB();
  if (!database) return [];

  let sql = `SELECT * FROM messages WHERE content LIKE ?`;
  const params: any[] = [`%${query}%`];

  if (conversationId) {
    sql += ` AND conversation_id = ?`;
    params.push(conversationId);
  }

  sql += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);

  const rows = await database.getAllAsync<any>(sql, params);
  return rows.map(parseMessageRow);
}

// ============================================
// CONVERSATION OPERATIONS
// ============================================

export interface LocalConversation {
  id: string;
  name?: string;
  type: "direct" | "group";
  avatar?: string;
  lastSeq: number;
  lastMessagePreview?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  updatedAt?: Date;
  syncedAt?: Date;
}

/**
 * Upsert conversation
 */
export async function upsertConversation(
  conv: LocalConversation,
): Promise<void> {
  const database = await getDB();
  if (!database) return;

  await database.runAsync(
    `INSERT OR REPLACE INTO conversations (
      id, name, type, avatar, last_seq, last_message_preview,
      last_message_time, unread_count, is_muted, is_pinned, updated_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      conv.id,
      conv.name || null,
      conv.type,
      conv.avatar || null,
      conv.lastSeq,
      conv.lastMessagePreview || null,
      conv.lastMessageTime?.getTime() || null,
      conv.unreadCount,
      conv.isMuted ? 1 : 0,
      conv.isPinned ? 1 : 0,
      conv.updatedAt?.getTime() || Date.now(),
      conv.syncedAt?.getTime() || null,
    ],
  );
}

/**
 * Get all conversations (sorted by pinned, then time)
 */
export async function getConversations(): Promise<LocalConversation[]> {
  const database = await getDB();
  if (!database) return [];

  const rows = await database.getAllAsync<any>(
    `SELECT * FROM conversations 
     ORDER BY is_pinned DESC, last_message_time DESC`,
  );

  return rows.map(parseConversationRow);
}

/**
 * Get conversation by ID
 */
export async function getConversation(
  id: string,
): Promise<LocalConversation | null> {
  const database = await getDB();
  if (!database) return null;

  const row = await database.getFirstAsync<any>(
    `SELECT * FROM conversations WHERE id = ?`,
    [id],
  );

  return row ? parseConversationRow(row) : null;
}

/**
 * Get watermarks for sync (Zalo-style)
 */
export async function getWatermarks(): Promise<
  { conversationId: string; lastSeq: number }[]
> {
  const database = await getDB();
  if (!database) return [];

  const rows = await database.getAllAsync<{ id: string; last_seq: number }>(
    `SELECT id, last_seq FROM conversations`,
  );

  return rows.map((r: { id: string; last_seq: number }) => ({
    conversationId: r.id,
    lastSeq: r.last_seq,
  }));
}

/**
 * Update unread count
 */
export async function updateUnreadCount(
  conversationId: string,
  count: number,
): Promise<void> {
  const database = await getDB();
  if (!database) return;

  await database.runAsync(
    `UPDATE conversations SET unread_count = ? WHERE id = ?`,
    [count, conversationId],
  );
}

/**
 * Mark conversation as read (reset unread)
 */
export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  await updateUnreadCount(conversationId, 0);
}

/**
 * Get total unread count across all conversations
 */
export async function getTotalUnreadCount(): Promise<number> {
  const database = await getDB();
  if (!database) return 0;

  const result = await database.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(unread_count), 0) as total FROM conversations`,
  );

  return result?.total || 0;
}

/**
 * Get unread count by conversation
 */
export async function getUnreadCountByConversation(
  conversationId: string,
): Promise<number> {
  const database = await getDB();
  if (!database) return 0;

  const result = await database.getFirstAsync<{ unread_count: number }>(
    `SELECT unread_count FROM conversations WHERE id = ?`,
    [conversationId],
  );

  return result?.unread_count || 0;
}

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * Bulk insert messages (for sync)
 */
export async function bulkInsertMessages(
  messages: LocalMessage[],
): Promise<void> {
  const database = await getDB();
  if (!database) return;

  await database.withTransactionAsync(async () => {
    for (const msg of messages) {
      await upsertMessage(msg);
    }
  });
}

/**
 * Get messages newer than seq (for delta sync)
 */
export async function getMessagesSinceSeq(
  conversationId: string,
  sinceSeq: number,
): Promise<LocalMessage[]> {
  const database = await getDB();
  if (!database) return [];

  const rows = await database.getAllAsync<any>(
    `SELECT * FROM messages 
     WHERE conversation_id = ? AND seq > ?
     ORDER BY seq ASC`,
    [conversationId, sinceSeq],
  );

  return rows.map(parseMessageRow);
}

// ============================================
// CLEANUP OPERATIONS
// ============================================

/**
 * Clear old typing indicators (older than 30 seconds)
 */
export async function cleanupTypingIndicators(): Promise<void> {
  const database = await getDB();
  if (!database) return;
  const threshold = Date.now() - 30000; // 30 seconds

  await database.runAsync(`DELETE FROM typing_status WHERE started_at < ?`, [
    threshold,
  ]);
}

/**
 * Clear all local data (for logout)
 */
export async function clearAllData(): Promise<void> {
  const database = await getDB();
  if (!database) return;

  await database.execAsync(`
    DELETE FROM messages;
    DELETE FROM conversations;
    DELETE FROM read_receipts;
    DELETE FROM typing_status;
  `);

  console.log("[ChatLocalDB] All data cleared");
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseMessageRow(row: any): LocalMessage {
  return {
    id: row.id,
    clientMessageId: row.client_message_id,
    conversationId: row.conversation_id,
    seq: row.seq,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar,
    type: row.type,
    content: row.content,
    attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
    replyTo: row.reply_to,
    status: row.status,
    createdAt: new Date(row.created_at),
    editedAt: row.edited_at ? new Date(row.edited_at) : undefined,
    synced: row.synced === 1,
  };
}

function parseConversationRow(row: any): LocalConversation {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    avatar: row.avatar,
    lastSeq: row.last_seq,
    lastMessagePreview: row.last_message_preview,
    lastMessageTime: row.last_message_time
      ? new Date(row.last_message_time)
      : undefined,
    unreadCount: row.unread_count,
    isMuted: row.is_muted === 1,
    isPinned: row.is_pinned === 1,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    syncedAt: row.synced_at ? new Date(row.synced_at) : undefined,
  };
}

function formatMessagePreview(type: string, content?: string): string {
  if (type === "TEXT" && content) {
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  }

  const previews: Record<string, string> = {
    IMAGE: "📷 Hình ảnh",
    VIDEO: "🎬 Video",
    FILE: "📎 Tệp đính kèm",
    AUDIO: "🎵 Audio",
    VOICE: "🎤 Tin nhắn thoại",
    STICKER: "😀 Sticker",
    LOCATION: "📍 Vị trí",
    CALL: "📞 Cuộc gọi",
    SYSTEM: "📢 Thông báo",
  };

  return previews[type] || content || "";
}

// ============================================
// EXPORTS
// ============================================

export default {
  initChatDB,
  getDB,
  // Messages
  upsertMessage,
  getMessages,
  getPendingMessages,
  markMessageSynced,
  updateMessageStatus,
  deleteMessage,
  searchMessages,
  bulkInsertMessages,
  getMessagesSinceSeq,
  // Conversations
  upsertConversation,
  getConversations,
  getConversation,
  getWatermarks,
  updateUnreadCount,
  markConversationRead,
  // Cleanup
  cleanupTypingIndicators,
  clearAllData,
};
