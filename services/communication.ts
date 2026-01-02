/**
 * Communication & Collaboration Service
 * API integration for messaging, calls, and meetings
 */

import type {
    AddChannelMembersParams,
    Call,
    Channel,
    CreateChannelParams,
    CreateMeetingParams,
    CreatePollParams,
    GetChannelsParams,
    GetMeetingsParams,
    GetMessagesParams,
    Meeting,
    Message,
    NotificationPreferences,
    OnlineStatus,
    Poll,
    SearchMessagesParams,
    SendMessageParams,
    StartCallParams,
    UpdateChannelParams,
    UpdateMeetingParams,
    UpdateMessageParams,
    VotePollParams,
} from '@/types/communication';
import { apiFetch } from './api';

// Messages
export async function getMessages(params: GetMessagesParams): Promise<Message[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('channelId', params.channelId);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.before) queryParams.append('before', params.before);
  if (params.after) queryParams.append('after', params.after);

  return apiFetch(`/messages?${queryParams.toString()}`);
}

export async function getMessage(id: string): Promise<Message> {
  return apiFetch(`/messages/${id}`);
}

export async function sendMessage(params: SendMessageParams): Promise<Message> {
  const formData = new FormData();
  formData.append('channelId', params.channelId);
  formData.append('type', params.type);
  formData.append('content', params.content);
  
  if (params.attachments) {
    params.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }
  
  if (params.mentions) {
    formData.append('mentions', JSON.stringify(params.mentions));
  }
  
  if (params.replyTo) {
    formData.append('replyTo', params.replyTo);
  }
  
  if (params.metadata) {
    formData.append('metadata', JSON.stringify(params.metadata));
  }

  return apiFetch('/messages', {
    method: 'POST',
    body: formData,
  });
}

export async function updateMessage(params: UpdateMessageParams): Promise<Message> {
  const { id, ...data } = params;
  return apiFetch(`/messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMessage(id: string): Promise<void> {
  return apiFetch(`/messages/${id}`, {
    method: 'DELETE',
  });
}

export async function addReaction(messageId: string, reaction: string): Promise<Message> {
  return apiFetch(`/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ reaction }),
  });
}

export async function removeReaction(messageId: string, reaction: string): Promise<Message> {
  return apiFetch(`/messages/${messageId}/reactions/${reaction}`, {
    method: 'DELETE',
  });
}

export async function markAsRead(channelId: string): Promise<void> {
  return apiFetch(`/channels/${channelId}/read`, {
    method: 'POST',
  });
}

export async function searchMessages(params: SearchMessagesParams): Promise<Message[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('query', params.query);
  if (params.channelId) queryParams.append('channelId', params.channelId);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.senderId) queryParams.append('senderId', params.senderId);
  if (params.hasAttachments !== undefined) {
    queryParams.append('hasAttachments', params.hasAttachments.toString());
  }

  return apiFetch(`/messages/search?${queryParams.toString()}`);
}

// Channels
export async function getChannels(params: GetChannelsParams): Promise<Channel[]> {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.append('type', params.type);
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.includeArchived !== undefined) {
    queryParams.append('includeArchived', params.includeArchived.toString());
  }

  return apiFetch(`/channels?${queryParams.toString()}`);
}

export async function getChannel(id: string): Promise<Channel> {
  return apiFetch(`/channels/${id}`);
}

export async function createChannel(params: CreateChannelParams): Promise<Channel> {
  return apiFetch('/channels', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateChannel(params: UpdateChannelParams): Promise<Channel> {
  const { id, ...data } = params;
  return apiFetch(`/channels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteChannel(id: string): Promise<void> {
  return apiFetch(`/channels/${id}`, {
    method: 'DELETE',
  });
}

export async function addChannelMembers(params: AddChannelMembersParams): Promise<Channel> {
  const { channelId, ...data } = params;
  return apiFetch(`/channels/${channelId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function removeChannelMember(channelId: string, userId: string): Promise<Channel> {
  return apiFetch(`/channels/${channelId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export async function leaveChannel(channelId: string): Promise<void> {
  return apiFetch(`/channels/${channelId}/leave`, {
    method: 'POST',
  });
}

export async function muteChannel(channelId: string, muteUntil?: string): Promise<Channel> {
  return apiFetch(`/channels/${channelId}/mute`, {
    method: 'POST',
    body: JSON.stringify({ muteUntil }),
  });
}

export async function unmuteChannel(channelId: string): Promise<Channel> {
  return apiFetch(`/channels/${channelId}/unmute`, {
    method: 'POST',
  });
}

export async function pinChannel(channelId: string): Promise<Channel> {
  return apiFetch(`/channels/${channelId}/pin`, {
    method: 'POST',
  });
}

export async function unpinChannel(channelId: string): Promise<Channel> {
  return apiFetch(`/channels/${channelId}/unpin`, {
    method: 'POST',
  });
}

export async function archiveChannel(channelId: string): Promise<Channel> {
  return apiFetch(`/channels/${channelId}/archive`, {
    method: 'POST',
  });
}

// Calls
export async function startCall(params: StartCallParams): Promise<Call> {
  return apiFetch('/calls', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function joinCall(callId: string): Promise<Call> {
  return apiFetch(`/calls/${callId}/join`, {
    method: 'POST',
  });
}

export async function leaveCall(callId: string): Promise<void> {
  return apiFetch(`/calls/${callId}/leave`, {
    method: 'POST',
  });
}

export async function endCall(callId: string): Promise<Call> {
  return apiFetch(`/calls/${callId}/end`, {
    method: 'POST',
  });
}

export async function toggleMute(callId: string, isMuted: boolean): Promise<Call> {
  return apiFetch(`/calls/${callId}/mute`, {
    method: 'POST',
    body: JSON.stringify({ isMuted }),
  });
}

export async function toggleVideo(callId: string, isVideoEnabled: boolean): Promise<Call> {
  return apiFetch(`/calls/${callId}/video`, {
    method: 'POST',
    body: JSON.stringify({ isVideoEnabled }),
  });
}

export async function startScreenShare(callId: string): Promise<Call> {
  return apiFetch(`/calls/${callId}/screen-share/start`, {
    method: 'POST',
  });
}

export async function stopScreenShare(callId: string): Promise<Call> {
  return apiFetch(`/calls/${callId}/screen-share/stop`, {
    method: 'POST',
  });
}

// Meetings
export async function getMeetings(params: GetMeetingsParams): Promise<Meeting[]> {
  const queryParams = new URLSearchParams();
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.status) queryParams.append('status', params.status);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.userId) queryParams.append('userId', params.userId);

  return apiFetch(`/meetings?${queryParams.toString()}`);
}

export async function getMeeting(id: string): Promise<Meeting> {
  return apiFetch(`/meetings/${id}`);
}

export async function createMeeting(params: CreateMeetingParams): Promise<Meeting> {
  return apiFetch('/meetings', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateMeeting(params: UpdateMeetingParams): Promise<Meeting> {
  const { id, ...data } = params;
  return apiFetch(`/meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMeeting(id: string): Promise<void> {
  return apiFetch(`/meetings/${id}`, {
    method: 'DELETE',
  });
}

export async function respondToMeeting(id: string, rsvp: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'): Promise<Meeting> {
  return apiFetch(`/meetings/${id}/rsvp`, {
    method: 'POST',
    body: JSON.stringify({ rsvp }),
  });
}

export async function startMeeting(id: string): Promise<Meeting> {
  return apiFetch(`/meetings/${id}/start`, {
    method: 'POST',
  });
}

export async function endMeeting(id: string): Promise<Meeting> {
  return apiFetch(`/meetings/${id}/end`, {
    method: 'POST',
  });
}

// Polls
export async function createPoll(params: CreatePollParams): Promise<Poll> {
  return apiFetch('/polls', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function votePoll(params: VotePollParams): Promise<Poll> {
  const { pollId, ...data } = params;
  return apiFetch(`/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function closePoll(pollId: string): Promise<Poll> {
  return apiFetch(`/polls/${pollId}/close`, {
    method: 'POST',
  });
}

// Online status
export async function getOnlineStatus(userId: string): Promise<OnlineStatus> {
  return apiFetch(`/users/${userId}/status`);
}

export async function updateOnlineStatus(status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE', customStatus?: any): Promise<OnlineStatus> {
  return apiFetch('/users/me/status', {
    method: 'PUT',
    body: JSON.stringify({ status, customStatus }),
  });
}

// Typing indicators
export async function sendTypingIndicator(channelId: string): Promise<void> {
  return apiFetch(`/channels/${channelId}/typing`, {
    method: 'POST',
  });
}

// Notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiFetch('/users/me/notification-preferences');
}

export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  return apiFetch('/users/me/notification-preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
}

// File uploads
export async function uploadFile(file: File, channelId: string): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('channelId', channelId);

  return apiFetch('/files/upload', {
    method: 'POST',
    body: formData,
  });
}

// Message threads
export async function getThread(messageId: string): Promise<Message[]> {
  return apiFetch(`/messages/${messageId}/thread`);
}
