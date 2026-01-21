/**
 * LiveKit Service
 * Handles LiveKit token fetching and room management for video calls/meetings
 *
 * Features:
 * - Fetch access tokens from backend
 * - Room creation and management
 * - Participant tracking
 * - Error handling with fallback
 */

import { ENV } from "@/config/env";
import { apiFetch } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export interface LiveKitToken {
  token: string;
  url: string;
  roomName: string;
  participantName: string;
  expiresAt?: string;
}

export interface LiveKitRoom {
  name: string;
  sid: string;
  emptyTimeout: number;
  maxParticipants: number;
  creationTime: string;
  numParticipants: number;
  numPublishers: number;
  activeRecording: boolean;
}

export interface LiveKitParticipant {
  sid: string;
  identity: string;
  name: string;
  state: "JOINING" | "JOINED" | "ACTIVE" | "DISCONNECTED";
  joinedAt: string;
  isPublisher: boolean;
  tracks: LiveKitTrack[];
}

export interface LiveKitTrack {
  sid: string;
  type: "AUDIO" | "VIDEO" | "DATA";
  source: "CAMERA" | "MICROPHONE" | "SCREEN_SHARE" | "SCREEN_SHARE_AUDIO";
  muted: boolean;
  width?: number;
  height?: number;
}

export interface TokenRequest {
  roomName: string;
  participantName: string;
  participantIdentity?: string;
  metadata?: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  ttl?: number; // Token TTL in seconds
}

export interface RoomCreateRequest {
  name: string;
  emptyTimeout?: number; // seconds
  maxParticipants?: number;
  metadata?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const LIVEKIT_CONFIG = {
  // Default LiveKit server URL (override with env)
  serverUrl: ENV.LIVEKIT_URL || "wss://your-livekit-server.livekit.cloud",

  // API endpoints
  endpoints: {
    getToken: "/api/livekit/token",
    createRoom: "/api/livekit/rooms",
    listRooms: "/api/livekit/rooms",
    getRoom: "/api/livekit/rooms/:roomName",
    deleteRoom: "/api/livekit/rooms/:roomName",
    listParticipants: "/api/livekit/rooms/:roomName/participants",
    removeParticipant: "/api/livekit/rooms/:roomName/participants/:identity",
    muteTrack: "/api/livekit/rooms/:roomName/participants/:identity/mute",
  },

  // Default token TTL (1 hour)
  defaultTTL: 3600,

  // Default room settings
  defaultRoomSettings: {
    emptyTimeout: 300, // 5 minutes
    maxParticipants: 50,
  },
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get LiveKit access token for joining a room
 */
export async function getLiveKitToken(
  request: TokenRequest
): Promise<ApiResponse<LiveKitToken>> {
  try {
    console.log("[LiveKit] Fetching token for room:", request.roomName);

    const response = await apiFetch<LiveKitToken>(
      LIVEKIT_CONFIG.endpoints.getToken,
      {
        method: "POST",
        body: JSON.stringify({
          roomName: request.roomName,
          participantName: request.participantName,
          participantIdentity:
            request.participantIdentity || request.participantName,
          metadata: request.metadata,
          canPublish: request.canPublish ?? true,
          canSubscribe: request.canSubscribe ?? true,
          canPublishData: request.canPublishData ?? true,
          ttl: request.ttl || LIVEKIT_CONFIG.defaultTTL,
        }),
      }
    );

    return {
      success: true,
      data: {
        ...response,
        url: LIVEKIT_CONFIG.serverUrl,
      },
    };
  } catch (error: any) {
    console.error("[LiveKit] Token fetch error:", error);
    return {
      success: false,
      error: error.message || "Failed to get LiveKit token",
    };
  }
}

/**
 * Get token for a 1-1 call
 */
export async function getCallToken(
  callId: string,
  userId: string,
  userName: string
): Promise<ApiResponse<LiveKitToken>> {
  return getLiveKitToken({
    roomName: `call-${callId}`,
    participantName: userName,
    participantIdentity: userId,
    canPublish: true,
    canSubscribe: true,
  });
}

/**
 * Get token for a meeting room
 */
export async function getMeetingToken(
  meetingCode: string,
  userId: string,
  userName: string,
  isHost: boolean = false
): Promise<ApiResponse<LiveKitToken>> {
  return getLiveKitToken({
    roomName: `meeting-${meetingCode}`,
    participantName: userName,
    participantIdentity: userId,
    metadata: JSON.stringify({ isHost }),
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
}

/**
 * Get token for livestream (broadcaster or viewer)
 */
export async function getLivestreamToken(
  streamId: string,
  userId: string,
  userName: string,
  isBroadcaster: boolean
): Promise<ApiResponse<LiveKitToken>> {
  return getLiveKitToken({
    roomName: `live-${streamId}`,
    participantName: userName,
    participantIdentity: userId,
    metadata: JSON.stringify({ isBroadcaster }),
    canPublish: isBroadcaster, // Only broadcaster can publish
    canSubscribe: true,
    canPublishData: true, // For chat messages
  });
}

// ============================================================================
// ROOM MANAGEMENT
// ============================================================================

/**
 * Create a new LiveKit room
 */
export async function createRoom(
  request: RoomCreateRequest
): Promise<ApiResponse<LiveKitRoom>> {
  try {
    console.log("[LiveKit] Creating room:", request.name);

    const response = await apiFetch<LiveKitRoom>(
      LIVEKIT_CONFIG.endpoints.createRoom,
      {
        method: "POST",
        body: JSON.stringify({
          name: request.name,
          emptyTimeout:
            request.emptyTimeout ||
            LIVEKIT_CONFIG.defaultRoomSettings.emptyTimeout,
          maxParticipants:
            request.maxParticipants ||
            LIVEKIT_CONFIG.defaultRoomSettings.maxParticipants,
          metadata: request.metadata,
        }),
      }
    );

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error("[LiveKit] Room creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create room",
    };
  }
}

/**
 * List all active rooms
 */
export async function listRooms(): Promise<ApiResponse<LiveKitRoom[]>> {
  try {
    const response = await apiFetch<LiveKitRoom[]>(
      LIVEKIT_CONFIG.endpoints.listRooms
    );
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error("[LiveKit] List rooms error:", error);
    return {
      success: false,
      error: error.message || "Failed to list rooms",
    };
  }
}

/**
 * Get room details
 */
export async function getRoom(
  roomName: string
): Promise<ApiResponse<LiveKitRoom>> {
  try {
    const endpoint = LIVEKIT_CONFIG.endpoints.getRoom.replace(
      ":roomName",
      roomName
    );
    const response = await apiFetch<LiveKitRoom>(endpoint);
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error("[LiveKit] Get room error:", error);
    return {
      success: false,
      error: error.message || "Failed to get room",
    };
  }
}

/**
 * Delete/close a room
 */
export async function deleteRoom(roomName: string): Promise<ApiResponse<void>> {
  try {
    const endpoint = LIVEKIT_CONFIG.endpoints.deleteRoom.replace(
      ":roomName",
      roomName
    );
    await apiFetch(endpoint, { method: "DELETE" });
    return { success: true };
  } catch (error: any) {
    console.error("[LiveKit] Delete room error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete room",
    };
  }
}

// ============================================================================
// PARTICIPANT MANAGEMENT
// ============================================================================

/**
 * List participants in a room
 */
export async function listParticipants(
  roomName: string
): Promise<ApiResponse<LiveKitParticipant[]>> {
  try {
    const endpoint = LIVEKIT_CONFIG.endpoints.listParticipants.replace(
      ":roomName",
      roomName
    );
    const response = await apiFetch<LiveKitParticipant[]>(endpoint);
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error("[LiveKit] List participants error:", error);
    return {
      success: false,
      error: error.message || "Failed to list participants",
    };
  }
}

/**
 * Remove a participant from room
 */
export async function removeParticipant(
  roomName: string,
  identity: string
): Promise<ApiResponse<void>> {
  try {
    const endpoint = LIVEKIT_CONFIG.endpoints.removeParticipant
      .replace(":roomName", roomName)
      .replace(":identity", identity);
    await apiFetch(endpoint, { method: "DELETE" });
    return { success: true };
  } catch (error: any) {
    console.error("[LiveKit] Remove participant error:", error);
    return {
      success: false,
      error: error.message || "Failed to remove participant",
    };
  }
}

/**
 * Mute/unmute a participant's track
 */
export async function muteParticipant(
  roomName: string,
  identity: string,
  trackSid: string,
  muted: boolean
): Promise<ApiResponse<void>> {
  try {
    const endpoint = LIVEKIT_CONFIG.endpoints.muteTrack
      .replace(":roomName", roomName)
      .replace(":identity", identity);
    await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ trackSid, muted }),
    });
    return { success: true };
  } catch (error: any) {
    console.error("[LiveKit] Mute participant error:", error);
    return {
      success: false,
      error: error.message || "Failed to mute participant",
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if LiveKit is configured
 */
export function isLiveKitConfigured(): boolean {
  return !!(ENV.LIVEKIT_URL && ENV.LIVEKIT_API_KEY);
}

/**
 * Get LiveKit server URL
 */
export function getLiveKitUrl(): string {
  return LIVEKIT_CONFIG.serverUrl;
}

/**
 * Generate a unique room name
 */
export function generateRoomName(prefix: string = "room"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const liveKitService = {
  // Token
  getToken: getLiveKitToken,
  getCallToken,
  getMeetingToken,
  getLivestreamToken,

  // Rooms
  createRoom,
  listRooms,
  getRoom,
  deleteRoom,

  // Participants
  listParticipants,
  removeParticipant,
  muteParticipant,

  // Utils
  isConfigured: isLiveKitConfigured,
  getUrl: getLiveKitUrl,
  generateRoomName,
};

export default liveKitService;
