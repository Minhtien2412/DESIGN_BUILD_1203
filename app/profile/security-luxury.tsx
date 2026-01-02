/**
 * Security Settings Screen - Luxury Redesign
 * Password management and security options
 */

import { LuxuryButton } from '@/components/ui/luxury-button';
import { LuxuryCard } from '@/components/ui/luxury-card';
import { LuxuryInput } from '@/components/ui/luxury-input';
import { SafeScrollView } from '@/components/ui/safe-area';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    StyleSheet,
    Switch,
    Text,
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

type PasswordStrength = 'weak' | 'medium' | 'strong';

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export default function SecurityLuxury() {
  const { user } = useAuth();

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<PasswordErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', device: 'iPhone 13 Pro', location: 'TP. Hồ Chí Minh', ip: '118.69.xxx.xxx', lastActive: '5 phút trước', current: true },
    { id: '2', device: 'Chrome on Windows', location: 'Hà Nội', ip: '171.244.xxx.xxx', lastActive: '2 giờ trước', current: false },
    { id: '3', device: 'Safari on MacBook', location: 'Đà Nẵng', ip: '14.177.xxx.xxx', lastActive: '1 ngày trước', current: false },
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.timing.elegant,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const calculateSecurityScore = (): number => {
    let score = 30;
    if (twoFactorEnabled) score += 30;
    if (biometricEnabled) score += 20;
    if (loginNotifications) score += 10;
    if (passwordStrength === 'strong') score += 10;
    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.light.success;
    if (score >= 50) return Colors.light.warning;
    return Colors.light.error;
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Tốt';
    if (score >= 50) return 'Trung bình';
    return 'Yếu';
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return 'weak';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength >= 5) return 'strong';
    if (strength >= 3) return 'medium';
    return 'weak';
  };

  useEffect(() => {
    const strength = checkPasswordStrength(passwordForm.newPassword);
    setPasswordStrength(strength);
  }, [passwordForm.newPassword]);

  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setChangingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thay đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleTerminateSession = (sessionId: string) => {
    Alert.alert(
      'Kết thúc phiên',
      'Bạn có chắc muốn kết thúc phiên đăng nhập này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Kết thúc',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(s => s.id !== sessionId));
          },
        },
      ]
    );
  };

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'strong': return Colors.light.success;
      case 'medium': return Colors.light.warning;
      default: return Colors.light.error;
    }
  };

  const getStrengthText = (strength: PasswordStrength) => {
    switch (strength) {
      case 'strong': return 'Mạnh';
      case 'medium': return 'Trung bình';
      default: return 'Yếu';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Bảo mật',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: Colors.light.surface,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.accent}
              colors={[Colors.light.accent]}
            />
          }
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Security Score Card */}
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.secondary]}
              style={styles.scoreCard}
            >
              <View style={styles.scoreContent}>
                <Text style={styles.scoreLabel}>Chỉ số bảo mật</Text>
                <Text style={styles.scoreValue}>{securityScore}/100</Text>
                <Text style={[styles.scoreStatus, { color: getScoreColor(securityScore) }]}>
                  {getScoreText(securityScore)}
                </Text>
                
                {/* Progress Bar */}
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${securityScore}%`,
                        backgroundColor: getScoreColor(securityScore)
                      }
                    ]} 
                  />
                </View>
              </View>
            </LinearGradient>

            {/* Change Password Section */}
            <LuxuryCard style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.goldBar} />
                <Text style={styles.sectionTitle}>Thay đổi mật khẩu</Text>
              </View>

              <LuxuryInput
                label="Mật khẩu hiện tại"
                value={passwordForm.currentPassword}
                onChangeText={(value) => {
                  setPasswordForm({ ...passwordForm, currentPassword: value });
                  if (errors.currentPassword) setErrors({ ...errors, currentPassword: undefined });
                }}
                error={errors.currentPassword}
                leftIcon="lock-closed"
                rightIcon={showCurrentPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
                secureTextEntry={!showCurrentPassword}
                variant="filled"
                containerStyle={styles.input}
              />

              <LuxuryInput
                label="Mật khẩu mới"
                value={passwordForm.newPassword}
                onChangeText={(value) => {
                  setPasswordForm({ ...passwordForm, newPassword: value });
                  if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                }}
                error={errors.newPassword}
                leftIcon="lock-closed"
                rightIcon={showNewPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                secureTextEntry={!showNewPassword}
                variant="filled"
                containerStyle={styles.input}
              />

              {passwordForm.newPassword && (
                <View style={styles.strengthIndicator}>
                  <Text style={styles.strengthLabel}>Độ mạnh: </Text>
                  <Text style={[styles.strengthValue, { color: getStrengthColor(passwordStrength) }]}>
                    {getStrengthText(passwordStrength)}
                  </Text>
                </View>
              )}

              <LuxuryInput
                label="Xác nhận mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChangeText={(value) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                error={errors.confirmPassword}
                leftIcon="lock-closed"
                rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                secureTextEntry={!showConfirmPassword}
                variant="filled"
                containerStyle={styles.input}
              />

              <LuxuryButton
                variant="primary"
                size="large"
                onPress={handleChangePassword}
                loading={changingPassword}
                disabled={changingPassword}
                title={changingPassword ? 'Đang lưu...' : 'Thay đổi mật khẩu'}
              />
            </LuxuryCard>

            {/* Security Settings Section */}
            <LuxuryCard style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.goldBar} />
                <Text style={styles.sectionTitle}>Cài đặt bảo mật</Text>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.light.info + '15' }]}>
                    <Ionicons name="shield-checkmark" size={20} color={Colors.light.info} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Xác thực hai yếu tố</Text>
                    <Text style={styles.settingDesc}>Bảo vệ tài khoản với mã OTP</Text>
                  </View>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={setTwoFactorEnabled}
                  trackColor={{ false: Colors.light.border, true: Colors.light.accent + '50' }}
                  thumbColor={twoFactorEnabled ? Colors.light.accent : Colors.light.textMuted}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.light.warning + '15' }]}>
                    <Ionicons name="notifications" size={20} color={Colors.light.warning} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Thông báo đăng nhập</Text>
                    <Text style={styles.settingDesc}>Nhận cảnh báo đăng nhập lạ</Text>
                  </View>
                </View>
                <Switch
                  value={loginNotifications}
                  onValueChange={setLoginNotifications}
                  trackColor={{ false: Colors.light.border, true: Colors.light.accent + '50' }}
                  thumbColor={loginNotifications ? Colors.light.accent : Colors.light.textMuted}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.light.success + '15' }]}>
                    <Ionicons name="finger-print" size={20} color={Colors.light.success} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Sinh trắc học</Text>
                    <Text style={styles.settingDesc}>Đăng nhập bằng vân tay/Face ID</Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: Colors.light.border, true: Colors.light.accent + '50' }}
                  thumbColor={biometricEnabled ? Colors.light.accent : Colors.light.textMuted}
                />
              </View>
            </LuxuryCard>

            {/* Active Sessions Section */}
            <LuxuryCard style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.goldBar} />
                <Text style={styles.sectionTitle}>Phiên đăng nhập</Text>
              </View>

              {sessions.map((session, index) => (
                <View key={session.id} style={styles.sessionItem}>
                  <View style={[styles.sessionIcon, { backgroundColor: session.current ? Colors.light.success + '15' : Colors.light.primary + '15' }]}>
                    <Ionicons 
                      name={session.device.includes('iPhone') || session.device.includes('iPad') ? 'phone-portrait' : 'desktop'} 
                      size={20} 
                      color={session.current ? Colors.light.success : Colors.light.primary} 
                    />
                  </View>
                  
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionDevice}>{session.device}</Text>
                      {session.current && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentText}>Hiện tại</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sessionLocation}>{session.location} · {session.ip}</Text>
                    <Text style={styles.sessionTime}>{session.lastActive}</Text>
                  </View>

                  {!session.current && (
                    <TouchableOpacity
                      style={styles.terminateButton}
                      onPress={() => handleTerminateSession(session.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={24} color={Colors.light.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </LuxuryCard>

            <View style={{ height: 40 }} />
          </Animated.View>
        </SafeScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scoreCard: {
    margin: 16,
    borderRadius: 20,
    padding: 32,
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.goldLight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.light.surface,
    letterSpacing: 0.5,
  },
  scoreStatus: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 8,
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  goldBar: {
    width: 4,
    height: 20,
    backgroundColor: Colors.light.accent,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  input: {
    marginBottom: 16,
  },
  strengthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  strengthValue: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.light.primary,
    letterSpacing: 0.3,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.light.success + '20',
  },
  currentText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.success,
    letterSpacing: 0.3,
  },
  sessionLocation: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  terminateButton: {
    padding: 8,
  },
});
