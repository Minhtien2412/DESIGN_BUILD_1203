/**
 * useProfile Hook
 * 
 * Custom hook for profile management with:
 * - Avatar upload/delete (via backend API)
 * - Profile update
 * - Form validation
 * - Loading states
 * 
 * Backend: https://baotienweb.cloud/api/v1/profile
 * Updated: Dec 22, 2025 - Added avatar upload per BACKEND_API_SPECS
 */

import { ApiError, apiFetch } from '@/services/api';
import {
    deleteAvatar as apiDeleteAvatar,
    uploadAvatar as apiUploadAvatar,
    getAvatarUrl,
    isValidDateOfBirth,
    isValidName,
    isValidVietnamesePhone,
    type UpdateProfileData
} from '@/services/profileApi';
import { getToken } from '@/utils/storage';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  avatar_thumbnail?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  role?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    projects?: number;
    projects_count?: number;
    bookings?: number;
    reviews?: number;
    completed_tasks?: number;
    avg_rating?: number;
  };
}

interface UseProfileReturn {
  user: UserProfile | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  // New avatar functions
  uploadAvatar: () => Promise<string | null>;
  takePhotoAndUpload: () => Promise<string | null>;
  deleteAvatar: () => Promise<boolean>;
  getDisplayAvatarUrl: () => string;
  validateProfileData: (data: UpdateProfileData) => { valid: boolean; errors: string[] };
}

export function useProfile(): UseProfileReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        // Silent: no token is normal for unauthenticated users
        setUser(null);
        setLoading(false);
        return;
      }

      // Try /profile first, fallback to /auth/me
      let data;
      try {
        data = await apiFetch('/profile', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        data = data.data || data;
      } catch {
        data = await apiFetch('/auth/me', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        data = data.user || data;
      }

      setUser(data);
    } catch (err) {
      // Silent handling for auth errors (401/403) - user is simply not logged in
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          // Don't log or set error - just clear user state
          setUser(null);
          setError(null);
        } else {
          setError(err.data?.message || err.message || 'Failed to load profile');
          console.error('[useProfile] API Error:', err.status, err.data);
        }
      } else {
        setError('Unknown error occurred');
        console.error('[useProfile] Error:', err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) {
        setError('No authentication token');
        return false;
      }

      const response = await apiFetch('/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      setUser(response.user || response);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.message || err.message || 'Failed to update profile');
      } else {
        setError('Unknown error occurred');
      }
      return false;
    }
  }, []);

  // Validate profile data before submitting
  const validateProfileData = useCallback((data: UpdateProfileData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (data.name && !isValidName(data.name)) {
      errors.push('Tên phải có ít nhất 2 ký tự và không chứa ký tự đặc biệt');
    }
    
    if (data.phone && !isValidVietnamesePhone(data.phone)) {
      errors.push('Số điện thoại không hợp lệ (VD: 0901234567)');
    }
    
    if (data.dateOfBirth && !isValidDateOfBirth(data.dateOfBirth)) {
      errors.push('Bạn phải từ 18 tuổi trở lên');
    }
    
    if (data.bio && data.bio.length > 500) {
      errors.push('Giới thiệu không được vượt quá 500 ký tự');
    }
    
    return { valid: errors.length === 0, errors };
  }, []);

  // Upload avatar from gallery
  const uploadAvatar = useCallback(async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh');
        return null;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled || !result.assets[0]) {
        return null;
      }
      
      setUploading(true);
      const uri = result.assets[0].uri;
      
      const response = await apiUploadAvatar(uri);
      
      if (response.success && response.data) {
        setUser(prev => prev ? {
          ...prev,
          avatar: response.data!.avatar_url,
          avatar_thumbnail: response.data!.thumbnail_url,
        } : null);
        
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
        return response.data.avatar_url;
      } else {
        Alert.alert('Lỗi', response.message || 'Upload thất bại');
        return null;
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Upload thất bại');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  // Take photo with camera and upload
  const takePhotoAndUpload = useCallback(async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập camera');
        return null;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled || !result.assets[0]) {
        return null;
      }
      
      setUploading(true);
      const uri = result.assets[0].uri;
      
      const response = await apiUploadAvatar(uri);
      
      if (response.success && response.data) {
        setUser(prev => prev ? {
          ...prev,
          avatar: response.data!.avatar_url,
          avatar_thumbnail: response.data!.thumbnail_url,
        } : null);
        
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
        return response.data.avatar_url;
      } else {
        Alert.alert('Lỗi', response.message || 'Upload thất bại');
        return null;
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Upload thất bại');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  // Delete current avatar
  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn xóa ảnh đại diện?',
        [
          { text: 'Hủy', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              setUploading(true);
              
              try {
                const response = await apiDeleteAvatar();
                
                if (response.success) {
                  setUser(prev => prev ? {
                    ...prev,
                    avatar: undefined,
                    avatar_thumbnail: undefined,
                  } : null);
                  
                  Alert.alert('Thành công', 'Đã xóa ảnh đại diện');
                  resolve(true);
                } else {
                  Alert.alert('Lỗi', response.message || 'Xóa thất bại');
                  resolve(false);
                }
              } catch (e: any) {
                Alert.alert('Lỗi', e.message || 'Xóa thất bại');
                resolve(false);
              } finally {
                setUploading(false);
              }
            },
          },
        ]
      );
    });
  }, []);

  // Get display avatar URL with fallback
  const getDisplayAvatarUrl = useCallback((): string => {
    return getAvatarUrl(user?.avatar, user?.id);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    user,
    loading,
    uploading,
    error,
    refresh: fetchProfile,
    updateProfile,
    uploadAvatar,
    takePhotoAndUpload,
    deleteAvatar,
    getDisplayAvatarUrl,
    validateProfileData,
  };
}
