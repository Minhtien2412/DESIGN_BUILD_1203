/**
 * Unified Contacts Service
 * Hệ thống danh bạ đồng bộ chung cho tất cả modules
 * Tích hợp: Messages, Calls, Video, Live như Zalo
 * 
 * @author AI Assistant
 * @date 22/12/2025
 */

import { apiFetch } from './api';

// ==================== TYPES ====================

export type ContactStatus = 'online' | 'offline' | 'busy' | 'away';
export type ContactType = 'user' | 'team' | 'customer' | 'supplier';

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: ContactStatus;
  type: ContactType;
  role?: string;
  department?: string;
  lastSeen?: string;
  isBlocked?: boolean;
  isFavorite?: boolean;
  // Communication stats
  unreadMessages?: number;
  missedCalls?: number;
  lastMessageAt?: string;
  lastCallAt?: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  members: Contact[];
  avatar?: string;
  description?: string;
  createdAt: string;
  createdBy: number;
}

export interface RecentContact {
  contact: Contact;
  type: 'message' | 'call' | 'video' | 'live';
  timestamp: string;
  preview?: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
}

// ==================== MOCK DATA ====================

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@company.com',
    phone: '0901234567',
    avatar: 'https://i.pravatar.cc/100?img=1',
    status: 'online',
    type: 'user',
    role: 'Kỹ sư trưởng',
    department: 'Kỹ thuật',
    unreadMessages: 3,
    isFavorite: true,
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    email: 'tranthibinh@company.com',
    phone: '0912345678',
    avatar: 'https://i.pravatar.cc/100?img=2',
    status: 'online',
    type: 'user',
    role: 'Kiến trúc sư',
    department: 'Thiết kế',
    unreadMessages: 0,
    isFavorite: true,
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    email: 'levancuong@company.com',
    phone: '0923456789',
    avatar: 'https://i.pravatar.cc/100?img=3',
    status: 'busy',
    type: 'user',
    role: 'Quản lý dự án',
    department: 'Quản lý',
    unreadMessages: 1,
    missedCalls: 2,
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    email: 'phamthidung@company.com',
    phone: '0934567890',
    avatar: 'https://i.pravatar.cc/100?img=4',
    status: 'offline',
    type: 'user',
    role: 'Kế toán',
    department: 'Tài chính',
    lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 5,
    name: 'Hoàng Văn Em',
    email: 'hoangvanem@company.com',
    phone: '0945678901',
    avatar: 'https://i.pravatar.cc/100?img=5',
    status: 'away',
    type: 'user',
    role: 'Kỹ thuật viên',
    department: 'Kỹ thuật',
  },
  {
    id: 6,
    name: 'Vũ Thị Phương',
    email: 'vuthiphuong@customer.com',
    phone: '0956789012',
    avatar: 'https://i.pravatar.cc/100?img=6',
    status: 'online',
    type: 'customer',
    role: 'Khách hàng VIP',
    isFavorite: true,
  },
  {
    id: 7,
    name: 'Đặng Văn Giang',
    email: 'dangvangiang@supplier.com',
    phone: '0967890123',
    avatar: 'https://i.pravatar.cc/100?img=7',
    status: 'online',
    type: 'supplier',
    role: 'Nhà cung cấp vật liệu',
  },
  {
    id: 8,
    name: 'Mai Thị Hoa',
    email: 'maithihoa@company.com',
    phone: '0978901234',
    avatar: 'https://i.pravatar.cc/100?img=8',
    status: 'online',
    type: 'user',
    role: 'Trợ lý',
    department: 'Hành chính',
  },
];

export const MOCK_GROUPS: ContactGroup[] = [
  {
    id: 'group-1',
    name: 'Dự án Resort Hội An',
    members: MOCK_CONTACTS.slice(0, 4),
    description: 'Nhóm dự án xây dựng Resort Hội An',
    createdAt: new Date().toISOString(),
    createdBy: 1,
  },
  {
    id: 'group-2',
    name: 'Team Kỹ thuật',
    members: [MOCK_CONTACTS[0], MOCK_CONTACTS[4]],
    description: 'Nhóm kỹ thuật công ty',
    createdAt: new Date().toISOString(),
    createdBy: 1,
  },
  {
    id: 'group-3',
    name: 'Họp ban giám đốc',
    members: MOCK_CONTACTS.slice(0, 3),
    description: 'Nhóm họp BGĐ hàng tuần',
    createdAt: new Date().toISOString(),
    createdBy: 2,
  },
];

// ==================== API FUNCTIONS ====================

/**
 * Get all contacts with optional filters
 */
export async function getContacts(params?: {
  type?: ContactType;
  status?: ContactStatus;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Contact[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/contacts${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<ContactsResponse | Contact[]>(url);
    
    if (Array.isArray(response)) {
      return response;
    }
    return response.contacts || [];
  } catch (error) {
    console.log('[UnifiedContacts] API not available, using mock data');
    // Filter mock data based on params
    let filtered = [...MOCK_CONTACTS];
    
    if (params?.type) {
      filtered = filtered.filter(c => c.type === params.type);
    }
    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone?.includes(search)
      );
    }
    
    return filtered;
  }
}

/**
 * Get contact by ID
 */
export async function getContactById(id: number): Promise<Contact | null> {
  try {
    return await apiFetch<Contact>(`/contacts/${id}`);
  } catch (error) {
    console.log('[UnifiedContacts] Using mock contact');
    return MOCK_CONTACTS.find(c => c.id === id) || null;
  }
}

/**
 * Get online contacts
 */
export async function getOnlineContacts(): Promise<Contact[]> {
  return getContacts({ status: 'online' });
}

/**
 * Get favorite contacts
 */
export async function getFavoriteContacts(): Promise<Contact[]> {
  try {
    return await apiFetch<Contact[]>('/contacts/favorites');
  } catch (error) {
    return MOCK_CONTACTS.filter(c => c.isFavorite);
  }
}

/**
 * Get recent contacts (recent communications)
 */
export async function getRecentContacts(limit = 10): Promise<RecentContact[]> {
  try {
    return await apiFetch<RecentContact[]>(`/contacts/recent?limit=${limit}`);
  } catch (error) {
    // Mock recent contacts
    return MOCK_CONTACTS.slice(0, limit).map(contact => ({
      contact,
      type: ['message', 'call', 'video'][Math.floor(Math.random() * 3)] as RecentContact['type'],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      preview: 'Tin nhắn gần đây...',
    }));
  }
}

/**
 * Get contact groups
 */
export async function getContactGroups(): Promise<ContactGroup[]> {
  try {
    return await apiFetch<ContactGroup[]>('/contacts/groups');
  } catch (error) {
    return MOCK_GROUPS;
  }
}

/**
 * Create new contact group
 */
export async function createContactGroup(data: {
  name: string;
  memberIds: number[];
  description?: string;
}): Promise<ContactGroup> {
  try {
    return await apiFetch<ContactGroup>('/contacts/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Mock create
    const members = MOCK_CONTACTS.filter(c => data.memberIds.includes(c.id));
    return {
      id: `group-${Date.now()}`,
      name: data.name,
      members,
      description: data.description,
      createdAt: new Date().toISOString(),
      createdBy: 1,
    };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(contactId: number): Promise<boolean> {
  try {
    const response = await apiFetch<{ isFavorite: boolean }>(`/contacts/${contactId}/favorite`, {
      method: 'POST',
    });
    return response.isFavorite;
  } catch (error) {
    // Mock toggle
    const contact = MOCK_CONTACTS.find(c => c.id === contactId);
    if (contact) {
      contact.isFavorite = !contact.isFavorite;
      return contact.isFavorite;
    }
    return false;
  }
}

/**
 * Block/unblock contact
 */
export async function toggleBlock(contactId: number): Promise<boolean> {
  try {
    const response = await apiFetch<{ isBlocked: boolean }>(`/contacts/${contactId}/block`, {
      method: 'POST',
    });
    return response.isBlocked;
  } catch (error) {
    const contact = MOCK_CONTACTS.find(c => c.id === contactId);
    if (contact) {
      contact.isBlocked = !contact.isBlocked;
      return contact.isBlocked;
    }
    return false;
  }
}

/**
 * Update contact status (for self)
 */
export async function updateMyStatus(status: ContactStatus): Promise<void> {
  try {
    await apiFetch('/contacts/me/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.log('[UnifiedContacts] Status update failed');
  }
}

/**
 * Search contacts across all types
 */
export async function searchContacts(query: string): Promise<Contact[]> {
  if (!query.trim()) return [];
  return getContacts({ search: query });
}

/**
 * Get contact with communication summary
 */
export interface ContactWithStats extends Contact {
  totalMessages: number;
  totalCalls: number;
  totalVideoCalls: number;
  lastInteraction?: string;
}

export async function getContactWithStats(contactId: number): Promise<ContactWithStats | null> {
  try {
    return await apiFetch<ContactWithStats>(`/contacts/${contactId}/stats`);
  } catch (error) {
    const contact = MOCK_CONTACTS.find(c => c.id === contactId);
    if (contact) {
      return {
        ...contact,
        totalMessages: Math.floor(Math.random() * 100),
        totalCalls: Math.floor(Math.random() * 20),
        totalVideoCalls: Math.floor(Math.random() * 10),
        lastInteraction: new Date().toISOString(),
      };
    }
    return null;
  }
}

// Types already exported inline
