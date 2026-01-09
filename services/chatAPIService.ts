/**
 * Chat API Service - Tích hợp dữ liệu tin nhắn thật từ Backend
 * Kết hợp với communication.service.ts và chat.service.ts
 */

import { ChatRoom as APIChatRoom, ChatMessage as APIMessage, chatService } from './api/chat.service';
import communicationService, {
    Channel,
    ChannelMember,
    Message,
    MessageFilters
} from './api/communication.service';
import type { Attachment, ChatMessage, ChatParticipant, ChatRoom, MessageStatus, MessageType } from './ChatService';

// ==================== API ENDPOINTS ====================

const API_BASE = 'https://baotienweb.cloud/api/v1';

// ==================== TYPE CONVERTERS ====================

/**
 * Convert API Message to ChatMessage format
 */
export function convertAPIMessageToChatMessage(msg: Message | APIMessage): ChatMessage {
  if ('channelId' in msg) {
    // From communication.service Message
    const commMsg = msg as Message;
    return {
      id: String(commMsg.id),
      chatId: String(commMsg.channelId),
      senderId: String(commMsg.userId),
      senderName: commMsg.userName || 'Unknown',
      senderAvatar: commMsg.userAvatar,
      type: convertMessageType(commMsg.type),
      content: commMsg.content,
      attachments: commMsg.fileUrl ? [{
        type: getAttachmentType(commMsg.fileUrl),
        url: commMsg.fileUrl,
        name: commMsg.fileName,
        size: commMsg.fileSize,
      }] : undefined,
      reactions: commMsg.reactions?.map(r => ({
        emoji: r.emoji,
        userId: String(r.userIds[0] || 0),
        userName: '',
        timestamp: Date.now(),
      })),
      replyTo: commMsg.replyTo ? {
        id: String(commMsg.replyTo.id),
        senderId: String(commMsg.replyTo.userId),
        senderName: commMsg.replyTo.userName || '',
        content: commMsg.replyTo.content,
        type: convertMessageType(commMsg.replyTo.type),
      } : undefined,
      status: commMsg.isDeleted ? 'failed' : 'read',
      timestamp: new Date(commMsg.createdAt).getTime(),
      editedAt: commMsg.isEdited ? new Date(commMsg.updatedAt).getTime() : undefined,
    };
  } else {
    // From chat.service ChatMessage
    const chatMsg = msg as APIMessage;
    return {
      id: String(chatMsg.id),
      chatId: String(chatMsg.roomId),
      senderId: String(chatMsg.senderId),
      senderName: chatMsg.sender?.name || 'Unknown',
      senderAvatar: chatMsg.sender?.avatar,
      type: convertMessageType(chatMsg.type as any),
      content: chatMsg.content,
      attachments: chatMsg.attachments?.map(url => ({
        type: getAttachmentType(url),
        url,
      })),
      status: chatMsg.readBy?.length > 0 ? 'read' : 'delivered',
      timestamp: new Date(chatMsg.createdAt).getTime(),
      readBy: chatMsg.readBy?.map(String),
    };
  }
}

/**
 * Convert API Channel to ChatRoom format
 */
export function convertChannelToChatRoom(channel: Channel): ChatRoom {
  return {
    id: String(channel.id),
    name: channel.name,
    avatar: channel.avatar,
    type: channel.type === 'DIRECT' ? 'private' : channel.type === 'PROJECT' ? 'channel' : 'group',
    participants: [], // Will be loaded separately
    lastMessage: channel.lastMessage ? convertAPIMessageToChatMessage(channel.lastMessage) : undefined,
    unreadCount: channel.unreadCount || 0,
    isPinned: false,
    isMuted: false,
    createdAt: new Date(channel.createdAt).getTime(),
    updatedAt: new Date(channel.updatedAt).getTime(),
  };
}

/**
 * Convert API ChatRoom to ChatRoom format
 */
export function convertAPIChatRoomToChatRoom(room: APIChatRoom): ChatRoom {
  return {
    id: String(room.id),
    name: room.name,
    type: room.type === 'DIRECT' ? 'private' : room.type === 'PROJECT' ? 'channel' : 'group',
    participants: room.members?.map(m => ({
      id: String(m.userId),
      name: m.user?.name || '',
      avatar: m.user?.avatar,
      role: m.role === 'OWNER' || m.role === 'ADMIN' ? 'admin' : 'member',
    })) || [],
    lastMessage: room.lastMessage ? convertAPIMessageToChatMessage(room.lastMessage) : undefined,
    unreadCount: room.unreadCount || 0,
    createdAt: new Date(room.createdAt).getTime(),
    updatedAt: new Date(room.updatedAt).getTime(),
  };
}

/**
 * Convert ChannelMember to ChatParticipant
 */
export function convertMemberToParticipant(member: ChannelMember): ChatParticipant {
  return {
    id: String(member.userId),
    name: member.userName || '',
    avatar: member.userAvatar,
    role: member.role === 'ADMIN' || member.role === 'MODERATOR' ? 'admin' : 'member',
    lastSeen: member.lastReadAt ? new Date(member.lastReadAt).getTime() : undefined,
  };
}

function convertMessageType(type: string): MessageType {
  const typeMap: Record<string, MessageType> = {
    'TEXT': 'text',
    'IMAGE': 'image',
    'FILE': 'file',
    'SYSTEM': 'system',
    'VIDEO': 'video',
    'AUDIO': 'audio',
  };
  return typeMap[type] || 'text';
}

function getAttachmentType(url: string): 'image' | 'video' | 'file' | 'audio' | 'location' {
  const ext = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return 'audio';
  return 'file';
}

// ==================== MOCK DATA ====================

const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'mock_1',
    name: 'Nhóm Dự án Villa Premium',
    avatar: 'https://ui-avatars.com/api/?name=VP&background=2E7D32&color=fff',
    type: 'group',
    participants: [
      { id: '1', name: 'Nguyễn Văn A', avatar: 'https://ui-avatars.com/api/?name=NA', role: 'admin' },
      { id: '2', name: 'Trần Thị B', avatar: 'https://ui-avatars.com/api/?name=TB', role: 'member' },
    ],
    lastMessage: {
      id: 'msg_1',
      chatId: 'mock_1',
      senderId: '2',
      senderName: 'Trần Thị B',
      type: 'text',
      content: 'Em đã gửi bản thiết kế mới cho anh review.',
      status: 'read',
      timestamp: Date.now() - 5 * 60 * 1000,
    },
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: 'mock_2',
    name: 'Lê Văn C - Kiến trúc sư',
    avatar: 'https://ui-avatars.com/api/?name=LC&background=1976D2&color=fff',
    type: 'private',
    participants: [
      { id: '3', name: 'Lê Văn C', avatar: 'https://ui-avatars.com/api/?name=LC', role: 'member' },
    ],
    lastMessage: {
      id: 'msg_2',
      chatId: 'mock_2',
      senderId: '3',
      senderName: 'Lê Văn C',
      type: 'text',
      content: 'Chiều nay họp online lúc 3h nhé!',
      status: 'delivered',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'mock_3',
    name: 'Phòng Kỹ thuật',
    avatar: 'https://ui-avatars.com/api/?name=KT&background=FF5722&color=fff',
    type: 'channel',
    participants: [],
    lastMessage: {
      id: 'msg_3',
      chatId: 'mock_3',
      senderId: '1',
      senderName: 'Admin',
      type: 'text',
      content: 'Thông báo: Cập nhật quy trình làm việc mới',
      status: 'read',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
    },
    unreadCount: 5,
    isPinned: false,
    isMuted: true,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 24 * 60 * 60 * 1000,
  },
];

// ==================== CHAT API SERVICE ====================

class ChatAPIService {
  private baseUrl = API_BASE;

  // ==================== CHANNELS / ROOMS ====================

  /**
   * Lấy danh sách phòng chat
   */
  async getChatRooms(projectId?: number): Promise<ChatRoom[]> {
    try {
      // Try communication channels first
      const channelsResponse = await communicationService.getChannels(projectId);
      if (channelsResponse.data && channelsResponse.data.length > 0) {
        return channelsResponse.data.map(convertChannelToChatRoom);
      }
      
      // Fallback to chat rooms
      const rooms = await chatService.getRooms({ projectId });
      if (rooms && rooms.length > 0) {
        return rooms.map(convertAPIChatRoomToChatRoom);
      }
      
      // Return mock data when API returns empty
      console.log('[ChatAPI] No rooms from API, using mock data');
      return MOCK_CHAT_ROOMS;
    } catch (error) {
      console.error('[ChatAPI] Get rooms failed:', error);
      // Return mock data as fallback
      console.log('[ChatAPI] Error loading rooms, using mock data');
      return MOCK_CHAT_ROOMS;
    }
  }

  /**
   * Lấy chi tiết phòng chat
   */
  async getChatRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const room = await chatService.getRoom(Number(roomId));
      return convertAPIChatRoomToChatRoom(room);
    } catch (error) {
      console.error('[ChatAPI] Get room failed:', error);
      // Try to find in mock data
      const mockRoom = MOCK_CHAT_ROOMS.find(r => r.id === roomId);
      if (mockRoom) {
        console.log('[ChatAPI] Using mock room:', roomId);
        return mockRoom;
      }
      return null;
    }
  }

  /**
   * Tạo phòng chat mới
   */
  async createChatRoom(data: {
    name: string;
    projectId?: number;
    type?: 'private' | 'group' | 'channel';
    memberIds?: number[];
  }): Promise<ChatRoom | null> {
    try {
      const room = await chatService.createRoom({
        name: data.name,
        projectId: data.projectId,
        type: data.type === 'private' ? 'DIRECT' : data.type === 'channel' ? 'PROJECT' : 'GROUP',
        members: data.memberIds,
      });
      return convertAPIChatRoomToChatRoom(room);
    } catch (error) {
      console.error('[ChatAPI] Create room failed:', error);
      return null;
    }
  }

  // ==================== MESSAGES ====================

  /**
   * Lấy tin nhắn trong phòng chat
   */
  async getMessages(
    chatId: string, 
    options?: { 
      limit?: number; 
      before?: string;
      page?: number;
    }
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    try {
      // Try communication messages first
      const commResponse = await communicationService.getMessages({
        channelId: Number(chatId),
        limit: options?.limit || 50,
        before: options?.before,
      });

      if (commResponse.data && commResponse.data.length > 0) {
        return {
          messages: commResponse.data.map(convertAPIMessageToChatMessage),
          hasMore: commResponse.data.length >= (options?.limit || 50),
        };
      }

      // Fallback to chat messages
      const chatResponse = await chatService.getMessages(Number(chatId), {
        page: options?.page || 1,
        limit: options?.limit || 50,
        before: options?.before,
      });

      return {
        messages: chatResponse.messages.map(convertAPIMessageToChatMessage),
        hasMore: chatResponse.hasMore,
      };
    } catch (error) {
      console.error('[ChatAPI] Get messages failed:', error);
      // Return mock messages for mock rooms
      const mockMessages = this.getMockMessages(chatId);
      if (mockMessages.length > 0) {
        console.log('[ChatAPI] Using mock messages for room:', chatId);
        return { messages: mockMessages, hasMore: false };
      }
      return { messages: [], hasMore: false };
    }
  }

  /**
   * Get mock messages for mock chat rooms
   */
  private getMockMessages(chatId: string): ChatMessage[] {
    const currentTime = Date.now();
    const currentUserId = 'current_user';
    
    const mockMessagesByRoom: Record<string, ChatMessage[]> = {
      'mock_1': [
        {
          id: 'msg_1_1',
          chatId: 'mock_1',
          senderId: '2',
          senderName: 'Trần Thị B',
          senderAvatar: 'https://ui-avatars.com/api/?name=TB',
          type: 'text',
          content: 'Em đã gửi bản thiết kế mới cho anh review.',
          status: 'read',
          timestamp: currentTime - 5 * 60 * 1000,
        },
        {
          id: 'msg_1_2',
          chatId: 'mock_1',
          senderId: currentUserId,
          senderName: 'Bạn',
          type: 'text',
          content: 'OK em, anh sẽ review trong hôm nay.',
          status: 'sent',
          timestamp: currentTime - 10 * 60 * 1000,
        },
        {
          id: 'msg_1_3',
          chatId: 'mock_1',
          senderId: '1',
          senderName: 'Nguyễn Văn A',
          senderAvatar: 'https://ui-avatars.com/api/?name=NA',
          type: 'text',
          content: 'Tiến độ dự án tuần này thế nào rồi nhỉ?',
          status: 'read',
          timestamp: currentTime - 30 * 60 * 1000,
        },
        {
          id: 'msg_1_4',
          chatId: 'mock_1',
          senderId: '2',
          senderName: 'Trần Thị B',
          senderAvatar: 'https://ui-avatars.com/api/?name=TB',
          type: 'text',
          content: 'Dạ em đã hoàn thành 80% phần nội thất ạ!',
          status: 'read',
          timestamp: currentTime - 25 * 60 * 1000,
        },
      ],
      'mock_2': [
        {
          id: 'msg_2_1',
          chatId: 'mock_2',
          senderId: '3',
          senderName: 'Lê Văn C',
          senderAvatar: 'https://ui-avatars.com/api/?name=LC',
          type: 'text',
          content: 'Chiều nay họp online lúc 3h nhé!',
          status: 'delivered',
          timestamp: currentTime - 2 * 60 * 60 * 1000,
        },
        {
          id: 'msg_2_2',
          chatId: 'mock_2',
          senderId: currentUserId,
          senderName: 'Bạn',
          type: 'text',
          content: 'OK anh, em sẽ chuẩn bị tài liệu.',
          status: 'sent',
          timestamp: currentTime - 3 * 60 * 60 * 1000,
        },
        {
          id: 'msg_2_3',
          chatId: 'mock_2',
          senderId: '3',
          senderName: 'Lê Văn C',
          senderAvatar: 'https://ui-avatars.com/api/?name=LC',
          type: 'text',
          content: 'Bên mình cần trao đổi về concept mới của Villa Resort.',
          status: 'read',
          timestamp: currentTime - 4 * 60 * 60 * 1000,
        },
      ],
      'mock_3': [
        {
          id: 'msg_3_1',
          chatId: 'mock_3',
          senderId: '1',
          senderName: 'Admin',
          senderAvatar: 'https://ui-avatars.com/api/?name=AD&background=FF5722&color=fff',
          type: 'text',
          content: 'Thông báo: Cập nhật quy trình làm việc mới',
          status: 'read',
          timestamp: currentTime - 24 * 60 * 60 * 1000,
        },
        {
          id: 'msg_3_2',
          chatId: 'mock_3',
          senderId: '1',
          senderName: 'Admin',
          senderAvatar: 'https://ui-avatars.com/api/?name=AD&background=FF5722&color=fff',
          type: 'text',
          content: 'Các bạn vui lòng đọc kỹ tài liệu đính kèm và phản hồi trước 5h chiều nay.',
          status: 'read',
          timestamp: currentTime - 24 * 60 * 60 * 1000 + 5 * 60 * 1000,
        },
        {
          id: 'msg_3_3',
          chatId: 'mock_3',
          senderId: '2',
          senderName: 'Trần Thị B',
          senderAvatar: 'https://ui-avatars.com/api/?name=TB',
          type: 'text',
          content: 'Em đã đọc và xác nhận ạ! 👍',
          status: 'read',
          timestamp: currentTime - 20 * 60 * 60 * 1000,
        },
      ],
    };
    
    return mockMessagesByRoom[chatId] || [];
  }

  /**
   * Gửi tin nhắn
   */
  async sendMessage(data: {
    chatId: string;
    content: string;
    type?: MessageType;
    attachments?: Attachment[];
    replyToId?: string;
  }): Promise<ChatMessage | null> {
    try {
      // Try communication service first
      const commResponse = await communicationService.sendMessage({
        channelId: Number(data.chatId),
        content: data.content,
        type: data.type === 'image' ? 'IMAGE' : data.type === 'file' ? 'FILE' : 'TEXT',
        fileUrl: data.attachments?.[0]?.url,
        fileName: data.attachments?.[0]?.name,
        replyToId: data.replyToId ? Number(data.replyToId) : undefined,
      });

      if (commResponse.data) {
        return convertAPIMessageToChatMessage(commResponse.data);
      }

      // Fallback to chat service
      const chatResponse = await chatService.sendMessage({
        roomId: Number(data.chatId),
        content: data.content,
        type: data.type === 'image' ? 'IMAGE' : data.type === 'file' ? 'FILE' : 'TEXT',
        attachments: data.attachments?.map(a => a.url || '').filter(Boolean),
      });

      return convertAPIMessageToChatMessage(chatResponse);
    } catch (error) {
      console.error('[ChatAPI] Send message failed:', error);
      return null;
    }
  }

  /**
   * Sửa tin nhắn
   */
  async editMessage(messageId: string, content: string): Promise<ChatMessage | null> {
    try {
      const response = await communicationService.updateMessage(Number(messageId), content);
      if (response.data) {
        return convertAPIMessageToChatMessage(response.data);
      }
      return null;
    } catch (error) {
      console.error('[ChatAPI] Edit message failed:', error);
      return null;
    }
  }

  /**
   * Xóa tin nhắn
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      await communicationService.deleteMessage(Number(messageId));
      return true;
    } catch (error) {
      console.error('[ChatAPI] Delete message failed:', error);
      return false;
    }
  }

  /**
   * Thêm reaction
   */
  async addReaction(messageId: string, emoji: string): Promise<boolean> {
    try {
      await communicationService.addReaction(Number(messageId), emoji);
      return true;
    } catch (error) {
      console.error('[ChatAPI] Add reaction failed:', error);
      return false;
    }
  }

  /**
   * Xóa reaction
   */
  async removeReaction(messageId: string, emoji: string): Promise<boolean> {
    try {
      await communicationService.removeReaction(Number(messageId), emoji);
      return true;
    } catch (error) {
      console.error('[ChatAPI] Remove reaction failed:', error);
      return false;
    }
  }

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(chatId: string): Promise<boolean> {
    try {
      await communicationService.markAsRead(Number(chatId));
      return true;
    } catch (error) {
      console.error('[ChatAPI] Mark as read failed:', error);
      return false;
    }
  }

  // ==================== MEMBERS ====================

  /**
   * Lấy thành viên trong phòng chat
   */
  async getChatMembers(chatId: string): Promise<ChatParticipant[]> {
    try {
      const response = await communicationService.getChannelMembers(Number(chatId));
      if (response.data) {
        return response.data.map(convertMemberToParticipant);
      }
      return [];
    } catch (error) {
      console.error('[ChatAPI] Get members failed:', error);
      return [];
    }
  }

  /**
   * Thêm thành viên
   */
  async addMember(chatId: string, userId: number): Promise<boolean> {
    try {
      await communicationService.addMember(Number(chatId), userId);
      return true;
    } catch (error) {
      console.error('[ChatAPI] Add member failed:', error);
      return false;
    }
  }

  /**
   * Xóa thành viên
   */
  async removeMember(chatId: string, userId: number): Promise<boolean> {
    try {
      await communicationService.removeMember(Number(chatId), userId);
      return true;
    } catch (error) {
      console.error('[ChatAPI] Remove member failed:', error);
      return false;
    }
  }

  // ==================== DIRECT API CALLS ====================

  /**
   * Direct fetch messages from API (fallback)
   */
  async fetchMessagesDirectly(channelId: number, limit = 50): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/messages?channelId=${channelId}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const messages = data.data || data.messages || data;
      
      if (Array.isArray(messages)) {
        return messages.map((msg: any) => ({
          id: String(msg.id),
          chatId: String(msg.channelId || msg.roomId),
          senderId: String(msg.userId || msg.senderId),
          senderName: msg.userName || msg.sender?.name || 'Unknown',
          senderAvatar: msg.userAvatar || msg.sender?.avatar,
          type: convertMessageType(msg.type || 'TEXT'),
          content: msg.content || msg.text || '',
          status: 'read' as MessageStatus,
          timestamp: new Date(msg.createdAt || msg.timestamp).getTime(),
        }));
      }
      
      return [];
    } catch (error) {
      console.error('[ChatAPI] Direct fetch failed:', error);
      return [];
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, chatId?: string): Promise<ChatMessage[]> {
    try {
      const params: MessageFilters = {
        channelId: chatId ? Number(chatId) : 0,
        search: query,
        limit: 50,
      };

      const response = await communicationService.getMessages(params);
      if (response.data) {
        return response.data.map(convertAPIMessageToChatMessage);
      }
      return [];
    } catch (error) {
      console.error('[ChatAPI] Search failed:', error);
      return [];
    }
  }
}

// Export singleton instance
export const chatAPIService = new ChatAPIService();
export default chatAPIService;
