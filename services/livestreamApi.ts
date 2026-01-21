/**
 * Livestream API Service
 * Construction site live streaming
 */

import { apiFetch } from './api';

export interface LiveStream {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description?: string;
  status: 'live' | 'scheduled' | 'ended';
  startTime: string;
  endTime?: string;
  duration?: number;
  streamUrl: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  viewerCount: number;
  recordingUrl?: string;
  camera?: {
    id: string;
    name: string;
    location: string;
  };
  host?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface StreamMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'alert';
}

export interface StreamViewer {
  id: string;
  name: string;
  joinedAt: string;
  isHost: boolean;
}

export interface StreamRecording {
  id: string;
  streamId: string;
  title: string;
  duration: number;
  thumbnailUrl: string;
  recordingUrl: string;
  createdAt: string;
  views: number;
  projectId: string;
  projectName: string;
}

export interface StreamAnalytics {
  streamId: string;
  totalViews: number;
  peakViewers: number;
  averageWatchTime: number;
  totalWatchTime: number;
  viewersByTime: {
    timestamp: string;
    viewers: number;
  }[];
  topViewers: {
    userId: string;
    userName: string;
    watchTime: number;
  }[];
}

class LivestreamService {
  /**
   * Get all live streams
   */
  async getStreams(filters?: {
    status?: string;
    projectId?: string;
  }): Promise<{ streams: LiveStream[]; total: number }> {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await apiFetch(`/livestream/streams?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load streams: ${error.message}`);
    }
  }

  /**
   * Get stream by ID
   */
  async getStream(id: string): Promise<LiveStream> {
    try {
      const response = await apiFetch(`/livestream/streams/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load stream: ${error.message}`);
    }
  }

  /**
   * Start a new live stream
   */
  async startStream(data: {
    projectId: string;
    title: string;
    description?: string;
    cameraId?: string;
  }): Promise<LiveStream> {
    try {
      const response = await apiFetch('/livestream/streams/start', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to start stream: ${error.message}`);
    }
  }

  /**
   * Stop a live stream
   */
  async stopStream(id: string): Promise<void> {
    try {
      await apiFetch(`/livestream/streams/${id}/stop`, {
        method: 'POST',
      });
    } catch (error: any) {
      throw new Error(`Failed to stop stream: ${error.message}`);
    }
  }

  /**
   * Get stream messages (chat)
   */
  async getMessages(streamId: string, limit = 50): Promise<{
    messages: StreamMessage[];
    total: number;
  }> {
    try {
      const response = await apiFetch(
        `/livestream/streams/${streamId}/messages?limit=${limit}`
      );
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load messages: ${error.message}`);
    }
  }

  /**
   * Send chat message
   */
  async sendMessage(
    streamId: string,
    message: string
  ): Promise<StreamMessage> {
    try {
      const response = await apiFetch(`/livestream/streams/${streamId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Get active viewers
   */
  async getViewers(streamId: string): Promise<{
    viewers: StreamViewer[];
    total: number;
  }> {
    try {
      const response = await apiFetch(`/livestream/streams/${streamId}/viewers`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load viewers: ${error.message}`);
    }
  }

  /**
   * Join stream as viewer
   */
  async joinStream(streamId: string): Promise<void> {
    try {
      await apiFetch(`/livestream/streams/${streamId}/join`, {
        method: 'POST',
      });
    } catch (error: any) {
      throw new Error(`Failed to join stream: ${error.message}`);
    }
  }

  /**
   * Leave stream
   */
  async leaveStream(streamId: string): Promise<void> {
    try {
      await apiFetch(`/livestream/streams/${streamId}/leave`, {
        method: 'POST',
      });
    } catch (error: any) {
      throw new Error(`Failed to leave stream: ${error.message}`);
    }
  }

  /**
   * Get recorded streams
   */
  async getRecordings(filters?: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ recordings: StreamRecording[]; total: number }> {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await apiFetch(`/livestream/recordings?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load recordings: ${error.message}`);
    }
  }

  /**
   * Get stream analytics
   */
  async getAnalytics(streamId: string): Promise<StreamAnalytics> {
    try {
      const response = await apiFetch(`/livestream/streams/${streamId}/analytics`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load analytics: ${error.message}`);
    }
  }

  /**
   * Delete recording
   */
  async deleteRecording(id: string): Promise<void> {
    try {
      await apiFetch(`/livestream/recordings/${id}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      throw new Error(`Failed to delete recording: ${error.message}`);
    }
  }

  /**
   * Schedule a future stream
   */
  async scheduleStream(data: {
    projectId: string;
    title: string;
    description?: string;
    scheduledTime: string;
  }): Promise<LiveStream> {
    try {
      const response = await apiFetch('/livestream/streams/schedule', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to schedule stream: ${error.message}`);
    }
  }
}

export const livestreamService = new LivestreamService();
