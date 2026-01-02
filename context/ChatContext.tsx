import socketManager, { ChatMessage as SocketChatMessage } from '@/services/socket';
import { getItem, setItem } from '@/utils/storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
  attachment?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, text: string, receiverId: string) => void;
  markAsRead: (conversationId: string) => void;
  getOrCreateConversation: (participantId: string, participantName: string, participantAvatar?: string) => Conversation;
  totalUnread: number;
  // Real-time features
  connected: boolean;
  typingUsers: Record<string, string[]>; // conversationId → array of user names
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CONVERSATIONS_KEY = 'chat_conversations';
const MESSAGES_KEY = 'chat_messages';

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { connected } = useWebSocket();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [convData, msgData] = await Promise.all([
          getItem(CONVERSATIONS_KEY),
          getItem(MESSAGES_KEY),
        ]);
        if (convData) setConversations(JSON.parse(convData));
        if (msgData) setMessages(JSON.parse(msgData));
      } catch (error) {
        console.error('Failed to load chat data:', error);
      } finally {
        setLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (loaded) {
      setItem(CONVERSATIONS_KEY, JSON.stringify(conversations)).catch(console.error);
      setItem(MESSAGES_KEY, JSON.stringify(messages)).catch(console.error);
    }
  }, [conversations, messages, loaded]);

  const getOrCreateConversation = (
    participantId: string,
    participantName: string,
    participantAvatar?: string
  ): Conversation => {
    let conversation = conversations.find(c => c.participantId === participantId);
    
    if (!conversation) {
      conversation = {
        id: `conv_${Date.now()}`,
        participantId,
        participantName,
        participantAvatar,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setConversations(prev => [conversation!, ...prev]);
    }
    
    return conversation;
  };

  const sendMessage = useCallback((conversationId: string, text: string, receiverId: string) => {
    const message: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: user?.id?.toString() || 'current-user',
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    // Add to local state immediately (optimistic UI)
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message],
    }));

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: message, updatedAt: message.timestamp }
          : conv
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    );

    // Send via WebSocket if connected
    if (connected) {
      try {
        // Map conversationId to projectId (assuming they match)
        // In a real app, you'd fetch this from conversation metadata
        socketManager.sendMessage(conversationId, text, 'text');
        console.log('[ChatContext] Message sent via WebSocket');
      } catch (error) {
        console.error('[ChatContext] Failed to send via WebSocket:', error);
      }
    } else {
      console.warn('[ChatContext] WebSocket not connected, message saved locally only');
    }
  }, [connected, user]);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );

    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(msg => ({ ...msg, read: true })),
    }));
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    if (connected) {
      socketManager.startTyping(conversationId);
    }
  }, [connected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (connected) {
      socketManager.stopTyping(conversationId);
    }
  }, [connected]);

  // Listen for real-time messages
  useEffect(() => {
    if (!connected) return;

    const handleNewMessage = (socketMessage: SocketChatMessage) => {
      console.log('[ChatContext] Received message via WebSocket:', socketMessage);

      // Convert SocketChatMessage to local Message format
      const message: Message = {
        id: socketMessage.id,
        conversationId: socketMessage.projectId, // Map projectId to conversationId
        senderId: socketMessage.userId?.toString() || 'current-user',
        receiverId: 'current-user', // Backend should provide this
        text: socketMessage.content,
        timestamp: socketMessage.createdAt,
        read: false,
        type: socketMessage.type,
      };

      // Add to messages
      setMessages(prev => {
        const existing = prev[message.conversationId] || [];
        // Prevent duplicates
        if (existing.some(m => m.id === message.id)) {
          return prev;
        }
        return {
          ...prev,
          [message.conversationId]: [...existing, message],
        };
      });

      // Update conversation
      setConversations(prev =>
        prev.map(conv =>
          conv.id === message.conversationId
            ? { 
                ...conv, 
                lastMessage: message, 
                updatedAt: message.timestamp,
                unreadCount: conv.unreadCount + 1,
              }
            : conv
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    socketManager.onNewMessage(handleNewMessage);

    return () => {
      socketManager.offNewMessage(handleNewMessage);
    };
  }, [connected]);

  // Listen for typing indicators
  useEffect(() => {
    if (!connected) return;

    const handleTyping = (data: any) => {
      const conversationId = data.projectId;
      const userName = data.fullName;

      setTypingUsers(prev => {
        const existing = prev[conversationId] || [];
        if (existing.includes(userName)) {
          return prev;
        }
        return {
          ...prev,
          [conversationId]: [...existing, userName],
        };
      });

      // Remove after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).filter(name => name !== userName),
        }));
      }, 3000);
    };

    socketManager.onTyping(handleTyping);

    return () => {
      socketManager.offTyping(handleTyping);
    };
  }, [connected]);

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        sendMessage,
        markAsRead,
        getOrCreateConversation,
        totalUnread,
        connected,
        typingUsers,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
