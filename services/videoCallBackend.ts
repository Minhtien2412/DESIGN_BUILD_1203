import { useAuth } from '@/context/AuthContext';
import { ApiError, apiFetch } from '@/services/api';
import { listAllUsers } from '@/services/auth';
import { getToken } from '@/utils/storage';
import React from 'react';

// Integration with existing backend authentication
export interface VideoCallSession {
  id: string;
  roomId: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'host' | 'participant';
    joinedAt: string;
    status: 'online' | 'offline' | 'connecting';
  }[];
  status: 'waiting' | 'active' | 'ended';
  createdAt: string;
  endedAt?: string;
  duration?: number;
  recordingUrl?: string;
}

export interface VideoCallNotification {
  id: string;
  type: 'incoming_call' | 'call_ended' | 'participant_joined' | 'participant_left';
  fromUserId: string;
  fromUserName: string;
  roomId: string;
  timestamp: string;
  data?: any;
}

export interface CallHistoryItem {
  id: string;
  roomId: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  type: 'incoming' | 'outgoing' | 'missed';
  isGroupCall: boolean;
  duration: number; // in seconds
  timestamp: string;
  status: 'completed' | 'missed' | 'cancelled' | 'declined';
}

export class VideoCallBackendService {
  private baseUrl: string;
  private authToken: string | null = null;
  private static syntheticContactsCache: { at: number; data: { id: string; name: string; avatar?: string; status: 'online' | 'busy' | 'away' | 'offline'; lastSeen?: string; }[] } | null = null;
  private static SYNTH_CONTACT_TTL = 60_000; // 60s reuse window

  constructor(baseUrl?: string) {
    // Use unified API service baseURL
    if (!baseUrl) {
      const { API_BASE } = require('./api');
      this.baseUrl = API_BASE;
    } else {
      this.baseUrl = baseUrl;
    }
  }

  // Initialize with auth token from API server (safe fallback)
  async initialize(existingToken?: string) {
    // Use existing token if provided (from AuthContext)
    if (existingToken) {
      this.authToken = existingToken;
      return;
    }

    try {
      // Use /auth/me to get current auth status instead of /auth/token
      const response = await apiFetch('/auth/me') as { sub?: string; email?: string };
      this.authToken = response.sub || response.email || 'authenticated';
    } catch (error: any) {
      const msg = String(error?.message || '');
      const is404 = error?.status === 404 || msg.toLowerCase().includes('not found');
      const isDevUnavailable = msg.includes('Development server not available');
      const isNetworkError = msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND');

      if (is404 || isDevUnavailable || isNetworkError) {
        console.log('[VideoCallBackend] /auth/me endpoint unavailable → continuing without token');
      } else {
        console.warn('[VideoCallBackend] Failed to get auth status from API server:', error);
      }
      this.authToken = null;
    }
  }

  // Set auth token from external source (like AuthContext)
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Create a new video call session
  async createCallSession(roomId: string, participantIds: string[]): Promise<VideoCallSession> {
    try {
      const response = await apiFetch('/video-call/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          roomId,
          participantIds,
        },
      });
      return response as VideoCallSession;
    } catch (error) {
      console.error('Failed to create call session:', error);
      throw error;
    }
  }

  // Join existing call session
  async joinCallSession(sessionId: string): Promise<VideoCallSession> {
    try {
      const response = await apiFetch(`/video-call/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
      return response as VideoCallSession;
    } catch (error) {
      console.error('Failed to join call session:', error);
      throw error;
    }
  }

  // End call session
  async endCallSession(sessionId: string): Promise<void> {
    try {
      await apiFetch(`/video-call/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to end call session:', error);
      throw error;
    }
  }

  // Get call history
  async getCallHistory(limit = 50, offset = 0): Promise<CallHistoryItem[]> {
    try {
      const response = await apiFetch(
        `/video-call/history?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
          },
        }
      );

      const sessions = (response as any).sessions || [];

      const mapped: CallHistoryItem[] = sessions.map((session: any) => ({
        id: session.id,
        roomId: session.roomId,
        participants: session.participants || [],
        type: this.determineCallType(session),
        isGroupCall: (session.participants?.length || 0) > 2,
        duration: session.duration || 0,
        timestamp: session.createdAt || session.timestamp || new Date().toISOString(),
        status: session.status === 'ended' ? 'completed' : session.status || 'completed',
      }));

      // Store call history via API server only
      await apiFetch('/video-call/history/cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        data: { history: mapped.slice(0, 100) }
      });
      return mapped;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // Backend chưa triển khai – return empty for now
        console.warn('Video call history endpoint not implemented yet');
        return [];
      }
      if (!(error instanceof ApiError && error.status === 404)) {
        console.error('[videoCallBackend] getCallHistory unexpected error', error);
      }
      return [];
    }
  }

  // Delete specific call from history
  async deleteCallFromHistory(callId: string): Promise<void> {
    try {
      await apiFetch(`/video-call/history/${callId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to delete call from history:', error);
      throw error;
    }
  }

  // Clear all call history for user
  async clearCallHistory(): Promise<void> {
    try {
      await apiFetch('/video-call/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to clear call history:', error);
      throw error;
    }
  }

  // Helper to determine call type based on session data
  private determineCallType(session: any): 'incoming' | 'outgoing' | 'missed' {
    // Implementation would depend on your auth system
    // For now, return 'outgoing' as default
    const currentUserId = 'current-user-id'; // Get from auth context
    
    if (session.createdBy === currentUserId) {
      return 'outgoing';
    }
    
    if (session.status === 'missed' || session.status === 'declined') {
      return 'missed';
    }
    
    return 'incoming';
  }

  // Send call invitation to users
  async sendCallInvitation(roomId: string, userIds: string[], message?: string): Promise<void> {
    try {
      await apiFetch('/video-call/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          roomId,
          userIds,
          message: message || 'Bạn được mời tham gia cuộc gọi video',
        },
      });
    } catch (error) {
      console.error('Failed to send call invitation:', error);
      throw error;
    }
  }

  // Get ICE servers configuration from backend
  async getIceServersConfig(): Promise<RTCIceServer[]> {
    try {
      const response = await apiFetch('/video-call/ice-config', {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
      return (response as any).iceServers || [];
    } catch (error) {
      console.error('Failed to get ICE servers config:', error);
      // Fallback to default STUN servers
      return [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ];
    }
  }

  // Update user presence status
  async updatePresenceStatus(status: 'online' | 'busy' | 'away' | 'offline'): Promise<void> {
    // Skip remote presence update entirely if remote contacts disabled (prevents 404 noise when backend not ready)
    if ((global as any).AppConfig?.DISABLE_REMOTE_CONTACTS || require('@/config').AppConfig.DISABLE_REMOTE_CONTACTS) {
      return;
    }
    try {
      await apiFetch('/users/presence', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        data: { status },
      });
    } catch (error) {
      console.error('Failed to update presence status:', error);
    }
  }

  // Get user contact list with presence info
  async getContactsWithPresence(): Promise<{
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'busy' | 'away' | 'offline';
    lastSeen?: string;
  }[]> {
    // If feature flag disables remote contacts, synthesize immediately
    if ((global as any).AppConfig?.DISABLE_REMOTE_CONTACTS || require('@/config').AppConfig.DISABLE_REMOTE_CONTACTS) {
      const cached = VideoCallBackendService.syntheticContactsCache;
      const now = Date.now();
      if (cached && (now - cached.at) < VideoCallBackendService.SYNTH_CONTACT_TTL) {
        return cached.data;
      }
      try {
        const users = await listAllUsers();
        const third = Math.max(1, Math.floor(users.length / 3));
        const data: { id: string; name: string; avatar?: string; status: 'online' | 'busy' | 'away' | 'offline'; lastSeen: string; }[] = users.slice(0, 18).map((u, idx) => ({
          id: u.id,
          name: u.name || u.phone || u.id,
          avatar: undefined,
          status: (idx < third ? 'online' : idx < third * 2 ? 'away' : 'offline'),
          lastSeen: new Date(Date.now() - idx * 60000).toISOString(),
        }));
        VideoCallBackendService.syntheticContactsCache = { at: now, data };
        return data;
      } catch {
        return [];
      }
    }
    // Throttle repeated 401 invalid token calls for 30s to avoid noise
    const authFailKey = '__contacts_auth_fail_at';
    const nowMs = Date.now();
    const lastFail = (VideoCallBackendService as any)[authFailKey] as number | undefined;
    if (lastFail && nowMs - lastFail < 30_000) {
      const cached = VideoCallBackendService.syntheticContactsCache;
      if (cached && (nowMs - cached.at) < VideoCallBackendService.SYNTH_CONTACT_TTL) return cached.data;
      // Reuse synthetic generation fast path
      try {
        const users = await listAllUsers();
        const third = Math.max(1, Math.floor(users.length / 3));
        const data: { id: string; name: string; avatar?: string; status: 'online' | 'busy' | 'away' | 'offline'; lastSeen: string; }[] = users.slice(0, 18).map((u, idx) => ({
          id: u.id,
          name: u.name || u.phone || u.id,
          avatar: undefined,
          status: (idx < third ? 'online' : idx < third * 2 ? 'away' : 'offline'),
          lastSeen: new Date(Date.now() - idx * 60000).toISOString(),
        }));
        VideoCallBackendService.syntheticContactsCache = { at: nowMs, data };
        return data;
      } catch { return []; }
    }
    try {
      const response = await apiFetch('/users/contacts', {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
      return (response as any).contacts || [];
    } catch (error) {
      const apiErr = error as ApiError;
      const isApiErr = error instanceof ApiError;
      const unauthorized = isApiErr && apiErr.status === 401;
      if (unauthorized) {
        // Mark throttled window
        (VideoCallBackendService as any)[authFailKey] = Date.now();
      }
      const shouldFallback = (isApiErr && (apiErr.status === 404 || apiErr.status === 401)) || unauthorized;
      const isNetwork = !(error instanceof ApiError); // network or aborted
      if (shouldFallback || isNetwork) {
        // Silent fallback: synthesize contact list from local demo users
        try {
          const cached = VideoCallBackendService.syntheticContactsCache;
          const now = Date.now();
          if (cached && (now - cached.at) < VideoCallBackendService.SYNTH_CONTACT_TTL) return cached.data;
          const users = await listAllUsers();
          const third = Math.max(1, Math.floor(users.length / 3));
          const data: { id: string; name: string; avatar?: string; status: 'online' | 'busy' | 'away' | 'offline'; lastSeen: string; }[] = users.slice(0, 18).map((u, idx) => ({
            id: u.id,
            name: u.name || u.phone || u.id,
            avatar: undefined,
            status: (idx < third ? 'online' : idx < third * 2 ? 'away' : 'offline'),
            lastSeen: new Date(Date.now() - idx * 60000).toISOString(),
          }));
          VideoCallBackendService.syntheticContactsCache = { at: now, data };
          return data;
        } catch {}
        return [];
      }
      if (__DEV__) console.error('[videoCallBackend] getContactsWithPresence unexpected error', isApiErr ? { status: apiErr.status, data: apiErr.data } : error);
      return [];
    }
  }

  // Search users for adding to call
  async searchUsers(query: string): Promise<{
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  }[]> {
    try {
      const response = await apiFetch(`/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
      return (response as any).users || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  // Report call quality feedback
  async reportCallQuality(sessionId: string, feedback: {
    rating: 1 | 2 | 3 | 4 | 5;
    issues?: string[];
    comment?: string;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
    audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
    videoQuality: 'excellent' | 'good' | 'fair' | 'poor';
  }): Promise<void> {
    try {
      await apiFetch(`/video-call/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        data: feedback,
      });
    } catch (error) {
      console.error('Failed to submit call feedback:', error);
    }
  }

  // Get call notifications
  async getCallNotifications(limit = 20): Promise<VideoCallNotification[]> {
    try {
      const response = await apiFetch(
        `/video-call/notifications?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
          },
        }
      );
      return (response as any).notifications || [];
    } catch (error) {
      console.error('Failed to get call notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await apiFetch(`/video-call/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }
}

// Hook for using video call backend service
export function useVideoCallBackend() {
  const { user, isAuthenticated } = useAuth();
  const [service] = React.useState(() => new VideoCallBackendService());

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!cancelled) {
          await service.initialize(token ?? undefined);
        }
      } catch {
        if (!cancelled) await service.initialize();
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, service]);

  // Method để set token từ AuthContext
  const setAuthToken = React.useCallback((authToken: string | null) => {
    service.setAuthToken(authToken);
  }, [service]);

  return {
    service,
    user,
    isAuthenticated,
    setAuthToken,
  };
}

// Real-time integration with existing notification system
export function useVideoCallNotifications() {
  const [notifications, setNotifications] = React.useState<VideoCallNotification[]>([]);
  const { service, isAuthenticated } = useVideoCallBackend();

  React.useEffect(() => {
    if (!isAuthenticated) return;

    // Load initial notifications
    const loadNotifications = async () => {
      const notifs = await service.getCallNotifications();
      setNotifications(notifs);
    };

    loadNotifications();

    // Set up real-time listener (integrate with existing NotificationContext)
    // This would connect to your existing WebSocket/Socket.IO connection
    const handleVideoCallNotification = (notification: VideoCallNotification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    // Integration point with existing notification system
    // window.addEventListener('video-call-notification', handleVideoCallNotification);

    return () => {
      // window.removeEventListener('video-call-notification', handleVideoCallNotification);
    };
  }, [isAuthenticated, service]);

  const markAsRead = async (notificationId: string) => {
    await service.markNotificationRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  return {
    notifications,
    markAsRead,
  };
}

// Integration with existing chat/messaging system
export class VideoCallChatIntegration {
  private backendService: VideoCallBackendService;

  constructor(backendService: VideoCallBackendService) {
    this.backendService = backendService;
  }

  // Start video call from chat conversation
  async startCallFromChat(conversationId: string, participantIds: string[]): Promise<string> {
    const roomId = `chat-${conversationId}-${Date.now()}`;
    
    // Create call session
    await this.backendService.createCallSession(roomId, participantIds);
    
    // Send call invitation
    await this.backendService.sendCallInvitation(
      roomId, 
      participantIds, 
      'Bạn được mời tham gia cuộc gọi video từ cuộc trò chuyện'
    );

    return roomId;
  }

  // Send video call message to chat
  async sendCallMessage(conversationId: string, callSessionId: string, action: 'started' | 'ended' | 'missed'): Promise<void> {
    // This would integrate with your existing chat message system
    const message = {
      type: 'video_call',
      content: {
        action,
        sessionId: callSessionId,
        timestamp: new Date().toISOString(),
      },
    };

    // Send to chat API
    // await chatService.sendMessage(conversationId, message);
  }
}

export default VideoCallBackendService;
