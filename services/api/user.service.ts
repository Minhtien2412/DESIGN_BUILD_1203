/**
 * User Service
 * Handles user management and profile endpoints
 * 
 * Endpoints:
 * - GET /users - List users (paginated, with filters)
 * - POST /users - Create user (admin)
 * - GET /users/{id} - Get user by ID
 * - PUT /users/{id} - Update user
 * - DELETE /users/{id} - Delete user
 * - PUT /profile - Update current user profile
 */

import { apiClient } from './client';
import type {
    ChangePasswordData,
    PaginatedResponse,
    UpdateProfileData,
    User,
    UserFilters,
} from './types';

export const userService = {
  /**
   * Get paginated list of users with filters
   * GET /users
   */
  list: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    console.log('[UserService] 📋 Fetching users with filters:', filters);
    
    const params: Record<string, string> = {};
    if (filters?.role) params.role = filters.role;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);

    const response = await apiClient.get<any>('/users', params);
    
    // Handle different response formats from backend
    // Backend may return: { data: User[], meta: {...} } OR just User[]
    if (Array.isArray(response)) {
      console.log('[UserService] ✅ Users fetched (array format):', response.length);
      return {
        data: response,
        meta: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: response.length,
          totalPages: 1,
        },
      };
    }
    
    // Standard paginated response
    console.log('[UserService] ✅ Users fetched:', response.meta?.total || response.data?.length || 0, 'total');
    return response as PaginatedResponse<User>;
  },

  /**
   * Get user by ID
   * GET /users/{id}
   */
  getById: async (id: number): Promise<User> => {
    console.log('[UserService] 👤 Fetching user:', id);
    
    const response = await apiClient.get<User>(`/users/${id}`);
    
    console.log('[UserService] ✅ User fetched:', response.email);
    return response;
  },

  /**
   * Create new user (admin only)
   * POST /users
   */
  create: async (data: Partial<User>): Promise<User> => {
    console.log('[UserService] ➕ Creating user:', data.email);
    
    const response = await apiClient.post<User>('/users', data);
    
    console.log('[UserService] ✅ User created:', response.id);
    return response;
  },

  /**
   * Update user by ID
   * PUT /users/{id}
   */
  update: async (id: number, data: Partial<User>): Promise<User> => {
    console.log('[UserService] ✏️ Updating user:', id);
    
    const response = await apiClient.put<User>(`/users/${id}`, data);
    
    console.log('[UserService] ✅ User updated');
    return response;
  },

  /**
   * Delete user by ID
   * DELETE /users/{id}
   */
  delete: async (id: number): Promise<void> => {
    console.log('[UserService] 🗑️ Deleting user:', id);
    
    await apiClient.delete(`/users/${id}`);
    
    console.log('[UserService] ✅ User deleted');
  },

  /**
   * Update current user profile (with optional file upload)
   * PUT /profile
   */
  updateProfile: async (data: UpdateProfileData | FormData): Promise<User> => {
    console.log('[UserService] ✏️ Updating profile');
    
    const response = await apiClient.put<User>('/profile', data);
    
    console.log('[UserService] ✅ Profile updated');
    return response;
  },

  /**
   * Change password for current user
   * POST /users/change-password (or similar endpoint)
   */
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    console.log('[UserService] 🔒 Changing password');
    
    await apiClient.post('/users/change-password', data);
    
    console.log('[UserService] ✅ Password changed');
  },

  /**
   * Upload avatar for current user
   * Helper function to upload avatar file
   */
  uploadAvatar: async (fileUri: string): Promise<User> => {
    console.log('[UserService] 📸 Uploading avatar');
    
    const filename = fileUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('avatar', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await apiClient.put<User>('/profile', formData);
    
    console.log('[UserService] ✅ Avatar uploaded');
    return response;
  },
};

export default userService;
