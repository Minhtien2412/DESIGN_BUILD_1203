/**
 * useSocialLogin Hook
 * Handle Google, Facebook, and Apple sign-in
 */

import { useAuth } from '@/context/AuthContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { authenticateWithGoogle } from '@/services/google-auth';
import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';

export type SocialProvider = 'google' | 'facebook' | 'apple';

export function useSocialLogin() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { signInWithGoogle } = useGoogleAuth();

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[useSocialLogin] Starting Google OAuth (expo-auth-session)...');
      const oauthResult = await signInWithGoogle();
      console.log('[useSocialLogin] Google OAuth successful:', oauthResult.email);

      // Authenticate with backend
      const authResult = await authenticateWithGoogle({
        idToken: oauthResult.token,
        email: oauthResult.email,
        name: oauthResult.name,
        photoUrl: oauthResult.picture,
      });

      if (authResult.accessToken && authResult.user) {
        console.log('[useSocialLogin] ✅ Backend authentication successful');
        console.log('[useSocialLogin] User ID:', authResult.user.id);
        console.log('[useSocialLogin] Role:', authResult.user.role);
        
        // Update AuthContext with email and access token
        // Note: Backend returns accessToken, not token
        await signIn(authResult.user.email, authResult.accessToken);
        
        Alert.alert('Thành công', `Xin chào ${authResult.user.name}!\nĐăng nhập bằng Google thành công.`);
        return { 
          success: true, 
          user: authResult.user,
          accessToken: authResult.accessToken,
          refreshToken: authResult.refreshToken,
        };
      } else {
        throw new Error('Invalid response from backend');
      }
    } catch (error: any) {
      console.error('[useSocialLogin] Google error:', error);

      Alert.alert('Lỗi', error.message || 'Đăng nhập Google thất bại');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const loginWithFacebook = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[useSocialLogin] Starting Facebook Login...');
      
      // For now, show coming soon message
      // Full implementation requires Facebook App setup in Facebook Developer Console
      Alert.alert(
        'Sắp ra mắt',
        'Tính năng đăng nhập bằng Facebook đang được phát triển.\n\n' +
        'Để sử dụng, cần:\n' +
        '• Facebook App ID từ Facebook Developer\n' +
        '• Cấu hình OAuth redirect URIs\n' +
        '• Backend endpoint /auth/social\n\n' +
        'Vui lòng sử dụng đăng nhập bằng Email hoặc Google trong thời gian chờ đợi.',
        [{ text: 'OK' }]
      );
      
      return { success: false, pending: true };
    } catch (error: any) {
      console.error('[useSocialLogin] Facebook error:', error);
      Alert.alert('Lỗi', error.message || 'Đăng nhập Facebook thất bại');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Không khả dụng', 'Sign in with Apple chỉ khả dụng trên iOS');
      return { success: false };
    }

    setLoading(true);
    try {
      // TODO: Implement Apple Sign-In
      // const { AppleAuthentication } = require('expo-apple-authentication');
      // const credential = await AppleAuthentication.signInAsync({
      //   requestedScopes: [
      //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
      //   ],
      // });
      
      Alert.alert(
        'Apple Sign-In',
        'Tính năng đăng nhập bằng Apple sẽ sớm được tích hợp.\n\nCần cấu hình:\n• Apple Developer Account\n• Sign in with Apple capability\n• Service ID configuration'
      );
      
      return { success: false };
    } catch (error: any) {
      console.error('[useSocialLogin] Apple error:', error);
      if (error.code === 'ERR_CANCELED') {
        return { success: false }; // User cancelled
      }
      Alert.alert('Lỗi', error.message || 'Đăng nhập Apple thất bại');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWith = useCallback(async (provider: SocialProvider) => {
    switch (provider) {
      case 'google':
        return await loginWithGoogle();
      case 'facebook':
        return await loginWithFacebook();
      case 'apple':
        return await loginWithApple();
      default:
        return { success: false, error: 'Unknown provider' };
    }
  }, [loginWithGoogle, loginWithFacebook, loginWithApple]);

  return {
    loading,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    loginWith,
  };
}
