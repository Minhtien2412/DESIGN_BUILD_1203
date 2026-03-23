/**
 * Progress WebSocket Context
 * Manages /progress namespace connection for real-time task/project updates
 */

import progressSocketManager from "@/services/progressSocket";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Platform } from "react-native";
import type { Socket } from "@/utils/socketIo";
import { useAuth } from "./AuthContext";

// ============================================================================
// Types
// ============================================================================

export interface ProgressWebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeToTask: (
    taskId: number,
    callback: (data: any) => void,
  ) => () => void;
  subscribeToProject: (
    projectId: number,
    callback: (data: any) => void,
  ) => () => void;
}

// ============================================================================
// Context
// ============================================================================

const ProgressWebSocketContext = createContext<
  ProgressWebSocketContextType | undefined
>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface ProgressWebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean; // Default: true
}

// ============================================================================
// Provider Component
// ============================================================================

export function ProgressWebSocketProvider({
  children,
  autoConnect = false, // DISABLED: Prevent infinite loop until backend is stable
}: ProgressWebSocketProviderProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3; // Reduced
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasAttemptedRef = useRef(false); // Prevent multiple attempts

  // ============================================================================
  // Connection Management
  // ============================================================================

  const connect = useCallback(async () => {
    // Skip WebSocket on web platform
    if (Platform.OS === "web") {
      console.log("[ProgressWebSocket] Disabled on web platform");
      return;
    }

    if (connected || connecting) {
      console.log("[ProgressWebSocket] Already connected or connecting");
      return;
    }

    if (!user) {
      console.log("[ProgressWebSocket] No user, skipping connection");
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      console.log(
        "[ProgressWebSocket] Attempting to connect to /progress namespace...",
      );

      const socketInstance = await progressSocketManager.connect();
      setSocket(socketInstance);
      setConnected(progressSocketManager.isConnected());
      reconnectAttemptsRef.current = 0;

      console.log("[ProgressWebSocket] Connected successfully to /progress");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection failed";
      console.log(
        "[ProgressWebSocket] Connection failed (graceful fallback):",
        errorMessage,
      );
      setError(errorMessage);
      setConnected(false);

      // Graceful degradation: App continues without real-time progress
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting, user]);

  const disconnect = useCallback(() => {
    console.log("[ProgressWebSocket] Disconnecting...");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    progressSocketManager.disconnect();
    setSocket(null);
    setConnected(false);
    setError(null);

    console.log("[ProgressWebSocket] Disconnected");
  }, []);

  // ============================================================================
  // Subscription Helpers
  // ============================================================================

  const subscribeToTask = useCallback(
    (taskId: number, callback: (data: any) => void): (() => void) => {
      if (!socket || !connected) {
        console.warn(
          "[ProgressWebSocket] Not connected, cannot subscribe to task:",
          taskId,
        );
        return () => {}; // Return no-op cleanup
      }

      return progressSocketManager.subscribeToTask(taskId, callback);
    },
    [socket, connected],
  );

  const subscribeToProject = useCallback(
    (projectId: number, callback: (data: any) => void): (() => void) => {
      if (!socket || !connected) {
        console.warn(
          "[ProgressWebSocket] Not connected, cannot subscribe to project:",
          projectId,
        );
        return () => {}; // Return no-op cleanup
      }

      return progressSocketManager.subscribeToProject(projectId, callback);
    },
    [socket, connected],
  );

  // ============================================================================
  // Auto-connect/disconnect - DISABLED to prevent loop
  // ============================================================================

  useEffect(() => {
    if (!autoConnect) return;

    // Only attempt once per session
    if (user && !hasAttemptedRef.current) {
      hasAttemptedRef.current = true;
      console.log(
        "[ProgressWebSocket] User logged in, auto-connecting (single attempt)...",
      );
      connect();
    } else if (!user) {
      console.log("[ProgressWebSocket] User logged out, disconnecting...");
      disconnect();
      hasAttemptedRef.current = false; // Reset for next login
    }

    return () => {
      // Only cleanup timeouts, don't disconnect on every render
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
     
  }, [user]); // Only depend on user

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: ProgressWebSocketContextType = {
    socket,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    subscribeToTask,
    subscribeToProject,
  };

  return (
    <ProgressWebSocketContext.Provider value={value}>
      {children}
    </ProgressWebSocketContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useProgressWebSocket(): ProgressWebSocketContextType {
  const context = useContext(ProgressWebSocketContext);
  if (!context) {
    throw new Error(
      "useProgressWebSocket must be used within ProgressWebSocketProvider",
    );
  }
  return context;
}
