/**
 * Enhanced Login Screen
 * Sử dụng API backend thật
 */

import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../ui/button';
import { Container } from '../ui/container';
import { Loader } from '../ui/loader';
import { Section } from '../ui/section';
import { DemoCredentials } from './DemoCredentials';

export default function EnhancedLoginScreen() {
  const { signIn, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    account: '', // email, username, or phone
    password: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'username' | 'phone'>('email');

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Account validation
    if (!formData.account.trim()) {
      newErrors.account = 'Vui lòng nhập email/username/số điện thoại';
    } else {
      // Detect account type and validate accordingly
      const account = formData.account.trim();
      
      if (account.includes('@')) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(account)) {
          newErrors.account = 'Email không hợp lệ';
        }
        setLoginMethod('email');
      } else if (/^\d+$/.test(account)) {
        // Phone validation
        if (account.length < 10 || account.length > 11) {
          newErrors.account = 'Số điện thoại không hợp lệ';
        }
        setLoginMethod('phone');
      } else {
        // Username validation
        if (account.length < 3) {
          newErrors.account = 'Username phải có ít nhất 3 ký tự';
        }
        setLoginMethod('username');
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

  /**
   * Handle login
   */
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const email = loginMethod === 'email' ? formData.account : formData.account;
      const password = formData.password;

      await signIn(email, password);
      Alert.alert('Thành công', 'Đăng nhập thành công!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Lỗi đăng nhập', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Navigate to forgot password
   */
  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password' as any);
  };

  /**
   * Navigate to register
   */
  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  if (loading) {
    return (
      <Container>
        <Loader />
        <Text style={styles.loadingText}>Đang xác thực...</Text>
      </Container>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Container>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn quay trở lại
            </Text>
          </Section>

          {/* Demo Credentials */}
          <Section>
            <DemoCredentials 
              onFillCredentials={(email, password) => {
                setFormData({ account: email, password });
                setErrors({});
              }} 
            />
          </Section>

          {/* Login Form */}
          <Section>
            <View style={styles.form}>
              {/* Account Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email / Username / Số điện thoại *
                </Text>
                <TextInput
                  style={[styles.input, errors.account && styles.inputError]}
                  value={formData.account}
                  onChangeText={(value) => handleInputChange('account', value)}
                  placeholder="Nhập email, username hoặc số điện thoại"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={loginMethod === 'phone' ? 'phone-pad' : 'default'}
                />
                {errors.account && (
                  <Text style={styles.errorText}>{errors.account}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Button
                title="Đăng Nhập"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              {/* Login Method Indicator */}
              <View style={styles.methodIndicator}>
                <Text style={styles.methodText}>
                  Đăng nhập bằng: {
                    loginMethod === 'email' ? 'Email' :
                    loginMethod === 'phone' ? 'Số điện thoại' : 'Username'
                  }
                </Text>
              </View>
            </View>
          </Section>

          {/* Register Link */}
          <Section style={styles.footer}>
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Chưa có tài khoản? 
              </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>
                  Đăng ký ngay
                </Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* API Status */}
          <Section style={styles.apiStatus}>
            <Text style={styles.apiStatusText}>
              🔗 Kết nối với API: api.thietkeresort.com.vn
            </Text>
          </Section>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#000000',
    backgroundColor: '#ffebee',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  errorText: {
    color: '#000000',
    fontSize: 14,
    marginTop: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0D9488',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginBottom: 16,
  },
  methodIndicator: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  methodText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 30,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#0D9488',
    fontWeight: '600',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  apiStatus: {
    marginTop: 20,
    alignItems: 'center',
  },
  apiStatusText: {
    fontSize: 12,
    color: '#0D9488',
    fontFamily: 'monospace',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});
