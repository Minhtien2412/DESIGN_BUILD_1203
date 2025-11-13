/**
 * Enhanced Register Screen
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

export default function EnhancedRegisterScreen() {
  const { signUp, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'khach-hang' as string,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    // Phone validation (optional)
    if (formData.phone.trim()) {
      const phoneRegex = /^(\+84|84|0)([3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    // Username validation (optional)
    if (formData.username.trim()) {
      if (formData.username.length < 3) {
        newErrors.username = 'Username phải có ít nhất 3 ký tự';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username chỉ được chứa chữ, số và dấu gạch dưới';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ và 1 số';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Terms validation
    if (!termsAccepted) {
      newErrors.terms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle register
   */
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await signUp(formData.email.trim(), formData.password, formData.name.trim());
      Alert.alert(
        'Đăng ký thành công!', 
        'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/') // Navigate to login
          }
        ]
      );
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('Lỗi đăng ký', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
   * Navigate to login
   */
  const handleLogin = () => {
    router.back();
  };

  if (loading) {
    return (
      <Container>
        <Loader />
        <Text style={styles.loadingText}>Đang tạo tài khoản...</Text>
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
        showsVerticalScrollIndicator={false}
      >
        <Container>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.title}>Đăng Ký</Text>
            <Text style={styles.subtitle}>
              Tạo tài khoản mới để bắt đầu
            </Text>
          </Section>

          {/* Register Form */}
          <Section>
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Nhập họ và tên đầy đủ"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Nhập địa chỉ email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  autoCapitalize="none"
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  placeholder="Tên đăng nhập (tùy chọn)"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
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
                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
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

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => {
                    setTermsAccepted(!termsAccepted);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                >
                  <View style={[styles.checkboxInner, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <Text style={styles.checkboxText}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  Tôi đồng ý với{' '}
                  <Text style={styles.termsLink}>điều khoản sử dụng</Text>
                  {' '}và{' '}
                  <Text style={styles.termsLink}>chính sách bảo mật</Text>
                </Text>
              </View>
              {errors.terms && (
                <Text style={styles.errorText}>{errors.terms}</Text>
              )}

              {/* Register Button */}
              <Button
                title="Đăng Ký"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
              />
            </View>
          </Section>

          {/* Login Link */}
          <Section style={styles.footer}>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Đã có tài khoản? 
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>
                  Đăng nhập ngay
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
    paddingVertical: 20,
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
    borderColor: '#f44336',
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
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#2196f3',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 30,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#2196f3',
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
    color: '#4caf50',
    fontFamily: 'monospace',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});
