/**
 * Live Streaming Service
 * Real-time live streaming for construction project broadcasts
 * 
 * Features:
 * - Create & start live stream
 * - Join existing live streams
 * - Live viewer count
 * - Live comments/reactions
 * - Stream recording
 * - Stream quality controls
 */

import { del, get, post, put } from './apiClient';

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  streamUrl: string;
  playbackUrl: string;
  streamKey: string;
  status: 'pending' | 'live' | 'ended' | 'error';
  viewerCount: number;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  projectId?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  thumbnailUrl?: string;
  recordingUrl?: string;
  isRecording: boolean;
  settings: StreamSettings;
  createdAt: string;
  updatedAt: string;
}

export interface StreamSettings {
  quality: 'auto' | '720p' | '1080p' | '4k';
  enableChat: boolean;
  enableReactions: boolean;
  isPrivate: boolean;
  allowedViewerIds?: string[];
  maxViewers?: number;
}

export interface StreamComment {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
  createdAt: string;
}

export interface StreamReaction {
  type: 'like' | 'love' | 'wow' | 'clap';
  count: number;
  timestamp: number;
}

export interface CreateStreamData {
  title: string;
  description?: string;
  projectId?: string;
  settings?: Partial<StreamSettings>;
}

export interface StreamStats {
  streamId: string;
  peakViewers: number;
  totalViews: number;
  averageWatchTime: number;
  totalComments: number;
  totalReactions: number;
  reactionBreakdown: Record<string, number>;
}

export interface LiveStreamsParams {
  page?: number;
  limit?: number;
  status?: 'live' | 'ended' | 'all';
  projectId?: string;
  hostId?: string;
  sortBy?: 'startedAt' | 'viewerCount' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface LiveStreamsResponse {
  streams: LiveStream[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get list of live streams
 */
export async function getLiveStreams(params: LiveStreamsParams = {}): Promise<LiveStreamsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.hostId) queryParams.append('hostId', params.hostId);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.order) queryParams.append('order', params.order);

  return get<LiveStreamsResponse>(`/live-streams?${queryParams.toString()}`);
}

/**
 * Get currently live streams only
 */
export async function getCurrentLiveStreams(limit: number = 20): Promise<LiveStream[]> {
  const response = await getLiveStreams({ status: 'live', limit, sortBy: 'viewerCount', order: 'desc' });
  return response.streams;
}

/**
 * Get single live stream by ID
 */
export async function getLiveStream(id: string): Promise<LiveStream> {
  return get<LiveStream>(`/live-streams/${id}`);
}

/**
 * Create a new live stream
 */
export async function createLiveStream(data: CreateStreamData): Promise<LiveStream> {
  return post<LiveStream>('/live-streams', data);
}

/**
 * Start broadcasting a stream
 */
export async function startStream(id: string): Promise<LiveStream> {
  return put<LiveStream>(`/live-streams/${id}/start`, {});
}

/**
 * End a live stream
 */
export async function endStream(id: string): Promise<LiveStream> {
  return put<LiveStream>(`/live-streams/${id}/end`, {});
}

/**
 * Update stream settings
 */
export async function updateStreamSettings(id: string, settings: Partial<StreamSettings>): Promise<LiveStream> {
  return put<LiveStream>(`/live-streams/${id}/settings`, settings);
}

/**
 * Delete a stream
 */
export async function deleteStream(id: string): Promise<void> {
  return del<void>(`/live-streams/${id}`);
}

/**
 * Get stream statistics
 */
export async function getStreamStats(id: string): Promise<StreamStats> {
  return get<StreamStats>(`/live-streams/${id}/stats`);
}

/**
 * Get stream comments
 */
export async function getStreamComments(streamId: string, limit: number = 50): Promise<StreamComment[]> {
  return get<StreamComment[]>(`/live-streams/${streamId}/comments?limit=${limit}`);
}

/**
 * Send a comment to stream
 */
export async function sendStreamComment(streamId: string, message: string): Promise<StreamComment> {
  return post<StreamComment>(`/live-streams/${streamId}/comments`, { message });
}

/**
 * Send a reaction to stream
 */
export async function sendStreamReaction(streamId: string, type: StreamReaction['type']): Promise<void> {
  return post<void>(`/live-streams/${streamId}/reactions`, { type });
}

/**
 * Join stream as viewer (increment viewer count)
 */
export async function joinStream(streamId: string): Promise<{ playbackUrl: string; token?: string }> {
  return post<{ playbackUrl: string; token?: string }>(`/live-streams/${streamId}/join`, {});
}

/**
 * Leave stream (decrement viewer count)
 */
export async function leaveStream(streamId: string): Promise<void> {
  return post<void>(`/live-streams/${streamId}/leave`, {});
}

/**
 * Get streams for a specific project
 */
export async function getProjectStreams(projectId: string, status?: 'live' | 'ended'): Promise<LiveStream[]> {
  const response = await getLiveStreams({ projectId, status: status || 'all', limit: 100 });
  return response.streams;
}

/**
 * Get user's hosted streams
 */
export async function getMyStreams(status?: 'live' | 'ended'): Promise<LiveStream[]> {
  const response = await getLiveStreams({ status: status || 'all', limit: 100 });
  return response.streams;
}

/**
 * Report a stream
 */
export async function reportStream(streamId: string, reason: string): Promise<void> {
  return post<void>(`/live-streams/${streamId}/report`, { reason });
}

/**
 * Get stream recording URL (if available)
 */
export async function getStreamRecording(streamId: string): Promise<{ recordingUrl: string } | null> {
  try {
    return await get<{ recordingUrl: string }>(`/live-streams/${streamId}/recording`);
  } catch (error) {
    return null;
  }
}
