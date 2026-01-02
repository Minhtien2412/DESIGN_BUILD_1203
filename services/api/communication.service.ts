/**
 * Team Communication Service
 * Handle team chat, announcements, file sharing, meeting notes
 */

import { BaseApiService } from './base.service';
import type { ApiResponse } from './types';

// ==================== TYPES ====================

export type MessageType = 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
export type ChannelType = 'PROJECT' | 'TEAM' | 'DIRECT' | 'ANNOUNCEMENT';
export type MemberRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';

export interface Channel {
  id: number;
  projectId?: number;
  type: ChannelType;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  memberCount: number;
  unreadCount?: number;
  lastMessage?: Message;
  lastMessageAt?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  channelId: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: number;
  replyTo?: Message;
  mentions: number[];
  reactions: MessageReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: number[];
}

export interface ChannelMember {
  id: number;
  channelId: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  role: MemberRole;
  joinedAt: string;
  lastReadAt?: string;
}

export interface Announcement {
  id: number;
  projectId: number;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isPinned: boolean;
  attachments: AnnouncementAttachment[];
  targetAudience: 'ALL' | 'TEAM' | 'CLIENTS' | 'CONTRACTORS';
  publishedBy: number;
  publishedByName?: string;
  publishedAt?: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export interface MeetingNote {
  id: number;
  projectId: number;
  title: string;
  meetingDate: string;
  duration?: number; // minutes
  location?: string;
  attendees: MeetingAttendee[];
  agenda: string[];
  notes: string;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  attachments: string[];
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingAttendee {
  userId: number;
  userName?: string;
  role?: string;
  isPresent: boolean;
}

export interface MeetingDecision {
  id: number;
  description: string;
  decidedBy: number;
  decidedByName?: string;
  decidedAt: string;
}

export interface MeetingActionItem {
  id: number;
  description: string;
  assignedTo: number;
  assignedToName?: string;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string;
}

export interface FileShare {
  id: number;
  channelId?: number;
  projectId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  tags: string[];
  sharedBy: number;
  sharedByName?: string;
  downloadCount: number;
  createdAt: string;
}

export interface CreateChannelData {
  projectId?: number;
  type: ChannelType;
  name: string;
  description?: string;
  isPrivate: boolean;
  memberIds?: number[];
}

export interface UpdateChannelData {
  name?: string;
  description?: string;
  avatar?: string;
  isPrivate?: boolean;
}

export interface SendMessageData {
  channelId: number;
  type?: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  replyToId?: number;
  mentions?: number[];
}

export interface CreateAnnouncementData {
  projectId: number;
  title: string;
  content: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isPinned?: boolean;
  targetAudience?: 'ALL' | 'TEAM' | 'CLIENTS' | 'CONTRACTORS';
  expiresAt?: string;
  attachments?: Array<{ name: string; url: string; type: string; size: number }> | File[];
}

export interface CreateMeetingNoteData {
  projectId: number;
  title: string;
  meetingDate: string;
  duration?: number;
  location?: string;
  attendees: Omit<MeetingAttendee, 'userName'>[];
  agenda: string[];
  notes: string;
  decisions?: Omit<MeetingDecision, 'id' | 'decidedByName' | 'decidedAt'>[];
  actionItems?: Omit<MeetingActionItem, 'id' | 'assignedToName'>[];
}

export interface MessageFilters {
  channelId: number;
  before?: string; // message ID for pagination
  after?: string;
  limit?: number;
  search?: string;
  type?: MessageType;
  userId?: number;
}

// ==================== SERVICE ====================

class CommunicationService extends BaseApiService {
  constructor() {
    super('Communication', {
      retry: {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 5000,
      },
      cache: {
        enabled: false, // Real-time data, minimal caching
        ttl: 30 * 1000, // 30 seconds for channels list
      },
      offlineSupport: true,
    });
  }

  // ==================== CHANNELS ====================

  /**
   * Get user's channels
   */
  async getChannels(projectId?: number): Promise<ApiResponse<Channel[]>> {
    return this.get<ApiResponse<Channel[]>>('/channels', { projectId }, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get channel by ID
   */
  async getChannel(id: number): Promise<ApiResponse<Channel>> {
    return this.get<ApiResponse<Channel>>(`/channels/${id}`);
  }

  /**
   * Create channel
   */
  async createChannel(data: CreateChannelData): Promise<ApiResponse<Channel>> {
    const result = await this.post<ApiResponse<Channel>>('/channels', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/channels');

    return result;
  }

  /**
   * Update channel
   */
  async updateChannel(id: number, data: UpdateChannelData): Promise<ApiResponse<Channel>> {
    const result = await this.put<ApiResponse<Channel>>(`/channels/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/channels');

    return result;
  }

  /**
   * Delete channel
   */
  async deleteChannel(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/channels/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/channels');

    return result;
  }

  // ==================== CHANNEL MEMBERS ====================

  /**
   * Get channel members
   */
  async getChannelMembers(channelId: number): Promise<ApiResponse<ChannelMember[]>> {
    return this.get<ApiResponse<ChannelMember[]>>(`/channels/${channelId}/members`);
  }

  /**
   * Add member to channel
   */
  async addMember(channelId: number, userId: number, role: MemberRole = 'MEMBER'): Promise<ApiResponse<ChannelMember>> {
    return this.post<ApiResponse<ChannelMember>>(`/channels/${channelId}/members`, {
      userId,
      role,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Remove member from channel
   */
  async removeMember(channelId: number, userId: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/channels/${channelId}/members/${userId}`, {
      offlineQueue: true,
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(channelId: number, userId: number, role: MemberRole): Promise<ApiResponse<ChannelMember>> {
    return this.put<ApiResponse<ChannelMember>>(`/channels/${channelId}/members/${userId}`, {
      role,
    }, {
      offlineQueue: true,
    });
  }

  // ==================== MESSAGES ====================

  /**
   * Get messages for channel
   */
  async getMessages(filters: MessageFilters): Promise<ApiResponse<Message[]>> {
    return this.get<ApiResponse<Message[]>>('/messages', filters as any);
  }

  /**
   * Send message
   */
  async sendMessage(data: SendMessageData): Promise<ApiResponse<Message>> {
    return this.post<ApiResponse<Message>>('/messages', data, {
      offlineQueue: true,
    });
  }

  /**
   * Update message
   */
  async updateMessage(id: number, content: string): Promise<ApiResponse<Message>> {
    return this.put<ApiResponse<Message>>(`/messages/${id}`, { content }, {
      offlineQueue: true,
    });
  }

  /**
   * Delete message
   */
  async deleteMessage(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/messages/${id}`, {
      offlineQueue: true,
    });
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: number, emoji: string): Promise<ApiResponse<Message>> {
    return this.post<ApiResponse<Message>>(`/messages/${messageId}/reactions`, { emoji }, {
      offlineQueue: true,
    });
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: number, emoji: string): Promise<ApiResponse<Message>> {
    return this.delete<ApiResponse<Message>>(`/messages/${messageId}/reactions/${emoji}`, {
      offlineQueue: true,
    });
  }

  /**
   * Mark channel as read
   */
  async markAsRead(channelId: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`/channels/${channelId}/read`, undefined, {
      offlineQueue: true,
    });
  }

  // ==================== ANNOUNCEMENTS ====================

  /**
   * Get announcements for project
   */
  async getAnnouncements(projectId: number, includePast: boolean = false): Promise<ApiResponse<Announcement[]>> {
    return this.get<ApiResponse<Announcement[]>>('/announcements', {
      projectId,
      includePast,
    }, {
      cache: true,
    });
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncement(id: number): Promise<ApiResponse<Announcement>> {
    return this.get<ApiResponse<Announcement>>(`/announcements/${id}`);
  }

  /**
   * Create announcement
   */
  async createAnnouncement(data: CreateAnnouncementData): Promise<ApiResponse<Announcement>> {
    const formData = new FormData();
    formData.append('projectId', data.projectId.toString());
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    if (data.priority) formData.append('priority', data.priority);
    if (data.isPinned) formData.append('isPinned', data.isPinned.toString());
    if (data.targetAudience) formData.append('targetAudience', data.targetAudience);
    if (data.expiresAt) formData.append('expiresAt', data.expiresAt);
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        // Only append actual File objects to FormData
        if (file instanceof File) {
          formData.append(`attachments[${index}]`, file);
        } else {
          // For metadata objects, send as JSON string
          formData.append(`attachments[${index}]`, JSON.stringify(file));
        }
      });
    }

    const result = await this.post<ApiResponse<Announcement>>('/announcements', formData, {
      offlineQueue: false,
    });

    await this.invalidateCache('/announcements');

    return result;
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id: number, data: Partial<CreateAnnouncementData>): Promise<ApiResponse<Announcement>> {
    const result = await this.put<ApiResponse<Announcement>>(`/announcements/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/announcements');

    return result;
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/announcements/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/announcements');

    return result;
  }

  /**
   * Track announcement view
   */
  async trackView(id: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`/announcements/${id}/view`, undefined, {
      offlineQueue: true,
    });
  }

  // ==================== MEETING NOTES ====================

  /**
   * Get meeting notes for project
   */
  async getMeetingNotes(projectId: number): Promise<ApiResponse<MeetingNote[]>> {
    return this.get<ApiResponse<MeetingNote[]>>('/meeting-notes', { projectId }, {
      cache: true,
    });
  }

  /**
   * Get meeting note by ID
   */
  async getMeetingNote(id: number): Promise<ApiResponse<MeetingNote>> {
    return this.get<ApiResponse<MeetingNote>>(`/meeting-notes/${id}`);
  }

  /**
   * Create meeting note
   */
  async createMeetingNote(data: CreateMeetingNoteData): Promise<ApiResponse<MeetingNote>> {
    const result = await this.post<ApiResponse<MeetingNote>>('/meeting-notes', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/meeting-notes');

    return result;
  }

  /**
   * Update meeting note
   */
  async updateMeetingNote(id: number, data: Partial<CreateMeetingNoteData>): Promise<ApiResponse<MeetingNote>> {
    const result = await this.put<ApiResponse<MeetingNote>>(`/meeting-notes/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/meeting-notes');

    return result;
  }

  /**
   * Delete meeting note
   */
  async deleteMeetingNote(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/meeting-notes/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/meeting-notes');

    return result;
  }

  /**
   * Update action item status
   */
  async updateActionItem(
    meetingId: number,
    actionItemId: number,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<ApiResponse<MeetingNote>> {
    return this.put<ApiResponse<MeetingNote>>(
      `/meeting-notes/${meetingId}/action-items/${actionItemId}`,
      { status },
      { offlineQueue: true }
    );
  }

  // ==================== FILE SHARING ====================

  /**
   * Upload shared file
   */
  async uploadFile(
    projectId: number,
    file: File | Blob,
    description?: string,
    tags?: string[],
    channelId?: number
  ): Promise<ApiResponse<FileShare>> {
    const formData = new FormData();
    formData.append('file', file as any);
    formData.append('projectId', projectId.toString());
    
    if (description) formData.append('description', description);
    if (tags) formData.append('tags', JSON.stringify(tags));
    if (channelId) formData.append('channelId', channelId.toString());

    return this.post<ApiResponse<FileShare>>('/shared-files', formData, {
      offlineQueue: false,
    });
  }

  /**
   * Get shared files
   */
  async getSharedFiles(projectId: number, channelId?: number): Promise<ApiResponse<FileShare[]>> {
    return this.get<ApiResponse<FileShare[]>>('/shared-files', {
      projectId,
      channelId,
    }, {
      cache: true,
    });
  }

  /**
   * Delete shared file
   */
  async deleteSharedFile(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/shared-files/${id}`, {
      offlineQueue: true,
    });
  }

  /**
   * Track file download
   */
  async trackDownload(id: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`/shared-files/${id}/download`, undefined, {
      offlineQueue: true,
    });
  }

  // ==================== SEARCH ====================

  /**
   * Search messages
   */
  async searchMessages(channelId: number, query: string): Promise<ApiResponse<Message[]>> {
    return this.get<ApiResponse<Message[]>>('/messages/search', {
      channelId,
      q: query,
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<ApiResponse<{ total: number; byChannel: Record<number, number> }>> {
    return this.get<ApiResponse<any>>('/channels/unread-count');
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();
export default communicationService;
