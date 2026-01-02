/**
 * WebSocket Service for Real-time Messages
 * Replaces polling with instant message delivery
 */

import { ENV } from '@/config/env';
import { getAuthToken } from '@/services/api';

type MessageEventType = 
  | 'message:new'
  | 'message:read'
  | 'message:deleted'
  | 'message:reaction'
  | 'typing:start'
  | 'typing:stop'
  | 'user:online'
  | 'user:offline';

interface MessageSocketEvent {
  type: MessageEventType;
  data: any;
}

type SocketEventHandler = (data: any) => void;

class MessageSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: any = null;
  private eventHandlers = new Map<MessageEventType, Set<SocketEventHandler>>();
  private isConnecting = false;

  /**
   * Connect to WebSocket server
   */
  async connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('[MessageSocket] Already connected or connecting');
      return;
    }

    try {
      this.isConnecting = true;
      const token = await getAuthToken();
      
      if (!token) {
        console.warn('[MessageSocket] No auth token, skipping connection');
        this.isConnecting = false;
        return;
      }

      // Use WS_URL from config, fallback to constructing from API_BASE_URL
      const wsUrl = ENV.WS_URL || 
        `${ENV.API_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/messages`;

      console.log('[MessageSocket] Connecting to:', wsUrl);

      this.socket = new WebSocket(`${wsUrl}?token=${token}`);

      this.socket.onopen = () => {
        console.log('[MessageSocket] ✅ Connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const message: MessageSocketEvent = JSON.parse(event.data);
          this.handleEvent(message);
        } catch (error) {
          console.error('[MessageSocket] Failed to parse message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('[MessageSocket] Error:', error);
        this.isConnecting = false;
      };

      this.socket.onclose = () => {
        console.log('[MessageSocket] Disconnected');
        this.isConnecting = false;
        this.stopHeartbeat();
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('[MessageSocket] Connection failed:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('[MessageSocket] Disconnecting...');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Subscribe to socket events
   */
  on(event: MessageEventType, handler: SocketEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: number, isTyping: boolean) {
    this.send({
      type: isTyping ? 'typing:start' : 'typing:stop',
      data: { conversationId },
    });
  }

  /**
   * Mark messages as read
   */
  markAsRead(messageIds: number[]) {
    this.send({
      type: 'message:read',
      data: { messageIds },
    });
  }

  /**
   * Add reaction to message
   */
  addReaction(messageId: number, reaction: string) {
    this.send({
      type: 'message:reaction',
      data: { messageId, reaction, action: 'add' },
    });
  }

  /**
   * Remove reaction from message
   */
  removeReaction(messageId: number, reaction: string) {
    this.send({
      type: 'message:reaction',
      data: { messageId, reaction, action: 'remove' },
    });
  }

  /**
   * Send data through WebSocket
   */
  private send(message: MessageSocketEvent) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[MessageSocket] Cannot send, socket not open');
    }
  }

  /**
   * Handle incoming events
   */
  private handleEvent(event: MessageSocketEvent) {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event.data);
        } catch (error) {
          console.error('[MessageSocket] Handler error:', error);
        }
      });
    }
  }

  /**
   * Attempt reconnection
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[MessageSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[MessageSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get connection state
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const messageSocket = new MessageSocketService();
