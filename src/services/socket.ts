import Constants from 'expo-constants';
import io from 'socket.io-client';
import { getAuthState } from '../store/auth';

type SocketType = ReturnType<typeof io>;

class SocketService {
  private socket: SocketType | null = null;
  private url: string;

  constructor() {
    const extra = Constants?.expoConfig?.extra || {};
    const DEFAULT_WS_URL = 'wss://api.thietkeresort.com.vn/ws';
    this.url = extra.EXPO_PUBLIC_WS_URL || extra.WS_URL || DEFAULT_WS_URL;
  }

  connect(): SocketType {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const { accessToken } = getAuthState();
    
    this.socket = io(this.url, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', (reason: any) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });
  }

  // Message events
  onNewMessage(callback: (message: any) => void): void {
    this.socket?.on('new_message', callback);
  }

  sendMessage(data: { conversationId: string; content: string; type?: string }): void {
    this.socket?.emit('send_message', data);
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('leave_conversation', { conversationId });
  }

  // Project events
  onProjectUpdate(callback: (project: any) => void): void {
    this.socket?.on('project_update', callback);
  }

  joinProject(projectId: string): void {
    this.socket?.emit('join_project', { projectId });
  }

  leaveProject(projectId: string): void {
    this.socket?.emit('leave_project', { projectId });
  }

  // User presence
  onUserStatusChange(callback: (data: { userId: string; status: 'online' | 'offline' }) => void): void {
    this.socket?.on('user_status_change', callback);
  }

  // Notifications
  onNotification(callback: (notification: any) => void): void {
    this.socket?.on('notification', callback);
  }

  // Generic event handlers
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;