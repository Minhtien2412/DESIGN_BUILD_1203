/**
 * Unified Call Service
 * =====================
 * Service adapter cho cuộc gọi voice/video
 * Tích hợp với call.service.ts API + LiveKit WebRTC
 *
 * Backend API: https://baotienweb.cloud/api/v1/call
 *
 * @author AI Assistant
 * @date 12/01/2026
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Call,
    CallHistoryItem,
    callService,
    CallStatus,
    CallType,
    getCallDisplayInfo,
} from "./api/call.service";

const CACHE_KEY_CALL_HISTORY = "@call_history";
const CACHE_KEY_MISSED_CALLS = "@missed_calls_count";

// ==================== TYPES ====================

export interface UnifiedCallUser {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
}

export interface UnifiedCall {
  id: string;
  type: CallType;
  status: CallStatus;
  otherUser: UnifiedCallUser;
  isOutgoing: boolean;
  duration: number; // seconds
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  roomId?: string;
  token?: string; // LiveKit token
}

export interface UnifiedCallHistory {
  calls: UnifiedCall[];
  total: number;
  hasMore: boolean;
  page: number;
}

// ==================== CONVERTERS ====================

/**
 * Convert API Call to UnifiedCall
 */
export function convertToUnifiedCall(
  call: Call,
  currentUserId: number
): UnifiedCall {
  const isOutgoing = call.callerId === currentUserId;
  const otherUser = isOutgoing ? call.callee : call.caller;

  return {
    id: call.id.toString(),
    type: call.type,
    status: call.status,
    otherUser: {
      id: otherUser.id,
      name: otherUser.name,
      avatar: otherUser.avatar,
      email: otherUser.email,
    },
    isOutgoing,
    duration: call.duration || 0,
    startedAt: call.startedAt,
    endedAt: call.endedAt,
    createdAt: call.createdAt,
    roomId: call.roomId,
  };
}

/**
 * Convert CallHistoryItem to UnifiedCall
 */
export function convertHistoryItem(item: CallHistoryItem): UnifiedCall {
  return {
    id: item.id.toString(),
    type: item.type,
    status: item.status,
    otherUser: {
      id: item.otherUser.id,
      name: item.otherUser.name,
      avatar: item.otherUser.avatar,
      email: item.otherUser.email,
    },
    isOutgoing: item.isOutgoing,
    duration: item.duration || 0,
    startedAt: item.startedAt,
    endedAt: item.endedAt,
    createdAt: item.createdAt,
    roomId: item.roomId,
  };
}

// ==================== SERVICE METHODS ====================

/**
 * Get call history from API
 */
export async function getCallHistory(params?: {
  page?: number;
  limit?: number;
  type?: CallType;
  status?: CallStatus;
}): Promise<UnifiedCallHistory> {
  try {
    const response = await callService.getCallHistory(params);

    const calls = response.calls.map((call) =>
      convertHistoryItem(
        getCallDisplayInfo(call, 0) // currentUserId handled in getCallDisplayInfo
      )
    );

    // Cache for offline
    await AsyncStorage.setItem(CACHE_KEY_CALL_HISTORY, JSON.stringify(calls));

    return {
      calls,
      total: response.total,
      hasMore: response.hasMore,
      page: response.page,
    };
  } catch (error) {
    console.error("[UnifiedCallService] Error fetching call history:", error);

    // Try cache if API fails
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY_CALL_HISTORY);
      if (cached) {
        console.log("[UnifiedCallService] Using cached call history");
        const calls = JSON.parse(cached) as UnifiedCall[];
        return { calls, total: calls.length, hasMore: false, page: 1 };
      }
    } catch (cacheError) {
      console.error("[UnifiedCallService] Cache error:", cacheError);
    }

    throw error;
  }
}

/**
 * Start a new call
 */
export async function startCall(
  calleeId: number,
  type: CallType = "video"
): Promise<{ call: UnifiedCall; token: string }> {
  try {
    const response = await callService.startCall(calleeId, type);

    const unifiedCall: UnifiedCall = {
      id: response.call.id.toString(),
      type: response.call.type,
      status: response.call.status,
      otherUser: {
        id: response.call.callee.id,
        name: response.call.callee.name,
        avatar: response.call.callee.avatar,
        email: response.call.callee.email,
      },
      isOutgoing: true,
      duration: 0,
      createdAt: response.call.createdAt,
      roomId: response.roomId,
      token: response.token,
    };

    console.log("[UnifiedCallService] Call started:", unifiedCall.id);

    return { call: unifiedCall, token: response.token };
  } catch (error) {
    console.error("[UnifiedCallService] Error starting call:", error);
    throw error;
  }
}

/**
 * Accept an incoming call
 */
export async function acceptCall(
  callId: number
): Promise<{ call: UnifiedCall; token: string }> {
  try {
    const response = await callService.acceptCall(callId);

    const unifiedCall: UnifiedCall = {
      id: response.call.id.toString(),
      type: response.call.type,
      status: response.call.status,
      otherUser: {
        id: response.call.caller.id,
        name: response.call.caller.name,
        avatar: response.call.caller.avatar,
        email: response.call.caller.email,
      },
      isOutgoing: false,
      duration: 0,
      startedAt: response.call.startedAt,
      createdAt: response.call.createdAt,
      roomId: response.call.roomId,
      token: response.token,
    };

    console.log("[UnifiedCallService] Call accepted:", unifiedCall.id);

    return { call: unifiedCall, token: response.token };
  } catch (error) {
    console.error("[UnifiedCallService] Error accepting call:", error);
    throw error;
  }
}

/**
 * Reject an incoming call
 */
export async function rejectCall(callId: number): Promise<void> {
  try {
    await callService.rejectCall(callId);
    console.log("[UnifiedCallService] Call rejected:", callId);
  } catch (error) {
    console.error("[UnifiedCallService] Error rejecting call:", error);
    throw error;
  }
}

/**
 * End current call
 */
export async function endCall(roomId: string): Promise<void> {
  try {
    await callService.endCall(roomId);
    console.log("[UnifiedCallService] Call ended:", roomId);
  } catch (error) {
    console.error("[UnifiedCallService] Error ending call:", error);
    throw error;
  }
}

/**
 * Get missed calls count
 */
export async function getMissedCallsCount(): Promise<number> {
  try {
    const count = await callService.getMissedCallsCount();

    // Cache count
    await AsyncStorage.setItem(CACHE_KEY_MISSED_CALLS, count.toString());

    return count;
  } catch (error) {
    console.error(
      "[UnifiedCallService] Error fetching missed calls count:",
      error
    );

    // Try cache
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY_MISSED_CALLS);
      if (cached) {
        return parseInt(cached, 10);
      }
    } catch (cacheError) {
      console.error("[UnifiedCallService] Cache error:", cacheError);
    }

    return 0;
  }
}

/**
 * Mark missed calls as read
 */
export async function markMissedCallsAsRead(callIds?: number[]): Promise<void> {
  try {
    if (callIds && callIds.length > 0) {
      // Mark specific calls as read
      for (const callId of callIds) {
        await callService.markMissedCallAsRead(callId);
      }
    }

    // Update cache
    if (!callIds) {
      await AsyncStorage.setItem(CACHE_KEY_MISSED_CALLS, "0");
    }

    console.log("[UnifiedCallService] Missed calls marked as read");
  } catch (error) {
    console.error(
      "[UnifiedCallService] Error marking missed calls as read:",
      error
    );
    throw error;
  }
}

/**
 * Get LiveKit token for a room
 */
export async function getLiveKitToken(
  roomId: string,
  identity: string,
  name?: string
): Promise<string> {
  try {
    const token = await callService.getLiveKitToken(roomId, identity, name);
    return token;
  } catch (error) {
    console.error("[UnifiedCallService] Error getting LiveKit token:", error);
    throw error;
  }
}

/**
 * Clear cached data
 */
export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      CACHE_KEY_CALL_HISTORY,
      CACHE_KEY_MISSED_CALLS,
    ]);
    console.log("[UnifiedCallService] Cache cleared");
  } catch (error) {
    console.error("[UnifiedCallService] Error clearing cache:", error);
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format call duration to readable string
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return "";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get call status text in Vietnamese
 */
export function getCallStatusText(call: UnifiedCall): string {
  switch (call.status) {
    case "missed":
      return call.isOutgoing ? "Không trả lời" : "Cuộc gọi nhỡ";
    case "rejected":
      return call.isOutgoing ? "Đã bị từ chối" : "Đã từ chối";
    case "ended":
      return call.duration > 0 ? formatDuration(call.duration) : "Đã kết thúc";
    case "active":
      return "Đang gọi...";
    case "pending":
      return call.isOutgoing ? "Đang gọi..." : "Cuộc gọi đến";
    default:
      return "";
  }
}

/**
 * Get call icon name based on type and status
 */
export function getCallIcon(call: UnifiedCall): string {
  if (call.status === "missed") {
    return call.type === "video" ? "videocam-off" : "call";
  }
  return call.type === "video" ? "videocam" : "call";
}

/**
 * Get call color based on status
 */
export function getCallColor(call: UnifiedCall): string {
  switch (call.status) {
    case "missed":
    case "rejected":
      return "#EF4444"; // Red
    case "active":
    case "pending":
      return "#10B981"; // Green
    default:
      return "#6B7280"; // Gray
  }
}

// ==================== EXPORTS ====================

export const UnifiedCallService = {
  getCallHistory,
  startCall,
  acceptCall,
  rejectCall,
  endCall,
  getMissedCallsCount,
  markMissedCallsAsRead,
  getLiveKitToken,
  clearCache,
  // Helpers
  formatDuration,
  getCallStatusText,
  getCallIcon,
  getCallColor,
  // Converters
  convertToUnifiedCall,
  convertHistoryItem,
};

export default UnifiedCallService;
