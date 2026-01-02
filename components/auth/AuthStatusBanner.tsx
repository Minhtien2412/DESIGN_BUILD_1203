/**
 * Auth Status Banner
 * Hiển thị trạng thái authentication system
 */

import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export function AuthStatusBanner() {
  // Hooks must be called unconditionally at the top level
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.banner, styles.loadingBanner]}>
        <MaterialCommunityIcons name="loading" size={16} color="#666" />
        <Text style={styles.loadingText}>Đang khởi tạo hệ thống...</Text>
      </View>
    );
  }

  if (isAuthenticated && user) {
    return (
      <View style={[styles.banner, styles.successBanner]}>
        <MaterialCommunityIcons name="check-circle" size={16} color="#4caf50" />
        <Text style={styles.successText}>
          Đã đăng nhập: {user.name || user.email || 'Unknown'}
        </Text>
        <Text style={styles.roleText}>
          ({user.role || 'No role'})
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.infoBanner]}>
      <MaterialCommunityIcons name="shield-check" size={16} color="#2196f3" />
      <Text style={styles.infoText}>
        Hệ thống xác thực đã sẵn sàng
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  loadingBanner: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  successBanner: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  infoBanner: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  successText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
    marginLeft: 8,
  },
  roleText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#2196f3',
    marginLeft: 8,
  },
});
