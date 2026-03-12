/**
 * useConversationsSocket Hook
 * ============================
 *
 * React hook cho realtime messaging via WebSocket
 *
 * Features:
 * - Auto connect/disconnect với auth
 * - Join/leave conversation rooms
 * - Receive realtime messages
 * - Typing indicators
 * - Presence tracking
 * - Reconnect handling
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useAuth } from "@/context/AuthContext";
import {
    conversationsSocket,
    MessageDeletedEvent,
    MessageUpdatedEvent,
    NewMessageEvent,
    PresenceEvent,
    ReadReceiptEvent,
    TypingEvent,
} from "@/services/conversations-socket.service";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface OnlineUser {
  userId: number;
  isOnline: boolean;
  lastSeen?: string;
}

export interface TypingUser {
  conversationId: string;
  userId: number;
  isTyping: boolean;
  timestamp: number;
}

export interface UseConversationsSocketState {
  /** Socket connected status */
  isConnected: boolean;
  /** Connecting in progress */
  isConnecting: boolean;
  /** Connection error */
  connectionError: string | null;
  /** Online users map */
  onlineUsers: Map<number, OnlineUser>;
  /** Typing users per conversation */
  typingUsers: Map<string, TypingUser[]>;
}

export interface UseConversationsSocketCallbacks {
  /** New message received */
  onNewMessage?: (event: NewMessageEvent) => void;
  /** Message updated */
  onMessageUpdated?: (event: MessageUpdatedEvent) => void;
  /** Message deleted */
  onMessageDeleted?: (event: MessageDeletedEvent) => void;
  /** Read receipt received */
  onReadReceipt?: (event: ReadReceiptEvent) => void;
  /** Typing indicator */
  onTyping?: (event: TypingEvent) => void;
  /** Presence update */
  onPresence?: (event: PresenceEvent) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useConversationsSocket(
  callbacks?: UseConversationsSocketCallbacks,
): UseConversationsSocketState & {
  connect: () => Promise<void>;
  disconnect: () => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string, messageId?: string) => void;
  isUserOnline: (userId: number) => boolean;
  getTypingUsersInConversation: (conversationId: string) => number[];
} {
  const { user, isAuthenticated } = useAuth();

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Map<number, OnlineUser>>(
    new Map(),
  );
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser[]>>(
    new Map(),
  );

  // Refs for callbacks (to avoid stale closures)
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Track active conversations
  const activeConversationsRef = useRef<Set<string>>(new Set());

  // ============================================
  // Connect
  // ============================================

  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("[useConversationsSocket] Not authenticated, skip connect");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await conversationsSocket.connect();
      setIsConnected(true);
      console.log("[useConversationsSocket] Connected");

      // Rejoin active conversations
      for (const convId of activeConversationsRef.current) {
        conversationsSocket.joinConversation(convId);
      }
    } catch (error: any) {
      console.error("[useConversationsSocket] Connection failed:", error);
      setConnectionError(error.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [isAuthenticated, user]);

  // ============================================
  // Disconnect
  // ============================================

  const disconnect = useCallback(() => {
    conversationsSocket.disconnect();
    setIsConnected(false);
    setOnlineUsers(new Map());
    setTypingUsers(new Map());
    activeConversationsRef.current.clear();
  }, []);

  // ============================================
  // Room Management
  // ============================================

  const joinConversation = useCallback((conversationId: string) => {
    activeConversationsRef.current.add(conversationId);
    conversationsSocket.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    activeConversationsRef.current.delete(conversationId);
    conversationsSocket.leaveConversation(conversationId);
  }, []);

  // ============================================
  // Actions
  // ============================================

  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      conversationsSocket.sendTyping(conversationId, isTyping);
    },
    [],
  );

  const markAsRead = useCallback(
    (conversationId: string, messageId?: string) => {
      conversationsSocket.markAsRead(conversationId, messageId);
    },
    [],
  );

  // ============================================
  // Helpers
  // ============================================

  const isUserOnline = useCallback(
    (userId: number): boolean => {
      return onlineUsers.get(userId)?.isOnline || false;
    },
    [onlineUsers],
  );

  const getTypingUsersInConversation = useCallback(
    (conversationId: string): number[] => {
      const users = typingUsers.get(conversationId) || [];
      // Filter out stale typing (> 5 seconds)
      const now = Date.now();
      return users
        .filter((u) => u.isTyping && now - u.timestamp < 5000)
        .map((u) => u.userId);
    },
    [typingUsers],
  );

  // ============================================
  // Event Handlers
  // ============================================

  useEffect(() => {
    // Handle new message
    const unsubNewMessage = conversationsSocket.on<NewMessageEvent>(
      "message.new",
      (event) => {
        console.log("[useConversationsSocket] New message:", event.message.id);
        callbacksRef.current?.onNewMessage?.(event);
      },
    );

    // Handle message updated
    const unsubUpdated = conversationsSocket.on<MessageUpdatedEvent>(
      "message.updated",
      (event) => {
        callbacksRef.current?.onMessageUpdated?.(event);
      },
    );

    // Handle message deleted
    const unsubDeleted = conversationsSocket.on<MessageDeletedEvent>(
      "message.deleted",
      (event) => {
        callbacksRef.current?.onMessageDeleted?.(event);
      },
    );

    // Handle read receipt
    const unsubReadReceipt = conversationsSocket.on<ReadReceiptEvent>(
      "read.receipt",
      (event) => {
        callbacksRef.current?.onReadReceipt?.(event);
      },
    );

    // Handle typing
    const unsubTyping = conversationsSocket.on<TypingEvent>(
      "typing",
      (event) => {
        // Update typing state
        setTypingUsers((prev) => {
          const map = new Map(prev);
          const convTyping = map.get(event.conversationId) || [];

          // Find existing or add new
          const existingIdx = convTyping.findIndex(
            (t) => t.userId === event.userId,
          );
          const newTyping: TypingUser = {
            ...event,
            timestamp: Date.now(),
          };

          if (existingIdx >= 0) {
            convTyping[existingIdx] = newTyping;
          } else {
            convTyping.push(newTyping);
          }

          // Remove stopped typing
          const filtered = convTyping.filter((t) => t.isTyping);
          map.set(event.conversationId, filtered);

          return map;
        });

        callbacksRef.current?.onTyping?.(event);
      },
    );

    // Handle presence
    const unsubPresence = conversationsSocket.on<PresenceEvent>(
      "presence",
      (event) => {
        setOnlineUsers((prev) => {
          const map = new Map(prev);
          map.set(event.userId, {
            userId: event.userId,
            isOnline: event.isOnline,
            lastSeen: event.isOnline ? undefined : event.timestamp,
          });
          return map;
        });

        callbacksRef.current?.onPresence?.(event);
      },
    );

    // Handle connect/disconnect events
    const unsubConnect = conversationsSocket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    const unsubDisconnect = conversationsSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      unsubNewMessage();
      unsubUpdated();
      unsubDeleted();
      unsubReadReceipt();
      unsubTyping();
      unsubPresence();
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  // ============================================
  // Auto Connect
  // ============================================

  useEffect(() => {
    if (isAuthenticated && user && !isConnected && !isConnecting) {
      connect();
    }

    if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, user, isConnected, isConnecting, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount - keep connection for other components
    };
  }, []);

  return {
    // State
    isConnected,
    isConnecting,
    connectionError,
    onlineUsers,
    typingUsers,
    // Actions
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendTyping,
    markAsRead,
    isUserOnline,
    getTypingUsersInConversation,
  };
}

export default useConversationsSocket;
