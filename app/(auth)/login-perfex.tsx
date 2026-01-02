/**
 * Perfex CRM Login Screen
 * Dedicated login for Perfex CRM users (Staff & Customers)
 * 
 * Features:
 * - Staff login with email/password
 * - Customer login with contact credentials
 * - Direct integration with Perfex CRM API
 * - Role-based dashboard redirect
 * 
 * @author ThietKeResort Team
 * @created 2025-12-31
 */

import DevLoginHelper from '@/components/dev/DevLoginHelper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePerfexAuth } from '@/context/PerfexAuthContext';
import { getItem, setItem } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Perfex CRM Brand Colors
const COLORS = {
  primary: '#03a9f4',
  primaryDark: '#0288d1',
  secondary: '#00bcd4',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textMuted: '#7f8c8d',
  border: '#e0e0e0',
  success: '#4caf50',
  error: '#f44336',
  orange: '#ff9800',
};

type UserType = 'staff' | 'customer';

export default function PerfexLoginScreen() {
  const router = useRouter();
  const { signIn, loading } = usePerfexAuth();
  
  const [userType, setUserType] = useState<UserType>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await getItem('perfex_last_email');
      const savedUserType = await getItem('perfex_last_usertype') as UserType | null;
      
      if (savedEmail) setEmail(savedEmail);
      if (savedUserType) setUserType(savedUserType);
    } catch (error) {
      console.log('[PerfexLogin] Failed to load saved credentials:', error);
    }
  };

  const saveCredentials = async () => {
    if (rememberMe && email) {
      try {
        await setItem('perfex_last_email', email);
        await setItem('perfex_last_usertype', userType);
      } catch (error) {
        console.log('[PerfexLogin] Failed to save credentials:', error);
      }
    }
  };

  // Quick fill credentials for development
  const handleQuickFill = (email: string, password: string, userType: UserType) => {
    setEmail(email);
    setPassword(password);
    setUserType(userType);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setErrors({});
      
      // Save credentials if Remember Me is checked
      await saveCredentials();
      
      await signIn(email, password);
      
      // Success - navigate based on user type
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[PerfexLogin] Error:', error);
      setErrors({
        general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      });
    }
  };

  // Switch to main app login
  const switchToMainLogin = () => {
    router.replace('/(auth)/login-shopee');
  };

  // Navigate to test screen
  const goToTestScreen = () => {
    router.push('/test-perfex-auth');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="business" size={60} color={COLORS.surface} />
              </View>
              <Text style={styles.title}>Perfex CRM</Text>
              <Text style={styles.subtitle}>Đăng nhập hệ thống quản lý</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              {/* User Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, userType === 'staff' && styles.typeButtonActive]}
                  onPress={() => setUserType('staff')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="briefcase" 
                    size={20} 
                    color={userType === 'staff' ? COLORS.primary : COLORS.textMuted} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    userType === 'staff' && styles.typeButtonTextActive
                  ]}>
                    Nhân viên
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeButton, userType === 'customer' && styles.typeButtonActive]}
                  onPress={() => setUserType('customer')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="people" 
                    size={20} 
                    color={userType === 'customer' ? COLORS.primary : COLORS.textMuted} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    userType === 'customer' && styles.typeButtonTextActive
                  ]}>
                    Khách hàng
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <Input
                    value={email}
                    onChangeText={(text: string) => {
                      setEmail(text);
                      setErrors({ ...errors, email: undefined });
                    }}
                    placeholder={userType === 'staff' ? 'staff@example.com' : 'customer@example.com'}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <Input
                    value={password}
                    onChangeText={(text: string) => {
                      setPassword(text);
                      setErrors({ ...errors, password: undefined });
                    }}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Dev Quick Fill Helper */}
                <DevLoginHelper onSelectCredential={handleQuickFill} />

                {/* General Error */}
                {errors.general && (
                  <View style={styles.generalError}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                    <Text style={styles.generalErrorText}>{errors.general}</Text>
                  </View>
                )}

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={styles.rememberMeRow}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={rememberMe ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={rememberMe ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => router.push('/(auth)/forgot-password')}
                  >
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <Button
                  title="Đăng nhập"
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth
                  style={styles.loginButton}
                />

                {/* Test Button (Development) */}
                {__DEV__ && (
                  <Button
                    title="Test Perfex Auth"
                    onPress={goToTestScreen}
                    variant="outline"
                    fullWidth
                    style={styles.testButton}
                  />
                )}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={switchToMainLogin} style={styles.switchButton}>
                <Ionicons name="arrow-back" size={16} color={COLORS.surface} />
                <Text style={styles.switchButtonText}>Đăng nhập bằng tài khoản App</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Hệ thống quản lý dự án xây dựng
              </Text>
              
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={16} color={COLORS.surface} />
                <Text style={styles.infoText}>
                  Dành cho nhân viên và khách hàng đã có tài khoản Perfex CRM
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.surface,
    opacity: 0.9,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  // Type Selector
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  typeButtonTextActive: {
    color: COLORS.primary,
  },

  // Form
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberMeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  generalErrorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  },
  testButton: {
    marginTop: 8,
  },

  // Footer
  footer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 16,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  switchButtonText: {
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.surface,
    opacity: 0.8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    maxWidth: width - 80,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.surface,
    opacity: 0.9,
  },
});
