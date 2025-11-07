/**
 * LiveKit API Services
 * Handles LiveKit token generation and room management
 */

import { ApiError, apiFetch } from './api';

// Types
export type LiveKitTokenRequest = {
  room: string;
  identity: string;
  name?: string;
  metadata?: string;
};

export type LiveKitTokenResponse = {
  token: string;
};

/**
 * Get LiveKit access token for joining a room
 * POST /livekit/token
 */
export async function getLivekitToken(
  room: string,
  identity: string,
  name?: string,
  metadata?: string
): Promise<string> {
  try {
    const response = await apiFetch<LiveKitTokenResponse>('/livekit/token', {
      method: 'POST',
      data: {
        room,
        identity,
        name,
        metadata,
      },
    });
    
    if (!response.token) {
      throw new Error('Không nhận được token từ server');
    }
    
    return response.token;
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Không thể lấy token LiveKit';
      throw new Error(message);
    }
    throw new Error('Không thể lấy token LiveKit. Vui lòng kiểm tra kết nối mạng.');
  }
}

/**
 * Create a new LiveKit room (optional - if backend supports)
 * POST /livekit/room
 */
export async function createRoom(roomName: string): Promise<{ name: string; sid: string }> {
  try {
    const response = await apiFetch<{ name: string; sid: string }>('/livekit/room', {
      method: 'POST',
      data: { name: roomName },
    });
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Không thể tạo phòng';
      throw new Error(message);
    }
    throw new Error('Không thể tạo phòng LiveKit');
  }
}

/**
 * End a LiveKit call (optional - if backend tracks calls)
 * POST /call/end
 */
export async function endLivekitCall(roomId: string): Promise<void> {
  try {
    await apiFetch('/call/end', {
      method: 'POST',
      data: { roomId },
    });
  } catch (error) {
    // Non-critical - log but don't throw
    console.warn('Failed to notify backend of call end:', error);
  }
}
