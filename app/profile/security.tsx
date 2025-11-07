import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function SecurityScreen() {
  const { user } = useAuth();
  
  const [passwordForm, setPasswordForm] = React.useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = React.useState<PasswordErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  
  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [loginNotifications, setLoginNotifications] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  
  // Active sessions
  const [sessions, setSessions] = React.useState([
    { id: '1', device: 'iPhone 13 Pro', location: 'TP. Hồ Chí Minh', lastActive: '5 phút trước', current: true },
    { id: '2', device: 'Chrome on Windows', location: 'Hà Nội', lastActive: '2 giờ trước', current: false },
  ]);

  const validatePassword = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (passwordForm.newPassword === passwordForm.currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setChangingPassword(true);
    try {
      // TODO: Call API to change password
      // await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
        {
          text: 'OK',
          onPress: () => {
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggle2FA = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Kích hoạt xác thực 2 bước',
        'Bạn sẽ cần mã xác thực từ ứng dụng Authenticator mỗi khi đăng nhập.',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Tiếp tục',
            onPress: () => {
              // TODO: Navigate to 2FA setup screen
              setTwoFactorEnabled(true);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Tắt xác thực 2 bước',
        'Tài khoản của bạn sẽ kém bảo mật hơn nếu tắt tính năng này.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Tắt', onPress: () => setTwoFactorEnabled(false), style: 'destructive' }
        ]
      );
    }
  };

  const handleEndSession = (sessionId: string) => {
    Alert.alert(
      'Kết thúc phiên',
      'Bạn có chắc muốn đăng xuất khỏi thiết bị này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(s => s.id !== sessionId));
          }
        }
      ]
    );
  };

  const handleEndAllSessions = () => {
    Alert.alert(
      'Đăng xuất tất cả',
      'Bạn sẽ bị đăng xuất khỏi tất cả thiết bị khác (trừ thiết bị hiện tại).',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(s => s.current));
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{ 
          title: 'Tài khoản bảo mật',
          headerBackTitle: 'Quay lại',
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Change Password Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={24} color="#0891B2" />
              <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
            </View>
            
            <View style={styles.card}>
              {/* Current Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Mật khẩu hiện tại <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.currentPassword && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    value={passwordForm.currentPassword}
                    onChangeText={(text) => {
                      setPasswordForm({ ...passwordForm, currentPassword: text });
                      if (errors.currentPassword) setErrors({ ...errors, currentPassword: undefined });
                    }}
                    placeholder="Nhập mật khẩu hiện tại"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Ionicons 
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={22} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
              </View>

              {/* New Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Mật khẩu mới <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.newPassword && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    value={passwordForm.newPassword}
                    onChangeText={(text) => {
                      setPasswordForm({ ...passwordForm, newPassword: text });
                      if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                    }}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons 
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={22} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Xác nhận mật khẩu <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    value={passwordForm.confirmPassword}
                    onChangeText={(text) => {
                      setPasswordForm({ ...passwordForm, confirmPassword: text });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={22} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, changingPassword && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={changingPassword}
                activeOpacity={0.8}
              >
                {changingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Đổi mật khẩu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Cài đặt bảo mật</Text>
            </View>
            
            <View style={styles.card}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="finger-print" size={24} color="#6B7280" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Xác thực 2 bước</Text>
                    <Text style={styles.settingDescription}>Bảo vệ tài khoản bằng mã xác thực</Text>
                  </View>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={handleToggle2FA}
                  trackColor={{ false: '#D1D5DB', true: '#0891B2' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications" size={24} color="#6B7280" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Thông báo đăng nhập</Text>
                    <Text style={styles.settingDescription}>Nhận thông báo khi có đăng nhập mới</Text>
                  </View>
                </View>
                <Switch
                  value={loginNotifications}
                  onValueChange={setLoginNotifications}
                  trackColor={{ false: '#D1D5DB', true: '#0891B2' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="scan" size={24} color="#6B7280" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Sinh trắc học</Text>
                    <Text style={styles.settingDescription}>Đăng nhập bằng vân tay/Face ID</Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#0891B2' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>

          {/* Active Sessions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="phone-portrait" size={24} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Phiên đăng nhập</Text>
            </View>
            
            <View style={styles.card}>
              {sessions.map((session, index) => (
                <React.Fragment key={session.id}>
                  <View style={styles.sessionItem}>
                    <View style={styles.sessionIcon}>
                      <Ionicons 
                        name={session.device.includes('iPhone') ? 'phone-portrait' : 'desktop'} 
                        size={24} 
                        color="#6B7280" 
                      />
                    </View>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionDevice}>{session.device}</Text>
                        {session.current && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>Hiện tại</Text></View>}
                      </View>
                      <Text style={styles.sessionLocation}>{session.location}</Text>
                      <Text style={styles.sessionTime}>{session.lastActive}</Text>
                    </View>
                    {!session.current && (
                      <TouchableOpacity 
                        onPress={() => handleEndSession(session.id)}
                        style={styles.sessionEndButton}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {index < sessions.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}

              {sessions.length > 1 && (
                <>
                  <View style={styles.divider} />
                  <TouchableOpacity 
                    style={styles.dangerButton}
                    onPress={handleEndAllSessions}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.dangerButtonText}>Đăng xuất tất cả thiết bị khác</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Security Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
              <Text style={styles.tipsTitle}>Mẹo bảo mật</Text>
            </View>
            <Text style={styles.tipText}>• Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</Text>
            <Text style={styles.tipText}>• Bật xác thực 2 bước để tăng cường bảo mật</Text>
            <Text style={styles.tipText}>• Không chia sẻ mật khẩu với bất kỳ ai</Text>
            <Text style={styles.tipText}>• Đổi mật khẩu định kỳ mỗi 3-6 tháng</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: '#0891B2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sessionDevice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  sessionLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionEndButton: {
    padding: 4,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  tipText: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 6,
    lineHeight: 20,
  },
});
