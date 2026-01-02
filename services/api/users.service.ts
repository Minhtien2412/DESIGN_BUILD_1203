/**
 * Users API Service  
 * Connects to real backend database for user profiles, sellers, and authentication
 * Fallback to mock data when API unavailable
 */

import { apiFetch } from '../api';

const BASE_PATH = '/users';

// ==================== TYPES ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: 'CLIENT' | 'ENGINEER' | 'ADMIN' | 'SELLER' | 'CONTRACTOR' | 'ARCHITECT' | 'DESIGNER' | 'WORKER';
  verified?: boolean;
  
  // Profile info
  bio?: string;
  company?: string;
  position?: string;
  address?: string;
  
  // Stats
  rating?: number; // 0-5
  reviewCount?: number;
  projectsCount?: number;
  yearsExperience?: number;
  
  // Social
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  
  // Status
  online?: boolean;
  lastSeen?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  // Extended profile data
  skills?: string[];
  certifications?: string[];
  portfolio?: string[];
  languages?: string[];
  
  // Business info (for sellers/contractors)
  businessName?: string;
  businessType?: 'individual' | 'company';
  taxId?: string;
  licenseNumber?: string;
  website?: string;
  
  // Verification
  identityVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  verified?: boolean;
  search?: string;
  sortBy?: 'name' | 'rating' | 'projects' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

// ==================== API FUNCTIONS ====================

/**
 * Get user profile by ID from database
 */
export async function getUserById(userId: string): Promise<UserProfile> {
  try {
    console.log('[UsersService] Fetching user:', userId);
    
    const user = await apiFetch<UserProfile>(`${BASE_PATH}/${userId}`, {
      method: 'GET',
    });

    console.log('[UsersService] ✅ User loaded from database:', user.name);
    return user;
    
  } catch (error) {
    console.warn('[UsersService] ⚠️ API failed, using mock data:', error);
    
    // Fallback to mock data
    return getMockUser(userId);
  }
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    console.log('[UsersService] Fetching current user');
    
    const user = await apiFetch<UserProfile>(`${BASE_PATH}/me`, {
      method: 'GET',
    });

    console.log('[UsersService] ✅ Current user loaded:', user.name);
    return user;
    
  } catch (error) {
    console.warn('[UsersService] ⚠️ API failed, using mock data');
    
    // Fallback to mock data
    return getMockUser('current');
  }
}

/**
 * Get list of users with filters
 */
export async function getUsers(params: UserQueryParams = {}): Promise<UsersListResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    console.log('[UsersService] Fetching users list');
    
    const response = await apiFetch<UsersListResponse>(url, {
      method: 'GET',
    });

    console.log('[UsersService] ✅ Users loaded from database:', response.users.length);
    return response;
    
  } catch (error) {
    console.warn('[UsersService] ⚠️ API failed, using mock data');
    
    // Fallback to mock data
    return getMockUsersList(params);
  }
}

/**
 * Search users by name, email, or company
 */
export async function searchUsers(keyword: string, limit: number = 10): Promise<User[]> {
  try {
    console.log('[UsersService] Searching users:', keyword);
    
    const response = await apiFetch<{ users: User[] }>(
      `${BASE_PATH}/search?q=${encodeURIComponent(keyword)}&limit=${limit}`,
      { method: 'GET' }
    );

    console.log('[UsersService] ✅ Search results:', response.users.length);
    return response.users;
    
  } catch (error) {
    console.warn('[UsersService] ⚠️ API failed, using mock data');
    
    // Fallback to mock data
    const mockUsers = MOCK_USERS_DB.filter(u =>
      u.name.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase()) ||
      u.company?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return mockUsers.slice(0, limit);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    console.log('[UsersService] Updating user:', userId);
    
    const user = await apiFetch<UserProfile>(`${BASE_PATH}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    console.log('[UsersService] ✅ User updated:', user.name);
    return user;
    
  } catch (error) {
    console.error('[UsersService] ❌ Failed to update user:', error);
    throw error;
  }
}

/**
 * Get user's connections (friends/followers)
 */
export async function getUserConnections(userId: string): Promise<User[]> {
  try {
    console.log('[UsersService] Fetching connections for:', userId);
    
    const response = await apiFetch<{ users: User[] }>(`${BASE_PATH}/${userId}/connections`, {
      method: 'GET',
    });

    console.log('[UsersService] ✅ Connections loaded:', response.users.length);
    return response.users;
    
  } catch (error) {
    console.warn('[UsersService] ⚠️ API failed, using mock data');
    
    // Return random mock users as connections
    return MOCK_USERS_DB.slice(0, 5);
  }
}

/**
 * Follow/unfollow user
 */
export async function toggleFollowUser(userId: string, follow: boolean): Promise<void> {
  try {
    console.log('[UsersService] Toggle follow:', userId, follow);
    
    await apiFetch<void>(`${BASE_PATH}/${userId}/${follow ? 'follow' : 'unfollow'}`, {
      method: 'POST',
    });

    console.log('[UsersService] ✅ Follow toggled successfully');
    
  } catch (error) {
    console.error('[UsersService] ❌ Failed to toggle follow:', error);
    throw error;
  }
}

// ==================== MOCK DATA FALLBACK ====================

const MOCK_USERS_DB: UserProfile[] = [
  {
    id: '1',
    email: 'nguyenvana@email.com',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    role: 'ENGINEER',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Kỹ sư trưởng chuyên về thiết kế và thi công biệt thự cao cấp',
    company: 'Công ty Xây dựng ABC',
    position: 'Kỹ sư trưởng',
    rating: 4.8,
    reviewCount: 127,
    projectsCount: 25,
    yearsExperience: 10,
    followersCount: 1250,
    followingCount: 340,
    friendsCount: 89,
    online: true,
    skills: ['Thiết kế kiến trúc', 'Quản lý dự án', 'AutoCAD', 'Revit'],
    certifications: ['Kỹ sư xây dựng hạng 1', 'PMP'],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: '2',
    email: 'tranthib@company.vn',
    name: 'Trần Thị B',
    phone: '0987654321',
    role: 'CONTRACTOR',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Nhà thầu uy tín với 15 năm kinh nghiệm',
    company: 'Công ty TNHH Xây dựng XYZ',
    businessType: 'company',
    position: 'Giám đốc',
    rating: 4.9,
    reviewCount: 203,
    projectsCount: 78,
    yearsExperience: 15,
    followersCount: 2100,
    followingCount: 450,
    friendsCount: 156,
    online: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    skills: ['Thi công xây dựng', 'Quản lý nhân sự', 'Giám sát công trình'],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: '3',
    email: 'phamvanc@design.vn',
    name: 'Phạm Văn C',
    phone: '0912345678',
    role: 'ENGINEER',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Chuyên gia thiết kế nội thất hiện đại',
    company: 'Studio Design C',
    position: 'Kiến trúc sư',
    rating: 4.7,
    reviewCount: 89,
    projectsCount: 42,
    yearsExperience: 8,
    followersCount: 890,
    followingCount: 210,
    friendsCount: 67,
    online: true,
    skills: ['Thiết kế nội thất', '3D Max', 'SketchUp', 'Photoshop'],
    certifications: ['Kiến trúc sư hạng 2'],
    identityVerified: true,
    emailVerified: true,
  },
  {
    id: 'ai-assistant',
    email: 'ai@baotienweb.cloud',
    name: 'AI Trợ lý Xây dựng',
    role: 'ADMIN',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
    bio: 'Trợ lý AI thông minh, hỗ trợ 24/7 về tư vấn xây dựng, báo giá và quản lý dự án',
    company: 'BaoTienWeb Platform',
    position: 'AI Assistant',
    online: true,
    skills: ['Tư vấn xây dựng', 'Báo giá tự động', 'Theo dõi tiến độ', 'Phân tích dữ liệu'],
  },
  {
    id: 'customer-service',
    email: 'support@baotienweb.cloud',
    name: 'Nhân viên CSKH',
    phone: '1900 6789',
    role: 'ADMIN',
    verified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=support',
    bio: 'Đội ngũ chăm sóc khách hàng chuyên nghiệp, giải đáp mọi thắc mắc',
    company: 'BaoTienWeb Support',
    position: 'Customer Service',
    online: true,
  },
];

/**
 * Get mock user for fallback
 */
function getMockUser(userId: string): UserProfile {
  const user = MOCK_USERS_DB.find(u => u.id === userId);
  
  if (user) return user;
  
  // Generate random mock user if not found
  return {
    id: userId,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    role: 'CLIENT',
    avatar: `https://i.pravatar.cc/150?img=${parseInt(userId) % 70}`,
    rating: 4.0 + Math.random(),
    reviewCount: Math.floor(Math.random() * 50),
    projectsCount: Math.floor(Math.random() * 10),
    online: Math.random() > 0.5,
    verified: Math.random() > 0.3,
  };
}

/**
 * Get mock users list for fallback
 */
function getMockUsersList(params: UserQueryParams): UsersListResponse {
  let filtered = [...MOCK_USERS_DB];

  // Apply filters
  if (params.role) {
    filtered = filtered.filter(u => u.role === params.role);
  }

  if (params.verified !== undefined) {
    filtered = filtered.filter(u => u.verified === params.verified);
  }

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.company?.toLowerCase().includes(search)
    );
  }

  // Apply sorting
  if (params.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (params.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case 'projects':
          comparison = (b.projectsCount || 0) - (a.projectsCount || 0);
          break;
      }

      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total: filtered.length,
    page,
    limit,
    hasMore: endIndex < filtered.length,
  };
}

// ==================== EXPORTS ====================

export { MOCK_USERS_DB };
