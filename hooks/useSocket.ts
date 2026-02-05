/**
 * useSocket Hook
 * React hook for unified Socket.IO integration
 * @updated 2026-01-26
 */

import { useAuth } from "@/context/AuthContext";
import socketManager, {
    CallEvent,
    Message,
    Notification,
    SocketConfig,
} from "@/services/socketManager";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

// ============================================================================
// Types
// ============================================================================

type SocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface UseSocketReturn {
  connected: boolean;
  status: SocketStatus;
  connect: () => void;
  disconnect: () => void;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface UseChatReturn extends UseSocketReturn {
  messages: Message[];
  sendMessage: (
    content: string,
    type?: Message["type"],
  ) => Promise<{ ok: boolean }>;
  typingUsers: TypingIndicator[];
  startTyping: () => void;
  stopTyping: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

// ============================================================================
// useSocket - Base socket connection hook
// ============================================================================

/**
 * Base hook for socket connection
 */
export function useSocket(): UseSocketReturn {
  const { user, accessToken } = useAuth();
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  const connect = useCallback(() => {
    // Skip socket on web in development (can enable in production)
    if (Platform.OS === "web" && __DEV__) {
      console.log("[useSocket] Socket disabled on web in development");
      return;
    }

    if (!accessToken) {
      console.warn("[useSocket] No access token available");
      return;
    }

    const config: SocketConfig = {
      token: accessToken,
      userId: user?.id,
      onConnect: () => {
        setConnected(true);
        setStatus("connected");
      },
      onDisconnect: () => {
        setConnected(false);
        setStatus("disconnected");
      },
      onReconnect: () => {
        setConnected(true);
        setStatus("connected");
      },
      onError: (error) => {
        console.error("[useSocket] Error:", error);
        setStatus("error");
      },
    };

    socketManager.connect(config);
  }, [accessToken, user?.id]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setConnected(false);
    setStatus("disconnected");
  }, []);

  // Listen to status changes
  useEffect(() => {
    const handleStatusChange = (newStatus: SocketStatus) => {
      setStatus(newStatus);
      setConnected(newStatus === "connected");
    };

    socketManager.on("statusChange", handleStatusChange);
    return () => {
      socketManager.off("statusChange", handleStatusChange);
    };
  }, []);

  // Auto-connect when token is available
  useEffect(() => {
    if (accessToken && !socketManager.isConnected()) {
      connect();
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [accessToken, connect]);

  return {
    connected,
    status,
    connect,
    disconnect,
  };
}

// ============================================================================
// useChat - Chat functionality hook
// ============================================================================

/**
 * Hook for chat functionality
 */
export function useChat(chatId: string): UseChatReturn {
  const { connected, status, connect, disconnect } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Join chat room when connected
  useEffect(() => {
    if (!connected || !chatId) return;

    socketManager.joinRoom(chatId);

    return () => {
      socketManager.leaveRoom(chatId);
    };
  }, [connected, chatId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socketManager.on("message", handleNewMessage);

    return () => {
      socketManager.off("message", handleNewMessage);
    };
  }, [chatId]);

  // Listen for typing indicators
  useEffect(() => {
    const handleTyping = (data: TypingIndicator) => {
      if (data.chatId === chatId) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            // Add user to typing list
            const exists = prev.some((u) => u.userId === data.userId);
            if (exists) return prev;
            return [...prev, data];
          } else {
            // Remove user from typing list
            return prev.filter((u) => u.userId !== data.userId);
          }
        });
      }
    };

    socketManager.on("typing", handleTyping);

    return () => {
      socketManager.off("typing", handleTyping);
    };
  }, [chatId]);

  const sendMessage = useCallback(
    async (content: string, type: Message["type"] = "text") => {
      if (!connected) {
        console.warn("[useChat] Cannot send message: not connected");
        return { ok: false };
      }

      return socketManager.sendMessage(chatId, { type, body: content });
    },
    [connected, chatId],
  );

  const startTyping = useCallback(() => {
    if (!connected) return;

    socketManager.sendTyping(chatId, true);

    // Auto-stop typing after 5 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketManager.sendTyping(chatId, false);
    }, 5000);
  }, [connected, chatId]);

  const stopTyping = useCallback(() => {
    if (!connected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    socketManager.sendTyping(chatId, false);
  }, [connected, chatId]);

  const joinRoom = useCallback((roomId: string) => {
    socketManager.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketManager.leaveRoom(roomId);
  }, []);

  return {
    connected,
    status,
    connect,
    disconnect,
    messages,
    sendMessage,
    typingUsers,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
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
  const { connected, status, connect, disconnect } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen for new notifications
  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socketManager.on("notification", handleNotification);

    return () => {
      socketManager.off("notification", handleNotification);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    connected,
    status,
    connect,
    disconnect,
    notifications,
    unreadCount,
  };
}

// ============================================================================
// useCall - Call functionality hook
// ============================================================================

export interface UseCallReturn extends UseSocketReturn {
  incomingCall: CallEvent | null;
  initiateCall: (
    receiverId: string,
    type: "audio" | "video",
  ) => Promise<{ ok: boolean; callId?: string; roomName?: string }>;
  acceptCall: (callId: string) => void;
  rejectCall: (callId: string) => void;
  endCall: (callId: string) => void;
}

/**
 * Hook for call functionality
 */
export function useCall(): UseCallReturn {
  const { connected, status, connect, disconnect } = useSocket();
  const [incomingCall, setIncomingCall] = useState<CallEvent | null>(null);

  // Listen for call events
  useEffect(() => {
    const handleIncomingCall = (data: CallEvent) => {
      setIncomingCall(data);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
    };

    const handleCallAccepted = () => {
      setIncomingCall(null);
    };

    const handleCallRejected = () => {
      setIncomingCall(null);
    };

    socketManager.on("callIncoming", handleIncomingCall);
    socketManager.on("callEnded", handleCallEnded);
    socketManager.on("callAccepted", handleCallAccepted);
    socketManager.on("callRejected", handleCallRejected);

    return () => {
      socketManager.off("callIncoming", handleIncomingCall);
      socketManager.off("callEnded", handleCallEnded);
      socketManager.off("callAccepted", handleCallAccepted);
      socketManager.off("callRejected", handleCallRejected);
    };
  }, []);

  const initiateCall = useCallback(
    async (receiverId: string, type: "audio" | "video") => {
      if (!connected) {
        return { ok: false };
      }
      return socketManager.initiateCall(receiverId, type);
    },
    [connected],
  );

  const acceptCall = useCallback((callId: string) => {
    socketManager.acceptCall(callId);
    setIncomingCall(null);
  }, []);

  const rejectCall = useCallback((callId: string) => {
    socketManager.rejectCall(callId);
    setIncomingCall(null);
  }, []);

  const endCall = useCallback((callId: string) => {
    socketManager.endCall(callId);
    setIncomingCall(null);
  }, []);

  return {
    connected,
    status,
    connect,
    disconnect,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
  };
}

// ============================================================================
// Export
// ============================================================================

export type { CallEvent, Message, Notification };
export default useSocket;
