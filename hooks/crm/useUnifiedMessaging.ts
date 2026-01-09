/**
 * useUnifiedMessaging Hook
 * Hệ thống tin nhắn thống nhất kiểu Zalo
 * Tích hợp conversations + messages + call history + realtime
 * Tích hợp với UnifiedBadgeContext để quản lý thông báo
 * 
 * @author AI Assistant
 * @date 03/01/2026
 */

import { useAuth } from '@/context/AuthContext';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Badge sync callback type
type BadgeSyncCallback = (unreadCount: number, missedCalls: number) => void;
let badgeSyncCallback: BadgeSyncCallback | null = null;

// Export function to register badge sync
export function registerBadgeSync(callback: BadgeSyncCallback) {
  badgeSyncCallback = callback;
}

// ==================== TYPES ====================

export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'call' | 'video_call' | 'system';
export type ConversationType = 'direct' | 'group';
export type CallStatus = 'missed' | 'answered' | 'rejected' | 'ongoing';
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type OnlineStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
  onlineStatus: OnlineStatus;
  lastSeen?: string;
}

export interface UnifiedMessage {
  id: string;
  conversationId: string;
  senderId: number;
  sender: User;
  type: MessageType;
  content: string;
  // For voice messages
  audioDuration?: number;
  audioUrl?: string;
  // For images/files
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  // For calls
  callDuration?: number;
  callStatus?: CallStatus;
  callType?: 'audio' | 'video';
  // Status
  deliveryStatus: DeliveryStatus;
  isRead: boolean;
  readBy?: number[];
  // Reactions
  reactions?: Array<{
    emoji: string;
    userId: number;
    userName: string;
  }>;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Reply/Thread
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

export interface UnifiedConversation {
  id: string;
  type: ConversationType;
  name: string;
  avatar?: string;
  // Participants
  participants: User[];
  // Last activity
  lastMessage?: UnifiedMessage;
  lastCallTime?: string;
  // Counts
  unreadCount: number;
  // Status
  isPinned: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  isOnline: boolean;
  // Typing
  typingUsers: User[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CallHistoryEntry {
  id: string;
  conversationId: string;
  type: 'audio' | 'video';
  status: CallStatus;
  duration: number; // seconds
  caller: User;
  callee: User;
  startedAt: string;
  endedAt?: string;
}

export interface SendMessageParams {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  mediaUrl?: string;
  audioDuration?: number;
}

// ==================== MOCK DATA ====================

// CSKH Support user - always available
const CSKH_USER: User = {
  id: 999,
  name: 'CSKH Thiết Kế Resort',
  avatar: 'https://i.pravatar.cc/150?u=cskh',
  email: 'cskh@thietkeresort.vn',
  role: 'SUPPORT',
  onlineStatus: 'online',
  lastSeen: new Date().toISOString(),
};

const MOCK_USERS: User[] = [
  {
    id: 2,
    name: 'Nguyễn Văn Kiến',
    avatar: 'https://i.pravatar.cc/150?u=kien',
    email: 'kien@thietkeresort.vn',
    role: 'ENGINEER',
    onlineStatus: 'online',
    lastSeen: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Trần Minh Hoàng',
    avatar: 'https://i.pravatar.cc/150?u=hoang',
    email: 'hoang@client.com',
    role: 'CLIENT',
    onlineStatus: 'offline',
    lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 4,
    name: 'Lê Thị Admin',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    email: 'admin@thietkeresort.vn',
    role: 'ADMIN',
    onlineStatus: 'away',
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 5,
    name: 'Phạm Đức Long',
    avatar: 'https://i.pravatar.cc/150?u=long',
    email: 'long@thietkeresort.vn',
    role: 'ENGINEER',
    onlineStatus: 'online',
    lastSeen: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Vũ Thanh Hà',
    avatar: 'https://i.pravatar.cc/150?u=ha',
    email: 'ha@client.com',
    role: 'CLIENT',
    onlineStatus: 'busy',
    lastSeen: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];

// Dev mode flag - set to false in production to only show CSKH conversation
const IS_DEV_MODE = __DEV__ || true;

const createMockConversations = (currentUserId: number): UnifiedConversation[] => {
  // CSKH conversation - always show first
  const cskh: UnifiedConversation = {
    id: 'conv_cskh',
    type: 'direct',
    name: 'CSKH Thiết Kế Resort',
    avatar: 'https://i.pravatar.cc/150?u=cskh',
    participants: [CSKH_USER],
    lastMessage: {
      id: 'msg_cskh_welcome',
      conversationId: 'conv_cskh',
      senderId: 999,
      sender: CSKH_USER,
      type: 'text',
      content: 'Chào mừng bạn đến với Thiết Kế Resort! 🏠 Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.',
      deliveryStatus: 'delivered',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    unreadCount: 1,
    isPinned: true,
    isMuted: false,
    isBlocked: false,
    isOnline: true,
    typingUsers: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  // If not dev mode, only return CSKH
  if (!IS_DEV_MODE) {
    return [cskh];
  }

  // Dev mode: return all mock conversations
  const devConversations: UnifiedConversation[] = [
    cskh,
    {
    id: 'conv_1',
    type: 'direct',
    name: 'Nguyễn Văn Kiến',
    avatar: 'https://i.pravatar.cc/150?u=kien',
    participants: [MOCK_USERS[0]],
    lastMessage: {
      id: 'msg_101',
      conversationId: 'conv_1',
      senderId: 2,
      sender: MOCK_USERS[0],
      type: 'text',
      content: 'Bản vẽ phối cảnh đã hoàn thành, anh kiểm tra nhé!',
      deliveryStatus: 'delivered',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    isBlocked: false,
    isOnline: true,
    typingUsers: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'conv_2',
    type: 'direct',
    name: 'Trần Minh Hoàng',
    avatar: 'https://i.pravatar.cc/150?u=hoang',
    participants: [MOCK_USERS[1]],
    lastMessage: {
      id: 'msg_102',
      conversationId: 'conv_2',
      senderId: 3,
      sender: MOCK_USERS[1],
      type: 'text',
      content: 'Cảm ơn team, tôi rất hài lòng với thiết kế!',
      deliveryStatus: 'read',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    isOnline: false,
    typingUsers: [],
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'conv_3',
    type: 'direct',
    name: 'Lê Thị Admin',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    participants: [MOCK_USERS[2]],
    lastMessage: {
      id: 'msg_103',
      conversationId: 'conv_3',
      senderId: currentUserId,
      sender: { id: currentUserId, name: 'You', onlineStatus: 'online' },
      type: 'call',
      content: 'Cuộc gọi video',
      callType: 'video',
      callStatus: 'answered',
      callDuration: 345, // 5:45
      deliveryStatus: 'read',
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    lastCallTime: new Date(Date.now() - 4 * 3600000).toISOString(),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    isOnline: false,
    typingUsers: [],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'conv_4',
    type: 'direct',
    name: 'Phạm Đức Long',
    avatar: 'https://i.pravatar.cc/150?u=long',
    participants: [MOCK_USERS[3]],
    lastMessage: {
      id: 'msg_104',
      conversationId: 'conv_4',
      senderId: 5,
      sender: MOCK_USERS[3],
      type: 'voice',
      content: 'Tin nhắn thoại',
      audioDuration: 15,
      audioUrl: 'https://example.com/audio.mp3',
      deliveryStatus: 'delivered',
      isRead: false,
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    unreadCount: 1,
    isPinned: false,
    isMuted: true,
    isBlocked: false,
    isOnline: true,
    typingUsers: [],
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'conv_5',
    type: 'direct',
    name: 'Vũ Thanh Hà',
    avatar: 'https://i.pravatar.cc/150?u=ha',
    participants: [MOCK_USERS[4]],
    lastMessage: {
      id: 'msg_105',
      conversationId: 'conv_5',
      senderId: 6,
      sender: MOCK_USERS[4],
      type: 'call',
      content: 'Cuộc gọi nhỡ',
      callType: 'audio',
      callStatus: 'missed',
      deliveryStatus: 'delivered',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    isOnline: false,
    typingUsers: [],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  ];

  return devConversations;
};

const createMockMessages = (conversationId: string, currentUserId: number): UnifiedMessage[] => {
  const conversations: Record<string, UnifiedMessage[]> = {
    // CSKH Welcome messages
    'conv_cskh': [
      {
        id: 'msg_cskh_1',
        conversationId: 'conv_cskh',
        senderId: 999,
        sender: CSKH_USER,
        type: 'text',
        content: '🎉 Chào mừng bạn đến với Thiết Kế Resort!',
        deliveryStatus: 'delivered',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: 'msg_cskh_2',
        conversationId: 'conv_cskh',
        senderId: 999,
        sender: CSKH_USER,
        type: 'text',
        content: 'Chúng tôi cung cấp dịch vụ thiết kế và thi công resort, villa, nhà ở cao cấp với đội ngũ kiến trúc sư và kỹ sư giàu kinh nghiệm.',
        deliveryStatus: 'delivered',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        id: 'msg_cskh_3',
        conversationId: 'conv_cskh',
        senderId: 999,
        sender: CSKH_USER,
        type: 'image',
        content: 'Một số dự án tiêu biểu của chúng tôi',
        mediaUrl: 'https://picsum.photos/800/600?random=1',
        thumbnail: 'https://picsum.photos/200/150?random=1',
        deliveryStatus: 'delivered',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
      },
      {
        id: 'msg_cskh_4',
        conversationId: 'conv_cskh',
        senderId: 999,
        sender: CSKH_USER,
        type: 'text',
        content: '📞 Hotline: 1900-xxxx (24/7)\n📧 Email: cskh@thietkeresort.vn\n🌐 Website: thietkeresort.vn',
        deliveryStatus: 'delivered',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        id: 'msg_cskh_welcome',
        conversationId: 'conv_cskh',
        senderId: 999,
        sender: CSKH_USER,
        type: 'text',
        content: 'Chào mừng bạn đến với Thiết Kế Resort! 🏠 Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Bạn có thể nhắn tin hoặc gọi điện cho chúng tôi bất cứ lúc nào.',
        deliveryStatus: 'delivered',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    'conv_1': [
      {
        id: 'msg_1_1',
        conversationId: 'conv_1',
        senderId: currentUserId,
        sender: { id: currentUserId, name: 'You', onlineStatus: 'online' },
        type: 'text',
        content: 'Chào anh Kiến, tiến độ bản vẽ thế nào rồi?',
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'msg_1_2',
        conversationId: 'conv_1',
        senderId: 2,
        sender: MOCK_USERS[0],
        type: 'text',
        content: 'Dạ anh, em đang hoàn thiện phần phối cảnh 3D ạ',
        deliveryStatus: 'delivered',
        isRead: true,
        createdAt: new Date(Date.now() - 1.8 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1.8 * 3600000).toISOString(),
      },
      {
        id: 'msg_1_3',
        conversationId: 'conv_1',
        senderId: 2,
        sender: MOCK_USERS[0],
        type: 'image',
        content: 'Đây là bản preview',
        mediaUrl: 'https://picsum.photos/800/600',
        thumbnail: 'https://picsum.photos/200/150',
        deliveryStatus: 'delivered',
        isRead: true,
        createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      },
      {
        id: 'msg_1_4',
        conversationId: 'conv_1',
        senderId: currentUserId,
        sender: { id: currentUserId, name: 'You', onlineStatus: 'online' },
        type: 'text',
        content: 'Đẹp lắm! Chỉnh thêm phần cửa sổ được không?',
        deliveryStatus: 'read',
        isRead: true,
        reactions: [{ emoji: '👍', userId: 2, userName: 'Nguyễn Văn Kiến' }],
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
      {
        id: 'msg_1_5',
        conversationId: 'conv_1',
        senderId: 2,
        sender: MOCK_USERS[0],
        type: 'call',
        content: 'Cuộc gọi video',
        callType: 'video',
        callStatus: 'answered',
        callDuration: 180, // 3 phút
        deliveryStatus: 'delivered',
        isRead: true,
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      },
      {
        id: 'msg_1_6',
        conversationId: 'conv_1',
        senderId: 2,
        sender: MOCK_USERS[0],
        type: 'text',
        content: 'Bản vẽ phối cảnh đã hoàn thành, anh kiểm tra nhé!',
        deliveryStatus: 'delivered',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: 'msg_1_7',
        conversationId: 'conv_1',
        senderId: 2,
        sender: MOCK_USERS[0],
        type: 'file',
        content: 'File bản vẽ CAD',
        fileName: 'resort_3d_final.dwg',
        fileSize: 15728640, // 15MB
        mediaUrl: 'https://example.com/files/resort_3d_final.dwg',
        deliveryStatus: 'delivered',
        isRead: false,
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 28 * 60000).toISOString(),
      },
    ],
    'conv_2': [
      {
        id: 'msg_2_1',
        conversationId: 'conv_2',
        senderId: 3,
        sender: MOCK_USERS[1],
        type: 'text',
        content: 'Xin chào, tôi muốn hỏi về tiến độ dự án',
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'msg_2_2',
        conversationId: 'conv_2',
        senderId: currentUserId,
        sender: { id: currentUserId, name: 'You', onlineStatus: 'online' },
        type: 'text',
        content: 'Chào anh Hoàng, dự án đang ở giai đoạn thiết kế chi tiết. Dự kiến tuần sau sẽ có bản hoàn chỉnh.',
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'msg_2_3',
        conversationId: 'conv_2',
        senderId: 3,
        sender: MOCK_USERS[1],
        type: 'text',
        content: 'Cảm ơn team, tôi rất hài lòng với thiết kế!',
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ],
    'conv_3': [
      {
        id: 'msg_3_1',
        conversationId: 'conv_3',
        senderId: currentUserId,
        sender: { id: currentUserId, name: 'You', onlineStatus: 'online' },
        type: 'text',
        content: 'Chị Admin ơi, cho em xin báo cáo tháng này',
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      },
      {
        id: 'msg_3_2',
        conversationId: 'conv_3',
        senderId: 4,
        sender: MOCK_USERS[2],
        type: 'text',
        content: 'Để chị gọi video để trao đổi rõ hơn nhé',
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'msg_3_3',
        conversationId: 'conv_3',
        senderId: currentUserId,
        sender: { id: currentUserId, name: 'You', onlineStatus: 'online' },
        type: 'call',
        content: 'Cuộc gọi video',
        callType: 'video',
        callStatus: 'answered',
        callDuration: 345,
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
    ],
    'conv_4': [
      {
        id: 'msg_4_1',
        conversationId: 'conv_4',
        senderId: 5,
        sender: MOCK_USERS[3],
        type: 'text',
        content: 'Anh check file mình gửi hôm qua chưa?',
        deliveryStatus: 'read',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'msg_4_2',
        conversationId: 'conv_4',
        senderId: 5,
        sender: MOCK_USERS[3],
        type: 'voice',
        content: 'Tin nhắn thoại',
        audioDuration: 15,
        audioUrl: 'https://example.com/audio.mp3',
        deliveryStatus: 'delivered',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ],
    'conv_5': [
      {
        id: 'msg_5_1',
        conversationId: 'conv_5',
        senderId: 6,
        sender: MOCK_USERS[4],
        type: 'call',
        content: 'Cuộc gọi nhỡ',
        callType: 'audio',
        callStatus: 'missed',
        deliveryStatus: 'delivered',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ],
  };

  return conversations[conversationId] || [];
};

// ==================== HOOK OPTIONS ====================

export interface UseUnifiedMessagingOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
}

// ==================== HOOK RETURN TYPE ====================

export interface UseUnifiedMessagingReturn {
  // Conversations
  conversations: UnifiedConversation[];
  loadingConversations: boolean;
  refreshConversations: () => Promise<void>;
  
  // Current conversation
  currentConversation: UnifiedConversation | null;
  setCurrentConversation: (conversation: UnifiedConversation | null) => void;
  
  // Messages for current conversation
  messages: UnifiedMessage[];
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  
  // Send message
  sendMessage: (params: SendMessageParams) => Promise<void>;
  sending: boolean;
  
  // Typing
  typingUsers: User[];
  setTyping: (conversationId: string, isTyping: boolean) => void;
  
  // Read status
  markAsRead: (conversationId: string) => Promise<void>;
  
  // Counts
  totalUnreadCount: number;
  missedCallsCount: number;
  
  // Search
  searchConversations: (query: string) => UnifiedConversation[];
  searchMessages: (conversationId: string, query: string) => UnifiedMessage[];
  
  // Call actions
  startCall: (userId: number, type: 'audio' | 'video') => Promise<void>;
  
  // Conversation actions
  pinConversation: (conversationId: string, pinned: boolean) => Promise<void>;
  muteConversation: (conversationId: string, muted: boolean) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  
  // Message actions
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  
  // Create conversation for external companies/users
  getOrCreateConversation: (params: { 
    userId: number; 
    userName: string; 
    userAvatar?: string;
    userRole?: string;
  }) => Promise<string>; // Returns conversationId
  
  // Error
  error: string | null;
}

// ==================== HOOK IMPLEMENTATION ====================

export function useUnifiedMessaging(
  options: UseUnifiedMessagingOptions = {}
): UseUnifiedMessagingReturn {
  const { autoRefresh = true, refreshInterval = 30000, pageSize = 20 } = options;
  const { user } = useAuth();
  const currentUserId: number = typeof user?.id === 'number' ? user.id : 1;

  // State
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);

  // ==================== LOAD CONVERSATIONS ====================

  const refreshConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError(null);
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = createMockConversations(currentUserId);
      
      // Sort: pinned first, then by updatedAt
      const sorted = mockData.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      
      setConversations(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách hội thoại');
      console.error('[useUnifiedMessaging] Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUserId]);

  // ==================== LOAD MESSAGES ====================

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      setError(null);
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockData = createMockMessages(conversationId, currentUserId);
      
      setMessages(mockData);
      setHasMoreMessages(mockData.length >= pageSize);
      
      // Set current conversation - try to find from state first, then from mock data
      let conv = conversations.find(c => c.id === conversationId);
      if (!conv) {
        // If not in state, get from mock data directly
        const allConversations = createMockConversations(currentUserId);
        conv = allConversations.find(c => c.id === conversationId);
      }
      if (conv) {
        setCurrentConversation(conv);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tin nhắn');
      console.error('[useUnifiedMessaging] Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUserId, conversations, pageSize]);

  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || !hasMoreMessages) return;
    
    try {
      // TODO: Implement pagination
      setHasMoreMessages(false);
    } catch (err) {
      console.error('[useUnifiedMessaging] Error loading more messages:', err);
    }
  }, [currentConversation, hasMoreMessages]);

  // ==================== SEND MESSAGE ====================

  const sendMessage = useCallback(async (params: SendMessageParams) => {
    try {
      setSending(true);
      
      const newMessage: UnifiedMessage = {
        id: `msg_${Date.now()}`,
        conversationId: params.conversationId,
        senderId: currentUserId,
        sender: { id: currentUserId, name: 'You', onlineStatus: 'online' },
        type: params.type || 'text',
        content: params.content,
        mediaUrl: params.mediaUrl,
        audioDuration: params.audioDuration,
        deliveryStatus: 'sending',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replyTo: params.replyToId ? {
          id: params.replyToId,
          content: messages.find(m => m.id === params.replyToId)?.content || '',
          senderName: messages.find(m => m.id === params.replyToId)?.sender.name || '',
        } : undefined,
      };

      // Optimistic update
      setMessages(prev => [...prev, newMessage]);
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update delivery status
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, deliveryStatus: 'sent' as DeliveryStatus } : m
      ));
      
      // Update conversation's lastMessage
      setConversations(prev => prev.map(c => 
        c.id === params.conversationId ? { 
          ...c, 
          lastMessage: { ...newMessage, deliveryStatus: 'sent' },
          updatedAt: newMessage.createdAt 
        } : c
      ));
      
    } catch (err) {
      // Mark as failed
      setMessages(prev => prev.map(m => 
        m.deliveryStatus === 'sending' ? { ...m, deliveryStatus: 'failed' as DeliveryStatus } : m
      ));
      setError('Gửi tin nhắn thất bại');
      throw err;
    } finally {
      setSending(false);
    }
  }, [currentUserId, messages]);

  // ==================== TYPING ====================

  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    // TODO: Emit typing event via WebSocket
    console.log('[useUnifiedMessaging] Typing:', conversationId, isTyping);
  }, []);

  // ==================== MARK AS READ ====================

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      // Get unread count before marking
      const conversation = conversations.find(c => c.id === conversationId);
      const unreadBefore = conversation?.unreadCount || 0;
      
      // TODO: Replace with real API call
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
      
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      
      // Sync badge after marking as read
      if (unreadBefore > 0 && badgeSyncCallback) {
        const newTotalUnread = conversations.reduce((sum, c) => 
          sum + (c.id === conversationId ? 0 : c.unreadCount), 0
        );
        const missedCalls = conversations.filter(c => 
          c.lastMessage?.type === 'call' && 
          c.lastMessage?.callStatus === 'missed' &&
          !c.lastMessage?.isRead
        ).length;
        badgeSyncCallback(newTotalUnread, missedCalls);
      }
    } catch (err) {
      console.error('[useUnifiedMessaging] Error marking as read:', err);
    }
  }, [conversations]);

  // ==================== COUNTS ====================

  const totalUnreadCount = useMemo(() => 
    conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  const missedCallsCount = useMemo(() => 
    conversations.filter(c => 
      c.lastMessage?.type === 'call' && 
      c.lastMessage?.callStatus === 'missed' &&
      !c.lastMessage?.isRead
    ).length,
    [conversations]
  );

  // ==================== SEARCH ====================

  const searchConversations = useCallback((query: string): UnifiedConversation[] => {
    const lower = query.toLowerCase();
    return conversations.filter(c => 
      c.name.toLowerCase().includes(lower) ||
      c.lastMessage?.content.toLowerCase().includes(lower)
    );
  }, [conversations]);

  const searchMessages = useCallback((conversationId: string, query: string): UnifiedMessage[] => {
    const lower = query.toLowerCase();
    return messages.filter(m => 
      m.conversationId === conversationId &&
      m.content.toLowerCase().includes(lower)
    );
  }, [messages]);

  // ==================== CALL ACTIONS ====================

  const startCall = useCallback(async (userId: number, type: 'audio' | 'video') => {
    // TODO: Integrate with call service
    console.log('[useUnifiedMessaging] Starting call:', userId, type);
  }, []);

  // ==================== CONVERSATION ACTIONS ====================

  const pinConversation = useCallback(async (conversationId: string, pinned: boolean) => {
    setConversations(prev => {
      const updated = prev.map(c => 
        c.id === conversationId ? { ...c, isPinned: pinned } : c
      );
      return updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
  }, []);

  const muteConversation = useCallback(async (conversationId: string, muted: boolean) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, isMuted: muted } : c
    ));
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [currentConversation]);

  // ==================== MESSAGE ACTIONS ====================

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const reactions = m.reactions || [];
      const existing = reactions.find(r => r.userId === currentUserId);
      if (existing) {
        return {
          ...m,
          reactions: reactions.map(r => 
            r.userId === currentUserId ? { ...r, emoji } : r
          ),
        };
      }
      return {
        ...m,
        reactions: [...reactions, { emoji, userId: currentUserId, userName: 'You' }],
      };
    }));
  }, [currentUserId]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      return {
        ...m,
        reactions: (m.reactions || []).filter(r => 
          !(r.userId === currentUserId && r.emoji === emoji)
        ),
      };
    }));
  }, [currentUserId]);

  // ==================== GET OR CREATE CONVERSATION ====================

  const getOrCreateConversation = useCallback(async (params: {
    userId: number;
    userName: string;
    userAvatar?: string;
    userRole?: string;
  }): Promise<string> => {
    // Check if conversation already exists with this user
    const existingConv = conversations.find(c => 
      c.participants.some(p => p.id === params.userId)
    );
    
    if (existingConv) {
      return existingConv.id;
    }
    
    // Create new conversation
    const newConvId = `conv_company_${params.userId}_${Date.now()}`;
    const newUser: User = {
      id: params.userId,
      name: params.userName,
      avatar: params.userAvatar || `https://i.pravatar.cc/150?u=company${params.userId}`,
      role: params.userRole || 'COMPANY',
      onlineStatus: 'online',
      lastSeen: new Date().toISOString(),
    };
    
    const welcomeMessage: UnifiedMessage = {
      id: `msg_welcome_${Date.now()}`,
      conversationId: newConvId,
      senderId: params.userId,
      sender: newUser,
      type: 'text',
      content: `Xin chào! Tôi là ${params.userName}. Rất vui được hỗ trợ bạn. Bạn cần tư vấn về dịch vụ gì?`,
      deliveryStatus: 'delivered',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newConversation: UnifiedConversation = {
      id: newConvId,
      type: 'direct',
      name: params.userName,
      avatar: newUser.avatar,
      participants: [newUser],
      lastMessage: welcomeMessage,
      unreadCount: 1,
      isPinned: false,
      isMuted: false,
      isBlocked: false,
      isOnline: true,
      typingUsers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to conversations state
    setConversations(prev => {
      const updated = [newConversation, ...prev];
      return updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
    
    // Also set initial message for this conversation
    setMessages([welcomeMessage]);
    
    return newConvId;
  }, [conversations]);

  // ==================== AUTO REFRESH ====================

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshConversations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshConversations]);

  // Sync badges whenever counts change
  useEffect(() => {
    if (badgeSyncCallback) {
      badgeSyncCallback(totalUnreadCount, missedCallsCount);
    }
  }, [totalUnreadCount, missedCallsCount]);

  // ==================== RETURN ====================

  return {
    // Conversations
    conversations,
    loadingConversations,
    refreshConversations,
    
    // Current conversation
    currentConversation,
    setCurrentConversation,
    
    // Messages
    messages,
    loadingMessages,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    
    // Send
    sendMessage,
    sending,
    
    // Typing
    typingUsers,
    setTyping,
    
    // Read
    markAsRead,
    
    // Counts
    totalUnreadCount,
    missedCallsCount,
    
    // Search
    searchConversations,
    searchMessages,
    
    // Actions
    startCall,
    pinConversation,
    muteConversation,
    deleteConversation,
    deleteMessage,
    addReaction,
    removeReaction,
    
    // Create conversation
    getOrCreateConversation,
    
    // Error
    error,
  };
}

export default useUnifiedMessaging;
