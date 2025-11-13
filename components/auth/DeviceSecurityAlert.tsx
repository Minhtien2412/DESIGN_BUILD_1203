import { useThemeColor } from '@/hooks/use-theme-color';
import { DeviceInfo } from '@/services/deviceSecurity';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface DeviceSecurityAlertProps {
  visible: boolean;
  isNewDevice: boolean;
  otherDevices: DeviceInfo[];
  warningMessage?: string;
  onTrustDevice: () => void;
  onChangePassword: () => void;
  onViewDevices: () => void;
  onDismiss: () => void;
}

export function DeviceSecurityAlert({
  visible,
  isNewDevice,
  otherDevices,
  warningMessage,
  onTrustDevice,
  onChangePassword,
  onViewDevices,
  onDismiss
}: DeviceSecurityAlertProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const dangerColor = '#ff4444';
  const warningColor = '#ff9500';
  const primaryColor = '#007AFF';

  if (!visible || !isNewDevice) {
    return null;
  }

  const handleShowNativeAlert = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Cảnh báo bảo mật',
        warningMessage || 'Phát hiện đăng nhập từ thiết bị mới!',
        [
          {
            text: 'Đổi mật khẩu',
            style: 'destructive',
            onPress: onChangePassword
          },
          {
            text: 'Xem thiết bị',
            onPress: onViewDevices
          },
          {
            text: 'Tin cậy thiết bị này',
            onPress: () => {
              onTrustDevice();
              onDismiss();
            }
          }
        ]
      );
    }
  };

  React.useEffect(() => {
    if (visible && isNewDevice && Platform.OS !== 'web') {
      // Hiển thị Alert native trên mobile
      setTimeout(handleShowNativeAlert, 500);
    }
  }, [visible, isNewDevice]);

  // Modal cho web
  return (
    <Modal
      visible={visible && Platform.OS === 'web'}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons 
              name="shield-checkmark-outline" 
              size={32} 
              color={warningColor} 
            />
            <Text style={[styles.title, { color: textColor }]}>
              Cảnh báo bảo mật
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.warningText, { color: textColor }]}>
              {warningMessage || 'Phát hiện đăng nhập từ thiết bị mới!'}
            </Text>

            {/* Device list */}
            {otherDevices.length > 0 && (
              <View style={styles.deviceList}>
                <Text style={[styles.deviceListTitle, { color: textColor }]}>
                  Thiết bị đã đăng nhập trước đó:
                </Text>
                {otherDevices.slice(0, 2).map((device, index) => (
                  <View key={device.deviceId} style={styles.deviceItem}>
                    <Ionicons 
                      name={getDeviceIcon(device.deviceType)} 
                      size={16} 
                      color={textColor} 
                    />
                    <Text style={[styles.deviceName, { color: textColor }]}>
                      {device.deviceName}
                    </Text>
                    <Text style={[styles.deviceTime, { color: textColor + '80' }]}>
                      {new Date(device.lastLoginAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                ))}
                {otherDevices.length > 2 && (
                  <Text style={[styles.moreDevices, { color: textColor + '80' }]}>
                    và {otherDevices.length - 2} thiết bị khác...
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable 
              style={[styles.button, styles.dangerButton, { backgroundColor: dangerColor }]}
              onPress={() => {
                onChangePassword();
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            </Pressable>

            <Pressable 
              style={[styles.button, styles.secondaryButton, { borderColor: textColor + '40' }]}
              onPress={() => {
                onViewDevices();
                onDismiss();
              }}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>Xem tất cả thiết bị</Text>
            </Pressable>

            <Pressable 
              style={[styles.button, styles.primaryButton, { backgroundColor: primaryColor }]}
              onPress={() => {
                onTrustDevice();
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>Tin cậy thiết bị này</Text>
            </Pressable>
          </View>

          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onDismiss}>
            <Ionicons name="close" size={24} color={textColor} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function getDeviceIcon(deviceType: string): any {
  switch (deviceType) {
    case 'ios':
      return 'phone-portrait-outline';
    case 'android':
      return 'phone-portrait-outline';
    case 'web':
      return 'desktop-outline';
    default:
      return 'hardware-chip-outline';
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  deviceList: {
    marginTop: 12,
  },
  deviceListTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  deviceName: {
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
  },
  deviceTime: {
    fontSize: 11,
  },
  moreDevices: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ff4444',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
});
