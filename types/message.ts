/**
 * Message Types
 */

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  recipientId: number;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'voice' | 'system';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // For voice messages (in seconds)
  sentAt: string;
  isFromMe: boolean;
  isRead: boolean;
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  userId: number;
  userName: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage?: {
    content: string;
    sentAt: string;
    isFromMe: boolean;
  };
  unreadCount: number;
  updatedAt: string;
  isPinned?: boolean;
  isMuted?: boolean;
}

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface FileAttachment {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType?: string;
}
