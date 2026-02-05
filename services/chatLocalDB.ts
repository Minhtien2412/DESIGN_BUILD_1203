/**
 * Chat Local Database - Platform-agnostic barrel
 * Re-exports from platform-specific implementations
 *
 * Metro bundler will automatically select:
 * - chatLocalDB.native.ts for iOS/Android
 * - chatLocalDB.web.ts for web
 *
 * This file provides fallback and type definitions.
 */

// Platform-specific implementation will be loaded by Metro bundler
// This file just provides types and fallback for direct imports

// Default export for backward compatibility
export { default } from "./chatLocalDB.native";

// Type exports from native implementation
export type { LocalConversation, LocalMessage } from "./chatLocalDB.native";

// Re-export based on platform - matching native exports
export { bulkInsertMessages, cleanupTypingIndicators, clearAllData, deleteMessage, getConversation, getConversations, getDB, getMessages, getMessagesSinceSeq, getPendingMessages, getTotalUnreadCount, getUnreadCountByConversation, getWatermarks, initChatDB, markConversationRead, markMessageSynced, searchMessages, updateMessageStatus, updateUnreadCount, upsertConversation, upsertMessage } from "./chatLocalDB.native";

