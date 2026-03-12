/**
 * useSocialLogin Hook
 * Handle Google, Facebook, and Apple sign-in
 */

import ENV from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { authenticateWithGoogle } from '@/services/google-auth';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export type SocialProvider = 'google' | 'facebook' | 'apple';

// Safely import Google Sign-In (may not be available in Expo Go)
let GoogleSignin: any = null;
try {
  const GoogleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleSigninModule.GoogleSignin;
  
  // Configure Google Sign-In only if available
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID || ENV.GOOGLE_CLIENT_ID,
      iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
      accountName: '',
    });
  }
} catch (error) {
  console.warn('[useSocialLogin] Google Sign-In not available (Expo Go limitation)');
}

export function useSocialLogin() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  // Check if Google Play Services are available (Android)
  useEffect(() => {
    if (GoogleSignin && Platform.OS === 'android') {
      GoogleSignin.hasPlayServices().catch((error: any) => {
        console.warn('[GoogleSignIn] Play Services not available:', error);
      });
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!GoogleSignin) {
      Alert.alert(
        'Not Available',
        'Google Sign-In requires a development build. It is not available in Expo Go.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      console.log('[useSocialLogin] Starting Google Sign-In...');
      
      // Check if Google Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Perform Google Sign-In
      const signInResult = await GoogleSignin.signIn();
      
      // Type guard to check if sign-in was successful
      if (!signInResult || typeof signInResult === 'undefined') {
        throw new Error('Sign-in result is undefined');
      }

      // Access data property for user info
      const userEmail = (signInResult as any).data?.user?.email || '';
      const userName = (signInResult as any).data?.user?.name || '';
      const userPhoto = (signInResult as any).data?.user?.photo || '';
      
      console.log('[useSocialLogin] Google Sign-In successful:', userEmail);

      // Get ID token
      const tokens = await GoogleSignin.getTokens();
      console.log('[useSocialLogin] Got Google tokens');

      // Authenticate with backend
      const authResult = await authenticateWithGoogle({
        idToken: tokens.idToken,
        serverAuthCode: (signInResult as any).serverAuthCode,
        email: userEmail,
        name: userName || undefined,
        photoUrl: userPhoto || undefined,
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
      
      // Handle specific error codes
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log('[useSocialLogin] User cancelled Google Sign-In');
        return { success: false, cancelled: true };
      }
      
      if (error.code === 'IN_PROGRESS') {
        Alert.alert('Đang xử lý', 'Đăng nhập Google đang được xử lý');
        return { success: false };
      }
      
      if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        Alert.alert(
          'Lỗi',
          'Google Play Services không khả dụng. Vui lòng cập nhật Google Play Services.'
        );
        return { success: false };
      }

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
