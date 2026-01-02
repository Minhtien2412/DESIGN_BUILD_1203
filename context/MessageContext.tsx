/**
 * Message Context
 * Manages messages state, offline storage, and WebSocket real-time updates
 */

import { pushNotificationService } from '@/services/push-notification.service';
import { messageSocket } from '@/services/websocket/message-socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  recipientId: number;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'voice' | 'system';
  mediaUrl?: string | null;
  fileName?: string;
  fileSize?: number;
  duration?: number; // For voice messages (in seconds)
  sentAt: string;
  isFromMe: boolean;
  isRead: boolean;
  readAt?: string | null;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  reactions?: Array<{ emoji: string; userId: number; userName: string }>;
}

export interface Conversation {
  id: number;
  otherUser: {
    id: number;
    name: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: string | null;
  };
  lastMessage?: {
    content: string;
    type: string;
    sentAt: string;
    isFromMe: boolean;
    isRead: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

interface MessageContextType {
  // Conversations
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (conversationId: number, updates: Partial<Conversation>) => void;
  
  // Messages
  getMessages: (conversationId: number) => Message[];
  addMessage: (conversationId: number, message: Message) => void;
  updateMessage: (messageId: number, updates: Partial<Message>) => void;
  deleteMessage: (messageId: number) => void;
  
  // Unread
  totalUnreadCount: number;
  markAsRead: (conversationId: number) => void;
  
  // Offline support
  syncMessages: () => Promise<void>;
  clearAllMessages: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONVERSATIONS: '@messages/conversations',
  MESSAGES_PREFIX: '@messages/conversation_',
};

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, Message[]>>({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Load conversations from storage on mount
  useEffect(() => {
    loadConversationsFromStorage();
  }, []);

  // Update total unread count when conversations change
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    setTotalUnreadCount(total);
    // Update badge count
    pushNotificationService.setBadgeCount(total);
  }, [conversations]);

  // Save conversations to storage whenever they change
  useEffect(() => {
    saveConversationsToStorage();
  }, [conversations]);

  // Initialize WebSocket and Push Notifications
  useEffect(() => {
    // Skip WebSocket on web platform
    if (Platform.OS === 'web') {
      console.log('[MessageContext] WebSocket disabled on web platform');
      return;
    }

    console.log('[MessageContext] Initializing WebSocket and Push Notifications...');
    
    // Connect WebSocket
    messageSocket.connect();

    // Initialize push notifications
    pushNotificationService.initialize();

    // Subscribe to WebSocket events
    const unsubscribeNewMessage = messageSocket.on('message:new', (data) => {
      console.log('[MessageContext] New message via WebSocket:', data);
      addMessage(data.conversationId, data.message);
    });

    const unsubscribeMessageRead = messageSocket.on('message:read', (data) => {
      console.log('[MessageContext] Message read via WebSocket:', data);
      if (data.messageIds && data.messageIds.length > 0) {
        data.messageIds.forEach((msgId: number) => {
          updateMessage(msgId, { isRead: true, readAt: new Date().toISOString() });
        });
      }
    });

    const unsubscribeMessageDeleted = messageSocket.on('message:deleted', (data) => {
      console.log('[MessageContext] Message deleted via WebSocket:', data);
      deleteMessage(data.messageId);
    });

    const unsubscribeReaction = messageSocket.on('message:reaction', (data) => {
      console.log('[MessageContext] Reaction update via WebSocket:', data);
      // Update message reactions
      updateMessage(data.messageId, { reactions: data.reactions });
    });

    // Cleanup on unmount
    return () => {
      console.log('[MessageContext] Cleaning up WebSocket and Push Notifications...');
      unsubscribeNewMessage();
      unsubscribeMessageRead();
      unsubscribeMessageDeleted();
      unsubscribeReaction();
      messageSocket.disconnect();
      pushNotificationService.cleanup();
    };
  }, []);

  const loadConversationsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      }
    } catch (error) {
      console.error('Failed to load conversations from storage:', error);
    }
  };

  const saveConversationsToStorage = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations to storage:', error);
    }
  };

  const loadMessagesFromStorage = async (conversationId: number): Promise<Message[]> => {
    try {
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${conversationId}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error(`Failed to load messages for conversation ${conversationId}:`, error);
    }
    return [];
  };

  const saveMessagesToStorage = async (conversationId: number, messages: Message[]) => {
    try {
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${conversationId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error(`Failed to save messages for conversation ${conversationId}:`, error);
    }
  };

  const updateConversation = useCallback((conversationId: number, updates: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, ...updates } : conv
      )
    );
  }, []);

  const getMessages = useCallback((conversationId: number): Message[] => {
    if (messagesByConversation[conversationId]) {
      return messagesByConversation[conversationId];
    }
    
    // Load from storage if not in memory
    loadMessagesFromStorage(conversationId).then(messages => {
      if (messages.length > 0) {
        setMessagesByConversation(prev => ({
          ...prev,
          [conversationId]: messages,
        }));
      }
    });
    
    return [];
  }, [messagesByConversation]);

  const addMessage = useCallback((conversationId: number, message: Message) => {
    setMessagesByConversation(prev => {
      const conversationMessages = prev[conversationId] || [];
      const newMessages = [...conversationMessages, message];
      
      // Save to storage
      saveMessagesToStorage(conversationId, newMessages);
      
      // Update conversation's last message
      updateConversation(conversationId, {
        lastMessage: message,
        updatedAt: message.sentAt,
      });
      
      return {
        ...prev,
        [conversationId]: newMessages,
      };
    });
  }, [updateConversation]);

  const updateMessage = useCallback((messageId: number, updates: Partial<Message>) => {
    setMessagesByConversation(prev => {
      const newState = { ...prev };
      
      // Find and update message in all conversations
      Object.keys(newState).forEach(convIdStr => {
        const convId = parseInt(convIdStr);
        const messages = newState[convId];
        const messageIndex = messages.findIndex(m => m.id === messageId);
        
        if (messageIndex !== -1) {
          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            ...updates,
          };
          newState[convId] = updatedMessages;
          
          // Save to storage
          saveMessagesToStorage(convId, updatedMessages);
          
          // Update conversation's last message if this was the last message
          if (messageIndex === messages.length - 1) {
            updateConversation(convId, {
              lastMessage: updatedMessages[messageIndex],
            });
          }
        }
      });
      
      return newState;
    });
  }, [updateConversation]);

  const deleteMessage = useCallback((messageId: number) => {
    setMessagesByConversation(prev => {
      const newState = { ...prev };
      
      Object.keys(newState).forEach(convIdStr => {
        const convId = parseInt(convIdStr);
        const messages = newState[convId];
        const updatedMessages = messages.filter(m => m.id !== messageId);
        
        if (updatedMessages.length !== messages.length) {
          newState[convId] = updatedMessages;
          saveMessagesToStorage(convId, updatedMessages);
          
          // Update last message if we deleted the last message
          if (messages[messages.length - 1]?.id === messageId) {
            const newLastMessage = updatedMessages[updatedMessages.length - 1];
            updateConversation(convId, {
              lastMessage: newLastMessage,
            });
          }
        }
      });
      
      return newState;
    });
  }, [updateConversation]);

  const markAsRead = useCallback((conversationId: number) => {
    // Mark all messages in conversation as read
    setMessagesByConversation(prev => {
      const messages = prev[conversationId];
      if (!messages) return prev;
      
      const updatedMessages = messages.map(msg => 
        msg.isFromMe ? msg : { ...msg, isRead: true, readAt: new Date().toISOString() }
      );
      
      saveMessagesToStorage(conversationId, updatedMessages);
      
      return {
        ...prev,
        [conversationId]: updatedMessages,
      };
    });
    
    // Update conversation unread count
    updateConversation(conversationId, { unreadCount: 0 });
  }, [updateConversation]);

  const syncMessages = useCallback(async () => {
    // TODO: Implement sync with backend
    console.log('Syncing messages with backend...');
  }, []);

  const clearAllMessages = useCallback(async () => {
    try {
      // Clear all message storage
      const keys = await AsyncStorage.getAllKeys();
      const messageKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.MESSAGES_PREFIX));
      await AsyncStorage.multiRemove([...messageKeys, STORAGE_KEYS.CONVERSATIONS]);
      
      setConversations([]);
      setMessagesByConversation({});
      setTotalUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear messages:', error);
    }
  }, []);

  const value: MessageContextType = {
    conversations,
    setConversations,
    updateConversation,
    getMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    totalUnreadCount,
    markAsRead,
    syncMessages,
    clearAllMessages,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
