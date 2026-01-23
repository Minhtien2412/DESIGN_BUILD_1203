/**
 * Conversations API Service
 * ==========================
 *
 * Service kết nối với BE API cho messaging:
 * - Conversations: Tạo, lấy danh sách, cập nhật
 * - Messages: Gửi, nhận, sửa, xóa, reaction
 * - Read receipts & typing indicators
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { del, get, patch, post } from "../api";

// ============================================================================
// Types - Conversations
// ============================================================================

export type ConversationType = "DIRECT" | "GROUP";
export type ParticipantRole = "OWNER" | "ADMIN" | "MEMBER";
export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "FILE"
  | "VIDEO"
  | "VOICE"
  | "SYSTEM";
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: number;
  role: ParticipantRole;
  lastReadMessageId?: string;
  lastReadAt?: string;
  lastReadSeq: number;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  nickname?: string;
  joinedAt: string;
  leftAt?: string;
  removedAt?: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  description?: string;
  avatarUrl?: string;
  directKey?: string;
  lastMessageId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isArchived: boolean;
  version: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
  seq: number;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  attachments?: MessageAttachment[];
  clientMessageId?: string;
  replyToMessageId?: string;
  replyToMessage?: Message;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: number;
  forwardedFromId?: string;
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: number;
  mentionedUserIds: number[];
  metadata?: Record<string, any>;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  type: "image" | "video" | "file" | "audio";
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: number;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface CreateDirectConversationDto {
  targetUserId: number;
}

export interface CreateGroupConversationDto {
  title: string;
  description?: string;
  participantIds: number[];
  avatarUrl?: string;
}

export interface GetConversationsQueryDto {
  cursor?: string;
  limit?: number;
  type?: ConversationType;
  search?: string;
  archived?: boolean;
}

export interface SendMessageDto {
  clientMessageId: string;
  type?: MessageType;
  content?: string;
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
  mentionedUserIds?: number[];
  metadata?: Record<string, any>;
}

export interface GetMessagesQueryDto {
  cursor?: string;
  direction?: "before" | "after";
  limit?: number;
  aroundSeq?: number;
}

export interface UpdateMessageDto {
  content: string;
}

export interface AddParticipantsDto {
  userIds: number[];
}

export interface MarkReadDto {
  messageId?: string;
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessageListResponse {
  items: Message[];
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
  oldestSeq?: number;
  newestSeq?: number;
}

export interface MarkReadResponse {
  success: boolean;
  readCount: number;
  lastReadSeq: number;
}

// ============================================================================
// Conversations API
// ============================================================================

/**
 * Tạo hoặc lấy conversation 1-1
 */
export async function createOrGetDirectConversation(
  targetUserId: number,
): Promise<Conversation> {
  return post<Conversation>("/conversations/direct", { targetUserId });
}

/**
 * Tạo conversation nhóm
 */
export async function createGroupConversation(
  dto: CreateGroupConversationDto,
): Promise<Conversation> {
  return post<Conversation>("/conversations/group", dto);
}

/**
 * Lấy danh sách conversations
 */
export async function getConversations(
  query?: GetConversationsQueryDto,
): Promise<ConversationListResponse> {
  const params = new URLSearchParams();
  if (query?.cursor) params.append("cursor", query.cursor);
  if (query?.limit) params.append("limit", String(query.limit));
  if (query?.type) params.append("type", query.type);
  if (query?.search) params.append("search", query.search);
  if (query?.archived !== undefined)
    params.append("archived", String(query.archived));

  const queryString = params.toString();
  return get<ConversationListResponse>(
    `/conversations${queryString ? `?${queryString}` : ""}`,
  );
}

/**
 * Lấy chi tiết conversation
 */
export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  return get<Conversation>(`/conversations/${conversationId}`);
}

/**
 * Thêm thành viên vào nhóm
 */
export async function addParticipants(
  conversationId: string,
  userIds: number[],
): Promise<void> {
  return post(`/conversations/${conversationId}/participants`, { userIds });
}

/**
 * Xóa thành viên khỏi nhóm
 */
export async function removeParticipant(
  conversationId: string,
  userId: number,
): Promise<void> {
  return del(`/conversations/${conversationId}/participants/${userId}`);
}

/**
 * Rời khỏi nhóm
 */
export async function leaveConversation(conversationId: string): Promise<void> {
  return post(`/conversations/${conversationId}/leave`, {});
}

/**
 * Đánh dấu đã đọc
 */
export async function markAsRead(
  conversationId: string,
  messageId?: string,
): Promise<MarkReadResponse> {
  return post<MarkReadResponse>(`/conversations/${conversationId}/read`, {
    messageId,
  });
}

// ============================================================================
// Messages API
// ============================================================================

/**
 * Gửi tin nhắn
 */
export async function sendMessage(
  conversationId: string,
  dto: SendMessageDto,
): Promise<Message> {
  return post<Message>(`/conversations/${conversationId}/messages`, dto);
}

/**
 * Lấy danh sách tin nhắn với cursor pagination
 */
export async function getMessages(
  conversationId: string,
  query?: GetMessagesQueryDto,
): Promise<MessageListResponse> {
  const params = new URLSearchParams();
  if (query?.cursor) params.append("cursor", query.cursor);
  if (query?.direction) params.append("direction", query.direction);
  if (query?.limit) params.append("limit", String(query.limit));
  if (query?.aroundSeq) params.append("aroundSeq", String(query.aroundSeq));

  const queryString = params.toString();
  return get<MessageListResponse>(
    `/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ""}`,
  );
}

/**
 * Lấy tin nhắn cụ thể
 */
export async function getMessage(
  conversationId: string,
  messageId: string,
): Promise<Message> {
  return get<Message>(`/conversations/${conversationId}/messages/${messageId}`);
}

/**
 * Sửa tin nhắn
 */
export async function updateMessage(
  conversationId: string,
  messageId: string,
  content: string,
): Promise<Message> {
  return patch<Message>(
    `/conversations/${conversationId}/messages/${messageId}`,
    { content },
  );
}

/**
 * Xóa tin nhắn
 */
export async function deleteMessage(
  conversationId: string,
  messageId: string,
  forEveryone?: boolean,
): Promise<void> {
  const params = forEveryone ? "?forEveryone=true" : "";
  return del(`/conversations/${conversationId}/messages/${messageId}${params}`);
}

/**
 * Thêm reaction
 */
export async function addReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  return post(
    `/conversations/${conversationId}/messages/${messageId}/reactions`,
    { emoji },
  );
}

/**
 * Xóa reaction
 */
export async function removeReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  return del(
    `/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
  );
}

/**
 * Tìm kiếm tin nhắn
 */
export async function searchMessages(
  conversationId: string,
  query: string,
  limit?: number,
): Promise<Message[]> {
  const params = new URLSearchParams({ q: query });
  if (limit) params.append("limit", String(limit));
  return get<Message[]>(
    `/conversations/${conversationId}/messages/search?${params.toString()}`,
  );
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Generate unique client message ID for idempotency
 */
export function generateClientMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format conversation display name
 */
export function getConversationDisplayName(
  conversation: Conversation,
  currentUserId: number,
): string {
  if (conversation.type === "GROUP") {
    return conversation.title || "Nhóm không tên";
  }

  // For DIRECT, find the other participant
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId,
  );

  return (
    otherParticipant?.user?.name || otherParticipant?.nickname || "Người dùng"
  );
}

/**
 * Get conversation avatar URL
 */
export function getConversationAvatar(
  conversation: Conversation,
  currentUserId: number,
): string | undefined {
  if (conversation.type === "GROUP") {
    return conversation.avatarUrl;
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId,
  );

  return otherParticipant?.user?.avatar;
}

/**
 * Get message preview text
 */
export function getMessagePreview(message: Message): string {
  if (message.isDeleted) {
    return "Tin nhắn đã bị xóa";
  }

  switch (message.type) {
    case "IMAGE":
      return "📷 Hình ảnh";
    case "VIDEO":
      return "🎥 Video";
    case "FILE":
      return "📎 Tệp đính kèm";
    case "VOICE":
      return "🎤 Tin nhắn thoại";
    case "SYSTEM":
      return message.content;
    default:
      return message.content || "";
  }
}

/**
 * Check if user can edit message
 */
export function canEditMessage(
  message: Message,
  currentUserId: number,
): boolean {
  if (message.isDeleted) return false;
  if (message.senderId !== currentUserId) return false;
  if (message.type !== "TEXT") return false;

  // Allow edit within 15 minutes
  const createdAt = new Date(message.createdAt).getTime();
  const fifteenMinutes = 15 * 60 * 1000;
  return Date.now() - createdAt < fifteenMinutes;
}

/**
 * Check if user can delete message
 */
export function canDeleteMessage(
  message: Message,
  currentUserId: number,
  isAdmin: boolean,
): boolean {
  if (message.isDeleted) return false;
  return message.senderId === currentUserId || isAdmin;
}

// ============================================================================
// Export service object for convenience
// ============================================================================

export const conversationsService = {
  // Conversations
  createOrGetDirect: createOrGetDirectConversation,
  createGroup: createGroupConversation,
  getConversations,
  getConversation,
  addParticipants,
  removeParticipant,
  leave: leaveConversation,
  markAsRead,

  // Messages
  sendMessage,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  searchMessages,

  // Helpers
  generateClientMessageId,
  getDisplayName: getConversationDisplayName,
  getAvatar: getConversationAvatar,
  getPreview: getMessagePreview,
  canEdit: canEditMessage,
  canDelete: canDeleteMessage,
};

export default conversationsService;
