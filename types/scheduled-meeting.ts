/**
 * Scheduled Meeting Types
 * Video conferencing & meeting scheduling like Google Meet
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

// ==================== ENUMS ====================

export enum ScheduledMeetingType {
  VIDEO_CALL = 'VIDEO_CALL',
  AUDIO_CALL = 'AUDIO_CALL',
  CONFERENCE = 'CONFERENCE',
  WEBINAR = 'WEBINAR',
  ONE_ON_ONE = 'ONE_ON_ONE',
  TEAM_MEETING = 'TEAM_MEETING',
}

export enum ScheduledMeetingStatus {
  SCHEDULED = 'SCHEDULED',
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export enum ParticipantRole {
  HOST = 'HOST',
  CO_HOST = 'CO_HOST',
  PRESENTER = 'PRESENTER',
  PARTICIPANT = 'PARTICIPANT',
  VIEWER = 'VIEWER',
}

export enum ParticipantStatus {
  INVITED = 'INVITED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  JOINED = 'JOINED',
  LEFT = 'LEFT',
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

// ==================== INTERFACES ====================

export interface MeetingParticipant {
  id: string;
  odisId: number;
  name: string;
  email: string;
  avatar?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
}

export interface MeetingRecurrence {
  type: RecurrenceType;
  interval?: number; // every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 for weekly
  endDate?: string;
  occurrences?: number;
}

export interface MeetingReminder {
  id: string;
  minutesBefore: number; // 5, 10, 15, 30, 60
  notificationType: 'push' | 'email' | 'both';
  sent: boolean;
}

export interface ScheduledMeeting {
  id: string;
  meetingCode: string; // abc-defg-hij like Google Meet
  
  // Basic info
  title: string;
  description?: string;
  type: ScheduledMeetingType;
  status: ScheduledMeetingStatus;
  
  // Schedule
  scheduledStartTime: string; // ISO datetime
  scheduledEndTime: string;
  timezone: string;
  duration: number; // minutes
  
  // Recurrence
  recurrence?: MeetingRecurrence;
  seriesId?: string; // for recurring meetings
  
  // Links
  meetingLink: string; // join URL
  hostLink?: string; // host-specific URL
  dialInNumber?: string;
  dialInPin?: string;
  
  // Participants
  hostId: string;
  hostName: string;
  participants: MeetingParticipant[];
  maxParticipants?: number;
  
  // Settings
  isWaitingRoomEnabled: boolean;
  isRecordingEnabled: boolean;
  isScreenShareAllowed: boolean;
  isChatEnabled: boolean;
  requiresPassword: boolean;
  password?: string;
  
  // Reminders
  reminders: MeetingReminder[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  actualStartTime?: string;
  actualEndTime?: string;
  
  // Project association (optional)
  projectId?: string;
  projectName?: string;
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  type: ScheduledMeetingType;
  scheduledStartTime: string;
  duration: number; // minutes
  timezone?: string;
  
  participants?: {
    userId: number;
    email?: string;
    role?: ParticipantRole;
  }[];
  
  recurrence?: MeetingRecurrence;
  
  isWaitingRoomEnabled?: boolean;
  isRecordingEnabled?: boolean;
  isScreenShareAllowed?: boolean;
  isChatEnabled?: boolean;
  requiresPassword?: boolean;
  
  reminders?: { minutesBefore: number; notificationType: 'push' | 'email' | 'both' }[];
  
  projectId?: string;
}

export interface UpdateMeetingInput {
  title?: string;
  description?: string;
  scheduledStartTime?: string;
  duration?: number;
  
  isWaitingRoomEnabled?: boolean;
  isRecordingEnabled?: boolean;
  isScreenShareAllowed?: boolean;
  isChatEnabled?: boolean;
}

export interface JoinMeetingInput {
  meetingCode?: string;
  meetingLink?: string;
  password?: string;
  displayName?: string;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
}

export interface MeetingRoomState {
  meetingId: string;
  localParticipant: MeetingParticipant;
  remoteParticipants: MeetingParticipant[];
  isConnected: boolean;
  isReconnecting: boolean;
  
  // Local controls
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  
  // Meeting info
  duration: number; // seconds since start
  activeSpeakerId?: string;
  screenShareParticipantId?: string;
  
  // Chat
  messages: MeetingChatMessage[];
}

export interface MeetingChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isPrivate?: boolean;
  recipientId?: string;
}

export interface MeetingInvitation {
  meetingId: string;
  meetingCode: string;
  title: string;
  hostName: string;
  scheduledStartTime: string;
  duration: number;
  meetingLink: string;
  status: 'pending' | 'accepted' | 'declined';
}

// ==================== API RESPONSES ====================

export interface MeetingListResponse {
  meetings: ScheduledMeeting[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateMeetingResponse {
  meeting: ScheduledMeeting;
  meetingLink: string;
  hostLink: string;
  dialInInfo?: {
    number: string;
    pin: string;
  };
}

export interface JoinMeetingResponse {
  meeting: ScheduledMeeting;
  participant: MeetingParticipant;
  token: string; // for WebRTC/video call
  iceServers: RTCIceServer[];
}

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}
