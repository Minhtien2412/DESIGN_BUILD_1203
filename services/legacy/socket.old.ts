/**
 * Socket.IO Client Service
 * Based on FRONTEND-INTEGRATION-GUIDE.md
 * 
 * Features:
 * - Real-time chat
 * - Notifications
 * - Project updates
 * - Typing indicators
 */

import ENV from '@/config/env';
import { Platform } from 'react-native';
import io from 'socket.io-client';
import { getAccessToken } from './apiClient';

// Extract Socket type from io return type
type Socket = ReturnType<typeof io>;

// ============================================================================
// Types
// ============================================================================

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'project' | 'message' | 'system';
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface ProjectUpdate {
  projectId: string;
  type: 'status_changed' | 'member_added' | 'milestone_completed' | 'task_updated';
  data: any;
}

export interface TypingIndicator {
  userId: string;
  fullName: string;
  projectId: string;
}

// ============================================================================
// Socket Manager Class
// ============================================================================

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize socket connection
   */
  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return this.socket;
    }

    const token = await getAccessToken();
    if (!token) {
      throw new Error('No access token available for socket connection');
    }

    const wsUrl = this.normalizeWsUrl(ENV.WS_URL || ENV.API_BASE_URL);
    
    console.log('[Socket] Connecting to:', wsUrl);

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Normalize WebSocket URL for different platforms
   */
  private normalizeWsUrl(url: string): string {
    try {
      const wsUrl = new URL(url);
      
      // Android emulator cannot reach localhost on host machine
      if (
        Platform.OS === 'android' &&
        (wsUrl.hostname === 'localhost' || wsUrl.hostname === '127.0.0.1')
      ) {
        wsUrl.hostname = '10.0.2.2';
      }

      return wsUrl.toString().replace(/\/$/, '');
    } catch {
      // Fallback for non-URL strings
      if (
        Platform.OS === 'android' &&
        (url.includes('localhost') || url.includes('127.0.0.1'))
      ) {
        return url
          .replace('localhost', '10.0.2.2')
          .replace('127.0.0.1', '10.0.2.2')
          .replace(/\/$/, '');
      }
      return url.replace(/\/$/, '');
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] ✅ Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('[Socket] ❌ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('[Socket] Error:', error);
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      console.log('[Socket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // =========================================================================
  // Chat Methods
  // =========================================================================

  /**
   * Join chat room
   */
  joinChat(projectId: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    console.log('[Socket] Joining chat:', projectId);
    this.socket.emit('join:chat', { projectId });
  }

  /**
   * Leave chat room
   */
  leaveChat(projectId: string) {
    if (!this.socket) return;
    console.log('[Socket] Leaving chat:', projectId);
    this.socket.emit('leave:chat', { projectId });
  }

  /**
   * Send chat message
   */
  sendMessage(projectId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    console.log('[Socket] Sending message to:', projectId);
    this.socket.emit('message:send', { projectId, content, type });
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (message: ChatMessage) => void) {
    if (!this.socket) return;
    this.socket.on('message:new', callback);
  }

  /**
   * Remove message listener
   */
  offNewMessage(callback?: (message: ChatMessage) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('message:new', callback);
    } else {
      this.socket.off('message:new');
    }
  }

  /**
   * Start typing indicator
   */
  startTyping(projectId: string) {
    if (!this.socket) return;
    this.socket.emit('typing:start', { projectId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(projectId: string) {
    if (!this.socket) return;
    this.socket.emit('typing:stop', { projectId });
  }

  /**
   * Listen for typing indicators
   */
  onTyping(callback: (data: TypingIndicator) => void) {
    if (!this.socket) return;
    this.socket.on('typing:user', callback);
  }

  /**
   * Remove typing listener
   */
  offTyping(callback?: (data: TypingIndicator) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('typing:user', callback);
    } else {
      this.socket.off('typing:user');
    }
  }

  // =========================================================================
  // Notification Methods
  // =========================================================================

  /**
   * Listen for new notifications
   */
  onNotification(callback: (notification: Notification) => void) {
    if (!this.socket) return;
    this.socket.on('notification:new', callback);
  }

  /**
   * Remove notification listener
   */
  offNotification(callback?: (notification: Notification) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('notification:new', callback);
    } else {
      this.socket.off('notification:new');
    }
  }

  // =========================================================================
  // Project Update Methods
  // =========================================================================

  /**
   * Subscribe to project updates
   */
  subscribeToProject(projectId: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    console.log('[Socket] Subscribing to project:', projectId);
    this.socket.emit('subscribe:project', { projectId });
  }

  /**
   * Unsubscribe from project updates
   */
  unsubscribeFromProject(projectId: string) {
    if (!this.socket) return;
    console.log('[Socket] Unsubscribing from project:', projectId);
    this.socket.emit('unsubscribe:project', { projectId });
  }

  /**
   * Listen for project updates
   */
  onProjectUpdate(callback: (update: ProjectUpdate) => void) {
    if (!this.socket) return;
    this.socket.on('project:update', callback);
  }

  /**
   * Remove project update listener
   */
  offProjectUpdate(callback?: (update: ProjectUpdate) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('project:update', callback);
    } else {
      this.socket.off('project:update');
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

const socketManager = new SocketManager();

export default socketManager;
export { socketManager };
