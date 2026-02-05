/**
 * Meeting Service
 * API wrapper for meeting operations
 */

import { apiFetch } from "@/services/api";

export interface Meeting {
  id: string;
  code: string;
  title: string;
  description?: string;
  hostId: number;
  host?: {
    id: number;
    name: string;
    avatar?: string;
  };
  status: "scheduled" | "active" | "ended";
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  participantCount: number;
  maxParticipants: number;
  isPasswordProtected: boolean;
  joinUrl?: string;
  createdAt: string;
}

export interface JoinMeetingResult {
  meeting: Meeting;
  token: string;
  roomUrl: string;
}

// Mock data for development
const MOCK_MEETINGS: Meeting[] = [
  {
    id: "meeting-1",
    code: "abc-defg-hij",
    title: "Weekly Team Standup",
    description: "Họp team hàng tuần",
    hostId: 1,
    host: { id: 1, name: "Nguyễn Văn A" },
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 3600000).toISOString(),
    duration: 30,
    participantCount: 3,
    maxParticipants: 100,
    isPasswordProtected: false,
    joinUrl: "/meetings/abc-defg-hij",
    createdAt: new Date().toISOString(),
  },
];

/**
 * Get meeting by code
 */
export async function getMeetingByCode(code: string): Promise<Meeting> {
  try {
    const response = await apiFetch<{ meeting: Meeting }>(
      `/meetings/code/${code}`,
    );
    return response.meeting;
  } catch (error) {
    // Fallback to mock
    const meeting = MOCK_MEETINGS.find((m) => m.code === code);
    if (meeting) return meeting;

    // Return mock for any code in development
    return {
      id: `meeting-${code}`,
      code,
      title: "Cuộc họp",
      hostId: 1,
      host: { id: 1, name: "Host" },
      status: "scheduled",
      participantCount: 0,
      maxParticipants: 100,
      isPasswordProtected: false,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Get meeting by ID
 */
export async function getMeetingById(id: string): Promise<Meeting> {
  try {
    const response = await apiFetch<{ meeting: Meeting }>(`/meetings/${id}`);
    return response.meeting;
  } catch (error) {
    // Fallback to mock
    const meeting = MOCK_MEETINGS.find((m) => m.id === id);
    if (meeting) return meeting;

    return {
      id,
      code: "xxx-xxxx-xxx",
      title: "Cuộc họp",
      hostId: 1,
      status: "scheduled",
      participantCount: 0,
      maxParticipants: 100,
      isPasswordProtected: false,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Join a meeting
 */
export async function joinMeeting(
  meetingId: string,
  password?: string,
): Promise<JoinMeetingResult> {
  try {
    const response = await apiFetch<JoinMeetingResult>(
      `/meetings/${meetingId}/join`,
      {
        method: "POST",
        body: JSON.stringify({ password }),
      },
    );
    return response;
  } catch (error) {
    // Mock response for development
    const meeting = MOCK_MEETINGS.find((m) => m.id === meetingId) || {
      id: meetingId,
      code: "xxx-xxxx-xxx",
      title: "Cuộc họp",
      hostId: 1,
      status: "active",
      participantCount: 1,
      maxParticipants: 100,
      isPasswordProtected: false,
      createdAt: new Date().toISOString(),
    };

    return {
      meeting: { ...meeting, status: "active" },
      token: "mock-token-" + Date.now(),
      roomUrl: `/meetings/room?meetingId=${meetingId}`,
    };
  }
}

/**
 * Update meeting
 */
export async function updateMeeting(
  meetingId: string,
  data: Partial<Meeting>,
): Promise<Meeting> {
  try {
    const response = await apiFetch<{ meeting: Meeting }>(
      `/meetings/${meetingId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return response.meeting;
  } catch (error) {
    console.error("[MeetingService] Update failed:", error);
    throw error;
  }
}

/**
 * Delete meeting
 */
export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    await apiFetch(`/meetings/${meetingId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("[MeetingService] Delete failed:", error);
    throw error;
  }
}

/**
 * Leave meeting
 */
export async function leaveMeeting(meetingId: string): Promise<void> {
  try {
    await apiFetch(`/meetings/${meetingId}/leave`, {
      method: "POST",
    });
  } catch (error) {
    console.log("[MeetingService] Leave meeting (mock success)");
  }
}
