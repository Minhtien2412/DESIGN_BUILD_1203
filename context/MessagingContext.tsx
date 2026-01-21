/**
 * MessagingContext
 * ================
 *
 * Global context cho hệ thống nhắn tin
 *
 * Features:
 * - Connection state management
 * - Global unread badge
 * - Presence tracking
 * - Push notification handling
 *
 * @author ThietKeResort Team
 */

import { useAuth } from "@/context/AuthContext";
import { get } from "@/services/api";
import { messagingBadge } from "@/services/badge.service";
import {
    NewMessage,
    PresenceUpdate,
    realtimeMessaging,
} from "@/services/realtime-messaging.service";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

// ============================================
// TYPES
// ============================================

export interface UserPresence {
  userId: number;
  status: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";
  lastSeenAt?: Date;
}

export interface MessagingContextValue {
  // Connection
  isConnected: boolean;
  connectionError: string | null;

  // Presence
  presences: Map<number, UserPresence>;
  myStatus: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";
  setMyStatus: (status: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE") => void;

  // Unread
  totalUnread: number;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  getPresence: (userId: number) => UserPresence | undefined;
  fetchPresences: (userIds: number[]) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const MessagingContext = createContext<MessagingContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [presences, setPresences] = useState<Map<number, UserPresence>>(
    new Map()
  );
  const [myStatus, setMyStatusState] = useState<
    "ONLINE" | "AWAY" | "BUSY" | "OFFLINE"
  >("OFFLINE");
  const [totalUnread, setTotalUnread] = useState(0);

  const appStateRef = useRef(AppState.currentState);

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  const connect = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await realtimeMessaging.connect();
    } catch (error: any) {
      setConnectionError(error.message);
    }
  }, [isAuthenticated]);

  const disconnect = useCallback(() => {
    realtimeMessaging.disconnect();
    setIsConnected(false);
    setMyStatusState("OFFLINE");
  }, []);

  // ============================================
  // CONNECTION LISTENERS
  // ============================================

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      setMyStatusState("ONLINE");

      // Fetch initial unread count
      fetchUnreadCount();
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      if (reason === "io server disconnect") {
        // Server disconnected us, might need to reconnect with new token
        setConnectionError("Server disconnected");
      }
    };

    const handleError = (error: Error) => {
      setConnectionError(error.message);
    };

    realtimeMessaging.on("connected", handleConnect);
    realtimeMessaging.on("disconnected", handleDisconnect);
    realtimeMessaging.on("error", handleError);

    return () => {
      realtimeMessaging.off("connected", handleConnect);
      realtimeMessaging.off("disconnected", handleDisconnect);
      realtimeMessaging.off("error", handleError);
    };
  }, []);

  // ============================================
  // PRESENCE TRACKING
  // ============================================

  useEffect(() => {
    const handlePresenceUpdate = (payload: PresenceUpdate) => {
      setPresences((prev) => {
        const updated = new Map(prev);
        updated.set(payload.userId, {
          userId: payload.userId,
          status: payload.status,
          lastSeenAt: payload.lastSeenAt
            ? new Date(payload.lastSeenAt)
            : undefined,
        });
        return updated;
      });
    };

    realtimeMessaging.on("presence", handlePresenceUpdate);

    return () => {
      realtimeMessaging.off("presence", handlePresenceUpdate);
    };
  }, []);

  const setMyStatus = useCallback(
    (status: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE") => {
      setMyStatusState(status);
      realtimeMessaging.updatePresence(status);
    },
    []
  );

  const getPresence = useCallback(
    (userId: number) => {
      return presences.get(userId);
    },
    [presences]
  );

  const fetchPresences = useCallback(async (userIds: number[]) => {
    const result = await realtimeMessaging.getPresences(userIds);

    setPresences((prev) => {
      const updated = new Map(prev);
      for (const [userId, status] of Object.entries(result)) {
        updated.set(Number(userId), {
          userId: Number(userId),
          status: status as any,
        });
      }
      return updated;
    });
  }, []);

  // ============================================
  // UNREAD COUNT
  // ============================================

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await get<{ totalUnread: number }>(
        "/conversations/unread-count"
      );
      setTotalUnread(response.totalUnread);
      messagingBadge.setBadgeCount(response.totalUnread);
    } catch (error) {
      console.warn("[MessagingContext] Failed to fetch unread count");
    }
  }, []);

  useEffect(() => {
    const handleNewMessage = (payload: NewMessage) => {
      // Increment unread if message not from me
      const userId = user?.id ? Number(user.id) : undefined;
      if (payload.senderId !== userId) {
        setTotalUnread((prev) => {
          const newCount = prev + 1;
          messagingBadge.setBadgeCount(newCount);
          return newCount;
        });
      }
    };

    const handleReadSync = () => {
      // Refetch unread count when we mark as read
      fetchUnreadCount();
    };

    realtimeMessaging.on("message", handleNewMessage);
    realtimeMessaging.on("readSync", handleReadSync);

    return () => {
      realtimeMessaging.off("message", handleNewMessage);
      realtimeMessaging.off("readSync", handleReadSync);
    };
  }, [user?.id, fetchUnreadCount]);

  // ============================================
  // APP STATE
  // ============================================

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === "active") {
        // Coming back to foreground
        if (prevState !== "active") {
          connect();
          setMyStatus("ONLINE");
          fetchUnreadCount();
        }
      } else if (nextState === "background") {
        setMyStatus("AWAY");
      } else if (nextState === "inactive") {
        // About to go background
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => subscription.remove();
  }, [connect, setMyStatus, fetchUnreadCount]);

  // ============================================
  // AUTO-CONNECT ON AUTH
  // ============================================

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, user, connect, disconnect]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: MessagingContextValue = {
    isConnected,
    connectionError,
    presences,
    myStatus,
    setMyStatus,
    totalUnread,
    connect,
    disconnect,
    getPresence,
    fetchPresences,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useMessaging(): MessagingContextValue {
  const context = useContext(MessagingContext);

  if (!context) {
    throw new Error("useMessaging must be used within MessagingProvider");
  }

  return context;
}

export default MessagingContext;
