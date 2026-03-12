/**
 * Communication & Collaboration Types
 * Team messaging, video calls, and collaboration tools
 */

// Message types
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  POLL = 'POLL',
  TASK = 'TASK',
  MEETING = 'MEETING',
  SYSTEM = 'SYSTEM',
}

// Message status
export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

// Channel types
export enum ChannelType {
  DIRECT = 'DIRECT', // 1-on-1
  GROUP = 'GROUP', // Private group
  PROJECT = 'PROJECT', // Project channel
  ANNOUNCEMENT = 'ANNOUNCEMENT', // Broadcast only
  PUBLIC = 'PUBLIC', // Public channel
}

// Call types
export enum CallType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  SCREEN_SHARE = 'SCREEN_SHARE',
}

// Call status
export enum CallStatus {
  RINGING = 'RINGING',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ENDED = 'ENDED',
  MISSED = 'MISSED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
}

// Meeting status
export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Participant role
export enum ParticipantRole {
  HOST = 'HOST',
  CO_HOST = 'CO_HOST',
  PARTICIPANT = 'PARTICIPANT',
  OBSERVER = 'OBSERVER',
}

// Reaction types
export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  CELEBRATE = 'CELEBRATE',
  THUMBS_UP = 'THUMBS_UP',
  THUMBS_DOWN = 'THUMBS_DOWN',
  FIRE = 'FIRE',
  CLAP = 'CLAP',
  THINKING = 'THINKING',
}

// Message
export interface Message {
  id: string;
  channelId: string;
  threadId?: string; // For threaded replies
  type: MessageType;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  status: MessageStatus;
  attachments?: Attachment[];
  mentions?: string[]; // User IDs mentioned
  reactions?: Reaction[];
  replyTo?: string; // Message ID
  replyToMessage?: Message;
  edited: boolean;
  editedAt?: string;
  deleted: boolean;
  deletedAt?: string;
  metadata?: any; // For polls, tasks, etc.
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  readBy?: string[]; // User IDs who read the message
}

// Attachment
export interface Attachment {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'DOCUMENT';
  filename: string;
  url: string;
  thumbnailUrl?: string;
  size: number; // bytes
  mimeType: string;
  duration?: number; // for audio/video in seconds
  width?: number; // for images/videos
  height?: number;
  uploadedAt: string;
}

// Reaction
export interface Reaction {
  type: ReactionType;
  userId: string;
  userName: string;
  createdAt: string;
}

// Channel
export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  description?: string;
  avatar?: string;
  projectId?: string;
  projectName?: string;
  members: ChannelMember[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  lastMessageAt?: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  settings?: ChannelSettings;
}

// Channel member
export interface ChannelMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  lastReadAt?: string;
  isMuted: boolean;
  isActive: boolean;
}

// Channel settings
export interface ChannelSettings {
  allowFileSharing: boolean;
  allowLinkPreviews: boolean;
  allowReactions: boolean;
  allowThreads: boolean;
  allowPolls: boolean;
  requireApprovalToJoin: boolean;
  notifyOnMention: boolean;
  notifyOnMessage: boolean;
}

// Call
export interface Call {
  id: string;
  type: CallType;
  status: CallStatus;
  channelId?: string;
  participants: CallParticipant[];
  initiatorId: string;
  initiatorName: string;
  startedAt: string;
  endedAt?: string;
  duration?: number; // seconds
  recordingUrl?: string;
  metadata?: any;
}

// Call participant
export interface CallParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: ParticipantRole;
  joinedAt: string;
  leftAt?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'DISCONNECTED';
}

// Meeting
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  type: CallType;
  status: MeetingStatus;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  location?: string; // Physical or virtual
  meetingUrl?: string;
  passcode?: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  participants: MeetingParticipant[];
  agenda?: string;
  attachments?: Attachment[];
  notes?: string;
  recordingUrl?: string;
  recordingDuration?: number;
  allowRecording: boolean;
  requirePassword: boolean;
  allowWaitingRoom: boolean;
  muteParticipantsOnEntry: boolean;
  createdAt: string;
  updatedAt: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
}

// Meeting participant
export interface MeetingParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: ParticipantRole;
  rsvp: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NO_RESPONSE';
  rsvpAt?: string;
  joinedAt?: string;
  leftAt?: string;
  attendanceDuration?: number; // minutes
}

// Poll
export interface Poll {
  id: string;
  messageId: string;
  channelId: string;
  question: string;
  options: PollOption[];
  allowMultipleChoice: boolean;
  allowAddOptions: boolean;
  isAnonymous: boolean;
  expiresAt?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  totalVotes: number;
  isActive: boolean;
}

// Poll option
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters?: string[]; // User IDs (if not anonymous)
}

// Notification preferences
export interface NotificationPreferences {
  userId: string;
  channels: {
    [channelId: string]: {
      enabled: boolean;
      muteUntil?: string;
      onlyMentions: boolean;
    };
  };
  globalSettings: {
    directMessages: boolean;
    mentions: boolean;
    reactions: boolean;
    calls: boolean;
    meetings: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    startTime?: string; // HH:mm
    endTime?: string;
  };
}

// Typing indicator
export interface TypingIndicator {
  channelId: string;
  userId: string;
  userName: string;
  startedAt: string;
}

// Online status
export interface OnlineStatus {
  userId: string;
  status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  lastSeenAt: string;
  customStatus?: {
    emoji?: string;
    text?: string;
    expiresAt?: string;
  };
}

// Screen share session
export interface ScreenShareSession {
  id: string;
  callId: string;
  userId: string;
  userName: string;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
}

// Whiteboard session
export interface WhiteboardSession {
  id: string;
  meetingId: string;
  createdBy: string;
  createdByName: string;
  participants: string[]; // User IDs with edit access
  content: any; // Canvas data
  createdAt: string;
  updatedAt: string;
  snapshots?: WhiteboardSnapshot[];
}

// Whiteboard snapshot
export interface WhiteboardSnapshot {
  id: string;
  content: any;
  createdBy: string;
  createdAt: string;
  label?: string;
}

// API request/response types
export interface SendMessageParams {
  channelId: string;
  type: MessageType;
  content: string;
  attachments?: File[];
  mentions?: string[];
  replyTo?: string;
  metadata?: any;
}

export interface UpdateMessageParams {
  id: string;
  content?: string;
  attachments?: File[];
}

export interface CreateChannelParams {
  type: ChannelType;
  name: string;
  description?: string;
  projectId?: string;
  members: string[]; // User IDs
  settings?: Partial<ChannelSettings>;
}

export interface UpdateChannelParams {
  id: string;
  name?: string;
  description?: string;
  avatar?: string;
  settings?: Partial<ChannelSettings>;
}

export interface AddChannelMembersParams {
  channelId: string;
  userIds: string[];
  role?: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export interface StartCallParams {
  type: CallType;
  channelId?: string;
  participantIds: string[];
}

export interface CreateMeetingParams {
  title: string;
  description?: string;
  projectId?: string;
  type: CallType;
  startTime: string;
  duration: number; // minutes
  location?: string;
  participantIds: string[];
  participantEmails?: string[];
  agenda?: string;
  allowRecording?: boolean;
  requirePassword?: boolean;
  allowWaitingRoom?: boolean;
}

export interface UpdateMeetingParams {
  id: string;
  title?: string;
  description?: string;
  startTime?: string;
  duration?: number;
  location?: string;
  agenda?: string;
  notes?: string;
}

export interface CreatePollParams {
  channelId: string;
  question: string;
  options: string[];
  allowMultipleChoice?: boolean;
  allowAddOptions?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string;
}

export interface VotePollParams {
  pollId: string;
  optionIds: string[];
}

export interface GetMessagesParams {
  channelId: string;
  limit?: number;
  before?: string; // Message ID for pagination
  after?: string;
}

export interface GetChannelsParams {
  type?: ChannelType;
  projectId?: string;
  includeArchived?: boolean;
}

export interface GetMeetingsParams {
  projectId?: string;
  status?: MeetingStatus;
  fromDate?: string;
  toDate?: string;
  userId?: string;
}

export interface SearchMessagesParams {
  query: string;
  channelId?: string;
  fromDate?: string;
  toDate?: string;
  senderId?: string;
  hasAttachments?: boolean;
}
