// Integration layer between existing API service and new enhanced features
// Provides a migration path while maintaining backward compatibility

import { handleApiError } from '../utils/errorHandler';
import { apiFetch } from './api';
import { apiClient } from './enhancedApi';
import { livekitService } from './livekitService';
import offlineQueue from './offlineQueue';
import socketManager from './socketManager';

// Runtime configuration interface
export interface AppConfig {
  livekitUrl: string;
  tokenEndpoint: string;
  appName: string;
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  features: {
    recording: boolean;
    chat: boolean;
    screenShare: boolean;
  };
  version: string;
  maxParticipants: number;
  roomTimeout: number;
}

// Minimal LiveKit room shape used by UI components
export interface LiveKitRoom {
  id?: string;
  name?: string;
  url?: string;
  token?: string;
  egressId?: string;
  participants?: number;
}

// Enhanced API wrapper that combines existing and new functionality
class IntegratedApiService {
  private config: AppConfig | null = null;

  // Load runtime configuration from server
  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await apiClient.get('/config');
      this.config = response.data;
      return this.config!;
    } catch (error) {
      console.warn('Failed to load config, using fallback:', error);
      
      // Fallback configuration
      this.config = {
        livekitUrl: 'wss://api.thietkeresort.com.vn/livekit',
        tokenEndpoint: '/rooms',
        appName: 'ThietKeResort App',
        logLevel: 'info',
        features: { recording: true, chat: true, screenShare: true },
        version: 'fallback',
        maxParticipants: 50,
        roomTimeout: 300
      };
      return this.config;
    }
  }

  // Force reload configuration
  reloadConfig(): void {
    this.config = null;
  }

  // Get current configuration
  getConfig(): AppConfig | null {
    return this.config;
  }

  // Initialize real-time features
  async initialize(token?: string) {
    // Load configuration first
    await this.loadConfig();
    
    await offlineQueue.initialize();
    
    if (token && socketManager) {
      socketManager.connect({
        token,
        onMessage: (message) => {
          // Handle incoming messages - can be integrated with your state management
          console.log('New message received:', message);
        },
        onNotification: (notification) => {
          // Handle system notifications
          console.log('New notification:', notification);
        },
      });
    }
  }

  // Authentication methods (enhanced)
  async login(credentials: { email: string; password: string }) {
    try {
      const result = await apiClient.login(credentials);
      
      // Initialize real-time features after successful login
      await this.initialize(result.accessToken);
      
      return result;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async logout() {
    try {
      await apiClient.logout();
    } finally {
      // Cleanup real-time connections
      socketManager.disconnect();
      await offlineQueue.clearQueue();
    }
  }

  // Profile methods (using enhanced client)
  async getProfile() {
    return apiClient.getProfile();
  }

  async updateProfile(data: any) {
    return apiClient.updateProfile(data);
  }

  // Chat methods with real-time support
  async getChats() {
    return apiClient.getChats();
  }

  async createChat(data: { type: string; members: string[]; name?: string }) {
    return apiClient.createChat(data);
  }

  async getChatMessages(chatId: string, cursor?: string, limit = 50) {
    return apiClient.getChatMessages(chatId, cursor, limit);
  }

  async sendMessage(chatId: string, payload: { type: 'text' | 'image' | 'file'; body: string; metadata?: any }) {
    const clientId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add client ID for deduplication
    const messagePayload = { ...payload, clientId };

    // Try to send via socket first for immediate delivery
    if (socketManager.isConnected()) {
      try {
        const result = await socketManager.sendMessage(chatId, messagePayload);
        return result;
      } catch (error) {
        console.warn('Socket send failed, queuing message:', error);
        // Fall through to offline queue
      }
    }

    // Add to offline queue if socket fails or not connected
    const queueId = await offlineQueue.addMessage({
      chatId,
      type: payload.type as 'text' | 'image' | 'file',
      body: payload.body,
      metadata: payload.metadata,
      clientId,
      maxRetries: 3,
    });

    return { ok: true, queueId, clientId };
  }

  async markMessageAsRead(chatId: string, messageId: string) {
    // Send via socket for real-time update
    socketManager.markMessageAsRead(chatId, messageId);
    
    // Also call REST API as backup
    try {
      await apiClient.markMessageAsRead(chatId, messageId);
    } catch (error) {
      console.warn('Failed to mark message as read via REST:', error);
    }
  }

  // File upload with enhanced error handling
  async uploadFile(file: any, mimeType: string, prefix?: string) {
    try {
      const presign = await apiClient.getPresignedUpload({ mime: mimeType, prefix });
      
      const formData = new FormData();
      
      // Add presigned fields
      Object.entries(presign.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      // Add file
      formData.append('file', file);
      
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      return presign.fileUrl;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Notifications with push token registration
  async getNotifications(cursor?: string, limit = 50) {
    return apiClient.getNotifications(cursor, limit);
  }

  async registerPushToken(token: string, platform: string, deviceId?: string) {
    return apiClient.registerPushToken({ token, platform, deviceId });
  }

  // Legacy API compatibility - delegate to existing apiFetch  
  async legacyFetch(path: string, options?: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; headers?: Record<string, string>; body?: any }) {
    return apiFetch(path, options);
  }

  // Utility methods
  getConnectionStatus() {
    return {
      socket: socketManager.isConnected(),
      api: true, // Could add actual API health check
      queue: offlineQueue.getQueueStats(),
    };
  }

  async retryFailedMessages() {
    const failed = offlineQueue.getFailedMessages();
    for (const message of failed) {
      await offlineQueue.retryMessage(message.id);
    }
  }

  // Event listeners for real-time updates
  onMessage(callback: (message: any) => void) {
    socketManager.on('message:new', callback);
  }

  onMessageRead(callback: (data: any) => void) {
    socketManager.on('message:read', callback);
  }

  onNotification(callback: (notification: any) => void) {
    socketManager.on('notification', callback);
  }

  onQueueUpdate(callback: (stats: any) => void) {
    offlineQueue.on('message:sent', callback);
    offlineQueue.on('message:failed', callback);
  }

  // LiveKit Video Conference Methods
  async createVideoRoom(options: { name: string; maxParticipants?: number; emptyTimeout?: number }) {
    try {
      return await livekitService.createRoom(options);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async setupDailySync(userId: string) {
    try {
      if (livekitService && typeof (livekitService as any).setupDailySync === 'function') {
        return await (livekitService as any).setupDailySync(userId);
      }
      return { url: undefined, token: undefined } as LiveKitRoom;
    } catch (error) {
      console.warn('setupDailySync failed:', error);
      return { url: undefined, token: undefined } as LiveKitRoom;
    }
  }

  async joinVideoRoom(roomName: string, identity?: string) {
    try {
      return await livekitService.getRoomToken(
        roomName,
        identity || `user_${Date.now()}`
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
  async startVideoRecording(roomName: string) {
    try {
      if (livekitService && typeof (livekitService as any).startRecording === 'function') {
        return await (livekitService as any).startRecording(roomName);
      }
      // Recording not available - return a safe placeholder
      return { egressId: undefined } as any;
    } catch (error) {
      console.warn('startVideoRecording failed:', error);
      throw handleApiError(error);
    }
  }

  async stopVideoRecording(egressId: string) {
    try {
      if (livekitService && typeof (livekitService as any).stopRecording === 'function') {
        return await (livekitService as any).stopRecording(egressId);
      }
      return { ok: false } as any;
    } catch (error) {
      console.warn('stopVideoRecording failed:', error);
      throw handleApiError(error);
    }
  }

  async listVideoRooms() {
    try {
      if (livekitService && typeof (livekitService as any).listRooms === 'function') {
        return await (livekitService as any).listRooms();
      }
      return [] as LiveKitRoom[];
    } catch (error) {
      console.warn('listVideoRooms failed:', error);
      return [] as LiveKitRoom[];
    }
  }

  async setupProjectMeeting(projectId: string, userId: string) {
    try {
      if (livekitService && typeof (livekitService as any).setupProjectMeeting === 'function') {
        return await (livekitService as any).setupProjectMeeting(projectId, userId);
      }
      return { url: undefined, token: undefined } as LiveKitRoom;
    } catch (error) {
      console.warn('setupProjectMeeting failed:', error);
      return { url: undefined, token: undefined } as LiveKitRoom;
    }
  }

  async setupClientConsultation(clientId: string, consultantId: string) {
    try {
      if (livekitService && typeof (livekitService as any).setupClientConsultation === 'function') {
        return await (livekitService as any).setupClientConsultation(clientId, consultantId);
      }
      return { url: undefined, token: undefined } as LiveKitRoom;
    } catch (error) {
      console.warn('setupClientConsultation failed:', error);
      return { url: undefined, token: undefined } as LiveKitRoom;
    }
  }

  // Cleanup
  disconnect() {
    socketManager.disconnect();
    offlineQueue.destroy();
  }
}

// Create singleton instance
export const integratedApi = new IntegratedApiService();

// Export for easy import
export default integratedApi;

// Export individual services for advanced usage
export { apiClient, livekitService, offlineQueue, socketManager };

// Export types from enhanced API
  export type { AuthTokens, LoginCredentials, LoginResponse } from './enhancedApi';
    export type { CreateRoomRequest } from './livekitService';
    export type { QueuedMessage, QueueStats } from './offlineQueue';
    export type { Message, SocketConfig } from './socketManager';

