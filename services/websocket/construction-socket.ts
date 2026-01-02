/**
 * Construction Map WebSocket Client
 * Real-time synchronization for collaborative editing
 * Using native WebSocket API
 */

// ============================================
// Configuration
// ============================================

const WEBSOCKET_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://api.thietkeresort.com.vn:3002';

// ============================================
// Event Interfaces
// ============================================

export interface TaskMovedEvent {
  taskId: string;
  x: number;
  y: number;
  userId: string;
  timestamp: string;
}

export interface TaskStatusChangedEvent {
  taskId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  userId: string;
  timestamp: string;
}

export interface ZoomChangedEvent {
  zoom: number;
  userId: string;
  timestamp: string;
}

export interface PanChangedEvent {
  x: number;
  y: number;
  userId: string;
  timestamp: string;
}

export interface UserJoinedEvent {
  userId: string;
  userName: string;
  timestamp: string;
}

export interface UserLeftEvent {
  userId: string;
  timestamp: string;
}

// ============================================
// Construction Socket Class (Singleton)
// ============================================

class ConstructionSocket {
  private socket: WebSocket | null = null;
  private projectId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(projectId: string, userId?: string, userName?: string): WebSocket | null {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('[ConstructionSocket] Already connected');
      return this.socket;
    }

    this.projectId = projectId;
    this.userId = userId || 'anonymous';
    this.userName = userName || 'Guest';

    try {
      const url = `${WEBSOCKET_URL}?projectId=${projectId}&userId=${this.userId}&userName=${encodeURIComponent(this.userName)}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[ConstructionSocket] Connected');
        this.reconnectAttempts = 0;
        this.startPing();
        this.emit('connect', {});
      };

      this.socket.onclose = (event: CloseEvent) => {
        console.log('[ConstructionSocket] Disconnected:', event.code, event.reason);
        this.stopPing();
        this.emit('disconnect', { code: event.code, reason: event.reason });
        this.handleReconnect();
      };

      this.socket.onerror = (error: Event) => {
        console.error('[ConstructionSocket] Error:', error);
        this.emit('error', { error });
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[ConstructionSocket] Parse error:', error);
        }
      };

      return this.socket;
    } catch (error) {
      console.error('[ConstructionSocket] Connection error:', error);
      return null;
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: { type: string; payload: any }) {
    console.log('[ConstructionSocket] Message:', message.type);
    this.emit(message.type, message.payload);
  }

  /**
   * Start ping interval
   */
  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[ConstructionSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[ConstructionSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.projectId) {
        this.connect(this.projectId, this.userId || undefined, this.userName || undefined);
      }
    }, delay);
  }

  /**
   * Send message to server
   */
  send(type: string, payload: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[ConstructionSocket] Socket not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify({ type, payload }));
      return true;
    } catch (error) {
      console.error('[ConstructionSocket] Send error:', error);
      return false;
    }
  }

  /**
   * Register event handler
   */
  on(event: string, handler: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  off(event: string, handler: (data: any) => void) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[ConstructionSocket] Handler error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    this.stopPing();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.projectId = null;
    this.eventHandlers.clear();
    console.log('[ConstructionSocket] Disconnected manually');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get WebSocket instance
   */
  getSocket(): WebSocket | null {
    return this.socket;
  }

  // ==========================================
  // Construction Map Specific Methods
  // ==========================================

  /**
   * Emit task moved event
   */
  emitTaskMoved(taskId: string, x: number, y: number) {
    this.send('task-moved', {
      taskId,
      x,
      y,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit task status changed event
   */
  emitTaskStatusChanged(taskId: string, status: string) {
    this.send('task-status-changed', {
      taskId,
      status,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit zoom changed event
   */
  emitZoomChanged(zoom: number) {
    this.send('zoom-changed', {
      zoom,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit pan changed event
   */
  emitPanChanged(x: number, y: number) {
    this.send('pan-changed', {
      x,
      y,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Listen for task moved events
   */
  onTaskMoved(handler: (event: TaskMovedEvent) => void) {
    this.on('task-moved', handler);
  }

  /**
   * Listen for task status changed events
   */
  onTaskStatusChanged(handler: (event: TaskStatusChangedEvent) => void) {
    this.on('task-status-changed', handler);
  }

  /**
   * Listen for zoom changed events
   */
  onZoomChanged(handler: (event: ZoomChangedEvent) => void) {
    this.on('zoom-changed', handler);
  }

  /**
   * Listen for pan changed events
   */
  onPanChanged(handler: (event: PanChangedEvent) => void) {
    this.on('pan-changed', handler);
  }

  /**
   * Listen for user joined events
   */
  onUserJoined(handler: (event: UserJoinedEvent) => void) {
    this.on('user-joined', handler);
  }

  /**
   * Listen for user left events
   */
  onUserLeft(handler: (event: UserLeftEvent) => void) {
    this.on('user-left', handler);
  }
}

// Export singleton instance
export const constructionSocket = new ConstructionSocket();
export default constructionSocket;
