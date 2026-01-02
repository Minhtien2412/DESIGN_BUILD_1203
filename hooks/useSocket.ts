/**
 * useSocket Hook
 * React hook for Socket.IO integration
 * Based on FRONTEND-INTEGRATION-GUIDE.md
 */

import socketManager, { ChatMessage, Notification, ProjectUpdate, TypingIndicator } from '@/services/socket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import io from 'socket.io-client';

// Extract Socket type from io return type
type Socket = ReturnType<typeof io>;

// ============================================================================
// Types
// ============================================================================

export interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export interface UseChatReturn extends UseSocketReturn {
  messages: ChatMessage[];
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => void;
  typingUsers: TypingIndicator[];
  startTyping: () => void;
  stopTyping: () => void;
}

// ============================================================================
// useSocket - Base socket connection hook
// ============================================================================

/**
 * Base hook for socket connection
 */
export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(async () => {
    // Disable socket on web platform
    if (Platform.OS === 'web') {
      console.log('[useSocket] Socket disabled on web platform');
      return;
    }

    try {
      const socketInstance = await socketManager.connect();
      setSocket(socketInstance);
      setConnected(socketManager.isConnected());
    } catch (error) {
      console.error('[useSocket] Connection failed:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setSocket(null);
    setConnected(false);
  }, []);

  useEffect(() => {
    // Skip socket connection on web
    if (Platform.OS === 'web') {
      return;
    }

    // Auto-connect on mount
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    connected,
    connect,
    disconnect,
  };
}

// ============================================================================
// useChat - Chat functionality hook
// ============================================================================

/**
 * Hook for chat functionality in a project
 */
export function useChat(projectId: string): UseChatReturn {
  const { socket, connected, connect, disconnect } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Join chat room when connected
  useEffect(() => {
    if (!connected || !projectId) return;

    socketManager.joinChat(projectId);

    return () => {
      socketManager.leaveChat(projectId);
    };
  }, [connected, projectId]);

  // Listen for new messages
  useEffect(() => {
    if (!connected) return;

    const handleNewMessage = (message: ChatMessage) => {
      if (message.projectId === projectId) {
        setMessages(prev => [...prev, message]);
      }
    };

    socketManager.onNewMessage(handleNewMessage);

    return () => {
      socketManager.offNewMessage(handleNewMessage);
    };
  }, [connected, projectId]);

  // Listen for typing indicators
  useEffect(() => {
    if (!connected) return;

    const handleTyping = (data: TypingIndicator) => {
      if (data.projectId === projectId) {
        setTypingUsers(prev => {
          // Check if user is already typing
          const exists = prev.some(u => u.userId === data.userId);
          if (exists) return prev;
          
          // Add user to typing list
          return [...prev, data];
        });

        // Remove user from typing list after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }, 3000);
      }
    };

    socketManager.onTyping(handleTyping);

    return () => {
      socketManager.offTyping(handleTyping);
    };
  }, [connected, projectId]);

  const sendMessage = useCallback(
    (content: string, type: 'text' | 'image' | 'file' = 'text') => {
      if (!connected) {
        console.warn('[useChat] Cannot send message: not connected');
        return;
      }

      socketManager.sendMessage(projectId, content, type);
    },
    [connected, projectId]
  );

  const startTyping = useCallback(() => {
    if (!connected) return;

    socketManager.startTyping(projectId);

    // Auto-stop typing after 5 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketManager.stopTyping(projectId);
    }, 5000);
  }, [connected, projectId]);

  const stopTyping = useCallback(() => {
    if (!connected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    socketManager.stopTyping(projectId);
  }, [connected, projectId]);

  return {
    socket,
    connected,
    connect,
    disconnect,
    messages,
    sendMessage,
    typingUsers,
    startTyping,
    stopTyping,
  };
}

// ============================================================================
// useNotifications - Notifications hook
// ============================================================================

export interface UseNotificationsReturn extends UseSocketReturn {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Hook for real-time notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const { socket, connected, connect, disconnect } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen for new notifications
  useEffect(() => {
    // Skip on web or if not connected
    if (Platform.OS === 'web' || !connected) return;

    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socketManager.onNotification(handleNotification);

    return () => {
      socketManager.offNotification(handleNotification);
    };
  }, [connected]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    socket,
    connected,
    connect,
    disconnect,
    notifications,
    unreadCount,
  };
}

// ============================================================================
// useProjectUpdates - Project updates hook
// ============================================================================

export interface UseProjectUpdatesReturn extends UseSocketReturn {
  updates: ProjectUpdate[];
}

/**
 * Hook for real-time project updates
 */
export function useProjectUpdates(projectId: string): UseProjectUpdatesReturn {
  const { socket, connected, connect, disconnect } = useSocket();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);

  // Subscribe to project updates
  useEffect(() => {
    if (!connected || !projectId) return;

    socketManager.subscribeToProject(projectId);

    return () => {
      socketManager.unsubscribeFromProject(projectId);
    };
  }, [connected, projectId]);

  // Listen for project updates
  useEffect(() => {
    if (!connected) return;

    const handleUpdate = (update: ProjectUpdate) => {
      if (update.projectId === projectId) {
        setUpdates(prev => [update, ...prev]);
      }
    };

    socketManager.onProjectUpdate(handleUpdate);

    return () => {
      socketManager.offProjectUpdate(handleUpdate);
    };
  }, [connected, projectId]);

  return {
    socket,
    connected,
    connect,
    disconnect,
    updates,
  };
}

// ============================================================================
// Export
// ============================================================================

export default useSocket;
