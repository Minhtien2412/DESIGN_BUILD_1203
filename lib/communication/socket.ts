/**
 * Socket Module - Real-time Communication
 * Socket.IO client for chat, notifications, and signaling
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Room management
 * - Presence detection
 * - Typing indicators
 * - Message acknowledgments
 */

import {
    CallEvent,
    ChatEvent,
    StreamEvent
} from './types';

// ==================== CONSTANTS ====================

const DEFAULT_OPTIONS: SocketConfig = {
  url: process.env.EXPO_PUBLIC_WS_URL || 'wss://baotienweb.cloud',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  timeout: 20000,
};

// ==================== TYPES ====================

export interface SocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  auth?: Record<string, string>;
}

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export type CommunicationEventType = CallEvent | ChatEvent | StreamEvent;

type EventCallback<T = unknown> = (data: T) => void;

// ==================== SOCKET MANAGER CLASS ====================

export class SocketManager {
  private socket: WebSocket | null = null;
  private config: SocketConfig;
  private status: SocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private messageQueue: { event: string; data: unknown }[] = [];
  private userId: string | null = null;

  constructor(config: Partial<SocketConfig> = {}) {
    this.config = { ...DEFAULT_OPTIONS, ...config };
    
    if (this.config.autoConnect) {
      this.connect();
    }
  }

  // ==================== CONNECTION METHODS ====================

  /**
   * Connect to WebSocket server
   */
  connect(auth?: { userId: string; token: string }): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('[Socket] Already connected');
      return;
    }

    this.status = 'connecting';
    this.emit('status', this.status);

    const url = auth 
      ? `${this.config.url}?userId=${auth.userId}&token=${auth.token}`
      : this.config.url;

    if (auth) {
      this.userId = auth.userId;
    }

    try {
      this.socket = new WebSocket(url);
      this.setupSocketHandlers();
    } catch (error) {
      console.error('[Socket] Connection error:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.status = 'disconnected';
    this.emit('status', this.status);
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('[Socket] Connected');
      this.status = 'connected';
      this.reconnectAttempts = 0;
      this.emit('status', this.status);
      this.emit('connected');
      this.startHeartbeat();
      this.flushMessageQueue();
    };

    this.socket.onclose = (event) => {
      console.log('[Socket] Disconnected:', event.code, event.reason);
      this.stopHeartbeat();
      
      if (event.code !== 1000 && this.config.reconnection) {
        this.handleReconnect();
      } else {
        this.status = 'disconnected';
        this.emit('status', this.status);
        this.emit('disconnected', { code: event.code, reason: event.reason });
      }
    };

    this.socket.onerror = (error) => {
      console.error('[Socket] Error:', error);
      this.emit('error', error);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('[Socket] Failed to parse message:', error);
      }
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: { type: string; payload: unknown }): void {
    const { type, payload } = data;

    // Handle pong
    if (type === 'pong') {
      return;
    }

    // Emit to specific event listeners
    this.emit(type, payload);

    // Also emit to 'message' for generic handling
    this.emit('message', data);
  }

  // ==================== RECONNECTION ====================

  private handleConnectionError(): void {
    this.status = 'error';
    this.emit('status', this.status);
    
    if (this.config.reconnection) {
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.reconnectionAttempts || 10)) {
      console.log('[Socket] Max reconnection attempts reached');
      this.status = 'error';
      this.emit('status', this.status);
      this.emit('reconnectFailed');
      return;
    }

    this.status = 'reconnecting';
    this.emit('status', this.status);

    const delay = Math.min(
      (this.config.reconnectionDelay || 1000) * Math.pow(2, this.reconnectAttempts),
      this.config.reconnectionDelayMax || 30000
    );

    this.reconnectAttempts++;
    console.log(`[Socket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // ==================== HEARTBEAT ====================

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', {});
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // ==================== MESSAGING ====================

  /**
   * Send message to server
   */
  send<T>(event: string, data: T): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: event, payload: data }));
    } else {
      // Queue message for later
      this.messageQueue.push({ event, data });
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift()!;
      this.send(event, data);
    }
  }

  // ==================== ROOM MANAGEMENT ====================

  /**
   * Join a room
   */
  joinRoom(roomId: string): void {
    this.send('room:join', { roomId });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    this.send('room:leave', { roomId });
  }

  // ==================== CHAT METHODS ====================

  /**
   * Send chat message
   */
  sendMessage(conversationId: string, content: string, type: string = 'text'): void {
    this.send('message:send', {
      conversationId,
      content,
      type,
      senderId: this.userId,
    });
  }

  /**
   * Mark message as read
   */
  markAsRead(conversationId: string, messageId: string): void {
    this.send('message:read', {
      conversationId,
      messageId,
      userId: this.userId,
    });
  }

  /**
   * Start typing indicator
   */
  startTyping(conversationId: string): void {
    this.send('typing:start', {
      conversationId,
      userId: this.userId,
    });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string): void {
    this.send('typing:stop', {
      conversationId,
      userId: this.userId,
    });
  }

  // ==================== CALL SIGNALING ====================

  /**
   * Send call signal
   */
  sendCallSignal(
    type: 'offer' | 'answer' | 'ice-candidate' | 'call' | 'accept' | 'reject' | 'end',
    data: unknown
  ): void {
    this.send(`call:${type}`, data);
  }

  /**
   * Initiate call
   */
  initiateCall(calleeId: string, callType: 'video' | 'audio'): void {
    this.send('call:initiate', {
      callerId: this.userId,
      calleeId,
      type: callType,
    });
  }

  /**
   * Accept incoming call
   */
  acceptCall(callId: string): void {
    this.send('call:accept', { callId, userId: this.userId });
  }

  /**
   * Reject incoming call
   */
  rejectCall(callId: string, reason?: string): void {
    this.send('call:reject', { callId, userId: this.userId, reason });
  }

  /**
   * End call
   */
  endCall(callId: string): void {
    this.send('call:end', { callId, userId: this.userId });
  }

  // ==================== LIVESTREAM METHODS ====================

  /**
   * Join live stream
   */
  joinStream(streamId: string): void {
    this.send('stream:join', { streamId, userId: this.userId });
  }

  /**
   * Leave live stream
   */
  leaveStream(streamId: string): void {
    this.send('stream:leave', { streamId, userId: this.userId });
  }

  /**
   * Send stream comment
   */
  sendStreamComment(streamId: string, content: string): void {
    this.send('stream:comment', {
      streamId,
      userId: this.userId,
      content,
    });
  }

  /**
   * Send stream gift
   */
  sendStreamGift(streamId: string, giftType: string, message?: string): void {
    this.send('stream:gift', {
      streamId,
      userId: this.userId,
      giftType,
      message,
    });
  }

  // ==================== PRESENCE ====================

  /**
   * Update online status
   */
  updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.send('presence:update', { userId: this.userId, status });
  }

  // ==================== EVENT EMITTER ====================

  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback as EventCallback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    this.eventListeners.get(event)?.delete(callback as EventCallback);
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): void {
    const onceCallback: EventCallback<T> = (data) => {
      this.off(event, onceCallback);
      callback(data);
    };
    this.on(event, onceCallback);
  }

  private emit<T = unknown>(event: string, data?: T): void {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }

  // ==================== GETTERS ====================

  getStatus(): SocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.socket?.readyState === WebSocket.OPEN;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

// ==================== SINGLETON INSTANCE ====================

let socketInstance: SocketManager | null = null;

export function getSocketManager(config?: Partial<SocketConfig>): SocketManager {
  if (!socketInstance) {
    socketInstance = new SocketManager(config);
  }
  return socketInstance;
}

export function resetSocketManager(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// ==================== EXPORTS ====================

export { DEFAULT_OPTIONS as DEFAULT_SOCKET_OPTIONS };
