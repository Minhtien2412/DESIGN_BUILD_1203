/**
 * Profile API Service
 * Backend: https://baotienweb.cloud/api/v1/profile
 * 
 * Endpoints theo BACKEND_API_SPECS.md:
 * - POST   /profile/avatar  - Upload avatar image (multipart)
 * - DELETE /profile/avatar  - Delete avatar
 * - PATCH  /profile         - Update profile info
 * - GET    /profile         - Get current user profile
 */

import { API_BASE, apiFetch } from './api';

// ============================================================================
// Type Definitions (theo backend specs)
// ============================================================================

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  avatar_thumbnail?: string;
  dateOfBirth?: string;  // ISO date YYYY-MM-DD
  gender?: Gender;
  role?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    projects_count: number;
    completed_tasks: number;
    avg_rating: number;
  };
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;  // Format: YYYY-MM-DD
  gender?: Gender;
}

export interface AvatarUploadResult {
  success: boolean;
  message: string;
  data?: {
    avatar_url: string;
    thumbnail_url: string;
    uploaded_at: string;
  };
  error?: string;
  details?: Record<string, string[]>;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: UserProfile;
  error?: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Validation Helpers (theo backend specs)
// ============================================================================

/**
 * Validate Vietnamese phone number format
 * Backend regex: /^(0[3|5|7|8|9])+([0-9]{8})$/
 */
export function isValidVietnamesePhone(phone: string): boolean {
  const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return regex.test(phone);
}

/**
 * Validate user is at least 18 years old
 */
export function isValidDateOfBirth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}

/**
 * Validate name (min 2 chars, no special chars except Vietnamese accents)
 */
export function isValidName(name: string): boolean {
  if (name.length < 2) return false;
  // Allow letters, Vietnamese accents, spaces
  const regex = /^[a-zA-ZÀ-ỹ\s]+$/u;
  return regex.test(name);
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get current user profile
 * GET /profile
 * 
 * @returns User profile with avatar, stats, etc.
 */
export async function getProfile(): Promise<ProfileResponse> {
  try {
    const response = await apiFetch<ProfileResponse>('/profile');
    return response;
  } catch (error: any) {
    console.error('[ProfileAPI] Error fetching profile:', error);
    throw error;
  }
}

/**
 * Update user profile (partial update)
 * PATCH /profile
 * 
 * @param data - Fields to update (all optional)
 * @returns Updated profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
  // Client-side validation
  if (data.phone && !isValidVietnamesePhone(data.phone)) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      data: {} as UserProfile,
      details: { phone: ['Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam'] },
    };
  }

  if (data.dateOfBirth && !isValidDateOfBirth(data.dateOfBirth)) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      data: {} as UserProfile,
      details: { dateOfBirth: ['Người dùng phải từ 18 tuổi trở lên'] },
    };
  }

  if (data.name && !isValidName(data.name)) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      data: {} as UserProfile,
      details: { name: ['Tên phải có ít nhất 2 ký tự và không chứa ký tự đặc biệt'] },
    };
  }

  try {
    const response = await apiFetch<ProfileResponse>('/profile', {
      method: 'PATCH',
      data,
    });
    return response;
  } catch (error: any) {
    console.error('[ProfileAPI] Error updating profile:', error);
    throw error;
  }
}

/**
 * Upload user avatar
 * POST /profile/avatar
 * 
 * @param uri - Local file URI from ImagePicker
 * @returns Upload result with avatar URLs
 * 
 * Backend specs:
 * - Max file size: 5MB
 * - Allowed types: image/jpeg, image/png, image/webp
 * - Auto resize to 512x512
 * - Generate thumbnail 120x120
 */
export async function uploadAvatar(uri: string): Promise<AvatarUploadResult> {
  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    let type = 'image/jpeg';
    
    if (match) {
      const ext = match[1].toLowerCase();
      if (ext === 'png') type = 'image/png';
      else if (ext === 'webp') type = 'image/webp';
      else type = 'image/jpeg';
    }

    // Check file extension is allowed
    const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = filename.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return {
        success: false,
        message: 'Loại file không được hỗ trợ. Vui lòng sử dụng jpg, png, hoặc webp',
        error: 'INVALID_FILE',
        details: {
          allowed_types: ['image/jpeg', 'image/png', 'image/webp'],
        } as any,
      };
    }

    formData.append('avatar', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiFetch<AvatarUploadResult>('/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      message: 'Upload avatar thành công',
      data: response.data,
    };
  } catch (error: any) {
    console.error('[ProfileAPI] Avatar upload failed:', error);
    
    // Handle specific error codes from backend
    if (error.status === 413) {
      return {
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 5MB',
        error: 'FILE_TOO_LARGE',
      };
    }
    
    if (error.status === 400) {
      return {
        success: false,
        message: error.message || 'File không hợp lệ',
        error: 'INVALID_FILE',
      };
    }

    return {
      success: false,
      message: error.message || 'Upload avatar thất bại',
      error: error.code || 'UPLOAD_FAILED',
    };
  }
}

/**
 * Delete user avatar
 * DELETE /profile/avatar
 * 
 * @returns Result with default avatar URL
 */
export async function deleteAvatar(): Promise<{ success: boolean; message: string; default_avatar?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message: string; data: { avatar_url: null; default_avatar: string } }>('/profile/avatar', {
      method: 'DELETE',
    });

    return {
      success: true,
      message: 'Đã xóa avatar',
      default_avatar: response.data?.default_avatar,
    };
  } catch (error: any) {
    console.error('[ProfileAPI] Delete avatar failed:', error);
    return {
      success: false,
      message: error.message || 'Xóa avatar thất bại',
    };
  }
}

/**
 * Helper: Get full avatar URL with fallback
 */
export function getAvatarUrl(avatarPath?: string | null, userId?: string | number): string {
  if (!avatarPath) {
    // Return default avatar with user seed for consistency
    return `https://i.pravatar.cc/80?u=${userId || 'default'}`;
  }
  
  // If already absolute URL, return as-is
  if (/^https?:\/\//i.test(avatarPath)) {
    return avatarPath;
  }
  
  // Prepend API base URL
  const path = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${API_BASE}${path}`;
}

/**
 * Helper: Get avatar thumbnail URL
 */
export function getAvatarThumbnailUrl(thumbnailPath?: string | null, avatarUrl?: string): string {
  if (thumbnailPath) {
    if (/^https?:\/\//i.test(thumbnailPath)) {
      return thumbnailPath;
    }
    const path = thumbnailPath.startsWith('/') ? thumbnailPath : `/${thumbnailPath}`;
    return `${API_BASE}${path}`;
  }
  
  // Fallback to main avatar if no thumbnail
  return avatarUrl || 'https://i.pravatar.cc/40?u=default';
}
