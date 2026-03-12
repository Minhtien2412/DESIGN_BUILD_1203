/**
 * Permission Reminder Modal
 * Popup nhắc người dùng cấp quyền nếu chưa cho phép
 * CHỈ HIỆN 1 LẦN DUY NHẤT - không hỏi lại sau khi dismiss
 */

import { usePermissions } from '@/context/PermissionContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const PermissionReminderModal = () => {
  const {
    permissions,
    showPermissionReminder,
    dismissReminder,
    requestAllPermissions,
  } = usePermissions();
  
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const error = useThemeColor({}, 'error');

  if (!showPermissionReminder) return null;

  const missingPermissions = [
    { name: 'Camera', icon: 'camera', granted: permissions.camera === 'granted' },
    { name: 'Vị trí', icon: 'location', granted: permissions.location === 'granted' },
    { name: 'Thông báo', icon: 'notifications', granted: permissions.notifications === 'granted' },
  ].filter(p => !p.granted);

  return (
    <Modal
      visible={showPermissionReminder}
      transparent
      animationType="fade"
      onRequestClose={dismissReminder}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={[styles.container, { backgroundColor: surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: `${primary}20` }]}>
              <Ionicons name="lock-closed" size={32} color={primary} />
            </View>
            <Text style={[styles.title, { color: text }]}>
              Cấp quyền truy cập
            </Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>
              Ứng dụng cần các quyền sau để hoạt động tốt nhất
            </Text>
          </View>

          {/* Missing Permissions List */}
          <View style={styles.permissionList}>
            {missingPermissions.map((permission, index) => (
              <View key={index} style={[styles.permissionItem, { borderBottomColor: `${textMuted}20` }]}>
                <View style={styles.permissionLeft}>
                  <Ionicons 
                    name={permission.icon as any} 
                    size={24} 
                    color={error} 
                  />
                  <Text style={[styles.permissionName, { color: text }]}>
                    {permission.name}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${error}20` }]}>
                  <Text style={[styles.badgeText, { color: error }]}>Chưa cấp</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.description}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={primary} />
              <Text style={[styles.infoText, { color: textMuted }]}>
                Camera: Chụp ảnh công trình, hồ sơ
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={primary} />
              <Text style={[styles.infoText, { color: textMuted }]}>
                Vị trí: Hiển thị công trình gần bạn
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={primary} />
              <Text style={[styles.infoText, { color: textMuted }]}>
                Thông báo: Cập nhật dự án, tin nhắn
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, { borderColor: primary }]}
              onPress={dismissReminder}
            >
              <Text style={[styles.buttonText, { color: primary }]}>Không cần</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, { backgroundColor: primary }]}
              onPress={async () => {
                await requestAllPermissions();
                dismissReminder();
              }}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Cấp quyền</Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <Text style={[styles.note, { color: textMuted }]}>
            💡 Bạn có thể thay đổi quyền bất kỳ lúc nào trong Cài đặt
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionList: {
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    gap: 10,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    // backgroundColor set dynamically
  },
  buttonSecondary: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
