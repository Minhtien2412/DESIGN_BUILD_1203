/**
 * Agora Video Call Service
 * Handles video/voice calls using Agora RTC SDK
 * 
 * Backend API: https://api.thietkeresort.com.vn
 * 
 * Flow:
 * 1. Get Agora token from backend
 * 2. Join channel with token
 * 3. Enable video/audio
 * 4. Start call
 */

import { apiFetch } from './api';

/**
 * Agora token request
 */
export interface AgoraTokenRequest {
  channelName: string;
  uid: string | number;
  role: 'publisher' | 'subscriber';
}

/**
 * Agora token response from backend
 */
export interface AgoraTokenResponse {
  token: string;
  appId: string;
  channelName: string;
  uid: number;
  expiresIn: number; // seconds
}

/**
 * Call participant info
 */
export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

/**
 * Call session info
 */
export interface CallSession {
  channelName: string;
  token: string;
  appId: string;
  uid: number;
  participants: CallParticipant[];
  startedAt: Date;
  callType: 'video' | 'voice';
}

/**
 * Call state
 */
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';

/**
 * Get Agora token from backend
 * 
 * @param channelName - Channel name (room ID)
 * @param uid - User ID (number or string)
 * @param role - User role: publisher (can publish) or subscriber (only receive)
 * @returns Agora token and connection info
 */
export async function getAgoraToken(
  channelName: string,
  uid: string | number,
  role: 'publisher' | 'subscriber' = 'publisher'
): Promise<AgoraTokenResponse> {
  try {
    const response = await apiFetch<AgoraTokenResponse>('/api/call/token', {
      method: 'POST',
      body: JSON.stringify({
        channelName,
        uid,
        role,
      } satisfies AgoraTokenRequest),
    });

    console.log('✅ Agora token received:', {
      channelName: response.channelName,
      appId: response.appId,
      uid: response.uid,
      expiresIn: response.expiresIn,
    });

    return response;
  } catch (error) {
    console.error('❌ Failed to get Agora token:', error);
    throw new Error('Không thể lấy token cho cuộc gọi. Vui lòng thử lại.');
  }
}

/**
 * Start a new call
 * 
 * @param participantId - ID of user to call
 * @param callType - Type of call: video or voice
 * @returns Channel name and token
 */
export async function startCall(
  participantId: string,
  callType: 'video' | 'voice' = 'video'
): Promise<{ channelName: string; token: string; appId: string; uid: number }> {
  try {
    // Generate unique channel name
    const channelName = `call_${Date.now()}_${participantId}`;
    
    // Get user ID from auth context (would be passed in real implementation)
    const myUid = Math.floor(Math.random() * 1000000); // Temporary
    
    // Get Agora token
    const tokenData = await getAgoraToken(channelName, myUid, 'publisher');
    
    console.log('✅ Call started:', {
      channelName,
      participantId,
      callType,
      uid: tokenData.uid,
    });
    
    return {
      channelName: tokenData.channelName,
      token: tokenData.token,
      appId: tokenData.appId,
      uid: tokenData.uid,
    };
  } catch (error) {
    console.error('❌ Failed to start call:', error);
    throw new Error('Không thể bắt đầu cuộc gọi. Vui lòng thử lại.');
  }
}

/**
 * Join an existing call
 * 
 * @param channelName - Channel name to join
 * @param role - User role
 * @returns Token for joining
 */
export async function joinCall(
  channelName: string,
  role: 'publisher' | 'subscriber' = 'publisher'
): Promise<{ token: string; appId: string; uid: number }> {
  try {
    const myUid = Math.floor(Math.random() * 1000000); // Temporary
    
    const tokenData = await getAgoraToken(channelName, myUid, role);
    
    console.log('✅ Joining call:', {
      channelName,
      role,
      uid: tokenData.uid,
    });
    
    return {
      token: tokenData.token,
      appId: tokenData.appId,
      uid: tokenData.uid,
    };
  } catch (error) {
    console.error('❌ Failed to join call:', error);
    throw new Error('Không thể tham gia cuộc gọi. Vui lòng thử lại.');
  }
}

/**
 * End a call
 * 
 * @param channelName - Channel name to end
 */
export async function endCall(channelName: string): Promise<void> {
  try {
    // Notify backend that call has ended
    await apiFetch('/api/call/end', {
      method: 'POST',
      body: JSON.stringify({ channelName }),
    });
    
    console.log('✅ Call ended:', channelName);
  } catch (error) {
    console.error('❌ Failed to end call:', error);
    // Don't throw - call should end locally even if API fails
  }
}

/**
 * Notify backend when user answers call
 * 
 * @param channelName - Channel name
 */
export async function answerCall(channelName: string): Promise<void> {
  try {
    await apiFetch('/api/call/answer', {
      method: 'POST',
      body: JSON.stringify({ channelName }),
    });
    
    console.log('✅ Call answered:', channelName);
  } catch (error) {
    console.error('❌ Failed to notify answer:', error);
    // Don't throw - user can still join
  }
}

/**
 * Notify backend when user rejects call
 * 
 * @param channelName - Channel name
 */
export async function rejectCall(channelName: string): Promise<void> {
  try {
    await apiFetch('/api/call/reject', {
      method: 'POST',
      body: JSON.stringify({ channelName }),
    });
    
    console.log('✅ Call rejected:', channelName);
  } catch (error) {
    console.error('❌ Failed to notify rejection:', error);
  }
}

/**
 * Validate channel name format
 */
export function isValidChannelName(channelName: string): boolean {
  // Agora channel name requirements:
  // - Max 64 characters
  // - Can contain letters, numbers, underscore, hyphen
  const regex = /^[a-zA-Z0-9_-]{1,64}$/;
  return regex.test(channelName);
}

/**
 * Generate a safe channel name
 */
export function generateChannelName(prefix: string = 'call'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Parse channel name to extract info
 */
export function parseChannelName(channelName: string): {
  prefix: string;
  timestamp: number;
  participantId?: string;
} {
  const parts = channelName.split('_');
  return {
    prefix: parts[0] || 'call',
    timestamp: parseInt(parts[1]) || 0,
    participantId: parts[2],
  };
}
