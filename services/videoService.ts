/**
 * Video/Livestream Service - Backend Integration
 * Handles video rooms and livestreaming
 * Updated: 22/12/2025
 */

import { apiFetch } from './api';

// ==================== TYPES ====================

export type VideoRoomType = 'ONE_TO_ONE' | 'GROUP' | 'MEETING' | 'LIVESTREAM';
export type VideoRoomStatus = 'WAITING' | 'ACTIVE' | 'ENDED';

export interface VideoParticipant {
  id: number;
  userId: number;
  roomId: number;
  joinedAt: string;
  leftAt?: string;
  role: 'HOST' | 'PARTICIPANT' | 'VIEWER';
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface VideoRoom {
  id: number;
  roomCode: string;
  name: string;
  type: VideoRoomType;
  status: VideoRoomStatus;
  hostId: number;
  maxParticipants?: number;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  isRecording: boolean;
  createdAt: string;
  updatedAt: string;
  host: {
    id: number;
    name: string;
    email: string;
  };
  participants: VideoParticipant[];
  _count?: {
    participants: number;
  };
}

export interface CreateVideoRoomRequest {
  name: string;
  type?: VideoRoomType;
  maxParticipants?: number;
  scheduledAt?: string;
}

export interface JoinVideoRoomRequest {
  roomCode: string;
}

// ==================== VIDEO ROOM API ====================

/**
 * Create a new video room
 */
export async function createVideoRoom(data: CreateVideoRoomRequest): Promise<VideoRoom> {
  return apiFetch<VideoRoom>('/video/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get user's video rooms
 */
export async function getVideoRooms(): Promise<VideoRoom[]> {
  return apiFetch<VideoRoom[]>('/video/rooms');
}

/**
 * Get a specific video room by ID
 */
export async function getVideoRoomById(roomId: number): Promise<VideoRoom> {
  return apiFetch<VideoRoom>(`/video/rooms/${roomId}`);
}

/**
 * Get a video room by code (for joining)
 */
export async function getVideoRoomByCode(roomCode: string): Promise<VideoRoom> {
  return apiFetch<VideoRoom>(`/video/rooms/code/${roomCode}`);
}

/**
 * Join a video room
 */
export async function joinVideoRoom(roomCode: string): Promise<{ room: VideoRoom; token?: string }> {
  return apiFetch(`/video/rooms/join`, {
    method: 'POST',
    body: JSON.stringify({ roomCode } as JoinVideoRoomRequest),
  });
}

/**
 * Leave a video room
 */
export async function leaveVideoRoom(roomId: number): Promise<void> {
  await apiFetch(`/video/rooms/${roomId}/leave`, {
    method: 'POST',
  });
}

/**
 * End a video room (host only)
 */
export async function endVideoRoom(roomId: number): Promise<VideoRoom> {
  return apiFetch<VideoRoom>(`/video/rooms/${roomId}/end`, {
    method: 'POST',
  });
}

/**
 * Start recording (host only)
 */
export async function startRecording(roomId: number): Promise<void> {
  await apiFetch(`/video/rooms/${roomId}/recording/start`, {
    method: 'POST',
  });
}

/**
 * Stop recording (host only)
 */
export async function stopRecording(roomId: number): Promise<void> {
  await apiFetch(`/video/rooms/${roomId}/recording/stop`, {
    method: 'POST',
  });
}

// ==================== LIVESTREAM API ====================

export interface LiveStream {
  id: number;
  roomCode: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  hostId: number;
  viewerCount: number;
  likeCount: number;
  commentCount: number;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  host: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateLiveStreamRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  scheduledAt?: string;
}

/**
 * Create a new livestream
 */
export async function createLiveStream(data: CreateLiveStreamRequest): Promise<LiveStream> {
  return apiFetch<LiveStream>('/video/livestreams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get current live streams
 */
export async function getCurrentLiveStreams(): Promise<LiveStream[]> {
  try {
    const data = await apiFetch<LiveStream[]>('/video/livestreams?status=LIVE');
    return data;
  } catch {
    return [];
  }
}

/**
 * Get all livestreams (including scheduled)
 */
export async function getLiveStreams(status?: 'SCHEDULED' | 'LIVE' | 'ENDED'): Promise<LiveStream[]> {
  const url = status ? `/video/livestreams?status=${status}` : '/video/livestreams';
  return apiFetch<LiveStream[]>(url);
}

/**
 * Get a specific livestream
 */
export async function getLiveStreamById(streamId: number): Promise<LiveStream> {
  return apiFetch<LiveStream>(`/video/livestreams/${streamId}`);
}

/**
 * Start a scheduled livestream
 */
export async function startLiveStream(streamId: number): Promise<LiveStream> {
  return apiFetch<LiveStream>(`/video/livestreams/${streamId}/start`, {
    method: 'POST',
  });
}

/**
 * End a livestream
 */
export async function endLiveStream(streamId: number): Promise<LiveStream> {
  return apiFetch<LiveStream>(`/video/livestreams/${streamId}/end`, {
    method: 'POST',
  });
}

/**
 * Like a livestream
 */
export async function likeLiveStream(streamId: number): Promise<void> {
  await apiFetch(`/video/livestreams/${streamId}/like`, {
    method: 'POST',
  });
}

/**
 * Comment on a livestream
 */
export async function commentOnLiveStream(streamId: number, comment: string): Promise<void> {
  await apiFetch(`/video/livestreams/${streamId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a shareable room URL
 */
export function getShareableRoomUrl(roomCode: string): string {
  return `https://baotienweb.cloud/join/${roomCode}`;
}

/**
 * Format viewer count for display
 */
export function formatViewerCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

/**
 * Get room type label
 */
export function getRoomTypeLabel(type: VideoRoomType): string {
  switch (type) {
    case 'ONE_TO_ONE': return 'Cuộc gọi 1-1';
    case 'GROUP': return 'Nhóm';
    case 'MEETING': return 'Cuộc họp';
    case 'LIVESTREAM': return 'Livestream';
    default: return type;
  }
}
