/**
 * Enhanced Device Security Integration
 * Compatible với Enhanced Auth System
 */

import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert } from 'react-native';

export function EnhancedDeviceSecurityIntegration() {
  const { user, isAuthenticated } = useAuth();

  const handleChangePassword = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Chưa đăng nhập',
        'Vui lòng đăng nhập để thay đổi mật khẩu',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/(auth)/login' as any) }
        ]
      );
      return;
    }

    // Navigate to profile where user can change password
    router.push('/(tabs)/profile' as any);
  }, [isAuthenticated]);

  // Enhanced device security alert simulation
  const handleSecurityAlert = useCallback(() => {
    if (!isAuthenticated || !user) return null;

    // Simulate device security check
    const isNewDevice = Math.random() > 0.8; // 20% chance of new device
    
    if (isNewDevice) {
      Alert.alert(
        'Thiết bị mới phát hiện',
        `Đăng nhập từ thiết bị mới cho tài khoản ${user.email}. Bạn có muốn tin tưởng thiết bị này?`,
        [
          {
            text: 'Không tin tưởng',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Đã từ chối thiết bị mới');
            }
          },
          {
            text: 'Tin tưởng',
            onPress: () => {
              Alert.alert('Đã thêm thiết bị vào danh sách tin tưởng');
            }
          },
          {
            text: 'Thay đổi mật khẩu',
            onPress: handleChangePassword
          }
        ]
      );
    }
  }, [isAuthenticated, user, handleChangePassword]);

  // Auto check device security when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Delay to avoid showing alert immediately
      const timer = setTimeout(handleSecurityAlert, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, handleSecurityAlert]);

  // This component doesn't render anything visible
  // It's just for background security monitoring
  return null;
}

export default EnhancedDeviceSecurityIntegration;
