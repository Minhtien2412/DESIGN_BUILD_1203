/**
 * Video Call Service
 * WebRTC-based video calls for project meetings
 */

import { apiClient } from './client';

// ==================== TYPES ====================

export interface CreateRoomDto {
  name: string;
  projectId?: number;
  maxParticipants?: number;
  isRecorded?: boolean;
  scheduledAt?: string;
  description?: string;
}

export interface VideoRoom {
  id: number;
  name: string;
  projectId?: number;
  maxParticipants: number;
  isRecorded: boolean;
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  description?: string;
  createdBy: number;
  participants: RoomParticipant[];
  recordingUrl?: string;
}

export interface RoomParticipant {
  userId: number;
  userName: string;
  joinedAt: string;
  leftAt?: string;
  role: 'HOST' | 'PARTICIPANT';
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface VideoToken {
  token: string;
  roomId: number;
  userId: number;
  expiresAt: string;
  iceServers: {
    urls: string[];
    username?: string;
    credential?: string;
  }[];
}

export interface UpdateRoomDto {
  name?: string;
  maxParticipants?: number;
  isRecorded?: boolean;
  scheduledAt?: string;
  description?: string;
}

export interface RoomStatistics {
  roomId: number;
  duration: number;
  participantCount: number;
  peakParticipants: number;
  recordingSize?: number;
  averageQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

// ==================== SERVICE ====================

export const videoService = {
  /**
   * Create new video call room
   */
  async createRoom(data: CreateRoomDto): Promise<VideoRoom> {
    return apiClient.post<VideoRoom>('/video/rooms', data);
  },

  /**
   * Get all video rooms
   */
  async getRooms(params?: {
    projectId?: number;
    status?: 'SCHEDULED' | 'ACTIVE' | 'ENDED';
    page?: number;
    limit?: number;
  }): Promise<{ data: VideoRoom[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.projectId = String(params.projectId);
    if (params?.status) queryParams.status = params.status;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    return apiClient.get<{ data: VideoRoom[]; total: number }>('/video/rooms', queryParams);
  },

  /**
   * Get specific room details
   */
  async getRoom(roomId: number): Promise<VideoRoom> {
    return apiClient.get<VideoRoom>(`/video/rooms/${roomId}`);
  },

  /**
   * Update room details
   */
  async updateRoom(roomId: number, data: UpdateRoomDto): Promise<VideoRoom> {
    return apiClient.patch<VideoRoom>(`/video/rooms/${roomId}`, data);
  },

  /**
   * Delete room
   */
  async deleteRoom(roomId: number): Promise<void> {
    return apiClient.delete(`/video/rooms/${roomId}`);
  },

  /**
   * Get access token for joining room
   */
  async getToken(roomId: number): Promise<VideoToken> {
    return apiClient.post<VideoToken>(`/video/rooms/${roomId}/token`);
  },

  /**
   * Join video room
   */
  async joinRoom(roomId: number): Promise<VideoToken> {
    return apiClient.post<VideoToken>(`/video/rooms/${roomId}/join`);
  },

  /**
   * Leave video room
   */
  async leaveRoom(roomId: number): Promise<void> {
    return apiClient.post(`/video/rooms/${roomId}/leave`);
  },

  /**
   * Start recording
   */
  async startRecording(roomId: number): Promise<{ recordingId: string }> {
    return apiClient.post<{ recordingId: string }>(`/video/rooms/${roomId}/recording/start`);
  },

  /**
   * Stop recording
   */
  async stopRecording(roomId: number): Promise<{
    recordingId: string;
    recordingUrl: string;
  }> {
    return apiClient.post<{
      recordingId: string;
      recordingUrl: string;
    }>(`/video/rooms/${roomId}/recording/stop`);
  },

  /**
   * Get room statistics
   */
  async getRoomStatistics(roomId: number): Promise<RoomStatistics> {
    return apiClient.get<RoomStatistics>(`/video/rooms/${roomId}/statistics`);
  },

  /**
   * Get room participants
   */
  async getParticipants(roomId: number): Promise<RoomParticipant[]> {
    return apiClient.get<RoomParticipant[]>(`/video/rooms/${roomId}/participants`);
  },

  /**
   * Remove participant from room (host only)
   */
  async removeParticipant(roomId: number, userId: number): Promise<void> {
    return apiClient.delete(`/video/rooms/${roomId}/participants/${userId}`);
  },

  /**
   * Mute participant (host only)
   */
  async muteParticipant(roomId: number, userId: number): Promise<void> {
    return apiClient.post(`/video/rooms/${roomId}/participants/${userId}/mute`);
  },

  /**
   * End room (host only)
   */
  async endRoom(roomId: number): Promise<VideoRoom> {
    return apiClient.post<VideoRoom>(`/video/rooms/${roomId}/end`);
  },

  /**
   * Get user's upcoming scheduled rooms
   */
  async getUpcomingRooms(): Promise<VideoRoom[]> {
    return apiClient.get<VideoRoom[]>('/video/rooms/upcoming');
  },

  /**
   * Get active rooms
   */
  async getActiveRooms(): Promise<VideoRoom[]> {
    return apiClient.get<VideoRoom[]>('/video/rooms/active');
  },

  /**
   * Get room recordings
   */
  async getRecordings(params?: {
    projectId?: number;
    roomId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: {
      id: string;
      roomId: number;
      roomName: string;
      url: string;
      duration: number;
      size: number;
      createdAt: string;
    }[];
    total: number;
  }> {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.projectId = String(params.projectId);
    if (params?.roomId) queryParams.roomId = String(params.roomId);
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    return apiClient.get<{
      data: {
        id: string;
        roomId: number;
        roomName: string;
        url: string;
        duration: number;
        size: number;
        createdAt: string;
      }[];
      total: number;
    }>('/video/recordings', queryParams);
  },
};

export default videoService;
