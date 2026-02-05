/**
 * Call Service - Unified API
 * Handles 1-1 video/audio calls with REST API + LiveKit integration
 *
 * @author AI Assistant
 * @date 23/12/2025
 */

import { apiClient } from "./client";

// ==================== TYPES ====================

export type CallType = "video" | "audio";
export type CallStatus = "pending" | "active" | "ended" | "missed" | "rejected";

export interface CallUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Call {
  id: number;
  callerId: number;
  calleeId: number;
  roomId: string;
  status: CallStatus;
  type: CallType;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // in seconds
  createdAt: string;
  updatedAt: string;
  caller: CallUser;
  callee: CallUser;
}

export interface CallHistoryItem extends Call {
  isOutgoing: boolean;
  otherUser: CallUser;
  statusText: string;
  durationText: string;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface StartCallRequest {
  calleeId: number;
  type: CallType;
}

export interface StartCallResponse {
  call: Call;
  roomId: string;
  token: string; // LiveKit token
}

export interface AcceptCallResponse {
  call: Call;
  token: string; // LiveKit token
}

export interface LiveKitTokenRequest {
  roomId: string;
  identity: string;
  name?: string;
}

export interface LiveKitTokenResponse {
  token: string;
}

export interface CallHistoryParams {
  page?: number;
  limit?: number;
  type?: CallType;
  status?: CallStatus;
}

export interface CallHistoryResponse {
  calls: Call[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== API SERVICE ====================

export const callService = {
  /**
   * Start a new call with another user
   */
  async startCall(
    calleeId: number,
    type: CallType = "video",
  ): Promise<StartCallResponse> {
    return apiClient.post<StartCallResponse>("/call/start", {
      calleeId,
      type,
    });
  },

  /**
   * Accept an incoming call
   */
  async acceptCall(callId: number): Promise<AcceptCallResponse> {
    return apiClient.post<AcceptCallResponse>(`/call/accept/${callId}`);
  },

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: number): Promise<Call> {
    return apiClient.post<Call>(`/call/reject/${callId}`);
  },

  /**
   * End an active call
   */
  async endCall(roomId: string): Promise<Call> {
    return apiClient.post<Call>("/call/end", { roomId });
  },

  /**
   * Get call by ID
   */
  async getCall(callId: number): Promise<Call> {
    return apiClient.get<Call>(`/call/${callId}`);
  },

  /**
   * Get currently active call for user
   */
  async getActiveCall(): Promise<Call | null> {
    try {
      return await apiClient.get<Call>("/call/active");
    } catch {
      return null;
    }
  },

  /**
   * Get call history for current user
   */
  async getCallHistory(
    params?: CallHistoryParams,
  ): Promise<CallHistoryResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.type) queryParams.type = params.type;
    if (params?.status) queryParams.status = params.status;

    return apiClient.get<CallHistoryResponse>("/call/history", queryParams);
  },

  /**
   * Mark a missed call as read
   */
  async markMissedCallAsRead(callId: number): Promise<void> {
    return apiClient.post(`/call/missed/${callId}/read`);
  },

  /**
   * Get missed calls count
   */
  async getMissedCallsCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      "/call/missed/count",
    );
    return response.count;
  },

  // ==================== LIVEKIT TOKEN ====================

  /**
   * Get LiveKit access token for joining a room
   */
  async getLiveKitToken(
    roomId: string,
    identity: string,
    name?: string,
  ): Promise<string> {
    const response = await apiClient.post<LiveKitTokenResponse>(
      "/livekit/token",
      {
        room: roomId,
        identity,
        name,
      },
    );
    return response.token;
  },

  /**
   * Refresh LiveKit token for an active call
   */
  async refreshLiveKitToken(roomId: string): Promise<string> {
    const response = await apiClient.post<LiveKitTokenResponse>(
      "/livekit/token/refresh",
      {
        roomId,
      },
    );
    return response.token;
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get LiveKit WebSocket URL from environment
 */
export function getLiveKitWebSocketURL(): string {
  const wsUrl = process.env.EXPO_PUBLIC_LIVEKIT_WS_URL;

  if (!wsUrl) {
    console.warn("EXPO_PUBLIC_LIVEKIT_WS_URL not configured, using default");
    return "wss://livekit.baotienweb.cloud";
  }

  return wsUrl;
}

/**
 * Format call duration to display string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "5:32" or "1:05:32"
 */
export function formatCallDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "0:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get localized status text
 */
export function getCallStatusText(
  status: CallStatus,
  isOutgoing: boolean,
): string {
  switch (status) {
    case "pending":
      return isOutgoing ? "Đang đổ chuông..." : "Cuộc gọi đến";
    case "active":
      return "Đang gọi";
    case "ended":
      return "Đã kết thúc";
    case "missed":
      return isOutgoing ? "Không trả lời" : "Cuộc gọi nhỡ";
    case "rejected":
      return isOutgoing ? "Đã từ chối" : "Đã từ chối";
    default:
      return status;
  }
}

/**
 * Get display info for call (determines other user and direction)
 * @param call - Call object
 * @param currentUserId - Current user's ID
 */
export function getCallDisplayInfo(
  call: Call,
  currentUserId: number,
): CallHistoryItem {
  const isOutgoing = call.callerId === currentUserId;
  const otherUser = isOutgoing ? call.callee : call.caller;

  return {
    ...call,
    isOutgoing,
    otherUser,
    statusText: getCallStatusText(call.status, isOutgoing),
    durationText: formatCallDuration(call.duration),
  };
}

/**
 * Get icon name for call type and direction
 */
export function getCallIcon(call: Call, currentUserId: number): string {
  const isOutgoing = call.callerId === currentUserId;

  if (call.status === "missed") {
    return isOutgoing ? "call-outline" : "call";
  }

  if (call.type === "video") {
    return isOutgoing ? "videocam-outline" : "videocam";
  }

  return isOutgoing ? "call-outline" : "call";
}

/**
 * Get color for call status
 */
export function getCallStatusColor(status: CallStatus): string {
  switch (status) {
    case "active":
      return "#0066CC"; // green
    case "ended":
      return "#666666"; // gray
    case "missed":
      return "#000000"; // red
    case "rejected":
      return "#0066CC"; // orange
    case "pending":
      return "#0066CC"; // blue
    default:
      return "#666666";
  }
}

export default callService;
