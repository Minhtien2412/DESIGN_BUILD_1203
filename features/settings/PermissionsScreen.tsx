/**
 * Permissions Status Screen
 * Hiển thị và quản lý tất cả quyền truy cập thiết bị
 * Created: 13/01/2026
 */

import {
    getAllPermissionsStatus,
    openAppSettings,
    requestPermissionWithAlert,
    type PermissionStatus,
    type PermissionType,
} from '@/utils/devicePermissions';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PermissionItemProps {
  type: PermissionType;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: PermissionStatus;
  onRequest: () => void;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  type,
  name,
  description,
  icon,
  status,
  onRequest,
}) => {
  const getStatusColor = () => {
    if (status.granted) return '#22c55e';
    if (status.status === 'denied') return '#ef4444';
    return '#f59e0b';
  };

  const getStatusText = () => {
    if (status.granted) return 'Đã cấp quyền';
    if (status.status === 'denied') return 'Bị từ chối';
    return 'Chưa cấp quyền';
  };

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    if (status.granted) return 'checkmark-circle';
    if (status.status === 'denied') return 'close-circle';
    return 'help-circle';
  };

  return (
    <View style={styles.permissionCard}>
      <View style={styles.permissionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
          <Ionicons name={icon} size={24} color={getStatusColor()} />
        </View>
        <View style={styles.permissionInfo}>
          <Text style={styles.permissionName}>{name}</Text>
          <Text style={styles.permissionDesc}>{description}</Text>
        </View>
      </View>
      
      <View style={styles.permissionStatus}>
        <View style={styles.statusBadge}>
          <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        {!status.granted && (
          <TouchableOpacity
            style={[styles.requestButton, { borderColor: getStatusColor() }]}
            onPress={onRequest}
          >
            <Text style={[styles.requestButtonText, { color: getStatusColor() }]}>
              {status.canAskAgain ? 'Yêu cầu' : 'Cài đặt'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function PermissionsScreen() {
  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionStatus> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPermissions = useCallback(async () => {
    const status = await getAllPermissionsStatus();
    setPermissions(status);
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPermissions();
    setRefreshing(false);
  };

  const handleRequestPermission = async (type: PermissionType) => {
    const granted = await requestPermissionWithAlert(type);
    if (granted) {
      await loadPermissions();
    }
  };

  const handleOpenSettings = () => {
    Alert.alert(
      'Mở Cài đặt',
      'Bạn sẽ được chuyển đến cài đặt ứng dụng để quản lý quyền truy cập.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Mở Cài đặt', onPress: openAppSettings },
      ]
    );
  };

  const permissionItems = [
    {
      type: 'camera' as PermissionType,
      name: 'Camera',
      description: 'Chụp ảnh, quay video, gọi video call',
      icon: 'camera' as const,
    },
    {
      type: 'storage' as PermissionType,
      name: 'Bộ nhớ / Thư viện',
      description: 'Truy cập ảnh, video trong thiết bị',
      icon: 'images' as const,
    },
    {
      type: 'location' as PermissionType,
      name: 'Vị trí',
      description: 'Xác định vị trí công trình, điểm giao hàng',
      icon: 'location' as const,
    },
    {
      type: 'notifications' as PermissionType,
      name: 'Thông báo',
      description: 'Nhận thông báo đơn hàng, tin nhắn',
      icon: 'notifications' as const,
    },
    {
      type: 'microphone' as PermissionType,
      name: 'Microphone',
      description: 'Ghi âm, gọi điện, tìm kiếm giọng nói',
      icon: 'mic' as const,
    },
  ];

  const grantedCount = permissions 
    ? Object.values(permissions).filter(p => p.granted).length 
    : 0;
  const totalCount = permissionItems.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quyền truy cập</Text>
        <TouchableOpacity onPress={handleOpenSettings} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#6366f1" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Trạng thái quyền</Text>
            <Text style={styles.summaryText}>
              {grantedCount}/{totalCount} quyền đã được cấp
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(grantedCount / totalCount) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Các quyền này giúp ứng dụng hoạt động đầy đủ tính năng. 
            Bạn có thể thay đổi bất cứ lúc nào trong Cài đặt.
          </Text>
        </View>

        {/* Permission List */}
        <View style={styles.permissionList}>
          <Text style={styles.sectionTitle}>Danh sách quyền</Text>
          
          {permissionItems.map((item) => (
            <PermissionItem
              key={item.type}
              {...item}
              status={permissions?.[item.type] || { granted: false, canAskAgain: true, status: 'undetermined' }}
              onRequest={() => handleRequestPermission(item.type)}
            />
          ))}
        </View>

        {/* Additional Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Tính năng liên quan</Text>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/demo-videos' as any)}
          >
            <View style={styles.featureIcon}>
              <Ionicons name="videocam" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureName}>Video Demo Xây dựng</Text>
              <Text style={styles.featureDesc}>Xem các video hướng dẫn và tiến độ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/settings/api-status' as any)}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="cloud-done" size={24} color="#10b981" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureName}>Trạng thái API</Text>
              <Text style={styles.featureDesc}>Kiểm tra kết nối backend</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  permissionList: {
    marginBottom: 24,
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  permissionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  permissionDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  requestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  requestButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8b5cf620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    flex: 1,
    marginLeft: 12,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  featureDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
