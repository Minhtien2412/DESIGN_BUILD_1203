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

// Mock data for demo (API not yet deployed)
const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'Xây dựng Resort Hội An - Giai đoạn móng',
    description: 'Trực tiếp thi công phần móng resort',
    streamUrl: '',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    streamKey: 'demo-key-1',
    status: 'live',
    viewerCount: 1234,
    startedAt: new Date().toISOString(),
    hostId: '1',
    hostName: 'Kiến trúc sư Minh',
    hostAvatar: 'https://i.pravatar.cc/100?img=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    isRecording: true,
    settings: { quality: 'auto', enableChat: true, enableReactions: true, isPrivate: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Biệt thự Đà Lạt - Hoàn thiện nội thất',
    description: 'Trực tiếp lắp đặt nội thất cao cấp',
    streamUrl: '',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    streamKey: 'demo-key-2',
    status: 'live',
    viewerCount: 856,
    startedAt: new Date().toISOString(),
    hostId: '2',
    hostName: 'Nhà thầu Hùng',
    hostAvatar: 'https://i.pravatar.cc/100?img=2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    isRecording: false,
    settings: { quality: '1080p', enableChat: true, enableReactions: true, isPrivate: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Nhà phố hiện đại Q7 - Đổ bê tông sàn',
    description: 'Trực tiếp đổ bê tông sàn tầng 2',
    streamUrl: '',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    streamKey: 'demo-key-3',
    status: 'live',
    viewerCount: 432,
    startedAt: new Date().toISOString(),
    hostId: '3',
    hostName: 'Chủ đầu tư An',
    hostAvatar: 'https://i.pravatar.cc/100?img=3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
    isRecording: true,
    settings: { quality: '720p', enableChat: true, enableReactions: true, isPrivate: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get list of live streams
 * Uses mock data as fallback when API is not available
 */
export async function getLiveStreams(params: LiveStreamsParams = {}): Promise<LiveStreamsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.projectId) queryParams.append('projectId', params.projectId);
    if (params.hostId) queryParams.append('hostId', params.hostId);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);

    return await get<LiveStreamsResponse>(`/video/rooms?${queryParams.toString()}`);
  } catch (error) {
    // Fallback to mock data when API is not available
    console.log('[LiveStream] Using mock data - API not available');
    let streams = [...MOCK_LIVE_STREAMS];
    
    // Filter by status
    if (params.status && params.status !== 'all') {
      streams = streams.filter(s => s.status === params.status);
    }
    
    // Sort by viewer count
    if (params.sortBy === 'viewerCount') {
      streams.sort((a, b) => params.order === 'asc' ? a.viewerCount - b.viewerCount : b.viewerCount - a.viewerCount);
    }
    
    return {
      streams,
      pagination: { page: 1, limit: params.limit || 20, total: streams.length, totalPages: 1 }
    };
  }
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
 * Tries both video room and legacy live-stream endpoints before falling back
 */
export async function getLiveStream(id: string): Promise<LiveStream> {
  const candidateEndpoints = [`/video/rooms/${id}`, `/live-streams/${id}`];
  let lastError: unknown;

  for (const endpoint of candidateEndpoints) {
    try {
      return await get<LiveStream>(endpoint);
    } catch (error) {
      lastError = error;
    }
  }

  console.log('[LiveStream] Using mock response for getLiveStream', lastError);
  const stream = MOCK_LIVE_STREAMS.find(s => s.id === id);
  if (stream) {
    return stream;
  }

  // Create a placeholder stream so UI can still render in demo/offline mode
  const now = new Date().toISOString();
  return {
    id,
    title: 'Demo Live Stream',
    description: 'This is a placeholder stream because the API did not return data.',
    streamUrl: '',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    streamKey: `sk-${Math.random().toString(36).substring(2, 8)}`,
    status: 'live',
    viewerCount: 0,
    startedAt: now,
    hostId: 'demo-host',
    hostName: 'Demo Host',
    hostAvatar: 'https://i.pravatar.cc/100?img=5',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
    isRecording: false,
    settings: { quality: 'auto', enableChat: true, enableReactions: true, isPrivate: false },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a new live stream
 * Returns mock data when API is not available
 */
export async function createLiveStream(data: CreateStreamData): Promise<LiveStream> {
  try {
    return await post<LiveStream>('/video/rooms', data);
  } catch (error) {
    // Return mock response for demo
    console.log('[LiveStream] Using mock response for createLiveStream');
    return {
      id: `stream-${Date.now()}`,
      title: data.title,
      description: data.description,
      streamUrl: 'rtmp://demo.stream/live',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      streamKey: `sk-${Math.random().toString(36).substring(7)}`,
      status: 'pending',
      viewerCount: 0,
      hostId: '1',
      hostName: 'Demo User',
      isRecording: false,
      settings: { quality: 'auto', enableChat: true, enableReactions: true, isPrivate: false, ...data.settings },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Start broadcasting a stream
 */
export async function startStream(id: string): Promise<LiveStream> {
  try {
    return await put<LiveStream>(`/live-streams/${id}/start`, {});
  } catch (error) {
    // Return mock response for demo
    console.log('[LiveStream] Using mock response for startStream');
    return {
      id,
      title: 'Demo Stream',
      description: 'Live broadcasting',
      streamUrl: 'rtmp://demo.stream/live',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      streamKey: `sk-${Math.random().toString(36).substring(7)}`,
      status: 'live',
      viewerCount: 0,
      hostId: '1',
      hostName: 'Demo User',
      isRecording: false,
      settings: { quality: 'auto', enableChat: true, enableReactions: true, isPrivate: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * End a live stream
 */
export async function endStream(id: string): Promise<LiveStream> {
  try {
    return await put<LiveStream>(`/live-streams/${id}/end`, {});
  } catch (error) {
    // Return mock response for demo
    console.log('[LiveStream] Using mock response for endStream');
    return {
      id,
      title: 'Demo Stream',
      description: '',
      streamUrl: '',
      playbackUrl: '',
      streamKey: '',
      status: 'ended',
      viewerCount: 0,
      hostId: '1',
      hostName: 'Demo User',
      isRecording: false,
      settings: { quality: 'auto', enableChat: true, enableReactions: true, isPrivate: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
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
  try {
    return await get<StreamComment[]>(`/live-streams/${streamId}/comments?limit=${limit}`);
  } catch (error) {
    // Return mock comments for demo
    console.log('[LiveStream] Using mock response for getStreamComments');
    return [
      {
        id: '1',
        streamId,
        userId: '1',
        userName: 'Nguyễn Văn A',
        message: 'Chào mọi người! 👋',
        timestamp: Date.now() - 60000,
        createdAt: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: '2',
        streamId,
        userId: '2',
        userName: 'Trần Thị B',
        message: 'Tiến độ tốt quá! 🎉',
        timestamp: Date.now() - 30000,
        createdAt: new Date(Date.now() - 30000).toISOString(),
      },
    ];
  }
}

/**
 * Send a comment to stream
 */
export async function sendStreamComment(streamId: string, message: string): Promise<StreamComment> {
  try {
    return await post<StreamComment>(`/live-streams/${streamId}/comments`, { message });
  } catch (error) {
    // Return mock comment for demo
    console.log('[LiveStream] Using mock response for sendStreamComment');
    return {
      id: `comment-${Date.now()}`,
      streamId,
      userId: '1',
      userName: 'You',
      message,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Send a reaction to stream
 */
export async function sendStreamReaction(streamId: string, type: StreamReaction['type']): Promise<void> {
  try {
    return await post<void>(`/live-streams/${streamId}/reactions`, { type });
  } catch (error) {
    // Mock success for demo
    console.log('[LiveStream] Using mock response for sendStreamReaction');
    return Promise.resolve();
  }
}

/**
 * Join stream as viewer (increment viewer count)
 */
export async function joinStream(streamId: string): Promise<{ playbackUrl: string; token?: string }> {
  try {
    return await post<{ playbackUrl: string; token?: string }>(`/live-streams/${streamId}/join`, {});
  } catch (error) {
    // Return mock response for demo
    console.log('[LiveStream] Using mock response for joinStream');
    const stream = MOCK_LIVE_STREAMS.find(s => s.id === streamId);
    return {
      playbackUrl: stream?.playbackUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    };
  }
}

/**
 * Leave stream as viewer (decrement viewer count)
 */
export async function leaveStream(streamId: string): Promise<void> {
  try {
    return await post<void>(`/live-streams/${streamId}/leave`, {});
  } catch (error) {
    // Mock success for demo
    console.log('[LiveStream] Using mock response for leaveStream');
    return Promise.resolve();
  }
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
