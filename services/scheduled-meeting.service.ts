/**
 * Scheduled Meeting Service
 * API for video meeting scheduling like Google Meet
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import ENV from '@/config/env';
import { apiFetch } from '@/services/api';
import type {
    CreateMeetingInput,
    CreateMeetingResponse,
    JoinMeetingInput,
    JoinMeetingResponse,
    MeetingInvitation,
    MeetingListResponse,
    MeetingParticipant,
    ScheduledMeeting,
    UpdateMeetingInput,
} from '@/types/scheduled-meeting';
import {
    ParticipantRole,
    ParticipantStatus,
    ScheduledMeetingStatus,
    ScheduledMeetingType,
} from '@/types/scheduled-meeting';

// ==================== MOCK DATA ====================

const generateMeetingCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}-${part3}`;
};

const MOCK_MEETINGS: ScheduledMeeting[] = [
  {
    id: 'meeting-1',
    meetingCode: 'abc-defg-hij',
    title: 'Weekly Team Standup',
    description: 'Họp team hàng tuần để cập nhật tiến độ',
    type: 'TEAM_MEETING' as ScheduledMeetingType,
    status: 'SCHEDULED' as ScheduledMeetingStatus,
    scheduledStartTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    scheduledEndTime: new Date(Date.now() + 5400000).toISOString(),
    timezone: 'Asia/Ho_Chi_Minh',
    duration: 30,
    meetingLink: `${ENV.API_BASE_URL}/meet/abc-defg-hij`,
    hostLink: `${ENV.API_BASE_URL}/meet/abc-defg-hij?host=true`,
    hostId: 'user-1',
    hostName: 'Nguyễn Văn A',
    participants: [
      {
        id: 'p1',
        odisId: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: 'HOST' as ParticipantRole,
        status: 'ACCEPTED' as ParticipantStatus,
      },
      {
        id: 'p2',
        odisId: 2,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        role: 'PARTICIPANT' as ParticipantRole,
        status: 'ACCEPTED' as ParticipantStatus,
      },
      {
        id: 'p3',
        odisId: 3,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        role: 'PARTICIPANT' as ParticipantRole,
        status: 'INVITED' as ParticipantStatus,
      },
    ],
    isWaitingRoomEnabled: false,
    isRecordingEnabled: true,
    isScreenShareAllowed: true,
    isChatEnabled: true,
    requiresPassword: false,
    reminders: [
      { id: 'r1', minutesBefore: 15, notificationType: 'push', sent: false },
      { id: 'r2', minutesBefore: 5, notificationType: 'push', sent: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'meeting-2',
    meetingCode: 'xyz-mnop-qrs',
    title: 'Project Review với Client',
    description: 'Demo và review tiến độ dự án với khách hàng',
    type: 'VIDEO_CALL' as ScheduledMeetingType,
    status: 'SCHEDULED' as ScheduledMeetingStatus,
    scheduledStartTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    scheduledEndTime: new Date(Date.now() + 90000000).toISOString(),
    timezone: 'Asia/Ho_Chi_Minh',
    duration: 60,
    meetingLink: `${ENV.API_BASE_URL}/meet/xyz-mnop-qrs`,
    hostId: 'user-1',
    hostName: 'Nguyễn Văn A',
    participants: [
      {
        id: 'p1',
        odisId: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: 'HOST' as ParticipantRole,
        status: 'ACCEPTED' as ParticipantStatus,
      },
    ],
    isWaitingRoomEnabled: true,
    isRecordingEnabled: false,
    isScreenShareAllowed: true,
    isChatEnabled: true,
    requiresPassword: true,
    password: '123456',
    reminders: [
      { id: 'r3', minutesBefore: 60, notificationType: 'email', sent: false },
      { id: 'r4', minutesBefore: 10, notificationType: 'push', sent: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'meeting-3',
    meetingCode: 'uvw-abcd-efg',
    title: 'Technical Discussion',
    description: 'Thảo luận về kiến trúc hệ thống mới',
    type: 'CONFERENCE' as ScheduledMeetingType,
    status: 'IN_PROGRESS' as ScheduledMeetingStatus,
    scheduledStartTime: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    scheduledEndTime: new Date(Date.now() + 1800000).toISOString(),
    timezone: 'Asia/Ho_Chi_Minh',
    duration: 60,
    meetingLink: `${ENV.API_BASE_URL}/meet/uvw-abcd-efg`,
    hostId: 'user-2',
    hostName: 'Trần Văn D',
    participants: [
      {
        id: 'p4',
        odisId: 2,
        name: 'Trần Văn D',
        email: 'tranvand@example.com',
        role: 'HOST' as ParticipantRole,
        status: 'JOINED' as ParticipantStatus,
        joinedAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'p5',
        odisId: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: 'PARTICIPANT' as ParticipantRole,
        status: 'JOINED' as ParticipantStatus,
        joinedAt: new Date(Date.now() - 1700000).toISOString(),
      },
    ],
    isWaitingRoomEnabled: false,
    isRecordingEnabled: true,
    isScreenShareAllowed: true,
    isChatEnabled: true,
    requiresPassword: false,
    reminders: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    actualStartTime: new Date(Date.now() - 1800000).toISOString(),
  },
];

const MOCK_INVITATIONS: MeetingInvitation[] = [
  {
    meetingId: 'meeting-4',
    meetingCode: 'inv-meet-001',
    title: 'Design Review Session',
    hostName: 'Phạm Thị E',
    scheduledStartTime: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    duration: 45,
    meetingLink: `${ENV.API_BASE_URL}/meet/inv-meet-001`,
    status: 'pending',
  },
];

// In-memory storage for demo
let meetingsStore = [...MOCK_MEETINGS];
let invitationsStore = [...MOCK_INVITATIONS];

// ==================== SERVICE FUNCTIONS ====================

/**
 * Get list of scheduled meetings
 */
export async function getScheduledMeetings(params?: {
  status?: ScheduledMeetingStatus;
  type?: ScheduledMeetingType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<MeetingListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return await apiFetch<MeetingListResponse>(`/meetings/scheduled?${queryParams.toString()}`);
  } catch {
    // Return mock data
    console.log('[MeetingService] Using mock data');
    let filtered = [...meetingsStore];
    
    if (params?.status) {
      filtered = filtered.filter(m => m.status === params.status);
    }
    if (params?.type) {
      filtered = filtered.filter(m => m.type === params.type);
    }
    
    // Sort by scheduled time
    filtered.sort((a, b) => 
      new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()
    );
    
    return {
      meetings: filtered,
      total: filtered.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
      hasMore: false,
    };
  }
}

/**
 * Get meeting by ID
 */
export async function getMeeting(meetingId: string): Promise<ScheduledMeeting | null> {
  try {
    return await apiFetch<ScheduledMeeting>(`/meetings/${meetingId}`);
  } catch {
    return meetingsStore.find(m => m.id === meetingId) || null;
  }
}

/**
 * Get meeting by code (abc-defg-hij)
 */
export async function getMeetingByCode(meetingCode: string): Promise<ScheduledMeeting | null> {
  try {
    return await apiFetch<ScheduledMeeting>(`/meetings/code/${meetingCode}`);
  } catch {
    return meetingsStore.find(m => m.meetingCode === meetingCode) || null;
  }
}

/**
 * Create new scheduled meeting
 */
export async function createScheduledMeeting(input: CreateMeetingInput): Promise<CreateMeetingResponse> {
  try {
    return await apiFetch<CreateMeetingResponse>('/meetings/schedule', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    // Mock create
    const meetingCode = generateMeetingCode();
    const endTime = new Date(new Date(input.scheduledStartTime).getTime() + input.duration * 60000);
    
    const newMeeting: ScheduledMeeting = {
      id: `meeting-${Date.now()}`,
      meetingCode,
      title: input.title,
      description: input.description,
      type: input.type,
      status: ScheduledMeetingStatus.SCHEDULED,
      scheduledStartTime: input.scheduledStartTime,
      scheduledEndTime: endTime.toISOString(),
      timezone: input.timezone || 'Asia/Ho_Chi_Minh',
      duration: input.duration,
      meetingLink: `${ENV.API_BASE_URL}/meet/${meetingCode}`,
      hostLink: `${ENV.API_BASE_URL}/meet/${meetingCode}?host=true`,
      hostId: 'user-current',
      hostName: 'Bạn',
      participants: (input.participants || []).map((p, i) => ({
        id: `new-p-${i}`,
        odisId: p.userId,
        name: `Người dùng ${p.userId}`,
        email: p.email || '',
        role: p.role || ParticipantRole.PARTICIPANT,
        status: ParticipantStatus.INVITED,
      })),
      isWaitingRoomEnabled: input.isWaitingRoomEnabled ?? false,
      isRecordingEnabled: input.isRecordingEnabled ?? true,
      isScreenShareAllowed: input.isScreenShareAllowed ?? true,
      isChatEnabled: input.isChatEnabled ?? true,
      requiresPassword: input.requiresPassword ?? false,
      reminders: (input.reminders || []).map((r, i) => ({
        id: `rem-${i}`,
        minutesBefore: r.minutesBefore,
        notificationType: r.notificationType,
        sent: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: input.projectId,
    };
    
    meetingsStore.unshift(newMeeting);
    
    return {
      meeting: newMeeting,
      meetingLink: newMeeting.meetingLink,
      hostLink: newMeeting.hostLink || newMeeting.meetingLink,
    };
  }
}

/**
 * Update meeting
 */
export async function updateScheduledMeeting(
  meetingId: string, 
  input: UpdateMeetingInput
): Promise<ScheduledMeeting> {
  try {
    return await apiFetch<ScheduledMeeting>(`/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  } catch {
    const index = meetingsStore.findIndex(m => m.id === meetingId);
    if (index >= 0) {
      meetingsStore[index] = {
        ...meetingsStore[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return meetingsStore[index];
    }
    throw new Error('Meeting not found');
  }
}

/**
 * Cancel meeting
 */
export async function cancelMeeting(meetingId: string, reason?: string): Promise<void> {
  try {
    await apiFetch(`/meetings/${meetingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  } catch {
    const index = meetingsStore.findIndex(m => m.id === meetingId);
    if (index >= 0) {
      meetingsStore[index].status = ScheduledMeetingStatus.CANCELLED;
    }
  }
}

/**
 * Join meeting
 */
export async function joinMeeting(input: JoinMeetingInput): Promise<JoinMeetingResponse> {
  try {
    return await apiFetch<JoinMeetingResponse>('/meetings/join', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    // Mock join
    const meeting = input.meetingCode 
      ? meetingsStore.find(m => m.meetingCode === input.meetingCode)
      : null;
      
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    
    // Check password if required
    if (meeting.requiresPassword && meeting.password !== input.password) {
      throw new Error('Invalid password');
    }
    
    const participant: MeetingParticipant = {
      id: `p-${Date.now()}`,
      odisId: 1,
      name: input.displayName || 'Bạn',
      email: '',
      role: ParticipantRole.PARTICIPANT,
      status: ParticipantStatus.JOINED,
      joinedAt: new Date().toISOString(),
      isAudioMuted: input.isAudioMuted ?? false,
      isVideoOff: input.isVideoOff ?? false,
    };
    
    return {
      meeting,
      participant,
      token: `mock-token-${Date.now()}`,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }
}

/**
 * Leave meeting
 */
export async function leaveMeeting(meetingId: string): Promise<void> {
  try {
    await apiFetch(`/meetings/${meetingId}/leave`, { method: 'POST' });
  } catch {
    console.log('[MeetingService] Left meeting (mock)');
  }
}

/**
 * Start meeting (for host)
 */
export async function startMeeting(meetingId: string): Promise<ScheduledMeeting> {
  try {
    return await apiFetch<ScheduledMeeting>(`/meetings/${meetingId}/start`, { method: 'POST' });
  } catch {
    const index = meetingsStore.findIndex(m => m.id === meetingId);
    if (index >= 0) {
      meetingsStore[index].status = ScheduledMeetingStatus.IN_PROGRESS;
      meetingsStore[index].actualStartTime = new Date().toISOString();
      return meetingsStore[index];
    }
    throw new Error('Meeting not found');
  }
}

/**
 * End meeting (for host)
 */
export async function endMeeting(meetingId: string): Promise<void> {
  try {
    await apiFetch(`/meetings/${meetingId}/end`, { method: 'POST' });
  } catch {
    const index = meetingsStore.findIndex(m => m.id === meetingId);
    if (index >= 0) {
      meetingsStore[index].status = ScheduledMeetingStatus.ENDED;
      meetingsStore[index].actualEndTime = new Date().toISOString();
    }
  }
}

/**
 * Add participant to meeting
 */
export async function addParticipant(
  meetingId: string, 
  userId: number, 
  email?: string,
  role?: ParticipantRole
): Promise<MeetingParticipant> {
  try {
    return await apiFetch<MeetingParticipant>(`/meetings/${meetingId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userId, email, role }),
    });
  } catch {
    const meeting = meetingsStore.find(m => m.id === meetingId);
    if (!meeting) throw new Error('Meeting not found');
    
    const participant: MeetingParticipant = {
      id: `p-${Date.now()}`,
      odisId: userId,
      name: `Người dùng ${userId}`,
      email: email || '',
      role: role || ParticipantRole.PARTICIPANT,
      status: ParticipantStatus.INVITED,
    };
    
    meeting.participants.push(participant);
    return participant;
  }
}

/**
 * Remove participant from meeting
 */
export async function removeParticipant(meetingId: string, participantId: string): Promise<void> {
  try {
    await apiFetch(`/meetings/${meetingId}/participants/${participantId}`, { method: 'DELETE' });
  } catch {
    const meeting = meetingsStore.find(m => m.id === meetingId);
    if (meeting) {
      meeting.participants = meeting.participants.filter(p => p.id !== participantId);
    }
  }
}

/**
 * Get meeting invitations for current user
 */
export async function getInvitations(): Promise<MeetingInvitation[]> {
  try {
    return await apiFetch<MeetingInvitation[]>('/meetings/invitations');
  } catch {
    return invitationsStore.filter(i => i.status === 'pending');
  }
}

/**
 * Respond to invitation
 */
export async function respondToInvitation(
  meetingId: string, 
  response: 'accepted' | 'declined'
): Promise<void> {
  try {
    await apiFetch(`/meetings/invitations/${meetingId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  } catch {
    const invitation = invitationsStore.find(i => i.meetingId === meetingId);
    if (invitation) {
      invitation.status = response;
    }
  }
}

/**
 * Get instant meeting (create now and join immediately)
 */
export async function createInstantMeeting(title?: string): Promise<CreateMeetingResponse> {
  return createScheduledMeeting({
    title: title || 'Cuộc họp nhanh',
    type: ScheduledMeetingType.VIDEO_CALL,
    scheduledStartTime: new Date().toISOString(),
    duration: 60,
  });
}

/**
 * Copy meeting link to clipboard
 */
export function getMeetingShareText(meeting: ScheduledMeeting): string {
  const startTime = new Date(meeting.scheduledStartTime).toLocaleString('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  
  let text = `${meeting.title}\n\n`;
  text += `📅 Thời gian: ${startTime}\n`;
  text += `⏱ Thời lượng: ${meeting.duration} phút\n\n`;
  text += `🔗 Link tham gia: ${meeting.meetingLink}\n`;
  text += `📞 Mã cuộc họp: ${meeting.meetingCode}\n`;
  
  if (meeting.requiresPassword && meeting.password) {
    text += `🔐 Mật khẩu: ${meeting.password}\n`;
  }
  
  if (meeting.dialInNumber) {
    text += `\n☎️ Gọi điện: ${meeting.dialInNumber}`;
    if (meeting.dialInPin) {
      text += ` (PIN: ${meeting.dialInPin})`;
    }
  }
  
  return text;
}

// Export for use in components
export const scheduledMeetingService = {
  getScheduledMeetings,
  getMeeting,
  getMeetingByCode,
  createScheduledMeeting,
  updateScheduledMeeting,
  cancelMeeting,
  joinMeeting,
  leaveMeeting,
  startMeeting,
  endMeeting,
  addParticipant,
  removeParticipant,
  getInvitations,
  respondToInvitation,
  createInstantMeeting,
  getMeetingShareText,
};
