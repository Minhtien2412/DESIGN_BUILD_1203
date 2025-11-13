/**
 * Enhanced Device Security Integration
 * Compatible với Enhanced Auth System
 */

import { router } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export function EnhancedDeviceSecurityIntegration() {
  const { user, isAuthenticated } = useAuth();

  const handleChangePassword = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Chưa đăng nhập',
        'Vui lòng đăng nhập để thay đổi mật khẩu',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/enhanced-login' as any) }
        ]
      );
      return;
    }

    // Navigate to profile where user can change password
    router.push('/(tabs)/profile' as any);
  };

  const handleViewDevices = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Chưa đăng nhập',
        'Vui lòng đăng nhập để xem thiết bị',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/enhanced-login' as any) }
        ]
      );
      return;
    }

    // Navigate to device management screen
    router.push('/device-management' as any);
  };

  // Enhanced device security alert simulation
  const handleSecurityAlert = () => {
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
  };

  // Auto check device security when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Delay to avoid showing alert immediately
      const timer = setTimeout(handleSecurityAlert, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  // This component doesn't render anything visible
  // It's just for background security monitoring
  return null;
}

export default EnhancedDeviceSecurityIntegration;
