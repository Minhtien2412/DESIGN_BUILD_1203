// services/call.ts
/**
 * 1-1 Video Call Service
 * Handles call initiation, token management, and call lifecycle
 */

import { apiFetch } from './api';

/**
 * Start call request
 */
export type StartCallRequest = {
  calleeId: string;
};

/**
 * Start call response
 */
export type StartCallResponse = {
  roomId: string;
};

/**
 * End call request
 */
export type EndCallRequest = {
  roomId: string;
};

/**
 * End call response
 */
export type EndCallResponse = {
  ok: boolean;
};

/**
 * LiveKit token request
 */
export type LiveKitTokenRequest = {
  room: string;
  identity: string;
  name?: string;
};

/**
 * LiveKit token response
 */
export type LiveKitTokenResponse = {
  token: string;
};

/**
 * Start a 1-1 video call with another user
 * Requires JWT authentication
 * 
 * @param calleeId - User ID to call
 * @returns Room ID for the call
 */
export async function startCall(calleeId: string): Promise<string> {
  const response = await apiFetch<StartCallResponse>('/call/start', {
    method: 'POST',
    body: JSON.stringify({
      calleeId,
    } satisfies StartCallRequest),
  });
  
  return response.roomId;
}

/**
 * Get LiveKit access token for joining a room
 * 
 * @param roomId - Room ID to join
 * @param identity - User identity (usually user ID)
 * @param name - Optional display name
 * @returns LiveKit JWT token
 */
export async function getLiveKitToken(
  roomId: string,
  identity: string,
  name?: string
): Promise<string> {
  const response = await apiFetch<LiveKitTokenResponse>('/livekit/token', {
    method: 'POST',
    body: JSON.stringify({
      room: roomId,
      identity,
      name,
    } satisfies LiveKitTokenRequest),
  });
  
  return response.token;
}

/**
 * End an active call
 * 
 * @param roomId - Room ID to end
 */
export async function endCall(roomId: string): Promise<void> {
  await apiFetch<EndCallResponse>('/call/end', {
    method: 'POST',
    body: JSON.stringify({
      roomId,
    } satisfies EndCallRequest),
  });
}

/**
 * Get WebSocket URL for LiveKit connection
 */
export function getLiveKitWebSocketURL(): string {
  const wsUrl = process.env.EXPO_PUBLIC_LIVEKIT_WS_URL;
  
  if (!wsUrl) {
    throw new Error('EXPO_PUBLIC_LIVEKIT_WS_URL not configured');
  }
  
  if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
    throw new Error('LIVEKIT_WS_URL must start with ws:// or wss://');
  }
  
  return wsUrl;
}

/**
 * Build complete LiveKit connection URL with token
 * 
 * @param token - LiveKit JWT token
 * @returns Complete WebSocket URL with token
 */
export function buildLiveKitConnectionURL(token: string): string {
  const wsUrl = getLiveKitWebSocketURL();
  return `${wsUrl}?access_token=${encodeURIComponent(token)}`;
}
