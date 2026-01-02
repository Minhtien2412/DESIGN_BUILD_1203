/**
 * Modern Auth Header - Compact auth component for home page header
 */

import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ModernAuthHeader() {
  const { user, isAuthenticated, loading, signOut } = useAuth();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Navigate to profile page when user is logged in
      router.push('/(tabs)/profile');
    } else {
      // Navigate to login screen
      router.push('/(auth)/login' as any);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="loading" size={20} color="#0A6847" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (isAuthenticated && user) {
    return (
      <TouchableOpacity style={styles.container} onPress={handleAuthAction}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={24} color="#0A6847" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name || user.email || 'User'}
          </Text>
          <Text style={styles.userRole} numberOfLines={1}>
            {user.role || 'Member'}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={16} color="#6b7280" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.loginButton} onPress={handleAuthAction}>
      <MaterialCommunityIcons name="login" size={16} color="#ffffff" />
      <Text style={styles.loginText}>Đăng nhập</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(144, 180, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(144, 180, 76, 0.3)',
  },
  avatarContainer: {
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  userRole: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#0A6847',
    gap: 6,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
});
