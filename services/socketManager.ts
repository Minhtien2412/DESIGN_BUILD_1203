// Real-time Socket.IO client manager for ThietKe Resort API
// Handles WebSocket connections, message routing, and offline scenarios

import { AppState, AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'system';
  body: string;
  metadata?: any;
  createdAt: string;
  readBy?: string[];
}

interface SocketConfig {
  token: string;
  onMessage?: (message: Message) => void;
  onMessageRead?: (data: { chatId: string; messageId: string; userId: string; readAt: string }) => void;
  onNotification?: (notification: any) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: any) => void;
  onReconnect?: (attemptNumber: number) => void;
}

interface SendMessagePayload {
  type: 'text' | 'image' | 'file';
  body: string;
  metadata?: any;
  clientId?: string;
}

interface SendMessageResponse {
  ok: boolean;
  messageId?: string;
  error?: string;
}

class SocketManager {
  private socket: Socket | null = null;
  private config: SocketConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private appStateSubscription: any = null;

  constructor() {
    this.setupAppStateHandler();
    this.setupNetworkHandler();
  }

  private setupAppStateHandler() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private setupNetworkHandler() {
    // Optional: Network state monitoring can be added later
    // This would require @react-native-community/netinfo dependency
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && this.config) {
      // App became active - ensure connection
      if (!this.socket?.connected) {
        this.reconnect();
      }
    } else if (nextAppState === 'background') {
      // App went to background - keep connection but stop heartbeat
      this.stopHeartbeat();
    }
  };

  connect(config: SocketConfig) {
    if (this.isConnecting) {
      console.log('Socket connection already in progress');
      return;
    }

    this.config = config;
    this.isConnecting = true;
    this.createConnection();
  }

  private createConnection() {
    if (!this.config) {
      this.isConnecting = false;
      return;
    }

    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'https://api.thietkeresort.com.vn';
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);

    this.socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { 
        token: this.config.token 
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventHandlers();
    this.setupConnectionTimeout();
  }

  private setupConnectionTimeout() {
    // Clear existing timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }

    // Set connection timeout
    this.connectionTimeout = setTimeout(() => {
      if (!this.socket?.connected) {
        console.warn('Socket connection timeout');
        this.isConnecting = false;
        this.config?.onError?.(new Error('Connection timeout'));
      }
    }, 30000);
  }

  private setupEventHandlers() {
    if (!this.socket || !this.config) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }

      this.startHeartbeat();
      this.config?.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      this.config?.onDisconnect?.(reason);
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect - don't auto-reconnect
        return;
      }
      
      this.scheduleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      this.config?.onError?.(error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        return;
      }
      
      this.scheduleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.config?.onReconnect?.(attemptNumber);
    });

    // Chat message events
    this.socket.on('message:new', (message: Message) => {
      console.log('Received new message:', message.id);
      this.config?.onMessage?.(message);
      this.emit('message:new', message);
    });

    this.socket.on('message:read', (data: { chatId: string; messageId: string; userId: string; readAt: string }) => {
      console.log('Message read:', data);
      this.config?.onMessageRead?.(data);
      this.emit('message:read', data);
    });

    // System notifications
    this.socket.on('notify', (notification: any) => {
      console.log('Received notification:', notification);
      this.config?.onNotification?.(notification);
      this.emit('notification', notification);
    });

    // Typing indicators
    this.socket.on('typing:start', (data: { chatId: string; userId: string }) => {
      this.emit('typing:start', data);
    });

    this.socket.on('typing:stop', (data: { chatId: string; userId: string }) => {
      this.emit('typing:stop', data);
    });

    // Presence events
    this.socket.on('user:online', (data: { userId: string }) => {
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data: { userId: string }) => {
      this.emit('user:offline', data);
    });

    // Heartbeat response
    this.socket.on('pong', () => {
      // Server responded to ping
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      if (!this.socket?.connected && this.config) {
        console.log(`Attempting reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnect();
      }
    }, delay);
  }

  // Public methods for sending messages
  sendMessage(chatId: string, payload: SendMessagePayload): Promise<SendMessageResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      this.socket.emit('message:send', 
        { chatId, ...payload }, 
        (ack: SendMessageResponse) => {
          clearTimeout(timeout);
          
          if (ack.ok) {
            resolve(ack);
          } else {
            reject(new Error(ack.error || 'Failed to send message'));
          }
        }
      );
    });
  }

  markMessageAsRead(chatId: string, messageId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message:read', { chatId, messageId });
    }
  }

  startTyping(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', { chatId });
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', { chatId });
    }
  }

  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('chat:join', { chatId });
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('chat:leave', { chatId });
    }
  }

  // Event listener methods
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  // Connection management
  reconnect(): void {
    if (this.isConnecting) return;

    console.log('Manually reconnecting socket');
    this.disconnect();
    
    if (this.config) {
      setTimeout(() => {
        this.createConnection();
      }, 1000);
    }
  }

  disconnect(): void {
    console.log('Disconnecting socket');
    
    this.isConnecting = false;
    this.stopHeartbeat();
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  updateToken(newToken: string): void {
    if (this.config) {
      this.config.token = newToken;
      
      // Reconnect with new token
      if (this.socket?.connected) {
        this.reconnect();
      }
    }
  }

  // Status methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.listeners.clear();
    this.config = null;
    
    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Create singleton instance
export const socketManager = new SocketManager();

// Export types
export type { Message, SendMessagePayload, SendMessageResponse, SocketConfig };

// Default export
export default socketManager;