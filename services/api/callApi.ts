/**
 * Call API Client
 * Handles voice/video calling with WebSocket support
 * Backend: https://baotienweb.cloud/api/v1/call
 */

import { getItem } from '@/utils/storage';
import ENV from '../../config/env';

const BASE_URL = `${ENV.API_BASE_URL}/call`;

// ==================== TYPES ====================

export type CallType = 'audio' | 'video';
export type CallStatus = 'PENDING' | 'RINGING' | 'ACTIVE' | 'ENDED' | 'REJECTED' | 'MISSED';

export interface Call {
  id: number;
  callerId: number;
  calleeId: number;
  roomId: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  caller?: {
    id: number;
    name: string;
    email: string;
  };
  callee?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface StartCallDto {
  calleeId: number;
  type: CallType;
}

export interface CallHistoryParams {
  page?: number;
  limit?: number;
  type?: CallType;
}

// ==================== AUTH HELPER ====================

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ==================== API METHODS ====================

/**
 * Start a new call
 * Endpoint: POST /call/start
 */
export async function startCall(dto: StartCallDto): Promise<Call> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to start call: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[callApi] startCall error:', error);
    throw error;
  }
}

/**
 * Accept incoming call
 * Endpoint: POST /call/accept/:callId
 */
export async function acceptCall(callId: number): Promise<Call> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/accept/${callId}`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to accept call: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[callApi] acceptCall error:', error);
    throw error;
  }
}

/**
 * Reject incoming call
 * Endpoint: POST /call/reject/:callId
 */
export async function rejectCall(callId: number): Promise<Call> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/reject/${callId}`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to reject call: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[callApi] rejectCall error:', error);
    throw error;
  }
}

/**
 * End active call
 * Endpoint: POST /call/end
 */
export async function endCall(roomId: string): Promise<Call> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/end`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ roomId })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to end call: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[callApi] endCall error:', error);
    throw error;
  }
}

/**
 * Get call history
 * Endpoint: GET /call/history
 */
export async function getCallHistory(params?: CallHistoryParams): Promise<Call[]> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);

    const url = `${BASE_URL}/history${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[callApi] getCallHistory error:', error);
    throw error;
  }
}

/**
 * Get single call details
 * Endpoint: GET /call/:callId
 */
export async function getCall(callId: number): Promise<Call> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/${callId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[callApi] getCall error:', error);
    throw error;
  }
}

/**
 * Get call status
 * Endpoint: GET /call/status/:roomId
 */
export async function getCallStatus(roomId: string): Promise<{ status: CallStatus; participants: number }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/status/${roomId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[callApi] getCallStatus error:', error);
    throw error;
  }
}

// ==================== EXPORT ====================

export const callApi = {
  startCall,
  acceptCall,
  rejectCall,
  endCall,
  getCallHistory,
  getCall,
  getCallStatus
};

export default callApi;
