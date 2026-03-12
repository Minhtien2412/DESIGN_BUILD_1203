/**
 * Live Stream Service
 * Real-time construction site livestreaming
 */

import { apiClient } from './client';

// ==================== TYPES ====================

export interface LiveStream {
  id: number;
  title: string;
  description?: string;
  projectId?: number;
  streamKey: string;
  streamUrl: string;
  playbackUrl: string;
  thumbnail?: string;
  status: 'PREPARING' | 'LIVE' | 'ENDED';
  viewCount: number;
  peakViewers: number;
  duration: number;
  startedAt?: string;
  endedAt?: string;
  createdBy: number;
  creator: {
    id: number;
    name: string;
    avatar?: string;
  };
  recordingUrl?: string;
  isRecording: boolean;
  tags: string[];
}

export interface CreateLiveStreamDto {
  title: string;
  description?: string;
  projectId?: number;
  isRecording?: boolean;
  tags?: string[];
}

export interface LiveStreamViewer {
  id: number;
  userId?: number;
  userName?: string;
  userAvatar?: string;
  joinedAt: string;
  isAnonymous: boolean;
}

export interface LiveStreamComment {
  id: number;
  streamId: number;
  userId?: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface LiveStreamStats {
  streamId: number;
  currentViewers: number;
  totalViews: number;
  peakViewers: number;
  duration: number;
  comments: number;
  likes: number;
  averageWatchTime: number;
}

// ==================== SERVICE ====================

export const liveStreamService = {
  /**
   * Create new livestream
   */
  async createStream(data: CreateLiveStreamDto): Promise<LiveStream> {
    return apiClient.post<LiveStream>('/live/streams', data);
  },

  /**
   * Get all active livestreams
   */
  async getLiveStreams(params?: {
    projectId?: number;
    status?: 'LIVE' | 'ENDED';
    limit?: number;
    offset?: number;
  }): Promise<{ data: LiveStream[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.projectId = String(params.projectId);
    if (params?.status) queryParams.status = params.status;
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.offset) queryParams.offset = String(params.offset);

    return apiClient.get<{ data: LiveStream[]; total: number }>('/live/streams', queryParams);
  },

  /**
   * Get specific stream details
   */
  async getStream(streamId: number): Promise<LiveStream> {
    return apiClient.get<LiveStream>(`/live/streams/${streamId}`);
  },

  /**
   * Start livestream
   */
  async startStream(streamId: number): Promise<LiveStream> {
    return apiClient.post<LiveStream>(`/live/streams/${streamId}/start`);
  },

  /**
   * End livestream
   */
  async endStream(streamId: number): Promise<LiveStream> {
    return apiClient.post<LiveStream>(`/live/streams/${streamId}/end`);
  },

  /**
   * Delete livestream
   */
  async deleteStream(streamId: number): Promise<void> {
    return apiClient.delete(`/live/streams/${streamId}`);
  },

  /**
   * Get stream viewers
   */
  async getViewers(streamId: number): Promise<LiveStreamViewer[]> {
    return apiClient.get<LiveStreamViewer[]>(`/live/streams/${streamId}/viewers`);
  },

  /**
   * Join as viewer
   */
  async joinStream(streamId: number): Promise<{ playbackUrl: string }> {
    return apiClient.post<{ playbackUrl: string }>(`/live/streams/${streamId}/join`);
  },

  /**
   * Leave stream
   */
  async leaveStream(streamId: number): Promise<void> {
    return apiClient.post(`/live/streams/${streamId}/leave`);
  },

  /**
   * Send comment
   */
  async sendComment(streamId: number, content: string): Promise<LiveStreamComment> {
    return apiClient.post<LiveStreamComment>(`/live/streams/${streamId}/comments`, {
      content,
    });
  },

  /**
   * Get comments
   */
  async getComments(
    streamId: number,
    params?: { limit?: number; offset?: number }
  ): Promise<{ data: LiveStreamComment[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.offset) queryParams.offset = String(params.offset);

    return apiClient.get<{ data: LiveStreamComment[]; total: number }>(
      `/live/streams/${streamId}/comments`,
      queryParams
    );
  },

  /**
   * Like stream
   */
  async likeStream(streamId: number): Promise<void> {
    return apiClient.post(`/live/streams/${streamId}/like`);
  },

  /**
   * Unlike stream
   */
  async unlikeStream(streamId: number): Promise<void> {
    return apiClient.delete(`/live/streams/${streamId}/like`);
  },

  /**
   * Get stream statistics
   */
  async getStats(streamId: number): Promise<LiveStreamStats> {
    return apiClient.get<LiveStreamStats>(`/live/streams/${streamId}/stats`);
  },

  /**
   * Get user's streams
   */
  async getMyStreams(params?: {
    status?: 'LIVE' | 'ENDED';
    limit?: number;
    offset?: number;
  }): Promise<{ data: LiveStream[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.offset) queryParams.offset = String(params.offset);

    return apiClient.get<{ data: LiveStream[]; total: number }>('/live/streams/mine', queryParams);
  },

  /**
   * Get stream recordings
   */
  async getRecordings(params?: {
    projectId?: number;
    limit?: number;
    offset?: number;
  }): Promise<{
    data: {
      id: number;
      streamId: number;
      title: string;
      thumbnail?: string;
      recordingUrl: string;
      duration: number;
      views: number;
      createdAt: string;
    }[];
    total: number;
  }> {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.projectId = String(params.projectId);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.offset) queryParams.offset = String(params.offset);

    return apiClient.get<{
      data: {
        id: number;
        streamId: number;
        title: string;
        thumbnail?: string;
        recordingUrl: string;
        duration: number;
        views: number;
        createdAt: string;
      }[];
      total: number;
    }>('/live/recordings', queryParams);
  },
};

export default liveStreamService;
