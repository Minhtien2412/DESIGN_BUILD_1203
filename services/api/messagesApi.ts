/**
 * Messages API Client
 * Handles real-time messaging and conversations
 * Backend: https://baotienweb.cloud/api/v1/messages
 */

import { getItem } from '@/utils/storage';
import ENV from '../../config/env';

const BASE_URL = `${ENV.API_BASE_URL}/messages`;

// ==================== TYPES ====================

export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
    role: 'CLIENT' | 'ENGINEER' | 'ADMIN';
  };
}

export interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    name: string;
    email: string;
    role: 'CLIENT' | 'ENGINEER' | 'ADMIN';
  }>;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageQueryParams {
  page?: number;
  limit?: number;
  before?: string; // ISO date for pagination
}

export interface SendMessageDto {
  recipientId: number;
  content: string;
}

// ==================== MOCK DATA (Demo) ====================

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    participants: [
      { id: 2, name: 'Nguyễn Văn Kiến', email: 'kien@thietkeresort.vn', role: 'ENGINEER' }
    ],
    lastMessage: {
      id: 101,
      content: 'Bản vẽ phối cảnh đã hoàn thành, anh kiểm tra nhé!',
      senderId: 2,
      conversationId: 1,
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      sender: { id: 2, name: 'Nguyễn Văn Kiến', email: 'kien@thietkeresort.vn', role: 'ENGINEER' }
    },
    unreadCount: 2,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 2,
    participants: [
      { id: 3, name: 'Trần Minh Hoàng', email: 'hoang@client.com', role: 'CLIENT' }
    ],
    lastMessage: {
      id: 102,
      content: 'Cảm ơn team, tôi rất hài lòng với thiết kế!',
      senderId: 3,
      conversationId: 2,
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      sender: { id: 3, name: 'Trần Minh Hoàng', email: 'hoang@client.com', role: 'CLIENT' }
    },
    unreadCount: 0,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 3,
    participants: [
      { id: 4, name: 'Lê Thị Admin', email: 'admin@thietkeresort.vn', role: 'ADMIN' }
    ],
    lastMessage: {
      id: 103,
      content: 'Meeting dự án mới lúc 2pm nhé team.',
      senderId: 4,
      conversationId: 3,
      isRead: false,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      sender: { id: 4, name: 'Lê Thị Admin', email: 'admin@thietkeresort.vn', role: 'ADMIN' }
    },
    unreadCount: 1,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  }
];

// ==================== AUTH HELPER ====================

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ==================== API METHODS ====================

/**
 * Get all conversations for current user
 * Endpoint: GET /messages/conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/conversations`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[messagesApi] getConversations error:', error);
    console.log('[messagesApi] Using mock conversations data');
    // Return mock data as fallback when API unavailable
    return MOCK_CONVERSATIONS;
  }
}

/**
 * Get messages in a specific conversation
 * Endpoint: GET /messages/conversations/:id
 */
export async function getMessages(
  conversationId: number,
  params?: MessageQueryParams
): Promise<Message[]> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.before) queryParams.append('before', params.before);

    const url = `${BASE_URL}/conversations/${conversationId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[messagesApi] getMessages error:', error);
    throw error;
  }
}

/**
 * Send a message (creates conversation if doesn't exist)
 * Endpoint: POST /messages
 */
export async function sendMessage(dto: SendMessageDto): Promise<Message> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[messagesApi] sendMessage error:', error);
    throw error;
  }
}

/**
 * Mark a message as read
 * Endpoint: PATCH /messages/:id/read
 */
export async function markAsRead(messageId: number): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/${messageId}/read`, {
      method: 'PATCH',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[messagesApi] markAsRead error:', error);
    throw error;
  }
}

/**
 * Mark all messages in a conversation as read
 * Endpoint: PATCH /messages/conversations/:id/read-all
 */
export async function markAllAsRead(conversationId: number): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/conversations/${conversationId}/read-all`, {
      method: 'PATCH',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[messagesApi] markAllAsRead error:', error);
    throw error;
  }
}

/**
 * Get unread message count
 * Endpoint: GET /messages/unread-count
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/unread-count`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get unread count: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[messagesApi] getUnreadCount error:', error);
    console.log('[messagesApi] Using mock unread count data');
    // Return zero count as fallback when API unavailable
    return { count: 0 };
  }
}

// ==================== EXPORTS ====================

export const messagesApi = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};

export default messagesApi;
