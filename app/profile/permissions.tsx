import { useThemeColor } from '@/hooks/use-theme-color';
import {
    checkCameraPermission,
    checkLocationPermission,
    checkNotificationPermission,
    checkStoragePermission,
    openAppSettings,
    requestPermissionWithAlert,
    type PermissionType,
} from '@/utils/devicePermissions';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface Permission {
  type: PermissionType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  granted: boolean;
  loading: boolean;
}

export default function PermissionsScreen() {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const success = '#4CAF50';
  const warning = '#FF9800';

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      type: 'camera',
      label: 'Camera',
      description: 'Chụp ảnh, quay video cho dự án',
      icon: 'camera-outline',
      granted: false,
      loading: false,
    },
    {
      type: 'storage',
      label: 'Bộ nhớ',
      description: 'Truy cập ảnh và video',
      icon: 'images-outline',
      granted: false,
      loading: false,
    },
    {
      type: 'location',
      label: 'Vị trí',
      description: 'Tìm thợ thi công gần bạn',
      icon: 'location-outline',
      granted: false,
      loading: false,
    },
    {
      type: 'notifications',
      label: 'Thông báo',
      description: 'Nhận cập nhật dự án',
      icon: 'notifications-outline',
      granted: false,
      loading: false,
    },
  ]);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    setChecking(true);
    
    const [camera, storage, location, notifications] = await Promise.all([
      checkCameraPermission(),
      checkStoragePermission(),
      checkLocationPermission(),
      checkNotificationPermission(),
    ]);

    setPermissions((prev) =>
      prev.map((p) => {
        switch (p.type) {
          case 'camera':
            return { ...p, granted: camera.granted };
          case 'storage':
            return { ...p, granted: storage.granted };
          case 'location':
            return { ...p, granted: location.granted };
          case 'notifications':
            return { ...p, granted: notifications.granted };
          default:
            return p;
        }
      })
    );

    setChecking(false);
  };

  const handleRequestPermission = async (type: PermissionType) => {
    // Set loading
    setPermissions((prev) =>
      prev.map((p) => (p.type === type ? { ...p, loading: true } : p))
    );

    const granted = await requestPermissionWithAlert(type);

    // Update state
    setPermissions((prev) =>
      prev.map((p) => (p.type === type ? { ...p, granted, loading: false } : p))
    );
  };

  const handleRequestAll = async () => {
    for (const permission of permissions) {
      if (!permission.granted) {
        await handleRequestPermission(permission.type);
      }
    }
  };

  const grantedCount = permissions.filter((p) => p.granted).length;
  const allGranted = grantedCount === permissions.length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quyền truy cập',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${primary}20` }]}>
              <Ionicons name="shield-checkmark-outline" size={48} color={primary} />
            </View>
            <Text style={[styles.title, { color: text }]}>Quyền truy cập</Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>
              Cấp quyền để ứng dụng hoạt động tốt nhất
            </Text>
          </View>

          {/* Progress */}
          {checking ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primary} />
              <Text style={[styles.loadingText, { color: textMuted }]}>
                Đang kiểm tra quyền...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressText, { color: text }]}>
                    {grantedCount}/{permissions.length} quyền đã cấp
                  </Text>
                  {allGranted && (
                    <Ionicons name="checkmark-circle" size={20} color={success} />
                  )}
                </View>
                <View style={[styles.progressBar, { backgroundColor: border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: allGranted ? success : primary,
                        width: `${(grantedCount / permissions.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Permissions List */}
              <View style={styles.permissionsList}>
                {permissions.map((permission) => (
                  <View
                    key={permission.type}
                    style={[
                      styles.permissionCard,
                      { borderColor: border },
                      permission.granted && {
                        borderColor: success,
                        backgroundColor: `${success}05`,
                      },
                    ]}
                  >
                    <View style={styles.permissionLeft}>
                      <View
                        style={[
                          styles.permissionIcon,
                          {
                            backgroundColor: permission.granted
                              ? `${success}20`
                              : `${warning}20`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={permission.icon}
                          size={24}
                          color={permission.granted ? success : warning}
                        />
                      </View>
                      <View style={styles.permissionInfo}>
                        <Text style={[styles.permissionLabel, { color: text }]}>
                          {permission.label}
                        </Text>
                        <Text
                          style={[styles.permissionDescription, { color: textMuted }]}
                        >
                          {permission.description}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.permissionButton,
                        {
                          backgroundColor: permission.granted
                            ? `${success}20`
                            : primary,
                        },
                      ]}
                      onPress={() => {
                        if (permission.granted) {
                          Alert.alert(
                            'Đã cấp quyền',
                            'Quyền này đã được cấp. Bạn có thể thay đổi trong Cài đặt.',
                            [
                              { text: 'Hủy', style: 'cancel' },
                              { text: 'Mở Cài đặt', onPress: openAppSettings },
                            ]
                          );
                        } else {
                          handleRequestPermission(permission.type);
                        }
                      }}
                      disabled={permission.loading}
                    >
                      {permission.loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text
                          style={[
                            styles.permissionButtonText,
                            {
                              color: permission.granted ? success : '#fff',
                            },
                          ]}
                        >
                          {permission.granted ? 'Đã cấp' : 'Cấp quyền'}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* Request All Button */}
              {!allGranted && (
                <Pressable
                  style={[styles.requestAllButton, { backgroundColor: primary }]}
                  onPress={handleRequestAll}
                >
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  <Text style={styles.requestAllText}>Cấp tất cả quyền</Text>
                </Pressable>
              )}

              {/* Info */}
              <View style={[styles.infoBox, { backgroundColor: `${primary}10`, borderColor: primary }]}>
                <Ionicons name="information-circle-outline" size={20} color={primary} />
                <Text style={[styles.infoText, { color: text }]}>
                  Bạn có thể thay đổi quyền bất cứ lúc nào trong Cài đặt thiết bị
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  permissionsList: {
    gap: 12,
    marginBottom: 24,
  },
  permissionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 13,
  },
  permissionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  requestAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
