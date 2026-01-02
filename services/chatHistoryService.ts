/**
 * Chat History Service - Store and retrieve AI chat conversations
 * Uses AsyncStorage for persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from './aiService';

const STORAGE_KEY = '@ai_chat_history';
const MAX_CONVERSATIONS = 50; // Maximum number of conversations to store
const MAX_MESSAGES_PER_CONVERSATION = 100; // Maximum messages per conversation

export interface ChatConversation {
  id: string;
  projectId: number;
  projectName?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

class ChatHistoryService {
  /**
   * Get all conversations
   */
  async getAllConversations(): Promise<ChatConversation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const conversations: ChatConversation[] = JSON.parse(data);
      // Sort by updated date (most recent first)
      return conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Get conversations for specific project
   */
  async getConversationsByProject(projectId: number): Promise<ChatConversation[]> {
    const allConversations = await this.getAllConversations();
    return allConversations.filter((conv) => conv.projectId === projectId);
  }

  /**
   * Get specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<ChatConversation | null> {
    const conversations = await this.getAllConversations();
    return conversations.find((conv) => conv.id === conversationId) || null;
  }

  /**
   * Create new conversation
   */
  async createConversation(
    projectId: number,
    projectName?: string,
    initialMessage?: ChatMessage
  ): Promise<ChatConversation> {
    const conversations = await this.getAllConversations();

    const newConversation: ChatConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      projectName,
      title: this.generateTitle(initialMessage),
      messages: initialMessage ? [initialMessage] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: initialMessage ? 1 : 0,
    };

    conversations.unshift(newConversation);

    // Limit total conversations
    if (conversations.length > MAX_CONVERSATIONS) {
      conversations.splice(MAX_CONVERSATIONS);
    }

    await this.saveConversations(conversations);
    return newConversation;
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    message: ChatMessage
  ): Promise<ChatConversation | null> {
    const conversations = await this.getAllConversations();
    const conversationIndex = conversations.findIndex((c) => c.id === conversationId);

    if (conversationIndex === -1) {
      console.error('Conversation not found:', conversationId);
      return null;
    }

    const conversation = conversations[conversationIndex];
    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();
    conversation.messageCount = conversation.messages.length;

    // Update title if it's the first user message
    if (conversation.messages.length === 1 && message.role === 'user') {
      conversation.title = this.generateTitle(message);
    }

    // Limit messages per conversation
    if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
      conversation.messages.splice(0, conversation.messages.length - MAX_MESSAGES_PER_CONVERSATION);
    }

    conversations[conversationIndex] = conversation;
    await this.saveConversations(conversations);

    return conversation;
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<boolean> {
    const conversations = await this.getAllConversations();
    const conversationIndex = conversations.findIndex((c) => c.id === conversationId);

    if (conversationIndex === -1) {
      return false;
    }

    conversations[conversationIndex].title = title;
    conversations[conversationIndex].updatedAt = new Date().toISOString();
    await this.saveConversations(conversations);

    return true;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const conversations = await this.getAllConversations();
    const filteredConversations = conversations.filter((c) => c.id !== conversationId);

    if (filteredConversations.length === conversations.length) {
      return false; // Conversation not found
    }

    await this.saveConversations(filteredConversations);
    return true;
  }

  /**
   * Clear all conversations
   */
  async clearAllConversations(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing conversations:', error);
      return false;
    }
  }

  /**
   * Search conversations by keyword
   */
  async searchConversations(keyword: string): Promise<ChatConversation[]> {
    const conversations = await this.getAllConversations();
    const lowerKeyword = keyword.toLowerCase();

    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(lowerKeyword) ||
        conv.projectName?.toLowerCase().includes(lowerKeyword) ||
        conv.messages.some((msg) => msg.content.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * Get conversation statistics
   */
  async getStatistics(): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    oldestConversation?: string;
    newestConversation?: string;
  }> {
    const conversations = await this.getAllConversations();
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);

    return {
      totalConversations: conversations.length,
      totalMessages,
      averageMessagesPerConversation:
        conversations.length > 0 ? totalMessages / conversations.length : 0,
      oldestConversation: conversations[conversations.length - 1]?.createdAt,
      newestConversation: conversations[0]?.createdAt,
    };
  }

  /**
   * Export conversation to JSON
   */
  async exportConversation(conversationId: string): Promise<string | null> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return null;

    return JSON.stringify(conversation, null, 2);
  }

  /**
   * Import conversation from JSON
   */
  async importConversation(jsonData: string): Promise<ChatConversation | null> {
    try {
      const conversation: ChatConversation = JSON.parse(jsonData);

      // Validate structure
      if (!conversation.id || !conversation.projectId || !Array.isArray(conversation.messages)) {
        throw new Error('Invalid conversation format');
      }

      const conversations = await this.getAllConversations();

      // Check for duplicate ID
      const existingIndex = conversations.findIndex((c) => c.id === conversation.id);
      if (existingIndex !== -1) {
        // Update existing
        conversations[existingIndex] = conversation;
      } else {
        // Add new
        conversations.unshift(conversation);
      }

      await this.saveConversations(conversations);
      return conversation;
    } catch (error) {
      console.error('Error importing conversation:', error);
      return null;
    }
  }

  /**
   * Private: Save conversations to storage
   */
  private async saveConversations(conversations: ChatConversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
      throw error;
    }
  }

  /**
   * Private: Generate conversation title from message
   */
  private generateTitle(message?: ChatMessage): string {
    if (!message || !message.content) {
      return `Trò chuyện ${new Date().toLocaleDateString('vi-VN')}`;
    }

    // Extract first line or first 50 characters
    const firstLine = message.content.split('\n')[0];
    const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;

    return title || `Trò chuyện ${new Date().toLocaleDateString('vi-VN')}`;
  }
}

export const chatHistoryService = new ChatHistoryService();
