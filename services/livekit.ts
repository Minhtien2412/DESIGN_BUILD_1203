/**
 * LiveKit Integration Service for React Native/Expo
 * 
 * Backend LiveKit Server:
 * - Internal: 127.0.0.1:7880
 * - Public WebSocket: wss://api.thietkeresort.com.vn/livekit/rtc
 * 
 * Token Management:
 * - Tokens must be signed by backend using LIVEKIT_API_KEY/SECRET
 * - FE requests token via POST /livekit/token endpoint
 * - Token includes room name, identity, and permissions
 */

import { apiFetch } from './api';

// LiveKit WebSocket URL from environment
const LIVEKIT_WS_URL = 
  (typeof process !== 'undefined' && (process.env as any).EXPO_PUBLIC_LIVEKIT_WS_URL) || 
  'wss://api.thietkeresort.com.vn/livekit/rtc';

export const LIVEKIT_CONFIG = {
  wsUrl: LIVEKIT_WS_URL,
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: {
    resolution: { width: 1280, height: 720 },
    facingMode: 'user',
  },
  audioCaptureDefaults: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

/**
 * Request body for LiveKit token endpoint
 */
export interface LiveKitTokenRequest {
  room: string;
  identity: string;
  metadata?: string;
  permissions?: {
    canPublish?: boolean;
    canSubscribe?: boolean;
    canPublishData?: boolean;
    hidden?: boolean;
    recorder?: boolean;
  };
}

/**
 * Response from backend token endpoint
 */
export interface LiveKitTokenResponse {
  token: string;
  expiresAt?: number;
}

/**
 * Get LiveKit access token from backend
 * Backend will sign token with LIVEKIT_API_KEY/SECRET
 * 
 * @param room - Room name to join
 * @param identity - User identity (unique identifier)
 * @param metadata - Optional user metadata (JSON string)
 * @returns Signed JWT token for LiveKit connection
 * 
 * @example
 * ```typescript
 * const token = await getLiveKitToken('meeting-123', 'user-456');
 * // Use token to connect to LiveKit room
 * ```
 */
export async function getLiveKitToken(
  room: string,
  identity: string,
  metadata?: string
): Promise<string> {
  const response = await apiFetch<LiveKitTokenResponse>('/livekit/token', {
    method: 'POST',
    data: {
      room,
      identity,
      metadata,
    },
  });

  return response.token;
}

/**
 * Get LiveKit token with custom permissions
 * 
 * @param request - Full token request with permissions
 * @returns Signed JWT token
 * 
 * @example
 * ```typescript
 * const token = await getLiveKitTokenWithPermissions({
 *   room: 'meeting-123',
 *   identity: 'user-456',
 *   permissions: {
 *     canPublish: true,
 *     canSubscribe: true,
 *     canPublishData: false,
 *   },
 * });
 * ```
 */
export async function getLiveKitTokenWithPermissions(
  request: LiveKitTokenRequest
): Promise<string> {
  const response = await apiFetch<LiveKitTokenResponse>('/livekit/token', {
    method: 'POST',
    data: request,
  });

  return response.token;
}

/**
 * Validate LiveKit WebSocket URL format
 * Must be ws:// or wss:// protocol
 */
export function validateLiveKitUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
  } catch {
    return false;
  }
}

/**
 * Get LiveKit connection info for debugging
 */
export function getLiveKitConnectionInfo() {
  return {
    wsUrl: LIVEKIT_WS_URL,
    isSecure: LIVEKIT_WS_URL.startsWith('wss://'),
    isValid: validateLiveKitUrl(LIVEKIT_WS_URL),
    config: LIVEKIT_CONFIG,
  };
}

/**
 * Check if LiveKit is properly configured
 * Returns error message if misconfigured, null if OK
 */
export function checkLiveKitConfiguration(): string | null {
  if (!LIVEKIT_WS_URL) {
    return 'EXPO_PUBLIC_LIVEKIT_WS_URL not configured';
  }

  if (!validateLiveKitUrl(LIVEKIT_WS_URL)) {
    return `Invalid WebSocket URL: ${LIVEKIT_WS_URL}`;
  }

  if (LIVEKIT_WS_URL.startsWith('ws://') && !__DEV__) {
    return 'Production should use wss:// (secure WebSocket)';
  }

  return null;
}

/**
 * Room connection options
 */
export interface RoomConnectionOptions {
  token: string;
  autoSubscribe?: boolean;
  publishOnly?: boolean;
  adaptiveStream?: boolean;
  dynacast?: boolean;
}

/**
 * Create room connection configuration
 * Helper to generate consistent room options
 */
export function createRoomConfig(options: Partial<RoomConnectionOptions> = {}) {
  return {
    adaptiveStream: options.adaptiveStream ?? LIVEKIT_CONFIG.adaptiveStream,
    dynacast: options.dynacast ?? LIVEKIT_CONFIG.dynacast,
    autoSubscribe: options.autoSubscribe ?? true,
    publishOnly: options.publishOnly ?? false,
    videoCaptureDefaults: LIVEKIT_CONFIG.videoCaptureDefaults,
    audioCaptureDefaults: LIVEKIT_CONFIG.audioCaptureDefaults,
  };
}

/**
 * Error types for LiveKit operations
 */
export enum LiveKitErrorType {
  TOKEN_FETCH_FAILED = 'TOKEN_FETCH_FAILED',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  PUBLISH_FAILED = 'PUBLISH_FAILED',
  SUBSCRIBE_FAILED = 'SUBSCRIBE_FAILED',
}

export class LiveKitError extends Error {
  constructor(
    public type: LiveKitErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'LiveKitError';
  }
}

/**
 * Safe wrapper for getting LiveKit token with error handling
 */
export async function getLiveKitTokenSafe(
  room: string,
  identity: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const configError = checkLiveKitConfiguration();
    if (configError) {
      return { success: false, error: configError };
    }

    const token = await getLiveKitToken(room, identity);
    return { success: true, token };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to get LiveKit token',
    };
  }
}

/**
 * Export for easy testing
 */
export const __testing__ = {
  LIVEKIT_WS_URL,
  validateLiveKitUrl,
  checkLiveKitConfiguration,
};
