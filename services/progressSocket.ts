/**
 * Progress WebSocket Service
 * Connects to /progress namespace for real-time task/project progress updates
 */

import ENV from "@/config/env";
import { Platform } from "react-native";
import { getSocketIo } from "@/utils/socketIo";
import type { Socket } from "@/utils/socketIo";
import { getAccessToken } from "./apiClient";

// ============================================================================
// Types
// ============================================================================

export interface TaskProgress {
  taskId: number;
  name: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number; // 0-100
  assignees: { id: number; fullName: string; avatar?: string }[];
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  activityCount: {
    comments: number;
    files: number;
  };
  lastUpdated: string;
}

export interface ProjectProgress {
  projectId: number;
  name: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  overallProgress: number; // 0-100
  completedTasks: number;
  totalTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    percentUsed: number;
  } | null;
  timeline: {
    startDate: string | null;
    endDate: string | null;
    daysElapsed: number;
    daysRemaining: number;
    totalDays: number;
    percentTimeElapsed: number;
    isOverdue: boolean;
  };
  milestones: {
    name: string;
    progress: number;
    completed: boolean;
  }[];
  team: {
    members: number;
    activeMembers: number;
  };
  activity: {
    totalComments: number;
    totalFiles: number;
    lastActivityDate: string | null;
  };
  lastUpdated: string;
}

export interface ProgressUpdateData {
  taskId?: number;
  projectId?: number;
  progress: TaskProgress | ProjectProgress;
  timestamp: string;
}

// ============================================================================
// Progress Socket Manager
// ============================================================================

class ProgressSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscriptions = new Map<string, Set<Function>>();

  /**
   * Connect to /progress namespace
   */
  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      console.log('[ProgressSocket] Already connected');
      return this.socket;
    }

    const token = await getAccessToken();
    if (!token) {
      throw new Error('[ProgressSocket] No access token available');
    }

    const wsUrl = this.normalizeWsUrl(ENV.WS_PROGRESS_URL || 'wss://baotienweb.cloud/progress');
    
    console.log('[ProgressSocket] Connecting to:', wsUrl);

    const io = await getSocketIo();
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
   * Normalize WebSocket URL for Android emulator
   */
  private normalizeWsUrl(url: string): string {
    try {
      const wsUrl = new URL(url);
      
      if (
        Platform.OS === 'android' &&
        (wsUrl.hostname === 'localhost' || wsUrl.hostname === '127.0.0.1')
      ) {
        wsUrl.hostname = '10.0.2.2';
      }

      return wsUrl.toString().replace(/\/$/, '');
    } catch {
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
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[ProgressSocket] ✅ Connected to /progress namespace');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('[ProgressSocket] Disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server forcefully disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.warn('[ProgressSocket] Connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[ProgressSocket] Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('[ProgressSocket] Error:', error);
    });
  }

  /**
   * Subscribe to task progress updates
   */
  subscribeToTask(taskId: number, callback: (data: ProgressUpdateData) => void): () => void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[ProgressSocket] Not connected, cannot subscribe to task:', taskId);
      return () => {}; // Return no-op cleanup
    }

    const eventName = `task:progress:${taskId}`;
    
    // Register subscription
    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, new Set());
    }
    this.subscriptions.get(eventName)!.add(callback);

    // Subscribe on server
    this.socket.emit('subscribe:task', { taskId });
    
    // Listen for updates
    this.socket.on(eventName, callback);
    
    console.log(`[ProgressSocket] Subscribed to task:${taskId}`);

    // Return cleanup function
    return () => {
      if (!this.socket) return;
      
      this.socket.emit('unsubscribe:task', { taskId });
      this.socket.off(eventName, callback);
      
      const subs = this.subscriptions.get(eventName);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(eventName);
        }
      }
      
      console.log(`[ProgressSocket] Unsubscribed from task:${taskId}`);
    };
  }

  /**
   * Subscribe to project progress updates
   */
  subscribeToProject(projectId: number, callback: (data: ProgressUpdateData) => void): () => void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[ProgressSocket] Not connected, cannot subscribe to project:', projectId);
      return () => {}; // Return no-op cleanup
    }

    const eventName = `project:progress:${projectId}`;
    
    // Register subscription
    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, new Set());
    }
    this.subscriptions.get(eventName)!.add(callback);

    // Subscribe on server
    this.socket.emit('subscribe:project', { projectId });
    
    // Listen for updates
    this.socket.on(eventName, callback);
    
    console.log(`[ProgressSocket] Subscribed to project:${projectId}`);

    // Return cleanup function
    return () => {
      if (!this.socket) return;
      
      this.socket.emit('unsubscribe:project', { projectId });
      this.socket.off(eventName, callback);
      
      const subs = this.subscriptions.get(eventName);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(eventName);
        }
      }
      
      console.log(`[ProgressSocket] Unsubscribed from project:${projectId}`);
    };
  }

  /**
   * Disconnect from progress socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscriptions.clear();
      console.log('[ProgressSocket] Disconnected');
    }
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const progressSocketManager = new ProgressSocketManager();
export default progressSocketManager;
