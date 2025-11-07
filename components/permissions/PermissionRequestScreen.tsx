import { Colors } from '@/constants/theme';
import { PermissionStatus, useAppPermissions } from '@/hooks/useAppPermissions';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface PermissionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  status: PermissionStatus;
  onRequest: () => Promise<void>;
  colorScheme: 'light' | 'dark';
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  icon,
  title,
  description,
  status,
  onRequest,
  colorScheme,
}) => {
  const colors = Colors[colorScheme];
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    await onRequest();
    setRequesting(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'granted':
        return '#4CAF50';
      case 'denied':
        return '#F44336';
      default:
        return colors.text;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'granted':
        return 'checkmark-circle';
      case 'denied':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={[styles.permissionCard, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
          <Ionicons name={icon} size={28} color={colors.accent} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {status === 'granted'
                ? 'Đã cấp'
                : status === 'denied'
                ? 'Bị từ chối'
                : 'Chưa xin'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>

      {status !== 'granted' && (
        <TouchableOpacity
          style={[
            styles.requestButton,
            { backgroundColor: colors.accent },
            requesting && styles.requestButtonDisabled,
          ]}
          onPress={handleRequest}
          disabled={requesting}
          activeOpacity={0.7}
        >
          <Text style={styles.requestButtonText}>
            {requesting ? 'Đang xin quyền...' : status === 'denied' ? 'Mở Cài đặt' : 'Cấp quyền'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function PermissionRequestScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    permissions,
    loading,
    checkAllPermissions,
    requestCamera,
    requestMicrophone,
    requestLocation,
    requestNotification,
    requestMediaLibrary,
    requestAll,
  } = useAppPermissions();

  const [allGranted, setAllGranted] = useState(false);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  useEffect(() => {
    const granted =
      permissions.camera === 'granted' &&
      permissions.microphone === 'granted' &&
      permissions.location === 'granted' &&
      permissions.notification === 'granted' &&
      permissions.mediaLibrary === 'granted';
    setAllGranted(granted);
  }, [permissions]);

  const permissionsList = [
    {
      icon: 'camera' as const,
      title: 'Camera',
      description:
        'Để thực hiện cuộc gọi video với đối tác, chụp ảnh tiến độ công trình và quét mã QR.',
      status: permissions.camera,
      onRequest: requestCamera,
    },
    {
      icon: 'mic' as const,
      title: 'Microphone',
      description:
        'Để thực hiện cuộc gọi âm thanh/video, ghi âm ghi chú và họp trực tuyến với đội ngũ.',
      status: permissions.microphone,
      onRequest: requestMicrophone,
    },
    {
      icon: 'location' as const,
      title: 'Vị trí',
      description:
        'Để check-in tại công trình, xác minh vị trí làm việc và gắn địa điểm vào báo cáo tiến độ.',
      status: permissions.location,
      onRequest: requestLocation,
    },
    {
      icon: 'notifications' as const,
      title: 'Thông báo',
      description:
        'Để nhận cập nhật tiến độ dự án, nhắc nhở công việc quan trọng và thông báo cuộc gọi đến.',
      status: permissions.notification,
      onRequest: requestNotification,
    },
    {
      icon: 'images' as const,
      title: 'Thư viện ảnh',
      description:
        'Để lưu ảnh tiến độ công trình, tải lên ảnh từ thư viện và xuất báo cáo có hình ảnh.',
      status: permissions.mediaLibrary,
      onRequest: requestMediaLibrary,
    },
  ];

  const handleRequestAll = async () => {
    await requestAll();
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.accent, colors.accent + '80']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="shield-checkmark" size={64} color="#fff" />
        <Text style={styles.headerTitle}>Quyền truy cập cần thiết</Text>
        <Text style={styles.headerSubtitle}>
          Để sử dụng đầy đủ chức năng của ứng dụng, vui lòng cấp các quyền sau:
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {permissionsList.map((permission, index) => (
          <PermissionCard
            key={index}
            {...permission}
            colorScheme={colorScheme}
          />
        ))}

        <View style={styles.actionContainer}>
          {!allGranted ? (
            <>
              <TouchableOpacity
                style={[styles.requestAllButton, { backgroundColor: colors.accent }]}
                onPress={handleRequestAll}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-done" size={22} color="#fff" />
                <Text style={styles.requestAllButtonText}>
                  {loading ? 'Đang xin tất cả quyền...' : 'Cấp tất cả quyền'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.skipButton, { borderColor: colors.border }]}
                onPress={handleContinue}
                activeOpacity={0.7}
              >
                <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                  Bỏ qua (không khuyến khích)
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.continueButtonText}>Hoàn tất & Tiếp tục</Text>
              <Ionicons name="arrow-forward" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Chúng tôi cam kết bảo mật dữ liệu của bạn
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  permissionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  actionContainer: {
    marginTop: 8,
    gap: 12,
  },
  requestAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  requestAllButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
