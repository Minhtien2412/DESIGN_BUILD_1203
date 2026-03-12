/**
 * WebSocket Manager - Centralized Socket.IO Connection Management
 * Handles real-time connections for Chat, Notifications, Progress Tracking
 */
import { ENV } from '@/config/env';
import { getToken } from '@/utils/storage';
import { io, Socket } from 'socket.io-client';

// ============================================================================
// Types
// ============================================================================

export interface SocketConfig {
  namespace: string;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  timeout: number;
}

export type SocketNamespace = 'chat' | 'call' | 'progress' | 'notifications';

interface SocketEventCallback {
  (data: any): void;
}

// ============================================================================
// Socket Manager Class
// ============================================================================

class WebSocketManager {
  private sockets: Map<SocketNamespace, Socket> = new Map();
  private eventListeners: Map<string, SocketEventCallback[]> = new Map();
  private reconnectAttempts: Map<SocketNamespace, number> = new Map();
  private maxReconnectAttempts = 5;
  
  /**
   * Get socket instance for a namespace
   */
  getSocket(namespace: SocketNamespace): Socket | null {
    return this.sockets.get(namespace) || null;
  }

  /**
   * Connect to a specific namespace
   */
  async connect(namespace: SocketNamespace): Promise<Socket> {
    // Return existing socket if already connected
    const existing = this.sockets.get(namespace);
    if (existing?.connected) {
      console.log(`[WebSocket] Already connected to ${namespace}`);
      return existing;
    }

    try {
      const token = await getToken();
      const namespaceUrl = this.getNamespaceUrl(namespace);
      
      console.log(`[WebSocket] Connecting to ${namespaceUrl}...`);

      const socket = io(namespaceUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        autoConnect: true,
      });

      // Setup event listeners
      this.setupSocketListeners(socket, namespace);

      // Store socket instance
      this.sockets.set(namespace, socket);
      this.reconnectAttempts.set(namespace, 0);

      return socket;
    } catch (error) {
      console.error(`[WebSocket] Failed to connect to ${namespace}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from a specific namespace
   */
  disconnect(namespace: SocketNamespace): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      console.log(`[WebSocket] Disconnecting from ${namespace}`);
      socket.disconnect();
      this.sockets.delete(namespace);
      this.reconnectAttempts.delete(namespace);
    }
  }

  /**
   * Disconnect all sockets
   */
  disconnectAll(): void {
    console.log('[WebSocket] Disconnecting all sockets');
    this.sockets.forEach((socket, namespace) => {
      socket.disconnect();
    });
    this.sockets.clear();
    this.reconnectAttempts.clear();
    this.eventListeners.clear();
  }

  /**
   * Emit event to a namespace
   */
  emit(namespace: SocketNamespace, event: string, data?: any): void {
    const socket = this.sockets.get(namespace);
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`[WebSocket] Cannot emit ${event} - ${namespace} not connected`);
    }
  }

  /**
   * Listen to an event on a namespace
   */
  on(namespace: SocketNamespace, event: string, callback: SocketEventCallback): void {
    const key = `${namespace}:${event}`;
    const listeners = this.eventListeners.get(key) || [];
    listeners.push(callback);
    this.eventListeners.set(key, listeners);

    // Attach to socket if already connected
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(namespace: SocketNamespace, event: string, callback?: SocketEventCallback): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }

    // Remove from internal listeners
    const key = `${namespace}:${event}`;
    if (!callback) {
      this.eventListeners.delete(key);
    } else {
      const listeners = this.eventListeners.get(key) || [];
      const filtered = listeners.filter(l => l !== callback);
      if (filtered.length > 0) {
        this.eventListeners.set(key, filtered);
      } else {
        this.eventListeners.delete(key);
      }
    }
  }

  /**
   * Check if namespace is connected
   */
  isConnected(namespace: SocketNamespace): boolean {
    return this.sockets.get(namespace)?.connected || false;
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private getNamespaceUrl(namespace: SocketNamespace): string {
    const base = ENV.WS_BASE_URL || 'wss://baotienweb.cloud';
    
    switch (namespace) {
      case 'chat':
        return `${base}${ENV.WS_CHAT_NS || '/chat'}`;
      case 'call':
        return `${base}${ENV.WS_CALL_NS || '/call'}`;
      case 'progress':
        return `${base}${ENV.WS_PROGRESS_NS || '/progress'}`;
      case 'notifications':
        return `${base}/notifications`;
      default:
        return base;
    }
  }

  private setupSocketListeners(socket: Socket, namespace: SocketNamespace): void {
    socket.on('connect', () => {
      console.log(`[WebSocket] ✅ Connected to ${namespace} (ID: ${socket.id})`);
      this.reconnectAttempts.set(namespace, 0);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] ❌ Disconnected from ${namespace}: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      const attempts = this.reconnectAttempts.get(namespace) || 0;
      console.error(`[WebSocket] Connection error to ${namespace} (attempt ${attempts + 1}):`, error.message);
      this.reconnectAttempts.set(namespace, attempts + 1);

      if (attempts >= this.maxReconnectAttempts) {
        console.error(`[WebSocket] Max reconnection attempts reached for ${namespace}`);
        socket.disconnect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`[WebSocket] ♻️ Reconnected to ${namespace} after ${attemptNumber} attempts`);
      this.reconnectAttempts.set(namespace, 0);
    });

    socket.on('reconnect_failed', () => {
      console.error(`[WebSocket] 💥 Failed to reconnect to ${namespace}`);
    });

    socket.on('error', (error) => {
      console.error(`[WebSocket] Error on ${namespace}:`, error);
    });

    // Re-attach event listeners after connection
    this.eventListeners.forEach((callbacks, key) => {
      const [ns, event] = key.split(':');
      if (ns === namespace) {
        callbacks.forEach(callback => {
          socket.on(event, callback);
        });
      }
    });
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const socketManager = new WebSocketManager();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Connect to chat namespace
 */
export const connectChat = () => socketManager.connect('chat');

/**
 * Connect to call namespace
 */
export const connectCall = () => socketManager.connect('call');

/**
 * Connect to progress namespace
 */
export const connectProgress = () => socketManager.connect('progress');

/**
 * Connect to notifications namespace
 */
export const connectNotifications = () => socketManager.connect('notifications');

/**
 * Disconnect all sockets (call on logout)
 */
export const disconnectAll = () => socketManager.disconnectAll();
