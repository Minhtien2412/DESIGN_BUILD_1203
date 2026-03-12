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
  status: "scheduled" | "active" | "ended" | "cancelled";
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  participantCount: number;
  maxParticipants: number;
  isPasswordProtected: boolean;
  joinUrl?: string;
  projectId?: number;
  type?: string;
  createdAt: string;
}

export interface MeetingParticipant {
  id: number;
  userId: number;
  user: { id: number; name: string; avatar?: string };
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
  role?: string;
  joinedAt?: string;
  leftAt?: string;
}

export interface Poll {
  id: number;
  question: string;
  options: any;
  status: "ACTIVE" | "CLOSED";
  votes?: any;
  meetingId?: number;
  createdAt: string;
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  projectId?: number;
  type?: "VIDEO" | "AUDIO" | "IN_PERSON" | "HYBRID";
  scheduledAt?: string;
  duration?: number;
  maxParticipants?: number;
  password?: string;
  participantIds?: number[];
}

export interface JoinMeetingResult {
  meeting: Meeting;
  token: string;
  roomUrl: string;
}

/** Map BE status (SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED) to FE display status */
function normalizeStatus(status: string): Meeting["status"] {
  const map: Record<string, Meeting["status"]> = {
    SCHEDULED: "scheduled",
    IN_PROGRESS: "active",
    COMPLETED: "ended",
    CANCELLED: "cancelled",
  };
  return map[status] ?? (status.toLowerCase() as Meeting["status"]);
}

/** Map BE response shape to FE Meeting interface */
function normalizeMeeting(raw: any): Meeting {
  return {
    ...raw,
    id: String(raw.id),
    hostId: raw.createdById ?? raw.hostId,
    host: raw.createdBy ?? raw.host,
    status: normalizeStatus(raw.status),
    participantCount: raw._count?.participants ?? raw.participantCount ?? 0,
  };
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
    const response = await apiFetch<{ meeting: any }>(`/meetings/code/${code}`);
    return normalizeMeeting(response.meeting);
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
    const response = await apiFetch<any>(`/meetings/${id}`);
    return normalizeMeeting(response);
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
 * List meetings
 */
export async function getMeetings(params?: {
  projectId?: number;
  status?: string;
  userId?: number;
}): Promise<Meeting[]> {
  try {
    const query = new URLSearchParams();
    if (params?.projectId) query.set("projectId", String(params.projectId));
    if (params?.status) query.set("status", params.status);
    if (params?.userId) query.set("userId", String(params.userId));
    const qs = query.toString();
    const response = await apiFetch<any[]>(`/meetings${qs ? `?${qs}` : ""}`);
    return (response ?? []).map(normalizeMeeting);
  } catch {
    return MOCK_MEETINGS;
  }
}

/**
 * Create a meeting
 */
export async function createMeeting(
  data: CreateMeetingInput,
): Promise<Meeting> {
  const response = await apiFetch<any>(`/meetings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalizeMeeting(response);
}

/**
 * Join a meeting
 */
export async function joinMeeting(
  meetingId: string,
  password?: string,
): Promise<JoinMeetingResult> {
  try {
    const response = await apiFetch<any>(`/meetings/${meetingId}/join`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    return { ...response, meeting: normalizeMeeting(response.meeting) };
  } catch (error) {
    // Mock response for development
    const meeting = MOCK_MEETINGS.find((m) => m.id === meetingId) || {
      id: meetingId,
      code: "xxx-xxxx-xxx",
      title: "Cuộc họp",
      hostId: 1,
      status: "active" as const,
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
  const response = await apiFetch<any>(`/meetings/${meetingId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return normalizeMeeting(response);
}

/**
 * Delete meeting
 */
export async function deleteMeeting(meetingId: string): Promise<void> {
  await apiFetch(`/meetings/${meetingId}`, {
    method: "DELETE",
  });
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

/**
 * RSVP to a meeting
 */
export async function rsvpMeeting(
  meetingId: string,
  rsvp: "ACCEPTED" | "DECLINED" | "TENTATIVE",
): Promise<void> {
  await apiFetch(`/meetings/${meetingId}/rsvp`, {
    method: "POST",
    body: JSON.stringify({ rsvp }),
  });
}

/**
 * Start a meeting
 */
export async function startMeeting(meetingId: string): Promise<Meeting> {
  const response = await apiFetch<any>(`/meetings/${meetingId}/start`, {
    method: "POST",
  });
  return normalizeMeeting(response);
}

/**
 * End a meeting
 */
export async function endMeeting(meetingId: string): Promise<Meeting> {
  const response = await apiFetch<any>(`/meetings/${meetingId}/end`, {
    method: "POST",
  });
  return normalizeMeeting(response);
}

// ==================== Polls ====================

/**
 * Create a poll in a meeting
 */
export async function createPoll(data: {
  question: string;
  options: string[];
  meetingId: number;
}): Promise<Poll> {
  return apiFetch<Poll>(`/polls`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Vote on a poll
 */
export async function votePoll(
  pollId: number,
  optionIds: number[],
): Promise<Poll> {
  return apiFetch<Poll>(`/polls/${pollId}/vote`, {
    method: "POST",
    body: JSON.stringify({ optionIds }),
  });
}
export async function closePoll(pollId: number): Promise<Poll> {
  return apiFetch<Poll>(`/polls/${pollId}/close`, {
    method: "POST",
  });
}
