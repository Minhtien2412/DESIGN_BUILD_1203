/**
 * Communication Types
 * Shared types for Call, Chat, and LiveStream
 */

// ==================== USER TYPES ====================

export interface CommunicationUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

// ==================== CALL TYPES ====================

export type CallType = 'video' | 'audio';
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';
export type CallEndReason = 'completed' | 'declined' | 'busy' | 'timeout' | 'error' | 'cancelled';

export interface CallParticipant extends CommunicationUser {
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  joinedAt?: Date;
  stream?: MediaStream;
}

export interface CallSession {
  id: string;
  type: CallType;
  status: CallStatus;
  participants: CallParticipant[];
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  roomId: string;
  isGroupCall: boolean;
  recordingUrl?: string;
}

export interface CallConfig {
  enableVideo: boolean;
  enableAudio: boolean;
  enableScreenShare: boolean;
  maxParticipants: number;
  recordCall: boolean;
}

export interface IncomingCallPayload {
  callId: string;
  caller: CommunicationUser;
  type: CallType;
  roomId: string;
  isGroupCall: boolean;
}

// ==================== CHAT TYPES ====================

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'location' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationType = 'direct' | 'group' | 'channel';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: MessageAttachment[];
  replyTo?: string;
  reactions?: MessageReaction[];
  mentions?: string[];
  createdAt: Date;
  updatedAt?: Date;
  readBy?: string[];
  sender?: CommunicationUser;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  duration?: number; // for audio/video
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatar?: string;
  participants: CommunicationUser[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// ==================== LIVESTREAM TYPES ====================

export type StreamStatus = 'preparing' | 'live' | 'paused' | 'ended';
export type StreamQuality = '360p' | '480p' | '720p' | '1080p' | '4k';

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  host: CommunicationUser;
  status: StreamStatus;
  thumbnail?: string;
  viewerCount: number;
  peakViewers: number;
  startedAt?: Date;
  endedAt?: Date;
  duration: number;
  tags: string[];
  isRecording: boolean;
  recordingUrl?: string;
  playbackUrl: string;
  streamKey?: string;
  quality: StreamQuality;
}

export interface StreamComment {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  isPinned: boolean;
  isHighlighted: boolean;
}

export interface StreamGift {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  giftType: string;
  giftValue: number;
  message?: string;
  createdAt: Date;
}

export interface StreamConfig {
  title: string;
  description?: string;
  quality: StreamQuality;
  enableChat: boolean;
  enableGifts: boolean;
  isRecording: boolean;
  tags?: string[];
}

// ==================== EVENT TYPES ====================

export interface CommunicationEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
  userId?: string;
}

export type CallEvent = 
  | { type: 'call:incoming'; payload: IncomingCallPayload }
  | { type: 'call:accepted'; payload: { callId: string } }
  | { type: 'call:rejected'; payload: { callId: string; reason: string } }
  | { type: 'call:ended'; payload: { callId: string; reason: CallEndReason; duration: number } }
  | { type: 'call:participant_joined'; payload: { callId: string; participant: CallParticipant } }
  | { type: 'call:participant_left'; payload: { callId: string; participantId: string } }
  | { type: 'call:muted'; payload: { callId: string; participantId: string; isMuted: boolean } }
  | { type: 'call:video_toggled'; payload: { callId: string; participantId: string; isVideoOff: boolean } };

export type ChatEvent =
  | { type: 'message:new'; payload: Message }
  | { type: 'message:updated'; payload: Message }
  | { type: 'message:deleted'; payload: { messageId: string; conversationId: string } }
  | { type: 'message:read'; payload: { messageId: string; conversationId: string; readBy: string[] } }
  | { type: 'typing:start'; payload: TypingIndicator }
  | { type: 'typing:stop'; payload: { conversationId: string; userId: string } }
  | { type: 'conversation:updated'; payload: Conversation };

export type StreamEvent =
  | { type: 'stream:started'; payload: LiveStream }
  | { type: 'stream:ended'; payload: { streamId: string; duration: number } }
  | { type: 'stream:comment'; payload: StreamComment }
  | { type: 'stream:gift'; payload: StreamGift }
  | { type: 'stream:viewer_joined'; payload: { streamId: string; userId: string } }
  | { type: 'stream:viewer_left'; payload: { streamId: string; userId: string } }
  | { type: 'stream:viewer_count'; payload: { streamId: string; count: number } };

// ==================== MEDIA TYPES ====================

export type MediaType = 'image' | 'video' | 'audio' | 'file';
export type MediaState = 'idle' | 'recording' | 'playing' | 'paused' | 'stopped';

export interface MediaConfig {
  audio: {
    sampleRate: number;
    channels: number;
    bitRate: number;
    format: string;
  };
  video: {
    quality: 'low' | 'medium' | 'high';
    maxDuration: number;
    maxFileSize: number;
    codec: string;
  };
  image: {
    quality: number;
    maxWidth: number;
    maxHeight: number;
    format: string;
  };
}

// ==================== ADDITIONAL CALL TYPES ====================

export interface Call {
  id: string;
  type: CallType;
  status: CallStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  participants: (CommunicationUser & { role?: 'caller' | 'callee' | 'participant' })[];
  initiator: CommunicationUser;
  isGroup: boolean;
  roomId?: string;
  recordingUrl?: string;
}
