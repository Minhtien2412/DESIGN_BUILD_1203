/**
 * WebSocket Context Provider
 * Manages Socket.IO connection lifecycle across the app
 * 
 * Features:
 * - Auto-connect/disconnect based on auth state
 * - Reconnection with exponential backoff
 * - Connection status monitoring
 * - Graceful error handling
 */

import socketManager from '@/services/socket';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

// Extract Socket type
type Socket = ReturnType<typeof io>;

// ============================================================================
// Types
// ============================================================================

export interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean; // Default: true
  reconnectOnAuthChange?: boolean; // Default: true
}

// ============================================================================
// Provider Component
// ============================================================================

export function WebSocketProvider({
  children,
  autoConnect = true, // ENABLED: Infrastructure ready, graceful fallback if backend not ready
  reconnectOnAuthChange = true, // ENABLED: Auto-reconnect on auth changes
}: WebSocketProviderProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================================
  // Connection Management
  // ============================================================================

  const connect = useCallback(async () => {
    // Skip WebSocket on web platform
    if (Platform.OS === 'web') {
      console.log('[WebSocket] Disabled on web platform');
      return;
    }

    // Graceful fallback: Try to connect, but don't throw if backend not ready
    if (connected || connecting) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    if (!user) {
      console.log('[WebSocket] No user, skipping connection');
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      console.log('[WebSocket] Attempting to connect...');

      const socketInstance = await socketManager.connect();
      setSocket(socketInstance);
      setConnected(socketManager.isConnected());
      reconnectAttemptsRef.current = 0;
      
      console.log('[WebSocket] Connected successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      console.log('[WebSocket] Connection failed (graceful fallback):', errorMessage);
      setError(errorMessage);
      setConnected(false);
      
      // Graceful degradation: App continues to work without WebSocket
      // Don't throw error, just log it
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting, user]);

  const disconnect = useCallback(() => {
    console.log('[WebSocket] Disconnecting...');
    
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    socketManager.disconnect();
    setSocket(null);
    setConnected(false);
    setConnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(async () => {
    console.log('[WebSocket] Reconnecting... (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})');
    
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached, giving up gracefully');
      setError('Connection failed after multiple attempts');
      return;
    }

    disconnect();
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    
    reconnectTimeoutRef.current = setTimeout(async () => {
      reconnectAttemptsRef.current++;
      await connect();
    }, delay);
  }, [connect, disconnect]);

  // ============================================================================
  // Auto-connect on mount
  // ============================================================================

  useEffect(() => {
    if (autoConnect && user) {
      console.log('[WebSocket] Auto-connecting on mount');
      connect();
    }

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [autoConnect, user, connect]);

  // ============================================================================
  // Reconnect when auth state changes
  // ============================================================================

  useEffect(() => {
    if (!reconnectOnAuthChange) return;

    if (user && !connected && !connecting) {
      console.log('[WebSocket] User logged in, reconnecting');
      connect();
    } else if (!user && connected) {
      console.log('[WebSocket] User logged out, disconnecting');
      disconnect();
    }
  }, [user, connected, connecting, reconnectOnAuthChange, connect, disconnect]);

  // ============================================================================
  // Monitor connection status
  // ============================================================================

  useEffect(() => {
    if (!socket || !connected) return;

    const interval = setInterval(() => {
      if (socket && !socket.connected) {
        console.log('[WebSocket] Connection lost, attempting reconnect');
        setConnected(false);
        reconnect();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [socket, connected, reconnect]);

  // DISABLED: Backend WebSocket not ready yet

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: WebSocketContextType = {
    socket,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

// ============================================================================
// Exports
// ============================================================================

export default WebSocketContext;
