/**
 * Message Service
 * Handles all message-related API calls and business logic
 */

import { apiFetch } from './api';

export interface SendMessageParams {
  recipientId: number;
  content: string;
  type?: 'text' | 'image' | 'video' | 'file' | 'voice' | 'system';
  mediaUrl?: string;
}

export interface FetchMessagesParams {
  conversationId?: number;
  otherUserId?: number;
  limit?: number;
  offset?: number;
  before?: string; // ISO date string for pagination
  after?: string;
}

export interface MarkAsReadParams {
  conversationId?: number;
  messageIds?: number[];
}

class MessageService {
  /**
   * Fetch conversation list
   */
  async getConversations(limit = 50, offset = 0) {
    try {
      const response = await apiFetch(`/messages/conversations?limit=${limit}&offset=${offset}`);
      return {
        conversations: response.conversations || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[MessageService] Failed to fetch conversations:', error);
      throw error;
    }
  }

  /**
   * Fetch messages in a conversation
   */
  async getMessages(params: FetchMessagesParams) {
    try {
      const { conversationId, otherUserId, limit = 50, offset = 0, before, after } = params;
      
      let url = '';
      if (conversationId) {
        url = `/messages/conversation/${conversationId}?limit=${limit}&offset=${offset}`;
      } else if (otherUserId) {
        url = `/messages/${otherUserId}?limit=${limit}&offset=${offset}`;
      } else {
        throw new Error('Either conversationId or otherUserId is required');
      }

      if (before) url += `&before=${before}`;
      if (after) url += `&after=${after}`;

      const response = await apiFetch(url);
      return {
        messages: response.messages || [],
        otherUser: response.otherUser,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[MessageService] Failed to fetch messages:', error);
      throw error;
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(params: SendMessageParams) {
    try {
      const response = await apiFetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: params.recipientId,
          content: params.content,
          type: params.type || 'text',
          mediaUrl: params.mediaUrl,
        }),
      });

      return response.message;
    } catch (error) {
      console.error('[MessageService] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(params: MarkAsReadParams) {
    try {
      const { conversationId, messageIds } = params;
      
      if (conversationId) {
        await apiFetch(`/messages/conversation/${conversationId}/read`, {
          method: 'POST',
        });
      } else if (messageIds && messageIds.length > 0) {
        await apiFetch('/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds }),
        });
      }
    } catch (error) {
      console.error('[MessageService] Failed to mark messages as read:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: number) {
    try {
      await apiFetch(`/messages/${messageId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('[MessageService] Failed to delete message:', error);
      throw error;
    }
  }

  /**
   * Upload media for message
   */
  async uploadMedia(file: File | Blob, type: 'image' | 'video' | 'file') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiFetch('/messages/upload', {
        method: 'POST',
        body: formData,
      });

      return response.url;
    } catch (error) {
      console.error('[MessageService] Failed to upload media:', error);
      throw error;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, limit = 20) {
    try {
      const response = await apiFetch(`/messages/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return {
        results: response.results || [],
        total: response.total || 0,
      };
    } catch (error) {
      console.error('[MessageService] Failed to search messages:', error);
      throw error;
    }
  }

  /**
   * Get message statistics
   */
  async getStats() {
    try {
      const response = await apiFetch('/messages/stats');
      return {
        totalConversations: response.totalConversations || 0,
        totalMessages: response.totalMessages || 0,
        unreadCount: response.unreadCount || 0,
      };
    } catch (error) {
      console.error('[MessageService] Failed to get message stats:', error);
      throw error;
    }
  }

  /**
   * Upload voice message
   */
  async uploadVoiceMessage(audioUri: string, duration: number) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: `voice_${Date.now()}.m4a`,
      } as any);
      formData.append('duration', duration.toString());

      const response = await apiFetch('/messages/upload/voice', {
        method: 'POST',
        body: formData,
      });

      return response.url;
    } catch (error) {
      console.error('[MessageService] Failed to upload voice message:', error);
      throw error;
    }
  }

  /**
   * Upload file attachment
   */
  async uploadFile(file: { uri: string; name: string; mimeType?: string; size: number }) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name,
      } as any);

      const response = await apiFetch('/messages/upload/file', {
        method: 'POST',
        body: formData,
      });

      return {
        url: response.url,
        name: file.name,
        size: file.size,
      };
    } catch (error) {
      console.error('[MessageService] Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: number, emoji: string) {
    try {
      await apiFetch(`/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });
    } catch (error) {
      console.error('[MessageService] Failed to add reaction:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: number, emoji: string) {
    try {
      await apiFetch(`/messages/${messageId}/reactions`, {
        method: 'DELETE',
        body: JSON.stringify({ emoji }),
      });
    } catch (error) {
      console.error('[MessageService] Failed to remove reaction:', error);
      throw error;
    }
  }

  /**
   * Get reactions for a message
   */
  async getMessageReactions(messageId: number) {
    try {
      const response = await apiFetch(`/messages/${messageId}/reactions`);
      return response.reactions || [];
    } catch (error) {
      console.error('[MessageService] Failed to get reactions:', error);
      return [];
    }
  }
}

export const messageService = new MessageService();
