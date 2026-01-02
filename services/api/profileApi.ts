/**
 * Profile API Service
 * Handles: avatar upload, profile updates
 */

import { apiFetch } from '../api';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * Upload avatar image
 * @param file - Image file to upload (File or Blob)
 * @returns Avatar URL path (e.g., "/uploads/avatars/user_123_timestamp.jpg")
 */
export async function uploadAvatar(file: File | Blob): Promise<string> {
  const formData = new FormData();
  
  // Append file with proper name
  if (file instanceof File) {
    formData.append('avatar', file);
  } else {
    // Blob - create File wrapper
    formData.append('avatar', file, 'avatar.jpg');
  }

  try {
    const response = await apiFetch('/profile/avatar', {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - browser will set it with boundary
    });

    // Backend returns { success: true, data: { avatar_url: "..." } }
    return response.data?.avatar_url || response.avatar_url;
  } catch (error: any) {
    console.error('[profileApi] Upload avatar failed:', error);
    throw new Error(error?.message || 'Failed to upload avatar');
  }
}

/**
 * Update user profile
 * @param data - Profile fields to update
 * @returns Updated user profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<any> {
  try {
    const response = await apiFetch('/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.data || response;
  } catch (error: any) {
    console.error('[profileApi] Update profile failed:', error);
    throw new Error(error?.message || 'Failed to update profile');
  }
}

/**
 * Get current user profile
 * @returns User profile data
 */
export async function getProfile(): Promise<any> {
  try {
    const response = await apiFetch('/profile', {
      method: 'GET',
    });

    return response.data || response;
  } catch (error: any) {
    console.error('[profileApi] Get profile failed:', error);
    throw new Error(error?.message || 'Failed to get profile');
  }
}

export default {
  uploadAvatar,
  updateProfile,
  getProfile,
};
