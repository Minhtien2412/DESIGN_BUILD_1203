/**
 * useZaloAuth Hook
 * ================
 * 
 * React hook để đăng nhập Zalo
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import { useAuth } from '@/context/AuthContext';
import {
    ZaloAuthResult,
    ZaloUser,
    openZaloOA,
    shareToZalo,
    signInWithZalo
} from '@/services/zaloAuthService';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

// ==================== TYPES ====================

export interface UseZaloAuthReturn {
  /** Đang loading */
  loading: boolean;
  /** Thông tin user Zalo */
  zaloUser: ZaloUser | null;
  /** Error message */
  error: string | null;
  /** Đăng nhập bằng Zalo */
  signInWithZalo: () => Promise<boolean>;
  /** Liên kết tài khoản Zalo */
  linkZaloAccount: () => Promise<boolean>;
  /** Chia sẻ lên Zalo */
  share: (options: { title: string; description?: string; link?: string }) => Promise<boolean>;
  /** Mở chat Zalo OA */
  openOA: () => Promise<boolean>;
  /** Clear error */
  clearError: () => void;
}

// ==================== HOOK ====================

export function useZaloAuth(): UseZaloAuthReturn {
  const [loading, setLoading] = useState(false);
  const [zaloUser, setZaloUser] = useState<ZaloUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn: appSignIn, user: currentUser } = useAuth();

  // ==================== SIGN IN ====================

  const handleSignInWithZalo = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result: ZaloAuthResult = await signInWithZalo();

      if (!result.success || !result.user) {
        setError(result.error || 'Đăng nhập Zalo thất bại');
        return false;
      }

      setZaloUser(result.user);

      // Gọi API backend để đăng nhập/đăng ký với Zalo
      // Backend sẽ verify token và tạo/cập nhật user
      try {
        // Gửi thông tin Zalo đến backend
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/zalo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zaloId: result.user.id,
            name: result.user.name,
            avatar: result.user.picture?.data?.url,
            accessToken: result.accessToken,
          }),
        });

        const data = await response.json();

        if (data.success && data.token) {
          // Đăng nhập thành công với backend
          // Cập nhật auth context
          // appSignIn(data.user.email, data.token);
          return true;
        }
      } catch (backendError) {
        console.warn('[useZaloAuth] Backend error:', backendError);
        // Vẫn có thể sử dụng local Zalo user
      }

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      console.error('[useZaloAuth] Sign in error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== LINK ACCOUNT ====================

  const handleLinkZaloAccount = useCallback(async (): Promise<boolean> => {
    if (!currentUser) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập trước khi liên kết Zalo');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const result: ZaloAuthResult = await signInWithZalo();

      if (!result.success || !result.user) {
        setError(result.error || 'Liên kết Zalo thất bại');
        return false;
      }

      setZaloUser(result.user);

      // Gửi request liên kết đến backend
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/link-zalo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({
            zaloId: result.user.id,
            name: result.user.name,
            avatar: result.user.picture?.data?.url,
            accessToken: result.accessToken,
          }),
        });

        const data = await response.json();

        if (data.success) {
          Alert.alert('Thành công', 'Đã liên kết tài khoản Zalo');
          return true;
        } else {
          setError(data.message || 'Liên kết thất bại');
          return false;
        }
      } catch (backendError) {
        console.warn('[useZaloAuth] Backend link error:', backendError);
        setError('Không thể kết nối server');
        return false;
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ==================== SHARE ====================

  const handleShare = useCallback(async (options: { 
    title: string; 
    description?: string; 
    link?: string 
  }): Promise<boolean> => {
    try {
      return await shareToZalo({
        title: options.title,
        description: options.description,
        link: options.link || 'https://baotienweb.cloud',
      });
    } catch (err) {
      console.error('[useZaloAuth] Share error:', err);
      return false;
    }
  }, []);

  // ==================== OPEN OA ====================

  const handleOpenOA = useCallback(async (): Promise<boolean> => {
    try {
      return await openZaloOA();
    } catch (err) {
      console.error('[useZaloAuth] Open OA error:', err);
      return false;
    }
  }, []);

  // ==================== CLEAR ERROR ====================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== RETURN ====================

  return {
    loading,
    zaloUser,
    error,
    signInWithZalo: handleSignInWithZalo,
    linkZaloAccount: handleLinkZaloAccount,
    share: handleShare,
    openOA: handleOpenOA,
    clearError,
  };
}

export default useZaloAuth;
