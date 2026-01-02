/**
 * Shopee-style Login Screen
 * Modern UI với social login, animations, Orange theme
 * 
 * UPDATED: Sử dụng PerfexAuthContext thay vì AuthContext
 * để đăng nhập qua Perfex CRM
 */

import { usePerfexAuth } from '@/context/PerfexAuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Shopee Orange Theme Colors
const SHOPEE_COLORS = {
  primary: '#EE4D2D',
  primaryDark: '#D73211',
  primaryLight: '#FF6B47',
  secondary: '#FFE4DD',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#222222',
  textMuted: '#757575',
  border: '#E0E0E0',
  success: '#00C853',
  error: '#D32F2F',
  facebook: '#1877F2',
  google: '#DB4437',
  apple: '#000000',
};

interface FormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  emailOrPhone?: string;
  password?: string;
  general?: string;
}

export default function LoginShopeeScreen() {
  const router = useRouter();
  const { signIn, loading: authLoading } = usePerfexAuth();
  
  // State
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: '',
    password: '',
    rememberMe: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Detect phone or email
  useEffect(() => {
    const value = formData.emailOrPhone;
    setIsPhone(/^\d+$/.test(value.replace(/[^0-9]/g, '')));
  }, [formData.emailOrPhone]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email/Phone validation
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Vui lòng nhập Email hoặc Số điện thoại';
    } else if (isPhone) {
      // Phone validation
      const phone = formData.emailOrPhone.replace(/[^0-9]/g, '');
      if (phone.length < 10) {
        newErrors.emailOrPhone = 'Số điện thoại không hợp lệ';
      }
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = 'Email không hợp lệ';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Shake animation on error
  const triggerShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      // Use email for API call
      const email = isPhone 
        ? `${formData.emailOrPhone.replace(/[^0-9]/g, '')}@phone.local` 
        : formData.emailOrPhone;
      
      await signIn(email, formData.password);
      
      // Success - navigate to home
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[Login] Error:', error);
      triggerShake();
      setErrors({
        general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setLoading(true);
      // TODO: Implement social login when backend supports
      setErrors({
        general: `Đăng nhập bằng ${provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'Apple'} sẽ sớm được hỗ trợ!`,
      });
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Navigate to register
  const goToRegister = () => {
    router.push('/(auth)/register-shopee');
  };

  // Navigate to forgot password
  const goToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const isLoading = loading || authLoading;

  return (
    <View style={styles.container}>
      {/* Header gradient */}
      <LinearGradient
        colors={[SHOPEE_COLORS.primary, SHOPEE_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="home-city" size={50} color={SHOPEE_COLORS.primary} />
          </View>
          <Text style={styles.logoText}>NhàXinh</Text>
          <Text style={styles.logoSubtext}>Xây dựng & Nội thất</Text>
        </Animated.View>
      </LinearGradient>

      {/* Form section */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.formCard,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
              }
            ]}
          >
            {/* Title */}
            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn quay lại!
            </Text>

            {/* Email/Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email / Số điện thoại</Text>
              <View style={[
                styles.inputWrapper,
                errors.emailOrPhone && styles.inputError,
              ]}>
                <Ionicons 
                  name={isPhone ? "call-outline" : "mail-outline"} 
                  size={20} 
                  color={SHOPEE_COLORS.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email hoặc số điện thoại"
                  placeholderTextColor={SHOPEE_COLORS.textMuted}
                  value={formData.emailOrPhone}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, emailOrPhone: text }));
                    if (errors.emailOrPhone) setErrors(prev => ({ ...prev, emailOrPhone: undefined }));
                  }}
                  keyboardType={isPhone ? "phone-pad" : "email-address"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.emailOrPhone && (
                <Text style={styles.errorText}>{errors.emailOrPhone}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={[
                styles.inputWrapper,
                errors.password && styles.inputError,
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={SHOPEE_COLORS.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={SHOPEE_COLORS.textMuted}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, password: text }));
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={SHOPEE_COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Remember me & Forgot password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberRow}
                onPress={() => setFormData(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
              >
                <View style={[
                  styles.checkbox,
                  formData.rememberMe && styles.checkboxChecked,
                ]}>
                  {formData.rememberMe && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={goToForgotPassword}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* General Error */}
            {errors.general && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={SHOPEE_COLORS.error} />
                <Text style={styles.errorBoxText}>{errors.general}</Text>
              </View>
            )}

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Đăng Nhập</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: SHOPEE_COLORS.google }]}
                onPress={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color="#FFF" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: SHOPEE_COLORS.facebook }]}
                onPress={() => handleSocialLogin('facebook')}
                disabled={isLoading}
              >
                <Ionicons name="logo-facebook" size={20} color="#FFF" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: SHOPEE_COLORS.apple }]}
                  onPress={() => handleSocialLogin('apple')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={20} color="#FFF" />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={goToRegister}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>

            {/* Perfex CRM Login Option */}
            <TouchableOpacity 
              style={styles.perfexRow}
              onPress={() => router.push('/(auth)/login-perfex')}
            >
              <Ionicons name="business" size={18} color={SHOPEE_COLORS.primary} />
              <Text style={styles.perfexText}>Đăng nhập Perfex CRM</Text>
              <Ionicons name="arrow-forward" size={16} color={SHOPEE_COLORS.primary} />
            </TouchableOpacity>

            {/* Help section */}
            <TouchableOpacity style={styles.helpRow}>
              <Ionicons name="help-circle-outline" size={18} color={SHOPEE_COLORS.textMuted} />
              <Text style={styles.helpText}>Bạn cần trợ giúp?</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHOPEE_COLORS.surface,
  },
  headerGradient: {
    height: height * 0.28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 60 : 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 10,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  formWrapper: {
    flex: 1,
    marginTop: -40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SHOPEE_COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: SHOPEE_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SHOPEE_COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: SHOPEE_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: SHOPEE_COLORS.surface,
  },
  inputError: {
    borderColor: SHOPEE_COLORS.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: SHOPEE_COLORS.text,
  },
  errorText: {
    fontSize: 12,
    color: SHOPEE_COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: SHOPEE_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: SHOPEE_COLORS.primary,
    borderColor: SHOPEE_COLORS.primary,
  },
  rememberText: {
    fontSize: 13,
    color: SHOPEE_COLORS.text,
  },
  forgotText: {
    fontSize: 13,
    color: SHOPEE_COLORS.primary,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${SHOPEE_COLORS.error}10`,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 13,
    color: SHOPEE_COLORS.error,
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: SHOPEE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: SHOPEE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SHOPEE_COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: SHOPEE_COLORS.textMuted,
    marginHorizontal: 12,
    fontWeight: '600',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    minWidth: 100,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: {
    fontSize: 14,
    color: SHOPEE_COLORS.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: SHOPEE_COLORS.primary,
  },
  perfexRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: `${SHOPEE_COLORS.primary}10`,
    borderRadius: 10,
    marginBottom: 12,
  },
  perfexText: {
    fontSize: 14,
    color: SHOPEE_COLORS.primary,
    fontWeight: '600',
  },
  helpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  helpText: {
    fontSize: 13,
    color: SHOPEE_COLORS.textMuted,
  },
});
