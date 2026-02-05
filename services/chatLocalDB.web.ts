/**
 * Chat Local Database Service - WEB STUB
 * =======================================
 *
 * Web không hỗ trợ SQLite nên tất cả functions trả về empty/no-op.
 * File này được Metro bundler sử dụng khi build cho web platform.
 */

// ============================================
// TYPES (shared with native)
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

// ============================================
// STUB IMPLEMENTATIONS - Return empty/no-op on web
// ============================================

export async function initChatDB(): Promise<null> {
  console.log("[ChatDB.web] SQLite not available on web platform");
  return null;
}

export async function getDB(): Promise<null> {
  return null;
}

export async function upsertMessage(_message: LocalMessage): Promise<void> {
  // No-op on web
}

export async function getMessages(
  _conversationId: string,
  _limit?: number,
  _beforeSeq?: number,
): Promise<LocalMessage[]> {
  return [];
}

export async function getPendingMessages(): Promise<LocalMessage[]> {
  return [];
}

export async function markMessageSynced(
  _clientMessageId: string,
  _serverId: string,
  _seq: number,
): Promise<void> {
  // No-op on web
}

export async function updateMessageStatus(
  _messageId: string,
  _status: LocalMessage["status"],
): Promise<void> {
  // No-op on web
}

export async function deleteMessage(_messageId: string): Promise<void> {
  // No-op on web
}

export async function searchMessages(
  _query: string,
  _conversationId?: string,
  _limit?: number,
): Promise<LocalMessage[]> {
  return [];
}

export async function upsertConversation(
  _conv: LocalConversation,
): Promise<void> {
  // No-op on web
}

export async function getConversations(): Promise<LocalConversation[]> {
  return [];
}

export async function getConversation(
  _id: string,
): Promise<LocalConversation | null> {
  return null;
}

export async function getWatermarks(): Promise<
  { conversationId: string; lastSeq: number }[]
> {
  return [];
}

export async function updateUnreadCount(
  _conversationId: string,
  _count: number,
): Promise<void> {
  // No-op on web
}

export async function markConversationRead(
  _conversationId: string,
): Promise<void> {
  // No-op on web
}

export async function getTotalUnreadCount(): Promise<number> {
  return 0;
}

export async function getUnreadCountByConversation(
  _conversationId: string,
): Promise<number> {
  return 0;
}

export async function bulkInsertMessages(
  _messages: LocalMessage[],
): Promise<void> {
  // No-op on web
}

export async function getMessagesSinceSeq(
  _conversationId: string,
  _sinceSeq: number,
): Promise<LocalMessage[]> {
  return [];
}

export async function cleanupTypingIndicators(): Promise<void> {
  // No-op on web
}

export async function clearAllData(): Promise<void> {
  console.log("[ChatDB.web] clearAllData - no-op on web");
}

// Helper functions - no-op on web
export function formatMessagePreview(_type: string, _content?: string): string {
  return "";
}
